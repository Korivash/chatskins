import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {buildAssistantKnowledge,createAssistantHandler,validateAssistantAction,ASSISTANT_CONTROLS} from '../server/assistant.mjs';
import {mountAskChat,TOURS,STARTER_PROMPTS,canRunAssistantAction,containsPrivateDetails,assistantLauncherOffset} from '../js/ask-chatskins.js';

const message=(content='How do I add my chat to OBS?')=>JSON.stringify({messages:[{role:'user',content}],page:'editor',state:{tab:'look',hasChannel:true,access_token:'must-not-leak'}});
async function fixture(t,{fetchImpl,now=()=>Date.UTC(2026,9,25),originHost='getchatskins.com',contentDir=resolve('docs/content')}={}){const dir=await mkdtemp(join(tmpdir(),'chatskins-assistant-')),keyFile=join(dir,'openai-key.txt'),usageFile=join(dir,'usage.json');await writeFile(keyFile,'private-test-key','utf8');const handler=createAssistantHandler({fetchImpl,now,originHost,keyFile,usageFile,contentDir});t.after(()=>rm(dir,{recursive:true,force:true}));return{dir,keyFile,usageFile,handler}}
function fakeOpenAI({flagged=false,output=[],tokens=20}={}){const calls=[];return{calls,fetchImpl:async(url,options)=>{calls.push({url,options});if(url.endsWith('/moderations'))return{ok:true,json:async()=>({results:[{flagged}],usage:{total_tokens:2}})};return{ok:true,json:async()=>({output,usage:{total_tokens:tokens}})}}}}

