Round 14b: fixes for the frame templates, measured by the lead in Chromium (`overlay.html?test=1&skin=<frame id>` at 1280x720). See design/qa-14-frames.png (all 18 frames).

1. **Crescent Moon draws nothing:** its mask-image resolves to `http://127.0.0.1:8811/css/site-media/...`. The path is relative to the CSS file. Use a URL relative to the page (e.g. set it in JS as `url("${new URL(file, location.href)}")`), or `../site-media/`. Check every frame URL the same way: overlay, editor preview and skins.html cards.
2. **Cozy Café is broken:** its inner-window detection is wrong. The message box is 34 px wide and 2,726 px tall, and the frame doesn't show. Make inner-window detection robust:
   - Find the largest transparent rectangle around the center: scan from the center outward on the alpha channel, threshold alpha < 24, ignore isolated specks.
   - Clamp it to 40–90% of the frame, and fall back to a 12% inset if detection fails.
   - Log nothing in the overlay.
3. **Frames are drawn too small, and only 1 message fits:**
   - The chat panel is 480x680, but the frame art renders noticeably smaller inside it. `fitRemoved` is 7 of 8, with a 22 px font.
   - The frame must fill the panel (contain, centered, with the largest size that fits). The chat window must use the frame's full inner window.
   - **Defaults for template skins:** font 16–17 px, tight spacing, and max messages tuned so 6–9 sample messages fit in a tall frame at 720p.
   - **Default panel for templates:** height = 92% of the canvas and width from the frame's aspect, so a tall frame is about 450x660 at 720p.
4. **The overlay requests `/undefined`** (an `<img>` with an undefined src) on every template skin. Find it (likely a plaque/mascot/accent image) and never create an image without a valid src. Add a test that no rendered src/href is "undefined" for every skin.
5. **Plaque text cuts off ("YOUR CHANN…") on the Neon Kawaii Goth plaques:** auto-shrink the title to fit the plaque (min 10 px) before any ellipsis. The "LIVE CHAT" sub-label is optional when there's no room.
6. **Wording:** never use the word "Premium" anywhere (the owner says it sounds paid; everything is free). Category "Frames", tags "Hand-painted" / "Animated". Add a test that "premium" doesn't appear in html/js/json.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
