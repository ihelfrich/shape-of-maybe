# Pedagogy

How the four principles become screen mechanics for The Shape of Maybe. This is a design
document. It records decisions, the reasons behind them, the alternatives that were rejected,
and the evidence that would make us change our minds. Where it is opinionated, that is on
purpose: a design document that keeps its options open produces a site with no shape.

Companion documents: [VOICE.md](VOICE.md) governs the words, [CURRICULUM.md](CURRICULUM.md)
governs the order and the argument for it, [LESSON-TEMPLATE.md](LESSON-TEMPLATE.md) governs
the file. This one governs the screens.

### What exists, as of this writing

Anything below that describes code says plainly whether that code exists. The snapshot:

- `app/core/` contains `router.js`, `viz.js`, `ui.js` and `engine.js`. `rng.js` and `stats.js`
  are specified in the module contract and are not written.
- `app/main.js` imports all five core modules with a `.catch(() => null)` on each, and
  registers no lessons at all unless every one of them loaded. A reader therefore sees the
  map marking units as unfinished rather than a lesson that half works.
- `app/lessons/` contains one lesson, `01-noticing`, and it is the worked example for
  everything here.
- `tools/selftest.mjs` exists and runs under plain `node` with no framework. It skips modules
  that are missing rather than failing on them.
- `.github/workflows/` is empty. Nothing runs automatically on a pull request.

Proposals that depend on absent code are proposals, not descriptions, and are labelled.

---

## 1. The core loop

Every lesson runs the same six beats. Not because variety is bad, but because a reader who
has done two units should be able to predict the shape of the third and spend their attention
on the content rather than the interface.

| Beat | What happens | Roughly, in a 20-minute unit |
|---|---|---|
| **Manipulate** | The reader commits to a prediction, then moves one control | 4 to 6 min |
| **Notice** | The instrument makes one thing visible that was not visible before | inside the above |
| **Name** | The text says: that move you made has a name | 30 sec to 1 min |
| **Formalise** | The named idea gets its notation and its arithmetic | 4 to 6 min |
| **Apply** | The reader uses it on a second, unrelated case | 4 to 6 min |
| **Question the claim** | The reader performs a distortion using only true numbers | 4 to 6 min |

That totals 17 to 25 minutes, which covers the range in `app/curriculum.js`: the sixteen units
run from 16 to 26 minutes and sum to 336. Budget about 60 words of main-lane prose per minute
of unit time, so roughly 1,000 words for a 16-minute unit and 1,600 for a 26-minute one, plus
two to four instruments, one mandatory distortion, and at most three depth blocks. A unit that
needs five instruments is two units.

### Beat 1: Manipulate

One control at a time. The first instrument in a unit has exactly one degree of freedom,
because a reader who moves two dials at once learns nothing about either.

The instrument answers a specific question, and the screen states that question before the
reader touches anything. "Play around with the sliders" is the commonest failure mode in
interactive teaching material and it is banned here. Free exploration is what people do after
they know what they are looking at.

### Beat 2: Notice

The instrument must make one previously invisible thing visible. Not illustrate a concept
already stated in the text. If the prose above the canvas said the thing the canvas shows, the
canvas is decoration and should be cut.

The test: what does the reader see happen that they could not have been told? Sample means
tightening as n grows is a good answer, because the *rate* of tightening is a fact about the
world that a sentence conveys weakly and a moving cloud conveys at once. A bar chart of three
categories is a bad answer.

### Beat 3: Name

The site's signature move, and it has its own visual treatment in `app/styles/app.css`: the
`.named` block, a left rule and a tinted panel in the `result` role colour. It appears
**after** the reader has acted, and it describes what they did, in the past tense.

One `.named` block per idea. A unit with four of them is teaching four things and should be
teaching one.

### Beat 4: Formalise

