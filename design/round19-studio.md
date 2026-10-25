# Round 19 — Frame Studio

Design handoff. Owner direction: “let people basically craft their own”. Open [the interactive workbench](round19-studio-mockup.html) directly from disk. [Original SVG library](parts19/). No application runtime changes.

## Direction

A parts box beside a large craft surface. The composition is the hero; the controls are tools. Tokens: desk #182B 43, drawer #223751, raised #304761, boundary #72849C, ink #EDF 3FC, action rose #F 3B 7CD, secondary ice #A 8D 9EE, focus #FFE 39B. Trebuchet MS / Segoe UI locally available stack; production retains Round 15 DM Sans. Heading 38/42, section 21/28, controls 16/22, helper 13/19. Left-aligned labels, centered artwork. The prototype requires no external assets or fonts.

Plan critique: a separate third-column inspector would shrink the chat and duplicate Style. Use a 280px parts drawer and expansive canvas with selection tools immediately below. Below 650px the canvas comes first, followed by a three-column drawer; size presets replace small resize handles. All controls remain in document flow. The production destination uses Round 15's responsive preview and dock, including focus scroll clearance.

## Entry and state ownership

Add Studio after Look: **Look / Studio / Style / Chat / Viewers / Alerts / Get link**. Look also gains “Craft your own”, opening the same destination. Retain Round 15's single mounted tablist, arrow/Home/End activation and hidden-panel focus rules. Opening Studio alone changes nothing. Start blank, Start from current frame and starter kits are explicit, undoable actions. Preserve channel, chat behavior, integrations and accessibility. Retain per-frame drafts when switching. Save My frame writes a local My looks slot; subsequent saves update that slot. No upload or account required.

Blank has exactly one chat-window part, selected and resizable, on an opaque surface. Chat cannot be duplicated, deleted, rotated or flipped. A plaque is a separate part with plain-text streamer name; multiple plaques bind to the same title. Limit title to 40 Unicode code points and 160 UTF-8 bytes, empty means channel fallback. Name text never becomes untrusted markup. Local save failure leaves the working draft and history intact and offers link export. Reload requires explicit Load My frame in the prototype; production restores the last draft unless an incoming URL wins.

At most **25 total instances**, including chat and any legacy base. Count is visible; add/duplicate stops at the cap. In production also cap effects at three, animated particle primitives at 24, and glow effects at two. These are hard ceilings, not targets.

### Starting from any frame

- Studio frames clone their parts and overrides.
- Round 14 illustrated frames resolve an immutable built-in frame ID to their trusted seven-layer source plus chassis. “Keep original artwork” imports one locked base-frame part, counting toward 25, plus independent chat and optional plaque. Existing layer visibility/colors remain under Style. Original lettering stays artwork; do not claim it becomes editable text. “Replace original art” removes the base and opens the parts box, one undo transaction.
- Existing raster/template frames use the same base adapter with a trusted template ID. Retain existing tint controls; do not present pixel art as recolorable vector pigments. Added parts remain independently editable.
- Plain frames show a conversion preview mapping their border to a library primitive. Applying is explicit and undoable.
- Custom/private assets remain in the local draft with a visible explanation if unavailable to an OBS client. Do not embed arbitrary image data or SVG into the link. Require an already-supported shareable source or replacement before exporting, without deleting the draft.

The mockup's twelve named legacy-frame choices are labeled **kit interpretation**, demonstrating editable starting compositions. Exact legacy adapters are a production requirement; these choices do not reproduce the original Round 14 frame.

## Place it integration and readable chat

Round 18 arranges the outer panel in stream-canvas space: 1280×720, or 1920×1080 when explicitly selected. Studio edits a 600×680 frame-local board. Reuse Place it's pointer capture, drag transactions, resize/snap/guide engine and percentage conversion in production. The standalone mockup has an isolated interaction harness.

