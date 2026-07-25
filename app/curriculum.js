/* curriculum.js
   The spine of the whole course: what we teach, in what order, and the one question
   each unit answers. The site reads this file to build its map, so this list and the
   book are never out of sync.

   `status` is honest about what exists: 'ready' means a reader can do it today. */

export const UNITS = [
  {
    id: '01-noticing', no: 1, status: 'ready', minutes: 15,
    title: 'Noticing is measuring',
    question: 'Which of these two groups is bigger, and how sure can I be?',
    installs: 'Comparison by eye is already estimation. Uncertainty is a feeling before it is a number.',
    lies: 'The same gap, drawn on a cropped axis, can be made to look like a crisis.',
  },
  {
    id: '02-counting', no: 2, status: 'soon', minutes: 15,
    title: 'Counting, the first technology',
    question: 'What is a number actually for?',
    installs: 'Tallies, grouping, place value. Counting as a way of not having to remember.',
    lies: 'What gets counted is a choice, and the choice is where the argument hides.',
  },
  {
    id: '03-measure', no: 3, status: 'soon', minutes: 18,
    title: 'Putting numbers on the world',
    question: 'How do I turn something real into something I can compare?',
    installs: 'Units, scales, precision, and the difference between a count and a measure.',
    lies: 'Change the unit, change the feeling: per capita, per dollar, per year.',
  },
  {
    id: '04-piles', no: 4, status: 'soon', minutes: 18,
    title: 'Piles and shapes',
    question: 'What does a whole group of numbers look like at once?',
    installs: 'A distribution is a picture of a crowd. Shape carries meaning before any summary does.',
    lies: 'Bin width is a dial, and someone is always turning it.',
  },
  {
    id: '05-middle', no: 5, status: 'soon', minutes: 16,
    title: 'The middle of a crowd',
    question: 'Where does a group sit?',
    installs: 'Mean and median as two honest answers to different questions.',
    lies: 'Average income versus typical income: the oldest trick in the book.',
  },
  {
    id: '06-spread', no: 6, status: 'soon', minutes: 18,
    title: 'How spread out is it?',
    question: 'Is this group tight or loose, and why does that matter more than the middle?',
    installs: 'Range, quartiles, and the standard deviation as a typical distance from the middle.',
    lies: 'Reporting a centre with no spread is a half-truth with a clean face.',
  },
  {
    id: '07-chance', no: 7, status: 'soon', minutes: 20,
    title: 'The machinery of chance',
    question: 'What does it mean to say something is likely?',
    installs: 'Probability as long-run frequency, built by hand from repeated play.',
    lies: 'Rare things happen constantly, because there are so many chances for them to.',
  },
  {
    id: '08-bell', no: 8, status: 'soon', minutes: 20,
    title: 'Why this shape keeps showing up',
    question: 'Why is so much of the world bell-shaped?',
    installs: 'Adding up many small independent nudges produces the same curve every time.',
    lies: 'Assuming a bell where the world has a long tail is how models miss disasters.',
  },
  {
    id: '09-sampling', no: 9, status: 'soon', minutes: 18,
    title: 'Asking a few to learn about many',
    question: 'How can 1,000 people tell you about 300 million?',
    installs: 'Random sampling, and why representativeness beats size.',
    lies: 'A huge biased sample is worse than a small fair one, and it looks more convincing.',
  },
  {
    id: '10-wobble', no: 10, status: 'soon', minutes: 18,
    title: 'The wobble',
    question: 'If I did this study again, how different would the answer be?',
    installs: 'The standard error, felt first as bounce, then named. The square-root rule.',
    lies: 'A number quoted without its wobble is a guess wearing a suit.',
  },
  {
    id: '11-range', no: 11, status: 'soon', minutes: 18,
    title: 'The honest range',
    question: 'What is the widest claim I am entitled to make?',
    installs: 'Confidence intervals as a promise about the method, not about one interval.',
    lies: 'Point estimates in the headline, intervals in the footnote.',
  },
  {
    id: '12-trial', no: 12, status: 'soon', minutes: 20,
    title: 'Putting a claim on trial',
    question: 'Is this gap real, or is it luck?',
    installs: 'Gap versus wobble. Null hypotheses, p-values, and the two ways to be wrong.',
    lies: 'Significant and important are different words for a reason.',
  },
  {
    id: '13-together', no: 13, status: 'soon', minutes: 18,
    title: 'Two things at once',
    question: 'When one thing moves, does the other?',
    installs: 'Association, correlation, and what a scatterplot can and cannot say.',
    lies: 'Correlation gets dressed up as cause every single day, usually by accident.',
  },
  {
    id: '14-line', no: 14, status: 'soon', minutes: 22,
    title: 'The line through the cloud',
    question: 'Can I summarise a relationship with one line, and should I?',
    installs: 'Least squares as the smallest total miss. Slope as a rate you can say out loud.',
    lies: 'Extrapolating past the edge of your data is where forecasts go to die.',
  },
  {
    id: '15-cause', no: 15, status: 'soon', minutes: 22,
    title: 'What actually caused what',
    question: 'How do I tell a cause from a coincidence?',
    installs: 'Confounding, comparing like with like, and the counterfactual question.',
    lies: 'The lurking variable is the most common lie in public statistics.',
  },
  {
    id: '16-designed', no: 16, status: 'soon', minutes: 22,
    title: 'Designed comparisons',
    question: 'How do you build a study that can actually answer the question?',
    installs: 'Randomised trials, before-and-after, and difference-in-differences.',
    lies: 'A comparison group chosen after the fact can be chosen to win.',
  },
  {
    id: '17-models', no: 17, status: 'soon', minutes: 22,
    title: 'Maps of the world',
    question: 'What is a model, and when should I trust one?',
    installs: 'Models as deliberate simplifications, judged by what they get right and where they fail.',
    lies: 'Every model has assumptions; the dangerous ones are the unstated assumptions.',
  },
  {
    id: '18-rhetoric', no: 18, status: 'soon', minutes: 20,
    title: 'Telling the truth with numbers',
    question: 'How do I say something true, clearly, without misleading anyone, including myself?',
    installs: 'The full toolkit turned around: reading claims, and writing honest ones.',
    lies: 'This whole unit is the thread of the book, pulled tight.',
  },
];

export const READY = UNITS.filter(u => u.status === 'ready');

export function unitById(id) {
  return UNITS.find(u => u.id === id) || null;
}
