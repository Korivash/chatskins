Round 6a: a security fix in server/skin-request.mjs before it goes live (lead review).

The site runs behind Cloudflare → IIS (ARR reverse proxy) → this server on 127.0.0.1:4417. Rate limiting depends on the client IP, and resolveIp has two problems:

1. **The proxy check is too narrow.** It trusts the proxy only when `remoteAddress === '127.0.0.1'`. Node may report the IIS connection as `::1` or `::ffff:127.0.0.1`, and then EVERY visitor gets the same IP (the proxy's), so one person could use up the 3-per-hour limit for everyone.
   Fix: treat 127.0.0.1, ::1 and ::ffff:127.0.0.1 (plus the env override) as trusted.
2. **The client IP is spoofable.** It takes the FIRST X-Forwarded-For value, which a client can set itself.
   Fix: when the connection comes from a trusted proxy, use the `cf-connecting-ip` header first (Cloudflare sets it and clients can't forge it through Cloudflare). Otherwise use the LAST X-Forwarded-For entry added by our proxy chain, or remoteAddress.

Add tests for:
- ::ffff:127.0.0.1 + cf-connecting-ip
- a spoofed XFF that is ignored
- an untrusted remote address

Don't change anything else. Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
