Round 6 build: the judge-ready, game-menu WEBSITE. Read the DESIGN.md sections "Round 6" and "Round 6b: Game-menu website" (6b wins where they differ) and the mockups (home, skins, editor, request), then the current code. Work only inside this folder. Same rules: plain HTML/CSS/JS modules, no front-end dependencies, no build step, chat text is never inserted as HTML, and old overlay URLs keep working.

## Build
1. **Tokens:** css/tokens.css, used everywhere.
2. **Pages (exactly as designed):**
   - `/` = title screen (index.html)
   - `/skins.html` = character-select premade skins with "Use this skin" (2-step modal: name or Connect with Twitch → copy link) and "Customize"
   - `/editor.html` = loadout editor (Simple mode + Advanced)
   - `/request.html` = quest-board skin request
   - a shared game-style nav
3. **Routing compatibility:**
   - Old links to index.html with an editor settings hash, and the Twitch OAuth return (`#access_token=...`, the redirect URL stays `https://chatskins.korivash.com/`), must be forwarded to editor.html without losing the hash. Use a pure function + a test.
   - The overlay stays at overlay.html.
4. **Request form:**
   - It POSTs JSON to `/api/skin-request`.
   - Client-side validation uses the same limits as the server.
   - Includes the honeypot plus success, error and 429 states.
5. **The backend:** `server/skin-request.mjs`, plain Node 20 with NO npm dependencies:
   - an HTTP server on `127.0.0.1:${PORT||4417}`
   - handles `POST /api/skin-request` exactly as specified in DESIGN.md: validation, honeypot, rate limits (in-memory), mention stripping
   - forwards a Discord embed to `process.env.SKIN_REQUEST_WEBHOOK` with `allowed_mentions: {parse: []}`
   - never logs the webhook URL
   - `GET /api/health` → `{ok:true}`
   - Also write `server/README.md`: how to run it, and that the IIS site reverse-proxies `/api/*` to it.
6. **Sound:** optional WebAudio menu bleeps, OFF by default, with a toggle that's remembered in localStorage.
7. **Accessibility and performance** as designed.
8. **Keep working:**
   - `__chatskinsFitOk` / `__chatskinsFrameOk` / `__chatskinsStats`
   - transparent background, undo/redo, My skins
   - fake chat (never in the overlay URL)
   - 7TV/BTTV/FFZ emotes, Connect with Twitch

## Tests
- route forwarding
- server validation, rate limiting and mention stripping (import the handler, no network; mock fetch)
- tokens: every CSS custom property used is defined
- every skin has stats

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
