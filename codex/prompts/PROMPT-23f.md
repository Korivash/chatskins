NEW TASK (round 23f): the guide still doesn't make designs. A live test ("make me a cozy autumn frame with leaves and a coffee cup", fresh IP, not rate-limited) gets "Open Request and submit a new skin request…" with `actions: []`. The create_design tool exists and the system prompt mentions it, but gpt-5-mini ignores it because the docs pack about skin requests steers it.

**Fix (server/assistant.mjs):**
1. **Deterministic intent routing before the model call.** If the latest user message is a design/art request, send that turn with `tool_choice: {type:"function", name:"create_design"}`. A design/art request means a make/create/design/build/give me/I want verb + frame/skin/border/chat/overlay/look, OR mentions of art objects: ghost, cat, bunny, leaves, vines, coffee, moon, stars, crown, flowers, bats, skull, dragon, sword, heart, neon, sparkles…
2. **Sanitize the knowledge pack for this case:** strip or deprioritize the "Request a skin" doc when a design is being made. In the system prompt: "Never send users to the request form for a design; create it with create_design. The request form is only for asking the team to add an official skin."
3. **Run the design immediately:** when create_design is chosen, the server calls the existing dream generator directly (the same limits; the shared per-IP dream limit), returns the design in the action payload, and the browser applies it instantly in the Studio tab (opening it) with Undo.
   - If the dream limit is hit, the reply says so kindly and offers the Studio kits instead.
4. **The reply text** (from the second, tool_choice:none call) describes what was made and how to tweak it.
5. **Browser:** after the first message, hide the starter chips and the setup-guide buttons behind one "Setup guides" toggle (round 23 B1 asked for this; it's still showing everything).
6. **Tests:** 10 art requests route to create_design; 10 normal questions don't; the limit-hit path; the chips hide after the first message.

Keep the code commented. Run each test file with node directly. Try git add + commit; if it's blocked, say so. Report the files you changed.
