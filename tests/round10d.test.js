import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {applySkinMetadata,contrastRatio,createMessage,effectiveSettings} from '../js/render.js';
import {normalizeSettings} from '../js/settings.js';

const data=JSON.parse(await readFile(new URL('../design/skins.json',import.meta.url),'utf8'));
const backdrop='#1a1d24';
function colors(skin){const result=[];for(const key of ['name','messageText','system']){const paint=skin.settings.parts[key]?.paint;if(paint?.mode==='solid')result.push(paint.color);else for(const stop of paint?.stops||[])result.push(stop.color)}for(const rule of skin.settings.channels?.rules||[])result.push(rule.textColor,rule.nameColor);if(skin.round10Recipe?.palette?.ink)result.push(skin.round10Recipe.palette.ink);return result.filter(Boolean)}
class FakeNode{constructor(tag,text=''){this.tagName=tag;this.nodeType=tag==='#text'?3:1;this.text=String(text);this.childNodes=[];this.dataset={};this.style={setProperty(){},getPropertyValue(){return ''}};this.attributes={};this.namespaceURI='http://www.w3.org/2000/svg';this.classes=new Set();this.classList={add:(...names)=>names.forEach(name=>this.classes.add(name)),contains:name=>this.classes.has(name)}}append(...nodes){this.childNodes.push(...nodes)}prepend(...nodes){this.childNodes.unshift(...nodes)}querySelector(){return null}closest(){return null}setAttribute(key,value){this.attributes[key]=String(value)}get textContent(){return this.nodeType===3?this.text:this.text+this.childNodes.map(node=>node.textContent).join('')}set textContent(value){this.text=String(value);this.childNodes=[]}}
function walk(node,fn){fn(node);for(const child of node.childNodes||[])walk(child,fn)}

test('default transparent state keeps any skin card whose text misses 4.5:1 on the stream backdrop',()=>{
 assert.ok(data.skins.length>=52);
 for(const skin of data.skins){const low=colors(skin).filter(color=>contrastRatio(color,backdrop)<4.5),state=applySkinMetadata(normalizeSettings(skin.settings),skin),effective=effectiveSettings(state);if(low.length){assert.equal(skin.transparentDefault,false,`${skin.id} needs a retained card for ${low.join(', ')}`);assert.ok(skin.transparentDefaultReason?.trim(),`${skin.id} needs a reason`);assert.equal(effective.transparentBackground,false,skin.id);assert.ok(effective.backgrounds.message.opacity>0||effective.backgrounds.panel.opacity>0,`${skin.id} card background remains visible`)}else{assert.ok(colors(skin).every(color=>contrastRatio(color,backdrop)>=4.5),skin.id);assert.equal(effective.transparentBackground,true,skin.id)}}
});

test('every skin renders a complete ChannelPal name separately from its message',()=>{
 const previous=globalThis.document;globalThis.document={createElement:tag=>new FakeNode(tag),createElementNS:(ns,tag)=>{const node=new FakeNode(tag);node.namespaceURI=ns;return node},createTextNode:text=>new FakeNode('#text',text)};
 try{for(const skin of data.skins){const settings=applySkinMetadata(normalizeSettings(skin.settings),skin),row=createMessage({username:'ChannelPal',text:'Here is the message',badges:{}},settings);let username;walk(row,node=>{const classes=String(node.className||'').split(/\s+/);if(classes.includes('chat-name-user')||classes.includes('channel-name'))username=node});assert.ok(username,`${skin.id} emitted no isolated username`);assert.equal(username.textContent,'ChannelPal',`${skin.id} truncated or altered the username`);const text=row.textContent,nameEnd=text.indexOf('ChannelPal')+10,messageStart=text.indexOf('Here is the message');assert.ok(messageStart>=nameEnd,`${skin.id} reordered the message`);assert.match(text.slice(nameEnd,messageStart),/[\s:.,!?;) >\]}-]/u,`${skin.id} lost the name/message separator`)}}finally{globalThis.document=previous}
});

test('renderer never ellipsizes the username and gives channel text its own wrapping item',async()=>{
 const css=await readFile(new URL('../css/skin-render.css',import.meta.url),'utf8');
 assert.match(css,/\.chat-name-user,\.channel-name\{[^}]*white-space:nowrap!important[^}]*word-break:keep-all!important/s);
 assert.match(css,/\.channel-message\{[^}]*flex:1 1 10ch[^}]*min-width:10ch/s);
 assert.doesNotMatch(css,/\.chat-identity \.chat-name\{[^}]*max-width:14ch/);
});
