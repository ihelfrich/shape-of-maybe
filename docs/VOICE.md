# Voice

The writing charter for The Shape of Maybe. It covers every word a reader can see: lesson
prose, captions, button labels, screen-reader descriptions, error messages, and the
`title` / `question` / `installs` / `lies` fields in `app/curriculum.js`.

This is binding. A pull request can be rejected on voice alone, and that is not pedantry:
the tone is a load-bearing part of what the site claims to be. A screen that teaches the
standard error correctly while making the reader feel small has failed at its actual job.

Companion documents: [PEDAGOGY.md](PEDAGOGY.md) governs the screens, [CURRICULUM.md](CURRICULUM.md)
governs the order. This one governs the words.

---

## The four principles, restated as writing instructions

1. **Everyone is a mathematician.** Describe the thinking the reader already did. Do not
   introduce a concept as though it arrives from outside them.
2. **Statistics can convey truths or lies.** Every unit shows a real distortion, and the
   reader operates it. Never save the ethics for the end.
3. **Mathematics is beautiful.** Some sentences exist to be enjoyed. Earn them by being
   accurate first.
4. **You can do it.** Anti-intimidation is a constraint, not a sentiment. It is enforced
   by what you refuse to write, not by encouragement.

---

## 1. Notation is earned, never issued

A symbol is a compression. Compression is only useful once there is something bulky
enough to be worth compressing. So the order is fixed: the reader does the thing, the
prose describes the thing in words, and only then does the symbol appear as shorthand for
the sentence they already understand.

Before any symbol goes on a screen, answer these three in the pull request:

- **What did the reader already do that this symbol stands for?** If the answer is
  "nothing yet", the symbol is early.
- **Can the sentence be said in full English on the same screen?** If not, the idea is
  not ready to be compressed.
- **What does each piece mean out loud?** Every symbol gets a parsing pass on first
  appearance, including the ones that feel too obvious to explain. Especially those.

**Bad**

> The sample mean is defined as x̄ = (1/n) Σxᵢ, a measure of central tendency.

**Good**

> You found the middle of each row by eye. On paper you would do it by adding the values
> up and sharing the total out equally between them. That is the whole of x̄: the bar
> means "the average of", the Σ is an instruction to add things up, and n is how many
> things you added. The symbol is shorter than the sentence, which is the only reason it
> exists.

A second rule follows from this one. **Once a symbol is earned, use it.** Do not retreat
to "the average" for the rest of the unit out of kindness. Retreating tells the reader the
notation was a hurdle they got over rather than a tool they now own.

---

## 2. Name the reader's competence, do not congratulate it

The signature move of this site is: the reader does the intuitive thing, and then the text
says *that move you just made has a name*. The move works because it is a **description**
of what happened. It stops working the moment it becomes **praise**, because praise puts
the writer in the position of judge, and a judge is exactly what a nervous reader is
scanning for.

The test: could a stranger have written this sentence by watching the screen? If yes, it
is description. If it needs an opinion about the reader, it is praise.

**Bad**

> Great job! You just did statistics!

**Good**

> You did not add sixty-eight numbers or divide by thirty-four. You looked, your eye found
> the middle of each crowd, and you compared the two. That move has a name: comparing two
> means.

The line between a fact and a verdict is narrow enough to be worth drawing precisely. A
statement about the **answer** is a fact and is allowed: "Correct", "The bottom row sits
further right", "That is the one the data supports". A statement about the **reader** is a
verdict and is not: "Great job", "Well done", "You're a natural", "See, that wasn't so bad".
The landing page kicker in `app/views/home.js` reads "Correct — and look at what you
skipped", which passes, because the sentence that follows is entirely about what happened
on the screen.

**Bad**

> Don't be intimidated by the formula below. It looks scary, but it's actually really
> simple once you get the hang of it!

**Good**

> The formula below has four parts. Take them one at a time: what gets added, how many
> things there are, what gets subtracted, and what the total gets divided by.

Naming a fear installs it. A reader who was not worried about the formula is now told
there is something here worth being worried about, and a reader who *was* worried has been
told their worry is visible. Neither is a gift. Set the formula down calmly and start
reading it.

The same applies to failure. When a reader gets something wrong, the prose explains why
the wrong answer was attractive before it corrects anything, because the wrong answer
usually has real reasoning behind it.

**Bad**

> Incorrect. The correct answer is B.

**Good**

> Most people pick the bigger sample, and the instinct behind that is sound: more data
> usually means a steadier estimate. What breaks here is that the bigger sample was
> collected from people who volunteered. Size does not repair a sample that was never
> fair to begin with, and it makes the result look more convincing while it does so.

