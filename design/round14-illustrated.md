# Round 14 - Illustrated premium skins

Design handoff for Luna. The engine is specified, not implemented. No application files change. Open [the mockup](round14-mockup.html) directly from disk: it embeds the exact twelve SVG sources and provides layer visibility, layer color, skin focus and motion controls. Google Fonts require connectivity; readable system fallbacks remain available.

## Art direction

The frame is the illustration; conversation occupies its quiet, opaque center. These are twelve different silhouettes, with individually drawn headers, materials, mascots and corners. The reference informs visual richness only. Neon uses a clipped octagon, original asymmetric cat, stitched eye, three small hearts, star-heart pendants and cyan chain highlights. No logo, licensed character, copied pentagram artwork or actual kanji appears. The samurai seals are abstract geometry, not writing.

The initial repeated-rectangle approach was rejected: café became an arched sign; ocean became a porthole; arcade became a cabinet; forge became a shield. Shared primitives unify the drawing language without determining every outline.

Gallery tokens: canvas #10141D; control surface #1B2230; text #F2F0EE; supporting text #B9C2D3; focus #98DDFF. Google Font DM Sans. Headline 36-68px, card name 24px, copy 15px. Gallery names/copy left aligned; illustrated headers centered in their own title zones. Two columns above 760px and one below; 600:680 preview ratio. The artwork supplies the visual intensity, so the surrounding interface stays quiet.

```
600 x 680 illustration coordinates
 header / mascot / top corners 
 edge  opaque surface x66 y144 w468 h452     edge 
       text-safe area x90 y178 w420 h387          
       badge + bold name                         
       message, natural wrap                     
        newest messages retained               
 footer / bottom corners 
```

## Engine contract

A skin declares immutable trusted art plus serializable user overrides. Compile local SVG into inline SVG. Allowlist geometry, title, defs, local references, clip paths and CSS tokens. Reject script, handlers, foreignObject, remote hrefs and embedded images. Prefix **every ID and reference with a per-instance key**: skin IDs alone do not protect two simultaneous previews of the same skin. Production decoration uses aria-hidden=true, focusable=false and pointer-events:none. The standalone art files have descriptive titles.

```ts
type LayerName = 'header'|'corners'|'edges'|'mascot'|'particles'|'glitch'|'glow';
type IllustrationLayer = {
  enabled: boolean;
  color: string;          // hex RGB -> --layer-color -> currentColor
  sourceGroup: string;
  staticPose: 'authored';
};
type IllustratedSkin = {
  version: 1;
  id: string;
  art: { source:string; viewBox:[0,0,600,680] };
  referenceInsets: { top:178; right:90; bottom:115; left:90 };
  surface: { fill:string; opacity:1 };
  layers: Record<LayerName,IllustrationLayer>;
  corners: { slots:['top-left','top-right','bottom-left','bottom-right'] };
  edges: { mode:'repeat'; tileLength:number; keepEndCaps:true };
  mascot: { anchor:'top-right'; bounds:[402,20,138,130] };
  particles: {
    count:number; durationSeconds:number; driftUnits:number;
    direction:'up'|'down'; seed:14; clip:'decoration-ring';
  };
  motion: { enabled:true; reduced:'static-authored'; pauseWhenHidden:true };
};
```

Every source is `design/art14/<id>/frame.svg`. It contains seven explicit groups `<id>-layer-header`, `-layer-corners`, `-layer-edges`, `-layer-mascot`, `-layer-particles`, `-layer-glitch`, `-layer-glow`. Corners contain four data-slot anchors. These grouped SVGs are the art for each layer, not flattened previews. Structural data-structural=chassis holds the silhouette and opaque surface; it remains when all seven switches are off.

For organic skins, glitch is an empty optional group, default OFF. Keep an ON/OFF and color control for consistency, with helper text No glitch artwork in this skin; toggling it has no visible effect until artwork is supplied. Electronic skins default glitch ON. All other layers default ON. The mockup's shared glitch switch affects the four electronic skins.

