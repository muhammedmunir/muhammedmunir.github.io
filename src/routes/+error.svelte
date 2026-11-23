<script lang="ts">
  import { page } from '$app/state';
  import { base } from '$app/paths';
  import { getLocale } from '$lib/workbench/preferences.svelte';

  const en = $derived(getLocale() === 'en');
  const missing = $derived(page.status === 404);
</script>

<svelte:head>
  <title>{missing ? (en ? 'Page not found' : 'Halaman tidak ditemui') : (en ? 'Error' : 'Ralat')} | Muhammed Munir</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main lang={en ? 'en' : 'ms'}>
  <a class="identity" href="{base}/">munir<span>.</span></a>
  <div class="body">
    <p class="code">{page.status}</p>
    <h1>{missing ? (en ? 'This page does not exist.' : 'Halaman ini tiada.') : (en ? 'Something went wrong.' : 'Sesuatu tidak kena.')}</h1>
    <p class="note">{missing
      ? (en ? 'The link may be old or mistyped. Everything is in the 3D room or the text CV.' : 'Pautan mungkin lama atau tersalah taip. Semua kandungan ada di bilik 3D atau CV teks.')
      : (en ? 'Please try again, or open the text CV.' : 'Sila cuba lagi, atau buka CV teks.')}</p>
    <nav aria-label={en ? 'Where to go' : 'Pergi ke'}>
      <a class="primary" href="{base}/">{en ? 'Go to the 3D room' : 'Ke bilik 3D'}</a>
      <a href="{base}/cv">{en ? 'Read the CV' : 'Baca CV'}</a>
    </nav>
  </div>
</main>

<style>
  main { min-height: 100svh; display: flex; flex-direction: column; padding: 20px 32px 48px; background: radial-gradient(ellipse at 30% 40%, #15171c 0%, #0b0c0f 65%); color: #f4f4f5; font-family: var(--font-body); }
  .identity { align-self: flex-start; display: inline-flex; align-items: center; min-height: 44px; font: 800 30px/1 var(--font-heading); letter-spacing: -.07em; color: inherit; text-decoration: none; }
  .identity span { color: var(--work-accent); }
  .body { flex: 1; display: flex; flex-direction: column; justify-content: center; max-width: 34rem; }
  .code { margin: 0; font: 800 clamp(5rem, 16vw, 9rem)/.9 var(--font-heading); letter-spacing: -.06em; color: var(--work-accent); }
  h1 { margin: 18px 0 0; font: 700 clamp(1.5rem, 3.4vw, 2.1rem)/1.15 var(--font-heading); letter-spacing: -.03em; }
  .note { margin: 14px 0 0; color: #b4b4bd; line-height: 1.6; }
  nav { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
  nav a { display: inline-flex; align-items: center; min-height: 44px; padding: 0 18px; border-radius: 999px; border: 1px solid rgba(255,255,255,.24); color: inherit; text-decoration: none; font-weight: 600; font-size: .9375rem; }
  nav a:hover { border-color: var(--work-accent); }
  nav a.primary { background: var(--work-accent); border-color: var(--work-accent); color: #0b0c0f; }
  :is(a):focus-visible { outline: 3px solid var(--work-accent); outline-offset: 3px; }
  @media (max-width: 600px) { main { padding: 14px 16px 32px; } .identity { font-size: 24px; } }
</style>
