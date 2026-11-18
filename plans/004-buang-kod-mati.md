# Plan 004: Kod mati Fiber Spine dan sisa prototaip dibuang; data kandungan di lokasi bernama jelas

> **Arahan pelaksana**: Ikut pelan ini langkah demi langkah. Jalankan setiap
> arahan Verify dan sahkan hasil yang dijangka sebelum ke langkah seterusnya.
> Jika mana-mana syarat STOP berlaku, berhenti dan lapor; jangan
> berimprovisasi. Apabila selesai, kemas kini baris status pelan ini dalam
> `plans/README.md`.
>
> **Semakan drift (jalankan dahulu)**: `wc -l src/lib/spine/*` → 6 fail, jumlah sekitar `8771`. `npm run check` → `0 ERRORS` (Pelan 002 mesti DONE). Jika berbeza, STOP.

## Status

- **Keutamaan**: P2
- **Usaha**: M
- **Risiko**: MED (pemadaman fail; dilindungi oleh semakan jenis, binaan dan ujian asap)
- **Bergantung pada**: plans/001-simpan-kerja-workbench-dalam-git.md, plans/002-baiki-dunia-3d-halaman-utama.md
- **Kategori**: tech-debt
- **Dirancang pada**: commit `5acfc36` + working tree, 2026-11-18

## Kenapa ini penting

Repo membawa kira-kira 7,800 baris kod yang tiada halaman gunakan: dunia 3D
"Fiber Spine" yang lama, serta versi editorial 2D yang ditinggalkan. Kod mati
ini mengelirukan agen AI (ia terus membaca dan menyunting fail yang tiada
kesan) dan melambatkan semakan. Satu fail dalam folder lama
(`spine-data.ts`) masih hidup kerana menyimpan data profil, kemahiran dan
sijil. Ia dipindahkan ke lokasi bernama jelas supaya tiada siapa menyangka ia
sebahagian daripada konsep mati.

## Keadaan semasa

Analisis import (2026-11-18), di mana "luar" bermaksud diimport dari luar folder `src/lib/spine/`:

| Fail | Baris | Status |
|---|---|---|
| `src/lib/spine/spine-data.ts` | 1777 | **HIDUP**: diimport oleh 5 fail (lihat bawah). Tiada import sendiri. |
| `src/lib/spine/FiberSpineExperience.svelte` | 1887 | MATI: 0 import |
| `src/lib/spine/FiberSpineWorld.ts` | 3074 | MATI: hanya diimport oleh fail mati |
| `src/lib/spine/SpineLoadingScreen.svelte` | 749 | MATI |
| `src/lib/spine/exhibit-screen.ts` | 970 | MATI |
| `src/lib/spine/exhibit-navigation.ts` | 314 | MATI |
| `src/lib/workbench/Workbench-2d-editorial.svelte` | 847 | MATI: 0 import |

Pengimport `spine-data` (baris import tepat):
```
src/lib/workbench/ContactModal.svelte:3:        import { PROFILE } from '$lib/spine/spine-data';
src/lib/workbench/DossierStation.ts:4:import { PROFILE, TECHNICAL_SKILLS } from '$lib/spine/spine-data';
src/lib/workbench/Workbench.svelte:6:  import { PROFILE, TECHNICAL_SKILLS, CERTIFICATIONS } from '$lib/spine/spine-data';
src/routes/cv/+page.svelte:12:  } from '$lib/spine/spine-data';
```
(`Workbench-2d-editorial.svelte` juga mengimportnya, tetapi fail itu akan dipadam.)

Ujian dan skrip yang hanya menguji kod mati:
- `scripts/exhibit-screen.test.mjs` (18 ujian), `scripts/spine-atmosphere.test.mjs` (5), `scripts/spine-inspect.test.mjs` (13)
- Skrip bukan-ujian: `scripts/spine-editorial.mjs`, `scripts/spine-prop-regression.mjs`, `scripts/spine-screen-render.mjs`, `scripts/spine-verify.mjs`, `scripts/spine-visual.mjs`
- `package.json` baris skrip: `"test:screen": "node scripts/spine-screen-render.mjs",`

JANGAN sentuh: `scripts/service-worker.test.mjs` dan `src/service-worker.ts`. Rentetan `spine-cache-` di sana ialah nama cache yang masih digunakan; menukarnya akan membatalkan cache pelawat.

Jumlah ujian semasa: `npm test` → 71. Selepas membuang 3 fail ujian di atas: **35** (disahkan 2026-11-18: `node --test` pada baki fail → 35 lulus, 0 gagal).

## Arahan yang diperlukan

| Tujuan | Arahan | Dijangka |
|---|---|---|
| Semak jenis | `npm run check` | `0 ERRORS` |
| Ujian | `npm test` | `ℹ pass 35`, `ℹ fail 0` |
| Binaan | `npm run build` | `✓ built`, exit 0 |
| Ujian asap | `WORKBENCH_URL=http://localhost:5199/ node scripts/workbench-smoke.mjs` (pelayan dev pada 5199) | `SMOKE OK` |

## Skop

**Dalam skop**:
- Pindah `src/lib/spine/spine-data.ts` → `src/lib/content/portfolio-data.ts`
- Kemas kini 4 baris import di atas
- Padam 5 fail spine yang mati, `src/lib/workbench/Workbench-2d-editorial.svelte`, 3 fail ujian dan 5 skrip yang disenaraikan
- `package.json`: buang baris `test:screen` sahaja

