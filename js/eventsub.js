/**
 * Browser module eventsub.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: buildEventSubSubscriptions, parseEventSubMessage, createEventSubClient.
 * Invariant: preserve existing settings links and render chat content as text.
 */
import {ALERT_TYPE_ORDER,alertScopesFor,cleanAlertText} from './alerts-config.js';


const EVENT_TYPES=Object.freeze({
 'channel.follow':{type:'follow',version:'2'},
 'channel.subscribe':{type:'sub',version:'1'},
 'channel.subscription.message':{type:'resub',version:'1'},
 'channel.subscription.gift':{type:'giftSub',version:'1'},
 'channel.raid':{type:'raid',version:'1'},
 'channel.cheer':{type:'cheer',version:'1'},
 'channel.channel_points_custom_reward_redemption.add':{type:'redemption',version:'1'}
});


/** build event sub subscriptions.
 * @param {unknown} parameter1 Function input.
 * @param {unknown} sessionId Function input.
 * @param {unknown} alerts Function input.
 * @param {unknown} parameter4 Function input.
 * @returns {unknown} The function result.
 */
export function buildEventSubSubscriptions({broadcasterId,sessionId,alerts,chatPlay}){
 if(!broadcasterId||!sessionId)return[];
  
 return Object.entries(EVENT_TYPES).filter(([type,info])=>alerts?.types?.[info.type]?.enabled||type==='channel.channel_points_custom_reward_redemption.add'&&chatPlay?.enabled&&chatPlay?.points?.enabled&&chatPlay.points.rewards?.some(r=>r.enabled)).map(([type,info])=>({type:info.type,body:{type,version:info.version,condition:type==='channel.follow'?{broadcaster_user_id:String(broadcasterId),moderator_user_id:String(broadcasterId)}:type==='channel.raid'?{to_broadcaster_user_id:String(broadcasterId)}:{broadcaster_user_id:String(broadcasterId)},transport:{method:'websocket',session_id:String(sessionId)}}}));
  
}

function person(event,nameKey='user_name',loginKey='user_login'){
 return{userId:String(event.user_id||event.from_broadcaster_user_id||''),name:cleanAlertText(event[nameKey]||event[loginKey]||'Anonymous supporter',50)};
  
}
function tierName(tier){return({'1000':'Tier 1 / Prime','2000':'Tier 2','3000':'Tier 3'})[String(tier)]||'Subscription'}
function requiredCount(value){const count=Number(value);
  return Number.isFinite(count)&&count>=1?count:null}
/** parse event sub message.
 * @param {unknown} input Function input.
 * @param {unknown} parameter2 Function input.
 * @returns {unknown} The function result.
 */
export function parseEventSubMessage(input,{broadcasterId=''}={}){
 let message;
  try{message=typeof input==='string'?JSON.parse(input):input}catch{return{kind:'invalid'}}
 const messageType=message?.metadata?.message_type,payload=message?.payload||{};
  
 if(messageType==='session_welcome')return{kind:'welcome',sessionId:payload.session?.id||'',keepaliveSeconds:Number(payload.session?.keepalive_timeout_seconds)||10};
  
 if(messageType==='session_keepalive')return{kind:'keepalive'};
  
 if(messageType==='session_reconnect')return{kind:'reconnect',url:payload.session?.reconnect_url||''};
  
 if(messageType==='revocation')return{kind:'revocation',subscription:payload.subscription||{}};
  
 if(messageType!=='notification')return{kind:'ignored'};
  
 const type=payload.subscription?.type,info=EVENT_TYPES[type],event=payload.event||{},messageId=String(message.metadata?.message_id||'');
  if(!info)return{kind:'ignored'};
  
 if(type==='channel.subscribe'&&event.is_gift)return{kind:'suppressed',reason:'gift-batch'};
  
 const base={kind:'notification',type:info.type,messageId,broadcasterId:String(event.broadcaster_user_id||broadcasterId||''),receivedAt:Date.now()};
  
 if(type==='channel.follow'){const user=person(event);
    return{...base,...user}}
 if(type==='channel.subscribe'){const user=person(event);
    return{...base,...user,tier:tierName(event.tier)}}
 if(type==='channel.subscription.message'){const months=requiredCount(event.cumulative_months);
    if(!months)return{kind:'invalid-event',reason:'missing-months'};
    const user=person(event);
    return{...base,...user,months,tier:event.sub_tier?tierName(event.sub_tier):'',viewerMessage:cleanAlertText(event.message?.text||'',240)}}
 if(type==='channel.subscription.gift'){const count=requiredCount(event.total);
    if(!count)return{kind:'invalid-event',reason:'missing-gift-count'};
    const user=person(event,'user_name','user_login');
    return{...base,...user,count,tier:event.sub_tier?tierName(event.sub_tier):''}}
 if(type==='channel.raid'){if(broadcasterId&&String(event.to_broadcaster_user_id)!==String(broadcasterId))return{kind:'suppressed',reason:'outgoing-raid'};
    const viewers=Number(event.viewers);
    if(!Number.isFinite(viewers)||viewers<0)return{kind:'invalid-event',reason:'missing-viewer-count'};
    const user=person(event,'from_broadcaster_user_name','from_broadcaster_user_login');
    return{...base,...user,viewers,incoming:true}}
 if(type==='channel.cheer'){const bits=requiredCount(event.bits);
    if(!bits)return{kind:'invalid-event',reason:'missing-bits'};
    const user=event.is_anonymous?{userId:'',name:'Anonymous supporter'}:person(event);
    return{...base,...user,bits:new Intl.NumberFormat().format(bits)}}
 const user=person(event);
  return{...base,...user,rewardTitle:cleanAlertText(event.reward?.title||'',240),rewardId:String(event.reward?.id||''),redemptionId:String(event.id||''),userInput:cleanAlertText(event.user_input||'',240),status:String(event.status||'')};
  
}

