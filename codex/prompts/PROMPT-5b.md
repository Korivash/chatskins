Round 5b, a crash from your round 5 build (found in the lead's Chromium test):

Loading index.html throws `Uncaught ReferenceError: createMessage is not defined` (js/editor.js uses createMessage in preview()/drawSkins()). js/render.js exports it, but editor.js doesn't import it, so the skin gallery renders 0 cards and the editor is broken.

Fix the import. Then check EVERY module for other functions that are used but not imported or defined: run `node --check` on each file and scan the import lists against the usage, especially editor.js, overlay.js and fakechat.js.

Add a test (tests/imports.test.js) that parses each js/*.js file and fails if a called top-level identifier from another module is neither imported nor defined. A simple regex scan of names exported by the other modules is enough.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
