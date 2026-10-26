import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CLEAN,normalizeSettings,buildCompactSettingsUrl} from '../js/settings.js';
import {decompressJson} from '../js/compact-link.js';
import {isPaintedDreamSelected,selectPaintedDream,selectDreamParts,watchDreamPaint} from '../js/dream-client.js';

const dreamId='a'.repeat(24);
const placeholder={version:1,catalog:19,board:[600,680],name:'Ghost Garden',motion:true,palette:['#6644AA'],instances:[{uid:'window',part:19,x:10,y:10,w:80,h:80,angle:0,flipX:false,flipY:false,colors:[0,0,0]}]};

test('paint-ready state clears the Studio placeholder and selects visible frame art',async()=>{
 const partsState=selectDreamParts({...CLEAN,channel:'channelpal'},placeholder);
 assert.equal(partsState.dreamPaintId,'');
 assert.equal(isPaintedDreamSelected(partsState),false);

 let readyState=partsState;
 const status=await watchDreamPaint(async()=>({ok:true,json:async()=>({imageStatus:'ready'})}),{id:dreamId,key:'private-key'},{interval:0,timeout:50,onReady:()=>{
  readyState=normalizeSettings(selectPaintedDream(readyState,dreamId));
  readyState.studioDesign=null;
 }});
 assert.equal(status,'ready');
 assert.equal(readyState.studioDesign,null);
 assert.equal(readyState.dreamPaintId,dreamId);
 assert.equal(isPaintedDreamSelected(readyState),true);
 assert.equal(normalizeSettings(readyState).studioDesign,undefined);

 // The real frame-template path selects the painted image from this id.
 const templateSource=await readFile(new URL('../js/frame-templates.js',import.meta.url),'utf8');
 assert.match(templateSource,/settings\?\.dreamPaintId/);
 assert.match(templateSource,/dream-\$\{dreamId\}/);
});

test('painted OBS links contain the image id and omit the placeholder design',async()=>{
 const readyState=selectPaintedDream({...CLEAN,channel:'channelpal',studioDesign:placeholder},dreamId);
 const link=await buildCompactSettingsUrl('https://getchatskins.com/overlay.html',{settings:readyState,baseSkinId:'clean',baseSettings:CLEAN});
 const payload=await decompressJson(new URLSearchParams(new URL(link).hash.slice(1)).get('data'));
 assert.equal(payload.c.dreamPaintId,dreamId);
 assert.equal(Object.hasOwn(payload.c,'studioDesign'),false);
});

test('using the parts option restores the retained editable composition',()=>{
 const painted=selectPaintedDream({...CLEAN,channel:'channelpal',studioDesign:placeholder},dreamId);
 const restored=selectDreamParts(painted,placeholder);
 assert.equal(restored.dreamPaintId,'');
 assert.deepEqual(restored.studioDesign,placeholder);
});
