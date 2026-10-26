NEW TASK (round 20c): the Ask ChatSkins actions work now (live test: open_tab + highlight fire, and apply_style for "pink and black"). But every reply that has actions now says only **"I can do that. Here is the change."**, even "How do I add this to OBS?", which must give the steps. That's a server fallback string used when the model returns a function call with no text.

**Fix in server/assistant.mjs:**
- After tool calls, ALWAYS produce a real, helpful text answer. Either make a second /v1/responses call that includes the function_call outputs (the standard tool loop) so the model writes the answer, or require a `say` field alongside the tool calls through a strict schema.
- The text must explain what was done and what to do next (e.g. the numbered OBS steps + "I opened Get link and highlighted the button").
- For "how do I…" questions, also offer the matching walkthrough (`start_walkthrough`).
- Never fall back to a generic string unless the API failed.
- Keep the token budget accounting for both calls.
- **Test** with mocked responses: a function_call followed by a text turn returns both the actions and that text; a generic-only reply is a test failure.

Keep the code commented and readable. Run each test file with node directly. Try git add + commit; if it's blocked, say so. Report the files you changed.
