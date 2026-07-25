# Pedagogy

How the four principles become screen mechanics. This is a design document: it records
decisions, the reasons for them, the alternatives that were rejected, and the evidence
that would make us change our minds. Where it is opinionated, that is on purpose. A design
document that keeps its options open produces a site that has no shape.

Companion document: [VOICE.md](VOICE.md) governs the words. This one governs the screens.

---

## 1. The core loop

Every lesson runs the same six beats. Not because variety is bad, but because a reader who
has done two units should be able to predict the shape of the third and spend their
attention on the content instead of the interface.

| Beat | What happens | Roughly |
|---|---|---|
| **Manipulate** | The reader commits to a prediction, then moves one control | 3 to 5 min |
| **Notice** | The instrument makes one thing visible that was not visible before | inside the above |
| **Name** | The text says: that move you made has a name | 30 sec |
| **Formalise** | The named idea gets its notation and its arithmetic | 2 to 4 min |
| **Apply** | The reader uses it on a second, unrelated case | 3 to 4 min |
| **Question the claim** | The reader performs a distortion using only true numbers | 3 to 4 min |

For a fifteen-minute unit that is about 900 to 1,400 words of prose, two to four
instruments, one mandatory distortion, and at most three depth blocks. Units that need
more than four instruments are two units.

### Beat 1: Manipulate

One control at a time. The first instrument in a unit has exactly one degree of freedom,
because a reader who moves two dials at once learns nothing about either.

The instrument answers a specific question and the screen says which question before the
reader touches it. "Play around with the sliders" is the single most common failure mode
in interactive teaching material and it is banned here. Free exploration is what people do
after they know what they are looking at.

### Beat 2: Notice

The instrument must make one previously invisible thing visible. Not "illustrate" a
concept that was already stated in text. If the prose above the canvas already said the
thing the canvas shows, the canvas is decoration and should be cut.

The test: what does the reader see happen that they could not have been told? Sample means
tightening as n grows is a good answer, because the rate of tightening is a fact about
the world that a sentence conveys weakly and a moving cloud conveys immediately. A bar
chart of three categories is a bad answer.

### Beat 3: Name

This is the site's signature move and it gets its own visual treatment: the `.named` block,
green, the `result` role colour, a left rule. It appears **after** the reader has acted and
it describes what they did in the past tense.

There is exactly one `.named` block per idea. If a unit has four of them, the unit is
trying to teach four things and should teach one.

### Beat 4: Formalise

Now the notation, under the rules in VOICE.md section 1. Formalising is not a footnote:
this is where the reader picks up the thing they can carry to a textbook, a paper, or a
statistics course that will not be as patient as we are. Skipping it in the name of
friendliness leaves the reader with intuition they cannot cash anywhere.

Arithmetic is shown once, on real numbers small enough to check by hand, before it is shown
on the full dataset.

### Beat 5: Apply

A second case from a different domain. If the concept was introduced on test scores, apply
it to rainfall or wages or reaction times. Transfer across contexts is the thing we are
actually trying to produce, and it does not happen for free.

The apply beat is where `ui.quiz` belongs. Quiz questions ask for a claim about the world,
never for a definition. "Which of these two studies supports its headline?" is a question.
"What is a confidence interval?" is a lookup.

Quizzes never gate progress and never keep score. The `why` field is written for every
option, correct and incorrect, and the `why` on a wrong option explains the reasoning that
made it attractive before it corrects anything.

### Beat 6: Question the claim

The `.warn` block, orange, the `data` role colour. Details in section 4.

---

## 2. The one addition: commit before you look

The loop above has a gap, and it is the gap that most interactive teaching material falls
into. Moving a slider and watching the result is a low-engagement act. It feels like
learning because the screen responds, and the responsiveness produces fluency, and fluency
is easy to mistake for understanding.

So every reveal in this site is gated behind a commitment. Before the reader sees what
happens, they say what they think will happen: a button, a guess entered in a box, a line
they drag to where they think it goes. Then the instrument runs and the reader finds out
whether they were right.

