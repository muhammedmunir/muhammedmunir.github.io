# Neural portfolio integration — 21 October 2026

## Scope and design decisions

- Preserve the approved cyan/violet/gold living branching cortex (energy 3, rhythm 3, motion 2), existing BM/EN facts, local-console disclosure and contact endpoint. No fabricated metrics or new status/security claims were added.
- WCAG 2.2 AA is the engineering target, **not a conformance claim**.
- Dialog contract: a single modal at a time; native inert background and focus trap; Escape closes; focus returns to the actual opener; shared reference-counted body scroll locking restores prior inline values.
- Input, textarea, select, contenteditable and disclosure content retain native keyboard handling. Global console shortcuts respect `defaultPrevented`.
- Project specifications now use native `dialog.showModal()` instead of a custom dialog, manual global Escape handler and manual overflow writes.
- Reading regions obtain keyboard focus with `keyboardScrollRegion`, an explicit DOM action for scrolling plain content without pretending it is a widget. No accessibility lint rules were suppressed; the inherited transcript suppression was removed.
- Source audit fixes: visible labels included in control names, explicit gold input focus rings, keyboard-scrollable project content, distinct transcript landmark names, 44px mobile language/audio controls, unobscured cortex motion control.
- Accessible names changed in Hero, navigation, deck launcher and console are **DRAFT pending human confirmation**, despite passing automated label containment checks. Existing alt text was not rewritten.

## Reproduce

Use Node >=20 and an existing Playwright installation with Chromium. No package dependency or lockfile changes were made. On this checkout use **Windows Node**; the installed project native bindings target Windows. WSL Node cannot load the installed Rolldown binding, and its Chromium lacks `libnspr4.so`.

```powershell
# In separate terminal
npm run dev -- --host 127.0.0.1 --port 4180

# Point to an existing Playwright module if not locally resolvable
$env:PLAYWRIGHT_MODULE = 'C:/Users/KELUARGA AZMI/AppData/Local/npm-cache/_npx/f70ed744217c9448/node_modules/playwright/index.mjs'
node scripts/ui-regression.mjs
# Optional: UI_URL and UI_ARTIFACTS override localhost:4180 and .crew/artifacts/pixel-integration

npm run check
npm run build
npx a11y-loop@0.4.1 install-browser
npx a11y-loop@0.4.1 audit http://localhost:4180 --interact scripts/a11y-states.mjs --out .crew/artifacts/pixel-integration/a11y-new.json --quiet
npx a11y-loop@0.4.1 diff --before .crew/artifacts/pixel-integration/a11y-1.json --after .crew/artifacts/pixel-integration/a11y-new.json
```

`ui-regression.mjs` dynamically imports `/src/lib/deck/focus-utils.ts` for the lock-depth test, so run it against Vite **dev**, not static preview. It does not submit the contact form or call a remote backend.

## Verified evidence

Artifacts: `.crew/artifacts/pixel-integration/` (ignored).

- `check.log`: `npm run check` — **0 errors, 0 warnings**.
- `build.log`: `npm run build` — successful adapter-static output in `build/`.
- `prettier.log`, `prettier-check.log`: scoped formatting of changed integration sources/scripts/docs.
- `regression.json`, `regression.log`: **19 checks passed**, no browser page errors. BM and EN: all eight deck chapters contain no `[object Object]`; Hero→deck→Escape focus restoration; details keep Arrow/Home/End keys; typing and prevented shortcuts do not open console; query/trace/CLI paths; modal stacking blocked via keyboard and custom events; project focus restored; scroll locks restore state and remain locked until final release. Desktop/mobile extended Tab walks reach controls beyond the audit CLI's budget. 1440/390/320 page reflow and unobscured control hit regions checked.
- Real CLI: **a11y-loop 0.4.1**, **axe-core 4.14.0** (Deque Systems, MPL-2.0), Chromium **156.0.8078.4**. Reports `a11y-1.json`, `a11y-2.json`, `a11y-3.json`, `a11y-final.json`, `a11y-final-2.json`; none edited or suppressed.
- Five baseline passes: default, dark, forced-colors, reduced-motion, 320×256 reflow. Version 0.4.1 audits interaction states on fresh **default-mode** pages, not in every baseline mode; `scripts/a11y-states.mjs` additionally drives 320×844 modal states explicitly. Do not claim a five-mode Cartesian product of all states.
- 24 interaction states: BM/EN home, query/trace/CLI, deck with expanded details, project specifications, 320px mobile menu, plus BM/EN query/trace/CLI/deck/project at 320px.
- Comparable source-fix audit reduced violation rows **23→6**. The diff marks all label-in-name, focus-not-visible and scrollable-region-focusable source findings fixed (12 unique fingerprints). Its two NEW keyboard findings are in newly corrected mobile-menu coverage, not evidence of a new trap: the extended Tab walk reaches them.
- Expanded final report `a11y-final-2.json`: **6 violation rows, 2,587 needsReview rows, 24 best-practice rows**; CLI exits **1**, not clean. Most review rows repeat across states and passes. Do not describe this as an automated audit pass.

