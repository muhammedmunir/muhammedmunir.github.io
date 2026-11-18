# Plan 002: Dunia 3D halaman utama dimuatkan semula, dan ralat sebenar tidak lagi disorok

> **Arahan pelaksana**: Ikut pelan ini langkah demi langkah. Jalankan setiap
> arahan Verify dan sahkan hasil yang dijangka sebelum ke langkah seterusnya.
> Jika mana-mana syarat STOP berlaku, berhenti dan lapor; jangan
> berimprovisasi. Apabila selesai, kemas kini baris status pelan ini dalam
> `plans/README.md`.
>
> **Semakan drift (jalankan dahulu)**:
> `grep -n "panoramic.union(deskBounds)" src/lib/workbench/WorkbenchWorld.ts`
> → mesti memaparkan tepat satu baris (sekitar baris 2396). Jika tiada, STOP.

## Status

- **Keutamaan**: P1
- **Usaha**: S
- **Risiko**: LOW
- **Bergantung pada**: plans/001-simpan-kerja-workbench-dalam-git.md (kod mesti sudah di-commit)
- **Kategori**: bug
- **Dirancang pada**: commit `5acfc36` + working tree, 2026-11-18

## Kenapa ini penting

Halaman utama (`/`) memaparkan dunia 3D Workbench. Kini **setiap pelawat**
melihat mesej "WebGL tidak tersedia", walaupun pelayar mereka menyokong
WebGL. Puncanya: constructor `WorkbenchWorld` memanggil `cacheFocusBounds()`,
yang merujuk pemboleh ubah `deskBounds` yang tidak wujud. Ini melontar
`ReferenceError`. Blok `catch` dalam `Workbench.svelte` menelan ralat itu tanpa
log, dan memaparkan mesej WebGL yang salah. Ini juga menyebabkan
`npm run check` gagal, jadi CI deploy (`.github/workflows/deploy.yml`, yang
menjalankan `npm run check`) akan GAGAL sebaik kerja ini di-push.

Bukti (diuji dalam Chromium sebenar, 2026-11-18):
```json
{ "webgl2": true,
  "mesejLaman": "WebGL tidak tersedia. Gunakan kawalan dan versi teks di bawah.",
  "ralatSebenar": "ReferenceError: deskBounds is not defined" }
```

## Keadaan semasa

- `src/lib/workbench/WorkbenchWorld.ts`: kelas dunia 3D. Constructor bermula sekitar baris 210, dan memanggil `this.cacheFocusBounds();` sekitar baris 253.
- `WorkbenchWorld.ts` sekitar baris 2386–2412, kandungan semasa:
  ```ts
  private cacheFocusBounds() {
    this.root.updateMatrixWorld(true);
    // Gardkan saiz penuh hologram, bukan skala animasinya.
    this.screenBounds.setFromObject(this.preview).expandByScalar(0.04);
    for (const child of this.projectDeskGroup.children) {
      if (child !== this.preview && child !== this.beamGroup && child !== this.dossier.group) {
        this.consoleBounds.expandByObject(child);
      }
    }
    const panoramic = this.consoleBounds.clone().union(this.screenBounds);
    panoramic.union(deskBounds);          // <-- PEPIJAT: deskBounds tidak diisytiharkan
    this.consoleBounds.set(new THREE.Vector3(-2.5, 0.92, -1.9), new THREE.Vector3(2.8, 3.2, 3.1));
    ...
    this.focusBounds.set('panoramic', panoramic);
  }
  ```
  Niat kod: paparan `panoramic` mesti membingkai seluruh meja, iaitu konsol, skrin hologram, DAN stesen dossier (profil/perjalanan/kemahiran) dalam `this.dossier.group`. Maka `deskBounds` sepatutnya kotak sempadan `this.dossier.group`.
- `src/lib/workbench/Workbench.svelte` sekitar baris 143–158, kandungan semasa:
  ```ts
  import('./WorkbenchWorld').then(({ WorkbenchWorld }) => {
    if (disposed) return;
    try {
      world = new WorkbenchWorld(canvas, { action, hover: value => hover = value, anchors: value => anchors = value,
        failure: () => { failed = true; ready = false; help = true; } });
      ...
      ready = true;
    } catch { failed = true; help = true; }
  }).catch(() => { failed = true; help = true; });
  ```
  Dan sekitar baris 221:
  ```svelte
  <p class="render-status" role="status" hidden={ready}>{failed ? t('WebGL tidak tersedia. Gunakan kawalan dan versi teks di bawah.', 'WebGL unavailable. Use the controls and text version below.') : !ready ? t('Menyediakan dunia 3D…', 'Preparing the 3D world…') : ''}</p>
  ```
  `t(ms, en)` ialah fungsi terjemahan setempat fail ini; gunakan semula.
