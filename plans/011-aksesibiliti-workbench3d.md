# Plan 011: Putaran kamera tanpa seret + pautan langkau ke Sistem

> **Arahan pelaksana**: Ikut langkah demi langkah. Jalankan setiap Verify dan
> sertakan outputnya. Jika syarat STOP berlaku, berhenti dan lapor. Apabila
> selesai, kemas kini baris 011 dalam `plans/README.md`.
>
> **Semakan drift (jalankan dahulu)**:
> ```bash
> wc -l src/lib/workbench/WorkbenchWorld.ts src/lib/workbench/Workbench.svelte
> grep -c "orbitBy" src/lib/workbench/WorkbenchWorld.ts
> grep -c 'href="#sistem"' src/lib/workbench/Workbench.svelte
> ```
> → kira-kira `2758` dan `428` baris; kemudian `0` dan `0`. Jika `orbitBy` atau pautan `#sistem` sudah wujud, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: S · **Risiko**: LOW (tambah satu kaedah dan beberapa butang; logik sedia ada tidak diubah)
- **Bergantung pada**: 006, 007 (DONE)
- **Ditulis semula**: 2026-11-20 oleh perancang (Claude), berdasarkan commit `399652c`. Versi asal ditulis oleh model sandaran dan mengandungi premis yang salah.

## Kenapa ini penting

**WCAG 2.2 AA, kriteria 2.5.7 (Dragging Movements)**: setiap fungsi yang menggunakan seretan mesti ada alternatif satu klik. Kini kamera Workbench boleh **diputar hanya dengan menyeret** pada kanvas (`WorkbenchWorld.ts`, kaedah `move`: `targetOrbitYaw`/`targetOrbitPitch` diubah daripada `dx`/`dy`). Menu "Kamera & sudut pandang" hanya ada zum dan set semula. Pengguna papan kekunci, suis, atau yang tidak boleh menyeret tidak dapat melihat meja dari sudut lain.

Selain itu, bahagian Sistem (`<section id="sistem">` dalam `SystemsSection.svelte`, Pelan 007) tiada pautan langkau, walaupun ia jauh di bawah dunia 3D.

## Semakan premis pelan asal (supaya tidak diulang)

| Dakwaan pelan asal | Fakta dalam kod | Keputusan |
|---|---|---|
| Fokus hilang apabila tukar paparan | `selectView()` sudah memanggil `heading?.focus({ preventScroll: true })` | Ditolak: sudah ada |
| `prefers-reduced-motion` tiada dalam dunia 3D | `WorkbenchWorld.ts`: `const snap = this.reduced.matches \|\| this.paused;` mematikan semua animasi `Math.sin(now…)` dan `dossier.animate(dt, snap)` | Ditolak: sudah ada |
| Perlu `setReducedMotion()` dan hentikan shader `uniforms.time` | Tiada `ShaderMaterial`/`uniforms` dalam projek | Ditolak: tiada sasaran |
| Tukar butang projek kepada `role="radio"` + roving tabindex | Butang `aria-pressed` yang boleh dicapai dengan Tab sudah memenuhi 2.1.1. Anak panah yang memilih modul akan memasukkan kaset 3D (kesan sampingan) | Ditolak: risiko tanpa keperluan WCAG |
| ARIA live region | `p.render-status[role="status"]` sudah wujud | Ditolak: sudah ada |
| `world.orbitAzimuth()` | Tidak wujud | Diganti dengan `orbitBy()` dalam pelan ini |

## Skop

**Dalam skop**:
- `src/lib/workbench/WorkbenchWorld.ts`: tambah SATU kaedah awam `orbitBy(dYaw, dPitch)`.
- `src/lib/workbench/Workbench.svelte`: 4 butang putaran dalam `.camera-controls`, pengendali anak panah pada kanvas, `tabindex="0"` dan gaya fokus pada kanvas, satu pautan langkau ke `#sistem`.
- `scripts/workbench-orbit-a11y.mjs` (baharu): semakan Playwright terhadap pelayan dev.
- `src/lib/workbench/HeroIdentity.svelte`: SATU nilai `clamp()` (Langkah 4b).

**Luar skop**: semua item yang ditolak dalam jadual di atas; `SystemsSection.svelte`; teks atau kandungan lain; refactor.

