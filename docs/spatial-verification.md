# Spatial Prototype Verification Report — 2026-10-21

## Review Fix Verification — Current Production Preview Port 4186

**Bounded implementation: DONE. Functional verification: PASS (14/14). Accessibility audit: NOT clean.** This section supersedes the historical port-4184 and port-4183 implementation/preview claims below. No WCAG conformance, screen-reader speech, or aesthetic approval is claimed.

### Changes and red/green evidence

Only four assigned files were changed in this run: `src/lib/spatial/scene.ts`, `src/routes/spatial/+page.svelte`, `scripts/spatial-regression.mjs`, and this document. Existing unrelated workspace changes were preserved. No dependencies, source project facts, branches, commits, or pushes were added.

- **Rapid retarget closure:** `scene.ts` derives closure timing from the current pose for either closed target (stage 0 or 3). If camera z is at or behind 3.5, the complete 2.2-second exit camera transition precedes enclosure and iris closure. Every retarget kills the old timeline and recomputes that rule; opening timing is unchanged. This is a GSAP camera-transition dependency, not a target-only timeout.
- **Paused intro skip:** a shared one-off static render helper cancels any pending draw, renders the explicit pose once, and restores the paused flag. Skip no longer changes only the model while leaving the old camera image on screen.
- **Shadow frustum:** the directional shadow camera projection matrix is updated immediately after its frustum assignment.
- **Fallback controls:** all no-op pause/skip/replay buttons are omitted both for forced no-WebGL and after context loss. Stage navigation and all HTML project content remain available.
- **Language confirmation:** a separate permanently mounted polite atomic region starts empty and updates only in the language button handler. Stage/pause announcements no longer prepend the selected language. Regression observes zero language-region mutations during stage and pause actions and checks both languages, node identity, and retained keyboard focus.

The first valid red run against development port 4191 produced **9/14 passes**, reproducing all five added/strengthened failing cases before source fixes. Paused skip remained at camera `[14.573076,7.382051,25.764101]` instead of `[11,5,21]`; rapid next retarget sampled unsafe pose `{x:0.000961,y:0.500389,z:-7.997355,split:0.999631,aperture:0.999631}`. Forced fallback and context-loss fallback retained no-op buttons, and the dedicated language region was absent. Earlier attempts against stale port 4183 could not hydrate and are not valid source-bug evidence.

After fixes the development run passed **14/14**. After the final production build, a fresh preview on port **4186** also passed **14/14**. Numeric animation-frame sampling covers stage 2 -> 3 -> 0 rapid next, stage 2 -> 1 -> 0 rapid back, and three additional forward/back reversals during exit. Every sampled pose with z <= 3.5 retained fully open split/aperture. Final recorded production next path: **62 samples**, first closing pose `[11,5,21]`, split/aperture **0.997571**. Back/reversal path: **78 samples**, first closing pose `[11,5,21]`, split/aperture **0.999981**. These are sampled pose checks, not an exhaustive geometric collision proof for arbitrary future geometry. Paused skip verifies a render occurs and then GPU draws and timeline time remain unchanged for 500 ms.

### Commands and fresh production environment

Windows Node was used from WSL (`node.exe`; npm/CLI via `cmd.exe /c`). Commands run:

```text
npm run check
npm run lint
npm run build
node node_modules/vite/bin/vite.js preview --host 0.0.0.0 --port 4186 --strictPort
node -e "process.env.SPATIAL_URL='http://127.0.0.1:4186/spatial'; import('./scripts/spatial-regression.mjs')"
npx a11y-loop audit http://127.0.0.1:4186/spatial --json --out .crew/artifacts/team_20261021164035_506e296c2fc2c059/spatial-a11y-final.json --interact scripts/spatial-a11y-states.mjs
```

