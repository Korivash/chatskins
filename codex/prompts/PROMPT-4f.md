Round 4f: one crash from 4e. Work only inside this folder.

Chromium page error on load of index.html (and so the skin gallery is empty):
`Failed to set a named property 'hide-frames' on 'DOMStringMap': 'hide-frames' is not a valid property name.`

`dataset` keys must be camelCase (`dataset.hideFrames`, which becomes the `data-hide-frames` attribute). Search js/ for EVERY dataset assignment that uses a dashed key (`dataset['x-y']`, or keys from js/frame-attributes.js that contain dashes) and convert them: use camelCase dataset keys, or setAttribute('data-…') consistently. Keep the CSS selectors (`[data-hide-frames]` etc.) matching.

Add a test that every key in the frame-attributes list maps to a valid dataset property (camelCase, no dashes) or is applied via setAttribute.

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
