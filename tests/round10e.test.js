import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {applySkinMetadata,createMessage} from '../js/render.js';
import {normalizeSettings} from '../js/settings.js';
import {resolveEmotes} from '../js/emotes.js';

const data=JSON.parse(await readFile(new URL('../design/skins.json',import.meta.url),'utf8'));
class FakeNode{constructor(tag,text=''){this.tagName=tag;this.nodeType=tag==='#text'?3:1;this.text=String(text);this.childNodes=[];this.dataset={};this.attributes={};this.style={setProperty(){},getPropertyValue(){return ''}};this.classes=new Set();this.classList={add:(...names)=>names.forEach(name=>this.classes.add(name)),contains:name=>this.classes.has(name)};this.namespaceURI='http://www.w3.org/2000/svg'}append(...nodes){this.childNodes.push(...nodes)}prepend(...nodes){this.childNodes.unshift(...nodes)}querySelector(){return null}closest(){return null}setAttribute(key,value){this.attributes[key]=String(value)}get textContent(){return this.nodeType===3?this.text:this.text+this.childNodes.map(node=>node.textContent).join('')}set textContent(value){this.text=String(value);this.childNodes=[]}}
function walk(node,visit){visit(node);for(const child of node.childNodes||[])walk(child,visit)}
function chatText(node){const classes=String(node.className||'').split(/\s+/);if(classes.includes('initial')||classes.includes('chat-initial')||classes.includes('detail'))return'';return node.nodeType===3?node.text:(node.text||'')+(node.childNodes||[]).map(chatText).join('')}
function withFakeDocument(run){const original=globalThis.document;globalThis.document={createElement:tag=>new FakeNode(tag),createElementNS:(namespace,tag)=>{const node=new FakeNode(tag);node.namespaceURI=namespace;return node},createTextNode:text=>new FakeNode('#text',text)};try{return run()}finally{globalThis.document=original}}

test('all skin templates keep prefix, name and message separators with no doubled colons',()=>withFakeDocument(()=>{
 assert.equal(data.skins.length,52);
 for(const skin of data.skins){const settings=applySkinMetadata(normalizeSettings(skin.settings),skin),row=createMessage({username:'HypeSquad',text:'THIS IS AMAZING',badges:{}},settings),text=chatText(row),nameAt=text.indexOf('HypeSquad'),messageAt=text.indexOf('THIS IS AMAZING',nameAt+'HypeSquad'.length);assert.ok(nameAt>=0,`${skin.id} lost the name`);assert.ok(messageAt>nameAt,`${skin.id} lost or reordered the message`);const prefix=text.slice(0,nameAt),between=text.slice(nameAt+'HypeSquad'.length,messageAt);if(prefix)assert.match(prefix,/[\s\p{P}\p{S}]$/u,`${skin.id} glued prefix to name: ${text}`);assert.match(between,/[\s:.,!?;)>\]}›»·-]/u,`${skin.id} glued name to message: ${text}`);assert.doesNotMatch(text,/:\s*:/u,`${skin.id} has a doubled colon: ${text}`)}
 const expected=new Map([['battle-arena','[Team] HypeSquad'],['battle-royale','[Squad] HypeSquad'],['space-command','COMMS / HypeSquad'],['retro-rpg','HypeSquad shouts! THIS IS AMAZING']]);for(const[id,prefix]of expected){const skin=data.skins.find(item=>item.id===id),row=createMessage({username:'HypeSquad',text:'THIS IS AMAZING',badges:{}},applySkinMetadata(normalizeSettings(skin.settings),skin));assert.ok(row.textContent.includes(prefix),`${id}: ${row.textContent}`)}
}));

test('catalog counts on site and docs are loaded from skins.json, not hardcoded',async()=>{
 const [home,skins,homeJs,skinsJs,docsJs,faq,choosing,readme]=await Promise.all(['../index.html','../skins.html','../js/home.js','../js/skins-page.js','../docs/docs.js','../docs/content/faq.md','../docs/content/choosing-a-skin.md','../README.md'].map(path=>readFile(new URL(path,import.meta.url),'utf8')));
 assert.match(home,/id="skin-count-(?:copy|link|stat|faq)"/);assert.match(homeJs,/String\(skins\.length\)/);assert.match(skins,/id="skin-total"/);assert.match(skinsJs,/String\(skins\.length\)/);assert.match(docsJs,/fetch\('\.\.\/design\/skins\.json'\)/);assert.match(docsJs,/replaceAll\('\{\{skin-count\}\}',String\(skinCount\)\)/);assert.match(faq,/\{\{skin-count\}\}/);assert.match(choosing,/\{\{skin-count\}\}/);assert.doesNotMatch(readme,/\b(?:42|52) skins\b/i);
});

test('template whitespace is preserved through flex layout and Bubble Chat has one colon',async()=>{
 const css=await readFile(new URL('../css/skin-render.css',import.meta.url),'utf8');assert.match(css,/\.chat-message \.chat-name[^}]*white-space:pre-wrap/);assert.match(css,/\.chat-identity \.chat-name[^}]*white-space:pre-wrap/);assert.match(css,/\.chat-message \.channel-flow\{gap:0\}/);assert.match(css,/\.chat-message \.channel-identity\{display:block[^}]*white-space:pre-wrap/);assert.match(css,/skin-bubble-chat \.name::after\{content:none!important\}/);
});

test('emotes without a usable image URL fall back to text and render no undefined src/href',()=>withFakeDocument(()=>{
 const broken=new Map([['Kappa',{id:'broken-emote',provider:'7tv',url:undefined}]]);assert.deepEqual(resolveEmotes('Kappa',{},broken),[{type:'text',text:'Kappa'}]);
 for(const skin of data.skins){const settings=applySkinMetadata(normalizeSettings(skin.settings),skin),row=createMessage({username:'HypeSquad',text:'Kappa',badges:{}},settings,broken);walk(row,node=>{assert.notEqual(node.src,'undefined',`${skin.id} src`);assert.notEqual(node.href,'undefined',`${skin.id} href`);assert.notEqual(node.attributes?.src,'undefined',`${skin.id} src attribute`);assert.notEqual(node.attributes?.href,'undefined',`${skin.id} href attribute`)});assert.match(row.textContent,/Kappa/u,skin.id)}
}));
