Round 11c: URGENT. Overlay links are too long for OBS. The owner pasted his link into OBS and the overlay shows no chat.

Measured by the lead on the live site with `buildChatPlayUrl` (channel korivash, chat play on):
- 1 allowed skin: 18,997 chars. 3 allowed skins: 39,830. All 52 allowed: 536,366 chars.
- The normal "Get your links" overlay link with chat play on was 51,708 chars.
- OBS's browser-source URL field is a Qt QLineEdit, which truncates at 32,767 characters, so the link gets silently cut and the overlay can't decode it.

The cause: every allowed skin is embedded as a FULL settings object, and the full chat settings are embedded too.

**Fix (all link builders: overlay link, private play link, alerts link, the round 11 single link):**
- Encode allowed skins by **id only**. The overlay already loads design/skins.json and rebuilds them. Embed full settings only for user-modified or custom skins, and then only as a diff against the base skin.
- Encode the chat settings as a **diff from the base skin's defaults** (only changed keys).
- Compress the JSON (CompressionStream 'deflate-raw' + base64url), with a version marker. Keep decoding every older link format so links already in OBS keep working.
- Target: a typical link (one modified skin, chat play on with 2 to 6 allowed skins, alerts on, token) is **under 4,000 characters**. A hard guard keeps every generated link under 30,000; if one would be bigger, show a plain warning to allow fewer custom skins.
- Show the link length nowhere. Just make it work.
- **Tests:** the lengths for 1, 6 and 52 allowed skins (all under 30,000; the typical case under 4,000); a round trip decodes to identical effective settings; old-format links still decode; the overlay renders test chat from a compact link.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
