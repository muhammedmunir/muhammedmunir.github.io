# Plan 033: CPU binaan sendiri, pusingan lebih luas di telefon, bayang telefon berkala

> **Arahan pelaksana**: Laksanakan TERUS dalam sesi utama, tanpa subagent atau worktree. Ikut langkah mengikut turutan. Salin arahan TEPAT seperti dalam blok kod. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor. Pelan ini tidak memerlukan sebarang keputusan reka bentuk: fail sudah siap di folder staging. Alat yang wujud: Bash, Read, Edit, Write, Glob, Grep. Tiada alat bernama Todo, Run atau Orchestrator. Jangan tandakan `DONE` atau commit sebelum SEMUA ujian (termasuk smoke 390 px) selesai.
>
> **Prasyarat**: Pelan 032 mesti sudah di-commit (`perf(bilik): mod telefon ringan dan seret untuk melihat sekeliling dalam paparan`).
>
> **Semakan drift (jalankan dahulu, dalam Git Bash)**:
> ```bash
> cd /c/Project/portfolio
> git log -1 --format=%s
> git rev-parse HEAD:src/lib/room/RoomWorld.ts HEAD:src/lib/room/RoomPage.svelte HEAD:static/room/sketchfab/pc.glb
> git status --short
> ls /c/Project/portfolio-staging/033/MANIFEST.txt
> ```
> → subjek `perf(bilik): mod telefon ringan dan seret untuk melihat sekeliling dalam paparan`; hash berturut-turut `ff1b48b9ba0bf93f5cd38bac2dbb12eef4e87e87`, `5c7b2586ff467fe870aa1cf27772a726695427e4`, `6fa870fa18143d89129fa6a3cdfa04b185977ff5`; `git status --short` hanya `?? plans/033-cpu-sendiri-telefon.md`, ` M plans/README.md` dan (jika masih ada) `?? dev.log`; fail manifes wujud. Jika berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: S (salin + padam + ujian) · **Risiko**: LOW-MED (RoomWorld +58/−15; satu model 3D dibuang)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-23 dalam salinan terasing (`main` @ Pelan 032): `check` 857 FILES 0 ERRORS 0 WARNINGS, `npm test` pass 50 fail 0, build `✔ done` (tiada `pc.glb` dalam build), smoke `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`, audit papan kekunci tanpa ralat, lawatan penuh semua paparan siang/malam 1440 px dan 390 px tanpa ralat. Emulasi telefon 362×865: seret kiri sampai ke tayangan, seret kanan sampai ke rak server; bayang dikemas kini berkala; nisbah piksel 1.5.
- **Keputusan pemilik** (2026-11-23): ganti CPU dengan menara binaan sendiri (bukan buang).

## Kenapa

Laporan pemilik (pelayar, mod telefon 362 px):

1. **Tidak boleh seret ke kanan untuk melihat rak server.** Gambaran keseluruhan dihadkan ±0.3–0.5 rad; skrin tegak hanya menunjukkan bahagian tengah bilik.
2. **CPU nampak buruk.** Model Sketchfab "Office PC" hampir hitam sepenuhnya; walaupun dengan LED (Pelan 031) ia kekal kotak gelap tanpa butiran.
3. **Grafik telefon "makin teruk" dan tidak lancar.** Pengawal prestasi Pelan 032 menurunkan resolusi telefon terus ke 1.0 (kabur pada skrin 3×) dan mematikan bloom. Kos sebenar yang tinggal: peta bayang lampu titik (kubus, 6 laluan render) dikemas kini setiap bingkai.
4. Pada 362 px, logo `munir.` bertindih dengan pautan "Resume".

## Perubahan

| Fail | Perubahan |
|------|-----------|
| `src/lib/room/RoomWorld.ts` | Menara PC binaan sendiri (`buildTower`): badan aluminium gelap bucu bulat, kaki, kaca berasap di sisi kanan dengan ruang dalam bercahaya hangat, papan induk, GPU dengan jalur cahaya, penyejuk CPU, dua kipas hadapan berbilah dengan cincin cahaya, jalur LED dan butang kuasa di hadapan. Tidak boleh diklik (hiasan). Model `pc.glb` tidak lagi dimuat (−672 KB). Gambaran keseluruhan pada skrin tegak: pusingan diluaskan (kiri ke tayangan, kanan ke rak server); skrin mendatar tidak berubah. Peranti sentuh: peta bayang dikemas kini setiap 10 bingkai (~6 kali sesaat), bukan setiap bingkai. Pengawal prestasi telefon: resolusi minimum 1.25 (bukan 1.0). |
| `src/lib/room/RoomPage.svelte` | Kredit "Office PC" dibuang (model tidak lagi digunakan). ≤380 px: logo 21 px, jarak pautan header lebih rapat. |
| `static/room/sketchfab/pc.glb` (dipadam) | Model lama, tidak lagi dirujuk. |

## Skop

