// Remove oldest rendered messages until the panel content fits its explicit cap.
// Frame and decoration layers are deliberately excluded from the removable set.
export function fitPanelMessages(panel, maxHeight) {
  const limit = Math.max(0, Number(maxHeight) || 0);
  const messages = () => [...panel.children].filter(child => child.classList?.contains('message'));
  let removed = 0;
  while (panel.scrollHeight > limit) {
    const oldest = messages()[0];
    if (!oldest) break;
    oldest.remove();
    removed++;
  }
  return removed;
}
