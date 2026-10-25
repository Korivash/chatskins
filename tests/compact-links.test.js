import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {defaultChatPlay,buildChatPlayUrl,parseCompactPlayFragment,encodePlaySource,decodePlaySource} from '../js/chat-play.js';
import {alertDefaults,buildAlertsUrl,parseCompactAlertsFragment,encodeAlertConfig,decodeAlertConfig} from '../js/alerts-config.js';
import {buildUnifiedOverlayUrl,decodeUnifiedOverlayFragment} from '../js/guided-setup.js';
import {normalizeSettings,CLEAN} from '../js/settings.js';
import {buildOverlayTestModel} from '../js/overlay-test-messages.js';
import {buildCompactSettingsUrl} from '../js/settings.js';
import {decompressJson,applySettingsDiff} from '../js/compact-link.js';
import {readFile as readSource} from 'node:fs/promises';

const catalog=JSON.parse(await readFile(new URL('../design/skins.json',import.meta.url),'utf8')).skins;
const design=JSON.parse(await readFile(new URL('../design/skins.json',import.meta.url),'utf8')).alertDesign;
const makePlay=(count)=>{const play=defaultChatPlay();play.enabled=true;play.points.enabled=true;play.allowedSkinIds=catalog.slice(0,count).map(s=>s.id);return play};

test('compressed private play links stay under the hard limit for 1, 6 and all 52 skins',async()=>{
 for(const count of [1,6,52]){const url=await buildChatPlayUrl('https://getchatskins.com/editor.html',{token:'t'.repeat(120),chatSettings:{...catalog[0].settings,channel:'korivash'},chatPlay:makePlay(count),allowedSkins:catalog.slice(0,count),baseSkinId:catalog[0].id,baseSettings:catalog[0].settings});assert.ok(url.length<30000,`${count} skins produced ${url.length} chars`);const params=new URLSearchParams(new URL(url).hash.slice(1));assert.equal(params.get('v'),'2');const parsed=await parseCompactPlayFragment(new URL(url).hash,catalog);assert.equal(parsed.config.allowedSkins.length,count)}
});

test('typical combined link is compact and restores effective settings, play, alerts and token',async()=>{
 const settings=normalizeSettings({...catalog[0].settings,channel:'korivash',fontSize:27,transparentBackground:true}),play=makePlay(6),alerts=alertDefaults(design);alerts.enabled=true;alerts.types.follow.enabled=true;
 const url=await buildUnifiedOverlayUrl('https://getchatskins.com/editor.html',{token:'mock-twitch-token-abcdefghijklmnopqrstuvwxyz',chatSettings:settings,chatPlay:play,allowedSkins:catalog.slice(0,6),baseSkinId:catalog[0].id,baseSettings:catalog[0].settings,alerts,recipe:catalog[0].alertRecipe,design});assert.ok(url.length<4000,`typical link length ${url.length}`);
 const decoded=await decodeUnifiedOverlayFragment(new URL(url).hash,catalog,design);assert.equal(decoded.token,'mock-twitch-token-abcdefghijklmnopqrstuvwxyz');assert.deepEqual(decoded.play.chatSettings,settings);assert.equal(decoded.play.chatPlay.enabled,true);assert.equal(decoded.play.allowedSkins.length,6);assert.equal(decoded.alerts.alerts.enabled,true);
 const overlayModel=buildOverlayTestModel(decoded.play.chatSettings);assert.ok(overlayModel.length>=8,'compact links preserve the settings needed by overlay test chat');
});

test('compact alerts links round trip; version 1 play and alerts links still decode',async()=>{
 const settings={...CLEAN,channel:'korivash'},alerts=alertDefaults(design);alerts.enabled=true;
 const compact=await buildAlertsUrl('https://getchatskins.com/editor.html',{token:'alerts-secret',chatSettings:settings,alerts,recipe:{title:'Live update'},baseSkinId:catalog[0].id,baseSettings:catalog[0].settings},design),decoded=await parseCompactAlertsFragment(new URL(compact).hash,catalog,design);assert.equal(decoded.token,'alerts-secret');assert.equal(decoded.config.chatSettings.channel,'korivash');
 const play=makePlay(2),legacyPlay=encodePlaySource({chatSettings:settings,chatPlay:play,skins:catalog.slice(0,2),baseSkinId:catalog[0].id});assert.ok(decodePlaySource(legacyPlay,catalog));
 const legacyAlerts=encodeAlertConfig({version:1,chatSettings:settings,alerts,recipe:{}},design);assert.equal(decodeAlertConfig(legacyAlerts,design).chatSettings.channel,'korivash');
});

test('settings-only skin links use the compact diff format and overlay test chat remains available',async()=>{
 const settings=normalizeSettings({...catalog[17].settings,channel:'qa',transparentBackground:true}),url=await buildCompactSettingsUrl('https://getchatskins.com/skins.html',{settings,baseSkinId:catalog[17].id,baseSettings:catalog[17].settings});assert.ok(url.length<4000);const parsed=new URL(url);parsed.searchParams.set('test','1');const params=new URLSearchParams(parsed.hash.slice(1)),payload=await decompressJson(params.get('data')),restored=normalizeSettings(applySettingsDiff(catalog[17].settings,payload.c));assert.equal(params.get('v'),'2');assert.equal(payload.b,catalog[17].id);assert.equal(restored.channel,'qa');assert.equal(restored.transparentBackground,true);assert.ok(buildOverlayTestModel(restored).length>=8);
 const overlay=await readSource(new URL('../js/overlay.js',import.meta.url),'utf8');assert.match(overlay,/compactPayload\?\.c/);assert.match(overlay,/if\(testMode\)\{for\(const message of buildOverlayTestModel\(s\)\)add\(message,false\)\}/);
});
