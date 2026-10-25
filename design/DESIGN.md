# Chat overlay design handoff

This is a design package, not the application. `mockup.html` is a static review sheet with an editor composition and 22 five-message specimens. It has no chat connection, URL logic or functioning settings. `skins.json` is the complete preset data; no preset relies on hidden defaults. BRIEF.md is the product source. The requested gallery-first grouping supersedes the older group order in PROMPT.md.

## Design direction

An instrument for composing chat: a compact, left-aligned control rail alongside a generous transparent stage. The one expressive element is the skin gallery: real typography and frame samples, not decorative icons. Controls use a quiet blue slate palette so very different chat treatments remain easy to compare. No promotional hero, ornamental artwork or unrelated dashboard cards.

Editor tokens: canvas **#101722**, panel **#182230**, raised controls **#222F40**, dividers **#34465E**, primary text **#F2F5FA**, secondary text **#AFBDD0**. Interactive accent **#A9CAFF**, on-accent **#14243A**, focus **#F4D38D**. DM Sans from Google Fonts, weights 400/500/600/700. Title 20/26 px 700; section title 14/20 px 700; labels/body 14/20 px 400; captions 12/18 px 500. Use a 4 px spacing unit: 8 within controls, 12 between fields, 16 within sections, 24 between major areas. Inputs/buttons 40 px tall, 6 px radius. Cards 8 px radius; never apply a global radius to chat. Borders 1 px. Focus ring 2 px with 2 px offset. Disabled text stays legible; explain unavailable actions inline.

## Editor layout

All coordinates below are CSS pixels at 100% zoom. App header 64 px, settings rail 400 px including right border. Header holds “Chat studio”, a small “Overlay editor” descriptor, and a “Design preview” label in the static artifact. The runtime header needs no design label. Settings rail: top gallery (two columns, five rows, 8 px gap, cards 172 × 76 px at this width), followed by **Font, Text & Colors, Border, Background, Layout, Animation, Filters**. Gallery and groups share one independent vertical scroll area with 24 px side padding. Font starts open; other groups collapse with native disclosure behavior. A permanently visible 80 px footer contains primary “Copy overlay URL” and secondary “Reset”. The footer never overlays controls.

The right side has a 72 px preview toolbar with channel input and “Sample chat” / connection status, then a padded preview area. The channel is not a gallery control. Entering a valid channel starts real preview; when blank use samples. Show “Connecting…”, “Live: channel”, or “Couldn’t connect. Showing sample chat.” explicitly; never silently label fake chat live. Keep settings editable during reconnects.

### 1280 × 720

```text
┌────────────────────────── 1280 ──────────────────────────┐
│ Chat studio                                header 64    │
├──────── 400 ────────┬──────────────── 880 ───────────────┤
│ scroll area 576     │ Channel [____________] Sample chat │ 72
│ Skin gallery       ├────────────────────────────────────┤
│ 2 × 5 cards        │ 24 px inset                        │
│ Font               │ ┌──────── stage 832 × 468 ───────┐ │
│ Text & Colors …    │ │ checkerboard / chat at bottom │ │
│ (scroll to groups) │ └───────────────────────────────┘ │
├────────────────────┤ source size + transparency caption│
│ Copy URL | Reset   │                                    │
└──── footer 80 ─────┴────────────────────────────────────┘
```

Right stage represents a **1280 × 720 OBS source**, scaled uniformly to 832 × 468 (0.65). Available preview body is 880 × 584. Stage plus 18 px caption and 12 px gap fits with 24 px top/bottom padding. Stage top is y=160. Chat retains source-pixel sizing: default 480 px stack width becomes 312 px on this stage; 22 px text becomes 14.3 px. Do not shrink settings controls with the stage.

### 1920 × 1080

```text
┌────────────────────────── 1920 ──────────────────────────┐
│ Chat studio                                header 64    │
├──────── 400 ────────┬──────────────── 1520 ──────────────┤
│ scroll area 936     │ Channel [____________] Sample chat │ 72
│ Skin gallery       ├────────────────────────────────────┤
│ 2 × 5 cards        │ 24 px inset                        │
│ Font               │ ┌─────── stage 1472 × 828 ───────┐ │
│ Text & Colors      │ │                                │ │
│ Border             │ │        transparent stage       │ │
│ Background …       │ │ chat stack                     │ │
├────────────────────┤ └────────────────────────────────┘ │
│ Copy URL | Reset   │ source size + transparency caption│
└──── footer 80 ─────┴────────────────────────────────────┘
```

Same 1280 × 720 source, now scaled to 1472 × 828 (1.15); 22 px text appears 25.3 px. This makes identical source settings comparable on both displays. Stage top remains y=160. Do not serialize editor preview scale. On shorter displays fit the stage to BOTH width and available height with uniform scaling, never clipping. Below 900 px, stack the preview above the rail; allow document scrolling and keep the action footer sticky. At 320 px, gallery is still two columns, toolbar wraps, controls remain at least 40 px tall. Mockup app composition is followed by a separate specimen sheet and therefore permits document scrolling at desktop sizes too.

