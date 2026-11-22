# Plan 026: Bilik 3D dimuat ~3× lebih pantas (muat turun serentak, shader dikompil selari, logo dikecilkan)

> **Arahan pelaksana**: Laksanakan TERUS dalam sesi utama, tanpa subagent atau worktree. Ikut langkah mengikut turutan. Salin arahan TEPAT seperti dalam blok kod. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor. Pelan ini tidak memerlukan sebarang keputusan reka bentuk: semua fail sudah siap di folder staging.
>
> **Prasyarat**: Pelan 025 mesti sudah di-commit (`chore(jenama): imej pratonton, favicon dan manifest sepadan dengan bilik 3D`).
>
> **Semakan drift (jalankan dahulu, dalam Git Bash)**:
> ```bash
> cd /c/Project/portfolio
> git log -1 --format=%s
> git rev-parse HEAD:src/lib/room/RoomWorld.ts HEAD:static/images/adims-logo.png HEAD:static/images/sutera-logo.png HEAD:static/images/baby_kicking_logo.png HEAD:static/images/onboardx-original.png
> git status --short
> ls /c/Project/portfolio-staging/026/MANIFEST.txt
> ```
> → subjek `chore(jenama): imej pratonton, favicon dan manifest sepadan dengan bilik 3D`; hash berturut-turut `dc52e927a60a95aa85047f9c0aa28a93c35343b0`, `7e21342c976ef4a938e3823946f9e9c9e91aa90a`, `37e434ca4176a33bb1c433b6ae778629b82c1e1b`, `93198a87f5b5e6e8ce24ecc8247e366aca66057c`, `63b85b84a70e789a68500db7e64787854540f9f5`; `git status --short` hanya `?? plans/026-bilik-muat-pantas.md`, ` M plans/README.md` dan (jika masih ada) `?? dev.log`; fail manifes wujud. Jika berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: S (salin + ujian) · **Risiko**: LOW-MED (satu fail kod, +39/−10 baris; susunan muat bilik berubah, rupa bilik tidak berubah kecuali siling di atas lampu)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-23 dalam salinan terasing (`main` @ Pelan 025): `check` 858 FILES 0 ERRORS 0 WARNINGS, `npm test` pass 50 fail 0, build `✔ done`, smoke `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`. Tangkapan skrin semua paparan (keseluruhan, komputer, profil, rak server, pas kerja, buku, tayangan, telefon) siang dan malam pada 1920 px dan 390 px; tiada ralat konsol.

## Kenapa

Pengukuran build produksi (GPU AMD terbina dalam, rangkaian "4G laju" simulasi 9 Mbps / RTT 150 ms) menunjukkan pelawat menunggu **11–26 s** sebelum bilik dipaparkan. Tiga punca:

1. **Kompilasi shader menyekat halaman** (punca utama). Profil CPU: 12.6 s daripada 14.3 s dihabiskan dalam pemautan program WebGL (`getUniforms`). Setiap model yang tiba dikompil secara segerak semasa render. Halaman beku sehingga 8 s sekali gus, malah tanpa rangkaian langsung.
2. **Model dimuat satu demi satu.** HDR mesti siap dahulu; monitor, PC, buku dan papan kekunci menunggu antara satu sama lain; ensiklopedia dan hiasan rak hanya bermula selepas semua itu.
3. **Logo projek terlalu besar.** `adims-logo.png` 3508×2481 (2.5 MB), `sutera-logo.png` 901 KB, `baby_kicking_logo.png` 657 KB, `onboardx-original.png` 515 KB, walaupun saiz lukisan terbesar hanya 270 px.

## Pembetulan

| Perubahan | Kesan |
|---|---|
| `RoomWorld.ts`: semua model `.glb`, logo dan HDR mula dimuat turun serentak pada awal binaan (satu muat turun bagi setiap fail; buku yang digunakan dua kali dimuat sekali) | Semua fail siap dalam ~7 s pada 4G (sebelum ini ~22 s) |
| `RoomWorld.ts`: bilik tidak dirender semasa memuat; selepas semua model siap, semua shader dikompil secara selari (`renderer.compileAsync`, `KHR_parallel_shader_compile`) dengan sasaran render composer | Tiada lagi pembekuan 8 s; bilik siap ~3.8 s tanpa had rangkaian (sebelum ini 11–26 s) |
| `RoomWorld.ts`: pengawal prestasi (Pelan 024) hanya mula mengukur selepas bilik dirender | Masa memuat tidak dikira sebagai fps |
| `RoomWorld.ts`: siling tidak menerima bayang | Bulatan hitam pekat di siling atas lampu (kelihatan pada kamera telefon) diganti cahaya hangat lembut |
| 4 logo dikecilkan kepada sisi terpanjang 512 px (ADiMS dan SUTERA dengan palet 256 warna, Baby Kick dan OnboardX warna penuh kerana ada kecerunan) | 4.6 MB → 0.33 MB; perbandingan visual pada latar cerah dan gelap: tiada beza yang ketara |

