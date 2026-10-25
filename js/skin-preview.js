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

export function formatSkinPreviewLine(message,settings){
 const {rule,notice}=resolveChannelRules(message,settings||{});
 const line=rule?fillChannelTemplate(rule.format,message):`${message.username}: ${message.text}`;
 const arrival=notice?fillChannelTemplate(notice.format,{...message,text:''}):'';
 return {line,arrival,match:rule?.match||'default',notice:notice?.match||null};
}

export const skinPreviewFixtures=fixtures.map(({kind,...message})=>({...message,kind}));
