// stats.js: the arithmetic behind every claim this site makes.
// Pure functions. Hand them numbers, get numbers back, nothing is remembered between calls.
// Each one carries a plain-words line saying what it actually measures, because a formula you
// cannot say out loud is a formula you cannot check.

// ---------------------------------------------------------------------------
// House rules for awkward input
//
// Nothing in this file throws. A lesson mid-animation will hand us an empty array or a single
// point, and a chart that draws nothing is better than a page that dies.
//   * No data, or not enough data, gives NaN. There is no middle of nothing.
//   * A quantity that would come out as Infinity (dividing by a spread of zero) comes back as
//     null instead, so a caller can write `if (fit.b1 === null)` and say something kind.
//   * We never quietly drop a bad value. A NaN in the data shows up as a NaN in the answer,
//     which is the honest outcome.
// ---------------------------------------------------------------------------

const SQRT2 = Math.SQRT2;
const SQRT2PI = Math.sqrt(2 * Math.PI);
const SQRTPI = Math.sqrt(Math.PI);
const LN_SQRT2PI = 0.5 * Math.log(2 * Math.PI);

// Two constants the iterative methods below share.
// FPMIN stands in for zero when a denominator collapses, so a continued fraction limps on
// instead of returning Infinity. EPS is how close to 1 a correction factor has to land before
// we call the iteration finished; it sits just above what a double can tell apart.
const FPMIN = 1e-300;
const EPS = 3e-16;

function len(arr) {
  return arr && typeof arr.length === 'number' ? arr.length : 0;
}

function isNum(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

// ===========================================================================
// Describing a batch of numbers
// ===========================================================================

/** Add them all up. Nothing added up is 0, which is why this one is not NaN when empty. */
export function sum(arr) {
  // Neumaier summation: keep a side account of the digits that fall off the end of each
  // addition and put them back at the very end. Plain left-to-right addition drifts once you
  // have tens of thousands of values, especially if they differ wildly in size.
  const n = len(arr);
  let s = 0;
  let lost = 0;
  for (let i = 0; i < n; i++) {
    const v = arr[i];
    const t = s + v;
    if (Math.abs(s) >= Math.abs(v)) lost += (s - t) + v;
    else lost += (v - t) + s;
    s = t;
  }
  return s + lost;
}

/** The balance point: add everything up, share it out equally. */
export function mean(arr) {
  const n = len(arr);
  if (n === 0) return NaN;
  return sum(arr) / n;
}

/** The value in the middle once you line them up in order. */
export function median(arr) {
  return quantile(arr, 0.5);
}

/** The typical squared distance from the middle. Divided by n-1, not n (see the note below). */
export function variance(arr) {
  const n = len(arr);
  // n-1 because the mean was itself estimated from this same data, which pulls the squared
  // distances in a little; dividing by the smaller number pushes them back out.
  if (n < 2) return NaN; // one number cannot disagree with itself
  const m = mean(arr);
  let ss = 0;
  let drift = 0;
  for (let i = 0; i < n; i++) {
    const d = arr[i] - m;
    ss += d * d;
    drift += d;
  }
  // The deviations should sum to zero; whatever they miss by is rounding in m, and this line
  // subtracts that error back out. Without it, data like [1e9, 1e9+1, 1e9+2] can come out with
  // a negative variance.
  const corrected = ss - (drift * drift) / n;
  return Math.max(0, corrected) / (n - 1);
}

/** How far a typical value sits from the middle, in the original units. */
export function sd(arr) {
  return Math.sqrt(variance(arr));
}

/** The smallest value. Any NaN in the data makes the answer NaN rather than being skipped. */
export function min(arr) {
  const n = len(arr);
  if (n === 0) return NaN;
  let m = Infinity;
  for (let i = 0; i < n; i++) {
    const v = arr[i];
    if (Number.isNaN(v)) return NaN;
    if (v < m) m = v;
  }
  return m;
}

/** The largest value. */
export function max(arr) {
  const n = len(arr);
  if (n === 0) return NaN;
  let m = -Infinity;
  for (let i = 0; i < n; i++) {
    const v = arr[i];
    if (Number.isNaN(v)) return NaN;
    if (v > m) m = v;
  }
  return m;
}

/** The distance from smallest to largest, as one number. */
export function range(arr) {
  return max(arr) - min(arr);
}

/**
 * The value that p of the data falls below: quantile(x, 0.25) is the first quartile.
 * This is the ordinary linear-interpolation definition (R's type 7, and what most textbooks
 * draw): line the data up, walk (n-1)*p steps along it, and if you land between two values,
 * slide between them.
 * Anything in the array that is not a number gives NaN. Ordering is the whole idea here, and
 * there is no honest place in the order for a missing value.
 */
export function quantile(arr, p) {
  const n = len(arr);
  if (n === 0 || !isNum(p) || p < 0 || p > 1) return NaN;
  // A numeric copy, sorted. The copy is not fussiness: a plain JavaScript sort compares values
  // as text unless you hand it a comparison function (it would put 10 before 9), and the
  // numeric sort a typed array does instead is several times faster on the tens of thousands
  // of values a resampling lesson throws at it. The input array is never touched.
  const s = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const v = arr[i];
    if (typeof v !== 'number' || Number.isNaN(v)) return NaN;
    s[i] = v;
  }
  s.sort();
  const h = (n - 1) * p;
  const lo = Math.floor(h);
  const hi = Math.min(lo + 1, n - 1);
  const frac = h - lo;
  return s[lo] + frac * (s[hi] - s[lo]);
}

