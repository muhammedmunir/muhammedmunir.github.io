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