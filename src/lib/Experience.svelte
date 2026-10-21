<script lang="ts">
	import { lang } from '$lib/i18n';
	import { translations } from '$lib/translations';
	import { derived } from 'svelte/store';

	const t = derived(lang, ($l) => translations[$l].experience);
	const texp = derived(lang, ($l) => translations[$l].exp);

	const expMeta = [
		{
			key: 'yhcm' as const,
			code: 'EXP-01',
			company: 'YHCM Sdn Bhd',
			location: 'Shah Alam, Selangor',
			periodMs: 'Apr 2026 – Kini',
			periodEn: 'Apr 2026 – Present',
			typeMs: 'Sepenuh Masa',
			typeEn: 'Full-Time',
			current: true,
			badgeTheme: 'badge-emerald',
			tags: [
				'Vue.js 3',
				'Laravel Filament',
				'Docker Swarm',
				'MariaDB',
				'PostgreSQL 17',
				'Linux Swarm'
			]
		},
		{
			key: 'nova' as const,
			code: 'EXP-02',
			company: 'Nova Bitara Development Sdn Bhd',
			location: 'Sunway, Selangor',
			periodMs: 'Dis 2025 – Mac 2026',
			periodEn: 'Dec 2025 – Mar 2026',
			typeMs: 'Kontrak',
			typeEn: 'Contract',
			current: false,
			badgeTheme: 'badge-cyan',
			tags: ['SvelteKit', 'Supabase RLS', 'Laravel', 'Redis', 'Vercel', 'Cloudflare WAF']
		},
		{
			key: 'tnb_protege' as const,
			code: 'EXP-03',
			company: 'Tenaga Nasional Berhad (TNB)',
			location: 'UOA Business Park, Shah Alam',
			periodMs: 'Apr 2025 – Dis 2025',
			periodEn: 'Apr 2025 – Dec 2025',
			typeMs: 'Protégé',
			typeEn: 'Protégé',
			current: false,
			badgeTheme: 'badge-amber',
			tags: [
				'Flutter (Dart)',
				'Firebase',
				'MongoDB',
				'Microsoft Azure',
				'Jenkins CI/CD',
				'Kubernetes'
			]
		},
		{
			key: 'tnb_cyber' as const,
			code: 'EXP-04',
			company: 'Tenaga Nasional Berhad (TNB) Platinum',
			location: 'Bangsar, Kuala Lumpur',
			periodMs: 'Sept 2023 – Feb 2024',
			periodEn: 'Sept 2023 – Feb 2024',
			typeMs: 'Latihan Industri (SOC)',
			typeEn: 'Internship (SOC)',
			current: false,
			badgeTheme: 'badge-indigo',
			tags: [
				'Splunk SIEM',
				'Vulhub Labs',
				'Red Team',
				'Blue Team',
				'SOC Operations',
				'CVE Analysis'
			]
		}
	];
</script>

