# Revenue Intelligence Inbox

A local manager workspace for reviewing the supplied call and meeting records, tracing evidence, routing follow-ups, and exporting the current decisions.

## Run locally

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Build a static production bundle with `npm run build`; output goes to `dist/`.

## Replay the supplied batches

The app opens with an empty workspace. Open **Imports & Replay History** to load the sample batches embedded in `src/data/bundledBatches.js` or upload the supplied JSON files. Imported records and manager changes persist in this browser's local storage.

1. The app starts empty. If a previous replay is still present, click **Clear all data** first; then click **Load 01_initial.json**. Expect 44 unique source records and 17 with usable text.
2. Load the initial batch again. The duplicate batch ID should be skipped without adding records.
3. Open M07 and save a manager route override with a reason.
4. Load **02_update.json**. Expect 44 records, 18 with usable text, and M07 at revision 2 with its manager route preserved and analysis marked for review.
5. Load the initial batch again. Revision 1 should not replace M07 revision 2.
6. Refresh. Source records, statuses, manager routes, activity, and next-action checkmarks persist in this browser's local storage.

## Metric and evidence rules

- **Source records:** 44 records in the supplied extract: 30 call records and 14 meeting records.
- **Usable text:** 17/44 initially, increasing to 18/44 after the M07 update. The other 26 have no usable conversation text in this extract; that does not establish whether an interaction happened.
- **Needs review:** records in `New` or `In review`. Records with no usable text are shown separately as `Unusable text` unless a reviewer changes their state.
- **Priority:** records without usable text are `Unassessed`; missing text is not treated as evidence of low urgency.
- **People:** call names come from the source rep field. Meeting names come from the organizer field, which does not establish who attended or spoke. C06 also has a source rep-name/transcript mismatch called out on its detail page.
- **Meeting duration:** shown as source duration, not confirmed attendance time. Source meeting status is described as reported metadata, not proof the meeting occurred or was cancelled.
- **Analysis:** the 18 text-bearing records use pre-generated summaries, citations, route suggestions, and follow-up actions in `src/data/analysisData.js`. Analysis joins use `(source_type, source_id)`. Import, deduplication, revision ordering, stale flags, manager overrides, filters, metrics, and exports run locally in the browser.
- **M07 update:** usable text arrives in revision 2. The app flags the record for review and asks the manager to inspect the new transcript before relying on the pre-generated summary or route.
- **Pipeline:** the app does not invent deal values, win probabilities, or performance rankings.

## Findings highlighted in the app

1. **Willowfield Trust (M07):** four customer-reported product behaviors need investigation. The attachment workaround does not resolve the reported direct-upload problem. See M07 Turns 13 and 15.
2. **Cedarwave Distribution (M04):** the customer says moving from prepaid to credit is the main issue (Turn 11) and describes an existing INR 1.3 crore corporate credit line (Turn 22). Confirm the eligible bank-card feed before proposing a route.
3. **Asterloom Systems (M03):** the customer questions INR 26,000 versus INR 39,000 (Turn 23); the seller separates the INR 26,000 recurring annual subscription from the INR 13,000 one-time integration setup (Turn 24).

## Exports

**Download complete export (.zip)** creates one JSON file for each active route plus `manifest.json`. Manifest file paths are relative to the ZIP root. A standalone manifest or route JSON can also be downloaded from the Exports page. The download is generated from the current local state; no generated export is checked into this repository.

## Submission items to complete outside the app

The checked-in app does not include the assignment's five-slide presentation or the requested three-minute narrated walkthrough. Create those from the final reviewed state, and include the generated ZIP if required by the submission instructions. The narration must show the import replay, three evidence-backed findings, one rejected decision, and actual time spent and limitations.

**AI assistance disclosure:** Codex was used in this review pass to audit source evidence and revise the UI, evidence handling, replay behavior, filtering, persistence, and exports. Add any earlier AI use and confirm this describes the full project history before submitting.

**Time spent:** The earlier draft listed approximately 8 hours. Confirm or replace that estimate with the actual total before submitting.
