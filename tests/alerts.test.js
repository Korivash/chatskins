import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ALERT_TYPE_ORDER,ALERT_SCOPE_LIST,normalizeAlerts,alertScopesFor,fillAlertTemplate,validateAlertTemplate,AlertQueue,encodeAlertConfig,decodeAlertConfig,buildAlertsUrl,parseAlertsFragment} from '../js/alerts-config.js';
import {buildAlertsAuthorizationUrl,validateAlertsToken,revokeAlertsToken} from '../js/alerts-auth.js';
import {buildEventSubSubscriptions,parseEventSubMessage,createEventSubClient} from '../js/eventsub.js';
import {createAlertCard} from '../js/alerts-render.js';
import {normalizeSettings} from '../js/settings.js';

const design=JSON.parse(await readFile(new URL('../design/skins.json',import.meta.url),'utf8')).alertDesign;
const fixture=JSON.parse(await readFile(new URL('./fixtures/eventsub-alerts.json',import.meta.url),'utf8'));
const createFakeDocument=()=>{
 const create=(tag,text='',svg=false)=>({tag,textContent:text,children:[],attributes:{},dataset:{},style:{setProperty(){}},classList:{add(){}},setAttribute(k,v){this.attributes[k]=v},append(...nodes){this.children.push(...nodes)},appendChild(node){this.children.push(node)}});
 return{createElement:(tag)=>create(tag),createElementNS:(_ns,tag)=>create(tag,'',true),createTextNode:text=>create('#text',text)};
};

test('EventSub fixture parsing covers lifecycle, every alert type, and revocation',()=>{
 const parsed=fixture.map(message=>parseEventSubMessage(message,{broadcasterId:'42'}));
 assert.deepEqual(parsed.slice(0,3).map(x=>x.kind),['welcome','keepalive','reconnect']);
 assert.equal(parsed[0].sessionId,'session-1');assert.equal(parsed[2].url.includes('session_id=next'),true);
 const notices=parsed.filter(x=>x.kind==='notification');assert.deepEqual(notices.map(x=>x.type),ALERT_TYPE_ORDER);
 assert.equal(notices[0].name,'Moss');assert.equal(notices[1].tier,'Tier 1 / Prime');assert.equal(notices[2].months,12);assert.equal(notices[3].count,5);assert.equal(notices[4].viewers,128);assert.equal(notices[5].bits,'1,000');assert.equal(notices[6].rewardTitle,'Hydrate the party');
 assert.equal(parsed.at(-1).kind,'revocation');assert.equal(parsed.at(-1).subscription.status,'authorization_revoked');
});

test('subscription requests use the required EventSub types and owner conditions',()=>{
 const alerts=normalizeAlerts(null,design);alerts.types.redemption.enabled=true;
 const requests=buildEventSubSubscriptions({broadcasterId:'42',sessionId:'session-1',alerts});
 assert.deepEqual(requests.map(x=>x.body.type),['channel.follow','channel.subscribe','channel.subscription.message','channel.subscription.gift','channel.raid','channel.cheer','channel.channel_points_custom_reward_redemption.add']);
 assert.deepEqual(requests[0].body.condition,{broadcaster_user_id:'42',moderator_user_id:'42'});assert.deepEqual(requests[4].body.condition,{to_broadcaster_user_id:'42'});assert.equal(requests[0].body.transport.session_id,'session-1');
 assert.deepEqual(alertScopesFor(alerts),ALERT_SCOPE_LIST);
});

test('a welcomed socket registers enabled subscriptions against its session id',async()=>{
 const requests=[];class FakeSocket{constructor(url){this.url=url;FakeSocket.current=this}close(){this.onclose?.()}}
 const alerts=normalizeAlerts(null,design),client=createEventSubClient({token:'memory-token',clientId:'client',broadcasterId:'42',alerts,WebSocketImpl:FakeSocket,fetchImpl:async(url,options)=>{requests.push({url,options});return{ok:true,status:202,json:async()=>({data:[{status:'enabled'}]})}}});
 client.start();await FakeSocket.current.onmessage({data:JSON.stringify(fixture[0])});assert.equal(requests.length,6);assert.ok(requests.every(x=>x.url==='https://api.twitch.tv/helix/eventsub/subscriptions'));assert.equal(requests[0].options.headers.Authorization,'Bearer memory-token');assert.equal(JSON.parse(requests[0].options.body).transport.session_id,'session-1');client.stop();
});

