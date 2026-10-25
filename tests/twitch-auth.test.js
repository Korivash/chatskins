import test from 'node:test';
import assert from 'node:assert/strict';
import {parseOAuthHash,checkOAuthState} from '../js/twitch-auth.js';

test('parses implicit grant hash fields',()=>assert.deepEqual(parseOAuthHash('#access_token=secret&state=abc'),{accessToken:'secret',state:'abc',error:''}));
test('requires a matching nonempty OAuth state',()=>{assert.equal(checkOAuthState('abc','abc'),true);assert.equal(checkOAuthState('abc','wrong'),false);assert.equal(checkOAuthState('',''),false)});
