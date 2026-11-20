# Plan 013: Bahagian Sistem sebagai kajian kes (panel identiti, tanpa tangkapan skrin)

> **Arahan pelaksana**: Ikut langkah demi langkah. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor.
>
> **Semakan drift (jalankan dahulu)**:
> ```bash
> wc -l src/lib/workbench/SystemsSection.svelte
> grep -c "caseStudyUrl" src/lib/workbench/system-state.mjs
> grep -c "logo:" src/lib/workbench/project-media.ts
> ```
> → `177`, `2`, `7`. Jika berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: S · **Risiko**: LOW (satu fail komponen diganti)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-20 dalam salinan terasing daripada `main` (`9d5c936`): `check` 0 ralat, `npm test` 50/50, build exit 0, kontras 314/314, `SMOKE OK`, `ORBIT OK`, `HOME OK`, tiada limpahan pada 390px dan 1440px (tema gelap dan cerah), tiada ralat konsol, tajuk halaman tidak berubah.
- Menggantikan draf C9 (diarkib di `.crew/artifacts/013-draf-c9/`: 6 ralat jenis, tajuk halaman rosak).

## Kenapa

Bahagian Sistem kini dibuka pada ONBOARDX, satu-satunya projek dibina tanpa skrin, dengan rajah yang lajurnya kosong. Ia nampak rosak. Tangkapan skrin projek juga ditolak oleh pemilik (2026-11-20): kebanyakannya borang log masuk kecil yang tidak menunjukkan kebolehan.

Reka bentuk baharu:
- **Panel identiti**: logo projek yang tajam atas permukaan bersih, dengan kod projek dan kategori. Logo terlalu kecil (IWA001 150×49, Infinity 64×44) dan 9Router (tiada logo) diganti dengan wordmark tipografi (perkataan pertama nama projek). Senarai logo tajam ditetapkan dalam `SHARP_LOGOS`.
- **Butiran sebenar** daripada `MODULES`: syarikat dan jenis akses, peranan, seni bina data, keselamatan dan akses, stack. Pautan kajian kes PDF dan laman sebenar jika ada.
- Dibuka pada projek pertama yang ada kajian kes (IWA001), supaya tindakan "Baca kajian kes" terus kelihatan.
- `ArchitectureDiagram.svelte` tidak lagi digunakan (fail dibiarkan; lihat Nota penyelenggaraan).

## Skop

**Dalam skop**: `src/lib/workbench/SystemsSection.svelte` sahaja (ganti keseluruhan kandungan).
**Luar skop**: data (`system-state.mjs`, `project-media.ts`), imej, `ArchitectureDiagram.svelte`, `Workbench.svelte`. Jangan ubah teks data.

## Aliran kerja git

- Kekal pada `main`. Satu commit: `feat(sistem): kajian kes dengan panel identiti projek`
- Stage eksplisit: `git add src/lib/workbench/SystemsSection.svelte plans/README.md`. Jangan push.

## Langkah

### Langkah 1: Ganti SystemsSection.svelte

Baca fail itu dahulu (alat Read), kemudian guna alat **Write** untuk menggantikan SELURUH kandungannya dengan blok di bawah, tepat tanpa perubahan:

