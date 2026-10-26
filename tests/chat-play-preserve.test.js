import test from 'node:test';
import assert from 'node:assert/strict';
import {CLEAN} from '../js/settings.js';
import {defaultChatPlay,normalizeChatPlay} from '../js/chat-play.js';
import {createChatPlayRuntime,renderMessageModelsInPlace} from '../js/chat-play-runtime.js';
import {fitPanelMessages} from '../js/message-fit.js';

class FakeNode{constructor(messageId='',skin=''){this.dataset={messageId,skin,createdAt:'1000'};this.classList={items:new Set(['message']),contains:key=>this.classList.items.has(key),add:key=>this.classList.items.add(key)};this.parent=null}getBoundingClientRect(){return{height:50}}replaceWith(node){if(!this.parent)return;const i=this.parent.children.indexOf(this);if(i>=0){this.parent.children[i]=node;node.parent=this.parent;this.parent=null}}remove(){if(!this.parent)return;const i=this.parent.children.indexOf(this);if(i>=0)this.parent.children.splice(i,1);this.parent=null}}
class FakeRoot{constructor(){this.children=[];this.clientHeight=620;this.scrollHeight=620;this.style={paddingTop:'0px',paddingBottom:'0px'}}append(node){node.parent=this;this.children.push(node)}}
function fakeTimers(){let id=0;return{setTimeout(){return ++id},clearTimeout(){},setInterval(){return ++id},clearInterval(){}}}

test('skin swap and revert rerender all eight visible message models in place',async()=>{
 const root=new FakeRoot(),home={...structuredClone(CLEAN),channel:'qa',maxMessages:8,nameTemplate:'Home {name}: '},skins=[
  {id:'home',name:'Home',settings:home},
  {id:'target',name:'Target',settings:{...structuredClone(CLEAN),nameTemplate:'Target {name}: '}},
  {id:'spare',name:'Spare',settings:{...structuredClone(CLEAN),nameTemplate:'Spare {name}: '}}
 ],config=normalizeChatPlay({...defaultChatPlay(),enabled:true,allowedSkinIds:skins.map(s=>s.id),aliases:skins.map(s=>({skinId:s.id,names:[s.id]})),commands:{...defaultChatPlay().commands,userCooldownSeconds:0,globalCooldownSeconds:0},feedback:{banner:false,countdown:false}},skins),renderMessage=(message,settings)=>new FakeNode(message.id,settings.nameTemplate),runtime=createChatPlayRuntime({root,host:null,homeSettings:home,config,skins,document:{defaultView:{matchMedia:()=>({matches:false})}},storage:null,timers:fakeTimers(),now:()=>1000,renderMessage,applyStyle:()=>{},preview:true});
 for(let i=0;i<8;i++){const message={id:`m${i}`,username:`viewer${i}`,text:`Message ${i}`,login:`viewer${i}`};runtime.registerMessage(message);root.append(renderMessage(message,home))}
 const createdAt=root.children.map(node=>node.dataset.createdAt);assert.equal(root.children.length,8);
 const result=runtime.handleMessage({id:'command',userId:'commander',login:'commander',username:'Commander',text:'!skin target',badges:{}});assert.equal(result.accepted,true);
 await runtime.whenSkinSettled();
 assert.equal(root.children.length,8);assert.ok(root.children.every(node=>node.dataset.skin==='Target {name}: '));assert.deepEqual(root.children.map(node=>node.dataset.createdAt),createdAt);
 runtime.resume();await runtime.whenSkinSettled();assert.equal(root.children.length,8);assert.ok(root.children.every(node=>node.dataset.skin==='Home {name}: '));assert.deepEqual(root.children.map(node=>node.dataset.createdAt),createdAt);runtime.stop();
});

function frameSwapRuntime(frameHome,frameTarget,{delay=0}={}){
 const root=new FakeRoot();
 const home={...structuredClone(CLEAN),channel:'qa',maxMessages:8,messageLifetime:300,templateFrame:frameHome?'mothlight':''};
 const skins=[
  {id:'home',name:'Home',settings:home},
  {id:'guild',name:'Guild',settings:{...structuredClone(CLEAN),templateFrame:frameTarget?'mothlight':''}},
 ];
 let attached=home.templateFrame,fitRemoved=0,fitRuns=0;
 const config=normalizeChatPlay({...defaultChatPlay(),enabled:true,allowedSkinIds:['home','guild'],aliases:[{skinId:'home',names:['home']},{skinId:'guild',names:['guild']}],commands:{...defaultChatPlay().commands,userCooldownSeconds:0,globalCooldownSeconds:0},feedback:{banner:false,countdown:false}},skins);
 const runtime=createChatPlayRuntime({root,host:null,homeSettings:home,config,skins,document:{defaultView:{matchMedia:()=>({matches:false})}},storage:null,timers:fakeTimers(),now:()=>1000,renderMessage:(message,settings)=>new FakeNode(message.id,settings.templateFrame||'normal'),applyStyle:()=>{},preview:true,onSettings:async settings=>{if(delay)await new Promise(resolve=>setTimeout(resolve,delay));attached=settings.templateFrame||'';root.clientHeight=settings.templateFrame?662:620},onAfterRender:()=>{fitRuns++;const previous=globalThis.getComputedStyle;globalThis.getComputedStyle=node=>node===root?{paddingTop:attached?'75px':'0px',paddingBottom:attached?'75px':'0px',rowGap:'3px'}:{marginTop:'0px',marginBottom:'0px'};try{fitRemoved+=fitPanelMessages(root,attached?662:620)}finally{if(previous)globalThis.getComputedStyle=previous;else delete globalThis.getComputedStyle}}});
 for(let i=0;i<8;i++){const message={id:`frame-m${i}`,username:`viewer${i}`,text:`Message ${i}`,login:`viewer${i}`};runtime.registerMessage(message);root.append(new FakeNode(message.id,home.templateFrame||'normal'))}
 return{root,runtime,get attached(){return attached},get fitRemoved(){return fitRemoved},get fitRuns(){return fitRuns}};
}

