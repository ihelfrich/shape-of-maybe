/* 03-pile/index.js
   Unit 3. Two hundred and forty rents arrive one at a time, too fast to hold, then fall
   into columns and turn out to be two crowds rather than one. The reader sorts four
   unlabelled piles by shape, and then turns a bin dial until the second crowd disappears
   from a chart that never stops telling the truth. */

/* Every figure here draws from its own named stream, so that two of them can never
   accidentally share a sequence, and that needs the factory rather than the single
   generator ctx.rng hands over. main.js passes it as ctx.makeRng, and this import is the
   guarantee the lesson still works if it ever stops doing so. */
import { makeRng as coreMakeRng } from '../../core/rng.js';

/* ---------------------------------------------------------------------------
   The scenario. Two hundred and forty apartments advertised to let in one town in one
   month, priced in dollars a month.

   The town is invented, and it is invented with a shape: an older housing stock
   around $700, a new development around $1,250, and a short tail of expensive
   apartments above that. The group sizes are fixed rather than drawn, so the two
   crowds are there in every world and no sentence on this screen depends on a
   lucky roll. The rents inside each group do change with the world. */
const N_OLD = 144;       // apartments in the older stock
const N_NEW = 82;        // apartments in the new development
const N_TOP = 14;        // the expensive tail
const N_APARTMENTS = N_OLD + N_NEW + N_TOP;   // 240

const OLD_MU = 700;      // $ a month, center of the older stock
const OLD_SD = 92;
const NEW_MU = 1250;     // $ a month, center of the new development
const NEW_SD = 110;
const TOP_FROM = 1450;   // $ a month, where the tail starts
const TOP_SPAN = 560;

const RENT_LO = 400;     // $ a month; the axis never moves in this unit
const RENT_HI = 2100;
const GAP_AT = 1000;     // $ a month, the thin patch between the two crowds
const NEAR_MEAN = 50;    // $ a month; how near the average counts as near, in the closing line

const FALL_BIN = 60;     // $; the bin width the first figure stacks into
const BIN_MIN = 15;      // $; the dial's ends
const BIN_MAX = 500;
const BIN_STEP = 5;

/* A hump is counted when the columns climb to a top and then fall away by at least
   this share of the tallest column before climbing again. The share is a choice, it
   is written on the screen beside the count, and it was set by counting: across 600
   worlds at the dial's opening width, 595 of them come out at two humps, and every
   world comes out at one by the time the bins are $450 wide. */
const HUMP_SHARE = 0.25;

const READ_SECONDS = 5;  // how long the whole list takes to go past
const READ_WORD = 'five';   // the same number in prose, where the charter wants it spelled
const FALL_MS = 950;
const FALL_STAGGER = 0.34;   // share of the fall the top of a column waits out

/* $1,234, with no dependence on the reader's locale. */
const money = (v) => '$' + String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;
/* A falling thing arrives fast and settles slowly. */
const settle = (t) => 1 - Math.pow(1 - t, 3);

/* ---------------------------------------------------------------------------
   Small DOM helpers, the same set unit 01-noticing uses. Lessons build real nodes
   and wire them; there is no template language here and nothing to compile. */

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

/* The naming move gets one treatment across the whole site: a rule down the left in
   the result color, past tense, no praise. */
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

/* A box a screen reader reads out when something lands in it. It starts empty,
   because every reveal on this site is gated behind a commitment. */
function liveBox() {
  const n = el('div');
  n.setAttribute('aria-live', 'polite');
  return n;
}

/* ui.button hands back a wrapper node in the contract and the bare button in the
   shipped kit; this finds the real <button> either way. */
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
   The rents, and the arithmetic of counting them into boxes. */

/* Clamped to the axis that will draw them: viz.js does not clip a stray value, it
   draws it off the side where nobody can count it. The clamps bite on well under one
   apartment in a thousand, which is cheaper than a caption that says 240 above a picture
   holding 239. */
const clipRent = (v) => Math.round(Math.min(RENT_HI - 40, Math.max(RENT_LO + 20, v)));

function townRents(kit) {
  const r = kit.makeRng(`03-pile/rents/${kit.seed}`);
  const out = [];
  for (let i = 0; i < N_OLD; i++) out.push(clipRent(r.n(OLD_MU, OLD_SD)));
  for (let i = 0; i < N_NEW; i++) out.push(clipRent(r.n(NEW_MU, NEW_SD)));
  /* A tail, not a third crowd: dense where it joins the new development and thinning
     out all the way to the top of the axis. */
  for (let i = 0; i < N_TOP; i++) out.push(clipRent(TOP_FROM + TOP_SPAN * Math.pow(r.u(), 1.6)));
  /* Shuffled, because the reader watches them arrive. A list that came in sorted by
     type would give the shape away before the first dot landed. */
  return r.shuffle(out);
}

const binCountOf = (width) => Math.max(1, Math.ceil((RENT_HI - RENT_LO) / width));

function binIndex(value, width, bins) {
  const k = Math.floor((value - RENT_LO) / width);
  return Math.min(bins - 1, Math.max(0, k));
}

function countInto(values, width) {
  const bins = binCountOf(width);
  const counts = new Array(bins).fill(0);
  for (const v of values) counts[binIndex(v, width, bins)] += 1;
  return counts;
}

function barsFrom(counts, width) {
  return counts.map((h, i) => ({
    x0: RENT_LO + i * width, x1: RENT_LO + (i + 1) * width, h,
  }));
}

/* How many humps the picture shows, under the rule quoted in the caption: walk the
   columns, and count a top only once the picture has fallen away from it by a quarter
   of the tallest column. Bins outside the axis hold nothing, so the walk starts and
   ends at zero and the last top is always settled.

   One rule, so that the number in the readout and the number in the prose can never
   disagree about the same picture. */
function humpsIn(counts) {
  const top = counts.length ? Math.max(...counts) : 0;
  if (top <= 0) return 0;
  const drop = Math.max(1, HUMP_SHARE * top);
  let found = 0;
  let rising = true;
  let peak = -Infinity;
  let valley = Infinity;
  for (const v of [0, ...counts, 0]) {
    if (rising) {
      if (v > peak) peak = v;
      else if (peak - v >= drop) { found += 1; rising = false; valley = v; }
    } else if (v < valley) valley = v;
    else if (v - valley >= drop) { rising = true; peak = v; }
  }
  return found;
}

