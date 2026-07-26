/* 05-spread/index.js
   Unit 5. Two bus routes to the same hospital, both averaging 24 minutes, one of them
   dependable and one a lottery. The reader drags a bracket out from the middle until it
   covers most of the journeys, then writes the standard deviation down as four
   instructions and meets the letter, then drops one 90-minute morning into a year of
   journeys and watches the range break while s holds. The unit closes on a bus panel
   that prints nothing but the average and is true the whole time. */

/* Every dataset here is rebuilt from the world number in the address bar, and that needs
   the factory rather than the single generator ctx.rng hands over. main.js passes it as
   ctx.makeRng; this import is the guarantee the lesson still works if it ever stops. */
import { makeRng as coreMakeRng } from '../../core/rng.js';

/* ---------------------------------------------------------------------------
   The scenario. Two invented bus routes running from the same stop to the same
   hospital, timed from boarding to stepping off. Minutes, one decimal.

   Both routes are built to average exactly 24.0 minutes. That is not a lucky roll:
   the journeys are drawn with a shape and then shifted and stretched until the
   average and the spread land on the numbers below. Everything on this screen is
   about what is left over once two crowds agree about their middle, so the middles
   have to agree exactly, in every world, or half the sentences here go soft. */
const SIX = 'the 6';
const F1 = 'the 41';
const MIDDLE = 24;        // minutes, the average journey on both routes
const SD_SIX = 1.6;       // minutes, the spread on the dependable route
const SD_F1 = 8.0;        // minutes, the spread on the lottery
const N_TIMED = 40;       // journeys timed on each route in the opening month

/* The shape of a journey before the shift and stretch. The 6 is one bell. The 41 is
   two things that happen to a bus: a clear run, or a morning behind something. The
   mixture is what puts the long right tail there, and the tail is the whole reason
   the 41 is worth catching a different bus to avoid. */
const HELD_SHARE = 0.34;  // share of 41 journeys that meet something
const CLEAR_MU = 20;
const CLEAR_SD = 2.4;
const HELD_MU = 32;
const HELD_SD = 5.5;

/* Floors and ceilings, in minutes. A bus cannot do this trip in four minutes and the
   picture cannot show a journey that lands off the side of its own axis, so the fitting
   below holds every journey inside these and keeps the average and the spread exact. */
const SIX_LO = 17;
const SIX_HI = 32;
const F1_LO = 11;
const F1_HI = 50;

const STRIP_MAX = 54;     // minutes; the axis on the two crowd figures never moves

/* The year of journeys behind the last two beats: twelve morning-peak departures a day
   on the 6, 250 weekdays, and one February morning stuck behind a burst water main. */
const YEAR_N = 3000;
const FREAK = 90;         // minutes, that one morning
const YEAR_MAX = 96;      // minutes; the axis on the year figure, wide enough for it

/* One week on the 41, five journeys, chosen so that every step of the arithmetic can be
   checked on the back of an envelope. They average exactly 24 minutes. */
const WEEK = [14, 18, 22, 28, 38];
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const WEEK_DEV = WEEK.map((v) => v - MIDDLE);              // -10, -6, -2, +4, +14
const WEEK_SQ = WEEK_DEV.map((d) => d * d);                // 100, 36, 4, 16, 196
const WEEK_SS = WEEK_SQ.reduce((a, b) => a + b, 0);        // 352 square minutes
const WEEK_VAR = WEEK_SS / (WEEK.length - 1);              // 88 square minutes
const WEEK_SD = Math.sqrt(WEEK_VAR);                       // 9.38 minutes

/* Geometry for the crowd figures, in the 0-to-1 vertical data space. The grammar is the
   one 01-noticing set: minutes run left to right on a frozen axis, a crowd is a row of
   dots, and a mark that belongs to one row is a short tick rather than a full-height
   rule. Written down once so two figures line up when a reader scrolls between them. */
const ROW_TOP = 0.72;
const ROW_BOT = 0.28;
const ROW_ONE = 0.42;     // the single-row figure, where only one route is in frame
const JITTER = 0.15;
const TICK_HALF = 0.19;
const LABEL_TOP_Y = 0.96;
const LABEL_BOT_Y = 0.52;
const BRACKET_Y = 0.90;   // the reader's measuring bar, clear of the dots
const NAMED_Y = 0.78;     // the arithmetic's bar, below the reader's and clear of its label

/* The recipe figure. Five squares standing in a row, then the average square beside
   them. Sides are in minutes and read against the same scale as everything else. */
const RECIPE_SPAN = 56;   // minutes across the frame
const SLOT_X0 = 1.5;
const SLOT_GAP = 1.2;
const AVG_X0 = 45.4;      // where the average square stands
const LADDER_TOP = 0.94;  // the five journeys hang here, one under another
const LADDER_STEP = 0.05;
const Y_FLOOR = -0.14;    // room under the baseline for a bracket and its label

const min1 = (v) => (Math.round(v * 10) / 10).toFixed(1);
const whole = (v) => String(Math.round(v));
const share = (a, b) => Math.round((a / b) * 100);
/* The week's distances are whole minutes, and a distance is worth its sign. */
const signed = (v) => (v > 0 ? `+${v}` : String(v));
/* "100, 36, 4, 16 and 196", which is how a person reads a list out loud. */
const listOf = (arr, fmt = (v) => String(v)) => arr.slice(0, -1).map(fmt).join(', ')
  + ' and ' + fmt(arr[arr.length - 1]);

/* ---------------------------------------------------------------------------
   Small DOM helpers, copied from 01-noticing so that a reader landing in either file
   finds the same short list. Lessons build real nodes and wire them; there is no
   template language here and nothing to compile. */

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

/* The naming move gets one treatment across the whole site: a rule down the left in the
   result colour, past tense, no praise. */
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

/* ui.js ships controls() and readouts() that build exactly these rows, but neither is in
   the published module contract, so the two rows are built here from the class names the
   stylesheet already knows. Delete these the day the contract lists them. */
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

/* ui.button hands back a wrapper node in the contract and the bare button in the shipped
   kit; this finds the real <button> either way. */
function asButton(node) {
  if (!node) return null;
  if (typeof node.matches === 'function' && node.matches('button')) return node;
  if (typeof node.querySelector === 'function') return node.querySelector('button') || node;
  return node;
}

/* ui.toggle wraps its checkbox in a label, and a newly revealed control has to be able
   to take focus, so the lesson needs the input itself. */
function asInput(node) {
  if (!node || typeof node.querySelector !== 'function') return null;
  return node.querySelector('input');
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
   Building a set of journeys.

   Draws come out of the world's generator with a shape, and are then shifted and
   stretched until the average and the spread are the two numbers this unit talks
   about. Anything that lands outside what a bus could plausibly do is pulled to the
   edge and the fit runs again, so the ends are honest and the two summary numbers
   stay exact: across worlds 1 to 3,000 the average and the spread come back correct
   to the last digit a double can hold, counted in a throwaway script rather than
   assumed. */

const clampZ = (z, lim) => Math.max(-lim, Math.min(lim, z));

function bellDraws(rng, n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(clampZ(rng.n(0, 1), 2.9));
  return out;
}

function lotteryDraws(rng, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(rng.u() < HELD_SHARE
      ? HELD_MU + HELD_SD * clampZ(rng.n(0, 1), 2.0)
      : CLEAR_MU + CLEAR_SD * clampZ(rng.n(0, 1), 2.2));
  }
  return out;
}

function fitTo(stats, raw, mu, sd, lo, hi) {
  let v = raw.slice();
  for (let pass = 0; pass < 14; pass++) {
    const m = stats.mean(v);
    const s = stats.sd(v);
    if (!Number.isFinite(m) || !(s > 0)) return v;
    v = v.map((x) => mu + sd * ((x - m) / s));
    let pulled = false;
    v = v.map((x) => {
      if (x < lo) { pulled = true; return lo; }
      if (x > hi) { pulled = true; return hi; }
      return x;
    });
    if (!pulled) return v;
  }
  const m = stats.mean(v);
  const s = stats.sd(v);
  return s > 0 ? v.map((x) => mu + sd * ((x - m) / s)) : v;
}

