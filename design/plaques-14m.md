# Plaque locations — round 14m

Visually inspected all 30 supplied grid images. Coordinates are fractions of the full image, measured from the top-left; rectangles are inset text-safe areas, not outer plaque bounds. These are visual measurements, not pixel-perfect segmentation. Tall images are 800×1200, wide images are 1200×800 except Neon Kawaii Goth wide (1200×675); its square is 1200×1200.

- **No plaque:** Crescent Moon tall, Neon Kawaii Goth square, and Neon Kawaii Goth wide. Their rectangles specify proposed small title bands inside the top of the chat opening. Their dark tone assumes a dark band; the underlying opening is transparent. The neon rails are frame trim, not nameplates. All three have `none: true` and `painted: false`.
- **Demon Throne, both shapes:** the nameplate is the black horizontal plate BELOW the eye, not the eye itself. A central gold spike divides the plate. The rectangle uses its clear left half to avoid drawing through that spike.
- **Mothlight, both shapes:** the plaque is the cream scroll BELOW the moth. Long moth tails overlap its middle. The rectangle uses the clear left section, excluding the tails and curled border.
- **Solar Oracle, both shapes:** the plaque is the curved ivory ribbon beneath the sun. The sun and rays obscure the center; the rectangle uses the clear left section. A wide, centered rectangle would intersect the sun or leave the curved ribbon.
- **Haunted Manor, both shapes:** the blank central gravestone is the name plaque. Rectangles exclude the arched top, stone edging, and flanking candles/scrollwork.
- **Star Oracle:** the cream scroll is light despite the surrounding dark sky. The tall rectangle is shallow to clear the central gold ornaments above and below it.
- **Sticker Bomb:** the silver duct tape is the title surface (light). The tall rectangle accounts for its slant; the wide rectangle avoids the large folded crease toward the right.
- **Neon Hex:** the top-left angular neon enclosure is the plaque, even where its interior looks transparent against the grid background. Use a dark fill behind contrasting title text.
- **Painted titles:** Bunny Princess tall, Crowned Kittens tall, Neon Kawaii Goth tall, Neon Kawaii Goth Minimal tall, Sword and Shield tall, and Tactical Gunmetal tall already say CHAT. Their rectangles describe the title area for replacement; the existing lettering must be removed or covered before a new name is drawn. Tone describes the underlying plaque fill, not the painted lettering.
- **Small or off-center areas:** the ornament-obstructed plaques above cannot accommodate a large centered name without covering artwork. These rectangles deliberately preserve that artwork; use smaller text or a separate title band if more width is required.

Only the 30 chat-frame grid images are included. The two webcam entries in frames.json have no supplied grid image and are outside this set. No production metadata or artwork was changed.
