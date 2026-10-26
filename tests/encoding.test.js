// All user-facing source files must remain UTF-8 without BOM or mojibake.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';

async function sourceFiles(directory){
 const result=[];
 for(const entry of await readdir(directory,{withFileTypes:true})){
  if(['.git','node_modules','.media-tmp'].includes(entry.name))continue;
  const path=directory+'/'+entry.name;
  if(entry.isDirectory())result.push(...await sourceFiles(path));
  else if(/\.(html|js|mjs|css)$/.test(path))result.push(path);
 }
 return result;
}
test('HTML, JS, CSS and server sources have clean UTF-8 encoding',async()=>{
 for(const path of await sourceFiles('.')){
  const bytes=await readFile(path);
  if(/\.html$/.test(path)||/^\.\/(js|css|server)\//.test(path)){
   assert.notDeepEqual([...bytes.subarray(0,3)],[239,187,191],path+' BOM');
  }
  const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
  assert.doesNotMatch(text,/Preview only\s\?\s/,path+' status separator');
  assert.doesNotMatch(text,/\u00e2[\u0080\u20ac\u2020]|\u00c3[\u0080-\u00bf]|\u00c2[\u0080-\u00bf]|\ufffd/,path+' mojibake');
 }
});
