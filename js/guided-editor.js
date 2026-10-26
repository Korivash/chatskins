/**
 * Browser module guided-editor.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: vibePatch, palettePatch, sizePatch, customColorPatch, simplePatch.
 * Invariant: preserve existing settings links and render chat content as text.
 */
const P=['panel','messageBox','name','messageText','badges','system'];

export const VIBES={
 Cozy:{font:'Nunito Sans',shape:'rect',frame:'solid',width:2,radius:18,motion:'fade'},Hype:{font:'Barlow',shape:'slash',frame:'double',width:2,radius:4,motion:'pop'},Spooky:{font:'IBM Plex Mono',shape:'rect',frame:'solid',width:2,radius:2,motion:'fade'},Clean:{font:'DM Sans',shape:'rect',frame:'none',width:0,radius:6,motion:'fade'},Gamer:{font:'Chakra Petch',shape:'rect',frame:'beveled',width:2,radius:4,motion:'slide'},Cute:{font:'Nunito Sans',shape:'speech',frame:'solid',width:2,radius:20,motion:'pop'}
};

export const PALETTES={'Stream blue':['#A9CAFF','#111C2E'],Mint:['#9CE8CF','#10251F'],Sunset:['#FFBC9C','#2B1A16'],Lavender:['#D4BDFF','#211A31'],Rose:['#FFB8D4','#2E1924'],Gold:['#FFE095','#2A2314']};

export const SIZES={S:[360,20,26,6,20],M:[480,26,32,10,20],L:[600,32,40,14,20]};

const clone=x=>structuredClone(x), path=(o,p)=>p.split('.').reduce((v,k)=>v?.[k],o), put=(o,p,v)=>{const a=p.split('.');
  for(const k of a.slice(0,-1))o=o[k];
  o[a.at(-1)]=v};

function merge(a,b){for(const[k,v]of Object.entries(b)){if(v&&typeof v==='object'&&!Array.isArray(v))merge(a[k],v);
    else a[k]=v}return a}
/** Handle patch.
 * @param {unknown} name Function input.
 * @returns {unknown} The function result.
 */
export function vibePatch(name){const v=VIBES[name];
  if(!v)throw Error('Unknown vibe');
  const patch={presentation:{layout:'inline',nameTreatment:'plain',accent:'none',shape:v.shape,cutSize:12,tailSize:10},frame:{target:'message',style:v.frame,width:v.width,doubleGap:2,outer:{enabled:false},ornament:{style:'none'},legacyDetail:'none',paint:{mode:'solid'},radius:{topLeft:v.radius,topRight:v.radius,bottomRight:v.radius,bottomLeft:v.radius}},hideFrames:false,animationIn:v.motion,animationDuration:180};
  patch.parts={};
  for(const p of P)patch.parts[p]={fontFamily:v.font};
  patch.parts.name.fontWeight=700;
  patch.parts.messageText.fontWeight=500;
  return patch}
/** Handle patch.
 * @param {unknown} name Function input.
 * @returns {unknown} The function result.
 */
export function palettePatch(name){const [a,b]=PALETTES[name]||[];
  if(!a)throw Error('Unknown palette');
  return colorPatch(a,b)}
function colorPatch(a,b){const aa=a.toUpperCase()+'FF',bb=b.toUpperCase()+'FF';
  return {parts:{name:{paint:{mode:'solid',color:aa}},messageText:{paint:{mode:'solid',color:'#F3F7FFFF'}},system:{paint:{mode:'solid',color:'#F3F7FFFF'}}},frame:{paint:{mode:'solid',color:aa},ornament:{color:aa}},presentation:{chipColor:bb},backgrounds:{message:{color:bb},panel:{color:bb}},nameStyle:{readableColors:true,minContrast:4.5}}}
/** Handle patch.
 * @param {unknown} size Function input.
 * @returns {unknown} The function result.
 */
export function sizePatch(size){const [overlayWidth,fontSize,inlineSize,messageSpacing,edgeInset]=SIZES[size]||[];
  if(!overlayWidth)throw Error('Unknown size');
  const parts={};
  for(const p of P)parts[p]={fontSize};
  return {overlayWidth,messageSpacing,edgeInset,parts,emotes:{inlineSize}}}
