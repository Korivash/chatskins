import test from 'node:test';
import assert from 'node:assert/strict';
import {beginAlertsAuth} from '../js/alerts-auth.js';
import {finishAlertsAuth} from '../js/alerts-auth.js';
import {defaultChatPlay,normalizeChatPlay} from '../js/chat-play.js';
import {CHAT_PLAY_POINT_SCOPES,CHAT_PLAY_REWARD_DRAFTS,createRewardRequestBody,createChatPlayRewards,enableExistingChatPlayRewards,runInitialRewardSetup} from '../js/chat-play-points.js';
import {rewardSetupBannerModel,authBannerModel} from '../js/auth-banner.js';

function storage(){const data=new Map();return{getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,String(value)),values:data}}

test('combined channel-points authorization asks for read and manage scopes together',()=>{
 const sessionStorage=storage();let assigned='';
 beginAlertsAuth({channel:'moss',alerts:{},design:{},extraScopes:CHAT_PLAY_POINT_SCOPES,onlyExtraScopes:true,action:'create-chat-play-rewards',sessionStorage,location:{origin:'https://getchatskins.com',assign:url=>assigned=url},random:()=> 'state'});
 const url=new URL(assigned);
 assert.deepEqual(url.searchParams.get('scope').split(' ').sort(),[...CHAT_PLAY_POINT_SCOPES].sort());
 assert.equal(JSON.parse(sessionStorage.getItem('chatSkinsAlertsOAuthDraft')).action,'create-chat-play-rewards');
});

test('reward creation runs only after the matching OAuth return',async()=>{
 let runs=0;
 assert.equal(await runInitialRewardSetup({handled:true,token:'memory-only',action:'connect-chat-play'},()=>runs++),null);
 assert.equal(runs,0);
 assert.equal(await runInitialRewardSetup({handled:true,token:'memory-only',action:'create-chat-play-rewards'},()=>++runs),1);
 assert.equal(runs,1);
});

test('reward requests are enabled by default and disabled only by explicit opt-out',()=>{
 const draft=CHAT_PLAY_REWARD_DRAFTS[0];
 assert.equal(createRewardRequestBody(draft).is_enabled,true);
 assert.equal(createRewardRequestBody(draft,{enabled:false}).is_enabled,false);
 assert.equal(defaultChatPlay().points.createDisabled,false);
 assert.equal(normalizeChatPlay({...defaultChatPlay(),points:{...defaultChatPlay().points,createDisabled:true}}).points.createDisabled,true);
});

test('same-title rewards are reused and disabled ones can be turned on',async()=>{
 let patches=0,posts=0,patchBody=null;
 const existing={id:'old',title:'ChatSkins: Swap skin',is_enabled:false};
 const setup=await createChatPlayRewards({token:'private',broadcasterId:'42',rewards:[CHAT_PLAY_REWARD_DRAFTS[0]],fetchImpl:async(_url,options={})=>{
  if(options.method==='PATCH'){patches++;patchBody=JSON.parse(options.body);return{ok:true,status:200,json:async()=>({data:[{...existing,is_enabled:true}]})}}
  if(options.method==='POST'){posts++;return{ok:true,status:200,json:async()=>({data:[]})}}
  return{ok:true,status:200,json:async()=>({data:[existing]})};
 }});
 assert.equal(setup.ok,true);assert.equal(posts,0);assert.equal(setup.reused.length,1);assert.deepEqual(setup.disabledExisting.map(x=>x.title),[existing.title]);
 assert.equal(rewardSetupBannerModel(setup).action,'Turn them on');
 const enabled=await enableExistingChatPlayRewards({token:'private',broadcasterId:'42',rewards:setup.disabledExisting,fetchImpl:async(url,options)=>{patches++;assert.equal(new URL(url).searchParams.get('id'),'old');patchBody=JSON.parse(options.body);return{ok:true,status:200,json:async()=>({data:[{...existing,is_enabled:true}]})}}});
 assert.equal(enabled.ok,true);assert.equal(patchBody.is_enabled,true);assert.equal(patches,1);
});

test('reward limit is returned as a setup error',async()=>{
 const tooMany=await createChatPlayRewards({token:'private',broadcasterId:'42',rewards:[CHAT_PLAY_REWARD_DRAFTS[0]],fetchImpl:async()=>({ok:true,status:200,json:async()=>({data:Array.from({length:50},(_,i)=>({id:String(i),title:`Existing ${i}`,is_enabled:true}))})})});
 assert.match(tooMany.error,/50 custom rewards/);
 const banner=authBannerModel({handled:true,identity:{login:'moss'},action:'create-chat-play-rewards',rewardSetup:tooMany},'alerts');
 assert.equal(banner.status,'error');assert.equal(banner.message,tooMany.error);assert.equal(banner.retry,true);
});

test('Affiliate restriction and missing permission flow into their exact banner errors',async()=>{
 const denied=await createChatPlayRewards({token:'private',broadcasterId:'42',rewards:[CHAT_PLAY_REWARD_DRAFTS[0]],fetchImpl:async()=>({ok:false,status:403,json:async()=>({})})});
 assert.match(denied.error,/Affiliate or Partner/);
 assert.equal(rewardSetupBannerModel(denied).message,denied.error);
 const values=new Map([['chatSkinsAlertsOAuthState','state'],['chatSkinsAlertsOAuthDraft',JSON.stringify({channel:'moss',scopes:CHAT_PLAY_POINT_SCOPES,action:'create-chat-play-rewards'})]]);
 const result=await finishAlertsAuth({hash:'#access_token=private&state=state',pathname:'/editor.html',search:'',sessionStorage:{getItem:key=>values.get(key)||null,removeItem:key=>values.delete(key)},history:{replaceState(){}},fetchImpl:async url=>url.includes('/validate')?{ok:true,json:async()=>({client_id:'o35kfdkfee10jgi3i6szk98lsfcvf3',user_id:'42',login:'moss',scopes:['channel:read:redemptions'],expires_in:3600})}:{ok:true,status:200}});
 assert.match(result.error,/channel:manage:redemptions/);
 assert.equal(authBannerModel(result,'alerts').message,result.error);
});

test('auth banner reports successful setup and each channel-points error verbatim',()=>{
 const success=rewardSetupBannerModel({ok:true,created:[{title:'ChatSkins: Swap skin'},{title:'ChatSkins: Emote rain'}],reused:[],disabledExisting:[],requestedEnabled:true});
 assert.match(success.message,/2 rewards created and turned on: ChatSkins: Swap skin, ChatSkins: Emote rain/);
 for(const error of [
  'Twitch says channel-point rewards require an Affiliate or Partner channel and the channel:manage:redemptions permission.',
  'Permission for channel:manage:redemptions was not granted. Reconnect to enable it.',
  'Twitch allows at most 50 custom rewards. Remove a reward in Twitch before creating more.'
 ]){const model=authBannerModel({handled:true,identity:{login:'moss'},action:'create-chat-play-rewards',rewardSetup:{ok:false,error}},'alerts');assert.equal(model.message,error);assert.equal(model.retry,true)}
});
