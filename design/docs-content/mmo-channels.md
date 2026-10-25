<!-- Outline: How a rule wins | Officer, says, and yells | Edit a channel set | Per-skin channel sets -->

# MMO chat channels

Chat channels turn Twitch messages into game-style dialogue. Labels such as [Officer], says, and yells are presentation rules, not private rooms or messages imported from a game.

## How a rule wins
Enabled rules are checked in order. The first matching dialogue rule formats the message. Typical presets check broadcaster, moderator, all-caps, action, channel mention, VIP, subscriber, then everyone. A first-time notice is evaluated separately when Twitch supplies the first-message tag.

## Officer, says, and yells
A moderator can receive an [Officer] label because of their moderator badge. An ordinary viewer uses the fallback dialogue, such as says. The all-caps rule requires at least six letters and at least 80% uppercase letters; it can choose a yells format. A moderator's uppercase message may still use Officer because the moderator rule is earlier.

```text
[Officer] Juniper: Ready for the next run?
Luna says: I brought snacks.
CapsLock yells: LET'S DO THIS
```

## Edit a channel set
Enable chat channels, choose a rule, and edit its label, color, and template. Use {name}, {message}, and {badges} in channel templates. Keep an everyone rule last so unmatched viewers still have a readable fallback. The exact preset sets are listed below.

## Per-skin channel sets
The following labels are taken from the current skin catalog. Skins without an enabled set use their normal name-and-message presentation. You can enable channels in the editor without changing the underlying Twitch conversation.

### ChatSkins Signature

- broadcaster: `HOST {name}: {message}`
- mod: `MOD {name}: {message}`
- action: `{name} {message}`
- mentionsChannel: `↳ {name}: {message}`
- vip: `{name}: {message}`
- sub: `{name}: {message}`
- everyone: `{name}: {message}`
- firstTime: `✦ NEW {name}: {message}`

### Guild Chat

- broadcaster: `[Guild Master] [{name}]: {message}`
- mod: `[Officer] [{name}]: {message}`
- allCaps: `[{name}] yells: {message}`
- action: `{name} {message}`
- mentionsChannel: `[{name}] whispers: {message}`
- vip: `[Party] [{name}]: {message}`
- sub: `[Guild] [{name}]: {message}`
- everyone: `[{name}] says: {message}`
- firstTime: `{name} has come online.`

### Fantasy MMO

- broadcaster: `[Linkshell] [{name}]: {message}`
- mod: `[Party] [{name}]: {message}`
- mentionsChannel: `[{name}] whispers: {message}`
- vip: `[Party] [{name}]: {message}`
- sub: `[Linkshell] [{name}]: {message}`
- everyone: `[{name}] says: {message}`
- firstTime: `{name} joins the adventure.`

### Retro RPG Dialog Box

- broadcaster: `▶ {name}: {message}`
- mod: `[Guide] {name}: {message}`
- allCaps: `{name} shouts! {message}`
- action: `{name} {message}`
- mentionsChannel: `{name} whispers: {message}`
- vip: `{name} (ally): {message}`
- sub: `{name} (member): {message}`
- everyone: `{name}: {message}`
- firstTime: `{name} has joined your party.`

### Crystal Realm

- broadcaster: `[FC] <{name}> {message}`
- mod: `[LS1] <{name}> {message}`
- allCaps: `{name} shouts: {message}`
- action: `{name} {message}`
- mentionsChannel: `>> {name}: {message}`
- vip: `({name}) {message}`
- sub: `[FC] <{name}> {message}`
- everyone: `{name}: {message}`

### Old-School Realm

- mod: `[Clan] {name}: {message}`
- allCaps: `{name}: {message}`
- action: `{name} {message}`
- everyone: `{name}: {message}`

### Frontier MMO

- broadcaster: `[Squad] {name}: {message}`
- mod: `[Squad] {name}: {message}`
- mentionsChannel: `[Whisper] {name}: {message}`
- vip: `[Party] {name}: {message}`
- sub: `[Guild] {name}: {message}`
- everyone: `[Map] {name}: {message}`

### Arena League

- broadcaster: `[Team] {name}: {message}`
- mod: `[Team] {name}: {message}`
- vip: `[Team] {name}: {message}`
- sub: `[Team] {name}: {message}`
- everyone: `[All] {name}: {message}`

### Tactical Ops

- mod: `(Admin) {name}: {message}`
- sub: `[Team] {name}: {message}`
- everyone: `{name}: {message}`
- firstTime: `*NEW* {name}: {message}`

### Block Server

- broadcaster: `[Owner] <{name}> {message}`
- mod: `[Mod] <{name}> {message}`
- sub: `[VIP+] <{name}> {message}`
- everyone: `<{name}> {message}`
- firstTime: `{name} joined the game`

### Hero Quest

- broadcaster: `[Leader] {name}: {message}`
- mod: `[Guard] {name}: {message}`
- vip: `[Striker] {name}: {message}`
- sub: `[Support] {name}: {message}`
- everyone: `[Party] {name}: {message}`

### Space Station

- mod: `📣 meeting · {name}: {message}`
- everyone: `{name}: {message}`
