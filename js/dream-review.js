/** Load a private gallery-review preview from a fragment-only review link. */
export async function loadDreamReview(fragment,{fetcher=globalThis.fetch,location=globalThis.location,history=globalThis.history}={}){
 const params=new URLSearchParams(String(fragment||'').replace(/^#/,''));
 const id=params.get('dream'),key=params.get('k');
 if(!id&&!key)return null;
 try{
  if(!id||!key)return null;
  const response=await fetcher('/api/dream/review',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id,key})});
  const result=await response.json();
  if(!response.ok||!result.ok||!result.design?.instances?.some(part=>part.part===19))return null;
  return result;
 }finally{
  // The review key is needed only for this fetch; remove it from the address bar.
  history?.replaceState?.(null,'',`${location.pathname}${location.search}`);
 }
}
