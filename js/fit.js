// Keep the newest messages that fit. Heights are measured from the oldest edge
// toward the newest edge, in visual order.
export function fitMessageIndices(heights, availableHeight, spacing = 0, direction = 'bottom') {
  const keep = new Set();
  let used = 0;
  // Rows are stored oldest to newest. The newest row is adjacent to either
  // stack edge; direction only changes where it is painted by the renderer.
  const indices = heights.map((_, i) => i).reverse();
  for (const i of indices) {
    const next = Math.max(0, Number(heights[i]) || 0) + (keep.size ? Math.max(0, spacing) : 0);
    if (used + next > Math.max(0, availableHeight)) break;
    keep.add(i); used += next;
  }
  return heights.map((_, i) => i).filter(i => keep.has(i));
}
