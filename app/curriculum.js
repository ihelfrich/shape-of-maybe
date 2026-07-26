/* curriculum.js
   The spine of the whole course as data: what we teach, in what order, and the one
   question each unit answers. The map screen is built from this list, so the site and
   the book cannot drift. The argument for the ordering lives in docs/CURRICULUM.md. */

/* The six parts a unit can sit under. A lesson module passes its part through as the
   `unit` field on its default export, and the map uses it as a section heading. */
export const PARTS = [
  { id: 'I', title: 'Before the symbols' },
  { id: 'II', title: 'The shape of a group' },
  { id: 'III', title: 'Chance, and the sample' },
  { id: 'IV', title: 'What you are entitled to say' },
  { id: 'V', title: 'Two things, and why' },
  { id: 'VI', title: 'Saying it out loud' },
];

/* `status` is honest about what exists: 'ready' means a reader can do it today, and
   anything else shows on the map as being built. `no` is the position in the course and
   must match the order of this array. */
export const UNITS = [
  {
    id: '01-noticing', no: 1, part: 'I', status: 'ready', minutes: 20,
    title: 'Bigger, smaller, how sure',
    question: 'How do I know one pile is bigger than another, and how sure am I?',
    installs: 'You can see "more" without counting, up to about four things. Where the eye gives up is where counting was invented.',
    lies: 'The same true gap, drawn on a cropped axis, reads as a crisis.',
  },
  {
    id: '02-numbers', no: 2, part: 'I', status: 'soon', minutes: 18,
    title: 'What a number leaves out',
    question: 'How do I put a number on something real, and what does the number cost?',
    installs: 'You ask what was thrown away when the world was compressed into a figure, and you ask "per what" every time.',
    lies: 'Change the denominator, change the villain. Both orderings are true.',
  },
  {
    id: '03-pile', no: 3, part: 'II', status: 'soon', minutes: 18,
    title: 'The pile',
    question: 'What does a whole group of numbers look like at once?',
    installs: 'You read a distribution as a picture of a crowd, and you read its shape before you compute anything.',
    lies: 'Bin width is a dial, and someone is always turning it.',
  },
  {
    id: '04-middle', no: 4, part: 'II', status: 'soon', minutes: 16,
    title: 'The middle',
    question: 'Where does this crowd sit?',
    installs: 'The mean is where the beam balances. The median is the middle one. You can say which question each of them answers.',
    lies: 'Average income against typical income, both correct, thousands apart.',
  },
  {
    id: '05-spread', no: 5, part: 'II', status: 'soon', minutes: 20,
    title: 'The spread',
    question: 'Is this crowd tight or loose, and why does that matter more than the middle?',
    installs: 'You find the standard deviation by dragging a bracket out from the middle, and only then write it down as four instructions.',
    lies: 'A center quoted with no spread is a half-truth with a clean face.',
  },
  {
    id: '06-chance', no: 6, part: 'III', status: 'soon', minutes: 22,
    title: 'The machinery of chance',
    question: 'What does "likely" actually mean, and can I work one out?',
    installs: 'You build a probability out of repetition rather than being handed one, and you count a conditional in a table before dividing anything.',
    lies: "The prosecutor's fallacy: a conditional flipped round changes the answer by orders of magnitude.",
  },
  {
    id: '07-sampling', no: 7, part: 'III', status: 'soon', minutes: 20,
    title: 'A few, for many',
    question: 'How can 1,000 people tell you about 300 million?',
    installs: 'You can say what random selection buys you, and why a representative sample beats a large one.',
    lies: 'A huge biased sample is worse than a small fair one, and it looks more convincing.',
  },
  {
    id: '08-wobble', no: 8, part: 'III', status: 'soon', minutes: 24,
    title: 'The wobble',
    question: 'If I did this study again, how different would the answer be?',
    installs: 'You build one estimate a thousand times and watch it land in a shape of its own. That spread is the standard error, and it shrinks with the square root of n.',
    lies: 'A number quoted without its wobble is a guess wearing a suit.',
  },
  {
    id: '09-bell', no: 9, part: 'III', status: 'soon', minutes: 22,
    title: 'Why this shape keeps coming back',
    question: 'Why does the same curve turn up everywhere, and when does it not?',
    installs: 'Many small independent nudges, added up, give the same curve whatever the nudges looked like. You also break it, which is the half nobody gets taught.',
    lies: 'Assuming a bell where the world has a long tail is how models miss disasters.',
  },
  {
    id: '10-range', no: 10, part: 'IV', status: 'soon', minutes: 20,
    title: 'The honest range',
    question: 'What is the widest claim I am entitled to make?',
    installs: 'An interval is a promise about the method, not about the one interval in front of you.',
    lies: 'Point estimate in the headline, interval in the footnote.',
  },
  {
    id: '11-trial', no: 11, part: 'IV', status: 'soon', minutes: 24,
    title: 'Putting a claim on trial',
    question: 'Is this gap real, or could luck have done it?',
    installs: 'Shuffle the labels a few thousand times and you have built the world where nothing is going on. The p-value is a position in that pile.',
    lies: 'Significant and important are different words for a reason.',
  },
  {
    id: '12-together', no: 12, part: 'V', status: 'soon', minutes: 20,
    title: 'Two things at once',
    question: 'When one thing moves, does the other?',
    installs: 'You read direction, form and strength off a scatter, and you can say what the single number r cannot see.',
    lies: 'Pick the start year and the end year and the same data gives you either sign.',
  },
  {
    id: '13-third', no: 13, part: 'V', status: 'soon', minutes: 22,
    title: 'The third thing',
    question: 'How do I tell a cause from a coincidence?',
    installs: 'You can name a specific third variable behind a specific claim, and say what evidence would rule it out. That beats reciting the slogan.',
    lies: 'The lurking variable is the commonest falsehood in public statistics, and almost nobody involved is lying.',
  },
  {
    id: '14-line', no: 14, part: 'V', status: 'soon', minutes: 26,
    title: 'The line, and what a model is',
    question: 'Can one line stand in for a cloud, and how would I know when it stops working?',
    installs: 'You hunt for the smallest total miss by hand before anyone calls it least squares, and you read a slope aloud as a rate.',
    lies: 'A model scored on the same data it was tuned on will always look good.',
  },
  {
    id: '15-designed', no: 15, part: 'V', status: 'soon', minutes: 24,
    title: 'Designed comparisons',
    question: 'How do you build a study that can actually settle a causal question?',
    installs: 'Randomising balances variables nobody measured and nobody thought of, on average and in groups large enough. Difference-in-differences is two subtractions where one was not enough.',
    lies: 'A comparison group chosen after the fact can be chosen to win.',
  },
  {
    id: '16-rhetoric', no: 16, part: 'VI', status: 'soon', minutes: 20,
    title: 'Telling the truth with numbers',
    question: 'How do I say something true, clearly, without misleading anyone, including myself?',
    installs: 'You pull every lever from the earlier units on purpose, then write the honest version of the same finding.',
    lies: 'The most misleading chart you will ever make is the one your software offered as a default.',
  },
];

export const READY = UNITS.filter(u => u.status === 'ready');

export function unitById(id) {
  return UNITS.find(u => u.id === id) || null;
}

/* Units grouped under their part, in course order. Parts with nothing in them are
   dropped so the map never renders an empty heading. */
export function byPart() {
  return PARTS
    .map(p => ({ ...p, units: UNITS.filter(u => u.part === p.id) }))
    .filter(p => p.units.length > 0);
}
