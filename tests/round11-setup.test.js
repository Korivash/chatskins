import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {defaultChatPlay,decodePlaySource,parseChatPlayFragment} from '../js/chat-play.js';
import {isCreateRewardsReturn,runInitialRewardSetup} from '../js/chat-play-points.js';
import {alertDefaults,parseAlertsFragment} from '../js/alerts-config.js';
import {combinedSetupScopes,buildUnifiedOverlayUrl,decodeUnifiedOverlayFragment,prepareGuidedSetup,guidedReturnResult,guidedFeatureStatus} from '../js/guided-setup.js';
import {CLEAN} from '../js/settings.js';

const skins=(await readFile(new URL('../design/skins.json',import.meta.url),'utf8')).trim();
const catalog=JSON.parse(skins).skins;

test('combined login requests only permissions for enabled features',()=>{
 const alerts=alertDefaults({});
 assert.deepEqual(combinedSetupScopes({pointsOn:false,alertsOn:false,alerts}),[]);
 assert.deepEqual(combinedSetupScopes({pointsOn:true,alertsOn:false,alerts}).sort(),['channel:manage:redemptions','channel:read:redemptions']);
 const selected={...alerts,types:{...alerts.types,sub:{...alerts.types.sub,enabled:false},resub:{...alerts.types.resub,enabled:false},giftSub:{...alerts.types.giftSub,enabled:false},cheer:{...alerts.types.cheer,enabled:false},redemption:{...alerts.types.redemption,enabled:false}}};
 assert.deepEqual(combinedSetupScopes({pointsOn:false,alertsOn:true,alerts:selected}),['moderator:read:followers']);
});

test('setup turns on commands, alerts and enabled reward creation without changing selections',()=>{
 const setup=prepareGuidedSetup({chatPlay:defaultChatPlay(),alerts:alertDefaults({}),channel:' MossLive '});
 assert.equal(setup.chatPlay.enabled,true);assert.equal(setup.chatPlay.commands.enabled,true);assert.equal(setup.chatPlay.points.enabled,true);assert.equal(setup.chatPlay.points.createDisabled,false);assert.equal(setup.alerts.enabled,true);assert.equal(setup.channel,'mosslive');
 const notAffiliate=guidedReturnResult({login:'mosslive',rewardResult:{ok:false,error:'Channel-point rewards need an Affiliate or Partner channel.'}});
 assert.equal(notAffiliate.chatCommands,'Ready');assert.equal(notAffiliate.alerts,'Ready');assert.equal(notAffiliate.points,'Problem');
});

test('the return creates rewards only when Channel points was switched on',async()=>{
 let calls=0;const base={handled:true,token:'private',action:'round11-setup'};
 assert.equal(isCreateRewardsReturn({...base,createRewards:false}),false);
 assert.equal(await runInitialRewardSetup({...base,createRewards:false},()=>calls++),null);
 assert.equal(isCreateRewardsReturn({...base,createRewards:true}),true);
 assert.equal(await runInitialRewardSetup({...base,createRewards:true},()=>++calls),1);
 assert.equal(calls,1);
});

test('one private link decodes to chat, play and alerts; legacy links still parse',()=>{
 const play=defaultChatPlay();play.enabled=true;play.points.enabled=true;
 const alerts=alertDefaults({});alerts.enabled=true;const url=buildUnifiedOverlayUrl('https://getchatskins.com/editor.html',{token:'private-test-value',chatSettings:{...CLEAN,channel:'mosslive'},chatPlay:play,allowedSkins:catalog.slice(0,4),baseSkinId:catalog[0].id,alerts,recipe:{},design:{}});
 const parsed=new URL(url),combined=decodeUnifiedOverlayFragment(parsed.hash,catalog,{});
 assert.ok(combined);assert.equal(combined.token,'private-test-value');assert.equal(combined.play.chatPlay.enabled,true);assert.equal(combined.alerts.alerts.enabled,true);assert.equal(parsed.searchParams.has('access_token'),false);
 const params=new URLSearchParams(parsed.hash.slice(1));assert.ok(parseChatPlayFragment(`#v=1&play=${params.get('play')}&access_token=x`,catalog));assert.ok(parseAlertsFragment(`#v=1&config=${params.get('config')}&access_token=x`,{}));
});

test('feature states use the promised plain labels and editor source avoids setup jargon',async()=>{
 assert.deepEqual(['Off','Ready','Problem','Needs Twitch login'],[guidedFeatureStatus({enabled:false}),guidedFeatureStatus({enabled:true}),guidedFeatureStatus({enabled:true,problem:true}),guidedFeatureStatus({enabled:true,configured:false})]);
 const html=await readFile(new URL('../editor.html',import.meta.url),'utf8');for(const word of ['scope','eventsub','oauth','token'])assert.equal(new RegExp(`\\b${word}\\b`,'i').test(html),false,word);
});
