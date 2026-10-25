import {normalizeSettings} from './settings.js';
import {CLEAN} from './settings.js';
import {settingsDiff,applySettingsDiff,compactOverlayUrl} from './compact-link.js';
import {encodeStudio} from './frame-studio.js';
import {decompressJson} from './compact-link.js';

export const ALERT_TYPE_ORDER=['follow','sub','resub','giftSub','raid','cheer','redemption'];
export const ALERT_SCOPES=Object.freeze({follow:'moderator:read:followers',sub:'channel:read:subscriptions',resub:'channel:read:subscriptions',giftSub:'channel:read:subscriptions',cheer:'bits:read',redemption:'channel:read:redemptions'});
export const ALERT_SCOPE_LIST=Object.freeze([...new Set(Object.values(ALERT_SCOPES))]);
export const ALERT_POSITIONS=Object.freeze(['top-left','top-center','top-right','center','bottom-left','bottom-right']);
const fallbackDefaults={version:1,enabled:false,position:'top-center',widthPx:480,insetPx:36,queue:{maxPending:20,maxAgeSeconds:120,followDedupeSeconds:30,gapMs:500},sound:{enabled:false,volume:.2},showViewerMessage:true,showRewardTitle:true,types:{follow:{enabled:true,message:'{name} joined the adventure!',holdSeconds:5},sub:{enabled:true,message:'{name} subscribed!',holdSeconds:7},resub:{enabled:true,message:'{name} is back for {months} months!',holdSeconds:9},giftSub:{enabled:true,message:'{name} gifted {count} subscriptions!',holdSeconds:8},raid:{enabled:true,message:'{name} arrived with {viewers} viewers!',holdSeconds:9},cheer:{enabled:true,message:'{name} cheered {bits} bits!',holdSeconds:6},redemption:{enabled:false,message:'{name} redeemed a channel reward!',holdSeconds:7}}};
const integer=(v,f,min,max)=>Number.isFinite(v)?Math.max(min,Math.min(max,Math.round(v))):f;
const num=(v,f,min,max)=>Number.isFinite(v)?Math.max(min,Math.min(max,v)):f;
export function alertDefaults(design){return structuredClone(design?.defaults||fallbackDefaults)}

export function normalizeAlerts(value,design){
 const d=alertDefaults(design),v=value&&typeof value==='object'?value:{};
 const out={version:1,enabled:!!v.enabled,position:ALERT_POSITIONS.includes(v.position)?v.position:d.position,widthPx:integer(v.widthPx,d.widthPx,280,800),insetPx:integer(v.insetPx,d.insetPx,0,120),queue:{maxPending:integer(v.queue?.maxPending,d.queue.maxPending,1,50),maxAgeSeconds:integer(v.queue?.maxAgeSeconds,d.queue.maxAgeSeconds,15,300),followDedupeSeconds:integer(v.queue?.followDedupeSeconds,d.queue.followDedupeSeconds,5,120),gapMs:integer(v.queue?.gapMs,d.queue.gapMs,0,2000)},sound:{enabled:!!v.sound?.enabled,volume:num(v.sound?.volume,d.sound.volume,0,1)},showViewerMessage:v.showViewerMessage!==false,showRewardTitle:v.showRewardTitle!==false,types:{}};
 for(const type of ALERT_TYPE_ORDER){const input=v.types?.[type]||{},base=d.types[type];const candidate=typeof input.message==='string'?input.message:base.message;const valid=validateAlertTemplate(type,candidate,design).valid;out.types[type]={enabled:input.enabled===undefined?base.enabled:!!input.enabled,message:valid?candidate:base.message,holdSeconds:integer(input.holdSeconds,base.holdSeconds,3,20)}}
 return out;
}

export function validateAlertTemplate(type,value,design){
 const text=String(value??'');const tokens=design?.templateTokens?.[type]||['name'];const allowed=new Set(tokens);const found=[...text.matchAll(/\{([^{}]*)\}/g)].map(m=>m[1]);const unmatched=(text.match(/[{}]/g)||[]).length!==found.length*2;const unknown=found.some(x=>!allowed.has(x));const valid=Array.from(text).length>=1&&Array.from(text).length<=160&&found.includes('name')&&!unknown&&!unmatched;
 return{valid,unknown,unmatched,missingName:!found.includes('name'),length:Array.from(text).length,tokens};
}

export function cleanAlertText(value,max=240){let text=String(value??'').replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g,'').trim();let parts;try{parts=[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(text)].map(x=>x.segment)}catch{parts=[...text]}return parts.length>max?parts.slice(0,max-1).join('')+'…':text}
export function fillAlertTemplate(template,values={},type,design){const check=validateAlertTemplate(type,String(template),design);if(!check.valid)return '';const allowed=new Set(check.tokens);return String(template).replace(/\{([^{}]+)\}/g,(_,token)=>allowed.has(token)?cleanAlertText(values[token]??'',token==='name'?50:32):'')}

export function alertScopesFor(alerts){const config=normalizeAlerts(alerts);return [...new Set(ALERT_TYPE_ORDER.filter(type=>config.types[type].enabled).map(type=>ALERT_SCOPES[type]).filter(Boolean))]}

