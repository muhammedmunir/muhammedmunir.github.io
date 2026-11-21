# Plan 018: Bilik kerja 3D sebagai halaman utama

> **Arahan pelaksana**: Laksanakan TERUS dalam sesi utama, tanpa subagent atau worktree. Ikut langkah mengikut turutan. Salin arahan dan teks TEPAT seperti dalam blok kod. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor.
>
> **Semakan drift (jalankan dahulu, dalam Git Bash)**:
> ```bash
> cd /c/Project/portfolio
> git rev-parse HEAD HEAD:src/routes/+page.svelte
> git status --short
> test ! -e .gitattributes && test ! -e src/lib/room && test ! -e static/room && echo TIADA-KONFLIK
> ls /c/Project/portfolio-staging/018/MANIFEST.txt
> ```
> → `41302d8f7cb1c2a30856bb341f047bba61edf837`, `67f85bc814f10eced6eee266ca54f41c059f8c97`; `git status --short` hanya `?? plans/018-bilik-kerja-3d-halaman-utama.md` dan ` M plans/README.md` (ditulis oleh perancang); `TIADA-KONFLIK`; fail manifes wujud. Jika mana-mana berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: S (salin + 2 suntingan) · **Risiko**: MEDIUM (halaman utama bertukar sepenuhnya; `/cv` tidak disentuh)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-21 dalam salinan terasing baharu daripada `main` (`41302d8`) dengan langkah yang sama seperti di bawah: `check` 856 FILES 0 ERRORS 0 WARNINGS, `npm test` pass 50 fail 0, build exit 0 (`build/room` 2.4 MB), `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`. Langkah git (salin, manifes, `.gitattributes`, indeks, commit) dilatih dalam klon tempatan dengan `core.autocrlf=true`: 70/70 sepadan, `git status` kosong selepas commit. Reka bentuk bilik diluluskan pemilik secara berperingkat (kemahiran, rak, projektor, papan neon, monitor kod, pembetulan telefon).

## Kenapa

Pemilik mahu halaman utama menjadi bilik kerja 3D yang realistik dan mencerminkan diri mereka, dengan setiap objek mempunyai satu fungsi; butiran penuh kekal di `/cv` ("page resume dah okay").

| Objek | Fungsi |
|-------|--------|
| Monitor kiri | Pelancar projek; projek ditayangkan ke skrin projektor |
| Monitor kanan | "Tentang saya": profil ditaip sebagai kod; butang Butiran |
| Rak server | Kemahiran: logo teknologi muncul mengikut kategori |
| Pas ID pada rel | Perjalanan kerja: pas berpusing menunjukkan jawatan |
| Buku dalam rak | Pendidikan (merah) dan sijil (biru: rangkaian, hijau: data) |
| Telefon atas meja | Hubungi |
| Papan neon "munir." | Identiti (hiasan) |

Aset: Poly Haven (CC0) dan Simple Icons (CC0), sudah dimampatkan daripada 19 MB ke 2.4 MB (meshopt, tekstur data 512 px, HDRI 512×256).

## Skop

