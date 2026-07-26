/* 01-noticing/index.js
   Unit 1. The reader marks the middle of a crowd of dots by eye, turns a real difference
   down until the picture loses it, watches two cafes swap places between afternoons, and
   then crops an axis until an 8% gap looks like a crisis. No symbols anywhere. */

/* Worlds are the one thing a lesson cannot build out of ctx alone: ctx.rng is a generator
   already seeded with this page's world, and the third instrument needs a generator for a
   world the reader has just asked for. main.js passes the factory as ctx.makeRng, and this
   import is the guarantee that the instrument still works if it ever stops doing so. */
import { makeRng as coreMakeRng } from '../../core/rng.js';

/* ---------------------------------------------------------------------------
   The scenario. Two cafes on the same street, timed from joining the line to
   holding the cup. Minutes, one decimal, a unit everybody owns.
   Birch really is slower than Ash. That fact never changes on this screen;
   only the pictures of it do. */
const ASH = 'Cafe Ash';
const BIRCH = 'Cafe Birch';

const MU_ASH = 5.0;      // minutes, the true long-run average wait at Ash
const WAIT_SD = 1.6;     // minutes, how much one visit differs from the next
const N_BUSY = 30;       // customers timed at each cafe in the first two figures
const N_QUIET = 12;      // customers timed in each afternoon of the worlds figure
const X_MAX = 12;        // minutes; the axis never moves, so the crowds visibly slide

const WORLD_GAP = 0.4;   // minutes; the true gap in the afternoons figure, small and real

/* The distortion beat runs on a year of trading rather than one afternoon, so the
   wobble is far too small to argue about and the only thing left to argue about is
   the axis. Four thousand visits put the wobble in either average near a minute's
   fortieth, which is why these two numbers can be quoted flatly. */
const YEAR_ASH = 5.0;
const YEAR_BIRCH = 5.4;
const CROP_FLOOR = 4.9;  // minutes; where a cropped axis would start
const PCT = Math.round(((YEAR_BIRCH - YEAR_ASH) / YEAR_ASH) * 100);   // 8

/* Shared geometry for the two-row figures, in the 0-to-1 vertical data space. Written
   down once so beat 2 and beat 3 line up when a reader scrolls between them. */
const ROW_TOP = 0.72;
const ROW_BOT = 0.28;
const JITTER = 0.15;      // how far a dot may sit from its row's center line
const TICK_HALF = 0.19;   // half-height of a mark that belongs to one row
const LABEL_TOP_Y = 0.94;
const LABEL_BOT_Y = 0.50;
const BRACKET_Y = 0.985;  // the measuring bar sits clear of both rows

/* A gap this small rounds to nothing at one decimal place, so the screen stops
   quoting a number and says how small it is instead. */
const TOO_CLOSE = 0.05;   // minutes

const min1 = (v) => (Math.round(v * 10) / 10).toFixed(1);

/* ---------------------------------------------------------------------------
   Small DOM helpers. Lessons build real nodes and wire them; there is no template
   language here and nothing to compile. */

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

/* The naming move gets one treatment across the whole site, so a reader learns to
   recognize it on sight: a rule down the left in the result color, past tense, no praise. */
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

/* A box a screen reader reads out when something lands in it. It starts empty,
   because every reveal on this site is gated behind a commitment. */
function liveBox() {
  const n = el('div');
  n.setAttribute('aria-live', 'polite');
  return n;
}

/* ui.button hands back a wrapper node in the contract and the bare button in the shipped
   kit; this finds the real <button> either way, so a gate can disable itself without
   knowing anything about ui.js internals. */
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
   Simulated customers.

   Each customer is stored as a standardised draw plus a fixed vertical jitter. The
   dials then place them: wait = average + spread * draw. Because the draws stay
   fixed, turning a dial slides the crowd instead of replacing it, which is the whole
   point of the second instrument. */

function customers(rng, n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push({ z: rng.n(0, 1), jitter: rng.u() * 2 - 1 });
  return out;
}

/* A wait cannot be negative, and a wait past the end of the axis would be drawn off the
   side of the picture where nobody can count it. The low clamp bites on about two draws
   in a thousand and the high one on fewer, which is a cheaper price than a dot that
   silently disappears. */
const waitOf = (person, mu) => Math.min(X_MAX - 0.2, Math.max(0.4, mu + WAIT_SD * person.z));

function waits(people, mu) {
  return people.map((p) => waitOf(p, mu));
}

function points(people, mu, row, spread) {
  return people.map((p) => [waitOf(p, mu), row + p.jitter * spread]);
}

/* ---------------------------------------------------------------------------
   Drawing. The three crowd figures share one grammar: minutes run left to right on a
   fixed axis, a crowd is a row of dots, and a mark that belongs to one row is a short
   tick rather than a full-height rule, because two crowds share the frame. */

function crowdFrame(st) {
  st.domain(0, X_MAX, 0, 1).pad(12, 14, 18, 28);
  st.axisX(6);
  st.note('minutes waited', st.W - 8, 14, { align: 'right', size: 11, color: 'ink2', weight: 600 });
  return st;
}

function rowMark(st, x, row, half, o = {}) {
  st.line([[x, row - half], [x, row + half]], {
    color: o.color, width: o.width == null ? 2.5 : o.width, dash: o.dash,
  });
}

