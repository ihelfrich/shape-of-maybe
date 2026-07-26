/* app/core/viz.js
   A thin honest layer over one canvas. Not a chart library: there are no chart
   types here, only marks (dots, lines, curves, bars, brackets, labels) placed in
   data coordinates. A lesson says where things go in its own units, and viz
   turns that into pixels, on any screen, at any pixel density. */

// The palette carries meaning, and the meaning is the same in every lesson:
// truth = the population or parameter we can never see directly,
// data = the sample we actually got, result = the conclusion we drew,
// test = a test statistic, wrong / right = an answer being marked,
// ink / ink2 = text, grid = hairlines.
// Frozen because a lesson that quietly repainted the palette would break the
// color code for every other lesson on the page.
export const COLORS = Object.freeze({
  truth: '#4C6EF5', data: '#E8590C', result: '#099268', test: '#7048E8',
  wrong: '#E03131', right: '#2B8A3E', ink: '#1F2024', ink2: '#5F6270', grid: '#E8E4DA'
});

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';
const TAU = Math.PI * 2;

// The custom property each role reads from. These are the names tokens.css actually
// publishes, which is what makes a figure follow the reader into dark mode.
const ROLE_VAR = Object.freeze({
  truth: '--truth', data: '--data', result: '--result', test: '--test',
  wrong: '--wrong', right: '--right', ink: '--ink', ink2: '--ink-2', grid: '--line'
});

// Reverse lookup, so a lesson that passes COLORS.truth as a literal hex still gets
// the themed version of that role. Role names map to themselves, because a lesson is
// meant to be able to ask for 'data' by name and that is the friendlier way to write it.
const ROLE_OF = {};
for (const role of Object.keys(COLORS)) {
  ROLE_OF[COLORS[role].toLowerCase()] = role;
  ROLE_OF[role] = role;
}

// Bumped when the OS color scheme flips, so every stage re-reads its palette on
// the next fit() instead of waiting out its cache.
let themeEpoch = 0;
const schemeQuery = typeof matchMedia === 'function'
  ? matchMedia('(prefers-color-scheme: dark)')
  : null;
if (schemeQuery) {
  const bump = () => { themeEpoch++; };
  if (typeof schemeQuery.addEventListener === 'function') schemeQuery.addEventListener('change', bump);
  else if (typeof schemeQuery.addListener === 'function') schemeQuery.addListener(bump);
}

function num(v, fallback) { return Number.isFinite(v) ? v : fallback; }

// How many decimals does a step of this size need? 0.25 needs two, 5 needs none.
function decimalsFor(step) {
  if (!Number.isFinite(step) || step <= 0) return 0;
  let d = 0;
  let s = Math.abs(step);
  while (d < 6 && Math.abs(Math.round(s) - s) > 1e-9) { s *= 10; d++; }
  return d;
}

/* Plain-words number formatting for tick labels: no trailing zeros, thousands
   separators once the numbers get long, exponents only when there is no room
   for anything else. step is the gap between ticks and decides the precision. */
export function fmtNum(v, step) {
  if (!Number.isFinite(v)) return '';
  if (v === 0) return '0';
  const a = Math.abs(v);
  // Past ten million a grouped label is wider than a phone axis can hold.
  if (a >= 1e7 || a < 1e-4) return v.toExponential(1).replace('e+', 'e');
  const d = decimalsFor(Math.abs(step));
  if (a >= 10000) {
    return v.toLocaleString(undefined, {
      minimumFractionDigits: 0, maximumFractionDigits: Math.min(d, 2)
    });
  }
  let s = v.toFixed(Math.min(6, d));
  if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s === '-0' ? '0' : s;
}

/* Tick positions a human would have chosen: steps of 1, 2, 5 or 10 times a power
   of ten, so labels read 0, 0.5, 1 and never 0.333, 0.667. Takes the two ends in
   either order and always returns them ascending. */
