import {forwardLegacyRoot} from './routes.js';
import {initSite} from './site.js';
import {applyChatStyle,createMessage} from './render.js';
import {normalizeSettings} from './settings.js';
import {buildSkinPreviewMessages,fitSkinPreview} from './skin-preview.js';

if(!forwardLegacyRoot()){
 initSite();
 const skins=(await(await fetch('./design/skins.json')).json()).skins.filter(s=>s.featured).sort((a,b)=>a.galleryOrder-b.galleryOrder);
 let index=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches||localStorage.getItem('chatskinsPauseMotion')==='on';
 const host=document.querySelector('#home-sample');
 document.querySelector('[data-motion]')?.addEventListener('click',()=>{paused=localStorage.getItem('chatskinsPauseMotion')==='on'||matchMedia('(prefers-reduced-motion: reduce)').matches});const features=document.createElement('ul');features.className='feature-list';for(const text of ['42 editable starting skins','7TV, BTTV and FFZ community emotes','Transparent backgrounds for OBS','Undo, redo and saved skins','Live Twitch chat connection']){const item=document.createElement('li');item.textContent=text;features.append(item)}document.querySelector('#about').append(features);
 const faq=document.querySelector('#about').nextElementSibling;for(const [question,answer] of [['Can I keep the background transparent?','Yes. Transparent backgrounds stay clear over your scene in OBS.'],['Can I save a custom skin?','Yes. Advanced settings include local saved skins and JSON import or export.']]){const details=document.createElement('details'),summary=document.createElement('summary'),copy=document.createElement('p');summary.textContent=question;copy.textContent=answer;details.append(summary,copy);faq.append(details)}
 function render(){const skin=skins[index];host.replaceChildren();const settings=normalizeSettings(skin.settings),wrapper=document.createElement('div'),chat=document.createElement('div');wrapper.className='skin-preview-measure';chat.className='chat chat-panel skin-live-preview';applyChatStyle(chat,settings);for(const message of buildSkinPreviewMessages(skin,3))chat.append(createMessage(message,settings));wrapper.append(chat);host.append(wrapper);requestAnimationFrame(()=>fitSkinPreview(host,wrapper));document.querySelector('#cycle-name').textContent=skin.name;host.dataset.skin=skin.id}
 const move=step=>{index=(index+step+skins.length)%skins.length;render()};document.querySelector('[data-next]').onclick=()=>move(1);document.querySelector('[data-prev]').onclick=()=>move(-1);
 const menuLinks=[...document.querySelectorAll('.title-menu a')];function selectMenu(link){for(const item of menuLinks){item.classList.toggle('selected',item===link);if(item===link)item.setAttribute('aria-current','true');else item.removeAttribute('aria-current')}}menuLinks.forEach(a=>{a.addEventListener('mouseenter',()=>selectMenu(a));a.addEventListener('focus',()=>selectMenu(a))});
 document.addEventListener('keydown',event=>{if(/INPUT|TEXTAREA|SELECT|BUTTON/.test(event.target.tagName)||event.target.closest('dialog'))return;const links=menuLinks,index=links.indexOf(document.activeElement);if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();links[(index+(event.key==='ArrowDown'?1:-1)+links.length)%links.length].focus()}else if((event.key==='Enter'||event.key===' ')&&index<0){event.preventDefault();location.href='skins.html'}else if((event.key===' '||event.key==='Enter')&&index>=0){event.preventDefault();links[index].click()}});
 document.querySelector('[data-motion]')?.addEventListener('click',()=>{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)paused=!paused});
 render();setInterval(()=>{if(!paused&&!document.hidden)move(1)},6000);
}
