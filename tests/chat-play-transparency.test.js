import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {encodeSettings,decodeSettings,normalizeSettings} from '../js/settings.js';

const {skins}=JSON.parse(await readFile(new URL('../design/skins.json',import.meta.url),'utf8'));
assert.ok(skins.length>0);
for(const skin of skins){
  assert.equal(skin.settings.transparentBackground,true,`${skin.id} should create transparent links by default`);
  const decoded=decodeSettings(encodeSettings(skin.settings));
  assert.equal(decoded.transparentBackground,true,`${skin.id} link should stay transparent`);
}
const optedOut=normalizeSettings({...skins[0].settings,transparentBackground:false});
assert.equal(decodeSettings(encodeSettings(optedOut)).transparentBackground,false,'explicit transparent off is preserved');
const legacy={schemaVersion:3,...skins[0].settings};delete legacy.transparentBackground;
const legacyHash=btoa(unescape(encodeURIComponent(JSON.stringify(legacy)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'');
assert.equal(decodeSettings(legacyHash).transparentBackground,false,'missing key uses historical opaque behavior');
const oldSchema=btoa(unescape(encodeURIComponent(JSON.stringify({schemaVersion:1,channel:'old'})))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'');
assert.equal(decodeSettings(oldSchema).transparentBackground,false,'legacy schema remains opaque');
const legacyOff=btoa(unescape(encodeURIComponent(JSON.stringify({schemaVersion:1,channel:'old',transparentBackground:false})))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'');
assert.equal(decodeSettings(legacyOff).transparentBackground,false,'explicit old opt-out is preserved');
console.log('chat-play-transparency.test.js passed');