/* ---------------------------------------------------------------------------
   One helper mounts a canvas, keeps it correct through resizes and a switch to dark
   mode, and keeps the spoken description in step with the picture. The description is
   only written when it changes, so a tween does not narrate itself sixty times a
   second to a screen reader.

   A canvas that is hidden or not yet laid out reports a width of zero. viz.fit() takes
   that as its cue to draw at a sane default shape and leave the element alone, so there
   is no division by zero to guard against here, and the real numbers arrive on the frame
   after the figure becomes visible. */

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
         draw first, because a ResizeObserver can deliver its opening callback before the
         figure has been appended, and disconnecting there would freeze the picture at
         whatever size it happened to be built at. */
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
   Beat 1. The reader puts a marker where the middle of a crowd sits, commits to it,
   and only then finds out what adding the numbers up would have said. */

function sectionMiddle(kit) {
  const wrap = block();
  wrap.append(heading('Where does this crowd sit?'));
  wrap.append(para(
    `Thirty people walked into ${ASH} one Tuesday and somebody timed every one of them, from `
    + 'joining the line to holding the cup. Each dot below is one of those waits. Slide the '
    + 'marker to the spot you would point at if a friend asked how long the wait at this cafe is.'));

  const people = customers(kit.makeRng(`01-noticing/ash/${kit.seed}`), N_BUSY);
  const values = waits(people, MU_ASH);
  const pts = points(people, MU_ASH, 0.52, 0.30);
  const lo = kit.stats.min(values);
  const hi = kit.stats.max(values);
  const middle = kit.stats.mean(values);
  const half = kit.stats.median(values);

  let mark = X_MAX / 2;     // the middle of the axis, which is deliberately not the answer
  let marked = false;

  const reveal = liveBox();

  const fig = mountFigure(kit, {
    height: 200,
    caption:
      `Thirty simulated visits to ${ASH}, in minutes, drawn in world ${kit.seed}. The waits run `
      + `from ${min1(lo)} to ${min1(hi)} minutes and pile up thickest near the middle of that `
      + 'range. Your marker is the solid tick. Once you commit to it, the arithmetic middle '
      + 'appears as a second tick, with a bracket above measuring the distance whenever the two '
      + 'are far enough apart to fit one.',
    describe: () => (marked
      ? `Thirty waiting times between ${min1(lo)} and ${min1(hi)} minutes. Your marker sits at `
        + `${min1(mark)} minutes and the arithmetic middle sits at ${min1(middle)} minutes, `
        + `${min1(Math.abs(mark - middle))} minutes apart.`
      : `Thirty waiting times between ${min1(lo)} and ${min1(hi)} minutes, thickest near the `
        + `middle of that range. Your marker sits at ${min1(mark)} minutes.`),
    draw: (st) => {
      crowdFrame(st);
      st.dots(pts, { r: 5, fill: 'data', alpha: 0.8 });
      rowMark(st, mark, 0.52, 0.36, { color: 'ink', width: 3 });
      if (marked) {
        rowMark(st, middle, 0.52, 0.36, { color: 'result', width: 3, dash: 5 });
        if (Math.abs(mark - middle) > 0.08) {
          st.bracket(Math.min(mark, middle), Math.max(mark, middle), BRACKET_Y, {
            color: 'ink2', label: `${min1(Math.abs(mark - middle))} min apart`,
          });
        }
      }
    },
  });

  const yours = kit.ui.readout({ label: 'Your mark', value: `${min1(mark)} min`, tone: 'plain' });
  /* Spoken, because it only changes when the reader presses a button. The dial-driven
     readouts stay silent: a number that moves with a drag would talk over itself. */
  const sums = kit.ui.readout({
    label: 'Adding up and sharing out', value: 'not yet', tone: 'result', live: true,
  });
  const apart = kit.ui.readout({ label: 'Distance between the two', value: 'not yet', tone: 'plain' });

  const refresh = () => {
    yours.set(`${min1(mark)} min`);
    if (marked) apart.set(`${min1(Math.abs(mark - middle))} min`);
    fig.draw();
  };

  const slider = kit.ui.slider({
    label: 'Where the middle sits',
    min: 0, max: X_MAX, step: 0.1, value: mark, unit: 'min',
    fmt: (v) => min1(v),
    onInput: (v) => { mark = Number(v); refresh(); },
  });

  /* The button stays operable from the first frame. Gating it behind a drag would hide
     the commitment from anyone arriving by keyboard, and the click is the commitment. */
  const commit = kit.ui.button({
    label: 'Mark it',
    kind: 'primary',
    onClick: () => {
      const first = !marked;
      marked = true;
      sums.set(`${min1(middle)} min`);
      refresh();
      if (!first) return;
      reveal.append(named(
        'That move has a name',
        'The second tick is what you get by adding all thirty waits together and sharing the '
        + 'total out equally between them. That answer is called the mean. Your eye put a marker '
        + 'near it without any of the adding, which is how people find the middle of a crowd when '
        + 'nobody is watching.',
        'The arithmetic exists so that two people get the same answer, rather than so that either '
        + 'of them gets a better one. Your mark is yours, and the next person would put theirs '
        + 'somewhere slightly different. The adding-up answer comes out identical for everybody '
        + 'holding the same thirty waits, including a stranger who never saw the picture. A good '
        + 'deal of what looks like mathematical machinery is people building things that two '
        + 'strangers can agree on.',
      ));
      reveal.append(deeper(
        'The other middle, and why both exist',
        `Half of these customers waited less than ${min1(half)} minutes and half waited more. `
        + 'That is a different question with a different answer, and it is called the median. On '
        + `this crowd it comes out at ${min1(half)} minutes against a mean of ${min1(middle)}. `
        + 'The two answers pull apart when a crowd has a long tail on one side, which is why every '
        + 'number anyone quotes about income comes in both flavours and the two are thousands '
        + 'apart. Unit 04-middle is about that gap.',
      ));
    },
  });

  wrap.append(
    fig.el,
    controls(slider.el, commit.el),
    readoutRow(yours.el, sums.el, apart.el),
    quiet('Put the marker where you want it, then press. The arithmetic comes afterwards.'),
    reveal,
  );
  return wrap;
}

