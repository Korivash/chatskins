/**
 * Browser module render.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: contrastRatio, effectiveSettings, applyPresentation, round10MessageAttributes, applySkinMetadata.
 * Invariant: preserve existing settings links and render chat content as text.
 */
import {parseEmotes,resolveEmotes} from './emotes.js';
import {scopeCSS} from './settings.js';
import {frameAttributes,FRAME_ATTRIBUTES,datasetProperty} from './frame-attributes.js';
import {resolveChannelRules,fillChannelTemplate} from './channels.js';
import {crewColorFromName} from './crew-color.js';

const cssColor=c=>{c=String(c||'#000000FF').replace('#','');
  if(c.length===6)c+='FF';
  return `#${c.slice(0,8)}`};

function paint(p){if(!p)return '#F2F5FA';
  if(p.mode==='linear')return `linear-gradient(${p.angle}deg,${p.stops.map(x=>`${x.color} ${x.position}%`).join(',')})`;
  if(p.mode==='radial')return `radial-gradient(circle,${p.stops.map(x=>`${x.color} ${x.position}%`).join(',')})`;
  return cssColor(p.color)}
function setPart(el,p){if(!el||!p)return;
  el.style.fontFamily=`"${p.fontFamily}",sans-serif`;
  el.style.fontSize=`${p.fontSize}px`;
  el.style.fontWeight=p.fontWeight;
  el.style.fontStyle=p.italic?'italic':'normal';
  el.style.letterSpacing=`${p.letterSpacing}px`;
  el.style.textTransform=p.uppercase?'uppercase':'none';
  el.style.lineHeight=p.lineHeight;
  el.style.color=cssColor(p.paint?.color);
  el.style.backgroundImage=paint(p.paint);
  el.style.webkitTextFillColor=p.paint?.mode==='solid'?'': 'transparent';
  el.style.webkitBackgroundClip=p.paint?.mode==='solid'?'':'text';
  el.style.textShadow=p.shadow?.enabled?`${p.shadow.x}px ${p.shadow.y}px ${p.shadow.blur}px ${p.shadow.color}`:'none';
  el.style.webkitTextStroke=`${p.outline?.width||0}px ${p.outline?.color||'transparent'}`;
  }
function bgStyle(el,b){if(!el||!b)return;
  const image=b.mode==='image'&&/^https:\/\//i.test(b.imageUrl)?`url("${b.imageUrl.replace(/["\\\\]/g,'')}")`:b.mode==='linear'?`linear-gradient(${b.angle}deg,${b.stops.map(x=>`${x.color} ${x.position}%`).join(',')})`:b.mode==='radial'?`radial-gradient(ellipse at ${b.radialCenterX}% ${b.radialCenterY}%,${b.stops.map(x=>`${x.color} ${x.position}%`).join(',')})`:b.mode==='image'?'none':b.color;el.style.backgroundImage=image;el.style.backgroundColor=cssColor(b.color);el.style.opacity=b.mode==='image'?b.opacity*b.imageOpacity:b.opacity;el.style.backdropFilter=b.backdropBlur?`blur(${b.backdropBlur}px)`:'';el.style.backgroundSize=b.imageFit==='tile'?'auto':b.imageFit==='fill'?'100% 100%':b.imageFit;el.style.backgroundRepeat=b.imageFit==='tile'?'repeat':'no-repeat';}
function surface(el,b){let layer=el.querySelector(':scope > .chat-surface');
    if(!layer){layer=document.createElement('span');
      layer.className='chat-surface';
      el.prepend(layer)}bgStyle(layer,b)}
function ornament(el,f,enabled){if(!enabled||f.ornament.style==='none')return;
    const mark=document.createElement('span');
    mark.className='chat-ornament';
    mark.dataset.style=f.ornament.style;
    el.append(mark)}
/** Handle ratio.
 * @param {unknown} foreground Function input.
 * @param {unknown} background Function input.
 * @returns {unknown} The function result.
 */
export function contrastRatio(foreground,background){const luminance=hex=>{const value=String(hex||'').replace('#','').slice(0,6).padEnd(6,'0'),rgb=value.match(/.{2}/g).map(channel=>parseInt(channel,16)/255).map(channel=>channel<=.04045?channel/12.92:((channel+.055)/1.055)**2.4);
      return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]},a=luminance(foreground),b=luminance(background);
    return(Math.max(a,b)+.05)/(Math.min(a,b)+.05)}
