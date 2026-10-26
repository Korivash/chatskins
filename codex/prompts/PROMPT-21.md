NEW TASK (round 21): **"Dream up a skin"**. Viewers describe a skin; the server GENERATES a brand-new skin; it's saved as a submission; the owner approves it, and then it's added to the site. It builds on the round 19 Frame Studio (parts library + design encoding) and the round 16/20 server (key, limits, moderation).

**Server `POST /api/dream {text (≤ 300 chars), name? (≤ 40), credit? (Twitch name, optional, ≤ 25)}`:**
- Model `DREAM_MODEL` (default gpt-5-mini) with a strict JSON schema output: a **Studio design** (≤ 25 parts from site-media/parts/parts.json with ids, transforms, colors) + chat settings (the same whitelist as describe) + a name + a 1-sentence description + mood tags.
- Validate everything (ids exist, ranges clamped, max parts).
- Moderation on the input AND the generated name/description.
- Save to `server-data/dream-submissions/<id>.json` (outside the web root, never served raw) with: text, design, settings, timestamp, hashed IP, credit, and status "pending".
- Return the design so the user immediately sees it live in the Studio (they can tweak it, then "Submit for the gallery", which updates the saved submission with their edits).
- **Limits:** 5 dreams/IP/day, 150/day total, the shared token budget. Submissions: 3/IP/day.
- **Notify for review:** post to the existing Discord request webhook (the same as skin requests) an embed with the name, description and credit, plus a **private preview link** `https://getchatskins.com/editor.html#dream=<id>&k=<random review token>` (that view is read-only unless the token matches). Never include IPs.
- **Approval:** a CLI script `tools/approve-dream.mjs <id> [--reject]` (run by the lead on the VPS) that moves an approved design into design/skins.json as a new skin in a "Community" category (with credit), so the normal deploy publishes it. Rejected ones are kept 30 days, then deleted.

**UI:** in the Studio and on skins.html, a "Dream up a skin" card: a text box + "Dream it" button → a loading shimmer → the generated design opens in the Studio. "Submit for the gallery" is optional and has a clear note ("We review every submission before it goes live. Credit: your Twitch name (optional)"). Plain words, mobile-friendly.

**Painted frames ON:** env `DREAM_IMAGES` (default **true**) also asks the image API for a painted frame PNG (transparent background, empty center, blank name plaque, no text/logos), stored with the submission and used as the dream's frame art (window + plaque auto-measured like site-media/frames). Hard limits: 20 images/day total, 2/IP/day; when the limit is hit, fall back to the parts-based design. The parts design always comes back instantly; the painted version arrives after it and the user can switch between the two.

**Tests (mock OpenAI):** schema validation/clamping, limits, moderation on output, the submission file written outside the web root, the webhook payload has no IP, the review token is required for the private preview, approve-dream adds a valid skin, and the parts-only path works with images off.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Report the files you created or changed.

**IMPORTANT (owner): "the streamer gets it right away".** The dreamed skin is the streamer's to USE IMMEDIATELY: as soon as it's generated, "Get my OBS link" works with it (the design is encoded in their own link, like any Studio design) and it's saved to their "My skins". Approval ONLY controls whether it's added to the public gallery for everyone; it never blocks the streamer using it. Say this in the UI: "It's yours now. Submit it if you'd like everyone to be able to pick it."
