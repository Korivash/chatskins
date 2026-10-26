/**
 * Browser module skins-page.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: module declarations.
 * Invariant: preserve existing settings links and render chat content as text.
 */
import {initSite} from './site.js';

import {applyChatStyle,createMessage,applySkinMetadata} from './render.js';

import {normalizeSettings,buildCompactSettingsUrl} from './settings.js';

import {buildSkinCardModel,buildSkinPreviewMessages,fitSkinPreview,previewCanvasSize,createSkinMonitorPreview} from './skin-preview.js';

import {nextFakeMessage,nextFakeDelay} from './fakechat.js';

import {beginTwitchAuth,saveEditorRestore} from './twitch-auth.js';

import {attachFrameTemplate,mountIllustrated,buildWebcamFrameUrl} from './frame-templates.js';

import {layoutPanel} from './panel-layout.js';


initSite();

window.__frameEntries=await(await fetch('./site-media/frames/frames.json')).json();
const skins=(await(await fetch('./design/skins.json')).json()).skins.sort((a,b)=>(a.galleryOrder??999)-(b.galleryOrder??999));

const total=document.querySelector('#skin-total');
if(total)total.textContent=String(skins.length);

const groups=['Frames','Illustrated','Featured','Streamer favorites','Game styles','Animated','Colorful'];

let group=new URLSearchParams(location.search).get('group')||'Frames';

let selected=skins.find(s=>s.id===new URLSearchParams(location.search).get('skin'))||skins.find(s=>s.category==='Frames')||skins[0],opener=null,previewsPaused=false;

const $=selector=>document.querySelector(selector),filters=$('#filters'),roster=$('#roster');

const pauseButton=document.createElement('button');
pauseButton.type='button';
pauseButton.className='top-tool';
pauseButton.textContent='Pause previews';
pauseButton.setAttribute('aria-pressed','false');
filters.after(pauseButton);
pauseButton.onclick=()=>{previewsPaused=!previewsPaused;
  pauseButton.textContent=previewsPaused?'Resume previews':'Pause previews';
  pauseButton.setAttribute('aria-pressed',String(previewsPaused));
  document.documentElement.classList.toggle('previews-paused',previewsPaused);
  document.dispatchEvent(new Event('skin-preview-pause'))};

const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches,animatedCards=new Set();

const cardObserver=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{target._visible=isIntersecting;if(target.dataset.animated==='true'){if(isIntersecting&&animatedCards.size<4)animatedCards.add(target);else if(!isIntersecting)animatedCards.delete(target);target._motionLimited=isIntersecting&&!animatedCards.has(target)}const motionOff=!isIntersecting||previewsPaused||reducedMotion()||!!target._motionLimited;target._motionRoot?.querySelectorAll('.msg').forEach(row=>row.dataset.motionPaused=String(motionOff));if(target._motionRoot)target._motionRoot.dataset.motion=motionOff?'off':'on';if(isIntersecting){target._mountSkin?.();target._schedule?.()}target.querySelectorAll('.illustrated-art').forEach(svg=>svg.dataset.motion=motionOff?'off':'on')}));

