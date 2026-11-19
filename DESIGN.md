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
| `--work-paper` | `#09090b` | `#eceff3` |
| `--work-surface` | `#121215` | `#ffffff` |
| `--work-surface-hover` | `#27272a` | `#f4f7fa` |
| `--work-ink` | `#f4f4f5` | `#0f172a` |
| `--work-muted` | `#b4b4bd` | `#475569` |
| `--work-accent` | `#e5b580` | `#1848bd` |
| `--work-line` | `#3f3f46` | `#cbd5e1` |

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
