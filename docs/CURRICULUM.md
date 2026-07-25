# Curriculum

Sixteen units, 344 minutes, from a reader who has never willingly looked at a number to a
reader who can take a published causal claim apart and say which joint it fails at.

This document is an argument. Listing the topics of an introductory statistics course is not
hard, and almost every such list is the same list. The design is the order: which idea arrives
before which, and what the reader is already holding in their hands when it does. Each unit
below carries its one question, the intuition it installs, the notation it earns, the
misconception it kills, the instruments it needs, and its truths-and-lies thread. Four ordering
decisions are argued at length first, because those four are where this spine leaves the
standard one.

Two companion documents govern the rest. [PEDAGOGY.md](PEDAGOGY.md) sets the screen loop and
the depth mechanism, [VOICE.md](VOICE.md) sets the prose. `app/curriculum.js` is this file as
data, and if the two disagree the fix is a single commit that changes both.

---

## The spine

| # | id | Title | The one question | Min | Depends on |
|---|---|---|---|---|---|
| 1 | `01-noticing` | Bigger, smaller, how sure | How do I know one pile is bigger than another, and how sure am I? | 20 | nothing |
| 2 | `02-numbers` | Putting a number on it | How do I turn something real into a number, and what does the number cost? | 20 | 1 |
| 3 | `03-pile` | The pile | What does a whole group of numbers look like at once? | 18 | 2 |
| 4 | `04-reroll` | Reroll the world | If I ran the same thing again, what would change and what would stay? | 20 | 3 |
| 5 | `05-pocket` | How few numbers can I get away with | How much of a crowd can I carry in my pocket? | 26 | 3, 4 |
| 6 | `06-sampling` | A few, for many | How can a thousand people tell you about three hundred million? | 20 | 4, 5 |
| 7 | `07-wobble` | The wobble | If I did this study again, how different would the answer be? | 24 | 6 |
| 8 | `08-ruler` | The ruler that keeps turning up | How do I turn a distance into a probability? | 22 | 7 |
| 9 | `09-range` | The honest range | What is the widest claim I am entitled to make? | 20 | 7, 8 |
| 10 | `10-evidence` | What the evidence is evidence for | A test came back positive. What are the chances I have it? | 20 | 4, 6 |
| 11 | `11-trial` | Putting a claim on trial | Is this gap real, or could luck have done it? | 24 | 9, 10 |
| 12 | `12-together` | Two things at once | When one thing moves, does the other? | 18 | 3, 5 |
| 13 | `13-third` | The third thing | How do I tell a cause from a coincidence? | 22 | 12, 10 |
| 14 | `14-line` | The line through the cloud | Can one line stand in for a cloud, and how would I know when it stopped working? | 26 | 13, 9 |
| 15 | `15-designed` | Comparisons built on purpose | How do you build a study that can settle a causal question? | 24 | 13, 11, 14 |
| 16 | `16-rhetoric` | Telling the truth with numbers | How do I say something true, clearly, without misleading anyone, including myself? | 20 | all |

Six parts. Each lesson module passes its part through as the `unit` field on its default
export, and the map screen groups on it.

- **I. Before the symbols** (1, 2)
- **II. What a crowd looks like** (3, 4, 5)
- **III. From a few to the many** (6, 7, 8)
- **IV. What you are entitled to say** (9, 10, 11)
- **V. Two things, and why** (12, 13, 14, 15)
- **VI. Saying it out loud** (16)

### Where a reader can stop

Nobody finishes a 344-minute course. I have no completion data, and neither does anyone else
who is being straight about it, so the ordering is built to survive the reader quitting at any
point rather than to reward the reader who does not.

A reader who leaves after unit 4 has the founding idea of the whole subject, which is that a
process can be unpredictable one draw at a time and lawful in bulk. A reader who leaves after
unit 5 knows that a centre without a spread is half a claim, and will never again read
"average" as "typical" without checking. A reader who leaves after unit 7 has the single most
valuable transferable idea in statistics: an estimate has a wobble, the wobble is calculable,
and it shrinks like the square root of the sample size. A reader who leaves after unit 11 can
evaluate most of the numbers in a newspaper.

That last sentence is the reason the wobble is seventh. A conventional syllabus reaches the
sampling distribution in about week nine of thirteen, which puts the payoff behind a wall of
descriptive machinery. If half this course has to be cut, it gets cut after unit 8 and the rest
ships as a sequel. That is a survivable outcome. Cutting a conventional syllabus in half leaves
a reader who can compute a standard deviation and cannot do anything with it.

---

## Four arguments about order

### (a) Probability is not one unit, and its first half arrives fourth, before any summary

Probability in this spine is split. The generative half is unit 4, immediately after the reader
can read a distribution and before they compress one. The conditional half is unit 10,
immediately before hypothesis testing. There is no chapter called "Probability" and there
should not be.

Start with why the generative half comes so early, because that is the departure.

The reader meets a histogram in unit 3. At that moment they hold a picture of some numbers, and
they have no idea where the numbers came from. Everything the rest of the course wants to say
depends on an answer to that question. A sample is a draw from a process. An estimate wobbles
because the draw could have gone otherwise. A p-value is a count over worlds that did not
happen. None of that means anything to somebody who thinks of a dataset as a fixed list that
arrived from nowhere. A reader who spends units 4, 5 and 6 computing summaries of a fixed list
is being trained into exactly that belief, right before we need them to abandon it.

So unit 4 hands the reader the generator. They press a button, the world number changes, and
440 new dots fall. Every dot is somewhere else. The shape is the same. That single experience
does more work than any definition of a random variable, because it gives the reader the
distinction the course runs on: **a shape is what survives a reroll, and a dot is what does
not.** Signal and noise, before either word is used, with no notation at all.

The medium forces this too, and this is the part a paper syllabus would never notice. The
seeded world is the signature feature of the whole project. Every instrument in every unit
carries a `seedBox`, because a teacher can say "everyone type world 42" and thirty screens
agree, and because a surprising result can be found again instead of lost. If chance arrives at
unit 6 or later, then units 1 through 5 put a control on the screen whose meaning the reader has
not been given. That is a small daily lesson that some things on this site are not for them.
Unit 4 makes the world number the reader's own instrument. From unit 5 onward, "reroll it and
see what holds" becomes the course's core verb, available in every single unit, and it is the
one move an interactive textbook can make that a printed one cannot.

The counter-argument at full strength. Randomness with nothing to be random about is empty, and
a reader who meets a probability distribution before they have ever summarised data has no
handle on it. This is a real objection and it is exactly why unit 4 is fourth rather than first.
The reader needs one thing before the generator, and one thing only: a shape they can recognise
on sight. Unit 3 gives them that and nothing more. There is no summary statistic in unit 3, no
mean, no spread, and that is deliberate, because the reroll lands hardest when the only thing
the reader owns is the picture. Then in unit 5 they compress the pile to a number, reroll, and
find that the number moves a little while the shape holds. The standard error is planted there,
three units before it is named, as a thing the reader has already watched happen.

