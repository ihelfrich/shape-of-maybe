# Curriculum

The ordered spine of the course: sixteen units, 336 minutes of reading and playing, absolute
zero to a reader who can take apart a published causal claim and say exactly where it fails.

This document is an argument, not an inventory. The order is the design. Anyone can list the
topics in an introductory statistics course, and almost every such list is the same list. What
separates a course that works from one that does not is which idea arrives before which, and
what the reader is already holding when it does. So each unit here carries its one question,
the intuition it installs, the notation it earns, the misconception it kills, the instruments
it needs, and its truths-and-lies thread. Four ordering decisions are argued at length before
the units, because those four are where this spine departs from the standard one.

Companion documents: [PEDAGOGY.md](PEDAGOGY.md) governs the screens, [VOICE.md](VOICE.md)
governs the words. `app/curriculum.js` is this file as data, and the site's map is built from
it. If the two disagree, this file is the argument and that file is the deployment, and the
fix is to change both in the same commit.

---

## The spine

| # | id | Title | The one question | Min | Depends on |
|---|---|---|---|---|---|
| 1 | `01-noticing` | Bigger, smaller, how sure | How do I know one pile is bigger than another, and how sure am I? | 20 | nothing |
| 2 | `02-numbers` | What a number leaves out | How do I put a number on something real, and what does the number cost? | 18 | 1 |
| 3 | `03-pile` | The pile | What does a whole group of numbers look like at once? | 18 | 2 |
| 4 | `04-middle` | The middle | Where does this crowd sit? | 16 | 3 |
| 5 | `05-spread` | The spread | Is this crowd tight or loose, and why does that matter more than the middle? | 20 | 4 |
| 6 | `06-chance` | The machinery of chance | What does "likely" actually mean, and can I work one out? | 22 | 3, 5 |
| 7 | `07-sampling` | A few, for many | How can 1,000 people tell you about 300 million? | 20 | 4, 5, 6 |
| 8 | `08-wobble` | The wobble | If I did this study again, how different would the answer be? | 24 | 7 |
| 9 | `09-bell` | Why this shape keeps coming back | Why does the same curve turn up everywhere, and when does it not? | 22 | 8 |
| 10 | `10-range` | The honest range | What is the widest claim I am entitled to make? | 20 | 8, 9 |
| 11 | `11-trial` | Putting a claim on trial | Is this gap real, or could luck have done it? | 24 | 10, 6 |
| 12 | `12-together` | Two things at once | When one thing moves, does the other? | 20 | 5, 3 |
| 13 | `13-third` | The third thing | How do I tell a cause from a coincidence? | 22 | 12 |
| 14 | `14-line` | The line, and what a model is | Can one line stand in for a cloud, and how would I know when it stops working? | 26 | 13, 10 |
| 15 | `15-designed` | Designed comparisons | How do you build a study that can actually settle a causal question? | 24 | 13, 11, 14 |
| 16 | `16-rhetoric` | Telling the truth with numbers | How do I say something true, clearly, without misleading anyone, including myself? | 20 | all |

Six parts, used as the `unit` field on each lesson module and as the grouping on the map:

- **I. Before the symbols** (1, 2)
- **II. The shape of a group** (3, 4, 5)
- **III. Chance, and the sample** (6, 7, 8, 9)
- **IV. What you are entitled to say** (10, 11)
- **V. Two things, and why** (12, 13, 14, 15)
- **VI. Saying it out loud** (16)

### The stopping-point hedge

336 minutes of screen time is longer than most people finish. I have no data on where
readers stop, and neither does anyone else who is being honest about it, so the ordering is
arranged to be robust to the reader quitting.

A reader who stops after unit 5 can read a distribution and knows that a centre without a
spread is half a claim. A reader who stops after unit 8 has the single most valuable idea in
statistics, which is that an estimate has a wobble and the wobble is calculable. A reader who
stops after unit 11 can evaluate almost every number in a newspaper. This is why the wobble is
eighth rather than tenth, which is where the shipped list had it and roughly where a
conventional syllabus puts it: the standard ordering back-loads the payoff, and the payoff is
the reason to be here. If the course has to be cut in half, it gets cut after unit 8 and the
second half ships as a sequel, and that is a survivable outcome rather than a broken one.

---

## Four arguments about order

### (a) Probability comes sixth, and it arrives as an answer rather than a foundation

The mathematician's order puts probability first: sample spaces, axioms, random variables,
named distributions, and then statistics as an application of the machinery. Kolmogorov before
Tukey. That order is logically clean, and it is how the subject sits in the mind of someone who
already knows it. It also asks people to spend six weeks on machinery whose purpose has not yet
been demonstrated to them, and that is where I think most of the quitting happens. I have no
dropout data to put behind that sentence and neither, as far as I can find, does anyone else.
Cobb makes the same charge from the same position, which is argument rather than evidence.

Here is the counter-argument at full strength, because it is a real one. You cannot define a
sampling distribution, a standard error or a p-value without probability. Probability is
therefore a genuine prerequisite for inference, and a course that defers it is storing up a
debt it will have to pay with interest.

All true, and it settles less than it appears to. Probability is a prerequisite for inference.
It is not a prerequisite for description, and nothing in units 1 to 5 touches it. The
probability that units 8 to 11 actually consume is also not measure theory and not
combinatorics. It is "if I repeat this many times, what proportion of the time", which is
exactly the object a seeded generator and a canvas can build in front of a person in about
four seconds.

The second argument is the one I would defend hardest. Probability introduced as a topic is
inert, and probability introduced as an answer sticks. Unit 1 ends with a reader saying one row
sits further right and being unsure. Unit 3 shows them a shape that would have come out
different with different data. By the end of unit 5 they have compared two groups and felt the
question "could that gap have been an accident" without having any word for it. Unit 6 opens on
that exact question. The content is identical under either ordering. What differs is whether
the reader arrives wanting it, and wanting it is most of the battle with an adult who has
already decided once that this subject was not for them.

The third argument is George Cobb's, from "The Introductory Statistics Course: A Ptolemaic
Curriculum?" (*Technology Innovations in Statistics Education*, 2007). Cobb's claim is that the
conventional curriculum is organised around the normal distribution because in 1920 the normal
approximation was the only computationally feasible route to an answer. The epicycles it now
requires (z, t, chi-square and ANOVA taught as four separate rituals with four separate lookup
tables) exist to serve a constraint that stopped binding decades ago. Given a computer, you can
simulate the null world directly, and the logic of inference becomes visible instead of being
sealed inside a formula. This site has a computer, a seeded generator, and a canvas.
Cobb's argument applies to it with unusual directness, and Nathan Tintle and colleagues have
since run comparisons of randomisation-based introductory curricula against conventional ones
with encouraging results, published in the *Journal of Statistics Education* and elsewhere from
2011 onwards.

That has a sharp consequence, and it is where this spine departs most visibly from the shipped
list in `app/curriculum.js` and from nearly every textbook: **the normal distribution is
demoted from prerequisite to explanation.** It arrives ninth, after unit 8 has already built a
sampling distribution by brute simulation and that distribution has already come out
bell-shaped without anyone requesting it. The reader meets the bell as the answer to "why did
that keep happening", which is a much better question than "here is a curve, learn its
properties, the reason will be along in three weeks".