Now the notation, under the rules in VOICE.md section 1. Formalising is not a footnote. This
is where the reader picks up the thing they can carry into a textbook, a paper, or a
statistics course that will not be as patient as we are. Skipping it in the name of
friendliness leaves them with intuition they cannot cash anywhere.

Arithmetic is shown once on numbers small enough to check by hand, before it is shown on the
full dataset.

### Beat 5: Apply

A second case from a different domain. If the concept arrived on cafe waiting times, apply it
to rainfall or wages or reaction times. Transfer across contexts is the thing we are actually
trying to produce and it does not happen for free.

The apply beat is where `ui.quiz` belongs. Quiz questions ask for a claim about the world,
never for a definition. Unit 1 asks "Which sentence is the school entitled to put in its
newsletter?", which is a question. "What is a confidence interval?" is a lookup.

Quizzes never gate progress and never keep score. The `why` field is written for every option,
right and wrong, and the `why` on a wrong option explains the reasoning that made it
attractive before it corrects anything.

### Beat 6: Question the claim

The `.warn` block, a left rule and a tinted panel in the `data` role colour. Section 4 has the
detail.

---

## 2. The one addition: commit before you look

The loop above has a gap, and it is the gap most interactive teaching material falls into.
Moving a slider and watching the result is a low-engagement act. It feels like learning
because the screen responds, and the responsiveness produces fluency, and fluency is easy to
mistake for understanding.

So every reveal on this site is gated behind a commitment. Before the reader sees what
happens, they say what they think will happen: a button, a guess in a box, a marker dragged to
where they think the answer sits. Then the instrument runs and they find out.

This is the highest-value mechanic in the design. Unit 1 uses it four times: the reader places
a marker for the middle of a crowd and presses a button before the arithmetic mean appears,
answers "The same way" or "Sometimes the other way" before the worlds are re-run, and so on.
`ui.button`, `ui.segmented`, `ui.steps` and `ui.quiz` all exist and all support this, so the
mechanic is available to every new unit today.

Why it matters: a prediction turns an **active** task, operating a widget, into a
**constructive** one, generating something that was not handed to you. That gap is where the
measured gains sit. Sokoloff and Thornton's work on interactive lecture demonstrations found
the effect starkly: students who wrote down a prediction before the demonstration learned from
it, and students who watched the identical demonstration without predicting did not.

The landing page already does this in miniature. The reader answers "Which row of dots sits
further to the right?" before anything is revealed, the buttons then disable, and the naming
move lands on a commitment they have already made. Every lesson should feel like that opening.

Three rules for commitments:

- **A wrong prediction is never punished, marked or counted.** It is the instrument's job to
  be surprising. If the reader is right every time, the instrument is not teaching.
- **The commitment must be cheap.** One click, one drag. A form the reader has to compose is a
  wall.
- **The reconciliation is mandatory.** After the reveal, the text says what the common
  prediction was and why it was reasonable. A surprise with no explanation is a magic trick,
  and magic tricks teach the audience that they could not have done it.

---

## 3. Earning notation, operationally

"Earned notation" is a slogan until it has a procedure. Here is the procedure.

A symbol may appear on a screen when all four of these are true:

1. **The reader has performed the operation the symbol denotes**, with their hands, in the
   same lesson, before the symbol appears. Not in a previous unit. In this one.
2. **The operation has been described in full English on the same screen.** The symbol is then
   introduced as shorthand for that specific sentence, and the sentence stays on the page.
3. **Every component is parsed out loud on first appearance.** What the bar means, what Σ is
   an instruction to do, what the subscript ranges over, what the hat signals.
4. **The symbol is then used.** If the rest of the unit reverts to plain English, the notation
   was ceremonial and should be cut.

Two corollaries that come up constantly:

**Greek letters carry a job rather than a decoration.** μ and σ appear only once the
population and sample distinction is live, which is unit 7 in the current spine. That
distinction is the only reason the alphabet changes. Introducing μ before the reader has felt
the difference between the truth and what we measured spends the one moment where the notation
would have taught something.

