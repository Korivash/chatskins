import test from 'node:test';
import assert from 'node:assert/strict';
import {fitPanelMessages} from '../js/message-fit.js';

test('fits by explicit max height and removes oldest messages, never frame layer', () => {
  const frame = {classList:{contains:name=>name==='chat-surface'}, remove(){throw Error('frame removed')}};
  const makeMessage = name => ({name,classList:{contains:value=>value==='message'},remove(){panel.children.splice(panel.children.indexOf(this),1)}});
  const panel = {children:[frame,makeMessage('oldest'),makeMessage('middle'),makeMessage('newest')],get scrollHeight(){return this.children.filter(x=>x.classList.contains('message')).length*30}};
  assert.equal(fitPanelMessages(panel,65),1);
  assert.deepEqual(panel.children,[frame,panel.children[1],panel.children[2]]);
  assert.deepEqual(panel.children.filter(x=>x!==frame).map(x=>x.name),['middle','newest']);
});

test('does not remove messages when content is within the max height', () => {
  const row={classList:{contains:name=>name==='message'},remove(){throw Error('unexpected removal')}};
  const panel={children:[row],scrollHeight:30};
  assert.equal(fitPanelMessages(panel,30),0);
  assert.deepEqual(panel.children,[row]);
});

test('preserves the newest message when the available height is shorter than one row', () => {
  const makeMessage=name=>({name,classList:{contains:value=>value==='message'},remove(){panel.children.splice(panel.children.indexOf(this),1)}});
  const panel={children:[makeMessage('older'),makeMessage('newest')],get scrollHeight(){return this.children.length*40}};
  const warn=console.warn;console.warn=()=>{};
  try { assert.equal(fitPanelMessages(panel,20),1); }
  finally { console.warn=warn; }
  assert.deepEqual(panel.children.map(row=>row.name),['newest']);
});
