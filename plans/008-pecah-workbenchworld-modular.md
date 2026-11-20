# Plan 008: Pecah WorkbenchWorld.ts (111K baris) kepada modul berasingan

> **Commit asas**: `37d96c0`  
> **Kategori**: tech debt & architecture  
> **Keutamaan**: P1 (tanggung jawab teknikal tinggi; fail ini sukar disemak, diuji, dan diselenggara)  
> **Usaha**: L (3–5 hari untuk subagent yang berpengalaman)  
> **Risiko**: MED (refactor besar; memerlukan ujian visual Playwright sebelum & selepas)  
> **Bergantung pada**: 006, 007 (DONE)

---

## Kenapa ini penting

`src/lib/workbench/WorkbenchWorld.ts` (111,277 baris, 43 KB) adalah **monolit terbesar** dalam repositori. Ia mengandungi:
- Pembinaan adegan Three.js (geometri, bahan, cahaya, kamera)
- Logik render & pembetulan `offscreen` / `IntersectionObserver`
- Pengendalian input (mouse, tetikus, sentuhan, pinch zoom)
- Hologram & pancaran shader
- Stesen dossiere (profil, perjalanan, kemahiran) — sepatutnya dalam fail berasingan
- Papan kekunci & kawalan aksesibiliti
- Penyertaan dinamik imej & tekstur

Kesannya:
- **Ujian unit mustahil** — tiada fungsi tulen yang boleh diuji secara terpisah.
- **Semakan kod sukar** — PR menimbulkan diff besar yang sukar diverifikasi.
- **Kompilasi TypeScript lambat** — `svelte-check` mengesan 730 fail; fail ini menambahkan beban parser.
- **Kebolehselenggaraan** — sebarang perubahan kecil (cth: warna bahan) memerlukan membaca ribuan baris kod tak berkaitan.

---

## Keadaan semasa (bukti)

```bash
wc -l src/lib/workbench/WorkbenchWorld.ts
# 111277
```

Fail ini mengeksport `WorkbenchWorld` class yang di-instansiasi oleh `Workbench.svelte` (baris 157–172). `Workbench.svelte` memanggil kaedah:
- `setState()`, `setFocus()`, `setTheme()`, `setLocale()`, `setJourneyStep()`, `setSkillCategory()`, `setPaused()`, `nextSample()`, `zoomBy()`, `resetCamera()`, `dispose()`

Tiada ujian unit sedia ada untuk `WorkbenchWorld` (hanya ujian integrasi `workbench-smoke.mjs` dan `workbench-camera-fit.test.mjs`).

---

## Skop

**Dalam skop**:
- Pecah `WorkbenchWorld.ts` kepada modul berikut (semua dalam `src/lib/workbench/`):
  1. `scene-setup.ts` — pembinaan `THREE.Scene`, `renderer`, `camera`, cahaya, `IntersectionObserver` offscreen
  2. `materials.ts` — semua `THREE.Material` (bahan meja, rak, pelayan, LED, hologram, dll.)
  3. `geometries.ts` — geometri meshes (meja, konsol, rak, pelayan, router, kabel, kad, dll.)
  4. `hologram.ts` — logik hologram, shader, pancaran, animasi `beamGroup`
  5. `input-handler.ts` — mouse, wheel, touch, pinch, raycaster, hover, anchors
  6. `camera-controller.ts` — `fitPerspectiveBounds`, zoom, reset, fokus (panoramic/console/rack/router)
  7. `asset-loader.ts` — muatan imej, tekstur kanvas (skematik, label rak), `loadedImages` cache
  8. `dossier-station.ts` — **pindahkan** `DossierStation` class dari `DossierStation.ts` (53K baris) ke sini atau pecah lagi
  9. `workbench-world.ts` — **fail utama yang dikecilkan** (≈2–3K baris) yang mengimport & mengomposkan modul di atas, mengeksport `WorkbenchWorld` class dengan API sedia ada

- `Workbench.svelte` — **tidak ubah API**; hanya pastikan import `WorkbenchWorld` masih berfungsi
- Ujian visual Playwright sebelum & selepas (1440px & 390px)
- Ujian kamera (`workbench-camera-fit.test.mjs`) mesti lulus

**Luar skop**:
- `DossierStation.ts` asal (boleh dibuang selepas modul `dossier-station.ts` stabil)
- `camera-fit.mjs` (sudah berasingan, kekalkan)
- Logik simulasi SOC/RBAC dalam `Workbench.svelte`
- Token reka bentuk (`--work-*`), palet warna Three.js (`C` object)

---

## Aliran kerja git