The cost, stated plainly: a reader who goes on to a conventional course will meet the normal
distribution in week two and will have to reindex. That cost is real and I accept it. The cost
of the other ordering is the one this whole project exists to address.

### (b) Cause enters in unit 1 as a question and waits until unit 13 for a method

Neither early nor late. The causal *question* is present from the first screen and the causal
*technique* cannot arrive before unit 13, and treating those as the same decision is what makes
this question feel harder than it is.

Nobody has ever collected data because they wanted to know the mean. Every dataset that exists
was gathered because someone wanted to know whether a thing works, or who is being harmed, or
what would happen if. If causal reasoning first appears in unit 13, then units 1 through 12 are
answering a question no reader asked. Worse, the reader will supply the causal interpretation
anyway. They will do it silently, on the first scatterplot they see, with no equipment for it,
because that is what human beings do with a gap between two groups.

So the causal question is installed in unit 1 in its crudest form, and it is installed as the
reader's own. When they say the top row sits further right, the screen asks a second question:
why do you think that is? The answer is stored locally and nothing is done with it. No lesson
is drawn, no warning is issued, and the phrase "correlation is not causation" does not appear,
because a warning issued to a reader with no tools produces helplessness rather than caution.
The answer sits in a ledger for twelve units.

The technique cannot come early, and the reason is structural rather than a matter of taste.
The counterfactual question ("what would have happened to these same units without it") is
empty until the reader can hold the idea of a distribution of possible outcomes, which is unit
8. Confounding cannot be shown without the ability to read a scatter and compare groups, which
is unit 12. Unit 13 depends on unit 12 depends on unit 5, and there is no shortcut through that
chain that does not involve asking the reader to take something on trust.

What I reject is the standard placement, which is a paragraph of "correlation is not causation"
stapled to the end of the correlation chapter and a causal-inference chapter at the back of the
book that most courses never reach. **Unit 13 sits before regression, not after.** That is the
single ordering claim in this document I would defend hardest.

The reason: a slope is the most common vehicle in the world for an unearned causal claim. It
has units, it has a direction, it can be read aloud as a sentence about the world ("each extra
year of schooling is worth eight hundred pounds"), and it sounds like a mechanism. A reader who
meets least squares before they meet the counterfactual will read that slope as an effect,
because nothing in their equipment says otherwise. Teaching confounding first means the first
line the reader ever fits arrives already carrying its own interrogation, and "compared to
what" is a question they ask before the line is drawn rather than a caveat they are handed
afterwards.

The cost of this ordering is a genuine constraint on the instruments. Unit 13 has to
demonstrate confounding without a fitted line, so Simpson's reversal is shown with group clouds
and a real contingency table rather than with group regression lines. I think it survives that
easily. The Berkeley admissions table, which is the best confounding example in the literature,
needs no lines at all.

### (c) Notation becomes unavoidable at the standard deviation

Six gates, and the one that matters is unit 5.

Before that gate the load is carried by four things, and it is worth naming them because
"delay the notation" is otherwise an instruction to teach nothing. The picture carries it,
drawn in data space, honest about its axes. The physical operation carries it, because dragging
a fulcrum until a beam balances is a computation performed with a hand. The table carries it,
which is notation nobody has ever been frightened of. And named quantities in English carry
most of it: "the middle", "the typical distance from the middle", "how many there are".

The gates, in order:

**1. Digits and place value (unit 1).** This is already notation and nobody flinches at it,
which is worth saying out loud to a reader who has decided they cannot handle symbols. They
handle a positional numeral system, fluently, several times a day.

**2. Units and rates (unit 2).** "41 per 100,000 per year" is notation, and it is the rare
piece that makes a number less ambiguous rather than more. Introduced as a habit: a bare number
is incomplete.

**3. Names for quantities, x̄ (unit 4).** A name, not an instruction. The bar means "the average
of the thing underneath it". The reader has already located that value by balancing a beam, so
the symbol names something they are holding rather than something they must go and fetch. n
arrives one unit earlier, in unit 3, where it is the only symbol on the screen and it means the
count of things in the pile.

**4. Instructions over an index, Σ and xᵢ (unit 5).** The real gate. The standard deviation is
the first quantity in the course whose definition is a *procedure* rather than a value. A
procedure applied to every one of n things needs a way to say "each thing" and a way to say
"add these up". This is the exact point where an English sentence becomes worse than the
symbol, and that is the only honest reason to introduce any notation at all. Before unit 5,
English wins. From unit 5, Σ wins, and the reader can feel which is which because they have
just tried both on the same quantity.

Two practical notes on this gate. The subscript is harder than the bar and it is a separate
idea: indexing means referring to a *position* rather than to a value, and readers who are
comfortable with x̄ stall on xᵢ routinely. PEDAGOGY budgets a paragraph for it and a paragraph
is right. Second, Σ is introduced as an imperative verb rather than as a noun. Reading it out
loud as "add up all the" fixes more confusion than any diagram of it will.

**5. Greek, μ and σ (unit 7).** Held back deliberately, and this is the piece of the sequencing
I like best. The alphabet changes for exactly one reason: there are now two different objects in
the room, the truth you do not have and the measurement you do. Introducing μ in unit 4
alongside x̄, which is what most textbooks do, spends the one moment where the change of
alphabet would have taught something, and leaves the reader believing that Greek letters are a
stylistic preference of statisticians. Unit 7 is the screen where the reader has watched a
sample mean land in three different places from the same population. That is when the alphabet
should change, and it changes with the sentence "there are two different things here and they
need two different names".

**6. Hats and functions, ŷ and ε (unit 14).** Prediction requires distinguishing what the model
said from what happened, and the residual is the gap between them. The hat and the residual are
introduced in the same breath because neither means anything alone.

One rule underneath all six, taken from VOICE.md and restated here because it is what makes the
gates work rather than merely delaying pain: once a symbol is earned, it is used. Retreating to
"the average" for the rest of the unit out of kindness tells the reader the notation was a
hurdle they cleared rather than a tool they now own.

### (d) The first beautiful moment is unit 3, and it is a list turning into a body

The instrument: a column of raw numbers scrolls past, the way data actually looks the first
time you open a file, and it is deliberately a little unpleasant to look at. The reader presses
one button. The numbers fall, stack up by value, and settle into a distribution with a peak, a
long tail to the right and a hard floor at zero.

Why this one, and why there.

Beauty needs a violated expectation, and unit 1 has not built one. A reader in unit 1 has no
idea what data is supposed to look like, so nothing about it can surprise them. By unit 3 they
have spent two units treating numbers as individual facts, one at a time, each with its unit
and its denominator. The pile is the first moment where a group of numbers turns out to have a
property that no number in it possesses. That is emergence, it is the actual reason
distributions are worth studying at all, and it lands in about a second and a half of
animation.

It is also the cheapest beautiful moment in the course to build, which counts for something
when every pixel is hand-written canvas. It needs `stage.dots`, `stage.bars`, and one tween.

The alternatives, and why they lose. The Galton board is more beautiful and it is unit 9,
because a reader who meets the bell before they have felt variability reads it as decoration
rather than as an explanation, and the board is worth too much to spend that way. The balance
point in unit 4 is the first beautiful *theorem* in the course, because the signed distances
from the mean sum to exactly zero and the reader locates that point by tipping a beam until it
stops tipping. It loses on a narrower ground: it is a fact about a definition rather than a
fact about the world. The sampling
distribution assembling itself in unit 8 is the most important animation in the course and it
cannot be first, because it is made out of everything before it.

The full ladder, because the schedule matters more than any single choice on it:

| Unit | The moment | What makes it beautiful |
|---|---|---|
| 3 | The fall | A group has a property that no member of it has |
| 4 | The fulcrum | The distances balance exactly, and you find the point by feel |
| 6 | The long run | The proportion settles while the raw count runs away |
| 8 | The stack | An estimate turns out to have a distribution of its own |
| 9 | The board | Any nudge with a finite spread, added often enough, gives the same curve |
| 14 | The squares | The total area falls to a minimum and then stops |
| 15 | The balancer | Randomising balances a variable nobody measured, on average |

One per unit at most, each paid for by an idea, none of them decorative. PEDAGOGY section 6
sets the beauty budget at typography, whitespace and one honest animation per unit. This table
is what that budget buys.

---

## The units

### 1. Bigger, smaller, how sure

**The one question.** How do I know one pile is bigger than another, and how sure am I?

**Installs.** You can see "more" without counting, up to about four things. Past that the eye
gives up, and the place where it gives up is the reason counting was invented. Comparison by
eye is already estimation. The feeling of "I am not sure" is a standard error before it is a
number, and it deserves to be treated as data rather than as a weakness.

**Notation earned.** Tally marks, grouping into fives, then digits and place value, framed as
the original compression technology. No algebra, no letters standing for numbers, nothing that
looks like school.

**Misconception killed.** "Maths starts when the numbers appear, and I was never any good at
that part." By the end of the unit the reader has made three mathematical moves (comparing,
estimating, and hedging) before a single symbol was on the screen, and the text says so in the
past tense.

