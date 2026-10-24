# Editorial Redesign — QA Fixes & Verification Ledger

**Date:** 2026-10-21  
**Task:** `01_01-agent`  
**Workspace:** `C:/Project/portfolio`  
**Status:** All assigned source fixes and follow-up Presentation reader fixes implemented and verified; typecheck, build, Playwright 25/25 regression, and full a11y-loop audit passed. **The raw accessibility CLI gate remains nonzero (5 raw violations, 3,699 needsReview)**; this is not a clean-audit or conformance claim.

## 1. Current verification results

These results supersede the earlier independent-QA report. Existing redesign changes were already present in the working tree; no commit, push, dependency update or unrelated source edit was made by this fix task.

| Gate                             | Fresh result                                                                                                                                                                                                                                                                                                | Evidence under `.crew/artifacts/editorial-verification/` |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `npm run check`                  | Exit 0; **0 errors, 0 warnings**                                                                                                                                                                                                                                                                            | `fix-check.log`                                          |
| `npm run build`                  | Exit 0; adapter-static wrote `build`                                                                                                                                                                                                                                                                        | `fix-build.log`                                          |
| Fresh production preview         | Started after build at `http://127.0.0.1:4181`, strict port; (IMPORTANT: old port 4180 stale immutable chunks cause hydration failures; port 4181 detected and used)                                                                                                                                        | `final-preview.log`                                      |
| Playwright functional regression | Exit 0; **25 passed, 0 failed, 0 known issues, 0 stale known issues, 0 runtime/console errors**                                                                                                                                                                                                             | `final-regression/regression.json`                       |
| Full a11y-loop fix run 1         | Exit 1; **5 violations, 3,723 needsReview, 0 best-practice, 13 manual checks**                                                                                                                                                                                                                              | `a11y-fix-run-1.json`, `a11y-fix-run-1.log`              |
| Full a11y-loop fix run 2         | Exit 1; **5 violations, 3,719 needsReview, 0 best-practice, 13 manual checks**                                                                                                                                                                                                                              | `a11y-fix-run-2.json`, `a11y-fix-run-2.log`              |
| Full a11y-loop final run         | Exit 1; **5 violations, 3,699 needsReview, 0 best-practice, 13 manual checks**                                                                                                                                                                                                                              | `final-a11y.json`                                        |
| Fix-run-2 → final diff           | Exit 0; **0 fixed violations, 5 remaining, none introduced** (the Presentation reader `role="region"` fix removes all 20 `aria-prohibited-attr` needsReview rows)                                                                                                                                           | `final-diff.log`                                         |
| Original baseline → final diff   | Exit 1; **21 fixed, 4 remaining, 1 NEW raw violation**, plus 21 new needsReview rows. The NEW violation is the same static privacy note with a changed `nth-of-type` selector after the error paragraph moved into a div; **not** a newly introduced message behaviour. Do not describe this diff as green. | `a11y-baseline-to-fix.log`                               |

The original retained `a11y-run-1.json` recorded 28 violations and 3,737 needsReview rows. It is historical evidence, not a current clean result. Different runs can sample entry motion differently; the final fix audits agree on all five remaining violation fingerprints.

### Coverage actually driven

- CLI: **a11y-loop 0.4.1**, **axe-core 4.14.0** (Deque Systems, MPL-2.0), Chromium **156.0.8078.4**. W3C WCAG success criteria are the requirements; engine rules are detection mechanisms.
- Five automatic baseline passes: default 1280×720, dark, forced-colors, reduced-motion and 320×256 reflow.
- All **42 interaction states** exported by the unchanged `scripts/a11y-states.mjs` ran against `http://127.0.0.1:4181`. The report's `tool.statesRun` is the exact inventory. Interaction states run in the default pass, with explicit narrow states where defined; this is **not** a claim that all 42 interactions ran in every baseline mode.
- For each MS/EN language: home; search results and no-results; Story chapters 1–5; project detail; project no-results; 320px mobile menu; mocked contact error and success (**26 states**).
- Additional explicit 320px states for MS/EN search results/no-results, Story chapters 1–5 and project detail (**16 states**).
- Functional regressions also exercise desktop 1440px, mobile 390px and narrow 320px, overflow, native modal focus/scroll-lock contracts, project filtering, motion pause/resume, mocked form failures/success, branding metadata and image dimensions.

## 2. Resolved source bug ledger

