# Immersive 3D WebGL Portfolio: Research, Benchmark Evidence & Architectural Direction

**Document Status:** DRAFT — Architectural Direction & Bounded Reconnaissance  
**Author Role:** Research & Technical Writer (`03_write`)  
**Date:** 21 October 2026  
**Scope:** Read-Only Audit, Live Browser Reconnaissance, and Spatial Concept Proposal  
**Implementation Gate:** Requires User Visual Prototype Approval before any source code refactoring.

---

## 1. Executive Summary & Root-Cause Autopsy

The previous iteration, _"Di Sebalik Sistem"_, was explicitly rejected by the user:

> _"anda dah tukar theme baru tapi bagi saya ini lagi membosankan dari sebelum ini sebab ini seperti profolio biasa... tak lebih portfolio simple yang semua orang boleh buat... sekrang amat membosankan degan 3d sikit saja dan tanpa animation langsung... saya nak website unik dan paling padu dan animation dan 3D bukan yang sekarang."_

### 1.1 Why "Di Sebalik Sistem" Failed

The failure of the current implementation was caused by three structural design choices:

1. **The "Fake 3D" Vector Mechanism:**  
   In `src/lib/NeuralCortexCanvas.svelte` (lines 78–140), the hero element presented as a "3D system model" is in reality an isometric 2D SVG canvas (`viewBox="0 0 600 500"`) drawn using static SVG `ellipse`, `polygon`, and `path` elements with 2D CSS `transform: translate(...)`. It provides zero WebGL depth buffer (`Z-buffer`), zero camera perspective, zero volumetric lighting, and zero spatial projection. Confined to an isolated 600×500px card, the user immediately recognized it as a static, flat editorial vector ornament.
2. **Dogmatic Motion Suppression in DESIGN.md:**  
   In `DESIGN.md` (lines 8–27), design policies artificially banned animation:
   - _"New shell/sections introduce no animation."_
   - _"No neon, glow, glass panels, emoji badges or invented telemetry."_
   - _"The hero’s layered system illustration is explicitly conceptual, never presented as live infrastructure."_  
     Treating accessibility as an excuse to eliminate motion produced a lifeless corporate publication. High-craft accessibility provides an alternative static presentation for users with vestibular sensitivities (`prefers-reduced-motion`), without penalizing default users who expect an expressive visual experience.
3. **Suppression of Modern Craft Typography:**  
   The implementation selected Georgia/Arial and an editorial hierarchy. Those fonts are not inherently inferior; the mismatch was choosing a restrained publication-like direction for a brief demanding an expressive spatial experience. The user's rejection, not a font popularity ranking, is the evidence of that mismatch.

---

## 2. Live Browser Reconnaissance: High-Craft Benchmarks

Live browser testing was conducted sequentially via Playwright browser automation on 21 October 2026. All findings strictly distinguish **actual recorded observations** (DOM structures, network requests, console logs, and interaction events) from **inferences**.

### Capability & Evidence Honesty Notice

_Both child worker and parent runtime environments operating on `omni-all` lack image inspection tooling (`"Current model does not support images"`). Consequently, reference site camera choreography, materials, lighting, and aesthetic evaluations derived from screenshots are marked **UNVERIFIED BY MODEL** and must be visually validated by the user or a vision-capable runtime. Telemetry, DOM, network, and interaction data are verified._

Evidence screenshots are preserved under `.playwright-mcp/`:

- `research-bruno-live.png`
- `research-bokoko-live.png`
- `research-lusion-ready.png`, `research-lusion-scroll.png`, `research-lusion-menu.png`, `research-lusion-live.png`
- `research-lusion-project-mobile.png`, `research-choo-mobile.png`, `research-choo-started-mobile.png`
- `research-dennis-entry.png`, `research-dennis-scroll.png`
- `research-active-entry.png`

---

### Bounded Reference Site Analysis

