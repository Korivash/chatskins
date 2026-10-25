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
  panel.style.setProperty('--width', `${settings.overlayWidth}px`);
  panel.style.setProperty('--panel-max-height', `${available}px`);
  panel.style.maxHeight = `${available}px`;
  return available;
}
