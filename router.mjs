export const queues = {
  setup: {
    examples: [
      'installer cannot find dependency', 'terminal command not found after install',
      'missing package while installing', 'permission denied during installation',
      'environment setup cannot find executable', 'dependency missing from environment path',
    ],
    checklist: ['Record your OS and tool version.', 'Confirm how you installed the tool and which command is missing.', 'Check the installation instructions for prerequisites and PATH setup.'],
  },
  build: {
    examples: [
      'compiler fails with syntax error', 'build compile step fails',
      'bundler cannot resolve module import', 'compilation fails at linker stage',
      'build output missing generated artifact', 'compiler reports type error during build',
    ],
    checklist: ['Identify the build command and the first error.', 'Note the file and line or build step involved.', 'Try the smallest build that reproduces it.'],
  },
  runtime: {
    examples: [
      'app crashes when opening a screen', 'request timeout while server is running',
      'application freezes after clicking save', 'process crashes after launch',
      'button click returns runtime exception', 'running application produces wrong result',
    ],
    checklist: ['Record what you clicked or entered and what happened.', 'Capture the error and whether it happens every time.', 'Describe what you expected to happen.'],
  },
  documentation: {
    examples: [
      'readme link broken in documentation', 'guide example is outdated',
      'tutorial instructions contradict documentation', 'documentation missing steps in guide',
      'readme typo in installation instructions', 'documentation example uses old option',
    ],
    checklist: ['Link to the relevant page and section.', 'Quote the confusing line or outdated example.', 'Explain what would make it clearer.'],
  },
};

const tokens = text => text.toLowerCase().match(/[a-z]+/g) || [];
const ignored = new Set('a after an and at before during from in is it of on the to when while with'.split(' '));
const meaningful = text => tokens(text).filter(word => !ignored.has(word));
const models = Object.entries(queues).map(([queue, { examples }]) => {
  const words = examples.flatMap(meaningful);
  const counts = new Map();
  for (const word of words) counts.set(word, (counts.get(word) || 0) + 1);
  return { queue, counts, total: words.length };
});
const vocabulary = new Set(models.flatMap(model => [...model.counts.keys()]));

export function suggest(text) {
  // Explicit denials are not evidence for that symptom. Retain ordinary
  // failure descriptions such as "command not found".
  const positiveClauses = text.toLowerCase().split(/[.!?;]|\b(?:but|however|instead)\b/)
    .map(clause => clause.split(/\b(?:no|without|not an?|not the)\b/, 1)[0]);
  const words = [...new Set(positiveClauses.flatMap(meaningful))].filter(word => vocabulary.has(word));
  if (words.length < 2) return null;

  const scoreWord = (model, word) => Math.log(
    ((model.counts.get(word) || 0) + 1) / (model.total + vocabulary.size),
  );
  const ranked = models.map(model => ({
    model,
    score: words.reduce((sum, word) => sum + scoreWord(model, word), 0),
  })).sort((left, right) => right.score - left.score);
  const [best, next] = ranked;
  if (best.score - next.score < Math.log(2)) return null;

  const evidence = words.map(word => ({
    word,
    gain: scoreWord(best.model, word) - scoreWord(next.model, word),
  })).filter(item => item.gain > 0).sort((left, right) => right.gain - left.gain);
  return { queue: best.model.queue, evidence: evidence.slice(0, 3).map(item => item.word) };
}
