Round 8 design: CHAT-POWERED SKINS. Viewers play with the overlay. You are the designer. Read DESIGN.md (all rounds, incl. 7 alerts and 7a skins), research/TOP-CHAT-UIS.md and the judging criteria below. Don't build. Work only inside design/.

Judging (equal weight): Innovation (novel vs existing tools), Impact (useful/entertaining for streamers AND their communities), Technical (how well it's built, use of Codex), Design (easy to use, fun to watch). The existing chat overlays are static, and this feature is what makes ChatSkins different: **chat can change the overlay live.**

Design these, with settings schema, defaults, editor UI and copy text:

1. **Two trigger sources:**
   - **Chat commands** (no login; works through the anonymous IRC we already read):
     - `!skin <name>` swaps the overlay skin for N seconds (default 60), then it reverts.
     - `!skinvote` starts a 45-s vote between 3 random allowed skins. Viewers type 1/2/3, and the winner shows for 2 min with a vote panel drawn in the current skin's style.
     - `!skinreset` (mods/broadcaster) reverts right away.
     - Who may use each command: everyone / subs / VIP / mods (configurable).
     - Per-user and global cooldowns.
     - An allowed-skins list, and aliases (e.g. "guild", "rpg", "pixel").
   - **Channel points** (affiliate/partner, uses the round 7 alerts login + EventSub): rewards matched by title ("ChatSkins: Swap skin", "ChatSkins: Emote rain", "ChatSkins: Chaos mode"), where the user input = the skin name. Optional "Create the rewards for me" button (scope `channel:manage:redemptions`). Otherwise show step-by-step instructions to create them by hand.
2. **Effects** (CSS keyframes only, cheap in OBS):
   - **swap skin:** a smooth crossfade between skins, with a small banner "{name} switched the chat to Guild Chat".
   - **emote rain:** the emotes from the redeemer's message fall across the chat area for 6 s.
   - **frame flash:** the frame pulses in the skin's accent color.
   - **spotlight:** pin one message, big, for 10 s.
   - **chaos mode:** a random skin every 8 s for 40 s.
3. **Safety:**
   - The overlay only ever changes looks.
   - Text from chat is always text (never HTML).
   - Skin names are matched against the allowed list.
   - Respect reduced motion; there's a master on/off switch and a "Panic: freeze skin" for the streamer.
4. **Editor:** a new "Chat play" step/section:
   - enable switches, permissions, cooldowns, allowed skins, aliases
   - test buttons for every command/effect that work WITHOUT login in the preview (simulate a viewer)
   - copy-ready text for the streamer's chat ("Type !skin guild to change my chat!")
5. **Showcase:** the home page demo and the skins page show a looping example of a viewer switching the skin.

Deliverables: DESIGN.md "Round 8: Chat-powered skins" and design/chatplay-mockup.html. Try git add/commit; if it's blocked, say so. Print a short summary.
