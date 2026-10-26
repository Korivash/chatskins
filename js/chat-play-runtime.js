/**
 * Browser module chat-play-runtime.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: playSkinSettings, renderMessageModelsInPlace, createChatPlayRuntime.
 * Invariant: preserve existing settings links and render chat content as text.
 */
import {createChatPlayAdmission,createChatPlayCooldowns,tallyVotes,isAllowedSkin,resolveAllowedSkin,matchRewardTitle,makePlayBanner,normalizeChatPlay,parseChatPlayCommand} from './chat-play.js';

import {applyChatStyle,createMessage,messageListTarget} from './render.js';

import {resolveEmotes} from './emotes.js';

import {isFiltered} from './filters.js';


const safeText=(value,max=240)=>{const text=String(value||'').replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g,'');
  try{return[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(text)].slice(0,max).map(x=>x.segment).join('')}catch{return[...text].slice(0,max).join('')}};

/** play skin settings.
 * @param {unknown} home Function input.
 * @param {unknown} preset Function input.
 * @returns {unknown} The function result.
 */
export function playSkinSettings(home,preset){const out=structuredClone(home);
  out.templateFrame=preset.templateFrame||'';
  out.illustrationSource=preset.illustrationSource||'';
  out.illustrationSurface=preset.illustrationSurface||'#10141D';
  if(preset.round10Recipe)out.round10Recipe=preset.round10Recipe;
  if(preset.silhouette)out.silhouette=preset.silhouette;
  for(const key of ['parts','frame','backgrounds','nameTemplate','channels','presentation','templateFrame','templateMessageStyle','templateTitle','templateSubtitle','frameColor','frameTint','frameSaturation','glowColor','glowStrength','glowAnimation','middleBackground','middleColor','middleImage','middleOpacity','templateFont','templateTextColor','templateNameMode','illustration','illustrationSource','illustrationSurface','nameStyle','borderEffect','borderEffectSpeed','nameEffect','textEffect','emphasis','effectColors','roleColorsEnabled','broadcasterNameColor','modNameColor','vipNameColor','subNameColor'])if(preset[key]!==undefined)out[key]=structuredClone(preset[key]);
  out.channel=home.channel;
  out.transparentBackground=home.transparentBackground;
  out.hideFrames=home.hideFrames;
  out.hideCommands=home.hideCommands;
  out.hideBots=home.hideBots;
  out.botNames=structuredClone(home.botNames);
  out.hideLinks=home.hideLinks;
  out.emotes=structuredClone(home.emotes);
  out.maxMessages=home.maxMessages;
  out.messageLifetime=home.messageLifetime;
  out.overlayWidth=home.overlayWidth;
  out.edgeInset=home.edgeInset;
  out.direction=home.direction;
  out.alignment=home.alignment;
  out.messageSpacing=home.messageSpacing;
  out.reduceMotion=home.reduceMotion;
  out.customCSS={enabled:false,source:''};
  return out}
// A message object remains stable across skin changes, unlike an optional IRC id.
const renderedMessages = new WeakMap();

