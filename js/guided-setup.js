/**
 * Browser module guided-setup.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: combinedSetupScopes, buildUnifiedOverlayUrl, decodeUnifiedOverlayFragment, guidedCommandStatus, guidedFeatureStatus.
 * Invariant: preserve existing settings links and render chat content as text.
 */
import {alertScopesFor,decodeAlertConfig,compactAlertData,decodeCompactAlertData} from './alerts-config.js';

import {CHAT_PLAY_POINT_SCOPES} from './chat-play-points.js';

import {compactPlayData,decodeCompactPlayData,decodePlaySource} from './chat-play.js';

import {CLEAN} from './settings.js';

import {compactOverlayUrl,decompressJson} from './compact-link.js';


/** Handle setup scopes.
 * @param {unknown} parameter1 Function input.
 * @param {unknown} alertsOn Function input.
 * @param {unknown} parameter3 Function input.
 * @returns {unknown} The function result.
 */
export function combinedSetupScopes({pointsOn=true,alertsOn=true,alerts}={}){
 return [...new Set([...(pointsOn?CHAT_PLAY_POINT_SCOPES:[]),...(alertsOn?alertScopesFor(alerts):[])])];
  
}

/** build unified overlay url.
 * @param {unknown} baseUrl Function input.
 * @param {unknown} parameter2 Function input.
 * @param {unknown} chatSettings Function input.
 * @param {unknown} chatPlay Function input.
 * @param {unknown} allowedSkins Function input.
 * @param {unknown} baseSkinId Function input.
 * @param {unknown} baseSettings Function input.
 * @param {unknown} alerts Function input.
 * @param {unknown} recipe Function input.
 * @param {unknown} parameter10 Function input.
 * @returns {unknown} The function result.
 */
export async function buildUnifiedOverlayUrl(baseUrl,{token,chatSettings,chatPlay,allowedSkins,baseSkinId='',baseSettings=CLEAN,alerts,recipe,design}={}){
 if(!token)throw new TypeError('A Twitch connection is required.');
  
 const play=compactPlayData({chatSettings,chatPlay,skins:allowedSkins,baseSkinId,baseSettings});
  
 const alert=compactAlertData({chatSettings,alerts,recipe,baseSettings},design);
  
 return compactOverlayUrl(baseUrl,{...play,a:alert.a},token);
  
}

/** decode unified overlay fragment.
 * @param {unknown} hash Function input.
 * @param {unknown} catalog Function input.
 * @param {unknown} design Function input.
 * @returns {unknown} The function result.
 */
export async function decodeUnifiedOverlayFragment(hash,catalog=[],design){
 const params=new URLSearchParams(String(hash||'').replace(/^#/,''));
  
 const token=params.get('access_token');
  
 if(params.get('v')==='2'){
  try{const payload=await decompressJson(params.get('data')),playConfig=decodeCompactPlayData(payload,catalog);
      if(!playConfig||!token)return null;
      const play={...playConfig,token},alertsConfig=decodeCompactAlertData({a:payload.a},design,playConfig.chatSettings);
      return alertsConfig?{play,alerts:alertsConfig,token}:null}catch{return null}
 }
 if(params.get('v')!=='1')return null;
  
 const play=decodePlaySource(params.get('play'),catalog),alerts=decodeAlertConfig(params.get('config'),design);
  
 return play&&alerts&&token?{play,alerts,token}:null;
  
}

/** Handle command status.
 * @param {unknown} parameter1 Function input.
 * @param {unknown} channel Function input.
 * @param {unknown} allowedSkinCount Function input.
 * @param {unknown} error Function input.
 * @returns {unknown} The function result.
 */
export function guidedCommandStatus({enabled=true,channel='',allowedSkinCount=1,error=false}={}){return !enabled?'Off':error?'Problem':!String(channel||'').trim()?'Needs your channel':allowedSkinCount?'Ready':'Choose looks'};


/** Handle feature status.
 * @param {unknown} parameter1 Function input.
 * @param {unknown} configured Function input.
 * @param {unknown} problem Function input.
 * @returns {unknown} The function result.
 */
export function guidedFeatureStatus({enabled,configured=true,problem=false}={}){
 return !enabled?'Off':problem?'Problem':configured?'Ready':'Needs Twitch login';
  
}

/** Handle guided setup.
 * @param {unknown} parameter1 Function input.
 * @param {unknown} alerts Function input.
 * @param {unknown} channel Function input.
 * @param {unknown} createRewards Function input.
 * @returns {unknown} The function result.
 */
export function prepareGuidedSetup({chatPlay,alerts,channel,createRewards=true}={}){
 const play=structuredClone(chatPlay),alertConfig=structuredClone(alerts);
  
 play.enabled=true;
  play.commands.enabled=true;
  play.points.enabled=true;
  
 alertConfig.enabled=true;
  
 return{chatPlay:play,alerts:alertConfig,channel:String(channel||'').trim().toLowerCase(),createRewards};
  
}

/** Handle return result.
 * @param {unknown} parameter1 Function input.
 * @param {unknown} login Function input.
 * @param {unknown} alertsReady Function input.
 * @returns {unknown} The function result.
 */
export function guidedReturnResult({rewardResult,login,alertsReady=true}={}){
 return{login:String(login||''),chatCommands:'Ready',alerts:alertsReady?'Ready':'Needs Twitch login',points:rewardResult?.ok?'Ready':'Problem',rewardResult};
  
}

/** Handle setup return model.
 * @param {unknown} parameter1 Function input.
 * @param {unknown} parameter2 Function input.
 * @returns {unknown} The function result.
 */
export function guidedSetupReturnModel({credentials,chatPlay}={}){
 const connected=!!credentials?.token;
  
 return{copyEnabled:connected,linkHint:connected?'Your one OBS link is ready. Paste it as a Browser Source.':'Connect to create your one private OBS link.',chatPlayStatus:chatPlay?.enabled?'Chat play is on.':'Chat play is off. Try it in the preview.'};
  
}
