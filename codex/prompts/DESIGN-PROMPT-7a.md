Round 7a design: MORE game-inspired skins with chat channels. You are the designer. Read DESIGN.md (especially round 5e "chat channels") and design/skins.json. Work only inside design/. Don't build.

The owner loved the MMO-style Guild Chat channels ([Officer] for mods, "says", "yells") and wants the same for more games. Everything is INSPIRED-BY: generic skin names, no game names, logos, fonts, art or exact UI copies. Google Fonts + CSS/SVG frames only. Each skin defines a `channels` rule set (same schema as 5e) with fitting formats and colors.

Design these 8 new skins (generic names are suggestions):
1. **"Crystal Realm"** (a modern Final-Fantasy-style MMO):
   - A dark translucent panel with a thin silver/blue ornate frame and an elegant serif-ish font.
   - Channels:
     - broadcaster `[FC] <{name}> {message}` (Free Company style, light blue-green)
     - mods `[LS1] <{name}> {message}` (Linkshell, green)
     - VIP `({name}) {message}` (Party, light blue)
     - subs `[FC] <{name}>`
     - ALL CAPS `{name} shouts: {message}` (orange)
     - `/me` emote (light grey italic)
     - mention `>> {name}: {message}` (Tell, pink)
     - everyone `{name}: {message}` (Say, white)
2. **"Old-School Realm"** (a classic browser-MMO style; upgrade the existing Old-School MMO): yellow say text over gameplay, a dark-brown stone chatbox, a pixel-ish serif.
   - Channels: mods `[Clan] {name}: ...` (red-brown name, purple text); everyone `{name}: {message}` (blue name, yellow text); ALL CAPS gets a "flash" color-cycle effect; `/me` = a "wave" text effect.
3. **"Frontier MMO"** (a Guild-Wars-like):
   - Channels: map chat (white), squad (yellow), guild (light green), party (blue), whispers (pink).
   - A parchment-edge dark panel.
4. **"Arena League"** (a MOBA-style in-game chat):
   - `[All] {name}: ` (orange/red) for everyone; `[Team] {name}: ` (blue) for subs/VIP/mods; broadcaster highlighted gold.
   - A dark slanted panel with a gold trim.
5. **"Tactical Ops"** (a tactical-shooter style):
   - Team colors (CT-like blue for subs, T-like orange for everyone).
   - Mods get a `(Admin)` prefix; first-time chatters `*NEW*`.
   - A minimal translucent box and a monospace-ish font.
6. **"Block Server"** (a sandbox-game multiplayer server style):
   - `<{name}> {message}`, a pixel font, a grey translucent background.
   - Mods `[Mod] <{name}>` (gold); broadcaster `[Owner]` (red); subs `[VIP+]` (aqua).
   - First-time chatter: a yellow "{name} joined the game".
7. **"Hero Quest"** (an action-RPG party chat): a party-frame style with role icons (shield/sword/heart in CSS/SVG) for mod/VIP/sub.
8. **"Space Station"** (a social-deduction-style emergency-meeting chat): rounded white bubbles; a crew-color dot per user (hashed from the name); mods get a "📣 meeting" badge.

9. **"ChatSkins Signature": the FLAGSHIP showcase skin** (owner: "build us a good overlay to show off"). This is the hero of the demo video and the first Featured skin, our own brand look, not inspired by any game.
   - Use the ChatSkins brand (mint #7EEAD6 + violet #B7AAFF on deep navy, the Chakra Petch / Barlow fonts).
   - A glassy panel with an animated gradient border that slowly flows mint→violet, and subtle scanlines.
   - Name chips that use each chatter's Twitch color with a soft glow, and role badges (broadcaster crown, mod sword, VIP gem, sub star) in CSS/SVG.
   - A smooth slide+pop entrance and a gentle fade-out.
   - Channels:
     - broadcaster gets a gold "HOST" tag + a gold border flash
     - mods get "MOD" in mint
     - first-time chatters get a "NEW" sparkle tag and a one-time shimmer
     - mentions of the channel get a violet highlight bar
     - /me renders italic in violet
     - emote-only messages show big emotes
   - It must be readable over ANY gameplay: auto contrast outline + backing.
   - Respect reduced motion. Keep CPU low (CSS keyframes only).

For each skin: the full settings + frame recipe + channels + stat bars + gallery group ("Game styles"), and one line of design notes. Add them to design/skins.json and to the mockup (a samples section for these 8, showing every channel).

Try git add/commit; if it's blocked, say so. Print a short summary.
