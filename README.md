# The Shape of Maybe

**Data, Chance, and Cause — a free course in statistics and mathematics, from the ground up.**

Most people were not bad at maths. They were rushed. Miss one week and the notation stops
meaning anything, and from there it is a short walk to deciding you are not a numbers person.
Almost nobody who says that is right about themselves.

This is a course built on the opposite bet: that the ideas in statistics are genuinely simple,
that notation is a compression of things you can already hold in your head, and that if you meet
the idea first and the symbol second, the symbol stops being frightening.

**Live site:** https://ihelfrich.github.io/shape-of-maybe/

---

## What it believes

**Everyone is a mathematician.** You compare, estimate, weigh risk and notice patterns all day.
The course names the thinking you already do rather than installing something foreign. The
recurring move: you do the intuitive thing, and only then are you told what it is called.

**Numbers can tell the truth or lie.** Statistics is a language, and every language can mislead.
Usually not with fabricated figures — with true figures, framed. A cropped axis, a chosen
denominator, a comparison group picked after the fact. Those techniques are not advanced and they
are not rare, so they are taught alongside the honest moves from the first unit, not quarantined
in a final chapter.

**Mathematics is beautiful.** Not beautiful as a consolation prize for being useful. There are
moments here built to be looked at.

**You can do it.** Every idea arrives as something you move with your hands before it arrives as
a symbol. If a screen makes a reader feel small, that screen is a defect.

---

## How it is built

No framework, no build step, no dependencies, no CDN, no tracking, no account. Plain ES modules
that a browser loads directly, which means the whole site works offline, loads on a slow
connection, and will still run in ten years.

```
index.html               shell: masthead, view mount, footer
app/
  main.js                boot: registers screens, builds the lesson context
  curriculum.js          the course spine as data — the map is generated from this
  core/
    router.js            hash routing; a link is just a link
    rng.js               seeded randomness (see "worlds" below)
    stats.js             the statistical functions, written to be read
    viz.js               canvas primitives; the aesthetic backbone
    ui.js                sliders, buttons, quizzes — built as instruments
    engine.js            animation loop and tweening, reduced-motion aware
  views/                 landing, map, about
  lessons/<id>/index.js  one module per lesson
docs/
  CURRICULUM.md          the full outline and the argument for its ordering
  VOICE.md               the binding writing charter
  PEDAGOGY.md            how the four principles become screen mechanics
  LESSON-TEMPLATE.md     how to build a new lesson
  DECISIONS.md           choices that shaped the project, and why
tools/
  selftest.mjs           checks every taught number against table values
  serve.py               dev server that refuses to cache
```

### Worlds

Every simulation runs in a numbered **world** — a seed, carried in the URL as `?w=42`. A teacher
can tell a room to type the same number and every screen will match. A surprising result can be
found again instead of being lost to the next reshuffle. Sharing a link shares the exact dice roll
you were looking at.

### Running it

Any static server will do:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

There is nothing to install and nothing to compile.

---

## Status

Honest version: the shell, the design system, the core libraries and the first lesson exist. The
curriculum is mapped end to end and the units are being built in the open. The map on the site
marks plainly which units are ready and which are not, and it is generated from
`app/curriculum.js`, so it cannot drift from reality.

## Contributing

Read `docs/VOICE.md` before writing a sentence and `docs/PEDAGOGY.md` before designing a screen.
Those two documents are the actual standard; the code style is the easy part.

The bar for a lesson: a reader must *do* something before they are *told* something, every unit
must contain at least one honest-versus-misleading beat, and no notation may appear before the
intuition it compresses.

Corrections to the mathematics are the most valuable contribution there is. If an explanation is
wrong, or a screen makes you feel stupid, both are bugs and both get fixed.

## Licence

Prose and lesson content: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
Code: MIT. Use it, translate it, print it, teach from it.

Built by [Ian Helfrich](https://ianhelfrich.com).
