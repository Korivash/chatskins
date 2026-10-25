import assert from 'node:assert/strict';
import fs from 'node:fs';
const css=fs.readFileSync('css/skin-render.css','utf8'),skins=JSON.parse(fs.readFileSync('design/skins.json','utf8')).skins;
const templates=skins.filter(s=>s.category==='Frames');assert.equal(templates.length,18);
assert.ok(templates.filter(s=>s.animated).length>=10);
assert.match(css,/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.chat\.has-frame-template[\s\S]*?animation:none!important/);
assert.match(css,/data-reduce-motion=true[^}]*animation:none!important/);
const svgSkins=skins.filter(s=>s.category==='Illustrated');assert.equal(svgSkins.length,12);
for(const skin of svgSkins){assert.equal(skin.reducedMotionFallback,'authored-static');assert.ok(fs.existsSync(skin.illustration.source));const svg=fs.readFileSync(skin.illustration.source,'utf8');for(const layer of ['header','corners','edges','mascot','particles','glitch','glow'])assert.ok(svg.includes(`data-layer="${layer}"`),`${skin.id} lacks ${layer}`)}
console.log('frame accents honor reduced motion; all 12 layered SVG skins exist');
