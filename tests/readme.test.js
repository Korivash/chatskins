import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile(new URL('../readme.html',import.meta.url),'utf8');
const css=await readFile(new URL('../css/readme.css',import.meta.url),'utf8');

test('README uses the main Codex build session and its GitHub session log',()=>{
 assert.match(html,/<h3>The main Codex build thread\.<\/h3>/);
 assert.match(html,/resumed for every build round/);
 assert.match(html,/<code>01a1720e-8ef6-7b72-bdd6-008cece473d5<\/code>/);
 assert.match(html,/https:\/\/github\.com\/Korivash\/chatskins\/blob\/main\/docs\/CODEX-SESSIONS\.md/);
 assert.doesNotMatch(html,/01a171c3-2479-74f1-974d-5f7648ff9daf|first Luna build session/i);
});

test('README contains no infrastructure details',()=>{
 for(const pattern of [/\bvps\b/i,/\bpm2\b/i,/\biis\b/i,/\bwindows\b/i,/\bcloudflare\b/i,/\b127\.0\.0\.1\b/i,/\blocalhost\b/i,/\b(?:\d{1,3}\.){3}\d{1,3}\b/,/c:\\/i])assert.doesNotMatch(html,pattern,pattern.toString());
});

test('decorative tracks and hero orbits are clipped within their own containers',()=>{
 assert.match(css,/\.marquee\{[^}]*overflow:hidden/);
 assert.match(css,/#skin-wall\{[^}]*overflow:hidden/);
 assert.match(css,/\.hero\{overflow:clip\}/);
 assert.doesNotMatch(css,/body\{[^}]*overflow-x:clip/);
 assert.match(css,/\.orbit\{[^}]*inset:1% 2%/);
 const orbitInsets=[...css.matchAll(/\.orbit(?:-two)?\{[^}]*inset:([^;}]+)/g)].map(match=>match[1]);
 assert.ok(orbitInsets.length>=4);assert.ok(orbitInsets.every(value=>!/(?:^|\s)-/.test(value)),'orbit insets never extend outside their hero box');
 assert.match(css,/@media\(max-width:1000px\)/);assert.match(css,/@media\(max-width:700px\)/);
});
