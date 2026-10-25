import test from 'node:test';
import assert from 'node:assert/strict';
import {panelMaxHeight} from '../js/fit.js';
import {layoutPanel} from '../js/panel-layout.js';

test('panel max height reserves insets, outer frame, and ornament overflow', () => {
  assert.equal(panelMaxHeight(900, 20, 3, 2, 8), 834);
  assert.equal(panelMaxHeight(100, 60), 0);
});

test('layout falls back to viewport height when the fixed host has not been sized yet', () => {
  const host={clientHeight:0,dataset:{}};
  const values=new Map();
  const panel={style:{setProperty:(key,value)=>values.set(key,value)}};
  const settings={frame:{outer:{enabled:false,offset:0,width:0},target:'message',ornament:{style:'none',size:0,inset:0}},edgeInset:20,overlayWidth:400,direction:'bottom',alignment:'left'};
  assert.equal(layoutPanel(host,panel,settings,900),860);
  assert.equal(values.get('--panel-max-height'),'860px');
  assert.equal(panel.style.maxHeight,'860px');
});
