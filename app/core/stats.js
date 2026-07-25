/* stats.js
   Every number this course teaches, computed in one place so it can be checked in one
   place. Run tools/selftest.mjs to compare these against values from a printed table.
   Nothing here holds state; every function takes numbers and returns numbers. */

/* ---- summaries ------------------------------------------------------------
   Degenerate input returns NaN rather than throwing. A lesson that asks for the
   mean of nothing has a bug, and a NaN on screen is a louder bug report than a
   silent zero would be. */

/** How much there is altogether. */
export function sum(xs) {
  let s = 0;
  for (let i = 0; i < xs.length; i++) s += xs[i];
  return s;
}

/** The balance point: add everything up and share it out equally. */
export function mean(xs) {
  return xs.length ? sum(xs) / xs.length : NaN;
}

export function min(xs) { return xs.length ? Math.min(...xs) : NaN; }
export function max(xs) { return xs.length ? Math.max(...xs) : NaN; }

/** How far apart the smallest and largest sit. */
export function range(xs) { return xs.length ? max(xs) - min(xs) : NaN; }

/* The typical squared distance from the middle. We divide by n-1 rather than n
   because one degree of freedom was already spent working out the middle. */
export function variance(xs) {
  const n = xs.length;
  if (n < 2) return NaN;
  const m = mean(xs);
  let s = 0;
  for (let i = 0; i < n; i++) { const d = xs[i] - m; s += d * d; }
  return s / (n - 1);
}

/** How far a typical value sits from the middle, back in the original units. */
export function sd(xs) {
  const v = variance(xs);
  return Number.isNaN(v) ? NaN : Math.sqrt(v);
}

/* The value with as many below it as above. Linear interpolation between the two
   neighbours when the position lands between them (the definition R calls type 7). */
export function quantile(xs, p) {
  const n = xs.length;
  if (!n || !Number.isFinite(p)) return NaN;
  if (n === 1) return xs[0];
  const s = xs.slice().sort((a, b) => a - b);
  const pos = Math.min(1, Math.max(0, p)) * (n - 1);
  const lo = Math.floor(pos);
  const frac = pos - lo;
  if (lo + 1 >= n) return s[n - 1];
  return s[lo] + frac * (s[lo + 1] - s[lo]);
}

/** The middle value. Half the group sits below it. */
export function median(xs) { return quantile(xs, 0.5); }

/* ---- the normal curve -----------------------------------------------------
   normCdf uses Hart's rational approximation, which is good to roughly 1e-15 and
   is the same routine banks price options with. normInv uses Acklam's inverse,
   then one Halley step against normCdf, which takes it to machine precision. */

/** The height of the bell at x. */
export function normPdf(x, mu = 0, s = 1) {
  if (!(s > 0)) return NaN;
  const z = (x - mu) / s;
  return Math.exp(-0.5 * z * z) / (s * Math.sqrt(2 * Math.PI));
}

/** The share of the bell lying to the left of x. */
export function normCdf(x, mu = 0, s = 1) {
  if (!(s > 0)) return NaN;
  const z = (x - mu) / s;
  const a = Math.abs(z);
  let c;
  if (a > 37) {
    c = 0;
  } else {
    const e = Math.exp(-a * a / 2);
    if (a < 7.07106781186547) {
      let b = 3.52624965998911e-2 * a + 0.700383064443688;
      b = b * a + 6.37396220353165;
      b = b * a + 33.912866078383;
      b = b * a + 112.079291497871;
      b = b * a + 221.213596169931;
      b = b * a + 220.206867912376;
      let d = 8.83883476483184e-2 * a + 1.75566716318264;
      d = d * a + 16.064177579207;
      d = d * a + 86.7807322029461;
      d = d * a + 296.564248779674;
      d = d * a + 637.333633378831;
      d = d * a + 793.826512519948;
      d = d * a + 440.413735824752;
      c = e * b / d;
    } else {
      let b = a + 0.65;
      b = a + 4 / b;
      b = a + 3 / b;
      b = a + 2 / b;
      b = a + 1 / b;
      c = e / (b * 2.506628274631);
    }
  }
  return z > 0 ? 1 - c : c;
}

