You are the designer for this project. Read BRIEF.md fully first. Do NOT build the app; Codex builds it after you. Work only inside this folder.

Make the design package the builder will follow:

1. **design/DESIGN.md**
   - **Editor page layout:** settings panel left, live preview right. A skin gallery at the top of the panel, then groups for Font, Text & Colors, Border, Background, Layout, Animation and Filters. Plus the "Copy overlay URL" and Reset buttons. Show how it looks at 1280x720 and 1920x1080.
   - **The editor's own look:** colors, type and spacing. Clean and modern, dark by default.
   - **Every chat skin from the brief:**
     - font (Google Fonts only)
     - sizes
     - text, name and system colors
     - name format (e.g. `[Guild] [Name]: text`)
     - background and opacity
     - border/frame recipe in pure CSS or inline SVG (corner pieces, double lines, bevels, pixel borders)
     - shadow/outline
     - message spacing
     - animation in
   - **Rule:** no logos, game art, textures or trademarked fonts, and no game names in the UI. Skins are inspired-by styles with generic names.
   - **Settings schema:** every setting key, its type, default and range. A skin = values for these keys, plus optional border CSS.
2. **design/skins.json:** each skin as a settings object in that schema.
3. **design/mockup.html:** one static page (no JS framework) with a sample of every skin (5 fake messages each, with a mod, a sub and an emote placeholder) and the editor layout. This lets us see the design before the build.

When done, git add the design/ folder and commit "Design: editor layout, chat skins, settings schema". Print a short summary.
