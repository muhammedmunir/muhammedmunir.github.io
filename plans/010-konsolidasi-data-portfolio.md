# Plan 010: Buang data mati dalam portfolio-data.ts (menggantikan "konsolidasi data")

## Status

- **DONE** 2026-11-20 oleh perancang (Claude), terus tanpa pelan berlangkah kerana kerja ini mekanikal dan disahkan oleh pengkompil.

## Kenapa pelan asal ditolak

Versi asal (ditulis oleh model sandaran) mencadangkan "sumber tunggal" `projects-source.mjs` untuk menggabungkan data projek yang didakwa bertindih antara `system-state.mjs` dan `portfolio-data.ts`. Semakan terhadap kod sebenar:

| Dakwaan | Fakta |
|---|---|
| `STATIONS.enterprise.hotspots` (ent-emesys, ent-sutera, ent-adims) bertindih dengan `MODULES` | `STATIONS` dirujuk oleh **0 fail**: sisa dunia Fiber Spine yang dibuang dalam Pelan 004. Bukan pertindihan, tetapi data mati. |
| `OCEAN_WEATHER_PRESETS` sebahagian daripada data kandungan | Dirujuk oleh 0 fail: data mati. |
| `DossierStation.ts` "53K baris" | 1,435 baris. |
| `CAREER_TIMELINE` menduplikasi `MODULES` | Konsep berbeza: kerjaya (syarikat dan peranan) berbanding modul projek 3D. Dibiarkan. |

## Apa yang dibuat

Dalam `src/lib/content/portfolio-data.ts` dibuang: `STATIONS`, `OCEAN_WEATHER_PRESETS`, serta jenis yang hanya digunakan olehnya (`HotspotItem`, `SimulationPreset`, `SpineStation`). `StationId` dikekalkan kerana `CareerEntry` dan `ProjectArchiveEntry` menggunakannya. Fail turun daripada 1,777 kepada 675 baris (1,103 baris dibuang).

## Bukti

- `grep -cE "STATIONS|OCEAN_WEATHER|HotspotItem|SimulationPreset|SpineStation" src/lib/content/portfolio-data.ts` → `0`
- `npm run check` → `730 FILES 0 ERRORS 0 WARNINGS`
- `npm test` → `pass 50`, `fail 0`
- `npm run build` → exit 0
- `workbench-smoke.mjs` → `SMOKE OK {"webgl":true,...}` (dua kali)
- `/cv` → HTTP 200, "Muhammed Munir" ×19; `/baby-kick-privacy` → HTTP 200

## Nota penyelenggaraan

- Jika `PROJECT_ARCHIVE` (halaman `/cv`) dan `MODULES` (Workbench) suatu hari perlu dikongsi, gabungkan hanya selepas ada ujian yang membandingkan kedua-dua paparan.
