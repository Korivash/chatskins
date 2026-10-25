import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fitPlaqueText,refitPlaqueAfterFonts} from '../js/frame-templates.js';

const skins=JSON.parse(fs.readFileSync('design/skins.json','utf8')).skins.filter(s=>s.frameTemplate);
const saved=globalThis.getComputedStyle;
globalThis.getComputedStyle=node=>({fontSize:node.style.fontSize||'16px'});
function fakeTitle(text,width=80,scale=1){return{textContent:text,clientWidth:width,title:'',style:{},get scrollWidth(){const size=parseFloat(this.style.fontSize)||16;const spacing=this.style.letterSpacing?.endsWith('em')?parseFloat(this.style.letterSpacing)*size:0;const factor=typeof scale==='function'?scale():scale;return Math.max(0,Math.ceil(text.length*6.6*factor*(size/16)+text.length*spacing))}}}

for(const skin of skins){
  const plaque=JSON.parse(fs.readFileSync('site-media/frames/frames.json','utf8')).find(f=>f.kind==='chat'&&f.id===skin.frameTemplate&&f.shape===(skin.frameShape||'tall')).plaque;
  const title=fakeTitle('Your Channel',80,1.12);
  fitPlaqueText(title,/cinzel|marcellus|cormorant/i.test(skin.titleStyle.fontFamily)?'.005em':'');
  assert.ok(title.scrollWidth<=title.clientWidth,`${skin.name}: title fits after font shrink (median plaque ${plaque?.medianLuminance??'covered'})`);
  const subtitle=fakeTitle('LIVE CHAT',80,1.1);fitPlaqueText(subtitle,skin.titleStyle.subtitleLetterSpacing||'');
  assert.ok(subtitle.scrollWidth<=subtitle.clientWidth,`${skin.name}: sub-label fits`);
}

let loaded=false,release;
const delayedLoad=new Promise(resolve=>{release=resolve});
const fontSet={load:async()=>{await delayedLoad;loaded=true;return[]},ready:Promise.resolve()};
const delayedTitle=fakeTitle('Your Channel',80,()=>loaded?1.12:.55);
fitPlaqueText(delayedTitle,'.005em');
assert.equal(delayedTitle.style.fontSize,'','fallback font initially fits');
const refit=refitPlaqueAfterFonts(fontSet,[{family:'Cinzel Decorative',size:16,text:delayedTitle.textContent}],()=>fitPlaqueText(delayedTitle,'.005em'));
await Promise.resolve();release();await refit;
assert.equal(loaded,true);
assert.ok(delayedTitle.style.fontSize,'late wider web font triggered a second fit');
assert.ok(delayedTitle.scrollWidth<=delayedTitle.clientWidth,'delayed-font title fits with no clipped letters');

if(saved)globalThis.getComputedStyle=saved;else delete globalThis.getComputedStyle;
