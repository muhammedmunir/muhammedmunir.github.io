# Plan 006: Halaman utama lulus "ujian 10 saat": identiti HTML, pentas 3D berbingkai dan kandungan editorial

> **Arahan pelaksana**: Ikut pelan ini langkah demi langkah. Jalankan setiap
> arahan Verify dan sahkan hasil yang dijangka sebelum ke langkah seterusnya.
> Jika mana-mana syarat STOP berlaku, berhenti dan lapor; jangan
> berimprovisasi. Apabila selesai, kemas kini baris status pelan ini dalam
> `plans/README.md`.
>
> **Semakan drift (jalankan dahulu)**: Pelan 002, 003 dan 004 mesti DONE.
> `test -f src/lib/content/portfolio-data.ts && grep -c "Meja Jurutera Sistem" DESIGN.md` → `1`.
> `grep -n '<h1 bind:this={heading} tabindex="-1">{title}</h1>' src/lib/workbench/Workbench.svelte` → satu baris. Jika mana-mana gagal, STOP.

## Status

- **Keutamaan**: P2
- **Usaha**: L (6 langkah; setiap langkah boleh disahkan sendiri)
- **Risiko**: MED (mengubah susun atur halaman utama)
- **Bergantung pada**: plans/002, plans/003, plans/004
- **Kategori**: direction
- **Dirancang pada**: commit `5acfc36` + working tree, 2026-11-18

## Kenapa ini penting

Penonton portfolio ini (pengambil pekerja, ketua teknikal) memberi 10–20 saat
sebelum membuat keputusan. Kini halaman utama memaparkan `<h1>` "Meja projek."
dan dunia 3D skrin penuh. Nama, peranan dan nilai pemilik TIDAK kelihatan
tanpa interaksi, dan profil/kerjaya/kemahiran hanya wujud sebagai teks kecil
dalam tekstur 3D yang sukar dibaca. Dunia 3D Workbench sendiri ialah aset
visual yang kuat dan unik (meja jurutera dengan router homelab, kad NFC
pemilik/pelawat, rak projek, hologram). Pelan ini menjadikannya **hero
berbingkai**: identiti dalam HTML di atas, pentas 3D terhad ketinggian, dan
kandungan editorial yang boleh dibaca di bawah. Ini mengikut `DESIGN.md`
(bahagian "Konsep" dan "Audiens & ujian 10 saat").

## Keadaan semasa

- `src/routes/+page.svelte` hanya memaparkan `<Workbench />`.
- `src/lib/workbench/Workbench.svelte` (≈405 baris), struktur:
  ```svelte
  <div class="workbench">
    <header> ... identiti ringkas "munir." + nav pautan ... </header>
    <nav class="view-nav"> ... Meja Projek / Profil / Perjalanan / Kemahiran ... </nav>
    <main id="workbench-main" tabindex="-1">
      <div class="scene-heading">
        <h1 bind:this={heading} tabindex="-1">{title}</h1>
        {#if view === 'desk'} ... pemilih projek <select> ... {/if}
      </div>
      <details class="camera-disclosure"> ... </details>
      <div class="scene-area">
        <canvas bind:this={canvas} ...></canvas>
        <p class="render-status" ...>...</p>
      </div>
      {#if view !== 'desk'} <section class="dossier-controls"> ... {/if}
      <section class="inspection-tools"> ... </section>
    </main>
    <footer> ... </footer>
    <section id="bench-controls" hidden={!help} ...> ... </section>
  </div>
  ```
- CSS berkaitan (dalam `<style>` fail yang sama):
  ```css
  .workbench { --gutter: 16px; min-height: 100svh; min-height: 100dvh; ... display: flex; flex-direction: column; position: relative; }
  .scene-area { flex: 1 1 18rem; min-height: 18rem; position: relative; }
  canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; }
  #bench-controls { position: fixed; z-index: 5; inset: auto 16px max(16px, env(safe-area-inset-bottom)); max-height: 75svh; ... box-shadow: 0 12px 50px #26334130; }
  ```
  `#bench-controls` menggunakan `position: fixed` dan menindih kandungan (dilihat pada tangkapan 1440px, 2026-11-18).
