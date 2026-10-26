/**
 * Browser module crew-color.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: crewColorFromName.
 * Invariant: preserve existing settings links and render chat content as text.
 */
export const CREW_COLORS=Object.freeze(["#C94949","#3978BF","#38834E","#9960B4","#BD7323","#438D91"]);

/** Handle color from name.
 * @param {unknown} name Function input.
 * @returns {unknown} The function result.
 */
export function crewColorFromName(name=''){const bytes=new TextEncoder().encode(String(name||'').trim().toLowerCase());
  let hash=0x811c9dc5;
  for(const byte of bytes)hash=Math.imul(hash^byte,0x01000193)>>>0;
  return CREW_COLORS[hash%CREW_COLORS.length]}