function effective(s){if(!s.transparentBackground)return s;
    const x=structuredClone(s);
    if(x.transparentDefault===false){x.transparentBackground=false;
      x.keepsCardForReadability=true;
      return x;
      }for(const k of ['panel','message'])x.backgrounds[k].opacity=0;
    if(x.hideFrames){x.frame.width=0;
      x.frame.style='none';
      x.frame.outer.enabled=false;
      x.frame.ornament.style='none';
      }for(const k of ['panel','messageBox','name','messageText','system']){const p=x.parts[k];
      if(p&&!(p.outline?.width>0)&&!p.shadow?.enabled)p.shadow={...p.shadow,enabled:true,color:'#000000E6',x:0,y:1,blur:2};
      }return x;
    }
/** Handle settings.
 * @param {unknown} settings Function input.
 * @returns {unknown} The function result.
 */
export function effectiveSettings(settings){return effective(settings)}
/** apply presentation.
 * @param {unknown} root Function input.
 * @param {unknown} s Function input.
 * @returns {unknown} The function result.
 */
export function applyPresentation(root,s){const p=s.presentation||{};
    root.dataset.layout=p.layout==='columns'&&s.overlayWidth<240?'stacked':p.layout||'inline';
    root.dataset.shape=p.shape||'rect';
    root.dataset.treatment=p.nameTreatment||'plain';
    root.dataset.accent=p.accent||'none';
    root.style.setProperty('--column-width',`${p.columnWidth||120}px`);
    root.style.setProperty('--initial-size',`${p.initialSize||40}px`);
    root.style.setProperty('--tail-size',`${p.tailSize||10}px`);
    root.style.setProperty('--cut-size',`${p.cutSize||12}px`);
    root.style.setProperty('--chip-color',p.chipColor||'#A9CAFFFF');
    root.style.setProperty('--emphasis-color',s.emphasis?.color||'#FFE095FF');
    }
