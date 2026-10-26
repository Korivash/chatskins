/**
 * Browser module fakechat.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: nextFakeMessage, nextFakeDelay.
 * Invariant: preserve existing settings links and render chat content as text.
 */
export const samples=[{username:'Moss',text:'Room for one more?',color:'#70C7FF',badges:{}},{username:'Juniper',text:'Welcome in. Make yourself at home.',color:'#D58AFF',badges:{moderator:'1'}},{username:'Orbit',text:'This is my favorite part.',color:'#FF8B75',badges:{subscriber:'1'}},{username:'Pebble',text:'We made it! \u{1F44B} \u{2728}',color:'#71D6A0',badges:{}},{system:true,text:'You joined the conversation.'}];

const people=[['Moss','#70C7FF',{}],['Juniper','#D58AFF',{moderator:'1'}],['Orbit','#FF8B75',{subscriber:'1'}],['PixelPilot','#F7A36D',{vip:'1'}],['LunaLoop','#92D7B0',{}],['ChatChampion','#F4D38D',{broadcaster:'1'}],['NewHere_42','#A9CAFF',{}],['Starlight','#E5A9FF',{subscriber:'1'}],['SpeedrunSam','#80E0E8',{moderator:'1'}]];

const lines=['gg that was close','Kappa that timing \u{1F602}','I cannot believe we got that on the last try','Moss this is your moment!','FeelsAmazing','PartyTime PogChamp','the soundtrack is so good, this area has such a different mood','first time here, loving the stream','Nice save! Kappa','LUL','hello everyone \u{1F44B}','that boss pattern took me a while to learn'];

let scenario=0;

/** Handle fake message.
 * @param {unknown} random Function input.
 * @param {unknown} channel Function input.
 * @returns {unknown} The function result.
 */
export function nextFakeMessage(random=Math.random,channel=''){
 const index=scenario++%9,[username,color,badges]=people[Math.floor(random()*people.length)];
  
 const samples=[
  {username:'GuildGuide',color:'#F4D38D',badges:{broadcaster:'1'},text:'Welcome to the guild! Kappa',emotes:{25:[[22,26]]}},
  {username:'Juniper',color:'#D58AFF',badges:{moderator:'1'},text:'Officer check: catKISS'},
  {username:'PixelPilot',color:'#F7A36D',badges:{vip:'1'},text:'Party is ready, let us go!'},
  {username:'Orbit',color:'#FF8B75',badges:{subscriber:'1'},text:'Guild supplies are stocked.'},
  {username:'SpeedrunSam',color:'#80E0E8',badges:{},text:'THIS DUNGEON LOOKS INCREDIBLE'},
  {username:'LunaLoop',color:'#92D7B0',badges:{},text:'waves to everyone in the hall',action:true},
  {username:'Moss',color:'#70C7FF',badges:{},text:`@${channel||'streamer'} that was a great run`},
  {username:'NewHere_42',color:'#A9CAFF',badges:{},text:'first time here, happy to join!',firstMessage:true},
  {username:username,color,badges:{...badges},text:lines[Math.floor(random()*lines.length)]},
 ];
  
 const message={...samples[index],id:`fake-${Date.now()}-${Math.floor(random()*1e6)}`,fake:true};
  
 if(index===0)message.emotes={25:[[22,26]]};
  
 return message;
  
}
/** Handle fake delay.
 * @param {unknown} random Function input.
 * @returns {unknown} The function result.
 */
export function nextFakeDelay(random=Math.random){return 500+random()*1500;
  }
