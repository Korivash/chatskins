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
 assert.ok(largestCenterEmptyRect(decoded.data,decoded.width,decoded.height).rect.x>=0);
 assert.ok(measureTopPlaque(decoded.data,decoded.width,decoded.height).medianLuminance>.5);
});

test('the painted autumn PNG measures the large transparent chat window',async()=>{
 const png=await readFile(resolve('tests/fixtures/painted-dream-autumn.png')),measured=measurePaintedFrame(png);
 assert.deepEqual([measured.width,measured.height],[1024,1536]);
 assert.ok(measured.inner.x>=.08&&measured.inner.x<=.16,`x=${measured.inner.x}`);
 assert.ok(measured.inner.y>=.12&&measured.inner.y<=.2,`y=${measured.inner.y}`);
 assert.ok(measured.inner.w>=.68&&measured.inner.w<=.84,`w=${measured.inner.w}`);
 assert.ok(measured.inner.h>=.55&&measured.inner.h<=.75,`h=${measured.inner.h}`);
});
