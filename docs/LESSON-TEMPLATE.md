# Lesson template

How to build a lesson module, written from the one that exists:
[`app/lessons/01-noticing/index.js`](../app/lessons/01-noticing/index.js). Read that file
alongside this document. Where the two disagree, the file is right and this document is stale.

Three documents bind before this one. [VOICE.md](VOICE.md) governs every word a reader can
see. [PEDAGOGY.md](PEDAGOGY.md) governs the screen: the six beats, the commitment gate, the
depth mechanism, the required distortion. [CURRICULUM.md](CURRICULUM.md) governs what the unit
is for, and `app/curriculum.js` is the machine-readable version of it. This document is the
how, not the what.

---

## 1. The contract

A lesson is one ES module in `app/lessons/<id>/index.js` with a default export:

```js
export default {
  id: '01-noticing',          // matches the id in app/curriculum.js and the URL hash
  unit: 'I',                  // the `part` field from curriculum.js, not the unit number
  title: 'Bigger, smaller, how sure',
  question: 'How do I know one pile is bigger than another, and how sure am I?',
  minutes: 20,
  render,
};
```

`id`, `title`, `question` and `minutes` copy the unit's entry in `app/curriculum.js` word for
word. The map card is built from that file and the lesson header is built from this one, so a
reader who clicks a card and lands on a different title has caught us being careless. Add the
import to the `lessonModules` array in `app/main.js` and set `status: 'ready'` in the
curriculum in the same commit.

`render(root, ctx)` is called with an **empty** root every single time the reader arrives,
including the second time. The router rebuilds from scratch rather than reconciling, which
kills the whole "second visit looks wrong" class of bug, and it means no lesson may keep state
at module scope. Everything mutable is built inside `render`.

### What is in `ctx`

| Field | What it is |
|---|---|
| `ctx.ui` | the `ui.js` module: `slider`, `segmented`, `button`, `toggle`, `readout`, `seedBox`, `quiz`, `steps`, `figure` |
| `ctx.stats` | the `stats.js` module, pure functions |
| `ctx.viz` | the `viz.js` module; `ctx.viz.stage(canvas)` binds a drawing stage |
| `ctx.engine` | `loop`, `tween`, `ease`, `reducedMotion` |
| `ctx.rng` | a generator already seeded with this page's world |
| `ctx.makeRng` | the factory, for building any other world on demand |
| `ctx.seed` | the world number the reader arrived with, from `?w=` |
| `ctx.setSeed(n)` | writes a world into the address bar |

The published module contract promises `ctx.stage` and a bare `ctx.rng`; `app/main.js` sends
`ctx.viz` and `ctx.makeRng`. Unit 1 resolves both at the top of `render` and throws one plain
error if it ends up without a toolkit, which the router catches and shows honestly. Copy that
resolver until the two agree, and delete it the day they do.

---

## 2. The shape of the file

Unit 1 is laid out in this order, and a new lesson that follows it will read as the same
codebase to somebody landing in it cold:

1. **Header comment.** Two to four lines: what the reader does here, in plain words.
2. **Scenario constants.** The names, the true parameters, the sample sizes, the axis maximum.
   One place to change the world, and a reviewer can read the entire setup in twenty seconds.
3. **DOM helpers.** `el`, `block`, `para`, `quiet`, `heading`, `named`, `warned`, `controls`,
   `readoutRow`, `liveBox`, `asButton`, `deeper`. Copy them. They are short on purpose and
   they keep the class names in one place per file rather than sprayed through the prose.
4. **Data helpers.** How a simulated observation is made and how it becomes a point.
5. **Drawing helpers.** The figure grammar this lesson uses.
6. **`mountFigure`.** One canvas, its resize handling, its spoken description.
7. **One function per beat**, in reading order.
8. **`head`**, `makeState`, **`render`**, then the default export.

The payoff is in `render`: the list of section calls is the lesson's outline, and it fits on
one screen.

```js
body.append(
  sectionMiddle(kit),
  sectionOverlap(kit, state),
  sectionWorlds(kit),
  sectionApply(kit),
  sectionCrop(kit),
  sectionRecap(kit, state),
);
```

### `kit` and `state`

`kit` is the toolkit plus two arrays the lesson owns: `kit.redraws`, one draw function per
figure, and `kit.bin`, teardown jobs. A section never reaches for a global and never imports a
core module directly, so a lesson can be tested by handing `render` a stub context. Unit 1 was
checked that way before it shipped, with a fake `ui`, the real `viz.js`, and a canvas context
that throws if a label is ever placed at a coordinate that is not a finite number. That harness
is not in the repository yet, and it is the next thing worth adding to it.

`state` is the small set of things that cross a section boundary, and it is a **subscription**,
not a plain object. Every section is constructed in one synchronous pass, so a later section
that reads `state.something` at build time reads the value it had before the reader touched
anything, which is always the empty one. Unit 1's recap therefore registers a watcher:

```js
state.onLine((v) => { mine.replaceChildren(para(`Your line came in at ${min1(v)} minutes.`)); });
```

