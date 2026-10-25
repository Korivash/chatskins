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
console.log(`plaque title boxes centered for ${entries.length} frame shapes`);
