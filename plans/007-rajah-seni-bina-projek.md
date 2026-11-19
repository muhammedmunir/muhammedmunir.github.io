# Plan 007: Projek dipaparkan sebagai rajah seni bina interaktif yang dijana daripada data sebenar

> **Arahan pelaksana**: Ikut pelan ini langkah demi langkah. Jalankan setiap
> arahan Verify dan sahkan hasil yang dijangka sebelum ke langkah seterusnya.
> Jika mana-mana syarat STOP berlaku, berhenti dan lapor; jangan
> berimprovisasi. Apabila selesai, kemas kini baris status pelan ini dalam
> `plans/README.md`.
>
> **Semakan drift (jalankan dahulu)**: Pelan 003 dan 004 mesti DONE (Pelan 006 disyorkan).
> `node -e "import('./src/lib/workbench/system-state.mjs').then(m=>console.log(m.MODULES.length))"` → `8`.
> `grep -c "Kerahsiaan" DESIGN.md` → `1`. Jika gagal, STOP.

## Status

- **Keutamaan**: P2
- **Usaha**: L (5 langkah)
- **Risiko**: MED (komponen baharu; data sulit kerajaan mesti kekal umum)
- **Bergantung pada**: plans/003, plans/004 (plans/006 disyorkan dahulu)
- **Kategori**: direction
- **Dirancang pada**: commit `5acfc36` + working tree, 2026-11-18

## Kenapa ini penting

Hampir semua portfolio memaparkan projek sebagai kad bergambar. Pembeza
pemilik ialah kejuruteraan sistem sebenar: sistem sektor awam, RBAC, pangkalan
data dan infrastruktur. Rajah seni bina interaktif (lapisan Klien → Perkhidmatan
→ Data, dengan Keselamatan dan Infrastruktur) membuktikan kemahiran itu secara
visual kepada ketua teknikal, dan jarang ditemui pada portfolio lain. Rajah
**dijana daripada data `stack` yang sudah ada**, jadi tiada fakta direka, dan
ujian menjamin setiap teknologi dipetakan.

## Keadaan semasa

- `src/lib/workbench/system-state.mjs` mengeksport `MODULES` (8 projek). Medan setiap modul:
  `id, code, category ('maintained'|'built'), categoryLabel{ms,en}, name, company, badge, badgeEn, accent, accessType, accessLabel, accessLabelEn, role, roleEn, stack: string[], dataArchitecture, dataArchitectureEn, securityAccess, securityAccessEn`.
- Senarai `stack` sebenar (2026-11-18):
  ```
  emesys    maintained restricted       ["Vue.js 3","Laravel Filament","MySQL / MariaDB","Docker"]
  sutera    maintained restricted       ["Vue.js 3","Laravel Filament","PostgreSQL 17","Docker Swarm"]
  adims     maintained restricted       ["Vue.js 3","Laravel API","PostgreSQL 17","Linux Server"]
  onboardx  built      private_corp     ["Flutter (Dart)","JavaScript","Azure Ubuntu","Jenkins CI/CD"]
  iwa001    built      case_study       ["SvelteKit","TypeScript","Supabase RLS","JWT Auth"]
  infinity  built      live_and_doc     ["SvelteKit","Redis","Resend API","Cloudflare WAF"]
  9router   built      visual_showcase  ["Three.js","Node.js 22+","Model Context Protocol","Playwright MCP"]
  babykick  built      visual_showcase  ["Flutter (Dart)","Firebase Firestore","Cloud Functions","Eksport PDF"]
  ```
- `DESIGN.md` bahagian "Kerahsiaan": EMESYS, SUTERA dan ADiMS (`accessType: 'restricted'`) mesti umum: tiada nama jadual, endpoint, IP, nama pelayan atau butiran keselamatan dalaman. Rajah HANYA boleh memaparkan item `stack` dan teks `dataArchitecture`/`securityAccess` yang sudah ditulis pemilik.
- Konvensyen ujian: `scripts/workbench.test.mjs` mengimport terus dari `../src/lib/workbench/system-state.mjs` dengan `node:test` dan `node:assert/strict`. Ikut corak ini (fail `.mjs` supaya boleh diuji tanpa binaan).
- Pelan 006 meninggalkan penanda `<!-- Pelan 007: SystemsSection -->` dalam `src/lib/workbench/Workbench.svelte` (selepas `</main>`), dan pautan hero "Lihat sistem" menunjuk ke `#sistem`. Jika 006 belum DONE, letakkan bahagian selepas `</main>` dan sebelum `<footer>`.

