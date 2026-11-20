# Pelan Pelaksanaan Portfolio

Dijana oleh skill `improve` pada 2026-11-18, berdasarkan commit `5acfc36` dan
working tree (141 perubahan belum di-commit). Laksanakan mengikut turutan di
bawah melainkan kebergantungan menyatakan sebaliknya. Setiap pelaksana mesti:
membaca pelan sepenuhnya sebelum bermula, mematuhi syarat STOP, dan mengemas
kini baris statusnya apabila selesai.

## Matlamat keseluruhan (keputusan pemilik, 2026-11-18)

Portfolio yang paling unik, memanjakan mata dan profesional untuk pengambil
pekerja dan ketua teknikal. Arah dipilih: **A + B**.

- **A. Satu momen 3D ikonik + kandungan editorial yang jelas.** Dunia 3D
  Workbench (meja jurutera dengan rak homelab, router, konsol) menjadi *hero*
  berbingkai di atas halaman, bukan keseluruhan antara muka. Semua maklumat
  penting boleh dibaca dalam HTML dalam masa 10 saat.
- **B. "Sistem yang hidup".** Projek dipaparkan sebagai rajah seni bina
  interaktif, bukan kad biasa, sebagai bukti kemahiran kejuruteraan sebenar.

## Protokol pelaksanaan untuk C9 (baca dahulu)

Masalah lepas: konsep ditukar ~7 kali, kerja tidak di-commit, ralat disorok.
Untuk mengelakkannya:

0. **Laksanakan terus dalam sesi utama, tanpa subagent dan tanpa worktree.**
   Arahan ini MENGATASI protokol orkestrasi (Atlas/Pixel/Forge/Echo) dalam
   `CLAUDE.md` untuk semua pelan dalam folder ini. Sebab: subagent dengan
   `isolation: worktree` bekerja dalam salinan repo dari commit `5acfc36`; ia
   TIDAK nampak fail yang belum di-commit, dan perubahannya tidak kembali ke
   projek utama. Ini sudah berlaku: Pelan 001 terhenti pada 2026-11-18 kerana
   Atlas berada dalam worktree, dan 7 worktree lama (5–12 Nov) masih
   menyimpan salinan kerja yang tidak pernah kembali.
1. **Satu pelan bagi satu sesi C9.** Mulakan sesi dengan:
   `Baca plans/README.md, kemudian laksanakan plans/00N-....md sahaja, TERUS dalam sesi ini tanpa subagent atau worktree. Patuhi setiap langkah Verify dan syarat STOP.`
2. **Jangan lompat pelan.** Pelan 006 dan 007 akan gagal jika 001–004 belum DONE.
3. **Jangan sekali-kali `git add -A` atau `git add .`** Repo ini AWAM
   (`muhammedmunir.github.io`). Stage fail secara eksplisit seperti yang
   ditulis dalam pelan.
4. **Jangan push.** Pemilik akan menyemak dan push sendiri.
5. **Selepas setiap pelan:** jalankan `/compact`, kemas kini jadual status di
   bawah, dan laporkan bukti (output arahan) kepada pemilik.
6. Jika C9 tersekat pada langkah yang sama dua kali: STOP, tulis sebab dalam
   lajur Status sebagai `BLOCKED: <sebab>`, dan laporkan. Jangan berimprovisasi.
7. **Sunting fail dengan alat Edit, bukan skrip Python/sed/PowerShell.** Alat
   Edit memaparkan diff yang jelas, jadi pemilik dan pengawal *auto mode* boleh
   menyemaknya. Skrip yang menulis teks tersembunyi akan disekat, terutamanya
   untuk `CLAUDE.md` (2026-11-19, Pelan 003). Satu suntingan Edit bagi setiap
   perubahan. Arahan `git mv`/`git rm` dan semakan `grep` masih guna shell.
8. **Jika Python perlu mencetak teks**, jalankan dengan
   `PYTHONIOENCODING=utf-8`. Terminal Windows menggunakan `cp1252` dan gagal
   mencetak aksara seperti `→` dan `·`.
