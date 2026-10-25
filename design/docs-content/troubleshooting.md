<!-- Outline: Chat not showing | Emotes missing | Overlay cut off | Wrong size | Old look after an update | Alerts not firing | Still stuck -->

# Troubleshooting

Start with a fresh plain-text message and your current overlay URL. Change one setting at a time so you can tell what fixed the problem.

## Chat not showing
Check the channel spelling and paste the complete overlay URL again. Confirm the source is visible and above gameplay. Temporarily disable filters and send a new message. The overlay is a live feed; old chat history is not a connection test. If the page cannot connect, check your internet connection and any firewall or browser-source restrictions.

## Emotes missing
Enable the correct provider, verify the exact code, and check whether the channel has that emote. Send it as a separate word in a new message. Refresh after provider changes; if only one provider is affected, it may be temporarily unavailable.

## Overlay cut off
Reset unintended cropping or transforms in your streaming app. Check that the Browser Source canvas is large enough for chat width, insets, and frame ornaments. Increase padding if glyphs clip inside their own row.

## Wrong size
Use 1920 × 1080 for a 1080p canvas or 1280 × 720 for 720p. Source dimensions are not the same as chat-column width. Match source dimensions first, then adjust text and chat width in the editor.

## Old look after an update
Copy the newly generated link and replace the source URL. If the URL is correct but old assets remain, refresh the Browser Source cache using your app's refresh control. Avoid clearing all site data first: that can remove locally saved skins.

## Alerts not firing
Check the alert connection, enabled event types, and private URL. Send a test alert. If the test works but a real event does not, reconnect the event service and review permissions. If neither works, check source visibility and the alerts link. Alerts availability depends on the completed event integration.

## Still stuck
Include your streaming app, canvas size, skin name, and steps to reproduce when asking for help. Share a cropped screenshot of the issue. Remove private alert URLs, tokens, and personal information first.
