/** Ask ChatSkins site widget: static walkthroughs plus the optional guide API. */
export const STARTER_PROMPTS=Object.freeze(['How do I add this to OBS?','Make it match my brand','Turn on channel points','Why isn\'t chat showing?']);
/** Return the safe viewport offset needed to clear the editor's fixed action bar. */
export function assistantLauncherOffset(dockHeight=0){return Math.max(22,Math.ceil((Number(dockHeight)||0)+12))}
export function containsPrivateDetails(value){return /\b(?:password|passcode|access[_ -]?token|refresh[_ -]?token|client[_ -]?secret)\b\s*[:=]|oauth:[a-z0-9]{16,}|\b[A-Za-z0-9_-]{32,}\b|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|(?:\+?\d[\s().-]*){9,}/i.test(String(value))}
export const TOURS=Object.freeze({
 'obs-setup':{title:'Add your chat to OBS',steps:[['Browse skins','Choose a look on the Skins page.','#roster'],['Open Get link','In Customize, choose Get link.','#options-tab-link'],['Copy your link','Copy the one OBS link.','#guided-copy'],['Add a Browser Source','In OBS, add a Browser Source and paste your link.',''],['Set the size','Set the source to 1280 × 720 and place it above your game.','']]},
 frames:{title:'Choose a frame',steps:[['Pick a frame skin','Choose a frame style in Skins or Customize.','#frame-card'],['Set its color','Choose a frame color or match your brand.','#template-color'],['Tune the glow','Set glow strength and motion.','#template-glow-strength']]},
 'chat-commands':{title:'Turn on chat commands',steps:[['Open Viewers','Go to the Viewers tab.','#options-tab-viewers'],['Connect channel points','Use the setup card if you want viewer rewards.','#chat-play-section'],['Try a command','Test the preview, then share the one OBS link.','#guided-copy']]},
 alerts:{title:'Set up alerts',steps:[['Open Alerts','Go to the Alerts tab.','#options-tab-alerts'],['Connect alerts','Choose the Twitch setup button.','#alerts-connect'],['Preview an alert','Send a test alert before adding the link to OBS.','[data-alert-test]']]},
 'place-it':{title:'Place your chat',steps:[['Open the preview','Go to Customize.','#stage'],['Choose Place it','Turn on Place it above the preview.','#place-toggle'],['Move and resize','Drag the chat or use a fit position.','#place-tools']]}
});
const ACTION_LABELS={look:0,style:2,chat:3,viewers:4,alerts:5,getlink:6,studio:1};
const HIGHLIGHT_TARGETS=Object.freeze({'Place it':'#place-toggle','Get my OBS link':'#get-link','Set up everything with Twitch':'#guided-connect','Frame color':'#template-color','Match my brand color':'#match-brand-color','Chat commands':'#guided-commands','Channel points':'#guided-points','Send test alert':'[data-alert-test]','Chat size':'#simple-size','Transparent background':'#transparent-toggle','Studio':'#options-tab-studio','Pause previews':'[data-motion]'});
const DOC_PATHS={};
export function canRunAssistantAction(action){if(!action||typeof action!=='object')return false;switch(action.type){case'create_design':return typeof action.prompt==='string'&&action.prompt.trim().length>0&&[...action.prompt].length<=300;case'apply_style':return !!action.settings&&typeof action.settings==='object'&&!Array.isArray(action.settings);case'open_tab':return Object.hasOwn(ACTION_LABELS,action.tab);case'highlight':return Object.hasOwn(HIGHLIGHT_TARGETS,action.control);case'start_walkthrough':return Object.hasOwn(TOURS,action.id);case'open_doc':return /^[a-z0-9-]{1,80}$/.test(action.slug);default:return false}}
export function createWalkthrough(id){const tour=TOURS[id];return tour?{id,title:tour.title,steps:tour.steps.map(([title,text,selector])=>({title,text,selector})),index:0}:null}
const el=(doc,tag,attrs={},text='')=>{const node=doc.createElement(tag);for(const[key,value]of Object.entries(attrs)){if(key==='class')node.className=value;else if(key==='text')node.textContent=value;else node.setAttribute(key,value)}if(text)node.textContent=text;return node};
function formatAssistantText(doc,row,text){
 // Keep model replies as plain text. Build only paragraph and numbered-list nodes.
 const lines=String(text).split(/\r?\n/);let list=null,paragraph=[];
 const flush=()=>{if(!paragraph.length)return;row.append(el(doc,'p',{},paragraph.join(' ')));paragraph=[]};
 for(const line of lines){const numbered=line.match(/^\s*\d+[.)]\s+(.+)$/);if(numbered){flush();if(!list){list=el(doc,'ol');row.append(list)}list.append(el(doc,'li',{},numbered[1]));continue}if(!line.trim()){flush();list=null;continue}list=null;paragraph.push(line.trim())}flush();
}
function messageNode(doc,role,text){const row=el(doc,'div',{class:`ask-message ask-${role}`,'data-role':role});if(role==='assistant')formatAssistantText(doc,row,text);else row.textContent=text;return row}
export function mountAskChat(document=globalThis.document,{fetcher=globalThis.fetch,storage=globalThis.sessionStorage,location=globalThis.location}={}){
 if(!document?.body||document.querySelector('#ask-chatskins'))return null;const root=el(document,'div',{id:'ask-chatskins'}),launcher=el(document,'button',{type:'button',class:'ask-launcher','aria-expanded':'false','aria-controls':'ask-panel'},'Need help? Ask ChatSkins'),panel=el(document,'section',{id:'ask-panel',class:'ask-panel',role:'dialog','aria-modal':'true','aria-labelledby':'ask-title',hidden:''});
 // Observe the dock so the launcher remains clear at desktop and phone sizes.
 const dock=document.querySelector('#options-dock');
 const positionLauncher=()=>{if(!dock)return;const height=dock.getBoundingClientRect?.().height||dock.offsetHeight||0;const offset=`${assistantLauncherOffset(height)}px`;if(root.style.setProperty)root.style.setProperty('--ask-launcher-bottom',offset);else root.style['--ask-launcher-bottom']=offset};
 positionLauncher();globalThis.addEventListener?.('resize',positionLauncher);if(dock&&typeof ResizeObserver!=='undefined'){const observer=new ResizeObserver(positionLauncher);observer.observe(dock)}
 const header=el(document,'header',{class:'ask-header'}),heading=el(document,'h2',{id:'ask-title'},'Ask ChatSkins'),clear=el(document,'button',{type:'button',class:'ask-clear'},'Clear'),close=el(document,'button',{type:'button',class:'ask-close','aria-label':'Close help'},'×');header.append(heading,clear,close);
 const log=el(document,'div',{class:'ask-log','aria-live':'polite','aria-relevant':'additions text',tabindex:'0'}),chips=el(document,'div',{class:'ask-starters','aria-label':'Common questions'});for(const prompt of STARTER_PROMPTS){const chip=el(document,'button',{type:'button',class:'ask-chip'},prompt);chip.addEventListener('click',()=>send(prompt));chips.append(chip)}
 const fallback=el(document,'div',{class:'ask-fallback',hidden:''}),fallbackTitle=el(document,'strong',{},'Quick answers'),faq=el(document,'div',{class:'ask-faq'});for(const [question,answer,slug] of [['How do I add it to OBS?','Copy your one OBS link, add a Browser Source, paste the complete link and set 1280 × 720.','getting-started'],['Chat is not showing','Check the channel name, complete link, Browser Source size and source order. Then send a test message.','troubleshooting'],['Where are the frames?','Choose a frame skin, then adjust its color, glow and title in Customize.','frames']]){const details=el(document,'details'),summary=el(document,'summary',{},question),body=el(document,'p',{},answer),link=el(document,'a',{href:`/docs/#/page/${slug}`},'Read the Docs');details.append(summary,body,link);faq.append(details)}fallback.append(fallbackTitle,faq);
 const guidesButton=el(document,'button',{type:'button',class:'ask-guides-toggle','aria-expanded':'false'},'Setup guides'),tours=el(document,'div',{class:'ask-tours',hidden:''});for(const [id,tour]of Object.entries(TOURS)){const button=el(document,'button',{type:'button','data-tour':id},tour.title);button.addEventListener('click',()=>startTour(id));tours.append(button)}guidesButton.addEventListener('click',()=>{const showGuides=tours.hidden;tours.hidden=!showGuides;fallback.hidden=!showGuides;guidesButton.setAttribute('aria-expanded',String(showGuides))});
 const note=el(document,'p',{class:'ask-note'},'Uses OpenAI. Don\'t share personal info.'),form=el(document,'form',{class:'ask-form'}),input=el(document,'textarea',{name:'message',rows:'2',maxlength:'500','aria-label':'Ask a ChatSkins setup question',placeholder:'Ask about your chat setup…',required:''}),submit=el(document,'button',{type:'submit',class:'ask-send'},'Send'),status=el(document,'p',{class:'ask-status','aria-live':'polite',role:'status'});form.append(input,submit);panel.append(header,log,chips,guidesButton,tours,fallback,note,form,status);root.append(launcher,panel);document.body.append(root);
 const spotlight=el(document,'div',{class:'ask-spotlight',hidden:'','aria-hidden':'true'}),tourCard=el(document,'section',{class:'ask-tour-card',role:'dialog','aria-modal':'true','aria-labelledby':'ask-tour-title',hidden:''}),tourTitle=el(document,'h2',{id:'ask-tour-title'}),tourText=el(document,'p'),tourCount=el(document,'p',{class:'ask-tour-count','aria-live':'polite'}),tourBack=el(document,'button',{type:'button'},'Back'),tourNext=el(document,'button',{type:'button'},'Next'),tourExit=el(document,'button',{type:'button'},'End guide');tourCard.append(tourTitle,tourText,tourCount,tourBack,tourNext,tourExit);document.body.append(spotlight,tourCard);
 const key='chat-studio.ask-chatskins.v1';let history=[];try{const saved=JSON.parse(storage?.getItem(key)||'[]');if(Array.isArray(saved))history=saved.filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string').slice(-8)}catch{}for(const message of history)log.append(messageNode(document,message.role,message.content));if(history.some(message=>message.role==='user'))chips.hidden=true;
 const save=()=>{try{storage?.setItem(key,JSON.stringify(history.slice(-8)))}catch{}};
 function add(role,text){const safe=String(text||'').slice(0,1200);log.append(messageNode(document,role,safe));log.scrollTop=log.scrollHeight;if(role==='user'||role==='assistant'){history.push({role,content:safe});history=history.slice(-8);save()}if(role==='user')chips.hidden=true}
 function addNote(text){const notes=el(document,'div',{class:'ask-action-notes','aria-label':'Changes made'});notes.append(el(document,'span',{class:'ask-action-note'},text));log.append(notes);log.scrollTop=log.scrollHeight}
 function focusable(container){return[...container.querySelectorAll('button:not([disabled]),textarea:not([disabled]),a[href],summary,[tabindex="0"]')].filter(node=>!node.hidden)}
 function open(){panel.hidden=false;launcher.setAttribute('aria-expanded','true');fallback.hidden=true;input.focus()}
 function closePanel(){panel.hidden=true;launcher.setAttribute('aria-expanded','false');launcher.focus()}
 let tour=null,highlighted=null;
 function updateTour(){const step=tour.steps[tour.index];tourTitle.textContent=tour.title;tourText.textContent=step.text;tourCount.textContent=`Step ${tour.index+1} of ${tour.steps.length} · ${step.title}`;tourBack.disabled=tour.index===0;tourNext.textContent=tour.index===tour.steps.length-1?'Done':'Next';const target=step.selector?document.querySelector(step.selector):null;if(highlighted)highlighted.classList.remove('ask-target-highlight');highlighted=target;if(target){target.classList.add('ask-target-highlight');target.scrollIntoView?.({block:'center',behavior:'smooth'});const rect=target.getBoundingClientRect(),vw=globalThis.innerWidth||globalThis.document?.documentElement?.clientWidth||1024,vh=globalThis.innerHeight||globalThis.document?.documentElement?.clientHeight||720;Object.assign(spotlight.style,{left:`${Math.max(4,rect.left-6)}px`,top:`${Math.max(4,rect.top-6)}px`,width:`${Math.min(vw-8,rect.width+12)}px`,height:`${Math.min(vh-8,rect.height+12)}px`});spotlight.hidden=false}else spotlight.hidden=true;tourCard.hidden=false;tourNext.focus()}
 function endTour(){tourCard.hidden=true;spotlight.hidden=true;highlighted?.classList.remove('ask-target-highlight');highlighted=null;tour=null}
 function startTour(id){const next=createWalkthrough(id);if(!next)return;open();tour=next;add('assistant',`Starting guide: ${tour.title}.`);updateTour()}
 tourBack.addEventListener('click',()=>{if(tour&&tour.index>0){tour.index--;updateTour()}});tourNext.addEventListener('click',()=>{if(!tour)return;if(tour.index+1<tour.steps.length){tour.index++;updateTour()}else endTour()});tourExit.addEventListener('click',endTour);
 async function execute(action){
  if(!canRunAssistantAction(action)){add('assistant','I could not run that action.');return}
  if(action.type==='create_design'){
   try{
    // The server normally includes the completed Dream result. Keep the
    // endpoint fallback while older cached sessions are still in use.
    let dream=action.dream;
    if(!dream){
     const response=await fetcher('/api/dream',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text:action.prompt,name:document.querySelector('#channel')?.value||''})});
     dream=await response.json();
     if(!response.ok||!dream.ok){addNote(dream.message||'I could not create that design just now.');return}
    }
    if(document.querySelector('#options-tab-look')){
     document.querySelector('#options-tab-studio')?.click();
     document.dispatchEvent(new CustomEvent('chatskins:dream-generated',{detail:{dream}}));
     addNote('Created design · Undo');
     if(dream.paintMessage)addNote(dream.paintMessage);
    }else{
     try{storage?.setItem('chat-studio.dream.pending.v1',JSON.stringify(dream))}catch{}
     location.href=new URL('/editor.html?assistantTab=studio',location.href).href;
    }
   }catch{addNote('I could not create that design just now.')}
   return;
  }
  if(action.type==='apply_style'){
   if(!document.querySelector('#options-tab-look')){try{storage?.setItem('chat-studio.ask-style.pending.v1',JSON.stringify(action))}catch{}location.href=new URL('/editor.html?assistantApply=1&assistantTab=look',location.href).href;add('assistant','Opening Customize to apply your look.');return}
   document.dispatchEvent(new CustomEvent('chatskins:assistant-action',{detail:action}));addNote('Applied your new look');return;
  }
  if(action.type==='open_tab'){
   if(!document.querySelector('#options-tab-look')){location.href=new URL(`/editor.html?assistantTab=${encodeURIComponent(action.tab)}`,location.href).href;return}
   document.querySelector(`#options-tab-${action.tab}`)?.click();add('assistant',`Opened ${action.tab==='getlink'?'Get link':action.tab[0].toUpperCase()+action.tab.slice(1)} tab.`);return;
  }
  if(action.type==='highlight'){
   const selector=HIGHLIGHT_TARGETS[action.control],tab=action.control==='Frame color'||action.control==='Match my brand color'?'style':action.control==='Get my OBS link'?'getlink':action.control==='Place it'?'look':action.control==='Send test alert'?'alerts':action.control==='Studio'?'studio':'viewers';
   if(!document.querySelector('#options-tab-look')){location.href=new URL(`/editor.html?assistantHighlight=${encodeURIComponent(action.control)}`,location.href).href;return}
   document.querySelector(`#options-tab-${tab}`)?.click();const target=document.querySelector(selector);
   if(!target){location.href=new URL(`/editor.html?assistantHighlight=${encodeURIComponent(action.control)}`,location.href).href;return}
   target.focus?.();target.scrollIntoView?.({block:'center',behavior:'smooth'});target.classList.add('ask-target-highlight');setTimeout(()=>target.classList.remove('ask-target-highlight'),3200);add('assistant',`Highlighted ${action.control}.`);return;
  }
  if(action.type==='start_walkthrough'){startTour(action.id);return}
  if(action.type==='open_doc')location.href=new URL(`/docs/#/page/${encodeURIComponent(action.slug)}`,location.href).href;
 } async function send(value=input.value){const text=String(value||'').trim();if(!text||[...text].length>500)return;input.value='';if(containsPrivateDetails(text)){add('assistant','Please remove private details, passwords and access codes. I can help without them.');return}fallback.hidden=true;chips.hidden=true;add('user',text);const typing=messageNode(document,'typing','ChatSkins is thinking…');typing.setAttribute('aria-label','Waiting for an answer');log.append(typing);submit.disabled=true;status.textContent='';try{const response=await fetcher('/api/assistant',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages:history.slice(-8),page:location.pathname.split('/').filter(Boolean).at(-1)||'home',state:{tab:document.querySelector('[role=tab][aria-selected=true]')?.textContent?.toLowerCase()||'',hasChannel:!!document.querySelector('#channel')?.value,hasFrame:!!document.querySelector('#frame-card:not([hidden])')}})});const payload=await response.json();typing.remove();if(!response.ok||!payload.ok){status.textContent=payload.message||'Ask ChatSkins is unavailable. Try a guide or the Docs.';fallback.hidden=false;add('assistant',status.textContent);return}add('assistant',payload.reply||'');for(const action of payload.actions||[])await execute(action)}catch{typing.remove();status.textContent='Ask ChatSkins is unavailable. Try a guide or the Docs.';fallback.hidden=false;add('assistant',status.textContent)}finally{submit.disabled=false;input.focus()}}
 form.addEventListener('submit',event=>{event.preventDefault();send()});launcher.addEventListener('click',open);close.addEventListener('click',closePanel);clear.addEventListener('click',()=>{history=[];log.replaceChildren();chips.hidden=false;try{storage?.removeItem(key)}catch{}status.textContent='Conversation cleared.';input.focus()});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!tourCard.hidden){endTour();return}if(event.key==='Escape'&&!panel.hidden){closePanel();return}if(event.key==='Tab'&&!panel.hidden){const nodes=focusable(panel);if(!nodes.length)return;const first=nodes[0],last=nodes.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}if(event.key==='Tab'&&!tourCard.hidden){const nodes=focusable(tourCard),first=nodes[0],last=nodes.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}});
 return{root,launcher,panel,log,startTour,execute,clear:()=>clear.click(),send,close:closePanel};
}
if(typeof document!=='undefined')mountAskChat();
