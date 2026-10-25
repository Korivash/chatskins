# Round 13 — Make it mine

Design handoff, 25 October 2026. Scope: this specification and `round13-simple-mockup.html` only. Production behavior below is proposed wiring, not implemented functionality. Read against `editor.html`, `js/editor.js`, `js/controls.js`, `DESIGN.md`, `round11-setup.md`, and `skins.json`. Keep every existing setting and saved look. No schema migration or new appearance keys are required.

## Direction and layout

Let someone recognize a look, pick their color, and see its size on a stream before asking them to understand an editor. The conversation is the visual centerpiece. No account required to design. No feature setup above the first appearance choice.

Use the existing black/blue shell: canvas #05070D, surface #0B1425, raised #101E34, text #F3F7FF, secondary text #A6B6CD, action #74A6FF, focus #38BDF8. Action ink #031020. Familjen Grotesk headings, Manrope controls, system fallbacks; actual selected fonts inside chat and font tiles. Heading 36/40, section 24/30, body 16/25, helper 14/21. Left-aligned copy; 24px section spacing, 12px choice gaps, 12px corners, 48px minimum controls.

Desktop: 1120px maximum content width; 52% questions/pickers, 48% sticky stream preview. Keep Undo and Start over in the top utility row at every level, including setup. Below 800px use one column, a compact preview above the active question, then choices. Do not make the preview sticky on short screens. Sticky bottom Back/Continue bar respects safe-area inset, wraps at 320px and reserves its own document space. No nested scroll areas. Simple groups have headings and whitespace rather than ten nested panels.

```text
ChatSkins                                Undo · Start over
Make it mine
[Guided]  [Simple]  [Advanced]
1 Vibe · 2 Colors · 3 Size        Your stream preview
What's your vibe?                1920 × 1080 stream frame
[Cozy] [Hype] [Spooky]            actual-size chat footprint
[Clean] [Gamer] [Cute]            [Dark game] [Bright game]
Luna's tip                       [See chat up close]
[Back] [Continue]
```

Plan critique: six decorative emoji buttons would still ask users to imagine the result. Each choice instead contains the same two rendered chat messages with its actual type, frame and motion. Only the chat varies; blue editor chrome stays stable. The static review sheet shows all three questions and Simple together for inspection; the shipped Guided view shows one question at a time.

## Entry, navigation and exact copy

Fresh entry means no valid URL settings, requested skin, restored OAuth draft, or saved working draft. Open Guided at question 1 with Clean / Stream blue / M applied as editable defaults. They are selected, not claimed as answered. Never override an incoming look to run onboarding. Existing drafts and skin links open their last level, otherwise Simple, with “Want a hand? Try the 3 questions.” Completing once makes Simple the next default. Store completion, active step and level as local editor metadata, outside the overlay payload; failed local storage must not prevent editing.

Heading: **“Make it mine”**. Helper: **“Three easy choices. You can change everything later.”** Level labels: **“Guided”**, **“Simple”**, **“Advanced”**. Supporting text: “Three quick choices” / “Pick what looks right” / “Every setting, just where you left it”. Switching levels only changes the view; it never applies a preset or rounds a value.

| Step | Exact heading and helper | Choices | Navigation |
| --- | --- | --- | --- |
| 1 | “What's your vibe?” / “Tap a look to see it on your stream.” | Cozy — Soft and relaxed; Hype — Bold and lively; Spooky — Dark and eerie; Clean — Quiet and clear; Gamer — Sharp and focused; Cute — Round and playful | “Continue”; “Skip to Simple” |
| 2 | “Your colors” / “Pick a palette. We'll match the little details.” | Stream blue; Mint; Sunset; Lavender; Rose; Gold; “Use my own color” | “Back”; “Continue” |
| 3 | “How big?” / “See how much space chat takes on a 1080p stream.” | “S · Small”; “M · Medium”; “L · Large” | “Back”; **“Done, get my link”**; “Keep customizing” |

Click, tap, Space or native radio arrow selection immediately applies the answer. Hover/focus alone never commits. Update sample chat without clearing/replaying its messages. Preserve previous answers when going Back; a later vibe change does not replace colors or size. Continue accepts the visible default. “Keep customizing” opens Simple; Done opens setup. Preview caption: **“Sample chat · 1920 × 1080 stream”**; helper: “This is a preview. Nothing has changed in OBS.” Preview-only Dark game / Bright game / See chat up close never change exported settings.

## Exact settings contract

