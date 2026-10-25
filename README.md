# ChatSkins

**Game-style Twitch chat overlays. Pick a skin, tweak every font, color and border, then paste one link into OBS.**

![ChatSkins](marketing/thumbnail.png)

ChatSkins is a browser-based editor for Twitch chat overlays. It's built for the **Codex x TwitchCon Hackathon (2026)**. Streamers pick a one-click look inspired by popular game chats, like MMO guild chat, retro RPG dialog boxes or pixel sandbox chat, then change anything about it. There's no account, no install and no server. The overlay link *is* the whole configuration.

**Live site:** https://korivash.github.io/chatskins/

---

## Features

### 22 chat skins
Each skin is a starting point, and every setting stays editable.

| Group | Skins |
|---|---|
| Game styles | Guild Chat, Fantasy MMO, Block Craft, Old-School MMO, Battle Arena, Battle Royale, Retro RPG Dialog Box, Terminal, Space Command, Monster Trainer, Dungeon Crawler, Cozy Farm, Horror Survival, Hero Shooter |
| Animated | Cyber City, Arcade Cabinet, Vaporwave, Rainbow Border |
| Colorful | Kart Racer, Candy Pop, Bubble Chat, Clean |

Skins are *inspired by* game styles. They use no logos, game art, ripped textures or trademarked fonts: every look is rebuilt from free Google Fonts and pure CSS/SVG frames.

### Customize everything
- **Font:** family, size, weight, line height.
- **Colors:** text, name (Twitch color or fixed), system lines, outline, shadow.
- **Name format:** e.g. `[Guild] [Name]: message`.
- **Borders and frames:** style, color, width, rounded corners.
- **Background:** color and opacity, per message or as one panel.
- **Layout:** padding, spacing, max messages, message lifetime, new-at-top or bottom, alignment, width.
- **Animations:**
  - entrances: fade, slide, pop, bounce, zoom, glitch
  - border effects: glow, pulse, animated gradient, rainbow
  - name effects: rainbow, gradient, glow
  - text effects: typewriter, wave, shake for mod messages
  - background effects: scanlines, gradient drift, sparkles
- **Roles:** separate name colors for broadcaster, mod, VIP and sub. Mention highlight.
- **Filters:** hide `!commands`, bot accounts (Nightbot, StreamElements, ...) and links.
- **Accessibility:** a Reduce motion toggle, and the overlay respects the system's reduced-motion setting.

### Live preview
The editor shows a live preview with sample chat. Type a channel name to preview the real chat of any live channel.

---

## Use it in OBS
1. Open the [editor](https://korivash.github.io/chatskins/).
2. Pick a skin and change anything you like.
3. Type your Twitch channel name and press **Copy overlay URL**.
4. In OBS: **Sources > + > Browser**, paste the URL, set the size to your canvas (e.g. 1920 × 1080), and keep the background transparent.

To change your overlay later, open the editor with your link, edit, copy the new URL and paste it into the same Browser Source.

---

## How it works
- **Static site:** plain HTML, CSS and JavaScript ES modules. No framework, no build step, no runtime dependencies.
- **Twitch chat:** a small built-in Twitch IRC client (`js/irc.js`) connects to `wss://irc-ws.chat.twitch.tv` anonymously and read-only. Streamers never log in or share a token. It answers PINGs, reconnects with backoff, and removes messages that mods delete (CLEARCHAT/CLEARMSG).
- **Emotes:** drawn from the message's IRC `emotes` tag, with images from Twitch's emote CDN.
- **Settings in the URL:** settings are stored in the link's hash as encoded JSON. Unknown or broken values fall back to safe defaults, so older links keep working.
- **Safety:** chat text is always inserted as text nodes, never as HTML.
- **Performance:** animations are CSS keyframes only, so CPU use stays low in OBS during long streams.

### Project layout
```
index.html        editor
overlay.html      OBS Browser Source
js/
  settings.js     schema, defaults, URL encode/decode
  render.js       builds one chat message from settings (shared by preview and overlay)
  irc.js          anonymous Twitch IRC client
  chat.js         chat connection wrapper
  emotes.js       IRC emote tag -> text/image parts
  filters.js      command / bot / link filters
  fakechat.js     sample chat for the preview
  editor.js       editor UI
  overlay.js      overlay page
design/           design spec, skins.json, design mockup
tests/            node --test unit tests
```

### Run locally
```sh
npx serve .
# or
python -m http.server
```
Then open the local URL. A static server is required, because ES modules don't load from `file://`.

### Tests
```sh
npm test
```
These cover settings encode/decode and defaults, emote parsing, filters, and the IRC parser.

---

## Built with Codex
ChatSkins was built with **OpenAI Codex**:
- A design agent wrote the design spec, skin recipes and settings schema, plus a static mockup (`design/`).
- A build agent built the app from that design.
- Each round's prompts are in this repo: `DESIGN-PROMPT*.md` and `PROMPT*.md`.
- We reviewed, tested each round in a real browser and on live Twitch chat, and fed the bugs we found into the next round.

## Roadmap
- **In progress: full editor.**
  - Per-part styling (name, text, badges, box, panel)
  - Frame builder (double frames, corner ornaments, pixel and beveled borders)
  - Gradient and image backgrounds
  - Name format templates
  - "My skins" (save, duplicate, export/import)
  - Undo/redo
  - Safe custom CSS
- **Later:**
  - 7TV/BTTV emotes
  - Follow and sub alerts (EventSub)
  - More skins requested by streamers

---

## License
Copyright © 2026 Korivash. **All rights reserved.**

This repository is public so people can view it and use the hosted editor. The code, design and skins may not be copied, modified, redistributed or submitted as someone else's work, including as an entry in any hackathon or contest, without written permission. Using the hosted site at https://korivash.github.io/chatskins/ to make overlays for your own stream is allowed and free. See [LICENSE](LICENSE).
