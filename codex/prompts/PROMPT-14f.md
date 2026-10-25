Round 14f: CONFIRMED root cause, isolated by the lead in Chromium.

On `overlay.html?test=1&skin=frame-mothlight` (1280x720):
- As shipped: **1 message, fitRemoved 8**.
- Identical, except that the line `chatPlay.simulate('!skin guild','everyone','Moss');` is removed (served via a route override): **9 messages, fitRemoved 0**.

So frame templates are fine. The **chat-play skin swap** breaks them:
- A swap from a frame skin to a normal skin (and the revert) re-lays out the panel in a mixed state (frame padding/size from one skin and settings from the other, or the frame detached/attached asynchronously mid-swap).
- `fitPanelMessages` then deletes rows, and the revert doesn't restore them.

This is a real streamer bug too: any viewer `!skin` while a frame skin is active wipes the chat.

**Fix:**
1. A swap must be atomic. Detach or attach the frame template and apply the target skin's layout/padding FIRST (await the frame attach when the target is a frame skin), THEN re-render the message models, THEN fit once.
2. Fit must never delete message MODELS during a swap or revert. Keep the model list (from round 10c) as the source of truth. On revert, re-render all models that are still inside their lifetime and fit against the final layout.
3. The `afterFrameTemplateReady`/`resizeFrameTemplate` path must also be used by chat play's onSettings (the swap callback in overlay.js), not only at startup.
4. **Tests (model the async attach):**
   - frame skin → `!skin guild` → revert keeps all 8 messages
   - normal skin → `!skin` to a frame skin → revert keeps them
   - the swap with a delayed frame attach doesn't fit before the attach resolves

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
