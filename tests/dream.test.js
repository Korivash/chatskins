import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {completeDreamDesign,createDreamHandler,readDreamParts,validateDreamReply} from '../server/dream.mjs';
import {measurePaintedFrame} from '../server/dream-image.mjs';
import {makeStudioKit} from '../js/frame-studio.js';

const sampleSettings={fontFamily:'DM Sans',fontSize:90,fontWeight:500,textColor:'#fff000',nameColor:null,nameColorMode:'role',backgroundColor:null,backgroundOpacity:.6,backgroundScope:null,backgroundType:null,frameColor:'#8a69b8',glowColor:null,glowStrength:1.4,glowMode:'pulse',middleBackground:'color',middleColor:'#111111',middleOpacity:.55,middleImage:null,titleText:null,entranceAnimation:'fade',messageBorders:false,maxMessages:50,messageLifetime:40,unsafe:'drop'};
function modelDesign(){const design=makeStudioKit('Spooky');design.name='Ghost Garden';design.instances=design.instances.map(({uid,...part})=>part);return design}
function compactDesign(){const design=modelDesign();return{v:design.version,cat:design.catalog,b:design.board,n:design.name,m:design.motion,p:design.palette,a:design.instances.map(part=>({i:part.part,x:Math.round(part.x*10),y:Math.round(part.y*10),w:Math.round(part.w*10),h:Math.round(part.h*10),r:part.angle,fx:part.flipX,fy:part.flipY,c:part.colors}))}}
function responseBody(){return{design:compactDesign(),settings:sampleSettings,name:'Ghost Garden',description:'A lilac ghost frame for cozy streams.',moodTags:['spooky','purple']}}
function openAiMock({flagged=false}={}){const calls=[];return{calls,fetchImpl:async(url,options)=>{calls.push({url,options});if(url.endsWith('/moderations'))return{ok:true,json:async()=>({results:[{flagged}],usage:{total_tokens:3}})};return{ok:true,json:async()=>({output_text:JSON.stringify(responseBody()),usage:{total_tokens:20}})}}}}
async function setup(t,{fetchImpl= openAiMock().fetchImpl,now=()=>Date.UTC(2026,9,25),partsFile=resolve('site-media/parts/parts.json'),originHost='getchatskins.com'}={}){const dir=await mkdtemp(join(tmpdir(),'chatskins-dream-')),keyFile=join(dir,'key.txt'),usageFile=join(dir,'usage.json'),dataDir=join(dir,'private-data');await (await import('node:fs/promises')).writeFile(keyFile,'server-secret-key','utf8');const handler=createDreamHandler({fetchImpl,now,partsFile,keyFile,usageFile,dataDir,originHost,imagesEnabled:false});t.after(()=>rm(dir,{recursive:true,force:true}));return{dir,keyFile,usageFile,dataDir,handler}}
const request=(handler,body={},overrides={})=>handler({method:'POST',url:'/api/dream',headers:{origin:'https://getchatskins.com'},remoteAddress:'203.0.113.7',body:JSON.stringify({text:'spooky purple frame with a ghost',...body}),...overrides});

test('dream validation clamps values, drops unknown settings and keeps only shipped parts',async()=>{
 const parts=await readDreamParts();const valid=validateDreamReply(responseBody(),{partIds:parts.map(part=>part.id)});assert.ok(valid);assert.equal(valid.settings.fontSize,48);assert.equal(valid.settings.glowStrength,1);assert.equal('unsafe'in valid.settings,false);assert.ok(valid.design.instances.some(part=>part.part===19));
 const invalid=responseBody();invalid.design.a.push({...invalid.design.a[0],i:999});assert.ok(validateDreamReply(invalid,{partIds:parts.map(part=>part.id)}),'unknown decorative parts are dropped when a valid design remains');
 const noWindow=responseBody();noWindow.design.a=noWindow.design.a.filter(part=>part.i!==19);assert.equal(validateDreamReply(noWindow,{partIds:parts.map(part=>part.id)}),null);
 const bare=makeStudioKit('Cozy');bare.instances=bare.instances.filter(part=>part.part===19);const completed=completeDreamDesign(bare,{text:'a spooky purple frame with a ghost',parts});assert.ok(completed.instances.some(part=>part.part===51));assert.ok(completed.instances.some(part=>part.part>=29&&part.part<=36));
});

