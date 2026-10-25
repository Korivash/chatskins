import {applyChatStyle, applySkinMetadata, createMessage} from './render.js';
import {normalizeSettings} from './settings.js';
import {buildSkinPreviewMessages, createSkinMonitorPreview, previewCanvasSize} from './skin-preview.js';
import {layoutPanel} from './panel-layout.js';
import {attachFrameTemplate,mountIllustrated} from './frame-templates.js';

const $ = selector => document.querySelector(selector);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduced.matches;
let userPaused = false;
const visible = new Set();
const previewRecords = new Set();
const motionAllowed = () => !paused && !document.hidden && !$('#media-dialog').open;
const canRun = element => motionAllowed() && visible.has(element);
const motionButton = $('#motion-toggle');

function updateMotion() {
  paused = reduced.matches || userPaused;
  document.documentElement.classList.toggle('motion-paused', paused || document.hidden || $('#media-dialog').open);
  motionButton.textContent = reduced.matches ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion';
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.setAttribute('aria-label', reduced.matches ? 'Reduced motion follows your device preference' : motionButton.textContent);
  syncVideo();
}
motionButton.addEventListener('click', () => { userPaused = !userPaused; updateMotion(); });
reduced.addEventListener('change', updateMotion);
document.addEventListener('visibilitychange', updateMotion);

const zoneObserver = new IntersectionObserver(entries => {
  for (const {target, isIntersecting} of entries) {
    target.classList.toggle('in-view', isIntersecting);
    if (isIntersecting) visible.add(target); else visible.delete(target);
  }
  syncVideo();
}, {threshold: .06});
document.querySelectorAll('.motion-zone').forEach(zone => zoneObserver.observe(zone));

// One frame per scroll update; only a composited transform changes.
let scrollQueued = false;
function updateProgress() {
  const range = document.documentElement.scrollHeight - innerHeight;
  $('.reading-progress').style.transform = `scaleX(${range > 0 ? scrollY / range : 0})`;
  scrollQueued = false;
}
addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateProgress); } }, {passive: true});
addEventListener('resize', updateProgress);

const teaser = $('#demo-teaser');
function syncVideo() {
  if (!teaser) return;
  if (canRun($('#demo'))) teaser.play().catch(() => {}); else teaser.pause();
}
teaser.addEventListener('loadedmetadata', () => {
  if (teaser.duration > 40) teaser.currentTime = 24;
  syncVideo();
});
teaser.addEventListener('timeupdate', () => {
  if (teaser.currentTime >= 38 && teaser.duration > 40) teaser.currentTime = 24;
});
updateMotion();