export function niceTicks(lo, hi, count = 5) {
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return [];
  const a = Math.min(lo, hi);
  const b = Math.max(lo, hi);
  if (a === b) return [a];
  const want = Math.max(1, Math.round(num(count, 5)));
  const raw = (b - a) / want;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  // A range small enough to underflow the power of ten gets its two ends and
  // nothing in between, which is honest and never loops forever.
  if (!Number.isFinite(mag) || mag <= 0) return [a, b];
  const norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  if (!Number.isFinite(step) || step <= 0) return [a, b];
  const first = Math.ceil(a / step - 1e-9);
  if (!Number.isFinite(first)) return [a, b];
  const out = [];
  for (let i = 0; i < 512; i++) {
    const v = (first + i) * step;
    if (v > b + step * 1e-9) break;
    // toPrecision clears the floating-point dust: 0.6000000000000001 -> 0.6
    const r = Number(v.toPrecision(12));
    out.push(Math.abs(r) < step * 1e-9 ? 0 : r);
    if (out.length >= 200) break;
  }
  return out;
}

/* stage(canvas) — everything below draws into one canvas.
   A typical frame:  st.fit().clear().domain(0, 10, 0, 1); st.axisX(5).axisY(4);
   Axes claim the padding they need (left 40, bottom 28) unless the lesson calls
   .pad() itself, so draw the axes before the marks or call .pad() after .fit().*/
