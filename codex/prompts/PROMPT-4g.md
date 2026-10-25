Round 4g: the editor sections are empty. The owner found it on the live site, and the lead confirmed it in Chromium. Work only inside this folder. Same rules as before.

## Measured: control count per editor section
- Skins 23, My skins 3, **Panel 0, Message box 0, Name 0, Message text 0, Badges 0, System 0**, Frame 35, Background 38, Name format 1, **Layout 0**, Removal 1, Advanced 2.
- The round 2 settings have NO section at all:
  - animation entrance and duration
  - border effects
  - name effects
  - text effects
  - background effects
  - role colors
  - mention highlight
  - filters (hide commands / bots / links + bot list)
  - reduce motion

## Fix: every setting in the schema gets a working control
Use the settings schema in design/DESIGN.md and js/settings.js as the list. Each setting key appears exactly once, in the right section:
- **Panel / Message box / Name / Message text / Badges / System**, the per-part styling from round 3, for each part:
  - font family (curated list + "type any Google Font")
  - size, weight, italic, letter spacing, uppercase
  - color (solid/gradient with alpha), outline, shadow, glow
  - Badges: size, show/hide. System: color/italic.
- **Layout:** width, max messages, message gap, padding, alignment, direction (new at top/bottom), edge inset, message lifetime.
- **Animation & effects:**
  - entrance + duration
  - border effect + speed
  - name effect
  - text effect
  - background effect
  - reduce motion
- **Roles:** broadcaster, mod, VIP and sub name colors; mention highlight color.
- **Filters:** hide commands, hide bots + the bot name list, hide links.

## Rules
- Every control shows its current value and updates the preview live. Changing a control marks the skin "Modified", and undo/redo works.
- No duplicate controls: Frame has 35 and Background has 38, so check those for duplicates and clean them up.
- "Find a setting" must find controls in every section.

## Tests
Add a test that walks the schema and checks that every setting key has exactly one control definition in the editor's control map. Keep the map as an exported data structure, e.g. js/controls.js, so it can be tested without a DOM.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary with the control count per section.
