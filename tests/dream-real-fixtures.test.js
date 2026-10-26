import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {completeDreamDesign,readDreamParts,validateDreamReply} from '../server/dream.mjs';

const fixtureFiles=[
 ['spooky','tests/fixtures/dream-real-spooky.json'],
 ['cafe','tests/fixtures/dream-real-cafe.json']
];

test('captured real model designs validate and complete against the shipped parts library',async()=>{
 const parts=await readDreamParts(resolve('site-media/parts/parts.json'));
 const partIds=parts.map(part=>part.id);
 for(const [label,file] of fixtureFiles){
  const captured=JSON.parse(await readFile(resolve(file),'utf8'));
  const valid=validateDreamReply(captured,{partIds,name:'ChannelPal'});
  assert.ok(valid,`${label} fixture should validate`);
  assert.ok(valid.design.instances.some(part=>part.part===19),`${label} keeps its chat window`);
  assert.ok(valid.design.instances.length>1,`${label} has usable decorative parts`);
  const completed=completeDreamDesign(valid.design,{text:label==='spooky'?'spooky purple frame with a cute ghost and bats':'cozy cafe with a coffee cup',parts});
  assert.ok(completed.instances.some(part=>part.part===19),`${label} can be completed`);
  assert.ok(completed.instances.length<=25,`${label} stays within the Studio part limit`);
 }
});