function route(kit, name, n, kind) {
  const rng = kit.makeRng(`05-spread/${name}/${kit.seed}`);
  const raw = kind === 'six' ? bellDraws(rng, n) : lotteryDraws(rng, n);
  const values = kind === 'six'
    ? fitTo(kit.stats, raw, MIDDLE, SD_SIX, SIX_LO, SIX_HI)
    : fitTo(kit.stats, raw, MIDDLE, SD_F1, F1_LO, F1_HI);
  const jitter = values.map(() => rng.u() * 2 - 1);
  return { values, jitter };
}

const points = (set, row, spread) => set.values.map((v, i) => [v, row + set.jitter[i] * spread]);

/* ---------------------------------------------------------------------------
   Drawing. Two of the figures share the crowd grammar; the other two have layouts of
   their own and say so in their captions. */

function stripFrame(st) {
  st.domain(0, STRIP_MAX, 0, 1).pad(12, 14, 18, 28);
  st.axisX(6);
  st.note('minutes on the bus', st.W - 8, 14, { align: 'right', size: 11, color: 'ink2', weight: 600 });
  return st;
}

function rowMark(st, x, row, half, o = {}) {
  st.line([[x, row - half], [x, row + half]], {
    color: o.color, width: o.width == null ? 2.5 : o.width, dash: o.dash, alpha: o.alpha,
  });
}

/* ---------------------------------------------------------------------------
   One helper mounts a canvas, keeps it correct through resizes and a switch to dark
   mode, and keeps the spoken description in step with the picture. The description is
   only written when it changes, so a tween never narrates itself sixty times a second.

   A canvas that is hidden or not yet laid out reports a width of zero, and viz.fit()
   takes that as its cue to draw at a sane default shape, so there is no division by
   zero to guard against and no reason to skip the first draw. */

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
    /* Redraw when the box actually changed size. The observer also fires for reasons
       that leave the picture identical, and a repaint that changes nothing still costs
       a frame on the sort of phone this course is built for. */
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
   Beat 1. Two crowds with the same middle. The reader picks a bus before anything is
   named, and the reason they pick it is the thing this unit is about. */

function sectionSameMiddle(kit, data) {
  const wrap = block();
  wrap.append(heading('Two buses, one average, different mornings'));
  wrap.append(para(
    'The 6 and the 41 both run from the stop at the end of your road to the hospital. Somebody '
    + 'timed forty journeys on each of them last month, from boarding to stepping off. Both routes '
    + `came out at ${min1(MIDDLE)} minutes on average. A timetable would stop there.`));

  const six = data.six;
  const f1 = data.f1;
  const sixLo = kit.stats.min(six.values);
  const sixHi = kit.stats.max(six.values);
  const f1Lo = kit.stats.min(f1.values);
  const f1Hi = kit.stats.max(f1.values);
  const sixBand = sixHi - sixLo;
  const f1Band = f1Hi - f1Lo;

  const fig = mountFigure(kit, {
    height: 240,
    caption:
      `Forty journeys timed on each route in one month, in minutes, invented for this screen and `
      + `drawn in world ${kit.seed}. Both rows average exactly ${min1(MIDDLE)} minutes, marked by a `
      + `tick inside each row and by the line running the height of the frame. The 6's journeys all `
      + `landed between ${min1(sixLo)} and ${min1(sixHi)} minutes. The 41's are strewn from `
      + `${min1(f1Lo)} to ${min1(f1Hi)}. The averages are identical and the mornings are not.`,
    describe: () => `Two rows of forty dots each, in minutes on the bus. Both rows average `
      + `${min1(MIDDLE)} minutes. The 6's dots are packed into a band ${min1(sixBand)} minutes `
      + `wide, from ${min1(sixLo)} to ${min1(sixHi)}. The 41's are spread across ${min1(f1Band)} `
      + `minutes, from ${min1(f1Lo)} to ${min1(f1Hi)}, with a thin scatter out to the right.`,
    draw: (st) => {
      stripFrame(st);
      st.label(SIX, 0.4, LABEL_TOP_Y, { align: 'left', size: 12, weight: 700, color: 'ink2' });
      st.label(F1, 0.4, LABEL_BOT_Y, { align: 'left', size: 12, weight: 700, color: 'ink2' });
      /* One line, not two. Both routes share this average, and a full-height rule is the
         honest mark for a number that belongs to the whole frame. */
      st.vline(MIDDLE, { color: 'truth', width: 1.5, dash: 4, alpha: 0.35 });
      st.dots(points(six, ROW_TOP, JITTER), { r: 4.5, fill: 'data', alpha: 0.8 });
      st.dots(points(f1, ROW_BOT, JITTER), { r: 4.5, fill: 'data', alpha: 0.8 });
      rowMark(st, MIDDLE, ROW_TOP, TICK_HALF, { color: 'truth', width: 3 });
      rowMark(st, MIDDLE, ROW_BOT, TICK_HALF, { color: 'truth', width: 3 });
      st.label(`${min1(MIDDLE)} min`, MIDDLE, LABEL_TOP_Y, {
        align: 'center', size: 12, weight: 700, color: 'truth',
      });
    },
  });

  const reveal = liveBox();
  let asked = false;
  let sixBtn = null;
  let f1Btn = null;

  function answer(tookSix) {
    if (asked) return;
    asked = true;
    const held = [sixBtn, f1Btn].some((b) => b && document.activeElement === b);
    [sixBtn, f1Btn].forEach((b) => { if (b) b.disabled = true; });
    reveal.append(para(tookSix
      ? 'That is what nearly everybody picks, and the reason people give is some version of: I '
        + 'know what the 6 is going to do.'
      : 'That is the answer with the better best case, and the 41 does have one: it has come in '
        + `at ${min1(f1Lo)} minutes. The trouble is that the two mistakes cost different amounts. `
        + 'Arriving twenty minutes early costs you a corridor and a magazine, and arriving five '
        + 'minutes late costs you the appointment.'));
    reveal.append(named(
      'That reason has a name',
      `The 6's forty journeys sit inside a band ${min1(sixBand)} minutes wide. The 41's are `
      + `strewn across ${min1(f1Band)} minutes. Nothing about that difference is in the average, `
      + 'because the averages are identical, and it is the whole of what you chose on. The word '
      + 'for it is spread.',
      'A middle tells you where a crowd of numbers sits. A spread tells you how much the crowd '
      + 'disagrees with itself. For somebody planning a morning, the second one is the number '
      + 'that decides what time they leave the house, and it is the one the panel at the bus '
      + 'stop leaves off.',
    ));
    /* Disabling the button somebody just pressed drops a keyboard reader at the top of
       the document with no announcement. There is no next control here, so focus goes to
       the text that just arrived. */
    if (held) {
      reveal.setAttribute('tabindex', '-1');
      reveal.focus({ preventScroll: true });
    }
  }

  const takeSix = kit.ui.button({ label: 'The 6', kind: 'ghost', onClick: () => answer(true) });
  const takeF1 = kit.ui.button({ label: 'The 41', kind: 'ghost', onClick: () => answer(false) });
  sixBtn = asButton(takeSix.el);
  f1Btn = asButton(takeF1.el);

  wrap.append(
    fig.el,
    para('You have a 9am appointment at that hospital and you cannot miss it. Which bus do you '
      + 'take? Answer before you read on: the reason you answer is the thing this unit measures.'),
    controls(takeSix.el, takeF1.el),
    reveal,
  );
  return wrap;
}

/* ---------------------------------------------------------------------------
   Beat 2. The reader measures the looseness with their hands, before any arithmetic
   exists to do it for them. */