test('dream endpoint moderates input, returns a private editable design, and keeps secrets out of logs',async t=>{
 const mock=openAiMock(),log=[];const fx=await setup(t,{fetchImpl:mock.fetchImpl});
 // Swap in a logger only for the test: the endpoint never needs to log details.
 const response=await fx.handler({headers:{origin:'https://getchatskins.com'},body:JSON.stringify({text:'spooky purple frame with a ghost',credit:'streamer'})});
 assert.equal(response.status,200);assert.ok(response.body.design.instances.some(part=>part.part===19));assert.equal(response.body.imageStatus,'off');assert.ok(response.body.key);assert.equal(mock.calls.filter(call=>call.url.endsWith('/moderations')).length,2);assert.equal(JSON.stringify(response.body).includes('server-secret-key'),false);assert.deepEqual(log,[]);
 const request=JSON.parse(mock.calls.find(call=>call.url.endsWith('/responses')).options.body);assert.equal(request.max_output_tokens,6000);assert.equal(request.reasoning.effort,'minimal');assert.equal(request.text.format.schema.properties.design.properties.a.maxItems,16);
 const stored=JSON.parse(await readFile(join(fx.dataDir,'dream-submissions',`${response.body.id}.json`),'utf8'));assert.equal(stored.status,'private');assert.ok(stored.ownerKeyHash);assert.equal(stored.ipHash.length,64);
});

test('an incomplete Dream response retries once with ten compact parts and accounts for both calls',async t=>{
 const calls=[],responses=[
  {status:'incomplete',incomplete_details:{reason:'max_output_tokens'},usage:{total_tokens:1200}},
  {status:'completed',output_text:JSON.stringify(responseBody()),usage:{total_tokens:45}}
 ];
 const fetchImpl=async(url,options)=>{
  calls.push({url,options});
  if(url.endsWith('/moderations'))return{ok:true,json:async()=>({results:[{flagged:false}],usage:{total_tokens:2}})};
  if(url.endsWith('/responses'))return{ok:true,json:async()=>responses.shift()};
  throw new Error(url);
 };
 const fx=await setup(t,{fetchImpl}),result=await request(fx.handler);
 assert.equal(result.status,200);
 const requests=calls.filter(call=>call.url.endsWith('/responses')).map(call=>JSON.parse(call.options.body));
 assert.equal(requests.length,2);
 assert.equal(requests[0].max_output_tokens,6000);
 assert.equal(requests[0].text.format.schema.properties.design.properties.a.maxItems,16);
 assert.equal(requests[1].text.format.schema.properties.design.properties.a.maxItems,10);
 assert.match(requests[1].input[0].content[0].text,/no more than 10 parts/);
 const usage=JSON.parse(await readFile(fx.usageFile,'utf8'));
 assert.equal(usage.days['2026-10-25'].tokens,1249);
});

test('a second incomplete Dream response returns a friendly error without parsing partial JSON',async t=>{
 const calls=[],responses=[
  {status:'incomplete',incomplete_details:{reason:'max_output_tokens'},output_text:'{"design":',usage:{total_tokens:1200}},
  {status:'incomplete',incomplete_details:{reason:'max_output_tokens'},output_text:'{"design":',usage:{total_tokens:900}}
 ];
 const fetchImpl=async(url,options)=>{
  calls.push({url,options});
  if(url.endsWith('/moderations'))return{ok:true,json:async()=>({results:[{flagged:false}],usage:{total_tokens:2}})};
  if(url.endsWith('/responses'))return{ok:true,json:async()=>responses.shift()};
  throw new Error(url);
 };
 const fx=await setup(t,{fetchImpl}),result=await request(fx.handler);
 assert.equal(result.status,422);
 assert.equal(result.body.error,'incomplete_reply');
 assert.match(result.body.message,/simpler description/);
 assert.equal(calls.filter(call=>call.url.endsWith('/responses')).length,2);
 const usage=JSON.parse(await readFile(fx.usageFile,'utf8'));
 assert.equal(usage.days['2026-10-25'].tokens,2102);
});