## Controls and behavior for the builder

- Gallery selection replaces appearance/layout/animation keys, including name format and badges. Preserve `channel` and all four filter keys. Loading a copied URL uses every serialized key. Mark the selected card with a border plus check; after an appearance edit label it “Clean · Modified” (or the originating skin). Track that label only in editor state. Each card uses a one-line live sample driven by its own preset.
- Font: searchable Google Fonts picker plus system font options; size, available weight and line height. Only request selected fonts in production; the design sheet loads all sample families. Pixelify Sans and VT323 have intentionally limited weight choices. Fallback: monospace for Terminal/Block Craft/Retro RPG, sans-serif otherwise. Wait for fonts before measuring preview. Font loading failure shows a small editor notice, not an overlay notice.
- Text & Colors: fixed/Twitch username color toggle, fixed fallback swatch, message and system colors, editable name format with token help, show badges, outline width/color and shadow enabled/color/opacity/blur. Badge fills do not change name/text by role; role colors are specified in the round 2 extension below.
- Border: style, color, thickness, corner radius. Zero thickness removes the frame. Pixel style disables radius with “Pixel frames use square corners.” Background: color, opacity and message/panel scope. Panel scope uses one wrapper; message scope styles each row independently. Background opacity never fades text or borders.
- Layout: horizontal/vertical padding, message spacing, max messages, lifetime (Never checkbox writes 0), newest at top/bottom, left/center/right alignment, stack width and edge inset. Animation: entrance and duration. Filters: hide commands, hide listed bots with editable comma-separated list, hide links. Invalid numeric/text input retains the last valid preview and displays inline guidance; clamp valid numeric values to schema ranges on commit.
- Copy generates the actual overlay page URL with base64url UTF-8 JSON in the hash; include all setting keys. Button becomes “Copied” for 2 seconds with a polite status announcement. If clipboard fails, reveal a selectable URL and “Copy this URL manually.” Disable copy only while channel is empty/invalid, with “Enter a channel to create your overlay URL.” Preview still works with samples.
- Reset restores Clean defaults, retaining channel and filters; label/help: “Reset appearance to Clean”. No confirmation dialog. Serialize no arbitrary CSS. The named border recipe is the only customization mechanism in v1.
- Use real labels, fieldsets, native input semantics and keyboard-operable disclosures. Gallery is a named radio group with arrow-key selection. Selected, modified and connection state must not depend on color alone. Respect reduced motion (all entrances/exits become instant). The mockup provides semantic buttons and labels but deliberately does not simulate application actions.

## Shared settings contract

`skins.json` envelope: `schemaVersion: 1`, `defaultSkinId: "clean"`, and `skins: [{id, name, settings}]`. IDs are stable machine identifiers; names are display-only generic names. Settings below are the exact full URL object and every preset's `settings` shape. No other hidden skin-specific values. Defaults are Clean. All lengths are source CSS px. Colors are six-digit hex; alpha is separate. An optional trusted `borderCSS` field on a preset would be design-time only, never accepted from a URL; this package needs none because all recipes are shared.

For URL decoding, merge known valid keys over defaults, discard unknown keys, validate enums and types, clamp finite numeric values, and fall back per key on invalid values. Unsupported schema versions use defaults with a visible editor notice. Never evaluate formatting tokens, CSS, or HTML from a URL. Name/channel substitutions and messages are text nodes. System notices omit badges and the name prefix. Connection failures are editor status; do not insert noisy reconnect notices into a stream.

