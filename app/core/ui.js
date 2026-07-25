/* ui.js
   The instrument kit: sliders, segmented switches, readouts, the world-number box.
   Every builder returns real DOM that is already wired, keyboard reachable and
   labelled. No framework, no templates, no innerHTML. */

import { fmtNum } from './viz.js';

let counter = 0;
const uid = (prefix) => `ec-${prefix}-${++counter}`;

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = String(text);
  return n;
}

/* Lesson text is usually a string, but sometimes it needs a bit of marked-up maths,
   so a caller may hand us a node instead. Never a string of HTML. */
function setContent(node, value) {
  if (value == null) node.replaceChildren();
  else if (value instanceof Node) node.replaceChildren(value);
  else node.textContent = String(value);
  return node;
}

/* "40%" reads better closed up; "40 people" needs the space. */
function withUnit(text, unit) {
  if (!unit) return text;
  return /^[%°]/.test(unit) ? text + unit : `${text} ${unit}`;
}

/* ---- slider -------------------------------------------------------------- */

/** opts: {label, min, max, step, value, unit, fmt, onInput} */
export function slider(opts = {}) {
  const o = { min: 0, max: 100, step: 1, value: 50, label: 'Value', unit: '', ...opts };
  const id = uid('slider');

  const wrap = el('div', 'ec-control');
  const label = el('label', 'ec-control__label');
  label.setAttribute('for', id);
  const name = document.createTextNode(`${o.label} `);
  const shown = el('span', 'ec-control__value');
  label.append(name, shown);

  const input = el('input', 'ec-slider');
  input.type = 'range';
  input.id = id;
  input.min = o.min;
  input.max = o.max;
  input.step = o.step;
  input.value = o.value;

  const get = () => Number(input.value);

  const show = () => {
    const v = get();
    const text = withUnit(o.fmt ? String(o.fmt(v)) : fmtNum(v, Number(o.step)), o.unit);
    shown.textContent = text;
    // Screen readers read the raw number otherwise, which loses the unit entirely.
    input.setAttribute('aria-valuetext', text);
  };

  input.addEventListener('input', () => {
    show();
    if (typeof o.onInput === 'function') o.onInput(get());
  });

  wrap.append(label, input);
  show();

  return {
    el: wrap,
    get,
    /* A programmatic set moves the dial but does not fire onInput, so a lesson can
       reset its controls without re-entering its own handler. */
    set(v) {
      input.value = v;   // the element clamps to min/max and snaps to step for us
      show();
    },
  };
}

/* ---- segmented switch ---------------------------------------------------- */

/** opts: {label, options:[{value, label}], value, onChange} */
export function segmented(opts = {}) {
  const o = { label: '', options: [], ...opts };
  const wrap = el('div', 'ec-control');
  const group = el('div', 'ec-seg');
  group.setAttribute('role', 'group');

  if (o.label) {
    const lid = uid('seglabel');
    const lab = el('span', 'ec-control__label', o.label);
    lab.id = lid;
    group.setAttribute('aria-labelledby', lid);
    wrap.append(lab);
  }

  let value = o.value != null ? o.value : (o.options[0] && o.options[0].value);
  const buttons = [];

  const paintState = () => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.value === String(value))));
  };

  o.options.forEach((opt) => {
    // Each segment is a real button, so Tab and Enter and Space already work and there
    // is no custom key handling to get wrong.
    const b = el('button', 'ec-seg__btn', opt.label);
    b.type = 'button';
    b.dataset.value = String(opt.value);
    b.addEventListener('click', () => {
      if (String(value) === String(opt.value)) return;
      value = opt.value;
      paintState();
      if (typeof o.onChange === 'function') o.onChange(value);
    });
    buttons.push(b);
    group.append(b);
  });

  paintState();
  wrap.append(group);

  return {
    el: wrap,
    get: () => value,
    set(v) {
      value = v;
      paintState();
    },
  };
}

/* ---- button -------------------------------------------------------------- */

/** opts: {label, kind:'primary'|'ghost', onClick} */
export function button(opts = {}) {
  const b = el('button', opts.kind === 'ghost' ? 'ec-btn ec-btn--ghost' : 'ec-btn', opts.label || 'Go');
  b.type = 'button';
  if (opts.title) b.title = opts.title;
  if (typeof opts.onClick === 'function') b.addEventListener('click', opts.onClick);
  return { el: b };
}

/* ---- toggle -------------------------------------------------------------- */

