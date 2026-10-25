<!-- Outline: Choose who can change skins | Direct changes with !skin | Voting with !skinvote | Channel points | Cooldowns | The panic button -->

# Chat-powered skins

Let viewers change the look of chat while you keep control of what can happen. Choose a small approved skin list before turning audience controls on.

Chat play is off by default. Turn it on in the editor, choose the allowed skins, and copy a fresh overlay link. Older links without Chat play settings remain off.

## Choose who can change skins
Set separate permissions for direct changes, starting a vote, casting ballots, and resetting the skin. Mods can reset by default. Only skins in your allowed list can be selected; viewers cannot submit arbitrary CSS or URLs.

## Direct changes with !skin
Use `!skin` followed by an allowed skin name or alias. A permitted command changes the overlay temporarily, then returns home. Unknown names and requests outside the allowed list leave the current skin unchanged.

```text
!skin guild
```

## Voting with !skinvote
Eligible viewers can use `!skinvote` to open a ballot. Viewers vote with `1`, `2`, or `3`; each vote can be changed after the short ballot cooldown. At the end, a tied result is chosen at random from the tied skins. The vote panel shows the options and remaining time.

```text
!skinvote bubble-lift
```

## Channel points
Connect channel points separately and map reward titles to Chat play effects. Reading redemptions requires its own Twitch authorization. Creating rewards requests `channel:manage:redemptions`; new rewards are created disabled so you can review them in Twitch. The private OBS link contains Twitch access, so keep it secret. A non-affiliate channel may not be able to create rewards.

## Cooldowns
The defaults are a 15-second global cooldown and a 120-second per-viewer cooldown for skin commands. Requests during a cooldown do not queue. Ballots have a separate one-second per-viewer cooldown.

## The panic button
Use **Panic: freeze skin** to restore the home skin and pause commands, votes, and rewards. Resume explicitly when you are ready. OBS Interact also supports Ctrl+Shift+F to freeze and Ctrl+Shift+R to resume. Reduced motion is respected, and the overlay never sends chat messages.
