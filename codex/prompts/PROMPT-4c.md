Round 4c. Work only inside this folder. Same rules as before.

## 1. REGRESSION from 4b (top priority): no messages are shown at all
The lead measured it in Chromium.
- **Editor** (index.html, Guild Chat, fake chat): the `.stage .chat` panel is 28 px tall and holds ONE child, `.chat-surface` (the absolute frame layer), and ZERO message elements. After "Burst 10" ×3 there are still no messages.
- **Overlay** (overlay.html, Guild Chat, live xqc chat for 25 s): the same. An empty 28 px panel at the bottom; `__chatskinsFitOk()` is true only because the panel is empty.

So the fit/removal loop deletes every message, or the messages are no longer appended. Likely suspects:
- the loop compares `scrollHeight > clientHeight` on a panel with `height: auto`
- it counts the `.chat-surface` frame layer as a message
- it runs before layout
- it takes the max-height from a host whose clientHeight is 0 at that moment (e.g. before the scale is applied)

Fix it so that:
- messages show
- the panel hugs its content up to its max-height
- only the OLDEST message elements are removed (never `.chat-surface`), and only while the panel's content is taller than its max-height
- the panel never goes off screen

Add a pure test for the removal loop with a fake panel (heights and a max-height), including a frame-layer child that must never be removed.

Self-check: add `window.__chatskinsStats()` returning `{messages, panelTop, panelBottom, viewportHeight}` so the lead can verify it with Playwright.

## 2. "Connect with Twitch": one-click channel
Twitch app Client ID (public): `o35kfdkfee10jgi3i6szk98lsfcvf3`. The redirect URL registered on Twitch is exactly `https://chatskins.korivash.com/`.
- **Button:** "Connect with Twitch" next to the Twitch name box. It sends the user to
  `https://id.twitch.tv/oauth2/authorize?client_id=<id>&redirect_uri=https%3A%2F%2Fchatskins.korivash.com%2F&response_type=token&scope=&state=<random>`
  (implicit grant, no scopes, no secret). Save the state in sessionStorage.
- **On return:** read `access_token` and `state` from the URL hash and check the state. Call `https://api.twitch.tv/helix/users` with the `Client-Id` + `Authorization: Bearer` headers. Fill the Twitch name with the `login`.
- **Then the token:** remove it from the address bar right away (history.replaceState). Revoke it with `POST https://id.twitch.tv/oauth2/revoke` (client_id + token), and never store it or put it in an overlay URL.
- **Errors:** if the login is cancelled or fails, show a friendly message; typing the name still works.
- **Restore:** keep the editor's current settings across the login redirect (sessionStorage).
- **Code location:** keep the Client ID in one constant in js/twitch-auth.js. Add tests for hash parsing and the state check.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
