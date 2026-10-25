import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createDescribeHandler,validateDescribeReply} from '../server/describe.mjs';
import {handleApiRequest} from '../server/skin-request.mjs';
import {applyDescribeReply,describeFailureMessage} from '../js/describe-helper.js';

const catalog={skins:[{id:'clean',name:'Clean',category:'Featured',moodTags:['calm'],settings:{fontFamily:'DM Sans'}},{id:'spooky',name:'Ghost story',category:'Game styles',tags:['spooky'],settings:{templateFont:'IBM Plex Mono'}}]};
const output={skinId:'spooky',settings:{fontFamily:'IBM Plex Mono',fontSize:31,fontWeight:700,textColor:'#F0E0FF',nameColorMode:'fixed',nameColor:'#D4BDFF',backgroundColor:'#211A31',backgroundOpacity:.4,backgroundScope:'message',backgroundType:'color',frameColor:'#9A7BFF',glowColor:'#B495FF',glowStrength:.7,glowMode:'pulse',middleBackground:'color',middleColor:'#171323',middleOpacity:.55,titleText:'Ghost chat',entranceAnimation:'fade',messageBorders:false,maxMessages:8,messageLifetime:30},summary:'A spooky violet chat with large, readable type.'};
async function fixture(t,{now=()=>Date.UTC(2026,9,25),responseOutput=output,moderation={flagged:false},tokens=120,fetchOverride=null,usageSeed=null,originHost='getchatskins.com'}={}){
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'describe-test-')),keyFile=path.join(dir,'key.txt'),usageFile=path.join(dir,'usage.json');await fs.writeFile(keyFile,'secret-key-never-return');if(usageSeed)await fs.writeFile(usageFile,JSON.stringify(usageSeed));t.after(()=>fs.rm(dir,{recursive:true,force:true}));const calls=[];
 const fetchImpl=fetchOverride??(async(url,options)=>{calls.push({url,options});if(url.endsWith('/moderations'))return{ok:true,json:async()=>({results:[{flagged:moderation.flagged}],usage:{total_tokens:2}})};return{ok:true,json:async()=>({output_text:JSON.stringify(responseOutput),usage:{total_tokens:tokens}})}});
 const handler=createDescribeHandler({fetchImpl,keyFile,usageFile,catalogFile:catalog,now,originHost});return{handler,calls,usageFile,keyFile};
}
const request=(handler,{text='spooky purple, big text',ip='198.51.100.1',origin='https://getchatskins.com',current}={})=>handler({method:'POST',url:'/api/describe',remoteAddress:ip,headers:{origin,'cf-connecting-ip':ip},body:JSON.stringify({text,...(current?{current}:{})})});

test('schema validator drops unknown fields, clamps values and rejects an unknown skin',()=>{
 const safe=validateDescribeReply({...output,settings:{...output.settings,unknown:'secret',fontSize:900,fontWeight:42,glowStrength:-4,middleOpacity:3,textColor:'not-color',messageLifetime:-5,fontFamily:'Made Up Font'}},catalog.skins);
 assert.equal(safe.settings.fontSize,48);assert.equal(safe.settings.fontWeight,300);assert.equal(safe.settings.glowStrength,0);assert.equal(safe.settings.middleOpacity,1);assert.equal(safe.settings.messageLifetime,0);assert.equal(safe.settings.textColor,undefined);assert.equal(safe.settings.unknown,undefined);assert.equal(safe.settings.fontFamily,undefined);
 assert.equal(validateDescribeReply({...output,skinId:'attacker-skin'},catalog.skins),null);
});

test('API moderates input, uses strict catalog schema, returns only a validated result, and keeps the key private',async t=>{
 const f=await fixture(t);const log=[];const old=console.log;console.log=(...args)=>log.push(args.join(' '));try{const result=await request(f.handler);assert.equal(result.status,200);assert.deepEqual(result.body,{ok:true,...output});assert.equal(JSON.stringify(result.body).includes('secret-key-never-return'),false);assert.equal(log.join('\n').includes('secret-key-never-return'),false)}finally{console.log=old}
 assert.equal(f.calls.length,2);assert.equal(f.calls[0].url,'https://api.openai.com/v1/moderations');assert.equal(f.calls[1].url,'https://api.openai.com/v1/responses');assert.equal(f.calls[1].options.headers.authorization,'Bearer secret-key-never-return');const payload=JSON.parse(f.calls[1].options.body);assert.equal(payload.model,'gpt-5-mini');assert.equal(payload.max_output_tokens,700);assert.equal(payload.reasoning.effort,'low');assert.equal(payload.text.format.strict,true);assert.equal(payload.text.format.schema.additionalProperties,false);assert.deepEqual(payload.text.format.schema.properties.skinId.enum,['clean','spooky']);assert.match(payload.input[0].content[0].text,/Clean/);
 const saved=JSON.parse(await fs.readFile(f.usageFile,'utf8'));assert.equal(saved.days['2026-10-25'].tokens,122);
});

test('origin guard mirrors the request endpoint and rejects untrusted origins before OpenAI calls',async t=>{
 const f=await fixture(t);assert.equal((await request(f.handler,{origin:'https://evil.example'})).status,403);assert.equal(f.calls.length,0);
 const allowed=await f.handler({method:'POST',url:'/api/describe',remoteAddress:'::1',headers:{origin:'http://127.0.0.1:8811','x-forwarded-host':'127.0.0.1:8811'},body:JSON.stringify({text:'cozy cafe'})});assert.equal(allowed.status,200);
});

