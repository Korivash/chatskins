Round 10 design: SKINS THAT STAND OUT. You are the designer. Read DESIGN.md (all rounds), design/skins.json, the sheets design/sheetA-E.png and design/qa-9-skins.png. Don't build. Work only inside design/.

The owner's feedback:
1. "We need more animated ones. Animated ones would really stand out, and they should be animated on the website to preview: borders that glow, glitter effects, changing colors and more. Make at least 8 different ones."
2. "The basic stuff is plain: it's almost the same style, just recolored." The Streamer favorites / Colorful / basic skins mostly share one rounded-rectangle message box with a different color.

## Part A: 10 new ANIMATED skins (group "Animated")
Each has its own SIGNATURE MOTION, done with CSS keyframes / SVG only, cheap in OBS (animate transform/opacity/background-position/filter; avoid layout thrash; ≤ 3 animated layers per message), and with a reduced-motion fallback:
1. **Aurora:** a slowly flowing northern-lights gradient border + soft glow.
2. **Glitter Bomb:** twinkling glitter sparkles across the box + a sparkle burst on entry.
3. **Neon Pulse:** a breathing neon tube border with a flicker on new messages.
4. **Prism Shift:** a hue-cycling rainbow border and name chip (color-changing).
5. **Holo Foil:** a holographic sheen that sweeps across each message.
6. **Lava Lamp:** blobby warm gradient blobs drifting inside the panel.
7. **Electric Storm:** a crackling lightning border; brief bolts on mod messages.
8. **Starfall:** tiny shooting stars falling behind the messages.
9. **Fire Frame:** flickering flame edge (SVG turbulence or a gradient mask).
10. **Ice Crystal:** a frost shimmer and a crystal edge that "freezes in" on entry.

Each skin also gets a distinct shape/typography, not just the effect.

## Part B: make the basic skins DISTINCT
Rework the plain skins so that no two share the same silhouette. Give each one a unique SHAPE + LAYOUT + TYPE idea, for example:
- speech bubbles with real tails
- ticket stubs with a perforated edge
- sticky notes with a slight tilt
- chat as stacked name tags
- a newspaper ticker line
- receipts
- playing cards
- comic panels with a halftone dot texture
- a polaroid frame
- pill chips with avatar initials
- a typewriter page
- a handwritten-marker style
- a retro TV caption bar

Keep their existing names (and their ids, so old URLs still work), but rewrite their recipes. List every skin with its silhouette in DESIGN.md, so the builder can check that no two look alike.

## Part C: showcase motion
The skins page cards and the side monitor play the animations live (only while on screen). The home hero collage features 2-3 animated skins.

## Deliverables
- DESIGN.md "Round 10" with recipes, a keyframes spec and performance notes.
- skins.json updated: the 10 new skins + the reworked basic skins, each with a tagline and stats.
- design/animated-mockup.html, which shows every new and reworked skin animating.

Try git add/commit; if it's blocked, say so. Print a short summary.