Now the second half. Conditional probability, base rates and natural frequencies sit at unit 10,
next to hypothesis testing, and this is not filler placement.

The prosecutor's fallacy and the p-value misinterpretation are the same error. "The chance of
this DNA match if he is innocent" is not "the chance he is innocent given the match." "The
chance of a gap this big if the drug does nothing" is not "the chance the drug does nothing."
One conditional, read backwards, in both cases. Teaching those five units apart wastes the
identity, and the second one arrives looking like a fresh piece of pedantry about p-values that
readers have to memorise. Teaching them adjacent means unit 11 can open by saying that the
reader already made this mistake yesterday in a courtroom, and knows how it feels from the
inside. That is the difference between a rule and a reflex.

What the split costs: the reader never sees probability presented as a coherent subject with its
own axioms. I think that is the right thing to give up. For this audience probability is not one
subject, it is two tools that happen to share a name. A reader who leaves with "randomness makes
stable shapes" and "a conditional read backwards is a different number" has everything an
honest introduction can hand over, and wrapping those in a shared chapter title adds nothing
except the appearance of coverage.

### (b) The causal question is in unit 1, the counterfactual is in unit 6, the diagnosis is unit 13, the design is unit 15

Four arrivals, not one. Treating "when does causation enter" as a single decision is what makes
the question feel harder than it is.

Nobody has ever gathered data because they wanted to know a mean. Every dataset in existence was
collected because somebody wanted to know whether a thing works, or who is being hurt, or what
would happen if. If cause first appears in unit 13, then twelve units answer a question no
reader asked, and worse, the reader supplies the causal reading anyway. They will do it silently
on the first scatterplot they see, with no equipment, because that is what people do with a gap
between two groups.

So unit 1 asks for it. After the reader says which row of dots sits further right, a second
prompt asks why they think that is, offering four candidate reasons and a free text box. Nothing
is scored, no lesson is drawn, and the phrase "correlation is not causation" does not appear,
because a warning handed to a reader with no tools produces helplessness rather than caution.
The answer is read back twice: once at the end of unit 1, where the point is that a causal story
arrived within ninety seconds of the reader's first look at any data, and again in unit 13.

The genuinely load-bearing placement is the second one, and it is the claim in this section I
would defend hardest. **The counterfactual belongs in the sampling unit, not the causal unit.**

Random sampling and random assignment are one trick pointed at two questions. Sampling asks
about the units you did not draw and answers it by making the draw unbiased. Assignment asks
about the version of these same units that did not get treated, and answers it by making the
split unbiased. Both are the same act: manufacture ignorance on purpose so that the difference
between what you saw and what you did not see is unsystematic. Students who learn these in
separate months can recite "randomised controlled trial" without being able to say what the
randomisation buys, and that gap is the single most common hole in an educated adult's
statistical equipment.

Unit 6 therefore ends with a ghost. The reader draws a sample from a visible population, and
the sample they got is drawn in the data colour while the 990 units they did not get sit faded
behind it. The screen names that faded set: the draw you did not make. Unit 15 opens on the same
picture with one word changed, and the counterfactual arrives as a thing the reader has seen
before rather than a philosophical import.

Diagnosis waits until 13 for a structural reason rather than a stylistic one. Confounding cannot
be shown without the ability to compare groups inside a cloud, which is unit 12, and the
counterfactual is inert until the reader can hold a distribution of possible outcomes, which is
unit 7. There is no shortcut through that chain that does not ask for trust.

**Unit 13 sits before regression, and that ordering is not negotiable.** A slope is the most
efficient vehicle in the world for an unearned causal claim. It has units, it has a sign, and it
reads aloud as a sentence about the world: each extra year of schooling is worth eight hundred
pounds. A reader who meets least squares before they meet the third thing will hear that as a
mechanism, because nothing they own says otherwise. Confounding first means the first line the
reader ever fits arrives already carrying its own interrogation.

The cost is a real constraint on unit 13's instruments, which have to demonstrate confounding
without a fitted line. Group clouds and a contingency table carry it. The Berkeley admissions
table, which remains the best confounding example anybody has found, needs no lines at all.

### (c) Notation becomes unavoidable at the standard error, and not one unit before

The rule underneath every gate below: **a symbol is earned when a relationship has to be held in
the head, not when a procedure has to be described.** Recipes survive in English. Relationships
do not.

This is where I part company with the conventional placement, and with the more careful version
of it that puts the gate at the standard deviation. The standard deviation is a procedure. Take
each value's distance from the middle, square them, average, take the root. Four steps, four
English sentences, and the reader can execute it on eight numbers with a pencil. Sigma-notation
makes that shorter. Shorter is not the same as necessary. Introducing a symbol on the grounds
that it saves words teaches the reader that notation is a convenience for people who write a lot
of maths, and that is a small false thing to believe.

The standard error is not a procedure. It is a relationship among three quantities that vary
together, and the whole content of the idea is how it behaves when you turn the knobs. Wobble
goes up with spread and down with the root of the count. Try holding that in prose while moving
a sample-size slider and watching a distribution narrow. It cannot be done, and the reader can
feel that it cannot be done, which is the only honest reason to hand anybody a symbol.

The gates, in order.

**1. Digits, tallies and place value (unit 1).** This is already notation, and the reader is
fluent in it, and saying so out loud to somebody who has decided they cannot handle symbols is
worth a paragraph. They operate a positional numeral system several times a day without
noticing.

**2. Units and the "per" construction (unit 2).** 41 per 100,000 per year. The rare notation
that makes a number less ambiguous rather than more, introduced as a habit rather than a rule: a
bare number is incomplete.

**3. n (unit 3).** The only symbol on the screen in that unit. It means how many things are in
the pile. One symbol, one meaning, no operations performed on it.

**4. Nothing at all (units 4 and 5).** A deliberate hold across the two units where a
conventional course front-loads the most algebra. Unit 5 names four summaries and writes none of
them symbolically. They are "the middle", "the typical miss", "the middle half", and "the five
numbers". The instrument computes; the reader drags a bracket and reads a number off it. This
hold is the thing I would most expect a reviewer to argue with, and section "where this spine is
most likely wrong" takes it seriously.

**5. The alphabet changes: μ and σ against x̄ and s (unit 6).** Greek arrives for exactly one
reason. There are now two different objects in the room, the truth you do not have and the
measurement you do, and one word was covering both. Introducing μ back in unit 5 alongside x̄,
which is what most textbooks do, spends the one moment where a change of alphabet would have
taught something, and leaves the reader believing Greek letters are a house style. Unit 6 is the
screen where the same population has produced three different sample means. That is when the
names have to divide, and the sentence that does it is "there are two things here now."

**6. The gate: Σ, xᵢ, and se = s/√n (unit 7).** Sigma and the subscript arrive here,
retroactively, to write down the s the reader has been operating since unit 5, because s now has
to appear inside a larger expression and English cannot nest. The subscript is the harder half
and it is a separate idea: an index refers to a position rather than to a value, and readers
comfortable with x̄ stall on xᵢ routinely. Sigma is introduced as an imperative verb, read
aloud as "add up all the", which fixes more confusion than any diagram of it.

