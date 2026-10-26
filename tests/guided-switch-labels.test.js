import assert from 'node:assert/strict';
import fs from 'node:fs';
import {syncSwitchLabel} from '../js/guided-switches.js';

const html=fs.readFileSync('editor.html','utf8');
const editor=fs.readFileSync('js/editor.js','utf8');

for(const id of ['commands','points']){
  const inputId=`guided-${id}`;
  const labelId=`guided-${id}-label`;
  assert.match(html,new RegExp(`id="${inputId}"[^>]*>[\\s\\S]*?<span id="${labelId}"`),`${inputId} has a dedicated visible label`);
  assert.match(editor,new RegExp(`syncSwitchLabel\\(\\$\\('#${inputId}'\\),\\$\\('#${labelId}'\\)\\)`),`${inputId} label is refreshed by editor sync`);

  const input={checked:true};
  const label={textContent:''};
  syncSwitchLabel(input,label);
  assert.equal(label.textContent,'On',`${inputId} shows On when enabled on load`);
  input.checked=false;
  syncSwitchLabel(input,label);
  assert.equal(label.textContent,'Off',`${inputId} shows Off after being disabled`);
}

console.log('guided Viewers switch labels follow their checked state');
