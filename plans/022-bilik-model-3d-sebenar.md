# Plan 022: Bilik 3D: model sebenar (kerusi, monitor, papan kekunci, rak server, PC, projektor, buku) dengan kredit

> **Arahan pelaksana**: Laksanakan TERUS dalam sesi utama, tanpa subagent atau worktree. Ikut langkah mengikut turutan. Salin arahan TEPAT seperti dalam blok kod. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor. Pelan ini tidak memerlukan sebarang keputusan reka bentuk: semua fail sudah siap di folder staging.
>
> **Prasyarat**: Pelan 021 mesti sudah di-commit (`fix(bilik): siang tanpa silau, butang dalam skrin telefon, tingkap di sebelah rak`). Jika belum, laksanakan Pelan 021 dahulu dalam sesi berasingan.
>
> **Semakan drift (jalankan dahulu, dalam Git Bash)**:
> ```bash
> cd /c/Project/portfolio
> git log -1 --format=%s
> for f in src/lib/room/RoomWorld.ts src/lib/room/RoomPage.svelte scripts/room-smoke.mjs .gitattributes; do echo "$(git rev-parse HEAD:$f) $f"; done
> git status --short
> test ! -e static/room/sketchfab && echo TIADA-KONFLIK
> ls /c/Project/portfolio-staging/022/MANIFEST.txt
> ```
> → subjek `fix(bilik): siang tanpa silau, butang dalam skrin telefon, tingkap di sebelah rak`; hash mengikut turutan: `2b0a8bba…`, `57f6c786…`, `2a375a5a…`, `079f633f…`; `git status --short` hanya `?? plans/022-bilik-model-3d-sebenar.md`, ` M plans/README.md` dan (jika masih ada) `?? dev.log`; `TIADA-KONFLIK`; fail manifes wujud. Jika berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: S (salin + ujian) · **Risiko**: MEDIUM (aset 3D baharu ~4.1 MB pada halaman utama; `/cv` tidak disentuh)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-22 dalam salinan terasing (`main` + Pelan 021): `check` 858 FILES 0 ERRORS 0 WARNINGS, `npm test` pass 50 fail 0, build `✔ done`, `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`. Tangkapan skrin keseluruhan, komputer, kemahiran, buku, tayangan dan telefon dalam mod malam dan siang (1920 px), serta keseluruhan/kemahiran/telefon (390 px), dan gambar dekat projektor, rak buku dan meja; klik sebenar pada butang WhatsApp di skrin telefon membuka WhatsApp (1920 px dan 390 px); tiada ralat konsol.

## Kenapa (permintaan pemilik)

Pemilik meminta objek bilik menjadi realistik menggunakan model Sketchfab percuma ("jangan yang berbayar, buat yang terbaik"), termasuk rak buku dan objek lain. Pemilik log masuk ke Sketchfab; perancang memuat turun model percuma berlesen CC BY sahaja.

| Objek | Sebelum | Sekarang (sumber, lesen) |
|-------|---------|--------------------------|
| Kerusi | Kotak dan silinder | High-Poly PBR Office Chair, kilicarslan (CC BY 4.0) |
| Monitor (2) | Kotak bulat | PC Monitor 27 inch, Annelida (CC BY 4.0); skrin projek dan profil kekal kanvas interaktif di atas panel model |
| Papan kekunci + tetikus | Dua kotak | Mouse and Keyboard, gorzi (CC BY 4.0), diringankan kepada ~49k segi tiga |
| Rak server | Kotak dengan LED | Data Center Server Rack, EntropyNine (CC BY 4.0); pintu kaca model kini berengsel dan masih terbuka untuk kemahiran |
| Menara PC | Kotak | Office PC, fluffyw0lf (CC BY 4.0) |
| Projektor | Kotak dan silinder | Projector, GokouFG (CC BY 4.0); kanta sebaris dengan pancaran ke skrin |
| Hiasan meja | Tiada | Book Stack, Visthétique (CC BY 4.0) |
| Buku hiasan rak | Kotak berwarna | Book Encyclopedia Set 01, Poly Haven (CC0); buku sijil berinteraksi kekal |

Semua tekstur dikecilkan ke ≤1024 px (JPEG), geometri dimampatkan dengan meshopt: 24 MB asal → 4.1 MB. Kredit (tajuk, pembuat, pautan, CC BY 4.0) dipaparkan melalui "Kredit model 3D" di paparan utama, seperti yang diwajibkan oleh lesen. `.gitattributes` menambah `*.glb binary`.

## Skop

