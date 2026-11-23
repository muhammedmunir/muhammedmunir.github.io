# Plan 030: Skrin memuat berjenama, halaman 404 berjenama, halaman privasi Baby Kick lama dibuang

> **Arahan pelaksana**: Laksanakan TERUS dalam sesi utama, tanpa subagent atau worktree. Ikut langkah mengikut turutan. Salin arahan TEPAT seperti dalam blok kod. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor. Pelan ini tidak memerlukan sebarang keputusan reka bentuk: fail sudah siap di folder staging.
>
> **Prasyarat**: Pelan 029 mesti sudah di-commit (`fix(resume): selaras PDF dengan laman, pautan projek yang sah dan baris hubungan tanpa emoji`).
>
> **Semakan drift (jalankan dahulu, dalam Git Bash)**:
> ```bash
> cd /c/Project/portfolio
> git log -1 --format=%s
> git rev-parse HEAD:src/lib/room/RoomWorld.ts HEAD:src/lib/room/RoomPage.svelte HEAD:static/sitemap.xml HEAD:src/routes/baby-kick-privacy/+page.svelte HEAD:static/Logo_BiK.png
> test ! -e src/routes/+error.svelte && echo TIADA-KONFLIK
> git status --short
> ls /c/Project/portfolio-staging/030/MANIFEST.txt
> ```
> → subjek `fix(resume): selaras PDF dengan laman, pautan projek yang sah dan baris hubungan tanpa emoji`; hash berturut-turut `a0d0a553739dd3b1715faf1f0c3bf5102b2faf50`, `073b5cda3572264f89fd30aa8bd0a8c8422e3704`, `b2bcbabb3b3e7b1894754143d8e103370ae9f219`, `1434944a38e7d731184409eb7cb6392a66257b3d`, `93198a87f5b5e6e8ce24ecc8247e366aca66057c`; `TIADA-KONFLIK`; `git status --short` hanya `?? plans/030-skrin-muat-404.md`, ` M plans/README.md` dan (jika masih ada) `?? dev.log`; fail manifes wujud. Jika berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: S (salin + padam + ujian) · **Risiko**: LOW-MED (RoomWorld: pemuat Three.js kini berkongsi satu `LoadingManager`; rupa bilik tidak berubah)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-23 dalam salinan terasing (`main` @ Pelan 029): `check` 857 FILES 0 ERRORS 0 WARNINGS, `npm test` pass 50 fail 0, build `✔ done`, smoke `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`, audit papan kekunci Pelan 028 tanpa ralat. Bingkai skrin memuat dirakam pada build produksi dengan rangkaian 4G simulasi (1440 px dan 390 px).
- **Keputusan pemilik** (2026-11-23): halaman `/baby-kick-privacy` dibuang terus. Dasar privasi Baby Kick kini di `https://my-baby-kicking-project.web.app/` (200, disahkan); pemilik akan mengemas kini URL dalam AdMob sendiri.

## Kenapa

Semakan menyeluruh sebagai pelawat:

1. **Skrin memuat nampak pelik.** Selama 4–7 s hanya ada teks kecil kelabu "Menyediakan bilik…" di tengah skrin hitam, tanpa kemajuan atau gerakan, jadi laman nampak tersangkut. Bilik kemudian muncul secara mengejut. Ikon siang/malam pula bertukar sendiri (☀ → 🌙) kira-kira 2.5 s selepas halaman dibuka, kerana mod siang hanya diketahui selepas bilik 3D dibina.
2. **Halaman 404 lalai SvelteKit.** URL yang salah memaparkan "404 Not Found" di bucu kiri, tanpa tajuk tab, tanpa jenama dan tanpa jalan kembali. GitHub Pages memaparkan halaman ini untuk setiap pautan rosak.
3. **Halaman privasi Baby Kick lama** tidak lagi digunakan (dasar privasi sudah berpindah).

## Perubahan

| Fail | Perubahan |
|------|-----------|
| `src/lib/room/RoomWorld.ts` | Pilihan baharu `onProgress(0..1)`. Satu `LoadingManager` mengira semua fail bilik: tekstur, model `.gltf`, HDR, muat turun `.glb` dan logo. Kemajuan muat turun 0–90%, kompilasi shader 92%, siap 100%. |
| `src/lib/room/RoomPage.svelte` | Skrin memuat: jenama `munir.` (Syne, titik aksen berkelip), bar kemajuan nipis sebenar (`role="progressbar"`) dan teks "Menyediakan bilik…" di atas latar gradien gelap. Skrin memuat pudar keluar dan kanvas pudar masuk. Ikon siang/malam dikira terus semasa halaman dimuat (peraturan 07:00–19:00 yang sama), dan disembunyikan sebelum itu. Semua animasi dimatikan jika `prefers-reduced-motion` aktif. Elemen `.loading` dikekalkan, jadi skrip ujian tidak berubah. |
| `src/routes/+error.svelte` (baharu) | Halaman 404 dan ralat berjenama: `munir.`, kod besar dalam warna aksen, mesej BM/EN mengikut bahasa pilihan, butang "Ke bilik 3D" dan "Baca CV", tajuk tab "Halaman tidak ditemui \| Muhammed Munir", dan `noindex`. |
| `static/sitemap.xml` | `lastmod` dikemas kini ke 2026-11-23. |
| `src/routes/baby-kick-privacy/+page.svelte` (dipadam) | Halaman privasi lama. |
| `static/Logo_BiK.png` (dipadam) | Hanya digunakan oleh halaman privasi lama. |