| Key | Type | Clean default | Range / contract |
| --- | --- | --- | --- |
| `schemaVersion` | integer | `1` | Exactly 1; migration discriminator. |
| `channel` | string | `""` | 0–25 ASCII letters, digits or underscore; lowercase, no leading #. |
| `fontFamily` | string | `"DM Sans"` | Google Fonts family name, 1–80 characters; or system-ui, sans-serif, serif, monospace. Presets use Google Fonts only. |
| `fontSize` | integer | `22` | 12–48 px; message, name and system text share this size. |
| `fontWeight` | integer | `500` | 400, 500, 600, 700; only offer weights the selected font provides. |
| `lineHeight` | number | `1.45` | 1.1–2.0, step 0.05; unitless. |
| `textColor` | color | `"#F2F5FA"` | Opaque #RRGGBB. |
| `nameColorMode` | enum | `"fixed"` | fixed / twitch; fixed is also fallback for missing Twitch colors. |
| `nameColor` | color | `"#A9CAFF"` | Opaque #RRGGBB. |
| `systemColor` | color | `"#AEBBD0"` | Opaque #RRGGBB; notices and connection messages only. |
| `nameFormat` | string | `"{name}:"` | 1–80 characters; exactly one {name}; optional {channel}; literal punctuation allowed. Message follows one space after this prefix. |
| `showBadges` | boolean | `true` | true / false; badges precede the name prefix. |
| `outlineWidth` | number | `0` | 0–2 px, step 0.5; text outline only. |
| `outlineColor` | color | `"#000000"` | Opaque #RRGGBB. |
| `shadowEnabled` | boolean | `true` | true / false; text shadow only. |
| `shadowColor` | color | `"#000000"` | Opaque #RRGGBB. |
| `shadowOpacity` | number | `0.65` | 0–1, step 0.05. |
| `shadowBlur` | integer | `3` | 0–12 px; x offset 0, y offset 1 px. |
| `borderStyle` | enum | `"none"` | none / line / double / corners / bevel / pixel; see recipes. |
| `borderColor` | color | `"#7487A1"` | Opaque #RRGGBB. |
| `borderWidth` | integer | `0` | 0–4 px; 0 disables all frame layers. |
| `backgroundColor` | color | `"#111C2E"` | Opaque #RRGGBB; alpha controlled separately. |
| `backgroundOpacity` | number | `0.55` | 0–1, step 0.05; never set opacity on text/container. |
| `backgroundScope` | enum | `"message"` | message / panel; panel draws one frame around the entire stack. |
| `cornerRadius` | integer | `6` | 0–24 px; pixel forces 0, other styles respect this value. |
| `paddingX` | integer | `12` | 0–32 px per side, inside the frame. |
| `paddingY` | integer | `8` | 0–24 px per side, inside the frame. |
| `messageSpacing` | integer | `8` | 0–24 px; gap between messages. |
| `maxMessages` | integer | `8` | 1–30; remove oldest on overflow. |
| `messageLifetime` | integer | `30` | 0 (Never), or 5–180 seconds; 0 disables timed removal. |
| `direction` | enum | `"bottom"` | bottom / top; edge where newest messages appear. |
| `alignment` | enum | `"left"` | left / center / right; both stack items and text alignment. |
| `overlayWidth` | integer | `480` | 240–960 px; cap at available source width minus 2 × edgeInset. |
| `edgeInset` | integer | `20` | 0–64 px from all source edges. |
| `animationIn` | enum | `"fade"` | none / fade / slide / pop. |
| `animationDuration` | integer | `180` | 80–500 ms, step 10; ignored for none. |
| `hideCommands` | boolean | `true` | true / false; trim leading whitespace then hide messages beginning !. |
| `hideBots` | boolean | `true` | true / false; compares exact lowercase usernames against botNames. |
| `botNames` | string[] | `["nightbot", "streamelements"]` | 0–50 unique lowercase usernames; each 1–25 ASCII letters, digits or underscore; UI uses comma-separated text. |
| `hideLinks` | boolean | `false` | true / false; remove entire messages containing http://, https:// or www. (case-insensitive). |

## Rendering and frame recipes

Canvas is always transparent in the actual overlay; checkerboard is an editor-only transparency indicator. Stack width is `min(overlayWidth, sourceWidth - 2 × edgeInset)`. Place stack at top/bottom according to direction and horizontally according to alignment. Rows fill the stack width, wrap long words with `overflow-wrap:anywhere`, and use `min-width:0`. Newest-at-bottom orders oldest to newest; newest-at-top reverses that order. On height overflow discard oldest complete rows, not partial lines. In panel mode padding belongs to the wrapper, not every row; in message mode padding belongs to each row. Gap is always messageSpacing.

Name and system font size/weight equal message size/weight; color and punctuation differentiate them. Badge size is 0.65em square with 0.2em inline gap; accessible labels “Moderator” and “Subscriber”. Use simple neutral outline diamonds with M/S letters in the mockup; production can use original CSS/SVG shapes. Emote images/placeholder are 1.25em square, inline middle, with alt text and no influence on name formatting. The sample's `:wave:` placeholder is typographic, not a proprietary emote. Shadow is `0 1px shadowBlur rgba(shadowColor, shadowOpacity)` when enabled. Outline is a text-only stroke with `paint-order:stroke fill`; do not apply a stroke to badge or emote elements. No container/drop shadows.

For each framed element set `box-sizing:border-box; position:relative; isolation:isolate`, background rgba, radius and padding from settings. Let `--b` be borderWidth px and `--bc` borderColor. All ornament is pointer-events:none and fits INSIDE the element's border box. Padding is content padding in addition to allocated border width.