/** The x with that share of the bell to its left. The inverse of normCdf. */
export function normInv(p, mu = 0, s = 1) {
  if (!(p > 0) || !(p < 1) || !(s > 0)) {
    if (p === 0) return -Infinity;
    if (p === 1) return Infinity;
    return NaN;
  }
  // Acklam's rational approximation, accurate to about 1.15e-9 relative.
  const a = [-3.969683028665376e+1, 2.209460984245205e+2, -2.759285104469687e+2,
             1.383577518672690e+2, -3.066479806614716e+1, 2.506628277459239e+0];
  const b = [-5.447609879822406e+1, 1.615858368580409e+2, -1.556989798598866e+2,
             6.680131188771972e+1, -1.328068155288572e+1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838e+0,
             -2.549732539343734e+0, 4.374664141464968e+0, 2.938163982698783e+0];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996e+0,
             3.754408661907416e+0];
  const pLow = 0.02425, pHigh = 1 - pLow;
  let z;
  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    z = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    const q = p - 0.5, r = q * q;
    z = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
        (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    z = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
         ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  // One Halley step against the accurate CDF, which removes the last few digits of error.
  const e = normCdf(z) - p;
  const u = e * Math.sqrt(2 * Math.PI) * Math.exp(z * z / 2);
  z = z - u / (1 + z * u / 2);
  return mu + s * z;
}

/* ---- the pieces the t curve is built from --------------------------------- */

/** log of the gamma function (Lanczos). Used by the t density and the beta below. */
export function lgamma(x) {
  const g = [76.18009172947146, -86.50532032941677, 24.01409824083091,
             -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) { y += 1; ser += g[j] / y; }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

/* Continued fraction for the incomplete beta, from the modified Lentz method.
   It converges fast on the side we call it from, and bails rather than spinning. */
function betacf(a, b, x) {
  const MAXIT = 300, EPS = 3e-14, FPMIN = 1e-300;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1;
  let d = 1 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/** The regularised incomplete beta. The t distribution is written in terms of it. */
export function ibeta(a, b, x) {
  if (!(x > 0)) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) +
                      a * Math.log(x) + b * Math.log(1 - x));
  // Use whichever side of the fraction converges quickly, then flip if needed.
  if (x < (a + 1) / (a + b + 2)) return bt * betacf(a, b, x) / a;
  return 1 - bt * betacf(b, a, 1 - x) / b;
}

/* ---- the t curve ----------------------------------------------------------
   Wider in the tails than the normal, because using the sample's own spread in
   place of the true one costs a little honesty. The cost shrinks as df grows. */

/** The height of the t curve at t. */
export function tPdf(t, df) {
  if (!(df > 0)) return NaN;
  return Math.exp(lgamma((df + 1) / 2) - lgamma(df / 2)) /
         Math.sqrt(df * Math.PI) * Math.pow(1 + t * t / df, -(df + 1) / 2);
}

/** The share of the t curve lying to the right of t. */
export function tTail(t, df) {
  if (!(df > 0) || !Number.isFinite(t)) return NaN;
  const half = 0.5 * ibeta(df / 2, 0.5, df / (df + t * t));
  return t >= 0 ? half : 1 - half;
}

/** The share of the t curve lying to the left of t. */
export function tCdf(t, df) { return 1 - tTail(t, df); }

/* The t with exactly tailP of the curve beyond it. Table C in one function.
   Found by bisection because tTail is monotone, which makes this dull and reliable. */
export function tCrit(tailP, df) {
  if (!(df > 0) || !(tailP > 0) || !(tailP < 1)) return NaN;
  if (tailP === 0.5) return 0;
  let lo = 0, hi = 1;
  while (tTail(hi, df) > tailP && hi < 1e6) hi *= 2;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (tTail(mid, df) > tailP) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/* ---- two things at once ---------------------------------------------------- */

/* How tightly two columns move together, on a scale from -1 to 1. Returns null
   when one column never varies, because "moves together" has no meaning then. */
export function corr(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return null;
  const mx = mean(xs.slice(0, n)), my = mean(ys.slice(0, n));
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my;
    sxy += dx * dy; sxx += dx * dx; syy += dy * dy;
  }
  if (sxx <= 0 || syy <= 0) return null;
  return sxy / Math.sqrt(sxx * syy);
}

