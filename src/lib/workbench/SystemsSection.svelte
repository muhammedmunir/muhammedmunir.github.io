<script>
  import { MAINTAINED_MODULES, BUILT_MODULES } from '$lib/workbench/system-state.mjs';
  import ArchitectureDiagram from './ArchitectureDiagram.svelte';

  /** @type {{ locale?: string }} */
  let { locale = 'ms' } = $props();

  const groups = [
    { label: 'maintained', modules: MAINTAINED_MODULES },
    { label: 'built', modules: BUILT_MODULES }
  ];

  /** @type {any} */
  let activeModule = $state(BUILT_MODULES[0]);

  /** @type {'ms' | 'en'} */
  const loc = /** @type {'ms' | 'en'} */ (locale);
</script>

<style>
  .section {
    padding: 3rem 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .heading {
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 700;
    color: var(--work-fg);
    margin-bottom: 0.5rem;
  }

  .subheading {
    font-size: 0.875rem;
    color: var(--work-muted);
    margin-bottom: 2rem;
  }

  .groups {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .group-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--work-muted);
  }

  .project-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .project-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.875rem;
    border: 1px solid var(--work-line);
    border-radius: 6px;
    background: var(--work-surface);
    color: var(--work-fg);
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 150ms ease, background 150ms ease;
  }

  .project-btn:hover {
    border-color: var(--work-accent);
  }

  .project-btn:focus-visible {
    outline: 2px solid var(--work-accent);
    outline-offset: 2px;
    border-color: var(--work-accent);
  }

  .project-btn[aria-pressed="true"] {
    border-color: var(--work-accent);
    background: color-mix(in srgb, var(--work-accent) 10%, var(--work-surface));
  }

  .project-code {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.7;
  }

  .diagram-wrapper {
    margin-top: 1.5rem;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-top: 1rem;
    font-size: 0.8125rem;
    color: var(--work-muted);
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .meta-label {
    font-weight: 600;
    color: var(--work-fg);
  }
</style>

<section id="sistem" aria-labelledby="sistem-heading" class="section">
  <h2 id="sistem-heading" class="heading">
    {locale === 'en' ? 'Systems built & maintained' : 'Sistem yang dibina & disenggara'}
  </h2>
  <p class="subheading">
    {locale === 'en'
      ? 'Interactive architecture diagrams generated from real stack data. Click any technology node to see its role.'
      : 'Rajah seni bina interaktif dijana daripada data stack sebenar. Klik nod teknologi mana-mana untuk melihat peranannya.'}
  </p>

  <div class="groups">
    {#each groups as group}
      <div class="group">
        <div class="group-label">{group.modules[0]?.categoryLabel?.[loc] || group.label}</div>
        <div class="project-buttons" role="radiogroup" aria-label={group.modules[0]?.categoryLabel?.[loc] || group.label}>
          {#each group.modules as mod}
            <button
              type="button"
              class="project-btn"
              aria-pressed={activeModule.id === mod.id}
              onclick={() => activeModule = mod}
            >
              <span class="project-code">{mod.code}</span>
              {mod.name}
            </button>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <div class="diagram-wrapper">
    <ArchitectureDiagram module={activeModule} locale={locale} />
  </div>

  <div class="meta">
    <div class="meta-item">
      <span class="meta-label">{locale === 'en' ? 'Company:' : 'Syarikat:'}</span>
      <span>{activeModule.company}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">{locale === 'en' ? 'Role:' : 'Peranan:'}</span>
      <span>{locale === 'en' ? (activeModule.roleEn || activeModule.role) : activeModule.role}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">{locale === 'en' ? 'Access:' : 'Akses:'}</span>
      <span>{activeModule.badgeEn || activeModule.badge}</span>
    </div>
  </div>
</section>