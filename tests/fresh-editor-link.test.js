// Fresh links should contain only intentional editor customizations.
import test from 'node:test';
import assert from 'node:assert/strict';
import {CLEAN,normalizeSettings,buildCompactSettingsUrl} from '../js/settings.js';
import {blankStudio,encodeStudio} from '../js/frame-studio.js';
import {decompressJson} from '../js/compact-link.js';

test('fresh editor links omit blank Studio drafts, including old encoded drafts',async()=>{
 for(const studioDesign of [undefined,blankStudio(),encodeStudio(blankStudio())]){
  const settings=normalizeSettings({...CLEAN,channel:'channelpal',studioDesign});
  assert.equal(settings.studioDesign,undefined);
  const link=await buildCompactSettingsUrl('https://getchatskins.com/editor.html',{settings,baseSkinId:'clean',baseSettings:CLEAN});
  const payload=await decompressJson(new URLSearchParams(new URL(link).hash.slice(1)).get('data'));
  assert.equal(Object.hasOwn(payload.c,'studioDesign'),false);
 }
});
