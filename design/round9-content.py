"""Generate design-only documentation specimens and their portable content index."""
from pathlib import Path
import json, re

ROOT = Path(__file__).resolve().parent
pages = []
def page(slug, title, group, text):
    pages.append(dict(slug=slug, title=title, group=group, markdown='# '+title+'\n\n'+text.strip()+'\n'))

page('getting-started','Getting started','Start here', '''Your chat belongs in your stream. Pick a skin, enter your Twitch channel, and add one link to your streaming app. No account or plugin is needed for ordinary chat.

## Your 60-second setup
1. Open Skins and pick a look. Use the live sample to check names, long messages, and contrast.
2. Choose Make my overlay. Enter your Twitch channel name, without the channel URL. Connect with Twitch is an optional shortcut.
3. Copy the generated overlay URL in full.
4. In your streaming app, add a Browser Source and paste the URL.
5. Set the source to 1920 × 1080, or 1280 × 720 for a 720p canvas. Place ChatSkins above your game capture.

> Tip: Send a new message in your Twitch chat to check the connection. Sample messages in the editor are a preview, not proof that live chat is connected.

## Browser Source settings
Use your generated URL. Keep custom CSS empty. Turn off Shutdown source when not visible and Refresh browser when scene becomes active where those options are available. Set FPS to 30, or 60 if you want smoother motion.

```text
URL: paste your complete overlay URL
Width: 1920
Height: 1080
FPS: 30 or 60
Shutdown source when not visible: Off
Refresh browser when scene becomes active: Off
Custom CSS: empty
```

## Make it yours
Open Customize to change type, spacing, frames, and motion. Copy the updated link into your Browser Source after editing. A previously copied URL does not automatically pick up a new design.

## Where to go next
Read Add to your streaming app for source setup, Choosing a skin for the collections, or The editor for a guided tour.''')

page('streaming-apps','Add to your streaming app','Start here','''ChatSkins works in anything with a Browser Source or web source. The source is a transparent web page that sits above your gameplay.

## The settings to keep
Paste the entire overlay URL, including everything after the #. Match source dimensions to your canvas: 1920 × 1080 for 1080p or 1280 × 720 for 720p. Set FPS to 30 or 60. Leave custom CSS empty. Disable Shutdown source when not visible and Refresh browser when scene becomes active if your app exposes these options; other apps may name them differently or omit them.

## OBS Studio
In Sources, choose +, then Browser. Create a source named ChatSkins. Paste your overlay URL into URL, set Width and Height, and apply the shared settings above. Confirm, then drag ChatSkins above your game capture in Sources. Reuse the existing source in other scenes when you want one continuous chat session.

## Streamlabs Desktop
Add a Browser Source to your scene. Paste the full URL and match Width and Height to the canvas. Keep the source active between scenes where your version allows it. Move it above your gameplay source and send a new chat message to test.

## Twitch Studio
If you already use a version with a web or browser layer, add that layer and paste your URL. Match its size to your canvas and move it above gameplay. Availability depends on your installed version; if it cannot load web sources, use a streaming app that can. This is a compatibility guide, not a download recommendation.

## XSplit
Add a web-page source using your overlay URL. Set its web-page dimensions to the canvas size, then position it above your game source. Avoid stretching a small web-page viewport to fill a larger canvas: adjust the source dimensions first.

## Meld Studio
Add a browser source, paste the URL, and set its dimensions to your canvas. Place the source above gameplay. Check the preview at your output size before going live; browser-source controls vary by version.

## vMix / others
In vMix, use a Web Browser input and add it as an overlay above gameplay. In Lightstream or another app, look for Browser Source, Web Source, or Web Page. Paste the URL and apply the available shared settings. If web pages cannot be used as sources, that app cannot display ChatSkins directly.

> Note: The width in the editor is your chat column width. Browser Source width and height describe the full canvas containing it. They are different settings.

## Check the result
Send a fresh Twitch message. Switch scenes and back. Chat should stay legible and correctly placed. If it restarts on each switch, review the source shutdown and refresh options.''')

