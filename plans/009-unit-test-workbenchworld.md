# Plan 009: Ujian unit untuk WorkbenchWorld (sebelum refactor)

> **Commit asas**: `37d96c0`  
> **Kategori**: test coverage  
> **Keutamaan**: P0 (prasyarat untuk Plan 008 — "characterization tests first")  
> **Usaha**: M (2–3 hari)  
> **Risiko**: LOW (hanya tambah ujian, tidak ubah kod)  
> **Bergantung pada**: 006, 007 (DONE)

---

## Kenapa ini penting

`WorkbenchWorld.ts` (111K baris) **tiada ujian unit**. Sebelum refactor (Plan 008), kita perlukan **characterization tests** yang mengunci tingkah laku semasa. Tanpa ini, refactor berisiko tinggi: sebarang perubahan kecil boleh memecahkan kamera, hologram, input, atau render tanpa dikesan.

---

## Keadaan semasa

- `scripts/workbench-camera-fit.test.mjs` menguji `fitPerspectiveBounds` (fungsi tulen di `camera-fit.mjs`) — **baik**.
- `scripts/workbench-smoke.mjs` & `home-visual.mjs` — ujian integrasi Playwright (lambat, tidak menguji logik dalaman).
- **Tiada** ujian unit untuk:
  - `transition()` / `outcome()` dalam `system-state.mjs` (sudah diuji dalam `workbench.test.mjs` ✓)
  - Kaedah `WorkbenchWorld`: `setState()`, `setFocus()`, `setTheme()`, `setLocale()`, `zoomBy()`, `resetCamera()`, `nextSample()`, `dispose()`
  - Logik input (raycaster, hover, anchors)
  - Logik hologram (beamGroup, shader)
  - Logik aset (cache imej, label rak)

---

## Skop

**Dalam skop**:
- Cipta `scripts/workbench-world.test.mjs` (corak `scripts/workbench.test.mjs`)
- Ujian unit untuk **API awam WorkbenchWorld** (konstruktor, kaedah awam, `dispose()`)
- Ujian untuk **fungsi tulen** yang diekstrak (jika Plan 008 belum dijayakan, ujian ke atas `WorkbenchWorld` terus)
- Gunakan `playwright` headless dengan `--use-angle=swiftshader` untuk menginstansiasi `WorkbenchWorld` dalam Node (Three.js + WebGL2 via SwiftShader)

**Luar skop**:
- Ujian visual (Playwright screenshot) — sudah wujud dalam `workbench-smoke.mjs` / `home-visual.mjs`
- Ujian `DossierStation` (terlalu besar; pecah dalam Plan 008 dahulu)

---

## Aliran kerja git

```bash
git switch -c test/workbench-world-unit
# Commit:
# test(workbench): tambah ujian unit WorkbenchWorld (characterization)
# Jangan push.
```

---

## Pelan langkah demi langkah

### Langkah 1: Cipta harness ujian Three.js dalam Node

**Fail**: `scripts/workbench-world-test-harness.mjs`

```js
import { chromium } from 'playwright';
import * as THREE from 'three';

// Launch headless browser dengan SwiftShader untuk WebGL2
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
});

const page = await browser.newPage({ viewport: { width: 800, height: 600 } });

// Inject Three.js & WorkbenchWorld
await page.addScriptTag({ url: 'https://unpkg.com/three@0.186.1/build/three.module.js', type: 'module' });
// Atau gunakan dynamic import dari built bundle

export { browser, page };
```

**Alternatif (lebih cepat)**: Gunakan `three` dengan `node:test` + `canvas` mock (Three.js boleh jalan di Node dengan `canvas` package). Liha `scripts/workbench-camera-fit.test.mjs` — ia tidak memerlukan browser.

### Langkah 2: Ujian konstruktor & `dispose()`

```js
test('WorkbenchWorld konstruktor mencipta renderer, scene, camera', async () => {
  const { page } = await setup();
  const world = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    const { WorkbenchWorld } = await import('/src/lib/workbench/WorkbenchWorld.ts'); // perlu Vite dev server
    const w = new WorkbenchWorld(canvas, { action: () => {}, hover: () => {}, anchors: () => {}, failure: () => {} });
    return { hasRenderer: !!w.renderer, hasScene: !!w.scene, hasCamera: !!w.camera };
  });
  assert.equal(world.hasRenderer, true);
  assert.equal(world.hasScene, true);
  assert.equal(world.hasCamera, true);
});

test('dispose() membersihkan renderer, geometries, materials, textures', async () => {
  const { page } = await setup();
  const result = await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    const { WorkbenchWorld } = await import('/src/lib/workbench/WorkbenchWorld.ts');
    const w = new WorkbenchWorld(canvas, { action: () => {}, hover: () => {}, anchors: () => {}, failure: () => {} });
    const before = { geometries: w.geometries.size, materials: w.materials.size, textures: w.textures.size };
    w.dispose();
    const after = { geometries: w.geometries.size, materials: w.materials.size, textures: w.textures.size };
    return { before, after };
  });
  assert.equal(result.after.geometries, 0);
  assert.equal(result.after.materials, 0);
  assert.equal(result.after.textures, 0);
});
```

