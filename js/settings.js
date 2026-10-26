/**
 * Browser module settings.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: withTransparentTextContrast, normalizeSettings, encodeSettings, decodeSettings, buildCompactSettingsUrl.
 * Invariant: preserve existing settings links and render chat content as text.
 */
import {hasStudioDesign,decodeStudio} from './frame-studio.js';

import {settingsDiff,compactOverlayUrl} from './compact-link.js';

import {encodeStudio} from './frame-studio.js';

export const CLEAN={"schemaVersion":3,"templateFrame":"","templateMessageStyle":"","templateTitle":"","templateSubtitle":"LIVE CHAT","frameColor":"#B7AAFF","frameTint":0,"frameSaturation":1,"glowColor":"#A9CAFF","glowStrength":0.55,"glowAnimation":"off","middleBackground":"color","middleColor":"#111827","middleImage":"","middleOpacity":0.55,"templateFont":"DM Sans","templateTextColor":"#F2F0EE","templateNameMode":"channel","templateMessageBorders":false,"illustrationSource":"","illustrationSurface":"#10141D","transparentBackground":true,"hideFrames":false,"channel":"","dreamPaintId":"","fontFamily":"DM Sans","fontSize":18,"fontWeight":500,"lineHeight":1.5,"textColor":"#F2F5FA","nameColorMode":"fixed","nameColor":"#A9CAFF","systemColor":"#AEBBD0","nameFormat":"{name}:","showBadges":true,"outlineWidth":0,"outlineColor":"#000000","shadowEnabled":true,"shadowColor":"#000000","shadowOpacity":0.65,"shadowBlur":3,"borderStyle":"none","borderColor":"#7487A1","borderWidth":0,"backgroundColor":"#111C2E","backgroundOpacity":0.55,"backgroundScope":"message","cornerRadius":6,"paddingX":12,"paddingY":8,"messageSpacing":11,"maxMessages":8,"messageLifetime":30,"direction":"bottom","alignment":"left","overlayWidth":384,"edgeInset":20,"animationIn":"fade","animationDuration":180,"hideCommands":true,"hideBots":true,"botNames":["nightbot","streamelements"],"hideLinks":false,"borderEffect":"none","borderEffectSpeed":6,"borderEffectColor":"#E5A9FF","nameEffect":"none","nameGradientColor1":"#A9CAFF","nameGradientColor2":"#E5A9FF","textEffect":"none","typewriterDuration":700,"backgroundEffect":"none","backgroundSecondaryColor":"#273B59","backgroundTreatment":"solid","ambientEffect":"none","roleColorsEnabled":false,"broadcasterNameColor":"#FFB7A5","modNameColor":"#97E8B2","vipNameColor":"#E6B0FF","subNameColor":"#FFE095","mentionHighlightEnabled":false,"mentionHighlightColor":"#F4D38D","reduceMotion":false,"parts":{"panel":{"fontFamily":"DM Sans","fontSize":18,"fontWeight":500,"italic":false,"letterSpacing":0,"uppercase":false,"lineHeight":1.5,"inheritTypography":false,"paint":{"mode":"solid","color":"#F2F5FAFF","angle":135,"stops":[{"color":"#A9CAFFFF","position":0},{"color":"#E5A9FFFF","position":100}]},"outline":{"width":0,"color":"#000000FF"},"shadow":{"enabled":false,"color":"#000000A6","x":0,"y":1,"blur":3},"glow":{"enabled":false,"color":"#A9CAFF80","blur":4,"spread":0}},"messageBox":{"fontFamily":"DM Sans","fontSize":18,"fontWeight":500,"italic":false,"letterSpacing":0,"uppercase":false,"lineHeight":1.5,"inheritTypography":false,"paint":{"mode":"solid","color":"#F2F5FAFF","angle":135,"stops":[{"color":"#A9CAFFFF","position":0},{"color":"#E5A9FFFF","position":100}]},"outline":{"width":0,"color":"#000000FF"},"shadow":{"enabled":false,"color":"#000000A6","x":0,"y":1,"blur":3},"glow":{"enabled":false,"color":"#A9CAFF80","blur":4,"spread":0}},"name":{"fontFamily":"DM Sans","fontSize":18,"fontWeight":500,"italic":false,"letterSpacing":0,"uppercase":false,"lineHeight":1.5,"inheritTypography":false,"paint":{"mode":"solid","color":"#A9CAFFFF","angle":135,"stops":[{"color":"#A9CAFFFF","position":0},{"color":"#E5A9FFFF","position":100}]},"outline":{"width":0,"color":"#000000FF"},"shadow":{"enabled":true,"color":"#000000A6","x":0,"y":1,"blur":3},"glow":{"enabled":false,"color":"#A9CAFF80","blur":4,"spread":0}},"messageText":{"fontFamily":"DM Sans","fontSize":18,"fontWeight":500,"italic":false,"letterSpacing":0,"uppercase":false,"lineHeight":1.5,"inheritTypography":false,"paint":{"mode":"solid","color":"#F2F5FAFF","angle":135,"stops":[{"color":"#A9CAFFFF","position":0},{"color":"#E5A9FFFF","position":100}]},"outline":{"width":0,"color":"#000000FF"},"shadow":{"enabled":true,"color":"#000000A6","x":0,"y":1,"blur":3},"glow":{"enabled":false,"color":"#A9CAFF80","blur":4,"spread":0}},"badges":{"fontFamily":"DM Sans","fontSize":14.3,"fontWeight":500,"italic":false,"letterSpacing":0,"uppercase":false,"lineHeight":1.5,"inheritTypography":false,"paint":{"mode":"solid","color":"#D4DCE8FF","angle":135,"stops":[{"color":"#A9CAFFFF","position":0},{"color":"#E5A9FFFF","position":100}]},"outline":{"width":0,"color":"#000000FF"},"shadow":{"enabled":false,"color":"#000000A6","x":0,"y":1,"blur":3},"glow":{"enabled":false,"color":"#A9CAFF80","blur":4,"spread":0}},"system":{"fontFamily":"DM Sans","fontSize":18,"fontWeight":500,"italic":false,"letterSpacing":0,"uppercase":false,"lineHeight":1.5,"inheritTypography":false,"paint":{"mode":"solid","color":"#AEBBD0FF","angle":135,"stops":[{"color":"#A9CAFFFF","position":0},{"color":"#E5A9FFFF","position":100}]},"outline":{"width":0,"color":"#000000FF"},"shadow":{"enabled":true,"color":"#000000A6","x":0,"y":1,"blur":3},"glow":{"enabled":false,"color":"#A9CAFF80","blur":4,"spread":0}}},"frame":{"target":"message","style":"none","width":0,"paint":{"mode":"solid","color":"#7487A1FF","angle":135,"stops":[{"color":"#A9CAFFFF","position":0},{"color":"#E5A9FFFF","position":100}]},"radius":{"topLeft":6,"topRight":6,"bottomRight":6,"bottomLeft":6},"padding":{"top":8,"right":12,"bottom":8,"left":12},"doubleGap":2,"pixelStep":4,"outer":{"enabled":false,"width":1,"color":"#7487A1FF","offset":2},"ornament":{"style":"none","color":"#7487A1FF","size":12,"width":1,"inset":2},"legacyDetail":"none"},"backgrounds":{"message":{"mode":"solid","color":"#111C2EFF","stops":[{"color":"#111C2EFF","position":0},{"color":"#273B59FF","position":100}],"angle":135,"radialCenterX":50,"radialCenterY":50,"imageUrl":"","imageFit":"cover","imageOpacity":1,"opacity":0.55,"backdropBlur":0,"recipe":"none"},"panel":{"mode":"solid","color":"#111C2EFF","stops":[{"color":"#111C2EFF","position":0},{"color":"#273B59FF","position":100}],"angle":135,"radialCenterX":50,"radialCenterY":50,"imageUrl":"","imageFit":"cover","imageOpacity":1,"opacity":0,"backdropBlur":0,"recipe":"none"}},"nameTemplate":"{badges} {name}: ","animationOut":"fade","animationOutDuration":160,"customCSS":{"enabled":false,"source":""},"effectColors":{"broadcaster":"#FFB7A5FF","moderator":"#97E8B2FF","vip":"#E6B0FFFF","subscriber":"#FFE095FF","mention":"#F4D38DFF","borderSecondary":"#E5A9FFFF"},"presentation":{"layout":"inline","shape":"rect","nameTreatment":"plain","accent":"none","chipColor":"#A9CAFFFF","columnWidth":120,"initialSize":40,"tailSize":10,"cutSize":12},"nameStyle":{"readableColors":true,"minContrast":4.5},"grouping":{"enabled":false,"windowSeconds":20},"messageLimits":{"maxLineCh":38,"maxLines":0},"lifecycle":{"fadeMaskPx":0},"emphasis":{"firstMessage":false,"color":"#FFE095FF"},"emotes":{"sevenTV":true,"bttv":true,"ffz":true,"emoteOnlyScale":2,"inlineSize":28},"illustration":{"layers":{"header":{"enabled":true,"color":"#A9CAFF"},"corners":{"enabled":true,"color":"#A9CAFF"},"edges":{"enabled":true,"color":"#A9CAFF"},"mascot":{"enabled":true,"color":"#A9CAFF"},"particles":{"enabled":true,"color":"#A9CAFF"},"glitch":{"enabled":false,"color":"#A9CAFF"},"glow":{"enabled":true,"color":"#A9CAFF"}}},"channels":{"enabled":false,"rules":[]}};

