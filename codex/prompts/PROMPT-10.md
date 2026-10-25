Round 10 build: the animated skins + the distinct basic skins from the DESIGN.md "Round 10" section and design/animated-mockup.html. Work only inside this folder. Same rules: CSS keyframes/SVG only, reduced-motion fallbacks, chat text is never HTML, old URLs keep working (keep the skin ids).

- **Shared render path:** implement every new effect in css/skin-render.css + the render code, so each skin looks the SAME in overlay.html, the editor, the skins-page cards/monitor and the home collage.
- **Performance:**
  - ≤ 3 animated layers per message
  - animate only transform/opacity/background-position/filter
  - pause animations in off-screen previews (IntersectionObserver)
  - the overlay must stay smooth with 20 messages on screen
- **Skins page:** cards and monitor animate live (respect "Pause previews").
- **Home collage:** includes 2-3 animated skins.

## Tests
- every skin decodes and has a tagline + stats
- every animated skin defines a reduced-motion fallback
- no two skins share the same silhouette id, a new `silhouette` field per skin that the test checks for uniqueness among the reworked basic skins
- `overlay.html?test=1` renders each new skin without console errors (a DOM-free pure check of the class/attribute output is fine)

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
