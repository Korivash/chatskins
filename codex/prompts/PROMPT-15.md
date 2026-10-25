Round 15 build: the OPTIONS MENU REDESIGN. Read design/round15-options.md and design/round15-options-mockup.html (Astra) first, and design/qa-15-mockup.png for the look. Build it into editor.html exactly to the spec:
- **Tabs:** Look · Style · Chat · Viewers · Alerts · Get link. Each section shows its essentials, plus a "Show all options" switch. These replace the Guided/Simple/Advanced modes and the numbered step bar. Keep the "Make it mine" 3 questions as the Look tab's first-visit flow.
- **Large live preview:** 60%+ of the width on desktop, sticky at the top on mobile. It must use the round 14j scaled-real-overlay preview.
- **Big visual controls:** brand-color swatches plus "Your color", font tiles rendered in the font, segmented buttons, sliders with live values, plain toggles.
- **The Frame card** for frame skins: frame color plus "match my brand color", glow (color/strength/Off-Pulse-Shimmer), middle background (None/Color/Image + opacity), title text plus sub-label, message borders.
- **A sticky bottom bar:** Undo · Redo · Reset · primary "Get my OBS link" (it opens the Get link tab / one-link flow from round 11).
- **Every existing setting stays reachable**, and keep the existing element ids or map them, so links, tests and tips still work.
- Accessible (tablist semantics, labels, focus, keyboard), with no horizontal scroll at 390 px and no "Premium" wording.
- **Tests:**
  - every old setting key is still editable from some tab
  - the tabs switch with the keyboard
  - the bottom bar stays visible
  - the Frame card appears only for frame skins and writes the right keys
  - Get my OBS link produces the same link as before for the same settings

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