/* ---------------------------------------------------------------------------
   Beat 2. The reader turns a difference they know is real all the way down, and marks
   the point where the picture stops carrying it. */

function sectionOverlap(kit, state) {
  const wrap = block();
  wrap.append(heading('How small can a real difference get before it disappears?'));
  wrap.append(para(
    `${BIRCH} opened across the road. Thirty of its customers were timed on the same Tuesday, `
    + 'and Birch is genuinely slower. The dial says by how much, so nothing is hidden here. Turn '
    + 'it down and the two crowds slide together. Stop at the setting where the difference stops '
    + 'being something the picture can show you, and draw your line there.'));

  const peopleA = customers(kit.makeRng(`01-noticing/tue-ash/${kit.seed}`), N_BUSY);
  const peopleB = customers(kit.makeRng(`01-noticing/tue-birch/${kit.seed}`), N_BUSY);
  const ashWaits = waits(peopleA, MU_ASH);

  let gap = 2;
  let shown = false;
  let explained = false;

  /* An honest measure of overlap, and one a reader can check by counting dots: how many
     of Ash's customers waited longer than the average customer at Birch. At the top of
     the dial that is about three of the thirty, and at the bottom it is about half. */
  const crossers = () => ashWaits.filter((w) => w > MU_ASH + gap).length;

  const reveal = liveBox();
  const line = kit.ui.readout({
    label: 'Your line', value: 'not drawn yet', tone: 'result', live: true,
  });
  const real = kit.ui.readout({ label: 'The real difference', value: `${min1(gap)} min`, tone: 'truth' });
  const cross = kit.ui.readout({
    label: "Ash waits above Birch's average", value: `${crossers()} of ${N_BUSY}`, tone: 'data',
  });

  const fig = mountFigure(kit, {
    height: 240,
    caption:
      `Thirty simulated visits to each cafe, in minutes, drawn in world ${kit.seed}. The top row `
      + `is ${ASH} and the bottom row is ${BIRCH}. The dial moves Birch's true average only; the `
      + 'customers themselves stay put, so the crowd slides rather than being replaced. Once you '
      + "draw your line, each cafe's true average is marked on its own row, a faint guide carries "
      + 'that mark the height of the frame, and the bracket across the top measures the gap.',
    describe: () => `Two rows of thirty dots each, in minutes waited. ${BIRCH} is centerd `
      + `${min1(gap)} minutes to the right of ${ASH}, and ${crossers()} of the thirty customers `
      + `at ${ASH} waited longer than the average customer at ${BIRCH}.`,
    draw: (st) => {
      crowdFrame(st);
      st.label(ASH, 0.25, LABEL_TOP_Y, { align: 'left', size: 12, weight: 700, color: 'ink2' });
      st.label(BIRCH, 0.25, LABEL_BOT_Y, { align: 'left', size: 12, weight: 700, color: 'ink2' });
      st.dots(points(peopleA, MU_ASH, ROW_TOP, JITTER), { r: 4.5, fill: 'data', alpha: 0.8 });
      st.dots(points(peopleB, MU_ASH + gap, ROW_BOT, JITTER), { r: 4.5, fill: 'data', alpha: 0.8 });
      if (shown) {
        /* Two faint full-height guides carry each true average up to the measuring bar, and
           the solid marks stay inside their own row, so it stays visible which crowd each
           average is the average of. */
        st.vline(MU_ASH, { color: 'truth', width: 1.5, dash: 4, alpha: 0.3 });
        st.vline(MU_ASH + gap, { color: 'truth', width: 1.5, dash: 4, alpha: 0.3 });
        rowMark(st, MU_ASH, ROW_TOP, TICK_HALF, { color: 'truth', width: 3 });
        rowMark(st, MU_ASH + gap, ROW_BOT, TICK_HALF, { color: 'truth', width: 3 });
        st.bracket(MU_ASH, MU_ASH + gap, BRACKET_Y, {
          color: 'truth', label: `${min1(gap)} min apart`,
        });
      }
    },
  });

  /* The dial stops at a tenth of a minute rather than at zero. A gap of nothing would
     make the sentence under this instrument false: there would be no real difference
     left for the picture to be failing to show. */
  const slider = kit.ui.slider({
    label: 'How much slower Birch really is',
    min: 0.1, max: 2, step: 0.1, value: gap, unit: 'min',
    fmt: (v) => min1(v),
    onInput: (v) => {
      gap = Number(v);
      real.set(`${min1(gap)} min`);
      cross.set(`${crossers()} of ${N_BUSY}`);
      fig.draw();
    },
  });

  const commit = kit.ui.button({
    label: 'Draw the line here',
    kind: 'primary',
    onClick: () => {
      shown = true;
      line.set(`${min1(gap)} min`);
      state.setLine(gap);
      fig.draw();
      if (explained) return;
      explained = true;
      reveal.append(named(
        'You just drew a null result',
        `Below ${min1(gap)} minutes the difference between these two cafes is still there. It is `
        + 'in the dial and in the marks, and the picture cannot show it to you. Nothing about the '
        + 'two cafes changed as the dial came down. What ran out was the evidence in front of you.',
        'This is the sentence hiding under the phrase "no significant difference". It does not '
        + 'mean the two things are the same. It means the gap was small next to how much these '
        + 'numbers bounce around, so this evidence cannot tell that gap apart from no gap at all. '
        + '"We could not tell" and "there is nothing there" are different claims, and the second '
        + 'one gets printed when the first one is what happened.',
      ));
      reveal.append(deeper(
        'What moves your line up and down',
        'Two things, and you can feel both from where you are sitting. Time more customers at '
        + 'each cafe and your line drops, because a bigger crowd shows its middle more sharply. '
        + 'Make the waits themselves more erratic, say by putting a trainee on the machine, and '
        + 'your line rises, because a wider crowd hides more.',
        'A statistical test is that comparison written down: the size of the gap set against the '
        + 'size of the bounce. Unit 11-trial builds it, and it turns your line into a number that '
        + 'two strangers can agree on, which is the same trick the mean pulled a moment ago.',
      ));
    },
  });

  wrap.append(
    fig.el,
    controls(slider.el, commit.el),
    readoutRow(real.el, cross.el, line.el),
    quiet('The line is yours. Move the dial and press again whenever you want to move it.'),
    reveal,
  );
  return wrap;
}

