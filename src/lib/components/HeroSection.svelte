<script lang="ts">
	import { lang } from '$lib/i18n';
	import { playBlip } from '$lib/sound';
	import SculptureCanvas from './SculptureCanvas.svelte';

	function handleAction() {
		playBlip(880, 0.03);
	}
</script>

<section id="hero" class="hero-section" aria-label="Introduction">
	<div class="container hero-container">
		<!-- Left: Editorial Text Content -->
		<div class="hero-content">
			<!-- Role Eyebrow Badge -->
			<div class="hero-badge">
				<span class="badge-dot"></span>
				<span class="badge-text">
					{$lang === 'ms'
						? 'Jurutera Perisian Full-Stack & Arkitek Sistem'
						: 'Full-Stack Software Engineer & Solutions Architect'}
				</span>
			</div>

			<!-- Main Headline -->
			<h1 class="hero-title">
				{$lang === 'ms' ? 'Hai, saya' : "Hi, I'm"}
				<span class="highlight-name">Munir</span>.
			</h1>

			<!-- Sub-headline -->
			<p class="hero-description">
				{$lang === 'ms'
					? 'Membangunkan platform perusahaan berdaya tahan tinggi, seni bina awan berskala, dan pengalaman digital sentuhan moden berasaskan ketelitian reka bentuk.'
					: 'Crafting resilient enterprise platforms, scalable cloud architectures, and tactile digital experiences engineered with meticulous craft.'}
			</p>

			<!-- Trust & Pedigree Badges -->
			<div class="pedigree-row">
				<div class="pedigree-item">
					<span class="pedigree-icon">🏛️</span>
					<span>{$lang === 'ms' ? 'Sistem Sektor Awam YHCM' : 'YHCM Enterprise Systems'}</span>
				</div>
				<div class="pedigree-item">
					<span class="pedigree-icon">🎓</span>
					<span>{$lang === 'ms' ? 'B.Sc. Sains Komputer UTM' : 'B.Sc. Computer Science UTM'}</span>
				</div>
				<div class="pedigree-item">
					<span class="pedigree-icon">🛡️</span>
					<span>{$lang === 'ms' ? 'Keselamatan Rangkaian Cisco' : 'Cisco Network Security'}</span>
				</div>
			</div>

			<!-- Call-to-Action Buttons -->
			<div class="hero-cta-group">
				<a href="#projects" class="btn btn-primary" onclick={handleAction}>
					<span>{$lang === 'ms' ? 'Lihat Hasil Kerja' : 'Explore Selected Work'}</span>
					<svg class="btn-arrow" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<path fill-rule="evenodd" d="M10 3a.75.75 0 01.75.75v10.69l3.72-3.72a.75.75 0 111.06 1.06l-5 5a.75.75 0 01-1.06 0l-5-5a.75.75 0 111.06-1.06l3.72 3.72V3.75A.75.75 0 0110 3z" clip-rule="evenodd" />
					</svg>
				</a>

				<a href="#contact" class="btn btn-secondary" onclick={handleAction}>
					<span>{$lang === 'ms' ? 'Mari Berbincang' : "Let's Connect"}</span>
				</a>

				<a
					href="/resume.pdf"
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-ghost"
					onclick={handleAction}
					title="Download ATS-Friendly Resume"
				>
					<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
						<polyline points="7 10 12 15 17 10" />
						<line x1="12" y1="15" x2="12" y2="3" />
					</svg>
					<span>CV</span>
				</a>
			</div>
		</div>

		<!-- Right: Tactile 3D Kinetic Sculpture -->
		<div class="hero-sculpture">
			<SculptureCanvas />
		</div>
	</div>

	<!-- Quick Stats Metrics Strip -->
	<div class="container hero-stats-container">
		<div class="hero-stats">
			<div class="stat-card">
				<span class="stat-val">4+</span>
				<span class="stat-lbl">{$lang === 'ms' ? 'Tahun Kejuruteraan' : 'Years Engineering'}</span>
			</div>
			<div class="stat-card">
				<span class="stat-val">18+</span>
				<span class="stat-lbl">{$lang === 'ms' ? 'Sistem Dihantar' : 'Systems Deployed'}</span>
			</div>
			<div class="stat-card">
				<span class="stat-val">UTM</span>
				<span class="stat-lbl">{$lang === 'ms' ? 'Keselamatan Rangkaian' : 'Networks & Security'}</span>
			</div>
			<div class="stat-card">
				<span class="stat-val">100%</span>
				<span class="stat-lbl">{$lang === 'ms' ? 'Sentuhan Kod Bersih' : 'Clean Codecraft'}</span>
			</div>
		</div>
	</div>
</section>

