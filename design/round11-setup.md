# Round 11 — Make Twitch setup feel finished

Design handoff, 25 October 2026. Only this specification and `round11-setup-mockup.html` change. Based on `editor.html`, both feature editors, `DESIGN.md`, and prompts 10f/10g. Function names below describe the inspected implementation; items marked **new wiring** are requirements, not existing capabilities. The mockup is static: no sign-in, clipboard access, reward changes or live tests.

## Layout and visual direction

Replace the separate Alerts / Chat play setup interiors with three full-width, vertically stacked cards in this order: Chat commands, Channel points, Alerts. Keep the existing editor and its appearance preview. Setup needs a wider reading surface than the current narrow settings rail: use a dedicated setup section after customization, max-width 1080px. Each card has its checklist on the left and a small, local preview on the right. Below 760px, put the preview after its checklist. No horizontal carousel or nested scrolling.

Page copy: **“Give your viewers a turn.”** / “Choose what happens on stream. We’ll help you finish each step.” Shared field: **“Your Twitch channel”**; help: “Use your channel name, like mosslive.” Account line: “Connected as {login}” only after validation; otherwise “Twitch isn’t connected yet.” A channel name is not a login.

Use Round 9 Canvas #05070D, Surface #0B1425, Raised #101E34, Text #F3F7FF, Muted #A6B6CD, Cyan #38BDF8; secondary blue #74A6FF. Familjen Grotesk headings and Manrope body, Segoe UI/system fallback for the offline mockup. Heading 36/40, card heading 24/29, body 16/25, helper 14/21. Left aligned, 24px card padding, 24px gaps, 14px corners. Blue primary buttons, quiet outlined secondary buttons. Color supplements explicit state text and checklist symbols.

Plan critique: three narrow dashboard tiles would hide the important OBS instruction. Stack the cards and let the unfinished step own the blue action. The distinctive moment is seeing a viewer’s command become the selected skin beside the checklist, not decorative statistics.

```text
Feature name                         [status] [On / Off switch]
Plain-language promise
1 Done / next action                 Preview only
2 Done / editable choices            Actual feature sample
3 Link + OBS instruction              [Test it]
Fine-tune ▸
```

One feature switch per card. Reward/type selections are checkboxes, not additional master switches. “Fine-tune” starts collapsed. Keep it separate from essential reward edits and alert choices. Off retains the checklist and saved choices, disables live setup actions, and leaves Test it available. Do not revoke shared Twitch access when one feature turns off.

## Status contract (all three cards)

The chip is exactly **Off**, **Needs Twitch login**, **Ready**, or **Problem**. The next action appears immediately beneath it or in the current checklist row. Progress such as “Connecting…” is row text, not a fifth chip. Precedence: Off; actionable failure; missing/expired required access; Ready. Ready means the enabled feature is configured and its required connection is healthy, **not** that OBS has been inspected. Keep “Next: add this to OBS” visible until the user confirms it. Before a channel/configuration exists, use Problem with a gentle next step rather than inventing another status.

Every checklist row has a number while pending, a check plus “Done” when complete, and visible “Next” on the first unfinished row. Store completion against channel, configuration revision, and link revision. A copied link is not proof that OBS is configured. The last row has an unchecked **“I added this in OBS”** checkbox, which records the streamer’s confirmation; label completed state **“Added to OBS · confirmed by you”**. Changing embedded settings or credentials resets that confirmation and says “Your settings changed. Copy a fresh link into OBS.”

### Chat commands

Promise: **“Let viewers change your overlay with !skin.”**

1. **“Choose your channel”** — empty: “Enter your Twitch channel above.” / action “Go to channel”; complete: “Using {channel}. No Twitch login needed.”
2. **“Choose the looks viewers can use”** — default complete: “4 looks selected. Each change lasts 60 seconds.” / “Change looks” opens Fine-tune at allowed skins.
3. **“Copy your overlay link into OBS”** — “In OBS, open your chat Browser Source → Properties. Replace its URL with this link.” / **“Copy overlay link”**; after copy: “Copied. Paste it into your chat Browser Source in OBS.” If channel points is enabled, use its private play link instead and say “Chat commands and channel points use the same chat source.” Never offer a public link that silently drops points.