function safeRecipe(value){const r=value&&typeof value==='object'?value:{};const motions=['fade','slide','pop','step'],waves=['sine','triangle','square'],icons=['outline','pixel-grid'];return{version:1,title:cleanAlertText(r.title||'Community update',60),iconTreatment:icons.includes(r.iconTreatment)?r.iconTreatment:'outline',motion:motions.includes(r.motion)?r.motion:'fade',soundWave:waves.includes(r.soundWave)?r.soundWave:'sine',surfaceOpacityFloor:.94,titleSizePx:16,iconSizePx:36,paddingPx:20,columnGapPx:16,followMessage:typeof r.followMessage==='string'?r.followMessage:'{name} joined the adventure!'} }
function alertSafeChatSettings(settings){const chat=normalizeSettings(settings);if(chat.studioDesign&&typeof chat.studioDesign==='object')chat.studioDesign=encodeStudio(chat.studioDesign);chat.customCSS={enabled:false,source:''};for(const bg of Object.values(chat.backgrounds||{}))if(bg?.mode==='image'){bg.mode='solid';bg.imageUrl='';bg.opacity=Math.max(bg.opacity||0,.94)}return chat}
export function normalizeAlertEnvelope(value,design){if(!value||typeof value!=='object'||value.version!==1)return null;return{version:1,chatSettings:alertSafeChatSettings(value.chatSettings),alerts:normalizeAlerts(value.alerts,design),recipe:safeRecipe(value.recipe)}}
const toBase64Url=text=>btoa(unescape(encodeURIComponent(text))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'');
export function encodeAlertConfig(config,design){const normalized=normalizeAlertEnvelope(config,design);if(!normalized)throw new TypeError('Invalid alerts configuration');return toBase64Url(JSON.stringify(normalized))}
export function decodeAlertConfig(encoded,design){try{const value=JSON.parse(decodeURIComponent(escape(atob(String(encoded).replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(String(encoded).length/4)*4,'=')))));return normalizeAlertEnvelope(value,design)}catch{return null}}
export function parseAlertsFragment(hash,design){const fragment=String(hash||'').replace(/^#/,'');if(!fragment.startsWith('v=1&'))return null;const params=new URLSearchParams(fragment);const token=params.get('access_token')||'',config=decodeAlertConfig(params.get('config'),design);return token&&config?{token,config}:null}
export function compactAlertData({chatSettings,alerts,recipe,baseSettings=CLEAN},design){return{c:settingsDiff(baseSettings,alertSafeChatSettings(chatSettings))||{},a:{alerts:normalizeAlerts(alerts,design),recipe:safeRecipe(recipe)}}}
export function decodeCompactAlertData(payload,design,chatSettings){if(!payload?.a)return null;return normalizeAlertEnvelope({version:1,chatSettings:chatSettings||normalizeSettings(applySettingsDiff(CLEAN,payload.c||{})),alerts:payload.a.alerts,recipe:payload.a.recipe},design)}
export async function buildAlertsUrl(baseUrl,{token,chatSettings,alerts,recipe,baseSkinId='',baseSettings=CLEAN},design){return compactOverlayUrl(baseUrl,{b:String(baseSkinId||''),...compactAlertData({chatSettings,alerts,recipe,baseSettings},design)},token)}
export async function parseCompactAlertsFragment(hash,catalog=[],design){try{const params=new URLSearchParams(String(hash||'').replace(/^#/,''));if(params.get('v')!=='2'||!params.get('data')||!params.get('access_token'))return null;const payload=await decompressJson(params.get('data')),base=catalog.find(skin=>skin.id===payload.b)?.settings||CLEAN,chatSettings=applySettingsDiff(base,payload.c||{}),config=decodeCompactAlertData(payload,design,chatSettings);return config?{token:params.get('access_token'),config}:null}catch{return null}}

export class AlertQueue{
 constructor({maxPending=20,maxAgeSeconds=120,followDedupeSeconds=30,now=Date.now}={}){this.maxPending=integer(maxPending,20,1,50);this.maxAgeMs=integer(maxAgeSeconds,120,15,300)*1000;this.followDedupeMs=integer(followDedupeSeconds,30,5,120)*1000;this.now=now;this.pending=[];this.seenIds=new Map();this.seenFollows=new Map();this.skipped=0}
 enqueue(event){const now=this.now();for(const[id,time]of this.seenIds)if(now-time>600000)this.seenIds.delete(id);for(const[key,time]of this.seenFollows)if(now-time>this.followDedupeMs)this.seenFollows.delete(key);if(!event||!ALERT_TYPE_ORDER.includes(event.type))return{accepted:false,reason:'invalid'};if(event.messageId&&this.seenIds.has(event.messageId))return{accepted:false,reason:'duplicate'};if(event.type==='sub'&&event.isGift)return{accepted:false,reason:'gift-batch'};if(event.type==='raid'&&event.incoming===false)return{accepted:false,reason:'outgoing-raid'};if(event.type==='follow'&&event.userId){const key=`${event.broadcasterId||''}:${event.userId}`,last=this.seenFollows.get(key);if(last!==undefined&&now-last<this.followDedupeMs)return{accepted:false,reason:'duplicate-follow'};this.seenFollows.set(key,now)}if(event.messageId){this.seenIds.set(event.messageId,now);if(this.seenIds.size>10000)this.seenIds.delete(this.seenIds.keys().next().value)}this.pending=this.pending.filter(item=>now-item.receivedAt<=this.maxAgeMs);let dropped=null;if(this.pending.length>=this.maxPending){let index=this.pending.findIndex(item=>item.type==='follow');if(index<0)index=0;dropped=this.pending.splice(index,1)[0];this.skipped++}this.pending.push({...event,receivedAt:now});return{accepted:true,dropped,skipped:this.skipped}}
 take(){const now=this.now();this.pending=this.pending.filter(item=>now-item.receivedAt<=this.maxAgeMs);return this.pending.shift()||null}
 clear(){this.pending=[];this.seenIds.clear();this.seenFollows.clear();this.skipped=0}
 get length(){return this.pending.length}
}
