NEW TASK (round 20d): one exact bug in the round 20c tool loop (server/assistant.mjs). The live guide now returns 503 for every message. The lead ran the handler against the real API. The first /v1/responses call succeeds; the second call returns 400:

> Item 'fc_…' of type 'function_call' was provided without its required 'reasoning' item: 'rs_…'.

The second call's input is `system, user, function_call, function_call, function_call_output, function_call_output`. With reasoning models, the reasoning items must be passed back too.

**Fix (pick the simplest):** call the second request with `previous_response_id: data.id` and `input: [...toolResults]` (only the function_call_output items; the server keeps context). Make sure the first request has `store: true` (the default), or else pass back ALL of `data.output` items (reasoning + function_call) in order before the outputs.
- Keep the same tools available in the second call but with `tool_choice: "none"`, so it writes the text answer.
- Add a test with a mocked first response containing a reasoning item + function_call. The second request must include `previous_response_id` (or the reasoning item) and must succeed in the mock.

Keep the code commented. Run each test file with node directly. Try git add + commit; if it's blocked, say so. Report the files you changed.
