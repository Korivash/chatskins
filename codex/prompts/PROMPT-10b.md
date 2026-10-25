Round 10b: a regression from round 10 in `overlay.html?test=1`.

- `overlay.html?test=1` with NO settings hash: renders 8 sample messages (OK).
- `overlay.html?test=1#<settings from a skins.html "Use this skin" link>` (incl. channel "qa", transparentBackground true): renders ZERO messages. `__chatskinsStats()` = {messages:0, received:0, fitRemoved:0}, `#chat` is 28 px tall, no page errors. In round 8 the same kind of link rendered 8.
- Real chat on the same links still works (verified on a live channel), so only the test-mode injection is broken when a hash/channel is present.

Fix it so `?test=1` ALWAYS injects the fixed sample set (and the swap + emote-rain demo) for ANY settings hash, and never connects to IRC in test mode. Add a regression test that builds a link the way skins.html does (every skin, transparent default on) and checks that the test-mode message model is non-empty.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
