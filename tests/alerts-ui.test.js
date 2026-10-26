import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {alertPreviewTarget} from '../js/alerts-editor.js';

test('alert test actions render with the selected skin recipe and reveal their preview',async()=>{
 const editor=await readFile(new URL('../js/alerts-editor.js',import.meta.url),'utf8'),css=await readFile(new URL('../css/site.css',import.meta.url),'utf8'),alertCss=await readFile(new URL('../css/alerts-render.css',import.meta.url),'utf8');
 assert.match(editor,/createAlertCard\(\{document:doc,event,config:\{\.\.\.config,chatSettings:current\},recipe:getRecipe\(\),design,preview:true\}\)/);
 assert.match(editor,/details\.querySelector\('\[data-alert-test\]'\)\.onclick=\(\)=>\{[^}]*testQueue\.push\(sample\(type,variant\)\);pumpTests\(\)\}/);
 assert.match(editor,/previewStage=make\(doc,'div',undefined,'alert-preview-stage'\)/);
 assert.match(editor,/const targetLayer=alertPreviewTarget\(/);
 assert.match(editor,/targetLayer\.append\(card\)/);
 const mainStage={children:[],querySelector:()=>null,append(node){this.children.push(node)}};
 const layer={classList:{add(){}},dataset:{}};
 assert.equal(alertPreviewTarget({asTest:true,mainStage,previewStage:null,createLayer:()=>layer}),layer,'test alerts use the main preview when the advanced panel is closed');
 assert.deepEqual(mainStage.children,[layer]);
 assert.match(editor,/getRecipe=\(\)=>getSkin\(\)\?\.alertRecipe/);
 assert.match(css,/\.alerts-editor \.alerts-type summary input\[type=checkbox\]\{appearance:none/);
 assert.match(css,/\.alerts-editor \.alerts-type summary::after\{content:'⌄'/);
 assert.match(alertCss,/\.stage>\.alerts-preview-layer\{z-index:20/);
});
