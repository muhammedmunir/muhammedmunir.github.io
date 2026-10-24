<script lang="ts">
	import { onMount } from 'svelte';
	import { lang } from '$lib/i18n';
	import {
		createEngineState,
		REGIONS,
		type EngineState,
		type Projection,
		type Region
	} from './state';
	import { connectNavigation } from './input';
	import { resolveLabels } from './anchors';
	import { systemProjects } from '$lib/system-projects';
	const engine = createEngineState();
	const project = systemProjects[0];
	let worldState = $state<EngineState>(engine.get());
	let projection = $state<Projection | null>(null);
	let frameWidth = $state(1440);
	let frameHeight = $state(900);
	const labelPositions = $derived(
		projection ? resolveLabels(projection, frameWidth, frameHeight) : null
	);
	let ready = $state(false);
	let failed = $state(false);
	let message = $state('');
	let host: HTMLDivElement;
	let journey: HTMLDivElement;
	const copy = (ms: string, en: string) => ($lang === 'ms' ? ms : en);
	const labels = $derived({
		interface: copy('Antara muka', 'Interface'),
		services: copy('Perkhidmatan', 'Services'),
		data: copy('Data', 'Data'),
		intelligence: copy('Kecerdasan', 'Intelligence')
	});
	const descriptions = $derived({
		interface: copy(
			'Input bermula pada pengalaman manusia. Permukaan aplikasi membuka laluan kepada proses.',
			'Input begins with a human experience. Application surfaces open a path into processing.'
		),
		services: copy(
			'Peraturan aplikasi menghubungkan permintaan, pengesahan dan aliran kerja.',
			'Application rules connect requests, validation and workflows.'
		),
		data: copy(
			'Rekod memberi kesinambungan: data berstruktur, akses dan jejak audit.',
			'Records provide continuity: structured data, access and an audit trail.'
		),
		intelligence: copy(
			'Fokus AI: alat pembangunan, eksperimen ejen dan automasi. Respons ini konseptual, bukan inferens model.',
			'AI focus: development tools, agent experiments and automation. This response is conceptual, not model inference.'
		)
	});
	function activate(region: Region) {
		engine.activate(region);
		message = `${labels[region]}. ${descriptions[region]}`;
	}
	function language(value: 'ms' | 'en') {
		lang.set(value);
		message = value === 'ms' ? 'Bahasa Melayu dipilih.' : 'English selected.';
	}
	function anchor(region: Region, index: number) {
		const p = labelPositions?.[region];
		return p
			? `--x:${p.x}px;--y:${p.y}px`
			: `--x:${[25, 72, 72, 25][index]}%;--y:${[44, 44, 70, 70][index]}%`;
	}
	onMount(() => {
		let alive = true;
		const abort = new AbortController();
		let scene: { dispose(): void } | undefined;
		const unsub = engine.subscribe((next) => {
			if (next.activation !== worldState.activation)
				message = `${labels[next.selected]}. ${descriptions[next.selected]}`;
			worldState = next;
		});
		const disconnect = connectNavigation(journey, engine);
		void import('./scene')
			.then(async ({ mountEngine }) => {
				if (!alive) return;
				const instance = await mountEngine(host, engine, {
					signal: abort.signal,
					onReady: () => {
						if (alive) ready = true;
					},
					onFail: () => {
						if (alive) {
							failed = true;
							ready = false;
						}
					},
					onProject: (value) => {
						if (alive) {
							frameWidth = host.clientWidth;
							frameHeight = host.clientHeight;
							projection = value;
						}
					}
				});
				if (!alive) {
					instance.dispose();
					return;
				}
				scene = instance;
			})
			.catch(() => {
				if (alive) failed = true;
			});
		return () => {
			alive = false;
			abort.abort();
			scene?.dispose();
			disconnect();
			unsub();
		};
	});
</script>

<svelte:head>
	<title>Muhammed Munir — The Living Systems Engine</title>
	<meta
		name="description"
		content="Muhammed Munir — Full-Stack Engineer × AI. An interactive conceptual system connecting interface, services, data and intelligent automation. Hero prototype."
	/>
</svelte:head>

