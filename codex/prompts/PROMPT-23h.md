NEW TASK (round 23h): make AI-designed skins actually look good. The owner on the parts-built AI designs: "it did a pretty terrible job". The painted version never works: the server logs "Dream painting unavailable" because `gpt-image-1` does NOT exist on this account (API: "The model 'gpt-image-1' does not exist").

The lead tested the image API live: `gpt-image-2.5-flare` and `gpt-image-1.5` both support `background:"transparent"` and produce excellent frames (8–15 s at 1024x1536, quality "medium"). gpt-image-2 does NOT support transparency.

**Fix:**
1. **The image model** is env `DREAM_IMAGE_MODEL` (default `gpt-image-2.5-flare`, fallback `gpt-image-1.5` on 400/404). Size 1024x1536 (tall chat) by default, quality "medium", `background:"transparent"`, `output_format:"png"`; convert to WebP for storage (≤ 400 KB).
2. **The prompt template** (proven): "Decorative frame for a live-stream chat overlay. <user's description, cleaned>. A BLANK name plaque at the top center. The CENTER is completely EMPTY and transparent (at least 70% of width and height). Transparent background outside the frame. Rich, polished illustration. No text, no letters, no logos, no real people, no existing characters."
3. **After generation:**
   - Validate the transparency: the center 40% box must be ≥ 95% transparent, else retry once with a stronger "empty center" prompt.
   - Measure the inner window + plaque automatically (reuse the round 14k measuring logic: max empty rect with speck tolerance; plaque = the largest light/solid band near the top inside the frame).
   - Then serve it as a FRAME TEMPLATE skin (same as site-media/frames), so the name plaque, window fit, color/glow controls and Place it all work.
4. **The painted frame is the MAIN result.** The parts design shows instantly as a placeholder ("Painting your frame… ~15s") and is replaced automatically when the painting arrives. Keep "Use parts version instead" as a small option.
5. **Storage/serving:** keep the painted image with the submission (server-data, outside the web root) and serve it read-only via `GET /api/dream-image/<id>.webp` (an unguessable id) with long cache headers. The design link references that URL so the streamer's OBS link works immediately.
6. **Limits stay:** 20 images/day total, 2/IP/day; fall back to parts with a friendly note.
7. **Tests:** model fallback on 400; the transparency check + retry; window/plaque measurement on a fixture PNG (add a small 256x384 fixture); the image endpoint serves only valid ids.

Keep the code commented. Run each test file with node directly. Try git add + commit; if it's blocked, say so. Report the files you changed.
