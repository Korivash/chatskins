NEW TASK (round 20): **"Ask ChatSkins" guide**, an AI helper that walks streamers through setup, customizes for them and answers questions. The owner asked for it ("the ai agent that will help them customize and walk everyone through and answer questions"). It reuses the round 16 server pieces (key file, model env, rate limits, moderation, origin check).

**Server `POST /api/assistant {messages:[{role,content}] (last 8, each ≤ 500 chars), page, state}`:**
- Model from env `ASSISTANT_MODEL` (default `gpt-5-mini`), via /v1/responses with function tools.
- **System prompt:**
  - Friendly, short answers (≤ 80 words), plain words, no jargon.
  - Grounded ONLY in the docs: build a compact knowledge pack at server start from docs/content/*.md (strip markdown, include headings).
  - It must say "I'm not sure. Here's the Docs page" instead of inventing.
  - Never asks for or accepts tokens, passwords or personal info.
  - Refuses anything unrelated to ChatSkins/streaming setup, politely.
- **Tools** (the server returns them as actions; the browser executes them):
  - `apply_style({skinId?, settings})`: same whitelist + validation as /api/describe
  - `open_tab({tab: look|style|chat|viewers|alerts|getlink|studio})`
  - `highlight({control})`: an allowlist of control ids, e.g. "Place it", "Get my OBS link", "Set up everything with Twitch", "Frame color"
  - `start_walkthrough({id: obs-setup|frames|chat-commands|alerts|place-it})`
  - `open_doc({slug})`
- **Limits (separate counters from /api/describe but the same shared daily token budget):** 40 messages/IP/day, 2,000/day total, 1 per 3 s per IP. Friendly 429s.

**Browser UI (every page, bottom-right):**
- A launcher "Need help? Ask ChatSkins" opens a compact chat panel with 4 starter chips: "How do I add this to OBS?", "Make it match my brand", "Turn on channel points", "Why isn't chat showing?".
- Streamed or simple typing indicator. Actions run with a visible note ("Opened Style tab", "Applied a spooky look · Undo").
- **Walkthroughs:** 5 guided tours with spotlight + "Next" steps over the real UI (OBS setup: pick skin → Get link → copy → OBS Browser Source → size 1280x720). They work without the AI too (static), and the AI can start them.
- The conversation stays in sessionStorage only. A "Clear" button. The note "Uses OpenAI. Don't share personal info."
- If the API is down or limited, show the static FAQ + the walkthrough buttons.
- Accessible: a focus trap in the panel, Esc closes, labeled; mobile = full-height sheet.

**Tests (mock OpenAI):**
- the knowledge pack builds from the docs
- tool actions are validated (unknown tool/control rejected)
- limits work
- the key is never in responses/logs
- moderation refusal
- off-topic refusal
- the UI executes each action type
- walkthroughs run without the API
- the panel is keyboard accessible

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Report the files you created or changed.