/* One phrase for a hump count, so the readout, the spoken description and the prose can
   never word the same number three ways. */
const humpPhrase = (k) => (k === 1 ? 'one hump' : `${k} humps`);

/* Axis labels for a count: whole numbers from zero up, four or five of them. */
function countTicks(top) {
  const raw = Math.max(1, top) / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const out = [];
  for (let v = 0; v <= top + 1e-9; v += step) out.push(Math.round(v));
  return out;
}

/* Everything the prose is allowed to quote about this town, worked out once from the
   rents themselves. A sentence built from a number in here cannot go stale, because
   nothing on the screen can change any of them. */
function describeTown(kit) {
  const values = townRents(kit);
  const iqr = kit.stats.quantile(values, 0.75) - kit.stats.quantile(values, 0.25);
  const sd = kit.stats.sd(values);
  const mean = kit.stats.mean(values);
  const cubeRoot = Math.pow(values.length, 1 / 3);
  return {
    values,
    n: values.length,
    lo: kit.stats.min(values),
    hi: kit.stats.max(values),
    mean,
    median: kit.stats.median(values),
    sd,
    underGap: values.filter((v) => v < GAP_AT).length,
    nearMean: values.filter((v) => Math.abs(v - mean) <= NEAR_MEAN).length,
    // The two rules most charting software reaches for. Both are quoted in a depth
    // block, and both are computed here rather than looked up, so the width printed
    // is the width this town actually asks for.
    fdWidth: (2 * iqr) / cubeRoot,
    scottWidth: (3.49 * sd) / cubeRoot,
  };
}

/* ---------------------------------------------------------------------------
   One helper mounts a canvas, keeps it correct through resizes and a switch to dark
   mode, and keeps the spoken description in step with the picture. The description is
   only written when it changes, so a falling pile does not narrate itself sixty times
   a second to a screen reader.

   A canvas that is hidden or not yet laid out reports a width of zero. viz.fit() takes
   that as its cue to draw at a sane default shape and leave the element alone, so there
   is nothing to guard against here and the real numbers arrive on the frame after the
   figure becomes visible. */

