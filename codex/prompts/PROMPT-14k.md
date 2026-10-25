Round 14k: the frame windows in site-media/frames/frames.json are hand-guessed and wrong, so chat runs over the art (the owner noticed it in the previews; it's also tight in OBS).

**Lead's measurement** (a greedy grow-from-center of the alpha<24 area; a lower bound, not exact):
- mothlight-tall: stored x0.12 y0.10 w0.76 h0.80, measured **x0.217 y0.282 w0.569 h0.407**
- mothlight-wide: stored x0.251 w0.498, measured **x0.311 w0.379**
- solar-oracle-wide: stored x0.125 w0.751, measured **x0.226 w0.549**
- sugar-static-wide: stored x0.111 w0.778, measured **x0.287 w0.519**
- neon-hex-tall: stored y0.168 h0.664, measured **y0.276 h0.517**
- cozy-cafe-tall: the center has semi-transparent sparkle texture, so a naive scan finds almost nothing (needs speck tolerance)

**Fix: build a real measuring tool** `tools/measure-frames.mjs` (Node; decode the WebP with a small dependency-free path, e.g. use the PNG/RGBA sources if they're easier, or a tiny decoder; if you can't decode WebP in Node, write the tool as a page `tools/measure-frames.html` the lead can run in Chromium and that prints JSON). The tool:
1. Builds an alpha mask (alpha ≥ 40 = art). Removes art specks smaller than 0.15% of the image area (sparkles, dust), so textured-but-transparent centers still count as open.
2. Finds the **maximal axis-aligned empty rectangle** containing the center (the histogram/stack method on rows), not a greedy grow.
3. Writes `inner` = that rect minus a 1.5% margin, plus `plaque` (keep the existing plaque values unless the plaque overlaps the window, in which case move the window top below the plaque).
4. Prints a before/after table.

Then:
- Update frames.json with the measured rects (all 32 entries).
- Make sure the overlay AND the previews use only these rects.
- **Tests:** frames.json rects are inside [0,1]; each chat frame's inner rect area is ≥ 20% of the image; and a fixture check that mothlight-tall's inner x ≥ 0.20 and w ≤ 0.62 (the true opening).

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary and the table.
