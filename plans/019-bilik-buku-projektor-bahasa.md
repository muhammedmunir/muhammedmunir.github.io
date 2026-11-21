# Plan 019: Bilik 3D: buku terbuka, projektor sinematik, BM/EN, pautan resume dan kualiti render

> **Arahan pelaksana**: Laksanakan TERUS dalam sesi utama, tanpa subagent atau worktree. Ikut langkah mengikut turutan. Salin arahan TEPAT seperti dalam blok kod. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor. Pelan ini tidak memerlukan sebarang keputusan reka bentuk: semua fail sudah siap di folder staging.
>
> **Semakan drift (jalankan dahulu, dalam Git Bash)**:
> ```bash
> cd /c/Project/portfolio
> git rev-parse HEAD
> for f in src/lib/room/RoomWorld.ts src/lib/room/RoomPage.svelte src/lib/room/ObjectPanel.svelte src/lib/workbench/project-media.ts src/app.html src/routes/+layout.svelte; do echo "$(git rev-parse HEAD:$f) $f"; done
> git status --short
> test ! -e static/images/9router-logo.png && echo TIADA-KONFLIK
> ls /c/Project/portfolio-staging/019/MANIFEST.txt
> ```
> → HEAD `59a62ac2d2ae2efe39ab6dc2ed91a104983cc747`; hash fail mengikut turutan: `a1ee8ffa…`, `f5c5a9ce…`, `7df2fe60…`, `7c2d7e94…`, `e5c58489…`, `f6f3644f…`; `git status --short` hanya `?? plans/019-bilik-buku-projektor-bahasa.md`, ` M plans/README.md` dan (jika masih ada) `?? dev.log`; `TIADA-KONFLIK`; fail manifes wujud. Jika berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: S (salin + ujian) · **Risiko**: MEDIUM (enjin 3D dan halaman utama; `/cv` tidak disentuh)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-21 dalam salinan terasing daripada `main` (`59a62ac`): `check` 858 FILES 0 ERRORS 0 WARNINGS, `npm test` pass 50 fail 0, build `✔ done`, `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`, tangkapan skrin desktop dan telefon disemak (BM dan EN), tiada ralat konsol.

## Kenapa (maklum balas pemilik selepas Pelan 018 di produksi)

| Aduan | Pembetulan |
|-------|------------|
| Klik buku: buku senget separuh dalam rak, nampak seperti kotak | Buku terbang dari rak ke hadapan kamera dan terbuka: halaman kiri (jenis anugerah, meterai, pengeluar), halaman kanan (nama, kelayakan, tempoh). Klik sekali lagi untuk tutup. Kamera pembelajaran kini menghadap rak dari depan. |
| "Adakah page resume dah tak ada?" | Header: **Resume** (ke `/cv`) · Hubungi · butang bahasa. PDF kekal dalam `/cv` dan modal Hubungi. |
| Projektor nampak buruk | Slaid gelap sinematik (titik panas, vignet, nombor slaid, bar kemajuan), unit projektor siling sebaris dengan skrin, pancaran cahaya halus, skrin bergulung yang lebih kemas. |
| Bahasa | Butang BM/EN dalam header; semua teks halaman, tooltip, kanvas 3D, kod profil dan panel ikut bahasa (disimpan dalam `localStorage` yang sama dengan `/cv`). |
| Logo IWA001, Infinity World, 9Router terlalu ringkas | 9Router guna ikon sebenar aplikasi 9Router Control (projek pemilik). IWA001 dan Infinity guna monogram berwarna kerana logo sumber hanya 150×49 dan 64×44 px. |
| Lebih realistik | Antialias MSAA dalam komposer (sebelum ini hilang), oklusi ambien GTAO (desktop), bayang PCF 2048 px (r186 membuang PCFSoft), vignet kamera. |
| Halaman rosak selepas deploy (HTML lama dalam cache) | `app.html` memuat semula sekali bila import JS gagal; `+layout.svelte` menetapkan semula bendera selepas aplikasi berjaya dimuat. |

## Skop

