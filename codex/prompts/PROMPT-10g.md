Round 10g: channel points setup is confusing. The owner tested it on his real Affiliate channel: he clicked "Connect channel points" and no rewards were created.

Causes (found by the lead in the code):
1. "Connect channel points" only requests channel:read:redemptions and connects. Creating rewards is a separate, easy-to-miss "Create the rewards for me" button that requests channel:manage:redemptions.
2. `createRewardRequestBody` sends `is_enabled:false`, so even created rewards are invisible to viewers until the streamer finds them in the Twitch dashboard. The success status text is small and easy to miss.

**Fix:**
- In the Chat play section, ONE primary button, "Connect channel points + create rewards": request both scopes in one Twitch login, then create the rewards right after the redirect returns (the existing create-chat-play-rewards action).
  - Keep a secondary "Connect without creating rewards" link for streamers who make their own.
  - Before redirecting, say clearly what will be created (names and costs).
- Create rewards ENABLED (`is_enabled:true`). The streamer explicitly clicked create, so that's consent. Keep a checkbox, "Create rewards turned off (I'll turn them on in Twitch)", unchecked by default.
- Reuse existing rewards with the same title. If they exist but are disabled, offer "Turn them on" (PATCH is_enabled:true).
- After it returns, show the result in the auth banner from round 10f, e.g. "5 rewards created and turned on: ChatSkins: Swap skin, Emote rain, …", or the exact error (not Affiliate, scope missing, 50-reward limit).
- Then show the private play link step right away with "Copy private play link" focused, and say that it replaces the overlay link in OBS.
- **Tests:** the combined scopes in the auth URL; create runs after the return; is_enabled true by default and false when the box is checked; disabled existing rewards get the turn-on offer; the banner text for success and each error.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
