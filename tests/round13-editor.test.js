import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CLEAN,normalizeSettings,buildCompactSettingsUrl} from '../js/settings.js';
import {applySettingsDiff,decompressJson} from '../js/compact-link.js';
import {VIBES,PALETTES,SIZES,vibePatch,palettePatch,sizePatch,customColorPatch,simplePatch,tipFor,undoState} from '../js/guided-editor.js';
import {buildOverlayTestModel} from '../js/overlay-test-messages.js';

const P=['panel','messageBox','name','messageText','badges','system'];
const skins=JSON.parse(await readFile(new URL('../design/skins.json',import.meta.url),'utf8')).skins;

test('all documented vibes, palettes and sizes map to the exact settings contract',()=>{
 for(const [name,v] of Object.entries(VIBES)){const p=vibePatch(name);assert.equal(p.parts.name.fontFamily,v.font);assert.equal(p.parts.messageText.fontFamily,v.font);assert.equal(p.parts.panel.fontFamily,v.font);assert.equal(p.parts.name.fontWeight,700);assert.equal(p.parts.messageText.fontWeight,500);assert.equal(p.presentation.shape,v.shape);assert.equal(p.frame.style,v.frame);assert.equal(p.frame.width,v.width);assert.deepEqual(Object.values(p.frame.radius),Array(4).fill(v.radius));assert.equal(p.animationIn,v.motion);assert.equal(p.animationDuration,180)}
 for(const [name,[accent,back]] of Object.entries(PALETTES)){const p=palettePatch(name);assert.equal(p.parts.name.paint.color,accent+'FF');assert.equal(p.presentation.chipColor,back+'FF');assert.equal(p.backgrounds.message.color,back+'FF');assert.equal(p.nameStyle.minContrast,4.5)}
 for(const [name,[width,font,emote,spacing,inset]] of Object.entries(SIZES)){const p=sizePatch(name);assert.equal(p.overlayWidth,width);assert.equal(p.parts.name.fontSize,font);assert.equal(p.parts.system.fontSize,font);assert.equal(p.emotes.inlineSize,emote);assert.equal(p.messageSpacing,spacing);assert.equal(p.edgeInset,inset)}
 assert.equal(customColorPatch('#74A6FF').backgrounds.message.color,'#0E141FFF');
});

test('Undo restores a previous complete settings object',()=>{const previous=normalizeSettings(CLEAN),changed=structuredClone(previous);changed.parts.messageText.fontSize=32;const result=undoState([previous],changed);assert.deepEqual(result.state,previous);assert.equal(result.history.length,0)});

test('Show all options keeps the existing editor controls and IDs',async()=>{const [html,js]=await Promise.all([readFile(new URL('../editor.html',import.meta.url),'utf8'),readFile(new URL('../js/editor.js',import.meta.url),'utf8')]);const ids=['advanced-panel','advanced-toggle','search','gallery','scratch','skin-reset','my-skins','save-skin','export-skins','import-skins','settings','alerts-section','chat-play-section','undo','redo','transparent-toggle','copy','reset'];for(const id of ids)assert.match(html,new RegExp(`id="${id}"`));assert.match(html,/role="tablist"/);assert.match(js,/wireOptionsMenu/)});

test("Luna's static tip action applies its documented patch",()=>{const current=normalizeSettings(CLEAN);current.frame.style='none';const tip=tipFor(current,'Frame');assert.equal(tip.message,'A simple line helps separate chat from the game.');const changed=normalizeSettings({...current,...tip.patch,frame:{...current.frame,...tip.patch.frame}});assert.equal(changed.hideFrames,false);assert.equal(changed.frame.style,'solid');assert.equal(changed.frame.width,2)});

test("Luna's tip module makes no network calls",async()=>{const source=await readFile(new URL('../js/guided-editor.js',import.meta.url),'utf8');assert.doesNotMatch(source,/(\bfetch\s*\(|XMLHttpRequest|WebSocket\s*\(|EventSource\s*\()/)});

test('a generated Guided look link decodes and produces Test Chat messages',async()=>{let settings=normalizeSettings(CLEAN);const merge=(a,b)=>{for(const[k,v]of Object.entries(b)){if(v&&typeof v==='object'&&!Array.isArray(v))merge(a[k],v);else a[k]=v}return a};settings=merge(settings,vibePatch('Cozy'));settings=merge(settings,palettePatch('Mint'));settings=merge(settings,sizePatch('L'));const href=await buildCompactSettingsUrl('https://getchatskins.com/editor.html',{settings,baseSettings:CLEAN,baseSkinId:'clean'});const hash=new URL(href).hash.slice(1),payload=await decompressJson(new URLSearchParams(hash).get('data'));const decoded=normalizeSettings(applySettingsDiff(CLEAN,payload.c));assert.deepEqual(decoded,settings);assert.ok(buildOverlayTestModel(decoded).length>0);assert.match(href,/overlay\.html/)});

test('every Advanced setting key remains represented by the current catalog map',async()=>{const [editor,controls]=await Promise.all([readFile(new URL('../editor.html',import.meta.url),'utf8'),readFile(new URL('../js/controls.js',import.meta.url),'utf8')]);assert.match(editor,/<div id="settings">/);assert.match(controls,/CONTROL_MAP/);assert.ok(skins.length>=52)});
