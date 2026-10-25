Round 11 build: guided "1 click and go" setup. Read design/round11-setup.md and design/round11-setup-mockup.html (Astra's design) first, then build it in the editor.

**The owner's rule overrides the design wherever they conflict:** "streamers love easy 1 click and go stuff".
1. **One primary button, "Set up everything with Twitch":** ONE Twitch login asking for exactly the access the switched-on features need (chat play rewards + alerts). When it returns:
   - chat commands are on, with sensible defaults
   - the default channel point rewards are created AND enabled (reuse round 10g's flow)
   - the default alert types are on
   - one banner says what happened, in plain words
2. **ONE OBS link** that carries everything: chat + chat play + channel points + alerts. A streamer adds a single browser source.
   - Merge the private play link and the private alerts link into the overlay, so one overlay page runs chat, chat play, rewards and alerts.
   - Keep the token in the hash only, exactly as now. Never show the token on screen.
   - Older separate links keep working.
3. **The three feature cards** from the design (Chat commands, Channel points, Alerts): an ON/OFF switch, a status chip, a 3-step checklist, a "Test it" button, and everything advanced under a collapsed "Fine-tune".
4. **Partial failure never blocks the rest.** E.g. not Affiliate: channel points shows one plain sentence and the other features stay ready.
5. **No jargon** in the UI ("scope", "EventSub", "OAuth", "token" never appear). Mobile-friendly. Keep the round 10f/10g banners and the return-to-section behavior.
6. **Tests:**
   - the combined login requests the right access for the switched-on features
   - setting everything up after the return produces enabled rewards and alerts on
   - the single link decodes into chat + play + alerts in overlay.html
   - old links still work
   - the not-Affiliate path keeps the other features ready
   - no jargon words in editor.html or the rendered strings

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
