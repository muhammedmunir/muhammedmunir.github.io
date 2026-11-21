<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { MODULES } from '$lib/workbench/system-state.mjs';
  import { PROJECT_MEDIA } from '$lib/workbench/project-media';
  import { PROFILE, CAREER_TIMELINE, EDUCATION_HISTORY, CERTIFICATIONS } from '$lib/content/portfolio-data';
  import ObjectPanel from './ObjectPanel.svelte';
  import ContactModal from '$lib/workbench/ContactModal.svelte';
  import type { RoomWorld, RoomKind, RoomView, RoomData, CareerBadge, StudyBook } from './RoomWorld';

  const locale = 'ms' as const;
  let canvas: HTMLCanvasElement;
  let world = $state<RoomWorld>();
  let ready = $state(false);
  let contact = $state(false);
  const touch = typeof matchMedia !== 'undefined' && matchMedia('(hover: none)').matches;
  let view = $state<RoomView>('overview');
  let tip = $state<{ text: string; x: number; y: number } | null>(null);
  let panel = $state<{ kind: 'project' | 'about'; index: number } | null>(null);
  let project = $state(0);
  let explored = $state(false);

  const SHARP = new Set(['emesys', 'sutera', 'adims', 'onboardx', 'babykick']);
  const SHORT: Record<string, string> = { 'YHCM Sdn Bhd': 'YHCM', 'Nova Bitara Development Sdn Bhd': 'NOVA', 'Tenaga Nasional Berhad (TNB)': 'TNB' };
  const COLOR: Record<string, string> = { YHCM: '#0f766e', NOVA: '#b45309', TNB: '#b91c1c' };

  const career: CareerBadge[] = [...CAREER_TIMELINE].reverse().map(c => {
    const short = SHORT[c.company] ?? c.company.split(' ')[0];
    return { short, company: c.company, year: c.period.match(/\d{4}/)?.[0] ?? '', role: c.role[locale], period: c.period, color: COLOR[short] ?? '#334155' };
  });
  const study: StudyBook[] = [
    ...[...EDUCATION_HISTORY].reverse().map(e => ({ title: e.qualification[locale], issuer: e.institution, period: e.period, kind: 'degree' as const, color: '#7a1f2b' })),
    ...CERTIFICATIONS.map(c => ({ title: c.title, issuer: c.issuer, period: c.period ?? '', kind: 'cert' as const, color: c.category === 'network' ? '#1d5f8a' : '#2f6b3f' }))
  ];
  const projects = MODULES.map(m => {
    const logo = SHARP.has(m.id) ? PROJECT_MEDIA[m.id]?.logo : undefined;
    return { name: m.name, company: m.company, badge: m.badge, accent: m.accent, stack: [...m.stack], logo: logo ? `${base}${logo}` : undefined };
  });

  // Profil sebagai kod untuk monitor kanan; nilai diambil daripada data sebenar.
  const employers = [...new Set([...career].reverse().map(c => c.short))];
  const code = [
    '// munir.ts',
    'export const munir = {',
    `  nama: '${PROFILE.shortName}',`,
    "  peranan: 'Full-Stack Developer',",
    "  fokus: ['Sistem sektor awam', 'Keselamatan rangkaian'],",
    `  pengalaman: [${employers.map(e => `'${e}'`).join(', ')}],`,
    "  pendidikan: 'Sains Komputer (Keselamatan Rangkaian), UTM',",
    `  lokasi: '${PROFILE.location}',`,
    '  sediaUntukPeluang: true,',
    '};'
  ];
  const VIEW_TITLE: Record<RoomView, string> = { overview: '', computer: 'Projek', screen: 'Tayangan projek', profile: 'Tentang saya', server: 'Kemahiran', work: 'Perjalanan kerja', learning: 'Pembelajaran & sijil' };
  const VIEW_HINT: Record<RoomView, string> = {
    overview: 'Klik objek dalam bilik untuk meneroka',
    computer: 'Klik ikon pada monitor untuk menayangkan projek ke dinding',
    screen: 'Klik tayangan untuk butiran penuh',
    profile: 'Profil saya, ditulis sebagai kod',
    server: 'Halakan pada logo untuk namanya',
    work: 'Klik pas untuk melihat jawatan',
    learning: 'Klik buku untuk membukanya'
  };

  function onPick(kind: RoomKind, index: number) {
    explored = true;
    if (kind === 'launcher') project = index;
    else if (kind === 'projection') panel = { kind: 'project', index: project };
    else if (kind === 'phone') contact = true;
  }
  function go(v: RoomView) { explored = true; panel = null; world?.setView(v); }

  onMount(() => {
    let alive = true;
    (async () => {
      const skills = await fetch(`${base}/room/icons/skills.json`).then(r => r.json()) as { name: string; category: string; hex: string; slug: string }[];
      const { RoomWorld } = await import('./RoomWorld');
      if (!alive) return;
      const data: RoomData = {
        projects, career, study, code, name: PROFILE.shortName, role: 'Full-Stack Developer',
        skills: skills.map(s => ({ name: s.name, category: s.category, hex: s.hex, svg: `${base}/room/icons/${s.slug}.svg` }))
      };
      world = new RoomWorld(canvas, {
        base: `${base}`, data, onPick,
        onHover: t => (tip = t),
        onView: v => { view = v; explored = explored || v !== 'overview'; },
        onProject: i => (project = i),
        onReady: () => (ready = true)
      });
      // Cangkuk ujian (mod pembangunan sahaja).
      if (import.meta.env.DEV) (window as unknown as { __room?: RoomWorld }).__room = world;
    })();
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || contact) return;
      if (panel) panel = null; else if (view !== 'overview') go('overview');
    };
    addEventListener('keydown', esc);
    return () => { alive = false; removeEventListener('keydown', esc); world?.dispose(); };
  });