const lum=hex=>{const c=hex.replace('#','').slice(0,6).match(/.{2}/g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
    return .2126*c[0]+.7152*c[1]+.0722*c[2]};
  const contrast=(a,b)=>{const x=lum(a),y=lum(b);
    return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
  
function readableName(s,override){const p=structuredClone(s.parts.name),min=s.nameStyle?.minContrast||4.5;
    if(override){p.paint={...p.paint,mode:'solid',color:override};
      }if(!s.nameStyle?.readableColors)return p;
    const surfaces=[s.backgrounds.message.color,s.presentation?.nameTreatment==='pill'||s.presentation?.nameTreatment==='tab'?s.presentation.chipColor:null].filter(Boolean),adjust=color=>{if(surfaces.every(bg=>contrast(color,bg)>=min))return color;
      const dark='#111722FF',light='#FFFFFFFF',target=surfaces.every(bg=>contrast(dark,bg)>=contrast(light,bg))?dark:light;
      return target};
    if(p.paint.mode==='solid')p.paint.color=adjust(p.paint.color);
    else p.paint.stops=p.paint.stops.map(stop=>({...stop,color:adjust(stop.color)}));
    return p;
    }
/** Handle round10 message attributes.
 * @param {unknown} recipe Function input.
 * @param {unknown} settings Function input.
 * @param {unknown} message Function input.
 * @returns {unknown} The function result.
 */
export function round10MessageAttributes(recipe,settings={},message={}){if(!recipe?.id)return null;
    return{className:`msg skin-${recipe.id}${message.badges?.moderator?' is-mod':''}`,dataset:{round10:'true',silhouette:String(settings.silhouette||recipe.id),reduced:String(!!settings.reduceMotion)}}}
/** apply skin metadata.
 * @param {unknown} settings Function input.
 * @param {unknown} skin Function input.
 * @returns {unknown} The function result.
 */
export function applySkinMetadata(settings,skin){settings.transparentDefault=skin?.transparentDefault!==false;
    settings.transparentDefaultReason=skin?.transparentDefaultReason||'';
    settings.round10Recipe=skin?.round10Recipe?{...skin.round10Recipe,id:skin.id}:null;
    settings.silhouette=skin?.silhouette;
    return settings}
function addRound10Decorations(row,s,message){const recipe=s.round10Recipe;
    if(!recipe?.id)return;
    const palette=recipe.palette||{},type=recipe.typography||{},motion=recipe.motion||{},attributes=round10MessageAttributes(recipe,s,message);
    row.classList.add(...attributes.className.split(' '));
    Object.assign(row.dataset,attributes.dataset);
    row.style.setProperty('--ink',palette.ink||'#F3F7FF');
    row.style.setProperty('--paper',palette.surface||'#142838');
    row.style.setProperty('--accent',palette.accent||'#8EF8D1');
    row.style.setProperty('--name-font',type.nameFamily||'Segoe UI');
    row.style.setProperty('--body-font',type.bodyFamily||type.nameFamily||'Segoe UI');
    row.style.setProperty('--name-size',`${type.nameSizePx||20}px`);
    row.style.setProperty('--body-size',`${type.bodySizePx||22}px`);
    row.style.backgroundColor='transparent';
    const surface=row.querySelector(':scope > .chat-surface');
    if(surface)surface.style.display='none';
    const keyframes=motion.keyframes||[],hasAmbient=motion.trigger!=='entry only',hasEntry=motion.trigger==='entry only'||motion.trigger==='ambient + entry';
    if(hasAmbient){const fx=document.createElement('span');
      fx.className='fx fx-a';
      fx.setAttribute('aria-hidden','true');
      if(recipe.id==='starfall'){const stars=document.createElement('span');
        stars.className='stars';
        fx.append(stars)}row.append(fx)}const secondLayer=['glitter-bomb','lava-lamp','ice-crystal'].includes(recipe.id)||(recipe.id==='electric-storm'&&message.badges?.moderator);
    if(secondLayer){if(recipe.id==='electric-storm'){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
        svg.setAttribute('viewBox','0 0 300 100');
        svg.setAttribute('preserveAspectRatio','none');
        svg.setAttribute('width','100%');
        svg.setAttribute('height','100%');
        svg.setAttribute('class','fx fx-b');
        svg.setAttribute('aria-hidden','true');
        const path=document.createElementNS(svg.namespaceURI,'path');
        path.setAttribute('d','M8 10 L34 7 L22 17 L63 12 M290 18 L280 36 L291 32 L279 58 M80 93 L112 83 L103 94 L151 89');
        svg.append(path);
        row.append(svg)}else{const fx=document.createElement('span');
        fx.className='fx fx-b';
        fx.setAttribute('aria-hidden','true');
        row.append(fx)}}const detail=document.createElement('span');
    detail.className='detail';
    detail.setAttribute('aria-hidden','true');
    row.append(detail);
    if(recipe.id==='initial-card'){const initial=document.createElement('span');
      initial.className='initial';
      initial.textContent=[...(message.username||'')][0]||'';
      initial.setAttribute('aria-hidden','true');
      row.append(initial)}}
/** apply chat style.
 * @param {unknown} root Function input.
 * @param {unknown} s Function input.
 * @returns {unknown} The function result.
 */
export function applyChatStyle(root,s){s=effective(s);
    applyPresentation(root,s);
    const f=s.frame;
    root.classList.add('chat-panel');
    window.__chatskinsFrameOk=()=>{if(s.templateFrame||s.dreamPaintId){const image=root.querySelector(':scope > .template-frame-art');
        return !!image?.complete&&image.naturalWidth>0&&image.getBoundingClientRect().width>0}if(s.illustrationSource){const art=root.querySelector(':scope > svg.illustrated-art');
        return !!art&&art.getBoundingClientRect().width>0}if(f.style==='none'||s.hideFrames)return true;
      const el=f.target==='panel'?root:root.querySelector('.chat-message[data-frame]:not([data-frame=none])');
      if(!el)return false;
      const frame=getComputedStyle(el,'::before'),color=frame.borderTopColor,width=parseFloat(frame.borderTopWidth)||0,rgba=/^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)$/i.exec(color),slashAlpha=/\/\s*([\d.]+)%?\s*\)$/.exec(color),alpha=color==='transparent'?0:rgba?Number(rgba[1]):slashAlpha?Number(slashAlpha[1]):1;
      return frame.display!=='none'&&frame.borderTopStyle!=='none'&&width>=1&&alpha>0};
    root.dataset.overlayRoot='';
    Object.entries(frameAttributes(s)).forEach(([k,v])=>root.dataset[datasetProperty(k)]=v);
    root.dataset.transparent=String(!!s.transparentBackground);
    root.dataset.frameTemplate=s.templateFrame||'';
    root.dataset.paintedFrame=String(!!s.dreamPaintId);
    root.style.setProperty('--frame-color',paint(f.paint));
    root.style.setProperty('--panel-opacity',s.backgrounds.panel.opacity);
    root.style.setProperty('--frame-width',`${f.width}px`);
    root.style.setProperty('--double-gap',`${f.doubleGap}px`);
    root.style.setProperty('--outer-width',`${f.outer.width}px`);
    root.style.setProperty('--outer-offset',`${f.outer.offset}px`);
    root.style.setProperty('--outer-color',f.outer.color);
    root.style.setProperty('--radii',`${f.radius.topLeft}px ${f.radius.topRight}px ${f.radius.bottomRight}px ${f.radius.bottomLeft}px`);
    root.style.setProperty('--pad',`${f.padding.top}px ${f.padding.right}px ${f.padding.bottom}px ${f.padding.left}px`);
    root.style.setProperty('--pixel-step',`${f.pixelStep}px`);
    root.style.setProperty('--ornament-color',f.ornament.color);
    root.style.setProperty('--ornament-size',`${f.ornament.size}px`);
    root.style.setProperty('--ornament-width',`${f.ornament.width}px`);
    root.style.setProperty('--ornament-inset',`${f.ornament.inset}px`);
    root.dataset[datasetProperty(FRAME_ATTRIBUTES.outer)]=String(f.outer.enabled);
    root.dataset[datasetProperty(FRAME_ATTRIBUTES.ornament)]=f.ornament.style;
    root.dataset.reduceMotion=String(s.reduceMotion);
    root.dataset.borderEffect=s.borderEffect||'none';
    root.dataset.signatureSkin=String(s.borderEffect==='animatedGradient');
    root.dataset.nameEffect=s.nameEffect||'none';
    root.dataset.textEffect=s.textEffect||'none';
    root.style.setProperty('--border-effect-speed',`${s.borderEffectSpeed||12}s`);
    setPart(root,s.parts.panel);
    surface(root,s.backgrounds.panel);
    ornament(root,f,f.target==='panel');
    
 // Painted Dream frames are attached through attachFrameTemplate so they use
 // the same measured window, plaque, tint, glow and position rules as catalog frames.
 root.querySelector(':scope > .dream-painted-frame')?.remove();
    
 root.dataset.align=s.alignment;
    root.dataset.direction=s.direction;
    root.style.setProperty('--gap',`${s.messageSpacing}px`);
    root.style.setProperty('--width',`${s.overlayWidth}px`);
    root.style.setProperty('--inset',`${s.edgeInset}px`);
    if(s.customCSS?.enabled){let style=root.querySelector(':scope > style.custom-user-css');
      if(!style){style=document.createElement('style');
        style.className='custom-user-css';
        root.prepend(style)}style.textContent=scopeCSS(s.customCSS.source)}}
