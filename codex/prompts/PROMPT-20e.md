NEW TASK (round 20e): two guide bugs found by the owner on the live site.

1. **Every follow-up message fails** with "Ask ChatSkins could not reply." Reproduced by the lead: a request with history `[user, assistant, user]` gets 503 in 0.5 s, while a single user message works. Cause: server/assistant.mjs builds every message as `content:[{type:'input_text',...}]`, including role "assistant". The Responses API requires assistant turns to use `output_text` (or plain string content).
   - **Fix:** map role user → input_text and role assistant → output_text (or send `{role, content: "<string>"}` for both).
   - Also log the upstream HTTP status code on any non-OK OpenAI response (status only, never the body or the key), so failures are diagnosable.
   - **Test:** a 3-turn conversation produces the correct content types; a mocked 400 is logged as a status code only.
2. **Layout (the owner):** "chat is above the buttons, it should be below it". In the Ask ChatSkins panel, put the starter question buttons / "Setup guides" at the TOP and the conversation BELOW them, with the input box at the very bottom. The newest message stays visible above the input (auto-scroll), and the panel remains keyboard accessible.

Keep the code commented. Run each test file with node directly. Try git add + commit; if it's blocked, say so. Report the files you changed.