**Luar skop**:
- `src/service-worker.ts`, `scripts/service-worker.test.mjs` (lihat di atas).
- Kandungan `portfolio-data.ts`: pindah sahaja, jangan ubah. Data yang tidak lagi digunakan (contoh `STATIONS`, `OCEAN_WEATHER_PRESETS`) dibiarkan dahulu; membersihkannya ialah kerja berasingan dengan ujian.
- `package-lock.json`: jangan jalankan `npm install`.

## Aliran kerja git

- Satu commit selepas Langkah 4. Guna `git mv` dan `git rm` supaya perubahan di-stage secara eksplisit.
- Mesej: `refactor: buang dunia Fiber Spine yang mati dan pindah data kandungan ke src/lib/content`
- Jangan push.

## Langkah

### Langkah 1: Pindah fail data dan kemas kini import

```bash
mkdir -p src/lib/content
git mv src/lib/spine/spine-data.ts src/lib/content/portfolio-data.ts
```
Dalam 4 fail pengimport (BUKAN `Workbench-2d-editorial.svelte`), tukar `'$lib/spine/spine-data'` kepada `'$lib/content/portfolio-data'`. Hanya rentetan laluan berubah; nama yang diimport kekal.

**Verify**:
```bash
grep -rn "lib/spine/spine-data" src --include=*.svelte --include=*.ts | grep -v Workbench-2d-editorial | wc -l
grep -rln "lib/content/portfolio-data" src | wc -l
```
→ `0`, kemudian `4`.

### Langkah 2: Padam kod mati

```bash
git rm src/lib/spine/FiberSpineExperience.svelte src/lib/spine/FiberSpineWorld.ts src/lib/spine/SpineLoadingScreen.svelte src/lib/spine/exhibit-screen.ts src/lib/spine/exhibit-navigation.ts
git rm src/lib/workbench/Workbench-2d-editorial.svelte
git rm scripts/exhibit-screen.test.mjs scripts/spine-atmosphere.test.mjs scripts/spine-inspect.test.mjs
git rm scripts/spine-editorial.mjs scripts/spine-prop-regression.mjs scripts/spine-screen-render.mjs scripts/spine-verify.mjs scripts/spine-visual.mjs
```
Dalam `package.json`, buang baris `"test:screen": "node scripts/spine-screen-render.mjs",`. Pastikan JSON kekal sah (tiada koma berlebihan).

**Verify**:
```bash
ls src/lib/spine 2>/dev/null | wc -l
grep -rn "lib/spine/" src scripts | wc -l
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'));console.log('package.json sah')"
```
→ `0`, `0`, `package.json sah`. (Jika folder `src/lib/spine` masih wujud tetapi kosong, padam dengan `rmdir src/lib/spine`.)

### Langkah 3: Semakan penuh

```bash
npm run check
npm test
npm run build
```
**Verify**: `0 ERRORS`; `ℹ pass 35` dan `ℹ fail 0`; binaan selesai dengan exit 0.

Kemudian jalankan pelayan dev pada port 5199 dan ujian asap dari Pelan 002:
```bash
npx vite dev --port 5199 --strictPort &
WORKBENCH_URL=http://localhost:5199/ node scripts/workbench-smoke.mjs
```
**Verify**: `SMOKE OK`. Juga buka `http://localhost:5199/cv`: halaman mesti memaparkan nama penuh (sahkan dengan `curl -s http://localhost:5199/cv | grep -c "Muhammed Munir"` → ≥1). Hentikan pelayan dev.

### Langkah 4: Commit

```bash
git add package.json src/lib/workbench src/routes/cv
git status --short
git commit -m "refactor: buang dunia Fiber Spine yang mati dan pindah data kandungan ke src/lib/content"
```
**Verify**: `git status --short` → kosong.

## Pelan ujian

Tiada ujian baharu. Perlindungan: `npm run check` (rujukan rosak), `npm run build` (import rosak semasa binaan), `npm test` (35), dan `workbench-smoke.mjs` (halaman utama sebenar).

## Kriteria siap

- [ ] `test -d src/lib/spine && echo ADA || echo TIADA` → `TIADA`
- [ ] `test -f src/lib/content/portfolio-data.ts && echo ADA` → `ADA`
- [ ] `grep -rn "lib/spine" src scripts | wc -l` → `0`
- [ ] `npm run check` → `0 ERRORS`; `npm test` → 35 lulus 0 gagal; `npm run build` exit 0
- [ ] `workbench-smoke.mjs` → `SMOKE OK`
- [ ] `grep -c "spine-cache-" src/service-worker.ts` → `1` (tidak disentuh)
- [ ] Baris 004 dalam `plans/README.md` → `DONE`

## Syarat STOP

- Selepas Langkah 1, `npm run check` melaporkan ralat import yang menyebut fail SELAIN 4 pengimport yang disenaraikan (bermakna ada pengimport tersembunyi).
- `npm run build` gagal dengan `Could not resolve` yang merujuk fail yang dipadam.
- Bilangan ujian bukan 35.
- `SMOKE OK` gagal selepas Langkah 2 tetapi lulus sebelum Langkah 2.

## Nota penyelenggaraan

- Semua data kandungan (profil, kerjaya, kemahiran, sijil, pendidikan) kini dalam `src/lib/content/portfolio-data.ts`. Pelan 006 dan 007 merujuk laluan ini.
- Data warisan dalam fail ini (contoh `STATIONS`, `OCEAN_WEATHER_PRESETS`, `PROJECT_ARCHIVE`) mungkin tidak lagi digunakan; semak dengan `grep` sebelum membuangnya dalam kerja akan datang.
