# Round 8: Chat-powered skins

Design-only handoff, October 25, 2026. Review `chatplay-mockup.html`; nothing in this round implements IRC, OAuth, reward creation or production overlay behavior. All work stays in `design/`. This section defines audience interaction; Round 7 owns alerts/authentication, Round 7a owns the 42-skin catalog and skin recipes, and the already-present Round 9 owns the latest website shell. Earlier appearance, migration, emote and moderation contracts remain intact. Round 8 replaces the provisional audience behavior in Round 9 where more specific. No existing preset or saved-skin schema is changed.

## Direction: the audience gets a turn

**“Let chat change the scenery.”** A viewer's ordinary message becomes a visible, temporary change to the shared conversation. The satisfying sequence is sender → command → transformation → named credit → return home. Keep the conversation itself stable. Viewers change how chat looks, never its channel, filters, text, source position or the streamer's saved design.

The supplied `research/TOP-CHAT-UIS.md` establishes strong existing customization, emotes and low-friction Browser Source tools. Its evidence does not establish that every competitor is static or lacks interactive integrations. Our differentiator is the packaged experience: no-login commands, curated skin choices, an in-world vote and a reliable return home. Do not market this as the world's first reactive overlay. Emote effects alone are not the novelty.

Equal-weight judging plan:

| Criterion | Reviewable design evidence | Implementation evidence still needed |
| --- | --- | --- |
| Innovation | A message visibly changes the same conversation; the vote panel belongs to its current skin | Compare the complete workflow with existing widgets, not just animation |
| Impact | Streamer picks the wardrobe and can stop it; viewers get credit and collective choice | Observe a streamer and community using it without explanation |
| Technical | Bounded effects, explicit state transitions, permissions, replay handling and separate test events | Codex implements this contract with deterministic clock/event fixtures, codec checks and OBS profiling; no invented performance result |
| Design | One optional step, no login for commands or tests, stable chat, readable countdown, visible emergency control | Keyboard, narrow-screen, reduced-motion and gameplay readability review |

Visual plan: use Round 9 Canvas #05070D, Surface #0B1425, Raised #101E34, Text #F3F7FF, Muted #A6B6CD and Cyan #38BDF8. Familjen Grotesk headings, Manrope controls; skin fonts remain Lato, VT323, Pixelify Sans and Barlow/Chakra Petch. Native system fallbacks keep the standalone specimen usable offline. Layout is left-aligned settings beside a large conversation; the memorable element is the conversation changing worlds. No flashing page chrome, faux popularity counts or decorative activity graph.

```text
1 Skin / 2 Customize / 3 Alerts / 4 Chat play / 5 Get your links
Enable chat play                   Preview only · Simulated viewer
Chat commands                      [credit banner + return countdown]
  who / cooldowns                  [same messages, new frame and type]
Allowed skins + aliases             [in-world vote, when active]
Effects / Channel points           Try commands / Try every effect
Copy chat instructions             Panic: freeze skin / Resume chat play
```

Plan critique: an effect-button dashboard would hide the product's difference. The specimen leads with an actual `!skin guild` exchange and puts the small control surface below the chat. Keep account setup in a disclosure; keep all tests reachable before connecting. Home and Skins placements are shown on the same review sheet, with a shared looping example; existing website files need not be rewritten for this handoff.

## Two sources, one admission policy

**Commands:** keep the existing anonymous IRC read connection; never request chat login or send chat replies. Parse before `hideCommands` display filtering, but after channel/blocked-user/bot eligibility. Require the configured room; reject forwarded Shared Chat messages whose source room differs. Read role badges/mod/subscriber/user-id from server metadata, never typed names or text badges. Request tags and commands capabilities. Missing role metadata fails closed for restricted actions; ordinary everyone commands can use the server-provided login as identity fallback. Broadcaster is verified room/user ID equality or broadcaster metadata, not display-name equality. Twitch's current IRC documentation describes authenticated bots; anonymous compatibility is an existing-project dependency to verify in the builder, not a new documented Twitch guarantee. [IRC capabilities and tags](https://dev.twitch.tv/docs/chat/irc/).

| Input | Default permission | Result |
| --- | --- | --- |
| `!skin <name>` | Everyone | Allowed skin for 60 s; then full home appearance returns |
| `!skinvote` | Everyone | Start a 45 s vote, 3 distinct random allowed skins; winner for 120 s |
| `1`, `2`, `3` while voting | Everyone, separately configurable | One current ballot per server identity; latest eligible choice replaces it |
| `!skinreset` | Mods + broadcaster | Cancel active vote, swap, chaos and transient effects; return home immediately |

Swap/start-vote/ballot permissions each offer **Everyone / Subs / VIP / Mods**. These are sets, not a fictitious role ladder: Subs includes subs/founders, mods and broadcaster; VIP includes VIPs, mods and broadcaster; Mods includes mods and broadcaster. Subs does not implicitly include VIPs, nor vice versa. Reset has **Mods + broadcaster / Broadcaster only**, never Everyone/Subs/VIP: the requested emergency privilege cannot be widened accidentally. Master off/frozen overrides all inputs. Reset does not resume a frozen session. Broadcaster/mod reset bypasses cooldowns; other mod commands obey them.

Trim outer whitespace, command token ASCII-case-insensitive, match whole token only. Swap consumes the remaining trimmed name (multiword catalog names supported); vote/reset reject trailing arguments. Maximum parsed command 160 code points. Normalize names with NFKC, trim, collapse spaces and case-fold; compare exact normalized catalog ID, display name or alias in the allowed map. No fuzzy/substrings, remote URLs or CSS. Reject collisions across aliases, display names and IDs with “That name already selects {skin}. Choose a different alias.” Alias is 1–24 ASCII letters/digits/hyphens; comma-separated entry UI, maximum 8 aliases per skin. Unknown/disallowed: “Choose an allowed skin: {short list}.” Missing argument: “Use !skin followed by a skin name, like !skin guild.” No network resolution for a name.

Default cooldowns for accepted swap and vote-start: **120 s per viewer**, **15 s global**, shared across those two commands, measured from admission. Each has its own enable/permission setting but cannot bypass the common clock by alternating commands. Rejected, duplicate or malformed attempts do not extend clocks. Ballot changes have an independent fixed 1 s per-viewer interval and no global cooldown; reset bypasses both. Ignore command-message ID replays for 10 min, bounded to 10,000 IDs. Use monotonic deadlines and prune expired viewer entries; cap identities at 10,000 and reject new identities until space expires rather than evicting active cooldowns. Error counts aggregate in editor diagnostics, never produce an on-stream flood. A single neutral “Chat play is busy” state indicator may remain beside the countdown; do not display repeated per-user rejections. Copy instructions explain the cooldown because this read-only tool cannot reply in Twitch chat.

