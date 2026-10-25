Round 14l: the owner says "Your channel name/font needs to match". The plaque title (the streamer name + "LIVE CHAT") uses generic fonts and colors that don't match each frame's art.

Give every frame its own title style that looks painted into the art: a Google Font, color/gradient, and a CSS effect (glow, emboss, metallic gradient, drop shadow, outline), stored per template in skins.json (titleStyle) and applied to the plaque. Suggested pairing (refine by looking at each frame image):
| frame | font | look |
|---|---|---|
| mothlight | Cinzel Decorative | antique gold gradient + soft inner shadow |
| royal-court | Cinzel Decorative | gold leaf on cream (dark brown outline) |
| solar-oracle | Marcellus SC | pale gold + soft glow |
| star-oracle | Cinzel | gold on navy |
| demon-throne | Pirata One | blood-red to ember gradient + dark glow |
| haunted-manor | Creepster | ghostly lavender glow |
| lava-forge | Metal Mania | molten orange gradient + ember glow |
| cozy-cafe | Pacifico (or Caveat Brush) | cream chalk on wood |
| sticker-bomb | Bangers | white with a thick black outline, slight tilt |
| sugar-static | Bungee | candy pink/cyan gradient + glossy highlight |
| neon-hex | Rubik Glitch (or Permanent Marker) | hot-pink/cyan neon tube glow |
| neon-kawaii-goth / minimal | Permanent Marker | neon pink brush with glow (like the original "CHAT" art) |
| bunny-princess / crowned-kittens | Fredoka (bold) | hot pink with a white outline and a sparkle |
| sword-and-shield | Cinzel | steel/gold engraved |
| tactical-gunmetal | Black Ops One | stencil white/orange on gunmetal |
| crescent-moon | Cormorant Garamond (italic) | uses the frame color the user picks, soft glow |

- The sub-label ("LIVE CHAT") uses a smaller matching font.
- Auto-fit still applies.
- Contrast with the plaque stays ≥ 4.5:1 (keep the 14g test).
- The Crescent Moon title follows the frame-color control.
- Load only the fonts of the active skin (one Google Fonts request per skin, display=swap).
- **Test:** every frame skin has a titleStyle with a font family, a color, and a passing contrast.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
