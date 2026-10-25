import test from 'node:test';
import assert from 'node:assert/strict';
import {FRAME_ATTRIBUTES, frameAttributes, datasetProperty} from '../js/frame-attributes.js';
import {readFileSync} from 'node:fs';

const css = readFileSync(new URL('../css/app.css', import.meta.url), 'utf8');
test('every frame attribute maps to a valid camelCase dataset property', () => {
  for (const attr of Object.values(FRAME_ATTRIBUTES)) {
    const property = datasetProperty(attr);
    assert.match(property, /^[a-z][a-zA-Z0-9]*$/, `${attr} must map to a valid dataset property`);
    assert.ok(!property.includes('-'), `${attr} must not leave dashes in the dataset key`);
  }
});
test('settings map to the frame data attributes consumed by CSS', () => {
  const settings = {hideFrames:false, frame:{style:'solid',target:'panel',outer:{enabled:true},ornament:{style:'dots'}}};
  assert.deepEqual(frameAttributes(settings), {
    [FRAME_ATTRIBUTES.style]:'solid', [FRAME_ATTRIBUTES.target]:'panel',
    [FRAME_ATTRIBUTES.outer]:'true', [FRAME_ATTRIBUTES.ornament]:'dots',
    [FRAME_ATTRIBUTES.hideFrames]:'false',
  });
  for (const attr of Object.values(FRAME_ATTRIBUTES)) assert.ok(css.includes(`[${attr}`), `CSS must select ${attr}`);
  for (const style of ['solid','double','dashed','dotted','groove','ridge','inset','outset','pixel','beveled']) {
    assert.ok(css.includes(`[data-frame=${style}]`), `CSS must draw ${style}`);
  }
});