- Check: **0 errors, 0 warnings**. Lint: **All matched files use Prettier code style**. Build: **exit 0**, adapter-static wrote `build/`; the existing **736.82 kB** Three.js chunk warning remains.
- **Last source build completed before preview startup. No build was run after starting this preview.** Current keepalive URL: **http://localhost:4186/spatial**, Windows PID **13844**. Parent owns MCP captures; no duplicate screenshots were taken.
- Regression: **exit 0; 14/14 tests passed** on the fresh production preview.
- Audit: **exit 1 (findings, not tool error)**; all five passes and all **14 interaction states** completed. Report timestamp **2026-10-21T16:59:55.251Z**, a11y-loop **0.4.1**, axe-core **4.14.0**, Chromium **156.0.8078.4**.

### Unsuppressed audit outcome and remaining manual work

Raw final JSON: **3 violations, 233 needsReview, 0 bestPractice, 8 manual checklist items**. The review bucket contains **118 color-contrast** and **115 status-message-not-announced** rows; no live-region-injected-late rows remain. This is **not a green audit**.

All three violation rows remain inferred `status-message-not-announced` findings with fingerprint `2afa01cde517`, targeting the same static English stage-0 description in `en-stage0-settled`, `en-stage0-paused`, and `en-fallback-contextlost`. That paragraph is explanatory page content, not a transient status; the actual language action has a dedicated confirmation region. No page-wide live wrapper, focus hijack, suppression, or relabelling was added to satisfy this heuristic. Human/assistive-technology adjudication remains open. The contrast rows involve rendered/layered backgrounds and glyphs and are not cleared by base-token measurements.

Real NVDA/JAWS/VoiceOver announcement delivery/timing, logical focus order and keyboard task walkthrough, link/heading/ARIA semantics, color-only information, composited-background contrast, and parent visual inspection remain manual. These known review items are outside the bounded source edits and are not a claim of conformance.

Current run artifacts under `.crew/artifacts/team_20261021164035_506e296c2fc2c059/`: `spatial-regression-final.log` (final 14/14 pass and numeric samples), `spatial-a11y-final.json`, `preview-4186.out.log`, and `preview-4186.err.log`. A temporary development server on port 4191 was used for red/green verification and stopped after final verification; the production preview is deliberately kept alive.

---

## Final Fix Verification — Port 4184

**Implementation status: DONE for the two assigned source fixes. Audit status: NOT clean.** No WCAG conformance or screen-reader speech claim is made.

Changed files are limited to `src/routes/spatial/+page.svelte`, `scripts/spatial-regression.mjs`, and this document. No source facts, scene geometry, motion behavior, dependencies, branches, or commits were changed. Existing unrelated uncommitted work was preserved. Parent owns MCP imagery; no duplicate screenshots were captured during this fix run.

### Resolved-Issue Ledger

| Issue                                  | Resolution                                                                                                                                                                                                                                                                                                                      | Fresh verification                                                                                                                                                                                                                                                                                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Conditional fallback live-region mount | `.render-status[role="status"]` for fallback is now permanently mounted with empty text while inactive. Existing `.sr-only` clips it visually without `hidden`, `display:none`, `visibility:hidden`, or `aria-hidden`. The fallback text updates reactively when WebGL fails. The separate initial loading status is unchanged. | Regression 7 verifies the empty accessible container before context loss, the identical DOM node afterward, fallback text, and removal of visual clipping. Regression 6 verifies forced no-WebGL status and usable content. `live-region-injected-late` rows dropped from **2 needs-review rows to 0**. |
| Missing explicit language confirmation | Existing atomic polite `.announcement` now includes `Bahasa Melayu dipilih.` / `English language selected.` alongside the existing stage/pause message. No page-wide live wrapper or focus transfer was added.                                                                                                                  | Regression 9 checks both selected-language confirmations, `aria-live="polite"`, keyboard Enter toggling in both directions, focus remaining on the language button, and unchanged eMesys facts.                                                                                                         |
| QA runner assumed old preview port     | The SPA-navigation `waitForURL` now derives the home URL from `BASE_URL` instead of hardcoding `4183`.                                                                                                                                                                                                                          | First run: **11/12**, solely because the assertion awaited port 4183 after successful navigation to 4184. After the QA-only correction: **12/12**.                                                                                                                                                      |

### Fresh Commands and Exact Outcomes