| Site & URL                                        | Observed DOM & Network Architecture                                                                                                                                                                                                                                                                                                                                                                                                                                  | Interaction & Mechanical Observations                                                                                                                                                                                                                                                                     | Console & Error Telemetry                                                                                                                                                                                                                                                                                 | Feasibility & Relevance to Munir                                                                                                                                                                                                |
| :------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Bruno Simon**<br>`bruno-simon.com`              | **Stack:** Three.js r183 + TSL (dual WebGL/WebGPU pipeline), Rapier physics, Howler audio.<br>**Assets:** Network 200 OK for compressed GLB models (`terrain`, `vehicle`, `areas`, `playground`, `respawnsReferences-compressed.glb`), KTX compressed textures (`stars.ktx`, `palette.ktx`).                                                                                                                                                                         | **Viewport:** 1440×900.<br>**Controls:** Enter and ArrowUp sent; on-screen UI for _Interact_, _Unstuck_, _WebGPU toggle_, _Quality settings_, and mobile virtual gamepad.<br>_(Visual effect of movement unverified due to image tool limitation)._                                                       | Logged ASCII stack banner.<br>Windows WebGPU adapter warning (`crbug.com/369219127`).<br>4 preload warnings for unconsumed GLB/KTX assets.                                                                                                                                                                | **Relevance:** Exemplary physics and spatial project portals.<br>**Inauthenticity Hazard:** A toy car physics game is completely ungrounded for an enterprise systems architect. Copying this directly would look like a clone. |
| **Bokoko33**<br>`bokoko33.me`                     | **Current Live Routing:** The live site (`bokoko33.me`) renders a high-craft **Works** index (filtered by "design & dev" and "dev only") and an **About** route.<br>_(Direct observation disproves upstream assumption that `room.bokoko33.me` is the default active route)._                                                                                                                                                                                        | **Observed structure only:** Works grouped under “design & dev” and “dev only”, with an About link. Filtering, hover effects, contrast and mouse inertia were NOT independently verified.                                                                                                                 | One console error appeared on navigation. No complete network or performance audit was conducted.                                                                                                                                                                                                         | **Relevance:** Proves that developer portfolios need crisp, direct project categorization alongside immersive flair.                                                                                                            |
| **Lusion**<br>`lusion.co`                         | **Observed:** 3 `<canvas>` elements. Canvas count alone does not establish rendering APIs or framework; Astro/Vite was not independently verified.<br>**Project Follow-Up:** `lusion.co/projects/choo_choo_world` linking to `choochooworld.com`. Tested on mobile (390×844): 1 canvas, accessible _"Start Building"_ button; clicking button transitions body text into a full-canvas interface (0 errors, 1 warning). Automated agent did not prove track editing. | **Actions performed:** Pointer moved and wheel scrolled 720px; the resulting visual motion is unverified.<br>**UI integration:** Clicking the labelled menu button exposed `Home`, `About us`, `Projects`, `Contact`, `Labs` in the accessibility snapshot. Slide choreography was not visually verified. | **Console Telemetry:**<br>12 Errors (CSP violations on Cloudflare Turnstile `data:,` endpoints, 401 on Vimeo player video `761102167`).<br>15 Warnings (WOFF2 font decompression size mismatch, adapter fallbacks).<br>_Observation: Even top-tier WebGL experiences exhibit runtime console turbulence._ | **Relevance:** A candidate reference for integrated immersive work presentation. Spatial depth, legibility over scenes and absence of collisions still require visual inspection.                                               |
| **Dennis Snellenberg**<br>`dennissnellenberg.com` | **Stack:** **0 WebGL Canvases!** High-craft interactive motion is achieved entirely via DOM, SVG, and smooth-scroll inertia (GSAP / Locomotive-style ticker). No 3D WebGL splines exist here.                                                                                                                                                                                                                                                                        | **Observed:** Greeting strings, repeated name text, work links (`TWICE`, `The Damai`, `FABRIC`, `Aanstekelijk`); scrolled 850px. Magnetic effects, typography scaling and visual choreography were not verified.                                                                                          | Completely clean console; zero WebGL initialization overhead.                                                                                                                                                                                                                                             | **Relevance:** Demonstrates that kinetic typography and pacing create immense perceived craft. However, because the user explicitly requested **real 3D**, Dennis's DOM-only approach cannot be the sole solution.              |
| **Active Theory**<br>`activetheory.net`           | **Stack:** 1 WebGL `<canvas>`, text-scramble custom preloader, bespoke `FXScroll` interaction layer.                                                                                                                                                                                                                                                                                                                                                                 | **Observed Failure:** Attempting to click the _"Work"_ navigation item was blocked because the bespoke `FXScroll` overlay intercepted pointer events. Agent could not confirm navigation.                                                                                                                 | Deprecated `<meta name="apple-mobile-web-app-capable">` warning.<br>CookieNotice initialization timing warning.                                                                                                                                                                                           | **Caution:** The automated click was intercepted in this browser state; this is not proof that normal user navigation is broken. Our own implementation must nevertheless keep DOM links directly operable.                     |

---

## 3. Repository Capacity & Constraint Ledger

An audit of the current workspace confirms the technical boundaries:

