Build version 1 of the project described in BRIEF.md. Read BRIEF.md fully first, then follow the design in design/DESIGN.md, design/skins.json and design/mockup.html exactly (layout, skins, settings schema). This folder is a new, empty git repo; work only inside it.

Technical choices (keep them):
- **Stack:** plain HTML/CSS/JavaScript ES modules, no framework and no build step. It must run as a static site (GitHub Pages) and open from a local static server.
- **Twitch chat:** load tmi.js from https://cdnjs.cloudflare.com/ajax/libs/tmi.js/1.8.5/tmi.min.js and connect anonymously and read-only (no OAuth). It reconnects on its own.
- **Files:**
  - index.html: the editor
  - overlay.html: the OBS Browser Source
  - css/
  - js/settings.js: defaults, presets, and encode/decode of the settings to the URL hash as base64url JSON. Merge with the defaults so old URLs keep working.
  - js/render.js: builds one message element from the settings plus a message. Shared by the preview and the overlay.
  - js/emotes.js: turns the IRC emotes tag into text and image parts, safe against HTML injection
  - js/filters.js: hide commands, listed bots and links
  - js/fakechat.js: fake messages with names, colors, badges and emotes for the preview
  - js/chat.js: the tmi.js wrapper
- **Safety:** never insert chat text as HTML. Build DOM nodes and use textContent only.
- **Badges:** show simple role badges (broadcaster, mod, VIP, sub) drawn in CSS or SVG, so no Twitch API token is needed.
- **Editor:**
  - Settings controls grouped as Font, Colors, Layout, Animation, Filters and Presets.
  - A live preview that updates on every change.
  - A channel name box to preview real chat.
  - A "Copy overlay URL" button and a "Reset" button.
  - Clean look; works on a laptop screen.
- **Tests:** node --test files in tests/ covering:
  - settings encode/decode round trip, plus merging with the defaults
  - emote parsing, including multiple emotes and unicode
  - filters

  Add a package.json with "test": "node --test tests/". No runtime dependencies.
- **README.md:** what it is, how to add it to OBS (Browser Source, width/height tips), how to run it locally (npx serve . or python -m http.server), the settings list, and an MIT license with copyright "Korivash". No real names anywhere.

When done: run the tests, then git add and commit with a clear message. Then print a short summary: the files, what works, and what is left for later.
