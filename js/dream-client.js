/**
 * Browser helpers for the custom-design generator.
 * Keep request detection deterministic so styling-only requests still use the
 * lighter catalogue picker.
 */
export function isDreamArtRequest(value){
 const text=String(value||'').toLowerCase();
 return /\b(?:with|add|include|draw|paint|put|make)\b.{0,35}\b(?:ghost|cat|vines?|flowers?|hearts?|skull|bat|spider|crown|mascot|sticker|illustration|artwork|creature|dragon|moon|stars?)\b|\b(?:ghost|cat|vines?|mascot|sticker)\s+(?:on|above|around|atop|in)\b/i.test(text);
}

/** Call the shared dream endpoint and normalize expected failures. */
export async function requestDream(fetcher,text,extra={}){
 const response=await fetcher('/api/dream',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text,...extra})});
 let payload={};try{payload=await response.json()}catch{}
 if(!response.ok||!payload.ok)throw Object.assign(new Error(payload.message||'Frame Studio could not create that design.'),{status:response.status,payload});
 if(!payload.design?.instances?.some(part=>part.part===19))throw new Error('The generated design has no chat window. Please try again.');
 return payload;
}

/** Poll the private painting job without putting its owner key in the URL. */
export async function watchDreamPaint(fetcher,dream,{interval=3000,timeout=180000,onReady=()=>{},onUnavailable=()=>{}}={}){
 if(!dream?.id||!dream?.key)return 'off';
 const end=Date.now()+timeout;
 while(Date.now()<end){
  await new Promise(resolve=>setTimeout(resolve,interval));
  try{
   const response=await fetcher('/api/dream/status',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:dream.id,key:dream.key})});
   const result=await response.json();
   if(response.ok&&result.imageStatus==='ready'){onReady(result);return 'ready'}
   if(!response.ok||result.imageStatus==='unavailable'||result.imageStatus==='off'){onUnavailable(result);return result.imageStatus||'unavailable'}
  }catch{/* Retry a temporary connection issue while the job remains in flight. */}
 }
 onUnavailable({imageStatus:'unavailable'});return 'unavailable';
}
