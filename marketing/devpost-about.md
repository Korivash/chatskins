## Inspiration
We stream on Twitch, and we play a lot of MMOs. In-game chat has personality: the gold-framed guild chat in an MMO, the blue dialog box of an old RPG, the blocky pixel chat of a sandbox game. Our stream chat overlay looked the same as everyone else's. We wanted chat on stream to feel like part of the game we're playing. We also wanted any streamer to set it up in a minute, with no account, no install and no coding.

## What it does
**ChatSkins** is a browser-based editor for Twitch chat overlays.
- Pick a **skin**: a one-click look inspired by popular game chats. Examples are *Guild Chat*, *Retro RPG Dialog Box*, *Block Craft*, *Terminal* and *Bubble Chat*.
- Then change everything: font, text and name colors, borders and frames, background and opacity, spacing, the name format (like `[Guild] [Name]: message`), animations, and how long messages stay.
- A live preview with sample chat updates as you edit. You can also type your channel name to preview your real chat.
- Press **Copy overlay URL** and paste it into OBS as a Browser Source. That's it.
- Filters hide `!commands`, bot accounts and links.

## How we built it
We built ChatSkins with **OpenAI Codex**. One Codex agent designed it: the editor layout, the skin recipes and the settings schema, plus a static mockup. A second Codex agent built the app from that design. We reviewed, tested it on a live channel, and iterated.
- **Plain HTML, CSS and JavaScript**, no build step. It runs as a static site.
- **Twitch chat** comes through tmi.js over an anonymous, read-only connection, so streamers never log in or share a token.
- **Emotes** are drawn from the message's IRC `emotes` tag, using Twitch's emote image CDN.
- **All settings live in the overlay URL** as encoded JSON. There's no server and no database: the link *is* the configuration, and new settings fall back to defaults so old links keep working.
- **Borders and frames** are pure CSS/SVG, and the fonts come from Google Fonts.

## Challenges we ran into
- **Making game-style chat without copying games.** Every skin is *inspired by* a style. There are no logos, game art, ripped textures or trademarked fonts, so we rebuilt each look from free fonts and CSS borders.
- **Safety.** Chat is user input, so messages are built from DOM text nodes and never injected as HTML.
- **One settings model for everything.** A skin is just a set of values in the same schema the editor controls. That's what lets a user start from *Guild Chat* and change any part of it.
- **Keeping the URL small** while it carries the whole configuration.

## What we learned
- Splitting the work between a *design* agent and a *build* agent made the result more consistent than one big prompt.
- Small details sell a style: name brackets, a double gold border, a pixel text-shadow.
- "No login" removes a lot of setup friction for streamers.

## What's next
- Separate styles for mods, VIPs and subs
- Highlight on mention
- A custom CSS box
- 7TV/BTTV emotes
- Follow and sub alerts through EventSub
- Saved profiles
- More skins requested by streamers
