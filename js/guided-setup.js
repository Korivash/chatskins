import {alertScopesFor,encodeAlertConfig,decodeAlertConfig} from './alerts-config.js';
import {CHAT_PLAY_POINT_SCOPES} from './chat-play-points.js';
import {encodePlaySource,decodePlaySource} from './chat-play.js';

export function combinedSetupScopes({pointsOn=true,alertsOn=true,alerts}={}){
 return [...new Set([...(pointsOn?CHAT_PLAY_POINT_SCOPES:[]),...(alertsOn?alertScopesFor(alerts):[])])];
}

export function buildUnifiedOverlayUrl(baseUrl,{token,chatSettings,chatPlay,allowedSkins,baseSkinId='',alerts,recipe,design}={}){
 if(!token)throw new TypeError('A Twitch connection is required.');
 const url=new URL('overlay.html',baseUrl);url.search='';
 const params=new URLSearchParams();params.set('v','1');
 params.set('play',encodePlaySource({chatSettings,chatPlay,skins:allowedSkins,baseSkinId}));
 params.set('config',encodeAlertConfig({version:1,chatSettings,alerts,recipe},design));
 params.set('access_token',token);url.hash=params.toString();return url.href;
}

export function decodeUnifiedOverlayFragment(hash,catalog=[],design){
 const params=new URLSearchParams(String(hash||'').replace(/^#/,''));
 if(params.get('v')!=='1')return null;
 const play=decodePlaySource(params.get('play'),catalog),alerts=decodeAlertConfig(params.get('config'),design),token=params.get('access_token');
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
