Round 12b: three fixes for Astra's new readme.html (measured by the lead in Chromium). Touch only readme.html, css/readme.css and js/readme.js (plus tests).

1. **Horizontal page scroll:** `document.documentElement.scrollWidth` is 1492 at a 1440 px viewport and 448 at 390 px. Something (likely the skin-wall marquee tracks or the hero orbit rings) overflows the page. Clip the marquee inside its own container (overflow:hidden on the wall, not on body), keep the orbits inside the hero, and make sure scrollWidth equals the viewport width at 1440, 1024, 768 and 390 px.
2. **Wrong session card:** the card says "The first Luna build session" with 01a171c3-…. The MAIN Codex build thread (the one every Luna round from round 5 onward resumed, and the one we submit) is **01a1720e-8ef6-7b72-bdd6-008cece473d5**. Title it "The main Codex build thread", say it was resumed for every build round, and link to docs/CODEX-SESSIONS.md on GitHub (https://github.com/Korivash/chatskins/blob/main/docs/CODEX-SESSIONS.md).
3. **tests/tokens.test.js fails:** `--marquee-duration` is referenced but not defined in the CSS bundle. Give it a default in css/readme.css (e.g. on .skin-wall-track or :root), and keep the per-track JS override.
4. **Add a test** that readme.html contains no infrastructure words (vps, pm2, iis, windows, cloudflare, 127.0.0.1, localhost, an IPv4 pattern, C:\).

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
