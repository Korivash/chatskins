import assert from 'node:assert/strict';
import fs from 'node:fs';
import {frameContentRect,selectFrameEntry,templateTitleModel} from '../js/frame-templates.js';
import {layoutPanel} from '../js/panel-layout.js';
import {CLEAN} from '../js/settings.js';
const entries=JSON.parse(fs.readFileSync('site-media/frames/frames.json','utf8'));
for(const viewport of [[1280,720],[1920,1080]])for(const shape of ['tall','wide']){
  const candidates=entries.filter(x=>x.kind==='chat'&&x.shape===shape);assert.ok(candidates.length);
  for(const entry of candidates){const chosen=selectFrameEntry(entries,entry.id,shape==='tall'?2/3:1.5);assert.ok(chosen);const rect=frameContentRect(...viewport,chosen,{x:.1,y:.12,w:.8,h:.76},8);assert.ok(rect.x>=0&&rect.y>=0&&rect.x+rect.width<=viewport[0]&&rect.y+rect.height<=viewport[1]);assert.ok(rect.width>0&&rect.height>0)}
}
assert.equal(templateTitleModel({channel:'korivash'}).title,'korivash');
assert.equal(templateTitleModel({channel:'korivash',templateTitle:'Luna Live'}).title,'Luna Live');
assert.equal(templateTitleModel({channel:'korivash',templateSubtitle:'ON AIR'}).subtitle,'ON AIR');
for(const [aspect,width] of [[2/3,441],[1.5,993]]){
  const vars={};const panel={dataset:{frameAspect:String(aspect)},classList:{contains:name=>name==='has-frame-template'},style:{setProperty:(name,value)=>vars[name]=value}};
  const host={clientWidth:1280,clientHeight:720,dataset:{}};
  const height=layoutPanel(host,panel,{...CLEAN,edgeInset:20,frame:CLEAN.frame},720);
  assert.ok(Math.abs(parseFloat(vars['--width'])-width)<=2,'frame panel width follows image aspect');
  assert.ok(Math.abs(parseFloat(panel.style.height)-662)<=2,'template frame uses 92% of canvas height');
  assert.ok(Math.abs(height-662)<=2,'fit limit follows the rendered template');
}
console.log('frame window placement fits tall and wide sources at 720p and 1080p');
