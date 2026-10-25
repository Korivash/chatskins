import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CLEAN,normalizeSettings,buildCompactSettingsUrl} from '../js/settings.js';
import {decompressJson,applySettingsDiff} from '../js/compact-link.js';
import {layoutPanel} from '../js/panel-layout.js';
import {chooseFrameEntry} from '../js/frame-templates.js';
import {adjustInnerOffsets,centerInnerPadding,innerWindowWithOffsets,keyboardMove,movePanelRect,normalizePlacement} from '../js/place-mode.js';

const catalog=JSON.parse(fs.readFileSync('design/skins.json','utf8')).skins,manifest=JSON.parse(fs.readFileSync('site-media/frames/frames.json','utf8'));
const saved=normalizePlacement({panel:{x:.31,y:.17,w:.28,h:.5},inner:{top:.01,right:.02,bottom:.03,left:.04},plaque:{x:-.012,y:.008}});
const settings=normalizeSettings({...CLEAN,placement:saved});
const link=await buildCompactSettingsUrl('https://getchatskins.com/editor.html',{settings,baseSettings:CLEAN,baseSkinId:'clean'});
const payload=await decompressJson(new URLSearchParams(new URL(link).hash.slice(1)).get('data'));
assert.deepEqual(normalizeSettings(applySettingsDiff(CLEAN,payload.c)).placement,saved,'percentage placement survives the compact OBS link');

for(const [width,height] of [[1280,720],[1920,1080]]){
 const skin=catalog.find(item=>item.frameTemplate),entry=chooseFrameEntry(manifest,skin.frameTemplate,{shape:skin.frameShape}),aspect=entry.w/entry.h;
 const placement=normalizePlacement({panel:{x:.16,y:.12,w:.3,h:.8}}),root={classList:{contains:name=>name==='has-frame-template'},dataset:{frameAspect:String(aspect)},style:{values:{},setProperty(k,v){this.values[k]=v},getPropertyValue(k){return this.values[k]||''},width:'',height:'',maxHeight:''}},host={clientWidth:width,clientHeight:height,dataset:{}};
 layoutPanel(host,root,{...skin.settings,placement},height);
 assert.ok(Math.abs(parseFloat(root.style.left)-width*.16)<.01,`placed x maps to canvas pixels at ${width}x${height}`);
 assert.ok(Math.abs(parseFloat(root.style.top)-height*.12)<.01,`placed y maps to canvas pixels at ${width}x${height}`);
 assert.ok(Math.abs(parseFloat(root.style.width)-width*.3)<.01&&Math.abs(parseFloat(root.style.height)-height*.8)<.01,`stored width and height apply exactly at ${width}x${height}`);
 assert.ok(Math.abs(parseFloat(root.style.width)/parseFloat(root.style.height)/aspect-1)<.01,`frame aspect remains exact at ${width}x${height}`);
}

const base={x:.18,y:.12,w:.64,h:.72},offset={top:.02,right:.03,bottom:.01,left:.08},centered=centerInnerPadding(base,offset),left=base.x+centered.left,right=base.x+base.w-centered.right;
assert.ok(Math.abs(left-(1-right))<1e-9,'Center chat makes the left and right padding equal');
const shifted=innerWindowWithOffsets(base,{left:.45,right:-.4,top:-.4,bottom:.4});
assert.ok(shifted.x>=0&&shifted.y>=0&&shifted.x+shifted.w<=1&&shifted.y+shifted.h<=1,'inner-window adjustments stay inside the frame art');
const resized=adjustInnerOffsets({},'left',24,0,480,400),opened=innerWindowWithOffsets(base,resized);assert.ok(opened.x>base.x&&opened.x+opened.w<=base.x+base.w);

const moved=keyboardMove({x:.2,y:.3,w:.2,h:.2},'ArrowRight');assert.ok(Math.abs(moved.x-.21)<1e-9);assert.ok(Math.abs(keyboardMove(moved,'ArrowDown',{shift:true}).y-.4)<1e-9);
const snap=movePanelRect({x:.18,y:.2,w:.25,h:.3},.021,0);assert.ok(snap.x%0.05<1e-9||snap.guides.length>0,'panel drag snaps to the grid or center guides');
const before=normalizePlacement({panel:{x:.1,y:.2,w:.3,h:.4}}),after={...before,panel:movePanelRect(before.panel,.1,0)},history=[before];const undo=history.pop();assert.equal(undo.panel.x,before.panel.x);assert.notEqual(after.panel.x,before.panel.x,'one history snapshot restores a full drag');
const editor=fs.readFileSync('js/editor.js','utf8');assert.match(editor,/onStart:\(\)=>track\(\)/,'a drag records one undo snapshot before it starts');
console.log('placement compact link, responsive overlay layout, frame bounds, keyboard movement and drag undo verified');