**Disalin daripada `C:\Project\portfolio-staging\033\` (2 fail)**: lihat `MANIFEST.txt`.
**Dipadam**: `static/room/sketchfab/pc.glb`.
**Disunting**: `plans/README.md` (status 033).
**Luar skop**: model 3D lain, `/cv`. Jangan ubah fail lain.

## Aliran kerja git

- Kekal pada `main`. JANGAN cipta cawangan. Satu commit: `feat(bilik): CPU binaan sendiri, pusingan lebih luas dan bayang berkala di telefon`
- Stage eksplisit (Langkah 4). Jangan `git add -A` / `git add .`. Jangan push.
- **Tukar baris 033 dalam `plans/README.md` kepada `DONE` SEBELUM `git add`, dan hanya selepas Langkah 3 lulus.**

## Langkah

### Langkah 1: Salin fail daripada staging dan padam model lama

```bash
cd /c/Project/portfolio-staging/033
cp --parents src/lib/room/RoomWorld.ts src/lib/room/RoomPage.svelte /c/Project/portfolio/
cd /c/Project/portfolio
git rm -q static/room/sketchfab/pc.glb
n=0; while read h p; do n=$((n+1)); [ "$(git hash-object --no-filters "$p")" = "$h" ] || echo "BEZA $p"; done < /c/Project/portfolio-staging/033/MANIFEST.txt; echo "SALINAN $n fail"
test ! -e static/room/sketchfab/pc.glb && echo LAMA-DIPADAM
```
**Verify** → tiada baris `BEZA`, `SALINAN 2 fail`, `LAMA-DIPADAM`. (Jika `git rm` disekat oleh auto mode, minta kebenaran pemilik; pemilik sudah bersetuju model ini diganti.)

### Langkah 2: Ujian penuh

```bash
npm run check 2>&1 | tail -1
npm test 2>&1 | grep -E "(pass|fail) [0-9]+"
npm run build 2>&1 | tail -1
test ! -e build/room/sketchfab/pc.glb && echo BUILD-BERSIH
```
→ `0 ERRORS 0 WARNINGS`; `pass 50`, `fail 0`; `✔ done`; `BUILD-BERSIH`.

### Langkah 3: Ujian asap pelayar (localhost sahaja)

Jika pelayan dev masih berjalan pada port 5173, gunakannya. Jika tidak, mulakan `npm run dev -- --port 5173` di latar belakang dan tunggu `http://localhost:5173/` memberi 200. Kemudian (had masa sekurang-kurangnya 600 s; tunggu sehingga selesai):

```bash
ROOM_URL=http://localhost:5173/ node scripts/room-smoke.mjs
```
→ `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`. Jika gagal kerana tamat masa, ulang sekali. Jika masih gagal, catat dan teruskan; perancang akan menjalankannya.

### Langkah 4: Status, stage, sahkan indeks, commit

Tukar baris 033 dalam `plans/README.md` daripada `TODO` kepada `DONE` DAHULU. Kemudian:

```bash
grep "| 033" plans/README.md
git add src/lib/room/RoomWorld.ts src/lib/room/RoomPage.svelte plans/README.md plans/033-cpu-sendiri-telefon.md
while read h p; do [ "$(git ls-files -s -- "$p" | cut -d' ' -f2)" = "$h" ] || echo "INDEKS BEZA $p"; done < /c/Project/portfolio-staging/033/MANIFEST.txt; echo INDEKS-SELESAI
git diff --cached --name-status | grep "^D"
git diff --cached --stat | tail -1
git commit -m "feat(bilik): CPU binaan sendiri, pusingan lebih luas dan bayang berkala di telefon"
git status --short
```
→ baris 033 berakhir `DONE |`; tiada `INDEKS BEZA`; `INDEKS-SELESAI`; satu baris `D` (`static/room/sketchfab/pc.glb`); `5 files changed`; selepas commit `git status --short` hanya (mungkin) `?? dev.log`. JANGAN push. BERHENTI dan lapor. Jangan cadangkan pelan seterusnya yang tidak wujud dalam `plans/`.

## Kriteria siap

- [ ] 2 fail sepadan dengan manifes (salinan dan indeks); `pc.glb` dipadam
- [ ] `check` 0 ralat 0 amaran; `npm test` fail 0; build `✔ done`; `BUILD-BERSIH`
- [ ] `ROOM OK` (atau dicatat untuk perancang)
- [ ] Pada `main`; baris 033 = `DONE` dalam commit; satu commit; tiada push

## Syarat STOP

- Pelan 032 belum di-commit, atau semakan drift tidak sepadan.
- Baris `BEZA` atau `INDEKS BEZA` selepas satu cubaan menyalin semula.
- `check`, `npm test` atau build gagal. Jangan ubah fail lain untuk meluluskan ujian.

## Nota susulan (bukan untuk pelan ini)

- Prestasi pada telefon sebenar perlu disahkan oleh pemilik selepas push. Mod telefon dalam DevTools pelayar desktop tidak mewakili GPU telefon.