## Arahan yang diperlukan

| Tujuan | Arahan | Dijangka |
|---|---|---|
| Ujian unit baharu | `node --test scripts/architecture.test.mjs` | semua lulus |
| Semua ujian | `npm test` | 0 gagal |
| Semak jenis | `npm run check` | `0 ERRORS 0 WARNINGS` |
| Kontras | `npm run test:contrast` | lulus |
| Pelayan dev | `npx vite dev --port 5199 --strictPort &` | HTTP 200 |

## Kit alat pelaksana yang dicadangkan

- Skill `antislop-ui` dan `better-accessibility` (rajah mesti boleh digunakan dengan papan kekunci dan pembaca skrin).
- Skill `artifact-diagramming` jika tersedia, untuk prinsip rajah SVG yang jelas.

## Skop

**Dalam skop**:
- `src/lib/content/architecture.mjs` (cipta): pengelas lapisan, fungsi tulen
- `scripts/architecture.test.mjs` (cipta)
- `src/lib/workbench/ArchitectureDiagram.svelte` (cipta)
- `src/lib/workbench/SystemsSection.svelte` (cipta)
- `src/lib/workbench/Workbench.svelte`: ganti penanda dengan `<SystemsSection {locale} />` sahaja

**Luar skop**:
- `system-state.mjs`: JANGAN tambah atau ubah data projek. Rajah dijana daripada data sedia ada.
- Dunia 3D (`WorkbenchWorld.ts`), `/cv`, token global.
- Jangan tambah butiran teknikal yang tiada dalam `stack`, `dataArchitecture` atau `securityAccess`.

## Aliran kerja git

- Cawangan: `git switch -c feat/rajah-seni-bina` (dari cawangan Pelan 006 jika sudah wujud).
- Commit per langkah, stage eksplisit. Contoh: `feat(sistem): tambah pengelas lapisan seni bina dengan ujian`.
- Jangan push.

## Langkah

### Langkah 1: Pengelas lapisan (fungsi tulen) + ujian

Cipta `src/lib/content/architecture.mjs`:
```js
export const LAYERS = Object.freeze([
  { id: 'client',   label: { ms: 'Klien',          en: 'Client' } },
  { id: 'service',  label: { ms: 'Perkhidmatan',   en: 'Services' } },
  { id: 'data',     label: { ms: 'Data',           en: 'Data' } },
  { id: 'security', label: { ms: 'Keselamatan',    en: 'Security' } },
  { id: 'infra',    label: { ms: 'Infrastruktur',  en: 'Infrastructure' } }
]);

// Setiap item stack sebenar mesti dipetakan di sini. Bahasa pengaturcaraan dipaparkan sebagai tag, bukan nod.
const RULES = [
  ['client',   /^(Vue\.js|SvelteKit|Flutter|Three\.js)/i],
  ['service',  /^(Laravel|Node\.js|Model Context Protocol|Playwright MCP|Cloud Functions|Resend API|Eksport PDF)/i],
  ['data',     /^(MySQL|PostgreSQL|Supabase|Redis|Firebase)/i],
  ['security', /^(JWT|Cloudflare WAF)/i],
  ['infra',    /^(Docker|Linux Server|Azure|Jenkins)/i],
  ['language', /^(JavaScript|TypeScript)$/i]
];

export function classify(item) {
  for (const [layer, re] of RULES) if (re.test(item)) return layer;
  return 'unknown';
}

export function buildArchitecture(module) {
  const nodes = module.stack.map((label) => ({ label, layer: classify(label) }));
  const present = new Set(nodes.map((n) => n.layer));
  // Lapisan keselamatan sentiasa wujud kerana setiap projek mempunyai teks securityAccess.
  present.add('security');
  const order = ['client', 'service', 'data'].filter((l) => present.has(l));
  const flows = order.slice(1).map((to, i) => ({ from: order[i], to }));
  return {
    id: module.id,
    restricted: module.accessType === 'restricted',
    layers: LAYERS.filter((l) => present.has(l.id)),
    nodes: nodes.filter((n) => n.layer !== 'language'),
    tags: nodes.filter((n) => n.layer === 'language').map((n) => n.label),
    flows
  };
}
```
Cipta `scripts/architecture.test.mjs` (corak `scripts/workbench.test.mjs`) dengan ujian:
1. Setiap item `stack` dalam SEMUA `MODULES` diklasifikasikan (`classify(item) !== 'unknown'`). Mesej kegagalan mesti menamakan item yang gagal.
2. Setiap modul menghasilkan sekurang-kurangnya 2 lapisan dan sekurang-kurangnya 1 nod.
3. `buildArchitecture` untuk `emesys`, `sutera`, `adims` → `restricted === true`; yang lain → `false`.
4. Label setiap nod sama tepat dengan item dalam `stack` asal (tiada teks direka): `nodes.every(n => module.stack.includes(n.label))`.
5. `flows` hanya menghubungkan lapisan yang wujud.

