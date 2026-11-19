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