Use the normalized v3 state and current renderer. All paths below are real existing settings. `P` means each of `panel`, `messageBox`, `name`, `messageText`, `badges`, `system` under `parts`; `T` means name, messageText and system only. A multi-key choice is one transaction through an extension of `changeSimple`, with one normalization/render and one history entry; do not call `set()` per leaf. Do not apply skin metadata again after these patches. The mockup uses CSS approximations, not the production renderer.

Fresh foundation: normalized `skins.find(id === 'clean').settings`, existing Clean metadata, then Clean vibe, Stream blue palette, M size, Transparent background. This is a recipe derived from Clean, not six new catalog entries or copies of catalog skins. Keep the entire 52-entry catalog in Advanced. No vibe sets baseSkinId to an unrelated catalog ID. On an existing look, apply only the explicit keys below; all other keys stay byte-for-byte equivalent after normal normalization. Custom CSS, role colors and channel rules may override appearance: show “Some details have custom settings. Open Advanced to change them.” with a link; never disable them silently.

### 1. Vibe patch

Every vibe sets `parts.P.fontFamily` to the table's font; `presentation.layout='inline'`, `presentation.nameTreatment='plain'`, `presentation.accent='none'`, `frame.target='message'`, `hideFrames=false`, `frame.outer.enabled=false`, `frame.ornament.style='none'`, `frame.legacyDetail='none'`, and `frame.paint.mode='solid'`. Set each of `frame.radius.topLeft/topRight/bottomRight/bottomLeft` to radius. Set `parts.name.fontWeight=700`, `parts.messageText.fontWeight=500`. Other font attributes are preserved. No background, color, size, filter, channel, motion preference or integration changes.

| Answer | `parts.P.fontFamily` | `presentation.shape` | `frame.style` | `frame.width` | Radius | `animationIn` | `animationDuration` (ms) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Cozy | Nunito Sans | rect | solid | 2 | 18 | fade | 180 |
| Hype | Barlow | slash | double | 2 | 4 | pop | 180 |
| Spooky | IBM Plex Mono | rect | solid | 2 | 2 | fade | 180 |
| Clean | DM Sans | rect | none | 0 | 6 | fade | 180 |
| Gamer | Chakra Petch | rect | beveled | 2 | 4 | slide | 180 |
| Cute | Nunito Sans | speech | solid | 2 | 20 | pop | 180 |

Additionally set `frame.doubleGap=2`, `presentation.cutSize=12`, `presentation.tailSize=10` for all vibes so these geometries are deterministic. `reduceMotion` and OS preference always override motion in rendering, never get cleared by a vibe.

### 2. Color patch

All values are sRGB hex. A is accent; B is dark backing. Six palettes deliberately use pale accents and dark surfaces for legibility. Apply the common patch below for both palette and custom color.

| Answer | A | B |
| --- | --- | --- |
| Stream blue | #A9CAFF | #111C2E |
| Mint | #9CE8CF | #10251F |
| Sunset | #FFBC9C | #2B1A16 |
| Lavender | #D4BDFF | #211A31 |
| Rose | #FFB8D4 | #2E1924 |
| Gold | #FFE095 | #2A2314 |

Common patch: `parts.name.paint.mode='solid'`, `parts.name.paint.color=A+'FF'`; `frame.paint.mode='solid'`, `frame.paint.color=A+'FF'`; `frame.ornament.color=A+'FF'`; `presentation.chipColor=B+'FF'`; `parts.messageText.paint.mode=parts.system.paint.mode='solid'`; `parts.messageText.paint.color=parts.system.paint.color='#F3F7FFFF'`; `backgrounds.message.color=backgrounds.panel.color=B+'FF'`; `nameStyle.readableColors=true`, `nameStyle.minContrast=4.5`. Existing opacity, background mode/images and gradient stops are untouched. On an existing gradient/image show “Your custom background is still on. Change it under Background.” Plain-color recipes are available in Simple.

“Use my own color” reveals one labeled picker, **“Your color”**, plus a synchronized #RRGGBB text entry for keyboard use. Derive B per channel as `round(.12 * Cchannel)`; derive A by mixing C toward white in 1% steps in encoded sRGB, selecting the first result with WCAG relative-luminance contrast ≥4.5:1 against opaque B. Alpha is FF. Label: “We match the background and keep names readable.” Never promise contrast over arbitrary gameplay; keep Bright game preview and soft-background tip available. Invalid text: “Use a color like #74A6FF.” Preserve the previous valid color. Drag updates preview immediately, release/change commits once; Escape cancels an uncommitted picker edit. Named palette selection is exact matching of all its owned keys; otherwise display “Your colors”.

