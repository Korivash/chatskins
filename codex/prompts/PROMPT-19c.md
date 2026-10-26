NEW TASK (round 19c): the Frame Studio is still broken in a real browser (Chromium, editor.html at 1440x900, then Studio tab → kit Spooky → Use kit → Randomize → Get link → open the overlay). Screenshots: design/qa-19b-studio.png (top-left: Studio open; top-right: after the Spooky kit; bottom-left: after Randomize; bottom-right: the REAL OVERLAY from the copied link).

1. **A page error fires on every change: `studioController?.render is not a function`** (6x in my run). Something calls `studioController.render()` but the controller object returned by `js/frame-studio.js` has no `render` method (renamed or not exported). Fix the API mismatch, and add a test that imports editor wiring + frame-studio and calls every method the editor uses.
2. **Editor preview:** the kit's border band (chain) renders as a small square at the LEFT of the preview, not around the chat panel. The chat panel is in the center-right. Parts must be positioned relative to the chat panel's actual rect in the preview (the same element Place it moves). Use the panel's offsetLeft/Top/Width/Height in stage coordinates.
3. **Overlay:** the parts draw ON TOP of the messages (the chain band crosses the text, a ghost sticker covers the text). Required:
   - border bands draw OUTSIDE or on the edge of the chat window (the band's inner edge = the window edge)
   - stickers and corners sit on the frame edge or outside it, never over the inner window
   - z-order: messages above effects, effects never cover text (pointer-events none; clip effects to outside the window)
   - the plaque sits on the top edge with the name centered (currently the name overlaps the plaque bottom)
4. **Acceptance (do this computationally if you can't run a browser):** for each of the 6 kits and 20 Randomize seeds at 1280x720:
   - no part rect except effects intersects the inner chat window by more than 4% of its area
   - corners are within 3% of the window corners
   - the band matches the window rect expanded by its thickness
   - the plaque center x is within 2% of the window center
   
   Write it as a test.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Report the files you changed.
