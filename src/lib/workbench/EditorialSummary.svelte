<script lang="ts">
  import { base } from '$app/paths';
  import { PROFILE, CAREER_TIMELINE, TECHNICAL_SKILLS, CERTIFICATIONS } from '$lib/content/portfolio-data';
  let { locale }: { locale: 'ms' | 'en' } = $props();
</script>

<div class="editorial">
  <section id="profil">
    <h2>{locale === 'en' ? 'Profile' : 'Profil'}</h2>
    <p>{PROFILE.summary[locale]}</p>
  </section>
  <section id="perjalanan">
    <h2>{locale === 'en' ? 'Career' : 'Perjalanan kerjaya'}</h2>
    <ol>{#each CAREER_TIMELINE.slice(0, 4) as entry}
      <li><h3>{entry.role[locale]}</h3><p class="meta">{entry.company} · {entry.period}</p><p>{entry.highlights[locale][0]}</p></li>
    {/each}</ol>
  </section>
  <div class="columns">
    <section id="kemahiran">
      <h2>{locale === 'en' ? 'Skills' : 'Kemahiran'}</h2>
      {#each TECHNICAL_SKILLS as group}<h3>{group.category[locale]}</h3><p>{group.skills.join(' · ')}</p>{/each}
    </section>
    <section id="sijil">
      <h2>{locale === 'en' ? 'Certifications' : 'Sijil'}</h2>
      <ul>{#each CERTIFICATIONS as cert}<li>{cert.title} — {cert.issuer}</li>{/each}</ul>
    </section>
  </div>
  <a href="{base}/cv">{locale === 'en' ? 'Full resume' : 'Resume penuh'}</a>
</div>

<style>
  .editorial { padding: 0 var(--gutter) 24px; overflow-wrap: anywhere; }
  section { border-top: 1px solid var(--work-line); padding-block: clamp(20px, 3vw, 40px); }
  p, li { max-width: 68ch; line-height: 1.6; }
  h2 { font: 700 clamp(24px, 3vw, 38px)/1.15 var(--font-heading); margin: 0 0 1rem; }
  h3 { font-size: 1.1rem; margin: 0; }
  p { margin: .25rem 0 1rem; }
  .meta { color: var(--work-muted); margin-bottom: .25rem; }
  ol, ul { margin: 0; padding-inline-start: 1.5rem; }
  li + li { margin-top: .75rem; }
  a { display: inline-flex; align-items: center; min-height: 44px; color: var(--work-ink); text-underline-offset: 4px; }
  a:focus-visible { outline: 3px solid var(--work-accent); outline-offset: 3px; }
  @media (min-width: 960px) { .columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--gutter); } }
</style>