- Konvensyen skrip Playwright repo: lihat `scripts/spine-editorial.mjs` (import `chromium` dari `playwright`, `headless: true`, kumpul `pageerror`, `assert` dari `node:assert/strict`, URL dari pemboleh ubah persekitaran dengan nilai lalai).

## Arahan yang diperlukan

| Tujuan | Arahan | Dijangka |
|---|---|---|
| Semak jenis | `npm run check` | `0 ERRORS` selepas pelan ini |
| Ujian | `npm test` | semua lulus (71 jika pelan 004 belum dibuat) |
| Pelayan dev | `npx vite dev --port 5199 --strictPort` | jalan di latar; `http://localhost:5199/` → HTTP 200 |
| Ujian asap pelayar | `WORKBENCH_URL=http://localhost:5199/ node scripts/workbench-smoke.mjs` | `SMOKE OK` |

## Kit alat pelaksana yang dicadangkan

- Skill `debugging-and-error-recovery` jika ujian asap masih gagal selepas Langkah 1.

## Skop

**Dalam skop**:
- `src/lib/workbench/WorkbenchWorld.ts` (fungsi `cacheFocusBounds` sahaja)
- `src/lib/workbench/Workbench.svelte` (blok `import('./WorkbenchWorld')` dan elemen `.render-status` sahaja)
- `scripts/workbench-smoke.mjs` (cipta)

**Luar skop**:
- Logik kamera, bahan, pencahayaan atau mana-mana fungsi lain dalam `WorkbenchWorld.ts`. Fail ini 2,700+ baris; perubahan lain berisiko tinggi.
- Susun atur atau gaya `Workbench.svelte`; itu Pelan 006.
- Fail `*.bak-cleanup`.

## Aliran kerja git

- Kekal pada cawangan semasa. Commit selepas Langkah 3, dengan stage eksplisit:
  `git add src/lib/workbench/WorkbenchWorld.ts src/lib/workbench/Workbench.svelte scripts/workbench-smoke.mjs`
- Mesej: `fix(workbench): baiki ReferenceError deskBounds yang mematikan dunia 3D dan paparkan ralat sebenar`
- Jangan push.

## Langkah

### Langkah 1: Isytiharkan `deskBounds` dalam `cacheFocusBounds`

Dalam `WorkbenchWorld.ts`, gantikan dua baris:
```ts
    const panoramic = this.consoleBounds.clone().union(this.screenBounds);
    panoramic.union(deskBounds);
```
dengan:
```ts
    // Paparan panoramik membingkai seluruh meja: konsol, hologram dan stesen dossier.
    const deskBounds = new THREE.Box3().setFromObject(this.dossier.group);
    const panoramic = this.consoleBounds.clone().union(this.screenBounds);
    if (!deskBounds.isEmpty()) panoramic.union(deskBounds);
```
`THREE` sudah diimport dalam fail ini. `isEmpty()` ialah kaedah `THREE.Box3`.

**Verify**: `npm run check` → baris akhir mengandungi `0 ERRORS`.

### Langkah 2: Jangan sorok ralat; bezakan "tiada WebGL" dengan "ralat kod"

Dalam `Workbench.svelte`:

1. Tambah pemboleh ubah keadaan di sebelah pengisytiharan `failed` sedia ada (cari `let failed`), dengan gaya rune yang sama seperti `failed` (contoh `$state(false)`):
   ```ts
   let webglMissing = $state(false);
   ```
2. Gantikan blok `try { ... } catch { failed = true; help = true; }` dan `.catch(() => { failed = true; help = true; })` supaya ralat dilog dan sebabnya dikenal pasti:
   ```ts
      } catch (error) {
        console.error('[Workbench] Dunia 3D gagal dibina:', error);
        webglMissing = !hasWebGL();
        failed = true; help = true;
      }
    }).catch((error) => {
      console.error('[Workbench] Modul dunia 3D gagal dimuatkan:', error);
      webglMissing = !hasWebGL();
      failed = true; help = true;
    });
   ```
3. Tambah fungsi pembantu dalam blok `<script>` yang sama (di luar `onMount`). Ia menggunakan kanvas berasingan supaya tidak mengganggu kanvas Three.js:
   ```ts
   function hasWebGL() {
     try {
       const probe = document.createElement('canvas');
       return !!(probe.getContext('webgl2') || probe.getContext('webgl'));
     } catch { return false; }
   }
   ```
