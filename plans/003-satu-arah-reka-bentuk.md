# Plan 003: Satu arah reka bentuk sahaja: DESIGN.md menjadi sumber tunggal, dan dokumen bercanggah diarkibkan

> **Arahan pelaksana**: Ikut pelan ini langkah demi langkah. Jalankan setiap
> arahan Verify dan sahkan hasil yang dijangka sebelum ke langkah seterusnya.
> Jika mana-mana syarat STOP berlaku, berhenti dan lapor; jangan
> berimprovisasi. Apabila selesai, kemas kini baris status pelan ini dalam
> `plans/README.md`.
>
> **Semakan drift (jalankan dahulu)**: `git ls-files DESIGN.md CLAUDE.md PELAN.md TODO.md README.md | wc -l` → `5` (Pelan 001 mesti DONE). Jika bukan 5, STOP.

## Status

- **Keutamaan**: P1
- **Usaha**: S
- **Risiko**: LOW (dokumen sahaja, tiada kod)
- **Bergantung pada**: plans/001-simpan-kerja-workbench-dalam-git.md
- **Kategori**: docs
- **Dirancang pada**: commit `5acfc36` + working tree, 2026-11-18

## Kenapa ini penting

Punca utama masalah portfolio ini ialah arah yang sentiasa berubah. `git log`
menunjukkan konsep ditukar sekurang-kurangnya 7 kali (JARVIS HUD → Neural
Mission Control → Bioluminescent Neural Cortex → Neural Cortex 3D → Spatial →
Fiber Spine Archipelago → Workbench). Hari ini tiga dokumen masih memberi
arahan bercanggah kepada agen AI:

- `DESIGN.md`: portfolio editorial 2D, "zero empty 3D rooms", palet biru `#0a0f1a` / `#38bdf8`.
- `CLAUDE.md`: "DILARANG SAMA SEKALI" membuang Workbench 3D; palet monokrom `#09090b`.
- `PELAN.md` dan `TODO.md`: "The Living Fiber Spine", dunia 3D yang kini sudah mati.

