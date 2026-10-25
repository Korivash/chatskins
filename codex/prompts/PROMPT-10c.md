Round 10c: ROOT CAUSE found by the lead. Your 10b fix didn't change the result: links from skins.html still render 0 messages in `overlay.html?test=1`.

**Cause** (js/overlay.js ~lines 44-45): test mode adds the sample messages (line 44), then immediately runs `chatPlay.simulate('!skin guild', ...)` (line 45). The chat-play SKIN SWAP clears/rebuilds the chat root and drops every existing message. With no hash, the catalog/chat play isn't loaded, so no swap runs and messages survive. That's why only skins.html links fail.

This is also a REAL bug for streamers: when a viewer types `!skin guild` on stream, the whole chat history disappears.

**Fix:**
- A skin swap (chat play, vote winner, chaos mode, revert, skin-ui switch) must KEEP the messages that are on screen: re-render the existing message models in the new skin (crossfade), and keep their order, timers and lifetime.
- Keep a message model list (the data, not the DOM) so it can re-render.
- Never clear the root unless the user's own settings change in the editor.
- **Tests:** after adding 8 messages and simulating `!skin <x>`, the message count is still 8 and they render with the new skin; the revert also keeps them.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
