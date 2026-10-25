import assert from 'node:assert/strict';
import fs from 'node:fs';
import {panelMaxHeight} from '../js/fit.js';
import {layoutPanel} from '../js/panel-layout.js';
import {previewCanvasSize,marketingPreviewTransform} from '../js/skin-preview.js';
import {frameContentRect,selectFrameEntry} from '../js/frame-templates.js';
const skins=JSON.parse(fs.readFileSync('design/skins.json','utf8')).skins.filter(s=>s.frameTemplate);
const entries=JSON.parse(fs.readFileSync('site-media/frames/frames.json','utf8')).filter(e=>e.kind==='chat');
const editor=fs.readFileSync('js/editor.js','utf8');
const skinsPage=fs.readFileSync('js/skins-page.js','utf8');
const readme=fs.readFileSync('js/readme.js','utf8');
function previewPanel(skin,entry){
 const settings=skin.settings,aspect=entry.w/entry.h,canvasSize=previewCanvasSize(skin);
 const styleValues=new Map(),panelStyle={setProperty:(key,value)=>styleValues.set(key,value),height:'',maxHeight:''},panel={classList:{contains:name=>name==='has-frame-template'},dataset:{frameAspect:String(aspect)},style:panelStyle};
 const source={clientWidth:canvasSize.width,clientHeight:canvasSize.height,dataset:{}};layoutPanel(source,panel,settings,canvasSize.height);
 let width=parseFloat(styleValues.get('--width')),height=parseFloat(panelStyle.height);
 const content=frameContentRect(width,height,entry,entry.inner,Math.max(2,width*.02));
 const x=settings.edgeInset||20,y=canvasSize.height-(settings.edgeInset||20)-height,scale=Math.min(270/canvasSize.width,150/canvasSize.height);
 const windowRect={left:(x+content.x)*scale,top:(y+content.y)*scale,right:(x+content.x+content.width)*scale,bottom:(y+content.y+content.height)*scale};
 const rowHeight=24,spacing=settings.messageSpacing||4,count=3;
 const total=count*rowHeight+(count-1)*spacing;
 const rows=Array.from({length:count},(_,i)=>{const top=content.y+content.height-total+i*(rowHeight+spacing);return{left:(x+content.x)*scale,top:(y+top)*scale,right:(x+content.x+content.width)*scale,bottom:(y+top+rowHeight)*scale}});
 return{windowRect,rows};
}
for(const skin of skins){
 const shape=skin.frameShape||'tall',aspect={tall:2/3,wide:1.5,square:1,webcam:16/9}[shape]||2/3;
 const entry=selectFrameEntry(entries,skin.frameTemplate,aspect,'chat');assert(entry,`${skin.name}: manifest frame entry`);
 const{windowRect,rows}=previewPanel(skin,entry);
 for(const[rowIndex,row]of rows.entries())assert(row.left>=windowRect.left-1&&row.top>=windowRect.top-1&&row.right<=windowRect.right+1&&row.bottom<=windowRect.bottom+1,`${skin.name} sample message ${rowIndex+1} remains inside the preview frame window`);
}
const neon=entries.find(entry=>entry.id==='neon-kawaii-goth'&&entry.shape==='tall');
assert.ok(neon.inner.x>=.275,'Neon Kawaii Goth tall window clears the hanging chain column');
const neonSkin=skins.find(skin=>skin.frameTemplate==='neon-kawaii-goth');
const neonGeometry=previewPanel(neonSkin,neon);
assert.ok(neonGeometry.rows.every(row=>row.left>=neonGeometry.windowRect.left-1),'Neon Kawaii Goth message rows stay clear of the chain-side frame edge');
for(const [width,height] of [[1440,900],[390,844]]){
 const panel={left:400,top:60,width:480,height:660};
 const fit=marketingPreviewTransform(width,height,1280,720,panel);
 assert.ok(Math.abs((fit.left+(panel.left+panel.width/2)*fit.scale)-width/2)<.01,`README preview panel centered at ${width}px`);
 assert.ok(Math.abs(fit.top+(panel.top+panel.height/2)*fit.scale-height/2)<.01,`README preview panel centered vertically at ${width}px`);
 assert.ok(panel.height*fit.scale<=height*.8+.01,`README preview panel fits at ${width}px`);
}
assert.match(editor,/await Promise\.all\(\[frameReady,illustrationReady\]\)/,'editor waits for artwork before adding sample messages');
assert.match(editor,/class="source"|\.source/,'editor preview uses the overlay source canvas');
assert.match(skinsPage,/preview-virtual-stage/,'skins cards and monitor use the virtual canvas');
assert.match(skinsPage,/layoutPanel\(canvas,chat,previewSettings,canvasSize\.height\)/,'skins preview panel uses the overlay layout');
assert.match(readme,/preview-virtual-stage/,'readme previews use the virtual canvas');
assert.match(readme,/layoutPanel\(canvas,chat,settings,canvasSize\.height\)/,'readme preview panel uses the overlay layout');
assert.match(readme,/marketingPreviewTransform\(host\.clientWidth,host\.clientHeight/,'README preview scales and centers the panel rather than the whole canvas');