page('choosing-a-skin','Choosing a skin','Start here','''Start with the look that fits your stream, then tune it in the editor. Every skin is free. The catalog contains 42 skins; Featured is a selection from that catalog, not an extra collection of unique skins.

## Featured
Start here for a compact selection of expressive, readable looks. Watch the preview before choosing: a moving frame can feel different over gameplay than on a still page.

## Streamer favorites
Conversation-first designs such as Bubble Lift, Glass Card, and Name Tag give names and messages clear separation. Choose these when readability matters more than themed decoration.

## Game styles
Guild Chat, Retro RPG, and the other game-inspired looks bring dialogue windows, channel labels, and HUD-like frames to chat. These are original visual treatments, not official game integrations.

## Animated
Use this group when motion is part of the look. Test entrance effects and frame movement against a busy scene. Reduce motion keeps messages readable without the moving decoration.

## Colorful
Bright palettes and playful surfaces make chat a visible part of the composition. Check both light and dark gameplay before committing to a pale background.

## Compare and use
Select a card to see its larger preview, description, and Readability, Flair, Motion, and Retro scores. Scores describe the design; they are not performance benchmarks. Choose Make my overlay to use it, or Customize to change it. Pause previews whenever you need a still comparison.''')

page('editor','The editor','Customize','''The editor keeps your controls beside a live preview so you can see each change before copying the link. Begin with Simple mode. Open advanced controls when you need to style individual parts.

## A useful editing order
Choose your skin, set the channel, and adjust size and contrast first. Then work on layout, frames, and backgrounds. Add animation last so you can judge whether it helps the conversation.

## Preview before copying
Use sample messages to inspect roles, short lines, long lines, and emote-only messages. Test both bright and dark backdrops. The preview is scaled to fit your window; source pixels are the values that matter in your streaming app.

## Keep your result
Copy the complete overlay URL and replace the old Browser Source URL. Use My skins for reusable local designs. Keep an exported backup before clearing browser data.

> Tip: Change one section at a time. If a look becomes hard to read, return to typography and background contrast before adding more effects.''')

