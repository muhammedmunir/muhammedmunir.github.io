# Plan 036: Bilik 2.7–5× lebih ringan di semua peranti; UI telefon lebih kecil; tooltip tidak terpotong

> **Arahan pelaksana**: Laksanakan TERUS dalam sesi utama, tanpa subagent atau worktree. Ikut langkah mengikut turutan. Salin arahan TEPAT seperti dalam blok kod. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor. Pelan ini tidak memerlukan sebarang keputusan reka bentuk: fail sudah siap di folder staging. Alat yang wujud: Bash, Read, Edit, Write, Glob, Grep. Tiada alat bernama Todo, Run atau Orchestrator. Jangan tandakan `DONE` atau commit sebelum SEMUA ujian (termasuk smoke 390 px) selesai.
>
> **Prasyarat**: Pelan 035 mesti sudah di-commit (`fix(bilik): kawalan telefon lebih padat dan bilik lebih ringan`).
>
> **Semakan drift (jalankan dahulu, dalam Git Bash)**:
> ```bash
> cd /c/Project/portfolio
> git log -1 --format=%s
> git rev-parse HEAD:src/lib/room/RoomWorld.ts HEAD:src/lib/room/RoomPage.svelte
> git status --short
> ls /c/Project/portfolio-staging/036/MANIFEST.txt
> ```
> → subjek `fix(bilik): kawalan telefon lebih padat dan bilik lebih ringan`; hash berturut-turut `bcfb13432913489e1e13558e0b5753dfff041eb7`, `87090081c87515dfd61fde2120b694ef9dd1d20b`; `git status --short` hanya `?? plans/036-bilik-ringan-semua-peranti.md`, ` M plans/README.md` dan (jika masih ada) `?? dev.log`; fail manifes wujud. Jika berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: M (salin + ujian) · **Risiko**: MED (pengawal prestasi ditulis semula; rupa bilik pada GPU laju kekal sama)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-23 dalam salinan terasing (`main` @ Pelan 035): `check` 858 FILES 0 ERRORS 0 WARNINGS, `npm test` pass 50 fail 0, build `✔ done`, smoke `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`. Masa GPU setiap bingkai diukur dengan `EXT_disjoint_timer_query_webgl2` pada GPU terbina dalam mesin pembangunan.

## Kenapa

Laporan pemilik: butang dan teks masih nampak besar di telefon, label tooltip terpotong di tepi skrin, dan bilik terasa lag **di desktop juga**, bukan telefon sahaja.

Ukuran masa GPU satu bingkai (1440×900, sebelum pelan ini):

| Komponen | Kos |
|---|---|
| Asal (AO, bayang setiap bingkai, MSAA 4, bloom) | **57.7 ms** (~17 fps) |
| Asal pada skrin retina (DPR 2) | **166.7 ms** (~6 fps) |
| AO | ~20 ms |
| Kemas kini peta bayang setiap bingkai (lampu titik = 6 laluan render) | ~18 ms |
| MSAA (resolve sasaran HalfFloat) | ~6–9 ms |
| Bloom | ~5 ms |

## Perubahan

| Fail | Perubahan |
|------|-----------|
| `src/lib/room/RoomWorld.ts` | **Bayang dikemas kini hanya bila objek bergerak** (pintu rak, pas, buku, telefon), pada semua peranti; bilik hampir statik. **Lampu meja tanpa bayang** pada semua peranti. **Bajet piksel ~2.4 juta**: telefon kekal 2× (tajam); desktop besar atau retina tidak lagi dirender pada 3–5 juta piksel. **Antialias FXAA** (murah) sebagai asas, bukan MSAA. **Pengawal prestasi ditulis semula**: semua peranti bermula ringan (FXAA, tanpa AO); GPU laju (~55+ fps) dinaik taraf ke MSAA 4 kemudian AO (desktop); naik taraf yang memperlahankan diundur dan tidak dicuba lagi; masih perlahan pada tahap asas → resolusi 0.75×, kemudian tanpa bloom. |
| `src/lib/room/RoomPage.svelte` | ≤600 px: butang header 34 px, butang bar paparan 32 px, fon lebih kecil, nama "Muhammed Munir" 1.65 rem, petunjuk bawah lebih kecil. Tooltip berpusat dan dihadkan dalam lebar skrin (tidak lagi terpotong di tepi kanan). |