/** opts: {label, checked, onChange} */
export function toggle(opts = {}) {
  const wrap = el('label', 'ec-toggle');
  const box = el('input');
  box.type = 'checkbox';
  box.checked = Boolean(opts.checked);
  const text = el('span', null, opts.label || '');
  wrap.append(box, text);
  box.addEventListener('change', () => {
    if (typeof opts.onChange === 'function') opts.onChange(box.checked);
  });
  return {
    el: wrap,
    get: () => box.checked,
    set(v) { box.checked = Boolean(v); },
  };
}

/* ---- readout ------------------------------------------------------------- */

const TONES = ['truth', 'data', 'result', 'test', 'wrong', 'right'];

/** opts: {label, value, tone, live} where tone colours the number by what it means. */
export function readout(opts = {}) {
  const wrap = el('div', 'ec-readout');
  const lab = el('div', 'ec-readout__label', opts.label || '');
  const val = el('div', 'ec-readout__value');
  setContent(val, opts.value == null ? '—' : opts.value);

  wrap.append(lab, val);

  const setTone = (tone) => {
    TONES.forEach(t => wrap.classList.remove(`ec-readout--${t}`));
    if (tone && TONES.includes(tone)) wrap.classList.add(`ec-readout--${tone}`);
  };
  setTone(opts.tone); // 'plain' and anything unknown mean no tone class

  /* Off by default: a number that changes sixty times a second would make a screen
     reader unusable. Lessons that update on a click should switch it on. */
  if (opts.live) val.setAttribute('aria-live', 'polite');

  return {
    el: wrap,
    set(value, tone) {
      setContent(val, value == null ? '—' : value);
      if (tone !== undefined) setTone(tone);
    },
  };
}

/* ---- seed box ------------------------------------------------------------ */

/* The world number. A teacher can say "everyone type world 42" and every screen in
   the room shows the same picture, which is the whole point of seeding the course. */

/** opts: {label, value, min, max, onChange} */
export function seedBox(opts = {}) {
  const o = { label: 'World', value: 42, min: 1, max: 999999, ...opts };
  const lid = uid('seed');

  const wrap = el('div', 'ec-seed');
  const lab = el('span', 'ec-seed__label', o.label);
  lab.id = lid;

  const input = el('input', 'ec-seed__input');
  input.type = 'text';
  input.inputMode = 'numeric';
  input.autocomplete = 'off';
  input.setAttribute('aria-labelledby', lid);

  const die = el('button', 'ec-seed__die', '\u{1F3B2}');
  die.type = 'button';
  die.setAttribute('aria-label', 'Roll a new world');
  die.title = 'Roll a new world';

  function clampSeed(n) {
    const v = Math.floor(Number(n));
    if (!Number.isFinite(v)) return o.min;
    return Math.min(o.max, Math.max(o.min, v));
  }

  let value = clampSeed(o.value);
  input.value = String(value);

  function commit(next, announce) {
    const v = clampSeed(next);
    input.value = String(v); // typing junk snaps back to the world we are actually in
    if (v === value) return;
    value = v;
    if (announce && typeof o.onChange === 'function') o.onChange(value);
  }

  input.addEventListener('change', () => commit(input.value, true));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(input.value, true); }
  });
  // Tapping the number should let you type a new one straight away.
  input.addEventListener('focus', () => input.select());

  /* Rolled worlds stay short enough to read out loud and type back in, whatever the
     allowed range is. Math.random is the right tool here: choosing a world is the one
     moment in the course that is meant to be unrepeatable. */
  const rollHi = Math.min(o.max, 9999);
  const rollLo = Math.max(o.min, 1);
  die.addEventListener('click', () => {
    const span = Math.max(1, rollHi - rollLo + 1);
    let next = value;
    for (let i = 0; i < 8 && next === value; i++) {
      next = rollLo + Math.floor(Math.random() * span);
    }
    commit(next, true);
  });

  wrap.append(lab, input, die);

  return {
    el: wrap,
    get: () => value,
    set(v) { commit(v, false); },
  };
}

/* ---- quiz ---------------------------------------------------------------- */

