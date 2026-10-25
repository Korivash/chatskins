import test from 'node:test';
import assert from 'node:assert/strict';
import {CLEAN,encodeSettings,decodeSettings} from '../js/settings.js';
import {CHANNEL_RULE_ORDER,fillChannelTemplate,isAllCaps,matchesChannelRule,resolveChannelRules} from '../js/channels.js';
import {nextFakeMessage} from '../js/fakechat.js';

const rule=(match,format=`{name}: {message}`)=>({enabled:true,match,format,textColor:'#FFFFFF',nameColor:'#FFFFFF',italic:false});

test('channel rules use configured first-match order and first-time notices are independent',()=>{
 const settings=structuredClone(CLEAN);settings.channel='streamer';settings.channels={enabled:true,rules:[rule('mod','[Officer] {name}: {message}'),rule('allCaps','[{name}] yells: {message}'),rule('everyone')]};
 const result=resolveChannelRules({username:'Mod',text:'THIS IS ALL CAPS',badges:{moderator:'1'},firstMessage:true},settings);
 assert.deepEqual(CHANNEL_RULE_ORDER,['broadcaster','mod','allCaps','action','mentionsChannel','vip','sub','everyone']);
 assert.equal(result.rule.format,'[Officer] {name}: {message}');
 assert.equal(result.notice,null);
 settings.channels.rules.unshift(rule('firstTime','{name} has come online.'));
 assert.equal(resolveChannelRules({username:'Mod',text:'hello',badges:{moderator:'1'},firstMessage:true},settings).notice.match,'firstTime');
});

test('all-caps detection requires six letters and at least eighty percent uppercase',()=>{
 assert.equal(isAllCaps('HELLO!'),false);
 assert.equal(isAllCaps('HELLO THERE!!!'),true);
 assert.equal(isAllCaps('HELLO the world'),false);
 assert.equal(isAllCaps('HELLO WÖRLD'),true);
});

test('channel mentions match a name as a token, including the @ form',()=>{
 assert.equal(matchesChannelRule(rule('mentionsChannel'),{text:'@Streamer great run'},'streamer'),true);
 assert.equal(matchesChannelRule(rule('mentionsChannel'),{text:'upstreamer was here'},'streamer'),false);
});

test('channel templates substitute text tokens without interpreting markup',()=>{
 assert.equal(fillChannelTemplate('[{name}] says: {message} {badges}',{username:'<img src=x>',text:'<b>hi</b>',badges:{moderator:'1'}}),'[<img src=x>] says: <b>hi</b> ✦');
});

test('Test Chat cycles through every guild channel match',()=>{
 const messages=Array.from({length:9},()=>nextFakeMessage(()=>0,'room'));
 assert(messages.some(m=>m.badges.broadcaster));
 assert(messages.some(m=>m.badges.moderator));
 assert(messages.some(m=>m.badges.vip));
 assert(messages.some(m=>m.badges.subscriber));
 assert(messages.some(m=>isAllCaps(m.text)));
 assert(messages.some(m=>m.action));
 assert(messages.some(m=>m.text.includes('@room')));
 assert(messages.some(m=>m.firstMessage));
});

test('channel rules survive overlay URL encoding',()=>{
 const settings=structuredClone(CLEAN);settings.channel='streamer';settings.channels={enabled:true,rules:[rule('broadcaster','[Guild Master] [{name}]: {message}'),rule('action','{name} {message}') ]};
 assert.deepEqual(decodeSettings(encodeSettings(settings)).channels,settings.channels);
});
