# Plan 034: Telefon kembali tajam (resolusi 2×, bloom penuh, had bawah 1.5×)

> **Arahan pelaksana**: Laksanakan TERUS dalam sesi utama, tanpa subagent atau worktree. Ikut langkah mengikut turutan. Salin arahan TEPAT seperti dalam blok kod. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor. Pelan ini tidak memerlukan sebarang keputusan reka bentuk: fail sudah siap di folder staging. Alat yang wujud: Bash, Read, Edit, Write, Glob, Grep. Tiada alat bernama Todo, Run atau Orchestrator. Jangan tandakan `DONE` atau commit sebelum SEMUA ujian (termasuk smoke 390 px) selesai.
>
> **Prasyarat**: Pelan 033 mesti sudah di-commit (`feat(bilik): CPU binaan sendiri, pusingan lebih luas dan bayang berkala di telefon`).
>
> **Semakan drift (jalankan dahulu, dalam Git Bash)**:
> ```bash
> cd /c/Project/portfolio
> git log -1 --format=%s
> git rev-parse HEAD:src/lib/room/RoomWorld.ts
> git status --short
> ls /c/Project/portfolio-staging/034/MANIFEST.txt
> ```
> → subjek `feat(bilik): CPU binaan sendiri, pusingan lebih luas dan bayang berkala di telefon`; hash `4edbf0ca4e9645310e2759deb400c236f975e5b4`; `git status --short` hanya `?? plans/034-telefon-tajam.md`, ` M plans/README.md` dan (jika masih ada) `?? dev.log`; fail manifes wujud. Jika berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: S (salin + ujian) · **Risiko**: LOW (3 baris dalam satu fail; desktop tidak berubah)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-23 dalam salinan terasing (`main` @ Pelan 033): `check` 857 FILES 0 ERRORS 0 WARNINGS, `npm test` pass 50 fail 0, build `✔ done`, smoke `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`. Emulasi telefon 362×865 (DPR 3): nisbah piksel 2, bayang berkala kekal, seret kiri/kanan tanpa ralat.

## Kenapa

Laporan pemilik selepas Pelan 033 pada telefon sebenar: bilik kini lancar, tetapi grafik "buruk dan kabur gila".

Punca: Pelan 032 mengehadkan telefon kepada resolusi 1.5× (skrin telefon 3×), bloom separuh resolusi, dan pengawal prestasi boleh menurunkan lagi ke 1.25×. Penjimatan prestasi yang sebenar datang daripada bayang yang dikemas kini secara berkala (Pelan 033), jadi resolusi boleh dinaikkan semula.

## Perubahan (`src/lib/room/RoomWorld.ts`)

| Perubahan | Kesan |
|---|---|
| Telefon mula pada nisbah piksel maksimum 2 (sama seperti desktop), bukan 1.5 | Teks skrin, logo dan tepi objek tajam semula |
| Bloom pada resolusi penuh di semua peranti | Cahaya lampu, neon dan monitor tidak lagi kabur |
| Pengawal prestasi telefon (tahap 2) turun ke 1.5×, bukan 1.25× | Telefon lemah masih mendapat kelegaan, tanpa menjadi kabur teruk |

Kekal daripada Pelan 032/033: MSAA 2 sampel, bayang lampu utama 1024 px, lampu meja tanpa bayang, bayang dikemas kini ~6 kali sesaat, tahap 3 matikan bloom jika telefon masih bawah ~30 fps.

## Skop

**Disalin daripada `C:\Project\portfolio-staging\034\` (1 fail)**: lihat `MANIFEST.txt`.
**Disunting**: `plans/README.md` (status 034).
**Luar skop**: semua fail lain.

## Aliran kerja git

- Kekal pada `main`. JANGAN cipta cawangan. Satu commit: `fix(bilik): telefon kembali tajam, resolusi dan bloom penuh`
- Stage eksplisit (Langkah 4). Jangan `git add -A` / `git add .`. Jangan push.
- **Tukar baris 034 dalam `plans/README.md` kepada `DONE` SEBELUM `git add`, dan hanya selepas Langkah 3 lulus.**

## Langkah

### Langkah 1: Salin fail daripada staging

```bash
cd /c/Project/portfolio-staging/034
cp --parents src/lib/room/RoomWorld.ts /c/Project/portfolio/
cd /c/Project/portfolio
n=0; while read h p; do n=$((n+1)); [ "$(git hash-object --no-filters "$p")" = "$h" ] || echo "BEZA $p"; done < /c/Project/portfolio-staging/034/MANIFEST.txt; echo "SALINAN $n fail"
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

Jika pelayan dev masih berjalan pada port 5173, gunakannya. Jika tidak, mulakan `npm run dev -- --port 5173` di latar belakang dan tunggu `http://localhost:5173/` memberi 200. Kemudian (had masa sekurang-kurangnya 600 s; tunggu sehingga selesai):

```bash
ROOM_URL=http://localhost:5173/ node scripts/room-smoke.mjs
```
→ `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`. Jika gagal kerana tamat masa, ulang sekali. Jika masih gagal, catat dan teruskan; perancang akan menjalankannya.

### Langkah 4: Status, stage, sahkan indeks, commit

Tukar baris 034 dalam `plans/README.md` daripada `TODO` kepada `DONE` DAHULU. Kemudian:

```bash
grep "| 034" plans/README.md
git add src/lib/room/RoomWorld.ts plans/README.md plans/034-telefon-tajam.md
while read h p; do [ "$(git ls-files -s -- "$p" | cut -d' ' -f2)" = "$h" ] || echo "INDEKS BEZA $p"; done < /c/Project/portfolio-staging/034/MANIFEST.txt; echo INDEKS-SELESAI
git diff --cached --stat | tail -1
git commit -m "fix(bilik): telefon kembali tajam, resolusi dan bloom penuh"
git status --short
```
→ baris 034 berakhir `DONE |`; tiada `INDEKS BEZA`; `INDEKS-SELESAI`; `3 files changed`; selepas commit `git status --short` hanya (mungkin) `?? dev.log`. JANGAN push. BERHENTI dan lapor. Jangan cadangkan pelan seterusnya yang tidak wujud dalam `plans/`.

## Kriteria siap

- [ ] 1 fail sepadan dengan manifes (salinan dan indeks)
- [ ] `check` 0 ralat 0 amaran; `npm test` fail 0; build `✔ done`
- [ ] `ROOM OK` (atau dicatat untuk perancang)
- [ ] Pada `main`; baris 034 = `DONE` dalam commit; satu commit; tiada push

## Syarat STOP

- Pelan 033 belum di-commit, atau semakan drift tidak sepadan.
- Baris `BEZA` atau `INDEKS BEZA` selepas satu cubaan menyalin semula.
- `check`, `npm test` atau build gagal. Jangan ubah fail lain untuk meluluskan ujian.

## Nota susulan (bukan untuk pelan ini)

- Pemilik perlu mengesahkan pada telefon sebenar: tajam DAN masih lancar. Jika lag kembali, pilihan seterusnya ialah MSAA 0 pada telefon (resolusi 2× sudah mengurangkan tepi bergerigi).
