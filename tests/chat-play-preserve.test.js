import test from 'node:test';
import assert from 'node:assert/strict';
import {CLEAN} from '../js/settings.js';
import {defaultChatPlay,normalizeChatPlay} from '../js/chat-play.js';
import {createChatPlayRuntime} from '../js/chat-play-runtime.js';

class FakeNode{constructor(messageId='',skin=''){this.dataset={messageId,skin,createdAt:'1000'};this.classList={items:new Set(['message']),contains:key=>this.classList.items.has(key),add:key=>this.classList.items.add(key)};this.parent=null}replaceWith(node){if(!this.parent)return;const i=this.parent.children.indexOf(this);if(i>=0){this.parent.children[i]=node;node.parent=this.parent;this.parent=null}}}
class FakeRoot{constructor(){this.children=[]}append(node){node.parent=this;this.children.push(node)}}
function fakeTimers(){let id=0;return{setTimeout(){return ++id},clearTimeout(){},setInterval(){return ++id},clearInterval(){}}}

test('skin swap and revert rerender all eight visible message models in place',()=>{
 const root=new FakeRoot(),home={...structuredClone(CLEAN),channel:'qa',maxMessages:8,nameTemplate:'Home {name}: '},skins=[
  {id:'home',name:'Home',settings:home},
  {id:'target',name:'Target',settings:{...structuredClone(CLEAN),nameTemplate:'Target {name}: '}},
  {id:'spare',name:'Spare',settings:{...structuredClone(CLEAN),nameTemplate:'Spare {name}: '}}
 ],config=normalizeChatPlay({...defaultChatPlay(),enabled:true,allowedSkinIds:skins.map(s=>s.id),aliases:skins.map(s=>({skinId:s.id,names:[s.id]})),commands:{...defaultChatPlay().commands,userCooldownSeconds:0,globalCooldownSeconds:0},feedback:{banner:false,countdown:false}},skins),renderMessage=(message,settings)=>new FakeNode(message.id,settings.nameTemplate),runtime=createChatPlayRuntime({root,host:null,homeSettings:home,config,skins,document:{defaultView:{matchMedia:()=>({matches:false})}},storage:null,timers:fakeTimers(),now:()=>1000,renderMessage,applyStyle:()=>{},preview:true});
 for(let i=0;i<8;i++){const message={id:`m${i}`,username:`viewer${i}`,text:`Message ${i}`,login:`viewer${i}`};runtime.registerMessage(message);root.append(renderMessage(message,home))}
 const createdAt=root.children.map(node=>node.dataset.createdAt);assert.equal(root.children.length,8);
 const result=runtime.handleMessage({id:'command',userId:'commander',login:'commander',username:'Commander',text:'!skin target',badges:{}});assert.equal(result.accepted,true);
 assert.equal(root.children.length,8);assert.ok(root.children.every(node=>node.dataset.skin==='Target {name}: '));assert.deepEqual(root.children.map(node=>node.dataset.createdAt),createdAt);
 runtime.resume();assert.equal(root.children.length,8);assert.ok(root.children.every(node=>node.dataset.skin==='Home {name}: '));assert.deepEqual(root.children.map(node=>node.dataset.createdAt),createdAt);runtime.stop();
});