/** opts: {question, options:[{label, correct, why}], onAnswer} and onAnswer(option, index) */
export function quiz(opts = {}) {
  const o = { question: '', options: [], ...opts };
  const wrap = el('div', 'ec-quiz');
  const q = el('p', 'ec-quiz__q');
  setContent(q, o.question);

  const list = el('div', 'ec-quiz__opts');
  list.setAttribute('role', 'group');
  const qid = uid('quiz');
  q.id = qid;
  list.setAttribute('aria-labelledby', qid);

  const why = el('p', 'ec-quiz__why');
  why.setAttribute('aria-live', 'polite');

  let answered = false;
  const buttons = [];

  o.options.forEach((opt, i) => {
    const b = el('button', 'ec-quiz__opt');
    b.type = 'button';
    setContent(b, opt.label);
    b.addEventListener('click', () => {
      if (answered) return;
      answered = true;

      b.classList.add(opt.correct ? 'is-right' : 'is-wrong');
      // Show where the right answer was, so a wrong guess still teaches something.
      if (!opt.correct) {
        buttons.forEach((other, j) => {
          if (o.options[j].correct) other.classList.add('is-right');
        });
      }
      /* Marked answered for assistive tech but left focusable and readable. A real
         disabled attribute would drop every option out of the tab order, which throws
         a keyboard reader back to the top of the page and hides the marked answer. */
      buttons.forEach((other) => other.setAttribute('aria-disabled', 'true'));

      /* The colour on the button is the only feedback a sighted reader needs, and it
         is the only feedback a screen reader would never get, so the live line always
         says the verdict out loud before it says why. */
      const verdict = opt.correct ? 'Right.' : 'Not that one.';
      if (opt.why == null) {
        setContent(why, verdict);
      } else if (opt.why instanceof Node) {
        const holder = document.createElement('span');
        holder.append(`${verdict} `, opt.why);
        setContent(why, holder);
      } else {
        setContent(why, `${verdict} ${opt.why}`);
      }
      why.classList.add('is-open', opt.correct ? 'is-right' : 'is-wrong');

      if (typeof o.onAnswer === 'function') o.onAnswer(opt, i);
    });
    buttons.push(b);
    list.append(b);
  });

  wrap.append(q, list, why);
  return { el: wrap };
}

/* ---- steps --------------------------------------------------------------- */

/* Progressive disclosure. reveal(i) shows everything up to and including step i,
   because the numbers on the cards are counted from the steps that are visible. */

/** steps([{title, body}, ...]) */
export function steps(list = []) {
  const wrap = el('div', 'ec-steps');
  wrap.setAttribute('aria-live', 'polite');

  const cards = list.map((s) => {
    const card = el('div', 'ec-step');
    if (s.title) card.append(el('h4', null, s.title));
    if (s.body != null) {
      const p = el('p');
      setContent(p, s.body);
      card.append(p);
    }
    card.hidden = true;
    wrap.append(card);
    return card;
  });

  let shown = 0; // how many are visible

  function reveal(i) {
    shown = Math.max(0, Math.min(cards.length, Math.floor(i) + 1));
    cards.forEach((c, j) => { c.hidden = j >= shown; });
    return shown - 1;
  }

  reveal(0); // the first step is on screen from the start, so nothing looks empty

  return {
    el: wrap,
    reveal,
    revealNext() { return reveal(shown); },
    reset() { return reveal(0); },
  };
}

/* ---- figure -------------------------------------------------------------- */

/** opts: {caption, height, alt} and the canvas is yours: hand it to viz.stage(). */
export function figure(opts = {}) {
  const o = { height: 260, ...opts };
  const fig = el('figure', 'ec-figure');
  const canvas = el('canvas', 'ec-figure__canvas');
  /* The height lives here rather than in the drawing code, so the picture is the
     right shape before a single pixel is drawn and nothing jumps on load. */
  canvas.style.height = `${o.height}px`;
  canvas.setAttribute('role', 'img');

  fig.append(canvas);

  if (o.caption != null) {
    const cap = el('figcaption', 'ec-figure__caption');
    setContent(cap, o.caption);
    cap.id = uid('caption');
    canvas.setAttribute('aria-describedby', cap.id);
    fig.append(cap);
  }

  // A picture with no words attached is invisible to a screen reader. Fall back to
  // the caption, which in this course always says what the figure means.
  const alt = o.alt != null ? o.alt : (typeof o.caption === 'string' ? o.caption : 'Figure');
  canvas.setAttribute('aria-label', alt);

  return { el: fig, canvas };
}

/* ---- layout ------------------------------------------------------------- */

/** A row of instruments. */
export function controls(...nodes) {
  const row = el('div', 'ec-controls');
  row.append(...nodes.flat().filter(Boolean));
  return row;
}

/** A row of readouts. */
export function readouts(...nodes) {
  const row = el('div', 'ec-readouts');
  row.append(...nodes.flat().filter(Boolean));
  return row;
}