There is a second payoff at this gate that most courses forfeit. Unit 5 introduces the typical
miss as the mean absolute distance from the middle, because that is what an honest person means
by "typical miss". The standard deviation then arrives beside it, as a near-identical number
computed a stranger way. Unit 5 does not explain the squaring. It says outright that the reason
is real and is two units away. Unit 7 pays: variances add and mean absolute deviations do
not, so when two wobbles combine, only the squared version composes. The usual textbook line,
that we square to get rid of the minus signs, is false, since absolute value also gets rid of
them, and readers who are paying attention know they have been fobbed off.

**7. x̄ ± t*·se (unit 9).** The first formula the reader operates rather than reads.

**8. The vertical bar, P(A | B) (unit 10).** Read aloud as "the chance of A among the Bs", which
is the reading that makes the flip visible.

**9. p and α (unit 11), r (unit 12), ŷ and the residual (unit 14).** The hat and the residual
arrive in the same breath because neither means anything alone.

One rule sits under all nine, taken from VOICE.md and repeated here because it is what makes the
gates work rather than merely postpone pain: once a symbol is earned, it is used. Retreating to
"the average" for the rest of the unit out of kindness tells the reader the notation was a
hurdle they cleared, not a tool they now own.

### (d) The first beautiful moment is unit 4, and it is every dot moving while the shape stays still

The instrument. The screen holds 440 dots in a histogram the reader built in unit 3. Below it,
one control: a world number, and a die-roll button. The reader presses it. Every dot leaves its
place, falls, and lands somewhere else. The outline does not move. They press it again. And
again, because everyone presses it again.

Why this one, and why fourth.

Beauty needs a violated expectation, and this is the first place in the course where the reader
has one to violate. They expect new random data to look different. It does not. The gap between
what they expected and what happened is the entire content of the course's central idea. So the
aesthetic moment and the load-bearing moment are the same moment, which is the condition
PEDAGOGY section 6 sets for spending a beauty budget at all.

It is also the reader's own hand, repeatedly, on a control they can carry into every later unit.
That matters more than it sounds. Principle 1 says name the thinking the reader already does,
and an animation the reader watches is a thing done to them. The reroll is a thing they do, and
the finding accumulates across presses rather than arriving in a single tween. Nobody has to be
told the shape held. They watched it hold eleven times.

The alternatives, and why they lose.

The pile assembling itself in unit 3 is the obvious candidate and it is genuinely lovely: a
column of raw numbers, unpleasant to look at, falls and stacks into a body with a peak and a
tail. It stays in the ladder below at position one. It loses the top spot on a narrow ground.
Its surprise is small, because the reader already believed the numbers had a pattern and had not
yet drawn it, so the emotion is recognition rather than shock. It is a good opening and a weak
thesis.

The Galton board is more beautiful than either and it is unit 8, because a reader who meets the
bell before they have felt variability reads it as decoration. The board is worth too much to
spend that way.

The balance point in unit 5 is the first beautiful theorem in the course. The signed distances
from the mean sum to exactly zero, and the reader finds the point by tipping a beam until it
stops tipping. It loses because it is a fact about a definition rather than a fact about the
world.

The full ladder, since the schedule matters more than any single choice on it. One per unit at
most, each paid for by an idea, none decorative.

| Unit | The moment | What makes it beautiful |
|---|---|---|
| 3 | The fall | A group turns out to have a property no member of it has |
| 4 | The reroll | Every dot moves and the shape does not |
| 5 | The beam | The distances balance exactly, and you find the point by feel |
| 7 | The stack | The estimate turns out to have a distribution of its own |
| 8 | The board | Any nudge with a finite spread, added often enough, gives the same curve |
| 9 | The hundred | Five of the hundred intervals miss, and you cannot tell which |
| 11 | The shuffle | Breaking the link by hand, a thousand times, builds the null world |
| 14 | The squares | The hand-dragged line and the algebra land on the same place |
| 15 | The balancer | Randomising balances a variable nobody measured |

---

## The units

Field names match `app/curriculum.js` so that the data file can be regenerated mechanically.

### 1. Bigger, smaller, how sure

**The one question.** How do I know one pile is bigger than another, and how sure am I?

**Installs.** You can see "more" without counting, up to about four things. Past four the eye
gives up, and the place where it gives up is the reason counting had to be invented. Comparison
by eye is already estimation, and the feeling of not being sure is a standard error before it is
a number. That feeling is data about the evidence, not a weakness in you.

**Notation earned.** Tally marks, grouping into fives, then digits and place value, framed as
the original compression technology rather than as arithmetic. No letters standing for numbers.

**Misconception killed.** "Maths starts when the symbols appear, and that is where I got off."
By the end of this unit the reader has made three mathematical moves, comparing and estimating
and hedging, with no symbol on the screen, and the text says so in the past tense.

**Instruments.**
- *The two rows.* Two rows of scattered dots on one axis. The reader says which row sits further
  right, commits a confidence on a three-way control, then sees the truth. Overlap is tuned
  across rounds so that they are right when confident and wrong when not. Needs `rng`, `stage`
  (`dots`, `axisX`), `ui.segmented`, `ui.readout`.
- *The glance.* Dots flash for 400 ms and vanish. At four, everybody is exact. At seven, nobody
  is. The failure is the punchline, and the reader is told it is universal. Needs `engine.tween`,
  `stage.dots`.
- *The tally bench.* Count 63 objects three ways, one at a time, in fives, in tens, against a
  clock. Place value falls out as the answer to "how do I stop losing my place".
- *The floor slider.* The distortion, below.

**Truths and lies.** The reader is handed a true 8% difference between two cafes' wait times and
asked to make it look like a scandal. They drag the axis floor from 0 up to 4.9 minutes and the
bar becomes five times its neighbour. No number changes at any point. Then they drag it back and
are asked whether a temperature chart should start at zero, which it should not, so the tell
cannot be the crop. The question the unit leaves them with is whether the size of the change on
the screen matches the size of the change in the world.

**Time.** 20 min. **Depends on.** Nothing. This is the door.

**The causal ledger.** After the reader picks a row, a second prompt asks why they think that
row is higher, with four plausible options and a text box. It is read back at the end of this
unit, and stored for unit 13. Storage is `localStorage` and it will often be gone by then, so
unit 13 has a generic fallback that is weaker but works.

### 2. Putting a number on it

**The one question.** How do I turn something real into a number, and what does the number cost?

**Installs.** Every number is a fact plus a decision about what counts, plus a choice of unit,
plus an instrument with a finite resolution. Four kinds of number and what arithmetic is legal
on each: a label, an order, an interval, an amount. The reflex of asking "per what" of every
rate, and the habit of asking what was thrown away when the world got compressed into a figure.

**Notation earned.** Units written beside every number, and the "per" construction. 3.2 kg. 41
per 100,000 per year.

**Misconception killed.** "A number is a fact, and the argument only starts afterwards." A
second one goes with it: more decimal places do not mean more accuracy.

