Round 7e: the skin showcase pictures look off (owner: "some of the pictures that showcase the chatskins are off with the text"). The lead's screenshot of the live skins.html (Game styles tab, 1440 px) is in design/qa-skin-cards.png. Fix only these, in the card previews, the side monitor, the home demo AND overlay.html (same render code).

1. **Uneven scale.** Some previews are tiny and unreadable (Battle Royale, Cyber City, Space Command, Monster Trainer ≈ 6-7 px text), while others are big.
   - Scale every card preview by the same rule: the sample panel fills ≈ 85% of the preview box width.
   - Text never renders below 11 px on screen. If a skin is wide, show 2 short lines.
   - Center the sample vertically and horizontally.
2. **Text overflows its frame.** In Block Craft the text runs past the right edge of the blocks. Every message box must contain its text (wrap inside the box; no overflow).
3. **Badges sit on their own line** (a crown/shield on one line, the name on the next) in per-message skins: Cyber City, Space Command, Monster Trainer, Neon Edge, Signal Console. The badge must sit INLINE right before the name, on the same baseline. The same bug happens in overlay.html, so fix it at the shared render level (css/skin-render.css / render.js).
4. **Battle Arena cuts the name** ("[Team] Juni…") and pushes the message into a separate column with a big gap. Show the full name (ellipsis only after ~14 chars), with the message right after it.
5. **Card layout:** big empty space at the bottom of many cards. Make the cards a consistent height that fits the preview + title + tagline, with no dead space.

Add a check, `window.__chatskinsPreviewQA()` on skins.html. For each visible card it returns `{name, minFontPx, overflow:boolean, badgeOnOwnLine:boolean}` using the DOM measurements, so the lead can verify it in Playwright. Every skin must report minFontPx ≥ 11, overflow false and badgeOnOwnLine false.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
