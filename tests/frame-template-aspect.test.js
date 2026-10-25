import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chooseFrameEntry,frameContentRect} from '../js/frame-templates.js';
import {layoutPanel} from '../js/panel-layout.js';

const skins=JSON.parse(fs.readFileSync('design/skins.json','utf8')).skins.filter(skin=>skin.frameTemplate);
const entries=JSON.parse(fs.readFileSync('site-media/frames/frames.json','utf8'));
for(const skin of skins){
 const available=entries.filter(entry=>entry.id===skin.frameTemplate&&entry.kind==='chat');
 for(const requested of available){
  for(const [viewportWidth,viewportHeight] of [[1280,720],[1920,1080]]){
   const target=skin.settings.templateAspect||requested.w/requested.h;
   const entry=chooseFrameEntry(entries,skin.frameTemplate,{shape:skin.frameShape,targetAspect:target});
   assert.ok(entry,`${skin.name}: matching frame entry`);
   assert.equal(entry.shape,requested.shape,`${skin.name}: target selects ${requested.shape} artwork`);
   const panel={classList:{contains:name=>name==='has-frame-template'},dataset:{frameAspect:String(entry.w/entry.h)},style:{values:{},setProperty(name,value){this.values[name]=value},getPropertyValue(name){return this.values[name]||''},width:'',height:'',maxHeight:''}};
   const host={clientWidth:viewportWidth,clientHeight:viewportHeight,dataset:{}};
   layoutPanel(host,panel,skin.settings,viewportHeight);
   const width=parseFloat(panel.style.width),height=parseFloat(panel.style.height),ratio=entry.w/entry.h;
   assert.ok(Math.abs(width/height/ratio-1)<=.01,`${skin.name}/${entry.shape} at ${viewportWidth}x${viewportHeight}: panel aspect matches selected art`);
   assert.equal(panel.style.aspectRatio,String(ratio));
   const window=frameContentRect(width,height,entry,entry.inner,Math.max(2,width*.02));
   const rowHeight=Math.min(32,window.height/8),gap=Math.min(3,(window.height-rowHeight*8)/7),total=rowHeight*8+gap*7;
   assert.ok(total<=window.height+1,`${skin.name}: eight sample rows fit the selected window`);
   const rows=Array.from({length:8},(_,i)=>({left:window.x,top:window.y+window.height-total+i*(rowHeight+gap),right:window.x+window.width,bottom:window.y+window.height-total+i*(rowHeight+gap)+rowHeight}));
   for(const [index,row] of rows.entries())assert.ok(row.left>=window.x-1&&row.top>=window.y-1&&row.right<=window.x+window.width+1&&row.bottom<=window.y+window.height+1,`${skin.name} ${entry.shape} row ${index+1} stays inside image window`);
  }
 }
}
const template=fs.readFileSync('js/frame-templates.js','utf8'),css=fs.readFileSync('css/skin-render.css','utf8');
assert.match(template,/root\.dataset\.frameAspect=String\(exactAspect\)/);
assert.match(template,/root\._frameEntry=entry/);
assert.match(css,/\.template-frame-art\{[^}]*object-fit:fill/);
console.log(`frame panel aspect and inner-window geometry verified for ${skins.length} skins at both canvases`);
