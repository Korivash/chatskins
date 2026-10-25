import test from 'node:test';
import assert from 'node:assert/strict';
import {CLEAN} from '../js/settings.js';
import {CONTROL_MAP,CONTROL_LABELS} from '../js/controls.js';

function schemaPaths(value, prefix='') {
  if (Array.isArray(value)) return value.every(item=>item===null||['string','number','boolean'].includes(typeof item)) ? [prefix] : value.flatMap((item,index)=>schemaPaths(item,`${prefix}.${index}`));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([key,item])=>schemaPaths(item,prefix?`${prefix}.${key}`:key));
  return prefix === 'schemaVersion' ? [] : [prefix];
}

test('every settings schema key has exactly one editor control',()=>{
  const paths=schemaPaths(CLEAN);
  assert.equal(new Set(paths).size,paths.length,'schema contains duplicate paths');
  assert.deepEqual(Object.keys(CONTROL_MAP).sort(),paths.sort());
  for(const path of paths){assert.ok(CONTROL_LABELS[path],`missing label for ${path}`);assert.notEqual(CONTROL_LABELS[path],path.split('.').at(-1),`raw key label for ${path}`)}
});