**Instruments.**
- *The denominator switch.* One dataset of country totals with a four-way toggle: total, per
  person, per unit of output, per year. The ranking reorders on every switch and every ordering
  is true. Needs `ui.segmented`, `stage.bars`.
- *What counts as a tree.* A drawing containing ambiguous objects, saplings and stumps and a
  hedge. The reader sets the counting rule and the count changes. The rule is the finding.
- *The ruler.* A measuring instrument with a resolution dial. Turn it up and spurious digits
  appear; repeated measurements of the same object start disagreeing in the last place.

**Truths and lies.** Change the denominator, change the villain. "Country A emits more than
Country B" and "Country B emits more than Country A" are both true of the same year, one total
and one per person. The reader performs the flip themselves, then writes the headline for each.

**Time.** 20 min. **Depends on.** 1.

### 3. The pile

**The one question.** What does a whole group of numbers look like at once?

**Installs.** You cannot hold 500 numbers in your head, so you either draw them or summarise
them, and drawing first is the better habit because a summary computed before the picture is a
summary of something nobody looked at. A distribution is a picture of a crowd. Shape words come
before any arithmetic: peak, tail, gap, floor, ceiling, two humps.

**Notation earned.** n, and nothing else. It means how many are in the pile.

**Misconception killed.** "The average is what a dataset is." Also the quieter one, that an
outlier is a mistake. Some are errors and some are the finding, and telling them apart is a
question about the world rather than about the numbers.

**Instruments.**
- *The fall.* A column of raw values scrolls past, deliberately unpleasant, the way a file
  actually looks the first time you open it. One button. The numbers fall, stack by value and
  settle into a shape with a peak, a right tail and a hard floor at zero. Needs `stage.dots`,
  `stage.bars`, one `engine.tween`.
- *The bin dial.* Same 400 numbers, bin width on a slider, running from a comb to a single
  block.
- *Three drawings.* Strip plot, histogram and box plot of one dataset side by side, with a
  toggle. The box plot is introduced here as a picture, not as a calculation, and its numbers
  are earned in unit 5.
- *The shape zoo.* Six real distributions the reader names by eye: heights, income, city sizes,
  reaction times, exam marks, days between earthquakes.

**Truths and lies.** Bin width is a dial and somebody is always turning it. The reader is asked
to produce a one-hump story and a two-hump story from the same 400 numbers, and both charts are
honest.

**Time.** 18 min. **Depends on.** 2.

### 4. Reroll the world

**The one question.** If I ran the same thing again, what would change and what would stay?

**Installs.** Randomness as a generator rather than as a disclaimer. A process can be
unpredictable one draw at a time and dependable in bulk, and those two facts are not in tension.
A shape is what survives a reroll. Independence, stated as the thing that makes the last draw
useless for predicting the next. The long run, and how long the long run actually is.

**Notation earned.** None, deliberately. The world number is an integer the reader types, and it
is the only thing on the screen that looks like symbolism.

**Misconception killed.** Two, and they are twins. "Random means anything can happen, so nothing
can be said about it" and "that run of six reds means something." The first refuses to look, the
second over-reads. Both are cured by the same instrument.

**Instruments.**
- *The reroll.* The unit 3 histogram with a `seedBox` under it. Press the die, get a new world,
  watch every dot move and the outline hold. A ghost outline of the previous world can be
  toggled on. Needs `rng`, `ui.seedBox`, `stage.bars`, `engine.tween`.
- *The long run.* A running proportion of heads plotted against the number of flips, next to the
  raw count of heads minus tails. The proportion settles toward a half while the raw gap wanders
  further from zero, and both are true at once. This is the single most useful picture in the
  unit, because "the law of averages will even it out" is false in the second panel and true in
  the first.
- *The streak reader.* Two sequences of 80 coin flips, one generated and one written by a human
  trying to look random. The reader picks which is real and gets it wrong, because people who
  fake randomness underproduce long runs. Needs `rng.shuffle`, `ui.quiz`.
- *The screenshot machine.* The distortion, below.

**Truths and lies.** Reroll until it looks like what you wanted to say, then screenshot. The
reader is given a genuine null effect, a reroll button and a target headline, and told to keep
pressing until the chart supports the headline. It takes about eleven presses. The screen then
shows the world numbers they discarded. This is p-hacking in its purest visible form, performed
before the reader has ever heard of a p-value, and unit 11 calls back to it by name.

**Time.** 20 min. **Depends on.** 3.

### 5. How few numbers can I get away with

**The one question.** How much of a crowd can I carry in my pocket?

**Installs.** Summarising is compression, compression discards, and the discarded part is where
every later argument happens. The mean as the balance point of the beam. The median as the
middle one, and the choice between them as a question about what you are asking rather than
about which is better. The typical miss, first as the mean absolute distance from the middle and
then as the standard deviation beside it. Quantiles and the five-number summary as the next rung
up the compression ladder.

**Notation earned.** None. Four quantities are named in English and used in English: the middle,
the typical miss, the middle half, the five numbers. Section (c) argues this hold at length. The
squaring in the standard deviation is flagged as unexplained, on purpose, with a promise
attached to unit 7.

**Misconception killed.** "The average is the typical person." Also that the mean and the median
are two methods for one job, when they answer two different questions and disagree exactly when
the disagreement is the finding.

**Instruments.**
- *The one-number challenge.* The reader is shown a pile and asked to pick one number to send to
  somebody who will never see the data. Then a second pile appears with the same number and a
  completely different shape. Needs `ui.slider`, `stage.bars`.
- *The beam.* Values as weights on a plank. Drag the fulcrum until it stops tipping. The reader
  has computed a mean with their hand, and the signed distances on each side are shown summing
  to zero at the balance point. Drop one value at 100 million and watch the fulcrum leave the
  crowd entirely while the middle one does not move. Needs `stage.dots`, `stage.vline`,
  `stage.bracket`.
- *The bracket.* Drag a bracket out from the middle until it feels like it covers a typical
  distance. The reader's guess is then shown against the computed mean absolute deviation and
  the standard deviation, which are close, and the reader is told the second one is computed a
  strange way for a reason that arrives in unit 7.
- *The rebuild.* Reconstruct the original pile from 1 number, then 2, then 5, then 9. What comes
  back and what stays lost is the unit's whole argument, and the box plot from unit 3 gets its
  numbers here.

**Truths and lies.** A centre quoted with no spread is a half-truth with a clean face. The
reader publishes "average wait: 4 minutes" for two cafes with identical means, one of which
never exceeds 5 minutes and one of which hits 25 twice a day. Then they write the sentence that would
have been fair to both.

**Time.** 26 min. **Depends on.** 3, 4.

**Over budget, and where it splits.** PEDAGOGY budgets the loop at 17 to 25 minutes, so this
unit is one minute over the ceiling with four instruments. It is one unit rather than two on
principle. Teaching the centre in one session and the spread in the next tells the reader, by
the shape of the course, that a centre can stand alone. That belief is the most common
statistical error in public life. If a build agent finds it does not fit, the split is at the
rebuild, and unit 5b takes quantiles, the five numbers and the box plot at about 10 minutes.

