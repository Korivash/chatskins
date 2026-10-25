import {alertScopesFor,decodeAlertConfig,compactAlertData,decodeCompactAlertData} from './alerts-config.js';
import {CHAT_PLAY_POINT_SCOPES} from './chat-play-points.js';
import {compactPlayData,decodeCompactPlayData,decodePlaySource} from './chat-play.js';
import {CLEAN} from './settings.js';
import {compactOverlayUrl,decompressJson} from './compact-link.js';

export function combinedSetupScopes({pointsOn=true,alertsOn=true,alerts}={}){
 return [...new Set([...(pointsOn?CHAT_PLAY_POINT_SCOPES:[]),...(alertsOn?alertScopesFor(alerts):[])])];
}

export async function buildUnifiedOverlayUrl(baseUrl,{token,chatSettings,chatPlay,allowedSkins,baseSkinId='',baseSettings=CLEAN,alerts,recipe,design}={}){
 if(!token)throw new TypeError('A Twitch connection is required.');
 const play=compactPlayData({chatSettings,chatPlay,skins:allowedSkins,baseSkinId,baseSettings});
 const alert=compactAlertData({chatSettings,alerts,recipe,baseSettings},design);
 return compactOverlayUrl(baseUrl,{...play,a:alert.a},token);
}

export async function decodeUnifiedOverlayFragment(hash,catalog=[],design){
 const params=new URLSearchParams(String(hash||'').replace(/^#/,''));
 const token=params.get('access_token');
 if(params.get('v')==='2'){
  try{const payload=await decompressJson(params.get('data')),playConfig=decodeCompactPlayData(payload,catalog);if(!playConfig||!token)return null;const play={...playConfig,token},alertsConfig=decodeCompactAlertData({a:payload.a},design,playConfig.chatSettings);return alertsConfig?{play,alerts:alertsConfig,token}:null}catch{return null}
 }
 if(params.get('v')!=='1')return null;
 const play=decodePlaySource(params.get('play'),catalog),alerts=decodeAlertConfig(params.get('config'),design);
 return play&&alerts&&token?{play,alerts,token}:null;
}

export function guidedFeatureStatus({enabled,configured=true,problem=false}={}){
 return !enabled?'Off':problem?'Problem':configured?'Ready':'Needs Twitch login';
}

export function prepareGuidedSetup({chatPlay,alerts,channel,createRewards=true}={}){
 const play=structuredClone(chatPlay),alertConfig=structuredClone(alerts);
 play.enabled=true;play.commands.enabled=true;play.points.enabled=true;
 alertConfig.enabled=true;
 return{chatPlay:play,alerts:alertConfig,channel:String(channel||'').trim().toLowerCase(),createRewards};
}

export function guidedReturnResult({rewardResult,login,alertsReady=true}={}){
 return{login:String(login||''),chatCommands:'Ready',alerts:alertsReady?'Ready':'Needs Twitch login',points:rewardResult?.ok?'Ready':'Problem',rewardResult};
}

export function guidedSetupReturnModel({credentials,chatPlay}={}){
 const connected=!!credentials?.token;
 return{copyEnabled:connected,linkHint:connected?'Your one OBS link is ready. Paste it as a Browser Source.':'Connect to create your one private OBS link.',chatPlayStatus:chatPlay?.enabled?'Chat play is on.':'Chat play is off. Try it in the preview.'};
}
