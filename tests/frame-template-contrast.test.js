import assert from 'node:assert/strict';
import fs from 'node:fs';
const skins=JSON.parse(fs.readFileSync('design/skins.json','utf8')).skins;
const frames=JSON.parse(fs.readFileSync('site-media/frames/frames.json','utf8'));
const frameSkins=skins.filter(s=>s.frameTemplate);
function rgbLum(hex){const h=hex.replace('#','');const c=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]}
function contrast(a,b){const x=typeof a==='number'?a:rgbLum(a),y=typeof b==='number'?b:rgbLum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
for(const skin of frameSkins){const setting=skin.settings;assert(contrast(setting.templateTextColor,setting.middleColor)>=4.5,`${skin.name}: message contrast`)}
for(const entry of frames.filter(x=>x.kind==='chat')){assert(Number.isFinite(entry.plaque?.luminance),`${entry.id}/${entry.shape}: plaque luminance missing`);assert(entry.plaque.ink,`${entry.id}/${entry.shape}: plaque ink missing`);const skin=frameSkins.find(x=>x.frameTemplate===entry.id);const plaque={...entry.plaque,...(skin?.plaque||{})};const background=plaque.coverPainted?plaque.color:entry.plaque.luminance;assert(contrast(plaque.ink||entry.plaque.ink,background)>=4.5,`${entry.id}/${entry.shape}: plaque contrast`)}
