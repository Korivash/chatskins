Round 7 design: ALERTS. You are the designer. Read BRIEF.md, the DESIGN.md sections from all rounds (including "Round 6: Website") and design/skins.json. Don't build: Codex builds after you. Work only inside design/.

The owner wants the roadmap finished for the contest: "Follow and sub alerts (EventSub)". Alerts must match the user's chosen chat skin, so the whole overlay feels like one game UI.

Design:
1. **Alert types:** follow, sub (tiers 1-3, Prime), resub (months + message), gift sub (count), raid (viewers), cheer (bits), plus channel-point redemption (optional).
2. **Per skin:** each skin gets a matching alert card, e.g.:
   - Guild Chat: a gold-framed "[Guild] Achievement" toast
   - Retro RPG: a dialog box "A wild follower appears!"
   - Block Craft: a pixel advancement toast

   Specify a generic alert recipe that every skin's tokens feed: frame, font, colors, an icon drawn in CSS/SVG, entrance/exit animation, and duration by alert type.
3. **Layout:** where alerts show (top-center default; any corner or center), size, a queue (one at a time, max queue length, de-duplicate rapid follows), and an optional sound. Sounds are synthesized with WebAudio, so no audio files from others; a volume setting.
4. **Editor:** a new "Alerts" step/section:
   - "Connect alerts" (Twitch login with scopes)
   - per-type toggles and messages with tokens `{name}`, `{months}`, `{count}`, `{viewers}`, `{bits}`
   - "Send test alert" buttons for every type, which work WITHOUT login in the preview
5. **Security UX:**
   - The alerts link carries a Twitch token in the URL #fragment, which is never sent to any server. Treat it like a password: a clear warning, a "copy alerts link" button separate from the chat link, and "Disconnect/revoke".
   - Minimal scopes: `moderator:read:followers`, `channel:read:subscriptions`, `bits:read`, `channel:read:redemptions`.
   - Explain the token expiry and the reconnect flow.

Deliverables: DESIGN.md "Round 7: Alerts" (settings schema, alert recipe, copy text), skins.json alert recipes for every skin, and design/alerts-mockup.html (every alert type in 4 skins). Try git add/commit; if it's blocked, say so. Print a short summary.