Windows Node tooling was invoked through `cmd.exe /c` from WSL because Linux `node` is unavailable. No tooling was installed. The installed CLI resolved as `npx --no-install a11y-loop` version `0.4.1`; Node is `v24.15.0`, axe-core `4.14.0`, Chromium `156.0.8078.4`.

```text
npx --no-install prettier --write src/routes/spatial/+page.svelte scripts/spatial-regression.mjs docs/spatial-verification.md
npm run lint
npm run check
npm run build
node node_modules/vite/bin/vite.js preview --host 0.0.0.0 --port 4184 --strictPort
set SPATIAL_URL=http://localhost:4184/spatial&& node scripts/spatial-regression.mjs
npx --no-install a11y-loop audit http://localhost:4184/spatial --interact scripts/spatial-a11y-states.mjs --json --out .crew/artifacts/team_20261021161922_fb3f5a8dc186312f/spatial-a11y-final.json
npx --no-install a11y-loop diff --before .crew/artifacts/team_20261021152300_a10dddd1be434d13/spatial-a11y-after.json --after .crew/artifacts/team_20261021161922_fb3f5a8dc186312f/spatial-a11y-final.json
```

- Prettier, lint, check, and build exited **0**. `svelte-check found 0 errors and 0 warnings`; adapter-static wrote `build/`. The existing **736.82 kB** Three.js-related chunk warning remains non-blocking; no bundle restructuring was attempted.
- A new production preview was started **after** the successful build on previously unused port **4184**, avoiding reuse of stale preview chunks. **URL: `http://localhost:4184/spatial`; Windows PID: `7116`**. The process is intentionally left running. Startup returned HTTP **200**, and both browser suites used this URL successfully.
- Regression final command exited **0**: **12/12 tests passed**, including the new assertions above, all four scene poses, intro, exact pause/resume GPU freeze, reduced motion, forced no-WebGL, context loss, keyboard navigation, bilingual facts, responsive overflow, visibility lifecycle, and SPA disposal.
- Audit exited **1**, not a tool error: **3 violations, 237 needsReview, 0 bestPractice, 8 manual checklist items**. Audit timestamp: `2026-10-21T16:24:42.848Z`. Report metadata confirms all five passes (`default`, `dark`, `forced-colors`, `reduced-motion`, `reflow`) and all **14 interaction states**.

### Raw Audit Reconciliation and Remaining Review

Both the baseline JSON and fresh final JSON were read directly, including their complete `findings.needsReview` arrays; these are raw row counts, not unique selector counts or multiplied pass totals.

| Raw finding bucket / rule                     | Baseline (`4183`) | Final (`4184`) |
| --------------------------------------------- | ----------------: | -------------: |
| `violations`: `status-message-not-announced`  |                 3 |              3 |
| `needsReview`: `color-contrast`               |               120 |            120 |
| `needsReview`: `status-message-not-announced` |               117 |            117 |
| `needsReview`: `live-region-injected-late`    |                 2 |              0 |
| Total `needsReview`                           |           **239** |        **237** |
| `bestPractice`                                |                 0 |              0 |

The CLI diff exits **0**, reporting **0 fixed, 1 still present, none introduced** for unique violation fingerprints, plus **6 new needs-review fingerprints**. Direct comparison established that those six are existing contrast items whose positional selectors changed from journey `div:nth-child(3)` to `div:nth-child(4)` because of the new permanent status sibling. After normalizing that index alone, **all 237 remaining review rows match the baseline by rule, state, selector, HTML, and data**. This is fingerprint churn, not evidence of a newly measured contrast failure; the contrast uncertainty remains unresolved. Evidence: `spatial-a11y-diff.log` and `raw-review-reconciliation.txt`.

The three remaining violation rows are all **`evidence: "inferred"`**, have the same fingerprint (`2afa01cde517`), and target the static stage-0 `.description` paragraph in `en-stage0-settled`, `en-stage0-paused`, and `en-fallback-contextlost`. They report the English description appearing outside a live region. This heuristic does not establish that the separate explicit language confirmation is absent: regression 9 verifies that confirmation and retained focus. The paragraph is explanatory page content, not itself a transient status message. Per task scope, it was **not** converted to a live region, the whole page was **not** announced, and focus was **not** hijacked to satisfy a heuristic. The raw failures remain visible for human/assistive-technology review; they are not suppressed or relabelled as passed.

