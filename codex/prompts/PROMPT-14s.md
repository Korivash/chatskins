Round 14s: two regressions found by the lead.

1. **readme.html hero preview:** the hero's live skin preview now shows the chat tiny in the lower-left corner of the big preview window (after round 14j, previews render a scaled virtual 1280x720 stage). For the README hero and any marketing preview, center and scale the chat panel to fill the preview box (as in the editor fix from round 15b item 5), while keeping alignment inside frame windows. Check readme.html at 1440 and 390 px.
2. **neon-kawaii-goth** (the first/tall Neon Kawaii Goth entry): in overlay test mode the chat text runs over the left chain/heart border. Its measured inner window is too wide on the left, because the hanging chains are thin and partly transparent. Re-measure it with a stronger art threshold for this frame (alpha ≥ 20) or add a manual left inset so text clears the chains, and verify that no .message rect crosses the chain column.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