- Dalam skrip: `const t = (ms: string, en: string) => locale === 'en' ? en : ms;` (baris ~41); `let paused = $state(false)`; `world.setPaused(paused)`; `world` ialah instans `WorkbenchWorld`.
- Gelung render `WorkbenchWorld.animate` (≈baris 2427) sudah melangkau render apabila `document.hidden`, dan melambatkan ke ~4 FPS apabila dijeda, tetapi TIDAK berhenti apabila kanvas di luar skrin.
- Data (selepas Pelan 004) dalam `src/lib/content/portfolio-data.ts`:
  - `PROFILE`: `fullName` ('Muhammed Munir Bin Mohd Azmi'), `shortName`, `headline: {ms,en}` ('Full-Stack Developer • Keselamatan Rangkaian (UTM)'), `tagline: {ms,en}` ('Saya bina sistem di sebalik tabir.'), `summary: {ms,en}`, `resumeUrl` ('/resume.pdf'), `linkedinUrl`, `githubUrl`, `location`.
  - `CAREER_TIMELINE: CareerEntry[]`: `{ id, company, role: {ms,en}, period, location, highlights: {ms: string[], en: string[]}, stack: string[] }`.
  - `TECHNICAL_SKILLS: { id, category: {ms,en}, skills: string[] }[]`
  - `CERTIFICATIONS: { title, issuer, category: 'network'|'data', period? }[]`
- `getLocale()` dari `$lib/workbench/preferences.svelte` (lihat penggunaan dalam `src/routes/cv/+page.svelte`: `let locale = $derived(getLocale());`).
- Gaya komponen repo: Svelte 5 runes (`$state`, `$derived`, `$props`), CSS skop dalam `<style>`, token `--work-*`, fon `var(--font-heading)` / `var(--font-body)`. Rujuk `src/lib/workbench/ContactModal.svelte` sebagai contoh komponen kecil.

## Arahan yang diperlukan

| Tujuan | Arahan | Dijangka |
|---|---|---|
| Semak jenis | `npm run check` | `0 ERRORS 0 WARNINGS` |
| Ujian | `npm test` | 35 lulus (atau lebih), 0 gagal |
| Kontras | `npm run test:contrast` | lulus |
| Pelayan dev | `npx vite dev --port 5199 --strictPort &` | HTTP 200 |
| Ujian asap | `WORKBENCH_URL=http://localhost:5199/ node scripts/workbench-smoke.mjs` | `SMOKE OK` |
| Ujian visual (dicipta dalam Langkah 6) | `HOME_URL=http://localhost:5199/ node scripts/home-visual.mjs` | `HOME OK` |

## Kit alat pelaksana yang dicadangkan

- Skill `antislop-ui` dan `antislop-copywriting` sebelum menulis markup/teks (patuhi larangan dalam DESIGN.md).
- Skill `better-typography` untuk skala tajuk hero.
- MCP Playwright untuk tangkapan 390px/1440px selepas setiap langkah visual.

## Skop

**Dalam skop**:
- `src/lib/workbench/Workbench.svelte`
- `src/lib/workbench/HeroIdentity.svelte` (cipta)
- `src/lib/workbench/EditorialSummary.svelte` (cipta)
- `src/lib/workbench/WorkbenchWorld.ts`: HANYA tambah kaedah `setOffscreen` dan satu semakan dalam `animate` (Langkah 5)
- `scripts/home-visual.mjs` (cipta)

**Luar skop**:
- Geometri, bahan, kamera dan pencahayaan 3D dalam `WorkbenchWorld.ts`.
- `src/routes/cv/+page.svelte`, `src/routes/layout.css` (token global).
- Bahagian "Sistem" / rajah seni bina: itu Pelan 007. Tinggalkan penanda `<!-- Pelan 007: SystemsSection -->` di tempat yang dinyatakan.
- Jangan tambah animasi GSAP baharu dalam pelan ini.

## Aliran kerja git

- Cawangan baharu: `git switch -c feat/hero-berbingkai`
- Commit selepas setiap langkah yang lulus Verify (stage fail dalam skop secara eksplisit). Contoh mesej: `feat(home): tambah identiti hero HTML di atas pentas 3D`.
- Jangan push.

## Langkah

### Langkah 1: Identiti hero HTML

