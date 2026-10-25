# Round 10: Skins that stand out

Design-only handoff, October 25, 2026. This round supersedes earlier visual recipes for the 28 named treatments below and earlier static-thumbnail rules. It does not build the app. All deliverables and supporting files are inside `design/`. All prior rounds remain intact. Reviewed inputs: the complete historical DESIGN.md, all catalog records/schema contracts, sheetA–E and qa-9-skins.png. Those sheets show repeated rectangular rows, tiny previews and names squeezing bodies into narrow columns. Round 10 makes the object recognizable before its color is recognizable.

## Direction and review plan

**Recognizable at a glance, alive at a second glance.** Retain the Round 9 quiet website palette: Canvas #05070D, Surface #0B1425, Raised #101E34, Text #F3F7FF, Muted #A6B6CD, Cyan #38BDF8. Familjen Grotesk headings and Manrope controls remain the production shell pair; the offline specimen uses Segoe UI. Skin type is independent: rounded humanist for Aurora/Lava/Bubble, condensed signage for Neon/Announcer, serif for Starfall/Ice, mono for Holo/Receipt/Terminal, marker for Sticker. Use named system fonts in this study to avoid network dependencies; their fallback is explicit in JSON. Body 22/31.9 source px; name 20px except Announcer 28px. The mockup uses readable 15–18px samples rather than scaling an entire 480px source into an illegible thumbnail.

```text
Home:   centered headline / three real specimens: Aurora | Glitter Bomb | Holo Foil
Skins:  filter + pause + reduced motion
        two readable card columns              selected skin monitor
        [two messages / name / tagline]        three messages / arrival test
                                               shape / numeric style stats
Phone:  hero specimens stacked; monitor above one-column gallery
```

Plan critique: ten luminous rounded boxes would repeat the owner's complaint. Assign every animated skin a different contour and name hierarchy before choosing motion. A static receipt must still differ from a static ticket when both are grey. Keep surrounding page chrome quiet; no moving card positions or auto-changing selection. Recipe geometry is literal in `round10.css`; the register below names every catalog silhouette for builder comparison. Existing game panels are retained, not silently redesigned.

## Catalog and compatibility

52 total: **12 Streamer favorites, 24 Game styles, 4 Colorful, 12 Animated**. The 10 new IDs are aurora, glitter-bomb, neon-pulse, prism-shift, holo-foil, lava-lamp, electric-storm, starfall, fire-frame, ice-crystal; all have `category: "Animated"`, the existing group field. Terminal and Vaporwave retain their category and are also visually reworked. All 42 existing IDs, names, gallery order, Featured membership and `settings` snapshots remain unchanged. Clean remains the default. No URLs or saved records are rewritten.

`round10Recipe` is the authoritative new design recipe for each changed skin, outside the closed v3 settings schema. It contains silhouette, layout, typography, palette, keyframe names, cycle, animated-layer maximum and reduced-motion behavior. Earlier settings are retained as valid legacy fallbacks; the 10 new entries have complete valid static v3 fallback settings. These fallbacks do **not** reproduce the new design by themselves. New appearance requires builder work: implement reusable silhouette/layout/effect primitives, expose them for editing, extend normalization and the serialization contract together, then regenerate full canonical presets. Do not branch the production renderer on skin IDs or inject this metadata into old closed schemas. Historical full-settings URLs continue to render their stored appearance; an editor `?skin=<existing-id>` still resolves and can select the redesigned catalog look after implementation. Alert designs inherit new static silhouettes only after that renderer exists; never add ambient animation to an alert accidentally.

Stats retain the existing four 1–5 descriptors: readability, flair, motion, retro. They are subjective design descriptors, not performance measurements or contrast certification. New animated looks score motion 5; the 16 basic entrance-only designs score 2; Terminal and Vaporwave score 4. Every changed skin has new tagline and stats in JSON. Runtime marketing counts and the Round 9 hero copy become 52 only when the builder ships the full set.

## Ten signature motions

