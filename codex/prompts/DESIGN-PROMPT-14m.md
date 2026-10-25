Round 14m (Astra, vision task): find the exact NAME PLAQUE on every frame image. The current plaque rects in site-media/frames/frames.json are guesses, so the streamer name lands off the plaque on many frames (see design/qa-14l-plaques.png).

The attached images are every chat frame, with a grid: lines every 5% of the width/height, labeled in % along the top and left. The file names match `<id>-<shape>` (they're also in design/plaque-grid/).

For EACH image, look at it and report the plaque: the blank banner/plate/scroll/sign area where a title belongs (usually at the top: a scroll, nameplate, ribbon, wooden sign or neon box). Give:
- `x, y, w, h` as fractions (0–1) of the image: the rectangle INSIDE the plaque where text can sit without touching its border.
- `painted`: true if the plaque already has painted text (like "CHAT"), else false.
- `tone`: "light" or "dark" (the plaque fill), so text color can contrast.
- `none: true` if the frame has no plaque at all (then the title goes in a small band at the top of the chat window instead).

Write the result to `design/plaques-14m.json` as `{ "<id>-<shape>": {x,y,w,h,painted,tone,none?}, ... }` for all of them, and a short notes file `design/plaques-14m.md` explaining any ambiguous ones.

Don't edit any other files. Print a short summary.