Cipta `src/lib/workbench/HeroIdentity.svelte`:
- Props: `{ locale: 'ms' | 'en', oncontact: () => void }`.
- Import `PROFILE` dari `$lib/content/portfolio-data` dan `base` dari `$app/paths`.
- Markup (semantik; tiada lencana "eyebrow" di atas tajuk, tiada emoji):
  ```svelte
  <section class="hero-identity" aria-labelledby="hero-name">
    <h1 id="hero-name">{PROFILE.shortName}</h1>
    <p class="headline">{PROFILE.headline[locale]}</p>
    <p class="tagline">{PROFILE.tagline[locale]}</p>
    <div class="actions">
      <a class="primary" href="{base}{PROFILE.resumeUrl}" download>{locale === 'en' ? 'Download resume (PDF)' : 'Muat turun resume (PDF)'}</a>
      <button type="button" onclick={oncontact}>{locale === 'en' ? 'Contact' : 'Hubungi'}</button>
      <a href="#sistem">{locale === 'en' ? 'See the systems' : 'Lihat sistem'}</a>
    </div>
  </section>
  ```
- Gaya: `h1` guna `var(--font-heading)`, saiz `clamp(40px, 6vw, 84px)`, `letter-spacing: -.04em`, `line-height: 1`. `.headline` saiz badan × 1.25, warna `--work-ink`. `.tagline` warna `--work-muted`. `.primary` latar `--work-accent`, teks `--work-paper`, jejari 6px, tinggi minimum 44px. Butang lain: sempadan 1px `--work-line`, jejari 6px, tinggi minimum 44px. Padding sisi `var(--gutter)`.

Dalam `Workbench.svelte`:
1. Import `HeroIdentity`.
2. Masukkan `<HeroIdentity {locale} oncontact={...} />` sebagai anak PERTAMA dalam `<main>`. Untuk `oncontact`, guna fungsi sama yang dipanggil oleh pautan "Hubungi" dalam `<header>` (cari pengendali yang membuka `ContactModal`; jangan cipta modal baharu).
3. Tukar `<h1 bind:this={heading} tabindex="-1">{title}</h1>` kepada `<h2 bind:this={heading} tabindex="-1">{title}</h2>` (halaman mesti ada SATU `h1` sahaja). Pindahkan gaya CSS `h1 { ... }` sedia ada dalam `.scene-heading` kepada `.scene-heading h2 { ... }`, supaya rupa tajuk paparan tidak berubah.

**Verify**: `npm run check` → `0 ERRORS`. Pada pelayan dev, jalankan dengan Playwright pada 1440×900 dan 390×844:
```js
await page.evaluate(() => ({
  h1Count: document.querySelectorAll('h1').length,
  h1Text: document.querySelector('h1')?.textContent?.trim(),
  h1Bottom: document.querySelector('h1')?.getBoundingClientRect().bottom,
  resumeBottom: document.querySelector('.hero-identity .primary')?.getBoundingClientRect().bottom,
  vh: innerHeight
}))
```
→ `h1Count === 1`, `h1Text === 'Muhammed Munir'`, dan `resumeBottom < vh` pada KEDUA-DUA saiz (kelihatan tanpa skrol).

### Langkah 2: Pentas 3D berbingkai

Dalam `<style>` `Workbench.svelte`:
- `.workbench`: buang `min-height: 100svh; min-height: 100dvh;` (halaman kini boleh diskrol).
- `.scene-area`: tukar kepada `flex: 0 0 auto; height: min(72svh, 720px); min-height: 22rem; position: relative;`
- Dalam media query mudah alih sedia ada (yang mengubah `.scene-area` pada lebar kecil), tetapkan `height: 56svh; min-height: 18rem;`. Buang/selaraskan peraturan `.scene-area { flex-basis: ...; min-height: ... }` lain supaya tidak bercanggah dengan ketinggian baharu.

**Verify**: Playwright pada 1440×900: `document.querySelector('.scene-area').getBoundingClientRect().height` antara `600` dan `720`. Pada 390×844: antara `400` dan `480`. `workbench-smoke.mjs` → `SMOKE OK`. Tangkapan skrin 390px: meja 3D kelihatan, tiada ruang kosong besar.

### Langkah 3: Kandungan editorial di bawah pentas

