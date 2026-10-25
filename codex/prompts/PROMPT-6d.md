Round 6d: two visible bugs on the built site (lead's Chromium test at 1440x900). Fix only these.

1. **Garbled characters on the title screen.** It shows "FEATURED ? BUBBLE LIFT" and "? ? choose ? Enter select ? Space start". The middle dot (·) and the arrows (↑↓) became literal "?" characters in the source files: they were written in a non-UTF-8 encoding.
   - Restore the intended characters.
   - Re-save index.html, js/home.js and every file you touched in 6c as UTF-8 (no BOM).
   - Grep ALL html/js/css files for a literal "?" that stands in for a missing symbol and for `Ã`/`Â`, and fix them.
   - Add a test that scans the html/js/css files for `Ã`, `Â` and the U+FFFD replacement character.
2. **The editor stage still runs past the bottom of the viewport.** On editor.html at 1440x900, the 16:9 preview frame starts at y≈295 and extends below 900, so the bottom messages are cut off.
   - Size the stage from the space that's actually left: viewport height minus the header and the toolbar (use CSS `min()`/`aspect-ratio`, or compute it in JS on resize). The whole frame must be visible without scrolling at 1280x720, 1440x900 and 1920x1080.
   - Expose `window.__chatskinsStageVisible()` → true when the stage's bounding box is fully inside the viewport.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
