# Bug Report Router

A local prototype for first-time open-source contributors. It suggests a starting checklist from a short English issue description and lets the user override the suggestion.

Run `python3 -m http.server 8878 --bind 127.0.0.1` from this directory, then open http://127.0.0.1:8878/. There are no runtime packages, remote model calls, or accounts.

The browser trains a small multinomial Naive Bayes classifier from the original synthetic examples in `router.mjs`. Only known terms contribute to a suggestion. When fewer than two distinct known terms match or the top two scores are close, the model abstains. The UI shows terms that contributed in favor of the suggested queue. It does not estimate calibrated probability. The model ignores terms after a few explicit denial patterns within a clause. Other negation patterns and unfamiliar project vocabulary can still confuse it. Run `node --test evaluation/negation.test.mjs` for the targeted regression cases.

OpenAI Codex assisted the concept, implementation, and local checks. The examples use synthetic reports and no third-party dataset. The app does not create issues, execute commands, persist descriptions, or transmit them.

## Replay the demo

Open the [live app](https://estona815.github.io/bug-report-router/) or watch the [captioned walkthrough](https://github.com/estona815/bug-report-router/releases/tag/first-ai-app-2026-demo).

1. Paste `The compiler reports a syntax error in the generated artifact.` and select **Suggest a checklist**. The app suggests **Build**, shows matching words, and displays three steps.
2. Replace the text with `It does not work.` and ask again. The app asks for a concrete symptom and clears the previous checklist.
3. Select **Runtime** manually. The app attributes the choice to you and displays the Runtime checklist.
4. Try `No syntax error or linker failure.` and ask again. The app defers instead of treating the denied symptoms as a Build report.

## Evaluation

See the browser's [build suggestion](demo/01-build-suggestion.png), [request for a concrete symptom](demo/02-asks-for-symptom.png), and [manual runtime selection](demo/03-manual-override.png).

Run `node evaluation/compare.mjs` to reproduce the comparison on 32 held-out synthetic reports. The model correctly routed 20 of 24 clear reports, deferred four, and abstained on all eight ambiguous cases. A keyword vote built from the same training set correctly routed 21 clear reports, made one wrong clear routing, and routed four ambiguous reports. The dataset is small, synthetic, and prepared by the same development process as the training examples. These results do not measure performance on real user reports.
