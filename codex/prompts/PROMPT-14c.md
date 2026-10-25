Round 14c: the frames look right now (design/qa-14b-frames.png), but every frame skin shows only ONE message. Measured in Chromium, `overlay.html?test=1&skin=frame-mothlight` at 1280x720:
- `#chat` box: 442x662 at (20,38). `#chat` padding: **148.45px 113.12px** (that's how the inner window is applied). The content area left is ~215x365.
- `__chatskinsStats()`: messages 1, **fitRemoved 8**, panelTop 37.6, panelBottom 700.
- The children of #chat are template-frame-art (absolute, 442x662), chat-surface, ONE .message (215x106 at y 188), and template-plaque (absolute).

**Two bugs:**
1. **The inner window is far too conservative.** The Mothlight tall frame's real transparent window is about 76% of the width and 80% of the height (the border is ~12% per side), but the padding is 25.6% of the width per side and 22% of the height per side.
   - Re-check the detection: it should be the largest transparent rect around the center; only then subtract a small fixed inner margin (~2% of the frame width).
   - Add a test using the real image `site-media/frames/mothlight-tall.webp` (decode it in the test, e.g. a small PNG/WebP reader, or store the precomputed rect in frames.json and test that it's ≥ 70% x 70% for mothlight-tall).
   - Precompute rects for all frames at build time into frames.json (inner + plaque), so the overlay never scans images.
2. **The fit logic removes everything except one message.** Three ~106 px messages would fit in 365 px.
   - `fitPanelMessages`/`layoutPanel` must measure only the message rows against the inner content box (excluding absolutely positioned frame art, plaque and accents, and excluding the padding).
   - Messages stack at the BOTTOM of the window with the newest last, like normal chat.
   - Add a regression test: for a frame skin at 1280x720, test mode keeps ≥ 6 sample messages with the template default font.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