### Scaling, fitting and OBS

Production must nine-slice the authored compositions, not stretch the entire reference SVG nonuniformly. Keep header, mascot and corner caps at uniform scale; extend structural side rails and repeat edge ornaments at their authored pitches. Clip partial last tiles under end caps. Faces, chains, bricks and title lettering never distort. The mockup intentionally demonstrates fixed-aspect art; it is not the fit engine.

Let W/H be the outer available frame after user inset. Set s=min(W/600,1.5). Reserve left/right 90s, top 178s, bottom 115s. Body width=W-180s; content cap=H-293s. Rebuild the chassis and decoration-ring clip around the resulting content rectangle. Preserve curved/polygonal cap shapes; only extend the straight or gently curved side sections. Edge repeat pitches and fixed anchors are specified per skin below.

If body width <240px or body height <96px, use compact gutters: 20px sides, 56px header, 20px footer; hide mascot and oversized corner pieces and suppress particles. Text size stays user-controlled (default 22px, minimum 18px). If even one line cannot fit, show Increase source size in the editor. OBS preserves the newest message according to existing fitter behavior and clips the message body to the content viewport; no text escapes the canvas and no automatic tiny-font fallback occurs. Keep full text in the editor's accessible transcript.

Use `panelMaxHeight(viewportHeight,inset,frameOffset,frameWidth,ornamentOverflow)` in `js/fit.js` unchanged. New art is entirely inside the shell, so new ornamentOverflow=0. Honor legacy offset/width reservations once. Subtract the asymmetric illustration top and bottom gutters from that outer cap before measuring message content. Do not subtract them again through panelExtras. Feed real wrapped row heights and gaps into `fitMessageIndices`; keep newest-first selection for either direction. Refit after fonts load and on size, font, badge and spacing changes, batching ResizeObserver work in one animation frame. Decoration is never a removable .message child of `fitPanelMessages` in `js/message-fit.js`. Stack direction reverses messages only.

The outer shell is position:relative, isolation:isolate, overflow:hidden and always fits inside the OBS canvas at left/center/right alignment. Chassis z0, illustration z1, opaque reading surface and messages z2. Clip ornaments to both the outer viewport and a ring that excludes the reading surface plus at least 8px. Reference art excludes x74..526 and y155..585; text starts a further 16+ units inward. Include blur extent and maximum motion displacement in the bounds, never just the resting geometry. Header and bottom ornaments stay inside even at animation extremes.

For extreme aspect ratios use compact composition, not letterboxing an enormous transparent artboard or overlapping text. Production header text can become outlines after its Google Font is loaded; preserve editable title metadata separately.

### Editor and color semantics

Frame illustration contains seven named rows, each with On/Off and a labeled native color input. Save overrides at `illustration.layers.<name>.{enabled,color}`. Setting color updates currentColor through --layer-color on that group. Secondary pigments and material fills intentionally remain fixed: a single layer control changes its accent rather than flattening its illustration. Hiding a layer does not reclaim its gutter, so chat does not jump during editing. Restore skin defaults resets visibility and color; switching skins retains per-skin drafts. Animation pause is independent of layer visibility.

Manifest particle settings are bounded: count <=24, duration >=6s, drift <=12 reference units. Count, duration and drift can be advanced inputs later; raw SVG editing is out of scope. User-selected text/name colors must pass 4.5:1 against the opaque surface or be corrected with an editor explanation. Decoration colors can be unrestricted because they carry no chat meaning.

### Motion contract and static equivalents

Animate only transform and opacity. Message text and badges never move or blink. Glow varies .45 to 1 with smooth interpolation. Glitch consists of tiny edge strips moving +3/-2 units near the end of a 7s cycle, not full-screen flashes. All seven layers have authored static geometry, including already static header/corner groups.

