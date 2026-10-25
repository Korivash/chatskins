Round 14t: the owner says the CHANNEL NAME isn't centered on its plaque on some frames: "bottom left and right need to be centered more" (see design/qa-14t-grid.jpg, the bottom row of the 18-frame grid: bunny-princess, crowned-kittens on the left; neon-hex on the right; check the others too).

Make the title truly centered on the VISIBLE plaque:
- Center the title text both horizontally and vertically within the plaque's inner rect (text-align center, flex centering), using the measured plaque rect, not the text box start.
- Where the plaque was widened (round 14n) or a cover fill is painted, center on the PLAQUE'S center (the original rect center), not the widened box's left edge.
- The sub-label is centered under the title.
- Add a per-frame `plaque.nudge {x,y}` (fractions) for fine optical centering, set for any frame whose plaque art is asymmetric (e.g. a scroll curl on one side).
- **Test:** for every frame, the title's rendered center is within 2% of the plaque rect's center (horizontally) at 1280x720.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
