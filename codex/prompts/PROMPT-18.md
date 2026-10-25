Round 18 build: a **"Place it" (arrange) mode** in the editor. The owner asked: "What if we have an editor mode where people can place it?" Streamers should be able to position everything by dragging, with no numbers.

**In the editor preview (the scaled 1280x720 / 1920x1080 stage), add a "Place it" toggle button on the preview toolbar.** When it's on:
1. **Move + resize the whole chat** (frame + chat) on the canvas: drag to move, corner handles to resize (keep the frame aspect when a frame skin is active; free resize otherwise). Snap to the canvas edges, the center lines and a 5% grid, with a visible guide when snapping. A "Fit to … " menu offers Bottom-left, Bottom-right, Left side, Right side, Center (one tap).
2. **Adjust the chat area inside a frame:** four edge handles (top/right/bottom/left) on the frame's inner window let the user nudge where messages sit, plus a "Center chat" button (equalizes the left/right padding) and "Reset to frame default".
3. **Move the name plaque text** a little (drag), with a "Reset" option.
4. Show a live safe-area outline of the canvas, and a ghost of a 16:9 game frame so people see where it will sit on stream.

**Persistence:** store the positions as percentages of the canvas (panel x/y/w/h, inner-window offsets, plaque offset) in the settings. They go into the compact OBS link (round 11c) and the overlay applies them exactly. Old links (no positions) keep their current layout.
- **Accessibility:** the arrow keys move the selected element (Shift = 10x), and every handle has a label.
- **Mobile:** a simplified version (move + size presets only).
- Undo/Redo covers every drag (one step per drag).

**Tests:**
- percent positions round-trip through the link
- the overlay renders the panel at the stored rect at 1280x720 and 1920x1080
- "Center chat" equalizes the padding
- the inner-window offsets keep messages inside the frame art
- the keyboard moves work
- Undo reverts a drag

Run each test file with node directly. Try git add + commit; if it's blocked, say so. Print a short summary.