System prefers-reduced-motion, explicit OBS reduced-motion setting, or manual pause wins over every skin animation. Disable CSS, SVG and JS animation; reset to authored poses; particles remain evenly distributed at .45 opacity; radar becomes a stationary sector; torches keep drawn flame silhouettes; marquee bulbs stay evenly lit; glow remains steady. Never freeze at a random midpoint. Pause offscreen previews with IntersectionObserver and pause a hidden document. Cap simultaneous animated cards at four. The mockup demonstrates explicit/system pause; the production visibility scheduler is a handoff requirement.

## Readability

All inner surfaces below are fully opaque. Reference body text is 21px at 600px art width, line-height 1.38; names 22px and weight 800 (700 where unavailable). Production uses 22px body by default with minimum 18px. Body fonts are Google Fonts, as are every display face. Display fonts appear only in illustrated headers. Names alternate primary/secondary, are bold without glow or outline, and wrap with overflow-wrap:anywhere. Messages use a single high-contrast ink. No gradient text.

Role badges precede each name: 22px colored squares, 4px radius, dark surface-colored symbols. Moderator: original M shield; supporter: original four-point star; member: original diamond. The mockup uses text M/star/diamond placeholders. Every badge includes a role label; color alone never encodes status. Identity sits above message by default. Emotes max 1.25em, baseline aligned. System text uses body ink.

The table gives the minimum WCAG sRGB contrast among primary name, secondary name and message against the surface. Badge-symbol contrast is the same reciprocal ratio. A future semitransparent mode must be checked against the worst-case underlying scene; this release uses opacity 1.

| Skin | Surface | Primary / secondary | Message | Minimum contrast | Google Fonts: header / chat |
|---|---|---|---|---|---|
| Neon Kawaii Goth | #100b20 | #ff80e7 / #6eeaff | #f9edff | 8.70:1 | Bungee / Nunito Sans |
| Cozy Café | #251a17 | #f5c792 / #a9d9b0 | #fff3df | 10.69:1 | Bree Serif / Lato |
| Spooky Night | #171329 | #c5afff / #e6d38d | #f5eeff | 9.43:1 | Creepster / Nunito Sans |
| Cyber Samurai | #121b26 | #ffad9c / #71e2ec | #eff6ff | 9.67:1 | Chakra Petch / Barlow |
| Pixel Dungeon | #191c22 | #ffcc83 / #a9d6a0 | #f6f1df | 10.41:1 | Pixelify Sans / Barlow |
| Space Station HUD | #0b2028 | #89e5ec / #d3e8a0 | #eafaff | 11.57:1 | Chakra Petch / IBM Plex Sans |
| Candy Land | #302036 | #ffb8dc / #b2eee5 | #fff4fa | 9.48:1 | Fredoka / Nunito Sans |
| Enchanted Forest | #11241e | #c4dfa1 / #f5d29c | #f2f7df | 11.13:1 | Bree Serif / Lato |
| Retro Arcade Cabinet | #191830 | #f6d78d / #b4c8ff | #fff5e1 | 10.41:1 | Bungee / Barlow |
| Ocean Depths | #0b252e | #9ce2e0 / #ffc6a4 | #e9faff | 10.52:1 | Bree Serif / Nunito Sans |
| Winter Frost | #172434 | #ceeaff / #d4c8ff | #f4fbff | 10.09:1 | Bree Serif / Lato |
| Lava Forge | #271714 | #ffcb93 / #ef9f8d | #fff1de | 8.22:1 | Bungee / Barlow |

## Twelve art manifests

All twelve are animated. All use the seven explicit SVG groups described above. Each entry inherits its palette, body font, name weights and badge treatment from the table and readability section.

### Neon Kawaii Goth

ID: `neon-kawaii-goth`  [Layered SVG](art14/neon-kawaii-goth/frame.svg)

Clipped neon octagon, hanging charms and a creature crown.

