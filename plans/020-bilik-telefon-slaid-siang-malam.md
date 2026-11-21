# Plan 020: Bilik 3D: telefon diangkat, slaid butiran projek, siang/malam dan animasi buku

> **Arahan pelaksana**: Laksanakan TERUS dalam sesi utama, tanpa subagent atau worktree. Ikut langkah mengikut turutan. Salin arahan TEPAT seperti dalam blok kod. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor. Pelan ini tidak memerlukan sebarang keputusan reka bentuk: semua fail sudah siap di folder staging.
>
> **Semakan drift (jalankan dahulu, dalam Git Bash)**:
> ```bash
> cd /c/Project/portfolio
> git rev-parse HEAD
> for f in src/lib/room/RoomWorld.ts src/lib/room/RoomPage.svelte scripts/room-smoke.mjs; do echo "$(git rev-parse HEAD:$f) $f"; done
> git status --short
> ls /c/Project/portfolio-staging/020/MANIFEST.txt
> ```
> → HEAD `241f7108ca32156a1937424467c63af39b08f1b7`; hash fail mengikut turutan: `5ec2b692…`, `4e65bb3b…`, `660519dc…`; `git status --short` hanya `?? plans/020-bilik-telefon-slaid-siang-malam.md`, ` M plans/README.md` dan (jika masih ada) `?? dev.log`; fail manifes wujud. Jika berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: S (salin + ujian) · **Risiko**: MEDIUM (enjin 3D halaman utama; `/cv` tidak disentuh)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-21 dalam salinan terasing daripada `main` (`241f710`): `check` 858 FILES 0 ERRORS 0 WARNINGS, `npm test` pass 50 fail 0, build `✔ done`, `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`, tangkapan skrin desktop dan 390 px disemak (siang, malam, slaid, telefon, buku), tiada ralat konsol.

## Kenapa (maklum balas pemilik selepas Pelan 019 di produksi)

| Aduan | Pembetulan |
|-------|------------|
| Animasi buku pelik bila diletak semula | Buku pembaca kini bermula dan berakhir pada pose yang SAMA dengan buku rak (tulang menghadap pelawat, saiz dan warna sama). Laluan: tarik keluar → terbang sambil berpusing → buka. Tutup ialah laluan yang sama secara terbalik, jadi buku masuk semula ke slotnya tanpa "lompat". Klik buku lain semasa satu terbuka: buku pertama ditutup dan diletak dahulu, kemudian buku baharu dibuka. |
| Tekan telefon terus keluar dialog | Telefon diangkat dari meja, berdiri menghadap kamera dan skrinnya memaparkan kad kenalan (nama, status, WhatsApp, e-mel, lokasi). Kad tindakan HTML di sebelah: WhatsApp, Telefon, E-mel, LinkedIn, GitHub, Resume (PDF). Dialog penuh masih ada melalui "Semua pilihan hubungan". Butang header "Hubungi" membawa ke paparan telefon ini. |
| Tekan skrin projektor keluar panel butiran | Klik tayangan menukar slaid: 1 tajuk, 2 peranan, 3 seni bina data, 4 keselamatan & akses, 5 teknologi (dengan nota kajian kes / laman sebenar jika ada). Butang ‹ › dan kiraan "2 / 5" dalam bar atas; anak panah papan kekunci juga berfungsi. Panel penuh kekal di bawah "Butiran". |
| Siang dan malam | Tingkap sebenar di dinding belakang (dinding berlubang, bingkai aluminium, pemandangan bandar). Siang: matahari masuk melalui tingkap dengan bayang, langit cerah. Malam: lampu hangat, bandar bercahaya, bintang. Ikut jam pelawat secara automatik; tukar melalui butang matahari/bulan di header atau klik tingkap. |

## Skop

**Disalin daripada `C:\Project\portfolio-staging\020\` (3 fail)**: `src/lib/room/RoomWorld.ts`, `src/lib/room/RoomPage.svelte`, `scripts/room-smoke.mjs` (ujian asap kini menguji slaid, siang/malam dan aliran telefon).
**Disunting**: `plans/README.md` (status 020).
**Luar skop**: `/cv`, `ObjectPanel.svelte`, `ContactModal.svelte`, Workbench lama, `static/**`, CI. Jangan ubah fail lain.

## Aliran kerja git

- Kekal pada `main`. JANGAN cipta cawangan. Satu commit: `feat(bilik): telefon diangkat, slaid butiran projek, siang/malam dan animasi buku`
- Stage eksplisit (Langkah 4). Jangan `git add -A` / `git add .`. Jangan push.

## Langkah

### Langkah 1: Salin fail daripada staging

```bash
cd /c/Project/portfolio-staging/020
cp --parents src/lib/room/RoomWorld.ts src/lib/room/RoomPage.svelte scripts/room-smoke.mjs /c/Project/portfolio/
cd /c/Project/portfolio
n=0; while read h p; do n=$((n+1)); [ "$(git hash-object --no-filters "$p")" = "$h" ] || echo "BEZA $p"; done < /c/Project/portfolio-staging/020/MANIFEST.txt; echo "SALINAN $n fail"
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

Jika pelayan dev masih berjalan pada port 5173, gunakannya (Vite memuat semula sendiri). Jika tidak, mulakan `npm run dev -- --port 5173` di latar belakang dan tunggu `http://localhost:5173/` memberi 200. Kemudian:

```bash
ROOM_URL=http://localhost:5173/ node scripts/room-smoke.mjs
```
→ `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`. Jika mod auto menyekat pelayar, catat "Langkah 3 disekat" dan teruskan; perancang akan menjalankannya.

### Langkah 4: Stage, sahkan indeks, commit

Tukar baris 020 dalam `plans/README.md` daripada `TODO` kepada `DONE`. Kemudian:

```bash
git add src/lib/room/RoomWorld.ts src/lib/room/RoomPage.svelte scripts/room-smoke.mjs plans/README.md plans/020-bilik-telefon-slaid-siang-malam.md
while read h p; do [ "$(git ls-files -s -- "$p" | cut -d' ' -f2)" = "$h" ] || echo "INDEKS BEZA $p"; done < /c/Project/portfolio-staging/020/MANIFEST.txt; echo INDEKS-SELESAI
git diff --cached --stat | tail -1
git commit -m "feat(bilik): telefon diangkat, slaid butiran projek, siang/malam dan animasi buku"
git status --short
```
→ tiada `INDEKS BEZA`; `INDEKS-SELESAI`; `5 files changed`; selepas commit `git status --short` hanya (mungkin) `?? dev.log`. JANGAN push. BERHENTI dan lapor.

## Kriteria siap

- [ ] 3 fail sepadan dengan manifes (salinan dan indeks)
- [ ] `check` 0 ralat 0 amaran; `npm test` fail 0; build `✔ done`
- [ ] `ROOM OK` (atau dicatat disekat untuk perancang)
- [ ] Pada `main`; baris 020 = `DONE`; satu commit; tiada push

## Syarat STOP

- Semakan drift tidak sepadan.
- Baris `BEZA` atau `INDEKS BEZA` selepas satu cubaan menyalin semula.
- `check`, `npm test` atau build gagal. Jangan ubah fail lain untuk meluluskan ujian.

## Nota susulan (bukan untuk pelan ini)

- Model Sketchfab CC-BY (kerusi, monitor, papan kekunci + tetikus, rak server): menunggu pemilik memuat turun ke `C:\Project\portfolio-assets\sketchfab\`. Pelan berasingan selepas itu, termasuk kredit pembuat.
- Logo IWA001 / Infinity World: perlukan fail logo resolusi tinggi daripada pemilik.