| borderStyle | Exact CSS recipe |
| --- | --- |
| none | `border:0`; no pseudo-elements. |
| line | `border:var(--b) solid var(--bc)` |
| double | Outer solid border width b; `::after {position:absolute;inset:calc(var(--b) + 2px);border:var(--b) solid var(--bc);border-radius:inherit;content:""}`. Increase effective content padding by b + 2 px to keep text off inner line. |
| corners | Base solid border width b; `::after` at inset 2px uses eight linear gradients (horizontal and vertical line at each corner), all borderColor, line thickness b, length 12px, no-repeat. No SVG or asset needed. |
| bevel | Solid b borderColor; top/left border use `color-mix(in srgb, var(--bc), white 28%)`; bottom/right use `color-mix(in srgb, var(--bc), black 40%)`. Fallback to solid borderColor. |
| pixel | Solid b borderColor, radius 0, `box-shadow:inset var(--b) var(--b) 0 #ffffff33,inset calc(-1 * var(--b)) calc(-1 * var(--b)) 0 #00000066`; add b to content padding for inset steps. CSS geometry only. |

Use `mockup.html`'s `.frame-*` rules as the literal recipe reference. `borderWidth=0` switches to `.frame-none` regardless of selected recipe. Frames/backgrounds are static in panel scope; animate incoming rows only. Fade: opacity 0→1; slide: opacity 0→1 plus translateY(+10px→0) for bottom, −10px→0 for top; pop: opacity 0→1 and scale(.96→1), origin aligned to the row's anchor. All use `cubic-bezier(.2,.7,.2,1)` over animationDuration. None is immediate. Round 2 adds the bounded text and ambient effects specified below. Lifetime timer starts on arrival; when expired, fade for 160 ms then remove; 0 never expires. Max-message and height overflow removal is immediate. Preview/overlay use the same renderer and CSS.

## Skin specifications

The following records spell out every visual value; the JSON additionally repeats the common connection, filter and capacity defaults for each. `{name}` is the sender display name. Only generic names appear in UI. All font families below are Google Fonts; no logos, game art, image textures, trademarked display fonts or game titles are used. Backgrounds and frames are entirely CSS. The reference palette assumes no particular stream footage; opacity and colors remain editable.

### Guild Chat (`guild-chat`)

- Typography: **Lato**, 22 px, weight 400, line-height 1.45; names and system text use the same metrics.
- Text **#72EC99**, fixed name **#A1FFB7**, system **#E3C885**. Name format `[Guild] [{name}]: text`. Badges shown; role does not change text styling.
- Background **#0C1915**, opacity **0.8**, scope **panel**. Frame **corners**, 1 px **#BDA363**, radius 2 px; use shared recipe above.
- Outline 0 px **#000000**. Text shadow enabled: **#000000**, alpha 0.65, blur 3 px, offset 0/1 px. No frame shadow except pixel recipe's inset steps.
- Padding 14 px vertical / 16 px horizontal; row gap 7 px. Stack 480 px, edge inset 20 px; left aligned, newest at bottom; max 8, lifetime 30 seconds.
- Entrance **fade**, 180 ms.

### Fantasy MMO (`fantasy-mmo`)

- Typography: **Noto Sans**, 21 px, weight 400, line-height 1.45; names and system text use the same metrics.
- Text **#EEF0FA**, fixed name **#9EDCEB**, system **#D5C2F5**. Name format `[Party] {name}: text`. Badges shown; role does not change text styling.
- Background **#111527**, opacity **0.8**, scope **panel**. Frame **double**, 1 px **#ACB9D6**, radius 3 px; use shared recipe above.
- Outline 0 px **#000000**. Text shadow enabled: **#000000**, alpha 0.65, blur 3 px, offset 0/1 px. No frame shadow except pixel recipe's inset steps.
- Padding 14 px vertical / 16 px horizontal; row gap 6 px. Stack 480 px, edge inset 20 px; left aligned, newest at bottom; max 8, lifetime 30 seconds.
- Entrance **fade**, 200 ms.

### Block Craft (`block-craft`)

- Typography: **Pixelify Sans**, 24 px, weight 400, line-height 1.35; names and system text use the same metrics.
- Text **#F0F0F0**, fixed name **#8BE682**, system **#FFDF75**. Name format `<{name}> text`. Badges shown; role does not change text styling.
- Background **#414141**, opacity **0.8**, scope **message**. Frame **pixel**, 2 px **#909090**, radius 0 px; use shared recipe above.
- Outline 1 px **#000000**. Text shadow enabled: **#000000**, alpha 1, blur 0 px, offset 0/1 px. No frame shadow except pixel recipe's inset steps.
- Padding 8 px vertical / 12 px horizontal; row gap 4 px. Stack 480 px, edge inset 20 px; left aligned, newest at bottom; max 8, lifetime 30 seconds.
- Entrance **none** (duration ignored).

### Old-School MMO (`old-school-mmo`)

- Typography: **Roboto Slab**, 21 px, weight 500, line-height 1.5; names and system text use the same metrics.
- Text **#FFE579**, fixed name **#FFF3B3**, system **#FFBD85**. Name format `{name}: text`. Badges shown; role does not change text styling.
- Background **#35281B**, opacity **0.95**, scope **panel**. Frame **bevel**, 3 px **#B29662**, radius 0 px; use shared recipe above.
- Outline 0 px **#000000**. Text shadow enabled: **#000000**, alpha 0.8, blur 0 px, offset 0/1 px. No frame shadow except pixel recipe's inset steps.
- Padding 14 px vertical / 16 px horizontal; row gap 5 px. Stack 480 px, edge inset 20 px; left aligned, newest at bottom; max 8, lifetime 30 seconds.
- Entrance **none** (duration ignored).

