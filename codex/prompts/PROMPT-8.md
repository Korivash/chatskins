Round 8 build: CHAT-POWERED SKINS. Read the DESIGN.md "Round 8" section and design/chatplay-mockup.html, then the current code (overlay, irc, channels, alerts/EventSub from round 7). Work only inside this folder. Same rules: no dependencies, CSS keyframes only, chat text is never inserted as HTML, and old overlay URLs keep working (the feature defaults to OFF for old URLs).

Build:
1. **Chat commands from anonymous IRC:**
   - `!skin <name|alias>`, `!skinvote` (+ 1/2/3 votes), `!skinreset`
   - permissions, per-user + global cooldowns, the allowed-skin list, aliases
2. **Channel-point rewards** through the existing round 7 EventSub connection:
   - match rewards by title
   - an optional "Create the rewards for me" button (Helix `POST /channel_points/custom_rewards`, scope `channel:manage:redemptions`), with clear errors for non-affiliates
3. **Effects:** crossfade skin swap + attribution banner, emote rain (the message's emotes), frame flash, spotlight, chaos mode, the vote panel styled in the current skin.
4. **Safety:** a master switch, "Panic: freeze skin", reduced motion, and skins only ever chosen from the allowed list.
5. **Editor:** the "Chat play" section as designed, test buttons that simulate viewers without login, and copy-ready chat text.
6. **Showcase loop:** on the home demo and the skins page side monitor.

Keep everything that works now working:
- the test hooks
- Test Chat (never in the overlay URL)
- emotes, channels, alerts
- `overlay.html?test=1`: add a demo of a skin swap + emote rain to the test mode

## Tests (pure functions)
- command parsing + alias resolution
- permission checks
- cooldowns (with a fake clock)
- the vote tally (ties → random from the tied set, with an injectable rng)
- reward-title matching
- the allowed-list guard
- a chat-text-never-HTML check for the banner

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