| Asset / Library                 | Repo Status                                                                                      | Implementation Implication                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| :------------------------------ | :----------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Three.js**                    | Verified installed (`three@^0.186.1`, `@types/three@^0.186.0` in `package.json`).                | Full WebGL2 capabilities, instanced rendering, buffer shaders available immediately.                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **GSAP**                        | Verified installed (`gsap@^3.15.0` in `package.json`).                                           | Ready for scroll-linked timeline interpolation and camera spline choreographies.                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **3D Models (`.glb`, `.gltf`)** | **0 binary 3D assets exist in `static/`** (`find static -name "*.glb"` returned 0).              | **Asset Pipeline Reality:** The repo presently contains no 3D asset files. While custom original models can be authored or imported in the future, the initial prototype must not depend on an unverified asset pipeline. It should combine authored procedural geometries, extruded SVGs, and lightweight custom shaders.                                                                                                                                                                                 |
| **Audio Engine**                | Verified functional (`src/lib/sound.ts`).                                                        | Procedural Web Audio API synthesis already built (`playBlip`, `playConfirm`) with persisted user opt-in (`localStorage.getItem('jarvis_sfx') === 'true'`).                                                                                                                                                                                                                                                                                                                                                 |
| **Verified Work Baseline**      | Audited in `src/lib/system-projects.ts`, `src/lib/translations.ts`, and `src/lib/Skills.svelte`. | Verified background: B.Sc. Computer Science (Networks & Security) UTM (2021–2024), Cisco Networking Academy CCNAv7 (CISCO-CCNA1, CCNA2, SEC, DEVNET), Ethical Hacking / Network Security coursework (Metasploit, Nmap, Burp Suite, Wireshark, Snort), Enterprise Mobility (TNB OnboardX on Azure, Jenkins, Flutter), Public-Sector Systems (YHCM eMesys on Docker Swarm, Vue 3, Laravel 11), Computer Vision (cv_bot on OpenCV, SIFT, CIELAB, Win32). Speculative industry SOC Blue/Red roles are avoided. |

---

## 4. The Recommended Concept: "The Tactile Engineering Monolith"

### 4.1 Rejecting Generic AI Tropes

We explicitly reject generic neon particle blizzards, floating wireframe cubes, sci-fi HUD clichés, or toy car clones. Those patterns represent the same generic, soulless output that disappointed the user.

Instead, we propose **The Tactile Engineering Monolith**:  
A physical, impossible architectural structure engineered from dark matte carbon, brushed titanium, and warm copper heat-sinks. The 3D world is not a flat particle grid; it is a monumental, tactile machine where the camera travels **INSIDE the architectural structure**, transitioning through three materially distinct project chambers.

---

### 4.2 Three Materially Distinct Project Chambers

Each chamber reflects Munir's verified engineering projects through distinct material qualities, lighting, and spatial mechanics:

1. **Chamber 1 — The Logistics Core (eMesys / Public-Sector Enterprise Systems):**
   - **Material Identity:** Heavy industrial matte basalt, interlocking brushed-copper architectural plates, and disciplined mechanical linkages.
   - **Spatial Mechanic:** Conceptually represents documented public-sector workflows and Docker Swarm deployment; it does not claim measured concurrency or reproduce confidential infrastructure. As the user scrolls, massive interlocking container blocks slide along structural rails, exposing internal service conduits and database status strata.
2. **Chamber 2 — The Cloud Conduit (OnboardX / TNB Enterprise Mobility):**
   - **Material Identity:** Translucent frosted glass slabs, structural titanium ribbing, and synchronized vertical bus conduits.
   - **Spatial Mechanic:** Represents mobile synchronization across Azure, Jenkins CI/CD, and multi-database topologies. The camera glides along elevated vertical conduit ribs that guide light pulses between cloud planes and mobile substrates.
3. **Chamber 3 — The Computer Vision Chamber (cv_bot / OpenCV Desktop Automation):**
   - **Material Identity:** Dark optical glass, mechanical lens apertures, and precise laser-etched target coordinate planes.
   - **Spatial Mechanic:** Reflects OpenCV SIFT feature matching, CIELAB segmentation, and Win32 safety boundaries. Dynamic spatial reticles and depth crosshairs lock onto focal coordinates as the camera pushes through the aperture.

---

### 4.3 Pacing, Interaction & Accessibility Architecture

#### Time-Domain Narrative

- **0s–3s (Intro Sequence — Max 3s, Explicitly Skippable):**
  - High-impact architectural boot sequence: the monolithic structure powers on, apertures align, and the camera drops into the primary observation angle.
  - An explicit on-screen control (`[Skip Intro]`) or immediate scroll action instantly bypasses the reveal animation.
  - If audio is unmuted by user opt-in, a clean mechanical blip triggers via `sound.ts`.
- **3s–15s (Tactile Hero Parallax):**
  - Pointer/touch movement imparts weighted, spring-damped parallax to the camera.
  - Hovering primary interface targets illuminates localized internal volumetric point lights within the sculpture.
- **15s–60s (Scroll-Driven Interior Journey):**
  - Native scrolling drives the WebGL camera along an authored 3D spline traveling through the three project chambers.
  - High-contrast HTML typography floats over the 3D canvas, ensuring complete readability.
