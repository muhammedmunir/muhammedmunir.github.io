# Full spatial portfolio expansion — implementation contract

Status: decisions recorded before source implementation. This is the approved mechanical direction expanded into a complete portfolio, not a new visual proposal. Runtime/visual acceptance remains downstream QA work.

## Scope and ownership

- Contract owner: this document and `src/lib/spatial/contract.ts` only.
- Scene executor: `scene.ts`, `StaticMachine.svelte`, declared geometry-only helpers. Imports the contract; does not edit it.
- UI executor: `SpatialPortfolio.svelte`, declared UI-only helpers, both route wrappers, the small layout gate/lifecycle change, `DESIGN.md`, `CHANGELOG.md`. Imports the contract; does not edit scene/fallback or this document.
- Verifier/reviewer: read-only static checks/review. Parent owns final build, preview/browser QA, commit and push. Preserve unrelated work; no new dependencies or external assets.

## Six chapters and authored compositions

| Order | Chapter ID   | Numeric stage | HTML content / composition                                                                                                                                                                           | Mechanical state                                                                                                                                                |
| ----- | ------------ | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `intro`      | 0             | Muhammed Munir; full-stack developer; Puchong, Selangor. Short introduction, readable bio action, resume and contact always accessible. Large name, concise supporting text, generous machine space. | Original graphite/titanium/copper chassis closed; finite exterior establishing move.                                                                            |
| 2     | `emesys`     | 2             | Existing public-sector project context/summary; details expose every layer and system evidence. Compact opaque panel beside the interior, not paragraphs floating over geometry.                     | Original halves and iris open; camera travels into original ribbed chassis. Numeric stage 1 remains the compatible opening waypoint, not a seventh chapter.     |
| 3     | `onboardx`   | 4             | TNB employee onboarding, document/profile/training facts from the existing source. Panel composition shifts to leave room for vertical forms.                                                        | Purpose-built staggered mobile/document planes unfold from the machine; camera reracks outside. This must be geometry and transforms, not merely another color. |
| 4     | `cv_bot`     | 5             | “Computer Vision & Win32 Automation Suite”; personal desktop automation details and evidence. Explicitly label the optical sweep conceptual, not actual camera tracking.                             | Purpose-built radial optical aperture/lens assembly with a finite illustrative sweep. No camera permission, live tracking or perpetual animation.               |
| 5     | `background` | 6             | Concise career summary plus readable biography/experience details, preserving exact source dates.                                                                                                    | Exterior exploded/recomposed arrangement; `backgroundSpread` separates structural layers without sending the camera through closed geometry.                    |
| 6     | `contact`    | 3             | Collaboration invitation and complete contact access, not email alone.                                                                                                                               | Return to exterior and recompose original machine.                                                                                                              |

Use three distinct transformations (inside chassis, unfolded planes, optical mechanism) within one coherent mechanical world. Use native next/back and all six direct chapter buttons; a progress label is chapter order, never `numericStage + 1`. No intro/tween, loading state or pause state may gate chapter navigation. Last chapter can offer an explicit “Start again”; do not make a root identity link an ineffective self-redirect.

## Authoritative facts and reuse

- `src/lib/system-projects.ts`: look up `emesys`, `onboardx`, `cv_bot` by key, never array position. Use localized `context`, `summary`, every `layers[].technology/detail`, and `systemEvidence(project, language)`. These are explanatory groupings, not claims about deployed topology.
- eMesys: Vue.js 3, Laravel 11, MariaDB, Docker Swarm; asset lifecycle/logistics, disposal approvals, RBAC and audit logs.
- OnboardX: TNB; Flutter, documents/profiles/training, Firebase/MongoDB plus documented Supabase/MySQL, Azure/Jenkins.
- CV: Python, OpenCV/SIFT, CIELAB, OCR, CustomTkinter, Win32. Adaptive HSV is evidenced in `translations.ts` (`projects.cv_bot.desc`); preserve the source text rather than claiming the layer data includes HSV. No invented performance metrics.
- Identity/location and role come from `translations.ts` and `Contact.svelte`; career details come from `Experience.svelte` and existing localized `exp` records.
- Exact periods: YHCM Sdn Bhd, Shah Alam, Apr 2026–Present; Nova Bitara Development Sdn Bhd, Dec 2025–Mar 2026; TNB Protégé, Apr 2025–Dec 2025; TNB SOC internship, Sept 2023–Feb 2024. Localize from existing dates, do not normalize them into different months.
- Reuse unmodified `Contact.svelte` once in one native dialog or readable section. Retain native validation, trimmed required fields, email validation, honeypot, loading/success/error states and 20-second abort timeout. Use its existing direct destinations. Do not submit a real message during QA.
- Deliberate reader/dialog access may reuse existing Experience/Projects sections. Do not duplicate component IDs or Contact mounts; no nested `main` landmarks. Optional all-work catalogue uses existing factual projects, not fabricated destinations.

