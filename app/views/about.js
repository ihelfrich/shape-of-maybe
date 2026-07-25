/* about.js
   Why this exists. Short, plain, and willing to say what it is against. */

import { go } from '../core/router.js';

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

const P = text => el('p', null, text);

export function about(root) {
  const wrap = el('div', 'prose');

  wrap.append(el('p', 'kicker', 'Why this exists'));
  const h1 = el('h1');
  h1.textContent = 'Most people were not bad at maths. They were rushed.';
  wrap.append(h1);

  wrap.append(el('p', 'lede',
    'A standard maths education moves at the speed of the syllabus rather than the speed of ' +
    'understanding. Miss one week and the notation stops meaning anything, and from there it is ' +
    'a short walk to deciding you are not a numbers person. Almost nobody who says that is right ' +
    'about themselves.'));

  wrap.append(P(
    'This course is built on a different bet: that the ideas in statistics are genuinely simple, ' +
    'that the notation is a compression of ideas you can already hold, and that if you meet the ' +
    'idea first and the symbol second, the symbol stops being frightening. Every unit here starts ' +
    'with something you can move with your hands.'));

  wrap.append(P(
    'The second reason is less comfortable. Statistics is how modern arguments are made, and a ' +
    'population that cannot read a claim about itself is easy to lie to. Not with fabricated ' +
    'numbers, usually. With true numbers, framed. A cropped axis, a chosen denominator, a ' +
    'comparison group picked after the fact. Those techniques are not advanced, and they are not ' +
    'rare, and you should not need a graduate degree to catch them.'));

  wrap.append(el('h2', null, 'How it is built'));
  wrap.append(P(
    'Everything runs in your browser. There is no account, no tracking, no analytics, and nothing ' +
    'to buy. Every simulation runs in a numbered world, so a teacher can tell a room to type the ' +
    'same number and every screen will match, and so a surprising result can be found again ' +
    'rather than lost to a reshuffle.'));

  wrap.append(P(
    'The whole thing is open source. If an explanation is wrong, or a screen makes you feel ' +
    'small, that is a defect worth reporting, and it will be treated as one.'));

  wrap.append(el('h2', null, 'Who made it'));
  wrap.append(P(
    'Ian Helfrich, an economist who spent a decade watching bright people decide they were bad ' +
    'at a subject they were simply never shown properly.'));

  const btn = el('button', 'ec-btn', 'Start at the beginning');
  btn.addEventListener('click', () => go('01-noticing'));
  wrap.append(btn);

  root.append(wrap);
}