test('moderation refusal is friendly and stops before the Responses API',async t=>{
 const f=await fixture(t,{moderation:{flagged:true}});const result=await request(f.handler,{text:'unsafe text'});assert.equal(result.status,400);assert.equal(result.body.error,'moderation_refused');assert.match(result.body.message,/Please describe a stream style/);assert.equal(f.calls.length,1);
});

test('input validation rejects over 300 characters and malformed input',async t=>{
 const f=await fixture(t);assert.equal((await request(f.handler,{text:'a'.repeat(301)})).status,400);assert.equal((await f.handler({body:'[]'})).status,400);assert.equal(f.calls.length,0);
});

test('per-IP cooldown, 15-per-day and 600-total limits are enforced and persisted',async t=>{
 let time=Date.UTC(2026,9,25),f=await fixture(t,{now:()=>time});assert.equal((await request(f.handler,{ip:'203.0.113.1'})).status,200);assert.equal((await request(f.handler,{ip:'203.0.113.1'})).status,429);time+=4000;assert.equal((await request(f.handler,{ip:'203.0.113.1'})).status,200);
 const second=createDescribeHandler({fetchImpl:async(url)=>({ok:true,json:async()=>url.endsWith('/moderations')?{results:[{flagged:false}]}:{output_text:JSON.stringify(output),usage:{total_tokens:1}}}),keyFile:f.keyFile,usageFile:f.usageFile,catalogFile:catalog,now:()=>time});assert.equal((await request(second,{ip:'203.0.113.1'})).status,429,'IP cooldown and history survive handler restart');
 let totalTime=Date.UTC(2026,9,25);const seed={version:1,days:{'2026-10-25':{total:600,tokens:0,reservedTokens:0,ips:{}}}};const g=await fixture(t,{now:()=>totalTime,usageSeed:seed});assert.equal((await request(g.handler,{ip:'203.0.113.77'})).status,429,'daily global cap is shared');
 let countTime=Date.UTC(2026,9,25);const h=await fixture(t,{now:()=>countTime});for(let i=0;i<15;i++){assert.equal((await request(h.handler,{ip:'192.0.2.77'})).status,200);countTime+=4000}assert.equal((await request(h.handler,{ip:'192.0.2.77'})).status,429,'per-IP daily cap is 15');
});

test('token budget uses provider usage, persists it and blocks requests near the daily ceiling',async t=>{
 const seed={version:1,days:{'2026-10-25':{total:3,tokens:1495000,reservedTokens:0,ips:{}}}};const f=await fixture(t,{usageSeed:seed});assert.equal((await request(f.handler,{ip:'203.0.113.8'})).status,200);const saved=JSON.parse(await fs.readFile(f.usageFile,'utf8'));assert.equal(saved.days['2026-10-25'].tokens,1495122);
 const blocked=await request(f.handler,{ip:'203.0.113.9'});assert.equal(blocked.status,429);assert.match(blocked.body.message,/busy/);
});

test('OpenAI 429 and 500 responses become friendly guide fallbacks',async t=>{
 for(const status of [429,500]){const f=await fixture(t,{fetchOverride:async url=>url.endsWith('/moderations')?{ok:true,json:async()=>({results:[{flagged:false}]})}:{ok:false,status}});const result=await request(f.handler,{ip:`198.51.100.${status}`});assert.equal(result.status,status===429?429:503);assert.match(result.body.message,/Make it mine guide/);assert.match(describeFailureMessage(result.status,result.body),/Make it mine guide/)}
});

test('editor reply applies one undo step and changes the selected skin plus settings',()=>{
 let undoSteps=0,selected='',state={fontSize:20};const result=applyDescribeReply(output,{skins:catalog.skins,record:()=>undoSteps++,selectSkin:skin=>{selected=skin.id},applySettings:patch=>{state={...state,...patch}}});assert.equal(undoSteps,1);assert.equal(selected,'spooky');assert.equal(state.fontSize,31);assert.equal(state.glowAnimation,'pulse');assert.equal(result.summary,output.summary);
});

test('editor exposes the helper and its non-API guide fallback',async()=>{
 const source=await fs.readFile(new URL('../editor.html',import.meta.url),'utf8');const editor=await fs.readFile(new URL('../js/editor.js',import.meta.url),'utf8');assert.match(source,/Describe your chat/);assert.match(source,/Uses OpenAI/);assert.match(editor,/fetch\('\/api\/describe'/);assert.match(editor,/describe-guide/);assert.match(editor,/applyDescribeReply/);
});

test('shared server routes /api/describe through the same process handler',async t=>{
 const f=await fixture(t);const old=process.env.OPENAI_KEY_FILE;process.env.OPENAI_KEY_FILE=f.keyFile;try{const result=await handleApiRequest({method:'GET',url:'/api/health',headers:{},body:''});assert.equal(result.status,200);const wrong=await handleApiRequest({method:'GET',url:'/api/describe',headers:{},body:''});assert.equal(wrong.status,404)}finally{if(old===undefined)delete process.env.OPENAI_KEY_FILE;else process.env.OPENAI_KEY_FILE=old}
});