- **Header:** Double neon contour; large dripping CHAT lettering and three small hollow hearts.
- **Corners:** Star-heart medallions with oversized lower-left pendant.
- **Edges:** Interlocking slanted chain links; 26-unit pitch, cyan highlights.
- **Mascot:** Original asymmetric cat, stitched eye, heart eye and diamond forehead.
- **Particles:** Falling hearts.
- **Glitch:** 12 edge pixel strips jitter on 7s cycle.
- **Glow / secondary motion:** Double neon pulse 3.6s; creature sway 8s.
- **Particle timing:** count 12, cycle 9s, drift 8 units, seed 14; evenly distributed negative delays. Travel is down for hearts/sprinkles/snow, up for other particles.
- **Name/badge/message:** Nunito Sans; bold #ff80e7/#6eeaff names; matching square badges with #100b20 symbols; #f9edff message ink on #100b20.
- **Reduced motion:** all seven groups remain in authored static poses; particle opacity .45; no sweep, chase, sway, drift, flicker or jitter.

### Cozy Café

ID: `cozy-cafe`  [Layered SVG](art14/cozy-cafe/frame.svg)

Arched walnut sign, carved posts and a saucer shelf.

- **Header:** Curved walnut plaque and deep saucer shelf.
- **Corners:** Coffee beans with curved seam details.
- **Edges:** Carved wood posts; grain/knot repeat 145 units.
- **Mascot:** Sage ceramic mug with heart emboss and a broad saucer.
- **Particles:** Upward steam curls.
- **Glitch:** Empty / default OFF.
- **Glow / secondary motion:** Warm light 6s; steam opacity 7s.
- **Particle timing:** count 5, cycle 7s, drift 5 units, seed 14; evenly distributed negative delays. Travel is down for hearts/sprinkles/snow, up for other particles.
- **Name/badge/message:** Lato; bold #f5c792/#a9d9b0 names; matching square badges with #251a17 symbols; #fff3df message ink on #251a17.
- **Reduced motion:** all seven groups remain in authored static poses; particle opacity .45; no sweep, chase, sway, drift, flicker or jitter.

### Spooky Night

ID: `spooky-night`  [Layered SVG](art14/spooky-night/frame.svg)

Haunted arch, crescent crown and scalloped bat wings.

- **Header:** Night arch, crescent moon and small bats.
- **Corners:** Scalloped bat wings.
- **Edges:** Gothic spires; brass crossbar pitch 138 units.
- **Mascot:** Friendly sheet spirit with small oval eyes.
- **Particles:** Slow upward/lateral fog curls.
- **Glitch:** Empty / default OFF.
- **Glow / secondary motion:** Moon rim 7s; spirit sway 8s.
- **Particle timing:** count 6, cycle 14s, drift 12 units, seed 14; evenly distributed negative delays. Travel is down for hearts/sprinkles/snow, up for other particles.
- **Name/badge/message:** Nunito Sans; bold #c5afff/#e6d38d names; matching square badges with #171329 symbols; #f5eeff message ink on #171329.
- **Reduced motion:** all seven groups remain in authored static poses; particle opacity .45; no sweep, chase, sway, drift, flicker or jitter.

### Cyber Samurai

ID: `cyber-samurai`  [Layered SVG](art14/cyber-samurai/frame.svg)

Asymmetric blade guards and diagonal steel rails.

- **Header:** Slanted guard plate and abstract geometric seals, not writing.
- **Corners:** Four invented geometric glyph seals.
- **Edges:** Blade rails and wrapped guards; highlight pitch 52 units.
- **Mascot:** Angular horned helmet with slit visor.
- **Particles:** Upward charge fragments.
- **Glitch:** Edge signal strips with 9s jitter cycle.
- **Glow / secondary motion:** Steel contour charge 4s.
- **Particle timing:** count 8, cycle 8s, drift 3 units, seed 14; evenly distributed negative delays. Travel is down for hearts/sprinkles/snow, up for other particles.
- **Name/badge/message:** Barlow; bold #ffad9c/#71e2ec names; matching square badges with #121b26 symbols; #eff6ff message ink on #121b26.
- **Reduced motion:** all seven groups remain in authored static poses; particle opacity .45; no sweep, chase, sway, drift, flicker or jitter.

