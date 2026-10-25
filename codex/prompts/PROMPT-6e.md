Round 6e: two owner requests. Change only these.

1. **Rename "Fake chat" to "Test Chat"** everywhere a user can see it: buttons, labels, tooltips, aria-labels, status text, helper copy, docs/README/FAQ text on the site. Internal identifiers can stay, but rename them where it's cheap.
2. **Remove sound from the website completely** (owner: "we don't need sound on the website"):
   - Delete the "Sound: Off" toggle button, all WebAudio/menu-bleep code and the localStorage key.
   - Remove any mention of sound in the copy.
   - (Optional alert sounds in OBS overlays, coming in a later round, are a separate setting; don't add anything now.)

Keep everything else working. Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