| ID / finding                                                                                                                       | Source change                                                                                                                                                                                                                            | Evidence                                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D1 — populated search consumes first Escape** · SC 2.1.1 Keyboard (A)                                                            | `src/lib/JarvisHUD.svelte`: search input handles Escape before the native search-input default, prevents it, closes through the shared close function and restores the actual opener. Composition is not interrupted.                    | Both MS/EN ordinary regression tests assert one Escape hides the populated dialog, restores `.search-button` focus and releases scroll lock. No knownIssue descriptor remains on these tests. CLI baseline→final diff marks `dialog-escape-does-not-close` fixed.                                              |
| **D2 — label-in-name** · SC 2.5.3 Label in Name (A), axe `label-content-name-mismatch`                                             | `src/routes/+layout.svelte`: logo names begin `M. Di Sebalik Sistem` / `M. Behind the System`; language names contain `BM / EN`. `src/lib/Projects.svelte`: case-study names begin the complete visible `PDF ↗` before document context. | Both MS/EN ordinary label-in-name regressions pass with the original offender assertion preserved. Baseline→final CLI diff marks the logo, language button and two PDF link violation rows fixed.                                                                                                              |
| **Experience tags use prohibited label on generic div**                                                                            | `src/lib/Experience.svelte`: labelled `ul` containing `li.tag`; flex/gap layout retained with explicit list-style, margin and padding resets.                                                                                            | Final report no longer contains the Experience tags' `aria-prohibited-attr` rows.                                                                                                                                                                                                                              |
| **Search results and project detail scroll area use generic labelled divs**                                                        | `src/lib/JarvisHUD.svelte` and `src/lib/Projects.svelte`: named scrollable containers now have `role="region"`. Keyboard scrolling behaviour remains unchanged.                                                                          | Final report has no `aria-prohibited-attr` rows for either container; project detail fix removed four review rows between fix audits.                                                                                                                                                                          |
| **Contact live region mounted only with error**                                                                                    | `src/lib/Contact.svelte`: empty `role="alert" aria-atomic="true"` container exists before submission; conditional error paragraph is inserted inside it, not used as the live-region container.                                          | MS/EN contact regressions assert the container is initially empty and the same DOM node receives the first error. Mocked network error, service rejection and success flows pass. Final report has no `live-region-injected-late` rows. Actual spoken announcement still requires NVDA/VoiceOver confirmation. |
| **Hero/model intro fades actual text and controls** · SC 1.4.3 Contrast (Minimum) (AA), axe `color-contrast` · ACT afw4f7 / 09o5cg | `src/lib/Hero.svelte`: removed opacity endpoints from shared `arrive`; retained 18px translate entry, delay, pause and reduced-motion behaviour. No ancestor of real text/control is faded.                                              | Regression inspects both entry animations' keyframes for opacity 1 throughout, distinct transforms and settled muted-text ratios ≥4.5:1. The final CLI has **zero color-contrast violations** (uncertain contrast review rows remain below).                                                                   |
| **Story reader prohibited label and cancel handling** · SC 4.1.2 Name, Role, Value (A), SC 2.1.2 No Keyboard Trap (A)              | `src/lib/Presentation.svelte`: `<div class="reader" role="region" bind:this={reader} use:keyboardScrollRegion aria-label={…}>` gives reader region semantics; `<dialog>` has `oncancel` preventing default and invoking `close()`.       | All 20 `aria-prohibited-attr` needsReview rows eliminated in `final-a11y.json`. Browser verification confirms reader region, focus restore to `.hero-btn-pres`, and immediate Escape dismissal after focused details or chapter controls.                                                                      |

`src/lib/NeuralCortexCanvas.svelte` was reviewed but did not need an edit: the actual text/control fade came from its `.hero-object` ancestor in Hero. Its existing `.14` opacity is only the decorative SVG shadow ellipse. Decorative SVG/text remains accompanied by the readable DOM layer key; no new decorative fade was added.

**Accessible-name wording is DRAFT pending human confirmation:** the approved visible brand/language/PDF strings are preserved in the revised names, but a human should confirm bilingual wording and announcement verbosity. No alt text was authored in this task.

## 3. Five remaining raw violation rows — not hidden or suppressed

### Three keyboard survey-budget artifacts

Rule: `keyboard-unreachable` · SC 2.1.1 Keyboard (A), a11y-loop inferred/reduced confidence.

| Fingerprint    | Element               | Independent one-walk evidence |
| -------------- | --------------------- | ----------------------------- |
| `e27c6fda0308` | `#contact-message`    | Receives focus on **Tab 61**  |
| `764d8d4a5405` | Contact submit button | Receives focus on **Tab 62**  |
| `5408036e095d` | `.footer-name`        | Receives focus on **Tab 63**  |

The CLI explicitly says its walk exhausted all **60** presses without wrapping. The ordinary regression `keyboard: one Tab walk reaches the contact form and footer` starts at the page and records `{"message":61,"submit":62,"footer":63}` in regression logs; it asserts focus never falls to body and all three destinations are reached in order. This is evidence of the survey budget, not a reason to remove controls or alter tab order. The raw report is retained unchanged.