### Pixel Dungeon

ID: `pixel-dungeon`  [Layered SVG](art14/pixel-dungeon/frame.svg)

Stepped stone doorway, mortared bricks and paired torches.

- **Header:** Stepped lintel of individually edged blocks.
- **Corners:** Faceted mint gems.
- **Edges:** Stone bricks 42-unit pitch; torch anchors fixed at y333.
- **Mascot:** Pixel-cut chest, central lock and a floating gem.
- **Particles:** Rising torch sparks.
- **Glitch:** Empty / default OFF.
- **Glow / secondary motion:** Torch flicker 2.8s; warm rim 2.8s.
- **Particle timing:** count 10, cycle 6s, drift 6 units, seed 14; evenly distributed negative delays. Travel is down for hearts/sprinkles/snow, up for other particles.
- **Name/badge/message:** Barlow; bold #ffcc83/#a9d6a0 names; matching square badges with #191c22 symbols; #f6f1df message ink on #191c22.
- **Reduced motion:** all seven groups remain in authored static poses; particle opacity .45; no sweep, chase, sway, drift, flicker or jitter.

### Space Station HUD

ID: `space-station-hud`  [Layered SVG](art14/space-station-hud/frame.svg)

Pressure-sealed console with chamfered corners and a radar dish.

- **Header:** Pressure plate, signal bars and inset strip details.
- **Corners:** Crosshead pressure bolts.
- **Edges:** Console scanline ticks 12-unit pitch; status pods fixed at y365.
- **Mascot:** Radar dish with concentric rings, fixed blip and moving sector.
- **Particles:** Telemetry dots rising slowly.
- **Glitch:** Tiny status strips, 7s jitter cycle.
- **Glow / secondary motion:** Radar sweep 10s; indicators 5s; gutter scanline drift 8s.
- **Particle timing:** count 8, cycle 12s, drift 2 units, seed 14; evenly distributed negative delays. Travel is down for hearts/sprinkles/snow, up for other particles.
- **Name/badge/message:** IBM Plex Sans; bold #89e5ec/#d3e8a0 names; matching square badges with #0b2028 symbols; #eafaff message ink on #0b2028.
- **Reduced motion:** all seven groups remain in authored static poses; particle opacity .45; no sweep, chase, sway, drift, flicker or jitter.

### Candy Land

ID: `candy-land`  [Layered SVG](art14/candy-land/frame.svg)

Cloud frosting cap, candy ropes and a scalloped base.

- **Header:** Cloud cap with individually rounded frosting drips.
- **Corners:** Wrapped taffy sweets.
- **Edges:** Mint poles with pink diagonal bands; 28-unit pitch.
- **Mascot:** Cherry-topped pudding creature with a small smile.
- **Particles:** Falling colored sprinkles.
- **Glitch:** Empty / default OFF.
- **Glow / secondary motion:** Sugar rim shimmer 5s.
- **Particle timing:** count 16, cycle 11s, drift 9 units, seed 14; evenly distributed negative delays. Travel is down for hearts/sprinkles/snow, up for other particles.
- **Name/badge/message:** Nunito Sans; bold #ffb8dc/#b2eee5 names; matching square badges with #302036 symbols; #fff4fa message ink on #302036.
- **Reduced motion:** all seven groups remain in authored static poses; particle opacity .45; no sweep, chase, sway, drift, flicker or jitter.

### Enchanted Forest

ID: `enchanted-forest`  [Layered SVG](art14/enchanted-forest/frame.svg)

Interwoven living branches, leaf canopy and mushroom feet.

