# Plan 014: Profil, Kerjaya, Kemahiran dan Sijil sebagai editorial (menggabungkan 015)

> **Arahan pelaksana**: Ikut langkah demi langkah. Sertakan output setiap Verify. Jika syarat STOP berlaku, berhenti dan lapor.
>
> **Semakan drift (jalankan dahulu)**:
> ```bash
> wc -l src/lib/workbench/EditorialSummary.svelte
> grep -c "EditorialSummary" src/lib/workbench/Workbench.svelte
> ```
> → `44`, `2`. Jika berbeza, STOP.

## Status

- **Keutamaan**: P1 · **Usaha**: S · **Risiko**: LOW (satu fail komponen diganti)
- **Ditulis dan diuji oleh perancang** (Claude) pada 2026-11-20 dalam salinan terasing daripada `main` (`931dc5c`): `check` 0 ralat, `npm test` 50/50, build exit 0, kontras 314/314, `SMOKE OK`, `HOME OK`, `ORBIT OK`, tiada limpahan pada 390px dan 1440px, tajuk bahagian muat dalam lajur label pada 960, 1180 dan 1440px.

## Kenapa

Profil, Kerjaya, Kemahiran dan Sijil kini hanya perenggan dan senarai bertitik yang mengisi kira-kira 60% lebar. Ia kelihatan seperti dokumen, bukan portfolio.

Reka bentuk baharu (satu sistem susun atur untuk keempat-empat bahagian):
- **Desktop ≥960px**: lajur label 18rem di kiri (tajuk bahagian), kandungan menggunakan lebar penuh di kanan.
- **Kerjaya**: garis masa dengan lajur tempoh, label "Peranan semasa" (aksen, menandakan keadaan sebenar: tempoh mengandungi "Present"), peranan, syarikat dan lokasi, 3 pencapaian pertama, dan tag stack.
- **Kemahiran**: kategori di kiri, kemahiran sebagai tag di kanan.
- **Sijil**: dikumpulkan mengikut penerbit, dengan bilangan.
- Pautan "Resume penuh dan pendidikan" ke `/cv`.
- ID bahagian (`profil`, `perjalanan`, `kemahiran`, `sijil`) dikekalkan.

Nota: Tajuk dalam lajur label menggunakan 1.75rem pada desktop kerana fon Syne sangat lebar. Pada 2.5rem, "Perjalanan" melimpah keluar dari lajur dan bertindih dengan kandungan (disahkan semasa ujian).

## Skop

**Dalam skop**: `src/lib/workbench/EditorialSummary.svelte` sahaja (ganti keseluruhan kandungan).
**Luar skop**: data dalam `portfolio-data.ts`, `/cv`, `Workbench.svelte`. Jangan ubah teks data.

## Aliran kerja git

- Kekal pada `main`. Satu commit: `feat(editorial): profil, garis masa kerjaya, kemahiran dan sijil`
- Stage eksplisit: `git add src/lib/workbench/EditorialSummary.svelte plans/README.md`. Jangan push.

## Langkah

### Langkah 1: Ganti EditorialSummary.svelte

Baca fail itu dahulu (alat Read), kemudian guna alat **Write** untuk menggantikan SELURUH kandungannya dengan blok di bawah, tepat tanpa perubahan:

```svelte
<script lang="ts">
  import { base } from '$app/paths';
  import { PROFILE, CAREER_TIMELINE, TECHNICAL_SKILLS, CERTIFICATIONS } from '$lib/content/portfolio-data';
  let { locale }: { locale: 'ms' | 'en' } = $props();
  const en = $derived(locale === 'en');

  // Empat peranan terkini (sama seperti sebelum ini); latihan 2019 kekal di /cv.
  const roles = CAREER_TIMELINE.slice(0, 4);
  const isCurrent = (period: string) => /present/i.test(period);

  // Sijil dikumpulkan mengikut penerbit, mengikut susunan data.
  const certGroups = CERTIFICATIONS.reduce<{ issuer: string; titles: string[] }[]>((groups, cert) => {
    const group = groups.find(g => g.issuer === cert.issuer);
    if (group) group.titles.push(cert.title);
    else groups.push({ issuer: cert.issuer, titles: [cert.title] });
    return groups;
  }, []);
</script>

<div class="editorial">
  <section id="profil" class="row" aria-labelledby="profil-h">
    <h2 id="profil-h">{en ? 'Profile' : 'Profil'}</h2>
    <p class="summary">{PROFILE.summary[locale]}</p>
  </section>

  <section id="perjalanan" class="row" aria-labelledby="perjalanan-h">
    <h2 id="perjalanan-h">{en ? 'Career' : 'Perjalanan kerjaya'}</h2>
    <ol class="timeline">
      {#each roles as entry}
        <li class:current={isCurrent(entry.period)}>
          <p class="when">
            <span>{entry.period}</span>
            {#if isCurrent(entry.period)}<span class="now">{en ? 'Current role' : 'Peranan semasa'}</span>{/if}
          </p>
          <div class="what">
            <h3>{entry.role[locale]}</h3>
            <p class="where">{entry.company} · {entry.location}</p>
            <ul class="highlights">
              {#each entry.highlights[locale].slice(0, 3) as point}<li>{point}</li>{/each}
            </ul>
            <ul class="tags" aria-label="Stack">
              {#each entry.stack.slice(0, 6) as tech}<li>{tech}</li>{/each}
            </ul>
          </div>
        </li>
      {/each}
    </ol>
  </section>

  <section id="kemahiran" class="row" aria-labelledby="kemahiran-h">
    <h2 id="kemahiran-h">{en ? 'Skills' : 'Kemahiran'}</h2>
    <dl class="skills">
      {#each TECHNICAL_SKILLS as group}
        <div>
          <dt>{group.category[locale]}</dt>
          <dd><ul class="tags">{#each group.skills as skill}<li>{skill}</li>{/each}</ul></dd>
        </div>
      {/each}
    </dl>
  </section>

  <section id="sijil" class="row" aria-labelledby="sijil-h">
    <h2 id="sijil-h">{en ? 'Certifications' : 'Sijil'}</h2>
    <div class="certs">
      {#each certGroups as group}
        <div>
          <h3>{group.issuer} <span class="count">{group.titles.length}</span></h3>
          <ul>{#each group.titles as title}<li>{title}</li>{/each}</ul>
        </div>
      {/each}
    </div>
  </section>

  <div class="row end">
    <span aria-hidden="true"></span>
    <a href="{base}/cv">{en ? 'Full resume and education' : 'Resume penuh dan pendidikan'}</a>
  </div>
</div>

<style>
  .editorial { padding: 0 var(--gutter) clamp(32px, 5vw, 64px); }
  .row { display: grid; gap: 16px; border-top: 1px solid var(--work-line); padding-block: clamp(28px, 4vw, 56px); }
  h2 { margin: 0; font: 800 clamp(1.75rem, 3.2vw, 2.5rem)/1.05 var(--font-heading); letter-spacing: -.02em; }
  h3 { margin: 0; font-size: 1.125rem; line-height: 1.35; }
  ul, ol { margin: 0; padding: 0; list-style: none; }

  .summary { margin: 0; max-width: 62ch; font-size: clamp(1.0625rem, 1.4vw, 1.25rem); line-height: 1.65; color: var(--work-ink); }

  .timeline > li { display: grid; gap: 8px; padding-block: 20px; border-top: 1px solid var(--work-line); }
  .timeline > li:first-child { border-top: 0; padding-top: 0; }
  .when { margin: 0; display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: baseline; color: var(--work-muted); font-variant-numeric: tabular-nums; }
  .now { color: var(--work-accent); font-weight: 700; font-size: .875rem; }
  .where { margin: 4px 0 10px; color: var(--work-muted); }
  .highlights { display: grid; gap: 6px; max-width: 68ch; }
  .highlights li { position: relative; padding-left: 16px; line-height: 1.55; color: var(--work-ink); }
  .highlights li::before { content: ''; position: absolute; left: 0; top: .7em; width: 6px; height: 1px; background: var(--work-muted); }

  .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
  .tags li { padding: 3px 9px; border: 1px solid var(--work-line); border-radius: 6px; font-size: .8125rem; color: var(--work-ink); }

  .skills { margin: 0; display: grid; gap: 18px; }
  .skills dt { font-weight: 700; }
  .skills dd { margin: 0; }
  .skills .tags { margin-top: 8px; }

  .certs { display: grid; gap: 24px; }
  .count { color: var(--work-muted); font-weight: 400; font-variant-numeric: tabular-nums; }
  .certs ul { display: grid; gap: 6px; margin-top: 8px; }
  .certs li { color: var(--work-ink); line-height: 1.5; }

  .end { border-top: 0; padding-top: 0; }
  a { display: inline-flex; align-items: center; justify-self: start; min-height: 44px; padding: 8px 14px; border: 1px solid var(--work-line); border-radius: 6px; color: var(--work-ink); text-decoration: none; }
  a:hover { text-decoration: underline; }
  a:focus-visible { outline: 3px solid var(--work-accent); outline-offset: 3px; }

  @media (min-width: 640px) {
    .timeline > li { grid-template-columns: 11rem minmax(0, 1fr); gap: 24px; }
    .when { flex-direction: column; }
    .skills > div { display: grid; grid-template-columns: 14rem minmax(0, 1fr); gap: 16px; align-items: baseline; }
    .skills .tags { margin-top: 0; }
    .certs { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  /* Desktop: tajuk dalam lajur label tetap di kiri, kandungan menggunakan lebar penuh di kanan. */
  @media (min-width: 960px) {
    .row { grid-template-columns: 18rem minmax(0, 1fr); gap: clamp(24px, 3vw, 48px); }
    /* Syne sangat lebar: tajuk dalam lajur label dikecilkan supaya "Perjalanan" muat dalam 18rem. */
    h2 { font-size: 1.75rem; }
  }
</style>
```