Offer two explicit preview contexts: **Edit frame** (close-up) and **Place on stream** (Round 18's 16: 9 game ghost and safe-area outline). Entering one clears selection from the other. Moving a part never changes outer panel placement. Apply part rect through panel x/y/w/h exactly once. On adopting an existing placed frame, bake inner-window offsets into chat-window rect and plaque offset into plaque rect; mark those legacy offsets consumed while Studio is active. Preserve them for reverting the prior draft. Fit to still moves the outer panel. Center chat equalizes local horizontal margins. Old links without Studio data retain their old renderer and positioning.

Production painting has a protected reading plane: derive the chat-window rectangle plus 8 authored units of clearance; mask **all** decorations, including their blur/motion extents, out of that region. Array order controls decorations, never permission to cover chat text. Chat surface/messages paint separately; editor selection handles paint above both. Plaques must sit outside the reading exclusion; collision feedback offers nearest free perimeter position. Border placement is independent; optional Fit border to chat sets its bounds to chat +8-unit clearance +24-unit rails.

Retain Round 14's actual wrapped-height fitter, newest-message preservation, minimum 18px text, opaque surface, 4.5: 1 text/name contrast and outer canvas clipping. Reserve outer placement once, ornamentOverflow=0; do not subtract local gutters twice. Decorations never become removable message children. Batch ResizeObserver work in one animation frame.

The prototype demonstrates free layers and an opaque sample chat, not global reading exclusion, plaque collision resolution or real message fitting. Those are explicit production acceptance requirements.

## Library and SVG contract

**60 original SVGs:** 11 borders, 8 corner ornaments, 8 plaques, 23 stickers, 9 effects and 1 chat-window thumbnail. Every source is under 3, 000 UTF-8 bytes. All use `--c1` / `--c2` with defaults; luminous/highlight parts also use `--glow`. Unused pigment controls should be disabled from paint-slot metadata in production. Colors never implicitly change chat ink. No raster images, remote resources, scripts, foreignObject or font dependencies. Original geometry is family-friendly; no licensed characters.

Borders are one instance each. All use `viewBox="0 0 120 120"`, `data-slice="24"`: four 24×24 caps, four middle rails, empty center. Top/bottom crops are 72×24; left/right crops 24×72. Caps stay square; rails **repeat**, never stretch ornament motifs. Clip the last partial rail beneath the cap. Nested SVG viewport crops provide inline SVG nine-slice assembly; the mockup implements them. Source caps are quiet joining elbows so each material can extend without stretching links/bricks/leaves. Production minimum 72×72 authored units; below that offer Plain glow line. Cap at 64 rail tiles per instance and 256 per composition. Scale the whole board uniformly into its outer panel after assembling rails.

Corner ornaments are authored once at 100×100. Default mirror mapping: TL none, TR horizontal, BL vertical, BR both. Rotation is around center after local flips. Plaques use 200×100; stickers/effects 100×100. Preserve aspect by default for ornaments, stickers and plaques, with an explicit unlock; borders and chat have free rectangle dimensions. Prototype Width/Height changes the bounding box and SVG retains intrinsic aspect, except borders which rebuild. The chat SVG is only a picker thumbnail; production mounts the real message viewport.

Build-time allowlist geometry/title/style/defs/local references as in Round 14. Namespace every ID and reference per rendered instance even when two copies use the same source. The supplied sources avoid IDs entirely. Production decorations get aria-hidden=true, focusable=false, pointer-events:none; editor wrappers provide accessible names/hit areas. Allow only catalog codes and numeric transforms from links, never user-authored SVG or styles.

## Data model

```ts
type StudioFrame = {
  version: 1;
  catalog: 19;
  board: [600, 680]; // frame-local, not stream resolution
  name: string;     // <=40 code points and <=160 UTF-8 bytes
  motion: boolean; // system and overlay reduced motion always win
  palette: string[]; // deduplicated RGB hex; max 32
  instances: Part[]; // back-to-front order; 1..25, exactly one chat
  base?: { registry: 'illustration'|'template'; id: number };
};
type Part = {
  uid: string; // editor identity only, omitted from link
  part: number; // immutable catalog code below; code 60 reserved for base
  x: number; y: number; w: number; h: number; // board %, quantize 0.1%
  angle: number; // -180..180 degrees, quantize 1 degree
  flipX: boolean; flipY: boolean;
  colors: [number,number,number]; // palette indices c 1,c 2,glow
};
```

Rect is unrotated top-left and dimensions. Transform order: local flip → center rotation → local translation → outer-panel mapping. Array order is layer order; no separate z. Guides, selection, undo, DOM, SVG and derived caches do not serialize. Effects derive deterministic timing from code and array position rather than storing random seeds. Legacy base references reuse existing compact overrides and count toward total budget.

Interactive gestures constrain the rotated AABB including effect displacement. Imports validate before painting: known version/catalog/part, finite dimensions, angle bounds, boolean flags, valid palette indices, in-board rotated bounds, exactly one chat and optional single base, count/title limits. Reject invalid state with a specific message and keep the last valid draft. Unknown catalog/version: “This frame needs a newer editor.” Never silently discard unknown art. Prototype validator normalizes bounds and keys; production rejects invalid imported bounds instead. Prototype chat minimum 32%×25%; production also checks the final rendered text viewport against Round 14 limits.

## Compact OBS encoding and size budget

Extend Round 11c's versioned compact payload with a Studio field. Continue using Round 15's unified builder for all enabled features; do not add another OBS endpoint or omit integrations to fit. Proposed binary structure, little endian, unpadded base64url:

| Field | Bytes | Contract |
|---|---:|---|
| Header | 8 | schema u8, catalog u8, flags u8, instanceCount u8, paletteCount u8, titleByteLength u8, reserved u16=0 |
| Palette | 3 × count | RGB24; at most 32 distinct colors |
| Title | 0–160 | UTF-8; empty resolves channel name |
| Instance | 14 each | code u8; x/y/w/h u16 each; angle+180 u16; flip flags u8; three 5-bit palette indices packed in u16 |
| Optional base | 3 | registry u8, immutable registry ID u16; requires one code 60 instance |

Header flags: bit0 motion, bit1 base present; all others reserved 0. Instance flags: bit0 flipX, bit1 flipY; all others 0. Packed color bit15 reserved 0. Percent integers 0..1000, width/height positive, angle code 0..360. Reject truncation, trailing bytes and invalid reserved bits. Freeze numeric catalog IDs; additions append, never reorder or reuse. More than 32 chosen colors triggers an explicit palette-consolidation review before export, never an unnoticed recolor.

Worst Studio field: 8+96+160+(25×14)+3 = **617 binary bytes →823 base64url characters**. Typical seven-part kit, three pigments, 12-byte name: 8+9+12+98 =127 bytes →170 characters. No compression or SVG markup required.

Budget the Studio field at 850 URL characters and the **complete final URL at 4, 096 UTF-8 bytes**, or the existing builder's lower ceiling if stricter. Measure the actual final URL after escaping and integration composition.25 parts is a ceiling, not a guarantee that every combined configuration fits. Exceeding budget shows actual/allowed size and actions to remove parts or consolidate colors. Never silently truncate title, drop effects or integrations. These are proposed product budgets, not claims about OBS's maximum URL length.

The prototype uses numeric-ID JSON tuples with quantized transforms and per-instance hex pigments, encoded as UTF-8 base64url in `#s19`. It demonstrates markup-free round trips but **does not implement the binary codec or production OBS link**. Its button/output explicitly say prototype. A file:// URL requires the same local file; host this standalone mockup to share across devices. Preview pause is not part of prototype links.

## UX and accessibility

Parts drawer: visual tiles, search names/tags, All / Borders / Corners / Plaques / Stickers / Effects. Search only filters. Empty state offers Clear search. Tap adds at a free perimeter slot and selects it; drawer drag is optional. Thumbnails stay static. Missing art retains its label and stored rectangle with Retry.

Selected-part toolbar: meaningful Main/Detail/Glow pigments, Size, Rotate, Flip horizontal/vertical, Bring forward/back, Duplicate, Delete. Exact width/height/angle alternatives accompany gestures. Layer list selects covered parts; production adds editor-only lock/hide and reorder actions. Desktop corner handles resize, rotation handle turns, Shift preserves aspect. Chat also uses Round 18's four edge handles, Center chat and Reset window. Plaque text follows its part; v 1 does not introduce an independently serialized text offset.

Snapping reuses Round 18 canvas edges, centers and 5% grid; extend with chat edges and other part centers. Threshold 6 CSS px converted to local coordinates; Alt temporarily bypasses; show active guides. Rotated parts snap their AABB. Prototype uses 2% inset edges, centers/grid with 1.2% local threshold and does not implement other-part targets or Alt bypass. Arrow keys move selected part 0.1%, Shift 1%. Restore focus after keyboard transforms. Escape/pointercancel restore pre-gesture state.100-entry history; one complete drag/color commit/kit/randomization per transaction. Ctrl/Cmd+Z outside text fields; Shift+Z redo.

Mobile keeps tap-select, drag and size presets/Smaller/Larger; no tiny handles required. Rotate by accessible steps, flip and layer controls stay available.44px minimum targets, visible focus, commit-only status announcements. Full product uses Round 15's tab/dock scroll-clearance behavior and optional enlarged-preview dialog. Provide a static accessible transcript, no continuously announcing sample chat. Test 320/390/768px and 400% zoom, long names and touch pointer cancellation.

Randomize chooses a vibe then a curated compatible border/plaque, up to two matching stickers, corner family and low-intensity effect. Keep a clear chat window, at most three pigments and 7–12 instances. Name and chat settings survive. Prototype varies two stickers from four vibe-specific options while keeping the structural recipe coordinated; all changes are undoable.

| Kit | Border / plaque | Stickers / corner / effect |
|---|---|---|
| Cozy | carved wood / wooden sign | coffee, mushroom / leaves / petals |
| Spooky | chain / scroll | ghost, bat / skulls / sparkles |
| Cute | ribbon-lace / ribbon | cat, bunny / hearts / floating hearts |
| Neon | neon tube / neon box | controller, star / bolts / glow pulse |
| Royal | gold filigree / banner | crown, crystal / filigree / shimmer sweep |
| Gamer | pixel bricks / holo tag | controller, sword / gems / glitch strips |

## Motion and performance

All nine effects have actual CSS transform/opacity animation, 7–15s cycles. Glitch is a low-opacity strip pulse, no full-frame flashing. Motifs can be distributed in production within the 24-particle global budget. Explicit pause, system reduced motion, exported reduceMotion, hidden document and offscreen previews override animation. Reset authored geometry at.45 opacity; never freeze a random midpoint. Text never moves or blinks. Scanlines and shimmer stay outside reading exclusion. Glow uses luminous strokes, avoiding expensive blur filters.

Compile/cache geometry by catalog ID; resolve only referenced assets. Pointermove updates wrapper transforms in requestAnimationFrame, pointerup commits settings. Only resize rebuilds border tiles. Hard limits: 25 instances, 256 rail tiles, 24 particle primitives, 3 effect instances, 2 glow effects. Target 60fps on baseline OBS hardware, zero JS animation work at rest; profile before claiming a benchmark. Prototype redraws DOM while dragging and does not enforce effect/tile caps or offscreen scheduling. It is review UI, not the overlay renderer.

## Immutable catalog

Each code maps to `parts19/<id>.svg`. Codes 0–59 are pinned below; code 60 is reserved for trusted legacy base adapters and has no SVG in this library. The four extra stickers are butterfly, comet, love letter and sprout.

| Code | ID | Display name | Category |
|---|---|---|---|
| 0 | `b-carved-wood` | Carved wood | Borders |
| 1 | `b-chain` | Chain | Borders |
| 2 | `b-glow-line` | Plain glow line | Borders |
| 3 | `b-gold-filigree` | Double gold filigree | Borders |
| 4 | `b-ice` | Ice | Borders |
| 5 | `b-metal-plate` | Metal plate | Borders |
| 6 | `b-neon-tube` | Neon tube | Borders |
| 7 | `b-pixel-bricks` | Pixel bricks | Borders |
| 8 | `b-ribbon-lace` | Ribbon / lace | Borders |
| 9 | `b-sticker-tape` | Sticker tape | Borders |
| 10 | `b-vines` | Vines | Borders |
| 11 | `c-bolts` | Bolts corner | Corners |
| 12 | `c-bows` | Bows corner | Corners |
| 13 | `c-filigree` | Filigree corner | Corners |
| 14 | `c-gems` | Gems corner | Corners |
| 15 | `c-hearts` | Hearts corner | Corners |
| 16 | `c-leaves` | Leaves corner | Corners |
| 17 | `c-skulls` | Skulls corner | Corners |
| 18 | `c-stars` | Stars corner | Corners |
| 19 | `chat-window` | Chat window | Structure |
| 20 | `e-embers` | Embers | Effects |
| 21 | `e-floating-hearts` | Floating hearts | Effects |
| 22 | `e-glitch-strips` | Glitch strips | Effects |
| 23 | `e-glow-pulse` | Glow pulse | Effects |
| 24 | `e-petals` | Petals | Effects |
| 25 | `e-scanlines` | Scanlines | Effects |
| 26 | `e-shimmer-sweep` | Shimmer sweep | Effects |
| 27 | `e-snow` | Snow | Effects |
| 28 | `e-sparkles` | Sparkles | Effects |
| 29 | `p-banner` | Banner | Plaques |
| 30 | `p-chalkboard` | Chalkboard | Plaques |
| 31 | `p-holo-tag` | Holo tag | Plaques |
| 32 | `p-nameplate` | Nameplate | Plaques |
| 33 | `p-neon-box` | Neon box | Plaques |
| 34 | `p-ribbon` | Ribbon | Plaques |
| 35 | `p-scroll` | Scroll | Plaques |
| 36 | `p-wooden-sign` | Wooden sign | Plaques |
| 37 | `s-bat` | Bat | Stickers |
| 38 | `s-bunny` | Bunny | Stickers |
| 39 | `s-butterfly` | Butterfly | Stickers |
| 40 | `s-cat` | Cat head | Stickers |
| 41 | `s-cloud` | Cloud | Stickers |
| 42 | `s-coffee` | Coffee cup | Stickers |
| 43 | `s-comet` | Comet | Stickers |
| 44 | `s-controller` | Controller | Stickers |
| 45 | `s-crown` | Crown | Stickers |
| 46 | `s-crystal` | Crystal | Stickers |
| 47 | `s-cute-skull` | Cute skull | Stickers |
| 48 | `s-dragon-wing` | Dragon wing | Stickers |
| 49 | `s-envelope` | Love letter | Stickers |
| 50 | `s-flower` | Flower | Stickers |
| 51 | `s-ghost` | Ghost | Stickers |
| 52 | `s-heart-charm` | Heart charm | Stickers |
| 53 | `s-moon` | Moon | Stickers |
| 54 | `s-moth` | Moth | Stickers |
| 55 | `s-mushroom` | Mushroom | Stickers |
| 56 | `s-potion` | Potion | Stickers |
| 57 | `s-sprout` | Sprout | Stickers |
| 58 | `s-star` | Star | Stickers |
| 59 | `s-sword` | Sword | Stickers |

## Verification and implementation checklist

Mockup implements 60 searchable visual tiles, add/select/move/resize/recolor/rotate/flip/layer/duplicate/delete, single chat, editable plaque title, six kits, curated randomization, guide samples, keyboard movement, drag undo/cancel, local save/load and prototype link round-trip. All exact sources are embedded for file:// use.

Production work remains: shared Place it integration, exact frame adapters, global reading exclusion/collision resolver, full snap targets/handles, binary codec/unified OBS URL, production tabs, live chat fitting and performance ceilings.

Builder acceptance: unique catalog codes; every source<3, 000 bytes and trusted XML; repeated instances avoid ID collisions; nine-slice shapes at 72×72/300×600/900×200; 25-part and effect caps; rotated bounds; covered layer keyboard/touch selection; one drag/one undo; Escape/pointercancel; storage failure; unknown/corrupt/oversized URL rejection; palette/title/binary bounds round-trip; old links unchanged; no double Round 18 offsets; readable exclusion across layers/motion; contrast/long titles; 320px/400% zoom; both OBS canvas sizes; reduced-motion/hidden-document behavior; no untrusted SVG execution.


Validation performed: all 60 SVGs parse as XML, have no scripts/remote references and remain below 3, 000 bytes (largest 1, 316 bytes). All 60 embedded sources match the library. Mockup JavaScript parses and static HTML IDs are unique. An in-memory Node DOM harness passed startup, add/recolor, undo/redo, rotate/flip, duplicate/delete, all six kits, local save/load, Unicode tuple round-trip, prototype share output, 25-part cap, empty search, invalid import and gesture cancellation. Python and Node Playwright are unavailable; browser rendering, screenshots, real pointer/touch input, mobile layout and OBS performance remain unverified. No production tests were run because no production code changed.
