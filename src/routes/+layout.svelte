<script lang="ts">
  import './layout.css';
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import { lang, toggleLang } from '$lib/i18n';
  import { translations } from '$lib/translations';
  import { derived } from 'svelte/store';

  let { children }: { children: Snippet } = $props();
  let navScrolled = $state(false);

  // Reactive translation
  const t = derived(lang, ($lang) => translations[$lang]);

  onMount(() => {
    const handler = () => { navScrolled = window.scrollY > 60; };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  });

  const navKeys = [
    { href: '#hero',       key: 'home' as const },
    { href: '#experience', key: 'experience' as const },
    { href: '#projects',   key: 'projects' as const },
    { href: '#skills',     key: 'skills' as const },
    { href: '#contact',    key: 'contact' as const }
  ];
</script>

<svelte:head>
  <title>Muhammed Munir | Full-Stack Developer & IT Professional</title>
</svelte:head>

<!-- NAV -->
<nav class="nav" class:scrolled={navScrolled} aria-label="Main navigation">
  <div class="nav-inner">
    <a href="#hero" class="nav-logo" id="nav-logo">
      <span class="logo-port">Port</span><span class="logo-folio">folio</span>
    </a>

    <ul class="nav-links" role="list">
      {#each navKeys as link}
        <li>
          <a href={link.href} class="nav-link" id="nav-{link.key}">
            {$t.nav[link.key]}
          </a>
        </li>
      {/each}
    </ul>

    <div class="nav-actions">
      <!-- Language Toggle -->
      <button
        class="lang-toggle"
        id="lang-toggle-btn"
        onclick={toggleLang}
        aria-label="Tukar bahasa / Switch language"
        title={$lang === 'ms' ? 'Switch to English' : 'Tukar ke Bahasa Melayu'}
      >
        <span class="lang-opt" class:active={$lang === 'ms'}>BM</span>
        <span class="lang-divider" aria-hidden="true">|</span>
        <span class="lang-opt" class:active={$lang === 'en'}>EN</span>
      </button>

      <a href="#contact" class="btn btn-primary nav-cta" id="nav-hire-btn">
        {$t.nav.hire}
      </a>
    </div>
  </div>
</nav>

<main>
  {@render children()}
</main>

<!-- Footer -->
<footer class="footer">
  <div class="footer-inner">
    <p class="footer-name">Muhammed Munir Bin Mohd Azmi</p>
    <p class="footer-sub">{$t.footer.sub}</p>
    <div class="footer-divider"></div>
    <p class="footer-copy">© {new Date().getFullYear()} {$t.footer.copy}</p>
  </div>
</footer>

<style>
  .nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 1000;
    padding: 1.4rem 4vw;
    transition: all 0.4s ease;
  }
  .nav.scrolled {
    background: rgba(10, 20, 35, 0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(212, 175, 55, 0.15);
    padding: 0.9rem 4vw;
    box-shadow: 0 4px 30px rgba(0,0,0,0.4);
  }
  .nav-inner {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }
  .nav-logo {
    font-family: var(--font-heading);
    font-size: 1.45rem;
    font-weight: 900;
    letter-spacing: 0.02em;
    transition: var(--transition);
    flex-shrink: 0;
  }
  .nav-logo:hover .logo-port,
  .nav-logo:hover .logo-folio { text-shadow: 0 0 20px rgba(212,175,55,0.5); }
  .logo-port   { color: var(--gold); }
  .logo-folio  { color: var(--text-secondary); font-weight: 400; font-style: italic; }

  .nav-links {
    display: flex;
    list-style: none;
    gap: 0.15rem;
    flex: 1;
    justify-content: center;
  }
  .nav-link {
    padding: 0.5rem 0.85rem;
    font-size: 0.88rem;
    font-weight: 500;
    color: var(--text-secondary);
    border-radius: 6px;
    transition: var(--transition);
    position: relative;
    white-space: nowrap;
  }
  .nav-link::after {
    content: '';
    position: absolute;
    bottom: 2px; left: 50%;
    width: 0; height: 2px;
    background: var(--gold);
    transform: translateX(-50%);
    transition: width 0.3s ease;
    border-radius: 2px;
  }
  .nav-link:hover { color: var(--gold); }
  .nav-link:hover::after { width: 60%; }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  /* Language toggle — pill switch */
  .lang-toggle {
    display: flex;
    align-items: center;
    gap: 0;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 0;
    cursor: pointer;
    font-family: var(--font-body);
    overflow: hidden;
    transition: var(--transition);
  }
  .lang-toggle:hover {
    border-color: rgba(212,175,55,0.4);
  }
  .lang-opt {
    padding: 0.45rem 0.8rem;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    transition: var(--transition);
    line-height: 1;
  }
  .lang-opt.active {
    background: rgba(212,175,55,0.15);
    color: var(--gold);
  }
  .lang-divider {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.1);
    line-height: 1;
    pointer-events: none;
    user-select: none;
  }

  .nav-cta { padding: 0.6rem 1.3rem; font-size: 0.88rem; }

  .footer {
    background: var(--navy-dark);
    border-top: 1px solid rgba(212,175,55,0.12);
    padding: 3rem 2rem;
    text-align: center;
  }
  .footer-inner { max-width: 600px; margin: 0 auto; }
  .footer-name {
    font-family: var(--font-heading);
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--gold);
    margin-bottom: 0.4rem;
  }
  .footer-sub { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem; }
  .footer-divider {
    width: 80px; height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    margin: 0 auto 1.5rem;
  }
  .footer-copy { font-size: 0.8rem; color: var(--text-muted); }

  @media (max-width: 900px) {
    .nav-links { display: none; }
    .nav-cta { display: none; }
  }
  @media (max-width: 480px) {
    .lang-opt { padding: 0.45rem 0.6rem; font-size: 0.72rem; }
  }
</style>
