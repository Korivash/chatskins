# Round 15 — Options that belong beside your stream

Design handoff, 25 October 2026. Only this specification and `round15-options-mockup.html` change. Production wiring below is proposed, not implemented. Read against current `editor.html`, `js/editor.js`, `js/controls.js`, `js/settings.js`, Round 13 and Round 14. Integration controls checked against `js/chat-play-editor.js` and `js/alerts-editor.js`.

## Direction and exact layout

The preview is the main event. One settings panel answers one question at a time; the artwork supplies the personality. Remove the numbered journey, Guided/Simple/Advanced navigation, duplicated setup cards and bottom step bar. One navigation strip: **Look / Style / Chat / Viewers / Alerts / Get link**. These are destinations, not required steps. Switching never changes settings.

Plan critique: a left rail would consume the width needed for readable options and a 60% preview. Use the horizontal strip. Keep Round 13's visual recipes, replace its modes and 52/48 layout. Round 14's layered artwork and motion rules remain; do not confuse SVG layer controls with raster frame-template controls.

Tokens: canvas #05070D, settings #0B1425, raised #14243B, boundaries #344967, ink #F3F7FF, helper #AFBED3, action #86B4FF with #061225 ink, focus #59D7FF. DM Sans for editor, actual chosen families inside font tiles and chat. Title 28/34, section 24/30, group 18/25, label/body 15/23, helper 13/19. Left aligned, 24px group spacing, 10px gaps, 8px control corners, 12px panel corners. No glowing editor chrome.

Desktop begins at 1060 CSS px. Max-width 1560px, 32px outer gutters, 64px header. Intro approximately 76px, tabs 54px. Workspace `minmax(0,38fr) minmax(0,62fr)`, gap 24px. Preview gets 62% of column space and at least 60% of total workspace including gap. At 1440: usable 1376, gap 24, settings 514, preview 838. Settings padding 24. At 1060 settings remain approximately 369px wide. Preview sticky top 20px; settings use document scrolling, no nested scroll area. Stage 16:11 inspection area, max-height 660px. Production Fit / Up close controls distinguish source fit (existing 1280×720) from enlarged inspection; never imply enlarged chat is its on-stream footprint.

```
ChatSkins                                               Pause motion
Make it yours.                               Current skin · Modified
Look    Style    Chat    Viewers    Alerts    Get link
Settings · 38%                     Live preview · 62%
Style        Show all options      Test chat / Live channel
Brand color                        [                              ]
Chat font / Text size              [       actual chat            ]
Frame                              [                              ]
 Color / Glow                      Dark / Light / Checker
 Middle / Title                    Fit / Up close
Undo  Redo  Reset                                      Get my OBS link
```

Fixed bottom bar: minimum 76px plus safe area, full width. Undo / Redo / Reset left, **Get my OBS link** right. Reserve measured bar height +24px in content. CTA always enabled: opens Get link and focuses heading; it does not copy or authorize. On Get link, focuses first missing requirement or Copy overlay link if ready. Copy is a separate deliberate action.

Below 1060px: one column, 18px gutters, 20px settings padding, compact 54px header. Preview first and sticky top 0, then the same tablist in a 3×2 grid, then settings. Relocate the single tablist in DOM; do not duplicate navigation. Sticky stage `clamp(140px,25dvh,240px)` plus compact heading/tools (roughly 110px). At heights below 500px or while the software keyboard is open, reduce stage to 72px and put secondary preview tools behind one labeled button. Preview remains sticky. **Enlarge preview** opens a dialog with transcript, Close and Escape; return focus to trigger. Bottom bar: 44px history row, 48px full-width primary row, safe area; reserve 140px. Use measured preview/dock heights for scroll-padding and scroll-margin so focused inputs remain visible. Keyboard dock follows visual viewport bottom. At 320px tiles remain at least 120px wide; color actions wrap. At 400% zoom use mobile layout without horizontal document scrolling.

## Navigation, disclosure and input rules

Use a proper tablist, selected indicator + aria-selected, arrows/Home/End activate immediately; Tab enters panel. Hidden panels leave focus order. Preserve section scroll position. On section change focus heading below sticky preview; returning from Get link restores prior section/scroll.

Every section has **Show all options**, Off by default, independently retained as editor metadata. No separate advanced mode. Hidden custom values produce **“You have custom settings here.”** with a link to reveal/focus the field. Opening/closing never mutates values. All-options adds section-local **Find an option** search; empty results **“No options match. Try another word.”** Conditional fields remain conditional. Legacy mode preference maps to UI metadata only.

Native radio fieldsets for choices, checkbox switches for booleans, range + exact numeric alternative for numbers, native color + synchronized hex/alpha for paints. No raw dropdowns of names: large enumerations use searchable visual tiles, small ones segments. Selected outline + checkmark; 44px minimum targets, ideally 48. Preserve custom values with **“Custom · kept as is”**; do not snap to a preset upon entry. Every visual control has a label; examples are aria-hidden. Focus 3px cyan with 3px offset. Text 4.5:1, control boundaries/selected states 3:1. Announce commits, not every slider tick or sample message.

## Look

Default: **Your skin** (`#gallery`, `selectSkin`, base/label/baseline) and **Set the vibe**. Two-column skin cards, ≥140×180px, actual chat/art preview, name and selected icon. Search/category chips only filter. Initial incoming URL/draft wins; never reset into onboarding. Empty: “No skins found. Clear your search.” Art failure retains name/sample and Retry. One skin selection is one undo transaction. Extend current selectSkin preservation to include chat count/lifetime/direction/channels as well as existing channel, filters, accessibility and integrations.

Vibes: Cozy—Soft and relaxed; Hype—Bold and lively; Spooky—Dark and eerie; Clean—Quiet and clear; Gamer—Sharp and focused; Cute—Round and playful. Each shows the same two messages in actual typography/geometry. Use Round 13's exact vibe patch for plain skins. **Frame exception:** apply font and message entrance only; preserve template/illustration art, middle, title, layers, `frame.*` and `presentation.*`. Also set `templateFont` with `parts.P.fontFamily`. Helper **“Changes the chat styling. Your frame stays.”** Never reapply skin metadata after user overrides.