function addFrame(el,s){const f=s.frame;
    el.classList.add('chat-message');
    el.dataset[datasetProperty(FRAME_ATTRIBUTES.style)]=f.target==='message'?f.style:'none';
    el.style.setProperty('--frame-color',paint(f.paint));
    el.style.setProperty('--frame-width',`${f.width}px`);
    el.style.setProperty('--radii',`${f.radius.topLeft}px ${f.radius.topRight}px ${f.radius.bottomRight}px ${f.radius.bottomLeft}px`);
    el.style.setProperty('--pad',`${f.padding.top}px ${f.padding.right}px ${f.padding.bottom}px ${f.padding.left}px`);
    el.style.setProperty('--outer-width',`${f.outer.width}px`);
    el.style.setProperty('--outer-offset',`${f.outer.offset}px`);
    el.style.setProperty('--outer-color',f.outer.color);
    el.style.setProperty('--ornament-color',f.ornament.color);
    el.style.setProperty('--ornament-size',`${f.ornament.size}px`);
    el.style.setProperty('--ornament-width',`${f.ornament.width}px`);
    el.style.setProperty('--ornament-inset',`${f.ornament.inset}px`);
    el.dataset[datasetProperty(FRAME_ATTRIBUTES.outer)]=String(f.target==='message'&&f.outer.enabled);
    el.dataset.transparent=String(!!s.transparentBackground);
    el.dataset[datasetProperty(FRAME_ATTRIBUTES.hideFrames)]=String(!!s.hideFrames);
    el.dataset[datasetProperty(FRAME_ATTRIBUTES.ornament)]=f.ornament.style;
    surface(el,s.backgrounds.message);
    ornament(el,f,f.target==='message');
    el.style.borderRadius=f.target==='message'?el.style.getPropertyValue('--radii'):'0';
    }