### Battle Arena (`battle-arena`)

- Typography: **Barlow**, 22 px, weight 500, line-height 1.45; names and system text use the same metrics.
- Text **#E0E9ED**, fixed name **#83D7EC**, system **#E5C881**. Name format `[Team] {name}: text`. Badges shown; role does not change text styling.
- Background **#0B2029**, opacity **0.85**, scope **panel**. Frame **corners**, 2 px **#4C9BAA**, radius 0 px; use shared recipe above.
- Outline 0 px **#000000**. Text shadow enabled: **#000000**, alpha 0.65, blur 3 px, offset 0/1 px. No frame shadow except pixel recipe's inset steps.
- Padding 14 px vertical / 16 px horizontal; row gap 6 px. Stack 480 px, edge inset 20 px; left aligned, newest at bottom; max 8, lifetime 30 seconds.
- Entrance **slide**, 180 ms.

### Battle Royale (`battle-royale`)

- Typography: **Barlow Condensed**, 24 px, weight 600, line-height 1.3; names and system text use the same metrics.
- Text **#FFFFFF**, fixed name **#FFE099**, system **#B7D8F0**. Name format `[Squad] {name}: text`. Badges shown; role does not change text styling.
- Background **#182838**, opacity **0.85**, scope **message**. Frame **bevel**, 2 px **#7DABC2**, radius 2 px; use shared recipe above.
- Outline 0.5 px **#000000**. Text shadow enabled: **#000000**, alpha 0.65, blur 2 px, offset 0/1 px. No frame shadow except pixel recipe's inset steps.
- Padding 9 px vertical / 14 px horizontal; row gap 6 px. Stack 480 px, edge inset 20 px; left aligned, newest at bottom; max 8, lifetime 30 seconds.
- Entrance **slide**, 160 ms.

### Retro RPG Dialog Box (`retro-rpg`)

- Typography: **VT323**, 28 px, weight 400, line-height 1.2; names and system text use the same metrics.
- Text **#FFFFFF**, fixed name **#FFF0A0**, system **#B7DCFF**. Name format `{name}: text`. Badges shown; role does not change text styling.
- Background **#162B83**, opacity **0.95**, scope **panel**. Frame **double**, 2 px **#F0F4FF**, radius 5 px; use shared recipe above.
- Outline 0 px **#000000**. Text shadow enabled: **#000000**, alpha 1, blur 0 px, offset 0/1 px. No frame shadow except pixel recipe's inset steps.
- Padding 16 px vertical / 18 px horizontal; row gap 8 px. Stack 480 px, edge inset 20 px; left aligned, newest at bottom; max 8, lifetime 30 seconds.
- Entrance **none** (duration ignored).

### Terminal (`terminal`)

- Typography: **IBM Plex Mono**, 20 px, weight 400, line-height 1.5; names and system text use the same metrics.
- Text **#98F5BA**, fixed name **#C2FFDB**, system **#78B991**. Name format `{name} > text`. Badges shown; role does not change text styling.
- Background **#08140E**, opacity **0.95**, scope **panel**. Frame **line**, 1 px **#377C53**, radius 0 px; use shared recipe above.
- Outline 0 px **#000000**. Text shadow disabled: **#000000**, alpha 0.65, blur 3 px, offset 0/1 px. No frame shadow except pixel recipe's inset steps.
- Padding 14 px vertical / 16 px horizontal; row gap 6 px. Stack 480 px, edge inset 20 px; left aligned, newest at bottom; max 8, lifetime 30 seconds.
- Entrance **none** (duration ignored).

### Bubble Chat (`bubble-chat`)

- Typography: **Nunito Sans**, 22 px, weight 600, line-height 1.4; names and system text use the same metrics.
- Text **#27304B**, fixed name **#5A3899**, system **#525D76**. Name format `{name}: text`. Badges shown; role does not change text styling.
- Background **#F1EEFF**, opacity **0.95**, scope **message**. Frame **line**, 1 px **#D1C5ED**, radius 20 px; use shared recipe above.
- Outline 0 px **#000000**. Text shadow disabled: **#000000**, alpha 0.65, blur 3 px, offset 0/1 px. No frame shadow except pixel recipe's inset steps.
- Padding 12 px vertical / 16 px horizontal; row gap 10 px. Stack 480 px, edge inset 20 px; left aligned, newest at bottom; max 8, lifetime 30 seconds.
- Entrance **pop**, 220 ms.

### Clean (`clean`)