function renderSkinPreview(host,skin,{card=false,messages=null}={}){
 const settings=normalizeSettings(skin.settings),previewSettings=applySkinMetadata(structuredClone(settings),skin);
  
 for(const part of Object.values(previewSettings.parts||{}))part.fontSize=24;
  
 const frame=document.createElement('div');
  frame.className=card?'portrait-preview':'monitor-preview';
  
 const isFrame=!!(skin.frameTemplate||previewSettings.dreamPaintId),wrapper=document.createElement('div');
  wrapper.className='skin-preview-measure'+(isFrame?' preview-virtual-stage':'');
  
 const canvasSize=previewCanvasSize(skin),canvas=isFrame?document.createElement('div'):null;
  if(canvas){canvas.className='source preview-virtual-canvas';
    canvas.style.width=`${canvasSize.width}px`;
    canvas.style.height=`${canvasSize.height}px`;
    wrapper.style.width=`${canvasSize.width}px`;
    wrapper.style.height=`${canvasSize.height}px`}
 const chat=document.createElement('div');
  chat.className='chat chat-panel skin-live-preview';
  applyChatStyle(chat,previewSettings);
  
 for(const message of(messages||buildSkinPreviewMessages(skin,card?2:3)))chat.append(createMessage(message,previewSettings));
  
 if(canvas){canvas.append(chat);
    wrapper.append(canvas)}else wrapper.append(chat);
  frame.append(wrapper);
  frame.classList.toggle('preview-loading',isFrame);
  host.replaceChildren(frame);
  host._skinMounted=false;
  host._motionRoot=chat;
  host.dataset.previewCard=String(card);
  host._fitSkinPreview=null;
  
 const layout=()=>layoutPanel(canvas,chat,previewSettings,canvasSize.height);
  
 host._mountSkin=()=>{if(host._skinMounted)return;
    host._skinMounted=true;
    const tasks=[];
    if(isFrame)tasks.push(attachFrameTemplate(chat,previewSettings,{skin,shape:skin.frameShape||'tall',manifest:window.__frameEntries,layout}));
    if(skin.illustration)tasks.push(mountIllustrated(chat,previewSettings,skin));
    Promise.all(tasks).then(()=>{if(isFrame){layout();frame.classList.remove('preview-loading')}host._fitSkinPreview=fitSkinPreview(frame,wrapper);requestAnimationFrame(()=>host._fitSkinPreview?.())})};
  
 if(!card)host._mountSkin();
  let timer=null,disposed=false;
  
 const schedule=()=>{clearTimeout(timer);
    if(disposed||previewsPaused||reducedMotion()||!host._visible)return;
    timer=setTimeout(()=>{if(disposed)return;const message=nextFakeMessage(Math.random,previewSettings.channel);message.id=`skin-preview-${skin.id}-${Date.now()}-${Math.random()}`;const row=createMessage(message,previewSettings);row.dataset.motionPaused=String(!host._visible||previewsPaused||reducedMotion());row.classList.add('preview-arrival');chat.append(row);const rows=[...chat.children].filter(el=>el.classList.contains('message'));if(rows.length>(card?3:6)){const old=rows[0];old.classList.add('expired');setTimeout(()=>old.isConnected&&old.remove(),previewSettings.animationOut==='none'||previewSettings.reduceMotion?0:previewSettings.animationOutDuration)}schedule()},card?3000+Math.random()*1000:nextFakeDelay());
    };
  
 host._stopPreview?.();
  host._stopPreview=()=>{disposed=true;
    clearTimeout(timer);
    animatedCards.delete(host);
    cardObserver.unobserve(host);
    document.removeEventListener('skin-preview-pause',onPause)};
  host._schedule=schedule;
  
 const onPause=()=>{const off=previewsPaused||reducedMotion()||!host._visible||!!host._motionLimited;
    if(host._motionRoot)host._motionRoot.dataset.motion=off?'off':'on';
    host.querySelectorAll('.illustrated-art').forEach(svg=>svg.dataset.motion=off?'off':'on');
    schedule()};
  document.addEventListener('skin-preview-pause',onPause);
  
 host._visible=false;
  chat.querySelectorAll('.msg').forEach(row=>row.dataset.motionPaused='true');
  cardObserver.observe(host);
  return frame
}
const monitorPreview=createSkinMonitorPreview(selected.id,id=>{const skin=skins.find(item=>item.id===id);const host=$('#skin-preview');host.dataset.skinId=id;renderSkinPreview(host,skin)});
$('#preview-chat-play').onclick=()=>{const demo=skins.find(item=>item.id!==selected.id);
  monitorPreview.previewChatPlay(demo?.id)};

function render(){filters.replaceChildren();
  for(const name of groups){const button=document.createElement('button');
    button.type='button';
    button.textContent=name;
    button.setAttribute('aria-pressed',String(name===group));
    button.onclick=()=>{group=name;
      selected=name==='Featured'?skins.find(s=>s.featured):skins.find(s=>s.category===group);
      render()};
    filters.append(button)}const visible=group==='Featured'?skins.filter(s=>s.featured):skins.filter(s=>s.category===group);
  $('#count').textContent=visible.length+' skins \u00b7 '+group;
  roster.querySelectorAll('.skin-card').forEach(card=>card._stopPreview?.());
  roster.replaceChildren();
  for(const skin of visible){const model=buildSkinCardModel(skin),button=document.createElement('button');
    button.type='button';
    button.className='skin-card';
    button.dataset.skinId=skin.id;
    button.dataset.animated=String(!!skin.animated);
    button.setAttribute('aria-pressed',String(skin.id===selected.id));
    button.setAttribute('aria-label',skin.name);
    button.tabIndex=skin.id===selected.id?0:-1;
    button.onclick=()=>{selected=skin;
      render()};
    renderSkinPreview(button,skin,{card:true,messages:model.previewElement.messages});
    const heading=document.createElement('span');
    heading.className='skin-card-title';
    const name=document.createElement('b');
    name.textContent=model.name;
    const featured=document.createElement('span');
    featured.className='featured-label';
    featured.textContent=model.featured?'\u25c6 Featured':'';
    heading.append(name,featured);
    if(skin.category==='Frames'||skin.category==='Illustrated'){const paintTag=document.createElement('span');
      paintTag.className='template-tag';
      paintTag.textContent='Hand-painted';
      heading.append(paintTag)}if(skin.animated){const motionTag=document.createElement('span');
      motionTag.className='template-tag animated-tag';
      motionTag.textContent='Animated';
      heading.append(motionTag)}const desc=document.createElement('small');
    desc.className='skin-tagline';
    desc.textContent=model.tagline;
    button.append(heading,desc);
    roster.append(button)}$('#skin-name').textContent=selected.name;
  $('#skin-description').textContent=selected.tagline||'';
  const webcamLink=$('#webcam-match'),webcamEntry=window.__frameEntries?.find(item=>item.id===selected.frameTemplate&&item.kind==='webcam');
  if(webcamLink){webcamLink.hidden=!webcamEntry;
    if(webcamEntry)webcamLink.href=buildWebcamFrameUrl(location.href,selected.frameTemplate,normalizeSettings(selected.settings))}monitorPreview.select(selected.id);
  const stats=$('#stats');
  stats.replaceChildren();
  for(const[key,title]of[['readability','Readability'],['flair','Flair'],['motion','Motion'],['retro','Retro']]){const row=document.createElement('div');
    row.className='stat';
    const label=document.createElement('span');
    label.textContent=title;
    const bar=document.createElement('span');
    bar.setAttribute('aria-hidden','true');
    const fill=document.createElement('i');
    fill.style.width=selected.stats[key]*20+'%';
    bar.append(fill);
    const score=document.createElement('b');
    score.textContent=selected.stats[key]+'/5';
    row.append(label,bar,score);
    stats.append(row)}$('#customize').href='editor.html?skin='+encodeURIComponent(selected.id)}