## Tokens and calculated contrast

Opaque HTML surfaces carry text and controls; the WebGL canvas never determines their contrast. The existing mechanical material colors remain illustrative and are not UI text tokens.

| Token       | Value     | Usage                                       |
| ----------- | --------- | ------------------------------------------- |
| `--world`   | `#121619` | Scene background and darkest UI backing     |
| `--surface` | `#1c2327` | Fully opaque content/dialog/control backing |
| `--raised`  | `#283136` | Hover/secondary surface                     |
| `--text`    | `#f4eee3` | Primary ivory text                          |
| `--muted`   | `#c4beb3` | Secondary text, never opacity-reduced       |
| `--copper`  | `#d9a17b` | Accent text and selected/primary fill       |
| `--border`  | `#89979b` | Necessary visible control boundaries        |
| `--focus`   | `#ffe2a8` | Focus ring on dark backing                  |

Calculated using WCAG sRGB linearization (`c/12.92` at `c <= .04045`, otherwise `((c+.055)/1.055)^2.4`), relative luminance `0.2126R + 0.7152G + 0.0722B`, and `(Llighter+.05)/(Ldarker+.05)`. Fresh Node calculation produced:

| Foreground / background | Ratio   | Acceptance                             |
| ----------------------- | ------- | -------------------------------------- |
| text / world            | 15.75:1 | Normal text >= 4.5:1                   |
| text / surface          | 13.79:1 | Normal text >= 4.5:1                   |
| text / raised           | 11.49:1 | Hover text >= 4.5:1                    |
| muted / surface         | 8.61:1  | Secondary text >= 4.5:1                |
| muted / raised          | 7.18:1  | Secondary text >= 4.5:1                |
| copper / surface        | 7.08:1  | Accent text >= 4.5:1                   |
| world / copper          | 8.09:1  | Primary/selected button label >= 4.5:1 |
| border / surface        | 5.28:1  | Control boundary >= 3:1                |
| border / world          | 6.03:1  | Control boundary >= 3:1                |
| focus / surface         | 12.66:1 | Visible focus >= 3:1                   |
| focus / raised          | 10.55:1 | Visible focus >= 3:1                   |
| focus / world           | 14.46:1 | Visible focus >= 3:1                   |

Do not put ivory text on copper fill. Selected copper controls use world-colored labels. Focus uses a >= 3px ring with >= 3px dark offset/backing, including on copper controls, so the ring is measured against a known dark adjacent surface, not the copper or unpredictable canvas. Do not rely on color alone for selected, error or disabled state. Any executor variation must preserve/recalculate these ratios. This evidence covers the specified new surfaces, not a claim that all reused component states have been browser-audited.

## Responsive and typography acceptance

- Desktop: bounded text measure (roughly 45–60 characters), concise main synopsis, large but clamped heading; allocate a separate scene region instead of obscuring the machine with long copy. Chapter-specific placement can shift the opaque panel but cannot move navigation out of reach.
- At 390px and 320px: normal document flow, one column, `min-width: 0`, wrap long project names/technology labels, compact header with reachable language/resume/contact controls, a dedicated scene window before/alongside the concise panel, and a wrapped two/three-column chapter-button grid. No fixed full-screen prose overlay or clipped horizontal page. Keep an approximately 220px minimum scene window when viewport height permits; allow ordinary scrolling rather than hiding controls.
- Short landscape (including 667×375): compact header and two-column scene/content only when both remain legible; otherwise stacked normal flow. No permanent bottom bar covering content or native dialog controls. Use `dvh`/safe-area padding where applicable; do not force `overflow: hidden` on the page.
- Body and form copy target >=16px with >=1.5 line height; small metadata remains comfortably readable. Hierarchy comes from scale/weight/spacing, not low contrast. Long facts move into the reader/dialog, not microscopic text over 3D.
- Validate 320×568, 390×844, 667×375, desktop, 200% zoom, and reflow at 320 CSS px/400% zoom. Controls have >=44×44 CSS px interactive areas (stronger than the WCAG 2.2 AA 24px minimum), no collision and visible focus not obscured by sticky content.

