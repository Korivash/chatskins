import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {resolveChannelRules,fillChannelTemplate} from '../js/channels.js';import {buildSkinCardModel} from '../js/skin-preview.js';
const data=JSON.parse(await readFile(new URL('../design/skins.json',import.meta.url),'utf8'));
const fixtures=[
 {kind:'broadcaster',username:'Orbit',text:'Welcome, everyone!',badges:{broadcaster:'1'}},
 {kind:'mod',username:'Juniper',text:'Check the party list.',badges:{moderator:'1'}},
 {kind:'vip',username:'PixelPilot',text:'Good run, team!',badges:{vip:'1'}},
 {kind:'sub',username:'Starlight',text:'Ready for the next match?',badges:{subscriber:'1'}},
 {kind:'firstTime',username:'NewHere',text:'Hi, first visit today!',badges:{},firstMessage:true},
 {kind:'allCaps',username:'CapsLock',text:'THIS IS INCREDIBLE',badges:{}},
 {kind:'action',username:'Nova',text:'waves to the crew',badges:{},action:true},
 {kind:'mentionsChannel',username:'Moss',text:'hello @streamer, see you soon',badges:{}},
 {kind:'everyone',username:'LunaLoop',text:'Nice timing, everyone.',badges:{}},
];
const expected={
 'chatskins-signature':['broadcaster','mod','vip','sub','everyone','everyone','action','mentionsChannel','everyone'],
 'crystal-realm':['broadcaster','mod','vip','sub','everyone','allCaps','action','mentionsChannel','everyone'],
 'old-school-mmo':['everyone','mod','everyone','everyone','everyone','allCaps','action','everyone','everyone'],
 'frontier-mmo':['broadcaster','mod','vip','sub','everyone','everyone','everyone','mentionsChannel','everyone'],
 'arena-league':['broadcaster','mod','vip','sub','everyone','everyone','everyone','everyone','everyone'],
 'tactical-ops':['everyone','mod','everyone','sub','everyone','everyone','everyone','everyone','everyone'],
 'block-server':['broadcaster','mod','everyone','sub','everyone','everyone','everyone','everyone','everyone'],
 'hero-quest':['broadcaster','mod','vip','sub','everyone','everyone','everyone','everyone','everyone'],
 'space-station':['everyone','mod','everyone','everyone','everyone','everyone','everyone','everyone','everyone'],
};
test('all 52 skins have concise player-facing taglines and two live-preview lines',()=>{assert.equal(data.skins.length,52);for(const skin of data.skins){assert.ok(skin.tagline,skin.id);assert.ok(skin.tagline.length<=60,skin.id);assert.ok(skin.tagline.trim().split(/\s+/).length<=8,skin.id);const card=buildSkinCardModel(skin);assert.equal(card.previewElement.tag,'div',skin.id);assert.equal(card.previewElement.className,'portrait-preview',skin.id);assert.equal(card.previewElement.messages.length,2,skin.id)}});
test('Round 7a channel fixtures resolve to each skin’s expected channel',()=>{for(const[id,matches]of Object.entries(expected)){const skin=data.skins.find(s=>s.id===id);assert.ok(skin,id);assert.equal(matches.length,fixtures.length);fixtures.forEach((message,index)=>{const{rule,notice}=resolveChannelRules({...message,fake:true},{...skin.settings,channel:'streamer'});assert.equal(rule?.match||'everyone',matches[index],id+': '+message.kind);if(message.kind==='firstTime')assert.equal(!!notice,['chatskins-signature','tactical-ops','block-server'].includes(id),id+' first-time notice')})}});
test('Round 7a templates produce the expected player-facing channel lines as text',()=>{const lines={'chatskins-signature':'HOST Orbit: Welcome, everyone!','crystal-realm':'[FC] <Orbit> Welcome, everyone!','old-school-mmo':'[Clan] Juniper: Check the party list.','frontier-mmo':'[Squad] Orbit: Welcome, everyone!','arena-league':'[Team] Orbit: Welcome, everyone!','tactical-ops':'(Admin) Juniper: Check the party list.','block-server':'[Owner] <Orbit> Welcome, everyone!','hero-quest':'[Leader] Orbit: Welcome, everyone!','space-station':'📣 meeting · Juniper: Check the party list.'};for(const[id,line]of Object.entries(lines)){const skin=data.skins.find(s=>s.id===id),message=id==='old-school-mmo'||id==='tactical-ops'||id==='space-station'?fixtures[1]:fixtures[0],{rule}=resolveChannelRules(message,{...skin.settings,channel:'streamer'});assert.equal(fillChannelTemplate(rule.format,message),line,id)}});