test('knowledge pack includes headings and text from the documentation pages',async()=>{const knowledge=await buildAssistantKnowledge(resolve('docs/content'));assert.match(knowledge,/## Getting started \(getting-started\)/);assert.match(knowledge,/Browser Source/);assert.match(knowledge,/## Frames \(frames\)/)});
test('documentation symbols remain UTF-8 through the knowledge pack and JSON reply',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'chatskins-utf8-')),symbols='Arrow → times × dash — dot ·';
 await writeFile(join(dir,'symbols.md'),`# Symbols\n\n${symbols}\n`,'utf8');t.after(()=>rm(dir,{recursive:true,force:true}));
 assert.ok((await buildAssistantKnowledge(dir)).includes(symbols));
 const mock=fakeOpenAI({output:[{type:'message',content:[{type:'output_text',text:symbols}]}]});
 const fx=await fixture(t,{fetchImpl:mock.fetchImpl,contentDir:dir});const response=await fx.handler({headers:{origin:'https://getchatskins.com'},body:message()});
 assert.equal(response.headers['content-type'],'application/json; charset=utf-8');assert.equal(JSON.parse(JSON.stringify(response.body)).reply,symbols);
});
test('tool actions are whitelist validated and appearance values use describe validation',async()=>{
 const catalog=JSON.parse(await readFile(resolve('design/skins.json'),'utf8')).skins,docs=['frames'];
 const style=validateAssistantAction({name:'apply_style',arguments:JSON.stringify({skinId:catalog[0].id,settings:{fontSize:99,textColor:'#abcdef',script:'bad'}})},{catalog,docSlugs:docs});assert.equal(style.settings.fontSize,48);assert.equal(style.settings.textColor,'#ABCDEF');assert.equal('script'in style.settings,false);
 assert.equal(validateAssistantAction({name:'launch_shell',arguments:'{}'},{catalog,docSlugs:docs}),null);assert.equal(validateAssistantAction({name:'highlight',arguments:'{"control":"delete account"}'},{catalog,docSlugs:docs}),null);assert.equal(validateAssistantAction({name:'open_doc',arguments:'{"slug":"missing"}'},{catalog,docSlugs:docs}),null);assert.ok(ASSISTANT_CONTROLS.includes('Place it'));
});
test('tool calls receive a useful follow-up answer and never use generic fallback copy',async t=>{
 const catalog=JSON.parse(await readFile(resolve('design/skins.json'),'utf8')).skins;
 const calls=[],firstOutput=[
  {type:'reasoning',id:'rs_test',summary:[]},
  {type:'function_call',call_id:'style-1',name:'apply_style',arguments:JSON.stringify({skinId:catalog[0].id,settings:{fontSize:27,textColor:'#abcdef',unknown:'drop'}})},
  {type:'function_call',call_id:'tab-1',name:'open_tab',arguments:'{"tab":"getlink"}'},
  {type:'function_call',call_id:'highlight-1',name:'highlight',arguments:'{"control":"Get my OBS link"}'},
  {type:'function_call',call_id:'tour-1',name:'start_walkthrough',arguments:'{"id":"obs-setup"}'}
 ];
 const fetchImpl=async(url,options)=>{calls.push({url,options});if(url.endsWith('/moderations'))return{ok:true,json:async()=>({results:[{flagged:false}],usage:{total_tokens:2}})};const responseNumber=calls.filter(call=>call.url.endsWith('/responses')).length;return{ok:true,json:async()=>responseNumber===1?{id:'resp-tools',output:firstOutput,usage:{total_tokens:15}}:{output:[{type:'message',content:[{type:'output_text',text:'To add chat to OBS: 1. Choose a skin. 2. Open Get link and copy your URL. 3. Add a Browser Source, paste the complete link, and set 1280 × 720. I opened Get link, highlighted the button, and started the OBS guide.'}]}],usage:{total_tokens:25}}}};
 const fx=await fixture(t,{fetchImpl});const response=await fx.handler({headers:{origin:'https://getchatskins.com'},body:message('Make my chat pink and bigger. How do I add it to OBS?')});
 const requests=calls.filter(call=>call.url.endsWith('/responses')).map(call=>JSON.parse(call.options.body)),request=requests[0];
 assert.equal(request.tool_choice,'auto');assert.equal(request.store,true);assert.ok(request.tools.length>=5);assert.ok(request.tools.every(tool=>tool.strict===true));
 assert.match(request.input[0].content[0].text,/When the user wants a change, call apply_style/);
 assert.equal(requests.length,2);assert.equal(requests[1].previous_response_id,'resp-tools');assert.equal(requests[1].tool_choice,'none');assert.equal(requests[1].input.length,4);assert.ok(requests[1].input.every(item=>item.type==='function_call_output'));
 assert.equal(response.status,200);assert.match(response.body.reply,/1\. Choose a skin.*3\. Add a Browser Source/s);assert.doesNotMatch(response.body.reply,/I can do that\. Here is the change/);
 assert.equal(response.body.actions[0].type,'apply_style');assert.equal(response.body.actions[0].settings.textColor,'#ABCDEF');assert.equal('unknown'in response.body.actions[0].settings,false);
 assert.deepEqual(response.body.actions.slice(1),[{type:'open_tab',tab:'getlink'},{type:'highlight',control:'Get my OBS link'},{type:'start_walkthrough',id:'obs-setup'}]);
 const usage=JSON.parse(await readFile(fx.usageFile,'utf8'));assert.equal(usage.days['2026-10-25'].tokens,42,'moderation and both Responses calls count toward the shared daily budget');
});
test('moderation, origin, off-topic refusal and key secrecy are enforced',async t=>{
 const mock=fakeOpenAI({output:[{type:'message',content:[{type:'output_text',text:'Use the Docs to add a Browser Source.'}]}]});const {handler}=await fixture(t,{fetchImpl:mock.fetchImpl});
 const badOrigin=await handler({headers:{origin:'https://evil.example'},body:message()});assert.equal(badOrigin.status,403);assert.equal(mock.calls.length,0);
 const offTopic=await handler({headers:{origin:'https://getchatskins.com'},body:JSON.stringify({messages:[{role:'user',content:'Write a poem about Mars.'}],page:'home'})});assert.equal(offTopic.status,200);assert.match(offTopic.body.reply,/ChatSkins/);assert.equal(mock.calls.length,0);
 const ok=await handler({headers:{origin:'https://getchatskins.com'},body:message()});assert.equal(ok.status,200);const serialized=JSON.stringify(ok);assert.doesNotMatch(serialized,/private-test-key|must-not-leak/);assert.equal(mock.calls.length,2);assert.equal(mock.calls[0].url,'https://api.openai.com/v1/moderations');assert.doesNotMatch(mock.calls[0].options.body,/must-not-leak/);
 const flagged=fakeOpenAI({flagged:true}),refuse=await fixture(t,{fetchImpl:flagged.fetchImpl});const response=await refuse.handler({headers:{origin:'https://getchatskins.com'},body:message()});assert.equal(response.status,400);assert.equal(response.body.error,'moderation_refused');assert.equal(flagged.calls.length,1);
});
test('assistant per-IP cooldown, daily count and shared token budget persist',async t=>{
 const mock=fakeOpenAI({output:[{type:'message',content:[{type:'output_text',text:'Try the OBS setup guide.'}]}]});let time=Date.UTC(2026,9,25),fx=await fixture(t,{fetchImpl:mock.fetchImpl,now:()=>time});
 const call=()=>fx.handler({headers:{origin:'https://getchatskins.com'},remoteAddress:'203.0.113.8',body:message()});assert.equal((await call()).status,200);assert.equal((await call()).status,429);time+=3001;const stored=JSON.parse(await readFile(fx.usageFile,'utf8'));assert.equal(stored.days['2026-10-25'].tokens,22);assert.equal(stored.days['2026-10-25'].assistant.total,1);
 const budget=await fixture(t,{fetchImpl:mock.fetchImpl,now:()=>time});await writeFile(budget.usageFile,JSON.stringify({version:1,days:{'2026-10-25':{tokens:1500000,reservedTokens:0,total:0,ips:{}}}}));assert.equal((await budget.handler({headers:{origin:'https://getchatskins.com'},body:message()})).status,429);
 const global=await fixture(t,{fetchImpl:mock.fetchImpl,now:()=>time});await writeFile(global.usageFile,JSON.stringify({version:1,days:{'2026-10-25':{tokens:0,reservedTokens:0,total:0,ips:{},assistant:{total:2000,ips:{}}}}}));assert.equal((await global.handler({headers:{origin:'https://getchatskins.com'},body:message()})).status,429);
 const count=await fixture(t,{fetchImpl:mock.fetchImpl,now:(()=>{let n=time;return()=>n+=3001})()});let final;for(let i=0;i<41;i++)final=await count.handler({headers:{origin:'https://getchatskins.com'},remoteAddress:'198.51.100.2',body:message()});assert.equal(final.status,429);assert.equal(final.body.error,'rate_limited');
});
test('sensitive details are rejected before moderation or the model',async t=>{const mock=fakeOpenAI(),fx=await fixture(t,{fetchImpl:mock.fetchImpl});const result=await fx.handler({headers:{origin:'https://getchatskins.com'},body:message('My password=secret123, can you help with OBS?')});assert.equal(result.body.error,'private_info');assert.equal(mock.calls.length,0)});
test('the browser catches private values before adding them to session history',()=>{assert.equal(containsPrivateDetails('access_token=abc123'),true);assert.equal(containsPrivateDetails('someone@example.com'),true);assert.equal(containsPrivateDetails('How do I add my chat to OBS?'),false)});