### 6. A few, for many

**The one question.** How can a thousand people tell you about three hundred million, and when
can they not?

**Installs.** Random selection is a mechanism, not a virtue. Bias is a property of the procedure
and not of the sample size, so a bigger sample drawn badly is a more confident wrong answer. The
sampling frame, and the people it cannot reach. Nonresponse as the modern version of the same
problem. And the counterfactual, introduced as the draw you did not make.

**Notation earned.** μ and σ against x̄ and s. The alphabet changes because there are now two
objects, the truth you do not have and the measurement you do.

**Misconception killed.** "A bigger sample is a better sample." Killed by construction: a
self-selected sample of 2,400,000 against a random sample of 50,000, run across many worlds
against a known truth, with the big one wrong every single time.

**Instruments.**
- *The urn.* A visible population of 1,000 units with a known mean. The reader picks 20 by hand,
  by clicking, then compares their hand-picked mean with the truth. People pick spread-out
  interesting-looking units and their mean is fine while their spread is badly wrong, which is a
  better lesson than the usual one. Then they draw 20 at random. Needs `rng.sample`,
  `stage.dots`.
- *The two samplers.* The Literary Digest against Gallup, rebuilt live and rerun across worlds.
- *The frame gap.* A population with a slice the frame cannot reach, mobile-only households or
  people who do not answer unknown numbers, with a dial for how different that slice is.
- *The other draw.* The sample the reader got, drawn in the data colour, with the 980 units they
  did not get faded behind it. The screen names the faded set. Section (b) explains why this
  picture is here and not in unit 15.

**Truths and lies.** A huge biased sample beats a small fair one on every surface cue a reader
has: it sounds more thorough, the margin of error printed under it is smaller, and it is wrong.

**Time.** 20 min. **Depends on.** 4, 5.

### 7. The wobble

**The one question.** If I did this study again, how different would the answer be?

**Installs.** The sampling distribution as an object in its own right, built rather than
asserted. The standard error as the spread of that object. The root-n law and what it costs: to
halve your uncertainty you need four times the data. And the reason variance is the quantity
that adds.

**Notation earned.** The gate. Σ and xᵢ, s written down properly for the first time, and
se = s/√n.

**Misconception killed.** "The standard error is the spread of my data." It is the spread of an
answer, and the two are different objects living on different pictures, which is why the
instrument keeps both on screen at once. A second one: "with enough data the wobble goes away."
It shrinks and never reaches zero, and it shrinks slowly.

**Instruments.**
- *The stack.* The population on top, one sample drawn from it in the middle, and that sample's
  mean dropped as a single dot into an accumulating pile at the bottom. Draw again. Again. Watch
  a second distribution build itself out of answers. Manual first, then a run-1000 button. Needs
  `rng`, `stage` (`dots`, `bars`, `vline`), `engine.loop`.
- *The n dial.* Sample size on a slider from 4 to 400, with the stack rebuilding and a √n
  reference curve the reader can toggle over the width.
- *The adding machine.* Two independent wobbles combined. Their variances add and their typical
  misses do not, and the reader checks both numerically. This is unit 5's unpaid debt being
  settled.
- *The one you actually have.* The whole stack greys out except a single dot. That dot is your
  study. You never see the rest, and the standard error is how you talk about the pile you
  cannot see.

**Truths and lies.** Quoting the spread of the data as the precision of the study, and the
"we surveyed 50,000 people" boast attached to a sample that was never random, which is unit 6
returning with a formula attached.

**Time.** 24 min. **Depends on.** 6.

### 8. The ruler that keeps turning up

**The one question.** How do I turn a distance into a probability?

**Installs.** The normal family as a measuring device rather than as a description of the world.
Its job in this course is to convert "how far out is this" into "how often does that happen".
The 68/95/99.7 landmarks as a ruler the reader can use from memory. z as distance measured in
units of wobble. And the central limit theorem, arriving as the explanation of something the
reader already watched: the stack in unit 7 was bell-shaped no matter what was feeding it.

**Notation earned.** z = (x − μ)/σ, and the density as a curve with two knobs.

**Misconception killed.** "Data is normally distributed." This is the most damaging thing an
intro course installs by accident, and it gets killed with an instrument rather than a caveat.
Income, city sizes and word frequencies are shown failing a normal fit badly, and then the
*means* of samples from those same populations are shown passing it. The normal curve is a fact
about averages far more often than it is a fact about data.

**Instruments.**
- *The board.* A Galton machine. Beads, pins, pure coin flips at every pin, and the same heap at
  the bottom every time. Needs `rng`, `engine.loop`, `stage.bars`.
- *The population picker.* Feed the unit 7 stack from a uniform source, a heavily skewed one, a
  two-humped one, and a fat-tailed one. Three converge quickly and one does not, and the failure
  is kept in rather than hidden. Needs `stats.normPdf`, `stage.curve`.
- *The two knobs.* μ slides the curve, σ scales it, and the shape is untouched by either. A
  family, not a curve.
- *The z ruler.* Drag a value along the axis and read the tail area off a shaded region, with
  the three landmarks marked. Needs `stats.normCdf`, `stage.area`.

**Truths and lies.** The fat tail. A risk model that assumes normality and prices a
once-in-ten-thousand-years event that then shows up twice in a decade. The reader sets the
tail thickness and reads the two answers side by side.

**Time.** 22 min. **Depends on.** 7.

### 9. The honest range

**The one question.** What is the widest claim I am entitled to make?

**Installs.** An interval is the set of values the data does not rule out. The confidence level
is a property of the procedure and not of the interval in front of you. t against z, and why the
correction exists, which is that you estimated the spread from the same small sample. Width as a
design decision with a price in sample size.

**Notation earned.** x̄ ± t*·se. The first formula the reader operates.

**Misconception killed.** "There is a 95% chance the true value is in my interval." Killed by
construction rather than by assertion. Run 100 worlds, draw 100 intervals stacked vertically
against the known truth, and watch about five of them miss. Any single interval is either right
or wrong and you cannot tell which. The 95% describes the factory, not the item.

**Instruments.**
- *The hundred intervals.* The canonical picture, seeded, so that a room of thirty screens misses
  on the same five worlds and the teacher can point at one. Needs `rng`, `stats.meanCI`,
  `stage.line`, `stage.hline`.
- *The confidence dial.* 50, 80, 95, 99. Width trades against capture rate in front of the
  reader, and the 95 is revealed as a convention rather than a law.
- *The width budget.* The reader is given a target width and has to buy the sample size that
  delivers it, which makes root-n cost money.
- *The difference interval.* Two group intervals that overlap, next to the interval for the
  difference, which excludes zero. Both pictures are correct and they appear to disagree. This
  screen is the bridge into unit 11.

**Truths and lies.** Overlapping intervals reported as "no difference between the groups", which
is the most common inferential error in published science, and the interval quoted without ever
saying what population it refers to.

**Time.** 20 min. **Depends on.** 7, 8.

### 10. What the evidence is evidence for