**Subscripts are the hardest thing on the page.** Readers comfortable with x̄ routinely stall
on xᵢ, because indexing is a genuinely separate idea about referring to a position rather than
a value. Budget a paragraph for it the first time. A clause will not do.

---

## 4. Truths and lies in every unit, enforced structurally

Statistical ethics taught as a final chapter produces students who can recite the
misleading-axis example and cannot spot a misleading axis. The distortions have to arrive
attached to the tool, in the same session, while the tool is still new enough to feel
provisional.

**Every unit carries a `lies` field.** All sixteen entries in `app/curriculum.js` have one.
This is deliberate friction at the design stage: you cannot plan a unit without deciding what
the honest version of that tool's abuse looks like.

The word "enforced" in this heading is aspirational today and it is worth being blunt about
that. Nothing in the code checks the field. `curriculum.js` is a plain data module with no
validation and `.github/workflows/` is empty.

What would make it structural is now small, because `tools/selftest.mjs` landed and gave it a
home. That file already imports modules by URL, already skips what is absent, and already has
a `truthy(label, got)` assertion. Twenty lines added to it would import `UNITS`, assert that
every entry has a non-empty `title`, `question`, `installs` and `lies`, assert that every unit
with `status: 'ready'` has a matching lesson module on disk, and exit non-zero otherwise. A
five-line workflow running `node tools/selftest.mjs` on pull requests turns the review habit
into a gate. Review habits decay; this is the highest-value small piece of tooling the
repository is missing.

**The distortion must be operable.** The reader performs it. Unit 1 gives them a toggle that
moves the axis floor from zero to 4.9 minutes, at which point a true difference of 8% between
two cafes becomes a bar five times taller than its neighbour. Describing a distortion in prose
teaches recognition of that one example. Performing it teaches the move.

**The distortion runs on true numbers.** This is the point that has to land, and it lands by
construction rather than by assertion. The reader watches an accurate chart become a lie
without a single false figure entering it.

**The distortion comes from the unit's own content.** Unit 4 teaches mean and median, so its
`lies` field is "Average income against typical income, both correct, thousands apart." Unit 7
teaches sampling, so its distortion is the large self-selected sample that beats the small fair
one and looks more convincing while doing it. Unit 12 teaches correlation, so its distortion is
the chosen start year. Check `app/curriculum.js` when citing a unit here, because the two files
drifting apart is exactly the failure this section exists to prevent.

**The reader is on both sides.** Not "here is how they mislead you" but "here is a thing you
can do by accident, and here is what it does to your reader". Unit 1 says it in the shipped
prose: charting software fits the axis to the numbers it was handed, somebody accepts the
default, and you will do this yourself.

**The distortion beat ends in a question, not a rule.** Unit 1 closes by pointing out that a
temperature chart drawn from zero degrees upward is useless, so cropping an axis cannot be the
tell. The question is whether the size of the change on the screen matches the size of the
change in the world. A reader who leaves with a checklist of forbidden chart types has been
made easier to fool by anything not on the list.

---

## 5. One artifact, two audiences: the depth mechanism

### The problem

A twelve-year-old and a professor are supposed to use the same screen. The obvious solutions
are all bad, and it is worth saying why before proposing anything.

**Rejected: a three-level difficulty slider.** It asks the reader to classify themselves,
which is precisely the wound this project exists to treat. A reader who has decided they are
not a numbers person will select the bottom tier and stay there, and we will have built them a
floor.

**Rejected: separate beginner and advanced editions.** Doubles the maintenance and the two
versions drift within a month. Worse, it contradicts principle 1 at the level of file
structure: if everyone is a mathematician, there is no beginner edition.

**Rejected: adaptive difficulty.** Requires tracking, which we do not do and will not add. It
is also a black box that quietly decides the reader is the slow one, which is the experience
most people already had at school.

### The proposal

**The main lane is single-track and written for everyone.** One body of prose, complete, true,
and sufficient to answer the unit's question. Nobody reads a reduced version of anything.

