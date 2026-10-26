import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {blankStudio,makeStudioKit,randomizeStudio,normalizeStudio,encodeStudio,decodeStudio,studioWindowRect,studioRenderModel,createStudioHistory,STUDIO_LIMIT} from '../js/frame-studio.js';
import {CLEAN,buildCompactSettingsUrl} from '../js/settings.js';
import {decompressJson} from '../js/compact-link.js';

const root=new URL('../',import.meta.url);
test('parts index has 60 unique trusted entries and every SVG exists',async()=>{
 const index=JSON.parse(await readFile(new URL('site-media/parts/parts.json',root),'utf8'));
 assert.equal(index.parts.length,60);assert.equal(new Set(index.parts.map(p=>p.id)).size,60);
 for(const [i,p] of index.parts.entries()){assert.equal(p.id,i);assert.match(p.file,/^[a-z0-9-]+\.svg$/);assert.ok(p.category);assert.ok(Array.isArray(p.tags));assert.ok(p.defaultSize.w>0&&p.defaultSize.h>0);const svg=await readFile(new URL(`site-media/parts/${p.file}`,root),'utf8');assert.match(svg,/<svg\b/);assert.doesNotMatch(svg,/<script|foreignObject|(?:href|src)=["']https?:\/\//i);assert.ok(Buffer.byteLength(svg)<3000)}
});
test('studio transforms and palette colors round-trip compactly',()=>{
 const source=makeStudioKit('Neon');source.name='ChannelPal ✨';source.instances[2].angle=37;source.instances[2].flipX=true;
 const actual=decodeStudio(encodeStudio(source));assert.deepEqual(actual,normalizeStudio(source,{strict:true}));
});
test('25-part design remains inside complete OBS link budget',async()=>{
 const design=blankStudio();for(let i=0;i<24;i++)design.instances.push({part:[0,11,20,29,37,44,50,59][i%8],x:(i*13)%75,y:(i*17)%80,w:10,h:10,angle:i%360,flipX:!!(i%2),flipY:!!(i%3),colors:[0,1,2]});
 const settings={...CLEAN,channel:'streamer',studioDesign:design};const link=await buildCompactSettingsUrl('https://getchatskins.com/editor.html',{settings,baseSkinId:'clean',baseSettings:CLEAN});assert.ok(link.length<6000,`link length ${link.length}`);
 const fragment=new URL(link).hash.slice(1),params=new URLSearchParams(fragment),payload=await decompressJson(params.get('data'));assert.equal(payload.c.studioDesign,encodeStudio(design));assert.deepEqual(decodeStudio(payload.c.studioDesign),normalizeStudio(design,{strict:true}));
});
test('chat window sets the message viewport at both stream canvas sizes',()=>{
 const design=makeStudioKit('Cozy'),chat=design.instances.find(p=>p.part===19);
 for(const panel of [{x:20,y:30,w:450,h:650},{x:100,y:160,w:800,h:700}]){const window=studioWindowRect(chat,panel);assert.ok(window.x>=panel.x&&window.y>=panel.y);assert.ok(window.x+window.width<=panel.x+panel.w);assert.ok(window.y+window.height<=panel.y+panel.h);const messages=[{text:'Hello'},{text:'A longer sample message'},{text:'Welcome'}],model=studioRenderModel(design,panel,messages);assert.equal(model.messages.length,3);for(const row of model.messages){assert.deepEqual(row.clip,window);assert.ok(row.clip.x>=panel.x&&row.clip.y>=panel.y&&row.clip.x+row.clip.width<=panel.x+panel.w&&row.clip.y+row.clip.height<=panel.y+panel.h)}}
});
test('overlay reads a saved design, mounts its artwork, and constrains live messages to the chat part',async()=>{
 const overlay=await readFile(new URL('js/overlay.js',root),'utf8'),renderer=await readFile(new URL('js/studio-render.js',root),'utf8');assert.match(overlay,/decodeStudio\(s\.studioDesign\)/);assert.match(overlay,/mountStudioComposition\(\{root,draft:s\.studioDesign/);assert.match(renderer,/studioRenderModel\(draft/);assert.match(renderer,/--studio-pad-left/);assert.match(renderer,/--studio-pad-bottom/);
});
test('starter kits and randomization remain valid, include a protected chat window and support history snapshots',()=>{
 for(const vibe of ['Cozy','Spooky','Cute','Neon','Royal','Gamer']){const kit=normalizeStudio(makeStudioKit(vibe));assert.equal(kit.instances.filter(p=>p.part===19).length,1);assert.ok(kit.instances.length<=STUDIO_LIMIT)}
 const randomized=randomizeStudio('Spooky',()=>.25);assert.ok(normalizeStudio(randomized));const before=makeStudioKit('Cozy'),after=structuredClone(before),history=createStudioHistory();after.instances[0].x+=1;history.record(before);assert.deepEqual(history.undo(after),before);assert.deepEqual(history.redo(before),after);
});
test('all six kits are curated complete compositions with panel-relative geometry',()=>{
 const vibes=['Cozy','Spooky','Cute','Neon','Royal','Gamer'],palettes=new Set();
 for(const vibe of vibes){
  const d=makeStudioKit(vibe),border=d.instances.find(p=>p.part<=10),plaque=d.instances.find(p=>p.part>=29&&p.part<=36),corners=d.instances.filter(p=>p.part>=11&&p.part<=18),stickers=d.instances.filter(p=>p.part>=37&&p.part<=59),effects=d.instances.filter(p=>p.part>=20&&p.part<=28);
  assert.deepEqual([border.x,border.y,border.w,border.h],[0,0,100,100],`${vibe} border follows chat panel`);
  assert.equal(corners.length,4,`${vibe} has four matching corners`);
  assert.deepEqual(corners.map(p=>[p.x,p.y]),[[0,0],[91,0],[0,91],[91,91]],`${vibe} corners touch panel corners`);
  assert.ok(Math.abs(plaque.x+plaque.w/2-50)<=2,`${vibe} plaque is centered`);assert.ok(plaque.y<=2,`${vibe} plaque touches top edge`);
  assert.ok(stickers.length>=1&&stickers.length<=3);assert.ok(effects.length<=1);assert.equal(d.instances.filter(p=>p.part===19).length,1);palettes.add(d.palette.join(','));
 }
 assert.equal(palettes.size,6,'each kit has its own palette');
 const random=randomizeStudio('Spooky',()=>.5);assert.equal(random.instances.filter(p=>p.part<=10).length,1);assert.equal(random.instances.filter(p=>p.part>=11&&p.part<=18).length,4);
});
test('Studio board edits on the large preview stage and Get link can enable from a channel',async()=>{
 const html=await readFile(new URL('editor.html',root),'utf8'),editor=await readFile(new URL('js/editor.js',root),'utf8');
 assert.match(html,/<div class="studio-board"[^>]*hidden/);assert.doesNotMatch(html,/studio-canvas-wrap/);
 assert.match(editor,/__studioLiveBoard=board/);assert.match(editor,/linkReady=!!state\.channel/);assert.match(editor,/buildCompactSettingsUrl\(location\.href/);
 const kit=makeStudioKit('Spooky'),settings={...CLEAN,channel:'channelpal',studioDesign:kit},url=await buildCompactSettingsUrl('https://getchatskins.com/editor.html',{settings,baseSkinId:'clean',baseSettings:CLEAN}),payload=await decompressJson(new URLSearchParams(new URL(url).hash.slice(1)).get('data'));
 assert.equal(payload.c.studioDesign,encodeStudio(kit));assert.equal(decodeStudio(payload.c.studioDesign).instances.length,kit.instances.length);
});
test('Studio UI and overlays contain no paid-tier wording',async()=>{
 const html=await readFile(new URL('editor.html',root),'utf8'),js=await readFile(new URL('js/frame-studio.js',root),'utf8'),json=await readFile(new URL('site-media/parts/parts.json',root),'utf8');assert.doesNotMatch(`${html}${js}${json}`,/premium/i);assert.match(html,/options-tab-studio/);assert.match(html,/aria-label="Parts you can add"/);
});
