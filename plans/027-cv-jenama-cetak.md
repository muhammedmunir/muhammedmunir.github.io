# Plan 027: `/cv` diselaraskan dengan jenama bilik 3D (fon, identiti, kandungan tanpa ulangan, cetakan A4)

> **Arahan pelaksana**: Laksanakan TERUS dalam sesi utama, tanpa subagent atau worktree. Ikut langkah mengikut turutan. Salin arahan TEPAT seperti dalam blok kod. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor. Pelan ini tidak memerlukan sebarang keputusan reka bentuk: semua fail sudah siap di folder staging.
>
> **Prasyarat**: Pelan 026 mesti sudah di-commit (`perf(bilik): muat serentak, shader dikompil selari dan logo dikecilkan`).
>
> **Semakan drift (jalankan dahulu, dalam Git Bash)**:
> ```bash
> cd /c/Project/portfolio
> git log -1 --format=%s
> git rev-parse HEAD:src/routes/cv/+page.svelte HEAD:src/lib/content/portfolio-data.ts
> git status --short
> ls /c/Project/portfolio-staging/027/MANIFEST.txt
> ```
> → subjek `perf(bilik): muat serentak, shader dikompil selari dan logo dikecilkan`; hash berturut-turut `a8f0cfcf0b747b785a9d372f25a58ecefb24e8de`, `197fe3df316e3f02f3c5cc096ec6a6523080bebf`; `git status --short` hanya `?? plans/027-cv-jenama-cetak.md`, ` M plans/README.md` dan (jika masih ada) `?? dev.log`; fail manifes wujud. Jika berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: S (salin + ujian) · **Risiko**: LOW (halaman `/cv` dan 6 rentetan nama produk dalam data; tiada kod bilik 3D)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-23 dalam salinan terasing (`main` @ Pelan 026): `check` 858 FILES 0 ERRORS 0 WARNINGS, `npm test` pass 50 fail 0, build `✔ done`. Tangkapan skrin penuh `/cv` pada 1440 px dan 390 px, tema cerah dan gelap, BM dan EN: tiada limpahan mendatar, tiada ralat konsol. PDF cetakan A4 disemak setiap halaman.

## Kenapa

Semakan `/cv` sebagai pelawat:

1. **Jenama tidak sepadan dengan laman utama.** Tajuk `h1`/`h2` menggunakan Georgia (pembolehubah `--work-font-display` tidak wujud, jadi fon sandaran digunakan), sedangkan bilik 3D menggunakan Syne. Pautan atas dan bawah masih menyebut "Meja Projek", nama laman utama yang lama.
2. **Kandungan berulang.** Baris peranan yang sama ("Full-Stack Developer: Penyelenggaraan Sistem, ...") diulang tiga kali bagi EMESYS, SUTERA dan ADiMS. 9Router AI Office dan Baby Kick Tracker dipaparkan dua kali (dalam "Projek dibangunkan" dan "Arkib peribadi"). Ayat "Butiran tambahan tersedia melalui hubungan terus." diulang enam kali. Pautan "Hantar e-mel" mengulangi alamat e-mel yang dipaparkan betul-betul di bawahnya.
3. **Ejaan nama produk tidak konsisten.** Ada "EMESYS" dan "eMesys", "ADiMS" dan "ADIMS", serta "ONBOARDX" dan "Onboardx".
4. **Label akses sukar dibezakan.** "Sistem Dalaman Agensi · Kod Sulit" kelihatan seperti sebahagian senarai teknologi.
5. **Cetakan rosak.** Ctrl+P menghasilkan 11 halaman A4 berlatar gelap dan tanpa margin. Separuh halaman kosong kerana setiap entri kerja dipaksa tidak terpecah. Tanpa grafik latar, teks berwarna cerah di atas kertas putih.

## Perubahan

| Fail | Perubahan |
|------|-----------|
| `src/routes/cv/+page.svelte` | Masthead: identiti `munir.` (Syne 800, titik aksen) sama seperti bilik 3D, label boleh capai "munir. Kembali ke bilik 3D". `h1`/`h2` dalam Syne. Pautan "Hantar e-mel" yang berulang dibuang. Peranan yang sama bagi semua sistem dalam satu kumpulan dipaparkan sekali di tajuk kumpulan. Arkib peribadi tidak lagi mengulangi projek yang sudah dipaparkan, dan nota "butiran atas permintaan" dipaparkan sekali di tajuk bahagian. Label akses dipaparkan sebagai tag berbingkai. Footer: "Meja Projek" ditukar kepada "Bilik 3D". Cetakan: A4 dengan margin 14/15 mm, kertas putih dan dakwat gelap tanpa mengira tema, susun atur padat dua lajur, pemecahan halaman pada item kecil, dan pautan interaktif disembunyikan. |
| `src/lib/content/portfolio-data.ts` | 6 rentetan: ejaan EMESYS, SUTERA, ADiMS dan ONBOARDX diseragamkan (BM dan EN). |