**Instruments.**
- *The two rows.* Two rows of scattered dots on a shared axis. The reader says which row sits
  further right, commits a confidence on a three-way control, and then the truth is revealed.
  Overlap is tuned across rounds so that the reader is right when they were confident and wrong
  when they were not. That is a calibration experience, and most people have never had one.
- *The glance.* Dots flash for 400 ms. At four, everyone is exact. At seven, nobody is. The
  failure point is the punchline.
- *The tally bench.* Count 63 objects three ways, one at a time, in fives, in tens, with the
  clock running on each. Place value falls out as the answer to "how do I stop losing my place".
- *The axis lever.* The distortion, below.

**Truths and lies.** The same true gap, drawn on a cropped axis, reads as a crisis. The reader
drags the axis floor from 0 up to 94 and back down, and no number changes at any point.

**Time.** 20 min. **Depends on.** Nothing. This is the door.

**Note on the ledger.** When the reader says which row is bigger, a second prompt asks why they
think that is, and stores the answer in `localStorage`. Nothing is taught and nothing is
scored. It is reopened in unit 13, where the point is that the causal instinct arrived first,
unprompted, twelve units before any equipment for it, and that the evidence for this is the
reader's own sentence rather than our assertion.

### 2. What a number leaves out

**The one question.** How do I put a number on something real, and what does the number cost?

**Installs.** Units, scale, and precision against accuracy. Four kinds of number and what
arithmetic is legal on each: a label, an order, an interval, an amount. The "per what" question
attached to every rate. The habit of asking what was thrown away when the world was compressed
into a figure.

**Notation earned.** Units written next to every number, and the "per" construction. 3.2 kg.
41 per 100,000 per year. A bare number is incomplete, and this is the unit where that becomes
a reflex.

**Misconception killed.** "A number is a fact." A number is a fact plus a decision about what
counts, plus a choice of unit, plus an instrument with a finite resolution. A second, quieter
one goes with it: more decimal places do not mean more accuracy.

**Instruments.**
- *The denominator switch.* One dataset of country totals with a toggle: total, per person, per
  unit of GDP, per year. The ranking reorders on every switch and every ordering is true.
- *What counts as a tree.* A picture containing ambiguous objects. The reader sets the counting
  rule (a height threshold, a trunk count) and the answer changes. The rule is the finding.
- *The ruler.* A measuring instrument with an adjustable resolution. Spurious digits appear as
  the reader turns it up, and repeated measurements of the same object begin to disagree.

**Truths and lies.** Change the denominator, change the villain. "Country A emits more than
Country B" and "Country B emits more than Country A" are both true statements about the same
year, one per country and one per person, and the reader performs the switch that flips them.

**Time.** 18 min. **Depends on.** 1.

### 3. The pile

**The one question.** What does a whole group of numbers look like at once?

**Installs.** You cannot hold 500 numbers in your head, so you either summarise them or draw
them, and drawing first is the better habit because a summary computed before the picture is a
summary of something you never looked at. A distribution is a picture of a crowd. Shape words
arrive before any statistic: a bump, a tail, a gap, two peaks, a floor, a ceiling. The dotplot
comes first and the histogram is introduced as a dotplot with the dots stacked into bins.

**Notation earned.** n. That is the whole list, on purpose. The argument of this unit is that
shape is something you read before you compute anything.

**Misconception killed.** "The average is the data." Alongside it: "a histogram is a bar
chart". Bars are for categories and bins are for amounts, and the gap between bars means
something different from the absence of one.

**Instruments.**
- *The fall.* A column of 500 raw numbers scrolls past, then drops and stacks into a shape on
  one button press. The first beautiful moment in the course, argued in section (d).
- *The bin dial.* One dataset, bin width from very fine to very coarse. At one setting there
  are two peaks and at the next there is one. Same data throughout.
- *Match the shape.* Four histograms and four labels: adult heights, household income, the sum
  of two dice, age at death in a rich country. The reader matches them and then reads why each
  shape is the shape it is. Income skews right because there is a floor at zero and no ceiling.
  Age at death skews left for exactly the opposite reason.

**Truths and lies.** Bin width is a dial and somebody is always turning it. The reader makes a
second peak vanish without deleting a single observation, then puts it back.

**Time.** 18 min. **Depends on.** 2.

### 4. The middle

**The one question.** Where does this crowd sit?

**Installs.** Three honest answers to three different questions: the balance point, the middle
one, and the most common one. The mean as the place where the beam stops tipping. Why the mean
chases an outlier across the room and the median moves by one place in a queue.

**Notation earned.** x̄, standing next to the n the reader picked up in unit 3. Names for
quantities, not instructions. Gate 3 in section (c).

**Misconception killed.** "Average means typical." The mean of a right-skewed distribution is
routinely a value that almost nobody in the data actually has.

**Instruments.**
- *The fulcrum.* Dots on a number line resting on a beam. The reader drags the pivot until the
  beam balances, and a readout shows the total distance above the pivot and the total below.
  They come out equal at exactly one point, which is the mean. Σ(xᵢ − x̄) = 0 arrives as
  something the reader balanced rather than something they were told.
