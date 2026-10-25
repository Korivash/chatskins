import test from 'node:test';import assert from 'node:assert/strict';import {crewColorFromName,CREW_COLORS} from '../js/crew-color.js';
test('crew color is stable for a login and case-insensitive',()=>{assert.equal(crewColorFromName('xqc'),crewColorFromName('XQC'));assert.equal(crewColorFromName('xqc'),crewColorFromName('xqc'));assert.ok(CREW_COLORS.includes(crewColorFromName('xqc')));assert.equal(crewColorFromName('xqc'),'#9960B4')});
test('crew color hashes UTF-8 names deterministically',()=>assert.equal(crewColorFromName('Møøse'),crewColorFromName('Møøse')));
