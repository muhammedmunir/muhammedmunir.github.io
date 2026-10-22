<script lang="ts">
	import { onMount } from 'svelte';
	import NeuralCortexCanvas from '$lib/NeuralCortexCanvas.svelte';
	import { lang } from '$lib/i18n';
	import { motionPaused } from '$lib/motion';
	import { systemProjects, systemEvidence } from '$lib/system-projects';

	let active = $state(0);
	let reduced = $state(false);
	let entered = $state(false);
	const project = $derived(systemProjects[active]);
	const evidence = $derived(systemEvidence(project, $lang));

	onMount(() => {
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => {
			reduced = media.matches;
		};
		sync();
		entered = true;
		media.addEventListener('change', sync);
		return () => media.removeEventListener('change', sync);
	});

	function open(event: 'open-presentation' | 'open-jarvis') {
		window.dispatchEvent(new CustomEvent(event));
	}
</script>

<section
	id="hero"
	class="hero-section"
	class:entered
	class:paused={$motionPaused}
	class:reduced
	aria-labelledby="hero-title"
>
	<div class="hero-container">
		<div class="hero-topline">
			<p>Muhammed Munir Bin Mohd Azmi</p>
			<p>Puchong, Selangor <span aria-hidden="true">/</span> Malaysia</p>
		</div>

		<div class="hero-layout">
			<div class="hero-left">
				<p class="profession">
					{$lang === 'ms'
						? 'Pembangun Full-Stack & Profesional IT'
						: 'Full-Stack Developer & IT Professional'}
				</p>
				<h1 id="hero-title">Munir<span>.</span></h1>
				<h2>
					{$lang === 'ms' ? 'Di sebalik sistem,' : 'Behind every system,'}<br /><em
						>{$lang === 'ms' ? 'ada cara berfikir.' : 'a way of thinking.'}</em
					>
				</h2>
				<p class="hero-bio">
					{$lang === 'ms'
						? 'Saya membina hubungan antara antara muka, data dan infrastruktur — daripada sistem sektor awam kepada aplikasi mudah alih dan automasi.'
						: 'I connect interfaces, data and infrastructure — from public-sector systems to mobile applications and automation.'}
				</p>
				<div class="hero-cta-group">
					<a href="#projects" class="hero-btn-main"
						>{$lang === 'ms' ? 'Lihat projek' : 'Explore projects'}
						<span aria-hidden="true">↗</span></a
					>
					<button type="button" class="hero-btn-pres" onclick={() => open('open-presentation')}
						><span class="story-mark" aria-hidden="true">▶</span>
						{$lang === 'ms' ? 'Cerita Ringkas' : 'Story'}</button
					>
				</div>
				<nav
					class="hero-utility-bar"
					aria-label={$lang === 'ms' ? 'Pautan portfolio' : 'Portfolio links'}
				>
					<a
						href="/resume.pdf"
						target="_blank"
						rel="noopener noreferrer"
						aria-label={$lang === 'ms' ? 'Resume PDF (tab baharu)' : 'Resume PDF (new tab)'}
						>Resume <span>PDF</span></a
					>
					<a href="#contact">{$lang === 'ms' ? 'Hubungi' : 'Contact'}</a>
					<button type="button" onclick={() => open('open-jarvis')}
						>{$lang === 'ms' ? 'Cari portfolio' : 'Search'}<svg
							width="14"
							height="14"
							viewBox="0 0 20 20"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							aria-hidden="true"><circle cx="8" cy="8" r="5.5" /><path d="m12 12 5 5" /></svg
						></button
					>
				</nav>

				<div class="project-study">
					<p class="study-label">
						{$lang === 'ms' ? 'Pilih satu sudut pandang' : 'Choose a perspective'}
					</p>
					<div
						class="project-selector"
						role="group"
						aria-label={$lang === 'ms'
							? 'Pilih projek untuk diterokai'
							: 'Choose a project to explore'}
					>
						{#each systemProjects as item, index}
							<button
								type="button"
								class:active={active === index}
								aria-pressed={active === index}
								aria-controls="hero-project-facts"
								onclick={() => (active = index)}
								><span class="project-number">0{index + 1}</span>{item.name}</button
							>
						{/each}
					</div>
					<div id="hero-project-facts" class="project-facts" aria-live="polite" aria-atomic="true">
						<p class="project-context">{project.context[$lang]}</p>
						<h3>{evidence.subtitle}</h3>
						<p class="project-summary">{project.summary[$lang]}</p>
					</div>
				</div>
			</div>

			<div class="hero-object"><NeuralCortexCanvas {project} /></div>
		</div>

		<div class="hero-footnote">
			<p>
				{$lang === 'ms'
					? 'Hasil kerja sebenar. Teknologi yang didokumenkan.'
					: 'Real work. Documented technologies.'}<span
					>{$lang === 'ms'
						? 'Sumber: penerangan dan tag projek dalam portfolio.'
						: 'Source: project descriptions and technology tags in this portfolio.'}</span
				>
			</p>
			<button
				type="button"
				class="motion-control"
				aria-pressed={$motionPaused}
				onclick={() => motionPaused.update((value) => !value)}
				><span aria-hidden="true">{$motionPaused ? '▶' : 'Ⅱ'}</span>{$lang === 'ms'
					? $motionPaused
						? 'Sambung gerakan'
						: 'Jeda gerakan'
					: $motionPaused
						? 'Resume motion'
						: 'Pause motion'}</button
			>
			{#if reduced}<span class="reduced-note"
					>{$lang === 'ms'
						? 'Gerakan dikurangkan mengikut tetapan peranti'
						: 'Reduced motion follows your device setting'}</span
				>{/if}
		</div>
	</div>
</section>

<style>
	.hero-section {
		--paper: #f3eee6;
		--ink: #201e1b;
		--copper: #ce9473;
		--muted: #645a4f;
		position: relative;
		background: var(--paper);
		color: var(--ink);
		padding: 6.5rem 1.25rem 1.5rem;
		font-family: Arial, Helvetica, sans-serif;
		isolation: isolate;
	}
	p {
		color: var(--ink);
		margin: 0;
	}
	.hero-container {
		width: 100%;
		max-width: 1320px;
		margin: 0 auto;
	}
	.hero-topline {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.3rem 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #c8bfb2;
		font-size: 0.73rem;
		line-height: 1.6;
	}
	.hero-topline p:last-child {
		color: var(--muted);
	}
	.hero-topline span {
		padding: 0 0.4rem;
	}
	.hero-layout {
		display: grid;
		gap: 2.2rem;
		padding: 1.8rem 0;
	}
	.hero-left,
	.hero-object {
		min-width: 0;
	}
	.profession {
		font-size: 0.78rem;
		color: var(--muted);
		line-height: 1.5;
	}
	h1 {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: clamp(6rem, 25vw, 9rem);
		font-weight: 400;
		letter-spacing: -0.075em;
		line-height: 1.02;
		margin: 0.2rem 0 0.9rem -0.065em;
		color: var(--ink);
	}
	h1 span {
		color: #9c6243;
	}
	h2 {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: clamp(1.6rem, 5.5vw, 2.25rem);
		font-weight: 400;
		line-height: 1.17;
		letter-spacing: -0.035em;
		color: var(--ink);
	}
	h2 em {
		font-weight: 400;
		color: #75442b;
	}
	.hero-bio {
		margin-top: 1rem;
		max-width: 29rem;
		font-size: 0.9rem;
		line-height: 1.7;
		color: var(--muted);
	}
	.hero-cta-group {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
		margin-top: 1.3rem;
	}
	button,
	a {
		-webkit-tap-highlight-color: transparent;
	}
	.hero-btn-main,
	.hero-btn-pres {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.65rem;
		min-height: 48px;
		padding: 0.65rem 1.1rem;
		border: 1px solid var(--ink);
		border-radius: 3px;
		font: inherit;
		font-size: 0.8rem;
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
		transition:
			transform 160ms cubic-bezier(0.34, 1.56, 0.64, 1),
			background-color 160ms cubic-bezier(0.16, 1, 0.3, 1);
	}
	.hero-btn-main {
		background: var(--ink);
		color: var(--paper);
	}
	.hero-btn-main span {
		font-size: 1.2rem;
	}
	.hero-btn-pres {
		color: var(--ink);
		background: transparent;
	}
	.hero-btn-main:hover {
		background: #453b30;
	}
	.hero-btn-pres:hover {
		background: #e4dacd;
		box-shadow: inset 0 1px #fffdf8;
	}
	.story-mark {
		font-size: 0.6rem;
	}
	.hero-utility-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1.1rem;
		margin-top: 0.65rem;
	}
	.hero-utility-bar a,
	.hero-utility-bar button {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		min-height: 44px;
		color: var(--muted);
		text-decoration: none;
		font: inherit;
		font-size: 0.75rem;
		background: transparent;
		border: 0;
		padding: 0 0.15rem;
		cursor: pointer;
		transition:
			transform 160ms cubic-bezier(0.34, 1.56, 0.64, 1),
			color 160ms cubic-bezier(0.16, 1, 0.3, 1);
	}
	.hero-utility-bar a:hover,
	.hero-utility-bar button:hover {
		color: var(--ink);
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.hero-utility-bar a span {
		font-size: 0.6rem;
	}
	.hero-utility-bar svg {
		width: 14px;
		height: 14px;
		display: inline-block;
		flex-shrink: 0;
	}
	.project-study {
		margin-top: 1.4rem;
	}
	.study-label {
		font-size: 0.73rem;
		color: var(--muted);
		margin-bottom: 0.5rem;
	}
	.project-selector {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}
	.project-selector button {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		min-height: 44px;
		padding: 0.45rem 0.6rem;
		border: 1px solid #897b6b;
		background: transparent;
		color: var(--ink);
		font: inherit;
		font-size: 0.73rem;
		border-radius: 3px;
		cursor: pointer;
		transition:
			transform 160ms cubic-bezier(0.34, 1.56, 0.64, 1),
			background-color 160ms cubic-bezier(0.16, 1, 0.3, 1);
	}
	.project-number {
		font-size: 0.6rem;
		font-variant-numeric: tabular-nums;
	}
	.project-selector button:hover {
		background: #e4dacd;
	}
	.project-selector button.active {
		background: var(--ink);
		color: var(--paper);
		border-color: var(--ink);
	}
	.project-facts {
		margin-top: 0.85rem;
		max-width: 29rem;
	}
	.project-context {
		font-size: 0.69rem;
		color: #75442b;
		margin-bottom: 0.2rem;
	}
	h3 {
		font:
			600 0.83rem/1.5 Arial,
			Helvetica,
			sans-serif;
		color: var(--ink);
		margin: 0;
	}
	.project-summary {
		color: var(--muted);
		font-size: 0.76rem;
		line-height: 1.65;
		margin-top: 0.3rem;
	}
	.hero-footnote {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.6rem 1.25rem;
		border-top: 1px solid #c8bfb2;
		padding-top: 0.8rem;
		color: var(--muted);
		font-size: 0.68rem;
		line-height: 1.5;
	}
	.hero-footnote p span {
		display: block;
		margin-top: 0.15rem;
	}
	.motion-control {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		min-height: 44px;
		border: 1px solid #897b6b;
		border-radius: 3px;
		padding: 0.45rem 0.65rem;
		color: var(--ink);
		background: transparent;
		cursor: pointer;
		font: inherit;
		transition:
			transform 160ms cubic-bezier(0.34, 1.56, 0.64, 1),
			background-color 160ms cubic-bezier(0.16, 1, 0.3, 1);
	}
	.motion-control:hover {
		background: #e4dacd;
	}
	.reduced-note {
		flex-basis: 100%;
		font-size: 0.65rem;
	}
	button:active,
	a:active {
		transform: scale(0.97) translateY(1px);
	}
	button:focus-visible,
	a:focus-visible {
		outline: 3px solid #75442b;
		outline-offset: 4px;
	}
	.entered .hero-left,
	.entered .hero-object {
		animation: arrive 800ms cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	.entered .hero-object {
		animation-delay: 100ms;
	}
	.paused .hero-left,
	.paused .hero-object {
		animation-play-state: paused;
	}
	.reduced .hero-left,
	.reduced .hero-object {
		animation: none;
	}
	.reduced button,
	.reduced a {
		transition: none;
	}
	@keyframes arrive {
		from {
			transform: translateY(18px);
		}
		to {
			transform: translateY(0);
		}
	}
	@media (min-width: 600px) and (max-width: 959px) {
		.hero-section {
			padding: 7rem 2rem 2rem;
		}
		.hero-layout {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			gap: 1.5rem;
		}
		h1 {
			font-size: clamp(6rem, 15vw, 9rem);
		}
		h2 {
			font-size: clamp(1.6rem, 3.5vw, 2rem);
		}
		.hero-object {
			align-self: center;
		}
		.hero-cta-group {
			gap: 0.45rem;
		}
		.hero-btn-main,
		.hero-btn-pres {
			padding: 0.6rem 0.8rem;
		}
	}
	@media (min-width: 960px) {
		.hero-section {
			padding: 7rem 4vw 1.6rem;
		}
		.hero-layout {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			gap: clamp(2rem, 5vw, 5rem);
			padding-top: 2.2rem;
			padding-bottom: 2rem;
			align-items: start;
		}
		h1 {
			font-size: clamp(9rem, 15vw, 13.75rem);
			margin-top: -0.05em;
			margin-bottom: 0.6rem;
		}
		h2 {
			font-size: clamp(2rem, 3vw, 2.65rem);
		}
		.hero-object {
			padding-top: 0.3rem;
		}
		.hero-bio {
			margin-top: 1.25rem;
			font-size: 0.94rem;
		}
		.project-study {
			margin-top: 1.6rem;
		}
		.hero-topline {
			font-size: 0.76rem;
		}
	}
	@media (max-width: 599px) {
		.hero-section {
			padding-top: 5.5rem;
		}
		.hero-layout {
			gap: 1.6rem;
			padding-block: 1.3rem;
		}
		.hero-bio {
			font-size: 0.85rem;
			line-height: 1.6;
			margin-top: 0.8rem;
		}
		.project-study {
			margin-top: 1rem;
		}
		.hero-cta-group {
			margin-top: 1rem;
		}
	}
	@media (max-width: 359px) {
		.hero-section {
			padding-inline: 1rem;
		}
		.hero-btn-main,
		.hero-btn-pres {
			padding-inline: 0.75rem;
			font-size: 0.75rem;
		}
		.project-selector {
			gap: 0.25rem;
		}
		.project-selector button {
			padding-inline: 0.45rem;
			font-size: 0.68rem;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.entered .hero-left,
		.entered .hero-object {
			animation: none;
		}
		button,
		a {
			transition: none;
		}
	}
</style>
