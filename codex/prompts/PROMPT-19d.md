NEW TASK (round 19d): good progress. The OVERLAY now renders studio designs correctly (design/qa-19c-studio.png, bottom-right: the Royal kit in overlay.html: gold frame around the chat, plaque with the name, nothing over the text). The EDITOR PREVIEW is still wrong (the other 3 panels: Spooky, Cute, Royal kits):
- The border band renders as a huge strip in the lower-left of the preview stage.
- The frame outline/plaque ("Your channel") is offset to the lower-right of the chat and overlaps the messages.

**Fix:** in the editor (Studio tab and every other tab), draw the studio design with EXACTLY the overlay's rendering code (js/studio-render.js) inside the round-14j scaled virtual stage, attached to the same chat panel element, so the preview is a scaled copy of the overlay. Remove any separate editor-only part layout math. The interactive selection handles go on top of the rendered parts (computed from the same part rects × stage scale).

**Test:** a DOM test that renders a kit into both the editor preview stage and the overlay, and checks that every part's rect, divided by its stage scale, matches within 1%.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Report the files you changed.
