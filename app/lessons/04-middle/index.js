/* 04-middle/index.js
   Unit 4. Forty households on one street, one of them on $2.4 million. The reader marks
   where they think the street sits, slides a prop under a plank until it balances, crosses
   off the ends until two households are left, and then files a true sentence about the
   street that leaves everyone who reads it wrong. */

/* Each figure draws from its own named stream, so two of them can never accidentally
   share a sequence, and that needs the factory rather than the single generator ctx.rng
   hands over. main.js passes it as ctx.makeRng, and this import is the guarantee the
   lesson still works if it ever stops doing so. */
import { makeRng as coreMakeRng } from '../../core/rng.js';

/* The data roles arrive from viz.js as a frozen palette, and every mark below is given
   its color as one of these constants rather than as the name of its role. The reason
   is in viz.paint(): it resolves a color by looking the value up in a table that runs
   from palette constant to role, so a constant comes back as the themed version of that
   role, and a string it does not recognize comes back unchanged, which a canvas then
   ignores. Roles still mean exactly what they mean everywhere else on the site: data for
   the households, result for a summary of them, ink for something the reader placed. */
import { COLORS as HUE } from '../../core/viz.js';

/* ---------------------------------------------------------------------------
   The scenario. Ferrier Row: forty households, yearly income in dollars.

   Thirty-nine of the incomes are drawn, so the street changes with the world. The
   fortieth is set by hand, because the whole unit turns on one household sitting a
   long way from the other thirty-nine, and a drawn value could not be relied on to
   do that. Every number the screen quotes is computed from the incomes themselves;
   nothing about this street is written down twice. */
const STREET = 'Ferrier Row';
const N_HOMES = 40;
const N_REST = 39;

const TOP_START = 2400000;   // $ a year at number 1, as the county recorded it
const TOP_MAX = 10000000;    // $ a year, as far as the reader can push it
const TOP_STEP = 100000;

const REST_MID = 33000;      // $ a year, the middle of the other thirty-nine
const REST_SHAPE = 0.24;     // how wide that crowd runs, multiplicatively
/* Clamped to the axis that will draw them. viz.js does not clip, and the generator can
   reach 6.7 standard deviations, which on this shape is an income of $166,000: a second
   household off the side of the picture, in the one unit that needs exactly one. Counted
   across worlds 1 to 4000, the clamps bite on about one draw in four hundred, so nine
   streets in ten never meet them and the ends of the crowd are drawn rather than
   imposed. */
const REST_LO = 15000;
const REST_HI = 66000;

const STRIP_HI = 70000;      // $ a year; the axis for the first and third figures
const ROW_Y = 0.46;          // where the crowd sits in the 0-to-1 vertical data space
const ROW_J = 0.17;          // how far a dot may sit from that line
const TICK_HALF = 0.30;      // half-height of a mark drawn across the crowd

/* The plank. It runs to $2.5 million so the far weight is on it rather than implied,
   and the prop only travels along the left-hand tenth, which is as far as it needs to
   go on this street. */
const PLANK_HI = 2500000;
const PROP_MAX = 250000;
const PROP_STEP = 1000;
const PROP_START = 20000;
/* $; how close to the balance point still reads as level. Wide enough to be findable by
   dragging a thumb across a 320 px phone, where one step of the dial is close to one
   pixel, and narrow enough that the plank at the edge of it is visibly flat: four
   thousand dollars out moves the far end of the plank by about six pixels in two
   hundred and forty. */
const BALANCE_TOL = 4000;
const PLANK_Y = 0.34;        // the height of the pivot, in the 0-to-1 vertical data space
const TILT_MAX = 0.30;       // how far the far end of the plank swings, up or down
const TILT_REF = 40000;      // $ of imbalance per household that counts as a full tip
/* Half the width of the prop, in data units. Narrow, because near the left-hand end of
   the dial the foot on that side is drawn off the edge of the canvas, and a prop with a
   short foot loses less of itself there. */
const PROP_HALF = 0.02 * PLANK_HI;
const HEAP_ROWS = 13;        // the pile of thirty-nine is this many weights tall

/* $1,234, with no dependence on the reader's locale. */
const money = (v) => '$' + String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
/* $2.4 million, and $2.4m where an axis has no room for the word. */
const millions = (v) => '$' + (Math.round(v / 100000) / 10) + ' million';
const mShort = (v) => '$' + (Math.round(v / 100000) / 10) + 'm';
const thousands = (v) => (v === 0 ? '$0' : '$' + Math.round(v / 1000) + 'k');

/* ---------------------------------------------------------------------------
   Small DOM helpers, the same set 01-noticing uses. Lessons build real nodes and wire
   them; there is no template language here and nothing to compile. */

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

/* The range input inside a slider, for the one place a commitment has to hand its
   focus on to a dial rather than to a button. */
