NEW TASK (round 19e): EXACT diagnosis of the Studio editor-preview bug (Chromium, editor.html 1440x900, Studio tab → kit Royal → Use kit), measured by the lead:

- The visible preview chat panel is `div.chat.chat-panel` at **(842, 415) 293x415** (the only visible .chat-panel; ~80 other `.skin-sample.chat.chat-panel` are hidden gallery samples at 0x0).
- `div.studio-board` (the selection/hit layer, parent `source`) is at **(988, 623) 293x415**: the correct SIZE but offset by **+146 px x, +208 px y**. All `.studio-part-hit` elements inherit that offset.
- The studio VISUAL render layer is not attached to the preview chat panel at all: the only render element found is `span.studio-render-plaque` at **(697, 1536)**, 0 px wide, far below the viewport. The big lavender/pink/gold "strip" seen at the lower-left of the preview is the visual layer placed in the wrong container/coordinate space.

**Fix:**
1. Mount BOTH the studio render layer (studio-render.js output) and the studio-board INSIDE the same positioned container as the visible preview chat panel (or inside the panel's own wrapper), using `position:absolute` with left/top = the panel's offsetLeft/offsetTop **in that container's coordinate space**. Never use getBoundingClientRect page coordinates for absolute children (that's the +146/+208 error: it's the container's page offset).
2. Query the visible panel precisely (the preview stage's panel, not `.chat-panel` globally; the gallery samples share the class).
3. Re-sync on resize, scroll, the scale change and Place-it moves (ResizeObserver on the panel + stage).
4. **Test:** with a mocked layout where the stage container is at page (146,208) and the panel at offset (0,0), the board and render layer get left/top 0 (not 146/208), and both share the panel's width/height.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Report the files you changed.