**Telah diuji oleh perancang** (2026-11-20, salinan terasing daripada `399652c`): semua suntingan dalam pelan ini dikenakan; `check` 0 ralat, `npm test` 50/50, build exit 0, `SMOKE OK`, `ORBIT OK`. Kawalan negatif: apabila `orbitBy` dimatikan, skrip melaporkan `ORBIT FAIL: kanvas tidak berubah`, jadi ujian ini benar-benar mengesan kerosakan.

## Aliran kerja git

- Kekal pada cawangan semasa. Satu commit selepas Langkah 5:
  `a11y(workbench): putaran kamera tanpa seret dan pautan langkau ke Sistem`
- Stage eksplisit: `git add src/lib/workbench/WorkbenchWorld.ts src/lib/workbench/Workbench.svelte src/lib/workbench/HeroIdentity.svelte scripts/workbench-orbit-a11y.mjs plans/README.md`. Jangan push.

## Langkah

### Langkah 1: Kaedah `orbitBy` dalam WorkbenchWorld

Dengan alat Edit, gantikan baris `  resetCamera() {` dengan blok di bawah (kaedah baharu diletakkan SEBELUM `resetCamera`). Had mesti sama dengan seretan tetikus dalam kaedah `move` (`-0.75..0.75` dan `-0.28..0.38`):

```ts
  /** Putar kamera tanpa seret (WCAG 2.5.7). Had sama dengan seretan tetikus. */
  orbitBy(dYaw: number, dPitch = 0) {
    this.renderDirty = true;
    this.targetOrbitYaw = THREE.MathUtils.clamp(this.targetOrbitYaw + dYaw, -0.75, 0.75);
    this.targetOrbitPitch = THREE.MathUtils.clamp(this.targetOrbitPitch + dPitch, -0.28, 0.38);
  }

  resetCamera() {
```

**Verify**: `grep -n "orbitBy\|clamp(this.drag.startYaw\|clamp(this.drag.startPitch" src/lib/workbench/WorkbenchWorld.ts` → kaedah baharu wujud, dan nombor had sama dengan dua baris seretan. `npm run check` → `0 ERRORS`.

### Langkah 2: Butang putaran dalam menu kamera

Dalam `Workbench.svelte`, di dalam `<div class="camera-controls" …>`, tambah 4 butang SELEPAS butang "Zum jauh" dan SEBELUM butang "Set semula kamera". Ikut corak butang zum yang sedia ada:

```svelte
        <button type="button" class="zoom-button" disabled={!ready} aria-label={t('Putar ke kiri', 'Rotate left')} title={t('Putar ke kiri', 'Rotate left')} onclick={() => world?.orbitBy(-0.15)}><span aria-hidden="true">←</span></button>
        <button type="button" class="zoom-button" disabled={!ready} aria-label={t('Putar ke kanan', 'Rotate right')} title={t('Putar ke kanan', 'Rotate right')} onclick={() => world?.orbitBy(0.15)}><span aria-hidden="true">→</span></button>
        <button type="button" class="zoom-button" disabled={!ready} aria-label={t('Condong ke atas', 'Tilt up')} title={t('Condong ke atas', 'Tilt up')} onclick={() => world?.orbitBy(0, 0.1)}><span aria-hidden="true">↑</span></button>
        <button type="button" class="zoom-button" disabled={!ready} aria-label={t('Condong ke bawah', 'Tilt down')} title={t('Condong ke bawah', 'Tilt down')} onclick={() => world?.orbitBy(0, -0.1)}><span aria-hidden="true">↓</span></button>
```

**Verify**: `grep -c "world?.orbitBy" src/lib/workbench/Workbench.svelte` → `4`.

### Langkah 3: Anak panah pada kanvas

1. Pada elemen `<canvas bind:this={canvas} …>`, tambah `tabindex="0"` dan `onkeydown={handleCanvasKeydown}`. Dalam `aria-label` kanvas, TAMBAH di hujung ayat sedia ada: ` Fokus pada kanvas dan gunakan anak panah untuk memutar, + atau − untuk zum.` (BM) dan ` Focus the canvas and use arrow keys to rotate, + or − to zoom.` (EN). Jangan ubah ayat sedia ada.
2. Dalam `<script>`, tambah fungsi ini SELEPAS fungsi `handleKeydown`:

```ts
  function handleCanvasKeydown(e: KeyboardEvent) {
    if (!ready || !world) return;
    const keys: Record<string, () => void> = {
      ArrowLeft: () => world?.orbitBy(-0.15),
      ArrowRight: () => world?.orbitBy(0.15),
      ArrowUp: () => world?.orbitBy(0, 0.1),
      ArrowDown: () => world?.orbitBy(0, -0.1),
      '+': () => world?.zoomBy(-0.12),
      '=': () => world?.zoomBy(-0.12),
      '-': () => world?.zoomBy(0.12)
    };
    const run = keys[e.key];
    if (run) { e.preventDefault(); run(); }
  }
```

3. Dalam blok `<style>`, tambah penunjuk fokus (`--work-active-bg` ialah warna keadaan aktif yang sudah digunakan untuk butang `aria-pressed`):

```css
  canvas:focus-visible { outline: 3px solid var(--work-active-bg); outline-offset: -3px; }
```

**Verify**: `npm run check` → `0 ERRORS`; `grep -c "world?.orbitBy" src/lib/workbench/Workbench.svelte` → `8`; `grep -n 'tabindex="0"' src/lib/workbench/Workbench.svelte` menunjukkan baris kanvas.

### Langkah 4: Pautan langkau ke Sistem

Selepas pautan langkau kedua (`href="#bench-controls"`), tambah:

```svelte
  <a class="skip-link" href="#sistem">{t('Langkau ke sistem yang dibina', 'Skip to systems built')}</a>
```

**Verify**: `grep -c 'href="#sistem"' src/lib/workbench/Workbench.svelte` → `1`; `grep -c 'id="sistem"' src/lib/workbench/SystemsSection.svelte` → `1`.

### Langkah 4b: Dua pembetulan susun atur telefon (390px)

Ditemui semasa ujian pelan pada 2026-11-20 (tangkapan 390px):

1. **Butang kamera dihimpit.** Selepas 4 butang putaran ditambah, "Set semula kamera" dihimpit dalam baris yang sama sehingga perkataannya patah ("semul-a kamer-a"). Dalam `Workbench.svelte`, di dalam `@media (max-width: 639px)`, gantikan:
   ```
       .camera-controls button:last-child { flex: 1; }
   ```
   dengan:
   ```
       .camera-controls button:last-child { flex: 1 1 100%; }
   ```
2. **Nama hero patah di tengah perkataan** ("Muhamme-d Munir", sedia ada sejak Pelan 006). Saiz minimum `40px` terlalu besar untuk "Muhammed" pada lebar 358px, jadi `overflow-wrap: anywhere` mematahkannya. Dalam `src/lib/workbench/HeroIdentity.svelte`, gantikan `clamp(40px, 6vw, 84px)` dengan `clamp(30px, 8.5vw, 84px)`. Desktop tidak berubah (kekal 84px).

**Verify**: `grep -c "flex: 1 1 100%" src/lib/workbench/Workbench.svelte` → `1`; `grep -c "clamp(30px, 8.5vw, 84px)" src/lib/workbench/HeroIdentity.svelte` → `1`. Dalam tangkapan `390.png` (Langkah 5): "Muhammed" dan "Munir" pada baris berasingan tanpa patah; "Set semula kamera" pada baris sendiri. (Diukur oleh perancang dalam salinan: 320px → 30px, 2 baris; 390px → 33px, 2 baris; 1440px → 84px, 1 baris; tiada limpahan.)

### Langkah 5: Semakan Playwright dan semakan penuh

Cipta `scripts/workbench-orbit-a11y.mjs` dengan alat Write (BUKAN `.test.mjs`: ia memerlukan pelayan dev, jadi tidak boleh dijalankan oleh `npm test`):

