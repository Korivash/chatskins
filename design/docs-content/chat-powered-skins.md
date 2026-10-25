<!-- Outline: Choose who can change skins | Direct changes with !skin | Voting with !skinvote | Channel points | Cooldowns | The panic button -->

# Chat-powered skins

Let viewers change the look of chat while you keep control of what can happen. Choose a small approved skin list before turning audience controls on.

> Note: This is the proposed Round 9 interaction guide. Commands, voting, channel points, and the panic button require implementation before this page and the announcement ship.

## Choose who can change skins
Start with broadcaster-only access, then allow moderators or a wider audience if you want. Direct changes and voting should have separate permissions. Only skins in your approved list can be selected; viewers cannot submit arbitrary CSS or URLs.

## Direct changes with !skin
Use !skin followed by an approved skin ID. A permitted command selects that look for the overlay. Unknown IDs and requests outside the approved list leave the current skin unchanged.

```text
!skin guild-chat
```

## Voting with !skinvote
Open a vote from the control panel, then let eligible viewers use !skinvote followed by an approved ID. One active choice per viewer keeps repeated messages from adding extra votes. At the end, apply the winner; a tie keeps the current skin. The panel should display the vote deadline and result.

```text
!skinvote bubble-lift
```

## Channel points
Connect the separate channel-point integration and map a reward to an approved skin or a vote. Review the permissions before authorizing it. The ordinary Connect with Twitch button only fills in your channel name and does not read redemptions. Pause or disable the reward when the integration is disconnected.

## Cooldowns
Set a global cooldown to space out changes and a per-viewer cooldown to prevent one person from dominating. Show the remaining cooldown in the control panel. Requests during a cooldown should leave the current skin unchanged rather than queueing a burst of changes.

## The panic button
Choose Stop audience control to cancel the active vote, stop accepting commands and redemptions, and restore your selected safe skin. Keep it visible beside the connection status. Audience control stays off until you explicitly resume it; refreshing the editor must not silently turn it back on.