**Verify**: `wc -l src/lib/workbench/EditorialSummary.svelte` → `129`; `grep -c 'id="perjalanan"' src/lib/workbench/EditorialSummary.svelte` → `1`; `npm run check` → `0 ERRORS 0 WARNINGS`.

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

Ambil tangkapan `#perjalanan` pada 1440px dan tangkapan viewport pada 390px selepas `document.getElementById('perjalanan').scrollIntoView()`, ke `.crew/artifacts/014/`, kemudian `ls -la .crew/artifacts/014/`. Jika model semasa boleh membaca imej, sahkan: tajuk "Perjalanan kerjaya" tidak bertindih dengan tempoh, "Peranan semasa" kelihatan pada peranan YHCM. Jika tidak boleh membaca imej, tulis "semakan visual: belum diukur". Hentikan pelayan dev mengikut peraturan 11.

### Langkah 4: Commit

Tukar baris 014 dalam `plans/README.md` kepada `DONE`, kemudian commit seperti dalam "Aliran kerja git". BERHENTI selepas itu (peraturan 13).

**Verify**: `git status --short` kosong; `git log --oneline -1` menunjukkan mesej commit.

## Kriteria siap

- [ ] `check` 0 ralat; `npm test` 0 gagal; build exit 0; kontras 314/314
- [ ] `SMOKE OK` dan `HOME OK` (output disertakan)
- [ ] `ls -la .crew/artifacts/014/` menunjukkan dua imej
- [ ] Baris 014 = `DONE`; commit dibuat; tiada push

## Syarat STOP

- Semakan drift tidak sepadan.
- Mana-mana ujian sedia ada gagal. Jangan ubah fail ujian atau data.