```svelte
<script lang="ts">
  import { base } from '$app/paths';
  import { MAINTAINED_MODULES, BUILT_MODULES } from '$lib/workbench/system-state.mjs';
  import { PROJECT_MEDIA } from './project-media';

  let { locale = 'ms' }: { locale?: 'ms' | 'en' } = $props();
  const en = $derived(locale === 'en');

  type Module = (typeof MAINTAINED_MODULES)[number] & { caseStudyUrl?: string; liveUrl?: string };
  const groups: { id: string; label: { ms: string; en: string }; modules: readonly Module[] }[] = [
    { id: 'built', label: { ms: 'Projek dibangunkan', en: 'Projects built' }, modules: BUILT_MODULES },
    { id: 'maintained', label: { ms: 'Sistem sektor awam disenggara (YHCM)', en: 'Public-sector systems maintained (YHCM)' }, modules: MAINTAINED_MODULES }
  ];

  // Logo yang cukup tajam untuk dipaparkan besar (diukur 2026-11-20: semua ≥212px).
  // IWA001 (150×49) dan Infinity (64×44) terlalu kecil; 9Router tiada logo. Projek ini guna wordmark tipografi.
  const SHARP_LOGOS = new Set(['emesys', 'sutera', 'adims', 'onboardx', 'babykick']);

  // Mulakan dengan projek yang ada kajian kes, supaya pelawat terus nampak tindakan "Baca kajian kes".
  let active: Module = $state(BUILT_MODULES.find((m: Module) => m.caseStudyUrl) ?? BUILT_MODULES[0]);
  const media = $derived(PROJECT_MEDIA[active.id]);
  const sharpLogo = $derived(SHARP_LOGOS.has(active.id) && !!media?.logo);

  function select(mod: Module) {
    active = mod;
  }
</script>

<section id="sistem" aria-labelledby="sistem-heading">
  <header class="intro">
    <h2 id="sistem-heading">{en ? 'Systems built & maintained' : 'Sistem yang dibina & disenggara'}</h2>
    <p>{en
      ? 'For each project: the role I played, how its data is structured, and how access is protected.'
      : 'Untuk setiap projek: peranan saya, cara datanya disusun, dan cara aksesnya dilindungi.'}</p>
  </header>

  <div class="picker">
    {#each groups as group}
      <div class="group" role="group" aria-label={group.label[locale]}>
        <p class="group-label">{group.label[locale]}</p>
        <div class="choices">
          {#each group.modules as mod}
            <button type="button" aria-pressed={active.id === mod.id} onclick={() => select(mod)}>
              <span class="code">{mod.code}</span> {mod.name}
            </button>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <article class="case" aria-labelledby="case-title">
    <div class="identity">
      <p class="tag"><span class="code">{active.code}</span><span>{en ? active.badgeEn : active.badge}</span></p>
      {#if sharpLogo}
        <img class="logo" src="{base}{media?.logo}" alt="{active.name} logo" loading="lazy" decoding="async" />
      {:else}
        <p class="wordmark" aria-hidden="true">{active.name.split(' ')[0]}</p>
      {/if}
    </div>

    <div class="details">
      <p class="meta">{active.company} · {en ? active.accessLabelEn : active.accessLabel}</p>
      <h3 id="case-title">{active.name}</h3>
      <p class="role">{en ? active.roleEn : active.role}</p>
      <dl>
        <div><dt>{en ? 'Data architecture' : 'Seni bina data'}</dt><dd>{en ? active.dataArchitectureEn : active.dataArchitecture}</dd></div>
        <div><dt>{en ? 'Security & access' : 'Keselamatan & akses'}</dt><dd>{en ? active.securityAccessEn : active.securityAccess}</dd></div>
        <div><dt>Stack</dt><dd><ul class="stack">{#each active.stack as tech}<li>{tech}</li>{/each}</ul></dd></div>
      </dl>
      {#if active.caseStudyUrl || active.liveUrl}
        <div class="links">
          {#if active.caseStudyUrl}<a class="primary" href="{base}{active.caseStudyUrl}" target="_blank" rel="noopener">{en ? 'Read the case study (PDF)' : 'Baca kajian kes (PDF)'}</a>{/if}
          {#if active.liveUrl}<a href={active.liveUrl} target="_blank" rel="noopener">{en ? 'Visit live site' : 'Lawati laman sebenar'}</a>{/if}
        </div>
      {/if}
    </div>
  </article>
</section>

<style>
  section {
    padding: clamp(40px, 6vw, 88px) var(--gutter);
    border-top: 1px solid var(--work-line);
  }
  .intro { max-width: 60ch; margin-bottom: clamp(20px, 3vw, 32px); }
  h2 { margin: 0 0 8px; font: 800 clamp(1.75rem, 4vw, 2.75rem)/1.05 var(--font-heading); letter-spacing: -.02em; }
  .intro p { margin: 0; color: var(--work-muted); line-height: 1.55; }

  .picker { display: grid; gap: 16px; margin-bottom: 24px; }
  .group-label { margin: 0 0 8px; color: var(--work-muted); font-size: .875rem; font-weight: 600; }
  .choices { display: flex; flex-wrap: wrap; gap: 8px; }
  button {
    display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 8px 14px;
    border: 1px solid var(--work-line); border-radius: 6px; background: transparent;
    color: var(--work-ink); font: inherit; cursor: pointer;
  }
  button:hover { border-color: var(--work-muted); }
  button[aria-pressed='true'] { border-color: var(--work-accent); box-shadow: inset 0 -3px 0 var(--work-accent); font-weight: 700; }
  button:focus-visible, a:focus-visible { outline: 3px solid var(--work-accent); outline-offset: 3px; }
  .code { font-family: var(--font-mono); font-size: .75rem; color: var(--work-muted); font-weight: 400; }

  .case { display: grid; gap: 24px; }
  /* Panel identiti: logo tajam atau wordmark atas permukaan bersih, tanpa tangkapan skrin. */
  .identity {
    position: relative; aspect-ratio: 16 / 11; display: grid; place-items: center; padding: clamp(24px, 4vw, 48px);
    background: var(--work-surface); border: 1px solid var(--work-line); border-radius: 8px;
  }
  .tag {
    position: absolute; top: 16px; left: 16px; right: 16px; margin: 0;
    display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px 12px;
    font-size: .75rem; color: var(--work-muted); letter-spacing: .02em;
  }
  .logo { max-width: min(60%, 280px); max-height: 52%; width: auto; height: auto; object-fit: contain; }
  .wordmark {
    margin: 0; text-align: center; color: var(--work-ink);
    font: 800 clamp(2.5rem, 7vw, 5.5rem)/1 var(--font-heading); letter-spacing: -.03em; text-wrap: balance;
  }

  .meta { margin: 0; color: var(--work-muted); font-size: .875rem; }
  h3 { margin: 6px 0 8px; font: 800 clamp(1.75rem, 3vw, 2.5rem)/1 var(--font-heading); letter-spacing: -.02em; }
  .role { margin: 0 0 20px; color: var(--work-ink); font-weight: 600; line-height: 1.5; }
  dl { margin: 0; display: grid; gap: 16px; }
  dl div { border-top: 1px solid var(--work-line); padding-top: 12px; }
  dt { font-size: .875rem; font-weight: 700; color: var(--work-ink); margin-bottom: 4px; }
  dd { margin: 0; color: var(--work-muted); line-height: 1.55; }
  .stack { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
  .stack li { padding: 4px 10px; border: 1px solid var(--work-line); border-radius: 6px; color: var(--work-ink); font-size: .875rem; }
  .links { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
  a { display: inline-flex; align-items: center; min-height: 44px; padding: 8px 14px; border: 1px solid var(--work-line); border-radius: 6px; color: inherit; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .primary { background: var(--work-accent); border-color: var(--work-accent); color: var(--work-paper); font-weight: 700; }

  @media (min-width: 960px) {
    .picker { grid-template-columns: 1.4fr 1fr; align-items: start; }
    .case { grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: clamp(32px, 4vw, 64px); align-items: start; }
  }
</style>
```

