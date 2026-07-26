# Voice

The writing charter for The Shape of Maybe. It binds every word a reader can see: lesson
prose, captions, button labels, screen-reader descriptions, error messages, and the
`title` / `question` / `installs` / `lies` fields in `app/curriculum.js`. It also binds the
code comments, because the repository is public and the comments in this project are written
to be read by a learner rather than by a maintainer.

A pull request can be rejected on voice alone. That is not pedantry. A screen can teach the
standard error correctly and still make a reader feel small, and when it does, it has failed
at the job it was built for. No test we can write will catch that, so review has to.

Companion documents: [PEDAGOGY.md](PEDAGOGY.md) governs the screens, [CURRICULUM.md](CURRICULUM.md)
governs the order, [LESSON-TEMPLATE.md](LESSON-TEMPLATE.md) governs the file. This one governs
the words.

---

## The four principles, restated as writing instructions

1. **Everyone is a mathematician.** Describe the thinking the reader already did. Never
   introduce a concept as though it arrived from outside them.
2. **Statistics can convey truths or lies.** Every unit shows a real distortion and the
   reader operates it. The ethics never wait for the end.
3. **Mathematics is beautiful.** Some sentences exist to be enjoyed. Earn them by being
   accurate first.
4. **You can do it.** Anti-intimidation is a constraint, not a sentiment. It is enforced by
   what you refuse to write, not by encouragement.

---

## 1. Notation is earned, never issued

A symbol is a compression, and compression is only worth doing once there is something bulky
to compress. The order is fixed. The reader does the thing, the prose describes the thing in
words, and only then does the symbol arrive as shorthand for a sentence they already
understand.

Three questions to answer in the pull request, before any symbol goes on a screen:

- **What did the reader already do that this symbol stands for?** If the answer is "nothing
  yet", the symbol is early.
- **Can the same thing be said in full English on the same screen?** If not, the idea is not
  ready to be compressed.
- **What does each piece mean out loud?** Every symbol gets a parsing pass on first
  appearance, including the pieces that feel too obvious to explain. Especially those.

**Bad**

> The sample mean is defined as x̄ = (1/n) Σxᵢ, a measure of central tendency.

**Good**

> You found the middle of each row by eye. On paper you would do it by adding the values up
> and sharing the total out equally between them. That is the whole of x̄: the bar means
> "the average of", the Σ is an instruction to add things up, and n is how many things you
> added. The symbol is shorter than the sentence, which is the only reason it exists.

A second rule follows. **Once a symbol is earned, use it.** Do not retreat to "the average"
for the rest of the unit out of kindness. Retreating tells the reader the notation was a
hurdle they cleared rather than a tool they now own, and they will believe you.

---

## 2. Name the competence, do not congratulate it

The signature move of this site: the reader does the intuitive thing, and then the text says
*that move you just made has a name*. It works because it is a **description** of what
happened. It stops working the moment it becomes **praise**, because praise puts the writer
in the chair of the judge, and a judge is exactly what a nervous reader is scanning for.

The test: could a stranger have written this sentence by watching the screen? If yes, it is
description. If it needs an opinion about the reader, it is praise.

**Bad**

> Great job! You just did statistics!

**Good**

> You did not add sixty-eight numbers or divide by thirty-four. You looked, your eye found
> the middle of each crowd, and you compared them. That move has a name: comparing two means.

That is the shipped text in `app/views/home.js`, and the arithmetic in it is real: the landing
page draws two rows of 34 dots each.

The line between a fact and a verdict is narrow enough to be worth drawing precisely. A
statement about the **answer** is a fact and is allowed. `ui.quiz` says "Right." or "Not that
one." before it says why, and both pass, as do "The bottom row sits further right" and "That
is the one the data supports". A statement about the **reader** is a verdict and is not:
"Great job", "Well done", "You're a natural", "See, that wasn't so bad". The landing page
kicker in `app/views/home.js` reads "Correct — and look at what you skipped", which passes,
because everything after the dash is about what happened on the screen.

**Bad**

> Don't be intimidated by the formula below. It looks scary, but it's actually really simple
> once you get the hang of it!

**Good**

> The formula below has four parts. Take them one at a time: what gets added up, how many
> things there are, what gets subtracted, and what the total gets divided by.