- **Header:** Braided branch canopy with paired leaves.
- **Corners:** Leaf rosettes; lower-left mushroom foot.
- **Edges:** Winding living branches; leaf cluster pitch 51 units.
- **Mascot:** Original broad-winged leaf moth with luminous thorax.
- **Particles:** Fireflies rising through margins.
- **Glitch:** Empty / default OFF.
- **Glow / secondary motion:** Leaf sway 8s; warm rim 8s.
- **Particle timing:** count 14, cycle 10s, drift 10 units, seed 14; evenly distributed negative delays. Travel is down for hearts/sprinkles/snow, up for other particles.
- **Name/badge/message:** Lato; bold #c4dfa1/#f5d29c names; matching square badges with #11241e symbols; #f2f7df message ink on #11241e.
- **Reduced motion:** all seven groups remain in authored static poses; particle opacity .45; no sweep, chase, sway, drift, flicker or jitter.

### Retro Arcade Cabinet

ID: `retro-arcade-cabinet`  [Layered SVG](art14/retro-arcade-cabinet/frame.svg)

Full arcade cabinet with deep marquee, sloping cheeks and control deck.

- **Header:** Trapezoid marquee with individual lamps; control deck along base.
- **Corners:** Four-point cabinet star inserts.
- **Edges:** Sloping cabinet cheeks with inset rails; trim pitch 72 units.
- **Mascot:** Ball-top joystick with a single action button.
- **Particles:** Small rising sparkle pixels.
- **Glitch:** Low-opacity side pixels, 7s cycle.
- **Glow / secondary motion:** Marquee chase 3.2s with .2s phase offsets.
- **Particle timing:** count 8, cycle 8s, drift 3 units, seed 14; evenly distributed negative delays. Travel is down for hearts/sprinkles/snow, up for other particles.
- **Name/badge/message:** Barlow; bold #f6d78d/#b4c8ff names; matching square badges with #191830 symbols; #fff5e1 message ink on #191830.
- **Reduced motion:** all seven groups remain in authored static poses; particle opacity .45; no sweep, chase, sway, drift, flicker or jitter.

### Ocean Depths

ID: `ocean-depths`  [Layered SVG](art14/ocean-depths/frame.svg)

Oval brass porthole embraced by kelp and shell fans.

- **Header:** Brass porthole arc with exposed rivets.
- **Corners:** Scallop shells with fan ribs.
- **Edges:** Kelp stalks and broad leaves; cluster pitch 51 units.
- **Mascot:** Original bell jelly with four curled tentacles.
- **Particles:** Bubbles rising.
- **Glitch:** Empty / default OFF.
- **Glow / secondary motion:** Kelp sway 9s; cool rim breath 9s.
- **Particle timing:** count 14, cycle 13s, drift 8 units, seed 14; evenly distributed negative delays. Travel is down for hearts/sprinkles/snow, up for other particles.
- **Name/badge/message:** Nunito Sans; bold #9ce2e0/#ffc6a4 names; matching square badges with #0b252e symbols; #e9faff message ink on #0b252e.
- **Reduced motion:** all seven groups remain in authored static poses; particle opacity .45; no sweep, chase, sway, drift, flicker or jitter.

### Winter Frost

ID: `winter-frost`  [Layered SVG](art14/winter-frost/frame.svg)

Faceted ice crest, irregular icicles and snowbank feet.

- **Header:** Faceted crest with individual downward ice teeth.
- **Corners:** Six-armed crystals and snowbank feet.
- **Edges:** Faceted ice shafts; repeat 54 units.
- **Mascot:** Round-faced snow owl with a diamond beak.
- **Particles:** Slow falling snowflakes.
- **Glitch:** Empty / default OFF.
- **Glow / secondary motion:** Crystal outline gleam 7s; owl sway 8s.
- **Particle timing:** count 18, cycle 15s, drift 12 units, seed 14; evenly distributed negative delays. Travel is down for hearts/sprinkles/snow, up for other particles.
- **Name/badge/message:** Lato; bold #ceeaff/#d4c8ff names; matching square badges with #172434 symbols; #f4fbff message ink on #172434.
- **Reduced motion:** all seven groups remain in authored static poses; particle opacity .45; no sweep, chase, sway, drift, flicker or jitter.