**The one question.** A test came back positive. What are the chances I have it?

**Installs.** Conditional probability by counting bodies rather than dividing symbols. Base
rates, and why they refuse to stay in people's heads. Sensitivity and specificity as two
different conditionals that are easy to confuse and easy to keep apart once you have drawn the
tree. Bayes as bookkeeping rather than as philosophy.

**Notation earned.** The vertical bar. P(A | B), read aloud as "the chance of A among the Bs".
The natural-frequency tree comes first and the symbol is written on top of the tree the reader
has already built.

**Misconception killed.** "A 99% accurate test means 99% of positives are real." The reader sets
prevalence and accuracy with two sliders and watches the share of true positives among positives
collapse to a third, then a tenth, while the accuracy number never moves.

**Instruments.**
- *The thousand people.* A natural-frequency tree drawn as 1,000 figures that split. No fractions
  appear until the counting is done. Needs `stage.dots`, `ui.slider`.
- *The flip.* One table, both conditionals side by side, computed from the same four cells. Two
  sentences that sound identical and differ by a factor of thirty.
- *The courtroom.* A match probability of one in a million in a city of ten million, and the
  reader argues both sides.

**Truths and lies.** The prosecutor's fallacy, performed twice by the reader, once as prosecutor
and once as defence, with the same table on screen both times.

**Time.** 20 min. **Depends on.** 4, 6.

### 11. Putting a claim on trial

**The one question.** Is this gap real, or could luck have done it?

**Installs.** The shuffle test. The null world as a machine the reader builds rather than a
formula they invoke: if the label made no difference, then the labels are interchangeable, so
shuffle them and see what gaps turn up. The p-value as a count. The two ways to be wrong. The
significance filter, the forking path and the file drawer, all as mechanisms rather than as
scandal.

**Notation earned.** p and α, and the null hypothesis written as a sentence describing a world
rather than as a symbolic statement.

**Misconception killed.** "The p-value is the chance the result is a fluke." This is the flipped
conditional from unit 10, arriving one unit later on purpose, and the text says so directly:
you made this mistake yesterday in a courtroom.

**Instruments.**
- *The shuffle.* Real group labels on real outcomes. The reader detaches the labels, shuffles
  them by hand once, and records the gap. Then ten times. Then a thousand, and their actual
  observed gap is shown landing somewhere in the resulting pile. Needs `rng.shuffle`,
  `stats.twoGroup`, `stage.bars`, `stage.vline`.
- *The tail counter.* The same picture with the tail shaded and counted, and the count written
  as a fraction. The t-test is then offered as a shortcut that agrees with the shuffle to two
  decimal places, and it is introduced as a shortcut rather than as the real thing.
- *The forking path.* One dataset, six defensible analysis choices, and an instruction to find a
  significant result. The reader will find one in under two minutes. This is unit 4's screenshot
  machine wearing a lab coat.
- *The file drawer.* Twenty honest studies of a null effect. One is significant. Only that one
  is published, and the reader reads the published literature and reaches the wrong conclusion
  by reasoning correctly.

**Truths and lies.** "Not significant" reported as "no effect", which is a different claim, and
p-hacking performed by the reader with no dishonesty at any step.

**Time.** 24 min. **Depends on.** 9, 10.

### 12. Two things at once

**The one question.** When one thing moves, does the other?

**Installs.** Read the scatter before computing anything, for the same reason you drew the pile
before summarising it. Correlation as a number with a narrow job and no units. The difference
between r and a slope, which is the difference between how tightly and how steeply. Non-linearity
and range restriction as the two ways r lies without anybody touching the data.

**Notation earned.** r, and why it has no units, which is the first time the reader meets a
quantity deliberately built to be unitless after unit 2 spent 20 minutes insisting on units.

**Misconception killed.** "A strong correlation means a big effect." Also "r near zero means no
relationship", which the U-shaped cloud kills in one screen.

**Instruments.**
- *The guesser.* Estimate r from a cloud, then from a second cloud with the same r and a
  different shape. Needs `rng.n`, `stats.corr`, `stage.dots`.
- *Anscombe.* Four clouds, one set of summary statistics, and the reader computes before they
  look.
- *The window.* Slide the start year on a real series and watch r swing from strongly positive
  to negative without a single value changing.
- *The stretch.* Crop the x-range and watch r collapse while the underlying relationship sits
  there unchanged. Range restriction is why "test scores barely predict performance" studies
  inside selective institutions are so often misread.

**Truths and lies.** The chosen window. The reader picks a start year to make the same series
tell either story, and then has to state the rule they would want a stranger to follow.

**Time.** 18 min. **Depends on.** 3, 5.

### 13. The third thing

**The one question.** How do I tell a cause from a coincidence?

**Installs.** Confounding as a mechanism you can draw with three arrows. Stratification as the
fix, and its limit, which is that you can only condition on what you measured. Simpson's
reversal, as an arithmetic fact rather than a paradox. The difference between "does it predict"
and "would it change anything if I intervened". And the collider, because "control for
everything" is advice that creates associations out of nothing.

**Notation earned.** A two-way table and an arrow diagram. No new algebra, which is deliberate:
the hardest causal ideas in the course arrive with the least symbolism, and that is worth saying
to a reader who has been assuming difficulty tracks notation.

**Misconception killed.** "Correlation is not causation" as a slogan. A slogan stops the
sentence, and the unit replaces it with a procedure: name the third thing, then go and look
inside it. A reader who leaves with the slogan can dismiss any finding they dislike, which is
how the phrase is mostly used in public.

**Instruments.**
- *The Berkeley table.* The aggregate favours men and every department favours women. The reader
  works the arithmetic and it comes out both ways. Needs a table component and `ui.steps`.
- *The splitter.* A single cloud with a hidden third variable. The reader drags a control that
  colours by the hidden variable, the cloud separates into groups, and the within-group slopes
  point the other way. Needs `stage.dots` with grouped fills.
- *The collider.* Two independent traits, and a selection filter. Condition on the filter and
  the traits become correlated inside the selected set. The example is admissions or dating, and
  the reader creates the correlation out of two independent generators.
- *The ledger.* Unit 1's stored answer comes back, with the reader's own sentence from ninety
  seconds into the course, and the question is which of the four structures it assumed.

**Truths and lies.** The same tool used honestly and dishonestly. Doll and Hill checked
confounding seriously and the tobacco industry's constitutional hypothesis was formally the same
move. Telling them apart is not a matter of the statistics, and the unit says so.

**Time.** 22 min. **Depends on.** 12, 10.

### 14. The line through the cloud

**The one question.** Can one line stand in for a cloud, and how would I know when it stopped
working?

**Installs.** Fitting as minimising a total miss. Residuals as the leftovers, and the residual
plot as the place where a model confesses. Prediction against explanation, which are different
jobs with different standards. Regression to the mean. Overfitting. And the general idea of a
model as a deliberate simplification with a stated cost, because a line is the reader's first
model and there is no need for a separate unit to say so in the abstract.

**Notation earned.** ŷ, b0, b1, and the residual. The hat and the residual arrive together
because neither means anything alone.