### Langkah 3: Ujian `setFocus()` & `zoomBy()`

```js
test('setFocus("console") mengubah camera position', async () => {
  const { page } = await setup();
  const positions = await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    const { WorkbenchWorld } = await import('/src/lib/workbench/WorkbenchWorld.ts');
    const w = new WorkbenchWorld(canvas, { action: () => {}, hover: () => {}, anchors: () => {}, failure: () => {} });
    const initial = w.camera.position.clone();
    w.setFocus('console');
    const consolePos = w.camera.position.clone();
    w.setFocus('rack');
    const rackPos = w.camera.position.clone();
    return { initial: [initial.x, initial.y, initial.z], console: [consolePos.x, consolePos.y, consolePos.z], rack: [rackPos.x, rackPos.y, rackPos.z] };
  });
  // Verify positions berbeza
  assert.notDeepEqual(positions.initial, positions.console);
  assert.notDeepEqual(positions.console, positions.rack);
});

test('zoomBy(-0.12) mendekatkan camera (zoom in)', async () => {
  const { page } = await setup();
  const result = await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    const { WorkbenchWorld } = await import('/src/lib/workbench/WorkbenchWorld.ts');
    const w = new WorkbenchWorld(canvas, { action: () => {}, hover: () => {}, anchors: () => {}, failure: () => {} });
    const initial = w.camera.position.length();
    w.zoomBy(-0.12);
    const after = w.camera.position.length();
    return { initial, after };
  });
  assert.ok(result.after < result.initial); // zoom in = camera lebih dekat
});
```

### Langkah 4: Ujian `setTheme()` & `setLocale()`

```js
test('setTheme("dark") mengubah bahan warna', async () => {
  // Verify bahan tertentu (cth: floorMat.color) berubah
});

test('setLocale("en") mengubah teks hologram/label', async () => {
  // Verify schematicTex atau label rak mengandungi teks EN
});
```

### Langkah 5: Ujian input handler (raycaster, hover, anchors)

```js
test('pointermove mengemaskini anchors object', async () => {
  // Simulasikan pointermove, semak anchors dipanggil
});

test('click pada "data" memanggil action("data")', async () => {
  // Simulasikan click pada mesh data, semak callback action dipanggil
});
```

### Langkah 6: Ujian hologram (beamGroup, nextSample)

```js
test('nextSample() mengubah slide index', async () => {
  // Verify beamGroup children / slide berubah
});
```

### Langkah 7: Verifikasi

```bash
node --test scripts/workbench-world.test.mjs
# Semua lulus
npm run check
npm test  # 40 + ujian baharu lulus
```

---

## Pelan ujian

- **Baharu**: `scripts/workbench-world.test.mjs` (10–15 kes ujian)
- **Corak**: Ikut `scripts/workbench.test.mjs` — `node:test` + `node:assert/strict` + Playwright untuk WebGL
- **Tiada** ujian visual/screenshot di sini (sudah wujud)

---

## Kriteria siap

- [ ] `scripts/workbench-world.test.mjs` wujud dengan ≥10 kes ujian
- [ ] `node --test scripts/workbench-world.test.mjs` → semua lulus
- [ ] `npm test` → 0 gagal (termasuk ujian baharu)
- [ ] `npm run check` → 0 ERRORS 0 WARNINGS
- [ ] Ujian menguji: konstruktor, dispose, setFocus, zoomBy, resetCamera, setTheme, setLocale, nextSample, input handler, hologram

---

## Syarat STOP

- Playwright/Three.js tidak boleh dijalankan dalam Node tanpa browser: **STOP** — gunakan `chromium` launch seperti `workbench-smoke.mjs` (boleh jalan dalam CI).
- Ujian terlalu lambat (>30 saat): **STOP** — kurangkan skop, uji hanya API kritikal.
- `workbench-smoke.mjs` gagal selepas ujian ditambah: **STOP** — ujian tidak sepatutnya mengubah tingkah laku.

---

## Nota penyelenggaraan

- Ujian ini adalah **characterization tests** — mengunci tingkah laku *semasa*, bukan tingkah laku *ideal*. Jika bug ditemui, jangan baiki dalam ujian; buat plan berasingan.
- Apabila Plan 008 (refactor modular) dijayakan, ujian ini mesti **dikemas kini** untuk menguji modul berasingan (`camera-controller.ts`, `hologram.ts`, dll.) dan `WorkbenchWorld` yang dikecilkan.
- Simpan ujian ini sebagai "safety net" untuk refactor masa hadapan.