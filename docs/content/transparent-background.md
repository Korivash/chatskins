<!-- Outline: Turn on transparency | Place the source | Check at output size -->

# Transparent background & gameplay

Keep chat visible without covering more of the game than necessary. Transparency removes the backing; it does not automatically make every text color readable.

## Turn on transparency
New skin links use a transparent background by default. Existing overlay links keep their previous appearance: a saved `false` stays off, and a missing transparency setting uses the historical opaque default. To change it, open the link in the editor and choose Background → Transparent.

If you also want to remove decorative edges, use Hide frames. Preview against a bright scene and a dark scene. Add a restrained text outline or shadow when needed.

## Place the source
Add the overlay as a full-canvas Browser Source and put it above your game capture. Use chat alignment and edge inset to position it. Keep important gameplay UI, subtitles, and camera areas clear.

## Check at output size
View a recording at the resolution viewers receive. A name that looks crisp in a large editor window may be too small after scaling. Prefer changing the editor's text size over stretching the Browser Source unevenly.

> Tip: Glass surfaces can tint gameplay through transparency, but they cannot blur a separate game-capture source behind the browser.
