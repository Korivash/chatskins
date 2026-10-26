/**
 * Browser module panel-layout.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: layoutPanel.
 * Invariant: preserve existing settings links and render chat content as text.
 */
import {panelMaxHeight} from './fit.js';


/** Handle panel.
 * @param {unknown} host Function input.
 * @param {unknown} panel Function input.
 * @param {unknown} settings Function input.
 * @param {unknown} viewportHeight Function input.
 * @returns {unknown} The function result.
 */
export function layoutPanel(host, panel, settings, viewportHeight = globalThis.innerHeight || 0) {
  const frame = settings.frame;
  
  const outer = frame.outer.enabled ? frame.outer.offset : 0;
  
  const ornaments = frame.target === 'panel' && frame.ornament.style !== 'none' ? Math.max(0, frame.ornament.size - frame.ornament.inset) : 0;
  
  const measuredHeight = Number(host.clientHeight) || Number(viewportHeight) || 0;
  
  const hostWidth=Number(host.clientWidth)||globalThis.innerWidth||1280;
  
  const placement=settings.placement?.panel;
  
  if(placement&&measuredHeight>0){
    const aspect=panel.classList?.contains('has-frame-template')?Number(panel.dataset.frameAspect):0;
    
    let width=Math.max(1,Math.min(hostWidth,placement.w*hostWidth)),height=Math.max(1,Math.min(measuredHeight,placement.h*measuredHeight));
    
    if(aspect>0){const scale=Math.min(width,height*aspect);
      width=scale;
      height=scale/aspect}
    const x=Math.max(0,Math.min(hostWidth-width,placement.x*hostWidth)),y=Math.max(0,Math.min(measuredHeight-height,placement.y*measuredHeight));
    
    host.dataset.direction=settings.direction;
    host.dataset.alignment=settings.alignment;
    
    panel.style.setProperty('--inset',`${settings.edgeInset}px`);
    panel.style.setProperty('--width',`${width}px`);
    panel.style.width=`${width}px`;
    panel.style.height=`${height}px`;
    panel.style.maxHeight=`${height}px`;
    panel.style.maxWidth='none';
    panel.style.aspectRatio=aspect>0?String(aspect):'';
    panel.style.setProperty('--panel-max-height',`${height}px`);
    panel.style.left=`${x}px`;
    panel.style.top=`${y}px`;
    panel.style.right='auto';
    panel.style.bottom='auto';
    panel.style.transform='none';
    return height;
    
  }
  const available = Math.max(120, panelMaxHeight(measuredHeight, settings.edgeInset, outer, frame.outer.enabled ? frame.outer.width : 0, ornaments));
  
  host.dataset.direction = settings.direction;
  
  host.dataset.alignment = settings.alignment;
  
  panel.style.setProperty('--inset', `${settings.edgeInset}px`);
  
  const aspect = panel.classList?.contains('has-frame-template') ? Number(panel.dataset.frameAspect) : 0;
  
  let panelLimit = available;
  
  if (Number.isFinite(aspect) && aspect > 0) {
    const hostWidth = Number(host.clientWidth) || globalThis.innerWidth || 1280;
    
    let height = Math.min(measuredHeight * .92, available);
    
    let width = Math.min(height * aspect, hostWidth * .92);
    
    height = Math.min(height, width / aspect);
    
    panelLimit = height;
    
    panel.style.setProperty('--width', `${width}px`);
    
    panel.style.width = `${width}px`;
    
    panel.style.height = `${height}px`;
    
    panel.style.maxHeight = `${height}px`;
    
    panel.style.setProperty('--panel-max-height', `${height}px`);
    
    panel.style.left='';
    panel.style.top='';
    panel.style.right='';
    panel.style.bottom='';
    panel.style.transform='';
    
    if(panel.classList?.contains('has-frame-template')){
      panel.style.aspectRatio=String(aspect);
      
      panel.style.maxWidth='none';
      
    }
  } else {
    panel.style.setProperty('--width', `${settings.overlayWidth}px`);
    
    panel.style.width='';
    
    panel.style.aspectRatio='';
    
    panel.style.maxWidth='';
    
    panel.style.left='';
    panel.style.top='';
    panel.style.right='';
    panel.style.bottom='';
    panel.style.transform='';
    
    panel.style.setProperty('--panel-max-height', `${available}px`);
    
    panel.style.maxHeight = `${available}px`;
    
    panel.style.height = '';
    
  }
  return panelLimit;
  
}
