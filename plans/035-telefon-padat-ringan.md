# Plan 035: Telefon — kawalan lebih padat dan bilik lebih ringan

> **Arahan pelaksana**: Laksanakan TERUS dalam sesi utama, tanpa subagent atau worktree. Ikut langkah mengikut turutan. Salin arahan TEPAT seperti dalam blok kod. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor. Pelan ini tidak memerlukan sebarang keputusan reka bentuk: fail sudah siap di folder staging. Alat yang wujud: Bash, Read, Edit, Write, Glob, Grep. Tiada alat bernama Todo, Run atau Orchestrator. Jangan tandakan `DONE` atau commit sebelum SEMUA ujian (termasuk smoke 390 px) selesai.
>
> **Prasyarat**: Pelan 034 mesti sudah di-commit (`fix(bilik): telefon kembali tajam, resolusi dan bloom penuh`).
>
> **Semakan drift (jalankan dahulu, dalam Git Bash)**:
> ```bash
> cd /c/Project/portfolio
> git log -1 --format=%s
> git rev-parse HEAD:src/lib/room/RoomWorld.ts HEAD:src/lib/room/RoomPage.svelte
> git status --short
> ls /c/Project/portfolio-staging/035/MANIFEST.txt
> ```
> → subjek `fix(bilik): telefon kembali tajam, resolusi dan bloom penuh`; hash berturut-turut `7f23c60f52ecedfffbcdbfe8c362e0d73ee6b542`, `ca9b011495bdd009c72b59e2ed544967fb9e51f7`; `git status --short` hanya `?? plans/035-telefon-padat-ringan.md`, ` M plans/README.md` dan (jika masih ada) `?? dev.log`; fail manifes wujud. Jika berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: S (salin + ujian) · **Risiko**: LOW (CSS telefon ≤600 px; dua tetapan grafik peranti sentuh; desktop tidak berubah)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-23 dalam salinan terasing (`main` @ Pelan 034): `check` 857 FILES 0 ERRORS 0 WARNINGS, `npm test` pass 50 fail 0, build `✔ done`, smoke `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`. Tangkapan skrin 360×760 (DPR 3) bagi Gambaran keseluruhan, Tayangan, Tentang saya dan Telefon.

## Kenapa

Laporan pemilik pada telefon sebenar selepas Pelan 034: butang "besar dan sempit", dan bilik masih terasa lag dan berat.

1. **Bar atas terlalu besar di telefon.** Semua butang 44 px; pada 360 px paparan Tayangan menjadi tiga baris butang (Kembali, nama projek, ‹ 1/5 ›, Butiran, Pilih projek lain) yang menutup ~150 px bahagian atas bilik, dan Tentang saya menjadi dua baris.
2. **Masih berat.** Telefon masih menggunakan antialias MSAA 2 sampel pada sasaran HalfFloat (mahal pada GPU telefon), dan pengawal prestasi hanya bertindak di bawah ~30 fps, jadi bilik pada 30–45 fps terasa tersekat-sekat tetapi tidak diringankan.

## Perubahan

| Fail | Perubahan |
|------|-----------|
| `src/lib/room/RoomPage.svelte` | ≤600 px: butang header 38 px, butang bar paparan 36 px dan fon lebih kecil, label paparan lebih padat, "Pilih projek lain" dipendekkan kepada "Projek lain" ("Other projects"), petunjuk bawah lebih kecil. Hasil pada 360 px: Tayangan 2 baris, Tentang saya 1 baris. |
| `src/lib/room/RoomWorld.ts` | Peranti sentuh: tiada MSAA (resolusi 2× sudah menghaluskan tepi). Pengawal prestasi telefon bertindak di bawah ~45 fps (turun ke resolusi 1.5×, kemudian matikan bloom). |

## Skop

**Disalin daripada `C:\Project\portfolio-staging\035\` (2 fail)**: lihat `MANIFEST.txt`.
**Disunting**: `plans/README.md` (status 035).
**Luar skop**: semua fail lain.

## Aliran kerja git

- Kekal pada `main`. JANGAN cipta cawangan. Satu commit: `fix(bilik): kawalan telefon lebih padat dan bilik lebih ringan`
- Stage eksplisit (Langkah 4). Jangan `git add -A` / `git add .`. Jangan push.
- **Tukar baris 035 dalam `plans/README.md` kepada `DONE` SEBELUM `git add`, dan hanya selepas Langkah 3 lulus.**

## Langkah

### Langkah 1: Salin fail daripada staging

```bash
cd /c/Project/portfolio-staging/035
cp --parents src/lib/room/RoomWorld.ts src/lib/room/RoomPage.svelte /c/Project/portfolio/
cd /c/Project/portfolio
n=0; while read h p; do n=$((n+1)); [ "$(git hash-object --no-filters "$p")" = "$h" ] || echo "BEZA $p"; done < /c/Project/portfolio-staging/035/MANIFEST.txt; echo "SALINAN $n fail"
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

Tukar baris 035 dalam `plans/README.md` daripada `TODO` kepada `DONE` DAHULU. Kemudian:

```bash
grep "| 035" plans/README.md
git add src/lib/room/RoomWorld.ts src/lib/room/RoomPage.svelte plans/README.md plans/035-telefon-padat-ringan.md
while read h p; do [ "$(git ls-files -s -- "$p" | cut -d' ' -f2)" = "$h" ] || echo "INDEKS BEZA $p"; done < /c/Project/portfolio-staging/035/MANIFEST.txt; echo INDEKS-SELESAI
git diff --cached --stat | tail -1
git commit -m "fix(bilik): kawalan telefon lebih padat dan bilik lebih ringan"
git status --short
```
→ baris 035 berakhir `DONE |`; tiada `INDEKS BEZA`; `INDEKS-SELESAI`; `4 files changed`; selepas commit `git status --short` hanya (mungkin) `?? dev.log`. JANGAN push. BERHENTI dan lapor. Jangan cadangkan pelan seterusnya yang tidak wujud dalam `plans/`.

## Kriteria siap

- [ ] 2 fail sepadan dengan manifes (salinan dan indeks)
- [ ] `check` 0 ralat 0 amaran; `npm test` fail 0; build `✔ done`
- [ ] `ROOM OK` (atau dicatat untuk perancang)
- [ ] Pada `main`; baris 035 = `DONE` dalam commit; satu commit; tiada push

## Syarat STOP

- Pelan 034 belum di-commit, atau semakan drift tidak sepadan.
- Baris `BEZA` atau `INDEKS BEZA` selepas satu cubaan menyalin semula.
- `check`, `npm test` atau build gagal. Jangan ubah fail lain untuk meluluskan ujian.

## Nota susulan (bukan untuk pelan ini)

- Jika telefon masih berat selepas ini, punca seterusnya ialah bilangan lampu (10, tiga dengan bayang) dan pas pemprosesan (bloom, vignette). Ukuran pada telefon sebenar (model telefon, fps) diperlukan sebelum memotong lagi.
