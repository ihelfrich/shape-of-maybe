/* app/core/ui.js
   The instrument panel. Every builder here returns real DOM nodes that are
   already wired, so a lesson asks for a slider and gets a slider, not markup.
   Nothing here knows any statistics; it only knows how to be touched, tabbed to,
   and read aloud. All styling lives in app/styles/app.css.

   One convention worth knowing: set(value) never fires the control's callback.
   Pass set(value, true) when you want it to. A set() that called back by default
   turns "redraw from state" into an infinite loop the first time a lesson uses
   its own callback to write state. */

let idCount = 0;
function uid(kind) { return `ec-${kind}-${++idCount}`; }

// Small DOM helper. Keeps the builders below readable instead of clever.
function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

// Put whatever we were handed (a string or a node) inside a parent.
function fill(parent, content) {
  if (content == null) return parent;
  if (content instanceof Node) parent.appendChild(content);
  else parent.textContent = String(content);
  return parent;
}

// How many decimals does this step size need? 0.25 needs two, 5 needs none.
function decimalsFor(step) {
  if (!Number.isFinite(step) || step <= 0) return 0;
  let d = 0;
  let s = Math.abs(step);
  while (d < 6 && Math.abs(Math.round(s) - s) > 1e-9) { s *= 10; d++; }
  return d;
}

function defaultFmt(step) {
  const d = decimalsFor(step);
  return (v) => (Math.abs(v) >= 10000
    ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })
    : v.toFixed(d));
}

/* slider — one continuous number the reader can drag or arrow through.
   opts {label, min, max, step, value, unit, fmt, onInput} -> {el, get, set}
   The value is always visible next to the label: an instrument shows its reading. */
export function slider(opts) {
  const o = opts || {};
  const min = Number.isFinite(o.min) ? o.min : 0;
  const max = Number.isFinite(o.max) ? o.max : 1;
  // A step of zero or less is not a step, and a range input given step="0"
  // silently falls back to 1, which would make a 0-to-1 slider a switch.
  const span = max - min;
  const step = (Number.isFinite(o.step) && o.step > 0)
    ? o.step
    : (span > 0 ? span / 100 : 1);
  const unit = o.unit ? String(o.unit) : '';
  const fmt = typeof o.fmt === 'function' ? o.fmt : defaultFmt(step);
  const id = uid('slider');

  const root = el('div', 'ec-control ec-slider');
  const head = el('div', 'ec-control-head');
  const label = el('label', 'ec-control-label', o.label || 'Value');
  label.htmlFor = id;
  const out = el('output', 'ec-control-value');
  out.setAttribute('for', id);
  head.append(label, out);

  const input = el('input', 'ec-slider-input');
  input.type = 'range';
  input.id = id;
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(Number.isFinite(o.value) ? o.value : min);

  function text(v) { return fmt(v) + (unit ? ' ' + unit : ''); }

  function paint() {
    const v = Number(input.value);
    out.textContent = text(v);
    // Screen readers otherwise announce the bare number with no unit.
    input.setAttribute('aria-valuetext', text(v));
    // Lets the stylesheet draw a filled track with no JS layout work.
    const frac = span === 0 ? 0 : (v - min) / span;
    root.style.setProperty('--ec-slider-frac', String(Math.min(1, Math.max(0, frac))));
  }

  input.addEventListener('input', () => {
    paint();
    if (typeof o.onInput === 'function') o.onInput(Number(input.value));
  });

  root.append(head, input);
  paint();

  return {
    el: root,
    get: () => Number(input.value),
    set(v, fire) {
      input.value = String(v);
      paint();
      if (fire && typeof o.onInput === 'function') o.onInput(Number(input.value));
    }
  };
}

/* segmented — a small row of mutually exclusive choices.
   opts {label, options:[{value,label}], value, onChange} -> {el, get, set}
   Built as a real radio group: Tab reaches the group once, then arrow keys move
   between choices and Home/End jump to the ends. */
