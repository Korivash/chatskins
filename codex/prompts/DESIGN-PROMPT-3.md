Round 3 design. You are the designer. Read BRIEF.md, design/DESIGN.md and the current editor (index.html, js/editor.js, css/app.css) first. Don't build: Codex builds after you. Work only inside this folder.

The owner wants a **FULL EDITOR**: "people should be able to customize the chat overlay on their own". Skins become starting points; users can build any look from scratch and keep it.

Design these. For each, list the settings keys, types, defaults and ranges, and add them to the schema.

## 1. Every part styled separately
The message box, name, message text, badges, system lines and the whole chat panel. Each part gets:
- font family (any Google Font typed by name, plus the curated list)
- size, weight, italic, letter spacing, uppercase
- color, gradient, outline, shadow and glow

## 2. Frame builder
- **Border:** none, solid, double, dashed, dotted, groove, ridge, inset or outset, pixel (stepped), beveled.
- Width, color or gradient, radius per corner, inner padding.
- **Second outer frame** (color, offset), like the Guild Chat double frame.
- **Corner ornaments:** none, brackets, dots, diamonds or notches, with a color.
- **Frame applies to:** each message, or one panel around all messages.

## 3. Background
- Solid, linear or radial gradient (2-3 stops plus angle), or an image URL (the user's own) with fit/opacity.
- Blur (backdrop) and an opacity setting.

## 4. Name format template
- A text box with tokens like `[Guild] [{name}]: `, `<{name}> `, `{name} » ` and `{badges} {name}: `.
- A live example under it.
- Tokens are text only, never HTML.

## 5. Layout
- Width, max messages, message gap, alignment, new-at-top or bottom.
- Message lifetime; and fade, shrink or slide out on removal.

## 6. My skins
- Save the current look as a named skin, kept in the browser.
- Duplicate, rename and delete skins.
- Export/import as a JSON file.
- Share by link (the overlay URL already holds everything).
- Undo/redo (Ctrl+Z / Ctrl+Y) and "Reset to skin".

## 7. Advanced: optional custom CSS box
- Scoped to the overlay root.
- `@import`, `url(` with http(s) and `expression` are stripped, so a shared link can't load outside files.
- A note explains this.

## 8. Editor UX
- A left panel with collapsible sections, a search box ("find a setting") and a live preview on the right.
- Preview switches: fake chat or live channel; dark, light or checker background; a test burst of 10 messages.
- Every control shows its current value. Color pickers have an alpha slider.

## 9. Bug from testing
The **Guild Chat** skin lost its thin gold double frame in the built app (both the editor preview and the overlay). Specify its frame precisely in the new frame-builder terms, so the builder can match your round 1 mockup.

## Deliverables
Update design/DESIGN.md, design/skins.json (all 22 skins expressed in the new schema, with old keys still mapping) and design/mockup.html (add the full-editor layout with all sections open). Try git add/commit of design/. If git is blocked, say so; the lead commits it. Print a short summary.
