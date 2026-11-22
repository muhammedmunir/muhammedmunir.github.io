# Plan 023: Bilik 3D: betulkan monitor, logo kemahiran, pintu rak, rak buku, tingkap dan cahaya siang

> **Arahan pelaksana**: Laksanakan TERUS dalam sesi utama, tanpa subagent atau worktree. Ikut langkah mengikut turutan. Salin arahan TEPAT seperti dalam blok kod. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor. Pelan ini tidak memerlukan sebarang keputusan reka bentuk: semua fail sudah siap di folder staging.
>
> **Prasyarat**: Pelan 022 mesti sudah di-commit (`feat(bilik): model 3D sebenar (Sketchfab CC BY, Poly Haven CC0) dengan kredit`).
>
> **Semakan drift (jalankan dahulu, dalam Git Bash)**:
> ```bash
> cd /c/Project/portfolio
> git log -1 --format=%s
> git rev-parse HEAD:src/lib/room/RoomWorld.ts
> git status --short
> test ! -e static/room/decor && echo TIADA-KONFLIK
> ls /c/Project/portfolio-staging/023/MANIFEST.txt
> ```
> → subjek `feat(bilik): model 3D sebenar (Sketchfab CC BY, Poly Haven CC0) dengan kredit`; hash `9a10629d8c1fe021f633b0c4b4515048d0568674`; `git status --short` hanya `?? plans/023-bilik-betulkan-model-rak-cahaya.md`, ` M plans/README.md` dan (jika masih ada) `?? dev.log`; `TIADA-KONFLIK`; fail manifes wujud. Jika berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: S (salin + ujian) · **Risiko**: LOW (satu fail kod + 3 model hiasan ~470 KB; `/cv` tidak disentuh)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-22 dalam salinan terasing (`main` @ Pelan 022): `check` 858 FILES 0 ERRORS 0 WARNINGS, `npm test` pass 50 fail 0, build `✔ done`. Tangkapan skrin kesemua 8 paparan dalam mod malam dan siang (1920 px), keseluruhan/kemahiran/buku/telefon dalam mod siang (390 px), serta gambar dekat rak buku, bingkai gambar dan rak server; tiada ralat konsol.

## Kenapa (laporan pemilik selepas Pelan 022)

| # | Masalah | Punca | Pembetulan |
|---|---------|-------|------------|
| 1 | Kotak hitam di belakang logo kemahiran | GTAO mengira oklusi pada sprite logo | Sprite logo dikecualikan daripada AO |
| 2 | Skrin monitor terkeluar dari bingkai | Panel diukur selepas monitor diputar (AABB dunia lebih besar) | Panel diukur dalam ruang model sebelum diputar |
| 3 | Tingkap lebih baik di kedudukan lama | — | Tingkap kembali ke x 0.32–1.04; matahari dan cahaya langit dialih bersama |
| 4 | Buku baris atas terapung; rak kosong | Tinggi baris rak tidak sama, tetapi diandaikan sama | Permukaan papan diukur dengan sinar; kayu digelapkan (sepadan meja walnut); petak kosong diisi pokok kecil, timbunan buku + pasu, bingkai gambar abstrak (Poly Haven CC0) |
| 5 | Neon "munir." menyala pada waktu siang; lantai bercahaya pelik | Neon tiada dalam senarai lampu; siling dan sisi kanan tidak menghalang matahari | Neon padam pada siang; siling menghasilkan bayang + penghalang bayang tidak kelihatan di sisi kanan; siang lebih cerah tanpa silau; halaman buku dan ambang tingkap dimalapkan pada siang |
| 7 | Pintu rak tidak kelihatan terbuka | Kaca model hampir lutsinar sepenuhnya dan berputar ke dalam rak | Pintu dibuka ke arah pelawat, kaca berwarna, bingkai dan pemegang |

## Skop

