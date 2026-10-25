Round 13 build: make customizing dead simple. Read design/round13-simple.md and design/round13-simple-mockup.html (Astra) first, then build them into editor.html.

- **Three levels:** Guided ("Make it mine": vibe → colors → size, with each answer restyling the live preview at once and "Done, get my link" flowing into the round 11 one-link setup) → Simple (visual pickers, about 10 controls) → Advanced (everything that exists today, UNCHANGED, with the same element ids so nothing else breaks).
- First-time visitors land on Guided; returning visitors land where they left off (localStorage, wrapped in try/catch). Always offer "Start over" + "Undo".
- **Visual pickers:** font tiles rendered in the actual font, frame thumbnails, looping entrance previews, background swatches with Transparent first and marked recommended.
- **"Luna's tip"** is a STATIC, rule-based helper. NO AI service and no network calls (the owner rejected a chatbot). Implement the design's tips, triggers and "Do it for me" actions.
- Use the settings mapping table from the design exactly. Every guided/simple choice writes real settings keys, so links and overlays work unchanged.
- Plain words, mobile-friendly at 390 px with no horizontal scroll, keyboard + screen-reader friendly.
- **Tests:**
  - each vibe/palette/size maps to the documented settings
  - Undo restores the previous settings
  - Advanced still holds every old control id
  - tips' "Do it for me" applies the documented change
  - no network calls from the tips
  - an overlay link from Guided mode renders Test Chat

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