function asRange(node) {
  if (!node || typeof node.querySelector !== 'function') return null;
  return node.querySelector('input[type="range"]');
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
   The street.

   Incomes are drawn multiplicatively, which is the shape earned income actually
   has: a middle around $33,000 with the room above it wider than the room below.
   They are then clamped to the axis that will draw them, because viz.js does not
   clip and a household drawn off the side of the picture is a household the reader
   cannot count. Rounded to the nearest $100, the way a survey would report them. */

function makeStreet(kit) {
  const r = kit.makeRng(`04-middle/incomes/${kit.seed}`);
  const rest = [];
  for (let i = 0; i < N_REST; i++) {
    const raw = REST_MID * Math.exp(REST_SHAPE * r.n(0, 1));
    rest.push(Math.round(Math.min(REST_HI, Math.max(REST_LO, raw)) / 100) * 100);
  }
  rest.sort((a, b) => a - b);
  /* Vertical jitter so that two households on similar incomes do not hide each other.
     It carries no meaning, and the caption says so. */
  const jitter = rest.map(() => r.u() * 2 - 1);

  const all = (top) => rest.concat([top]);
  const sumRest = kit.stats.sum(rest);

  /* The axis for the last figure has to hold the mean at its largest, and it is fixed
     for the whole session so that dragging the dial moves the marks rather than the
     ruler underneath them. */
  const axisTop = Math.ceil(((sumRest + TOP_MAX) / N_HOMES + 15000) / 50000) * 50000;

  return {
    rest,
    jitter,
    lo: rest[0],
    hi: rest[N_REST - 1],
    sumRest,
    axisTop,
    /* Quoted in a spoken description, so it is counted rather than asserted: across
       worlds 1 to 4000 this runs from 19 to 36 of the thirty-nine, and a sentence
       saying "most of them" would be false at the bottom of that range. */
    under40: rest.filter((v) => v < 40000).length,
    meanAt: (top) => kit.stats.mean(all(top)),
    medianAt: (top) => kit.stats.median(all(top)),
    /* The two households left standing after nineteen rounds of crossing off. With
       forty in the line there is no single middle one, and these are the pair the
       median is computed between. */
    pair: [rest[19], rest[20]],
    belowMean: (top) => {
      const m = kit.stats.mean(all(top));
      return all(top).filter((v) => v < m).length;
    },
  };
}

/* ---------------------------------------------------------------------------
   Drawing. Two of the figures share one grammar: dollars a year run left to right on
   a fixed axis, the crowd is a row of jittered dots, and the household at number 1
   is marked at the right-hand edge because it is off the end of the picture. */

function stripFrame(st) {
  st.domain(0, STRIP_HI, 0, 1).pad(12, 14, 20, 30);
  st.axisX([0, 20000, 40000, 60000], thousands);
  st.note('income, $ a year', st.W - 8, 12,
    { align: 'right', size: 11, color: HUE.ink2, weight: 600 });
}

function rowMark(st, x, o = {}) {
  const half = o.half == null ? TICK_HALF : o.half;
  st.line([[x, ROW_Y - half], [x, ROW_Y + half]], {
    color: o.color, width: o.width == null ? 2.5 : o.width, dash: o.dash,
  });
}

/* The household that will not fit. Drawn hard against the right edge with its income
   written beside it, so nobody has to read the caption to find out that the picture
   stops before the street does. */
function edgeMark(st, top, faint) {
  st.line([[STRIP_HI - 500, ROW_Y - TICK_HALF], [STRIP_HI - 500, ROW_Y + TICK_HALF]], {
    color: HUE.data, width: 4, alpha: faint ? 0.25 : 0.95,
  });
  st.note(`number 1, ${mShort(top)}`, st.W - 8, 30, {
    align: 'right', size: 11, weight: 700, color: HUE.data,
  });
}

/* ---------------------------------------------------------------------------
   One helper mounts a canvas, keeps it correct through resizes and a switch to dark
   mode, and keeps the spoken description in step with the picture. The description is
   only written when it changes, so a plank being dragged does not narrate itself sixty
   times a second to a screen reader.

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
     the figure's caption; what the canvas says is now this lesson's job. */
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
   Beat 1. The reader puts a marker where they think the street sits, before anything
   is added up. The marker then stays on every picture below it. */

function sectionMark(kit, street, state) {
  const wrap = block();
  wrap.append(heading('Where does this crowd sit?'));
  wrap.append(para(
    `Each dot is one household on ${STREET}, sitting at what it earns in a year. Thirty-nine of `
    + `them fit on this axis. The fortieth, at number 1, earns ${millions(TOP_START)}, so it is `
    + 'marked at the right-hand edge instead. Slide the marker to the income you would name if a '
    + 'neighbor asked what people here earn, then press.'));

  const pts = street.rest.map((v, i) => [v, ROW_Y + street.jitter[i] * ROW_J]);

  /* Deliberately not the answer, and deliberately not the middle of the axis either:
     up in the thin part of the crowd, where somebody who presses without moving
     anything has still said something the screen can reply to. */
  let mark = 55000;
  let marked = false;

  const reveal = liveBox();

  const fig = mountFigure(kit, {
    height: 210,
    caption:
      `The forty yearly incomes on ${STREET}, in dollars, invented for this unit and drawn in `
      + `world ${kit.seed}. One dot is one household. The height of a dot means nothing: it is `
      + 'jitter, so that households on similar incomes do not hide behind each other. '
      + `Thirty-nine of them sit between ${money(street.lo)} and ${money(street.hi)}. The `
      + `fortieth earns ${millions(TOP_START)}, which would sit `
      + `${Math.round(TOP_START / STRIP_HI)} times further right than this axis reaches, so it `
      + 'is marked at the edge instead. Your marker is the tick you can move.',
    describe: () => {
      const shape = `Thirty-nine incomes drawn as dots between ${money(street.lo)} and `
        + `${money(street.hi)} a year, ${street.under40} of them below $40,000, and one `
        + `household marked at the right-hand edge of the picture at ${millions(TOP_START)}.`;
      return marked
        ? `${shape} Your marker sits at ${money(mark)}.`
        : `${shape} Your marker sits at ${money(mark)}, and nothing has been worked out yet.`;
    },
    draw: (st) => {
      stripFrame(st);
      st.dots(pts, { r: 5, fill: HUE.data, alpha: 0.8 });
      edgeMark(st, TOP_START, false);
      rowMark(st, mark, { color: HUE.ink2, width: 3 });
    },
  });

  const yours = kit.ui.readout({ label: 'Your mark', value: money(mark), tone: 'plain' });
  /* Both counts stay blank until the reader commits. Live from the first frame, they
     would hand over the answer to the next beat but one: a reader could hunt for the
     split that comes out even and find the median without ever being told there was
     one to find. Afterwards they follow the marker, because a sentence the reader can
     make false by dragging is a sentence this site does not write. */
  const under = kit.ui.readout({
    label: 'Households below it', value: 'not yet', tone: 'data', live: true,
  });
  const over = kit.ui.readout({
    label: 'Households above it', value: 'not yet', tone: 'data', live: true,
  });

  const counts = () => {
    const below = street.rest.filter((v) => v < mark).length;
    under.set(`${below} of ${N_HOMES}`);
    over.set(`${N_HOMES - below} of ${N_HOMES}`);
  };

  const refresh = () => {
    yours.set(money(mark));
    if (marked) counts();
    fig.draw();
  };

  const slider = kit.ui.slider({
    label: 'Where the street sits',
    min: 0, max: STRIP_HI, step: 500, value: mark,
    fmt: (v) => money(v),
    onInput: (v) => { mark = Number(v); refresh(); },
  });

  /* The button is operable from the first frame. Gating it behind a drag would hide the
     commitment from anyone arriving by keyboard, and the press is the commitment. */
  const commit = kit.ui.button({
    label: 'Mark it',
    kind: 'primary',
    onClick: () => {
      const first = !marked;
      marked = true;
      refresh();
      state.setMark(mark);
      if (!first) return;
      reveal.append(para(
        'The counts beside the figure say how many households sit on each side of your marker, '
        + 'and they follow it if you move it. Nothing has been added up. The marker stays on the '
        + 'pictures below, beside the answers the arithmetic gives.'));
    },
  });

  wrap.append(
    fig.el,
    controls(slider.el, commit.el),
    readoutRow(yours.el, under.el, over.el),
    quiet('Press again whenever you want to move it.'),
    reveal,
  );
  return wrap;
}

/* ---------------------------------------------------------------------------
   Beat 2. The incomes become weights on a plank and the reader hunts for the point
   where it sits level. That point is the mean, and on this street it is nowhere near
   anybody. */

function sectionBeam(kit, street) {
  const wrap = block();
  wrap.append(heading('Where would this street balance?'));
  wrap.append(para(
    'Take the same forty incomes as weights on a plank, each household sitting at its own '
    + 'income. Thirty-nine are heaped at the left, close enough together to read as one lump. '
    + `The fortieth is out at ${millions(TOP_START)}, on a lever long enough to see from here.`));
  wrap.append(para(
    'Slide the prop until the plank sits level. It goes down on the right at one end of the '
    + 'dial and down on the left at the other, so the level point is between them. Press when '
    + 'you have it.'));

  const total = street.sumRest + TOP_START;
  const mean = street.meanAt(TOP_START);
  const meanRest = kit.stats.mean(street.rest);
  const below = street.belowMean(TOP_START);

  let prop = PROP_START;
  let told = false;

  const torque = () => total - N_HOMES * prop;
  const tilt = () => TILT_MAX * Math.tanh(torque() / (N_HOMES * TILT_REF));
  const level = () => Math.abs(prop - mean) <= BALANCE_TOL;
  /* One predicate decides the readout, the spoken sentence and what the button says
     back, so the screen can never call the plank level in one place and tipped in
     another. */
  const sits = () => (level() ? 'level' : (torque() > 0 ? 'down on the right' : 'down on the left'));

  const reveal = liveBox();
  const say = liveBox();

  const where = kit.ui.readout({ label: 'Where the prop sits', value: money(prop), tone: 'plain' });
  const how = kit.ui.readout({ label: 'How the plank sits', value: sits(), tone: 'data' });
  const found = kit.ui.readout({ label: 'Where it balances', value: 'not yet', tone: 'result', live: true });

  const fig = mountFigure(kit, {
    height: 290,
    caption:
      `The same forty incomes as weights on a plank, in dollars a year, world ${kit.seed}. The `
      + `plank runs from $0 to ${mShort(PLANK_HI)}. Thirty-nine households are heaped at the `
      + `left, all of them between ${money(street.lo)} and ${money(street.hi)}, drawn as a pile `
      + 'because at this scale the gaps between them are thinner than a dot. The fortieth sits '
      + `alone at ${millions(TOP_START)}. The prop travels along the left-hand tenth of the `
      + 'plank, which is as far as it needs to go on this street.',
    describe: () => {
      const posture = sits();
      if (posture === 'level') {
        return `A plank of incomes, sitting level, propped at ${money(prop)} a year. The heap of `
          + `thirty-nine households at the left and the single weight at ${millions(TOP_START)} `
          + 'are holding each other up here.';
      }
      return `A plank of incomes, going ${posture}, propped at ${money(prop)} a year. `
        + (torque() > 0
          ? `The single weight at ${millions(TOP_START)} is outweighing the heap of thirty-nine.`
          : 'The heap of thirty-nine households is outweighing the single far weight.');
    },
    draw: (st) => {
      st.domain(0, PLANK_HI, 0, 1).pad(12, 16, 18, 30);
      st.axisX([0, 1000000, 2000000], (v) => (v === 0 ? '$0' : mShort(v)));
      st.note('income, $ a year', st.W - 8, 12,
    { align: 'right', size: 11, color: HUE.ink2, weight: 600 });

      const t = tilt();
      const plankY = (x) => PLANK_Y - t * ((x - prop) / PLANK_HI);

      /* The prop stands on the axis line, which is doing the job of the ground, and the
         plank lies across the top of it. Both are drawn in the second ink rather than
         the first: the canvas palette is fixed at its light values until the stylesheet
         names the --viz- colors, and a mid tone is the one that reads on a white page
         and on a dark one. */
      st.line([[prop - PROP_HALF, 0], [prop, PLANK_Y], [prop + PROP_HALF, 0]],
        { color: HUE.ink2, width: 2 });
      st.line([[0, plankY(0)], [PLANK_HI, plankY(PLANK_HI)]], { color: HUE.ink2, width: 5 });

      /* One dot per household. The whole crowd is about five pixels wide at this scale,
         so the dots are stacked into rows: the pile is a pile of thirty-nine weights and
         the caption says so, because its width is not a spread of incomes. The pitch is
         worked in pixels and converted, so the pile is the same height on a phone and on
         a laptop. */
      const pads = st.pads;
      const plotH = Math.max(1, st.H - pads.t - pads.b);
      const pitch = 5.5 / plotH;
      const heap = street.rest.map((v, i) => [v, plankY(v) + (i % HEAP_ROWS + 0.8) * pitch]);
      st.dots(heap, { r: 2.8, fill: HUE.data, alpha: 0.9 });
      st.dots([[TOP_START, plankY(TOP_START) + 0.8 * pitch]], { r: 5, fill: HUE.data, alpha: 0.95 });

      /* Both labels are anchored away from the edge they are near, because the heap sits
         against the left of the frame and the far weight against the right, and a
         centerd label at either would be drawn off the side of the canvas. */
      st.note(`${N_REST} households`,
        st.X(street.rest[20]) + 10,
        st.Y(plankY(street.rest[20]) + (HEAP_ROWS + 1.6) * pitch),
        { align: 'left', baseline: 'bottom', size: 11, weight: 700, color: HUE.ink2 });
      st.label('number 1', TOP_START, plankY(TOP_START) + 3.2 * pitch,
        { align: 'right', dx: -9, size: 11, weight: 700, color: HUE.ink2 });
    },
  });

  const slider = kit.ui.slider({
    label: 'Where the prop sits',
    min: 0, max: PROP_MAX, step: PROP_STEP, value: prop,
    fmt: (v) => money(v),
    onInput: (v) => {
      prop = Number(v);
      where.set(money(prop));
      how.set(sits());
      /* Whatever the last press said about the plank stops being true the moment the
         prop moves, so it goes. The readout beside it is the thing that follows a drag,
         because a sentence updating sixty times a second is unreadable and unhearable. */
      say.replaceChildren();
      fig.draw();
    },
  });

  const commit = kit.ui.button({
    label: 'Prop it here',
    kind: 'primary',
    onClick: () => {
      if (!level()) {
        /* Which way, and roughly how far. A reader who cannot find the point by dragging
           has to be able to get there, and the two bands converge without printing the
           answer, which is what the next press is for. */
        const off = Math.abs(prop - mean) > 25000 ? 'a long way from level' : 'close to level';
        say.replaceChildren(para(torque() > 0
          ? `The plank is going down on the right, and it is ${off}. The one weight out there `
            + 'is still winning, so the prop has further to travel toward it.'
          : `The plank is going down on the left, and it is ${off}. The heap has taken over, `
            + 'so the prop has come too far and wants bringing back.'));
        return;
      }
      say.replaceChildren(para('The plank is level.'));
      found.set(money(mean));
      if (told) return;
      told = true;
      reveal.append(named(
        'That balance point has a name',
        `You have it level. The point where the pulls cancel is ${money(mean)} a year, and that `
        + 'number is the mean, which is the word sitting underneath "average" whenever anybody '
        + 'says it.',
        'You can reach the same place with no plank at all. Add the forty incomes together and '
        + 'share the total out equally between the forty households, and each share comes to the '
        + 'number the prop found. Balancing and sharing out are one instruction written two ways.',
        `Nobody on ${STREET} earns ${money(mean)}. Of the ${N_HOMES} households, ${below} earn `
        + `less than it, and the one that does not earns ${Math.round(TOP_START / mean)} times `
        + 'that amount. Lift the weight at number 1 off the plank and the remaining thirty-nine '
        + `balance at ${money(meanRest)}, which is a street somebody could live on.`,
      ));
      reveal.append(deeper(
        'Why balancing and sharing out give the same number',
        'Level means the pulls cancel. Add up how far every household sits to the right of the '
        + 'prop, subtract how far every one sits to the left, and the two come to nothing.',
        'Written out, that says the forty distances from the prop add to zero, so the forty '
        + 'incomes add to forty props. Divide both sides by forty and the prop is standing at the '
        + 'total shared equally. The balance point and the shared-out total are one fact reached '
        + 'from two directions, which is why the mean has two definitions that never disagree.',
        'Physics calls that point the center of mass and does the identical arithmetic with '
        + 'kilograms where this one has dollars a year.',
      ));
    },
  });

  wrap.append(
    fig.el,
    controls(slider.el, commit.el),
    readoutRow(where.el, how.el, found.el),
    say,
    quiet('The readout marked "How the plank sits" says which way it is going. Press as often '
      + 'as you like.'),
    reveal,
  );
  return wrap;
}

/* ---------------------------------------------------------------------------
   Beat 3. The same street, and nothing added up: cross off the ends until two
   households are left standing. The far household goes first and is never missed. */

function sectionCrossOff(kit, street, state) {
  const wrap = block();
  wrap.append(heading('The other middle'));
  wrap.append(para(
    'The same street again, with your marker where you left it, and nothing added up this time. '
    + 'Cross off the highest income and the lowest, then the next pair, and keep going until the '
    + 'street runs out. Before you press, say where the last households standing will sit next '
    + 'to your marker.'));

  const median = street.medianAt(TOP_START);
  const pair = street.pair;
  const rounds = 19;              // nineteen pairs crossed off leaves two of the forty
  /* Two households on the same income is a thing that happens, and the sentence has to
     survive it. Written once, so the spoken description and the naming block cannot
     word the same pair two ways. */
  const pairSaid = pair[0] === pair[1]
    ? `both on ${money(pair[0])} a year`
    : `on ${money(pair[0])} and ${money(pair[1])} a year`;

  let cut = 0;                    // pairs crossed off so far, walked by the tween
  let mark = null;
  let done = false;
  let told = false;
  let cancel = null;
  let goEl = null;
  const guessButtons = [];

  const guessSay = liveBox();
  const reveal = liveBox();
  const compare = liveBox();

  const gone = (rank) => rank < cut || rank > N_HOMES - 1 - cut;
  const standing = () => Math.max(2, N_HOMES - 2 * Math.floor(cut));

  const left = kit.ui.readout({ label: 'Households left standing', value: String(N_HOMES), tone: 'data' });
  const middle = kit.ui.readout({ label: 'The middle one', value: 'not yet', tone: 'result', live: true });

  const fig = mountFigure(kit, {
    height: 210,
    caption:
      `The same forty incomes, in dollars a year, world ${kit.seed}. Crossing off works from the `
      + 'outside in: the highest and the lowest go first, then the next pair, and so on. '
      + 'Nineteen rounds leave two households standing. A crossed-off household stays on the '
      + 'picture, drawn faint, so that what the crossing-off is ignoring stays visible. Your '
      + 'marker is the tick you placed at the top of the unit.',
    describe: () => {
      if (cut === 0) return 'Forty incomes, none of them crossed off yet.';
      if (!done) return 'Households are being crossed off from both ends at once.';
      return `Two households are left standing, ${pairSaid}, with ${rounds} crossed off below `
        + `them and ${rounds} above, including the household at the right-hand edge, which went `
        + 'in the first round.';
    },
    draw: (st) => {
      stripFrame(st);
      const kept = [];
      const cut2 = [];
      street.rest.forEach((v, i) => {
        (gone(i) ? cut2 : kept).push([v, ROW_Y + street.jitter[i] * ROW_J]);
      });
      st.dots(cut2, { r: 4.5, fill: HUE.ink2, alpha: 0.22 });
      st.dots(kept, { r: 5, fill: HUE.data, alpha: 0.85 });
      /* The household at the edge fades under the same rule as every other household,
         so the picture can never show it crossed off while the count still has it in. */
      edgeMark(st, TOP_START, gone(N_HOMES - 1));
      if (mark != null) rowMark(st, mark, { color: HUE.ink2, width: 3 });
      if (done) {
        rowMark(st, median, { color: HUE.result, width: 3, half: 0.36 });
        st.label('the middle', median, ROW_Y + 0.46, { size: 11, weight: 700, color: HUE.result });
      }
    },
  });

  function unlock() {
    if (goEl && goEl.disabled) goEl.disabled = false;
  }

  function predict(which) {
    unlock();
    guessButtons.forEach((b) => {
      if (!b) return;
      const hadFocus = document.activeElement === b;
      b.disabled = true;
      /* Disabling the button somebody has pressed drops focus to the top of the
         document. Hand it to the control they are meant to reach for next. */
      if (hadFocus && goEl) goEl.focus({ preventScroll: true });
    });
    const lines = {
      above: 'The household at number 1 is the reason to think so, and it is the right thing to '
        + 'be watching. See which round it goes out in.',
      about: 'That is the common answer, and worth knowing why it usually holds: your eye was '
        + 'looking at where the households are, and so is this procedure.',
      below: 'Then watch the bottom end, which loses a household every round at exactly the same '
        + 'rate as the top.',
    };
    guessSay.replaceChildren(para(lines[which]));
  }

  function finish() {
    done = true;
    cut = rounds;
    left.set(String(standing()));
    middle.set(money(median));
    fig.draw();
    if (told) return;
    told = true;
    reveal.append(named(
      'That move has a name',
      (pair[0] === pair[1]
        ? `The last two standing earn ${money(pair[0])} a year each. Forty households have no `
          + 'single one in the middle, so the middle is the point halfway between the last two, '
          + `which on this street is that same ${money(median)}. That number is the median.`
        : `The last two standing earn ${money(pair[0])} and ${money(pair[1])} a year. Forty `
          + 'households have no single one in the middle, so the middle is the point halfway '
          + `between those two, ${money(median)}. That number is the median.`),
      'The household at number 1 was crossed off in the first round, and the picture never '
      + 'noticed it again. The median asked which incomes were higher and which were lower, and '
      + 'never once asked by how much. That is the whole difference between the two answers, and '
      + 'it is worth saying in one line: the mean weighs, the median counts.',
    ));
    writeCompare();
  }

  function writeCompare() {
    if (!done || mark == null) return;
    const dMed = Math.abs(mark - median);
    const dMean = Math.abs(mark - street.meanAt(TOP_START));
    compare.replaceChildren(para(dMed <= dMean
      ? `Your marker came in at ${money(mark)}: ${money(dMed)} from the middle one, `
        + `${money(dMean)} from the balance point. You were asked where the households are, and `
        + 'the median is the number that answers that question.'
      : `Your marker came in at ${money(mark)}: ${money(dMed)} from the middle one, `
        + `${money(dMean)} from the balance point. It sits above nearly every household here, so `
        + 'the crowd your eye was reading is down to the left of it.'));
  }

  state.onMark((v) => {
    mark = v;
    fig.draw();
    writeCompare();
  });

  const go = kit.ui.button({
    label: 'Cross off from both ends',
    kind: 'primary',
    onClick: () => {
      if (cancel) { cancel(); cancel = null; }
      cut = 0;
      done = false;
      left.set(String(standing()));
      fig.draw();
      /* engine.tween jumps straight to the end value for a reader who asked for reduced
         motion, and the last frame carries everything the walk carries, so nothing is
         lost by taking it. Without an engine at all, the picture goes straight to the
         answer rather than never arriving. */
      if (!kit.engine || typeof kit.engine.tween !== 'function') { finish(); return; }
      cancel = kit.engine.tween({
        from: 0,
        to: rounds,
        ms: 2600,
        ease: kit.engine.ease ? kit.engine.ease.linear : undefined,
        onStep: (v) => {
          cut = Number.isFinite(v) ? v : rounds;
          left.set(String(standing()));
          fig.draw();
        },
        onDone: () => { cancel = null; finish(); },
      });
    },
  });
  goEl = asButton(go.el);
  if (goEl) goEl.disabled = true;

  const above = kit.ui.button({ label: 'Above my marker', kind: 'ghost', onClick: () => predict('above') });
  const about = kit.ui.button({ label: 'About where I put it', kind: 'ghost', onClick: () => predict('about') });
  const under = kit.ui.button({ label: 'Below my marker', kind: 'ghost', onClick: () => predict('below') });
  guessButtons.push(asButton(above.el), asButton(about.el), asButton(under.el));

  kit.bin.push(() => { if (cancel) cancel(); });

  wrap.append(
    fig.el,
    controls(above.el, about.el, under.el),
    guessSay,
    controls(go.el),
    readoutRow(left.el, middle.el),
    quiet('It runs on its own once you start it, and you can run it again.'),
    reveal,
    compare,
  );
  return wrap;
}

/* ---------------------------------------------------------------------------
   Beat 4. One household's income goes up and the two answers come apart. */

function sectionPart(kit, street) {
  const wrap = block();
  wrap.append(heading('What moves when one household gets richer?'));
  wrap.append(para(
    'The household at number 1 sells the business. Their income goes up and nothing else on the '
    + 'street changes. Before you move the dial, say what you expect the balance point and the '
    + 'middle one to do.'));

  const median = street.medianAt(TOP_START);
  const axisTop = street.axisTop;

  let top = TOP_START;
  let told = false;
  let predicted = false;
  let moved = false;
  /* Declared above the controls that write to them: a ui implementation that fired a
     callback once during construction would otherwise hit the temporal dead zone and
     take the whole screen down. */
  let sliderEl = null;
  const guessButtons = [];

  const guessSay = liveBox();
  const reveal = liveBox();

  const at1 = kit.ui.readout({ label: 'Income at number 1', value: millions(top), tone: 'data' });
  const avg = kit.ui.readout({ label: 'Average income', value: money(street.meanAt(top)), tone: 'result' });
  const mid = kit.ui.readout({ label: 'The middle one', value: money(street.medianAt(top)), tone: 'result' });

  const fig = mountFigure(kit, {
    height: 220,
    caption:
      `The same street on a wider axis, in dollars a year, world ${kit.seed}. The axis reaches `
      + `${money(axisTop)}, which squashes the thirty-nine households into the left-hand fifth `
      + 'and is the only way to fit the average onto the same picture as the people it '
      + 'describes. The average is the dashed mark and the middle one is the solid mark. Number '
      + '1 is off this axis as well, wherever the dial has put it.',
    describe: () => `Thirty-nine households crowded into the left-hand fifth of an axis running `
      + `to ${money(axisTop)} a year. With number 1 on ${millions(top)}, the average sits at `
      + `${money(street.meanAt(top))} and the middle one at ${money(street.medianAt(top))}, `
      + `${money(street.meanAt(top) - street.medianAt(top))} apart.`,
    draw: (st) => {
      st.domain(0, axisTop, 0, 1).pad(12, 14, 20, 30);
      st.axisX([0, 100000, 200000, 300000].filter((v) => v <= axisTop), thousands);
      st.note('income, $ a year', st.W - 8, 12,
    { align: 'right', size: 11, color: HUE.ink2, weight: 600 });
      st.dots(street.rest.map((v, i) => [v, ROW_Y + street.jitter[i] * ROW_J]),
        { r: 4, fill: HUE.data, alpha: 0.8 });
      const m = street.meanAt(top);
      /* The two marks are the same role and so the same color, and they are told apart
         by the words beside them rather than by the ink. Each label is anchored on the
         side of its mark that has room: the middle one sits hard against the left of the
         frame, and the average travels all the way to the right of it. */
      st.line([[median, ROW_Y - 0.34], [median, ROW_Y + 0.34]], { color: HUE.result, width: 3 });
      st.label('the middle one', median, ROW_Y - 0.40,
        { align: 'left', dx: 7, size: 11, weight: 700, color: HUE.result });
      st.line([[m, ROW_Y - 0.34], [m, ROW_Y + 0.34]], { color: HUE.result, width: 3, dash: 5 });
      st.label('the average', m, ROW_Y + 0.44,
        { align: 'right', dx: -7, size: 11, weight: 700, color: HUE.result });
      st.note(`number 1 is out at ${mShort(top)}`, st.W - 8, 30, {
        align: 'right', size: 11, weight: 700, color: HUE.data,
      });
    },
  });

  const slider = kit.ui.slider({
    label: 'Income at number 1',
    min: TOP_START, max: TOP_MAX, step: TOP_STEP, value: top,
    fmt: (v) => millions(v),
    onInput: (v) => {
      top = Number(v);
      moved = true;
      at1.set(millions(top));
      avg.set(money(street.meanAt(top)));
      mid.set(money(street.medianAt(top)));
      fig.draw();
      name();
    },
  });
  sliderEl = asRange(slider.el);

  function predict(both) {
    predicted = true;
    guessButtons.forEach((b) => {
      if (!b) return;
      const hadFocus = document.activeElement === b;
      b.disabled = true;
      /* Disabling the button somebody has pressed drops focus to the top of the
         document. Hand it to the dial they are meant to reach for next. */
      if (hadFocus && sliderEl) sliderEl.focus({ preventScroll: true });
    });
    guessSay.replaceChildren(para(both
      ? 'That is the natural answer, and the reasoning under it is sound: the street did get '
        + 'richer, so a number describing the street ought to move. Take the dial to the far end '
        + 'and watch which of the two agrees with you.'
      : `Then the question worth holding is which one, and by how much. The dial runs to `
        + `${millions(TOP_MAX)}.`));
    name();
  }

  /* The naming waits for both halves of the commitment: a prediction, and the dial
     actually moved. Landing it on the prediction alone would print the answer above an
     instrument the reader had not touched. */
  function name() {
    if (told || !predicted || !moved) return;
    told = true;
    reveal.append(named(
      'One household, and a word for it',
      'Number 1 is an outlier: a value sitting a long way from the rest of its own data. Every '
      + 'dollar added there adds a fortieth of a dollar to the average, which is two and a half '
      + `cents, and adds nothing at all to the middle one. Take number 1 to ${millions(TOP_MAX)} `
      + `and the average climbs to ${money(street.meanAt(TOP_MAX))} while the middle one has not `
      + 'moved by a penny.',
      'A crowd with a long tail on one side is skewed, which is the shape you sorted by eye in '
      + '03-pile. This is what the tail does once somebody summarizes it. The mean is dragged '
      + 'toward the tail and the median stays with the crowd, and the gap between the two '
      + 'numbers is one way of measuring how long the tail is.',
    ));
  }

  const both = kit.ui.button({ label: 'Both of them climb', kind: 'ghost', onClick: () => predict(true) });
  const one = kit.ui.button({ label: 'Only one climbs', kind: 'ghost', onClick: () => predict(false) });
  guessButtons.push(asButton(both.el), asButton(one.el));

  wrap.append(
    controls(both.el, one.el),
    guessSay,
    fig.el,
    controls(slider.el),
    readoutRow(at1.el, avg.el, mid.el),
    reveal,
  );
  return wrap;
}

/* ---------------------------------------------------------------------------
   Beat 5: the same pair of numbers, in a place with nothing to do with incomes. */

function sectionApply(kit) {
  const wrap = block();
  wrap.append(heading('Somewhere else entirely'));
  wrap.append(para(
    'A health center publishes its waiting times for last month. Half its patients were seen '
    + 'within 3 days. The mean wait was 11 days, because a few hundred people waited six to '
    + 'eight weeks for one clinic. All three numbers are correct.'));

  wrap.append(kit.ui.quiz({
    question: 'Which sentence should the health center publish?',
    options: [
      {
        label: 'Patients wait 11 days on average, so a typical patient waits about a fortnight.',
        correct: false,
        why: 'The 11 days is correct arithmetic, and the word "typical" is what most people '
          + 'assume an average means, so this is the sentence that gets written. It describes '
          + 'nobody here. More than half of these patients were seen inside 3 days, and the '
          + 'people who waited eight weeks did not wait a fortnight either.',
      },
      {
        label: 'Most patients are seen within 3 days, so the 11-day figure is wrong and should '
          + 'not be published.',
        correct: false,
        why: 'The instinct is sound: 11 days does not describe the ordinary experience of this '
          + 'health center. The figure is not wrong, though, and it is the only one of the two '
          + 'that the people waiting eight weeks appear in at all. Dropping it publishes a '
          + 'health center with no problem in it.',
      },
      {
        label: 'Half of patients were seen within 3 days. The mean wait was 11 days, pulled up '
          + 'by a few hundred people waiting six to eight weeks.',
        correct: true,
        why: 'Both numbers, and the reason they disagree. That last clause is what turns two '
          + 'numbers into a finding: there is a line behind one clinic, and it is long enough '
          + 'to move the average of the whole health center by more than a week.',
      },
    ],
  }).el);

  return wrap;
}

/* ---------------------------------------------------------------------------
   Beat 6: the reader performs the distortion, using two correct numbers. */

function sectionPress(kit, street) {
  const wrap = block();
  wrap.append(heading('One sentence for the newsletter'));
  wrap.append(para(
    `Put number 1 back at the ${millions(TOP_START)} the county recorded. You write for the `
    + `county, and one sentence about incomes on ${STREET} goes into the newsletter. Both of `
    + 'the sentences below are true, and you can file one of them.'));

  const mean = street.meanAt(TOP_START);
  const median = street.medianAt(TOP_START);
  const below = street.belowMean(TOP_START);
  const times = Math.round((TOP_START / street.sumRest) * 10) / 10;

  const meanLine = `Average household income on ${STREET} is ${money(mean)} a year.`;
  const medianLine = `Half the households on ${STREET} live on ${money(median)} a year or less.`;

  const filed = liveBox();
  /* Two polite regions rather than one. The filed sentence changes every time the reader
     files, and the block underneath arrives once and then stays put, so putting them
     together would read the whole beat out again on the second press. */
  const after = liveBox();
  let opened = false;

  function file(which) {
    const kids = [];
    if (which === 'mean') {
      kids.push(para(`Filed: "${meanLine}"`));
      kids.push(para(
        'Every figure in that sentence is right and anybody can check it. A reader takes it as '
        + 'what households there earn, so the street reads as comfortable and sinks down any '
        + `list sorted by need. ${below} of the ${N_HOMES} households earn less than the number `
        + 'in it.'));
      kids.push(para(`The one you did not file: "${medianLine}"`));
    } else {
      kids.push(para(`Filed: "${medianLine}"`));
      kids.push(para(
        'Every figure in that sentence is right and anybody can check it. A reader takes it as '
        + 'what households there earn, so the street reads as poor, and the sentence leaves out '
        + `an income of ${millions(TOP_START)}, which is ${times} times what the other `
        + 'thirty-nine earn between them.'));
      kids.push(para(`The one you did not file: "${meanLine}"`));
    }
    filed.replaceChildren(...kids);
    if (opened) return;
    opened = true;
    after.append(warned(
      'Both sentences are true',
      'Neither number is wrong. The mean is the total shared equally, the median is the middle '
      + 'one, and each is the right answer to a different question. The dishonesty is in the '
      + 'choosing, and in not saying which one you chose.',
      'You will do this without meaning to. A spreadsheet computes the mean by default and the '
      + 'word "average" arrives attached to it, so the number in the sentence is the number the '
      + 'software offered. The habit that catches it is asking for the other middle before '
      + 'quoting either one, on your own numbers first.',
    ));
    after.append(para(
      'Which would you want printed if it were your street? That depends on what the sentence is '
      + 'for, and the two cases pull opposite ways. If a hardship fund is handed out street by '
      + `street, the average says ${STREET} does not need it, and ${below} of its ${N_HOMES} `
      + 'households would disagree. If the question is what the street pays in tax between them, '
      + 'the average is the only one of the two that can answer at all.'));
    after.append(deeper(
      'When the mean is the number you want',
      `Multiply the mean by the count and the total comes back. Forty households at ${money(mean)} `
      + `each is ${money(mean * N_HOMES)}, which is exactly what ${STREET} earns in a year. `
      + `Multiply the median by forty and you get ${money(median * N_HOMES)}, which is not the `
      + 'income of anything.',
      'A total is the question the mean was built for, and it gets asked constantly: the tax a '
      + 'street pays, the food a school has to buy, the water a town uses, the rain behind an '
      + 'average daily figure. The median cannot answer any of those and does not claim to. It '
      + 'is when the question is about one household rather than the whole street that the mean '
      + 'is answering something nobody asked.'));
  }

  const fileMean = kit.ui.button({ label: 'File the average', kind: 'ghost', onClick: () => file('mean') });
  const fileMedian = kit.ui.button({ label: 'File the middle one', kind: 'ghost', onClick: () => file('median') });

  wrap.append(
    controls(fileMean.el, fileMedian.el),
    quiet('Both buttons stay live. File one, then read the other.'),
    filed,
    after,
  );
  return wrap;
}

/* ---------------------------------------------------------------------------
   The close: four plain-word descriptions of what happened, each with the term the
   rest of the world uses for it and the unit that picks it up. */

function sectionRecap(kit, street, state) {
  const wrap = block();
  wrap.append(heading('Four things you did'));
  wrap.append(para(
    'None of these needed a symbol. 05-spread is where the shorthand starts, and it starts as '
    + 'shorthand for sentences you can already say.'));

  const median = street.medianAt(TOP_START);

  const steps = kit.ui.steps([
    {
      title: 'You found where the weight sits',
      body: 'You propped a plank until forty incomes balanced on it, and that point is the one '
        + 'you also get by adding the incomes up and sharing the total equally. It is the mean. '
        + 'Unit 08-wobble asks how far this same number moves when you collect the data again.',
    },
    {
      title: 'You found the middle one',
      body: 'You crossed off the ends until two households were left, and took the point halfway '
        + 'between them. That is the median, and it never asked how far out any household sat. '
        + 'Unit 05-spread starts from the middle and asks how far the crowd reaches either side.',
    },
    {
      title: 'You moved one household and only one number followed',
      body: 'A value a long way from the rest of its own data is an outlier, and a crowd with a '
        + 'long tail on one side is skewed. Unit 14-line is where one far-out point does this to '
        + 'a line drawn through a cloud, for the same reason.',
    },
    {
      title: 'You wrote a true sentence that leaves its reader wrong',
      body: 'Two correct summaries of one street, tens of thousands apart, and the choice between '
        + 'them never appears in the sentence. Unit 16-rhetoric is this toolkit turned around: '
        + 'reading the claims other people make, and writing ones that survive being checked.',
    },
  ]);
  /* Every step at once: this is a summary rather than a walkthrough. reveal(i) shows
     everything up to and including i, and the loop is here so that a builder which
     revealed one card at a time would still land on all four. */
  for (let i = 0; i < 4; i++) steps.reveal(i);
  wrap.append(steps.el);

  /* The marker is the one thing the reader put on the screen themselves. The close
     quotes it only once they have placed one, because a recap that invents a decision
     nobody made is the exact failure this site is built against. */
  const mine = liveBox();
  state.onMark((v) => {
    mine.replaceChildren(para(
      `Your marker went in at ${money(v)}, ${money(Math.abs(v - median))} from the median, before `
      + 'any of the arithmetic and by eye alone.'));
  });
  wrap.append(mine);

  wrap.append(para(
    'Neither number says anything about how far apart the households are. '
    + `${money(median)} would be the middle of a street where every household earned within $200 `
    + 'of it, and it is also the middle of this one. Unit 05-spread is the number that tells '
    + 'those two streets apart, which is why a middle quoted on its own is half an answer.'));

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
  h.append(el('p', 'kicker', 'Unit 4 · about 16 minutes'));
  h.append(el('h1', null, 'The middle'));
  h.append(el('p', 'lesson__q', 'Where does this crowd sit?'));
  h.append(el('p', 'lede',
    `Forty households live on ${STREET}, and the county knows what every one of them earns in a `
    + 'year. Somebody asks what a household there earns. Two answers are both arithmetically '
    + 'correct, tens of thousands of dollars apart, and whichever one gets printed decides who '
    + 'the street appears to be.'));
  h.append(quiet(
    `The forty incomes are invented, drawn in world ${kit.seed}. Thirty-nine come out of a `
    + 'generator with roughly the shape earned income has. The fortieth is set by hand at '
    + `${millions(TOP_START)}.`));
  return h;
}

/* The one thing that crosses a section boundary: the marker the reader places in the
   first instrument, which the third instrument draws and the close reads back. */
function makeState() {
  const watchers = [];
  return {
    mark: null,
    onMark(fn) { watchers.push(fn); if (this.mark != null) fn(this.mark); },
    setMark(v) { this.mark = v; watchers.forEach((fn) => fn(v)); },
  };
}

function render(root, ctx) {
  const ui = ctx.ui;
  const stats = ctx.stats;
  const stage = ctx.stage || (ctx.viz && ctx.viz.stage);
  /* The contract puts a bound stage on ctx and main.js also passes the viz module, so
     either spelling is accepted. The world factory is taken from ctx when it is offered
     and from core/rng.js otherwise, because a lesson that quietly stopped rebuilding a
     world from its number would go on printing "drawn in world 42" while that had
     stopped meaning anything. */
  const makeRng = typeof ctx.makeRng === 'function'
    ? ctx.makeRng
    : (ctx.rng && typeof ctx.rng.makeRng === 'function' ? ctx.rng.makeRng : coreMakeRng);

  if (!ui || !stats || !stage) {
    throw new Error('04-middle needs ui, stats and a drawing stage on the lesson context.');
  }

  const kit = {
    ui,
    stats,
    stage,
    makeRng,
    engine: ctx.engine || null,
    seed: ctx.seed == null ? 42 : ctx.seed,
    // Lets this lesson write the current world into the address bar.
    setSeed: typeof ctx.setSeed === 'function' ? ctx.setSeed : null,
    bin: [],       // teardown jobs
    redraws: [],   // one per figure
  };

  const state = makeState();
  const street = makeStreet(kit);

  const body = el('div', 'lesson__body');
  body.append(
    sectionMark(kit, street, state),
    sectionBeam(kit, street),
    sectionCrossOff(kit, street, state),
    sectionPart(kit, street),
    sectionApply(kit),
    sectionPress(kit, street),
    sectionRecap(kit, street, state),
  );
  root.append(head(kit), body);

  /* Every instrument on this screen draws the one street, so the world the lesson is
     actually using goes into the address bar at the door. router.go() builds its hash
     without the query, so a reader who arrived from the map is on world 42 and has no
     way of knowing it; after this line the address bar says which street is on screen
     and the link they copy brings back the same forty households. Nothing on this
     screen ever changes the world, so this is the only call. */
  if (kit.setSeed) kit.setSeed(kit.seed);

  /* Canvases can only measure themselves once they are on the page. */
  const repaint = () => { kit.redraws.forEach((draw) => draw()); };
  repaint();

  /* viz.js holds the colors it read out of the stylesheet for a fraction of a second,
     so a redraw fired the instant the scheme changes can still be painting in the old
     palette. Paint now for the figures that are about to move anyway, and again once
     that cache has certainly expired for the ones that never redraw on their own. */
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
  id: '04-middle',
  unit: 'II',
  title: 'The middle',
  question: 'Where does this crowd sit?',
  minutes: 16,
  render,
};
