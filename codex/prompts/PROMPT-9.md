Round 9 build: the premium black+blue website and the GitBook-style docs. Read the DESIGN.md "Round 9" section, design/home9-mockup.html, docs-mockup.html, skins9-mockup.html and design/docs-content/*.md, then the current code. Work only inside this folder. Same rules: plain HTML/CSS/JS, no dependencies, no build step, chat text is never inserted as HTML, and old overlay URLs + the OAuth return keep working.

Build:
1. **Tokens + components:** the new design tokens and components in css/tokens.css (+ a site stylesheet), used on every site page. overlay.html stays untouched apart from the shared skin-render.css.
2. **Home:** exactly as designed. Announcement bar, nav, gradient hero, the live collage using the real render code, stat tiles, feature grid, the "Works with" text-badge strip, the updated setup section (OBS, Streamlabs, Twitch Studio, XSplit, Meld, vMix; 1920×1080 or 1280×720), FAQ, footer.
3. **Skins, Editor, Request:** restyled in the new system, with no feature lost.
4. **Docs at /docs/:**
   - A static docs app: `docs/index.html` + `docs/docs.js` render the Markdown pages from `docs/content/*.md` (copy them from design/docs-content). Write a tiny safe Markdown renderer: headings, paragraphs, lists, code, links, callouts `> [!TIP]` / `> [!NOTE]` / `> [!WARNING]`, images; escape all HTML.
   - The left sidebar from a `docs/nav.json`, client-side search over titles + headings, an "On this page" TOC, prev/next, copy buttons on code blocks, deep links `#/page/heading`, a mobile drawer.
   - Link "Docs" in the nav everywhere and from the editor's help spots.
5. **Accessibility + performance:** AA contrast, keyboard navigation, visible focus, reduced motion, fast first paint.

Keep all the test hooks and features working. Add tests:
- the Markdown renderer (escapes HTML, renders callouts/code/lists/links)
- nav.json ↔ content files (every nav entry has a file and vice versa)
- docs search
- tokens: every custom property used is defined

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.

## ALSO FIX in this round (lead's Chromium check of the round 7 alerts UI and the previews)
- **The editor's Alerts section looks broken:**
  - giant native checkboxes (~48 px) centered on their own
  - type labels pushed to the far right with a stray "+" / "–"
  - the inputs stacked oddly

  Restyle it with the new tokens: compact rows (a toggle + the type name on the left, an expand chevron on the right), the message template + duration inside the expanded row, and the "Send test alert" button per type.
- **When you press "Send test alert"** while scrolled down in the controls, the preview stage is scrolled out of view, so you can't see the alert. Keep the preview sticky/visible (or scroll it into view) whenever a test alert or Test Chat burst fires.
- **Missing space between name and message** in several skins ("OrbitWelcome, everyone!", "[Orbit]Welcome"), e.g. Cyber City, Space Command, Arcade Cabinet, Battle Royale, Dungeon Crawler, Hero Shooter. Every name format must end with a separator/space before the message (fix in skins.json formats or in the render join). Add a test that renders every skin and asserts that the name and the message text are separated by a space or punctuation.
