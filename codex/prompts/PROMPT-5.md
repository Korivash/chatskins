Round 5 build. Read design/DESIGN.md (the "Round 5" section), design/skins.json and design/mockup.html, then the current code. Work only inside this folder. Same stack and rules: no dependencies, CSS keyframes only, chat text is never inserted as HTML, and old URLs keep working.

Build everything in the round 5 design:
1. **Skins:**
   - the new "Streamer favorites" skins
   - the polished existing skins
   - the gallery order with Featured first
2. **7TV / BTTV / FFZ emotes** with no login:
   - The channel id comes from the ROOMSTATE `room-id` tag.
   - Fetch the public channel + global sets (the URLs are in DESIGN.md), cache them in memory, refresh every 10 min.
   - Whole-word matching, a toggle per provider, text fallback on any error, bigger emotes for emote-only messages.
   - Images are built as elements with src set; never innerHTML.
3. **The 5 no-login features** chosen in DESIGN.md.
4. **The editor polish from DESIGN.md:**
   - human labels (never raw keys)
   - styled toggles, color swatches with alpha, sliders showing value + unit
   - grouped sub-rows
   - a sticky search box that doesn't cover the content
   - "reset section"
5. **Fix:** js/editor.js shows `Ã‚Â· Modified` (double-encoded UTF-8) again. Make it `· Modified`, and check every file for `Ã`/`Â` garbage. Save all files as UTF-8 without BOM.

6. **The "Fake chat" button must really run a fake chat** (owner request). Right now it only shows a few static lines. Make it a toggle:
   - **When on:** the editor preview gets a live stream of simulated messages, one every 0.5-2 s at a random pace with occasional bursts. Vary the content:
     - names and colors
     - broadcaster/mod/VIP/sub badges
     - Twitch emotes and 7TV-style emote words
     - short and long lines, a mention of the channel, an emote-only message
     - a first-time chatter
     - a deleted message (shows the removal animation)
   - **Pause button:** the user can stop it.
   - **Stays in the editor:** fake chat is preview-only. It's never written into the overlay URL, never shown in overlay.html, and never sent anywhere. We only ever READ Twitch chat; nothing is ever posted to Twitch.
   - **"Live channel" mode:** shows only real chat (fake messages stop).
   - **Test:** the encoded overlay URL settings contain no fake-chat flag.

Keep these working (the lead tests them with Playwright):
- `window.__chatskinsFitOk()`, `__chatskinsFrameOk()` and `__chatskinsStats()`
- Connect with Twitch
- the transparent background
- undo/redo
- My skins

## Tests
- Every skin in skins.json decodes.
- Every setting key has exactly one control, with a human label (no label equals its raw key).
- 7TV/BTTV/FFZ response parsing into a word→url map (with fixture JSON in tests/fixtures).
- Whole-word emote matching that never touches Twitch-native emote ranges.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