4. Kemas kini mesej `.render-status`:
   ```svelte
   {failed ? (webglMissing
       ? t('WebGL tidak tersedia. Gunakan kawalan dan versi teks di bawah.', 'WebGL unavailable. Use the controls and text version below.')
       : t('Dunia 3D gagal dimuatkan. Kandungan di bawah tetap lengkap.', 'The 3D world failed to load. The content below is complete.'))
     : !ready ? t('Menyediakan dunia 3D…', 'Preparing the 3D world…') : ''}
   ```

**Verify**: `npm run check` → `0 ERRORS`; `grep -c "console.error('\[Workbench\]" src/lib/workbench/Workbench.svelte` → `2`.

### Langkah 3: Cipta ujian asap pelayar `scripts/workbench-smoke.mjs`

Cipta fail dengan kandungan berikut. Ia membuktikan dunia 3D benar-benar dibina dalam pelayar sebenar:
```js
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const url = process.env.WORKBENCH_URL || 'http://127.0.0.1:5173/';
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
try {
	const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
	page.on('pageerror', (error) => errors.push(error.message));
	page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
	await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
	await page.waitForTimeout(6000);
	const result = await page.evaluate(() => ({
		webgl: !!document.createElement('canvas').getContext('webgl2'),
		status: document.querySelector('.render-status')?.textContent?.trim() ?? '',
		statusHidden: document.querySelector('.render-status')?.hidden ?? null
	}));
	assert.equal(result.webgl, true, 'Pelayar ujian tiada WebGL2; ujian tidak sah');
	assert.equal(errors.filter((e) => /\[Workbench\]|ReferenceError|TypeError/.test(e)).length, 0, `Ralat: ${errors.join(' | ')}`);
	assert.equal(result.statusHidden, true, `Status masih dipapar: "${result.status}"`);
	console.log('SMOKE OK', JSON.stringify(result));
} finally {
	await browser.close();
}
```
Jalankan pelayan dev di latar, kemudian ujian:
```bash
npx vite dev --port 5199 --strictPort &
# tunggu sehingga http://localhost:5199/ memberi HTTP 200, kemudian:
WORKBENCH_URL=http://localhost:5199/ node scripts/workbench-smoke.mjs
```
**Verify**: output bermula dengan `SMOKE OK`. Hentikan pelayan dev selepas itu.

Untuk membuktikan ujian ini benar-benar menangkap pepijat: buat sementara `git stash push src/lib/workbench/WorkbenchWorld.ts`, jalankan ujian sekali lagi (mesti GAGAL dengan mesej `[Workbench]` atau `deskBounds`), kemudian `git stash pop`. Sahkan `npm run check` → `0 ERRORS` semula.

## Pelan ujian

- Ujian baharu: `scripts/workbench-smoke.mjs` (ujian pelayar manual, tidak termasuk dalam `npm test` kerana memerlukan pelayan dev; corak ikut `scripts/spine-editorial.mjs`).
- Regresi: `npm test` → semua lulus.

## Kriteria siap

- [ ] `npm run check` → `0 ERRORS 0 WARNINGS`
- [ ] `grep -c "panoramic.union(deskBounds)" src/lib/workbench/WorkbenchWorld.ts` → `0`
- [ ] `grep -c "const deskBounds = new THREE.Box3().setFromObject(this.dossier.group)" src/lib/workbench/WorkbenchWorld.ts` → `1`
- [ ] `node scripts/workbench-smoke.mjs` (dengan pelayan dev) → `SMOKE OK`
- [ ] `npm test` → 0 gagal
- [ ] `git status --short` → kosong selepas commit; hanya 3 fail dalam skop dalam commit (`git show --stat HEAD`)
- [ ] Baris 002 dalam `plans/README.md` → `DONE`

## Syarat STOP

- `grep` semakan drift tidak menemui `panoramic.union(deskBounds)`.
- `this.dossier.group` tidak wujud dalam kelas (`grep -c "this.dossier.group" src/lib/workbench/WorkbenchWorld.ts` → 0).
- Selepas Langkah 1 dan 2, `SMOKE OK` gagal dengan ralat lain (contoh `TypeError` dalam fungsi lain). Lapor ralat penuh; jangan baiki di luar skop.
- Pelayar ujian melaporkan `webgl: false` walaupun dengan bendera swiftshader. Lapor; jangan ubah assert.

## Nota penyelenggaraan

- Blok `catch` kini melog ke konsol. Jika kelak ada ralat lain dalam dunia 3D, buka DevTools; mesej `[Workbench]` akan menunjukkan puncanya.
- Pelan 006 akan mengubah peranan dunia 3D; ujian asap ini mesti terus lulus selepas 006.
- Pertimbangkan menambah `node scripts/workbench-smoke.mjs` ke CI selepas 006 (perlukan pelayan dev atau `vite preview` dalam CI).
