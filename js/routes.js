/** Return an editor URL for legacy root links while retaining the exact hash. */
export function legacyRootForwardUrl({pathname='/',search='',hash=''}={}) {
  if (pathname !== '/' && pathname !== '/index.html') return null;
  if (!hash) return null;
  return `/editor.html${search || ''}${hash}`;
}

export function forwardLegacyRoot(location=globalThis.location) {
  const target=legacyRootForwardUrl(location);
  if (target) location.replace(target);
  return target;
}