Cipta `src/lib/workbench/EditorialSummary.svelte`:
- Props: `{ locale: 'ms' | 'en' }`. Import `PROFILE, CAREER_TIMELINE, TECHNICAL_SKILLS, CERTIFICATIONS` dari `$lib/content/portfolio-data`; `base` dari `$app/paths`.
- Empat `<section>`, masing-masing dengan `<h2>` dan `id`:
  1. `id="profil"`: `PROFILE.summary[locale]` sebagai satu perenggan.
  2. `id="perjalanan"`: senarai `<ol>` untuk 4 entri PERTAMA `CAREER_TIMELINE`: `role[locale]`, `company`, `period`, dan `highlights[locale][0]` sahaja.
  3. `id="kemahiran"`: setiap `TECHNICAL_SKILLS` sebagai `<h3>{category[locale]}</h3>` dan senarai `skills` dalam baris (dipisahkan " · ").
  4. `id="sijil"`: senarai `CERTIFICATIONS` (`title` — `issuer`).
- Pautan akhir: `<a href="{base}/cv">{locale === 'en' ? 'Full resume' : 'Resume penuh'}</a>`.
- Susun atur: lajur teks maksimum `68ch`; grid 2 lajur pada ≥960px untuk Kemahiran/Sijil; 1 lajur pada mudah alih. Sempadan pemisah 1px `--work-line`. Tiada kad berbayang.
- JANGAN tulis teks baharu yang tidak ada dalam data, kecuali tajuk bahagian: Profil/Profile, Perjalanan kerjaya/Career, Kemahiran/Skills, Sijil/Certifications.

Dalam `Workbench.svelte`: masukkan `<!-- Pelan 007: SystemsSection -->` dan kemudian `<EditorialSummary {locale} />` SELEPAS `</main>` dan SEBELUM `<footer>`.

**Verify**: `npm run check` → `0 ERRORS`. Playwright 1440 dan 390: `document.querySelectorAll('#profil, #perjalanan, #kemahiran, #sijil').length === 4`; `document.documentElement.scrollWidth <= innerWidth` (tiada limpahan mendatar).

### Langkah 4: Panel kawalan alternatif tidak lagi menindih kandungan

Dalam `<style>`, gantikan peraturan `#bench-controls { position: fixed; ... box-shadow: ...; }` dengan:
```css
#bench-controls { margin: 16px var(--gutter); padding: 20px; background: var(--work-surface); border: 1px solid var(--work-line); }
```
(Kekalkan `#bench-controls[hidden] { display: none; }`.)

**Verify**: Playwright: klik butang yang membuka kawalan alternatif ("Kawalan alternatif" dalam footer), kemudian `getComputedStyle(document.getElementById('bench-controls')).position === 'static'`. Tangkapan 1440px: panel tidak menutup teks lain.

### Langkah 5: Hentikan render apabila pentas di luar skrin

Dalam `WorkbenchWorld.ts`:
- Tambah medan `private offscreen = false;` berhampiran `private renderDirty = true;` (≈baris 49).
- Tambah kaedah awam berhampiran `setPaused` (≈baris 2381):
  ```ts
  setOffscreen(value: boolean) {
    this.offscreen = value;
    if (!value) this.renderDirty = true;
  }
  ```
- Dalam `animate` (≈baris 2427), selepas semakan `document.hidden` sedia ada dan sebelum sebarang kerja render, tambah:
  ```ts
  if (this.offscreen) { this.frame = requestAnimationFrame(this.animate); return; }
  ```
  Ikut corak semakan `document.hidden` yang sudah ada di situ (ia juga menjadualkan semula frame sebelum `return`).

Dalam `Workbench.svelte`, dalam `onMount` selepas `world` dicipta, pasang:
```ts
const sceneArea = canvas.parentElement!;
const observer = new IntersectionObserver(([entry]) => world?.setOffscreen(!entry.isIntersecting), { threshold: 0 });
observer.observe(sceneArea);
```
Dan dalam fungsi pembersihan `onMount` sedia ada, tambah `observer.disconnect();`.

**Verify**: `npm run check` → `0 ERRORS`. Kemudian buktikan secara deterministik dengan Playwright (teknik sama seperti `scripts/spine-editorial.mjs`, yang memintas modul untuk mendedahkan keadaan dalaman):
```js
await context.route('**/src/lib/workbench/WorkbenchWorld.ts*', async (route) => {
  const response = await route.fetch();
  await route.fulfill({ response, body: `${await response.text()}