/** fill name template.
 * @param {unknown} template Function input.
 * @param {unknown} values Function input.
 * @returns {unknown} The function result.
 */
export function fillNameTemplate(template, values={}){return String(template||'').replace(/\{(badges|name|channel|color)\}/g,(_,k)=>String(values[k]??''))}
function appendNameTemplate(target,template,values){const pattern=/\{(badges|name|channel|color)\}/g,source=String(template||''),append=(value)=>{if(value)target.append(document.createTextNode(value))};
    let last=0,match;
    while((match=pattern.exec(source))){append(source.slice(last,match.index));
      if(match[1]==='name'){const username=document.createElement('span');
        username.className='chat-name-user';
        username.textContent=String(values.name||'');
        target.append(username)}else if(match[1]==='badges'&&!values.badges&&match.index===0&&source[pattern.lastIndex]===' '){pattern.lastIndex++;
        }else append(values[match[1]]);
      last=pattern.lastIndex}append(source.slice(last))}
function textNodes(target,text,native,community,s){const parts=resolveEmotes(String(text||''),native||{},community||new Map());
    const only=parts.some(x=>x.type==='emote')&&parts.every(x=>x.type==='emote'||!x.text.trim());
    target.dataset.emoteOnly=String(only);
    for(const part of parts){if(part.type==='text'){target.append(document.createTextNode(part.text));
        continue}if(s.reduceMotion&&!part.native){target.append(document.createTextNode(part.text));
        continue}const src=part.native?`https://static-cdn.jtvnw.net/emoticons/v2/${encodeURIComponent(part.id)}/default/dark/1.0`:typeof part.url==='string'&&part.url!=='undefined'?part.url:'';
      if(!src){target.append(document.createTextNode(part.text));
        continue}const img=document.createElement('img');
      img.className='emote';
      img.alt=part.text;
      img.src=src;
      const h=(s.emotes?.inlineSize||28)*(only?(s.emotes?.emoteOnlyScale||2):1);
      img.style.height=`${h}px`;
      img.style.maxWidth='100%';
      img.onerror=()=>{const fallback=document.createTextNode(part.text);
        img.replaceWith(fallback)};
      target.append(img)}}
function roleSvg(role){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),path=document.createElementNS('http://www.w3.org/2000/svg','path');
    svg.setAttribute('viewBox','0 0 24 24');
    svg.setAttribute('width','1em');
    svg.setAttribute('height','1em');
    svg.setAttribute('class','role-icon');
    svg.setAttribute('role','img');
    svg.setAttribute('aria-label',`${role} role`);
    path.setAttribute('d',role==='broadcaster'?'M3 7 8 11 12 3l4 8 5-4-2 13H5z M6 22h12':role==='moderator'?'M14 2 22 10l-2 2-4-4-7 8-3-3 8-7-4-4z M4 17l3 3-3 2-2-2z':role==='vip'?'M3 7 7 3h10l4 4-9 14z M7 3l5 18 5-18 M3 7h18':'M12 2l2.9 6 6.6 1-4.8 4.7 1.1 6.7-5.8-3.2-5.8 3.2 1.1-6.7L2.5 9l6.6-1z');
    svg.append(path);
    return svg}function roleNode(role){const node=roleSvg(role);
    return node}function crewNode(message){const dot=document.createElement('span');
    dot.className='crew-color-dot';
    dot.style.setProperty('--crew-color',crewColorFromName(message.login||message.username));
    dot.setAttribute('aria-hidden','true');
    return dot}
