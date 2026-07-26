/* 02-numbers/index.js
   Unit 2. The reader counts two counties' road deaths in tally strokes, divides those
   counts by three different things and watches the ranking turn over, moves the cutoff
   that decides who counts as a road death at all, and then writes two true headlines
   that blame opposite places. The only notation here is the word "per". */

/* ---------------------------------------------------------------------------
   The scenario. Two invented counties and one year of road deaths, with the
   figures chosen so that every rate comes out exact to one decimal place and the
   arithmetic can be done in the head.

   Harborside is 43 square kilometres of terraced streets behind a container port:
   600,000 residents, short trips, most of them on foot or by bus. Kestrel Valley is
   2,400 square kilometres of farmland with a highway across it, so most of the
   miles driven inside it are driven by people who live somewhere else.

   Nothing on this screen is simulated. The numbers are fixed, which is why this
   lesson never touches ctx.rng and never rolls a world. */
const HARBOUR = 'Harborside';
const VALLEY = 'Kestrel Valley';

const PLACES = [
  { name: HARBOUR, residents: 600000, miles: 1.5 },   // miles: billions of vehicle-miles in the year
  { name: VALLEY, residents: 270000, miles: 3.6 },
];

/* Three rules for who counts as a road death, and the two counties' figures under
   each. The middle one is the international standard and the one the published
   figures use, so the 18 and the 27 the reader meets first come from it. */
const RULES = [
  {
    key: 'day', label: '1 day', deaths: [13, 22],
    phrase: 'counting only the people who died within a day of the crash',
  },
  {
    key: 'd30', label: '30 days', deaths: [18, 27],
    phrase: 'counting everyone who died within 30 days of the crash',
  },
  {
    key: 'year', label: '1 year', deaths: [20, 29],
    phrase: 'counting everyone who died within a year of the crash',
  },
];
const STANDARD = RULES[1];
const DEATHS_H = STANDARD.deaths[0];   // 18
const DEATHS_V = STANDARD.deaths[1];   // 27

const one = (v) => (Math.round(v * 10) / 10).toFixed(1);
const whole = (v) => String(Math.round(v));

/* The three things the count can be divided by. `of` does the division, `show` writes
   the answer the way a person would say it, and `about` finishes the sentence "this
   figure is a claim about ...". */
const DENOMS = [
  {
    key: 'none', label: 'None',
    of: (place, deaths) => deaths,
    show: (v) => `${whole(v)} deaths`,
    bare: (v) => whole(v),
    words: 'road deaths recorded in a year',
    about: 'the size of the two totals, which is what an ambulance service has to staff for',
    max: 32, ticks: [0, 10, 20, 30], dp: 0,
  },
  {
    key: 'people', label: 'People',
    of: (place, deaths) => (deaths / place.residents) * 100000,
    show: (v) => `${one(v)} per 100,000`,
    bare: (v) => one(v),
    words: 'road deaths a year per 100,000 residents',
    about: 'the people who live there',
    max: 12, ticks: [0, 3, 6, 9, 12], dp: 1,
  },
  {
    key: 'miles', label: 'Miles',
    of: (place, deaths) => deaths / place.miles,
    show: (v) => `${one(v)} per billion`,
    bare: (v) => one(v),
    words: 'road deaths a year per billion vehicle-miles',
    about: 'the traffic the roads carry, whoever is driving it',
    max: 15, ticks: [0, 5, 10, 15], dp: 1,
  },
];
const denomBy = (key) => DENOMS.find((d) => d.key === key) || DENOMS[0];
const ruleBy = (key) => RULES.find((r) => r.key === key) || STANDARD;

/* Days between the crash and the death, one entry per person, for Harborside's
   twenty-one. Counting the entries at or below a cutoff gives 13 at one day, 18 at
   thirty and 20 at a year, which is where the three rules above come from. The last
   person is 402 days out and lands inside no rule anybody publishes. */
const DAYS = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 6, 9, 14, 27, 41, 88, 402];
/* The axis stops at 60 days rather than at the last death. Past that a day is worth
   four pixels on a phone, and the eleven people who died on the day of the crash stop
   being distinguishable from the two who died the day after. The two beyond the end are
   named in the caption instead of being drawn where nobody could count them. */
const DAY_MAX = 60;                                    // the right-hand end of the axis
const STANDARD_DAYS = 30;                              // where the published rule sits
const SAME_DAY = DAYS.filter((d) => d === 0).length;   // 11
const OFF_AXIS = DAYS.filter((d) => d > DAY_MAX);      // 88 and 402
const LATE_DAY = Math.max(...DAYS);                    // 402, outside every published rule
const ON_AXIS = DAYS.filter((d) => d <= DAY_MAX);      // 19 of the 21

/* One predicate decides the count in the readout, the dots that are drawn as counted,
   and the spoken description, so the three can never disagree with each other. */
const countedBy = (cut) => ON_AXIS.filter((d) => d <= cut).length;

/* Tally geometry, in the figure's own 0-to-1 vertical space. Three groups of five to a
   line, so 27 strokes fit two lines and stay legible on a phone. */
const PER_LINE = 3;
const TALLY_LINES = { [HARBOUR]: [0.84, 0.66], [VALLEY]: [0.32, 0.14] };
const TALLY_LABEL = { [HARBOUR]: 0.97, [VALLEY]: 0.45 };
const STROKE_H = 0.055;   // half the height of one stroke

/* ---------------------------------------------------------------------------
   Small DOM helpers, the same set 01-noticing uses. They keep the class names in one
   place per file rather than sprayed through the prose. */

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function block(...kids) {
  const b = el('div', 'block');
  b.append(...kids.filter(Boolean));
  return b;
}

function para(text) { return el('p', null, text); }
function quiet(text) { return el('p', 'small muted', text); }
function heading(text) { return el('h2', null, text); }

