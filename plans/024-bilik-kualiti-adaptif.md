# Plan 024: Bilik 3D: kualiti grafik adaptif untuk GPU lemah

> **Arahan pelaksana**: Laksanakan TERUS dalam sesi utama, tanpa subagent atau worktree. Ikut langkah mengikut turutan. Salin arahan TEPAT seperti dalam blok kod. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor. Pelan ini tidak memerlukan sebarang keputusan reka bentuk: fail sudah siap di folder staging.
>
> **Prasyarat**: Pelan 023 mesti sudah di-commit (`fix(bilik): monitor, logo kemahiran, pintu rak, rak buku berhias, tingkap asal dan cahaya siang`).
>
> **Semakan drift (jalankan dahulu, dalam Git Bash)**:
> ```bash
> cd /c/Project/portfolio
> git log -1 --format=%s
> git rev-parse HEAD:src/lib/room/RoomWorld.ts
> git status --short
> ls /c/Project/portfolio-staging/024/MANIFEST.txt
> ```
> → subjek `fix(bilik): monitor, logo kemahiran, pintu rak, rak buku berhias, tingkap asal dan cahaya siang`; hash `a118043b4475b6897cd44d119227f79e07bee814`; `git status --short` hanya `?? plans/024-bilik-kualiti-adaptif.md`, ` M plans/README.md` dan (jika masih ada) `?? dev.log`; fail manifes wujud. Jika berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: S (salin + ujian) · **Risiko**: LOW (satu fail kod, +27/−2 baris; `/cv` tidak disentuh)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-22 dalam salinan terasing (`main` @ Pelan 023): `check` 858 FILES 0 ERRORS 0 WARNINGS, `npm test` pass 50 fail 0, build `✔ done`, smoke `ROOM OK`. Diukur pada GPU sebenar (AMD Radeon terbina dalam, 1920×1080) serta swiftshader; tangkapan skrin keseluruhan/kemahiran/buku/telefon siang dan malam (1920 px) dan telefon 390 px; tiada ralat konsol.

## Kenapa

Semakan laman langsung selepas Pelan 023: pada GPU terbina dalam (AMD Radeon, 1920×1080) bilik hanya ~25–30 fps, jadi putaran kamera dan peralihan paparan terasa tersekat-sekat. Pengukuran menunjukkan pas GTAO (oklusi ambien) ialah kos utama: mematikannya menaikkan kadar kepada ~50–60 fps, dan bilik masih kelihatan baik (bayang lampu dan matahari kekal).

| Ukuran (GPU AMD terbina dalam, 1920×1080) | fps |
|---|---|
| Kualiti penuh (AO hidup) | ~25–31 |
| Tahap 1 (AO dimatikan secara automatik) | ~48–60 |

## Pembetulan

Pengawal prestasi dalam `RoomWorld.ts`:
- Purata masa bingkai diukur setiap 90 bingkai, bermula 4 s selepas bilik dimuatkan.
- **Tahap 1**: bawah ~40 fps, pas AO dimatikan.
- **Tahap 2**: masih bawah ~30 fps (atau terus pada telefon, yang memang tiada AO), resolusi render dikurangkan (nisbah piksel ×0.6, minimum 0.75).
- Kualiti tidak pernah dinaikkan semula, supaya imej tidak berkelip-kelip.
- Bingkai lebih 250 ms diabaikan. Itu tab yang diperlahankan pelayar (contohnya tetingkap tersorok), bukan GPU lemah.
- GPU laju (≥ 40 fps) kekal pada kualiti penuh tanpa sebarang perubahan.

## Skop

**Disalin daripada `C:\Project\portfolio-staging\024\` (1 fail)**: `src/lib/room/RoomWorld.ts`.
**Disunting**: `plans/README.md` (status 024).
**Luar skop**: `/cv`, `RoomPage.svelte`, aset, CI. Jangan ubah fail lain.

## Aliran kerja git

- Kekal pada `main`. JANGAN cipta cawangan. Satu commit: `perf(bilik): kualiti grafik adaptif untuk GPU lemah`
- Stage eksplisit (Langkah 4). Jangan `git add -A` / `git add .`. Jangan push.
- **Tukar baris 024 dalam `plans/README.md` kepada `DONE` SEBELUM `git add`.**

## Langkah

### Langkah 1: Salin fail daripada staging

```bash
cd /c/Project/portfolio-staging/024
cp --parents src/lib/room/RoomWorld.ts /c/Project/portfolio/
cd /c/Project/portfolio
n=0; while read h p; do n=$((n+1)); [ "$(git hash-object --no-filters "$p")" = "$h" ] || echo "BEZA $p"; done < /c/Project/portfolio-staging/024/MANIFEST.txt; echo "SALINAN $n fail"
```
**Verify** → tiada baris `BEZA`, `SALINAN 1 fail`.

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

Tukar baris 024 dalam `plans/README.md` daripada `TODO` kepada `DONE` DAHULU. Kemudian:

```bash
grep "| 024" plans/README.md
git add src/lib/room/RoomWorld.ts plans/README.md plans/024-bilik-kualiti-adaptif.md
while read h p; do [ "$(git ls-files -s -- "$p" | cut -d' ' -f2)" = "$h" ] || echo "INDEKS BEZA $p"; done < /c/Project/portfolio-staging/024/MANIFEST.txt; echo INDEKS-SELESAI
git diff --cached --stat | tail -1
git commit -m "perf(bilik): kualiti grafik adaptif untuk GPU lemah"
git status --short
```
→ baris 024 berakhir `DONE |`; tiada `INDEKS BEZA`; `INDEKS-SELESAI`; `3 files changed`; selepas commit `git status --short` hanya (mungkin) `?? dev.log`. JANGAN push. BERHENTI dan lapor.

## Kriteria siap

- [ ] 1 fail sepadan dengan manifes (salinan dan indeks)
- [ ] `check` 0 ralat 0 amaran; `npm test` fail 0; build `✔ done`
- [ ] `ROOM OK` (atau dicatat untuk perancang)
- [ ] Pada `main`; baris 024 = `DONE` dalam commit; satu commit; tiada push

## Syarat STOP

- Pelan 023 belum di-commit, atau semakan drift tidak sepadan.
- Baris `BEZA` atau `INDEKS BEZA` selepas satu cubaan menyalin semula.
- `check`, `npm test` atau build gagal. Jangan ubah fail lain untuk meluluskan ujian.

## Nota susulan (bukan untuk pelan ini)

- Logo IWA001 / Infinity World: perlukan fail logo resolusi tinggi daripada pemilik.