function sectionBracket(kit, data, state) {
  const wrap = block();
  wrap.append(heading('Reach out from the middle until you have caught most of them'));
  wrap.append(para(
    'One route at a time now. The tick at 24 minutes is the middle both routes share. The bracket '
    + 'reaches the same distance out on each side of it, and the dots it has caught are the ones '
    + 'drawn solid. Widen it until it covers most of the journeys, then commit to that width. Do '
    + 'the 6 first, then switch to the 41 and do it again.'));

  let which = 'six';
  let half = 5;           // minutes each side of the middle; deliberately not the answer
  let told = false;

  const set = () => (which === 'six' ? data.six : data.f1);
  const sd = () => (which === 'six' ? SD_SIX : SD_F1);
  const label = () => (which === 'six' ? SIX : F1);
  const inside = (v) => Math.abs(v - MIDDLE) <= half + 1e-9;
  /* One rule decides the drawing, the tally and the spoken sentence, so the screen can
     never dim a dot it has also counted. */
  const caught = () => set().values.filter(inside).length;
  const caughtBySd = () => set().values.filter((v) => Math.abs(v - MIDDLE) <= sd() + 1e-9).length;
  const bothIn = () => state.bracket.six != null && state.bracket.f1 != null;

  const reveal = liveBox();

  const fig = mountFigure(kit, {
    height: 260,
    caption:
      'One route at a time, forty journeys, in minutes, on the same axis as the figure above. The '
      + 'tick in the middle of the row is the 24-minute average both routes share. The bar across '
      + 'the top is your bracket, reaching the same distance out on each side; the journeys it '
      + 'covers are drawn solid and the ones outside it are faint. Once you have committed a width '
      + "for both routes, a second bar appears underneath at the arithmetic's own answer for the "
      + 'route on screen.',
    describe: () => {
      const n = caught();
      const base = `Forty journeys on ${label()}, in minutes, with a bracket reaching `
        + `${min1(half)} minutes out on each side of the ${min1(MIDDLE)}-minute middle. It covers `
        + `${n} of the ${N_TIMED} journeys, ${share(n, N_TIMED)}%.`;
      return bothIn()
        ? `${base} A second bracket, ${min1(sd())} minutes out on each side, covers `
          + `${caughtBySd()} of them.`
        : base;
    },
    draw: (st) => {
      stripFrame(st);
      const s = set();
      const pts = points(s, ROW_ONE, 0.16);
      st.label(label(), 0.4, LABEL_TOP_Y, { align: 'left', size: 12, weight: 700, color: 'ink2' });
      st.dots(pts.filter((p, i) => !inside(s.values[i])), { r: 5, fill: 'data', alpha: 0.22 });
      st.dots(pts.filter((p, i) => inside(s.values[i])), { r: 5, fill: 'data', alpha: 0.85 });
      rowMark(st, MIDDLE, ROW_ONE, 0.26, { color: 'truth', width: 3 });
      st.label(`${min1(MIDDLE)} min`, MIDDLE, 0.71, {
        align: 'center', size: 12, weight: 700, color: 'truth',
      });
      /* The reader's own edges stay inside the row, and two faint guides carry them up
         to the measuring bar, so the bar is visibly a measurement of this row. */
      [MIDDLE - half, MIDDLE + half].forEach((x) => {
        st.vline(x, { color: 'ink2', width: 1, dash: 3, alpha: 0.28 });
        rowMark(st, x, ROW_ONE, 0.3, { color: 'ink', width: 2.5 });
      });
      st.bracket(MIDDLE - half, MIDDLE + half, BRACKET_Y, {
        color: 'ink', label: `your bracket, ${min1(half)} min each side`,
      });
      if (bothIn()) {
        st.bracket(MIDDLE - sd(), MIDDLE + sd(), NAMED_Y, {
          color: 'result', label: `${min1(sd())} min each side`,
        });
      }
    },
  });

  const widthOut = kit.ui.readout({ label: 'Bracket', value: `${min1(half)} min each side`, tone: 'plain' });
  const inOut = kit.ui.readout({
    label: 'Journeys covered', value: `${caught()} of ${N_TIMED}`, tone: 'data',
  });
  /* Spoken, because these two only change when the reader presses a button. The two
     above follow the slider, and a value updating sixty times a second makes a screen
     reader unusable. */
  const callSix = kit.ui.readout({ label: 'Your call on the 6', value: 'not yet', tone: 'result', live: true });
  const callF1 = kit.ui.readout({ label: 'Your call on the 41', value: 'not yet', tone: 'result', live: true });

  const refresh = () => {
    widthOut.set(`${min1(half)} min each side`);
    inOut.set(`${caught()} of ${N_TIMED}`);
    fig.draw();
  };

  const routes = kit.ui.segmented({
    label: 'Route in the frame',
    options: [{ value: 'six', label: 'The 6' }, { value: 'f1', label: 'The 41' }],
    value: 'six',
    onChange: (v) => { which = v; refresh(); },
  });

  const slider = kit.ui.slider({
    label: 'How far the bracket reaches',
    min: 0.5, max: 20, step: 0.1, value: half, unit: 'min',
    fmt: (v) => min1(v),
    onInput: (v) => { half = Number(v); refresh(); },
  });

  const commit = kit.ui.button({
    label: 'This covers most of them',
    kind: 'primary',
    onClick: () => {
      state.setBracket(which, half);
      (which === 'six' ? callSix : callF1).set(`${min1(half)} min each side`);
      refresh();
      if (!bothIn()) {
        reveal.replaceChildren(para(
          `Committed for ${label()}. Switch the frame to ${which === 'six' ? F1 : SIX} and reach `
          + 'out again.'));
        return;
      }
      if (told) return;
      told = true;
      reveal.replaceChildren();
      reveal.append(named(
        'You have measured a spread with your hands',
        'You reached out from the middle until the bracket had caught most of the journeys, and '
        + 'then read the width off. That is the whole idea of a spread: a distance, out from the '
        + 'middle, in the same units as the thing you measured. Minutes here, and pounds or '
        + 'degrees or kilograms somewhere else.',
        'A second bar has appeared under yours, and it is the width the arithmetic settles on: '
        + `${min1(SD_SIX)} minutes each side on the 6, ${min1(SD_F1)} minutes each side on the 41. `
        + 'That distance is called the standard deviation, and it is roughly the bracket that '
        + 'catches two thirds of a crowd rather than nearly all of it. Slide your own bracket in '
        + 'to meet it and the readout will tell you how many journeys it catches on the forty in '
        + 'front of you.',
        'It is the number the rest of this course is built out of, and the four instructions that '
        + 'produce it are on the next screen. Nothing about them will change what you have already '
        + 'done here: they only make your bracket into something two strangers can agree on.',
      ));
      reveal.append(deeper(
        'Where the two thirds comes from, and when it lets you down',
        'Two thirds is a fact about the shape of a pile rather than a definition of the standard '
        + "deviation. The 6's journeys are heaped up symmetrically around the middle, which is the "
        + 'shape 09-bell is about, and on that shape a bracket one standard deviation wide covers '
        + 'about 68% of everything, and two standard deviations covers about 95%. On any '
        + `particular forty journeys it comes out a few either way: on these forty it catches `
        + `${caughtBySdOn(data.six, SD_SIX)}.`,
        'The 41 is lopsided, a clump of clear runs with a long tail of mornings behind something. '
        + `Its one-standard-deviation bracket catches ${caughtBySdOn(data.f1, SD_F1)} of its `
        + `${N_TIMED} journeys, more than two thirds, and nearly everything it leaves out is on `
        + 'the slow side. That asymmetry is the thing a passenger actually cares about, and it is '
        + 'why 03-pile asks you to look at the shape of a pile before computing anything about it.',
        'For any shape at all, including ones nobody has drawn yet, Chebyshev proved that at least '
        + '75% of a pile lies within two standard deviations of its middle and at least 89% within '
        + 'three. That guarantee is much weaker than the bell-shaped numbers, and unlike them it '
        + 'cannot be broken by any data anybody will ever collect.',
      ));
    },
  });

  wrap.append(
    fig.el,
    controls(routes.el, slider.el, commit.el),
    readoutRow(widthOut.el, inOut.el, callSix.el, callF1.el),
    quiet('There is no right width here. Yours is a judgement about what "most of them" means, '
      + 'and the point is that you can make it at all.'),
    reveal,
  );
  return wrap;
}

