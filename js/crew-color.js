export const CREW_COLORS=Object.freeze(["#C94949","#3978BF","#38834E","#9960B4","#BD7323","#438D91"]);
export function crewColorFromName(name=''){const bytes=new TextEncoder().encode(String(name||'').trim().toLowerCase());let hash=0x811c9dc5;for(const byte of bytes)hash=Math.imul(hash^byte,0x01000193)>>>0;return CREW_COLORS[hash%CREW_COLORS.length]}