export function segmented(opts) {
  const o = opts || {};
  const options = Array.isArray(o.options) ? o.options : [];
  const root = el('div', 'ec-control ec-segmented');
  const labelId = uid('seglabel');

  if (o.label) {
    const label = el('div', 'ec-control-label', o.label);
    label.id = labelId;
    root.appendChild(label);
  }

  const group = el('div', 'ec-segmented-group');
  group.setAttribute('role', 'radiogroup');
  if (o.label) group.setAttribute('aria-labelledby', labelId);
  else if (o.ariaLabel) group.setAttribute('aria-label', String(o.ariaLabel));

  let current = o.value != null ? o.value : (options[0] && options[0].value);

  const buttons = options.map((opt, i) => {
    const b = el('button', 'ec-segmented-option', opt.label);
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.addEventListener('click', () => choose(i, true));
    b.addEventListener('keydown', (e) => {
      const n = buttons.length;
      if (n === 0) return;
      let next = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % n;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + n) % n;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = n - 1;
      if (next >= 0) { e.preventDefault(); choose(next, true); buttons[next].focus(); }
    });
    group.appendChild(b);
    return b;
  });

  function paint() {
    buttons.forEach((b, i) => {
      const on = options[i].value === current;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.classList.toggle('is-selected', on);
      // Roving tabindex: one Tab stop for the whole group, arrows do the rest.
      b.tabIndex = on ? 0 : -1;
    });
    // If the starting value matched nothing, the group would have no Tab stop.
    if (!buttons.some((b) => b.tabIndex === 0) && buttons[0]) buttons[0].tabIndex = 0;
  }

  function choose(i, fire) {
    if (!options[i]) return;
    current = options[i].value;
    paint();
    if (fire && typeof o.onChange === 'function') o.onChange(current);
  }

  root.appendChild(group);
  paint();

  return {
    el: root,
    get: () => current,
    set(v, fire) {
      const i = options.findIndex((opt) => opt.value === v);
      if (i >= 0) choose(i, !!fire);
    }
  };
}

/* button — opts {label, kind:'primary'|'ghost', onClick} -> {el} */
export function button(opts) {
  const o = opts || {};
  const kind = o.kind === 'ghost' ? 'ghost' : 'primary';
  const b = el('button', `ec-button ec-button-${kind}`, o.label || 'Go');
  b.type = 'button';
  if (o.ariaLabel) b.setAttribute('aria-label', String(o.ariaLabel));
  if (typeof o.onClick === 'function') b.addEventListener('click', o.onClick);
  return { el: b };
}

/* toggle — one on/off switch. opts {label, checked, onChange} -> {el, get, set}
   A real checkbox inside a real label, so Space toggles it, the whole row is a
   hit target, and assistive tech already knows what it is. The stylesheet must
   hide .ec-toggle-input with clip/opacity rather than display:none, or the
   keyboard loses it. */
export function toggle(opts) {
  const o = opts || {};
  const root = el('label', 'ec-control ec-toggle');
  const input = el('input', 'ec-toggle-input');
  input.type = 'checkbox';
  input.checked = !!o.checked;
  const track = el('span', 'ec-toggle-track');
  track.appendChild(el('span', 'ec-toggle-thumb'));
  const text = el('span', 'ec-toggle-label', o.label || '');
  root.append(input, track, text);

  input.addEventListener('change', () => {
    if (typeof o.onChange === 'function') o.onChange(input.checked);
  });

  return {
    el: root,
    get: () => input.checked,
    set(v, fire) {
      input.checked = !!v;
      if (fire && typeof o.onChange === 'function') o.onChange(input.checked);
    }
  };
}

/* readout — a labelled number that changes as the reader plays.
   opts {label, value, tone:'truth'|'data'|'result'|'wrong'|'right'|'plain', live}
   -> {el, set}
   The tone is the colour code used everywhere: blue is the truth we are chasing,
   orange is the data we actually saw, green is the conclusion.
   live defaults to off. A readout driven by an animation changes sixty times a
   second, and a polite live region would read all sixty of them aloud. Turn it
   on for a number that settles once, like a final p-value. */
export function readout(opts) {
  const o = opts || {};
  const root = el('div', 'ec-readout');
  const label = el('span', 'ec-readout-label', o.label || '');
  const value = el('span', 'ec-readout-value', o.value != null ? String(o.value) : '');
  value.setAttribute('aria-live', o.live ? 'polite' : 'off');
  root.append(label, value);

  let toneClass = '';
  function setTone(tone) {
    if (toneClass) root.classList.remove(toneClass);
    toneClass = 'ec-tone-' + (tone || 'plain');
    root.classList.add(toneClass);
  }
  setTone(o.tone);

  return {
    el: root,
    set(v, tone) {
      value.textContent = v == null ? '' : String(v);
      if (tone) setTone(tone);
    }
  };
}