/* How many journeys a one-standard-deviation bracket catches on a given route. The depth
   block quotes it, so it is counted rather than assumed. */
function caughtBySdOn(set, sd) {
  return set.values.filter((v) => Math.abs(v - MIDDLE) <= sd + 1e-9).length;
}

/* ---------------------------------------------------------------------------
   Beat 3. The recipe, on five numbers, with the reader inverting the last step by hand
   before it is named. This is the figure that earns its frame rate. */

function sectionRecipe(kit, state) {
  const wrap = block();
  wrap.append(heading('Four instructions, and then a letter'));
  wrap.append(para(
    'Forty journeys is more arithmetic than anybody wants to do by hand, so here is one week on '
    + `the 41: ${WEEK.join(', ')} minutes, Monday to Friday. Those five were chosen because they `
    + `average exactly ${min1(MIDDLE)} minutes, the same as the route, and because every step below `
    + 'can be checked on the back of an envelope.'));

  let step = 0;            // 0 nothing yet, 1 distances, 2 squares, 3 average square, 4 the root
  let side = 6;            // minutes, the side of the reader's candidate square
  let sided = false;
  let nextEl = null;
  let sideEl = null;

  const slots = [];
  {
    let x = SLOT_X0;
    WEEK_DEV.forEach((d) => {
      const w = Math.abs(d);
      slots.push({ x0: x, x1: x + w, w });
      x += w + SLOT_GAP;
    });
  }

  /* A square is only a square if its side is the same number of pixels each way. The x
     scale is minutes, the y scale is arbitrary, so the height is worked out in pixels
     and converted back. Doing it per frame is what keeps them square on any screen. */
  function sideToY(st, minutes) {
    const pads = st.pads;
    const plotH = Math.max(1, st.H - pads.t - pads.b);
    const pxPerMin = st.X(1) - st.X(0);
    return (minutes * pxPerMin / plotH) * (1 - Y_FLOOR);
  }

  function squareOutline(st, x0, sideMin) {
    const h = sideToY(st, sideMin);
    return [[x0, 0], [x0 + sideMin, 0], [x0 + sideMin, h], [x0, h], [x0, 0]];
  }

  const areaOf = () => side * side;

  const fig = mountFigure(kit, {
    height: 330,
    caption:
      `The week on the 41 and what the four instructions do to it. The five journeys hang one `
      + `under another at the top, at their own times, with the ${min1(MIDDLE)}-minute middle `
      + 'marked through them. Each journey then becomes a square standing on the floor of the '
      + "frame, with a side equal to that journey's distance from the middle and therefore an area "
      + 'equal to that distance multiplied by itself. The square on the right is the average of the '
      + 'five, and the last instruction asks how wide it is. Every side on this figure is measured '
      + 'in minutes on the same scale, which is why the squares can be compared by eye.',
    describe: () => {
      const head = `The five journeys of the week, ${WEEK.join(', ')} minutes, hanging under one `
        + `another with the ${min1(MIDDLE)}-minute middle marked.`;
      if (step === 0) return `${head} Nothing has been measured yet.`;
      if (step === 1) {
        return `${head} Each journey now carries its distance from the middle: `
          + `${WEEK_DEV.map(signed).join(', ')} minutes.`;
      }
      const squares = `Five squares stand along the floor with sides of `
        + `${WEEK_DEV.map((d) => Math.abs(d)).join(', ')} minutes and areas of `
        + `${WEEK_SQ.join(', ')} square minutes.`;
      if (step === 2) return `${head} ${squares}`;
      const avg = `A sixth square beside them has the average of those five areas, `
        + `${whole(WEEK_VAR)} square minutes.`;
      if (step === 3) {
        return `${head} ${squares} ${avg} Your own square, ${min1(side)} minutes a side, is drawn `
          + `on top of it and has an area of ${whole(areaOf())} square minutes.`;
      }
      return `${head} ${squares} ${avg} Its side measures ${min1(WEEK_SD)} minutes, marked by a `
        + 'bracket under it and by a matching bracket reaching that far out from the middle at the '
        + 'top of the frame.';
    },
    draw: (st) => {
      st.domain(0, RECIPE_SPAN, Y_FLOOR, 1).pad(14, 14, 16, 20);
      /* The five journeys, one under another, each on its own line so that a distance
         can be drawn beside it without landing on top of its neighbour. */
      const ys = WEEK.map((v, i) => LADDER_TOP - i * LADDER_STEP);
      st.line([[MIDDLE, ys[4] - 0.035], [MIDDLE, LADDER_TOP + 0.035]], {
        color: 'truth', width: 2.5,
      });
      st.label(`${min1(MIDDLE)} min`, MIDDLE, LADDER_TOP + 0.05, {
        align: 'center', size: 11.5, weight: 700, color: 'truth',
      });
      WEEK.forEach((v, i) => {
        const y = ys[i];
        if (step >= 1) {
          st.line([[MIDDLE, y], [v, y]], { color: 'data', width: 2, alpha: 0.75 });
          st.label(`${signed(WEEK_DEV[i])}`, (MIDDLE + v) / 2, y + 0.012, {
            align: 'center', size: 11, weight: 700, color: 'data',
          });
        }
        st.dots([[v, y]], { r: 4.5, fill: 'data', alpha: 0.9 });
        st.label(`${WEEK_DAYS[i]} ${v}`, v + 0.6, y + 0.012, {
          align: 'left', size: 11, weight: 600, color: 'ink2',
        });
      });

      if (step >= 2) {
        st.bars(slots.map((s, i) => ({ x0: s.x0, x1: s.x1, h: sideToY(st, s.w) })), {
          color: 'data', gap: 0, alpha: step >= 3 ? 0.35 : 0.7,
        });
        const big = slots[4];
        st.label(`${Math.abs(WEEK_DEV[4])} × ${Math.abs(WEEK_DEV[4])}`,
          (big.x0 + big.x1) / 2, sideToY(st, big.w) / 2, {
            align: 'center', size: 11.5, weight: 700, color: 'ink',
          });
      }

      if (step >= 3) {
        const h = sideToY(st, WEEK_SD);
        st.bars([{ x0: AVG_X0, x1: AVG_X0 + WEEK_SD, h }], { color: 'result', gap: 0, alpha: 0.55 });
        st.line(squareOutline(st, AVG_X0, WEEK_SD), { color: 'result', width: 2 });
        st.label(`${whole(WEEK_VAR)}`, AVG_X0 + WEEK_SD / 2, h / 2, {
          align: 'center', size: 12, weight: 700, color: 'result',
        });
      }

      /* The reader's own square stands in the same corner as the average square, so the
         two can be compared by watching one grow into the other. */
      if (sided && step < 4) {
        st.line(squareOutline(st, AVG_X0, side), { color: 'ink', width: 2, dash: 4 });
      }

      if (step >= 4) {
        st.bracket(AVG_X0, AVG_X0 + WEEK_SD, -0.03, {
          color: 'result', down: true, label: `${min1(WEEK_SD)} min`,
        });
        st.bracket(MIDDLE, MIDDLE + WEEK_SD, LADDER_TOP + 0.045, {
          color: 'result', label: `${min1(WEEK_SD)} min`,
        });
      }
    },
  });

  const steps = kit.ui.steps([
    {
      title: 'How far each journey sat from the middle',
      body: `${listOf(WEEK_DEV, signed)} minutes. Three of the five ran early and two ran late. `
        + 'Add those five distances up and they come to zero, and they would come to zero on any '
        + 'set of numbers whatsoever, because that is what the middle is. So the distances cannot '
        + 'be averaged as they stand: the answer would be zero every time, on a tight crowd and a '
        + 'loose one alike.',
    },
    {
      title: 'Square each distance, so nothing cancels',
      body: `${listOf(WEEK_SQ)} square minutes. A negative distance multiplied by itself comes out `
        + 'positive, so the early mornings stop cancelling the late ones. On the figure each '
        + 'distance has become a square with that distance as its side, which is what the word '
        + 'means: Friday, 14 minutes out from the middle, is now 196 square minutes of floor.',
    },
    {
      title: 'Average the squares',
      body: `The five areas come to ${WEEK_SS} square minutes. Shared out, that is `
        + `${whole(WEEK_VAR)} square minutes: the size of the average square. The sharing is `
        + `between four rather than five, which is a real question with a real answer rather than `
        + 'a rounding trick, and the second block below has it. Every calculator and every '
        + 'spreadsheet does the same thing.',
    },
    {
      title: 'Take the square root, to get back to minutes',
      body: `A square of ${whole(WEEK_VAR)} square minutes is ${min1(WEEK_SD)} minutes along each `
        + `side. That is the answer: on this week, the typical distance from the middle is about `
        + `${min1(WEEK_SD)} minutes. Square minutes were never a unit anybody could picture, and `
        + 'the root puts the answer back into the units of the thing that was measured.',
    },
  ]);

  const yourSq = kit.ui.readout({
    label: 'Your square', value: `${min1(side)} × ${min1(side)} = ${whole(side * side)}`, tone: 'plain',
  });
  const target = kit.ui.readout({
    label: 'The average square', value: 'not yet', tone: 'result', live: true,
  });

  const reveal = liveBox();

  const sideSlider = kit.ui.slider({
    label: 'The side of your square',
    min: 1, max: 15, step: 0.1, value: side, unit: 'min',
    fmt: (v) => min1(v),
    onInput: (v) => {
      side = Number(v);
      sided = true;
      yourSq.set(`${min1(side)} × ${min1(side)} = ${whole(side * side)}`);
      fig.draw();
    },
  });

  function showStep(n) {
    step = n;
    steps.reveal(n - 1);
    if (n >= 3) target.set(`${whole(WEEK_VAR)} square minutes`);
    fig.draw();
  }

  const next = kit.ui.button({
    label: 'Show the next instruction',
    kind: 'primary',
    onClick: () => {
      showStep(Math.min(3, step + 1));
      if (step < 3 || !nextEl) return;
      const hadFocus = document.activeElement === nextEl;
      nextEl.disabled = true;
      if (hadFocus && sideEl) sideEl.focus({ preventScroll: true });
    },
  });
  nextEl = asButton(next.el);

  const commit = kit.ui.button({
    label: 'My square is this wide',
    kind: 'primary',
    onClick: () => {
      state.setSide(side);
      showStep(4);
      if (nextEl) nextEl.disabled = true;
      if (reveal.childElementCount) return;
      reveal.append(named(
        'That number has a name, and now it earns a letter',
        `You worked backwards from an area to a side, which is what a square root is. The average `
        + `square came to ${whole(WEEK_VAR)} square minutes, so its side is ${min1(WEEK_SD)} `
        + 'minutes, and that is the standard deviation of this week. The four instructions in the '
        + `list above are the whole definition. Run them on the 41's forty journeys instead of `
        + `these five and the answer is ${min1(SD_F1)} minutes, which is the width you dragged a `
        + `bracket to two screens ago; run them on the 6 and it is ${min1(SD_SIX)}.`,
        'Written down, the standard deviation of a set of numbers is s. The letter is doing one '
        + 'job, standing in for the phrase "the standard deviation of these numbers", in the same '
        + 'way that a plus sign stands in for "add". The average of the squares, the '
        + `${whole(WEEK_VAR)} square minutes before the root was taken, has its own name and its `
        + 'own written form: it is the variance, and it is written s², which is read aloud as "s '
        + 'squared" and means s multiplied by itself. The two symbols are the same fact written on '
        + 'either side of a square root, one in square minutes and one in minutes.',
        'From here on this unit writes s rather than spelling the phrase out, because you have '
        + 'done the thing the letter stands for. The shorthand that packs "add up all the squared '
        + 'distances" into a single character belongs to 08-wobble, and it arrives there '
        + 'because s has to sit inside a larger expression by then and English will not nest.',
      ));
      reveal.append(deeper(
        'Why square them, rather than drop the minus signs',
        'The usual line is that squaring gets rid of the minus signs. That cannot be the whole '
        + 'reason, because ignoring the signs also gets rid of them: take the distance of each '
        + `journey from the middle, forget which side it fell on, and average those. On this week `
        + `that comes to ${min1(WEEK_DEV.reduce((a, d) => a + Math.abs(d), 0) / WEEK.length)} `
        + 'minutes. It is a perfectly good summary, it has a name, the mean absolute deviation, '
        + 'and on a bell-shaped pile it runs about four fifths of the standard deviation. Readers '
        + 'who notice this and get told "we square to remove the sign" have been fobbed off, and '
        + 'they know it.',
        'The real reason is that squared distances add up and unsquared ones do not. Put two '
        + 'independent sources of wobble together, a slow bus and a slow lift, and the variances '
        + 'of the two add to give the variance of the total; the mean absolute deviations do no '
        + 'such thing. Everything in Part III leans on that one property, which is why the '
        + 'stranger-looking summary is the one that survived. 08-wobble is where the debt gets '
        + 'paid.',
        'There is a second reason, and it arrives in 14-line. The middle is the single number '
        + 'whose squared distances come to the smallest total, so squaring is already the '
        + 'measuring stick the mean was built with. Fitting a line by making its squared misses '
        + 'as small as possible is the same idea one dimension up.',
      ));
      reveal.append(deeper(
        'Why the sharing out is between four rather than five',
        `The five distances were measured from a middle that was itself worked out from these same `
        + 'five journeys. That middle sits wherever it has to sit to make the distances balance, '
        + 'which means it is closer to this particular week than the long-run middle of the whole '
        + 'route would be. Distances measured from it therefore come out slightly too small, on '
        + 'average, every time.',
        `Sharing the ${WEEK_SS} square minutes between four instead of five pushes the answer back `
        + `out by the right amount: ${whole(WEEK_VAR)} square minutes rather than `
        + `${min1(WEEK_SS / WEEK.length)}, and ${min1(WEEK_SD)} minutes rather than `
        + `${min1(Math.sqrt(WEEK_SS / WEEK.length))}. The rule is n − 1 where n is how many `
        + 'numbers you have, so it matters enormously on five journeys and hardly at all on three '
        + 'thousand.',
        'One honest footnote, because textbooks tend to leave it out. Dividing by n − 1 makes the '
        + 'variance come out right on average across repeated samples. It does not quite do the '
        + 'same for the standard deviation, because the square root of a quantity that is right on '
        + 'average is not itself right on average. The residual bias is small and nobody corrects '
        + 'for it in practice, and saying so is cheaper than letting you find out later that the '
        + 'tidy story had a seam in it.',
      ));
    },
  });
  sideEl = asButton(commit.el);

  wrap.append(
    fig.el,
    controls(next.el),
    steps.el,
    para(`Instruction four is one you can do yourself. The average square covers `
      + `${whole(WEEK_VAR)} square minutes of floor. How wide is it? Set a side, watch the area in `
      + 'the readout, and commit when your square looks the same size as it.'),
    controls(sideSlider.el, commit.el),
    readoutRow(yourSq.el, target.el),
    reveal,
  );
  return wrap;
}

