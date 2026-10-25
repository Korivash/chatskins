Round 3 build: the FULL EDITOR. Read BRIEF.md, then design/DESIGN.md, design/skins.json and design/mockup.html (updated for round 3), then the current code. Work only inside this folder. Keep the stack: plain HTML/CSS/JS ES modules, no build step, no runtime dependencies.

Build everything in the round 3 design:
1. Per-part styling (message, name, text, badges, system lines, panel).
2. The frame builder: border styles, a second outer frame, corner ornaments, frame per message or per panel.
3. Backgrounds: gradient, image URL, blur, opacity.
4. The name format template with tokens. Text only: tokens fill text nodes, never HTML.
5. The layout and removal options.
6. My skins: save/duplicate/rename/delete in localStorage, export/import JSON, share link, undo/redo, Reset to skin.
7. Optional custom CSS:
   - Scoped to the overlay root.
   - Strip `@import`, `url(` with http(s) and `expression`.
   - Cap the length.
8. Editor UX: section search, preview switches (fake/live, dark/light/checker, burst of 10), current values shown, color with alpha.
9. **Fix:** Guild Chat must show its thin gold double frame in the editor preview, on its skin card and in overlay.html, exactly as specified in design/DESIGN.md. Check every other skin's frame against the design too.

Rules:
- Old overlay URLs keep working: old keys map to new ones, and missing keys take defaults.
- Keep the URL as small as you can: store only the values that differ from the chosen skin.
- Keep CPU low in OBS: CSS keyframes only, and no layout thrash per message.
- Keep the existing js/irc.js chat client unchanged unless a bug needs fixing.

Tests:
- Update tests for the new schema and the old-key migration.
- Test that the custom CSS sanitizer strips `@import` and remote `url(`.
- Test the name template tokens, including that HTML in names/tokens comes out as text.
- Test that every skin in skins.json decodes.
- Run each test file with node directly if `node --test` is blocked by the sandbox.

When done: try git add + commit. If git is blocked, say so; the lead commits it. Print a short summary with test results.