// A five-spot die, drawn rather than typed: the dice characters fall back to an
// empty box on plenty of phones, and this is the control people point at.
function dieFace() {
  const SVG = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '22');
  svg.setAttribute('height', '22');
  svg.setAttribute('class', 'ec-seedbox-die-face');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const box = document.createElementNS(SVG, 'rect');
  box.setAttribute('x', '3'); box.setAttribute('y', '3');
  box.setAttribute('width', '18'); box.setAttribute('height', '18');
  box.setAttribute('rx', '4');
  box.setAttribute('fill', 'none');
  box.setAttribute('stroke', 'currentColor');
  box.setAttribute('stroke-width', '1.6');
  svg.appendChild(box);
  for (const spot of [[8, 8], [16, 8], [12, 12], [8, 16], [16, 16]]) {
    const dot = document.createElementNS(SVG, 'circle');
    dot.setAttribute('cx', String(spot[0]));
    dot.setAttribute('cy', String(spot[1]));
    dot.setAttribute('r', '1.7');
    dot.setAttribute('fill', 'currentColor');
    svg.appendChild(dot);
  }
  return svg;
}

/* seedBox — the world number. Every simulated demo runs in a numbered world, so
   a teacher can say "everyone type world 42" and every screen in the room shows
   the same thing, and so a surprising result can be found again instead of lost.
   opts {label, value, min, max, onChange} -> {el, get, set} */
export function seedBox(opts) {
  const o = opts || {};
  const min = Number.isFinite(o.min) ? Math.round(o.min) : 1;
  const max = Number.isFinite(o.max) ? Math.round(o.max) : 9999;
  const hi = Math.max(min, max);
  const id = uid('seed');

  const root = el('div', 'ec-control ec-seedbox');
  const label = el('label', 'ec-seedbox-label', o.label || 'World');
  label.htmlFor = id;

  const input = el('input', 'ec-seedbox-input');
  input.type = 'number';
  input.id = id;
  input.inputMode = 'numeric';
  input.min = String(min);
  input.max = String(hi);
  input.step = '1';

  const die = el('button', 'ec-seedbox-die');
  die.type = 'button';
  die.setAttribute('aria-label', 'Roll a new world');
  die.title = 'Roll a new world';
  die.appendChild(dieFace());

  function clamp(n) {
    if (!Number.isFinite(n)) return min;
    return Math.min(hi, Math.max(min, Math.round(n)));
  }

  let last = clamp(Number.isFinite(o.value) ? o.value : 42);
  input.value = String(last);

  // Enter on a number input fires change in some browsers and not others, so
  // commit compares against the last committed world and stays quiet if the
  // world did not actually move. Otherwise one keypress re-renders twice.
  function commit(fire) {
    const v = clamp(Number(input.value));
    input.value = String(v);
    const moved = v !== last;
    last = v;
    if (fire && moved && typeof o.onChange === 'function') o.onChange(v);
  }

  input.addEventListener('change', () => commit(true));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(true); }
  });
  die.addEventListener('click', () => {
    // Math.random is fine here: this only picks which world to visit. Everything
    // inside the world is drawn by the seeded generator in app/core/rng.js.
    input.value = String(min + Math.floor(Math.random() * (hi - min + 1)));
    commit(true);
  });

  root.append(label, input, die);

  return {
    el: root,
    get: () => clamp(Number(input.value)),
    set(v, fire) {
      input.value = String(clamp(Number(v)));
      commit(!!fire);
    }
  };
}

/* quiz — one question, a few answers, and an explanation for whichever one was
   picked. opts {question, options:[{label, correct, why}], onAnswer} -> {el}
   Wrong answers are not punished or locked out: every option stays clickable, so
   the reader can find out why each one is what it is. */
