# Plan 037: Buang punca lag sebenar (bilik dirender dua kali); telefon tajam tanpa komposer

> **Arahan pelaksana**: Laksanakan TERUS dalam sesi utama, tanpa subagent atau worktree. Ikut langkah mengikut turutan. Salin arahan TEPAT seperti dalam blok kod. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor. Pelan ini tidak memerlukan sebarang keputusan reka bentuk: fail sudah siap di folder staging. Alat yang wujud: Bash, Read, Edit, Write, Glob, Grep. Tiada alat bernama Todo, Run atau Orchestrator. Jangan tandakan `DONE` atau commit sebelum SEMUA ujian (termasuk smoke 390 px) selesai.
>
> **Prasyarat**: Pelan 036 mesti sudah di-commit (`perf(bilik): bilik lebih ringan di semua peranti, UI telefon lebih kecil`).
>
> **Semakan drift (jalankan dahulu, dalam Git Bash)**:
> ```bash
> cd /c/Project/portfolio
> git log -1 --format=%s
> git rev-parse HEAD:src/lib/room/RoomWorld.ts HEAD:src/lib/room/RoomPage.svelte
> git status --short
> ls /c/Project/portfolio-staging/037/MANIFEST.txt
> ```
> → subjek `perf(bilik): bilik lebih ringan di semua peranti, UI telefon lebih kecil`; hash berturut-turut `150fe50b66d2673210b70ba2cdc8b0903e1715ea`, `f25fe24bc63a2a61d2da06b95aad238e59699cfb`; `git status --short` hanya `?? plans/037-buang-punca-lag-telefon-tajam.md`, ` M plans/README.md` dan (jika masih ada) `?? dev.log`; fail manifes wujud. Jika berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: S (salin + ujian) · **Risiko**: LOW (rupa desktop sama; telefon tanpa bloom/vignet tetapi lebih tajam)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-24 dalam salinan terasing (`main` @ Pelan 036): `check` 858 FILES 0 ERRORS 0 WARNINGS, `npm test` pass 50 fail 0, build `✔ done`, smoke `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`, audit papan kekunci desktop dan telefon `ralat: []`, lawatan penuh siang/malam desktop dan telefon `ralat: []`. Tangkapan skrin telefon (393×873, DPR 3) disemak.

## Kenapa

Laporan pemilik selepas 036: desktop okay, tetapi telefon (POCO M8 Pro) masih lag, grafik teruk dan teks kabur; nama di halaman utama nampak tidak kena.

Ukuran (paparan telefon, satu render):

| | Sebelum | Selepas |
|---|---|---|
| Panggilan lukis | 546 | **277** |
| Masa CPU three.js | 14.7–16.1 ms | **3.0–5.2 ms** |
| Masa GPU | 14.1 ms | **5.7 ms** |

1. **Punca utama**: satu bahan alas meja dalam model Sketchfab mempunyai `transmission` 0.85 (kaca fizikal). three.js lalu merender SEMUA objek legap dua kali setiap bingkai (sekali ke sasaran transmission). Berlaku pada semua peranti.
2. **Kabur di telefon**: komposer (sasaran HalfFloat + bloom + vignet + FXAA) melembutkan teks pada skrin, pas dan buku; pengawal pula menurunkan resolusi ke 0.75× bila telefon perlahan.
3. Nama "Muhammed Munir" terkeluar di tepi kanan skrin 360–393 px.

## Perubahan

| Fail | Perubahan |
|------|-----------|
| `src/lib/room/RoomWorld.ts` | `prep()` baharu untuk semua model: berbayang seperti dahulu dan `transmission` ditetapkan 0 (bahan legap). Peranti sentuh dirender terus ke skrin (`direct`): antialias kanvas (MSAA, murah pada GPU telefon), tiada komposer, sasaran komposer tidak diperuntukkan. Pengawal pada telefon: hanya satu penurunan, resolusi 0.85× jika bawah ~35 fps (tidak lagi 0.75× + FXAA). Desktop kekal dengan komposer (bloom, vignet, AO/MSAA ikut kelajuan). |
| `src/lib/room/RoomPage.svelte` | ≤600 px: `.who h1` `min(1.65rem, 6.2vw)` supaya nama penuh muat. |

## Skop

**Disalin daripada `C:\Project\portfolio-staging\037\` (2 fail)**: lihat `MANIFEST.txt`.
**Disunting**: `plans/README.md` (status 037).
**Luar skop**: semua fail lain.

## Aliran kerja git

- Kekal pada `main`. JANGAN cipta cawangan. Satu commit: `perf(bilik): buang render berganda dan telefon dirender terus supaya tajam`
- Stage eksplisit (Langkah 4). Jangan `git add -A` / `git add .`. Jangan push.
- **Tukar baris 037 dalam `plans/README.md` kepada `DONE` SEBELUM `git add`, dan hanya selepas Langkah 3 lulus.**

## Langkah

### Langkah 1: Salin fail daripada staging

```bash
cd /c/Project/portfolio-staging/037
cp --parents src/lib/room/RoomWorld.ts src/lib/room/RoomPage.svelte /c/Project/portfolio/
cd /c/Project/portfolio
n=0; while read h p; do n=$((n+1)); [ "$(git hash-object --no-filters "$p")" = "$h" ] || echo "BEZA $p"; done < /c/Project/portfolio-staging/037/MANIFEST.txt; echo "SALINAN $n fail"
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

Tukar baris 037 dalam `plans/README.md` daripada `TODO` kepada `DONE` DAHULU. Kemudian:

```bash
grep "| 037" plans/README.md
git add src/lib/room/RoomWorld.ts src/lib/room/RoomPage.svelte plans/README.md plans/037-buang-punca-lag-telefon-tajam.md
while read h p; do [ "$(git ls-files -s -- "$p" | cut -d' ' -f2)" = "$h" ] || echo "INDEKS BEZA $p"; done < /c/Project/portfolio-staging/037/MANIFEST.txt; echo INDEKS-SELESAI
git diff --cached --stat | tail -1
git commit -m "perf(bilik): buang render berganda dan telefon dirender terus supaya tajam"
git status --short
```
→ baris 037 berakhir `DONE |`; tiada `INDEKS BEZA`; `INDEKS-SELESAI`; `4 files changed`; selepas commit `git status --short` hanya (mungkin) `?? dev.log`. JANGAN push. BERHENTI dan lapor. Jangan cadangkan pelan seterusnya yang tidak wujud dalam `plans/`.

## Kriteria siap

- [ ] 2 fail sepadan dengan manifes (salinan dan indeks)
- [ ] `check` 0 ralat 0 amaran; `npm test` fail 0; build `✔ done`
- [ ] `ROOM OK` (atau dicatat untuk perancang)
- [ ] Pada `main`; baris 037 = `DONE` dalam commit; satu commit; tiada push

## Syarat STOP

- Pelan 036 belum di-commit, atau semakan drift tidak sepadan.
- Baris `BEZA` atau `INDEKS BEZA` selepas satu cubaan menyalin semula.
- `check`, `npm test` atau build gagal. Jangan ubah fail lain untuk meluluskan ujian.

## Nota susulan (bukan untuk pelan ini)

- Jika telefon masih berat: 17 kotak berbilang bahan (102 panggilan lukis) dan 3 model sama (40 mesh, 67k segi tiga setiap satu) boleh digabung atau diringkaskan; lampu tanpa bayang boleh dikurangkan pada telefon.