function appendRoleBadges(parent,message){const role=['broadcaster','moderator','vip','subscriber'].find(key=>message.badges?.[key]);
    if(role){const badge=document.createElement('span');
      badge.className='badge';
      badge.setAttribute('aria-label',`${role} badge`);
      badge.append(roleSvg(role));
      parent.append(badge)}}
function readableChipColor(hex){const value=/^#[\da-f]{6}$/i.test(String(hex||''))?hex:'#7EEAD6';
    const rgb=value.slice(1).match(/.{2}/g).map(part=>parseInt(part,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4),luminance=.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
    return luminance>.179?'#101528':'#FFFFFF'}
function appendChannelFormat(body,rule,message,community,s){if(rule.match==='allCaps'&&s.nameEffect==='flash')body.classList.add('text-flash');
    if(rule.match==='action'&&s.textEffect==='wave')body.classList.add('text-wave');
    const signature=s.borderEffect==='animatedGradient';
    if(signature){body.classList.add('signature-channel');
      if(rule.match==='mentionsChannel')body.closest('.message')?.classList.add('signature-mention');
      if(rule.match==='broadcaster')body.closest('.message')?.classList.add('signature-host-flash')}const pattern=/\{(name|message|badges)\}/g,format=String(rule.format||'[{name}]: {message}').replace(/([^\s])\{message\}/g,(_match,before)=>before+' {message}');
    let last=0,match,identity=null,content=null;
    body.style.color=rule.textColor;
    body.style.fontStyle=rule.italic?'italic':'normal';
    body.classList.add('channel-flow');
    const ensureIdentity=()=>identity||(identity=document.createElement('span'));
    const ensureContent=()=>{if(!content){content=document.createElement('span');
        content.className='channel-message';
        body.append(content)}return content};
    const appendLiteral=text=>{if(!text)return;
      const target=content?ensureContent():ensureIdentity();
      const tag=signature&&/^(HOST|MOD)\s/.exec(text);
      if(tag){const badge=document.createElement('span');
        badge.className=`signature-role-tag ${tag[1]==='HOST'?'host':'mod'}`;
        badge.textContent=tag[1];
        target.append(badge,document.createTextNode(text.slice(tag[0].length)))}else target.append(document.createTextNode(text))};
    if(s.presentation?.accent==='roleIcons'){const role=message.badges?.broadcaster?'broadcaster':message.badges?.moderator?'moderator':message.badges?.vip?'vip':message.badges?.subscriber?'subscriber':'';
      if(role)ensureIdentity().append(roleSvg(role))}while((match=pattern.exec(format))){if(match.index>last)appendLiteral(format.slice(last,match.index));
      if(match[1]==='message'){const target=ensureContent();
        textNodes(target,message.text,message.emotes,community,s)}else if(match[1]==='name'){const name=document.createElement('span');
        name.className=`channel-name${signature?' signature-name-chip':''}`;
        if(s.presentation?.accent==='crewDot')name.append(crewNode(message));
        name.append(document.createTextNode(message.username||''));
        name.style.color=signature?readableChipColor(message.color):rule.nameColor;
        if(signature){const chipColor=/^#[\da-f]{6}$/i.test(String(message.color||''))?message.color:'#7EEAD6';
          name.style.backgroundColor=chipColor;
          name.style.boxShadow=`0 0 4px ${chipColor}`}ensureIdentity().append(name)}else appendRoleBadges(ensureIdentity(),message);
      last=pattern.lastIndex}if(last<format.length)appendLiteral(format.slice(last));
    if(identity){identity.className='channel-identity';
      body.prepend(identity)}}
let templateRowSequence=0;
  
/** create message.
 * @param {unknown} message Function input.
 * @param {unknown} s Function input.
 * @param {unknown} community Function input.
 * @returns {unknown} The function result.
 */
export function createMessage(message,s,community=new Map()){s=effective(s);
    const templateMode=!!(s.templateFrame||s.dreamPaintId);
    const{rule:channelRule,notice:channelNotice}=resolveChannelRules(message,s);
    const row=document.createElement('div');
    row.className=`message${message.system?' system':' '}`;
    row.dataset.exit=s.animationOut;
    row.dataset.messageId=message.id||'';
    row.dataset.username=message.username||'';
    row.dataset.userKey=message.userId||message.login||String(message.username||'').toLowerCase();
    row.dataset.roleKey=JSON.stringify(message.badges||{});
    row.dataset.createdAt=String(Date.now());
    row.dataset.clock=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',hour12:false});
    if(templateMode)row.dataset.templateStyle=s.templateMessageStyle||s.templateFrame||'painted-frame';
    row.dataset.firstMessage=String(!!(s.emphasis?.firstMessage&&message.firstMessage));
    row.style.setProperty('--duration',`${s.animationDuration}ms`);
    row.style.setProperty('--exit-duration',`${s.animationOutDuration}ms`);
    addFrame(row,s);
    if(s.frame.target==='message'&&s.presentation?.shape==='speech'){const tail=document.createElement('span');
      tail.className='chat-tail';
      row.append(tail)}if(s.frame.target==='message'&&['slash','ticket'].includes(s.presentation?.shape)){const shape=document.createElement('span');
      shape.className='chat-shape';
      shape.dataset.shape=s.presentation.shape;
      row.append(shape)}const p=message.system?s.parts.system:s.parts.messageBox;
    setPart(row,p);
    if(message.system){row.classList.add('chat-system');
      row.textContent=message.text||'';
      return row;
      }if(channelNotice){const notice=document.createElement('span');
      notice.className='channel-first-time';
      notice.textContent=fillChannelTemplate(channelNotice.format,{...message,text:''});
      notice.style.color=channelNotice.textColor;
      row.append(notice)}const badges=document.createElement('span');
    badges.className='chat-badges';
    if(s.showBadges)appendRoleBadges(badges,message);
    setPart(badges,s.parts.badges);
    const name=document.createElement('span');
    name.className='name chat-name';
    const role=message.badges?.broadcaster?'broadcaster':message.badges?.moderator?'moderator':message.badges?.vip?'vip':message.badges?.subscriber?'subscriber':'';
    const roleColor=s.effectColors?.[role]||({broadcaster:s.broadcasterNameColor,moderator:s.modNameColor,vip:s.vipNameColor,subscriber:s.subNameColor}[role]);
    const override=templateMode?(s.templateNameMode==='fixed'?s.nameColor:s.templateNameMode==='channel'?(s.frameColor||s.nameColor):message.color||s.nameColor):(message.fake&&message.color?message.color:s.nameColorMode==='twitch'&&message.color?message.color:s.roleColorsEnabled&&role?roleColor:null);
    setPart(name,readableName(s,override));
    const label=fillNameTemplate(s.nameTemplate,{badges:'',name:message.username||'',channel:s.channel||'',color:message.color||''});
    appendNameTemplate(name,s.nameTemplate,{badges:'',name:message.username||'',channel:s.channel||'',color:message.color||''});
    if(s.presentation?.accent==='crewDot')name.prepend(crewNode(message));
    row.dataset.nameKey=label;
    const body=document.createElement('span');
    body.className='message-body chat-text body';
    setPart(body,s.parts.messageText);
    if(templateMode){body.style.fontFamily=`\"${s.templateFont||s.fontFamily}\",sans-serif`;
      body.style.color=s.templateTextColor||s.textColor;
      if(!s.parts.messageText.shadow?.enabled)body.style.textShadow='0 1px 2px #000c,0 0 4px #0008'}body.setAttribute('aria-label',message.text||'');
    body.style.maxWidth=`${s.messageLimits?.maxLineCh||38}ch`;
    if(s.messageLimits?.maxLines>0){body.style.display='-webkit-box';
      body.style.webkitBoxOrient='vertical';
      body.style.webkitLineClamp=String(s.messageLimits.maxLines);
      body.style.overflow='hidden'}if(channelRule){badges.hidden=true;
      name.hidden=true;
      appendChannelFormat(body,channelRule,message,community,s)}else textNodes(body,message.text,message.emotes,community,s);
    if(s.presentation?.layout==='initials'){const initial=document.createElement('span');
      initial.className='chat-initial';
      let glyph='?';
      try{glyph=[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(message.username||'')][0]?.segment||'?'}catch{glyph=[...(message.username||'?')][0]||'?'}initial.textContent=glyph.toLocaleUpperCase();
      initial.setAttribute('aria-hidden','true');
      row.append(initial)}if(!channelRule&&s.presentation?.accent==='roleIcons'&&role)row.append(roleNode(role));
    if(s.templateMessageStyle==='phantom-signal'){const time=document.createElement('time');
      time.className='template-message-time';
      time.textContent=`[${row.dataset.clock}]`;
      row.append(time)}if(s.templateMessageStyle==='abyssal-relay'){const number=document.createElement('span');
      number.className='template-row-number';
      number.textContent=String(++templateRowSequence).padStart(2,'0')+' ';
      row.append(number)}if(channelRule)row.append(body);
    else{const identity=document.createElement('span');
      identity.className='chat-identity';
      if(badges.childNodes.length)identity.append(badges);
      identity.append(name);
      row.append(identity,document.createTextNode(' '),body)}if(s.emphasis?.firstMessage&&message.firstMessage){const marker=document.createElement('span');
      marker.className='first-message';
      marker.textContent='First message';
      marker.setAttribute('aria-label','First message');
      row.prepend(marker)}addRound10Decorations(row,s,message);
    return row;
    }
/** Handle chat message.
 * @param {unknown} root Function input.
 * @param {unknown} message Function input.
 * @param {unknown} s Function input.
 * @param {unknown} community Function input.
 * @returns {unknown} The function result.
 */
export function appendChatMessage(root,message,s,community=new Map()){const row=createMessage(message,s,community),previous=root.lastElementChild,windowMs=(s.grouping?.windowSeconds||20)*1000,eligible=s.grouping?.enabled&&!message.system&&!message.firstMessage&&previous?.classList.contains('message')&&!previous.classList.contains('system')&&previous.dataset.userKey===row.dataset.userKey&&previous.dataset.roleKey===row.dataset.roleKey&&previous.dataset.nameKey===row.dataset.nameKey&&previous.dataset.firstMessage!=='true'&&Date.now()-Number(previous.dataset.createdAt)<=windowMs;
    if(eligible){row.classList.add('grouped');
      const n=row.querySelector('.chat-name'),b=row.querySelector('.chat-badges'),i=row.querySelector('.chat-initial');
      if(n)n.style.visibility='hidden';
      if(b)b.style.visibility='hidden';
      if(i)i.style.visibility='hidden'}root.append(row);
    const oldest=[...root.children].find(x=>x.classList?.contains('message'));
    if(oldest&&s.lifecycle?.fadeMaskPx>0){const depth=s.lifecycle.fadeMaskPx,edge=s.direction==='top'?'to top':'to bottom';
      oldest.style.maskImage=`linear-gradient(${edge}, transparent, black ${depth}px)`;
      oldest.style.webkitMaskImage=oldest.style.maskImage}else if(oldest){oldest.style.maskImage='';
      oldest.style.webkitMaskImage=''}return row;
    }
/** remove chat message.
 * @param {unknown} root Function input.
 * @param {unknown} row Function input.
 * @returns {unknown} The function result.
 */
export function removeChatMessage(root,row){if(!row)return;
    const promoted=row.classList.contains('message')&&!row.classList.contains('grouped'),mask=row.style.maskImage,webMask=row.style.webkitMaskImage;
    let next=row.nextElementSibling;
    row.remove();
    if(mask&&next?.classList.contains('message')){next.style.maskImage=mask;
      next.style.webkitMaskImage=webMask}if(promoted&&next?.classList.contains('grouped')){next.classList.remove('grouped');
      for(const selector of ['.chat-name','.chat-badges','.chat-initial']){const el=next.querySelector(selector);
        if(el)el.style.visibility=''}}}