/* ---------------------------------------------------------------------------
   Beat 3. The truth holds still and the evidence moves. This is the figure that earns
   its frame rate. */

function sectionWorlds(kit) {
  const wrap = block();
  wrap.append(heading('The same two cafes, a different Tuesday'));
  wrap.append(para(
    `Here are the two cafes again on a quiet afternoon, ${N_QUIET} customers each instead of `
    + `${N_BUSY}. ${BIRCH} really is slower, by ${min1(WORLD_GAP)} minutes, and that never changes `
    + 'below. What changes is who happened to walk in. Every world number is a different afternoon '
    + 'with the same two cafes, and typing the same number anywhere on earth brings back the same '
    + 'afternoon.'));

  let world = kit.seed;
  let mix = 1;
  let cancel = null;
  let rolls = 0;
  let agreed = 0;
  let flipped = 0;
  /* Declared before setWorld can reach them. A ui implementation that fired its callback
     once during construction would otherwise hit the temporal dead zone and take the
     screen down: the world box's onChange calls a function that writes back into the box. */
  let seedCtl = null;
  let rollEl = null;
  let sameEl = null;
  let otherEl = null;
  let syncing = false;
  let closed = false;

  function frameFor(w) {
    const r = kit.makeRng(`01-noticing/quiet/${w}`);
    const A = customers(r, N_QUIET);
    const B = customers(r, N_QUIET);
    const xa = A.map((p) => waitOf(p, MU_ASH));
    const xb = B.map((p) => waitOf(p, MU_ASH + WORLD_GAP));
    return {
      xa, xb,
      ya: A.map((p) => ROW_TOP + p.jitter * JITTER),
      yb: B.map((p) => ROW_BOT + p.jitter * JITTER),
      ma: kit.stats.mean(xa),
      mb: kit.stats.mean(xb),
    };
  }

  let curr = frameFor(world);
  let prev = null;

  const lerp = (a, b, t) => a + (b - a) * t;

  /* Dots are matched by position in the line, so the crowd rearranges itself rather
     than blinking. The motion carries no information a still frame lacks, which is why
     jumping straight to the end for a reduced-motion reader costs nothing. */
  function rowPoints(xKey, yKey) {
    return curr[xKey].map((x, i) => {
      const px = prev ? prev[xKey][i] : x;
      const py = prev ? prev[yKey][i] : curr[yKey][i];
      return [lerp(px, x, mix), lerp(py, curr[yKey][i], mix)];
    });
  }

  const sampleGap = () => curr.mb - curr.ma;

  /* One rule decides both the sentence and the tally, so the screen can never say an
     afternoon was too close to call and then count it as pointing somewhere. */
  const pointsAtBirch = () => sampleGap() >= 0;

  function verdict() {
    const d = sampleGap();
    const size = Math.abs(d) < TOO_CLOSE
      ? 'by less than a tenth of a minute, which is too close to see by eye'
      : `by ${min1(Math.abs(d))} minutes`;
    if (d >= 0) {
      return `World ${world}: the ${N_QUIET} customers at ${BIRCH} averaged longer than the `
        + `${N_QUIET} at ${ASH}, ${size}. That is the way the truth runs.`;
    }
    return `World ${world}: the ${N_QUIET} customers at ${ASH} averaged longer than the `
      + `${N_QUIET} at ${BIRCH}, ${size}. That is the wrong way round, and the dozen who walked `
      + 'into Birch that afternoon were in luck.';
  }

  const say = liveBox();
  say.append(para(verdict()));

  const rolled = kit.ui.readout({ label: 'Afternoons rolled', value: '0', tone: 'plain' });
  const withTruth = kit.ui.readout({ label: 'Pointed at Birch', value: '0', tone: 'result' });
  const against = kit.ui.readout({ label: 'Pointed the wrong way', value: '0', tone: 'wrong' });

  const fig = mountFigure(kit, {
    height: 240,
    caption:
      `Twelve simulated visits to each cafe in one afternoon, in minutes. ${BIRCH} is truly `
      + `${min1(WORLD_GAP)} minutes slower, marked on each row by a dashed tick that never moves. `
      + 'The solid tick is the average of the twelve people who actually turned up, and it lands '
      + 'somewhere new every afternoon. Sometimes it lands on the wrong side of the dashed one. '
      + 'The world number beside the figure says which afternoon is on screen.',
    describe: () => `Two rows of ${N_QUIET} dots each, in minutes waited. ${verdict()}`,
    draw: (st) => {
      crowdFrame(st);
      st.label(ASH, 0.25, LABEL_TOP_Y, { align: 'left', size: 12, weight: 700, color: 'ink2' });
      st.label(BIRCH, 0.25, LABEL_BOT_Y, { align: 'left', size: 12, weight: 700, color: 'ink2' });
      rowMark(st, MU_ASH, ROW_TOP, TICK_HALF, { color: 'truth', width: 2.5, dash: 5 });
      rowMark(st, MU_ASH + WORLD_GAP, ROW_BOT, TICK_HALF, { color: 'truth', width: 2.5, dash: 5 });
      st.dots(rowPoints('xa', 'ya'), { r: 5, fill: 'data', alpha: 0.8 });
      st.dots(rowPoints('xb', 'yb'), { r: 5, fill: 'data', alpha: 0.8 });
      rowMark(st, lerp(prev ? prev.ma : curr.ma, curr.ma, mix), ROW_TOP, TICK_HALF,
        { color: 'result', width: 3 });
      rowMark(st, lerp(prev ? prev.mb : curr.mb, curr.mb, mix), ROW_BOT, TICK_HALF,
        { color: 'result', width: 3 });
    },
  });

  const after = liveBox();

  function closeUp() {
    if (closed || rolls < 4) return;
    closed = true;
    after.append(named(
      'That wobble has a name',
      `Same two cafes, same true difference of ${min1(WORLD_GAP)} minutes, and the picture came `
      + 'out different every afternoon. Nothing broke. Twelve customers is a small sample of a '
      + 'busy year, and a small sample carries the mood of whoever happened to be in the line. '
      + 'The movement in those solid ticks is called sampling variation.',
      'It is the reason a single study is a single afternoon. Run it again with different people '
      + 'and you get a different number, and the interesting question stops being what did we get '
      + 'and becomes how far does this number move when we run it again. Unit 08-wobble measures '
      + 'that distance and 10-range turns it into a range you can quote.',
    ));
  }

  /* The roll button opens once the reader has said what they expect, or once they have
     asked for one afternoon by number, which is a commitment of its own. */
  function unlock() {
    if (rollEl && rollEl.disabled) rollEl.disabled = false;
  }

  /* setWorld is reached from the roll button and from the world box, and it writes the
     number back into the box. The shipped seedBox stays quiet on a programmatic set, and
     the guard keeps that from being a requirement.

     The world in the address bar is left alone. Rolling an afternoon here would otherwise
     redraw the first two figures on the next reload and throw away the marks the reader
     made on them, so the box carries the number and the prose says to type it back. */
  function setWorld(n) {
    if (syncing) return;
    unlock();
    world = Math.max(1, Math.floor(Number(n) || 1));
    prev = curr;
    curr = frameFor(world);
    rolls += 1;
    if (pointsAtBirch()) agreed += 1; else flipped += 1;
    rolled.set(String(rolls));
    withTruth.set(String(agreed));
    against.set(String(flipped));
    say.replaceChildren(para(verdict()));
    if (seedCtl && typeof seedCtl.set === 'function') {
      syncing = true;
      seedCtl.set(world);
      syncing = false;
    }
    // Put the world in the address bar. This is the whole promise of numbered
    // worlds: the link you copy brings back the afternoon you were looking at.
    if (kit.setSeed) kit.setSeed(world);
    closeUp();

    if (cancel) { cancel(); cancel = null; }
    const engine = kit.engine;
    /* Ask the live query where the module offers one. A reader can turn the setting on
       halfway through a session, and the exported constant was read at page load. */
    const still = engine && typeof engine.prefersReducedMotion === 'function'
      ? engine.prefersReducedMotion()
      : Boolean(engine && engine.reducedMotion);

    if (engine && typeof engine.tween === 'function' && !still) {
      mix = 0;
      cancel = engine.tween({
        from: 0, to: 1, ms: 520,
        ease: engine.ease ? engine.ease.outCubic : undefined,
        onStep: (v) => { mix = Number.isFinite(v) ? v : 1; fig.draw(); },
        onDone: () => { mix = 1; cancel = null; fig.draw(); },
      });
    } else {
      mix = 1;
      fig.draw();
    }
  }

  /* Which afternoon to visit next is the one genuinely arbitrary choice on the screen,
     so it is the one place an unseeded coin toss belongs. Everything inside the world is
     rebuilt from its number, which is what makes it shareable. */
  const rollBtn = kit.ui.button({
    label: 'Roll another afternoon',
    kind: 'primary',
    onClick: () => {
      let n = world;
      while (n === world) n = Math.floor(Math.random() * 900) + 100;
      setWorld(n);
    },
  });
  rollEl = asButton(rollBtn.el);
  if (rollEl) rollEl.disabled = true;

  const seed = kit.ui.seedBox({
    label: 'World',
    value: world,
    onChange: (n) => setWorld(n),
  });
  seedCtl = seed;

  const guessSay = liveBox();

  function predict(sameWay) {
    unlock();
    [sameEl, otherEl].forEach((b) => {
      if (!b) return;
      const hadFocus = document.activeElement === b;
      b.disabled = true;
      /* Disabling the button somebody just pressed drops focus to the top of the
         document. Hand it to the control they are meant to reach for next. */
      if (hadFocus && rollEl) rollEl.focus({ preventScroll: true });
    });
    guessSay.replaceChildren(para(sameWay
      ? 'That is the common answer, and the reasoning under it is sound: nothing about the two '
        + 'cafes changes between afternoons, so the answer has no obvious reason to move. Roll a '
        + 'few and see which part of the picture moves anyway.'
      : 'Then the tally beside the figure is the thing to watch rather than the flip itself. How '
        + 'often it happens is a measurable quantity, and 08-wobble measures it.'));
  }

  const same = kit.ui.button({ label: 'The same way', kind: 'ghost', onClick: () => predict(true) });
  const other = kit.ui.button({ label: 'Sometimes the other way', kind: 'ghost', onClick: () => predict(false) });
  sameEl = asButton(same.el);
  otherEl = asButton(other.el);

  kit.bin.push(() => { if (cancel) cancel(); });

  wrap.append(
    fig.el,
    say,
    para('That is one afternoon. Before rolling a fresh one, say what you think happens: does a '
      + 'new afternoon point the same way as this one?'),
    controls(same.el, other.el),
    guessSay,
    controls(rollBtn.el, seed.el),
    readoutRow(rolled.el, withTruth.el, against.el),
    quiet('Roll four or five. The tally counts afternoons, and counting is the only arithmetic on '
      + 'this screen. The number in the box is how you get any of these afternoons back.'),
    after,
  );
  return wrap;
}