class FakeElement{
 constructor(tag){this.tagName=tag;this.children=[];this.attrs={};this.dataset={};this.style={};this.listeners={};this.hidden=false;this.value='';this.className='';this.classList={add:name=>{this.className+=` ${name}`},remove:name=>{this.className=this.className.replace(name,'')},contains:name=>this.className.includes(name)};this.scrollTop=0;this.scrollHeight=0}
 append(...nodes){for(const node of nodes){node.parentElement=this;this.children.push(node)}}replaceChildren(...nodes){this.children=[];this.append(...nodes)}setAttribute(k,v){this.attrs[k]=String(v)}getAttribute(k){return this.attrs[k]}addEventListener(k,fn){(this.listeners[k]||=[]).push(fn)}dispatchEvent(event){this.dispatched=event;return true}click(){for(const fn of this.listeners.click||[])fn({target:this,preventDefault(){}})}focus(){this.ownerDocument.activeElement=this}scrollIntoView(){}querySelectorAll(selector=''){const all=this.children.flatMap(child=>[child,...child.querySelectorAll()]);if(!selector)return all;return all.filter(node=>(selector.includes('button')&&node.tagName==='button'&&!node.disabled)||(selector.includes('textarea')&&node.tagName==='textarea'&&!node.disabled)||(selector.includes('a[href]')&&node.tagName==='a'&&node.attrs.href)||(selector.includes('summary')&&node.tagName==='summary')||(selector.includes('[tabindex="0"]')&&node.attrs.tabindex==='0'))}querySelector(selector){return this.ownerDocument.querySelector(selector)}remove(){this.parentElement?.children.splice(this.parentElement.children.indexOf(this),1)}
}
class FakeDocument{
 constructor(){this.body=new FakeElement('body');this.body.ownerDocument=this;this.nodes=new Map();this.listeners={};this.activeElement=null}createElement(tag){const node=new FakeElement(tag);node.ownerDocument=this;return node}querySelector(selector){return this.nodes.get(selector)||null}addEventListener(k,fn){(this.listeners[k]||=[]).push(fn)}dispatchEvent(event){this.dispatched=event;return true}
}
test('walkthroughs are static and start without any API request',()=>{assert.equal(Object.keys(TOURS).length,5);for(const tour of Object.values(TOURS))assert.ok(tour.steps.length>=3);assert.equal(STARTER_PROMPTS.length,4);const doc=new FakeDocument(),location={pathname:'/editor.html',href:'https://getchatskins.com/editor.html'},storage={getItem:()=>null,setItem(){},removeItem(){}};let fetches=0;const ui=mountAskChat(doc,{fetcher:()=>{fetches++},storage,location});ui.startTour('obs-setup');assert.equal(fetches,0);assert.equal(ui.panel.hidden,false);assert.equal(doc.body.children.some(x=>x.className==='ask-tour-card'),true)});
test('API errors reveal the static FAQ and tour choices',async()=>{const doc=new FakeDocument(),storage={getItem:()=>null,setItem(){},removeItem(){}},ui=mountAskChat(doc,{storage,location:{pathname:'/editor.html',href:'https://getchatskins.com/editor.html'},fetcher:async()=>({ok:false,status:429,json:async()=>({message:'Please try again soon.'})})});await ui.send('How do I add this chat to OBS?');const fallback=ui.panel.querySelectorAll().find(node=>node.className==='ask-fallback');assert.equal(fallback.hidden,false);assert.match(ui.log.children.at(-1).children[0].textContent,/Please try again soon/);assert.ok(ui.panel.querySelectorAll().some(node=>node.className==='ask-tours'))});
test('the guide validates and executes all returned UI action kinds',async()=>{
 const doc=new FakeDocument(),location={pathname:'/editor.html',href:'https://getchatskins.com/editor.html'},storage={getItem:()=>null,setItem(){},removeItem(){}};for(const id of ['options-tab-look','options-tab-style','get-link','place-toggle']){const target=new FakeElement('button');target.ownerDocument=doc;target.click=()=>{target.clicked=true};target.scrollIntoView=()=>{};doc.nodes.set('#'+id,target)}const ui=mountAskChat(doc,{storage,location,fetcher:async()=>{throw Error('not used')}});
 const actions=[{type:'apply_style',settings:{fontSize:28}},{type:'open_tab',tab:'style'},{type:'highlight',control:'Get my OBS link'},{type:'start_walkthrough',id:'frames'},{type:'open_doc',slug:'frames'}];for(const action of actions){assert.ok(canRunAssistantAction(action));await ui.execute(action)}assert.equal(doc.dispatched.detail.type,'apply_style','style action is sent to the editor');assert.ok(doc.nodes.get('#options-tab-style').clicked,'tab action activates the editor tab');assert.ok(doc.nodes.get('#get-link').classList.contains('ask-target-highlight'),'highlight action marks its control');assert.equal(ui.panel.hidden,false);assert.equal(location.href,'https://getchatskins.com/docs/#/page/frames');assert.ok(ui.log.children.length>=4)
});
test('panel markup exposes dialog semantics, labeled input, close/clear and keyboard focus trapping',async()=>{
 let removed=false;const doc=new FakeDocument(),storage={getItem:()=>null,setItem(){},removeItem(){removed=true}},ui=mountAskChat(doc,{storage,location:{pathname:'/',href:'https://getchatskins.com/'},fetcher:async()=>{}});assert.equal(ui.panel.getAttribute('role'),'dialog');assert.equal(ui.panel.getAttribute('aria-modal'),'true');const textarea=ui.panel.querySelectorAll().find(node=>node.tagName==='textarea');assert.equal(textarea.getAttribute('aria-label'),'Ask a ChatSkins setup question');const close=ui.panel.querySelectorAll().find(node=>node.className==='ask-close');assert.ok(close);const clear=ui.panel.querySelectorAll().find(node=>node.className==='ask-clear');assert.ok(clear);assert.ok((doc.listeners.keydown||[]).length>0);assert.ok(ui.panel.querySelectorAll().filter(node=>node.tagName==='button').length>=10);ui.panel.hidden=false;const tabbables=ui.panel.querySelectorAll().filter(node=>node.tagName==='button'||node.tagName==='textarea');doc.activeElement=clear;let prevented=false;doc.listeners.keydown[0]({key:'Tab',shiftKey:true,preventDefault(){prevented=true}});assert.equal(prevented,true,`Shift+Tab at first (active=${doc.activeElement?.className}, clear=${clear.className})`);assert.equal(doc.activeElement,tabbables.at(-1),'focus moves to the final item');ui.clear();assert.equal(removed,true);assert.equal(ui.log.children.length,0)
});
test('launcher assets are present on every public site and docs page',async()=>{for(const file of ['index.html','skins.html','editor.html','request.html','readme.html','docs/index.html']){const html=await readFile(resolve(file),'utf8');assert.match(html,/ask-chatskins\.css/,file);assert.match(html,/ask-chatskins\.js/,file)}});
test('help launcher clears the sticky editor bar at desktop and mobile sizes',()=>{
 for(const [width,height,dockHeight] of [[1440,900,76],[390,844,124]]){
  const bottomOffset=assistantLauncherOffset(dockHeight),launcherBottom=height-bottomOffset;
  const dockTop=height-dockHeight;assert.ok(launcherBottom<=dockTop-12,`${width}px launcher clears the bar with a 12px gap`);
 }
 assert.equal(assistantLauncherOffset(0),22);
});

