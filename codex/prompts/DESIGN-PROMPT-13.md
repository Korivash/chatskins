Round 13 design (Astra): make customizing DEAD SIMPLE for people who don't know what they're doing. Write only design/round13-simple.md + design/round13-simple-mockup.html.

**Owner:** "make the settings more simple, keep everything the same but make it really easy to customize everything for somebody who doesn't know what they are doing". Streamers love one-click, go-live tools. Every existing setting must stay available, just not in the way.

Read editor.html, js/editor.js, js/controls.js, design/DESIGN.md, design/round11-setup.md and design/skins.json first.

**Design:**
1. **"Make it mine" guided start** (default view for first-time visitors):
   - 3 questions with big tappable visual cards:
     - "What's your vibe?": Cozy / Hype / Spooky / Clean / Gamer / Cute, each previewing live.
     - "Your colors": 6 big palettes plus "Use my own color" (one color picker that derives the rest).
     - "How big?": S / M / L, shown on a mock 1080p stream frame.
   - Each answer immediately restyles the live preview. A "Done, get my link" ending flows into the round 11 one-link setup.
   - Map each answer to real settings keys (define the exact mapping table).
2. **Visual pickers replace dropdowns** in Simple mode: fonts shown as rendered sample text tiles; frames/borders as thumbnails; entrance animations as tiny looping previews; backgrounds as swatches (Transparent first, "Recommended").
3. **"Luna's tip"**: a small friendly guide box (a static, rule-based helper, no AI service) that changes per section with one plain sentence plus a "Do it for me" button for the common fix:
   - "Hard to read on bright games? Add a soft background" → applies it
   - "Big text for small screens" → applies it
   - etc.
   Write 12+ tips with their triggers and actions.
4. **Three levels:** Guided (the 3 questions) → Simple (the visual pickers, ~10 controls) → Advanced (everything that exists today, unchanged). There's always a "Start over" and an "Undo".
5. Plain words everywhere, mobile-friendly, the current black + blue style, and accessible (keyboard, labels, contrast).

**Deliver** the spec (layout, exact copy, settings mapping, tip rules, states) + a static mockup of the 3 questions, the Simple pickers and a Luna tip. Print a short summary.