</script>

<svelte:head>
  <title>Muhammed Munir | Full-Stack Developer</title>
  <meta name="description" content="Bilik kerja 3D Muhammed Munir, Full-Stack Developer: projek, kemahiran, perjalanan kerja dan pembelajaran. Versi teks penuh di /cv." />
</svelte:head>

<div class="room" class:panel-open={!!panel}>
  <header>
    <a class="identity" href="{base}/">munir<span>.</span></a>
    <nav aria-label="Pautan">
      <a href="{base}{PROFILE.resumeUrl}" download>Resume PDF</a>
      <button type="button" aria-haspopup="dialog" onclick={() => (contact = true)}>Hubungi</button>
    </nav>
  </header>

  <!-- Navigasi papan kekunci & pembaca skrin: setiap objek bilik sebagai butang. Kelihatan bila difokus. -->
  <nav class="keys" aria-label="Objek dalam bilik">
    <button type="button" onclick={() => go('computer')}>Komputer: projek</button>
    <button type="button" onclick={() => go('server')}>Rak server: kemahiran</button>
    <button type="button" onclick={() => go('work')}>Pas ID: perjalanan kerja</button>
    <button type="button" onclick={() => go('learning')}>Buku: pembelajaran dan sijil</button>
    <button type="button" onclick={() => go('profile')}>Monitor kod: tentang saya</button>
    <a href="{base}/cv">Versi teks penuh</a>
  </nav>

  <div class="stage">
    <canvas bind:this={canvas} aria-label="Bilik kerja 3D Muhammed Munir. Gunakan butang navigasi objek untuk papan kekunci."></canvas>
    {#if tip}<span class="tip" style:left="{tip.x}px" style:top="{tip.y}px">{tip.text}</span>{/if}
    {#if !ready}<p class="loading">Menyediakan bilik…</p>{/if}
  </div>

  {#if view === 'overview' && !panel}
    <section class="who" aria-labelledby="who-name">
      <h1 id="who-name">{PROFILE.shortName}</h1>
      <p>{PROFILE.headline[locale]}</p>
    </section>
  {/if}

  {#if view !== 'overview'}
    <div class="focus-bar">
      <button type="button" class="back" onclick={() => go('overview')}><span aria-hidden="true">←</span> Kembali</button>
      <p><strong>{view === 'screen' ? projects[project].name : VIEW_TITLE[view]}</strong></p>
      {#if view === 'profile'}
        <button type="button" class="back" onclick={() => (panel = { kind: 'about', index: 0 })}>Butiran</button>
      {/if}
      {#if view === 'screen'}
        <button type="button" class="back" onclick={() => go('computer')}>Pilih projek lain</button>
        <button type="button" class="back" onclick={() => (panel = { kind: 'project', index: project })}>Butiran</button>
      {/if}
    </div>
  {/if}

  {#if ready && !panel}
    <p class="hint" class:fade={explored && view === 'overview'} aria-live="polite">{touch ? VIEW_HINT[view].replace(/^Klik/, 'Ketik').replace(/^Halakan pada/, 'Ketik') : VIEW_HINT[view]}</p>
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
  }
</style>
