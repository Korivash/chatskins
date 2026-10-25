import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createSkinMonitorPreview} from '../js/skin-preview.js';

function fakeTimers(){let now=0,id=0;const pending=new Map();return{setTimeout(fn,delay){const key=++id;pending.set(key,{at:now+delay,fn});return key},clearTimeout(key){pending.delete(key)},advance(ms){const end=now+ms;while(true){const next=[...pending.entries()].filter(([,item])=>item.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;pending.delete(next[0]);now=next[1].at;next[1].fn()}now=end}}}

test('selected skin remains in the stream monitor after two minutes of fake time',()=>{
 const timers=fakeTimers(),rendered=[];const monitor=createSkinMonitorPreview('first-skin',id=>rendered.push(id),{timers});monitor.select('picked-skin');timers.advance(120000);assert.equal(monitor.selectedId,'picked-skin');assert.equal(rendered.at(-1),'picked-skin');monitor.stop();
});

test('Preview chat play runs one swap then returns to the current selection',()=>{
 const timers=fakeTimers(),rendered=[];const monitor=createSkinMonitorPreview('one',id=>rendered.push(id),{timers,demoDuration:5000});monitor.select('picked');assert.equal(monitor.previewChatPlay('demo'),true);assert.equal(rendered.at(-1),'demo');timers.advance(5000);assert.equal(rendered.at(-1),'picked');
});

test('skins and editor previews do not run an automatic chat-play showcase',async()=>{
 const skins=await readFile(new URL('../js/skins-page.js',import.meta.url),'utf8'),editor=await readFile(new URL('../js/editor.js',import.meta.url),'utf8'),home=await readFile(new URL('../js/home.js',import.meta.url),'utf8');
 assert.doesNotMatch(skins,/setInterval\s*\(/);assert.match(skins,/Preview chat play|previewChatPlay/);assert.doesNotMatch(editor,/setInterval\s*\(/);assert.match(home,/setInterval\s*\(/);
});