<section id="experience" class="exp-section">
	<div class="section">
		<!-- Section Header -->
		<div class="section-header exp-header">
			<div class="section-label">{$t.label}</div>
			<h2 class="text-gradient">{$t.title}</h2>
			<p class="section-desc">{$t.desc}</p>
			<div class="section-divider"></div>
		</div>

		<!-- Sovereign Operations Flight Timeline -->
		<div class="timeline-container">
			<div class="timeline-axis" aria-hidden="true"></div>

			{#each expMeta as exp}
				<div class="timeline-row">
					<div class="timeline-beacon" class:beacon-active={exp.current} aria-hidden="true"></div>

					<!-- Career entry -->
					<div class="exp-card">
						<div class="exp-card-top">
							<div class="exp-badge-strip">
								<span class="exp-code">{exp.code}</span>
								<span class="status-badge {exp.badgeTheme}">
									{exp.current ? $t.active : $lang === 'ms' ? exp.typeMs : exp.typeEn}
								</span>
								<span class="exp-period">
									<svg
										width="13"
										height="13"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										aria-hidden="true"
									>
										<circle cx="12" cy="12" r="10"></circle>
										<polyline points="12 6 12 12 16 14"></polyline>
									</svg>
									{$lang === 'ms' ? exp.periodMs : exp.periodEn}
								</span>
							</div>

							<h3 class="exp-role">{$texp[exp.key].role}</h3>

							<div class="exp-entity">
								<span class="entity-name">{exp.company}</span>
								<span class="entity-sep">/</span>
								<span class="entity-loc">{exp.location}</span>
							</div>
						</div>

						<p class="exp-desc">{$texp[exp.key].desc}</p>

						<!-- Highlights Checklist -->
						<div class="exp-highlights-box">
							<span class="highlights-title"
								>{$lang === 'ms' ? 'Sumbangan utama' : 'Key contributions'}</span
							>
							<ul class="highlights-list" role="list">
								{#each $texp[exp.key].highlights as h}
									<li>
										<svg
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2.5"
											aria-hidden="true"
										>
											<polyline points="20 6 9 17 4 12" />
										</svg>
										<span>{h}</span>
									</li>
								{/each}
							</ul>
						</div>

						<!-- Tech Stack Tags -->
						<div class="exp-tags-shelf">
							{#each exp.tags as tag}
								<span class="tag">{tag}</span>
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.exp-section {
		background: transparent;
		position: relative;
	}
	.section-header {
		text-align: center;
		max-width: 760px;
		margin: 0 auto 3.5rem;
	}
	.section-label {
		color: var(--cyan);
	}
	.section-divider {
		margin: 1.25rem auto 0;
		background: linear-gradient(90deg, transparent, var(--cyan), var(--indigo), transparent);
		height: 2px;
		width: 80px;
	}
	.timeline-container {
		position: relative;
		max-width: 1000px;
		margin: 0 auto;
		padding-left: 2.8rem;
	}
	.timeline-axis {
		position: absolute;
		left: 10px;
		top: 1rem;
		bottom: 2rem;
		width: 2px;
		background: linear-gradient(180deg, var(--cyan) 0%, var(--indigo) 60%, transparent 100%);
		box-shadow: 0 0 12px rgba(56, 189, 248, 0.35);
	}
	.timeline-row {
		position: relative;
		padding-bottom: 2.5rem;
	}
	.timeline-beacon {
		position: absolute;
		left: calc(-2.8rem + 4px);
		top: 1.2rem;
		width: 14px;
		height: 14px;
		border: 2px solid var(--cyan);
		border-radius: 50%;
		background: var(--bg-void);
		box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
		transition: all 0.3s ease;
		z-index: 2;
	}
	.timeline-beacon.beacon-active {
		background: var(--cyan);
		box-shadow:
			0 0 18px var(--cyan),
			0 0 30px rgba(56, 189, 248, 0.6);
		transform: scale(1.15);
	}
	.timeline-row:hover .timeline-beacon {
		border-color: #ffffff;
		box-shadow: 0 0 20px var(--cyan);
	}

	.exp-card {
		background: rgba(12, 21, 38, 0.72);
		border: 1px solid rgba(148, 163, 184, 0.16);
		border-radius: 16px;
		padding: 1.65rem 1.85rem;
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		box-shadow:
			0 12px 35px -8px rgba(0, 0, 0, 0.55),
			inset 0 1px 0 rgba(255, 255, 255, 0.08);
		transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
		position: relative;
	}
	.exp-card:hover {
		border-color: rgba(56, 189, 248, 0.4);
		transform: translateY(-3px);
		box-shadow:
			0 18px 45px -10px rgba(0, 0, 0, 0.7),
			0 0 25px rgba(56, 189, 248, 0.12),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
	}

	.exp-card-top {
		margin-bottom: 1.15rem;
	}
	.exp-badge-strip {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		flex-wrap: wrap;
		margin-bottom: 0.75rem;
	}
	.exp-code {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 700;
		color: var(--cyan);
		background: rgba(56, 189, 248, 0.1);
		border: 1px solid rgba(56, 189, 248, 0.25);
		padding: 0.15rem 0.5rem;
		border-radius: 4px;
	}
	.status-badge {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 700;
		padding: 0.15rem 0.6rem;
		border-radius: 4px;
		letter-spacing: 0.04em;
	}
	.badge-emerald {
		color: #10b981;
		background: rgba(16, 185, 129, 0.12);
		border: 1px solid rgba(16, 185, 129, 0.3);
	}
	.badge-cyan {
		color: var(--cyan);
		background: rgba(56, 189, 248, 0.12);
		border: 1px solid rgba(56, 189, 248, 0.3);
	}
	.badge-amber {
		color: var(--gold);
		background: rgba(226, 184, 87, 0.12);
		border: 1px solid rgba(226, 184, 87, 0.3);
	}
	.badge-indigo {
		color: var(--indigo);
		background: rgba(129, 140, 248, 0.12);
		border: 1px solid rgba(129, 140, 248, 0.3);
	}

	.exp-period {
		display: inline-flex;
		gap: 0.4rem;
		align-items: center;
		color: var(--text-muted);
		font-family: var(--font-mono);
		font-size: 0.74rem;
		margin-left: auto;
	}
	.exp-role {
		font-family: var(--font-heading);
		font-size: clamp(1.25rem, 2.2vw, 1.55rem);
		font-weight: 700;
		line-height: 1.25;
		color: var(--white);
		margin-bottom: 0.35rem;
	}
	.exp-entity {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.92rem;
	}
	.entity-name {
		color: var(--cyan);
		font-weight: 600;
	}
	.entity-sep {
		color: var(--text-muted);
	}
	.entity-loc {
		color: var(--text-secondary);
	}

	.exp-desc {
		font-size: 0.94rem;
		line-height: 1.65;
		color: var(--text-secondary);
		margin-bottom: 1.35rem;
	}

	.exp-highlights-box {
		background: rgba(7, 13, 25, 0.7);
		border: 1px solid rgba(148, 163, 184, 0.12);
		border-radius: 10px;
		padding: 1.15rem 1.3rem;
		margin-bottom: 1.35rem;
	}
	.highlights-title {
		display: block;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--cyan);
		margin-bottom: 0.75rem;
	}
	.highlights-list {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		list-style: none;
		padding: 0;
	}
	.highlights-list li {
		display: flex;
		align-items: flex-start;
		gap: 0.65rem;
		font-size: 0.88rem;
		line-height: 1.5;
		color: var(--text-primary);
	}
	.highlights-list svg {
		color: var(--emerald);
		flex-shrink: 0;
		margin-top: 0.2rem;
	}

	.exp-tags-shelf {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
	}

	@media (max-width: 640px) {
		.timeline-container {
			padding-left: 1.8rem;
		}
		.timeline-beacon {
			left: calc(-1.8rem + 4px);
			width: 12px;
			height: 12px;
		}
		.timeline-axis {
			left: 9px;
		}
		.exp-card {
			padding: 1.25rem 1.15rem;
		}
		.exp-period {
			margin-left: 0;
			width: 100%;
		}
	}
</style>