// ===========================================================================
// The bell curve
// ===========================================================================

// exp(-x*x), with the rounding error in x*x taken back out.
// Squaring x throws away half a digit, and exp then multiplies that mistake by x*x, so at
// x = 26 a plain Math.exp(-x*x) is already wrong in its fourth-from-last digit. Splitting x
// into a piece whose square is exact (any multiple of 1/16, here) and a small remainder keeps
// every digit, which is what makes a p-value of 1e-300 land on the right power of ten.
function expNegSquare(x) {
  const xh = Math.floor(x * 16) / 16;
  const xl = x - xh;
  return Math.exp(-xh * xh) * Math.exp(-xl * (x + xh));
}

// erf is the bell curve's own area function, scaled so erf(Infinity) = 1. We build it two ways
// and switch between them, because no single formula is accurate everywhere.
//
// Near the middle: the all-positive series
//     erf(x) = (2x/sqrt(pi)) e^(-x^2) * SUM_{k>=0} (2x^2)^k / (2k+1)!!
// Every term is positive, so nothing cancels and nothing is lost to rounding.
function erfSeries(x) {
  const twoXX = 2 * x * x;
  let term = 1;
  let total = 1;
  for (let k = 1; k < 300; k++) {
    term *= twoXX / (2 * k + 1);
    total += term;
    if (term < total * 1e-18) break;
  }
  return (2 * x * expNegSquare(Math.abs(x)) * total) / SQRTPI;
}

// Out in the tail: a continued fraction for the leftover area,
//     erfc(x) = e^(-x^2)/sqrt(pi) * 1/(x + (1/2)/(x + 1/(x + (3/2)/(x + ...))))
// evaluated by Lentz's method, which builds it front-to-back instead of guessing where to stop.
function erfcFraction(x) {
  let f = FPMIN;
  let c = f;
  let d = 0;
  for (let i = 1; i <= 400; i++) {
    const a = i === 1 ? 1 : (i - 1) / 2;
    d = x + a * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = x + a / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const step = c * d;
    f *= step;
    if (Math.abs(step - 1) < EPS) break; // converged; the bound above means it can never hang
  }
  return (expNegSquare(x) / SQRTPI) * f;
}

