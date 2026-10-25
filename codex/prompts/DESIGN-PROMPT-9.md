Round 9 design: a PREMIUM website look + GitBook-style DOCS. You are the designer. Work only inside design/. Don't build.

The owner wants the whole website "more appealing, like mikoradio.com but black and blue". Reference screenshots of mikoradio.com (our own sister product): design/ref-mikoradio-1.png, -2.png, -3.png. Study what makes it feel premium:
- the thin announcement bar on top
- the glassy hero card with a glow, and gradient-highlighted words in the headline
- a big product-art collage with floating tilted cards around a central "now playing" monitor
- pill eyebrow labels ("TRUSTED BY 20,025 DISCORD COMMUNITIES")
- the stat tiles row (big numbers + small caps labels)
- the feature grid with gradient icon tiles, soft borders and deep shadows
- the strong CTA button + secondary outline buttons, the trust line under the CTAs
- generous spacing; Familjen Grotesk / Satoshi-style type

Recreate that QUALITY for ChatSkins in a **black + blue** palette, as our own design (don't copy Miko's pink or its layout 1:1):
- near-black #05070D
- deep navy surfaces
- electric blue #2F7BFF → cyan #38BDF8 gradients
- a small mint accent allowed

Keep a light gaming touch (e.g. a subtle grid floor, the PRESS START eyebrow) only where it helps; the overall feel is premium product, not a retro game menu.

## Pages
1. **Home:**
   - announcement bar: "New: chat-powered skins: let your viewers change your chat"
   - nav: Skins / Customize / Docs / Request + a primary "Make my overlay" CTA
   - hero: a gradient headline (e.g. "Your stream chat, *skinned*."), a short pitch, CTAs (Make my overlay / Browse 42 skins / Read the docs), and a trust line ("Free · No login · One link · Works in OBS, Streamlabs, Twitch Studio, XSplit, Meld, vMix")
   - hero art: a live collage, i.e. a central "stream monitor" with live chat cycling the Featured skins, plus 3-4 tilted floating mini skin cards (Guild Chat, Signature, Retro RPG, Bubble Lift) drawn with the real render code
   - stat tiles: 42 skins · 0 logins needed · 1 link for OBS · 100% free
   - feature grid with gradient icon tiles: game-style skins, full editor, MMO chat channels, 7TV/BTTV/FFZ emotes, alerts, chat-powered skins, transparent mode, safe read-only chat
   - "Works with" strip: TEXT badges only (no third-party logos) for OBS Studio, Streamlabs Desktop, Twitch Studio, XSplit, Meld Studio, vMix, Lightstream: "anything with a Browser Source"
   - the setup section (replace the current copy): "Meet your new Browser Source. No plugins to install. Works in OBS Studio, Streamlabs, Twitch Studio, XSplit, Meld and any app with a browser/web source." Steps: add a Browser Source → paste your overlay URL → set 1920×1080 (or 1280×720 for a 720p canvas) → place ChatSkins above your game capture.
   - FAQ, footer
2. **Skins / Editor / Request:** restyle them in the new system (same features; keep the editor ergonomics). The skins page keeps its live previews.
3. **NEW: Docs** (`/docs/`), GitBook-style:
   - a left sidebar with grouped nav, a top search box (client-side search over the page titles + headings), a right "On this page" TOC, prev/next links at the bottom, a "Copy" button on code/URL blocks, and callout boxes (Tip / Note / Warning)
   - mobile: the sidebar becomes a drawer
   - pages + an outline for each, with the full copy text written by you:
     - Getting started (60-second setup)
     - Add to your streaming app: OBS Studio · Streamlabs Desktop · Twitch Studio · XSplit · Meld Studio · vMix / others (Browser Source settings: URL, width/height, "Shutdown source when not visible" off, "Refresh browser when scene becomes active" off, custom CSS empty, FPS 30/60)
     - Choosing a skin (all groups)
     - The editor, with one page per section: Simple mode, part styling, frames, backgrounds, name format, layout, animation & effects, roles & colors, filters, My skins, custom CSS
     - MMO chat channels (how the [Officer]/says/yells rules work, and per-skin channel sets)
     - Emotes (Twitch + 7TV/BTTV/FFZ)
     - Connect with Twitch (what it reads, that the token is never stored)
     - Alerts (setup, test alerts, keeping the alerts link private)
     - Chat-powered skins (!skin, !skinvote, channel points, permissions, cooldowns, the panic button)
     - Transparent background & placing over gameplay
     - Troubleshooting: chat not showing, emotes missing, overlay cut off, wrong size, old look after update (cache), alerts not firing
     - Privacy & safety
     - Request a skin
     - FAQ
     - Changelog

## Deliverables
- A DESIGN.md "Round 9: Premium site + Docs" section: tokens (black/blue), type (Google Fonts that feel like Familjen Grotesk/Satoshi, e.g. "Familjen Grotesk" + "Inter"/"Manrope"), components, page specs, and ALL docs copy as Markdown in design/docs-content/*.md, one file per page.
- Mockups: design/home9-mockup.html, design/docs-mockup.html, design/skins9-mockup.html.

Try git add/commit; if it's blocked, say so. Print a short summary.
