/* home.js
   The landing screen. It opens with a question a reader can answer in four seconds,
   then tells them what they just did. Everything else on this page is downstream of
   that one moment, so the moment gets the best real estate. */

import { UNITS, READY } from '../curriculum.js';
import { go, lessonById } from '../core/router.js';

/* Canvas cannot read CSS variables on its own, so we look them up. Doing it this way
   means the drawing follows light and dark mode without a second palette. */
function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/* A tiny seeded generator so every visitor on earth sees the same two crowds.
   The full version of this idea lives in core/rng.js and runs the whole course. */
function mulberry32(a) {
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCrowds(seed) {
  const u = mulberry32(seed);
  const norm = (mu, sd) => {
    // Box-Muller, one draw at a time. Clamped so nothing lands off-canvas.
    const a = Math.max(u(), 1e-12), b = u();
    const z = Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b);
    return Math.min(97, Math.max(3, mu + sd * z));
  };
  const A = Array.from({ length: 34 }, () => norm(40, 9.5));
  const B = Array.from({ length: 34 }, () => norm(60, 9.5));
  return { A, B };
}

const mean = xs => xs.reduce((s, x) => s + x, 0) / xs.length;

function drawHero(canvas, crowds, revealed) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = canvas.clientWidth || 640;
  const H = 250;
  canvas.style.height = H + 'px';
  if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const truth = cssVar('--truth', '#4C6EF5');
  const data = cssVar('--data', '#E8590C');
  const ink2 = cssVar('--ink-2', '#5F6270');
  const card = cssVar('--card', '#ffffff');

  const padX = 26;
  const X = v => padX + (v / 100) * (W - padX * 2);
  const rowA = H * 0.30, rowB = H * 0.70;
  const u = mulberry32(99); // stable vertical jitter

  const band = (values, y, color, label) => {
    ctx.font = '700 12px ' + cssVar('--sans', 'system-ui');
    ctx.fillStyle = ink2;
    ctx.textAlign = 'left';
    ctx.fillText(label, padX, y - 46);

    values.forEach(v => {
      const jitter = (u() - 0.5) * 46;
      ctx.beginPath();
      ctx.arc(X(v), y + jitter, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = card;
      ctx.stroke();
    });
  };

  band(crowds.A, rowA, truth, 'Top row');
  band(crowds.B, rowB, data, 'Bottom row');

  if (revealed) {
    const markMean = (values, y, color) => {
      const m = mean(values);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(X(m), y - 40);
      ctx.lineTo(X(m), y + 40);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = '800 13px ' + cssVar('--sans', 'system-ui');
      ctx.textAlign = 'center';
      ctx.fillText('middle', X(m), y - 48);
    };
    markMean(crowds.A, rowA, truth);
    markMean(crowds.B, rowB, data);
  }
}

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

