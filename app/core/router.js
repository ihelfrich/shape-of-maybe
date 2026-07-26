/* router.js
   Turns the bit of the address after the # into a screen. No dependencies, no history
   rewriting, no build step: a link is just a link, and the back button behaves. */

const routes = new Map();   // id -> render(root, ctx)
const lessons = new Map();  // id -> lesson module

let mountEl = null;
let makeCtx = () => ({});
let onRoute = () => {};

/** Register a lesson module: { id, unit, title, question, minutes, render }. */
export function register(lesson) {
  if (!lesson || !lesson.id) return;
  lessons.set(lesson.id, lesson);
}

/** Register a plain view (the landing page, the about page). */
export function view(id, render) {
  routes.set(id, render);
}

export function lessonById(id) {
  return lessons.get(id) || null;
}

/** Go somewhere. Setting the hash is enough; the hashchange listener does the rest. */
export function go(id) {
  const next = '#/' + String(id).replace(/^#?\/?/, '');
  if (location.hash === next) render();
  else location.hash = next;
}

/* A route looks like #/01-noticing?w=777. The part before the ? picks the screen;
   the part after it carries the world number, which main.js reads separately. */
function currentId() {
  const raw = location.hash.replace(/^#\/?/, '').split('?')[0].trim();
  return raw === '' ? '/' : raw;
}

function render() {
  if (!mountEl) return;
  const id = currentId();

  // Rebuild from empty every time. Lessons are told they must tolerate this,
  // which keeps them free of the "second visit looks wrong" class of bug.
  mountEl.replaceChildren();

  const lesson = lessons.get(id);
  const plain = routes.get(id);
  const found = lesson || plain;

  try {
    if (lesson) {
      document.title = `${lesson.title} — The Shape of Maybe`;
      lesson.render(mountEl, makeCtx(lesson));
    } else if (plain) {
      plain(mountEl, makeCtx(null));
    } else {
      notFound(mountEl, id);
    }
  } catch (err) {
    failed(mountEl, err);
  }

  markCurrentLink(id);
  onRoute(id, found || null);

  // Move focus to the new screen so a keyboard or screen-reader user is not
  // stranded at the top of the old page.
  mountEl.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

function markCurrentLink(id) {
  const want = '#/' + (id === '/' ? '' : id);
  document.querySelectorAll('.navlink').forEach(a => {
    if (a.getAttribute('href') === want) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

function notFound(root, id) {
  const w = document.createElement('div');
  w.className = 'prose';
  const h = document.createElement('h1');
  h.textContent = 'That page has not been written yet';
  const p = document.createElement('p');
  p.className = 'lede';
  p.textContent = `There is nothing at "${id}" so far. The units that are ready are listed on the map.`;
  const a = document.createElement('a');
  a.className = 'ec-button';
  a.href = '#/map';
  a.textContent = 'See the units';
  a.style.display = 'inline-flex';
  a.style.alignItems = 'center';
  a.style.textDecoration = 'none';
  w.append(h, p, a);
  root.append(w);
}

function failed(root, err) {
  const w = document.createElement('div');
  w.className = 'prose';
  const h = document.createElement('h1');
  h.textContent = 'This screen broke';
  const p = document.createElement('p');
  p.className = 'lede';
  p.textContent = 'Something in this lesson threw an error, which is our fault rather than yours. ' +
                  'The details are below, and the rest of the site still works.';
  const pre = document.createElement('pre');
  pre.className = 'small muted';
  pre.style.whiteSpace = 'pre-wrap';
  pre.textContent = String((err && err.stack) || err);
  w.append(h, p, pre);
  root.append(w);
}

/** Start listening. opts: { mount, ctx, onRoute } */
export function start(opts) {
  mountEl = opts.mount;
  if (typeof opts.ctx === 'function') makeCtx = opts.ctx;
  if (typeof opts.onRoute === 'function') onRoute = opts.onRoute;
  window.addEventListener('hashchange', render);
  render();
}
