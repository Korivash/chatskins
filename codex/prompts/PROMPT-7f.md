Round 7f: redo the skin-preview fix. Round 7e made it WORSE and the lead reverted it (commit e2b6f18 was reverted). See design/qa-7e-broken.png: every preview sample is shifted up-left and cut off ("iper : Check the", "]: Check the"), and `__chatskinsPreviewQA()` reported overflow:true for all 49 cards. The original problems are still shown in design/qa-skin-cards.png.

Do it like this (same goals as PROMPT-7e.md):
1. **Measuring wrapper:** render each card sample into an inner wrapper at its NATURAL size (no width constraints except the sample's own max-width of 420 px), positioned absolutely at left:50%/top:50% with `translate(-50%,-50%)`.
2. **Scale:** measure the wrapper (offsetWidth/offsetHeight, before scaling), then apply `scale(s)` where `s = min(boxW*0.88/w, boxH*0.85/h, 1.4)`. Use `transform-origin: center`, combined as `translate(-50%,-50%) scale(s)`. Recompute on resize and after `document.fonts.ready`.
3. **Font sizes:** choose the sample font-size so that `fontPx * s ≥ 11`. If needed, show fewer/shorter sample lines instead of shrinking below 11 px.
4. **Badges inline:** fix it in the shared css/skin-render.css (`.badges` inline-flex, vertical-align middle, no display:block), so it applies in overlay.html too.
5. **Battle Arena name:** min-width/ellipsis after ~14 chars.
6. **Card heights:** consistent; the tagline must not be clipped (2 lines max with ellipsis).
7. **`__chatskinsPreviewQA()`:** overflow = the scaled wrapper's bounding rect falls outside the preview box rect by > 1 px. Every card must pass.

Check the side monitor and the home demo use the same fit function.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
