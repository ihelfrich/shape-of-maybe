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
reader who clicks a card and lands on a different title has caught us being careless.

The module reaches the site through `router.register(lesson)`. In this repo `app/main.js` does
that for you: add the import to its `lessonModules` array and set `status: 'ready'` in the
curriculum in the same commit.

`render(root, ctx)` is called with an **empty** root every single time the reader arrives,
including the second time. `router.js` calls `mountEl.replaceChildren()` and rebuilds rather
than reconciling, which kills the whole "second visit looks wrong" class of bug, and it means
no lesson may keep state at module scope. Everything mutable is built inside `render`.

### What is in `ctx`

The published contract promises these:

| Field | What it is |
|---|---|
| `ctx.ui` | the `ui.js` module: `slider`, `segmented`, `button`, `toggle`, `readout`, `seedBox`, `quiz`, `steps`, `figure` |
| `ctx.stats` | the `stats.js` module, pure functions |
| `ctx.viz` | the `viz.js` module, including the `COLORS` palette |
| `ctx.stage` | `stage(canvas)` lifted out of viz, because lessons call it constantly |
| `ctx.engine` | `loop`, `tween`, `ease`, `reducedMotion` |
| `ctx.rng` | a generator already seeded with this page's world |
| `ctx.seed` | the world number the reader arrived with, from `?w=` |
| `ctx.setSeed(n)` | writes a world into the address bar |

`app/main.js` ships three more that the contract does not list: `ctx.makeRng` (the factory),
`ctx.lesson` and `ctx.go`. Two shipped core features are likewise unpublished: `readout`'s
`live` option and `engine.prefersReducedMotion()`. Using them is fine, and every use in
`01-noticing` is guarded with a `typeof` check so the lesson still runs against the contract as
written. Section 8 lists them so that whoever reconciles the two documents can find them.

One dependency cannot be guarded that way. A lesson that lets the reader visit a world by
number needs the factory, not a generator that is already seeded, so `01-noticing` imports
`makeRng` from `../../core/rng.js` and prefers `ctx.makeRng` when it is offered. The fallback
matters more than it looks: a lesson that quietly stopped rebuilding a world from its number
would go on printing "type the same number and the same customers walk in" long after that
sentence stopped being true. Degrade loudly or not at all.

---

## 2. The shape of the file

`01-noticing` is laid out in this order, and a new lesson that follows it will read as the same
codebase to somebody landing in it cold:

1. **Header comment.** Two to four lines: what the reader does here, in plain words.
2. **Scenario constants.** The names, the true parameters, the sample sizes, the axis maximum,
   and the shared figure geometry. One place to change the world, and a reviewer can read the
   whole setup in twenty seconds.
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
figure, and `kit.bin`, teardown jobs. A section never reaches for a global, so a lesson can be
tested by handing `render` a stub context.

`state` is the small set of things that cross a section boundary, and it is a **subscription**,
not a plain object. Every section is constructed in one synchronous pass, so a later section
that reads `state.something` at build time reads the value it had before the reader touched
anything, which is always the empty one. The recap therefore registers a watcher:

```js
state.onLine((v) => { mine.replaceChildren(para(`Your line came in at ${min1(v)} minutes.`)); });
```

and the second instrument calls `state.setLine(gap)` when the reader commits. Keep the whole
thing small enough to list in a comment.

---

## 3. The six beats, as they appear in `01-noticing`

| Beat | Section | Instrument | The commitment | What gets named |
|---|---|---|---|---|
| Manipulate, Notice | `sectionMiddle` | 30 dots, one marker | press "Mark it" | the mean |
| Manipulate, Notice | `sectionOverlap` | two crowds, one dial | press "Draw the line here" | a null result |
| Notice | `sectionWorlds` | 12 dots each, rolled | predict before rolling | sampling variation |
| Apply | `sectionApply` | `ui.quiz`, a school | pick an option | |
| Question the claim | `sectionCrop` | two bars, one switch | flip the axis floor | truncating an axis |
| Close | `sectionRecap` | `ui.steps` | | the four moves, each with the unit that picks it up |

The Formalise beat is missing on purpose. Section 6 says when you are allowed to do that.

Four instruments is the ceiling from PEDAGOGY section 1, and this unit sits on it. A fifth
instrument means the unit is two units.

