<script lang="ts">
	import { onMount } from 'svelte';
	import { lang } from '$lib/i18n';
	import type { createFoundry } from './foundry';

	let ready = $state(false);
	let failed = $state(false);
	let reduced = $state(true);
	let activated = $state(false);
	let announcement = $state('');
	let host: HTMLDivElement;
	let journey: HTMLDivElement;
	let controller: Awaited<ReturnType<typeof createFoundry>> | undefined;
	const copy = (ms: string, en: string) => ($lang === 'ms' ? ms : en);
	function language(value: 'ms' | 'en') {
		lang.set(value);
		announcement = value === 'ms' ? 'Bahasa Melayu dipilih.' : 'English selected.';
	}
	function activate() {
		if (!ready || failed) return;
		controller?.activate();
		activated = true;
		announcement = copy(
			'Input diterima. Lapisan proses dan data dibuka. Visual ini konseptual, bukan inferens AI.',
			'Input received. Process and data layers open. This is a conceptual response, not AI inference.'
		);
	}
	onMount(() => {
		let alive = true;
		const abort = new AbortController();
		const media = matchMedia('(prefers-reduced-motion: reduce)');
		const preference = () => {
			reduced = media.matches;
			controller?.setReduced(reduced);
		};
		preference();
		const scroll = () => {
			const height = Math.max(1, journey.offsetHeight - innerHeight);
			const top = journey.getBoundingClientRect().top + scrollY;
			controller?.setProgress(Math.max(0, Math.min(1, (scrollY - top) / height)));
		};
		void import('./foundry')
			.then(async ({ createFoundry }) => {
				if (!alive) return;
				const instance = await createFoundry(host, {
					reduced,
					signal: abort.signal,
					onReady: () => {
						if (alive) ready = true;
					},
					onFail: () => {
						if (alive) {
							failed = true;
							ready = false;
						}
					}
				});
				if (!alive) {
					instance.dispose();
					return;
				}
				controller = instance;
				controller.setReduced(reduced);
				scroll();
			})
			.catch(() => {
				if (alive) failed = true;
			});
		media.addEventListener('change', preference);
		window.addEventListener('scroll', scroll, { passive: true });
		window.addEventListener('resize', scroll, { passive: true });
		return () => {
			alive = false;
			abort.abort();
			controller?.dispose();
			controller = undefined;
			media.removeEventListener('change', preference);
			window.removeEventListener('scroll', scroll);
			window.removeEventListener('resize', scroll);
		};
	});
</script>

