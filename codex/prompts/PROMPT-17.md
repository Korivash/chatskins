Round 17: DOCS refresh for everything added since round 11. Edit only docs/content/*.md, docs/nav.json and docs/docs.js (if needed). Keep the existing writing style: short, friendly, plain words, step lists.

Update or add pages so they match the live site exactly:
1. **getting-started.md:** the new flow: Customize → tabs Look · Style · Chat · Viewers · Alerts · Get link; the "Make it mine" 3 questions; the sticky "Get my OBS link"; "Set up everything with Twitch"; one OBS link.
2. **editor.md:** replace the Guided/Simple/Advanced description with the tab layout plus "Show all options" per section; Undo/Redo/Reset.
3. **frames.md** (rewrite): the 18 hand-painted frames (list them), pick a shape (tall/wide/square), the name plaque (shows your channel; "Title text" + "LIVE CHAT" sub-label editable), Frame color + "match my brand color", Glow (color, strength, Off/Pulse/Shimmer), Middle background (None/Color/Image) + opacity, Message borders (off by default), animated accents, reduced motion, and matching webcam frames (how to add the webcam frame link as a second browser source). Credits: frame art by Korivash and KittyVenom (made with ChatGPT image generation) and by OpenAI Codex image generation.
4. **chat-powered-skins.md / connect-twitch.md:** the Viewers tab cards (Chat commands, Channel points, Alerts) with their status chips; the one-click connect + create rewards (enabled by default; the opt-out checkbox); the "Enable chat play" switch to turn it all off.
5. **troubleshooting.md:** add "Chat isn't showing in OBS" (refresh cache of the current page, size 1280x720, the source is top of the list, type in chat, the link must be complete), "Rewards don't show" (Affiliate required, Viewer Rewards in the Twitch dashboard), "Frame looks cut off" (use the tall shape for a side chat).
6. **changelog.md:** add entries for rounds 11–15 (one line each, newest first), dated 2026-10-25.
7. **nav.json:** make sure Frames sits near the top of Customize.

No "Premium" wording. Then run the docs tests and print a short summary.

Run each test file with node directly. Try git add + commit; if it's blocked, say so.
