import assert from 'node:assert/strict';
import fs from 'node:fs';
import {isDreamArtRequest} from '../js/dream-client.js';
import {isDesignArtRequest} from '../server/assistant.mjs';
import {CLEAN,normalizeSettings} from '../js/settings.js';
import {dreamPaintControlState,selectDreamParts,selectPaintedDream} from '../js/dream-client.js';
import {frameTemplateId,syncFrameTemplateTitle,templateTitleModel} from '../js/frame-templates.js';
import {fitPanelMessages} from '../js/message-fit.js';
import {createMessage} from '../js/render.js';
import {alertPreviewTarget} from '../js/alerts-editor.js';
import {blankStudio,createStudioHistory,makeStudioKit} from '../js/frame-studio.js';

const artRequests=[
  'make me a cozy autumn frame with leaves and a coffee cup',
  'spooky neon frame with bats and skulls',
  'pastel bunny border',
  'create a ghost overlay with sparkles',
  'put vines around my chat',
  'design a frame with a coffee cup and moon',
  'add a crown and flowers to my border'
];
const settingRequests=['make the text bigger','turn on channel points'];

for(const prompt of artRequests){
  assert.equal(isDreamArtRequest(prompt),true,`${prompt} should use painted design generation`);
  assert.equal(isDesignArtRequest(prompt),true,`${prompt} uses the same server routing rule`);
}
for(const prompt of settingRequests){
  assert.equal(isDreamArtRequest(prompt),false,`${prompt} should remain a settings request`);
  assert.equal(isDesignArtRequest(prompt),false,`${prompt} should not be routed as artwork`);
}

const dreamId='d'.repeat(24);
const placeholder={name:'Ghost Garden',version:1,catalog:19,board:[600,680],motion:true,palette:['#6633AA'],instances:[{uid:'window',part:19,x:10,y:10,w:80,h:80,angle:0,flipX:false,flipY:false,colors:[0,0,0]}]};
const catalogState={...CLEAN,templateFrame:'mothlight',studioDesign:placeholder};
const painted=selectPaintedDream(catalogState,dreamId);
assert.equal(painted.templateFrame,'','a new painting clears the catalog frame selection');
assert.equal(painted.studioDesign,null);
assert.equal(frameTemplateId(painted,{frameTemplate:'mothlight'}),`dream-${dreamId}`,'painted art wins over catalog skin metadata');
const parts=selectDreamParts(painted,placeholder);
assert.equal(parts.templateFrame,'');
assert.deepEqual(parts.studioDesign,placeholder,'the parts version remains the same Studio composition');
assert.equal(frameTemplateId(parts,{frameTemplate:'mothlight'}),'','a parts placeholder does not reveal the old catalog art');
assert.equal(frameTemplateId(selectPaintedDream({...CLEAN},dreamId),null),`dream-${dreamId}`,'a painting also works from the default skin');

const controlOption={id:dreamId,designName:placeholder.name,available:true};
assert.equal(dreamPaintControlState(parts,controlOption).label,'Use painted frame');
assert.equal(dreamPaintControlState(painted,controlOption).label,'Use parts version instead');
assert.equal(dreamPaintControlState(CLEAN,controlOption).hidden,true,'undoing to the pre-design state hides stale paint controls');
assert.equal(dreamPaintControlState(painted,controlOption).status,'The painted frame is selected.');
assert.equal(templateTitleModel({...painted,channel:'ChannelPal'}).title,'ChannelPal');
const titleNode={textContent:''},subtitleNode={textContent:''},plaque={querySelector:selector=>selector.includes('subtitle')?subtitleNode:titleNode},frameRoot={querySelector:()=>plaque};
assert.equal(syncFrameTemplateTitle(frameRoot,{channel:'NewChannel',templateSubtitle:'LIVE CHAT'}),true);
assert.equal(titleNode.textContent,'NewChannel','typing a channel refreshes the existing plaque without fetching art');