- *One more guest.* Thirty teachers on £38,000 and a slider that walks one further income from
  £38,000 up to £100 million, with the mean and the median tracked live. The mean leaves the
  building.
- *Which would you quote.* Four contexts (a pay negotiation, a hospital waiting list, a house
  price report, a class test) and a choice between mean and median in each, with the reasoning
  written for both options.

**Truths and lies.** Average income against typical income, performed by the reader on a real
income distribution. Both figures are correct, they sit thousands of pounds apart, and either
one is available to whoever is writing the headline.

**Time.** 16 min. **Depends on.** 3.

### 5. The spread

**The one question.** Is this crowd tight or loose, and why does that matter more than the
middle?

**Installs.** The range as the crude answer, and why it is fragile: it depends on exactly two
observations, and they are the two most likely to be flukes. Quartiles and the interquartile
range. The standard deviation as the typical distance from the middle. Variance, and why nobody
quotes it out loud.

**Notation earned.** Σ, xᵢ, s and s². This is the gate, and section (c) argues at length why it
falls here and not sooner.

**Misconception killed.** "The standard deviation is a hard formula I never understood." It is
four instructions, each of which the reader has already carried out with a mouse: take each
value's distance from the middle, square them so that below and above both count, average those
(divide by one less than n, and the depth block says why), then take the square root to get back
into the units you started in.

**Instruments.**
- *Which bus.* Two routes with the same mean journey time of 24 minutes and different spreads.
  The reader picks one to catch a flight, then watches 200 simulated journeys on both. The
  spread decides, and the mean was silent about it.
- *The ruler that grows.* A bracket that grows outward from the mean in both directions. The
  reader drags it until roughly two thirds of the dots are inside. The distance from the mean to
  either end of that bracket is s, discovered rather than issued, and it plants the 68% landmark
  four units before unit 9 names it. The instrument runs on a roughly symmetric dataset and says
  so, because two thirds inside one s of the mean is a fact about bell-shaped data rather than a
  fact about all data. The second dataset in this instrument is skewed, the two-thirds rule
  misses, and s is still the typical distance from the middle.
- *Four steps on five numbers.* 4, 8, 9, 11, 13, with every step drawn as well as written, and
  the arithmetic small enough to check on paper: the mean is 9, the squared distances are 25, 1,
  0, 4 and 16, those add to 46, dividing by 4 gives s² = 11.5, and the square root gives
  s = 3.39. Then the identical four steps on all 4,912 rows of the unit's dataset, at which
  point the symbols have earned themselves in front of the reader.
- Depth blocks: *why squares rather than absolute distances*, and *where the n − 1 comes from*,
  the latter shown by simulation rather than derived. Divide by n across 10,000 simulated
  samples and watch the estimate sit consistently low.

**Truths and lies.** A centre quoted with no spread. "Average wait, 8 minutes", in a queue
where half of callers wait under 3 minutes and one in ten waits over 40. The reader is given
the mean, asked to predict their own wait, and then shown the distribution they were drawn
from.

**Time.** 20 min. **Depends on.** 4.

### 6. The machinery of chance

**The one question.** What does "likely" actually mean, and can I work one out?

**Installs.** Probability as the proportion in the long run, built by repetition rather than
asserted by definition. The sample space as a list of equally likely things you can count.
Independence, and what it means for two events to fail to have it. Conditional probability as a
count within a count.

**Notation earned.** P(A), P(A and B), P(A | B). The vertical bar is read aloud as "given
that", and every conditional is computed by counting people in a table before it is ever
computed by dividing one probability by another.

**Misconception killed.** Two, and they are twins. The gambler's fallacy, where the coin is
"due". And the law of small numbers, Tversky and Kahneman's 1971 name for our expectation that
a small sample ought to look like the population it came from. One instrument kills both.

**Instruments.**
- *The long run.* Ten thousand flips in world 42, with two traces drawn together. The running
  proportion of heads settles onto 0.5. The running excess of heads over tails, as a raw count,
  does not settle and wanders further from zero as the flips accumulate. The proportion
  converges while the count diverges, and that single picture is the entire content of the
  gambler's fallacy.
- *A thousand people.* The medical test problem drawn as 1,000 dots. A condition affecting 10 in
  1,000, a test that catches 9 of those 10 and falsely flags 99 of the healthy 990. The reader
  clicks the flagged group and counts: roughly one in twelve of them has it. Bayes' theorem
  waits in a depth block for anyone who wants the algebra afterwards.
- *Rare things, many chances.* A wall of 10,000 events, each with a one-in-ten-thousand chance.
  At least one of them lands on about 63 runs in 100, which the reader establishes by holding
  the button down rather than by being told. The birthday problem is the same instrument with 23
  people, where a shared birthday turns up just over half the time.

**Truths and lies.** The prosecutor's fallacy, and the case it is best known by in Britain.
Sally Clark was convicted in 1999 of murdering two of her sons after the paediatrician Roy
Meadow told the court that the chance of two cot deaths in one family was 1 in 73 million. That
figure came from squaring a single-death rate, which assumes the two deaths were independent of
each other, and it was then presented to a jury as though it were the probability that she was
innocent. The Royal Statistical Society issued a public statement in 2001 saying the
calculation had no statistical basis, and the conviction was quashed in 2003. The reader
operates both errors in one instrument: multiply two dependent probabilities as if they were
independent, then flip a conditional round, and watch the number move by orders of magnitude.

**Time.** 22 min. **Depends on.** 3, and loosely 5. Placement argued in section (a).

### 7. A few, for many

**The one question.** How can 1,000 people tell you about 300 million?

**Installs.** The population as the thing you want and the sample as the thing you have. Random
selection as the mechanism that earns the leap between them, rather than as a formality.
The sampling frame, and the people it never contained. Non-response as a second and much
quieter selection. Representativeness beating size.

**Notation earned.** μ and σ against x̄ and s. Gate 5, and the payoff for holding Greek back
through six units.

**Misconception killed.** "A bigger sample is a better sample." The instrument makes a large
biased sample look better and be worse at the same moment, which is the shape the real failure
takes.

**Instruments.**
- *The jar.* Ten thousand dots as a population with a visible true mean. Draw a sample of n,
  watch the sample mean land. Draw again, and again. The estimate moves, and the reader is
  looking straight at the wobble one unit before it is named.
- *The magnet.* A biased sampler with a strength dial. Side by side: n = 2,000 with the magnet
  on, and n = 100 with it off. The biased estimate is tighter and wrong, the fair estimate is
  looser and centred on the truth, and precision and accuracy come apart on one screen.
- *1936.* The *Literary Digest* mailed about ten million ballots, got about 2.4 million back,
  and predicted Landon at 57%. Roosevelt took about 61% of the vote. George Gallup called it
  correctly from a sample of roughly 50,000, which is smaller by a factor of about fifty. Every
  figure in that sentence gets checked against Squire (1988) before it goes on a screen. The
  reader runs both sampling frames against a simulated electorate.

**Truths and lies.** "Over two million people responded" offered as a defence of a survey. The
reader builds a two-million-person self-selected sample that misses by twelve points, next to a
fair sample of 800 that misses by two.