- Typography: **DM Sans**, 22 px, weight 500, line-height 1.45; names and system text use the same metrics.
- Text **#F2F5FA**, fixed name **#A9CAFF**, system **#AEBBD0**. Name format `{name}: text`. Badges shown; role does not change text styling.
- Background **#111C2E**, opacity **0.55**, scope **message**. Frame **none**, 0 px **#7487A1**, radius 6 px; use shared recipe above.
- Outline 0 px **#000000**. Text shadow enabled: **#000000**, alpha 0.65, blur 3 px, offset 0/1 px. No frame shadow except pixel recipe's inset steps.
- Padding 8 px vertical / 12 px horizontal; row gap 8 px. Stack 480 px, edge inset 20 px; left aligned, newest at bottom; max 8, lifetime 30 seconds.
- Entrance **fade**, 180 ms.

## Review and implementation acceptance

Open `design/mockup.html` in a browser with internet access for Google Fonts. It contains no JavaScript; gallery, buttons and fields are visual samples. Font/network fallback can change wrapping. Resize to 1280 × 720 and 1920 × 1080 to inspect the layout; the source stage uses matching container-scaled typography. Scroll below the editor for full-size specimens; each has exactly five rows including a moderator, a subscriber, one emote placeholder and a system notice. The static controls show Clean values.

Builder acceptance: selecting each preset yields the corresponding specimen at source scale; overriding every setting works in both preview and overlay; panel frames are not repeated per message; URL round-trip reproduces appearance, channel and filters; no checkerboard or editor chrome leaks into OBS. At both target sizes the action footer stays visible and settings scroll independently. Verify long usernames, long links, emoji and multi-line messages; reduced motion; keyboard selection; filter exclusions; copy failure and font fallback. Round 2 adds role colors and mention highlights; custom CSS, accounts, alert integrations and third-party emote services remain out of scope.


## Round 2 ? expressive skins, restrained runtime

This extension supersedes conflicting round 1 animation, gallery, role-color and schema rules. The application is not changed by this package. Existing ten presets retain their visual settings; new effect defaults are off. Guild Chat remains the reference for readable, atmospheric panel styling. Keep the slate editor tokens, left alignment, 400 px rail and responsive stage from round 1. Spend color and movement inside samples rather than on editor chrome.

### Gallery and controls

Use three labeled disclosure groups in the same scroll area, two columns with 8 px gaps; cards become 172 ? 100 px to fit a title and a 44 px sample. All groups start expanded. Keep one radio selection across groups, roving focus and arrow keys across visible cards; category headings are not choices. Categories are browsing metadata, not exclusive claims about a skin's capabilities. Exactly 22 cards, with no duplicates:

- **Game styles (16):** Guild Chat, Fantasy MMO, Block Craft, Old-School MMO, Battle Arena, Battle Royale, Retro RPG Dialog Box, Cyber City, Arcade Cabinet, Space Command, Monster Trainer, Dungeon Crawler, Cozy Farm, Horror Survival, Hero Shooter, Kart Racer.
- **Animated (2):** Terminal, Vaporwave. Terminal is the restrained baseline for this collection; its default remains static.
- **Colorful (4):** Bubble Chat, Clean, Candy Pop, Rainbow Border. Clean is the neutral baseline.

Each card uses its preset's typography, frame and effects. Play entrance once on visibility, and replay on focus/hover; ongoing effects run only while visible. Static presets remain static. The review sheet loops short entrances every eight seconds so they can be inspected without application logic; production must not loop message entrances. Card text is decorative beside its accessible skin name. No live-region announcements for samples.

Keep the original control order. Text & Colors adds Name effect, two gradient swatches (shown only for gradient), Text effect, Typewriter duration, Use role colors with four role swatches, and Highlight channel mentions with its swatch. Border adds Effect, Secondary effect color and Cycle duration (seconds; helper: ?Higher values move more slowly?). Background adds Treatment, Secondary color, Effect and Ambient detail. Animation adds bounce, zoom, glitch and Reduce motion. Hide irrelevant controls without resetting their stored values. A persistent note beside the toggle reads ?System reduced motion is always respected.? Skin changes and Reset preserve the user's reduceMotion value, channel and filters; all other appearance keys are replaced. URLs serialize reduceMotion.

### Version 2 settings contract

Envelope is now `{schemaVersion:2, defaultSkinId:"clean", skins:[{id,name,category,settings}]}`. Category is one of the three exact labels above; it is not a URL setting. Every settings object is complete. All round 1 keys remain; `schemaVersion` becomes integer 2. Decode version 1 by validating its existing keys, merging the following inert defaults and setting version 2. Missing version means version 1. Unknown future versions use Clean and an editor notice. Invalid new values fall back per key; never accept CSS or HTML. Defaults below are the actual Clean record.

