Round 10f: the Twitch login return is silent. The owner reported "Connect with Twitch takes us to editor.html" and couldn't tell if it worked.

Measured by the lead on the live site: after the Twitch redirect (https://getchatskins.com/#access_token=...&state=...), the home page forwards to editor.html. `finishTwitchAuth()` runs, but:
- `auth.error` is never shown. On failure (bad state, helix lookup failed, cancelled) the user sees nothing: an empty #notice and an empty channel box.
- On success, the only sign is small "#notice" text at the top. The user lands at the top of the page with no idea which section they came from.
- The same goes for `finishAlertsAuth()` (Connect alerts / Connect channel points). Check that its errors and successes are visible too.

**Fix:**
1. Show one clear status banner (toast style, matches the site design, role="status", dismissible, stays at least 8 s) for every auth result:
   - Success: "Connected as <login>. Your channel is filled in."
   - Alerts success: "Alerts connected for <login>." Channel points success: the same idea.
   - Each error shows its own message and a "Try again" button.
2. Before leaving for Twitch, save which section/button the user clicked (sessionStorage, next to the existing editor restore). After returning, restore the editor state and scroll to that section and focus it.
3. If the home page receives an OAuth hash, it must forward to editor.html keeping the hash intact (verify; add a test).
4. Never put the token in logs or the visible URL (keep the existing replaceState behavior).
5. **Tests:** cover the success, error, cancelled and state-mismatch banners; restoring the section scroll target; and the home → editor forward preserving the hash.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