The measured budget: 1,206 words in the main lane, 280 more across the four captions, and
roughly 600 further words behind commitments that most readers will open. At PEDAGOGY's 60
main-lane words per minute that is the 20 minutes `curriculum.js` claims. Count your own rather
than estimating, because prose written in short appended strings reads shorter in the editor
than it does on the screen.

---

## 4. Patterns worth copying

**The click is the commitment.** Do not gate the primary button behind a drag. A `disabled`
button is not in the tab order, so a keyboard reader meets a control that does not exist yet
and no explanation of why. The reveal is gated by the press, the marker has a sensible starting
position that is deliberately not the answer, and a reader who presses without moving anything
has still committed to something and gets a true sentence back.

Where one control genuinely depends on a commitment made by another, as with the prediction
that has to happen before the first roll, disable it and put the ask directly above it in
reading order. That is one gate on the whole screen, and it earns its keep. Two rules come with
it. **A gate opens on any real commitment, not only on the one you designed.** The roll button
also opens when the reader types a world into the box, because asking for one specific
afternoon is a commitment too, and a control that stays dead after somebody has started
work reads as broken. **A one-shot button that disables itself has to hand its focus on**,
because disabling the element that currently holds focus drops a keyboard reader at the top of
the document with no announcement:

```js
const hadFocus = document.activeElement === b;
b.disabled = true;
if (hadFocus && rollEl) rollEl.focus({ preventScroll: true });
```

`ui.quiz` solves the same problem the other way, with `aria-disabled` and a guard flag, so its
options stay focusable and a reader can go back and read the answer they chose. Prefer that
where the disabled control still has something to say. Use a real `disabled` where it does not,
which is why the roll button uses one: `.ec-btn[disabled]` is a styled state, and a focusable
button that does nothing when pressed is worse than one the reader cannot reach yet.

**Declare handler-visible variables as `let x = null` above the control that touches them.**
A `ui` implementation that fired its callback once during construction would otherwise hit the
temporal dead zone and take the screen down. The shipped `seedBox` is careful here: its `set()`
is silent and only a real edit calls `onChange`. The lesson does not depend on that, because a
world box that announced its own programmatic updates would recurse, and one line of guard is
cheaper than an assumption about somebody else's file.

**Reveals land in an `aria-live="polite"` box.** Build the box empty, append the `.named` block
into it when the reader commits. A screen reader then hears the naming move at the moment it
happens instead of the reader having to go looking for it.

**Mark a readout `live` only if it changes on a click.** `ui.readout` takes `live: true` and
turns the value into a polite live region. That is right for a number that appears when the
reader presses a button and wrong for a number that follows a slider, because a value updating
sixty times a second makes a screen reader unusable. `01-noticing` marks three: the arithmetic
middle, the reader's own line, and the bar ratio in the distortion beat. Each is set by a
button or a switch.

**One rule decides the sentence and the tally.** The worlds instrument says in words which way
each afternoon came out and counts the same thing in a readout beside the figure. Those were
two separate tests in review, one of them with a "too close to call" band, and the two
disagreed on about one afternoon in twenty: the screen said it could not tell and the tally
counted it anyway. One predicate now feeds both. Any time a figure both says something and
counts it, the saying and the counting come off the same line of code.

**Fix the draws, move the parameters.** A simulated person is stored as a standardised draw and
a fixed jitter. The dials place them: `wait = average + spread * draw`. Because the draws never
change, turning a dial slides the crowd instead of replacing it, and the reader can see that
the only thing that moved is the thing they moved. Regenerating on every input would throw
sampling variation into an instrument that is not about sampling variation.

**Clamp a simulated value to the axis that will draw it.** `viz.js` does not clip, so a draw
past the end of the domain lands off the canvas and disappears without saying so. `waitOf`
floors at 0.4 minutes and caps just inside the axis maximum. The low clamp bites on about two
draws in a thousand and the high one on fewer, which is a cheaper price than a reader counting
29 dots in a figure whose caption says thirty.

**Freeze the axis.** `domain(0, X_MAX, 0, 1)` on every frame of the crowd figures. An axis that
rescales to its data hides exactly the motion the instrument exists to show. When the axis is
the subject, as in the distortion beat, the axis moves and nothing else does.