## Component keyboard and WCAG 2.2 AA acceptance

| Component                     | Semantics and keyboard criteria                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared shell                  | One `main`, one `h1`, logical headings; skip link reaches/focuses main. No custom cursor, scroll hijack or keyboard trap. Root and `/spatial` mount the same component through thin wrappers; root canonical is `https://muhammedmunir.github.io/`. Gate both routes out of editorial header/HUD and avoid their inactive listeners.                                                                                                                                                                                                     |
| Chapter navigation            | Native buttons in named `nav`; Tab reaches each, Enter/Space activates; selected button has `aria-current="step"` and non-color indication. Preserve focus on activated control. Next/back use chapter order; only genuine endpoints disable. Native navigation always works in loading, paused, reduced and fallback states.                                                                                                                                                                                                            |
| Project details               | Native button opens readable facts or native details/summary. Every project layer/evidence reachable with keyboard and BM/EN changes. Canvas/SVG are decorative (`aria-hidden`), not duplicate screen-reader facts.                                                                                                                                                                                                                                                                                                                      |
| Bio/career and contact dialog | `showModal()`, accessible name via visible heading, explicit close button, sensible initial focus (heading `tabindex=-1` for long content), native inert background, Tab/Shift+Tab contained. Escape uses native cancel/close lifecycle. On any close restore recorded connected opener, or a stable meaningful control if it disappeared. Use existing scroll-lock acquire/release utilities with one ownership flag and release on close, failure and unmount; no nested modal. Do not place a second Contact mount in another reader. |
| Contact form                  | Existing visible labels, errors, required indicators, honeypot and submit state unchanged. Dialog must scroll internally to every field/button; success/reset focus behavior survives embedding. Do not intercept Enter or Escape globally in a way that breaks the form.                                                                                                                                                                                                                                                                |
| Motion controls               | Native pause toggle with `aria-pressed`; accurate resume label, skip while intro is active, replay when inactive. Omit/disable unsupported WebGL-only controls in SVG mode and explain why; never leave apparently active dead controls.                                                                                                                                                                                                                                                                                                 |
| Language/status               | Live BM/EN store affects all visible text, accessible names and dialogs; polite atomic status for language/chapter/fallback changes. Announce concise chapter changes, not per-frame pose or loading spam. No automatic focus jump on every chapter/language change.                                                                                                                                                                                                                                                                     |
| Links and progress            | Resume is a real PDF link; contact opens full contact content with existing direct channels available. Use real existing external links with safe relationship attributes and new-tab notice where needed. Progress has a text equivalent such as 3 / 6.                                                                                                                                                                                                                                                                                 |

Acceptance targets include WCAG 1.1.1, 1.3.1/2, 1.4.3/4/10/11/12, 2.1.1/2, 2.2.2, 2.3.1, 2.4.1/3/6/7/11, 2.5.3/8, 3.1.1, 3.2.1/2, 3.3.1/2, 4.1.2/3. Reduced-motion support is an additional explicit product requirement; no flashing or forced waiting is permitted.

## Controller contract and readiness handshake

`contract.ts` is dependency-free and SSR-safe. It exports chapter/stage data, controller/options types and deeply readonly diagnostic snapshots. Scene may re-export legacy `Stage`/`SpatialScene` from the contract for compatibility, but must not maintain a second divergent definition.

