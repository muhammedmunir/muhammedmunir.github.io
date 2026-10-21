# Changelog

All notable changes to this project will be documented in this file.

- 2026-10-21 - feat(redesign): Bioluminescent Neural Cortex, Neural Console & Synaptic Deck overhaul
  - Living Bioluminescent Neural Cortex (`src/lib/NeuralCortexCanvas.svelte`): Deterministic branching axon topology (7 somas, 245 dendrite bifurcations), traveling action potential trails (cyan/violet/gold), DPR cap, visibility/offscreen auto-suspend, user pause toggle, and static SVG fallback.
  - Interactive Connectome Hero (`src/lib/Hero.svelte`): 4-node spatial connectome with native buttons (`aria-pressed`), active state inspection viewport, and SVG synaptic connections.
  - Neural Cortex Console (`src/lib/JarvisHUD.svelte` & `src/lib/cortex-data.ts`): Full rebuild with native `<dialog>` modal, 3 operation modes (Neural Query with local keyword disclosure, Architecture Trace with verified project tech stacks, Executive CLI), speech synthesis caching with opt-in controls, and collision-free `Ctrl/Cmd + K/J` shortcuts.
  - Synaptic Pitch Deck (`src/lib/Presentation.svelte` & `src/lib/deck/*`): 8 executive chapters with native modal isolation, accessible focus restoration to actual trigger, isolated `<details>` keyboard controls, and wrapped bilingual rendering.
  - Section Cohesion (`Experience.svelte`, `Projects.svelte`, `Skills.svelte`, `Contact.svelte`): Replaced heavy blurred glass boxes with clean charcoal surfaces, cyan axon timeline rails, project index numbers (P/01-P/18), native modal project specs, domain connection paths, and fixed the Web3Forms checkbox hydration bug (`bind:checked`).
  - Audio Telemetry (`src/lib/sound.ts`): Audio defaults to OFF (opt-in) with persistent `localStorage` state.
  - Verification & Accessibility: 19/19 Playwright regression tests passed; real a11y-loop CLI audit (5 baseline passes + 24 interaction states); 0 errors and 0 warnings on `svelte-check`; successful static production build.

- 2026-10-15 - feat(redesign): major portfolio overhaul to Neural Mission Control & Sovereign Systems Deck (Option 1)
  - Typography upgraded to Space Grotesk (headings), Inter (body), and JetBrains Mono (telemetry/code) in `src/app.html`.
  - Design system overhauled in `src/routes/layout.css` to Obsidian Void (`#030712`), Electric Cyan (`#38bdf8`), Cyber Indigo (`#818cf8`), Signal Emerald (`#10b981`), and Aerospace Glass.
  - Floating Tactical Command Bar in `src/routes/+layout.svelte` with live Kuala Lumpur clock, ⌘K AI Deck trigger, audio telemetry switch, and direct ATS CV download.
  - Removed deprecated canvas routes `/games` and `/city` for a focused, mature enterprise presentation.
  - Redesigned `src/lib/Hero.svelte` into a Split Tactical Deck: typewriter executive identity on left, interactive 4-domain architecture topology deck on right.
  - Redesigned `src/lib/Experience.svelte` into a Sovereign Operations Timeline with radar beacons, code badges, and mission highlights.
  - Upgraded `src/lib/Skills.svelte` from arbitrary percentage bars to an Architectural Competency Matrix across 3 core domains, complete with production usage notes, Cisco certifications, and UTM degree credentials.
  - Redesigned `src/lib/Contact.svelte` into an Encrypted Sovereign Communications Terminal with Web3Forms integration and direct channel cards.
  - Verified with 0 TypeScript/Svelte errors and 0 warnings via `npm run check` and successful static build.

- 2026-10-14 - feat: add interactive JARVIS Neural HUD assistant, Web Audio SFX synthesis, expanded real-world projects (TINDAK, CV Bot, Lumina Glass, IWA001, YHCM Enterprise Systems), direct ATS resume download, resolve GitHub Pages city route 404, and remove legacy privacy page
- 2026-05-19 - feat: make skills and workflows interactive in presentation component (f627153)
- 2026-05-19 - refactor: optimize CSS class names and styling rules in City Explorer (cec60f7)
- 2026-05-19 - feat: add new City Explorer route and update navigation headers (754abce)
- 2026-05-19 - style: improve mobile responsiveness and layout styling across views (35a3653)
- 2026-05-19 - feat: improve mobile responsiveness, safe area support, and layout navigation (fa86d09)
- 2026-05-18 - feat: Add highly polished interactive Cyberpunk RPG Explorer game and resolve navbar overlaps (c26981d)
- 2026-05-18 - fix: Revert desktop game styles to original, implement mobile screen scaling, fix navbar and floating button on phone (8fd63c4)
- 2026-05-18 - fix: Resolve global scroll lock and optimize mobile game D-pad responsiveness (f392183)
- 2026-05-18 - feat: Add high-fidelity Cyberpunk RPG Portfolio Explorer game and layout optimizations (21b6b30)
- 2026-05-17 - fix: navbar spans full width with 4vw padding (0c69244)
- 2026-05-17 - fix: improve email format with structured message body (576e39d)
- 2026-05-17 - feat: integrate Web3Forms for real contact form submission (be97fdb)
- 2026-05-17 - chore: trigger deploy after repo rename (be6edea)
- 2026-05-17 - fix: empty base path for user site URL (288b466)
- 2026-05-17 - feat: premium portfolio with bilingual support and presentation mode (f950cde)
