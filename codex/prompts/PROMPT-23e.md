NEW TASK (round 23e): /api/dream rejects EVERY real model reply with "That design needs another try." (HTTP 502). The lead captured two REAL gpt-5-mini replies (status "completed", valid JSON) into:
- tests/fixtures/dream-real-spooky.json ("spooky purple frame with a cute ghost and bats")
- tests/fixtures/dream-real-cafe.json ("cozy cafe with a coffee cup")

`validateDreamReply(parsed, {partIds, name, fontOptions})` returns null for both. The designs look reasonable (a compact v:1 design with an `a` array of parts: i = part id, x/y/w/h permille, colors…).

1. Write `tests/dream-real-fixtures.test.js` that loads both fixtures with the real site-media/parts/parts.json and asserts validateDreamReply returns a valid result + completeDreamDesign succeeds. Make it pass by fixing the validator/expander (find the exact step that fails: the top-level description/moodTags checks, expandCompactDesign, normalizeStudio strict, part ids, the required chat-window part 19, or settings) and/or tightening the schema so the model can't produce the failing shape.
   - Be lenient where safe: clamp/drop bad values instead of rejecting the whole design. Reject only when there's no chat-window part or no valid parts.
2. **Status codes:** never return HTTP 502 from our own handlers (Cloudflare replaces 502 bodies with its own error page). Use 422 for invalid model output and 503 for upstream unavailable, with the same JSON body.
3. **Log the reason** for a rejected reply as one short code line (e.g. "dream reject: missing moodTags"). Never log the content or the key.

Keep the code commented. Run each test file with node directly. Try git add + commit; if it's blocked, say so. Report the files you changed and the exact reason the fixtures were failing.
