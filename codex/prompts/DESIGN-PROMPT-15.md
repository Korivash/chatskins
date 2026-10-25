Round 15 design (Astra): REDESIGN THE OPTIONS MENU (the editor's settings panel). Write only design/round15-options.md + design/round15-options-mockup.html.

**Owner:** "Are we also redoing the options menu?" Yes. Current state: design/qa-15-editor-now.png (desktop, full page) and design/qa-15-editor-mobile.png. Problems we see:
- the narrow left column and tiny vibe cards
- a long scroll of mixed controls
- frame-template controls (frame color, glow, middle background + opacity, title text, message borders) mixed in with everything else
- the step bar "1 Skin → 2 Customize → 3 Alerts → 4 Chat play → 5 Get your links" fighting with the Guided/Simple/Advanced tabs

Read editor.html, js/editor.js, js/controls.js, design/round13-simple.md and design/round14-illustrated.md first.

**Goals (streamers aren't technical; one-click and go):**
1. **Layout:** a large live preview (at least 60% of the width on desktop) with a wider, clearly grouped settings panel. On mobile, the preview is sticky at the top with the settings below.
2. **One navigation model:** a left rail or tab strip with **Look** (skin + vibe), **Style** (colors, font, size, frame controls), **Chat** (behavior: lifetime, filters, channels), **Viewers** (chat commands / channel points), **Alerts**, **Get link**. Guided/Simple/Advanced becomes a single "Show all options" switch per section instead of three modes.
3. **Big, visual controls:** swatch rows, font tiles rendered in the font, segmented buttons, sliders with live value labels, and toggles with plain-language labels. No raw dropdown lists of names.
4. **Frame skins get their own clean "Frame" card:** frame color (with a "match my brand color" button), glow (color, strength, Off/Pulse/Shimmer), middle background (None/Color/Image + opacity), title text + sub-label, message borders.
5. **A sticky bottom bar** with Undo / Redo / Reset and the primary "Get my OBS link" button, always visible.
6. Plain words, accessible (labels, focus, keyboard), the current black + blue style, and polished like a top-tier product.

**Deliver:**
- the spec: exact layout, every control with its existing setting key / element id, copy, states, and the mobile layout
- a static, interactive mockup showing desktop and mobile, with Look, Style (with a frame skin selected) and Get link
Print a short summary.
