// Shared Studio composition rendering for the editor preview and OBS overlay.
import {studioRenderModel,studioPartRect,syncStudioLayer,hasStudioDesign} from './frame-studio.js';

// Keep fetch promises shared, then clone the validated SVG template for each part.
const svgTextCache=new Map();
const svgNodeCache=new Map();

/** Convert the Studio chat-window part into pixel insets for the chat panel. */
export function studioWindowInsets(draft,width,height){
 const part=draft?.instances?.find(item=>item.part===19);
 if(!part)return{top:0,right:0,bottom:0,left:0};
 return{
  top:height*part.y/100,
  right:width*(100-part.x-part.w)/100,
  bottom:height*(100-part.y-part.h)/100,
  left:width*part.x/100
 };
}

/** Fetch and validate once; warm paints do not yield between part appends. */
function partTemplate(item,fetcher,assetBase){
 const cached=svgNodeCache.get(item.file);
 if(cached)return cached;
 let pending=svgTextCache.get(item.file);
 if(!pending){
  pending=(async()=>{
   const response=await fetcher(assetBase+item.file);
   if(!response.ok)throw Error('Studio part could not be loaded.');
   const source=await response.text();
   const svg=new DOMParser().parseFromString(source,'image/svg+xml').documentElement;
   if(svg.localName!=='svg'||svg.querySelector('script,foreignObject,[href],[xlink\\:href]')){
    throw Error('Studio part contains unsupported markup.');
   }
   svgNodeCache.set(item.file,svg);
   return svg;
  })();
  svgTextCache.set(item.file,pending);
  pending.catch(()=>svgTextCache.delete(item.file));
 }
 return pending;
}

/** Replace the composition while leaving untouched skins' own layout intact. */
export async function mountStudioComposition({
 root,draft,fetcher=fetch,assetBase='site-media/parts/',channel='',
 document:doc=globalThis.document
}={}){
 root._studioCancel?.();
 root._studioSync=null;
 root._studioPaint=null;
 root.parentElement?.querySelector(':scope > .studio-composition')?.remove();
 const hadStudio=root.dataset.studioDesign==='true';
 root.removeAttribute('data-studio-design');
 if(hadStudio){
  for(const property of ['z-index','padding','box-sizing','background','gap',
   '--studio-pad-top','--studio-pad-right','--studio-pad-bottom','--studio-pad-left']){
   root.style.removeProperty(property);
  }
  root._applyFrameWindow?.();
 }
 if(!hasStudioDesign(draft)||draft.version!==1||!Array.isArray(draft.instances))return null;
 const windowPart=draft.instances.find(part=>part.part===19);
 const host=root.parentElement;
 if(!windowPart||!host)return null;

 const layer=doc.createElement('div');
 layer.className='studio-composition';
 layer.dataset.reduceMotion=String(!draft.motion||root.dataset.reduceMotion==='true');
 layer.setAttribute('aria-hidden','true');
 let generation=0;
 root._studioCancel=()=>{generation++};

 const paint=async()=>{
  const mine=++generation;
  const panel={x:0,y:0,w:root.offsetWidth,h:root.offsetHeight};
  if(panel.w<=0||panel.h<=0)return;
  syncStudioLayer(root,layer);
  const model=studioRenderModel(draft,panel);
  const inner=model.window;
  const insets=studioWindowInsets(draft,panel.w,panel.h);
  for(const side of ['top','right','bottom','left']){
   root.style.setProperty('--studio-pad-'+side,insets[side]+'px');
  }
  layer.replaceChildren();
  const surface=doc.createElement('div');
  surface.className='studio-window-surface';
  Object.assign(surface.style,{
   left:inner.x+'px',top:inner.y+'px',width:inner.width+'px',height:inner.height+'px'
  });
  layer.append(surface);

  for(const part of draft.instances){
   if(part.part===19||part.part===60)continue;
   const placed=studioPartRect(part,windowPart);
   const wrapper=doc.createElement('div');
   wrapper.className='studio-art studio-part-'+part.part;
   if(part.part<=10)wrapper.classList.add('studio-border-rail',part.w<part.h?'vertical':'horizontal');
   Object.assign(wrapper.style,{
    left:placed.x/100*panel.w+'px',top:placed.y/100*panel.h+'px',
    width:placed.w/100*panel.w+'px',height:placed.h/100*panel.h+'px',
    transform:`rotate(${part.angle}deg) scale(${part.flipX?-1:1},${part.flipY?-1:1})`
   });
   wrapper.style.setProperty('--c1',draft.palette[part.colors?.[0]]||'#B7AAFF');
   wrapper.style.setProperty('--c2',draft.palette[part.colors?.[1]]||'#EDF3FC');
   wrapper.style.setProperty('--glow',draft.palette[part.colors?.[2]]||'#A8D9EE');
   const item=globalThis.window?.__studioParts?.find(entry=>entry.id===part.part);
   if(item){
    try{
     const template=partTemplate(item,fetcher,assetBase);
     const svg=template instanceof Promise?await template:template;
     // A resize or a newer mount owns the layer after any asynchronous load.
     if(mine!==generation)return;
     const imported=doc.importNode(svg,true);
     if(part.part<=10){
      imported.setAttribute('viewBox','24 0 72 24');
      imported.setAttribute('preserveAspectRatio','none');
      if(part.w<part.h)imported.classList.add('studio-border-svg-vertical');
     }
     wrapper.append(imported);
    }catch{continue}
   }
   if(part.part>=29&&part.part<=36){
    const title=doc.createElement('span');
    title.className='studio-render-plaque';
    title.textContent=draft.name||channel||'';
    const plaque=root.querySelector('.template-plaque-title,.template-plaque');
    if(plaque){
     const style=getComputedStyle(plaque);
     title.style.fontFamily=style.fontFamily;
     title.style.color=style.color;
     title.style.textShadow=style.textShadow;
    }
    wrapper.append(title);
   }
   if(mine!==generation)return;
   layer.append(wrapper);
  }
 };

 host.append(layer);
 root._studioSync=()=>syncStudioLayer(root,layer);
 root._studioSync();
 root.dataset.studioDesign='true';
 root.style.zIndex='3';
 root.style.background='transparent';
 root.style.setProperty('box-sizing','border-box');
 root.style.setProperty('padding','var(--studio-pad-top,0px) var(--studio-pad-right,0px) var(--studio-pad-bottom,0px) var(--studio-pad-left,0px)');
 root.style.setProperty('gap','var(--gap)');
 if(!root._studioResize){
  root._studioResize=new ResizeObserver(()=>requestAnimationFrame(()=>root._studioPaint?.()));
  root._studioResize.observe(root);
 }
 root._studioPaint=paint;
 await paint();
 return{layer,paint};
}
