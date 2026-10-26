NEW TASK (round 20b): fixes for the Ask ChatSkins guide + the Studio, found by the lead on the live API and in Chromium. Keep the code commented and readable (file headers, JSDoc, no dense one-liners).

1. **Mojibake in guide replies.** The live replies contain "â†’" (should be →), "Ã—" (×), "â€”" (—) and "Â·" (·). The docs knowledge pack is read with the wrong encoding, or re-encoded. In server/assistant.mjs read docs/content/*.md with `readFile(path,'utf8')`, make sure the reply JSON is UTF-8 (`Content-Type: application/json; charset=utf-8`), and never call any latin1/binary conversion. Add a test that a doc containing "→ × — ·" round-trips through the pack and the reply unchanged.
2. **Actions never fire.** "Make it match my pink and black brand" returned a text answer with `actions: []`. The model must call `apply_style` for customization requests and `open_tab`/`highlight` for "where is X".
   - Check that the tools are actually sent in the /v1/responses request (the `tools` array with strict JSON schemas, `tool_choice: "auto"`).
   - Check that function_call output items are parsed into actions.
   - Add to the system prompt: "When the user wants a change, call apply_style; when they ask where something is, call open_tab + highlight."
   - Test with a mocked response containing a function_call item: the actions are returned and validated.
3. **The launcher covers "Get my OBS link":** the bottom-right "Need help? Ask ChatSkins" button sits on top of the sticky bar's primary button on editor.html. On pages with the sticky bar, place the launcher above the bar (bottom offset = bar height + 12px) or inside the bar's left side; nothing may overlap the primary button at 1440x900 or 390x844.
4. **Studio:** with a kit applied, the bottom chat messages overflow past the frame's bottom band in the editor preview. Apply the same fit-to-window rule as the frame templates (messages stay inside the chat-window part's inner rect).

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Report the files you changed.
