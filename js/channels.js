export const CHANNEL_RULE_ORDER=['broadcaster','mod','allCaps','action','mentionsChannel','vip','sub','everyone'];

export function isAllCaps(text=''){
 const letters=[...String(text)].filter(char=>/\p{L}/u.test(char));
 if(letters.length<6)return false;
 const uppercase=letters.filter(char=>char===char.toLocaleUpperCase()&&char!==char.toLocaleLowerCase()).length;
 return uppercase/letters.length>=.8;
}

export function matchesChannelRule(rule,message,channel=''){
 const badges=message.badges||{};
 switch(rule.match){
  case'broadcaster':return !!badges.broadcaster;
  case'mod':return !!(badges.moderator||badges.mod);
  case'vip':return !!badges.vip;
  case'sub':return !!(badges.subscriber||badges.sub);
  case'firstTime':return !!message.firstMessage;
  case'allCaps':return isAllCaps(message.text);
  case'action':return !!message.action;
  case'mentionsChannel':{const target=String(channel||(message.fake?'streamer':''));if(!target)return false;const escaped=target.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return new RegExp(`(^|[^\\p{L}\\p{N}_])@?${escaped}(?=$|[^\\p{L}\\p{N}_])`,'iu').test(String(message.text||''));}
  case'everyone':return true;
  default:return false;
 }
}

export function resolveChannelRules(message,settings){
 const config=settings?.channels;
 if(!config?.enabled||!Array.isArray(config.rules))return{rule:null,notice:null};
 const rules=config.rules.filter(rule=>rule?.enabled!==false);
 const notice=rules.find(rule=>rule.match==='firstTime'&&matchesChannelRule(rule,message,settings.channel))||null;
 const rule=rules.find(rule=>rule.match!=='firstTime'&&matchesChannelRule(rule,message,settings.channel))||null;
 return{rule,notice};
}

export function fillChannelTemplate(template,message){
 const badges=Object.entries(message.badges||{}).filter(([,value])=>!!value).map(([key])=>({broadcaster:'★',moderator:'✦',mod:'✦',vip:'◆',subscriber:'●',sub:'●'}[key]||'')).join('');
 return String(template||'').replace(/\{(name|message|badges)\}/g,(_,token)=>token==='name'?String(message.username||''):token==='message'?String(message.text||''):badges);
}
