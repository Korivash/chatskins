import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {alphaWindowFromData,frameAssetUrl} from '../js/frame-templates.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'site-media/frames/frames.json'),'utf8'));
const skins=JSON.parse(fs.readFileSync(path.join(root,'design/skins.json'),'utf8')).skins;
for(const entry of manifest){
  const url=frameAssetUrl(entry.file,'https://getchatskins.com/overlay.html?test=1');
  assert.ok(url,`frame URL resolves: ${entry.id}`);
  assert.ok(!url.includes('undefined'));
  assert.equal(new URL(url).origin,'https://getchatskins.com');
  if(entry.kind==='chat'){
    const skin=skins.find(item=>item.frameTemplate===entry.id);
    assert.ok(skin,`skin for ${entry.id}`);
    assert.ok(skin.settings.fontSize>=16&&skin.settings.fontSize<=17,`${entry.id} template font defaults`);
    assert.ok(skin.settings.maxMessages>=6&&skin.settings.maxMessages<=9,`${entry.id} message cap`);
  }
}
assert.equal(frameAssetUrl('undefined','https://getchatskins.com/overlay.html'),null);
assert.equal(frameAssetUrl(undefined,'https://getchatskins.com/overlay.html'),null);

// A noisy, irregular opening with isolated opaque flecks should still return
// a substantial, center-aligned transparent window.
const width=240,height=360,pixels=new Uint8ClampedArray(width*height*4);
for(let y=0;y<height;y++)for(let x=0;x<width;x++)pixels[(y*width+x)*4+3]=(x<34||x>=206||y<42||y>=318)?255:0;
for(const [x,y] of [[124,180],[118,181],[125,200]])pixels[(y*width+x)*4+3]=255;
const rect=alphaWindowFromData(pixels,width,height);
assert.ok(rect.w>=.7&&rect.h>=.7&&rect.w<=.9&&rect.h<=.9);
assert.ok(rect.x<=.15&&rect.x+rect.w>=.85);

function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(item=>item.isDirectory()?walk(path.join(dir,item.name)):[path.join(dir,item.name)])}
for(const file of walk(root).filter(file=>!file.includes(`${path.sep}tests${path.sep}`)&&/\.(?:html|js|json)$/i.test(file))){
  const content=fs.readFileSync(file,'utf8');
  assert.doesNotMatch(content,new RegExp(['pre','mium'].join(''),'i'),`paid-sounding label in ${path.relative(root,file)}`);
}
const page=fs.readFileSync(path.join(root,'js/skins-page.js'),'utf8');
assert.ok(page.includes("paintTag.textContent='Hand-painted'"));
const templateCode=fs.readFileSync(path.join(root,'js/frame-templates.js'),'utf8');
assert.match(templateCode,/chooseFrameEntry\(entries,id,\{shape:hintedShape,targetAspect:settings\.templateAspect\|\|hintAspect,kind\}\)/,'one entry is chosen from the requested frame aspect');
assert.match(templateCode,/root\._frameEntry=entry;const exactAspect=entry\.w\/entry\.h/,'the selected entry controls panel aspect and frame metadata');
assert.match(templateCode,/art\.style\.objectFit='fill'/,'art fills the panel after its aspect is matched');
assert.match(templateCode,/--template-image-mask.*src/);
const overlay=fs.readFileSync(path.join(root,'overlay.html'),'utf8');
assert.match(overlay,/skin-render\.css/);
console.log(`round 14b frame URLs, alpha windows, defaults and wording verified (${manifest.length} assets, ${skins.length} skins)`);
