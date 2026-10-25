Round 8b: the domain part of round 8 was missed. The site now lives at **https://getchatskins.com/** (chatskins.korivash.com 301-redirects there). Both URLs are registered as Twitch OAuth redirect URLs.

1. js/twitch-auth.js line ~13 and js/alerts-auth.js line ~6 hard-code `https://chatskins.korivash.com/` as the OAuth redirect_uri. Use `location.origin + '/'` (one shared helper), so login works on any origin the site is served from. Add a test for the authorize-URL builder using a fake origin.
2. Replace every user-visible "chatskins.korivash.com" with "getchatskins.com": README.md (all links, incl. "Live site"), docs/content/*.md, site copy, the FAQ and footer. No hard-coded host should remain in js/ (grep it).

Change nothing else. Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