All options: My looks `#my-skins`, Save look `#save-skin` (ask name), Export looks `#export-skins`, Import looks `#import-skins` (JSON file), Start with Clean `#scratch`, Restore gallery `#skin-reset`. Failed import retains library. Restore gallery only refreshes gallery. No raw JSON editor in default UI.

## Style

P = each of panel/messageBox/name/messageText/badges/system in `parts`. Existing IDs below represent logical controls; replace selects with fieldsets under those IDs. Generated controls currently have no stable IDs: bind exact key, propose `option-` + dot path converted to hyphens. Don't bind canonical controls twice through aliases.

| Copy / control | Existing binding | Values / writes |
|---|---|---|
| Brand color / swatch row | `#simple-accent`; `parts.name.paint`, `frame.paint` | Stream blue, Mint, Sunset, Lavender, Rose, Gold use Round 13 palette recipe. Custom color uses its readable palette algorithm. Do not recolor template art until Match is pressed. |
| Your color / picker + hex | `#simple-accent`, `#simple-accent-value` | #RRGGBB. Invalid: “Use a color like #74A6FF.” Preserve last valid value. |
| Chat font / rendered tiles | `#simple-font` → `parts.P.fontFamily`; templates `#template-font` → `templateFont` | DM Sans, Barlow, Nunito Sans, IBM Plex Mono, Chakra Petch, Atkinson Hyperlegible. Template library also Bree Serif/Lato. One logical group writes correct renderer keys. Preserve custom family. |
| Text size / slider + number | `#simple-size`, `#simple-size-number`, `#simple-size-value` → `parts.P.fontSize` | 14–40px step1; recommend ≥18 for frames. Preserve incoming outside-range values via exact number, not silent clamp. |
| Chat size / footprint tiles | `overlayWidth`, `parts.P.fontSize`, `emotes.inlineSize`, `messageSpacing`, `edgeInset` | Round13 S/M/L: (360,20,26,6,20), (480,26,32,10,20), (600,32,40,14,20). One transaction. |
| Background / illustrated segments, plain skins | `#simple-background` → `transparentBackground`, background opacities/backdropBlur | Transparent / Soft / Solid; use Round13 exact patches. Incoming gradient/image = Custom. Existing handler values transparent/glass/solid. |
| Message frame / samples, plain skins | `#simple-frame` → `frame.style`, `frame.width` | None/Line/Double/Beveled/Pixel → none/solid/double/beveled/pixel; width 0 for none, 2 otherwise. |

### Frame: one clean card

Visible for skin metadata `frameTemplate` or `illustration`. Heading **Frame**, helper **“{skin} · Make the artwork yours.”** Template controls appear in this order, all available without disclosure except rows marked [all]. Retain hidden values and per-skin drafts. No scattered duplicate frame controls.

| Exact copy | Existing element ID → setting | States / behavior |
|---|---|---|
| Frame color | `template-color` → `frameColor` | Native picker + #RRGGBB. Accent tint, not every artwork pigment. |
| Match my brand color | New action → `frameColor` | Copy `parts.name.paint.color.slice(0,7)` once. No persistent coupling; glow unchanged. For SVG layers apply supported layer accents in one transaction, preserving surface/visibility. |
| Glow color | `template-glow-color` → `glowColor` | Picker + hex. |
| Glow strength | `template-glow-strength`, `template-glow-value` → `glowStrength` | 0–100%, step5, store 0–1. Zero removes glow and disables motion input while retaining selection. |
| Glow motion | `template-glow-motion` → `glowAnimation` | Off/Pulse/Shimmer → off/pulse/shimmer. Off means steady glow. Reduced-motion overrides; show “Motion is paused.” |
| Middle background | `template-middle` → `middleBackground` | None/Color/Image → none/color/image. None hides source/opacity fields without clearing values. |
| Middle color | `template-middle-color` → `middleColor` | Color only; picker + hex. |
| Image URL | `template-middle-image` → `middleImage` | Image only, max2048, HTTPS validation/loading. Failure retains last valid preview: “This image couldn't load. Check the link or choose Color.” No upload implied. |
| Middle opacity | `template-opacity`, `template-opacity-value` → `middleOpacity` | Color/Image only, 0–100% step5 stored 0–1. 0 Fully transparent /100 Solid. Inside frame only. |
| Title text | `template-title` → `templateTitle` | Max40, placeholder Your channel name. Empty uses channel fallback. Plain text, no HTML. |
| Sub-label | `template-subtitle` → `templateSubtitle` | Max40; empty hides. Example STAY AWHILE. |
| Show borders around messages | `template-message-borders` → `templateMessageBorders` | Toggle affects rows, not outer artwork. |
| Paint tint [all] | `template-tint`, `template-tint-value` → `frameTint` | −180–180°, step1. |
| Paint saturation [all] | `template-saturation` → `frameSaturation` | 0–300%, step5, store 0–3. |
| Chat text color [all] | `template-text-color` → `templateTextColor` | Picker + hex; contrast feedback against Color middle; unknown contrast over Image/None. |
| Viewer name colors [all] | `template-name-mode` → `templateNameMode` | Channel colors/Twitch colors/One color → channel/twitch/fixed. |
| Matching webcam frame [all] | `webcam-frame-link` | Only for matching webcam manifest entry, existing buildWebcamFrameUrl. |

SVG illustrated skins instead use `#illustration-controls` / `#illustration-layer-controls`. Rows Header, Corners, Edges, Character, Particles, Glitch, Glow → `illustration.layers.{header,corners,edges,mascot,particles,glitch,glow}.{enabled,color}`; switch + accent picker each. Empty glitch disabled with “No glitch artwork in this skin”, superseding Round14's no-op toggle. `illustrationSurface` is middle color, opaque per Round14. Do not falsely apply raster glow strength, motion, image or title fields to SVG: show “This artwork uses its own title and motion.” `illustrationSource`, `templateFrame`, `templateMessageStyle` are skin metadata, not raw user URLs/names.

