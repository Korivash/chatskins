Round 14q: plaque titles are STILL pale after 14p, and the lead found why. On bunny-princess, `.template-plaque-title` has `-webkit-background-clip:text`, `-webkit-text-fill-color: transparent`, a berry gradient AND **`-webkit-text-stroke: 1.25px #fff`** at **font-size 15px**. The white stroke is painted on top of the transparent glyphs and covers most of each letter, so the name reads white/pale. The same happens on mothlight/royal-court (`stroke .5px #fff8` + white emboss) and tactical (a dark stroke on the white→orange gradient, so it reads dark).

**Fix:** plaque titles are small (11–20 px), so gradients don't read anyway.
- **No background-clip:text, no transparent fill, no -webkit-text-stroke** on plaque title/subtitle.
- Use SOLID `color` = titleStyle.color (the gradient's darkest or most saturated stop).
- Do the outline/emboss with text-shadow only (e.g. a 1 px 4-direction outline in the outline color, plus at most one soft glow), and the wrapper drop-shadow is optional.
- Keep the per-frame fonts.
- Expected look:
  - **mothlight / royal-court:** dark brown ink (#3A2410) with a faint light emboss (0 1px 0 #fff6)
  - **bunny-princess / crowned-kittens:** berry (#8A1050) with a thin white outline (text-shadow)
  - **tactical:** solid #FFF4E0 with a dark 1 px outline
  - **neon frames:** solid neon color + a glow text-shadow
- **Test:** no plaque title or subtitle element has a computed transparent text-fill-color or a nonzero text-stroke-width, and contrast(solid color, plaque median) ≥ 4.5.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
