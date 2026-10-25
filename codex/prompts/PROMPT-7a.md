Round 7a build: add the 9 new skins from DESIGN.md "Round 7a" (Crystal Realm, Old-School Realm, Frontier MMO, Arena League, Tactical Ops, Block Server, Hero Quest, Space Station, and the FLAGSHIP "ChatSkins Signature", which becomes the first Featured skin and the default on the home page demo) with their chat channels, frames and effects. Read design/skins.json and the round 7a mockup section.

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

## ALSO FIX (owner: "the game styles pictures are bad looking"; lead's Chromium check of skins.html, Game styles tab, 1440x900)
1. **The Game styles cards show NO picture**: only a title and a paragraph of text. Every card in EVERY tab must show a real live mini preview of the skin (2 short sample lines rendered with that skin's actual frame, fonts and colors, scaled to the card), the same way the Streamer favorites cards do. The text goes under the picture.
2. **The card text is internal design notes** (e.g. "Reference preserved: two continuous gold rings, green guild dialogue and a deep forest pane"). Replace it with a short, friendly player-facing tagline per skin, max ~8 words (e.g. Guild Chat → "MMO guild chat with officer and yell channels"). Keep the design notes only in DESIGN.md. Add a `tagline` field in skins.json for every skin and use it on cards and in the side panel.
3. **The side-panel "stream monitor" clips the skin**: Guild Chat's gold frame is cut off on the right, and the second line overlaps the frame edge. Scale the preview so the whole framed panel fits inside the monitor with padding, for every skin.
4. **The sample lines in previews should show off each skin's channels** (e.g. Guild Chat: one [Officer] line, one "says", one "yells"), not just "says" twice.

Tests: every skin has a tagline ≤ 60 chars; every card renders a preview element (DOM test with a minimal fake document or a pure function that builds the card model).
