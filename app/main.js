/* main.js
   Boots the site: hands the router its screens, builds the context object every lesson
   receives, and keeps the reader's chosen world number in the address bar so a link
   carries the exact picture they were looking at. */

import { start, view, register, go } from './core/router.js';
import { home } from './views/home.js';
import { map } from './views/map.js';
import { about } from './views/about.js';

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

async function boot() {
  const mount = document.getElementById('view');
  const toolkit = await buildToolkit();

  view('/', home);
  view('map', map);
  view('about', about);

  /* Lessons register themselves. Adding one is a two-line change here. */
  const lessonModules = await Promise.all([
    import('./lessons/01-noticing/index.js').catch(() => null),
  ]);
  lessonModules.forEach(m => { if (m && m.default) register(m.default); });

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
