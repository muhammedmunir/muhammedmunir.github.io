<script lang="ts">
	import NeuralCortexCanvas from '$lib/NeuralCortexCanvas.svelte';
	import { lang } from '$lib/i18n';
	import { translations } from '$lib/translations';
	import { derived } from 'svelte/store';
	import { playBlip, playConfirm } from '$lib/sound';

	const t = derived(lang, ($l) => translations[$l].hero);

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
			shortMs: 'Full-Stack',
			shortEn: 'Full-Stack',
			color: '#38bdf8',
			stack: ['Laravel 12', 'Vue.js 3', 'SvelteKit 5', 'TypeScript', 'PostgreSQL 17', 'MariaDB'],
			descMs:
				'Seni bina sistem kerajaan & korporat berskala tinggi di YHCM Sdn Bhd dengan pengesahan 2FA, storan awan S3, dan integrasi perkhidmatan.',
			descEn:
				'High-scale government & corporate system architecture at YHCM Sdn Bhd with 2FA security, S3 cloud storage, and service integration.'
		},
		{
			id: 'AI-02',
			titleMs: 'Visi Komputer & Automasi Pintar',
			titleEn: 'Computer Vision & Intelligent Automation',
			shortMs: 'Visi & AI',
			shortEn: 'Vision & AI',
			color: '#818cf8',
			stack: ['Python', 'OpenCV', 'MediaPipe', 'OCR Engine', 'Automated Desktop Bots'],
			descMs:
				'Enjin pengecaman visual masa nyata, pemprosesan dokumen automatik, dan integrasi AI ke dalam aliran kerja pengeluaran.',
			descEn:
				'Real-time visual recognition engines, automated document pipelines, and AI integration into production workflows.'
		},
		{
			id: 'INFRA-03',
			titleMs: 'Infrastruktur Awan & Orkestrasi Kontena',
			titleEn: 'Cloud Infrastructure & Container Orchestration',
			shortMs: 'Infrastruktur',
			shortEn: 'Infrastructure',
			color: '#00f0ff',
			stack: [
				'Docker Swarm',
				'Linux Swarm',
				'Nginx Reverse Proxy',
				'GitHub Actions',
				'Cloudflare WAF'
			],
			descMs:
				'Kluster kontena teragih, penyeimbangan beban trafik automatik, dan saluran penghantaran sifar-henti (zero-downtime).',
			descEn:
				'Distributed container clusters, automated load balancing, and zero-downtime continuous deployment pipelines.'
		},
		{
			id: 'SEC-04',
			titleMs: 'Keselamatan Siber & Rangkaian Pertahanan',
			titleEn: 'Cybersecurity & Defensive Networking',
			shortMs: 'Keselamatan',
			shortEn: 'Security',
			color: '#e2b857',
			stack: [
				'Splunk SIEM',
				'Network Security',
				'OWASP Hardening',
				'Zero-Trust RBAC',
				'Audit Forensics'
			],
			descMs:
				'Berpaksikan Ijazah Sarjana Muda Sains Komputer (Rangkaian & Keselamatan) UTM serta pengalaman industri pertahanan di TNB.',
			descEn:
				'Backed by a B.Sc. in Computer Science (Networks & Security) from UTM and defensive security operations at TNB.'
		}
	];

	function selectNode(idx: number) {
		activeNode = idx;
		playBlip(680 + idx * 50, 0.03);
	}

	function triggerPresentation() {
		playConfirm();
		window.dispatchEvent(new CustomEvent('open-presentation'));
	}

	function triggerJarvis() {
		playConfirm();
		window.dispatchEvent(new CustomEvent('open-jarvis'));
	}
</script>

