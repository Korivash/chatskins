Round 7a build: add the 8 new game-inspired skins from DESIGN.md "Round 7a" (Crystal Realm, Old-School Realm, Frontier MMO, Arena League, Tactical Ops, Block Server, Hero Quest, Space Station) with their chat channels, frames and effects. Read design/skins.json and the round 7a mockup section.

- Use the existing channels engine from round 5e. Extend it only if a skin needs something new:
  - per-user crew color hashed from the name
  - role icons drawn in CSS/SVG
  - the "flash" color-cycle and "wave" text effects (CSS keyframes, respect reduced motion)
- Every skin works in the editor preview, on the skins page (character select) and in overlay.html. Fake chat shows every channel.
- Keep all existing skins and features working. Old URLs keep working.

Tests:
- every skin decodes
- each new skin's channel rules match the expected lines for a fixture set of messages (broadcaster, mod, vip, sub, first-time, caps, /me, mention, plain)
- the crew-color hash is stable

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
