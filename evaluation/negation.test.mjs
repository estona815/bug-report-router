import assert from 'node:assert/strict';
import test from 'node:test';
import { suggest } from '../router.mjs';

test('explicitly denied symptoms do not trigger routing', () => {
  for (const report of [
    'No syntax error or linker failure.',
    'The issue is not a syntax error, compiler failure, or build failure.',
    'No permission denied, no missing dependency, and no installation problem.',
  ]) assert.equal(suggest(report), null, report);
});

test('a positive symptom after a contrast still routes', () => {
  assert.equal(suggest('No error appears, but the app freezes after clicking save.').queue, 'runtime');
  assert.equal(suggest('No compiler error. The app crashes when opening a screen.').queue, 'runtime');
});

test('command not found still describes an actionable failure', () => {
  assert.equal(suggest('The terminal says the command was not found after install.').queue, 'setup');
});
