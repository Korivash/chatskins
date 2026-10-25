import test from 'node:test';
import assert from 'node:assert/strict';
import {legacyRootForwardUrl} from '../js/routes.js';

test('legacy editor and OAuth hashes forward intact from root and index.html',()=>{
  const settings='#eyJiYXNlU2tpbklkIjoiY2xlYW4ifQ==';
  assert.equal(legacyRootForwardUrl({pathname:'/',hash:settings}),`/editor.html${settings}`);
  assert.equal(legacyRootForwardUrl({pathname:'/index.html',search:'?from=old',hash:'#access_token=secret&state=abc'}),'/editor.html?from=old#access_token=secret&state=abc');
  assert.equal(legacyRootForwardUrl({pathname:'/overlay.html',hash:settings}),null);
  assert.equal(legacyRootForwardUrl({pathname:'/',hash:''}),null);
});

test('home OAuth return preserves the complete implicit-grant fragment for editor.html',()=>{
  const oauthHash='#access_token=token-value%2Bpart&scope=bits%3Aread&state=state-123';
  assert.equal(legacyRootForwardUrl({pathname:'/',search:'?campaign=home',hash:oauthHash}),`/editor.html?campaign=home${oauthHash}`);
});
