/* app/core/engine.js
   The clock. Two jobs only: run a function once per animation frame, and walk a
   single number from one value to another over a set time. Both measure time in
   seconds rather than frames, so a slow phone shows the same motion as a fast
   laptop, just with fewer frames in between. */

// Some people get sick from motion, and some just want the answer now. The
// browser knows which; we ask. Kept live so a reader who changes the setting
// mid-session gets what they asked for without reloading.
const motionQuery = typeof matchMedia === 'function'
  ? matchMedia('(prefers-reduced-motion: reduce)')
  : null;

export let reducedMotion = motionQuery ? motionQuery.matches : false;

if (motionQuery) {
  const onMotionChange = (e) => { reducedMotion = !!e.matches; };
  // Safari before 14 only has the old addListener, and plenty of cheap phones
  // are still on it.
  if (typeof motionQuery.addEventListener === 'function') {
    motionQuery.addEventListener('change', onMotionChange);
  } else if (typeof motionQuery.addListener === 'function') {
    motionQuery.addListener(onMotionChange);
  }
}

// The freshest possible read, for code that captured the value once.
export function prefersReducedMotion() {
  return motionQuery ? motionQuery.matches : reducedMotion;
}

// Called through wrappers, never stored bare: an unbound requestAnimationFrame
// throws "Illegal invocation" in Chrome. The setTimeout path only exists so the
// module can be imported outside a browser (a test runner) without exploding.
function hasRaf() { return typeof requestAnimationFrame === 'function'; }
function raf(cb) {
  return hasRaf() ? requestAnimationFrame(cb) : setTimeout(() => cb(now()), 16);
}
function caf(handle) {
  if (handle == null) return;
  if (hasRaf()) cancelAnimationFrame(handle); else clearTimeout(handle);
}
function now() {
  return (typeof performance === 'object' && performance && typeof performance.now === 'function')
    ? performance.now()
    : Date.now();
}

// Easing curves take a fraction of the way through (0 to 1) and return a
// fraction of the way there. linear feels mechanical; outCubic feels like a
// thing coming to rest.
export const ease = Object.freeze({
  linear: (p) => p,
  outCubic: (p) => 1 - Math.pow(1 - p, 3),
  inOutCubic: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
});

/* loop(fn) runs fn once per animation frame until you stop it.
   fn(dt, elapsed) gets seconds since the previous frame and seconds of running
   time so far. Returns stop(). Keep the returned stop() and call it when the
   lesson unmounts, or its frames pile up underneath the next lesson.

   Both numbers come from the same clamped clock, so `elapsed` is always the sum
   of the `dt`s the lesson has actually seen. A tab left in the background for a
   minute therefore resumes where it paused instead of teleporting. */
export function loop(fn) {
  if (typeof fn !== 'function') return function stop() {};

  let handle = null;
  let running = true;
  let last = null;
  let elapsed = 0;

  function frame(stamp) {
    if (!running) return;
    if (last === null) last = stamp;
    let dt = (stamp - last) / 1000;
    last = stamp;
    if (!Number.isFinite(dt) || dt < 0) dt = 0;
    if (dt > 0.1) dt = 0.1;
    elapsed += dt;
    // The next frame is requested after fn on purpose. If fn throws, nothing
    // reschedules and the loop dies quietly instead of throwing sixty times a
    // second; if fn calls stop(), the running check below catches it.
    fn(dt, elapsed);
    if (running) handle = raf(frame);
  }

  handle = raf(frame);

  return function stop() {
    running = false;
    caf(handle);
    handle = null;
  };
}

/* tween({from, to, ms, ease, onStep, onDone}) walks a number from one value to
   another. onStep(value, p) fires each frame with the eased value and the raw
   progress; onDone(to) fires once at the end. Returns cancel().
   If the reader prefers reduced motion, or the duration is zero, we skip the
   animation: one onStep at the end value, then onDone, synchronously. */
export function tween(opts) {
  const o = opts || {};
  const from = Number.isFinite(o.from) ? o.from : 0;
  const to = Number.isFinite(o.to) ? o.to : 1;
  const ms = Number.isFinite(o.ms) ? Math.max(0, o.ms) : 400;
  const curve = typeof o.ease === 'function' ? o.ease : ease.outCubic;
  const onStep = typeof o.onStep === 'function' ? o.onStep : null;
  const onDone = typeof o.onDone === 'function' ? o.onDone : null;

  if (prefersReducedMotion() || ms === 0) {
    if (onStep) onStep(to, 1);
    if (onDone) onDone(to);
    return function cancel() {};
  }

  let handle = null;
  let canceled = false;
  let start = null;

  function frame(stamp) {
    if (canceled) return;
    if (start === null) start = stamp;
    // Progress comes from the clock, not from a frame counter, so a dropped
    // frame costs smoothness and never duration.
    const p = Math.min(1, Math.max(0, (stamp - start) / ms));
    if (onStep) onStep(from + (to - from) * curve(p), p);
    // onStep is allowed to cancel us, so check again before booking more work.
    if (canceled) return;
    if (p < 1) handle = raf(frame);
    else if (onDone) onDone(to);
  }

  handle = raf(frame);

  return function cancel() {
    if (canceled) return;
    canceled = true;
    caf(handle);
    handle = null;
  };
}
