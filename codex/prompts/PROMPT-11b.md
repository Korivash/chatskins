Round 11b: one BLOCKER found by the lead in Chromium. Don't deploy without this.

After "Set up everything with Twitch" returns successfully (banner: "Connected as korivash." and "2 rewards are ready and on … Chat commands and alerts are ready."), `#guided-copy` "Copy overlay link" stays **disabled**, and the text under the button still says "Connect to create your one private OBS link." So the streamer can't get the one link, which is the whole point.

Repro: in editor.html, type a channel, click Set up everything, return with `#access_token=…&state=<matching>`, where Twitch validate returns login=korivash, user_id=99, scopes [channel:read:redemptions, channel:manage:redemptions, moderator:read:followers]. Helix POST custom_rewards returns the created reward.

**Fix:**
- After a successful return, enable `#guided-copy` and replace the hint with "Your one OBS link is ready. Paste it as a Browser Source." Copy must produce the single overlay link (chat + chat play + rewards + alerts) with the credentials in the hash.
- Make sure the credentials from the combined setup are the ones the link builder reads, whether they arrive through finishAlertsAuth or through the guided flow (likely the cause: two credential stores).
- Also: the Chat play status line ("Chat play is off. Try it in the preview.") must say ON after setup turns chat play on. And the feature-card switch renders oversized (a ~40 px knob). Match the site's regular toggle.
- **Tests:** after the mocked return, guided-copy is enabled, the copied link decodes with play + alerts + the token, and the chat play status reads on.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
