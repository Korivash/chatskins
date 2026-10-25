Round 14u: ROOT CAUSE for neon-kawaii-goth (measured by the lead in Chromium, `overlay.html?test=1&skin=frame-neon-kawaii-goth`, 1280x720):
- `.has-frame-template` panel: **662x662 (square)**, `.template-frame-art` also 662x662
- the loaded image: **neon-kawaii-goth-tall.webp (800x1200, 2:3)**
- padding: 139.7 93.3 136.9 130.3 px; message rows at x=150, width 438. They run over the chains and past the right border.

This skin has 3 shapes (square, wide, tall). The panel took the SQUARE aspect (or the default size) but the TALL image was loaded, so the image is letterboxed/stretched inside a square box and the window fractions (meant for the tall image) are applied to the square box.

**Fix in frame-templates.js / panel-layout.js:**
1. Choose ONE entry (shape) and use it for everything: the image file, the panel aspect, the inner rect and the plaque rect. The shape is picked from the panel's target aspect (the user's chosen size/position, or the template default) → the closest entry. The panel then takes exactly that entry's aspect ratio (w/h from frames.json).
2. The frame art element must have the same box as the panel (object-fit: fill is fine once the aspects match; never letterbox).
3. Apply the same to the editor preview and the cards.
4. Check every multi-shape frame (neon-kawaii-goth, all the -wide entries).
5. **Test:** for every frame skin at 1280x720 and 1920x1080, panel aspect == loaded entry aspect (±1%), and every .message rect lies inside the inner rect.

Also verify (from 14t) that the plaque title center is within 2% of the plaque center for bunny-princess, crowned-kittens and neon-hex in a REAL browser layout, not only in a DOM-free test. If you can't run a browser, compute it from the same rect math the overlay uses and print the numbers.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
