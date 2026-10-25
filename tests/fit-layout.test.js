import test from 'node:test';
import assert from 'node:assert/strict';
import {panelMaxHeight} from '../js/fit.js';

test('panel max height reserves insets, outer frame, and ornament overflow', () => {
  assert.equal(panelMaxHeight(900, 20, 3, 2, 8), 834);
  assert.equal(panelMaxHeight(100, 60), 0);
});
