import { queues, suggest } from './router.mjs';

const form = document.querySelector('#report');
const summary = document.querySelector('#summary');
const queue = document.querySelector('#queue');
const result = document.querySelector('#result');
const checklist = document.querySelector('#checklist');

function showChecklist() {
  const steps = queues[queue.value]?.checklist || [];
  checklist.replaceChildren(...steps.map(step => {
    const item = document.createElement('li');
    item.textContent = step;
    return item;
  }));
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const suggestion = suggest(summary.value);
  queue.value = suggestion?.queue || '';
  result.textContent = suggestion
    ? `Suggested: ${queue.selectedOptions[0].text}. Matching words: ${suggestion.evidence.join(', ')}.`
    : 'Describe one concrete symptom or choose a checklist below.';
  showChecklist();
});

summary.addEventListener('input', () => {
  queue.value = '';
  result.textContent = 'The report changed. Ask for a new suggestion or choose a checklist.';
  showChecklist();
});

queue.addEventListener('change', () => {
  result.textContent = queue.value
    ? `Selected by you: ${queue.selectedOptions[0].text}.`
    : 'Choose a checklist or ask for a suggestion.';
  showChecklist();
});
