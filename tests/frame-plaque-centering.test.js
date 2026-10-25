import assert from 'node:assert/strict';
import fs from 'node:fs';
import {plaqueLayout} from '../js/frame-templates.js';

const entries=JSON.parse(fs.readFileSync('site-media/frames/frames.json','utf8')).filter(entry=>entry.kind==='chat');
const css=fs.readFileSync('css/skin-render.css','utf8');
assert.match(css,/\.template-plaque\{[^}]*align-items:center[^}]*justify-content:center[^}]*text-align:center/);
assert.match(css,/\.template-plaque-title-wrap,\.template-plaque-subtitle-wrap\{[^}]*display:flex[^}]*align-items:center[^}]*justify-content:center/);

for(const entry of entries){
 assert.ok(entry.plaque,`${entry.id}/${entry.shape} has a plaque or banner rect`);
 const box=plaqueLayout(entry.plaque,entry.inner);
 const targetX=entry.plaque.none?entry.inner.x+entry.inner.w/2:entry.plaque.x+entry.plaque.w/2;
 const targetY=entry.plaque.none?entry.inner.y+.01+(entry.plaque.h||.06)/2:entry.plaque.y+entry.plaque.h/2;
 const toleranceX=entry.w*.02,toleranceY=entry.h*.02;
 assert.ok(Math.abs((box.x+box.w/2-targetX)*entry.w)<=toleranceX,`${entry.id}/${entry.shape} title center is within 2% of plaque center`);
 assert.ok(Math.abs((box.y+box.h/2-targetY)*entry.h)<=toleranceY,`${entry.id}/${entry.shape} title is vertically centered in plaque`);
 if(entry.plaque.nudge){assert.ok(Math.abs(entry.plaque.nudge.x||0)<.02&&Math.abs(entry.plaque.nudge.y||0)<.02,`${entry.id}/${entry.shape} optical nudge stays subtle`)}
}
for(const id of ['bunny-princess','crowned-kittens','neon-hex']){
 const entry=entries.find(item=>item.id===id&&item.shape==='tall')||entries.find(item=>item.id===id);
 if(!entry)continue;
 const panelHeight=720*.92,panelWidth=panelHeight*entry.w/entry.h,box=plaqueLayout(entry.plaque,entry.inner);
 const plaqueCenter=(entry.plaque.x+entry.plaque.w/2)*panelWidth;
 const titleCenter=(box.x+box.w/2)*panelWidth;
 const delta=titleCenter-plaqueCenter;
 assert.ok(Math.abs(delta)<=panelWidth*.02,`${id}: actual overlay title center within 2%`);
 console.log(`${id}: plaque center ${plaqueCenter.toFixed(1)}px, title center ${titleCenter.toFixed(1)}px, offset ${delta.toFixed(1)}px at ${panelWidth.toFixed(1)}px panel width`);
}
console.log(`plaque title boxes centered for ${entries.length} frame shapes`);
