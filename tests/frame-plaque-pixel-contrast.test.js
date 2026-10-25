import assert from 'node:assert/strict';
import fs from 'node:fs';

const skins=JSON.parse(fs.readFileSync('design/skins.json','utf8')).skins.filter(s=>s.frameTemplate);
const frames=JSON.parse(fs.readFileSync('site-media/frames/frames.json','utf8')).filter(f=>f.kind==='chat');
const lum=hex=>{assert.match(hex,/^#[\da-f]{6}$/i);const c=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
const ratio=(a,b)=>(Math.max(a,b)+.05)/(Math.min(a,b)+.05);

for(const entry of frames){
  const plaque=entry.plaque,skin=skins.find(s=>s.frameTemplate===entry.id);
  assert.ok(plaque,`${entry.id}/${entry.shape}: measured plaque metadata required`);
  assert.ok(skin,`${entry.id}: skin metadata required`);
  const surface=plaque.none?lum(skin.settings.middleColor):plaque.painted?lum(plaque.fill):plaque.medianLuminance;
  if(!plaque.none&&!plaque.painted)assert.ok(Number.isFinite(plaque.medianLuminance),`${entry.id}/${entry.shape}: median luminance from frame pixels required`);
  if(plaque.painted)assert.match(plaque.fill,/^#[\da-f]{6}$/i,`${entry.id}/${entry.shape}: rendered cover fill required`);
  const titleColors=[skin.titleStyle.color];
  const subColors=[skin.titleStyle.subtitleColor||skin.titleStyle.color];
  for(const color of [...titleColors,...subColors])assert.ok(ratio(lum(color),surface)>=4.5,`${skin.name}/${entry.shape}: effective title color ${color} on plaque (median ${surface.toFixed(3)})`);
}

const neon=skins.find(s=>s.frameTemplate==='neon-kawaii-goth');
assert.equal(neon.frameShape,'tall','Neon Kawaii Goth uses the tall art with the painted top-left CHAT plaque');
const neonEntry=frames.find(f=>f.id===neon.frameTemplate&&f.shape===neon.frameShape);
assert.ok(neonEntry.plaque.painted&&!neonEntry.plaque.none,'Neon Kawaii Goth title is positioned on its painted CHAT plaque');
const renderer=fs.readFileSync('js/frame-templates.js','utf8');
const css=fs.readFileSync('css/skin-render.css','utf8');
assert.match(renderer,/plaque\.dataset\.titleGradient='false'/,'plaque titles render as solid colors');
assert.match(renderer,/plaque\.style\.setProperty\('--plaque-title-stroke','0 transparent'\)/,'plaque title stroke is disabled');
const plaqueRules=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(match=>match[1].includes('template-plaque'));
assert.ok(plaqueRules.length,'plaque text styles are present');
for(const [,selector,declarations] of plaqueRules){assert.doesNotMatch(declarations,/background-clip\s*:\s*text|-webkit-background-clip\s*:\s*text|-webkit-text-fill-color\s*:\s*transparent/i,`${selector.trim()}: plaque text never uses clipped transparent fill`);assert.doesNotMatch(declarations,/-webkit-text-stroke\s*:\s*(?!0(?:\s|!|;|$))[^;]+/i,`${selector.trim()}: plaque text never uses a nonzero stroke`)}
assert.match(css,/\.chat\.has-frame-template \.template-plaque-title[^}]*-webkit-text-stroke:0!important/,'plaque title explicitly clears inherited stream text outline');
