<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { lang } from '$lib/i18n';
	import { translations } from '$lib/translations';
	import { derived } from 'svelte/store';
	import { playBlip, playConfirm } from '$lib/sound';

	const t = derived(lang, ($l) => translations[$l].hero);

	let roleIndex = $state(0);
	let displayedRole = $state('');
	let isDeleting = $state(false);
	let activeNode = $state(0);

	const rolesMs = [
		'Jurutera Perisian Full-Stack & Solutions Architect',
		'Pembangun Sistem Sektor Awam & Enterprise (YHCM)',
		'Pakar Keselamatan Rangkaian & Splunk SIEM (UTM)',
		'Pembangun Mudah Alih Flutter & Visi Komputer Python'
	];
	const rolesEn = [
		'Full-Stack Software Engineer & Solutions Architect',
		'Enterprise & Public Sector Systems Engineer (YHCM)',
		'Network Security & Splunk SIEM Specialist (UTM)',
		'Flutter Mobile & Python Computer Vision Developer'
	];

	const archNodes = [
		{
			id: 'CORE-01',
			titleMs: 'Kejuruteraan Full-Stack & Enterprise',
			titleEn: 'Full-Stack & Enterprise Engineering',
			metric: '18+ Production Systems',
			status: 'OPTIMAL',
			color: '#38bdf8',
			stack: ['Laravel 12', 'Vue.js 3', 'SvelteKit 5', 'TypeScript', 'PostgreSQL/MySQL'],
			descMs:
				'Seni bina sistem kerajaan & korporat berskala tinggi dengan pengesahan 2FA, storan awan S3, dan prestasi sub-100ms.',
			descEn:
				'High-scale government & corporate system architecture with 2FA security, S3 cloud storage, and sub-100ms response times.'
		},
		{
			id: 'AI-02',
			titleMs: 'Visi Komputer & Automasi Pintar',
			titleEn: 'Computer Vision & Intelligent Automation',
			metric: 'Real-Time Inference',
			status: 'ACTIVE',
			color: '#818cf8',
			stack: ['Python', 'OpenCV', 'MediaPipe', 'OCR Engine', 'Automated Bots'],
			descMs:
				'Enjin pengecaman visual masa nyata, pemprosesan dokumen automatik, dan integrasi AI ke dalam aliran kerja kritikal.',
			descEn:
				'Real-time visual recognition engines, automated document pipelines, and AI integration into mission-critical workflows.'
		},
		{
			id: 'INFRA-03',
			titleMs: 'Infrastruktur Awan & Orkestrasi Kontena',
			titleEn: 'Cloud Infrastructure & Container Orchestration',
			metric: '99.9% High Availability',
			status: 'CLUSTER READY',
			color: '#10b981',
			stack: ['Docker Swarm', 'Linux Server', 'Nginx Reverse Proxy', 'CI/CD Actions', 'Cloudflare'],
			descMs:
				'Kluster kontena teragih, penyeimbangan beban trafik automatik, dan saluran penghantaran berterusan tanpa henti.',
			descEn:
				'Distributed container clusters, automated load balancing, and zero-downtime continuous deployment pipelines.'
		},
		{
			id: 'SEC-04',
			titleMs: 'Keselamatan Siber & Rangkaian Pertahanan',
			titleEn: 'Cybersecurity & Defensive Networking',
			metric: 'Zero-Trust Hardened',
			status: 'GUARDED',
			color: '#f59e0b',
			stack: [
				'Network Security',
				'Firewall Policies',
				'OWASP Hardening',
				'OAuth2 / JWT',
				'Audit Logging'
			],
			descMs:
				'Berpaksikan Ijazah Sarjana Muda Sains Komputer (Rangkaian & Keselamatan) UTM serta pengalaman industri di TNB.',
			descEn:
				'Backed by a B.Sc. in Computer Science (Networks & Security) from UTM and enterprise security experience at TNB.'
		}
	];

	function selectNode(idx: number) {
		activeNode = idx;
		playBlip(680 + idx * 60, 0.03);
	}

	function triggerPresentation() {
		playConfirm();
		window.dispatchEvent(new CustomEvent('open-presentation'));
	}

	function triggerJarvis() {
		playConfirm();
		window.dispatchEvent(new CustomEvent('open-jarvis'));
	}

	onMount(() => {
		let typeTimer: ReturnType<typeof setTimeout>;

		const tickRole = () => {
			const roles = $lang === 'ms' ? rolesMs : rolesEn;
			const currentFull = roles[roleIndex % roles.length] || '';

			if (!isDeleting) {
				displayedRole = currentFull.slice(0, displayedRole.length + 1);
				if (displayedRole === currentFull) {
					typeTimer = setTimeout(() => {
						isDeleting = true;
						tickRole();
					}, 2400);
					return;
				}
				typeTimer = setTimeout(tickRole, 45);
			} else {
				displayedRole = currentFull.slice(0, displayedRole.length - 1);
				if (displayedRole === '') {
					isDeleting = false;
					roleIndex = (roleIndex + 1) % roles.length;
					typeTimer = setTimeout(tickRole, 220);
					return;
				}
				typeTimer = setTimeout(tickRole, 24);
			}
		};
		tickRole();

		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!prefersReduced) {
			gsap.fromTo(
				'.hero-reveal',
				{ opacity: 0, y: 24 },
				{ opacity: 1, y: 0, duration: 0.75, stagger: 0.1, ease: 'power3.out' }
			);
			gsap.fromTo(
				'.arch-deck',
				{ opacity: 0, x: 28, scale: 0.98 },
				{ opacity: 1, x: 0, scale: 1, duration: 0.85, delay: 0.25, ease: 'power3.out' }
			);
		}

		const nodeAutoCycle = setInterval(() => {
			activeNode = (activeNode + 1) % archNodes.length;
		}, 6500);

		return () => {
			clearTimeout(typeTimer);
			clearInterval(nodeAutoCycle);
		};
	});
