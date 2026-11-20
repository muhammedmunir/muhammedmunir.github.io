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