/* ---------------------------------------------------------------------------
   Beat 4: the same idea, in a place with nothing to do with coffee. */

function sectionApply(kit) {
  const wrap = block();
  wrap.append(heading('Somewhere else entirely'));
  wrap.append(para(
    'A primary school tries a new reading scheme with 12 pupils and compares them with 12 who '
    + 'carried on as before. The new group finishes the year a little higher on the reading test. '
    + 'Plot both sets of scores and the two crowds sit almost on top of each other, the way the '
    + 'two cafes did near the bottom of your dial.'));

  wrap.append(kit.ui.quiz({
    question: 'Which sentence is the school entitled to put in its newsletter?',
    options: [
      {
        label: 'The new scheme works. The children on it scored higher.',
        correct: false,
        why: 'The scores really did come out higher, and that is the direction anyone running the '
          + 'scheme was hoping for, so this is the natural thing to write. The trouble is that 12 '
          + 'pupils against 12, with the two sets of scores overlapping this much, throws up a gap '
          + 'this size regularly when nothing at all is going on. You watched that happen in the '
          + 'cafe afternoons.',
      },
      {
        label: 'The new scheme does not work. The difference was not significant.',
        correct: false,
        why: 'This is the careful-sounding option and it is the more expensive mistake. Nothing '
          + 'here rules out a real effect either. A comparison that cannot show a difference '
          + 'cannot show its absence, and reporting it as a finding of no effect retires a scheme '
          + 'that may well work.',
      },
      {
        label: 'This comparison could not tell either way. To say anything, involve more pupils.',
        correct: true,
        why: 'The evidence is too thin to separate a real gap from an ordinary bit of luck, and '
          + 'saying so is a complete and publishable sentence. It is also the only one of the '
          + 'three that tells the school what to do next.',
      },
    ],
  }).el);

  return wrap;
}

