Round 2 build. Read BRIEF.md, then design/DESIGN.md, design/skins.json and design/mockup.html (updated for round 2), then the current code. Work only inside this folder. Keep the stack: plain HTML/CSS/JS ES modules, no build step, no runtime dependencies.

## 1. BUG, fix first: live chat never connects
tmi.js 1.8.5 has no browser bundle on any CDN; the script 404s, so `window.tmi` is undefined.
- Remove tmi.js and write our own tiny Twitch IRC client in js/irc.js using the browser WebSocket.
- Connect to `wss://irc-ws.chat.twitch.tv:443` anonymously: `PASS SCHMOOPIIE`, `NICK justinfan<random 5 digits>`, then `CAP REQ :twitch.tv/tags twitch.tv/commands`, then `JOIN #<channel lowercase>`.
- Answer PING with PONG.
- Parse IRCv3 tags (unescape `\s \: \\ \r \n`), plus prefix, command, params and trailing.
- Handle PRIVMSG (display-name, color, badges, emotes) and CLEARCHAT/CLEARMSG (remove the deleted messages from the overlay).
- Reconnect with backoff (1, 2, 4 ... max 30 s).
- js/chat.js keeps the same connectChat(channel, onMessage, onState) API.
- Add tests/irc.test.js for tag parsing, PRIVMSG parsing (with emotes and badges) and PING.

## 2. Make skins match the design exactly
Round 1 lost some frames: Guild Chat shows no gold double frame in the editor preview, and the skin cards don't show each skin's frame. Every skin's frame, colors, fonts and name format must match design/DESIGN.md and mockup.html, in the preview, on the skin cards and in overlay.html.

## 3. Add the round 2 design
- The 12 new skins (22 in total).
- The skin gallery grouped as Game styles / Animated / Colorful, with live animated samples.
- All new settings:
  - border effects
  - name effects
  - text effects
  - bounce/zoom/glitch entrances
  - background effects
  - role colors
  - mention highlight
  - the reduce-motion toggle, plus respecting prefers-reduced-motion
- CSS keyframes only; keep CPU low.
- Old overlay URLs must keep working (new keys default).

## 4. Tests
- Update the settings tests for the new keys, and add one that every skin in skins.json decodes to valid settings.
- Run all tests with `node --test tests/` (if the test runner is blocked by the sandbox, run each test file with node directly).

When done: try git add + commit. If git is blocked by the sandbox, say so; the lead commits it. Print a short summary: what changed, the test results, and anything left.
