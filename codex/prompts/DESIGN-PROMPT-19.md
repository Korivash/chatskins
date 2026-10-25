Round 19 design (Astra): **FRAME STUDIO**, letting streamers craft their own frame. The owner approved: "let people basically craft their own". Write only design/round19-studio.md, design/round19-studio-mockup.html and the parts library SVGs under design/parts19/.

Read design/round14-illustrated.md (the SVG illustrated engine), design/round15-options.md (the editor tabs) and codex/prompts/PROMPT-18.md ("Place it" mode, being built now; the Studio builds on its drag/resize/snap system).

**Studio concept:** a new "Studio" tab (or a "Craft your own" entry on the Look tab).
- Start from Blank or from any frame.
- Add PARTS from a library panel, then drag, resize, rotate, flip, recolor, layer (bring forward/back), duplicate and delete them on the frame canvas around the chat window.
- The chat window itself is a part (resizable). The name plaque is a part (with the streamer name).
- Save as "My frame" (local), and the design goes into the compact OBS link (keep it small: part ids + transforms + colors, never SVG markup).

**Parts library (original SVG, recolorable via CSS variables --c1/--c2/--glow, ~60 parts, each under 3 KB):**
- **Borders:** a 9-slice border band that stretches cleanly. Neon tube, double gold filigree, carved wood, pixel bricks, ribbon/lace, chain, vines, ice, metal plate, sticker tape, plain glow line. Each is 1 part.
- **Corners:** ornaments that mirror per corner (filigree, hearts, skulls, stars, leaves, gems, bolts, bows).
- **Plaques:** scroll, banner, nameplate, neon box, wooden sign, ribbon, chalkboard, holo tag.
- **Mascots/stickers:** cat head, bunny, ghost, moth, bat, crown, heart charm, star, moon, mushroom, controller, sword, potion, dragon wing, cloud, coffee cup, flower, skull (cute), crystal. Cute, family-friendly, original.
- **Effects** (animated, reduced-motion safe): sparkles, floating hearts, snow, embers, petals, glitch strips, glow pulse, shimmer sweep, scanlines.

**UX:**
- Big, simple, touch-friendly: a parts drawer with search + categories; a selected-part toolbar (color, size, rotate, flip, layer, delete); snapping + guides (from Place it); undo/redo; "Randomize" (a tasteful random combo from a chosen vibe); 6 one-tap "starter kits" (Cozy, Spooky, Cute, Neon, Royal, Gamer).
- Performance: the overlay renders parts as inline SVG/CSS, at most ~25 parts.

**Deliver:** the spec (data model, link encoding size budget, UI, part list with ids), the SVG parts library, and an interactive mockup where you can add/move/recolor parts around a sample chat. Print a short summary.