**Depth is disclosure of the layer underneath, not difficulty of the main lane.** Certain
paragraphs open into a deeper block: a derivation, an edge case, the bridge to standard course
terminology, the place where the simple statement stops being exactly right.

Implementation, and where it currently stands:

- A depth block is a real `<details class="deep">` element. Native, keyboard-accessible,
  printable, findable by screen readers, and zero JavaScript to open one. Unit 1 already
  builds them this way and already reads `document.documentElement.dataset.depth` to set the
  default open state.
- `app/styles/app.css` has no `.deep` rule. The markup ships unstyled today, which means a
  reader gets a bare disclosure triangle with no visual signal that it is a different layer.
  That is the first piece of work in this section, and it is CSS only.
- A `segmented()` control in the lesson header sets the **default** open state. Two values:
  **Plain** and **Show the machinery**. `ui.segmented` exists, so this is buildable now.
- Persist the choice in `localStorage` under `ec.depth`. The site uses no `localStorage` at
  all today, so this would be its first key, and it stays inside the "nothing leaves the
  device" promise on the about page. The `ec.` prefix matches the `ec-` class prefix already
  in `app.css`, which is a leftover from an earlier working title and is not worth churning.
- A reader in Plain mode who opens a single block does **not** change their global setting.
  The site never concludes anything about a reader from one click.

**Two routing defects have to be fixed first, and one of them is already breaking the world
number.** The intention was to mirror depth into the URL as `?d=deep` alongside `?w=42`.
Neither works at present:

1. `router.js currentId()` derives the route with `location.hash.replace(/^#\/?/, '').trim()`,
   which does not strip a query string. A visitor arriving at `#/01-noticing?w=42` gets the id
   `01-noticing?w=42`, matches no lesson, and lands on "That page has not been written yet".
   `main.js writeSeed()` puts exactly that shape into the address bar, so the seed feature the
   README advertises is broken for the one use it was built for, which is a shared link. The
   fix is to split the hash on `?` in `currentId()`, and to have `go()` preserve the existing
   query instead of overwriting the whole hash.
2. `main.js writeSeed()` uses `history.replaceState`, which does not fire `hashchange`, so
   nothing re-renders. That is correct for the seed, which is read at render time anyway, but
   a depth toggle needs the screen to change immediately. The toggle must set `dataset.depth`,
   write the stored value, rewrite the query, and then call the render directly. The router
   rebuilds the mount from empty only on a route change, so it will not do that work for us.

Until both are fixed, ship depth with `localStorage` alone and no URL parameter. A link that
silently drops the reader's depth setting is a smaller defect than a link that lands on a 404.

### The two rules that make this work

**The plain layer must be true, not simplified.** The deep layer *adds*, it never *corrects*.
If the plain lane says the standard deviation is the typical distance from the middle and the
deep block has to walk that back, the plain lane taught something the reader will later have
to unlearn, and unlearning is expensive and demoralising. Where a plain statement is genuinely
approximate, the plain lane says so in the plain lane.

**Depth blocks are labelled by content, never by the reader's supposed ability.** "Where the
n − 1 comes from" is a good summary. "For the mathematically inclined" is a bad one, because
it tells the reader which tier they belong to before they have opened the door. Never
"Advanced", never "Optional", never "Extra credit".

A third rule follows from the first two: **if a depth block is load-bearing for the unit's
question, it is not a depth block.** Move it into the main lane. Hiding the real explanation
behind a toggle and leaving a hand-wave in the open is how this mechanism rots.

### What actually serves each reader

**The twelve-year-old** is not served by simplified concepts. They are served by no assumed
prior notation, concrete before abstract, no time pressure, and a reading level held in their
comfortable range while the conceptual level is not lowered at all. Concretely: main-lane
sentences average under twenty words, and where an Anglo-Saxon word exists we use it first and
the technical term second. Spread before dispersion. Middle before central tendency. Then the
technical term, used consistently from that point.