<section id="hero" class="hero-section">
	<!-- Bioluminescent Living Neural Cortex Engine -->
	<NeuralCortexCanvas active={activeNode} />

	<div class="hero-container">
		<!-- LEFT COLUMN: EXECUTIVE SOVEREIGN IDENTITY -->
		<div class="hero-left">
			<div class="telemetry-banner">
				<span class="status-beacon" aria-hidden="true"></span>
				<span class="telemetry-code">SHAH ALAM / PUCHONG, MY</span>
				<span class="telemetry-sep">•</span>
				<span class="telemetry-status">{$t.badge}</span>
			</div>

			<p class="hero-greeting">
				{$lang === 'ms'
					? 'PORTFOLIO RASMI // JURUTERA SISTEM & SENI BINA'
					: 'OFFICIAL PORTFOLIO // SYSTEMS ARCHITECT & ENGINEER'}
			</p>

			<h1 class="hero-title">
				<span class="title-primary">Muhammed Munir</span>
				<span class="title-secondary">Bin Mohd Azmi</span>
			</h1>

			<div class="role-terminal">
				<span class="terminal-prefix" aria-hidden="true">❯</span>
				<span class="role-text">{$lang === 'ms' ? rolesMs[0] : rolesEn[0]}</span>
			</div>

			<div class="hero-bio">
				{@html $t.bio}
			</div>

			<!-- Primary CTAs -->
			<div class="hero-cta-group">
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

			<!-- Tactical Utility Bar -->
			<div class="hero-utility-bar">
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
						stroke-width="2.2"
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
						stroke-width="2.2"
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
					<span>{$lang === 'ms' ? 'Konsol AI' : 'AI Console'}</span>
				</button>
			</div>
		</div>

		<!-- RIGHT COLUMN: TACTICAL NEURAL ARCHITECTURE TERMINAL -->
		<div class="arch-deck">
			<!-- Terminal Header -->
			<div class="deck-header">
				<div class="deck-header-left">
					<span class="pulse-beacon" aria-hidden="true"></span>
					<span class="deck-code">ARCHITECTURE_TOPOLOGY.SYS</span>
				</div>
				<span class="deck-node-count">NODE [0{activeNode + 1}/04]</span>
			</div>

			<!-- 4-Node Synaptic Selector Grid -->
			<div
				class="synaptic-grid"
				role="group"
				aria-label={$lang === 'ms' ? 'Pilih Domain Seni Bina' : 'Select Architecture Domain'}
			>
				{#each archNodes as node, idx}
					<button
						type="button"
						class="synaptic-card"
						class:active={activeNode === idx}
						style="--node-accent: {node.color};"
						aria-pressed={activeNode === idx}
						aria-controls="neural-telemetry-viewport"
						aria-label={`0${idx + 1} ${$lang === 'ms' ? node.shortMs : node.shortEn} — ${$lang === 'ms' ? node.titleMs : node.titleEn}`}
						onclick={() => selectNode(idx)}
					>
						<div class="card-head">
							<span
								class="node-badge"
								style="background: {node.color}22; color: {node.color}; border: 1px solid {node.color}44;"
							>
								{node.id}
							</span>
							<span
								class="node-live-dot"
								style="background: {node.color}; box-shadow: 0 0 8px {node.color};"
								aria-hidden="true"
							></span>
						</div>
						<div class="card-title">{$lang === 'ms' ? node.titleMs : node.titleEn}</div>
						<div class="card-indicator" aria-hidden="true"></div>
					</button>
				{/each}
			</div>

			<!-- Active Node Telemetry Viewport -->
			{#each [archNodes[activeNode]] as current}
				<div
					id="neural-telemetry-viewport"
					class="telemetry-viewport"
					style="--active-accent: {current.color};"
					aria-live="polite"
				>
					<div class="viewport-header">
						<div class="viewport-title-row">
							<span
								class="active-pill"
								style="background: {current.color}25; color: {current.color}; border: 1px solid {current.color}55;"
							>
								{current.id} // {$lang === 'ms' ? current.shortMs : current.shortEn}
							</span>
							<div class="signal-bars" aria-hidden="true">
								<span class="bar bar-1"></span>
								<span class="bar bar-2"></span>
								<span class="bar bar-3"></span>
							</div>
						</div>
						<p class="viewport-desc">
							{$lang === 'ms' ? current.descMs : current.descEn}
						</p>
					</div>

					<div class="viewport-tech-shelf">
						<span class="tech-shelf-label"
							>{$lang === 'ms' ? 'TINDANAN TERBUKTI:' : 'PROVEN STACK:'}</span
						>
						<div class="tech-chips">
							{#each current.stack as tech}
								<span class="tech-chip" style="border-left-color: {current.color};">{tech}</span>
							{/each}
						</div>
					</div>
				</div>
			{/each}

			<!-- Proof Metrics Row -->
			<div class="deck-metrics-strip">
				<div class="metric-block">
					<span class="metric-num">4+</span>
					<span class="metric-desc">{$t.stats.exp}</span>
				</div>
				<div class="metric-block">
					<span class="metric-num">18+</span>
					<span class="metric-desc">{$t.stats.projects}</span>
				</div>
				<div class="metric-block">
					<span class="metric-num">18+</span>
					<span class="metric-desc">{$t.stats.tech}</span>
				</div>
				<div class="metric-block metric-block-utm">
					<span class="metric-num metric-utm-badge">UTM</span>
					<span class="metric-desc">{$t.stats.degree}</span>
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
		padding: 7rem 5vw 4rem;
		overflow: hidden;
		background: radial-gradient(circle at 50% 20%, rgba(12, 21, 38, 0.7) 0%, var(--bg-void) 70%);
	}

	.hero-container {
		position: relative;
		z-index: 2;
		max-width: 1360px;
		width: 100%;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1.05fr 0.95fr;
		gap: 3.5rem;
		align-items: center;
	}

	/* Left Column */
	.hero-left {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		min-width: 0;
	}

	.telemetry-banner {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.35rem 0.85rem;
		background: rgba(12, 22, 41, 0.85);
		border: 1px solid rgba(56, 189, 248, 0.28);
		border-radius: 999px;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		margin-bottom: 1.25rem;
		backdrop-filter: blur(12px);
		box-shadow: 0 0 20px rgba(56, 189, 248, 0.08);
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
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--text-secondary);
		margin-bottom: 0.4rem;
	}

	.hero-title {
		display: flex;
		flex-direction: column;
		font-family: var(--font-heading);
		font-size: clamp(2.6rem, 4.5vw, 4.25rem);
		font-weight: 700;
		line-height: 1.05;
		letter-spacing: -0.03em;
		margin-bottom: 1.15rem;
	}
	.title-primary {
		color: var(--white);
	}
	.title-secondary {
		background: linear-gradient(135deg, #a5f3fc 0%, #b5a1ff 60%, #efd18c 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.role-terminal {
		display: inline-flex;
		align-items: center;
		gap: 0.65rem;
		padding: 0.5rem 0.95rem;
		background: rgba(7, 13, 25, 0.9);
		border-left: 3px solid var(--cyan);
		border-radius: 0 8px 8px 0;
		font-family: var(--font-mono);
		font-size: clamp(0.85rem, 1.25vw, 0.98rem);
		margin-bottom: 1.25rem;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}
	.terminal-prefix {
		color: var(--cyan);
		font-weight: 700;
	}
	.role-text {
		color: var(--text-primary);
		font-weight: 600;
	}

	.hero-bio {
		font-size: clamp(0.95rem, 1.15vw, 1.05rem);
		line-height: 1.7;
		color: var(--text-secondary);
		max-width: 580px;
		margin-bottom: 1.75rem;
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
		gap: 0.85rem;
		margin-bottom: 1.4rem;
	}
	.hero-btn-main,
	.hero-btn-pres {
		padding: 0.8rem 1.45rem;
		font-size: 0.88rem;
		min-height: 44px;
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		border-radius: 8px;
		font-family: var(--font-mono);
		font-weight: 600;
		letter-spacing: 0.02em;
		cursor: pointer;
		transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);
	}
	.hero-btn-main {
		background: var(--cyan);
		color: #030712;
		border: 1px solid var(--cyan);
		box-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
	}
	.hero-btn-main:hover {
		background: #67e8f9;
		transform: translateY(-2px);
		box-shadow: 0 0 30px rgba(56, 189, 248, 0.5);
	}
	.hero-btn-pres {
		background: rgba(12, 21, 38, 0.7);
		color: var(--white);
		border: 1px solid rgba(148, 163, 184, 0.25);
		backdrop-filter: blur(10px);
	}
	.hero-btn-pres:hover {
		border-color: var(--cyan);
		color: var(--cyan);
		transform: translateY(-2px);
		box-shadow: 0 0 20px rgba(56, 189, 248, 0.15);
	}

	.hero-utility-bar {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.75rem;
		padding-top: 0.9rem;
		border-top: 1px solid rgba(148, 163, 184, 0.12);
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
		padding: 0.35rem 0;
		min-height: 44px;
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
		font-weight: bold;
	}

	/* RIGHT COLUMN: ARCHITECTURE DECK */
	.arch-deck {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		background: rgba(7, 13, 25, 0.75);
		border: 1px solid rgba(148, 163, 184, 0.15);
		border-radius: 16px;
		padding: 1.35rem;
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		box-shadow:
			0 20px 50px rgba(0, 0, 0, 0.6),
			inset 0 1px 0 rgba(255, 255, 255, 0.08);
		min-width: 0;
	}

	.deck-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid rgba(148, 163, 184, 0.12);
		font-family: var(--font-mono);
		font-size: 0.72rem;
	}
	.deck-header-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.pulse-beacon {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--cyan);
		box-shadow: 0 0 10px var(--cyan);
	}
	.deck-code {
		color: var(--text-primary);
		font-weight: 600;
		letter-spacing: 0.06em;
	}
	.deck-node-count {
		color: var(--cyan);
		font-weight: 700;
	}

	/* 4-Node Synaptic Grid */
	.synaptic-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}
	.synaptic-card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.35rem;
		padding: 0.85rem;
		background: rgba(12, 21, 38, 0.6);
		border: 1px solid rgba(148, 163, 184, 0.12);
		border-radius: 10px;
		cursor: pointer;
		text-align: left;
		position: relative;
		min-height: 75px;
		transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
	}
	.synaptic-card:hover {
		background: rgba(17, 30, 54, 0.8);
		border-color: var(--node-accent);
		transform: translateY(-2px);
	}
	.synaptic-card.active {
		background: rgba(15, 28, 48, 0.95);
		border-color: var(--node-accent);
		box-shadow:
			0 0 20px color-mix(in srgb, var(--node-accent) 25%, transparent),
			inset 0 1px 0 rgba(255, 255, 255, 0.12);
	}
	.card-head {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.node-badge {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		font-weight: 700;
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
		letter-spacing: 0.04em;
	}
	.node-live-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
	}
	.card-title {
		font-family: var(--font-heading);
		font-size: 0.82rem;
		font-weight: 700;
		color: var(--text-primary);
		line-height: 1.25;
	}

	/* Telemetry Viewport */
	.telemetry-viewport {
		background: rgba(3, 7, 18, 0.85);
		border: 1px solid rgba(148, 163, 184, 0.16);
		border-left: 3px solid var(--active-accent);
		border-radius: 10px;
		padding: 1rem 1.15rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}
	.viewport-title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.active-pill {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 700;
		padding: 0.2rem 0.55rem;
		border-radius: 4px;
	}
	.signal-bars {
		display: flex;
		align-items: flex-end;
		gap: 3px;
		height: 12px;
	}
	.bar {
		width: 3px;
		background: var(--active-accent);
		border-radius: 1px;
	}
	.bar-1 {
		height: 6px;
		animation: signal 1.2s infinite ease-in-out;
	}
	.bar-2 {
		height: 12px;
		animation: signal 0.9s infinite ease-in-out 0.2s;
	}
	.bar-3 {
		height: 8px;
		animation: signal 1.4s infinite ease-in-out 0.4s;
	}

	@keyframes signal {
		0%,
		100% {
			opacity: 0.4;
		}
		50% {
			opacity: 1;
		}
	}

	.viewport-desc {
		font-size: 0.84rem;
		line-height: 1.6;
		color: var(--text-secondary);
		margin-top: 0.4rem;
	}

	.viewport-tech-shelf {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding-top: 0.6rem;
		border-top: 1px solid rgba(148, 163, 184, 0.1);
	}
	.tech-shelf-label {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		color: var(--text-muted);
		letter-spacing: 0.08em;
	}
	.tech-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.tech-chip {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		background: rgba(12, 21, 38, 0.8);
		border: 1px solid rgba(148, 163, 184, 0.15);
		border-left-width: 2px;
		color: var(--text-primary);
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
	}

	/* Proof Metrics Row */
	.deck-metrics-strip {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
		padding-top: 0.75rem;
		border-top: 1px solid rgba(148, 163, 184, 0.12);
	}
	.metric-block {
		background: rgba(12, 21, 38, 0.5);
		border: 1px solid rgba(148, 163, 184, 0.1);
		border-radius: 8px;
		padding: 0.55rem 0.4rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.metric-num {
		font-family: var(--font-heading);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--cyan);
		line-height: 1.1;
	}
	.metric-utm-badge {
		color: var(--emerald);
	}
	.metric-desc {
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
			padding-top: 6.5rem;
		}
	}

	@media (max-width: 600px) {
		.hero-title {
			font-size: clamp(2.1rem, 8.5vw, 2.9rem);
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
		.synaptic-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 0.5rem;
		}
		.synaptic-card {
			padding: 0.65rem 0.75rem;
			min-height: 64px;
		}
		.card-title {
			font-size: 0.76rem;
		}
		.deck-metrics-strip {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