The **117** status-message review rows cover translated static copy, project layer labels/details, links, and changing controls (including skip/replay). Review these in context rather than forcing all mutated text into live regions. The **120** contrast review rows comprise **112 `bgOverlap`** and **8 `nonBmp`** reasons in `data.contrast.messageKey`; the latter concern non-BMP glyphs such as arrows. Layered shading/canvas backgrounds cannot be cleared solely by comparing tokens to the base background. Existing base-token measurements below are useful reference checks, **not proof** of contrast on every rendered frame. Parent imagery and manual rendered-background inspection remain needed.

### Current Artifacts and Manual Follow-up

All new artifacts are under `.crew/artifacts/team_20261021161922_fb3f5a8dc186312f/`:

- `checks.log`: initial formatting, lint/check/build output.
- `spatial-regression.log`: first run, including the old-port assertion failure.
- `spatial-regression-final.log`: corrected **12/12** result.
- `spatial-a11y-final.json` and `spatial-a11y-final.log`: unsuppressed final audit.
- `preview.stdout.log`, `preview.stderr.log`, `preview.pid`: keepalive preview evidence.
- `final-checks.log`: post-document formatting and final lint/check/build evidence.

The audit's **8-item manual checklist** remains open: real screen-reader behavior; logical focus order; complete keyboard-only task walkthrough; link purpose in context; heading hierarchy semantics; appropriateness of the 19 ARIA attributes; information not conveyed by color alone; and undetermined composited contrast. Regression probes provide supporting evidence for individual keyboard controls, not a substitute for those human judgments. Actual NVDA/JAWS/VoiceOver announcement delivery/timing and parent visual/taste evaluation are still manual. Automation has some rules for only **17 of the 55 WCAG 2.2 A/AA criteria** (31%, per the tool's coverage statement), and does not fully cover those criteria. DOM mutation/focus assertions are not a substitute for hearing screen-reader output. Parent can continue MCP imagery at the keepalive URL above. No remaining manual item blocks the bounded source edits, but the automated audit must not be represented as green.

---

## 1. Historical Independent Verification Scope (Before These Fixes)

The following port-4183 evidence predates the final fixes above. Its earlier source-bug descriptions are retained as the reproduction record; final resolutions and raw-count corrections above take precedence.

An independent verification and regression testing suite was conducted for the new `/spatial` Three.js interactive prototype in `portfolio`.

- **Scope & File Ownership**: Testing owned exclusively `scripts/spatial-regression.mjs`, `scripts/spatial-a11y-states.mjs`, and `docs/spatial-verification.md`. No `src` code was edited without parent assignment.
- **Preview Environment**: Parent production preview on port `4182` was inactive (`netstat` confirmed port free). An independent fresh preview of the production build was started on port `4183` (`http://localhost:4183/spatial`).
- **Tooling**: Node.js `v24.15.0` (Windows host via WSL environment bridge `WSLENV="PLAYWRIGHT_MODULE"`), cached Playwright Chromium `156.0.8078.4`, and `a11y-loop v0.4.1` (axe-core `4.14.0`).
- **Visual / Taste Evaluation**: **BLOCKED** (visual inspection / aesthetic taste evaluation cannot be automated; no claim of aesthetic approval is made). All assessments are grounded in mathematical geometry diagnostics (`window.__spatialDiagnostic`), GPU draw call telemetry, axe-core AST audits, and responsive DOM box metrics.

---

## 2. Actual Commands & Real Execution Outcomes

| Command                                                                                        | Exit Code | Real Outcome / Evidence Summary                                                              |
| ---------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------- |
| `npm run check`                                                                                | 0         | `svelte-check found 0 errors and 0 warnings`                                                 |
| `npm run build`                                                                                | 0         | `vite build` completed in 1.74s, `@sveltejs/adapter-static` wrote site to `build/`           |
| `npm run lint`                                                                                 | 0         | `prettier --check .`: `All matched files use Prettier code style!`                           |
| `node scripts/spatial-regression.mjs`                                                          | 0         | **12/12 automated Playwright tests passed** (100% pass rate)                                 |
| `npx a11y-loop audit http://localhost:4183/spatial --interact scripts/spatial-a11y-states.mjs` | 1         | **3 automatically detectable failures**, 239 findings needing review, 0 best-practice notes. |

