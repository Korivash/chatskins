/**
 * Browser module fit.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: fitMessageIndices, panelMaxHeight.
 * Invariant: preserve existing settings links and render chat content as text.
 */
// Keep the newest messages that fit. Heights are measured from the oldest edge
// toward the newest edge, in visual order.
/** fit message indices.
 * @param {unknown} heights Function input.
 * @param {unknown} availableHeight Function input.
 * @param {unknown} spacing Function input.
 * @param {unknown} direction Function input.
 * @param {unknown} panelExtras Function input.
 * @returns {unknown} The function result.
 */
export function fitMessageIndices(heights, availableHeight, spacing = 0, direction = 'bottom', panelExtras = 0) {
  const keep = new Set();
  
  let used = 0;
  
  // Rows are stored oldest to newest. The newest row is adjacent to either
  // stack edge; direction only changes where it is painted by the renderer.
  const indices = heights.map((_, i) => i).reverse();
  
  for (const i of indices) {
    const next = Math.max(0, Number(heights[i]) || 0) + (keep.size ? Math.max(0, spacing) : 0);
    
    if (used + next > Math.max(0, availableHeight - Math.max(0, Number(panelExtras) || 0))) break;
    
    keep.add(i);
     used += next;
    
  }
  return heights.map((_, i) => i).filter(i => keep.has(i));
  
}

/** Handle max height.
 * @param {unknown} viewportHeight Function input.
 * @param {unknown} inset Function input.
 * @param {unknown} frameOffset Function input.
 * @param {unknown} frameWidth Function input.
 * @param {unknown} ornamentOverflow Function input.
 * @returns {unknown} The function result.
 */
export function panelMaxHeight(viewportHeight, inset, frameOffset = 0, frameWidth = 0, ornamentOverflow = 0) {
  return Math.max(0, Number(viewportHeight || 0) - 2 * Math.max(0, Number(inset) || 0) - 2 * (Math.max(0, Number(frameOffset) || 0) + Math.max(0, Number(frameWidth) || 0)) - 2 * Math.max(0, Number(ornamentOverflow) || 0));
  
}
