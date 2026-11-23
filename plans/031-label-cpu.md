# Plan 031: Label paparan dan header telefon sentiasa terbaca; CPU bawah meja dibaiki

> **Arahan pelaksana**: Laksanakan TERUS dalam sesi utama, tanpa subagent atau worktree. Ikut langkah mengikut turutan. Salin arahan TEPAT seperti dalam blok kod. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor. Pelan ini tidak memerlukan sebarang keputusan reka bentuk: fail sudah siap di folder staging.
>
> **Prasyarat**: Pelan 030 mesti sudah di-commit (`feat(laman): skrin memuat berjenama dengan kemajuan sebenar, halaman 404 berjenama, buang halaman privasi Baby Kick lama`).
>
> **Semakan drift (jalankan dahulu, dalam Git Bash)**:
> ```bash
> cd /c/Project/portfolio
> git log -1 --format=%s
> git rev-parse HEAD:src/lib/room/RoomPage.svelte HEAD:src/lib/room/RoomWorld.ts
> git status --short
> ls /c/Project/portfolio-staging/031/MANIFEST.txt
> ```
> → subjek `feat(laman): skrin memuat berjenama dengan kemajuan sebenar, halaman 404 berjenama, buang halaman privasi Baby Kick lama`; hash berturut-turut `1768e2be8fc1b786bebf9b7734884f8e075cb283`, `ca7e81637e4dcaa8e2e033ab6162311a7f98ee77`; `git status --short` hanya `?? plans/031-label-cpu.md`, ` M plans/README.md` dan (jika masih ada) `?? dev.log`; fail manifes wujud. Jika berbeza, STOP.

## Status

- **Keutamaan**: P2 · **Usaha**: S (salin + ujian) · **Risiko**: LOW (CSS dua baris; RoomWorld +10/−1 pada menara PC sahaja)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-23 dalam salinan terasing (`main` @ Pelan 030): `check` 857 FILES 0 ERRORS 0 WARNINGS, `npm test` pass 50 fail 0, build `✔ done`, smoke `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`, audit papan kekunci Pelan 028 tanpa ralat. Semua paparan siang/malam pada 1440 px dan 390 px; gambar dekat menara PC siang dan malam. Disahkan: 0 bahagian menara dalam senarai objek boleh klik; skrin monitor dan papan kekunci masih boleh diklik.

## Kenapa

1. **Label paparan sukar dibaca di telefon.** Pada 390 px, kamera berundur dan pas ID 3D tergantung masuk ke bar atas: "Tentang saya" di atas pas putih hampir tidak terbaca, "Pembelajaran & sijil" pudar di depan cahaya terang, dan pas kelihatan di belakang pautan "Resume" / "Hubungi".
2. **CPU bawah meja "cacat" (laporan pemilik).** Menara PC kelihatan seperti kotak hitam dalam bayang meja dan tersepit pada kaki kanan meja. Halakan tetikus padanya memaparkan "Komputer · Projek", dan klik membawa kamera ke skrin projek; pelawat yang mengklik CPU tidak menjangka ini.

## Perubahan

| Fail | Perubahan |
|------|-----------|
| `src/lib/room/RoomPage.svelte` | Label paparan (`.focus-bar p`) berlatar gelap bulat seperti butang (tinggi 44 px), jadi kekal terbaca di atas apa sahaja di belakangnya. Telefon (≤999 px): latar header ditebalkan (gradien gelap hingga 60%). |
| `src/lib/room/RoomWorld.ts` | Menara PC dialih ke `x = -0.12` (renggang daripada kaki meja `x = 0.18`). Permukaannya lebih memantulkan cahaya bilik (`envMapIntensity` 2.2). Jalur LED aksen di tepi hadapan, sentiasa menyala. Menara dan LED dikeluarkan daripada senarai objek boleh klik (hiasan sahaja); monitor, papan kekunci dan skrin kekal membawa ke Projek / Tentang saya. |

## Skop

**Disalin daripada `C:\Project\portfolio-staging\031\` (2 fail)**: lihat `MANIFEST.txt`.
**Disunting**: `plans/README.md` (status 031).
**Luar skop**: model 3D (`static/room`), `/cv`. Jangan ubah fail lain.

## Aliran kerja git

- Kekal pada `main`. JANGAN cipta cawangan. Satu commit: `fix(bilik): label paparan terbaca di telefon dan CPU bawah meja dibaiki`
- Stage eksplisit (Langkah 4). Jangan `git add -A` / `git add .`. Jangan push.
- **Tukar baris 031 dalam `plans/README.md` kepada `DONE` SEBELUM `git add`.**

## Langkah

### Langkah 1: Salin fail daripada staging

```bash
cd /c/Project/portfolio-staging/031
cp --parents src/lib/room/RoomPage.svelte src/lib/room/RoomWorld.ts /c/Project/portfolio/
cd /c/Project/portfolio
n=0; while read h p; do n=$((n+1)); [ "$(git hash-object --no-filters "$p")" = "$h" ] || echo "BEZA $p"; done < /c/Project/portfolio-staging/031/MANIFEST.txt; echo "SALINAN $n fail"
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

Jika pelayan dev masih berjalan pada port 5173, gunakannya. Jika tidak, mulakan `npm run dev -- --port 5173` di latar belakang dan tunggu `http://localhost:5173/` memberi 200. Kemudian (had masa sekurang-kurangnya 600 s):

```bash
ROOM_URL=http://localhost:5173/ node scripts/room-smoke.mjs
```
→ `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`. Jika tamat masa atau disekat, catat dan teruskan; perancang akan menjalankannya.

### Langkah 4: Status, stage, sahkan indeks, commit

Tukar baris 031 dalam `plans/README.md` daripada `TODO` kepada `DONE` DAHULU. Kemudian:

```bash
grep "| 031" plans/README.md
git add src/lib/room/RoomPage.svelte src/lib/room/RoomWorld.ts plans/README.md plans/031-label-cpu.md
while read h p; do [ "$(git ls-files -s -- "$p" | cut -d' ' -f2)" = "$h" ] || echo "INDEKS BEZA $p"; done < /c/Project/portfolio-staging/031/MANIFEST.txt; echo INDEKS-SELESAI
git diff --cached --stat | tail -1
git commit -m "fix(bilik): label paparan terbaca di telefon dan CPU bawah meja dibaiki"
git status --short
```
→ baris 031 berakhir `DONE |`; tiada `INDEKS BEZA`; `INDEKS-SELESAI`; `4 files changed`; selepas commit `git status --short` hanya (mungkin) `?? dev.log`. JANGAN push. BERHENTI dan lapor.

## Kriteria siap

- [ ] 2 fail sepadan dengan manifes (salinan dan indeks)
- [ ] `check` 0 ralat 0 amaran; `npm test` fail 0; build `✔ done`
- [ ] `ROOM OK` (atau dicatat untuk perancang)
- [ ] Pada `main`; baris 031 = `DONE` dalam commit; satu commit; tiada push

## Syarat STOP

- Pelan 030 belum di-commit, atau semakan drift tidak sepadan.
- Baris `BEZA` atau `INDEKS BEZA` selepas satu cubaan menyalin semula.
- `check`, `npm test` atau build gagal. Jangan ubah fail lain untuk meluluskan ujian.
