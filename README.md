# Bug Report Router

A local prototype for first-time open-source contributors. It suggests a starting checklist from a short English issue description and lets the user override the suggestion.

Run `python3 -m http.server 8878 --bind 127.0.0.1` from this directory, then open http://127.0.0.1:8878/. There are no runtime packages, remote model calls, or accounts.

The browser trains a small multinomial Naive Bayes classifier from the original synthetic examples in `router.mjs`. Only known terms contribute to a suggestion. When fewer than two distinct known terms match or the top two scores are close, the model abstains. The UI shows terms that contributed in favor of the suggested queue. It does not estimate calibrated probability. Negation and unfamiliar project vocabulary can confuse it.

OpenAI Codex assisted the concept, implementation, and local checks. The examples use synthetic reports and no third-party dataset. The app does not create issues, execute commands, persist descriptions, or transmit them.

## Demo and evaluation

See the browser's [build suggestion](demo/01-build-suggestion.png), [request for a concrete symptom](demo/02-asks-for-symptom.png), and [manual runtime selection](demo/03-manual-override.png).

Run `node evaluation/compare.mjs` to reproduce the comparison on 32 held-out synthetic reports. The model correctly routed 20 of 24 clear reports, deferred four, and abstained on all eight ambiguous cases. A keyword vote built from the same training set correctly routed 21 clear reports, made one wrong clear routing, and routed four ambiguous reports. The dataset is small, synthetic, and prepared by the same development process as the training examples. These results do not measure performance on real user reports.
