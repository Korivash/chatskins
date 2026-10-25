Round 5d: 7TV/BTTV/FFZ emotes still don't appear in the OBS overlay. The lead traced it.

- `js/irc.js` calls `onRoomState({roomId})`, correct.
- `js/chat.js` `connectChat()` does NOT pass an `onRoomState` callback through to `createIRCClient`, so the room id is dropped.
- `js/overlay.js` never imports or creates `createCommunityEmotes` from js/emote-provider.js. Only the editor uses it, so overlay.html never fetches any emote set: 0 requests to 7tv.io / api.betterttv.net / api.frankerfacez.com in 25 s of live chat.

Fix:
1. connectChat(channel, onMessage, onState, { onRoomState }) passes it to createIRCClient. Keep the old call signature working.
2. overlay.js:
   - Create the community emote provider with the providers enabled in the settings.
   - Feed it the room id from onRoomState.
   - Pass its map into appendChatMessage(root, message, settings, community) for every message.
   - Re-render nothing; new messages simply use the latest map.
3. The editor's "Live channel" preview must use the same path.
4. Add a test with a fake IRC client: connectChat → onRoomState → the provider receives the room id. Also test that overlay message rendering receives a non-empty community map once one is loaded (mock fetch with the fixtures).

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