---

## 3. Banned moves

These are checkable. A reviewer can search for them.

### Banned words and phrases

| Banned | Why | Repair |
|---|---|---|
| simply, merely, all you have to do is | Declares the reader's difficulty invalid | Delete. The sentence is always better without it |
| just (when it minimises) | Same | Delete. "Just under 3%" and "just as" are fine |
| obviously, clearly, naturally, of course | If it were obvious the sentence would be unnecessary | Delete, or explain why it follows |
| as you can see, notice how, observe that | Assumes a sighted reader looking at the right thing | State the finding in words |
| trivial, elementary, basic (as dismissal) | Ranks the reader against the material | Name the actual difficulty level or say nothing |
| it is important to note, it should be noted | Filler that implies the rest is unimportant | Delete the frame, keep the note |
| we will now, in this section, let us turn to | Narrates the document instead of teaching | Start the content |
| let's dive in, welcome to, buckle up, get ready | Enthusiasm as a substitute for interest | Delete |
| don't worry, don't be scared, no need to panic | Installs the fear it disclaims | Delete |
| colour words for data roles: the blue line, the orange dots | Excludes colour-blind and screen-reader users | Name the role: the true value, the sample |

### Banned structures

- **Exclamation marks in body prose.** None. A verdict line may be warm without one.
- **Gamified praise.** No streaks, no badges, no "unlocked", no confetti, no emoji in
  prose. The reward for understanding something is understanding it.
- **Fake second-person questions that the text then answers.** These stage a conversation
  that is not happening and put a rhetorical question in the reader's mouth.
- **Rule-of-three padding.** Two examples is fine. Four is fine. Three balanced clauses in
  a row is the tell that the rhythm is choosing the content. A genuine enumeration that
  happens to have three members is not padding.
- **Em-dashes in body prose.** Titles, kickers, and one-line verdicts may take one. The
  existing precedents are the page title in `index.html`, the `document.title` the router
  builds, and the `.named__kicker` on the landing page. Running prose uses commas, colons,
  parentheses, or a new sentence.

**Bad**

> So what is a p-value, really? A p-value is the probability of obtaining test results at
> least as extreme as the observed results, under the assumption that the null hypothesis
> is correct.

**Good**

> Run the world again thousands of times with no real effect in it, and count how often
> those fake worlds throw up a gap as big as the one you actually measured. That count,
> written as a fraction, is the p-value.

**Bad**

> The standard error is simply the standard deviation divided by the square root of n.

**Good**

> The standard error is the standard deviation divided by the square root of n. The square
> root is the part worth staring at: to halve your uncertainty you need four times the
> data.

**Bad**

> Of course, the median is more robust to outliers than the mean.

**Good**

> Put one person earning $100 million into a room with thirty teachers on $60,000. The
> mean income in that room goes from $60,000 to $3.3 million. The median stays exactly
> where it was. That difference is the entire reason both numbers exist.

### The corpus is not yet clean

One shipped sentence breaks this list. `app/views/about.js` ends with "a subject they were
simply never shown properly", and "simply" is banned above. It is a real violation and it
is on the list to fix rather than an exception the charter grants itself. Any other
instance a reviewer finds in `app/` counts the same way. A charter with a private exemption
for the prose that already exists is not a charter.

---

## 4. Rhythm

One complete thought per sentence, medium length, varied. There are two ways to fail and
both are tells.

**Run-on failure.** Sentences past about forty words that chain *because* / *which* /
*so that* / *since* into a single breath.

**Bad**

> Because the sample is drawn at random and the sample size is large enough that the
> central limit theorem applies, the sampling distribution of the mean will be
> approximately normal, which means we can use the normal distribution to compute the
> probability of observing a sample mean at least as extreme as the one we observed,
> assuming the null hypothesis is true.

**Staccato failure.** Fragments used for drama, abstract one-liners capping every
paragraph, negation pivots ("This is not X. It is Y.").

**Bad**

> Randomness. It is the whole game. Not a nuisance to be managed. A tool to be used.

**Good**

> The sample was drawn at random, and it is large. Both of those matter, and for different
> reasons. Together they mean the sample means pile up in a bell shape, and a bell shape
> is something we already know how to measure.

Six operations that make this checkable:

1. Split any sentence over about forty words at its connective. Split into flowing
   sentences, not fragments.
2. Open every paragraph with a concrete topic sentence, never a short dramatic fragment.
3. End every paragraph on the concrete claim. Not on a hedge, not on a cross-reference,
   not on an "-ing" tail ("highlighting the importance of careful sampling"). If the tail
   matters, promote it to its own sentence. If it does not, cut it.