**Set padding wide enough that the axes never have to grow it, and draw `axisY` first.**
`axisX` pushes the bottom padding out to 28 px to make room for its numbers, and `axisY`
widens the left gutter to fit its widest label. Both mutate a box the other one has already
measured against. Pass the room in `pad()` up front, call the y axis first as `viz.js` asks,
and the ordering stops mattering.

**Write the figure geometry down as named constants.** `ROW_TOP`, `ROW_BOT`, `JITTER`,
`TICK_HALF`, `LABEL_TOP_Y`, `BRACKET_Y`. Two figures draw the same two rows, and a reader
scrolling from one to the other should not have to find them again. Numbers scattered through
three draw functions drift within a week.

**A mark that belongs to one row stays inside that row.** Two crowds share a frame, so a
full-height rule at one crowd's average reads as a claim about both. Draw a short tick inside
the row it summarises, and where a distance between the two rows has to be measured, put a
`bracket` across the top of the frame and carry each average up to it on a faint dashed guide.
The bracket is how a gap stops being an impression and becomes a quantity.

**One role, one colour.** `data` for observations, `truth` for the parameter that never moves,
`result` for an estimate, `ink` for something the reader placed themselves. Pass the role name
rather than a hex: `viz.paint()` swaps in the themed version, so the figure follows the reader
into dark mode. Never pick a colour because two rows needed telling apart: two rows are told
apart by being two rows.

**Numbers live in readouts, shapes live on the canvas.** `ui.readout` gives a number a label, a
tone and a text node a screen reader can reach. Piling the same numbers onto the canvas as
labels makes a figure that is busy on a desktop and unreadable at 375 px.

**Every canvas gets a spoken description that changes with the picture.** `mountFigure` takes a
`describe()` closure and writes its result to `aria-label` after every draw, and only when the
sentence has actually changed, so a running tween does not narrate itself sixty times a second.
The sentence says what a sighted reader would take away, with the current numbers in it. Run
the figure-vanishes test from VOICE section 5 on it, and read the sentence as a claim: a
distortion beat that calls one bar "five times taller" than another has just said six times as
tall, in the one lesson about numbers that mislead.

**A hidden canvas is already handled.** `viz.fit()` reads a `clientWidth` of zero as "not laid
out yet", draws at a sane default shape and touches nothing, so there is no division by zero to
guard against in a lesson and no reason to skip the first draw. The real numbers arrive on the
frame after the element becomes visible.

**Clean up by watching your own node, not the event.** Figures observe their canvas for
resizes and the lesson listens for a switch to dark mode, so every listener goes into
`kit.bin`. The router empties the mount without telling anyone, and `router.go()` re-renders
without firing `hashchange` when the hash has not changed, which is exactly what a nav link
pointing at the current page does. A `MutationObserver` on the mount catches every one of those
paths, including the ones nobody has written yet:

```js
watcher = new MutationObserver(() => { if (!body.isConnected) packUp(); });
watcher.observe(root, { childList: true });
```

Watch the lesson's own `body` node rather than the root it was handed. The router renders into
the mount element itself, so the root a lesson was given is still connected after that root has
been wiped, and a lesson that watched the root would tear down the copy of itself that is still
on screen.

**A ResizeObserver can fire before the figure is on the page.** `mountFigure`'s draw returns
early when its canvas is detached, which is right, but the disconnect it performs there has to
wait for one successful draw first. Disconnecting on the opening callback leaves the figure
frozen at whatever size it was built at, and that only shows up on a slow first paint. The
observer also skips redrawing when the box came back the same size, because a repaint that
changes nothing still costs a frame on the sort of phone this course is built for.

**Repaint twice on a theme change.** `viz.js` reads the palette out of the stylesheet and holds
it for a fraction of a second, so a redraw fired the instant `prefers-color-scheme` flips can
still be painting in the old colours. Paint immediately, then again once that cache has
certainly expired, and put the timer in `kit.bin`. Without the second pass the figures that
never redraw on their own sit in the previous palette until something resizes them.

