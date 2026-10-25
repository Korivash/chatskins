Round 8c: editor.html throws `ReferenceError: allowedCount is not defined` (js/chat-play-editor.js line ~21: `allowedCount=node(...)` assigns to an undeclared variable; ES modules are strict). As a result the whole Chat play section never renders: no command settings and no test buttons.

Fix:
- Declare it properly.
- Scan js/chat-play-*.js and js/alerts-*.js for any other implicit globals (assignments to undeclared identifiers).
- Add a test that mounts the Chat play editor and the alerts editor against a minimal fake document (or that statically scans every js/*.js for assignments to undeclared identifiers), so this class of bug fails CI.
- Make sure the Chat play section shows its test buttons:
  - "Simulate !skin <name>", "Start a !skinvote", emote rain, frame flash, spotlight, chaos mode, panic freeze
  - each one runs in the preview without login

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
