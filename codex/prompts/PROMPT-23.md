NEW TASK (round 23): make ChatSkins SMARTER and LESS CONFUSING. The owner: "Can chatskins be smarter? actually do custom designs etc - its kinda confusing with all the chat options and chat messages squished". See design/qa-23-guide-chat.png (left: the guide after "make me a spooky purple frame with a ghost"; right: the Chat tab).

Keep all code commented and readable (file headers, JSDoc, no dense one-liners).

**A. The guide and "Describe your chat" must create REAL custom designs** (this includes round 21; read codex/prompts/PROMPT-21.md and build it now as part of this round):
1. Add an AI tool `create_design({prompt})` (in /api/assistant) and the `POST /api/dream` endpoint from PROMPT-21. Both generate a NEW Frame Studio design (parts from site-media/parts/parts.json, the chat window, the plaque with the streamer name, stickers like a ghost, effects) + matching chat settings, validated/clamped.
   - The guide's reply for "make me a spooky purple frame with a ghost" must CALL create_design, open the Studio tab and show the generated design live in the preview, with a ghost sticker. Never answer "add a ghost image yourself".
2. The painted-frame option from PROMPT-21 (DREAM_IMAGES, 20/day): show "Painting a hand-drawn version…" and swap it in when ready.
3. Everything from PROMPT-21: the streamer gets it instantly (in their link + My skins); "Submit for the gallery" sends it for review; tools/approve-dream.mjs.
4. "Describe your chat" (the Look tab box) uses the same generator when the request implies new art ("with a ghost", "a cat on top", "vines"), and the skin picker otherwise.

**B. A less confusing UI:**
1. **Guide panel:**
   - widen it to 420 px (mobile: full-width sheet)
   - the conversation area takes most of the height; replies render with paragraphs and numbered lists (safe text → simple formatting, never innerHTML from the model)
   - the starter chips show only before the first message, and the duplicate "Quick help" block goes behind a single "Setup guides" button
   - action notes as small chips under the reply
2. **Chat tab:** replace the raw checkboxes with the site's toggle rows (label left, switch right, one-line description), grouped under "What shows" / "Motion". Same for any other raw checkbox anywhere in the editor.
3. **Squished messages in the preview:** the default chat panel in the editor preview is a narrow column, so messages wrap every 2–3 words.
   - Default width for non-frame skins: 30% of the canvas (min 380 px at 1280x720).
   - Default font 18 px at 1080p (scaled).
   - Comfortable line height and message spacing.
   - Frame skins keep their aspect but use the larger default size.
   - Test: at 1280x720 the sample "SpeedrunSam: THIS DUNGEON LOOKS INCREDIBLE" fits on ≤ 2 lines in Signature.

**Tests:** create_design is called for art requests (mocked); the generated design is valid; the guide never tells users to add art themselves; the toggle rows are accessible; the preview width defaults; and PROMPT-21's tests.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Report the files you created or changed.
