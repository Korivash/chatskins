import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CLEAN} from '../js/settings.js';
import {CONTROL_MAP} from '../js/controls.js';
import {OPTION_TABS,nextOptionTab,isDockVisible,hasFrameCard,frameBrandColorPatch} from '../js/options-menu.js';

const [html,editor,css,menu]=await Promise.all([
  readFile(new URL('../editor.html',import.meta.url),'utf8'),
  readFile(new URL('../js/editor.js',import.meta.url),'utf8'),
  readFile(new URL('../css/editor-options.css',import.meta.url),'utf8'),
  readFile(new URL('../js/options-menu.js',import.meta.url),'utf8')
]);

test('all legacy setting paths are rendered as editable controls in Style or Chat',()=>{
  assert.match(editor,/wrap\.dataset\.setting=path/);
  assert.match(editor,/wrap\.dataset\.setting=path/);
  assert.match(editor,/#settings-style/);
  assert.match(editor,/#settings-chat/);
  for(const path of Object.keys(CONTROL_MAP))assert.notEqual(path.split('.').reduce((value,key)=>value?.[key],CLEAN),undefined,`known control path ${path}`);
  assert.match(editor,/optionPathDestination/);
  assert.match(editor,/makeChannelRules\(path,value\):makeControl\(path,value\)/);
  assert.match(html,/id="settings-style"/);
  assert.match(html,/id="settings-chat"/);
});

test('six semantic tabs activate with arrows, Home and End',()=>{
  assert.deepEqual(OPTION_TABS,['look','style','chat','viewers','alerts','link']);
  assert.equal(nextOptionTab(0,'ArrowRight'),1);
  assert.equal(nextOptionTab(1,'ArrowRight'),2);
  assert.equal(nextOptionTab(5,'ArrowRight'),0);
  assert.equal(nextOptionTab(0,'ArrowLeft'),5);
  assert.equal(nextOptionTab(4,'Home'),0);
  assert.equal(nextOptionTab(0,'End'),5);
  assert.match(menu,/tab\.addEventListener\('keydown'/);
  assert.match(menu,/activate\(next,\{focusPanel:false,focusTab:true\}\)/);
  assert.match(html,/role="tablist"/);
});

test('the history and link dock is fixed and stays inside the viewport',()=>{
  assert.match(html,/id="options-dock"/);
  assert.match(css,/\.options-dock\{position:fixed/);
  assert.equal(isDockVisible({top:820,bottom:900,width:1440,height:80},900),true);
  assert.equal(isDockVisible({top:822,bottom:902,width:1440,height:80},900),false);
  assert.match(html,/id="get-link"[^>]*>Get my OBS link/);
  assert.match(editor,/#get-link/);
});

test('the Frame card is conditional and brand matching writes frame settings',()=>{
  assert.equal(hasFrameCard({id:'clean'}),false);
  assert.equal(hasFrameCard({frameTemplate:'mothlight'}),true);
  assert.equal(hasFrameCard({illustration:{source:'art/demo.svg'}}),true);
  const patch=frameBrandColorPatch({parts:{name:{paint:{color:'#9CE8CFFF'}}},illustration:{layers:{edges:{enabled:false,color:'#fff'},glow:{enabled:true,color:'#000'}}}});
  assert.equal(patch.frameColor,'#9CE8CF');
  assert.deepEqual(patch.illustration.layers,{edges:{enabled:false,color:'#9CE8CF'},glow:{enabled:true,color:'#9CE8CF'}});
  assert.match(html,/id="frame-card"[^]*id="template-color"/);
  assert.match(editor,/frameBrandColorPatch\(state\)/);
});

test('Get my OBS link opens the existing one-link copy flow without changing the builder',async()=>{
  assert.match(editor,/optionsMenu\.activate\(5,\{focusPanel:true\}\)/);
  assert.match(editor,/alertsController\.buildUnifiedLink\(play,allowed\)/);
  assert.match(editor,/buildCompactPlayUrl\(location\.href/);
  assert.match(editor,/buildCompactSettingsUrl\(location\.href/);
  assert.match(html,/id="guided-copy"[^>]*>Copy overlay link/);
  const compact=await readFile(new URL('../tests/round11-setup.test.js',import.meta.url),'utf8');
  assert.match(compact,/one private link decodes to chat, play and alerts/i);
});

test('first-visit Make it mine presents the three mapped choices and saves the return tab',()=>{
  for(const name of ['Cozy','Hype','Spooky','Clean','Gamer','Cute'])assert.match(html,new RegExp(`data-vibe="${name}"`));
  for(const name of ['Stream blue','Mint','Sunset','Lavender','Rose','Gold'])assert.ok(html.includes(`data-palette="${name}"`));
  for(const name of ['S','M','L'])assert.ok(html.includes(`data-size="${name}"`));
  assert.match(editor,/vibePatch\(button\.dataset\.vibe\)/);
  assert.match(editor,/palettePatch\(button\.dataset\.palette\)/);
  assert.match(editor,/sizePatch\(button\.dataset\.size\)/);
  assert.match(menu,/chat-studio\.options-menu\.v1/);
});