/* ---------------------------------------------------------------------------
   Beat 4. Two summaries of the same crowd, and one morning that tells them apart. */

function sectionOutlier(kit, data) {
  const wrap = block();
  wrap.append(heading('One morning behind a burst water main'));
  wrap.append(para(
    `The transport authority holds every morning-peak journey the 6 made last year, `
    + `${YEAR_N.toLocaleString('en-GB')} of them, which is the pile below. It has the same middle `
    + `and the same s as the forty journeys you started with: ${min1(MIDDLE)} minutes and `
    + `${min1(SD_SIX)} minutes. One morning in February a 6 sat behind a burst water main on the `
    + `ring road and took ${FREAK} minutes.`));

  const base = data.year6;
  const withFreak = base.values.concat([FREAK]);
  const counts = new Array(YEAR_MAX + 1).fill(0);
  base.values.forEach((v) => {
    const b = Math.max(0, Math.min(YEAR_MAX - 1, Math.floor(v)));
    counts[b] += 1;
  });
  const peak = Math.max(...counts);
  const top = peak * 1.4;
  const pileLo = kit.stats.min(base.values);
  const pileHi = kit.stats.max(base.values);

  let added = false;
  const values = () => (added ? withFreak : base.values);
  const rangeNow = () => kit.stats.range(values());
  const sdNow = () => kit.stats.sd(values());
  const meanNow = () => kit.stats.mean(values());
  const lo = () => kit.stats.min(values());
  const hi = () => kit.stats.max(values());

  const rangeOut = kit.ui.readout({ label: 'Range', value: `${min1(rangeNow())} min`, tone: 'data', live: true });
  const sdOut = kit.ui.readout({ label: 's', value: `${min1(sdNow())} min`, tone: 'result', live: true });

  const fig = mountFigure(kit, {
    height: 280,
    caption:
      `Every morning-peak journey on the 6 for one invented year, ${YEAR_N.toLocaleString('en-GB')} `
      + `journeys drawn in world ${kit.seed}, counted into one-minute columns. The axis runs to `
      + `${YEAR_MAX} minutes throughout, so the pile keeps the same width on screen whether or not `
      + 'the February morning is in it. The upper bar measures the range, from the fastest journey '
      + 'to the slowest. The lower bar reaches one s out on each side of the middle. Watch which '
      + 'of the two bars changes when one journey is added to three thousand.',
    describe: () => `A column chart of ${values().length.toLocaleString('en-GB')} journeys on the `
      + `6, in minutes, ${added ? 'including' : 'without'} the ${FREAK}-minute February morning. `
      + `The pile stands between ${min1(pileLo)} and ${min1(pileHi)} minutes`
      + `${added ? `, with one lone column far out to the right at ${FREAK}` : ''}. The range is `
      + `${min1(rangeNow())} minutes and s is ${min1(sdNow())} minutes.`,
    draw: (st) => {
      st.domain(0, YEAR_MAX, 0, top).pad(46, 16, 22, 28);
      st.axisY(4);
      st.axisX(6);
      st.note('journeys', 10, 12, { align: 'left', size: 11, color: 'ink2', weight: 600 });
      st.note('minutes on the bus', st.W - 8, 12, { align: 'right', size: 11, color: 'ink2', weight: 600 });
      const bins = counts.map((c, i) => ({ x0: i, x1: i + 1, h: c })).filter((b) => b.h > 0);
      if (added) bins.push({ x0: FREAK, x1: FREAK + 1, h: 1 });
      st.bars(bins, { color: 'data', gap: 0.5, alpha: 0.9 });
      if (added) {
        st.vline(FREAK + 0.5, { color: 'data', width: 1.5, dash: 4, alpha: 0.5 });
        st.label('one journey', FREAK + 0.5, top * 0.16, {
          align: 'center', size: 11, weight: 600, color: 'data',
        });
      }
      st.bracket(lo(), hi(), top * 0.93, {
        color: 'data', label: `range ${min1(rangeNow())} min`,
      });
      const m = meanNow();
      const s = sdNow();
      st.bracket(m - s, m + s, top * 0.66, {
        color: 'result', label: `s, ${min1(s)} min each side`,
      });
    },
  });

  const gate = liveBox();
  const after = liveBox();
  let guessed = false;
  let rangeBtn = null;
  let sdBtn = null;

  function guess(saidRange) {
    [rangeBtn, sdBtn].forEach((b) => {
      if (!b) return;
      b.disabled = true;
    });
    if (guessed) return;
    guessed = true;
    const toggle = kit.ui.toggle({
      label: `Put the ${FREAK}-minute morning in`,
      checked: false,
      onChange: (on) => {
        added = on === undefined ? !added : Boolean(on);
        rangeOut.set(`${min1(rangeNow())} min`);
        sdOut.set(`${min1(sdNow())} min`);
        fig.draw();
        if (added && !after.childElementCount) closeUp();
      },
    });
    gate.replaceChildren(
      para(saidRange
        ? 'That is the way it goes, and the size of it is worth seeing rather than being told. '
          + 'Put the morning in.'
        : 'Both numbers do move, so this is not a wrong guess so much as a question of how much. '
          + 'Put the morning in and watch the two bars.'),
      controls(toggle.el),
    );
    const input = asInput(toggle.el);
    if (input) input.focus({ preventScroll: true });
  }

  function closeUp() {
    const rangeBefore = kit.stats.range(base.values);
    const sdAfter = kit.stats.sd(withFreak);
    after.append(named(
      'Two summaries, one of them decided by two journeys',
      `The range is the distance from the fastest journey to the slowest, and it is a summary of `
      + `exactly two of the ${YEAR_N.toLocaleString('en-GB')} mornings. One burst water main takes `
      + `it from ${min1(rangeBefore)} minutes to ${min1(kit.stats.range(withFreak))}, and it will `
      + 'stay there for as long as that morning is in the file, however many ordinary mornings '
      + 'follow it.',
      `s went from ${min1(SD_SIX)} minutes to ${min1(sdAfter)}, because s hears every journey and `
      + `the February morning is one voice in ${YEAR_N.toLocaleString('en-GB')}. It is a loud `
      + `voice: squaring means a journey ${whole(FREAK - MIDDLE)} minutes from the middle `
      + `contributes ${(FREAK - MIDDLE) ** 2} square minutes where an ordinary morning contributes `
      + `about ${min1(SD_SIX * SD_SIX)}. Loud, and outnumbered.`,
    ));
    after.append(para(
      'The size of that rescue depends on how much other evidence there is, and it is worth being '
      + 'exact about it rather than leaving you with a slogan. Time only forty journeys on the 6, '
      + `drop the same ${FREAK}-minute morning into those, and s goes from ${min1(SD_SIX)} minutes `
      + `to about ${min1(kit.stats.sd(data.six.values.concat([FREAK])))}. One journey in forty is a `
      + 'fortieth of the evidence and the squaring makes it shout. s is not immune to a freak '
      + 'value. It is outvoted by a big enough crowd, and the range never is, because two numbers '
      + 'decide it whether there are forty of them or three thousand.'));
  }

  const sayRange = kit.ui.button({ label: 'The range', kind: 'ghost', onClick: () => guess(true) });
  const saySd = kit.ui.button({ label: 's, the standard deviation', kind: 'ghost', onClick: () => guess(false) });
  rangeBtn = asButton(sayRange.el);
  sdBtn = asButton(saySd.el);

  wrap.append(
    fig.el,
    readoutRow(rangeOut.el, sdOut.el),
    para('Before you add that morning to the year, say which of the two numbers beside the figure '
      + 'moves more when it goes in.'),
    controls(sayRange.el, saySd.el),
    gate,
    after,
  );
  return wrap;
}

