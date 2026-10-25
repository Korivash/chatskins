<!-- Outline: Twitch emotes | 7TV, BTTV, and FFZ | Size and movement | When an emote stays as text -->

# Emotes

ChatSkins supports Twitch emotes and community emotes from 7TV, BTTV, and FFZ. Provider availability and the channel's enabled emotes determine which codes can become images.

## Twitch emotes
Native Twitch emote positions come from the incoming chat message. Send the emote through Twitch and inspect the new message; typing an arbitrary image name does not create a native emote.

## 7TV, BTTV, and FFZ
Enable the providers you want in the editor. Community codes must match complete whitespace-delimited tokens, including their spelling and case. The overlay loads community emotes for the configured channel after identifying the room.

## Size and movement
Set the inline emote size so emotes fit alongside text. Emote-only scaling can make image-only messages larger. Check row spacing and clipping with a mixed message before increasing either size.

## When an emote stays as text
Check the channel, provider toggle, exact code, and whether the emote is enabled for that channel or available globally. Refresh after a provider update. A temporary provider failure should not stop ordinary text chat from displaying.