### 3. Size patch

| Answer | `overlayWidth` | `parts.P.fontSize` | `emotes.inlineSize` | `messageSpacing` | `edgeInset` |
| --- | --- | --- | --- | --- | --- |
| S · Small | 360 | 20 | 26 | 6 | 20 |
| M · Medium | 480 | 26 | 32 | 10 | 20 |
| L · Large | 600 | 32 | 40 | 14 | 20 |

Units are source pixels. This follows the existing Simple size convention of changing all six parts. It does not change message count, lifetime, crop height or OBS source size. Render a 1920×1080 preview and uniformly fit it; widths occupy 18.75%, 25%, 31.25% of the frame. Put chat at bottom left for fresh Clean; honor saved direction/alignment otherwise. The full-size chat detail is a separate preview, never a misleading enlargement inside the stream frame. Mockup labels source metrics and uses a miniature at proportional width; production must also scale text, padding and inset uniformly.

## Simple: ten controls, no dropdowns

The first three reuse the guided choices. These are ten control groups, not a limit of ten individual options. Keep the preview beside them and one “Get my link” action below. Changes affect only the group's documented keys. Never rewrite state when merely opening Simple. When an Advanced value does not exactly match a recipe, show a selected read-only **“Custom · kept as is”** tile with “Edit in Advanced”; do not show a false selected preset or clamp an out-of-range value.

| Group / exact label | Visual choices and settings |
| --- | --- |
| 1 “Vibe” | Six miniature conversations; same vibe patch. “More looks in Advanced” links to full gallery. |
| 2 “Colors” | Six named three-swatch palettes + custom picker; same color patch. |
| 3 “Chat size” | S/M/L cards with stream silhouettes; same size patch. |
| 4 “Font” | Render “Hey chat! 123” in DM Sans, Barlow, Nunito Sans, IBM Plex Mono, Chakra Petch, Atkinson Hyperlegible. Tile footer spells out font name. Set `parts.P.fontFamily` only, as current Simple does. Preserve any other selected font with a Custom tile. |
| 5 “Text size” | “Smaller” / range 14–40 step 1 / “Bigger”, plus labeled number input “Text size in pixels”. Set `parts.P.fontSize` only. A resulting nonmatching S/M/L becomes Custom. |
| 6 “Background” | Transparent first, badge “Recommended”; Soft; Solid. Transparent: `transparentBackground=true`, both `backgrounds.message.opacity` and `.panel.opacity=0`; preserve underlying colors/blur. Soft: false, message opacity .86, panel opacity 0, message backdropBlur 0. Solid: false, message opacity 1, panel opacity 0, message backdropBlur 0. Soft/Solid also set message mode='solid', recipe='none', imageUrl=''; use existing message color with FF alpha. This deliberately replaces a custom message background only on selection and is fully undoable. Helper: “Transparent shows your game. Add a background if chat is hard to read.” Existing Glass remains available unchanged in Advanced. Do not imply blur can blur an OBS gameplay source. |
| 7 “Frame” | Five thumbnails: None, Line, Double, Beveled, Pixel. Set `frame.style=none/solid/double/beveled/pixel`, `frame.width=0/2/2/2/2`, `hideFrames=false`; None also sets `frame.outer.enabled=false`, `frame.ornament.style='none'`, `presentation.accent='none'`, `frame.legacyDetail='none'`. Preserve radius, target and all other geometry. Other existing styles get Custom. |
| 8 “New messages” | None, Fade, Slide, Pop, shown as one tiny message arriving every 3 seconds. Set `animationIn=none/fade/slide/pop`, `animationDuration=0/180/180/180`. Pause all offscreen loops; global “Pause previews” controls demos only. Reduced motion uses static start/end thumbnails with text descriptions. |
| 9 “Messages on screen” | Three count diagrams: “A few” / “Balanced” / “Lots”; set `maxMessages=4/8/12`. Preview caption “Up to {n} messages; long messages may take more room.” |
| 10 “Hide chat commands” | Labeled On/Off switch with “Keep messages like !skin out of your chat display.” Set `hideCommands` boolean only; parsing for chat play is unchanged. |

Advanced preserves the existing `CONTROL_MAP`/`CONTROL_LABELS` fields, grouping, search, ranges, section resets, skin gallery, My skins, import/export, custom CSS and existing alert/chat-play fine-tuning. Do not duplicate or remove legacy controls. The only wrapper addition is navigation back to Simple/Guided and persistent Undo/Start over. “Plain words everywhere” applies to new entry points and helper copy; leave existing Advanced terminology and values unchanged as requested. Under Advanced's heading say “Every setting is here. Use Find a setting to jump to one.”