/* ---------------------------------------------------------------------------
   Beat 5. The distortion, operated: a true number on a bus stop panel, and what it
   costs the person reading it. */

function sectionPanel(kit, data) {
  const wrap = block();
  wrap.append(heading('What the panel at the bus stop prints'));
  wrap.append(para(
    'The operator has room for one line per route on the panel at the stop, and both routes '
    + `genuinely average ${min1(MIDDLE)} minutes. Below is a year of journeys on each route rather `
    + 'than a month, so nothing here turns on a small sample. Choose what the panel prints and '
    + 'read what a passenger can work out from it.'));

  const y6 = data.year6.values;
  const y41 = data.year41.values;
  const late6 = kit.stats.quantile(y6, 0.95);
  const late41 = kit.stats.quantile(y41, 0.95);
  const best6 = kit.stats.min(y6);
  const best41 = kit.stats.min(y41);
  const worst6 = kit.stats.max(y6);
  const worst41 = kit.stats.max(y41);
  /* How often allowing the advertised average leaves you standing at a closed door.
     Counted on the year rather than reasoned about, because the 41's pile is lopsided
     and the two routes do not come out the same. */
  const over6 = share(y6.filter((v) => v > MIDDLE).length, y6.length);
  const over41 = share(y41.filter((v) => v > MIDDLE).length, y41.length);

  const panel6 = kit.ui.readout({ label: 'The 6, on the panel', value: '', tone: 'data', live: true });
  const panel41 = kit.ui.readout({ label: 'The 41, on the panel', value: '', tone: 'data', live: true });
  const plan6 = kit.ui.readout({ label: 'The 6, 19 mornings in 20', value: `${whole(late6)} min`, tone: 'result' });
  const plan41 = kit.ui.readout({ label: 'The 41, 19 mornings in 20', value: `${whole(late41)} min`, tone: 'result' });

  const says = liveBox();

  const lines = {
    mean: {
      six: `average ${min1(MIDDLE)} min`,
      f1: `average ${min1(MIDDLE)} min`,
      text: 'Two identical lines, both true. A passenger reading this panel cannot tell the two '
        + 'routes apart and cannot work out what time to leave. Allow the advertised '
        + `${min1(MIDDLE)} minutes and you are still on the bus at 9am on ${over6}% of mornings on `
        + `the 6 and ${over41}% of mornings on the 41.`,
    },
    range: {
      six: `average ${min1(MIDDLE)} min, range ${whole(best6)} to ${whole(worst6)} min`,
      f1: `average ${min1(MIDDLE)} min, range ${whole(best41)} to ${whole(worst41)} min`,
      text: 'The routes now look different, which is progress, and the number doing the work is '
        + 'the slowest morning of the year. Plan by it and you leave '
        + `${whole(worst6)} minutes early for the 6 and ${whole(worst41)} for the 41, allowing `
        + 'every day for something that happened once. A range is a distance between two extremes '
        + 'and it never says how often either of them turns up, which is why the panel is now '
        + 'longer without being much more use.',
    },
    sd: {
      six: `average ${min1(MIDDLE)} min, s ${min1(SD_SIX)} min`,
      f1: `average ${min1(MIDDLE)} min, s ${min1(SD_F1)} min`,
      text: `Two numbers each, and the routes come apart: ${min1(MIDDLE)} give or take `
        + `${min1(SD_SIX)} against ${min1(MIDDLE)} give or take ${min1(SD_F1)}. A bracket two s `
        + 'wide either side of the middle catches all but about one morning in twenty on piles '
        + `like these, so a passenger can do the arithmetic on the panel: `
        + `${whole(MIDDLE + 2 * SD_SIX)} minutes for the 6 and ${whole(MIDDLE + 2 * SD_F1)} for `
        + `the 41. The year of journeys says ${whole(late6)} and ${whole(late41)}. Two numbers on `
        + 'a sign got a passenger within a minute of the truth on both routes.',
    },
  };

  function show(key) {
    const line = lines[key];
    panel6.set(line.six);
    panel41.set(line.f1);
    says.replaceChildren(para(line.text));
  }

  const choice = kit.ui.segmented({
    label: 'What the panel prints',
    options: [
      { value: 'mean', label: 'The average' },
      { value: 'range', label: 'Average and range' },
      { value: 'sd', label: 'Average and s' },
    ],
    value: 'mean',
    onChange: show,
  });
  show('mean');

  wrap.append(
    controls(choice.el),
    readoutRow(panel6.el, panel41.el),
    says,
    readoutRow(plan6.el, plan41.el),
    quiet('The last two readouts come from the year of journeys itself rather than from the panel: '
      + 'they are the times that got a passenger to the hospital on 19 mornings out of 20 on each '
      + 'route.'),
    warned(
      'Every number on that panel is true',
      `Nobody typed a false figure. The 6 averages ${min1(MIDDLE)} minutes and so does the 41, and `
      + 'the panel that prints only those two numbers is accurate and useless. The half that is '
      + `missing is about a quarter of an hour of somebody's morning, every morning, and it `
      + 'is the difference between a passenger who makes the appointment and one who is told to '
      + 'rebook.',
      'This one is rarely done on purpose. An average is the number a spreadsheet offers first, it '
      + 'fits in a sentence, and a second number always looks like clutter to whoever is laying '
      + 'out the panel. You will publish a middle with no spread yourself at some point, and the '
      + 'habit that catches it is asking, before the thing goes out, what the crowd behind the '
      + 'average looked like.',
      'The question to carry away is not whether an average is being quoted. Averages are fine. It '
      + 'is whether the person quoting it could tell you how wide the crowd was, and whether the '
      + 'people acting on it need to know.',
    ),
  );
  return wrap;
}

