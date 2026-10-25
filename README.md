# Chat studio

A static Twitch chat overlay editor with ten editable style presets. Settings are encoded in the overlay URL; chat connects anonymously and read-only through tmi.js. No backend, account, OAuth, or runtime package dependency is required.

## Add to OBS

1. In the editor, enter a Twitch channel and choose a skin or adjust its settings.
2. Select **Copy overlay URL**.
3. In OBS, add a **Browser Source**, paste the URL, and set the source size to your canvas (for example, 1920 × 1080). A 1280 × 720 source also works; the layout scales with the Browser Source.
4. Keep the Browser Source background transparent. Use the editor preview to tune text size, stack width, and edge inset against your scene.

The overlay uses Twitch IRC emote positions and Twitch's static emote CDN. It cannot show chat when Twitch or the network is unavailable. The connection is read-only and anonymous.

## Run locally

Serve this folder at its root so the editor can load `design/skins.json`:

```sh
npx serve .
# or
python -m http.server
```

Open the local server URL in a browser. A static server is required for ES modules and preset loading; `file://` is not supported.

## Settings

The overlay URL hash stores the full version 1 settings object as base64url UTF-8 JSON. Invalid or unknown fields fall back safely. All lengths are source pixels.

| Group | Settings |
|---|---|
| Font | `fontFamily`, `fontSize`, `fontWeight`, `lineHeight` |
| Text & Colors | `textColor`, `nameColorMode`, `nameColor`, `systemColor`, `nameFormat`, `showBadges`, `outlineWidth`, `outlineColor`, `shadowEnabled`, `shadowColor`, `shadowOpacity`, `shadowBlur` |
| Border | `borderStyle`, `borderColor`, `borderWidth`, `cornerRadius` |
| Background | `backgroundColor`, `backgroundOpacity`, `backgroundScope` |
| Layout | `paddingX`, `paddingY`, `messageSpacing`, `maxMessages`, `messageLifetime`, `direction`, `alignment`, `overlayWidth`, `edgeInset` |
| Animation | `animationIn`, `animationDuration` |
| Filters | `hideCommands`, `hideBots`, `botNames`, `hideLinks` |
| Channel | `channel` |

Presets are in `design/skins.json`. Tests run with `npm test` (Node.js only).

## License

MIT License

Copyright (c) Korivash

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
