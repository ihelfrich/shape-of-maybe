/* viz.js
   A thin drawing layer over one <canvas>: axes, dots, lines, curves, brackets, labels.
   Not a chart library. A lesson says what it wants in data coordinates, and the four
   course colours (truth, data, result, test) carry the same meaning in every figure. */

/* The palette. Four roles, two verdicts, two inks, one hairline.
   A reader who learns the four roles in unit one can read any figure without a legend. */
export const COLORS = {
  truth:  '#4C6EF5', // the population, the parameter, what is actually true
  data:   '#E8590C', // the sample, the observed, what we measured
  result: '#099268', // the conclusion, the estimate, the answer
  test:   '#7048E8', // the test statistic, the machinery of doubt
  wrong:  '#E03131',
  right:  '#2B8A3E',
  ink:    '#1F2024',
  ink2:   '#5F6270',
  grid:   '#E8E4DA',
};

/* Every role also exists as a CSS custom property in tokens.css. We prefer the live
   value at draw time, so a reader in dark mode gets the lifted version of the same
   meaning. The hex above is the fallback for before the stylesheet has arrived. */
const ROLE_VAR = {
  truth: '--truth', data: '--data', result: '--result', test: '--test',
  wrong: '--wrong', right: '--right', ink: '--ink', ink2: '--ink-2', grid: '--line',
};
const SURFACE_VAR = '--card'; // what labels sit on: used for halos and dot rings
const FONT_VAR = '--sans';

/* Passing COLORS.truth should behave exactly like passing 'truth', so we can look a
   hex back up and swap in the themed version of it. */
const ROLE_OF_HEX = new Map(Object.entries(COLORS).map(([k, v]) => [v.toLowerCase(), k]));

const cache = new Map();

function cssValue(name, fallback) {
  if (cache.has(name)) return cache.get(name);
  let v = '';
  try {
    v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  } catch {
    v = '';
  }
  const out = v || fallback;
  cache.set(name, out);
  return out;
}

/* One listener for the whole module: when the reader flips light/dark, forget the
   colours we looked up and read them again on the next frame. */
if (typeof window !== 'undefined' && window.matchMedia) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const forget = () => cache.clear();
  if (mq.addEventListener) mq.addEventListener('change', forget);
  else if (mq.addListener) mq.addListener(forget);
}

function roleColor(role) {
  return cssValue(ROLE_VAR[role] || ROLE_VAR.ink, COLORS[role] || COLORS.ink);
}

/** Turn a role name, a COLORS hex, or any CSS colour into something to paint with. */
export function paint(color, fallbackRole = 'ink') {
  if (color == null || color === '') return roleColor(fallbackRole);
  if (typeof color !== 'string') return String(color);
  if (Object.hasOwn(ROLE_VAR, color)) return roleColor(color);
  const hex = ROLE_OF_HEX.get(color.toLowerCase());
  if (hex) return roleColor(hex);
  return color;
}

function surface() { return cssValue(SURFACE_VAR, '#FFFFFF'); }
function uiFont() { return cssValue(FONT_VAR, 'system-ui, sans-serif'); }

/* ---- numbers ------------------------------------------------------------- */

/** Tick positions that land on round numbers: 1, 2, 2.5 or 5 times a power of ten. */
export function tickValues(lo, hi, count = 5) {
  if (Array.isArray(count)) return count.slice();
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) return [lo];
  const n = Math.max(2, Math.round(count) || 5);
  const raw = (hi - lo) / n;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm >= 5 ? 10 : norm >= 2.5 ? 5 : norm >= 1.2 ? 2 : 1) * mag;
  const first = Math.ceil(lo / step - 1e-9) * step;
  const out = [];
  for (let i = 0; i < 200; i++) {
    const v = first + i * step;
    if (v > hi + step * 1e-9) break;
    out.push(Math.abs(v) < step * 1e-9 ? 0 : v); // kill the -0 that floats out of this
  }
  return out;
}

/** How many decimals a tick of this size deserves. */
function decimalsFor(step) {
  if (!Number.isFinite(step) || step <= 0) return 2;
  return Math.min(6, Math.max(0, Math.ceil(-Math.log10(step) + 1e-9)));
}

/** A number as a person would write it: no trailing zeros, commas above 9999. */
export function fmtNum(v, step) {
  if (!Number.isFinite(v)) return '';
  const d = decimalsFor(step);
  let s = v.toFixed(d);
  if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
  if (s === '-0') s = '0';
  const n = Number(s);
  if (v !== 0 && n === 0) return v.toExponential(1); // too small to show at this scale
  if (Math.abs(n) > 9999) return n.toLocaleString('en-US', { maximumFractionDigits: d });
  return s;
}

