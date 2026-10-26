NEW TASK (round 23g): **bigger, uncut previews.** The owner's screenshot is design/qa-23g-skins-preview.png: the skins.html "Selected skin" monitor shows Neon Kawaii Goth Minimal TINY (the frame is ~100px wide inside a ~400px box) and CUT OFF on the right side. The owner: "maybe the preview should be bigger also".

1. **skins.html selected-skin preview:**
   - Make the preview box much larger: the whole right column, 16:9, at least 560 px wide on desktop, and give the column more width (the card grid can be 3 columns at 1440).
   - Scale the real overlay stage (round 14j) so the chat panel + frame fill ~85% of the preview HEIGHT, centered both ways.
   - Never clip the frame art: the scale is computed from the panel's full outer box including the frame/art bleed, with 4% padding.
   - Move the "Readability/Flair/Motion/Retro" bars under the preview in a compact row so the preview gets the space.
2. **The editor's live preview:**
   - The chat panel inside the preview must fill ~80% of the preview height, centered, so frames/messages are big enough to judge.
   - The preview column should be ≥ 62% of the width at 1440.
   - Place-it still edits the real canvas position, but the preview's zoom auto-fits the panel; add a small "Fit to canvas / Zoom to chat" toggle (default: Zoom to chat).
3. **Gallery cards:** same rule (no clipping; the panel fits the card's preview area with padding).
4. **Test:** for every frame skin, in the skins.html preview the frame's bounding box lies fully inside the preview box and its height is ≥ 75% of it.

Keep the code commented. Run each test file with node directly. Try git add + commit; if it's blocked, say so. Report the files you changed.