export const DEFAULTS=CLEAN;

const clone=x=>structuredClone(x);

const oldMap={fontFamily:['parts','messageText','fontFamily'],fontSize:['parts','messageText','fontSize'],fontWeight:['parts','messageText','fontWeight'],lineHeight:['parts','messageText','lineHeight'],textColor:['parts','messageText','paint','color'],nameColor:['parts','name','paint','color'],systemColor:['parts','system','paint','color'],nameFormat:['nameTemplate'],borderColor:['frame','paint','color'],borderWidth:['frame','width'],cornerRadius:['frame','radius','topLeft'],paddingX:['frame','padding','left'],paddingY:['frame','padding','top'],backgroundColor:['backgrounds','message','color'],backgroundOpacity:['backgrounds','message','opacity'],backgroundScope:['frame','target']};

const set=(o,p,v)=>{for(const k of p.slice(0,-1))o=o[k];
  o[p.at(-1)]=v};

function oldToV3(v){const out=clone(CLEAN);
   for(const [k,path] of Object.entries(oldMap))if(v[k]!==undefined)set(out,path,v[k]);
   for(const k of ['channel','showBadges','maxMessages','messageLifetime','direction','alignment','overlayWidth','edgeInset','animationIn','animationDuration','hideCommands','hideBots','botNames','hideLinks','reduceMotion','transparentBackground','nameColorMode','shadowEnabled','shadowColor','shadowOpacity','shadowBlur','outlineWidth','outlineColor','borderStyle','borderEffect','borderEffectSpeed','borderEffectColor','nameEffect','nameGradientColor1','nameGradientColor2','textEffect','typewriterDuration','backgroundEffect','backgroundSecondaryColor','backgroundTreatment','ambientEffect','roleColorsEnabled','broadcasterNameColor','modNameColor','vipNameColor','subNameColor','mentionHighlightEnabled','mentionHighlightColor'])if(v[k]!==undefined)out[k]=v[k];
   if(v.paddingX!==undefined)out.frame.padding.right=out.frame.padding.left=v.paddingX;
  if(v.paddingY!==undefined)out.frame.padding.top=out.frame.padding.bottom=v.paddingY;
   if(v.borderStyle==='double')out.frame.style='double';
  else if(v.borderStyle==='line')out.frame.style='solid';
  else if(v.borderStyle==='bevel')out.frame.style='beveled';
  else if(v.borderStyle==='pixel')out.frame.style='pixel';
  else if(v.borderStyle==='hud')out.frame.legacyDetail='hud';
  else if(v.borderStyle==='slab')out.frame.legacyDetail='slab';
   if(v.nameFormat)out.nameTemplate=v.nameFormat.replace('{name}','{name}');
   out.schemaVersion=3;
  return out;
  }