**Disalin daripada `C:\Project\portfolio-staging\023\` (4 fail)**: `src/lib/room/RoomWorld.ts`, dan 3 model baharu `static/room/decor/ceramic_vase_01.glb`, `potted_plant_04.glb`, `standing_picture_frame_01.glb` (Poly Haven, CC0).
**Disunting**: `plans/README.md` (status 023).
**Luar skop**: `/cv`, `RoomPage.svelte` (kredit Poly Haven CC0 sedia ada), aset lain, CI. Jangan ubah fail lain.

## Aliran kerja git

- Kekal pada `main`. JANGAN cipta cawangan. Satu commit: `fix(bilik): monitor, logo kemahiran, pintu rak, rak buku berhias, tingkap asal dan cahaya siang`
- Stage eksplisit (Langkah 4). Jangan `git add -A` / `git add .`. Jangan push.
- **Tukar baris 023 dalam `plans/README.md` kepada `DONE` SEBELUM `git add`.**

## Langkah

### Langkah 1: Salin fail daripada staging

```bash
cd /c/Project/portfolio-staging/023
cp --parents src/lib/room/RoomWorld.ts static/room/decor/ceramic_vase_01.glb static/room/decor/potted_plant_04.glb static/room/decor/standing_picture_frame_01.glb /c/Project/portfolio/
cd /c/Project/portfolio
n=0; while read h p; do n=$((n+1)); [ "$(git hash-object --no-filters "$p")" = "$h" ] || echo "BEZA $p"; done < /c/Project/portfolio-staging/023/MANIFEST.txt; echo "SALINAN $n fail"
```
**Verify** → tiada baris `BEZA`, `SALINAN 4 fail`.

### Langkah 2: Ujian penuh

```bash
npm run check 2>&1 | tail -1
npm test 2>&1 | grep -E "(pass|fail) [0-9]+"
npm run build 2>&1 | tail -1
```
→ `0 ERRORS 0 WARNINGS`; `pass 50`, `fail 0`; `✔ done`.

### Langkah 3: Ujian asap pelayar (localhost sahaja)

Jika pelayan dev masih berjalan pada port 5173, gunakannya. Jika tidak, mulakan `npm run dev -- --port 5173` di latar belakang dan tunggu `http://localhost:5173/` memberi 200. Kemudian (had masa sekurang-kurangnya 600 s):

```bash
ROOM_URL=http://localhost:5173/ node scripts/room-smoke.mjs
```
→ `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`. Jika tamat masa atau disekat, catat dan teruskan; perancang akan menjalankannya.

### Langkah 4: Status, stage, sahkan indeks, commit

Tukar baris 023 dalam `plans/README.md` daripada `TODO` kepada `DONE` DAHULU. Kemudian:

```bash
grep "| 023" plans/README.md
git add src/lib/room/RoomWorld.ts static/room/decor/ceramic_vase_01.glb static/room/decor/potted_plant_04.glb static/room/decor/standing_picture_frame_01.glb plans/README.md plans/023-bilik-betulkan-model-rak-cahaya.md
while read h p; do [ "$(git ls-files -s -- "$p" | cut -d' ' -f2)" = "$h" ] || echo "INDEKS BEZA $p"; done < /c/Project/portfolio-staging/023/MANIFEST.txt; echo INDEKS-SELESAI
git diff --cached --stat | tail -1
git commit -m "fix(bilik): monitor, logo kemahiran, pintu rak, rak buku berhias, tingkap asal dan cahaya siang"
git status --short
```
→ baris 023 berakhir `DONE |`; tiada `INDEKS BEZA`; `INDEKS-SELESAI`; `6 files changed`; selepas commit `git status --short` hanya (mungkin) `?? dev.log`. JANGAN push. BERHENTI dan lapor.

## Kriteria siap

- [ ] 4 fail sepadan dengan manifes (salinan dan indeks)
- [ ] `check` 0 ralat 0 amaran; `npm test` fail 0; build `✔ done`
- [ ] `ROOM OK` (atau dicatat untuk perancang)
- [ ] Pada `main`; baris 023 = `DONE` dalam commit; satu commit; tiada push

## Syarat STOP

- Pelan 022 belum di-commit, atau semakan drift tidak sepadan.
- Baris `BEZA` atau `INDEKS BEZA` selepas satu cubaan menyalin semula.
- `check`, `npm test` atau build gagal. Jangan ubah fail lain untuk meluluskan ujian.

## Nota susulan (bukan untuk pelan ini)

- Fail asal model hiasan Poly Haven (gltf 1k) boleh dimuat turun semula dari polyhaven.com; versi dimampatkan (tekstur ≤512 px, meshopt) berada di staging.
- Logo IWA001 / Infinity World: perlukan fail logo resolusi tinggi daripada pemilik.
