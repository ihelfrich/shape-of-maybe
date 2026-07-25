/* rng.js
   Randomness you can go back to. Every simulation in this course runs in a numbered
   world, so a room full of people can type the same number and see the same picture,
   and a surprising result can be found again instead of lost to the next reshuffle. */

/* Turn anything into a 32-bit starting point. Strings hash so a world can be called
   'cafe' as easily as 42. Numbers pass through, so world 42 is always world 42. */
export function hashSeed(seed) {
  if (typeof seed === 'number' && Number.isFinite(seed)) {
    return Math.abs(Math.floor(seed)) >>> 0;
  }
  const s = String(seed ?? '');
  // FNV-1a: small, fast, and spreads similar strings far apart.
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/* mulberry32. Thirty-two bits of state, one multiply-shift-xor round per draw.
   Not for cryptography. For teaching it is ideal: tiny, fast, and identical in
   every browser, which is the only property this project actually needs. */
function mulberry32(a) {
  let t = a >>> 0;
  return function next() {
    t = (t + 0x6D2B79F5) | 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Build a generator for one world.
 * makeRng(42) twice gives two generators that produce exactly the same numbers.
 *
 * Self-check: makeRng(42).u() three times gives
 *   0.6011037519201636, 0.44829055899754167, 0.8524657934904099
 */
export function makeRng(seed = 42) {
  const s = hashSeed(seed);
  const next = mulberry32(s);
  let spare = null; // Box-Muller makes two normals at a time; keep the second

  const rng = {
    seed: s,

    /** A number from 0 up to but not including 1. */
    u() { return next(); },

    /** A whole number from lo to hi, both ends included. */
    int(lo, hi) {
      const a = Math.ceil(Math.min(lo, hi));
      const b = Math.floor(Math.max(lo, hi));
      if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return NaN;
      return a + Math.floor(next() * (b - a + 1));
    },

    /* A draw from a bell curve: mostly near mu, rarely far, with sd setting how far
       "far" is. Box-Muller turns two uniforms into two independent normals. */
    n(mu = 0, sd = 1) {
      if (spare !== null) {
        const v = spare;
        spare = null;
        return mu + sd * v;
      }
      let u1 = next();
      if (u1 < 1e-12) u1 = 1e-12; // log(0) would be -Infinity
      const u2 = next();
      const r = Math.sqrt(-2 * Math.log(u1));
      const theta = 2 * Math.PI * u2;
      spare = r * Math.sin(theta);
      return mu + sd * r * Math.cos(theta);
    },

    /** One element, chosen evenly. */
    pick(arr) {
      if (!Array.isArray(arr) || arr.length === 0) return undefined;
      return arr[Math.floor(next() * arr.length)];
    },

    /* A shuffled copy, never the original. Fisher-Yates, walking backwards so every
       ordering is equally likely. */
    shuffle(arr) {
      const out = Array.isArray(arr) ? arr.slice() : [];
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        const t2 = out[i]; out[i] = out[j]; out[j] = t2;
      }
      return out;
    },

    /** k elements, no repeats. Asking for more than exists gives everything, shuffled. */
    sample(arr, k) {
      const shuffled = rng.shuffle(arr);
      const want = Math.max(0, Math.min(Math.floor(k), shuffled.length));
      return shuffled.slice(0, want);
    },
  };

  return rng;
}