Pemilik telah memilih arah **A + B** pada 2026-11-18 (lihat "Keputusan yang
ditetapkan"). Selepas pelan ini, hanya ada satu dokumen reka bentuk, dan semua
pelan seterusnya (006, 007) merujuk kepadanya.

## Keputusan yang ditetapkan (oleh pemilik; jangan ubah)

- **A.** Dunia 3D Workbench kekal, tetapi sebagai **hero berbingkai** (pentas
  terhad ketinggian) di bahagian atas halaman utama. Identiti (nama, peranan,
  nilai) dan semua kandungan penting dalam **HTML** yang boleh dibaca dalam 10
  saat, tanpa bergantung pada teks dalam tekstur 3D.
- **B.** Projek dipaparkan sebagai **rajah seni bina interaktif**.
- Palet = token `--work-*` yang SUDAH digunakan dalam `src/routes/layout.css` (lihat di bawah). Tiada palet baharu.
- Fon = Syne (paparan) + Plus Jakarta Sans (badan), sudah dimuatkan dalam `src/app.html`.

Token sebenar dalam `src/routes/layout.css` (tema gelap, baris 7–15) yang mesti
didokumenkan:
```css
--work-paper: #09090b;
--work-surface: #121215;
--work-surface-hover: #27272a;
--work-ink: #f4f4f5;
--work-muted: #b4b4bd;
--work-accent: #e5b580;
--work-line: #3f3f46;
```
Tema cerah bermula sekitar baris 86 (`--work-paper: #eceff3; --work-surface: #ffffff; ...`). Baca nilai tema cerah terus daripada fail dan salin ke DESIGN.md.

## Arahan yang diperlukan

| Tujuan | Arahan | Dijangka |
|---|---|---|
| Baca token cerah | `grep -nE "^\s*--work-" src/routes/layout.css` | senarai token |
| Semak tiada kod berubah | `git diff --stat -- src scripts static` | kosong |

## Skop

**Dalam skop**:
- `DESIGN.md` (tulis semula)
- `CLAUDE.md` (edit bahagian yang disebut sahaja)
- `README.md` (tulis semula)
- `PELAN.md`, `TODO.md` → pindah ke `docs/archive/` dengan `git mv`
- `docs/archive/README.md` (cipta)

**Luar skop**:
- Semua fail di bawah `src/`, `scripts/`, `static/`. Pelan ini dokumen sahaja.
- `CHANGELOG.md`: kekalkan apa adanya.

## Aliran kerja git

- Satu commit pada akhir: stage eksplisit `git add DESIGN.md CLAUDE.md README.md docs/archive` (git mv sudah stage pemindahan).
- Mesej: `docs: tetapkan satu arah reka bentuk (hero 3D berbingkai + rajah seni bina) dan arkibkan pelan Fiber Spine`
- Jangan push.

## Langkah

### Langkah 1: Arkibkan PELAN.md dan TODO.md

```bash
mkdir -p docs/archive
git mv PELAN.md docs/archive/PELAN-fiber-spine-2026-10.md
git mv TODO.md docs/archive/TODO-fiber-spine-2026-10.md
```
Cipta `docs/archive/README.md`:
```markdown
# Arkib

Dokumen di sini menerangkan konsep lama yang TIDAK lagi digunakan.
Jangan laksanakan apa-apa daripada fail ini. Arah semasa: `DESIGN.md` di root.

- `PELAN-fiber-spine-2026-10.md`, `TODO-fiber-spine-2026-10.md`: konsep "The Living Fiber Spine" (dunia 3D skrin penuh), digantikan oleh Workbench pada 2026-11.
```
**Verify**: `ls PELAN.md TODO.md 2>&1 | grep -c "No such file"` → `2`; `ls docs/archive | wc -l` → `3`.

### Langkah 2: Tulis semula `DESIGN.md`

Gantikan SELURUH kandungan `DESIGN.md` dengan templat di bawah. Isi `<tema cerah>` dengan nilai `--work-*` tema cerah sebenar dari `src/routes/layout.css` (Langkah "Baca token cerah"). Jangan cipta nilai baharu.

```markdown
# DESIGN.md: Portfolio Muhammed Munir (sumber tunggal reka bentuk)

Dokumen ini satu-satunya rujukan reka bentuk. Jika dokumen lain bercanggah, dokumen ini menang.
Dokumen lama diarkibkan dalam `docs/archive/`.

## Audiens & ujian 10 saat

Pengambil pekerja, ketua teknikal dan pengurus kejuruteraan. Dalam 10 saat pertama tanpa skrol atau interaksi, pelawat MESTI dapat membaca:
1. Nama: Muhammed Munir.
2. Peranan: Full-Stack Developer • Keselamatan Rangkaian.
3. Bukti: sistem sektor awam yang disenggara (YHCM) dan projek yang dibina.
4. Tindakan: Resume PDF dan Hubungi.

## Konsep: "Meja Jurutera Sistem"

1. **Hero berbingkai (Arah A).** Identiti dalam HTML di atas, kemudian dunia 3D Workbench sebagai pentas terhad ketinggian (desktop `min(72svh, 720px)`, mudah alih `56svh`). Dunia 3D ialah identiti visual dan alat penerokaan, BUKAN satu-satunya cara membaca kandungan.
2. **Sistem (Arah B).** Setiap projek dipaparkan sebagai rajah seni bina interaktif (nod komponen dan aliran data), bukan kad biasa.
3. **Editorial.** Profil, Perjalanan kerjaya, Kemahiran dan Sijil dalam HTML penuh di bawah hero. Versi penuh di `/cv`.

## Token (dari `src/routes/layout.css`; jangan tambah palet baharu)

| Token | Gelap | Cerah |
|---|---|---|
| `--work-paper` | `#09090b` | <tema cerah> |
| `--work-surface` | `#121215` | <tema cerah> |
| `--work-surface-hover` | `#27272a` | <tema cerah> |
| `--work-ink` | `#f4f4f5` | <tema cerah> |
| `--work-muted` | `#b4b4bd` | <tema cerah> |
| `--work-accent` | `#e5b580` | <tema cerah> |
| `--work-line` | `#3f3f46` | <tema cerah> |

Satu aksen sahaja: `--work-accent` (amber hangat), hanya untuk tindakan utama, keadaan aktif dan aliran data dalam rajah.

## Tipografi

- Paparan: `Syne` (`--font-heading`). Nama dalam hero sekurang-kurangnya 2.5x saiz badan.
- Badan & UI: `Plus Jakarta Sans` (`--font-body`).
- Kod, ID sistem dan telemetri: monospace sistem.

## Larangan (antislop)

- Tiada gradien biru/ungu, orb kabur, cahaya neon bertaburan.
- Tiada butang berbentuk pil; jejari 6–8px.
- Tiada bayang terapung kabur; guna sempadan 1px `--work-line`.
- Kaca/blur maksimum 1 elemen.
- Tiada teks penting yang hanya wujud dalam tekstur 3D.
- Tiada emoji dalam UI. Tiada nombor atau metrik rekaan.

## Kerahsiaan

EMESYS, SUTERA dan ADiMS ialah sistem dalaman agensi kerajaan dengan kod sulit. Rajah seni bina untuk sistem ini mesti umum (lapisan, peranan, aliran) tanpa nama jadual, endpoint, IP, nama pelayan atau butiran keselamatan dalaman.

## Penerimaan

- WCAG 2.2 AA kontras untuk kedua-dua tema (`npm run test:contrast`).
- Responsif pada 390px dan 1440px, tanpa limpahan mendatar; sasaran sentuh ≥44px; `:focus-visible` jelas; navigasi papan kekunci penuh.
- `prefers-reduced-motion` dihormati: tiada animasi bergerak; dunia 3D statik.
- Dunia 3D berhenti render apabila di luar skrin.
- Bukti visual setiap perubahan UI: tangkapan Playwright 390px dan 1440px.
```
**Verify**: `grep -c "<tema cerah>" DESIGN.md` → `0`; `grep -c "#0a0f1a\|#38bdf8" DESIGN.md` → `0`; `grep -c "Meja Jurutera Sistem" DESIGN.md` → `1`.

### Langkah 3: Selaraskan `CLAUDE.md`

Buat TIGA suntingan sahaja:

1. Dalam bahagian "Pemetaan Model & Peranan", gantikan setiap baris `*Model Primer*:` dengan pemetaan semasa 9Router:
   - Orchestrator, Atlas, Pixel, Forge: `*Model Primer*: combo Opus/Sonnet 9Router (GPT-6.2 Astra → Gemini 4 Hydrogen Thinking → Gemini 4 Hydrogen).`
   - Echo: `*Model Primer*: combo Haiku 9Router (model percuma Kilo/OpenRouter → Gemini 3.8 Flash).`
   **Verify**: `grep -c "gemini-carbon\|claude-sonnet-4-6\|gpt-6-astra\`" CLAUDE.md` → `0`.
2. Gantikan keseluruhan perkara `1. **KEKALKAN DUNIA 3D WORKBENCH (Three.js)**: ...` dalam "Pantang Larang Rekaan" dengan:
   `1. **IKUT DESIGN.md**: Arah reka bentuk ditetapkan dalam DESIGN.md (hero 3D Workbench berbingkai + identiti & kandungan HTML + rajah seni bina projek). Jangan tukar konsep, jangan cipta dunia 3D baharu, dan jangan buang Workbench tanpa arahan pemilik.`
   **Verify**: `grep -c "IKUT DESIGN.md" CLAUDE.md` → `1`.
3. Dalam perkara 3 "DILARANG Visual Slop", gantikan nilai warna yang ditulis secara literal (`#09090b`, `#121215`, `#27272a`, `#f4f4f5`, `#a1a1aa`) dengan frasa: `gunakan token --work-* dalam DESIGN.md`.
   **Verify**: `grep -c "#a1a1aa" CLAUDE.md` → `0`.
4. Selepas blok rajah aliran orkestrasi (yang berakhir dengan `[PENYERAHAN ORKESTRATOR] ➔ ...` dan penutup ```` ``` ````), tambah perenggan:
   `**Pengecualian:** Pelan dalam folder plans/ dilaksanakan TERUS dalam sesi utama, tanpa subagent. Jangan sekali-kali guna subagent dengan isolation worktree untuk mengubah projek ini; worktree tidak nampak perubahan belum di-commit dan suntingannya tidak kembali ke projek utama.`
   **Verify**: `grep -c "Pengecualian:\*\* Pelan dalam folder plans/" CLAUDE.md` → `1`.

### Langkah 4: Tulis semula `README.md`

README semasa menerangkan ciri yang sudah tiada (JARVIS HUD, permainan RPG, City Explorer, Presentation Mode). Gantikan seluruh kandungan dengan:
```markdown
# Portfolio Muhammed Munir

Portfolio peribadi: SvelteKit 5, Tailwind 4, Three.js dan GSAP, di-deploy sebagai laman statik ke GitHub Pages (`https://muhammedmunir.github.io`).

- `/`: hero identiti + dunia 3D Workbench + kandungan editorial
- `/cv`: resume penuh dalam HTML
- `/baby-kick-privacy`: dasar privasi aplikasi Baby Kick Tracker

Arah reka bentuk: `DESIGN.md`. Pelan kerja: `plans/README.md`.

## Pembangunan

Node.js 24 LTS.

    npm install
    npm run dev          # pelayan pembangunan
    npm run check        # semakan jenis (mesti 0 ralat; CI deploy bergantung padanya)
    npm test             # ujian unit
    npm run build        # binaan statik ke build/

Ujian pelayar (perlukan pelayan dev):

    WORKBENCH_URL=http://localhost:5173/ node scripts/workbench-smoke.mjs
```
Nota: jika Pelan 005 belum DONE, kekalkan baris `/baby-kick-privacy` kerana pelan itu akan mencipta route tersebut.

**Verify**: `grep -ciE "jarvis|rpg|city explorer" README.md` → `0`.

### Langkah 5: Commit

```bash
git add DESIGN.md CLAUDE.md README.md docs/archive
git status --short
git commit -m "docs: tetapkan satu arah reka bentuk (hero 3D berbingkai + rajah seni bina) dan arkibkan pelan Fiber Spine"
```
**Verify**: `git status --short` → kosong; `git diff --stat HEAD~1 -- src scripts static` → kosong.

## Pelan ujian

Dokumen sahaja. `npm run check` dan `npm test` mesti kekal sama seperti sebelum pelan ini.

## Kriteria siap

- [ ] `PELAN.md` dan `TODO.md` tiada di root; ada dalam `docs/archive/`
- [ ] `grep -c "<tema cerah>\|#0a0f1a\|#38bdf8" DESIGN.md` → `0`
- [ ] `grep -c "gemini-carbon\|claude-sonnet-4-6" CLAUDE.md` → `0`
- [ ] `grep -ciE "jarvis|rpg" README.md` → `0`
- [ ] `git diff --stat HEAD~1 -- src scripts static` → kosong
- [ ] Baris 003 dalam `plans/README.md` → `DONE`

## Syarat STOP

- Token `--work-*` tema cerah tidak ditemui dalam `src/routes/layout.css`.
- `CLAUDE.md` tidak mempunyai bahagian "Pemetaan Model & Peranan" atau "Pantang Larang Rekaan".
- Anda rasa perlu mengubah keputusan reka bentuk yang ditetapkan. Itu keputusan pemilik; lapor sahaja.

## Nota penyelenggaraan

- Mana-mana dokumen arah baharu mesti mengemas kini DESIGN.md, bukan mencipta fail baharu di root.
- Jika palet diubah kelak, ubah `src/routes/layout.css` dan jadual token DESIGN.md dalam commit yang sama.