**The professor** is not served by harder material. Their problem is pace. They are served by
the map, by the one-question-per-unit header that lets them skip accurately, by depth blocks
that bridge to the terminology they already use, and above all by the instruments being
directly linkable with a world number so they can put one on a projector without reading a
word of our prose. That last one is the routing defect above, which makes fixing it a teaching
feature rather than a chore. We are not building a professor mode. The professor is a user of
the instruments more than a reader of the text.

**The returning adult** is the reader every decision is calibrated against, because they carry
the most damage and the least tolerance for being condescended to. A screen that works for
them works for the other three.

---

## 6. Beauty as a mechanic

Principle 3 is not decoration policy. It has operational content.

**Colour means one thing.** Four roles, defined in `tokens.css` with light and dark values for
each: truth, data, result, test. A reader who learns them in unit 1 can read every figure in
the course without a legend. Nothing is ever coloured because it looked better that way. This
is aesthetics doing work, because consistency is what makes a figure legible at a glance in
unit 14.

Colour is never the only channel. VOICE.md bans colour words in prose for the same reason, and
every canvas carries an `aria-label` that states the finding. Unit 1 rebuilds those labels
whenever the picture changes, which is the standard: a static label on a canvas that moves is
a lie to a screen-reader user.

**At least one moment per unit exists to be looked at.** The Galton board filling. The
sampling distribution assembling itself out of individual draws. The regression line pivoting
to its minimum as the total squared miss shrinks. These earn their frame rate. They are not
the teaching beat, they are the reason someone stays for the teaching beat.

**Restraint is the aesthetic.** No gradients, no drop shadows on data, no animation that does
not carry information, no chart junk. A dot is a dot. The beauty budget goes to typography,
whitespace, and one honest animation per unit, and spending it anywhere else means spending it
twice.

**Motion respects the reader.** `tokens.css` collapses its three duration tokens to 1ms under
`prefers-reduced-motion: reduce`, so a component that animates through those tokens honours
the setting without knowing about it. `engine.js` exports `reducedMotion` and its `tween`
jumps straight to the end value and calls `onDone` under the same query. No teaching point may
live only in a transition.

---

## 7. Anti-intimidation as a hard constraint

Principle 4 is enforced by a list of things the site does not do. These are not negotiable
per lesson.

- **No timer, no score, no streak, no progress percentage.** Nothing on the screen tells a
  reader how they are doing relative to anyone, including themselves an hour ago.
- **No locked content.** Every unit is reachable from the map at all times. Order is
  recommended, never enforced.
- **No red X.** A wrong quiz answer gets the reasoning behind it, not a mark. `app.css` does
  not meet this bar today: `.ec-quiz__opt.is-wrong` and `.ec-quiz__why.is-wrong` both paint
  with `--wrong` and `--wrong-soft`, which is the red reserved for a false *claim about the
  world* inside the content. Those two rules should move to a neutral panel and let the
  explanation carry the weight. Flagged here rather than quietly fixed, because the CSS
  shipped first and somebody will otherwise copy the pattern.
- **The answer is always reachable.** Every instrument has a "show me" affordance. A reader
  who is stuck can see the answer and work backwards. Withholding is not rigour.
- **Errors are ours.** `router.js` already says so, and every lesson-level failure message
  matches that tone.
- **Nothing requires an account, a download, a fast connection or a large screen.** A reader
  on a five-year-old phone on mobile data is a first-class user. Every instrument is tested at
  **320 px** wide, which is the narrowest viewport we support and the width at which layouts
  actually break, then again at 375 px. `app.css` has one mobile breakpoint at `40rem` and
  44 px minimum touch targets on buttons, segmented controls, toggles, quiz options and slider
  tracks, so the floor exists. The 320 px pass is what catches the instruments.

---

## 8. How we will know it is working

This is the section most design documents write as a paragraph of optimism. Here is the
honest version.

