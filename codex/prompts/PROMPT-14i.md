Round 14i: owner feedback on the live frames: "turning off the white borders on the chat messages would make it look better".

In the frame-template skins, each chat message row has a light/white outline or border (and some styles have divider lines between rows), visible on e.g. Haunted Manor, Solar Oracle, Mothlight, Star Oracle, Neon Kawaii Goth and Sugar Static.
- **Default:** NO borders, outlines or dividers on message rows for every frame template. Keep a soft background behind each row only where it's needed for readability (the existing contrast tests must still pass); otherwise no row box at all.
- Add a Simple-mode toggle "Message borders" (default OFF) for template skins that brings the old row outline back if a streamer wants it.
- Don't change non-template skins.
- **Test:** for every frame skin with default settings, computed border-width and outline-width on .message is 0 and there are no divider pseudo-elements.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