for(const [label,frameHome,frameTarget] of [['frame skin to normal skin',true,false],['normal skin to frame skin',false,true]]){
 test(`${label} swap and revert keeps all eight message models`,async()=>{
  const rig=frameSwapRuntime(frameHome,frameTarget);
  assert.equal(rig.runtime.handleMessage({id:'swap',userId:'viewer',login:'viewer',text:'!skin guild',badges:{}}).accepted,true);
  await rig.runtime.whenSkinSettled();
  assert.equal(rig.root.children.length,8);
  assert.equal(rig.runtime.messageModels().length,8);
  assert.equal(rig.fitRemoved,0);
  assert.ok(rig.root.children.every(node=>node.dataset.skin===(frameTarget?'mothlight':'normal')));
  rig.runtime.resume();await rig.runtime.whenSkinSettled();
  assert.equal(rig.root.children.length,8);
  assert.equal(rig.runtime.messageModels().length,8);
  assert.equal(rig.fitRemoved,0);
  assert.ok(rig.root.children.every(node=>node.dataset.skin===(frameHome?'mothlight':'normal')));
  rig.runtime.stop();
 });
}

test('delayed frame attachment prevents rerender and fit until final layout is ready',async()=>{
 const rig=frameSwapRuntime(false,true,{delay:35});
 rig.runtime.handleMessage({id:'swap',userId:'viewer',login:'viewer',text:'!skin guild',badges:{}});
 await new Promise(resolve=>setTimeout(resolve,5));
 assert.equal(rig.attached,'','old layout remains active during the delayed attach');
 assert.equal(rig.fitRuns,0,'no fit starts before the frame attaches');
 assert.equal(rig.root.children.length,8,'old rows stay on screen while attaching');
 await rig.runtime.whenSkinSettled();
 assert.equal(rig.attached,'mothlight');
 assert.equal(rig.root.children.length,8);
 assert.equal(rig.fitRuns,1);
 assert.equal(rig.fitRemoved,0);
 rig.runtime.stop();
});

test('rerender drops only models whose configured lifetime has elapsed',()=>{
 const root=new FakeRoot(),messages=[
  {message:{id:'expired',username:'old',text:'old'},createdAt:0},
  {message:{id:'alive',username:'new',text:'new'},createdAt:4500},
 ];
 root.append(new FakeNode('expired','old-skin'));root.append(new FakeNode('alive','old-skin'));
 renderMessageModelsInPlace(root,messages,{messageLifetime:10,nameTemplate:'new skin'},(message,settings)=>new FakeNode(message.id,settings.nameTemplate),new Map(),()=>{},()=>12000,10);
 assert.deepEqual(root.children.map(node=>node.dataset.messageId),['alive']);
});

test('messages without IRC ids remain distinct through repeated skin rerenders',()=>{
 const root=new FakeRoot();
 const items=Array.from({length:6},(_,index)=>({message:{text:'Row '+index},createdAt:1000}));
 const render=message=>{const node=new FakeNode();node.textContent=message.text;return node};
 for(let pass=0;pass<3;pass++){
  renderMessageModelsInPlace(root,items,CLEAN,render,new Map(),()=>{},()=>2000);
  assert.equal(root.children.length,6);
  assert.deepEqual(root.children.map(node=>node.textContent),items.map(item=>item.message.text));
  assert.ok(items.every(item=>root.children.includes(item.row)));
 }
 items[1].deleted=true;
 renderMessageModelsInPlace(root,items,CLEAN,render,new Map(),()=>{},()=>2000);
 assert.equal(root.children.length,5);
 assert.equal(root.children.some(node=>node.textContent==='Row 1'),false);
});

test('reward cooldowns use viewer identity and configured windows; reward ids survive renames',()=>{
 const config=defaultChatPlay();
 config.enabled=true;
 config.points.enabled=true;
 config.points.globalCooldownSeconds=2;
 config.points.userCooldownSeconds=5;
 config.effects.flash.enabled=true;
 config.points.rewards=[{effect:'flash',enabled:true,title:'Original title',id:'stable-reward'}];
 const home={...structuredClone(CLEAN),hideFrames:true};
 const runtime=createChatPlayRuntime({
  root:new FakeRoot(),host:null,homeSettings:home,config,skins:[],document:{},
  storage:null,timers:fakeTimers(),applyStyle(){},preview:true
 });
 const originalNow=Date.now;
 let time=100000;
 Date.now=()=>time;
 const event=(id,user)=>({messageId:'event-'+id,redemptionId:id,userId:user,rewardId:'stable-reward',rewardTitle:'Renamed in Twitch'});
 try{
  assert.equal(runtime.handleReward(event('one','a')),true);
  time+=1000;
  assert.equal(runtime.handleReward(event('two','b')).reason,'reward-cooldown');
  time+=1100;
  assert.equal(runtime.handleReward(event('three','a')).reason,'reward-cooldown');
  assert.equal(runtime.handleReward(event('four','b')),true);
  time+=3000;
  assert.equal(runtime.handleReward(event('five','a')),true);
  time+=6000;
  assert.equal(runtime.handleReward(event('five','a')).reason,'duplicate-or-canceled');
 }finally{Date.now=originalNow;runtime.stop()}
});
