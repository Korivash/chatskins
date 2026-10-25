import assert from 'node:assert/strict';
import fs from 'node:fs';
const skins=JSON.parse(fs.readFileSync('design/skins.json','utf8')).skins;
const frames=JSON.parse(fs.readFileSync('site-media/frames/frames.json','utf8'));
const css=fs.readFileSync('css/skin-render.css','utf8');
const frameSkins=skins.filter(s=>s.frameTemplate);
function rgbLum(hex){assert(/^#[0-9a-f]{6}$/i.test(hex),`expected six-digit color: ${hex}`);const h=hex.slice(1);const c=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]}
function contrast(a,b){const x=typeof a==='number'?a:rgbLum(a),y=typeof b==='number'?b:rgbLum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
function rule(selector){const escaped=selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const match=css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));return match?.[1]||''}
function colorFrom(declarations){return declarations.match(/(?:^|;)\s*color\s*:\s*(#[0-9a-f]{6})\s*(?:!important)?\s*(?:;|$)/i)?.[1]||null}
function backgroundFrom(declarations){return declarations.match(/(?:^|;)\s*background\s*:\s*(#[0-9a-f]{6})\s*(?:!important)?\s*(?:;|$)/i)?.[1]||null}
function effectiveMessagePaint(skin){const style=skin.messageStyle||skin.settings.templateMessageStyle||skin.frameTemplate;const message=rule(`.chat[data-template-message-style="${style}"] .message`);const body=rule(`.chat[data-template-message-style="${style}"] .message-body`);return{color:colorFrom(body)||colorFrom(message)||skin.settings.templateTextColor,background:backgroundFrom(message)||skin.settings.middleColor}}
for(const skin of frameSkins){const paint=effectiveMessagePaint(skin);assert(paint.color,`${skin.name}: effective message body color missing`);assert(contrast(paint.color,paint.background)>=4.5,`${skin.name}: effective message body contrast ${paint.color} on ${paint.background}`)}
for(const entry of frames.filter(x=>x.kind==='chat')){assert(Number.isFinite(entry.plaque?.luminance),`${entry.id}/${entry.shape}: plaque luminance missing`);assert(entry.plaque.ink,`${entry.id}/${entry.shape}: plaque ink missing`);const skin=frameSkins.find(x=>x.frameTemplate===entry.id);const plaque={...entry.plaque,...(skin?.plaque||{})};const background=plaque.coverPainted?plaque.color:entry.plaque.luminance;assert(contrast(plaque.ink||entry.plaque.ink,background)>=4.5,`${entry.id}/${entry.shape}: plaque contrast`)}