/** Handle transparent text contrast.
 * @param {unknown} settings Function input.
 * @returns {unknown} The function result.
 */
export function withTransparentTextContrast(settings){const out=clone(settings);
  if(!out.transparentBackground)return out;
  for(const key of ['panel','messageBox','name','messageText','system']){const p=out.parts[key];
    if(p&&!(p.outline?.width>0)&&!p.shadow?.enabled){p.shadow={...(p.shadow||{}),enabled:true,color:'#000000E6',x:0,y:1,blur:2};
      }}return out;
  }
function normalizePlacement(value){if(!value||typeof value!=='object')return null;
  const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,Number.isFinite(Number(n))?Number(n):0)),panel=value.panel&&typeof value.panel==='object'?{x:clamp(value.panel.x),y:clamp(value.panel.y),w:clamp(value.panel.w,.05,1),h:clamp(value.panel.h,.05,1)}:null;
  if(panel){panel.x=clamp(panel.x,0,1-panel.w);
    panel.y=clamp(panel.y,0,1-panel.h)}const inner=value.inner&&typeof value.inner==='object'?{top:clamp(value.inner.top,-.5,.5),right:clamp(value.inner.right,-.5,.5),bottom:clamp(value.inner.bottom,-.5,.5),left:clamp(value.inner.left,-.5,.5)}:null,plaque=value.plaque&&typeof value.plaque==='object'?{x:clamp(value.plaque.x,-.5,.5),y:clamp(value.plaque.y,-.5,.5)}:null;
  return{...(panel?{panel}:{}),...(inner?{inner}:{}),...(plaque?{plaque}:{})}}
