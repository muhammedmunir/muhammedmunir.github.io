# Plan 005: Halaman dasar privasi Baby Kick Tracker kembali hidup di /baby-kick-privacy

> **Arahan pelaksana**: Ikut pelan ini langkah demi langkah. Jalankan setiap
> arahan Verify dan sahkan hasil yang dijangka sebelum ke langkah seterusnya.
> Jika mana-mana syarat STOP berlaku, berhenti dan lapor; jangan
> berimprovisasi. Apabila selesai, kemas kini baris status pelan ini dalam
> `plans/README.md`.
>
> **Semakan drift (jalankan dahulu)**: `test -e src/routes/baby-kick-privacy/+page.svelte && echo WUJUD || echo TIADA`.
> - `TIADA` → mulakan dari Langkah 1.
> - `WUJUD` → semak sama ada ia hasil Langkah 1 yang sudah dibuat:
>   `git show "f23eecc^:src/routes/baby-kick-privacy/+page.svelte" | cmp -s - src/routes/baby-kick-privacy/+page.svelte && echo SAMA-ASAL`.
>   Jika `SAMA-ASAL`, Langkah 1 sudah selesai; sambung dari Langkah 1b. Jika tidak sama dan fail belum mempunyai baris JSDoc dari Langkah 1c, STOP (seseorang telah mengubahnya).

> **Kemas kini 2026-11-19**: Percubaan pertama berhenti dengan betul pada Langkah 2 kerana dua perkara yang terlepas dalam pelan asal: (1) `svelte-check` melaporkan `Parameter 'l' implicitly has an 'any' type` di baris 6; (2) imej `/Logo_BiK.png` turut dipadam dalam commit `f23eecc`, jadi prerender gagal dengan `404`. Langkah 1b dan 1c ditambah untuk kedua-duanya. Logo ialah satu-satunya aset tempatan yang dirujuk oleh halaman ini (disemak: pautan lain ialah luar, `mailto:` atau `/`).

## Status

- **Keutamaan**: P1
- **Usaha**: S
- **Risiko**: LOW
- **Bergantung pada**: plans/001-simpan-kerja-workbench-dalam-git.md
- **Kategori**: bug (pematuhan)
- **Dirancang pada**: commit `5acfc36`, 2026-11-18

## Kenapa ini penting

Aplikasi Android Baby Kick Tracker menggunakan iklan (Google Mobile Ads) dan
langganan (RevenueCat). Google Play mewajibkan URL dasar privasi yang
berfungsi untuk aplikasi seperti ini. Halaman itu dahulu di
`https://muhammedmunir.github.io/baby-kick-privacy`, tetapi telah terpadam pada
2026-10-14 (commit `f23eecc`, "feat: revamp portfolio with JARVIS AI HUD...").
Jika halaman Play Store masih menunjuk ke URL itu, aplikasi berisiko ditolak
atau diturunkan. Pelan ini memulihkan halaman asal tanpa perubahan kandungan.

## Keadaan semasa

- Halaman asal wujud dalam sejarah git: `git show f23eecc^:src/routes/baby-kick-privacy/+page.svelte` (470 baris; tajuk `Baby Kick Tracker - Privacy Policy`; tarikh kemas kini 13/08/2026; dwibahasa EN/MS; satu-satunya import ialah `import { onMount } from 'svelte';`; ia mempunyai gaya `<style>` sendiri).
- `src/routes/+layout.ts` → `export const prerender = true;` dan `svelte.config.js` menggunakan `adapter-static`, jadi route baharu akan dijana secara statik secara automatik.
- `src/routes/+layout.svelte` semasa hanya mengimport `./layout.css` dan memanggil `initPreferences`; ia memaparkan `{@render children()}`. Tiada Workbench dalam layout, jadi halaman privasi tidak akan terganggu oleh dunia 3D.

## Arahan yang diperlukan

| Tujuan | Arahan | Dijangka |
|---|---|---|
| Semak jenis | `npm run check` | `0 ERRORS` (jika Pelan 002 DONE) |
| Binaan | `npm run build` | exit 0 |
| Fail terjana | `ls build/baby-kick-privacy* build/baby-kick-privacy/ 2>/dev/null` | wujud |

## Skop

**Dalam skop**:
- `src/routes/baby-kick-privacy/+page.svelte` (cipta daripada sejarah git, ditambah SATU baris komen JSDoc)
- `static/Logo_BiK.png` (pulihkan daripada sejarah git, tanpa perubahan)

**Luar skop**:
- Kandungan undang-undang dalam halaman: JANGAN ubah ayat, tarikh atau bahagian. Pindah verbatim. Satu-satunya perubahan yang dibenarkan ialah baris komen JSDoc dalam Langkah 1c, yang tidak mengubah paparan atau logik.
- `static/sitemap.xml`: tidak perlu menambah halaman privasi.
- Mana-mana fail lain.

## Aliran kerja git

- Satu commit. Mesej: `fix(privacy): pulihkan dasar privasi Baby Kick Tracker di /baby-kick-privacy`
- Stage eksplisit: `git add src/routes/baby-kick-privacy/+page.svelte static/Logo_BiK.png`. Jangan push.

## Langkah

### Langkah 1: Pulihkan fail daripada sejarah git

```bash
mkdir -p src/routes/baby-kick-privacy
git show f23eecc^:src/routes/baby-kick-privacy/+page.svelte > src/routes/baby-kick-privacy/+page.svelte
```
**Verify**: `wc -l < src/routes/baby-kick-privacy/+page.svelte` → `470`; `grep -c "Baby Kick Tracker - Privacy Policy" src/routes/baby-kick-privacy/+page.svelte` → `1`.

