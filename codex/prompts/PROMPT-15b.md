Round 15b: polish the new options menu (see design/qa-15-built.png: Look, Style, Viewers, Get link, plus mobile), THEN do round 14l (codex/prompts/PROMPT-14l.md: matching plaque title fonts per frame) in this same round.

**Polish:**
1. **Viewers tab:** the Chat commands card shows a red-ish "Problem" chip while it's simply waiting for a channel name. Use the design's states: "Needs your channel" (neutral) until a channel is set, then "Ready". "Problem" is only for real errors.
2. **Viewers tab:** the "Create rewards turned off (I'll turn them on in Twitch)" checkbox renders as a large unstyled white square. Style it like the site's other toggles/checkboxes.
3. **Style tab:** the color hex shows twice (the input "#C6DDFF" plus a second "#C6DDFF" line under it). Show it once.
4. **Mobile (390 px):** only Look · Style · Chat tabs are visible. Make the tab strip horizontally scrollable with fade edges and keep the active tab scrolled into view, or wrap into 2 rows of 3. All six must be reachable.
5. **Preview:** the frame sits small at the left of the big preview stage. In the editor preview (not in OBS links), center the chat panel in the stage and scale it so the panel is ~80% of the preview height. The overlay output itself must not change.
6. Run the round 14j alignment test again: chat must stay inside the frame window in the new preview.

Then do everything in PROMPT-14l.md.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
