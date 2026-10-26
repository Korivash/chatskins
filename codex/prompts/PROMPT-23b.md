NEW TASK (round 23b): make Ask ChatSkins understand the WHOLE PROJECT. The owner: "smarter also by understanding the project - it should know the code and docs but not explain the code, this way it knows what is possible and not, and where".

**Build a generated "capability map"** (tools/build-capabilities.mjs → server/capabilities.json, regenerated at server start if stale and by the deploy) that's derived from the CODE, not hand-written:
1. **Every setting key** the editor exposes: from the settings schema/defaults (js/settings.js etc.) with type, range/options, default, the tab + section + visible label where the user changes it, and whether it's in Simple or only behind "Show all options".
2. **Every control/button** the user can reach: the label, tab, element id for highlight(), and what it does (one line). Parse editor.html and the tab builders.
3. **All skins** (id, name, category, mood tags, frame/illustrated/animated), **all Studio parts** (from parts.json), **all frames** (shapes, webcam frame available?).
4. **Features + their limits:** chat commands (which commands, cooldowns, who can use them), channel points (Affiliate needed, which rewards), alerts (which event types), Place it, Studio (max 25 parts), Describe/Dream (limits), supported streaming apps, what's NOT supported (e.g. no YouTube/Kick chat, no custom fonts upload, no sound for chat… derive from the code where possible; mark anything inferred).
5. **Where things live:** for each feature, the page/tab/section path the user follows ("Customize → Viewers → Channel points card").

**Guide behavior:**
- Include a compact version of this map + the docs pack in the system context (keep it under ~12k tokens; select the relevant sections per question with simple keyword matching).
- The guide uses the map to answer "can it do X?" accurately ("No, ChatSkins doesn't read YouTube chat yet"), give exact click paths, and choose valid settings/controls for its tools. It may only use setting keys and control ids that exist in the map; validate actions against the map server-side.
- **NEVER explain or show the code:** no file names, function names, code snippets or implementation details, even if asked ("I can't share how it's built, but here's how to use it…"). Add a test.

**Tests:**
- the map builds from the real code and includes ≥ 95% of the editor setting keys
- every highlight id in the map exists in editor.html
- "can it do X" for 5 supported and 5 unsupported features (mocked model, with the map present in the prompt)
- the code-explaining refusal
- actions with unknown keys are rejected

Keep the code commented. Run each test file with node directly. Try git add + commit; if it's blocked, say so. Report the files you changed.
