Round 5 design. You are the designer. First read research/TOP-CHAT-UIS.md (a fresh web survey of the most popular Twitch chat overlays and the looks streamers love), then BRIEF.md, design/DESIGN.md and design/skins.json. Don't build: Codex builds after you. Work only inside design/ and research/.

The owner wants this to POP: "take the top Twitch chat overlays and redesign them into our own, and add them to the default styles."

## 1. 10-12 new "Streamer favorites" skins
Each one is inspired by a look the research shows streamers love, for example:
- bubble chat
- vertical name tags
- clean minimal
- glassy blur
- neon outline
- sticker/pill names
- chat cards with avatars-style initials
- comic speech bubbles
- terminal/hacker
- kawaii pastel
- big-name "announcer" style
- slanted esports bars

Rules:
- **Our own redesign:** never copy another tool's CSS, assets, names or exact layout. No logos, no trademarked fonts, Google Fonts only, CSS/SVG frames.
- **Generic names** that sound like ours (e.g. "Pastel Pop", "Glass Card", "Name Tag", "Esports Slash", "Comic Burst").
- Every new skin must look great on a real stream: readable over busy gameplay (outline/shadow/backing), with strong color and personality.

## 2. Polish the existing 22
The owner said the round 1 Guild Chat look is "awesome". Bring the rest up to that level: give every game style a distinctive frame, name format and color story. Fix any that look too similar to each other.

## 3. Gallery order
- The first group is "Streamer favorites".
- Mark 6 "Featured" skins that show on top for the judges' demo.

## 4. Feature ideas from the research
From the research's "missing features" list, pick the top 5 that need NO login (anonymous IRC). Specify them in DESIGN.md (settings keys, defaults, UI), e.g.:
- pronoun-free name styling
- first-time-chatter highlight from IRC tags
- emote-only big emotes
- message grouping by user
- max line length / truncation

## 5. Must-have from the research: 7TV / BTTV / FFZ emotes (no login)
Specify it in DESIGN.md:
- **Channel id:** taken from the IRC ROOMSTATE `room-id` tag.
- **Fetch the public channel and global emote sets:**
  - 7TV: `https://7tv.io/v3/users/twitch/{id}` + `https://7tv.io/v3/emote-sets/global`
  - BTTV: `https://api.betterttv.net/3/cached/users/twitch/{id}` + `/3/cached/emotes/global`
  - FFZ: `https://api.frankerfacez.com/v1/room/id/{id}` + `/v1/set/global`
- **Behavior:** cached in memory, refreshed every 10 minutes. Text tokens match whole words. A toggle exists per provider. Graceful fallback to text.
- **Emote-only messages:** shown with bigger emotes.

## 6. Editor polish (the editor looks rough right now)
Specify a polished editor:
- **Labels:** human labels for every control, never raw keys ("y", "enabled", "blur" → "Shadow offset Y", "Glow on", "Glow blur").
- **Controls:**
  - styled toggles instead of browser checkboxes
  - color swatches with alpha
  - sliders that show their value + unit
- **Layout:** group related controls (Font / Color / Effects) inside each part, with collapsed advanced rows.
- **Search box:** sticky, and it must not cover the content.
- **Every section:** one "reset section" link.

## Deliverables
Update design/DESIGN.md (a "Round 5" section), design/skins.json (all skins, new + polished) and design/mockup.html (show every skin, Featured first). Try git add/commit; if it's blocked, say so. Print a short summary listing the new skins and the 5 features.
