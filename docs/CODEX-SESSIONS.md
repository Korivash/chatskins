# Codex sessions

ChatSkins was built entirely with **OpenAI Codex**. Instead of one giant thread, we ran a small **multi-agent workflow**: each Codex agent has one job, and every round is its own short, focused session.

| Agent | Codex model | Job |
|---|---|---|
| **Astra**: designer | `gpt-6-astra` | Reads the brief, the research and the bug reports, then writes the design: layout, skin recipes, settings schema, mockups (`design/`). |
| **Luna**: builder | `gpt-6-luna` | Builds the app from Astra's design, writes the unit tests, and fixes the bugs found in testing. |
| **Luna**: researcher | `gpt-6-luna` + web search | Surveyed the top Twitch chat overlays (`research/TOP-CHAT-UIS.md`). |

**Why many sessions instead of one thread**
- **Token efficiency:** a fresh session per round keeps each context small. The agent reads only the brief, the design and the code it needs, instead of dragging hours of history. Design runs on Astra, and the bulk of the coding runs on Luna, the lighter model.
- **Task management:** one round = one task = one session. Every task is written down as a prompt file in this repo under `codex/prompts/` (`DESIGN-PROMPT*.md` for Astra, `PROMPT*.md` for Luna), so you can match each session below with its exact prompt and its commit.
- **Quality loop:** after every build we test in a real browser (and on live Twitch chat), measure what's wrong, and write those measurements into the next session's prompt.

The list below is generated from the local Codex session logs by `log-sessions.mjs`, so no row is typed by hand.

Total: **31** sessions.

