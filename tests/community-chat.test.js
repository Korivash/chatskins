import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {connectChat} from '../js/chat.js';
import {createCommunityChat} from '../js/community-chat.js';
import {CLEAN} from '../js/settings.js';

const fixture=async name=>JSON.parse(await readFile(new URL(`./fixtures/${name}`,import.meta.url),'utf8'));

test('connectChat delivers ROOMSTATE room id to emote provider and new rendering uses its loaded map',async t=>{
 const channelFixture=await fixture('7tv-channel.json'),settings=structuredClone(CLEAN);
 settings.emotes={...settings.emotes,sevenTV:true,bttv:false,ffz:false};
 const requested=[],listeners={},rendered=[];
 let resolveLoaded;
 const loaded=new Promise(resolve=>resolveLoaded=resolve);
 const fetchImpl=async url=>{
  requested.push(url);
  const data=url.includes('/emote-sets/global')?{emotes:channelFixture.emote_set.emotes}:channelFixture;
  return{ok:true,status:200,json:async()=>data};
 };
 const chat=createCommunityChat({getSettings:()=>settings,fetchImpl,onUpdate:map=>{if(map.has('PartyTime'))resolveLoaded(map);},append:(root,message,currentSettings,map)=>{rendered.push(map);return{message,currentSettings,map};}});
 class FakeSocket{constructor(){this.sent=[]}addEventListener(type,fn){(listeners[type]??=[]).push(fn)}send(value){this.sent.push(value)}close(){}}
 const client=connectChat('room',()=>{},()=>{},{WebSocketImpl:FakeSocket,onRoomState:room=>chat.onRoomState(room)});
 t.after(()=>{client.disconnect();chat.stop()});
 listeners.open[0]();
 listeners.message[0]({data:'@room-id=98765 ROOMSTATE #room\r\n'});
 const map=await loaded;
 assert(requested.some(url=>url.includes('/users/twitch/98765')),'channel emote request uses the ROOMSTATE id');
 assert.equal(map.get('PartyTime').url,'https://cdn.7tv.app/emote/7-id/1x.webp');
 chat.add({}, {text:'PartyTime'});
 assert.equal(rendered.length,1);
 assert.equal(rendered[0].get('PartyTime').url,'https://cdn.7tv.app/emote/7-id/1x.webp');
});