All text is present from arrival. Effects run behind stable text or exclusively in the edge gutter. In the table, L means simultaneously animated elements **including** transient layers; an SVG with several fixed paths counts as one element only when its parent owns the animation. The shape/layout/type register and JSON provide the companion visual recipes. CSS keyframes in `round10.css` are the exact specimen reference.

| Skin | Palette and signature recipe | Keyframes / timing / L | Reduced-motion appearance |
| --- | --- | --- | --- |
| Aurora | Dark ocean #0C202B; mint/cyan/lilac 3px masked gradient ring on asymmetric arch; static soft 15px low-alpha glow | aurora-flow: background-position 0→100→0%, 14s ease-in-out, infinite; 1 L | Mint/lilac ring frozen at midpoint; static glow |
| Glitter Bomb | Plum #341833 party seal; five fixed sparkle marks across the surface; separate three-point entry burst; opaque text remains in front | glitter-twinkle: opacity .25→.85→.4→.25, scale .98→1→.99→.98, 4.6s; glitter-entry: scale .75→1.1, opacity 0→.85→0, 850ms once; 2 L | A sparse static sparkle field; no entry burst |
| Neon Pulse | Ink-purple #251225 open-ended neon tube, pink #FF8EDB edge; black sender sign | neon-arrive: .3→.8→.45→.9 opacity over 900ms once; then neon-breathe .4→.95→.4 over 3.8s; same layer, 1 L | Steady tube at .6 opacity |
| Prism Shift | Midnight #171B38 faceted prism; rainbow edge and pale rainbow name chip with dark ink | prism-hue: hue-rotate 0→360deg over 12s linear on ring and chip; 2 L; body never filtered | Frozen rainbow edge/chip; readable dark name |
| Holo Foil | Steel #152B37 notched pass with a registration strip; mint/lilac/white translucent specular band | holo-sweep: background-position 100% hold 0–20%, travel to 0% by 75%, hold to 100%, 7s; 1 L | Static foil highlight at edge, no sweep |
| Lava Lamp | Oxblood #361919 organic lozenge; orange and amber radial blobs behind opaque text wells | lava-drift-a: translate(-8%,6%) scale(.9)→(20%,-8%) scale(1.15)→start, 11s; lava-drift-b (6%,-8%) scale(1.1)→(-18%,10%) scale(.9)→start, 14s; 2 L | Two fixed warm blobs; stable kidney shape |
| Electric Storm | Navy #121F38 jagged plate; cool #B9DFFF irregular border light; mod-only SVG bolt cluster | storm-crackle: .25→.75→.3→.65→.25 at 0/18/35/70/85/100%, 5.2s; mod-bolt: opacity 0→.9→0, 950ms once; 2 L | Static crack trace, no bolts; Mod badge remains |
| Starfall | Indigo #191B39 observatory pennant; three small diagonal star trails behind message wells | starfall-travel: translate(-12%,-18%)→(18%,45%), opacity 0→.7→0 between 15–65% of 6s cycle, rest idle; 1 L | Tiny fixed stars, no falling motion |
| Fire Frame | Ember #301A16 hearth; orange #FFC276 flame-tooth edge from a static gradient mask | fire-lick: scaleY .96→1.03→.98→.96, opacity .5→.85→.6→.5 at 0/35/70/100%, 2.8s; 1 L | Fixed crown of flame shapes; no turbulence |
| Ice Crystal | Deep ice #142B3A stepped crystal; pale #BDEFFF edge and translucent frost sheen | frost-sweep: background-position 100→0→100%, opacity .4→.8→.4, 8s; ice-freeze: scaleX .04→1, opacity 0→1, left origin, 700ms once on decorative edge; 2 L | Complete crystal edge immediately; no reveal or shimmer |

Flicker and crackle are restrained edge luminance changes, not full-message flashes. No visibility blackouts, rapid strobe, text shake or repeated entry bolts. Mod bolts require verified message role metadata in production; never infer role from the typed name. The specimen's Mod message button supplies a clearly labeled simulated role. One bolt group per new mod message, no accumulation.

## Basic skin recipes and arrival keyframes

