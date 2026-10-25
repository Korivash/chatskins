import test from 'node:test';
import assert from 'node:assert/strict';
import {authBannerModel,showAuthBanner,restoreEditorReturnTarget} from '../js/auth-banner.js';
import {finishTwitchAuth} from '../js/twitch-auth.js';
import {finishAlertsAuth} from '../js/alerts-auth.js';

function storage(seed={}) { const values=new Map(Object.entries(seed)); return {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)}; }
function node(tag='div') { return {tag,children:[],attrs:{},listeners:{},dataset:{},className:'',textContent:'',append(...items){this.children.push(...items)},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,fn){this.listeners[k]=fn},remove(){this.removed=true},focus(opts){this.focusOptions=opts},scrollIntoView(opts){this.scrollOptions=opts},matches(){return false}}; }
function fakeDocument() { const body=node('body'),target=node('section');target.id='alerts-section';return {body,documentElement:body,querySelector(sel){return sel==='#alerts-section'?target:null},createElement:tag=>node(tag),target}; }

test('Twitch success and failures produce explicit banner models',async()=>{
 const original=globalThis.location;globalThis.location={pathname:'/editor.html',search:'',hash:''};
 try {
  const successStore=storage({'chatskinsTwitchOAuthState':'ok'});
  const success=await finishTwitchAuth({hash:'#access_token=private&state=ok',sessionStorage:successStore,history:{replaceState(){}},fetchImpl:async url=>url.includes('/users')?{ok:true,json:async()=>({data:[{login:'moss'}]})}:{ok:true}});
  assert.deepEqual(authBannerModel(success),{status:'success',message:'Connected as moss. Your channel is filled in.',retry:false});
  const cancelled=await finishTwitchAuth({hash:'#error=access_denied&state=ok',sessionStorage:storage({'chatskinsTwitchOAuthState':'ok'}),history:{replaceState(){}},fetchImpl:async()=>({ok:true})});
  assert.match(authBannerModel(cancelled).message,/cancelled/i);
  const mismatch=await finishTwitchAuth({hash:'#access_token=private&state=wrong',sessionStorage:storage({'chatskinsTwitchOAuthState':'ok'}),history:{replaceState(){}},fetchImpl:async()=>({ok:true})});
  assert.match(authBannerModel(mismatch).message,/could not be verified/i);
  const failure=await finishTwitchAuth({hash:'#access_token=private&state=ok',sessionStorage:storage({'chatskinsTwitchOAuthState':'ok'}),history:{replaceState(){}},fetchImpl:async()=>({ok:false})});
  assert.equal(authBannerModel(failure).retry,true);
 } finally { globalThis.location=original; }
});

test('alerts and channel-points successes are visible, and alerts cancellation keeps its own message',async()=>{
 const history={replaceState(){}};
 const identity={handled:true,identity:{login:'moss'}};
 assert.equal(authBannerModel(identity,'alerts').message,'Alerts connected for moss.');
 assert.equal(authBannerModel({...identity,action:'connect-chat-play'},'alerts').message,'Channel points connected for moss.');
 const session=storage({'chatSkinsAlertsOAuthState':'expected','chatSkinsAlertsOAuthDraft':JSON.stringify({action:'connect-chat-play',channel:'moss'})});
 const cancelled=await finishAlertsAuth({hash:'#error=access_denied&state=expected',pathname:'/editor.html',search:'',sessionStorage:session,history,fetchImpl:async()=>({ok:true})});
 assert.match(authBannerModel(cancelled,'alerts').message,/cancelled/i);
 assert.equal(cancelled.action,'connect-chat-play');
});

test('banner is dismissible, gives errors a retry, and remains scheduled for at least eight seconds',()=>{
 const doc=fakeDocument();let delay=0,retried=0;
 const toast=showAuthBanner({document:doc,result:{handled:true,error:'State did not match.'},retry:()=>retried++,setTimer:(_fn,ms)=>delay=ms,duration:1});
 assert.equal(toast.attrs.role,'status');assert.equal(toast.children[0].textContent,'State did not match.');
 const [again,dismiss]=toast.children[1].children;assert.equal(again.textContent,'Try again');again.listeners.click();assert.equal(retried,1);assert.equal(delay,8000);dismiss.listeners.click();assert.equal(toast.removed,true);
});

test('editor return target scrolls into view and receives focus',()=>{
 const doc=fakeDocument();const restored=restoreEditorReturnTarget({document:doc,target:'#alerts-section'});
 assert.equal(restored,doc.target);assert.deepEqual(restored.scrollOptions,{behavior:'smooth',block:'center'});assert.deepEqual(restored.focusOptions,{preventScroll:true});assert.equal(restored.attrs.tabindex,'-1');
});