/* ---------------------------------------------------------------------------
   Beat 6: the same shape of claim, somewhere with nothing to do with buses. */

function sectionEcho(kit) {
  const wrap = block();
  wrap.append(heading('Two hospitals, the same average wait'));
  wrap.append(para(
    'Two emergency departments publish their figures for the year, and both report a mean wait of '
    + '3 hours 10 minutes. At the county hospital nearly everybody waits between two and a half '
    + 'and four hours. At the city hospital most people are seen inside an hour, and one patient '
    + 'in eight waits longer than eight hours.'));

  wrap.append(kit.ui.quiz({
    question: 'Which sentence is fair to both hospitals?',
    options: [
      {
        label: 'The two are performing about the same. The average wait is the average wait.',
        correct: false,
        why: 'The two averages really are equal, and for a whole year of patients the total time '
          + 'spent waiting comes out the same at both places, so this is not a careless answer. '
          + 'What it cannot see is that the same 3 hours 10 minutes is built out of two completely '
          + 'different nights. One patient in eight at the city hospital is having an experience '
          + 'that nobody at the county hospital is having.',
      },
      {
        label: 'The city hospital is better, because most people there are seen inside an hour.',
        correct: false,
        why: 'Most people are, and for most people it is the better door to walk through. The '
          + 'sentence goes wrong by dropping the eighth of patients waiting past eight hours, '
          + 'which is the group every argument about emergency care is actually about. Describing '
          + 'the majority and leaving out the tail is the same move as quoting a middle with no '
          + 'spread, one storey up.',
      },
      {
        label: 'One average is coming out of two different nights. Ask each hospital how long the '
          + 'long waits are and how many people have them.',
        correct: true,
        why: 'The averages match and the spreads do not, so the average has stopped being a useful '
          + 'comparison and the next question is about the shape of each pile. That is a complete '
          + 'sentence and it is also the only one of the three that tells a health board what to '
          + 'go and ask for.',
      },
    ],
  }).el);

  wrap.append(para(
    "England's NHS reports emergency care not as an average wait but as the share of "
    + 'patients admitted, transferred or discharged within four hours. Choosing a threshold '
    + 'instead of a mean is a decision about spread: an average can be held down by a fast '
    + 'majority while the longest waits get longer, and the four-hour figure moves when they do.'));

  return wrap;
}

/* ---------------------------------------------------------------------------
   The close: plain-word descriptions of what happened, each with the term the rest of
   the world uses for it and the unit that picks it up. */