1. UI starts at `INITIAL_CHAPTER = 'intro'`, stage 0. Chapter state belongs to UI immediately, including before the controller exists. Scene starts at the supplied optional `initialChapter`, otherwise intro. Opening stage 1 maps to eMesys for legacy `go(1)` but direct `goChapter('emesys')` targets stage 2.
2. `createSpatialScene` remains an asynchronous factory. `Options.onReady()` is an informational renderer-ready signal and may run before its promise resolves; it does **not** imply the UI controller variable is assigned. `onIntro(boolean)` and `onFailure()` remain compatible callbacks. Guard all callbacks after UI teardown.
3. UI mounts synchronously, sets a disposed flag in its synchronous cleanup, dynamically imports scene, and checks disposal before calling the factory. Pass `isDisposed` into the factory; scene checks it after its own Three/GSAP import boundary before allocating renderer/listeners/resources. Cancellation must not invoke failure UI after teardown.
4. On resolution: destroy a late controller if UI is disposed. Otherwise assign it, reconcile current `matchMedia` value, current pause state, and **latest** requested chapter, not the import-time snapshot. Reconcile chapter even if it returned to intro while loading, but preserve a still-valid initial intro only if no explicit navigation/replay/skip happened while loading. UI can track a user-action revision and pending replay/skip intent; the newest explicit action wins. An explicit `goChapter('intro')` is a chapter selection, not a replay request.
5. `Options.initialChapter` can avoid an unwanted initial intro on a known non-intro target; `Options.paused` can prevent initial playback before reconciliation. Both are snapshots, not substitutes for final reconciliation. `onReady` must never clear a pending navigation or intro intent.
6. Initialization failure or context loss enters SVG mode once, preserves UI chapter/content/language/pause selection and clears intro status. Do not remount/retry WebGL. Native chapter controls continue updating static frames. Catch initialization rejection and clean any partial resources in the scene owner.

### State and motion behavior

- `go(stage)` preserves 0 closed, 1 opening, 2 eMesys interior, 3 return; 4 OnboardX, 5 CV, 6 background. `goChapter(id)` maps the six chapter IDs. Both kill the previous transition, finish any intro, reset pointer offsets and retarget from the **current pose**, not the previous stage target.
- `pause(true)` freezes timeline, intro and pointer parallax at the exact pose; no frames continue. `pause(false)` resumes that timeline at its exact time unless an explicit later action replaced it. Navigation while paused updates chapter immediately and queues a paused retarget; Skip is the explicit way to settle/redraw once without unpausing.
- `replay()` is an explicit reset to intro/stage 0, never an idle loop; establishing move <=3 seconds (existing move is 2.6s). When paused, any safety exit/replay timeline remains paused, not silently played; Skip can settle intro. In reduced mode replay renders the static intro frame once and reports no active intro. Replay from inside must use the same safe exit policy as every other retarget, not teleport into a closing enclosure during animation.
- `skip()` kills the active timeline, settles the currently requested stage/chapter frame, reports intro false, and renders exactly once even while paused. It does not clear the paused preference or create an idle loop. Instant static stage changes do not animate through intermediate geometry.
- `reducedMotion(true)` kills movement and freezes the exact current pose, finishes intro, cancels pending frames and suppresses pointer motion. Subsequent explicit chapter/replay/skip actions settle complete static stage frames with one render. `reducedMotion(false)` does not invent motion or restart the killed timeline; only a new explicit action starts a transition. Dynamic preference changes remain supported.
- Hidden document pauses both GSAP and RAF without changing user pause selection. Resume only when visible and not user-paused; one explicit static redraw while hidden is deferred until visible. Rendering is event-driven (resize, pointer delta, active tween, static selection), never an unconditional idle RAF loop.

### Exit before closure, on every retarget

The existing front enclosure extends through z=3.5. Preserve this factual geometry relationship; do not merely assume a new camera spline misses geometry.

- Whenever the **current pose** is behind/intersecting the front plane and the destination is outside/closing, first hold chassis split and iris at a safe open clearance and move through an explicit exterior waypoint beyond the front enclosure. Only after that exit phase completes may closure, new group deployment or final exterior rerack occur.
- Recompute this from current camera/mechanical channels after every interruption, including inside→OnboardX/CV/background/contact/intro, inside→replay, and a second chapter change midway through the first exit. A numeric prior/target stage test alone is insufficient.
- Also open clearance before entering the tunnel from an interrupted partially closed pose. The scene owner defines the waypoint against authored dimensions, not arbitrary collision luck. Keep optical/document groups outside the escape corridor until exit completes.
- Static reduced/Skip frames jump coherently to the final camera/mechanism state without animated intersection. Preserve shadow frustum `updateProjectionMatrix()` after assigning its bounds.