/** Replace each retained model's row without collapsing messages with missing ids. */
export function renderMessageModelsInPlace(root,items,settings,renderMessage=createMessage,community=new Map(),onMessageRendered=()=>{},now=()=>performance.now(),lifetime=settings?.messageLifetime||0){
 if(!root)return;
  
 const expires=Number(lifetime)>0?Number(lifetime)*1000:0;
  
 const live=items.filter(item=>!item.deleted&&(!expires||now()-item.createdAt<expires));
  
 const target=messageListTarget(root);
 const existing=[...target.children].filter(node=>node.classList?.contains('message'));
  
 const claimed=new Set();
  
 for(const item of live){
  const message=item.message;
    
  const previous=renderedMessages.get(message)||item.row||existing.find(node=>!claimed.has(node)&&message.id&&node.dataset.messageId===message.id);
    
  if(previous)claimed.add(previous);
    
  const node=renderMessage(message,settings,community);
    
  node.dataset.messageId=message.id||'';
    
  node.dataset.username=message.username||'';
    
  node.dataset.createdAt=String(item.createdAt);
    
  if(previous && existing.includes(previous)){
   if(previous.classList?.contains('expired'))node.classList.add('expired');
      
   previous.replaceWith(node);
      
  }else target.append(node);
    
  item.row=node;
    
  renderedMessages.set(message,node);
    
  onMessageRendered(message,node);
    
 }
 for(const node of existing)if(!claimed.has(node))node.remove();
  
}
/** create chat play runtime.
 * @param {unknown} parameter1 Function input.
 * @param {unknown} host Function input.
 * @param {unknown} homeSettings Function input.
 * @param {unknown} config Function input.
 * @param {unknown} skins Function input.
 * @param {unknown} parameter6 Function input.
 * @param {unknown} storage Function input.
 * @param {unknown} now Function input.
 * @returns {unknown} The function result.
 */
