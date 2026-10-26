import test from 'node:test';
import assert from 'node:assert/strict';
import {fitPanelMessages, pendingMessageAnimations} from '../js/message-fit.js';

test('fits by explicit max height and removes oldest messages, never frame layer', () => {
  const frame = {classList:{contains:name=>name==='chat-surface'}, remove(){throw Error('frame removed')}};
  const makeMessage = name => ({name,offsetHeight:30,classList:{contains:value=>value==='message'},remove(){panel.children.splice(panel.children.indexOf(this),1)}});
  const panel = {children:[frame,makeMessage('oldest'),makeMessage('middle'),makeMessage('newest')],get scrollHeight(){return this.children.filter(x=>x.classList.contains('message')).length*30}};
  assert.equal(fitPanelMessages(panel,65),1);
  assert.deepEqual(panel.children,[frame,panel.children[1],panel.children[2]]);
  assert.deepEqual(panel.children.filter(x=>x!==frame).map(x=>x.name),['middle','newest']);
});

test('does not remove messages when content is within the max height', () => {
  const row={offsetHeight:30,classList:{contains:name=>name==='message'},remove(){throw Error('unexpected removal')}};
  const panel={children:[row],scrollHeight:30};
  assert.equal(fitPanelMessages(panel,30),0);
  assert.deepEqual(panel.children,[row]);
});

test('preserves the newest message when the available height is shorter than one row', () => {
  const makeMessage=name=>({name,offsetHeight:40,classList:{contains:value=>value==='message'},remove(){panel.children.splice(panel.children.indexOf(this),1)}});
  const panel={children:[makeMessage('older'),makeMessage('newest')],get scrollHeight(){return this.children.length*40}};
  const warn=console.warn;console.warn=()=>{};
  try { assert.equal(fitPanelMessages(panel,20),1); }
  finally { console.warn=warn; }
  assert.deepEqual(panel.children.map(row=>row.name),['newest']);
});
// Regression coverage for fractional auto-sized panels across the shipped catalog.
import {readFileSync} from 'node:fs';
import {buildOverlayTestModel} from '../js/overlay-test-messages.js';
import {normalizeSettings} from '../js/settings.js';

test('fractional row stack does not remove messages from an unclipped auto panel',()=>{
 const oldStyle=globalThis.getComputedStyle;
 const rows=Array.from({length:2},()=>({
  classList:{contains:name=>name==='message'},
  offsetHeight:91,
  getBoundingClientRect:()=>({height:91.4}),
  remove(){throw Error('fractional rounding must not remove a row')}
 }));
 const panel={children:rows,clientHeight:251,scrollHeight:251,getBoundingClientRect:()=>({height:251.4})};
 globalThis.getComputedStyle=node=>node===panel?{rowGap:'.6px'}:{marginTop:'12px',marginBottom:'22px'};
 try{assert.equal(fitPanelMessages(panel,680),0)}
 finally{globalThis.getComputedStyle=oldStyle}
});

test('every catalog skin keeps at least six of eight modeled test messages at 1280 × 720',()=>{
 const skins=JSON.parse(readFileSync(new URL('../design/skins.json',import.meta.url),'utf8')).skins;
 const oldStyle=globalThis.getComputedStyle;
 try{
  for(const skin of skins){
   const settings=normalizeSettings(skin.settings);
   const limit=720-2*settings.edgeInset;
   const margin=skin.round10Recipe?34:0;
   const gap=settings.messageSpacing;
   // Same line-count/19.2px geometry model as frame-template-fit.test.js.
   const panel={children:[]};
   const stack=()=>panel.children.reduce((sum,row)=>sum+row.height+margin,0)+Math.max(0,panel.children.length-1)*gap;
   Object.defineProperties(panel,{
    clientHeight:{get:()=>Math.round(Math.min(limit,stack()))},
    scrollHeight:{get:()=>Math.round(stack())}
   });
   panel.getBoundingClientRect=()=>({width:Math.min(1280,settings.overlayWidth),height:Math.min(limit,stack())});
   globalThis.getComputedStyle=node=>node===panel?{rowGap:gap+'px'}:{marginTop:margin?'12px':'0px',marginBottom:margin?'22px':'0px'};
   for(const message of buildOverlayTestModel(settings)){
    const row={
     height:Math.max(38,Math.max(1,Math.ceil(message.text.length/38))*19.2+8),
     classList:{contains:name=>name==='message'},
     get offsetHeight(){return Math.round(this.height)},
     getBoundingClientRect(){return{height:this.height}},
     remove(){panel.children.splice(panel.children.indexOf(this),1)}
    };
    panel.children.push(row);
    fitPanelMessages(panel,limit);
   }
   assert.ok(panel.children.length>=6,skin.id+' should retain six messages');
  }
 }finally{globalThis.getComputedStyle=oldStyle}
});

// Visual overflow must not influence layout fitting, even on a transformed panel.
test('rotated and scaled cards keep all eight rows that fit by layout height',()=>{
 const oldStyle=globalThis.getComputedStyle;
 const panel={children:[],clientHeight:680,scrollHeight:1600,getBoundingClientRect:()=>({height:300})};
 globalThis.getComputedStyle=node=>node===panel?{rowGap:'10px',paddingTop:'15px',paddingBottom:'15px'}:{marginTop:'0px',marginBottom:'0px',transform:'rotate(-3deg) scale(1.2)'};
 for(let i=0;i<8;i++)panel.children.push({offsetHeight:70,classList:{contains:n=>n==='message'},getBoundingClientRect:()=>({height:192,width:650}),remove(){panel.children.splice(panel.children.indexOf(this),1)}});
 try{
  assert.equal(fitPanelMessages(panel,680),0);
  assert.equal(panel.children.length,8);
  // 8*70 + 7*10 + 30 padding = 660. One pixel is tolerated.
  panel.clientHeight=659;
  assert.equal(fitPanelMessages(panel,680),0);
  panel.clientHeight=658;
  assert.equal(fitPanelMessages(panel,680),1);
  assert.equal(panel.children.length,7);
 }finally{globalThis.getComputedStyle=oldStyle}
});

test('finite entrances defer fitting until final layout; infinite decoration does not',()=>{
 const entrance={playState:'running',effect:{getComputedTiming:()=>({endTime:300})}};
 const glow={playState:'running',effect:{getComputedTiming:()=>({endTime:Infinity})}};
 const panel={children:[],clientHeight:100};
 for(let i=0;i<3;i++)panel.children.push({offsetHeight:40,classList:{contains:n=>n==='message'},getAnimations:()=>[entrance,glow],remove(){panel.children.splice(panel.children.indexOf(this),1)}});
 assert.equal(pendingMessageAnimations(panel).length,3);
 assert.equal(fitPanelMessages(panel,100),0);
 entrance.playState='finished';
 assert.equal(pendingMessageAnimations(panel).length,0);
 assert.equal(fitPanelMessages(panel,100),1);
});
