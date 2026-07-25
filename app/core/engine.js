/* engine.js
   The clock. One animation loop and one tween, both frame-rate independent, both
   quiet when the reader has asked their device for less motion. Nothing here knows
   what is being drawn. */

const motionQuery = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : null;

/** True if the reader asked for less motion, read once when the page loaded. */
export const reducedMotion = motionQuery ? motionQuery.matches : false;

/* The setting can change mid-session, and a const cannot. Anything that has to be
   right at the moment it runs, including the tween below, asks this instead. */
export function prefersReducedMotion() {
  return motionQuery ? motionQuery.matches : reducedMotion;
}

export const ease = {
  linear: (t) => t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
};

/* A tab that was in the background hands back one enormous frame. Capping the step
   means a simulation resumes where it was rather than teleporting. */
const MAX_STEP = 0.1;

/**
 * Run fn(dtSeconds, elapsedSeconds) on every frame. Returns stop().
 * Return false from fn to stop. opts.anchor: an element the loop belongs to, so the
 * loop dies by itself once that element leaves the page.
 */
export function loop(fn, opts = {}) {
  const anchor = opts.anchor || null;
  let raf = 0;
  let last = 0;
  let elapsed = 0;
  let live = true;

  const stop = () => {
    live = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  const frame = (now) => {
    raf = 0;
    if (!live) return;
    if (anchor && !anchor.isConnected) { stop(); return; }
    const dt = last ? Math.min((now - last) / 1000, MAX_STEP) : 0;
    last = now;
    elapsed += dt;

    let keep;
    try {
      keep = fn(dt, elapsed);
    } catch (err) {
      stop(); // one broken frame should not become sixty broken frames a second
      throw err;
    }
    if (!live || keep === false) { stop(); return; }
    raf = requestAnimationFrame(frame);
  };

  raf = requestAnimationFrame(frame);
  return stop;
}

/* from and to may be numbers, or flat objects of numbers when several things move
   together (a point, a pair of means). Anything else simply switches at the end. */
function mixer(from, to) {
  if (typeof from === 'number' && typeof to === 'number') {
    return (k) => from + (to - from) * k;
  }
  if (from && to && typeof from === 'object' && typeof to === 'object') {
    const keys = Object.keys(to).filter(
      (k) => typeof to[k] === 'number' && typeof from[k] === 'number',
    );
    return (k) => {
      const out = { ...to };
      for (const key of keys) out[key] = from[key] + (to[key] - from[key]) * k;
      return out;
    };
  }
  return (k) => (k >= 1 ? to : from);
}

/**
 * Move a value from one place to another over time.
 * opts: {from, to, ms, ease, onStep, onDone}. Returns cancel().
 * onStep(value, t) where t runs 0 to 1. Reduced motion jumps to the end.
 */
export function tween(opts = {}) {
  const { from, to } = opts;
  const ms = Math.max(0, opts.ms == null ? 420 : opts.ms);
  const curve = typeof opts.ease === 'function'
    ? opts.ease
    : (ease[opts.ease] || ease.outCubic);
  const onStep = typeof opts.onStep === 'function' ? opts.onStep : null;
  const onDone = typeof opts.onDone === 'function' ? opts.onDone : null;
  const mix = mixer(from, to);

  let raf = 0;
  let live = true;
  let t0 = null;

  const cancel = () => {
    live = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  /* Still one frame late rather than instant, so a caller can cancel a tween it
     started and never see a callback fire before it got the handle back. */
  if (prefersReducedMotion() || ms === 0) {
    raf = requestAnimationFrame(() => {
      raf = 0;
      if (!live) return;
      live = false;
      if (onStep) onStep(to, 1);
      if (onDone) onDone(to);
    });
    return cancel;
  }

  const frame = (now) => {
    raf = 0;
    if (!live) return;
    if (t0 === null) t0 = now; // the clock starts on the first frame, not at the call
    const t = Math.min(1, (now - t0) / ms);
    if (onStep) onStep(mix(curve(t)), t);
    if (!live) return; // onStep is allowed to cancel us
    if (t < 1) {
      raf = requestAnimationFrame(frame);
    } else {
      live = false;
      if (onDone) onDone(to);
    }
  };

  raf = requestAnimationFrame(frame);
  return cancel;
}
