# Plan 012: Hero dengan gambar diri, kenyataan nilai dan fakta sebenar

> **Arahan pelaksana**: Ikut langkah demi langkah. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor.
>
> **Semakan drift (jalankan dahulu)**:
> ```bash
> wc -l src/lib/workbench/HeroIdentity.svelte
> grep -c "profile_photo" src/lib/content/portfolio-data.ts
> grep -c "MAINTAINED_MODULES\|BUILT_MODULES" src/lib/workbench/system-state.mjs
> ```
> → `28`, `1`, `2`. Jika berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: S · **Risiko**: LOW (satu fail komponen diganti; tiada logik lain disentuh)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-20, dalam salinan terasing daripada `main` (`a78d467`). Keputusan ujian: `check` 0 ralat, `npm test` 50/50, build exit 0, `test:contrast` 314/314, `SMOKE OK`, `ORBIT OK`, `HOME OK`, tiada limpahan mendatar pada 390px dan 1440px dalam tema gelap dan cerah.

## Kenapa

Hero sekarang hanya nama besar atas latar kosong. Dalam 10 saat (DESIGN.md "Audiens & ujian 10 saat"), pengambil pekerja tidak nampak wajah, bukti kerja atau angka. Pelan ini menambah:
- **Gambar diri** (`static/profile_photo.jpg`, sudah ada dan dirujuk oleh `PROFILE.profilePhoto`, tetapi tidak dipaparkan).
- **Kenyataan nilai** yang menamakan sistem sebenar, dijana daripada `MAINTAINED_MODULES`.
- **Empat fakta**, semuanya dikira daripada data (`MAINTAINED_MODULES`, `BUILT_MODULES`, syarikat unik dalam `CAREER_TIMELINE`, `CERTIFICATIONS`). Tiada nombor ditulis tangan, jadi angka kekal benar apabila data berubah.

Reka bentuk mematuhi DESIGN.md: satu aksen (butang resume sahaja), jejari 6–8px, sempadan 1px `--work-line`, tiada bayang, tiada pil, tiada emoji. Susun atur:
- **≥960px**: teks di kiri, potret 4:5 di kanan merentas semua baris, kapsyen lokasi.
- **640–959px**: potret 160px di sebelah kenyataan nilai, fakta 4 lajur.
- **<640px**: nama penuh lebar, potret 104px di sebelah kenyataan nilai, fakta 2×2.

## Skop

**Dalam skop**: `src/lib/workbench/HeroIdentity.svelte` sahaja (ganti keseluruhan kandungan).
**Luar skop**: data dalam `portfolio-data.ts` dan `system-state.mjs`, `Workbench.svelte`, `DESIGN.md`, gambar. Jangan ubah teks atau angka.

## Aliran kerja git

- Kekal pada `main`. Satu commit: `feat(hero): gambar diri, kenyataan nilai dan fakta daripada data sebenar`
- Stage eksplisit: `git add src/lib/workbench/HeroIdentity.svelte plans/README.md`. Jangan push.

## Langkah

### Langkah 1: Ganti HeroIdentity.svelte

Baca fail itu dahulu (alat Read), kemudian guna alat **Write** untuk menggantikan SELURUH kandungannya dengan blok di bawah, tepat tanpa perubahan:

```svelte
<script lang="ts">
  import { base } from '$app/paths';
  import { PROFILE, CAREER_TIMELINE, CERTIFICATIONS } from '$lib/content/portfolio-data';
  import { MAINTAINED_MODULES, BUILT_MODULES } from './system-state.mjs';
  let { locale, oncontact }: { locale: 'ms' | 'en'; oncontact: () => void } = $props();

  // Semua angka dikira daripada data sebenar; tiada nombor ditulis tangan (DESIGN.md: tiada metrik rekaan).
  const organisations = new Set(CAREER_TIMELINE.map(entry => entry.company)).size;
  const maintainedNames = MAINTAINED_MODULES.map(m => m.name);
  const joinNames = (names: string[], and: string) =>
    names.length > 1 ? `${names.slice(0, -1).join(', ')} ${and} ${names.at(-1)}` : names.join('');

  const value = $derived(locale === 'en'
    ? `I maintain ${joinNames(maintainedNames, 'and')} for the public sector, and build web and mobile apps from database to deployment.`
    : `Saya menyenggara ${joinNames(maintainedNames, 'dan')} untuk sektor awam, dan membina aplikasi web serta mudah alih dari pangkalan data hingga pelancaran.`);

  const facts = $derived([
    { value: MAINTAINED_MODULES.length, label: locale === 'en' ? 'public-sector systems maintained' : 'sistem sektor awam disenggara' },
    { value: BUILT_MODULES.length, label: locale === 'en' ? 'projects built' : 'projek dibangunkan' },
    { value: organisations, label: locale === 'en' ? 'organisations, incl. TNB' : 'organisasi, termasuk TNB' },
    { value: CERTIFICATIONS.length, label: locale === 'en' ? 'professional certifications' : 'sijil profesional' }
  ]);
</script>

<section class="hero-identity" aria-labelledby="hero-name">
  <p class="role">{PROFILE.headline[locale]}</p>
  <h1 id="hero-name">{PROFILE.shortName}</h1>
  <div class="value">
    <p class="tagline">{PROFILE.tagline[locale]}</p>
    <p class="proof">{value}</p>
  </div>
  <figure class="portrait">
    <img src="{base}{PROFILE.profilePhoto}" alt={PROFILE.shortName} width="768" height="1024" fetchpriority="high" decoding="async" />
    <figcaption>{PROFILE.location}</figcaption>
  </figure>
  <dl class="facts">
    {#each facts as fact}
      <div><dt>{fact.label}</dt><dd>{fact.value}</dd></div>
    {/each}
  </dl>
  <div class="actions">
    <a class="primary" href="{base}{PROFILE.resumeUrl}" download>{locale === 'en' ? 'Download resume (PDF)' : 'Muat turun resume (PDF)'}</a>
    <button type="button" aria-haspopup="dialog" onclick={oncontact}>{locale === 'en' ? 'Contact' : 'Hubungi'}</button>
    <a href="#sistem">{locale === 'en' ? 'See the systems' : 'Lihat sistem'}</a>
  </div>
</section>

<style>
  /* Telefon: nama penuh lebar, gambar kecil di sebelah kenyataan nilai, fakta 2x2. */
  section {
    display: grid;
    grid-template-columns: 104px minmax(0, 1fr);
    grid-template-areas: 'role role' 'name name' 'photo value' 'facts facts' 'actions actions';
    gap: 12px 16px;
    padding: clamp(24px, 4vw, 56px) var(--gutter) clamp(24px, 3vw, 40px);
    border-bottom: 1px solid var(--work-line);
  }
  .role { grid-area: role; margin: 0; color: var(--work-muted); font-weight: 600; }
  h1 {
    grid-area: name; margin: 0;
    font: 800 clamp(30px, 8.5vw, 84px)/0.98 var(--font-heading);
    letter-spacing: -.04em; text-wrap: balance;
  }
  .value { grid-area: value; align-self: center; }
  .tagline { margin: 0 0 6px; font-size: 1.125rem; font-weight: 700; color: var(--work-ink); }
  .proof { margin: 0; color: var(--work-muted); line-height: 1.55; max-width: 46ch; }
  .portrait { grid-area: photo; margin: 0; align-self: start; }
  .portrait img {
    display: block; width: 100%; height: auto; aspect-ratio: 4 / 5;
    object-fit: cover; object-position: 50% 30%;
    border: 1px solid var(--work-line); border-radius: 8px; background: var(--work-surface);
  }
  figcaption { display: none; }
  .facts {
    grid-area: facts; margin: 8px 0 0; padding: 0;
    display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
    border-top: 1px solid var(--work-line);
  }
  .facts div { display: flex; flex-direction: column-reverse; justify-content: flex-end; gap: 2px; padding: 12px 12px 12px 0; }
  .facts dd { margin: 0; font: 800 2rem/1 var(--font-heading); color: var(--work-ink); }
  .facts dt { color: var(--work-muted); font-size: .875rem; line-height: 1.35; }
  .actions { grid-area: actions; display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
  a, button { display: inline-flex; align-items: center; padding: 8px 14px; min-height: 44px; border: 1px solid var(--work-line); border-radius: 6px; color: inherit; font: inherit; text-decoration: none; background: transparent; cursor: pointer; }
  .primary { background: var(--work-accent); color: var(--work-paper); border-color: var(--work-accent); font-weight: 700; }
  :is(a, button):hover { text-decoration: underline; }
  :is(a, button):focus-visible { outline: 3px solid var(--work-accent); outline-offset: 3px; }

  @media (min-width: 640px) {
    section { grid-template-columns: 160px minmax(0, 1fr); }
    .facts { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }

  /* Desktop: teks di kiri, gambar potret di kanan merentas semua baris. */
  @media (min-width: 960px) {
    section {
      grid-template-columns: minmax(0, 1fr) clamp(240px, 24vw, 340px);
      grid-template-areas: 'role photo' 'name photo' 'value photo' 'facts photo' 'actions photo';
      column-gap: clamp(32px, 5vw, 80px);
      align-items: start;
    }
    .value { align-self: start; }
    .tagline { font-size: 1.375rem; }
    .proof { font-size: 1.0625rem; }
    .portrait { grid-row: 1 / -1; align-self: end; }
    figcaption { display: block; margin-top: 8px; color: var(--work-muted); font-size: .875rem; }
    .facts dd { font-size: 2.5rem; }
  }
</style>
```