test('create_design is a validated assistant action and runs the design endpoint',async()=>{
 const {validateAssistantAction}=await import('../server/assistant.mjs');
 const valid=validateAssistantAction({name:'create_design',arguments:'{"prompt":"spooky purple frame with a ghost"}'});
 assert.deepEqual(valid,{type:'create_design',prompt:'spooky purple frame with a ghost'});
 assert.equal(validateAssistantAction({name:'create_design',arguments:JSON.stringify({prompt:'x'.repeat(301)})}),null);
 const doc=new FakeDocument(),location={pathname:'/editor.html',href:'https://getchatskins.com/editor.html'},storage={getItem:()=>null,setItem(){},removeItem(){}};
 const look=new FakeElement('button'),studio=new FakeElement('button');look.ownerDocument=studio.ownerDocument=doc;studio.click=()=>{studio.clicked=true};doc.nodes.set('#options-tab-look',look);doc.nodes.set('#options-tab-studio',studio);
 const dream={id:'a'.repeat(24),key:'private-owner-key',name:'Ghost Garden',imageStatus:'off',design:{instances:[{part:19}]}};let requested='';
 const ui=mountAskChat(doc,{storage,location,fetcher:async(url,options)=>{requested=url;assert.equal(JSON.parse(options.body).text,'spooky purple frame with a ghost');return{ok:true,json:async()=>({ok:true,...dream})}}});
 await ui.execute(valid);
 assert.equal(requested,'/api/dream');assert.equal(studio.clicked,true);assert.equal(doc.dispatched.type,'chatskins:dream-generated');assert.equal(doc.dispatched.detail.dream.name,'Ghost Garden');
});