**Time.** 20 min. **Depends on.** 4, 5, 6.

### 8. The wobble

The centre of the course. Everything from unit 10 onwards is a consequence of this unit, and
if only one unit is ever finished properly, it is this one.

**The one question.** If I did this study again, how different would the answer be?

**Installs.** The estimate is itself a random thing, and it has a distribution. That
distribution is what all of inference is about. Its spread has a name, the standard error. The
square-root rule, watched rather than derived.

**Notation earned.** SE, and s/√n. Also the distinction that most people who have passed a
statistics course still cannot state on demand: the standard deviation describes the spread of
the data, and the standard error describes the spread of an estimate. On this screen they are
two different pictures on two different axes, and the reader builds the second one out of the
first with their own hands.

**Misconception killed.** "My estimate is the answer." Its sibling goes with it: the belief that
the standard error is a property of the data rather than a property of the procedure that
produced the estimate.

**Instruments.**
- *The stack.* The main event. Top half of the canvas: the population, and one sample drawn
  from it. Bottom half: a second axis where each sample's mean drops as a single dot. Draw one.
  Draw ten. Hold the button down and watch a thousand estimates pile up into a shape. The
  population's shape is settable, and it can be made aggressively non-bell-shaped, and the pile
  of means still comes out bell-shaped. Unit 9's question arrives on its own, from the reader,
  which is the whole design.
- *The √n lever.* Sample size 10, then 40, then 160. The pile halves in width each time the
  sample size quadruples. The reader is asked to predict the width at n = 640 before it is
  drawn.
- *How many polls miss.* Two hundred simulated polls of 1,000 people in a world where true
  support is 47%, drawn as a histogram of 200 honest headlines. About six of them cross 50% and
  read as a lead for the other side. Nobody did anything wrong in any of them.

**Truths and lies.** A number quoted with no wobble attached. Then the version that is much
harder to spot: hospital league tables and school rankings, where the top and the bottom are
populated by the smallest units because small units wobble most. The reader ranks 100 simulated
hospitals that are identical by construction, and the resulting table looks meaningful, and
they can read a plausible newspaper story off it.

**Time.** 24 min. **Depends on.** 7.

**Note on worlds.** This unit and the shuffle in unit 11 are where the seeded generator stops
being a convenience and becomes the pedagogy. A teacher saying "everyone type world 42" and
getting the same thousand-estimate pile on thirty screens at once is the reason `rng.js` is
written the way it is, and the reason the seed is in the URL.

### 9. Why this shape keeps coming back

**The one question.** Why does the same curve turn up everywhere, and when does it not?

**Installs.** Many small independent contributions, added together, give the same shape
regardless of what the individual contributions look like, so long as each of them has a finite
spread. The 68 / 95 / 99.7 landmarks as facts about that shape. The z-score as "how many
spreads from the middle", which is what makes two different measurements comparable. And the
boundary, which matters more than the theorem does.

**Notation earned.** z = (x − μ)/σ, and N(μ, σ²) as the name of a family rather than as a
hurdle.

**Misconception killed.** "Everything is normally distributed." The reader breaks it themselves,
which is the only way it stays broken.

**Instruments.**
- *The board.* A Galton board. Balls fall through a lattice of pegs, each peg a coin flip, and
  the pile at the bottom is a bell every time. The biggest single beautiful moment in the
  course, placed ninth on purpose.
- *The nudge shop.* Choose the shape of one contribution (uniform, heavily skewed, two-humped)
  and how many to add (1, 2, 5, 30). Each of these has a finite spread, and the sum goes
  bell-shaped in all three cases, but the number of nudges it takes differs a lot between them.
  The skewed contribution takes considerably longer than the uniform one, which is the honest
  version of "n large enough".
- *The tail that does not close.* The same simulation with one change: contributions drawn from
  a Cauchy, which is what you get from the horizontal position of a spinner pointing at a wall.
  It has no mean to converge to and no finite spread, so the running average never settles and
  the sum never goes bell-shaped however many nudges get added. This is the boundary of the
  theorem, drawn rather than stated. A reader who watched the long run converge in unit 6 finds
  it genuinely unsettling, which is the intended effect.

**Truths and lies.** Assuming a bell where the world has a long tail. Financial risk models,
flood return periods, and the remark a bank's chief financial officer made to the *Financial
Times* in August 2007 about seeing twenty-five-standard-deviation moves several days in a row.
Under a bell that is an event with no expected occurrence in the history of the universe. Under
a heavy tail it is a Tuesday. The reader prices the same risk under both assumptions and reads
off the two numbers.

**Time.** 22 min. **Depends on.** 8.

### 10. The honest range

**The one question.** What is the widest claim I am entitled to make?

**Installs.** An interval is the estimate plus and minus a couple of wobbles. The 95% is a
property of the method and not of the interval in front of you. The bootstrap as a way of
getting an interval with no formula at all. t against z as the correction for not knowing σ,
which is what "small sample" actually means.

**Notation earned.** x̄ ± t* · s/√n, parsed piece by piece, with the margin of error named as
the whole of the ± part.

**Misconception killed.** "There is a 95% chance the true value is in this interval." This is
the most durable error in applied statistics and prose has never once killed it. The instrument
does, because the instrument can show the truth and prose cannot.

**Instruments.**
- *A hundred intervals.* The true value is drawn as a line, which is possible here because this
  is a simulation and we built the world. One hundred samples, one hundred intervals, stacked
  vertically, with the misses marked. About five miss. The reader is then asked which of the
  individual intervals has a 95% chance of containing the truth, and the answer is none of
  them, because the truth never moved and each interval either caught it or did not.
- *The bootstrap.* One sample of 40, resampled with replacement 2,000 times, the 2,000 means
  plotted, and the outer 2.5% at each end trimmed away so the middle 95% is what remains. An
  interval out of nothing but the data and a resample, reproducible because the world number is
  in the URL.
- *Two intervals.* Two overlapping intervals and the question of whether the difference between
  them is real, which is a different calculation, and the reader is shown that it is. This
  plants unit 11.

**Truths and lies.** Point estimate in the headline, interval in the footnote. Then the more
interesting one: two overlapping intervals reported as "no difference", which is wrong often
enough to be a standard failure mode in science journalism.

**Time.** 20 min. **Depends on.** 8, 9.

### 11. Putting a claim on trial

**The one question.** Is this gap real, or could luck have done it?

**Installs.** The null world as something you build rather than something you invoke. Shuffling
the labels as the way you build it. The p-value as a position in a pile you made. The two ways
of being wrong. Power, as the chance of noticing a real thing when there is one.

**Notation earned.** H₀, p, α, and t, in that order, with the t arriving only after the shuffle
has already produced the answer.

**Misconception killed.** Several, and they carry the largest real-world cost of anything in
this course. That p is the probability the null hypothesis is true. That p > 0.05 means there
is no effect. That "statistically significant" means large, or means it matters.

