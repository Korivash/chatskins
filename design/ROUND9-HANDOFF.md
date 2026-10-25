# Round 9: Premium site + Docs — review guide

This is a design deliverable, not an application build. All authored files are inside `design/`. Read the Round 9 section in `DESIGN.md` for the normative visual and behavior specification.

## Review the specimens

Serve the repository root over localhost and open:

- `design/home9-mockup.html` — Home, live Featured cycle and four renderer-backed floating specimens.
- `design/skins9-mockup.html` — all 42 skins across the existing groups, live previews, selection inspector, pause control.
- `design/docs-mockup.html` — all 26 pages, client-side search, sidebar, TOC, copy, previous/next, mobile drawer.
- `design/editor9-mockup.html` — existing design editor controls with the Round 9 shell and materials.
- `design/request9-mockup.html` — existing design request flow with the Round 9 shell and materials.

The Home and gallery ES modules fetch `skins.json` and import the existing renderer from `../js/`. They need HTTP; double-clicking them as file URLs may block modules. Docs loads a local JavaScript content index and can also be opened directly. Google Fonts require network access; fallback fonts are included.

## Editorial source

Each `docs-content/*.md` file contains a page title, a non-rendered outline comment, and complete copy. `round9-content.py` regenerates those files and `docs-content-index.js`; edit the generator as well if regenerating after editorial changes. `round9-pages.py` regenerates the HTML specimens and restyled copies; shared visual rules are in `round9.css` and `round9-workspace.css`.

## Scope and release dependencies

The mockup links stay within design specimens. Editor and Request inherit design-only interactions: they do not generate production URLs, authenticate, or submit requests. No production route is added, including `/docs/`. Hash navigation in the Docs specimen stands in for the clean routes specified in DESIGN.md.

Alerts, !skin, !skinvote, channel-point controls, cooldown enforcement, and the panic button are proposed experiences. Their docs include an explicit design-preview note. The marketing announcement follows the owner's requested copy; do not publish it before those features are verified. Token copy is grounded in the current channel-name OAuth helper, not a promise about future alert or redemption credentials.

The per-skin MMO reference is generated from `design/skins.json`. Existing skin colors remain intact inside previews: the black/blue palette belongs to the website chrome and must not recolor the user's selected skin.

## Verification

JavaScript syntax and local links/assets are checked without building the application. A headless Chrome visual-review attempt was blocked by the environment (`Access is denied` during Chromium IPC/crash handler startup). Desktop and mobile visual inspection therefore remain a handoff check; no screenshot pass is claimed.
