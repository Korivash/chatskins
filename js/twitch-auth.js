export const TWITCH_CLIENT_ID = 'o35kfdkfee10jgi3i6szk98lsfcvf3';
const STATE_KEY = 'chatskinsTwitchOAuthState';
const SETTINGS_KEY = 'chatskinsEditorRestore';

export function parseOAuthHash(hash) {
  const params = new URLSearchParams(String(hash || '').replace(/^#/, ''));
  return {accessToken: params.get('access_token') || '', state: params.get('state') || '', error: params.get('error') || ''};
}
export function checkOAuthState(expected, received) { return !!expected && !!received && expected === received; }
export function getOAuthRedirectUri(locationLike=globalThis.location) {
  if(!locationLike?.origin) throw new TypeError('OAuth redirect requires a page origin');
  return `${locationLike.origin}/`;
}
export function buildTwitchAuthorizationUrl({state,location=globalThis.location}={}) {
  const url=new URL('https://id.twitch.tv/oauth2/authorize');
  url.searchParams.set('client_id',TWITCH_CLIENT_ID);
  url.searchParams.set('redirect_uri',getOAuthRedirectUri(location));
  url.searchParams.set('response_type','token');
  url.searchParams.set('scope','');
  url.searchParams.set('state',state||'');
  return url.href;
}
export function beginTwitchAuth({sessionStorage=globalThis.sessionStorage, location=globalThis.location, random=globalThis.crypto?.randomUUID?.bind(globalThis.crypto)}={}) {
  const state = random ? random() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  sessionStorage.setItem(STATE_KEY, state);
  location.assign(buildTwitchAuthorizationUrl({state,location}));
}
export async function finishTwitchAuth({hash=globalThis.location.hash, sessionStorage=globalThis.sessionStorage, history=globalThis.history, fetchImpl=globalThis.fetch}={}) {
  const parsed = parseOAuthHash(hash);
  if (!parsed.accessToken && !parsed.error) return {handled:false};
  const expected = sessionStorage.getItem(STATE_KEY);
  sessionStorage.removeItem(STATE_KEY);
  // Clear the bearer token before making any network request or displaying an error.
  history.replaceState(null, '', globalThis.location.pathname + globalThis.location.search);
  if (parsed.error) { return {handled:true,error:'Twitch connection was cancelled. You can still enter your channel name.'}; }
  if (!checkOAuthState(expected, parsed.state)) { try { await fetchImpl('https://id.twitch.tv/oauth2/revoke',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:TWITCH_CLIENT_ID,token:parsed.accessToken})}); } catch {} return {handled:true,error:'Twitch connection could not be verified. Please try again or enter your channel name.'}; }
  let login='';
  try {
    const response=await fetchImpl('https://api.twitch.tv/helix/users',{headers:{'Client-Id':TWITCH_CLIENT_ID,Authorization:`Bearer ${parsed.accessToken}`}});
    if(!response.ok) throw Error('Twitch user lookup failed');
    login=(await response.json()).data?.[0]?.login||'';
    if(!login) throw Error('Twitch did not return a channel');
  } catch {
    try { await fetchImpl('https://id.twitch.tv/oauth2/revoke',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:TWITCH_CLIENT_ID,token:parsed.accessToken})}); } catch {}
    return {handled:true,error:'Could not connect to Twitch. You can still enter your channel name.'};
  }
  try { await fetchImpl('https://id.twitch.tv/oauth2/revoke',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:TWITCH_CLIENT_ID,token:parsed.accessToken})}); } catch {}
  return {handled:true,login};
}
export function saveEditorRestore(sessionStorage, settings) { sessionStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
export function takeEditorRestore(sessionStorage) { const raw=sessionStorage.getItem(SETTINGS_KEY);sessionStorage.removeItem(SETTINGS_KEY);if(!raw)return null;try{return JSON.parse(raw)}catch{return null} }
