<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { base } from '$app/paths';
  import { MODULES } from '$lib/workbench/system-state.mjs';
  import { PROJECT_MEDIA } from '$lib/workbench/project-media';
  import { PROFILE, CAREER_TIMELINE, EDUCATION_HISTORY, CERTIFICATIONS } from '$lib/content/portfolio-data';
  import { getLocale, toggleLocale } from '$lib/workbench/preferences.svelte';
  import ObjectPanel from './ObjectPanel.svelte';
  import ContactModal from '$lib/workbench/ContactModal.svelte';
  import type { RoomWorld, RoomKind, RoomView, RoomData, CareerBadge, StudyBook } from './RoomWorld';

  type Locale = 'ms' | 'en';
  const locale = $derived(getLocale());
  let canvas: HTMLCanvasElement;
  let world = $state<RoomWorld>();
  let ready = $state(false);
  let contact = $state(false);
  const touch = typeof matchMedia !== 'undefined' && matchMedia('(hover: none)').matches;
  let view = $state<RoomView>('overview');
  let tip = $state<{ text: string; x: number; y: number } | null>(null);
  let panel = $state<{ kind: 'project' | 'about'; index: number } | null>(null);
  let project = $state(0);
  let slide = $state({ at: 0, total: 1 });
  let day = $state(false);
  let explored = $state(false);

  const UI = {
    ms: {
      title: { overview: '', computer: 'Projek', screen: 'Tayangan projek', profile: 'Tentang saya', server: 'Kemahiran', work: 'Perjalanan kerja', learning: 'Pembelajaran & sijil', phone: 'Hubungi saya' },
      hint: {
        overview: 'Klik objek dalam bilik untuk meneroka', computer: 'Klik ikon pada monitor untuk menayangkan projek ke dinding',
        screen: 'Klik tayangan untuk slaid seterusnya', profile: 'Profil saya, ditulis sebagai kod', server: 'Halakan pada logo untuk namanya',
        work: 'Klik pas untuk melihat jawatan', learning: 'Klik buku untuk membukanya', phone: 'Pilih cara untuk menghubungi saya'
      },
      tap: (h: string) => h.replace(/^Klik/, 'Ketik').replace(/^Halakan pada/, 'Ketik'),
      links: 'Pautan', resume: 'Resume', contact: 'Hubungi', lang: 'EN', langLabel: 'Switch to English',
      back: 'Kembali', details: 'Butiran', other: 'Pilih projek lain', loading: 'Menyediakan bilik…',
      prev: 'Slaid sebelumnya', next: 'Slaid seterusnya', slideOf: (a: number, n: number) => `Slaid ${a} daripada ${n}`,
      toDay: 'Tukar ke siang', toNight: 'Tukar ke malam',
      slides: { role: 'PERANAN SAYA', data: 'SENI BINA DATA', security: 'KESELAMATAN & AKSES', tech: 'TEKNOLOGI', doc: 'Kajian kes (PDF) tersedia dalam Butiran', live: 'Laman sebenar tersedia dalam Butiran' },
      call: 'Telefon', mail: 'E-mel', more: 'Semua pilihan hubungan', pdf: 'Resume (PDF)',
      objects: 'Objek dalam bilik', full: 'Versi teks penuh',
      keys: ['Komputer: projek', 'Rak server: kemahiran', 'Pas ID: perjalanan kerja', 'Buku: pembelajaran dan sijil', 'Monitor kod: tentang saya', 'Telefon: hubungi'],
      canvas: 'Bilik kerja 3D Muhammed Munir. Gunakan butang navigasi objek untuk papan kekunci.',
      description: 'Bilik kerja 3D Muhammed Munir, Full-Stack Developer: projek, kemahiran, perjalanan kerja dan pembelajaran. Versi teks penuh di /cv.'
    },
    en: {
      title: { overview: '', computer: 'Projects', screen: 'Now showing', profile: 'About me', server: 'Skills', work: 'Work journey', learning: 'Education & certificates', phone: 'Contact me' },
      hint: {
        overview: 'Click objects in the room to explore', computer: 'Click an icon on the monitor to project it onto the wall',
        screen: 'Click the projection for the next slide', profile: 'My profile, written as code', server: 'Point at a logo to see its name',
        work: 'Click a pass to see the role', learning: 'Click a book to open it', phone: 'Choose how to reach me'
      },
      tap: (h: string) => h.replace(/^Click/, 'Tap').replace(/^Point at/, 'Tap'),
      links: 'Links', resume: 'Resume', contact: 'Contact', lang: 'BM', langLabel: 'Tukar ke Bahasa Melayu',
      back: 'Back', details: 'Details', other: 'Choose another project', loading: 'Preparing the room…',
      prev: 'Previous slide', next: 'Next slide', slideOf: (a: number, n: number) => `Slide ${a} of ${n}`,
      toDay: 'Switch to day', toNight: 'Switch to night',
      slides: { role: 'MY ROLE', data: 'DATA ARCHITECTURE', security: 'SECURITY & ACCESS', tech: 'TECHNOLOGY', doc: 'Case study (PDF) available under Details', live: 'Live site available under Details' },
      call: 'Call', mail: 'Email', more: 'All contact options', pdf: 'Resume (PDF)',
      objects: 'Objects in the room', full: 'Full text version',
      keys: ['Computer: projects', 'Server rack: skills', 'ID passes: work journey', 'Books: education and certificates', 'Code monitor: about me', 'Phone: contact'],
      canvas: '3D workspace of Muhammed Munir. Use the object navigation buttons with a keyboard.',
      description: '3D workspace of Muhammed Munir, Full-Stack Developer: projects, skills, work journey and education. Full text version at /cv.'
    }
  } as const;
  const ui = $derived(UI[locale]);

  // Logo cukup tajam untuk skrin besar; selebihnya monogram berwarna.
  const SHARP = new Set(['emesys', 'sutera', 'adims', 'onboardx', 'babykick', '9router']);
  const MONO: Record<string, string> = { iwa001: 'IWA', infinity: 'IW', '9router': '9R' };
  const SHORT: Record<string, string> = { 'YHCM Sdn Bhd': 'YHCM', 'Nova Bitara Development Sdn Bhd': 'NOVA', 'Tenaga Nasional Berhad (TNB)': 'TNB' };
  const COLOR: Record<string, string> = { YHCM: '#0f766e', NOVA: '#b45309', TNB: '#b91c1c' };

  function roomData(loc: Locale, skills: RoomData['skills']): RoomData {
    const career: CareerBadge[] = [...CAREER_TIMELINE].reverse().map(c => {
      const short = SHORT[c.company] ?? c.company.split(' ')[0];
      return { short, company: c.company, year: c.period.match(/\d{4}/)?.[0] ?? '', role: c.role[loc], period: c.period, color: COLOR[short] ?? '#334155' };
    });
    const study: StudyBook[] = [
      ...[...EDUCATION_HISTORY].reverse().map(e => ({ title: e.qualification[loc], issuer: e.institution, period: e.period, kind: 'degree' as const, color: '#7a1f2b' })),
      ...CERTIFICATIONS.map(c => ({ title: c.title, issuer: c.issuer, period: c.period ?? '', kind: 'cert' as const, color: c.category === 'network' ? '#1d5f8a' : '#2f6b3f' }))
    ];
    const en = loc === 'en', t = UI[loc].slides;
    const projects = MODULES.map(m => {
      const logo = SHARP.has(m.id) ? PROJECT_MEDIA[m.id]?.logo : undefined;
      const links = m as { caseStudyUrl?: string; liveUrl?: string };
      // Slaid tayangan: tajuk, kemudian butiran yang sama seperti panel Butiran.
      const slides = [
        { label: t.role, body: en ? m.roleEn : m.role },
        { label: t.data, body: en ? m.dataArchitectureEn : m.dataArchitecture },
        { label: t.security, body: en ? m.securityAccessEn : m.securityAccess },
        { label: t.tech, body: '' }
      ];
      const note = links.caseStudyUrl ? t.doc : links.liveUrl ? t.live : undefined;
      return { name: m.name, company: m.company, badge: en ? m.badgeEn : m.badge, accent: m.accent, stack: [...m.stack], logo: logo ? `${base}${logo}` : undefined, mono: MONO[m.id], slides, note };
    });
    // Profil sebagai kod untuk monitor kanan; nilai diambil daripada data sebenar.
    const employers = [...new Set(CAREER_TIMELINE.map(c => SHORT[c.company] ?? c.company.split(' ')[0]))];
    const list = `[${employers.map(e => `'${e}'`).join(', ')}]`;
    const code = loc === 'en'
      ? ['// munir.ts', 'export const munir = {', `  name: '${PROFILE.shortName}',`, "  role: 'Full-Stack Developer',", "  focus: ['Public-sector systems', 'Network security'],",
         `  experience: ${list},`, "  education: 'Computer Science (Network Security), UTM',", `  location: '${PROFILE.location}',`, '  openToWork: true,', '};']
      : ['// munir.ts', 'export const munir = {', `  nama: '${PROFILE.shortName}',`, "  peranan: 'Full-Stack Developer',", "  fokus: ['Sistem sektor awam', 'Keselamatan rangkaian'],",
         `  pengalaman: ${list},`, "  pendidikan: 'Sains Komputer (Keselamatan Rangkaian), UTM',", `  lokasi: '${PROFILE.location}',`, '  sediaUntukPeluang: true,', '};'];
    const contact = { phone: PROFILE.phone, email: PROFILE.email, location: PROFILE.location };
    return { projects, career, study, code, skills, locale: loc, name: PROFILE.shortName, role: 'Full-Stack Developer', contact };
  }
  const projectNames = MODULES.map(m => m.name);

  function onPick(kind: RoomKind, index: number) {
    explored = true;
    if (kind === 'launcher') project = index;
  }
  function go(v: RoomView) { explored = true; panel = null; world?.setView(v); }

  let skills: RoomData['skills'] | undefined;
  let RoomCtor: typeof RoomWorld | undefined;
  let mounted = $state(false);
  /** Bina (atau bina semula bila bahasa ditukar) dunia 3D; paparan semasa dikekalkan. */
  function start(loc: Locale) {
    if (!RoomCtor || !skills) return;
    const keep = view;
    world?.dispose();
    ready = false;
    const w = new RoomCtor(canvas, {
      base: `${base}`, data: roomData(loc, skills), onPick,
      onHover: t => (tip = t),
      onView: v => { view = v; explored = explored || v !== 'overview'; },
      onProject: i => (project = i),
      onSlide: (at, total) => (slide = { at, total }),
      onDay: d => (day = d),
      onReady: () => { ready = true; if (keep !== 'overview') w.setView(keep); }
    });
    // Kekalkan pilihan siang/malam pelawat bila bilik dibina semula (tukar bahasa).
    if (world && world.isDay !== w.isDay) w.setDay(world.isDay);
    day = w.isDay;
    world = w;
    // Cangkuk ujian (mod pembangunan sahaja).
    if (import.meta.env.DEV) (window as unknown as { __room?: RoomWorld }).__room = w;
  }

  onMount(() => {
    let alive = true;
    (async () => {
      const list = await fetch(`${base}/room/icons/skills.json`).then(r => r.json()) as { name: string; category: string; hex: string; slug: string }[];
      skills = list.map(s => ({ name: s.name, category: s.category, hex: s.hex, svg: `${base}/room/icons/${s.slug}.svg` }));
      RoomCtor = (await import('./RoomWorld')).RoomWorld;
      if (!alive) return;
      mounted = true;
    })();
    const esc = (e: KeyboardEvent) => {
      if (contact) return;
      // Anak panah menukar slaid semasa menonton tayangan (kecuali fokus dalam medan teks).
      if (view === 'screen' && !panel && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { world?.nextSlide(e.key === 'ArrowRight' ? 1 : -1); return; }
      if (e.key !== 'Escape') return;
      if (panel) panel = null; else if (view !== 'overview') go('overview');
    };
    addEventListener('keydown', esc);
    return () => { alive = false; removeEventListener('keydown', esc); world?.dispose(); };
  });
  $effect(() => {
    const loc = locale;
    if (mounted) untrack(() => start(loc));
  });
</script>

<svelte:head>
  <title>Muhammed Munir | Full-Stack Developer</title>
  <meta name="description" content={ui.description} />
</svelte:head>

<div class="room" class:panel-open={!!panel}>
  <header>
    <a class="identity" href="{base}/">munir<span>.</span></a>
    <nav aria-label={ui.links}>
      <a href="{base}/cv">{ui.resume}</a>
      <button type="button" onclick={() => (ready ? go('phone') : (contact = true))}>{ui.contact}</button>
      <button type="button" class="pill" aria-label={day ? ui.toNight : ui.toDay} title={day ? ui.toNight : ui.toDay} onclick={() => world?.setDay(!day)}>
        {#if day}
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /></svg>
        {:else}
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="2" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
        {/if}
      </button>
      <button type="button" class="pill" aria-label={ui.langLabel} onclick={() => toggleLocale()}>{ui.lang}</button>
    </nav>
  </header>

  <!-- Navigasi papan kekunci & pembaca skrin: setiap objek bilik sebagai butang. Kelihatan bila difokus. -->
  <nav class="keys" aria-label={ui.objects}>
    <button type="button" onclick={() => go('computer')}>{ui.keys[0]}</button>
    <button type="button" onclick={() => go('server')}>{ui.keys[1]}</button>
    <button type="button" onclick={() => go('work')}>{ui.keys[2]}</button>
    <button type="button" onclick={() => go('learning')}>{ui.keys[3]}</button>
    <button type="button" onclick={() => go('profile')}>{ui.keys[4]}</button>
    <button type="button" onclick={() => go('phone')}>{ui.keys[5]}</button>
    <a href="{base}/cv">{ui.full}</a>
  </nav>

  <div class="stage">
    <canvas bind:this={canvas} aria-label={ui.canvas}></canvas>
    {#if tip}<span class="tip" style:left="{tip.x}px" style:top="{tip.y}px">{tip.text}</span>{/if}
    {#if !ready}<p class="loading">{ui.loading}</p>{/if}
  </div>

  {#if view === 'overview' && !panel}
    <section class="who" aria-labelledby="who-name">
      <h1 id="who-name">{PROFILE.shortName}</h1>
      <p>{PROFILE.headline[locale]}</p>
    </section>
  {/if}

  {#if view !== 'overview'}
    <div class="focus-bar">
      <button type="button" class="back" onclick={() => go('overview')}><span aria-hidden="true">←</span> {ui.back}</button>
      <p><strong>{view === 'screen' ? projectNames[project] : ui.title[view]}</strong></p>
      {#if view === 'profile'}
        <button type="button" class="back" onclick={() => (panel = { kind: 'about', index: 0 })}>{ui.details}</button>
      {/if}
      {#if view === 'screen'}
        <span class="slides" role="group" aria-label={ui.slideOf(slide.at + 1, slide.total)}>
          <button type="button" class="back icon" aria-label={ui.prev} onclick={() => world?.nextSlide(-1)}><span aria-hidden="true">‹</span></button>
          <span class="count" aria-live="polite">{slide.at + 1} / {slide.total}</span>
          <button type="button" class="back icon" aria-label={ui.next} onclick={() => world?.nextSlide(1)}><span aria-hidden="true">›</span></button>
        </span>
        <button type="button" class="back" onclick={() => (panel = { kind: 'project', index: project })}>{ui.details}</button>
        <button type="button" class="back" onclick={() => go('computer')}>{ui.other}</button>
      {/if}
    </div>
  {/if}

  {#if view === 'phone' && !panel}
    <section class="dial" aria-labelledby="dial-name">
      <h2 id="dial-name">{PROFILE.shortName}</h2>
      <p>Full-Stack Developer · {PROFILE.location}</p>
      <div class="actions">
        <a class="primary" href={PROFILE.whatsappUrl} target="_blank" rel="noopener">WhatsApp</a>
        <a href="tel:{PROFILE.phone.replace(/[^+\d]/g, '')}">{ui.call}</a>
        <a href="mailto:{PROFILE.email}">{ui.mail}</a>
        <a href={PROFILE.linkedinUrl} target="_blank" rel="noopener">LinkedIn</a>
        <a href={PROFILE.githubUrl} target="_blank" rel="noopener">GitHub</a>
        <a href="{base}{PROFILE.resumeUrl}" download>{ui.pdf}</a>
      </div>
      <button type="button" class="more" aria-haspopup="dialog" onclick={() => (contact = true)}>{ui.more}</button>
    </section>
  {/if}

  {#if ready && !panel && view !== 'phone'}
    <p class="hint" class:fade={explored && view === 'overview'} aria-live="polite">{touch ? ui.tap(ui.hint[view]) : ui.hint[view]}</p>
  {/if}

  {#if panel}<ObjectPanel kind={panel.kind} index={panel.index} {locale} onclose={() => (panel = null)} />{/if}
</div>
<ContactModal open={contact} {locale} onclose={() => (contact = false)} />

<style>
  .room { --gutter: 32px; --side: min(440px, 36vw); position: fixed; inset: 0; overflow: hidden; background: #0b0c0f; color: #f4f4f5; }
  header { position: absolute; z-index: 6; inset: 0 0 auto 0; display: flex; justify-content: space-between; align-items: center; padding: 14px var(--gutter); background: linear-gradient(#0b0c0f 20%, transparent); pointer-events: none; }
  header > * { pointer-events: auto; }
  .identity { font-family: var(--font-heading); font-size: 30px; font-weight: 800; letter-spacing: -.07em; text-decoration: none; color: inherit; }
  .identity span { color: var(--work-accent); }
  header nav { display: flex; gap: 22px; align-items: center; }
  header nav a, header nav button { display: inline-flex; align-items: center; min-height: 44px; color: inherit; background: none; border: 0; font: inherit; font-size: .9rem; cursor: pointer; text-decoration: none; }
  header nav a:hover, header nav button:hover { text-decoration: underline; text-underline-offset: 4px; }
  header nav .pill { justify-content: center; min-width: 44px; padding: 0 12px; border: 1px solid rgba(255,255,255,.28); border-radius: 999px; font-weight: 700; letter-spacing: .06em; }
  header nav .pill:hover { text-decoration: none; border-color: var(--work-accent); }
  header nav .pill + .pill { margin-left: -12px; }
  .keys { position: absolute; z-index: 7; top: 70px; left: var(--gutter); display: flex; flex-direction: column; gap: 6px; }
  .keys > * { position: absolute; left: -9999px; }
  .keys > *:focus { position: static; display: inline-flex; padding: 10px 14px; background: #f4f4f5; color: #0b0c0f; border-radius: 6px; font: 600 .9rem/1 inherit; border: 0; }
  .stage { position: absolute; inset: 0; transition: left .45s cubic-bezier(.2,.7,.2,1); }
  .panel-open .stage { left: var(--side); }
  canvas { width: 100%; height: 100%; display: block; cursor: grab; touch-action: none; }
  .tip { position: absolute; transform: translate(14px, 14px); padding: 7px 12px; border-radius: 6px; background: rgba(12,13,16,.86); border: 1px solid rgba(255,255,255,.14); color: #f4f4f5; font-size: .8125rem; font-weight: 600; white-space: nowrap; pointer-events: none; }
  .loading { position: absolute; inset: 0; display: grid; place-items: center; margin: 0; color: #a1a1aa; }
  .who { position: absolute; z-index: 3; left: var(--gutter); bottom: 36px; pointer-events: none; }
  .who h1 { margin: 0; font: 800 clamp(2rem, 3vw, 3.25rem)/.95 var(--font-heading); letter-spacing: -.045em; }
  .who p { margin: 10px 0 0; color: #a1a1aa; font-size: .9375rem; }
  .focus-bar { position: absolute; z-index: 4; left: var(--gutter); top: 76px; display: flex; align-items: center; gap: 16px; }
  .focus-bar p { margin: 0; font-size: 1rem; text-shadow: 0 1px 12px rgba(0,0,0,.9), 0 0 2px rgba(0,0,0,.8); }
  .back { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 8px 16px; border-radius: 999px; border: 1px solid rgba(255,255,255,.2); background: rgba(12,13,16,.88); backdrop-filter: blur(8px); color: #f4f4f5; font: inherit; font-size: .9rem; cursor: pointer; }
  .back:hover { border-color: var(--work-accent); }
  .back.icon { justify-content: center; width: 44px; padding: 0; font-size: 1.4rem; line-height: 1; }
  .slides { display: inline-flex; align-items: center; gap: 8px; }
  .count { min-width: 3.2em; text-align: center; font-variant-numeric: tabular-nums; font-size: .9rem; text-shadow: 0 1px 12px rgba(0,0,0,.9); }
  .dial { position: absolute; z-index: 4; right: max(var(--gutter), 6vw); top: 50%; transform: translateY(-50%); width: min(360px, calc(100% - 2 * var(--gutter))); padding: 24px; border-radius: 16px; background: rgba(12,13,16,.9); border: 1px solid rgba(255,255,255,.12); backdrop-filter: blur(10px); animation: dial-in .45s .35s cubic-bezier(.2,.7,.2,1) both; }
  @keyframes dial-in { from { opacity: 0; transform: translateY(calc(-50% + 16px)); } }
  .dial h2 { margin: 0; font: 800 1.6rem/1.1 var(--font-heading); letter-spacing: -.03em; }
  .dial p { margin: 6px 0 18px; color: #a1a1aa; font-size: .875rem; }
  .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .actions a { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,.18); color: #f4f4f5; text-decoration: none; font-size: .875rem; font-weight: 600; }
  .actions a:hover { border-color: var(--work-accent); }
  .actions a.primary { grid-column: 1 / -1; background: var(--work-accent); border-color: var(--work-accent); color: #0b0c0f; font-weight: 700; }
  .more { margin-top: 12px; min-height: 44px; padding: 0; border: 0; background: none; color: #d4d4d8; font: inherit; font-size: .8125rem; text-decoration: underline; text-underline-offset: 4px; cursor: pointer; }
  @media (prefers-reduced-motion: reduce) { .dial { animation: none; } }
  .hint { position: absolute; z-index: 3; left: 50%; bottom: 28px; transform: translateX(-50%); margin: 0; padding: 9px 16px; border-radius: 999px; background: rgba(12,13,16,.72); border: 1px solid rgba(255,255,255,.12); color: #d4d4d8; font-size: .8125rem; white-space: nowrap; pointer-events: none; transition: opacity .6s; }
  .hint.fade { opacity: 0; }
  :is(a, button):focus-visible { outline: 3px solid var(--work-accent); outline-offset: 3px; }
  @media (max-width: 999px) {
    .room { --gutter: 16px; }
    .panel-open .stage { left: 0; bottom: 60svh; }
    .who { bottom: 72px; }
    .hint { bottom: 20px; max-width: calc(100% - 32px); white-space: normal; text-align: center; }
    .focus-bar { top: 64px; right: var(--gutter); flex-wrap: wrap; gap: 8px 12px; }
    .focus-bar .back { white-space: nowrap; }
    .who { bottom: 96px; }
    .dial { top: auto; bottom: 16px; right: var(--gutter); left: var(--gutter); width: auto; transform: none; padding: 18px; animation-name: dial-up; }
    @keyframes dial-up { from { opacity: 0; transform: translateY(16px); } }
    .dial p { margin-bottom: 12px; }
    header nav { gap: 12px; }
    .identity { font-size: 24px; }
    header nav .pill + .pill { margin-left: -6px; }
  }
</style>