**Animate once, and only where the motion is the point.** `01-noticing` tweens the dots between
worlds, because watching the crowd rearrange itself is the thing that makes sampling variation
felt. Ask `engine.prefersReducedMotion()` rather than the exported `reducedMotion` constant
wherever the module offers it, because a reader can change the setting halfway through a
session and the constant was read at page load. Jumping straight to the end state is only safe
because the still frame carries the same information. No `loop` runs when nothing is moving; a
permanent animation frame on a cheap phone is a battery bill.

**Worlds are strings, and only the choice of world is random.** Each figure seeds its own
generator with a string that names it, `makeRng('01-noticing/quiet/' + world)`, so two figures
in the same world never accidentally share a sequence. `Math.random` appears exactly once,
choosing which afternoon to visit next, and everything inside that afternoon is rebuilt from
its number. That is what makes "everyone type world 42" work.

**Calibrate the surprise before you ship it.** The worlds instrument only teaches if the sample
sometimes contradicts the truth, and it stops teaching if it contradicts the truth half the
time, because then the truth reads as noise. These settings put the wrong-way afternoon at
27.3% across worlds 1 to 4000, counted in a throwaway script against `app/core/rng.js` rather
than guessed. Four rolls leave about a 28% chance of never seeing a flip, so it is likely
without being promised, which is the point. Any instrument whose teaching rests on a frequency
gets the same treatment.

**Leave `?w=` alone once the screen is running.** `router.js` strips the query string off the
hash and `main.js` reads and writes `?w=`, so a link that opens on world 42 works today. This
is the one feature the whole seeding design exists for, and it is not broken. What
`01-noticing` does not do is call `ctx.setSeed` on every roll. The roll rebuilds the third
figure only, so writing that world into the address bar would mean a reload silently redrew the
first two figures and threw away the marks the reader had made on them. The world box shows the
number and the prose says that typing it back brings the afternoon back. A lesson whose
instruments all share one world should call `setSeed` instead.

**Depth is a native `<details class="deep">`.** It opens with no JavaScript, it prints, and a
screen reader can find it. The summary names the content, never the reader: "The other middle,
and why both exist" rather than "For the mathematically inclined". If the block is load-bearing
for the unit's question, it belongs in the main lane. Three per unit is the ceiling;
`01-noticing` uses two.

---

## 5. Prose that has to stay true

The screen writes sentences about what the reader did, which means the code has to know whether
they did it, and has to stop claiming it the moment it stops being true.

Two rules fall out. Anything the reader can still change does not get quoted in a fixed
paragraph. The naming block describes the second tick without naming the distance to it,
because the marker is still live after the reveal and the distance moves; the distance lives in
a readout that updates. And anything the reader might never do gets a general sentence by
default: the recap only quotes the line from the second instrument once a line exists. A recap
that invents a number the reader never chose is the exact failure the site is built against,
and it is invisible in testing because the happy path always sets the flag.

Captions are written once, at construction, so they cannot mention anything that changes. That
includes anything conditional: a caption promising a bracket the code only draws when two marks
are far enough apart is a caption the reader can make false by dragging. Say when it appears,
or do not mention it.

Cite other units by id and never by number. VOICE section 9 has the reason, and it is not
pedantry: `docs/CURRICULUM.md` and `app/curriculum.js` disagree from position four onward, so
"unit 8" names two different lessons depending on which file the reader opened. Write
`08-wobble`.

---

## 6. Where `01-noticing` deviates, and when you may

**No notation at all.** PEDAGOGY's Formalise beat says the reader picks up something portable,
and CURRICULUM.md's entry for this unit expects tally marks and place value as the first
compression the reader meets. The unit as built carries three phrases instead, "the mean", "a
null result" and "sampling variation", each attached to a move the reader made with their
hands. The argument for the cut: the reader has done no arithmetic here, so a symbol would have
nothing to compress, and the unit already spends its whole budget on making the eye's judgement
respectable.

This is a deviation with a rule attached: **skip the notation only when the reader has not yet
performed an operation worth compressing.** `05-spread` is the notation gate and by then the
excuse is gone. If you take this exemption, say so in the pull request and expect to be argued
with.

**Three naming blocks rather than one.** PEDAGOGY allows one `.named` block per idea and warns
that four means the unit is teaching four things. This unit teaches one claim, that noticing is
measuring, and names the three moves the reader made while doing it. If your three names do not
collapse into one sentence about the unit's question, you have three units.

