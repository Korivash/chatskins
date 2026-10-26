import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {CLEAN} from '../js/settings.js';
import {isDreamArtRequest} from '../js/dream-client.js';
import {loadDreamReview} from '../js/dream-review.js';

test('Describe requests create art only when the words ask for an illustration',()=>{
 assert.equal(isDreamArtRequest('spooky purple frame with a ghost'),true);
 assert.equal(isDreamArtRequest('add a cat on top and some vines'),true);
 assert.equal(isDreamArtRequest('bigger text and less glow'),false);
});

test('the non-frame chat preview starts wide and readable',()=>{
 assert.ok(CLEAN.overlayWidth>=380,'1280-wide canvas leaves at least 380 px for a normal chat panel');
 assert.equal(CLEAN.fontSize,18,'the default source font is 18 px at 1080p');
 assert.ok(CLEAN.lineHeight>=1.45);assert.ok(CLEAN.messageSpacing>=10);
 const message='SpeedrunSam: THIS DUNGEON LOOKS INCREDIBLE';
 const estimatedWidth=[...message].length*18*.53;
 const innerWidth=CLEAN.overlayWidth-CLEAN.paddingX*2;
 assert.ok(Math.ceil(estimatedWidth/innerWidth)<=2,'Signature sample should fit in at most two average-width lines');
});

test('Chat controls are accessible toggle rows grouped by purpose',async()=>{
 const html=await readFile(resolve('editor.html'),'utf8');
 for(const id of ['quick-hide-commands','quick-hide-bots','quick-hide-links','quick-reduce-motion']){
  const tag=html.match(new RegExp(`<input[^>]*id="${id}"[^>]*>`))?.[0]||'';
  assert.match(tag,/role="switch"/,`${id} has switch semantics`);assert.match(tag,/aria-label=/,`${id} has an accessible name`);
 }
 assert.match(html,/<h3>What shows<\/h3>/);assert.match(html,/<h3>Motion<\/h3>/);
 const css=await readFile(resolve('css/editor-options.css'),'utf8');assert.match(css,/\.setting-toggle-row/);assert.match(css,/input\[type=checkbox\]\[role=switch\]/);
});

test('the guide uses simple formatting and never inserts model strings as HTML',async()=>{
 const source=await readFile(resolve('js/ask-chatskins.js'),'utf8');
 assert.match(source,/formatAssistantText/);assert.match(source,/textContent/);assert.doesNotMatch(source,/innerHTML\s*=/);
 assert.match(source,/create_design/);assert.doesNotMatch(source,/add a ghost image yourself/i);
 const css=await readFile(resolve('css/ask-chatskins.css'),'utf8');assert.match(css,/width: min\(420px/);assert.match(css,/\.ask-panel \{[^}]*width: 100%/s);
});

test('skins page offers the same new-design flow',async()=>{
 const html=await readFile(resolve('skins.html'),'utf8'),script=await readFile(resolve('js/dream-entry.js'),'utf8');
 assert.match(html,/skins-dream-form/);assert.match(html,/js\/dream-entry\.js/);assert.match(script,/requestDream/);assert.match(script,/chat-studio\.dream\.pending\.v1/);
});

test('private review keys are sent only in the POST body and cleared from the visible fragment',async()=>{
 let requestBody='',visible='';const key='review-secret';
 const dream=await loadDreamReview(`#dream=${'a'.repeat(24)}&k=${key}`,{location:{pathname:'/editor.html',search:'?from=review'},history:{replaceState(_a,_b,url){visible=url}},fetcher:async(_url,options)=>{requestBody=options.body;return{ok:true,json:async()=>({ok:true,design:{instances:[{part:19}]},settings:{},name:'Ghost Garden'})}}});
 assert.ok(dream);assert.match(requestBody,/review-secret/);assert.equal(visible,'/editor.html?from=review');assert.doesNotMatch(visible,/review-secret/);
});
