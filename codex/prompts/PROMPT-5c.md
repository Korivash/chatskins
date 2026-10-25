Round 5c: two bugs from the lead's Chromium test of round 5 (live channel xqc, which uses 7TV emotes heavily).

1. **7TV/BTTV/FFZ emotes never load.** The overlay made ZERO requests to 7tv.io, api.betterttv.net or api.frankerfacez.com in 25 s of live chat. Words like "catKISS" show as plain text, and the editor status says "Waiting for channel ID".
   - Likely cause: the IRC client never hands the ROOMSTATE `room-id` tag to the emote provider. Check that:
     - `CAP REQ :twitch.tv/tags twitch.tv/commands` is acknowledged
     - ROOMSTATE is parsed
     - `room-id` reaches emote-provider.js
   - Fallback: use the `room-id` tag that every PRIVMSG also carries.
   - Providers must be ON by default.
   - Add a test: feeding a raw ROOMSTATE line and a raw PRIVMSG line into the client triggers the channel-id callback exactly once.
2. **Fake chat is too slow.**
   - After pressing "Fake chat", only 2 messages appeared in 6 s, and the preview started EMPTY.
   - It must start with 4-5 messages right away, then add one every 0.5-2 s with occasional bursts of 3, as specified.
   - Keep it preview-only (never in the overlay URL).

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