This is the single highest-value mechanic in the whole design, and it is close to free to
build. `ui.steps()` already exists to sequence a reveal; `ui.segmented()` and `ui.quiz()`
already exist to capture the commitment.

Why it matters: a prediction turns an **active** task (operate the widget) into a
**constructive** one (generate something that was not given to you), and the gap between
those two is where the measured learning gains sit. Sokoloff and Thornton's work on
interactive lecture demonstrations (*The Physics Teacher*, 1997) found the effect starkly.
Students who wrote down a prediction before the demonstration learned from it. Students who
watched the identical demonstration without predicting did not.

The home page already does this in miniature. The reader answers "which row sits further
right?" before anything is revealed, and the naming move lands on a commitment they have
already made. Every lesson should feel like that opening.

Three rules for commitments:

- **A wrong prediction is never punished, marked, or counted.** It is the instrument's job
  to be surprising. If the reader is right every time, the instrument is not teaching.
- **The commitment must be cheap.** One click, one drag. A form the reader has to compose
  is a wall.
- **The reconciliation is mandatory.** After the reveal, the text says what the common
  prediction was and why it was reasonable. A surprise with no explanation is a magic
  trick, and magic tricks teach the audience that they cannot do it.

---

## 3. Earning notation, operationally

"Earned notation" is a slogan until it has a procedure. Here is the procedure.

A symbol may appear on a screen when all four of these are true:

1. **The reader has performed the operation the symbol denotes**, with their hands, in the
   same lesson, before the symbol appears. Not in a previous unit. In this one.
2. **The operation has been described in full English on the same screen.** The symbol is
   then introduced as shorthand for that specific sentence, and the sentence stays on the
   page.
3. **Every component is parsed out loud on first appearance.** What the bar means, what Σ
   is an instruction to do, what the subscript ranges over, what the hat signals.
4. **The symbol is then used.** If the rest of the unit reverts to plain English, the
   notation was ceremonial and should be cut.

Two corollaries that come up constantly:

**Greek letters carry a job, not a decoration.** μ and σ are used only once the population
and sample distinction is live, because that distinction is the only reason the alphabet
changes. Introducing μ before the reader has felt the difference between "the truth" and
"what we measured" wastes the one moment where the notation would have taught something.

**Subscripts are the hardest thing on the page.** Readers who are comfortable with x̄ often
stall on xᵢ, because indexing is a genuinely separate idea about referring to a position
rather than a value. Budget a paragraph for it the first time. Do not budget a clause.

---

## 4. Truths and lies in every unit, enforced structurally

Statistical ethics taught as a final chapter produces students who can recite the
misleading-axis example and cannot spot a misleading axis. The distortions have to arrive
attached to the tool, in the same session, while the tool is still new enough to feel
provisional.

We enforce this with structure rather than good intentions.

**The `lies` field is required.** Every entry in `app/curriculum.js` carries one, and a
unit without one does not ship. This is deliberate friction at the design stage: you cannot
plan a unit without deciding what the honest version of the tool's abuse looks like.

**The distortion must be operable.** The reader performs it. A control that crops the axis,
a dropdown that switches the denominator from "per country" to "per capita", a slider that
re-bins a histogram until the second peak disappears. Describing a distortion in prose
teaches recognition of that one example. Performing it teaches the move.

**The distortion uses only true numbers.** This is the point that has to land, and it lands
by construction rather than by assertion. The reader watches an accurate chart become a
lie without a single false figure entering it.

**The distortion comes from the unit's own content.** Unit 5 teaches mean and median, so
unit 5's distortion is average income against typical income. Unit 9 teaches sampling, so
unit 9's distortion is the large self-selected sample that beats the small fair one and
looks more convincing while doing it. A generic "charts can mislead" panel bolted onto a
unit about correlation is the failure this rule prevents.

**The reader is included on both sides.** Not "here is how they mislead you" but "here is
a thing you can do accidentally, and here is what it does to your reader". Most misleading
charts are made by people who accepted their software's default.

