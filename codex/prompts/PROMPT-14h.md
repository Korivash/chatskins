Round 14h: one remaining readability bug. In `overlay.html?test=1&skin=frame-haunted-manor`, the MESSAGE text (not the names) still renders dark purple on the dark message rows. Names are readable; message bodies aren't. Your 14g contrast test passes, so it must be checking the default text color while a template message-style rule (haunted-manor's message style CSS) overrides the message body color.
- Fix the haunted-manor message body color: light lavender/near-white.
- Change the contrast test to compute the EFFECTIVE color of `.message` body text for every frame skin through the same CSS path (template message-style rules included), not just the settings default.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
