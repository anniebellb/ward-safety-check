---
name: walkaround-safety-sim
description: Build or remix a walk-around 3D safety simulation for training, like "Ward Safety Check": the learner walks a room, inspects items, answers a question about each one with feedback on every option, then fixes it by doing something in the room (carrying it somewhere, cleaning it up, labeling it). Use when someone wants a hazard-spotting game, a "fix the room" or "spot the problems" simulation, a safety walk-through, or wants to remix Ward Safety Check for their own topic (a lab, kitchen, warehouse, office, classroom…), including non-technical users.
license: MIT (code), CC BY 4.0 (content)
---

# Walk-around safety simulation

Builds a single-file 3D game like the example in this repo (`index.html`, "Clinic Safety
Check"): a learner walks a hospital ward, inspects items, answers a question about each,
then fixes what's wrong by acting in the room. It runs in any browser, needs nothing
installed, and can be embedded in a lesson or LMS as one HTML file.

Paths below are relative to this skill's folder (`${CLAUDE_SKILL_DIR}`).

**Read first:** [references/content-guide.md](references/content-guide.md) (how items,
questions and fixes are written) and [references/design-rules.md](references/design-rules.md)
(controls, accessibility, feedback and layout rules the game already follows; keep them).

## Who you're working with

Assume the user is **not technical**. Speak plainly, one step at a time. Never ask them to
edit code. Show them the game in a browser at each checkpoint and ask what to change.

## The workflow

### 1. Understand the topic
Ask (in one message, only what you don't know):
- **Who** is learning, and what **situation** they'll be in (a ward, a lab, a kitchen…).
- **What can go wrong** there: the 6–10 hazards or mistakes that matter most.
- **What "fixed" looks like** for each, and **why** it matters (one plain sentence).
- Whether they have their own rules or guidance to follow. If they do, ask for it, and
  use it for the "why" lines. **Never invent organisational policy**, and never quote a
  real organisation's internal documents unless the user owns them and says it's fine.

### 2. Decide: same room, or a new one?
- **Same room (fastest):** keep the hospital ward and its props, and rewrite the items'
  words. Works for any healthcare, lab or care setting.
- **Adapted room:** keep the engine and change props and layout in `assets/game/parts/c-game.js`
  (models live in `b-engine.js`). Say plainly that this takes longer.
Tell the user which you recommend and why. Wait for a yes.

### 3. Write the content (checkpoint)
Copy `assets/game/` to a new project folder. Rewrite the `ITEMS`, `WHY`, `AREAS`,
`DEST` and `SUMMARY` blocks in `parts/a-head.html`, following
[references/content-guide.md](references/content-guide.md):
- Each item: a one-sentence scenario, one question, 3 options (4 at most), feedback on
  **every** option that says *why*, and a fix the learner does in the room.
- Include 1–2 **look-alikes** (things that look wrong but are fine).
- Show the user the items as a plain list (not code) and get approval before building.

### 4. Build and check
- `python3 build.py` (from the repo root) writes `index.html` with three.js inlined.
- Serve the folder (`python3 -m http.server 8765`) and open `index.html#debug`. Run the
  full playthrough in the console (see [references/self-checks.md](references/self-checks.md));
  every check must pass. Update its wording checks for the new topic.
- Open `index.html` (no `#debug`) and play it yourself at a laptop size and at tablet
  portrait (768×1024). Nothing should overlap or scroll at 1100×760.

### 5. Show the user (checkpoint)
Give them the link to open, and walk them through what to try. Ask what to change.

### 6. Share it
- **A link:** GitHub Pages (Settings → Pages → Deploy from branch → `main` / root) serves
  `index.html`.
- **In a lesson or LMS:** upload `index.html` as a custom HTML or code block. When the
  learner finishes, the game sends `postMessage({type:'complete'})` to the page it's
  embedded in, for tools that track completion.
- **On LearnCurio:** submit it at getlearncurio.com/submit so others can remix it.

## Self-check at every step
- Every learner-facing fact is either from the user's own guidance or plainly general
  practice, and nothing quotes a real organisation's internal documents.
- Every wrong option's feedback explains why and points to the right answer.
- The playthrough passes, there are no console errors, and the game works with the
  keyboard alone.
