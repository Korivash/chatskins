import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fitPreviewPanel } from '../js/skin-preview.js';

const skins = JSON.parse(await readFile(new URL('../design/skins.json', import.meta.url), 'utf8')).skins;
const frames = JSON.parse(await readFile(new URL('../site-media/frames/frames.json', import.meta.url), 'utf8'));
const frameSkins = skins.filter(skin => skin.frameTemplate);
assert.ok(frameSkins.length > 0, 'frame skins are present');

function assertFitInsidePreview(skin, previewWidth, previewHeight, targetHeight) {
  const entry = frames.find(frame => frame.id === skin.frameTemplate && frame.shape === skin.frameShape);
  assert.ok(entry, `${skin.id} has its selected frame shape`);
  const nativeHeight = 662;
  const nativeWidth = nativeHeight * entry.w / entry.h;
  const fit = fitPreviewPanel(previewWidth, previewHeight, {
    left: 20,
    top: 29,
    width: nativeWidth,
    height: nativeHeight,
  }, { padding: 0.04, targetHeight, maxScale: 2 });
  assert.ok(fit.bounds.left >= -1, `${skin.id} stays inside the left edge`);
  assert.ok(fit.bounds.top >= -1, `${skin.id} stays inside the top edge`);
  assert.ok(fit.bounds.right <= previewWidth + 1, `${skin.id} stays inside the right edge`);
  assert.ok(fit.bounds.bottom <= previewHeight + 1, `${skin.id} stays inside the bottom edge`);
  assert.ok(fit.height >= previewHeight * 0.75, `${skin.id} fills at least 75% of preview height`);
}

// The selected monitor is a 16:9 box of at least 560 CSS pixels on desktop.
for (const skin of frameSkins) assertFitInsidePreview(skin, 560, 315, 0.92);

// Gallery previews use the same fitting math with a smaller card viewport.
for (const skin of frameSkins) assertFitInsidePreview(skin, 180, 140, 0.92);

console.log(`Preview fit geometry passed for ${frameSkins.length} frame skins.`);