The silhouette register supplies shape + layout + type for each. JSON supplies its ink/surface/accent and tagline. `round10.css` supplies real tails, notch masks, torn edges, folds, perforation, halftone, pips and paper geometry; none are image textures. Reserve 20px content padding at source scale, 28px by cuts/tails and 36px at deep ornament, 16px row gap, and 12px tail/fold safety space. Polaroid reserves a 46px caption foot, Initial Card reserves a 54px medallion gutter. At narrow widths increase height through wrapping; do not shrink type or crop a username. Ticket's name stub stacks above its body to avoid the squeezed name columns visible in sheetA/C. Never clip the message itself to the decorative polygon.

All 16 ordinary basic arrivals are ease-out and one-shot, opacity 0→1 plus the listed transform to identity. Sticky Note ends at its static ±2° tilt. Whole-row entry owns the only animated element; decorative shapes stay still. A static final state is the fallback for every one.

| Skin | Keyframe | Duration | Transform at entry |
| --- | --- | --- | --- |
| Bubble Lift | lift-in | 320ms | translateY(10px) |
| Glass Card | glass-in | 400ms | translateY(4px) |
| Name Tag | tag-in | 280ms | translateX(-10px) |
| Comic Burst | comic-in | 280ms | scale(.94) rotate(-1deg) |
| Pastel Pop | ticket-in | 350ms | translateY(-6px) |
| Esports Slash | slash-in | 200ms | translateX(-16px) |
| Quiet Line | quiet-in | 400ms | none; opacity only |
| Neon Edge | edge-in | 280ms | translateX(6px) |
| Sticker Stack | note-in | 400ms | rotate(-5deg) translateY(-5px) to static tilt |
| Initial Card | pill-in | 300ms | scale(.97) |
| Signal Console | receipt-in | 400ms | translateY(-8px) |
| Announcer | caption-in | 250ms | translateX(-12px) |
| Bubble Chat | cloud-in | 400ms | translateY(5px) |
| Clean | paper-in | 220ms | translateY(3px) |
| Candy Pop | card-in | 350ms | rotate(-3deg) scale(.98) |
| Rainbow Border | photo-in | 380ms | translateY(7px) rotate(2deg) |
| Terminal | terminal-cursor | 2s loop | Small nontext cursor opacity .3→.8→.3; no typing or row entry |
| Vaporwave | tape-drift | 16s loop | Label wash background-position 0→100→0%; no row entry |

## Live showcase behavior

Home hero uses **Aurora, Glitter Bomb and Holo Foil simultaneously**, each with one sample row. No timed skin rotation. Static outer tilts stay under 4°. On mobile stack all three so each effect remains reviewable. Gallery cards contain two genuine DOM samples of their own recipe; side monitor shows three of the selected recipe. Production must share one renderer between overlay, card, hero and monitor; the standalone design renderer demonstrates the new primitives without pretending the current app supports them.

Continuous effects start without hover when their sample intersects the viewport and the document is visible. One IntersectionObserver tracks sample containers (threshold .01, zero root margin); CSS animations are paused outside the viewport. Visibilitychange pauses all hidden-tab motion. No offscreen polling, invisible replacement queue or catch-up replay. Basic entry plays on first visibility only. Selection is deliberate click/Enter/Space, not hover, and persists across filtering; selected marker + aria-pressed supplement color. The monitor is sticky only where enough room exists; on mobile it precedes the cards in visual order. An explicit Replay entrances review button replaces visible samples only; it is not an automatic production timer. New message/Mod message demonstrate arrival in a bounded three-message monitor. These are local samples, not live-region chatter.

Pause previews freezes phase; resume continues phase. Reduced motion is system preference OR review checkbox OR the saved production preference; Resume never overrides it. Reduced motion disables keyframes entirely (not .01ms loops), exposes final text/geometry and suppresses bursts/bolts. Rows inserted while paused show their complete final entrance state. Turning motion back on must not replay old arrivals in production; retain a per-message entered flag, remove entry animation after animationend and on reduction. Ambient loops may restart. The specimen keeps entry-finished markers for this behavior. No animation state is saved in an overlay link.

## Performance, access and builder acceptance

