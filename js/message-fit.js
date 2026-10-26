// Remove oldest rendered messages until the panel content fits its explicit cap.
// Frame and decoration layers are deliberately excluded from the removable set.
const warnedPanels = new WeakSet();

// Only finite animations on the cards themselves gate fitting. Infinite glow
// effects and animations on decorations must never block the chat indefinitely.
export function pendingMessageAnimations(panel) {
  return [...panel.children].filter(row => row.classList?.contains('message'))
    .flatMap(row => row.getAnimations?.() || [])
    .filter(animation => (animation.playState === 'running' || animation.pending)
      && Number.isFinite(animation.effect?.getComputedTiming().endTime));
}

/** Fit only genuine overflow; DOM client dimensions round fractional pixels. */
export function fitPanelMessages(panel, maxHeight) {
  // Entrance keyframes can also animate layout properties; wait for final layout.
  if (pendingMessageAnimations(panel).length) return 0;
  const limit = Math.max(0, Number(maxHeight) || 0);
  const messages = () => [...panel.children].filter(child => child.classList?.contains('message'));
  const rowStackHeight = rows => {
    const style = typeof getComputedStyle === 'function' ? getComputedStyle(panel) : null;
    const gap = parseFloat(style?.rowGap || style?.gap) || 0;
    return rows.reduce((sum,row) => {
      // Rects and scrollHeight include rotated/scaled visual overflow. Neither
      // describes the space occupied by a card in the panel's flex layout.
      const height = Number(row.offsetHeight) || 0;
      const rowStyle = typeof getComputedStyle === 'function' ? getComputedStyle(row) : null;
      return sum + height + (parseFloat(rowStyle?.marginTop)||0) + (parseFloat(rowStyle?.marginBottom)||0);
    },0) + Math.max(0,rows.length-1)*gap;
  };
  const availableContent = () => {
    const client = Number(panel.clientHeight) || 0;
    if (!client) return limit;
    const style = typeof getComputedStyle === 'function' ? getComputedStyle(panel) : null;
    const padding = (parseFloat(style?.paddingTop)||0) + (parseFloat(style?.paddingBottom)||0);
    return Math.max(0,Math.min(limit,client)-padding);
  };
  let removed = 0;
  while (true) {
    const rows = messages();
    const over = rowStackHeight(rows) - availableContent() > 1;
    if (!over) break;
    const oldest = rows[0];
    if (!oldest) break;
    if (rows.length === 1) {
      if (!warnedPanels.has(panel)) {
        warnedPanels.add(panel);
        console.warn('Chat panel is shorter than its newest message; preserving that message.');
      }
      break;
    }
    const wasHeader=!oldest.classList.contains('grouped');
    const next=oldest.nextElementSibling;
    oldest.remove();
    if(wasHeader&&next?.classList.contains('grouped')){next.classList.remove('grouped');for(const selector of ['.chat-name','.chat-badges','.chat-initial']){const item=next.querySelector(selector);if(item)item.style.visibility='';}}
    removed++;
  }
  return removed;
}
