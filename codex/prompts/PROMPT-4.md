Round 4: two bugs that are still there after round 3b (seen in a real Chromium browser), plus one owner request. Read the current code first (js/fit.js, js/overlay.js, js/editor.js, js/render.js, css/app.css). Work only inside this folder. Same rules as before.

## Bug 1 (top priority): framed chat still runs off the screen
Repro:
- **Overlay:** open overlay.html with the Guild Chat skin (`frameTarget` = panel) on a busy live channel, viewport 1440x900. After ~20 s the panel is taller than the window: its top gold border and the oldest messages are cut off above the top of the screen.
- **Editor:** choose Guild Chat and press "Burst 10" twice. The panel runs past the BOTTOM of the preview stage, so the newest messages are cut off.

The fit logic in js/fit.js is unit-tested but not working in the page. Likely causes to check:
- it's measured before fonts/layout settle
- it measures the message list instead of the framed panel including padding, border and outer frame
- the container has no fixed height (it must be 100% of the overlay viewport / stage minus edge insets)
- it runs only on insert and not on resize/settings change

Required behavior:
- The framed panel (all borders, outer frame and ornaments) is ALWAYS fully inside the overlay viewport and the editor stage.
- Remove the oldest messages until it fits.
- Re-fit after each insert, after `document.fonts.ready`, on resize, and on every settings change.
- Use one requestAnimationFrame and batched reads/writes.

Also add a debug-free self-check: `window.__chatskinsFitOk()` returns true when the panel's bounding box is inside the viewport (the lead will test it with Playwright).

## Bug 2: skin card samples are clipped
The sample text on the skin cards is drawn at full chat size, so it's cut off ("[Guild] [Moss]: He").
- Scale the card sample to fit the card: font scaled down, the frame scaled too, one line, ellipsis only as a last resort.
- Every card must show its frame, colors and name format clearly.
- The cards stay inside the left panel at 1440 px and at 1280 px window width.

## Owner request: transparent background for every skin
The owner wants every skin usable with a transparent background.
- Add a **Transparent background** switch, shown at the top of the Background section and as a quick toggle next to the skin name in the toolbar.
- When it's on:
  - The message/panel background is fully transparent.
  - Keep the frames and borders, unless a second switch, **Hide frames**, is on.
  - Text gets a readable outline/shadow automatically if the skin had none (e.g. 2px dark outline). The user can still change it.
- It works for all 22 skins, it's stored in the URL, and the skin cards show a small checker pattern behind the sample when it's on.

## Tests
- Keep all the tests passing.
- Add tests for the transparent-background settings: they encode/decode, and the auto outline is only added when the skin had none.
- Add a test for the fit function using panel padding + border + outer frame sizes.

Run each test file with node directly.

When done: try git add + commit. If git is blocked, say so; the lead commits it. Print a short summary.