sections = [
('simple-mode','Simple mode','''Simple mode exposes the everyday controls without making you inspect every part of a message.

## Start with six controls
Choose the font, text size, accent color, background, chat width, and motion setting. Keep the preview visible while adjusting them. Text size is measured in source pixels, not in the scaled preview on the page.

## Move into advanced editing
Open the advanced editor when you want separate names and message styling, custom frames, or detailed spacing. Switching views should keep your current work. Choose a new skin only when you intend to replace its appearance settings.

## Finish the setup
Check your channel name, copy the updated URL, and paste it into your streaming app. You do not need to connect a Twitch account for ordinary read-only chat.'''),
('part-styling','Part styling','''Style the panel, message row, name, and message text independently. This lets you keep the conversation quiet while giving names a stronger visual identity.

## Choose the part
Select the part you want to change before adjusting font, size, weight, spacing, or color. Turn off inherited typography only when the part needs its own treatment. Inherited values follow the parent styling.

## Paint and readability
Use a solid color for dependable contrast, or a gradient for a restrained highlight. Shadows, outlines, and glows can separate letters from gameplay, but strong blur can reduce readability at small sizes.

## Check a mixed message
Preview a long name, a badge, normal text, and emotes together. Make sure badges stay with the name and descenders are not clipped. Check at your actual output resolution.'''),
('frames','Frames','''Frames define the edge of a panel or individual message. Choose their scope before tuning their appearance.

## Panel or message
A panel frame surrounds the entire conversation. A message frame repeats around each row. Use a panel for a continuous game-style window and message frames for separate cards or bubbles.

## Build the edge
Choose a frame style, then adjust width, color, corners, and inner padding. Double frames need enough gap to read as two lines. Ornaments and outer rings need room beyond the message text.

## Keep breathing room
Increase padding when adding a thicker border or larger ornament. Hide frames for a text-only overlay; keep enough text contrast to survive changing gameplay. Copy a fresh URL when finished.'''),
('backgrounds','Backgrounds','''Backgrounds support the message without hiding your stream. Panel and message backgrounds can be adjusted separately.

## Choose a treatment
Start with a solid navy surface. Use a gradient for depth, or an available recipe for a themed texture. Adjust opacity rather than dimming the text itself.

## Images and glass
If you use an image URL, choose an image you have permission to use and check that the streaming app can load it. Fit and opacity determine how it sits behind the text. A browser source cannot blur the separate game capture beneath it; glass is a translucent treatment, not live blur of gameplay.

## Make it transparent
Enable Transparent background to remove the backing. Review frames separately and use Hide frames if needed. The checkerboard in a preview represents transparency and is not part of your stream.'''),
('name-format','Name format','''Name formatting changes the displayed name line. It does not rename Twitch users or change their messages.

## Use a template
Keep the name token so viewers can tell who is speaking. The name template supports badges, name, channel, and color tokens. Channel-rule templates use their own name, message, and badges tokens instead.

```text
{badges} {name}:
```

## Keep names readable
Use a fixed color for a unified look, or Twitch name colors for viewer identity. If role colors are enabled, the recognized role can take precedence. Test long names before reducing the space reserved for them.

> Note: Templates are formatting instructions, not HTML. Pasted markup is not a supported way to add a badge or image.'''),
('layout','Layout','''Layout controls where chat sits and how its rows flow. Start by matching your Browser Source to the full canvas.

## Position the conversation
Set chat width, alignment, and edge inset. Keep chat away from gameplay UI and subtitles. If the source looks cropped, check the source dimensions and transform in your streaming app before shrinking all the text.

## Arrange names and messages
Choose inline, stacked, or column layouts where available. Columns make repeated names easy to scan; stacked names give message text more room on narrow overlays. Very narrow columns may switch to a stacked presentation to preserve readability.

## Set density
Adjust message spacing, maximum messages, and line limits together. Leave enough space for a wrapped message and a large emote. Grouping consecutive messages can reduce repeated names; preview a change of sender so the conversation remains clear.'''),
('animation-effects','Animation & effects','''Motion should make arrivals easy to notice without competing with the stream. Add it after the static layout is readable.

## Arrival and removal
Choose an entrance and its duration. Use a short fade or slide for busy streams. Message lifetime controls how long a message remains; removal settings control how it leaves. A low lifetime can make chat disappear before viewers finish reading.

## Decorative effects
Frame glow, animated gradients, name effects, and background motion add emphasis. Use one strong effect at a time. Keep message text stable when the frame is already moving.

## Reduce motion
Enable Reduce motion to show the final readable state without animated decoration. A system reduced-motion preference also applies and cannot be overridden by the editor toggle. Pausing gallery previews is separate from the motion settings saved in your overlay.'''),
('roles-colors','Roles & colors','''Role colors help viewers recognize the broadcaster, moderators, VIPs, and subscribers without reading every badge.

## Choose role colors
Enable role colors and set each role's name color. When a sender has several roles, the priority is broadcaster, moderator, VIP, then subscriber. Ordinary viewers keep the selected Twitch or fixed name-color behavior.

## Combine with name effects
Recognized role colors take precedence over gradient or rainbow name effects. A glow may still use the resolved role color. Keep badges visible so role meaning does not depend on color alone.

## Highlight mentions
Enable mention highlighting to mark messages that mention your configured channel. Check the channel name first: an empty channel cannot match a real mention. Use a restrained marker instead of turning the entire message into bright text.'''),
('filters','Filters','''Filters control what appears in the overlay. They do not delete messages from Twitch or moderate your channel.

## Hide commands, bots, or links
Use the available toggles to hide command messages, named bots, or messages containing links. Review the bot-name list when a regular viewer unexpectedly disappears. Test each filter with a fresh message.

## First-message emphasis
Highlight tagged first messages when Twitch supplies the first-message tag. It is not the same as a viewer's first message since you opened the overlay. If Twitch does not send the tag, the message appears normally.

## Diagnose missing messages
Temporarily disable filters, send a plain text message, then restore filters one by one. Keep your normal Twitch moderation tools enabled; visual filtering is not a replacement for channel moderation.'''),
('my-skins','My skins','''Save a variation when you want to return to it later. Give it a name that describes when you use it, such as Cozy evening or Ranked night.

## Save and reuse
Use My skins to save your current appearance locally. Select a saved design to load it, check the channel, and generate its overlay link. Rename similar versions so you can distinguish them quickly.

## Keep a backup
Export your saved settings before changing computers or clearing browser data. Import that backup in the destination browser. Local designs are tied to this browser profile; they are not an account-based cloud library.

> Warning: Clearing site data can remove local saved skins. Keep an export and your working overlay URL somewhere you control.'''),
('custom-css','Custom CSS','''Custom CSS is for small visual adjustments that the normal controls do not cover. Start with the built-in controls so your design stays easier to maintain.

## Add a small override
Enable custom CSS in the editor and change one property at a time. Rules are scoped to the overlay. Unsupported or unsafe constructs may be removed; custom CSS does not run JavaScript.

```css
.message-body {
  letter-spacing: 0.02em;
}
```

## Test the result
Check a long name, a wrapped line, and emotes. Avoid changing positioning on every child element or forcing a fixed row height: those changes can clip content. Keep a copy of your working settings before experimenting.

## Recover from a broken look
Disable custom CSS and check the preview again. If that fixes the problem, remove the last override and reintroduce rules one at a time. Keep the streaming app's own Browser Source custom CSS field empty.''')]
for slug,title,text in sections: page(slug,title,'Customize',text)

