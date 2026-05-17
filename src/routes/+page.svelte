<script lang="ts">
  import Hero from '$lib/Hero.svelte';
  import Experience from '$lib/Experience.svelte';
  import Projects from '$lib/Projects.svelte';
  import Skills from '$lib/Skills.svelte';
  import Contact from '$lib/Contact.svelte';
  import Presentation from '$lib/Presentation.svelte';
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  let presentMode = $state(false);

  function openPresentation() { presentMode = true; document.body.style.overflow = 'hidden'; }
  function closePresentation() { presentMode = false; document.body.style.overflow = ''; }

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            navLinks.forEach(link => {
              link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
            });
          }
        });
      },
      { threshold: 0.4, rootMargin: '-80px 0px -40% 0px' }
    );
    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  });
</script>

<svelte:head>
  <title>Muhammed Munir Bin Mohd Azmi | Full-Stack Developer & IT Professional</title>
  <meta name="description" content="Portfolio of Muhammed Munir Bin Mohd Azmi — IT Professional, Full-Stack Developer specializing in secure, scalable applications with Vue.js, Laravel, SvelteKit, and Flutter." />
</svelte:head>

<Hero />
<Experience />
<Projects />
<Skills />
<Contact />

<!-- Floating Present button -->
<button class="fab-present" onclick={openPresentation} id="fab-present-btn" aria-label="Buka Presentation Mode">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
  Present
</button>

<!-- Presentation overlay -->
{#if presentMode}
  <Presentation onClose={closePresentation} />
{/if}

<style>
  .fab-present {
    position: fixed;
    bottom: 2rem; right: 2rem;
    z-index: 500;
    display: flex; align-items: center; gap: 0.55rem;
    background: linear-gradient(135deg, #1E3A5F, #2a4f7c);
    border: 1px solid rgba(212,175,55,0.4);
    border-radius: 50px;
    padding: 0.8rem 1.5rem;
    color: #D4AF37;
    font-family: 'Inter', sans-serif;
    font-size: 0.88rem; font-weight: 700;
    letter-spacing: 0.06em;
    cursor: pointer;
    box-shadow: 0 8px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .fab-present:hover {
    background: linear-gradient(135deg, #D4AF37, #e8c84a);
    color: #0a1422;
    border-color: transparent;
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(212,175,55,0.35);
  }
</style>