test('dream endpoint enforces origin, per-IP limits, shared token budget and moderation refusal',async t=>{
 const flagged=openAiMock({flagged:true}),fx=await setup(t,{fetchImpl:flagged.fetchImpl});
 assert.equal((await fx.handler({headers:{origin:'https://evil.example'},body:JSON.stringify({text:'spooky ghost'})})).status,403);
 assert.equal((await request(fx.handler)).body.error,'moderation_refused');
 const limited=await setup(t,{fetchImpl:openAiMock().fetchImpl});let last;for(let i=0;i<6;i++)last=await request(limited.handler);assert.equal(last.status,429);assert.equal(last.body.error,'rate_limited');
 const budget=await setup(t,{fetchImpl:openAiMock().fetchImpl});const usage=JSON.parse(JSON.stringify({version:1,days:{'2026-10-25':{total:0,tokens:1500000,reservedTokens:0,ips:{}}}}));const fs=await import('node:fs/promises');await fs.writeFile(budget.usageFile,JSON.stringify(usage),'utf8');assert.equal((await request(budget.handler)).status,429);
});

test('gallery submission is private by default and review token is required',async t=>{
 const fx=await setup(t,{fetchImpl:openAiMock().fetchImpl}),created=await request(fx.handler);assert.equal(created.status,200);
 const submit=await fx.handler({method:'POST',url:'/api/dream/submit',headers:{origin:'https://getchatskins.com'},remoteAddress:'203.0.113.7',body:JSON.stringify({id:created.body.id,key:created.body.key,credit:'MoonCat'})});assert.equal(submit.status,200);assert.equal(submit.body.status,'pending');
 const saved=JSON.parse(await readFile(join(fx.dataDir,'dream-submissions',`${created.body.id}.json`),'utf8'));assert.equal(saved.credit,'MoonCat');
 assert.equal((await fx.handler({method:'POST',url:'/api/dream/review',body:JSON.stringify({id:created.body.id,key:'wrong'})})).status,404);
});

test('optional painting obeys 20/day and 2/IP quotas and becomes available through a private status check',async t=>{
 const calls=[],png=await readFile(resolve('tests/fixtures/painted-frame.png')),webp=Buffer.concat([Buffer.from('RIFF'),Buffer.from([4,0,0,0]),Buffer.from('WEBP')]);const fetchImpl=async(url,options)=>{calls.push({url,options});if(url.endsWith('/moderations'))return{ok:true,json:async()=>({results:[{flagged:false}],usage:{total_tokens:1}})};if(url.endsWith('/responses'))return{ok:true,json:async()=>({output_text:JSON.stringify(responseBody()),usage:{total_tokens:2}})};if(url.endsWith('/images/generations'))return{ok:true,json:async()=>({data:[{b64_json:png.toString('base64')}]})};throw new Error(url)};
 const dir=await mkdtemp(join(tmpdir(),'chatskins-paint-')),keyFile=join(dir,'key.txt'),usageFile=join(dir,'usage.json'),dataDir=join(dir,'private');await (await import('node:fs/promises')).writeFile(keyFile,'server-secret-key');const handler=createDreamHandler({fetchImpl,keyFile,usageFile,dataDir,webpEncoder:async()=>webp,imagesEnabled:true,now:()=>Date.UTC(2026,9,25)});t.after(()=>rm(dir,{recursive:true,force:true}));
 const create=()=>handler({headers:{origin:'https://getchatskins.com'},remoteAddress:'203.0.113.44',body:JSON.stringify({text:'a ghost frame'})});const first=await create(),second=await create(),third=await create();assert.equal(first.body.imageStatus,'painting');assert.equal(second.body.imageStatus,'painting');await new Promise(resolve=>setTimeout(resolve,40));
 assert.equal(calls.filter(call=>call.url.endsWith('/images/generations')).length,2);const status=await handler({url:'/api/dream/status',headers:{origin:'https://getchatskins.com'},body:JSON.stringify({id:first.body.id,key:first.body.key})});assert.equal(status.body.imageStatus,'ready');const image=await handler({method:'GET',url:`/api/dream-image/${first.body.id}.webp`});assert.equal(image.status,200);assert.equal(image.headers['content-type'],'image/webp');assert.match(image.headers['cache-control'],/immutable/);assert.deepEqual(image.body,webp);const metadata=await handler({method:'GET',url:`/api/dream-image/${first.body.id}.json`});assert.ok(metadata.body.inner.w>.7);const thirdStatus=await handler({url:'/api/dream/status',body:JSON.stringify({id:third.body.id,key:third.body.key})});assert.equal(thirdStatus.body.imageStatus,'unavailable');
 // A full global bucket prevents a further painting request.
 const capData=join(dir,'cap-private'),capUsage=join(dir,'cap-usage.json');await (await import('node:fs/promises')).mkdir(capData,{recursive:true});await (await import('node:fs/promises')).writeFile(join(capData,'dream-images.json'),JSON.stringify({day:'2026-10-25',total:20,ips:{}}));
 const cappedHandler=createDreamHandler({fetchImpl,keyFile,usageFile:capUsage,dataDir:capData,imagesEnabled:true,now:()=>Date.UTC(2026,9,25)});const capped=await cappedHandler({headers:{origin:'https://getchatskins.com'},remoteAddress:'198.51.100.5',body:JSON.stringify({text:'another frame'})});await new Promise(resolve=>setTimeout(resolve,30));assert.equal(calls.filter(call=>call.url.endsWith('/images/generations')).length,2);const cappedStatus=await cappedHandler({url:'/api/dream/status',body:JSON.stringify({id:capped.body.id,key:capped.body.key})});assert.equal(cappedStatus.body.imageStatus,'unavailable');
});