/* ---------------------------------------------------------------------------
   Beat 5: the reader performs the distortion, using only true numbers. */

function sectionCrop(kit) {
  const wrap = block();
  wrap.append(heading('The same difference, drawn to alarm you'));
  wrap.append(para(
    'Both cafes have now been timed for a year, about 4,000 visits each, so the wobble you have '
    + `been watching is far too small to argue about. ${ASH} averages ${min1(YEAR_ASH)} minutes `
    + `and ${BIRCH} averages ${min1(YEAR_BIRCH)} minutes. Those two numbers are true and they stay `
    + 'on the screen whatever the switch below does.'));

  let zeroed = true;
  const ratio = () => (YEAR_BIRCH - (zeroed ? 0 : CROP_FLOOR)) / (YEAR_ASH - (zeroed ? 0 : CROP_FLOOR));

  const saysNum = kit.ui.readout({ label: 'What the numbers say', value: `${PCT}% longer`, tone: 'result' });
  const saysPic = kit.ui.readout({
    label: "Birch's bar against Ash's", value: `${min1(ratio())} times the height`, tone: 'plain', live: true,
  });

  const fig = mountFigure(kit, {
    height: 250,
    caption:
      'Average wait over a year at each cafe, in minutes, from about 4,000 invented visits each. '
      + `${ASH} sits at ${min1(YEAR_ASH)} minutes and ${BIRCH} at ${min1(YEAR_BIRCH)}, a `
      + `difference of ${PCT}%. With the axis starting at zero the two bars are nearly the same `
      + `height. With it starting at ${min1(CROP_FLOOR)} minutes, Birch's bar stands five times `
      + "the height of Ash's, and not one number on the chart has changed.",
    describe: () => (zeroed
      ? `Two bars, ${min1(YEAR_ASH)} and ${min1(YEAR_BIRCH)} minutes, on an axis starting at zero. `
        + `They are nearly the same height, a difference of ${PCT}%.`
      : `The same two bars, ${min1(YEAR_ASH)} and ${min1(YEAR_BIRCH)} minutes, on an axis starting `
        + `at ${min1(CROP_FLOOR)} minutes. Birch's bar is now ${min1(ratio())} times the height of `
        + `Ash's, from the same ${PCT}% difference.`),
    draw: (st) => {
      const floor = zeroed ? 0 : CROP_FLOOR;
      const top = zeroed ? 6.6 : 5.5;
      /* Padding is set wide enough that neither axis needs to grow it, and the y axis is
         drawn first because it is the one that moves the left edge. An axis that grows the
         box after the other one has measured against it would leave the two of them
         measuring from different places. */
      st.domain(0.35, 2.65, floor, top).pad(40, 16, 26, 28);
      st.axisY(zeroed ? 4 : [4.9, 5.1, 5.3, 5.5], (v) => min1(v));
      st.axisX([1, 2], (v) => (v === 1 ? ASH : BIRCH));
      st.bars([
        { x0: 0.65, x1: 1.35, h: YEAR_ASH },
        { x0: 1.65, x1: 2.35, h: YEAR_BIRCH },
      ], { color: 'data', gap: 2, alpha: 0.9 });
      st.note(`${min1(YEAR_ASH)} min`, st.X(1), st.Y(YEAR_ASH) - 9, { size: 12, weight: 700, color: 'ink' });
      st.note(`${min1(YEAR_BIRCH)} min`, st.X(2), st.Y(YEAR_BIRCH) - 9, { size: 12, weight: 700, color: 'ink' });
      st.note('minutes waited', 10, 14, { align: 'left', size: 11, color: 'ink2', weight: 600 });
    },
  });

  const flip = kit.ui.toggle({
    label: 'Start the axis at zero',
    checked: true,
    onChange: (on) => {
      zeroed = on === undefined ? !zeroed : Boolean(on);
      saysPic.set(`${min1(ratio())} times the height`);
      fig.draw();
    },
  });

  wrap.append(
    fig.el,
    controls(flip.el),
    readoutRow(saysNum.el, saysPic.el),
    warned(
      'Same numbers, different claim',
      'Every figure on that chart is correct in both states. Starting the axis at '
      + `${min1(CROP_FLOOR)} minutes throws away the bottom of both bars, so the `
      + `${min1(YEAR_BIRCH - YEAR_ASH)} minutes of real difference fills the frame and Birch's bar `
      + `ends up five times the height of Ash's. The honest sentence about that picture is still `
      + `${PCT}% longer, and almost nobody reads a bar chart by reading its axis.`,
      'The usual way a chart like this gets made is not malice. Charting software fits the axis to '
      + 'the numbers it was handed, because most of the time that is the helpful thing to do, and '
      + 'somebody accepts the default. You will do this by accident. The habit that catches it is '
      + 'checking where the axis starts, on your own charts first.',
    ),
    para(
      'Cropping an axis is not automatically a lie, which is the part that makes this hard. A '
      + 'chart of global average temperature drawn from zero degrees Celsius upwards is useless, '
      + 'because the whole story lives in about one degree of movement and a zeroed axis hides '
      + 'it. The question is never whether the axis was cropped. It is whether the size of the '
      + 'change on the screen matches the size of the change in the world.',
    ),
  );
  return wrap;
}

