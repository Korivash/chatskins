export const overlayTestMessages=Object.freeze([
 {id:'test-broadcaster',username:'ChannelHost',text:'Welcome everyone!',badges:{broadcaster:'1'},color:'#FFD166'},
 {id:'test-mod',username:'ModMira',text:'Keeping chat moving.',badges:{moderator:'1'},color:'#78D69B'},
 {id:'test-vip',username:'VipNova',text:'Great play!',badges:{vip:'1'},color:'#B994FF'},
 {id:'test-sub',username:'SubPixel',text:'Here for the whole stream.',badges:{subscriber:'1'},color:'#62C9FF'},
 {id:'test-first',username:'FirstVisit',text:'First time here, hi!',badges:{},firstMessage:true,color:'#FF9E77'},
 {id:'test-caps',username:'HypeSquad',text:'THIS IS AMAZING',badges:{},color:'#F28CBA'},
 {id:'test-action',username:'ActionAce',text:'waves to the party',badges:{},action:true,color:'#9BDD74'},
 {id:'test-mention',username:'ChannelPal',text:'hello @streamer, nice stream',badges:{},color:'#E6A1FF'},
 {id:'test-emote-only',username:'EmoteFan',text:'Kappa',emotes:{'25':[[0,4]]},badges:{},color:'#F0C36A'},
 {id:'test-long',username:'StoryTeller',text:'This longer sample checks wrapping, spacing, and the full frame at the edge of the overlay preview.',badges:{},color:'#80D8D0'}
].map(message=>Object.freeze({...message,fake:true,login:message.username.toLowerCase()})));