/** Handle color patch.
 * @param {unknown} color Function input.
 * @returns {unknown} The function result.
 */
export function customColorPatch(color){if(!/^#[\da-f]{6}$/i.test(color))throw Error('Use a color like #74A6FF.');
  const c=color.slice(1).match(/../g).map(x=>parseInt(x,16)),b=c.map(x=>Math.round(.12*x)),lum=x=>{const q=x/255;
    return q<=.04045?q/12.92:((q+.055)/1.055)**2.4},L=x=>x.map(lum).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);
  let a=c;
  for(let n=0;n<=100;n++){a=c.map(x=>Math.round(x+(255-x)*n/100));
    if((L(a)+.05)/(L(b)+.05)>=4.5)break}const hex=x=>'#'+x.map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
  return colorPatch(hex(a),hex(b))}
/** Handle patch.
 * @param {unknown} group Function input.
 * @param {unknown} value Function input.
 * @param {unknown} currentColor Function input.
 * @returns {unknown} The function result.
 */
export function simplePatch(group,value,currentColor='#111C2EFF'){if(group==='Vibe')return vibePatch(value);
  if(group==='Colors')return PALETTES[value]?palettePatch(value):customColorPatch(value);
  if(group==='Chat size')return sizePatch(value);
  if(group==='Font'){const p={};
    for(const k of P)p[k]={fontFamily:value};
    return {parts:p}}if(group==='Text size'){const p={};
    for(const k of P)p[k]={fontSize:+value};
    return {parts:p}}if(group==='Background'){if(value==='Transparent')return {transparentBackground:true,backgrounds:{message:{opacity:0},panel:{opacity:0}}};
    return {transparentBackground:false,backgrounds:{message:{opacity:value==='Soft'?.86:1,mode:'solid',recipe:'none',imageUrl:'',color:(currentColor||'#111C2EFF').slice(0,7)+'FF',backdropBlur:0},panel:{opacity:0}}}}if(group==='Frame'){const widths={None:0,Line:2,Double:2,Beveled:2,Pixel:2},styles={None:'none',Line:'solid',Double:'double',Beveled:'beveled',Pixel:'pixel'};
    return {hideFrames:false,frame:{style:styles[value],width:widths[value],...(value==='None'?{outer:{enabled:false},ornament:{style:'none'},legacyDetail:'none'}:{})}}}if(group==='New messages')return {animationIn:value.toLowerCase(),animationDuration:value==='None'?0:180};
  if(group==='Messages on screen')return {maxMessages:{'A few':4,Balanced:8,Lots:12}[value]};
  if(group==='Hide chat commands')return {hideCommands:value};
  return {}}
/** Handle state.
 * @param {unknown} history Function input.
 * @param {unknown} current Function input.
 * @returns {unknown} The function result.
 */
export function undoState(history,current){return history.length?{state:clone(history.at(-1)),history:history.slice(0,-1)}:{state:clone(current),history}}
/** Handle for.
 * @param {unknown} state Function input.
 * @param {unknown} section Function input.
 * @param {unknown} parameter3 Function input.
 * @param {unknown} osReduced Function input.
 * @returns {unknown} The function result.
 */
