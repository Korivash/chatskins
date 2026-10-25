Round 8e: on skins.html, when a user clicks a skin, the side "stream monitor" sometimes rotates to ANOTHER skin by itself. That's the round 8 chat-play showcase loop (a simulated viewer "!skin" swap). Owner: "we need that to stop so people can fully preview the skin."

Fix:
- skins.html: the monitor must ALWAYS show the skin the user selected. Remove the auto skin-swap / chaos / vote showcase from the skins page (and from the editor's default preview). Test Chat keeps running for the selected skin.
- Show the chat-play features on the skins page with a clearly labeled button instead: "Preview chat play". It plays ONE swap demo, then returns to the selected skin automatically after the demo. The user always ends up back on their pick.
- Home page hero: the showcase loop may stay there (it's a demo reel), but it must never change what the skins page or editor have selected.
- Same check for the card previews: they never change skin.
- Add a test: selecting a skin then advancing fake timers for 2 minutes → the monitor still shows the selected skin id.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
