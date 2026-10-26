/**
 * Browser module chat.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: module declarations.
 * Invariant: preserve existing settings links and render chat content as text.
 */
export {connectChat,createIRCClient,parseIRC,parseTags,unescapeTag} from './irc.js';