### The critique, stated at full strength

The claim that interactive demonstrations are fun but teach nothing is not a strawman and it
is not wrong in general. The strongest version goes like this.

Manipulating a simulation produces the subjective feeling of understanding while producing
little transferable knowledge. The learner ends up able to operate the widget and unable to
answer a question about the concept in an unfamiliar context. Three literatures converge on
it:

- **Kirschner, Sweller and Clark (2006), "Why Minimal Guidance During Instruction Does Not
  Work", *Educational Psychologist*.** Novices lack the schemas that would let them extract
  structure from an unguided environment, and the search itself consumes the working memory
  that learning requires. Discovery-style instruction loses to direct guided instruction,
  repeatedly.
- **De Jong and van Joolingen (1998), "Scientific Discovery Learning with Computer Simulations
  of Conceptual Domains", *Review of Educational Research*.** Learners struggle at every stage
  of simulation-based work: generating hypotheses, designing informative variations,
  interpreting what came out, and regulating their own exploration. Simulations alone
  frequently produce no measurable gain.
- **Chi and Wylie (2014), the ICAP framework, *Educational Psychologist*.** Engagement modes
  rank passive below active below constructive below interactive. Moving a slider is *active*.
  The gains live in *constructive*, where the learner generates something that was not given
  to them.

Taken together: a site made of sliders and pretty canvases is a plausible way to produce
readers who enjoyed themselves and learned nothing, and we would have no way of noticing,
because they would report having enjoyed it.

### The other half of the literature

Presenting only the critique would be its own kind of dishonesty, and the counter-evidence
points at a specific moderator rather than at a general defence.

- **Alfieri, Brooks, Aldrich and Tenenbaum (2011), a meta-analysis of discovery-based
  instruction, *Journal of Educational Psychology*.** Unassisted discovery loses. Assisted
  discovery, where the learner generates something and then meets feedback, worked examples or
  scaffolding, beats both unassisted discovery and plain direct instruction. The moderator is
  guidance, not interactivity.
- **Rutten, van Joolingen and van der Veen (2012), a review of computer simulations in science
  education, *Computers & Education*.** Simulations added to conventional instruction generally
  help. Simulations replacing it are a coin flip.
- **delMas, Garfield and Chance (1999), *Journal of Statistics Education*.** The closest thing
  to a direct test of this site's premise. Students working with a sampling-distribution
  simulation improved very little until the activity was rebuilt so that they had to predict
  the shape first and then confront the discrepancy. The software did not change. The
  prediction step did.

That last result is the load-bearing one for us, because it is in our exact domain and it says
the mechanic in section 2 is the difference between a simulation that teaches and the same
simulation that does not.

**A standing rule on these citations.** They were written from memory rather than pulled from
a reference manager. Before any of them appears in reader-facing prose, someone opens the
paper and checks the authors, the year, the journal and the specific claim being attributed.
Until then they are leads for a contributor who wants to go and disagree with us, not
citations. We have not re-derived anybody's effect sizes.

### What the design does about it

We are not building a discovery-learning site, and that should be said plainly, because
unguided discovery is the thing the research actually kills. Guidance here is heavy. The
reader is never asked to infer a concept unaided. They are asked to make one move, and the
text names it within seconds. The instrument's job is to make one fact perceptible, not to
hide a concept for the reader to find.

Four mechanics follow directly:

1. **Commitment before every reveal**, section 2. This is the conversion from *active* to
   *constructive* in the ICAP sense, and it has the most direct experimental support behind
   it.
2. **One degree of freedom at a time**, which is the cognitive-load response. The reader never
   has to design an experiment. The screen has already designed it.
3. **Every instrument has a stopping condition.** A stated question it exists to answer, and a
   moment where the reader can tell they have answered it. No open sandboxes.
4. **Transfer built into the loop.** The apply beat moves to a different domain every time,
   because near transfer within the same dataset is what inflates immediate post-tests and
   vanishes in a week.