| State | Exact supporting copy / action |
| --- | --- |
| Off | “Chat commands are off. Your choices are saved.” Switch “Chat commands”, value “Off”. |
| Needs Twitch login | Not used for commands alone: no login is required. If sharing a points link, commands remain Ready and row 3 says “Finish Channel points below to copy your shared link.” Do not gate command tests or anonymous commands on login. |
| Ready | “Viewers can use !skin guild. Next: add this to OBS.” Once confirmed: “Your command setup is complete.” |
| Problem: no channel | “Add your Twitch channel to finish setup.” / “Go to channel”. |
| Problem: no looks | “Choose at least one look so !skin has something to show.” / “Choose looks”. |
| Problem: connection failed | “Chat couldn’t connect. Check your channel name, then try again.” / “Try again”. |

Test it: simulate `!skin guild` from Moss (or the first allowed alias). Show the changed chat inside this card with “Moss tried !skin guild” and “Back to your look in 60 seconds.” Announce “Test shown here. Nothing was sent to Twitch.” No channel or login required. Empty/off configurations use an isolated sample configuration, never turn on the saved feature or overwrite its choices.

Fresh drafts: commands **On**, swap/vote/reset enabled; Everyone for swap/start vote/ballots, mods and broadcaster always included; reset locked to mods + broadcaster. 15-second shared wait, 120 seconds per viewer, 60-second return; retain 45-second vote and 120-second winner. Preselect Signature, Guild Chat, Retro RPG Dialog Box, Block Craft with aliases signature/guild/rpg/pixel. These are the existing curated defaults, not a claim of measured popularity. Preserve existing saved Off choices. Derive the internal play master as commands OR points; never expose two competing master switches.

Fine-tune labels: “Wait between changes”, “Wait per viewer”, “Return to my look after”, suffix “seconds”; “Who can change skins?”, “Who can start a vote?”, “Who can vote?” with Everyone / Subscribers / VIPs / Mods. Helper: “Mods and you are always included. Mods and you can use !skinreset to return home immediately.” Cooldowns still apply to normal mod commands; reset bypasses them. “Allowed looks”, “Find a look”, “Short names for {skin}”. Fewer than three skins disables vote with “Choose 3 looks to let viewers vote.” Invalid alias: “That short name already belongs to {skin}. Choose another.” Do not silently remove the last selected look.

### Channel points

Promise: **“Let viewers spend points to change your overlay.”** Fresh drafts Off; turning On reveals the reward plan without creating anything yet.

1. **“Connect Twitch”** — “Sign in with the account that owns {channel}.” / primary **“Connect Twitch + create rewards”**. This is the 10g combined action, routed through the shared connection review below. After success: “Connected as {login}.”
2. **“Rewards created and on”** — before connection: “We’ll create these rewards and turn them on for viewers.” Show editable name/cost rows before consent. Defaults: checked **ChatSkins: Swap skin — 500 points** and **ChatSkins: Emote rain — 250 points**. Optional unchecked: **ChatSkins: Chaos mode — 1,000**, **ChatSkins: Frame flash — 100**, **ChatSkins: Spotlight — 500**. Selecting an effect also enables its runtime effect; no hidden disabled effect. Labels: “Reward name”, “Cost in points”; buttons “Save reward changes” and “Cancel changes”. Created rows show “On”, “Off”, “Not created”, or “Needs attention”, from the actual result, never from the intended request. Input help: swap “Viewers enter a look name.” / rain “Viewers enter emote names.”
3. **“Copy your private link into OBS”** — **“Copy private play link”**. “In OBS, open your chat Browser Source → Properties. Replace its URL with this link.” / “This link includes chat commands too. Keep it private.” Success: “Copied. Replace your chat source’s URL in OBS.” Do not create a second chat source.

