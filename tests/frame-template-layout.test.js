import assert from 'node:assert/strict';
import fs from 'node:fs';
import {frameContentRect,selectFrameEntry,templateTitleModel} from '../js/frame-templates.js';
const entries=JSON.parse(fs.readFileSync('site-media/frames/frames.json','utf8'));
for(const viewport of [[1280,720],[1920,1080]])for(const shape of ['tall','wide']){
  const candidates=entries.filter(x=>x.kind==='chat'&&x.shape===shape);assert.ok(candidates.length);
  for(const entry of candidates){const chosen=selectFrameEntry(entries,entry.id,shape==='tall'?2/3:1.5);assert.ok(chosen);const rect=frameContentRect(...viewport,chosen,{x:.1,y:.12,w:.8,h:.76},8);assert.ok(rect.x>=0&&rect.y>=0&&rect.x+rect.width<=viewport[0]&&rect.y+rect.height<=viewport[1]);assert.ok(rect.width>0&&rect.height>0)}
}
assert.equal(templateTitleModel({channel:'korivash'}).title,'korivash');
assert.equal(templateTitleModel({channel:'korivash',templateTitle:'Luna Live'}).title,'Luna Live');
assert.equal(templateTitleModel({channel:'korivash',templateSubtitle:'ON AIR'}).subtitle,'ON AIR');
console.log('frame window placement fits tall and wide sources at 720p and 1080p');