export function home(root) {
  const wrap = el('div');

  /* ---------- hero ---------- */
  const hero = el('section', 'hero');
  hero.append(el('p', 'kicker', 'A free course in statistics and mathematics'));
  const h1 = el('h1');
  h1.textContent = 'You are already a mathematician.';
  hero.append(h1);
  hero.append(el('p', 'lede',
    'You compare, estimate, weigh risk and notice patterns all day long. This course does not ' +
    'teach you to think mathematically, because you already do. It gives you the names for what ' +
    'you are doing, and then hands you the instruments. Start with a question that takes four seconds.'));

  /* ---------- the opening instrument ---------- */
  const opener = el('div', 'opener');
  const body = el('div', 'opener__body');
  body.append(el('p', 'opener__ask', 'Which row of dots sits further to the right?'));

  const fig = el('figure', 'ec-figure');
  fig.style.marginTop = 'var(--s-4)';
  fig.style.border = '0';
  fig.style.boxShadow = 'none';
  fig.style.padding = '0';
  const canvas = el('canvas', 'ec-figure__canvas');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label',
    'Two rows of scattered dots. The top row is centred to the left of the bottom row.');
  fig.append(canvas);
  body.append(fig);

  const row = el('div', 'opener__row');
  const btnTop = el('button', 'ec-btn ec-btn--ghost', 'The top row');
  const btnBottom = el('button', 'ec-btn ec-btn--ghost', 'The bottom row');
  row.append(btnTop, btnBottom);
  body.append(row);

  const verdict = el('div', 'opener__verdict');
  verdict.setAttribute('aria-live', 'polite');
  body.append(verdict);
  opener.append(body);
  hero.append(opener);
  wrap.append(hero);

  const crowds = makeCrowds(7);
  let revealed = false;

  const redraw = () => drawHero(canvas, crowds, revealed);

  function answer(saidBottom) {
    if (revealed) return;
    revealed = true;
    redraw();
    btnTop.disabled = true;
    btnBottom.disabled = true;

    const right = saidBottom; // the bottom row really is further right
    const named = el('div', 'named');
    named.append(el('p', 'named__kicker', right ? 'Correct — and look at what you skipped' : 'Look again'));

    const p1 = el('p');
    p1.textContent = right
      ? 'You did not add sixty-eight numbers or divide by thirty-four. You looked, your eye ' +
        'found the middle of each crowd, and you compared them. That move has a name: comparing ' +
        'two means.'
      : 'The bottom row sits further right. The trick is to stop looking at any single dot and ' +
        'let your eye settle on where each crowd is centred. That is the move, and it is the ' +
        'one everything else is built from: comparing two means.';
    named.append(p1);

    const p2 = el('p');
    p2.style.marginTop = 'var(--s-3)';
    p2.textContent =
      'It is the same move behind every drug trial, every opinion poll, and every economics ' +
      'paper that has ever looked impenetrable. What those add is care: how big the gap is, how ' +
      'much the dots bounce around, and therefore how sure anyone is entitled to be. That is the ' +
      'course. You have done the first part of it already.';
    named.append(p2);
    verdict.append(named);

    const cta = el('div', 'opener__row');
    const start = el('button', 'ec-btn', 'Start unit 1');
    start.addEventListener('click', () => go('01-noticing'));
    const all = el('button', 'ec-btn ec-btn--ghost', `See all ${UNITS.length} units`);
    all.addEventListener('click', () => go('map'));
    cta.append(start, all);
    verdict.append(cta);

    verdict.classList.add('is-open');
  }

  btnTop.addEventListener('click', () => answer(false));
  btnBottom.addEventListener('click', () => answer(true));

  /* ---------- the four principles ---------- */
  const why = el('section');
  why.style.marginTop = 'var(--s-7)';
  const h2 = el('h2');
  h2.textContent = 'What this course believes';
  why.append(h2);

  const grid = el('div', 'principles');
  [
    ['Everyone is a mathematician',
     'Not everyone has been taught the notation, and plenty of people have been taught to feel ' +
     'stupid. Those are different problems, and only one of them is about mathematics.'],
    ['Numbers can tell the truth or lie',
     'Statistics is a language, and every language can be used to mislead. We teach the honest ' +
     'moves and the dishonest ones side by side, from the first unit, because you need both to read a claim.'],
    ['Mathematics is beautiful',
     'Not beautiful as a consolation prize for being useful. Beautiful the way a piece of music ' +
     'is: there are moments in here built to be looked at rather than used.'],
    ['You can do it',
     'Every idea arrives as something you move with your hands before it arrives as a symbol. ' +
     'If a screen makes you feel small, that screen is broken and we want to hear about it.'],
  ].forEach(([t, d]) => {
    const c = el('div', 'principle');
    c.append(el('h3', null, t), el('p', null, d));
    grid.append(c);
  });
  why.append(grid);
  wrap.append(why);

  /* ---------- where to go ---------- */
  const next = el('section', 'prose');
  next.style.marginTop = 'var(--s-7)';
  // Count lessons that actually loaded, not lessons we intend to have written.
  const live = READY.filter(u => lessonById(u.id)).length;
  next.append(el('h2', null, 'Where to start'));
  next.append(el('p', 'muted',
    `The course runs from noticing things to reading a regression table, in ${UNITS.length} units. ` +
    `${live === 1 ? 'One unit is' : live + ' units are'} ready to work through today; ` +
    'the rest are being built in the open, and the map says plainly which is which.'));
  const goMap = el('button', 'ec-btn', 'Open the map');
  goMap.addEventListener('click', () => go('map'));
  next.append(goMap);
  wrap.append(next);

  root.append(wrap);
  redraw();

  /* Redraw when the canvas changes size or the reader flips to dark mode. */
  const ro = new ResizeObserver(redraw);
  ro.observe(canvas);
  const scheme = window.matchMedia('(prefers-color-scheme: dark)');
  const onScheme = () => redraw();
  scheme.addEventListener('change', onScheme);
}
