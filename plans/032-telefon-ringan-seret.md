# Plan 032: Mod telefon ringan dan seret untuk melihat sekeliling dalam setiap paparan

> **Arahan pelaksana**: Laksanakan TERUS dalam sesi utama, tanpa subagent atau worktree. Ikut langkah mengikut turutan. Salin arahan TEPAT seperti dalam blok kod. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor. Pelan ini tidak memerlukan sebarang keputusan reka bentuk: fail sudah siap di folder staging. Alat yang wujud: Bash, Read, Edit, Write, Glob, Grep. Tiada alat bernama Todo, Run atau Orchestrator.
>
> **Prasyarat**: Pelan 031 mesti sudah di-commit (`fix(bilik): label paparan terbaca di telefon dan CPU bawah meja dibaiki`).
>
> **Semakan drift (jalankan dahulu, dalam Git Bash)**:
> ```bash
> cd /c/Project/portfolio
> git log -1 --format=%s
> git rev-parse HEAD:src/lib/room/RoomWorld.ts
> git status --short
> ls /c/Project/portfolio-staging/032/MANIFEST.txt
> ```
> → subjek `fix(bilik): label paparan terbaca di telefon dan CPU bawah meja dibaiki`; hash `12e76f91c49c1a0be66746a81953c5991a7d85e5`; `git status --short` hanya `?? plans/032-telefon-ringan-seret.md`, ` M plans/README.md` dan (jika masih ada) `?? dev.log`; fail manifes wujud. Jika berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: S (salin + ujian) · **Risiko**: LOW-MED (satu fail, +41/−12; tetapan grafik peranti sentuh dan kawalan kamera)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-23 dalam salinan terasing (`main` @ Pelan 031): `check` 857 FILES 0 ERRORS 0 WARNINGS, `npm test` pass 50 fail 0, build `✔ done`, smoke `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`, audit papan kekunci Pelan 028 (desktop dan telefon) tanpa ralat, lawatan penuh semua paparan siang/malam 1440 px dan 390 px tanpa ralat. Disahkan pada emulasi telefon (390 px, DPR 3, sentuh): nisbah piksel 1.5, MSAA 2, 0 bayang lampu sorot, bloom separuh resolusi; seret 12 langkah dalam paparan Kemahiran menggerakkan kamera ~0.97 m dan berhenti pada had; had penuh dipulihkan di gambaran keseluruhan.

## Kenapa

Laporan pemilik dari telefon sebenar: bilik "lag gila", objek tidak muat sepenuhnya, dan kamera tidak boleh digerakkan dalam paparan Kemahiran (rak server).

Punca dalam kod:

1. **Beban grafik telefon sama dengan desktop.** Resolusi render 2× skrin, antialias MSAA 4 sampel pada sasaran HalfFloat, bayang lampu utama 2048 px dan bayang lampu meja, bloom resolusi penuh. Pengawal prestasi (Pelan 024) hanya bertindak selepas ~90 bingkai perlahan, dan tahap terendahnya masih resolusi ~1.8× pada telefon DPR 3.
2. **Kamera dikunci dalam setiap paparan selain gambaran keseluruhan.** Pada skrin sempit, sebahagian objek (contoh logo kemahiran di tepi) boleh terpotong tanpa cara untuk melihatnya.

## Perubahan (`src/lib/room/RoomWorld.ts`)

| Perubahan | Kesan |
|---|---|
| Peranti sentuh (`hover: none`) sejak awal: nisbah piksel maksimum 1.5 (sebelum ini 2), MSAA 2 sampel (sebelum ini 4), bayang lampu utama 1024 px (sebelum ini 2048), lampu meja tanpa bayang, bloom separuh resolusi | Kira-kira separuh piksel dan kerja GPU setiap bingkai pada telefon. Desktop tidak berubah. |
| Pengawal prestasi: tahap 2 pada peranti sentuh turunkan nisbah piksel ke 1.0; tahap 3 baharu matikan bloom jika masih bawah ~30 fps | Telefon lemah terus mendapat versi paling ringan. |
| Seret untuk melihat sekeliling dalam setiap paparan kecuali Telefon: ±0.35 rad mendatar, ±0.12 rad menegak, tanpa zum. Gambaran keseluruhan kekal seperti sebelum ini. | Objek di tepi boleh dilihat dengan seret jari/tetikus; kamera tidak boleh tersesat. |
| Seretan lebih 8 px tidak dikira sebagai klik pada objek | Seret untuk melihat tidak membuka pas, buku atau projek secara tidak sengaja. |

## Skop

**Disalin daripada `C:\Project\portfolio-staging\032\` (1 fail)**: lihat `MANIFEST.txt`.
**Disunting**: `plans/README.md` (status 032).
**Luar skop**: `RoomPage.svelte`, model 3D, `/cv`. Jangan ubah fail lain.

## Aliran kerja git

- Kekal pada `main`. JANGAN cipta cawangan. Satu commit: `perf(bilik): mod telefon ringan dan seret untuk melihat sekeliling dalam paparan`
- Stage eksplisit (Langkah 4). Jangan `git add -A` / `git add .`. Jangan push.
- **Tukar baris 032 dalam `plans/README.md` kepada `DONE` SEBELUM `git add`.**

## Langkah

### Langkah 1: Salin fail daripada staging

```bash
cd /c/Project/portfolio-staging/032
cp --parents src/lib/room/RoomWorld.ts /c/Project/portfolio/
cd /c/Project/portfolio
n=0; while read h p; do n=$((n+1)); [ "$(git hash-object --no-filters "$p")" = "$h" ] || echo "BEZA $p"; done < /c/Project/portfolio-staging/032/MANIFEST.txt; echo "SALINAN $n fail"
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

Tukar baris 032 dalam `plans/README.md` daripada `TODO` kepada `DONE` DAHULU. Kemudian:

```bash
grep "| 032" plans/README.md
git add src/lib/room/RoomWorld.ts plans/README.md plans/032-telefon-ringan-seret.md
while read h p; do [ "$(git ls-files -s -- "$p" | cut -d' ' -f2)" = "$h" ] || echo "INDEKS BEZA $p"; done < /c/Project/portfolio-staging/032/MANIFEST.txt; echo INDEKS-SELESAI
git diff --cached --stat | tail -1
git commit -m "perf(bilik): mod telefon ringan dan seret untuk melihat sekeliling dalam paparan"
git status --short
```
→ baris 032 berakhir `DONE |`; tiada `INDEKS BEZA`; `INDEKS-SELESAI`; `3 files changed`; selepas commit `git status --short` hanya (mungkin) `?? dev.log`. JANGAN push. BERHENTI dan lapor. Jangan cadangkan pelan seterusnya yang tidak wujud dalam `plans/`.

## Kriteria siap

- [ ] 1 fail sepadan dengan manifes (salinan dan indeks)
- [ ] `check` 0 ralat 0 amaran; `npm test` fail 0; build `✔ done`
- [ ] `ROOM OK` (atau dicatat untuk perancang)
- [ ] Pada `main`; baris 032 = `DONE` dalam commit; satu commit; tiada push

## Syarat STOP

- Pelan 031 belum di-commit, atau semakan drift tidak sepadan.
- Baris `BEZA` atau `INDEKS BEZA` selepas satu cubaan menyalin semula.
- `check`, `npm test` atau build gagal. Jangan ubah fail lain untuk meluluskan ujian.

## Nota susulan (bukan untuk pelan ini)

- Prestasi sebenar pada telefon pemilik perlu disahkan selepas push (ujian perancang menggunakan GPU desktop dengan emulasi telefon).