export function stage(canvas) {
  const ctx = canvas && typeof canvas.getContext === 'function' ? canvas.getContext('2d') : null;
  if (!ctx) throw new Error('viz.stage needs a <canvas> with a 2d context');

  let W = 1, H = 1;                 // logical (CSS) pixels
  let x0 = 0, x1 = 1, y0 = 0, y1 = 1;
  let padL = 12, padR = 12, padT = 12, padB = 12;
  let padAuto = true;               // until the lesson sets padding itself
  let theme = COLORS;
  let paper = '#FFFFFF';
  let themeAt = -1e9;
  let themeSeen = -1;

  // The page may recolour the palette for dark mode by defining --viz-truth,
  // --viz-ink and friends, plus --paper for the color behind text haloes and
  // dot rings. Reading computed style costs a style recalculation, so we cache.
  function readTheme(force) {
    const t = Date.now();
    if (!force && themeSeen === themeEpoch && t - themeAt < 500) return;
    themeAt = t;
    themeSeen = themeEpoch;
    let cs = null;
    try { cs = getComputedStyle(canvas); } catch (e) { cs = null; }
    if (!cs) return;
    const read = (prop) => {
      const v = cs.getPropertyValue(prop);
      return typeof v === 'string' ? v.trim() : '';
    };
    const next = {};
    let any = false;
    for (const role of Object.keys(COLORS)) {
      // Prefer a figure-specific override, then the site token, then the built-in hex.
      const v = read('--viz-' + role) || read(ROLE_VAR[role]);
      next[role] = v || COLORS[role];
      if (v) any = true;
    }
    theme = any ? next : COLORS;
    paper = read('--paper') || cs.backgroundColor || '#FFFFFF';
    if (!paper || paper === 'transparent' || /rgba\(0,\s*0,\s*0,\s*0\)/.test(paper)) paper = '#FFFFFF';
  }

  // Resolve a color the caller gave us, falling back to the role's palette entry.
  function paint(c, role) {
    if (typeof c === 'string' && c) {
      const mapped = ROLE_OF[c.toLowerCase()];
      return mapped ? theme[mapped] : c;
    }
    return theme[role] || COLORS[role] || theme.ink;
  }

  const plotW = () => Math.max(1, W - padL - padR);
  const plotH = () => Math.max(1, H - padT - padB);
  const snap = (p) => Math.round(p) + 0.5;   // crisp 1px hairlines
  const clampX = (p) => Math.min(W - padR, Math.max(padL, p));

  function X(v) {
    if (x1 === x0) return padL + plotW() / 2;
    return padL + ((v - x0) / (x1 - x0)) * plotW();
  }
  function Y(v) {
    if (y1 === y0) return padT + plotH() / 2;
    return H - padB - ((v - y0) / (y1 - y0)) * plotH();
  }

  function clipPlot() {
    ctx.beginPath();
    ctx.rect(padL - 0.5, padT - 0.5, plotW() + 1, plotH() + 1);
    ctx.clip();
  }

  function setDash(d) { ctx.setLineDash(Array.isArray(d) ? d : (d ? [5, 4] : [])); }

  function drawText(text, px, py, o) {
    if (!Number.isFinite(px) || !Number.isFinite(py)) return;
    const opt = o || {};
    ctx.save();
    ctx.font = `${opt.weight || 500} ${num(opt.size, 12.5)}px ${FONT}`;
    ctx.textAlign = opt.align || 'center';
    ctx.textBaseline = opt.baseline || 'bottom';
    if (opt.halo !== false) {
      // A ring of background color, so a label can sit on top of a dense cloud
      // of dots and still be read.
      ctx.lineWidth = 3.5;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = paper;
      ctx.strokeText(text, px, py);
    }
    ctx.fillStyle = paint(opt.color, 'ink');
    ctx.fillText(text, px, py);
    ctx.restore();
  }

  function tickList(ticks, lo, hi) {
    if (Array.isArray(ticks)) return ticks.filter((v) => Number.isFinite(v));
    return niceTicks(lo, hi, num(ticks, 5));
  }

  const S = {
    W: 1,
    H: 1,
    ctx,          // escape hatch for a lesson that needs one custom mark
    X, Y,
    get pads() { return { l: padL, r: padR, t: padT, b: padB }; },

    /* Size the backing store for this screen's pixel density and reset the
       transform, so everything below can be written in ordinary CSS pixels.
       Call it first, every frame: the reader may have rotated the phone. */
    fit() {
      const rawDpr = typeof devicePixelRatio === 'number' ? devicePixelRatio : 1;
      const dpr = Math.max(1, Math.min(3, Number.isFinite(rawDpr) && rawDpr > 0 ? rawDpr : 1));
      // A hidden canvas reports zero size. Falling back to the backing store
      // keeps the last good geometry instead of collapsing to a 1px stripe and
      // dividing the whole plot by nothing.
      const w = Math.max(1, canvas.clientWidth || Math.round(canvas.width / dpr) || 300);
      const h = Math.max(1, canvas.clientHeight || Math.round(canvas.height / dpr) || 180);
      const bw = Math.round(w * dpr);
      const bh = Math.round(h * dpr);
      // Only resize when it actually changed; assigning width clears the canvas.
      const resized = canvas.width !== bw || canvas.height !== bh;
      if (resized) { canvas.width = bw; canvas.height = bh; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      S.W = W = w;
      S.H = H = h;
      readTheme(resized);
      return S;
    },

    clear() {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      return S;
    },

    /* The window onto the data: which x and y values the plot area covers.
       Either axis may run backwards; a zero-width range is nudged open so
       nothing downstream divides by zero. */
    domain(ax0, ax1, ay0, ay1) {
      if (Number.isFinite(ax0) && Number.isFinite(ax1)) {
        x0 = ax0; x1 = ax1;
        if (x0 === x1) { x0 -= 0.5; x1 += 0.5; }
      }
      if (Number.isFinite(ay0) && Number.isFinite(ay1)) {
        y0 = ay0; y1 = ay1;
        if (y0 === y1) { y0 -= 0.5; y1 += 0.5; }
      }
      return S;
    },

    /* Inner margins in pixels. Call with one number for all four sides.
       If you never call it, the axes claim the room they need. */
    pad(l, r, t, b) {
      if (Number.isFinite(l) && r === undefined) { padL = padR = padT = padB = l; }
      else {
        if (Number.isFinite(l)) padL = l;
        if (Number.isFinite(r)) padR = r;
        if (Number.isFinite(t)) padT = t;
        if (Number.isFinite(b)) padB = b;
      }
      padAuto = false;
      return S;
    },

    /* Bottom axis: a hairline, small ticks, and labels that skip themselves
       rather than collide. ticks is a count (default 5) or an array of x values. */
    axisX(ticks, fmtFn) {
      if (padAuto) { padB = Math.max(padB, 28); padT = Math.max(padT, 16); padR = Math.max(padR, 16); }
      const vals = tickList(ticks, x0, x1);
      const step = vals.length > 1 ? vals[1] - vals[0] : (x1 - x0);
      const f = typeof fmtFn === 'function' ? fmtFn : (v) => fmtNum(v, step);
      const base = snap(H - padB);

      ctx.save();
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.strokeStyle = theme.grid;
      ctx.beginPath();
      ctx.moveTo(padL, base);
      ctx.lineTo(W - padR, base);
      ctx.stroke();

      ctx.font = `500 11.5px ${FONT}`;
      ctx.fillStyle = theme.ink2;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'center';
      let lastRight = -Infinity;
      for (const v of vals) {
        const px = X(v);
        if (!Number.isFinite(px) || px < padL - 0.5 || px > W - padR + 0.5) continue;
        ctx.beginPath();
        ctx.moveTo(snap(px), base);
        ctx.lineTo(snap(px), base + 4);
        ctx.stroke();
        const t = String(f(v));
        if (!t) continue;
        const w = ctx.measureText(t).width;
        let cx = px;
        if (cx - w / 2 < 2) cx = 2 + w / 2;                 // keep the first label on screen
        if (cx + w / 2 > W - 2) cx = W - 2 - w / 2;         // and the last one
        if (cx - w / 2 < lastRight + 8) continue;           // it would touch the previous label
        ctx.fillText(t, cx, base + 8);
        lastRight = cx + w / 2;
      }
      ctx.restore();
      return S;
    },

    /* Left axis: horizontal hairlines across the plot, labels outside it.
       A zero line, when zero is in view, is drawn slightly stronger. */
    axisY(ticks, fmtFn) {
      if (padAuto) { padL = Math.max(padL, 40); padT = Math.max(padT, 16); padR = Math.max(padR, 16); }
      const vals = tickList(ticks, y0, y1);
      const step = vals.length > 1 ? vals[1] - vals[0] : (y1 - y0);
      const f = typeof fmtFn === 'function' ? fmtFn : (v) => fmtNum(v, step);
      const yLo = Math.min(y0, y1);
      const yHi = Math.max(y0, y1);

      ctx.save();
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.font = `500 11.5px ${FONT}`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      let lastLabelY = null;
      for (const v of vals) {
        const py = Y(v);
        if (!Number.isFinite(py) || py < padT - 0.5 || py > H - padB + 0.5) continue;
        const isZero = v === 0 && yLo < 0 && yHi > 0;
        ctx.strokeStyle = isZero ? theme.ink2 : theme.grid;
        ctx.globalAlpha = isZero ? 0.35 : 1;
        ctx.beginPath();
        ctx.moveTo(padL, snap(py));
        ctx.lineTo(W - padR, snap(py));
        ctx.stroke();
        ctx.globalAlpha = 1;
        // Absolute distance, so the check still works when the axis runs the
        // other way (y1 below y0).
        if (lastLabelY !== null && Math.abs(py - lastLabelY) < 14) continue;
        const t = String(f(v));
        if (!t) continue;
        ctx.fillStyle = theme.ink2;
        ctx.fillText(t, padL - 8, py);
        lastLabelY = py;
      }
      ctx.restore();
      return S;
    },

    /* Points. Each dot gets a hairline ring in the background color, which is
       what keeps a pile of overlapping dots readable as a pile. */
    dots(points, opts) {
      const o = opts || {};
      const r = Math.max(0.5, num(o.r, 3.4));
      ctx.save();
      clipPlot();
      ctx.globalAlpha = num(o.alpha, 0.9);
      ctx.fillStyle = paint(o.fill, 'data');
      ctx.strokeStyle = paper;
      ctx.lineWidth = Math.min(1.5, r * 0.45);
      for (const p of (points || [])) {
        if (!p || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) continue;
        const px = X(p[0]);
        const py = Y(p[1]);
        if (!Number.isFinite(px) || !Number.isFinite(py)) continue;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, TAU);
        ctx.fill();
        if (r >= 2.5) ctx.stroke();
      }
      ctx.restore();
      return S;
    },

    /* A path through given points. Gaps (non-finite values) break the line
       rather than jumping across, because a jump would be a lie. */
    line(points, opts) {
      const o = opts || {};
      ctx.save();
      clipPlot();
      ctx.globalAlpha = num(o.alpha, 1);
      ctx.strokeStyle = paint(o.color, 'ink');
      ctx.lineWidth = num(o.width, 2);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      setDash(o.dash);
      ctx.beginPath();
      let drawing = false;
      for (const p of (points || [])) {
        if (!p || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) { drawing = false; continue; }
        const px = X(p[0]);
        const py = Y(p[1]);
        if (!Number.isFinite(px) || !Number.isFinite(py)) { drawing = false; continue; }
        if (drawing) ctx.lineTo(px, py);
        else { ctx.moveTo(px, py); drawing = true; }
      }
      if (drawing) ctx.stroke();
      ctx.restore();
      return S;
    },

    /* A function drawn as a curve: fn takes an x in data units, returns a y.
       Wherever fn returns something that is not a number the curve breaks. */
    curve(fn, opts) {
      if (typeof fn !== 'function') return S;
      const o = opts || {};
      const from = num(o.from, x0);
      const to = num(o.to, x1);
      const steps = Math.max(2, Math.round(num(o.steps, Math.min(600, Math.max(24, plotW())))));
      ctx.save();
      clipPlot();
      ctx.globalAlpha = num(o.alpha, 1);
      ctx.strokeStyle = paint(o.color, 'truth');
      ctx.lineWidth = num(o.width, 2.5);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      setDash(o.dash);
      ctx.beginPath();
      let drawing = false;
      for (let i = 0; i <= steps; i++) {
        const xv = from + ((to - from) * i) / steps;
        const yv = fn(xv);
        if (!Number.isFinite(yv)) { drawing = false; continue; }
        const px = X(xv);
        const py = Y(yv);
        if (!Number.isFinite(px) || !Number.isFinite(py)) { drawing = false; continue; }
        if (drawing) ctx.lineTo(px, py);
        else { ctx.moveTo(px, py); drawing = true; }
      }
      if (drawing) ctx.stroke();
      ctx.restore();
      return S;
    },

    /* The region under a curve between two x values: how probability gets shown.
       The floor is y = 0 when zero is in view, otherwise the nearer edge. */
    area(fn, opts) {
      if (typeof fn !== 'function') return S;
      const o = opts || {};
      const from = num(o.from, x0);
      const to = num(o.to, x1);
      const steps = Math.max(2, Math.round(num(o.steps, Math.min(600, Math.max(24, plotW())))));
      const lo = Math.min(y0, y1);
      const hi = Math.max(y0, y1);
      const baseY = Y(Math.min(hi, Math.max(lo, 0)));
      ctx.save();
      clipPlot();
      ctx.globalAlpha = num(o.alpha, 0.18);
      ctx.fillStyle = paint(o.color, 'truth');
      ctx.beginPath();
      ctx.moveTo(X(from), baseY);
      for (let i = 0; i <= steps; i++) {
        const xv = from + ((to - from) * i) / steps;
        const yv = fn(xv);
        const py = Number.isFinite(yv) ? Y(yv) : baseY;
        ctx.lineTo(X(xv), Number.isFinite(py) ? py : baseY);
      }
      ctx.lineTo(X(to), baseY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return S;
    },

    /* Histogram bars. bins are [{x0, x1, h}] in data units: the drawing knows
       nothing about counting, which is the lesson's job. */
    bars(bins, opts) {
      const o = opts || {};
      const wantGap = Math.max(0, num(o.gap, 1));
      const lo = Math.min(y0, y1);
      const hi = Math.max(y0, y1);
      const baseY = Y(Math.min(hi, Math.max(lo, 0)));
      ctx.save();
      clipPlot();
      ctx.globalAlpha = num(o.alpha, 0.85);
      ctx.fillStyle = paint(o.color, 'data');
      for (const b of (bins || [])) {
        if (!b || !Number.isFinite(b.x0) || !Number.isFinite(b.x1) || !Number.isFinite(b.h)) continue;
        const pa = X(b.x0);
        const pb = X(b.x1);
        if (!Number.isFinite(pa) || !Number.isFinite(pb)) continue;
        const full = Math.abs(pb - pa);
        if (!(full > 0)) continue;
        // With two hundred thin bins a fixed gap would eat the bars entirely,
        // so the gap shrinks with the bar and never takes more than a quarter.
        const gap = Math.min(wantGap, full * 0.25);
        const w = Math.max(0.75, full - gap);
        const left = Math.min(pa, pb) + gap / 2;
        const topY = Y(b.h);
        if (!Number.isFinite(topY)) continue;
        let h = Math.abs(baseY - topY);
        if (h === 0) continue;              // an empty bin draws nothing
        if (h < 1) h = 1;                   // one rare count still earns a hairline
        const up = topY <= baseY;
        const y = up ? baseY - h : baseY;
        const r = Math.max(0, Math.min(3, w / 3, h / 2));
        ctx.beginPath();
        if (r > 0.5 && typeof ctx.roundRect === 'function') {
          ctx.roundRect(left, y, w, h, up ? [r, r, 0, 0] : [0, 0, r, r]);
        } else {
          ctx.rect(left, y, w, h);
        }
        ctx.fill();
      }
      ctx.restore();
      return S;
    },

    /* A vertical marker: where the true value is, where our estimate landed.
       opts {color, width, dash, label, labelAt} — labelAt is a y in data units. */
    vline(x, opts) {
      const o = opts || {};
      const px = X(x);
      if (!Number.isFinite(px) || px < padL - 0.5 || px > W - padR + 0.5) return S;
      ctx.save();
      ctx.strokeStyle = paint(o.color, 'ink2');
      ctx.lineWidth = num(o.width, 1.5);
      setDash(o.dash === undefined ? [5, 4] : o.dash);
      ctx.beginPath();
      ctx.moveTo(snap(px), padT);
      ctx.lineTo(snap(px), H - padB);
      ctx.stroke();
      ctx.restore();
      if (o.label) {
        const py = Number.isFinite(o.labelAt) ? Y(o.labelAt) : padT + 12;
        // Near the right edge the label would run off, so it flips to the left.
        const near = px > W - padR - 40;
        drawText(String(o.label), near ? px - 6 : px + 6, py, {
          color: o.color, align: near ? 'right' : 'left', baseline: 'middle', size: 12, weight: 600
        });
      }
      return S;
    },

    /* A horizontal marker. Same idea, other direction. */
    hline(y, opts) {
      const o = opts || {};
      const py = Y(y);
      if (!Number.isFinite(py) || py < padT - 0.5 || py > H - padB + 0.5) return S;
      ctx.save();
      ctx.strokeStyle = paint(o.color, 'ink2');
      ctx.lineWidth = num(o.width, 1.5);
      setDash(o.dash === undefined ? [5, 4] : o.dash);
      ctx.beginPath();
      ctx.moveTo(padL, snap(py));
      ctx.lineTo(W - padR, snap(py));
      ctx.stroke();
      ctx.restore();
      if (o.label) {
        const px = Number.isFinite(o.labelAt) ? X(o.labelAt) : W - padR - 4;
        drawText(String(o.label), px, py - 5, {
          color: o.color, align: 'right', baseline: 'bottom', size: 12, weight: 600
        });
      }
      return S;
    },

    /* A measuring bracket: this much, from here to here. Margins of error, gaps
       between two groups, any distance that needs a name.
       opts {color, label, cap, down} */
    bracket(a, b, y, opts) {
      const o = opts || {};
      const py = Y(y);
      const rawA = X(a);
      const rawB = X(b);
      if (!Number.isFinite(py) || !Number.isFinite(rawA) || !Number.isFinite(rawB)) return S;
      // Kept inside the plot so a bracket never scribbles across the axis labels.
      const pa = snap(clampX(rawA));
      const pb = snap(clampX(rawB));
      const line = snap(py);
      const cap = num(o.cap, 5) * (o.down ? 1 : -1);
      ctx.save();
      ctx.strokeStyle = paint(o.color, 'ink2');
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'butt';
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(pa, line);
      ctx.lineTo(pb, line);
      ctx.moveTo(pa, line);
      ctx.lineTo(pa, line + cap);
      ctx.moveTo(pb, line);
      ctx.lineTo(pb, line + cap);
      ctx.stroke();
      ctx.restore();
      if (o.label) {
        drawText(String(o.label), (pa + pb) / 2, o.down ? line + 8 : line - 8, {
          color: o.color, align: 'center', baseline: o.down ? 'top' : 'bottom', size: 12, weight: 600
        });
      }
      return S;
    },

    /* Text placed in data coordinates: it follows the thing it names. Sits just
       above the point unless you nudge it with dx / dy pixels. */
    label(text, x, y, opts) {
      const o = opts || {};
      drawText(String(text), X(x) + num(o.dx, 0), Y(y) + num(o.dy, 0), o);
      return S;
    },

    /* Text placed in pixel coordinates, for legends and corner notes.
       opts {swatch} draws a color dot first, which is how a legend earns its keep. */
    note(text, px, py, opts) {
      const o = opts || {};
      let x = px;
      if (o.swatch && Number.isFinite(px) && Number.isFinite(py)) {
        ctx.save();
        ctx.fillStyle = paint(o.swatch, 'ink');
        ctx.beginPath();
        ctx.arc(x + 4, py + 6, 4, 0, TAU);
        ctx.fill();
        ctx.restore();
        x += 14;
      }
      drawText(String(text), x, py, {
        color: o.color, align: o.align || 'left', baseline: o.baseline || 'top',
        size: num(o.size, 12), weight: o.weight || 500, halo: o.halo
      });
      return S;
    }
  };

  // One sizing pass now, so .W, .H, .X and .Y are usable before the first frame.
  S.fit();
  return S;
}
