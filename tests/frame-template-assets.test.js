import assert from 'node:assert/strict';
import fs from 'node:fs';
import {alphaWindowFromData} from '../js/frame-templates.js';

const manifest=JSON.parse(fs.readFileSync('site-media/frames/frames.json','utf8'));
const skins=JSON.parse(fs.readFileSync('design/skins.json','utf8')).skins;
assert.equal(manifest.length,32);
for(const entry of manifest){
  assert.ok(fs.existsSync(entry.file),`missing frame asset: ${entry.file}`);
  const bytes=fs.readFileSync(entry.file);
  assert.equal(bytes.toString('ascii',0,4),'RIFF',`${entry.file} is not a readable RIFF WebP`);
  assert.equal(bytes.toString('ascii',8,12),'WEBP',`${entry.file} is not WebP`);
  assert.ok(entry.w>0&&entry.h>0);
  assert.ok(entry.inner,`missing precomputed inner window: ${entry.id}/${entry.shape}`);
  assert.ok(entry.inner.w>=.4&&entry.inner.w<=.9&&entry.inner.h>=.4&&entry.inner.h<=.9,`invalid inner window: ${entry.id}/${entry.shape}`);
  if(entry.kind==='chat'){
    const skin=skins.find(item=>item.frameTemplate===entry.id);
    assert.ok(skin,`no skin maps to ${entry.id}`);
    assert.ok(skin.plaque,`missing title plaque rect for ${entry.id}`);
    const {x,y,w,h}=skin.plaque;
    assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=1&&y+h<=1,`invalid plaque rect for ${entry.id}`);
  }
}
const mothlight=manifest.find(entry=>entry.file==='site-media/frames/mothlight-tall.webp');
assert.ok(mothlight.inner.w>=.7&&mothlight.inner.h>=.7,'Mothlight tall window uses the broad central opening');
assert.ok(manifest.filter(entry=>entry.kind==='chat').every(entry=>entry.plaque),'every chat frame has precomputed title plaque metadata');
const templateSource=fs.readFileSync('js/frame-templates.js','utf8');
assert.doesNotMatch(templateSource,/getImageData|getAlphaWindow/,'overlay reads precomputed frame windows without scanning pixels');
const w=100,h=100,pixels=new Uint8ClampedArray(w*h*4);
for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,edge=x<10||x>=90||y<10||y>=90;pixels[i+3]=edge?255:0}
const inner=alphaWindowFromData(pixels,w,h);
assert.ok(inner.w*inner.h>=.45,'detected center window must cover at least 45%');
assert.ok(inner.x>0&&inner.y>0&&inner.x+inner.w<1&&inner.y+inner.h<1);
console.log(`frame assets and plaque metadata: ${manifest.length} assets verified`);
