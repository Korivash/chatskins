import test from 'node:test';import assert from 'node:assert/strict';import {parseEmotes} from '../js/emotes.js';
test('parses multiple emotes and preserves unicode text',()=>{assert.deepEqual(parseEmotes('Hi \u{1F44B} Kappa \u{2728}',{25:['6-10'],99:['12-12']}),[{type:'text',text:'Hi \u{1F44B} '},{type:'emote',id:'25',text:'Kappa'},{type:'text',text:' '},{type:'emote',id:'99',text:'\u{2728}'}]);});
test('ignores out of range and overlapping emotes',()=>{assert.deepEqual(parseEmotes('abc',{1:['0-1'],2:['1-2'],3:['8-9']}),[{type:'emote',id:'1',text:'ab'},{type:'text',text:'c'}]);});
