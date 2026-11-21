# Plan 021: Bilik 3D: siang tanpa silau, butang dalam skrin telefon, tingkap di sebelah rak

> **Arahan pelaksana**: Laksanakan TERUS dalam sesi utama, tanpa subagent atau worktree. Ikut langkah mengikut turutan. Salin arahan TEPAT seperti dalam blok kod. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor. Pelan ini tidak memerlukan sebarang keputusan reka bentuk: semua fail sudah siap di folder staging.
>
> **Semakan drift (jalankan dahulu, dalam Git Bash)**:
> ```bash
> cd /c/Project/portfolio
> git rev-parse HEAD
> for f in src/lib/room/RoomWorld.ts src/lib/room/RoomPage.svelte scripts/room-smoke.mjs; do echo "$(git rev-parse HEAD:$f) $f"; done
> git status --short
> ls /c/Project/portfolio-staging/021/MANIFEST.txt
> ```
> → HEAD `dc13aadb0e59a199746b90054bdf6310b460ab9a`; hash fail mengikut turutan: `8669aafd…`, `fef5ec23…`, `3e942802…`; `git status --short` hanya `?? plans/021-bilik-siang-telefon-tingkap.md`, ` M plans/README.md` dan (jika masih ada) `?? dev.log`; fail manifes wujud. Jika berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: S (salin + ujian) · **Risiko**: MEDIUM (enjin 3D halaman utama; `/cv` tidak disentuh)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-21 dalam salinan terasing daripada `main` (`dc13aad`): `check` 858 FILES 0 ERRORS 0 WARNINGS, `npm test` pass 50 fail 0, build `✔ done`, `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`. Tangkapan skrin SEMUA paparan (keseluruhan, komputer, profil, kemahiran, kerja, buku, tayangan, telefon) dalam mod malam DAN siang pada 1920 px, serta kemahiran/buku/telefon pada 390 px; klik sebenar pada butang WhatsApp di skrin telefon membuka WhatsApp (1920 px dan 390 px); tiada ralat konsol.

## Kenapa (maklum balas pemilik selepas Pelan 020 di produksi)

| Aduan | Pembetulan |
|-------|------------|
| Siang: lampu tidak ditutup, terlalu silau, buku bercahaya | Pada siang, lampu siling, lampu monitor dan sinaran dinding dipadam (termasuk cahaya glob dan jalur lampu). Cahaya datang dari matahari melalui tingkap dan langit. Pendedahan, kekuatan bloom dan cahaya persekitaran dikurangkan supaya halaman buku dan skrin boleh dibaca. |
| Paparan kemahiran berubah (tingkap di belakang ikon) | Tingkap dipindahkan ke sebelah kanan rak server, di atas pokok. Kamera kemahiran kini menghadap rak secara lurus, jadi latar ikon ialah rak dan dinding. Pemandangan luar dikecilkan supaya hanya kelihatan melalui tingkap (sebelum ini terkeluar melepasi hujung dinding). |
| Telefon: kenapa ada teks 2D di sebelah | Butang WhatsApp, Telefon, E-mel, LinkedIn, GitHub dan Resume (PDF) kini dilukis DALAM skrin telefon 3D dan boleh diklik/diketik terus (berhover, dengan tooltip). Telefon diangkat ke tengah pandangan dan cukup besar untuk diketik. Kad 2D dibuang daripada paparan; pautan yang sama kekal untuk papan kekunci dan pembaca skrin, dan hanya muncul bila difokus dengan Tab. Semasa memegang telefon, objek lain di belakang tidak boleh dipilih secara tidak sengaja. |

## Skop

