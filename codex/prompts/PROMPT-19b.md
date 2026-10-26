NEW TASK (round 19b): the Frame Studio first pass works technically, but it is NOT judge-ready. Compare design/qa-19-studio.png (what's built: top-left after opening the Studio, top-right after the Spooky kit, bottom-left after Randomize) with design/qa-19-mockup-target.png (Astra's target).

**Problems:**
1. **The Studio canvas is a tiny box in the middle column.** The big "Your live preview" stays a plain chat. The STUDIO CANVAS MUST BE THE BIG LIVE PREVIEW: when the Studio tab is open, parts render AROUND the chat panel in the large preview, and you drag/resize/select them right there, using the round 18 Place-it handles/snapping. Remove the tiny duplicate canvas.
2. **Randomize placed a single border piece in the bottom-left corner**, away from the chat. Kits and Randomize must produce a COMPLETE, framed design around the chat window: 1 border band fitted to the chat panel edges (9-slice, sized to the panel) + 4 matching corners + 1 plaque at the top-center with the streamer name + 1–3 stickers on the frame edge + 0–1 effect.
   - All part transforms are RELATIVE TO THE CHAT PANEL (so it moves/resizes with Place it), never absolute canvas coordinates.
3. **The Spooky kit barely changed anything.** Each of the 6 kits = a curated full design (define them in data, not random) with a distinct palette.
4. The Studio parts drawer needs larger tiles with the part's preview in its default colors, plus a selected-part toolbar visible next to the selection (color swatches, size, rotate, flip, layer, delete).
5. **Get link:** "Copy overlay URL" didn't become enabled after typing a channel on the Get link tab in my test. Make sure a studio design + channel produces the link, and the overlay renders the parts around the chat at 1280x720.
6. **Test in a real browser if you can;** otherwise compute the geometry: after each kit, every corner part touches the panel corners (±2%), the border band matches the panel rect, and the plaque is centered on the top edge.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Report the files you changed.
