/**
 * Browser module chat-play-points.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: createRewardRequestBody, isCreateRewardsReturn, runInitialRewardSetup, createChatPlayRewards, enableExistingChatPlayRewards.
 * Invariant: preserve existing settings links and render chat content as text.
 */
import {TWITCH_CLIENT_ID} from './twitch-auth.js';


export const CHAT_PLAY_POINT_SCOPE='channel:manage:redemptions';

export const CHAT_PLAY_READ_SCOPE='channel:read:redemptions';

export const CHAT_PLAY_POINT_SCOPES=Object.freeze([CHAT_PLAY_READ_SCOPE,CHAT_PLAY_POINT_SCOPE]);

export const CHAT_PLAY_REWARD_DRAFTS=[
 {effect:'swap',title:'ChatSkins: Swap skin',cost:500,prompt:'Choose an allowed skin name. It shows for 60 seconds.',required:true,cooldown:60},
 {effect:'rain',title:'ChatSkins: Emote rain',cost:250,prompt:'Enter emote codes from this channel, separated by spaces.',required:true,cooldown:60},
 {effect:'chaos',title:'ChatSkins: Chaos mode',cost:1000,prompt:'Optionally choose an allowed starting skin.',required:false,cooldown:180},
 {effect:'flash',title:'ChatSkins: Frame flash',cost:100,prompt:'Pulse the chat frame accent.',required:false,cooldown:60},
 {effect:'spotlight',title:'ChatSkins: Spotlight',cost:500,prompt:'Write a message to feature in chat.',required:true,cooldown:60}
];


/** create reward request body.
 * @param {unknown} draft Function input.
 * @param {unknown} parameter2 Function input.
 * @returns {unknown} The function result.
 */
export function createRewardRequestBody(draft,{enabled=true}={}){
 return {title:String(draft.title||'').trim().slice(0,45),prompt:String(draft.prompt||'').slice(0,200),cost:Math.max(1,Math.min(1000000,Math.round(Number(draft.cost)||1))),is_enabled:!!enabled,is_user_input_required:!!draft.required,should_redemptions_skip_request_queue:false,global_cooldown_seconds:Math.max(60,Math.min(604800,Math.round(Number(draft.cooldown)||60)))};
  
}

/** is create rewards return.
 * @param {unknown} auth Function input.
 * @returns {unknown} The function result.
 */
export function isCreateRewardsReturn(auth){return !!auth?.handled&&!!auth?.token&&(auth.action==='create-chat-play-rewards'||auth.action==='round11-setup'&&auth.createRewards===true)}
/** run initial reward setup.
 * @param {unknown} auth Function input.
 * @param {unknown} createRewards Function input.
 * @returns {unknown} The function result.
 */
export function runInitialRewardSetup(auth,createRewards){return isCreateRewardsReturn(auth)?Promise.resolve().then(createRewards):Promise.resolve(null)}

function rewardUrl(broadcasterId,id=''){
 const url=new URL('https://api.twitch.tv/helix/channel_points/custom_rewards');
  
 url.searchParams.set('broadcaster_id',String(broadcasterId));
  
 url.searchParams.set('only_manageable_rewards','true');
  
 if(id)url.searchParams.set('id',String(id));
  
 return url.href;
  
}
const headersFor=token=>({'Client-Id':TWITCH_CLIENT_ID,Authorization:`Bearer ${token}`,'Content-Type':'application/json'});

function failure(error,extra={}){return{ok:false,error,...extra}}

/** create chat play rewards.
 * @param {unknown} parameter1 Function input.
 * @param {unknown} broadcasterId Function input.
 * @param {unknown} rewards Function input.
 * @param {unknown} enabled Function input.
 * @param {unknown} fetchImpl Function input.
 * @returns {unknown} The function result.
 */
export async function createChatPlayRewards({token,broadcasterId,rewards=CHAT_PLAY_REWARD_DRAFTS,enabled=true,fetchImpl=globalThis.fetch}={}){
 if(!token||!broadcasterId)return failure('Connect the channel owner account first.');
  
 const headers=headersFor(token),url=rewardUrl(broadcasterId);
  
 try{
  const existingResponse=await fetchImpl(url,{headers});
    
  if(existingResponse.status===401)return failure('Twitch access expired. Reconnect channel points.');
    
  if(existingResponse.status===403)return failure('Channel-point rewards need an Affiliate or Partner channel. Chat commands and alerts are still ready.');
    
  if(!existingResponse.ok)return failure('Could not check existing channel-point rewards.');
    
  const existing=(await existingResponse.json()).data||[],created=[],reused=[],disabledExisting=[];
    
  const requestedTitles=[...new Set(rewards.map(reward=>reward.title))];
    
  const toCreate=requestedTitles.filter(title=>!existing.some(item=>item.title===title));
    
  if(existing.length+toCreate.length>50)return failure('Twitch allows at most 50 custom rewards. Remove a reward in Twitch before creating more.');
    
  for(const reward of rewards){
   const match=[...existing,...created].find(item=>item.title===reward.title);
      
   if(match){const item={effect:reward.effect,id:match.id,title:match.title,isEnabled:match.is_enabled!==false};
        reused.push(item);
        if(!item.isEnabled)disabledExisting.push(item);
        continue}
   const response=await fetchImpl(url,{method:'POST',headers,body:JSON.stringify(createRewardRequestBody(reward,{enabled}))});
      
   if(response.status===401)return failure('Twitch access expired. Reconnect channel points.',{created,reused,disabledExisting});
      
   if(response.status===403)return failure('Channel-point rewards need an Affiliate or Partner channel. Chat commands and alerts are still ready.',{created,reused,disabledExisting});
      
   if(!response.ok)return failure(`Could not create ${reward.title}. ${created.length} rewards were created; retry to reuse those and create the rest.`,{created,reused,disabledExisting});
      
   const item=(await response.json()).data?.[0];
      
   if(item){created.push({effect:reward.effect,id:item.id,title:item.title,isEnabled:item.is_enabled!==false});
        existing.push(item)}
  }
  return{ok:true,created,reused,disabledExisting,requestedEnabled:!!enabled};
    
 }catch{return failure('Twitch could not be reached. Check your connection before retrying.')}
}

/** Handle existing chat play rewards.
 * @param {unknown} parameter1 Function input.
 * @param {unknown} broadcasterId Function input.
 * @param {unknown} rewards Function input.
 * @param {unknown} fetchImpl Function input.
 * @returns {unknown} The function result.
 */
export async function enableExistingChatPlayRewards({token,broadcasterId,rewards=[],fetchImpl=globalThis.fetch}={}){
 if(!token||!broadcasterId)return failure('Connect the channel owner account first.');
  
 const enabled=[],headers=headersFor(token);
  
 try{
  for(const reward of rewards){
   if(!reward.id)continue;
      
   const response=await fetchImpl(rewardUrl(broadcasterId,reward.id),{method:'PATCH',headers,body:JSON.stringify({is_enabled:true})});
      
   if(response.status===401)return failure('Twitch access expired. Reconnect channel points.',{enabled});
      
   if(response.status===403)return failure('Twitch denied permission to turn on these rewards. Reconnect with channel:manage:redemptions.',{enabled});
      
   if(!response.ok)return failure(`Could not turn on ${reward.title}.`,{enabled});
      
   const body=await response.json();
      enabled.push({id:reward.id,title:body.data?.[0]?.title||reward.title,isEnabled:true});
      
  }
  return{ok:true,enabled};
    
 }catch{return failure('Twitch could not be reached while turning on rewards.',{enabled})}
}
