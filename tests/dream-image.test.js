import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {centerTransparency,decodePngRgba,largestCenterEmptyRect,measurePaintedFrame,measureTopPlaque} from '../server/dream-image.mjs';

const fixture=resolve('tests/fixtures/painted-frame.png');

test('painted PNG fixture measures its transparent center, inner window and top plaque',async()=>{
 const png=await readFile(fixture),decoded=decodePngRgba(png),measured=measurePaintedFrame(png);
 assert.equal(decoded.width,256);assert.equal(decoded.height,384);
 assert.ok(centerTransparency(decoded.data,decoded.width,decoded.height)>=.95);
 assert.ok(measured.inner.w>=.7);assert.ok(measured.inner.h>=.7);
 assert.equal(measured.plaque.none,false);assert.ok(measured.plaque.w>.3);assert.ok(measured.plaque.h>0);
 assert.match(measured.plaque.fill,/^#[\da-f]{6}$/i);
 assert.ok(largestCenterEmptyRect(decoded.data,decoded.width,decoded.height).x>=0);
 assert.ok(measureTopPlaque(decoded.data,decoded.width,decoded.height).medianLuminance>.5);
});
