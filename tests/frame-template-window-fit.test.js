import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CLEAN} from '../js/settings.js';
import {frameWindowForLayout} from '../js/frame-templates.js';
import {fitPanelMessages} from '../js/message-fit.js';

const css=fs.readFileSync('css/skin-render.css','utf8');
assert.match(css,/\.template-message-window\{[^}]*overflow:hidden/,'the measured inner window clips overflow');
assert.match(css,/\.template-message-window\{[^}]*justify-content:flex-end/,'new rows anchor at the bottom of the window');

// Model the measured frame window used by a painted dream with a clean skin.
const dreamSettings={...CLEAN,dreamPaintId:'a'.repeat(24),parts:{...CLEAN.parts,messageText:{...CLEAN.parts.messageText,fontSize:18}}};
assert.equal(dreamSettings.dreamPaintId.length,24);
const entry={w:1024,h:1536};
const inner={x:.12,y:.17,w:.76,h:.58};
const frame=frameWindowForLayout(442,662,entry,inner);
assert.ok(frame.width>0&&frame.height>0);

const originalGetComputedStyle=globalThis.getComputedStyle;
for(const [fontSize,lineHeight] of [[14,1.2],[18,1.35],[24,1.5],[28,1.8]]){
  const rows=[];
  const windowBox={left:20+frame.x,top:38+frame.y,width:frame.width,height:frame.height};
  windowBox.right=windowBox.left+windowBox.width;
  windowBox.bottom=windowBox.top+windowBox.height;
  const window={
    children:rows,
    clientHeight:Math.floor(frame.height),
    getBoundingClientRect(){return{...windowBox,right:windowBox.left+windowBox.width,bottom:windowBox.top+windowBox.height}},
  };
  const panel={_messageContainer:window};
  for(let index=0;index<10;index++){
    const textLines=index%3===0?3:2;
    const height=Math.ceil(fontSize*lineHeight*textLines+10);
    const row={
      index,
      offsetHeight:height,
      classList:{contains:name=>name==='message'},
      getAnimations:()=>[],
      getBoundingClientRect(){
        const later=rows.slice(rows.indexOf(this)+1);
        const afterHeight=later.reduce((sum,item)=>sum+item.offsetHeight+8,0);
        const bottom=windowBox.bottom-afterHeight;
        return{top:bottom-height,bottom,height,width:windowBox.width,left:windowBox.left,right:windowBox.left+windowBox.width};
      },
      remove(){const position=rows.indexOf(this);if(position>=0)rows.splice(position,1)},
    };
    rows.push(row);
  }
  globalThis.getComputedStyle=node=>node===window
    ?{rowGap:'4px',paddingTop:'0px',paddingBottom:'0px'}
    :{marginTop:'2px',marginBottom:'2px'};

  const removed=fitPanelMessages(panel,window.clientHeight);
  assert.ok(removed>0,`${fontSize}px text drops oldest rows when the window is full`);
  assert.ok(rows.length>0,`${fontSize}px text keeps the newest row`);
  assert.equal(rows.at(-1).index,9,'newest row remains at the bottom');
  for(const row of rows){
    const rect=row.getBoundingClientRect();
    const clip=window.getBoundingClientRect();
    assert.ok(rect.top>=clip.top-1,`${fontSize}px row ${row.index} stays below the inner top`);
    assert.ok(rect.bottom<=clip.bottom+1,`${fontSize}px row ${row.index} stays above the inner bottom`);
  }
}
if(originalGetComputedStyle)globalThis.getComputedStyle=originalGetComputedStyle;
else delete globalThis.getComputedStyle;

console.log('frame-template fit clips painted and catalog rows at every tested font size');