---

## 3. Historical Source Bug Reproductions (Resolved Above)

### Bug 1: Late-Injected Live Region on Fallback / Context Loss

- **Priority**: High (WCAG 2.1 / 2.2 SC 4.1.3 Status Messages - Level AA)
- **Rule ID**: `live-region-injected-late`
- **Location**: `src/routes/spatial/+page.svelte:182-187`
- **Repro Steps**:
  1. Load `/spatial` with WebGL disabled (e.g. `canvas.getContext = () => null`) or trigger `WEBGL_lose_context.loseContext()`.
  2. Observe the render of `.render-status[role="status"]`.
- **Root Cause**:
  ```svelte
  {#if fallback}<p class="render-status" role="status">
  		{copy(
  			'WebGL tidak tersedia. Ilustrasi SVG statik...',
  			'WebGL unavailable. Static SVG illustration...'
  		)}
  	</p>{/if}
  ```
  The `<p role="status">` element is conditionally mounted into the DOM when `fallback` becomes true, already containing the status text. Assistive technologies (screen readers including NVDA, JAWS, and VoiceOver) listen for DOM text mutations inside _already-mounted_ live regions; an element injected late with text already inside it is frequently ignored.
- **Original Fix Guidance (now implemented)**:
  Mount the container permanently in the DOM (e.g. hidden visually with `.sr-only` until active) and update its inner text reactively:
  ```svelte
  <p class="render-status" role="status" class:sr-only={!fallback}>
  	{fallback
  		? copy(
  				'WebGL tidak tersedia. Ilustrasi SVG statik — bukan 3D sebenar. Semua kandungan dan kawalan tersedia.',
  				'WebGL unavailable. Static SVG illustration — not actual 3D. All content and controls remain available.'
  			)
  		: ''}
  </p>
  ```

---

### Bug 2: Dynamic Content Changes on Language Toggle Unannounced

- **Priority**: Medium (WCAG 2.1 / 2.2 SC 4.1.3 Status Messages - Level AA)
- **Rule ID**: `status-message-not-announced`
- **Location**: `src/routes/spatial/+page.svelte:222-227` and `src/routes/spatial/+page.svelte:115`
- **Repro Steps**:
  1. Open `/spatial` in Malay (`lang="ms"`).
  2. Click the header language button `BM / EN`.
  3. The page content changes to English (`<p class="description">`, headings, eyebrows).
- **Root Cause**:
  The existing live region only announces stage and pause state:
  ```svelte
  <p class="announcement sr-only" aria-live="polite" aria-atomic="true">
  	{copy('Peringkat', 'Stage')}
  	{stage + 1}
  	{copy('daripada', 'of')} 4: {names[stage]}. {paused
  		? copy('Gerakan dijeda.', 'Motion paused.')
  		: ''}
  </p>
  ```
  When the language button is clicked, substantial text across `<main>` mutates without a URL change or focus transfer. The polite live region does not announce that the language switched, leaving non-visual users uninformed.
- **Original Fix Guidance (now implemented)**:
  Update `.announcement` to include the current language confirmation or dispatch a brief status update:
  ```svelte
  <p class="announcement sr-only" aria-live="polite" aria-atomic="true">
  	{copy('Bahasa Melayu.', 'English language selected.')}
  	{copy('Peringkat', 'Stage')}
  	{stage + 1}
  	{copy('daripada', 'of')} 4: {names[stage]}.
  	{paused ? copy('Gerakan dijeda.', 'Motion paused.') : ''}
  </p>
  ```

---

### Historical Contrast Reference (Raw Review Counts Corrected Above)

The earlier report incorrectly characterized all 239 needs-review rows as contrast findings. Direct baseline JSON inspection instead gives **120 contrast + 117 status-message + 2 late-live-region** review rows. Of the 120 contrast rows, 112 are `bgOverlap` and 8 are `nonBmp`. The layered `.shade` and canvas require manual rendered-background inspection; these rows are not automatically cleared.