page('mmo-channels','MMO chat channels','Connect & play','''Chat channels turn Twitch messages into game-style dialogue. Labels such as [Officer], says, and yells are presentation rules, not private rooms or messages imported from a game.

## How a rule wins
Enabled rules are checked in order. The first matching dialogue rule formats the message. Typical presets check broadcaster, moderator, all-caps, action, channel mention, VIP, subscriber, then everyone. A first-time notice is evaluated separately when Twitch supplies the first-message tag.

## Officer, says, and yells
A moderator can receive an [Officer] label because of their moderator badge. An ordinary viewer uses the fallback dialogue, such as says. The all-caps rule requires at least six letters and at least 80% uppercase letters; it can choose a yells format. A moderator's uppercase message may still use Officer because the moderator rule is earlier.

```text
[Officer] Juniper: Ready for the next run?
Luna says: I brought snacks.
CapsLock yells: LET'S DO THIS
```

## Edit a channel set
Enable chat channels, choose a rule, and edit its label, color, and template. Use {name}, {message}, and {badges} in channel templates. Keep an everyone rule last so unmatched viewers still have a readable fallback. The exact preset sets are listed below.

## Per-skin channel sets
The following labels are taken from the current skin catalog. Skins without an enabled set use their normal name-and-message presentation. You can enable channels in the editor without changing the underlying Twitch conversation.
''')
# Derive the per-skin reference from source data instead of guessing themed labels.
skins = json.loads((ROOT/'skins.json').read_text(encoding='utf-8'))['skins']
channel_page = pages[-1]
for skin in skins:
    channels = skin['settings'].get('channels', {})
    if channels.get('enabled'):
        channel_page['markdown'] += '\n### '+skin['name']+'\n\n'
        for rule in channels.get('rules', []):
            channel_page['markdown'] += '- '+rule['match']+': `'+rule.get('format','')+'`'+(' (disabled)' if rule.get('enabled') is False else '')+'\n'

page('emotes','Emotes','Connect & play','''ChatSkins supports Twitch emotes and community emotes from 7TV, BTTV, and FFZ. Provider availability and the channel's enabled emotes determine which codes can become images.

## Twitch emotes
Native Twitch emote positions come from the incoming chat message. Send the emote through Twitch and inspect the new message; typing an arbitrary image name does not create a native emote.

## 7TV, BTTV, and FFZ
Enable the providers you want in the editor. Community codes must match complete whitespace-delimited tokens, including their spelling and case. The overlay loads community emotes for the configured channel after identifying the room.

## Size and movement
Set the inline emote size so emotes fit alongside text. Emote-only scaling can make image-only messages larger. Check row spacing and clipping with a mixed message before increasing either size.

## When an emote stays as text
Check the channel, provider toggle, exact code, and whether the emote is enabled for that channel or available globally. Refresh after a provider update. A temporary provider failure should not stop ordinary text chat from displaying.''')

