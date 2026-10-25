import assert from 'node:assert/strict';
import fs from 'node:fs';

const skins=JSON.parse(fs.readFileSync('design/skins.json','utf8')).skins.filter(s=>s.frameTemplate);
const frames=JSON.parse(fs.readFileSync('site-media/frames/frames.json','utf8')).filter(f=>f.kind==='chat');
const renderer=fs.readFileSync('js/frame-templates.js','utf8');
const css=fs.readFileSync('css/skin-render.css','utf8');
function luminance(color){assert.match(color,/^#[\da-f]{6}$/i);const rgb=color.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]}
function contrast(a,b){return(Math.max(a,b)+.05)/(Math.min(a,b)+.05)}

for(const skin of skins){
  const style=skin.titleStyle;
  assert.ok(style?.fontFamily,`${skin.name}: title font family`);
  assert.ok(style?.color,`${skin.name}: title color`);
  assert.ok(style?.gradient&&style?.effect,`${skin.name}: painted title treatment`);
  const entries=frames.filter(frame=>frame.id===skin.frameTemplate);
  assert.ok(entries.length,`${skin.name}: frame entries`);
  const titleColors=style.gradient&&style.gradient!=='none'?[...(style.gradient.match(/#[\da-f]{6}/ig)||[])]:[style.color];
  for(const entry of entries){
    const plaque={...entry.plaque,...(skin.plaque||{})};
    const surface=plaque.none?luminance(skin.settings?.middleColor||'#17172a'):plaque.painted?luminance(plaque.fill):plaque.medianLuminance;
    for(const color of titleColors)assert.ok(contrast(luminance(color),surface)>=4.5,`${skin.name}/${entry.shape}: ${color} contrast against plaque`);
  }
}

assert.match(renderer,/applyPlaqueTitleStyle\(title,titleNode,subtitleNode,skin\?\.titleStyle,settings\.frameColor\)/);
assert.match(renderer,/fonts\.googleapis\.com\/css2\?family=/);
assert.match(renderer,/display=swap/);
assert.match(css,/data-title-gradient=true/);
assert.match(css,/data-title-effect=emboss/);
assert.match(css,/data-title-effect=ghost/);

for(const entry of frames){
  const plaque=entry.plaque;
  assert.ok(plaque&&(plaque.none||Number.isFinite(plaque.x)&&Number.isFinite(plaque.y)&&Number.isFinite(plaque.w)&&Number.isFinite(plaque.h)),`${entry.id}/${entry.shape}: plaque or none required`);
  if(plaque.none)continue;
  assert.ok(plaque.x>=0&&plaque.y>=0&&plaque.x+plaque.w<=1&&plaque.y+plaque.h<=1,`${entry.id}/${entry.shape}: plaque rect inside image`);
  if(plaque.painted)assert.match(plaque.fill,/^#[\da-f]{6}$/i,`${entry.id}/${entry.shape}: painted plaque needs sampled fill`);
}
