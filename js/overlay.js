/**
 * Browser module overlay.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: module declarations.
 * Invariant: preserve existing settings links and render chat content as text.
 */
import {showAccessNotice} from './access-notice.js';

import {decodeSettings,normalizeSettings,CLEAN} from './settings.js';

import {applyChatStyle,removeChatMessage,applySkinMetadata} from './render.js';

import {isFiltered} from './filters.js';

import {connectChat} from './chat.js';

import {layoutPanel} from './panel-layout.js';

import {fitPanelMessages, pendingMessageAnimations} from './message-fit.js';

import {createCommunityChat} from './community-chat.js';

import {buildOverlayTestModel} from './overlay-test-messages.js';

import {parseAlertsFragment,decodeCompactAlertData} from './alerts-config.js';

import {startAlertsOverlay} from './alerts-overlay.js';

import {decodePlaySource,parseChatPlayFragment,decodeCompactPlayData,defaultChatPlay,normalizeChatPlay} from './chat-play.js';

import {decompressJson,applySettingsDiff} from './compact-link.js';

import {createChatPlayRuntime} from './chat-play-runtime.js';

import {validateAlertsToken} from './alerts-auth.js';

import {createEventSubClient} from './eventsub.js';

import {TWITCH_CLIENT_ID} from './twitch-auth.js';

import {attachFrameTemplate,mountIllustrated,resizeFrameTemplate,afterFrameTemplateReady} from './frame-templates.js';

import {decodeStudio} from './frame-studio.js';

import {mountStudioComposition} from './studio-render.js';


// Reuse the catalog for chat, alerts, and unified sources.
let catalogPromise;

const loadCatalog=()=>catalogPromise ||= fetch('./design/skins.json').then(response=>response.json());

