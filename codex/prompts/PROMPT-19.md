NEW TASK (round 19). Build the **FRAME STUDIO** from Astra's design: read design/round19-studio.md, design/round19-studio-mockup.html and the parts in design/parts19/ first. It builds on the round 18 Place-it system (js/place-mode.js: drag/resize/snap).

- Move the parts library into `site-media/parts/` (minified SVG, a single `parts.json` index with ids, category, tags and default size). The overlay lazy-loads only the parts a design uses.
- **Studio UI**, exactly per the spec: the Studio entry in the Look tab, a parts drawer with search + categories, a canvas around the live chat window, the selected-part toolbar (color --c1/--c2/--glow, size, rotate, flip, layer, duplicate, delete), snapping + guides, Undo/Redo, Randomize by vibe, the 6 starter kits, Start blank / Start from a frame, and Save/Load "My frame" (localStorage in try/catch).
- The chat window and the name plaque are parts. The plaque shows the streamer name using the 14l/14q title styles.
- **Link encoding:** part id + transform (x, y, w, h, rotation, flip as integer permille) + colors (hex), with a max of 25 parts. Keep the full OBS link under 6,000 characters for a 25-part design (test it). Old links unaffected.
- **Overlay:** render the studio design (inline SVG parts via `<use>`/inline, recolored with CSS variables); effects reduced-motion safe; fit-to-panel rules respected; the chat window part drives where messages go.
- Mobile: simplified (starter kits, recolor, Randomize; dragging is optional).
- Accessible: keyboard-move parts (arrows, Shift = 10x), labeled controls.
- **Tests:**
  - parts.json validity and every SVG present
  - link round-trip + size budget
  - the overlay renders a saved design with messages inside the chat-window part at 1280x720 and 1920x1080
  - Undo/Redo
  - Randomize produces valid designs
  - no "Premium" wording

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Report the files you created or changed.
