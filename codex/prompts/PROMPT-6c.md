Round 6c: polish the built website so it MATCHES Astra's mockups (design/home-mockup.html, skins-mockup.html, editor-mockup.html, request-mockup.html, plus DESIGN.md "Round 6b"). Judges will see it. The lead compared the live pages to the mockups in Chromium at 1440x900.

1. **Title screen (index.html):**
   - The animated starfield + perspective grid "attract mode" background and the logo glow from the mockup are missing; the page is flat navy.
   - Use the mockup's big glowing ChatSkins wordmark with the SVG mark (not just a headline), and a blinking PRESS START.
   - The menu has a visible selector cursor/bar on the focused item, moved with arrows and mouse.
   - The stream-monitor demo cycles the Featured skins automatically (the arrows still work).
2. **Editor (editor.html):**
   - The preview stage is taller than the viewport and gets cut off at the bottom. The whole 16:9 stage must fit the viewport next to the panel at 1440x900 and 1920x1080 (scale it down).
   - Simple mode, "Text size": there's a stray EMPTY input box next to the value field. Remove it; one slider + one number is enough.
   - The color input renders as a plain bar. Use the polished swatch + hex from the mockup.
   - The status text "Waiting for channel ID" shows in fake-chat mode; hide it unless Live channel is selected.
   - Use the loadout-screen styling from the mockup: game-menu tabs, framed preview "monitor", step bar 1/2/3 with the current step highlighted.
3. **Skins page:**
   - Check against skins-mockup.html (portrait grid + big live preview + stat bars + "Use this skin" / "Customize").
   - All 34 skins must be reachable through the group tabs.
4. **Request page:** check it against request-mockup.html (the quest-board styling).
5. **Everywhere:** consistent spacing/tokens, hover/focus states, no layout overflow at 1280, 1440 and 1920 widths, and a stacked layout at 390 px phone width.

Keep every feature and the test hooks working. Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
