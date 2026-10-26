NEW TASK (round 23i): painted AI frames work (the live test made a beautiful "Cozy Autumn" frame, now in tests/fixtures/painted-dream-autumn.png at 1024x1536). But the server's window measurement FELL BACK to the default `inner {x:0.05, y:0.05, w:0.9, h:0.9}`, so chat would cover the painted border. The lead's own quick measurement of that image (max empty rect, alpha < 24, 98.5% empty tolerance) gives roughly **x 0.12, y 0.17, w 0.76, h 0.58**.

**Fix in server/dream.mjs:**
1. Find out why measurement fell back (most likely the PNG decode path isn't implemented or failed silently, or the measurement ran on the WebP). Measure the ORIGINAL PNG from the API (base64 → PNG decode). Use a dependency-free PNG decoder (zlib inflate + unfilter; PNG with RGBA 8-bit, the API's format), or decode via ffmpeg (`-f rawvideo -pix_fmt rgba`) using the configured binary.
2. Use the same algorithm as round 14k (the maximal empty rectangle containing the center, speck tolerance, 1.5% margin). The plaque detection already works (the plaque looked right).
3. If measurement truly fails, DON'T fall back to 90%. Retry the measurement via the ffmpeg raw decode; if that also fails, use a conservative default (x 0.15, y 0.18, w 0.70, h 0.60) and log "dream measure fallback".
4. **Test:** measuring tests/fixtures/painted-dream-autumn.png gives an inner window with x in [0.08, 0.16], y in [0.12, 0.2], w in [0.68, 0.84], h in [0.55, 0.75].

Keep the code commented. Run each test file with node directly. Try git add + commit; if it's blocked, say so. Report the files you changed.
