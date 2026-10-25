import {panelMaxHeight} from './fit.js';

export function layoutPanel(host, panel, settings, viewportHeight = globalThis.innerHeight || 0) {
  const frame = settings.frame;
  const outer = frame.outer.enabled ? frame.outer.offset : 0;
  const ornaments = frame.target === 'panel' && frame.ornament.style !== 'none' ? Math.max(0, frame.ornament.size - frame.ornament.inset) : 0;
  const measuredHeight = Number(host.clientHeight) || Number(viewportHeight) || 0;
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
    if(panel.classList?.contains('has-frame-template')){
      panel.style.aspectRatio=String(aspect);
      panel.style.maxWidth='none';
    }
  } else {
    panel.style.setProperty('--width', `${settings.overlayWidth}px`);
    panel.style.width='';
    panel.style.aspectRatio='';
    panel.style.maxWidth='';
    panel.style.setProperty('--panel-max-height', `${available}px`);
    panel.style.maxHeight = `${available}px`;
    panel.style.height = '';
  }
  return panelLimit;
}
