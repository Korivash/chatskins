/**
 * Shared request routing for personal frame artwork.
 * Imported by the editor and the server-side Ask ChatSkins handler.
 * Main export: isDesignArtRequest.
 * Invariant: visual-design prompts use /api/dream; ordinary setting edits do not.
 */

/** Decide whether a prompt asks for new artwork instead of a catalog edit.
 * @param {unknown} value User prompt text.
 * @returns {boolean} True when the request should use the dream generator.
 */
export function isDesignArtRequest(value){
  const text=String(value||'').toLowerCase();
  const designTarget=/\b(?:frame|skin|border|overlay|look|design)\b/;
  const chatTarget=/\bchat\b/;
  const makeVerb=/\b(?:make|create|design|build|draw|paint|give me|i want|i need)\b/;
  const styleAdjustment=/\b(?:pink|purple|blue|green|red|orange|yellow|black|white|color|colour|bigger|smaller|large|small|font|text|size|glow|brighter|darker|readable|transparent)\b/;
  const artObject=/\b(?:ghosts?|cats?|bunn(?:y|ies)|rabbit|leaves|leaf|vines?|coffee|moons?|stars?|crowns?|flowers?|bats?|skulls?|spiders?|dragons?|swords?|hearts?|neon|sparkles?|mascot|stickers?|illustration|artwork|creature)\b/;

  return artObject.test(text)
    || (makeVerb.test(text)
      && (designTarget.test(text)
        || (chatTarget.test(text)&&!styleAdjustment.test(text))));
}