and the second instrument calls `state.setLine(gap)` when the reader commits. Keep the whole
thing small enough to list in a comment.

---

## 3. The six beats, as they appear in unit 1

| Beat | Section | Instrument | The commitment | What gets named |
|---|---|---|---|---|
| Manipulate, Notice | `sectionMiddle` | 30 dots, one marker | press "Mark it" | the mean |
| Manipulate, Notice | `sectionOverlap` | two crowds, one dial | press "Draw the line here" | a null result |
| Notice | `sectionWorlds` | 12 dots each, rolled | predict before rolling | sampling variation |
| Apply | `sectionApply` | `ui.quiz`, a school | pick an option | |
| Question the claim | `sectionCrop` | two bars, one switch | flip the axis floor | |
| Close | `sectionRecap` | `ui.steps` | | the three names and the distortion, each with the unit that picks it up |

The Formalise beat is missing on purpose. Section 6 says when you are allowed to do that.

Four instruments is the ceiling from PEDAGOGY section 1, and unit 1 sits on it. A fifth
instrument means the unit is two units.

---

## 4. Patterns worth copying

**The click is the commitment.** Do not gate the primary button behind a drag. A `disabled`
button is not in the tab order, so a keyboard reader meets a control that does not exist yet
and no explanation of why. The reveal is gated by the press, the marker has a sensible starting
position that is deliberately not the answer, and a reader who presses without moving anything
has still committed to something and gets a true sentence back.

Where one control genuinely depends on a commitment made by another, as with the prediction
that has to happen before the first roll, disable it and put the ask directly above it in
reading order. That is one gate on the whole screen, and it earns its keep.

**Declare handler-visible variables as `let x = null` above the control that touches them.**
A `ui` implementation that fires its callback once during construction would otherwise hit the
temporal dead zone and take the screen down. This bit unit 1 in review: the world box's
`onChange` calls a function that writes the number back into the box.

**Reveals land in an `aria-live="polite"` box.** Build the box empty, append the `.named` block
into it when the reader commits. A screen reader then hears the naming move at the moment it
happens instead of the reader having to go looking for it.

**Fix the draws, move the parameters.** A simulated person is stored as a standardised draw and
a fixed jitter. The dials place them: `wait = average + spread * draw`. Because the draws never
change, turning a dial slides the crowd instead of replacing it, and the reader can see that
the only thing that moved is the thing they moved. Regenerating on every input would throw
sampling variation into an instrument that is not about sampling variation.

**Freeze the axis.** `domain(0, X_MAX, 0, 1)` on every frame of the crowd figures. An axis that
rescales to its data hides exactly the motion the instrument exists to show. When the axis is
the subject, as in the distortion beat, the axis moves and nothing else does.

**Set padding wide enough that the axes never have to grow it.** `axisX` pushes the bottom
padding out to 28 px to make room for its numbers, and `axisY` widens the left gutter to fit
its widest label. Both mutate the box that the other one has already measured against, so an
`axisY` drawn before an `axisX` puts its labels 18 px below the gridlines they belong to. Pass
the room in `pad()` up front and the ordering stops mattering.

**One role, one colour.** `data` for observations, `truth` for the parameter that never moves,
`result` for an estimate, `ink` for something the reader placed themselves. Never pick a colour
because two rows needed telling apart: two rows are told apart by being two rows.

**Numbers live in readouts, shapes live on the canvas.** `ui.readout` gives a number a label, a
tone and a text node a screen reader can reach. Piling the same numbers onto the canvas as
labels makes a figure that is busy on a desktop and unreadable at 375 px.

**Every canvas gets a spoken description that changes with the picture.** `mountFigure` takes a
`describe()` closure and writes its result to `aria-label` after every draw, and only when the
sentence has actually changed, so a running tween does not narrate itself sixty times a second.
The sentence says what a sighted reader would take away, with the current numbers in it. Run
the figure-vanishes test from VOICE section 5 on it.

**Clean up after yourself.** Figures observe their canvas for resizes and the lesson listens for
a switch to dark mode. The router empties the mount without telling anyone, so every listener
goes into `kit.bin`, `bin` is drained on the next `hashchange`, and every handler that can
outlive the screen starts by checking `isConnected` and disconnecting itself if it has been
thrown away. Route changes that do not fire `hashchange` exist, so the guard is the belt and
the bin is the braces.

**Animate once, and only where the motion is the point.** Unit 1 tweens the dots between
worlds, because watching the crowd rearrange itself is the thing that makes sampling variation
felt. `engine.tween` jumps to the end state for a reader who has asked for reduced motion,
which is only safe because the still frame carries the same information. No `loop` runs when
nothing is moving; a permanent animation frame on a cheap phone is a battery bill.

**Worlds are strings, and only the choice of world is random.** Each figure seeds its own
generator with a string that names it, `makeRng('01-noticing/quiet/' + world)`, so two figures
in the same world never accidentally share a sequence. `Math.random` appears exactly once,
choosing which afternoon to visit next, and everything inside that afternoon is rebuilt from
its number. That is what makes "everyone type world 42" work.

