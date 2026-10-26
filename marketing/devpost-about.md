## Inspiration
We stream on Twitch, and we play a lot of MMOs. In-game chat has personality: a guild chat with gold-trimmed channels for Guild, Officer and Party, the blue dialog box of an old RPG, the blocky chat of a sandbox game. Our stream chat overlay looked like everyone else's. We wanted chat on stream to feel like part of the game we're playing.

We also wanted it to be truly easy. A lot of streamers aren't technical. So the goal was: **pick a look, click once, paste one link into OBS.** No account, no install, no code.

## What it does
**ChatSkins** ([getchatskins.com](https://getchatskins.com)) is a free, browser-based editor for Twitch chat overlays.

- **52 skins**, each with its own layout, not just a recolor. There are 24 game-style skins (Guild Chat, Retro RPG Dialog Box, Block Craft, Space Command, Battle Arena…), 12 streamer favorites, and **12 animated skins** (Aurora, Glitter Bomb, Electric Storm, Starfall…).
- **A full editor.** Simple mode for a quick setup and advanced mode for everything: fonts, colors, frames, backgrounds, name formats like `[Guild] Name: message`, spacing, entrances and exits, message lifetime and role colors. A live **Test Chat** preview with fake messages shows every change instantly, and none of it is ever sent to real Twitch chat.
- **Guild Chat channels.** Like a real MMO chat, messages are sorted into channels: mods post in *Officer*, everyone else in *Guild*, and first-time chatters get a welcome line.
- **Chat play.** Viewers change the overlay live:
  - `!skin guild` swaps the skin, and `!skinvote` starts an on-screen vote.
  - Channel point rewards trigger effects like emote rain.
  - The streamer picks which skins are allowed, sets cooldowns and who can use it, and has a freeze button.
- **Alerts** for follows, subs, resubs, gift subs, cheers and raids, styled to match the skin, through Twitch EventSub.
- **7TV, BTTV and FFZ emotes**, plus Twitch emotes.
- **Transparent by default**, so it sits cleanly over gameplay. It works in OBS, Streamlabs, Twitch Studio and any app with a browser source.
- **Docs** for every feature, and a **Request a skin** form that goes straight to our Discord.

## How we built it
**Korivash** came up with the idea and directed every round from Discord: what to build next, what looked wrong, what to cut. **OpenAI Codex** did the building, with a small team of agents with separate jobs:

| Agent | Model | Job |
|---|---|---|
| **Astra** (designer) | `gpt-6-astra` | Turns the brief, the research and the bug reports into layouts, skin recipes, the settings schema and HTML mockups |
| **Luna** (builder) | `gpt-6-luna` | Writes all the app code and the tests, in one long-running build thread so it keeps the whole codebase in mind |
| **Luna** (researcher) | `gpt-6-luna` + web search | Surveyed the most popular Twitch chat overlays before the big redesign |
| **Claude** (lead agent) | Claude | Turns Korivash's feedback into prompts, tests every build in a real browser, measures what's wrong, commits and deploys |

The loop was always the same: **design → build → test → measure → fix.** Every task is one prompt file in the repo (117 of them), and every Codex session ID is logged next to its prompt and its commit. Over **40 Codex sessions and 264 commits**, Luna wrote **36 test files**. After each round the lead rendered every skin through the real OBS overlay in headless Chromium and checked the screenshots by eye.

**The stack is deliberately simple:**
- Plain HTML, CSS and JavaScript modules: no framework, no build step, no dependencies. It's a static site.
- Chat comes in over an **anonymous, read-only Twitch IRC WebSocket**, so a streamer only types their channel name. Luna wrote its own small IRC client, because the usual library has no browser build.
- **The overlay link is the whole configuration.** All settings are JSON, encoded as base64url in the URL hash. There's no database and no account, and old links keep working because new settings fall back to defaults.
- Alerts and channel points use **Twitch OAuth (implicit grant) + EventSub WebSockets + Helix**. The token lives only in the streamer's own private overlay link and never touches our server.
- Frames and effects are pure CSS and SVG with free Google Fonts. There's no game art, no logos and no ripped textures: every skin is *inspired by* a style, not copied from a game.

## Challenges we ran into
- **Fitting chat into the panel.** Frames, outer borders and alerts kept pushing messages off screen or shrinking the panel to zero height. We fixed it by measuring the real layout in Chromium every round, putting the exact pixel numbers in the prompt, and adding regression tests for each case.
- **A skin swap that erased chat.** When a viewer typed `!skin`, the whole chat history vanished. The overlay rebuilt its root element and threw the messages away. Now the overlay keeps a list of message *models* and re-renders them in the new skin, so the swap is a crossfade instead of a wipe.
- **Transparent backgrounds vs. readability.** Making every overlay transparent by default made the light-card skins (dark text on a pale bubble) almost invisible over a dark game. We now check every skin's text against a dark stream backdrop using the WCAG contrast ratio:

$$
\text{contrast} = \frac{L_{\text{light}} + 0.05}{L_{\text{dark}} + 0.05} \ge 4.5
$$

where $L$ is relative luminance. Skins that fail keep their card behind the text, and a test enforces this for all 52 skins.
- **Caching.** Cloudflare happily served a mix of old and new JavaScript modules after a deploy. Every deploy now comes from a tested git commit, and each module import gets a version tag.
- **Making game-style chat without copying games:** recreating the *feel* of a guild chat or an RPG dialog box with only fonts, borders and color.
- **Safety:** chat is user input, so every message is built from DOM text nodes and never injected as HTML.

## What we learned
- **Splitting design and building between two agents** gave far more consistent results than one big prompt. The builder always worked against a picture, not a guess.
- **Measure, don't describe.** "The frame is broken" got vague fixes. Exact pixel measurements from the browser, pasted into the prompt, got a correct fix the first time.
- **Tests aren't enough for visual work.** Some bugs only showed up by rendering every skin and looking at it.
- **Small details sell a style:** name brackets, a double gold border, a pixel text-shadow, the right channel color.
- **"Login optional" removes most of the setup pain** for streamers. Login is only needed for the features Twitch requires it for: alerts and channel points.

## What's next
- More skins, starting with the ones streamers request through the site
- Saved skin profiles that sync between devices
- A shareable skin gallery made by the community
