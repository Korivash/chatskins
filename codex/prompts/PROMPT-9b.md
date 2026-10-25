Round 9b: round 9 regressed the skin cards on skins.html (screenshot: design/qa-9-skins.png, 1440x900, Featured tab). Round 7f had them right. Fix only these.

1. **Preview text is tiny again** (≈ 7-8 px), and `__chatskinsPreviewQA()` reports 6 of 7 Featured cards failing. Restore the round 7f fit rule: centered measured wrapper, `s = min(boxW*0.88/w, boxH*0.85/h, 1.4)`, sample font chosen so the on-screen text is ≥ 11 px. Every card in every tab must pass the QA hook.
2. **Name and message run together in the card previews and the side monitor** ("OrbitWelcome, everyone!", "JuniperCheck the party list.", "Orbit!Welcome"). The round 9 spacing test passes, but the PREVIEW code path still drops the separator. Make the previews use exactly the same message builder as overlay.html, and extend the test to the preview path.
3. **The taglines disappeared** from the cards (only "Featured" shows). Show the skin's tagline under the name again (max 2 lines), with the Featured badge next to the name.
4. Keep the round 9 look otherwise.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
