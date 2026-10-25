Round 7b: polish after the lead's Chromium test of round 7a (skins.html and the overlay, 1440x900). Fix only these.

1. **The skin card previews are too small and clipped.**
   - The mini preview text is ~6-7 px (unreadable), and the 2nd sample line is cut off at the bottom of the preview box (Bubble Lift, Glass Card, Name Tag, Comic Burst, Pastel Pop, Battle Royale...).
   - Make the preview area taller (≈ 40% of the card) and scale each skin so BOTH sample lines are fully visible and the text renders at ≥ 11 px on screen.
   - Center the sample in the box.
2. **The side "stream monitor" still clips the bottom line.**
   - Guild Chat's 3rd line (the "yells" line) and Signature's 3rd line are cut off at the bottom.
   - Fit the whole sample panel inside the monitor, scaling it down when needed.
3. **The Retro RPG Dialog Box skin shows a literal "?"**: its channel format in design/skins.json is `"? {name}: {message}"`. That was meant to be the ▶ speaker arrow (it got lost in an encoding pass). Restore "▶ {name}: {message}", and scan skins.json for any other format/tagline that contains a literal "?" which stands for a missing symbol.
4. **Possible lost chat messages.**
   - On a live channel (summit1g), the overlay received 7 PRIVMSG lines in 12 s, but `__chatskinsStats().messages` was 2.
   - Check whether that's expected: filters (bots/commands/links), the message lifetime, max messages, or fit removal. If messages are being dropped wrongly (e.g. a rate/animation queue or the fit loop removing new messages), fix it.
   - Add `__chatskinsStats().received` and `.filtered` counters so the lead can verify it.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