Style all-options includes typography per target, text/name effects, backgrounds per target, layout/frame construction and Custom CSS. Target chips: Whole chat / Message / Viewer name / Message text / Badges / System messages. Actual effect previews; gradient stop chips + position sliders + add/remove. CSS: Enable custom CSS plus labeled multiline source, explain overrides; never silently disable on ordinary edits. Exact coverage in appendix.

## Chat

| Copy / visual control | Existing key / ID | Default or all options |
|---|---|---|
| Your Twitch channel | `#channel` → `channel` | Default; shared value in Get link. Normalize twitch.tv URLs/@ prefixes as today, validate 1–25 alphanumeric/underscore. |
| Messages on screen / segments | `maxMessages` | Default A few=4 / Balanced=8 / Lots=12. All: exact count. Preserve custom. |
| Clear messages after / slider + number | `messageLifetime` | Default 0–120s step1; 0 “Keep until chat fills up.” Preserve longer incoming duration with exact number. |
| New messages / motion samples | `#simple-entrance` → `animationIn`, `animationDuration` | Default None/Fade/Slide/Pop; none=0ms, others=180ms. All: timing. |
| Hide chat commands / Hide bot messages / Hide messages with links | `hideCommands`, `hideBots`, `hideLinks` | Default switches; hideLinks filters entire messages. |
| Bot names / editable chips | `botNames` | All, when hideBots on; max50 unique valid names of 1–25 characters. |
| Reduce motion | `reduceMotion` | Default, wins over animations. Preview pause is independent. |
| Group nearby messages / Group within | `grouping.enabled`, `grouping.windowSeconds` | All, 1–120s when on. |
| Message removal / Fade duration / Bottom fade | `animationOut`, `animationOutDuration`, `lifecycle.fadeMaskPx` | All, visual enum samples, ms slider + number, 0–64px fade. |
| Read from / Align chat | `direction`, `alignment` | Default segments bottom/top, left/center/right. Style's layout view links here, not duplicate binding. |
| Message length / Maximum lines | `messageLimits.maxLineCh`, `.maxLines` | All, 16–80ch, 0–12 lines (0 Unlimited). |
| Emotes | `emotes.sevenTV`, `.bttv`, `.ffz`, `.inlineSize`, `.emoteOnlyScale` | Provider switches default, size 16–64px and scale 1–3× all. |
| Highlight first messages / Highlight mentions | `emphasis.firstMessage`, `emphasis.color`, `mentionHighlightEnabled`, `mentionHighlightColor` | All; reveal color on enable. First-message highlight depends on Twitch tag. |
| Customize messages by viewer | `channels.enabled`, `channels.rules` | All; rule cards, never raw array editing. |

Channel rule card: Enabled, Applies to, Name format, Text color, Name color, Italic, Remove; Add rule below. Exact schema `rules[i].enabled/match/format/textColor/nameColor/italic`. Match chips: broadcaster/mod/vip/sub/firstTime/everyone/allCaps/action/mentionsChannel, plain human labels. Max40 rules, format max180 with token chips. Keep ordering, example message, last-valid-value error. These are formatting rules, not extra Twitch accounts. Existing generated rule controls have no stable IDs.

## Viewers

Mount `#chat-play-section` once. Keys here are **chatPlay configuration**, not overlay keys. Default **Let viewers change the look** (`enabled`, `commands.enabled`, replaces `#guided-commands`), allowed skin visual checkboxes (`allowedSkinIds`, `[data-skin]`), **Channel points** (`points.enabled`, replaces `#guided-points`), reward choices (`points.rewards[i].enabled/title/effect`) and readiness. Enable controller when either feature is on; turning one off preserves the other. Retain saved Off choices; no duplicate guided controller.

All-options controls:

| Copy | Exact chatPlay path / existing action |
|---|---|
| Allow !skin / Who can change looks | `commands.swap.enabled`, `.permission` |
| Allow !skinvote / Who can start a vote / Who can vote | `commands.vote.enabled`, `.permission`, `.voterPermission` |
| Allow !skinreset / Who can reset | `commands.reset.enabled`, `.permission` |
| Wait between changes / Wait per viewer | `commands.globalCooldownSeconds` 0–600s; `.userCooldownSeconds` 0–3600s |
| Return to my look after | `effects.swap.holdSeconds` 10–600s |
| Skin command names / chips | `aliases[i].skinId`, `.names`, up to8 names |
| Skin swap / Emote rain / Frame flash / Spotlight / Chaos | `effects.{swap,rain,flash,spotlight,chaos}.enabled` |
| Reduce motion for viewer effects | `reduceMotion` in chatPlay scope |
| Create rewards turned off | `points.createDisabled`, `#chat-play-rewards-disabled`; removes duplicate `#guided-disable-reward-creation` |
| Connect and create selected rewards | `#chat-play-create-rewards` |
| Connect existing rewards | `#chat-play-connect-points` |
| Freeze preview / Resume preview | Existing generated panic/resume callbacks; don't imply remote OBS control |
| Test a viewer: name, role, message, send/effect/ballot | Existing preview callbacks; UI-only inputs, no settings writes |
| Copy chat instructions | Existing generated copy action, buildChatPlayInstructions; failure selects text |

Permission segments Everyone/Subscribers/VIPs/Moderators → everyone/subs/vip/mods. Reset only mods/broadcaster. Reward titles max45, costs shown from existing fixed reward drafts. Show exact creation plan before Connect and create; no reward mutation from toggles. Test copy “Preview only. No points were spent.” `#chat-play-copy-link` and `#guided-copy` move to Get link. Runtime constants such as voting duration are preserved, not invented as editable controls.

## Alerts

Mount `#alerts-section` once. Default **Show alerts** (`#alerts-enabled` → alerts `enabled`), seven visual event toggles (`types.{follow,sub,resub,giftSub,raid,cheer,redemption}.enabled`), **Play a sound** (`#alerts-sound` → `sound.enabled`), **Volume** (`#alerts-volume` → `sound.volume`, 0–100% stored0–1), Connect Twitch (`#alerts-connect`), Test alert (`[data-alert-test]`). Labels Follows/Subscriptions/Returning subscribers/Gift subscriptions/Raids/Cheers/Channel rewards. Fresh Follow/Raid default never overwrites saved choices.

