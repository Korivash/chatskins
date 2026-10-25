Round 9c: the previews don't run a test chat (owner: "the previews are not working, it should be doing a fake chat etc"). Lead's check on the live site: the home monitor cycles (OK), but:

1. **skins.html:** the side "stream monitor" is STATIC. Its text was identical after 7 s. It must run Test Chat continuously for the selected skin: new sample messages every 0.8-2 s with bursts, all roles/channels (broadcaster, mod, VIP, sub, first-timer, caps yell, /me, mention, emote, long line), and old ones leave through the skin's removal animation. On switching skins, the stream restarts in the new skin.
2. **skins.html card previews:** they're static. Give each card a gentle loop: a new line slides in every ~3-4 s (only while the card is on screen, via IntersectionObserver, to keep CPU low). Respect the "Pause previews" button and reduced motion.
3. **editor.html:** the preview is static until the user presses "Test Chat". Start Test Chat automatically when the editor opens (unless Live channel mode or a channel preview is active). The "Test Chat" button toggles pause/resume, and its label shows the state ("Pause Test Chat" / "Resume Test Chat").
4. Test Chat stays preview-only: never in the overlay URL, never in overlay.html (except the explicit `?test=1` mode).

Use the existing fakechat.js generator. Keep the round 9 look and every test hook.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