| State | Exact supporting copy / action |
| --- | --- |
| Off | “Channel points are off. Turn on to choose your rewards.” |
| Needs Twitch login | “Connect Twitch to create your rewards. They’ll be turned on for viewers.” / “Connect Twitch + create rewards”. |
| Ready | “{count} rewards are on for viewers. Next: copy your private play link into OBS.” Once confirmed: “Your channel-point setup is complete.” |
| Problem: connection only | “You’re connected, but your rewards aren’t ready yet.” / “Create rewards”. |
| Problem: disabled rewards | “{count} rewards are turned off in Twitch.” / “Turn them on”. |
| Problem: partial creation | “{created} rewards were created. {remaining} still need setup.” / “Finish creating rewards”. Keep successful rows checked. |
| Problem: remaining failures | Use the specific fix from the edge-case table below. |

After approval: row 1 checked, row 2 “Checking your rewards…” then “Creating {count} rewards…”. Disable duplicate creation actions while pending. On success show a persistent inline result: **“{count} rewards are ready and on: {names}. Next, add your private link to OBS.”** Also use the 10f result banner for at least 8 seconds. Focus Copy private play link only when creation and connection checks succeed. Login success alone never completes row 2 or produces the final success message.

Fine-tune includes reward cooldowns, effects, motion and **“Create rewards turned off (I’ll turn them on in Twitch)”**, unchecked. That option leaves step 2 incomplete, with “Created, but turned off as requested. Turn them on when you’re ready.” Secondary **“Use rewards I already made”** maps to the existing read-only connection route; explain “We’ll connect to these exact reward names without creating new ones.” Verify name and enabled state before completing step 2. Reuse matching titles; never rename, delete or change costs of existing rewards automatically. Explicit Save reward changes updates only editable app-owned rewards. Others show **“Edit in Twitch”** and **“Check again”**; reconcile by ID and confirm title mapping after changes.

Test it: preview Emote rain in this card; helper “Preview only. No points spent.” Optional selector “Try a reward” uses chosen effects. Local tests never create or redeem Twitch rewards and never certify the live connection.

### Alerts

Promise: **“Celebrate follows, subscriptions and raids on stream.”** Fresh drafts Off.

1. **“Connect Twitch”** — “Sign in with the account that owns {channel}.” / **“Connect Twitch”**; complete “Connected as {login}.”
2. **“Pick alert types”** — checkboxes **Follows / Subscriptions / Returning subscribers / Gift subscriptions / Raids / Cheers / Reward redemptions**. Initially select Follows and Raids for a small useful setup; retain existing users’ saved choices. Choices remain editable before step 1 so the connection asks for only what is selected. Helper: “Choose what you want to celebrate. You can change this later.” Complete: “{count} alert types selected.”
3. **“Copy the alerts link”** — **“Copy private alerts link”**. “In OBS, add a Browser Source named Alerts. Paste this link into its URL field.” / “Keep this link private.” Success: “Copied. Paste it into your Alerts Browser Source in OBS.” Unlike points, this is a separate source.

| State | Exact supporting copy / action |
| --- | --- |
| Off | “Live alerts are off. You can still try a preview.” |
| Needs Twitch login | “Connect Twitch to show your chosen alerts.” / “Connect Twitch”. |
| Ready | “Your selected alerts are connected. Next: copy the alerts link into OBS.” Once confirmed: “Your alert setup is complete.” |
| Problem: no types | “Pick at least one alert type to continue.” / “Pick alert types”. |
| Problem: partial availability | “{ready} alert types are connected. {names} need attention.” / type-specific “Reconnect Twitch” or “Change alert types”. Do not mark the whole card Ready merely because one type works. |
| Problem: connection failed | “Alerts couldn’t reach Twitch. Check your connection and try again.” / “Try again”. |

Test it calls the chosen type, falling back to Follow for an empty selection. Sample: **“Moss joined the adventure!”** / “Preview only. Nothing was sent to Twitch.” Fine-tune: “Position”, “Width”, “Distance from edge”, “Play sound”, “Volume”, per-type “Message” and “Show for … seconds”; queue details nested here. Sound starts off. Template validation: “Keep {name} in your message. Your last saved message is still in use.”

