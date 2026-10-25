import {forwardLegacyRoot} from './routes.js';
import {initSite} from './site.js';
import {applyChatStyle,createMessage} from './render.js';
import {normalizeSettings} from './settings.js';

if(!forwardLegacyRoot()){
 initSite();
 const skins=(await(await fetch('./design/skins.json')).json()).skins.filter(s=>s.featured).sort((a,b)=>a.galleryOrder-b.galleryOrder);
 let index=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches||localStorage.getItem('chatskinsPauseMotion')==='on';
 const host=document.querySelector('#home-sample');
 const features=document.createElement('ul');features.className='feature-list';for(const text of ['34 editable starting skins','7TV, BTTV and FFZ community emotes','Transparent backgrounds for OBS','Undo, redo and saved skins','Live Twitch chat connection']){const item=document.createElement('li');item.textContent=text;features.append(item)}document.querySelector('#about').append(features);
 const faq=document.querySelector('#about').nextElementSibling;for(const [question,answer] of [['Can I keep the background transparent?','Yes. Transparent backgrounds stay clear over your scene in OBS.'],['Can I save a custom skin?','Yes. Advanced settings include local saved skins and JSON import or export.']]){const details=document.createElement('details'),summary=document.createElement('summary'),copy=document.createElement('p');summary.textContent=question;copy.textContent=answer;details.append(summary,copy);faq.append(details)}
 function render(){const skin=skins[index];host.replaceChildren();const settings=normalizeSettings(skin.settings),chat=document.createElement('div');chat.className='chat chat-panel';applyChatStyle(chat,settings);chat.append(createMessage({username:'Moss',text:'Hello, chat!'},settings),createMessage({username:'Rin',text:'This looks great ✨'},settings));host.append(chat);document.querySelector('#cycle-name').textContent=skin.name;host.dataset.skin=skin.id}
 const move=step=>{index=(index+step+skins.length)%skins.length;render()};document.querySelector('[data-next]').onclick=()=>move(1);document.querySelector('[data-prev]').onclick=()=>move(-1);
 document.querySelectorAll('.title-menu a').forEach(a=>a.addEventListener('mouseenter',()=>{for(const link of document.querySelectorAll('.title-menu a'))link.removeAttribute('aria-current')}));
 document.addEventListener('keydown',event=>{if(/INPUT|TEXTAREA|SELECT|BUTTON|A/.test(event.target.tagName)||event.target.closest('dialog'))return;const links=[...document.querySelectorAll('.title-menu a')],index=links.indexOf(document.activeElement);if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();links[(index+(event.key==='ArrowDown'?1:-1)+links.length)%links.length].focus()}else if((event.key==='Enter'||event.key===' ')&&index<0){event.preventDefault();location.href='skins.html'}});
 document.querySelector('[data-motion]')?.addEventListener('click',()=>{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)paused=!paused});
 render();setInterval(()=>{if(!paused&&!document.hidden)move(1)},6000);
}
