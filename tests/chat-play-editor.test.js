import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { initChatPlayEditor } from '../js/chat-play-editor.js';

class FakeElement {
  constructor(tag='div') { this.tagName=tag.toUpperCase(); this.children=[]; this.dataset={}; this.attributes={}; this.classList={add(){}}; this.value=''; this.textContent=''; }
  append(...nodes) { for(const node of nodes)node.parent=this;this.children.push(...nodes); }
  prepend(...nodes) { for(const node of nodes)node.parent=this;this.children.unshift(...nodes); }
  replaceChildren(...nodes) { this.children=[...nodes]; }
  setAttribute(key,value) { this.attributes[key]=value; }
  focus(options) { this.focusOptions=options; }
  scrollIntoView(options) { this.scrollOptions=options; }
  querySelectorAll() { return []; }
  walk() { return [this,...this.children.flatMap(child=>child?.walk?.()||[])]; }
}
class FakeDocument {
  constructor() { this.root=new FakeElement(); }
  createElement(tag) { return new FakeElement(tag); }
  querySelector(selector) { return selector==='#chat-play-section'?this.root:null; }
}

const doc=new FakeDocument(), calls=[],pointCalls=[];
const editor=initChatPlayEditor({document:doc,storage:{getItem(){return null},setItem(){}},skins:[{id:'guild-chat',name:'Guild Chat'},{id:'crystal-realm',name:'Crystal Realm'}],connectChannelPoints:async create=>{pointCalls.push(create);return{redirecting:true}},onPreviewCommand:(...args)=>{calls.push(['command',...args]);return{accepted:true}},onPreviewEffect:(...args)=>{calls.push(['effect',...args]);return true}});
const buttons=doc.root.walk().filter(el=>el.tagName==='BUTTON');
for(const label of ['Simulate !skin <name>','Start a !skinvote','Test Emote rain','Test Frame flash','Test Spotlight','Test Chaos mode','Panic: freeze skin']) assert.ok(buttons.some(button=>button.textContent===label),`missing ${label}`);
for(const label of ['Simulate !skin <name>','Start a !skinvote']) buttons.find(button=>button.textContent===label).onclick();
for(const label of ['Test Emote rain','Test Frame flash','Test Spotlight','Test Chaos mode']) buttons.find(button=>button.textContent===label).onclick();
assert.equal(calls.filter(call=>call[0]==='command').length,2);
assert.equal(calls.filter(call=>call[0]==='effect').length,4);
assert.equal(editor.getConfig().enabled,false);
assert.ok(buttons.some(button=>button.textContent==='Connect channel points + create rewards'));
assert.ok(buttons.some(button=>button.textContent==='Connect without creating rewards'));
assert.ok(buttons.some(button=>button.textContent==='Copy private play link'));
await buttons.find(button=>button.textContent==='Connect channel points + create rewards').onclick();
await buttons.find(button=>button.textContent==='Connect without creating rewards').onclick();
assert.deepEqual(pointCalls,[true,false]);
const rewardPlan=doc.root.walk().find(el=>el.className==='chat-play-reward-plan');
assert.match(rewardPlan.walk().map(el=>el.textContent).join(' '),/ChatSkins: Swap skin.*500 points/);
assert.match(rewardPlan.walk().map(el=>el.textContent).join(' '),/ChatSkins: Emote rain.*250 points/);
const disabledOption=doc.root.walk().find(el=>el.id==='chat-play-rewards-disabled');
assert.equal(disabledOption.checked,false);
disabledOption.checked=true;disabledOption.onchange();
assert.equal(editor.getConfig().points.createDisabled,true);
assert.equal(editor.getRewardsDisabled(),true);
const privateStep=doc.root.walk().find(el=>el.className==='chat-play-link-step');
assert.equal(privateStep.hidden,true);
editor.focusPrivateLink();
assert.equal(privateStep.hidden,false);
assert.equal(privateStep.parent?.open,true);
assert.deepEqual(doc.root.walk().find(el=>el.id==='chat-play-copy-link').focusOptions,{preventScroll:true});
editor.stop();

// Guard the exact strict-mode assignment pattern that previously stopped mounting.
const source=await readFile(new URL('../js/chat-play-editor.js',import.meta.url),'utf8');
assert.match(source,/const allowedHead=[^;]*allowedCount=node/);
assert.doesNotMatch(source,/allowedHead\.append\([^;]*,\s*allowedCount\s*=/,'allowedCount must be declared before use, not assigned in append()');
console.log('chat-play-editor.test.js passed');