**Misconception killed.** "A slope is an effect." Unit 13 pre-loaded the antibody and this is
where it gets used. A second one, and it is the more interesting: regression to the mean read as
a causal story, which is how a remedial programme takes credit for arithmetic.

**Instruments.**
- *The hand fit.* Drag a line through a cloud with a running total of squared misses displayed,
  and a shrinking square drawn on each residual. Get it as low as you can. Then the machine's
  answer drops in and lands on top of yours. Needs `stats.ols`, `stage` (`dots`, `line`),
  `ui.slider` for slope and intercept.
- *The residual strip.* A second panel under the scatter. Flat when the model fits, curved when
  it does not, and the reader learns to read the second panel before believing the first.
- *The order dial.* Fit a straight line, a gentle curve and a wiggle through 12 points. The
  wiggle wins on the points it saw. Then reroll the world, keep the fitted curves, and watch the
  wiggle fail badly while the line barely moves. This is unit 4's reroll doing the heaviest work
  it does anywhere in the course.
- *The tall fathers.* Galton's data. Predict the sons' heights, find the pull toward the middle,
  and then be shown the same arithmetic applied to a school improvement programme.

**Truths and lies.** Extrapolation past the edge of the data, performed with a slider that runs
the fitted line out to absurdity while staying mathematically correct. And the press-office
sentence: the reader is handed a fitted slope and asked to write the headline, then shown what
they quietly assumed.

**Time.** 26 min. **Depends on.** 13, 9.

**Over budget, and where it splits.** Four instruments and 26 minutes against a 25-minute
ceiling. The split is at the order dial: unit 14b takes overfitting, prediction against
explanation, and what a model is, at about 12 minutes. If both this and unit 5 split, the course
is eighteen units and about 350 minutes.

### 15. Comparisons built on purpose

**The one question.** How do you build a study that can settle a causal question?

**Installs.** Random assignment as the same trick as random sampling, pointed at a different
question. Balance on variables nobody measured, which is the thing randomisation buys and the
thing no amount of statistical adjustment can. Blinding, and what it protects against. The
control group as a manufactured counterfactual. And what you do when randomising is impossible:
a comparison group, a before and an after, and one assumption you have to argue for out loud.

**Notation earned.** Difference-in-differences, written first as a 2x2 table of four means that
the reader fills in, and then as one subtraction of two subtractions. The formula is the table,
rearranged.

**Misconception killed.** "You cannot run an experiment on that, so it is unknowable." And its
opposite, which is more common among people who have had one statistics course: "it was an
experiment, so it settles the matter."

**Instruments.**
- *The balancer.* A population with a hidden variable that affects the outcome. Assign at
  random, and a readout shows the imbalance in that hidden variable across many worlds, centred
  on zero and shrinking with group size. Then let the reader assign by judgement instead, and
  watch the imbalance stop being centred on zero. Needs `rng.shuffle`, `stats.twoGroup`,
  `ui.seedBox`.
- *The 2x2.* Card and Krueger's fast-food table. Four numbers, and the reader fills in the
  fourth after computing the other three.
- *The parallel-trends slider.* The whole assumption made visible. The reader tilts the
  counterfactual trend for the comparison group and watches the estimated effect slide from
  large to zero to negative, without any observed data changing. This is the instrument the unit
  exists for.
- *The Snow map.* Two water companies serving interleaved houses on the same streets. The
  cleanest natural experiment anybody has found, and it predates the theory by a century.

**Truths and lies.** Parallel trends smuggled in as a technical detail when it is the entire
claim, and the "natural experiment" whose natural part was chosen after the results were seen.

**Time.** 24 min. **Depends on.** 13, 11, 14.

### 16. Telling the truth with numbers

**The one question.** How do I say something true, clearly, without misleading anyone, including
myself?

**Installs.** The whole toolkit turned on prose. A working order of questions to put to any
claim: what was measured, per what, compared to what, how big is the wobble, what else differs
between the groups, and who never made it into the data. The difference between a lie and a
framing, which is real but narrower than people want it to be. And the reader's position as a
producer of numbers rather than only a consumer of them.

**Notation earned.** Nothing new. The unit is about sentences, and that is the point.

**Misconception killed.** "People who mislead with statistics are lying." Most misleading numbers
are produced by people who believed they were being careful, using defaults they did not choose,
under deadline. The reader has spent fifteen units doing exactly that on purpose.

**Instruments.**
- *The headline machine.* One true finding. The reader writes three headlines, one that
  overstates, one that understates and one they would defend, and each is scored against what a
  reader would come away believing rather than against what it literally says.
- *The claim autopsy.* A real published claim, taken apart with the six questions in order, with
  the reader's answers accumulating into a verdict they wrote themselves.
- *The rebuild.* A distorted chart handed back honestly. Sometimes the story survives, and that
  case is included on purpose, because a course that only ever debunks teaches the reader that
  the correct posture is refusal.

**Truths and lies.** All of them, and one closing point that the reader is now equipped to hear:
the tools in this course are equally good at both jobs, and nothing in the mathematics decides
which one you are doing.

**Time.** 20 min. **Depends on.** All of them.

---

## What is deliberately absent

**A Bayesian framework.** Conditional probability is unit 10 through natural frequencies, and
Bayes' theorem sits in a depth block there. A full Bayesian unit is the strongest candidate for
a seventeenth, and it would go directly after unit 9. The honest range is where the frequentist
reading is at its least intuitive, and a posterior interval is exactly the object readers thought
they were being handed. It is out because two inferential frameworks in one introductory course
produce readers who can operate neither, and because the misconception unit 9 exists to kill is
the one a Bayesian treatment then legitimises. This is the weakest call in
the document.

**Named tests as a catalogue.** No chi-square unit, no ANOVA unit, no non-parametric unit. Under
a shuffle-first spine these are variations on unit 11, differing in what gets shuffled and what
statistic gets recorded. They belong in a reference page that maps each named test onto its
shuffle, which is a page and not a unit.

**Combinatorics and formal probability axioms.** Counting arrangements is a genuine skill and it
is not the skill this course exists to build. Unit 4 gets its probabilities from repetition and
unit 10 gets them from counting bodies in a tree, and neither needs a factorial.

**Time series, survival analysis, multilevel models, anything called machine learning.** Out of
scope for a first course. The order dial in unit 14 plants overfitting, which is the one idea
from that territory a general reader needs in order to read the news.

**Calculus-based derivations.** Not because readers cannot handle them, but because every
derivation this course would need can be replaced by a simulation that shows the same thing and
convinces more people. The n − 1 correction is the test case: watching a biased estimator sit
consistently low across 10,000 simulated samples persuades people that the algebra does not.

---

## Where this spine is most likely wrong

**The notation hold through units 4 and 5 may be too long.** Two consecutive units with no new
symbols is a genuine risk, and the specific danger is condescension rather than confusion. A
reader who can already do algebra may read the English-only summaries as being handled with
care, which is the one tone VOICE.md bans outright. The mitigation is the depth mechanism from
PEDAGOGY section 5, and a depth block in unit 5 that gives the symbolic forms in full to whoever
opens it. If reader feedback says the hold reads as coddling rather than as sequencing, the fix is to
move the Σ gate back to unit 5 and let unit 7 carry only se, which costs the variance-adds
payoff and is survivable.

