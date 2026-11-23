# Plan 029: `resume.pdf` diselaraskan dengan laman (tajuk, ejaan produk, pautan projek, tanpa emoji)

> **Arahan pelaksana**: Laksanakan TERUS dalam sesi utama, tanpa subagent atau worktree. Ikut langkah mengikut turutan. Salin arahan TEPAT seperti dalam blok kod. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor. Pelan ini tidak memerlukan sebarang keputusan reka bentuk: fail sudah siap di folder staging. **JANGAN jalankan `build_resume.py`** (ia juga menulis ke folder Downloads pemilik); PDF sudah dijana oleh perancang.
>
> **Prasyarat**: Pelan 028 mesti sudah di-commit (`feat(bilik): navigasi papan kekunci penuh untuk projek, pas, buku dan kemahiran`).
>
> **Semakan drift (jalankan dahulu, dalam Git Bash)**:
> ```bash
> cd /c/Project/portfolio
> git log -1 --format=%s
> git rev-parse HEAD:build_resume.py HEAD:static/resume.pdf
> git status --short
> ls /c/Project/portfolio-staging/029/MANIFEST.txt
> ```
> → subjek `feat(bilik): navigasi papan kekunci penuh untuk projek, pas, buku dan kemahiran`; hash berturut-turut `4ece5d39d254bae8e96edb60f8490f44ee90aed7`, `8fe764bf424a85eaa0e0bae94b1037ed242cd294`; `git status --short` hanya `?? plans/029-resume-pdf-selaras.md`, ` M plans/README.md` dan (jika masih ada) `?? dev.log`; fail manifes wujud. Jika berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: S (salin + ujian) · **Risiko**: LOW (PDF statik dan skrip penjananya; tiada kod laman)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-23: PDF dijana semula daripada `build_resume.py` yang dikemas kini (Chromium A4, margin sama). 2 halaman, foto profil kekal (768×1024), fon Segoe UI sahaja (tiada fon Type3 emoji). Semua 8 pautan disemak: 4 pautan hubungan tidak berubah; 4 pautan projek menuju ke sauh yang wujud pada `/cv` langsung (`#projek`, `#project-9router`, `#project-babykick`). Kedua-dua halaman disemak secara visual.
- **Keputusan pemilik** (2026-11-23): tajuk profil "Full-Stack Developer" (sama dengan laman); jawatan YHCM "Full-Stack Developer" (sama dengan `/cv`).

## Kenapa

Perbandingan `resume.pdf` (butang "Muat turun CV" dan "Resume (PDF)") dengan `/cv`:

1. **Pautan projek menyesatkan.** Lima projek berlabel "Live Demo", "Case Study", "Mobile App" atau "Web App", tetapi semuanya menuju ke `muhammedmunir.github.io/#projects`, sauh laman lama yang sudah tiada. Tiada demo langsung atau kajian kes bagi projek-projek itu. Perekrut yang mengklik pautan itu hanya akan sampai ke laman utama.
2. **Tajuk dan jawatan tidak sepadan.** Di PDF tertulis "Full-Stack Systems Engineer & IT Professional" dan "Programmer / Full-Stack Enterprise Developer", sedangkan laman dan `/cv` menggunakan "Full-Stack Developer".
3. **Ejaan nama produk lama.** Di PDF masih tertulis "eMesys, Sutera, and ADIMS", "Onboardx", "9Router Office" dan "Baby Kicking Suite" (laman: EMESYS, SUTERA, ADiMS, ONBOARDX, 9Router AI Office, Baby Kick Tracker).
4. **Emoji dalam baris hubungan** (📍 📞 ✉️ 🌐 🔗 💻) dirender sebagai fon Type3. Sesetengah sistem ATS menghasilkan aksara rosak daripadanya, sedangkan fail ini bertajuk "ATS Resume".

## Perubahan

| Fail | Perubahan |
|------|-----------|
| `build_resume.py` | Tajuk dan ringkasan: "Full-Stack Developer". Jawatan YHCM: "Full-Stack Developer". Emoji dibuang daripada baris hubungan. Ejaan EMESYS, SUTERA, ADiMS, ONBOARDX, 9Router AI Office, Baby Kick Tracker. Pautan projek: label "Portfolio" ke bahagian `/cv` yang betul (TINDAK dan Lumina ke `#projek`, 9Router ke `#project-9router`, Baby Kick ke `#project-babykick`). Suite Computer Vision tiada halaman awam, jadi labelnya "Details on request" tanpa pautan. Senarai sasaran output (termasuk folder Downloads) tidak diubah. |
| `static/resume.pdf` | Dijana semula daripada skrip di atas (683 KB → 301 KB, 2 halaman). |