/** Area under the bell curve from -x to x, the classic "error function". */
export function erf(x) {
  if (Number.isNaN(x)) return NaN;
  if (x === Infinity) return 1;
  if (x === -Infinity) return -1;
  const a = Math.abs(x);
  if (a < 2) return erfSeries(x);
  const v = 1 - erfcFraction(a);
  return x < 0 ? -v : v;
}

/**
 * The leftover: erfc(x) = 1 - erf(x), computed directly so tiny tails keep their digits.
 * The handover to the continued fraction happens at x = 1, earlier than for erf, because past
 * there the subtraction 1 - erf(x) is throwing away digits the tail actually needs.
 */
export function erfc(x) {
  if (Number.isNaN(x)) return NaN;
  if (x === Infinity) return 0;
  if (x === -Infinity) return 2;
  if (x < 0) return 2 - erfc(-x);
  if (x < 1) return 1 - erfSeries(x);
  if (x > 27.5) return 0; // e^(-27.5^2) is smaller than any number a double can hold
  return erfcFraction(x);
}

/** Height of the bell curve at x. Tall in the middle, thin at the edges, total area 1. */
export function normPdf(x, mu = 0, sd_ = 1) {
  if (Number.isNaN(x) || !isNum(mu) || !isNum(sd_) || sd_ <= 0) return NaN;
  if (x === Infinity || x === -Infinity) return 0; // the curve has flattened onto the axis
  const z = (x - mu) / sd_;
  return expNegSquare(Math.abs(z) / SQRT2) / (sd_ * SQRT2PI);
}

/**
 * Share of the bell curve lying to the left of x.
 * Method: the exact identity normCdf(x) = erfc(-z/sqrt(2))/2 with the erf pair above (series in
 * the middle, continued fraction in the tail). Measured against 50-digit arithmetic the error
 * stays under 2e-16 absolute across x from -40 to 40, far inside the 1e-7 this project asks
 * for, and the far-left tail keeps about 12 correct digits relative rather than collapsing to 0.
 */
export function normCdf(x, mu = 0, sd_ = 1) {
  if (!isNum(mu) || !isNum(sd_) || sd_ <= 0 || Number.isNaN(x)) return NaN;
  if (x === Infinity) return 1;
  if (x === -Infinity) return 0;
  const z = (x - mu) / sd_;
  return 0.5 * erfc(-z / SQRT2);
}

// Evaluate a polynomial, highest power first: poly([a,b,c], x) is a*x*x + b*x + c.
// Written as nested multiplications (Horner's method), which is both faster and kinder to
// rounding than raising x to each power separately.
function poly(coefs, x) {
  let v = 0;
  for (let i = 0; i < coefs.length; i++) v = v * x + coefs[i];
  return v;
}

// Acklam's rational approximation to the inverse normal: good to about 1e-9, and we finish it
// off with one Halley step against our own normCdf, which takes it to machine precision.
const A_LOW = [
  -3.969683028665376e+1, 2.209460984245205e+2, -2.759285104469687e+2,
  1.383577518672690e+2, -3.066479806614716e+1, 2.506628277459239e+0
];
const B_LOW = [
  -5.447609879822406e+1, 1.615858368580409e+2, -1.556989798598866e+2,
  6.680131188771972e+1, -1.328068155288572e+1
];
const C_LOW = [
  -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838e+0,
  -2.549732539343734e+0, 4.374664141464968e+0, 2.938163982698783e+0
];
const D_LOW = [
  7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996e+0, 3.754408661907416e+0
];