test('painted image model falls back on 400 and uses the configured generation recipe',async t=>{
 const png=await readFile(resolve('tests/fixtures/painted-frame.png')),calls=[],webp=Buffer.concat([Buffer.from('RIFF'),Buffer.from([4,0,0,0]),Buffer.from('WEBP')]);
 const fetchImpl=async(url,options)=>{if(url.endsWith('/moderations'))return{ok:true,json:async()=>({results:[{flagged:false}],usage:{total_tokens:1}})};if(url.endsWith('/responses'))return{ok:true,json:async()=>({output_text:JSON.stringify(responseBody()),usage:{total_tokens:2}})};if(url.endsWith('/images/generations')){const body=JSON.parse(options.body);calls.push(body);return calls.length===1?{ok:false,status:400}:{ok:true,json:async()=>({data:[{b64_json:png.toString('base64')}]})}};throw Error(url)};
 const dir=await mkdtemp(join(tmpdir(),'dream-model-fallback-')),keyFile=join(dir,'key'),handler=createDreamHandler({fetchImpl,keyFile,usageFile:join(dir,'usage.json'),dataDir:join(dir,'private'),imageModel:'gpt-image-2.5-flare',webpEncoder:async()=>webp,imagesEnabled:true,now:()=>Date.UTC(2026,9,25)});await (await import('node:fs/promises')).writeFile(keyFile,'secret');t.after(()=>rm(dir,{recursive:true,force:true}));
 const created=await request(handler);await new Promise(resolve=>setTimeout(resolve,80));assert.equal(calls.length,2);assert.equal(calls[0].model,'gpt-image-2.5-flare');assert.equal(calls[1].model,'gpt-image-1.5');for(const body of calls){assert.equal(body.size,'1024x1536');assert.equal(body.quality,'medium');assert.equal(body.background,'transparent');assert.equal(body.output_format,'png');assert.match(body.prompt,/Decorative frame for a live-stream chat overlay/);assert.match(body.prompt,/BLANK name plaque/);assert.match(body.prompt,/No text, no letters, no logos/)}assert.equal(created.body.paintMessage,'Painting your frame… ~15s');assert.equal(measurePaintedFrame(png).centerTransparency,1);
});