/* The naming move: a rule down the left in the result color, past tense, no praise. */
function named(kicker, ...paras) {
  const n = el('div', 'named');
  n.append(el('p', 'named__kicker', kicker));
  paras.forEach((t) => n.append(para(t)));
  return n;
}

/* The distortion beat gets the other treatment, and it is always operable. */
function warned(kicker, ...paras) {
  const n = el('div', 'warn');
  n.append(el('p', 'warn__kicker', kicker));
  paras.forEach((t) => n.append(para(t)));
  return n;
}

function controls(...kids) {
  const row = el('div', 'ec-controls');
  row.append(...kids.filter(Boolean));
  return row;
}

function readoutRow(...kids) {
  const row = el('div', 'ec-readouts');
  row.append(...kids.filter(Boolean));
  return row;
}

/* A box a screen reader reads out when something lands in it. It starts empty, because
   every reveal on this site is gated behind a commitment. */
function liveBox() {
  const n = el('div');
  n.setAttribute('aria-live', 'polite');
  return n;
}

/* ui.button hands back a wrapper in the contract and the bare button in the shipped
   kit; this finds the real <button> either way. */
function asButton(node) {
  if (!node) return null;
  if (typeof node.matches === 'function' && node.matches('button')) return node;
  if (typeof node.querySelector === 'function') return node.querySelector('button') || node;
  return node;
}

/* Depth blocks are native <details>: they open with no JavaScript, they print, and a
   screen reader can find them. The site-wide setting only picks the default state. */
function deeper(summaryText, ...paras) {
  const d = el('details', 'deep');
  if (document.documentElement.dataset.depth === 'deep') d.open = true;
  d.append(el('summary', null, summaryText));
  paras.forEach((t) => d.append(para(t)));
  return d;
}

/* ---------------------------------------------------------------------------
   Arithmetic the screen has to keep honest.

   The ratio quoted in prose is worked out from the two figures the screen has already
   printed rather than from the exact division, so a reader who divides the two numbers
   in front of them gets the number the sentence claims. */

function ratioOf(hi, lo, dp) {
  const p = Math.pow(10, dp);
  const a = Math.round(hi * p) / p;
  const b = Math.round(lo * p) / p;
  return b > 0 ? one(a / b) : null;
}

/* Which county comes out worse under one pairing of denominator and rule, and by how
   much. Every sentence about the flip is built from this, so the flip can never be
   asserted in prose and contradicted by a bar. */
function compare(denom, rule) {
  const a = { name: HARBOUR, v: denom.of(PLACES[0], rule.deaths[0]) };
  const b = { name: VALLEY, v: denom.of(PLACES[1], rule.deaths[1]) };
  const hi = a.v >= b.v ? a : b;
  const lo = a.v >= b.v ? b : a;
  return { a, b, hi, lo, times: ratioOf(hi.v, lo.v, denom.dp) };
}

/* ---------------------------------------------------------------------------
   Color.

   viz.js themes a figure from --viz-truth, --viz-data and their friends. tokens.css
   publishes the same four roles as --truth, --data and friends, and nothing defines
   the --viz- spelling, so a stage falls back to its frozen light-mode palette and a
   mark asked for by role name arrives as an invalid color that the canvas ignores.
   On the dark paper that lands as black on near-black. Until one commit reconciles
   the two spellings, this reads the tokens the stylesheet really has and hands viz a
   hex. Passing a hex is the path viz.js documents anyway: its reverse lookup turns a
   palette color back into a role, so these calls will theme themselves through viz
   the day the --viz- names appear.

   Read on every draw rather than once, because a reader can change scheme mid-session. */
const FALLBACK = { data: '#E8590C', truth: '#4C6EF5', ink: '#1F2024', ink2: '#5F6270' };

function palette() {
  let cs = null;
  try { cs = getComputedStyle(document.documentElement); } catch (e) { cs = null; }
  const read = (name, spare) => {
    const v = cs ? String(cs.getPropertyValue(name) || '').trim() : '';
    return v || spare;
  };
  return {
    data: read('--data', FALLBACK.data),
    truth: read('--truth', FALLBACK.truth),
    ink: read('--ink', FALLBACK.ink),
    ink2: read('--ink-2', FALLBACK.ink2),
  };
}

/* ---------------------------------------------------------------------------
   Drawing. Three figures, three grammars: strokes for a count, bars for a rate, and a
   pile of dots for the people behind one of the counts. */

function tally(st, n, lines, color) {
  const groups = Math.ceil(n / 5);
  for (let g = 0; g < groups; g++) {
    const inGroup = Math.min(5, n - g * 5);
    const row = lines[Math.floor(g / PER_LINE)];
    const x = (g % PER_LINE);
    if (row == null) continue;
    for (let i = 0; i < Math.min(4, inGroup); i++) {
      const px = x + 0.12 + i * 0.18;
      st.line([[px, row - STROKE_H], [px, row + STROKE_H]], { color: color, width: 2.5 });
    }
    // The fifth of a group is the stroke laid across the other four.
    if (inGroup === 5) {
      st.line([[x + 0.04, row - STROKE_H * 1.1], [x + 0.74, row + STROKE_H * 1.1]],
        { color: color, width: 2.5 });
    }
  }
}

function barFrame(st, denom) {
  st.domain(0.35, 2.65, 0, denom.max).pad(44, 16, 26, 28);
  /* Padding is set wide enough that neither axis has to grow it, and the y axis goes
     first because it is the one that moves the left edge. */
  st.axisY(denom.ticks, (v) => whole(v));
  st.axisX([1, 2], (v) => (v === 1 ? HARBOUR : VALLEY));
  return st;
}

function daysFrame(st, pal) {
  st.domain(-3, 62, 0, 12).pad(16, 16, 18, 30);
  st.axisX([0, 7, 14, 30, DAY_MAX], (v) => whole(v));
  st.note('days after the crash', st.W - 8, 14,
    { align: 'right', size: 11, color: pal.ink2, weight: 600 });
  return st;
}

