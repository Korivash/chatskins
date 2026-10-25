Round 14e: still only 1 message in frame skins after 14d. Here's the exact timeline from real Chromium (`overlay.html?test=1&skin=frame-mothlight`, 1280x720), polling every 250 ms:

| t | #chat class | .template-frame-art | #chat padding | messages | fitRemoved |
|---|---|---|---|---|---|
| 250 ms | `chat chat-panel` (NO has-frame-template) | absent | none | **1** | **8** |
| 750 ms | `chat chat-panel has-frame-template` | present | 75px… | 1 | 8 |
| 3000 ms | same | present | 75px… | 1 | 8 |

So the test messages (and in a real stream, the first chat lines) are added and fitted at ~250 ms against the bare panel, BEFORE `attachFrameTemplate` finishes (it's async: it fetches frames.json/the image and only applies the window at ~700 ms). 14d's DOM-free test didn't catch this because it never models the async attach.

**Fix in overlay.js startup order:**
- `await` the frame template attach (frames.json + rect, with no need to wait for the image pixels since rects are precomputed) BEFORE `buildOverlayTestModel`/`add()` and before `connectChat`.
- Run the first `layoutPanel` + fit only after that.
- If the template fails to load, fall back to the normal skin.
- Same in the editor preview and the skins.html card previews.
- **Test:** make `attachFrameTemplate` resolve after a delay (fake timers / a delayed fetch), then assert that test mode adds all 8 messages after the attach and that fitRemoved stays 0 in a tall frame.

Also check the generic panel height for template skins before attach (it seems to be ~1 message tall). The template default panel should be 92% of the canvas height from the start.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
