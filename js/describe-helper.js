const COLOR_FIELDS=new Set(['textColor','nameColor','backgroundColor','frameColor','glowColor','middleColor']);

export function describeCurrentSettings(settings,skinId=''){
 const s=settings||{};
 return{skinId,settings:{fontFamily:s.fontFamily,fontSize:s.fontSize,fontWeight:s.fontWeight,textColor:s.textColor,nameColor:s.nameColor,nameColorMode:s.nameColorMode,backgroundColor:s.backgroundColor,backgroundOpacity:s.backgroundOpacity,backgroundScope:s.backgroundScope,backgroundType:s.middleBackground,frameColor:s.frameColor,glowColor:s.glowColor,glowStrength:s.glowStrength,glowMode:s.glowAnimation,middleBackground:s.middleBackground,middleColor:s.middleColor,middleOpacity:s.middleOpacity,titleText:s.templateTitle,entranceAnimation:s.animationIn,messageBorders:s.templateMessageBorders,maxMessages:s.maxMessages,messageLifetime:s.messageLifetime}}
}

export function describeSettingsPatch(values={}){
 const out={};for(const[key,value]of Object.entries(values)){
  if(value==null)continue;
  if(COLOR_FIELDS.has(key)){if(!/^#[\da-f]{6}$/i.test(value))continue;const hex=value.toUpperCase()+'FF';if(key==='textColor')out.parts={...out.parts,messageText:{paint:{mode:'solid',color:hex}}};else if(key==='nameColor')out.parts={...out.parts,name:{paint:{mode:'solid',color:hex}}};else if(key==='backgroundColor'){out.backgrounds={...out.backgrounds,message:{mode:'solid',color:hex},panel:{mode:'solid',color:hex}};out.transparentBackground=false}else if(key==='frameColor'){out.frameColor=value.toUpperCase();out.frame={paint:{mode:'solid',color:hex}}}else out[key]=value.toUpperCase();continue}
  if(key==='fontFamily'){out.fontFamily=value;out.parts={...out.parts,panel:{fontFamily:value},messageText:{fontFamily:value},name:{fontFamily:value}};out.templateFont=value;continue}
  if(key==='fontSize'){out.fontSize=value;out.parts={...out.parts,panel:{fontSize:value},messageText:{fontSize:value},name:{fontSize:value}};continue}
  if(key==='fontWeight'){out.fontWeight=value;out.parts={...out.parts,messageText:{fontWeight:value},name:{fontWeight:Math.max(value,600)}};continue}
  if(key==='backgroundOpacity'){out.backgroundOpacity=value;out.backgrounds={...out.backgrounds,message:{opacity:value},panel:{opacity:value}};out.middleOpacity=value;continue}
  if(key==='backgroundScope'){out.backgroundScope=value;out.frame={target:value};continue}
  if(key==='backgroundType'||key==='middleBackground'){out.middleBackground=value;continue}
  if(key==='glowMode'){out.glowAnimation=value;continue}
  if(key==='titleText'){out.templateTitle=value;continue}
  if(key==='entranceAnimation'){out.animationIn=value;continue}
  if(key==='messageBorders'){out.templateMessageBorders=value;continue}
  if(key==='nameColorMode'){out.nameColorMode=value;out.roleColorsEnabled=value==='role';continue}
  if(key==='middleImage'){out.middleImage=value;continue}
  if(['glowStrength','middleOpacity','middleColor','maxMessages','messageLifetime'].includes(key))out[key]=value;
 }
 if(out.backgrounds?.message&&out.backgroundScope==='panel')out.backgrounds.panel={...out.backgrounds.panel,...out.backgrounds.message};
 return out;
}

export function applyDescribeReply(reply,{skins,record=()=>{},selectSkin=()=>{},applySettings=()=>{}}={}){
 const skin=skins.find(item=>item.id===reply?.skinId);if(!skin||typeof reply.summary!=='string'||!reply.settings||typeof reply.settings!=='object')throw new Error('The style helper returned a result that could not be used.');
 record();selectSkin(skin);applySettings(describeSettingsPatch(reply.settings));return{skinId:skin.id,summary:reply.summary};
}

export function describeFailureMessage(status,payload){
 if(typeof payload?.message==='string'&&payload.message.trim())return payload.message;
 if(status===429)return'The style helper is busy for now. Try again later, or use the Make it mine guide.';
 return'The style helper is unavailable right now. You can use the Make it mine guide instead.';
}
