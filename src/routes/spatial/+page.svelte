<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';

  onMount(() => {
    goto(`${base}/`, { replaceState: true });
  });
</script>

<svelte:head>
  <title>Pengalihan | Muhammed Munir</title>
  <meta name="robots" content="noindex, follow" />
  <meta http-equiv="refresh" content="0; url={base}/" />
  <link rel="canonical" href="https://muhammedmunir.github.io/" />
</svelte:head>

<main style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100svh; font-family: var(--font-body, sans-serif); padding: 1.5rem; text-align: center;">
  <p style="margin-bottom: 1rem;">Sedang mengalihkan ke laman utama...</p>
  <a href="{base}/" style="color: var(--work-accent, #1848bd); font-weight: 600;">Pergi ke Portfolio Muhammed Munir</a>
</main>
