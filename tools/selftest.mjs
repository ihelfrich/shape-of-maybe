/* selftest.mjs
   Checks the numbers the course teaches against values you can look up in a table.
   No test framework: run `node tools/selftest.mjs` and read the output.

   Every failure here is a lesson telling a reader something false, which is the worst
   defect this project can ship. That is why this file exists before the second lesson. */

import { readFileSync } from 'node:fs';

const root = new URL('..', import.meta.url);
const has = p => { try { readFileSync(new URL(p, root)); return true; } catch { return false; } };

let pass = 0, fail = 0, skipped = 0;

function check(label, got, want, tol = 5e-4) {
  if (got === undefined || got === null || Number.isNaN(got)) {
    fail++; console.log(`  FAIL  ${label}\n        got ${got}, wanted ${want}`);
    return;
  }
  const ok = Math.abs(got - want) <= tol;
  if (ok) { pass++; console.log(`  ok    ${label}  = ${round(got)}`); }
  else { fail++; console.log(`  FAIL  ${label}\n        got ${round(got)}, wanted ${want} (tol ${tol})`); }
}

function truthy(label, got) {
  if (got) { pass++; console.log(`  ok    ${label}`); }
  else { fail++; console.log(`  FAIL  ${label}`); }
}

const round = v => typeof v === 'number' ? Number(v.toFixed(8)) : v;

console.log('\nThe Shape of Maybe — number check\n');

/* ---- rng.js: the same world must always give the same numbers ---------------- */
if (!has('app/core/rng.js')) {
  console.log('rng.js  — not present, skipping'); skipped++;
} else {
  const { makeRng, hashSeed } = await import(new URL('app/core/rng.js', root));
  console.log('rng.js');
  const a = makeRng(42), b = makeRng(42);
  const seqA = [a.u(), a.u(), a.u()];
  const seqB = [b.u(), b.u(), b.u()];
  truthy('same seed gives the same sequence', seqA.every((v, i) => v === seqB[i]));
  truthy('draws land inside [0, 1)', seqA.every(v => v >= 0 && v < 1));
  const c = makeRng(43);
  truthy('a different seed gives a different sequence', c.u() !== seqA[0]);

  const d = makeRng(7);
  const ints = Array.from({ length: 400 }, () => d.int(1, 6));
  truthy('int(1,6) stays inside its bounds', ints.every(v => v >= 1 && v <= 6 && Number.isInteger(v)));
  truthy('int(1,6) reaches both ends', ints.includes(1) && ints.includes(6));

  const e = makeRng(11);
  const normals = Array.from({ length: 20000 }, () => e.n(0, 1));
  const m = normals.reduce((s, x) => s + x, 0) / normals.length;
  const sd = Math.sqrt(normals.reduce((s, x) => s + (x - m) ** 2, 0) / (normals.length - 1));
  check('20,000 normal draws have mean near 0', m, 0, 0.03);
  check('20,000 normal draws have sd near 1', sd, 1, 0.03);

  const src = [1, 2, 3, 4, 5];
  const f = makeRng(3);
  const shuffled = f.shuffle(src);
  truthy('shuffle does not mutate its input', src.join() === '1,2,3,4,5');
  truthy('shuffle keeps every element', [...shuffled].sort().join() === '1,2,3,4,5');
  truthy('sample(k) returns k things', f.sample(src, 3).length === 3);
  truthy('hashSeed is stable', hashSeed('cafe') === hashSeed('cafe'));
}

