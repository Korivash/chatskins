Round 2 design. You are the designer. Read BRIEF.md and design/DESIGN.md (your round 1 design) first. Don't build the app: Codex builds it after you. Work only inside this folder.

The owner loved round 1 ("the WoW-style Guild Chat one is awesome"). Now he wants **more game styles, animated skins and colorful skins.**

## 1. Add 12 new skins
Same rules as round 1: inspired-by only, generic names, Google Fonts, pure CSS/SVG frames, no logos/art/textures/trademarked fonts or game names.
- **Cyber City:** neon magenta/cyan, glowing frame that pulses, a short glitch on entry.
- **Arcade Cabinet:** pixel font, CRT scanlines, name colors that cycle through a rainbow.
- **Space Command:** sci-fi HUD in cyan, angled corner brackets, a thin scanning line.
- **Monster Trainer:** handheld-RPG white box with a thick rounded border, typewriter text.
- **Dungeon Crawler:** stone-grey panel with a bevel, warm torch-flicker glow.
- **Cozy Farm:** wood-board panel, warm cream text, a soft bounce in.
- **Horror Survival:** dark, blood-red typewriter text, a faint flicker.
- **Hero Shooter:** angled orange/white slabs, fast slide in.
- **Kart Racer:** bright, bubbly, colorful pills, a bouncy pop in.
- **Candy Pop:** rainbow gradient bubbles, a sparkle on new messages.
- **Vaporwave:** pink/teal gradient, slow color drift.
- **Rainbow Border:** clean text inside an animated rainbow gradient border.

## 2. Add new animation and color settings to the schema
Give each one its key, type, default and range.
- **Border effect:** none, glow, pulse, animated gradient, rainbow cycle. Has a speed setting.
- **Name effect:** none, rainbow, gradient (two colors), glow.
- **Text effect:** none, typewriter, wave on entry, shake for mod messages.
- **Entrance animations:** add bounce, zoom and glitch.
- **Background effects:** none, scanlines, slow gradient drift, sparkles on new message.
- **Role colors:** separate name colors for broadcaster, mod, VIP and sub.
- **Mention highlight:** a color for messages that mention the channel name.
- **Reduced motion:** all animations respect prefers-reduced-motion, plus a "Reduce motion" toggle.

Animations are CSS keyframes only; no heavy JS loops. Keep CPU low, because this runs in OBS for hours.

## 3. Editor
- Group the skin gallery into "Game styles", "Animated" and "Colorful". The old 10 skins + the new 12 = 22.
- Skin cards show a small live (animated) sample.

## Deliverables
Update design/DESIGN.md (new sections), design/skins.json (all 22 skins) and design/mockup.html (add samples of the new skins, animations running). Then git add design/ and commit. If git is blocked in your sandbox, say so and stop; the lead commits it. Print a short summary.