**Verify**: `wc -l src/lib/workbench/HeroIdentity.svelte` → `108`; `grep -c "fetchpriority=\"high\"" src/lib/workbench/HeroIdentity.svelte` → `1`; `npm run check` → `0 ERRORS 0 WARNINGS`.

### Langkah 2: Ujian penuh

```bash
npm test
npm run build
npm run test:contrast
```
**Verify**: `ℹ fail 0` (lulus 50); build exit 0; `314/314 pasangan token lulus`.

### Langkah 3: Ujian pelayar dan tangkapan skrin

Ikut peraturan 11 dalam `plans/README.md` untuk pelayan dev (port 5199). Kemudian:

```bash
WORKBENCH_URL=http://localhost:5199/ node scripts/workbench-smoke.mjs
HOME_URL=http://localhost:5199/ node scripts/home-visual.mjs
```
**Verify**: `SMOKE OK` dan `HOME OK`.

Ambil tangkapan `.hero-identity` pada 1440px dan 390px (tema gelap) ke `.crew/artifacts/012/`, kemudian `ls -la .crew/artifacts/012/`. Jika model semasa boleh membaca imej, sahkan: gambar dipaparkan, empat fakta menunjukkan `3`, `5`, `3`, `7`, dan tiada teks bertindih. Jika tidak boleh membaca imej, tulis "semakan visual: belum diukur". Hentikan pelayan dev mengikut peraturan 11.

### Langkah 4: Commit

Tukar baris 012 dalam `plans/README.md` kepada `DONE`, kemudian commit seperti dalam "Aliran kerja git".

**Verify**: `git status --short` kosong; `git log --oneline -1` menunjukkan mesej commit.

## Kriteria siap

- [ ] `grep -c "profilePhoto" src/lib/workbench/HeroIdentity.svelte` → `1`
- [ ] `check` 0 ralat; `npm test` 0 gagal; build exit 0; kontras 314/314
- [ ] `SMOKE OK` dan `HOME OK` (output disertakan)
- [ ] `ls -la .crew/artifacts/012/` menunjukkan dua imej
- [ ] Baris 012 = `DONE`; commit dibuat; tiada push

## Syarat STOP

- Semakan drift tidak sepadan.
- Mana-mana ujian sedia ada gagal. Jangan ubah fail ujian atau data.
- Fakta dalam tangkapan bukan `3`, `5`, `3`, `7`: data telah berubah sejak pelan ditulis. Laporkan; jangan tulis nombor secara manual.
