<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { INITIAL_STATE, MODULES, transition, outcome } from './system-state.mjs';
  import { PROJECT_MEDIA } from './project-media';
  import { PROFILE, TECHNICAL_SKILLS, CERTIFICATIONS } from '$lib/content/portfolio-data';
  import { JOURNEY_STEPS } from './journey-data';
  import EditorialSummary from './EditorialSummary.svelte';
  import HeroIdentity from './HeroIdentity.svelte';
  import ContactModal from './ContactModal.svelte';
import SystemsSection from './SystemsSection.svelte';
  import { initPreferences, getTheme, getLocale, toggleTheme, toggleLocale } from './preferences.svelte';
  import type { WorkbenchWorld, Part, BenchState, FocusView } from './WorkbenchWorld';
  import type { DossierView } from './DossierStation';

  let canvas: HTMLCanvasElement;
  let world: WorkbenchWorld | undefined;
  let benchState = $state<BenchState>({ ...INITIAL_STATE, connected: true });
  let simulation = $state(false);
  let inserted = $state(true);
  let inspection = $state<'data' | 'router' | null>(null);
  let view = $state<'desk' | DossierView>('desk');
  let focus = $state<FocusView>('console');
  let ready = $state(false);
  let failed = $state(false);
  let webglMissing = $state(false);
  let paused = $state(false);
  let help = $state(false);
  let contact = $state(false);
  let menuOpen = $state(false);
  let hover = $state<Part | null>(null);
  let sampleIndex = $state(0);
  let journeyStep = $state(0);
  let skillCategory = $state(0);
  let playing = $state(false);
  let reduced = $state(false);
  let anchors = $state<Record<string, { x: number; y: number }>>({});
  let helpButton: HTMLButtonElement;
  let menuButton: HTMLButtonElement;
  let heading: HTMLHeadingElement;
  let panoramicButton = $state<HTMLButtonElement>();
  let returnButton = $state<HTMLButtonElement>();
  const locale = $derived(getLocale());
  const theme = $derived(getTheme());
  const t = (ms: string, en: string) => locale === 'en' ? en : ms;
  const result = $derived(outcome(benchState, locale));
  const module = $derived(MODULES[benchState.module]);
  const media = $derived(PROJECT_MEDIA[module.id]);
  const sample = $derived(media.slides[sampleIndex]);
  const allowed = $derived(!simulation || (benchState.connected && benchState.identity === 'owner'));
  const projecting = $derived(allowed && inserted);
  const step = $derived(JOURNEY_STEPS[journeyStep]);
  const skill = $derived(TECHNICAL_SKILLS[skillCategory]);
  const hoverLabel = $derived(hover?.startsWith('project:') ? MODULES[Number(hover.split(':')[1])]?.name : null);
  const title = $derived(view === 'profile' ? t('Pengenalan diri.', 'Introduction.') : view === 'journey' ? t('Perjalanan kerjaya.', 'Career journey.') : view === 'skills' ? t('Kemahiran.', 'Skills.') : t('Meja projek.', 'Project desk.'));

  function syncWorld() { world?.setState({ ...benchState, inserted, publicPreview: !simulation }); }
  function toggleSimulation() {
    simulation = !simulation;
    benchState = { ...INITIAL_STATE, connected: !simulation };
    inserted = true; sampleIndex = 0; inspection = null;
    syncWorld(); selectDeskFocus('console');
  }
  function selectModule(index: number) {
    if (inserted && benchState.module === index) {
      inserted = false;
      if (inspection === 'data') setInspection(null);
    } else {
      benchState = transition(benchState, { type: 'select_module', index });
      inserted = true; sampleIndex = 0;
    }
    syncWorld();
  }
  function selectView(next: typeof view) {
    view = next; inspection = null; playing = false; help = false; menuOpen = false;
    focus = next === 'desk' ? 'panoramic' : next;
    world?.setFocus(focus);
    requestAnimationFrame(() => heading?.focus({ preventScroll: true }));
  }
  function selectDeskFocus(next: 'panoramic' | 'console' | 'rack' | 'router') {
    inspection = next === 'router' ? 'router' : null;
    focus = next;
    world?.setFocus(next);
  }
  function resetCamera() {
    inspection = null;
    focus = view === 'desk' ? 'console' : view;
    world?.setFocus(focus);
    world?.resetCamera();
  }
  function selectStep(index: number) { journeyStep = index; world?.setJourneyStep(index); }
  function selectSkill(index: number) { skillCategory = index; world?.setSkillCategory(index); }
  function setInspection(next: typeof inspection) {
    const returning = returnButton && document.activeElement === returnButton;
    inspection = next;
    focus = next ?? (view === 'desk' ? 'panoramic' : view);
    world?.setFocus(focus);
    if (next) requestAnimationFrame(() => returnButton?.focus({ preventScroll: true }));
    else if (returning) requestAnimationFrame(() => (ready ? panoramicButton : heading)?.focus({ preventScroll: true }));
  }
  function nextSample() {
    if (media.slides.length < 2) return;
    sampleIndex = (sampleIndex + 1) % media.slides.length; world?.nextSample();
  }
  function action(part: Part) {
    if (part.startsWith('journey:')) { playing = false; selectStep(Number(part.split(':')[1])); return; }
    if (part.startsWith('skills:')) { selectSkill(Number(part.split(':')[1])); return; }
    if (part.startsWith('project:')) { selectModule(Number(part.split(':')[1])); return; }
    if (part === 'screen' || part === 'data') {
      if (!projecting) return;
      if (inspection === 'data') { if (media.slides.length > 1) nextSample(); else setInspection(null); }
      else setInspection('data');
      return;
    }
    if (part === 'router') { setInspection(inspection === 'router' ? null : 'router'); return; }
    if (part === 'module') { selectModule(inserted ? (benchState.module + 1) % MODULES.length : benchState.module); return; }
    if (!simulation && (part === 'cable' || part === 'owner' || part === 'visitor')) simulation = true;
    benchState = transition(benchState, part === 'cable' ? { type: 'connect' } : part === 'lid' ? { type: 'open' } : { type: 'identity', value: part });
    syncWorld();
    if (simulation && (!benchState.connected || benchState.identity !== 'owner') && inspection === 'data') setInspection(null);
  }
  function reset() { benchState = { ...INITIAL_STATE, connected: !simulation }; inserted = true; sampleIndex = 0; syncWorld(); resetCamera(); }
  function pause() { paused = !paused; if (paused) playing = false; world?.setPaused(paused); }
  function closeHelp() { help = false; helpButton?.focus(); }
  function handleKeydown(e: KeyboardEvent) {
    if (e.key !== 'Escape' || contact) return;
    if (help) closeHelp();
    else if (menuOpen) { menuOpen = false; menuButton?.focus(); }
    else if (inspection) setInspection(null);
  }
  function changeTheme() { world?.setTheme(toggleTheme()); }
  function changeLocale() { world?.setLocale(toggleLocale()); }

  $effect(() => {
    if (!playing || paused || reduced || view !== 'journey') return;
    const timer = setInterval(() => {
      if (journeyStep === JOURNEY_STEPS.length - 1) playing = false;
      else selectStep(journeyStep + 1);
    }, 8000);
    return () => clearInterval(timer);
  });

  function hasWebGL() {
    try {
      const probe = document.createElement('canvas');
      return !!(probe.getContext('webgl2') || probe.getContext('webgl'));
    } catch { return false; }
  }

  onMount(() => {
    initPreferences();
    if (matchMedia('(max-width: 639px)').matches) focus = 'console';
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => { reduced = motion.matches; if (reduced) playing = false; };
    updateMotion(); motion.addEventListener('change', updateMotion);
    let disposed = false;
    let observer: IntersectionObserver | undefined;
    import('./WorkbenchWorld').then(({ WorkbenchWorld }) => {
      if (disposed) return;
      try {
        world = new WorkbenchWorld(canvas, { action, hover: value => hover = value, anchors: value => anchors = value,
          failure: () => { failed = true; ready = false; help = true; } });
        syncWorld(); world.setTheme(getTheme()); world.setLocale(getLocale());
        world.setFocus(focus);
        world.setJourneyStep(journeyStep); world.setSkillCategory(skillCategory); world.setPaused(paused);
        observer = new IntersectionObserver(([entry]) => world?.setOffscreen(!entry.isIntersecting), { threshold: 0 });
        observer.observe(canvas.parentElement!);
        ready = true;
     } catch (error) {
       console.error('[Workbench] Dunia 3D gagal dibina:', error);
       webglMissing = !hasWebGL();
       failed = true; help = true;
     }
   }).catch((error) => {
     console.error('[Workbench] Modul dunia 3D gagal dimuatkan:', error);
     webglMissing = !hasWebGL();
     failed = true; help = true;
   });
    return () => { disposed = true; observer?.disconnect(); motion.removeEventListener('change', updateMotion); world?.dispose(); };
  });