### Langkah 1b: Pulihkan imej logo daripada sejarah git

Guna `git restore` (tiada redirect `>`, jadi fail tidak boleh dikosongkan jika arahan gagal):
```bash
git restore --source=f23eecc^ -- static/Logo_BiK.png
```
**Verify**: `test "$(git hash-object static/Logo_BiK.png)" = "$(git rev-parse 'f23eecc^:static/Logo_BiK.png')" && echo LOGO-SAMA` → `LOGO-SAMA`.

### Langkah 1c: Tambah anotasi jenis JSDoc pada `toggleLang`

`svelte-check` (ketat, `noImplicitAny`) menolak `function toggleLang(l)` kerana `l` tiada jenis. Fail ini menggunakan `<script>` JavaScript biasa, jadi gunakan komen JSDoc, BUKAN tukar ke TypeScript.

Dengan **alat Edit** (peraturan 7 dalam `plans/README.md`), gantikan:
```
    function toggleLang(l) {
```
dengan:
```
    /** @param {'en' | 'ms'} l */
    function toggleLang(l) {
```
**Verify**: `npm run check` → `0 ERRORS`; `diff <(git show "f23eecc^:src/routes/baby-kick-privacy/+page.svelte") src/routes/baby-kick-privacy/+page.svelte | grep -c '^>'` → `1` (hanya satu baris ditambah).

### Langkah 2: Semak jenis dan bina

```bash
npm run check
npm run build
ls build | grep -i baby
```
**Verify**: `npm run check` tidak menambah ralat baharu yang menyebut `baby-kick-privacy` (`npm run check 2>&1 | grep -c baby-kick-privacy` → `0`); binaan exit 0; `build/` mengandungi `baby-kick-privacy.html` atau folder `baby-kick-privacy/`.

### Langkah 3: Semak paparan dalam pelayar

```bash
npx vite dev --port 5199 --strictPort &
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5199/baby-kick-privacy
curl -sL -o /dev/null -w "%{http_code}\n" http://localhost:5199/baby-kick-privacy
curl -sL http://localhost:5199/baby-kick-privacy | grep -c "Information We Collect"
```
**Verify**: `308` (pengalihan ke `/baby-kick-privacy/`; ini DIJANGKA kerana halaman dijana sebagai `baby-kick-privacy/index.html`, dan GitHub Pages berkelakuan sama), kemudian `200` selepas mengikut pengalihan, kemudian ≥`1`. Pelayar Playwright Chromium sudah dipasang pada mesin ini (digunakan 2026-11-18 dari `node_modules` portfolio dengan `chromium.launch()` lalai); jika `chromium.launch()` gagal, jalankan `npx playwright install chromium` sekali. Ambil tangkapan skrin 390px dan 1440px dengan Playwright (simpan di `.crew/artifacts/privacy/`, yang sudah diabaikan oleh git) dan pastikan teks boleh dibaca (bukan teks gelap atas latar gelap). Jika tidak boleh dibaca kerana gaya global `layout.css`, lihat syarat STOP. Hentikan pelayan dev.

### Langkah 4: Commit

```bash
git add src/routes/baby-kick-privacy/+page.svelte
git commit -m "fix(privacy): pulihkan dasar privasi Baby Kick Tracker di /baby-kick-privacy"
```
**Verify**: `git status --short` → kosong.

## Pelan ujian

- Semakan manual Langkah 3 (HTTP 200 + teks + tangkapan skrin).
- `npm test` → bilangan lulus tidak berubah.

## Kriteria siap

- [ ] `test -f src/routes/baby-kick-privacy/+page.svelte && echo ADA` → `ADA`
- [ ] `npm run build` exit 0 dan output mengandungi halaman baby-kick-privacy
- [ ] `curl -sL` pada pelayan dev → HTTP 200 dan mengandungi "Information We Collect" (tanpa `-L`: 308 ke garis miring akhir, dijangka)
- [ ] Kandungan sama dengan asal kecuali SATU baris JSDoc: `diff <(git show "f23eecc^:src/routes/baby-kick-privacy/+page.svelte") src/routes/baby-kick-privacy/+page.svelte | grep -E '^[<>]'` → tepat satu baris, `> /** @param {'en' | 'ms'} l */`
- [ ] Logo sama dengan asal: `git hash-object static/Logo_BiK.png` = `git rev-parse 'f23eecc^:static/Logo_BiK.png'`
- [ ] Baris 005 dalam `plans/README.md` → `DONE`

## Syarat STOP

- `git show f23eecc^:src/routes/baby-kick-privacy/+page.svelte` gagal.
- Halaman tidak boleh dibaca kerana gaya global (contoh teks gelap atas latar gelap). Lapor dengan tangkapan skrin; jangan ubah `layout.css` global dalam pelan ini.
- `npm run check` menunjukkan ralat dalam fail yang dipulihkan (sintaks Svelte lama tidak serasi dengan Svelte 5). Lapor ralat; jangan tulis semula halaman.

## Nota penyelenggaraan

- Pemilik patut menyemak URL dasar privasi dalam Google Play Console sepadan dengan `https://muhammedmunir.github.io/baby-kick-privacy`.
- Mana-mana perubahan reka bentuk laman di masa hadapan mesti mengekalkan route ini.