| Ukuran | Sebelum | Selepas |
|---|---|---|
| Tinggi halaman, desktop 1440 px | 9,752 px | 9,334 px |
| Tinggi halaman, telefon 390 px | 14,055 px | 13,413 px |
| Cetakan A4 | 11 halaman, latar gelap, tanpa margin | 7 halaman, putih, margin 14/15 mm |

## Skop

**Disalin daripada `C:\Project\portfolio-staging\027\` (2 fail)**: lihat `MANIFEST.txt`.
**Disunting**: `plans/README.md` (status 027).
**Luar skop**: bilik 3D, `resume.pdf`, `ContactModal`, tema global (`layout.css`). Jangan ubah fail lain.

## Aliran kerja git

- Kekal pada `main`. JANGAN cipta cawangan. Satu commit: `feat(cv): selaras jenama bilik 3D, buang kandungan berulang dan betulkan cetakan A4`
- Stage eksplisit (Langkah 4). Jangan `git add -A` / `git add .`. Jangan push.
- **Tukar baris 027 dalam `plans/README.md` kepada `DONE` SEBELUM `git add`.**

## Langkah

### Langkah 1: Salin fail daripada staging

```bash
cd /c/Project/portfolio-staging/027
cp --parents src/routes/cv/+page.svelte src/lib/content/portfolio-data.ts /c/Project/portfolio/
cd /c/Project/portfolio
n=0; while read h p; do n=$((n+1)); [ "$(git hash-object --no-filters "$p")" = "$h" ] || echo "BEZA $p"; done < /c/Project/portfolio-staging/027/MANIFEST.txt; echo "SALINAN $n fail"
```
**Verify** → tiada baris `BEZA`, `SALINAN 2 fail`.

### Langkah 2: Ujian penuh

```bash
npm run check 2>&1 | tail -1
npm test 2>&1 | grep -E "(pass|fail) [0-9]+"
npm run build 2>&1 | tail -1
grep -c "Meja Projek" build/cv/index.html || true
```
→ `0 ERRORS 0 WARNINGS`; `pass 50`, `fail 0`; `✔ done`; kiraan `Meja Projek` = `0`.

### Langkah 3: Ujian asap pelayar (localhost sahaja)

Jika pelayan dev masih berjalan pada port 5173, gunakannya. Jika tidak, mulakan `npm run dev -- --port 5173` di latar belakang dan tunggu `http://localhost:5173/` memberi 200. Kemudian (had masa sekurang-kurangnya 600 s):

```bash
ROOM_URL=http://localhost:5173/ node scripts/room-smoke.mjs
```
→ `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`. Jika tamat masa atau disekat, catat dan teruskan; perancang akan menjalankannya.

### Langkah 4: Status, stage, sahkan indeks, commit

Tukar baris 027 dalam `plans/README.md` daripada `TODO` kepada `DONE` DAHULU. Kemudian:

```bash
grep "| 027" plans/README.md
git add src/routes/cv/+page.svelte src/lib/content/portfolio-data.ts plans/README.md plans/027-cv-jenama-cetak.md
while read h p; do [ "$(git ls-files -s -- "$p" | cut -d' ' -f2)" = "$h" ] || echo "INDEKS BEZA $p"; done < /c/Project/portfolio-staging/027/MANIFEST.txt; echo INDEKS-SELESAI
git diff --cached --stat | tail -1
git commit -m "feat(cv): selaras jenama bilik 3D, buang kandungan berulang dan betulkan cetakan A4"
git status --short
```
→ baris 027 berakhir `DONE |`; tiada `INDEKS BEZA`; `INDEKS-SELESAI`; `4 files changed`; selepas commit `git status --short` hanya (mungkin) `?? dev.log`. JANGAN push. BERHENTI dan lapor.

## Kriteria siap

- [ ] 2 fail sepadan dengan manifes (salinan dan indeks)
- [ ] `check` 0 ralat 0 amaran; `npm test` fail 0; build `✔ done`; tiada "Meja Projek" dalam `/cv`
- [ ] `ROOM OK` (atau dicatat untuk perancang)
- [ ] Pada `main`; baris 027 = `DONE` dalam commit; satu commit; tiada push

## Syarat STOP

- Pelan 026 belum di-commit, atau semakan drift tidak sepadan.
- Baris `BEZA` atau `INDEKS BEZA` selepas satu cubaan menyalin semula.
- `check`, `npm test` atau build gagal. Jangan ubah fail lain untuk meluluskan ujian.

## Nota susulan (bukan untuk pelan ini)

- `resume.pdf` (butang "Muat turun CV") ialah fail berasingan dan tidak disentuh. Semak sama ada kandungannya masih sepadan dengan `/cv`.
- Logo IWA001 / Infinity World: perlukan fail logo resolusi tinggi daripada pemilik.
