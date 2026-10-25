Round 14 build: **FRAME TEMPLATES** (the premium, illustrated look). This is the most important visual feature for the judges.

**Assets (already in the repo):**
- `site-media/frames/frames.json`: 32 transparent WebP frame images for 18 templates. Each entry is `{id, shape: tall|wide|square|webcam, file, w, h, credit, kind: chat|webcam}`. The center of every chat frame is a fully transparent window where chat goes; outside the art is transparent too.
- `site-media/frames/message-styles.json`: per-template message style notes plus the title rule.
- `design/round14-illustrated.md` + `design/art14/`: Astra's SVG "Illustrated" engine and 12 SVG skins. Build these too, as a second, lighter category ("Illustrated"), using the spec's layers. The painted frames are the headline.

**KittyVenom's spec (the co-owner; follow it):** "premade templates … that can be slightly edited so people can choose what they want easily … add a background in the middle and control the opacity, choose font style and colors … the crescent moon border could be edited to be whatever color and also animated and have customizable glow. Think simple: really easy, but customizable."

**Build:**
1. **Template engine (overlay + previews + editor):** a template skin draws its frame image around the chat panel.
   - Detect the frame's transparent inner window ONCE per image (scan the alpha channel at load and cache the inner rect as fractions), and place the chat exactly inside it with a small padding.
   - The frame scales to the panel (keep its aspect ratio; pick the shape closest to the panel's aspect: tall for side chat, wide for bottom strip, square for a box).
   - Respect the existing fit-to-panel rules (frame never off-canvas).
2. **Name plaque:** most frames have a blank plaque near the top (some of KittyVenom's and Korivash's frames have "CHAT" painted in). Render the **streamer's name** (channel by default, editable "Title text", plus an editable "LIVE CHAT" sub-label) centered on the plaque.
   - Per template, store the plaque rect (fractions) + font in skins.json. Find each one by looking at the image (top band, usually centered; the tall Neon Kawaii Goth plaque is top-left). Where "CHAT" is painted in, cover it with a plaque-colored backing so only the name shows.
   - Add a test with the rects.
3. **Simple controls (Kitty's list):**
   - **Frame color:** a hue/tint control. For the thin outline frame `crescent-moon`, a full recolor to any color (use the image alpha as a CSS mask over a solid color). For painted frames, a hue-rotate + saturation slider.
   - **Glow:** color, strength, and animation Off / Pulse / Shimmer (drop-shadow filter; GPU friendly; reduced-motion = Off).
   - **Middle background:** None / Color / Image URL, plus an **opacity** slider (default: a soft dark panel at 55% so chat is readable over gameplay).
   - **Chat style:** font preset + text color + name color mode, from a short list of good-looking presets per template (from message-styles.json).
   - All of these live in Simple mode for template skins; everything else stays under Advanced.
4. **Message styles per template** from message-styles.json (pill name tags for Sugar Static, receipt rows for Honeybyte-like cafe, phosphor + timestamps for Phantom-like, numbered rows for Abyssal-like, hex badges for Mothlight, etc.). Where a template has no note, use a clean default that matches its palette.
5. **Animated accents on top of painted frames:** each template picks 1–2 from: floating hearts, twinkling sparkles, drifting petals/snow/embers, a soft glow pulse, a flicker for lanterns/candles. They're CSS layers clipped to the frame border area, never over chat text, and reduced-motion safe. At least 10 of the 18 templates are animated.
6. **Webcam frames:** templates with a `kind:"webcam"` image get a "Matching webcam frame" link (a separate overlay URL that shows just that frame, same color/glow settings) so streamers can frame their camera to match.
7. **skins.json + gallery:** add the 18 templates as skins in a new **"Frames"** category, shown FIRST on skins.html with a "Premium" tag and an "Animated" tag where true. Add the 12 Astra SVG skins in an "Illustrated" category. Name them nicely (e.g. "Neon Kawaii Goth", "Mothlight", "Bunny Princess", "Crowned Kittens", "Sword & Shield", "Tactical", "Crescent Moon", "Demon Throne", "Haunted Manor", "Lava Forge", "Royal Court", "Star Oracle", "Solar Oracle", "Sticker Bomb", "Sugar Static", "Cozy Café", "Neon Hex", …). Gallery cards must run Test Chat inside the frame like the other cards.
8. **Credits:** README "Frame art" section: frames by Korivash and KittyVenom (made with ChatGPT image generation) and by OpenAI Codex image generation; all code by Codex. Also show the `credit` in the editor's template info line.
9. **Performance:** lazy-load frame images (only the selected one in the overlay; in the gallery only the visible cards). Images are already WebP.
10. **Tests:**
    - every frames.json entry loads, has a detected inner window covering at least 45% of the area, and has a plaque rect for chat frames
    - the overlay places chat inside the window at 1280x720 and 1920x1080 in both tall and wide panels
    - the title shows the channel name, and the editable title overrides it
    - the color/glow/background/opacity settings round-trip through compact links
    - reduced motion disables accents
    - the webcam link renders only the frame

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