**Instruments.**
- *The shuffler.* Two groups with a real observed gap, marked on the axis. Press shuffle: the
  group labels are reassigned at random, the two means are recomputed, and the resulting gap
  drops into a pile. Hold it down for 5,000 shuffles and the pile becomes the distribution of
  gaps that a world with no effect produces. The observed gap either sits out in the tail or
  sits inside the crowd. The p-value is the reader counting what fraction of the pile is
  further out than the gap they measured, and no formula has appeared at any point. The t
  statistic is then introduced as the algebraic shortcut that gets to nearly the same answer
  without 5,000 shuffles. Nearly, not exactly: the two agree closely here and can come apart on
  small or lopsided samples, and the instrument shows both numbers side by side rather than
  claiming they are the same thing. Fisher made the same argument for t in *The Design of
  Experiments*, which is the historical route as well as the honest one.
- *The bench.* One dataset, twenty outcome variables, and a free hand. The reader hunts for
  p < 0.05 in data with nothing in it, and finds it about two runs in three, because twenty
  independent tests at the 5% level turn up at least one hit 64% of the time. This is Simmons,
  Nelson and Simonsohn's 2011 demonstration in *Psychological Science*, made operable.
- *The file drawer.* Forty studies of one real effect, twenty of which cleared significance.
  Publish only those and the pooled estimate inflates by a factor the reader reads off the
  screen.

**Truths and lies.** This unit's distortion has the largest body count in the course, so it
gets the most room. Significant and important are different words for a reason. A p-value is
not a measure of effect size and never was. The garden of forking paths, where nobody cheated
and every individual choice was defensible and all of them were made after looking at the data,
is set out using Gelman and Loken's account in *American Scientist* (2014). The American
Statistical Association's 2016 statement on p-values is quoted directly, because it is short
and it says these things more bluntly than most textbooks are willing to.

**Time.** 24 min. **Depends on.** 10, 6.

### 12. Two things at once

**The one question.** When one thing moves, does the other?

**Installs.** The scatterplot as the second great picture in statistics. Direction, form and
strength as three separate readings taken from it. r as one number that captures direction and
strength for straight-line relationships, and nothing else.

**Notation earned.** (xᵢ, yᵢ) as a pair carrying one index, and r.

**Misconception killed.** "r = 0 means the two are unrelated", killed by a perfect parabola with
an r near zero, which is a deterministic relationship that r cannot see. And "r = 0.9 means a
big effect", which confuses how tightly the points hug the line with how steep the line is.

**Instruments.**
- *Guess the r.* A cloud appears, the reader guesses r on a dial, the answer is revealed,
  repeat. Twenty rounds produces a calibrated eye, which is a skill practitioners have and were
  never taught.
- *Anscombe.* The four datasets from Frank Anscombe's 1973 note in *The American Statistician*.
  Identical means, identical variances, identical r, identical fitted line, four completely
  different pictures. The reader sees the summary statistics first and predicts the picture.
- *The quadrant grid.* Cross-hairs at the two means. Points in the upper right and lower left
  push r up, points in the other two push it down. r stops being a formula and becomes a vote
  count.

**Truths and lies.** Anything that trends correlates with anything else that trends. The reader
picks a start year and an end year on one real pair of series and produces r values running
from strongly positive to strongly negative out of the same data.

**Time.** 20 min. **Depends on.** 5, 3.

### 13. The third thing

**The one question.** How do I tell a cause from a coincidence?

**Installs.** The counterfactual question, which is what the word "cause" actually means: what
would have happened to these same units without it. The confounder, and precisely what it does
mechanically rather than as a caution. Simpson's reversal. The collider in a depth block,
because a collider is the opposite case: it is a variable that adjusting for, or selecting on,
*creates* a false association where none existed, so the reflex of controlling for everything
available is itself a way to go wrong. Readers who have met only confounding get overconfident
about that reflex.

**Notation earned.** Arrows. X → Y, and X ← Z → Y. A causal diagram is notation, it is cheap,
and it is the correct notation for this idea. No algebra in this unit at all.

**Misconception killed.** "Correlation is not causation", taken as a slogan. The slogan is true
and it makes people helpless, because it stops at the warning and never says what a third
variable does or what it would take to rule one out. A reader who finishes this unit should be
able to name a specific confounder for a specific claim, and say what evidence would remove it.

**Instruments.**
- *The splitter.* A scatter with a clear upward trend. One button press splits the points into
  groups, and every group trends downward. Simpson's reversal in one motion. Then the real
  case: Bickel, Hammel and O'Connell's 1975 paper in *Science* on Berkeley's 1973 graduate
  admissions, where men were admitted at a higher rate overall and women at an equal or higher
  rate in most individual departments. The reader aggregates and disaggregates the actual
  table.
- *The confounder dial.* Two variables with no causal link between them and a third that drives
  both. Turn the third one's strength up and an association appears out of nothing. Turn it
  back down and watch it go.
- *The ledger.* The reader's own answer from unit 1, to "why do you think that row is bigger",
  shown back to them. For most readers it is a causal claim made on a picture of two clouds.
  Nothing is scored and nothing is corrected. The instinct arrived first, twelve units ago, and
  the evidence is in their handwriting.

**Truths and lies.** The lurking variable is the most common falsehood in public statistics and
almost nobody involved is lying. The mirror image gets equal weight, because it is the abuse a
reader of this course is most likely to commit: "correlation is not causation" deployed to
dismiss evidence that is actually good. The tobacco industry ran that argument for thirty years
against Doll and Hill's work, using the same sentence a careful reader uses correctly.

**Time.** 22 min. **Depends on.** 12. Placement argued in section (b).

### 14. The line, and what a model is

**The one question.** Can one line stand in for a cloud, and how would I know when it stops
working?

**Installs.** Least squares as the smallest total miss, discovered by dragging rather than
handed over. The slope as a rate with units you can say in a sentence. Residuals as what the
line failed to explain, and the residual plot as the place where a bad model confesses. r²
parsed honestly. Regression to the mean. The model as a deliberate simplification with stated
assumptions, which is George Box's 1976 framing and the reason the word "wrong" is not an insult
about a model. Overfitting. The difference between fitting and predicting, which is the whole of
the modern argument compressed into one slider.

**Notation earned.** ŷ = b₀ + b₁x, the hat read as "predicted", eᵢ = yᵢ − ŷᵢ as the miss, and
y = f(x) + ε where ε is the part of the world the model has agreed not to explain.

**Misconception killed.** "A model that fits the data well is a good model." Alongside it,
regression to the mean read as a treatment effect, which is a working error rather than a
textbook one. The worst-performing schools improve the following year. The accident blackspots
get quieter after the camera arrives. The second album is worse than the first. In each case a
real effect may well exist, and the measured one is inflated by the selection that picked the
units.

**Instruments.**
- *The pivoting line.* A cloud and a draggable line, with every miss drawn as a literal square
  and the total area shown as both a number and a bar. The reader hunts for the smallest total
  by hand, gets close, and then presses a button that snaps to the least-squares solution. The
  squares shrink to their minimum and the number stops falling. Least squares becomes something
  the reader was already searching for.
- *Past the edge.* Drag a prediction beyond the range of the data and watch the honest interval
  fan out. Then a second dataset where the relationship curves outside the observed range, and
  the line's extrapolation is confidently wrong.
