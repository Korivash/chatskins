Round 14j: the owner reports that "the preview chat doesn't line up with the artwork in the preview section". See design/qa-14j-editor-preview.png (editor preview, editor.html?skin=frame-mothlight at 1440x900).

**Measured by the lead:**
- The editor preview's frame panel is 263x395 CSS px, but its padding is **75.07px 61.82px**: the same numbers the real overlay uses for its 442x662 panel at 720p.
- In the preview the chat rows run over the vine border on the left and right, and sit too low; they're not inside the frame's window. The skins.html card and the selected-skin previews have the same problem.
- The real overlay (overlay.html) lines up correctly, so only the previews are wrong.

**Fix (one approach for every preview):**
- Render previews with exactly the same code path and native size as the overlay: lay out a virtual 1280x720 (or the chosen canvas) stage with the same panel layout, then CSS-scale the whole stage to fit the preview box (`transform: scale()` with transform-origin top left).
- That way frame padding, the window and message rows are identical to OBS, and the preview is a scaled picture of the real thing.
- If a preview instead sizes the panel itself, compute the frame window from THAT panel's box (frameContentRect with the preview panel's width/height), never reuse overlay numbers.
- Applies to: the editor preview, the skins.html selected-skin preview, the skin gallery cards, and the readme page previews.
- **Test:** for every frame skin, in the preview DOM, every .message rect lies inside the frame window rect (allow 1 px).

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
