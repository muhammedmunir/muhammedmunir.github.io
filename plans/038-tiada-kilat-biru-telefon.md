# Plan 038: Telefon: tiada kilatan biru bila skrin diketik

> **Arahan pelaksana**: Laksanakan TERUS dalam sesi utama, tanpa subagent atau worktree. Ikut langkah mengikut turutan. Salin arahan TEPAT seperti dalam blok kod. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor. Pelan ini tidak memerlukan sebarang keputusan reka bentuk: fail sudah siap di folder staging. Alat yang wujud: Bash, Read, Edit, Write, Glob, Grep. Tiada alat bernama Todo, Run atau Orchestrator. Jangan tandakan `DONE` atau commit sebelum SEMUA ujian (termasuk smoke 390 px) selesai.
>
> **Prasyarat**: Pelan 037 mesti sudah di-commit (`perf(bilik): buang render berganda dan telefon dirender terus supaya tajam`).
>
> **Semakan drift (jalankan dahulu, dalam Git Bash)**:
> ```bash
> cd /c/Project/portfolio
> git log -1 --format=%s
> git rev-parse HEAD:src/lib/room/RoomPage.svelte
> git status --short
> ls /c/Project/portfolio-staging/038/MANIFEST.txt
> ```
> → subjek `perf(bilik): buang render berganda dan telefon dirender terus supaya tajam`; hash `c2629f4025cb820c20516ec53bf2db7c12472685`; `git status --short` hanya `?? plans/038-tiada-kilat-biru-telefon.md`, ` M plans/README.md` dan (jika masih ada) `?? dev.log`; fail manifes wujud. Jika berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: XS (salin + ujian) · **Risiko**: LOW (CSS sahaja)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-24 dalam salinan terasing (`main` @ Pelan 037): `check` 858 FILES 0 ERRORS 0 WARNINGS, `npm test` pass 50 fail 0, build `✔ done`, smoke `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`, audit papan kekunci telefon `ralat: []`. Pada telefon tiruan (393×873): `-webkit-tap-highlight-color` kanvas, butang dan `.room` = `rgba(0, 0, 0, 0)` (sebelum: `rgba(51, 181, 229, 0.4)`, biru); ketik buku → paparan `learning`.

## Kenapa

Laporan pemilik: di telefon, setiap kali skrin ditekan, skrin berkelip biru. Itu sorotan ketik lalai Chrome Android (`rgba(51, 181, 229, 0.4)`) pada kanvas bilik (boleh diklik) dan butang. Halaman Workbench sudah mematikannya; halaman bilik belum.

## Perubahan

| Fail | Perubahan |
|------|-----------|
| `src/lib/room/RoomPage.svelte` | `.room`: `-webkit-tap-highlight-color: transparent` (diwarisi oleh kanvas, butang dan pautan; garis fokus papan kekunci kekal). Kanvas: `user-select: none` dan `-webkit-touch-callout: none` supaya tekan lama tidak memilih teks atau membuka menu. |

## Skop

**Disalin daripada `C:\Project\portfolio-staging\038\` (1 fail)**: lihat `MANIFEST.txt`.
**Disunting**: `plans/README.md` (status 038).
**Luar skop**: semua fail lain.

## Aliran kerja git

- Kekal pada `main`. JANGAN cipta cawangan. Satu commit: `fix(bilik): tiada kilatan biru bila skrin telefon diketik`
- Stage eksplisit (Langkah 4). Jangan `git add -A` / `git add .`. Jangan push.
- **Tukar baris 038 dalam `plans/README.md` kepada `DONE` SEBELUM `git add`, dan hanya selepas Langkah 3 lulus.**

## Langkah

### Langkah 1: Salin fail daripada staging

```bash
cd /c/Project/portfolio-staging/038
cp --parents src/lib/room/RoomPage.svelte /c/Project/portfolio/
cd /c/Project/portfolio
n=0; while read h p; do n=$((n+1)); [ "$(git hash-object --no-filters "$p")" = "$h" ] || echo "BEZA $p"; done < /c/Project/portfolio-staging/038/MANIFEST.txt; echo "SALINAN $n fail"
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

Tukar baris 038 dalam `plans/README.md` daripada `TODO` kepada `DONE` DAHULU. Kemudian:

```bash
grep "| 038" plans/README.md
git add src/lib/room/RoomPage.svelte plans/README.md plans/038-tiada-kilat-biru-telefon.md
while read h p; do [ "$(git ls-files -s -- "$p" | cut -d' ' -f2)" = "$h" ] || echo "INDEKS BEZA $p"; done < /c/Project/portfolio-staging/038/MANIFEST.txt; echo INDEKS-SELESAI
git diff --cached --stat | tail -1
git commit -m "fix(bilik): tiada kilatan biru bila skrin telefon diketik"
git status --short
```
→ baris 038 berakhir `DONE |`; tiada `INDEKS BEZA`; `INDEKS-SELESAI`; `3 files changed`; selepas commit `git status --short` hanya (mungkin) `?? dev.log`. JANGAN push. BERHENTI dan lapor. Jangan cadangkan pelan seterusnya yang tidak wujud dalam `plans/`.

## Kriteria siap

- [ ] 1 fail sepadan dengan manifes (salinan dan indeks)
- [ ] `check` 0 ralat 0 amaran; `npm test` fail 0; build `✔ done`
- [ ] `ROOM OK` (atau dicatat untuk perancang)
- [ ] Pada `main`; baris 038 = `DONE` dalam commit; satu commit; tiada push

## Syarat STOP

- Pelan 037 belum di-commit, atau semakan drift tidak sepadan.
- Baris `BEZA` atau `INDEKS BEZA` selepas satu cubaan menyalin semula.
- `check`, `npm test` atau build gagal. Jangan ubah fail lain untuk meluluskan ujian.