---

## 5. One artifact, two audiences: the depth mechanism

### The problem

A twelve-year-old and a professor are supposed to use the same screen. The obvious
solutions are all bad, and it is worth saying why before proposing anything.

**Rejected: a three-level difficulty slider.** It asks the reader to classify themselves,
which is precisely the wound this project exists to treat. A reader who has decided they
are "not a numbers person" will select the bottom tier and stay there, and we will have
built them a floor.

**Rejected: separate beginner and advanced editions.** Doubles the maintenance, and the
two versions drift within a month. Worse, it contradicts principle 1 at the level of file
structure: if everyone is a mathematician, there is no beginner edition.

**Rejected: adaptive difficulty.** Requires tracking, which we do not do and will not add.
It is also a black box that quietly decides the reader is the slow one, which is the
experience most people already had at school.

### The proposal

**The main lane is single-track and written for everyone.** There is one body of prose. It
is complete, it is true, and it is sufficient to answer the unit's question. Nobody reads a
reduced version of anything.

**Depth is disclosure of the layer underneath, not difficulty of the main lane.** Certain
paragraphs open into a deeper block: a derivation, an edge case, the connection to standard
course terminology, the place where the simple statement stops being exactly right.

Implementation, matching the constraints of the codebase:

- A depth block is a real `<details class="deep">` element. Native, keyboard-accessible,
  printable, findable by screen readers, and zero JavaScript to open one.
- A site-wide `segmented()` control in the lesson header sets the **default** open state.
  Two values: **Plain** and **Show the machinery**. Stored in `localStorage` under
  `ec.depth`, mirrored into the hash as `?d=deep` so a link carries it, exactly as `?w=42`
  carries the world number today.
- `document.documentElement.dataset.depth` drives the `open` attribute on render. The
  router already rebuilds from empty on every route change, so no reconciliation is needed.
- A reader in Plain mode who opens a single block does **not** change their global setting.
  The site does not conclude anything about a reader from one click.

### The two rules that make this work

**The plain layer must be true, not simplified.** The deep layer *adds*, it never
*corrects*. If the plain lane says the standard deviation is the typical distance from the
middle and the deep block has to walk that back, the plain lane taught something the reader
will later have to unlearn, and unlearning is expensive and demoralising. Where a plain
statement is genuinely approximate, the plain lane says so in the plain lane.

**Depth blocks are labelled by content, never by the reader's supposed ability.** "Where the
n − 1 comes from" is a good summary. "For the mathematically inclined" is a bad one,
because it tells the reader what tier they belong to before they have opened the door.
Never "Advanced", never "Optional", never "Extra credit".

A third rule follows from the first two: **if a depth block is load-bearing for the unit's
question, it is not a depth block.** Move it into the main lane. The temptation to hide the
real explanation behind a toggle and leave a hand-wave in the open is the way this
mechanism rots.

### What actually serves each reader

**The twelve-year-old** is not served by simplified concepts. They are served by no assumed
prior notation, concrete before abstract, no time pressure, and a reading level held at
their comfortable range while the conceptual level is not lowered at all. Concretely: main
lane sentences average under twenty words, and where an Anglo-Saxon word exists we use it
first and the technical term second. Spread before dispersion. Middle before central
tendency. Then the technical term, used consistently from that point.

**The professor** is not served by harder material. Their problem is pace. They are served
by the map, by the one-question-per-unit header that lets them skip accurately, by depth
blocks that bridge to the terminology they already use, and above all by the instruments
being directly linkable with a world number so they can put one on a projector without
reading a word of our prose. We are not building a professor mode. The professor is a user
of the instruments more than a reader of the text.

**The returning adult** is the reader every decision is calibrated against, because they
carry the most damage and the least tolerance for being condescended to. If a screen works
for them it works for the other three.

---

## 6. Beauty as a mechanic

Principle 3 is not decoration policy. It has operational content.