const __setOff = WorkbenchWorld.prototype.setOffscreen;
WorkbenchWorld.prototype.setOffscreen = function (v) { window.__offscreen = v; return __setOff.call(this, v); };` });
});
// buka halaman pada 1440x900, tunggu networkidle + 6s
await page.evaluate(() => document.getElementById('sijil').scrollIntoView());
await page.waitForFunction(() => window.__offscreen === true, undefined, { timeout: 10000 });
const off = await page.evaluate(() => window.__offscreen);      // mesti true
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForFunction(() => window.__offscreen === false, undefined, { timeout: 10000 });
const on = await page.evaluate(() => window.__offscreen);       // mesti false
```
Kemas kini 2026-11-19: Skrol lancar boleh mengambil lebih daripada 800 ms. Verify menunggu perubahan keadaan pemerhati dengan had 10 saat bagi setiap peralihan.

→ `off === true` dan `on === false`. Kemudian `SMOKE OK`, dan tangkapan skrin selepas skrol semula ke atas menunjukkan dunia 3D masih dirender.

### Langkah 6: Ujian visual `scripts/home-visual.mjs`

Cipta skrip Playwright (corak: `scripts/workbench-smoke.mjs`) yang, untuk viewport 1440×900 dan 390×844 (`isMobile: true` untuk 390):
1. Buka `process.env.HOME_URL`, tunggu `networkidle` + 6s.
2. Assert: satu `h1` dengan teks `Muhammed Munir`; butang resume kelihatan dalam viewport pertama; 4 bahagian editorial wujud; tiada limpahan mendatar; tiada `pageerror`; `.render-status` tersembunyi.
3. Simpan tangkapan skrin halaman penuh ke `.crew/artifacts/home/<lebar>.png` (folder sudah diabaikan git).
4. Cetak `HOME OK` jika semua lulus.

**Verify**: `HOME_URL=http://localhost:5199/ node scripts/home-visual.mjs` → `HOME OK`. Buka dua tangkapan dan semak secara visual: nama besar dan jelas di atas, meja 3D penuh di bawahnya, kandungan editorial boleh dibaca, tiada elemen bertindih.

## Pelan ujian

- Baharu: `scripts/home-visual.mjs` (ujian pelayar; tidak dalam `npm test`).
- Regresi: `npm test`, `npm run check`, `npm run test:contrast`, `scripts/workbench-smoke.mjs`.

## Kriteria siap

- [ ] `npm run check` → `0 ERRORS 0 WARNINGS`
- [ ] `npm test` → 0 gagal; `npm run test:contrast` lulus
- [ ] `workbench-smoke.mjs` → `SMOKE OK`; `home-visual.mjs` → `HOME OK`
- [ ] `grep -c "position: fixed" src/lib/workbench/Workbench.svelte` → hanya untuk elemen selain `#bench-controls` (semak: `grep -n "bench-controls.*position: fixed"` → tiada)
- [ ] `grep -c "<h1" src/lib/workbench/Workbench.svelte` → `0`, dan `grep -c "<h1" src/lib/workbench/HeroIdentity.svelte` → `1`
- [ ] Tangkapan `.crew/artifacts/home/1440.png` dan `390.png` wujud
- [ ] Baris 006 dalam `plans/README.md` → `DONE`

## Syarat STOP

- Selepas Langkah 2, dunia 3D kelihatan terpotong teruk atau kosong pada 390px (kamera tidak muat dalam ketinggian baharu). Jangan ubah kamera dalam `WorkbenchWorld.ts`; lapor dengan tangkapan skrin. Fungsi `camera-fit.mjs` dan ujian `workbench-camera-fit.test.mjs` mungkin perlu dilaras dalam pelan berasingan.
- Pengendali yang membuka `ContactModal` dari header tidak dapat ditemui atau tidak boleh dipanggil dari `HeroIdentity`.
- `npm run test:contrast` gagal kerana warna baharu. Gunakan token `--work-*` sahaja; jika masih gagal, lapor.
- Mana-mana langkah memerlukan perubahan pada fail luar skop.

## Nota penyelenggaraan

- Pelan 007 akan menggantikan komen `<!-- Pelan 007: SystemsSection -->` dengan bahagian rajah seni bina (`id="sistem"`, sasaran pautan "Lihat sistem").
- `setOffscreen` ialah titik masuk kawalan prestasi; jika pentas berubah lagi, pastikan IntersectionObserver memerhati elemen yang memegang kanvas.
- Teks kecil dalam tekstur 3D (stesen dossier) kini hanya hiasan; maklumat sebenar ada dalam HTML. Jangan tambah maklumat baharu yang hanya wujud dalam tekstur 3D.