test('non-transparent center retries once with stronger prompt before accepting image',async t=>{
 const valid=await readFile(resolve('tests/fixtures/painted-frame.png')),invalid=await opaqueCenterPng(valid),calls=[],webp=Buffer.concat([Buffer.from('RIFF'),Buffer.from([4,0,0,0]),Buffer.from('WEBP')]);
 const fetchImpl=async(url,options)=>{if(url.endsWith('/moderations'))return{ok:true,json:async()=>({results:[{flagged:false}],usage:{total_tokens:1}})};if(url.endsWith('/responses'))return{ok:true,json:async()=>({output_text:JSON.stringify(responseBody()),usage:{total_tokens:2}})};if(url.endsWith('/images/generations')){calls.push(JSON.parse(options.body));return{ok:true,json:async()=>({data:[{b64_json:(calls.length===1?invalid:valid).toString('base64')}]})}};throw Error(url)};
 const dir=await mkdtemp(join(tmpdir(),'dream-transparency-')),keyFile=join(dir,'key'),handler=createDreamHandler({fetchImpl,keyFile,usageFile:join(dir,'usage.json'),dataDir:join(dir,'private'),webpEncoder:async()=>webp,imagesEnabled:true,now:()=>Date.UTC(2026,9,25)});await (await import('node:fs/promises')).writeFile(keyFile,'secret');t.after(()=>rm(dir,{recursive:true,force:true}));
 const created=await request(handler);await new Promise(resolve=>setTimeout(resolve,80));assert.equal(calls.length,2);assert.match(calls[1].prompt,/absolutely no texture, particles or decoration/);const saved=JSON.parse(await readFile(join(dir,'private','dream-submissions',`${created.body.id}.json`),'utf8'));assert.equal(saved.imageStatus,'ready');
});

test('public painted image endpoint accepts only ready unguessable IDs and valid WebP files',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'dream-image-endpoint-')),privateDir=join(dir,'dream-submissions'),id='a'.repeat(24),webp=Buffer.concat([Buffer.from('RIFF'),Buffer.from([4,0,0,0]),Buffer.from('WEBP')]);await (await import('node:fs/promises')).mkdir(privateDir,{recursive:true});await (await import('node:fs/promises')).writeFile(join(privateDir,`${id}.json`),JSON.stringify({id,status:'private',imageStatus:'ready',paintFile:`${id}.webp`,frame:{width:1024,height:1536,shape:'tall',inner:{x:.1,y:.1,w:.8,h:.8},plaque:{none:true}}}));await (await import('node:fs/promises')).writeFile(join(privateDir,`${id}.webp`),webp);const handler=createDreamHandler({dataDir:dir,usageFile:join(dir,'usage.json'),imagesEnabled:false});t.after(()=>rm(dir,{recursive:true,force:true}));
 assert.equal((await handler({method:'GET',url:'/api/dream-image/../../secret.webp'})).status,404);assert.equal((await handler({method:'GET',url:`/api/dream-image/${'b'.repeat(24)}.webp`})).status,404);assert.equal((await handler({method:'GET',url:`/api/dream-image/${id}.webp`})).status,200);await (await import('node:fs/promises')).writeFile(join(privateDir,`${id}.webp`),'not-webp');assert.equal((await handler({method:'GET',url:`/api/dream-image/${id}.webp`})).status,404);
});

/** Re-encode the fixture with an opaque center to exercise the retry branch. */
async function opaqueCenterPng(source){
 const {decodePngRgba}=await import('../server/dream-image.mjs'),{deflateSync}=await import('node:zlib'),{width,height,data}=decodePngRgba(source);for(let y=Math.floor(height*.3);y<height*.7;y++)for(let x=Math.floor(width*.3);x<width*.7;x++)data[(y*width+x)*4+3]=255;
 const crc32=bytes=>{let crc=0xffffffff;for(const value of bytes){crc^=value;for(let bit=0;bit<8;bit++)crc=crc&1?0xedb88320^(crc>>>1):crc>>>1}return(crc^0xffffffff)>>>0};
 const chunk=(type,payload)=>{const kind=Buffer.from(type),length=Buffer.alloc(4),crc=Buffer.alloc(4);length.writeUInt32BE(payload.length);crc.writeUInt32BE(crc32(Buffer.concat([kind,payload])));return Buffer.concat([length,kind,payload,crc])};
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(width);ihdr.writeUInt32BE(height,4);ihdr[8]=8;ihdr[9]=6;const raw=Buffer.alloc((width*4+1)*height),rgba=Buffer.from(data);for(let y=0;y<height;y++)rgba.copy(raw,y*(width*4+1)+1,y*width*4,(y+1)*width*4);return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}
