# Skin request service

Run with Node 20 or newer and no npm install:

```sh
SKIN_REQUEST_WEBHOOK='https://discord.com/api/webhooks/…' node server/skin-request.mjs
```

The service listens on `127.0.0.1:${PORT||4417}`. Configure `SKIN_REQUEST_WEBHOOK` only in the server environment. The public IIS site reverse-proxies `/api/*` to `http://127.0.0.1:4417/api/*`; serve the static HTML, CSS, design data and modules from the same origin. IIS must overwrite `X-Forwarded-For` and connect from the trusted proxy address in `SKIN_REQUEST_TRUSTED_PROXY` (default `127.0.0.1`). Do not expose the webhook variable to the browser.

Health check: `GET /api/health`. Request quotas are held in process memory, so run a single service instance unless shared atomic quota storage is added by the deployment.
