import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { queues, suggest } from '../router.mjs';

const cue = { install: 'setup', build: 'build', crash: 'runtime', documentation: 'documentation' };
function baseline(report) {
  const matches = new Set((report.toLowerCase().match(/[a-z]+/g) || []).map(word => cue[word]).filter(Boolean));
  return matches.size === 1 ? [...matches][0] : 'abstain';
}

const labelSets = new Map();
for (const [label, { examples: training }] of Object.entries(queues)) {
  for (const word of new Set(training.flatMap(report => report.toLowerCase().match(/[a-z]+/g) || []))) {
    if (!labelSets.has(word)) labelSets.set(word, new Set());
    labelSets.get(word).add(label);
  }
}
function trainingKeywordVote(report) {
  const scores = Object.fromEntries(Object.keys(queues).map(label => [label, 0]));
  for (const word of new Set(report.toLowerCase().match(/[a-z]+/g) || [])) {
    const labels = labelSets.get(word);
    if (labels?.size === 1) scores[[...labels][0]]++;
  }
  const [first, second] = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return first[1] >= 2 && first[1] > second[1] ? first[0] : 'abstain';
}

const examples = new Set(Object.values(queues).flatMap(queue => queue.examples));
const rows = readFileSync(new URL('./cases.tsv', import.meta.url), 'utf8').trim().split('\n')
  .map(line => {
    const [expected, report] = line.split('\t');
    assert.ok(report && !examples.has(report.toLowerCase()));
    return { expected, report, model: suggest(report)?.queue || 'abstain', baseline: baseline(report), trainingKeywords: trainingKeywordVote(report) };
  });
assert.equal(rows.length, 32);
assert.equal(new Set(rows.map(row => row.report)).size, 32);

function summarize(column) {
  const counts = { correctRoutes: 0, wrongRoutes: 0, abstainedOnClear: 0, correctAbstentions: 0, routedAmbiguous: 0 };
  const perLabel = {};
  for (const { expected, [column]: actual } of rows) {
    const bucket = expected === 'abstain'
      ? (actual === expected ? 'correctAbstentions' : 'routedAmbiguous')
      : (actual === 'abstain' ? 'abstainedOnClear' : actual === expected ? 'correctRoutes' : 'wrongRoutes');
    counts[bucket]++;
    perLabel[expected] ??= {};
    perLabel[expected][actual] = (perLabel[expected][actual] || 0) + 1;
  }
  return { ...counts, perLabel };
}
console.log(JSON.stringify({ count: rows.length, model: summarize('model'), baseline: summarize('baseline'), trainingKeywords: summarize('trainingKeywords'), cases: rows }, null, 2));