// Given q at or below a half, find the (negative) z with q of the curve to its left.
// We always work on the smaller side and mirror afterwards. That is what keeps the far tails
// honest: subtracting two numbers that are both near 1 destroys the digits we are looking for.
function normInvLower(q) {
  let z;
  if (q < 0.02425) {
    // Deep tail: switch to r = sqrt(-2 ln q), where the relationship straightens out.
    const r = Math.sqrt(-2 * Math.log(q));
    z = poly(C_LOW, r) / (poly(D_LOW, r) * r + 1);
  } else {
    // Nearer the middle: a ratio of polynomials in how far q sits from a half.
    const r = q - 0.5;
    const s = r * r;
    z = (poly(A_LOW, s) * r) / (poly(B_LOW, s) * s + 1);
  }
  // One Halley step: ask how much area our guess actually cuts off, then correct by the miss
  // divided by the curve's height there. Takes Acklam's 1e-9 down to the last bit or two.
  // In the deepest tails the height underflows and the step comes out infinite; there the
  // guess is already good to 1e-9 and we keep it rather than wreck it.
  const err = normCdf(z) - q;
  if (err !== 0) {
    const step = err * SQRT2PI / expNegSquare(Math.abs(z) / SQRT2);
    if (Number.isFinite(step)) z -= step / (1 + (z * step) / 2);
  }
  return z;
}

/**
 * The other direction: which x has p of the curve below it? normInv(0.975) is 1.96.
 * Measured against 50-digit arithmetic the error stays under 2e-15 absolute across p in
 * (1e-10, 1 - 1e-10), which is far inside the 1e-6 this project asks for.
 * p at or below 0 gives -Infinity and p at or above 1 gives +Infinity, because no finite point
 * has none of the curve below it, or all of it.
 */
export function normInv(p, mu = 0, sd_ = 1) {
  if (!isNum(p) || !isNum(mu) || !isNum(sd_) || sd_ <= 0) return NaN;
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return mu;
  const z = p < 0.5 ? normInvLower(p) : -normInvLower(1 - p);
  return mu + sd_ * z;
}

// ===========================================================================
// Two functions the t distribution leans on. Useful on their own, so they are exported.
// ===========================================================================

// Lanczos coefficients, g = 7. Together they reproduce the gamma function to about 15 digits.
const LANCZOS = [
  676.5203681218851, -1259.1392167224028, 771.32342877765313,
  -176.61502916214059, 12.507343278686905, -0.13857109526572012,
  9.9843695780195716e-6, 1.5056327351493116e-7
];

// The wobbly correction factor at the heart of the Lanczos formula. On its own it is a number
// near 1; all the size lives in the (x-0.5)*log(x+6.5) - (x+6.5) part outside it.
function lanczosSum(x) {
  const z = x - 1;
  let a = 0.99999999999980993;
  for (let i = 0; i < LANCZOS.length; i++) a += LANCZOS[i] / (z + i + 1);
  return a;
}

/**
 * Log of the gamma function. Gamma extends the factorial to every number, and we work with its
 * logarithm because gamma itself overflows almost immediately.
 * lgamma(n+1) is log(n!). Poles at 0 and the negative whole numbers give Infinity.
 */
export function lgamma(x) {
  if (typeof x !== 'number' || Number.isNaN(x) || x === -Infinity) return NaN;
  if (x === Infinity) return Infinity;
  if (x <= 0 && Number.isInteger(x)) return Infinity; // gamma blows up at 0, -1, -2, ...
  if (x < 0.5) {
    // Reflection: gamma(x) * gamma(1-x) = pi / sin(pi x), which folds the left half onto the right.
    return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x);
  }
  const t = x + 6.5;
  return LN_SQRT2PI + (x - 0.5) * Math.log(t) - t + Math.log(lanczosSum(x));
}

