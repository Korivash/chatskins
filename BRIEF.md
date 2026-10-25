# Brief for Codex: customizable Twitch chat overlay (TwitchCon hackathon)

The owner's Codex agent builds this. The hackathon wants the Codex session ID, so the code must come from Codex.
Must be a NEW project (started after 10/23). It must connect to Twitch. Deadline 2026-11-02 2pm PT.

## What it is
A chat overlay that a streamer adds to OBS as a Browser Source. A settings page lets them change how chat looks:
fonts, colors and everything else. Version 1 = the basics, done well. We keep adding to it after.

## Version 1 scope (one night)
1. **Overlay page** (`overlay.html`):
   - Joins a channel's chat read-only and anonymously with tmi.js. No login, no backend.
   - Shows messages with username, badges and Twitch emotes. Emote positions come from the IRC `emotes` tag; images come from `static-cdn.jtvnw.net`.
   - Transparent background.
2. **Editor page** (`index.html`):
   - Settings on the left, a live preview on the right.
   - The preview uses a fake-chat generator, plus real chat once a channel is typed in.
   - A "Copy overlay URL" button.
3. **Settings live in the URL** (base64 JSON in the hash), so the overlay URL is the whole config. No database, no accounts.
4. **Settings in v1:**
   - Font: Google Fonts picker plus system fonts; size and weight.
   - Colors:
     - username: use the Twitch color or a fixed one
     - message text
     - message background/bubble: color plus opacity
     - outline/shadow
   - Layout:
     - corner radius, padding, spacing
     - max messages on screen
     - message lifetime (fade out after N seconds, or never)
     - direction (new at bottom or top) and alignment
   - Animation in: none, fade, slide or pop.
   - Filters:
     - hide commands (`!xyz`)
     - hide listed bots (e.g. Nightbot, StreamElements)
     - hide links
5. **Chat skins: the headline feature (owner 2026-10-25).** One click restyles the whole chat to look like a popular game's or app's chat. After that, everything stays editable: font, text and colors, border style, background, and name format.
   - Skins are INSPIRED BY each style: no logos, game art, ripped textures or trademarked fonts. Use free Google-Fonts look-alikes and CSS/SVG borders. Use generic names, not game trademarks, e.g.:
     - "Guild Chat" (WoW-like: dark see-through box, thin gold frame, `[Guild] [Name]: text` with green guild text)
     - "Fantasy MMO" (FFXIV-like)
     - "Block Craft" (Minecraft-like pixel font, grey box)
     - "Old-School MMO" (yellow text on brown)
     - "Battle Arena" (MOBA-like)
     - "Battle Royale"
     - "Retro RPG Dialog Box" (JRPG blue window with a white border)
     - "Terminal"
     - "Bubble Chat"
     - "Clean"
   - A skin = a settings object (plus optional CSS border pieces), so users can start from one and change anything.
   - The editor shows skin cards with a small live sample of each.
6. **Static site.** Deploy to GitHub Pages or Netlify. Short README: what it is, OBS setup steps, how to run locally.

## Later (not tonight)
- Per-role styles (mod, VIP, sub)
- Custom CSS box
- Highlight on mention
- Sound on message
- Alerts (follows/subs need EventSub + auth)
- 7TV/BTTV emotes
- Saved profiles

## Done means
- The overlay works in an OBS Browser Source on Kitty's real chat.
- Settings changes show live in the preview.
- The copied URL reproduces the exact look.

## Demo and entry
- YouTube demo under 3 minutes (public or unlisted): change the font/colors in the editor, paste the URL into OBS, show live chat.
- Repo link, with no real names anywhere.
- Codex session ID.
- Claude (VPS lead) can help with testing, the demo recording and the Devpost text.
