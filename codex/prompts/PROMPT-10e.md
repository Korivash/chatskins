Round 10e: small polish found by the lead in the overlay renders and the live site.

1. **Stale count:** skins.html says "42 starting points. Every detail editable." There are 52 skins. Derive the number from skins.json everywhere it's shown (skins page, home stats, docs), never hardcode it.
2. **Missing spaces after 10d** (name formats glue together):
   - Battle Arena "[Team]VipNova" should be "[Team] VipNova".
   - Retro RPG "HypeSquadshouts!" should be "HypeSquad shouts!".
   - Dialog skin "HypeSquadsays:" should be "HypeSquad says:".
   - Space Command "COMMS /SubPixel" should be "COMMS / SubPixel".
   - Battle Royale "[Squad]HypeSquad" should be "[Squad] HypeSquad".
   Prefixes/suffixes must keep their intended spacing; whitespace from the format template must survive (check for trim/flex gap regressions).
3. **Double colon:** Bubble Chat shows "ChannelPal: :". The name suffix and the separator are both rendering. Only one colon.
4. **404:** every page load requests `https://getchatskins.com/undefined` (an image or emote with a missing url, likely a Test Chat sample emote or a preview asset). Find it and never set src/href to undefined.
5. **Tests:** for every skin, render the sample "HypeSquad: THIS IS AMAZING" and assert there's whitespace or a separator between the prefix, the name and the text, and no ": :" anywhere. Add a test that no rendered src/href is the string "undefined".

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