- *Two rounds.* Two hundred units measured twice with no intervention at all. Select the worst
  20 from round one and watch them improve in round two, with a true effect of exactly zero.
  This is Galton's 1886 observation about the children of tall parents, reduced to one button.
- *The order dial.* A polynomial order slider from 1 to 15 on 25 points, with two error curves
  drawn together. Error on the points that were fitted falls forever. Error on a fresh sample
  from the same world falls and then climbs. Where the two curves cross is the whole of
  overfitting, and it requires no vocabulary to see.

**Truths and lies.** Extrapolation past the edge of the data, which is where forecasts go to
die. A model evaluated on the data it was tuned on. And the assumption nobody stated, which is
the most common way a model lies, because an unstated assumption cannot be argued with.

**Time.** 26 min. **Depends on.** 13, 10. The fan-out interval in *past the edge* needs the
honest range from unit 10. Unit 11 is needed only if the slope gets a significance test, which
I would leave out of a first course.

**Note, and it is a real one.** This unit carries exactly four instruments, which is the ceiling
PEDAGOGY section 1 sets rather than a breach of it. The problem is the 26 minutes. PEDAGOGY
budgets its six-beat loop against a fifteen-minute unit, so this one is running at nearly
double, and it is the unit most likely to split on contact with a real build. The split point is
clean: 14a ends at the residual plot, and 14b opens with the order dial and is called "when a
model stops working". I am proposing it merged because a line is the reader's first model, so
the frame is native to it. A standalone modelling unit has to re-introduce fitting from
scratch, and it tends to become the abstract philosophy lesson that nobody remembers having
done.

### 15. Designed comparisons

**The one question.** How do you build a study that can actually settle a causal question?

**Installs.** Randomised assignment as the thing that balances variables you did not measure
and did not think of, which is the most valuable single idea in applied statistics. The control
group. Blinding. Why before-and-after fails on its own. Difference-in-differences as two
subtractions where one was not enough. The natural experiment. And the honest limit, because a
randomised trial answers a narrow question about the people who were actually in it.

**Notation earned.** The two-by-two table of group means, and the difference of differences
written out in full: the after-minus-before change in the treated group, minus the
after-minus-before change in the comparison group.

**Misconception killed.** "You can only establish cause with an experiment", and its opposite,
"observational data can never establish cause". Both are wrong, both are widely held, and
plenty of people hold both on different days.

**Instruments.**
- *The balancer.* A population where every unit carries a hidden attribute the reader cannot
  see and the researcher never measured. Assign by choice and the hidden attribute ends up
  lopsided every time. Assign at random and it comes out close to balanced, and the reader holds
  the button down to see how close: mostly near even, occasionally lopsided by chance, and never
  lopsided in a consistent direction. Then the reveal: the hidden attribute is displayed.
  Randomisation balanced a variable that nobody knew existed, in expectation and without knowing
  it existed. The promise is about the long run and about the size of the groups, which is why a
  trial with twelve people in it is not protected by having been randomised. Even with that
  caveat drawn on the screen, this is the most persuasive twenty seconds in the course, and it
  is the reason unit 15 is the last technical unit rather than an appendix.
- *Two lines.* Two groups measured before and after, with a treatment applied to one, and a
  draggable counterfactual line. The reader constructs the difference-in-differences estimate by
  hand, then breaks it by tilting the pre-trend, which is what the parallel-trends assumption
  means and why it has to be shown rather than claimed. The worked case is Card and Krueger's
  1994 study of the New Jersey minimum wage in the *American Economic Review*, with
  Pennsylvania as the comparison.
- *The pump.* John Snow, London, 1854. The Broad Street map, and then the better half of the
  story that rarely gets told: households on the same streets supplied by two different water
  companies, assigned to their supplier years earlier for reasons unconnected to cholera. A
  natural experiment before the phrase existed.
- *The lady and the tea.* Fisher's 1935 tea-tasting design as the smallest complete experiment
  there is, and as the origin of the shuffle the reader already used in unit 11.

**Truths and lies.** A comparison group chosen after the outcome is known can be chosen to win.
Parallel trends assumed rather than plotted. And the one the reader is most likely to commit
themselves: the before-and-after with no control group, which credits the intervention with
everything else that happened that year.

**Time.** 24 min. **Depends on.** 13 for the counterfactual, 11 for the shuffle that the tea
tasting turns out to be, and 14 for reading a trend line off a pair of groups.

### 16. Telling the truth with numbers

**The one question.** How do I say something true, clearly, without misleading anyone, including
myself?

**Installs.** The whole toolkit turned round and pointed at claims, starting with the reader's
own. A reading checklist that fits on one screen. The practice of writing a finding with its
wobble attached rather than in a footnote. Pre-registration as a personal habit rather than a
bureaucratic one.

**Notation earned.** None. This unit is about translating notation back into English without
losing the uncertainty on the way out.

**Misconception killed.** "Misleading with statistics requires lying." Every distortion in this
course was performed with true numbers, and the reader performed all of them personally.

**Instruments.**
- *The distortion studio.* One honest dataset and a rack of levers, every one of which the
  reader has already pulled in an earlier unit: crop the axis (unit 1), switch the denominator
  (unit 2), re-bin (unit 3), quote the mean instead of the median (unit 4), drop the spread
  (unit 5), pick the window (unit 12), choose the outcome after looking (unit 11), drop the
  control group (unit 15). The reader builds the most misleading true chart they can, sees a
  list of which levers they reached for, and then writes the honest version of the same finding
  in a text box with a model answer alongside it.
- *The audit.* Six real published claims. For each one: what is the number, what is the
  denominator, what is the comparison group, what is the wobble, and what would have to be true
  for this to be causal.

**Truths and lies.** The whole unit. The closing move is the uncomfortable one, and it is aimed
at the reader rather than at the press. They are shown a misleading chart they made themselves
in an earlier unit by accepting a default, and told that this is how most misleading charts get
made.

**Time.** 20 min. **Depends on.** Everything.

---

## What is deliberately absent

**Bayesian inference as a framework.** Conditional probability is in unit 6 through natural
frequencies, and Bayes' theorem sits in a depth block there. A full Bayesian unit is the
strongest candidate for a seventeenth unit, and it would go directly after unit 10. The honest
range is where the frequentist interpretation is at its least intuitive, and a posterior
interval is exactly the object readers believed they were being handed. I left it out because
two inferential frameworks taught in one introductory course produce readers who can operate
neither, and because the misconception unit 10 exists to kill is precisely the one a Bayesian
treatment would then make legitimate. That sequencing needs more care than I can specify here,
and this is the weakest call in the document.

**Named tests as a catalogue.** No chi-square unit, no ANOVA unit, no non-parametric unit.
Under a simulation-first spine these are variations on the shuffle in unit 11, differing only
in what gets shuffled and what statistic gets recorded. Teaching them as separate rituals is
the epicycle Cobb was describing. They belong in a reference appendix that maps each named test
onto its shuffle, which is a page rather than a unit.

**Time series, survival analysis, multilevel models, machine learning.** Out of scope for a
first course. The order dial in unit 14 plants overfitting, which is the one idea from that
territory a general reader needs in order to read the news.