| Key | Type | Default | Range / contract |
| --- | --- | --- | --- |
| `borderEffect` | enum | `none` | none / glow / pulse / animatedGradient / rainbowCycle |
| `borderEffectSpeed` | number | `6` | 2?20 seconds per cycle, step 0.5; ignored for none/glow |
| `borderEffectColor` | color | `#E5A9FF` | #RRGGBB; second stop for animatedGradient; first is borderColor |
| `nameEffect` | enum | `none` | none / rainbow / gradient / glow |
| `nameGradientColor1` | color | `#A9CAFF` | #RRGGBB; first gradient stop |
| `nameGradientColor2` | color | `#E5A9FF` | #RRGGBB; second gradient stop |
| `textEffect` | enum | `none` | none / typewriter / wave / modShake |
| `typewriterDuration` | integer | `700` | 200?1500 ms, step 50; whole message reveal duration |
| `animationIn` | enum | `fade` | none / fade / slide / pop / bounce / zoom / glitch |
| `animationDuration` | integer | `180` | 80?500 ms, step 10; ignored for none |
| `backgroundEffect` | enum | `none` | none / scanlines / gradientDrift / sparkles |
| `backgroundSecondaryColor` | color | `#273B59` | #RRGGBB; second gradient/confetti color |
| `backgroundTreatment` | enum | `solid` | solid / gradient / rainbow / boards / confetti; CSS geometry only |
| `ambientEffect` | enum | `none` | none / scan / torch / flicker; separate from message text |
| `roleColorsEnabled` | boolean | `false` | true / false |
| `broadcasterNameColor` | color | `#FFB7A5` | #RRGGBB |
| `modNameColor` | color | `#97E8B2` | #RRGGBB |
| `vipNameColor` | color | `#E6B0FF` | #RRGGBB |
| `subNameColor` | color | `#FFE095` | #RRGGBB |
| `mentionHighlightEnabled` | boolean | `false` | true / false |
| `mentionHighlightColor` | color | `#F4D38D` | #RRGGBB; 3 px inline-start marker plus 12% tint on mentioned row |
| `reduceMotion` | boolean | `false` | true / false; OR with prefers-reduced-motion: reduce |
| `borderStyle` | enum | `none` | original none / line / double / corners / bevel / pixel, plus hud / slab |

Role resolution: broadcaster > moderator > VIP > subscriber > ordinary. When enabled, a recognized role's name color takes precedence over Twitch/fixed color and over gradient/rainbow name effects. Glow can still use that resolved role color. Otherwise rainbow replaces the name color, gradient uses the two swatches, glow uses the resolved Twitch/fixed color. Badges remain recognizable independently. System rows receive neither role effects nor mentions. Mention matching uses case-insensitive exact channel tokens with optional @, bounded by non-username characters (ASCII letters/digits/underscore are username characters); empty channel never matches. Inspect message text, not emote URLs. Preserve message foreground color and reserve marker space on all rows to avoid a layout jump.

### Frame, color and motion recipes

Frame and effects are independent, reusable settings: no renderer branches on skin IDs. hud uses a thin base line and four 16 px diagonal corner brackets at inset 5 px; reserve 16 px minimum internal padding. slab uses a 4 px orange inline-start stripe and white 10 px corner wedges, CSS linear gradients; reserve 16 px padding so angled ornament never clips text. Zero borderWidth or borderStyle none disables border effects. For panel scope effects attach once to the panel; entrance and text effects attach only to rows. Decorative layers never intercept input or cover glyphs.

Boards: flat brown background with 1 px horizontal seams every 32 px and inset bevel; no grain image. Confetti: alternate backgroundColor and backgroundSecondaryColor by visible row index, with a static cream-to-mint gradient on every third row (panel scope uses that gradient once). Rainbow treatment: pastel #FFD2E6, #FFF1BA, backgroundSecondaryColor, #DCCBFF over 135 degrees. Gradient treatment uses backgroundColor and backgroundSecondaryColor at 135 degrees. Apply backgroundOpacity to background layers only.

Border glow uses a static inset 8 px glow; pulse varies a separate glow layer's opacity .35?.7?.35, never text opacity. animatedGradient crossfades two reversed two-stop border layers; rainbowCycle crossfades two offset rainbow border layers. Keep the center transparent using a mask with a solid border fallback. No rotating full-size canvases or animated blur. Names cycle through #FFB4D9, #FFE49A, #A0F1BE, #9DE8FF, #D7BEFF in 8 seconds; use dark counterparts #8A285C, #775800, #22633B, #165A78, #58388F on light backgrounds. Name gradient is static, glow is static (4 px maximum). If background-clip text is unsupported, use the resolved solid name color.

Scanlines are a static repeating-linear-gradient of 1 px black at 8% alpha every 4 px, behind content. Gradient drift crossfades two reversed gradient layers over 16 seconds. Sparkles are at most three CSS diamond marks inside the row's end padding, opacity and scale only, 600 ms once per arrival. Scan is a 1 px cyan decorative line, translating along the frame edge over 6 seconds; never sweep across glyphs. Torch is an amber inset glow whose opacity changes .25/.38/.29/.4/.25 over 3.8 seconds with soft interpolation. Horror flicker changes only the dim red border/glow layer .75?.88?.8?.9?.75 over 5 seconds; text stays fully legible, no blackouts or strobing.