test('guide system requests original art and returns a useful design action',async t=>{
 const calls=[],first={id:'dream-response',output:[{type:'reasoning',id:'rs_dream',summary:[]},{type:'function_call',call_id:'design-1',name:'create_design',arguments:'{"prompt":"spooky purple frame with a ghost"}'}],usage:{total_tokens:7}};
 const fetchImpl=async(url,options)=>{calls.push({url,options});if(url.endsWith('/moderations'))return{ok:true,json:async()=>({results:[{flagged:false}],usage:{total_tokens:1}})};const count=calls.filter(item=>item.url.endsWith('/responses')).length;return{ok:true,json:async()=>count===1?first:{output:[{type:'message',content:[{type:'output_text',text:'I made a spooky purple frame with a ghost and opened it in Studio. You can adjust the parts, then copy your OBS link.'}]}],usage:{total_tokens:8}}}};
 const fx=await fixture(t,{fetchImpl}),response=await fx.handler({headers:{origin:'https://getchatskins.com'},body:message('Make me a spooky purple frame with a ghost')});
 const firstRequest=JSON.parse(calls.find(item=>item.url.endsWith('/responses')).options.body);
 assert.match(firstRequest.input[0].content[0].text,/When the user wants new art.*call create_design/s);
 assert.ok(firstRequest.tools.some(tool=>tool.name==='create_design'&&tool.strict===true));
 assert.equal(response.status,200);assert.equal(response.body.actions[0].type,'create_design');assert.match(response.body.reply,/opened it in Studio/);assert.doesNotMatch(response.body.reply,/add (?:a|the) ghost (?:image|art)/i);
});

test('assistant rejects requests without browser origin evidence',async t=>{
 const mock=fakeOpenAI(),fx=await fixture(t,{fetchImpl:mock.fetchImpl});
 assert.equal((await fx.handler({headers:{},body:message()})).status,403);
 assert.equal(mock.calls.length,0);
});
