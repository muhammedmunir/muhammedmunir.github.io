<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { lang } from '$lib/i18n';
  import { translations } from '$lib/translations';
  import { derived } from 'svelte/store';

  let heroRef: HTMLElement;
  let parallaxLayer: HTMLElement;

  const t = derived(lang, ($lang) => translations[$lang].hero);

  onMount(() => {
    const tl = gsap.timeline({ delay: 0.3 });
    tl.fromTo('#hero-badge',   { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
      .fromTo('#hero-heading', { opacity: 0, y: 50  }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.4')
      .fromTo('#hero-tagline', { opacity: 0, y: 30  }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5')
      .fromTo('#hero-bio',     { opacity: 0, y: 20  }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
      .fromTo('#hero-cta',     { opacity: 0, y: 20  }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
      .fromTo('#hero-scroll',  { opacity: 0         }, { opacity: 1,        duration: 0.5               }, '-=0.1');

    const handleMouse = (e: MouseEvent) => {
      const xPct = (e.clientX / window.innerWidth - 0.5) * 30;
      const yPct = (e.clientY / window.innerHeight - 0.5) * 20;
      gsap.to(parallaxLayer, { x: xPct, y: yPct, duration: 1.5, ease: 'power1.out' });
    };

    const handleScroll = () => {
      gsap.to('.orb-hero', { y: window.scrollY * 0.3, duration: 0.5, ease: 'none' });
    };

    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<section id="hero" class="hero-section bg-grid" bind:this={heroRef}>
  <div bind:this={parallaxLayer} class="orb-container" aria-hidden="true">
    <div class="orb orb-hero" style="width:500px;height:500px;background:radial-gradient(circle,rgba(30,58,95,0.8),transparent);top:-100px;right:-150px;"></div>
    <div class="orb orb-hero" style="width:350px;height:350px;background:radial-gradient(circle,rgba(212,175,55,0.08),transparent);bottom:10%;left:-80px;animation-delay:-4s;"></div>
    <div class="orb orb-hero" style="width:220px;height:220px;background:radial-gradient(circle,rgba(212,175,55,0.06),transparent);top:30%;right:10%;animation-delay:-2s;"></div>
  </div>

  <div class="hero-lines" aria-hidden="true">
    <div class="line line-1"></div>
    <div class="line line-2"></div>
  </div>

  <div class="hero-content">
    <div id="hero-badge" class="hero-badge" style="opacity:0">
      <span class="badge-dot" aria-hidden="true"></span>
      {$t.badge}
    </div>

    <h1 id="hero-heading" style="opacity:0">
      <span class="name-first">Muhammed Munir</span><br/>
      <span class="name-last text-gradient">Bin Mohd Azmi</span>
    </h1>

    <p id="hero-tagline" class="hero-tagline" style="opacity:0">
      <span>{$t.tagline1}</span>
      <span class="sep" aria-hidden="true">|</span>
      <span>{$t.tagline2}</span>
      <span class="sep" aria-hidden="true">|</span>
      <span>{$t.tagline3}</span>
    </p>

    <p id="hero-bio" class="hero-bio" style="opacity:0">
      {@html $t.bio}
    </p>

    <div id="hero-cta" class="hero-cta" style="opacity:0">
      <a href="#projects" class="btn btn-primary" id="cta-projects">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>
        {$t.cta_projects}
      </a>
      <a href="#contact" class="btn btn-outline" id="cta-contact">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        {$t.cta_contact}
      </a>
    </div>

    <div id="hero-scroll" class="scroll-hint" style="opacity:0" aria-label={$t.scroll}>
      <div class="scroll-mouse">
        <div class="scroll-dot"></div>
      </div>
      <span>{$t.scroll}</span>
    </div>
  </div>

  <div class="hero-stats">
    {#each [
      { num: '4+', key: 'exp' as const },
      { num: '5+', key: 'projects' as const },
      { num: '15+', key: 'tech' as const },
      { num: 'B.Sc.', key: 'degree' as const }
    ] as stat}
      <div class="stat-item">
        <span class="stat-num">{stat.num}</span>
        <span class="stat-label">{$t.stats[stat.key]}</span>
      </div>
    {/each}
  </div>
</section>

<style>
  .hero-section {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    padding: 8rem 1.5rem 4rem;
    background: linear-gradient(160deg, var(--navy-dark) 0%, var(--navy-mid) 50%, var(--navy-dark) 100%);
  }

  .orb-container { position: absolute; inset: 0; pointer-events: none; z-index: 0; }

  .hero-lines { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
  .line {
    position: absolute;
    background: linear-gradient(90deg, transparent, rgba(212,175,55,0.08), transparent);
    height: 1px; width: 100%;
  }
  .line-1 { top: 30%; }
  .line-2 { top: 70%; opacity: 0.5; }

  .hero-content {
    position: relative;
    z-index: 1;
    text-align: center;
    max-width: 900px;
    margin: 0 auto;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    background: rgba(212,175,55,0.08);
    border: 1px solid rgba(212,175,55,0.25);
    border-radius: 100px;
    padding: 0.5rem 1.2rem;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--gold);
    letter-spacing: 0.05em;
    margin-bottom: 2rem;
  }
  .badge-dot {
    width: 8px; height: 8px;
    background: #22c55e;
    border-radius: 50%;
    animation: pulse-dot 2s infinite;
  }
  @keyframes pulse-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
    50%       { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
  }

  h1 { margin-bottom: 1.5rem; letter-spacing: -0.02em; }
  .name-first { color: var(--text-primary); display: block; }
  .name-last { display: block; font-style: italic; }

  .hero-tagline {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: clamp(0.9rem, 2.5vw, 1.1rem);
    font-weight: 500;
    color: var(--text-secondary);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 2rem;
  }
  .sep { color: var(--gold); opacity: 0.5; }

  .hero-bio {
    font-size: clamp(1rem, 2vw, 1.1rem);
    color: var(--text-secondary);
    max-width: 640px;
    margin: 0 auto 2.5rem;
    line-height: 1.8;
  }

  .hero-cta {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 3.5rem;
  }

  .scroll-hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.78rem;
    color: var(--text-muted);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .scroll-mouse {
    width: 24px; height: 38px;
    border: 2px solid rgba(212,175,55,0.4);
    border-radius: 12px;
    display: flex;
    justify-content: center;
    padding-top: 6px;
  }
  .scroll-dot {
    width: 4px; height: 8px;
    background: var(--gold);
    border-radius: 2px;
    animation: scroll-bounce 2s ease-in-out infinite;
  }
  @keyframes scroll-bounce {
    0%, 100% { transform: translateY(0); opacity: 1; }
    50%       { transform: translateY(10px); opacity: 0.3; }
  }

  .hero-stats {
    position: relative; z-index: 1;
    display: flex;
    gap: 0;
    border: 1px solid var(--card-border);
    border-radius: var(--radius-lg);
    background: var(--card-bg);
    backdrop-filter: blur(20px);
    overflow: hidden;
    margin-top: 3rem;
    width: 100%;
    max-width: 700px;
  }
  .stat-item {
    flex: 1;
    text-align: center;
    padding: 1.5rem 1rem;
    border-right: 1px solid var(--card-border);
    transition: var(--transition);
  }
  .stat-item:last-child { border-right: none; }
  .stat-item:hover { background: rgba(212,175,55,0.06); }
  .stat-num {
    display: block;
    font-family: var(--font-heading);
    font-size: 1.8rem;
    font-weight: 900;
    color: var(--gold);
    line-height: 1;
    margin-bottom: 0.35rem;
  }
  .stat-label {
    font-size: 0.73rem;
    font-weight: 500;
    color: var(--text-muted);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  @media (max-width: 640px) {
    .hero-stats { flex-wrap: wrap; max-width: 100%; }
    .stat-item {
      min-width: 50%;
      border-right: none;
      border-bottom: 1px solid var(--card-border);
    }
    /* Left column items get the vertical divider */
    .stat-item:nth-child(odd) { border-right: 1px solid var(--card-border); }
    /* Bottom-row items (3 & 4) must not have a bottom border — they're at the card edge */
    .stat-item:nth-child(3), .stat-item:nth-child(4) { border-bottom: none; }
    .hero-tagline { font-size: 0.85rem; gap: 0.3rem; }
  }
</style>
