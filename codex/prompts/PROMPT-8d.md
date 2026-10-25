Round 8d: three small Chat play issues from the lead's Chromium test of editor.html.

1. **Preview test buttons are blocked by the live cooldowns.** After one "Simulate !skin", the status says "Wait 119s before another skin command", and "Start a !skinvote", "Test Emote rain" and so on do nothing. Preview/test actions must BYPASS the per-user and global cooldowns (and must not consume the live cooldown budget). Cooldowns apply only to real chat and channel-point events in overlay.html. Add a test.
2. **Garbled character in the status line:** "Preview only ? Wait 119s ...". The middle dot became a literal "?". Fix it and re-run the encoding scan test (extend it to catch " ? " used as a separator).
3. **Emote rain must be clearly visible in the preview** even when the simulated message has no Twitch emote: use the sample emotes from Test Chat (e.g. the Kappa placeholder and the 7TV-style sample) so judges see it rain. In overlay.html, the real behavior stays (the redeemer's own emotes, falling back to the skin's sparkle glyph when there are none).

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
