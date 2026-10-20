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
	import { playBlip, playConfirm } from '$lib/sound';

	let presentMode = $state(false);

	function openPresentation() {
		playConfirm();
		presentMode = true;
		document.body.style.overflow = 'hidden';
	}
	function closePresentation() {
		playBlip(440, 0.04);
		presentMode = false;
		document.body.style.overflow = '';
	}

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		const handleOpenPres = () => {
			openPresentation();
		};
		window.addEventListener('open-presentation', handleOpenPres);

		return () => {
			window.removeEventListener('open-presentation', handleOpenPres);
		};
	});
</script>

<svelte:head>
	<title>Muhammed Munir (Munir) | Full-Stack Software Engineer & Solutions Architect</title>
	<meta
		name="description"
		content="Official portfolio of Muhammed Munir (Munir) Bin Mohd Azmi — Full-Stack Software Engineer & Solutions Architect at YHCM Sdn Bhd, based in Puchong, Selangor. Specializing in Vue.js 3, Laravel 12, SvelteKit, Flutter, Docker Swarm, and Cloud Architecture."
	/>
</svelte:head>

<Hero />
<Experience />
<Projects />
<Skills />
<Contact />

<!-- Floating Presentation Deck Button -->
<button
	class="fab-present"
	onclick={openPresentation}
	id="fab-present-btn"
	aria-label="Buka Presentation Mode"
	onmouseenter={() => playBlip(600, 0.03)}
>
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2.2"
		aria-hidden="true"
	>
		<rect x="2" y="3" width="20" height="14" rx="2" />
		<line x1="8" y1="21" x2="16" y2="21" />
		<line x1="12" y1="17" x2="12" y2="21" />
	</svg>
	<span>DECK_MODE</span>
</button>

<!-- Presentation overlay -->
{#if presentMode}
	<Presentation onClose={closePresentation} />
{/if}

<style>
	.fab-present {
		position: fixed;
		bottom: 2rem;
		left: 2rem;
		z-index: 500;
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		background: rgba(8, 15, 30, 0.85);
		border: 1px solid rgba(56, 189, 248, 0.35);
		border-radius: 999px;
		padding: 0.65rem 1.25rem;
		color: var(--cyan);
		font-family: var(--font-mono);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		cursor: pointer;
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		box-shadow:
			0 12px 30px rgba(0, 0, 0, 0.6),
			0 0 20px rgba(56, 189, 248, 0.12);
		transition: all 0.25s ease;
	}
	.fab-present:hover {
		background: var(--cyan);
		color: #030712;
		border-color: var(--cyan);
		box-shadow: 0 12px 35px rgba(56, 189, 248, 0.4);
		transform: translateY(-2px);
	}

	@media (max-width: 640px) {
		.fab-present {
			left: 1rem;
			bottom: 4.8rem;
			padding: 0.5rem 0.95rem;
			font-size: 0.72rem;
		}
	}
</style>