**Verify**: `node --test scripts/architecture.test.mjs` → semua lulus; `npm test` → 0 gagal.

### Langkah 2: Komponen `ArchitectureDiagram.svelte` (SVG boleh diakses)

Props: `{ module, locale }`. Guna `buildArchitecture(module)`.
- Paparan: lajur bagi setiap lapisan (`layers`), tajuk lajur = `label[locale]`, nod sebagai `<button type="button">` (bukan `<rect>` yang tidak boleh difokus) yang diletakkan dalam grid CSS. Garis aliran `flows` dilukis dengan satu `<svg>` lapisan belakang (`aria-hidden="true"`), warna `--work-accent`, garis 1.5px.
- Animasi aliran: titik kecil bergerak sepanjang garis aliran, menggunakan CSS `@keyframes` (tiada GSAP). Bungkus dalam `@media (prefers-reduced-motion: no-preference)`. Di bawah reduced-motion, tiada pergerakan.
- Klik/Enter pada nod → panel penerangan di sebelah (desktop) atau di bawah (mudah alih) menunjukkan: lapisan, nama teknologi, dan teks sebenar `dataArchitecture`/`dataArchitectureEn` (untuk nod lapisan data) atau `securityAccess`/`securityAccessEn` (untuk lapisan keselamatan). Untuk lapisan lain, tunjuk `role`/`roleEn`.
- Jika `restricted`, paparkan nota tetap: `{locale === 'en' ? 'Confidential government system: generic architecture only.' : 'Sistem kerajaan sulit: seni bina umum sahaja.'}`.
- Tags bahasa (`tags`) dipapar sebagai teks kecil `--work-muted` di bawah rajah.
- `role="group"` dengan `aria-label` = nama projek + "seni bina"/"architecture".
- Jejari 6px, sempadan 1px `--work-line`, nod aktif bersempadan `--work-accent`. Tiada bayang, tiada glow.

**Verify**: `npm run check` → `0 ERRORS`.

### Langkah 3: Bahagian `SystemsSection.svelte`

Props: `{ locale }`. Import `MAINTAINED_MODULES, BUILT_MODULES` dari `$lib/workbench/system-state.mjs`.
- `<section id="sistem" aria-labelledby="sistem-heading">` dengan `<h2 id="sistem-heading">`: `Sistem yang dibina & disenggara` / `Systems built & maintained`.
- Dua kumpulan berlabel (`categoryLabel[locale]`), setiap satu senarai butang projek (`code · name`) yang memilih projek aktif (`aria-pressed`). Projek awal = modul pertama `BUILT_MODULES`.
- Paparkan `<ArchitectureDiagram module={aktif} {locale} />` dan baris ringkas: `company` · `role`/`roleEn` · `badge`/`badgeEn`.
- Papan kekunci: anak panah kiri/kanan bergerak antara butang projek dalam kumpulan (pilihan; jika dibuat, ikut corak roving tabindex).

