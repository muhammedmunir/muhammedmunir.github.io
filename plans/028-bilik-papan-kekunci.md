# Plan 028: Bilik 3D boleh digunakan sepenuhnya dengan papan kekunci dan pembaca skrin

> **Arahan pelaksana**: Laksanakan TERUS dalam sesi utama, tanpa subagent atau worktree. Ikut langkah mengikut turutan. Salin arahan TEPAT seperti dalam blok kod. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor. Pelan ini tidak memerlukan sebarang keputusan reka bentuk: fail sudah siap di folder staging.
>
> **Prasyarat**: Pelan 027 mesti sudah di-commit (`feat(cv): selaras jenama bilik 3D, buang kandungan berulang dan betulkan cetakan A4`).
>
> **Semakan drift (jalankan dahulu, dalam Git Bash)**:
> ```bash
> cd /c/Project/portfolio
> git log -1 --format=%s
> git rev-parse HEAD:src/lib/room/RoomPage.svelte
> git status --short
> ls /c/Project/portfolio-staging/028/MANIFEST.txt
> ```
> → subjek `feat(cv): selaras jenama bilik 3D, buang kandungan berulang dan betulkan cetakan A4`; hash `b988e63ee25512c2d2a28ead9b183327a6a8025d`; `git status --short` hanya `?? plans/028-bilik-papan-kekunci.md`, ` M plans/README.md` dan (jika masih ada) `?? dev.log`; fail manifes wujud. Jika berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: S (salin + ujian) · **Risiko**: LOW (satu fail, +64/−9 baris; tiada perubahan pada `RoomWorld.ts` atau rupa bilik bagi pengguna tetikus)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-23 dalam salinan terasing (`main` @ Pelan 027): `check` 858 FILES 0 ERRORS 0 WARNINGS, `npm test` pass 50 fail 0, build `✔ done`, smoke `ROOM 1920px OK`, `ROOM 390px OK`, `ROOM OK`. Audit papan kekunci automatik (Tab, Enter, Escape) pada 1440 px dan 390 px untuk setiap paparan; tiada ralat konsol.

## Kenapa

Audit papan kekunci sebagai pelawat (Tab, Enter, Escape sahaja):

1. **Projek tidak boleh dipilih.** Dalam paparan Komputer, lapan projek hanya boleh diklik pada monitor 3D. Pengguna papan kekunci dan pembaca skrin tidak dapat menonton tayangan, membuka butiran projek atau kajian kes dari bilik.
2. **Pas kerja dan buku tidak boleh dibuka.** Paparan Perjalanan kerja dan Pembelajaran hanya ada dalam kanvas. `RoomWorld.activate()` sudah ditulis untuk navigasi papan kekunci tetapi tidak pernah dipanggil.
3. **Kemahiran tiada teks.** Paparan rak server tiada butang Butiran. Nama kemahiran hanya muncul bila tetikus dihalakan pada logo.
4. **Fokus hilang.** Selepas masuk ke sesuatu paparan, fokus kekal pada senarai objek tersembunyi, jadi pengguna perlu menekan Tab 6–7 kali untuk sampai ke butang Kembali. Selepas panel Butiran ditutup, fokus jatuh ke `body`.
5. **Gerakan.** Peralihan pentas dan petunjuk masih beranimasi walaupun `prefers-reduced-motion` aktif.

## Perubahan (`src/lib/room/RoomPage.svelte`)

| Perubahan | Kesan |
|---|---|
| Kad pemilih untuk paparan Komputer, Perjalanan kerja dan Pembelajaran: senarai butang projek (`present`), pas (`activate('badge')`) dan buku (`activate('book')`), dengan teks penuh (syarikat, jawatan, tempoh; kelayakan, institusi). Tersembunyi secara visual sehingga difokus, sama seperti dail telefon. | Semua kandungan bilik boleh dicapai dengan papan kekunci. Pembaca skrin membaca teks yang sebelum ini hanya ada dalam kanvas. |
| Butang Butiran pada paparan rak server membuka panel Kemahiran (komponen panel sedia ada). | Senarai kemahiran dalam teks untuk semua pelawat. |
| Masuk paparan dengan papan kekunci: fokus ke butang Kembali. Keluar (Escape atau Kembali): fokus kembali ke objek asal. Pilih projek: fokus ke kawalan tayangan. Hanya bila fokus papan kekunci (`:focus-visible`), jadi klik tetikus tidak berubah. | Urutan Tab pendek dan boleh diramal. |
| Panel ditutup: fokus kembali ke butang yang membukanya. | Fokus tidak lagi hilang ke `body`. |
| `prefers-reduced-motion`: peralihan `.stage` dan `.hint` dimatikan. | Tiada gerakan yang tidak perlu. |

