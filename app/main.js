/* main.js
   Boots the site: hands the router its screens, builds the context object every lesson
   receives, and keeps the reader's chosen world number in the address bar so a link
   carries the exact picture they were looking at. */

import { start, view, register, go } from './core/router.js';
import { home } from './views/home.js';
import { map } from './views/map.js';
import { about } from './views/about.js';
import { UNITS } from './curriculum.js';

/* The lesson context is assembled lazily. A lesson gets the whole toolkit, plus the
   world number, so no lesson ever reaches for a global. */
async function buildToolkit() {
  const [rng, stats, viz, ui, engine] = await Promise.all([
    import('./core/rng.js').catch(() => null),
    import('./core/stats.js').catch(() => null),
    import('./core/viz.js').catch(() => null),
    import('./core/ui.js').catch(() => null),
    import('./core/engine.js').catch(() => null),
  ]);
  return { rng, stats, viz, ui, engine };
}

/* The world number lives in the query part of the hash: #/01-noticing?w=42
   Sharing that link shares the exact dice roll. */
function readSeed() {
  const q = location.hash.split('?')[1] || '';
  const n = Number(new URLSearchParams(q).get('w'));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 42;
}

function writeSeed(n) {
  const [path] = location.hash.split('?');
  const next = `${path || '#/'}?w=${n}`;
  history.replaceState(null, '', next);
}

/* One page, two readers. Everything essential lives in the main prose; the deep end
   holds derivations, assumptions and edge cases in <details> blocks. This flips them
   all at once and remembers the choice for lessons rendered later. */
function wireDepth() {
  const btn = document.getElementById('depth');
  if (!btn) return;
  const root = document.documentElement;
  const apply = (deep) => {
    root.dataset.depth = deep ? 'deep' : 'plain';
    btn.setAttribute('aria-pressed', String(deep));
    btn.textContent = deep ? 'Hide the deep end' : 'Show the deep end';
    document.querySelectorAll('details.deep').forEach(d => { d.open = deep; });
  };
  apply(false);
  btn.addEventListener('click', () => apply(root.dataset.depth !== 'deep'));
}

async function boot() {
  const mount = document.getElementById('view');
  const toolkit = await buildToolkit();
  wireDepth();

  view('/', home);
  view('map', map);
  view('about', about);

  /* A lesson needs the whole toolkit. If any part failed to load we do not register
     the lessons at all, so the map shows them as unfinished rather than handing a
     reader a broken screen. The site is never allowed to overstate what works. */
  const coreReady = !!(toolkit.rng && toolkit.stats && toolkit.viz && toolkit.ui && toolkit.engine);

  /* Every unit the curriculum calls ready is fetched here. A unit that fails to load stays
     unregistered, which the map then reports as unfinished. Adding a lesson is a one-line
     change in curriculum.js and nothing else. */
  if (coreReady) {
    const wanted = UNITS.filter(u => u.status === 'ready');
    const mods = await Promise.all(
      wanted.map(u => import(`./lessons/${u.id}/index.js`).catch(() => null))
    );
    mods.forEach(m => { if (m && m.default) register(m.default); });
  }

  start({
    mount,
    ctx: (lesson) => {
      const seed = readSeed();
      return {
        ...toolkit,
        stats: toolkit.stats,
        viz: toolkit.viz,
        ui: toolkit.ui,
        engine: toolkit.engine,
        // Lessons reach for ctx.stage(canvas) constantly, so it is lifted out of viz.
        stage: toolkit.viz ? toolkit.viz.stage : null,
        // A ready-to-use generator for this world, if core/rng.js is present.
        rng: toolkit.rng ? toolkit.rng.makeRng(seed) : null,
        makeRng: toolkit.rng ? toolkit.rng.makeRng : null,
        seed,
        setSeed(n) { writeSeed(n); },
        lesson,
        go,
      };
    },
  });
}

boot();