// log of the beta function, B(a,b) = gamma(a)gamma(b)/gamma(a+b).
//
// The obvious route, lgamma(a) + lgamma(b) - lgamma(a+b), is a trap. At a = 500000 those three
// logs are each about 6 million and the answer is about -6, so the true digits get subtracted
// away: what survives is right to nine digits instead of sixteen, and that error rides straight
// through exp() into every p-value at large degrees of freedom.
// So we do the subtraction on paper first. Writing L(x) = (x-0.5)log(x+6.5) - (x+6.5) + log A(x)
// and canceling by hand, the three big -(x+6.5) terms collapse to a single -6.5 and the three
// big logs collapse into two log1p calls of a small ratio. Nothing large is ever subtracted.
function lbeta(a, b) {
  // The Lanczos form above needs its argument at or above 0.5. B(a,b) = B(a+1,b)*(a+b)/a walks
  // a small argument up to where the formula is valid, at most once for each side.
  let A = a;
  let B = b;
  let shift = 0;
  while (A < 0.5) { shift += Math.log(A + B) - Math.log(A); A += 1; }
  while (B < 0.5) { shift += Math.log(A + B) - Math.log(B); B += 1; }
  const tab = A + B + 6.5;
  return shift + LN_SQRT2PI - 6.5
    + (A - 0.5) * Math.log1p(-B / tab)
    + (B - 0.5) * Math.log1p(-A / tab)
    - 0.5 * Math.log(tab)
    + Math.log(lanczosSum(A)) + Math.log(lanczosSum(B)) - Math.log(lanczosSum(A + B));
}

// Continued fraction for the incomplete beta, evaluated by Lentz's method (Numerical Recipes).
// It converges quickly only when x sits on the correct side of (a+1)/(a+b+2); the callers below
// always arrange that. The iteration count is capped so it can never hang.
function betacf(a, b, x) {
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 500; m++) {
    const m2 = 2 * m;
    // even step
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    // odd step
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const step = d * c;
    h *= step;
    if (Math.abs(step - 1) < EPS) return h; // converged
  }
  // Ran out of iterations. Return the best value we have rather than NaN: it is already good to
  // several digits by this point, and a drawn curve is better than a hole in the page.
  return h;
}

// The incomplete beta, told both x and 1-x separately.
//
// That looks redundant and is not. When x is 0.999996, the double closest to it has already
// lost the last four digits of the gap to 1, and the answer here depends on that gap raised to
// the power a. With a in the hundreds of thousands the lost digits become a visible error. The
// t functions know both numbers exactly, so they hand over both, and each logarithm below is
// taken from whichever of the two still has its digits.
function ibetaAt(a, b, x, xc) {
  const lnX = xc < 0.5 ? Math.log1p(-xc) : Math.log(x);
  const ln1mX = x < 0.5 ? Math.log1p(-x) : Math.log(xc);
  // Everything in logs: for large a or b the front factor would overflow otherwise.
  const front = Math.exp(a * lnX + b * ln1mX - lbeta(a, b));
  // Use whichever side of the symmetry I_x(a,b) = 1 - I_(1-x)(b,a) converges fast.
  if (x < (a + 1) / (a + b + 2)) return (front * betacf(a, b, x)) / a;
  return 1 - (front * betacf(b, a, xc)) / b;
}

/**
 * The regularized incomplete beta, I_x(a, b): the share of a beta(a, b) curve lying left of x.
 * This is the workhorse behind every t-distribution probability on the site.
 * Returns 0 at or below x=0 and 1 at or above x=1; NaN if a or b is not positive.
 * Accurate to the last digit or two over ordinary sizes. The one soft spot is a large a with x
 * a hair under 1, where the continued fraction has to add and subtract nearly equal numbers:
 * at a = 500000 the answer is good to about eleven digits instead of sixteen.
 */
export function ibeta(a, b, x) {
  if (!isNum(a) || !isNum(b) || a <= 0 || b <= 0 || Number.isNaN(x)) return NaN;
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return ibetaAt(a, b, x, 1 - x);
}

// ===========================================================================
// The t distribution: the bell curve's cautious cousin, used when the spread is estimated
// from the same small sample as the mean. Fatter tails, and they thin out as df grows.
// ===========================================================================