/* ---- drawing helpers ----------------------------------------------------- */

/* A 1px line drawn on a whole pixel straddles two of them and comes out grey.
   Half-pixel offsets keep hairlines actually hairline. */
const crisp = (v) => Math.round(v) + 0.5;

function dashOf(dash) {
  if (!dash) return [];
  if (Array.isArray(dash)) return dash;
  return [dash, dash];
}

function ptX(p) { return Array.isArray(p) ? p[0] : NaN; }
function ptY(p) { return Array.isArray(p) ? p[1] : NaN; }

class Stage {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = 0;
    this.H = 0;
    this.x0 = 0; this.x1 = 1; this.y0 = 0; this.y1 = 1;
    this._p = { l: 12, r: 12, t: 12, b: 12 };
  }

  /* Size the backing store for this screen's pixel density and reset the transform,
     so one unit of drawing is one CSS pixel no matter what device we are on. */
  fit() {
    const c = this.canvas;
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // capped: a cheap phone has better uses for its GPU
    const w = Math.max(1, Math.round(c.clientWidth || 320));
    let h = Math.round(c.clientHeight);
    if (!(h > 0)) {
      // Without a CSS height a canvas reports its attribute height, which would come
      // out squashed on a retina screen. Give it one, once.
      h = Math.round(w * 0.56);
      c.style.height = h + 'px';
    }
    const bw = Math.round(w * dpr);
    const bh = Math.round(h * dpr);
    if (c.width !== bw || c.height !== bh) { c.width = bw; c.height = bh; }
    this.W = w;
    this.H = h;
    const g = this.ctx;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.lineJoin = 'round';
    g.lineCap = 'round';
    return this;
  }

  clear() {
    if (!this.W) this.fit();
    this.ctx.clearRect(0, 0, this.W, this.H);
    return this;
  }

  /** The data window this figure shows. Y grows upward, the way a reader expects. */
  domain(x0, x1, y0, y1) {
    if (x1 === x0) { x0 -= 0.5; x1 += 0.5; }
    if (y1 === y0) { y0 -= 0.5; y1 += 0.5; }
    this.x0 = x0; this.x1 = x1; this.y0 = y0; this.y1 = y1;
    return this;
  }

  /** Inner margins in pixels. Omitted sides copy the first one given. */
  pad(l = 12, r = l, t = l, b = t) {
    this._p = { l, r, t, b };
    return this;
  }

  /** The plotting rectangle in pixels: left, right, top, bottom. */
  box() {
    if (!this.W) this.fit();
    const p = this._p;
    return { L: p.l, R: this.W - p.r, T: p.t, B: this.H - p.b };
  }

  X(v) {
    const { L, R } = this.box();
    return L + ((v - this.x0) / (this.x1 - this.x0)) * (R - L);
  }

  Y(v) {
    const { T, B } = this.box();
    return B - ((v - this.y0) / (this.y1 - this.y0)) * (B - T);
  }

  /* ---- axes ---- */

  axisX(ticks = 5, fmt, opts = {}) {
    this._p.b = Math.max(this._p.b, 28); // room for the numbers underneath
    const { L, R, T, B } = this.box();
    const vals = tickValues(this.x0, this.x1, ticks);
    const step = vals.length > 1 ? vals[1] - vals[0] : 0;
    const g = this.ctx;
    g.save();
    g.setLineDash([]);
    g.lineWidth = 1;
    g.strokeStyle = paint('grid');
    g.beginPath();
    g.moveTo(L, crisp(B));
    g.lineTo(R, crisp(B));
    g.stroke();
    g.font = `500 11px ${uiFont()}`;
    g.textAlign = 'center';
    g.textBaseline = 'top';
    for (const v of vals) {
      const px = this.X(v);
      if (px < L - 0.5 || px > R + 0.5) continue;
      g.strokeStyle = paint('grid');
      g.beginPath();
      if (opts.grid) { g.moveTo(crisp(px), T); g.lineTo(crisp(px), B); }
      else { g.moveTo(crisp(px), B); g.lineTo(crisp(px), B + 5); }
      g.stroke();
      const text = fmt ? fmt(v) : fmtNum(v, step);
      const half = g.measureText(text).width / 2;
      const tx = Math.min(this.W - 3 - half, Math.max(3 + half, px));
      g.fillStyle = paint('ink2');
      g.fillText(text, tx, B + 7);
    }
    g.restore();
    return this;
  }

  axisY(ticks = 4, fmt, opts = {}) {
    const vals = tickValues(this.y0, this.y1, ticks);
    const step = vals.length > 1 ? vals[1] - vals[0] : 0;
    const g = this.ctx;
    g.save();
    g.font = `500 11px ${uiFont()}`;
    const texts = vals.map(v => (fmt ? fmt(v) : fmtNum(v, step)));
    // Grow the left gutter to whatever the widest label actually needs.
    const widest = texts.reduce((m, t) => Math.max(m, g.measureText(t).width), 0);
    this._p.l = Math.max(this._p.l, Math.ceil(widest) + 12);
    const { L, R, T, B } = this.box();
    g.setLineDash([]);
    g.lineWidth = 1;
    g.textAlign = 'right';
    g.textBaseline = 'middle';
    for (let i = 0; i < vals.length; i++) {
      const py = this.Y(vals[i]);
      if (py < T - 0.5 || py > B + 0.5) continue;
      g.strokeStyle = paint('grid');
      g.beginPath();
      if (opts.grid) { g.moveTo(L, crisp(py)); g.lineTo(R, crisp(py)); }
      else { g.moveTo(L - 5, crisp(py)); g.lineTo(L, crisp(py)); }
      g.stroke();
      g.fillStyle = paint('ink2');
      g.fillText(texts[i], L - 8, py);
    }
    g.restore();
    return this;
  }

  /* ---- marks ---- */

  /* Each dot gets a thin ring in the page colour, so a pile of overlapping dots still
     reads as a pile of dots rather than a blob. */
  dots(points, o = {}) {
    const g = this.ctx;
    const r = o.r == null ? 5 : o.r;
    const ring = o.ring === false || points.length > 4000 ? null : paint(o.ring || surface(), 'ink');
    g.save();
    g.globalAlpha = o.alpha == null ? 0.9 : o.alpha;
    g.fillStyle = paint(o.fill, 'data');
    g.lineWidth = Math.min(1.6, r * 0.35);
    if (ring) g.strokeStyle = ring;
    for (const p of points) {
      const x = this.X(ptX(p));
      const y = this.Y(ptY(p));
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
      if (ring) g.stroke();
    }
    g.restore();
    return this;
  }

  line(points, o = {}) {
    const g = this.ctx;
    g.save();
    g.globalAlpha = o.alpha == null ? 1 : o.alpha;
    g.strokeStyle = paint(o.color, 'ink');
    g.lineWidth = o.width == null ? 2.5 : o.width;
    g.setLineDash(dashOf(o.dash));
    g.beginPath();
    let started = false;
    for (const p of points) {
      const x = this.X(ptX(p));
      const y = this.Y(ptY(p));
      if (!Number.isFinite(x) || !Number.isFinite(y)) { started = false; continue; }
      if (started) g.lineTo(x, y);
      else { g.moveTo(x, y); started = true; }
    }
    g.stroke();
    g.restore();
    return this;
  }

  /** Draw y = fn(x) across the domain. Gaps where fn returns nothing finite. */
  curve(fn, o = {}) {
    const from = o.from == null ? this.x0 : o.from;
    const to = o.to == null ? this.x1 : o.to;
    const steps = Math.max(2, o.steps == null ? 160 : o.steps);
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const x = from + ((to - from) * i) / steps;
      pts.push([x, fn(x)]);
    }
    return this.line(pts, o);
  }

  /** Fill the region under a curve. This is how a probability becomes an area. */
  area(fn, o = {}) {
    const from = o.from == null ? this.x0 : o.from;
    const to = o.to == null ? this.x1 : o.to;
    const steps = Math.max(2, o.steps == null ? 160 : o.steps);
    const base = o.baseline == null
      ? Math.min(Math.max(0, Math.min(this.y0, this.y1)), Math.max(this.y0, this.y1))
      : o.baseline;
    const g = this.ctx;
    g.save();
    g.globalAlpha = o.alpha == null ? 0.18 : o.alpha;
    g.fillStyle = paint(o.color, 'test');
    g.beginPath();
    g.moveTo(this.X(from), this.Y(base));
    for (let i = 0; i <= steps; i++) {
      const x = from + ((to - from) * i) / steps;
      const y = fn(x);
      g.lineTo(this.X(x), this.Y(Number.isFinite(y) ? y : base));
    }
    g.lineTo(this.X(to), this.Y(base));
    g.closePath();
    g.fill();
    g.restore();
    return this;
  }

  /** bins: [{x0, x1, h}, ...] with h in data units. Heights measured from y = 0. */
  bars(bins, o = {}) {
    const g = this.ctx;
    const gap = o.gap == null ? 1 : o.gap;
    const base = this.Y(Math.min(Math.max(0, Math.min(this.y0, this.y1)), Math.max(this.y0, this.y1)));
    g.save();
    g.globalAlpha = o.alpha == null ? 0.85 : o.alpha;
    g.fillStyle = paint(o.color, 'data');
    for (const b of bins) {
      const xa = this.X(b.x0);
      const xb = this.X(b.x1);
      const top = this.Y(b.h);
      if (!Number.isFinite(xa) || !Number.isFinite(xb) || !Number.isFinite(top)) continue;
      const x = Math.min(xa, xb) + gap / 2;
      const w = Math.max(0.5, Math.abs(xb - xa) - gap);
      const y = Math.min(top, base);
      const h = Math.max(0, Math.abs(base - top));
      const r = Math.min(3, w / 3, h);
      if (g.roundRect && r > 0.5) {
        g.beginPath();
        g.roundRect(x, y, w, h, [r, r, 0, 0]);
        g.fill();
      } else {
        g.fillRect(x, y, w, h);
      }
    }
    g.restore();
    return this;
  }

  vline(x, o = {}) {
    const { T, B } = this.box();
    const px = this.X(x);
    const g = this.ctx;
    g.save();
    g.globalAlpha = o.alpha == null ? 1 : o.alpha;
    g.strokeStyle = paint(o.color, 'ink');
    g.lineWidth = o.width == null ? 2 : o.width;
    g.setLineDash(dashOf(o.dash));
    g.beginPath();
    g.moveTo(px, T);
    g.lineTo(px, B);
    g.stroke();
    g.restore();
    if (o.label) {
      const at = o.labelAt == null ? 0.04 : o.labelAt;
      this.note(o.label, px, T + (B - T) * at, {
        color: o.color, align: 'center', baseline: 'alphabetic', weight: 700, size: o.size,
      });
    }
    return this;
  }

  hline(y, o = {}) {
    const { L, R } = this.box();
    const py = this.Y(y);
    const g = this.ctx;
    g.save();
    g.globalAlpha = o.alpha == null ? 1 : o.alpha;
    g.strokeStyle = paint(o.color, 'ink');
    g.lineWidth = o.width == null ? 2 : o.width;
    g.setLineDash(dashOf(o.dash));
    g.beginPath();
    g.moveTo(L, py);
    g.lineTo(R, py);
    g.stroke();
    g.restore();
    if (o.label) {
      const at = o.labelAt == null ? 0.02 : o.labelAt;
      this.note(o.label, L + (R - L) * at, py - 6, {
        color: o.color, align: 'left', baseline: 'alphabetic', weight: 700, size: o.size,
      });
    }
    return this;
  }

  /* A measuring bracket: the caps point down at the two things being compared and the
     label sits above the bar. This is how a gap gets to be a quantity. */
  bracket(x0, x1, y, o = {}) {
    const a = this.X(x0);
    const b = this.X(x1);
    const yy = this.Y(y);
    const cap = o.cap == null ? 7 : o.cap;
    const g = this.ctx;
    g.save();
    g.strokeStyle = paint(o.color, 'ink2');
    g.lineWidth = o.width == null ? 1.5 : o.width;
    g.setLineDash(dashOf(o.dash));
    g.beginPath();
    g.moveTo(a, yy + cap);
    g.lineTo(a, yy);
    g.lineTo(b, yy);
    g.lineTo(b, yy + cap);
    g.stroke();
    g.restore();
    if (o.label) {
      this.note(o.label, (a + b) / 2, yy - 6, {
        color: o.color || 'ink2', align: 'center', baseline: 'alphabetic', weight: 700, size: o.size,
      });
    }
    return this;
  }

  /** Text placed in data coordinates. */
  label(text, x, y, o = {}) {
    return this.note(text, this.X(x), this.Y(y), o);
  }

  /* Text placed in pixel coordinates, with a halo of page colour behind it so it stays
     readable wherever it lands, and a nudge inward if it would fall off the edge. */
  note(text, px, py, o = {}) {
    const g = this.ctx;
    const str = String(text);
    g.save();
    g.font = `${o.weight || 600} ${o.size || 12}px ${uiFont()}`;
    g.textAlign = o.align || 'center';
    g.textBaseline = o.baseline || 'alphabetic';
    g.globalAlpha = o.alpha == null ? 1 : o.alpha;
    let x = px + (o.dx || 0);
    const y = py + (o.dy || 0);
    if (o.clamp !== false) {
      const w = g.measureText(str).width;
      const al = g.textAlign;
      const left = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x;
      x += Math.max(0, 3 - left) - Math.max(0, left + w - (this.W - 3));
    }
    if (o.halo !== false) {
      g.lineWidth = 3.5;
      g.lineJoin = 'round';
      g.strokeStyle = surface();
      g.strokeText(str, x, y);
    }
    g.fillStyle = paint(o.color, 'ink');
    g.fillText(str, x, y);
    g.restore();
    return this;
  }
}

/** Bind a drawing stage to one canvas. Call .fit() first on every frame. */
export function stage(canvas) {
  return new Stage(canvas);
}