</script>

<section id="hero" class="hero-section bg-grid">
	<div class="hero-ambient" aria-hidden="true">
		<div class="glow-orb orb-cyan"></div>
		<div class="glow-orb orb-indigo"></div>
	</div>

	<div class="hero-container">
		<!-- LEFT COLUMN: EXECUTIVE IDENTITY & COMMAND ACTIONS -->
		<div class="hero-left">
			<div class="hero-reveal telemetry-banner">
				<span class="status-beacon" aria-hidden="true"></span>
				<span class="telemetry-code">SYS.NODE // MY-KUL</span>
				<span class="telemetry-sep">•</span>
				<span class="telemetry-status">{$t.badge}</span>
			</div>

			<p class="hero-reveal hero-greeting">
				{$lang === 'ms'
					? 'PORTFOLIO RASMI // JURUTERA SISTEM BERDAULAT'
					: 'OFFICIAL PORTFOLIO // SOVEREIGN SYSTEMS ARCHITECT'}
			</p>

			<h1 class="hero-reveal hero-title">
				<span class="title-primary">Muhammed Munir</span>
				<span class="title-secondary">Bin Mohd Azmi</span>
			</h1>

			<div class="hero-reveal role-terminal" aria-live="polite">
				<span class="role-prefix">&gt; ROLE_EXEC:</span>
				<span class="role-typed">{displayedRole}</span>
				<span class="role-cursor" aria-hidden="true">_</span>
			</div>

			<div class="hero-reveal hero-bio">
				{@html $t.bio}
			</div>

			<!-- Primary & Secondary CTA Hierarchy -->
			<div class="hero-reveal hero-cta-group">
				<a
					href="#projects"
					class="btn btn-primary hero-btn-main"
					onmouseenter={() => playBlip(660, 0.03)}
				>
					<svg
						width="17"
						height="17"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.2"
						aria-hidden="true"
					>
						<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
						<polyline points="2 17 12 22 22 17"></polyline>
						<polyline points="2 12 12 17 22 12"></polyline>
					</svg>
					<span>{$t.cta_projects}</span>
				</a>

				<button
					type="button"
					class="btn btn-outline hero-btn-pres"
					onclick={triggerPresentation}
					onmouseenter={() => playBlip(720, 0.03)}
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.2"
						aria-hidden="true"
					>
						<polygon points="5 3 19 12 5 21 5 3"></polygon>
					</svg>
					<span>{$lang === 'ms' ? 'Mod Persembahan (Deck)' : 'Slide Deck Mode'}</span>
				</button>
			</div>

			<!-- Quick Utility Strip -->
			<div class="hero-reveal hero-utility-bar">
				<a
					href="/resume.pdf"
					target="_blank"
					rel="noopener noreferrer"
					download="Resume_Muhammed_Munir.pdf"
					class="utility-link"
					onmouseenter={() => playBlip(580, 0.02)}
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						aria-hidden="true"
					>
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
						<polyline points="7 10 12 15 17 10"></polyline>
						<line x1="12" y1="15" x2="12" y2="3"></line>
					</svg>
					<span>{$t.cta_resume}</span>
				</a>
				<span class="utility-dot" aria-hidden="true">/</span>
				<a href="#contact" class="utility-link" onmouseenter={() => playBlip(620, 0.02)}>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						aria-hidden="true"
					>
						<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
						></path>
						<polyline points="22,6 12,13 2,6"></polyline>
					</svg>
					<span>{$t.cta_contact}</span>
				</a>
				<span class="utility-dot" aria-hidden="true">/</span>
				<button
					type="button"
					class="utility-link utility-cmd"
					onclick={triggerJarvis}
					onmouseenter={() => playBlip(760, 0.02)}
				>
					<span class="cmd-spark">⌘K</span>
					<span>{$lang === 'ms' ? 'Buka Terminal AI' : 'Launch AI Terminal'}</span>
				</button>
			</div>
		</div>

		<!-- RIGHT COLUMN: INTERACTIVE SYSTEM ARCHITECTURE DECK -->
		<div class="arch-deck card">
			<!-- Deck Top Bar -->
			<div class="deck-header">
				<div class="deck-dots" aria-hidden="true">
					<span class="dot-red"></span>
					<span class="dot-amber"></span>
					<span class="dot-green"></span>
				</div>
				<div class="deck-title">
					<span>ARCHITECTURE_TOPOLOGY.SYS</span>
				</div>
				<div class="deck-live">
					<span class="live-pulse"></span>
					<span>LIVE TELEMETRY</span>
				</div>
			</div>

			<!-- Interactive Node Selector Tabs -->
			<div class="node-grid" role="tablist" aria-label="System Architecture Domains">
				{#each archNodes as node, idx}
					<button
						type="button"
						role="tab"
						aria-selected={activeNode === idx}
						class="node-tab"
						class:active={activeNode === idx}
						style="--node-color: {node.color}"
						onclick={() => selectNode(idx)}
					>
						<div class="node-tab-top">
							<span class="node-id">{node.id}</span>
							<span class="node-status">{node.status}</span>
						</div>
						<div class="node-tab-title">
							{$lang === 'ms' ? node.titleMs : node.titleEn}
						</div>
					</button>
				{/each}
			</div>

			<!-- Active Node Inspection Viewport -->
			{#each [archNodes[activeNode]] as current}
				<div class="node-viewport" style="--active-color: {current.color}">
					<div class="viewport-meta">
						<span class="viewport-id">NODE // {current.id}</span>
						<span class="viewport-metric">{current.metric}</span>
					</div>
					<h2 class="viewport-heading">
						{$lang === 'ms' ? current.titleMs : current.titleEn}
					</h2>
					<p class="viewport-desc">
						{$lang === 'ms' ? current.descMs : current.descEn}
					</p>
					<div class="viewport-stack">
						{#each current.stack as tech}
							<span class="stack-chip">{tech}</span>
						{/each}
					</div>
				</div>
			{/each}

			<!-- Executive Telemetry Metrics Strip -->
			<div class="deck-metrics">
				<div class="metric-cell">
					<span class="metric-val">4+</span>
					<span class="metric-lbl">{$t.stats.exp}</span>
				</div>
				<div class="metric-cell">
					<span class="metric-val">18+</span>
					<span class="metric-lbl">{$t.stats.projects}</span>
				</div>
				<div class="metric-cell">
					<span class="metric-val">18+</span>
					<span class="metric-lbl">{$t.stats.tech}</span>
				</div>
				<div class="metric-cell">
					<span class="metric-val metric-utm">UTM</span>
					<span class="metric-lbl">{$t.stats.degree}</span>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.hero-section {
		position: relative;
		min-height: 100vh;
		display: flex;
		align-items: center;
		padding: 7.5rem 5vw 4.5rem;
		overflow: hidden;
	}

	.hero-ambient {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 0;
	}
	.glow-orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(110px);
		opacity: 0.28;
	}
	.orb-cyan {
		width: 520px;
		height: 520px;
		background: radial-gradient(circle, #00f0ff 0%, transparent 70%);
		top: -120px;
		left: -100px;
	}
	.orb-indigo {
		width: 580px;
		height: 580px;
		background: radial-gradient(circle, #6366f1 0%, transparent 70%);
		bottom: -160px;
		right: -120px;
	}

	.hero-container {
		position: relative;
		z-index: 1;
		max-width: 1340px;
		width: 100%;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1.08fr 0.92fr;
		gap: 3.5rem;
		align-items: center;
	}

	/* Left Column */
	.hero-left {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.telemetry-banner {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.4rem 0.9rem;
		background: rgba(12, 22, 41, 0.85);
		border: 1px solid rgba(56, 189, 248, 0.28);
		border-radius: 999px;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 0 24px rgba(56, 189, 248, 0.08);
	}
	.status-beacon {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--emerald);
		box-shadow: 0 0 10px var(--emerald);
	}
	.telemetry-code {
		color: var(--cyan);
		font-weight: 600;
		letter-spacing: 0.06em;
	}
	.telemetry-sep {
		color: var(--text-muted);
	}
	.telemetry-status {
		color: var(--text-primary);
	}

	.hero-greeting {
		font-family: var(--font-mono);
		font-size: 0.82rem;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: var(--text-secondary);
		margin-bottom: 0.5rem;
	}

	.hero-title {
		display: flex;
		flex-direction: column;
		font-family: var(--font-heading);
		font-size: clamp(2.5rem, 4.8vw, 4.35rem);
		font-weight: 700;
		line-height: 1.04;
		letter-spacing: -0.03em;
		margin-bottom: 1.25rem;
	}
	.title-primary {
		color: var(--white);
	}
	.title-secondary {
		background: linear-gradient(135deg, #38bdf8 0%, #818cf8 55%, #10b981 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.role-terminal {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.55rem 1rem;
		background: rgba(7, 13, 25, 0.9);
		border-left: 3px solid var(--cyan);
		border-radius: 0 8px 8px 0;
		font-family: var(--font-mono);
		font-size: clamp(0.85rem, 1.3vw, 1.02rem);
		margin-bottom: 1.5rem;
		min-height: 2.6rem;
	}
	.role-prefix {
		color: var(--text-muted);
		font-size: 0.78rem;
	}
	.role-typed {
		color: var(--cyan);
		font-weight: 600;
	}
	.role-cursor {
		color: var(--cyan);
		animation: cursor-blink 1s steps(2) infinite;
	}
	@keyframes cursor-blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}

	.hero-bio {
		font-size: clamp(0.98rem, 1.15vw, 1.1rem);
		line-height: 1.75;
		color: var(--text-secondary);
		max-width: 600px;
		margin-bottom: 2rem;
	}
	:global(.hero-bio .highlight) {
		color: var(--white);
		font-weight: 600;
		background: rgba(56, 189, 248, 0.08);
		padding: 0.15rem 0.45rem;
		border-radius: 4px;
		border-bottom: 1px solid rgba(56, 189, 248, 0.35);
	}

	.hero-cta-group {
		display: flex;
		flex-wrap: wrap;
		gap: 0.9rem;
		margin-bottom: 1.65rem;
	}
	.hero-btn-main,
	.hero-btn-pres {
		padding: 0.85rem 1.5rem;
		font-size: 0.9rem;
	}

	.hero-utility-bar {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.75rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(148, 163, 184, 0.14);
		width: 100%;
		max-width: 560px;
	}
	.utility-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-family: var(--font-mono);
		font-size: 0.76rem;
		color: var(--text-secondary);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.2rem 0;
		transition: color 0.2s ease;
	}
	.utility-link:hover {
		color: var(--cyan);
	}
	.utility-dot {
		color: rgba(148, 163, 184, 0.28);
		font-family: var(--font-mono);
		font-size: 0.75rem;
	}
	.cmd-spark {
		background: rgba(56, 189, 248, 0.12);
		border: 1px solid rgba(56, 189, 248, 0.3);
		color: var(--cyan);
		padding: 0.05rem 0.35rem;
		border-radius: 4px;
		font-size: 0.68rem;
	}

	/* Right Column: Architecture Deck */
	.arch-deck {
		padding: 1.35rem;
		background: rgba(8, 15, 30, 0.82);
		border: 1px solid rgba(56, 189, 248, 0.22);
		border-radius: 18px;
		box-shadow:
			0 24px 60px -12px rgba(0, 0, 0, 0.75),
			0 0 35px rgba(56, 189, 248, 0.07);
	}

	.deck-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 1rem;
		margin-bottom: 1rem;
		border-bottom: 1px solid rgba(148, 163, 184, 0.12);
		font-family: var(--font-mono);
		font-size: 0.7rem;
	}
	.deck-dots {
		display: flex;
		gap: 6px;
	}
	.deck-dots span {
		width: 9px;
		height: 9px;
		border-radius: 50%;
	}
	.dot-red {
		background: #ef4444;
		opacity: 0.8;
	}
	.dot-amber {
		background: #f59e0b;
		opacity: 0.8;
	}
	.dot-green {
		background: #10b981;
		opacity: 0.8;
	}
	.deck-title {
		color: var(--text-secondary);
		letter-spacing: 0.08em;
	}
	.deck-live {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		color: var(--emerald);
		font-weight: 600;
	}
	.live-pulse {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--emerald);
		box-shadow: 0 0 8px var(--emerald);
	}

	.node-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.65rem;
		margin-bottom: 1rem;
	}
	.node-tab {
		text-align: left;
		padding: 0.75rem 0.85rem;
		background: rgba(3, 7, 18, 0.65);
		border: 1px solid rgba(148, 163, 184, 0.14);
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.25s ease;
	}
	.node-tab:hover {
		border-color: rgba(56, 189, 248, 0.35);
		background: rgba(12, 22, 42, 0.8);
	}
	.node-tab.active {
		background: rgba(15, 29, 54, 0.92);
		border-color: var(--node-color);
		box-shadow: inset 0 0 18px rgba(56, 189, 248, 0.08);
	}
	.node-tab-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-family: var(--font-mono);
		font-size: 0.65rem;
		margin-bottom: 0.3rem;
	}
	.node-id {
		color: var(--node-color);
		font-weight: 700;
	}
	.node-status {
		color: var(--text-muted);
	}
	.node-tab-title {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-primary);
		line-height: 1.3;
	}

	.node-viewport {
		padding: 1.15rem;
		background: rgba(3, 7, 18, 0.78);
		border: 1px solid rgba(148, 163, 184, 0.16);
		border-left: 3px solid var(--active-color);
		border-radius: 12px;
		margin-bottom: 1rem;
	}
	.viewport-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		margin-bottom: 0.45rem;
	}
	.viewport-id {
		color: var(--active-color);
		font-weight: 700;
	}
	.viewport-metric {
		color: var(--white);
		background: rgba(148, 163, 184, 0.12);
		padding: 0.12rem 0.5rem;
		border-radius: 4px;
	}
	.viewport-heading {
		font-family: var(--font-heading);
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--white);
		margin-bottom: 0.45rem;
	}
	.viewport-desc {
		font-size: 0.85rem;
		line-height: 1.6;
		color: var(--text-secondary);
		margin-bottom: 0.85rem;
	}
	.viewport-stack {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.stack-chip {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		padding: 0.2rem 0.55rem;
		background: rgba(56, 189, 248, 0.08);
		border: 1px solid rgba(56, 189, 248, 0.22);
		color: var(--text-primary);
		border-radius: 5px;
	}

	.deck-metrics {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
		padding-top: 0.85rem;
		border-top: 1px solid rgba(148, 163, 184, 0.12);
	}
	.metric-cell {
		background: rgba(3, 7, 18, 0.55);
		border: 1px solid rgba(148, 163, 184, 0.1);
		border-radius: 8px;
		padding: 0.6rem 0.5rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.metric-val {
		font-family: var(--font-heading);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--cyan);
		line-height: 1.1;
	}
	.metric-utm {
		color: var(--emerald);
	}
	.metric-lbl {
		font-family: var(--font-mono);
		font-size: 0.62rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	@media (max-width: 1080px) {
		.hero-container {
			grid-template-columns: 1fr;
			gap: 2.5rem;
		}
		.hero-section {
			padding-top: 6.8rem;
		}
	}
	@media (max-width: 600px) {
		.node-grid {
			grid-template-columns: 1fr;
		}
		.deck-metrics {
			grid-template-columns: repeat(2, 1fr);
		}
		.hero-cta-group {
			width: 100%;
			flex-direction: column;
		}
		.hero-btn-main,
		.hero-btn-pres {
			width: 100%;
			justify-content: center;
		}
	}
</style>
