<script lang="ts">
  import { base } from '$app/paths';
  import { MODULES } from '$lib/workbench/system-state.mjs';
  import { PROJECT_MEDIA } from '$lib/workbench/project-media';
  import { TECHNICAL_SKILLS, PROFILE } from '$lib/content/portfolio-data';

  type Module = (typeof MODULES)[number] & { caseStudyUrl?: string; liveUrl?: string };
  let { kind, index, locale, onclose, onselect }: { kind: 'project' | 'skills' | 'about' | 'resume'; index: number; locale: 'ms' | 'en'; onclose: () => void; onselect?: (index: number) => void } = $props();
  const en = $derived(locale === 'en');
  const mod = $derived(MODULES[index] as Module);
  const SHARP_LOGOS = new Set(['emesys', 'sutera', 'adims', 'onboardx', 'babykick', '9router']);
  const logo = $derived(SHARP_LOGOS.has(mod.id) ? PROJECT_MEDIA[mod.id]?.logo : undefined);
  let closeButton = $state<HTMLButtonElement>();
  $effect(() => { void kind; void index; closeButton?.focus({ preventScroll: true }); });
</script>

<aside class="panel" aria-labelledby="panel-title">
  <button type="button" class="close" bind:this={closeButton} onclick={onclose}>{en ? 'Close' : 'Tutup'} <span aria-hidden="true">×</span></button>
  {#if kind === 'project'}
    {#if onselect}<div class="switch" role="group" aria-label={en ? 'Projects' : 'Projek'}>{#each MODULES as m, i}<button type="button" aria-pressed={i === index} onclick={() => onselect(i)}>{m.name}</button>{/each}</div>{/if}
    <p class="tag"><span class="code">{mod.code}</span> {en ? mod.badgeEn : mod.badge}</p>
    <div class="head">
      {#if logo}<img class="logo" src="{base}{logo}" alt="" />{:else}<span class="mark" style:background={mod.accent} aria-hidden="true">{mod.name.slice(0, 1)}</span>{/if}
      <div>
        <h2 id="panel-title">{mod.name}</h2>
        <p class="meta">{mod.company} · {en ? mod.accessLabelEn : mod.accessLabel}</p>
      </div>
    </div>
    <p class="role">{en ? mod.roleEn : mod.role}</p>
    <dl>
      <div><dt>{en ? 'Data architecture' : 'Seni bina data'}</dt><dd>{en ? mod.dataArchitectureEn : mod.dataArchitecture}</dd></div>
      <div><dt>{en ? 'Security & access' : 'Keselamatan & akses'}</dt><dd>{en ? mod.securityAccessEn : mod.securityAccess}</dd></div>
      <div><dt>Stack</dt><dd><ul class="tags">{#each mod.stack as tech}<li>{tech}</li>{/each}</ul></dd></div>
    </dl>
    {#if mod.caseStudyUrl || mod.liveUrl}
      <div class="links">
        {#if mod.caseStudyUrl}<a class="primary" href="{base}{mod.caseStudyUrl}" target="_blank" rel="noopener">{en ? 'Read the case study (PDF)' : 'Baca kajian kes (PDF)'}</a>{/if}
        {#if mod.liveUrl}<a href={mod.liveUrl} target="_blank" rel="noopener">{en ? 'Visit live site' : 'Lawati laman sebenar'}</a>{/if}
      </div>
    {/if}
  {:else if kind === 'about'}
    <p class="tag">{en ? 'Portrait' : 'Potret'}</p>
    <h2 id="panel-title">{PROFILE.shortName}</h2>
    <p class="meta">{PROFILE.headline[locale]} · {PROFILE.location}</p>
    <p class="role" style="margin-top:16px">{PROFILE.tagline[locale]}</p>
    <p class="about">{PROFILE.summary[locale]}</p>
  {:else if kind === 'resume'}
    <p class="tag">{en ? 'Computer' : 'Komputer'}</p>
    <h2 id="panel-title">{en ? 'Resume' : 'Resume'}</h2>
    <p class="about">{en ? 'Full career, education, skills and certifications.' : 'Kerjaya, pendidikan, kemahiran dan sijil penuh.'}</p>
    <div class="links"><a class="primary" href="{base}/cv">{en ? 'Open the resume' : 'Buka resume'}</a><a href="{base}{PROFILE.resumeUrl}" download>PDF</a></div>
  {:else}
    <p class="tag">{en ? 'Server rack' : 'Rak server'}</p>
    <h2 id="panel-title">{en ? 'Skills' : 'Kemahiran'}</h2>
    <dl>
      {#each TECHNICAL_SKILLS as group}
        <div><dt>{group.category[locale]}</dt><dd><ul class="tags">{#each group.skills as skill}<li>{skill}</li>{/each}</ul></dd></div>
      {/each}
    </dl>
    <div class="links"><a href="{base}/cv#kemahiran">{en ? 'Full list in the resume' : 'Senarai penuh dalam resume'}</a></div>
  {/if}
</aside>

<style>
  .panel { position: absolute; z-index: 4; top: 0; left: 0; bottom: 0; width: var(--side); overflow-y: auto; padding: 136px 28px 32px; background: var(--work-paper); border-right: 1px solid var(--work-line); animation: slide .35s cubic-bezier(.2,.7,.2,1); }
  @keyframes slide { from { transform: translateX(-24px); opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .panel { animation: none; } }
  .close { position: absolute; top: 76px; right: 16px; min-height: 44px; padding: 8px 14px; border: 1px solid var(--work-line); border-radius: 4px; background: none; color: var(--work-ink); font: inherit; font-size: .875rem; cursor: pointer; }
  .switch { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 20px; }
  .switch button { min-height: 36px; padding: 4px 10px; border: 1px solid var(--work-line); border-radius: 4px; background: none; color: var(--work-muted); font: inherit; font-size: .8125rem; cursor: pointer; }
  .switch button[aria-pressed='true'] { color: var(--work-ink); border-color: var(--work-accent); font-weight: 700; }
  .about { color: var(--work-muted); line-height: 1.6; margin: 12px 0 0; }
  .tag { margin: 0 0 16px; color: var(--work-muted); font-size: .8125rem; font-weight: 600; letter-spacing: .02em; }
  .code { font-family: var(--font-mono, monospace); margin-right: 6px; }
  .head { display: flex; gap: 16px; align-items: center; margin-bottom: 16px; }
  .logo { width: 72px; height: 72px; object-fit: contain; background: #fff; border-radius: 12px; padding: 8px; flex: none; }
  .mark { width: 72px; height: 72px; border-radius: 12px; display: grid; place-items: center; color: #fff; font: 800 2rem/1 var(--font-heading); flex: none; }
  h2 { margin: 0; font: 800 clamp(1.75rem, 2.6vw, 2.5rem)/1.05 var(--font-heading); letter-spacing: -.03em; overflow-wrap: anywhere; }
  .meta { margin: 6px 0 0; color: var(--work-muted); font-size: .875rem; }
  .role { margin: 0 0 20px; font-weight: 600; line-height: 1.5; }
  dl { margin: 0; display: grid; gap: 0; }
  dl > div { padding: 14px 0; border-top: 1px solid var(--work-line); }
  dt { font-weight: 700; font-size: .875rem; margin-bottom: 6px; }
  dd { margin: 0; color: var(--work-muted); line-height: 1.55; }
  .tags { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
  .tags li { padding: 4px 10px; border: 1px solid var(--work-line); border-radius: 4px; color: var(--work-ink); font-size: .8125rem; }
  .links { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
  .links a { display: inline-flex; align-items: center; min-height: 44px; padding: 8px 16px; border: 1px solid var(--work-muted); border-radius: 4px; color: var(--work-ink); text-decoration: none; }
  .links a.primary { background: var(--work-accent); border-color: var(--work-accent); color: var(--work-paper); font-weight: 700; }
  :is(a, button):focus-visible { outline: 3px solid var(--work-accent); outline-offset: 3px; }
  @media (max-width: 999px) {
    .close { top: 12px; }
    .panel { top: auto; right: 0; width: auto; max-height: 60svh; padding: 64px 20px 28px; border-right: 0; border-top: 1px solid var(--work-line); border-radius: 12px 12px 0 0; animation-name: rise; }
    @keyframes rise { from { transform: translateY(24px); opacity: 0; } }
  }
</style>
