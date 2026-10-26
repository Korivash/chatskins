/**
 * Browser module routes.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: legacyRootForwardUrl, forwardLegacyRoot.
 * Invariant: preserve existing settings links and render chat content as text.
 */
/** Return an editor URL for legacy root links while retaining the exact hash. */
export function legacyRootForwardUrl({pathname='/',search='',hash=''}={}) {
  if (pathname !== '/' && pathname !== '/index.html') return null;
  
  if (!hash) return null;
  
  return `/editor.html${search || ''}${hash}`;
  
}

/** forward legacy root.
 * @param {unknown} location Function input.
 * @returns {unknown} The function result.
 */
export function forwardLegacyRoot(location=globalThis.location) {
  const target=legacyRootForwardUrl(location);
  
  if (target) location.replace(target);
  
  return target;
  
}
