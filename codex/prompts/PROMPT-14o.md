Round 14o: the plaque placement is much better (design/qa-14n-plaques.png: top crop of all 18 frames in overlay test mode, in skins.json Frames order, 6 per row). Remaining issues, seen by eye:

1. **Low contrast, though your contrast test passes:**
   - **mothlight:** pale gold text on a pale cream scroll
   - **royal-court:** cream on cream
   - **bunny-princess / crowned-kittens:** white text on a pink plaque
   - **tactical-gunmetal:** dark text on a dark gunmetal plate; "Your Channel" is basically invisible, only "LIVE CHAT" shows
   
   Your test must be comparing against the wrong color.
   - Compute contrast against the ACTUAL plaque pixels: sample the frame image inside the plaque rect (median luminance), or the `plaque.fill` you paint for covered plaques.
   - Compare against the title's real computed text color, including gradient end colors (use the darker/lighter stop that's worst).
   - Fix the colors: dark ink (#3a2410-ish with a light emboss) on cream/gold scrolls; deep berry pink (#8a1050) with a white outline on pink plaques; bright white/orange stencil on tactical.
2. **neon-kawaii-goth (row 2, #5):** the title renders in a dark bar near the BOTTOM of the crop instead of on the top-left neon "CHAT" box. Check which plaque rect is used for that shape (probably the square/wide entry got the tall one's rect or vice versa) and fix it.
3. **crescent-moon** (the in-window banner) is fine. Keep it.

**Test:** add a pixel-based contrast test that decodes each frame's plaque area (or uses a stored median plaque color computed at build time) and checks ≥ 4.5:1 for every frame.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
