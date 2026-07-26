# Decisions

Choices that shaped the project, and the reasoning behind them. Newest first. A decision here
is not permanent, but reversing one should mean arguing with what is written rather than
rediscovering it.

---

## Provenance is deferred until real data arrives

**Decided 2026-07-26. Status: deferred, revisit at unit 6.**

The proposal was a "provenance X-ray": press and hold any number on the page and it opens into
the layers underneath. "62% approve" becomes 620 of 1,000 recorded responses, then 1,540 people
contacted, then the question wording, the dates, the weighting, the exclusions, and who paid for
it. Source criticism stops being a chapter and becomes a physical habit.

It is a good idea and it is not being built yet. Units 1 to 5 run on invented worlds: two cafes,
a street of rents, two bus routes. Pressing and holding a number in those units would reveal
that a person made it up, which teaches nothing and cheapens the mechanic before it has a chance
to matter. The X-ray earns its keep on figures a reader could go and check.

**What this costs now.** One convention, below, so the retrofit is a caption change rather than
a rewrite.

**What triggers the revisit.** The first unit built on a real dataset. On current plans that is
around unit 6, where chance and sampling arrive and invented data stops being enough.

### The convention every figure follows

Every caption ends by saying where its numbers come from, in one clause, in the same place.

Invented data names the world, so a reader can reproduce it:

> Thirty simulated visits to Cafe Ash, in minutes, drawn in world 777.

Real data names the source, the date and the unit:

> Median monthly rent for two-bedroom flats, 2024, from the English Housing Survey.

The rule is that provenance lives in exactly one slot per figure and is never mixed into the
interpretation. When the X-ray is built, that slot becomes the thing you press.

---

## Lessons are registered from the curriculum, and the site never overstates itself

**Decided 2026-07-25.**

`app/curriculum.js` is the single source of truth for what the course contains. The map screen
is generated from it, and `main.js` imports whichever units are marked ready.

A unit only appears as ready if its module actually loaded. When the maths core was missing for
part of a day, unit 1 correctly showed as unfinished rather than handing a reader a broken
screen. The curriculum says what is intended; the router says what exists; a reader is always
shown the second one.

---

## Every simulation runs in a numbered world

**Decided 2026-07-25.**

The seed is carried in the address bar as `?w=42`. A teacher can tell a room to type one number
and every screen matches. A surprising result can be found again instead of being lost to the
next reshuffle. Copying the link copies the picture.

This is why `rng.js` is a small deterministic generator rather than `Math.random`, and why any
lesson that changes its world must call `ctx.setSeed`.

---

## Data comes before probability

**Decided 2026-07-25, after two independent proposals converged on it.**

People already understand variation in buses, rents, prices and queues. Probability is then a
tool invented to model variation they have already seen and felt. Teaching probability first
tends to leave people believing statistics is applied coin flipping.

Two consequences that look odd on a syllabus and are deliberate. The wobble (unit 8) comes
before the bell curve (unit 9), so a reader feels estimates bounce before being told why the
bouncing has a shape. Causal thinking enters twice: informally, as soon as measurement and
comparison appear, and formally only after association and inference are in hand.

---

## Notation is earned, never issued

**Decided 2026-07-25. Binding, see VOICE.md.**

A symbol is a compression, and compression is only worth anything once there is something bulky
enough to compress. The reader does the thing, the prose says it in full English, and the symbol
arrives afterwards as shorthand for a sentence they already understand.

Unit 1 contains no symbols at all and still leaves a reader having compared two means, felt
sampling variation, and operated an axis crop.

---

## The project is called The Shape of Maybe

**Decided 2026-07-25.**

The working name was Everyone Counts. It was warm and the double meaning was exact, and it was
dropped because Oxfam already ships a free maths resource for 8 to 12 year olds under that name,
built on real-world statistics about inequality. Same name, adjacent niche. The US Census has
also used the phrase, and there is a children's counting book with the title.

The Shape of Maybe describes the change the course is trying to produce. Uncertainty stops
feeling like ignorance and acquires structure. "Maybe" is a word a child already owns, and
"shape" promises something you can look at.
