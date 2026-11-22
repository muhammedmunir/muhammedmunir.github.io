# Plan 025: Jenama baharu pada pratonton pautan (OG), favicon dan manifest

> **Arahan pelaksana**: Laksanakan TERUS dalam sesi utama, tanpa subagent atau worktree. Ikut langkah mengikut turutan. Salin arahan TEPAT seperti dalam blok kod. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor. Pelan ini tidak memerlukan sebarang keputusan reka bentuk: semua fail sudah siap di folder staging.
>
> **Prasyarat**: Pelan 024 mesti sudah di-commit (`perf(bilik): kualiti grafik adaptif untuk GPU lemah`).
>
> **Semakan drift (jalankan dahulu, dalam Git Bash)**:
> ```bash
> cd /c/Project/portfolio
> git log -1 --format=%s
> git rev-parse HEAD:src/app.html HEAD:static/site.webmanifest
> git status --short
> test ! -e static/og-portfolio.jpg && echo TIADA-KONFLIK
> ls /c/Project/portfolio-staging/025/MANIFEST.txt
> ```
> → subjek `perf(bilik): kualiti grafik adaptif untuk GPU lemah`; hash `9cd767cdbaabd53995b05ba55c7689c35542455f` dan `69c14d6e69407c14cb46a1ec542e6d755205900e`; `git status --short` hanya `?? plans/025-jenama-pratonton-ikon.md`, ` M plans/README.md` dan (jika masih ada) `?? dev.log`; `TIADA-KONFLIK`; fail manifes wujud. Jika berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: S (salin + padam + ujian) · **Risiko**: LOW (tag `<head>`, manifest dan imej statik sahaja; tiada kod aplikasi)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-22 dalam salinan terasing (`main` @ Pelan 024): `check` 858 FILES 0 ERRORS 0 WARNINGS, `npm test` pass 50 fail 0, build `✔ done`. Output build mengandungi `og-portfolio.jpg` dan ikon baharu; tiada rujukan kepada `og-portfolio.png`, `favicon.svg` atau "Di Sebalik Sistem" dalam HTML/manifest yang dibina (termasuk `/cv`).

## Kenapa

Semakan laman langsung: imej pratonton pautan (`og-portfolio.png`, yang dipaparkan bila pautan dikongsi di LinkedIn, WhatsApp atau X), favicon dan manifest masih membawa jenama lama: "Munir. Di Sebalik Sistem", monogram M krim/tembaga, "Solutions Architect". Ini tidak sepadan dengan laman sekarang (bilik 3D, logo `munir.` dalam fon Syne, "Full-Stack Developer • Keselamatan Rangkaian (UTM)").

## Perubahan

| Fail | Perubahan |
|------|-----------|
| `static/og-portfolio.jpg` (baharu) | 1200×630, 79 KB: render sebenar bilik 3D (mod malam) dengan logo `munir.`, nama, tagline dan `muhammedmunir.github.io`. JPEG supaya kecil (WhatsApp tidak memaparkan imej pratonton yang terlalu besar). URL baharu juga memaksa platform mengambil imej baharu, bukan salinan cache lama. |
| `static/og-portfolio.png` (dipadam) | Imej jenama lama. |
| `static/favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | Ikon baharu `m.` dalam fon Syne laman, titik aksen jingga (`rgb(229,181,128)`), latar gelap bilik `#0b0c0f`. |
| `static/favicon.svg` (dipadam) | Monogram lama. Pelayar menggunakan favicon PNG 32/16. |
| `src/app.html` | `og:image` dan `twitter:image` → `.jpg`, `og:image:type` → `image/jpeg`; teks alt imej tanpa "Di Sebalik Sistem"; pautan `favicon.svg` dibuang. |
| `static/site.webmanifest` | Nama, `short_name` (`munir.`), penerangan dan `background_color` (`#0b0c0f`) diselaraskan. |

## Skop