**Disalin daripada `C:\Project\portfolio-staging\022\` (12 fail)**: `.gitattributes`, `src/lib/room/RoomWorld.ts`, `src/lib/room/RoomPage.svelte`, `scripts/room-smoke.mjs` (had masa muatan bilik dinaikkan ke 300 s), dan 8 model `static/room/sketchfab/*.glb` (baharu).
**Disunting**: `plans/README.md` (status 022).
**Luar skop**: `/cv`, `ObjectPanel.svelte`, `ContactModal.svelte`, aset `static/room/**` lain, CI. Jangan ubah fail lain.

## Aliran kerja git

- Kekal pada `main`. JANGAN cipta cawangan. Satu commit: `feat(bilik): model 3D sebenar (Sketchfab CC BY, Poly Haven CC0) dengan kredit`
- Stage eksplisit (Langkah 4). Jangan `git add -A` / `git add .`. Jangan push.
- **Tukar baris 022 dalam `plans/README.md` kepada `DONE` SEBELUM `git add`.**

## Langkah

### Langkah 1: Salin fail daripada staging

```bash
cd /c/Project/portfolio-staging/022
cp --parents .gitattributes src/lib/room/RoomWorld.ts src/lib/room/RoomPage.svelte scripts/room-smoke.mjs static/room/sketchfab/books.glb static/room/sketchfab/chair.glb static/room/sketchfab/ency.glb static/room/sketchfab/keyboard.glb static/room/sketchfab/monitor.glb static/room/sketchfab/pc.glb static/room/sketchfab/projector.glb static/room/sketchfab/rack.glb /c/Project/portfolio/
cd /c/Project/portfolio
n=0; while read h p; do n=$((n+1)); [ "$(git hash-object --no-filters "$p")" = "$h" ] || echo "BEZA $p"; done < /c/Project/portfolio-staging/022/MANIFEST.txt; echo "SALINAN $n fail"
```
**Verify** → tiada baris `BEZA`, `SALINAN 12 fail`.

### Langkah 2: Ujian penuh

```bash
npm run check 2>&1 | tail -1
npm test 2>&1 | grep -E "(pass|fail) [0-9]+"
npm run build 2>&1 | tail -1
```
→ `0 ERRORS 0 WARNINGS`; `pass 50`, `fail 0`; `✔ done`.

### Langkah 3: Ujian asap pelayar (localhost sahaja)

Jika pelayan dev masih berjalan pada port 5173, gunakannya. Jika tidak, mulakan `npm run dev -- --port 5173` di latar belakang dan tunggu `http://localhost:5173/` memberi 200. Kemudian (beri had masa sekurang-kurangnya 600 s; pelayar perisian lambat memuat model):

```bash
ROOM_URL=http://localhost:5173/ node scripts/room-smoke.mjs
```
→ `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`. Jika tamat masa atau disekat, catat dan teruskan; perancang akan menjalankannya.

### Langkah 4: Status, stage, sahkan indeks, commit

Tukar baris 022 dalam `plans/README.md` daripada `TODO` kepada `DONE` DAHULU. Kemudian:

```bash
grep "| 022" plans/README.md
git add .gitattributes src/lib/room/RoomWorld.ts src/lib/room/RoomPage.svelte scripts/room-smoke.mjs static/room/sketchfab/books.glb static/room/sketchfab/chair.glb static/room/sketchfab/ency.glb static/room/sketchfab/keyboard.glb static/room/sketchfab/monitor.glb static/room/sketchfab/pc.glb static/room/sketchfab/projector.glb static/room/sketchfab/rack.glb plans/README.md plans/022-bilik-model-3d-sebenar.md
while read h p; do [ "$(git ls-files -s -- "$p" | cut -d' ' -f2)" = "$h" ] || echo "INDEKS BEZA $p"; done < /c/Project/portfolio-staging/022/MANIFEST.txt; echo INDEKS-SELESAI
git diff --cached --stat | tail -1
git commit -m "feat(bilik): model 3D sebenar (Sketchfab CC BY, Poly Haven CC0) dengan kredit"
git status --short
```
→ baris 022 berakhir `DONE |`; tiada `INDEKS BEZA`; `INDEKS-SELESAI`; `14 files changed`; selepas commit `git status --short` hanya (mungkin) `?? dev.log`. JANGAN push. BERHENTI dan lapor.

## Kriteria siap

- [ ] 12 fail sepadan dengan manifes (salinan dan indeks)
- [ ] `check` 0 ralat 0 amaran; `npm test` fail 0; build `✔ done`
- [ ] `ROOM OK` (atau dicatat untuk perancang)
- [ ] Pada `main`; baris 022 = `DONE` dalam commit; satu commit; tiada push

## Syarat STOP

- Pelan 021 belum di-commit, atau semakan drift tidak sepadan.
- Baris `BEZA` atau `INDEKS BEZA` selepas satu cubaan menyalin semula.
- `check`, `npm test` atau build gagal. Jangan ubah fail lain untuk meluluskan ujian.

## Nota susulan (bukan untuk pelan ini)

- Fail model asal (sebelum dimampatkan) disimpan di luar repo dalam `C:\Project\portfolio-assets\sketchfab\`.
- Meja kekal binaan sendiri dengan tekstur kayu walnut Poly Haven; telefon, pas ID dan skrin projektor kekal binaan sendiri kerana memaparkan kandungan interaktif.
- Logo IWA001 / Infinity World: perlukan fail logo resolusi tinggi daripada pemilik.