Naming a fear installs it. A reader who was not worried about the formula has now been told
there is something here worth worrying about, and a reader who *was* worried has been told
the worry is visible from outside. Set the formula down calmly and start reading it.

The same holds when the reader is wrong. Explain why the wrong answer was attractive before
correcting anything, because the wrong answer nearly always has real reasoning under it.

**Bad**

> Incorrect. The correct answer is B.

**Good**

> Most people pick the bigger sample, and the instinct behind that is sound: more data
> usually means a steadier estimate. What breaks here is that the bigger sample was collected
> from people who volunteered. Size does not repair a sample that was never fair to begin
> with, and it makes the result look more convincing while it fails to.

---

## 3. Banned moves

These are checkable. A reviewer can search for them.

### Banned words and phrases

| Banned | Why | Repair |
|---|---|---|
| simply, merely, all you have to do is | Declares the reader's difficulty invalid | Delete. The sentence is better without it |
| just, when it minimises | Same | Delete. "Just under 3%" and "a link is just a link" are fine |
| obviously, clearly, naturally, of course | If it were obvious the sentence would be unnecessary | Delete, or explain why it follows |
| as you can see, notice how, observe that | Assumes a sighted reader looking at the right place | State the finding in words |
| trivial, elementary, basic, as dismissal | Ranks the reader against the material | Name the actual difficulty, or say nothing |
| it is important to note, it should be noted | Filler implying the rest is unimportant | Delete the frame, keep the note |
| we will now, in this section, let us turn to | Narrates the document instead of teaching | Start the content |
| let's dive in, welcome to, buckle up, get ready | Enthusiasm standing in for interest | Delete |
| don't worry, don't be scared, no need to panic | Installs the fear it disclaims | Delete |
| color words for data roles: the blue line, the orange dots | Excludes color-blind and screen-reader users | Name the role: the true value, the sample |

**The ban attaches to the job the word is doing, not to the string.** A grep is where review
starts, not where it ends. Running the list over `app/`, `index.html` and `README.md` today
returns nine hits, and two of them are real violations:

- `app/views/about.js:56` ends a sentence with "a subject they were simply never shown
  properly". That is the minimising adverb doing exactly the banned thing.
- `app/core/engine.js:71` has "Anything else simply switches at the end" in a comment. Same
  word, same job, and comments are in scope.

Neither is an exception the charter grants itself. Both are on the list to fix. The other
seven pass, and it is worth knowing why:

- `app/views/map.js:73` has "published when they are genuinely good rather than when they are
  merely finished". Here *merely* modifies the state of a unit, not the reader's effort.
