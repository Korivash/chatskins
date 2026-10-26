# Architecture

## Pages and modules

- `index.html` is the title screen and home demo. `js/home.js`, `js/site.js`, and `js/routes.js` handle the demo, shared site controls, and legacy URL forwarding.
- `skins.html` uses `js/skins-page.js` and `js/skin-preview.js` with `design/skins.json` for catalog selection and live previews.
- `editor.html` loads `js/editor.js` plus feature modules for settings, preview, guided setup, alerts, chat play, Frame Studio, and Place it. Shared visuals live in `css/tokens.css`, site stylesheets, and `css/skin-render.css`.
- `overlay.html` loads the chat renderer, IRC client, panel layout, emotes, frame templates, Studio renderer, alert layer, and chat-play runtime. It reads the channel but never posts chat. `?test=1` enables preview messages without IRC.
- `request.html` uses `js/request-form.js`; documentation is served from `docs/index.html` and `docs/docs.js` using `docs/nav.json` and `docs/content/*.md`.
- `readme.html` uses `js/readme.js` and `css/readme.css` for the project overview.

## Overlay link flow

1. The editor combines the selected skin with changed settings and optional feature data.
2. `js/compact-link.js` serializes the settings diff, compresses it, and writes the payload into the URL fragment. Credentials, when enabled, stay in that fragment.
3. The overlay parses the fragment through the compact settings decoder, merges the diff with the catalog skin in `design/skins.json`, then starts frame, chat-play, alert, and render setup.
4. `js/render.js` creates names, badges, emotes, and message text as DOM nodes. `js/panel-layout.js` and `js/fit.js` size the panel and retain messages that fit.

## Data and assets

- `design/skins.json` is the skin catalog; `site-media/frames/frames.json` indexes painted frame art; `site-media/parts/parts.json` indexes Frame Studio SVG parts.
- `site-media/` contains fonts, frame images, and vector parts used by the site and overlay.
- `docs/content/` is the source for the static help pages. `design/` contains design references and mockups.

## Server endpoints

`server/skin-request.mjs` runs the Node HTTP server and routes `/api/*`. `server/describe.mjs`, `server/assistant.mjs`, and `server/dream.mjs` implement the style helper, Ask ChatSkins, and custom design endpoints. `server/ai-usage.mjs` stores shared daily AI usage limits. The request endpoint forwards reviewed skin requests to the configured webhook. Dream images are stored outside the web root and served through `/api/dream-image/<id>.webp`.

## Feature locations

- IRC, emotes, rendering, and layout: `js/irc.js`, `js/emote-provider.js`, `js/render.js`, `js/panel-layout.js`.
- Alerts and Twitch EventSub: `js/alerts-*` and `js/eventsub.js`.
- Viewer chat commands and rewards: `js/chat-play-*`.
- Frame templates and illustrated frames: `js/frame-templates.js`, `js/frame-attributes.js`, `css/skin-render.css`.
- Frame Studio and placement controls: `js/frame-studio.js`, `js/studio-render.js`, `js/place-mode.js`.
- AI helpers: `js/describe-helper.js`, `js/ask-chatskins.js`, `js/dream-client.js`, and matching server modules.