| # | Started (UTC) | Session ID | Model | Role | Area | Task (first line of the prompt) |
|---|---|---|---|---|---|---|
| 1 | 2026-10-25 06:25:46 | `01a171bc-9090-7471-8bf8-1e58a9f2eb16` | gpt-6-astra | design (Astra) | app | You are the designer for this project. Read BRIEF.md fully first. Do NOT build the app; Codex builds it after  |
| 2 | 2026-10-25 06:32:56 | `01a171c3-2479-74f1-974d-5f7648ff9daf` | gpt-6-luna | build (Luna) | app | Build version 1 of the project described in BRIEF.md. Read BRIEF.md fully first, then follow the design in des |
| 3 | 2026-10-25 06:39:56 | `01a171c9-8b89-7512-bb77-2f0c563fa1ff` | gpt-6-astra | design (Astra) | app | Round 2 design. You are the designer. Read BRIEF.md and design/DESIGN.md (your round 1 design) first. Don't bu |
| 4 | 2026-10-25 06:46:01 | `01a171cf-1e3e-7bc1-91a1-f9a175623cd7` | gpt-6-luna | build (Luna) | app | Round 2 build. Read BRIEF.md, then design/DESIGN.md, design/skins.json and design/mockup.html (updated for rou |
| 5 | 2026-10-25 06:58:52 | `01a171da-df77-7832-a02d-84c18b33d3fd` | gpt-6-astra | design (Astra) | app | Round 3 design. You are the designer. Read BRIEF.md, design/DESIGN.md and the current editor (index.html, js/e |
| 6 | 2026-10-25 07:08:07 | `01a171e3-5938-74f2-96ec-6274e3fe0903` | gpt-6-luna | build (Luna) | app | Round 3 build: the FULL EDITOR. Read BRIEF.md, then design/DESIGN.md, design/skins.json and design/mockup.html |
| 7 | 2026-10-25 07:13:55 | `01a171e8-a836-74e2-8040-ddda555f1d87` | gpt-6-luna | build (Luna) | app | Round 3b: finish round 3 and fix the bugs found in browser testing. Read design/DESIGN.md (round 3 sections) a |
| 8 | 2026-10-25 07:18:56 | `01a171ed-41ca-7b42-a71b-920b1e6e637e` | gpt-6-luna | build (Luna) | app | Round 4: two bugs that are still there after round 3b (seen in a real Chromium browser), plus one owner reques |
| 9 | 2026-10-25 07:22:44 | `01a171f0-bb05-78b0-aa8a-9823205b6c4b` | gpt-6-luna | build (Luna) | app | Round 4b: the framed panel still runs off screen. The lead measured it in Chromium. Fix exactly this, then the |
| 10 | 2026-10-25 07:26:20 | `01a171f4-0704-76c2-8ae1-da773c2b8562` | gpt-6-luna | build (Luna) | app | Round 4c. Work only inside this folder. Same rules as before. ## 1. REGRESSION from 4b (top priority): no mess |
| 11 | 2026-10-25 07:31:33 | `01a171f8-cbcd-7e03-886f-39db1142c6cf` | gpt-6-luna | build (Luna) | app | Round 4d: three fixes found in the lead's Chromium test of 4c. Work only inside this folder. Same rules as bef |
| 12 | 2026-10-25 07:37:51 | `01a171fe-90ac-7952-978f-6dc5616a1cf4` | gpt-6-luna | build (Luna) | app | Round 4e: the frames are still not drawn. One bug, measured exactly. Work only inside this folder. ## Measured |
| 13 | 2026-10-25 07:39:36 | `01a17200-2c33-75d2-b52c-ec39b23f2820` | gpt-6-luna | build (Luna) | app | Round 4f: one crash from 4e. Work only inside this folder. Chromium page error on load of index.html (and so t |
| 14 | 2026-10-25 07:40:56 | `01a17201-6425-7252-a116-636ed1b90791` | gpt-6-luna | build (Luna) | app | Round 4g: the editor sections are empty. The owner found it on the live site, and the lead confirmed it in Chr |
| 15 | 2026-10-25 07:42:00 | `01a17202-60bd-7e41-909f-5357d84cd5c8` | gpt-6-luna | research (Luna) | research | Research task (no coding). Write the result to TOP-CHAT-UIS.md in this folder. We build ChatSkins, a free brow |
| 16 | 2026-10-25 07:43:53 | `01a17204-1922-7781-81cd-53d75bcf0e4f` | gpt-6-astra | design (Astra) | app | Round 5 design. You are the designer. First read research/TOP-CHAT-UIS.md (a fresh web survey of the most popu |
| 17 | 2026-10-25 07:49:34 | `01a17209-4c53-76d2-868f-646acd4abaa7` | gpt-6-luna | trailer art (Luna) | trailer art |  |
| 18 | 2026-10-25 07:55:19 | `01a1720e-8ef6-7b72-bdd6-008cece473d5` | gpt-6-luna | build (Luna) | app | Round 5 build. Read design/DESIGN.md (the "Round 5" section), design/skins.json and design/mockup.html, then t |
| 19 | 2026-10-25 08:02:31 | `01a17215-2627-7ca3-97a4-9a358899cd50` | gpt-6-astra | design (Astra) | app | Round 6 design: the WHOLE WEBSITE, judge-ready. You are the designer. Read BRIEF.md, research/TOP-CHAT-UIS.md, |
| 20 | 2026-10-25 08:20:19 | `01a17225-72bd-72a1-bd89-b0ad667466b4` | gpt-6-luna | build (Luna) | app | Deploy ChatSkins. Run exactly this one command and nothing else: bash C:/ops/chatskins/deploy.sh 0a115c1 . The |
| 21 | 2026-10-25 08:22:03 | `01a17227-0a34-7df1-b83e-da84f91d5cc5` | gpt-6-luna | trailer art (Luna) | trailer art |  |
| 22 | 2026-10-25 08:29:10 | `01a1722d-8c5f-7100-abcc-874ff93dabe8` | gpt-6-astra | design (Astra) | app | Round 6b design: make the website UNFORGETTABLE. You are the designer. Read your round 6 design (DESIGN.md "Ro |
| 23 | 2026-10-25 09:13:20 | `01a17255-fe17-7480-a7e6-0a6f5f5ded80` | gpt-6-astra | design (Astra) | app | Round 7a design: MORE game-inspired skins with chat channels. You are the designer. Read DESIGN.md (especially |
| 24 | 2026-10-25 10:37:28 | `01a172a3-0383-7030-b850-15f4391a6b1c` | gpt-6-astra | design (Astra) | app | Round 7 design: ALERTS. You are the designer. Read BRIEF.md, the DESIGN.md sections from all rounds (including |
| 25 | 2026-10-25 10:41:40 | `01a172a6-dd38-7673-8d94-f8b83713f4cf` | gpt-6-luna | build (Luna) | app | Round 7e: the skin showcase pictures look off (owner: "some of the pictures that showcase the chatskins are of |
| 26 | 2026-10-25 10:44:57 | `01a172a9-dbee-7ac1-983d-a5892a769424` | gpt-6-astra | design (Astra) | app | Round 9 design: a PREMIUM website look + GitBook-style DOCS. You are the designer. Work only inside design/. D |
| 27 | 2026-10-25 10:46:38 | `01a172ab-68f4-7562-9a0e-779cab3fd3a0` | gpt-6-luna | build (Luna) | app | Round 7f: redo the skin-preview fix. Round 7e made it WORSE and the lead reverted it (commit e2b6f18 was rever |
| 28 | 2026-10-25 11:18:18 | `01a172c8-6608-7a22-87f5-61ab8f09e584` | gpt-6-luna | build (Luna) | app | Round 6f: a live bug in server/skin-request.mjs (the request form fails for every real visitor). Change only t |
| 29 | 2026-10-25 11:26:06 | `01a172cf-8904-7ce2-8d39-d96851056728` | gpt-6-astra | design (Astra) | app | Round 8 design: CHAT-POWERED SKINS. Viewers play with the overlay. You are the designer. Read DESIGN.md (all r |
| 30 | 2026-10-25 11:29:35 | `01a172d2-b8fa-7793-9ad4-91c3e53619fa` | gpt-6-luna | build (Luna) | app | Round 9c: the previews don't run a test chat (owner: "the previews are not working, it should be doing a fake  |
| 31 | 2026-10-25 12:10:05 | `01a172f7-cff6-7af3-9e4a-688e53b8037f` | gpt-6-astra | design (Astra) | app | Round 10 design: SKINS THAT STAND OUT. You are the designer. Read DESIGN.md (all rounds), design/skins.json, t |