**Disalin daripada `C:\Project\portfolio-staging\019\` (7 fail)**: `src/lib/room/RoomWorld.ts`, `src/lib/room/RoomPage.svelte`, `src/lib/room/ObjectPanel.svelte`, `src/lib/workbench/project-media.ts`, `src/app.html`, `src/routes/+layout.svelte`, `static/images/9router-logo.png` (baharu).
**Disunting**: `plans/README.md` (status 019).
**Luar skop**: `/cv`, Workbench lama, `static/room/**`, skrip ujian, CI. Jangan ubah fail lain.

## Aliran kerja git

- Kekal pada `main`. JANGAN cipta cawangan. Satu commit: `feat(bilik): buku terbuka, projektor sinematik, BM/EN dan kualiti render`
- Stage eksplisit (Langkah 4). Jangan `git add -A` / `git add .`. Jangan push.

## Langkah

### Langkah 1: Salin fail daripada staging

```bash
cd /c/Project/portfolio-staging/019
cp --parents src/lib/room/RoomWorld.ts src/lib/room/RoomPage.svelte src/lib/room/ObjectPanel.svelte src/lib/workbench/project-media.ts src/app.html src/routes/+layout.svelte static/images/9router-logo.png /c/Project/portfolio/
cd /c/Project/portfolio
n=0; while read h p; do n=$((n+1)); [ "$(git hash-object --no-filters "$p")" = "$h" ] || echo "BEZA $p"; done < /c/Project/portfolio-staging/019/MANIFEST.txt; echo "SALINAN $n fail"
```
**Verify** → tiada baris `BEZA`, `SALINAN 7 fail`.

### Langkah 2: Ujian penuh

```bash
npm run check 2>&1 | tail -1
npm test 2>&1 | grep -E "(pass|fail) [0-9]+"
npm run build 2>&1 | tail -1
```
→ `0 ERRORS 0 WARNINGS`; `pass 50`, `fail 0`; `✔ done`.

### Langkah 3: Ujian asap pelayar (localhost sahaja)

Jika pelayan dev Pelan 018 masih berjalan pada port 5173, gunakannya (Vite memuat semula sendiri). Jika tidak, mulakan `npm run dev -- --port 5173` di latar belakang dan tunggu `http://localhost:5173/` memberi 200. Kemudian:

```bash
ROOM_URL=http://localhost:5173/ node scripts/room-smoke.mjs
```
→ `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`. Jika mod auto menyekat pelayar, catat "Langkah 3 disekat" dan teruskan; perancang akan menjalankannya.

### Langkah 4: Stage, sahkan indeks, commit

Tukar baris 019 dalam `plans/README.md` daripada `TODO` kepada `DONE`. Kemudian:

```bash
git add src/lib/room/RoomWorld.ts src/lib/room/RoomPage.svelte src/lib/room/ObjectPanel.svelte src/lib/workbench/project-media.ts src/app.html src/routes/+layout.svelte static/images/9router-logo.png plans/README.md plans/019-bilik-buku-projektor-bahasa.md
while read h p; do [ "$(git ls-files -s -- "$p" | cut -d' ' -f2)" = "$h" ] || echo "INDEKS BEZA $p"; done < /c/Project/portfolio-staging/019/MANIFEST.txt; echo INDEKS-SELESAI
git diff --cached --stat | tail -1
git commit -m "feat(bilik): buku terbuka, projektor sinematik, BM/EN dan kualiti render"
git status --short
```
→ tiada `INDEKS BEZA`; `INDEKS-SELESAI`; `9 files changed`; selepas commit `git status --short` hanya (mungkin) `?? dev.log`. JANGAN push. BERHENTI dan lapor.

## Kriteria siap

- [ ] 7 fail sepadan dengan manifes (salinan dan indeks)
- [ ] `check` 0 ralat 0 amaran; `npm test` fail 0; build `✔ done`
- [ ] `ROOM OK` (atau dicatat disekat untuk perancang)
- [ ] Pada `main`; baris 019 = `DONE`; satu commit; tiada push

## Syarat STOP

- Semakan drift tidak sepadan.
- Baris `BEZA` atau `INDEKS BEZA` selepas satu cubaan menyalin semula.
- `check`, `npm test` atau build gagal. Jangan ubah fail lain untuk meluluskan ujian.

## Nota susulan (bukan untuk pelan ini)

- Realisme seterusnya: Poly Haven (CC0) tiada kerusi pejabat, monitor moden, papan kekunci atau rak server. Model realistik untuk objek ini perlu daripada Sketchfab (lesen CC-BY, perlu kredit dan akaun pemilik untuk muat turun) atau dibina dalam Blender. Poly Haven boleh menggantikan buku hiasan (`decorative_book_set_01`) dan menambah `office_notepads`, `modular_electric_cables`.
- Logo IWA001 / Infinity World: perlukan fail logo resolusi tinggi daripada pemilik.
- Buang Workbench lama (cadangan asal Pelan 019) ditangguhkan ke pelan berikutnya.