const css=fs.readFileSync('css/skin-render.css','utf8');
assert.match(css,/\.chat\.has-frame-template>\.chat-surface\{display:none!important\}/,'template artwork is not covered by the generic opaque surface');
assert.match(css,/\.template-message-window\{[^}]*overflow:hidden/,'frame rows are clipped to the measured inner window');
assert.match(css,/\.template-message-window\{[^}]*justify-content:flex-end/,'frame rows anchor to the bottom of the inner window');
assert.match(css,/\.template-message-window>\.message \.message-body\{[^}]*text-shadow:0 1px 2px #000c/,'transparent windows get a readable text shadow');

class FakeNode{
 constructor(tag,text=''){
  this.tagName=tag;
  this.nodeType=tag==='#text'?3:1;
  this.text=String(text);
  this.childNodes=[];
  this.dataset={};
  this.attributes={};
  this.style={setProperty(){},getPropertyValue(){return''}};
  this.classes=new Set();
  this.classList={add:(...names)=>names.forEach(name=>this.classes.add(name)),contains:name=>this.classes.has(name)};
  this.namespaceURI='http://www.w3.org/2000/svg';
 }
 append(...nodes){this.childNodes.push(...nodes)}
 prepend(...nodes){this.childNodes.unshift(...nodes)}
 querySelector(){return null}
 closest(){return null}
 setAttribute(key,value){this.attributes[key]=String(value)}
 get textContent(){return this.nodeType===3?this.text:this.text+this.childNodes.map(node=>node.textContent).join('')}
 set textContent(value){this.text=String(value);this.childNodes=[]}
}
const previousDocument=globalThis.document;
globalThis.document={
 createElement:tag=>new FakeNode(tag),
 createElementNS:(namespace,tag)=>{const node=new FakeNode(tag);node.namespaceURI=namespace;return node},
 createTextNode:text=>new FakeNode('#text',text)
};
try{
 const plainFrameSettings={...CLEAN,templateFrame:'',dreamPaintId:dreamId,templateTextColor:'#F2F0EE',parts:{...CLEAN.parts,messageText:{...CLEAN.parts.messageText,shadow:{...CLEAN.parts.messageText.shadow,enabled:false}}}};
 const paintedSettings=normalizeSettings(plainFrameSettings);
 const row=createMessage({username:'Moss',text:'The autumn frame is lovely.',badges:{}},paintedSettings);
 const body=row.childNodes.find(node=>String(node.className||'').includes('message-body'));
 assert.equal(row.dataset.templateStyle,'painted-frame','message renderer uses frame-template styles without a catalog skin');
 assert.equal(body.style.color,'#F2F0EE','painted default-skin messages use the readable template text color');
 assert.match(body.style.textShadow,/0px 1px 2px #000000E6/,'painted text receives the automatic readable dark edge');
}finally{
 if(previousDocument)globalThis.document=previousDocument;
 else delete globalThis.document;
}

const previousGetComputedStyle=globalThis.getComputedStyle;
for(const settings of [CLEAN,{...CLEAN,templateFrame:'mothlight'}]){
  const maxHeight=400,rows=[];
  const panel={
    clientHeight:maxHeight,
    children:rows,
    append(row){rows.push(row)},
    getBoundingClientRect(){return{top:0,bottom:maxHeight}}
  };
  for(let index=0;index<8;index++){
    const row={
      id:index,
      offsetHeight:50,
      classList:{contains:name=>name==='message'},
      remove(){rows.splice(rows.indexOf(this),1)}
    };
    panel.append(row);
  }
  globalThis.getComputedStyle=node=>node===panel
    ?{paddingTop:'25px',paddingBottom:'25px',rowGap:'4px'}
    :{marginTop:'0px',marginBottom:'0px'};
  fitPanelMessages(panel,maxHeight);
  assert.ok(rows.length>=5,'the frame window preserves at least five sample rows');
  let cursor=maxHeight-25;
  for(const row of [...rows].reverse()){
    const bottom=cursor;
    const top=bottom-row.offsetHeight;
    assert.ok(top>=25&&bottom<=375,'each message remains fully inside the frame inner window');
    cursor=top-4;
  }
}
if(previousGetComputedStyle)globalThis.getComputedStyle=previousGetComputedStyle;
else delete globalThis.getComputedStyle;

const mainStage={children:[],querySelector(){return null},append(layer){this.children.push(layer)}};
const newLayer={classList:{add(name){this.name=name}},dataset:{}};
const chosenLayer=alertPreviewTarget({asTest:true,mainStage,previewStage:null,createLayer:()=>newLayer});
assert.equal(chosenLayer,newLayer,'local Test it alerts use the visible main preview stage');
assert.deepEqual(mainStage.children,[newLayer]);

const history=createStudioHistory();
history.record(blankStudio());
assert.equal(history.canUndo,true,'using a Studio kit creates an Undo step');
const kit=makeStudioKit('Spooky');
assert.ok(kit.instances.length>1);

console.log('painted-frame routing, selection, row fit, preview alert targeting and Studio undo verified');
