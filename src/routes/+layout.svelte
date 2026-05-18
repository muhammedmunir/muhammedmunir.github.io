<script lang="ts">
  import './layout.css';
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import { lang, toggleLang } from '$lib/i18n';
  import { translations } from '$lib/translations';
  import { derived, get } from 'svelte/store';
  import { page } from '$app/stores';

  let { children }: { children: Snippet } = $props();
  let navScrolled = $state(false);
  let mobileOpen = $state(false);

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
  // isGamesPage will be evaluated in template via $page store
</script>

<svelte:head>
  <title>Muhammed Munir | Full-Stack Developer & IT Professional</title>
</svelte:head>

{#if !$page.url.pathname.startsWith('/games')}
<!-- NAV -->
<nav class="nav" class:scrolled={navScrolled} aria-label="Main navigation">
  <div class="nav-inner">
    <a href={$page.url.pathname.startsWith('/games') ? '/#hero' : '#hero'} class="nav-logo" id="nav-logo">
      <span class="logo-port">Port</span><span class="logo-folio">folio</span>
    </a>

    <ul class="nav-links" role="list">
      {#each navKeys as link}
        <li>
          <a href={$page.url.pathname.startsWith('/games') ? `/${link.href}` : link.href} class="nav-link" id="nav-{link.key}">
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

      <a href="/games" class="btn btn-games nav-games" id="nav-games-btn">
        🎮 Games
      </a>
      {#if !$page.url.pathname.startsWith('/games')}
      <a href="#contact" class="btn btn-primary nav-cta" id="nav-hire-btn">
        {$t.nav.hire}
      </a>
      {/if}

      <!-- Hamburger button (mobile only) -->
      <button
        class="hamburger"
        class:open={mobileOpen}
        onclick={() => mobileOpen = !mobileOpen}
        aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
        aria-expanded={mobileOpen}
      >
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>

  <!-- Mobile dropdown menu -->
  {#if mobileOpen}
    <div class="mobile-menu" role="navigation" aria-label="Mobile navigation">
      {#each navKeys as link}
        <a
          href={link.href}
          class="mobile-nav-link"
          onclick={() => mobileOpen = false}
        >{$t.nav[link.key]}</a>
      {/each}
      <div class="mobile-menu-divider"></div>
      <a href="/games" class="mobile-nav-link mobile-games-link" onclick={() => mobileOpen = false}>🎮 Games</a>
      <a href="#contact" class="btn btn-primary mobile-cta" onclick={() => mobileOpen = false} id="mobile-hire-btn">
        {$t.nav.hire}
      </a>
    </div>
  {/if}
</nav>
{/if}

<main>
  {@render children()}
</main>

{#if !$page.url.pathname.startsWith('/games')}
<!-- Footer -->
<footer class="footer">
  <div class="footer-inner">
    <p class="footer-name">Muhammed Munir Bin Mohd Azmi</p>
    <p class="footer-sub">{$t.footer.sub}</p>
    <div class="footer-divider"></div>
    <p class="footer-copy">© {new Date().getFullYear()} {$t.footer.copy}</p>
  </div>
</footer>
{/if}

<style>
  .nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 1000;
    padding: 1.4rem 4vw;
    /* Push content below iOS notch / Dynamic Island */
    padding-top: max(1.4rem, env(safe-area-inset-top, 0px));
    transition: background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease, padding 0.4s ease;
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
  .btn-games {
    background: rgba(212,175,55,0.08);
    border: 1px solid rgba(212,175,55,0.3);
    color: #D4AF37;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    font-weight: 700;
    transition: all 0.2s;
  }
  .btn-games:hover {
    background: rgba(212,175,55,0.18);
    transform: none;
  }

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

  /* Hamburger button */
  .hamburger {
    display: none;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px 4px;
    border-radius: 6px;
    transition: var(--transition);
  }
  .hamburger span {
    display: block;
    width: 22px;
    height: 2px;
    background: var(--text-secondary);
    border-radius: 2px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); background: var(--gold); }
  .hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); background: var(--gold); }

  /* Mobile dropdown menu */
  .mobile-menu {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.75rem 4vw 1.25rem;
    background: rgba(10, 20, 35, 0.98);
    border-top: 1px solid rgba(212,175,55,0.12);
    animation: menuSlide 0.22s ease;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  @keyframes menuSlide {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .mobile-nav-link {
    padding: 0.8rem 1rem;
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-secondary);
    border-radius: 8px;
    transition: var(--transition);
  }
  .mobile-nav-link:hover { color: var(--gold); background: rgba(212,175,55,0.07); }
  .mobile-games-link { color: var(--gold); }
  .mobile-menu-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 0.25rem 0; }
  .mobile-cta { margin-top: 0.5rem; justify-content: center; }

  @media (max-width: 900px) {
    .nav-links { display: none; }
    .nav-cta { display: none; }
    .hamburger { display: flex; }
    /* Mobile nav: no transitions (prevents half-transparent flash), no backdrop-filter
       (expensive on mobile + causes frosted-glass "separuh" look), fully opaque bg. */
    .nav {
      transition: none;
      padding: 1.1rem 4vw;
      padding-top: max(1.1rem, env(safe-area-inset-top, 0px));
    }
    .nav.scrolled {
      transition: none;
      padding: 1.1rem 4vw;
      padding-top: max(1.1rem, env(safe-area-inset-top, 0px));
      background: rgba(10, 20, 35, 0.97);
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
  }
  @media (max-width: 540px) {
    /* Hide standalone Games button on very small screens — accessible via hamburger */
    .btn-games { display: none; }
    .nav-logo { font-size: 1.2rem; }
    .lang-opt { padding: 0.4rem 0.55rem; font-size: 0.72rem; }
  }
</style>