page('connect-twitch','Connect with Twitch','Connect & play','''You can type your channel name without signing in. Connect with Twitch is an optional convenience that fills in your channel name.

## What the connection reads
The current channel-name connection requests no additional OAuth scopes and uses Twitch's user lookup to read the signed-in account's login. It does not post chat, moderate users, or grant channel-point access.

## What happens to the token
The token is never stored by ChatSkins in local storage, session storage, or an overlay link. It is handled briefly in memory, removed from the callback URL before the lookup, and sent to Twitch for the account lookup. ChatSkins then attempts to revoke it. Session storage holds the sign-in state and editor restoration settings, not the token.

## Cancel or try again
If you cancel, state verification fails, or the lookup fails, enter the channel name manually. Your ordinary chat overlay does not need a persistent sign-in.

> Note: Alerts and channel-point controls require their own connection design. This channel-name shortcut does not authorize those capabilities.''')

page('alerts','Alerts','Connect & play','''Use alerts to give supported stream events their own visual moment. Keep alert setup separate from ordinary chat so you can test and position each source independently.

> Note: This page describes the proposed Round 9 alert experience. Publish it as a live setup guide only when the event connection, private links, and test controls are available.

## Set up the alert source
Open Alerts, connect the supported event service, and review the events and permissions shown there. Choose a look, then copy the private alerts URL. Add it as a separate Browser Source above gameplay, using the same canvas dimensions as your chat source. Enable only the event types you want to display.

## Test alerts
Use Test alert for each enabled event. Confirm the label, animation, sound level if enabled, and how the alert overlaps chat. A test verifies appearance and delivery to the source; it does not prove that a real event subscription is working. Check the connection status before going live.

## Keep the link private
Treat the alerts URL as a secret. Do not paste it into public chat, screenshots, request forms, or a shared scene collection. If exposed, use the link replacement or revocation control and update the Browser Source. The old link must stop working.

## If nothing arrives
Confirm the connection is active, the event is enabled, and the current URL is loaded. Try a test alert. If tests work but real events do not, inspect the event service connection and its permissions rather than changing the visual design.''')

page('chat-powered-skins','Chat-powered skins','Connect & play','''Let viewers change the look of chat while you keep control of what can happen. Choose a small approved skin list before turning audience controls on.

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
Choose Stop audience control to cancel the active vote, stop accepting commands and redemptions, and restore your selected safe skin. Keep it visible beside the connection status. Audience control stays off until you explicitly resume it; refreshing the editor must not silently turn it back on.''')

page('transparent-background','Transparent background & gameplay','Guides','''Keep chat visible without covering more of the game than necessary. Transparency removes the backing; it does not automatically make every text color readable.

## Turn on transparency
Enable Transparent background in the editor. If you also want to remove decorative edges, use Hide frames. Preview against a bright scene and a dark scene. Add a restrained text outline or shadow when needed.

## Place the source
Add the overlay as a full-canvas Browser Source and put it above your game capture. Use chat alignment and edge inset to position it. Keep important gameplay UI, subtitles, and camera areas clear.

## Check at output size
View a recording at the resolution viewers receive. A name that looks crisp in a large editor window may be too small after scaling. Prefer changing the editor's text size over stretching the Browser Source unevenly.

> Tip: Glass surfaces can tint gameplay through transparency, but they cannot blur a separate game-capture source behind the browser.''')

page('troubleshooting','Troubleshooting','Guides','''Start with a fresh plain-text message and your current overlay URL. Change one setting at a time so you can tell what fixed the problem.

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
Include your streaming app, canvas size, skin name, and steps to reproduce when asking for help. Share a cropped screenshot of the issue. Remove private alert URLs, tokens, and personal information first.''')

