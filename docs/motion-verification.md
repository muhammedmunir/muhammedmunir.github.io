# Systems in Motion — unpublished prototype verification

## Scope and preview

Root and `/spatial/` render the new native-scroll SystemsPortfolio. Production-format local preview: http://127.0.0.1:4203/ (PID 32528). No commit, push or deployment. Older spatial/editorial reports are historical, not evidence for this build. Do not rebuild beneath the preview; start a fresh port after a build.

Implemented files: src/lib/motion/{SystemsPortfolio.svelte,MotionWorld.svelte,world.ts}, Contact.svelte, i18n.ts, root/layout/spatial routes, layout.css and app.html remote font removal. Reused factual data, contact endpoint and resume. No added dependencies. Legacy spatial/HUD components are unmounted and absent from the page bundle, but not deleted without confirmation.

## Executed evidence

- npm run check: 0 errors, 0 warnings.
- npm run build: successful static output. Three remains a dynamically loaded 736.82 kB minified / 186.92 kB gzip chunk; this is an outstanding payload cost, not hidden by raising warning thresholds.
- npm run lint: passed before final documentation updates; rerun recorded in final session output.
- MOTION_URL=http://127.0.0.1:4203/ node scripts/motion-regression.mjs: 86/86 assertions passed.
- MOTION_URL=http://127.0.0.1:4203/ node scripts/motion-resilience.mjs: 22/22 assertions passed.
- Regression: SSR content, one main/h1, native anchors/scroll, all six section poses, 320/390/768/1440/844-landscape widths, native validation, intercepted error/network/success, language, idle rendering, reduced preference and context loss. All Web3Forms requests intercepted; no real message sent.
- Resilience: genuine disabled JavaScript still includes all content and native contact anchors, form uses HTTPS POST (not GET); unavailable WebGL renders original SVG; blocked localStorage doesn't break hydration/language; first Tab skip and Enter main, PageDown scroll; reduced resize redraws then stops; fast reverse scroll settles; 200% root text at 320px has no document overflow. Native no-JS submission destination inspected, not actually submitted.
- Static review found native GET form privacy flaw, corrected to POST with hidden access_key. Resilience run exposed localStorage SecurityError breaking hydration, corrected with scoped storage catches while retaining html lang update.
- Desktop scene sample: 37 draw calls, 2 uploaded geometries; zero render delta across idle 1.2s. Dynamic DPR caps 1.75 desktop / 1.3 mobile; shadows 1024/512. These are local observations, not physical mobile GPU/thermal certification.

## Local performance observations

Fresh headless Chromium contexts on localhost, 4x CPU slowdown, no network throttling, PerformanceObserver:

| Viewport   | LCP    | CLS |
| ---------- | ------ | --- |
| 1440 x 900 | 656 ms | 0   |
| 390 x 844  | 628 ms | 0   |

These are two local lab samples, not field Core Web Vitals or a Lighthouse score. No INP measurement, real network/GPU test or promise of production thresholds. LCP/CLS good thresholds remain targets. No continuous idle rotation/rendering.

## Audit-fix-re-audit

Cached a11y-loop CLI (axe-core + heuristics), five baseline modes and scripts/motion-a11y-states.mjs (six sections, English contact, validation, mocked error/success, reduced and context loss).

1. motion-a11y-01.json: 2 inferred failures + 323 needsReview. Both failures classified translated static privacy/required instructions during a combined language+submit action as new status. Separate the English state from error-state action; don't make the entire page live. Added explicit mounted language confirmation.
2. motion-a11y-02.json: 0 detected failures + 247 needsReview. Source review identified fixed custom tokens overriding forced-color system tokens. Added scoped system color tokens and hides decorative world in forced-colors.
3. motion-a11y-03.json: **0 automatically detectable failures, 103 needsReview, 0 best-practice findings, 12 manual checks**. No rules disabled and no report values edited.

Raw unresolved groups: **14 contrast rows** (SVG labels/image/overlap, decorative glyphs/name) and **89 inferred status rows** (translated content replacement). Color pairs measured separately on solid graphite: ivory 15.75:1, muted 9.84:1, copper 8.08:1, UI border 6.03:1 and focus 14.46:1. Rendered SVG/overlap and actual AT announcement quality remain open; do not call needsReview passed.

Manual checklist: real NVDA/JAWS/VoiceOver; logical focus order; full keyboard task; diagram accessible-name quality (draft titles require human confirmation); actionable form errors; label clarity; link purpose; heading meaning; ARIA appropriateness; non-color cues; focus not obscured; undeterminable contrast. Automation covers a minority: 17 of 55 A/AA criteria have any ACT-approved automated rule. This is not WCAG certification/compliance.

## Screenshot evidence, not aesthetic approval

MCP captured each of six sections at 1440x1000, 390x844 and 320x740 on build 4202 (preceding final forced-colors/storage-only changes), no horizontal overflow in samples. Paths `.playwright-mcp/motion-{width}-{intro|emesys|onboardx|cv_bot|about|contact}.png`. First earlier capture `motion-01-hero-desktop.png` is an untracked artifact, not a production asset.

This runtime cannot inspect images. Consequently the typography/materials/camera framing have NOT received actual pixel-based visual approval. No claim of world-class quality, visual gate completion or user approval follows from these tests. Original concept diagrams are explicitly labeled, but their wording/visual interpretation is draft pending human review. The final Contact/about are calm opaque content, with settled sculpture not prominently visible behind them.

## Remaining gates

Human visual review of desktop/mobile composition and scroll recording; refine from that evidence. Physical phone touch/GPU/thermal, real OS screen reader, real background tab lifecycle and actual production network/INP remain unverified. itda-cli requested by user was not found in PATH/common local bin locations or available tools; obtain the correct source before installing, no similarly named package assumed. Playwright remains functional.

Existing ui/spatial launchers now point to the new regression; historical portfolio-regression.mjs remains an archived old interaction contract, not the active test. No unrelated files or legacy code deleted. Publish only after explicit approval.