## One shared Connect Twitch flow

Any Connect/Reconnect action opens the same accessible review dialog, titled **“Connect Twitch for {channel}”**. Text: **“Sign in as the owner of this channel. We’ll ask for access for the features you’ve turned on.”** Show selected feature names, editable alert choices and the exact reward plan when creation is requested. Exclude all disabled features. Commands contribute no permissions. An empty channel returns focus to “Your Twitch channel” with “Enter your channel name first.”

Technical mapping below is implementation documentation only; identifiers never appear in product copy. Compute the deduplicated union of `alertScopesFor(config)` only when alerts is On, plus the points permissions only when points is On. Keep the explicit read + manage pair for creation to honor 10g and the existing private-link guard. Manual rewards need read only. Raids need a validated owner login but no extra permission entry. Never request email or chat posting access.

| Needed access | Exact dialog explanation |
| --- | --- |
| `moderator:read:followers` | “See new followers so we can show follow alerts.” |
| `channel:read:subscriptions` | “See subscriptions and gifts so we can celebrate them.” |
| `bits:read` | “See cheers so we can show cheer alerts.” |
| `channel:read:redemptions` | “See redeemed rewards so your chosen effects and alerts can play.” |
| `channel:manage:redemptions` | “Create and update the overlay rewards you choose.” |
| Commands only | “Chat commands don’t need a Twitch login.” / “Back to setup”; no redirect. |
| Raids only | “Sign in to connect raid alerts. No extra access is needed.” |

Footer: **“Continue to Twitch”**, or **“Continue to Twitch + create rewards”** when creation is queued; secondary **“Not now”**. Creation occurs only after explicit review of names/costs, including when initiated from the Alerts card. Reuse validated access when it satisfies the union; skip redirect and perform the reviewed action. If access is missing, reauthorize once for the complete current union. Previously granted access may remain on Twitch; turning a feature off stops using it and excludes it from new requests, without claiming it has been revoked.

Save the initiating card ID, channel, draft choices, intended creation action and revision before leaving. Restore them before consuming the result. Return to that card, scroll without motion when requested, announce “Connected as {login}.” and show its next unfinished step. If Alerts initiated a combined creation, keep focus in Alerts and show its next action plus the points result there; do not jump unexpectedly between cards. If points initiated successful creation, focus its copy button. Failures return to the initiating card’s inline fix; dismissing the banner never erases that fix. Not now/cancel preserves choices and Needs Twitch login; message “Connection cancelled. Your choices are saved.” / “Try again”. Tokens never appear in banners, samples, logs or displayed URLs.

## Control-to-code handoff