All options: **Position** (`#alerts-position` → `position`, six spatial miniatures top-left/top-center/top-right/center/bottom-left/bottom-right), **Alert width** (`#alerts-width` → `widthPx`,280–800px step10), **Space from edge** (`#alerts-inset` → `insetPx`,0–120px step2); per-type Message (`types.T.message`,max160, existing token allowlist), On screen for (`types.T.holdSeconds`,3–20s). Invalid tokens keep last message and aria-invalid. Test tier (`.alerts-tier`, UI-only prime/tier1/tier2/tier3); Prime remains preview-only. **Waiting alerts** (`queue.maxPending`,1–50), **Skip alerts older than** (`queue.maxAgeSeconds`,15–300s), **Ignore repeat follows for** (`queue.followDedupeSeconds`,5–120s), **Show returning subscriber messages** (`showViewerMessage`), **Show reward title** (`showRewardTitle`). `queue.gapMs` is serialized controller config, not currently exposed; preserve unchanged. Disconnect (`#alerts-disconnect`) keeps existing revocation/error handling. `#alerts-copy` routes to Get link. Status `#alerts-status`, sound note `#alerts-sound-note`, queue `#alerts-queue` and preview `#alerts-preview` remain status/test surfaces.

## Get link

Heading **“Let’s get you on stream.”** Helper **“Add your channel, then copy one link into OBS.”** Shared `#channel`, current look and Commands/Channel points/Alerts readiness summaries with **Fix setup** links, then **Copy overlay link**. No login for plain chat or commands only. Existing compact settings builder handles plain chat, buildCompactPlayUrl commands, alertsController.buildUnifiedLink authenticated features. Validate entire selected config before copy; never omit enabled features to make copy succeed. Preserve builder limits and surface errors.

States: **Off** deliberately excluded; **Needs Twitch connection** with connect; **Connecting…** busy action/settings editable; **Ready** check + label; **Needs attention** specific fix; **Connection expired** reconnect/draft kept. Wrong account “Connect the Twitch account for {channel}.” Cancelled “Your look is saved here. Connect when you're ready.” Partial rewards show created/reused/failed counts and targeted retry. Existing disabled rewards expose explicit “Turn them on”; no implicit remote mutation. Retain `#guided-account`, banner and auth return-target semantics here.

Copy enabled only with channel and all enabled features ready. Default private URL masked. All options adds **Show link for manual copying**, help and matching webcam link if available. Private helper “Keep this link private. It includes Twitch access.” Clipboard error “Your browser couldn't copy. Select the link and copy it yourself.” Reveal readonly URL only on explicit request/fallback. Copied “Copied. Paste it into your chat Browser Source in OBS.” Instructions: add Browser Source or replace existing URL, source **1280×720** (current editor). Round13's proposed 1920×1080 waits for a deliberate canvas change. After copy enable **I added this in OBS**. Configuration edit invalidates copied revision/confirmation: **“Your settings changed. Copy a fresh link into OBS.”** Navigation/search/preview pause/background do not invalidate it.

## Utilities, errors and access

Undo `#undo`, Redo `#redo`, Reset `#reset` always visible; unavailable history disabled. One preset/color/complete slider gesture/text commit = one entry, max100. Preview on input, commit on change; Escape cancels pending edit. Capture state/base/label/baseline. Extend history to local integration config, never authorization, clipboard or already-created rewards. Announce once after undo/redo.

Reset means selected skin appearance baseline, preserving channel/chat behavior/integrations/library. Inline review above dock: **“Reset your look to {skin}?”**, **“Your channel, chat behavior and Twitch setup stay the same.”**, Reset look / Keep editing. Use Round13 appearance ownership plus all template/illustration appearance keys; keep CSS source but disable it on confirmed reset. One undoable transaction.

Preview retains `[data-mode=fake]` test/pause, `[data-mode=live]` live channel, `[data-bg=dark/light/checker]`, `#burst` renamed Try 10 messages, `#stage`, `#caption`, `#status`, `#emote-status`. Missing channel focuses channel with explanation; failed connection offers Test chat. Tests never send chat messages. Global `[data-motion]` pauses preview/thumbnail timers and animation; separate from exported reduceMotion. Remove duplicate Transparent button `#transparent-toggle`; route to Style Background.

Reduced motion forces static authored artwork, no pulsing/shimmer/sliding/typewriter. Pause offscreen thumbnails. Font failure preserves choice: “Font unavailable. Showing a fallback.” Never label a fallback as the loaded font. Long labels wrap, no shrinking to unreadable type. Provide accessible transcript without a continuous live region. Loading keeps last preview. Invalid hex/number/URL preserves last valid state with associated inline error. Storage failure: “Your browser can't save this setup. Keep this page open and copy your link before leaving.” Session history still works.

## Exhaustive generated-control coverage

The table below is derived from current CONTROL_MAP/CONTROL_LABELS. Detailed tables above take precedence for copy, default visibility and IDs. Remaining fields live under their section's Show all options. Their labels below are exact copy combined with target/group (e.g. Viewer name → Shadow → Color). Booleans use switches; numbers unit-bearing sliders + exact numbers; paints swatch/hex/alpha; enums visual tiles/segments; free text input/textarea. Bounds follow renderer/normalizer; preserve finite custom values where no bound exists instead of inventing a narrower schema. Compatibility aliases are read from old payloads but not duplicated in editable UI. Array indices are initial gradient stops; added stops follow same controls.

