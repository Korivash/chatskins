Round 7g: a REGRESSION from round 7 (alerts). The OBS overlay shows NO chat again. Fix this first. Lead's Chromium measurement, overlay.html?test=1 and live chat, 1440x900:

- `#chat` computed: `height: 28px; max-height: 0px`. The inline var is `--panel-max-height: 0px`.
- `__chatskinsStats()`: messages 0, fitRemoved 8 (test mode) / received 5, fitRemoved 5 (live).
- The only child left is `.chat-surface`.

So `layoutPanel()` computes an available height of 0, almost certainly because the host it measures (`host.clientHeight`) is now 0: round 7 changed overlay.html / overlay.js / the root layout to add the alerts layer, so the chat host no longer fills the viewport (or the layout runs before the host is sized).

Fix:
- The chat host is always 100% of the viewport (`position: fixed; inset: 0`), independent of the alerts layer (which also sits in its own fixed layer).
- If the measured host height is 0, fall back to `window.innerHeight`, and re-run the layout on the next frame and on resize.
- **Guard:** never set a max-height below 120 px, and never remove a message when the available height is less than one message tall. Log a console warning instead.
- **Test:** a regression test for the layout function given host height 0 → uses the viewport height; given available < one message → keeps the newest message.

Also: `window.__chatskinsStageVisible()` returns false on editor.html at 1440x900, although the stage is at y 393..884 (fully inside the 900 px viewport). Fix the check (probably measuring the wrong element or including the alerts panel), and make sure the stage really is fully visible without scrolling.

Then check alerts still work: overlay test mode + the editor "Send test alert" show an alert card in the current skin's style.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