<style>
	.hero-section {
		min-height: 100svh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding-top: clamp(6.5rem, 11vw, 8.5rem);
		padding-bottom: clamp(3rem, 5vw, 4.5rem);
		position: relative;
		overflow: hidden;
	}

	.hero-container {
		display: grid;
		grid-template-columns: 1.15fr 0.85fr;
		align-items: center;
		gap: clamp(2rem, 5vw, 4.5rem);
		flex: 1;
	}

	.hero-content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		z-index: 10;
	}

	/* Badge */
	.hero-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.4rem 0.95rem;
		border-radius: 9999px;
		background: var(--badge-bg);
		border: 1px solid var(--badge-border);
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--badge-ink);
		letter-spacing: 0.02em;
		margin-bottom: 1.6rem;
	}

	.badge-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--accent);
		box-shadow: 0 0 8px var(--accent);
	}

	/* Title */
	.hero-title {
		font-size: clamp(3rem, 6.2vw, 5.2rem);
		line-height: 1.05;
		margin-bottom: 1.4rem;
		letter-spacing: -0.04em;
	}

	.highlight-name {
		color: var(--accent);
		position: relative;
		display: inline-block;
	}

	/* Description */
	.hero-description {
		font-size: clamp(1.08rem, 1.45vw, 1.25rem);
		color: var(--ink-secondary);
		line-height: 1.65;
		max-width: 54ch;
		margin-bottom: 2rem;
	}

	/* Pedigree Row */
	.pedigree-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
		margin-bottom: 2.2rem;
	}

	.pedigree-item {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.35rem 0.75rem;
		border-radius: 8px;
		background: var(--surface);
		border: 1px solid var(--surface-border);
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--ink-secondary);
	}

	.pedigree-icon {
		font-size: 0.9rem;
	}

	/* CTAs */
	.hero-cta-group {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.85rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		min-height: 48px;
		padding: 0.8rem 1.6rem;
		border-radius: 9999px;
		font-size: 0.94rem;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.btn-primary {
		background: var(--ink);
		color: var(--bg);
		box-shadow: var(--shadow-md);
	}

	.btn-primary:hover {
		background: var(--accent);
		color: #ffffff;
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.btn-arrow {
		width: 17px;
		height: 17px;
		transition: transform 0.25s ease;
	}

	.btn-primary:hover .btn-arrow {
		transform: translateY(3px);
	}

	.btn-secondary {
		background: var(--surface);
		color: var(--ink);
		border: 1px solid var(--surface-border);
	}

	.btn-secondary:hover {
		background: var(--surface-hover);
		border-color: var(--surface-border-hover);
		transform: translateY(-2px);
	}

	.btn-ghost {
		background: transparent;
		color: var(--ink-secondary);
		border: 1px solid var(--surface-border);
		padding-inline: 1.1rem;
	}

	.btn-ghost:hover {
		color: var(--ink);
		border-color: var(--surface-border-hover);
		background: var(--surface-border);
	}

	.btn-icon {
		width: 16px;
		height: 16px;
	}

	/* 3D Sculpture */
	.hero-sculpture {
		width: 100%;
		height: 100%;
		min-height: 480px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Stats Strip */
	.hero-stats-container {
		margin-top: clamp(2.5rem, 5vw, 4rem);
	}

	.hero-stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1.25rem;
		padding: 1.5rem 2rem;
		border-radius: 1.25rem;
		background: var(--surface);
		border: 1px solid var(--surface-border);
		box-shadow: var(--shadow-sm);
	}

	.stat-card {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.stat-val {
		font-family: var(--font-heading);
		font-size: clamp(1.8rem, 2.5vw, 2.4rem);
		font-weight: 800;
		color: var(--ink);
		line-height: 1;
	}

	.stat-lbl {
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--ink-muted);
		letter-spacing: 0.02em;
	}

	/* Responsive */
	@media (max-width: 992px) {
		.hero-container {
			grid-template-columns: 1fr;
			text-align: center;
		}

		.hero-content {
			align-items: center;
		}

		.hero-description {
			margin-inline: auto;
		}

		.pedigree-row {
			justify-content: center;
		}

		.hero-cta-group {
			justify-content: center;
		}

		.hero-sculpture {
			min-height: 380px;
			max-height: 420px;
		}

		.hero-stats {
			grid-template-columns: repeat(2, 1fr);
			gap: 1.5rem;
		}
	}

	@media (max-width: 540px) {
		.hero-stats {
			grid-template-columns: 1fr;
			padding: 1.25rem 1.5rem;
		}

		.btn {
			width: 100%;
		}

		.hero-cta-group {
			width: 100%;
		}
	}
</style>