/* Ties are stacked upwards, so eleven people who died on the day of the crash read as a
   column of eleven rather than as one dot with ten hidden underneath it. */
function pileOfDays() {
  const seen = new Map();
  return ON_AXIS.slice().sort((p, q) => p - q).map((d) => {
    const k = seen.get(d) || 0;
    seen.set(d, k + 1);
    return { day: d, x: d, y: 0.7 + k * 1.05 };
  });
}

/* ---------------------------------------------------------------------------
   One helper mounts a canvas, keeps it correct through resizes and a switch to dark
   mode, and keeps the spoken description in step with the picture. The description is
   only written when it changes, so nothing narrates itself sixty times a second.

   A canvas that is hidden or not yet laid out reports a width of zero. viz.fit() takes
   that as its cue to draw at a sane default shape and leave the element alone. */

function mountFigure(kit, opts) {
  const fig = kit.ui.figure({ caption: opts.caption, height: opts.height });
  const canvas = fig.canvas;
  canvas.setAttribute('role', 'img');
  const st = kit.stage(canvas);
  let ro = null;
  let spoken = '';
  let drawnOnce = false;
  let lastW = -1;
  let lastH = -1;

  const draw = () => {
    if (!canvas.isConnected) {
      /* Thrown away by the router: stop watching. The guard waits for one successful
         draw first, because a ResizeObserver can deliver its opening callback before
         the figure has been appended, and disconnecting there would freeze the picture
         at whatever size it happened to be built at. */
      if (drawnOnce && ro) { ro.disconnect(); ro = null; }
      return;
    }
    drawnOnce = true;
    lastW = canvas.clientWidth;
    lastH = canvas.clientHeight;
    st.fit().clear();
    opts.draw(st);
    const said = opts.describe();
    if (said !== spoken) {
      spoken = said;
      canvas.setAttribute('aria-label', said);
    }
  };

  if (typeof ResizeObserver === 'function') {
    ro = new ResizeObserver(() => {
      if (drawnOnce && canvas.clientWidth === lastW && canvas.clientHeight === lastH) return;
      draw();
    });
    ro.observe(canvas);
    kit.bin.push(() => { if (ro) { ro.disconnect(); ro = null; } });
  }
  kit.redraws.push(draw);

  return { el: fig.el, canvas, draw };
}

/* ---------------------------------------------------------------------------
   Beat 1. Two counts, drawn as strokes, and a question the counts cannot settle. */

function sectionCount(kit, state) {
  const wrap = block();
  wrap.append(heading('Which of these two places is more dangerous?'));
  wrap.append(para(
    `${HARBOUR} recorded ${DEATHS_H} road deaths last year. ${VALLEY} recorded ${DEATHS_V}. Every `
    + 'stroke below is one person, grouped in fives the way people counted things long before '
    + 'anybody wrote a number down. Nothing has been divided by anything yet.'));
  wrap.append(para('Say which of the two you would call the more dangerous place.'));

  const fig = mountFigure(kit, {
    height: 230,
    caption:
      `Road deaths recorded in one year in two invented counties, one stroke each: `
      + `${DEATHS_H} in ${HARBOUR} and ${DEATHS_V} in ${VALLEY}. The strokes are grouped in fives `
      + 'so that the two blocks can be compared without counting every one. A count drawn this '
      + 'way carries nothing about how many people live in either place, how big either place '
      + 'is, or how much traffic either one has.',
    describe: () => `Two blocks of tally strokes, one stroke for each road death recorded in the `
      + `year: ${DEATHS_H} strokes for ${HARBOUR} and ${DEATHS_V} for ${VALLEY}.`,
    draw: (st) => {
      const pal = palette();
      st.domain(-0.05, 3.05, 0, 1).pad(12, 14, 14, 12);
      const name = { align: 'left', size: 12, weight: 700, color: pal.ink2 };
      st.label(HARBOUR, 0, TALLY_LABEL[HARBOUR], name);
      st.label(VALLEY, 0, TALLY_LABEL[VALLEY], name);
      tally(st, DEATHS_H, TALLY_LINES[HARBOUR], pal.data);
      tally(st, DEATHS_V, TALLY_LINES[VALLEY], pal.data);
    },
  });

  const countH = kit.ui.readout({ label: `${HARBOUR}, deaths in the year`, value: whole(DEATHS_H), tone: 'data' });
  const countV = kit.ui.readout({ label: `${VALLEY}, deaths in the year`, value: whole(DEATHS_V), tone: 'data' });

  const answer = liveBox();
  const facts = el('div');
  let told = false;

  /* 01-noticing disables its prediction buttons once pressed, because a locked control
     downstream is waiting on them. Nothing is waiting here, so both stay live and stay
     focusable, the chosen one carries aria-pressed, and a reader who wants to read the
     other answer can go and get it. */
  let btnH = null;
  let btnV = null;

  function pick(name) {
    const chosen = name === HARBOUR ? btnH : btnV;
    state.setPick(name);
    [btnH, btnV].forEach((b) => { if (b) b.setAttribute('aria-pressed', String(b === chosen)); });
    answer.replaceChildren(para(name === VALLEY
      ? 'That is the answer the counts support, and the reasoning under it is sound: '
        + `${DEATHS_V} families lost somebody rather than ${DEATHS_H}. Hold on to it while you `
        + 'read what the counts left out.'
      : 'Neither count points that way, so you have brought something to them from outside, and '
        + 'there is something to bring. Here is the part the counts left out.'));
    if (told) return;
    told = true;
    facts.append(para(
      `${HARBOUR} is 43 square kilometres of terraced streets behind a container port. It has `
      + '600,000 residents, and vehicles covered 1.5 billion miles inside it last year. '
      + `${VALLEY} is 2,400 square kilometres of farmland with 270,000 residents, and vehicles `
      + 'covered 3.6 billion miles inside it, most of them on the highway that crosses it '
      + 'carrying traffic between two cities that are nowhere near it.'));
    facts.append(para(
      'The two counts used none of that. Counting is not at fault: a count answers how many, and '
      + 'how many is worth knowing. It is the wrong tool for the question you were handed, which '
      + 'was about danger, and danger is about how many people are exposed and for how long.'));
  }

  const first = kit.ui.button({ label: HARBOUR, kind: 'ghost', onClick: () => pick(HARBOUR) });
  const second = kit.ui.button({ label: VALLEY, kind: 'ghost', onClick: () => pick(VALLEY) });
  btnH = asButton(first.el);
  btnV = asButton(second.el);
  [btnH, btnV].forEach((b) => { if (b) b.setAttribute('aria-pressed', 'false'); });

  wrap.append(
    fig.el,
    readoutRow(countH.el, countV.el),
    controls(first.el, second.el),
    answer,
    facts,
  );
  return wrap;
}