function mountFigure(kit, opts) {
  const fig = kit.ui.figure({ caption: opts.caption, height: opts.height });
  const canvas = fig.canvas;
  canvas.setAttribute('role', 'img');
  /* ui.figure points the canvas at its caption, and aria-labelledby outranks the
     aria-label written below, which would leave a moving picture with a fixed
     description. The caption stays on the page and stays in the accessibility tree as
     the figure's caption; what the canvas itself says is now this lesson's job. */
  canvas.removeAttribute('aria-labelledby');
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
   Beat 1 and 2. The list goes past too fast to hold, the reader says what they think
   the town looks like, and then the dots fall into columns. */

function sectionArrive(kit, town) {
  const wrap = block();
  wrap.append(heading('Here come 240 rents, one at a time'));
  wrap.append(para(
    'They arrive in the order the agent listed them, one dot for each apartment, sitting at its own '
    + `rent on an axis running from ${money(RENT_LO)} to ${money(RENT_HI)} a month. The whole list `
    + `takes about ${READ_WORD} seconds. Watch it go past rather than trying to keep up with it.`));

  const values = town.values;
  const bins = binCountOf(FALL_BIN);
  const filled = new Array(bins).fill(0);
  /* Where each apartment ends up: which column, and how far up that column. Fixed now, so
     the fall lands in the same place every time it is replayed. */
  const slots = values.map((v) => {
    const b = binIndex(v, FALL_BIN, bins);
    const level = filled[b];
    filled[b] += 1;
    return { b, level };
  });
  /* Headroom above the tallest column, so the strewn dots have a band of their own to
     sit in and the fall is a fall rather than a shuffle. */
  const tallest = Math.max(...filled);
  const YTOP = tallest * 1.32 + 1;
  const BAND = YTOP * 0.85;      // where the dots sit before they fall
  const BAND_J = YTOP * 0.05;

  const jitter = kit.makeRng(`03-pile/strip/${kit.seed}`);
  const stripY = values.map(() => BAND + (jitter.u() * 2 - 1) * BAND_J);

  let arrived = 0;          // dots on screen during the reading
  let mix = 0;              // 0 strewn along the axis, 1 stacked into columns
  let mode = 'waiting';     // waiting, reading, strewn, falling, piled
  let stopRead = null;
  let cancelFall = null;
  /* Declared above the controls that write to them: a ui implementation that fired a
     callback once during construction would otherwise hit the temporal dead zone and
     take the whole screen down. */
  let stackEl = null;
  const guessButtons = [];

  function dotAt(i) {
    const s = slots[i];
    const wait = FALL_STAGGER * (s.level / Math.max(1, tallest));
    const t = settle(clamp01((mix - wait) / (1 - FALL_STAGGER)));
    const home = RENT_LO + (s.b + 0.5) * FALL_BIN;
    return [lerp(values[i], home, t), lerp(stripY[i], s.level + 0.5, t)];
  }

  const spokenStrip = () => `Two hundred and forty rents strewn along an axis from ${money(RENT_LO)} `
    + `to ${money(RENT_HI)} a month, one dot for each apartment, at a height that means nothing. Below `
    + '$900 they overlap so heavily that the dots run into one dark band.';
  const spokenPile = () => `${bins} columns of dots, one column for every ${money(FALL_BIN)} of rent. `
    + `The columns rise to a tall mass around ${money(OLD_MU)} a month, drop to almost nothing near `
    + `${money(GAP_AT)}, rise again to a smaller mass around ${money(NEW_MU)}, and trail off to a `
    + `few apartments above $1,500. ${town.underGap} of the ${town.n} rents are under ${money(GAP_AT)} a `
    + `month and ${town.n - town.underGap} are above it.`;

  const fig = mountFigure(kit, {
    height: 300,
    caption:
      `The ${N_APARTMENTS} monthly rents, in dollars a month, invented for this unit and drawn in world `
      + `${kit.seed}. One dot is one apartment. Along the top each dot sits at its own rent and its `
      + 'height means nothing, which is why the crowded stretch cannot be counted by eye. Stacking '
      + `drops every dot into a column ${money(FALL_BIN)} wide, and a column's height is then the `
      + 'number of apartments renting for somewhere inside it.',
    describe: () => {
      if (mode === 'waiting') return `An empty axis running from ${money(RENT_LO)} to ${money(RENT_HI)} a month, waiting for the list.`;
      if (mode === 'reading') return 'Rents landing one at a time, too fast to follow individually.';
      if (mode === 'strewn') return spokenStrip();
      if (mix < 0.995) return 'The dots are dropping into columns.';
      return spokenPile();
    },
    draw: (st) => {
      st.domain(RENT_LO, RENT_HI, 0, YTOP).pad(44, 14, 16, 30);
      /* Padding is set wide enough that neither axis has to grow it, so the picture
         does not shift sideways when the count axis arrives halfway through the fall. */
      if (mix > 0.6) st.axisY(countTicks(tallest), (v) => String(v));
      st.axisX(5, (v) => money(v));
      const pads = st.pads;
      const pitch = Math.max(1, (st.H - pads.t - pads.b) / YTOP);
      const colW = Math.max(1, (st.W - pads.l - pads.r) / bins);
      const r = Math.max(1.2, Math.min(3.4, pitch * 0.42, colW * 0.42));
      const pts = [];
      const shown = mode === 'reading' ? arrived : (mode === 'waiting' ? 0 : values.length);
      for (let i = 0; i < shown; i++) pts.push(dotAt(i));
      st.dots(pts, { r, fill: 'data', alpha: 0.78 });
      if (mix > 0.6) st.note('number of apartments', 8, 12, { align: 'left', size: 11, color: 'ink2', weight: 600 });
      st.note('rent, $ a month', st.W - 8, 12, { align: 'right', size: 11, color: 'ink2', weight: 600 });
    },
  });

  const read = kit.ui.readout({ label: 'Rents read', value: `0 of ${N_APARTMENTS}`, tone: 'plain' });
  /* Not spoken. Both of these change forty times a second while the list is running,
     and a polite live region would try to read every one of them out. */
  const latest = kit.ui.readout({ label: 'The one just read', value: 'none yet', tone: 'data' });

  const afterRead = liveBox();

  /* streamed says whether the reader actually watched the list go past. It is false for
     somebody who went straight to the stacking, and false for a reader who asked for
     reduced motion and got the whole list in one frame, so neither of them is told they
     watched something they did not. */
  function finishRead(streamed) {
    mode = 'strewn';
    fig.draw();
    if (afterRead.childElementCount) return;
    afterRead.append(para(
      (streamed
        ? `Two hundred and forty numbers went past in ${READ_WORD} seconds and you kept almost none `
          + 'of them. Nobody keeps them, which is the whole reason data gets drawn rather than '
          + 'read. '
        : `There are ${N_APARTMENTS} numbers on that axis now and no holding them, which is the whole `
          + 'reason data gets drawn rather than read. ')
      + `A list hands you one number at a time. A picture hands you all ${N_APARTMENTS} at once and asks `
      + 'about the shape they make together.'));
    afterRead.append(para(
      'Every dot is still on the screen, and the screen is still not much use. Down in the crowded '
      + 'stretch the dots are sitting on top of each other, so a thick patch might be forty apartments '
      + 'or a hundred and forty, and there is no way to tell which by looking.'));
  }

  function runRead() {
    if (stopRead) { stopRead(); stopRead = null; }
    if (cancelFall) { cancelFall(); cancelFall = null; }
    mode = 'reading';
    arrived = 0;
    mix = 0;
    const engine = kit.engine;
    const still = engine && typeof engine.prefersReducedMotion === 'function'
      ? engine.prefersReducedMotion()
      : Boolean(engine && engine.reducedMotion);

    if (!engine || typeof engine.loop !== 'function' || still) {
      /* No animation: the whole list lands at once. Nothing is taught by the motion
         that the strewn picture and the paragraph underneath do not also say. */
      arrived = values.length;
      read.set(`${N_APARTMENTS} of ${N_APARTMENTS}`);
      latest.set(`${money(values[values.length - 1])} a month`);
      finishRead(false);
      return;
    }

    stopRead = engine.loop((dt, elapsed) => {
      const next = Math.min(values.length, Math.floor((elapsed / READ_SECONDS) * values.length));
      if (next !== arrived) {
        arrived = next;
        read.set(`${arrived} of ${N_APARTMENTS}`);
        if (arrived > 0) latest.set(`${money(values[arrived - 1])} a month`);
      }
      fig.draw();
      if (arrived >= values.length) {
        if (stopRead) { stopRead(); stopRead = null; }
        finishRead(true);
      }
    });
  }

  const readBtn = kit.ui.button({ label: 'Read the list out', kind: 'primary', onClick: runRead });

  const guessSay = liveBox();

  const GUESSES = [
    {
      label: 'One clump',
      why: 'That is the commonest reading of a strip like this one, and the strip earns it: the '
        + 'left-hand mass is dense enough to read as one solid block. What the columns add is how '
        + 'many apartments are in each part of that block.',
    },
    {
      label: 'Two clumps',
      why: 'Then you are reading the thin patch on the right of the dense stretch, which is the '
        + 'only clue a strip this crowded gives away. The columns are about to say whether it '
        + 'holds up.',
    },
    {
      label: 'Spread out evenly',
      why: 'Worth checking, and a strip plot invites it: once dots overlap they stop showing how '
        + 'many are underneath, and a heavy stretch flattens into a band. The columns count what '
        + 'the band is hiding.',
    },
    {
      label: 'Could not tell',
      why: 'That is the honest answer to two hundred and forty overlapping dots, and it is the '
        + 'reason the next button exists.',
    },
  ];

  function predict(i) {
    guessButtons.forEach((b) => {
      if (!b) return;
      const hadFocus = document.activeElement === b;
      b.disabled = true;
      /* Disabling the button somebody has just pressed drops focus to the top of the
         document with no announcement. Hand it to the control they need next. */
      if (hadFocus && stackEl) stackEl.focus({ preventScroll: true });
    });
    if (stackEl) stackEl.disabled = false;
    guessSay.replaceChildren(para(GUESSES[i].why));
  }

  GUESSES.forEach((g, i) => {
    const b = kit.ui.button({ label: g.label, kind: 'ghost', onClick: () => predict(i) });
    guessButtons.push(asButton(b.el));
    g.node = b.el;
  });

  const reveal = liveBox();

  function stack() {
    if (stopRead) { stopRead(); stopRead = null; }
    if (cancelFall) { cancelFall(); cancelFall = null; }
    if (mode === 'waiting' || mode === 'reading') {
      /* Somebody pressed here without watching the list, or during it. The dots they
         have not seen are still theirs, so they all arrive and then all fall. */
      arrived = values.length;
      read.set(`${N_APARTMENTS} of ${N_APARTMENTS}`);
      latest.set(`${money(values[values.length - 1])} a month`);
      finishRead(false);
    }
    mode = 'falling';
    const engine = kit.engine;
    const still = engine && typeof engine.prefersReducedMotion === 'function'
      ? engine.prefersReducedMotion()
      : Boolean(engine && engine.reducedMotion);

    const land = () => { mode = 'piled'; mix = 1; fig.draw(); tellThem(); };

    if (engine && typeof engine.tween === 'function' && !still) {
      mix = 0;
      cancelFall = engine.tween({
        from: 0, to: 1, ms: FALL_MS,
        ease: engine.ease ? engine.ease.linear : undefined,
        onStep: (v) => { mix = Number.isFinite(v) ? v : 1; fig.draw(); },
        onDone: () => { cancelFall = null; land(); },
      });
    } else {
      land();
    }
  }

  function tellThem() {
    if (reveal.childElementCount) return;
    reveal.append(named(
      'You have just built a distribution',
      `The dots stopped being ${N_APARTMENTS} separate facts and became one object with a shape. Each `
      + `column stands on a bin: a stretch of rent ${money(FALL_BIN)} wide. The height of the column `
      + 'is the number of apartments whose rent falls inside that stretch. A picture built this way is a '
      + 'histogram, and the shape it draws is the distribution of the rents.',
      `This town has two crowds in it. ${town.underGap} of the ${town.n} apartments sit in a mass around `
      + `${money(OLD_MU)} a month, a second and smaller mass sits around ${money(NEW_MU)}, the ground `
      + `between them near ${money(GAP_AT)} is nearly bare, and a few expensive apartments trail off to `
      + 'the right. Nothing has been calculated to get that sentence. It was read off a picture, '
      + 'which is the order this unit is arguing for.',
      `One symbol comes with the pile and it is the only one in this unit. The number of things in `
      + `a pile is written n. Here n = ${town.n}. It is the letter n, it means how many, and there `
      + 'is nothing else hiding inside it.',
    ));
  }

  const stackBtn = kit.ui.button({ label: 'Stack them into columns', kind: 'primary', onClick: stack });
  stackEl = asButton(stackBtn.el);
  /* The one gate on this screen, and the ask sits directly above the buttons that open
     it. A reader who has said what they expect gets the picture; a reader who has not
     would be watching an animation instead of testing a prediction. */
  if (stackEl) stackEl.disabled = true;

  wrap.append(
    fig.el,
    controls(readBtn.el),
    readoutRow(read.el, latest.el),
    afterRead,
    para('Before those dots go anywhere, commit to something. What do you think this town looks '
      + 'like once the apartments are counted rather than scattered?'),
    controls(...GUESSES.map((g) => g.node)),
    guessSay,
    controls(stackBtn.el),
    quiet('The stacking button opens once you have said what you expect. You can read the list out '
      + 'again afterwards and watch the fall as many times as you like.'),
    reveal,
  );

  kit.bin.push(() => {
    if (stopRead) stopRead();
    if (cancelFall) cancelFall();
  });

  return wrap;
}

/* ---------------------------------------------------------------------------
   Beat 3. Four piles, four plain sentences, and the reader does the sorting before
   any word for a shape appears. */

const ZOO = {
  bell: {
    lo: -3.4, hi: 3.4,
    word: 'symmetric',
    sentence: 'Most of them in the middle, few at either end',
    spoken: 'columns rising to a single top near the middle and falling away at much the same rate on both sides',
    draw: (r) => r.n(0, 1),
  },
  skew: {
    lo: 0, hi: 6.2,
    word: 'skewed right',
    sentence: 'Most of them small, with a long tail stretching right',
    spoken: 'the tallest column at the far left, the rest falling away into a long low tail on the right',
    draw: (r) => -Math.log(1 - r.u()),
  },
  two: {
    lo: -3, hi: 3,
    word: 'bimodal',
    sentence: 'Two separate groups with a gap between them',
    spoken: 'two tall regions of columns with a low gap between them',
    draw: (r, i) => r.n(i % 2 ? 1.35 : -1.35, 0.42),
  },
  flat: {
    lo: 0, hi: 1,
    word: 'flat',
    sentence: 'No middle at all: any value about as common as any other',
    spoken: 'columns of much the same height all the way across, with no top anywhere in particular',
    draw: (r) => r.u(),
  },
};
const ZOO_ORDER = ['bell', 'skew', 'two', 'flat'];   // the order the sentences appear in
const ZOO_N = 1500;      // draws per pile: enough that the shapes are shapes and not noise
const ZOO_BINS = 16;
const LETTERS = ['A', 'B', 'C', 'D'];

function zooPile(kit, kind) {
  const spec = ZOO[kind];
  const r = kit.makeRng(`03-pile/zoo/${kind}/${kit.seed}`);
  const counts = new Array(ZOO_BINS).fill(0);
  const w = (spec.hi - spec.lo) / ZOO_BINS;
  for (let i = 0; i < ZOO_N; i++) {
    const v = spec.draw(r, i);
    const k = Math.min(ZOO_BINS - 1, Math.max(0, Math.floor((v - spec.lo) / w)));
    counts[k] += 1;
  }
  return {
    kind, word: spec.word, sentence: spec.sentence, spoken: spec.spoken,
    bars: counts.map((h, i) => ({ x0: spec.lo + i * w, x1: spec.lo + (i + 1) * w, h })),
    lo: spec.lo, hi: spec.hi, top: Math.max(...counts),
  };
}

function sectionShapes(kit, town) {
  const wrap = block();
  wrap.append(heading('Which pile does each sentence belong to?'));
  wrap.append(para(
    'Four crowds from four different places, each drawn the same way and each with its numbers '
    + 'taken off. Their heights are not comparable and are not meant to be, because every panel is '
    + 'scaled to its own tallest column. Shape is the only thing left to read.'));

  /* Which pile is behind which letter changes with the world, so the answer is never
     "it was B last time". The arrangement the four controls start in is guaranteed not
     to be the right one, so a reader who commits without touching anything has still
     chosen something rather than been handed the answer. */
  const shuffler = kit.makeRng(`03-pile/zoo-order/${kit.seed}`);
  let order = shuffler.shuffle(ZOO_ORDER);
  let guard = 0;
  while (guard < 12 && order.every((k, i) => k === ZOO_ORDER[i])) {
    order = shuffler.shuffle(ZOO_ORDER);
    guard += 1;
  }
  const piles = order.map((kind) => zooPile(kit, kind));
  const letterOf = (kind) => LETTERS[piles.findIndex((p) => p.kind === kind)];

  let told = false;

  const fig = mountFigure(kit, {
    height: 320,
    caption:
      `Four invented piles of ${ZOO_N.toLocaleString('en-GB')} numbers each, drawn in world `
      + `${kit.seed} and counted into ${ZOO_BINS} bins apiece. There are no numbers on either axis `
      + 'on purpose: the question is which pile matches which sentence, and nothing about the '
      + 'answer needs a scale. Committing to a set of matches writes the word for each shape under '
      + 'its pile.',
    describe: () => {
      const parts = piles.map((p, i) => `Pile ${LETTERS[i]}: ${p.spoken}${told ? `, labeled ${p.word}` : ''}.`);
      return `Four piles of columns, side by side. ${parts.join(' ')}`;
    },
    draw: (st) => {
      const W = st.W;
      const H = st.H;
      const gapX = 12;
      const gapY = 16;
      const colW = (W - gapX) / 2;
      const rowH = (H - gapY) / 2;
      piles.forEach((p, i) => {
        const x0 = (i % 2) * (colW + gapX);
        const y0 = (i < 2 ? 0 : 1) * (rowH + gapY);
        /* pad() takes distances from each edge, which is what turns one canvas into
           four small frames without four canvases to keep in step. */
        st.pad(x0 + 6, W - (x0 + colW) + 4, y0 + 20, H - (y0 + rowH) + 16);
        st.domain(p.lo, p.hi, 0, p.top * 1.1);
        st.axisX([], () => '');
        st.bars(p.bars, { color: 'data', gap: 1.5, alpha: 0.85 });
        st.note(LETTERS[i], x0 + 6, y0 + 2, { size: 13, weight: 700, color: 'ink2' });
        if (told) {
          st.note(p.word, x0 + 6, y0 + rowH - 12, { size: 12, weight: 700, color: 'result' });
        }
      });
    },
  });

  const rows = ZOO_ORDER.map((kind, i) => kit.ui.segmented({
    label: ZOO[kind].sentence,
    options: LETTERS.map((L) => ({ value: L, label: L })),
    value: LETTERS[i],
  }));

  const reveal = liveBox();

  const commit = kit.ui.button({
    label: 'Show what each pile is',
    kind: 'primary',
    onClick: () => {
      told = true;
      fig.draw();
      if (reveal.childElementCount) return;
      reveal.append(named(
        'Three words for what you sorted by',
        'Sorting those took no arithmetic. What the four sentences ask about is where the weight '
        + 'sits and whether it falls away evenly, and that is the whole job the words below do.',
        `Pile ${letterOf('bell')} has its weight in the middle and falls away at about the same rate `
        + 'on both sides. A pile like that is symmetric. Heights do it, and so do the errors of a '
        + 'well-made instrument, which is why 09-bell is a whole unit about one symmetric shape.',
        `Pile ${letterOf('skew')} piles up at one end and thins out into a long tail at the other. `
        + 'That is skewed, and the name follows the tail rather than the crowd, so this one is '
        + 'skewed right. Incomes are skewed right, and so is the time you wait for a bus.',
        `Pile ${letterOf('two')} has two tops with a dip between them, which is bimodal. Two humps `
        + 'usually means two different things were measured and written into the same column. The '
        + `rents at the top of this screen are bimodal, and the reason is that ${N_OLD} of those `
        + `apartments are old and ${N_NEW} of them were built at once.`,
        `Pile ${letterOf('flat')} has no middle worth the name: any value is about as common as any `
        + 'other. That one is flat, or uniform in a textbook. A lottery draw looks like this, and '
        + 'so does a number generator that is working properly.',
      ));
      reveal.append(para(
        'The pair that gets mixed up is the skewed one and the two-humped one, and the confusion is '
        + 'well earned. A long tail with a lump in it can be either, the picture is often genuinely '
        + 'ambiguous, and how it draws depends on a setting nobody has mentioned yet.'));
      reveal.append(deeper(
        'Why the tail names the skew, and where the name pays off',
        'Everybody gets this backwards once. A pile of incomes with most people low and a few very '
        + 'high earners is called skewed right, even though the crowd is on the left, because the '
        + 'name points at the tail.',
        'The convention earns its keep because the tail is the side the mean gets dragged toward. '
        + `On the rents in this unit the mean is ${money(town.mean)} a month and the median is `
        + `${money(town.median)}, a gap of ${money(Math.round(town.mean) - Math.round(town.median))} `
        + 'opened up by the apartments at the top of the axis and the second crowd. Unit 04-middle is '
        + 'where that gap does its damage.'));
    },
  });

  wrap.append(
    fig.el,
    para('Set each sentence to the pile you think it belongs to, then commit to all four at once.'),
    controls(...rows.map((r) => r.el)),
    controls(commit.el),
    reveal,
  );
  return wrap;
}

/* ---------------------------------------------------------------------------
   Beat 4: the same idea, somewhere with nothing to do with rent. */

function sectionApply(kit) {
  const wrap = block();
  wrap.append(heading('Somewhere else entirely'));
  wrap.append(para(
    'A university department has 180 marks from one module. Drawn as a histogram they make two '
    + 'crowds, one gathered near 45 and one near 72, with very little in between. The average mark '
    + 'is 58.'));

  wrap.append(kit.ui.quiz({
    question: 'Which sentence is that picture entitled to?',
    options: [
      {
        label: 'The module averaged 58, which is a fair result for a hard paper.',
        correct: false,
        why: 'The 58 is real arithmetic and nobody did anything wrong to get it. What the picture '
          + 'adds is that 58 sits in the dip between the two crowds, so the average describes a '
          + 'student who is not in the room. The same move on this unit\'s rents produces a '
          + 'perfectly true sentence about a town where almost nobody pays that.',
      },
      {
        label: 'Marks were widely spread around 58.',
        correct: false,
        why: 'The spread is real, and this is closer to the picture than the first option, which is '
          + 'what makes it the more expensive mistake. It still describes one crowd that happens to '
          + 'be wide. Two crowds with a gap is a different claim about the world, and a spread '
          + 'quoted around a single center cannot tell the two apart. Unit 05-spread is where that '
          + 'number arrives, and it arrives with this warning attached.',
      },
      {
        label: 'Two groups sat this module and they scored differently. Report them apart until somebody finds out why.',
        correct: true,
        why: 'The picture supports two groups and says nothing about why, and this sentence says '
          + 'both of those things. Reading the shape first is also what tells you which summary is '
          + 'worth computing later, which is the reason this unit sits ahead of 04-middle.',
      },
    ],
  }).el);

  return wrap;
}

/* ---------------------------------------------------------------------------
   Beat 5: the reader performs the distortion, using only true counts. */

function sectionDial(kit, town, state) {
  const wrap = block();
  wrap.append(heading('Same rents, three different towns'));
  wrap.append(para(
    `The columns in that first picture were ${money(FALL_BIN)} wide. Nothing in the data asked for `
    + `${money(FALL_BIN)}. Whoever builds the screen picks a width, and on that screen it was us. `
    + 'The dial below hands the choice to you instead. Nothing about the apartments changes as you turn '
    + 'it: every rent stays where it was, and every column stays a true count of the apartments inside '
    + 'it.'));

  let width = FALL_BIN;
  let rug = false;
  let counts = countInto(town.values, width);
  let humps = humpsIn(counts);
  let tallest = Math.max(...counts);

  const rugRng = kit.makeRng(`03-pile/rug/${kit.seed}`);
  const rugJit = town.values.map(() => rugRng.u() * 2 - 1);

  const shown = kit.ui.readout({ label: 'Columns on the chart', value: String(counts.length), tone: 'plain' });
  const peak = kit.ui.readout({ label: 'Apartments in the tallest column', value: String(tallest), tone: 'data' });
  /* Spoken, and set only when the number actually moves. The count changes perhaps a
     dozen times across the whole dial, so a live region here announces a finding rather
     than narrating a drag. */
  const humpBox = kit.ui.readout({
    label: 'Humps the picture shows', value: String(humps), tone: 'result', live: true,
  });

  const flatSay = liveBox();

  const fig = mountFigure(kit, {
    height: 280,
    caption:
      `The same ${N_APARTMENTS} rents as the figure above, in dollars a month, counted into bins of `
      + 'whatever width the dial is set to. Every column is the true number of apartments renting for '
      + 'somewhere inside its bin, at every setting. The hump count beside the figure applies one '
      + 'stated rule: a hump is a top the columns climb to and then fall away from by at least a '
      + 'quarter of the tallest column before climbing again.',
    describe: () => `Two hundred and forty rents in ${counts.length} columns, each ${money(width)} `
      + `wide. The tallest column holds ${tallest} apartments. Under the rule in the caption the picture `
      + `shows ${humpPhrase(humps)}.`
      + (rug ? ' Every individual rent is drawn as a small dot in a band below the columns.' : ''),
    draw: (st) => {
      /* The band under the axis is kept clear whether or not the rents are drawn in it,
         so flicking that switch changes what is on the screen and never the scale. */
      const floor = -tallest * 0.16;
      st.domain(RENT_LO, RENT_HI, floor, tallest * 1.14).pad(44, 14, 16, 30);
      st.axisY(countTicks(tallest), (v) => String(v));
      st.axisX(5, (v) => money(v));
      st.bars(barsFrom(counts, width), { color: 'data', gap: 1, alpha: 0.85 });
      if (rug) {
        st.dots(
          town.values.map((v, i) => [v, floor * 0.55 + rugJit[i] * tallest * 0.035]),
          { r: 2, fill: 'data', alpha: 0.55 },
        );
      }
      st.note('number of apartments', 8, 12, { align: 'left', size: 11, color: 'ink2', weight: 600 });
      st.note('rent, $ a month', st.W - 8, 12, { align: 'right', size: 11, color: 'ink2', weight: 600 });
    },
  });

  function retune(w) {
    width = w;
    counts = countInto(town.values, width);
    tallest = Math.max(...counts);
    const next = humpsIn(counts);
    shown.set(String(counts.length));
    peak.set(String(tallest));
    if (next !== humps) humpBox.set(String(next));
    humps = next;
    if (humps === 1) {
      state.setFlat(width);
      if (!flatSay.childElementCount) {
        flatSay.append(para(
          `At ${money(width)} a bin this is a town with one kind of apartment and a few expensive ones. `
          + 'The second crowd has not moved out. It has been counted into the same boxes as the '
          + 'first one.'));
      }
    }
    fig.draw();
  }

  const dial = kit.ui.slider({
    label: 'Bin width',
    min: BIN_MIN, max: BIN_MAX, step: BIN_STEP, value: width,
    fmt: (v) => money(v),
    onInput: (v) => retune(Number(v)),
  });

  const rugSwitch = kit.ui.toggle({
    label: 'Show every rent underneath',
    checked: false,
    onChange: (on) => {
      rug = on === undefined ? !rug : Boolean(on);
      fig.draw();
    },
  });

  /* Every width the paragraph below quotes is read back through the same predicate the
     readout uses, so a reader who dials to one of them meets the number they were
     promised rather than a number somebody typed while writing the prose. */
  const fineHumps = humpsIn(countInto(town.values, BIN_MIN));
  const midHumps = humpsIn(countInto(town.values, FALL_BIN));
  const wideHumps = humpsIn(countInto(town.values, BIN_MAX));

  wrap.append(
    fig.el,
    controls(dial.el, rugSwitch.el),
    readoutRow(shown.el, peak.el, humpBox.el),
    quiet(`Two things to do with the dial. Make this town look like it has one kind of apartment, by `
      + `widening the bins until the hump count says one. Then take it down to ${money(BIN_MIN)} and `
      + `look at what ${binCountOf(BIN_MIN)} columns are telling you about ${town.n} apartments.`),
    flatSay,
    warned(
      'Three pictures, one set of counts',
      `Every column in every one of those pictures is a true count of the apartments in that list. At `
      + `${money(BIN_MAX)} a bin, wide enough to swallow both crowds at once, the picture shows `
      + `${humpPhrase(wideHumps)}. At ${money(FALL_BIN)} the same 240 rents show `
      + `${humpPhrase(midHumps)}. At ${money(BIN_MIN)} they show ${humpPhrase(fineHumps)} and no `
      + `story at all, because n = ${town.n} spread over ${binCountOf(BIN_MIN)} bins leaves about `
      + 'two apartments to a column, and the bumps are the luck of which apartments happened to be advertised '
      + 'that month. Not one number was faked to produce any of the three.',
      'The reason this is worth watching for rather than being angry about: most of the time the '
      + 'default is doing the choosing. Charting software picks a bin width the moment it is handed '
      + 'a column of numbers, the rules it picks with are built for one-humped data, and the person '
      + 'publishing the chart never sees the choice being made. You will do this by accident. The '
      + 'habit that catches it is turning the dial yourself before you believe a shape, on your own '
      + 'charts first.',
    ),
    para(
      'Narrow is not honest and wide is not dishonest, which is what makes this hard to police. A '
      + 'reader who takes the bumps in the narrow picture for real districts has been misled by a '
      + 'chart that only ever showed true counts, and a reader who wanted the rough shape of a '
      + 'market is better served by the wide one. The question is never how wide the bins are. It '
      + 'is whether the shape survives being drawn at another width, and the only way to answer '
      + 'that is to draw it at another width, or to put the rents themselves on the screen and let '
      + 'people see what the columns were built out of.'),
    deeper(
      'The rules that pick a width for you',
      `Two turn up in most software. Freedman and Diaconis take twice the interquartile range and `
      + `divide by the cube root of n, which on these rents gives ${money(town.fdWidth)}. Scott's `
      + `rule takes 3.49 standard deviations and divides by the same cube root, giving `
      + `${money(town.scottWidth)}. ${ruleVerdict(town)}`,
      'What is wrong is the authority. Both rules are derived for a single-humped population, and '
      + 'both are trading the wobble of narrow bins against the blurring of wide ones on that '
      + 'assumption. Handed a town with two housing stocks in it they answer a question nobody '
      + "asked. R's hist() defaults to Sturges's rule, matplotlib and numpy default to ten bins "
      + 'flat, and every one of those defaults is a decision somebody made about data that was not '
      + 'yours.'),
    deeper(
      'The other dial, the one with no control on it',
      `Width is not the only choice. Where the first bin starts moves the picture too, and this `
      + `screen holds that at ${money(RENT_LO)} for every setting of the dial. ${anchorLine(town)}`,
      'That is the argument for drawing a smooth curve through the pile instead of bars, and it is '
      + 'also the reason the curve settles nothing. It trades two choices for one, the width of the '
      + 'smoothing, and somebody is still turning that.'),
  );

  return wrap;
}

/* What the two automatic rules do to this particular town, asked of the same predicate
   the readout uses rather than assumed. On the shipped world both keep the second
   crowd, which is worth saying plainly: the rules are not villains here. */
function ruleVerdict(town) {
  const a = humpsIn(countInto(town.values, town.fdWidth));
  const b = humpsIn(countInto(town.values, town.scottWidth));
  if (a === b) {
    return `Set the dial near either and this picture shows ${a === 1 ? 'one hump' : `${a} humps`}, `
      + 'so nothing has gone wrong here.';
  }
  return `Set the dial to the first and this picture shows ${a === 1 ? 'one hump' : `${a} humps`}; `
    + `set it to the second and it shows ${b === 1 ? 'one' : b}. Two respectable rules, two towns.`;
}

/* Look for a width where sliding the whole grid of bins sideways changes the answer,
   and report it with the numbers it actually found. The search runs once, at build
   time, over the same counting code the dial uses, so the sentence is a measurement
   rather than a memory of one. */
function anchorLine(town) {
  for (const w of [200, 250, 300, 350]) {
    let most = null;
    let fewest = null;
    for (let shift = 0; shift < w; shift += Math.round(w / 10)) {
      const h = humpsIn(shiftedCounts(town.values, w, shift));
      if (most === null || h > most.h) most = { h, shift };
      if (fewest === null || h < fewest.h) fewest = { h, shift };
    }
    if (most && fewest && most.h !== fewest.h) {
      return `At ${money(w)} a bin, two starting points ${money(Math.abs(most.shift - fewest.shift))} `
        + `apart give ${most.h} humps and ${fewest.h}, and not one rent moves between them.`;
    }
  }
  return 'Slide that starting point along by part of a bin and the columns are cut in different '
    + 'places, which can move a hump on or off the picture without a single rent changing.';
}

function shiftedCounts(values, width, shift) {
  const from = RENT_LO - shift;
  const bins = Math.max(1, Math.ceil((RENT_HI - from) / width) + 1);
  const counts = new Array(bins).fill(0);
  for (const v of values) {
    const k = Math.min(bins - 1, Math.max(0, Math.floor((v - from) / width)));
    counts[k] += 1;
  }
  return counts;
}

/* ---------------------------------------------------------------------------
   The close: plain-word descriptions of what happened, each with the term the rest of
   the world uses for it and the unit that picks it up. */

function sectionRecap(kit, town, state) {
  const wrap = block();
  wrap.append(heading('Four things you did'));
  wrap.append(para(
    'One symbol turned up in all of that, and it was n. Everything else was looking.'));

  const steps = kit.ui.steps([
    {
      title: `You met ${N_APARTMENTS} numbers as a list, and then as a shape`,
      body: 'A list hands over one number at a time and leaves nothing behind, which is what lists '
        + 'do. That is the case for drawing data rather than reading it, and it is not that '
        + 'pictures are friendlier: a column of numbers cannot be seen all at once, and a shape '
        + 'can.',
    },
    {
      title: 'You built a distribution and read it before computing anything',
      body: `The dots fell into bins, the bins became columns, and the columns had a shape you `
        + `could describe in a sentence. The picture is a histogram, the shape is a distribution, `
        + `the stretch under one column is a bin, and n = ${town.n} is how many apartments went into it.`,
    },
    {
      title: 'You sorted four crowds by shape alone',
      body: 'Weight in the middle falling away both sides is symmetric. A long tail on one side is '
        + 'skewed, named for the tail. Two tops with a dip between them is bimodal, and usually '
        + 'means two things got measured at once. No top anywhere is flat.',
    },
    {
      title: 'You made a two-crowd town look like a one-crowd town',
      body: 'Widening the bins merges the old apartments and the new development into one innocent hill, '
        + 'using nothing but true counts. Bin width is the name of that dial. Unit 16-rhetoric is '
        + 'this whole toolkit turned around: reading the claims other people make with it, and '
        + 'writing ones that survive being checked.',
    },
  ]);
  /* Every step at once: this is a summary rather than a walkthrough. reveal(i) shows
     everything up to and including i, and the loop is here so that a builder which
     revealed one card at a time would still land on all four. */
  for (let i = 0; i < 4; i++) steps.reveal(i);
  wrap.append(steps.el);

  /* The dial is the one place the reader put a number of their own on the screen, and
     the close only quotes it once they have. A recap that invents a decision nobody
     made is the exact failure this site is built against. */
  const mine = liveBox();
  state.onFlat((w) => {
    mine.replaceChildren(para(
      `Your one-hump version of this town came in at ${money(w)} a bin. Every column in it was a `
      + 'true count, and it is the picture an agent would rather run in the window.'));
  });
  wrap.append(mine);

  wrap.append(para(
    `Unit 04-middle asks where a pile like this sits, which is the obvious next question and the `
    + `dangerous one. The mean rent in this town is ${money(town.mean)} a month, and `
    + `${town.nearMean} of the ${town.n} apartments rent for within ${money(50)} of that. A single middle `
    + 'would hide precisely what you spent this unit learning to see, so it arrives next with the '
    + 'picture already drawn.'));

  const link = el('a', 'ec-button', 'Back to the map');
  link.href = '#/map';
  wrap.append(link);
  return wrap;
}

/* ---------------------------------------------------------------------------
   Assembly. render() is called with an empty root every time the reader arrives,
   including on a second visit, so every piece of state below is built fresh here and
   nothing mutable lives at module scope. */

function head(kit) {
  const h = el('div', 'prose lesson__head');
  h.append(el('p', 'kicker', 'Unit 3 · about 18 minutes'));
  h.append(el('h1', null, 'The pile'));
  h.append(el('p', 'lesson__q', 'What does a whole group of numbers look like at once?'));
  h.append(el('p', 'lede',
    'Two hundred and forty apartments were advertised to let in one town last month, each with a rent on '
    + 'it in dollars a month. Nobody can hold 240 numbers in their head, and nothing here asks you '
    + 'to. This unit is about what happens when you draw them instead, and about the one setting '
    + 'that decides which true picture you get.'));
  h.append(quiet(
    `Every rent on this screen is invented, drawn in world ${kit.seed}. Type the same world number `
    + 'on another phone and the same 240 apartments come back.'));
  return h;
}

/* The one thing that crosses a section boundary: the bin width at which the reader
   first made the second crowd disappear, which the close reads back if they did. */
function makeState() {
  const watchers = [];
  return {
    flatAt: null,
    onFlat(fn) { watchers.push(fn); if (this.flatAt != null) fn(this.flatAt); },
    setFlat(v) {
      if (this.flatAt != null) return;   // the first one is theirs; later drags are practice
      this.flatAt = v;
      watchers.forEach((fn) => fn(v));
    },
  };
}

function render(root, ctx) {
  const ui = ctx.ui;
  const stats = ctx.stats;
  const stage = ctx.stage || (ctx.viz && ctx.viz.stage);
  /* The contract puts a bound stage on ctx and main.js also passes the viz module, so
     either spelling is accepted. The world factory is taken from ctx when it is offered
     and from core/rng.js otherwise, because a lesson that quietly stopped rebuilding a
     town from its number would go on printing "the same 240 apartments come back" while that
     had stopped being true. */
  const makeRng = typeof ctx.makeRng === 'function'
    ? ctx.makeRng
    : (ctx.rng && typeof ctx.rng.makeRng === 'function' ? ctx.rng.makeRng : coreMakeRng);

  if (!ui || !stats || !stage) {
    throw new Error('03-pile needs ui, stats and a drawing stage on the lesson context.');
  }

  const kit = {
    ui,
    stats,
    stage,
    makeRng,
    engine: ctx.engine || null,
    seed: ctx.seed == null ? 42 : ctx.seed,
    /* Held for the same reason every lesson holds it, and never called here. All three
       figures are drawn from one world, and this unit gives the reader no way to change
       it: rolling a fresh town is the whole of 04-reroll, and spending that moment here
       would leave that unit with nothing to show. Nothing on this screen moves the
       world, so nothing writes one into the address bar. */
    setSeed: typeof ctx.setSeed === 'function' ? ctx.setSeed : null,
    bin: [],       // teardown jobs
    redraws: [],   // one per figure
  };

  const town = describeTown(kit);
  const state = makeState();

  const body = el('div', 'lesson__body');
  body.append(
    sectionArrive(kit, town),
    sectionShapes(kit, town),
    sectionApply(kit),
    sectionDial(kit, town, state),
    sectionRecap(kit, town, state),
  );
  root.append(head(kit), body);

  /* Canvases can only measure themselves once they are on the page. */
  const repaint = () => { kit.redraws.forEach((draw) => draw()); };
  repaint();

  /* viz.js holds the colors it read out of the stylesheet for a fraction of a second,
     so a redraw fired the instant the scheme changes can still be painting in the old
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

  /* The router empties the mount with replaceChildren and tells nobody, and it does
     that on a go() to the page we are already on, which fires no hashchange at all. So
     the lesson watches the mount and packs up the moment its own body stops being part
     of the page. Watching our own node rather than the event means a lesson rendered
     twice into the same mount never tears down the copy still on screen. */
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
  id: '03-pile',
  unit: 'II',
  title: 'The pile',
  question: 'What does a whole group of numbers look like at once?',
  minutes: 18,
  render,
};