- **Historical Base-Background Token Measurements (not final composited contrast verification)**:
  Direct mathematical measurements of color tokens against the base background `#121619` using `a11y-loop contrast`:
  - `--paper` (`#f5eddc`) on `#121619`: **15.61:1** (Pass AA, Pass AAA)
  - `--muted` (`#d0c9ba`) on `#121619`: **11.03:1** (Pass AA, Pass AAA)
  - `--edge` (`#8e908a`) on `#121619`: **5.63:1** (Pass AA)
  - Amber accents (`#ce9870`) on `#121619`: **7.84:1** (Pass AA, Pass AAA)
    These token pairs pass against the dark base only. They do not establish contrast compliance against every actual canvas/gradient background, and unresolved review rows are not classified as either confirmed passes or confirmed color failures.

---

## 4. Playwright Regression Suite Evidence (`scripts/spatial-regression.mjs`)

The independent test runner executed 12 comprehensive suites covering all acceptance criteria:

```text
==================================================
Spatial Prototype Regression Suite
Target: http://localhost:4183/spatial
==================================================

  PASS: 1. Real WebGL canvas renders in normal mode (974ms)
  PASS: 2. Stage camera geometry diagnostics match design targets across 4 stages (10772ms)
  PASS: 3. Intro auto-advance, early skip, and replay controls (1092ms)
  PASS: 4. Exact pause and resume freeze timeline and stall GPU draws (3740ms)
  PASS: 5. Reduced-motion initial preference and static pose updates (737ms)
  PASS: 6. Forced no-WebGL renders static SVG fallback and preserves all stage content (502ms)
  PASS: 7. Context-lost event cleans up WebGL scene and activates static SVG fallback (3050ms)
  PASS: 8. Keyboard tab sequence, focus visibility, and skip-to-content contract (5963ms)
  PASS: 9. Bilingual toggle and absolute fidelity to source eMesys facts (4106ms)
  PASS: 10. Zero horizontal scroll overflow across viewports 320, 390, 1440, and landscape (14463ms)
  PASS: 11. Visibility state transition pauses animation loop (synthetic lifecycle note) (3056ms)
  PASS: 12. SPA navigation destroys canvas, resets diagnostics, and cleans window listeners (6076ms)

==================================================
Summary: 12/12 tests passed
==================================================
```

### Detailed Evidence Points:

1. **Real Three.js WebGL Canvas**:
   - `dataset.renderer === 'webgl'`, exactly 1 `<canvas>` element inside `.world`, 0 `.static-world` SVGs.
   - `window.__spatialDiagnostic` exposed with 93 geometries.
2. **Camera Geometry Diagnostic Verification**:
   - **Stage 0 (closed)**: Camera `[11, 5, 21]`, look target `[0, 0, -2]`, `split: 0`, `aperture: 0`, draw calls: 169.
   - **Stage 1 (open)**: Camera `[4, 1.7, 14]`, look target `[0, 0, -8]`, `split: 1`, `aperture: 1`, draw calls: 151.
   - **Stage 2 (inside-emesys)**: Camera `[0, 0.5, -8]`, look target `[0, 0, -21]`, draw calls: 113.
   - **Stage 3 (return)**: Camera `[11, 5, 21]`, look target `[0, 0, -2]`, `split: 0`, `aperture: 0`, draw calls: 169.
3. **Intro Skip & Replay**:
   - Intro auto-runs from distant coordinates (`camera.z > 28`, `timelineTime: 0 -> 2.6s`).
   - Clicking `Langkau intro` (Skip) immediately forces camera to settle at `[11, 5, 21]` and flips button label to `Ulang intro` (Replay).
   - Clicking `Ulang intro` restarts the camera tween from `[17, 9, 29]`.