/* ---------------------------------------------------------------------------
   Beat 2. The reader divides the same two counts by three different things and the
   ranking turns over. This is where "per" is earned. */

function sectionPerWhat(kit) {
  const wrap = block();
  wrap.append(heading('Per what?'));
  wrap.append(para(
    'The repair is division. Divide the deaths by the number of people who live there, or by the '
    + 'number of miles driven on the roads where they died, and the answer stops being about how '
    + 'big the place is. What you divide by decides what is left. Try all three settings before '
    + 'you read on.'));

  let denom = DENOMS[0];
  const seen = new Set([denom.key]);

  const valueH = kit.ui.readout({ label: HARBOUR, value: denom.show(DEATHS_H), tone: 'data', live: true });
  const valueV = kit.ui.readout({ label: VALLEY, value: denom.show(DEATHS_V), tone: 'data', live: true });
  const worst = kit.ui.readout({
    label: 'The higher of the two', value: VALLEY, tone: 'result', live: true,
  });

  const reveal = liveBox();
  const more = el('div');
  let opened = false;

  const fig = mountFigure(kit, {
    height: 250,
    caption:
      `The same ${DEATHS_H} and ${DEATHS_V} deaths, divided by three different things. Left to `
      + `right the bars are ${HARBOUR} and ${VALLEY}. On the raw count and per 100,000 residents `
      + `${VALLEY} stands taller. Per billion vehicle-miles ${HARBOUR} does, because most of the `
      + `miles driven inside ${VALLEY} are driven along one highway by people passing through. `
      + 'The axis starts at zero in all three, and no number changes between them.',
    describe: () => {
      const c = compare(denom, STANDARD);
      return `Two bars, ${HARBOUR} at ${denom.show(c.a.v)} and ${VALLEY} at ${denom.show(c.b.v)}, `
        + `measured in ${denom.words}. ${c.hi.name}'s bar is ${c.times} times the height of `
        + `${c.lo.name}'s.`;
    },
    draw: (st) => {
      const pal = palette();
      const c = compare(denom, STANDARD);
      barFrame(st, denom);
      st.bars([
        { x0: 0.65, x1: 1.35, h: c.a.v },
        { x0: 1.65, x1: 2.35, h: c.b.v },
      ], { color: pal.data, gap: 2, alpha: 0.9 });
      /* The bare figure sits on the bar and the unit stays on the axis note. Both together
         would put two 90 px labels on a 254 px canvas, and they would overlap on a phone. */
      const on = { size: 12, weight: 700, color: pal.ink };
      st.note(denom.bare(c.a.v), st.X(1), st.Y(c.a.v) - 9, on);
      st.note(denom.bare(c.b.v), st.X(2), st.Y(c.b.v) - 9, on);
      st.note(denom.words, 10, 14, { align: 'left', size: 11, color: pal.ink2, weight: 600 });
    },
  });

  /* The reveal waits until all three settings have been looked at, because the third one
     is the one that turns the order over and a naming block that arrived before it would
     be naming something the reader had not yet seen happen. */
  function openUp() {
    if (opened || seen.size < DENOMS.length) return;
    opened = true;
    reveal.append(named(
      'That move has a name',
      'A count divided by something is a rate, and the something is the denominator. Nobody '
      + 'edited the data between those three settings. Same two counts, same year, and the order '
      + 'came out both ways, because "more dangerous" was never one question. Per resident it '
      + 'asks how exposed you are if you live there. Per vehicle-mile it asks how exposed you '
      + 'are if you drive a mile there. Different people, different answers, both arithmetic.',
    ));
    more.append(para(
      `Written out in full, ${HARBOUR}'s middle figure is 3.0 road deaths a year for every `
      + '100,000 residents, and the division behind it needs no calculator: 600,000 residents is '
      + `six lots of 100,000, and ${DEATHS_H} deaths shared between six lots comes to 3 each. `
      + 'People write it as 3.0 per 100,000 per year, and every piece is doing a job. The 3.0 is '
      + 'what was left after the sharing out. The "per 100,000" says how many residents each 3.0 '
      + 'belongs to. The "per year" says how long the counting went on, because a rate with no '
      + `window on it is not a rate. The third setting reads the same way: ${HARBOUR} at `
      + `${one(DENOMS[2].of(PLACES[0], DEATHS_H))} per billion vehicle-miles per year against `
      + `${VALLEY} at ${one(DENOMS[2].of(PLACES[1], DEATHS_V))}.`));
    more.append(deeper(
      'Why there is a 100,000 bolted on',
      'The division on its own gives 0.00003 deaths per resident per year, which is correct, '
      + 'unsayable and impossible to compare by eye. Multiplying by 100,000 moves it to 3.0 and '
      + 'changes nothing else, the way quoting a price in cents rather than dollars changes no '
      + 'prices. The multiplier goes with the subject: deaths per 100,000 people, infant deaths '
      + 'per 1,000 live births, road deaths per billion vehicle-miles. Each was picked to put the '
      + 'usual answer between about 1 and 100. The consequence worth carrying is that two rates '
      + 'with different multipliers cannot be compared until one is rewritten: 3.0 per 100,000 '
      + 'and 0.4 per 10,000 look like the smaller and the larger, and they are the other way '
      + 'round.'));
    more.append(deeper(
      'Who a denominator is about',
      'A denominator is a claim about who was exposed, and it is usually the weaker half of the '
      + `figure. Vehicle-miles count vehicles. Two-thirds of the people killed on ${HARBOUR}'s `
      + 'roads were on foot or on a bike and drove none of the 1.5 billion miles they are divided '
      + 'by, so the rate files them as a hazard of driving rather than as people who were '
      + 'standing there. Person-miles would include them and are nowhere near as well measured, '
      + 'which is a fact about what is easy to count.',
      `The trouble runs the other way in ${VALLEY}, whose denominator is swollen by a highway its `
      + 'residents mostly do not use, and highway miles are the safest miles anybody drives. '
      + 'Neither rate is wrong. Both answer a question about a group that is not quite the group '
      + 'anyone has in mind.'));
  }

  const pickDenom = kit.ui.segmented({
    label: 'Divide the deaths by',
    value: denom.key,
    options: DENOMS.map((d) => ({ value: d.key, label: d.label })),
    onChange: (key) => {
      denom = denomBy(key);
      seen.add(denom.key);
      const c = compare(denom, STANDARD);
      valueH.set(denom.show(c.a.v));
      valueV.set(denom.show(c.b.v));
      worst.set(c.hi.name);
      fig.draw();
      openUp();
    },
  });

  wrap.append(
    fig.el,
    controls(pickDenom.el),
    readoutRow(valueH.el, valueV.el, worst.el),
    quiet('Three settings, one dataset. The bars redraw and the readouts follow.'),
    reveal,
    more,
  );
  return wrap;
}

