import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildOverlayTestModel} from '../js/overlay-test-messages.js';
import {fitPanelMessages} from '../js/message-fit.js';

const skins=JSON.parse(fs.readFileSync('design/skins.json','utf8')).skins;
const skin=skins.find(item=>item.id==='frame-mothlight');
assert.ok(skin);
assert.equal(skin.settings.parts.messageText.fontSize,16);
const sample=buildOverlayTestModel(skin.settings);
assert.ok(sample.length>=6);
const rows=sample.map(message=>{
  const lineCount=Math.max(1,Math.ceil(message.text.length/38));
  const height=Math.max(38,lineCount*19.2+8);
  return{message,classList:{contains:name=>name==='message'},getBoundingClientRect:()=>({height}),remove(){const i=panel.children.indexOf(this);if(i>=0)panel.children.splice(i,1)}};
});
const panel={children:rows,clientHeight:662,scrollHeight:662,style:{paddingTop:'75px',paddingBottom:'75px'},getBoundingClientRect:()=>({height:662})};
const oldGetComputedStyle=globalThis.getComputedStyle;
globalThis.getComputedStyle=node=>node===panel?{paddingTop:'75px',paddingBottom:'75px',rowGap:'3px'}:{marginTop:'0px',marginBottom:'0px'};
try{fitPanelMessages(panel,662)}finally{if(oldGetComputedStyle)globalThis.getComputedStyle=oldGetComputedStyle;else delete globalThis.getComputedStyle}
const kept=panel.children.filter(row=>row.classList.contains('message'));
assert.ok(kept.length>=6,`frame test chat should keep six messages; kept ${kept.length}`);
assert.equal(kept.at(-1),rows.at(-1),'newest sample stays at the bottom of the ordered message stack');

const css=fs.readFileSync('css/skin-render.css','utf8');
assert.match(css,/\.chat\.has-frame-template\{justify-content:flex-end\}/,'template messages anchor at the bottom of the inner window');
console.log(`frame fit keeps ${kept.length} template sample messages inside the inner window`);
