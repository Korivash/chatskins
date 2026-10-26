import assert from 'node:assert/strict';
import fs from 'node:fs';
import {encodeSettings,decodeSettings} from '../js/settings.js';
const skins=JSON.parse(fs.readFileSync('design/skins.json','utf8')).skins.filter(s=>s.frameTemplate);
const clean=fs.readFileSync('js/settings.js','utf8').match(/export const CLEAN=(\{.*?\});/s)?.[1];
assert(clean,'CLEAN settings defaults are present');
const defaults=JSON.parse(clean);
const css=fs.readFileSync('css/skin-render.css','utf8');
const html=fs.readFileSync('editor.html','utf8');
const editor=fs.readFileSync('js/editor.js','utf8');
const reset=css.match(/\.chat\.has-frame-template:not\(\[data-template-message-borders="true"\]\) \.message\s*\{([^}]*)\}/)?.[1];
assert(reset,'default frame message border reset exists');
assert(/border\s*:\s*0\s*!important/.test(reset),'default message border width is zero');
assert(/outline\s*:\s*0\s*!important/.test(reset),'default message outline width is zero');
assert(!/background\s*:/.test(reset),'border reset preserves any readability background');
assert.equal(defaults.templateMessageBorders,false,'template message borders default off');
const explicit=decodeSettings(encodeSettings({...skins[0].settings,templateMessageBorders:true}));
assert.equal(explicit.templateMessageBorders,true,'template border preference round trips');
assert.match(html,/<input id="template-message-borders" type="checkbox"(?: role="switch")?>\s*Message borders/,'Simple mode has the Message borders toggle');
assert.match(editor,/templateMessageBorders=e\.target\.checked/,'toggle updates the real setting');
assert.match(css,/data-template-message-borders="true"/,'enabled setting bypasses the reset and restores style borders');
for(const skin of skins){
  const style=skin.messageStyle||skin.settings.templateMessageStyle||skin.frameTemplate;
  assert.equal(skin.settings.templateMessageBorders===true,false,`${skin.name}: default is off`);
  assert.match(reset,/border\s*:\s*0\s*!important/,`${skin.name}: computed border-width 0`);
  assert.match(reset,/outline\s*:\s*0\s*!important/,`${skin.name}: computed outline-width 0`);
  const blocks=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([,selector])=>selector.includes(`data-template-message-style="${style}"`)&&/\.message\s*::(?:before|after)/.test(selector));
  for(const[,selector,body]of blocks)assert.doesNotMatch(body,/\bborder(?:-(?:top|right|bottom|left))?\s*:/i,`${skin.name}: pseudo element ${selector} is not a divider`);
}