**Colour means one thing.** Four roles, defined in `tokens.css`: truth, data, result, test.
A reader who learns them in unit 1 can read every figure in the course without a legend.
Nothing is ever coloured because it looked better that way. This is aesthetics doing work:
consistency is what makes a figure legible at a glance in unit 14.

**At least one moment per unit exists to be looked at.** The Galton board filling. The
sampling distribution assembling itself from individual draws. The regression line pivoting
to its minimum as the sum of squared misses shrinks. These earn their frame rate. They are
not the teaching beat, they are the reason someone stays for the teaching beat.

**Restraint is the aesthetic.** No gradients, no drop shadows on data, no animation that
does not carry information, no chart junk. A dot is a dot. The site's beauty budget is
spent on typography, whitespace, and one honest animation per unit, and spending it
anywhere else means spending it twice.

**Motion respects the reader.** `prefers-reduced-motion` is honoured at the token level and
in `engine.tween`. A reader who has asked for less motion gets the end state immediately
and loses no content, which means no teaching point may live only in the transition.

---

## 7. Anti-intimidation as a hard constraint

Principle 4 is enforced by a list of things the site does not do. These are not
negotiable per-lesson.

- **No timer, no score, no streak, no progress percentage.** Nothing on the screen tells a
  reader how they are doing relative to anyone, including themselves an hour ago.
- **No locked content.** Every unit is reachable from the map at all times. Order is
  recommended, never enforced.
- **No red X.** A wrong quiz answer gets the reasoning behind it, in the `result` colour
  family, not the `wrong` colour. The `wrong` role is reserved for showing a genuinely
  incorrect *claim about the world* inside the content, not for marking a reader.
- **The answer is always reachable.** Every instrument has a "show me" affordance. A reader
  who is stuck can always see the answer and work backwards. Withholding is not rigour.
- **Errors are ours.** The router already says so, and every lesson-level failure message
  matches that tone.
- **Nothing requires an account, a download, a fast connection, or a large screen.** A
  reader on a five-year-old phone on mobile data is a first-class user, and every
  instrument is tested at 375 px wide before it ships.

---

## 8. How we will know it is working

This is the section most design documents write as a paragraph of optimism. Here is the
honest version.

### The critique, stated at full strength

The claim that interactive demonstrations are fun but teach nothing is not a strawman, and
it is not wrong in general. The strongest version goes like this.

Manipulating a simulation produces the subjective feeling of understanding while producing
little transferable knowledge. The learner ends up able to operate the widget and unable to
answer a question about the concept in an unfamiliar context. Three separate literatures
converge on this:

- **Kirschner, Sweller and Clark (2006), "Why Minimal Guidance During Instruction Does Not
  Work" (*Educational Psychologist*).** Novices lack the schemas that would let them
  extract structure from an unguided environment, and the search itself consumes the
  working memory that learning requires. Discovery-style instruction underperforms direct
  guided instruction, repeatedly.
- **De Jong and van Joolingen (1998), "Scientific Discovery Learning with Computer
  Simulations of Conceptual Domains" (*Review of Educational Research*).** A review of
  simulation-based learning finding that learners struggle at every stage: generating
  hypotheses, designing informative variations, interpreting what came out, and regulating
  their own exploration. Simulations alone frequently produce no measurable gain.
- **Chi and Wylie (2014), the ICAP framework (*Educational Psychologist*).** Engagement
  modes rank passive < active < constructive < interactive. Moving a slider is *active*.
  The gains live in *constructive*, where the learner generates something that was not
  given to them.

Taken together: a site made of sliders and pretty canvases is a plausible way to produce
readers who enjoyed themselves and learned nothing, and we would have no way of noticing,
because they would report having enjoyed it.

These four sources (with Sokoloff and Thornton from section 2) are what the design leans
on. They are named here so that a contributor can go and disagree with them. We have not
re-derived their effect sizes, and any claim we make in public that rests on one of them
gets checked against the paper first.

### What the design does about it

