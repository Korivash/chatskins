Round 5e: "chat channels" for Guild Chat (owner: "make the guild chat like WoW, Officer for mods, say + guild"). Keep it inspired-by: no game names or logos in the UI.

## Add a generic per-skin feature: role/message "channels"
- **The setting:** a skin can define `channels`, an ordered list of rules. Each rule has:
  - a match: broadcaster / mod / vip / sub / firstTime / everyone / allCaps / action (`/me`) / mentionsChannel
  - a name-format template (tokens `{name}`, `{message}`, `{badges}`)
  - a text color, a name color and optional italic
- The first matching rule wins. It's editable in the editor (Advanced → "Chat channels"): enable/disable, reorder, edit format and colors. It's stored compactly in the URL.

## Guild Chat gets these rules (MMO-style colors)
| Who / what | Format | Color |
|---|---|---|
| Broadcaster | `[Guild Master] [{name}]: {message}` | gold #FFD100 name, guild green text #40FF40 |
| Mods | `[Officer] [{name}]: {message}` | officer green #40C040 |
| VIP | `[Party] [{name}]: {message}` | party blue #AAAAFF |
| Subs | `[Guild] [{name}]: {message}` | guild green #40FF40 |
| ALL CAPS (≥ 6 letters, ≥ 80% caps) | `[{name}] yells: {message}` | yell red #FF4040 |
| `/me` actions (the IRC ACTION) | `{name} {message}` | emote orange #FF8040, italic |
| Mentions the channel name | `[{name}] whispers: {message}` | whisper pink #FF80FF |
| First-time chatter | before their message, a yellow system line `{name} has come online.` (#FFFF00) | |
| Everyone else | `[{name}] says: {message}` | say white #FFFFFF |

- Rule order: broadcaster, mod, allCaps, action, mention, vip, sub, everyone.
- The gold double frame stays.

Also give 2-3 other game styles a fitting channel set (e.g. Fantasy MMO: [Linkshell]/[Party]/says; Retro RPG: speaker boxes).

Fake chat must exercise every rule (a mod line, a VIP, a sub, a caps yell, a /me, a mention, a first-timer).

## Tests
- the rule matching order
- caps detection
- ACTION parsing from IRC (`\u0001ACTION ...\u0001`)
- templates fill text only
- URL round trip of channels

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
