<script lang="ts">
	import Hero from '$lib/Hero.svelte';
	import Experience from '$lib/Experience.svelte';
	import Projects from '$lib/Projects.svelte';
	import Skills from '$lib/Skills.svelte';
	import Contact from '$lib/Contact.svelte';
	import { hasOpenModal } from '$lib/deck/focus-utils';
	import Presentation from '$lib/Presentation.svelte';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { playBlip, playConfirm } from '$lib/sound';
	import { lang } from '$lib/i18n';

	let presentMode = $state(false);

	function openPresentation() {
		if (presentMode || hasOpenModal()) return;
		playConfirm();
		presentMode = true;
	}
	function closePresentation() {
		playBlip(440, 0.04);
		presentMode = false;
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

<div class="neural-page">
	<div class="neural-spine" aria-hidden="true">
		<svg viewBox="0 0 160 1000" preserveAspectRatio="none">
			<defs
				><linearGradient id="spine-color" x1="0" y1="0" x2="0" y2="1"
					><stop stop-color="#67e8f9" /><stop offset="0.5" stop-color="#b5a1ff" /><stop
						offset="1"
						stop-color="#efd18c"
					/></linearGradient
				></defs
			>
			<path
				class="spine-trunk"
				d="M80 0 C20 100 130 140 70 240 S130 410 75 510 S20 680 85 770 S125 910 75 1000"
			/>
			{#each [160, 350, 550, 750, 920] as y}
				<path
					d={`M80 ${y} q-25 -35 -58 -45 m35 20 -5 -30 M80 ${y} q25 30 64 35 m-38 -16 10 30 M80 ${y} q-20 35 -54 45`}
				/>
				<circle cx="80" cy={y} r="4" />
			{/each}
		</svg>
	</div>
	<Hero />
	<Experience />
	<Projects />
	<Skills />
	<Contact />
</div>

<!-- Floating Presentation Deck Button -->
<button
	class="fab-present"
	onclick={openPresentation}
	id="fab-present-btn"
	aria-label={$lang === 'ms'
		? 'DECK_MODE — Buka dek pembentangan'
		: 'DECK_MODE — Open presentation deck'}
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
	.neural-page {
		position: relative;
		isolation: isolate;
	}
	.neural-spine {
		position: absolute;
		inset: 20rem auto 0 max(0px, calc((100vw - 1400px) / 2));
		width: 100px;
		pointer-events: none;
		z-index: -1;
		opacity: 0.42;
	}
	.neural-spine svg {
		width: 100%;
		height: 100%;
		overflow: visible;
	}
	.neural-spine path {
		fill: none;
		stroke: url(#spine-color);
		stroke-width: 1;
		vector-effect: non-scaling-stroke;
	}
	.neural-spine .spine-trunk {
		stroke-width: 2;
	}
	.neural-spine circle {
		fill: #a5eaf2;
	}
	@media (max-width: 640px) {
		.neural-spine {
			width: 28px;
			opacity: 0.3;
		}
	}
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
