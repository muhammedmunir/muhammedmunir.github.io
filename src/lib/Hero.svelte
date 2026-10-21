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
			stack: ['Laravel 12', 'Vue.js 3', 'SvelteKit 5', 'TypeScript', 'PostgreSQL/MySQL'],
			descMs:
				'Seni bina sistem kerajaan & korporat berskala tinggi dengan pengesahan 2FA, storan awan S3, dan integrasi perkhidmatan.',
			descEn:
				'High-scale government & corporate system architecture with 2FA security, S3 cloud storage, and service integration.'
		},
		{
			id: 'AI-02',
			titleMs: 'Visi Komputer & Automasi Pintar',
			titleEn: 'Computer Vision & Intelligent Automation',
			shortMs: 'Visi & AI',
			shortEn: 'Vision & AI',
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
			shortMs: 'Infrastruktur',
			shortEn: 'Infrastructure',
			color: '#67e8f9',
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
			shortMs: 'Keselamatan',
			shortEn: 'Security',
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
</script>

<section id="hero" class="hero-section">
	<div class="hero-ambient" aria-hidden="true">
		<div class="glow-orb orb-cyan"></div>
		<div class="glow-orb orb-indigo"></div>
	</div>

	<div class="hero-container">
		<!-- LEFT COLUMN: EXECUTIVE IDENTITY & COMMAND ACTIONS -->
		<div class="hero-left">
			<div class="hero-reveal telemetry-banner">
				<span class="status-beacon" aria-hidden="true"></span>
				<span class="telemetry-code">MUNIR / MY</span>
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

			<div class="hero-reveal role-terminal">
				<span class="role-typed">{$lang === 'ms' ? rolesMs[0] : rolesEn[0]}</span>
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

		<!-- Native buttons follow the four primary somas of the connectome. -->
		<div class="arch-deck">
			<div class="deck-header">
				<h2 id="connectome-title">
					{$lang === 'ms' ? 'Rangkaian kepakaran' : 'A connected practice'}
				</h2>
				<span class="deck-title">NEURAL / 01—04</span>
			</div>
			<p class="connectome-hint">
				{$lang === 'ms'
					? 'Pilih nod untuk meneroka kepakaran.'
					: 'Select a node to explore the practice.'}
			</p>
			<div class="connectome" role="group" aria-labelledby="connectome-title">
				<NeuralCortexCanvas active={activeNode} />
				<svg
					class="connectome-paths"
					viewBox="0 0 1000 700"
					preserveAspectRatio="none"
					aria-hidden="true"
				>
					{#each ['M245 170 Q347 250 500 345', 'M745 185 Q647 440 500 345', 'M260 525 Q356 250 500 345', 'M740 520 Q644 440 500 345'] as path, idx}
						<path
							d={path}
							class:selected={activeNode === idx}
							style="--path-color: {archNodes[idx].color}"
						/>
					{/each}
				</svg>
				<span class="connectome-center" aria-hidden="true">MUNIR</span>
				{#each archNodes as node, idx}
					<button
						type="button"
						class="neural-node"
						class:active={activeNode === idx}
						style="--node-color: {node.color}; --x: {[24.5, 74.5, 26, 74][idx]}%; --y: {[
							24.3, 26.4, 75, 74.3
						][idx]}%"
						aria-pressed={activeNode === idx}
						aria-controls="neural-detail"
						aria-label={`0${idx + 1} ${$lang === 'ms' ? node.shortMs : node.shortEn} — ${$lang === 'ms' ? node.titleMs : node.titleEn}`}
						onclick={() => selectNode(idx)}
					>
						<span class="node-ring" aria-hidden="true"></span>
						<span class="node-label"
							><span class="node-id">0{idx + 1}</span>
							{$lang === 'ms' ? node.shortMs : node.shortEn}</span
						>
					</button>
				{/each}
			</div>

			<!-- Active Node Inspection Viewport -->
			{#each [archNodes[activeNode]] as current}
				<div
					id="neural-detail"
					class="node-viewport"
					style="--active-color: {current.color}"
					aria-live="polite"
					aria-atomic="true"
				>
					<div class="viewport-meta">
						<span class="viewport-id">NODE // {current.id}</span>
						<span class="viewport-metric">0{activeNode + 1} / 04</span>
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

			<details class="practice-roles">
				<summary>{$lang === 'ms' ? 'Bidang peranan' : 'Areas of practice'}</summary>
				<ul>
					{#each $lang === 'ms' ? rolesMs : rolesEn as role}<li>{role}</li>{/each}
				</ul>
			</details>
			<!-- Portfolio background, not live telemetry. -->
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
		background: linear-gradient(135deg, #a5f3fc 0%, #b5a1ff 65%, #efd18c 100%);
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
	.role-typed {
		color: var(--cyan);
		font-weight: 600;
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
		padding: 0.5rem 0;
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
	}

	.arch-deck {
		min-width: 0;
		width: 100%;
	}
	.connectome-hint {
		font-size: 0.85rem;
	}
	.connectome {
		position: relative;
		height: clamp(330px, 32vw, 440px);
		margin: 0 -1rem 1rem;
		isolation: isolate;
	}
	.connectome-paths {
		position: absolute;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
	.connectome-paths path {
		fill: none;
		stroke: var(--path-color);
		stroke-width: 1;
		opacity: 0.18;
	}
	.connectome-paths path.selected {
		opacity: 0.85;
		stroke-width: 2;
	}
	.connectome-center {
		position: absolute;
		top: 54%;
		left: 50%;
		transform: translateX(-50%);
		font: 0.65rem var(--font-mono);
		letter-spacing: 0.2em;
		color: #c1e8ec;
	}
	.neural-node {
		position: absolute;
		left: var(--x);
		top: var(--y);
		transform: translate(-50%, -21px);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		background: transparent;
		border: 0;
		color: var(--text-primary);
		cursor: pointer;
		min-width: 100px;
		padding: 0 4px 6px;
		border-radius: 8px;
	}
	.node-ring {
		width: 42px;
		height: 42px;
		border: 1px solid var(--node-color);
		border-radius: 50%;
		background: transparent;
		box-shadow: 0 0 18px color-mix(in srgb, var(--node-color) 15%, transparent);
	}
	.neural-node.active .node-ring {
		border-width: 2px;
		outline: 1px solid color-mix(in srgb, var(--node-color) 30%, transparent);
		outline-offset: 5px;
		box-shadow: 0 0 28px color-mix(in srgb, var(--node-color) 30%, transparent);
	}
	.node-label {
		font-size: 0.78rem;
		font-weight: 600;
		padding: 4px 7px;
		border-radius: 4px;
		background: #080f1e;
		border-bottom: 1px solid transparent;
	}
	.neural-node.active .node-label,
	.neural-node:hover .node-label {
		border-bottom-color: var(--node-color);
	}
	.node-id {
		color: var(--node-color);
		font: 0.65rem var(--font-mono);
	}
	.practice-roles {
		color: var(--text-secondary);
		font-size: 0.82rem;
		margin: 1rem 0;
	}
	.practice-roles summary {
		cursor: pointer;
		min-height: 44px;
		display: list-item;
		padding: 0.6rem 0;
		color: var(--text-primary);
	}
	.practice-roles ul {
		padding-left: 1.2rem;
	}
	.deck-header h2 {
		font-size: clamp(1.1rem, 2vw, 1.4rem);
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
	.deck-title {
		color: var(--text-secondary);
		letter-spacing: 0.08em;
	}

	.node-viewport {
		min-height: 230px;
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
		.deck-title {
			font-size: 0.6rem;
		}
		.hero-title {
			font-size: clamp(2.15rem, 9vw, 3.2rem);
		}
		.hero-greeting {
			font-size: 0.7rem;
			letter-spacing: 0.07em;
		}
		.node-viewport {
			min-height: 270px;
		}
		.connectome {
			margin-inline: -0.5rem;
		}
		.node-label {
			font-size: 0.7rem;
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
