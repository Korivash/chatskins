Round 4e: the frames are still not drawn. One bug, measured exactly. Work only inside this folder.

## Measured (editor, Guild Chat, Chromium)
- `.stage .chat` inline style HAS the frame variables:
  - `--frame-color:#BDA363FF; --frame-width:1px; --double-gap:2px`
  - `--outer-width:1px; --outer-offset:2px; --outer-color:#BDA363FF`
  - `--radii:2px 2px 2px 2px; --ornament-*`
- But the computed style of `.chat` is `border-top-style: none; outline-style: none; box-shadow: none`.
- `.chat-surface` (absolute, inset 0, z-index 0): `border-top-style: none; outline-style: none; box-shadow: none`.
- `.chat-surface::before` and `::after`: `content: none`.
- The skin's frame from skins.json is: `{target:"panel", style:"solid", width:1, paint:{mode:"solid", color:"#BDA363FF"}, outer:{enabled:true, width:1, color:"#BDA363FF", offset:2}, ...}`.

So the variables are set, but no CSS rule turns them into a border. Probably a selector/data-attribute mismatch, e.g. CSS expects `[data-frame-style="solid"]` or `[data-frame-target="panel"]` on an element that doesn't carry it, or the class names changed in 4b/4c.

## Fix
- **Draw the frame:** draw the frame from those variables on the panel (target "panel") or on each `.message` (target "message"). Cover every border style in the schema: solid, double, dashed, dotted, groove, ridge, inset, outset, pixel, beveled. Add the outer frame (outline or a pseudo-element using outer width/color/offset) and the ornaments.
- **Ignore no data:** make sure every data-attribute or class the CSS needs is set by render/panel-layout for BOTH the editor and overlay.html.
- **Self-check:** add `window.__chatskinsFrameOk()`. It returns true when the frame element's computed border style or outline is not `none` for a skin whose frame style isn't `none`.
- **Test:** add a pure test that the settings → frame attribute/variable mapping produces the attributes the CSS selectors use. Keep the list of attribute names in one exported constant shared by the CSS docs and the test.

Check by reading the CSS against the render code for all 22 skins.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
