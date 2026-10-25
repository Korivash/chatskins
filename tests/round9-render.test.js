import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolveChannelRules,fillChannelTemplate} from '../js/channels.js';

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
 assert.equal(catalog.skins.length,42);for(const skin of catalog.skins)for(const message of samples){const {rule}=resolveChannelRules(message,{...skin.settings,channel:'streamer'});const line=rule?fillChannelTemplate(rule.format,message):`${message.username}: ${message.text}`;assert.ok(line.endsWith(message.text),`${skin.id} lost message text`);const prefix=line.slice(0,-message.text.length);assert.match(prefix,/[\s:.,!?;)>\]}\-]$/u,`${skin.id}: ${line}`)}
});