export function createChatPlayRuntime({root,host,homeSettings,config,skins,document:doc=globalThis.document,storage=globalThis.localStorage,now=()=>performance.now(),timers=globalThis,rng=Math.random,getCommunity=()=>new Map(),onSettings=()=>{},onAfterRender=()=>{},onStatus=()=>{},onMessageRendered=()=>{},renderMessage=createMessage,applyStyle=applyChatStyle,preview=false}={}){
 let current=homeSettings,home=homeSettings,roomId=homeSettings.channelId||'',frozen=false,active='',activeUntil=0,activeTimer=null,vote=null,transientTimer=null,chaosTimer=null,bannerTimer=null,closed=false,seenRewards=new Map(),skinChangePromise=Promise.resolve();
  const rows=[];
  const sourceKey=`chat-studio.chat-play.frozen.${homeSettings.channel||'no-channel'}`;
  try{frozen=!preview&&storage?.getItem(sourceKey)==='1'}catch{}
 const showStatus=message=>{onStatus(message);
    if(!preview&&host){host.dataset.playState=message.includes('Frozen')?'frozen':message.includes('busy')?'busy':''}};
  
 const removeBanner=()=>{host?.querySelectorAll('.play-banner').forEach(node=>node.remove());
    clearTimeout(bannerTimer)};
  
 const banner=text=>{if(!config.feedback.banner||!host)return;
    removeBanner();
    const node=makePlayBanner(doc,text);
    node.style.setProperty('--play-frame',current.frame?.paint?.color||'#38BDF8');
    node.style.setProperty('--play-ink',current.parts?.messageText?.paint?.color||'#F3F7FF');
    host.append(node);
    bannerTimer=timers.setTimeout(removeBanner,4000)};
  
 const clearTransient=()=>{clearTimeout(transientTimer);
    transientTimer=null;
    clearTimeout(chaosTimer);
    chaosTimer=null;
    host?.querySelectorAll('.play-rain,.play-spotlight,.play-vote-panel,.play-flash').forEach(node=>node.remove());
    removeBanner()};
  
 const change=(skin,{credit='',holdSeconds=60}={})=>{if(!isAllowedSkin(skin?.id,config,skins))return false;
    const next=playSkinSettings(home,{...skin.settings,round10Recipe:skin.round10Recipe?{...skin.round10Recipe,id:skin.id}:null,silhouette:skin.silhouette,templateMessageStyle:skin.messageStyle||'',illustrationSource:skin.illustration?.source||'',illustrationSurface:skin.illustration?.surface||'#10141D'});
    if(skin.id===active)return false;
    current=next;
    active=skin.id;
    skinChangePromise=(async()=>{await onSettings(current,{crossfade:!reduced()});applyStyle(root,current);rerender();onAfterRender(current);banner(credit||`${skin.name} is the new look`);if(holdSeconds>0){activeUntil=now()+holdSeconds*1000;clearTimeout(activeTimer);activeTimer=timers.setTimeout(()=>restoreHome(),holdSeconds*1000+300)}})();
    return true};
  
 const reduced=()=>config.reduceMotion||current.reduceMotion||doc?.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  
 const rerender=()=>{const ttl=Number(home.messageLifetime)>0?Number(home.messageLifetime)*1000:0,at=now();
    for(let i=rows.length-1;i>=0;i--)if(rows[i].deleted||(ttl&&at-rows[i].createdAt>=ttl))rows.splice(i,1);
    renderMessageModelsInPlace(root,rows,current,renderMessage,getCommunity(),onMessageRendered,now,home.messageLifetime)};
  
 const restoreHome=()=>{clearTimeout(activeTimer);
    activeTimer=null;
    activeUntil=0;
    active='';
    current=home;
    skinChangePromise=(async()=>{await onSettings(home,{crossfade:!reduced()});applyStyle(root,home);rerender();onAfterRender(home);clearTransient();showStatus(frozen?`Frozen on ${home.label||'home'}. Commands and rewards are paused.`:'Ready for the next viewer.')})();
    return skinChangePromise};
  
 const stopVote=()=>{clearInterval(vote?.ticker);
    clearTimeout(vote?.timer);
    vote=null;
    host?.querySelector('.play-vote-panel')?.remove()};
  
 const acceptReset=()=>{stopVote();
    restoreHome();
    showStatus(frozen?'Frozen on home. Commands and rewards are paused.':'Back on the home skin.')};
  
 const candidates=()=>config.allowedSkinIds.map(id=>skins.find(s=>s.id===id)).filter(Boolean);
  
 const drawVote=()=>{if(!vote||!host)return;
    let panel=host.querySelector('.play-vote-panel');
    if(!panel){panel=doc.createElement('section');
      panel.className='play-vote-panel';
      panel.setAttribute('aria-label','Chat skin vote');
      host.append(panel)}panel.replaceChildren();
    panel.style.setProperty('--play-frame',current.frame?.paint?.color||'#38BDF8');
    panel.style.setProperty('--play-ink',current.parts?.messageText?.paint?.color||'#F3F7FF');
    const heading=doc.createElement('strong');
    heading.textContent='Vote for the next look';
    panel.append(heading);
    vote.choices.forEach((skin,index)=>{const count=[...vote.ballots.values()].filter(n=>n===index).length,button=doc.createElement('div');button.className='play-vote-option';const label=doc.createElement('span');label.textContent=`${index+1} · ${skin.name}`;const score=doc.createElement('b');score.textContent=String(count);const bar=doc.createElement('i');bar.style.width=`${vote.ballots.size?count/vote.ballots.size*100:0}%`;button.append(label,score,bar);panel.append(button)});
    const remaining=Math.max(0,Math.ceil((vote.deadline-now())/1000)),foot=doc.createElement('small');
    foot.textContent=`Type 1, 2 or 3 in chat · ${remaining}s left`;
    panel.append(foot);
    if(config.feedback.countdown)showStatus(`Vote open · ${remaining}s left`)};
  
 const finishVote=()=>{if(!vote)return;
    const running=vote,result=tallyVotes(running.choices,running.ballots,rng),chosen=result.winner===null?null:running.choices[result.winner];
    stopVote();
    if(!chosen){restoreHome();
      banner(`No votes this time · keeping ${home.label||'home'}`);
      return}change(chosen,{credit:`Chat chose ${chosen.name} · ${result.max} ${result.max===1?'vote':'votes'}`,holdSeconds:0});
    showStatus(`Chat chose ${chosen.name} · Back home in 2:00`);
    activeTimer=timers.setTimeout(()=>restoreHome(),120000)};
  
 const startVote=()=>{if(vote||candidates().length<3)return false;
    const pool=[...candidates()];
    const choices=[];
    while(choices.length<3&&pool.length){const index=Math.min(pool.length-1,Math.floor(rng()*pool.length));
      choices.push(pool.splice(index,1)[0])}vote={choices,ballots:new Map(),messageIds:new Map(),deadline:now()+45000,timer:timers.setTimeout(finishVote,45000),ticker:timers.setInterval(drawVote,1000)};
    drawVote();
    return true};
  
 const recordBallot=(choice,message)=>{if(!vote||now()>vote.deadline)return false;
    const key=String(message.userId||message.login||'');
    if(!key||vote.ballots.size>=10000&&!vote.ballots.has(key))return false;
    const old=vote.ballots.get(key);
    if(old===choice)return true;
    vote.ballots.set(key,choice);
    vote.messageIds.set(key,message.id||'');
    drawVote();
    return true};
  
 const startRain=(message,text=message.text,community=getCommunity())=>{const available=resolveEmotes(text,message.emotes||{},community),images=available.filter(x=>x.type==='emote'&&typeof x.url==='string'&&!!x.url.trim()&&x.url!=='undefined').slice(0,6);
    if(!host||!images.length){banner(`${safeText(message.username,50)} sent an emote rain`);
      showStatus('No supported emotes found. Try a channel emote code.');
      return false}host.querySelector('.play-rain')?.remove();
    const layer=doc.createElement('div');
    layer.className='play-rain';
    layer.setAttribute('aria-hidden','true');
    const pool=images.slice(0,6);
    if(reduced()){for(const item of pool){const img=doc.createElement('img');
        img.alt='';
        img.src=item.url;
        layer.append(img)}}else for(let i=0;i<Math.min(18,pool.length*3);i++){const item=pool[i%pool.length],img=doc.createElement('img');
      img.alt='';
      img.src=item.url;
      img.style.setProperty('--x',`${(i*23+7)%88}%`);
      img.style.setProperty('--delay',`${i*.18}s`);
      img.style.setProperty('--duration','3.5s');
      layer.append(img)}host.append(layer);
    banner(`${safeText(message.username,50)} sent an emote rain`);
    transientTimer=timers.setTimeout(()=>layer.remove(),6000);
    return true};
  
 const playEffect=(effect,message={},options={})=>{if(frozen||!config.enabled||!config.effects[effect]?.enabled||((active||vote)&&!options.test))return false;
    if(effect==='swap'){const skin=isAllowedSkin(message.skinId,config,skins)?skins.find(s=>s.id===message.skinId):candidates()[0];
      return skin?change(skin,{credit:`${safeText(message.username||'A viewer',50)} switched the chat to ${skin.name}`,holdSeconds:config.effects.swap.holdSeconds}):false}if(effect==='rain')return startRain(message,message.text||'',options.community||getCommunity());
    if(effect==='flash'){if(!current.hideFrames&&current.frame.style!=='none'){const flash=doc.createElement('span');
        flash.className=`play-flash${reduced()?' is-static':''}`;
        flash.style.setProperty('--frame-color',current.frame?.paint?.color||'#38BDF8');
        flash.setAttribute('aria-hidden','true');
        host.append(flash);
        transientTimer=timers.setTimeout(()=>flash.remove(),1800)}return true}if(effect==='spotlight'){if(isFiltered(message,home))return false;
      const card=doc.createElement('section');
      card.className='play-spotlight';
      card.setAttribute('aria-label','Spotlight message');
      const name=doc.createElement('strong'),body=doc.createElement('p');
      name.textContent=safeText(message.username||'Viewer',50);
      body.textContent=safeText(message.text,240);
      card.append(name,body);
      host.append(card);
      transientTimer=timers.setTimeout(()=>card.remove(),10000);
      return true}if(effect==='chaos'){const pool=candidates();
      if(pool.length<2)return false;
      let last=active,step=0;
      const first=isAllowedSkin(message.skinId,config,skins)?skins.find(s=>s.id===message.skinId):null;
      const choose=()=>{if(frozen||closed)return;
        const choices=pool.filter(s=>s.id!==last),skin=step===0&&first?first:choices[Math.min(choices.length-1,Math.floor(rng()*choices.length))];
        if(!skin)return;
        last=skin.id;
        change(skin,{credit:`${safeText(message.username||'A viewer',50)} started chaos`,holdSeconds:0});
        step++;
        if(step<5)chaosTimer=timers.setTimeout(choose,8000);
        else chaosTimer=timers.setTimeout(restoreHome,8000)};
      choose();
      return true}return false};
  
 const cooldowns=createChatPlayCooldowns({now}),admissionOptions={config,skins,cooldowns,roomId,isVoteActive:()=>!!vote,onSwap:(skin,message)=>change(skin,{credit:`${safeText(message.username,50)} switched the chat to ${skin.name}`,holdSeconds:config.effects.swap.holdSeconds}),onVote:startVote,onBallot:recordBallot,onReset:acceptReset,onStatus:showStatus},admission=createChatPlayAdmission(admissionOptions),previewAdmission=createChatPlayAdmission({...admissionOptions,bypassCooldowns:true});
  
 const shortcut=event=>{if(!event.ctrlKey||!event.shiftKey)return;
    if(event.key.toLowerCase()==='f'){event.preventDefault();
      api.freeze()}else if(event.key.toLowerCase()==='r'){event.preventDefault();
      api.resume()}};
  if(!preview)doc?.addEventListener?.('keydown',shortcut);
  
 const rewardUsers=new Map();
  let rewardGlobalUntil=0;
  
 const api={
  handleMessage(message){if(frozen)return{accepted:false,reason:'frozen'};
      if(message.sourceRoomId&&roomId&&String(message.sourceRoomId)!==String(roomId))return{accepted:false,reason:'wrong-room'};
      const parsed=parseChatPlayCommand(message.text);
      if((active||vote)&&['swap','vote'].includes(parsed.type))return{accepted:false,reason:'busy'};
      return admission.handle(message)},
  registerMessage(message){rows.push({message,createdAt:now()});
      while(rows.length>home.maxMessages)rows.shift()},
  syncMessages(messages){rows.length=0;
      for(const message of messages.slice(-home.maxMessages))rows.push({message,createdAt:now()})},
  removeMessage(id){for(const item of rows)if(item.message.id===id)item.deleted=true;
      if(vote)for(const[key,messageId]of vote.messageIds)if(messageId===id){vote.ballots.delete(key);
        vote.messageIds.delete(key)}if(vote)drawVote()},
  clearMessages(){rows.length=0;
      stopVote();
      if(host?.querySelector('.play-spotlight')){clearTimeout(transientTimer);
        host.querySelector('.play-spotlight').remove()}},
  connectionLost(){stopVote();
      if(active)restoreHome();
      clearTransient();
      showStatus('Chat disconnected. Skin commands, votes and effects are paused.')},
  playEffect,
  simulate(raw='!skin guild',role='everyone',username='Moss'){const message={username,login:username.toLowerCase().replace(/[^a-z0-9_]/g,''),userId:'preview-'+username,text:raw,badges:role==='broadcaster'?{broadcaster:'1'}:role==='mod'?{moderator:'1'}:role==='vip'?{vip:'1'}:role==='sub'?{subscriber:'1'}:{},id:'preview-'+Date.now()};
      const previous=config.enabled;
      config.enabled=true;
      try{return previewAdmission.handle(message)}finally{config.enabled=previous}},
  testEffect(effect,message={}){const previous=config.enabled,previousEffect=config.effects[effect]?.enabled;
      config.enabled=true;
      if(config.effects[effect])config.effects[effect].enabled=true;
      const sample=effect==='rain'?{...message,text:'Kappa catKISS',emotes:{'25':[[0,4]]}}:message,community=effect==='rain'?new Map(getCommunity()):null;
      if(community&&!community.has('catKISS'))community.set('catKISS',{provider:'7tv',id:'preview-catkiss',url:'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 rx=%2214%22 fill=%22%238cece0%22/%3E%3Ctext x=%2232%22 y=%2246%22 text-anchor=%22middle%22 font-size=%2242%22%3E%E2%9C%A6%3C/text%3E%3C/svg%3E'});
      try{return playEffect(effect,sample,{test:true,community:community||undefined})}finally{config.enabled=previous;
        if(config.effects[effect])config.effects[effect].enabled=previousEffect}},
  setRoomId(id){roomId=String(id||'')},
  updateConfig(value){const next=normalizeChatPlay(value,skins);
      for(const key of Object.keys(config))delete config[key];
      Object.assign(config,next);
      if(!config.enabled)acceptReset()},
  freeze(){frozen=true;
      acceptReset();
      if(!preview)try{storage?.setItem(sourceKey,'1')}catch{showStatus('Freeze could not be saved. Disable or replace the OBS source to keep it stopped.')}showStatus('Frozen on home. Commands and rewards are paused.')},
  resume(){frozen=false;
      if(!preview)try{storage?.removeItem(sourceKey)}catch{}restoreHome()},
  setHome(settings,label='home'){if(active||vote)acceptReset();
      home=structuredClone(settings);
      home.label=label;
      current=home;
      skinChangePromise=(async()=>{await onSettings(home);applyStyle(root,home);rerender();onAfterRender(home)})();
      return skinChangePromise},
  handleReward(event){const t=Date.now();
      for(const[k,time]of rewardUsers)if(t-time>config.points.userCooldownSeconds*1000)rewardUsers.delete(k);
      if(!event||event.status==='canceled'||seenRewards.has(event.messageId)||seenRewards.has(event.redemptionId))return{accepted:false,reason:'duplicate-or-canceled'};
      const key=String(event.userId||event.name||'');
      if(t-rewardGlobalUntil<config.points.globalCooldownSeconds*1000||t-(rewardUsers.get(key)||0)<config.points.userCooldownSeconds*1000)return{accepted:false,reason:'reward-cooldown'};
      seenRewards.set(event.messageId||event.redemptionId,t);
      if(seenRewards.size>10000)seenRewards.delete(seenRewards.keys().next().value);
      const reward=config.points.rewards.find(item=>item.enabled&&item.id&&item.id===event.rewardId)||matchRewardTitle(event.rewardTitle,config.points.rewards);
      if(!reward||!config.enabled||!config.points.enabled||!config.effects[reward.effect]?.enabled||frozen)return{accepted:false,reason:'unmatched-or-disabled'};
      rewardGlobalUntil=t;
      rewardUsers.set(key,t);
      return api.playEffect(reward.effect,{username:event.name,text:event.userInput||'',skinId:reward.effect==='swap'?resolveAllowedSkin(event.userInput,config,skins)?.id:undefined})},
  stop(){closed=true;
      doc?.removeEventListener?.('keydown',shortcut);
      clearTimeout(activeTimer);
      clearTimeout(transientTimer);
      clearTimeout(chaosTimer);
      clearInterval(vote?.ticker);
      clearTimeout(vote?.timer);
      clearTimeout(bannerTimer);
      removeBanner();
      host?.querySelectorAll('.play-vote-panel,.play-rain,.play-flash,.play-spotlight').forEach(node=>node.remove())},
  whenSkinSettled(){return skinChangePromise},messageModels(){return rows.filter(item=>!item.deleted)},get frozen(){return frozen},get currentSettings(){return current},get status(){return active},get activeVote(){return vote}
 };
  if(frozen){stopVote();
    restoreHome();
    showStatus('Frozen on home. Commands and rewards are paused.')}return api;
  
}
