Round 12 (Astra, design + build): a HIGHLY ANIMATED interactive README page at `/readme.html`, for the Codex x TwitchCon judges. Write ONLY these new files: readme.html, css/readme.css, js/readme.js. Don't touch other files.

**Goal:** the most impressive project page a judge sees today. A scroll-driven story of ChatSkins that feels like a game launch site, in the site's black + blue look (reuse css/tokens.css), and as polished as the best product launch pages.

**Content (all true; take facts from README.md, docs/CODEX-SESSIONS.md, design/skins.json, marketing/devpost-about.md):**
1. **Hero:** "Your stream chat, skinned." A live animated chat. Import the real renderer (js/render.js / skin-preview.js, the same as skins.html) so real skins cycle in the hero with fake messages. Buttons: Try it free (/editor.html), Browse skins (/skins.html), GitHub (https://github.com/Korivash/chatskins).
2. **Count-up stats:** the skin count read from skins.json, animated skins, Codex sessions (31+), commits (120+), test files (37+), 1 link. Count up on scroll into view.
3. **"Pick. Tweak. Paste."** A 3-step animated walkthrough.
4. **Skin wall:** an infinite marquee of real skin previews (rendered live from skins.json, grouped by category), with hover to pause and click to open /skins.html?skin=<id>.
5. **Chat play:** an animated demo of `!skin guild` swapping a live preview, plus a !skinvote bar race and emote rain (reuse the existing chat play preview modules if possible; otherwise a faithful CSS animation).
6. **Works on real Twitch:** the video `site-media/demo.mp4` (muted autoplay loop of a short section, with a "Watch the full demo" button that plays it with sound in a lightbox).
7. **Built with OpenAI Codex:** an animated agent-team diagram (Astra designs → Luna builds + tests → Claude reviews, tests in a browser, deploys), with data packets flowing along the lines. Then the loop: design → build → test → measure → fix, as an animated cycle. Then a sample of real prompt file names from codex/prompts/ scrolling like a terminal, and a highlighted card with the main Codex build thread session ID from docs/CODEX-SESSIONS.md.
8. **Gallery:** images from site-media/*.jpg and site-media/all-skins.png, with a lightbox.
9. **Footer:** "Free · No login · Built with OpenAI Codex for the Codex x TwitchCon Hackathon", plus links to the site, the GitHub repo and the docs.

**Rules:**
- Plain HTML/CSS/JS modules, no dependencies or CDNs except Google Fonts as the site already uses.
- Animations: IntersectionObserver-triggered, GPU-friendly (transform/opacity), 60 fps; respect prefers-reduced-motion (static fallbacks). NO motion blur effects.
- Mobile-friendly; no horizontal scroll at 375 px.
- NEVER include server details: no IPs, hostnames other than getchatskins.com/github.com, file paths, ports, "VPS", pm2, IIS, Windows, Cloudflare, or infrastructure words. No personal names except the public handle Korivash.
- Accessible: semantic sections, alt text, focus states, keyboard-operable lightbox.
- Add a "README" link to the site header nav on readme.html only. Don't edit other pages.

Print a short summary of what you built.
