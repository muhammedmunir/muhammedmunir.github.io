<script lang="ts">
  import { base } from '$app/paths';
  import { PROFILE } from '$lib/content/portfolio-data';
  let { locale, oncontact }: { locale: 'ms' | 'en'; oncontact: () => void } = $props();
</script>

<section class="hero-identity" aria-labelledby="hero-name">
  <h1 id="hero-name">{PROFILE.shortName}</h1>
  <p class="headline">{PROFILE.headline[locale]}</p>
  <p class="tagline">{PROFILE.tagline[locale]}</p>
  <div class="actions">
    <a class="primary" href="{base}{PROFILE.resumeUrl}" download>{locale === 'en' ? 'Download resume (PDF)' : 'Muat turun resume (PDF)'}</a>
    <button type="button" aria-haspopup="dialog" onclick={oncontact}>{locale === 'en' ? 'Contact' : 'Hubungi'}</button>
    <a href="#sistem">{locale === 'en' ? 'See the systems' : 'Lihat sistem'}</a>
  </div>
</section>

<style>
  section { padding: clamp(20px, 3vw, 42px) var(--gutter); border-bottom: 1px solid var(--work-line); }
  h1 { margin: 0; font: 800 clamp(40px, 6vw, 84px)/1 var(--font-heading); letter-spacing: -.04em; }
  .headline { margin: 12px 0 4px; font-size: 1.25rem; color: var(--work-ink); }
  .tagline { margin: 0; color: var(--work-muted); }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
  a, button { display: inline-flex; align-items: center; padding: 8px 12px; min-height: 44px; border: 1px solid var(--work-line); border-radius: 6px; color: inherit; font: inherit; text-decoration: none; }
  .primary { background: var(--work-accent); color: var(--work-paper); border-color: var(--work-accent); font-weight: 700; }
  :is(a, button):hover { text-decoration: underline; }
  :is(a, button):focus-visible { outline: 3px solid var(--work-accent); outline-offset: 3px; }
</style>