/** Height of the t curve at t, for df degrees of freedom. */
export function tPdf(t, df) {
  if (!isNum(t) || !isNum(df) || df <= 0) return NaN;
  // Written through the beta function rather than three separate lgamma calls, for the reason
  // spelled out above lbeta: at df near a million the lgamma version loses seven digits.
  return Math.exp(-0.5 * Math.log(df) - lbeta(df / 2, 0.5)
    - ((df + 1) / 2) * Math.log1p((t * t) / df));
}

// Share of the t curve lying beyond +|t|. Both tCdf and tTail are built from this one number.
//
// There are two ways to ask the incomplete beta for it, related by the mirror rule
// I_x(a,b) = 1 - I_(1-x)(b,a), and they fail in opposite directions.
//   The textbook form passes x = df/(df+t*t). With t = 0.000001 and df = a million that rounds
//   to exactly 1 and the answer collapses to a half, losing four correct digits.
//   The mirrored form passes the small partner t*t/(df+t*t), which keeps every digit there, but
//   it then has to subtract a number near 1 from 1, which throws away any genuinely tiny tail.
// Below t = 2 the answer is never smaller than about 0.02, so nothing tiny is at stake and the
// mirrored form is safe. Past t = 2 the answer can be vanishingly small and only the direct
// form keeps a tail of 1e-30 from rounding to nothing.
function tHalfBeyond(t, df) {
  const w = t * t;
  if (!(w > 0)) return 0.5; // t is zero, or so small its square underflows: half is beyond it
  const small = w / (df + w);
  const big = df / (df + w);
  if (w < 4) return 0.5 * (1 - ibetaAt(0.5, df / 2, small, big));
  return 0.5 * ibetaAt(df / 2, 0.5, big, small);
}

/**
 * Share of the t curve to the RIGHT of t: the p-value of a one-sided test.
 * Computed from whichever end keeps its digits, so a tail of 1e-30 comes back as 1e-30 rather
 * than as rounding noise. Checked against 50-digit arithmetic on a grid covering df from 0.5 to
 * a million and t from -40 to 40: never worse than 1.4e-12 absolute.
 */
export function tTail(t, df) {
  if (!isNum(t) || !isNum(df) || df <= 0) return NaN;
  const half = tHalfBeyond(t, df);
  return t >= 0 ? half : 1 - half;
}

/** Share of the t curve to the LEFT of t. */
export function tCdf(t, df) {
  if (!isNum(t) || !isNum(df) || df <= 0) return NaN;
  const half = tHalfBeyond(t, df);
  return t >= 0 ? 1 - half : half;
}

/**
 * The cutoff with tailP of the curve beyond it: tCrit(0.025, 19) is 2.093, the number behind a
 * 95% confidence interval on 20 observations.
 * Found by bisection, which is slower than a formula and impossible to get subtly wrong: keep
 * halving an interval you know the answer is inside.
 */
export function tCrit(tailP, df) {
  if (!isNum(tailP) || !isNum(df) || df <= 0) return NaN;
  if (tailP <= 0) return Infinity;
  if (tailP >= 1) return -Infinity;
  if (tailP === 0.5) return 0;
  // The t curve is a mirror image of itself about zero. Asking for a tail bigger than a half is
  // asking where the curve's left side reaches, so solve the small side and flip the sign.
  if (tailP > 0.5) return -tCrit(1 - tailP, df);

  // From here the answer is positive. Start from the bell curve, which the t curve grows to
  // resemble, and quadruple until the tail beyond hi really is smaller than the one we want,
  // so the answer is certainly caught between lo and hi.
  const CEILING = 1e150; // past here t*t overflows; a df=1 curve needs this much room
  let lo = 0;
  let hi = Math.max(1, Math.abs(normInv(tailP)));
  while (hi < CEILING && tTail(hi, df) > tailP) {
    lo = hi;
    hi = Math.min(CEILING, hi * 4);
  }

  // Now close the gap. While the bracket still spans several factors of ten, split it at the
  // geometric middle instead of the arithmetic one: a Cauchy cutoff can be 1e29, and halving
  // your way down to it from 1e150 one gap at a time would take forever.
  for (let i = 0; i < 500; i++) {
    const mid = (lo > 0 && hi / lo > 4) ? Math.sqrt(lo * hi) : 0.5 * (lo + hi);
    if (!(mid > lo) || !(mid < hi)) break; // the two ends are now adjacent doubles
    if (tTail(mid, df) > tailP) lo = mid;
    else hi = mid;
    if (hi - lo <= 1e-15 * hi) break;
  }
  return 0.5 * (lo + hi);
}