Entrance runs on an outer row, text effect on an inner body; effects must not overwrite each other's transform animation. Bounce: translateY(8px), then -3px at 60%, then 0. Zoom: scale(.9)?1 and opacity 0?1. Glitch: translateX(-2px/+2px/-1px/0), no text copies, flashes or infinite jitter. Hero Shooter uses the existing slide with 120 ms duration. Wave is one whole text-body translateY(0/-3px/0) over 350 ms, not per-letter sine waves. modShake is one translateX(0/-2px/2px/0) over 240 ms only when moderator badge is present, not merely because role colors are enabled. Other senders remain still.

Typewriter reveals actual grapheme clusters with CSS stepped opacity and bounded animation-delay, with the final layout reserved from arrival. Segment once on insertion, maximum 160 animated graphemes, reveal the remaining tail together at the duration endpoint. Emotes are atomic units; their alt text is not split. Maintain an accessible unsplit message and aria-hide decorative glyph spans. Never animate width/height or force single-line clipping in production. The sheet uses a stepped clip reveal on a wrapping body to demonstrate pacing without JavaScript; the builder must implement grapheme reveal for true multiline typing. Lifetime starts at arrival as before; effects do not extend it.

### Reduced motion and long-session budget

Effective reduce motion = system preference OR toggle. Disable all entrance, exit, typewriter, wave, shake, scan, flicker, glow pulse, rainbow cycling, gradient drift and sparkles. Show final text immediately. Keep static gradients, scanlines, frames and modest static glow. Remove transforms and clipping along with animation; do not use a near-zero-duration loop. Toggling off never replays old message entrances. System preference cannot be overridden by the toggle. The review sheet includes a working CSS-only Reduce motion checkbox; its other settings remain visual samples.

CSS keyframes only: no requestAnimationFrame, per-character timers, canvas, GIF/video textures, animated filters or layout animation. Keyframes may run continuously only on decorative frame/background layers and names. Cap at 30 rendered messages, no permanent will-change; at most two continuous decorative layers per framed surface and three transient sparkle marks per incoming row. Pause offscreen gallery cards with visibility observation and pause all samples on hidden document; event-driven observation is permitted, animation loops are not. Remove expired nodes and their animations. Retain original maximum-message/height eviction. Production loads only active fonts; the review sheet deliberately loads every sample family.

### New preset direction

Exact colors, metrics, effect selections and durations are authoritative in skins.json. All twelve reuse the Google Fonts already loaded in round 1, avoiding a new font request for each novelty.

| Skin | Distinctive treatment | Motion |
| --- | --- | --- |
| Cyber City | Magenta frame, cyan names, deep plum, Barlow | 4 s glow pulse; 180 ms glitch |
| Arcade Cabinet | Pixelify Sans, purple pixel frame, static CRT scanlines | 8 s rainbow names; 200 ms zoom |
| Space Command | Cyan HUD brackets on navy, Barlow | 6 s edge scan; slide |
| Monster Trainer | VT323, opaque ivory, 4 px dark rounded border | 700 ms typewriter |
| Dungeon Crawler | Roboto Slab on grey stone-colored bevel | Warm 3.8 s torch glow |
| Cozy Farm | Nunito Sans cream lettering, brown CSS board seams | Soft 400 ms bounce |
| Horror Survival | IBM Plex Mono, readable blood-red lettering on near-black | 700 ms typewriter; faint 5 s border flicker |
| Hero Shooter | Barlow Condensed, orange stripe and white angled wedges | Fast 120 ms slide |
| Kart Racer | Nunito Sans, yellow/mint pills, dark ink | 400 ms bouncy entrance |
| Candy Pop | Pastel rainbow bubbles, dark plum ink | Pop plus 600 ms sparkles |
| Vaporwave | Pink/teal gradient, pink-to-mint names | 16 s slow background drift |
| Rainbow Border | Clean light type on navy, rainbow outline | 8 s border cycle; 200 ms zoom |

### Round 2 acceptance

Review all 22 cards and 22 five-row specimens, including multi-line bodies and emote placeholders. The extra effect strip demonstrates wave, moderator shake, glow and animated gradient even though they are not defaulted together in a skin. Verify both reduced-motion sources reveal complete text and freeze every decorative layer. Inspect at 320, 1280 and 1920 px widths. Builder checks: URL v1 migration, v2 round-trip of every key, role priority with multiple badges, mention boundaries and empty channel, overriding every effect on every frame, max-capacity eviction and no font/layout shifts during typewriter. Profile an hour-long OBS session separately: this design sheet is not proof of runtime CPU performance.
