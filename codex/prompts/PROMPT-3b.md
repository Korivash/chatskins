Round 3b: finish round 3 and fix the bugs found in browser testing. Read design/DESIGN.md (round 3 sections) and the current code first. Work only inside this folder. Same stack and rules as before: no dependencies, CSS keyframes only, chat text is never inserted as HTML, and old URLs keep working.

## Bugs found by the lead's browser test (1440x900 editor; OBS overlay 1440x900 on live chat)
1. **Skin cards overflow the left panel.** The cards are wider than the panel and cut off on the right. Their samples are clipped at the bottom (e.g. "Terminal" shows half a line).
   - Cards must fit the panel width.
   - The sample line must be fully visible.
   - Restore the group headings: Game styles / Animated / Colorful.
2. **Overlay with a panel frame (Guild Chat):** when messages fill the height, the panel grows past the top of the screen. The gold top border and the oldest messages are cut off.
   - The whole frame must always stay on screen.
   - Drop the oldest messages that don't fit (measure after each insert, in one requestAnimationFrame, without layout thrash).
   - Same rule for every frame scope and both directions (new at top or bottom).
3. **Editor preview:** the same thing. The Guild Chat panel's top frame edge is cut off at the top of the stage.
4. **Header:** the current skin name and the Undo/Redo buttons are squeezed against the "Chat studio" title.
   - Give them a tidy toolbar: skin name, Undo, Redo, with spacing.
   - Ctrl+Z / Ctrl+Y must still work.
5. **Channel box:** it moved under the Copy button with only a placeholder. Give it a visible "Twitch channel" label and keep it next to Copy overlay URL.

## Finish the round 3 parts that were left partial
- Full color and gradient editing: 2-3 stops, angle, alpha, for text, name, background and frames.
- Frame ornament geometry: brackets, dots, diamonds and notches, as specified in DESIGN.md.
- Live background image (URL, fit, opacity, blur) in the preview and the overlay.

Then check every round 3 feature in DESIGN.md:
- My skins: save, duplicate, rename, delete, export/import JSON
- section search
- preview switches
- name template
- removal animations

Anything missing, finish it.

## Tests
Keep all the existing tests passing, and add tests for:
- the fit-to-height logic (a pure function: given message heights and the available height, which ones stay)
- gradient settings encode/decode

Run each test file with node directly.

When done: try git add + commit. If git is blocked, say so; the lead commits it. Print a short summary: what's fixed, what's finished, the test results.