| Existing setting path | Field copy | Destination |
|---|---|---|
| `templateFrame` | Template frame | Look / skin metadata |
| `templateMessageStyle` | Template message style | Look / skin metadata |
| `templateTitle` | Template title | Style / Frame |
| `templateSubtitle` | Template subtitle | Style / Frame |
| `frameColor` | Frame color | Style / Frame |
| `frameTint` | Frame tint | Style / Frame |
| `frameSaturation` | Frame saturation | Style / Frame |
| `glowColor` | Glow color | Style / Frame |
| `glowStrength` | Glow strength | Style / Frame |
| `glowAnimation` | Glow animation | Style / Frame |
| `middleBackground` | Middle background | Style / Frame |
| `middleColor` | Middle color | Style / Frame |
| `middleImage` | Middle image | Style / Frame |
| `middleOpacity` | Middle opacity | Style / Frame |
| `templateFont` | Template font | Style / Frame |
| `templateTextColor` | Template text color | Style / Frame |
| `templateNameMode` | Template name mode | Style / Frame |
| `templateMessageBorders` | Template message borders | Style / Frame |
| `illustrationSource` | Illustration source | Look / skin metadata |
| `illustrationSurface` | Illustration surface | Style / Frame |
| `transparentBackground` | Transparent background | Style / All options |
| `hideFrames` | Hide frames | Style / All options |
| `channel` | Channel | Chat |
| `fontFamily` | Font family | Compatibility only; canonical v3 control |
| `fontSize` | Font size | Compatibility only; canonical v3 control |
| `fontWeight` | Font weight | Compatibility only; canonical v3 control |
| `lineHeight` | Line height | Compatibility only; canonical v3 control |
| `textColor` | Text color | Compatibility only; canonical v3 control |
| `nameColorMode` | Name color mode | Style / All options |
| `nameColor` | Name color | Compatibility only; canonical v3 control |
| `systemColor` | System color | Compatibility only; canonical v3 control |
| `nameFormat` | Name format | Compatibility only; canonical v3 control |
| `showBadges` | Show badges | Style / All options |
| `outlineWidth` | Outline width | Compatibility only; canonical v3 control |
| `outlineColor` | Outline color | Compatibility only; canonical v3 control |
| `shadowEnabled` | Shadow enabled | Compatibility only; canonical v3 control |
| `shadowColor` | Shadow color | Compatibility only; canonical v3 control |
| `shadowOpacity` | Shadow opacity | Compatibility only; canonical v3 control |
| `shadowBlur` | Shadow blur | Compatibility only; canonical v3 control |
| `borderStyle` | Border style | Compatibility only; canonical v3 control |
| `borderColor` | Border color | Compatibility only; canonical v3 control |
| `borderWidth` | Border width | Compatibility only; canonical v3 control |
| `backgroundColor` | Background color | Compatibility only; canonical v3 control |
| `backgroundOpacity` | Background opacity | Compatibility only; canonical v3 control |
| `backgroundScope` | Background scope | Compatibility only; canonical v3 control |
| `cornerRadius` | Corner radius | Compatibility only; canonical v3 control |
| `paddingX` | Padding x | Compatibility only; canonical v3 control |
| `paddingY` | Padding y | Compatibility only; canonical v3 control |
| `messageSpacing` | Message spacing | Style / All options |
| `maxMessages` | Maximum messages | Chat |
| `messageLifetime` | Message lifetime | Chat |
| `direction` | Chat direction | Chat |
| `alignment` | Chat alignment | Chat |
| `overlayWidth` | Chat width | Style / All options |
| `edgeInset` | Edge inset | Style / All options |
| `animationIn` | Animation in | Chat |
| `animationDuration` | Entrance duration | Chat |
| `hideCommands` | Hide commands | Chat |
| `hideBots` | Hide bots | Chat |
| `botNames` | Bot names | Chat |
| `hideLinks` | Hide links | Chat |
| `borderEffect` | Border effect | Style / All options |
| `borderEffectSpeed` | Border effect speed | Style / All options |
| `borderEffectColor` | Border effect color | Style / All options |
| `nameEffect` | Name effect | Style / All options |
| `nameGradientColor1` | Name gradient color1 | Style / All options |
| `nameGradientColor2` | Name gradient color2 | Style / All options |
| `textEffect` | Text effect | Style / All options |
| `typewriterDuration` | Typewriter duration | Style / All options |
| `backgroundEffect` | Background effect | Style / All options |
| `backgroundSecondaryColor` | Background secondary color | Style / All options |
| `backgroundTreatment` | Background treatment | Style / All options |
| `ambientEffect` | Ambient effect | Style / All options |
| `roleColorsEnabled` | Use role colors | Style / All options |
| `broadcasterNameColor` | Broadcaster name color | Style / All options |
| `modNameColor` | Mod name color | Style / All options |
| `vipNameColor` | Vip name color | Style / All options |
| `subNameColor` | Sub name color | Style / All options |
| `mentionHighlightEnabled` | Highlight mentions | Chat |
| `mentionHighlightColor` | Mention highlight color | Chat |
| `reduceMotion` | Reduce motion | Chat |
| `parts.panel.fontFamily` | Font family | Style / All options |
| `parts.panel.fontSize` | Font size | Style / All options |
| `parts.panel.fontWeight` | Font weight | Style / All options |
| `parts.panel.italic` | Italic | Style / All options |
| `parts.panel.letterSpacing` | Letter spacing | Style / All options |
| `parts.panel.uppercase` | Uppercase | Style / All options |
| `parts.panel.lineHeight` | Line height | Style / All options |
| `parts.panel.inheritTypography` | Use parent typography | Style / All options |
| `parts.panel.paint.mode` | Color mode | Style / All options |
| `parts.panel.paint.color` | Color | Style / All options |
| `parts.panel.paint.angle` | Gradient angle | Style / All options |
| `parts.panel.paint.stops.0.color` | Color | Style / All options |
| `parts.panel.paint.stops.0.position` | Stop position | Style / All options |
| `parts.panel.paint.stops.1.color` | Color | Style / All options |
| `parts.panel.paint.stops.1.position` | Stop position | Style / All options |
| `parts.panel.outline.width` | Outline width | Style / All options |
| `parts.panel.outline.color` | Color | Style / All options |
| `parts.panel.shadow.enabled` | Shadow on | Style / All options |
| `parts.panel.shadow.color` | Color | Style / All options |
| `parts.panel.shadow.x` | Shadow offset X | Style / All options |
| `parts.panel.shadow.y` | Shadow offset Y | Style / All options |
| `parts.panel.shadow.blur` | Shadow blur | Style / All options |
| `parts.panel.glow.enabled` | Glow on | Style / All options |
| `parts.panel.glow.color` | Color | Style / All options |
| `parts.panel.glow.blur` | Glow blur | Style / All options |
| `parts.panel.glow.spread` | Glow spread | Style / All options |
| `parts.messageBox.fontFamily` | Font family | Style / All options |
| `parts.messageBox.fontSize` | Font size | Style / All options |
| `parts.messageBox.fontWeight` | Font weight | Style / All options |
| `parts.messageBox.italic` | Italic | Style / All options |
| `parts.messageBox.letterSpacing` | Letter spacing | Style / All options |
| `parts.messageBox.uppercase` | Uppercase | Style / All options |
| `parts.messageBox.lineHeight` | Line height | Style / All options |
| `parts.messageBox.inheritTypography` | Use parent typography | Style / All options |
| `parts.messageBox.paint.mode` | Color mode | Style / All options |
| `parts.messageBox.paint.color` | Color | Style / All options |
| `parts.messageBox.paint.angle` | Gradient angle | Style / All options |
| `parts.messageBox.paint.stops.0.color` | Color | Style / All options |
| `parts.messageBox.paint.stops.0.position` | Stop position | Style / All options |
| `parts.messageBox.paint.stops.1.color` | Color | Style / All options |
| `parts.messageBox.paint.stops.1.position` | Stop position | Style / All options |
| `parts.messageBox.outline.width` | Outline width | Style / All options |
| `parts.messageBox.outline.color` | Color | Style / All options |
| `parts.messageBox.shadow.enabled` | Shadow on | Style / All options |
| `parts.messageBox.shadow.color` | Color | Style / All options |
| `parts.messageBox.shadow.x` | Shadow offset X | Style / All options |
| `parts.messageBox.shadow.y` | Shadow offset Y | Style / All options |
| `parts.messageBox.shadow.blur` | Shadow blur | Style / All options |
| `parts.messageBox.glow.enabled` | Glow on | Style / All options |
| `parts.messageBox.glow.color` | Color | Style / All options |
| `parts.messageBox.glow.blur` | Glow blur | Style / All options |
| `parts.messageBox.glow.spread` | Glow spread | Style / All options |
| `parts.name.fontFamily` | Font family | Style / All options |
| `parts.name.fontSize` | Font size | Style / All options |
| `parts.name.fontWeight` | Font weight | Style / All options |
| `parts.name.italic` | Italic | Style / All options |
| `parts.name.letterSpacing` | Letter spacing | Style / All options |
| `parts.name.uppercase` | Uppercase | Style / All options |
| `parts.name.lineHeight` | Line height | Style / All options |
| `parts.name.inheritTypography` | Use parent typography | Style / All options |
| `parts.name.paint.mode` | Color mode | Style / All options |
| `parts.name.paint.color` | Color | Style / All options |
| `parts.name.paint.angle` | Gradient angle | Style / All options |
| `parts.name.paint.stops.0.color` | Color | Style / All options |
| `parts.name.paint.stops.0.position` | Stop position | Style / All options |
| `parts.name.paint.stops.1.color` | Color | Style / All options |
| `parts.name.paint.stops.1.position` | Stop position | Style / All options |
| `parts.name.outline.width` | Outline width | Style / All options |
| `parts.name.outline.color` | Color | Style / All options |
| `parts.name.shadow.enabled` | Shadow on | Style / All options |
| `parts.name.shadow.color` | Color | Style / All options |
| `parts.name.shadow.x` | Shadow offset X | Style / All options |
| `parts.name.shadow.y` | Shadow offset Y | Style / All options |
| `parts.name.shadow.blur` | Shadow blur | Style / All options |
| `parts.name.glow.enabled` | Glow on | Style / All options |
| `parts.name.glow.color` | Color | Style / All options |
| `parts.name.glow.blur` | Glow blur | Style / All options |
| `parts.name.glow.spread` | Glow spread | Style / All options |
| `parts.messageText.fontFamily` | Font family | Style / All options |
| `parts.messageText.fontSize` | Font size | Style / All options |
| `parts.messageText.fontWeight` | Font weight | Style / All options |
| `parts.messageText.italic` | Italic | Style / All options |
| `parts.messageText.letterSpacing` | Letter spacing | Style / All options |
| `parts.messageText.uppercase` | Uppercase | Style / All options |
| `parts.messageText.lineHeight` | Line height | Style / All options |
| `parts.messageText.inheritTypography` | Use parent typography | Style / All options |
| `parts.messageText.paint.mode` | Color mode | Style / All options |
| `parts.messageText.paint.color` | Color | Style / All options |
| `parts.messageText.paint.angle` | Gradient angle | Style / All options |
| `parts.messageText.paint.stops.0.color` | Color | Style / All options |
| `parts.messageText.paint.stops.0.position` | Stop position | Style / All options |
| `parts.messageText.paint.stops.1.color` | Color | Style / All options |
| `parts.messageText.paint.stops.1.position` | Stop position | Style / All options |
| `parts.messageText.outline.width` | Outline width | Style / All options |
| `parts.messageText.outline.color` | Color | Style / All options |
| `parts.messageText.shadow.enabled` | Shadow on | Style / All options |
| `parts.messageText.shadow.color` | Color | Style / All options |
| `parts.messageText.shadow.x` | Shadow offset X | Style / All options |
| `parts.messageText.shadow.y` | Shadow offset Y | Style / All options |
| `parts.messageText.shadow.blur` | Shadow blur | Style / All options |
| `parts.messageText.glow.enabled` | Glow on | Style / All options |
| `parts.messageText.glow.color` | Color | Style / All options |
| `parts.messageText.glow.blur` | Glow blur | Style / All options |
| `parts.messageText.glow.spread` | Glow spread | Style / All options |
| `parts.badges.fontFamily` | Font family | Style / All options |
| `parts.badges.fontSize` | Font size | Style / All options |
| `parts.badges.fontWeight` | Font weight | Style / All options |
| `parts.badges.italic` | Italic | Style / All options |
| `parts.badges.letterSpacing` | Letter spacing | Style / All options |
| `parts.badges.uppercase` | Uppercase | Style / All options |
| `parts.badges.lineHeight` | Line height | Style / All options |
| `parts.badges.inheritTypography` | Use parent typography | Style / All options |
| `parts.badges.paint.mode` | Color mode | Style / All options |
| `parts.badges.paint.color` | Color | Style / All options |
| `parts.badges.paint.angle` | Gradient angle | Style / All options |
| `parts.badges.paint.stops.0.color` | Color | Style / All options |
| `parts.badges.paint.stops.0.position` | Stop position | Style / All options |
| `parts.badges.paint.stops.1.color` | Color | Style / All options |
| `parts.badges.paint.stops.1.position` | Stop position | Style / All options |
| `parts.badges.outline.width` | Outline width | Style / All options |
| `parts.badges.outline.color` | Color | Style / All options |
| `parts.badges.shadow.enabled` | Shadow on | Style / All options |
| `parts.badges.shadow.color` | Color | Style / All options |
| `parts.badges.shadow.x` | Shadow offset X | Style / All options |
| `parts.badges.shadow.y` | Shadow offset Y | Style / All options |
| `parts.badges.shadow.blur` | Shadow blur | Style / All options |
| `parts.badges.glow.enabled` | Glow on | Style / All options |
| `parts.badges.glow.color` | Color | Style / All options |
| `parts.badges.glow.blur` | Glow blur | Style / All options |
| `parts.badges.glow.spread` | Glow spread | Style / All options |
| `parts.system.fontFamily` | Font family | Style / All options |
| `parts.system.fontSize` | Font size | Style / All options |
| `parts.system.fontWeight` | Font weight | Style / All options |
| `parts.system.italic` | Italic | Style / All options |
| `parts.system.letterSpacing` | Letter spacing | Style / All options |
| `parts.system.uppercase` | Uppercase | Style / All options |
| `parts.system.lineHeight` | Line height | Style / All options |
| `parts.system.inheritTypography` | Use parent typography | Style / All options |
| `parts.system.paint.mode` | Color mode | Style / All options |
| `parts.system.paint.color` | Color | Style / All options |
| `parts.system.paint.angle` | Gradient angle | Style / All options |
| `parts.system.paint.stops.0.color` | Color | Style / All options |
| `parts.system.paint.stops.0.position` | Stop position | Style / All options |
| `parts.system.paint.stops.1.color` | Color | Style / All options |
| `parts.system.paint.stops.1.position` | Stop position | Style / All options |
| `parts.system.outline.width` | Outline width | Style / All options |
| `parts.system.outline.color` | Color | Style / All options |
| `parts.system.shadow.enabled` | Shadow on | Style / All options |
| `parts.system.shadow.color` | Color | Style / All options |
| `parts.system.shadow.x` | Shadow offset X | Style / All options |
| `parts.system.shadow.y` | Shadow offset Y | Style / All options |
| `parts.system.shadow.blur` | Shadow blur | Style / All options |
| `parts.system.glow.enabled` | Glow on | Style / All options |
| `parts.system.glow.color` | Color | Style / All options |
| `parts.system.glow.blur` | Glow blur | Style / All options |
| `parts.system.glow.spread` | Glow spread | Style / All options |
| `frame.target` | Frame target | Style / All options |
| `frame.style` | Frame style | Style / All options |
| `frame.width` | Frame width | Style / All options |
| `frame.paint.mode` | Color mode | Style / All options |
| `frame.paint.color` | Color | Style / All options |
| `frame.paint.angle` | Gradient angle | Style / All options |
| `frame.paint.stops.0.color` | Color | Style / All options |
| `frame.paint.stops.0.position` | Stop position | Style / All options |
| `frame.paint.stops.1.color` | Color | Style / All options |
| `frame.paint.stops.1.position` | Stop position | Style / All options |
| `frame.radius.topLeft` | Top left radius | Style / All options |
| `frame.radius.topRight` | Top right radius | Style / All options |
| `frame.radius.bottomRight` | Bottom right radius | Style / All options |
| `frame.radius.bottomLeft` | Bottom left radius | Style / All options |
| `frame.padding.top` | Top padding | Style / All options |
| `frame.padding.right` | Right padding | Style / All options |
| `frame.padding.bottom` | Bottom padding | Style / All options |
| `frame.padding.left` | Left padding | Style / All options |
| `frame.doubleGap` | Double frame gap | Style / All options |
| `frame.pixelStep` | Pixel step | Style / All options |
| `frame.outer.enabled` | Shadow on | Style / All options |
| `frame.outer.width` | Outline width | Style / All options |
| `frame.outer.color` | Color | Style / All options |
| `frame.outer.offset` | Offset | Style / All options |
| `frame.ornament.style` | Frame style | Style / All options |
| `frame.ornament.color` | Color | Style / All options |
| `frame.ornament.size` | Ornament size | Style / All options |
| `frame.ornament.width` | Outline width | Style / All options |
| `frame.ornament.inset` | Ornament inset | Style / All options |
| `frame.legacyDetail` | Legacy detail | Style / All options |
| `backgrounds.message.mode` | Color mode | Style / All options |
| `backgrounds.message.color` | Color | Style / All options |
| `backgrounds.message.stops.0.color` | Color | Style / All options |
| `backgrounds.message.stops.0.position` | Stop position | Style / All options |
| `backgrounds.message.stops.1.color` | Color | Style / All options |
| `backgrounds.message.stops.1.position` | Stop position | Style / All options |
| `backgrounds.message.angle` | Gradient angle | Style / All options |
| `backgrounds.message.radialCenterX` | Gradient center X | Style / All options |
| `backgrounds.message.radialCenterY` | Gradient center Y | Style / All options |
| `backgrounds.message.imageUrl` | Image URL | Style / All options |
| `backgrounds.message.imageFit` | Image fit | Style / All options |
| `backgrounds.message.imageOpacity` | Image opacity | Style / All options |
| `backgrounds.message.opacity` | Opacity | Style / All options |
| `backgrounds.message.backdropBlur` | Backdrop blur | Style / All options |
| `backgrounds.message.recipe` | Background recipe | Style / All options |
| `backgrounds.panel.mode` | Color mode | Style / All options |
| `backgrounds.panel.color` | Color | Style / All options |
| `backgrounds.panel.stops.0.color` | Color | Style / All options |
| `backgrounds.panel.stops.0.position` | Stop position | Style / All options |
| `backgrounds.panel.stops.1.color` | Color | Style / All options |
| `backgrounds.panel.stops.1.position` | Stop position | Style / All options |
| `backgrounds.panel.angle` | Gradient angle | Style / All options |
| `backgrounds.panel.radialCenterX` | Gradient center X | Style / All options |
| `backgrounds.panel.radialCenterY` | Gradient center Y | Style / All options |
| `backgrounds.panel.imageUrl` | Image URL | Style / All options |
| `backgrounds.panel.imageFit` | Image fit | Style / All options |
| `backgrounds.panel.imageOpacity` | Image opacity | Style / All options |
| `backgrounds.panel.opacity` | Opacity | Style / All options |
| `backgrounds.panel.backdropBlur` | Backdrop blur | Style / All options |
| `backgrounds.panel.recipe` | Background recipe | Style / All options |
| `nameTemplate` | Name template | Style / All options |
| `animationOut` | Animation out | Chat |
| `animationOutDuration` | Removal duration | Chat |
| `customCSS.enabled` | Shadow on | Style / All options |
| `customCSS.source` | Custom CSS | Style / All options |
| `effectColors.broadcaster` | Broadcaster | Style / All options |
| `effectColors.moderator` | Moderator | Style / All options |
| `effectColors.vip` | Vip | Style / All options |
| `effectColors.subscriber` | Subscriber | Style / All options |
| `effectColors.mention` | Mention | Style / All options |
| `effectColors.borderSecondary` | Border secondary | Style / All options |
| `presentation.layout` | Name layout | Style / All options |
| `presentation.shape` | Message shape | Style / All options |
| `presentation.nameTreatment` | Name treatment | Style / All options |
| `presentation.accent` | Frame accent | Style / All options |
| `presentation.chipColor` | Name chip color | Style / All options |
| `presentation.columnWidth` | Name column width | Style / All options |
| `presentation.initialSize` | Initial size | Style / All options |
| `presentation.tailSize` | Speech tail size | Style / All options |
| `presentation.cutSize` | Cut corner size | Style / All options |
| `nameStyle.readableColors` | Keep names readable | Style / All options |
| `nameStyle.minContrast` | Minimum name contrast | Style / All options |
| `grouping.enabled` | Shadow on | Chat |
| `grouping.windowSeconds` | Group within | Chat |
| `messageLimits.maxLineCh` | Maximum line length | Chat |
| `messageLimits.maxLines` | Maximum message lines | Chat |
| `lifecycle.fadeMaskPx` | Overflow fade depth | Chat |
| `emphasis.firstMessage` | Highlight tagged first messages | Chat |
| `emphasis.color` | Color | Chat |
| `emotes.sevenTV` | 7TV emotes | Chat |
| `emotes.bttv` | BTTV emotes | Chat |
| `emotes.ffz` | FFZ emotes | Chat |
| `emotes.emoteOnlyScale` | Emote only scale | Chat |
| `emotes.inlineSize` | Inline emote size | Chat |
| `illustration.layers.header.enabled` | Shadow on | Style / Frame |
| `illustration.layers.header.color` | Color | Style / Frame |
| `illustration.layers.corners.enabled` | Shadow on | Style / Frame |
| `illustration.layers.corners.color` | Color | Style / Frame |
| `illustration.layers.edges.enabled` | Shadow on | Style / Frame |
| `illustration.layers.edges.color` | Color | Style / Frame |
| `illustration.layers.mascot.enabled` | Shadow on | Style / Frame |
| `illustration.layers.mascot.color` | Color | Style / Frame |
| `illustration.layers.particles.enabled` | Shadow on | Style / Frame |
| `illustration.layers.particles.color` | Color | Style / Frame |
| `illustration.layers.glitch.enabled` | Shadow on | Style / Frame |
| `illustration.layers.glitch.color` | Color | Style / Frame |
| `illustration.layers.glow.enabled` | Glow on | Style / Frame |
| `illustration.layers.glow.color` | Color | Style / Frame |
| `channels.enabled` | Enable chat channels | Chat |
| `channels.rules` | Chat channel rules | Chat |

