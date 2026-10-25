import {decodeSettings,normalizeSettings} from './settings.js';
import {applyChatStyle,removeChatMessage} from './render.js';
import {isFiltered} from './filters.js';
import {connectChat} from './chat.js';
import {layoutPanel} from './panel-layout.js';
import {fitPanelMessages} from './message-fit.js';
import {createCommunityChat} from './community-chat.js';
import {overlayTestMessages} from './overlay-test-messages.js';
import {parseAlertsFragment} from './alerts-config.js';
import {startAlertsOverlay} from './alerts-overlay.js';
import {decodePlaySource,parseChatPlayFragment,defaultChatPlay,normalizeChatPlay} from './chat-play.js';
import {createChatPlayRuntime} from './chat-play-runtime.js';
import {validateAlertsToken} from './alerts-auth.js';
import {createEventSubClient} from './eventsub.js';
import {TWITCH_CLIENT_ID} from './twitch-auth.js';

const urlHash=location.hash,alertLink=parseAlertsFragment(urlHash),playParams=new URLSearchParams(urlHash.replace(/^#/,'')),hasPrivatePlay=playParams.get('v')==='1'&&playParams.has('play')&&playParams.has('access_token');
let alertToken='';
if(hasPrivatePlay)history.replaceState(null,'',`${location.pathname}${location.search}`);
if(alertLink){alertToken=alertLink.token;history.replaceState(null,'',`${location.pathname}${location.search}`);document.querySelector('#skin-render-css').disabled=false;const css=document.createElement('link');css.rel='stylesheet';css.href='css/alerts-render.css';document.head.append(css)}
else document.querySelector('#skin-render-css').disabled=false;
if(alertLink){const data=await(await fetch('./design/skins.json')).json();const host=document.querySelector('#overlay-root');await startAlertsOverlay({host,token:alertToken,config:alertLink.config,design:data.alertDesign});}
else{
 const testMode=new URLSearchParams(location.search).get('test')==='1',host=document.querySelector('#overlay-root');host.dataset.overlayRoot='';let s=decodeSettings(hasPrivatePlay?urlHash:urlHash),payload=null,catalog=[],playSource=null;
 try{const encoded=hasPrivatePlay?playParams.get('play'):urlHash.slice(1),json=decodeURIComponent(escape(atob(encoded.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(encoded.length/4)*4,'='))));payload=JSON.parse(json)}catch{}
 if(payload?.chatSettings||payload?.baseSkinId||testMode||hasPrivatePlay){const data=await(await fetch('./design/skins.json')).json();catalog=data.skins;if(hasPrivatePlay){playSource=parseChatPlayFragment(urlHash,catalog);if(playSource)s=playSource.config.chatSettings;}else if(payload?.chatSettings){playSource=decodePlaySource(urlHash.slice(1),catalog);if(playSource)s=playSource.chatSettings;}else if(payload?.baseSkinId){const base=catalog.find(x=>x.id===payload.baseSkinId)?.settings;if(base){const merge=(a,b)=>a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)?Object.fromEntries(Object.keys(a).map(k=>[k,k in b?merge(a[k],b[k]):a[k]])):b===undefined?a:b;s=normalizeSettings(merge(base,payload.settings||{}));const raw=payload.settings||payload;if(!Object.prototype.hasOwnProperty.call(raw,'transparentBackground'))s.transparentBackground=false}}}
 const root=document.querySelector('#chat');applyChatStyle(root,s);let panelMax=layoutPanel(host,root,s),chatPlay=null;
 let rows=[],fitQueued=false,received=0,filtered=0,fitRemoved=0;
 const communityChat=createCommunityChat({getSettings:()=>chatPlay?.currentSettings||s,onUpdate:()=>{}});
 function queueFit(){if(fitQueued)return;fitQueued=true;requestAnimationFrame(()=>{fitQueued=false;fitRemoved+=fitPanelMessages(root,panelMax);rows=rows.filter(row=>row.isConnected)})}
 requestAnimationFrame(()=>{panelMax=layoutPanel(host,root,s);queueFit()});
 window.__chatskinsFitOk=()=>{const b=root.getBoundingClientRect(),v=host.getBoundingClientRect(),o=s.frame.outer.enabled?s.frame.outer.offset+s.frame.outer.width:0;return b.top>=v.top+s.edgeInset-1&&b.left>=v.left+s.edgeInset-1&&b.right<=v.right-s.edgeInset+1&&b.bottom<=v.bottom-s.edgeInset+1&&b.top-o>=v.top-1&&b.left-o>=v.left-1&&b.right+o<=v.right+1&&b.bottom+o<=v.bottom+1};
 window.__chatskinsStats=()=>{const b=root.getBoundingClientRect();return{messages:root.querySelectorAll(':scope > .message').length,received,filtered,fitRemoved,panelTop:b.top,panelBottom:b.bottom,viewportHeight:window.innerHeight}};
 const resize=()=>{panelMax=layoutPanel(host,root,s);requestAnimationFrame(()=>{panelMax=layoutPanel(host,root,s);queueFit()})};window.addEventListener('resize',resize);document.fonts?.ready.then(queueFit);
 if(catalog.length){const playConfig=playSource?.config||playSource,config=playConfig?.chatPlay?normalizeChatPlay(playConfig.chatPlay,playConfig.allowedSkins):defaultChatPlay();if(testMode&&!playSource)config.enabled=true;const skins=playConfig?.allowedSkins?.length?playConfig.allowedSkins:catalog;if(config.enabled||testMode){document.querySelector('#chat-play-css').disabled=false;chatPlay=createChatPlayRuntime({root,host,homeSettings:s,config,skins,getCommunity:()=>communityChat.map,onSettings:(next,{crossfade}={})=>{s=next;applyChatStyle(root,s);if(crossfade&&!s.reduceMotion){root.dataset.playTransition='true';root.addEventListener('animationend',()=>delete root.dataset.playTransition,{once:true})}panelMax=layoutPanel(host,root,s);queueFit()},onStatus:text=>{host.dataset.playStatus=text},preview:testMode});if(hasPrivatePlay){const token=playSource.token,validation=await validateAlertsToken(token);if(validation.valid&&validation.login===String(s.channel||'').toLowerCase()&&validation.scopes.includes('channel:read:redemptions')){const eventClient=createEventSubClient({token,clientId:TWITCH_CLIENT_ID,broadcasterId:validation.userId,alerts:{types:{}},chatPlay:config,onEvent:event=>{if(event.type==='redemption')chatPlay?.handleReward(event)},onStatus:info=>{if(info.state==='unavailable')host.dataset.playStatus='Channel points are unavailable. Check Twitch eligibility and access.'},onAuthEnded:()=>{host.dataset.playStatus='Channel points access ended. Reconnect and replace the private play link in OBS.'}});eventClient.start();window.addEventListener('pagehide',()=>eventClient.stop(),{once:true})}else host.dataset.playStatus='Channel points link is invalid or missing redemption access.'}}
 }
 function add(message,countReceived=true){if(countReceived&&!message.deleteMessageId&&!message.clearAll&&!message.clearUsername)received++;
  if(message.deleteMessageId){chatPlay?.removeMessage(message.deleteMessageId);const row=rows.find(x=>x.dataset.messageId===message.deleteMessageId);removeChatMessage(root,row);rows=rows.filter(x=>x!==row);return}
  if(message.clearAll||message.clearUsername){chatPlay?.clearMessages();for(const row of rows)if(message.clearAll||row.dataset.username?.toLowerCase()===message.clearUsername.toLowerCase())removeChatMessage(root,row);rows=rows.filter(x=>!message.clearAll&&x.dataset.username?.toLowerCase()!==message.clearUsername.toLowerCase());return}
  const commandEligible=!isFiltered(message,{...s,hideCommands:false});if(commandEligible)chatPlay?.handleMessage(message);
  if(isFiltered(message,s)){filtered++;return}
  chatPlay?.registerMessage(message);const row=communityChat.add(root,message);row.dataset.messageId=message.id||'';row.dataset.username=message.username||'';rows.push(row);queueFit();while(rows.length>s.maxMessages){const old=rows.shift();removeChatMessage(root,old)}queueFit();if(s.messageLifetime>0)setTimeout(()=>{row.classList.add('expired');setTimeout(()=>{removeChatMessage(root,row);chatPlay?.removeMessage(message.id);rows=rows.filter(x=>x!==row);queueFit()},(s.reduceMotion||s.animationOut==='none')?0:s.animationOutDuration)},s.messageLifetime*1000)
 }
 if(testMode){for(const message of overlayTestMessages)add(message,false)}else if(s.channel)connectChat(s.channel,add,undefined,{onRoomState:room=>{communityChat.onRoomState(room);chatPlay?.setRoomId(room.roomId)}});
 if(testMode&&chatPlay){chatPlay.simulate('!skin guild','everyone','Moss');setTimeout(()=>{chatPlay.resume();chatPlay.testEffect('rain',{username:'Moss',text:'Kappa',emotes:{'25':[[0,4]]}})},700)}
 window.addEventListener('pagehide',()=>{communityChat.stop();chatPlay?.stop()});
}