/** create event sub client.
 * @param {unknown} parameter1 Function input.
 * @param {unknown} clientId Function input.
 * @param {unknown} broadcasterId Function input.
 * @param {unknown} alerts Function input.
 * @param {unknown} chatPlay Function input.
 * @param {unknown} fetchImpl Function input.
 * @param {unknown} WebSocketImpl Function input.
 * @param {unknown} onEvent Function input.
 * @returns {unknown} The function result.
 */
export function createEventSubClient({token,clientId,broadcasterId,alerts,chatPlay,fetchImpl=globalThis.fetch,WebSocketImpl=globalThis.WebSocket,onEvent=()=>{},onStatus=()=>{},onAuthEnded=()=>{},timers=globalThis,random=Math.random}={}){
 let socket=null,stopped=false,watchdog=null,retryTimer=null,retryAttempt=0,migrating=false,activeSubscriptions=new Set();
  
 const status=(state,detail={})=>onStatus({state,...detail});
  
 const clearWatchdog=()=>{if(watchdog!==null){timers.clearTimeout(watchdog);
      watchdog=null}};
  
 const armWatchdog=seconds=>{clearWatchdog();
    watchdog=timers.setTimeout(()=>{status('retrying',{reason:'keepalive-timeout'});try{socket?.close()}catch{}},Math.max(5,seconds)*1000)};
  
 function scheduleReconnect(){if(stopped||retryTimer!==null)return;
    const delays=[1000,2000,4000,8000,30000],base=delays[Math.min(retryAttempt,delays.length-1)];
    retryAttempt++;
    const delay=Math.floor(base*(.8+random()*.4));
    status('retrying',{retryInMs:delay});
    retryTimer=timers.setTimeout(()=>{retryTimer=null;open('wss://eventsub.wss.twitch.tv/ws',false)},delay)}
 async function subscribe(sessionId){const desired=buildEventSubSubscriptions({broadcasterId,sessionId,alerts,chatPlay});
    activeSubscriptions.clear();
    let ready=0,unavailable=[];
    for(const item of desired){if(stopped)return;
      try{const response=await fetchImpl('https://api.twitch.tv/helix/eventsub/subscriptions',{method:'POST',headers:{'Client-Id':clientId,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(item.body)});
        if(response.status===401){onAuthEnded('unauthorized');
          stop();
          return}if(response.status===403){unavailable.push(item.type);
          continue}if(!response.ok){let body={};
          try{body=await response.json()}catch{}if(response.status===400&&/scope|permission|forbidden|not.*eligible/i.test(JSON.stringify(body))){unavailable.push(item.type);
            continue}unavailable.push(item.type);
          continue}const result=await response.json();
        if(result.data?.[0]?.status&&result.data[0].status!=='enabled'){unavailable.push(item.type);
          continue}ready++;
        activeSubscriptions.add(item.type)}catch{unavailable.push(item.type)}}status(ready?'ready':'unavailable',{ready,unavailable,active:[...activeSubscriptions]})}
 function open(url,migration){if(stopped)return;
    let target;
    try{target=new URL(url);
      if(target.protocol!=='wss:'||target.hostname!=='eventsub.wss.twitch.tv')throw Error('Invalid EventSub reconnect URL')}catch{scheduleReconnect();
      return}let next;
    try{next=new WebSocketImpl(target.href)}catch{scheduleReconnect();
      return}const prior=socket;
    socket=next;
    migrating=!!migration;
    next.onopen=()=>{retryAttempt=0;
      status('connecting')};
    next.onmessage=async ev=>{armWatchdog(keepaliveSeconds);
      const parsed=parseEventSubMessage(ev.data,{broadcasterId});
      if(parsed.kind==='welcome'){keepaliveSeconds=parsed.keepaliveSeconds;
        armWatchdog(keepaliveSeconds);
        status('connecting',{sessionId:parsed.sessionId});
        if(migrating){migrating=false;
          if(prior&&prior!==next)try{prior.close(1000,'Session migrated')}catch{}status(activeSubscriptions.size?'ready':'connecting',{active:[...activeSubscriptions]})}else await subscribe(parsed.sessionId)}else if(parsed.kind==='keepalive'){armWatchdog(keepaliveSeconds)}else if(parsed.kind==='reconnect'){open(parsed.url,true)}else if(parsed.kind==='revocation'){const reason=parsed.subscription.status||'revoked';
        activeSubscriptions.delete(parsed.subscription.type);
        status('revoked',{reason,type:parsed.subscription.type});
        if(/authorization_revoked|user_removed|version_removed/.test(reason)){onAuthEnded(reason);
          stop()}else if(activeSubscriptions.size===0)scheduleReconnect()}else if(parsed.kind==='notification')onEvent(parsed)};
    next.onerror=()=>{if(socket===next)scheduleReconnect()};
    next.onclose=()=>{if(socket===next&&!stopped){clearWatchdog();
        scheduleReconnect()}}}
 let keepaliveSeconds=10;
  
 function start(){if(!token||!broadcasterId){status('unavailable',{reason:'missing-authorization'});
      return api}stopped=false;
    open('wss://eventsub.wss.twitch.tv/ws',false);
    return api}
 function stop(){stopped=true;
    clearWatchdog();
    if(retryTimer!==null){timers.clearTimeout(retryTimer);
      retryTimer=null}activeSubscriptions.clear();
    const old=socket;
    socket=null;
    try{old?.close(1000,'Alerts stopped')}catch{}status('disconnected')}
 const api={start,stop,get ready(){return activeSubscriptions.size>0},get subscriptions(){return new Set(activeSubscriptions)}};
  return api;
  
}
