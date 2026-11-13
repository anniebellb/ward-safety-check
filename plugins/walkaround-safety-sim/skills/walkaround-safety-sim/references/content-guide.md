# Content guide

All learner-facing text lives in `assets/game/parts/a-head.html`, in the CONTENT block.
Change the words there; the game builds its checklist, panels and end screen from them.

## The blocks

| Block | What it is |
|---|---|
| `AREAS` | The parts of the room the checklist groups items by (`{id, name}`), e.g. Bay 1, Lab Prep Area. |
| `DEST` | Where carried things go (`receptacle` and `door`), with a lowercase `name` for sentences and a `title` for signs. |
| `WHY` | The plain-language "why" lines that feedback reuses. Write each once here. |
| `ITEMS` | The things to inspect. Order is the checklist order. |
| `SUMMARY` | Up to 4 short lines on the end screen, one per big idea. |

## An item

```js
{ id:'bag', area:'s1', action:'carry', dest:'receptacle',
  name:'Full Red Bag',                       // title case: checklist row and panel heading
  where:"Bay 1's medical waste container",   // shown under the name
  lower:'red bag',                           // used in sentences ("You're holding the red bag")
  scenario:"The red bag lining Bay 1's medical waste container is full.",
  question:'What should you do with this bag?',
  options:[
    {t:'Tie it with one knot in the middle, double-bag it and take it to the medical waste receptacle.', ok:true, fb:'Right. '+WHY.redBag},
    {t:'Push the waste down to make room for more.', fb:'A full bag is done. Pushing waste down can break the bag. '+WHY.redBag},
    {t:'Set it on the supply cart until someone takes it.', fb:'The supply cart is for clean supplies. '+WHY.redBag}
  ],
  next:'Tie it, double-bag it and carry it to the medical waste receptacle.',  // what to do after the right answer
  prep:'Tie it and double-bag it',            // button label for the first action
  carrying:'Tied and double-bagged. Take it to the medical waste receptacle.',
  done:'In the medical waste receptacle, tied and double-bagged.' }
```

### `action`: what the learner does after answering
- `carry`: pick it up (`prep`), carry it to `dest`. `seal:true` closes a container's lid
  first; `replace:true` puts a fresh one in its place.
- `glass`: fetch the cleanup tools, sweep it up, answer a second question (`glassQ`), then
  put it in the lab's sharps container.
- `label`: fetch labels from the office desk, then apply one (`next` / `nextHave`, optional `labelVerb`).
- `none`: a **look-alike**. Answering is the whole item; it shows "Checked: nothing to fix".

Each item's model is in `c-game.js`'s `BUILD` table and its position in `PLACE`. New kinds of
action or new props mean editing `c-game.js` and `b-engine.js`.

## Writing rules
- **Scenario:** one sentence, what the learner sees. No hints.
- **Question:** short and neutral.
- **3 options**, 4 at most. One right. The wrong ones are mistakes people really make.
- **Feedback on every option.** Wrong: say why it's wrong, then what's right. Right: start
  with "Right." and give the why. The game adds the "Correct" / "Not quite" label itself,
  so don't start feedback with those words.
- **Every fact** comes from the user's own guidance or is plainly general practice. Never
  quote a real organisation's internal policies.
- **Words:** "select", never "tap" or "click". Title case for names, areas and signs;
  sentence case for questions, options and feedback. No Oxford commas.
- **Look-alikes:** include 1–2, so learners judge rather than assume everything is wrong.