**Unit 4 may be doing too much of the course's work.** Four instruments, the beauty moment, the
seed feature, the first distortion the reader manufactures, and the load-bearing signal-noise
distinction. If it fails, five later units lose their foundation at once. That is a real single
point of failure, and it argues for building unit 4 second, immediately after unit 1, so that it
is tested on readers early rather than late.

**Splitting probability may leave a hole neither half covers.** Independence gets one instrument
in unit 4 and never returns explicitly, and independence is the assumption that fails most often
in real data. Clustered samples, repeated measures and network effects all break it, and this
spine has nowhere to put that. The honest patch is a depth block in unit 7 on what happens to
the standard error when the draws are not independent, and it is a patch rather than a solution.

**Unit 5 and unit 14 are both over the loop ceiling.** Split points are named in each entry. If
a build agent reports that either does not fit, they are right and it should split.

**The causal ledger assumes continuity across sessions.** Unit 1 writes to `localStorage` and
unit 13 reads it back, and most readers will not reach unit 13 in the same browser or the same
month. Unit 1 mitigates this by reading the answer back within its own session, so the ledger's
main payoff is collected immediately and unit 13's callback is a bonus rather than a load-bearing
beam. Section (b) leans on the immediate payoff, not the deferred one.

**344 minutes is longer than anybody finishes.** The stopping-point section is a response and not
a solution. If the delayed transfer tests in PEDAGOGY section 8 ever get run, the first thing to
measure is not whether instruments beat static text but where readers stop, and whether the
ordering put the right thing before that point.

---

## Reconciling with `app/curriculum.js`

The shipped list has eighteen entries. This spine has sixteen, and five of the moves are
substantive rather than editorial.

| Shipped | Becomes | Why |
|---|---|---|
| `01-noticing`, `02-counting` | `01-noticing` | Merged. The eye failing at about four objects is the reason counting exists, so the two halves are one argument |
| `03-measure` | `02-numbers` | Renumbered |
| `04-piles` | `03-pile` | Renumbered. Summary statistics removed from it entirely, so the unit is shape only |
| `07-chance` | `04-reroll` | **Moved up three, ahead of all summarising.** Rebuilt around the generator and the seeded world. Section (a) |
| `05-middle`, `06-spread` | `05-pocket` | **Merged.** A centre taught apart from a spread teaches that a centre can stand alone. Section (c) and the unit entry |
| `09-sampling` | `06-sampling` | Moved up. Now carries the counterfactual. Section (b) |
| `10-wobble` | `07-wobble` | Moved up three. The notation gate |
| `08-bell` | `08-ruler` | **Held in place numerically but rebuilt.** No longer a shape-of-data unit; it is the device that turns a distance into a probability, and it explains unit 7 rather than preceding it |
| `11-range` | `09-range` | Renumbered |
| (part of `07-chance`) | `10-evidence` | **Split out and moved down four.** Conditional probability now sits against testing, because the prosecutor's fallacy and the p-value error are one error. Section (a) |
| `12-trial` | `11-trial` | Rebuilt around the shuffle, with t as a shortcut that agrees |
| `13-together` | `12-together` | Renumbered |
| `15-cause` | `13-third` | Moved ahead of regression. Section (b). Collider added |
| `14-line`, `17-models` | `14-line` | Merged. A line is the reader's first model |
| `16-designed` | `15-designed` | Renumbered. Now the final technical unit |
| `18-rhetoric` | `16-rhetoric` | Unchanged in role |

`app/curriculum.js` is not regenerated in this changeset, on purpose. Every field name here
matches the shipped ones (`id`, `no`, `part`, `status`, `minutes`, `title`, `question`,
`installs`, `lies`), so regeneration is mechanical once a spine is chosen, and `app/views/map.js`
needs no edit either way. Taking the data file without the argument is the drift both files exist
to prevent, so whoever picks a spine should write both in one commit.

Two part titles change: part II becomes "What a crowd looks like" because chance now sits inside
it, and part III becomes "From a few to the many" because chance no longer does.

---

## Sources this ordering leans on

Named so a contributor can go and disagree with them. Nothing here has been re-derived, and any
claim that reaches a reader's screen gets checked against the original first, which is the
standard PEDAGOGY section 8 already sets.

- George Cobb, "The Introductory Statistics Course: A Ptolemaic Curriculum?", *Technology
  Innovations in Statistics Education*, 2007. The case for simulation-first inference, and the
  reason unit 11 is a shuffle before it is a formula.
- Nathan Tintle and colleagues, randomisation-based introductory curricula and their assessment,
  *Journal of Statistics Education* and after, 2011 onwards.
- Gerd Gigerenzer and Ulrich Hoffrage, "How to Improve Bayesian Reasoning Without Instruction:
  Frequency Formats", *Psychological Review*, 1995. The whole architecture of unit 10.
- Amos Tversky and Daniel Kahneman, "Belief in the Law of Small Numbers", *Psychological
  Bulletin*, 1971. Unit 4's streak reader and unit 6. Tversky is first author, which half the
  internet gets wrong.
- Frank Anscombe, "Graphs in Statistical Analysis", *The American Statistician*, 1973. Unit 12.
- Peter Bickel, Eugene Hammel and J. William O'Connell, "Sex Bias in Graduate Admissions: Data
  from Berkeley", *Science*, 1975. Unit 13.
- Francis Galton, "Regression Towards Mediocrity in Hereditary Stature", *Journal of the
  Anthropological Institute*, 1886. Unit 14, and the quincunx in unit 8.
- David Card and Alan Krueger, "Minimum Wages and Employment: A Case Study of the Fast-Food
  Industry in New Jersey and Pennsylvania", *American Economic Review*, 1994. Unit 15.
- John Snow, *On the Mode of Communication of Cholera*, second edition, 1855. Unit 15.
- Ronald Fisher, *The Design of Experiments*, 1935. Unit 15.
- Joseph Simmons, Leif Nelson and Uri Simonsohn, "False-Positive Psychology", *Psychological
  Science*, 2011. Unit 11's forking path.
- Andrew Gelman and Eric Loken, "The Statistical Crisis in Science", *American Scientist*, 2014.
  Unit 11, and the reason unit 4's distortion is framed as an honest mistake.
- Ronald Wasserstein and Nicole Lazar, "The ASA's Statement on p-Values: Context, Process, and
  Purpose", *The American Statistician*, 2016. Unit 11.
- George Box, "Science and Statistics", *Journal of the American Statistical Association*, 1976.
  Unit 14.
- Richard Doll and Austin Bradford Hill, "Smoking and Carcinoma of the Lung", *British Medical
  Journal*, 1950. Unit 13, and the target of the tobacco industry's version of the same argument.
- Abraham Wald's memoranda on aircraft survivability, Statistical Research Group, 1943. Unit 6.