// ===========================================================================
// Relationships between two columns
// ===========================================================================

/**
 * Pearson correlation: do the two move together, and how tightly? Always between -1 and 1.
 * Returns null when either column never varies, because "does it move with x" has no answer
 * when x never moves. Also null if the two columns are different lengths: we will not guess
 * which value pairs with which.
 */
export function corr(xs, ys) {
  const n = len(xs);
  if (n !== len(ys) || n < 2) return null;
  const mx = mean(xs);
  const my = mean(ys);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  if (!(sxx > 0) || !(syy > 0)) return null;
  const r = sxy / Math.sqrt(sxx * syy);
  // Rounding can nudge a perfect fit a hair past 1, which would look absurd on screen.
  return Math.max(-1, Math.min(1, r));
}

/**
 * The best straight line through the points, in the least-squares sense: the line whose vertical
 * misses, squared and added up, come to the smallest total.
 * Returns { b0, b1, sse, sst, r2, seB1, tB1, n }
 *   b0   where the line crosses x = 0
 *   b1   how much y rises for a one-unit step in x  (the slope, usually the whole point)
 *   sse  leftover squared error the line could not explain
 *   sst  total squared spread in y before the line was drawn
 *   r2   share of that spread the line accounts for, 1 - sse/sst
 *   seB1 how much the slope would wobble if you collected a fresh sample
 *   tB1  the slope measured in units of its own wobble
 * Fields that would require dividing by zero come back null: b1 needs x to vary, seB1 needs at
 * least three points (n-2 in the denominator), r2 needs y to vary.
 * n is always the number of pairs we actually used, so a caller counting points into an
 * animation can trust it. Mismatched array lengths are the one case that reports n = 0, because
 * then there are no pairs at all.
 */
export function ols(xs, ys) {
  const n = len(xs);
  const nothing = { b0: null, b1: null, sse: null, sst: null, r2: null, seB1: null, tB1: null };
  if (n !== len(ys)) return { ...nothing, n: 0 };
  if (n < 2) return { ...nothing, n };

  const mx = mean(xs);
  const my = mean(ys);
  let sxy = 0;
  let sxx = 0;
  let sst = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    sxy += dx * dy;
    sxx += dx * dx;
    sst += dy * dy;
  }
  if (!(sxx > 0)) {
    // Every x is the same. There is a cloud of points but no line: infinitely many slopes fit
    // it equally badly, so we report no slope at all rather than a made-up one.
    return { ...nothing, sst, n };
  }

  const b1 = sxy / sxx;
  const b0 = my - b1 * mx;
  // Add the actual misses up rather than using the algebraic shortcut: same answer on paper,
  // and this version does not lose digits when the fit is nearly perfect.
  let sse = 0;
  for (let i = 0; i < n; i++) {
    const resid = ys[i] - (b0 + b1 * xs[i]);
    sse += resid * resid;
  }
  sse = Math.max(0, sse);

  const r2 = sst > 0 ? 1 - sse / sst : null;
  // n-2 because the data spent two of its degrees of freedom pinning down b0 and b1.
  const seB1 = n > 2 ? Math.sqrt((sse / (n - 2)) / sxx) : null;
  // A perfect fit has no wobble to measure the slope against, so there is no t either.
  const tB1 = seB1 !== null && seB1 > 0 ? b1 / seB1 : null;
  return { b0, b1, sse, sst, r2, seB1, tB1, n };
}

