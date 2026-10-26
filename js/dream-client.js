/**
 * Browser module dream-client.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: isDreamArtRequest, requestDream, selectPaintedDream, selectDreamParts, watchDreamPaint.
 * Invariant: preserve existing settings links and render chat content as text.
 */
import {isDesignArtRequest} from './design-intent.js';

/**
 * Browser helpers for the custom-design generator.
 * Keep request detection deterministic so styling-only requests still use the
 * lighter catalogue picker.
 */
export function isDreamArtRequest(value){
 return isDesignArtRequest(value);
}

/** Call the shared dream endpoint and normalize expected failures. */
export async function requestDream(fetcher,text,extra={}){
 const response=await fetcher('/api/dream',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text,...extra})});
  
 let payload={};
  try{payload=await response.json()}catch{}
 if(!response.ok||!payload.ok)throw Object.assign(new Error(payload.message||'Frame Studio could not create that design.'),{status:response.status,payload});
  
 if(!payload.design?.instances?.some(part=>part.part===19))throw new Error('The generated design has no chat window. Please try again.');
  
 return payload;
  
}

/** Select a ready painted variation and clear its parts placeholder.
 * @param {object} settings Current editor settings.
 * @param {string} dreamId Ready painted-frame identifier.
 * @returns {object} Settings with the painted frame selected.
 */
export function selectPaintedDream(settings,dreamId){
 return{...settings,templateFrame:'',studioDesign:null,dreamPaintId:String(dreamId||'')};
}

/** Restore the retained parts composition as the selected version.
 * @param {object} settings Current editor settings.
 * @param {object} design The retained editable Studio composition.
 * @returns {object} Settings with parts selected and painting cleared.
 */
export function selectDreamParts(settings,design){
 return{...settings,templateFrame:'',studioDesign:structuredClone(design),dreamPaintId:''};
}

/** Check whether the painted art should replace the Studio composition.
 * @param {object} settings Current editor settings.
 * @returns {boolean} True when a painted frame is selected.
 */
export function isPaintedDreamSelected(settings){
 return Boolean(settings?.dreamPaintId)&&!settings?.studioDesign;
}

/** Describe the painted-frame choice control from the state being rendered.
 * @param {object} settings Current editor settings.
 * @param {{id:string,designName:string,available:boolean}} option Paint option metadata.
 * @returns {{active:boolean,hidden:boolean,label:string,status:string|null}} Control state.
 */
export function dreamPaintControlState(settings,{id='',designName='',available=false}={}){
 const active=Boolean(id&&(settings?.dreamPaintId===id
  ||settings?.studioDesign?.name===designName));
 const painted=active&&settings?.dreamPaintId===id;
 return{
  active,
  hidden:!active||!available,
  label:painted?'Use parts version instead':'Use painted frame',
  status:!active?null:painted?'The painted frame is selected.':'Using the editable parts version.'
 };
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
      
   if(response.ok&&result.imageStatus==='ready'){onReady(result);
        return 'ready'}
   if(!response.ok||result.imageStatus==='unavailable'||result.imageStatus==='off'){onUnavailable(result);
        return result.imageStatus||'unavailable'}
  }catch{/* Retry a temporary connection issue while the job remains in flight. */}
 }
 onUnavailable({imageStatus:'unavailable'});
  return 'unavailable';
  
}