### What we will measure

The site has no analytics, no account and no tracking, and that is permanent rather than a
phase. The only proposed device storage is the depth setting in section 5 and possibly a
last-visited unit. Nothing leaves the device and neither key exists yet. So we cannot buy
evidence with telemetry. We buy it with human time, which is slower, smaller and considerably
more honest.

**Transfer tests, held out and public.** Each unit gets a written test that never appears in
the lesson, built from real published claims and scored against a rubric in the repository.
The test asks the reader to critique a claim rather than define a term. A unit 8 item looks
like this: here is a polling release reporting 47% support from 1,004 adults, described as up
from 45% last month. What would you need to know before you would write the word "up", and is
it here? The rubric credits an answer that notices each figure carries about three points of
wobble, that a two-point move is well inside it, and that the honest sentence is that the poll
cannot tell the two months apart. It gives no credit for reciting the formula.

**A delayed test at one week.** Immediate post-tests flatter interactive material, because
they measure the fluency the interaction just produced. The one-week number is the one we
report.

**A comparison that could embarrass us.** The control condition is a static text version of
the same unit: identical content, identical figures as static images, no instruments, no
commitment gates. If the interactive version does not beat it on the delayed transfer test,
the instruments are decoration, and the honest response is to cut them and ship a book.

Being specific about what that experiment could actually see: with forty readers per arm, a
two-sided test at the conventional 5% detects a difference of about two thirds of a standard
deviation with 80% power. Anything smaller looks like noise to us and gets reported as noise
rather than as a trend. We have no way to recruit eighty readers today, which makes this a
commitment rather than a plan, and pretending otherwise would be the exact failure the site is
about.

**Think-aloud sessions, roughly six people per audience.** Watching for two failures. First:
the reader operated every control and cannot state the unit's question in their own words.
Second: the reader felt talked down to. Six people cannot measure an effect size, and that is
not what they are for. They are for finding the failure we did not anticipate, which is the
thing a controlled comparison is worst at.

**The issue tracker.** A "made me feel small" label, triaged as a priority defect, at the same
severity as a wrong number.

### What we cannot measure, and will not claim

We have no denominator. We do not know who arrived, who left, or who was already comfortable
with the material. The audience self-selects, so any before-and-after number we produce is a
statement about people who chose to be there. We will not publish completion rates, we will
not publish "N% of learners improved", and we will not use the word "proven" about anything
here. A project about honest statistics that markets itself with dishonest ones has lost the
argument at the door.

Results, including nulls, go in `docs/EVIDENCE.md` as they arrive. That file does not exist
yet, and saying so is part of the point.

### What would make us change the design

- Delayed transfer scores at parity with the static text control. Cut the instruments.
- Think-aloud subjects opening depth blocks looking for "the real explanation". The plain lane
  is being evasive and the split is wrong.
- Under-16 readers unable to answer the unit question while adults manage it. The reading
  level rule failed, and the fix is prose rather than more animation.
- Readers reporting the naming move as patronising. Principle 1 would still be right and our
  implementation of it would be wrong.

---

## 9. Open questions

Three things this document does not resolve, listed because pretending otherwise would be the
wrong kind of confidence.

**Whether the six-beat loop survives the harder units.** Unit 13, "The third thing", may not
have a single manipulable instrument that makes a confounder visible in under four minutes,
and unit 15's designed comparisons may need two. If the loop does not fit, the loop bends
rather than the unit being forced into it.

**Whether commitment gates start to feel like an obstacle course.** Six units in, being asked
to predict before every reveal may read as an interrogation. There is no data on the right
density, and the honest answer is that the think-aloud sessions will tell us.

**Whether the depth split is needed at all.** It is plausible that one well-written lane serves
all four readers and the `<details>` blocks go unopened. That would be a good outcome and we
would delete the toggle. The mechanism is cheap to build and cheap to remove, which is the main
argument for trying it before arguing about it.
