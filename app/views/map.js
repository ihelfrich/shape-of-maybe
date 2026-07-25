/* map.js
   The whole course on one screen, honest about what is finished and what is not.
   A reader should be able to see the shape of the journey before committing to step one. */

import { UNITS, PARTS } from '../curriculum.js';
import { go, lessonById } from '../core/router.js';

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

export function map(root) {
  const wrap = el('div');

  const head = el('div', 'prose');
  head.append(el('p', 'kicker', 'The map'));
  const h1 = el('h1');
  h1.textContent = 'From noticing things to reading a regression table.';
  head.append(h1);
  head.append(el('p', 'lede',
    'Each unit answers one question. They are meant to be taken in order, because each one is ' +
    'built out of the last, but nothing stops you jumping to whatever you came here for.'));
  wrap.append(head);

  const list = el('div', 'map');
  let shownPart = null;
  UNITS.forEach(u => {
    // The course comes in six named parts. Print a heading the first time each appears,
    // so the map reads as an arc rather than a list of sixteen equal things.
    if (u.part && u.part !== shownPart) {
      shownPart = u.part;
      const meta = PARTS.find(p => p.id === u.part);
      if (meta) {
        const h = el('h2', 'part-head');
        h.textContent = `Part ${meta.id} · ${meta.title}`;
        list.append(h);
      }
    }
    // A unit counts as ready only if its lesson actually loaded. The curriculum file
    // says what is intended; the router says what exists. The reader gets the truth.
    const ready = u.status === 'ready' && !!lessonById(u.id);
    const card = el('button', 'unit');
    card.type = 'button';
    if (!ready) {
      card.disabled = true;
      card.setAttribute('aria-disabled', 'true');
    }

    card.append(el('span', 'unit__no', String(u.no).padStart(2, '0')));

    const mid = el('span');
    mid.append(el('span', 'unit__title', u.title));
    mid.append(el('span', 'unit__q', u.question));
    card.append(mid);

    const meta = el('span', 'unit__meta');
    const tag = el('span', ready ? 'tag tag--ready' : 'tag tag--soon', ready ? 'Ready' : 'Being built');
    meta.append(tag);
    meta.append(document.createTextNode(' ' + u.minutes + ' min'));
    card.append(meta);

    if (ready) card.addEventListener('click', () => go(u.id));
    list.append(card);
  });
  wrap.append(list);

  const note = el('div', 'prose');
  note.style.marginTop = 'var(--s-6)';
  note.append(el('p', 'muted',
    'Units are published when they are genuinely good rather than when they are merely finished, ' +
    'which is why the list is longer than the ready pile. The source for all of it is open, and ' +
    'the writing standards it is held to are in the repository.'));
  wrap.append(note);

  root.append(wrap);
}
