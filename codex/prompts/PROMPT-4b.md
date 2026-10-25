Round 4b: the framed panel still runs off screen. The lead measured it in Chromium. Fix exactly this, then the small items below. Work only inside this folder.

## Measured (overlay.html, Guild Chat, viewport 1440x900, live chat after 20 s)
- `.overlay-root`: fixed, 0..900, overflow hidden. Fine.
- `#chat`: **position: relative; top: -20px; bottom: 20px; height: 860px; overflow: visible**, so its box is -17..843.
  - `bottom: 20px` on a RELATIVE element moves it UP by 20 px. That's why the top gold border is cut off.
  - Its height is always the full 860 px, even with few messages, which leaves a big empty framed box.
- `window.__chatskinsFitOk()` returns false.

The editor shows the same thing: the panel runs past the bottom of the stage after "Burst 10" ×3.

## Fix
- **Position:** put the chat panel ABSOLUTE inside the overlay root and the editor stage, using the edge inset. With "new at bottom", use `bottom: inset`; with "new at top", use `top: inset`. Plus `left`/`right` by alignment.
- **Panel size:**
  - height `auto`, fitting its messages
  - `max-height` = viewport/stage height − 2 × inset − outer-frame space (offset + width) − ornament overflow
  - `overflow: hidden`
- **Fit logic:** keep it. After each insert it removes the oldest messages while `scrollHeight > clientHeight` of the panel, so the panel hugs its content and never goes past max-height.
- **Editor stage:** use exactly the same code path as the overlay (scaled), so the preview matches OBS.
- **`__chatskinsFitOk()`** must return true in both cases.

## Small items
1. In the "Burst 10" test messages the emoji shows as "?" (an encoding problem). Use real emoji, or remove them.
2. Make setup foolproof (owner: "people aren't very smart setting this up"):
   - Show three numbered steps at the bottom of the left panel: **1 Pick a skin → 2 Your Twitch name → 3 Copy overlay URL**.
   - The channel box gets a big label and the placeholder "your Twitch name".
   - The value is cleaned: strip `@`, spaces, `twitch.tv/` and URLs down to the name; lowercase it.
   - The Copy button explains what's missing when it's disabled.
   - After copying, show a short "Paste this into OBS > Sources > Browser" hint.
3. Add a tests/fit-layout check: a pure function that computes the panel max-height from the viewport, inset and frame sizes.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
