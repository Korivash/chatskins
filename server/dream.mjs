/**
 * Dream generator for new, editable Frame Studio designs.
 * Generated submissions are stored outside the public site directory.
 */
import {createHash, randomBytes} from 'node:crypto';
import {mkdir, readFile, readdir, unlink, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {clientIp, originAllowed} from './describe.mjs';
import {createAiUsageStore} from './ai-usage.mjs';
import {measurePaintedFrame,measurePaintedRgba,pngDimensions} from './dream-image.mjs';
import {blankStudio, makeStudioKit, normalizeStudio, STUDIO_LIMIT} from '../js/frame-studio.js';

const here=dirname(fileURLToPath(import.meta.url));
const defaultKeyFile='C:/ops/secrets/openai-chatskins.txt';
const defaultDataDir=resolve(here,'../../server-data');
const dayMs=86400000, tokenReserve=7000;
const fontFamilies=['DM Sans','Barlow','Nunito Sans','IBM Plex Mono','Chakra Petch','Atkinson Hyperlegible','Bree Serif','Lato','Cinzel Decorative','Fredoka','Black Ops One','Bungee'];
const json=(status,body)=>({status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'},body});
const sha=value=>createHash('sha256').update(String(value)).digest('hex');
const responseText=data=>typeof data?.output_text==='string'?data.output_text:data?.output?.find(item=>item.type==='message')?.content?.find(item=>item.type==='output_text')?.text||'';
/** GPT-5 and GPT-6 support the lower minimal reasoning budget. */
export function reasoningEffort(model){return /^gpt-(?:5|6)(?:-|$)/i.test(String(model))?'minimal':'low'}
const color={type:'string',pattern:'^#[0-9A-Fa-f]{6}$'};
const compactPartSchema={type:'object',additionalProperties:false,required:['i','x','y','w','h','r','fx','fy','c'],properties:{i:{type:'integer',minimum:0,maximum:60},x:{type:'integer',minimum:0,maximum:1000},y:{type:'integer',minimum:0,maximum:1000},w:{type:'integer',minimum:1,maximum:1000},h:{type:'integer',minimum:1,maximum:1000},r:{type:'integer',minimum:-180,maximum:180},fx:{type:'boolean'},fy:{type:'boolean'},c:{type:'array',items:{type:'integer',minimum:0,maximum:31},minItems:3,maxItems:3}}};
// Compact model-facing keys keep generated compositions within the output
// budget. They are expanded into the editor's regular Studio model below.
export const studioSchema={type:'object',additionalProperties:false,required:['v','cat','b','n','m','p','a'],properties:{v:{type:'integer',enum:[1]},cat:{type:'integer',enum:[19]},b:{type:'array',items:{type:'integer'},minItems:2,maxItems:2},n:{type:'string',maxLength:40},m:{type:'boolean'},p:{type:'array',items:color,minItems:1,maxItems:32},a:{type:'array',items:compactPartSchema,minItems:1,maxItems:25}}};

/** Read the parts manifest, used to constrain generated art to shipped SVGs. */
export async function readDreamParts(file=resolve(here,'../site-media/parts/parts.json')){
 const data=JSON.parse(await readFile(file,'utf8'));
 return (data.parts||[]).map(part=>({id:Number(part.id),name:String(part.name||''),category:String(part.category||''),tags:Array.isArray(part.tags)?part.tags:[],defaultSize:part.defaultSize||{w:15,h:15}}));
}

/** Ensure the requested composition always has a plaque and its requested art. */
export function completeDreamDesign(design,{text='',parts=[]}={}){
 const next=structuredClone(design),window=next.instances.find(part=>part.part===19);
 if(!window)throw new TypeError('A custom frame needs a chat window.');
 const palette=next.palette.length>=3?[0,1,2]:[0,0,0];
 const add=(asset,x,y,w,h)=>{if(next.instances.length>=25){const removable=next.instances.findLastIndex(part=>![19,60].includes(part.part)&&!(part.part>=29&&part.part<=36));if(removable>=0)next.instances.splice(removable,1)}if(next.instances.length<25)next.instances.push({uid:`dream-${asset.id}-${next.instances.length}`,part:asset.id,x,y,w,h,angle:0,flipX:false,flipY:false,colors:palette})};
 if(!next.instances.some(part=>part.part>=29&&part.part<=36)){
  const plaque=parts.find(part=>part.category==='plaques')||parts.find(part=>part.id===35);
  if(plaque)add(plaque,33,0,34,8);
 }
 const query=String(text).toLowerCase();
 const requested=query.includes('ghost')?'ghost':query.includes('cat')?'cat':query.includes('vine')?'flower':query.includes('dragon')?'dragon':'star';
 const sticker=parts.find(part=>part.category==='stickers'&&part.name.toLowerCase().includes(requested))||parts.find(part=>part.category==='stickers');
 const hasSticker=next.instances.some(instance=>parts.find(asset=>asset.id===instance.part)?.category==='stickers');
 const hasRequestedArt=sticker&&next.instances.some(instance=>instance.part===sticker.id);
 if(sticker&&(!hasSticker||requested!=='star')&&!hasRequestedArt){
  const preferred=Number(sticker.defaultSize?.w)||15,rightRoom=100-(window.x+window.w),leftRoom=window.x,useRight=rightRoom>=1,width=Math.min(preferred,useRight?rightRoom:leftRoom),height=Math.min(Number(sticker.defaultSize?.h)||15,15),x=useRight?window.x+window.w:Math.max(0,window.x-width),y=Math.max(0,Math.min(100-height,window.y));
  if(width>=1)add(sticker,x,y,width,height);
 }
 return next;
}

/** Reject unsafe or malformed generated designs and clamp editable settings. */
export function validateDreamReply(value,{partIds=[],name='',fontOptions=fontFamilies,onReject=()=>{}}={}){
 const reject=reason=>{onReject(reason);return null};
 if(!value||typeof value!=='object'||Array.isArray(value))return reject('invalid root');
 const expanded=expandCompactDesign(value.design);
 if(!expanded||typeof expanded!=='object'||!Array.isArray(expanded.instances))return reject('missing parts');

 // Model coordinates are suggestions. Clamp them to the board before strict
 // normalization so a sticker just over an edge cannot invalidate a whole look.
 const allowedParts=new Set(partIds.map(Number));
 const rawPalette=Array.isArray(expanded.palette)?expanded.palette:[];
 const palette=rawPalette.filter(color=>typeof color==='string'&&/^#[\da-f]{6}$/i.test(color)).slice(0,32);
 while(palette.length<3)palette.push(['#7D65AA','#E8DDF8','#A9D9C8'][palette.length]);
 const candidates=expanded.instances.filter(part=>part&&typeof part==='object'&&Number.isInteger(Number(part.part))&&allowedParts.has(Number(part.part))&&Number(part.part)!==60);
 if(!candidates.length)return reject('no valid parts');
 const instances=[];
 const windowPart=candidates.find(part=>Number(part.part)===19);
 if(!windowPart)return reject('missing chat window');
 const ordered=[windowPart,...candidates.filter(part=>part!==windowPart)].slice(0,STUDIO_LIMIT);
 let effectCount=0,glowCount=0;
 for(const part of ordered){
  const id=Number(part.part);
  if(id>=20&&id<=28){if(effectCount>=3)continue;effectCount++;if([23,26].includes(id)){if(glowCount>=2)continue;glowCount++}}
  const finite=(value,fallback)=>Number.isFinite(Number(value))?Number(value):fallback;
  const w=Math.max(id===19?32:1,Math.min(100,finite(part.w,10)));
  const h=Math.max(id===19?25:1,Math.min(100,finite(part.h,10)));
  const colors=Array.isArray(part.colors)?part.colors.slice(0,3):[];
  while(colors.length<3)colors.push(colors.length);
  instances.push({
   part:id,
   x:Math.max(0,Math.min(100-w,finite(part.x,0))),
   y:Math.max(0,Math.min(100-h,finite(part.y,0))),
   w,h,
   angle:id===19?0:Math.max(-180,Math.min(180,finite(part.angle,0))),
   flipX:id===19?false:!!part.flipX,
   flipY:id===19?false:!!part.flipY,
   colors:colors.map(index=>Math.max(0,Math.min(palette.length-1,Math.trunc(finite(index,0)))))
  });
 }
 // Exactly one window is required. Keep the first valid one and discard extras.
 const windowIndex=instances.findIndex(part=>part.part===19);
 if(windowIndex<0)return reject('missing chat window');
 let windowCount=0;
 const usable=instances.filter(part=>part.part!==19||windowCount++===0);
 const safeDesign={
  version:1,
  catalog:19,
  board:[600,680],
  name:typeof expanded.name==='string'?expanded.name.slice(0,40):'',
  motion:expanded.motion!==false,
  palette,
  instances:usable
 };
 // Generated designs do not need an imported base. Ignore any model-supplied
 // legacy reference so only validated parts from the shipped library survive.
 let design;
 try{design=normalizeStudio(safeDesign,{strict:true})}catch{return reject('invalid normalized design')}
 const allowedSettings=new Set(['fontFamily','fontSize','fontWeight','textColor','nameColor','nameColorMode','backgroundColor','backgroundOpacity','backgroundScope','backgroundType','frameColor','glowColor','glowStrength','glowMode','middleBackground','middleColor','middleOpacity','middleImage','titleText','entranceAnimation','messageBorders','maxMessages','messageLifetime']);
 const settings={};
 for(const[key,raw]of Object.entries(value.settings||{})){
  if(!allowedSettings.has(key))continue;
  if(['textColor','nameColor','backgroundColor','frameColor','glowColor','middleColor'].includes(key)){if(typeof raw==='string'&&/^#[\da-f]{6}$/i.test(raw))settings[key]=raw.toUpperCase();continue}
  if(key==='fontFamily'){if(typeof raw==='string'&&fontOptions.includes(raw))settings[key]=raw;continue}
  if(key==='fontSize'||key==='fontWeight'){if(Number.isFinite(raw))settings[key]=key==='fontSize'?Math.max(14,Math.min(48,raw)):Math.max(300,Math.min(900,raw));continue}
  if(['backgroundOpacity','glowStrength','middleOpacity'].includes(key)){if(Number.isFinite(raw))settings[key]=Math.max(0,Math.min(1,raw));continue}
  if(key==='maxMessages'||key==='messageLifetime'){if(Number.isFinite(raw))settings[key]=key==='maxMessages'?Math.max(1,Math.min(30,raw)):Math.max(0,Math.min(300,raw));continue}
  if(key==='glowMode'&&['off','pulse','shimmer'].includes(raw)){settings[key]=raw;continue}
  if(['middleBackground','backgroundType'].includes(key)&&['none','color','image'].includes(raw)){settings[key]=raw;continue}
  if(key==='backgroundScope'&&['message','panel'].includes(raw)){settings[key]=raw;continue}
  if(key==='entranceAnimation'&&['none','fade','pop','slide'].includes(raw)){settings[key]=raw;continue}
  if(key==='nameColorMode'&&['fixed','twitch','role'].includes(raw)){settings[key]=raw;continue}
  if(key==='messageBorders'&&typeof raw==='boolean'){settings[key]=raw;continue}
  if(key==='titleText'&&typeof raw==='string'){settings[key]=raw.slice(0,40);continue}
  if(key==='middleImage'&&typeof raw==='string'){try{const image=new URL(raw);if(image.protocol==='https:')settings[key]=image.href}catch{}continue}
 }
 const requested=typeof name==='string'?name.trim().slice(0,40):'';
 // Keep the skin's catalog name separate from the frame's editable plaque
 // text. An empty plaque title deliberately falls back to the channel name.
 design.name=requested;
 design.instances=design.instances.map(part=>({...part,uid:`dream-${part.part}-${Math.round(part.x*10)}-${Math.round(part.y*10)}`}));
 const description=typeof value.description==='string'&&value.description.trim()?value.description.trim().slice(0,180):'A custom chat frame made from your idea.';
 const moodTags=Array.isArray(value.moodTags)?value.moodTags.filter(tag=>typeof tag==='string').slice(0,6).map(tag=>tag.trim().slice(0,24)).filter(Boolean):[];
 return{design,settings,name:String(value.name||name||'My custom frame').trim().slice(0,40)||'My custom frame',description,moodTags};
}

/** Expand short permille transforms into the editor's percentage model. */
export function expandCompactDesign(input){
 if(input&&Object.hasOwn(input,'version'))return input;
 if(!input||!Array.isArray(input.a))return input;
 return{
  version:input.v,
  catalog:input.cat,
  board:input.b,
  name:input.n,
  motion:input.m,
  palette:input.p,
  instances:input.a.map(part=>({
   part:part.i,
   x:part.x/10,
   y:part.y/10,
   w:part.w/10,
   h:part.h/10,
   angle:part.r,
   flipX:part.fx,
   flipY:part.fy,
   colors:part.c
  }))
 };
}

/** Build the strict Responses schema with a caller-selected part-count cap. */
export function buildDreamSchema(partIds,fontOptions,maxParts=16){
 const nullableColor={...color,type:['string','null']};
 const settings={fontFamily:{type:['string','null'],enum:[...fontOptions,null]},fontSize:{type:['number','null'],minimum:14,maximum:48},fontWeight:{type:['number','null'],minimum:300,maximum:900},textColor:nullableColor,nameColor:nullableColor,nameColorMode:{type:['string','null'],enum:['fixed','twitch','role',null]},backgroundColor:nullableColor,backgroundOpacity:{type:['number','null'],minimum:0,maximum:1},backgroundScope:{type:['string','null'],enum:['message','panel',null]},backgroundType:{type:['string','null'],enum:['none','color','image',null]},middleImage:{type:['string','null'],maxLength:1500},frameColor:nullableColor,glowColor:nullableColor,glowStrength:{type:['number','null'],minimum:0,maximum:1},glowMode:{type:['string','null'],enum:['off','pulse','shimmer',null]},middleBackground:{type:['string','null'],enum:['none','color','image',null]},middleColor:nullableColor,middleOpacity:{type:['number','null'],minimum:0,maximum:1},titleText:{type:['string','null'],maxLength:40},entranceAnimation:{type:['string','null'],enum:['none','fade','pop','slide',null]},messageBorders:{type:['boolean','null']},maxMessages:{type:['number','null'],minimum:1,maximum:30},messageLifetime:{type:['number','null'],minimum:0,maximum:300}};
 const design=structuredClone(studioSchema);
 design.properties.a.maxItems=Math.max(1,Math.min(25,maxParts));
 design.properties.a.items.properties.i={type:'integer',enum:partIds};
 return{type:'object',additionalProperties:false,required:['design','settings','name','description','moodTags'],properties:{design,settings:{type:'object',additionalProperties:false,required:Object.keys(settings),properties:settings},name:{type:'string',minLength:1,maxLength:40},description:{type:'string',minLength:1,maxLength:180},moodTags:{type:'array',maxItems:6,items:{type:'string',maxLength:24}}}};
}

/** Create /api/dream and /api/dream/submit handlers with injectable services. */
export function createDreamHandler({fetchImpl=globalThis.fetch,now=Date.now,originHost=process.env.SKIN_REQUEST_ORIGIN_HOST??'getchatskins.com',keyFile=process.env.OPENAI_KEY_FILE||defaultKeyFile,model=process.env.DREAM_MODEL||'gpt-5-mini',imageModel=process.env.DREAM_IMAGE_MODEL||'gpt-image-2.5-flare',webpEncoder=encodeWebpWithFfmpeg,partsFile=resolve(here,'../site-media/parts/parts.json'),usageFile=resolve(here,'describe-usage.json'),dataDir=defaultDataDir,webhookUrl=process.env.SKIN_REQUEST_WEBHOOK,imagesEnabled=process.env.DREAM_IMAGES!=='false',logger=line=>console.warn(line)}={}){
 const usageStore=createAiUsageStore(usageFile);let partsPromise;
 const parts=()=>partsPromise||=(typeof partsFile==='string'?readDreamParts(partsFile):Promise.resolve(partsFile.parts||partsFile));
 const privateDir=resolve(dataDir,'dream-submissions'),imageUsageFile=resolve(dataDir,'dream-images.json');let imageUsageQueue=Promise.resolve(),cleanupPromise=null;
 async function readSubmission(id){if(!/^[a-f0-9-]{12,80}$/i.test(id))return null;try{return JSON.parse(await readFile(resolve(privateDir,`${id}.json`),'utf8'))}catch{return null}}
 async function writeSubmission(item){await mkdir(privateDir,{recursive:true});await writeFile(resolve(privateDir,`${item.id}.json`),JSON.stringify(item,null,2),'utf8')}
 async function cleanupRejected(){
  if(cleanupPromise)return cleanupPromise;
  cleanupPromise=(async()=>{try{for(const file of await readdir(privateDir)){if(!file.endsWith('.json'))continue;const path=resolve(privateDir,file);let saved;try{saved=JSON.parse(await readFile(path,'utf8'))}catch{continue}if(saved.status!=='rejected'||!saved.rejectedAt)continue;if(now()-Date.parse(saved.rejectedAt)<30*dayMs)continue;await unlink(path).catch(()=>{});if(saved.paintFile)await unlink(resolve(privateDir,saved.paintFile)).catch(()=>{})}}catch{}})();
  return cleanupPromise;
 }
 async function reserveImageQuota(ip,time){
  const work=imageUsageQueue.then(async()=>{
   const today=new Date(time).toISOString().slice(0,10);let usage={day:today,total:0,ips:{}};
   try{usage=JSON.parse(await readFile(imageUsageFile,'utf8'))}catch{}
   if(usage.day!==today)usage={day:today,total:0,ips:{}};
   const perIp=usage.ips[ip]||0;if(usage.total>=20||perIp>=2)return false;
   usage.total++;usage.ips[ip]=perIp+1;await mkdir(dirname(imageUsageFile),{recursive:true});await writeFile(imageUsageFile,JSON.stringify(usage),'utf8');return true;
  });
  imageUsageQueue=work.then(()=>undefined,()=>undefined);return work;
 }
 return async function handleDream({method='POST',url='/api/dream',headers={},remoteAddress='unknown',body=''}={}){
  await cleanupRejected();
  const imageMatch=url.match(/^\/api\/dream-image\/([a-f0-9]{24})\.webp$/i);
  if(method==='GET'&&imageMatch){
   const saved=await readSubmission(imageMatch[1]);
   if(!saved||saved.id!==imageMatch[1]||saved.imageStatus!=='ready'||saved.paintFile!==`${saved.id}.webp`)return json(404,{ok:false,error:'not_found'});
   try{const image=await readFile(resolve(privateDir,saved.paintFile));if(!isWebp(image))return json(404,{ok:false,error:'not_found'});return{status:200,headers:{'content-type':'image/webp','cache-control':'public, max-age=31536000, immutable','x-content-type-options':'nosniff'},body:image,binary:true}}
   catch{return json(404,{ok:false,error:'not_found'})}
  }
  const metadataMatch=url.match(/^\/api\/dream-image\/([a-f0-9]{24})\.json$/i);
  if(method==='GET'&&metadataMatch){const saved=await readSubmission(metadataMatch[1]);if(!saved||saved.id!==metadataMatch[1]||saved.imageStatus!=='ready'||saved.paintFile!==`${saved.id}.webp`||!saved.frame)return json(404,{ok:false,error:'not_found'});return json(200,{ok:true,...saved.frame,file:`/api/dream-image/${saved.id}.webp`,id:saved.id})}
  // Preserve the old private PNG path for links that predate painted templates.
  const legacyImageMatch=url.match(/^\/api\/dream\/image\/([a-f0-9]{24})$/i);
  if(method==='GET'&&legacyImageMatch){const saved=await readSubmission(legacyImageMatch[1]),file=saved?.legacyPaintFile||(/^[a-f0-9]{24}\.png$/i.test(saved?.paintFile||'')?saved.paintFile:'');if(!saved||saved.id!==legacyImageMatch[1]||saved.imageStatus!=='ready'||!file)return json(404,{ok:false,error:'not_found'});try{return{status:200,headers:{'content-type':'image/png','cache-control':'public, max-age=31536000, immutable','x-content-type-options':'nosniff'},body:await readFile(resolve(privateDir,file)),binary:true}}catch{return json(404,{ok:false,error:'not_found'})}}
  if(method!=='POST'||!['/api/dream','/api/dream/submit','/api/dream/status','/api/dream/review'].includes(url))return json(404,{ok:false,error:'not_found'});
  if(!originAllowed({headers,remoteAddress,originHost}))return json(403,{ok:false,error:'forbidden',message:'This request could not be verified.'});
  if(Buffer.byteLength(body,'utf8')>18000)return json(400,{ok:false,error:'invalid_input',message:'Keep your idea under 300 characters.'});
  let input;try{input=JSON.parse(body)}catch{return json(400,{ok:false,error:'invalid_input',message:'Enter a short design idea.'})}
  if(url==='/api/dream/status'){
   const saved=await readSubmission(String(input?.id||''));if(!saved||!input.key||sha(input.key)!==saved.ownerKeyHash)return json(404,{ok:false,error:'not_found',message:'That saved design could not be found.'});
   return json(200,{ok:true,imageStatus:saved.imageStatus||'off'});
  }
  if(url==='/api/dream/review'){
   const saved=await readSubmission(String(input?.id||''));
   if(!saved||saved.status!=='pending'||!input.key||sha(input.key)!==saved.reviewTokenHash)return json(404,{ok:false,error:'not_found',message:'That review link is no longer available.'});
   return json(200,{ok:true,design:saved.design,settings:saved.settings,name:saved.name,description:saved.description,credit:saved.credit});
  }
  if(url==='/api/dream/submit'){
   const saved=await readSubmission(String(input?.id||''));if(!saved||!input.key||sha(input.key)!==saved.ownerKeyHash)return json(404,{ok:false,error:'not_found',message:'That saved design could not be found.'});
   if(typeof input.credit==='string')saved.credit=input.credit.trim().slice(0,25);
   if(saved.status==='pending')return json(200,{ok:true,status:'pending',message:'Your design is already in the review queue.'});
   const usage=await usageStore.load(),day=new Date(now()).toISOString().slice(0,10),ip=sha(clientIp({remoteAddress,headers}));usage.days[day]||={total:0,tokens:0,reservedTokens:0,ips:{}};const daily=usage.days[day];daily.dreamSubmissions||={total:0,ips:{}};const count=daily.dreamSubmissions.ips[ip]||0;if(count>=3||daily.dreamSubmissions.total>=150)return json(429,{ok:false,error:'rate_limited',message:'Gallery requests are full for today. Your design is still saved privately.'});
   const reviewToken=randomBytes(32).toString('base64url');saved.reviewTokenHash=sha(reviewToken);saved.status='pending';saved.submittedAt=new Date(now()).toISOString();daily.dreamSubmissions.ips[ip]=count+1;daily.dreamSubmissions.total++;await usageStore.persist(usage);await writeSubmission(saved);
   if(webhookUrl){const reviewUrl=`https://getchatskins.com/editor.html#dream=${encodeURIComponent(saved.id)}&k=${encodeURIComponent(reviewToken)}`;const embed={title:'Community skin for review',description:saved.description,fields:[{name:'Name',value:saved.name},{name:'Credit',value:saved.credit||'Not provided'},{name:'Private review link',value:reviewUrl}]};try{await fetchImpl(webhookUrl,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({embeds:[embed],allowed_mentions:{parse:[]}})})}catch{logger('Dream review notification failed.')}}
   return json(200,{ok:true,status:'pending',message:'Submitted for review. Your design is still yours to use.'});
  }
  if(typeof input?.text!=='string'||!input.text.trim()||[...input.text].length>300||typeof(input.name??'')!=='string'||[...(input.name||'')].length>40||typeof(input.credit??'')!=='string'||[...(input.credit||'')].length>25)return json(400,{ok:false,error:'invalid_input',message:'Use an idea of 1 to 300 characters, a name up to 40 and optional credit up to 25.'});
  let partList;try{partList=await parts()}catch{return json(503,{ok:false,error:'unavailable',message:'Frame Studio is resting. Try again in a little while.'})}
  const time=now(),day=new Date(time).toISOString().slice(0,10),ip=sha(clientIp({remoteAddress,headers})),usage=await usageStore.load();usage.days[day]||={total:0,tokens:0,reservedTokens:0,ips:{}};const daily=usage.days[day],counters=daily.dream||{total:0,ips:{}},user=counters.ips[ip]||{count:0,last:0};
  for(const old of Object.keys(usage.days))if(old!==day)delete usage.days[old];
  if(user.count>=5||counters.total>=150||(daily.tokens||0)+(daily.reservedTokens||0)+tokenReserve>1500000)return json(429,{ok:false,error:'rate_limited',message:'Design generation is taking a break for today. Your existing designs are safe.'});
  daily.dream=counters;daily.reservedTokens=(daily.reservedTokens||0)+tokenReserve;user.count++;user.last=time;counters.ips[ip]=user;counters.total++;await usageStore.persist(usage);
  const finish=async tokens=>{daily.reservedTokens=Math.max(0,(daily.reservedTokens||0)-tokenReserve);daily.tokens=(daily.tokens||0)+Math.max(0,Number(tokens)||0);await usageStore.persist(usage)};
  let key;try{key=(await readFile(keyFile,'utf8')).trim()}catch{await finish(0);return json(503,{ok:false,error:'unavailable',message:'Frame Studio is unavailable right now.'})}if(!key){await finish(0);return json(503,{ok:false,error:'unavailable',message:'Frame Studio is unavailable right now.'})}
  const apiHeaders={authorization:`Bearer ${key}`,'content-type':'application/json'};let mod;
  try{const response=await fetchImpl('https://api.openai.com/v1/moderations',{method:'POST',headers:apiHeaders,body:JSON.stringify({model:'omni-moderation-latest',input:input.text})});if(!response.ok)throw Error();mod=await response.json()}catch{await finish(Number(mod?.usage?.total_tokens)||0);return json(503,{ok:false,error:'unavailable',message:'I could not check that idea. Try a different description.'})}
  if(mod?.results?.[0]?.flagged){await finish(Number(mod?.usage?.total_tokens)||0);return json(400,{ok:false,error:'moderation_refused',message:'Please describe a design without hateful, sexual or self-harm content.'})}
  const seed=makeStudioKit(/spooky|ghost|haunt/i.test(input.text)?'Spooky':'Cozy');seed.name=String(input.name||'').trim();
  const prompt=`Create a compact original Frame Studio chat design from the user's request. Use only listed part ids. Return at most 16 parts by default (hard limit 25). Use compact keys: design keys v,cat,b,n,m,p,a; part keys i,x,y,w,h,r,fx,fy,c. x,y,w,h are integer permille values from 0 to 1000, where 1000 means 100% of the board. i is the part id, r is rotation degrees, fx/fy are flip booleans, c contains three palette indexes. Include exactly one chat-window part id 19, a plaque, and decorations matching the request. For ghost requests use a ghost sticker if listed. Keep decorations outside the chat window. Use null for unchanged settings. Parts: ${JSON.stringify(partList.map(({id,name,category,tags,defaultSize})=>({i:id,n:name,g:category,t:tags,s:defaultSize})))}.`;
  const retryPrompt=`${prompt}\nRetry with a simpler composition of no more than 10 parts. Keep the same compact schema and never return partial JSON.`;
  const baseInput=[{role:'system',content:[{type:'input_text',text:prompt}]},{role:'user',content:[{type:'input_text',text:JSON.stringify({request:input.text,name:input.name||'',seed})}]}];
  const responseTokens=[];
  let data=null;
  for(let attempt=0;attempt<2;attempt++){
   const maxParts=attempt===0?16:10;
   const schema=buildDreamSchema(partList.map(part=>part.id),fontFamilies,maxParts);
   const inputItems=attempt===0?baseInput:[{role:'system',content:[{type:'input_text',text:retryPrompt}]},baseInput[1]];
   const requestBody={model,input:inputItems,store:false,max_output_tokens:6000,reasoning:{effort:reasoningEffort(model)},text:{format:{type:'json_schema',name:'chatskins_dream',strict:true,schema}}};
   let response;
   try{response=await fetchImpl('https://api.openai.com/v1/responses',{method:'POST',headers:apiHeaders,body:JSON.stringify(requestBody)})}
   catch{await finish((Number(mod?.usage?.total_tokens)||0)+responseTokens.reduce((sum,value)=>sum+value,0));return json(503,{ok:false,error:'unavailable',message:'I could not finish that design. Please try again.'})}
   if(!response.ok){await finish((Number(mod?.usage?.total_tokens)||0)+responseTokens.reduce((sum,value)=>sum+value,0));return json(response.status===429?429:503,{ok:false,error:response.status===429?'rate_limited':'unavailable',message:'Design generation is unavailable right now. Your ideas are safe to try again.'})}
   try{data=await response.json()}
   catch{await finish((Number(mod?.usage?.total_tokens)||0)+responseTokens.reduce((sum,value)=>sum+value,0));logger('dream reject: invalid response JSON');return json(422,{ok:false,error:'invalid_reply',message:'That design needs another try.'})}
   responseTokens.push(Number(data.usage?.total_tokens)||0);
   if(data.status==='incomplete'){
    if(attempt===0)continue;
    await finish((Number(mod?.usage?.total_tokens)||0)+responseTokens.reduce((sum,value)=>sum+value,0));
    logger('dream reject: incomplete response');
    return json(422,{ok:false,error:'incomplete_reply',message:'That design was too detailed to finish. Try a simpler description.'});
   }
   break;
  }
  const usedResponseTokens=responseTokens.reduce((sum,value)=>sum+value,0);
  let parsed;try{parsed=JSON.parse(responseText(data))}catch{await finish((Number(mod?.usage?.total_tokens)||0)+usedResponseTokens);logger('dream reject: invalid response JSON');return json(422,{ok:false,error:'invalid_reply',message:'That design needs another try.'})}
  let rejectReason='invalid model output';
  const valid=validateDreamReply(parsed,{partIds:partList.map(part=>part.id),name:input.name,fontOptions:fontFamilies,onReject:reason=>{rejectReason=reason}});if(!valid){await finish((Number(mod?.usage?.total_tokens)||0)+usedResponseTokens);logger(`dream reject: ${rejectReason}`);return json(422,{ok:false,error:'invalid_reply',message:'That design needs another try.'})}
  try{valid.design=completeDreamDesign(valid.design,{text:input.text,parts:partList})}catch{await finish((Number(mod?.usage?.total_tokens)||0)+usedResponseTokens);logger('dream reject: incomplete composition');return json(422,{ok:false,error:'invalid_reply',message:'That design needs another try.'})}
  let generatedModeration;
  try{const checked=await fetchImpl('https://api.openai.com/v1/moderations',{method:'POST',headers:apiHeaders,body:JSON.stringify({model:'omni-moderation-latest',input:`${valid.name}\n${valid.description}`})});if(!checked.ok)throw Error();generatedModeration=await checked.json()}catch{await finish((Number(mod?.usage?.total_tokens)||0)+usedResponseTokens);return json(503,{ok:false,error:'unavailable',message:'I could not check the generated design text. Please try again.'})}
  if(generatedModeration?.results?.[0]?.flagged){await finish((Number(mod?.usage?.total_tokens)||0)+usedResponseTokens+(Number(generatedModeration.usage?.total_tokens)||0));logger('dream reject: generated text moderation');return json(422,{ok:false,error:'invalid_reply',message:'The generated design text could not be used. Please try another idea.'})}
  // Never accept a painted or non-library asset from the model. The SVG
  // composition is immediately usable; an optional image job is tracked next.
  const id=randomBytes(12).toString('hex'),ownerKey=randomBytes(24).toString('base64url');const saved={id,...valid,credit:String(input.credit||'').trim(),createdAt:new Date(time).toISOString(),status:'private',ownerKeyHash:sha(ownerKey),ipHash:ip,imageStatus:imagesEnabled?'painting':'off',paintFile:''};await writeSubmission(saved);await finish((Number(mod?.usage?.total_tokens)||0)+usedResponseTokens+(Number(generatedModeration.usage?.total_tokens)||0));
  if(imagesEnabled)void paintImage(saved,{fetchImpl,key,ip,time,privateDir,reserveImageQuota,logger,imageModel,webpEncoder});
  return json(200,{ok:true,id,key:ownerKey,design:valid.design,settings:valid.settings,name:valid.name,description:valid.description,moodTags:valid.moodTags,imageStatus:saved.imageStatus,paintMessage:imagesEnabled?'Painting your frame… ~15s':''});
 };
}

/** Generate the optional painted variation under its separate daily caps. */
async function paintImage(saved,{fetchImpl,key,ip,time,privateDir,reserveImageQuota,logger,imageModel,webpEncoder}){
 try{
  if(!await reserveImageQuota(ip,time)){saved.imageStatus='unavailable';await writeFile(resolve(privateDir,`${saved.id}.json`),JSON.stringify(saved,null,2),'utf8');return}
  const cleaned=cleanImageDescription(saved.description),basePrompt=`Decorative frame for a live-stream chat overlay. ${cleaned}. A BLANK name plaque at the top center. The CENTER is completely EMPTY and transparent (at least 70% of width and height). Transparent background outside the frame. Rich, polished illustration. No text, no letters, no logos, no real people, no existing characters.`;
  let png=await generateImagePng(fetchImpl,key,imageModel,basePrompt);
  let measured=await measureImageFrame(png,webpEncoder?.binary||process.env.DREAM_WEBP_ENCODER||'ffmpeg');
  if(measured.centerTransparency<.95){const stronger=`${basePrompt} Make the entire central 40% × 40% box fully transparent with absolutely no texture, particles or decoration inside it. Put all decoration in a narrow outer border only.`;png=await generateImagePng(fetchImpl,key,imageModel,stronger);measured=await measureImageFrame(png,webpEncoder?.binary||process.env.DREAM_WEBP_ENCODER||'ffmpeg')}
  if(measured.centerTransparency<.95)throw Error('center transparency check failed');
  if(measured.measureFallback)logger('dream measure fallback');
  const webp=await webpEncoder(png);if(!isWebp(webp)||webp.length>400*1024)throw Error('WebP conversion exceeded storage limit');
  const file=`${saved.id}.webp`;await writeFile(resolve(privateDir,file),webp);saved.imageStatus='ready';saved.paintFile=file;saved.frame={width:measured.width,height:measured.height,shape:'tall',inner:measured.inner,plaque:measured.plaque};await writeFile(resolve(privateDir,`${saved.id}.json`),JSON.stringify(saved,null,2),'utf8');
 }catch{saved.imageStatus='unavailable';try{await writeFile(resolve(privateDir,`${saved.id}.json`),JSON.stringify(saved,null,2),'utf8')}catch{}logger('Dream painting unavailable.')}
}

/** Keep untrusted descriptions short and suitable for an image prompt. */
export function cleanImageDescription(value){return String(value||'').replace(/[\u0000-\u001f<>]/g,' ').replace(/\s+/g,' ').trim().slice(0,240)}
function isWebp(bytes){return Buffer.isBuffer(bytes)&&bytes.length>=12&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.readUInt32LE(4)+8===bytes.length&&bytes.toString('ascii',8,12)==='WEBP'}
async function generateImagePng(fetchImpl,key,primaryModel,prompt){
 const models=[primaryModel,'gpt-image-1.5'].filter((value,index,all)=>value&&all.indexOf(value)===index);let lastError;
 for(const model of models){const response=await fetchImpl('https://api.openai.com/v1/images/generations',{method:'POST',headers:{authorization:`Bearer ${key}`,'content-type':'application/json'},body:JSON.stringify({model,size:'1024x1536',quality:'medium',background:'transparent',output_format:'png',prompt})});if(!response.ok){lastError=new Error(`image API ${response.status}`);if((response.status===400||response.status===404)&&model===primaryModel)continue;throw lastError}const data=await response.json(),base64=data.data?.[0]?.b64_json;if(!base64)throw new Error('image response missing');return Buffer.from(base64,'base64')}
 throw lastError||new Error('image model unavailable');
}

/** Convert PNG to a compact WebP using the server's local ffmpeg binary. */
export async function encodeWebpWithFfmpeg(png,{binary=process.env.DREAM_WEBP_ENCODER||'ffmpeg'}={}){
 let last;
 for(const quality of [82,72,62,52,42,32]){const output=await runEncoder(binary,['-hide_banner','-loglevel','error','-i','pipe:0','-frames:v','1','-c:v','libwebp','-quality',String(quality),'-f','webp','pipe:1'],png);if(output.length<=400*1024)return output;last=new Error('WebP image exceeds 400 KB')}
 throw last||new Error('WebP conversion failed');
}
function runEncoder(binary,args,input){return new Promise((resolvePromise,reject)=>{const child=spawn(binary,args,{stdio:['pipe','pipe','ignore']});const chunks=[];child.stdout.on('data',chunk=>chunks.push(chunk));child.once('error',reject);child.once('close',code=>code===0?resolvePromise(Buffer.concat(chunks)):reject(new Error('WebP encoder failed')));child.stdin.end(input)})}

/** Retry frame measurement through ffmpeg before using a compact safe inset. */
async function measureImageFrame(png,binary){
 let primary=null;try{primary=measurePaintedFrame(png);if(!primary.measureFallback)return primary}catch{/* The ffmpeg decoder retries PNG variants the small parser cannot read. */}
 try{const {width,height}=pngDimensions(png),rgba=await runEncoder(binary,['-hide_banner','-loglevel','error','-i','pipe:0','-frames:v','1','-f','rawvideo','-pix_fmt','rgba','pipe:1'],png);if(rgba.length!==width*height*4)throw new Error('Raw frame length mismatch');const retry=measurePaintedRgba(rgba,width,height);if(!retry.measureFallback)return retry;primary=retry}catch{/* A missing encoder should still yield a safe, usable fallback frame. */}
 const {width=1024,height=1536}=primary||{};return{width,height,centerTransparency:primary?.centerTransparency??1,inner:{x:.15,y:.18,w:.70,h:.60},measureFallback:true,plaque:primary?.plaque||{none:true},shape:'tall'};
}

/** Review a pending submission without exposing its identifying network data. */
export async function approveDream(id,{dataDir=defaultDataDir,skinsFile=resolve(here,'../design/skins.json'),reject=false}={}){
 const file=resolve(dataDir,'dream-submissions',`${id}.json`),entry=JSON.parse(await readFile(file,'utf8'));
 if(entry.status!=='pending')throw new Error('Only pending gallery submissions can be reviewed.');
 if(reject){
  entry.status='rejected';entry.rejectedAt=new Date().toISOString();
  await writeFile(file,JSON.stringify(entry,null,2),'utf8');
  return entry;
 }
 const catalog=JSON.parse(await readFile(skinsFile,'utf8'));
 const base=catalog.skins[0]||{};
 const skin={
  id:`community-${entry.id}`,
  name:entry.name,
  category:'Community',
  tagline:entry.description.slice(0,60),
  credit:entry.credit||'Community creator',
  stats:structuredClone(base.stats||{readability:4,flair:4,motion:3,retro:1}),
  settings:{...base.settings,...entry.settings,studioDesign:entry.design,dreamPaintId:entry.imageStatus==='ready'?entry.id:''},
  moodTags:entry.moodTags
 };
 catalog.skins.push(skin);
 await writeFile(skinsFile,JSON.stringify(catalog,null,2)+'\n','utf8');
 entry.status='approved';entry.approvedAt=new Date().toISOString();
 await writeFile(file,JSON.stringify(entry,null,2),'utf8');
 return skin;
}