4. Lead with the specific: a number with its unit, a named source, or the finding itself,
   before any abstraction.
5. Vary paragraph length on purpose. A one-sentence paragraph is a strong move that stops
   working if it appears twice on a screen.
6. Read it aloud. This is not a metaphor. Most rhythm problems are audible in one pass and
   invisible in ten silent ones.

---

## 5. Captions carry the finding

A caption is not a label. It is the shortest honest version of what the figure shows, and
it is written so that a reader who cannot see the figure still gets the point.

Every caption states, in this order: what is being shown, of what, in what units, and what
it means. If the figure is simulated, the caption says so and names the world number. If
the figure comes from published data, the caption names the source.

**Bad**

> Figure 3. Histogram of household income.

**Good**

> Household income for the 4,912 households in this unit's synthetic example dataset, in
> 2023 dollars, grouped into $10,000 bins. No survey was involved; the numbers were built
> to make one point. The mean sits at $106,700 and the median at $75,400. The gap between
> those two marks is the long right tail doing its work: a small number of very high
> incomes pull the mean up and leave the median where it was.

**Bad**

> Figure 5. Sampling distribution of the mean for n = 10, 40, 160 (world 42).

**Good**

> Three thousand simulated samples from the same population, drawn in world 42, at sample
> sizes of 10, 40 and 160. Each dot is one sample's mean. The cloud tightens by half every
> time the sample size quadruples, which is the square-root rule you can see rather than
> derive.

**The figure-vanishes test.** Delete the canvas in your head. If the surrounding paragraph
plus the caption no longer make the point, the prose is leaning on the picture and a blind
reader gets nothing. Rewrite until the words stand alone, then put the figure back, because
the figure is still the fastest route for everyone else.

This is why colour words are banned in prose. Say **the true value**, not *the blue line*.
The figure carries the colour, the prose carries the meaning, and the reader who cannot
distinguish blue from orange loses nothing. The four roles in `app/styles/tokens.css` have
names for exactly this reason: truth, data, result, test.

---

## 6. Write uncertainty the way it actually is

Statistics is a set of tools for being honest about not knowing. Prose that overstates
confidence is not a style problem, it is a false statement.

**Bad**

> We are 95% confident that the true value lies between 41% and 47%.

**Good**

> The interval runs from 41% to 47%. The 95% describes the method, not this interval:
> build intervals this way over and over and about 95 out of every 100 will contain the
> true value. This particular one either contains it or does not, and nobody ever finds
> out which.

The opposite failure is decorative hedging, where uncertainty is sprayed evenly over
everything so that nothing can be wrong. Hedge where the doubt is real, once, and state
the doubt specifically.

**Bad**

> It could perhaps be argued that these results may possibly suggest that there might be
> some relationship between the two variables.

**Good**

> The slope is 0.31 with a standard error of 0.29. A number sitting there is consistent
> with a real effect, with no effect at all, and with an effect running the other way.
> This study cannot tell those three apart, and no amount of careful wording will make it
> able to.

Two habits that follow. Give numbers their units and their denominators every time, because
a rate without a denominator is not a fact. And when the honest answer is that we do not
know, write that sentence and stop, rather than reaching for a softer verb.

---

## 7. The lies thread, without moralising

Every unit contains a real distortion that the reader can perform themselves. The prose
around it does two things: it shows that the distortion uses only true numbers, and it
hands the reader the control. It does not editorialise about dishonest people.

Moralising is worse than useless here. It converts a technique the reader could learn to
spot into a story about villains, and villains are always other people.

**Bad**

> Unfortunately, some unscrupulous people misuse statistics to deceive the public, which
> is why we must always remain vigilant when reading the news.

**Good**

> Every number on this chart is correct. The axis starts at 94% instead of 0%, so a change
> of two points fills the whole frame and reads as a collapse. Nobody typed a false figure.
> Drag the axis floor down to zero and watch the crisis turn back into a wobble.

The default framing is second person and includes the reader on both sides. *You* can be
fooled by this, and *you* could do this without meaning to. The most common way a
misleading chart gets made is by somebody choosing the default their software offered.

---

## 8. Humour

Humour is allowed and wanted. It has three rules.

**It comes from noticing, not from performing.** The joke is an accurate observation held
half a beat longer than necessary. Dry, flat delivery. No setup, no signposting, no
winking.

> A number quoted without its wobble is a guess wearing a suit.