## Skop

**Disalin daripada `C:\Project\portfolio-staging\029\` (2 fail)**: lihat `MANIFEST.txt`.
**Disunting**: `plans/README.md` (status 029).
**Luar skop**: `generate_docx.py` dan versi `.docx` (tidak dijejak oleh git), `/cv`, bilik 3D. Jangan ubah fail lain. Jangan jalankan `build_resume.py`.

## Aliran kerja git

- Kekal pada `main`. JANGAN cipta cawangan. Satu commit: `fix(resume): selaras PDF dengan laman, pautan projek yang sah dan baris hubungan tanpa emoji`
- Stage eksplisit (Langkah 4). Jangan `git add -A` / `git add .`. Jangan push.
- **Tukar baris 029 dalam `plans/README.md` kepada `DONE` SEBELUM `git add`.**

## Langkah

### Langkah 1: Salin fail daripada staging

```bash
cd /c/Project/portfolio-staging/029
cp --parents build_resume.py static/resume.pdf /c/Project/portfolio/
cd /c/Project/portfolio
n=0; while read h p; do n=$((n+1)); [ "$(git hash-object --no-filters "$p")" = "$h" ] || echo "BEZA $p"; done < /c/Project/portfolio-staging/029/MANIFEST.txt; echo "SALINAN $n fail"
```
**Verify** → tiada baris `BEZA`, `SALINAN 2 fail`.

### Langkah 2: Ujian penuh

```bash
npm run check 2>&1 | tail -1
npm test 2>&1 | grep -E "(pass|fail) [0-9]+"
npm run build 2>&1 | tail -1
cmp build/resume.pdf static/resume.pdf && echo PDF-DALAM-BUILD
```
→ `0 ERRORS 0 WARNINGS`; `pass 50`, `fail 0`; `✔ done`; `PDF-DALAM-BUILD`.

### Langkah 3: Status, stage, sahkan indeks, commit

Tukar baris 029 dalam `plans/README.md` daripada `TODO` kepada `DONE` DAHULU. Kemudian:

```bash
grep "| 029" plans/README.md
git add build_resume.py static/resume.pdf plans/README.md plans/029-resume-pdf-selaras.md
while read h p; do [ "$(git ls-files -s -- "$p" | cut -d' ' -f2)" = "$h" ] || echo "INDEKS BEZA $p"; done < /c/Project/portfolio-staging/029/MANIFEST.txt; echo INDEKS-SELESAI
git diff --cached --stat | tail -1
git commit -m "fix(resume): selaras PDF dengan laman, pautan projek yang sah dan baris hubungan tanpa emoji"
git status --short
```
→ baris 029 berakhir `DONE |`; tiada `INDEKS BEZA`; `INDEKS-SELESAI`; `4 files changed`; selepas commit `git status --short` hanya (mungkin) `?? dev.log`. JANGAN push. BERHENTI dan lapor.

## Kriteria siap

- [ ] 2 fail sepadan dengan manifes (salinan dan indeks)
- [ ] `check` 0 ralat 0 amaran; `npm test` fail 0; build `✔ done`; PDF baharu dalam build
- [ ] Pada `main`; baris 029 = `DONE` dalam commit; satu commit; tiada push

## Syarat STOP

- Pelan 028 belum di-commit, atau semakan drift tidak sepadan.
- Baris `BEZA` atau `INDEKS BEZA` selepas satu cubaan menyalin semula.
- `check`, `npm test` atau build gagal. Jangan ubah fail lain untuk meluluskan ujian.

## Nota susulan (bukan untuk pelan ini)

- `generate_docx.py` / versi Word masih membawa ejaan dan tajuk lama. Jika versi Word digunakan untuk permohonan kerja, selaraskan secara berasingan.
- `build_resume.py` menulis salinan ke folder Downloads pemilik setiap kali dijalankan; itu disengajakan dan dikekalkan.
