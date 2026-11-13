# Ward Safety Check

A **walk-around 3D safety simulation**. The learner walks a hospital ward, inspects
what's around three patient bays and a lab prep area, answers a question about each
item (with feedback on every option), then **fixes** what's wrong by doing it in the
room: carrying waste where it belongs, sweeping up broken glass, sealing sharps
containers and labeling what needs a label.

**▶ Play it:** [Ward Safety Check](https://anniebellb.github.io/ward-safety-check/)

It's one HTML file: no install, no sign-in, works with a mouse, a finger or the keyboard
alone, and can be dropped into a lesson or LMS.

This repo contains:
1. **The game** you can play, embed, fork and remix (`index.html`).
2. **A Claude Code skill** that builds your own version for a different topic or setting
   (a lab, kitchen, warehouse, classroom…): it asks what can go wrong there, writes the
   items with you, builds the game and checks it.
3. **The source**, a build script and an automated playthrough check.

## What you need

| To… | You need |
|---|---|
| Play it | Nothing: open the link above |
| Put it in a lesson or LMS | Upload `index.html` as a custom HTML or code block. When the learner finishes, it sends `postMessage({type:'complete'})` to the page it's embedded in. |
| Remix it with the skill | [Claude Code](https://claude.com/claude-code), Python 3, a modern browser |
| Share your version with a link | A free GitHub account (GitHub Pages) or any static web host |

## Use the skill

In Claude Code:
```
/plugin marketplace add anniebellb/ward-safety-check
/plugin install walkaround-safety-sim@ward-safety-check
```
Then ask, for example: *"Make a walk-around safety simulation for a school science lab."*

The skill will:
1. **Ask about your topic:** who's learning, what can go wrong, what "fixed" looks like and why.
2. **Recommend keeping the ward or adapting the room**, and wait for your yes.
3. **Write the items with you** (scenario, question, options with feedback, the fix) and show them as a plain list for approval.
4. **Build the game and check it**: a full automated playthrough plus a look at laptop and tablet sizes.
5. **Show you the result** and help you share it.

It's written for non-technical users and never asks you to edit code.

**Other ways to install:** copy `plugins/walkaround-safety-sim/skills/walkaround-safety-sim/`
to `~/.claude/skills/walkaround-safety-sim/`, or zip that folder and upload it at
claude.ai → Customize → Skills.

## What's in the game

Eight things to fix and two look-alikes: see [`docs/content.md`](docs/content.md).
The content is general safety practice written for learning, not any organisation's own
rules; check your own workplace's guidance before using it for real training.

## Fork it / branch off it

- **Change the words** (items, questions, feedback): all in the CONTENT block of
  `plugins/walkaround-safety-sim/skills/walkaround-safety-sim/assets/game/parts/a-head.html`.
  How to write them: [`references/content-guide.md`](plugins/walkaround-safety-sim/skills/walkaround-safety-sim/references/content-guide.md)
- **Controls, accessibility and layout rules** to keep:
  [`references/design-rules.md`](plugins/walkaround-safety-sim/skills/walkaround-safety-sim/references/design-rules.md)
- **The room and its 3D models:** `c-game.js` (room, items, game logic) and `b-engine.js` (rendering and models).
- **Build:** `python3 build.py` writes `index.html` with three.js inlined.
- **Check:** [`references/self-checks.md`](plugins/walkaround-safety-sim/skills/walkaround-safety-sim/references/self-checks.md)
  runs the full playthrough (55 checks).

## Repository layout

```
index.html                     the game (built), also what GitHub Pages serves
build.py                       assembles the source and inlines three.js into index.html
docs/content.md                every item, what's wrong and the fix
plugins/walkaround-safety-sim/ the Claude Code plugin
  skills/walkaround-safety-sim/
    SKILL.md                   the remix workflow, checkpoints and self-checks
    references/                content guide, design rules, self-checks
    assets/game/parts/         the source: a-head.html (page + all content), b-engine.js, c-game.js
    assets/game/vendor/        three.js r128
    assets/game/qa/            the automated playthrough and layout checks
```

## License

- **Code** (game engine, build script, checks, skill): [MIT](LICENSE)
- **Content** (scenarios, questions, feedback, docs): [CC BY 4.0](LICENSE-CONTENT.md)
  (reuse with credit to Annie Kiele Brown)
- **three.js:** MIT, by the three.js authors