9. **STOP yang berpunca daripada pelan, bukan kod: C9 boleh membetulkannya
   sendiri dengan kelulusan pemilik.** Jika bukti menunjukkan kesilapan ada
   pada arahan Verify atau syarat STOP (contoh: `curl` tanpa `-L` menerima
   308, import relatif yang terlepas, `grep` terkena fail sandaran), dan kod
   itu sendiri betul:
   (a) tunjukkan bukti dalam satu jadual ringkas;
   (b) cadangkan pembetulan MINIMUM pada Verify/STOP sahaja;
   (c) tunggu pemilik membalas `ya`;
   (d) sunting pelan dengan alat Edit, tambah nota `Kemas kini <tarikh>: <sebab>`,
   kemudian sambung.
   DILARANG menggunakan peraturan ini untuk mengubah skop, fail sasaran,
   kandungan undang-undang atau data. Jika pembetulan memerlukan perubahan
   skop, kekal STOP dan laporkan (pemilik akan merujuk perancang).
10. **Jika auto mode menyekat arahan pemadaman** (`git rm`, `rm`), jangan cari
   jalan lain. Senaraikan arahan tepat (satu baris setiap satu) supaya pemilik
   boleh menjalankannya dengan awalan `!`, kemudian tunggu `sambung`.
11. **Pelayan dev (port 5199).** Mulakan dengan `npx vite dev --port 5199 --strictPort`
   sebagai tugas latar C9 sendiri, dan hentikan dengan **Stop Task** pada tugas
   itu. JANGAN guna `Stop-Process`/`taskkill` (auto mode menyekatnya). Jika port
   sudah digunakan dan `curl -s -o /dev/null -w "%{http_code}" http://localhost:5199/`
   memberi `200`, guna pelayan itu terus dan biarkan ia berjalan selepas ujian;
   nyatakan dalam laporan bahawa pelayan itu bukan milik sesi ini.
12. **Skrip Playwright dengan `--enable-unsafe-swiftshader`** (WebGL perisian untuk
   ujian 3D) mesti menolak URL selain `localhost`/`127.0.0.1` sebelum pelayar
   dilancarkan. Contoh: `scripts/workbench-orbit-a11y.mjs`.
13. **C9 TIDAK menulis atau melaksanakan pelan reka bentuk (UI/visual) sendiri.**
   Pelan reka bentuk ditulis dan diuji oleh perancang (Claude). Selepas satu pelan
   DONE, jika pelan seterusnya berstatus `Belum ditulis`, atau fail pelannya tiada,
   BERHENTI. Laporan akhir mesti berbunyi: "Pelan 0NN siap. Hantar laporan ini
   kepada Claude untuk semakan dan pelan seterusnya." JANGAN menulis pelan itu
   atau mengubah kod untuknya. (Sebab: 2026-11-20 C9 menulis sendiri pelan 013
   dengan model sandaran; hasilnya 6 ralat jenis dan tajuk halaman rosak. Draf
   diarkib di `.crew/artifacts/013-draf-c9/`.)

## Turutan pelaksanaan & status