### Two static-language-setup classification artifacts

Rule: `status-message-not-announced` · SC 4.1.3 Status Messages (AA), a11y-loop inferred.

- `ce4febf11740`: `#contact-form > p.required-note...nth-of-type(2)` — “Fields marked \* are required.”
- `1a6d79349069`: `#contact-form > p.privacy-note...nth-of-type(3)` — the static Web3Forms privacy/information paragraph.

Both occur only in `en-contact-error`. The interaction setup first switches MS→EN, then fills and submits the form. Source inspection shows these two paragraphs are unconditional instructions, not submission status messages. The actual error is now inserted into the already-mounted alert. Adding assertive announcements to all translated page copy would not be an appropriate source fix. Human review of language-switch and actual error speech remains open; these raw rows are not re-labelled as passes.

The baseline's same privacy paragraph used `nth-of-type(4)` while an error `<p>` was a sibling. The new alert `<div>` changes the static note to `nth-of-type(3)`, causing the baseline diff's FIXED/NEW pair. The fix audits use the new selector and report **none introduced** between them.

## 4. Final needsReview triage — 3,699 unresolved review rows

These are uncertain findings, **not passing assertions**, and counts represent report rows, not necessarily unique defects.

| Rule                           |      Rows | Source/evidence review and remaining question                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------ | --------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status-message-not-announced` | **3,333** | Predominantly translated page copy after the explicit language switch, requested Story chapter content, plus project-empty helper/reset content. Existing project count and Story status regions announce state; these rows still require human assessment of useful, non-duplicative announcements. Do not make the whole page live just to eliminate the heuristic.                                                                                                                                                                                                                                                |
| `color-contrast`               |   **361** | **216** are measured forced-colors author-foreground/forced-background pairs routed by the CLI to needsReview (known Chromium/axe text-fill sampling issue; do not apply suggested default-mode colours from those pairs). Another forced-colors row has `emptyValue`. Remaining **144** are overlap/image/non-text incomplete rows, including illustrative SVG, object caption and partially obscured dialog content. Source review confirms the real text/control ancestor fade is gone, but does not settle actual rendered contrast/occlusion for all rows. Verify OS High Contrast and rendered overlap by eye. |
| `aria-prohibited-attr`         |     **0** | **Resolved.** `src/lib/Presentation.svelte` reader container now specifies `role="region"`, `use:keyboardScrollRegion`, and valid `aria-label`. All 20 `aria-prohibited-attr` rows across 5 chapters and both locales are eliminated in `final-a11y.json`.                                                                                                                                                                                                                                                                                                                                                           |
| `label-content-name-mismatch`  |     **4** | Project-detail close glyph `×` with descriptive `Tutup dialog` / `Close dialog`; engine says it cannot determine correspondence. This is a symbol-only control, not the D2 PDF/logo/language case. Confirm announcement and voice-control use; do not call the review rows passes.                                                                                                                                                                                                                                                                                                                                   |
| `aria-valid-attr-value`        |     **1** | Desktop-hidden mobile-menu button references closed `#mobile-navigation`. Source contains the target dialog; native closed dialogs can be omitted from the accessibility tree. Real 320px menu opening/focus/Escape regressions pass. AT relationship interpretation remains to confirm.                                                                                                                                                                                                                                                                                                                             |

No rule was disabled, no generated report was edited, and no needsReview row was silently converted to a pass.

## 5. Manual checklist deliverable (13 CLI items)

All remain human-review work. Automated regression is supporting evidence, not a substitute.

1. **Real assistive technology:** begin with free **NVDA on Windows**; also test VoiceOver on macOS/iOS before production.
2. **SC 2.4.3 Focus Order:** confirm the sequence is meaningful, not merely reachable.
3. **SC 2.1.1 Keyboard:** complete main tasks without a pointer, including dialog dismissal and form recovery.
4. **SC 3.3.3 Error Suggestions:** verify invalid-field and service-error speech identifies the problem and explains recovery. The CLI inventory counts seven fields, including non-user-facing form fields; review the real user fields deliberately.
5. **SC 2.4.6 Headings and Labels:** confirm labels explain what to enter and bilingual names are understandable.
6. **SC 2.4.4 Link Purpose:** read links out of context and check destinations are clear.
7. **SC 1.3.1 Structure:** confirm headings communicate content hierarchy rather than just visual size.
8. **SC 4.1.2 ARIA Appropriateness:** inspect the 115 baseline ARIA attributes for useful semantics, including the Story-reader follow-up.
9. **SC 2.1.2 Dialog Behaviour:** confirm a real screen reader announces opening context and understandable dismissal instructions.
10. **SC 2.3.3 Motion:** confirm any motion surviving reduced-motion is essential; regression covers trace completion and pause mechanically.
11. **SC 1.4.1 Colour:** confirm information is never communicated by colour alone.
12. **SC 2.4.11 Focus Not Obscured:** check sticky-header and dialog scrolling visually at every keyboard stop.
13. **SC 1.4.3 Undeterminable Contrast:** manually inspect overlap/image/non-text incomplete cases and Windows High Contrast. Also inspect actual browser 400% zoom; 320px emulation is supporting evidence only.

