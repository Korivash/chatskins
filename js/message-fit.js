// Remove oldest rendered messages until the panel content fits its explicit cap.
// Frame and decoration layers are deliberately excluded from the removable set.
export function fitPanelMessages(panel, maxHeight) {
  const limit = Math.max(0, Number(maxHeight) || 0);
  const messages = () => [...panel.children].filter(child => child.classList?.contains('message'));
  const measurable = rows => rows.some(row => typeof row.getBoundingClientRect === 'function' && row.getBoundingClientRect().height > 0);
  const rowStackHeight = rows => {
    const style = typeof getComputedStyle === 'function' ? getComputedStyle(panel) : null;
    const gap = parseFloat(style?.rowGap || style?.gap) || 0;
    return rows.reduce((sum,row) => {
      const rect = row.getBoundingClientRect?.();
      const height = rect?.height || row.offsetHeight || 0;
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
    const hasMeasurements = measurable(rows);
    const over = hasMeasurements ? rowStackHeight(rows) > availableContent() : panel.scrollHeight > limit;
    if (!over) break;
    const oldest = rows[0];
    if (!oldest) break;
    if (rows.length === 1) {
      console.warn('Chat panel is shorter than its newest message; preserving that message.');
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
