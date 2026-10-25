import {TWITCH_CLIENT_ID,getOAuthRedirectUri} from './twitch-auth.js';
import {ALERT_SCOPE_LIST,alertScopesFor,normalizeAlerts} from './alerts-config.js';

const STATE_KEY='chatSkinsAlertsOAuthState';
const DRAFT_KEY='chatSkinsAlertsOAuthDraft';
const twitchHeaders=token=>({Authorization:`Bearer ${token}`,'Client-Id':TWITCH_CLIENT_ID});

export function buildAlertsAuthorizationUrl({state,scopes=ALERT_SCOPE_LIST,location=globalThis.location,redirectUri=getOAuthRedirectUri(location)}={}){
 const url=new URL('https://id.twitch.tv/oauth2/authorize');url.searchParams.set('client_id',TWITCH_CLIENT_ID);url.searchParams.set('redirect_uri',redirectUri);url.searchParams.set('response_type','token');url.searchParams.set('scope',[...new Set(scopes)].join(' '));url.searchParams.set('state',state||'');return url.href;
}
export function beginAlertsAuth({channel='',alerts,design,extraScopes=[],onlyExtraScopes=false,action='',sessionStorage=globalThis.sessionStorage,location=globalThis.location,random=globalThis.crypto?.randomUUID?.bind(globalThis.crypto)}={}){
 const state=random?random():`${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`,config=normalizeAlerts(alerts,design),scopes=[...new Set([...(onlyExtraScopes?[]:alertScopesFor(config)),...extraScopes])];sessionStorage.setItem(STATE_KEY,state);sessionStorage.setItem(DRAFT_KEY,JSON.stringify({channel:String(channel||'').trim().toLowerCase(),scopes,action}));location.assign(buildAlertsAuthorizationUrl({state,scopes,location}));
}
export async function validateAlertsToken(token,{fetchImpl=globalThis.fetch}={}){
 if(!token)return{valid:false,error:'missing-token'};try{const response=await fetchImpl('https://id.twitch.tv/oauth2/validate',{headers:{Authorization:`OAuth ${token}`}});if(!response.ok)return{valid:false,error:response.status===401?'unauthorized':'validation-failed'};const data=await response.json();if(data.client_id!==TWITCH_CLIENT_ID||!data.user_id||!data.login||!Number.isFinite(data.expires_in))return{valid:false,error:'invalid-identity'};return{valid:true,clientId:data.client_id,userId:String(data.user_id),login:String(data.login).toLowerCase(),scopes:Array.isArray(data.scopes)?data.scopes:[],expiresIn:data.expires_in,expiresAt:Date.now()+data.expires_in*1000}}catch{return{valid:false,error:'network'}}
}
export async function finishAlertsAuth({hash=globalThis.location.hash,pathname=globalThis.location.pathname,search=globalThis.location.search,sessionStorage=globalThis.sessionStorage,history=globalThis.history,fetchImpl=globalThis.fetch}={}){
 const expected=sessionStorage.getItem(STATE_KEY);if(!expected)return{handled:false};const params=new URLSearchParams(String(hash||'').replace(/^#/,'')),token=params.get('access_token')||'',received=params.get('state')||'',oauthError=params.get('error')||'';if(!token&&!oauthError)return{handled:false};let draft={};try{draft=JSON.parse(sessionStorage.getItem(DRAFT_KEY)||'{}')}catch{}sessionStorage.removeItem(STATE_KEY);sessionStorage.removeItem(DRAFT_KEY);history.replaceState(null,'',`${pathname}${search}`);
 if(oauthError)return{handled:true,error:'Connection cancelled. Your settings and test alerts are still here.'};if(!received||received!==expected){await revokeAlertsToken(token,{fetchImpl});return{handled:true,error:'Alerts sign-in could not be verified. Please connect again.'}};
 const validation=await validateAlertsToken(token,{fetchImpl});if(!validation.valid){if(validation.error!=='network')await revokeAlertsToken(token,{fetchImpl});return{handled:true,error:validation.error==='network'?'Could not validate Twitch access. Reconnect alerts when online.':'Twitch access is invalid or expired. Reconnect alerts.'}}
 const channel=String(draft.channel||'').toLowerCase();if(channel&&validation.login!==channel){await revokeAlertsToken(token,{fetchImpl});return{handled:true,error:`You signed in as ${validation.login}. Alerts are set up for ${channel}. Sign in as the channel owner or change the channel.`}}
 const missing=(draft.scopes||[]).filter(scope=>!validation.scopes.includes(scope));if(missing.length){await revokeAlertsToken(token,{fetchImpl});return{handled:true,error:`Permission for ${missing[0]} was not granted. Reconnect to enable it.`}}
 return{handled:true,token,identity:{userId:validation.userId,login:validation.login},scopes:validation.scopes,expiresIn:validation.expiresIn,expiresAt:validation.expiresAt,action:draft.action||''};
}
export async function revokeAlertsToken(token,{fetchImpl=globalThis.fetch}={}){
 if(!token)return{ok:false};try{const response=await fetchImpl('https://id.twitch.tv/oauth2/revoke',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:TWITCH_CLIENT_ID,token})});return{ok:response.ok||response.status===400}}catch{return{ok:false}}
}
