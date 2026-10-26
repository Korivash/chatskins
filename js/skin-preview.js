import {resolveChannelRules,fillChannelTemplate} from './channels.js';

const fixtures=[
 {kind:'broadcaster',username:'Orbit',text:'Welcome, everyone!',badges:{broadcaster:'1'}},
 {kind:'mod',username:'Juniper',text:'Check the party list.',badges:{moderator:'1'}},
 {kind:'allCaps',username:'CapsLock',text:'THIS IS INCREDIBLE',badges:{}},
 {kind:'action',username:'Nova',text:'waves to the crew',badges:{},action:true},
 {kind:'mentionsChannel',username:'Moss',text:'hello @streamer, see you soon',badges:{}},
 {kind:'vip',username:'PixelPilot',text:'Good run, team!',badges:{vip:'1'}},
 {kind:'sub',username:'Starlight',text:'Ready for the next match?',badges:{subscriber:'1'}},
 {kind:'firstTime',username:'NewHere',text:'Hi, first visit today!',badges:{},firstMessage:true},
 {kind:'everyone',username:'LunaLoop',text:'Nice timing, everyone.',badges:{}},
].map((message,index)=>({...message,id:`skin-preview-${index}`,fake:true,login:message.username.toLowerCase()}));

export function buildSkinPreviewMessages(skin,limit=3){
 const settings=skin?.settings||{},channel=settings.channel||'streamer',rules=settings.channels;
 if(!rules?.enabled||!rules.rules?.length)return fixtures.slice(0,Math.max(2,limit));
 const selected=[],seen=new Set();
 for(const fixture of fixtures){
  const {rule,notice}=resolveChannelRules(fixture,settings),matchesFixture=fixture.kind==='firstTime'?!!notice:rule?.match===fixture.kind;
  if(!matchesFixture)continue;
  const signature=`${rule?.format||''}|${notice?.format||''}`;
  if(seen.has(signature))continue;
  seen.add(signature);selected.push({...fixture,previewChannel:channel,previewRule:rule?.match||'',previewNotice:notice?.match||''});
  if(selected.length>=Math.max(2,limit))break;
 }
 for(const fixture of fixtures){
  if(selected.length>=Math.max(2,limit))break;
  if(!selected.some(item=>item.kind===fixture.kind))selected.push({...fixture,previewChannel:channel});
 }
 return selected;
}

export function buildSkinCardModel(skin){
 return {id:skin.id,name:skin.name,tagline:skin.tagline||'',featured:!!skin.featured,previewElement:{tag:'div',className:'portrait-preview',messages:buildSkinPreviewMessages(skin,2)}};
}

export function createSkinMonitorPreview(initialSkinId,render,{timers=globalThis,demoDuration=4500}={}){
 let selectedId=initialSkinId,demoTimer=null;
 const select=id=>{selectedId=id;timers.clearTimeout(demoTimer);demoTimer=null;render(selectedId);return selectedId};
 const previewChatPlay=demoId=>{if(!demoId||demoId===selectedId)return false;timers.clearTimeout(demoTimer);render(demoId);demoTimer=timers.setTimeout(()=>{demoTimer=null;render(selectedId)},demoDuration);return true};
 return{select,previewChatPlay,get selectedId(){return selectedId},stop(){timers.clearTimeout(demoTimer);demoTimer=null}};
}

export function previewCanvasSize(skin,width=1280,height=720){
 // Keep the same native canvas as overlay.html. Previews zoom the resulting
 // panel as a picture instead of changing its layout dimensions.
 return{width,height};
}

export function marketingPreviewTransform(hostWidth,hostHeight,canvasWidth,canvasHeight,panelRect){
 const panelWidth=Math.max(1,Number(panelRect?.width)||1),panelHeight=Math.max(1,Number(panelRect?.height)||1);
 const scale=Math.min(hostWidth*.92/panelWidth,hostHeight*.8/panelHeight,1.4);
 return{scale,left:hostWidth/2-((Number(panelRect?.left)||0)+panelWidth/2)*scale,top:hostHeight/2-((Number(panelRect?.top)||0)+panelHeight/2)*scale,canvasWidth,canvasHeight};
}

export function fitSkinPreview(frame,wrapper){
 const fit=()=>{
  const box=frame.getBoundingClientRect(),panel=wrapper.querySelector('.skin-live-preview');
  if(!box.width||!box.height||!panel)return;
  // Put the native stage at the preview origin before measuring it. The frame
  // art is contained by the panel, so sizing from this full panel keeps it whole.
  wrapper.style.left='0';wrapper.style.top='0';
  wrapper.style.transform='none';
  const stageRect=wrapper.getBoundingClientRect(),panelRect=panel.getBoundingClientRect();
  const panelBox={left:panelRect.left-stageRect.left,top:panelRect.top-stageRect.top,width:panelRect.width,height:panelRect.height};
  const result=fitPreviewPanel(box.width,box.height,panelBox,{padding:.04,targetHeight:.92});
  wrapper.style.transformOrigin='top left';
  wrapper.style.transform=`translate(${result.left}px,${result.top}px) scale(${result.scale})`;
  wrapper.dataset.scale=String(result.scale);
 };
 fit();const observer=new ResizeObserver(fit);observer.observe(frame);document.fonts?.ready.then(fit);return fit;
}

/** Fit and center an outer panel box inside a marketing preview viewport. */
export function fitPreviewPanel(boxWidth,boxHeight,panel,{padding=.04,targetHeight=.92,maxScale=1.4}={}){
 const width=Math.max(1,Number(panel?.width)||1),height=Math.max(1,Number(panel?.height)||1);
 const left=Number(panel?.left)||0,top=Number(panel?.top)||0,padX=width*padding,padY=height*padding;
 const targetWidth=Math.max(1,boxWidth*(1-padding*2)),targetHeightPx=Math.max(1,boxHeight*targetHeight);
 const scale=Math.min(targetWidth/(width+padX*2),targetHeightPx/(height+padY*2),maxScale);
 const centerX=boxWidth/2,centerY=boxHeight/2;
 return{scale,left:centerX-(left+width/2)*scale,top:centerY-(top+height/2)*scale,width:width*scale,height:height*scale,
  bounds:{left:centerX-(width/2+padX)*scale,top:centerY-(height/2+padY)*scale,right:centerX+(width/2+padX)*scale,bottom:centerY+(height/2+padY)*scale}};
}

export function formatSkinPreviewLine(message,settings){
 const {rule,notice}=resolveChannelRules(message,settings||{});
 const line=rule?fillChannelTemplate(rule.format,message):`${message.username}: ${message.text}`;
 const arrival=notice?fillChannelTemplate(notice.format,{...message,text:''}):'';
 return {line,arrival,match:rule?.match||'default',notice:notice?.match||null};
}

export const skinPreviewFixtures=fixtures.map(({kind,...message})=>({...message,kind}));