/** normalize settings.
 * @param {unknown} value Function input.
 * @returns {unknown} The function result.
 */
export function normalizeSettings(value={}){if(!value||typeof value!=='object'||Array.isArray(value))return clone(CLEAN);
   const ver=value.schemaVersion??1;
  if(ver>3||ver<1)return clone(CLEAN);
  let out=ver===3?merge(CLEAN,value):oldToV3(value);
  if(Object.prototype.hasOwnProperty.call(value,'studioDesign'))out.studioDesign=structuredClone(value.studioDesign);
  if(!hasStudioDesign(typeof out.studioDesign==='string'?decodeStudio(out.studioDesign):out.studioDesign))delete out.studioDesign;
  const color=v=>/^#[\da-f]{6}$/i.test(v)?v.toUpperCase():'#FFFFFF';
  out.schemaVersion=3;
  out.templateFrame=typeof out.templateFrame==='string'?out.templateFrame:'';
  out.templateMessageStyle=String(out.templateMessageStyle||'').slice(0,60);
  out.templateTitle=String(out.templateTitle||'').slice(0,40);
  out.templateSubtitle=String(out.templateSubtitle??'LIVE CHAT').slice(0,40);
  out.frameColor=color(out.frameColor);
  out.frameTint=Math.max(-180,Math.min(180,Number(out.frameTint)||0));
  out.frameSaturation=Math.max(0,Math.min(3,Number.isFinite(Number(out.frameSaturation))?Number(out.frameSaturation):1));
  out.glowColor=color(out.glowColor);
  out.glowStrength=Math.max(0,Math.min(1,Number(out.glowStrength)||0));
  out.glowAnimation=['off','pulse','shimmer'].includes(out.glowAnimation)?out.glowAnimation:'off';
  out.middleBackground=['none','color','image'].includes(out.middleBackground)?out.middleBackground:'color';
  out.middleColor=color(out.middleColor);
  out.middleImage=String(out.middleImage||'').slice(0,2048);
  out.middleOpacity=Math.max(0,Math.min(1,Number.isFinite(Number(out.middleOpacity))?Number(out.middleOpacity):.55));
  out.templateFont=String(out.templateFont||'DM Sans').slice(0,60);
  out.templateTextColor=color(out.templateTextColor);
  out.templateNameMode=['channel','fixed','twitch'].includes(out.templateNameMode)?out.templateNameMode:'channel';
  if(Object.prototype.hasOwnProperty.call(value,'templateMessageBorders'))out.templateMessageBorders=!!value.templateMessageBorders;
  else delete out.templateMessageBorders;
  if(Object.prototype.hasOwnProperty.call(value,'placement'))out.placement=normalizePlacement(value.placement);
  else delete out.placement;
  out.illustrationSource=String(out.illustrationSource||'').slice(0,256);
  out.illustrationSurface=color(out.illustrationSurface);
  out.transparentBackground=!!out.transparentBackground;
  out.hideFrames=!!out.hideFrames;
  out.channel=typeof out.channel==='string'&&/^[a-zA-Z0-9_]{0,25}$/.test(out.channel)?out.channel.toLowerCase():'';
  if(Object.prototype.hasOwnProperty.call(value,'dreamPaintId'))out.dreamPaintId=typeof out.dreamPaintId==='string'&&/^[a-f0-9]{24}$/i.test(out.dreamPaintId)?out.dreamPaintId.toLowerCase():'';
  else delete out.dreamPaintId;
  out.botNames=Array.isArray(out.botNames)?[...new Set(out.botNames.filter(x=>typeof x==='string'&&/^[a-z0-9_]{1,25}$/i.test(x)).map(x=>x.toLowerCase()))].slice(0,50):clone(CLEAN.botNames);
  out.customCSS={enabled:!!out.customCSS?.enabled,source:String(out.customCSS?.source||'').slice(0,20000)};
  const matches=new Set(['broadcaster','mod','vip','sub','firstTime','everyone','allCaps','action','mentionsChannel']);
  out.channels={enabled:!!out.channels?.enabled,rules:Array.isArray(out.channels?.rules)?out.channels.rules.filter(r=>r&&matches.has(r.match)).slice(0,40).map(r=>({enabled:r.enabled!==false,match:r.match,format:String(r.format||'[{name}]: {message}').slice(0,180),textColor:color(r.textColor),nameColor:color(r.nameColor),italic:!!r.italic})):[]};
  return out;
  }
