NEW TASK (round 22): **make the code readable and organized for the judges.** The owner asked: "make sure luna is putting comments in the code to organize it all". NO behavior changes: every test must pass unchanged, and the output must be byte-identical in rendering.

For every file in js/, css/, server/ and tools/:
1. **A file header comment** (3–6 lines): what the module does, where it's used (which page/overlay), its main exports, and important invariants (e.g. "tokens stay in the URL hash, never sent to our server").
2. **Reformat dense one-line code** into normal multi-line, indented code: one statement per line, functions on their own lines. Use a consistent 2-space style. Don't use a formatter dependency; do it by hand or with a tiny node script in tools/ that you write.
3. **A short JSDoc comment** on each exported function (purpose, params, return) and on non-obvious internal helpers.
4. **Section comments** inside long files (`// ---- Fit to panel ----`, etc.) grouping related code.
5. **CSS:** section headers per component/skin family, and a one-line note on any tricky rule (e.g. why background-clip text isn't used for plaques).
6. Keep comments factual and brief, no fluff, no mention of AI tools in the comments.

Also add `docs/ARCHITECTURE.md`: a one-page map of the codebase (the pages → modules → data files → server endpoints), the data flow of an overlay link (editor settings → compact link → overlay decode → render), and where each feature lives.

From now on, every new round keeps this standard (header + JSDoc + sections, no dense one-liners).

Run each test file with node directly and confirm they all still pass. Try git add + commit; if it's blocked, say so. Report the files you changed.
