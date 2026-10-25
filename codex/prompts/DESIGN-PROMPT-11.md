Round 11 design: make the Twitch-connected settings EASY. You are the designer (Astra). Don't edit js/ or css/; write only to design/ (round11-setup.md + round11-setup-mockup.html).

**Owner feedback** after testing on his real channel: "these are the type of settings we need to make easy for people". He connected channel points and nothing visible happened. Many streamers aren't technical.

Read: editor.html, js/chat-play-editor.js, js/alerts-editor.js, design/DESIGN.md, and codex/prompts/PROMPT-10f.md and PROMPT-10g.md (in progress: one-click "connect + create rewards", enabled by default, and result banners).

**Design a guided setup for the 3 Twitch-connected features: Chat commands, Channel points, Alerts.**
- Each feature is one card with a plain-language promise ("Let viewers change your overlay with !skin"), a single ON/OFF switch, and a status chip: Off / Needs Twitch login / Ready / Problem (with the fix).
- One "Connect Twitch" flow that asks for exactly the access the switched-on features need, explains each permission in one short sentence, and returns to the same card.
- A 3-step checklist per feature, showing what's done and what's next. Channel points: 1) Connect 2) Rewards created and on (names + costs, editable) 3) Copy your private link into OBS. Alerts: 1) Connect 2) Pick alert types 3) Copy the alerts link.
- A "Test it" button per card that fires a preview right there.
- Defaults that just work: chat commands on with sensible cooldowns, mods and the broadcaster always allowed, the commonly used skins pre-selected.
- Advanced options (cooldowns, who can use it, allowed skins) are collapsed under "Fine-tune".
- Copy: short, friendly, no jargon (never say "scope", "EventSub", "OAuth" in the UI). Errors say what to do next.
- Mobile-friendly, and matches the current black + blue site design.

**Deliver:**
- round11-setup.md: layout, every state of each card, exact UI copy, which existing functions each control calls, and edge cases (not Affiliate, token expired, 50-reward limit, logged in as the wrong account).
- round11-setup-mockup.html: a static mockup showing all three cards, including one in each status.
Print a short summary.