/* ---------------------------------------------------------------------------
   Beat 3. The count itself turns out to have been a decision. */

function sectionRule(kit, state) {
  const wrap = block();
  wrap.append(heading('What counts as a road death?'));
  wrap.append(para(
    `The ${DEATHS_H} was not lying in the road waiting to be picked up. Somebody had to decide `
    + 'how long after a crash a death still counts as a road death, and where that line goes '
    + `changes the figure. Last year ${DAYS.length} people in ${HARBOUR} died of injuries a `
    + 'doctor put down to a crash on its roads. The dots below hold all of them except the two '
    + 'who died further out than this axis goes, one dot each, placed by the days between the '
    + 'crash and the death. Move the cutoff to where you would defend putting it, then commit '
    + 'to it.'));

  const dots = pileOfDays();
  let cut = 20;          // a starting place that is deliberately not the published rule
  let ruled = false;

  const counted = kit.ui.readout({ label: 'Deaths counted', value: whole(countedBy(cut)), tone: 'data' });
  const mine = kit.ui.readout({ label: 'Your rule', value: 'not set yet', tone: 'result', live: true });
  const printed = kit.ui.readout({ label: 'The published rule', value: 'not yet', tone: 'truth', live: true });

  const reveal = liveBox();
  const after = el('div');

  const fig = mountFigure(kit, {
    height: 260,
    caption:
      `The figure holds ${ON_AXIS.length} of the ${DAYS.length} deaths, placed by the number of `
      + `days between the crash and the death, with ties stacked upwards. Of those, ${SAME_DAY} `
      + 'happened on the day of the crash itself and make the column standing at day zero. The '
      + 'cutoff is the upright line you move: deaths to its left are inside your rule and deaths '
      + 'to its right are outside it. Two people are missing from the figure, a man who died '
      + `${OFF_AXIS[0]} days after his crash and a woman who died ${LATE_DAY} days after hers, `
      + 'both past the right-hand end of the axis. Once you commit to a cutoff, the rule the '
      + `published figures use is drawn in at ${STANDARD_DAYS} days.`,
    describe: () => {
      const n = countedBy(cut);
      const base = `A pile of ${ON_AXIS.length} people who died after a road crash, placed by the `
        + `days between the crash and the death, with ${SAME_DAY} of them on the day itself. The `
        + `cutoff sits at ${whole(cut)} days and counts ${whole(n)} of them.`;
      return ruled
        ? `${base} The published rule sits at ${STANDARD_DAYS} days and counts ${DEATHS_H}.`
        : base;
    },
    draw: (st) => {
      const pal = palette();
      daysFrame(st, pal);
      const inside = dots.filter((d) => d.day <= cut).map((d) => [d.x, d.y]);
      const outside = dots.filter((d) => d.day > cut).map((d) => [d.x, d.y]);
      st.dots(outside, { r: 4, fill: pal.ink2, alpha: 0.3 });
      st.dots(inside, { r: 4, fill: pal.data, alpha: 0.9 });
      /* Both labels hang off their own line at heights that clear each other and the
         corner note, so nothing on this figure has to be read through anything else. */
      if (ruled) {
        st.vline(STANDARD_DAYS, {
          color: pal.truth, width: 2, dash: [5, 4], label: 'the published rule', labelAt: 8.2,
        });
      }
      st.vline(cut, { color: pal.ink, width: 3, dash: 0, label: 'your cutoff', labelAt: 10.6 });
    },
  });

  const slider = kit.ui.slider({
    label: 'Counted if they died within',
    min: 0, max: DAY_MAX, step: 1, value: cut, unit: 'days',
    fmt: (v) => whole(v),
    onInput: (v) => {
      // Clamped rather than trusted: a cutoff past the end of the axis would count
      // people the figure does not draw, and the readout beside it would stop matching.
      cut = Math.min(DAY_MAX, Math.max(0, Math.round(Number(v)) || 0));
      counted.set(whole(countedBy(cut)));
      fig.draw();
    },
  });

  const commit = kit.ui.button({
    label: 'Count it this way',
    kind: 'primary',
    onClick: () => {
      const firstTime = !ruled;
      ruled = true;
      const n = countedBy(cut);
      mine.set(`${whole(cut)} days, ${whole(n)} deaths`);
      printed.set(`${STANDARD_DAYS} days, ${DEATHS_H} deaths`);
      state.setRule({ days: cut, count: n });
      fig.draw();
      if (!firstTime) return;
      reveal.append(named(
        'That rule has a name',
        'The sentence you just wrote is an operational definition: the rule that turns something '
        + 'in the world into something countable. Nobody in that figure changed while you moved '
        + 'the line. The injuries were the same injuries and the days were the same days. What '
        + 'moved was the sentence, and the count moved with it.',
        `The rule almost every country uses is ${STANDARD_DAYS} days, which is where the `
        + `${DEATHS_H} you have been dividing all this time came from. It is a convention rather `
        + 'than a discovery, and it exists so that two countries counting the same kind of event '
        + 'report the same kind of number. The OECD road safety database, IRTAD, is where it is '
        + 'written down for the countries that report to it.',
      ));
      after.append(para(
        'The cost turns up somewhere nobody looks. Trauma care has improved enormously since the '
        + 'definition was settled, and one thing it does is move people across the boundary: a '
        + 'patient who would have died on day 20 in 1985 and now dies on day 40 is one fewer road '
        + `death and one more of something else, with no crash prevented. The woman at `
        + `${LATE_DAY} days is the far end of the same problem, and she is in nobody's road death `
        + 'figure, including the ones on this page.'));
      after.append(deeper(
        `Where the ${STANDARD_DAYS} days comes from, and what it costs`,
        'Comparability, mostly. A death is a clear event and the link back to a crash is not, so '
        + 'somebody had to draw a line, and it had to be the same line everywhere or the '
        + 'international tables would be measuring definitions rather than roads. Countries that '
        + 'once counted only the deaths inside the first 24 hours published a correction factor '
        + 'beside their figures, a multiplier whose whole job was to undo their own definition.',
        `The cost is that the boundary is arbitrary exactly where it works hardest. Somebody who `
        + `dies on day ${STANDARD_DAYS - 1} is a road death and somebody who dies on day `
        + `${STANDARD_DAYS + 1} is not, and no medical fact stands between them. That argues for `
        + 'knowing which rule produced a number rather than for having no rule, because the '
        + 'alternative is comparing two figures that were never counting the same thing.'));
    },
  });

  wrap.append(
    fig.el,
    controls(slider.el, commit.el),
    readoutRow(counted.el, mine.el, printed.el),
    quiet('You can move the cutoff and press again as often as you like. The rule is yours.'),
    reveal,
    after,
  );
  return wrap;
}