```bash
git switch -c refactor/workbenchworld-modular
# Commit per modul:
# feat(workbench): tambah scene-setup.ts
# feat(workbench): tambah materials.ts
# feat(workbench): tambah geometries.ts
# feat(workbench): tambah hologram.ts
# feat(workbench): tambah input-handler.ts
# feat(workbench): tambah camera-controller.ts
# feat(workbench): tambah asset-loader.ts
# feat(workbench): tambah dossier-station.ts (pindahkan DossierStation)
# refactor(workbench): kurangkan WorkbenchWorld.ts kepada komposisi modul
# Jangan push.
```

---

## Pelan langkah demi langkah

### Langkah 0: Rekod baseline visual & ujian

```bash
# Jalankan ujian baseline
npm run check
npm test
npm run build
WORKBENCH_URL=http://localhost:5199/ node scripts/workbench-smoke.mjs
HOME_URL=http://localhost:5199/ node scripts/home-visual.mjs
# Simpan tangkapan Playwright
mkdir -p .crew/artifacts/workbenchworld-baseline
# (Playwright script untuk 1440.png & 390.png)
```

### Langkah 1: Cipta `scene-setup.ts`

**Kandungan**: `renderer`, `scene`, `camera`, `studioHemisphere`, `studioKey`, `studioFill`, `IntersectionObserver` offscreen, `dispose()`.

**Petunjuk**: Ambil kod dari `WorkbenchWorld.ts` konstruktor (baris ~44–110) dan kaedah `setOffscreen`, `dispose`.

### Langkah 2: Cipta `materials.ts`

**Kandungan**: Semua bahan `THREE.Material` — `floorMat`, `studioWallMat`, `acousticPanelMat`, `studioTrimMat`, `clerestoryMat`, `studioFloorPadMat`, `projectEsdMat`, `serverLedMats[]`, `deskSurfaceMat`, `deskTrimMat`, `keycardMats[]`, `outerBeamMat`, `innerBeamMat`, `lensMat`, `slotLedMat`, `plugLedMat`, `routerBarMat`, `routerOledCanvas`.

**Petunjuk**: Eksport fungsi `createMaterials()` yang mengembalikan object dengan semua bahan. Gunakan warna dari `C` object (pindahkan `C` ke `constants.ts` — lihat Langkah 9).

### Langkah 3: Cipta `geometries.ts`

**Kandungan**: Semua `THREE.BufferGeometry` — meja, konsol, rak, pelayan, router, kabel, kad, plug, projector, beam, slot, lens, dsb. Eksport fungsi `createGeometries()` yang mengembalikan Map/Object geometri.

**Petunjuk**: `geometries` Set (baris 77) dipindahkan ke sini.

### Langkah 4: Cipta `hologram.ts`

**Kandungan**: `beamGroup`, `projectorHead`, `lid`, `plug`, `owner`, `visitor`, animasi hologram, shader, `schematicCanvas`, `schematicTex`, logik `nextSample()`.

**Petunjuk**: Kaedah `setFocus('data')`, `nextSample()`, animasi `beamGroup` dipindahkan ke sini.

### Langkah 5: Cipta `input-handler.ts`

**Kandungan**: `raycaster`, `pointer`, `activePointers`, `pinchStartDist`, `pinchStartZoom`, penangan `pointerdown`, `pointermove`, `pointerup`, `wheel`, `touchstart`, `touchmove`, `touchend`, `hits`, `anchors` update.

**Petunjuk**: Eksport class `InputHandler` dengan kaedah `attach(canvas, callbacks)` dan `detach()`.

### Langkah 6: Cipta `camera-controller.ts`

**Kandungan**: `camera`, `focusBounds` Map, `consoleBounds`, `screenBounds`, `fitPerspectiveBounds` import, kaedah `setFocus()`, `zoomBy()`, `resetCamera()`, `panoramic`, `console`, `rack`, `router`.

**Petunjuk**: Import `fitPerspectiveBounds` dari `camera-fit.mjs` (sudah berasingan).

### Langkah 7: Cipta `asset-loader.ts`

**Kandungan**: `loadedImages` Map, `pendingImages` Set, `projectDeskGroup`, muatan imej dinamis, `createRackLabels()`, `createSchematicTexture()`.

**Petunjuk**: Kaedah yang menggunakan `base` dari `$app/paths` mesti dipindahkan dengan hati-hati (SvelteKit module).

### Langkah 8: Cipta `dossier-station.ts`

**Kandungan**: Pindahkan **seluruh** `DossierStation` class dari `DossierStation.ts` (53,854 baris) ke sini. Jika terlalu besar, pecah lagi kepada `dossier-profile.ts`, `dossier-journey.ts`, `dossier-skills.ts`.

