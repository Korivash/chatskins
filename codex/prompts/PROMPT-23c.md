NEW TASK (round 23c): /api/dream fails on the real API. The lead ran the dream handler against OpenAI:

> 400 Invalid schema for response_format 'chatskins_dream': In context=('properties', 'design', 'properties', 'version'), schema must have a 'type' key.

**Fix:** server/dream.mjs's JSON schema `design.version` (and any other const/enum-only property) must declare a type, e.g. `{"type":"integer","enum":[1]}`.

Then audit EVERY strict JSON schema the server sends (dream, describe, assistant tools) against the OpenAI Structured Outputs strict-mode rules:
- every schema node has `type`
- every object has `additionalProperties:false` and lists ALL its properties in `required` (optional = a nullable type)
- no unsupported keywords (minLength/pattern only where supported; no `format` unless supported)
- `anyOf` items are full schemas
- nesting depth ≤ 5, property count limits

Add a test `tests/strict-schemas.test.js` that walks each exported schema and enforces these rules, so this can't regress.

Keep the code commented. Run each test file with node directly. Try git add + commit; if it's blocked, say so. Report the files you changed.