function safePlayDecode(decode,fallback=null){
 try{return decode()}catch{return fallback}
}
const urlHash=location.hash,playParams=new URLSearchParams(urlHash.replace(/^#/,'')),compactPayload=playParams.get('v')==='2'?await decompressJson(playParams.get('data')).catch(()=>null):null,legacyAlertLink=parseAlertsFragment(urlHash),compactToken=playParams.get('access_token')||'',hasPrivatePlay=(playParams.get('v')==='1'&&playParams.has('play')&&playParams.has('access_token'))||(playParams.get('v')==='2'&&!!compactPayload?.p&&!!compactToken);
let alertLink=legacyAlertLink;

if(!alertLink&&playParams.get('v')==='2'&&compactPayload?.a&&compactToken&&!compactPayload.p){const data=await loadCatalog(),base=data.skins.find(item=>item.id===compactPayload.b)?.settings||{},chatSettings=applySettingsDiff(base,compactPayload.c||{});
  alertLink={token:compactToken,config:decodeCompactAlertData(compactPayload,data.alertDesign,chatSettings)};
  }
let alertToken='',activeSkin=null;

if(hasPrivatePlay)history.replaceState(null,'',`${location.pathname}${location.search}`);

if(alertLink){alertToken=alertLink.token;
  history.replaceState(null,'',`${location.pathname}${location.search}`);
  document.querySelector('#skin-render-css').disabled=false;
  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='css/alerts-render.css';
  document.head.append(css)}
else document.querySelector('#skin-render-css').disabled=false;

const webcamId=new URLSearchParams(location.search).get('webcam');
if(webcamId){document.querySelector('#skin-render-css').disabled=false;
  const raw=new URLSearchParams(location.hash.replace(/^#/,'')),typed={};
  for(const[key,value]of raw){typed[key]=['frameTint','frameSaturation','glowStrength','middleOpacity'].includes(key)?Number(value):value}const webcamSettings=normalizeSettings({...CLEAN,...typed,templateFrame:webcamId});
  const webcamRoot=document.querySelector('#chat'),frameData=await(await fetch('./site-media/frames/frames.json')).json();
  applyChatStyle(webcamRoot,webcamSettings);
  webcamRoot.classList.add('webcam-frame-only');
  await attachFrameTemplate(webcamRoot,webcamSettings,{manifest:frameData,kind:'webcam',skin:{frameTemplate:webcamId,plaque:{x:0,y:0,w:0,h:0}}});
  }
else if(alertLink&&!hasPrivatePlay){document.body.classList.add('alerts-only');
  const data=await loadCatalog();
  const host=document.querySelector('#overlay-root');
  await startAlertsOverlay({host,token:alertToken,config:alertLink.config,design:data.alertDesign});
  }
else{
 const query=new URLSearchParams(location.search),requestedSkin=query.get('skin'),testMode=query.get('test')==='1',host=document.querySelector('#overlay-root');
  host.dataset.overlayRoot='';
  let s=decodeSettings(urlHash),payload=null,catalog=[],playSource=null;
  
 try{const encoded=hasPrivatePlay?playParams.get('play'):urlHash.slice(1),json=decodeURIComponent(escape(atob(encoded.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(encoded.length/4)*4,'='))));
    payload=JSON.parse(json)}catch{}
 if(payload?.chatSettings||payload?.baseSkinId||testMode||hasPrivatePlay||compactPayload?.p||compactPayload?.c||requestedSkin){const data=await loadCatalog();
    catalog=data.skins;
    if(compactPayload?.p){s=normalizeSettings(applySettingsDiff(catalog.find(item=>item.id===compactPayload.b)?.settings||CLEAN,compactPayload.c||{}));
      const compactConfig=safePlayDecode(()=>decodeCompactPlayData(compactPayload,catalog));
      playSource=compactConfig?{token:compactToken,config:compactConfig}:null;
      if(compactConfig)s=compactConfig.chatSettings;
      }else if(compactPayload?.c){const compactBase=catalog.find(item=>item.id===compactPayload.b)?.settings||CLEAN;
      s=normalizeSettings(applySettingsDiff(compactBase,compactPayload.c));
      }else if(hasPrivatePlay){playSource=parseChatPlayFragment(urlHash,catalog);
      if(playSource)s=playSource.config.chatSettings;
      }else if(payload?.chatSettings){playSource=decodePlaySource(urlHash.slice(1),catalog);
      if(playSource)s=playSource.chatSettings;
      }else if(payload?.baseSkinId){const base=catalog.find(x=>x.id===payload.baseSkinId)?.settings;
      if(base){const merge=(a,b)=>a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)?Object.fromEntries(Object.keys(a).map(k=>[k,k in b?merge(a[k],b[k]):a[k]])):b===undefined?a:b;
        s=normalizeSettings(merge(base,payload.settings||{}));
        const raw=payload.settings||payload;
        if(!Object.prototype.hasOwnProperty.call(raw,'transparentBackground'))s.transparentBackground=false}}if(compactPayload?.a){const dataForAlerts=await loadCatalog();
      alertLink={token:compactToken,config:decodeCompactAlertData(compactPayload,dataForAlerts.alertDesign,s)};
      alertToken=compactToken;
      const css=document.createElement('link');
      css.rel='stylesheet';
      css.href='css/alerts-render.css';
      document.head.append(css)}const skin=catalog.find(x=>x.id===requestedSkin)||catalog.find(x=>x.id===payload?.baseSkinId)||catalog.find(x=>x.id===compactPayload?.b);
    if(skin){activeSkin=skin;
      if(testMode&&!urlHash)s=normalizeSettings(skin.settings);
      s=applySkinMetadata(s,skin)}}
 const root=document.querySelector('#chat');
  if(typeof s.studioDesign==='string')s.studioDesign=decodeStudio(s.studioDesign);
  if(s.studioDesign){try{window.__studioParts=(await(await fetch('./site-media/parts/parts.json')).json()).parts||[]}catch{window.__studioParts=[]}}applyChatStyle(root,s);
  let panelMax=0;
  await afterFrameTemplateReady(()=>attachFrameTemplate(root,s,{skin:activeSkin,layout:()=>{panelMax=layoutPanel(host,root,s)}}),()=>{panelMax=layoutPanel(host,root,s)});
  await mountIllustrated(root,s,activeSkin);
  await mountStudioComposition({root,draft:s.studioDesign,channel:s.channel});
  let chatPlay=null;
  
 let rows=[],pendingChatMessages=[],fitQueued=false,fitPaused=false,received=0,filtered=0,fitRemoved=0;
  
 const communityChat=createCommunityChat({getSettings:()=>chatPlay?.currentSettings||s,onUpdate:()=>{}});
  
 function queueFit(){
  if(fitPaused||(s.templateFrame||s.dreamPaintId)&&(!root._frameRect||!root._applyFrameWindow)||fitQueued)return;
    
  fitQueued=true;
    
  requestAnimationFrame(()=>{
   if(fitPaused){fitQueued=false;return}
   const entrances=pendingMessageAnimations(root);
   if(entrances.length){
    // Animation.finished resolves at the final keyframe (and rejects on cancel).
    // Recheck afterwards: another card may have arrived while we were waiting.
    Promise.allSettled(entrances.map(animation=>animation.finished)).then(()=>{fitQueued=false;queueFit()});
    return;
   }
   fitQueued=false;
   fitRemoved+=fitPanelMessages(root,panelMax);
  });
    
 }
 root.addEventListener('templatewindowready',()=>queueFit());
  requestAnimationFrame(()=>{panelMax=layoutPanel(host,root,s);resizeFrameTemplate(root,s.placement);queueFit()});
  
 window.__chatskinsFitOk=()=>{const b=root.getBoundingClientRect(),v=host.getBoundingClientRect(),o=s.frame.outer.enabled?s.frame.outer.offset+s.frame.outer.width:0;
    return b.top>=v.top+s.edgeInset-1&&b.left>=v.left+s.edgeInset-1&&b.right<=v.right-s.edgeInset+1&&b.bottom<=v.bottom-s.edgeInset+1&&b.top-o>=v.top-1&&b.left-o>=v.left-1&&b.right+o<=v.right+1&&b.bottom+o<=v.bottom+1};
  
 window.__chatskinsStats=()=>{const b=root.getBoundingClientRect();
    return{messages:root.querySelectorAll(':scope > .message').length,received,filtered,fitRemoved,panelTop:b.top,panelBottom:b.bottom,viewportHeight:window.innerHeight}};
  
 const resize=()=>{panelMax=layoutPanel(host,root,s);
    resizeFrameTemplate(root,s.placement);
    requestAnimationFrame(()=>{panelMax=layoutPanel(host,root,s);resizeFrameTemplate(root,s.placement);queueFit()})};
  window.addEventListener('resize',resize);
  document.fonts?.ready.then(queueFit);
  
 if(catalog.length){if(compactPayload?.p){const config=safePlayDecode(()=>decodeCompactPlayData(compactPayload,catalog));
      playSource=config?{token:compactToken,config}:null;
      if(config)s=config.chatSettings}else if(hasPrivatePlay){playSource=parseChatPlayFragment(urlHash,catalog);
      if(playSource)s=playSource.config.chatSettings}else if(payload?.chatSettings){playSource=decodePlaySource(urlHash.slice(1),catalog);
      if(playSource)s=playSource.chatSettings}const playConfig=playSource?.config||playSource,config=playConfig?.chatPlay?safePlayDecode(()=>normalizeChatPlay(playConfig.chatPlay,playConfig.allowedSkins),defaultChatPlay()):defaultChatPlay();
    if(testMode&&!playSource)config.enabled=true;
    const skins=playConfig?.allowedSkins?.length?playConfig.allowedSkins:catalog;
    if(config.enabled||testMode){document.querySelector('#chat-play-css').disabled=false;
      chatPlay=createChatPlayRuntime({root,host,homeSettings:s,config,skins,getCommunity:()=>communityChat.map,onSettings:async(next,{crossfade}={})=>{fitPaused=true;if(s.studioDesign)next.studioDesign=s.studioDesign;s=next;activeSkin=catalog.find(item=>item.id===s.baseSkinId)||catalog.find(item=>item.frameTemplate===s.templateFrame)||catalog.find(item=>item.illustration?.source===s.illustrationSource)||null;applyChatStyle(root,s);await afterFrameTemplateReady(()=>attachFrameTemplate(root,s,{skin:activeSkin,layout:()=>{panelMax=layoutPanel(host,root,s)}}),()=>{panelMax=layoutPanel(host,root,s);resizeFrameTemplate(root,s.placement)});await mountIllustrated(root,s,activeSkin);await mountStudioComposition({root,draft:s.studioDesign,channel:s.channel});if(crossfade&&!s.reduceMotion){root.dataset.playTransition='true';root.addEventListener('animationend',()=>delete root.dataset.playTransition,{once:true})}},onAfterRender:()=>{panelMax=layoutPanel(host,root,s);resizeFrameTemplate(root,s.placement);fitPaused=false;for(const [message,countReceived] of pendingChatMessages.splice(0))add(message,countReceived);queueFit()},onStatus:text=>{host.dataset.playStatus=text},onMessageRendered:(message,node)=>{const record=rows.find(item=>item.message===message||(message.id&&item.message.id===message.id));if(record)record.row=node},preview:testMode});
      if(hasPrivatePlay&&playSource?.token){const token=playSource.token,validation=await validateAlertsToken(token);
        if(validation.valid&&validation.login===String(s.channel||'').toLowerCase()&&validation.scopes.includes('channel:read:redemptions')){const eventClient=createEventSubClient({token,clientId:TWITCH_CLIENT_ID,broadcasterId:validation.userId,alerts:{types:{}},chatPlay:config,onEvent:event=>{if(event.type==='redemption')chatPlay?.handleReward(event)},onStatus:info=>{if(info.state==='unavailable')showAccessNotice(host,'Channel points are unavailable. Check Twitch eligibility and access.')},onAuthEnded:()=>{showAccessNotice(host,'Twitch access ended — reconnect and copy a new link in the editor.')}});
          eventClient.start();
          
 const accessTimer=setTimeout(()=>{
  eventClient.stop();
  showAccessNotice(host,'Twitch access ended — reconnect and copy a new link in the editor.');
 },Math.max(0,validation.expiresIn*1000));
          
 window.addEventListener('pagehide',()=>{clearTimeout(accessTimer);eventClient.stop()},{once:true})}else showAccessNotice(host,'Channel points access is invalid — reconnect and copy a new link in the editor.')}}
 }
 function add(message,countReceived=true){message.id ||= `local-${Date.now()}-${Math.random()}`;
    if(fitPaused){pendingChatMessages.push([message,countReceived]);
      return}if(countReceived&&!message.deleteMessageId&&!message.clearAll&&!message.clearUsername)received++;
    
  if(message.deleteMessageId){chatPlay?.removeMessage(message.deleteMessageId);
      const record=rows.find(x=>x.message.id===message.deleteMessageId);
      if(record){clearTimeout(record.expiryTimer);
        removeChatMessage(root,record.row)}rows=rows.filter(x=>x!==record);
      return}
  if(message.clearAll||message.clearUsername){chatPlay?.clearMessages();
      for(const record of rows)if(message.clearAll||record.row?.dataset.username?.toLowerCase()===message.clearUsername.toLowerCase()){clearTimeout(record.expiryTimer);
        removeChatMessage(root,record.row)}rows=rows.filter(x=>!message.clearAll&&x.row?.dataset.username?.toLowerCase()!==message.clearUsername.toLowerCase());
      return}
  const commandEligible=countReceived&&!isFiltered(message,{...s,hideCommands:false});
    if(commandEligible)chatPlay?.handleMessage(message);
    
  if(countReceived&&isFiltered(message,s)){filtered++;
      return}
  chatPlay?.registerMessage(message);
    const row=communityChat.add(root,message),record={message,row,expiryTimer:null};
    row.dataset.messageId=message.id||'';
    row.dataset.username=message.username||'';
    rows.push(record);
    queueFit();
    while(rows.length>s.maxMessages){const old=rows.shift();
      clearTimeout(old.expiryTimer);
      removeChatMessage(root,old.row);
      chatPlay?.removeMessage(old.message.id)}queueFit();
    if(s.messageLifetime>0)record.expiryTimer=setTimeout(()=>{record.row?.classList.add('expired');setTimeout(()=>{removeChatMessage(root,record.row);chatPlay?.removeMessage(message.id);rows=rows.filter(x=>x!==record);queueFit()},(s.reduceMotion||s.animationOut==='none')?0:s.animationOutDuration)},s.messageLifetime*1000)
 }
 if(testMode){for(const message of buildOverlayTestModel(s))add(message,false)}else if(s.channel)connectChat(s.channel,add,undefined,{onRoomState:room=>{communityChat.onRoomState(room);chatPlay?.setRoomId(room.roomId)}});
  
 if(alertLink&&hasPrivatePlay){const data=await loadCatalog();
    await startAlertsOverlay({host,token:alertToken,config:alertLink.config,design:data.alertDesign});
    }
 if(testMode&&query.get('play')==='1'&&chatPlay){chatPlay.simulate('!skin guild','everyone','Moss');
    setTimeout(()=>{chatPlay.resume();chatPlay.testEffect('rain',{username:'Moss',text:'Kappa',emotes:{'25':[[0,4]]}})},700)}
 window.addEventListener('pagehide',()=>{communityChat.stop();chatPlay?.stop()});
  
}