**A single crowd first, not two.** The suggested opening was two rows of dots and "which sits
further right", which is what `app/views/home.js` already does before the reader ever reaches a
lesson. Repeating it as the first beat of the first unit spends the best moment in the course
twice. The unit opens on one crowd and one marker instead, which is also the stronger
commitment, because placing a mark says where rather than which. The two-row comparison arrives
in beat 2, where the reader is turning the gap down, so somebody who came straight from the map
still meets it.

**Twenty minutes, not the eighteen the brief asked for.** The word count is measured rather
than estimated, and `app/curriculum.js` says 20. Trimming to 18 costs a beat. Making the export
disagree with the curriculum to hit a rounder number would break the rule in section 1 and show
up on the map as a card promising something the lesson does not do.

---

## 7. Before opening the pull request

- [ ] `render` called twice into fresh roots produces two working screens.
- [ ] Nothing mutable lives at module scope.
- [ ] The unit's entry in `app/curriculum.js` matches the export, including `minutes`.
- [ ] Every reveal is gated behind a commitment, and every commitment is one click or one drag.
- [ ] No control stays disabled after the reader has committed by some other route.
- [ ] Focus survives every state change, including the ones that disable the focused element.
- [ ] No sentence on screen can be made false by a control the reader can still move.
- [ ] Anything the screen both says and counts comes off one predicate.
- [ ] Other units are cited by id, never by number.
- [ ] Every ratio in the prose says what it means: five times the height, not five times taller.
- [ ] The distortion is operable by the reader and uses only true numbers.
- [ ] Every canvas has `role="img"` and an `aria-label` that changes with the picture.
- [ ] Every control is reachable and operable from the keyboard, and focus is visible.
- [ ] The whole screen works at 375 px wide, and at 320 px, with no horizontal page scroll.
- [ ] A reduced-motion reader loses no content.
- [ ] Light and dark both redraw correctly after a theme switch, including the static figures.
- [ ] Every listener and observer the lesson creates is in `kit.bin`, and the bin runs when the
      lesson's own body leaves the page.
- [ ] Any frequency the teaching depends on has been simulated rather than estimated.
- [ ] No `console.log`, no globals.
- [ ] The VOICE read-aloud checklist passes on every sentence, including button labels.

`01-noticing` was checked against a local static server rather than by eye: render, navigate
away, navigate back, drive every control from the console, read every `aria-label` back, and
compare `document.documentElement.scrollWidth` with `clientWidth` at 320 px. That pass takes
about ten minutes and it caught three of the patterns in section 4.

---

## 8. Known gaps this unit leaves behind

`app.css` has no rule for `details.deep` yet. The element degrades to a plain native disclosure
triangle, which works, but the depth blocks will look unfinished until somebody styles them
alongside `.named` and `.warn`.

`.ec-btn` sets a 44 px minimum height and no `display`, so an anchor wearing that class needs
three inline style lines to keep its target size. `router.js` carries the same three lines for
the same reason. One rule in `app.css` would delete both copies.

The module contract does not describe `seedBox`'s options, and it does not carry `readout`'s
`live` flag, `engine.prefersReducedMotion()` or `ctx.makeRng`, all of which ship in `app/core`
and all of which this unit uses. `slider` is called with `fmt` formatting the bare number and
`unit` carrying the word "min", on the assumption that `ui.js` joins the two, which it does. If
the contract and the code are ever reconciled, this file and this lesson are where the
differences are written down.

The `installs` line in `app/curriculum.js` still describes the unit that CURRICULUM.md
specifies, where the reader meets subitising failing at four objects, counts sixty-three things
three ways, and leaves a sentence in `localStorage` for `13-third` to reopen. None of that is
on the screen. Either the field comes down to match what the unit does, or the missing half
gets built and the four-instrument ceiling gets renegotiated. That decision is open, and it
belongs to whoever writes `02-numbers`, because it is really a question about how much of part
I there is.

VOICE section 9 quotes this lesson's cropped-axis `aria-label` verbatim as the standard for
screen-reader text, and the quoted line still reads "5.0 times taller" where the lesson now
says "5.0 times the height of". The lesson's wording is the correct one. VOICE needs the same
one-word edit, and until it gets one the two files disagree about the sentence VOICE is holding
up as the example.
