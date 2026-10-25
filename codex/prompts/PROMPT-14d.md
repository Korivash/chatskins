Round 14d: ROOT CAUSE of "only 1 message in frame skins", traced by the lead in Chromium. Your 14c tests pass, but the real browser still shows 1 message.

A trace of every `#chat.style.padding` write on `overlay.html?test=1&skin=frame-mothlight` (1280x720):
1. `attachFrameTemplate` (frame-templates.js:41) sets padding ''.
2. `resize()` (frame-templates.js:36) sets **261.11px 119.44px 261.11px 119.44px**. It's computed from `root.getBoundingClientRect()` while the panel's size is still content-dependent or not final.
3. Then the fit runs ("Chat panel is shorter than its newest message; preserving that message"), and `fitPanelMessages` **permanently removes 7 of the 8 test messages**.
4. Then `resize()` runs again with the correct **75.42px 61.74px 75.42px 61.74px**, but the removed messages never come back.

**Fix:**
- Compute the frame window from the panel's LAYOUT size (the width/height `layoutPanel` assigns, or an explicit fixed height for template skins), never from a content-dependent bounding box. The panel's size must not depend on its padding or content (no feedback loop with the ResizeObserver).
- Apply the frame window synchronously BEFORE the first message is added and before any `queueFit()`. If the frame image/rect isn't ready yet, defer message insertion or fit until it is (await a `ready` promise from attachFrameTemplate).
- After any later resize (OBS resizing the source), re-run the fit, but never permanently drop messages because of a transient layout. Only drop them for real overflow on the final layout.
- **Regression test that reproduces this ordering:** simulate the first getBoundingClientRect returning a wrong/small size, then the real size, and assert 6+ messages remain. Then verify in a real headless browser if you can: write a tiny Playwright-free check using the existing test harness, or note it for the lead.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
