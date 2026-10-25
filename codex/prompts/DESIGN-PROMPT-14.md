Round 14 design (Astra): ILLUSTRATED PREMIUM SKINS. Write only design/round14-illustrated.md + design/round14-mockup.html (+ any SVG art under design/art14/).

**Owner:** "a lot of the themes are the same … make some like it, make some animated, and overall make the quality worth it for the judges." The attached reference image (neon kawaii-goth chat frame) shows the level we want:
- a full illustrated frame around the chat
- a big stylized "CHAT" header with drippy neon lettering and three hearts
- a cat mascot head with an x-eye peeking over the top-right corner
- hanging chains and heart charms down the sides, pentagram hearts in the corners
- glitch pixel strips along the edges, sparkles and stars
- a glowing double neon border
- colored role-badge squares before each name, and big readable names and messages

**Don't copy it.** Make ORIGINAL art in the same spirit. No Twitch logo, no third-party logos or characters (the contest bans third-party trademarks).

**Design:**
1. **An illustrated-skin engine** (spec only; Luna builds it): a skin can declare decoration layers rendered as inline SVG around/over the chat panel:
   - `header` (title art + ornaments)
   - `corners` (4 slots)
   - `edges` (repeating side/top/bottom ornaments: chains, vines, pixels)
   - `mascot` (peeks over an edge)
   - `particles` (floating hearts/sparkles/stars/snow/embers with count, speed and drift)
   - `glitch` (pixel strips that jitter)
   - `glow` (animated neon pulse)
   
   Layers scale with the panel, never cover message text, and stay inside the OBS canvas (respect the existing fit-to-panel rules). Each layer has a reduced-motion version. Everything is editable in the editor as ON/OFF + a color.
2. **A premium set of 12 skins** using the engine, each with its own original art and a clearly different silhouette. Include at least:
   - **Neon Kawaii Goth** (the reference's spirit; animated glow + falling hearts + glitch)
   - **Cozy Café** (steam, mugs, warm wood)
   - **Spooky Night** (bats, moon, fog)
   - **Cyber Samurai** (katana-edge frame, neon kanji-like abstract glyphs; don't use real kanji)
   - **Pixel Dungeon** (stone bricks, torches with flicker)
   - **Space Station HUD** (scanlines, radar sweep)
   - **Candy Land** (sprinkles, drips)
   - **Enchanted Forest** (vines, fireflies)
   - **Retro Arcade Cabinet** (marquee lights chasing)
   - **Ocean Depths** (bubbles, kelp)
   - **Winter Frost** (snowfall, icicles)
   - **Lava Forge** (embers, cracks glowing)
   
   8+ of them must be animated. For each: palette, fonts (Google Fonts only), the art for each layer (provide the SVG in design/art14/<skin>/), animation timings, and the name/badge/message styles.
3. **Readability first:** messages sit on a solid or semi-solid inner panel so text passes 4.5:1. Names are big and bold.
4. **A gallery card treatment** so these premium skins stand out on skins.html (a "Premium · Animated" tag).

**Deliver** the spec + the SVG art + a mockup page showing all 12 rendered with sample chat (static is fine, animated is better). Print a short summary.