| Ukuran build produksi (A/B berselang-seli, keadaan sama) | Asal | Baharu |
|---|---|---|
| Bilik siap, tanpa had rangkaian | 11–26 s | 3.8–7 s |
| Bilik siap, 4G laju, desktop 1920 px | 11.5–23 s | 5.3–7.9 s |
| Bilik siap, 4G laju, telefon 390 px | 12–25 s | 4.9–6.9 s |
| Saiz logo projek | 4.6 MB | 0.33 MB |

## Skop

**Disalin daripada `C:\Project\portfolio-staging\026\` (5 fail)**: lihat `MANIFEST.txt`.
**Disunting**: `plans/README.md` (status 026).
**Luar skop**: `/cv`, `RoomPage.svelte`, model 3D, CI. Jangan ubah fail lain.

## Aliran kerja git

- Kekal pada `main`. JANGAN cipta cawangan. Satu commit: `perf(bilik): muat serentak, shader dikompil selari dan logo dikecilkan`
- Stage eksplisit (Langkah 4). Jangan `git add -A` / `git add .`. Jangan push.
- **Tukar baris 026 dalam `plans/README.md` kepada `DONE` SEBELUM `git add`.**

## Langkah

### Langkah 1: Salin fail daripada staging

```bash
cd /c/Project/portfolio-staging/026
cp --parents src/lib/room/RoomWorld.ts static/images/adims-logo.png static/images/sutera-logo.png static/images/baby_kicking_logo.png static/images/onboardx-original.png /c/Project/portfolio/
cd /c/Project/portfolio
n=0; while read h p; do n=$((n+1)); [ "$(git hash-object --no-filters "$p")" = "$h" ] || echo "BEZA $p"; done < /c/Project/portfolio-staging/026/MANIFEST.txt; echo "SALINAN $n fail"
```
**Verify** → tiada baris `BEZA`, `SALINAN 5 fail`.

### Langkah 2: Ujian penuh

```bash
npm run check 2>&1 | tail -1
npm test 2>&1 | grep -E "(pass|fail) [0-9]+"
npm run build 2>&1 | tail -1
```
→ `0 ERRORS 0 WARNINGS`; `pass 50`, `fail 0`; `✔ done`.

### Langkah 3: Ujian asap pelayar (localhost sahaja)

Jika pelayan dev masih berjalan pada port 5173, gunakannya. Jika tidak, mulakan `npm run dev -- --port 5173` di latar belakang dan tunggu `http://localhost:5173/` memberi 200. Kemudian (had masa sekurang-kurangnya 600 s):

```bash
ROOM_URL=http://localhost:5173/ node scripts/room-smoke.mjs
```
→ `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`. Jika tamat masa atau disekat, catat dan teruskan; perancang akan menjalankannya.

### Langkah 4: Status, stage, sahkan indeks, commit

Tukar baris 026 dalam `plans/README.md` daripada `TODO` kepada `DONE` DAHULU. Kemudian:

```bash
grep "| 026" plans/README.md
git add src/lib/room/RoomWorld.ts static/images/adims-logo.png static/images/sutera-logo.png static/images/baby_kicking_logo.png static/images/onboardx-original.png plans/README.md plans/026-bilik-muat-pantas.md
while read h p; do [ "$(git ls-files -s -- "$p" | cut -d' ' -f2)" = "$h" ] || echo "INDEKS BEZA $p"; done < /c/Project/portfolio-staging/026/MANIFEST.txt; echo INDEKS-SELESAI
git diff --cached --stat | tail -1
git commit -m "perf(bilik): muat serentak, shader dikompil selari dan logo dikecilkan"
git status --short
```
→ baris 026 berakhir `DONE |`; tiada `INDEKS BEZA`; `INDEKS-SELESAI`; `7 files changed`; selepas commit `git status --short` hanya (mungkin) `?? dev.log`. JANGAN push. BERHENTI dan lapor.

## Kriteria siap

- [ ] 5 fail sepadan dengan manifes (salinan dan indeks)
- [ ] `check` 0 ralat 0 amaran; `npm test` fail 0; build `✔ done`
- [ ] `ROOM OK` (atau dicatat untuk perancang)
- [ ] Pada `main`; baris 026 = `DONE` dalam commit; satu commit; tiada push

## Syarat STOP

- Pelan 025 belum di-commit, atau semakan drift tidak sepadan.
- Baris `BEZA` atau `INDEKS BEZA` selepas satu cubaan menyalin semula.
- `check`, `npm test` atau build gagal. Jangan ubah fail lain untuk meluluskan ujian.

## Nota susulan (bukan untuk pelan ini)

- Fail `static/images` lain yang tidak dirujuk oleh laman (tangkapan skrin UI lama, ~3 MB) tidak dimuat oleh pelawat; dibiarkan.
- Logo IWA001 / Infinity World: perlukan fail logo resolusi tinggi daripada pemilik.