export function tipFor(state,section,{bright=false,osReduced=false}={}){
 const t=(message,patch)=>({message,patch});
  
 if(osReduced&&!state.reduceMotion)return t('Prefer less movement? Keep your chat still.',{reduceMotion:true});
  
 if(['Background','Colors'].includes(section)&&bright&&state.transparentBackground)return t('Hard to read on bright games? Add a soft background.',simplePatch('Background','Soft',state.backgrounds.message.color));
  
 if(['Size','Chat size','Text size'].includes(section)&&state.parts.messageText.fontSize<28){const parts={};
    for(const key of P)parts[key]={fontSize:28};
    return t('Big text helps on small screens.',{parts,emotes:{inlineSize:34}})}
 if(['Font','Vibe'].includes(section)&&state.parts.messageText.fontFamily!=='Atkinson Hyperlegible')return t('Give similar-looking letters a little more room to stand apart.',{parts:Object.fromEntries(P.map(key=>[key,{fontFamily:'Atkinson Hyperlegible'}]))});
  
 if(['Colors','Palette'].includes(section)&&(!state.nameStyle.readableColors||state.nameStyle.minContrast<4.5))return t('Keep viewer names easy to read.',{nameStyle:{readableColors:true,minContrast:4.5}});
  
 if(section==='Frame'&&(state.hideFrames||state.frame.style==='none'))return t('A simple line helps separate chat from the game.',{hideFrames:false,frame:{style:'solid',width:2}});
  
 if(section==='New messages'&&state.animationIn!=='none')return t('Want less distraction? Let new messages appear without moving.',{animationIn:'none',animationDuration:0});
  
 if(section==='Messages on screen'&&state.maxMessages>8)return t('Leave more room for the game with fewer messages.',{maxMessages:8});
  
 if(section==='Hide chat commands'&&!state.hideCommands)return t('Keep commands like !skin out of the conversation.',{hideCommands:true});
  
 if(['Size','Chat size'].includes(section)&&state.overlayWidth>480)return t('A narrower chat leaves more of your game in view.',{overlayWidth:480});
  
 if(['Background','Colors'].includes(section)&&state.transparentBackground&&!state.parts.messageText.shadow.enabled)return t('A soft text shadow helps letters stand out.',{parts:{messageText:{shadow:{enabled:true,color:'#000000CC',x:0,y:1,blur:3}}}});
  
 if(section==='Messages on screen'&&(state.messageLifetime===0||state.messageLifetime>30))return t('Let older messages clear after 30 seconds.',{messageLifetime:30});
  
 if(['Size','Chat size','Text size'].includes(section)&&state.messageSpacing<10)return t('Give each message a little breathing room.',{messageSpacing:10});
  
 if(['Font','Vibe'].includes(section)&&state.parts.messageText.lineHeight<1.4)return t('More space between lines makes long messages easier to follow.',{parts:Object.fromEntries(P.map(key=>[key,{lineHeight:1.4}]))});
  
 if(section==='Vibe'&&state.animationIn==='none'&&!state.reduceMotion&&!(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches))return t('A gentle fade gives new messages a quiet hello.',{animationIn:'fade',animationDuration:180});
  
 return {message:'Looks good to go; you can change it any time.',patch:null};
  
}
const fontNames=['DM Sans','Barlow','Nunito Sans','IBM Plex Mono','Chakra Petch','Atkinson Hyperlegible'];

/** Handle guided editor.
 * @param {unknown} parameter1 Function input.
 * @param {unknown} getState Function input.
 * @param {unknown} parameter3 Function input.
 * @param {unknown} undo Function input.
 * @param {unknown} hasIncoming Function input.
 * @param {unknown} returnTo Function input.
 * @returns {unknown} The function result.
 */