We are not building a discovery-learning site, and we should say so plainly, because
discovery learning is the thing the research actually kills. Guidance here is heavy. The
reader is never asked to infer a concept unaided; they are asked to make one move, and the
text names it within seconds. The instrument's job is to make one fact perceptible, not to
hide a concept for the reader to find.

Four mechanics follow directly from the three critiques above:

1. **Commitment before every reveal** (section 2). This is the conversion from *active* to
   *constructive* in the ICAP sense, and it is the mechanic with the most direct
   experimental support behind it.
2. **One degree of freedom at a time**, which is the cognitive load response. The reader
   never has to design an experiment; the screen has already designed it.
3. **Every instrument has a stopping condition.** A stated question it exists to answer,
   and a moment where the reader can tell they have answered it. No open sandboxes.
4. **Transfer built into the loop.** The apply beat moves to a different domain, every
   time, because near transfer within the same dataset is the thing that inflates
   immediate post-tests and vanishes in a week.

### What we will measure

The site has no analytics, no account, and no tracking, and that is a permanent commitment
rather than a phase. `localStorage` is used for the depth setting and the last-visited
unit; nothing leaves the device. So we cannot buy evidence with telemetry. We buy it with
human time instead, which is slower, smaller, and considerably more honest.

**Transfer tests, held out and public.** Each unit gets a written test that never appears in
the lesson, built from real published claims, scored against a rubric in the repository.
The test asks the reader to critique a claim, not to define a term.

**A delayed test at one week.** Immediate post-tests flatter interactive material, because
they measure the fluency the interaction just produced. The one-week test is the number we
will report.

**A comparison that could embarrass us.** The control condition is a static text version of
the same unit: identical content, identical figures as static images, no instruments, no
commitment gates. If the interactive version does not beat the static version on the
delayed transfer test, the instruments are decoration and we should cut them and ship a
book. That is the experiment worth running first, and we have not run it.

**Think-aloud sessions, roughly six people per audience.** Watching for two specific
failures. First: the reader operated every control and cannot state the unit's question in
their own words. Second: the reader felt talked down to. The second is a defect of equal
severity, per the promise already made on the about page.

**The issue tracker.** A "made me feel small" label, triaged as a priority defect.

### What we cannot measure, and will not claim

We have no denominator. We do not know who arrived, who left, or who was already
comfortable with the material. Our audience self-selects, which means any before-and-after
number we produce is a statement about people who chose to be there. We will not publish
completion rates, we will not publish "N% of learners improved", and we will not use the
word "proven" about anything here. A project about honest statistics that markets itself
with dishonest ones has lost the argument at the door.

Results, including nulls, go in `docs/EVIDENCE.md` as they arrive. That file does not exist
yet, and saying so is part of the point.

### What would make us change the design

- Delayed transfer scores at parity with the static text control. Cut the instruments.
- Think-aloud subjects opening depth blocks looking for "the real explanation". The plain
  lane is evasive and the split is wrong.
- Under-16 readers unable to answer the unit question while adults manage it. The reading
  level rule failed, and the fix is prose, not more animation.
- Readers reporting the naming move as patronising. Principle 1 would still be right and
  our implementation of it would be wrong.

---

## 9. Open questions

Three things this document does not resolve, listed because pretending otherwise would be
the wrong kind of confidence.

**Whether the six-beat loop survives contact with the harder units.** Causal inference in
unit 15 may not have a single manipulable instrument that makes confounding visible in
under four minutes. If it does not, the loop bends rather than the unit being forced.

**Whether commitment gates start to feel like an obstacle course.** Six units in, being
asked to predict before every reveal may read as an interrogation. There is no data on the
right density and the honest answer is that we will find out from the think-aloud sessions.

**Whether the depth split is needed at all.** It is plausible that a single well-written
lane serves all four readers and the `<details>` blocks go unopened. That would be a good
outcome and we would remove the toggle. The mechanism is cheap enough to build and cheap
enough to delete, which is the main argument for trying it first.
