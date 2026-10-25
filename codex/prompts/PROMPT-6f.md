Round 6f: a live bug in server/skin-request.mjs (the request form fails for every real visitor). Change only this file + its test.

Behind IIS (ARR reverse proxy), the Host header that reaches the Node server is `127.0.0.1:4417`, but the browser's Origin is `https://chatskins.korivash.com`. The origin check `new URL(origin).host !== (originHost || headers.host)` therefore returns 403 "forbidden" for every browser POST (curl without an Origin passes).

Fix:
- `originHost` defaults to `process.env.SKIN_REQUEST_ORIGIN_HOST`, which may hold a comma-separated list of allowed hosts. Default when unset: `chatskins.korivash.com`. Also accept the `x-forwarded-host` header ONLY when the connection comes from a trusted proxy (the same trusted list as resolveIp), and compare Origin against the allowed list.
- A missing Origin keeps the current behavior.
- **Tests:**
  - Origin https://chatskins.korivash.com with Host 127.0.0.1:4417 → accepted
  - Origin https://evil.example → 403
  - the env list is honored

Run the server test with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
