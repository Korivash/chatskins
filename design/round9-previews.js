// Design-only adapter: samples go through the actual overlay renderer.
import {applyChatStyle,createMessage} from '../js/render.js';
import {normalizeSettings} from '../js/settings.js';
import {buildSkinPreviewMessages} from '../js/skin-preview.js';
const skins=(await (await fetch('skins.json')).json()).skins.sort((a,b)=>(a.galleryOrder??999)-(b.galleryOrder??999));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduced.matches, cycle=0, tick=0;
const visible=new Set();
const observer=new IntersectionObserver(entries=>entries.forEach(e=>e.isIntersecting?visible.add(e.target):visible.delete(e.target)));
const hosts=new Map();
function draw(host,skin,limit=2){
 const s=normalizeSettings(structuredClone(skin.settings));
 for(const p of Object.values(s.parts||{}))p.fontSize=host.closest('.float-card')?11:13;
 s.reduceMotion=paused||reduced.matches;
 const chat=document.createElement('div');chat.className='chat chat-panel';
 applyChatStyle(chat,s);
 const messages=buildSkinPreviewMessages(skin,limit);
 if(tick%2&&messages.length)messages[messages.length-1]={...messages[messages.length-1],text:'One more run? I saved you a place.'};
 messages.forEach(message=>chat.append(createMessage(message,s)));
 host.replaceChildren(chat);hosts.set(host,{skin,limit});observer.observe(host);
}
document.querySelectorAll('[data-skin]').forEach(host=>draw(host,skins.find(s=>s.id===host.dataset.skin)||skins[0]));
const pauseButton=document.querySelector('#pause-preview');
function setPause(){document.documentElement.classList.toggle('paused',paused||reduced.matches);if(pauseButton){pauseButton.textContent=paused?'Resume previews':'Pause previews';pauseButton.setAttribute('aria-pressed',String(paused));}}
pauseButton?.addEventListener('click',()=>{paused=!paused;setPause()});reduced.addEventListener('change',()=>{paused=reduced.matches;setPause()});setPause();
setInterval(()=>{
 if(paused||reduced.matches||document.hidden)return;
 tick++;
 for(const [host,item]of hosts){if(!host.isConnected){observer.unobserve(host);hosts.delete(host);continue}if(!visible.has(host))continue;draw(host,item.skin,item.limit)}
 const central=document.querySelector('.central-preview');
 if(central&&visible.has(central)){const featured=skins.filter(s=>s.featured);const skin=featured[++cycle%featured.length];draw(central,skin,3);document.querySelector('#active-skin').textContent=skin.name+' · Featured'}
},5000);
const gallery=document.querySelector('#gallery');
if(gallery){
 let group='Featured',selected=skins[0];
 const groups=['Featured','Streamer favorites','Game styles','Animated','Colorful'];
 function select(skin){
  selected=skin;
  gallery.querySelectorAll('.skin-card').forEach(card=>card.setAttribute('aria-pressed',String(card.dataset.id===skin.id)));
  document.querySelector('#selected-name').textContent=skin.name;
  document.querySelector('#selected-description').textContent=skin.tagline||'A distinctive starting point. Adjust every detail in the editor.';
  draw(document.querySelector('#selected-preview'),skin,3);
  document.querySelector('#scores').replaceChildren(...['readability','flair','motion','retro'].map(key=>{const row=document.createElement('div');row.className='score';const label=document.createElement('span');label.textContent=key[0].toUpperCase()+key.slice(1);const score=document.createElement('span');score.textContent=(skin.stats?.[key]||3)+' / 5';row.append(label,score);return row}));
  for(const id of ['use-selected','customize-selected'])document.getElementById(id).href='editor9-mockup.html?skin='+encodeURIComponent(skin.id);
 }
 function render(){
  for(const host of gallery.querySelectorAll('.preview')){observer.unobserve(host);visible.delete(host);hosts.delete(host)}
  gallery.replaceChildren();
  const filtered=skins.filter(s=>group==='Featured'?s.featured:s.category===group);
  document.querySelector('#gallery-count').textContent=filtered.length+' skins · '+group+' · 42 total';
  for(const skin of filtered){const card=document.createElement('button');card.type='button';card.className='skin-card';card.dataset.id=skin.id;card.setAttribute('aria-label','Preview '+skin.name);const host=document.createElement('div');host.className='preview';const title=document.createElement('strong');title.textContent=skin.name;const sub=document.createElement('small');sub.textContent=skin.featured?'Featured · '+skin.category:skin.category;card.append(host,title,sub);card.onclick=()=>select(skin);gallery.append(card);draw(host,skin)}
  select(filtered.find(s=>s.id===selected.id)||filtered[0]);
 }
 for(const name of groups){const b=document.createElement('button');b.textContent=name;b.setAttribute('aria-pressed',String(name===group));b.onclick=()=>{group=name;document.querySelectorAll('#filters button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render()};document.querySelector('#filters').append(b)}
 render();
}