| Control | Existing code to reuse; required adaptation |
| --- | --- |
| Channel field / Go to channel | `#channel` change handler, `cleanChannel`, `updateCopy`, `chat:channel-change` in `js/editor.js`; focus field. |
| Commands / points switch | `initChatPlayEditor().getConfig()` + `.setConfig(next)`, internal `persist()` and `onChange`; **new wiring** derives `config.enabled` from `commands.enabled || points.enabled`. Preserve effects needed by either feature. |
| Alerts switch | `#alerts-enabled` handler sets `config.enabled`, `persist()`, `startClient()`/`stopClient()`. **New wiring**: disabling alerts must not stop points’ shared connection; retain it while either feature needs it. |
| Fine-tune / look choices / reward selection & name | Existing `initChatPlayEditor` fields update `config`, normalize and persist; reward plan uses `drawRewardPlan()`. Move these controls, preserve validation. Native `details` for disclosure. |
| Reward cost / Save reward changes | `CHAT_PLAY_REWARD_DRAFTS` and `createRewardRequestBody()` accept costs, but current editor only displays them and `normalizeChatPlay()` discards cost. **New schema and wiring required**: persist editable costs, feed them into `createRewards()`, and add explicit app-owned reward PATCH for title/cost. No existing general edit function. Validate unique nonblank names, 1–45 characters, whole-number costs 1–1,000,000 (current builder bounds), before redirect or save. Copy: “Use a different reward name.” / “Enter a whole-number cost from 1 to 1,000,000.” |
| Shared connection review | Reuse `saveEditorRestore()` / `takeEditorRestore()`, `beginAlertsAuth()` / `finishAlertsAuth()`, `buildAlertsAuthorizationUrl()` and `validateAlertsToken()`. **New coordinator** replaces separate `beginTwitchAuth()` and points-only `onlyExtraScopes:true` paths for this setup; passes exact union, a saved action, and return card. Existing separate paths do not yet implement this shared flow. |
| Create / retry missing rewards | `alertsController.connectChannelPoints(true)`, private `createRewards()`, `runInitialRewardSetup()`, `createChatPlayRewards()`; route through coordinator for union access, then await `rewardSetup`. Re-fetch before retry, reuse created IDs. |
| Use rewards I already made | `connectChannelPoints(false)` with read permission; **new wiring** inventories all visible rewards and matches exact titles without creation. Current create helper fetches manageable rewards only and cannot verify externally created rewards. |
| Turn them on | `alertsController.turnOnRewards(rewards)` → `enableExistingChatPlayRewards()`; show per-row results and retain partial errors. |
| Test it: commands / points | `onPreviewCommand(raw,'everyone','Moss')` → `chatPlayPreview.simulate()`; `onPreviewEffect('rain',sample)` → `.testEffect()`. **New wiring** mounts isolated `createChatPlayRuntime` previews inside each card; current preview is shared at `#stage`. Do not persist test overrides or consume live cooldowns. |
| Test it: alerts | `alertsController.test(type,variant)` → `sample()`, `pumpTests()`, `show()` and `createAlertCard()`; existing `#alerts-preview` is local. Adapt test config so Off/unchecked types can preview without enabling live alerts. |
| Copy commands link / chat instructions | Existing `#copy` handler uses `encodePlaySource()` and clipboard; `buildChatPlayInstructions()` for “Copy chat instructions” inside Fine-tune. When points is On route to private builder. |
| Copy private play link | Existing `#chat-play-copy-link` handler → `buildPrivatePlayLink(config,allowedSkins)` → `buildChatPlayUrl()`; gate on validated owner/access and reconcile reward health. |
| Alert checkboxes / copy link | Existing type enable handlers use `alertScopesFor()` and `startClient()`; `#alerts-copy` uses `buildAlertsUrl()` + clipboard. **New wiring** exposes missing access via shared connection review, requires all selected types healthy, not just `readyCount > 0`. |
| Result banner / return focus | `showAuthBanner()`, `authBannerModel()`, `rewardSetupBannerModel()`, `restoreEditorReturnTarget()`; **new wiring** translates raw errors and retains inline results. Await actual creation, wire `getRewardCreationEnabled`, `rewardSetup`, `turnOnRewards`, and `focusPrivateLink()` at editor integration; interfaces present in these modules are not evidence that all 10g integration is finished. |
| I added this in OBS / Check again | **New wiring**, per revision completion metadata and explicit remote recheck. No OBS detection function exists. |

## Edge cases and honest completion