**Dalam skop (baharu, disalin daripada `C:\Project\portfolio-staging\018\`)**: `.gitattributes`, `src/lib/room/RoomWorld.ts`, `src/lib/room/RoomPage.svelte`, `src/lib/room/ObjectPanel.svelte`, `scripts/room-smoke.mjs`, `static/room/**` (65 fail).
**Dalam skop (disunting)**: `src/routes/+page.svelte`, `plans/README.md` (status 018).
**Luar skop**: `/cv`, `src/lib/workbench/**` (Workbench lama kekal tetapi tidak lagi dipaparkan), `vite.config.ts`, CI, `scripts/workbench-smoke.mjs`, `scripts/home-visual.mjs`, `scripts/workbench-orbit-a11y.mjs`. Jangan ubah fail lain.

**Kenapa `.gitattributes`**: `brown_photostudio_02_512.hdr` tiada bait NUL, jadi Git menyangkanya fail teks; dengan `core.autocrlf=true` fail itu boleh dirosakkan semasa commit atau checkout. `.gitattributes` menandakan `*.hdr` dan `*.bin` sebagai binari. Ia MESTI disalin sebelum `git add`.

## Aliran kerja git

- Kekal pada `main`. JANGAN cipta cawangan. Satu commit: `feat(utama): bilik kerja 3D sebagai halaman utama`
- Stage eksplisit (Langkah 6). Jangan `git add -A` / `git add .`. Jangan push.

## Langkah

### Langkah 1: Salin fail baharu daripada folder staging

```bash
cd /c/Project/portfolio-staging/018
cp -r --parents .gitattributes src/lib/room scripts/room-smoke.mjs static/room /c/Project/portfolio/
```

**Verify** (setiap fail mesti sama bait demi bait dengan manifes):

```bash
cd /c/Project/portfolio
n=0; while read h p; do n=$((n+1)); [ "$(git hash-object --no-filters "$p")" = "$h" ] || echo "BEZA $p"; done < /c/Project/portfolio-staging/018/MANIFEST.txt; echo "SALINAN $n fail"
git check-attr text -- static/room/brown_photostudio_02/brown_photostudio_02_512.hdr
```
→ tiada baris `BEZA`, `SALINAN 70 fail`, dan `...hdr: text: unset`.

### Langkah 2: Halaman utama memaparkan bilik

Fail: `src/routes/+page.svelte`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
  import Workbench from '$lib/workbench/Workbench.svelte';
````

dengan:

````
  import RoomPage from '$lib/room/RoomPage.svelte';
````

### Langkah 3: Komponen yang dipaparkan

Fail: `src/routes/+page.svelte`. Guna alat **Edit**. Gantikan teks ini (tepat, muncul sekali):

````
<Workbench />
````

dengan:

````
<RoomPage />
````

**Verify**: `git diff --stat -- src/routes/+page.svelte` → `1 file changed, 2 insertions(+), 2 deletions(-)`.

### Langkah 4: Ujian penuh

```bash
npm run check 2>&1 | tail -1
npm test 2>&1 | grep -E "(pass|fail) [0-9]+"
npm run build 2>&1 | tail -2; du -sh build/room
```
→ `0 ERRORS 0 WARNINGS`; `pass 50`, `fail 0`; `✔ done`; `build/room` kira-kira `2.4M`.

### Langkah 5: Ujian asap pelayar (localhost sahaja)

Mulakan pelayan dev di latar belakang pada port 5173, tunggu sehingga `http://localhost:5173/` memberi 200, kemudian:

```bash
ROOM_URL=http://localhost:5173/ node scripts/room-smoke.mjs
```
→ `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`. Hentikan pelayan dev selepas itu.

Skrip ini menolak URL selain `localhost`/`127.0.0.1` sebelum melancarkan pelayar (WebGL perisian swiftshader). Jika mod auto menyekat pelancaran pelayar, JANGAN cari jalan pintas: catat "Langkah 5 disekat", teruskan ke Langkah 6, dan perancang akan menjalankannya.

### Langkah 6: Stage dan sahkan indeks

Tukar baris 018 dalam `plans/README.md` daripada `TODO` kepada `DONE` (atau `DONE (Langkah 5 oleh perancang)` jika Langkah 5 disekat). Kemudian:

```bash
git add .gitattributes src/lib/room scripts/room-smoke.mjs static/room src/routes/+page.svelte plans/README.md plans/018-bilik-kerja-3d-halaman-utama.md
while read h p; do [ "$(git ls-files -s -- "$p" | cut -d' ' -f2)" = "$h" ] || echo "INDEKS BEZA $p"; done < /c/Project/portfolio-staging/018/MANIFEST.txt; echo INDEKS-SELESAI
git status --short | grep -v '^A ' ; git status --short | grep -c '^A '
```
→ tiada `INDEKS BEZA` (bukti tiada penukaran hujung baris), `INDEKS-SELESAI`; baris bukan-`A` hanya `M  plans/README.md` dan `M  src/routes/+page.svelte`; kiraan `A` = `71` (70 fail manifes + fail pelan ini).

### Langkah 7: Commit

```bash
git commit -m "feat(utama): bilik kerja 3D sebagai halaman utama"
git branch --show-current
git status --short
```
→ `main`; `git status --short` kosong. JANGAN push. BERHENTI dan lapor.

## Kriteria siap

- [ ] 70 fail sepadan dengan manifes (salinan dan indeks); `.hdr` bertanda binari
- [ ] `check` 0 ralat 0 amaran; `npm test` fail 0; build exit 0
- [ ] `ROOM OK` (atau dicatat sebagai disekat untuk perancang)
- [ ] Pada `main`; baris 018 = `DONE`; satu commit; tiada push

## Syarat STOP

- Semakan drift tidak sepadan, atau teks lama Langkah 2/3 tidak ditemui tepat sekali.
- Mana-mana baris `BEZA` atau `INDEKS BEZA` selepas satu cubaan menyalin semula.
- `check`, `npm test` atau build gagal. Jangan ubah fail lain untuk meluluskan ujian.

## Nota susulan (bukan untuk pelan ini)

- Pelan 019 (cadangan): buang Workbench lama (`src/lib/workbench/Workbench*.svelte`, `WorkbenchWorld.ts` dan ujian/skrip yang menyasarkannya) selepas pemilik mengesahkan bilik dalam produksi. Komponen yang masih digunakan bilik: `ContactModal.svelte`, `project-media.ts`, `system-state.mjs`.
- Logo rasmi syarikat (TNB, YHCM, Nova Bitara, UTM) pada pas ID dan buku: menunggu fail daripada pemilik.
- Kod profil pada monitor kanan kecil di telefon; butang Butiran memaparkan teks penuh.
