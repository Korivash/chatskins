Round 14n: apply Astra's measured name plaques. `design/plaques-14m.json` (from Astra looking at every frame) gives, per `<id>-<shape>`: the plaque rect `{x,y,w,h}` (fractions of the frame image), `painted` (whether "CHAT" is already painted on), `tone` (light/dark fill), and `none` (no plaque). The lead's check of Astra's boxes drawn on the art is in design/qa-14m-plaques.png.

**Apply it:**
1. Copy these rects into `site-media/frames/frames.json` as each entry's `plaque` (replacing the guesses).
2. The title sits centered in that rect and auto-fits (min 10 px).
   - **Too-small plaques:** some boxes are tight (mothlight-tall w 0.09, demon-throne-tall w 0.14, solar-oracle-tall w 0.145). If `w < 0.22`, keep the plaque's center but widen the text box to 0.30 of the frame width, and give the title a soft backing pill in the plaque color so it reads as part of the art.
   - **painted:true:** cover the painted "CHAT" exactly within the rect with a plaque-colored backing (sample the dominant plaque color from the image under the rect at build time and store it as `plaque.fill`), then render the name on top.
   - **none:true** (e.g. crescent-moon): no plaque; render the title as a small banner centered at the top INSIDE the chat window.
3. Text color comes from `tone` (dark ink on light plaques, light on dark), combined with the 14l per-frame titleStyle font/effects. Keep the contrast test ≥ 4.5:1.
4. **Fix:** the tactical-gunmetal title was near-invisible (dark on dark), and bunny-princess/crowned-kittens were low contrast. They must pass the contrast test.
5. **Test:** every chat frame has a plaque or none; the title rect lies inside the frame; painted plaques have a fill color.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
