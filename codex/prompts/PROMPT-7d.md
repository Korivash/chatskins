Round 7d: final visual QA of ALL 42 skins as rendered by overlay.html?test=1 (the real OBS path). The lead's contact sheets are design/sheetA.png ... sheetE.png (in gallery order: Featured, Streamer favorites, Game styles, Animated, Colorful). Fix these and nothing else.

1. **ChatSkins Signature (the flagship) looks plain in the overlay.** It's just a dark box with white text. In overlay.html it must have exactly what DESIGN.md specifies:
   - the animated mint→violet flowing gradient border, the glass panel, subtle scanlines
   - glowing name chips in the chatter's color
   - a gold HOST flash for the broadcaster, a mint MOD tag, a NEW sparkle for first-timers
   - the violet mention bar, violet italic /me
   This is the hero of the demo video: make it look premium.
2. **Panel frames are faint or missing in the overlay** for Guild Chat (the thin gold double frame), Crystal Realm (silver/blue ornate frame), Old-School Realm (dark-brown stone box), Frontier MMO (parchment edge) and Arena League (gold trim). They're visible in the website previews but not in overlay.html. Find which frame rules aren't reaching the overlay and fix them. `__chatskinsFrameOk()` currently passes even though the gold frame isn't visible, so make it check that the computed border color isn't transparent and the width is ≥ 1px.
3. **Badges show as stray tiny characters** ("$", "v", "ᵥ") before names in many skins (Neon Edge, Initial Card, Signal Console, Battle Arena, Cyber City...). Render the broadcaster/mod/VIP/sub badges as real small SVG icons (crown/sword/gem/star, or the skin's own style) at 0.85em, vertically centered. Never as raw letters/symbols.
4. **Name Tag:** the fixed-width name column wraps names mid-word ("HypeSqua / d"). Use a column wide enough for 12 characters, then ellipsis; never break inside a name.
5. **Esports Slash and Battle Arena:** the name bar and the message text sit apart: the name is on the right and the text is below or left, with an empty gap. Lay out name + message as one row (name first) as designed.

After the fixes, re-render every skin through overlay.html?test=1 and compare against DESIGN.md; fix anything else that's clearly off.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