**Calculus-based derivations.** Not because readers cannot handle them. Because every
derivation this course would need can be replaced by a simulation that shows the same thing and
is more convincing to more people. The n − 1 correction is the test case: watching a biased
estimator sit consistently low across 10,000 simulated samples persuades people that the
algebra does not.

**Formal probability axioms and combinatorics.** Counting arrangements is a genuine skill and
it is not the skill this course exists to build.

---

## Where this spine is most likely wrong

**Unit 14 is over-packed.** Twenty-six minutes against a loop PEDAGOGY budgets at fifteen, with
four instruments and no room left. Unit 15 sits in the same place, at 24 minutes and four
instruments. The split point for 14 is named in the unit entry. If a build agent tells me it
does not fit, they are right and it should split, and the course becomes seventeen units.

**Unit 6 may be in the wrong place.** The prosecutor's fallacy and the natural-frequency tree
are the best material in that unit and they have almost nothing to do with the inference that
follows it. There is a defensible variant where conditional probability moves out to sit
against unit 13, since confounding is a conditional-probability idea wearing different clothes,
and unit 6 shrinks to long-run frequency alone at about 14 minutes. I did not take that variant
because it splits the reader's one encounter with probability into two distant halves, but I
hold it loosely.

**The causal ledger assumes continuity.** Unit 1 stores the reader's answer in `localStorage`
and unit 13 reads it back. Most readers will not arrive at unit 13 in the same browser, or the
same month. The ledger has to degrade gracefully to a generic version, and when it degrades the
payoff is much weaker, and the argument in section (b) leans on that payoff harder than is
comfortable.

**Sixteen units is longer than anyone finishes.** The stopping-point hedge above is a response
to that and not a solution to it. If the delayed transfer tests in PEDAGOGY section 8 ever get
run, the first thing worth measuring is not whether the instruments beat static text, but where
readers stop, and whether the ordering put the right thing before that point.

---

## Reconciling with `app/curriculum.js`

The shipped list has eighteen units. This spine has sixteen, and two of the moves are
substantive rather than editorial.

| Shipped | Becomes | Why |
|---|---|---|
| `01-noticing`, `02-counting` | `01-noticing` | Merged. Subitising failing at about four objects is the reason counting exists, so the two halves are one argument |
| `03-measure` | `02-numbers` | Renumbered |
| `04-piles` | `03-pile` | Renumbered |
| `05-middle` | `04-middle` | Renumbered |
| `06-spread` | `05-spread` | Renumbered; this is now the notation gate |
| `07-chance` | `06-chance` | Position relative to description unchanged |
| `08-bell` | `09-bell` | **Moved down two.** The normal family becomes an explanation of the sampling distribution rather than a prerequisite for it. Section (a) |
| `09-sampling` | `07-sampling` | Moved up one, ahead of the bell |
| `10-wobble` | `08-wobble` | Moved up one, ahead of the bell |
| `11-range` | `10-range` | Renumbered |
| `12-trial` | `11-trial` | Renumbered; rebuilt around the shuffle, with t as a shortcut |
| `13-together` | `12-together` | Renumbered |
| `15-cause` | `13-third` | **Moved up, ahead of regression.** Section (b) |
| `14-line`, `17-models` | `14-line` | Merged. A line is the reader's first model |
| `16-designed` | `15-designed` | Renumbered; now the final technical unit |
| `18-rhetoric` | `16-rhetoric` | Unchanged in role |

`app/curriculum.js` in this changeset is regenerated to match. Every existing field name is
kept (`id`, `no`, `status`, `minutes`, `title`, `question`, `installs`, `lies`), so
`app/views/map.js` needs no edit: it reads `id`, `no`, `status`, `minutes`, `title` and
`question`, and `installs` and `lies` are carried for the unit pages. One field is added,
`part`, which lessons pass through as the `unit` field on their default export. If the synthesis
picks a different spine, drop the regenerated `app/curriculum.js` with it. Taking the data file
without the argument is the drift both files exist to prevent.

---

## Sources this ordering leans on

Named so that a contributor can go and disagree with them. None of these has been re-derived
here, and any claim that reaches a reader's screen gets checked against the original first,
which is the standard PEDAGOGY section 8 already sets.

- George Cobb, "The Introductory Statistics Course: A Ptolemaic Curriculum?", *Technology
  Innovations in Statistics Education*, 2007. The argument for simulation-first inference, and
  the reason the bell is ninth.
- Nathan Tintle and colleagues, randomisation-based introductory curricula and their assessment,
  *Journal of Statistics Education* and elsewhere, 2011 onwards.
- Amos Tversky and Daniel Kahneman, "Belief in the Law of Small Numbers", *Psychological
  Bulletin*, 1971. Unit 6. Tversky is the first author, which the unit text gets right and half
  the internet does not.
- Frank Anscombe, "Graphs in Statistical Analysis", *The American Statistician*, 1973. Unit 12.
- Peter Bickel, Eugene Hammel and J. William O'Connell, "Sex Bias in Graduate Admissions: Data
  from Berkeley", *Science*, 1975. Unit 13.
- Francis Galton, "Regression Towards Mediocrity in Hereditary Stature", *Journal of the
  Anthropological Institute*, 1886. Unit 14.
- David Card and Alan Krueger, "Minimum Wages and Employment: A Case Study of the Fast-Food
  Industry in New Jersey and Pennsylvania", *American Economic Review*, 1994. Unit 15.
- John Snow, *On the Mode of Communication of Cholera*, second edition, 1855. Unit 15.
- Ronald Fisher, *The Design of Experiments*, 1935. Unit 15.
- Joseph Simmons, Leif Nelson and Uri Simonsohn, "False-Positive Psychology", *Psychological
  Science*, 2011. Unit 11.
- Andrew Gelman and Eric Loken, "The Statistical Crisis in Science", *American Scientist*, 2014.
  Unit 11.
- Ronald Wasserstein and Nicole Lazar, "The ASA's Statement on p-Values: Context, Process, and
  Purpose", *The American Statistician*, 2016. Unit 11.
- George Box, "Science and Statistics", *Journal of the American Statistical Association*, 1976.
  Unit 14.
- Richard Doll and Austin Bradford Hill, "Smoking and Carcinoma of the Lung", *British Medical
  Journal*, 1950. Unit 13, and the target of the tobacco industry's version of "correlation is
  not causation".
- Peverill Squire, "Why the 1936 Literary Digest Poll Failed", *Public Opinion Quarterly*, 1988.
  Unit 7. The ballot counts, the response rate and Gallup's sample size all come from here and
  all need checking against it before they reach a screen.
- Royal Statistical Society, public statement on the Sally Clark case, 2001. Unit 6. The
  1-in-73-million figure, the 1999 conviction date and the 2003 appeal all get verified against
  the RSS statement and the Court of Appeal judgment before they go on a screen.
- The remark about twenty-five-standard-deviation moves in unit 9 is attributed to a bank's
  chief financial officer in the *Financial Times*, August 2007. I have not read the original
  and the wording is from memory, so it is quoted as a paraphrase and marked for verification.
  If it cannot be sourced, the instrument works with a flood return period instead and loses
  nothing.