**Channel points:** Affiliate/Partner feature, off by default, reuse Round 7 broadcaster login and EventSub WebSocket subscription `channel.channel_points_custom_reward_redemption.add` v1. Read existing rewards with `channel:read:redemptions`; existing manage permission also suffices. Request `channel:manage:redemptions` only from the explicit creation flow. Reuse an existing redemption subscription within a source, never subscribe twice for alerts and play. Match the configured broadcaster and exact, case-sensitive reward title; no prefix matching. Titles below are editable with 1–45 characters and unique among mappings. Ignore canceled/unknown events. Bind successful matches to reward IDs in connection state for diagnostics; title rename stops matching and shows “Reward title changed. Update the match or rename it in Twitch.” [EventSub subscription permissions](https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/#channelchannel_points_custom_reward_redemptionadd).

| Reward title (exact defaults) | Input and result | Suggested creation cost / Twitch cooldown |
| --- | --- | --- |
| ChatSkins: Swap skin | Required skin name or alias → swap for 60 s | 500 points / 60 s |
| ChatSkins: Emote rain | Required emote codes → those resolved emotes, 6 s | 250 points / 60 s |
| ChatSkins: Chaos mode | Optional allowed skin name → first skin; remaining skins random; blank → random first | 1,000 points / 180 s |
| ChatSkins: Frame flash (optional, off) | No input → accent pulse | 100 points / 60 s |
| ChatSkins: Spotlight (optional, off) | Required message → pinned message for 10 s | 500 points / 60 s |

“User input = skin name” applies to skin-selection rewards; rain needs emote codes and spotlight needs message text. Do not accidentally pass rain text through the skin-name parser. No additional public commands are added for these three effects in this round; their live triggers are the optional reward mappings, and all five effects have offline test buttons.

The redemption event supplies plain `user_input`, not IRC emote offsets. Resolve whole emote codes through already-cached enabled provider sets and known native emote mappings; do not scrape or guess sub-only assets. No emotes resolved: show a small text receipt “{name} sent an emote rain” with zero particles and editor helper “No supported emotes found. Try a channel emote code.” Never substitute another viewer's recent message. Spotlight uses this event's input; a future message-ID picker is not part of v1. [Redemption event fields](https://dev.twitch.tv/docs/eventsub/eventsub-reference/#channel-points-custom-reward-redemption-add-event).

Rewards bypass chat-command role/cooldown rules because Twitch controls who can redeem. They still obey master, frozen state, allowed list, effect enables and a separate 15 s global / 60 s per-redeemer admission cooldown. Do not queue play events; an active swap/vote/winner/chaos session rejects all new play except reset, and one transient effect at a time is allowed only while home. This deliberately trades stacking for a readable shared moment. Explain this on every reward: “One chat effect at a time. Busy or frozen requests may need a manual refund.” Keep Twitch request queue enabled. Round 8 does **not** mark fulfilled, cancel or auto-refund redemptions, even with manage scope. Editor records played/skipped plus reason and redemption ID for manual Twitch review (session only, latest 100). Dedupe both EventSub message ID and redemption ID for 10 min, bounded 10,000; never count a retry as a new effect. Mapped play rewards suppress the generic Round 7 redemption toast, including skipped requests; other rewards still use alerts. Put mapped titles in both copied configs so separate sources agree without cross-window messaging.

### Connect and create copy

Heading **“Make channel points part of the show.”** Helper **“Optional. Requires Affiliate or Partner status. Chat commands and preview tests work without signing in.”** Actions **“Connect channel points”**, **“Create the rewards for me”**, **“Set them up myself”**. Connection states: Not connected / Authorized, checking rewards / Ready / Permission needed / Not available for this channel / Connection lost. Ready requires matching account, socket and subscription, not merely OAuth success. Use Round 7 account mismatch, cancellation, expiry, reconnect/revoke and partial-failure handling. Expired points access disables points only; anonymous commands continue.

Creation opens a review of selected titles, prompts, editable integer costs (1–1,000,000 design range), input requirements and cooldowns. Default select first three, optional two unchecked. Explain “This adds rewards to your Twitch channel. It does not spend viewers' points.” Then **“Continue to Twitch”** only if scope is missing, followed by **“Create 3 rewards”** after authorization. Create disabled rewards so the streamer can check OBS before enabling them in Twitch. Set `should_redemptions_skip_request_queue=false`. Read existing titles first; offer “Use existing” instead of duplicate creation. Store successful IDs in connection state; on timeout refetch before retrying, retain partial success, show “2 created. Retry the remaining reward.” Do not modify existing rewards silently. No scope grant is implied by the mockup. API constraints: unique titles, maximum 50 rewards total, owner token, manage scope for creation. [Twitch custom rewards API](https://dev.twitch.tv/docs/api/reference/#create-custom-rewards).

Manual instructions, fully visible without login:

1. Open Twitch Creator Dashboard → Viewer Rewards → Channel Points → Manage Rewards & Challenges → Add New Custom Reward (labels may vary).
2. Copy a title exactly from the table. Set its cost and copy its prompt. For Swap turn on required text; for Rain require emote codes; Chaos text is optional; Spotlight requires text; Flash needs none.
3. Set the suggested cooldown. Keep the request queue on so skipped requests can be reviewed/refunded manually. Leave the reward paused while setting up.
4. In ChatSkins choose Connect channel points as the channel owner, allow reading redemptions, and check each title says “Matched”. Creation permission is not needed for this path.
5. Copy the private play source into OBS, replacing the ordinary chat source for this configuration. Send offline tests first, enable rewards in Twitch, then redeem once to verify. Review that redemption in Twitch; tests spend no points.

Prompts: Swap — “Choose an allowed skin: guild, rpg, pixel or signature. Shows for 60 seconds. One effect at a time; skipped requests need manual review.” Rain — “Enter emote codes from this channel, separated by spaces. They fall for 6 seconds. Unsupported codes stay text; busy requests need manual review.” Chaos — “Optional: choose an allowed starting skin. Chat changes every 8 seconds for 40 seconds. One effect at a time; busy requests need manual review.” Flash — “Pulse the chat frame in its accent color. Motion settings apply. Busy requests need manual review.” Spotlight — “Write a message to feature in the overlay for 10 seconds. Channel filters apply. Busy requests need manual review.” Generate the allowed examples from actual settings before copying.

## Session and vote behavior

The **home skin** is the streamer's complete edited appearance snapshot, not the last temporary skin. `home → swap → home`, `home → vote → winner → home`, `home → chaos → home`. There is no stack of restoration timers. Only one session owns the appearance. Same-home selection is a no-op with “Already wearing {skin}”; no cooldown spent. Manual baseline edits or channel changes cancel play before replacing the baseline. Normal off cancels and returns home. Reload starts home without replay; freeze latch persists per source in local storage, never in share exports. If latch storage fails, report it in controls and advise disabling/replacing the OBS source for a persistent stop. No promise of cross-device persistence.

During a temporary appearance, preserve home channel/room, filters, providers, name readability policy, grouping, message limits/lifetimes, max messages, source width, position/inset, direction, alignment, reduceMotion, `hideFrames` and `transparentBackground`. Swap only approved preset typography, paint, frame construction, presentation and channel-format recipes, bounded to the existing source footprint. Keep message IDs, arrival times, moderation state and order; reflow once after font readiness, no replayed entrances. Custom CSS and external background images are excluded from viewer-selectable skins in v1; only bundled catalog IDs are allowed. Home custom CSS stays stored and is restored on credential-free command sources. Never execute custom CSS on a token-bearing source.

Voting samples three unique allowed IDs uniformly without replacement (home may be a candidate). Require at least three allowed skins: otherwise disable start-vote with “Allow at least 3 skins to start a vote.” Freeze candidate order and panel appearance at start. Vote is an overlay-local poll, not Twitch Polls; no poll scope. Show numbers, full names, counts and “Type 1, 2 or 3 in chat · {seconds}s left”. Render bars with static widths updated at most once a second, no animated width. Ballots are exact trimmed single digits only, received after start and before the 45 s monotonic deadline. Existing chat-number messages are not replayed as votes. Permission is checked per ballot. One current vote per user; repeat same choice does nothing, changes replace previous counts. Sample ceiling 10,000 voters; show editor notice if full. No voter list goes on stream or into saved settings.

Unique most votes wins; hold winner **120 s after crossfade completes**. Tie or zero votes keeps the home skin and shows “Tie — keeping {skin}” / “No votes this time — keeping {skin}” for 3 s; no random tie breaker. Winning card: “Chat chose {skin} · {votes} votes · Back home in 2:00”. Reset cancels without picking a winner. During IRC loss cancel the vote and return home (cannot conduct a fair partial vote); a timed swap/chaos can complete using its local deadline. Fresh connection starts no old action. Deleted messages/users remove retained ballots and spotlight content; channel clear cancels vote/spotlight. A played skin swap need not be undone for deletion of its command. All retained message copies receive moderation removal, including crossfade layers.

Priority: local panic/master off → authorized reset → moderation removal → deadline completion → new accepted command/reward. Simultaneous arrivals are processed in receive order. Admission/expiry are single transactions; a late timer cannot restore an obsolete snapshot. Pause/hidden editor demos stop; OBS deadlines continue logically while hidden/throttled. On waking, recompute the current state, never play missed chaos frames in a burst.

## Five effects and skin-owned feedback

| Effect | Default and motion recipe | Reduced-motion equivalent |
| --- | --- | --- |
| Swap skin | 300 ms opacity crossfade of at most 2 bounded chat layers, old layer aria-hidden; identical messages, no layout tween. Banner 4 s: “{name} switched the chat to Guild Chat”. Separate timer persists for the 60 s hold | Immediate new appearance; static banner and timer |
| Emote rain | 6 s total; maximum 18 cached static emote images, 24–40 px, up to 6 unique codes recycled. Precompute lanes and delays once; last particle completes by 6 s. CSS translateY/rotate/opacity only, behind text and inside source bounds | Static row of up to 6 emotes with sender credit for 6 s |
| Frame flash | Two gentle 900 ms pulses (1.8 s total), accent ring opacity .15→.55→.15; no full-screen flash, text opacity unchanged, hidden-frame preference respected | Static accent marker for 1.8 s; no pulse |
| Spotlight | One pinned card above chat for 10 s, name 18 px and message 28 px/1.4, 240 graphemes max/3 visible lines, wrap; 180 ms opacity entrance/exit within duration. Original chat stays underneath; no Twitch pin API | Static card with identical content and 10 s hold |
| Chaos mode | 40 s, exactly five choices at t=0/8/16/24/32 s, excluding immediate repeats; restore home at 40 s. Require ≥2 allowed IDs. Optional input sets first choice. Label “{name} started chaos · {remaining}s” | Choose one allowed skin at t=0, hold 40 s, return home; say “Chaos, calm edition” |

All new animation uses CSS keyframes on opacity/transform, never canvas, video, physics, animated filter/shadow/blur, layout dimensions or per-frame JavaScript. Timers may change session state and whole-second labels. Suspend inherited ambient skin animation during play so the effect remains the only moving layer. Use static emote assets for rain even when motion is on, preventing animated media from defeating the budget. Remove temporary nodes/timers at completion, reset, off, panic and teardown. At most 30 message nodes per layer, two layers during crossfade only, one panel/banner and 18 particles. These are budgets to profile in OBS, not measured guarantees.

Vote/banner/spotlight inherit the current skin's actual frame, type and colors through the Round 7 recipe binding; no generic purple plate. Guild: continuous double gold ring and forest surface; Retro: full white dialog rings and blue backing; Block: square stepped frame; Signature: mint/violet ring with flow stopped. Bind current appearance once per effect. Minimum foreground contrast 4.5:1 with local opaque backing if needed. Respect explicit hidden-frame/transparency preferences as in Round 7. Vote minimum body 18 source px; header 20, option number 24. At default 480 px chat width, panel sits above chat with 12 px gap; reserve its measured height, temporarily evict oldest complete chat rows if necessary. Do not cover or shrink newest text. On very short sources use a compact three-line option list; no clipping. All status text wraps; display names capped at 50 graphemes, never interpolated as markup. Banner and vote are mutually exclusive; countdown remains small and readable. No sounds in Round 8.

## Settings schema and defaults

New separate **chatPlay v1** config; do not add it to existing closed savedSkinSchema or mutate chat v3. All objects closed; all leaves in this default instance required after normalization. Types and bounds below are normative. Missing config migrates to enabled=false. Invalid/future version disables live play, retains existing chat and offline tests, and reports “These Chat play settings need updating.” Invalid roles/IDs never broaden permissions; keep last valid editor draft. Unknown keys dropped with notice. Persist only configuration in `chat-studio.chat-play.v1`; credentials and session state never enter this object.

```json
{
  "version": 1,
  "enabled": false,
  "commands": {
    "enabled": true,
    "swap": {"enabled": true, "permission": "everyone"},
    "vote": {"enabled": true, "permission": "everyone", "voterPermission": "everyone"},
    "reset": {"enabled": true, "permission": "mods"},
    "userCooldownSeconds": 120,
    "globalCooldownSeconds": 15
  },
  "allowedSkinIds": ["chatskins-signature", "guild-chat", "retro-rpg", "block-craft"],
  "aliases": [
    {"skinId": "chatskins-signature", "names": ["signature"]},
    {"skinId": "guild-chat", "names": ["guild"]},
    {"skinId": "retro-rpg", "names": ["rpg"]},
    {"skinId": "block-craft", "names": ["pixel"]}
  ],
  "effects": {
    "swap": {"enabled": true, "holdSeconds": 60},
    "rain": {"enabled": true, "durationSeconds": 6},
    "flash": {"enabled": true, "durationMs": 1800},
    "spotlight": {"enabled": true, "holdSeconds": 10},
    "chaos": {"enabled": false, "intervalSeconds": 8, "durationSeconds": 40}
  },
  "vote": {"durationSeconds": 45, "winnerSeconds": 120, "optionCount": 3, "tie": "keep-home"},
  "points": {
    "enabled": false,
    "userCooldownSeconds": 60,
    "globalCooldownSeconds": 15,
    "rewards": [
      {"effect": "swap", "enabled": true, "title": "ChatSkins: Swap skin"},
      {"effect": "rain", "enabled": true, "title": "ChatSkins: Emote rain"},
      {"effect": "chaos", "enabled": false, "title": "ChatSkins: Chaos mode"},
      {"effect": "flash", "enabled": false, "title": "ChatSkins: Frame flash"},
      {"effect": "spotlight", "enabled": false, "title": "ChatSkins: Spotlight"}
    ]
  },
  "feedback": {"banner": true, "countdown": true},
  "reduceMotion": false,
  "panic": {"restore": "home", "latch": true}
}
```

| Path/type | Bounds and control |
| --- | --- |
| version integer | const 1 |
| enabled, all nested enabled, feedback flags, reduceMotion | booleans; labeled switches; master initially off |
| commands swap/vote permission and voterPermission | enum everyone/subs/vip/mods; three independent selects |
| commands.reset.permission | enum mods/broadcaster; separate safety select |
| commands and points cooldown numbers | integer global 0–600 s, per-user 0–3600 s; 0 means none; paired numeric fields with seconds |
| allowedSkinIds | 0–42 unique bundled catalog IDs, no custom/imported IDs in v1; checkbox gallery/search, Selected n; zero prevents enabling play |
| aliases | 0–42 entries, one per allowed ID, names array 0–8 unique normalized 1–24 char aliases; editable beside each selected skin |
| effects.swap.holdSeconds | integer 10–600 s; “Return home after” number field |
| rain.durationSeconds / flash.durationMs / spotlight.holdSeconds | constants 6 / 1800 / 10 in v1; read-only duration captions |
| chaos.intervalSeconds / durationSeconds | constants 8 / 40; read-only caption, independent opt-in toggle |
| vote durationSeconds / winnerSeconds / optionCount / tie | constants 45 / 120 / 3 / keep-home; read-only explanatory copy |
| points.rewards | exactly five unique effect enum entries swap/rain/chaos/flash/spotlight; enabled toggle and unique trimmed title 1–45 code points |
| panic.restore / latch | constants home / true; frozen runtime flag is separate, never imported |

Creation-only draft is outside this config: selected effect IDs, cost integer 1–1,000,000 per effect, prompt 0–200 code points, Twitch cooldown integer 60–604800 s and required-input flag. Defaults come from the reward table/prompts. Do not serialize creation requests or reward IDs into saved skins. Effective enable for a reward = master AND points AND mapping AND effect AND connection-ready AND not frozen. Vote also requires swap enabled; resetting remains available even if swap disabled. When creating Chaos explain “This reward stays disabled until you enable Chaos mode in Chat play and enable the reward in Twitch.”

The play source envelope must snapshot `{version:1, chatSettings:<complete home v3>, chatPlay:<above>, allowedSkins:[{id,name,settings,alertRecipe,channelPresentation,frameRecipe}]}` with complete normalized bundled recipes. Validate recipes as data, no executable CSS/SVG supplied by chat or imports. This preserves Round 6 full-snapshot links rather than catalog-ID-only restoration. IDs select within that snapshot. Size >16,000 characters keeps the existing length warning and credential-free JSON export; no external shortener. Builder must implement this envelope/codec before exporting it. No invented working URL appears in this specimen.

## Safety and source control

Master label **“Enable chat play”**, helper **“Viewers can change the look. Your messages, filters and saved skin stay yours.”** Panic label **“Panic: freeze skin”**, no confirmation; cancel everything, restore home immediately and latch frozen. Status **“Frozen on {home}. Commands and rewards are paused.”** Separate **“Resume chat play”** deliberately releases latch; resume starts home and admits only new events, preserving cooldowns. Chat continues rendering while frozen. No chat command can resume. This intentionally means freeze on the safe home look, not freeze a potentially unwelcome temporary look.

All viewer text uses text nodes; normalize controls/bidi controls and clamp lengths before measuring. No HTML, CSS, script, clickable URLs or arbitrary image fetches from messages. Allowed skin IDs are validated again at execution. Filters apply to spotlight and its text copy. Keep secrets out of config, samples, logs, copy text and exports. Channel point reward creation is the only explicitly requested write to Twitch; playback itself never posts, moderates, spends points on behalf of viewers or changes OBS scenes.

**Cross-source boundary:** a browser editor is not an OBS remote. Preview controls always say “Preview only”. For command-only use the credential-free chat source with the new envelope. For points, propose a **private combined chat + play Browser Source** replacing that ordinary chat source, reusing Round 7 auth and subscription logic in the same rendering context. Keep the separate alerts source if wanted; it is not expected to change another source's CSS. Do not rely on BroadcastChannel/localStorage shared between Chrome and OBS, or invent a working remote-control link. Two copies of a source may select different random candidates; v1 supports one active play source per channel, not synchronized multi-instance elections.

In OBS → source → Interact, **Ctrl+Shift+F** invokes freeze locally, **Ctrl+Shift+R** resumes; announce status only to accessibility APIs and show the restored look, never draw editor controls over the broadcast. Setup instructions expose both shortcuts plus “You can always hide this Browser Source in OBS.” On the editor show “This freezes your preview. To freeze OBS, use Interact → Ctrl+Shift+F.” A future remotely acknowledged control service is separate work, not implied by this button. Test shortcuts with OBS focus before release. Source reload preserves the local freeze latch where storage works.

Private play links use Round 7 fragment-only token transport, immediate fragment removal, no analytics/remote scripts, hourly token validation, revoke/expiry workflow and explicit private-copy warning. Remote images and custom CSS are disabled on this credential-bearing page; use bundled fonts/assets and a fixed allowlist for existing emote CDN image requests. Show before copy: “Channel points uses a private play link. Custom CSS and background images are not included.” This extends Round 7's token exception only to the new private play source; ordinary share/chat links remain credential-free. Keep full appearance values in the draft for returning to command-only use. Authentication and secure source architecture need builder verification; the mockup does not create links or connect.

Effective reduced motion = OS preference OR existing chat reduceMotion OR chatPlay.reduceMotion; no override of OS setting. Turning it on during rain removes moving particles immediately; during chaos stops cycling on the current allowed skin until its original deadline, then returns home. Disable all inherited ambient motion. Countdown/content remains visible. Website demos stop auto-looping and expose manual Next moment. No screen-reader announcement on each sample row or countdown tick; announce explicit tests, copy results and state changes politely.

## Editor UI and exact copy

Optional Chat play follows optional Alerts and precedes links; skip either independently without account gates. Title **“Give chat a turn.”** Helper **“Pick the looks. Set the limits. Let your viewers play.”** Two source sections: **“Chat commands — no login”** open by default; **“Channel points — optional”** closed. Display **“Home skin: {name} · your edited look”** above preview. Changing the allowlist or permissions cancels active preview play, preserving the last valid configuration and showing a status. Removing an allowed skin removes its aliases in one undoable transaction; never silently redirect them.

Controls: master; source enable; per-command enables and permission selects; independent “Who can vote?”; “Wait between viewers” and “Wait per viewer”; “Return home after”; allowed-skin search/checkboxes and alias rows; five effect switches with duration captions; reduced-motion switch; reward title matches, connection/creation/manual controls. Reset stays visibly a safety command. Fewer than three allowed shows the vote helper beside the disabled start command. Fewer than two disables Chaos. Master off keeps editing and **all preview tests** available. Test mode bypasses live enable and cooldowns but uses the selected appearance/motion; optional “Check permissions” uses simulated roles and demonstrates denials.

Preview toolbar: **“Preview only · simulate a viewer”**, sender name (default Moss), role (Everyone/Sub/VIP/Mod/Broadcaster), message field, **“Send sample command”**. Shortcuts **“Test !skin”**, **“Test !skinvote”**, **“Test !skinreset”**; effect buttons **“Swap skin”**, **“Emote rain”**, **“Frame flash”**, **“Spotlight”**, **“Chaos mode”**. Vote preview shows three numbered ballot buttons with “Simulate another viewer”; optional “Finish vote now” is explicitly a preview shortcut. Test action replaces an active test rather than failing behind a cooldown. Tests never enter OBS, consume points, save as live state or require login. Use full specified durations; only the public showcase is compressed and labeled.

Copy box **“Tell your chat”** with **“Copy chat instructions”** (manual selection fallback, honest success):

> Type !skin guild to change my chat! Try guild, rpg, pixel or signature. Each look lasts 60 seconds, then we go home. Type !skinvote to pick our next look together: vote 1, 2 or 3 within 45 seconds; the winner stays for 2 minutes. One event at a time. Skin commands have a 15-second shared cooldown and a 120-second cooldown per viewer. Mods can use !skinreset.

Generate from enabled commands, actual aliases, roles and cooldowns. Remove vote clause when unavailable. Restricted swap says “Subscribers can type…” / “VIPs can type…” / “Mods can type…” with “Mods and the broadcaster can always use eligible restricted commands.” When master is off prefix **“After you enable Chat play:”** outside the copied text. Do not auto-post it. Reward setup and copy operations stay explicit user actions.

Additional exact status copy: “Chat play is off. Try it in the preview.” / “Ready for the next viewer.” / “Back home in {m:ss}” / “Vote already running. Type 1, 2 or 3.” / “Wait {seconds}s before another skin command.” / “This command is for {role}.” / “That skin isn't allowed. Try {alias}.” / “Chat connection lost. Voting stopped; your home skin is back.” / “Channel points access ended. Reconnect and replace the private play link in OBS.” / “No rewards matched. Check the titles or create the rewards.” Diagnostics stay off stream except the intended credit, vote and countdown.

## Home and Skins showcase

Replace the home hero's arbitrary skin cycling with a single scripted **sample** exchange. On Skins put the same demo in a labeled “See chat take over” region above the gallery; it does not select cards or alter the inspector's chosen skin. Keep the 42-skin gallery and manual selection intact. In this deliverable both placements are reviewable at `chatplay-mockup.html#showcase`; no production home/skins code is built.

12 s illustrative loop: 0–2 s Signature conversation; 2–3 s Moss types `!skin guild`; 3–7 s crossfade to Guild, credit appears; 7–10 s chat reacts “we're a guild now”; 10–12 s restore Signature. Caption **“Sample interaction · timing shortened. Live swaps last 60 seconds.”** Keep the same messages through the change. Display **“Chat chooses. You stay in control.”** and **“Try a viewer command”** → Chat play editor preview. Only the visible placement runs; shared pause halts both; offscreen and hidden-document suspend; no network chat/provider requests. Reduced motion starts with a complete static scene and **“Next moment”**; manual stepping still shows cause and consequence. Provide a static before/after text alternative. No audio, automatic votes or rotating all 42 skins.

## Review and builder acceptance

The standalone mockup supplies functional **local simulations**, not a built feature: command/effect tests, skinned vote with simulated ballots, panic/resume, reduced motion, alias/allowlist editing, copy, reward review/manual instructions and both demo placements. Four skin treatments are approximations for design review; the builder must use the canonical renderer for all 42, including Round 7a channels. No OAuth requests, reward writes, IRC connections, production module imports or source URL generation.

Before implementation signoff verify: anonymous tag/identity availability; Everyone/Subs/VIP/Mods combinations and reset floor; alias collisions/malformed Unicode/HTML text; hidden-command processing; disallowed and empty lists; cooldown boundaries and replay; 0 votes/ties/changed votes/deleted voters; busy rewards and manual refund copy; expiry/reset/panic races; no stacked timers; short source/long text; preserved messages and full home snapshot; reload/freeze persistence; EventSub dedupe and title rename; read-only vs manage grants and partial creation; private link revocation and no credential leaks; OBS Interact shortcuts; no cross-window control claims. Codex should build against event/clock fixtures from these cases, then measure an hour-long OBS session. Verify keyboard, 320/390/768/1280/1920 widths, font failure, copy failure, black/white gameplay and reduced motion. Runtime quality and judging scores are not asserted by a design artifact.

---

Round 8 artifact checks: inline JavaScript syntax, unique static HTML IDs, default JSON parsing and all four allowed catalog IDs passed. All prior-round text is retained. Headless Chrome failed to launch with Windows access denied, so no successful browser screenshot, interaction or OBS verification is claimed. A temporary `design/.chatplay-chrome-review/` profile remains because cleanup was policy-blocked; it is not a deliverable. Git staging failed because `.git/index.lock` could not be created (permission denied); a path-limited commit also failed because the new mockup could not be staged.

# Round 7: Alerts

Design-only handoff, October 25, 2026. All changes are inside `design/`; Codex implements the application afterward. This round adds alerts to the current **42-skin** catalog, including Round 7a. It supersedes earlier “alerts out of scope” notes and the prohibition on tokens in **alerts** links only. Ordinary chat/share links remain credential-free. Round 6b supplies website styling; Round 6's Simple mappings, URL preservation and recovery rules still apply. Existing chat settings, preset IDs, gallery order and saved-skin schema are unchanged.

## Direction and review plan

**An achievement from the same world as your chat.** Reuse the chosen skin's actual frame, type and colors; never place a generic purple notification over a game-specific chat pane. The title identifies the world, the event label identifies what happened, the body thanks the person. Names and quantities remain readable before any ornament.

Website palette stays Void #101528, Deck #1B2640, Ink #F3F5FF, Signal #8CECE0, Gold #FFDA8A, Lilac #C7B5FF; Chakra Petch headings and Barlow controls. The four review worlds are Guild's forest/gold Lato pane, Retro RPG's blue/white VT323 dialog, Block Craft's moss/grass Pixelify Sans advancement and Signature's mint/violet Barlow card. Google Fonts with system fallbacks; original SVG/CSS marks only.

```text
1 Skin / 2 Customize / 3 Alerts (optional) / 4 Get your links
Controls                  Source preview
Connect + permissions     [top-center achievement]
Placement / audio         [existing chat at its saved position]
Types + message fields    Test type / Send test alert / queue status
                          Private alerts link + separate chat link

Card: [36px event icon] [world title / event label]
                       [name + milestone, wrapping]
                       [optional resub message or reward title]
```

Plan critique: changing only a generic card's accent would conceal the skins' character. Keep the full gold double ring, white dialog inset, pixel steps and Signature gradient ring distinct. Do not import achievement sounds, game badges, game fonts or game art. No confetti storm, auto-cycling atlas or background music. The review sheet renders 40 static specimens (10 variants × 4 skins) and one user-triggered test stage.

## Event model, scopes and honest labels

Use EventSub WebSockets with a **user** access token. Sign in as the broadcaster of the configured channel; this simplifies subscription and redemption ownership and prevents silently connecting a moderator's own channel. Validate identity against the selected broadcaster ID. Account mismatch: “You signed in as {account}. Alerts are set up for {channel}. Sign in as the channel owner or change the channel.” Channel changes discard pending events and disconnect old subscriptions before a new connection.

| Type / version | Display and normalized data | Required scope | Default hold |
| --- | --- | --- | ---: |
| `channel.follow` v2 | Follow; `{name}` from display name, fallback login. Condition broadcaster_user_id and moderator_user_id = authorized owner | `moderator:read:followers` | 5 s |
| `channel.subscribe` v1 | Subscription; `{name}`; tier `1000/2000/3000` → Tier 1 / Prime, Tier 2, Tier 3. Ignore `is_gift=true` here | `channel:read:subscriptions` | 7 s |
| `channel.subscription.message` v1 | Resub; `{months}` = cumulative_months, separate viewer message from message.text. This is a shared resub message, not every silent renewal | `channel:read:subscriptions` | 9 s |
| `channel.subscription.gift` v1 | Gift subscriptions; `{count}` = total for this event, not lifetime cumulative_total; one toast for the batch | `channel:read:subscriptions` | 8 s |
| `channel.raid` v1 | Incoming raid only (`to_broadcaster_user_id`); `{name}` = from_broadcaster_user_name, `{viewers}` = viewers | None additional | 9 s |
| `channel.cheer` v1 | Cheer; `{bits}` = bits, formatted with locale separators | `bits:read` | 6 s |
| `channel.channel_points_custom_reward_redemption.add` v1 | Optional custom reward redemption; `{name}` plus separate reward.title. No redemption management or fulfillment | `channel:read:redemptions` | 7 s |

All other broadcaster-scoped conditions use the authorized broadcaster ID. Connect requests the union of scopes for enabled types only, never posting, chat-reading or moderation-write scopes. Redemption starts off and requests its scope only when enabled. Raid-only still requires the user token for WebSocket setup but no extra permission. Turning on a missing scope shows “Reconnect to enable {type}”; turning off a type stops its subscription but does not falsely claim to revoke that scope. To remove previously granted permissions, revoke and reconnect with the smaller selection. Partial subscription failure shows per-type “Ready / Permission needed / Unavailable”; other ready types remain usable. No affiliate/partner capability is inferred from a successful login.

**Prime limitation:** the design includes Tier 1, Tier 2, Tier 3 and Prime specimens/test choices. EventSub subscribe data does not identify Prime separately from Tier 1. Live tier 1000 must say **“Tier 1 / Prime”**, not guess. An explicit Prime label is preview-only until the builder has a separately verified source; this release must not request extra scopes merely to infer it. Resub title is “Resubscription · 12 months”; tier is secondary when supplied. Anonymous gifts/cheers use “Anonymous supporter”, never a missing-name guess. Test data: Moss follow; Nova tiers; Moss 12 months + “A year of late-night adventures. Glad to be here!”; Juniper 5 gifts; NightCrew 128 viewers; PixelPilot 1,000 bits; Fern “Hydrate the party”.

Twitch references checked for this design: [subscription types and permissions](https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/), [WebSocket authorization](https://dev.twitch.tv/docs/eventsub/manage-subscriptions/), [Prime limitation](https://dev.twitch.tv/docs/pubsub/), [WebSocket handling](https://dev.twitch.tv/docs/eventsub/handling-websocket-events/). These are builder constraints, not a claim that authentication was implemented here.

## One recipe fed by every skin

Every `skins.json` record now has `alertRecipe`. Shared token binding, seven SVG paths, motion definitions, type durations and tone notes live in root `alertDesign`. These are design metadata, outside existing chat `settings`; an older renderer will not suddenly gain alerts. The builder must implement the contract and new serialization together. Do not run older generators over the catalog without retaining this new metadata; `round7-alerts.py` reapplies it deterministically.

1. Resolve the **current edited chat settings**, including typography inheritance, before drawing the alert. Bind frame to `frame`, silhouette/accents to `presentation`, body type/paint to `parts.messageText`, title type/name paint to `parts.name`, and surface to `backgrounds[frame.target]`. Canonical fields beat legacy aliases. `frame.target` chooses the source tokens; the alert always draws one card, not an entire chat panel. Built-in `frameRecipe`/`channelPresentation` metadata describes additional art direction; it is not executable CSS.
2. Reuse primary/outer rings, radii, bevels, ornaments and shape primitives. At 480 source px reserve 20 px padding, 36 px icon column, 16 px gap. Effective padding is max(20, source frame padding, ornament bounds); reserve outer frame outset separately. Guild retains exactly two 1 px gold rings, 2 px gap, 2 px inner radius/5 px outer radius. Retro retains two white full rings, not corner brackets. Pixel icons snap strokes to integer coordinates; pixel frame uses the existing two-step geometry. Signature keeps its mint/violet ring but no ambient flow during the alert.
3. Use the active surface's color/gradient and CSS recipe, but clamp final backing alpha to at least .94 (including color alpha). Ignore remote background images on the credential-bearing alert page; use their stored solid fallback. Never depend on blur across OBS sources. User `transparentBackground` and `hideFrames` remain explicit overrides of the backing/frame respectively; show “Check alert readability over your brightest gameplay.” Preserve all stored appearance values. Alert foreground, chip text and title are contrast-corrected to ≥4.5:1 on their own backing; add an opaque local text backing when transparency makes this impossible. A chip uses presentation.chipColor and readable dark/light ink, not dark name ink on a dark body. Check both black and white extremes, not a guessed gameplay color.
4. Title 16 px, event label 14 px, body clamp(20 px, resolved messageText size, 32 px), line-height max(1.35, resolved lineHeight). Resub/reward detail 20 px, up to three lines. Font family/weight follow resolved skin parts. Render names and quantities as text; no automatic all-caps names. The name shares the source name paint/chip treatment with contrast correction. This does not change chat typography itself.
5. Use shared original icons: four-point spark (follow), star (sub), return arc (resub), gift box (gift), banner (raid), faceted gem (cheer), ticket (redemption). No Twitch or game marks. 24-unit SVG viewBox, 1.75-unit outline, currentColor from contrast-safe frame accent; 36 px display. Pixel treatment quantizes the same silhouette to a 24×24 grid, square caps and stepped diagonals. Labels convey event meaning independently; SVG is aria-hidden.
6. Per-skin title, frame note, icon treatment, motion and oscillator wave are explicit in every `alertRecipe`, including all social-world additions. Custom skins copy the selected recipe as a starting point, with no hidden skin-ID rendering branch. Unknown/imported skins without a recipe use “Community update”, outline icons, 220 ms fade and sine sound while preserving their actual chat tokens.

Entrance presets: fade 220 ms opacity; slide 220 ms opacity + 12 px from the anchored edge (center uses above); pop 240 ms opacity + .96→1 scale; step 160 ms two-step opacity + 8 px from above. Exit is opacity only, 180 ms (step 160 ms). Hold begins **after entrance finishes**, using the event table, then exit, then 500 ms silence/gap. All text appears together. System reduced motion OR saved reduceMotion makes entry/exit immediate and disables decorative movement; hold time remains unchanged. Do not animate layout, blur, shadows, individual glyphs or continuously rotating icons. Hide offscreen/hidden editor samples; the live OBS source must keep receiving events while active.

## Layout, queue and sound

Default **top center** in a transparent full-canvas Browser Source (recommend 1280×720, matching the chat source). Other anchors: top left, top right, center, bottom left, bottom right. Width 480 px, adjustable 280–800; inset 36 px, adjustable 0–120. Clamp effective inset so at least 240 px remains when the source permits; width is min(requested width, available width minus inset/outset). At narrower sources use all available width with 8 px minimum internal padding. Height grows with wrapped text; expected 116–240 px, not a clipping box. Keep outer rings inside the source safe bounds. Placement changes do not move chat. Warn in editor when the alert rectangle overlaps the chat preview; offer another anchor, never silently reposition. The source page is otherwise transparent and pointer-events none; no debug status, test watermark or reconnect error leaks onto the stream.

Queue is one active card, **20 pending** by default (range 1–50), FIFO for all types, no interrupting a visible thank-you. Timestamp on arrival; drop pending entries older than 120 s (15–300). Before admission deduplicate EventSub metadata.message_id across types for 10 minutes, bounded to 10,000 IDs. For follows also deduplicate the same broadcaster/user ID pair for 30 s (5–120), even if transport IDs differ. Different followers stay distinct: rapid activity is not evidence of a duplicate. Gift `is_gift` subscriber events are suppressed; use one gift batch event. Do not add separate paid-sub notifications from chat messages. Shared resub messages map only to resub; no second generic toast.

On overflow discard the oldest **pending follow** first, then the oldest pending event if none are follows. Never evict the active card. Editor status: “Busy stream: {count} queued alerts skipped.” Keep skipped count session-only; no fake follower totals. Disconnect clears active/pending events and sound. After reconnect resume only newly delivered events; Twitch does not guarantee replay of downtime events. Across an EventSub session_reconnect, use Twitch's supplied reconnect URL and preserve the dedupe cache; on a fresh session establish the enabled subscriptions again. Retry transport failures with bounded exponential backoff (1, 2, 4, 8, then 30 s + jitter), but do not retry invalid credentials endlessly. Tests have a separate local queue, never enter the live OBS queue or alter account metrics. In the editor, sample mode and live mode never both own the same renderer.

Optional sound defaults **off**, volume 20% (0–100%, serialized 0–1). Only original WebAudio oscillators: sine for soft skins, triangle for guild/HUD/Signature, square for pixel worlds, as catalogued. Each type supplies 2–3 frequencies in `alertDesign.types.notesHz`. Each note 110 ms, gap 35 ms, 8 ms attack/75 ms release, max peak gain .08 × volume, one voice at a time. One motif per displayed card, never per gifted subscription, no sound on drop/dedupe/exit. Disconnect nodes at end; maximum motif under 0.5 s. No audio file URLs, uploads or third-party samples.

Audio unlock follows an explicit “Play alert sound” or test interaction. If autoplay is blocked, keep visual events and show editor helper “Sound is blocked. Allow audio, then test again.” Explain OBS: “Use Interact to enable sound if needed. Choose Control audio via OBS for mixing, then test your monitoring/output settings.” Do not claim the browser tab's audio settings configure OBS. Muting stops any current tone and preserves chosen volume. Reduced motion does not mute explicitly enabled sound. Test audio is clearly local preview audio.

## Settings schema and serialization

Root `alertDesign.settingsSchema` in `skins.json` is the machine-readable, closed schema; `alertDesign.defaults` is its full default instance. It is a new **alerts config v1**, not an alteration of chat v3 or an auth storage schema. Numeric bounds and all required fields are explicit. Unknown keys are dropped during normalization with editor notice; malformed/future alert versions disable live alerts and retain chat/sample editing. Missing alerts config migrates to defaults with enabled=false. Do not infer enabled=true just because a valid token exists.

| Field | Default / behavior |
| --- | --- |
| version / enabled | 1 / false; separate master Enable live alerts |
| position / widthPx / insetPx | top-center / 480 / 36; anchors and bounds above |
| queue | maxPending=20, maxAgeSeconds=120, followDedupeSeconds=30, gapMs=500; Advanced section |
| sound | enabled=false, volume=.2 |
| showViewerMessage / showRewardTitle | true / true; independent detail visibility, no `{message}` token interpolation |
| types | follow, sub, resub, giftSub, raid, cheer, redemption. Each has enabled, message, holdSeconds (3–20). All on except redemption; master remains off |

Default messages: “{name} joined the adventure!”, “{name} subscribed!”, “{name} is back for {months} months!”, “{name} gifted {count} subscriptions!”, “{name} arrived with {viewers} viewers!”, “{name} cheered {bits} bits!”, “{name} redeemed a channel reward!”. Retro follow recipe instead starts “A wild follower appears! {name} joined the party.” When first initializing a type's draft, use its recipe override, then the global default; keep user messages when switching skin. Reset message explicitly restores the current recipe default. Use singular grammar for count/month/viewer/bit=1 in built-in messages; user templates retain exactly what the author entered.

Template validation: 1–160 Unicode code points, at least one `{name}`. Allow only tokens relevant to that type, exactly as `alertDesign.templateTokens` lists: `{name}`, `{months}`, `{count}`, `{viewers}`, `{bits}`. Unknown/unmatched braces give inline “Use the tokens listed below this message.” Keep the last valid template for tests/export. Plain strings and expanded token values are text nodes, never HTML, JS, Markdown or nested template evaluation. Normalize control characters and bidi controls from event text; clamp display name to 50 graphemes with ellipsis, detail to 240 graphemes and three measured lines. Wrap names, URLs and long words; never shrink glyphs to fit. Viewer/reward text is a separate escaped field, no clickable links, images or emote/provider fetches in this first alert release. Missing optional detail omits its region entirely. Missing required numeric values reject that event with editor-only diagnostic; never show undefined/NaN.

New alerts link shape (example only): `alerts.html#v=1&config=<base64url-UTF8-JSON>&access_token=<percent-encoded-token>`. Config JSON is `{version:1,chatSettings:<complete normalized v3>,alerts:<complete alerts v1>,recipe:<complete selected alertRecipe>}`. Snapshotting the recipe and **full** edited chat settings preserves the look without a catalog lookup. Validate recipe enums/strings/bounds and discard unknowns; no arbitrary SVG paths, CSS or remote URLs from imported recipe data. Built-in icon names refer to a bundled trusted icon set. A new `alertsEnvelopeSchema` must be implemented alongside the codec; never insert credentials into `settingsSchema` or a saved skin. Custom CSS remains confined to chat; do not execute it or load remote images/scripts on the token-bearing alerts page. Show “Alerts match your saved skin controls; custom CSS and image backgrounds are not included.”

Non-secret alert config/recipe may be saved in a separate versioned editor preference/export envelope (`chat-studio.alerts.v1`); it must not be silently added to existing closed savedSkinSchema. Keep tokens, login identities, queue, tests and connection state out of exports, storage, undo history and chat/share URLs. Skin application preserves enabled types, messages, duration, position, queue and audio preferences, but replaces the recipe and recomputes bound appearance; preview confirms the change. Changing appearance after copying says “Your look changed. Copy new chat and alerts links into OBS.” Existing pasted links are immutable snapshots. Reuse the >16,000-character length notice with **credential-free** JSON settings export; never offer to export a token as a backup.

## Editor and exact copy

Add the optional **Alerts** step between Customize and Get your links (step 4). Keep six Simple appearance controls unchanged. Both Simple and Advanced can reach Alerts. “Skip alerts” goes directly to links; no login gate for chat. Deep links and Back preserve drafts. Alerts heading: **“Celebrate in your chat’s style.”** Helper: **“Test every alert for free. Connect Twitch when you’re ready to receive real events.”** Master: **“Enable live alerts”**. Connection action: **“Connect alerts”**. Never reuse optional identity-only chat login as implicit consent to these scopes.

Within Alerts: connection/permission state, Matches {skin} label, anchor selector and size/inset, sound toggle and volume, then seven type disclosures. Each type has Enabled, Message, token buttons that insert at caret, rendered sample, Display for (seconds) and **Send test alert**. Sub disclosure additionally offers Tier 1 / Tier 2 / Tier 3 / Prime test choices; follow the live limitation notice above. Resub has Show subscriber message; redemption has Show reward title. Tests work when disconnected, live master/type toggles are off, or the streamer is offline; say “Test only · not sent to OBS”. A global test selector exposes all ten variants. Preview queue count plus Clear tests are visible, no automatic test loop. Production toggles/messages bind to the config; the design sheet labels its unbound form controls as specimens.

Connect screen lists ordinary permission explanations plus expandable exact scope names. Primary: “Continue to Twitch”; helper: “Sign in on Twitch. ChatSkins never asks for your Twitch password.” Cancellation: “Connection cancelled. Your settings and test alerts are still here.” Misconfiguration: “Alerts sign-in is unavailable. You can still design and test.” Successful login alone says “Authorized as {account}”; **“Alerts connected”** is shown only when the WebSocket and the enabled event subscriptions are ready. Pending: “Connecting alerts…”; network failure: “Alerts connection lost. Retrying… Your chat still works.” Revocation/401: “Twitch access ended. Reconnect alerts, then replace the alerts link in OBS.” Grant denied: “Permission for {type} was not granted. Reconnect to enable it.” Use adjacent actionable text, not color alone.

Get your links has two distinct sections/actions: **Copy chat link** (existing credential-free overlay) and **Copy alerts link** (private, only after valid matching authorization and live enabled). Primary security warning directly above alerts action: **“Treat this link like a password. Anyone with it can use your alert permissions. Paste it only into your own OBS Browser Source. Do not share it or show it on stream.”** Technical helper: **“The token stays in the URL fragment, so website requests do not include it. Your browser sends it directly to Twitch to connect alerts.”** Copy success only after clipboard resolution: “Private alerts link copied. Paste it into a separate OBS Browser Source.” Clipboard failure: “Couldn’t copy. Reveal the private link to copy it manually.” Reveal is explicit, masked again on blur; never put the full token in an accessible status message. There is no public share button for alerts. Chat copy cannot accidentally reuse the alerts URL.

Link section OBS instructions: add a second Browser Source named “ChatSkins alerts”, paste the private link, use the same canvas size as chat, place above gameplay, and test live delivery separately. The editor's offline tests do not prove EventSub connection or reach OBS. Do not add the same live alert source twice; duplicated independent sources can both show events. Use an existing OBS source reference if reusing it across scenes. A clean alerts source stays blank until a real event. Diagnostics are available only in the editor or OBS Interact, with a deliberate control that never exposes the token.

## Security, expiry and reconnect

Clarification of “never sent to any server”: URL fragments are not included in the page HTTP request or Referer. The **website/backend never receives the token**. Authentication necessarily sends it directly to Twitch's HTTPS API/OAuth endpoints, so an absolute “no server ever sees it” promise would be false. WebSocket setup/subscription requests follow Twitch's documented authorization, not query-string credentials on arbitrary endpoints. No proxy, shortener, analytics, third-party scripts or token-bearing error-report URLs. Redact fragments and Authorization headers from diagnostics; do not print even an example real token.

Use Twitch's supported browser implicit authorization flow for this static design, with registered redirect URI, random single-use state and strict state verification. No client secret in frontend. Keep the token in memory after callback, clear the callback fragment via history.replaceState immediately after validation, retain only a non-secret return draft. Reject mismatched state/client/user/scopes before copying. Do not persist access in localStorage, sessionStorage, IndexedDB, profiles or JSON; only the deliberately copied private OBS URL carries it persistently. Remove the fragment from the running source's browser history after parsing too; OBS's stored source URL remains the user's credential-bearing configuration. Browser history/clipboard/OBS scene collections and backups may expose the original URL, which is why the warning is necessary.

Validate on startup and hourly, and handle 401/revocation immediately. Show “Access expires {local date and time}” from Twitch's validated expires_in, plus “Twitch may end access sooner.” If expiry is unknown, say so; never promise 30/60 days. This implicit flow has no refresh token. At expiry disable live copy/status, clear credentials/queue and silence alerts; keep styles and offline tests. **Reconnect alerts** reopens Twitch consent, validates account/scopes, establishes readiness, then prompts **“Copy your new alerts link and replace the URL in OBS.”** Old copied URLs do not update themselves. An editor cannot silently recover the token from an existing OBS source; reopening the editor requires reconnect for live controls.

**Disconnect/revoke** stops local EventSub/audio, clears pending events, attempts Twitch token revocation directly, and clears in-memory credentials regardless of response. Success: “Alerts disconnected and access revoked. Old alerts links no longer work. Your chat link still works.” Failed/offline revoke: **“Disconnected here. Twitch access could not be revoked; old links may still work. Retry revocation or remove ChatSkins in Twitch Connections.”** Keep an explicit reconnect-and-revoke path if the token has already been cleared, and link [Twitch Connections](https://www.twitch.tv/settings/connections). Never label local deletion as confirmed revocation. After exposure, revoke before reconnecting; every old OBS source must be replaced. No server-side refresh flow or token vault is implied.

References: [token validation and expiry](https://dev.twitch.tv/docs/authentication/validate-tokens/), [OAuth flow](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/), [implicit flow reauthorization](https://blog.twitch.tv/en/2019/11/06/twitch-authentication-understanding-which-protocol-and-flow-is-right-for-you/), [token revocation](https://dev.twitch.tv/docs/authentication/revoke-tokens/). Builder must verify browser CORS, configured redirect and OBS WebAudio behavior before shipping.

## Access and builder acceptance

Keep Round 6b focus/contrast, 48 px control targets, keyboard and 320 px reflow rules. Position is a labeled native select or radio group, never drag-only. Volume has a visible percent. Announce user test/copy/connection results politely, not every fake chat row. Atlas samples are ordinary content, not live regions. On the live source expose one complete textual alert for accessibility without duplicating decorative icons. Reduced motion never hides the information. Long names, 1 and large counts, emoji, font failure, multiline messages, anonymous gifts and missing detail must stay readable.

Builder checks before contest submission:

- All 42 recipes resolve from edited chat tokens; applying a different skin preserves alert preferences. Full config/recipe URL round-trips, legacy chat URLs are unchanged, no secrets enter exports or chat links.
- Ten offline test variants work with no OAuth, including disabled live types and optional redemption. Prime tests are explicitly labeled; real tier 1000 is not falsely identified. Test notifications never reach the live queue.
- One active card, max pending bound, TTL, overflow count, message-ID replay suppression, same-user rapid follows, distinct rapid followers and gift batch suppression work across reconnect. No invented downtime replay.
- Test authorization cancellation, wrong account/state, missing scope, ineligible subscriptions, partial subscription errors, expiry, 401, successful/failed revocation and replaced OBS URL. Verify website network logs, diagnostics and sharing never contain the token.
- Check every anchor at 320/390/768/1280/1920 widths, maximum content, 200% text/400% zoom, black/white and busy gameplay, 100% source-scale frame geometry and reduced motion. Test muted/autoplay-blocked audio and OBS mixing. No warning, control or credential reaches the stream.

Artifacts: `alerts-mockup.html` standalone review; `alerts-template.html` editable source; `round7-alerts.py` regenerates mockup and catalog alert metadata. This is not a working EventSub integration. Static checks cover schema/default validity, 42 recipe coverage, 40 specimens, preserved chat settings and script syntax. Browser/OBS acceptance remains builder work unless separately recorded.

---

# Round 7a: Social worlds and the Signature showcase

Design-only additions inside `design/`; no application build. This section overrides roster counts, Featured order and the upgraded Old-School preset below. There are now **42 skins**: 12 Streamer favorites, 24 Game styles, 4 Colorful, 2 Animated. **ChatSkins Signature is first Featured**, followed by the six previous Featured entries. All nine round entries belong to Game styles; Signature is explicitly a brand original. `old-school-mmo` keeps its stable ID and is renamed Old-School Realm, avoiding duplicate presets or broken saved links.

## Art direction and review plan

Brand tokens: Navy #101528, Mint #7EEAD6, Violet #B7AAFF, White #F3F5FF, Gold #FFDA8A. Chakra Petch supplies compact name chips and headings; Barlow carries Signature messages. Crystal and Hero use Lora, Old-School uses Bree Serif (a sturdy serif approximation, not a proprietary pixel face), Frontier uses Lato, Arena uses Barlow Condensed, Tactical uses IBM Plex Mono, Block uses Pixelify Sans, Space uses Nunito Sans. All fonts are Google Fonts with system fallbacks; frames and badges are original CSS/SVG geometry.

Layout: full-width Signature specimen first, followed by a two-column, left-aligned atlas of eight game styles; one column below 760 px. Each specimen shows every channel, four stat bars with visible n/5, one-line design note and expandable frame/treatment recipes. `mockup.html#round7a` and `skins-mockup.html#round7a` contain the atlas. The gallery and home cycle consume the same generated specimen data. Stat bars describe style, not measured performance or accessibility certification.

Plan critique: nine identical colored panels would conceal the social behavior the owner liked. Distinguish each by the conversation grammar and construction: silver inset window, brown stone ledger, parchment margin, slanted gold plate, minimal comms strip, square server rows, role-icon party rail, white meeting bubbles. Reserve the flowing gradient for Signature. Keep copy upright even when a frame slants.

## Channel contract (5e-compatible)

The supplied catalog already contains Guild Chat `settings.channels`; the supplied prior document has no Round 5e section. Preserve its exact object and rule fields: `{enabled,rules:[{enabled,match,format,textColor,nameColor,italic}]}`. Declare that existing object in both settings schemas, where it was missing. Do not add effect fields to individual rules. Per-skin `channelPresentation` and `frameRecipe` are design metadata specifying builder treatments; they are not a working runtime implementation or automatically serialized settings. A builder must implement/serialize those treatments before claiming export parity.

Evaluate enabled rules in listed order, first match wins, except `firstTime`, which is evaluated independently from the role/message channel. `everyone` is the final ordinary fallback. Roles use Twitch tags, not name guesses. `allCaps` means at least four Unicode cased letters, all uppercase; ignore uncased letters, numbers, URLs and resolved emotes. `action` means parsed /me action metadata, not literal text beginning with those characters. `mentionsChannel` matches the joined login case-insensitively as a complete @mention or word, not substrings. Mentions are visual Tell/Whisper analogies, **never private messages**. Channel fields are literal text with one `{name}` and one `{message}`, except a supplemental arrival line may omit `{message}`. Render escaped text nodes and resolved emote tokens, never user HTML.

Broadcaster/mod roles precede shout/action/mention in Crystal; those message channels precede VIP/sub. Frontier maps broadcaster and mod to Squad, VIP to Party, sub to Guild, mentions to Whisper and everyone to Map. Arena maps broadcaster/mod/VIP/sub to Team and everyone to All. Hero maps leader/guard/striker/support/party to broadcaster/mod/VIP/sub/everyone. Tactical admin wins over subscriber team; ordinary non-subs use orange. All rules and exact colors/formats are in `skins.json` and every rule is represented in the atlas.

First-time handling uses the platform first-message flag; do not infer from a fresh browser session. Block emits one yellow arrival notice **and** the original role-formatted message. Tactical adds `*NEW*` to the original role line. Signature adds a sparkle NEW tag to the original line. Deduplicate by message ID; a reconnect/replay is not another arrival. The atlas shows first-time treatment separately for inspection; production composes it as specified. Emote-only classification is orthogonal, so role and first-message decorations survive.

## Signature production recipe

Use a 94% navy panel, 2 px mint/violet gradient ring, 12 px radius, static 3%-opacity scanlines behind text and a restrained inset highlight. Body: Barlow 22/31.9 px, white with 1 px navy outline. Name: Chakra Petch 22 px inside a Twitch-color chip with static 4 px soft glow. Choose navy or white chip text by the greater computed WCAG contrast; minimally adjust chip luminance if needed to reach 4.5:1. Default missing Twitch color is mint. Test the composite against black and white extremes; the default backing remains present without blur. User transparency overrides require renewed contrast evaluation. No gameplay sampling or per-frame contrast calculation.

Original SVG role badges: crown for broadcaster, sword for mod, gem for VIP, star for sub; strongest role wins. Pair icons with accessible role labels. HOST tag and one 600 ms gold border accent for broadcaster; mint MOD tag; NEW sparkle and one 800 ms shimmer for first messages. Mentions add a 3 px violet leading rail independently of role. /me body is violet italic independently of role. Emote-only messages use 2× inline emotes, capped at 56 px, with alt-text fallback.

Entrance: 260 ms ease-out, translateY(10px) + scale(.96) + opacity(0) to identity/1. Exit: 320 ms opacity fade, preserving row height until removal. Gradient border flows over 12 seconds. Production should translate a gradient layer inside a fixed border mask; the static design specimen approximates this with background-position keyframes. No animation of blur, glow radius, text outline, layout dimensions or per-character spans. Maximum one ambient loop for the selected/hero specimen; idle gallery thumbnails remain static. Pause offscreen/hidden previews in production. System OR user reduced motion disables all movement, shimmer, flash, wave and auto-cycle; retain static colors, tags, borders and content. Old-School flash is a single 2.4-second gentle hue cycle, never an opacity strobe; wave is one 1.2-second 2 px body movement.

## Handoff and checks

`round7a.py` regenerates full presets, the compact review catalog and both sample sections; `round7a.css` contains the visual study. Full canonical settings are present for every record, with unsupported bespoke treatments explicitly described in metadata instead of invented channel fields. CSS/SVG specimens approximate the production frame recipes; parchment teeth and the final masked-gradient renderer remain builder work. Review every overlapping role/message case, long names, emote fallbacks, first-message replay, reduced motion, 320 px width and white/black gameplay at actual source scale before shipping. No application build or runtime performance claim is part of this round.

# Round 6b: Game-menu website

This round supersedes Round 6 website composition, tokens and navigation. **The site is a game menu; the product is still a simple Twitch chat overlay generator.** This package is design-only, entirely inside `design/`. Round 6's six-control mapping, full-settings URL serialization, legacy hash migration, preservation rules and Advanced inventory remain authoritative. Round 5's 34 skin settings are unchanged. New `stats` are catalog metadata outside `settings`, never serialized into overlay URLs.

## Direction: the chat cartridge

The folded speech-card mark becomes a glowing title emblem; chat specimens become selectable characters; the editor becomes a stream-monitor loadout; requests become quests. The signature is **folded conversation cards, sea-glass light and a gold diamond selector**. Original CSS/SVG geometry, Google Fonts, no borrowed game UI, logo, font, art or sound sample. No fake XP, rarity, popularity, loading delay or locked content.

Plan critique: a neon hero on a conventional marketing layout would repeat the generic SaaS problem. Replace it with an actual title/menu composition and a separate character-select roster. Keep ordinary labels in forms; spend visual personality on the title, selection states and monitor silhouette. Research input `../research/TOP-CHAT-UIS.md` prioritizes presets, realistic preview, readable chat, community emotes and one OBS link. The direct-use flow preserves those priorities. Research is supplied context, not freshly verified evidence.

```text
HOME                              SKINS
shared top bar                    shared top bar
logo / PRESS START | HUD chat      group buttons / portraits | large sample
vertical menu      | skin cycle    arrows / hover select     | stats / actions
3 steps / features / FAQ

EDITOR                            REQUEST
1 Skin / 2 Customize / 3 Link      invitation | quest form
6 controls | monitor | Get link    Discord    | Post quest / inline result
Advanced   | backdrop choices
```

## Shared identity and tokens

All four new pages load **`game-tokens.css`**, the sole new website token source, and `game-menu.css` for shared components. Historical Round 6 sheets retain their historical CSS; never load both shells in production. Core palette: Void #101528, Deck #1B2640, Ink #F3F5FF, Signal #8CECE0, Gold #FFDA8A, Lilac #C7B5FF. Functional muted text #B9C8DF; control boundary #8599B7. Use Void text on pastel buttons. Signal marks location; Gold marks selected item/primary action, reinforced by diamond, underline or text.

**Chakra Petch 500/600/700** for title/navigation/action labels; **Barlow 400/500/600/700** for body/forms. Google Fonts stylesheet links, display=swap, sans-serif fallback; production subset actual weights. Skin fonts stay independent. Hero 46–90 px, page title 36–64, section 30, body 17/25.5, helper 14/21. Spacing 4/8/12/16/24/32/48/64 px. Content ≤1400 px, desktop gutters 32 px, phone 16 px. Controls ≥48 px, 6 px radius. Monitors have rounded top bezels, squared lower edges and a small signal strip. Do not clip focus rings for decorative corners.

Reuse `chatskins-mark.svg` with a new large HTML wordmark in Chakra Petch, static sea-glass glow and offset shadow. The old Fredoka `chatskins-wordmark.svg` remains historical; the new shell does not use it. Preserve brand clear space and accessible name. No scanlines across text or moving glow filters.

| Public route | Review file | Purpose |
| --- | --- | --- |
| `/` | `home-mockup.html` | Title screen |
| `/skins.html` | `skins-mockup.html` | Character select |
| `/editor.html?skin=<id>` | `editor-mockup.html?skin=<id>` | Loadout |
| `/request.html` | `request-mockup.html` | Quest board |

Every page: brand → Home; **Home / Skins / Customize / Request**; Pause motion. Current page uses underline and aria-current. On phones nav wraps to a full-width second row, keeping all destinations visible. Request nav goes to its page; “Request a skin” buttons open the same form as a modal from Home, Skins or Editor. Production uses one reusable form component; the review uses an iframe of the request page. Skip link, main landmark, one h1 and footer are required. Footer: “Built with OpenAI Codex for the Codex x TwitchCon Hackathon”, [GitHub](https://github.com/Korivash/chatskins), “© Korivash”.

Legacy root settings hashes redirect intact to editor. Skin query opens Step 2. Production editor with no query uses catalog default Clean; the review starts with Bubble Lift to compare with Round 6. Unknown ID displays “That skin isn’t available. Pick another starting point.” with Skins link. Browser Back preserves edits, channel and selection. UI mode, group, stats and preview background are not overlay settings.

## Home: title screen

Equal desktop split: ChatSkins emblem, “Your Twitch chat. Ready to play.”, “Free chat skins. One link for OBS. No login needed.” and vertical menu at left; framed sample HUD at right. **PRESS START** is a real link to Skins, slow 1.6-second stepped opacity pulse, never fully invisible. No boot gate. Click/Enter activate; Space on this link also activates. On an otherwise unfocused page Enter/Space starts. Never hijack keys inside inputs, dialogs or other controls.

Menu: **Start / Customize / Request a skin / How to use in OBS / About**. Up/down moves focus and Gold diamond; Enter activates focused item. Mouse hover moves selector without stealing focus. Tab navigation remains normal. Space retains native button behavior, except explicit PRESS START support. OBS and About are same-page anchors. No global arrow handlers on other pages.

Attract background: two radial-gradient star layers drifting over 70 seconds; perspective grid fading into Void. CSS only; decorative layers aria-hidden and pointer-events:none. No canvas, video or per-frame JavaScript. Motion can be paused with the motion control. Audio is not part of this website.

HUD explicitly labels Sample chat. Cycle **Bubble Lift → Glass Card → Name Tag → Comic Burst → Pastel Pop → Esports Slash**, six seconds each, with name and count synchronized. Previous/Next work when paused or reduced. Pause freezes stars, prompt blink, arrivals and cycle. System reduced motion removes movement and auto-rotation; Resume cannot override it. Keep one complete sample visible. Actual production samples use the shared renderer, not the mockup's approximations.

Below fold: only three setup steps, flat feature checklist, six native FAQ disclosures and footer, as in mockup. No second gallery or conversion-banner stack. Features remain contingent on Round 6 builder verification, not claims of measured performance.

## Skins: character select

Four group controls: **Streamer favorites / Game styles / Animated / Colorful**, counts 12/16/2/4. Preserve catalog order and six Featured first. These are a labeled button group, not falsely declared ARIA tabs. Selection uses Gold border, diamond, “Selected” and aria-pressed. Each portrait has two live-style miniature rows and full skin name. Sample rows aria-hidden; accessible button name is skin name. Static idle samples; replay arrival on hover/focus; production updates only visible active previews. No 34-card animation storm.

Desktop: three portrait columns and 400–520 px side panel; medium two columns. Phone: selected preview first, roster below, two columns only while names remain readable. Hover/focus/tap selects, never opens a dialog. Left/right moves one portrait, up/down one visual row, Home/End first/last visible. Compute row length from current layout. Production uses a roving tab stop; review keeps all cards tabbable for inspection. Group change restores its last selection or selects first. Announce count, not fake messages.

Side panel: live sample, name, description, four segmented stat bars with visible n/5. **Use this skin** is primary; **Customize** links to editor with that skin. No editor is required to use a premade skin.

Use opens a native dialog with two steps:

1. **Your channel**: Twitch name field, optional Connect with Twitch. Manual path always visible. Trim whitespace, remove one @/# prefix, lowercase, validate 1–25 ASCII letters/digits/underscores. Syntax readiness is not account verification. Invalid input stays inline/focused. Cancelled/unavailable OAuth returns to manual entry without losing skin. Minimum identity permission only; no tokens in overlay links.
2. **Copy into OBS**: full selectable canonical settings URL, Copy OBS link, actual clipboard success or “Copy this URL manually.” OBS instructions: Sources → + → Browser, 1280 × 720, above game capture. Back retains name. Close/Escape retains draft and restores opener focus; background inert and focus contained. Regenerate from edited settings if entered from Editor. Changed looks need a new copied link.

Review uses explicitly labeled `example.invalid` links and no OAuth; builder must implement real serialization. No misleading working-link claim in the study.

### Style stats

Each of 34 records has `stats: {readability, flair, motion, retro}` with integer 1–5 values. They are art-directed descriptors, **not benchmark, popularity or accessibility scores**. Render from catalog, outside settings; do not infer from category. Readability: 1 ornamental → 5 clear reading hierarchy; Flair: 1 minimal → 5 expressive; Motion: 1 still, 2 gentle arrival, 3 pronounced arrival, 4 sustained decoration, 5 dominant kinetic identity; Retro: 1 contemporary → 5 old dialogue/terminal/pixel styling. Current defaults only need Motion 1–3. Terminal remains 1 despite Animated category. High Motion is not “better”; Readability 5 does not certify contrast over arbitrary gameplay. `game-catalog.js` is a generated review subset, not another source of truth.

## Editor: loadout

Retain **1 Skin / 2 Customize / 3 Get your link**, with Step 1 going to separate Skins page. Desktop: 300 px controls, central monitor, 230 px deployment rail. Medium: deployment below. Phone: preview, controls, link action in document order. Step 3 remains visible in navigation and emphasized in deployment; saving or Advanced is never required.

Exactly six Simple appearance controls: **Font; Text size; Accent color; Background; Frame; Entrance animation**. Advanced editor is a separate switch. Native select/range/numeric/color/checkbox behavior; text size has editable px value, color has hex value. Background Solid/Glass/Transparent; entrance None/Fade/Slide/Pop. **Use the unchanged Round 6 Simple mapping below**, including mixed/custom values, alpha preservation, readable-name correction, one-step undo and no mutation on mode change. Mockup bindings demonstrate appearance only, not canonical setting writes.

Advanced includes the actual complete prior field inventory, restyled into the loadout rail, with collapsed sections. Preserve production search, per-section reset, Undo/Redo, imports/exports, My skins, Custom CSS and Round 3/5 dependencies. `editor-round6-reference.html` retains the full prior sheet for comparison. Advanced fields in the new study are visual specimens, not working settings bindings. Production preview uses the shared renderer and true source scale/5% safe area from Round 6; study enlarges chat for visual review. Default Stream; Dark/Light/Checker options. Preview backdrop is never exported. Keep all Round 6 connectivity, font, clipboard and provider recovery states.

## Request: quest board

Title “The next skin starts with you.” Gold-edged posting sheet, original diamond seal, ordinary labels. **Post quest** is the action. Colors offers free text plus two pickers; picker changes write two hex values, while free text may describe a palette. Optional contact information is visibly described as shared with the team. Requests are ideas, not guaranteed commissions. Small [Or join us on Discord](https://discord.gg/YxFRuEPSxZ) link remains available.

| JSON key | Label | Maximum | Required |
| --- | --- | ---: | --- |
| name | Skin name idea | 60 | yes |
| inspired | Inspired by (game/style) | 80 | yes |
| colors | Colors | 80 | yes |
| font | Font vibe | 60 | no |
| frame | Frame idea | 120 | no |
| description | Description | 800 | yes |
| channel | Twitch channel (optional) | 25 | no |
| discord | Discord name (optional) | 40 | no |
| website | Honeypot | 200 | must be empty |

Required-fields helper lists name, inspiration, colors, description. Optional fields default to empty. Trim, validate types, count Unicode code points server-side; client maxlength is only an early guard. Nonempty channel uses the same name syntax above. Field errors use aria-invalid/aria-describedby and focused summary. Retain drafts on 400/429/offline/delivery failure and modal reopening; no automatic persistent storage of contact information on shared devices.

Pending: “Posting your quest…” with repeat submission disabled. Success only after backend confirmation: **“Quest posted! The guild has been notified.”** Offer Post another quest. Error: “Your quest couldn’t be delivered. Your draft is still here. Try again.” Rate limit: “Quest board is busy. Try again in {time}. Your draft is safe.” The mockup outcome selector demonstrates success, field error, rate limit and delivery failure; it must not ship.

### Backend specification: POST /api/skin-request

Design contract only; no backend is built in this round. Same-origin application/json body:

```json
{"name":"Lunar tavern","inspired":"Cozy space fantasy","colors":"#8CECE0, #C7B5FF","font":"Soft and readable","frame":"A small brass window","description":"Moonlit chat for late-night streams.","channel":"cozy_channel","discord":"","website":""}
```

- Limit body to 8 KiB before parsing. Malformed JSON, arrays, unknown fields, non-string values, missing required values and values beyond the table limits return 400 field errors. Do not silently truncate. Plain text only, never execute HTML/CSS. Validate before forwarding; required strings empty after sanitation are invalid.
- Honeypot website is visually offscreen, tabindex=-1, aria-hidden. Nonempty gets generic 400 form error, never forwarded.
- **3 accepted requests per IP per rolling hour and 50 accepted requests per rolling 24 hours globally.** Atomic shared persistent counters across instances; reserve quota before delivery, release on definite failure, count successful submissions. Concurrent requests must not exceed either bound. Transport abuse protection may additionally limit invalid attempts.
- Resolve IP through trusted deployment proxy configuration, never arbitrary X-Forwarded-For. Store keyed IP hashes with TTL, not raw IPs in Discord. Return Retry-After seconds from the later applicable reset. Global exhaustion does not disclose submitter information.
- Forward one Discord webhook embed titled “New skin quest”, description and labeled fields, server timestamp, optional fields omitted when empty. **DISCORD_SKIN_REQUEST_WEBHOOK_URL stays server-side only**: never bundled in client code, URLs, logs, source maps or responses. Fixed configured destination, never user supplied. No IPs, cookies or tokens in embeds.
- Sanitize every field: strip case-insensitive @everyone, @here and all `<@...>` mention tokens (including user/role forms), plus `<#...>` channel mentions and control characters. Escape Discord markdown. Send `allowed_mentions: {parse:[], users:[], roles:[], replied_user:false}` as defense in depth. Validate original lengths, reject required values emptied by sanitation.
- Links stay unembedded: plain text inside embed fields only, no webhook content, markdown hyperlinks, embed url, image or thumbnail properties. Escape markdown-link syntax and wrap literal http(s) URLs in angle brackets to suppress previews. Never fetch submitted links. Verify raw URLs/markdown links/mentions against actual Discord output when implementing.
- Bound webhook timeout to 5 seconds. Return 200 only after Discord confirms delivery. Return generic 503 on delivery failure; do not expose webhook details. On timeout/uncertain delivery, do not blindly retry: use submission ID and dedupe record. Optional Idempotency-Key header per attempt permits exact-body retry without duplicate notifications or quota consumption; reject different body for the same key. Builder must verify current Discord embed limits and suppression behavior.
- Same-origin use only, verify Origin when present, no wildcard CORS. No login required. No-store responses. Missing server configuration is a delivery failure, never success.

```text
200 {"ok":true}
400 {"ok":false,"errors":{"description":"Use 800 characters or fewer."}}
429 {"ok":false,"error":"rate_limited","retryAfter":2520}
    Retry-After: 2520
503 {"ok":false,"error":"delivery_failed"}
```

Errors may use any field key or form for invalid payload/honeypot. 503 adds the necessary operational failure state. Test quotas at boundaries and concurrently, spoofed proxy headers, Unicode limits, mentions, links, failed/timeout webhook and duplicate retry before release.

## Access, motion, performance and review boundary

AA targets: body/helper ≥4.5:1, large text and essential boundaries/focus ≥3:1. Gold focus ring 3 px, offset 4 px. Verify computed contrast for hover/selected/error and skin composites. Arbitrary custom overlays are not automatically AA. No information relies only on color, animation or hover. Visible numbers on stats; native dialog focus/Escape/close/restore; status announcements for user actions, never sample chat. Test 200% text and 400% zoom.

Reduced motion removes stars, blinking, arrivals, auto-rotation, animated effects and transitions; manual selection still works. Resume never overrides OS preference. Production pauses offscreen/hidden-tab previews and limits live miniatures. No per-frame JS or image/video background; local sample text makes no Twitch/emote requests. Production budgets: ≤100 KB gzip initial shell code, ≤150 KB brand fonts; lazy-load catalog/editor and skin fonts. The study includes full Advanced for inspection, not production payload architecture.

Review at 320/390/768/1280/1440/1920 widths and 1280×720 height, touch, keyboard, font failure, blocked clipboard, muted audio and reduced motion. All destinations/actions must remain reachable, with no page overflow. Judge path: Press Start → arrow to Comic Burst → see preview/stats → Use this skin → channel → real copied OBS link, without Editor. Then six-control edit, Advanced edit and quest success/error. Verify actual OBS output and retained Round 6 URL/emote/migration behavior.

Deliverables: four new/updated mockups; shared game-tokens.css, game-menu.css and game-menu.js; generated game-catalog.js; reproducible round6b.py; retained editor-round6-reference.html. Open locally or serve design/. Navigation, selection, sample cycling, illustrative edits, example-copy modal and simulated quest outcomes are reviewable. No real sign-in, request delivery, state engine or overlay serialization. Advanced and entrance choices are visual specimens; final bindings use the existing renderer.

Browser capture was attempted with installed Chrome but failed with sandbox access denied. Responsive rendering and visual/focus behavior remain unverified here; do not describe them as browser-tested. Static validation covers catalog preservation, all stats, local references, unique IDs, JavaScript syntax and core shell contrast. No production files changed.

---

# Round 6: Website

This is the website design handoff for getchatskins.com, not an application build. Round 6 supersedes earlier website composition, UI tokens, initial preview background and onboarding rules. Round 5 remains authoritative for the 34 skin recipes, Featured order, renderer geometry, schema, emotes and preservation rules; Round 3 still supplies the full per-part editor contract. All earlier rounds remain below. No application files or preset settings are changed by this round.

## Direction and first-minute journey

**A wardrobe for your chat, with the stream as the fitting room.** The existing developer-facing rail becomes a simple guided experience. The distinctive visual is actual chat layered over an original illustrated exploration scene: blue mountains, a path and a distant gateway, all SVG geometry. No game art, game marks or video. Headlines are round and self-assured; controls are quiet and clearly labeled. The accent is soft periwinkle, not Twitch purple. Individual skins keep their own palettes.

Design-plan critique: a dashboard with a promotional banner would still feel like a developer tool. Replace that layout with an editorial hero plus large live specimens. Avoid a feature-card wall: use a flat checklist, a three-step strip and illustrated OBS instructions. Keep UI labels in sentence case; no decorative technical statistics or invented popularity numbers. “Streamer favorites” is the existing collection name, not a measured ranking.

The intended cold-visit path is: understand the product in 5 seconds; choose a look by 15 seconds; adjust or skip customization by 30 seconds; enter a channel and copy by 45 seconds; paste into OBS by 60 seconds. These are usability targets, not measured promises. Test the complete journey with a streamer unfamiliar with the product before claiming “under a minute” in public copy.

```text
Landing desktop                           Editor desktop
Wordmark       Skins  OBS guide  CTA       Wordmark                   OBS guide
Headline       Animated stream specimen   1 Skin → 2 Customize → 3 Get your link
Pitch / CTAs   Skin name / pause           Step title                Undo / Redo
Three steps                               Six controls | Stream preview
Gallery filters + visual skin grid        Advanced     | Backdrop switches
Features / OBS guide / FAQ                 Back                     Continue
Final CTA / attribution
```

The public landing is `/`. Use `/editor.html?skin=bubble-lift` for a selected skin and `/editor.html` for the primary CTA. The latter opens Step 1 with Clean as the unchanged data default and Bubble Lift first in the gallery; no click is required to browse. A skin link opens Step 2 with that skin applied. Unknown IDs open Step 1 with “That skin isn’t available. Pick another starting point.” Keep canonical full settings in overlay hashes; never replace them with a skin-ID lookup. Preserve old editor hash URLs at `/`: detect a valid existing settings hash and route to the editor with the intact hash. Normal `/` with no settings opens the landing. Route transitions preserve session edits and channel; browser Back works. Selection/editing does not require authentication.

## Brand assets and CSS tokens

The original icon is a speech card with two short text strokes, a tail and one folded corner: the conversation has a new skin. `chatskins-mark.svg` is the pure SVG icon master; `chatskins-wordmark.svg` is the editable SVG lockup with live Fredoka text (falls back to sans-serif). Minimum 20 px icon; default 34 px. Place 10 px from the “ChatSkins” wordmark, set in Fredoka 600, 27 px with -0.5 px tracking. Header links to home and has accessible name “ChatSkins home”; hide the adjacent decorative SVG from assistive technology. Use the icon alone only when the accessible product name remains present. No Twitch glyph or borrowed game silhouette. Clear space: at least 8 px around the combined lockup.

Type pair: **Fredoka 500/600** for the wordmark, hero and section headlines; **DM Sans 400/500/600/700** for all UI and body copy. Both are Google Fonts. Load via a stylesheet link with `display=swap` in production, preconnect to fonts.googleapis.com and fonts.gstatic.com; no CSS @import waterfall in the production build. The review stylesheet uses @import for portability. Use sans-serif fallback; content must fit without the web fonts. Preset fonts remain independent and load on demand.

Use these custom properties throughout the website shell. Skin tokens are a separate namespace and must not inherit brand colors into saved user settings. Responsive media queries may adjust `--content` and `--rail` but do not introduce one-off UI colors or spacing.

```css
:root {
  --canvas: #101426;
  --surface: #1B2138;
  --raised: #252D48;
  --line: #414B6B;             /* decorative separators only */
  --control-line: #7F8BAB;     /* input/interactive boundaries */
  --text: #F5F6FF;
  --muted: #BBC4DF;
  --accent: #B7AAFF;
  --accent-hover: #CEC4FF;
  --on-accent: #191332;
  --focus: #E3DDFF;
  --success: #A9E6CC;
  --error: #FFB6BF;
  --warning: #F4D598;
  --font-body: 'DM Sans', sans-serif;
  --font-display: 'Fredoka', sans-serif;
  --text-xs: .8125rem;
  --text-sm: .875rem;
  --text-base: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.5rem;
  --text-title: clamp(2rem, 4vw, 3rem);
  --text-hero: clamp(2.8rem, 5.5vw, 4.75rem);
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;
  --radius-sm: 8px;
  --radius-control: 12px;
  --radius-card: 18px;
  --radius-stage: 24px;
  --radius-pill: 999px;
  --shadow-card: 0 8px 24px #05081933;
  --shadow-stage: 0 24px 64px #05081966;
  --shadow-float: 0 8px 32px #05081988;
  --duration-fast: 150ms;
  --duration-ui: 200ms;
  --duration-step: 250ms;
  --ease-out: cubic-bezier(.2,.7,.2,1);
  --focus-ring: 3px solid var(--focus);
  --hit: 48px;
  --content: 1200px;
  --rail: 400px;
  --source-width: 1280;
  --source-height: 720;
}
```

Body 16/24 px; small UI 14/21; captions 13/19.5; field labels 18/24 at 600 in Simple mode, 14/20 in Advanced. Hero 76/80 px maximum with -0.025em tracking; section headings 48/51 maximum. At phone sizes hero 50/53, section 32/35, editor title 36/40. Keep body lines under 65ch. Use semantic heading levels rather than heading size as a proxy.

| Component | Visual and behavioral contract |
| --- | --- |
| Primary button | 48 px minimum height; 12 px radius; 12/16 px padding; accent fill, on-accent text, 700 weight; hover accent-hover; press translateY(1px). One primary action per current editor step. |
| Secondary / text button | Surface fill, control-line 1 px border; hover raised. Text links remain underlined outside navigation. Destructive actions use explicit verbs and error-colored text, never an unlabeled icon. |
| Input / select | 48 px height, surface fill, control-line border, 12 px radius; text and visible associated label. Placeholder is optional help, never the label. Error border plus inline error icon/text; aria-invalid and aria-describedby. Disabled uses muted text and an explanation, not reduced opacity on the entire control. |
| Switch | 44 × 26 px track inside a 48 px labeled target; 18 px thumb; off raised with control-line edge, on accent with on-accent thumb. 17 px travel in 200 ms. Native checkbox with role=switch; accessible checked state and visible On/Off text synchronized. |
| Slider | Native keyboard slider, 48 px target row, 4 px track, 20 px thumb; accent active track, control-line remainder. Pair with editable number field and unit; announce committed value, not every animation frame. Home/End and arrow keys work. |
| Color | 56 px swatch control plus hex input; alpha checker for Advanced. Simple is six-digit RGB, Advanced #RRGGBBAA + opacity. Visible name and numeric value mean swatch color is not the only cue. |
| Skin card | 18 px radius; surface, line border, 202 px specimen region + metadata; selected accent 2 px ring AND “Selected” check. Hover raises 3 px in 200 ms. No truncation of skin names. Entire card activates selection; do not nest buttons inside links. |
| Segmented choices | Native labeled radios, 48 px targets, selected border and checked mark, not color alone. Use wrapping controls rather than a horizontal scroll trap. |
| Toast | Raised surface, success border and check, 12 px radius, float shadow. Copy status uses role=status / polite; shown 4 seconds with permanent selectable URL retained. Mobile places it inline above actions, never over the input or keyboard. |
| Focus | 3 px focus ring with 4 px offset. Never remove on links, cards, summaries or native color picker. Decorative `--line` must not be used as an input boundary. |

## Landing layout and exact copy

1200 px centered content, 24 px outer gutters (1360 px max at ≥1600 viewport). Header 96 px with wordmark left, “Skins”, “OBS guide”, “Make my overlay” right. Hero grid .85fr / 1.15fr, 40 px gap, 48 px top and 64 px bottom. All text left aligned. At ≤800 px stack copy then demo; phone gutters 16 px and header 80 px. Hide only secondary header links at narrow widths; the primary CTA stays. How-to, gallery and guide remain reachable through the page.

Hero headline: **“Your chat. Your main character.”** Break after “chat.” on desktop. Pitch: **“Turn your Twitch chat into an overlay that feels like you.”** Primary **“Make my overlay”** → Step 1. Secondary **“See all skins”** → #skins. Trust line **“Free. No login needed. One link for OBS.”** Demo label **“Your next stream, reimagined”**, status **“Sample chat”**, footer **“Six featured looks. All yours to change.”**, checkbox **“Pause demo”**.

The hero is a 16:9 SVG stream backdrop with three chat rows on the left and abstract scene interest on the right. HUD decoration is original and aria-hidden. Render complete skin specimens from shared preset values. Cycle exactly **Bubble Lift → Glass Card → Name Tag → Comic Burst → Pastel Pop → Esports Slash**, six seconds per look, a 36-second CSS-only opacity cycle; name label changes with the specimen. Keep opacity changes to a 200 ms crossfade in production, avoiding bright flashes between dark/light skins. Simulate one incoming sample message per interval using opacity/translateY, not chat requests. Always mark it as sample chat. Pause control freezes both rotation and incoming rows. Reduced motion shows one complete static Bubble Lift specimen and exposes manual Previous/Next skin controls in production. Never run a timer to update hero pixels. Specimen captions are actual DOM text, not embedded in an image.

How it works is a quiet bordered strip with original outline icons (two skin cards / sliders / display with check):

1. **Pick a skin** — “Find a look that feels like your channel.”
2. **Make it yours** — “Change a little. Or change everything.”
3. **Paste one link in OBS** — “Your chat is ready for its close-up.”

Gallery heading **“Find your chat’s personality.”** Support **“From cozy conversation to the final boss. Start with a skin; make it yours.”** Four filter chips: **Streamer favorites / Game styles / Animated / Colorful**. Favorites selected initially, all 12 favorites shown with six Featured first; other group counts are 16, 2, 4. Use the existing catalog order and names. No duplicated cards across groups. Footer **“34 starting points. Every detail editable.”** A top-level **“Pause previews”** stops all miniature motion. Three columns desktop, two at ≤800, one at ≤480. Cards contain two readable sample rows, name, short catalog description, Featured text where applicable. Show entrance once on visibility, replay on hover/focus; production does not infinitely animate every card. Filter controls use radios and result count is politely announced. Clicking opens selected skin in Step 2.

Feature band uses a two-column heading/checklist composition, not seven identical cards. Heading **“More chat. Less setup.”** Support **“All the essentials for your community to look at home on stream.”** Exact items:

| Heading | Copy |
| --- | --- |
| No login needed | Your Twitch name is enough to get started. |
| Your community’s emotes | 7TV, BTTV and FFZ, alongside Twitch emotes. |
| A full editor, when you want it | Fine-tune names, frames, motion and more. |
| Transparent backgrounds | Keep your gameplay in the picture. |
| Read-only chat | Displays messages. Never posts as you. |
| Light in OBS | Simple overlays. No video backgrounds. |
| Free to make. Free to use. | Every skin and every editor control. |

These are intended release claims, contingent on the existing Round 5 features passing builder checks. Do not imply private/sub-only emotes are universally available or that performance is measured. No synthetic testimonials, user counts, rating stars or “official Twitch partner” claims.

OBS heading **“Meet your new Browser Source.”** Support **“A quick setup in OBS. No plugins to install.”** Three drawn HTML UI mockups: Sources with + / Browser selected; properties with URL and dimensions; source list with ChatSkins above game capture. Give each illustration descriptive alt text via role=img/aria-label; the same steps remain real adjacent text. Avoid exact imitation of OBS branding or screenshot assets.

1. **Add a Browser Source** — “In OBS, go to Sources, choose +, then Browser. Name it ‘ChatSkins’.”
2. **Paste your overlay link** — “Paste the copied URL. Set width to 1280 and height to 720, then choose OK.”
3. **Put chat on top** — “Keep ChatSkins above your game source. Send a chat message to check your setup.”

FAQ heading **“A few things before you go live.”** Six native details/summary disclosures, initially closed. Exact questions and answers:

| Question | Answer |
| --- | --- |
| Does it need my Twitch password? | No. Type your Twitch channel name to use public chat. Connecting with Twitch is optional; you sign in on Twitch, never in ChatSkins. |
| Will it slow my stream? | ChatSkins uses lightweight chat layers, not video backgrounds. Performance depends on your settings and computer. Start with a simple skin and turn off animation if needed. |
| Can I use it with Streamlabs or StreamElements? | Use the link in a Browser Source in Streamlabs Desktop or OBS. With a StreamElements setup, add ChatSkins as a separate OBS Browser Source alongside your existing overlay. |
| Will 7TV, BTTV and FFZ emotes show up? | Public global and channel emotes are supported. If an emote service is unavailable, the emote’s name appears as text so chat stays readable. |
| Do I need to be live to set this up? | No. Sample chat lets you design offline. To test the real overlay, send a message in your Twitch channel’s chat; your stream can stay offline. |
| How do I save my changes? | Your overlay link contains your settings. Keep it somewhere handy, or save a skin in this browser from the Advanced editor. After editing, copy the new link into OBS. |

Closing CTA heading **“Give chat a place in the show.”** Support **“Pick a look. Add your channel. You’re on.”** Button **“Make my overlay”**. Footer exactly **“Built with OpenAI Codex for the Codex x TwitchCon Hackathon”**, **GitHub** linked to `https://github.com/Korivash/chatskins`, and **“© Korivash”**. No real names or unsupported prize/winner badges.

## Editor composition and state

Top header: wordmark home, OBS guide. Step navigation is always **1 Skin → 2 Customize → 3 Get your link**; current step has filled accent pill plus `aria-current="step"`. Use real links and browser history; completed steps are freely reachable, no forced gate. Changing steps focuses the new h1 (tabindex=-1) and announces only the step title. Back preserves edits, channel and preview choice. Step 3 can be reached with the default skin; valid channel is required only to copy/open the live overlay.

Desktop Step 1 uses a full-width gallery, four columns, search above filters. Steps 2/3 use 400 px controls + flexible preview with 24 px gap; at ≥1600 px rail becomes 440 px. Unlike the prior full-height app, default Simple mode uses normal page flow with a sticky preview where it fits. At <900 px stack the preview before controls. At 320 px everything fits without horizontal scrolling, cards one column, labels and fields full width. Action row follows the controls; in production a mobile sticky action may be used only when it does not cover content or the on-screen keyboard (reserve its height plus safe-area inset). Advanced keeps a non-overlapping search row and independently scrollable controls on roomy desktop screens. At short viewport heights or mobile use document scroll. Source preview is uniformly scaled, not cropped.

Step 1 title **“Pick your starting point.”**, helper **“Everything can be changed later.”** Search label **“Find a skin”**; search across display names, descriptions and groups, not raw setting keys. Filter and search intersect; no-results has **“No skins found. Try ‘glass’, ‘retro’ or clear your search.”** with **Clear search** action. Use each actual skin renderer for preview and maintain one selection across groups. Native radio cards in production (arrow keys within visible group, Space to select); the review sheet uses links to the Step 2 composition. Selection updates preview; **“Customize this skin”** advances. **“Start with Clean”** applies Clean and advances. Gallery radio/check state is separate from the Featured badge.

Step 2 title **“Make it yours.”** Below: “Bubble Lift · Your starting point”, changing to “Bubble Lift · Modified” on edit. Undo/Redo are present but quiet and disabled with reasons when empty. Exactly six appearance controls appear in Simple mode, followed by the separate **Advanced editor** mode switch. No account prompt here. **“Back to skins”** and primary **“Get my overlay link”** conclude the step.

### Simple mode mapping (builder contract)

Simple mode is a projection of the existing canonical settings, not a second stored schema. Opening or closing it never mutates settings. One user change is one undo transaction. Use Round 5 preservation rules when selecting skins; URLs still contain full normalized settings. Store current step, simple/advanced mode, backdrop and drafts outside overlay settings.

| Friendly label | UI and exact write behavior |
| --- | --- |
| Font | Curated searchable font select plus system fonts. On explicit choice set fontFamily for panel, messageBox, name, messageText and system; do not change badge image styling, weight, line height or effects. Keep typography inheritance flags. Show “Multiple fonts” when resolved values differ; entering Simple does not unify them. |
| Text size | Slider + editable number; 12–48 px quick range. On explicit edit compute ratio new/current resolved messageText size, apply to the five text/container part font sizes and badge fontSize, clamp each to its existing schema bounds. This preserves Announcer/name proportions. Preserve inherited sizes without double-scaling: update each stored leaf once, resolve afterward. Imported values outside quick range display their actual number with “Set any size in Advanced”; no silent clamp on mode entry. |
| Accent color | Six-digit hex plus color picker. Explicit edit writes name.paint.color, frame.paint.color, frame.outer.color, frame.ornament.color and effectColors.borderSecondary, preserving each alpha; set the name and primary frame paint to solid, nameColorMode=fixed, nameEffect=none, roleColorsEnabled=false so the choice is visible. For pill/tab/initial treatments also update presentation.chipColor and use contrast-corrected name ink. Retain all other colors/gradients for later editing. Helper “Names and frame accents”. If multiple effective colors or priority overrides exist show “Custom accents” until explicitly edited. Undo restores the previous complex look. |
| Background | Solid / Glass / Transparent segmented radio group. Transparent writes transparentBackground=true only. Solid/Glass set it false, operate on the existing frame.target surface, disable its image/recipe/background ambient effects, choose solid fallback color; solid opacity=1, blur=0; glass opacity=.86, blur=0 for honest cross-source appearance. Preserve the inactive surface and text/frame paint. If inactive surface has nonzero opacity, clear it only on explicit Solid/Glass selection (undoable) so the selected result is predictable. Glass helper “Glass is a translucent tint in OBS.” Existing gradient/image or dual surfaces show “Custom background” summary with no radio selected until edited. |
| Frame | On/Off switch maps to inverse hideFrames; retains actual border/ornament settings. If turning on a frame with no visible stored frame/accents, create a solid 1 px frame in the current accent, rather than an invisible On state. Turning off suppresses rings, accents, ornaments and their effects as Round 5 defines; does not hide the message backing. |
| Entrance animation | None / Fade / Slide / Pop; writes animationIn only, uses 200 ms when selecting a new non-none effect. Existing bounce/zoom/glitch display “Custom animation” without normalization. Reduced motion retains selected value with “Motion is off for your device.” |

Accent changes can affect contrast; retain Round 5 automatic readable-name correction. On a fully transparent surface show **“Check readability over your brightest gameplay.”** Never claim arbitrary user colors/transparency are AA compliant. Preview background changes do not change the actual overlay transparency.

### Advanced view

Switch label **“Advanced editor”**, helper **“All the details, still your skin.”** Switching back is always available and does not reset anything. Preserve the complete Round 3/5 controls, schema ranges, conditional rows, library, parser-based CSS safety contract and history. No raw paths or keys in product labels.

Six part sections: **Message box / Name / Message text / Badges / System / Panel**. Each has Font / Color / Effects; advanced typography and gradient stops are nested disclosures. The mockup opens Name to make the visual treatment reviewable. Then **Name layout / Frame / Background / Name format / Layout / Motion & effects / Filters & emphasis / Emotes & badges / My skins / Custom CSS**. Each top-level section has one Reset section action. Preserve the schema-complete labels from `skins.json`; the static specimen illustrates layout, not replacement field-generation logic. Background surface selector switches between both independently stored surfaces. Gradient controls support the existing optional third stop. Frame gradients use the same stop controls as part paint. Keep My skins empty state, import preview and storage errors from Round 3. A sticky footer offers **Get my overlay link**; destructive library actions never occupy that primary slot.

Search **“Find a setting”** sits above, not on top of scrolling fields. Match human labels/synonyms; opening a result reveals its dependencies. Empty **“No settings match. Try font, glow or lifetime.”** No duplicate inputs for legacy aliases. Source pixels are labeled px; durations ms or seconds, never ambiguous units. Keep **Custom CSS active** visible when applicable; Simple mode changes may be overridden by custom CSS, with helper **“Custom CSS may override these controls. Review it in Advanced.”**

### Step 3, preview and recovery

Title **“Let’s get you on stream.”** Helper **“Connect your channel, then take your link to OBS.”** Primary **“Connect with Twitch”** above **“Or type your Twitch name”** (manual path visible by default, never login-gated). Helper **“Optional. Only used to fill in your channel name.”** OAuth must be implemented/verified by the builder before this button ships; use minimum identity permission, never request posting/moderation permissions. A token must never enter the overlay URL, logs, preview labels or shared state. The design does not implement OAuth. If configuration is unavailable, show “Twitch sign-in is unavailable. Type your channel name below.” and keep manual entry fully usable.

Input label **“Your Twitch name”**; helper **“Your channel name, not your display name or a URL.”** Trim whitespace, remove one leading @ or #, normalize lowercase; accept the existing 1–25 ASCII letter/digit/underscore contract. Syntax validation is not proof that an account exists. Show **“Channel name ready: cozy_channel”** after validation; reserve “Connected” for successful chat connection. Do not label a syntactically valid name as verified. After validation the primary emphasis moves to **“Copy overlay URL”** and Twitch sign-in becomes secondary. The mockup intentionally displays both stages of this composition together.

Copy row: read-only selectable **“Your overlay URL”**, full generated hash (visually scrollable, never an abbreviated copied value), primary **“Copy overlay URL”**. Clipboard success toast **“Copied! Paste it into an OBS Browser Source.”**, check icon and polite announcement. Failure **“Copy this URL manually.”** Select the URL and provide selection instructions; do not report success before the promise resolves. Insecure/local environments use the same fallback. **“Open test overlay”** opens the exact current URL in a new tab with noopener and a new-tab accessible label. Until valid, both actions are disabled with **“Add your Twitch name to get your link.”** Preserve the existing >16,000-character notice and JSON-export alternative.

Inline OBS guide heading **“One last step in OBS”** with the same three steps/dimensions as landing and link **“See the illustrated OBS guide”**. Changing a look after copying shows **“Your look changed. Copy the new link into OBS.”** Do not imply old pasted URLs update remotely. Sample messages and the stream scene are never exported; real overlay tests may be blank until someone sends a chat message.

Preview defaults to **Stream**, plus **Dark / Light / Checker** radio choices. Show an original 16:9 1280 × 720 scene, 5% inset dashed safe-area guide (64 px horizontal / 36 px vertical), source-size caption, chat in its actual 480 px source column at configured inset. The guide is informational, not an enforced crop or saved layout change. Preview should render with the shared runtime renderer at source scale then uniformly fit both available width and height. Mockup chat is enlarged slightly for visual review; builder must preserve true source metrics. Add a **100% chat detail** view on mobile to inspect type without widening the document. At <900 px preview comes first, then controls; no tiny two-column rail. Keep fake sample chat initially, with explicit **Sample chat / My channel** choices in production. Never silently change modes after typing a name. Label **“Sample chat”** whenever fake data runs, with **“Pause sample chat”**. Live connection status is separate from whether the streamer is broadcasting.

| Situation | Exact message / recovery |
| --- | --- |
| Invalid channel | “Check your Twitch name. Use letters, numbers and underscores only, up to 25 characters. Leave out twitch.tv/.” Inline under input; keep edits and focus. |
| OAuth cancelled | “Twitch sign-in cancelled. No problem. Type your Twitch name to continue.” Return focus to manual input, retain look. |
| Connecting | “Connecting to cozy_channel…”; keep editing and sample preview available. |
| Connected but quiet/offline stream | “No messages yet. Your channel is connected. Send a message in Twitch chat to test it, even while your stream is offline.” Do not infer stream broadcast status from empty chat. |
| Chat connection failed | “Couldn’t connect to chat. Check your channel name and connection, then try again. Your design is still here.” Actions “Try again” / “Use sample chat”. |
| Browser offline | “You’re offline. Keep designing with sample chat; reconnect to test your channel.” Keep valid URL copying available; do not pretend to verify chat. |
| Provider unavailable | “Some emotes are unavailable. Their names will appear as text.” Details list affected providers; no stream-visible warning. |
| Font unavailable | “That font couldn’t load. Showing a fallback for now.” Preserve chosen font and allow retry/another choice. |
| No local saved skins | “Your next favorite starts here. Save this look to find it in this browser.” Save skin action. |
| Copy failed | “Copy this URL manually. Your browser couldn’t copy it. Select the link above and copy it.” |

## Motion, access and load budget

Hover 200 ms, press 150 ms, step opacity/8 px translation 250 ms, ease-out token. No parallax, cursor effects, layout spring, autoplay video or constant glow animation in website chrome. Respect system reduced motion AND user's reduceMotion: remove movement, transitions and automatic hero rotation; show complete text immediately. Pausing the demo/gallery is also possible without changing OS settings. Production pauses offscreen previews and hidden documents, renders only visible gallery samples, and limits hero to six composed specimens; no per-frame JS. Prefer one orchestrated demo to simultaneous animation everywhere.

AA target: body text ≥4.5:1, large text ≥3:1, required control boundaries and focus ≥3:1 against their adjacent surfaces. The brand text/muted/accent combinations are chosen for dark surfaces; do not put white body text on accent buttons. Validate with computed colors, including disabled helpers and composites. Use non-color state cues. Icons get accessible text when meaningful, decorative artwork aria-hidden. Header/nav/main/footer landmarks, skip link, one current page h1, logical heading order, labeled fieldsets and unique IDs. Error/copy states announce politely; samples are not live regions. Details and radio controls remain keyboard operable; focus must stay visible at 200% and reflow at 400%. Minimum targets 44 px (default 48); no hover-only instructions.

Production initial load targets: ≤100 KB gzip first-party HTML/CSS/JS before optional editor/catalog code, ≤150 KB fonts for the two brand families, no raster/video hero assets and no emote-provider requests on the landing. Load preset fonts when a specimen approaches the viewport; use good fallback metrics and reserve specimen height. Defer gallery renderer/data below hero; landing marketing copy, links, FAQ and initial specimen must remain readable before JS. Target LCP <2.5 s and CLS <0.1 on a representative mobile connection; these are budgets for the builder to measure, not achieved metrics from these review files. The static sheets deliberately include all 34 specimens for review and are not the production loading architecture.

## Deliverables, scope and builder acceptance

Open `landing-mockup.html` and `editor-mockup.html` alongside `round6.css`. The landing includes all groups with native CSS-filtered cards, simulated CSS-only featured cycle and pause, the full copy and original scene. The editor is a vertical review sheet showing Step 1, Step 2 Simple, Step 3 and Advanced, plus recovery specimens; production shows only the current step. Native toggles, background radios and disclosures can be inspected, but no control binds settings, no search query filters records, no OAuth runs, no URL is generated/copied and no app code is imported. Skin-query links are route examples; the editor sheet deliberately continues showing Bubble Lift. `round6.py` regenerates only these design HTML/SVG assets; `chatskins-mark.svg` is original reusable artwork. No app build is implied by these mockups.

Builder acceptance before judge handoff:

- Cold visit communicates Twitch chat overlay + free/no-login + primary action above the fold at 1280×720. Each of the six Featured looks appears in the hero with the correct caption; pause and reduced motion leave a complete visible specimen.
- All 34 cards open the correct editor skin; group/search/keyboard selection work without duplicates. Skin-ID links are editor shortcuts only; old full-setting hashes still work.
- A newcomer can skip customization, type a channel and copy a usable URL without signing in; copying and actual OBS source render preserve the selected look, emotes and transparency. Test the 60-second target with a real newcomer.
- Simple edits have the documented field mapping and single-step undo; Advanced retains all schema leaves and Round 3/5 controls. Mode changes never modify settings. Custom/mixed values stay intact until explicitly changed.
- At 320/390/768/1280/1920 px, all actions/labels are reachable with no page overflow or preview crop; mobile safe area, text detail, keyboard and sticky actions are checked. Keyboard traverses the full journey with visible focus.
- Test empty/invalid channel, cancelled/unconfigured OAuth, quiet channel, offline browser, provider failure, blocked clipboard, long URLs and font failure. Copy success is real; no sample/demo layer leaks into exported overlay.
- Measure contrast, mobile loading, hidden-tab/offscreen animation behavior and OBS performance. Verify claim copy against shipped capabilities. Remove review notes from production. Preserve footer attribution and do not add real names.

---

# Round 5 — Streamer favorites and a finished editor

This round is authoritative where it conflicts with earlier rounds. This is a **design handoff**, not an application change. Read `research/TOP-CHAT-UIS.md` first: its popularity claims are qualitative observations, not a measured ranking. We translate its bubble, vertical-tag, minimal-glass, neon, emote-forward and editorial directions into original shapes and palettes. No external theme CSS, art, logos or proprietary fonts are used. Frames are CSS/SVG geometry; all preset fonts are Google Fonts.

## Visual direction and gallery

Keep the editor quiet: canvas #101722, rail #182230, controls #222F40, dividers #34465E, text #F2F5FA, muted text #AFBDD0, focus #F4D38D. DM Sans handles editor text; individual skins own their display typography. Use left-aligned labels, generous preview space and actual chat specimens as gallery thumbnails. Color belongs in the chat, not in competing editor decoration.

`skins.json` contains **34 complete settings objects: 12 new + 22 polished**. Existing IDs and the default `clean` stay stable. All 12 new styles belong to the first group, **Streamer favorites**. Within that group, the six Featured records lead in this exact demo order: **Bubble Lift, Glass Card, Name Tag, Comic Burst, Pastel Pop, Esports Slash**. Then Quiet Line, Neon Edge, Sticker Stack, Initial Card, Signal Console, Announcer. Follow with Game styles, Colorful, Animated. Historical category labels remain browsing metadata; Animated does not require always-running animation. Featured is a textual badge, not color alone. Do not duplicate Featured cards in another group. Catalog metadata `featured`, `galleryOrder`, `galleryGroups`, `featuredSkinIds`, `description` and `designRevision` never enters an overlay URL.

The original Guild Chat is our calibration point: preserve its two continuous 1 px gold rings, 2 px clear gap, green text, Lato metrics and panel background. Every other original skin now has an intentional name format and frame/color combination (see the per-skin table below). Similar pairs are explicitly separated: Bubble Chat remains an inline pale capsule versus Bubble Lift's dark teal stacked speech balloon; Terminal is one green pane versus Signal Console's individual dashed mint command slips; Hero Shooter uses orange rectangular stripe cards versus Esports Slash's lime diagonal plates; Candy Pop uses warm multicolor tiles versus Pastel Pop's lavender cut-corner tickets. Readable names are bold, bodies stay calm, and all presets start with static decorative effects. Neon Edge has static edge glow. Entrances remain short, and system/user reduced motion always wins.

At 480 source pixels, typical body text is 22 px with line-height 1.4; Retro RPG uses 28 px VT323. Never scale text to make an overly long username fit. Wrap it, keeping the message column intact. Most new dark backgrounds use .96 opacity; Glass Card uses .86 with 12 px backdrop blur. This backing is essential: **OBS cannot blur a separate gameplay source behind the browser source**. Blur is an optional in-page enhancement; disabling it must leave Glass Card readable. Light pastel styles use deep ink with near-opaque backing. Design acceptance target is 4.5:1 body/name contrast against the composited surface on black and white backgrounds, with an automatic name contrast correction described below. Custom transparency can lower contrast; show an inline editor hint when it does.

## Additive settings contract

Retain `schemaVersion:3`; add catalog `designRevision:5`. This is an additive design extension, not a claim that an older v3 renderer understands the new primitives. The builder must extend its normalizer, schema, URL codec and renderer together. Older v3 inputs fill missing new leaves with the defaults below; existing canonical v3 leaves retain their values. Earlier round migration rules still apply. All newly proposed objects are materialized in every preset and included in `settingsSchema` and the embedded saved-skin schema. Unknown fields are still dropped. URLs contain the full normalized settings rather than a preset-ID lookup. A pre-Round-5 renderer may drop these fields: do not promise fidelity in an old build.

Every skin remains fully editable; **no skin-ID rendering branches**. `presentation` adds reusable layout and frame primitives:

| Key | Default | Range / behavior |
| --- | --- | --- |
| `presentation.layout` | `inline` | inline / stacked / columns / initials / announcer |
| `presentation.shape` | `rect` | rect / speech / slash / ticket |
| `presentation.nameTreatment` | `plain` | plain / pill / tab |
| `presentation.accent` | `none` | none / rail / underline / topbar |
| `presentation.chipColor` | `#A9CAFFFF` | RGBA name-chip/initial-medallion fill |
| `presentation.columnWidth` | `120` | 64–180 px, capped at 35% of available row width |
| `presentation.initialSize` | `40` | 24–64 px |
| `presentation.tailSize` | `10` | 0–20 px, zero removes tail |
| `presentation.cutSize` | `12` | 0–24 px |

Inline flows name and body together. Stacked gives the name its own row with 4 px separation. Columns gives names a fixed start column and messages the flexible remaining width with 12 px gap; use 8 px gap below 360 source pixels. Initials uses an initial circle spanning name/body rows with a 12 px column gap; derive one uppercase grapheme from display name, fallback `?`, mark decorative to assistive technology. This is not an avatar API lookup. Announcer stacks the name above the body; its 32 px size is in `parts.name`, never a hidden style override. For column widths below 240 source pixels, fall back to stacked to preserve readable text. Use min-width:0 and overflow-wrap:anywhere throughout.

Pill names have chipColor fill, 1 px white at 67% border, 20 px radius, 4/9 px padding and a 2 px hard black shadow at 44%; reserve 8 px below. Tab names use the same padding, 2 px radius, no shadow. Plain has no fill. Name text always uses its resolved name paint; automatic contrast checks against the chip when present. Medallion letters use contrast-safe dark or light ink. No badge duplication: `{badges}` remains a single template marker, with badges before name text inside its wrapper. Name templates retain exact punctuation in JSON; escaping and allowed tokens remain Round 3 rules.

Rect uses the existing frame/radii. Speech uses it plus a triangular 10 px tail at inline-start 24 px, pointing down and filled from the frame color; reserve tailSize below so it never hits the next row. Slash uses points `(cut,0), (100%,0), (100%-cut,100%), (0,100%)`; ticket cuts all four corners at cutSize. Render the silhouette as a background/frame layer, using an inset inner polygon to preserve border width; do not clip the text or its shadow. Add cutSize to horizontal padding for slash/ticket. At extreme radii/cuts, clamp to half the available frame dimension. Rect-only radii stay stored but are ignored by polygon shapes. A shape follows `frame.target`: once for panel, once per message otherwise. Pixel staircase geometry takes precedence over shape/radius; retain their values for switching back.

Rail is a 5 px start border on each row; topbar is a 5 px top edge on the framed target; underline is a 2 px name rule. Accent color is frame.paint.color. Reserve these in layout instead of painting across text. Frame width zero hides the primary perimeter, but an independently selected accent remains visible; hideFrames hides both. Ornaments retain the four-corner geometry from Round 3. Effects, outer rings, shadow and ornaments each own separate layers. All primitive controls appear under Name layout or Frame, never as undocumented CSS. Mockup CSS is an illustrative static rendering, not the production renderer: the builder must implement the exact multi-ring, four-corner and polygon inset contracts above.

New numeric keys accept finite decimals unless noted; maxLines is committed as an integer. Colors use #RRGGBBAA. New settings defaults are as below. Skin application/reset preserves channel, filters, reduceMotion, provider toggles, nameStyle, grouping, messageLimits, lifecycle and emphasis preferences; applying a skin replaces emote size and presentation. Loading a URL uses its explicit values. This supersedes Round 3's narrower preservation rule. The inherited `transparentBackground=false` and `hideFrames=false` switches are now explicitly declared in the schema: the former suppresses both background surfaces without changing stored colors; the latter suppresses frames, accents, ornaments and frame effects. Neither hides text. The outer OBS page remains transparent regardless. Canonical corner radii retain the full range; the legacy radius alias clamps to its old 24 px maximum.

## Five login-free feature additions

These prioritize the survey's readable lifecycle, filters/emphasis and fast customization gaps. They require no profile lookup, pronoun service, OAuth or EventSub. The mandatory community-emote work is specified separately below.

| Feature | Settings / default | Editor UI and precise behavior |
| --- | --- | --- |
| Readable, pronoun-free names | `nameStyle.readableColors=true`, `nameStyle.minContrast=4.5` (3–7) | Name → Color: “Keep names readable” toggle; advanced “Minimum name contrast” ratio input. Retain Twitch/fixed/role name choices. Resolve ordinary priority first, then adjust luminance until the requested contrast is met against the local backing/chip. If impossible with a translucent surface, add an opaque contrasting local name backing. For gradients, check every stop. Never infer gender, pronouns or identity; no external profile request. |
| Consecutive-user grouping | `grouping.enabled=false`, `grouping.windowSeconds=20` (1–120 s) | Layout → “Group consecutive messages” toggle and “Group within” slider. Group only immediately adjacent, eligible messages from the same IRC user-id (fallback lowercase login) within the window; no intervening user/system row. Suppress repeated name, badge and initial on later rows; align continuation bodies with the first body. A role/name change or first-message highlight breaks the group. Each message keeps its own lifecycle/moderation ID; when its header is removed, promote the next row's name. Never concatenate stored message text. |
| Line length and truncation | `messageLimits.maxLineCh=38` (16–80 ch), `messageLimits.maxLines=0` (integer 0–12; 0 = unlimited) | Layout → “Maximum line length” slider showing `38 ch`, “Maximum message lines” with “Unlimited” at 0. Constrain body width, not overall panel width; wrap unbroken text. Truncate only at a grapheme/emote boundary after measuring loaded fonts, adding an ellipsis on the last visible line. Preserve full message as accessible text; no interactive “read more” button on the stream. Never crop an emote in half. |
| Readable message lifecycle | existing `messageLifetime=30` s (0 = never), `animationOut=fade`, `animationOutDuration=160` ms; new `lifecycle.fadeMaskPx=0` (0–64 px) | Motion → “Keep messages forever” toggle plus “Message lifetime”; disabled duration retains previous nonzero choice in editor state. Layout advanced → “Overflow fade depth”. Fade mask affects the oldest edge only, inside the content area, never frame/text of the newest row. Complete-row eviction remains authoritative; no partial clipped row. Reduced motion makes entrance/exit immediate. Timer and capacity rules stay Round 3. |
| Tagged first-message emphasis | `emphasis.firstMessage=false`, `emphasis.color=#FFE095FF` | Filters & emphasis → “Highlight tagged first messages” toggle and alpha swatch. Only IRC `first-msg=1` qualifies: add a 3 px start marker and small “First message” label, keeping text colors stable. Reserve label space when present. Missing/unsupported tags produce ordinary chat. “First seen this session” is NOT a substitute; anonymous IRC may not supply this metadata. UI helper: “Only shown when Twitch supplies the first-message tag.” No follow/sub alerts or API inference. |

## Mandatory public community emotes

Emotes → three independent styled toggles: **7TV emotes**, **BTTV emotes**, **FFZ emotes**. Keys `emotes.sevenTV`, `emotes.bttv`, `emotes.ffz`, all **true**. No login, secret, token or proxy credential. Request IRC tags capability. Resolve the channel's numeric ID from the joined channel's **ROOMSTATE `room-id` tag**; do not guess it from display name or use an authenticated user lookup. Globals may load before ROOMSTATE. If the tag never arrives, global support still works and channel sets wait; editor status says “Waiting for channel ID”.

Fetch the public global and channel sets for each enabled provider:

| Provider | Channel endpoint | Global endpoint |
| --- | --- | --- |
| 7TV | `https://7tv.io/v3/users/twitch/{id}` | `https://7tv.io/v3/emote-sets/global` |
| BTTV | `https://api.betterttv.net/3/cached/users/twitch/{id}` | `https://api.betterttv.net/3/cached/emotes/global` |
| FFZ | `https://api.frankerfacez.com/v1/room/id/{id}` | `https://api.frankerfacez.com/v1/set/global` |

Normalize each provider into code → `{provider,id,url,width,height}`. 7TV channel `emote_set.emotes` and global `emotes` supply names and host/files; use returned host/files (prefer suitable WebP/AVIF with PNG fallback). BTTV combines `channelEmotes` and `sharedEmotes`; globals are an array; use provider CDN `https://cdn.betterttv.net/emote/{id}/2x` (higher resolution when required). FFZ follows room set IDs and global `default_sets` through `sets`, then each set's `emoticons`; use returned resolution URLs. Normalize protocol-relative image hosts to HTTPS. Validate response shapes and URLs, reject non-HTTPS images, never insert provider text as HTML. If upstream response shape changes, disable that response gracefully and retain text. No assumption that undocumented fields will always exist; builder verifies live responses during implementation.

Cache **in memory**, keyed by provider + global/channel ID. Refresh every **10 minutes** from last attempt while active; deduplicate in-flight requests. Switching channel discards the active channel map immediately and applies only responses matching the new ID/generation. Keep globals reusable. Provider off means stop its refresh/request use and render new tokens as text; re-enabling can reuse a still-fresh cache. Use an 8-second timeout; network/CORS/429/5xx/invalid JSON failures leave the last good set for the current session, with next retry on the normal 10-minute interval (honor longer Retry-After). A channel 404 is an empty channel set, not a connection error. Cap cached channel sets to the current channel to avoid an unbounded session cache. Abort on teardown; no retry storm or per-message fetch.

Parse native Twitch emote ranges first using IRC positions. In the remaining text spans match **case-sensitive, exact whole tokens separated by whitespace or message boundaries**; punctuation stays part of the token (`Kappa,` is not `Kappa`). Never substring-match inside usernames, URLs or longer words. This is the unambiguous whole-word rule for codes containing punctuation. Collision precedence: native Twitch range > any channel-set exact code > any global-set exact code; within the same scope, **7TV > BTTV > FFZ**. Build one resolved map at refresh, never search every provider on each message. Treat emote URLs as images, with code as alt text; failed image load replaces it with the original text token and spacing. A disabled/unavailable provider leaves readable text with no blank boxes. Native emoji remain text/emoji and do not need an emote API.

`emotes.inlineSize=28` px (16–64) defines inline height; preserve image aspect ratio and cap extreme widths to available body width. `emotes.emoteOnlyScale=2` (1–3) gives **56 px** default emote-only height. After resolution, a message is emote-only iff it contains one or more native/third-party emotes and otherwise only whitespace; textual emoji alone do not qualify. Wrap bursts naturally within the body, never add an enormous unbounded canvas. If an unresolved/failed token remains, use ordinary inline sizing. Emote pixels never inherit text outlines or gradients. Animated provider images honor reduced motion via a static file where available, otherwise a static placeholder with code; never promise reduced motion while continuing GIF/WebP animation. Provider status is editor-only: Loading / Ready / Unavailable, with successful load time; failures must not interrupt IRC or display error banners in the stream.

## Editor polish contract

Keep Round 3's 440 px desktop rail, fit-to-source preview and 40 px minimum controls. The mockup's compact review rail demonstrates the same spacing and treatment; runtime dimensions remain 440 px. Use 16 px section padding, 12 px field gaps, 8 px between swatches, 24 px between major areas. At <900 px, preview comes first and controls stack. At 320 px use single-column labels/inputs when needed, without horizontal page scrolling.

Each of Message box / Name / Message text / Badges / System / Panel has **Font / Color / Effects** groups. Font shows family, size, weight, line height. Color shows paint and alpha; Effects shows outline, shadow, glow. Advanced typography (italic, uppercase, letter spacing, inheritance), gradient stops and effect offsets start collapsed. Only relevant fields expand with their parent mode. Advanced rows preserve values when hidden. Every top-level section, including Skins, Frame, Background, Name format, Layout, Motion, Filters, Emotes and Advanced, has exactly one **Reset section** link. Nested Font/Color/Effects groups do not get duplicate reset links. Reset restores that section's last applied/saved baseline snapshot, is one undo transaction, and updates the preview. Skins reset only clears gallery filters/selection to current baseline; it does not delete My skins. Show a status announcement; never open a confirmation modal for these reversible changes.

`editorLabels` in skins.json explicitly maps **every settings-schema leaf path** (array entries use `*`) to a human control label. It is design metadata, not a URL field. Compatibility aliases are not separately rendered controls. Contextual section headings supply the part/surface; do not show `parts.name.shadow.y`, `enabled`, `blur` or an auto-generated raw key. Required examples: **Shadow offset Y**, **Shadow on**, **Glow on**, **Glow blur**, **Frame width**, **Name column width**, **7TV emotes**. Units supplement labels: px, ms, s, ch, %, °, × or contrast ratio, as appropriate. “Line height” is a multiplier, not px. Disabled controls retain visible labels and a short explanation. Every input has an actual associated label, not placeholder-only copy.

Boolean controls are 42×24 px styled switches with a 40 px hit area, using native checkbox semantics or role=switch with checked state and keyboard Space. Checked position and text communicate state without color alone. Do not expose bare browser checkboxes. Color controls show an alpha-checker swatch, editable **#RRGGBBAA**, and an **Opacity** slider/readout; both update the same canonical value. Sliders have a live value and unit plus editable number field, not an unlabeled thumb. Drag previews immediately and commits one undo item. Native color-picker RGB changes preserve alpha. Keep text contrast and focus rings visible on all control backgrounds.

Search occupies its own opaque **non-overlapping rail row** above the independently scrolling settings: rail grid rows `auto minmax(0,1fr) auto`. It may be position:sticky top:0 within that header region; never absolute-position it over controls. On narrow layouts it remains in normal flow when sticky space would exceed 25% of the viewport height. Match human labels, section names and synonyms; open matched advanced rows and include dependencies. Scroll matched fields into the content viewport with scroll-margin, never behind search/actions. Clearing search restores previous disclosures. Empty state: “No settings match. Try font, glow or lifetime.” Keep Copy overlay URL in the reserved bottom action row. Search/filter state remains editor-only.

## Acceptance and scope of the mockup

`mockup.html` is a self-contained static review sheet with **all 34 specimens, six Featured first**, followed by the polished editor study. It intentionally has no IRC, URL generation or functioning settings binding. Native disclosures/toggles can be inspected; sample content never claims to be live. Four chat rows per skin include a moderator badge, a long name, a wrapping sentence and three original star emote placeholders. No third-party artwork is embedded. Backdrops are abstract busy CSS shapes, not actual gameplay captures. Samples show final static motion states. `round5.py` regenerates the catalog/mockup within design/ only.

Builder acceptance: validate all 34 settings objects; round-trip every new leaf and six Featured metadata entries; preserve Guild geometry; test anonymous ROOMSTATE, missing first-msg, provider disabled/404/CORS/image failure, code collisions, channel switches and 10-minute refresh; exercise grouped-header eviction and emote-only sizing. Visually review 320/1280/1920 px layouts, long names and actual busy OBS gameplay at 100% source scale; check black/white contrast and blur-disabled behavior. Check all controls via keyboard, search overlap, per-section reset/undo and reduced motion. The static design artifact is not proof of runtime performance, provider uptime or OBS compatibility.


## Complete Round 5 visual roster

| Skin | Frame and color story | Name format |
| --- | --- | --- |
| Bubble Lift | Deep teal bubbles with a low left tail and a mint name above the message. | {name} |
| Glass Card | Ice-blue translucent cards, a bright upper edge and soft depth. | {name} |
| Name Tag | Blue name tabs form a vertical reading rail; bodies align in a second column. | {name} |
| Comic Burst | Buttery speech balloons, thick ink outlines and offset ink shadows. | {name}! |
| Pastel Pop | Lavender ticket bubbles with lilac corner dots and deep plum text. | {name} ♡ |
| Esports Slash | Lime name plates and opposing diagonal ends; only the frame is slanted. | {name} // |
| Quiet Line | Warm editorial names, a short amber rule and a quiet dark reading strip. | {name} · |
| Neon Edge | One violet neon rail on an ink-purple card; white body text stays unglowed. | {name} / |
| Sticker Stack | Apricot name stickers with a small hard shadow on plum message cards. | {name} |
| Initial Card | A circular initial medallion anchors a compact two-row social card. | {name} |
| Signal Console | Mint receipt-like command blocks with amber prompts; no typing delay. | @{name} $ |
| Announcer | Oversized gold names headline compact dark lower thirds. | {name} |
| Guild Chat | Reference preserved: two continuous gold rings, green guild dialogue and a deep forest pane. | [Guild] [{name}]: |
| Fantasy MMO | Lavender double window with inset diamond corners; softer and cooler than Guild. | [Party] {name} › |
| Block Craft | Moss-grey stepped blocks and bright grass names; compact square rows. | <{name}> |
| Old-School MMO | Ochre ledger in a brass bevel; a sober single pane with yellow dialogue. | {name}: |
| Battle Arena | Teal tactical pane with squared corner brackets and an aligned squad column. | [Team] {name} › |
| Battle Royale | Sand-yellow notched field cards; condensed names and individual charcoal plates. | [Squad] {name} |
| Retro RPG Dialog Box | Cobalt dialogue window with a bright twin rim and triangular speaker prompt. | ▸ {name} |
| Cyber City | Magenta cut-corner panels and cyan callsigns; a hard-edged city HUD. | // {name} |
| Arcade Cabinet | Purple cabinet bezel, butter-yellow score names and static scanlines. | P1 · {name} |
| Space Command | Steel-blue communications panel with long technical corner brackets. | COMMS / {name} |
| Monster Trainer | Ivory dialogue cards with a heavy blue-ink rim and friendly tall lettering. | {name} says: |
| Dungeon Crawler | Stone-grey bevel, small brass corner diamonds and firelit serif names. | [{name}] |
| Cozy Farm | Warm wood plaques, cream lettering and small peg dots at the corners. | {name} · |
| Horror Survival | Dusty red emergency slips; light body text instead of low-contrast blood red. | [{name}] transmission: |
| Hero Shooter | Orange start stripe with small white corner wedges and compact team calls. | {name} / |
| Kart Racer | Sun-yellow racing capsules with a mint lane stripe; wide, playful spacing. | {name} » |
| Bubble Chat | Classic pale lavender inline capsules; deliberately compact beside Bubble Lift. | {name}: |
| Clean | Neutral navy reading strips with stronger backing and clear bold names. | {name}: |
| Candy Pop | Pink candy tiles with cream-to-mint pastel fill and small diamond corners. | {name} ✦ |
| Rainbow Border | Prismatic static perimeter around a sober midnight card; white names stay still. | {name} + |
| Terminal | A single forest-green console pane; plain prompts and no animated typing. | {name} > |
| Vaporwave | Plum-to-ocean gradient ribbons with fine lilac twin lines and mint names. | {name} ~ |

---

# Prior rounds (historical; Round 5 above wins)

# Round 3 — full editor handoff

This section is authoritative over all earlier rounds below, including the old exclusions of custom CSS and saved skins. Design files only; application implementation belongs to the builder. `skins.json` now has schemaVersion 3, all 22 complete presets, an embedded draft-2020-12 `settingsSchema`, `editorStateSchema`, `savedSkinSchema`, and storage limits. Old flat keys remain as compatibility projections. The existing v2 app must be upgraded before it can consume v3; its current normalizer rejects version 3. Do not deploy this data alone.

## Composition and interaction

Keep the slate palette and DM Sans editor typography from round 1. The chat itself remains the visual focus. Use a 440 px left rail, 64 px header, 96 px preview toolbar and flexible right stage. At 1280 × 720 the stage fits a 1280 × 720 source into the available 792 × 460 area without cropping (792 × 445.5); at 1920 × 1080 it fits 1432 × 805.5. All overlay dimensions are source pixels. Rail scrolls independently; its search and bottom actions remain visible. Below 900 px preview moves above settings; document scroll and sticky actions replace the desktop scroll regions. Controls never shrink below 40 px high; single-column fields at 360 px. Use 16 px rail padding, 12 px field gaps, 8 px swatch gaps. Focus remains a visible gold outline.

```
Chat studio       Guild Chat · Modified          Undo  Redo
Find a setting                 Fake / Live · channel · status
Skins / My skins               Dark / Light / Checker · Burst 10
Message box                    ┌──────────────────────────┐
Name / Message text            │ transparent source stage │
Badges / System / Panel        │                          │
Frame / Background             │ [Guild] [Moss]: hello    │
Name format / Layout           └──────────────────────────┘
Motion / Filters / Advanced    1280 × 720 · Fit · source px
Save skin · Copy overlay URL
```

Each of the six styling parts is a disclosure with identical controls, followed by Frame, Background, Name format, Layout, Motion & effects, Filters and Advanced. Runtime starts Skins and Name open; the review mockup deliberately opens EVERY section and nested group. Skins are starting points, never locks. “Start from scratch” loads Clean, clears frame/backgrounds/effects and custom CSS, keeps readable default text, and becomes an unsaved baseline. Preserve channel, filters and reduceMotion on skin selection/reset. Preserve nothing else. Built-in presets cannot be overwritten. Show the current skin name and “Modified” in the header, independently of library selection.

Search placeholder: “Find a setting”. Match labels, part names and synonyms (bubble/message box, border/frame, spacing/gap). Expand matching sections, show matching fields plus their contextual dependencies and result count. No results: “No settings match. Try font, frame or lifetime.” Clearing search restores previous disclosure state. Every control has a visible value, units where applicable, and a proper label; sliders pair with editable numeric fields. Color controls show #RRGGBBAA, swatch and alpha slider 0–100%; presets retain six-digit flat compatibility colors. Gradients show two mandatory stop rows and an optional third, each with color/alpha and position %. Sorted positions, 0–100%, duplicates allowed for hard edges. Preserve hidden values on mode changes. Invalid inputs keep last valid preview with inline guidance; clamp finite committed numbers. No motion or font-fetching on every keystroke; commit font names on Enter/blur.

Preview has explicit Test Chat / Live channel choices; typing a channel never switches mode implicitly. Live mode reports Connecting, Live (including empty chat), or Connection failed with “Use Test Chat” action. Never silently relabel Test Chat content as live. Background is Dark #101722, Light #F2F5FA or Checker; never serialized to overlay. Burst inserts exactly 10 marked sample rows through the same queue/lifetime/overflow logic; in Live mode label “Live + test messages” until these rows leave. Burst is preview-only. Render moderation, subscriber badges, long wrapping names, emoji, an emote and a system line in sample data. Every UI control is keyboard operable; announce connection/copy/save status, not incoming sample chat. Respect system OR user reduced motion.

## V3 settings and defaults

All nested objects are fully materialized in every skin. JSON schema defaults are Clean defaults. Six `parts` keys: `panel`, `messageBox`, `name`, `messageText`, `badges`, `system`. The shared table below applies to EACH. Exceptions: name solid color #A9CAFFFF; system #AEBBD0FF; badges #D4DCE8FF and size 14.3; panel/messageBox/badges shadows off. All other shared defaults below apply. Lengths px, angles degrees, stop positions %, alpha 0–1, time explicitly seconds or ms. Numeric fields accept decimals unless integer; sliders step .1 px, .01 alpha, 1 degree, 1 ms/second, weight 1.

Typography is independently editable. `inheritTypography=false` makes a part use its own family, size, weight, italic, spacing, uppercase and lineHeight. Optional “Use parent typography” sets it true and disables those controls without erasing them: messageBox inherits panel, name/messageText/badges inherit messageBox, system inherits panel. Panel cannot inherit (normalize its flag false). Panel and box typography establish text defaults; explicit child overrides win, avoiding accidental changes to a carefully styled name. Paint/effects never inherit. Container paint colors only direct container text; backgrounds are separate surface controls. Container outline/shadow/glow render once around its box; text parts use glyph strokes/shadows. Badge styles affect its label/chip, never recolor Twitch badge image pixels; outline/shadow/glow decorate its wrapper. Emotes retain original pixels and sizing, unaffected by text paint.

Any Google Font family can be typed (1–80 Unicode characters, no CSS syntax); use an encoded family query on the fixed Google Fonts endpoint, not a supplied stylesheet URL. Retain the curated list: DM Sans, Lato, Noto Sans, Pixelify Sans, Roboto Slab, Barlow, Barlow Condensed, VT323, IBM Plex Mono, Nunito Sans; plus system-ui, serif, sans-serif, monospace. Request selected families/weights only, with fallback while loading and an editor-only failure notice. Weight accepts 100–900; if unsupported, browser nearest available weight, displayed as a notice without rewriting the requested value.

| Key | Type | Default | Range / choices |
| --- | --- | --- | --- |
| `parts.{part}.fontFamily` | string | `"DM Sans"` | max 80 characters |
| `parts.{part}.fontSize` | number | `22` | 8–96 |
| `parts.{part}.fontWeight` | integer | `500` | 100–900 |
| `parts.{part}.italic` | boolean | `false` | true / false |
| `parts.{part}.letterSpacing` | number | `0` | -3–20 |
| `parts.{part}.uppercase` | boolean | `false` | true / false |
| `parts.{part}.lineHeight` | number | `1.45` | 1–3 |
| `parts.{part}.inheritTypography` | boolean | `false` | true / false |
| `parts.{part}.paint.mode` | string | `"solid"` | solid / linear / radial |
| `parts.{part}.paint.color` | string | `"#F2F5FAFF"` | ^#[0-9A-Fa-f]{8}$ |
| `parts.{part}.paint.angle` | number | `135` | 0–360 |
| `parts.{part}.paint.stops` | array | `[{"color": "#A9CAFFFF", "position": 0}, {"color": "#E5A9FFFF", "position": 100}]` | 2–3 entries; see item contract |
| `parts.{part}.outline.width` | number | `0` | 0–8 |
| `parts.{part}.outline.color` | string | `"#000000FF"` | ^#[0-9A-Fa-f]{8}$ |
| `parts.{part}.shadow.enabled` | boolean | `true` | true / false |
| `parts.{part}.shadow.color` | string | `"#000000A6"` | ^#[0-9A-Fa-f]{8}$ |
| `parts.{part}.shadow.x` | number | `0` | -64–64 |
| `parts.{part}.shadow.y` | number | `1` | -64–64 |
| `parts.{part}.shadow.blur` | number | `3` | 0–64 |
| `parts.{part}.glow.enabled` | boolean | `false` | true / false |
| `parts.{part}.glow.color` | string | `"#A9CAFF80"` | ^#[0-9A-Fa-f]{8}$ |
| `parts.{part}.glow.blur` | number | `4` | 0–48 |
| `parts.{part}.glow.spread` | number | `0` | 0–16 |
| `frame.target` | string | `"message"` | message / panel |
| `frame.style` | string | `"none"` | none / solid / double / dashed / dotted / groove / ridge / inset / outset / pixel / beveled |
| `frame.width` | number | `0` | 0–16 |
| `frame.paint.mode` | string | `"solid"` | solid / linear / radial |
| `frame.paint.color` | string | `"#7487A1FF"` | ^#[0-9A-Fa-f]{8}$ |
| `frame.paint.angle` | number | `135` | 0–360 |
| `frame.paint.stops` | array | `[{"color": "#A9CAFFFF", "position": 0}, {"color": "#E5A9FFFF", "position": 100}]` | 2–3 entries; see item contract |
| `frame.radius.topLeft` | number | `6` | 0–120 |
| `frame.radius.topRight` | number | `6` | 0–120 |
| `frame.radius.bottomRight` | number | `6` | 0–120 |
| `frame.radius.bottomLeft` | number | `6` | 0–120 |
| `frame.padding.top` | number | `8` | 0–120 |
| `frame.padding.right` | number | `12` | 0–120 |
| `frame.padding.bottom` | number | `8` | 0–120 |
| `frame.padding.left` | number | `12` | 0–120 |
| `frame.doubleGap` | number | `2` | 0–24 |
| `frame.pixelStep` | number | `4` | 1–24 |
| `frame.outer.enabled` | boolean | `false` | true / false |
| `frame.outer.width` | number | `1` | 0–16 |
| `frame.outer.color` | string | `"#7487A1FF"` | ^#[0-9A-Fa-f]{8}$ |
| `frame.outer.offset` | number | `2` | 0–32 |
| `frame.ornament.style` | string | `"none"` | none / brackets / dots / diamonds / notches |
| `frame.ornament.color` | string | `"#7487A1FF"` | ^#[0-9A-Fa-f]{8}$ |
| `frame.ornament.size` | number | `12` | 2–48 |
| `frame.ornament.width` | number | `1` | 0.5–8 |
| `frame.ornament.inset` | number | `2` | 0–32 |
| `frame.legacyDetail` | string | `"none"` | none / hud / slab |
| `backgrounds.message.mode` | string | `"solid"` | solid / linear / radial / image |
| `backgrounds.message.color` | string | `"#111C2EFF"` | ^#[0-9A-Fa-f]{8}$ |
| `backgrounds.message.stops` | array | `[{"color": "#111C2EFF", "position": 0}, {"color": "#273B59FF", "position": 100}]` | 2–3 entries; see item contract |
| `backgrounds.message.angle` | number | `135` | 0–360 |
| `backgrounds.message.radialCenterX` | number | `50` | 0–100 |
| `backgrounds.message.radialCenterY` | number | `50` | 0–100 |
| `backgrounds.message.imageUrl` | string | `""` | max 2048 characters |
| `backgrounds.message.imageFit` | string | `"cover"` | cover / contain / fill / tile |
| `backgrounds.message.imageOpacity` | number | `1` | 0–1 |
| `backgrounds.message.opacity` | number | `0.55` | 0–1 |
| `backgrounds.message.backdropBlur` | number | `0` | 0–40 |
| `backgrounds.message.recipe` | string | `"none"` | none / rainbow / boards / confetti |
| `backgrounds.panel.mode` | string | `"solid"` | solid / linear / radial / image |
| `backgrounds.panel.color` | string | `"#111C2EFF"` | ^#[0-9A-Fa-f]{8}$ |
| `backgrounds.panel.stops` | array | `[{"color": "#111C2EFF", "position": 0}, {"color": "#273B59FF", "position": 100}]` | 2–3 entries; see item contract |
| `backgrounds.panel.angle` | number | `135` | 0–360 |
| `backgrounds.panel.radialCenterX` | number | `50` | 0–100 |
| `backgrounds.panel.radialCenterY` | number | `50` | 0–100 |
| `backgrounds.panel.imageUrl` | string | `""` | max 2048 characters |
| `backgrounds.panel.imageFit` | string | `"cover"` | cover / contain / fill / tile |
| `backgrounds.panel.imageOpacity` | number | `1` | 0–1 |
| `backgrounds.panel.opacity` | number | `0` | 0–1 |
| `backgrounds.panel.backdropBlur` | number | `0` | 0–40 |
| `backgrounds.panel.recipe` | string | `"none"` | none / rainbow / boards / confetti |
| `nameTemplate` | string | `"{badges} {name}: "` | max 160 characters |
| `animationOut` | string | `"fade"` | none / fade / shrink / slide |
| `animationOutDuration` | integer | `160` | 0–1500 |
| `customCSS.enabled` | boolean | `false` | true / false |
| `customCSS.source` | string | `""` | max 20000 characters |

`paint.stops` and background stops are arrays of 2–3 `{color:#RRGGBBAA, position:number 0–100}` objects. Part paint stop defaults are [{color:#A9CAFFFF,position:0},{color:#E5A9FFFF,position:100}]; background defaults are [{color:#111C2EFF,position:0},{color:#273B59FF,position:100}]. A part's radial paint is centered at 50%/50%; its angle is retained but ignored. Solid fallback always uses paint.color. Glow spread on glyphs means repeated stroke-like text shadows (bounded at 16 px); box glow uses box-shadow spread. Shadow/glow must not overwrite each other or frame pseudo-elements.

## Frame geometry and Guild Chat regression

Frame target selects one panel or every message. Frame scope is independent from the two background surfaces. Padding applies only to the framed target, even with style none. Radius applies to that target and its background. Off-target backgrounds default to square corners; explicit surface custom CSS may change that. Width 0 or none hides primary frame and its border effects, but independently enabled outer frame and corner ornaments remain visible. Borders/ornaments sit above backgrounds and behind text, pointer-events none. Reserve outer outset in layout and overflow calculations, including the source edge; never clip it with the panel's content overflow. Clip image/background layers individually, not the decorated wrapper.

Solid/dashed/dotted/groove/ridge/inset/outset follow CSS border geometry. Beveled uses top/left paint mixed with 28% white and bottom/right with 40% black. Gradient border uses a masked ring, not a filled rectangle; groove/ridge/inset/outset/beveled shade that ring in the same directions. Double is two full rings, each `width`, separated by `doubleGap`, total occupied thickness `2*width+doubleGap`, independent of CSS's minimum double-border width. Pixel uses square staircase corners: step size pixelStep with two right-angle steps at every corner, no diagonal antialiasing or rounded corners; saved radii are retained but ignored. Reserve 2*pixelStep at each corner and inset text beyond it. Ornaments: brackets = two perpendicular size-length lines; dots = filled size-diameter circles; diamonds = size-square rotated 45°; notches = inward V marks with depth size/2. Each repeats at four corners, inset from primary border's inner edge; width applies to strokes, ignored by filled dots/diamonds. Reserve ornament bounds in effective padding. No skin-ID rendering branches.

Second outer frame is a solid ring of outer.width, separated from the primary frame's OUTSIDE edge by outer.offset. Outer corner radii = corresponding primary radius + offset + outer.width. Content box + primary border is the layout box; painted outset = offset + outer.width, reserved outside it. Both rings use border-box geometry. Do not use one box-shadow slot shared with glow/ambient effects.

**Guild Chat exact correction:** frame.target panel; style solid; width 1; paint solid #BDA363FF; radius TL/TR/BR/BL = 2 px; padding T/R/B/L = 14/16/14/16 px. outer.enabled true, width 1, color #BDA363FF, offset 2 px. Thus two continuous gold 1 px rings with a 2 px clear gap, outer radius 5 px and total outset 3 px. Ornament none; legacyDetail none; borderEffect none. Background panel solid #0C1915FF at .80 opacity; message background opacity 0. Panel width 480 px excludes the extra 3 px painted outset on each side. Gold stays opaque when the background changes opacity. Preserve Lato 22/400, green text #72EC99, names #A1FFB7, system #E3C885, gap 7, and nameTemplate `{badges} [Guild] [{name}]: `. The previous prose called this corners, which permitted incomplete corner-only rendering; this spec explicitly replaces that recipe with two full rings. At source scale inspect all four sides, empty panel, five rows, overflow and exit, in both renderer contexts. At preview downscaling subpixel antialiasing is expected; judge the 1 px lines also at 100%.

Legacy hud/slab decorations remain selectable as “Legacy detail” so all 22 skins retain their character. `frame.legacyDetail` uses the round 2 geometry, independent of primary style and ornaments. All other designs use none. Clearing it produces the ordinary frame builder result.

## Background and name template

Both `backgrounds.message` and `backgrounds.panel` expose the full background object above; the UI selects a surface without moving values between them. Solid, linear, radial and image modes are independent of frame target. ImageUrl allows empty or absolute HTTPS URL only, maximum 2048 characters, no credentials/data/javascript/file URLs. The user supplies their own image; the UI states that viewers/OBS will fetch it. Image has centered cover/contain/fill/tile fitting, imageOpacity multiplies opacity and pixel alpha; solid color is a fallback beneath it. For all modes, opacity multiplies only the background layer's alpha, never text/frame opacity. Backdrop blur applies behind the surface, without blurring its text; OBS cannot blur unrelated underlying OBS sources, only content inside the browser page. With unavailable image or backdrop support use the fallback solid. Gradient position order is stable; radial is an ellipse centered at radialCenterX/Y. `recipe` preserves round 2 rainbow/boards/confetti as an optional decorative layer; controls can switch it to none. Effects run on their old backgroundScope target, not on both surfaces.

Template is literal text with exactly one `{name}`, zero/one `{channel}`, zero/one `{badges}`. Unknown brace tokens, missing/repeated name or >160 characters are invalid; keep last valid example and explain. `{badges}` is a placement marker for the existing trusted badge component, never HTML from the token text; zero badges contributes no text. `showBadges=false` suppresses that component regardless of template. Do not additionally prepend badges. Collapse only the one adjacent space owned by an empty badge token; otherwise preserve all user punctuation/spacing, including trailing spaces. No automatic extra separator in v3. Name/channel/literals use text nodes, never innerHTML; even `<{name}> ` displays angle brackets. Prefix punctuation follows name styling; badge styling remains independent. System lines bypass the template. Always show an example using Moss, channel cozy_channel and a moderator badge below the field. Offer text-only examples `[Guild] [{name}]: `, `<{name}> `, `{name} » `, `{badges} {name}: `.

## Layout, removal and retained settings

These are still top-level keys; authoritative changes from earlier ranges:

| Key | Type | Default | Range |
| --- | --- | --- | --- |
| overlayWidth | integer | 480 | 120–3840 px, constrained to available source width |
| maxMessages | integer | 8 | 1–30 |
| messageSpacing | number | 8 | 0–120 px |
| alignment | enum | left | left / center / right, stack and text |
| direction | enum | bottom | bottom / top, newest edge |
| messageLifetime | integer | 30 | 0 never; 1–3600 seconds |
| edgeInset | integer | 20 | 0–64 px |
| animationOut | enum | fade | none / fade / shrink / slide |
| animationOutDuration | integer | 160 | 0–1500 ms |

Timer starts on arrival. Fade opacity 1→0; shrink scale 1→.85 and opacity 1→0 around alignment anchor; slide translates 16 px toward oldest edge and fades. Exit reserves original row height until removal, then compacts once; never animate layout. A row exits once and is excluded from active capacity; total mounted rows still ≤30 (evict oldest immediately if required). Capacity/height overflow always evicts immediately to avoid clipping; user removal and expiry use the chosen exit. Panel frame stays fixed while rows enter/exit. Reduced motion makes exits immediate. All old entrance, text/ambient effects, role colors, mentions, channel and filter keys keep round 2 defaults/ranges as encoded in settingsSchema. Do not reset unrelated parts when changing a font or effect.

## My skins, reset, history and sharing

Browser library key `chat-studio.my-skins.v3` stores `{schemaVersion:3, skins:[savedSkinSchema...]}` (max 100 records). Each record: id string `user-` + UUID (1–64 suffix chars); name string trimmed 1–60 characters, default “Untitled skin”; createdAt/updatedAt ISO UTC timestamps set on save; settings a complete normalized v3 object. Save prompts inline for name and creates a new record; “Update saved skin” explicitly overwrites the selected local record. Duplicate copies its values into a new record named “Name copy” (trim to fit), new UUID/timestamps. Rename preserves ID; duplicate names allowed and distinguished by modified date. Delete removes only the local record; show Undo action, keep current appearance as an unsaved baseline. Never modify built-ins. On quota/privacy failure keep edits in memory and report “Could not save in this browser. Export a JSON backup.” No false saved status. Saving a skin normalizes channel to empty and filters/reduceMotion to Clean; applying it preserves the user's current channel/filters/reduceMotion.

Export selected skin or all My skins as UTF-8 JSON envelope above, filename chat-skins.json. Import accepts v1/v2/v3 envelope, 1–100 records, ≤1 MiB, and only validated plain data; migrate, sanitize CSS, preview a list of names and warnings before Import. Never overwrite an existing ID: assign a new local UUID, preserve name; built-in imported IDs also become user IDs. Reject future versions, malformed JSON, invalid record types or too many records without modifying library. For otherwise valid records normalize invalid settings per key with visible change summary; user may cancel. Unknown keys are dropped; no prototype merges. Library schema uses full settings, not references to built-in IDs, so export works independently of preset updates.

History is session-only, up to 100 transactions of settings, selected baseline and local library mutations. Group one drag or text-edit focus session as one transaction; skin application, reset, import, save/rename/delete each one transaction. Redo clears on a new edit. Ctrl+Z/Ctrl+Y (Cmd+Z/Cmd+Shift+Z on macOS); text inputs/textareas keep native text undo while focused, then commit one editor transaction on blur. Disabled history buttons state why. Channel, connection, preview switches, search and disclosure state are outside history. Undoing library changes persists the restored library; on storage failure report it explicitly. “Reset to skin” restores the snapshot captured at last apply/save, including custom CSS, preserving channel/filters/reduceMotion, and is itself undoable. Never silently reset to Clean. URL loads are an “Imported look” baseline; they need no local skin ID. A deleted baseline remains available in session. Start-from-scratch is also undoable.

Share is “Copy overlay URL” plus “Copy share link” using the SAME overlay URL containing all canonical normalized settings as base64url UTF-8 JSON; omit editor/library/history state. No local skin ID dependency or external shortener. URL decoder resolves fields, sanitizes CSS and validates again in overlay, not only editor. If URL exceeds 16,000 characters show a length notice and offer JSON export; copy remains available (do not imply all browsers/OBS accept unlimited URLs). Clipboard failure reveals a selectable URL. Require a valid channel for a live overlay link; saved JSON works without one.

Editor-only schema: searchQuery string default empty/max120; previewMode fake|live default fake; previewBackground dark|light|checker default checker; burstCount constant10; activeSkinId string default clean/max80; baseline null until load then a full settings snapshot; openSections string[] default [skins,name], subset of section IDs, unique; undoLimit constant100. History arrays start empty and hold ≤100 transactions each. No editor-only values enter an overlay URL.

## Advanced CSS contract

Opt-in `customCSS.enabled=false`, `source=""`, max20,000 characters. Plain textarea with Apply button (one undo transaction), character count, validation status and Reset CSS action. Display: “CSS applies only inside your overlay. Imports, external file URLs and expressions are removed from shared styles. Use Background → Image for your own image URL.” Show count and reasons for removed rules/declarations; preview the sanitized text on Apply. Store/export/share only sanitized source. The same sanitization must run on JSON import and URL decode, even when disabled.

Use a CSS parser, not regex substitution: decode CSS escapes and comments before examining tokens. Remove all @import rules, expression() declarations (case/escape insensitive), and all external URL-bearing declarations, including http(s) url(), protocol-relative URLs, image-set string URLs and escaped equivalents. This design deliberately permits only local `url(#fragment)` references; strip other url() resources as well. Reject @font-face and unknown at-rules. Permit scoped qualified rules and nested @media/@supports only; disallow custom @keyframes in v3. Expand nesting before selector validation. Prefix every selector branch with the unique `[data-overlay-root]` scope; `:root` and root `&` map to it. Reject selectors escaping it (html/body, external ancestors, :has outside scope), @scope and malformed selectors. Contain layout/paint/style on the root, isolate its stacking context, and clip custom overflow at root; CSS cannot style the editor or other overlays. Provide documented hooks `.chat-panel`, `.chat-message`, `.chat-name`, `.chat-text`, `.chat-badges`, `.chat-system`. Custom CSS is last in cascade inside the root, can override builder styles, and gets a persistent “Custom CSS active” indicator; disabling it shows the builder result. It never becomes executable HTML/JS. Sanitizer acceptance examples: `@import "https://x"`, escaped `u\72l(https://x)`, mixed-case `EXPRESSION(...)`, `image-set("https://x" 1x)` removed; `.chat-name { letter-spacing:1px }` retained and scoped. Never claim a shared link is safe based only on stripping three strings.

### Alpha for retained effect colors

`effectColors` supplies canonical #RRGGBBAA colors (string, exactly eight hex digits) for the existing role/mention/border effects. Defaults: broadcaster #FFB7A5FF, moderator #97E8B2FF, vip #E6B0FFFF, subscriber #FFE095FF, mention #F4D38DFF, borderSecondary #E5A9FFFF. Each is a swatch + alpha slider; legacy broadcasterNameColor/modNameColor/vipNameColor/subNameColor/mentionHighlightColor/borderEffectColor map respectively to these fields with FF alpha. Export old aliases by dropping alpha, never overwrite the canonical alpha. Name gradient swatches are the canonical name.paint stops.

## Migration and precedence

Missing version = 1. Normalize legacy v1/v2 keys against their old ranges before mapping; map to v3, then allow v3 ranges. V3 canonical fields win over aliases PER LEAF. Missing canonical leaves use a valid corresponding old value, then Clean default. Invalid provided canonical leaves use Clean with notice (not a stale alias). Unsupported future versions show a notice and Clean. Deep-copy plain recognized fields; discard unknowns. JSON schema is the complete persisted shape, not a requirement that incoming partial URLs already be complete.

| Legacy keys | V3 destination / mapping |
| --- | --- |
| fontFamily/fontSize/fontWeight/lineHeight | all six parts; badges size = fontSize × .65 |
| textColor/nameColor/systemColor | messageText/name/system paint.color (+FF); container textColor; badges neutral |
| outlineWidth/outlineColor | name/messageText/system outline |
| shadowEnabled/Color/Opacity/Blur | name/messageText/system shadow; x0,y1, alpha merged into color |
| nameEffect gradient + nameGradientColor1/2 | name paint linear at 90°, two stops; gradient flag is alias, not a second renderer |
| nameEffect glow | name.glow enabled, color resolved name color, blur4; rainbow remains timed effect |
| borderStyle | line→solid, bevel→beveled, corners→solid + brackets, hud/slab→solid + legacyDetail; others same |
| borderWidth/Color/cornerRadius | frame.width/paint.color/all four radii |
| paddingX/paddingY | frame.padding left+right/top+bottom |
| backgroundScope | frame.target and old-effect target |
| backgroundColor/Opacity/SecondaryColor/Treatment | active backgrounds[target]; other surface opacity0; gradient→linear 135°, rainbow/boards/confetti→recipe |
| nameFormat | nameTemplate = optional `{badges} ` + old format + one trailing space |
| showBadges, channel, filters, layout, animation and remaining round 2 effects | same top-level keys |

The 22 records retain ALL old flat keys and also all canonical objects. Guild's old borderStyle projection is corrected to double. Emit aliases from canonical state when writing skins.json or compatibility exports: typography from messageText, name/system colors from respective solid fallbacks, shadow/outline from messageText, radius from TL, padding from left/top, frame scope from target, background fields from that target, template removes badge marker and one trailing separator. Map solid→line, beveled→bevel; unsupported legacy styles→line; outer enabled→double. Name paint linear/radial projects to gradient, glow to glow; otherwise retain rainbow or none. Background radial→gradient, image→solid fallback. Projection is lossy for v2; never use aliases to render v3 or overwrite canonical fields. Plain modern overlay URLs may omit aliases to shorten links; decoder fills them after canonical resolution. Round 2 role priority still overrides name paint, then Twitch mode uses its resolved solid color; chosen gradient takes precedence over ordinary fixed color. Existing border effects and background effects decorate canonical geometry and never replace its base layers.

## Builder acceptance

- Every part can independently change font, size, weight, italic, spacing, uppercase, paint, outline, shadow and glow; no sibling changes unless typography inheritance is enabled.
- All 22 v3 records validate and retain their old keys; v1/v2 URLs migrate; v3 canonical data survives URL and JSON round-trips, including alpha and custom CSS.
- Guild frame has two continuous gold lines in editor and OBS at 100%, with no clipping on overflow or expiry. Double, outer frame, glow and ornaments coexist without pseudo-element collisions.
- Templates render angle brackets and malicious-looking input literally; badges occur once. Invalid tokens cannot become markup.
- Save/reload, rename, duplicate, delete/undo, import conflicts, storage failure, reset-to-baseline and native text undo behave as specified.
- Verify blank live channel, empty connected chat, failed connection, burst10, transparent backgrounds and actual OBS image/blur limitations.
- Validate parser-based CSS sanitation with escape/comment/url/selector bypass cases before enabling shared CSS. All controls and search work with keyboard at 320/1280/1920 widths.

---

# Earlier design rounds (historical reference; Round 3 above wins)

# Chat overlay design handoff

This is a design package, not the application. `mockup.html` is a static review sheet with an editor composition and 22 five-message specimens. It has no chat connection, URL logic or functioning settings. `skins.json` is the complete preset data; no preset relies on hidden defaults. BRIEF.md is the product source. The requested gallery-first grouping supersedes the older group order in PROMPT.md.

## Design direction

An instrument for composing chat: a compact, left-aligned control rail alongside a generous transparent stage. The one expressive element is the skin gallery: real typography and frame samples, not decorative icons. Controls use a quiet blue slate palette so very different chat treatments remain easy to compare. No promotional hero, ornamental artwork or unrelated dashboard cards.

Editor tokens: canvas **#101722**, panel **#182230**, raised controls **#222F40**, dividers **#34465E**, primary text **#F2F5FA**, secondary text **#AFBDD0**. Interactive accent **#A9CAFF**, on-accent **#14243A**, focus **#F4D38D**. DM Sans from Google Fonts, weights 400/500/600/700. Title 20/26 px 700; section title 14/20 px 700; labels/body 14/20 px 400; captions 12/18 px 500. Use a 4 px spacing unit: 8 within controls, 12 between fields, 16 within sections, 24 between major areas. Inputs/buttons 40 px tall, 6 px radius. Cards 8 px radius; never apply a global radius to chat. Borders 1 px. Focus ring 2 px with 2 px offset. Disabled text stays legible; explain unavailable actions inline.

## Editor layout

All coordinates below are CSS pixels at 100% zoom. App header 64 px, settings rail 400 px including right border. Header holds “Chat studio”, a small “Overlay editor” descriptor, and a “Design preview” label in the static artifact. The runtime header needs no design label. Settings rail: top gallery (two columns, five rows, 8 px gap, cards 172 × 76 px at this width), followed by **Font, Text & Colors, Border, Background, Layout, Animation, Filters**. Gallery and groups share one independent vertical scroll area with 24 px side padding. Font starts open; other groups collapse with native disclosure behavior. A permanently visible 80 px footer contains primary “Copy overlay URL” and secondary “Reset”. The footer never overlays controls.

The right side has a 72 px preview toolbar with channel input and “Sample chat” / connection status, then a padded preview area. The channel is not a gallery control. Entering a valid channel starts real preview; when blank use samples. Show “Connecting…”, “Live: channel”, or “Couldn’t connect. Showing sample chat.” explicitly; never silently label Test Chat live. Keep settings editable during reconnects.

### 1280 × 720

```text
┌────────────────────────── 1280 ──────────────────────────┐
│ Chat studio                                header 64    │
├──────── 400 ────────┬──────────────── 880 ───────────────┤
│ scroll area 576     │ Channel [____________] Sample chat │ 72
│ Skin gallery       ├────────────────────────────────────┤
│ 2 × 5 cards        │ 24 px inset                        │
│ Font               │ ┌──────── stage 832 × 468 ───────┐ │
│ Text & Colors …    │ │ checkerboard / chat at bottom │ │
│ (scroll to groups) │ └───────────────────────────────┘ │
├────────────────────┤ source size + transparency caption│
│ Copy URL | Reset   │                                    │
└──── footer 80 ─────┴────────────────────────────────────┘
```

Right stage represents a **1280 × 720 OBS source**, scaled uniformly to 832 × 468 (0.65). Available preview body is 880 × 584. Stage plus 18 px caption and 12 px gap fits with 24 px top/bottom padding. Stage top is y=160. Chat retains source-pixel sizing: default 480 px stack width becomes 312 px on this stage; 22 px text becomes 14.3 px. Do not shrink settings controls with the stage.

### 1920 × 1080

```text
┌────────────────────────── 1920 ──────────────────────────┐
│ Chat studio                                header 64    │
├──────── 400 ────────┬──────────────── 1520 ──────────────┤
│ scroll area 936     │ Channel [____________] Sample chat │ 72
│ Skin gallery       ├────────────────────────────────────┤
│ 2 × 5 cards        │ 24 px inset                        │
│ Font               │ ┌─────── stage 1472 × 828 ───────┐ │
│ Text & Colors      │ │                                │ │
│ Border             │ │        transparent stage       │ │
│ Background …       │ │ chat stack                     │ │
├────────────────────┤ └────────────────────────────────┘ │
│ Copy URL | Reset   │ source size + transparency caption│
└──── footer 80 ─────┴────────────────────────────────────┘
```

Same 1280 × 720 source, now scaled to 1472 × 828 (1.15); 22 px text appears 25.3 px. This makes identical source settings comparable on both displays. Stage top remains y=160. Do not serialize editor preview scale. On shorter displays fit the stage to BOTH width and available height with uniform scaling, never clipping. Below 900 px, stack the preview above the rail; allow document scrolling and keep the action footer sticky. At 320 px, gallery is still two columns, toolbar wraps, controls remain at least 40 px tall. Mockup app composition is followed by a separate specimen sheet and therefore permits document scrolling at desktop sizes too.

## Controls and behavior for the builder

- Gallery selection replaces appearance/layout/animation keys, including name format and badges. Preserve `channel` and all four filter keys. Loading a copied URL uses every serialized key. Mark the selected card with a border plus check; after an appearance edit label it “Clean · Modified” (or the originating skin). Track that label only in editor state. Each card uses a one-line live sample driven by its own preset.
- Font: searchable Google Fonts picker plus system font options; size, available weight and line height. Only request selected fonts in production; the design sheet loads all sample families. Pixelify Sans and VT323 have intentionally limited weight choices. Fallback: monospace for Terminal/Block Craft/Retro RPG, sans-serif otherwise. Wait for fonts before measuring preview. Font loading failure shows a small editor notice, not an overlay notice.
- Text & Colors: fixed/Twitch username color toggle, fixed fallback swatch, message and system colors, editable name format with token help, show badges, outline width/color and shadow enabled/color/opacity/blur. Badge fills do not change name/text by role; role colors are specified in the round 2 extension below.
- Border: style, color, thickness, corner radius. Zero thickness removes the frame. Pixel style disables radius with “Pixel frames use square corners.” Background: color, opacity and message/panel scope. Panel scope uses one wrapper; message scope styles each row independently. Background opacity never fades text or borders.
- Layout: horizontal/vertical padding, message spacing, max messages, lifetime (Never checkbox writes 0), newest at top/bottom, left/center/right alignment, stack width and edge inset. Animation: entrance and duration. Filters: hide commands, hide listed bots with editable comma-separated list, hide links. Invalid numeric/text input retains the last valid preview and displays inline guidance; clamp valid numeric values to schema ranges on commit.
- Copy generates the actual overlay page URL with base64url UTF-8 JSON in the hash; include all setting keys. Button becomes “Copied” for 2 seconds with a polite status announcement. If clipboard fails, reveal a selectable URL and “Copy this URL manually.” Disable copy only while channel is empty/invalid, with “Enter a channel to create your overlay URL.” Preview still works with samples.
- Reset restores Clean defaults, retaining channel and filters; label/help: “Reset appearance to Clean”. No confirmation dialog. Serialize no arbitrary CSS. The named border recipe is the only customization mechanism in v1.
- Use real labels, fieldsets, native input semantics and keyboard-operable disclosures. Gallery is a named radio group with arrow-key selection. Selected, modified and connection state must not depend on color alone. Respect reduced motion (all entrances/exits become instant). The mockup provides semantic buttons and labels but deliberately does not simulate application actions.

## Shared settings contract

`skins.json` envelope: `schemaVersion: 1`, `defaultSkinId: "clean"`, and `skins: [{id, name, settings}]`. IDs are stable machine identifiers; names are display-only generic names. Settings below are the exact full URL object and every preset's `settings` shape. No other hidden skin-specific values. Defaults are Clean. All lengths are source CSS px. Colors are six-digit hex; alpha is separate. An optional trusted `borderCSS` field on a preset would be design-time only, never accepted from a URL; this package needs none because all recipes are shared.

For URL decoding, merge known valid keys over defaults, discard unknown keys, validate enums and types, clamp finite numeric values, and fall back per key on invalid values. Unsupported schema versions use defaults with a visible editor notice. Never evaluate formatting tokens, CSS, or HTML from a URL. Name/channel substitutions and messages are text nodes. System notices omit badges and the name prefix. Connection failures are editor status; do not insert noisy reconnect notices into a stream.

| Key | Type | Clean default | Range / contract |
| --- | --- | --- | --- |
| `schemaVersion` | integer | `1` | Exactly 1; migration discriminator. |
| `channel` | string | `""` | 0–25 ASCII letters, digits or underscore; lowercase, no leading #. |
| `fontFamily` | string | `"DM Sans"` | Google Fonts family name, 1–80 characters; or system-ui, sans-serif, serif, monospace. Presets use Google Fonts only. |
| `fontSize` | integer | `22` | 12–48 px; message, name and system text share this size. |
| `fontWeight` | integer | `500` | 400, 500, 600, 700; only offer weights the selected font provides. |
| `lineHeight` | number | `1.45` | 1.1–2.0, step 0.05; unitless. |
| `textColor` | color | `"#F2F5FA"` | Opaque #RRGGBB. |
| `nameColorMode` | enum | `"fixed"` | fixed / twitch; fixed is also fallback for missing Twitch colors. |
| `nameColor` | color | `"#A9CAFF"` | Opaque #RRGGBB. |
| `systemColor` | color | `"#AEBBD0"` | Opaque #RRGGBB; notices and connection messages only. |
| `nameFormat` | string | `"{name}:"` | 1–80 characters; exactly one {name}; optional {channel}; literal punctuation allowed. Message follows one space after this prefix. |
| `showBadges` | boolean | `true` | true / false; badges precede the name prefix. |
| `outlineWidth` | number | `0` | 0–2 px, step 0.5; text outline only. |
| `outlineColor` | color | `"#000000"` | Opaque #RRGGBB. |
| `shadowEnabled` | boolean | `true` | true / false; text shadow only. |
| `shadowColor` | color | `"#000000"` | Opaque #RRGGBB. |
| `shadowOpacity` | number | `0.65` | 0–1, step 0.05. |
| `shadowBlur` | integer | `3` | 0–12 px; x offset 0, y offset 1 px. |
| `borderStyle` | enum | `"none"` | none / line / double / corners / bevel / pixel; see recipes. |
| `borderColor` | color | `"#7487A1"` | Opaque #RRGGBB. |
| `borderWidth` | integer | `0` | 0–4 px; 0 disables all frame layers. |
| `backgroundColor` | color | `"#111C2E"` | Opaque #RRGGBB; alpha controlled separately. |
| `backgroundOpacity` | number | `0.55` | 0–1, step 0.05; never set opacity on text/container. |
| `backgroundScope` | enum | `"message"` | message / panel; panel draws one frame around the entire stack. |
| `cornerRadius` | integer | `6` | 0–24 px; pixel forces 0, other styles respect this value. |
| `paddingX` | integer | `12` | 0–32 px per side, inside the frame. |
| `paddingY` | integer | `8` | 0–24 px per side, inside the frame. |
| `messageSpacing` | integer | `8` | 0–24 px; gap between messages. |
| `maxMessages` | integer | `8` | 1–30; remove oldest on overflow. |
| `messageLifetime` | integer | `30` | 0 (Never), or 5–180 seconds; 0 disables timed removal. |
| `direction` | enum | `"bottom"` | bottom / top; edge where newest messages appear. |
| `alignment` | enum | `"left"` | left / center / right; both stack items and text alignment. |
| `overlayWidth` | integer | `480` | 240–960 px; cap at available source width minus 2 × edgeInset. |
| `edgeInset` | integer | `20` | 0–64 px from all source edges. |
| `animationIn` | enum | `"fade"` | none / fade / slide / pop. |
| `animationDuration` | integer | `180` | 80–500 ms, step 10; ignored for none. |
| `hideCommands` | boolean | `true` | true / false; trim leading whitespace then hide messages beginning !. |
| `hideBots` | boolean | `true` | true / false; compares exact lowercase usernames against botNames. |
| `botNames` | string[] | `["nightbot", "streamelements"]` | 0–50 unique lowercase usernames; each 1–25 ASCII letters, digits or underscore; UI uses comma-separated text. |
| `hideLinks` | boolean | `false` | true / false; remove entire messages containing http://, https:// or www. (case-insensitive). |

## Rendering and frame recipes

Canvas is always transparent in the actual overlay; checkerboard is an editor-only transparency indicator. Stack width is `min(overlayWidth, sourceWidth - 2 × edgeInset)`. Place stack at top/bottom according to direction and horizontally according to alignment. Rows fill the stack width, wrap long words with `overflow-wrap:anywhere`, and use `min-width:0`. Newest-at-bottom orders oldest to newest; newest-at-top reverses that order. On height overflow discard oldest complete rows, not partial lines. In panel mode padding belongs to the wrapper, not every row; in message mode padding belongs to each row. Gap is always messageSpacing.

Name and system font size/weight equal message size/weight; color and punctuation differentiate them. Badge size is 0.65em square with 0.2em inline gap; accessible labels “Moderator” and “Subscriber”. Use simple neutral outline diamonds with M/S letters in the mockup; production can use original CSS/SVG shapes. Emote images/placeholder are 1.25em square, inline middle, with alt text and no influence on name formatting. The sample's `:wave:` placeholder is typographic, not a proprietary emote. Shadow is `0 1px shadowBlur rgba(shadowColor, shadowOpacity)` when enabled. Outline is a text-only stroke with `paint-order:stroke fill`; do not apply a stroke to badge or emote elements. No container/drop shadows.

For each framed element set `box-sizing:border-box; position:relative; isolation:isolate`, background rgba, radius and padding from settings. Let `--b` be borderWidth px and `--bc` borderColor. All ornament is pointer-events:none and fits INSIDE the element's border box. Padding is content padding in addition to allocated border width.

| borderStyle | Exact CSS recipe |
| --- | --- |
| none | `border:0`; no pseudo-elements. |
| line | `border:var(--b) solid var(--bc)` |
| double | Outer solid border width b; `::after {position:absolute;inset:calc(var(--b) + 2px);border:var(--b) solid var(--bc);border-radius:inherit;content:""}`. Increase effective content padding by b + 2 px to keep text off inner line. |
| corners | Base solid border width b; `::after` at inset 2px uses eight linear gradients (horizontal and vertical line at each corner), all borderColor, line thickness b, length 12px, no-repeat. No SVG or asset needed. |
| bevel | Solid b borderColor; top/left border use `color-mix(in srgb, var(--bc), white 28%)`; bottom/right use `color-mix(in srgb, var(--bc), black 40%)`. Fallback to solid borderColor. |
| pixel | Solid b borderColor, radius 0, `box-shadow:inset var(--b) var(--b) 0 #ffffff33,inset calc(-1 * var(--b)) calc(-1 * var(--b)) 0 #00000066`; add b to content padding for inset steps. CSS geometry only. |

Use `mockup.html`'s `.frame-*` rules as the literal recipe reference. `borderWidth=0` switches to `.frame-none` regardless of selected recipe. Frames/backgrounds are static in panel scope; animate incoming rows only. Fade: opacity 0→1; slide: opacity 0→1 plus translateY(+10px→0) for bottom, −10px→0 for top; pop: opacity 0→1 and scale(.96→1), origin aligned to the row's anchor. All use `cubic-bezier(.2,.7,.2,1)` over animationDuration. None is immediate. Round 2 adds the bounded text and ambient effects specified below. Lifetime timer starts on arrival; when expired, fade for 160 ms then remove; 0 never expires. Max-message and height overflow removal is immediate. Preview/overlay use the same renderer and CSS.

## Skin specifications

The following records spell out every visual value; the JSON additionally repeats the common connection, filter and capacity defaults for each. `{name}` is the sender display name. Only generic names appear in UI. All font families below are Google Fonts; no logos, game art, image textures, trademarked display fonts or game titles are used. Backgrounds and frames are entirely CSS. The reference palette assumes no particular stream footage; opacity and colors remain editable.

### Guild Chat (`guild-chat`)

- Typography: **Lato**, 22 px, weight 400, line-height 1.45; names and system text use the same metrics.
- Text **#72EC99**, fixed name **#A1FFB7**, system **#E3C885**. Name format `[Guild] [{name}]: text`. Badges shown; role does not change text styling.
- Background **#0C1915**, opacity **0.8**, scope **panel**. Frame **corners**, 1 px **#BDA363**, radius 2 px; use shared recipe above.
- Outline 0 px **#000000**. Text shadow enabled: **#000000**, alpha 0.65, blur 3 px, offset 0/1 px. No frame shadow except pixel recipe's inset steps.
- Padding 14 px vertical / 16 px horizontal; row gap 7 px. Stack 480 px, edge inset 20 px; left aligned, newest at bottom; max 8, lifetime 30 seconds.
- Entrance **fade**, 180 ms.

### Fantasy MMO (`fantasy-mmo`)

- Typography: **Noto Sans**, 21 px, weight 400, line-height 1.45; names and system text use the same metrics.
- Text **#EEF0FA**, fixed name **#9EDCEB**, system **#D5C2F5**. Name format `[Party] {name}: text`. Badges shown; role does not change text styling.
- Background **#111527**, opacity **0.8**, scope **panel**. Frame **double**, 1 px **#ACB9D6**, radius 3 px; use shared recipe above.
- Outline 0 px **#000000**. Text shadow enabled: **#000000**, alpha 0.65, blur 3 px, offset 0/1 px. No frame shadow except pixel recipe's inset steps.
- Padding 14 px vertical / 16 px horizontal; row gap 6 px. Stack 480 px, edge inset 20 px; left aligned, newest at bottom; max 8, lifetime 30 seconds.
- Entrance **fade**, 200 ms.

### Block Craft (`block-craft`)

- Typography: **Pixelify Sans**, 24 px, weight 400, line-height 1.35; names and system text use the same metrics.
- Text **#F0F0F0**, fixed name **#8BE682**, system **#FFDF75**. Name format `<{name}> text`. Badges shown; role does not change text styling.
- Background **#414141**, opacity **0.8**, scope **message**. Frame **pixel**, 2 px **#909090**, radius 0 px; use shared recipe above.
- Outline 1 px **#000000**. Text shadow enabled: **#000000**, alpha 1, blur 0 px, offset 0/1 px. No frame shadow except pixel recipe's inset steps.
- Padding 8 px vertical / 12 px horizontal; row gap 4 px. Stack 480 px, edge inset 20 px; left aligned, newest at bottom; max 8, lifetime 30 seconds.
- Entrance **none** (duration ignored).

### Old-School MMO (`old-school-mmo`)

- Typography: **Roboto Slab**, 21 px, weight 500, line-height 1.5; names and system text use the same metrics.
- Text **#FFE579**, fixed name **#FFF3B3**, system **#FFBD85**. Name format `{name}: text`. Badges shown; role does not change text styling.
- Background **#35281B**, opacity **0.95**, scope **panel**. Frame **bevel**, 3 px **#B29662**, radius 0 px; use shared recipe above.
- Outline 0 px **#000000**. Text shadow enabled: **#000000**, alpha 0.8, blur 0 px, offset 0/1 px. No frame shadow except pixel recipe's inset steps.
- Padding 14 px vertical / 16 px horizontal; row gap 5 px. Stack 480 px, edge inset 20 px; left aligned, newest at bottom; max 8, lifetime 30 seconds.
- Entrance **none** (duration ignored).

### Battle Arena (`battle-arena`)

- Typography: **Barlow**, 22 px, weight 500, line-height 1.45; names and system text use the same metrics.
- Text **#E0E9ED**, fixed name **#83D7EC**, system **#E5C881**. Name format `[Team] {name}: text`. Badges shown; role does not change text styling.
- Background **#0B2029**, opacity **0.85**, scope **panel**. Frame **corners**, 2 px **#4C9BAA**, radius 0 px; use shared recipe above.
- Outline 0 px **#000000**. Text shadow enabled: **#000000**, alpha 0.65, blur 3 px, offset 0/1 px. No frame shadow except pixel recipe's inset steps.
- Padding 14 px vertical / 16 px horizontal; row gap 6 px. Stack 480 px, edge inset 20 px; left aligned, newest at bottom; max 8, lifetime 30 seconds.
- Entrance **slide**, 180 ms.

### Battle Royale (`battle-royale`)

- Typography: **Barlow Condensed**, 24 px, weight 600, line-height 1.3; names and system text use the same metrics.
- Text **#FFFFFF**, fixed name **#FFE099**, system **#B7D8F0**. Name format `[Squad] {name}: text`. Badges shown; role does not change text styling.
- Background **#182838**, opacity **0.85**, scope **message**. Frame **bevel**, 2 px **#7DABC2**, radius 2 px; use shared recipe above.
- Outline 0.5 px **#000000**. Text shadow enabled: **#000000**, alpha 0.65, blur 2 px, offset 0/1 px. No frame shadow except pixel recipe's inset steps.
- Padding 9 px vertical / 14 px horizontal; row gap 6 px. Stack 480 px, edge inset 20 px; left aligned, newest at bottom; max 8, lifetime 30 seconds.
- Entrance **slide**, 160 ms.

### Retro RPG Dialog Box (`retro-rpg`)

- Typography: **VT323**, 28 px, weight 400, line-height 1.2; names and system text use the same metrics.
- Text **#FFFFFF**, fixed name **#FFF0A0**, system **#B7DCFF**. Name format `{name}: text`. Badges shown; role does not change text styling.
- Background **#162B83**, opacity **0.95**, scope **panel**. Frame **double**, 2 px **#F0F4FF**, radius 5 px; use shared recipe above.
- Outline 0 px **#000000**. Text shadow enabled: **#000000**, alpha 1, blur 0 px, offset 0/1 px. No frame shadow except pixel recipe's inset steps.
- Padding 16 px vertical / 18 px horizontal; row gap 8 px. Stack 480 px, edge inset 20 px; left aligned, newest at bottom; max 8, lifetime 30 seconds.
- Entrance **none** (duration ignored).

### Terminal (`terminal`)

- Typography: **IBM Plex Mono**, 20 px, weight 400, line-height 1.5; names and system text use the same metrics.
- Text **#98F5BA**, fixed name **#C2FFDB**, system **#78B991**. Name format `{name} > text`. Badges shown; role does not change text styling.
- Background **#08140E**, opacity **0.95**, scope **panel**. Frame **line**, 1 px **#377C53**, radius 0 px; use shared recipe above.
- Outline 0 px **#000000**. Text shadow disabled: **#000000**, alpha 0.65, blur 3 px, offset 0/1 px. No frame shadow except pixel recipe's inset steps.
- Padding 14 px vertical / 16 px horizontal; row gap 6 px. Stack 480 px, edge inset 20 px; left aligned, newest at bottom; max 8, lifetime 30 seconds.
- Entrance **none** (duration ignored).

### Bubble Chat (`bubble-chat`)

- Typography: **Nunito Sans**, 22 px, weight 600, line-height 1.4; names and system text use the same metrics.
- Text **#27304B**, fixed name **#5A3899**, system **#525D76**. Name format `{name}: text`. Badges shown; role does not change text styling.
- Background **#F1EEFF**, opacity **0.95**, scope **message**. Frame **line**, 1 px **#D1C5ED**, radius 20 px; use shared recipe above.
- Outline 0 px **#000000**. Text shadow disabled: **#000000**, alpha 0.65, blur 3 px, offset 0/1 px. No frame shadow except pixel recipe's inset steps.
- Padding 12 px vertical / 16 px horizontal; row gap 10 px. Stack 480 px, edge inset 20 px; left aligned, newest at bottom; max 8, lifetime 30 seconds.
- Entrance **pop**, 220 ms.

### Clean (`clean`)

- Typography: **DM Sans**, 22 px, weight 500, line-height 1.45; names and system text use the same metrics.
- Text **#F2F5FA**, fixed name **#A9CAFF**, system **#AEBBD0**. Name format `{name}: text`. Badges shown; role does not change text styling.
- Background **#111C2E**, opacity **0.55**, scope **message**. Frame **none**, 0 px **#7487A1**, radius 6 px; use shared recipe above.
- Outline 0 px **#000000**. Text shadow enabled: **#000000**, alpha 0.65, blur 3 px, offset 0/1 px. No frame shadow except pixel recipe's inset steps.
- Padding 8 px vertical / 12 px horizontal; row gap 8 px. Stack 480 px, edge inset 20 px; left aligned, newest at bottom; max 8, lifetime 30 seconds.
- Entrance **fade**, 180 ms.

## Review and implementation acceptance

Open `design/mockup.html` in a browser with internet access for Google Fonts. It contains no JavaScript; gallery, buttons and fields are visual samples. Font/network fallback can change wrapping. Resize to 1280 × 720 and 1920 × 1080 to inspect the layout; the source stage uses matching container-scaled typography. Scroll below the editor for full-size specimens; each has exactly five rows including a moderator, a subscriber, one emote placeholder and a system notice. The static controls show Clean values.

Builder acceptance: selecting each preset yields the corresponding specimen at source scale; overriding every setting works in both preview and overlay; panel frames are not repeated per message; URL round-trip reproduces appearance, channel and filters; no checkerboard or editor chrome leaks into OBS. At both target sizes the action footer stays visible and settings scroll independently. Verify long usernames, long links, emoji and multi-line messages; reduced motion; keyboard selection; filter exclusions; copy failure and font fallback. Round 2 adds role colors and mention highlights; custom CSS, accounts, alert integrations and third-party emote services remain out of scope.


## Round 2 ? expressive skins, restrained runtime

This extension supersedes conflicting round 1 animation, gallery, role-color and schema rules. The application is not changed by this package. Existing ten presets retain their visual settings; new effect defaults are off. Guild Chat remains the reference for readable, atmospheric panel styling. Keep the slate editor tokens, left alignment, 400 px rail and responsive stage from round 1. Spend color and movement inside samples rather than on editor chrome.

### Gallery and controls

Use three labeled disclosure groups in the same scroll area, two columns with 8 px gaps; cards become 172 ? 100 px to fit a title and a 44 px sample. All groups start expanded. Keep one radio selection across groups, roving focus and arrow keys across visible cards; category headings are not choices. Categories are browsing metadata, not exclusive claims about a skin's capabilities. Exactly 22 cards, with no duplicates:

- **Game styles (16):** Guild Chat, Fantasy MMO, Block Craft, Old-School MMO, Battle Arena, Battle Royale, Retro RPG Dialog Box, Cyber City, Arcade Cabinet, Space Command, Monster Trainer, Dungeon Crawler, Cozy Farm, Horror Survival, Hero Shooter, Kart Racer.
- **Animated (2):** Terminal, Vaporwave. Terminal is the restrained baseline for this collection; its default remains static.
- **Colorful (4):** Bubble Chat, Clean, Candy Pop, Rainbow Border. Clean is the neutral baseline.

Each card uses its preset's typography, frame and effects. Play entrance once on visibility, and replay on focus/hover; ongoing effects run only while visible. Static presets remain static. The review sheet loops short entrances every eight seconds so they can be inspected without application logic; production must not loop message entrances. Card text is decorative beside its accessible skin name. No live-region announcements for samples.

Keep the original control order. Text & Colors adds Name effect, two gradient swatches (shown only for gradient), Text effect, Typewriter duration, Use role colors with four role swatches, and Highlight channel mentions with its swatch. Border adds Effect, Secondary effect color and Cycle duration (seconds; helper: ?Higher values move more slowly?). Background adds Treatment, Secondary color, Effect and Ambient detail. Animation adds bounce, zoom, glitch and Reduce motion. Hide irrelevant controls without resetting their stored values. A persistent note beside the toggle reads ?System reduced motion is always respected.? Skin changes and Reset preserve the user's reduceMotion value, channel and filters; all other appearance keys are replaced. URLs serialize reduceMotion.

### Version 2 settings contract

Envelope is now `{schemaVersion:2, defaultSkinId:"clean", skins:[{id,name,category,settings}]}`. Category is one of the three exact labels above; it is not a URL setting. Every settings object is complete. All round 1 keys remain; `schemaVersion` becomes integer 2. Decode version 1 by validating its existing keys, merging the following inert defaults and setting version 2. Missing version means version 1. Unknown future versions use Clean and an editor notice. Invalid new values fall back per key; never accept CSS or HTML. Defaults below are the actual Clean record.

| Key | Type | Default | Range / contract |
| --- | --- | --- | --- |
| `borderEffect` | enum | `none` | none / glow / pulse / animatedGradient / rainbowCycle |
| `borderEffectSpeed` | number | `6` | 2?20 seconds per cycle, step 0.5; ignored for none/glow |
| `borderEffectColor` | color | `#E5A9FF` | #RRGGBB; second stop for animatedGradient; first is borderColor |
| `nameEffect` | enum | `none` | none / rainbow / gradient / glow |
| `nameGradientColor1` | color | `#A9CAFF` | #RRGGBB; first gradient stop |
| `nameGradientColor2` | color | `#E5A9FF` | #RRGGBB; second gradient stop |
| `textEffect` | enum | `none` | none / typewriter / wave / modShake |
| `typewriterDuration` | integer | `700` | 200?1500 ms, step 50; whole message reveal duration |
| `animationIn` | enum | `fade` | none / fade / slide / pop / bounce / zoom / glitch |
| `animationDuration` | integer | `180` | 80?500 ms, step 10; ignored for none |
| `backgroundEffect` | enum | `none` | none / scanlines / gradientDrift / sparkles |
| `backgroundSecondaryColor` | color | `#273B59` | #RRGGBB; second gradient/confetti color |
| `backgroundTreatment` | enum | `solid` | solid / gradient / rainbow / boards / confetti; CSS geometry only |
| `ambientEffect` | enum | `none` | none / scan / torch / flicker; separate from message text |
| `roleColorsEnabled` | boolean | `false` | true / false |
| `broadcasterNameColor` | color | `#FFB7A5` | #RRGGBB |
| `modNameColor` | color | `#97E8B2` | #RRGGBB |
| `vipNameColor` | color | `#E6B0FF` | #RRGGBB |
| `subNameColor` | color | `#FFE095` | #RRGGBB |
| `mentionHighlightEnabled` | boolean | `false` | true / false |
| `mentionHighlightColor` | color | `#F4D38D` | #RRGGBB; 3 px inline-start marker plus 12% tint on mentioned row |
| `reduceMotion` | boolean | `false` | true / false; OR with prefers-reduced-motion: reduce |
| `borderStyle` | enum | `none` | original none / line / double / corners / bevel / pixel, plus hud / slab |

Role resolution: broadcaster > moderator > VIP > subscriber > ordinary. When enabled, a recognized role's name color takes precedence over Twitch/fixed color and over gradient/rainbow name effects. Glow can still use that resolved role color. Otherwise rainbow replaces the name color, gradient uses the two swatches, glow uses the resolved Twitch/fixed color. Badges remain recognizable independently. System rows receive neither role effects nor mentions. Mention matching uses case-insensitive exact channel tokens with optional @, bounded by non-username characters (ASCII letters/digits/underscore are username characters); empty channel never matches. Inspect message text, not emote URLs. Preserve message foreground color and reserve marker space on all rows to avoid a layout jump.

### Frame, color and motion recipes

Frame and effects are independent, reusable settings: no renderer branches on skin IDs. hud uses a thin base line and four 16 px diagonal corner brackets at inset 5 px; reserve 16 px minimum internal padding. slab uses a 4 px orange inline-start stripe and white 10 px corner wedges, CSS linear gradients; reserve 16 px padding so angled ornament never clips text. Zero borderWidth or borderStyle none disables border effects. For panel scope effects attach once to the panel; entrance and text effects attach only to rows. Decorative layers never intercept input or cover glyphs.

Boards: flat brown background with 1 px horizontal seams every 32 px and inset bevel; no grain image. Confetti: alternate backgroundColor and backgroundSecondaryColor by visible row index, with a static cream-to-mint gradient on every third row (panel scope uses that gradient once). Rainbow treatment: pastel #FFD2E6, #FFF1BA, backgroundSecondaryColor, #DCCBFF over 135 degrees. Gradient treatment uses backgroundColor and backgroundSecondaryColor at 135 degrees. Apply backgroundOpacity to background layers only.

Border glow uses a static inset 8 px glow; pulse varies a separate glow layer's opacity .35?.7?.35, never text opacity. animatedGradient crossfades two reversed two-stop border layers; rainbowCycle crossfades two offset rainbow border layers. Keep the center transparent using a mask with a solid border fallback. No rotating full-size canvases or animated blur. Names cycle through #FFB4D9, #FFE49A, #A0F1BE, #9DE8FF, #D7BEFF in 8 seconds; use dark counterparts #8A285C, #775800, #22633B, #165A78, #58388F on light backgrounds. Name gradient is static, glow is static (4 px maximum). If background-clip text is unsupported, use the resolved solid name color.

Scanlines are a static repeating-linear-gradient of 1 px black at 8% alpha every 4 px, behind content. Gradient drift crossfades two reversed gradient layers over 16 seconds. Sparkles are at most three CSS diamond marks inside the row's end padding, opacity and scale only, 600 ms once per arrival. Scan is a 1 px cyan decorative line, translating along the frame edge over 6 seconds; never sweep across glyphs. Torch is an amber inset glow whose opacity changes .25/.38/.29/.4/.25 over 3.8 seconds with soft interpolation. Horror flicker changes only the dim red border/glow layer .75?.88?.8?.9?.75 over 5 seconds; text stays fully legible, no blackouts or strobing.

Entrance runs on an outer row, text effect on an inner body; effects must not overwrite each other's transform animation. Bounce: translateY(8px), then -3px at 60%, then 0. Zoom: scale(.9)?1 and opacity 0?1. Glitch: translateX(-2px/+2px/-1px/0), no text copies, flashes or infinite jitter. Hero Shooter uses the existing slide with 120 ms duration. Wave is one whole text-body translateY(0/-3px/0) over 350 ms, not per-letter sine waves. modShake is one translateX(0/-2px/2px/0) over 240 ms only when moderator badge is present, not merely because role colors are enabled. Other senders remain still.

Typewriter reveals actual grapheme clusters with CSS stepped opacity and bounded animation-delay, with the final layout reserved from arrival. Segment once on insertion, maximum 160 animated graphemes, reveal the remaining tail together at the duration endpoint. Emotes are atomic units; their alt text is not split. Maintain an accessible unsplit message and aria-hide decorative glyph spans. Never animate width/height or force single-line clipping in production. The sheet uses a stepped clip reveal on a wrapping body to demonstrate pacing without JavaScript; the builder must implement grapheme reveal for true multiline typing. Lifetime starts at arrival as before; effects do not extend it.

### Reduced motion and long-session budget

Effective reduce motion = system preference OR toggle. Disable all entrance, exit, typewriter, wave, shake, scan, flicker, glow pulse, rainbow cycling, gradient drift and sparkles. Show final text immediately. Keep static gradients, scanlines, frames and modest static glow. Remove transforms and clipping along with animation; do not use a near-zero-duration loop. Toggling off never replays old message entrances. System preference cannot be overridden by the toggle. The review sheet includes a working CSS-only Reduce motion checkbox; its other settings remain visual samples.

CSS keyframes only: no requestAnimationFrame, per-character timers, canvas, GIF/video textures, animated filters or layout animation. Keyframes may run continuously only on decorative frame/background layers and names. Cap at 30 rendered messages, no permanent will-change; at most two continuous decorative layers per framed surface and three transient sparkle marks per incoming row. Pause offscreen gallery cards with visibility observation and pause all samples on hidden document; event-driven observation is permitted, animation loops are not. Remove expired nodes and their animations. Retain original maximum-message/height eviction. Production loads only active fonts; the review sheet deliberately loads every sample family.

### New preset direction

Exact colors, metrics, effect selections and durations are authoritative in skins.json. All twelve reuse the Google Fonts already loaded in round 1, avoiding a new font request for each novelty.

| Skin | Distinctive treatment | Motion |
| --- | --- | --- |
| Cyber City | Magenta frame, cyan names, deep plum, Barlow | 4 s glow pulse; 180 ms glitch |
| Arcade Cabinet | Pixelify Sans, purple pixel frame, static CRT scanlines | 8 s rainbow names; 200 ms zoom |
| Space Command | Cyan HUD brackets on navy, Barlow | 6 s edge scan; slide |
| Monster Trainer | VT323, opaque ivory, 4 px dark rounded border | 700 ms typewriter |
| Dungeon Crawler | Roboto Slab on grey stone-colored bevel | Warm 3.8 s torch glow |
| Cozy Farm | Nunito Sans cream lettering, brown CSS board seams | Soft 400 ms bounce |
| Horror Survival | IBM Plex Mono, readable blood-red lettering on near-black | 700 ms typewriter; faint 5 s border flicker |
| Hero Shooter | Barlow Condensed, orange stripe and white angled wedges | Fast 120 ms slide |
| Kart Racer | Nunito Sans, yellow/mint pills, dark ink | 400 ms bouncy entrance |
| Candy Pop | Pastel rainbow bubbles, dark plum ink | Pop plus 600 ms sparkles |
| Vaporwave | Pink/teal gradient, pink-to-mint names | 16 s slow background drift |
| Rainbow Border | Clean light type on navy, rainbow outline | 8 s border cycle; 200 ms zoom |

### Round 2 acceptance

Review all 22 cards and 22 five-row specimens, including multi-line bodies and emote placeholders. The extra effect strip demonstrates wave, moderator shake, glow and animated gradient even though they are not defaulted together in a skin. Verify both reduced-motion sources reveal complete text and freeze every decorative layer. Inspect at 320, 1280 and 1920 px widths. Builder checks: URL v1 migration, v2 round-trip of every key, role priority with multiple badges, mention boundaries and empty channel, overriding every effect on every frame, max-capacity eviction and no font/layout shifts during typewriter. Profile an hour-long OBS session separately: this design sheet is not proof of runtime CPU performance.

## Round 9: Premium site + Docs

### Direction and reference study

The Miko references earn their premium feel through clear material hierarchy: a thin announcement band, an expansive glass-like hero, a luminous product focal point, controlled accent colors, and generous negative space. Rounded surfaces use fine upper highlights and deep shadows instead of heavy outlines. Large, tightly set type carries the message; restrained supporting text leaves room for product art. Stats and gradient icon tiles make the lower page feel like the same product.

ChatSkins adopts that quality with its own composition: a centered headline above a wide stream monitor, with four real chat treatments orbiting it. This is a stage for the conversation. It does not reproduce Miko's left-copy/right-illustration split or its pink palette. The grid floor appears only beneath the hero art. PRESS START appears once, as an invitation, rather than turning every section into a game menu. Website surfaces stay black and blue; skin specimens retain their authentic palettes.

Initial plan review: an evenly divided split hero would echo Miko too closely and reduce chat to a small illustration. The selected stacked composition gives the monitor enough width for readable messages. Feature tiles remain compact and quiet so the hero is the memorable moment. No fictional community-count or endorsement badge is used.

### Tokens

| Token | Value | Role |
| --- | --- | --- |
| Canvas | `#05070D` | Whole-site background |
| Surface | `#0B1425` | Cards, docs sidebar, editor panels |
| Raised | `#101E34` | Inspectors and layered surfaces |
| Edge | `#23344D` | Quiet 1px border; hover `#3C87E9` |
| Primary | `#2F7BFF` | Selection and gradient start |
| Cyan | `#38BDF8` | Gradient end, focus, sparse highlights |
| Mint | `#82E8CB` | Live dot and Tip callouts only |
| Text | `#F3F7FF` | Headings and primary text |
| Muted | `#A6B6CD` | Body, labels, helpers |
| Action ink | `#031020` | Dark text on blue/cyan primary buttons |
| Warning | `#F2BD73` on `#241C10` | Docs warning only |

Primary gradient: 115deg from blue to cyan. Headline gradient uses lighter `#74A6FF` to cyan for contrast. Glass uses a translucent navy fill with a static radial blue glow behind it, 1px edge and subtle inset upper highlight. No bright glow behind body copy. Hero shadow: `0 0 100px #1361D51C`; raised product shadow: `0 40px 85px #0009`. No full-page animated glow.

Type: Google Fonts **Familjen Grotesk** 400–700 for headlines, logo text and large numbers; **Manrope** 400–800 for body, controls, navigation and documentation. Fallbacks are system sans-serif; code uses Consolas/monospace. Headline desktop 88/95px, mobile 49/53px; page heading 64/69px; section heading 48/52px, mobile 30/34px; card heading 21/25px; body 15/25.5px; docs body 15/28.5px; control 13–15px; helper 12/18px. Headline tracking −.035em. Body lines stay under 65–75 characters. Uppercase is limited to hero eyebrow, stat captions, and monitor metadata.

Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px. Maximum marketing width 1240px, desktop outer gutters 32px, mobile 16px. Section gaps 96px desktop / 64px mobile. Radii: 6px small controls, 10px buttons, 16–18px cards, 32px hero (22px mobile). Do not apply one radius to every component.

### Components and states

- Announcement: 36–40px band, centered link, subtle navy gradient. Exact text: “New: chat-powered skins: let your viewers change your chat”. It links to the relevant docs page. A release gate applies below.
- Navigation: brand, Skins / Customize / Docs / Request, primary Make my overlay. Desktop 88px high. Mobile wraps into brand/action and a full-width link row; no inaccessible hover-only menu.
- Primary action: blue/cyan fill, dark bold text, 10px corners, modest blue shadow. Secondary action: navy surface and 1px edge. Hover strengthens edge, focus uses a 2px cyan outline with offset. Disabled actions retain readable text and expose a reason.
- Eyebrow: 10px bold, pill border, generous letter spacing. Claims must be factual. Use PRESS START on Home and contextual labels elsewhere, not fabricated user numbers.
- Surface: fine blue-grey border, deep shadow, restrained upper highlight. Skin art may contain its own frame colors; website tokens do not override the renderer's palette.
- Stat tile: large Familjen number and small caps caption. Exact claims: 42 skins / 0 logins needed / 1 link for OBS / 100% free.
- Feature tile: 43px gradient icon tile, short heading, two or three lines of explanatory copy. Symbols in specimens are placeholders for original simple line icons; use no third-party logos. Eight tiles, four columns desktop, two mobile.
- Status: mint dot plus text; never color alone. Gallery scores show numeric values as well as labels. Loading gets status text, errors get a useful retry instruction, empty search provides suggested terms.
- Live preview: actual `applyChatStyle` / `createMessage` renderer with `buildSkinPreviewMessages`, never a fabricated chat screenshot. Every preview has a labelled container. Avoid live-region announcements on every sample message.
- Motion: sample refresh/Featured switch every five seconds, bounded node replacement, no animation of card positions. Pause previews is explicit. System reduced motion freezes cycling and renderer effects. Hidden documents and offscreen samples do not update. Floating cards are tilted statically, not continuously bobbing.
- Focus and mobile: keyboard-visible focus, labelled controls, skip link, no text-only hover disclosure. No content hidden behind a fixed CTA. Reflow at 760px; right docs TOC disappears at 1100px. Verify at 360, 390, 768, 1440 and 1920px before implementation signoff.

### Home specification

Order: announcement → navigation → luminous hero → stat tiles → feature grid → Works with strip → setup → FAQ → footer.

Hero headline: “Your stream chat, skinned.” Highlight skinned in the accessible blue/cyan gradient. Pitch: “Turn the conversation into part of your world. 42 expressive skins. Every detail yours. One link to go live.” Actions: Make my overlay / Browse 42 skins / Read the docs. Trust line: “Free · No login · One link · Works in OBS, Streamlabs, Twitch Studio, XSplit, Meld, vMix”. Keep it close to the actions and readable, not in a separate badge farm.

Hero art: central 16:9-ish stream-monitor specimen, original abstract landscape made with CSS, rendered chat over the landscape, live-preview status and selected Featured skin name. Cycle through all catalog entries marked Featured. Four floating mini specimens: Guild Chat, Signature, Retro RPG, Bubble Lift. Keep rotations under 8 degrees. At narrow widths the monitor uses 92% of the hero width and two floating specimens become a row beneath it; the other two are decorative and may disappear. Real skin content is not recolored to fit the website.

Features and copy are in `home9-mockup.html`: Game-style skins, A full editor, MMO chat channels, Your favorite emotes (Twitch + 7TV/BTTV/FFZ), Alerts that belong, Chat-powered skins, Made for gameplay (transparent), Safe, read-only chat. Alerts and audience control copy is a proposed release state, not evidence of implementation.

Works with: text badges only for OBS Studio, Streamlabs Desktop, Twitch Studio, XSplit, Meld Studio, vMix and Lightstream. Lead: “Works with anything with a Browser Source.” Do not imply sponsorship or add third-party logos.

Setup headline and copy: “Meet your new Browser Source. No plugins to install. Works in OBS Studio, Streamlabs, Twitch Studio, XSplit, Meld and any app with a browser/web source.” Ordered steps: Add a Browser Source → Paste your overlay URL → Set 1920×1080 (or 1280×720 for a 720p canvas) → Place ChatSkins above your game capture. Link to the setup guide. FAQ uses native details/summary; footer includes Privacy & safety, Changelog and Request a skin.

### Skins specification

Keep every catalog entry and all existing filters: Featured, Streamer favorites, Game styles, Animated, Colorful. Featured overlaps the category groups and does not increase the total beyond 42. Show current group count and total. Header: “Find your chat energy.” Subhead: “42 original looks. Live previews. Every one is yours to customize.”

Desktop: three-column gallery beside a 310px sticky inspector; at medium width use two gallery columns. At mobile move the inspector below the two-column grid, avoiding tiny four-column cards. Selected cards have a blue edge and `aria-pressed`; all cards remain keyboard reachable. Inspector contains name, catalog tagline, larger rendered sample, Readability / Flair / Motion / Retro scores, Make my overlay and Customize this skin. Selected skin ID is carried to the editor specimen. Pause/resume affects the samples, not the saved skin settings. No paid locks, rarity badges or invented popularity scores.

Production retains the existing use-skin dialog: enter channel or optional Connect with Twitch → complete overlay URL → copy feedback. The specimen's actions lead to the design editor and do not generate production URLs. Keep live previews using the same render functions as the overlay.

### Editor specification

Restyle without reorganizing the existing editing workflow. Preserve the control pane, persistent live preview, Simple/Advanced switch, source-pixel numeric controls, setup progress, copy-link step, reset and saved skins. Use blue active indicators, normal sentence-case labels, navy form surfaces, readable helper text and quiet accordion separators. Remove game-menu corners and heavy decorative rules from the surrounding UI, not from chosen skins.

Keep all sections: Simple mode, part styling, frames, backgrounds, name format, layout, animation/effects, roles/colors, filters, My skins, custom CSS, channels and emotes. Keep preview tests and transparency backdrops. Preserve native select/range/number ergonomics and the current paired sliders/numeric inputs. No 88px marketing headline in the workspace; use a 32–40px functional page title. Put contextual docs links beside section headings, opening the matching docs page without discarding edits.

At desktop preserve the existing pane widths and preview ratio. On mobile stack preview and controls with a compact sticky preview toggle; the copy action must not cover inputs or error messages. Save/Copy labels must make clear whether they save locally or copy a source URL. Fields retain edits after errors. Modified state is visible. Destructive reset stays a deliberate separate action.

`editor9-mockup.html` is a restyled copy of the existing design specimen; its JavaScript stays design-only. Use it to review materials and spacing, not as proof of new controls or URL serialization.

### Request specification

Keep the existing fields, required-state rules, reference input, submission action and success/error flow. Frame the page around a useful idea, not a quest or bounty. Heading: “What should chat look like next?” Support copy: “Tell us the look your community is missing.” Use a readable single-column form, with a quiet adjacent guidance panel on desktop. Explain what a useful reference contains and ask users not to paste private alert links. Keep references as links, not unreviewed remote embeds.

Primary action is Send request; disabled/pending state is Sending…; success says the idea was received, not scheduled. On error retain every field and place the reason beside the submit area. Do not introduce authentication or payments. `request9-mockup.html` preserves the existing design specimen's interactions and adds the shared shell; it does not contact the submission service.

### Docs information architecture and routes

Production entry is `/docs/` (Getting started). Each other Markdown basename maps to `/docs/<basename>/`. The design-only viewer uses `docs-mockup.html#<basename>` and `#<basename>/<heading>` so reviewers can explore every page without building a router. Clean production paths require the builder's routing work; none is added here.

| Group | Pages in reading order |
| --- | --- |
| Start here | Getting started; Add to your streaming app; Choosing a skin |
| Customize | The editor; Simple mode; Part styling; Frames; Backgrounds; Name format; Layout; Animation & effects; Roles & colors; Filters; My skins; Custom CSS |
| Connect & play | MMO chat channels; Emotes; Connect with Twitch; Alerts; Chat-powered skins |
| Guides | Transparent background & gameplay; Troubleshooting |
| Reference | Privacy & safety; Request a skin; FAQ; Changelog |

The streaming-app guide has independently linked headings for OBS Studio, Streamlabs Desktop, Twitch Studio, XSplit, Meld Studio and vMix / others. It includes all requested Browser Source settings and qualifies options that other apps do not expose. Avoid prescribing OBS-specific option labels as universal controls. Twitch Studio copy is conditional on an installed version that supports web layers, not a recommendation to acquire it.

### Docs shell and interactions

Desktop three-column reading layout: 240px left nav, up to 720px article, 180px right TOC, 48px gutters, max 1380px. Sticky 76px top bar contains brand, client-side search, and Make my overlay. Left navigation independently scrolls; active page has blue tint and edge, not color alone. Page order drives both sidebar and previous/next cards. Right TOC lists H2 headings and links to stable anchors with sticky-header offset. Include breadcrumb/group context, one H1, and sensible H2/H3 structure.

Search indexes every page title and H2 heading, case-insensitively. Result shows matching title/heading plus group and page context. Enter opens the first match; arrow keys move through visible results; Escape dismisses. Empty query hides the panel. No-result copy: “No matches. Try ‘emotes’, ‘size’, or ‘frames’.” A query never contacts a server. Search text is escaped before rendering. Production may add H3 indexing and ranking, but must retain title/heading coverage.

Every code or URL block gets Copy. Success changes the label to Copied briefly. If clipboard access fails, select the text and say “Selected — copy manually”. No private real alert URL appears in the specimen. Code blocks scroll internally and do not stretch the document width.

Callouts: Tip is mint/navy; Note is blue/navy; Warning is amber/ink. Each includes its label so color is not the only signal. Keep actionable explanations short and leave full instructions in the surrounding article.

Mobile: replace sidebar with a labelled drawer trigger; expose `aria-expanded` and `aria-controls`. Drawer fits at most 90vw, scrolls independently, closes on navigation, outside click or Escape, and Escape returns focus to the trigger. The specimen uses a nonmodal drawer; a production modal version must make background content inert and trap focus. Hide the secondary TOC before squeezing the article. Search remains at the top. Article padding is 22px. Previous/next cards stack. Direct heading links must retain the selected page.

### Full documentation copy and editorial contracts

All full copy is in **26 Markdown files in `design/docs-content/`**, one per page. Each starts with an outline comment and then the complete article. The viewer embeds the same content via `docs-content-index.js`. `round9-content.py` regenerates the files and index. This is documentation design, not a request to create external documents or production routes.

The MMO guide derives each enabled per-skin channel template directly from `design/skins.json`; it does not invent labels. The explanation matches the current first-matching-rule resolver, separate first-time notice and uppercase threshold. OAuth copy matches `js/twitch-auth.js`: no extra scopes, token used in memory for login lookup, removed from the callback URL, not persisted, revocation attempted. Do not extend “never stored” to future alert/channel-point credentials without verifying their architecture.

Alerts and chat-powered skins contain explicit proposed-experience notes. Proposed audience contract: approved IDs only; separate change/vote permissions; one active choice per eligible voter; ties preserve the current skin; global and per-viewer cooldowns; no queued flood; visible stop control cancels voting, rejects future input and restores a selected safe skin until explicitly resumed. These are design decisions for implementation, not claims about current runtime. Channel-point authorization is separate from the channel-name shortcut. Private alert links need revocation/replacement before this copy can ship.

Changelog is labelled design preview and has no invented shipped date. Remove proposed labels only after behavior has been verified. The requested announcement bar is also release-gated on audience controls shipping. Browser-source settings are a practical baseline; compatibility requires a web-source-capable installed version.

### Deliverables and verification boundary

Required: `home9-mockup.html`, `docs-mockup.html`, `skins9-mockup.html`, this section, and `docs-content/*.md`. Additional review specimens: `editor9-mockup.html`, `request9-mockup.html`. Shared assets: `round9.css`, `round9-workspace.css`, `round9-previews.js`, `round9-docs.js`, `docs-content-index.js`; generation scripts and `ROUND9-HANDOFF.md` document reproducibility.

Review over HTTP from the repository root so preview modules can read the existing renderer. No application files or production routes are changed by this design round. Existing unrelated working-tree edits are out of scope. Syntax and static asset/link checks are performed; headless Chrome could not start because the environment denied Chromium IPC/crash-handler access, so no successful visual screenshot review is claimed. Before build signoff, inspect desktop/mobile screenshots, all 42 live samples, long docs pages, keyboard navigation, reduced motion, clipboard fallback and overflow at narrow widths.

# Round 10: Skins that stand out

Design-only handoff, October 25, 2026. This round supersedes earlier visual recipes for the 28 named treatments below and earlier static-thumbnail rules. It does not build the app. All deliverables and supporting files are inside `design/`. All prior rounds remain intact. Reviewed inputs: the complete historical DESIGN.md, all catalog records/schema contracts, sheetA–E and qa-9-skins.png. Those sheets show repeated rectangular rows, tiny previews and names squeezing bodies into narrow columns. Round 10 makes the object recognizable before its color is recognizable.

## Direction and review plan

**Recognizable at a glance, alive at a second glance.** Retain the Round 9 quiet website palette: Canvas #05070D, Surface #0B1425, Raised #101E34, Text #F3F7FF, Muted #A6B6CD, Cyan #38BDF8. Familjen Grotesk headings and Manrope controls remain the production shell pair; the offline specimen uses Segoe UI. Skin type is independent: rounded humanist for Aurora/Lava/Bubble, condensed signage for Neon/Announcer, serif for Starfall/Ice, mono for Holo/Receipt/Terminal, marker for Sticker. Use named system fonts in this study to avoid network dependencies; their fallback is explicit in JSON. Body 22/31.9 source px; name 20px except Announcer 28px. The mockup uses readable 15–18px samples rather than scaling an entire 480px source into an illegible thumbnail.

```text
Home:   centered headline / three real specimens: Aurora | Glitter Bomb | Holo Foil
Skins:  filter + pause + reduced motion
        two readable card columns              selected skin monitor
        [two messages / name / tagline]        three messages / arrival test
                                               shape / numeric style stats
Phone:  hero specimens stacked; monitor above one-column gallery
```

Plan critique: ten luminous rounded boxes would repeat the owner's complaint. Assign every animated skin a different contour and name hierarchy before choosing motion. A static receipt must still differ from a static ticket when both are grey. Keep surrounding page chrome quiet; no moving card positions or auto-changing selection. Recipe geometry is literal in `round10.css`; the register below names every catalog silhouette for builder comparison. Existing game panels are retained, not silently redesigned.

## Catalog and compatibility

52 total: **12 Streamer favorites, 24 Game styles, 4 Colorful, 12 Animated**. The 10 new IDs are aurora, glitter-bomb, neon-pulse, prism-shift, holo-foil, lava-lamp, electric-storm, starfall, fire-frame, ice-crystal; all have `category: "Animated"`, the existing group field. Terminal and Vaporwave retain their category and are also visually reworked. All 42 existing IDs, names, gallery order, Featured membership and `settings` snapshots remain unchanged. Clean remains the default. No URLs or saved records are rewritten.

`round10Recipe` is the authoritative new design recipe for each changed skin, outside the closed v3 settings schema. It contains silhouette, layout, typography, palette, keyframe names, cycle, animated-layer maximum and reduced-motion behavior. Earlier settings are retained as valid legacy fallbacks; the 10 new entries have complete valid static v3 fallback settings. These fallbacks do **not** reproduce the new design by themselves. New appearance requires builder work: implement reusable silhouette/layout/effect primitives, expose them for editing, extend normalization and the serialization contract together, then regenerate full canonical presets. Do not branch the production renderer on skin IDs or inject this metadata into old closed schemas. Historical full-settings URLs continue to render their stored appearance; an editor `?skin=<existing-id>` still resolves and can select the redesigned catalog look after implementation. Alert designs inherit new static silhouettes only after that renderer exists; never add ambient animation to an alert accidentally.

Stats retain the existing four 1–5 descriptors: readability, flair, motion, retro. They are subjective design descriptors, not performance measurements or contrast certification. New animated looks score motion 5; the 16 basic entrance-only designs score 2; Terminal and Vaporwave score 4. Every changed skin has new tagline and stats in JSON. Runtime marketing counts and the Round 9 hero copy become 52 only when the builder ships the full set.

## Ten signature motions

All text is present from arrival. Effects run behind stable text or exclusively in the edge gutter. In the table, L means simultaneously animated elements **including** transient layers; an SVG with several fixed paths counts as one element only when its parent owns the animation. The shape/layout/type register and JSON provide the companion visual recipes. CSS keyframes in `round10.css` are the exact specimen reference.

| Skin | Palette and signature recipe | Keyframes / timing / L | Reduced-motion appearance |
| --- | --- | --- | --- |
| Aurora | Dark ocean #0C202B; mint/cyan/lilac 3px masked gradient ring on asymmetric arch; static soft 15px low-alpha glow | aurora-flow: background-position 0→100→0%, 14s ease-in-out, infinite; 1 L | Mint/lilac ring frozen at midpoint; static glow |
| Glitter Bomb | Plum #341833 party seal; five fixed sparkle marks across the surface; separate three-point entry burst; opaque text remains in front | glitter-twinkle: opacity .25→.85→.4→.25, scale .98→1→.99→.98, 4.6s; glitter-entry: scale .75→1.1, opacity 0→.85→0, 850ms once; 2 L | A sparse static sparkle field; no entry burst |
| Neon Pulse | Ink-purple #251225 open-ended neon tube, pink #FF8EDB edge; black sender sign | neon-arrive: .3→.8→.45→.9 opacity over 900ms once; then neon-breathe .4→.95→.4 over 3.8s; same layer, 1 L | Steady tube at .6 opacity |
| Prism Shift | Midnight #171B38 faceted prism; rainbow edge and pale rainbow name chip with dark ink | prism-hue: hue-rotate 0→360deg over 12s linear on ring and chip; 2 L; body never filtered | Frozen rainbow edge/chip; readable dark name |
| Holo Foil | Steel #152B37 notched pass with a registration strip; mint/lilac/white translucent specular band | holo-sweep: background-position 100% hold 0–20%, travel to 0% by 75%, hold to 100%, 7s; 1 L | Static foil highlight at edge, no sweep |
| Lava Lamp | Oxblood #361919 organic lozenge; orange and amber radial blobs behind opaque text wells | lava-drift-a: translate(-8%,6%) scale(.9)→(20%,-8%) scale(1.15)→start, 11s; lava-drift-b (6%,-8%) scale(1.1)→(-18%,10%) scale(.9)→start, 14s; 2 L | Two fixed warm blobs; stable kidney shape |
| Electric Storm | Navy #121F38 jagged plate; cool #B9DFFF irregular border light; mod-only SVG bolt cluster | storm-crackle: .25→.75→.3→.65→.25 at 0/18/35/70/85/100%, 5.2s; mod-bolt: opacity 0→.9→0, 950ms once; 2 L | Static crack trace, no bolts; Mod badge remains |
| Starfall | Indigo #191B39 observatory pennant; three small diagonal star trails behind message wells | starfall-travel: translate(-12%,-18%)→(18%,45%), opacity 0→.7→0 between 15–65% of 6s cycle, rest idle; 1 L | Tiny fixed stars, no falling motion |
| Fire Frame | Ember #301A16 hearth; orange #FFC276 flame-tooth edge from a static gradient mask | fire-lick: scaleY .96→1.03→.98→.96, opacity .5→.85→.6→.5 at 0/35/70/100%, 2.8s; 1 L | Fixed crown of flame shapes; no turbulence |
| Ice Crystal | Deep ice #142B3A stepped crystal; pale #BDEFFF edge and translucent frost sheen | frost-sweep: background-position 100→0→100%, opacity .4→.8→.4, 8s; ice-freeze: scaleX .04→1, opacity 0→1, left origin, 700ms once on decorative edge; 2 L | Complete crystal edge immediately; no reveal or shimmer |

Flicker and crackle are restrained edge luminance changes, not full-message flashes. No visibility blackouts, rapid strobe, text shake or repeated entry bolts. Mod bolts require verified message role metadata in production; never infer role from the typed name. The specimen's Mod message button supplies a clearly labeled simulated role. One bolt group per new mod message, no accumulation.

## Basic skin recipes and arrival keyframes

The silhouette register supplies shape + layout + type for each. JSON supplies its ink/surface/accent and tagline. `round10.css` supplies real tails, notch masks, torn edges, folds, perforation, halftone, pips and paper geometry; none are image textures. Reserve 20px content padding at source scale, 28px by cuts/tails and 36px at deep ornament, 16px row gap, and 12px tail/fold safety space. Polaroid reserves a 46px caption foot, Initial Card reserves a 54px medallion gutter. At narrow widths increase height through wrapping; do not shrink type or crop a username. Ticket's name stub stacks above its body to avoid the squeezed name columns visible in sheetA/C. Never clip the message itself to the decorative polygon.

All 16 ordinary basic arrivals are ease-out and one-shot, opacity 0→1 plus the listed transform to identity. Sticky Note ends at its static ±2° tilt. Whole-row entry owns the only animated element; decorative shapes stay still. A static final state is the fallback for every one.

| Skin | Keyframe | Duration | Transform at entry |
| --- | --- | --- | --- |
| Bubble Lift | lift-in | 320ms | translateY(10px) |
| Glass Card | glass-in | 400ms | translateY(4px) |
| Name Tag | tag-in | 280ms | translateX(-10px) |
| Comic Burst | comic-in | 280ms | scale(.94) rotate(-1deg) |
| Pastel Pop | ticket-in | 350ms | translateY(-6px) |
| Esports Slash | slash-in | 200ms | translateX(-16px) |
| Quiet Line | quiet-in | 400ms | none; opacity only |
| Neon Edge | edge-in | 280ms | translateX(6px) |
| Sticker Stack | note-in | 400ms | rotate(-5deg) translateY(-5px) to static tilt |
| Initial Card | pill-in | 300ms | scale(.97) |
| Signal Console | receipt-in | 400ms | translateY(-8px) |
| Announcer | caption-in | 250ms | translateX(-12px) |
| Bubble Chat | cloud-in | 400ms | translateY(5px) |
| Clean | paper-in | 220ms | translateY(3px) |
| Candy Pop | card-in | 350ms | rotate(-3deg) scale(.98) |
| Rainbow Border | photo-in | 380ms | translateY(7px) rotate(2deg) |
| Terminal | terminal-cursor | 2s loop | Small nontext cursor opacity .3→.8→.3; no typing or row entry |
| Vaporwave | tape-drift | 16s loop | Label wash background-position 0→100→0%; no row entry |

## Live showcase behavior

Home hero uses **Aurora, Glitter Bomb and Holo Foil simultaneously**, each with one sample row. No timed skin rotation. Static outer tilts stay under 4°. On mobile stack all three so each effect remains reviewable. Gallery cards contain two genuine DOM samples of their own recipe; side monitor shows three of the selected recipe. Production must share one renderer between overlay, card, hero and monitor; the standalone design renderer demonstrates the new primitives without pretending the current app supports them.

Continuous effects start without hover when their sample intersects the viewport and the document is visible. One IntersectionObserver tracks sample containers (threshold .01, zero root margin); CSS animations are paused outside the viewport. Visibilitychange pauses all hidden-tab motion. No offscreen polling, invisible replacement queue or catch-up replay. Basic entry plays on first visibility only. Selection is deliberate click/Enter/Space, not hover, and persists across filtering; selected marker + aria-pressed supplement color. The monitor is sticky only where enough room exists; on mobile it precedes the cards in visual order. An explicit Replay entrances review button replaces visible samples only; it is not an automatic production timer. New message/Mod message demonstrate arrival in a bounded three-message monitor. These are local samples, not live-region chatter.

Pause previews freezes phase; resume continues phase. Reduced motion is system preference OR review checkbox OR the saved production preference; Resume never overrides it. Reduced motion disables keyframes entirely (not .01ms loops), exposes final text/geometry and suppresses bursts/bolts. Rows inserted while paused show their complete final entrance state. Turning motion back on must not replay old arrivals in production; retain a per-message entered flag, remove entry animation after animationend and on reduction. Ambient loops may restart. The specimen keeps entry-finished markers for this behavior. No animation state is saved in an overlay link.

## Performance, access and builder acceptance

- At most **3 animated elements per message**, including entry, ambient and role effects; these recipes use at most 2. Do not layer legacy arrival/background/name effects underneath them. If custom controls add motion, suppress the lowest-priority ambient layer before exceeding the cap. Keep the existing 30 mounted-message hard limit; effect nodes die with their message. No generated particle DOM, layout animation, per-letter spans, canvas, video, animated SVG turbulence or per-frame JS.
- Animate transform/opacity by preference. Small masked background-position and bounded hue filters are permitted here but can repaint; they are not automatically GPU-cheap. No animated box-shadow, blur, border width, dimensions, padding, clip-path or gradient stops. Prepaint static glows, cap glow extent to 15 source px, masks to the message bounds. No permanent will-change or enormous offscreen gradient planes. Fire deliberately uses a static flame mask instead of runtime turbulence.
- Gallery budget: two rows per card; desktop review max three card columns, monitor three rows, hero three rows. Use IntersectionObserver before starting loops. In production virtualize distant catalog rows and unload unused font families. If profiling misses budget, freeze distant visible cards at a representative frame and state this in the preview; never silently reduce the selected monitor's fidelity.
- Text, role badges and emotes stay unfiltered and fully opaque, except Prism's pale chip + dark name on one hue-filtered layer. Check name contrast through the entire hue range; if custom colors fail, animate chip paint only and put name ink on a separate static child. Backings are deliberately opaque where effects travel. Respect hideFrames and transparentBackground: suppress their corresponding decorative layers without losing text; show existing transparency readability guidance.
- Accessibility target: names/body ≥4.5:1 against their local backing, focus ≥3:1, controls ≥44px, natural wrapping at 320px/200% text/400% zoom. Marker/condensed/display faces are for names, never unreadably tiny bodies. Test font fallback on macOS/Linux as well as Windows. Badges are labeled, initial medallions decorative. SVG ornament aria-hidden and pointer-events:none. No information depends on movement.
- Before shipping profile OBS at 480px chat width in a 1920×1080 Browser Source, 30 mounted rows, ordinary and burst arrivals, for 10 minutes on a representative low-end CPU/iGPU. Record CPU/GPU/frame time relative to the static fallback; target no sustained layout work during idle loops and no dropped stream frames attributable to the overlay. These are acceptance targets, **not measured results**. Check black/white/busy gameplay and both OBS scene visibility settings. Chat ingestion/deadlines remain correct when the visual source is hidden.
- Review all 28 at desktop/mobile, their static fallback, each entry, Electric mod-only bolts, pause/resume, OS preference changes, offscreen/hidden-document pause, long names, emote-only and multiline rows. Confirm 42 old IDs/names/settings survive and all 52 fallback settings validate against the existing schema. Build no production claim from a successful design mockup.

Artifacts: `animated-mockup.html` opens directly from disk; `animated-template.html`, `round10.css`, `round10.py` and `round10-notes.md` are its editable sources. `python design/round10.py` regenerates the mockup, metadata and this appended round, preserving earlier rounds. Do not run historical catalog generators afterward without retaining Round 10 metadata.

### Verification record

Static review passed: 52 unique catalog IDs, all 42 previous IDs/names/settings preserved against HEAD, 28 distinct new recipe silhouettes, complete keyframe references, all taglines/stats present, and embedded JavaScript syntax. All 10 new static fallback settings pass the repository's structural schema checker. Four existing enum mismatches remain in unchanged records: Signature/Hero Quest/Space Station presentation.accent and Old-School Realm nameEffect; these predate Round 10 and need builder schema reconciliation. No claim that the whole legacy catalog validates is made.

Browser capture was attempted with installed headless Chrome. Windows denied Chromium IPC/crash-server access (0x5); no screenshot or successful browser/interaction/OBS test is claimed. Python Playwright is unavailable. Visual execution remains a builder review requirement. Git add failed because `.git/index.lock` creation was permission-denied; the path-limited commit failed because the new files could not be staged. Automatic command policy blocked cleanup of `design/.round10-review/`; that temporary profile and `round10-browser.log` remain as non-deliverable capture residue.


### Complete silhouette register (all 52 skins)

Every changed record has its exact geometry in `round10.css` and layout/type/palette/motion in `round10Recipe`. Retained game worlds keep their historical panel geometry; uniqueness below is mandatory for the 28 Round 10 treatments, not a retroactive redesign of those game worlds.

| Skin / stable ID | Silhouette | Layout and type |
| --- | --- | --- |
| ChatSkins Signature (`chatskins-signature`) | Mint/violet rounded shared panel | Role chips; Chakra Petch + Barlow |
| Bubble Lift (`bubble-lift`) | Deep speech balloon with a real 12px left-pointing tail | Sender on top; body inset from tail; Trebuchet MS / Trebuchet MS |
| Glass Card (`glass-card`) | Transparent glass slide held by two offset opaque corner tabs | Sender in a top tab; body floats on a blue glass slide; Segoe UI / Segoe UI |
| Name Tag (`name-tag`) | Two stacked badge strips; short name tab over wide square body strip | Name tag protrudes left; body starts 18px to its right; Arial Narrow / Arial Narrow |
| Comic Burst (`comic-burst`) | Irregular eight-corner comic panel with offset hard ink shadow | Oversized italic sender; halftone margin and upright body; Impact / Segoe UI |
| Pastel Pop (`pastel-pop`) | Ticket stub with paired inward semicircle notches and perforation | Sender in the narrow stub; message in the main ticket; Verdana / Verdana |
| Esports Slash (`esports-slash`) | Forward spear plate with a split swallowtail at the left | Wide condensed sender header; message aligned to spear base; Arial Narrow / Arial Narrow |
| Quiet Line (`quiet-line`) | Borderless newspaper ticker with one short lower rule | Small serif byline inline with the message; Georgia / Georgia |
| Neon Edge (`neon-edge`) | Unclosed L-shaped neon bracket; no top or right perimeter | Tall sender at the elbow; body aligned to vertical rail; Arial Narrow / Arial Narrow |
| Sticker Stack (`sticker-stack`) | Tilted sticky note with a folded lower-right corner | Handwritten sender across the note; left-aligned informal body; Segoe Print / Segoe Print |
| Initial Card (`initial-card`) | Pill chip with a separate circular initial medallion overlapping its start | Initial spans two rows; bold name then compact body; Trebuchet MS / Trebuchet MS |
| Signal Console (`signal-console`) | Receipt with zigzag torn bottom and a narrow printed top strip | Monospaced sender header, dashed rule, message below; Consolas / Consolas |
| Announcer (`announcer`) | Retro TV caption bar with projecting left station tab and stair-step right end | Large condensed sender; body on a separate black caption baseline; Arial Narrow / Arial Narrow |
| Guild Chat (`guild-chat`) | Two continuous gold rings, 2px gap, forest shared panel | Inline guild channels; Lato |
| Fantasy MMO (`fantasy-mmo`) | Lavender double window, inset diamonds | Inline party lines; Noto Sans |
| Block Craft (`block-craft`) | Two-step moss pixel blocks | Angle-bracket sender; Pixelify Sans |
| Battle Arena (`battle-arena`) | Teal tactical shared pane with square corner brackets | Squad name column; Barlow |
| Battle Royale (`battle-royale`) | Sand notched field cards | Squad header; Barlow Condensed |
| Retro RPG Dialog Box (`retro-rpg`) | Cobalt dialogue panel with twin white rim | Triangular speaker prompt; VT323 |
| Cyber City (`cyber-city`) | Magenta cut-corner city panels | Cyan callsign header; Barlow |
| Arcade Cabinet (`arcade-cabinet`) | Purple pixel cabinet bezel | Score-line names; Pixelify Sans |
| Space Command (`space-command`) | Steel-blue shared communications pane with long brackets | Comms header; Barlow |
| Monster Trainer (`monster-trainer`) | Ivory heavy-rim dialogue cards | Sender says header; VT323 |
| Dungeon Crawler (`dungeon-crawler`) | Stone bevel panel with brass diamonds | Bracketed serif names; Roboto Slab |
| Cozy Farm (`cozy-farm`) | Wood plaques with peg corners | Cream name over body; Nunito Sans |
| Horror Survival (`horror-survival`) | Dusty red emergency slips | Transmission header; IBM Plex Mono |
| Hero Shooter (`hero-shooter`) | Orange stripe cards with white corner wedges | Compact callsign; Barlow Condensed |
| Kart Racer (`kart-racer`) | Yellow racing capsules with mint lane stripe | Inline sender; Nunito Sans |
| Bubble Chat (`bubble-chat`) | Double-lobed thought cloud with two detached trailing dots | Inline rounded bold name and airy message; Trebuchet MS / Trebuchet MS |
| Clean (`clean`) | Plain typewriter sheet with a red left margin and stepped paper top | Monospaced sender above full-width typed body; no reveal delay; Consolas / Consolas |
| Candy Pop (`candy-pop`) | Playing card with rounded top, clipped bottom and opposite diamond pips | Serif sender at top; friendly sans body; pips in reserved corners; Georgia / Segoe UI |
| Rainbow Border (`rainbow-border`) | Polaroid with square rainbow rim and a deep white caption foot | Dark photo-well body above the sender caption; Verdana / Verdana |
| Terminal (`terminal`) | Continuous-feed terminal paper with punched left holes | Monospaced prompt column and command body; full text on arrival; Consolas / Consolas |
| Vaporwave (`vaporwave`) | Cassette label with chamfered top shoulders and twin reel windows | Italic wide sender on label band; plain body underneath; Trebuchet MS / Trebuchet MS |
| Crystal Realm (`crystal-realm`) | Crystal blue shared panel with corner facets | Party channels; Lora |
| Old-School Realm (`old-school-mmo`) | Brass-beveled brown ledger | Inline golden realm chat; Bree Serif |
| Frontier MMO (`frontier-mmo`) | Charcoal map-chat pane | Colored channel labels; Lato |
| Arena League (`arena-league`) | Dark team-chat shared pane | Team/all columns; Barlow Condensed |
| Tactical Ops (`tactical-ops`) | Dark tactical feed | Team prompts; IBM Plex Mono |
| Block Server (`block-server`) | Grey block-server pane | VIP and arrival labels; Pixelify Sans |
| Hero Quest (`hero-quest`) | Dark role-party pane | Role titles; Lora |
| Space Station (`space-station`) | White station bubble row with small tail | Role dots; Nunito Sans |
| Aurora (`aurora`) | Asymmetric auroral arch; 36px upper-left and 4px lower-right corners | Small spaced sender above a wide calm text field; Trebuchet MS / Trebuchet MS |
| Glitter Bomb (`glitter-bomb`) | Scalloped party seal with six shallow teeth on each side | Bold centered sender over left-aligned message; Verdana / Verdana |
| Neon Pulse (`neon-pulse`) | Open-ended neon tube; squared left, semicircular right | Condensed sender on a small black sign above body; Arial Narrow / Arial Narrow |
| Prism Shift (`prism-shift`) | Faceted six-sided prism with clipped opposite points | Independent rainbow sender chip above plain white body; Verdana / Verdana |
| Holo Foil (`holo-foil`) | Foil pass with one deep concave right notch | Monospaced sender beside a vertical foil registration strip; Consolas / Consolas |
| Lava Lamp (`lava-lamp`) | Organic kidney lozenge with unequal bulbous ends | Heavy rounded sender, indented message below; Trebuchet MS / Trebuchet MS |
| Electric Storm (`electric-storm`) | Jagged lightning plate with serrated side cuts | Slab sender on a high rail, body in a recessed well; Rockwell / Rockwell |
| Starfall (`starfall`) | Observatory pennant with a shallow central lower point | Small serif sender above generous astronomical reading field; Georgia / Georgia |
| Fire Frame (`fire-frame`) | Ember hearth with flame-tooth crown and flat base | Bold slab sender anchored low above the body; Rockwell / Rockwell |
| Ice Crystal (`ice-crystal`) | Crystal shard with three stepped facets on the right | Fine serif sender, upright sans body inside a frosted ledge; Georgia / Segoe UI |