### Lava Forge

ID: `lava-forge`  [Layered SVG](art14/lava-forge/frame.svg)

Hammered shield plate, hot fractures and a smiths anvil.

- **Header:** Forged crown and hot lip above the reading panel.
- **Corners:** Hexagonal rivet plates.
- **Edges:** Branching fractures; crack motif pitch 113 units.
- **Mascot:** Anvil, diagonal smith hammer and hot spark.
- **Particles:** Rising embers.
- **Glitch:** Empty / default OFF.
- **Glow / secondary motion:** Cracks breathe 4.8s with staggered phases.
- **Particle timing:** count 14, cycle 7s, drift 7 units, seed 14; evenly distributed negative delays. Travel is down for hearts/sprinkles/snow, up for other particles.
- **Name/badge/message:** Barlow; bold #ffcb93/#ef9f8d names; matching square badges with #271714 symbols; #fff1de message ink on #271714.
- **Reduced motion:** all seven groups remain in authored static poses; particle opacity .45; no sweep, chase, sway, drift, flicker or jitter.

## Gallery treatment for skins.html

Add an Illustrated collection section with large full-frame previews, two columns at 1280px and one on mobile. Preserve the entire silhouette and show five sample messages; at <=380px use three rows to avoid crowding. No hover zoom or mascot cropping.

Use the literal **Premium · Animated** pill, the name, one silhouette description, three palette dots, and the existing selection action with accessible name Use <skin name>. The mockup uses View original SVG for art review; production retains the gallery selection flow. No price or entitlement assumption is introduced. A selected card shows a visible 2px ring plus Selected text. Keyboard focus stays visible. The pill describes the skin's capability even when reduced motion pauses its preview.

Only visible cards animate, maximum four at once; others show their authored static pose. Include a persistent gallery pause control. Artwork is decorative; announce name, description and action once. Palette dots are not controls. At gallery-thumbnail sizes, the sample chat is illustrative; opening a selected preview exposes full readable text at user scale.

## Acceptance checks for Luna

- Load all 12 manifests with per-instance IDs, seven layer rows and exact palettes. Organic skins contain an empty glitch slot, rather than generic digital artifacts.
- Check 320x480, 480x720, 600x680, 800x1000, 1920x1080 and 400x240 source sizes. Include animation extremes and glow extents in canvas containment.
- Check top/bottom stacking and left/center/right alignment with 1, 5 and 100 messages, unbroken names, large badges, wrapped links and emotes. Newest messages survive; ornaments never become removable rows.
- Toggle and recolor each layer, reset defaults, change skin and reload persisted drafts. No cross-instance ID collisions or unexpected text movement.
- Verify 4.5:1 for body, names and badge symbols after overrides. Opaque surface survives disabling every illustration layer.
- Emulate system reduced motion, explicit OBS setting, manual pause, hidden document and offscreen cards. All animation mechanisms obey overrides.
- Target 60fps with four animated previews, at most 24 particles per frame and no JS animation work while paused. Measure this on the target machine; it is not a claimed benchmark.

## Delivery boundaries and validation

This mockup covers fixed-aspect visual composition and local preview controls. Persistence, production nine-slice resizing, real chat, gallery selection integration and performance scheduling are Luna's implementation work. No application runtime, skins.html or existing asset is changed.

The SVGs use inline CSS and local fragment references only. Their header text uses named Google Fonts; standalone SVG viewing falls back unless the fonts are installed. The HTML requests the fonts; production can outline title lettering after font load for exact OBS geometry. Layer art is editable vector geometry, not embedded raster images.

Validation: all 12 source SVGs parse as XML, each with seven layer groups and four corner slots. Mockup IDs are unique and its JavaScript parses. Calculated minimum palette contrast is 8.22:1. Headless Chrome could not launch because the sandbox denied its process communication; browser screenshot, visual layout and interaction checks remain unverified. No production-engine tests were run because this delivery does not modify it.