/* ---------------------------------------------------------------------------
   Beat 4: the same argument, a long way from any county. */

function sectionApply(kit) {
  const wrap = block();
  wrap.append(heading('The same argument, about airplanes'));
  wrap.append(para(
    'Flying gets compared with driving constantly, and the comparison turns on a denominator '
    + 'nobody prints. Per mile traveled, flying comes out far safer, because an airplane covers '
    + 'a great many miles in one trip. Per journey the gap narrows sharply, because a journey is '
    + 'a journey whether it runs 300 miles or 3. Michael Blastland and David Spiegelhalter work '
    + 'this through in The Norm Chronicles, by the mile, by the journey and by the hour, and the '
    + 'ordering is not the same in all three.'));

  wrap.append(kit.ui.quiz({
    question: 'A newspaper wants one sentence on whether flying is safer than driving. Which '
      + 'sentence is it entitled to print?',
    options: [
      {
        label: 'Flying is safer. The deaths per mile traveled are far lower.',
        correct: false,
        why: 'Per mile is the denominator most safety statistics use, the gap on that measure is '
          + 'enormous, and this is the sentence most papers run. What it hides is that nobody '
          + 'chooses a mile. Somebody deciding between flying to Glasgow and driving there is '
          + 'choosing a journey, and per mile is the denominator that flatters whatever covers '
          + 'the most ground fastest.',
      },
      {
        label: 'Neither is safer. The two rates point opposite ways, so the comparison is '
          + 'meaningless.',
        correct: false,
        why: 'The instinct here is a good one, and in most of life it is right: two measures '
          + 'pointing different ways usually means somebody has made a mistake. Nobody has. Both '
          + 'rates are correct, and giving up on the comparison throws away the usable part, '
          + 'which is that the answer depends on what is being chosen between.',
      },
      {
        label: 'Flying is safer per mile traveled. Whether it is safer for the trip you are '
          + 'about to take depends on how long the drive would be.',
        correct: true,
        why: 'It carries its denominator, and it turns the rate back into the decision the '
          + 'reader is actually making. It is also the only one of the three that a reader can '
          + 'do anything with.',
      },
    ],
  }).el);

  return wrap;
}

/* ---------------------------------------------------------------------------
   Beat 5: the reader performs the distortion, using only true numbers. */