function sectionRecap(kit, state) {
  const wrap = block();
  wrap.append(heading('Four things you did'));
  wrap.append(para(
    'One letter arrived on this screen, and it arrived last, after you had done the thing it '
    + 'stands for with a slider and a bracket. Everything below is sayable without it.'));

  const steps = kit.ui.steps([
    {
      title: 'You chose a bus on something the average could not tell you',
      body: 'Two routes with the same 24.0-minute middle, and you picked the one whose journeys '
        + 'disagreed with each other less. How much a crowd of numbers disagrees with itself is '
        + 'its spread, and 03-pile is where the shape of that crowd gets read off a picture.',
    },
    {
      title: 'You measured a spread with your hands',
      body: 'You reached a bracket out from the middle until it had caught most of the journeys, '
        + 'and read the width off in minutes. Pull it back to about two thirds of the journeys and '
        + 'you are on the standard deviation, which is a distance from the middle in the units of '
        + 'the thing you measured.',
    },
    {
      title: 'You wrote it down as four instructions, then as a letter',
      body: 'Distance from the middle for each journey, square each one, average the squares, take '
        + 'the square root. The average of the squares is the variance, written s², and its square '
        + 'root is the standard deviation, written s. 08-wobble is where s goes inside something '
        + 'bigger and picks up the notation for the adding-up step.',
    },
    {
      title: 'You broke the range with one morning and watched s hold',
      body: 'The range is the distance from smallest to largest, and two journeys decide it. s '
        + 'listens to every journey, which is why a crowd of three thousand can outvote a freak '
        + 'and a crowd of forty cannot. 04-middle does the same comparison for the middle, where '
        + 'the mean moves and the median does not.',
    },
    {
      title: 'You published a true panel that told a passenger nothing',
      body: 'A middle with no spread is a half-truth with a clean face. It is the most common one '
        + 'in public life, because it is the shortest thing to print and nobody has to lie to '
        + 'produce it. 16-rhetoric is this whole toolkit turned around: reading the claims other '
        + 'people make, and writing ones that survive being checked.',
    },
  ]);
  for (let i = 0; i < 5; i++) steps.reveal(i);
  wrap.append(steps.el);

  /* The screen only quotes what the reader actually chose. A recap that invents a
     decision for somebody who never made one is the exact failure this site is built
     against, and it is invisible in testing because the happy path always sets it. */
  const mine = liveBox();
  const lines = { bracket: null, side: null };
  const rewrite = () => {
    const out = [];
    if (lines.bracket) out.push(para(lines.bracket));
    if (lines.side) out.push(para(lines.side));
    mine.replaceChildren(...out);
  };
  state.onBracket((b) => {
    if (b.six == null || b.f1 == null) return;
    lines.bracket = `You called most of them at ${min1(b.six)} minutes each side on the 6 and `
      + `${min1(b.f1)} on the 41. The arithmetic's own answers are ${min1(SD_SIX)} and `
      + `${min1(SD_F1)}, and the ratio between your two numbers is the thing to look at rather `
      + 'than either one on its own.';
    rewrite();
  });
  state.onSide((v) => {
    lines.side = `Your square came out ${min1(v)} minutes a side against the ${min1(WEEK_SD)} the `
      + 'root gives. Working back from an area to a side is the only step in the recipe that has '
      + 'no shortcut, which is why it is the one worth having done by hand once.';
    rewrite();
  });
  wrap.append(mine);

  wrap.append(para(
    'Part III is built on s. The wobble in a result you would get by running a study again is a '
    + 'spread, measured the same four ways, and 08-wobble puts s inside the expression that '
    + 'measures it. The bell in 09-bell is the shape that made two thirds a useful rule of thumb '
    + 'in the first place. The honest range in 10-range is a middle with its spread attached, '
    + 'which is what the panel at the bus stop should have printed.'));

  const link = el('a', 'ec-button', 'Back to the map');
  link.href = '#/map';
  /* .ec-button has no display of its own, so an anchor needs one to keep the 44 px target
     it was designed with. router.js does the same three lines for the same reason. */
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

function head(kit) {
  const h = el('div', 'prose lesson__head');
  h.append(el('p', 'kicker', 'Unit 5 · about 20 minutes'));
  h.append(el('h1', null, 'The spread'));
  h.append(el('p', 'lesson__q', 'Is this crowd tight or loose, and why does that matter more than the middle?'));
  h.append(el('p', 'lede',
    'Two buses go to the same hospital and both take 24 minutes on average. One of them will get '
    + 'you to a 9am appointment and the other is a gamble, and their averages cannot tell you '
    + 'which is which. This unit is about the number that can, and about how much of a morning it '
    + 'is worth.'));
  h.append(quiet(
    `Every journey on this screen is invented, drawn in world ${kit.seed}. The two routes were `
    + 'built to have exactly the same average, because a shared average is the situation the unit '
    + 'is about.'));
  return h;
}

/* The two things that cross a section boundary: the widths the reader committed with the
   bracket, and the side they gave their own square. Both are read back in the close, and
   only if they exist. */
function makeState() {
  const brackets = [];
  const sides = [];
  return {
    bracket: { six: null, f1: null },
    side: null,
    onBracket(fn) { brackets.push(fn); if (this.bracket.six != null || this.bracket.f1 != null) fn(this.bracket); },
    setBracket(route, v) { this.bracket[route] = v; brackets.forEach((fn) => fn(this.bracket)); },
    onSide(fn) { sides.push(fn); if (this.side != null) fn(this.side); },
    setSide(v) { this.side = v; sides.forEach((fn) => fn(v)); },
  };
}

function render(root, ctx) {
  const ui = ctx.ui;
  const stats = ctx.stats;
  const stage = ctx.stage || (ctx.viz && ctx.viz.stage);
  /* The contract puts a bound stage on ctx and main.js also passes the viz module, so
     either spelling is accepted. The world factory is taken from ctx when it is offered
     and from core/rng.js otherwise, because a lesson that quietly stopped rebuilding a
     world from its number would go on printing "drawn in world 42" while it was no
     longer true. */
  const makeRng = typeof ctx.makeRng === 'function'
    ? ctx.makeRng
    : (ctx.rng && typeof ctx.rng.makeRng === 'function' ? ctx.rng.makeRng : coreMakeRng);

  if (!ui || !stats || !stage) {
    throw new Error('05-spread needs ui, stats and a drawing stage on the lesson context.');
  }

  const kit = {
    ui,
    stats,
    stage,
    makeRng,
    engine: ctx.engine || null,
    seed: ctx.seed == null ? 42 : ctx.seed,
    /* Every figure on this screen is built from the one world the reader arrived with,
       and nothing here rolls a new one, so there is never a world to write back. The
       field is kept because a later revision that adds a roll must call it: a lesson
       that changes its world without writing it into the address bar hands the reader a
       link that goes somewhere else. */
    setSeed: typeof ctx.setSeed === 'function' ? ctx.setSeed : null,
    bin: [],       // teardown jobs
    redraws: [],   // one per figure
  };

  /* Four datasets, all from this page's world: a month on each route, and a year on
     each route. Built once, here, so that every section is drawing the same journeys
     and no section can quietly re-roll them. */
  const data = {
    six: route(kit, 'six', N_TIMED, 'six'),
    f1: route(kit, 'f1', N_TIMED, 'lottery'),
    year6: route(kit, 'year6', YEAR_N, 'six'),
    year41: route(kit, 'year41', YEAR_N, 'lottery'),
  };

  const state = makeState();

  const body = el('div', 'lesson__body');
  body.append(
    sectionSameMiddle(kit, data),
    sectionBracket(kit, data, state),
    sectionRecipe(kit, state),
    sectionOutlier(kit, data),
    sectionPanel(kit, data),
    sectionEcho(kit),
    sectionRecap(kit, state),
  );
  root.append(head(kit), body);

  /* Canvases can only measure themselves once they are on the page. */
  const repaint = () => { kit.redraws.forEach((draw) => draw()); };
  repaint();

  /* viz.js holds the colours it read out of the stylesheet for a fraction of a second,
     so a redraw fired the instant the scheme changes can still be painting in the old
     palette. Paint now, and again once that cache has certainly expired, because most
     of these figures never redraw on their own. */
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
     lesson watches the mount and packs up the moment its own body stops being part of
     the page. Watching our own node rather than the event means a lesson rendered twice
     into the same mount never tears down the copy still on screen. */
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
  id: '05-spread',
  unit: 'II',
  title: 'The spread',
  question: 'Is this crowd tight or loose, and why does that matter more than the middle?',
  minutes: 20,
  render,
};