/* ---------------------------------------------------------------------------
   The close: four plain-word descriptions of what happened, each with the term the
   rest of the world uses for it and the unit that picks it up. */

function sectionRecap(kit, state) {
  const wrap = block();
  wrap.append(heading('Four things you did'));
  wrap.append(para(
    'None of these needed a symbol, and none of them stops being true when the symbols arrive in '
    + '05-spread. The symbols are shorthand for sentences you can already say.'));

  const steps = kit.ui.steps([
    {
      title: 'You found where a crowd sits',
      body: 'You slid a marker to the middle of thirty waiting times without adding anything up, '
        + 'and it landed near the answer the arithmetic gives. That answer is the mean. Unit '
        + '04-middle takes it apart, along with the other honest middle, the median.',
    },
    {
      title: 'You found the edge of your own eyesight',
      body: 'You turned a real difference down until the picture stopped carrying it, and marked '
        + 'the setting where that happened. A difference the evidence cannot show is a null '
        + 'result: a statement about what this evidence can support, not about what is true. Unit '
        + '11-trial turns your line into a number by setting the gap against the bounce.',
    },
    {
      title: 'You watched the answer move between afternoons',
      body: 'The two cafes held still and the picture of them did not, because a different dozen '
        + 'people walked in. That is sampling variation. Unit 08-wobble measures how far a result '
        + 'moves when the study is run again, and 10-range turns that into a range you can quote.',
    },
    {
      title: `You made ${PCT}% look like five times as much`,
      body: 'You cropped an axis using true numbers only, and the claim the picture makes changed '
        + 'while the data sat still. Truncating an axis is the name for that move. Unit '
        + '16-rhetoric is this whole toolkit turned around: reading the claims other people make, '
        + 'and writing ones that survive being checked.',
    },
  ]);
  /* Every step at once: this is a summary rather than a walkthrough. reveal(i) shows
     everything up to and including i, and the loop is here so that a builder which
     revealed one card at a time would still land on all four. */
  for (let i = 0; i < 4; i++) steps.reveal(i);
  wrap.append(steps.el);

  /* The second step is the one the reader put a number on. The screen only quotes that
     number once they have chosen one, so the close never invents a decision for them. */
  const mine = liveBox();
  state.onLine((v) => {
    mine.replaceChildren(para(
      `Your line came in at ${min1(v)} minutes. Below that, on this evidence, a real difference `
      + 'and no difference at all look the same.'));
  });
  wrap.append(mine);

  wrap.append(para(
    'Noticing is measuring, which is the whole claim of this unit and most of the claim of the '
    + 'course. The rest of it is this, with more customers and better instruments, and nothing '
    + 'later is a different kind of thinking from what you did on this screen.'));

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
  h.append(el('p', 'kicker', 'Unit 1 · about 20 minutes'));
  h.append(el('h1', null, 'Bigger, smaller, how sure'));
  h.append(el('p', 'lesson__q', 'How do I know one pile is bigger than another, and how sure am I?'));
  h.append(el('p', 'lede',
    'Somebody puts two crowds of numbers in front of you and asks which one is bigger. You do not '
    + 'need any of the machinery in the other fifteen units to have an opinion about that, and the '
    + 'opinion you form in about half a second is usually right. This unit is about what your eye '
    + 'is doing when it does that, and about where it stops working.'));
  h.append(quiet(
    `Every dot on this screen is invented, drawn in world ${kit.seed}. Type the same world number `
    + 'on another phone and the same customers walk in.'));
  return h;
}

