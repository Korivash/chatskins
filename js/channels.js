/**
 * Browser module channels.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: isAllCaps, matchesChannelRule, resolveChannelRules, fillChannelTemplate.
 * Invariant: preserve existing settings links and render chat content as text.
 */
export const CHANNEL_RULE_ORDER=['broadcaster','mod','allCaps','action','mentionsChannel','vip','sub','everyone'];


/** is all caps.
 * @param {unknown} text Function input.
 * @returns {unknown} The function result.
 */
export function isAllCaps(text=''){
 const letters=[...String(text)].filter(char=>/\p{L}/u.test(char));
  
 if(letters.length<6)return false;
  
 const uppercase=letters.filter(char=>char===char.toLocaleUpperCase()&&char!==char.toLocaleLowerCase()).length;
  
 return uppercase/letters.length>=.8;
  
}

/** Handle channel rule.
 * @param {unknown} rule Function input.
 * @param {unknown} message Function input.
 * @param {unknown} channel Function input.
 * @returns {unknown} The function result.
 */
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
    
  case'mentionsChannel':{const target=String(channel||(message.fake?'streamer':''));
      if(!target)return false;
      const escaped=target.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      return new RegExp(`(^|[^\\p{L}\\p{N}_])@?${escaped}(?=$|[^\\p{L}\\p{N}_])`,'iu').test(String(message.text||''));
      }
  case'everyone':return true;
    
  default:return false;
    
 }
}

/** resolve channel rules.
 * @param {unknown} message Function input.
 * @param {unknown} settings Function input.
 * @returns {unknown} The function result.
 */
export function resolveChannelRules(message,settings){
 const config=settings?.channels;
  
 if(!config?.enabled||!Array.isArray(config.rules))return{rule:null,notice:null};
  
 const rules=config.rules.filter(rule=>rule?.enabled!==false);
  
 const notice=rules.find(rule=>rule.match==='firstTime'&&matchesChannelRule(rule,message,settings.channel))||null;
  
 const rule=rules.find(rule=>rule.match!=='firstTime'&&matchesChannelRule(rule,message,settings.channel))||null;
  
 return{rule,notice};
  
}

/** fill channel template.
 * @param {unknown} template Function input.
 * @param {unknown} message Function input.
 * @returns {unknown} The function result.
 */
export function fillChannelTemplate(template,message){
 const badges=Object.entries(message.badges||{}).filter(([,value])=>!!value).map(([key])=>({broadcaster:'★',moderator:'✦',mod:'✦',vip:'◆',subscriber:'●',sub:'●'}[key]||'')).join('');
  
 return String(template||'').replace(/([^\s])\{message\}/g,'$1 {message}').replace(/\{(name|message|badges)\}/g,(_,token)=>token==='name'?String(message.username||''):token==='message'?String(message.text||''):badges);
  
}