page('privacy-safety','Privacy & safety','Reference','''Ordinary ChatSkins overlays read public Twitch chat to display it in your stream. They do not send chat messages or perform moderation actions.

## No account for ordinary chat
Enter a channel name and generate a link. Optional Twitch connect looks up your login and does not persist its token. Read Connect with Twitch for the exact token handling and permission boundary.

## Local designs and links
Saved designs belong to your browser profile. Export a backup if you want to keep them across devices or browser resets. Your overlay URL contains settings and a channel name; anyone with it may inspect those settings. Do not put secrets into custom CSS, image URLs, or other appearance fields.

## External services
Twitch supplies chat. Enabled community emote providers supply their own assets. Fonts and external background images may also require network requests. Those services can receive normal request information such as an IP address; consult their policies for their handling of it.

## Private event links
Alerts and channel-point features need separate permissions and credentials. Keep private links out of public screenshots and support requests. Replace a leaked link before using it again.

## Display safety
Filters affect the on-stream display, not Twitch moderation. Keep channel moderation in place. Use a readable font, test bright gameplay, and respect reduced-motion preferences so viewers can follow the conversation.''')

page('request-a-skin','Request a skin','Reference','''Have a look in mind that the catalog does not cover? Describe the visual idea and how you want to use it. A request is a suggestion, not a guaranteed commission or delivery date.

## Tell us what matters
Give the idea a short name. Describe the frame, typography, palette, and mood. Explain whether chat should feel like a continuous window, separate bubbles, or plain text over gameplay. Mention any important channel labels or motion.

## Add a useful reference
Link to a reference you are allowed to share and identify the details you like. Ask for an original interpretation rather than a copy of someone else's artwork. Do not include private files, alert links, or access tokens.

## Send the request
Open Request, complete the required fields, and submit once. Wait for the success confirmation before closing the page. If submission fails, keep your text and try again after checking the connection. A successful submission means the idea was received, not that it has been scheduled.''')

page('faq','FAQ','Reference','''Quick answers before you go live.

## Is ChatSkins free?
Yes. The 42 catalog skins and ordinary overlay setup are free. No login is required to display public Twitch chat.

## Do I need a plugin?
No. Use a Browser Source or web source in your streaming app. Paste your generated overlay link and set the canvas dimensions.

## Can I use it outside OBS?
Yes, in an app that supports a suitable browser or web source. See Add to your streaming app for Streamlabs, XSplit, Meld, vMix, and other setups.

## Does it change my Twitch chat?
No. Skins change the appearance of the on-stream overlay. Filters do not delete Twitch messages, and MMO labels do not create private chat rooms.

## Why does a saved link show an older design?
The link contains the settings from when you copied it. Copy a fresh URL after editing and replace the one in your source.

## Can viewers change the skin?
The proposed chat-powered controls let you choose an approved list, permissions, and cooldowns. Availability depends on that integration shipping; the ordinary read-only chat connection alone does not enable it.

## Are alerts included in the chat URL?
The proposed alert setup uses a separate private Browser Source URL. Keep that link private and verify the event integration is available before relying on it.

## Will My skins sync to another computer?
Local saved skins do not automatically sync. Export them and import the backup into the other browser.''')

page('changelog','Changelog','Reference','''Follow changes to the website, editor, and overlay experience. This design preview does not assign release dates to unfinished work.

## Round 9 — design preview
Proposed: a black-and-blue website, a live skin collage, a refreshed gallery, and searchable documentation with section navigation. The editor keeps its existing control structure and preview ergonomics.

## Proposed audience controls
The design includes !skin, !skinvote, channel-point mappings, cooldowns, and a stop control. These need a completed integration and verification before being announced as available.

## Before publishing a release entry
Replace design-preview wording with a verified release date and the behavior that actually shipped. Include any required migration steps, especially when users need to copy a new overlay link. Never treat a mockup or a test alert as evidence that a production integration is live.''')

out = ROOT/'docs-content'
out.mkdir(exist_ok=True)
for p in pages:
    p['headings'] = re.findall(r'^## (.+)$', p['markdown'], flags=re.M)
    outline = '<!-- Outline: '+ ' | '.join(p['headings'])+' -->\n\n'
    (out/(p['slug']+'.md')).write_text(outline+p['markdown'],encoding='utf-8')
(ROOT/'docs-content-index.js').write_text('window.docsContent = '+json.dumps(pages,ensure_ascii=False)+';\n',encoding='utf-8')
print('Wrote',len(pages),'documentation pages')
