Round 6 build: the judge-ready WEBSITE. Read the DESIGN.md "Round 6: Website" section, design/landing-mockup.html and design/editor-mockup.html, then the current code. Work only inside this folder. Same stack and rules: plain HTML/CSS/JS modules, no dependencies, no build step, chat text is never inserted as HTML, and old overlay URLs keep working.

Build:
1. **Design tokens:** css/tokens.css, the brand tokens from DESIGN.md, used everywhere. No stray hard-coded colors/spacing in the new UI.
2. **Landing page** (index.html), exactly as designed:
   - hero with the live CSS demo overlay cycling the Featured skins (reuse js/render.js with fake messages)
   - how it works, the skins showcase with filters, features, the OBS guide, FAQ, footer
3. **Editor** (editor.html):
   - Simple mode by default: the step bar, big skin cards, 6 simple controls, step 3 with Connect with Twitch, copy + toast, the OBS mini-guide
   - An "Advanced editor" switch with the full existing editor restyled with the tokens
   - The stream-backdrop preview with fake chat
   - A responsive stacked layout on phone width
4. **Routes:**
   - `/` = landing, `/editor.html` = editor.
   - Old links that pointed at index.html with an editor hash (#...) or the Twitch OAuth return must still land in the editor with their settings (detect the hash on index.html and forward it).
   - The Twitch redirect URL stays `https://chatskins.korivash.com/`, so the landing page must forward `#access_token=...` to the editor's auth handler without losing it.
5. **Accessibility:** keyboard navigation, focus rings, aria labels, AA contrast, reduced motion.
6. **"Request a skin"** (owner: streamers can still request new skins):
   - A clear button on the landing page (skins showcase + footer) and in the editor's skin step.
   - It opens `https://github.com/Korivash/chatskins/issues/new?template=skin-request.yml`.
   - Add `.github/ISSUE_TEMPLATE/skin-request.yml`, a GitHub issue form with these fields:
     - skin name idea
     - game/style it's inspired by (inspired-by only; no copyrighted assets)
     - colors
     - font vibe
     - frame/border idea
     - example description
     - Twitch channel (optional)
   - Add `.github/ISSUE_TEMPLATE/config.yml` with `blank_issues_enabled: false`.
   - The landing page also shows a small "Skins made from streamer requests" note area, empty for now.
7. **Keep working:** everything from earlier rounds:
   - `__chatskinsFitOk` / `__chatskinsFrameOk` / `__chatskinsStats`
   - transparent background, undo/redo, My skins
   - fake chat (never in the overlay URL)
   - emotes

## Tests
- The hash/OAuth forwarding logic (a pure function).
- The simple-mode controls map to the right settings keys.
- Tokens: every CSS custom property used in css/*.css is defined in tokens.css (simple text scan).

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