- At most **3 animated elements per message**, including entry, ambient and role effects; these recipes use at most 2. Do not layer legacy arrival/background/name effects underneath them. If custom controls add motion, suppress the lowest-priority ambient layer before exceeding the cap. Keep the existing 30 mounted-message hard limit; effect nodes die with their message. No generated particle DOM, layout animation, per-letter spans, canvas, video, animated SVG turbulence or per-frame JS.
- Animate transform/opacity by preference. Small masked background-position and bounded hue filters are permitted here but can repaint; they are not automatically GPU-cheap. No animated box-shadow, blur, border width, dimensions, padding, clip-path or gradient stops. Prepaint static glows, cap glow extent to 15 source px, masks to the message bounds. No permanent will-change or enormous offscreen gradient planes. Fire deliberately uses a static flame mask instead of runtime turbulence.
- Gallery budget: two rows per card; desktop review max three card columns, monitor three rows, hero three rows. Use IntersectionObserver before starting loops. In production virtualize distant catalog rows and unload unused font families. If profiling misses budget, freeze distant visible cards at a representative frame and state this in the preview; never silently reduce the selected monitor's fidelity.
- Text, role badges and emotes stay unfiltered and fully opaque, except Prism's pale chip + dark name on one hue-filtered layer. Check name contrast through the entire hue range; if custom colors fail, animate chip paint only and put name ink on a separate static child. Backings are deliberately opaque where effects travel. Respect hideFrames and transparentBackground: suppress their corresponding decorative layers without losing text; show existing transparency readability guidance.
- Accessibility target: names/body ≥4.5:1 against their local backing, focus ≥3:1, controls ≥44px, natural wrapping at 320px/200% text/400% zoom. Marker/condensed/display faces are for names, never unreadably tiny bodies. Test font fallback on macOS/Linux as well as Windows. Badges are labeled, initial medallions decorative. SVG ornament aria-hidden and pointer-events:none. No information depends on movement.
- Before shipping profile OBS at 480px chat width in a 1920×1080 Browser Source, 30 mounted rows, ordinary and burst arrivals, for 10 minutes on a representative low-end CPU/iGPU. Record CPU/GPU/frame time relative to the static fallback; target no sustained layout work during idle loops and no dropped stream frames attributable to the overlay. These are acceptance targets, **not measured results**. Check black/white/busy gameplay and both OBS scene visibility settings. Chat ingestion/deadlines remain correct when the visual source is hidden.
- Review all 28 at desktop/mobile, their static fallback, each entry, Electric mod-only bolts, pause/resume, OS preference changes, offscreen/hidden-document pause, long names, emote-only and multiline rows. Confirm 42 old IDs/names/settings survive and all 52 fallback settings validate against the existing schema. Build no production claim from a successful design mockup.

Artifacts: `animated-mockup.html` opens directly from disk; `animated-template.html`, `round10.css`, `round10.py` and `round10-notes.md` are its editable sources. `python design/round10.py` regenerates the mockup, metadata and this appended round, preserving earlier rounds. Do not run historical catalog generators afterward without retaining Round 10 metadata.

### Verification record

Static review passed: 52 unique catalog IDs, all 42 previous IDs/names/settings preserved against HEAD, 28 distinct new recipe silhouettes, complete keyframe references, all taglines/stats present, and embedded JavaScript syntax. All 10 new static fallback settings pass the repository's structural schema checker. Four existing enum mismatches remain in unchanged records: Signature/Hero Quest/Space Station presentation.accent and Old-School Realm nameEffect; these predate Round 10 and need builder schema reconciliation. No claim that the whole legacy catalog validates is made.

Browser capture was attempted with installed headless Chrome. Windows denied Chromium IPC/crash-server access (0x5); no screenshot or successful browser/interaction/OBS test is claimed. Python Playwright is unavailable. Visual execution remains a builder review requirement. Git add failed because `.git/index.lock` creation was permission-denied; the path-limited commit failed because the new files could not be staged. Automatic command policy blocked cleanup of `design/.round10-review/`; that temporary profile and `round10-browser.log` remain as non-deliverable capture residue.
