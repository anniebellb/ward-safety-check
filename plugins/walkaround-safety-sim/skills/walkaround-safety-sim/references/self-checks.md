# Self-checks

Two scripts in `assets/game/qa/` test the game. They only run when the page is opened
with `#debug` in the address (that makes the game loop run on a timer and exposes
`window.__fts`). Neither is part of the game file you share.

## Run them
From the repo root:
```
python3 build.py
python3 -m http.server 8765
```
Open http://localhost:8765/index.html#debug, then in the browser console:
```
s=document.createElement('script');s.src='plugins/walkaround-safety-sim/skills/walkaround-safety-sim/assets/game/qa/final-check.js';s.onload=()=>__final().then(console.log);document.head.appendChild(s)
```

## What they check
- **`final-check.js`**: plays the whole game, choosing every wrong answer first, and
  checks that each wrong answer explains itself, the right answer shows inline feedback,
  every fix works (carrying, sealing, sweeping, labeling), the keyboard controls work,
  the end screen and completion message appear once, and **Try again** resets everything.
  It also fails if banned words appear in learner text (update the list for your topic).
- **`vp-check.js`**: reports any overlapping or off-screen UI in every state.

Both should pass with no console errors before you share the game. Test at 1100×760,
1366×768 and 768×1024 (tablet portrait).