<svelte:head>
	<title>Muhammed Munir — The Living Stack / Hero study</title>
	<meta
		name="description"
		content="Muhammed Munir. Full-stack developer with an AI focus. A conceptual interactive world connecting interface, processing and data. Unpublished hero prototype."
	/>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="living" data-living-state={failed ? 'fallback' : ready ? 'ready' : 'loading'}>
	<a class="skip" href="#project">{copy('Langkau ke projek', 'Skip to project')}</a>
	<header>
		<a href="#arrival" class="brand" aria-label="MUNIR — Muhammed Munir"
			>MUNIR<span aria-hidden="true">↗</span></a
		>
		<p class="edition">
			THE LIVING STACK<br /><span>{copy('Kajian interaktif / 01', 'Interactive study / 01')}</span>
		</p>
		<div class="languages" role="group" aria-label={copy('Bahasa', 'Language')}>
			<button aria-pressed={$lang === 'ms'} onclick={() => language('ms')}>BM</button>
			<button aria-pressed={$lang === 'en'} onclick={() => language('en')}>EN</button>
		</div>
	</header>
	<main>
		<div class="journey" bind:this={journey}>
			<div class="stage" aria-hidden="true">
				<div class="render-host" bind:this={host}></div>
				{#if !ready}
					<svg class="fallback" viewBox="0 0 1200 760" focusable="false" aria-hidden="true">
						<defs
							><linearGradient id="stone" x2="0" y2="1"
								><stop stop-color="#f9f6ed" /><stop
									offset="1"
									stop-color="#b5c5b6"
								/></linearGradient
							></defs
						>
						<ellipse cx="620" cy="600" rx="460" ry="65" fill="#c5c7bc" opacity=".55" />
						<g transform="translate(600 430) scale(1 .55) rotate(-20)">
							{#each [70, 50, 30, 10] as y, i}<path
									transform={`translate(0 ${y})`}
									d="M-430-120Q-350-260-140-190Q-20-260 120-160Q360-250 430-80Q530 110 240 170Q20 260-100 160Q-370 230-430 100Q-510 20-430-120"
									fill={i === 0 ? '#344b40' : i === 1 ? '#bfd2c4' : 'url(#stone)'}
									stroke="#a4afa2"
									stroke-width="3"
								/>{/each}
							<path
								d="M-350 65Q-200 120-80 35T70-75Q280-160 300 0T60 40"
								fill="none"
								stroke="#d93620"
								stroke-width="30"
							/>
							<g fill="#eeece1" stroke="#a9b5a6" stroke-width="2"
								>{#each Array(14) as _, i}<path
										transform={`translate(${-260 + i * 7} ${-80 + i * 6})`}
										d="M-90 20V-80Q-10-170 80-70V20Z"
									/>{/each}</g
							>
							<ellipse
								cx="80"
								cy="-5"
								rx="115"
								ry="110"
								fill="#d2e4d2"
								stroke="#f9f6ed"
								stroke-width="24"
							/>
							<ellipse cx="80" cy="-20" rx="60" ry="60" fill="#f8f7d8" />
						</g>
					</svg>
				{/if}
			</div>
			<section class="arrival" id="arrival" aria-labelledby="identity">
				<div class="identity">
					<p class="location">SELANGOR, MY</p>
					<h1 id="identity">Muhammed<br /> <span>Munir.</span></h1>
					<p class="position">
						Full-Stack Developer <span aria-hidden="true">×</span><br />{copy(
							'Fokus kejuruteraan AI',
							'AI-focused engineering'
						)}
					</p>
				</div>
				<p class="thesis">
					{copy('Bukan hanya antara muka.', 'Beyond the interface.')}<br /><em
						>{copy('Seluruh sistem.', 'The whole system.')}</em
					>
				</p>
				{#if ready && !failed}
					<button class="world-input" onclick={activate} aria-describedby="world-description">
						<span class="input-label"
							><span aria-hidden="true">↳</span>
							{activated
								? copy('Hantar input lagi', 'Send another input')
								: copy('Hantar satu input', 'Send an input')}</span
						>
					</button>
				{/if}
				<p class="sr-only" id="world-description">
					{copy(
						'Buka lapisan dan jejak input melalui proses ke data. Respons visual konseptual, bukan inferens AI.',
						'Open layers and trace input through processing to data. A conceptual visual response, not AI inference.'
					)}
				</p>
				<div class="arrival-foot">
					<p>
						{copy('ANTARA MUKA / PROSES / DATA', 'INTERFACE / PROCESS / DATA')}<br /><span
							>{copy(
								'Dunia konseptual. Bukan model AI aktif.',
								'Conceptual world. Not a live AI model.'
							)}</span
						>
					</p>
					<a href="#project"
						>{copy('Lihat keratan sistem', 'Look beneath the surface')}
						<span aria-hidden="true">↓</span></a
					>
				</div>
			</section>
			<section class="project" id="project" aria-labelledby="project-title" tabindex="-1">
				<div class="project-copy">
					<p class="index">01 / {copy('KERATAN PERTAMA', 'FIRST CROSS-SECTION')}</p>
					<h2 id="project-title">eMesys<span>.</span></h2>
					<p class="project-intro">
						{copy(
							'Di sebalik setiap aset, ada aliran keputusan.',
							'Behind every asset, a chain of decisions.'
						)}
					</p>
					<p>
						{copy(
							'Pengurusan kitaran hayat aset sektor awam: rekod inventori, kelulusan pelupusan, akses berasaskan peranan dan log audit.',
							'Public-sector asset lifecycle management: inventory records, disposal approvals, role-based access and audit logs.'
						)}
					</p>
					<p class="stack">Vue.js 3 / Laravel 11 / MariaDB / Docker Swarm</p>
					<p class="note">
						{copy(
							'Keratan ini ialah metafora visual, bukan tangkap layar atau seni bina produksi. Prototaip berhenti di sini untuk semakan arah seni.',
							'This cross-section is a visual metaphor, not a screenshot or production architecture. The prototype stops here for art-direction review.'
						)}
					</p>
				</div>
			</section>
		</div>
	</main>
	<p class="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
	<footer>
		<span>{copy('PROTOTAIP / BELUM DITERBITKAN', 'PROTOTYPE / UNPUBLISHED')}</span><a
			href="/resume.pdf">Resume (PDF)</a
		><a href="mailto:muhammed.munir97.mm@gmail.com">{copy('E-mel Munir', 'Email Munir')}</a>
	</footer>
</div>

<style>
	.living {
		--paper: #e8e7e1;
		--ink: #202c27;
		--accent: #aa2919;
		color: var(--ink);
		background: var(--paper);
		font-family: 'Helvetica Neue', Arial, sans-serif;
		isolation: isolate;
		color-scheme: light;
		line-height: 1.5;
	}
	.living :global(h1),
	.living :global(h2) {
		font-family: inherit;
		font-weight: 500;
		letter-spacing: -0.07em;
		color: var(--ink);
	}
	.living :global(a),
	.living :global(button) {
		touch-action: manipulation;
		min-height: 44px;
	}
	.living :global(:focus-visible) {
		outline: 3px solid #a62d1c;
		outline-offset: 5px;
	}
	.skip {
		position: fixed;
		z-index: 9;
		left: 1rem;
		top: 1rem;
		padding: 0.8rem;
		background: #202c27;
		color: #fff;
		transform: translateY(-200%);
	}
	.skip:focus {
		transform: none;
	}
	header {
		height: 90px;
		position: absolute;
		inset: 0 0 auto;
		z-index: 5;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 3.5vw;
		gap: 1rem;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 2rem;
		text-decoration: none;
		font-size: 1.25rem;
		font-weight: 750;
		letter-spacing: -0.06em;
	}
	.brand span {
		color: var(--accent);
		font-size: 1.5rem;
	}
	.edition {
		font-size: 0.68rem;
		letter-spacing: 0.025em;
		line-height: 1.5;
	}
	.edition span {
		color: #4f5c53;
	}
	.languages {
		display: flex;
	}
	.languages button {
		min-width: 44px;
		border: 0;
		background: none;
		color: inherit;
		font-size: 0.75rem;
	}
	.languages button[aria-pressed='true'] {
		text-decoration: underline;
		text-underline-offset: 0.35em;
	}
	.journey {
		position: relative;
	}
	.stage {
		position: sticky;
		top: 0;
		height: 100svh;
		min-height: 580px;
		margin-bottom: -100svh;
		overflow: hidden;
		z-index: 0;
		background: #e8e7e1;
		pointer-events: none;
	}
	.render-host {
		position: absolute;
		inset: 0;
	}
	.fallback {
		width: 100%;
		height: 100%;
		position: absolute;
		inset: 0;
	}
	.arrival {
		height: 100svh;
		min-height: 580px;
		position: relative;
		z-index: 1;
		pointer-events: none;
		padding: 110px 3.5vw 2rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
	.arrival a,
	.arrival button {
		pointer-events: auto;
	}
	.identity {
		align-self: start;
		position: relative;
		z-index: 2;
	}
	.location {
		font-size: 0.65rem;
		letter-spacing: 0.06em;
		margin-bottom: 0.7rem;
	}
	h1 {
		font-size: clamp(3rem, 5.4vw, 7rem);
		line-height: 0.89;
		margin: 0;
	}
	h1 span {
		color: var(--accent);
	}
	.position {
		font-size: clamp(0.9rem, 1.2vw, 1.25rem);
		margin-top: 1.2rem;
		line-height: 1.35;
		letter-spacing: -0.025em;
	}
	.position span {
		color: var(--accent);
	}
	.thesis {
		position: absolute;
		right: 4vw;
		top: 126px;
		font-size: clamp(1rem, 1.8vw, 1.7rem);
		text-align: right;
		line-height: 1.25;
		letter-spacing: -0.04em;
	}
	.thesis em {
		font-style: normal;
		color: var(--accent);
	}
	.world-input {
		position: absolute;
		inset: 39% 3.5vw 14%;
		border: 0;
		background: transparent;
		color: var(--ink);
		cursor: pointer;
		z-index: 1;
		text-align: left;
	}
	.input-label {
		position: absolute;
		left: 0;
		bottom: 0;
		font-size: 0.78rem;
		background: #e8e7e1;
		padding: 0.5rem 0.8rem;
		border-radius: 0;
	}
	.input-label span {
		color: var(--accent);
		margin-right: 0.5rem;
	}
	.world-input:hover .input-label {
		text-decoration: underline;
		text-underline-offset: 0.3em;
	}
	.world-input:focus-visible {
		outline-offset: -5px;
	}
	.arrival-foot {
		display: flex;
		justify-content: space-between;
		gap: 1.5rem;
		align-items: end;
		font-size: 0.67rem;
		letter-spacing: 0.03em;
		position: relative;
		z-index: 2;
	}
	.arrival-foot p {
		line-height: 1.7;
	}
	.arrival-foot p span {
		font-size: 0.65rem;
		color: #4f5c53;
		letter-spacing: 0;
	}
	.arrival-foot a {
		display: flex;
		align-items: center;
		gap: 2rem;
		font-size: 0.8rem;
		text-decoration: none;
	}
	.project {
		position: relative;
		z-index: 1;
		min-height: 75svh;
		display: flex;
		align-items: center;
		padding: 5rem 4vw;
		scroll-margin-top: 0;
		pointer-events: none;
	}
	.project-copy {
		width: min(440px, 38vw);
		background: #e8e7e1;
		padding: 1.5rem 1.8rem 1.5rem 0;
	}
	.index {
		font-size: 0.65rem;
		color: var(--accent);
		letter-spacing: 0.04em;
	}
	h2 {
		font-size: clamp(3rem, 6vw, 7rem);
		line-height: 1.05;
		margin: 1.2rem 0;
	}
	h2 span {
		color: var(--accent);
	}
	.project-intro {
		font-size: 1.25rem;
		line-height: 1.3;
		letter-spacing: -0.025em;
		margin-bottom: 1rem;
	}
	.project-copy > p:not(.project-intro):not(.index) {
		font-size: 0.85rem;
		line-height: 1.65;
	}
	.stack {
		padding: 1.5rem 0;
		font-weight: 600;
	}
	.note {
		color: #4f5c53;
		font-size: 0.73rem !important;
	}
	footer {
		position: relative;
		z-index: 2;
		padding: 1.25rem 3.5vw;
		background: #e8e7e1;
		display: flex;
		gap: 2rem;
		align-items: center;
		font-size: 0.7rem;
		flex-wrap: wrap;
	}
	footer span {
		margin-right: auto;
		color: #4f5c53;
	}
	footer a {
		display: inline-flex;
		align-items: center;
	}
	@media (min-width: 1700px) {
		.arrival {
			padding-top: 135px;
		}
		.thesis {
			top: 145px;
		}
	}
	@media (max-width: 699px) {
		header {
			height: 76px;
			padding: 0 1.2rem;
		}
		.brand {
			gap: 0.65rem;
			font-size: 1.1rem;
		}
		.edition {
			font-size: 0.55rem;
			max-width: 12ch;
		}
		.edition span {
			display: none;
		}
		.arrival {
			padding: 95px 1.2rem 1.25rem;
			min-height: 660px;
		}
		.stage {
			min-height: 660px;
		}
		h1 {
			font-size: clamp(3rem, 12.7vw, 4.2rem);
		}
		.location {
			font-size: 0.57rem;
			margin-bottom: 0.6rem;
		}
		.position {
			font-size: 0.9rem;
			margin-top: 1rem;
		}
		.thesis {
			top: 285px;
			right: 1.2rem;
			font-size: 0.9rem;
			max-width: 18ch;
		}
		.world-input {
			inset: 44% 1rem 16%;
		}
		.input-label {
			font-size: 0.7rem;
			padding: 0.35rem;
		}
		.arrival-foot {
			font-size: 0.54rem;
			gap: 0.7rem;
			align-items: end;
		}
		.arrival-foot p span {
			display: block;
			max-width: 23ch;
			font-size: 0.58rem;
			line-height: 1.4;
		}
		.arrival-foot a {
			font-size: 0.7rem;
			max-width: 15ch;
			gap: 0.5rem;
		}
		.project {
			min-height: 90svh;
			padding: 25svh 1.2rem 2rem;
			align-items: end;
		}
		.project-copy {
			width: 100%;
			padding: 1.3rem;
			background: #e8e7e1;
		}
		.project-intro {
			font-size: 1.1rem;
		}
		h2 {
			font-size: 3.8rem;
		}
		.project-copy > p:not(.project-intro):not(.index) {
			font-size: 0.8rem;
		}
		footer {
			padding: 1rem 1.2rem;
			gap: 1rem;
			font-size: 0.65rem;
		}
		footer span {
			width: 100%;
		}
	}
	@media (max-height: 560px) and (min-width: 700px) {
		.arrival,
		.stage {
			min-height: 580px;
		}
		.thesis {
			top: 100px;
		}
		.arrival {
			padding-top: 90px;
		}
		h1 {
			font-size: 3rem;
		}
	}
	@media (forced-colors: active) {
		.living {
			--paper: Canvas;
			--ink: CanvasText;
			--accent: LinkText;
			background: Canvas;
			color: CanvasText;
		}
		.stage {
			display: none;
		}
		.arrival {
			background: Canvas;
		}
		.project-copy,
		footer,
		.input-label {
			background: Canvas;
		}
		.world-input {
			display: none;
		}
	}
</style>