Aliran yang disahkan (audit automatik): Tab ke "Komputer" → Enter → fokus "Kembali" → Tab → senarai projek → Enter → tayangan, fokus "Kembali" → Butiran → Escape → fokus "Butiran" → Escape → fokus "Komputer: projek". Aliran yang sama untuk pas, buku dan kemahiran. Klik tetikus pada Kembali tidak memaparkan butang objek tersembunyi.

## Skop

**Disalin daripada `C:\Project\portfolio-staging\028\` (1 fail)**: lihat `MANIFEST.txt`.
**Disunting**: `plans/README.md` (status 028).
**Luar skop**: `RoomWorld.ts`, `ObjectPanel.svelte`, `/cv`. Jangan ubah fail lain.

## Aliran kerja git

- Kekal pada `main`. JANGAN cipta cawangan. Satu commit: `feat(bilik): navigasi papan kekunci penuh untuk projek, pas, buku dan kemahiran`
- Stage eksplisit (Langkah 4). Jangan `git add -A` / `git add .`. Jangan push.
- **Tukar baris 028 dalam `plans/README.md` kepada `DONE` SEBELUM `git add`.**

## Langkah

### Langkah 1: Salin fail daripada staging

```bash
cd /c/Project/portfolio-staging/028
cp --parents src/lib/room/RoomPage.svelte /c/Project/portfolio/
cd /c/Project/portfolio
n=0; while read h p; do n=$((n+1)); [ "$(git hash-object --no-filters "$p")" = "$h" ] || echo "BEZA $p"; done < /c/Project/portfolio-staging/028/MANIFEST.txt; echo "SALINAN $n fail"
```
**Verify** → tiada baris `BEZA`, `SALINAN 1 fail`.

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

Tukar baris 028 dalam `plans/README.md` daripada `TODO` kepada `DONE` DAHULU. Kemudian:

```bash
grep "| 028" plans/README.md
git add src/lib/room/RoomPage.svelte plans/README.md plans/028-bilik-papan-kekunci.md
while read h p; do [ "$(git ls-files -s -- "$p" | cut -d' ' -f2)" = "$h" ] || echo "INDEKS BEZA $p"; done < /c/Project/portfolio-staging/028/MANIFEST.txt; echo INDEKS-SELESAI
git diff --cached --stat | tail -1
git commit -m "feat(bilik): navigasi papan kekunci penuh untuk projek, pas, buku dan kemahiran"
git status --short
```
→ baris 028 berakhir `DONE |`; tiada `INDEKS BEZA`; `INDEKS-SELESAI`; `3 files changed`; selepas commit `git status --short` hanya (mungkin) `?? dev.log`. JANGAN push. BERHENTI dan lapor.

## Kriteria siap

- [ ] 1 fail sepadan dengan manifes (salinan dan indeks)
- [ ] `check` 0 ralat 0 amaran; `npm test` fail 0; build `✔ done`
- [ ] `ROOM OK` (atau dicatat untuk perancang)
- [ ] Pada `main`; baris 028 = `DONE` dalam commit; satu commit; tiada push

## Syarat STOP

- Pelan 027 belum di-commit, atau semakan drift tidak sepadan.
- Baris `BEZA` atau `INDEKS BEZA` selepas satu cubaan menyalin semula.
- `check`, `npm test` atau build gagal. Jangan ubah fail lain untuk meluluskan ujian.

## Nota susulan (bukan untuk pelan ini)

- `resume.pdf`: semak kandungan sepadan dengan `/cv` (ejaan nama produk yang diseragamkan dalam Pelan 027).
- Logo IWA001 / Infinity World: perlukan fail logo resolusi tinggi daripada pemilik.
