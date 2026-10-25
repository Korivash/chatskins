Round 14g: readability polish on the frame templates. They look great now (design/qa-14f-frames.png).

1. **Message text is unreadable** on **Cozy Café** (row 1, #1) and **Haunted Manor** (row 1, #3): the message text is near-black on the dark panel. Every template's default text color must reach at least 4.5:1 against its default inner panel color. Add a test over all frame skins that computes this contrast.
2. **The plaque title is hard to read** on **Mothlight**, **Solar Oracle** and **Royal Court** (white text on cream/ivory plaques), and on **Cozy Café** (dark text on a dark-wood plaque):
   - Pick each plaque's text color by measuring the plaque area's average luminance (precompute it into frames.json next to the plaque rect): dark text (#2b1d12-ish or the template's ink color) on light plaques, light text on dark ones.
   - Add a subtle text shadow for legibility.
   - Test that every plaque's text vs plaque luminance contrast is ≥ 4.5:1.
3. Keep everything else unchanged.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
