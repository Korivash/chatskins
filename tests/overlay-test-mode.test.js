import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {normalizeSettings,encodeSettings,decodeSettings} from '../js/settings.js';
import {buildOverlayTestModel} from '../js/overlay-test-messages.js';
const {skins}=JSON.parse(await readFile(new URL('../design/skins.json',import.meta.url),'utf8'));
const overlay=await readFile(new URL('../js/overlay.js',import.meta.url),'utf8');
test('skins-page overlay links always retain test fixtures with channel and transparent skin settings',()=>{assert.equal(skins.length,52);for(const skin of skins){const settings=normalizeSettings({...skin.settings,channel:'qa',transparentBackground:true}),url=new URL('https://getchatskins.com/overlay.html?test=1');url.searchParams.set('skin',skin.id);url.hash=encodeSettings(settings);const decoded=decodeSettings(url.hash),model=buildOverlayTestModel(decoded);assert.equal(decoded.channel,'qa',skin.id);assert.equal(decoded.transparentBackground,true,skin.id);assert.ok(model.length>0,skin.id)}assert.match(overlay,/if\(testMode\)\{for\(const message of buildOverlayTestModel\(s\)\)add\(message,false\)\}else if\(s\.channel\)connectChat/);assert.match(overlay,/if\(testMode&&chatPlay\)/)});
