import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('alert test actions render with the selected skin recipe and reveal their preview',async()=>{
 const editor=await readFile(new URL('../js/alerts-editor.js',import.meta.url),'utf8'),css=await readFile(new URL('../css/site.css',import.meta.url),'utf8');
 assert.match(editor,/createAlertCard\(\{document:doc,event,config:\{\.\.\.config,chatSettings:current\},recipe:getRecipe\(\),design,preview:true\}\)/);
 assert.match(editor,/details\.querySelector\('\[data-alert-test\]'\)\.onclick=\(\)=>\{[^}]*testQueue\.push\(sample\(type,variant\)\);pumpTests\(\)\}/);
 assert.match(editor,/if\(asTest\)\$\('#alerts-preview'\)\.scrollIntoView/);
 assert.match(editor,/getRecipe=\(\)=>getSkin\(\)\?\.alertRecipe/);
 assert.match(css,/\.alerts-editor \.alerts-type summary input\[type=checkbox\]\{appearance:none/);
 assert.match(css,/\.alerts-editor \.alerts-type summary::after\{content:'⌄'/);
});