export function quiz(opts) {
  const o = opts || {};
  const options = Array.isArray(o.options) ? o.options : [];
  const root = el('div', 'ec-quiz');
  const qId = uid('quizq');
  const q = el('p', 'ec-quiz-question', o.question || '');
  q.id = qId;
  const list = el('div', 'ec-quiz-options');
  list.setAttribute('role', 'group');
  list.setAttribute('aria-labelledby', qId);
  const why = el('div', 'ec-quiz-why');
  why.hidden = true;

  // A live region has to be in the page before its text changes, or screen
  // readers stay silent. The visible box can be hidden until it is needed; this
  // one cannot, so it is always here and visually hidden instead.
  const live = el('div', 'ec-sr-only');
  live.setAttribute('role', 'status');

  let answered = false;
  const buttons = [];

  options.forEach((opt, i) => {
    const b = el('button', 'ec-quiz-option');
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.appendChild(el('span', 'ec-quiz-option-mark'));
    b.appendChild(el('span', 'ec-quiz-option-label', opt.label || ''));
    b.addEventListener('click', () => {
      const right = !!opt.correct;
      const explain = opt.why || (right ? 'Yes.' : 'Not this one.');
      buttons.forEach((other) => other.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      // Marks from earlier attempts stay put on purpose: the trail of what you
      // tried is part of the record.
      b.classList.add(right ? 'is-right' : 'is-wrong');
      why.hidden = false;
      why.className = 'ec-quiz-why ' + (right ? 'is-right' : 'is-wrong');
      why.textContent = explain;
      live.textContent = (right ? 'Correct. ' : 'Not quite. ') + explain;
      const first = !answered;
      answered = true;
      if (typeof o.onAnswer === 'function') o.onAnswer(opt, i, right, first);
    });
    list.appendChild(b);
    buttons.push(b);
  });

  root.append(q, list, why, live);
  return { el: root };
}

/* steps — a worked argument revealed one move at a time, so the reader can try
   the next move before reading it.
   steps([{title, body}]) -> {el, reveal(i), revealNext(), reset()}
   body may be a string or any DOM node (a figure, a table, another control). */
export function steps(list) {
  const items = Array.isArray(list) ? list : [];
  const root = el('ol', 'ec-steps');
  // Newly revealed steps get read out; they arrive one at a time and only when
  // the reader asks, so this stays polite rather than chatty.
  root.setAttribute('aria-live', 'polite');
  let shown = -1;

  const nodes = items.map((step, i) => {
    const li = el('li', 'ec-step');
    li.appendChild(el('h4', 'ec-step-title', (step && step.title) || `Step ${i + 1}`));
    const body = el('div', 'ec-step-body');
    fill(body, step && step.body);
    li.appendChild(body);
    li.hidden = true;
    root.appendChild(li);
    return li;
  });

  function reveal(i) {
    const target = Number.isFinite(i) ? i : -1;
    shown = Math.min(items.length - 1, Math.max(-1, Math.floor(target)));
    nodes.forEach((li, k) => {
      const on = k <= shown;
      li.hidden = !on;
      li.classList.toggle('is-revealed', on);
    });
    return shown;
  }

  return {
    el: root,
    reveal,
    revealNext: () => reveal(shown + 1),
    reset: () => reveal(-1)
  };
}

/* figure — a canvas with a caption under it. opts {caption, height, alt}
   -> {el, canvas}
   The caption is also the canvas's accessible name, so a screen-reader user gets
   the sentence that says what the picture means rather than the word "canvas". */
export function figure(opts) {
  const o = opts || {};
  const h = o.height == null ? 260 : o.height;
  const root = el('figure', 'ec-figure');
  const frame = el('div', 'ec-figure-frame');
  frame.style.height = typeof h === 'number' ? `${h}px` : String(h);

  const canvas = el('canvas', 'ec-canvas');
  // Inline, so a figure is the right size even before the stylesheet lands.
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  canvas.setAttribute('role', 'img');
  frame.appendChild(canvas);
  root.appendChild(frame);

  let cap = null;
  if (o.caption != null) {
    cap = el('figcaption', 'ec-figure-caption');
    cap.id = uid('cap');
    fill(cap, o.caption);
    root.appendChild(cap);
  }

  // Captions are sometimes a node rather than a string, and String(node) is
  // "[object HTMLDivElement]", which is not a description of anything. Point at
  // the caption element instead and let it speak for itself.
  if (o.alt) canvas.setAttribute('aria-label', String(o.alt));
  else if (cap) canvas.setAttribute('aria-labelledby', cap.id);
  else canvas.setAttribute('aria-label', 'Figure');

  return { el: root, canvas };
}