4. **Exact Pause / Resume**:
   - Clicking `Jeda gerakan` flips `aria-pressed="true"`, updates button label to `Sambung gerakan`, and appends `"Gerakan dijeda."` to the live announcement region.
   - Telemetry verification: `camera` and `timelineTime` remain identical over 600ms sample; GPU `drawElements` delta is exactly 0.
   - Resuming via `Sambung gerakan` clears `aria-pressed` and completes motion smoothly.
5. **Reduced Motion**:
   - When loaded under `prefers-reduced-motion: reduce`, intro tween is bypassed (`intro: false`, camera immediately at `[11, 5, 21]`).
   - Stage transitions execute instantaneously with `timelineTime: 0`.
   - Live badge `"Gerakan dikurangkan"` is rendered.
6. **Forced No-WebGL Fallback**:
   - When WebGL context creation returns `null`, `.world canvas` count is 0; `.static-world svg` count is 1 with `aria-hidden="true"`.
   - Pause button is removed from DOM.
   - All 4 stages remain navigable; Stage 2 displays complete `dl` structure containing all 4 documented system layers.
7. **Context Loss Fallback**:
   - Calling `WEBGL_lose_context.loseContext()` transitions `data-renderer` from `webgl` to `static-svg`.
   - `window.__spatialDiagnostic` is deleted (`undefined`), confirming full Three.js scene destruction and resource disposal.
8. **Keyboard Contracts & Focus Sequence**:
   - Skip link is first focus target (`href="#spatial-content"`). Pressing Enter shifts active focus to `main#spatial-content`.
   - Tab sequence proceeds logically: Skip link -> Identity monogram -> Language toggle -> Resume PDF -> Contact -> Stage next -> Pause motion -> Replay intro.
   - Every active element displays a computed `outlineWidth >= 2px` (verified `3px solid`).
9. **Source Truth Fidelity (eMesys)**:
   - Eyebrow: `03 / 04 — YHCM / Sistem sektor awam` (BM) / `03 / 04 — YHCM / Public-sector systems` (EN).
   - Truth note verified verbatim: `"Seni bina konseptual, bukan gambaran infrastruktur sebenar."` / `"Conceptual architecture, not a reconstruction of real infrastructure."`.
   - System layers verified without deviation from `src/lib/system-projects.ts`:
     - Interface: `Vue.js 3`
     - Workflow: `Laravel 11`
     - Records: `MariaDB`
     - Infrastructure: `Docker Swarm`
10. **Zero Horizontal Scroll Overflow**:
    - Evaluated at `320x844` (small mobile), `390x844` (standard mobile), `844x390` (landscape), and `1440x900` (desktop).
    - At both Stage 0 and Stage 2 (dense data table): `documentElement.scrollWidth <= documentElement.clientWidth` and `body.scrollWidth <= documentElement.clientWidth`. Zero horizontal scrolling or clipping detected.
11. **Browser Lifecycle & Hidden Tab Pausing**:
    - Documented as synthetic visibility test (`document.hidden` + `visibilitychange` event), reflecting headless Chromium process architecture.
    - When hidden, `window.__spatialDiagnostic.hidden === true` and `framePending === false` (animation loop halted).
12. **SPA Navigation Disposal**:
    - Navigating client-side from `/spatial` to `/` drops canvas count from 1 to 0 and removes `window.__spatialDiagnostic`.
    - Window and document listeners (`pointermove`, `visibilitychange`, `webglcontextlost`, `webglcontextrestored`) are cleanly removed without leaking into subsequent route mounts.

---

## 5. Artifacts & Screenshots

Artifacts stored in `.crew/artifacts/team_20261021152300_a10dddd1be434d13/`:

- `spatial-stage0-desktop.png`: Stage 0 normal desktop view.
- `spatial-stage1-desktop.png`: Stage 1 open enclosure desktop view.
- `spatial-stage2-emesys-desktop.png`: Stage 2 eMesys internal view with 4-row technical data list.
- `spatial-stage2-emesys-en.png`: Stage 2 English localized view.
- `spatial-stage2-mobile-320px.png`: Stage 2 320px narrow mobile responsive layout.
- `spatial-fallback-svg.png`: Static SVG fallback mode with warning status badge.
- `spatial-a11y-after.json`: Machine-readable `a11y-loop` audit log across 14 interaction states.