export function initGuidedEditor({root=document,getState,apply:applyState,undo,hasIncoming=false,returnTo=''}){const main=root.querySelector('#main'),rail=root.querySelector('.rail'),oldSimple=rail.querySelector(':scope > section'),adv=root.querySelector('#advanced-panel'),setup=root.querySelector('#guided-setup');
  if(!main||!rail||!oldSimple)return;
  const apply=(...args)=>{if(typeof args[2]==='string'&&args[2]!==section)pinned=null;
    if(typeof args[2]==='string')section=args[2];
    applyState(...args);
    draw()};
  
 const header=document.createElement('div');
  header.className='round13-toolbar';
  const levels=document.createElement('nav');
  levels.className='round13-levels';
  levels.setAttribute('aria-label','Editor level');
  const buttons={};
  for(const level of ['Guided','Simple','Advanced']){const b=document.createElement('button');
    b.type='button';
    b.textContent=level;
    b.dataset.level=level;
    buttons[level]=b;
    levels.append(b)}header.append(levels);
  const tools=document.createElement('div');
  tools.className='round13-tools';
  let undoButton=root.querySelector('#undo'),redo=root.querySelector('#redo'),start=root.querySelector('#reset');
  if(undoButton)tools.append(undoButton);
  const fresh=document.createElement('button');
  fresh.type='button';
  fresh.textContent='Start over';
  fresh.setAttribute('aria-haspopup','dialog');
  tools.append(fresh);
  header.append(tools);
  main.insertBefore(header,main.children[1]);
  
 const guided=document.createElement('section');
  guided.className='round13-guided';
  guided.setAttribute('aria-labelledby','round13-title');
  const title=document.createElement('h2');
  title.id='round13-title';
  title.textContent='Make it mine';
  const pageTitle=main.querySelector('.editor-intro h1');
  if(pageTitle)pageTitle.textContent='Make it mine';
  const intro=document.createElement('p');
  intro.textContent='Three easy choices. You can change everything later.';
  const steps=document.createElement('div');
  steps.className='round13-steps';
  const content=document.createElement('div');
  content.className='round13-choice-area';
  const tip=document.createElement('aside');
  tip.className='round13-tip';
  tip.setAttribute('aria-label',"Luna's tip");
  const nav=document.createElement('div');
  nav.className='round13-nav';
  const back=document.createElement('button');
  back.textContent='Back';
  const next=document.createElement('button');
  next.className='primary';
  next.textContent='Continue';
  const skip=document.createElement('button');
  skip.textContent='Skip to Simple';
  nav.append(back,next,skip);
  guided.append(title,intro,steps,content,tip,nav);
  oldSimple.before(guided);
  oldSimple.id='round13-simple-panel';
  oldSimple.classList.add('round13-simple-panel');
  const advancedLabel=document.createElement('h2');
  advancedLabel.className='round13-advanced-title';
  advancedLabel.textContent='Every setting is here. Use Find a setting to jump to one.';
  adv.before(advancedLabel);
  const panel=root.querySelector('.preview');
  const simpleExtras=document.createElement('div');
  simpleExtras.className='round13-visual-pickers';
  oldSimple.querySelector('.simple-controls').before(simpleExtras);
  
 const utility=document.createElement('div');
  utility.className='round13-utility';
  const livePreview=root.querySelector('.preview');
  livePreview?.prepend(utility);
  const oldStart=start;
  if(oldStart){oldStart.textContent='Start over';
    oldStart.hidden=true}const undoHint=document.createElement('span');
  undoHint.className='round13-undo-hint';
  undoHint.hidden=true;
  undoButton?.after(undoHint);
  
 let step=0,section='Vibe',bright=false,pinned=null,hiddenTip=false,mode='Guided',setupVisible=!!returnTo&&/#guided-(connect|copy)/.test(returnTo);
  try{const saved=JSON.parse(localStorage.getItem('chatskins.editor-level.v1')||'{}');
    mode=hasIncoming?(saved.level||'Simple'):(saved.complete?(saved.level||'Simple'):'Guided');
    if(/#(alerts-section|chat-play-section)/.test(returnTo))mode='Advanced';
    step=Number.isInteger(saved.step)?Math.max(0,Math.min(2,saved.step)):0}catch{}
 const safeSave=complete=>{try{localStorage.setItem('chatskins.editor-level.v1',JSON.stringify({level:mode,step,complete}))}catch{}};
  
 function isSelected(label,value,s){if(label==='Vibe')return s.parts.messageText.fontFamily===VIBES[value]?.font&&s.frame.style===VIBES[value]?.frame&&s.presentation.shape===VIBES[value]?.shape;
    if(label==='Colors')return PALETTES[value]?.[0]===s.parts.name.paint.color?.slice(0,7)&&PALETTES[value]?.[1]===s.backgrounds.message.color?.slice(0,7);
    if(label==='Chat size')return s.overlayWidth===SIZES[value]?.[0];
    if(label==='Font')return s.parts.messageText.fontFamily===value;
    if(label==='Background')return value==='Transparent'?s.transparentBackground:value==='Soft'?!s.transparentBackground&&s.backgrounds.message.opacity<1:s.backgrounds.message.opacity===1;
    if(label==='Frame')return s.frame.style==={None:'none',Line:'solid',Double:'double',Beveled:'beveled',Pixel:'pixel'}[value];
    if(label==='New messages')return s.animationIn===value.toLowerCase();
    if(label==='Messages on screen')return s.maxMessages==={'A few':4,Balanced:8,Lots:12}[value];
    return false}
 function setLevel(v){setupVisible=false;
    pinned=null;
    mode=v;
    safeSave(false);
    draw()}function radioGroup(label,options,onChange,{kind='choice',custom=false}={}){const fs=document.createElement('fieldset');
    fs.className='round13-group';
    const legend=document.createElement('legend');
    legend.textContent=label;
    fs.append(legend);
    const grid=document.createElement('div');
    grid.className='round13-options';
    for(const item of options){const value=typeof item==='string'?item:item.name;
      const b=document.createElement('button');
      b.type='button';
      b.className='round13-option';
      b.dataset.choice=value;
      b.setAttribute('aria-pressed',String(isSelected(label,value,getState())));
      if(kind==='font'){b.style.fontFamily=`"${value}", sans-serif`;
        const sample=document.createElement('span');
        sample.textContent='Hey chat! 123';
        b.append(sample)}else if(kind==='palette'){for(const c of [...(PALETTES[value]||[]),'#F3F7FF']){const sw=document.createElement('i');
          sw.style.backgroundColor=c;
          b.append(sw)}}else if(kind==='background'){const sample=document.createElement('span');
        sample.className=`background-thumb ${value.toLowerCase()}`;
        sample.textContent='Chat';
        if(value==='Soft')sample.style.backgroundColor='#111C2EDD';
        if(value==='Solid')sample.style.backgroundColor='#111C2E';
        b.append(sample)}else if(kind==='frame'){const sample=document.createElement('span');
        sample.className='frame-thumb';
        sample.textContent='Chat';
        sample.style.borderStyle={None:'none',Line:'solid',Double:'double',Beveled:'outset',Pixel:'solid'}[value];
        b.append(sample)}else if(kind==='motion'){const sample=document.createElement('span');
        sample.className='motion-thumb';
        sample.textContent='Hey chat!';
        sample.dataset.motion=value;
        b.append(sample)}else if(kind==='size'){const sample=document.createElement('span');
        sample.className='size-thumb';
        sample.style.width=`${{S:19,M:25,L:32}[value]}%`;
        sample.textContent=value;
        b.append(sample)}else{const sample=document.createElement('span');
        sample.className='conversation-thumb';
        if(kind==='vibe'){b.style.fontFamily=`"${VIBES[value]?.font||'DM Sans'}", sans-serif`;
          sample.append(document.createTextNode('Luna: Hey chat!'));
          const second=document.createElement('span');
          second.textContent='Welcome in.';
          sample.append(second)}else sample.textContent=value;
        b.append(sample)}const caption=document.createElement('strong');
      caption.textContent=kind==='size'?`${value} · ${{S:'Small',M:'Medium',L:'Large'}[value]}`:value;
      b.append(caption);
      if(kind==='vibe'){const small=document.createElement('small');
        small.textContent=item.description;
        b.append(small)}if(kind==='palette'&&value==='Stream blue'){const badge=document.createElement('small');
        badge.textContent='Recommended';
        b.append(badge)}if(kind==='background'&&value==='Transparent'){const badge=document.createElement('small');
        badge.textContent='Recommended';
        b.append(badge)}b.onclick=()=>onChange(value);
      grid.append(b)}fs.append(grid);
    if(['Vibe','Colors','Chat size','Font','Background','Frame','New messages','Messages on screen'].includes(label)&&!options.some(item=>isSelected(label,typeof item==='string'?item:item.name,getState()))){const custom=document.createElement('div');
      custom.className='round13-option';
      custom.setAttribute('aria-current','true');
      const title=document.createElement('strong');
      title.textContent='Custom · kept as is';
      const edit=document.createElement('button');
      edit.type='button';
      edit.textContent='Edit in Advanced';
      edit.onclick=()=>setLevel('Advanced');
      custom.append(title,edit);
      fs.append(custom)}return fs}
 const vibeOptions=Object.keys(VIBES).map((name,i)=>({name,description:['Soft and relaxed','Bold and lively','Dark and eerie','Quiet and clear','Sharp and focused','Round and playful'][i]}));
  
 function controlsFor(container,isGuided){if(isGuided)container.replaceChildren();
    else simpleExtras.replaceChildren();
    const s=getState();
    let groups=[];
    if(isGuided){steps.replaceChildren();
      ['Vibe','Colors','Size'].forEach((name,i)=>{const b=document.createElement('button');b.type='button';b.textContent=`${i+1} ${name}`;b.setAttribute('aria-current',String(i===step));b.onclick=()=>{step=i;section=name;draw()};steps.append(b)});
      const name=['Vibe','Colors','Size'][step];
      section=name;
      const h=document.createElement('h3');
      h.textContent=["What's your vibe?",'Your colors','How big?'][step];
      const p=document.createElement('p');
      p.textContent=["Tap a look to see it on your stream.","Pick a palette. We'll match the little details.",'See how much space chat takes on a 1080p stream.'][step];
      container.append(h,p);
      groups.push(name==='Vibe'?radioGroup('Vibe',vibeOptions,v=>apply(vibePatch(v),`Vibe: ${v}`,name),{kind:'vibe'}):name==='Colors'?radioGroup('Colors',[...Object.keys(PALETTES),'Your own color'],v=>{if(v==='Your own color'){document.querySelector('.round13-guided input[type=color]')?.focus();return;}apply(palettePatch(v),`Colors: ${v}`,name)},{kind:'palette'}):radioGroup('Chat size',['S','M','L'],v=>apply(sizePatch(v),`Chat size: ${v}`,name),{kind:'size'}));
      if(name==='Colors'){const colorLabel=document.createElement('label');
        colorLabel.append(document.createTextNode('Your color '));
        const color=document.createElement('input');
        color.type='color';
        color.value='#74A6FF';
        const hex=document.createElement('input');
        hex.type='text';
        hex.value=color.value.toUpperCase();
        hex.maxLength=7;
        hex.pattern='#[0-9A-Fa-f]{6}';
        hex.setAttribute('aria-label','Your color as #RRGGBB');
        const commitColor=value=>{try{const patch=customColorPatch(value);
            color.value=value;
            hex.value=value.toUpperCase();
            apply(patch,'Your color',name)}catch{hex.setCustomValidity('Use a color like #74A6FF.');
            hex.value=color.value.toUpperCase();
            hex.reportValidity()}};
        color.onchange=()=>commitColor(color.value);
        hex.oninput=()=>hex.setCustomValidity('');
        hex.onchange=()=>commitColor(hex.value);
        colorLabel.append(color,hex);
        groups.push(colorLabel)}container.append(...groups);
      back.hidden=step===0;
      next.textContent=step===2?'Done, get my link':'Continue';
      skip.hidden=false;
      skip.textContent=step===2?'Keep customizing':'Skip to Simple';
      }
 else{const choices=[['Vibe',vibeOptions,'vibe'],['Colors',Object.keys(PALETTES),'palette'],['Chat size',['S','M','L'],'size'],['Font',fontNames,'font'],['Text size',[],'range'],['Background',['Transparent','Soft','Solid'],'background'],['Frame',['None','Line','Double','Beveled','Pixel'],'frame'],['New messages',['None','Fade','Slide','Pop'],'motion'],['Messages on screen',['A few','Balanced','Lots'],'count'],['Hide chat commands',[],'switch']];
      for(const [label,opts,kind]of choices){const fs=kind==='range'||kind==='switch'?document.createElement('fieldset'):radioGroup(label,opts,v=>apply(simplePatch(label,v,s.backgrounds.message.color),`${label}: ${v}`,label),{kind});
        if(kind==='range'){fs.className='round13-group';
          const leg=document.createElement('legend');
          leg.textContent=label;
          const range=document.createElement('input'),out=document.createElement('output'),num=document.createElement('input');
          range.type='range';
          range.min=14;
          range.max=40;
          range.value=s.parts.messageText.fontSize;
          out.textContent=`${range.value} px`;
          num.type='number';
          num.min=14;
          num.max=40;
          num.value=range.value;
          num.setAttribute('aria-label','Text size in pixels');
          range.setAttribute('aria-label','Text size in pixels');
          range.oninput=()=>{out.textContent=`${range.value} px`;
            num.value=range.value};
          range.onchange=()=>apply(simplePatch(label,range.value),`Text size: ${range.value}`,label);
          num.onchange=()=>{const n=Math.max(14,Math.min(40,+num.value||22));
            apply(simplePatch(label,n),`Text size: ${n}`,label)};
          fs.append(leg,range,out,num)}if(kind==='switch'){fs.className='round13-group';
          const l=document.createElement('label'),input=document.createElement('input');
          input.type='checkbox';
          input.role='switch';
          input.checked=s.hideCommands;
          input.setAttribute('aria-label','Hide chat commands');
          input.onchange=()=>apply({hideCommands:input.checked},'Hide chat commands',label);
          l.append(input,document.createTextNode(' Hide chat commands'));
          fs.append(l)}simpleExtras.append(fs);
        if(label==='Vibe'){const more=document.createElement('button');
          more.type='button';
          more.textContent='More looks in Advanced';
          more.onclick=()=>setLevel('Advanced');
          simpleExtras.append(more)}if(label==='Colors'){const own=document.createElement('label');
          own.className='round13-own-color';
          own.append(document.createTextNode('Your color '));
          const color=document.createElement('input');
          color.type='color';
          color.value=s.parts.name.paint.color.slice(0,7);
          color.setAttribute('aria-label','Your color');
          color.onchange=()=>apply(customColorPatch(color.value),'Your color','Colors');
          own.append(color);
          const hex=document.createElement('input');
          hex.type='text';
          hex.value=color.value.toUpperCase();
          hex.maxLength=7;
          hex.setAttribute('aria-label','Your color as #RRGGBB');
          const commit=value=>{try{customColorPatch(value);
              color.value=value;
              hex.value=value.toUpperCase();
              apply(customColorPatch(value),'Your color','Colors')}catch{hex.setCustomValidity('Use a color like #74A6FF.');
              hex.value=color.value.toUpperCase();
              hex.reportValidity()}};
          color.onchange=()=>commit(color.value);
          hex.oninput=()=>hex.setCustomValidity('');
          hex.onchange=()=>commit(hex.value);
          own.append(hex);
          const hint=document.createElement('small');
          hint.textContent='We match the background and keep names readable.';
          own.append(hint);
          simpleExtras.append(own)}}container.append(simpleExtras);
      }
 }
 function updateTip(){const found=tipFor(getState(),section,{bright,osReduced:matchMedia('(prefers-reduced-motion: reduce)').matches});
    tip.replaceChildren();
    const h=document.createElement('strong');
    h.textContent="Luna's tip";
    const p=document.createElement('p');
    p.textContent=pinned?.message||found.message;
    tip.append(h,p);
    if(hiddenTip)return;
    if((pinned?.patch||found.patch)){const action=document.createElement('button');
      action.type='button';
      action.textContent=pinned?'Done':'Do it for me';
      action.onclick=()=>{if(pinned){pinned=null;
          updateTip();
          return}pinned={message:found.message,patch:found.patch};
        apply(found.patch,"Luna's tip",section);
        updateTip()};
      tip.append(action)}const hide=document.createElement('button');
    hide.type='button';
    hide.textContent='Hide tip';
    hide.onclick=()=>{hiddenTip=true;
      tip.replaceChildren()};
    tip.append(hide)}
 function draw(){for(const [name,b]of Object.entries(buttons)){b.setAttribute('aria-pressed',String(name===mode));
      b.classList.toggle('active',name===mode)}guided.hidden=mode!=='Guided';
    oldSimple.hidden=mode!=='Simple';
    adv.classList.toggle('hidden',mode!=='Advanced');
    advancedLabel.hidden=mode!=='Advanced';
    root.querySelector('#advanced-toggle').hidden=mode!=='Advanced';
    if(mode==='Guided'){controlsFor(content,true);
      guided.insertBefore(tip,nav)}else if(mode==='Simple'){controlsFor(oldSimple,false);
      oldSimple.append(tip)}if(setup)setup.hidden=!setupVisible;
    updateTip();
    safeSave(false);
    }
 next.onclick=()=>{if(step<2){step++;
      draw()}else{mode='Simple';
      setupVisible=true;
      safeSave(true);
      guided.hidden=true;
      if(setup){setup.hidden=false;
        setup.scrollIntoView({block:'start'});
        setup.querySelector('h2')?.focus?.()} }};
  back.onclick=()=>{if(step>0){step--;
      draw()}};
  skip.onclick=()=>setLevel('Simple');
  for(const [n,b]of Object.entries(buttons))b.onclick=()=>setLevel(n);
  undoButton?.addEventListener('click',()=>{setTimeout(()=>{pinned=null;undoHint.hidden=!document.querySelector('#undo')?.disabled;draw()},0)});
  fresh.onclick=()=>{if(!confirm('Start your look again? This resets your look to Clean, Stream blue and Medium. Your channel and Twitch setup stay the same.'))return;
    const keep=getState(),patch={};
    for(const k of ['parts','frame','backgrounds','presentation','nameStyle','nameTemplate','overlayWidth','edgeInset','messageSpacing','alignment','direction','animationIn','animationDuration','animationOut','animationOutDuration','hideFrames','transparentBackground'])patch[k]=clone(CLEAN[k]);
    patch.customCSS={...keep.customCSS,enabled:false};
    for(const k of ['borderEffect','nameEffect','textEffect','backgroundEffect','ambientEffect'])patch[k]='none';
    merge(patch,vibePatch('Clean'));
    merge(patch,palettePatch('Stream blue'));
    merge(patch,sizePatch('M'));
    apply(patch,'Start over','Vibe',{replaceAppearance:true});
    step=0;
    setLevel('Guided')};
  
 const bgControls=document.createElement('div');
  bgControls.className='round13-scene';
  for(const [name,isBright]of [['Dark game',false],['Bright game',true]]){const b=document.createElement('button');
    b.type='button';
    b.textContent=name;
    b.onclick=()=>{bright=isBright;
      updateTip()};
    bgControls.append(b)}const zoom=document.createElement('button');
  zoom.type='button';
  zoom.textContent='See chat up close';
  zoom.onclick=()=>panel?.scrollIntoView({block:'center',behavior:'smooth'});
  guided.append(bgControls,zoom);
  
 const legacy=rail.querySelector('.legacy-setup');
  if(legacy){adv.append(legacy);
    if(/#(alerts-section|chat-play-section)/.test(returnTo))legacy.open=true;
    }
 document.querySelector('.simple-controls')?.setAttribute('hidden','');
  for(const [level,b]of Object.entries(buttons))b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const a=['Guided','Simple','Advanced'],i=a.indexOf(level)+(e.key==='ArrowRight'?1:-1),target=a[(i+a.length)%a.length];buttons[target].focus();setLevel(target)});
  if(setup){setup.hidden=true;
    const doneLink=document.createElement('button');
    doneLink.type='button';
    doneLink.textContent='Back to my look';
    doneLink.onclick=()=>{setupVisible=false;
      setup.hidden=true;
      setLevel('Guided')};
    setup.querySelector('header')?.append(doneLink)}draw();
  if(returnTo){const target=root.querySelector(returnTo);
    target?.scrollIntoView?.({block:'center'});
    if(target?.matches?.('button,input,select,[tabindex]'))target.focus?.()}return {setLevel,draw};
  
}
import {CLEAN} from './settings.js';

