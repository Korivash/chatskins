Round 14t: the owner says the CHANNEL NAME isn't centered on its plaque on some frames: "bottom left and right need to be centered more" (see design/qa-14t-grid.jpg, the bottom row of the 18-frame grid: bunny-princess, crowned-kittens on the left; neon-hex on the right; check the others too).

Make the title truly centered on the VISIBLE plaque:
- Center the title text both horizontally and vertically within the plaque's inner rect (text-align center, flex centering), using the measured plaque rect, not the text box start.
- Where the plaque was widened (round 14n) or a cover fill is painted, center on the PLAQUE'S center (the original rect center), not the widened box's left edge.
- The sub-label is centered under the title.
- Add a per-frame `plaque.nudge {x,y}` (fractions) for fine optical centering, set for any frame whose plaque art is asymmetric (e.g. a scroll curl on one side).
- **Test:** for every frame, the title's rendered center is within 2% of the plaque rect's center (horizontally) at 1280x720.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.

**ALSO (14s did not fix it):** `frame-neon-kawaii-goth` in `overlay.html?test=1` at 1280x720 (design/qa-14t-kawaii.png) still has the chat text covering the left chain and heart column, and the right side runs past the frame's right border (text is cut off at the panel edge).
- Override its inner window by hand in frames.json (all shapes of neon-kawaii-goth, including `-minimal`) so the text column clears the chains: start ≥ 0.24 of the frame width from the left and end ≤ 0.82.
- Make sure the panel itself isn't wider than the frame art (the overlay panel width must follow the frame's aspect).
- **Verify:** no .message rect crosses x < frame.left + 0.22·frame.width, or x > frame.left + 0.84·frame.width.