Automation covers a subset of the standard: **17 of the 55 WCAG 2.2 A/AA criteria have any ACT-approved automated rule**, and not all aspects even there (coverage reference carried by the CLI/skill). This work is not a WCAG/ADA certification or a claim that no manual testing is needed.

## 6. Artifacts and reproducible commands

Current screenshots and image/manifest measurements are under `final-regression/` (and prior `fix-regression/`). `final-regression/regression.json` contains all 25 pass results and an empty `runtimeErrors` list. Raw full audit JSON includes findings, per-state coverage, fingerprints, manualChecklist and tool versions.

**Notice on Preview Port:** Port `4181` is used for preview reproduction because stale immutable chunk caches on `4180` cause hydration failures. Port `4181` guarantees fresh build assets are served and verified.

Windows terminal:

```powershell
npm run check
npm run build
# Start preview on port 4181 (avoiding stale 4180 chunk cache)
npm run preview -- --host 127.0.0.1 --port 4181 --strictPort

# Separate terminal. All contact requests are mocked by the regression harness.
$env:PLAYWRIGHT_MODULE = 'C:/Users/KELUARGA AZMI/AppData/Local/npm-cache/_npx/f70ed744217c9448/node_modules/playwright/index.mjs'
$env:UI_URL = 'http://127.0.0.1:4181'
$env:UI_ARTIFACTS = '.crew/artifacts/editorial-verification/final-regression'
node scripts/ui-regression.mjs

npx a11y-loop --version
npx a11y-loop audit http://127.0.0.1:4181 --interact scripts/a11y-states.mjs --out .crew/artifacts/editorial-verification/final-a11y.json --quiet
npx a11y-loop diff --before .crew/artifacts/editorial-verification/a11y-fix-run-2.json --after .crew/artifacts/editorial-verification/final-a11y.json
```

In this WSL-hosted session the same commands ran through Windows Node/npm:

```bash
NODE='/mnt/c/Program Files/nodejs/node.exe'
NPM='C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js'
NPX='C:/Program Files/nodejs/node_modules/npm/bin/npx-cli.js'
"$NODE" "$NPM" run check
"$NODE" "$NPM" run build
"$NODE" node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4181 --strictPort
WSLENV=PLAYWRIGHT_MODULE:UI_URL:UI_ARTIFACTS \
PLAYWRIGHT_MODULE='C:/Users/KELUARGA AZMI/AppData/Local/npm-cache/_npx/f70ed744217c9448/node_modules/playwright/index.mjs' \
UI_URL='http://127.0.0.1:4181' \
UI_ARTIFACTS='.crew/artifacts/editorial-verification/final-regression' \
"$NODE" scripts/ui-regression.mjs
"$NODE" "$NPX" a11y-loop audit http://127.0.0.1:4181 --interact scripts/a11y-states.mjs --out .crew/artifacts/editorial-verification/final-a11y.json --quiet
"$NODE" "$NPX" a11y-loop diff --before .crew/artifacts/editorial-verification/a11y-fix-run-2.json --after .crew/artifacts/editorial-verification/final-a11y.json
```

### Bounded Story Region & Dialog Dismissal Verification

Targeted headless browser checks were executed against `http://127.0.0.1:4181` verifying:

1. **Story reader region**: `<div class="reader" role="region">` has explicit `role="region"`, `aria-label="Kandungan bab"` (or `"Chapter content"`), and `tabindex="0"` for keyboard scrolling.
2. **Escape key dismissal**: With focus situated inside the story dialog (including focused heading, reader region, or chapter navigation), pressing Escape invokes `oncancel`, closes the modal, clears the body scroll lock, and returns focus to `.hero-btn-pres`.
3. **Ordinary close**: Clicking `.story button.close` closes the modal, unlocks scroll, and restores focus to `.hero-btn-pres`.
4. **Project details dialog**: Escape key and ordinary close button (`.modal-close-btn`) dismiss the dialog and restore opener focus.

**Recommended next action:** All code fixes are verified. Conduct human testing with assistive technology (NVDA on Windows, VoiceOver on macOS/iOS) to validate spoken announcement quality for language switches, form error notifications, and reader navigation.
