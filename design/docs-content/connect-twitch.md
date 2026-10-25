<!-- Outline: What the connection reads | What happens to the token | Cancel or try again -->

# Connect with Twitch

You can type your channel name without signing in. Connect with Twitch is an optional convenience that fills in your channel name.

## What the connection reads
The current channel-name connection requests no additional OAuth scopes and uses Twitch's user lookup to read the signed-in account's login. It does not post chat, moderate users, or grant channel-point access.

## What happens to the token
The token is never stored by ChatSkins in local storage, session storage, or an overlay link. It is handled briefly in memory, removed from the callback URL before the lookup, and sent to Twitch for the account lookup. ChatSkins then attempts to revoke it. Session storage holds the sign-in state and editor restoration settings, not the token.

## Cancel or try again
If you cancel, state verification fails, or the lookup fails, enter the channel name manually. Your ordinary chat overlay does not need a persistent sign-in.

> Note: Alerts and channel-point controls require their own connection design. This channel-name shortcut does not authorize those capabilities.
