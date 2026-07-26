// rng.js: the dice this whole site rolls with.
// Every simulation runs inside a numbered "world". Type the same world number and every phone
// in the room sees the same coin flips and the same surprise.
// Nothing here is truly random: it is a fixed arithmetic recipe that only looks random.

// mulberry32 hands back whole numbers below 2^32, so this is what we divide by to land in [0,1).
const TWO32 = 4294967296;

/**
 * Turn a world label into the plain number the generator actually starts from.
 *
 * A whole number (or a string of digits, which is what a text box gives you) is kept as itself,
 * so "world 42" really is 42 on the screen and in the code. Anything else, a word like
 * "monday" or a fraction like 0.5, gets folded down into a number by hashing.
 *
 * @param {number|string} stringOrNumber
 * @returns {number} an integer from 0 to 4294967295
 */
export function hashSeed(stringOrNumber) {
  let whole = null;
  if (typeof stringOrNumber === 'number' && Number.isInteger(stringOrNumber)) {
    whole = stringOrNumber;
  } else if (typeof stringOrNumber === 'string' && /^\s*-?\d{1,15}\s*$/.test(stringOrNumber)) {
    // The seed box holds text, so "42" and 42 have to mean the same world.
    whole = Number(stringOrNumber);
  }
  // >>> 0 wraps a whole number into the 0 .. 2^32-1 range without changing small ones.
  if (whole !== null) return whole >>> 0;

  // FNV-1a: walk the characters, mixing each one into a running number.
  const s = String(stringOrNumber);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  // One last scramble, so near-identical words like "a" and "b" start far apart.
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * Build a generator for one world.
 *
 * The engine is mulberry32: hold a counter, step it forward by a fixed odd number, then stir
 * the result hard enough that consecutive counts come out looking unrelated. It is small and
 * fast and passes the usual randomness tests, which is what a teaching site needs.
 *
 * @param {number|string} seed  the world number (or label)
 * @returns {{u:Function, int:Function, n:Function, pick:Function, shuffle:Function,
 *            sample:Function, seed:number}}
 */
export function makeRng(seed) {
  const startedFrom = hashSeed(seed === undefined || seed === null ? 1 : seed);
  let state = startedFrom;

  // u() is the one true source. Everything below is built out of repeated calls to it.
  function u() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / TWO32;
  }

  // A whole number from lo to hi, both ends included. Given lo and hi backwards it quietly
  // swaps them; given something that is not a number at all it returns NaN rather than looping.
  function int(lo, hi) {
    const a = Math.ceil(Math.min(lo, hi));
    const b = Math.floor(Math.max(lo, hi));
    if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return NaN;
    return a + Math.floor(u() * (b - a + 1));
  }

  // Box-Muller makes normal draws two at a time, so we keep the second one on the shelf.
  // That keeps the world reproducible: the same calls in the same order give the same numbers.
  let spare = null;

  // A draw from a bell curve centred at mu, typical distance sd from the middle.
  // Worth knowing before you teach with it: u() has 32 bits of resolution, so the smallest
  // value it can return is about 2.3e-10, and that caps a draw at roughly 6.7 sd from the
  // middle. This world can show you a one-in-a-billion event but not a one-in-a-trillion one.
  function n(mu = 0, sd = 1) {
    if (spare !== null) {
      const z = spare;
      spare = null;
      return mu + sd * z;
    }
    let u1 = 0;
    while (u1 === 0) u1 = u(); // log(0) is -Infinity, so redraw the single value that breaks it
    const u2 = u();
    const r = Math.sqrt(-2 * Math.log(u1));
    const angle = 2 * Math.PI * u2;
    spare = r * Math.sin(angle);
    return mu + sd * (r * Math.cos(angle));
  }

  // One element, chosen with equal chance. An empty array gives undefined and uses up no draw,
  // so an empty list mid-animation does not knock the rest of the world out of step.
  function pick(array) {
    if (!array || array.length === 0) return undefined;
    return array[int(0, array.length - 1)];
  }

  // A NEW array in shuffled order. The original is left exactly as it was, because a lesson
  // often wants to show the before and the after side by side.
  function shuffle(array) {
    const out = Array.prototype.slice.call(array || []);
    for (let i = out.length - 1; i > 0; i--) {
      const j = int(0, i);
      const t = out[i];
      out[i] = out[j];
      out[j] = t;
    }
    return out;
  }

  // k elements drawn without replacement: nobody gets picked twice. Asking for more than the
  // array holds gives the whole thing shuffled; asking for zero or less gives an empty array.
  function sample(array, k) {
    const pool = Array.prototype.slice.call(array || []);
    const size = pool.length;
    const take = Math.max(0, Math.min(Math.floor(k) || 0, size));
    // Partial Fisher-Yates: swap a random survivor into each of the first `take` slots.
    for (let i = 0; i < take; i++) {
      const j = int(i, size - 1);
      const t = pool[i];
      pool[i] = pool[j];
      pool[j] = t;
    }
    return pool.slice(0, take);
  }

  // Frozen so a lesson cannot accidentally overwrite .seed and lie about which world it is in.
  return Object.freeze({ u, int, n, pick, shuffle, sample, seed: startedFrom });
}

// ---------------------------------------------------------------------------
// SELF-CHECK (read, do not run)
// makeRng(42) must produce these first three .u() values, in this order:
//   0.6011037519201636
//   0.44829055899754167
//   0.8524657934904099
// makeRng('42') and makeRng(42) are the same world; makeRng('forty two') is a different one.
// makeRng(42).seed === 42.
// ---------------------------------------------------------------------------
