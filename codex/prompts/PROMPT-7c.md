Round 7c, CRITICAL: skins look right on the website but BROKEN in the OBS overlay (overlay.html). This is what streamers and judges actually see on stream. The lead tested the ChatSkins Signature skin (the flagship) on live chat in overlay.html at 1440x900:

- **The mod role icon renders as a giant black SVG shield** (~300 px tall) in the middle of the chat.
- **Every name shows TWICE**: a name chip ("roguejeezy:") AND the template text "roguejeezy: message".
- **Name chips use a fallback font** (Arial-like), not the skin font.
- **None of the Signature look shows**: no animated mint→violet border, no glow, no scanlines.

**Root cause** (verified): the skin rendering styles (role icons, Signature frame, crew colors, effects) live in `css/site-polish.css` (and round6c.css), which only the website pages load. `overlay.html` loads only `tokens.css` + `app.css`. Also the fonts the round 7a skins use (e.g. Chakra Petch, Barlow) aren't in app.css's Google Fonts import.

**Fix:**
1. Move EVERYTHING needed to render chat messages, frames, badges/role icons, channels and effects into ONE shared stylesheet, `css/skin-render.css`, used by overlay.html, the editor preview, the skins-page previews and the home demo. Keep site-only styles (nav, cards, layout) out of it. overlay.html must not load site styles.
2. SVG role icons always get an explicit size (1em) in that shared CSS, plus width/height attributes on the SVG itself, so they can never blow up.
3. **The name shows once.** When a skin uses name chips, the channel template must not repeat `{name}`; or render the chip as the {name} token itself. Fix every skin where the name ends up duplicated (check all 42).
4. Every font any skin uses is loaded in the overlay (one Google Fonts URL, built from the skins' font list).
5. Verify by rendering EVERY skin through overlay.html's real code path (not only the site pages):
   - Add `overlay.html?test=1` → a TEST-ONLY mode that renders a fixed fake message set (broadcaster, mod, vip, sub, first-time, caps, /me, mention, emote-only, long message) with the skin from the hash, and no IRC connection. It's for screenshots and judges.
   - It must not be reachable by mistake: only with `test=1`, never set by the editor's copy link.
   - Add a test that overlay.html's CSS list includes skin-render.css and that no SVG icon is missing size rules.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
