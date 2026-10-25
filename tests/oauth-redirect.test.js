import test from 'node:test';
import assert from 'node:assert/strict';
import {buildTwitchAuthorizationUrl,getOAuthRedirectUri} from '../js/twitch-auth.js';
import {buildAlertsAuthorizationUrl} from '../js/alerts-auth.js';

test('Twitch authorize URL uses the current page origin as redirect URI',()=>{
 const location={origin:'https://preview.getchatskins.test'};
 assert.equal(getOAuthRedirectUri(location),'https://preview.getchatskins.test/');
 const url=new URL(buildTwitchAuthorizationUrl({state:'state-1',location}));
 assert.equal(url.searchParams.get('redirect_uri'),'https://preview.getchatskins.test/');
 assert.equal(url.searchParams.get('state'),'state-1');
});

test('alerts authorize URL uses the same origin helper',()=>{
 const location={origin:'https://branch.example.test'};
 const url=new URL(buildAlertsAuthorizationUrl({state:'state-2',scopes:['channel:read:redemptions'],location}));
 assert.equal(url.searchParams.get('redirect_uri'),'https://branch.example.test/');
 assert.equal(url.searchParams.get('scope'),'channel:read:redemptions');
});