**Disalin daripada `C:\Project\portfolio-staging\021\` (3 fail)**: `src/lib/room/RoomWorld.ts`, `src/lib/room/RoomPage.svelte`, `scripts/room-smoke.mjs` (ujian asap kini menyemak paparan telefon dan pautan papan kekunci).
**Disunting**: `plans/README.md` (status 021).
**Luar skop**: `/cv`, `ObjectPanel.svelte`, `ContactModal.svelte`, Workbench lama, `static/**`, CI. Jangan ubah fail lain.

## Aliran kerja git

- Kekal pada `main`. JANGAN cipta cawangan. Satu commit: `fix(bilik): siang tanpa silau, butang dalam skrin telefon, tingkap di sebelah rak`
- Stage eksplisit (Langkah 4). Jangan `git add -A` / `git add .`. Jangan push.
- **Tukar baris 021 dalam `plans/README.md` kepada `DONE` SEBELUM `git add`** (Pelan 020 terlupa langkah ini dan memerlukan commit tambahan).

## Langkah

### Langkah 1: Salin fail daripada staging

```bash
cd /c/Project/portfolio-staging/021
cp --parents src/lib/room/RoomWorld.ts src/lib/room/RoomPage.svelte scripts/room-smoke.mjs /c/Project/portfolio/
cd /c/Project/portfolio
n=0; while read h p; do n=$((n+1)); [ "$(git hash-object --no-filters "$p")" = "$h" ] || echo "BEZA $p"; done < /c/Project/portfolio-staging/021/MANIFEST.txt; echo "SALINAN $n fail"
```
**Verify** → tiada baris `BEZA`, `SALINAN 3 fail`.

### Langkah 2: Ujian penuh

```bash
npm run check 2>&1 | tail -1
npm test 2>&1 | grep -E "(pass|fail) [0-9]+"
npm run build 2>&1 | tail -1
```
→ `0 ERRORS 0 WARNINGS`; `pass 50`, `fail 0`; `✔ done`.

### Langkah 3: Ujian asap pelayar (localhost sahaja)

Jika pelayan dev masih berjalan pada port 5173, gunakannya. Jika tidak, mulakan `npm run dev -- --port 5173` di latar belakang dan tunggu `http://localhost:5173/` memberi 200. Kemudian (ujian ini mengambil masa sehingga ~8 minit; beri had masa sekurang-kurangnya 600 s):

```bash
ROOM_URL=http://localhost:5173/ node scripts/room-smoke.mjs
```
→ `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`. Jika tamat masa atau disekat, catat dan teruskan; perancang akan menjalankannya.

### Langkah 4: Status, stage, sahkan indeks, commit

Tukar baris 021 dalam `plans/README.md` daripada `TODO` kepada `DONE` DAHULU. Kemudian:

```bash
grep "| 021" plans/README.md
git add src/lib/room/RoomWorld.ts src/lib/room/RoomPage.svelte scripts/room-smoke.mjs plans/README.md plans/021-bilik-siang-telefon-tingkap.md
while read h p; do [ "$(git ls-files -s -- "$p" | cut -d' ' -f2)" = "$h" ] || echo "INDEKS BEZA $p"; done < /c/Project/portfolio-staging/021/MANIFEST.txt; echo INDEKS-SELESAI
git diff --cached --stat | tail -1
git commit -m "fix(bilik): siang tanpa silau, butang dalam skrin telefon, tingkap di sebelah rak"
git status --short
```
→ baris 021 berakhir `DONE |`; tiada `INDEKS BEZA`; `INDEKS-SELESAI`; `5 files changed`; selepas commit `git status --short` hanya (mungkin) `?? dev.log` dan TIADA ` M plans/README.md`. JANGAN push. BERHENTI dan lapor.

## Kriteria siap

- [ ] 3 fail sepadan dengan manifes (salinan dan indeks)
- [ ] `check` 0 ralat 0 amaran; `npm test` fail 0; build `✔ done`
- [ ] `ROOM OK` (atau dicatat untuk perancang)
- [ ] Pada `main`; baris 021 = `DONE` dalam commit; satu commit; tiada push

## Syarat STOP

- Semakan drift tidak sepadan.
- Baris `BEZA` atau `INDEKS BEZA` selepas satu cubaan menyalin semula.
- `check`, `npm test` atau build gagal. Jangan ubah fail lain untuk meluluskan ujian.

## Nota susulan (bukan untuk pelan ini)

- Model Sketchfab CC-BY (kerusi, monitor, papan kekunci + tetikus, rak server): menunggu pemilik memuat turun ke `C:\Project\portfolio-assets\sketchfab\`.
- Logo IWA001 / Infinity World: perlukan fail logo resolusi tinggi daripada pemilik.