| Plan | Tajuk | Keutamaan | Usaha | Bergantung pada | Status |
|------|-------|-----------|-------|-----------------|--------|
| 001 | Simpan kerja Workbench dalam git dengan selamat | P1 | S | — | DONE |
| 002 | Baiki dunia 3D halaman utama yang rosak & ralat yang disorok | P1 | S | 001 | DONE |
| 003 | Tetapkan satu arah reka bentuk (DESIGN.md, CLAUDE.md, README) | P1 | S | 001 | DONE |
| 004 | Buang kod mati Fiber Spine & sisa prototaip | P2 | M | 001, 002 | DONE |
| 005 | Pulihkan halaman dasar privasi Baby Kick Tracker | P1 | S | 001 | DONE |
| 006 | Arah A: hero 3D berbingkai + kandungan editorial | P2 | L | 002, 003, 004 | DONE |
| 007 | Arah B: rajah seni bina projek interaktif | P2 | L | 003, 004 | DONE |
| 008 | Pecah WorkbenchWorld.ts kepada modul berasingan | P1 | L | 006, 007 | REJECTED: premis salah (fail 2,758 baris, bukan 111K); risiko tinggi tanpa nilai kepada pelawat. Draf diarkib di `.crew/artifacts/008-draf-modul/`. |
| 009 | Ujian unit untuk WorkbenchWorld (characterization tests) | P0 | M | 006, 007 | DONE |
| 010 | Buang data mati dalam portfolio-data.ts (STATIONS, OCEAN_WEATHER_PRESETS) | P1 | S | 004 | DONE (premis asal salah; lihat fail pelan) |
| 011 | Putaran kamera tanpa seret (WCAG 2.5.7), pautan langkau ke Sistem, pembetulan telefon | P1 | S | 006, 007 | DONE |
| 012 | Hero: gambar diri, kenyataan nilai, fakta daripada data sebenar | P1 | S | 011 | DONE |
| 013 | Sistem sebagai kajian kes: panel identiti projek, tanpa tangkapan skrin | P1 | S | 012 | DONE |
| 014 | Garis masa kerjaya visual | P2 | S | 012 | Belum ditulis |
| 015 | Kemahiran dan sijil dikaitkan dengan projek | P2 | S | 012 | Belum ditulis |

Nilai status: TODO | IN PROGRESS | DONE | BLOCKED (dengan sebab satu baris) | REJECTED (dengan rasional satu baris)

## Nota kebergantungan

- 001 mesti dahulu: `src/lib/workbench/` (halaman utama, 9,622 baris) belum pernah di-commit. Sebarang kerja lain tanpa titik selamat berisiko memusnahkannya.
- 002 sebelum 004 dan 006: halaman utama kini menunjukkan "WebGL tidak tersedia" kepada semua pelawat kerana `ReferenceError`. Ujian visual tidak bermakna selagi ini rosak.
- 003 sebelum 006 dan 007: tiga dokumen reka bentuk kini bercanggah; C9 perlu satu sumber kebenaran.
- 004 sebelum 006 dan 007: membuang 7,800+ baris kod mati mengurangkan kekeliruan dan memindahkan fail data ke lokasi tetap yang dirujuk oleh 006/007.
- 005 bebas; boleh dibuat bila-bila selepas 001.
- Deploy: CI (`.github/workflows/deploy.yml`) menjalankan `npm run check`. Selagi 002 belum DONE, push ke `main` akan GAGAL deploy.
- **009 (ujian unit) mesti sebelum 008 (refactor)** — "characterization tests first" untuk mengunci tingkah laku WorkbenchWorld sebelum pecah modul.
- 010 (konsolidasi data) boleh berjalan selari dengan 008/009 — tidak bergantung pada refactor WorkbenchWorld.
- 011 (aksesibiliti) boleh berjalan selari — hanya menambah handler input & ARIA, tidak ubah struktur data.

## Keputusan pemilik yang belum dibuat (bukan pelan)

- `SISTEM PINJAMAN BERCAGAR IWA001.pdf` dan `LANDING PAGE COMPANY.pdf` di root sudah dijejak dalam repo AWAM. Jika ia dokumen klien atau sulit, buang daripada repo (dan pertimbangkan sejarah git). Pemilik perlu memutuskan; tiada pelan ditulis.
- `Resume ATS Muhammed Munir final.docx` juga dijejak dalam repo awam; `static/resume.pdf` sudah menjadi versi awam yang sah.

## Dapatan dipertimbangkan dan ditolak

- Membina semula dunia 3D dari sifar dengan konsep baharu: ditolak. Workbench (9,622 baris) sudah bertema rangkaian/homelab yang sesuai; masalahnya pepijat dan peranan 3D, bukan konsep.
- Audit keselamatan aplikasi: ditolak untuk kali ini. Laman statik tanpa backend; borang hubungan guna Web3Forms.
- **Memecahkan `WorkbenchWorld.ts` (111K baris) kepada modul: dijadualkan sebagai Plan 008 & 009.** Plan 009 (ujian unit) mesti selesai dahulu sebagai "characterization tests" sebelum Plan 008 (refactor modular).
