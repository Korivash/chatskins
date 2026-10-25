import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolveChannelRules,fillChannelTemplate} from '../js/channels.js';
import {createMessage} from '../js/render.js';
import {normalizeSettings} from '../js/settings.js';
import {fitSkinPreview} from '../js/skin-preview.js';

const catalog=JSON.parse(await readFile(new URL('../design/skins.json',import.meta.url),'utf8'));
const samples=[
 {username:'Orbit',text:'Welcome, everyone!',badges:{broadcaster:'1'}},
 {username:'Juniper',text:'Check the party list.',badges:{moderator:'1'}},
 {username:'PixelPilot',text:'Good run, team!',badges:{vip:'1'}},
 {username:'Starlight',text:'Ready for the next match?',badges:{subscriber:'1'}},
 {username:'Moss',text:'hello streamer, see you soon',badges:{}},
 {username:'LunaLoop',text:'Nice timing, everyone.',badges:{}}
];

test('every skin renders a readable separator between name formatting and message text',()=>{
 assert.ok(catalog.skins.length>=52);for(const skin of catalog.skins)for(const message of samples){const {rule}=resolveChannelRules(message,{...skin.settings,channel:'streamer'});const line=rule?fillChannelTemplate(rule.format,message):`${message.username}: ${message.text}`;assert.ok(line.endsWith(message.text),`${skin.id} lost message text`);const prefix=line.slice(0,-message.text.length);assert.match(prefix,/[\s:.,!?;)>\]}\-]$/u,`${skin.id}: ${line}`)}
});

test('skin page previews use the overlay message builder and retain a name/message separator',async()=>{
 const source=await readFile(new URL('../js/skins-page.js',import.meta.url),'utf8');
 assert.match(source,/import\s*\{[^}]*createMessage[^}]*\}\s*from\s*['"]\.\/render\.js['"]/);
 assert.match(source,/chat\.append\(createMessage\(message,previewSettings\)\)/);
 class Node {constructor(tag,text=''){this.nodeType=text?3:1;this.text=text;this.childNodes=[];this.dataset={};this.style={setProperty(){},getPropertyValue(){return ''}};this.classList={add(){}}}append(...items){this.childNodes.push(...items)}prepend(...items){this.childNodes.unshift(...items)}querySelector(){return null}setAttribute(){}get textContent(){return this.nodeType===3?this.text:this.text+this.childNodes.map(node=>node.textContent).join('')}set textContent(value){this.text=String(value);this.childNodes=[]}}
 const prior=globalThis.document;globalThis.document={createElement:tag=>new Node(tag),createTextNode:text=>new Node('#text',text)};
 try {const skin=catalog.skins.find(item=>item.id==='bubble-lift'),message={username:'Orbit',text:'Welcome, everyone!',badges:{},emotes:{}};const row=createMessage(message,normalizeSettings(skin.settings));assert.match(row.textContent,/Orbit\s+Welcome, everyone!/)} finally {globalThis.document=prior}
});

test('preview fit centers the measured wrapper and uses the Round 7f scale bounds',()=>{
 const prior=globalThis.ResizeObserver,priorDocument=globalThis.document;globalThis.ResizeObserver=class{observe(){}};globalThis.document={fonts:{ready:Promise.resolve()}};
 try {const frame={getBoundingClientRect:()=>({width:100,height:80})},wrapper={offsetWidth:200,offsetHeight:400,style:{},dataset:{}};fitSkinPreview(frame,wrapper);assert.equal(wrapper.dataset.scale,String(Math.min(100*.88/200,80*.85/400,1.4)));assert.match(wrapper.style.transform,/translate\(-50%,-50%\) scale\(/)} finally {globalThis.ResizeObserver=prior;globalThis.document=priorDocument}
});