| Masa GPU satu bingkai (sama mesin) | Sebelum | Selepas |
|---|---|---|
| Desktop 1440×900, skrin 1× | 57.7 ms | **21.3 ms** |
| Desktop 1440×900, skrin retina 2× | 166.7 ms | **30.9 ms** |

## Skop

**Disalin daripada `C:\Project\portfolio-staging\036\` (2 fail)**: lihat `MANIFEST.txt`.
**Disunting**: `plans/README.md` (status 036).
**Luar skop**: semua fail lain.

## Aliran kerja git

- Kekal pada `main`. JANGAN cipta cawangan. Satu commit: `perf(bilik): bilik lebih ringan di semua peranti, UI telefon lebih kecil`
- Stage eksplisit (Langkah 4). Jangan `git add -A` / `git add .`. Jangan push.
- **Tukar baris 036 dalam `plans/README.md` kepada `DONE` SEBELUM `git add`, dan hanya selepas Langkah 3 lulus.**

## Langkah

### Langkah 1: Salin fail daripada staging

```bash
cd /c/Project/portfolio-staging/036
cp --parents src/lib/room/RoomWorld.ts src/lib/room/RoomPage.svelte /c/Project/portfolio/
cd /c/Project/portfolio
n=0; while read h p; do n=$((n+1)); [ "$(git hash-object --no-filters "$p")" = "$h" ] || echo "BEZA $p"; done < /c/Project/portfolio-staging/036/MANIFEST.txt; echo "SALINAN $n fail"
```
**Verify** → tiada baris `BEZA`, `SALINAN 2 fail`.

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

Tukar baris 036 dalam `plans/README.md` daripada `TODO` kepada `DONE` DAHULU. Kemudian:

```bash
grep "| 036" plans/README.md
git add src/lib/room/RoomWorld.ts src/lib/room/RoomPage.svelte plans/README.md plans/036-bilik-ringan-semua-peranti.md
while read h p; do [ "$(git ls-files -s -- "$p" | cut -d' ' -f2)" = "$h" ] || echo "INDEKS BEZA $p"; done < /c/Project/portfolio-staging/036/MANIFEST.txt; echo INDEKS-SELESAI
git diff --cached --stat | tail -1
git commit -m "perf(bilik): bilik lebih ringan di semua peranti, UI telefon lebih kecil"
git status --short
```
→ baris 036 berakhir `DONE |`; tiada `INDEKS BEZA`; `INDEKS-SELESAI`; `4 files changed`; selepas commit `git status --short` hanya (mungkin) `?? dev.log`. JANGAN push. BERHENTI dan lapor. Jangan cadangkan pelan seterusnya yang tidak wujud dalam `plans/`.

## Kriteria siap

- [ ] 2 fail sepadan dengan manifes (salinan dan indeks)
- [ ] `check` 0 ralat 0 amaran; `npm test` fail 0; build `✔ done`
- [ ] `ROOM OK` (atau dicatat untuk perancang)
- [ ] Pada `main`; baris 036 = `DONE` dalam commit; satu commit; tiada push

## Syarat STOP

- Pelan 035 belum di-commit, atau semakan drift tidak sepadan.
- Baris `BEZA` atau `INDEKS BEZA` selepas satu cubaan menyalin semula.
- `check`, `npm test` atau build gagal. Jangan ubah fail lain untuk meluluskan ujian.

## Nota susulan (bukan untuk pelan ini)

- Kos asas yang tinggal (~13 ms pada GPU terbina dalam): 330k segi tiga, 10 lampu. Jika masih perlu lebih ringan, langkah seterusnya ialah mengurangkan lampu tanpa bayang dan memudahkan model 3D paling berat.