### Remaining report findings and investigation

- **6 keyboard-unreachable rows**, SC 2.1.1 (A): deck/console launchers and mobile contact textarea/submit. Every row explicitly records reduced confidence because the CLI exhausted its **60 Tab presses**. Reproducible 180-step maximum Tab walks reach all four controls at 1440 and 320px. Raw audit remains red; no rule disabled or report altered.
- **1,247 contrast review rows**: gradients/translucency, forced-colors author text-fill sampling, symbols/emoji, occlusion and empty-value cases. These are uncertainty, not passes. The gold focus token against `#111a23` was checked with real `a11y-loop contrast --fix` (`contrast-gold.json`); this does not settle every layered/gradient pair.
- **186 focus-indicator review rows**: gold outlines present but backgrounds could not be resolved. Human visual review remains required.
- **1,128 status-message review rows**: predominantly entire BM→EN content replacement and animated clock, not operation-result status messages. Reviewed source: locale replacement should not turn the whole page into an announcing live region. Confirm language-switch experience using NVDA; existing console response log remains polite/live.
- **4 target-size-min rows**: programmatic deck heading focus target (not a pointer action). Human confirmation of applicability/spacing needed.
- **6 target-size rows**: mobile console sound button reported partially obscured by axe. Browser geometry and hit testing at 30%, 50%, 70% across desktop/390/320 finds the language, close and audio controls at least 24×24 and unobscured. Language/audio controls enlarged to 44px height. Still retain as review, not an axe pass.
- **10 label review rows**: symbol-only close glyphs; accessible names provided. These are not the earlier measured name mismatches; confirm actual speech/voice-control names manually.
- **6 aria-controls review rows + 24 duplicate landmark best-practice rows** appear only in the CLI's 320px console states. The ID exists and regression confirms exactly one native `:modal`; the associated reports show background page landmarks, unlike desktop states. Suspected tool state/sampling interaction; not conclusively resolved. No source semantics stripped to hide it.

## Screenshots and visual limitation

14 PNG files captured: `home-{1440,390,320}.png` (full page), `hero-{1440,390,320}.png`, `console-{1440,390,320}.png`, `deck-{1440,390,320}.png`, `menu-{390,320}.png`.

The tool returned **“Current model does not support images”** when opening a screenshot. Thus capture, DOM reflow and hit testing are verified; an aesthetic visual review of identity readability/cortex focal hierarchy is **not completed**. No speculative aesthetic overhaul was made. A vision-capable reviewer/human must inspect these images before approval.

## Human review checklist (carried from CLI)

1. Real NVDA (free on Windows) or VoiceOver walkthrough: dialog announcement/dismissal, language switch, live responses and restored focus.
2. Logical Tab order, keyboard-only primary tasks, focus never hidden by fixed controls (SC 2.4.3/2.1.1/2.4.11).
3. Confirm two image alternatives and all changed DRAFT accessible names; decorative images should have empty alternatives.
4. Invalid form states: announced, actionable errors for each field; confirm label clarity. No live message was sent in this run.
5. Link purposes read out of context, heading hierarchy reflecting content, appropriate rather than merely valid ARIA.
6. Meaning not conveyed by color alone; contrast on layered/gradient surfaces and visibility in actual forced-colors mode.
7. Manually remeasure target-size review cases and confirm mobile control comfort, reduced motion and zoom/reflow on a real device.

Automation covers only a subset: ACT-approved automated rules touch **17 of 55 WCAG 2.2 A/AA criteria**, not full coverage even for those. Screen-reader testing and testing with disabled users remain necessary. Current status: implementation and regression complete; aesthetic/manual accessibility approval and a fully resolved audit **remain open**.
