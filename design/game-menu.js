/* Design interaction prototype only. No application imports, OAuth, requests or real overlay serialization. */
(() => {
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const catalog=window.reviewSkins, reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let lastBleep=0;
 let paused=reduced.matches, sound=false, audio, selected=catalog.find(s=>s.id===new URLSearchParams(location.search).get('skin'))||catalog[0];
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function bleep(){if(!sound||performance.now()-lastBleep<80)return;lastBleep=performance.now();try{audio||=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;o.type='sine';o.frequency.setValueAtTime(660,t);o.frequency.exponentialRampToValueAtTime(880,t+.045);g.gain.setValueAtTime(.018,t);g.gain.exponentialRampToValueAtTime(.001,t+.07);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.08);}catch{sound=false;$('#sound').textContent='Sound unavailable';$('#sound').setAttribute('aria-pressed','false');}}
 $('#sound').onclick=()=>{sound=!sound;$('#sound').textContent=sound?'♫ Sound on':'♫ Sound off';$('#sound').setAttribute('aria-pressed',String(sound));bleep();};
 function syncPause(){document.body.classList.toggle('paused',paused||reduced.matches);$('#pause').textContent=reduced.matches?'Motion off (device)':paused?'Resume motion':'Pause motion';$('#pause').disabled=reduced.matches;$('#pause').setAttribute('aria-pressed',String(paused));}
 $('#pause').onclick=()=>{paused=!paused;syncPause();};reduced.addEventListener('change',syncPause);syncPause();
 function chat(el,skin,mini=false){if(!el)return;el.className='chat-sample '+skin.id;el.style.cssText=`--skin-bg:${skin.bg};--skin-border:${skin.border};--skin-text:${skin.text};--skin-name:${skin.nameColor};--skin-radius:${Math.min(skin.radius,24)}px`;
 const rows=mini?[['moss','one more run?'],['luna','we’re so back ✦']]:[['orbit','chat, we made it'],['moss','okay this looks SO good'],['luna','one more run? ✦ ✦ ✦']];
 el.innerHTML=rows.map(([n,t])=>`<div class="msg"><b>${n}</b><span>${t}</span></div>`).join('');}
 let lastOpener;
 function openDialog(d){lastOpener=document.activeElement;d.showModal();}
 $$('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
 $$('dialog').forEach(d=>d.addEventListener('close',()=>lastOpener?.focus()));
 $$('[data-quest]').forEach(b=>b.onclick=()=>{const d=$('#quest-dialog'),f=d.querySelector('iframe');if(!f.src)f.src=f.dataset.src;openDialog(d);});
 if(new URLSearchParams(location.search).has('embed')){document.querySelector('.topbar').hidden=true;document.querySelector('.footer').hidden=true;$('.quest-layout>section:first-child').hidden=true;$('.quest-layout').style.gridTemplateColumns='1fr';$('.state-specimens').hidden=true;}
 // Title screen keyboard navigation is limited to the menu and otherwise-unfocused page.
 if($('.menu')){
 const entries=$$('.menu a,.menu button');let index=0;
 function mark(i,focus=false){index=(i+entries.length)%entries.length;entries.forEach((e,j)=>e.classList.toggle('selected',j===index));if(focus)entries[index].focus();bleep();}
 entries.forEach((e,i)=>{e.addEventListener('pointerenter',()=>mark(i));e.addEventListener('focus',()=>{index=i;entries.forEach((x,j)=>x.classList.toggle('selected',j===i));});});
 document.addEventListener('keydown',e=>{if($('dialog[open]'))return;const idle=e.target===document.body,menu=entries.includes(e.target);if((idle||menu)&&['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();mark(index+(e.key==='ArrowDown'?1:-1),true);}else if(idle&&['Enter',' '].includes(e.key)){e.preventDefault();location.href='skins-mockup.html';}else if(e.target.matches('.start')&&e.key===' '){e.preventDefault();e.target.click();}});
 const featured=catalog.filter(s=>s.featured);let i=0;
 function show(){chat($('#hero-chat'),featured[i]);$('#hero-name').textContent=featured[i].name;$('#hero-count').textContent=`${i+1} / ${featured.length}`;}
 $('#previous').onclick=()=>{i=(i+featured.length-1)%featured.length;show();bleep();};$('#next').onclick=()=>{i=(i+1)%featured.length;show();bleep();};show();
 setInterval(()=>{if(paused||reduced.matches||document.hidden||!$('#hero-chat').getBoundingClientRect().bottom||$('.attract').getBoundingClientRect().bottom<0)return;i=(i+1)%featured.length;show();},6000);
 }
 function select(s){selected=s;chat($('#selected-chat'),s);if($('#selected-name')){$('#selected-name').textContent=s.name;$('#selected-description').textContent=s.description;$('#customize-link').href='editor-mockup.html?skin='+s.id;$('#stats').innerHTML=Object.entries(s.stats).map(([k,v])=>`<div class="stat"><span>${k[0].toUpperCase()+k.slice(1)}</span><span class="segments" aria-hidden="true">${Array.from({length:5},(_,i)=>'<i class="'+(i<v?'on':'')+'"></i>').join('')}</span><span>${v}/5</span></div>`).join('');$$('.portrait').forEach(b=>{const yes=b.dataset.skin===s.id;b.setAttribute('aria-pressed',String(yes));b.querySelector('.chosen').textContent=yes?'◆ Selected':(catalog.find(x=>x.id===b.dataset.skin).featured?'Featured':'Select skin');});}}
 if($('#portraits')){
 function roster(group){const skins=catalog.filter(s=>s.category===group);$('#portraits').innerHTML=skins.map(s=>`<button class="portrait" data-skin="${s.id}" aria-pressed="false"><span class="chat-sample" aria-hidden="true"></span><h3>${esc(s.name)}</h3><span class="chosen">Select skin</span></button>`).join('');$('#roster-count').textContent=`${skins.length} skins / ${group}`;$$('.portrait').forEach((b,i)=>{chat(b.querySelector('.chat-sample'),skins[i],true);const activate=()=>{select(skins[i]);bleep();};b.onclick=activate;b.onpointerenter=activate;b.onfocus=()=>select(skins[i]);b.onkeydown=e=>{const cols=getComputedStyle($('#portraits')).gridTemplateColumns.split(' ').length;const shifts={ArrowRight:1,ArrowLeft:-1,ArrowDown:cols,ArrowUp:-cols,Home:-i,End:skins.length-i-1};if(e.key in shifts){e.preventDefault();const n=Math.max(0,Math.min(skins.length-1,i+shifts[e.key]));$$('.portrait')[n].focus();bleep();}};});select(skins.find(s=>s.id===selected.id)||skins[0]);}
 $$('[data-group]').forEach(b=>b.onclick=()=>{$$('[data-group]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));roster(b.dataset.group);bleep();});roster('Streamer favorites');
 }
 if($('#editor-chat')){
 chat($('#editor-chat'),selected);$('#loadout-name').textContent=selected.name;$('#equipped-name').textContent=selected.name;
 $('#advanced-toggle').onchange=e=>{$('#advanced-controls').hidden=!e.target.checked;$('#simple-controls').hidden=e.target.checked;};
 const el=$('#editor-chat');$('#accent').value=selected.nameColor;$('#accent-hex').value=selected.nameColor;
 function edited(){$('#modified').textContent='/ Modified';}
 $('#font').onchange=e=>{el.style.fontFamily=e.target.value;edited();};
 function size(v){if(!Number.isFinite(+v)||+v<12||+v>48)return;$('#size').value=v;$('#size-number').value=v;el.style.fontSize=(+v*.73)+'px';edited();}$('#size').oninput=e=>size(e.target.value);$('#size-number').oninput=e=>size(e.target.value);
 function accent(v){if(!/^#[\da-f]{6}$/i.test(v))return;$('#accent').value=v;$('#accent-hex').value=v;el.style.setProperty('--skin-name',v);el.style.setProperty('--skin-border',v);edited();}$('#accent').oninput=e=>accent(e.target.value);$('#accent-hex').oninput=e=>accent(e.target.value);
 $('#frame').onchange=e=>{el.querySelectorAll('.msg').forEach(x=>x.style.borderWidth=e.target.checked?'2px':'0');edited();};
 $('#background').onchange=e=>{el.style.setProperty('--skin-bg',e.target.value==='Transparent'?'transparent':selected.bg+(e.target.value==='Glass'?'db':''));edited();};
 $('#entrance').onchange=e=>{el.querySelector('.msg:last-child').style.animation=e.target.value==='None'?'none':'';edited();};
 const backgrounds={stream:'',dark:'#101528',light:'#e9ecf3',checker:'repeating-conic-gradient(#435570 0% 25%,#1b2640 0% 50%) 0 / 24px 24px'};
 $$('[data-backdrop]').forEach(b=>b.onclick=()=>{el.closest('.screen').style.background=backgrounds[b.dataset.backdrop];$$('[data-backdrop]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
 }
 if($('#use-dialog')){
 $$('[data-use]').forEach(b=>b.onclick=()=>{$('#use-title').textContent='Use '+selected.name;$('#use-step1').hidden=false;$('#use-step2').hidden=true;openDialog($('#use-dialog'));$('#channel').focus();});
 $('#connect').onclick=()=>{$('#channel-error').textContent='Twitch sign-in is unavailable in this design study. Type your channel name to continue.';$('#channel').focus();};
 $('#channel-form').onsubmit=e=>{e.preventDefault();const channel=$('#channel').value.trim().toLowerCase();if(!/^[a-z0-9_]{1,25}$/.test(channel))return;$('#overlay-link').value=`https://example.invalid/overlay#channel=${encodeURIComponent(channel)}&skin=${selected.id}`;$('#use-step1').hidden=true;$('#use-step2').hidden=false;$('#overlay-link').focus();};
 $('#back-channel').onclick=()=>{$('#use-step1').hidden=false;$('#use-step2').hidden=true;$('#channel').focus();};
 $('#copy').onclick=async()=>{try{await navigator.clipboard.writeText($('#overlay-link').value);$('#copy-status').textContent='Example copied. Production will generate the complete OBS link.';}catch{$('#overlay-link').select();$('#copy-status').textContent='Copy this example manually. Select the URL and copy it.';}};
 }
 if($('#quest-form')){
 ['#quest-color1','#quest-color2'].forEach(s=>$(s).oninput=()=>{$('[name=colors]').value=$('#quest-color1').value+', '+$('#quest-color2').value;});
 $('#quest-form').onsubmit=e=>{e.preventDefault();const state=$('#quest-outcome').value,status=$('#quest-status'),desc=$('[name=description]');desc.removeAttribute('aria-invalid');desc.removeAttribute('aria-describedby');status.className=state==='success'?'notice':'notice error';const messages={success:'Quest posted! The guild has been notified.',invalid:'Check the highlighted fields. Description must be 800 characters or fewer.',limited:'Quest board is busy. Try again in 42 minutes. Your draft is safe.',failed:'Your quest couldn’t be delivered. Your draft is still here. Try again.'};status.textContent=messages[state]+(state==='success'?' (Simulated; nothing was sent.)':'');if(state==='invalid'){desc.setAttribute('aria-invalid','true');desc.setAttribute('aria-describedby','quest-status');desc.focus();}else status.focus();};
 }
})();