</script>

<svelte:window onkeydown={handleKeydown} />
<svelte:head>
  <title>Munir | {t('Meja Projek', 'Project Desk')}</title>
  <meta name="description" content={t('Portfolio 3D Muhammed Munir: profil, perjalanan kerjaya, kemahiran dan projek.', 'Muhammed Munir’s 3D portfolio: profile, career journey, skills and projects.')} />
</svelte:head>

<div class="workbench">
  <a class="skip-link" href="#workbench-main">{t('Langkau ke kandungan', 'Skip to content')}</a>
  <a class="skip-link" href="#bench-controls" onclick={() => { help = true; requestAnimationFrame(() => document.getElementById('bench-controls')?.focus()); }}>{t('Langkau ke kawalan instrumen', 'Skip to instrument controls')}</a>
  <header>
    <a class="identity" href={`${base}/`}>munir<span>.</span></a>
    <p class="byline">Muhammed Munir <span> / Full-Stack Developer</span></p>
    <button type="button" class="menu-toggle" bind:this={menuButton} aria-expanded={menuOpen} aria-controls="portfolio-links" onclick={() => menuOpen = !menuOpen}>{menuOpen ? t('Tutup menu', 'Close menu') : 'Menu'}</button>
    <nav id="portfolio-links" class:expanded={menuOpen} aria-label={t('Navigasi portfolio', 'Portfolio navigation')}>
      <button type="button" onclick={changeLocale} lang={locale === 'ms' ? 'en' : 'ms'}>{locale === 'ms' ? 'English (EN)' : 'Bahasa Melayu (BM)'}</button>
      <button type="button" onclick={changeTheme}>{theme === 'dark' ? t('Tema cerah', 'Light theme') : t('Tema gelap', 'Dark theme')}</button>
      <a href={`${base}/cv`}>{t('Resume & Profil Penuh', 'Resume & Full Profile')}</a>
      <button type="button" aria-haspopup="dialog" onclick={() => contact = true}>{t('Hubungi', 'Contact')}</button>
    </nav>
  </header>
  <nav class="view-nav" aria-label={t('Bahagian dunia 3D', '3D world sections')}>
    {#each [{ id: 'desk', ms: 'Meja Projek', en: 'Project Desk' }, { id: 'profile', ms: 'Profil', en: 'Profile' }, { id: 'journey', ms: 'Perjalanan', en: 'Journey' }, { id: 'skills', ms: 'Kemahiran', en: 'Skills' }] as item}
      <button type="button" aria-pressed={view === item.id} onclick={() => selectView(item.id as typeof view)}>{item[locale]}</button>
    {/each}
  </nav>
  <main id="workbench-main" tabindex="-1">
    <HeroIdentity {locale} oncontact={() => contact = true} />
    <div class="scene-heading">
      <h2 bind:this={heading} tabindex="-1">{title}</h2>
      {#if view === 'desk'}
        <div class="project-picker"><label for="project-select">{t('Projek', 'Project')}</label>
          <select id="project-select" value={benchState.module} onchange={event => { const index = Number(event.currentTarget.value); if (!inserted || index !== benchState.module) selectModule(index); }}>
            {#each ['maintained', 'built'] as category}
              <optgroup label={category === 'maintained' ? t('Sistem disenggara · YHCM', 'Maintained systems · YHCM') : t('Projek dibangunkan', 'Built projects')}>
                {#each MODULES as item, index}{#if item.category === category}<option value={index}>{item.name}</option>{/if}{/each}
              </optgroup>
            {/each}
          </select>
        </div>
      {/if}
    </div>
    <details class="camera-disclosure">
      <summary>{t('Kamera & sudut pandang', 'Camera & viewpoints')}</summary>
    <div class="scene-toolbar">
      {#if view === 'desk'}
        <div class="focus-controls" role="group" aria-label={t('Fokus meja', 'Desk focus')}>
          <button type="button" bind:this={panoramicButton} disabled={!ready} aria-pressed={focus === 'panoramic'} onclick={() => selectDeskFocus('panoramic')}>{t('Seluruh meja', 'Full desk')}</button>
          <button type="button" disabled={!ready} aria-pressed={focus === 'console'} onclick={() => selectDeskFocus('console')}>{t('Konsol', 'Console')}</button>
          <button type="button" disabled={!ready} aria-pressed={focus === 'rack'} onclick={() => selectDeskFocus('rack')}>{t('Rak projek', 'Project rack')}</button>
          <button type="button" disabled={!ready} aria-pressed={focus === 'router'} onclick={() => selectDeskFocus('router')}>Homelab</button>
        </div>
      {/if}
      <div class="camera-controls" role="group" aria-label={t('Kawalan kamera', 'Camera controls')}>
        <button type="button" class="zoom-button" disabled={!ready} aria-label={t('Zum dekat', 'Zoom in')} title={t('Zum dekat', 'Zoom in')} onclick={() => world?.zoomBy(-0.12)}><span aria-hidden="true">+</span></button>
        <button type="button" class="zoom-button" disabled={!ready} aria-label={t('Zum jauh', 'Zoom out')} title={t('Zum jauh', 'Zoom out')} onclick={() => world?.zoomBy(0.12)}><span aria-hidden="true">−</span></button>
        <button type="button" disabled={!ready} onclick={resetCamera}>{t('Set semula kamera', 'Reset camera')}</button>
      </div>
    </div>
    </details>
    <div class="scene-area">
      <canvas bind:this={canvas} aria-label={t('Dunia portfolio 3D. Gunakan butang fokus dan zum di atas, atau kawalan alternatif di bawah.', '3D portfolio world. Use the focus and zoom buttons above, or alternative controls below.')}></canvas>
      <p class="render-status" role="status" hidden={ready}>{failed ? (webglMissing
    ? t('WebGL tidak tersedia. Gunakan kawalan dan versi teks di bawah.', 'WebGL unavailable. Use the controls and text version below.')
    : t('Dunia 3D gagal dimuatkan. Kandungan di bawah tetap lengkap.', 'The 3D world failed to load. The content below is complete.'))
  : !ready ? t('Menyediakan dunia 3D…', 'Preparing the 3D world…') : ''}</p>
      {#if ready && view === 'desk' && !inspection && hoverLabel && hover && anchors[hover]}
        <span class="object-hint" style:left={`clamp(80px, ${anchors[hover].x}px, calc(100% - 80px))`} style:top={`${Math.max(22, anchors[hover].y - 34)}px`}>{hoverLabel}</span>
      {/if}
    </div>

    {#if view !== 'desk'}
      <section class="dossier-controls" aria-label={t('Kawalan stesen profil', 'Profile station controls')}>
        {#if view === 'journey'}
          <div class="steps">
            {#each JOURNEY_STEPS as item, index}<button type="button" aria-pressed={journeyStep === index} title={`${item.period[locale]} · ${item.org}`} onclick={() => { playing = false; selectStep(index); }}>{index + 1}<span>{item.period[locale]}</span></button>{/each}
          </div>
          <div class="controls">
            <button type="button" disabled={journeyStep === 0} onclick={() => { playing = false; selectStep(journeyStep - 1); }}>{t('Sebelumnya', 'Previous')}</button>
            <button type="button" disabled={reduced || paused} aria-pressed={playing} onclick={() => { if (journeyStep === JOURNEY_STEPS.length - 1) selectStep(0); playing = !playing; }}>{playing ? t('Jeda perjalanan', 'Pause journey') : t('Mainkan perjalanan', 'Play journey')}</button>
            <button type="button" disabled={journeyStep === JOURNEY_STEPS.length - 1} onclick={() => { playing = false; selectStep(journeyStep + 1); }}>{t('Seterusnya', 'Next')}</button>
          </div>
          <p role="status">{step.period[locale]} · {step.org}</p>
        {:else if view === 'skills'}
          <div class="controls">{#each TECHNICAL_SKILLS as category, index}<button type="button" aria-pressed={skillCategory === index} onclick={() => selectSkill(index)}>{category.category[locale]}</button>{/each}</div>
          <p role="status">{TECHNICAL_SKILLS.reduce((total, category) => total + category.skills.length, 0)} {t('kemahiran', 'skills')} · {CERTIFICATIONS.length} {t('pensijilan', 'certifications')}</p>
        {/if}
        <a href={`${base}/cv${view === 'skills' ? '#kemahiran' : view === 'journey' ? '#pengalaman' : ''}`}>{t('Lihat butiran dalam Resume & Profil Penuh', 'Read more in Resume & Full Profile')}</a>
        <details open={failed}>
          <summary>{t('Versi teks paparan 3D', 'Text version of the 3D display')}</summary>
          {#if view === 'profile'}<h2>{PROFILE.shortName}</h2><p>Full-Stack Developer · YHCM Sdn Bhd</p><p>{PROFILE.summary[locale]}</p>
          {:else if view === 'journey'}<h2>{step.title[locale]}</h2><p>{step.summary[locale]}</p>
          {:else}<h2>{skill.category[locale]}</h2><p>{skill.skills.join(' · ')}</p><h3>{t('Pensijilan', 'Certifications')}</h3><ul>{#each CERTIFICATIONS as cert}<li>{cert.title}</li>{/each}</ul>{/if}
        </details>
      </section>
    {:else if projecting || inspection === 'router'}
      <section class="inspection-tools" aria-label={t('Kawalan hologram', 'Hologram controls')}>
        {#if inspection}<button type="button" bind:this={returnButton} onclick={() => setInspection(null)}>{t('Pandangan meja penuh', 'Full desk view')}</button>
        {:else}<button type="button" onclick={() => setInspection('data')}>{t('Zum penuh hologram', 'Zoom into hologram')}</button>{/if}
        {#if projecting && inspection !== 'router'}
          <p role="status"><strong>{module.name}</strong> · {locale === 'en' ? sample?.labelEn ?? media.unavailableEn : sample?.label ?? media.unavailable}</p>
          {#if media.slides.length > 1}<button type="button" onclick={nextSample}>{t('Slaid seterusnya', 'Next slide')} ({sampleIndex + 1}/{media.slides.length})</button>{/if}
          {#if sample}<a href={`${base}${sample.src}`} target="_blank" rel="noreferrer">{t('Buka imej penuh', 'Open full image')}</a>{/if}
          {#if failed && sample}<img class="fallback-image" src={`${base}${sample.src}`} alt={`${module.name}: ${locale === 'en' ? sample.labelEn : sample.label}`} />{/if}
        {:else}<a href={`${base}/cv#kemahiran`}>{t('Homelab & keselamatan rangkaian dalam resume', 'Homelab & network security in the resume')}</a>{/if}
      </section>
    {/if}
  </main>
  <SystemsSection {locale} />
  <EditorialSummary {locale} />
  <footer>
    {#if simulation}<p class="telemetry">SOC TELEMETRY: {benchState.connected ? 'ONLINE' : 'OFFLINE'} · {t('SIMULASI TEMPATAN', 'LOCAL SIMULATION')}</p>{/if}
    <p role="status">{#if view !== 'desk'}{t('Profil awam · Tidak memerlukan kad akses', 'Public profile · No access card required')}
      {:else if projecting}{module.name} <span>· {t('Projektor hologram aktif', 'Hologram projector active')}</span>
      {:else if allowed && !inserted}{t('Kaset dikeluarkan. Pilih projek lain pada rak atau senarai projek.', 'Cartridge removed. Select another project from the rack or project list.')}
      {:else}{result.title} <span>· {result.detail}</span>{/if}</p>
    <div><button type="button" onclick={pause} aria-pressed={paused}>{paused ? t('Sambung gerakan', 'Resume motion') : t('Hentikan gerakan', 'Pause motion')}</button>
      <button type="button" bind:this={helpButton} onclick={() => help = !help} aria-expanded={help} aria-controls="bench-controls">{t('Kawalan alternatif', 'Alternative controls')}</button></div>
  </footer>
  <section id="bench-controls" hidden={!help} tabindex="-1" aria-label={t('Kawalan alternatif', 'Alternative controls')}>
    <h2>{t('Projek & interaksi lanjutan', 'Projects & advanced interactions')}</h2>
    <button type="button" aria-pressed={simulation} onclick={toggleSimulation}>{simulation ? t('Kembali ke paparan projek awam', 'Return to public project preview') : t('Mulakan simulasi SOC / RBAC', 'Start SOC / RBAC simulation')}</button>
    <p class="telemetry">SOC TELEMETRY: {simulation ? (benchState.connected ? 'ONLINE' : 'OFFLINE') : 'STANDBY'} · {t('Simulasi tempatan, bukan sambungan SOC langsung', 'Local simulation, not a live SOC connection')}</p>
    {#if view !== 'desk'}<button type="button" onclick={() => selectView('desk')}>{t('Kembali ke Meja Projek', 'Back to Project Desk')}</button>{/if}
    <div class="controls">
      <button type="button" aria-pressed={benchState.connected} onclick={() => action('cable')}>{benchState.connected ? t('Cabut kabel Homelab', 'Disconnect Homelab cable') : t('Sambung kabel Homelab', 'Connect Homelab cable')}</button>
      <button type="button" aria-pressed={benchState.identity === 'visitor'} onclick={() => action('visitor')}>{t('Kad pelawat (NFC)', 'Visitor card (NFC)')}</button>
      <button type="button" aria-pressed={benchState.identity === 'owner'} onclick={() => action('owner')}>{t('Kad pemilik (NFC)', 'Owner card (NFC)')}</button>
      <button type="button" aria-pressed={benchState.opened} onclick={() => action('lid')}>{benchState.opened ? t('Tutup tudung optik', 'Close optical cover') : t('Buka tudung optik', 'Open optical cover')}</button>
      <button type="button" onclick={() => { selectView('desk'); action('router'); }}>Homelab</button>
    </div>
    {#each ['maintained', 'built'] as category}
      <h3>{category === 'maintained' ? t('Sistem Disenggara · YHCM', 'Maintained Systems · YHCM') : t('Projek Dibangunkan', 'Built Projects')}</h3>
      <div class="controls">{#each MODULES as item, index}{#if item.category === category}<button type="button" aria-pressed={inserted && benchState.module === index} onclick={() => selectModule(index)}>{item.code} · {item.name}</button>{/if}{/each}</div>
    {/each}
    <div class="controls end"><button type="button" onclick={reset}>{t('Set semula', 'Reset')}</button><button type="button" onclick={closeHelp}>{t('Tutup kawalan', 'Close controls')}</button></div>
  </section>
</div>
<ContactModal open={contact} {locale} onclose={() => contact = false} />

<style>
  .workbench { --gutter: 16px; background: var(--work-paper); color: var(--work-ink); display: flex; flex-direction: column; position: relative; }
  header, footer { padding: 8px var(--gutter); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 16px; position: relative; }
  header { border-bottom: 1px solid var(--work-line); }
  .identity { font-family: var(--font-heading); font-size: 32px; font-weight: 800; letter-spacing: -.07em; text-decoration: none; }
  .identity span { color: var(--work-accent); }
  .byline { flex: 1; margin: 0; color: var(--work-muted); font-size: 12px; line-height: 1.5; }
  .byline span { display: none; }
  a, button { color: inherit; }
  button, a, summary { -webkit-tap-highlight-color: transparent; }
  button { min-height: 44px; min-width: 44px; padding: 8px 12px; font-size: .8125rem; line-height: 1.35; border: 1px solid transparent; border-radius: 4px; white-space: normal; overflow-wrap: anywhere; }
  a { overflow-wrap: anywhere; text-underline-offset: 4px; }
  .menu-toggle { border-color: var(--work-muted); }
  #portfolio-links { display: none; flex-basis: 100%; min-width: 0; gap: 4px 12px; }
  #portfolio-links.expanded { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  #portfolio-links a, #portfolio-links button { display: inline-flex; align-items: center; justify-content: flex-start; min-height: 44px; padding: 8px; font-size: .8125rem; }
  .view-nav { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); padding: 6px var(--gutter); gap: 4px; border-bottom: 1px solid var(--work-line); }
  .view-nav button { min-width: 0; padding: 8px 4px; font-size: .75rem; font-weight: 600; }
  main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
  .scene-heading { padding: 14px var(--gutter) 8px; display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 24px; }
  .scene-heading h2 { flex-shrink: 0; max-width: 100%; font-family: var(--font-heading); font-size: clamp(24px, 2.6vw, 34px); line-height: 1.15; letter-spacing: -.04em; margin: 0; color: inherit; overflow-wrap: anywhere; }
  .scene-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 20px; padding: 4px var(--gutter) 8px; }
  .focus-controls, .camera-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; min-width: 0; }
  .focus-controls { flex: 1 1 20rem; }
  .focus-controls button { flex: 1; padding-inline: 6px; font-size: .75rem; }
  .camera-controls { margin-left: auto; }
  .camera-controls button { border-color: var(--work-muted); }
  .zoom-button { font-size: 22px; padding: 0; }
  .scene-area { flex: 0 0 auto; height: min(72svh, 720px); min-height: 22rem; position: relative; }
  @media (max-width: 639px) {
    .scene-heading { padding-top: 10px; }
    .scene-toolbar { gap: 6px; }
    .focus-controls { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); flex-basis: 100%; }
    .focus-controls button { white-space: nowrap; }
    .camera-controls { width: 100%; }
    .camera-controls button:last-child { flex: 1; }
  }
  canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; }
  .render-status { position: absolute; top: 35%; left: var(--gutter); right: var(--gutter); padding: 16px; margin: 0; background: var(--work-surface); color: var(--work-ink); font-size: .875rem; border: 1px solid var(--work-muted); }
  .render-status[hidden] { display: none; }
  .object-hint { position: absolute; transform: translate(-50%, -50%); background: var(--work-surface); color: var(--work-ink); border: 1px solid var(--work-muted); padding: 6px 10px; font-size: 12px; font-weight: 600; max-width: 150px; overflow-wrap: anywhere; pointer-events: none; text-align: center; }
  .inspection-tools, .dossier-controls { padding: 12px var(--gutter); border-top: 1px solid var(--work-line); }
  .inspection-tools { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 20px; }
  .inspection-tools p, .dossier-controls p { font-size: .8125rem; color: var(--work-muted); line-height: 1.6; margin-block: 8px; overflow-wrap: anywhere; }
  .inspection-tools button { border-color: var(--work-muted); }
  .inspection-tools a, .dossier-controls > a { display: inline-flex; align-items: center; min-height: 44px; font-size: .8125rem; }
  .steps { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
  .steps button { border-color: var(--work-muted); font-size: .875rem; }
  .steps span { display: block; font-size: .6875rem; }
  details { font-size: .875rem; }
  summary { cursor: pointer; min-height: 44px; padding-block: 10px; }
  details p, details li { max-width: 75ch; }
  details ul { padding-left: 20px; }
  .fallback-image { width: 100%; max-height: 70svh; object-fit: contain; }
  footer { border-top: 1px solid var(--work-line); padding-bottom: max(8px, env(safe-area-inset-bottom)); }
  footer p { flex: 1 1 28rem; margin: 0; font-size: .8125rem; line-height: 1.6; color: var(--work-ink); overflow-wrap: anywhere; }
  footer span { font-weight: 400; color: var(--work-muted); }
  footer div { display: flex; flex-wrap: wrap; gap: 4px 8px; }
  footer button { text-decoration: underline; text-underline-offset: 4px; }
  #bench-controls { margin: 16px var(--gutter); padding: 20px; background: var(--work-surface); border: 1px solid var(--work-line); }
  #bench-controls[hidden] { display: none; }
  h2 { font-size: 20px; color: inherit; margin: 0 0 16px; }
  h3 { font-size: 14px; color: inherit; margin: 20px 0 8px; }
  .controls { display: flex; flex-wrap: wrap; gap: 8px; }
  .controls button { border-color: var(--work-muted); }
  button[aria-pressed='true'] { background: var(--work-active-bg); color: var(--work-active-ink); font-weight: 700; }
  .view-nav button[aria-pressed='true'], .focus-controls button[aria-pressed='true'] { text-decoration: underline; text-underline-offset: 4px; }
  button:disabled { opacity: .55; cursor: not-allowed; }
  button:not(:disabled):hover, a:hover { text-decoration: underline; }
  button:not(:disabled):active { text-decoration: underline; text-underline-offset: 3px; }
  .end { margin-top: 20px; }
  :is(button, a, summary, section, main, h2):focus-visible { outline: 3px solid var(--work-accent); outline-offset: 3px; }
  .skip-link { position: fixed; top: -120px; left: 16px; z-index: 9; padding: 12px; background: var(--work-paper); }
  .skip-link:focus { top: 12px; }
  @media (min-width: 640px) {
    .workbench { --gutter: 24px; }
    .byline span { display: inline; }
    .view-nav { display: flex; flex-wrap: wrap; }
    .view-nav button { padding-inline: 20px; font-size: .8125rem; }
    .focus-controls { flex: 0 1 auto; }
    .focus-controls button { flex: initial; padding-inline: 12px; font-size: .8125rem; }
  }
  @media (min-width: 1080px) {
    .workbench { --gutter: 32px; }
    .menu-toggle { display: none; }
    #portfolio-links, #portfolio-links.expanded { display: flex; flex: 0 1 auto; flex-wrap: wrap; }
  }
  .camera-disclosure { padding-inline: var(--gutter); }
  .camera-disclosure > summary { width: fit-content; color: var(--work-muted); }
  .camera-disclosure .scene-toolbar { padding: 4px 0 12px; }
  .project-picker { display: flex; align-items: center; gap: 12px; margin-left: auto; font-size: .8125rem; color: var(--work-muted); min-width: 0; }
  select { min-height: 44px; max-width: 100%; min-width: 0; padding: 8px 32px 8px 12px; border: 1px solid var(--work-muted); border-radius: 4px; background: var(--work-surface); color: var(--work-ink); font: inherit; }
  select:focus-visible { outline: 3px solid var(--work-accent); outline-offset: 3px; }
  .telemetry { margin-block: 12px; color: var(--work-muted); font-size: .75rem; }
  @media (max-width: 639px) {
    .scene-area { height: 56svh; min-height: 18rem; }
    .scene-heading { gap: 12px; }
    .project-picker { width: 100%; margin: 0; }
    .project-picker select { flex: 1; }
    .inspection-tools { gap: 6px 12px; padding-block: 8px; }
    .inspection-tools p { flex-basis: 100%; margin-block: 0; }
  }
  @media (forced-colors: active) {
    :is(button, a, summary, section, main, h2):focus-visible { outline-color: Highlight; }
    button[aria-pressed='true'] { border-color: Highlight; outline: 2px solid Highlight; outline-offset: -3px; }
  }
</style>
