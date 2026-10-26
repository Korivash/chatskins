import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {makeStudioKit,studioRenderModel} from '../js/frame-studio.js';
import {studioWindowInsets} from '../js/studio-render.js';

test('Studio message content is fitted to the chat-window part at both canvas sizes',()=>{
 for(const size of [[1280,720],[1920,1080]]){
  const [width,height]=size,draft=makeStudioKit('Spooky'),model=studioRenderModel(draft,{x:0,y:0,w:width,h:height});
  const inset=studioWindowInsets(draft,width,height),content={left:inset.left,top:inset.top,right:width-inset.right,bottom:height-inset.bottom};
  assert.equal(content.left,model.window.x);assert.equal(content.top,model.window.y);
  assert.ok(Math.abs(content.right-(model.window.x+model.window.width))<0.01);assert.ok(Math.abs(content.bottom-(model.window.y+model.window.height))<0.01);
  // A normal preview stack is laid out inside that explicit content rectangle.
  const sampleRows=Array.from({length:7},(_,index)=>({top:content.bottom-(index+1)*52,bottom:content.bottom-index*52}));
  for(const row of sampleRows){assert.ok(row.top>=content.top-1);assert.ok(row.bottom<=content.bottom+1)}
 }
});

test('editor waits for the Studio window before it appends and fits preview rows',async()=>{
 const source=await readFile(resolve('js/editor.js'),'utf8');
 const attach=source.indexOf('await mountStudioComposition');
 const append=source.indexOf('appendRenderedMessage(root,createMessage(m,display,communityMap))',attach);
 const fit=source.indexOf('fitPanelMessages(root,host.clientHeight)',append);
 assert.ok(attach>=0&&append>attach&&fit>append);
 assert.match(source,/onPreview:async draft=>\{.*?delete state\.studioDesign;const root=.*?await mountStudioComposition/s);
});