- **Anchorage (< 2 Actions to Contact):**
  - Contact channels (Email, LinkedIn, WhatsApp/Form) are permanently accessible via the fixed header navigation or reachable in less than 2 user actions at any point in the journey.

#### Pointer & Hit-Testing Interaction Architecture

To eliminate the contradiction between 3D raycasting and background DOM pass-through:

- The persistent WebGL canvas uses `pointer-events: none` by default so all native text, links, and buttons receive direct, unblocked clicks.
- Coordinate-coordinated raycasting is achieved by capturing pointer movements on the window level (`pointermove`) and projecting rays into the Three.js scene, triggering dynamic 3D lighting without stealing clicks from semantic HTML elements.
- Dedicated 3D interactive targets utilize explicit interactive DOM anchor overlays.

#### Accessibility (`prefers-reduced-motion`)

- **Complete Motion Freeze:** When `prefers-reduced-motion: reduce` is detected:
  - All camera travel, orbital rotation, and ambient breathing animations are **fully frozen**.
  - The camera is locked into a static, composed hero framing.
  - Section transitions occur via instant, standard jumps without motion sickness.
  - Full keyboard focus, tab ordering, and semantic screen-reader flows remain operational.
  - _Target: WCAG 2.2 Level AA. This is a proposed interaction contract, not an implemented or verified conformance claim._

#### WebGL Fallback

- If WebGL2 context initialization fails (e.g., hardware acceleration disabled), show a locally authored static poster of the same world plus the complete semantic project index and contact controls. Poster generation must be proven by the prototype. Context creation failure is handled without an uncaught exception; a gradient alone is not an equivalent designed fallback.

---

## 5. Technical Risk & Feasibility Ledger

| Risk Factor                                | Classification          | Validated Evidence vs. Hypothesis                                                                                                               | Architectural Mitigation                                                                                                                                                                                     |
| :----------------------------------------- | :---------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Asset Pipeline Constraints**             | **High (Validated)**    | Audited `static/`: Contains **0** GLTF/GLB models. Authoring a full Blender environment is unproven in this repo.                               | Author initial prototype using procedural Three.js geometries, extruded SVGs, and custom GLSL shader materials. Author original models only when asset pipeline is proven.                                   |
| **Mobile GPU Overheating & Battery Drain** | **Medium (Hypothesis)** | Hypothesized risk that high DPR render loops will cause frame drops and thermal throttling on mobile devices. Real hardware test data required. | Clamp DPR to `Math.min(window.devicePixelRatio, 1.5)`. Halt rendering loop when `document.visibilityState === 'hidden'`. Reduce instanced element counts on mobile. Empirically measure FPS on real devices. |
| **Scroll-Jank Collisions**                 | **Medium (Hypothesis)** | Hypothesized risk that heavy DOM reflows will collide with WebGL camera spline updates.                                                         | Decouple render loop (`requestAnimationFrame`) from scroll events using GSAP ticker smoothing. WebGL canvas uses `pointer-events: none`.                                                                     |
| **Event Hijacking (Active Theory hazard)** | **High (Validated)**    | An automated Work click at Active Theory was blocked by an overlay in the observed state. Broader user impact is unverified.                    | Native browser scrolling is strictly preserved. GSAP `ScrollTrigger` listens passively to native scroll offsets without intercepting clicks or focus.                                                        |
| **Model Vision Capability Limitation**     | **High (Validated)**    | Both parent and child runtimes (`omni-all`) report: `"Current model does not support images"`.                                                  | Visual aesthetics, lighting, and materials are explicitly marked unverified by model. Mandate direct visual approval by user on the interactive prototype.                                                   |

---

## 6. Implementation Strategy: Prototype-First Acceptance Gates

To prevent another full rewrite before confirming the user's aesthetic taste, work proceeds through strict acceptance gates:

```
[Gate 1: Direction & Bounded Research Approval]  ◄── CURRENT STATUS (docs/immersive-research.md)
                      │
[Gate 2: Focused 3D Prototype in src/lib/]       Build standalone WebGL canvas in src/lib/
                      │                          Empirically measure desktop & mobile FPS
                      │
[Gate 3: User Visual Approval]                   User directly reviews visual craft, tactile materials, and motion
                      │
[Gate 4: Whole-Page Integration]                 Wire GSAP ScrollTrigger camera spline across full layout
```

### Prototype Acceptance Checklist

- [ ] Standalone Three.js WebGL canvas boots cleanly in `src/lib/` with 0 console errors.
- [ ] Monolithic structure renders with tactile physical materials (matte basalt, brushed copper) and dynamic lighting.
- [ ] Frame timing measured in desktop browser and mobile emulation; emulated viewport results explicitly NOT described as real-phone GPU performance. Real-device performance remains a separate test.
- [ ] Full freeze for `prefers-reduced-motion` verified.
- [ ] Explicit user visual approval obtained before modifying production portfolio pages.
