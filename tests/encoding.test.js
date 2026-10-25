import test from 'node:test';
import assert from 'node:assert/strict';
import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
async function sourceFiles(dir){
 const found=[];
 for(const entry of await readdir(dir,{withFileTypes:true})){
  if(entry.name==='.git')continue;
  const full=path.join(dir,entry.name);
  if(entry.isDirectory())found.push(...await sourceFiles(full));
  else if(/\.(?:html|js|css)$/i.test(entry.name))found.push(full);
 }
 return found;
}

test('HTML, JavaScript and CSS contain no common UTF-8 mojibake or replacement characters',async()=>{
 const forbidden=[String.fromCodePoint(0x00c3),String.fromCodePoint(0x00c2),String.fromCodePoint(0xfffd)];
 const offenders=[];
 for(const file of await sourceFiles(root)){
  const text=await readFile(file,'utf8');
  for(const marker of forbidden)if(text.includes(marker))offenders.push(`${path.relative(root,file)} contains U+${marker.codePointAt(0).toString(16).toUpperCase()}`);
  if(/Preview only\s\?\s/.test(text))offenders.push(`${path.relative(root,file)} uses a question mark as a status separator`);
 }
 assert.deepEqual(offenders,[]);
});
