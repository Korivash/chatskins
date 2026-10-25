Round 4d: three fixes found in the lead's Chromium test of 4c. Work only inside this folder. Same rules as before.

1. **The Guild Chat gold frame is gone again** (regression in 4c), in BOTH the editor preview and overlay.html: the panel shows its dark background but no gold double frame. The frame layer is `.chat-surface`, kept during message removal, but it isn't drawn (check its size, z-index, inset and the outer-frame CSS after the 4b/4c layout change).
   - Every skin's frame must show again, exactly as in design/DESIGN.md.
   - Check all 22 skins.
2. **The editor preview isn't scaled.** The stage says "1280 × 720 · Fit", but `.source` is 720 px tall at full size, so it runs past the stage and the newest messages are cut off at the bottom.
   - Scale `.source` with a transform so the whole 1280×720 canvas fits the stage. Recompute on resize.
   - The panel's `__chatskinsStats()` and `__chatskinsFitOk()` must use the stage's visible box.
3. **Garbled text:** js/editor.js line 11 has `' Ã‚Â· Modified'` (double-encoded UTF-8). It should be `' · Modified'`. Search every file for other `Ã`/`Â` garbage, save every file as UTF-8, and fix them all.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
