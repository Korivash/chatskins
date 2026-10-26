NEW TASK (round 23d): /api/dream still fails. Real API run by the lead: the response comes back `status: "incomplete"`, `incomplete_details.reason: "max_output_tokens"`, with output_tokens 1200 (256 of them reasoning), so the JSON design is cut off and validation fails ("That design needs another try.").

**Fix in server/dream.mjs:**
- Raise `max_output_tokens` to 6000 for dream generation. Set reasoning effort to "minimal" if the model supports it, else "low".
- Make the design compact: ask for ≤ 16 parts by default (hard max 25), short ids, and integer permille transforms, so a typical design is ~1.5k output tokens.
- If the response `status` is "incomplete", retry ONCE with a request for fewer parts (≤ 10) before failing. Never return partial JSON. Count the tokens of both calls in the usage budget.
- Check /api/describe and /api/assistant for the same risk: give them enough max_output_tokens for their schemas (describe ~2000, assistant ~1500 per call) and handle "incomplete" the same way.
- **Test** with mocked responses: an incomplete first reply triggers one smaller retry; an incomplete second reply returns the friendly error; a complete reply validates.

Keep the code commented. Run each test file with node directly. Try git add + commit; if it's blocked, say so. Report the files you changed.
