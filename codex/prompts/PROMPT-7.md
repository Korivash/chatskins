Round 7 build: ALERTS through Twitch EventSub WebSocket. No server; everything runs in the browser/OBS. Read the DESIGN.md "Round 7: Alerts" section, design/alerts-mockup.html and the current code. Work only inside this folder. Same rules: no dependencies, text-only rendering of user content, old URLs keep working.

## Build
1. **js/alerts-auth.js:** Twitch implicit-grant login.
   - Client ID: the constant in js/twitch-auth.js.
   - Redirect: `https://chatskins.korivash.com/` (forward to the editor as in round 6).
   - Scopes: `moderator:read:followers channel:read:subscriptions bits:read channel:read:redemptions`.
   - Validate the token with `GET https://id.twitch.tv/oauth2/validate` (user_id, login, scopes, expires_in).
2. **js/eventsub.js:**
   - Connect to `wss://eventsub.wss.twitch.tv/ws`. On `session_welcome`, create the subscriptions with `POST https://api.twitch.tv/helix/eventsub/subscriptions` (`transport: {method:"websocket", session_id}`):
     - `channel.follow` v2 (condition: broadcaster_user_id + moderator_user_id = the user)
     - `channel.subscribe`, `channel.subscription.message`, `channel.subscription.gift`
     - `channel.raid` (to_broadcaster_user_id)
     - `channel.cheer`
     - `channel.channel_points_custom_reward_redemption.add`
   - Handle keepalive timeouts and `session_reconnect` (move to the reconnect_url).
   - Handle revocation, and reconnect with backoff.
   - If a subscription is forbidden (e.g. bits on a non-affiliate), skip it quietly and show that in the editor status only.
3. **The alerts overlay:**
   - overlay.html shows alerts when the URL has an alerts token in its fragment (a separate "alerts link", or one combined link if the user chooses). Alerts use the skin's alert recipe.
   - A queue, de-duplication, durations, positions.
   - Optional WebAudio-synthesized sounds with a volume setting.
   - Respect reduced motion.
4. **Editor:** the "Alerts" step/section from the design:
   - Connect alerts
   - per-type toggles and message templates (tokens fill text nodes only)
   - "Send test alert" for every type, which works without login in the preview
   - copy the alerts link with a password-style warning
   - Disconnect (revoke the token: `POST https://id.twitch.tv/oauth2/revoke`)
5. **Token safety:**
   - The token lives ONLY in the URL #fragment (never in a query string), in memory, or in sessionStorage during setup.
   - Never send it anywhere except id.twitch.tv / api.twitch.tv.
   - Never log it.
   - In the overlay, read it from the fragment, then call history.replaceState to keep the address bar clean (OBS doesn't show it anyway).

## Tests
Use fixtures in tests/fixtures:
- EventSub message parsing (welcome, keepalive, reconnect, notification for every type, revocation)
- alert template filling (text only)
- queue/de-dup logic
- scope/URL building
- the token never appearing in any query string the code builds

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