**Leave `?w=` alone once the screen is running.** It is tempting to call `ctx.setSeed` every
time the reader rolls, so the address bar always carries the picture on screen. Unit 1 does not,
because the roll only rebuilds the third figure: writing the new world into the URL would mean
that a reload silently redrew the first two figures and threw away the marks the reader had
made on them. The world box shows the number, and the prose says that typing it back brings the
afternoon back. A lesson whose every figure moves together can and should write the URL.

**Depth is a native `<details class="deep">`.** It opens with no JavaScript, it prints, and a
screen reader can find it. The summary names the content, never the reader: "The other middle,
and why both exist" rather than "For the mathematically inclined". If the block is load-bearing
for the unit's question, it belongs in the main lane. Three per unit is the ceiling; unit 1 uses
two.

---

## 5. Prose that has to stay true

The screen writes sentences about what the reader did, which means the code has to know whether
they did it, and has to stop claiming it the moment it stops being true.

Two rules fall out. Anything the reader can still change does not get quoted in a fixed
paragraph. Unit 1's naming block describes the second tick without naming the distance to it,
because the marker is still live after the reveal and the distance moves; the distance lives in
a readout that updates. And anything the reader might never do gets a general sentence by
default: the recap only quotes the line from the second instrument once a line exists. A recap
that invents a number the reader never chose is the exact failure the site is built against,
and it is invisible in testing because the happy path always sets the flag.

Captions are written once, at construction, so they cannot mention anything that changes.
Anything live belongs in a readout, in the spoken description, or in the reveal.

---

## 6. Where unit 1 deviates, and when you may

**No notation at all.** PEDAGOGY's Formalise beat says the reader picks up something portable,
and CURRICULUM.md's entry for this unit expects tally marks and place value as the first
compression the reader meets. Unit 1 as built carries three phrases instead, "the mean", "a
null result" and "sampling variation", each attached to a move the reader made with their
hands. The argument for the cut: the reader has done no arithmetic here, so a symbol would have
nothing to compress, and the unit already spends its whole budget on making the eye's judgement
respectable.

This is a deviation with a rule attached: **skip the notation only when the reader has not yet
performed an operation worth compressing.** Unit 5 is the notation gate and by then the excuse
is gone. If you take this exemption, say so in the pull request and expect to be argued with.

**Three naming blocks rather than one.** PEDAGOGY allows one `.named` block per idea and warns
that four means the unit is teaching four things. Unit 1 teaches one claim, that noticing is
measuring, and names the three moves the reader made while doing it. If your three names do not
collapse into one sentence about the unit's question, you have three units.

**A single crowd first, not two.** The suggested opening was two rows of dots and "which sits
further right", which is what the home page already does before the reader ever reaches a
lesson. Repeating it as the first beat of the first unit spends the best moment in the course
twice. Unit 1 opens on one crowd and one marker instead, and saves the two-row comparison for
the beat where the reader is turning the gap down.

---

## 7. Before opening the pull request

- [ ] `render` called twice into fresh roots produces two working screens.
- [ ] Nothing mutable lives at module scope.
- [ ] The unit's entry in `app/curriculum.js` matches the export, including `minutes`.
- [ ] Every reveal is gated behind a commitment, and every commitment is one click or one drag.
- [ ] No sentence on screen can be made false by a control the reader can still move.
- [ ] The distortion is operable by the reader and uses only true numbers.
- [ ] Every canvas has `role="img"` and an `aria-label` that changes with the picture.
- [ ] Every control is reachable and operable from the keyboard, and focus is visible.
- [ ] The whole screen works at 375 px wide, and at 320 px.
- [ ] A reduced-motion reader loses no content.
- [ ] Light and dark both redraw correctly after a theme switch.
- [ ] No `console.log`, no globals, no imports outside `ctx`.
- [ ] The VOICE read-aloud checklist passes on every sentence, including button labels.

---

## 8. Known gaps unit 1 leaves behind

`app.css` has no rule for `details.deep` yet. The element degrades to a plain native disclosure
triangle, which works, but the depth blocks will look unfinished until somebody styles them
alongside `.named` and `.warn`.

`seedBox` is the one builder whose options the module contract does not spell out. Unit 1 calls
it with `{ label, value, onChange }` and guards its own `set` call against a box that fires
`onChange` on programmatic updates. If `ui.js` settles on different names, unit 1 is the file to
update first. The same goes for `slider`, which is called with `fmt` formatting the bare number
and `unit` carrying the word "min", on the assumption that `ui.js` joins the two.

The `installs` line in `app/curriculum.js` still describes the unit that CURRICULUM.md
specifies, where the reader meets subitising failing at four objects, counts sixty-three things
three ways, and leaves a sentence in `localStorage` for unit 13 to reopen. None of that is on
the screen. Either the field comes down to match what unit 1 does, or the missing half gets
built and the four-instrument ceiling gets renegotiated. That decision is open, and it belongs
to whoever writes unit 2, because it is really a question about how much of part I there is.
