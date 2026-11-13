# Design rules (keep these when you remix)

## Controls
- **Arrow keys** walk, **Shift** runs. **Q** and **E** turn the view (**R** resets it).
  **Enter** or **Space** inspects or acts. **1–4** pick an answer. **Esc** closes a panel.
- **Select** the floor or an item to walk there. Dragging to turn the view is optional, never required.
- The checklist groups items by area, and its **Go To** list jumps to every place an item
  can go, so the whole activity works from the keyboard alone.
- A controls card shows at the start and fades a few seconds after the learner starts
  moving; the help button brings it back.

## Feedback
- Feedback appears **inside the chosen option**, as text with an icon and a "Correct" or
  "Not quite" label, never colour alone.
- Only the latest wrong answer keeps its feedback open; earlier wrong picks keep their ✕.
- Answer order is shuffled, the same way every time.
- Fixing something is an action in the room, not another question.

## Layout and look
- Panels use proximity: tight spacing (4–10 px) inside a group, bigger gaps (18–24 px) between groups.
- Floating signs name each area and destination, draw on top of walls, and get a check
  mark when an area is done. Anything between the camera and the player fades out.
- Short frames (720 px tall or less) tighten the question panel; the checklist and panels
  scroll inside themselves at the 600×480 minimum.
- Font: Lato (Google Fonts), with a system fallback. The player wears green scrubs.

## Sound and motion
- Background music is generated in code (Web Audio): a soft loop with no audio file to
  license. It fades in on Start; the speaker button or **M** turns it off, and the choice is remembered.
- Confetti on the end screen and other motion are skipped when the learner has reduced
  motion turned on.

## Completion
- When every issue is fixed, the end screen shows a short summary and the game sends
  `postMessage({type:'complete'})` to its parent page once. **Try again** resets everything.