// ===========================================================================
// Two ways of saying how sure we are
// ===========================================================================

/**
 * A confidence interval for the mean: the range of true averages that would not look strange
 * given this sample. Returns { mean, se, me, lo, hi, df, tStar }
 *   se    how much the sample mean itself bounces around from sample to sample
 *   me    margin of error, tStar * se, the half-width of the interval
 *   tStar the multiplier from the t table for this confidence level and sample size
 * Fewer than two values gives a mean but no interval: one number tells you nothing about how
 * much numbers vary. With no values at all there is no df to report either.
 */
export function meanCI(arr, conf = 0.95) {
  const n = len(arr);
  const m = mean(arr);
  const df = n > 0 ? n - 1 : null;
  if (n < 2 || !isNum(conf) || conf <= 0 || conf >= 1) {
    return { mean: m, se: null, me: null, lo: null, hi: null, df, tStar: null };
  }
  const se = sd(arr) / Math.sqrt(n);
  const tStar = tCrit((1 - conf) / 2, df); // half the leftover chance in each tail
  const me = tStar * se;
  return { mean: m, se, me, lo: m - me, hi: m + me, df, tStar };
}

/**
 * Compare two groups: is the gap between their averages bigger than the wobble in the gap?
 * Returns { gap, se, t, df, p }, with gap measured as mean(a) - mean(b).
 * Uses Welch's version, which does not pretend the two groups have the same spread. Its df is
 * the Welch-Satterthwaite compromise between the two sample sizes, and is usually not a whole
 * number. p is two-sided: the chance of a gap this big in either direction, if there were no
 * real difference at all.
 */
export function twoGroup(a, b) {
  const nA = len(a);
  const nB = len(b);
  const gap = mean(a) - mean(b);
  if (nA < 2 || nB < 2) return { gap, se: null, t: null, df: null, p: null };

  const vA = variance(a) / nA;
  const vB = variance(b) / nB;
  const se = Math.sqrt(vA + vB);
  if (!(se > 0)) {
    // Both groups are perfectly flat, so the data offers no measure of noise to compare against.
    return { gap, se, t: null, df: null, p: null };
  }
  const df = ((vA + vB) * (vA + vB)) /
    ((vA * vA) / (nA - 1) + (vB * vB) / (nB - 1));
  const t = gap / se;
  const p = 2 * tTail(Math.abs(t), df);
  return { gap, se, t, df, p };
}

// ===========================================================================
// SELF-CHECK (read, do not run)
// Eight things a person can verify against a printed t table or a hand calculation.
//
//   1. quantile([1,2,3,4], 0.5)        is 2.5           (halfway between 2 and 3)
//   2. sd([2,4,4,4,5,5,7,9])           is 2.13809       (sample sd; the population sd is 2)
//   3. normCdf(1.96)                   is 0.9750021049  (and normCdf(-6) is 9.8658765e-10)
//   4. normInv(0.975)                  is 1.9599639845
//   5. tCrit(0.025, 19)                is 2.093024      (the 95% multiplier for n = 20)
//   6. tCrit(0.025, 11)                is 2.200985      (and for n = 12)
//   7. ibeta(2, 3, 0.5)                is 0.6875        (11/16, if you do the integral by hand)
//   8. ols([1,2,3,4,5], [2,4,5,4,5])   gives b1 = 0.6, b0 = 2.2, sst = 6, sse = 2.4, r2 = 0.6,
//                                      seB1 = 0.2828427, tB1 = 2.1213203, n = 5
//
// One more, for the two-group machinery: twoGroup([1,2,3,4,5], [3,4,5,6,7]) gives a gap of -2,
// se of exactly 1, t of -2, df of exactly 8 (the two groups are the same size and shape), and
// p = 0.0805162380.
// ===========================================================================