Dalam `Workbench.svelte`, ganti `<!-- Pelan 007: SystemsSection -->` dengan `<SystemsSection {locale} />` dan import komponen.

**Verify**: `npm run check` → `0 ERRORS`. Pelayan dev: `curl -s http://localhost:5199/ | grep -c 'id="sistem"'` → `1` (SSR/prerender).

### Langkah 4: Semakan visual dan aksesibiliti

Dengan Playwright, pada 1440×900 dan 390×844:
1. Skrol ke `#sistem`, simpan tangkapan ke `.crew/artifacts/sistem/<lebar>.png`.
2. Tekan Tab sehingga fokus berada pada nod pertama rajah; tekan Enter; sahkan panel penerangan memaparkan teks yang sama dengan `dataArchitecture`/`securityAccess`/`role` modul aktif.
3. Pilih `EMESYS`: sahkan nota "Sistem kerajaan sulit" kelihatan.
4. `document.documentElement.scrollWidth <= innerWidth` (tiada limpahan mendatar pada 390px).
5. Dengan `reducedMotion: 'reduce'`: tiada elemen yang mempunyai `animation-name` selain `none` dalam `#sistem` (`getComputedStyle`).

**Verify**: semua di atas benar; `npm run test:contrast` lulus.

### Langkah 5: Regresi penuh

```bash
npm run check
npm test
npm run build
WORKBENCH_URL=http://localhost:5199/ node scripts/workbench-smoke.mjs
HOME_URL=http://localhost:5199/ node scripts/home-visual.mjs   # jika Pelan 006 DONE
```
**Verify**: `0 ERRORS`; 0 gagal (35 + ujian baharu); binaan exit 0; `SMOKE OK`; `HOME OK`.

## Pelan ujian

- Baharu: `scripts/architecture.test.mjs` (5 kes di Langkah 1), termasuk ujian "tiada teks direka" (kes 4).
- Visual/a11y: Langkah 4 (manual dengan Playwright).
- Regresi: Langkah 5.

## Kriteria siap

- [ ] `node --test scripts/architecture.test.mjs` → semua lulus
- [ ] `npm test` → 0 gagal; `npm run check` → `0 ERRORS 0 WARNINGS`; `npm run build` exit 0
- [ ] `git diff --stat bdae964 -- src/lib/workbench/system-state.mjs` → kosong (data tidak diubah sejak fail itu mula di-commit dalam Pelan 001; fail ini tiada dalam cawangan `main`)
- [ ] Tangkapan `.crew/artifacts/sistem/1440.png` dan `390.png` wujud
- [ ] `grep -rn "box-shadow\|filter: blur" src/lib/workbench/ArchitectureDiagram.svelte src/lib/workbench/SystemsSection.svelte` → tiada
- [ ] Baris 007 dalam `plans/README.md` → `DONE`

## Syarat STOP

- Ujian kes 1 gagal untuk item `stack` yang tiada dalam senarai di "Keadaan semasa" (data telah berubah). Tambah item itu ke `RULES` hanya jika lapisannya jelas (contoh pangkalan data baharu → `data`); jika ragu-ragu, lapor.
- Anda tergoda untuk menambah nod atau teks teknikal yang tidak ada dalam data (contoh "API Gateway", "Load Balancer"). JANGAN; lapor cadangan kepada pemilik.
- Rajah tidak muat pada 390px walaupun dengan susunan lajur menegak. Lapor dengan tangkapan skrin.

## Nota penyelenggaraan

- Untuk menambah projek baharu: tambah modul dalam `system-state.mjs`; ujian kes 1 akan memaksa setiap item `stack` dipetakan.
- Pemilik boleh memperkayakan rajah kelak dengan medan data eksplisit (contoh `architecture.flows`), tetapi itu keputusan kandungan pemilik, bukan pelaksana.
- Sistem `restricted` mesti kekal umum. Semak setiap perubahan kandungan untuk butiran sulit.
