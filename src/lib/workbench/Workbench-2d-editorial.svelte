<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { base } from '$app/paths';
  import { INITIAL_STATE, MODULES, transition, outcome } from './system-state.mjs';
  import { PROJECT_MEDIA } from './project-media';
  import { PROFILE, TECHNICAL_SKILLS, CERTIFICATIONS } from '$lib/spine/spine-data';
  import { JOURNEY_STEPS } from './journey-data';
  import ContactModal from './ContactModal.svelte';
  import { initPreferences, getTheme, getLocale, toggleTheme, toggleLocale } from './preferences.svelte';
  import type { WorkbenchWorld, Part, BenchState, FocusView } from './WorkbenchWorld';
  import type { DossierView } from './DossierStation';

  let canvas: HTMLCanvasElement;
  let world: WorkbenchWorld | undefined;
  let benchState = $state<BenchState>({ ...INITIAL_STATE });
  let inserted = $state(false);
  let inspection = $state<'data' | 'router' | null>(null);
  let view = $state<'desk' | DossierView>('desk');
  let focus = $state<FocusView>('panoramic');
  let ready = $state(false);
  let failed = $state(false);
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
  let catalogueOpen = $state(false);
  let readingIndex = $state(0);
  let announcement = $state('');
  const readingProject = $derived(MODULES[readingIndex]);
  let loadingProgress = $state(18);
  let loadingStage = $state<'engine' | 'scene' | 'ready'>('engine');
  let showLoader = $state(true);
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
  const allowed = $derived(benchState.connected && benchState.identity === 'owner');
  const projecting = $derived(allowed && inserted);
  const step = $derived(JOURNEY_STEPS[journeyStep]);
  const skill = $derived(TECHNICAL_SKILLS[skillCategory]);

  const hoverLabel = $derived.by(() => {
    if (!hover) return null;
    if (hover.startsWith('project:')) return MODULES[Number(hover.split(':')[1])]?.name ?? null;
    if (hover.startsWith('journey:')) {
      const item = JOURNEY_STEPS[Number(hover.split(':')[1])];
      const yr = locale === 'en' ? item?.yearShort.replace('Kini', 'Present') : item?.yearShort;
      return item ? `${yr} · ${item.org}` : null;
    }
    if (hover.startsWith('skills:')) {
      return TECHNICAL_SKILLS[Number(hover.split(':')[1])]?.category[locale] ?? null;
    }
    if (hover === 'profile') return t('Profil & Peranan', 'Profile & Role');
    if (hover === 'cable') return t('Kabel Homelab', 'Homelab cable');
    if (hover === 'owner') return t('Kad Pemilik (NFC)', 'Owner Card (NFC)');
    if (hover === 'visitor') return t('Kad Pelawat (NFC)', 'Visitor Card (NFC)');
    if (hover === 'router') return 'Homelab ZTA';
    if (hover === 'screen' || hover === 'data') return projecting ? module.name : null;
    return null;
  });

  const isInitialHero = $derived(
    view === 'desk' &&
    focus === 'panoramic' &&
    !benchState.connected &&
    benchState.identity === null &&
    !inserted
  );

  const title = $derived(
    view === 'profile'
      ? t('Profil & Tanggungjawab Sistem', 'Profile & Systems Role')
      : view === 'journey'
        ? t('Kronologi Kerjaya', 'Career Chronology')
        : view === 'skills'
          ? t('Kemahiran & Timbunan Teknologi', 'Skills & Tech Stack')
          : focus === 'console' || focus === 'rack' || focus === 'router' || focus === 'data' || focus === 'screen'
            ? t('Konsol & Arkib Projek', 'Project Console & Archive')
            : t('Di Sebalik Sistem.', 'Behind the Systems.')
  );

  function syncWorld() { world?.setState({ ...benchState, inserted }); }

  function selectModule(index: number) {
    view = 'desk';
    if (focus === 'profile' || focus === 'journey' || focus === 'skills') {
      focus = 'console';
      world?.setFocus('console');
    }
    if (inserted && benchState.module === index) {
      inserted = false;
      if (inspection === 'data') setInspection(null);
    } else {
      benchState = transition(benchState, { type: 'select_module', index });
      inserted = true;
      sampleIndex = 0;
    }
    syncWorld();
  }

  async function selectZone(nextFocus: 'panoramic' | 'console' | 'profile' | 'journey' | 'skills') {
    const leavingPanel = document.getElementById('bench-controls')?.contains(document.activeElement)
      || document.activeElement?.closest('.project-guide.is-hero');
    inspection = null;
    playing = false;
    help = false;
    menuOpen = false;
    view = nextFocus === 'panoramic' || nextFocus === 'console' ? 'desk' : nextFocus;
    focus = nextFocus;
    world?.setFocus(nextFocus);
    await tick();
    announcement = title;
    if (leavingPanel) heading?.focus();
  }

  async function openControls() {
    help = true;
    await tick();
    document.getElementById('bench-controls')?.focus();
  }

  async function openCatalogue() {
    catalogueOpen = true;
    await tick();
    document.getElementById('project-reader')?.focus();
  }

  function selectDeskFocus(next: 'panoramic' | 'console' | 'rack' | 'router') {
    view = 'desk';
    inspection = next === 'router' ? 'router' : null;
    focus = next;
    world?.setFocus(next);
  }

  function resetCamera() {
    inspection = null;
    playing = false;
    view = 'desk';
    focus = 'panoramic';
    world?.setFocus('panoramic');
    world?.resetCamera();
  }

  function selectStep(index: number) {
    journeyStep = index;
    world?.setJourneyStep(index);
    announcement = `${index + 1}/${JOURNEY_STEPS.length}: ${JOURNEY_STEPS[index].title[locale]}`;
  }

  function selectSkill(index: number) {
    skillCategory = index;
    world?.setSkillCategory(index);
    announcement = `${TECHNICAL_SKILLS[index].category[locale]}: ${TECHNICAL_SKILLS[index].skills.join(', ')}`;
  }

  function setInspection(next: typeof inspection) {
    const returning = returnButton && document.activeElement === returnButton;
    inspection = next;
    if (next) {
      view = 'desk';
      focus = next;
      world?.setFocus(next);
      requestAnimationFrame(() => returnButton?.focus({ preventScroll: true }));
    } else {
      focus = view === 'desk' ? 'console' : view;
      world?.setFocus(focus);
      if (returning) requestAnimationFrame(() => (ready ? panoramicButton : heading)?.focus({ preventScroll: true }));
    }
  }

  function nextSample() {
    if (media.slides.length < 2) return;
    sampleIndex = (sampleIndex + 1) % media.slides.length;
    world?.nextSample();
    const current = media.slides[sampleIndex];
    announcement = `${module.name}: ${locale === 'en' ? current?.labelEn : current?.label}`;
  }

  function action(part: Part) {
    if (part === 'profile') {
      view = 'profile';
      focus = 'profile';
      inspection = null;
      playing = false;
      world?.setFocus('profile');
      return;
    }
    if (part.startsWith('journey:')) {
      playing = false;
      view = 'journey';
      focus = 'journey';
      inspection = null;
      selectStep(Number(part.split(':')[1]));
      world?.setFocus('journey');
      return;
    }
    if (part.startsWith('skills:')) {
      view = 'skills';
      focus = 'skills';
      inspection = null;
      playing = false;
      selectSkill(Number(part.split(':')[1]));
      world?.setFocus('skills');
      return;
    }
    if (part.startsWith('project:')) {
      selectModule(Number(part.split(':')[1]));
      return;
    }
    if (part === 'screen' || part === 'data') {
      if (!projecting) return;
      if (inspection === 'data') {
        if (media.slides.length > 1) nextSample();
        else setInspection(null);
      } else setInspection('data');
      return;
    }
    if (part === 'router') {
      setInspection(inspection === 'router' ? null : 'router');
      return;
    }
    if (part === 'module') {
      selectModule(inserted ? (benchState.module + 1) % MODULES.length : benchState.module);
      return;
    }
    view = 'desk';
    if (focus === 'profile' || focus === 'journey' || focus === 'skills') {
      focus = 'console';
      world?.setFocus('console');
    }
    benchState = transition(benchState, part === 'cable' ? { type: 'connect' } : part === 'lid' ? { type: 'open' } : { type: 'identity', value: part });
    syncWorld();
    if ((!benchState.connected || benchState.identity !== 'owner') && inspection === 'data') setInspection(null);
  }

  function reset() {
    benchState = { ...INITIAL_STATE };
    inserted = false;
    sampleIndex = 0;
    syncWorld();
    resetCamera();
  }

  function pause() {
    paused = !paused;
    if (paused) playing = false;
    world?.setPaused(paused);
  }

  function closeHelp() {
    help = false;
    helpButton?.focus();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key !== 'Escape' || contact) return;
    const cameraMenu = e.target instanceof Element ? e.target.closest<HTMLDetailsElement>('.camera-menu') : null;
    if (cameraMenu?.open) {
      e.preventDefault();
      cameraMenu.open = false;
      cameraMenu.querySelector('summary')?.focus();
      return;
    }
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

  onMount(() => {
    initPreferences();
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => { reduced = motion.matches; if (reduced) playing = false; };
    updateMotion();
    motion.addEventListener('change', updateMotion);
    let disposed = false;

    const progressTimer = setInterval(() => {
      if (ready || failed) return;
      if (loadingProgress < 64) {
        loadingProgress = Math.min(64, loadingProgress + 6);
      }
    }, 100);

    import('./WorkbenchWorld').then(({ WorkbenchWorld }) => {
      clearInterval(progressTimer);
      if (disposed) return;
      loadingProgress = 76;
      loadingStage = 'scene';
      try {
        world = new WorkbenchWorld(canvas, {
          action,
          hover: value => hover = value,
          anchors: value => anchors = value,
          failure: () => { failed = true; ready = false; showLoader = true; }
        });
        syncWorld();
        world.setTheme(getTheme());
        world.setLocale(getLocale());
        world.setFocus(focus);
        world.setJourneyStep(journeyStep);
        world.setSkillCategory(skillCategory);
        world.setPaused(paused);
        loadingProgress = 100;
        loadingStage = 'ready';
        ready = true;
        if (reduced) {
          showLoader = false;
        } else {
          setTimeout(() => {
            if (!disposed) showLoader = false;
          }, 300);
        }
      } catch {
        world?.dispose();
        world = undefined;
        ready = false;
        failed = true;
        showLoader = true;
      }
    }).catch(() => { clearInterval(progressTimer); if (!disposed) { failed = true; showLoader = true; } });
    return () => {
      disposed = true;
      clearInterval(progressTimer);
      motion.removeEventListener('change', updateMotion);
      world?.dispose();
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />
<svelte:head>
  <title>Muhammed Munir | Full-Stack Developer: {t('Di Sebalik Sistem', 'Behind the Systems')}</title>
  <meta
    name="description"
    content={t(
      'Portfolio rasmi Muhammed Munir, Full-Stack Developer di YHCM Sdn Bhd. Penyelenggaraan sistem sektor awam (EMESYS, SUTERA, ADiMS), pembangunan modul baharu dan pembaikan pepijat.',
      'Official portfolio of Muhammed Munir, Full-Stack Developer at YHCM Sdn Bhd. Public-sector system maintenance (EMESYS, SUTERA, ADiMS), new module development, and bug fixing.'
    )}
  />
</svelte:head>

<div class="workbench">
  <p class="sr-only" role="status" aria-atomic="true">{announcement}</p>
  <a class="skip-link" href="#workbench-main">{t('Langkau ke kandungan', 'Skip to content')}</a>
  <a class="skip-link" href="#bench-controls" onclick={openControls}>{t('Langkau ke kawalan instrumen', 'Skip to instrument controls')}</a>

  <header>
    <a class="identity" href={`${base}/`}>munir<span>.</span></a>
    <p class="byline">Muhammed Munir <span aria-hidden="true"> · </span> <span>Full-Stack Developer</span></p>
    <button type="button" class="menu-toggle" bind:this={menuButton} aria-expanded={menuOpen} aria-controls="portfolio-links" onclick={() => menuOpen = !menuOpen}>{menuOpen ? t('Tutup', 'Close') : 'Menu'}</button>
    <nav id="portfolio-links" class:expanded={menuOpen} aria-label={t('Navigasi portfolio', 'Portfolio navigation')}>
      <button type="button" onclick={changeLocale} lang={locale === 'ms' ? 'en' : 'ms'}>{locale === 'ms' ? 'English' : 'Bahasa Melayu'}</button>
      <button type="button" class="theme-toggle" onclick={changeTheme} aria-pressed={theme === 'dark'}>{theme === 'dark' ? t('Tema cerah', 'Light') : t('Tema gelap', 'Dark')}</button>
      <a href={`${base}/cv`}>{t('Resume', 'Resume')}</a>
      <button type="button" aria-haspopup="dialog" onclick={() => contact = true}>{t('Hubungi', 'Contact')}</button>
    </nav>
  </header>

  <main id="workbench-main" tabindex="-1">
    <div class="scene-toolbar" class:is-intro={isInitialHero}>
      <div class="zone-bar">
        <h1 bind:this={heading} tabindex="-1">{title}</h1>
        <div class="focus-controls" role="group" aria-label={t('Fokus ruang 3D', '3D workspace focus')}>
          <button type="button" bind:this={panoramicButton} class="nav-btn nav-overview" disabled={!ready} aria-pressed={focus === 'panoramic'} onclick={() => selectZone('panoramic')}>
            <span class="nav-icon" aria-hidden="true">↩</span><span class="nav-label">{t('GAMBARAN', 'OVERVIEW')}</span>
          </button>
          <button type="button" class="nav-btn" disabled={!ready} aria-pressed={focus === 'profile'} onclick={() => selectZone('profile')}>
            <span class="nav-num" aria-hidden="true">01</span><span class="nav-sep" aria-hidden="true">//</span><span class="nav-label">{t('DOSSIER', 'DOSSIER')}</span>
          </button>
          <button type="button" class="nav-btn" disabled={!ready} aria-pressed={focus === 'console' || focus === 'rack' || focus === 'router' || focus === 'data' || focus === 'screen'} onclick={() => selectZone('console')}>
            <span class="nav-num" aria-hidden="true">02</span><span class="nav-sep" aria-hidden="true">//</span><span class="nav-label">{t('SISTEM', 'SYSTEMS')}</span>
          </button>
          <button type="button" class="nav-btn" disabled={!ready} aria-pressed={focus === 'journey'} onclick={() => selectZone('journey')}>
            <span class="nav-num" aria-hidden="true">03</span><span class="nav-sep" aria-hidden="true">//</span><span class="nav-label">{t('GARIS MASA', 'TIMELINE')}</span>
          </button>
          <button type="button" class="nav-btn" disabled={!ready} aria-pressed={focus === 'skills'} onclick={() => selectZone('skills')}>
            <span class="nav-num" aria-hidden="true">04</span><span class="nav-sep" aria-hidden="true">//</span><span class="nav-label">{t('KEUPAYAAN', 'CAPABILITY')}</span>
          </button>
        </div>
      </div>

      <details class="camera-menu">
        <summary>{t('Kamera', 'Camera')}</summary>
        <div class="camera-controls" role="group" aria-label={t('Kawalan kamera', 'Camera controls')}>
          <button type="button" disabled={!ready} onclick={() => world?.zoomBy(-0.12)}>{t('Zum dekat', 'Zoom in')}</button>
          <button type="button" disabled={!ready} onclick={() => world?.zoomBy(0.12)}>{t('Zum jauh', 'Zoom out')}</button>
          <button type="button" disabled={!ready} onclick={resetCamera}>{t('Reset kamera', 'Reset camera')}</button>
        </div>
      </details>
    </div>

    {#if view === 'desk'}
      <section class="project-guide" class:is-hero={isInitialHero} aria-label={isInitialHero ? t('Pengenalan profesional', 'Professional introduction') : t('Panduan projek', 'Project guide')}>
        {#if isInitialHero}
          <p class="hero-tagline">{t('Saya bina sistem di sebalik tabir.', 'I build the systems behind the scenes.')}</p>
          <p class="hero-sub">
            {t(
              'Full-Stack Developer di YHCM Sdn Bhd. Penyelenggaraan dan pembangunan modul baharu untuk sistem sektor awam (EMESYS, SUTERA, ADiMS). Ijazah Sains Komputer (Keselamatan Rangkaian), UTM.',
              'Full-Stack Developer at YHCM Sdn Bhd. Maintaining and building new modules for public-sector systems (EMESYS, SUTERA, ADiMS). BSc Computer Science (Network Security), UTM.'
            )}
          </p>
          <div class="hero-status" aria-label={t('Status profesional', 'Professional status')}>
            <span class="status-dot" aria-hidden="true"></span>
            <span>{t('Tersedia', 'Available')}</span>
            <span class="status-sep" aria-hidden="true">//</span>
            <span>Puchong, Selangor, MY</span>
            <span class="status-sep" aria-hidden="true">//</span>
            <span>Full-Stack · Network Security</span>
          </div>
          <div class="guide-actions">
            <button type="button" class="cta-primary" disabled={!ready} onclick={() => selectZone('console')}>{t('Buka Konsol Projek', 'Open Project Console')}</button>
            <a class="cta-link" href={`${base}/cv`}>{t('Lihat Resume', 'View Resume')}</a>
          </div>
        {:else}
          <p>{!benchState.connected
            ? t('Sambungkan kabel Homelab untuk memulakan simulasi.', 'Connect the Homelab cable to start the simulation.')
            : benchState.identity !== 'owner'
              ? t('Imbas kad pemilik pada NFC. Kad pelawat menunjukkan akses disekat.', 'Scan the owner card on NFC. The visitor card demonstrates denied access.')
              : !inserted
                ? t('Pilih kaset projek untuk menghidupkan hologram.', 'Select a project cartridge to activate the hologram.')
                : t('Hologram aktif. Pilih kaset lain untuk menukar projek.', 'Hologram active. Select another cartridge to change project.')}</p>
          <div class="guide-actions">
            <button type="button" onclick={openCatalogue}>{t('Baca projek', 'Read projects')}</button>
            <button type="button" onclick={openControls}>{t('Kawalan simulasi', 'Simulation controls')}</button>
          </div>
        {/if}
      </section>
    {/if}

    <div class="scene-area">
      <canvas bind:this={canvas} aria-label={t('Studio kerja portfolio 3D berpijak lantai. Seret untuk berputar, tatal untuk zum, klik simbol 3D atau gunakan butang fokus di atas dan kawalan alternatif di bawah.', 'Grounded 3D portfolio workspace studio. Drag to orbit, scroll to zoom, click 3D symbols, or use the focus buttons above and alternative controls below.')}></canvas>
      {#if showLoader || failed}
        <div
          class="studio-loader"
          class:exiting={ready && !failed}
          class:failed
          role="status"
          aria-live="polite"
          aria-label={failed
            ? t('Studio 3D tidak dapat dimuatkan', 'The 3D studio could not load')
            : t('Menyediakan studio kerja 3D', 'Preparing 3D studio workspace')}
        >
          <div class="loader-card">
            <div class="loader-head">
              <div class="loader-badge">
                <span class="loader-led" class:online={ready && !failed} class:alert={failed}></span>
                <span class="loader-tag">
                  {failed ? t('DIAGNOSTIK SISTEM', 'SYSTEM DIAGNOSTIC') : loadingStage === 'ready' ? t('WORKBENCH // SIAP', 'WORKBENCH // READY') : t('WORKBENCH // MEMULAKAN', 'WORKBENCH // INITIALIZING')}
                </span>
              </div>
              <span class="loader-meter" aria-hidden="true">
                {failed ? 'OFFLINE' : `${Math.round(loadingProgress)}%`}
              </span>
            </div>

            <div class="loader-body">
              <div class="loader-icon-wrap" aria-hidden="true">
                <svg viewBox="0 0 44 44" class="loader-icon" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 6L38 15V22L22 31L6 22V15L22 6Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                  <path d="M22 18L32 12.5M22 18L12 12.5M22 18V30" stroke="currentColor" stroke-width="1.4" stroke-opacity="0.55"/>
                  <path d="M10 24.5V35.5M34 24.5V35.5M22 31V38.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="loader-copy">
                <strong class="loader-title">
                  {failed
                    ? t('Studio 3D tidak dapat dimuatkan', 'The 3D studio could not load')
                    : t('Menyediakan Meja Kerja 3D', 'Preparing 3D Workbench')}
                </strong>
                <p class="loader-detail">
                  {#if failed}
                    {t('Pemuatan enjin atau konteks grafik terganggu. Cuba muat semula halaman; maklumat portfolio masih tersedia melalui kawalan teks dan Resume.', 'The engine or graphics context could not load. Try reloading the page; portfolio information remains available through text controls and Resume.')}
                  {:else if loadingStage === 'engine'}
                    {t('Memuat enjin WebGL…', 'Loading WebGL engine…')}
                  {:else if loadingStage === 'scene'}
                    {t('Menyediakan studio…', 'Setting up studio…')}
                  {:else}
                    {t('Studio sedia', 'Studio ready')}
                  {/if}
                </p>
              </div>
            </div>

            {#if !failed}
              <div class="loader-track" aria-hidden="true">
                <div class="loader-bar" style:width={`${loadingProgress}%`}></div>
              </div>
            {:else}
              <div class="loader-actions">
                <a class="loader-btn primary" href={`${base}/cv`}>{t('Buka Resume', 'Open Resume')}</a>
                <button type="button" class="loader-btn" onclick={openControls}>{t('Kawalan Alternatif', 'Alternative Controls')}</button>
              </div>
            {/if}
          </div>
        </div>
      {/if}
      {#if ready && !inspection && hoverLabel && hover && anchors[hover]}
        <span class="object-hint" style:left={`clamp(80px, ${anchors[hover].x}px, calc(100% - 80px))`} style:top={`${Math.max(22, anchors[hover].y - 34)}px`}>{hoverLabel}</span>
      {/if}
    </div>

    {#if view !== 'desk'}
      <section class="dossier-controls" aria-label={t('Kawalan stesen', 'Station controls')}>
        <div class="dossier-row">
          {#if view === 'profile'}
            <p><strong>{PROFILE.shortName}</strong> · Full-Stack Developer @ YHCM Sdn Bhd: {t('Penyelenggaraan sistem, modul baharu & pembaikan pepijat (EMESYS, SUTERA, ADiMS).', 'System maintenance, new modules & bug fixing (EMESYS, SUTERA, ADiMS).')}</p>
          {:else if view === 'journey'}
            <div class="compact-nav" role="group" aria-label={t('Navigasi langkah perjalanan', 'Journey step navigation')}>
              <button type="button" disabled={journeyStep === 0} aria-label={t('Langkah sebelumnya', 'Previous step')} onclick={() => { playing = false; selectStep(journeyStep - 1); }}>{t('Sebelumnya', 'Previous')}</button>
              <button type="button" disabled={reduced || paused} aria-pressed={playing} onclick={() => { if (journeyStep === JOURNEY_STEPS.length - 1) selectStep(0); playing = !playing; }}>{playing ? t('Jeda', 'Pause') : t('Main', 'Play')}</button>
              <button type="button" disabled={journeyStep === JOURNEY_STEPS.length - 1} aria-label={t('Langkah seterusnya', 'Next step')} onclick={() => { playing = false; selectStep(journeyStep + 1); }}>{t('Seterusnya', 'Next')}</button>
            </div>
            <p><strong>0{journeyStep + 1}/0{JOURNEY_STEPS.length} · {step.title[locale]}</strong> ({step.period[locale]}) · {step.org} · {step.meta[locale]}</p>
          {:else if view === 'skills'}
            <div class="compact-nav" role="group" aria-label={t('Navigasi kategori kemahiran', 'Skill category navigation')}>
              <button type="button" disabled={skillCategory === 0} aria-label={t('Kategori sebelumnya', 'Previous category')} onclick={() => selectSkill(skillCategory - 1)}>{t('Sebelumnya', 'Previous')}</button>
              <button type="button" disabled={skillCategory === TECHNICAL_SKILLS.length - 1} aria-label={t('Kategori seterusnya', 'Next category')} onclick={() => selectSkill(skillCategory + 1)}>{t('Seterusnya', 'Next')}</button>
            </div>
            <p><strong>0{skillCategory + 1}/0{TECHNICAL_SKILLS.length} · {skill.category[locale]}</strong>: {skill.skills.join(' · ')}</p>
          {/if}
          <div class="dossier-links">
            <a href={`${base}/cv${view === 'skills' ? '#kemahiran' : view === 'journey' ? '#pengalaman' : ''}`}>{t('Lihat dalam Resume', 'Open Resume')}</a>
            <details open={failed}>
              <summary>{t('Butiran teks', 'Text details')}</summary>
              {#if view === 'profile'}<h2>{PROFILE.shortName}</h2><p>Full-Stack Developer · YHCM Sdn Bhd</p><p>{PROFILE.summary[locale]}</p>
              {:else if view === 'journey'}<h2>{step.title[locale]}</h2><p>{step.summary[locale]}</p>
              {:else}<h2>{skill.category[locale]}</h2><p>{skill.skills.join(' · ')}</p><h3>{t('Pensijilan', 'Certifications')}</h3><ul>{#each CERTIFICATIONS as cert}<li>{cert.title}</li>{/each}</ul>{/if}
            </details>
          </div>
        </div>
      </section>
    {:else if projecting || inspection === 'router'}
      <section class="inspection-tools" aria-label={t('Kawalan hologram', 'Hologram controls')}>
        {#if inspection}<button type="button" bind:this={returnButton} onclick={() => setInspection(null)}>{t('Pandangan penuh', 'Full view')}</button>
        {:else}<button type="button" onclick={() => setInspection('data')}>{t('Zum hologram', 'Zoom hologram')}</button>{/if}
        {#if projecting && inspection !== 'router'}
          <p><strong>{module.name}</strong> · {locale === 'en' ? sample?.labelEn ?? media.unavailableEn : sample?.label ?? media.unavailable}</p>
          {#if media.slides.length > 1}<button type="button" onclick={nextSample}>{t('Slaid seterusnya', 'Next slide')} ({sampleIndex + 1}/{media.slides.length})</button>{/if}
          {#if sample}<a href={`${base}${sample.src}`} target="_blank" rel="noreferrer">{t('Imej penuh', 'Full image')}</a>{/if}
          {#if failed && sample}<img class="fallback-image" src={`${base}${sample.src}`} alt={`${module.name}: ${locale === 'en' ? sample.labelEn : sample.label}`} />{/if}
        {:else}<a href={`${base}/cv#kemahiran`}>{t('Homelab dalam Resume', 'Homelab in Resume')}</a>{/if}
      </section>
    {/if}
    {#if catalogueOpen}
      <section id="project-reader" class="project-reader" tabindex="-1" aria-labelledby="project-reader-title">
        <div class="reader-heading">
          <h2 id="project-reader-title">{t('Ringkasan projek', 'Project summaries')}</h2>
          <button type="button" onclick={async () => { catalogueOpen = false; await tick(); heading?.focus(); }}>{t('Tutup ringkasan', 'Close summaries')}</button>
        </div>
        <p>{t('Bacaan ini tidak mengubah kad, kabel atau kebenaran projektor.', 'Reading does not change the card, cable or projector permissions.')}</p>
        <label for="reading-project">{t('Pilih projek', 'Choose a project')}</label>
        <select id="reading-project" bind:value={readingIndex}>
          {#each ['maintained', 'built'] as category}
            <optgroup label={category === 'maintained' ? t('Sistem disenggara', 'Maintained systems') : t('Projek dibangunkan', 'Built projects')}>
              {#each MODULES as item, index}{#if item.category === category}<option value={index}>{item.name}</option>{/if}{/each}
            </optgroup>
          {/each}
        </select>
        <article>
          <h3>{readingProject.name}</h3>
          <p>{locale === 'en' ? readingProject.roleEn : readingProject.role}</p>
          <p>{readingProject.stack.join(' · ')}</p>
          <p>{locale === 'en' ? readingProject.dataArchitectureEn : readingProject.dataArchitecture}</p>
          <p class="access-note">{locale === 'en' ? readingProject.accessLabelEn : readingProject.accessLabel}</p>
        </article>
      </section>
    {/if}
  </main>

  <footer>
    <p role="status">
      {#if view !== 'desk'}{t('Klik unit perkakasan 3D pada meja untuk memilih, atau buka Resume untuk butiran penuh.', 'Click 3D hardware units on the desk to inspect, or open Resume for full details.')}
      {:else if projecting}{module.name} <span>· {t('Projektor hologram aktif', 'Hologram projector active')}</span>
      {:else if allowed && !inserted}{t('Kad Pemilik sah. Pilih tab game pada rak.', 'Owner verified. Select a cartridge from the rack.')}
      {:else}{result.title} <span>· {result.detail}</span>{/if}
    </p>
    <div>
      <button type="button" onclick={pause} aria-pressed={paused}>{paused ? t('Sambung gerakan', 'Resume motion') : t('Hentikan gerakan', 'Pause motion')}</button>
      <button type="button" bind:this={helpButton} onclick={() => help = !help} aria-expanded={help} aria-controls="bench-controls">{t('Kawalan alternatif', 'Alternative controls')}</button>
    </div>
  </footer>

  <section id="bench-controls" hidden={!help} tabindex="-1" aria-label={t('Kawalan alternatif', 'Alternative controls')}>
    <h2>{t('Kawalan instrumen & zon meja', 'Instrument & desk zone controls')}</h2>
    <div class="controls">
      <button type="button" onclick={() => selectDeskFocus('panoramic')}>{t('Seluruh ruang', 'Full workspace')}</button>
      <button type="button" onclick={() => selectDeskFocus('console')}>{t('Konsol projektor', 'Projector console')}</button>
      <button type="button" onclick={() => selectDeskFocus('rack')}>{t('Rak projek', 'Project rack')}</button>
      <button type="button" onclick={() => selectDeskFocus('router')}>Homelab</button>
      <button type="button" onclick={() => selectZone('profile')}>{t('Profil', 'Profile')}</button>
      <button type="button" onclick={() => selectZone('journey')}>{t('Perjalanan', 'Journey')}</button>
      <button type="button" onclick={() => selectZone('skills')}>{t('Kemahiran', 'Skills')}</button>
    </div>
    <h3>{t('Operasi meja projek', 'Project desk operations')}</h3>
    <div class="controls">
      <button type="button" aria-pressed={benchState.connected} onclick={() => action('cable')}>{benchState.connected ? t('Cabut kabel Homelab', 'Disconnect Homelab cable') : t('Sambung kabel Homelab', 'Connect Homelab cable')}</button>
      <button type="button" aria-pressed={benchState.identity === 'visitor'} onclick={() => action('visitor')}>{t('Kad pelawat (NFC)', 'Visitor card (NFC)')}</button>
      <button type="button" aria-pressed={benchState.identity === 'owner'} onclick={() => action('owner')}>{t('Kad pemilik (NFC)', 'Owner card (NFC)')}</button>
      <button type="button" aria-pressed={benchState.opened} onclick={() => action('lid')}>{benchState.opened ? t('Tutup tudung optik', 'Close optical cover') : t('Buka tudung optik', 'Open optical cover')}</button>
    </div>
    {#each ['maintained', 'built'] as category}
      <h3>{category === 'maintained' ? t('Sistem Disenggara · YHCM', 'Maintained Systems · YHCM') : t('Projek Dibangunkan', 'Built Projects')}</h3>
      <div class="controls">{#each MODULES as item, index}{#if item.category === category}<button type="button" aria-pressed={inserted && benchState.module === index} onclick={() => selectModule(index)}>{item.code} · {item.name}</button>{/if}{/each}</div>
    {/each}
    {#if view === 'journey'}
      <h3>{t('Langkah Perjalanan (2017 - Kini)', 'Journey Milestones (2017 - Present)')}</h3>
      <div class="controls">{#each JOURNEY_STEPS as item, index}<button type="button" aria-pressed={journeyStep === index} onclick={() => { playing = false; selectStep(index); }}>0{index + 1} · {locale === 'en' ? item.yearShort.replace('Kini', 'Present') : item.yearShort}</button>{/each}</div>
    {:else if view === 'skills'}
      <h3>{t('Domain Kemahiran Teknikal', 'Technical Skill Domains')}</h3>
      <div class="controls">{#each TECHNICAL_SKILLS as category, index}<button type="button" aria-pressed={skillCategory === index} onclick={() => selectSkill(index)}>{category.category[locale]}</button>{/each}</div>
    {/if}
    <div class="controls end"><button type="button" onclick={reset}>{t('Set semula', 'Reset')}</button><button type="button" onclick={closeHelp}>{t('Tutup kawalan', 'Close controls')}</button></div>
  </section>
</div>
<ContactModal open={contact} {locale} onclose={() => contact = false} />

<style>
  .workbench { --gutter: 16px; min-height: 100svh; min-height: 100dvh; background: var(--work-paper); color: var(--work-ink); display: flex; flex-direction: column; position: relative; }
  header, footer { padding: 6px var(--gutter); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px 14px; position: relative; }
  header { border-bottom: 1px solid var(--work-line); }
  .identity { display: inline-flex; align-items: center; min-height: 44px; font-family: var(--font-heading); font-size: 26px; line-height: 1; font-weight: 800; letter-spacing: -.07em; text-decoration: none; }
  .identity span { color: var(--work-accent); }
  .byline { flex: 1; margin: 0; color: var(--work-muted); font-size: 12px; line-height: 1.3; min-width: 0; }
  .byline span:first-of-type { display: none; }
  .byline span:last-of-type { display: block; font-size: 11px; color: var(--work-muted); }
  a, button { color: inherit; }
  button, a, summary { -webkit-tap-highlight-color: transparent; }
  button { min-height: 44px; min-width: 44px; padding: 8px 12px; font-size: .8125rem; line-height: 1.35; border: 1px solid transparent; border-radius: 4px; white-space: normal; overflow-wrap: anywhere; cursor: pointer; }
  a { overflow-wrap: anywhere; text-underline-offset: 4px; }
  .menu-toggle { border-color: var(--work-muted); }
  #portfolio-links { display: none; flex-basis: 100%; min-width: 0; gap: 6px; }
  #portfolio-links.expanded { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); padding-top: 8px; border-top: 1px solid var(--work-line); }
  #portfolio-links a, #portfolio-links button { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 8px 10px; font-size: .8125rem; border: 1px solid var(--work-muted); border-radius: 4px; background: var(--work-surface); text-decoration: none; }
  main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
  .scene-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px 14px; padding: 6px var(--gutter); border-bottom: 1px solid var(--work-line); }
  .zone-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; flex: 1 1 24rem; min-width: 0; }
  h1 { flex-shrink: 0; font-family: var(--font-heading); font-size: clamp(18px, 1.8vw, 22px); line-height: 1.2; letter-spacing: -.03em; margin: 0; color: inherit; }
  .focus-controls, .camera-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; min-width: 0; }
  .focus-controls { flex: 1 1 18rem; }
  .focus-controls button { padding: 8px 10px; font-size: .75rem; font-weight: 600; }
  .nav-btn { display: inline-flex; align-items: center; gap: 5px; padding: 7px 10px; }
  .nav-num { font-family: var(--font-mono); font-size: .625rem; font-weight: 700; letter-spacing: .04em; color: var(--work-muted); line-height: 1; flex-shrink: 0; }
  .nav-sep { font-family: var(--font-mono); font-size: .5rem; color: var(--work-muted); opacity: .4; line-height: 1; flex-shrink: 0; }
  .nav-label { font-family: var(--font-mono); font-size: .625rem; font-weight: 700; letter-spacing: .07em; line-height: 1; }
  .nav-overview .nav-icon { font-size: .75rem; color: var(--work-muted); line-height: 1; }
  .nav-overview .nav-label { font-family: var(--font-mono); font-size: .625rem; font-weight: 700; letter-spacing: .07em; }
  .focus-controls button[aria-pressed='true'] .nav-num,
  .focus-controls button[aria-pressed='true'] .nav-sep { color: var(--work-active-ink); opacity: 1; }
  .camera-controls { margin-left: auto; }
  .camera-controls button { border-color: var(--work-muted); }
  .camera-menu { position: relative; flex: 0 0 auto; }
  .camera-menu > summary { border: 1px solid var(--work-muted); border-radius: 4px; padding: 10px 12px; line-height: 1.2; font-size: .8125rem; }
  .camera-menu[open] { flex-basis: 100%; }
  .camera-menu > summary { width: fit-content; margin-left: auto; }
  .camera-controls { position: static; width: min(100%, 28rem); margin-top: 6px; padding: 10px; background: var(--work-surface); border: 1px solid var(--work-muted); }
  .camera-controls button { flex: 1 1 auto; }
  .project-guide { padding: 8px var(--gutter); display: flex; flex-wrap: wrap; align-items: center; gap: 6px 18px; border-bottom: 1px solid var(--work-line); background: var(--work-surface); }
  .scene-toolbar.is-intro { padding-block: 20px 12px; }
  .is-intro .zone-bar { gap: 12px 32px; }
  .is-intro h1 { font-size: clamp(1.75rem, 3.2vw, 3rem); line-height: 1.1; letter-spacing: -.035em; text-wrap: balance; }
  .project-guide.is-hero { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 28px; padding-block: 12px 14px; background: var(--work-surface); flex-direction: row; }
  .project-guide.is-hero p { flex: 0 1 auto; }
  .hero-tagline { margin: 0; font-family: var(--font-heading); font-size: clamp(1.125rem, 1.8vw, 1.375rem); font-weight: 800; line-height: 1.2; letter-spacing: -.03em; color: var(--work-ink); }
  .hero-sub { margin: 0; max-width: 62ch; font-size: .84375rem; line-height: 1.48; color: var(--work-muted); text-wrap: pretty; }
  .hero-status { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; font-family: var(--font-mono); font-size: .6875rem; font-weight: 700; letter-spacing: .06em; color: var(--work-muted); text-transform: uppercase; }
  .status-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px #22c55e88; flex-shrink: 0; }
  .status-sep { opacity: .4; }
  .is-hero .guide-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-left: auto; }
  .is-hero .guide-actions button, .is-hero .guide-actions .cta-link { padding: 9px 16px; line-height: 1.35; }
  .project-guide p { flex: 1 1 20rem; margin: 0; font-size: .875rem; line-height: 1.45; color: var(--work-ink); }
  .guide-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
  .guide-actions button, .reader-heading button { border-color: var(--work-muted); }
  .guide-actions .cta-primary { background: var(--work-active-bg); border-color: var(--work-active-bg); color: var(--work-active-ink); font-weight: 700; }
  .guide-actions .cta-link { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; min-width: 44px; padding: 8px 14px; font-size: .8125rem; font-weight: 600; border: 1px solid var(--work-muted); border-radius: 4px; text-decoration: none; color: var(--work-ink); }
  .project-reader { padding: 24px var(--gutter); border-top: 1px solid var(--work-muted); background: var(--work-surface); }
  .reader-heading { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; }
  .reader-heading h2 { margin: 0; }
  .project-reader p { max-width: 75ch; font-size: 1rem; line-height: 1.65; }
  .project-reader label { display: block; margin-bottom: 8px; font-weight: 600; }
  .project-reader select { display: block; width: min(100%, 30rem); min-height: 44px; border: 1px solid var(--work-muted); padding: 10px; background: var(--work-paper); color: var(--work-ink); font: inherit; }
  .project-reader h3 { font-size: 1.25rem; }
  .access-note { color: var(--work-muted); }
  .scene-area { flex: 1 1 24rem; min-height: 22rem; position: relative; }
  canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; }
  .studio-loader { position: absolute; inset: 0; z-index: 4; display: grid; place-items: center; padding: var(--gutter); background: var(--work-paper); transition: opacity 280ms ease, visibility 280ms ease; }
  .studio-loader.exiting { opacity: 0; visibility: hidden; pointer-events: none; }
  .studio-loader.exiting .loader-card { transform: scale(0.985); opacity: 0; }
  .loader-card { width: min(440px, 100%); background: var(--work-surface); border: 1px solid var(--work-line); border-radius: 10px; padding: 18px 20px; box-shadow: 0 18px 48px rgba(0, 0, 0, 0.24); transition: transform 280ms ease, opacity 280ms ease; }
  .loader-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--work-line); }
  .loader-badge { display: inline-flex; align-items: center; gap: 8px; min-width: 0; }
  .loader-led { width: 8px; height: 8px; border-radius: 2px; background: var(--work-accent); flex-shrink: 0; }
  .loader-led.online { background: #10b981; }
  .loader-led.alert { background: #ef4444; }
  .loader-tag { font-family: var(--font-mono); font-size: .6875rem; font-weight: 700; letter-spacing: .05em; color: var(--work-muted); overflow-wrap: anywhere; }
  .loader-meter { font-family: var(--font-mono); font-size: .75rem; font-weight: 700; color: var(--work-ink); font-variant-numeric: tabular-nums; flex-shrink: 0; }
  .loader-body { display: flex; align-items: flex-start; gap: 14px; padding-top: 14px; }
  .loader-icon-wrap { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 8px; background: var(--work-paper); border: 1px solid var(--work-line); color: var(--work-accent); flex-shrink: 0; }
  .studio-loader.failed .loader-icon-wrap { color: #ef4444; }
  .loader-icon { width: 28px; height: 28px; }
  .loader-copy { min-width: 0; flex: 1; }
  .loader-title { display: block; font-family: var(--font-heading); font-size: .9375rem; font-weight: 700; color: var(--work-ink); line-height: 1.3; }
  .loader-detail { margin: 4px 0 0; font-size: .8125rem; color: var(--work-muted); line-height: 1.45; overflow-wrap: anywhere; }
  .loader-track { height: 4px; width: 100%; background: var(--work-line); border-radius: 2px; overflow: hidden; margin-top: 16px; }
  .loader-bar { height: 100%; background: var(--work-accent); border-radius: 2px; transition: width 180ms cubic-bezier(0.2, 0.8, 0.2, 1); }
  .loader-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
  .loader-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 8px 14px; font-size: .8125rem; font-weight: 600; border: 1px solid var(--work-line); border-radius: 6px; text-decoration: none; background: transparent; color: var(--work-ink); cursor: pointer; }
  .loader-btn.primary { background: var(--work-active-bg); border-color: var(--work-active-bg); color: var(--work-active-ink); }
  @media (prefers-reduced-motion: reduce) {
    .studio-loader, .loader-card, .loader-bar { transition: none; }
  }
  .object-hint { position: absolute; transform: translate(-50%, -50%); background: var(--work-surface); color: var(--work-ink); border: 1px solid var(--work-muted); padding: 6px 10px; font-size: 12px; font-weight: 600; max-width: 170px; overflow-wrap: anywhere; pointer-events: none; text-align: center; }
  .inspection-tools, .dossier-controls { padding: 8px var(--gutter); border-top: 1px solid var(--work-line); }
  .inspection-tools { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; }
  .dossier-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; }
  .dossier-row > p { flex: 1 1 20rem; margin: 0; font-size: .8125rem; color: var(--work-ink); line-height: 1.5; overflow-wrap: anywhere; }
  .compact-nav { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
  .compact-nav button { border-color: var(--work-muted); font-weight: 700; min-height: 44px; min-width: 44px; padding: 6px 12px; }
  .inspection-tools p { font-size: .8125rem; color: var(--work-muted); line-height: 1.6; margin-block: 6px; overflow-wrap: anywhere; }
  .inspection-tools button { border-color: var(--work-muted); }
  .inspection-tools a, .dossier-links a { display: inline-flex; align-items: center; min-height: 44px; font-size: .8125rem; font-weight: 600; color: var(--work-accent); }
  .dossier-links { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 14px; margin-left: auto; }
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
  #bench-controls { position: fixed; z-index: 5; inset: auto 16px max(16px, env(safe-area-inset-bottom)); max-height: 75svh; overflow: auto; overscroll-behavior: contain; padding: 20px; background: var(--work-paper); border: 1px solid var(--work-muted); box-shadow: 0 12px 50px #26334130; }
  #bench-controls[hidden] { display: none; }
  h2 { font-size: 20px; color: inherit; margin: 0 0 16px; }
  h3 { font-size: 14px; color: inherit; margin: 20px 0 8px; }
  .controls { display: flex; flex-wrap: wrap; gap: 8px; }
  .controls button { border-color: var(--work-muted); }
  .focus-controls button[aria-pressed='true'],
  .controls button[aria-pressed='true'] {
    background: var(--work-active-bg);
    color: var(--work-active-ink);
    font-weight: 700;
  }
  #portfolio-links .theme-toggle { font-weight: normal; }
  .focus-controls button[aria-pressed='true'] { text-decoration: underline; text-underline-offset: 4px; }
  button:disabled { opacity: .55; cursor: not-allowed; }
  button:not(:disabled):hover, a:hover { text-decoration: underline; }
  button:not(:disabled):active { text-decoration: underline; text-underline-offset: 3px; }
  .end { margin-top: 20px; }
  :is(button, a, summary, section, main, h1):focus-visible { outline: 3px solid var(--work-accent); outline-offset: 3px; }
  .skip-link { position: fixed; top: -120px; left: 16px; z-index: 9; padding: 12px; background: var(--work-paper); }
  .skip-link:focus { top: 12px; }
  @media (max-width: 719px) {
    header { padding: 4px var(--gutter); }
    .scene-toolbar { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 6px 8px; padding: 6px var(--gutter); }
    .zone-bar { display: contents; }
    h1 { align-self: center; font-size: 1.125rem; }
    .focus-controls { grid-row: 2; grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 2px; }
    .focus-controls button { flex: 1 0 auto; min-width: 44px; padding: 7px 5px; font-size: .75rem; }
    .nav-label { font-size: .5625rem; letter-spacing: .05em; }
    .nav-num { font-size: .5625rem; }
    .camera-menu { grid-row: 1; grid-column: 2; }
    .camera-menu[open] { grid-row: 3; grid-column: 1 / -1; }
    .project-guide { padding: 6px var(--gutter); gap: 6px 12px; }
    .project-guide p { flex: 1 1 100%; font-size: .8125rem; line-height: 1.38; }
    .scene-toolbar.is-intro { padding-block: 12px 8px; gap: 10px 8px; }
    .is-intro h1 { font-size: clamp(1.375rem, 5.8vw, 2rem); }
    .project-guide.is-hero { padding-block: 14px 18px; gap: 10px; }
    .hero-tagline { font-size: clamp(1.125rem, 5vw, 1.375rem); }
    .hero-sub { font-size: .8125rem; line-height: 1.5; }
    .hero-status { font-size: .625rem; gap: 4px 8px; }
    .is-hero .guide-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; width: 100%; }
    .is-hero .guide-actions button, .is-hero .guide-actions .cta-link { padding: 10px 12px; }
    .guide-actions { width: 100%; gap: 6px; }
    .guide-actions button, .guide-actions .cta-link { flex: 1 1 auto; padding: 8px 10px; }
    .scene-area { flex: 1 1 clamp(240px, 46svh, 540px); min-height: 240px; }
    .dossier-controls { padding-block: 10px; }
    .dossier-row { align-items: stretch; gap: 6px 12px; }
    .dossier-row > p { font-size: .875rem; line-height: 1.45; }
    .dossier-links { width: 100%; margin-left: 0; display: flex; flex-direction: column-reverse; align-items: stretch; gap: 4px; }
    .dossier-links details { font-size: .9375rem; line-height: 1.55; }
    .dossier-links h2 { margin-top: 8px; }
    #bench-controls { position: relative; inset: auto; margin: 16px; max-height: none; box-shadow: none; padding: 16px; }
    footer { padding: 6px var(--gutter) max(6px, env(safe-area-inset-bottom)); gap: 4px 12px; }
    footer p { flex: 1 1 100%; font-size: .75rem; line-height: 1.4; }
    footer div { width: 100%; justify-content: space-between; }
    footer button { padding: 8px 6px; font-size: .75rem; }
  }
  @media (min-width: 640px) and (max-width: 719px) {
    .workbench { --gutter: 24px; }
    .byline span:first-of-type { display: inline; }
    .byline span:last-of-type { display: inline; font-size: 12px; }
  }
  @media (min-width: 720px) {
    .workbench { --gutter: 24px; }
    .focus-controls { flex: 0 1 auto; }
    .focus-controls button { padding-inline: 11px; font-size: .8125rem; }
    .nav-label { font-size: .6875rem; letter-spacing: .08em; }
    .nav-num { font-size: .6875rem; }
  }
  @media (min-width: 760px) {
    .menu-toggle { display: none; }
    #portfolio-links, #portfolio-links.expanded { display: flex; flex: 0 1 auto; flex-wrap: wrap; border-top: 0; padding-top: 0; gap: 4px 10px; }
    #portfolio-links a, #portfolio-links button { justify-content: flex-start; border-color: transparent; background: transparent; padding: 8px; }
  }
  @media (min-width: 960px) {
    .byline span:first-of-type { display: inline; }
    .byline span:last-of-type { display: inline; font-size: 12px; }
  }
  @media (min-width: 1080px) {
    .workbench { --gutter: 32px; }
    .identity { font-size: 28px; }
    .scene-area { flex-basis: 28rem; }
  }
  @media (forced-colors: active) {
    :is(button, a, summary, section, main, h1):focus-visible { outline-color: Highlight; }
    button[aria-pressed='true'] { border-color: Highlight; outline: 2px solid Highlight; outline-offset: -3px; }
  }
</style>