<div class="experience" data-engine-state={failed ? 'fallback' : ready ? 'ready' : 'loading'}>
	<a class="skip" href="#emesys">{copy('Langkau ke eMesys', 'Skip to eMesys')}</a>
	<header>
		<a href="#engine" class="mark" aria-label="MUNIR — Muhammed Munir"
			>MUNIR<span aria-hidden="true">/</span></a
		>
		<p class="study">THE LIVING<br />SYSTEMS ENGINE</p>
		<div class="language" role="group" aria-label={copy('Bahasa', 'Language')}>
			<button onclick={() => language('ms')} aria-pressed={$lang === 'ms'}>BM</button><button
				onclick={() => language('en')}
				aria-pressed={$lang === 'en'}>EN</button
			>
		</div>
	</header>
	<main>
		<div class="journey" bind:this={journey}>
			<div class="spatial-stage" style={`--travel:${projection?.progress ?? 0}`}>
				{#if projection && labelPositions && ready}<svg
						class="anchor-links"
						aria-hidden="true"
						viewBox={`0 0 ${frameWidth} ${frameHeight}`}
						>{#each REGIONS as region}<path
								d={`M ${projection.anchors[region].x} ${projection.anchors[region].y} L ${labelPositions[region].x} ${labelPositions[region].y}`}
							/>{/each}</svg
					>{/if}
				<div class="canvas-host" bind:this={host} aria-hidden="true"></div>
				{#if !ready}
					<svg class="fallback-art" viewBox="0 0 1000 850" aria-hidden="true" focusable="false">
						<defs
							><radialGradient id="engine-shade"
								><stop stop-color="#624446" /><stop
									offset="1"
									stop-color="#171722"
								/></radialGradient
							><linearGradient id="petal-face" x2="1" y2="1"
								><stop stop-color="#f5e4ce" /><stop
									offset="1"
									stop-color="#785159"
								/></linearGradient
							></defs
						>
						<ellipse cx="500" cy="540" rx="400" ry="220" fill="url(#engine-shade)" />
						<g transform="translate(500 460) scale(1 .65)">
							<ellipse rx="315" ry="280" fill="#302431" stroke="#8b6466" stroke-width="4" />
							{#each [0, 90, 180, 270] as angle}<path
									transform={`rotate(${angle})`}
									d="M50-30Q120-250 255-210Q370-85 195 65Q135 110 60 40Q185 5 210-100Q120-135 50-30"
									fill="url(#petal-face)"
									stroke="#d1b39b"
									stroke-width="2"
								/>{/each}
							<ellipse rx="177" ry="166" fill="none" stroke="#dda26b" stroke-width="10" /><ellipse
								rx="60"
								ry="53"
								fill="#c98b48"
								stroke="#f4d8a8"
								stroke-width="8"
							/>
						</g>
					</svg>
				{/if}
				{#if ready && !failed}
					<div class="world-labels" class:departed={(projection?.progress ?? 0) > 0.65}>
						{#each REGIONS as region, index}
							<button
								class="region"
								data-region={region}
								class:chosen={worldState.selected === region}
								style={anchor(region, index)}
								aria-pressed={worldState.selected === region}
								onclick={() => activate(region)}
							>
								<span class="region-index" aria-hidden="true">0{index + 1}</span><span
									>{labels[region]}</span
								><span class="region-cue" aria-hidden="true">↗</span>
							</button>
						{/each}
					</div>
				{/if}
				<div class="ambient-caption" aria-hidden="true">
					{copy('SATU INPUT. SELURUH SISTEM.', 'ONE INPUT. A WHOLE SYSTEM.')}
				</div>
			</div>
			<section class="arrival" id="engine" aria-labelledby="identity">
				<div class="identity">
					<h1 id="identity">Muhammed <span>Munir.</span></h1>
					<p class="role">Full-Stack Engineer <span>× AI</span></p>
				</div>
				<p class="positioning">
					{copy(
						'Membina sistem sebenar. Meneroka automasi pintar.',
						'Building real systems. Exploring intelligent automation.'
					)}
				</p>
				<div class="arrival-bottom">
					<p class="instruction">
						{copy(
							'Sentuh satu lapisan. Lihat sistem bertindak.',
							'Touch a layer. Watch the system respond.'
						)}<span
							>{copy(
								'Web & mudah alih / API / data / aliran kerja AI',
								'Web & mobile / APIs / data / AI workflows'
							)}</span
						>
					</p>
					<a href="#emesys"
						>{copy('Masuk ke eMesys', 'Enter eMesys')} <span aria-hidden="true">↓</span></a
					>
				</div>
			</section>
			<section
				class="project-reveal"
				class:anchored={ready}
				id="emesys"
				aria-labelledby="project-title"
				tabindex="-1"
			>
				<div
					class="project-anchor"
					style={projection
						? `--anchor-x:${projection.project.x}px;--anchor-y:${projection.project.y}px`
						: ''}
				>
					<p class="index">01 / {copy('SISTEM OPERASI', 'OPERATIONAL SYSTEMS')}</p>
					<h2 id="project-title">eMesys<span>.</span></h2>
					<p class="project-summary">{project.summary[$lang]}</p>
					<p class="detail">
						{copy(
							'Rekod inventori, kelulusan pelupusan, RBAC dan log audit. Visual terbuka ini menghubungkan lapisan perkhidmatan dengan data.',
							'Inventory records, disposal approvals, RBAC and audit logs. This open visual connects the service layer with data.'
						)}
					</p>
					<p class="stack">Vue.js 3 / Laravel 11 / MariaDB / Docker Swarm</p>
					<p class="disclosure">
						{copy(
							'Metafora sistem, bukan topologi produksi. AI ialah fokus alat dan eksperimen; scene ini tidak menjalankan model AI.',
							'System metaphor, not production topology. AI is a focus in tools and experiments; this scene does not run an AI model.'
						)}
					</p>
				</div>
			</section>
		</div>
		<section class="text-alternative" aria-labelledby="reading-title">
			<h2 id="reading-title">{copy('Di sebalik dunia ini', 'Behind this world')}</h2>
			<p>
				{copy(
					'Antara muka menerima input; perkhidmatan mengendalikan aliran kerja; data menyimpan rekod; kecerdasan melambangkan eksplorasi alat AI dan automasi. Empat lapisan ini ialah penerangan konseptual, bukan dakwaan seni bina projek.',
					'Interfaces receive input; services handle workflows; data preserves records; intelligence represents exploration of AI tools and automation. These four layers are a conceptual explanation, not a claim about project architecture.'
				)}
			</p>
			{#if !ready}<p>
					{copy(
						'Ilustrasi statik dipaparkan. Semua maklumat profesional kekal boleh dibaca tanpa WebGL.',
						'A static illustration is displayed. All professional information remains readable without WebGL.'
					)}
				</p>{/if}
		</section>
	</main>
	<p class="sr-only" role="status" aria-live="polite" aria-atomic="true">{message}</p>
	<footer>
		<p>
			{copy('PROTOTAIP ARAH SENI / BELUM DITERBITKAN', 'ART-DIRECTION PROTOTYPE / UNPUBLISHED')}
		</p>
		<a href="/resume.pdf">Resume (PDF)</a><a href="mailto:muhammed.munir97.mm@gmail.com"
			>{copy('Hubungi Munir', 'Contact Munir')}</a
		>
	</footer>
</div>

<style>
	.experience {
		--bg: #171722;
		--fg: #f4e8d9;
		--secondary: #cdc1c1;
		--signal: #edc18d;
		background: var(--bg);
		color: var(--fg);
		font-family: 'Helvetica Neue', Arial, sans-serif;
		isolation: isolate;
		line-height: 1.55;
		color-scheme: dark;
	}
	.experience :global(h1),
	.experience :global(h2) {
		font-family: inherit;
		font-weight: 400;
		letter-spacing: -0.065em;
		line-height: 1;
		color: var(--fg);
	}
	.experience :global(a),
	.experience :global(button) {
		min-height: 44px;
		touch-action: manipulation;
	}
	.experience :global(:focus-visible) {
		outline: 3px solid #ffe0b0;
		outline-offset: 5px;
	}
	.skip {
		position: fixed;
		z-index: 20;
		top: 1rem;
		left: 1rem;
		padding: 0.8rem;
		background: #f4e8d9;
		color: #171722;
		transform: translateY(-200%);
	}
	.skip:focus {
		transform: none;
	}
	header {
		position: absolute;
		inset: 0 0 auto;
		z-index: 5;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 3vw;
	}
	.mark {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		font-size: 1.05rem;
		letter-spacing: -0.04em;
		text-decoration: none;
		font-weight: 700;
	}
	.mark span {
		color: var(--signal);
	}
	.study {
		font-size: 0.62rem;
		line-height: 1.25;
		letter-spacing: 0.05em;
	}
	.language {
		display: flex;
	}
	.language button {
		min-width: 44px;
		border: 0;
		background: none;
		color: var(--secondary);
		font-size: 0.75rem;
	}
	.language button[aria-pressed='true'] {
		color: var(--fg);
		text-decoration: underline;
		text-underline-offset: 0.3em;
	}
	.journey {
		position: relative;
	}
	.spatial-stage {
		position: sticky;
		top: 0;
		height: 100svh;
		min-height: 600px;
		margin-bottom: -100svh;
		z-index: 0;
		background: #171722;
		overflow: hidden;
	}
	.canvas-host,
	.fallback-art {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	.anchor-links {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 1;
	}
	.anchor-links path {
		stroke: #edc18d;
		stroke-width: 1;
		fill: none;
		opacity: 0.5;
	}
	.world-labels {
		z-index: 2;
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.region {
		position: absolute;
		left: clamp(5rem, var(--x), calc(100% - 5rem));
		top: clamp(17rem, var(--y), calc(100% - 7rem));
		transform: translate(-50%, -50%);
		pointer-events: auto;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		width: 146px;
		border: 0;
		background: #211d2bf2;
		color: var(--fg);
		padding: 0.5rem 0.75rem;
		font-size: 0.75rem;
		cursor: pointer;
		text-align: left;
	}
	.region-index {
		font-size: 0.55rem;
		color: var(--signal);
		align-self: start;
		padding-top: 0.25rem;
	}
	.region-cue {
		margin-left: auto;
		color: var(--signal);
	}
	.region.chosen {
		box-shadow: inset 0 -2px #edc18d;
	}
	.departed .region {
		font-size: 0.65rem;
		width: 146px;
		padding: 0.25rem 0.5rem;
	}
	.ambient-caption {
		position: absolute;
		left: 50%;
		bottom: 15%;
		transform: translateX(-50%);
		font-size: 0.55rem;
		letter-spacing: 0.13em;
		white-space: nowrap;
		color: #ded1c5;
		pointer-events: none;
	}
	.arrival {
		position: relative;
		z-index: 1;
		height: 100svh;
		min-height: 600px;
		pointer-events: none;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		padding: 100px 3vw 1.6rem;
	}
	.arrival a {
		pointer-events: auto;
	}
	.identity {
		text-align: center;
	}
	h1 {
		font-size: clamp(2.4rem, 5vw, 6rem);
		margin: 0;
	}
	h1 span {
		font-style: italic;
	}
	.role {
		font-size: clamp(0.75rem, 1.15vw, 1rem);
		margin-top: 1rem;
		letter-spacing: 0.02em;
	}
	.role span {
		color: var(--signal);
	}
	.positioning {
		position: absolute;
		top: 30%;
		left: 3vw;
		width: 19ch;
		font-size: 0.82rem;
		line-height: 1.4;
		color: var(--secondary);
	}
	.arrival-bottom {
		width: 100%;
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 1.5rem;
		font-size: 0.75rem;
	}
	.instruction {
		max-width: 35ch;
	}
	.instruction span {
		display: block;
		color: var(--secondary);
		font-size: 0.65rem;
		margin-top: 0.5rem;
	}
	.arrival-bottom a {
		display: flex;
		gap: 2rem;
		align-items: center;
		text-decoration: none;
	}
	.project-reveal {
		position: relative;
		z-index: 1;
		min-height: 80svh;
		pointer-events: none;
		padding: 8svh 3vw;
		display: flex;
		align-items: center;
		scroll-margin-top: 0;
	}
	.anchored .project-anchor {
		position: relative;
		left: clamp(0px, calc(var(--anchor-x, 50px) - 450px - 3vw), 14vw);
		top: clamp(-8rem, calc(var(--anchor-y, 350px) - 45svh), 8rem);
		margin-left: 0;
	}
	.project-anchor {
		width: min(360px, 32vw);
		margin-left: clamp(0px, calc(var(--anchor-x, 50px) - 560px), 7vw);
		background: #171722f7;
		padding: 1.5rem;
	}
	.index {
		font-size: 0.58rem;
		letter-spacing: 0.06em;
		color: var(--signal);
	}
	h2 {
		font-size: clamp(2.8rem, 5vw, 5.5rem);
		margin: 1rem 0;
	}
	h2 span {
		color: var(--signal);
	}
	.project-summary {
		font-size: 1.05rem;
		line-height: 1.4;
	}
	.detail {
		font-size: 0.8rem;
		color: var(--secondary);
		margin-top: 1.2rem;
	}
	.stack {
		font-size: 0.7rem;
		margin-top: 1.4rem;
		line-height: 1.8;
	}
	.disclosure {
		font-size: 0.65rem;
		color: var(--secondary);
		margin-top: 1.4rem;
		line-height: 1.6;
	}
	.text-alternative {
		position: relative;
		z-index: 2;
		background: #171722;
		padding: 3rem max(3vw, 1.2rem);
		max-width: none;
		border-top: 1px solid #716578;
	}
	.text-alternative h2 {
		font-size: 1.4rem;
		letter-spacing: -0.025em;
		margin: 0 0 1rem;
	}
	.text-alternative p {
		max-width: 75ch;
		font-size: 0.85rem;
		color: var(--secondary);
	}
	footer {
		position: relative;
		z-index: 2;
		background: #171722;
		display: flex;
		align-items: center;
		gap: 2rem;
		padding: 1rem 3vw;
		font-size: 0.65rem;
	}
	footer p {
		margin-right: auto;
		color: var(--secondary);
	}
	footer a {
		display: flex;
		align-items: center;
	}
	@media (max-width: 699px) {
		header {
			padding: 0.75rem 1rem;
		}
		.mark {
			gap: 0.7rem;
		}
		.study {
			font-size: 0.5rem;
		}
		.arrival {
			padding: 100px 1rem 1.3rem;
			min-height: 660px;
		}
		.spatial-stage {
			min-height: 660px;
		}
		h1 {
			font-size: clamp(2.5rem, 11vw, 3.5rem);
			max-width: 12ch;
		}
		.role {
			font-size: 0.75rem;
		}
		.positioning {
			top: 26%;
			left: 1rem;
			width: 19ch;
			font-size: 0.67rem;
		}
		.region {
			width: 116px;
			font-size: 0.62rem;
			gap: 0.35rem;
			padding: 0.4rem 0.5rem;
			left: clamp(3.7rem, var(--x), calc(100% - 3.7rem));
			top: clamp(16rem, var(--y), calc(100% - 9rem));
		}
		.region-index {
			font-size: 0.48rem;
		}
		.region-cue {
			display: none;
		}
		.ambient-caption {
			bottom: 20%;
			font-size: 0.45rem;
			letter-spacing: 0.08em;
		}
		.arrival-bottom {
			font-size: 0.65rem;
			gap: 0.5rem;
		}
		.instruction {
			max-width: 24ch;
		}
		.instruction span {
			font-size: 0.56rem;
		}
		.arrival-bottom a {
			max-width: 15ch;
			gap: 0.7rem;
		}
		.project-reveal {
			padding: 36svh 1rem 1rem;
			min-height: 100svh;
			align-items: end;
		}
		.anchored .project-anchor {
			left: 0;
			top: clamp(-3rem, calc(var(--anchor-y, 450px) - 55svh), 3rem);
		}
		.departed .region {
			width: 116px;
		}
		.project-anchor {
			width: 100%;
			margin-left: 0;
			padding: 1.2rem;
			background: #171722;
		}
		.project-summary {
			font-size: 1rem;
		}
		footer {
			padding: 1rem;
			gap: 1rem;
			flex-wrap: wrap;
		}
		footer p {
			width: 100%;
		}
	}
	@media (forced-colors: active) {
		.experience {
			--bg: Canvas;
			--fg: CanvasText;
			--secondary: CanvasText;
			--signal: LinkText;
			background: Canvas;
			color: CanvasText;
		}
		.spatial-stage {
			display: none;
		}
		.arrival {
			background: Canvas;
		}
		.project-anchor,
		.text-alternative,
		footer {
			background: Canvas;
		}
		.project-reveal {
			padding-top: 2rem;
			min-height: 0;
		}
	}
</style>
