import {normalizeAlertEnvelope,AlertQueue} from './alerts-config.js';
import {validateAlertsToken} from './alerts-auth.js';
import {createEventSubClient} from './eventsub.js';
import {createAlertLayer,createAlertCard,createAlertSoundPlayer} from './alerts-render.js';
import {TWITCH_CLIENT_ID} from './twitch-auth.js';

const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export async function startAlertsOverlay({host,token,config,design,fetchImpl=fetch,WebSocketImpl=globalThis.WebSocket,AudioContextImpl=globalThis.AudioContext||globalThis.webkitAudioContext,document:doc=globalThis.document,location=globalThis.location}={}){
 const safe=normalizeAlertEnvelope(config,design);if(!host||!token||!safe)return{stop(){},error:'Invalid private alerts link.'};
 const queue=new AlertQueue(safe.alerts.queue),layer=createAlertLayer({document:doc,config:safe.alerts});host.append(layer);host.classList.add('alerts-root');if(!host.querySelector('#chat'))doc.body.classList.add('alerts-only');const sound=createAlertSoundPlayer({AudioContextImpl});
 let client=null,closed=false,timer=null,expiryTimer=null,validationTimer=null,playing=false;
 const pump=async()=>{if(playing||closed)return;const event=queue.take();if(!event)return;playing=true;const card=createAlertCard({document:doc,event,config:safe.alerts,recipe:safe.recipe,design});if(card){const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches||safe.chatSettings.reduceMotion;card.dataset.reducedMotion=String(reduced);layer.append(card);if(safe.alerts.sound.enabled)sound.play({event,recipe:safe.recipe,design,volume:safe.alerts.sound.volume});const enter=reduced?0:(design.motion?.[safe.recipe.motion]?.enterMs||220),exit=reduced?0:(design.motion?.[safe.recipe.motion]?.exitMs||180);await wait(enter+safe.alerts.types[event.type].holdSeconds*1000);if(closed){card.remove();return}card.classList.add('is-exiting');await wait(exit);card.remove()}playing=false;if(!closed){await wait(safe.alerts.queue.gapMs);pump()}};
 const stop=()=>{closed=true;clearTimeout(timer);clearTimeout(expiryTimer);clearInterval(validationTimer);client?.stop();queue.clear();sound.stop();layer.replaceChildren()};
 const tokenStatus=await validateAlertsToken(token,{fetchImpl});if(!tokenStatus.valid||tokenStatus.userId!==safe.chatSettings.channelId&&tokenStatus.login!==String(safe.chatSettings.channel||'').toLowerCase()){stop();return{stop,error:'Alerts access is invalid, expired, or for a different channel.'}}
 const onEvent=event=>{if(!safe.alerts.enabled||!safe.alerts.types[event.type]?.enabled)return;queue.enqueue(event);pump()};
 client=createEventSubClient({token,clientId:TWITCH_CLIENT_ID,broadcasterId:tokenStatus.userId,alerts:safe.alerts,fetchImpl,WebSocketImpl,onEvent,onStatus:()=>{},onAuthEnded:()=>stop()});client.start();
 expiryTimer=setTimeout(stop,Math.max(0,tokenStatus.expiresIn*1000));validationTimer=setInterval(async()=>{const latest=await validateAlertsToken(token,{fetchImpl});if(!latest.valid||latest.userId!==tokenStatus.userId)stop()},60*60*1000);
 return{stop,queue,client};
}