test('templates accept only event tokens and fill text as text nodes',()=>{
 assert.equal(validateAlertTemplate('resub','{name} returned for {months} months',design).valid,true);
 assert.equal(validateAlertTemplate('follow','{name} {months}',design).valid,false);
 assert.equal(fillAlertTemplate('{name} cheered {months} months',{name:'Moss',months:12},'cheer',design),'');
 const hostile='<img src=x onerror=alert(1)>',doc=createFakeDocument(),alerts=normalizeAlerts(null,design);alerts.types.follow.message=`${hostile} {name}`;
 const card=createAlertCard({document:doc,event:{type:'follow',name:hostile},config:{...alerts,chatSettings:normalizeSettings({})},recipe:{title:'Update',motion:'fade'},design});
 const flatten=node=>[node.textContent,...node.children.flatMap(flatten)].join('');
 assert.ok(flatten(card).includes(hostile));assert.equal(card.children.some(node=>node.tag==='img'),false);
 assert.equal(card.children[1].children[2].children.some(node=>node.tag==='img'),false);
});

test('queue deduplicates EventSub ids and repeated broadcaster/follower pairs',()=>{
 let now=1000;const queue=new AlertQueue({maxPending:2,maxAgeSeconds:15,followDedupeSeconds:30,now:()=>now});
 const first={type:'follow',userId:'u1',broadcasterId:'b1',messageId:'m1'};
 assert.equal(queue.enqueue(first).accepted,true);assert.equal(queue.enqueue({...first,messageId:'m2'}).reason,'duplicate-follow');assert.equal(queue.enqueue({...first,userId:'u2',messageId:'m3'}).accepted,true);assert.equal(queue.enqueue({type:'raid',messageId:'m4'}).dropped.type,'follow');
 assert.equal(queue.length,2);assert.equal(queue.take().type,'follow');assert.equal(queue.enqueue({type:'sub',messageId:'m4'}).reason,'duplicate');now+=16000;assert.equal(queue.take(),null);
});

test('alerts link codec round-trips config and keeps the token out of query strings',()=>{
 const alerts=normalizeAlerts(null,design),chatSettings=normalizeSettings({channel:'streamer'}),config={version:1,chatSettings,alerts,recipe:{title:'A world update',motion:'pop',iconTreatment:'outline',soundWave:'triangle'}};
 const encoded=encodeAlertConfig(config,design);assert.deepEqual(decodeAlertConfig(encoded,design).alerts,alerts);
 const token='secret-access-token';const url=new URL(buildAlertsUrl('https://getchatskins.com/editor.html?old=1', {token,...config},design));assert.equal(url.search,'');assert.equal(url.hash.includes(encodeURIComponent(token)),true);assert.equal(url.search.includes(token),false);
 const parsed=parseAlertsFragment(url.hash,design);assert.equal(parsed.token,token);assert.equal(parsed.config.recipe.title,'A world update');
 const oauth=new URL(buildAlertsAuthorizationUrl({state:'private-state',scopes:ALERT_SCOPE_LIST,location:{origin:'https://getchatskins.com'}}));assert.equal(oauth.origin,'https://id.twitch.tv');assert.equal(oauth.searchParams.get('redirect_uri'),'https://getchatskins.com/');assert.equal(oauth.searchParams.get('scope'),ALERT_SCOPE_LIST.join(' '));assert.equal(oauth.searchParams.has('access_token'),false);assert.equal(oauth.searchParams.has('token'),false);
 assert.equal(new URL(oauth.href).search.includes(token),false);
});

test('token validation uses Twitch auth only and sends credentials in headers or POST bodies',async()=>{
 let validationRequest,revocationRequest;
 const result=await validateAlertsToken('sensitive-token',{fetchImpl:async(url,options)=>{validationRequest={url,options};return{ok:true,status:200,json:async()=>({client_id:'o35kfdkfee10jgi3i6szk98lsfcvf3',user_id:'42',login:'streamer',scopes:ALERT_SCOPE_LIST,expires_in:3600})}}});
 assert.equal(result.valid,true);assert.equal(validationRequest.url,'https://id.twitch.tv/oauth2/validate');assert.equal(validationRequest.options.headers.Authorization,'OAuth sensitive-token');assert.equal(validationRequest.url.includes('sensitive-token'),false);
 await revokeAlertsToken('sensitive-token',{fetchImpl:async(url,options)=>{revocationRequest={url,options};return{ok:true,status:200}}});assert.equal(revocationRequest.url,'https://id.twitch.tv/oauth2/revoke');assert.equal(revocationRequest.options.method,'POST');assert.equal(new URLSearchParams(revocationRequest.options.body).get('token'),'sensitive-token');
});

test('overlay consumes alert credentials from the fragment and never places tokens in generated queries',async()=>{
 const [overlay,auth,config]=await Promise.all(['../js/overlay.js','../js/alerts-auth.js','../js/alerts-config.js'].map(p=>readFile(new URL(p,import.meta.url),'utf8')));
 assert.match(overlay,/history\.replaceState\(null,'',`\$\{location\.pathname\}\$\{location\.search\}`\)/);
 assert.doesNotMatch(auth,/searchParams\.(?:set|append)\(['"](?:access_token|token)['"]/);
 assert.doesNotMatch(config,/url\.searchParams\.(?:set|append)\(['"](?:access_token|token)['"]/);
});
