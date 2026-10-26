# Skin request service

Run with Node 20 or newer and no npm install:

```sh
SKIN_REQUEST_WEBHOOK='https://discord.com/api/webhooks/…' node server/skin-request.mjs
```

The service listens on `127.0.0.1:${PORT||4417}`. Configure `SKIN_REQUEST_WEBHOOK` only in the server environment. The public IIS site reverse-proxies `/api/*` to `http://127.0.0.1:4417/api/*`; serve the static HTML, CSS, design data and modules from the same origin. IIS must overwrite `X-Forwarded-For` and connect from the trusted proxy address in `SKIN_REQUEST_TRUSTED_PROXY` (default `127.0.0.1`). Do not expose the webhook variable to the browser.

Health check: `GET /api/health`. Request quotas are held in process memory, so run a single service instance unless shared atomic quota storage is added by the deployment.

The same process also serves `POST /api/describe` and `POST /api/assistant`. Set `OPENAI_KEY_FILE` to a server-only file containing the API key; the default is `C:/ops/secrets/openai-chatskins.txt`. `DESCRIBE_MODEL` and `ASSISTANT_MODEL` choose the Responses API models (both default to `gpt-5-mini`). The key is only read by the server and is never returned to the browser. Both features use the persisted `server/describe-usage.json` quota file and share its 1,500,000-token daily ceiling. Ask ChatSkins builds its knowledge pack from `docs/content/*.md`, moderates each message, and only returns validated editor actions. Its chat history is kept in the visitor's browser session only.

Painted Dream frames use `DREAM_IMAGE_MODEL` (default `gpt-image-2.5-flare`, with `gpt-image-1.5` as a compatibility fallback) and need an `ffmpeg` executable on the server to convert the transparent PNG output to WebP. If it is not on `PATH`, set `DREAM_WEBP_ENCODER` to its executable path. The resulting private image is served through `/api/dream-image/<id>.webp`; source files remain outside the site directory.