**Petunjuk**: `DossierStation` di-instansiasi dalam `WorkbenchWorld` konstruktor (baris 45). Pastikan API `setView()`, `setJourneyStep()`, `setSkillCategory()` kekal.

### Langkah 9: Cipta `constants.ts`

**Kandungan**: Object `C` (warna), `Part`, `FocusView`, `BenchState`, `Options` type, dan konstanta lain yang dikongsi.

### Langkah 10: Tulis semula `workbench-world.ts`

**Kandungan**: Class `WorkbenchWorld` yang **hanya mengomposkan** modul di atas:
```ts
import { createScene } from './scene-setup';
import { createMaterials } from './materials';
import { createGeometries } from './geometries';
import { Hologram } from './hologram';
import { InputHandler } from './input-handler';
import { CameraController } from './camera-controller';
import { AssetLoader } from './asset-loader';
import { DossierStation } from './dossier-station';
```

Konstruktor: panggil setiap `createX()`, simpan rujukan, `this.hologram = new Hologram(...)`, `this.input = new InputHandler(...)`, dll.

Kaedah API (`setState`, `setFocus`, `setTheme`, `setLocale`, `setJourneyStep`, `setSkillCategory`, `setPaused`, `nextSample`, `zoomBy`, `resetCamera`, `dispose`) mendelegasikan ke modul berasingan.

### Langkah 11: Verifikasi & ujian regresi

```bash
npm run check          # 0 ERRORS 0 WARNINGS
npm test               # 40/40 lulus
npm run build          # exit 0
WORKBENCH_URL=http://localhost:5199/ node scripts/workbench-smoke.mjs  # SMOKE OK
HOME_URL=http://localhost:5199/ node scripts/home-visual.mjs           # HOME OK
npm run test:contrast  # 314/314 lulus
```

**Ujian visual Playwright** (1440px & 390px) — bandingkan dengan baseline Langkah 0. Tiada perbezaan visual.

---

## Pelan ujian

- **Baharu**: Tiada ujian unit baharu diperlukan (refactor mesti mengekalkan API). Jika masa membenarkan, tambah ujian unit untuk `camera-controller.ts` (`fitPerspectiveBounds` edge cases) dan `asset-loader.ts` (cache imej).
- **Visual/a11y**: Langkah 11 (Playwright 1440px & 390px, fokus papan kekunci, reduced-motion, tiada overflow).
- **Regresi**: Langkah 11 (semua ujian sedia ada mesti lulus).

---

## Kriteria siap

- [ ] `src/lib/workbench/WorkbenchWorld.ts` < 5,000 baris (dari 111,277)
- [ ] 9 modul baharu wujud di `src/lib/workbench/` (`scene-setup.ts`, `materials.ts`, `geometries.ts`, `hologram.ts`, `input-handler.ts`, `camera-controller.ts`, `asset-loader.ts`, `dossier-station.ts`, `constants.ts`)
- [ ] `npm run check` → `0 ERRORS 0 WARNINGS`
- [ ] `npm test` → `0` gagal (40 lulus)
- [ ] `npm run build` → exit 0
- [ ] `workbench-smoke.mjs` → `SMOKE OK`
- [ ] `home-visual.mjs` → `HOME OK`
- [ ] Tangkapan `.crew/artifacts/workbenchworld-refactor/1440.png` & `390.png` wujud & serupa baseline
- [ ] `grep -rn "box-shadow\|filter: blur" src/lib/workbench/` → tiada (kecuali `:focus-visible` outline)
- [ ] `DossierStation.ts` asal dibuang (atau diarkibkan ke `docs/archive/`)

---

## Syarat STOP

- Ujian `workbench-camera-fit.test.mjs` gagal: **STOP** — kameranya rosak, jangan teruskan.
- Playwright visual menunjukkan perbezaan (cth: cahaya hilang, geometri tersembunyi): **STOP** — bandingkan baseline, baiki modul yang berkenaan.
- `npm run check` menunjukkan ralat TypeScript baru: **STOP** — baiki jenis sebelum commit seterusnya.
- Refactor melebihi 5 hari: **STOP** — lapor kemajuan, pecah kepada PR lebih kecil.

---

## Nota penyelenggaraan

- Modul `materials.ts` & `geometries.ts` adalah kandida terbaik untuk **uji visual automatik** (snapshot rendering headless) masa hadapan.
- `hologram.ts` boleh dikembangkan untuk shader yang lebih canggih (post-processing) tanpa menyentuh logik lain.
- `input-handler.ts` boleh dikongsi jika masa hadapan ada dunia 3D lain (cth: `/spatial`).
- Jangan tambah `export` baru yang tidak dipanggil oleh `WorkbenchWorld` — elakkan API membesar tanpa keperluan.