`channels.rules` expands to the per-rule schema above; no raw array editor. Generated IDs are proposals, explicit IDs elsewhere verified from source. schemaVersion stays internal. Legacy effects without canonical aliases stay exposed under Style with effect samples. This routing supersedes controls.js Motion fallthrough for unrelated fields.

## Mockup scope and acceptance

Open round15-options-mockup.html directly. Starts on Style/Mothlight. Look and Get link work; Desktop/Mobile buttons open a 390px embedded phone viewport. Same file responds to actual resizing. Uses existing frame art and Google Fonts with local fallbacks. This is an approximate renderer, not the fit engine. No Twitch, real clipboard, persistence or complete all-options implementation. Image mode uses a labeled built-in texture. Chat is a grouping sample; Viewers/Alerts are explicit placeholders, fully specified above. Study reset is immediate/reversible; production uses the inline review. Mobile inspector is approximate; production Enlarge preview follows the layout contract.

Builder acceptance: verify all bindings; preserve custom values across tabs, disclosure and link round trips; one gesture per undo; frame vibes preserve art; no duplicate background/font bindings; all enabled features in one link; failed auth/copy keeps draft; edits invalidate copied revision; preview ?60% desktop; reachable inputs at 320/390/768 and 400% zoom; sticky preview/dock never hide focus; check keyboard, contrast, reduced motion, unavailable fonts/images, long names, live chat and OBS sizing.

Verification performed: inline JavaScript parses; static document IDs are unique; all referenced local frame/brand assets exist; size presets match Round13; coverage appendix includes 347 current generated paths. Python Playwright is unavailable. Both installed Chromium variants failed sustained launch with Windows access-denied errors, so visual rendering, interaction and keyboard checks remain unverified in a browser. No production tests or OBS checks are claimed.