roster.addEventListener('keydown',event=>{const cards=[...roster.querySelectorAll('.skin-card')],index=cards.indexOf(document.activeElement);if(index<0)return;const rowLength=cards.filter(card=>card.offsetTop===cards[0].offsetTop).length||1;let next=index;if(event.key==='ArrowRight')next=Math.min(cards.length-1,index+1);else if(event.key==='ArrowLeft')next=Math.max(0,index-1);else if(event.key==='ArrowDown')next=Math.min(cards.length-1,index+rowLength);else if(event.key==='ArrowUp')next=Math.max(0,index-rowLength);else if(event.key==='Home')next=0;else if(event.key==='End')next=cards.length-1;else return;event.preventDefault();selected=skins.find(s=>s.id===cards[next].dataset.skinId);render();roster.querySelectorAll('.skin-card')[next]?.focus()});

const dialog=$('#use-dialog');
function open(){opener=document.activeElement;
  $('#step-channel').hidden=false;
  $('#step-link').hidden=true;
  $('#channel-error').textContent='';
  $('#channel-name').value='';
  dialog.showModal();
  $('#channel-name').focus()}
$('#use-skin').onclick=open;
$('#close-dialog').onclick=()=>dialog.close();
dialog.addEventListener('close',()=>opener?.focus());

$('#channel-form').onsubmit=async event=>{event.preventDefault();
  const channel=$('#channel-name').value.trim().replace(/^[@#]/,'').toLowerCase();
  if(!/^[a-z0-9_]{1,25}$/.test(channel)){$('#channel-error').textContent='Use 1-25 letters, numbers or underscores.';
    $('#channel-name').focus();
    return}const settings=normalizeSettings({...selected.settings,channel}),overlayUrl=await buildCompactSettingsUrl(location.href,{settings,baseSkinId:selected.id,baseSettings:selected.settings});
  $('#overlay-url').value=overlayUrl;
  $('#step-channel').hidden=true;
  $('#step-link').hidden=false;
  $('#copy-state').textContent=''};

$('#copy-url').onclick=async()=>{try{await navigator.clipboard.writeText($('#overlay-url').value);
    $('#copy-state').textContent='Copied. Add this URL as a Browser Source in OBS.'}catch{$('#overlay-url').select();
    $('#copy-state').textContent='Copy this URL manually.'}};

$('#back-step').onclick=()=>{$('#step-link').hidden=true;
  $('#step-channel').hidden=false;
  $('#channel-name').focus()};

$('#connect-twitch').onclick=()=>{sessionStorage.setItem('chatskinsPendingSkinUse',selected.id);
  saveEditorRestore(sessionStorage,{base:selected.id,state:normalizeSettings(selected.settings)});
  beginTwitchAuth()};

render();
if(new URLSearchParams(location.search).has('skin'))open();



window.__chatskinsPreviewQA=()=>[...document.querySelectorAll('.skin-card')].filter(card=>card.getClientRects().length).map(card=>{const wrapper=card.querySelector('.skin-preview-measure'),preview=card.querySelector('.portrait-preview'),nodes=[...card.querySelectorAll('.skin-live-preview,.skin-live-preview *')].filter(el=>el.matches('.chat-message,.message-body,.chat-name,.channel-name,.chat-badges,.badge')),scale=Number(wrapper?.dataset.scale)||1,minFontPx=nodes.length?Math.min(...nodes.map(el=>(parseFloat(getComputedStyle(el).fontSize)||0)*scale).filter(Boolean)):0;let overflow=false,badgeOnOwnLine=false;if(wrapper&&preview){const a=wrapper.getBoundingClientRect(),b=preview.getBoundingClientRect();overflow=a.left<b.left-1||a.top<b.top-1||a.right>b.right+1||a.bottom>b.bottom+1;for(const row of preview.querySelectorAll('.chat-message')){const badge=row.querySelector('.chat-badges,.badge'),name=row.querySelector('.chat-name,.channel-name');if(badge&&name&&Math.abs(badge.getBoundingClientRect().top-name.getBoundingClientRect().top)>2)badgeOnOwnLine=true}}return{name:card.getAttribute('aria-label')||card.querySelector('b')?.textContent||'',minFontPx,overflow,badgeOnOwnLine}});

