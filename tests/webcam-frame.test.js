import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildWebcamFrameUrl} from '../js/frame-templates.js';
const overlay=fs.readFileSync('js/overlay.js','utf8'),css=fs.readFileSync('css/skin-render.css','utf8');
assert.match(overlay,/get\('webcam'\)/);assert.match(overlay,/kind:'webcam'/);assert.match(overlay,/applyChatStyle\(webcamRoot/);
assert.match(css,/webcam-frame-only[^}]*display:block/);assert.match(css,/webcam-frame-only>\.message[^}]*display:none/);
const url=new URL(buildWebcamFrameUrl('https://getchatskins.com/','bunny-princess',{frameColor:'#FFFFFF',frameTint:0,frameSaturation:1,glowColor:'#FFFFFF',glowStrength:.5,glowAnimation:'off',middleBackground:'none',middleColor:'#000000',middleImage:'',middleOpacity:.55,templateTitle:'',templateSubtitle:'LIVE CHAT',templateFont:'DM Sans',templateTextColor:'#FFFFFF',templateNameMode:'channel'}));
assert.equal(url.searchParams.get('webcam'),'bunny-princess');assert.equal(url.pathname,'/overlay.html');assert.doesNotMatch(url.hash,/message|chatText/i);
console.log('matching webcam link uses the overlay frame-only route');
