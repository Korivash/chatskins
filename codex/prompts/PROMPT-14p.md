Round 14p: ROOT CAUSE of the plaque titles that still look washed out or invisible (mothlight, royal-court, bunny-princess, crowned-kittens, tactical-gunmetal; see design/qa-14n-plaques.png). Your titleStyle colors are correct. The rendering is wrong.

Computed style on `.template-plaque` text (Chromium):
- mothlight: `background-image: linear-gradient(#3A2410,#50351C)`, `-webkit-background-clip: text`, `-webkit-text-fill-color: transparent`, `text-shadow: rgba(255,255,255,.53) 0 1px 0, rgb(19,11,0) 0 2px 3px`
- tactical: a white→orange gradient, with `text-shadow: rgb(27,27,27) 1px 1px 0, rgb(27,27,27) -1px -1px 0`

**Bug:** with `background-clip:text` plus a transparent fill, `text-shadow` is painted UNDER the transparent glyphs and shows through them. The visible letters take the shadow color (pale white on mothlight/royal, near-black on tactical), not the gradient.

**Fix (all plaque titles and sub-labels):**
- Never combine text-shadow with background-clip:text on the same element.
- Render the title as two stacked layers: a bottom layer with the same text using solid `color` + the shadow/stroke/emboss effects (aria-hidden), and a top layer with the gradient fill via background-clip:text and NO text-shadow. Alternatively use `filter: drop-shadow()` on a wrapper.
- Keep the 4.5:1 test, but evaluate the TOP layer's gradient stops against the plaque pixel median.
- Visual check on these 5 frames: the title must read clearly as dark ink on the cream scrolls, berry pink with a white outline on pink, and bright white/orange stencil on tactical.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
