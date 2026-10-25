Round 14r: the plaque titles are readable now (design/qa-14q-plaques.png), but they're CLIPPED at both ends: "OUR CHANNEL" on mothlight, "OUR CHANNE" on royal-court and sugar-static, "our Channe" on bunny-princess, crowned-kittens and tactical.

**Cause (most likely):** the title auto-fit measures before the frame's web font (Cinzel Decorative, Fredoka, Black Ops One, Bungee…) has loaded. It fits for the fallback font, then the wider real font overflows and gets clipped (centered + overflow hidden).

**Fix:**
- Re-run the title fit after `document.fonts.load()` for that exact family/size resolves (and after `document.fonts.ready`), plus on any later resize.
- The fit must shrink the font (down to 9 px), then letter-spacing, before anything is clipped.
- Measure with scrollWidth vs clientWidth on the title element itself. Never clip mid-letter. Use an ellipsis only at 9 px.
- Also reduce the default letter-spacing for the uppercase serif styles (Cinzel), since it's very wide.
- Same for the "LIVE CHAT" sub-label.
- **Test:** with a delayed font load (mock `document.fonts`), the title gets re-fit, and after the fit `scrollWidth <= clientWidth` for every frame.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