function sectionHeadline(kit) {
  const wrap = block();
  wrap.append(heading('Two headlines, both true'));
  wrap.append(para(
    'The same two counties and the same year, with two switches. One picks what the deaths get '
    + 'divided by. The other picks the rule for who counts as a road death at all. Every '
    + 'combination writes a sentence that is arithmetically correct, and the sentences disagree '
    + 'about who the story is about.'));

  let denom = DENOMS[1];
  let rule = STANDARD;

  const valueH = kit.ui.readout({ label: HARBOUR, value: '', tone: 'data', live: true });
  const valueV = kit.ui.readout({ label: VALLEY, value: '', tone: 'data', live: true });

  const card = liveBox();
  const chose = liveBox();

  function headline() {
    const c = compare(denom, rule);
    if (denom.key === 'none') {
      return `${c.hi.name} recorded more road deaths last year than ${c.lo.name}`;
    }
    if (denom.key === 'people') {
      return `${c.hi.name} is ${c.times} times as deadly on the roads as ${c.lo.name}`;
    }
    return `${c.hi.name} has the more dangerous roads to drive on, at ${c.times} times the rate `
      + `of ${c.lo.name}`;
  }

  function write() {
    const c = compare(denom, rule);
    valueH.set(denom.show(c.a.v));
    valueV.set(denom.show(c.b.v));
    const box = el('div', 'warn');
    box.append(el('p', 'warn__kicker', 'The headline that follows'));
    box.append(el('h3', null, headline()));
    box.append(para(`Every figure in that sentence is right, ${rule.phrase}. It is a claim about `
      + `${denom.about}.`));
    card.replaceChildren(box);
  }

  const pickDenom = kit.ui.segmented({
    label: 'Divide the deaths by',
    value: denom.key,
    options: DENOMS.map((d) => ({ value: d.key, label: d.label })),
    onChange: (key) => { denom = denomBy(key); write(); },
  });

  const pickRule = kit.ui.segmented({
    label: 'Counted if they died within',
    value: rule.key,
    options: RULES.map((r) => ({ value: r.key, label: r.label })),
    onChange: (key) => { rule = ruleBy(key); write(); },
  });

  const printPeople = kit.ui.button({
    label: 'Print the residents one',
    kind: 'ghost',
    onClick: () => chose.replaceChildren(para(
      'That one is about the people who live there. It is the figure a county leader answers '
      + 'for at an election and the figure that sends a road safety budget somewhere. It also '
      + `holds ${VALLEY}'s 270,000 residents to account for a highway they mostly do not drive on.`)),
  });

  const printMiles = kit.ui.button({
    label: 'Print the miles one',
    kind: 'ghost',
    onClick: () => chose.replaceChildren(para(
      'That one is about the traffic rather than the residents. It is the figure a driver '
      + 'picking a route for tonight would want, and it drops everybody who was not in a vehicle '
      + `out of the denominator, which in ${HARBOUR} is two-thirds of the people who died.`)),
  });

  write();

  wrap.append(
    controls(pickDenom.el, pickRule.el),
    readoutRow(valueH.el, valueV.el),
    card,
    para('Two of those headlines point at opposite counties. If you had one front page, which '
      + 'would you run?'),
    controls(printPeople.el, printMiles.el),
    chose,
    warned(
      'Same year, same deaths, opposite villains',
      'No false number is needed anywhere in that. The deaths are the same deaths under both '
      + 'headlines and the arithmetic is one division either way. The move is not printing a '
      + 'wrong figure. It is printing a right figure with its denominator quietly left off, so '
      + 'the reader fits one from their own head, and the one they fit is nearly always per '
      + 'person.',
      'You will do this without meaning to, because a rate arrives already divided and the '
      + 'division is the part nobody reads aloud. The habit that catches it is small: before a '
      + 'figure goes into a sentence of yours, say the whole thing out loud, denominator '
      + 'included. Anything you cannot finish is a number you have not finished reading.',
    ),
    para(
      'No denominator is always the honest one, which is what makes this hard rather than '
      + 'tedious. Per resident is right for deciding where to put an ambulance station and wrong '
      + 'for deciding which road to drive down tonight. The question is never whether a rate was '
      + 'divided by the wrong thing. It is whether the thing it was divided by matches the '
      + 'decision somebody is about to make with it.'),
  );
  return wrap;
}

/* ---------------------------------------------------------------------------
   The close: four plain-word descriptions of what happened, each with the term the rest
   of the world uses for it and the unit that picks it up. */

function sectionRecap(kit, state) {
  const wrap = block();
  wrap.append(heading('Four things you did'));
  wrap.append(para(
    'One symbol arrived on this screen and it was the word "per". The rest was division and a '
    + 'decision about who to include, and both keep working when the notation starts in '
    + '05-spread.'));

  const perPeople = compare(denomBy('people'), STANDARD);
  const perMiles = compare(denomBy('miles'), STANDARD);

  const steps = kit.ui.steps([
    {
      title: 'You counted',
      body: `Two blocks of strokes, ${DEATHS_H} and ${DEATHS_V}, grouped in fives so they could `
        + 'be compared without going through them one at a time. A bare count is a frequency, and '
        + 'it is the only figure here that needed no division. Unit 03-pile is what to do when '
        + 'there are 400 of them rather than two.',
    },
    {
      title: 'You divided, and the order turned over',
      body: 'A count divided by something is a rate, and the something is the denominator. Per '
        + `100,000 residents, ${perPeople.hi.name} runs at ${perPeople.times} times the rate of `
        + `${perPeople.lo.name}. Per billion vehicle-miles, ${perMiles.hi.name} runs at `
        + `${perMiles.times} times the rate of ${perMiles.lo.name}. Neither is a correction of `
        + 'the other.',
    },
    {
      title: 'You decided who counted',
      body: 'A cutoff moved and the count moved with it. The rule that turns something in the '
        + 'world into something countable is its operational definition, and every published '
        + 'figure has one whether or not it is printed anywhere near the figure.',
    },
    {
      title: 'You wrote two true headlines that blamed opposite places',
      body: 'One set of facts, one year, two denominators, two villains, and no false number in '
        + 'either sentence. Unit 16-rhetoric is this toolkit turned around: reading the claims '
        + 'other people make, and writing ones that survive being checked.',
    },
  ]);
  for (let i = 0; i < 4; i++) steps.reveal(i);
  wrap.append(steps.el);

  /* The screen only quotes a choice once the reader has made it, so the close never
     invents a decision for them. */
  const yours = liveBox();
  state.onPick((name) => {
    yours.replaceChildren(para(
      `You called ${name} the more dangerous of the two before you knew how many people lived in `
      + 'either place. That was not a guess. It was the only question the counts could answer at '
      + 'the time.'));
  });
  const rule = liveBox();
  state.onRule((r) => {
    rule.replaceChildren(para(r.count === DEATHS_H
      ? `Your rule counted anyone who died within ${whole(r.days)} days of the crash, which comes `
        + `to the same ${DEATHS_H} the published figures use.`
      : `Your rule counted anyone who died within ${whole(r.days)} days of the crash, which came `
        + `to ${whole(r.count)} deaths where the published rule counts ${DEATHS_H}.`));
  });
  wrap.append(yours, rule);

  wrap.append(para(
    `One thing this unit did not do: it treated ${DEATHS_H} and ${DEATHS_V} as facts about two `
    + 'places rather than as one year each. Both are small counts, and a small count wanders from '
    + 'year to year for no reason anybody could point at. Unit 08-wobble is about how far. '
    + 'Nothing here rested on the gap between them being real, because every flip came from the '
    + 'denominator rather than from the counts.'));

  wrap.append(para(
    'Asking "per what" costs about a second and it is the cheapest habit in this course. The '
    + 'second cheapest is asking what a count had to decide before it could be a count.'));

  const link = el('a', 'ec-btn', 'Back to the map');
  link.href = '#/map';
  /* .ec-btn has no display of its own, so an anchor needs one to keep the 44 px target it
     was designed with. router.js does the same three lines for the same reason. */
  link.style.display = 'inline-flex';
  link.style.alignItems = 'center';
  link.style.textDecoration = 'none';
  wrap.append(link);
  return wrap;
}

