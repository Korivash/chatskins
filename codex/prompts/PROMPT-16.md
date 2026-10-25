Round 16 build: **"Describe your chat"**, an AI style helper built on the OpenAI API. It sets up a skin from plain words. This is NOT a general chatbot.

**Server (extend server/skin-request.mjs; same process, same IIS /api rewrite):** `POST /api/describe {text, current?}`
- Read the API key from the file named in env `OPENAI_KEY_FILE` (default `C:/ops/secrets/openai-chatskins.txt`). NEVER log it, return it or send it to the browser.
- Model `gpt-5-mini` via `/v1/responses` with `max_output_tokens` ~700 and reasoning effort low. Use a **strict JSON schema** (Structured Outputs) for the reply:
  `{ skinId (one of the catalog ids), settings: {only whitelisted keys: font family/size/weight, colors, name color mode, background + opacity, frame color/glow/glowMode/middle background/opacity/title text, entrance animation, message borders, max messages, lifetime}, summary (1 short sentence) }`.
- The system prompt contains the compact skin catalog (id, name, category, mood tags) and the allowed keys/ranges.
- Validate the reply against the same schema server-side: drop unknown keys, clamp ranges, and fall back to `{error}` if it's invalid.
- **Hard limits** (the OpenAI org limit is NOT enforced, so we enforce our own):
  - 15 requests/IP/day (use cf-connecting-ip like the request form)
  - 600 requests/day total
  - 1 request per 4 s per IP
  - input ≤ 300 chars
  - a total token budget of 1,500,000/day counted from usage, persisted in a small JSON file next to the server
  - return 429 with a friendly message when a limit is hit
- Origin check exactly like the skin request endpoint.
- Content safety: a quick moderation call (`/v1/moderations`) on the input. Refuse hateful/sexual/self-harm text with a friendly message.

**Editor UI (Look tab, top):** a box "Describe your chat" with a placeholder like "spooky purple, big text, cute ghost vibe" plus 4 example chips.
- Pressing **Make it** shows a loading shimmer, then applies the returned skin + settings to the live preview (undoable as ONE step) and shows the summary.
- Follow-ups work ("bigger text", "less glow") by sending `current` settings.
- Small note under the box: "Uses OpenAI. Don't include personal info."
- If the API is off or limited: a friendly message plus a button to open the 3-question "Make it mine" guide.
- Mobile-friendly and accessible.

**Tests (mock fetch to OpenAI; no real calls in tests):**
- the schema validator drops unknown keys and clamps values
- the rate limits (per-IP, global, cooldown, token budget) work and persist
- the key is never present in any response or log line
- the origin check works
- the moderation-refused path works
- the UI applies a mocked reply as one undo step
- the fallback appears on 429/500

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