/* ---- stats.js: values a reader could check in Table C ------------------------ */
if (!has('app/core/stats.js')) {
  console.log('\nstats.js — not present, skipping'); skipped++;
} else {
  const S = await import(new URL('app/core/stats.js', root));
  console.log('\nstats.js — summaries');
  const xs = [2, 4, 4, 4, 5, 5, 7, 9];
  check('mean', S.mean(xs), 5);
  check('sd (n-1)', S.sd(xs), 2.13808993);
  check('median', S.median(xs), 4.5);
  check('median of an even-length pair', S.median([1, 3]), 2);
  check('quantile p=0.25 (R type 7)', S.quantile(xs, 0.25), 4);
  check('quantile p=0.5 matches median', S.quantile(xs, 0.5), 4.5);

  console.log('\nstats.js — the normal curve');
  check('normPdf(0)', S.normPdf(0), 0.39894228, 1e-7);
  check('normCdf(0)', S.normCdf(0), 0.5, 1e-9);
  check('normCdf(1.96)', S.normCdf(1.96), 0.97500210, 1e-7);
  check('normCdf(-1.96)', S.normCdf(-1.96), 0.02499790, 1e-7);
  check('normCdf(1) — the 68% rule', S.normCdf(1) - S.normCdf(-1), 0.68268949, 1e-7);
  check('normCdf(3) — the 99.7% rule', S.normCdf(3) - S.normCdf(-3), 0.99730020, 1e-7);
  check('normInv(0.975)', S.normInv(0.975), 1.95996398, 1e-6);
  check('normInv(0.5)', S.normInv(0.5), 0, 1e-9);
  check('normInv round-trips normCdf', S.normInv(S.normCdf(0.7)), 0.7, 1e-6);

  console.log('\nstats.js — the t curve (check these against Table C)');
  check('tCrit(0.025, 11) = 2.201', S.tCrit(0.025, 11), 2.201, 5e-4);
  check('tCrit(0.025, 19) = 2.093', S.tCrit(0.025, 19), 2.093, 5e-4);
  check('tCrit(0.025, 9)  = 2.262', S.tCrit(0.025, 9), 2.262, 5e-4);
  check('tCrit(0.05, 9)   = 1.833', S.tCrit(0.05, 9), 1.833, 5e-4);
  check('tCrit(0.005, 9)  = 3.250', S.tCrit(0.005, 9), 3.250, 5e-4);
  check('tCrit(0.025, 100)= 1.984', S.tCrit(0.025, 100), 1.984, 5e-4);
  check('tTail(0, 10) = half', S.tTail(0, 10), 0.5, 1e-9);
  check('tTail(2.228, 10) = 0.025', S.tTail(2.228, 10), 0.025, 5e-4);
  check('t with huge df meets the normal', S.tCrit(0.025, 1e6), 1.95996398, 1e-3);
  check('tCdf is the complement of tTail', S.tCdf(1.3, 7) + S.tTail(1.3, 7), 1, 1e-9);
  check('tPdf(0, 1) — Cauchy peak', S.tPdf(0, 1), 1 / Math.PI, 1e-7);

  console.log('\nstats.js — relationships');
  const X = [1, 2, 3, 4, 5], Y = [2, 4, 5, 4, 5];
  check('corr', S.corr(X, Y), 0.77459667, 1e-6);
  const fit = S.ols(X, Y);
  check('ols slope', fit.b1, 0.6);
  check('ols intercept', fit.b0, 2.2);
  check('ols sse', fit.sse, 2.4, 1e-9);
  check('ols r2 = corr squared', fit.r2, 0.6, 1e-6);
  check('ols seB1', fit.seB1, 0.28284271, 1e-6);
  check('ols tB1 = slope / wobble', fit.tB1, fit.b1 / fit.seB1, 1e-9);

  console.log('\nstats.js — the two workhorses');
  // The lecture tips example: 20 customers, mean 22.21, sd 1.963, t* 2.093 -> 21.29 to 23.13
  const tips = [20.8, 18.7, 19.9, 20.6, 21.9, 23.4, 22.8, 24.9, 22.2, 20.3,
                24.9, 22.3, 27.0, 20.4, 22.2, 24.0, 21.1, 22.1, 22.0, 22.7];
  const ci = S.meanCI(tips, 0.95);
  check('meanCI mean', ci.mean, 22.21, 5e-3);
  check('meanCI df', ci.df, 19);
  check('meanCI t*', ci.tStar, 2.093, 5e-4);
  check('meanCI low end', ci.lo, 21.29, 0.02);
  check('meanCI high end', ci.hi, 23.13, 0.02);

  const g = S.twoGroup([1, 2, 3, 4, 5], [3, 4, 5, 6, 7]);
  check('twoGroup gap', Math.abs(g.gap), 2, 1e-9);
  check('twoGroup wobble', g.se, Math.sqrt(2.5 / 5 + 2.5 / 5), 1e-9);
  check('twoGroup t', Math.abs(g.t), 2 / Math.sqrt(1), 1e-9);
  check('twoGroup Welch df (equal spreads) = 8', g.df, 8, 1e-6);
  truthy('twoGroup p is a probability', g.p > 0 && g.p < 1);

  console.log('\nstats.js — refusing to explode on bad input');
  truthy('mean of nothing is NaN, not a crash', Number.isNaN(S.mean([])));
  truthy('sd of one value is NaN, not zero', Number.isNaN(S.sd([5])));
  const flat = S.ols([1, 1, 1], [2, 3, 4]);
  truthy('ols on a vertical cloud returns null, not Infinity',
         flat === null || flat.b1 === null || !Number.isFinite(flat.b1));
  truthy('corr with a flat column returns null', S.corr([1, 1, 1], [2, 3, 4]) === null);
  truthy('meanCI of one value returns null', S.meanCI([5]) === null);
}

console.log(`\n${pass} passed, ${fail} failed, ${skipped} file(s) skipped\n`);
process.exit(fail > 0 ? 1 : 0);