**Verify**: `wc -l src/lib/workbench/SystemsSection.svelte` → `138`; `grep -c "SHARP_LOGOS" src/lib/workbench/SystemsSection.svelte` → `2`; `grep -c "svelte:head" src/lib/workbench/SystemsSection.svelte` → `0`; `npm run check` → `0 ERRORS 0 WARNINGS`.

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

Ambil tangkapan `#sistem` pada 1440px dan tangkapan viewport (bukan elemen penuh) pada 390px selepas `document.getElementById('sistem').scrollIntoView()`, ke `.crew/artifacts/013/`, kemudian `ls -la .crew/artifacts/013/`. Jika model semasa boleh membaca imej, sahkan: IWA001 dipilih secara lalai, panel kiri menunjukkan wordmark "IWA001", butang "Baca kajian kes (PDF)" kelihatan. Jika tidak boleh membaca imej, tulis "semakan visual: belum diukur". Hentikan pelayan dev mengikut peraturan 11.

Nota: tangkapan **elemen penuh** pada 390px boleh menunjukkan pautan langkau bertindih dengan tajuk. Ini artifak penjahitan Playwright untuk elemen yang lebih tinggi daripada skrin, bukan pepijat (disahkan: pautan berada pada `top=-221`, tersembunyi, sama seperti laman sebenar).

### Langkah 4: Commit

Tukar baris 013 dalam `plans/README.md` kepada `DONE`, kemudian commit seperti dalam "Aliran kerja git". BERHENTI selepas itu (peraturan 13): pelan 014 belum ditulis.

**Verify**: `git status --short` kosong; `git log --oneline -1` menunjukkan mesej commit.

## Kriteria siap

- [ ] `check` 0 ralat; `npm test` 0 gagal; build exit 0; kontras 314/314
- [ ] `SMOKE OK` dan `HOME OK` (output disertakan)
- [ ] `ls -la .crew/artifacts/013/` menunjukkan dua imej
- [ ] Baris 013 = `DONE`; commit dibuat; tiada push

## Syarat STOP

- Semakan drift tidak sepadan.
- Mana-mana ujian sedia ada gagal. Jangan ubah fail ujian atau data.
- Tajuk tab pelayar berubah daripada `Munir | Meja Projek` (bermakna kod lain disalin).

## Nota penyelenggaraan

- Menambah logo projek: letak fail ≥200px dalam `static/images/`, rujuk dalam `PROJECT_MEDIA[id].logo`, kemudian tambah `id` itu dalam `SHARP_LOGOS`.
- `ArchitectureDiagram.svelte` kini tidak dirujuk. Ia boleh dibuang dalam pelan pembersihan akan datang (ujian `scripts/architecture.test.mjs` menguji fungsi pengelas, bukan komponen; semak dengan `grep` sebelum membuang).