function merge(base,input){if(Array.isArray(base))return Array.isArray(input)?input:clone(base);
  if(base&&typeof base==='object'){const o={};
    for(const k of Object.keys(base))o[k]=input&&Object.prototype.hasOwnProperty.call(input,k)?merge(base[k],input[k]):clone(base[k]);
    return o;
    }if(typeof base==='number')return typeof input==='number'&&Number.isFinite(input)?input:base;
  if(typeof base==='boolean')return typeof input==='boolean'?input:base;
  if(typeof base==='string')return typeof input==='string'?input:base;
  return base;
  }
const enc=s=>btoa(unescape(encodeURIComponent(JSON.stringify(normalizeSettings(s))))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,''); const dec=s=>JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(s.length/4)*4,'=')))));
/** encode settings.
 * @param {unknown} s Function input.
 * @returns {unknown} The function result.
 */
export function encodeSettings(s){return enc(s)} /** decode settings.
 * @param {unknown} hash Function input.
 * @returns {unknown} The function result.
 */
export function decodeSettings(hash){try{const payload=dec(String(hash||'').replace(/^#/,'')),raw=payload.settings||payload;const out=normalizeSettings(raw);if(!Object.prototype.hasOwnProperty.call(raw,'transparentBackground'))out.transparentBackground=false;return out}catch{return clone(CLEAN)}}
/** build compact settings url.
 * @param {unknown} baseUrl Function input.
 * @param {unknown} parameter2 Function input.
 * @param {unknown} baseSkinId Function input.
 * @param {unknown} baseSettings Function input.
 * @returns {unknown} The function result.
 */
export async function buildCompactSettingsUrl(baseUrl,{settings,baseSkinId='',baseSettings=CLEAN}={}){const normalized=normalizeSettings(settings);if(normalized.studioDesign&&typeof normalized.studioDesign==='object')normalized.studioDesign=encodeStudio(normalized.studioDesign);return compactOverlayUrl(baseUrl,{b:String(baseSkinId||''),c:settingsDiff(baseSettings,normalized)||{}})}
/** Handle css.
 * @param {unknown} input Function input.
 * @returns {unknown} The function result.
 */
export function sanitizeCSS(input=''){let s=String(input).slice(0,20000).replace(/\/\*[\s\S]*?\*\//g,'');s=s.replace(/@import\b[^;]*;?/gi,'').replace(/expression\s*\([^)]*\)/gi,'').replace(/url\(\s*(?!["']?#)[^)]*\)/gi,'none').replace(/@(?:font-face|keyframes|scope)\b[^{}]*\{[^}]*\}/gi,'');return s;}
/** Handle css.
 * @param {unknown} input Function input.
 * @returns {unknown} The function result.
 */
export function scopeCSS(input=''){const css=sanitizeCSS(input);return css.replace(/([^{}]+)\{([^{}]*)\}/g,(all,selector,body)=>{if(selector.trim().startsWith('@'))return '';const scoped=selector.split(',').map(x=>{x=x.trim();if(!x)return '';if(x===':root'||x==='&')return '[data-overlay-root]';return `[data-overlay-root] ${x}`}).filter(Boolean).join(',');return scoped?`${scoped}{${body}}`:''}).slice(0,40000)}/** Handle legacy.
 * @param {unknown} s Function input.
 * @returns {unknown} The function result.
 */
export function projectLegacy(s){const o=clone(s);o.fontFamily=s.parts.messageText.fontFamily;o.fontSize=s.parts.messageText.fontSize;o.fontWeight=s.parts.messageText.fontWeight;o.lineHeight=s.parts.messageText.lineHeight;o.textColor=s.parts.messageText.paint.color.slice(0,7);o.nameColor=s.parts.name.paint.color.slice(0,7);o.systemColor=s.parts.system.paint.color.slice(0,7);o.nameFormat=s.nameTemplate.replace('{badges} ','').replace(/ $/,'');o.borderStyle=s.frame.style==='solid'?'line':s.frame.style==='beveled'?'bevel':s.frame.style;o.borderColor=s.frame.paint.color.slice(0,7);o.borderWidth=s.frame.width;o.backgroundColor=s.backgrounds[s.frame.target==='panel'?'panel':'message'].color.slice(0,7);o.backgroundOpacity=s.backgrounds[s.frame.target==='panel'?'panel':'message'].opacity;o.backgroundScope=s.frame.target;o.cornerRadius=s.frame.radius.topLeft;o.paddingX=s.frame.padding.left;o.paddingY=s.frame.padding.top;return o}