## Luna's tip: deterministic, local and optional

Small blue-edged box beneath the active group: **“Luna's tip”**, exactly one sentence below, and **“Do it for me”**. No chat input, generated advice, remote call or model. Evaluate only local state and preview mode. Do not infer the actual game or audience device. Choose the first matching rule for the active section in table order; the global reduced-motion rule wins. Show one tip, never a queue. No matching rule: sentence “Looks good to go; you can change it any time.” and omit action.

Use the atomic patches above where referenced. Precheck that the action changes a value. Pin the applied tip until the next deliberate section change; replace its button with **“Done”** and “Undo” to avoid a moving target. Undo restores state and eligibility without immediately reapplying anything. Dismiss with “Hide tip” for the session. No automatic fixes.

| # | Section and exact trigger | One-sentence tip | Exact action |
| --- | --- | --- | --- |
| 1 | Any; OS reduced motion and `reduceMotion=false` | “Prefer less movement? Keep your chat still.” | `reduceMotion=true` |
| 2 | Background; preview Bright game and `transparentBackground=true` | “Hard to read on bright games? Add a soft background.” | Soft background patch |
| 3 | Size/Text size; `parts.messageText.fontSize<28` | “Big text helps on small screens.” | `parts.P.fontSize=28`; `emotes.inlineSize=34` |
| 4 | Font; family not Atkinson Hyperlegible | “Give similar-looking letters a little more room to stand apart.” | `parts.P.fontFamily='Atkinson Hyperlegible'` |
| 5 | Colors; `nameStyle.readableColors=false` or minContrast<4.5 | “Keep viewer names easy to read.” | `nameStyle.readableColors=true`, `nameStyle.minContrast=4.5` |
| 6 | Frame; `hideFrames=true` or frame.style='none' | “A simple line helps separate chat from the game.” | `hideFrames=false`, `frame.style='solid'`, `frame.width=2` |
| 7 | New messages; animationIn not 'none' | “Want less distraction? Let new messages appear without moving.” | `animationIn='none'`, `animationDuration=0` |
| 8 | Messages on screen; maxMessages>8 | “Leave more room for the game with fewer messages.” | `maxMessages=8` |
| 9 | Hide chat commands; hideCommands=false | “Keep commands like !skin out of the conversation.” | `hideCommands=true` |
| 10 | Size; overlayWidth>480 | “A narrower chat leaves more of your game in view.” | `overlayWidth=480` |
| 11 | Background; transparent=true and messageText shadow disabled | “A soft text shadow helps letters stand out.” | `parts.messageText.shadow={enabled:true,color:'#000000CC',x:0,y:1,blur:3}` |
| 12 | Messages on screen; messageLifetime>30 or =0 | “Let older messages clear after 30 seconds.” | `messageLifetime=30` |
| 13 | Size/Text size; messageSpacing<10 | “Give each message a little breathing room.” | `messageSpacing=10` |
| 14 | Font; messageText.lineHeight<1.4 | “More space between lines makes long messages easier to follow.” | `parts.P.lineHeight=1.4` |
| 15 | Vibe; animationIn='none' and reduceMotion=false and OS permits motion | “A gentle fade gives new messages a quiet hello.” | `animationIn='fade'`, `animationDuration=180` |

In Guided, Vibe uses Vibe/Font rules, Colors uses Colors/Background rules, Size uses Size/Text size rules, preserving table priority. “Do it for me” only changes appearance/local settings; it never signs in, creates rewards or copies a private link.

## Done and the one-link handoff

Done accepts the current visible choices, sets onboarding complete and moves focus to **“Let's get you on stream.”** Helper: “Add your channel, then copy one link into OBS.” Retain current appearance as the home look; no reset to catalog defaults. Show **“Back to my look”**. Use the existing `#guided-setup` connection/account and combined-link logic, with the Round 11 stacked Chat commands / Channel points / Alerts cards, checklists, fine-tuning, shared authorization review and Off / Needs Twitch login / Ready / Problem states. Fresh commands On, points/alerts Off; retain all saved Off choices.

Round 11 still describes some per-feature copy actions. For this handoff, consolidate their outcomes into **one “Copy overlay link” action** for the complete selected configuration, matching today's editor entry point. Do not silently omit an enabled feature to make a link available. If any enabled authenticated feature is unresolved, show “Finish the steps below to get your link.” and point to the first fix. Commands alone continue without Twitch login. Copy is not triggered by Done. No private URL in the default preview or mockup.