```js
// Semakan WCAG 2.5.7 dan pautan langkau.
// Guna: WORKBENCH_URL=http://localhost:5199/ node scripts/workbench-orbit-a11y.mjs
import { chromium } from 'playwright';
const url = process.env.WORKBENCH_URL ?? 'http://localhost:5199/';
// Flag swiftshader sama seperti workbench-smoke.mjs: tanpanya Chromium headless tiada WebGL.
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const fail = msg => { console.error('ORBIT FAIL:', msg); process.exitCode = 1; };
const shot = page => page.locator('canvas').screenshot();
try {
  // Gerakan dikurangkan membekukan animasi (LED, denyut), jadi kanvas hanya berubah jika kamera bergerak.
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('.render-status').waitFor({ state: 'hidden', timeout: 20000 });
  await page.getByText(/Kamera & sudut pandang|Camera & viewpoints/).click();
  const right = page.getByRole('button', { name: /Putar ke kanan|Rotate right/ });
  if (await right.isDisabled()) fail('butang putar dinyahdayakan (dunia 3D tidak sedia)');
  await page.waitForTimeout(800);
  const before = await shot(page);
  await page.waitForTimeout(800);
  if (Buffer.compare(before, await shot(page)) !== 0) fail('kawalan: kanvas berubah tanpa tindakan, jadi ujian ini tidak sah');
  for (let i = 0; i < 3; i++) await right.click();
  await page.waitForTimeout(800);
  if (Buffer.compare(before, await shot(page)) === 0) fail('kanvas tidak berubah selepas Putar ke kanan');
  await page.locator('canvas').focus();
  const focused = await page.evaluate(() => document.activeElement?.tagName);
  if (focused !== 'CANVAS') fail(`kanvas tidak boleh difokus (aktif: ${focused})`);
  const beforeKey = await shot(page);
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(800);
  if (Buffer.compare(beforeKey, await shot(page)) === 0) fail('anak panah tidak memutar kamera');
  await page.screenshot({ path: '.crew/artifacts/011/1440.png' });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('a.skip-link[href="#sistem"]').focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  if (!(await page.evaluate(() => location.hash === '#sistem'))) fail('pautan langkau tidak menuju #sistem');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.getByText(/Kamera & sudut pandang|Camera & viewpoints/).click();
  await page.screenshot({ path: '.crew/artifacts/011/390.png' });
  if (!process.exitCode) console.log('ORBIT OK');
} finally {
  await browser.close();
}
```

Kemudian:

```bash
mkdir -p .crew/artifacts/011
npm run check
npm test
npm run build
npx vite dev --port 5199 --strictPort &
WORKBENCH_URL=http://localhost:5199/ node scripts/workbench-smoke.mjs
WORKBENCH_URL=http://localhost:5199/ node scripts/workbench-orbit-a11y.mjs
ls -la .crew/artifacts/011/
```

**Verify**: `0 ERRORS 0 WARNINGS`; `npm test` → `ℹ fail 0` (bilangan lulus sama seperti sebelum pelan ini, iaitu 50); build exit 0; `SMOKE OK`; `ORBIT OK`; `ls -la` menunjukkan `1440.png` dan `390.png` dengan saiz lebih daripada 0. Hentikan pelayan dev selepas itu.

Jika model semasa boleh membaca imej, buka kedua-dua tangkapan dan sahkan butang putaran kelihatan dalam menu kamera tanpa limpahan pada 390px. Jika tidak, tulis "semakan visual: belum diukur" dalam laporan. JANGAN dakwa visual lulus tanpa melihat imej.

Akhir sekali, tukar baris 011 dalam `plans/README.md` kepada `DONE`, kemudian commit seperti dalam "Aliran kerja git".

## Kriteria siap

- [ ] `grep -c "orbitBy(dYaw" src/lib/workbench/WorkbenchWorld.ts` → `1`
- [ ] `grep -c "world?.orbitBy" src/lib/workbench/Workbench.svelte` → `8` (4 butang + 4 anak panah)
- [ ] `grep -c 'href="#sistem"' src/lib/workbench/Workbench.svelte` → `1`
- [ ] Langkah 4b: dua `grep` → `1`, dan `390.png` menunjukkan nama dan butang kamera tidak patah
- [ ] `npm run check` 0 ralat; `npm test` 0 gagal; `npm run build` exit 0
- [ ] `SMOKE OK` dan `ORBIT OK` (output disertakan dalam laporan)
- [ ] `ls -la .crew/artifacts/011/` menunjukkan kedua-dua imej
- [ ] `git status --short` kosong selepas commit; baris 011 = `DONE`

## Syarat STOP

- Semakan drift tidak sepadan.
- `SMOKE OK` gagal selepas perubahan (dunia 3D rosak). Jangan cuba membaiki WorkbenchWorld di luar kaedah `orbitBy`.
- `ORBIT FAIL` selepas dua percubaan. Laporkan output penuh; jangan longgarkan semakan.
- Mana-mana ujian sedia ada gagal (termasuk `workbench-camera-fit.test.mjs`). Jangan ubah fail ujian.

## Nota penyelenggaraan

- Had `orbitBy` mesti sentiasa sama dengan had seretan dalam kaedah `move`. Jika salah satu diubah, ubah kedua-duanya.
- WCAG 2.2 berkaitan: 2.5.7 Dragging Movements, 2.1.1 Keyboard, 2.4.1 Bypass Blocks, 2.4.7 Focus Visible.