/* The one thing that crosses a section boundary: the line the reader draws in the second
   instrument, which the close reads back to them if they drew one. */
function makeState() {
  const watchers = [];
  return {
    line: null,
    onLine(fn) { watchers.push(fn); if (this.line != null) fn(this.line); },
    setLine(v) { this.line = v; watchers.forEach((fn) => fn(v)); },
  };
}

function render(root, ctx) {
  const ui = ctx.ui;
  const stats = ctx.stats;
  const stage = ctx.stage || (ctx.viz && ctx.viz.stage);
  /* The contract puts a bound stage on ctx and main.js also passes the viz module, so
     either spelling is accepted. The world factory is taken from ctx when it is offered
     and from core/rng.js otherwise, because a lesson that quietly stopped rebuilding a
     world from its number would go on printing "type the same number and the same
     customers walk in" while it was no longer true. */
  const makeRng = typeof ctx.makeRng === 'function'
    ? ctx.makeRng
    : (ctx.rng && typeof ctx.rng.makeRng === 'function' ? ctx.rng.makeRng : coreMakeRng);

  if (!ui || !stats || !stage) {
    throw new Error('01-noticing needs ui, stats and a drawing stage on the lesson context.');
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

  const body = el('div', 'lesson__body');
  body.append(
    sectionMiddle(kit),
    sectionOverlap(kit, state),
    sectionWorlds(kit),
    sectionApply(kit),
    sectionCrop(kit),
    sectionRecap(kit, state),
  );
  root.append(head(kit), body);

  /* Canvases can only measure themselves once they are on the page. */
  const repaint = () => { kit.redraws.forEach((draw) => draw()); };
  repaint();

  /* viz.js holds the colors it read out of the stylesheet for a fraction of a second, so
     a redraw fired the instant the scheme changes can still be painting in the old
     palette. Paint now for the figures that are about to move anyway, and again once that
     cache has certainly expired for the three that never redraw on their own. */
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
  id: '01-noticing',
  unit: 'I',
  title: 'Bigger, smaller, how sure',
  question: 'How do I know one pile is bigger than another, and how sure am I?',
  minutes: 20,
  render,
};