- `app/core/router.js:3` and `README.md:49` both say "a link is just a link". Identity sense.
- `app/views/home.js:3`, `app/lessons/01-noticing/index.js:422` ("You just drew a null
  result") and the same file at `:664` use the temporal *just*.
- `app/curriculum.js:129` asks how to "say something true, clearly, without misleading
  anyone". That is manner, not an appeal to the obvious.

If you cannot say which group a flagged line belongs to, the line needs rewriting either way.

### Banned structures

- **Exclamation marks in body prose.** None. A verdict line can be warm without one.
- **Gamified praise.** No streaks, no badges, no "unlocked", no confetti, no emoji in prose.
  The reward for understanding something is understanding it.
- **Fake second-person questions the text then answers.** They stage a conversation that is
  not happening and put words in the reader's mouth, usually words more naive than the reader
  would have chosen.
- **Rule-of-three padding.** Two examples is fine. Four is fine. Three balanced clauses in a
  row is the tell that rhythm has started choosing the content. A genuine enumeration that
  happens to have three members is not padding.
- **Em-dashes in body prose.** Titles, kickers and one-line verdicts may take one. The
  precedents are the page title in `index.html`, the `document.title` the router builds, and
  the `.named__kicker` on the landing page. Running prose uses commas, colons, parentheses,
  or a new sentence.

**Bad**

> So what is a p-value, really? A p-value is the probability of obtaining test results at
> least as extreme as the observed results, under the assumption that the null hypothesis is
> correct.

**Good**

> Run the world again a few thousand times with no real effect in it, and count how often
> those invented worlds throw up a gap as big as the one you actually measured. That count,
> written as a fraction, is the p-value.

**Bad**

> Ready to unlock the next level? You've earned it! 🎉 Two more units and you'll have a full
> streak.

**Good**

> Unit 09-bell picks up the shape you just built and asks why it keeps turning up in places
> that have nothing to do with each other.

**Bad**

> The standard error is simply the standard deviation divided by the square root of n.

**Good**

> The standard error is the standard deviation divided by the square root of n. The square
> root is the part worth staring at: to halve your uncertainty you need four times the data.

**Bad**

> Of course, the median is more robust to outliers than the mean.

**Good**

> Put one person earning $100 million into a room with thirty teachers on $60,000. The mean
> income in that room goes from $60,000 to $3.28 million. The median does not move at all.
> That difference is the entire reason both numbers exist.

---

## 4. Rhythm

One complete thought per sentence, medium length, varied. There are two ways to fail and both
are tells.

**Run-on failure.** Sentences past about forty words that chain *because* / *which* /
*so that* / *since* into one breath.

**Bad**

> Because the sample is drawn at random and the sample size is large enough that the central
> limit theorem applies, the sampling distribution of the mean will be approximately normal,
> which means we can use the normal distribution to compute the probability of observing a
> sample mean at least as extreme as the one we observed, assuming the null hypothesis is
> true.

**Good**

> The sample was drawn at random, and it is large. Both of those matter, and for different
> reasons. Together they mean the sample means pile up in a bell shape, and a bell shape is
> something we already know how to measure.

**Staccato failure.** Fragments used for drama, abstract one-liners capping every paragraph,
negation pivots of the form *This is not X. It is Y.*

**Bad**

> Randomness. It is the whole game. Not a nuisance to be managed. A tool to be used.

**Good**

> Randomness is the tool here rather than the problem. Shuffling the labels a few thousand
> times builds you a world where nothing is going on, and you need that world before you can
> say whether the gap in front of you is unusual.

Six operations that make this checkable:

1. Split any sentence over about forty words at its connective. Split into flowing sentences,
   not fragments.
2. Open every paragraph with a concrete topic sentence, never a short dramatic fragment.
3. End every paragraph on the concrete claim. Not on a hedge, not on a cross-reference, not
   on an "-ing" tail like *highlighting the importance of careful sampling*. If the tail
   matters, promote it to its own sentence. If it does not, cut it.
4. Lead with the specific: a number with its unit, a named source, or the finding itself,
   ahead of any abstraction.
5. Vary paragraph length on purpose. A one-sentence paragraph is a strong move that stops
   working the second time it appears on a screen.
6. Read it aloud. Not a metaphor. Most rhythm problems are audible in one pass and invisible
   in ten silent ones.

---

## 5. Captions carry the finding

A caption is not a label. It is the shortest honest version of what the figure shows, written
so that a reader who cannot see the figure still gets the point.

Every caption states, in this order: what is being shown, of what, in what units, and what it
means. If the figure is simulated, the caption says so and names the world number. If the
data are published, the caption names the source.

**Bad**

> Figure 3. Histogram of household income.

**Good**

> Household income for the 4,912 households in this unit's invented dataset, in 2023 dollars,
> grouped into $10,000 bins. No survey was involved; these numbers were built to make one
> point. The mean sits at $106,700 and the median at $75,400. The gap between those two marks
> is the long right tail doing its work, as a small number of very high incomes pull the mean
> up and leave the median where it was.

**Bad**

> Figure 5. Sampling distribution of the mean for n = 10, 40, 160 (world 42).

**Good**

> Three thousand simulated samples from the same population, drawn in world 42, at sample
> sizes of 10, 40 and 160. Each dot is one sample's mean. The cloud tightens by half every
> time the sample size quadruples, which is the square-root rule you can see rather than
> derive.

**The figure-vanishes test.** Delete the canvas in your head. If the surrounding paragraph
plus the caption no longer make the point, the prose is leaning on the picture and a blind
reader gets nothing. Rewrite until the words stand on their own, then put the figure back,
because for everyone else it is still the fastest route.

This is why color words are banned. Say **the true value**, not *the blue line*. The figure
carries the color and the prose carries the meaning, so a reader who cannot separate blue
from orange loses nothing. The four data roles in `app/styles/tokens.css` have names for
exactly this reason: truth, data, result, test.

---

## 6. Write uncertainty the way it actually is

Statistics is a set of tools for being honest about not knowing. Prose that overstates
confidence is not a style problem, it is a false statement.

**Bad**

> We are 95% confident that the true value lies between 41% and 47%.

**Good**

> The interval runs from 41% to 47%. The 95% describes the method rather than this interval:
> build intervals this way over and over and about 95 in every 100 will contain the true
> value. This particular one either contains it or does not, and nobody ever finds out which.

The opposite failure is decorative hedging, where doubt is sprayed evenly over everything so
that no sentence can be wrong. Hedge where the doubt is real, once, and say what the doubt is
about.

**Bad**

> It could perhaps be argued that these results may possibly suggest that there might be some
> relationship between the two variables.

**Good**

> The slope is 0.31 with a standard error of 0.29. A number sitting there is consistent with
> a real effect, with no effect at all, and with an effect running the other way. This study
> cannot tell those three apart, and no amount of careful wording will make it able to.

Two habits follow. Give numbers their units and their denominators every time, because a rate
without a denominator is not a fact. And when the honest answer is that nobody knows, write
that sentence and stop rather than reaching for a softer verb.

---

## 7. The lies thread, without moralising

Every unit contains a real distortion the reader can perform. The prose around it does two
things: it shows that the distortion runs on true numbers, and it hands the reader the
control. It does not editorialise about dishonest people.

Moralising is worse than useless here. It converts a technique the reader could learn to spot
into a story about villains, and villains are always other people.

**Bad**

> Unfortunately, some unscrupulous people misuse statistics to deceive the public, which is
> why we must always remain vigilant when reading the news.

**Good**

> Every figure on that chart is correct in both states. Starting the axis at 4.9 minutes
> throws away the bottom of both bars, so 0.4 minutes of real difference fills the frame and
> one bar ends up five times taller than the other. The honest sentence about the same
> picture is still 8% longer. Nobody typed a false number. Put the axis back on zero and
> watch the crisis turn into a wobble.

The default framing is second person and it includes the reader on both sides. *You* can be
fooled by this, and *you* could do this without meaning to. Unit 01-noticing says so in the
shipped prose: charting software fits the axis to the numbers it was handed, somebody accepts
the default, and the most misleading chart most people ever make is one they did not notice
making.

The counterweight matters as much as the technique. That unit also says cropping an axis is
not automatically a lie, because a temperature chart drawn from zero degrees upward hides the
one degree where the whole story lives. A distortion beat that leaves the reader with a rule
of thumb rather than a question has made them easier to fool, not harder.

---

## 8. Humour

Humour is wanted here. It has three rules.

**It comes from noticing, not from performing.** The joke is an accurate observation held
half a beat longer than it needed to be. Dry delivery, no setup, no signposting, no winking.
The `lies` field for `08-wobble` is the house style: "A number quoted without its wobble is a
guess wearing a suit."

**It is never at the reader's expense, or at the expense of a category the reader might be
in.** No jokes about people who are bad at math, who failed statistics, who believed a
headline, or who thought the mean was the median. The premise of the whole site is that those
people were rushed rather than deficient, and one joke can retract it.

**Bad**

> If you thought "average" and "typical" meant the same thing, congratulations, you have been
> successfully fooled by every news outlet in the country.

**Good**

> "Average" and "typical" drifted apart somewhere in the nineteenth century and have not
> spoken since. Headlines use them interchangeably anyway.

**It is never load-bearing.** A reader who misses the joke, or who is reading in their second
language, loses the joke and nothing else. Never hide a definition inside a gag. Never build
an analogy that has to be decoded before the mathematics makes sense.

**Bad**

> Variance is the mean's evil twin, so taking its square root is how you get the standard
> deviation's alibi.

**Good**

> Variance is measured in squared units, which is why nobody can picture it. Take the square
> root and you are back in the units of the thing you measured, which is why the standard
> deviation is the one people actually quote.

One more, on the fake-question ban, because the repair is usually a joke's worth of dryness
rather than a lecture.

**Bad**

> But wait, you might be asking, isn't a bigger sample always better? Great question! The
> answer might surprise you.

**Good**

> A bigger sample is usually better, and the exception is worth the detour: a sample of
> 60,000 volunteers can be beaten by a sample of 1,000 strangers picked at random, and it
> will look more authoritative while losing.

---

## 9. Small mechanics

**Person.** *You* is always the reader, and it means this reader rather than people in
general. *We* is the people who built the site, and it appears only when the sentence is
about a choice we made or a promise we are keeping. There is no pedagogical *we*: never "we
now differentiate", never "we can see that".

**Tense.** Present for what is true and for what the reader is doing. Past for what they did
a moment ago, which is where the naming move lives.

**Spelling and idiom.** American, throughout, including in code comments. *Math* in prose,
*mathematics* in headings and titles. *Color*, *center*, *randomized*, *summarize*, *labeled*,
*modeling*, *toward*, *license* for both the noun and the verb.

Vocabulary matters more than spelling, because it is what gives a scene away. Write
*apartment* rather than flat, *line* rather than queue, *county* or *city* rather than council,
*highway* rather than motorway, *schedule* rather than timetable, *airplane* rather than
aeroplane, *gas* rather than petrol, *sidewalk* rather than pavement, *zip code* rather than
postcode, *cents* and *dollars* rather than pence and pounds.

Money is in dollars unless a unit is built on real data that came in another currency, in which
case it keeps its own and says so in the caption. A unit must not mix currencies.

**Numerals.** Spell out counts inside a sentence about what the reader did or could do:
"sixty-eight numbers", "four seconds". Use digits for data values, sample sizes, parameters,
money and percentages, always with the unit and always with the denominator where one exists.
Write 8%, never "eight percent", including mid-sentence.

**Headings.** Sentence case. A heading is a claim or a question, never a topic label. "Where
the n − 1 comes from" beats "Bessel's correction". "How spread out is it?" beats "Measures of
dispersion".

**Buttons and controls.** Verbs for actions: "Draw a new sample", "Show the true value". Nouns
for settings: "Sample size", "World". Never "Submit". Never "Click here". A button that
commits the reader to a prediction says what the prediction is, so `01-noticing` uses "The
same way" and "Sometimes the other way" rather than a pair of letters.

**Screen-reader text.** Every canvas carries an `aria-label` that is a sentence describing
what a sighted reader would take from the picture, not a description of the drawing. Unit
`01-noticing` sets the standard, and its labels are rebuilt whenever the picture changes:
"The same two bars, 5.0 and 5.4 minutes, on an axis starting at 4.9 minutes. Birch's bar is
now 5.0 times taller than Ash's, from the same 8% difference." A canvas labeled "A canvas
showing a bar chart" fails.

**Error messages.** The screen is at fault, never the reader. `router.js` sets the tone:
"Something in this lesson threw an error, which is our fault rather than yours."

---

## 10. Writing the curriculum fields

`app/curriculum.js` is prose, and it is the most-read prose on the site, because the map is
generated from it. Each unit carries four written fields and each has a shape.

**`title`** is a phrase a reader would repeat to a friend. "The wobble" beats "Sampling
variability". No colons, no subtitles.

**`question`** is the one question the unit answers, written the way a reader would ask it
before they had the vocabulary. First person is allowed here, because it is the reader's
question: "If I did this study again, how different would the answer be?"

**`installs`** describes what the reader will be able to do afterwards, not what will be
covered. It is the sentence that would be true of them at the end.

**`lies`** is the distortion, stated as a technique rather than an accusation, in one
concrete sentence. `03-pile` has "Bin width is a dial, and someone is always turning it." All
sixteen units carry one today. Nothing in the code checks that, so the guarantee rests on
review; PEDAGOGY section 4 sets out the check that would make it structural.

**Cite units by id, never by number.** `docs/CURRICULUM.md` and `app/curriculum.js` disagree
from position four onward: the doc has `04-reroll` and totals 344 minutes, the code has
`04-middle` and totals 336. Until one commit reconciles them, "unit 8" names two different
lessons depending on which file you opened, and prose that says "unit 8" will be wrong for
half its readers. Write `08-wobble` and let the reader look it up.