After copy: “Copied. Paste it into your chat Browser Source in OBS.” Show 1920×1080 as the proposed full-scene source dimensions, explain replacing the existing chat URL, and keep Round 11's **“I added this in OBS”** confirmation. A design change invalidates copied revision/OBS confirmation: “Your settings changed. Copy a fresh link into OBS.” No remote-update promise. Auth cancellation, partial reward creation, wrong account, clipboard failure and expired access use Round 11 recovery with the design draft retained. Single-link composition is a builder acceptance requirement, not proof the backend supports every combination.

## Recovery and states

| State | Visible behavior and exact copy |
| --- | --- |
| Selected answer | 2px blue outline, checkmark and accessible checked state; never color alone. “{choice} applied” in a polite status region after commit. |
| Guided returning with custom values | Keep preview; “You've made this your own. Pick a choice to replace that part.” No default overwrites. |
| Undo available | Always visible “Undo”; restore complete last transaction including recipe selection metadata, base, label and baseline if altered. Keep focus on Undo. Up to 100 session transactions, existing Redo remains in Advanced. |
| No undo | Visible disabled Undo with adjacent “Nothing to undo yet.” |
| Start over | Inline review: “Start your look again?” / “This resets your look to Clean, Stream blue and Medium. Your channel and Twitch setup stay the same.” Buttons “Start over” / “Keep my look”. Confirm applies fresh appearance defaults, preserves channel, filters, provider preferences, reduced-motion choice, integration configuration and library; pushes one undo entry and opens step 1. No Twitch mutation or saved-skin deletion. Custom CSS source is retained but disabled as part of this explicitly confirmed appearance reset. |
| Failed preset/data load | Keep last valid state; “We couldn't load that look. Try again.” / “Try again”. Never render an empty editor. |
| Font unavailable | Preserve value; “That font couldn't load. Showing a fallback for now.” / “Try again”. Tile identifies fallback until loaded. |
| Storage unavailable | “Your browser can't save this setup. Keep this page open and copy your link before leaving.” Session history still works. |
| No settings match recipe | “Custom · kept as is”; reopening a level must not alter the preview or serialized state. |

Start-over implementation: reset the explicit appearance roots `parts`, `frame`, `backgrounds`, `presentation`, `nameStyle`, `nameTemplate`, `overlayWidth`, `edgeInset`, `messageSpacing`, `alignment`, `direction`, `animationIn`, `animationDuration`, `animationOut`, `animationOutDuration`, `hideFrames`, `transparentBackground` to fresh foundation values; disable `customCSS.enabled`; reset visual effect keys `borderEffect`, `nameEffect`, `textEffect`, `backgroundEffect`, `ambientEffect` to 'none'. Preserve everything else, including source text, grouping, message limits/lifetime/count, role/channel rules and filters. Set base/label/baseline coherently and include their old values in Undo. Copy for returning custom-rule users adds “Your custom message rules stay on.”

## Access and acceptance

Native fieldset/legend radio groups, labels and buttons. Tab enters each group, arrow keys change choice, Space selects; DOM order follows visual order. Card text is included in accessible name; miniatures are aria-hidden. At least 48×48 targets, 2px cyan focus with 3px offset, 4.5:1 text and 3:1 control/selection boundaries. Selected outline also uses a checkmark. No palette name conveyed only by color. Avoid forced auto-advance or unexpected focus jumps. Tips are not alerts; chat sample messages are not live regions. Announce completed actions once.

Honor reduced motion and global Pause previews; stop offscreen looping animation thumbnails and preview chat timers. Font tiles wait for font readiness or explicitly show fallback. Support 320px, 390px, 768px, 1280px and 400% zoom with no horizontal document scroll or obscured focus. Test long names and translated labels. Contrast-check sample chat over both black and white extremes; transparent remains recommended for visibility of the game, not a guarantee of readable text on every game.

Builder checks: every option maps to a valid existing key/enum; one choice/drag/tip equals one Undo; Back preserves later answers; incoming URL/draft wins onboarding; all Advanced controls and non-Simple values round-trip unchanged; custom CSS/rules stay visible as overrides; Undo restores start-over and link-dirty state; S/M/L fit the actual 1080p frame; reduced motion and pause stop all loops; one link includes all enabled features; failed auth/copy keeps design. This design delivery does not claim production/browser/OBS tests passed.