/* The line with the smallest total squared miss, plus how much the slope itself
   would wobble if the study were run again. b1 is null for a vertical cloud. */
export function ols(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return null;
  const mx = mean(xs.slice(0, n)), my = mean(ys.slice(0, n));
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my;
    sxy += dx * dy; sxx += dx * dx; syy += dy * dy;
  }
  if (sxx <= 0) {
    return { b0: null, b1: null, sse: null, sst: syy, r2: null, seB1: null, tB1: null, n };
  }
  const b1 = sxy / sxx;
  const b0 = my - b1 * mx;
  let sse = 0;
  for (let i = 0; i < n; i++) { const r = ys[i] - (b0 + b1 * xs[i]); sse += r * r; }
  const r2 = syy > 0 ? 1 - sse / syy : null;
  const seB1 = n > 2 ? Math.sqrt((sse / (n - 2)) / sxx) : null;
  const tB1 = seB1 && seB1 > 0 ? b1 / seB1 : null;
  return { b0, b1, sse, sst: syy, r2, seB1, tB1, n };
}

/* ---- the two workhorses ---------------------------------------------------- */

/* The honest range around a sample mean: the estimate, plus and minus a stretched
   wobble. tStar is the stretch, read off the t curve for this sample size. */
export function meanCI(xs, conf = 0.95) {
  const n = xs.length;
  if (n < 2) return null;
  const m = mean(xs);
  const s = sd(xs);
  const df = n - 1;
  const se = s / Math.sqrt(n);
  const tStar = tCrit((1 - conf) / 2, df);
  const me = tStar * se;
  return { mean: m, se, me, lo: m - me, hi: m + me, df, tStar, n, conf };
}

/* Two groups, one question: is the gap bigger than the wobble of the gap?
   Each group brings its own wobble and they add in quadrature, like the sides of a
   right triangle. Welch's version, which does not pretend the two spreads match. */
export function twoGroup(a, b) {
  const na = a.length, nb = b.length;
  if (na < 2 || nb < 2) return null;
  const ma = mean(a), mb = mean(b);
  const va = variance(a), vb = variance(b);
  const ea = va / na, eb = vb / nb;
  const se = Math.sqrt(ea + eb);
  const gap = ma - mb;
  if (!(se > 0)) return { gap, se: 0, t: null, df: null, p: null, meanA: ma, meanB: mb };
  const t = gap / se;
  // Welch-Satterthwaite: the effective degrees of freedom when spreads differ.
  const df = (ea + eb) * (ea + eb) /
             ((ea * ea) / (na - 1) + (eb * eb) / (nb - 1));
  const p = 2 * tTail(Math.abs(t), df);
  return { gap, se, t, df, p, meanA: ma, meanB: mb, nA: na, nB: nb };
}

/* ---- self-check ------------------------------------------------------------
   Values you can look up in a printed table. tools/selftest.mjs checks these
   mechanically; they are repeated here so a reader of this file can spot-check it.

     mean([2,4,4,4,5,5,7,9])        = 5
     sd([2,4,4,4,5,5,7,9])          = 2.138090
     quantile([...], 0.25)          = 4
     normCdf(1.96)                  = 0.9750021
     normCdf(1) - normCdf(-1)       = 0.6826895   (the 68% rule)
     normInv(0.975)                 = 1.9599640
     tCrit(0.025, 19)               = 2.093       (Table C, 95%, df 19)
     tCrit(0.025, 11)               = 2.201       (Table C, 95%, df 11)
     ols([1,2,3,4,5],[2,4,5,4,5])   -> b1 = 0.6, b0 = 2.2, sse = 2.4, r2 = 0.6
------------------------------------------------------------------------------ */
