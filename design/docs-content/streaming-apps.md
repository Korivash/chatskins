<!-- Outline: The settings to keep | OBS Studio | Streamlabs Desktop | Twitch Studio | XSplit | Meld Studio | vMix / others | Check the result -->

# Add to your streaming app

ChatSkins works in anything with a Browser Source or web source. The source is a transparent web page that sits above your gameplay.

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
Send a fresh Twitch message. Switch scenes and back. Chat should stay legible and correctly placed. If it restarts on each switch, review the source shutdown and refresh options.