| Condition | State, exact copy, next action |
| --- | --- |
| Confirmed non-Affiliate/non-Partner | Points Problem: “Twitch channel points need an Affiliate or Partner channel. Chat commands still work for everyone.” / “Use chat commands”. Preserve choices. A 403 alone is ambiguous: “Twitch couldn’t allow rewards. Check that this channel is Affiliate or Partner, then reconnect and approve reward access.” / “Reconnect Twitch”. Do not present guessed account eligibility as fact. |
| Expired/revoked access | Points/Alerts Needs Twitch login: “Your Twitch connection expired. Reconnect, then copy fresh links into OBS.” / “Reconnect Twitch”. Commands unaffected. Preserve reward IDs; never recreate just because a token expired. Invalidate old OBS confirmation. |
| Wrong account | Problem: “You signed in as {actual}. This setup is for {expected}. Sign in as {expected} to continue.” / “Use {expected} account”; secondary “Change channel”. No creation before owner match. Reuse current finish-auth rejection/revocation. Never silently change the channel. |
| 50-reward limit | Problem: “Twitch allows 50 custom rewards. Make room for {needed} more in Twitch, then try again.” / “Manage Twitch rewards” and “Check again”. Count all rewards, not just this app’s manageable rewards; do not delete any. Offer fewer selected rewards. |
| Existing reward disabled or created off | Problem until enabled; “{name} is off in Twitch.” / “Turn them on”, or “Open Twitch rewards” if app cannot manage it. |
| Existing external reward / title renamed | “This reward is managed in Twitch. Edit it there, then check again.” / “Edit in Twitch”. Renamed mapping: “This reward’s name changed. Match the new name to continue.” / “Update reward name”. No duplicate creation to repair a rename. |
| Permission missing / new type selected | Needs Twitch login: “Reconnect Twitch to allow {feature or type}.” / “Reconnect Twitch”; request current union once. Do not print raw permission names. |
| Offline / retry / partial outcome | Problem: “We couldn’t reach Twitch. Check your connection, then try again.” / “Try again”. Retain known results; re-fetch after uncertain writes before creating again. Transient auto-retry row: “Reconnecting to Twitch…”; unresolved failure gets the fix, never an endless spinner. |
| Clipboard blocked | Inline “Your browser couldn’t copy the link. Allow clipboard access and try again.” / “Try copying again”; secondary “Show link to copy” reveals a selected private field only after explicit action. Copy completion stays unchecked. |
| Settings changed after copying | “Your settings changed. Copy a fresh link into OBS.” Editing here cannot change an already-pasted source. Switching Off likewise requires a fresh link, or “Hide this Browser Source in OBS to stop it now.” Never claim the switch remotely stopped OBS. |
| Turning points off with rewards still live | “These rewards are still on in Twitch. Turn them off there to stop viewers spending points.” / “Manage Twitch rewards”. No hidden deletion or revocation. |
| Shared access disconnect | Separate account action “Disconnect Twitch” under account details; explain “This disconnects channel points and alerts. Chat commands can still work.” Reuse `revokeAlertsToken()` once; both affected cards become Needs Twitch login. Remove old private sources; if revocation fails show “Remove the old links from OBS and disconnect ChatSkins in Twitch connections.” |
| Reward redemption also selected as alert | Reuse the existing single subscription and `onPlayReward()` routing; explain “Overlay rewards play their effect. Other rewards can show an alert.” Avoid duplicate effects. |
| Storage unavailable / old draft | “Your browser can’t save this setup. Keep this page open and copy your links before leaving.” Do not redirect unless return state can be preserved. No migration turns on a saved Off feature; do not lose existing selected types or reward names. |

## Accessibility and review

44px controls; native labeled inputs, checkbox-backed switches, heading hierarchy, visible 2px cyan focus, full wrapping at 320px and 400% zoom. Dialog traps focus, closes on Escape, restores its opener. Checklist updates and results use polite status announcements, not repeated screen-reader interruptions. No progress conveyed only by color. Respect reduced motion in previews and return scrolling. Keep credentials masked in default UI. Preview caption always says “Preview only”; no live success claims from test events.

Mockup shows Commands Ready, Points Needs Twitch login, Alerts Problem. Four statuses cannot fit simultaneously in three single-state cards, so a separate compact Off-state specimen below demonstrates the fourth without adding a fourth feature card. The connection review is a static expanded specimen, not an actual login dialog.

Builder acceptance: cold draft; saved Off migration; commands without login; both authenticated features in one approval; alerts-only and raids-only access; return to each initiating card; cancellation and wrong owner; all/partial/disabled/external reward results; accurate total reward limit; expiration; changed settings after copy; clipboard denial; all tests while Off; keyboard and 320/390/768/1280px layouts. Design review does not assert live Twitch, OBS or browser execution tests passed.