/* ---------------------------------------------------------------------------
   Assembly. render() is called with an empty root every time the reader arrives,
   including on a second visit, so every piece of state below is built fresh here and
   nothing mutable lives at module scope. */

function head() {
  const h = el('div', 'prose lesson__head');
  h.append(el('p', 'kicker', 'Unit 2 · about 18 minutes'));
  h.append(el('h1', null, 'What a number leaves out'));
  h.append(el('p', 'lesson__q', 'How do I put a number on something real, and what does the number cost?'));
  h.append(el('p', 'lede',
    `Two counties published their road deaths for the year: ${DEATHS_H} in one, `
    + `${DEATHS_V} in the other. Both figures are correct and both are about to change places. `
    + 'Neither one, on its own, tells you which of the two you would rather cross the road in, '
    + 'and getting from a published figure to that question is the work of this unit.'));
  h.append(quiet(
    'Both counties are invented and so is every figure below. Nothing here is simulated and '
    + 'there is no world number to roll: everybody reading this page sees the same figures, and '
    + 'all the arithmetic can be checked by hand.'));
  return h;
}

/* The two things that cross a section boundary: which county the reader called more
   dangerous before they knew anything, and the cutoff they set for who counts as a road
   death. The close reads back whichever of them exists. */
function makeState() {
  const onPick = [];
  const onRule = [];
  return {
    pick: null,
    rule: null,
    onPick(fn) { onPick.push(fn); if (this.pick != null) fn(this.pick); },
    setPick(v) { this.pick = v; onPick.forEach((fn) => fn(v)); },
    onRule(fn) { onRule.push(fn); if (this.rule != null) fn(this.rule); },
    setRule(v) { this.rule = v; onRule.forEach((fn) => fn(v)); },
  };
}

function render(root, ctx) {
  const ui = ctx.ui;
  const stage = ctx.stage || (ctx.viz && ctx.viz.stage);

  if (!ui || !stage) {
    throw new Error('02-numbers needs ui and a drawing stage on the lesson context.');
  }

  /* Nothing on this screen is simulated and nothing on it moves, so the kit asks for no
     generator and no clock, and ctx.stats goes untouched: the only arithmetic in the unit
     is division the reader is meant to check by hand. The world number and the writer for
     it are carried anyway, so that the day somebody adds a rolled figure to this unit the
     wiring is where it is in every other lesson. */
  const kit = {
    ui,
    stage,
    seed: ctx.seed == null ? 42 : ctx.seed,
    setSeed: typeof ctx.setSeed === 'function' ? ctx.setSeed : null,
    bin: [],       // teardown jobs
    redraws: [],   // one per figure
  };

  const state = makeState();

  const body = el('div', 'lesson__body');
  body.append(
    sectionCount(kit, state),
    sectionPerWhat(kit),
    sectionRule(kit, state),
    sectionApply(kit),
    sectionHeadline(kit),
    sectionRecap(kit, state),
  );
  root.append(head(), body);

  /* Canvases can only measure themselves once they are on the page. */
  const repaint = () => { kit.redraws.forEach((draw) => draw()); };
  repaint();

  /* viz.js holds the colors it read out of the stylesheet for a fraction of a second, so
     a redraw fired the instant the scheme changes can still be painting in the old
     palette. Paint now, and again once that cache has certainly expired, because two of
     these three figures never redraw on their own. */
  let latePaint = 0;
  const scheme = window.matchMedia('(prefers-color-scheme: dark)');
  const onScheme = () => {
    repaint();
    clearTimeout(latePaint);
    latePaint = setTimeout(repaint, 600);
  };
  scheme.addEventListener('change', onScheme);
  kit.bin.push(() => { scheme.removeEventListener('change', onScheme); clearTimeout(latePaint); });

  /* The router empties the mount with replaceChildren and tells nobody, and it does that
     on a go() to the page we are already on, which fires no hashchange at all. So the
     lesson watches the mount and packs up the moment its own body stops being part of the
     page. Watching our own node rather than the event means a lesson rendered twice into
     the same mount never tears down the copy still on screen. */
  let watcher = null;
  let packed = false;
  const packUp = () => {
    if (packed) return;
    packed = true;
    if (watcher) watcher.disconnect();
    kit.bin.forEach((job) => job());
    kit.bin.length = 0;
  };
  if (typeof MutationObserver === 'function') {
    watcher = new MutationObserver(() => { if (!body.isConnected) packUp(); });
    watcher.observe(root, { childList: true });
  }
}

export default {
  id: '02-numbers',
  unit: 'I',
  title: 'What a number leaves out',
  question: 'How do I put a number on something real, and what does the number cost?',
  minutes: 18,
  render,
};
