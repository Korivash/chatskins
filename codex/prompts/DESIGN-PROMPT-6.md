Round 6 design: the WHOLE WEBSITE, judge-ready. You are the designer. Read BRIEF.md, research/TOP-CHAT-UIS.md, design/DESIGN.md (all rounds) and the current index.html/css first. Don't build: Codex builds after you. Work only inside design/.

Context: this is our entry for the Codex x TwitchCon Hackathon ($25k prize, top 5 shown at TwitchCon, judged Nov 5-15). Judges will open chatskins.korivash.com cold, for maybe 60 seconds. It must look like a polished product from a real studio, and a non-technical streamer must get a working overlay in under 1 minute. Right now it looks like a developer tool.

## 1. Brand
- **Logo:** a simple wordmark for "ChatSkins" plus a small icon (pure SVG, original).
- **Palette:** brand palette (dark theme first, high contrast, one signature accent).
- **Type:** a type pair (Google Fonts).
- **Components:** spacing scale, corner radii, shadows, button/input/toggle/slider/card styles, focus states. Write them as CSS custom properties in DESIGN.md so the builder uses tokens everywhere.

## 2. Landing page (`/`)
- **Hero:** a big headline and a one-line pitch. A LIVE animated demo overlay plays over a stream-like background (an abstract "gameplay" scene in CSS/SVG; no game art) and cycles through the Featured skins every few seconds.
  - Primary CTA "Make my overlay" → the editor.
  - Secondary CTA "See all skins".
- **How it works:** 3 steps with icons. Pick a skin → make it yours → paste one link in OBS.
- **Skins showcase:** a grid of live mini-previews with group filters (Streamer favorites / Game styles / Animated / Colorful). Clicking a skin opens it in the editor.
- **Features:**
  - no login
  - 7TV/BTTV/FFZ emotes
  - full editor
  - transparent backgrounds
  - safe (read-only chat)
  - fast/light in OBS
  - free
- **OBS guide:** short, illustrated steps (drawn UI mockups in HTML/SVG, not screenshots of OBS).
- **FAQ:** 6 questions, e.g. "Does it need my Twitch password?", "Will it slow my stream?", "Can I use it with Streamlabs/StreamElements?"
- **Footer:** "Built with OpenAI Codex for the Codex x TwitchCon Hackathon", a GitHub link, and "© Korivash". No real names.

## 3. Editor (`/editor.html`, or the same page with routing), redesigned around a SIMPLE MODE by default
- **Step bar at the top:** 1 Skin → 2 Customize → 3 Get your link. The current step is highlighted, and you can always go back.
- **Step 1:** big visual skin cards with live samples, grouped and searchable.
- **Step 2, Simple mode:** only 6 controls, each with a big friendly label:
  - font
  - text size
  - accent color
  - background (solid / glass / transparent)
  - frame on/off
  - entrance animation

  An "Advanced editor" switch reveals the full per-part editor (the current one, restyled with the tokens).
- **Step 3:**
  - "Connect with Twitch" as a big primary button, or "type your Twitch name".
  - Copy the overlay URL with a big "Copied!" toast.
  - An inline OBS mini-guide.
  - A "Open test overlay" link.
- **Preview:**
  - A realistic stream backdrop by default (switches: stream / dark / light / checker), with fake chat running.
  - A 16:9 frame with the safe area.
  - A phone-width layout must still work (stacked).
- **Microcopy:** friendly and short. Empty and error states designed (bad channel name, Twitch login cancelled, offline).

## 4. Polish
- **Motion:** 150-250 ms ease-out on hover/press/step changes; respect reduced motion.
- **Accessibility:** WCAG AA contrast, keyboard navigable, visible focus, aria labels.
- **Performance:** the landing page loads fast (no heavy images; the hero demo is CSS-only).

## Deliverables
- DESIGN.md: a "Round 6: Website" section with tokens, the layout specs and the copy text.
- design/landing-mockup.html: a static landing page mockup.
- design/editor-mockup.html: a static editor mockup showing all 3 steps and the Advanced view.

Try git add/commit; if it's blocked, say so. Print a short summary.