const gallery = [
  ['overlay-signature.jpg', 'The signature look', 'ChatSkins Signature overlay displayed over gameplay'],
  ['overlay-guild-chat.jpg', 'Welcome to the guild', 'Guild Chat overlay with Guild, Party and Officer channels'],
  ['overlay-animated.jpg', 'Electric Storm in action', 'The animated Electric Storm skin over a stream'],
  ['chat-play-vote.jpg', 'Let chat decide', 'An on-screen skin vote using Chat play'],
  ['alerts.jpg', 'Alerts with personality', 'Matching alerts configured in the ChatSkins editor'],
  ['how-we-built-it.jpg', 'The agent team', 'The design, build and review workflow behind ChatSkins'],
  ['all-skins.png', 'The complete collection', 'The full ChatSkins collection rendered as a skin catalog'],
];
const dialog = $('#media-dialog');
let opener = null;
let galleryIndex = 0;
let showingVideo = false;
function showImage(index) {
  galleryIndex = (index + gallery.length) % gallery.length;
  const [file, title, alt] = gallery[galleryIndex];
  const img = new Image(); img.src = `site-media/${file}`; img.alt = alt;
  $('#media-content').replaceChildren(img);
  $('#media-title').textContent = title;
  $('#media-position').textContent = `${galleryIndex + 1} / ${gallery.length}`;
}
function openMedia(index = null) {
  opener = document.activeElement;
  showingVideo = index === null;
  $('.lightbox-navigation').hidden = showingVideo;
  if (showingVideo) {
    const video = document.createElement('video');
    video.src = 'site-media/demo.mp4'; video.controls = true; video.playsInline = true;
    video.setAttribute('aria-label', 'Full narrated ChatSkins demonstration');
    $('#media-title').textContent = 'ChatSkins · The full demo';
    $('#media-content').replaceChildren(video);
    dialog.showModal();
    video.play().catch(() => {});
  } else { showImage(index); dialog.showModal(); }
  $('#close-media').focus();
  updateMotion();
}
gallery.forEach(([file, title, alt], index) => {
  const button = document.createElement('button'); button.type = 'button'; button.className = 'gallery-item';
  button.setAttribute('aria-label', `Enlarge: ${title}`);
  const img = new Image(); img.src = `site-media/${file}`; img.alt = alt; img.loading = 'lazy'; img.decoding = 'async'; img.width = 960; img.height = 600;
  const caption = document.createElement('span'); caption.textContent = title;
  const arrow = document.createElement('b'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true'); caption.append(arrow);
  button.append(img, caption); button.addEventListener('click', () => openMedia(index)); $('#gallery-grid').append(button);
});
$('#watch-demo').addEventListener('click', () => openMedia());
$('#close-media').addEventListener('click', () => dialog.close());
$('#previous-media').addEventListener('click', () => showImage(galleryIndex - 1));
$('#next-media').addEventListener('click', () => showImage(galleryIndex + 1));
dialog.addEventListener('keydown', event => {
  if (!showingVideo && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault(); showImage(galleryIndex + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
dialog.addEventListener('close', () => {
  $('#media-content video')?.pause(); $('#media-content').replaceChildren();
  document.body.classList.remove('modal-open'); updateMotion(); opener?.focus();
});
new MutationObserver(() => document.body.classList.toggle('modal-open', dialog.open)).observe(dialog, {attributes: true, attributeFilter: ['open']});

// File names are curated from the real prompt collection; no prompt contents are exposed.
const promptNames = ['DESIGN-PROMPT.md', 'PROMPT.md', 'DESIGN-PROMPT-3.md', 'PROMPT-3.md', 'PROMPT-4g.md', 'DESIGN-PROMPT-6b.md', 'DESIGN-PROMPT-7a.md', 'PROMPT-7f.md', 'DESIGN-PROMPT-8.md', 'PROMPT-8e.md', 'DESIGN-PROMPT-9.md', 'PROMPT-9c.md', 'DESIGN-PROMPT-10.md', 'PROMPT-10g.md', 'DESIGN-PROMPT-11.md', 'PROMPT-11c.md'];
for (let copy = 0; copy < 2; copy++) {
  const group = document.createElement('div'); if (copy) group.setAttribute('aria-hidden', 'true');
  for (const name of promptNames) { const line = document.createElement('p'); line.textContent = name; group.append(line); }
  $('#prompt-lines').append(group);
}

function countStats() {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      const start = performance.now();
      const counters = [...entry.target.querySelectorAll('[data-count]')];
      function frame(now) {
        const progress = paused ? 1 : Math.min(1, (now - start) / 1400);
        for (const node of counters) node.textContent = Math.round(Number(node.dataset.count) * (1 - (1 - progress) ** 3)) + (node.dataset.suffix || '');
        if (progress < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
  }, {threshold: .3});
  observer.observe($('#numbers'));
}

const resizeObserver = new ResizeObserver(entries => {
  for (const {target} of entries) fitPreview(target._preview);
});
const previewObserver = new IntersectionObserver(entries => {
  for (const {target, isIntersecting} of entries) {
    target.classList.toggle('preview-offscreen', !isIntersecting);
    if (isIntersecting && !target._preview && target._skin) renderPreview(target, target._skin, 2);
  }
}, {rootMargin: '80px'});
function fitPreview(record) {
  if (!record) return;
  const {host, wrapper} = record;
  const scale = Math.min((host.clientWidth - 32) / Math.max(wrapper.offsetWidth,1), (host.clientHeight - 30) / Math.max(wrapper.offsetHeight,1));
  wrapper.style.transform = `translate(-50%, -50%) scale(${Math.max(.05, scale)})`;
}
const handles = ['Korivash', 'ModBot', 'CapsLock', 'RaidParty', 'PixelPilot', 'GGcrew'];
function previewMessages(skin, count) {
  return buildSkinPreviewMessages(skin, count).map((message, index) => ({...message, username: handles[index % handles.length], login: handles[index % handles.length].toLowerCase()}));
}
function renderPreview(host, skin, count = 4, history = null) {
  if (host._preview) previewRecords.delete(host._preview);
  const settings = applySkinMetadata(normalizeSettings(skin.settings), skin);
  settings.reduceMotion = paused;
  settings.animationIn = 'none';
  for (const part of Object.values(settings.parts || {})) part.fontSize = 23;
  const wrapper = document.createElement('div'); wrapper.className = 'preview-measure preview-virtual-stage';
  const canvasSize=previewCanvasSize(skin),canvas = document.createElement('div'); canvas.className = 'source preview-virtual-canvas'; canvas.style.width = `${canvasSize.width}px`; canvas.style.height = `${canvasSize.height}px`; wrapper.style.width=`${canvasSize.width}px`;wrapper.style.height=`${canvasSize.height}px`;
  const chat = document.createElement('div'); chat.className = 'chat chat-panel skin-live-preview';
  applyChatStyle(chat, settings);
  const messages = history || previewMessages(skin, count);
  for (const message of messages) chat.append(createMessage(message, settings));
  canvas.append(chat); wrapper.append(canvas); host.replaceChildren(wrapper); host.dataset.skinId = skin.id;
  const record = {host, wrapper, canvas, chat, settings, messages}; host._preview = record; previewRecords.add(record);
  const layout=()=>layoutPanel(canvas,chat,settings,canvasSize.height);
  layout();
  const frameReady=attachFrameTemplate(chat,settings,{skin,layout});
  const illustrationReady=mountIllustrated(chat,settings,skin);
  host.classList.toggle('preview-loading',!!skin.frameTemplate||!!skin.illustration);
  Promise.all([frameReady,illustrationReady]).then(()=>{
    if(host._preview!==record)return;
    layout();host.classList.remove('preview-loading');fitPreview(record);
  });
  resizeObserver.observe(host); fitPreview(record);
  return record;
}
document.fonts.ready.then(() => previewRecords.forEach(fitPreview));

const phrases = ['This skin is a whole mood.', 'GG! Run it back.', 'Chat understood the assignment.', 'One more quest?', 'That frame looks so good.', 'Ready for the next raid!'];
let messageIndex = 0;
function addMessage(host) {
  const record = host._preview; if (!record) return;
  const message = {id: `readme-${messageIndex}`, fake: true, username: handles[messageIndex % handles.length], text: phrases[messageIndex % phrases.length], badges: {}};
  messageIndex++;
  record.messages.push(message);
  const row = createMessage(message, record.settings); record.chat.append(row);
  if (motionAllowed()) row.animate([{opacity: 0, transform: 'translateY(14px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 320, easing: 'ease-out'});
  if (record.messages.length > 4) { record.messages.shift(); record.chat.querySelector('.message')?.remove(); }
  fitPreview(record);
}

async function initializeSkins() {
  const response = await fetch('design/skins.json');
  if (!response.ok) throw new Error('Skin collection unavailable');
  const {skins} = await response.json();
  if (!skins?.length) throw new Error('Skin collection empty');
  $('#skin-count').dataset.count = skins.length; $('#skin-count').textContent = skins.length;
  const animated = skins.filter(skin => skin.category === 'Animated').length;
  $('#animated-count').dataset.count = animated; $('#animated-count').textContent = animated;
  const byId = id => skins.find(skin => skin.id === id);
  const signature = byId('chatskins-signature') || skins[0];
  const guild = skins.find(skin => skin.name === 'Guild Chat') || skins[1];
  const heroSkins = [signature, guild, ...skins.filter(skin => ['Electric Storm', 'Retro RPG Dialog Box', 'Aurora', 'Bubble Lift'].includes(skin.name))];
  let heroIndex = 0;
  function nextHero() {
    const skin = heroSkins[heroIndex++ % heroSkins.length];
    const history = $('#hero-preview')._preview?.messages;
    renderPreview($('#hero-preview'), skin, 4, history);
    $('#hero-skin-name').textContent = skin.name;
  }
  nextHero();
  $('#next-skin').addEventListener('click', nextHero);
  const wall = $('#skin-wall'); wall.replaceChildren();
  for (const category of ['Game styles', 'Streamer favorites', 'Animated', 'Colorful']) {
    const groupSkins = skins.filter(skin => skin.category === category);
    const row = document.createElement('div'); row.className = 'wall-category';
    const label = document.createElement('p'); label.className = 'category-label';
    const name = document.createElement('b'); name.textContent = category; label.append(name, ` / ${groupSkins.length} looks`);
    const marquee = document.createElement('div'); marquee.className = 'marquee';
    const track = document.createElement('div'); track.className = 'marquee-track'; track.style.setProperty('--marquee-duration', `${groupSkins.length * 9}s`);
    for (let copy = 0; copy < 2; copy++) {
      const group = document.createElement('div'); group.className = 'marquee-group'; if (copy) group.setAttribute('aria-hidden', 'true');
      for (const skin of groupSkins) {
        const tile = document.createElement('a'); tile.className = 'skin-tile'; tile.href = `/skins.html?skin=${encodeURIComponent(skin.id)}`;
        if (copy) tile.tabIndex = -1;
        const host = document.createElement('div'); host.className = 'preview-host preview-offscreen'; host.setAttribute('aria-hidden', 'true'); host._skin = skin;
        const title = document.createElement('span'); title.className = 'tile-title'; title.textContent = skin.name;
        tile.append(host, title); group.append(tile); previewObserver.observe(host);
        tile.addEventListener('focus', () => { if (!host._preview) renderPreview(host, skin, 2); tile.scrollIntoView({block:'nearest', inline:'nearest', behavior:'instant'}); });
      }
      track.append(group);
    }
    marquee.append(track); row.append(label, marquee); wall.append(row);
  }
  const playHost = $('#play-preview');
  const monitor = createSkinMonitorPreview(signature.id, id => {
    const skin = byId(id) || signature;
    renderPreview(playHost, skin, 4, playHost._preview?.messages);
    $('#play-skin-name').textContent = skin.name;
  });
  monitor.select(signature.id);
  function skinCommand() {
    monitor.select(guild.id);
    $('#play-status').textContent = '!skin guild → Guild Chat equipped. The conversation stays.';
  }
  let manualPlay = false;
  $('#command-skin').addEventListener('click', () => { manualPlay = true; skinCommand(); });
  let voteStarted = 0;
  let voteRunning = false;
  function setVotes(values) {
    ['guild', 'neon', 'retro'].forEach((name, index) => {
      $(`#vote-${name}`).style.transform = `scaleX(${values[index] / 100})`;
      $(`#votes-${name}`).textContent = `${values[index]}%`;
    });
  }
  function finishVote() {
    voteRunning = false; setVotes([58,27,15]); monitor.select(guild.id);
    $('#vote-status').textContent = 'Guild wins!';
    $('#play-status').textContent = 'Vote complete. Guild wins with 58% — skin equipped.';
  }
  function startVote() {
    voteStarted = performance.now(); voteRunning = true;
    $('#vote-status').textContent = 'Voting…'; $('#play-status').textContent = '!skinvote → Chat is choosing the next skin.';
    if (paused) finishVote(); else setVotes([33,34,33]);
  }
  $('#command-vote').addEventListener('click', () => { manualPlay = true; startVote(); });
  function emoteRain() {
    const host = $('#emote-rain'); host.replaceChildren();
    $('#play-status').textContent = 'Emote rain! A sample of a channel point effect. ✦ ♥ ✦';
    if (paused) return;
    for (let i = 0; i < 22; i++) {
      const emote = document.createElement('span'); emote.className = 'rain-emote'; emote.textContent = ['💙','✦','🎮','🔥'][i % 4];
      emote.style.setProperty('--x', `${(i * 37) % 94}%`); emote.style.setProperty('--delay', `${i * .055}s`);
      emote.addEventListener('animationend', () => emote.remove(), {once:true}); host.append(emote);
    }
  }
  $('#command-rain').addEventListener('click', () => { manualPlay = true; emoteRain(); });
  let heroTick = 0, playTick = 0, lastTick = performance.now();
  setInterval(() => {
    const now = performance.now(); const elapsed = Math.min(now - lastTick, 1000); lastTick = now;
    if (!motionAllowed()) { if (voteRunning) voteStarted += elapsed; return; }
    if (canRun($('.hero'))) {
      heroTick += elapsed;
      if (Math.floor(heroTick / 2600) !== Math.floor((heroTick - elapsed) / 2600)) addMessage($('#hero-preview'));
      if (heroTick > 7200) { heroTick = 0; nextHero(); }
    }
    if (canRun($('#chat-play'))) {
      playTick += elapsed;
      if (voteRunning) {
        const progress = (now - voteStarted) / 4800;
        if (progress >= 1) finishVote();
        else { const a = Math.round(33 + 25 * progress), b = Math.round(34 - 7 * progress); setVotes([a,b,100-a-b]); }
      }
      if (!manualPlay) {
        if (playTick > 18000) { playTick = 0; emoteRain(); }
        else if (playTick >= 3500 && playTick - elapsed < 3500) skinCommand();
        else if (playTick >= 8500 && playTick - elapsed < 8500) startVote();
      }
    } else if (voteRunning) voteStarted += elapsed;
  }, 250);
}

initializeSkins().catch(() => {
  for (const id of ['hero-preview', 'play-preview', 'skin-wall']) {
    const link = document.createElement('a'); link.className = 'button secondary'; link.href = '/skins.html'; link.textContent = 'Explore the skin collection'; $(`#${id}`).replaceChildren(link);
  }
  $('#play-status').textContent = 'Live previews are unavailable. You can still explore the gallery and demo.';
  ['next-skin', 'command-skin', 'command-vote', 'command-rain'].forEach(id => { $(`#${id}`).disabled = true; });
}).finally(() => { countStats(); updateProgress(); });
