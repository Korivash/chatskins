import {forwardLegacyRoot} from './routes.js';
import {applyChatStyle,createMessage} from './render.js';
import {normalizeSettings} from './settings.js';
import {buildSkinPreviewMessages} from './skin-preview.js';

if(!forwardLegacyRoot()){
 const data=await(await fetch('./design/skins.json')).json(),skins=data.skins.sort((a,b)=>(a.galleryOrder??999)-(b.galleryOrder??999)),featured=skins.filter(s=>s.featured),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const byId=id=>skins.find(s=>s.id===id),central=document.querySelector('#home-sample'),cycleName=document.querySelector('#cycle-name');
 let index=Math.max(0,featured.findIndex(s=>s.id===central.dataset.skin)),paused=reduced.matches;
 function draw(host,skin,count=2){if(!host||!skin)return;const settings=normalizeSettings(structuredClone(skin.settings));for(const part of Object.values(settings.parts||{}))part.fontSize=host===central?14:12;settings.reduceMotion=paused||reduced.matches;const chat=document.createElement('div');chat.className='chat chat-panel skin-live-preview';applyChatStyle(chat,settings);for(const message of buildSkinPreviewMessages(skin,count))chat.append(createMessage(message,settings));host.replaceChildren(chat);host.dataset.skin=skin.id}
 for(const host of document.querySelectorAll('[data-skin]'))draw(host,byId(host.dataset.skin),host===central?3:2);
 function select(next){index=(next+featured.length)%featured.length;const skin=featured[index];draw(central,skin,3);cycleName.textContent=skin.name}
 document.querySelector('#home-next')?.addEventListener('click',()=>select(index+1));document.querySelector('#home-prev')?.addEventListener('click',()=>select(index-1));
 const pause=document.querySelector('#pause-preview');function updatePause(){const isPaused=paused||reduced.matches;document.documentElement.classList.toggle('previews-paused',isPaused);if(pause){pause.textContent=reduced.matches?'Previews paused by device':paused?'Resume previews':'Pause previews';pause.setAttribute('aria-pressed',String(isPaused))}}pause?.addEventListener('click',()=>{if(!reduced.matches)paused=!paused;updatePause()});reduced.addEventListener('change',()=>{paused=reduced.matches;updatePause()});updatePause();
 setInterval(()=>{if(!paused&&!reduced.matches&&!document.hidden)select(index+1)},5000);
}
