# Personal Portfolio Website

Laman web ini adalah sebuah portfolio peribadi premium yang dibina menggunakan [SvelteKit](https://kit.svelte.dev/) dan TailwindCSS. Ia direka bentuk secara dinamik dengan pelbagai mod interaktif yang unik.

## Ciri-ciri Utama

- **J.A.R.V.I.S Neural HUD Assistant**: Pembantu kecerdasan buatan interaktif berasaskan Web Audio API (kesan bunyi sci-fi tanpa kebergantungan luar), arahan pantas, dan sokongan sintesis suara (_speech synthesis_).
- **Bilingual Support (BM/EN)**: Sokongan penuh dwibahasa reaktif (Bahasa Melayu & English) dengan penyelarasan automatik `lang` dokumen dan `localStorage`.
- **Dossier Resume ATS Langsung**: Akses muat turun pantas bagi resume PDF format ATS di bahagian Hero, Navbar, dan HUD.
- **Showcase Projek Pengeluaran & AI**: Menampilkan projek sebenar berskala tinggi — TINDAK (AI Android Action Engine), Computer Vision & Win32 Bot, Lumina Glass Studio & Smart Mirror Visualizer, IWA001 (Sistem Pinjaman Bercagar Supabase RLS), dan sistem perusahaan YHCM & TNB.
- **Cyberpunk RPG Explorer Game**: Permainan RPG berkonsepkan kapal angkasa Cyberpunk dengan grafik interaktif, navigasi bilik, dan kesan bunyi audio dinamik.
- **2.5D City Explorer Route**: Antara muka penerokaan bandar isometrik interaktif (Canvas) dengan kawalan WASD dan kayu ria (_touch joystick_) mudah alih.
- **Presentation Mode**: Mod persembahan slaid korporat untuk memaparkan senibina teknikal semasa temuduga.
- **Web3Forms Secure Integration**: Borang hubungan yang diperkukuh dengan validasi JavaScript dan perlindungan _honeypot_ anti-bot.
- **Responsif Sepenuhnya**: Reka letak yang dioptimumkan untuk desktop, tablet, dan telefon pintar.

## Pembangunan

Setelah memuat turun projek ini dan memasang semua pakej keperluan menggunakan `npm install` (atau `pnpm install` / `yarn`), mulakan pelayan pembangunan tempatan (development server):

```sh
npm run dev

# atau mulakan pelayan dan buka laman web secara terus di pelayar
npm run dev -- --open
```

## Pengesahan

Gunakan Node.js 24 LTS; ujian TypeScript menggunakan pelari terbina dalam `node:test`:

```sh
npm run check
npm test
npm run test:contrast
```

`npm test` menyelaraskan fail terjana SvelteKit dan menjalankan hanya `scripts/*.test.mjs`, bukan salinan dalam `.claude/worktrees`. Jangan gunakan `npx vitest run`: ujian ini bukan suite Vitest. `scripts/glass-contrast.mjs` ialah pustaka utiliti, bukan arahan ujian kendiri.

Ujian unit dan kontras token tidak membuktikan kontras piksel WebGL, keadaan visual, axe, saiz sasaran terpapar, limpahan atau responsiviti sebenar.

Untuk regresi render monitor, jalankan `npm run dev` dalam terminal berasingan, kemudian:

```sh
npx playwright install chromium
npm run test:screen
```

`SPINE_URL` boleh menggantikan URL lalai `http://127.0.0.1:5173/`. Ujian ini memerlukan pelayan pembangunan Vite dan Chromium; browser yang tiada menyebabkan kegagalan, bukan keputusan lulus. Bukti PNG dan ukuran disimpan dalam `.crew/artifacts/monitor-glare/`.

## Pembinaan (Building)

Untuk memulakan versi pengeluaran (production) aplikasi anda, jalankan perintah berikut:

```sh
npm run build
```

Anda boleh melihat pratonton binaan pengeluaran menggunakan `npm run preview`.