**Disalin daripada `C:\Project\portfolio-staging\025\` (8 fail)**: lihat `MANIFEST.txt`.
**Dipadam**: `static/og-portfolio.png`, `static/favicon.svg`.
**Disunting**: `plans/README.md` (status 025).
**Luar skop**: kod bilik 3D, `/cv`, `resume.pdf`, halaman `baby-kick-privacy` (favicon sendiri). Jangan ubah fail lain.

## Aliran kerja git

- Kekal pada `main`. JANGAN cipta cawangan. Satu commit: `chore(jenama): imej pratonton, favicon dan manifest sepadan dengan bilik 3D`
- Stage eksplisit (Langkah 4). Jangan `git add -A` / `git add .`. Jangan push.
- **Tukar baris 025 dalam `plans/README.md` kepada `DONE` SEBELUM `git add`.**

## Langkah

### Langkah 1: Salin fail daripada staging dan padam fail lama

```bash
cd /c/Project/portfolio-staging/025
cp --parents src/app.html static/site.webmanifest static/og-portfolio.jpg static/favicon-16.png static/favicon-32.png static/apple-touch-icon.png static/icon-192.png static/icon-512.png /c/Project/portfolio/
cd /c/Project/portfolio
git rm -q static/og-portfolio.png static/favicon.svg
n=0; while read h p; do n=$((n+1)); [ "$(git hash-object --no-filters "$p")" = "$h" ] || echo "BEZA $p"; done < /c/Project/portfolio-staging/025/MANIFEST.txt; echo "SALINAN $n fail"
test ! -e static/og-portfolio.png && test ! -e static/favicon.svg && echo LAMA-DIPADAM
```
**Verify** → tiada baris `BEZA`, `SALINAN 8 fail`, `LAMA-DIPADAM`.

### Langkah 2: Ujian penuh

```bash
npm run check 2>&1 | tail -1
npm test 2>&1 | grep -E "(pass|fail) [0-9]+"
npm run build 2>&1 | tail -1
ls build/og-portfolio.jpg build/favicon-32.png
grep -rlE "og-portfolio\.png|favicon\.svg|Di Sebalik" build --include=*.html --include=*.webmanifest || echo TIADA-RUJUKAN-LAMA
```
→ `0 ERRORS 0 WARNINGS`; `pass 50`, `fail 0`; `✔ done`; kedua-dua fail wujud; `TIADA-RUJUKAN-LAMA`.

### Langkah 3: Ujian asap pelayar (localhost sahaja)

Jika pelayan dev masih berjalan pada port 5173, gunakannya. Jika tidak, mulakan `npm run dev -- --port 5173` di latar belakang dan tunggu `http://localhost:5173/` memberi 200. Kemudian (had masa sekurang-kurangnya 600 s):

```bash
ROOM_URL=http://localhost:5173/ node scripts/room-smoke.mjs
```
→ `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`. Jika tamat masa atau disekat, catat dan teruskan; perancang akan menjalankannya.

### Langkah 4: Status, stage, sahkan indeks, commit

Tukar baris 025 dalam `plans/README.md` daripada `TODO` kepada `DONE` DAHULU. Kemudian:

```bash
grep "| 025" plans/README.md
git add src/app.html static/site.webmanifest static/og-portfolio.jpg static/favicon-16.png static/favicon-32.png static/apple-touch-icon.png static/icon-192.png static/icon-512.png plans/README.md plans/025-jenama-pratonton-ikon.md
while read h p; do [ "$(git ls-files -s -- "$p" | cut -d' ' -f2)" = "$h" ] || echo "INDEKS BEZA $p"; done < /c/Project/portfolio-staging/025/MANIFEST.txt; echo INDEKS-SELESAI
git diff --cached --name-status | grep "^D"
git diff --cached --stat | tail -1
git commit -m "chore(jenama): imej pratonton, favicon dan manifest sepadan dengan bilik 3D"
git status --short
```
→ baris 025 berakhir `DONE |`; tiada `INDEKS BEZA`; `INDEKS-SELESAI`; dua baris `D` (`static/favicon.svg`, `static/og-portfolio.png`); `12 files changed`; selepas commit `git status --short` hanya (mungkin) `?? dev.log`. JANGAN push. BERHENTI dan lapor.

## Kriteria siap

- [ ] 8 fail sepadan dengan manifes (salinan dan indeks); 2 fail lama dipadam
- [ ] `check` 0 ralat 0 amaran; `npm test` fail 0; build `✔ done`; tiada rujukan lama dalam build
- [ ] `ROOM OK` (atau dicatat untuk perancang)
- [ ] Pada `main`; baris 025 = `DONE` dalam commit; satu commit; tiada push

## Syarat STOP

- Pelan 024 belum di-commit, atau semakan drift tidak sepadan.
- Baris `BEZA` atau `INDEKS BEZA` selepas satu cubaan menyalin semula.
- `check`, `npm test` atau build gagal. Jangan ubah fail lain untuk meluluskan ujian.

## Nota susulan (bukan untuk pelan ini)

- Selepas push: LinkedIn menyimpan pratonton lama dalam cache. Pemilik boleh memaksa kemas kini melalui LinkedIn Post Inspector (masukkan URL laman).
- Logo IWA001 / Infinity World: perlukan fail logo resolusi tinggi daripada pemilik.