### Pose and diagnostics

Legacy pose fields stay `x,y,z,tx,ty,tz,split,aperture`. Add normalized `[0,1]` channels `documentUnfold`, `opticAperture`, `opticSweep`, `backgroundSpread`; these drive actual geometry transforms/visibility. The optical sweep is finite and illustrative. Groups may be hidden only when their relevant channels are zero and no transition needs them; do not allocate a new assembly every chapter visit.

`window.__spatialDiagnostic` remains a configurable getter for an immutable snapshot: numeric stage, chapter, paused/reduced/hidden/intro, actual camera tuple, full pose, framePending, timelineTime, geometries and calls. Freeze camera array, pose object and outer snapshot; do not expose mutable scene/timeline references. Diagnostics describe the requested target chapter/stage while camera/pose describe current presentation. Destroy removes the getter only when owned by that scene instance.

## Resource ownership

Scene owns renderer/canvas, scene/camera, unique geometry/material sets, light-shadow targets, GSAP timeline, RAF, ResizeObserver, pointer/visibility/context-loss handlers and diagnostic getter. Reuse tracked geometry/materials across groups; dispose each once, all shadows, renderer and canvas, kill timeline, cancel RAF, disconnect observer, remove handlers, remove owned diagnostics. `destroy()` is idempotent and must cover partial initialization. Context loss prevents default, reports failure once and destroys; no retry or restoration loop.

UI owns chapter/language/pause state, matchMedia listener, dynamic import cancellation, controller reference, dialog opener/scroll lock and native dialog lifecycle. Cleanup removes its listeners, closes dialog/releases its lock and destroys assigned or late controllers. Route wrappers own metadata only; layout avoids mounting irrelevant editorial listeners on either spatial route.

## Acceptance matrix for following implementers and QA

| Scenario                       | Required observation                                                                                                                                                  |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default intro                  | <=3s finite motion, skip available, no blocked chapter controls; no animation after settling.                                                                         |
| Loading navigation             | Select several chapters before factory resolves, including return to intro; latest intent wins and no stale callback overwrites it.                                   |
| Rapid retarget                 | Interior→each exterior chapter, replay, then reverse mid-exit; maintain open corridor until actual exterior waypoint, no closure over camera.                         |
| Pause/resume                   | Camera/mechanics/timeline/pointer stay exact while paused and hidden; resume exact time. New paused navigation queues; Skip draws once and remains paused.            |
| Reduced initially              | Every chapter has a distinct static frame and identical facts/navigation; no intro/parallax/scan animation.                                                           |
| Reduced changes live           | Freeze existing pose, stop RAF/tween; explicit next/skip settles full static frame. Turning preference off does not unexpectedly restart.                             |
| Hidden tab                     | Both timeline and RAF stop; visibility resumes only if not user-paused.                                                                                               |
| WebGL unavailable/context lost | One fallback, no retry; six distinguishable SVG frames and complete readable content, project details, career, form, language and navigation. No dead motion buttons. |
| Late import/unmount            | No allocations after cancelled internal import; returned late controller destroyed; no callbacks mutate unmounted UI.                                                 |
| Dialog keyboard                | Open, initial focus, Tab/Shift+Tab, Escape/close, opener restore, scroll unlock, route-away cleanup, contact success/reset focus.                                     |
| Responsive/localization        | 320/390/short landscape/desktop, both languages, all chapters/dialogs, 200% zoom and 320px reflow; no overlap/clipping, text contrast and 44px targets.               |
| Resource repeatability         | Repeated chapter visits do not increase geometry/material counts; unmount removes canvas/handlers/diagnostics and frees resources; no console errors.                 |
| Routing                        | Root and `/spatial` share one implementation, root canonical, no duplicate landmarks/IDs, no editorial HUD/listener leakage.                                          |

Static formatting/type checks prove only source conformance. Actual composition, camera clearance, WebGL fallback, frame suspension and assistive-technology behavior require downstream browser verification before publication.