**It is never at the reader's expense, and never at the expense of a category the reader
might be in.** No jokes about people who are bad at maths, people who failed statistics,
people who believed a headline, or people who thought the mean was the median. The site's
whole premise is that those people were rushed, not deficient.

**Bad**

> If you thought "average" and "typical" meant the same thing, congratulations, you have
> been successfully fooled by every news outlet in the country.

**Good**

> "Average" and "typical" drifted apart somewhere in the nineteenth century and have not
> spoken since. Headlines use them interchangeably anyway.

**It is never load-bearing.** A reader who does not get the joke, or who is reading in
their second language, must lose nothing but the joke. Never hide a definition inside a
gag, and never build an analogy that has to be decoded before the mathematics makes sense.

**Bad**

> Variance is the mean's evil twin, so taking its square root is how you get the standard
> deviation's alibi.

**Good**

> Variance is measured in squared units, which is why nobody can picture it. Take the
> square root and you are back in the units of the thing you measured, which is why the
> standard deviation is the one people actually quote.

---

## 9. Small mechanics

**Person.** *You* is always the reader, and it means the reader specifically, not people
in general. *We* is the people who built the site, and it appears only when the sentence
is about a choice we made or a promise we are keeping. There is no pedagogical *we*: never
"we now differentiate", never "we can see that".

**Tense.** Present, for what is true and for what the reader is doing. Past, for what they
did a moment ago, which is where the naming move lives.

**Spelling.** British. *Maths* in prose, *mathematics* in headings and titles, *randomised*,
*summarise*, *centred*, *colour*, *licence* for the noun. Data examples keep their own
currencies and units.

**Numerals.** Spell out counts inside a sentence about what the reader did or could do
("sixty-eight numbers", "four seconds"). Use digits for data values, sample sizes,
parameters, money, and percentages, always with the unit and always with the denominator
where one exists.

**Headings.** Sentence case. A heading is a claim or a question, not a topic label. "Where
the n − 1 comes from" beats "Bessel's correction". "How spread out is it?" beats "Measures
of dispersion".

**Buttons and controls.** Verbs for actions ("Draw a new sample", "Show the true value"),
nouns for settings ("Sample size", "World"). Never "Submit". Never "Click here".

**Screen-reader text.** Every canvas gets an `aria-label` that is a sentence describing
what a sighted reader would take from the picture, not a description of the drawing. The
landing page sets the standard: "Two rows of scattered dots. The top row is centred to the
left of the bottom row." A canvas labelled "A canvas showing a scatter plot" fails.

**Error messages.** The screen is at fault, never the reader. The router already sets the
standard: "Something in this lesson threw an error, which is our fault rather than yours."

---

## 10. Writing the curriculum fields

`app/curriculum.js` is prose, and it is the most-read prose on the site because it builds
the map. Each unit carries four written fields and each has a shape.

**`title`** is a phrase a reader would repeat to a friend. "The wobble" beats "Sampling
variability". No colons, no subtitles.

**`question`** is the one question the unit answers, written the way a reader would ask it
before they had the vocabulary. First person is allowed here because it is the reader's
question: "If I did this study again, how different would the answer be?"

**`installs`** describes what the reader will be able to do, not what will be covered. It
is the sentence that would be true of them afterwards.

**`lies`** is the distortion, stated as a technique rather than an accusation, in one
sentence, concrete. Unit 3 has "Bin width is a dial, and someone is always turning it."
All sixteen units currently carry one. Nothing in the code checks that, so today the
guarantee rests on review; PEDAGOGY section 4 sets out the check that would make it
structural.

---

## The read-aloud check

Before opening a pull request that touches prose, read the screen out loud and check:

- [ ] No banned word appears (search for: simply, merely, just, obviously, clearly, of
      course, as you can see, notice how, it is important to note, trivial, don't worry).
- [ ] No colour word stands in for a data role.
- [ ] No exclamation mark, no emoji, no em-dash in body prose.
- [ ] Every symbol on the screen was preceded by the sentence it compresses.
- [ ] Every naming move is a description of what happened, not a verdict on the reader.
- [ ] Every caption states what, of what, in what units, and what it means, and says so
      when the data are simulated.
- [ ] The figure-vanishes test passes on every figure.
- [ ] Every number has its unit and its denominator.
- [ ] Uncertainty is stated once, specifically, where it is real.
- [ ] The unit's distortion is something the reader operates, not something described.
- [ ] Nothing on the screen ranks the reader.
- [ ] No sentence runs past about forty words, and no paragraph opens with a fragment.
- [ ] It sounds like a person who finds this interesting talking to a person they respect.

The last one is the only check that matters, and the other twelve exist because it is hard
to run on your own writing.
