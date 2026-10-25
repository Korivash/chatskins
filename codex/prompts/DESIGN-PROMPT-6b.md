Round 6b design: make the website UNFORGETTABLE. You are the designer. Read your round 6 design (DESIGN.md "Round 6", landing-mockup.html, editor-mockup.html, the SVG marks), the research and skins.json. Don't build: Codex builds after you. Work only inside design/.

The owner reviewed round 6: it's clean but looks like a generic SaaS landing page. This is being JUDGED ($25k, TwitchCon stage; "Design: is it easy to use and fun to watch?" is 1/4 of the score). The theme must be super unique and memorable, yet still dead simple to use.

## Concept: "the site IS a game menu"
ChatSkins feels like booting a video game. Keep it original: no copied game UI, logos or fonts; Google Fonts and pure CSS/SVG.

### 1. Home = title screen (`/`)
- An animated starfield/grid "attract mode" background, CSS only.
- A big glowing ChatSkins logo (reuse/upgrade your SVG mark).
- A blinking **"PRESS START"**: click, Enter or Space goes to Skins.
- A live demo chat cycling the Featured skins, framed like an in-game HUD.
- A short menu:
  - **Start** (Skins)
  - **Customize** (Editor)
  - **Request a skin**
  - **How to use in OBS**
  - **About**
- Arrow keys and mouse move a selector cursor with a small "select" bleep. Sound is OFF by default, with a speaker toggle; WebAudio synth only.
- Below the fold, keep it short: 3-step how it works, the features, FAQ, and a footer ("Built with OpenAI Codex for the Codex x TwitchCon Hackathon", GitHub, © Korivash).

### 2. Premade skins = character select (`/skins.html`), its OWN page
- A grid of skin "portraits": live mini chats with group tabs (Streamer favorites / Game styles / Animated / Colorful).
- Hover or arrow keys select. A big side panel shows the selected skin running live fake chat, its name, and fun "stat bars" (Readability, Flair, Motion, Retro), each a 1-5 value per skin (add it to skins.json).
- Two buttons:
  - **"Use this skin"** opens a 2-step modal: type your Twitch name or Connect with Twitch → copy the OBS link. No editor needed.
  - **"Customize"** opens the editor with that skin.

### 3. Editor = loadout screen (`/editor.html`), its own page
- The same Simple mode (6 controls) and Advanced switch from round 6, restyled as a game "loadout/customize" screen: tabs as game menu tabs, controls as polished game sliders/toggles.
- The preview sits in the center, framed like a stream monitor.
- Step 3 "Get your link" stays obvious.

### 4. Request a skin = quest board (`/request.html`, also a modal from anywhere)
- A form styled as a quest posting. Fields:
  - skin name idea
  - inspired by (game/style)
  - colors (with color pickers)
  - font vibe
  - frame idea
  - description
  - Twitch channel (optional)
  - Discord name (optional)
- "Post quest" sends it to our backend: `POST /api/skin-request` (JSON).
- Success state: "Quest posted! The guild has been notified." Error/rate-limit states included.
- Under it, a small link: "Or join us on Discord" (`https://discord.gg/YxFRuEPSxZ`).

### 5. Backend spec: POST /api/skin-request
Specify it in DESIGN.md:
- Field limits: name ≤ 60, inspired ≤ 80, colors ≤ 80, font ≤ 60, frame ≤ 120, description ≤ 800, channel ≤ 25, discord ≤ 40.
- A honeypot field.
- Rate limit: 3 per IP per hour and 50 per day in total.
- The server forwards it to a Discord webhook as an embed. The webhook URL lives server-side only.
- Strip mentions (@everyone/@here/<@...>) and links stay unembedded.
- Responses: 200 `{ok:true}`, 400 field errors, 429 rate limited.

### 6. Shared
- One design-token file for the whole site.
- Consistent nav: a game-style top bar with Home / Skins / Customize / Request.
- Accessibility: AA contrast, keyboard, visible focus, reduced motion. Fast: no big images.

## Deliverables
- DESIGN.md: a "Round 6b: Game-menu website" section.
- skins.json: stat values for every skin.
- New mockups: design/home-mockup.html, design/skins-mockup.html, design/editor-mockup.html (updated), design/request-mockup.html.

Try git add/commit; if it's blocked, say so. Print a short summary.