Kemajuan yang diukur (build produksi, 4G simulasi): 0% → 75% (2.5 s) → 92% (4 s) → 100%, kemudian bilik pudar masuk.

## Skop

**Disalin daripada `C:\Project\portfolio-staging\030\` (4 fail)**: lihat `MANIFEST.txt`.
**Dipadam**: `src/routes/baby-kick-privacy/+page.svelte`, `static/Logo_BiK.png`.
**Disunting**: `plans/README.md` (status 030).
**Luar skop**: `/cv`, `ObjectPanel.svelte`, model 3D. Jangan ubah fail lain.

## Aliran kerja git

- Kekal pada `main`. JANGAN cipta cawangan. Satu commit: `feat(laman): skrin memuat berjenama dengan kemajuan sebenar, halaman 404 berjenama, buang halaman privasi Baby Kick lama`
- Stage eksplisit (Langkah 4). Jangan `git add -A` / `git add .`. Jangan push.
- **Tukar baris 030 dalam `plans/README.md` kepada `DONE` SEBELUM `git add`.**

## Langkah

### Langkah 1: Salin fail daripada staging dan padam fail lama

```bash
cd /c/Project/portfolio-staging/030
cp --parents src/lib/room/RoomWorld.ts src/lib/room/RoomPage.svelte src/routes/+error.svelte static/sitemap.xml /c/Project/portfolio/
cd /c/Project/portfolio
git rm -q src/routes/baby-kick-privacy/+page.svelte static/Logo_BiK.png
n=0; while read h p; do n=$((n+1)); [ "$(git hash-object --no-filters "$p")" = "$h" ] || echo "BEZA $p"; done < /c/Project/portfolio-staging/030/MANIFEST.txt; echo "SALINAN $n fail"
test ! -e src/routes/baby-kick-privacy && test ! -e static/Logo_BiK.png && echo LAMA-DIPADAM
```
**Verify** → tiada baris `BEZA`, `SALINAN 4 fail`, `LAMA-DIPADAM`.

### Langkah 2: Ujian penuh

```bash
npm run check 2>&1 | tail -1
npm test 2>&1 | grep -E "(pass|fail) [0-9]+"
npm run build 2>&1 | tail -1
test ! -e build/baby-kick-privacy && test ! -e build/Logo_BiK.png && echo BUILD-BERSIH
```
→ `0 ERRORS 0 WARNINGS`; `pass 50`, `fail 0`; `✔ done`; `BUILD-BERSIH`.

### Langkah 3: Ujian asap pelayar (localhost sahaja)

Jika pelayan dev masih berjalan pada port 5173, MULAKAN SEMULA dahulu (route dipadam). Mulakan `npm run dev -- --port 5173` di latar belakang dan tunggu `http://localhost:5173/` memberi 200. Kemudian (had masa sekurang-kurangnya 600 s):

```bash
ROOM_URL=http://localhost:5173/ node scripts/room-smoke.mjs
```
→ `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`. Jika tamat masa atau disekat, catat dan teruskan; perancang akan menjalankannya.

### Langkah 4: Status, stage, sahkan indeks, commit

Tukar baris 030 dalam `plans/README.md` daripada `TODO` kepada `DONE` DAHULU. Kemudian:

```bash
grep "| 030" plans/README.md
git add src/lib/room/RoomWorld.ts src/lib/room/RoomPage.svelte src/routes/+error.svelte static/sitemap.xml plans/README.md plans/030-skrin-muat-404.md
while read h p; do [ "$(git ls-files -s -- "$p" | cut -d' ' -f2)" = "$h" ] || echo "INDEKS BEZA $p"; done < /c/Project/portfolio-staging/030/MANIFEST.txt; echo INDEKS-SELESAI
git diff --cached --name-status | grep "^D"
git diff --cached --stat | tail -1
git commit -m "feat(laman): skrin memuat berjenama dengan kemajuan sebenar, halaman 404 berjenama, buang halaman privasi Baby Kick lama"
git status --short
```
→ baris 030 berakhir `DONE |`; tiada `INDEKS BEZA`; `INDEKS-SELESAI`; dua baris `D` (`src/routes/baby-kick-privacy/+page.svelte`, `static/Logo_BiK.png`); `8 files changed`; selepas commit `git status --short` hanya (mungkin) `?? dev.log`. JANGAN push. BERHENTI dan lapor.

## Kriteria siap

- [ ] 4 fail sepadan dengan manifes (salinan dan indeks); 2 fail lama dipadam
- [ ] `check` 0 ralat 0 amaran; `npm test` fail 0; build `✔ done`; `BUILD-BERSIH`
- [ ] `ROOM OK` (atau dicatat untuk perancang)
- [ ] Pada `main`; baris 030 = `DONE` dalam commit; satu commit; tiada push

## Syarat STOP

- Pelan 029 belum di-commit, atau semakan drift tidak sepadan.
- Baris `BEZA` atau `INDEKS BEZA` selepas satu cubaan menyalin semula.
- `check`, `npm test` atau build gagal. Jangan ubah fail lain untuk meluluskan ujian.

## Nota susulan (bukan untuk pelan ini)

- Pemilik: kemas kini URL dasar privasi dalam AdMob (dan Play Console jika masih URL lama) ke `https://my-baby-kicking-project.web.app/`.
- Telefon (390 px): pas ID 3D yang tergantung kadang-kadang berada di belakang label paparan "Projek" / "Tentang saya" di bar atas; teks masih boleh dibaca (bayang teks) tetapi boleh dikemaskan.
