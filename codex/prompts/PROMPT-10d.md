Round 10d: the lead rendered all 52 skins through `overlay.html?skin=…&test=1#…` links made by skins.html (transparent default ON). Sheets: design/qa-10-sheet0.png, qa-10-sheet2.png, qa-10-sheet6.png. Two problems:

1. **Transparent default makes some skins unreadable.** Skins designed as LIGHT cards (light bubble/card background with DARK text) become dark text on nothing, nearly invisible over a dark stream. Seen: Comic Burst, Pastel Pop (faint purple text), Bubble Chat, Candy Pop, Monster Trainer, Sticker Stack, any skin whose text color is dark.
   - Fix it in the transparent-mode logic: compute the text/name color luminance. If the text is dark (contrast with a dark backdrop < 4.5:1), the transparent default must KEEP that skin's card background (mark it in skins.json, e.g. `transparentDefault: false` with a reason), or swap to the skin's light-on-dark variant.
   - Light-text skins stay transparent with the auto outline.
   - The editor shows a small note when a skin keeps its card for readability.
   - Add a test that, for every skin, the effective text color in the default transparent state has ≥ 4.5:1 contrast against #1a1d24 (or the card is kept).
2. **Names truncated far too early:** Battle Arena "[Team]..." (the name is completely hidden), Battle Royale "[Squad] HypeS...", Space Command "COMMS / Chann...", Hero Shooter, Esports Slash.
   - Name + prefix must show at least 16 characters of the name before an ellipsis.
   - Never truncate the channel prefix and the name together into "[Team]...". If space is tight, wrap the message to the next line instead.
   - Add a render test with the name "ChannelPal" (10 chars) that asserts it's fully visible in every skin.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
