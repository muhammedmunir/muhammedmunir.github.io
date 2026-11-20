<script lang="ts">
  import { base } from '$app/paths';
  import { CAREER_TIMELINE, TECHNICAL_SKILLS, CERTIFICATIONS } from '$lib/content/portfolio-data';
  let { locale, oncontact }: { locale: 'ms' | 'en'; oncontact: () => void } = $props();
  const en = $derived(locale === 'en');
  const skills = TECHNICAL_SKILLS.reduce((n, g) => n + g.skills.length, 0);
</script>

<section class="band" aria-labelledby="band-h">
  <h2 id="band-h">{en ? 'The full record is in the resume.' : 'Rekod penuh ada dalam resume.'}</h2>
  <p>{en
    ? `${CAREER_TIMELINE.length} roles, ${skills} skills and ${CERTIFICATIONS.length} certifications, with dates and details.`
    : `${CAREER_TIMELINE.length} peranan, ${skills} kemahiran dan ${CERTIFICATIONS.length} sijil, lengkap dengan tarikh dan butiran.`}</p>
  <div class="actions">
    <a class="primary" href={`${base}/cv`}>{en ? 'Read the resume' : 'Baca resume'}</a>
    <a href={`${base}/resume.pdf`} download>{en ? 'Download PDF' : 'Muat turun PDF'}</a>
    <button type="button" aria-haspopup="dialog" onclick={oncontact}>{en ? 'Contact' : 'Hubungi'}</button>
  </div>
</section>

<style>
  .band { margin: 0 var(--gutter, 16px); padding: clamp(40px, 7vw, 88px) 0; border-top: 1px solid var(--work-line); display: grid; gap: 16px; }
  h2 { margin: 0; font-family: var(--font-heading); font-size: clamp(28px, 4vw, 52px); line-height: 1.05; letter-spacing: -.04em; max-width: 18ch; }
  p { margin: 0; color: var(--work-muted); font-size: 1rem; line-height: 1.6; max-width: 52ch; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  a, button { display: inline-flex; align-items: center; min-height: 44px; padding: 8px 16px; border: 1px solid var(--work-muted); border-radius: 4px; font: inherit; font-size: .9375rem; color: inherit; background: none; text-decoration: none; cursor: pointer; }
  .primary { background: var(--work-accent); border-color: var(--work-accent); color: var(--work-paper); font-weight: 700; }
  a:hover, button:hover { text-decoration: underline; }
  :is(a, button):focus-visible { outline: 3px solid var(--work-accent); outline-offset: 3px; }
</style>
