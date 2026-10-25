<!-- Outline: Add a small override | Test the result | Recover from a broken look -->

# Custom CSS

Custom CSS is for small visual adjustments that the normal controls do not cover. Start with the built-in controls so your design stays easier to maintain.

## Add a small override
Enable custom CSS in the editor and change one property at a time. Rules are scoped to the overlay. Unsupported or unsafe constructs may be removed; custom CSS does not run JavaScript.

```css
.message-body {
  letter-spacing: 0.02em;
}
```

## Test the result
Check a long name, a wrapped line, and emotes. Avoid changing positioning on every child element or forcing a fixed row height: those changes can clip content. Keep a copy of your working settings before experimenting.

## Recover from a broken look
Disable custom CSS and check the preview again. If that fixes the problem, remove the last override and reintroduce rules one at a time. Keep the streaming app's own Browser Source custom CSS field empty.
