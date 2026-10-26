import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {blankStudio,makeStudioKit,randomizeStudio,normalizeStudio,encodeStudio,decodeStudio,studioWindowRect,studioPartRect,studioRenderModel,createStudioHistory,createStudioController,syncStudioLayer,STUDIO_LIMIT} from '../js/frame-studio.js';
import {CLEAN,buildCompactSettingsUrl} from '../js/settings.js';
import {decompressJson} from '../js/compact-link.js';
import {mountStudioComposition} from '../js/studio-render.js';

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
  assert.deepEqual([border.x,border.y,border.w,border.h],[8,6,84,4],`${vibe} starts with the top nine-slice rail`);
  assert.equal(d.instances.filter(p=>p.part===border.part).length,4,`${vibe} has four rails for one band`);
  assert.equal(corners.length,4,`${vibe} has four matching corners`);
  const targets=[[8,10],[92,10],[8,90],[92,90]];for(const [x,y] of targets){assert.ok(Math.min(...corners.map(p=>Math.max(Math.abs(p.x+p.w/2-x),Math.abs(p.y+p.h/2-y))))<=2,`${vibe} corner centers track window corners`)}
  assert.ok(Math.abs(plaque.x+plaque.w/2-50)<=2,`${vibe} plaque is centered`);assert.ok(plaque.y+plaque.h<=10,`${vibe} plaque sits above the window`);
  assert.ok(stickers.length>=1&&stickers.length<=3);assert.ok(effects.length<=1);assert.equal(d.instances.filter(p=>p.part===19).length,1);palettes.add(d.palette.join(','));
 }
 assert.equal(palettes.size,6,'each kit has its own palette');
 const random=randomizeStudio('Spooky',()=>.5);assert.equal(random.instances.filter(p=>p.part<=10).length,4);assert.equal(random.instances.filter(p=>p.part>=11&&p.part<=18).length,4);
});
test('six kits and twenty Randomize seeds keep decoration outside the window at 1280x720',()=>{
 const vibes=['Cozy','Spooky','Cute','Neon','Royal','Gamer'],samples=[];for(const vibe of vibes){samples.push(makeStudioKit(vibe));for(let seed=0;seed<20;seed++)samples.push(randomizeStudio(vibe,()=>seed/20))}
 for(const draft of samples){const chat=draft.instances.find(p=>p.part===19),panel={x:128,y:36,w:480,h:660},window=studioWindowRect(chat,panel),windowPercent={x:chat.x,y:chat.y,w:chat.w,h:chat.h},model=studioRenderModel(draft,panel),geometry=draft.instances.filter(p=>p.part!==19).map(p=>({part:p,rect:studioWindowRect(studioPartRect(p,chat),panel)}));
  const band=geometry.filter(x=>x.part.part<=10);assert.equal(band.length,4);const minX=Math.min(...band.map(x=>x.rect.x)),minY=Math.min(...band.map(x=>x.rect.y)),maxX=Math.max(...band.map(x=>x.rect.x+x.rect.width)),maxY=Math.max(...band.map(x=>x.rect.y+x.rect.height));
  const expected=[window.x-panel.w*.04,window.y-panel.h*.04,window.x+window.width+panel.w*.04,window.y+window.height+panel.h*.04];for(const [i,v]of [minX,minY,maxX,maxY].entries())assert.ok(Math.abs(v-expected[i])<.001);
  const corners=geometry.filter(x=>x.part.part>=11&&x.part.part<=18);assert.equal(corners.length,4);for(const [x,y] of [[window.x,window.y],[window.x+window.width,window.y],[window.x,window.y+window.height],[window.x+window.width,window.y+window.height]])assert.ok(Math.min(...corners.map(c=>Math.max(Math.abs(c.rect.x+c.rect.width/2-x)/panel.w*100,Math.abs(c.rect.y+c.rect.height/2-y)/panel.h*100)))<=3);
  const plaque=geometry.find(x=>x.part.part>=29&&x.part.part<=36);assert.ok(Math.abs(plaque.rect.x+plaque.rect.width/2-(window.x+window.width/2))/panel.w*100<=2);
  for(const {part,rect} of geometry){if(part.part<=10)continue;const iw=Math.max(0,Math.min(rect.x+rect.width,window.x+window.width)-Math.max(rect.x,window.x)),ih=Math.max(0,Math.min(rect.y+rect.height,window.y+window.height)-Math.max(rect.y,window.y)),area=iw*ih/(window.width*window.height);assert.ok(area<=.04,`part ${part.part} intersects chat window by ${(area*100).toFixed(2)}%`)}
  assert.equal(model.window.x,window.x);assert.equal(model.window.y,window.y);assert.equal(windowPercent.w,84);
 }
});
test('Studio board edits on the large preview stage and Get link can enable from a channel',async()=>{
 const html=await readFile(new URL('editor.html',root),'utf8'),editor=await readFile(new URL('js/editor.js',root),'utf8');
 assert.match(html,/<div class="studio-board"[^>]*hidden/);assert.doesNotMatch(html,/studio-canvas-wrap/);assert.ok(html.includes('href="css/studio-render.css"'));
 assert.ok(editor.includes("window.addEventListener('scroll',syncStudioPreview,true)"));
 assert.ok(editor.includes("board._studioStageObserver.observe($('#stage'))"));
 assert.ok(editor.includes("board._studioStageObserver.observe($('#stage > .source > #chat'))"));
 assert.ok((await readFile(new URL('js/frame-studio.js',root),'utf8')).includes("document.querySelector('#stage > .source > #chat')"));
 assert.match(editor,/__studioLiveBoard=board/);assert.match(editor,/\$\('#stage > \.source'\)\.append\(board\)/);assert.match(editor,/linkReady=!!state\.channel/);assert.match(editor,/buildCompactSettingsUrl\(location\.href/);assert.match(await readFile(new URL('js/frame-studio.js',root),'utf8'),/syncStudioLayer\(chatElement,board\)/);
 const kit=makeStudioKit('Spooky'),settings={...CLEAN,channel:'channelpal',studioDesign:kit},url=await buildCompactSettingsUrl('https://getchatskins.com/editor.html',{settings,baseSkinId:'clean',baseSettings:CLEAN}),payload=await decompressJson(new URLSearchParams(new URL(url).hash.slice(1)).get('data'));
 assert.equal(payload.c.studioDesign,encodeStudio(kit));assert.equal(decodeStudio(payload.c.studioDesign).instances.length,kit.instances.length);
});
test('editor preview and overlay use the same studio DOM geometry at scaled stage sizes',async()=>{
 class El{
  constructor(tag){this.tagName=tag;this.children=[];this.dataset={};this.attrs={};this.style={setProperty(k,v){this[k]=v},removeProperty(k){delete this[k]}};this.className='';this.classList={add:(...names)=>{this.className=[...new Set(`${this.className} ${names.join(' ')}`.trim().split(/\s+/))].join(' ')},contains:name=>this.className.split(/\s+/).includes(name)};this.offsetWidth=0;this.offsetHeight=0;this.offsetLeft=0;this.offsetTop=0}
  append(child){child.parentElement=this;this.children.push(child)} replaceChildren(...children){this.children=[];for(const c of children)this.append(c)} remove(){this.parentElement?.children.splice(this.parentElement.children.indexOf(this),1)} removeAttribute(name){delete this.attrs[name]} setAttribute(name,value){this.attrs[name]=String(value)} querySelector(selector){return selector===':scope > .studio-composition'?this.children.find(c=>c.classList.contains('studio-composition'))||null:null} querySelectorAll(selector){const found=[];const visit=e=>{for(const child of e.children){if(selector==='.studio-art'&&child.classList.contains('studio-art'))found.push(child);visit(child)}};visit(this);return found}
  getBoundingClientRect(){const parent=this.parentElement?.getBoundingClientRect?.()||{left:0,top:0,scale:1},scale=this.scale||parent.scale||1,left=parent.left+(parseFloat(this.style.left)||0)*scale,top=parent.top+(parseFloat(this.style.top)||0)*scale,width=(parseFloat(this.style.width)||this.offsetWidth||0)*scale,height=(parseFloat(this.style.height)||this.offsetHeight||0)*scale;return{left,top,right:left+width,bottom:top+height,width,height,scale}}
 }
 class Doc{createElement(tag){return new El(tag)}}
 const old={document:globalThis.document,window:globalThis.window,ResizeObserver:globalThis.ResizeObserver,requestAnimationFrame:globalThis.requestAnimationFrame,getComputedStyle:globalThis.getComputedStyle,DOMMatrixReadOnly:globalThis.DOMMatrixReadOnly};
 globalThis.getComputedStyle=panel=>({transform:panel.style.transform||'none'});
 globalThis.DOMMatrixReadOnly=class{constructor(transform){const values=transform.match(/^matrix\((.*)\)$/)[1].split(',').map(Number);this.e=values[4];this.f=values[5]}};
 globalThis.document=new Doc();globalThis.window={__studioParts:[]};globalThis.ResizeObserver=class{observe(){}};globalThis.requestAnimationFrame=fn=>fn();
 const mount=async scale=>{const host=new El('div');host.scale=scale;host.getBoundingClientRect=()=>({left:146,top:208,scale});const chat=new El('div');chat.offsetWidth=480;chat.offsetHeight=660;chat.offsetLeft=0;chat.offsetTop=0;chat.parentElement=host;const kit=makeStudioKit('Royal');await mountStudioComposition({root:chat,draft:kit,channel:'ChannelPal',document:globalThis.document,fetcher:async()=>{throw Error('No parts needed for geometry')}});const layer=host.querySelector(':scope > .studio-composition'),board=new El('div');syncStudioLayer(chat,board);for(const node of [board,layer]){assert.equal(node.parentElement,host);assert.equal(node.style.position,'absolute');assert.equal(node.style.left,'0px');assert.equal(node.style.top,'0px');assert.equal(node.style.width,'480px');assert.equal(node.style.height,'660px')}chat.offsetLeft=32;chat.offsetTop=16;chat.offsetWidth=293;chat.offsetHeight=415;syncStudioLayer(chat,board);chat._studioSync();for(const node of [board,layer]){assert.equal(node.style.left,'32px');assert.equal(node.style.top,'16px');assert.equal(node.style.width,'293px');assert.equal(node.style.height,'415px')}
  // Chromium resolves translate(-50%,-50%) on a 480x680 panel to this matrix.
  chat.offsetLeft=640;chat.offsetTop=360;chat.offsetWidth=480;chat.offsetHeight=680;chat.style.transform='matrix(1,0,0,1,-240,-340)';
  syncStudioLayer(chat,board);chat._studioSync();
  for(const node of [board,layer]){assert.equal(node.style.left,'400px');assert.equal(node.style.top,'20px');assert.equal(node.style.width,'480px');assert.equal(node.style.height,'680px')}
  // Place it / Fit removes the translation, including when panel dimensions stay the same.
  chat.style.transform='none';syncStudioLayer(chat,board);chat._studioSync();
  for(const node of [board,layer]){assert.equal(node.style.left,'640px');assert.equal(node.style.top,'360px')}
  return{host,layer,scale}};
 try{
  for(const size of [1,.6097]){const rendered=await mount(size);assert.ok(rendered.layer);const rects=rendered.layer.querySelectorAll('.studio-art').map(node=>node.getBoundingClientRect()).map(r=>({x:(r.left-146)/rendered.scale,y:(r.top-208)/rendered.scale,w:r.width/rendered.scale,h:r.height/rendered.scale}));if(size===1)globalThis.__overlayPartRects=rects;else{assert.equal(rects.length,globalThis.__overlayPartRects.length);for(let i=0;i<rects.length;i++)for(const key of ['x','y','w','h']){const expected=globalThis.__overlayPartRects[i][key],actual=rects[i][key];assert.ok(Math.abs(actual-expected)<=Math.max(1,Math.abs(expected)*.01),`part ${i} ${key}: editor ${actual}, overlay ${expected}`)}}}
  const editor=await readFile(new URL('js/editor.js',root),'utf8');assert.match(editor,/mountStudioComposition/);assert.match(await readFile(new URL('js/frame-studio.js',root),'utf8'),/studioRenderModel\(draft,panel\)/);
 }finally{delete globalThis.__overlayPartRects;for(const [key,value]of Object.entries(old)){if(value===undefined)delete globalThis[key];else globalThis[key]=value}}
});
test('the editor only calls methods exposed by its imported Studio controller API',async()=>{
 const editor=await readFile(new URL('js/editor.js',root),'utf8');assert.match(editor,/import\s*\{[^}]*createStudioController[^}]*\}\s*from ['"]\.\/frame-studio\.js/);
 const called=[...editor.matchAll(/studioController(?:\?\.|\.)\s*([A-Za-z][A-Za-z0-9_]*)/g)].map(match=>match[1]);assert.deepEqual([...new Set(called)].sort(),['getDraft','init','render']);
 const oldDocument=globalThis.document,oldBoard=globalThis.__studioLiveBoard;delete globalThis.__studioLiveBoard;
 const element=()=>({append(){},addEventListener(){},setAttribute(){},querySelectorAll(){return[]},dataset:{},style:{setProperty(){}},value:'',textContent:''});
 globalThis.document={createElement:element};const rootNode={querySelector(selector){return selector==='.studio-board'?null:element()},querySelectorAll(){return[]},addEventListener(){},setPointerCapture(){}};
 try{const controller=createStudioController({root:rootNode,getDraft:blankStudio,setDraft(){},storage:null,fetcher:async()=>({json:async()=>({parts:[]})})});for(const method of called)assert.equal(typeof controller[method],'function',`controller.${method} is exposed`);await controller.init();controller.render();assert.ok(controller.getDraft().instances.length)}finally{if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;if(oldBoard===undefined)delete globalThis.__studioLiveBoard;else globalThis.__studioLiveBoard=oldBoard}
});
test('Studio UI and overlays contain no paid-tier wording',async()=>{
 const html=await readFile(new URL('editor.html',root),'utf8'),js=await readFile(new URL('js/frame-studio.js',root),'utf8'),json=await readFile(new URL('site-media/parts/parts.json',root),'utf8');assert.doesNotMatch(`${html}${js}${json}`,/premium/i);assert.match(html,/options-tab-studio/);assert.match(html,/aria-label="Parts you can add"/);
});
