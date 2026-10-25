import assert from 'node:assert/strict';
import fs from 'node:fs';
import {afterFrameTemplateReady} from '../js/frame-templates.js';
import {layoutPanel} from '../js/panel-layout.js';
import {fitPanelMessages} from '../js/message-fit.js';
import {buildOverlayTestModel} from '../js/overlay-test-messages.js';

const catalog=JSON.parse(fs.readFileSync('design/skins.json','utf8')).skins;
const skin=catalog.find(item=>item.id==='frame-mothlight');
assert.ok(skin);
const settings=structuredClone(skin.settings);
const host={clientHeight:720,clientWidth:1280,dataset:{}};
const panel={
  classList:{contains:name=>name==='has-frame-template',add(){},remove(){}},
  dataset:{frameAspect:String(2/3)},style:{values:{},setProperty(k,v){this.values[k]=v},getPropertyValue(k){return this.values[k]||''}},
  children:[],clientHeight:0,scrollHeight:0,
};

// Template layout is established up front, before async frame metadata arrives.
const initialCap=layoutPanel(host,panel,settings,720);
assert.ok(initialCap>650&&initialCap<670,`template starts at 92% canvas height (${initialCap})`);
assert.ok(Number.parseFloat(panel.style.height)>650);

const messages=buildOverlayTestModel(settings);
assert.ok(messages.length>=8);
let attached=false,fitRemoved=-1;
const originalGetComputedStyle=globalThis.getComputedStyle;
globalThis.getComputedStyle=node=>node===panel
  ?{paddingTop:'75px',paddingBottom:'75px',rowGap:'3px'}
  :{marginTop:'0px',marginBottom:'0px'};
try{
  await afterFrameTemplateReady(
    ()=>new Promise(resolve=>setTimeout(()=>{attached=true;resolve({entry:{w:760,h:1140}})},20)),
    frame=>{
      assert.ok(attached,'initialization waits for the delayed template attach');
      assert.ok(frame);
      panel.clientHeight=662;
      panel.scrollHeight=662;
      panel.children=messages.map(message=>({
        classList:{contains:name=>name==='message'},
        getBoundingClientRect:()=>({height:48}),
        remove(){const index=panel.children.indexOf(this);if(index>=0)panel.children.splice(index,1)},
      }));
      fitRemoved=fitPanelMessages(panel,662);
      return panel.children.length;
    },
  ).then(count=>assert.equal(count,messages.length));
}finally{
  if(originalGetComputedStyle)globalThis.getComputedStyle=originalGetComputedStyle;
  else delete globalThis.getComputedStyle;
}
assert.equal(fitRemoved,0,'all Test Chat messages fit after delayed attachment');
const overlaySource=fs.readFileSync('js/overlay.js','utf8');
assert.ok(overlaySource.indexOf('await afterFrameTemplateReady')<overlaySource.indexOf('if(testMode){for(const message of buildOverlayTestModel'), 'overlay inserts Test Chat after awaited frame startup');
const editorSource=fs.readFileSync('js/editor.js','utf8');
assert.match(editorSource,/await Promise\.all\(\[frameReady,illustrationReady\]\)/,'editor waits for frame attachment before preview rows are added');
const skinsSource=fs.readFileSync('js/skins-page.js','utf8');
assert.match(skinsSource,/attachFrameTemplate\(chat,previewSettings,\{skin,shape:skin\.frameShape\|\|'tall',manifest:window\.__frameEntries,layout\}/,'skin previews pass their virtual-stage layout to the frame renderer');
assert.match(skinsSource,/layoutPanel\(canvas,chat,previewSettings,canvasSize\.height\)/,'skin preview canvas uses overlay panel geometry');
console.log(`delayed template attach precedes first fit; ${messages.length} frame messages remain`);
