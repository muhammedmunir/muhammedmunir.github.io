<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { lang } from '$lib/i18n';
	import { translations } from '$lib/translations';
	import { derived } from 'svelte/store';
	import { playBlip } from '$lib/sound';

	const t = derived(lang, ($l) => translations[$l].experience);
	const texp = derived(lang, ($l) => translations[$l].exp);

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		gsap.fromTo(
			'.exp-header',
			{ opacity: 0, y: 24 },
			{
				opacity: 1,
				y: 0,
				duration: 0.7,
				ease: 'power3.out',
				scrollTrigger: { trigger: '.exp-header', start: 'top 88%' }
			}
		);

		gsap.utils.toArray<HTMLElement>('.timeline-row').forEach((row, i) => {
			gsap.fromTo(
				row,
				{ opacity: 0, y: 35 },
				{
					opacity: 1,
					y: 0,
					duration: 0.7,
					delay: (i % 2) * 0.1,
					ease: 'power3.out',
					scrollTrigger: { trigger: row, start: 'top 86%', toggleActions: 'play none none none' }
				}
			);
		});
	});

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
			accentColor: '#10b981',
			badgeTheme: 'badge-emerald',
			icon: '🏢',
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
			accentColor: '#38bdf8',
			badgeTheme: 'badge-cyan',
			icon: '💻',
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
			accentColor: '#f59e0b',
			badgeTheme: 'badge-amber',
			icon: '⚡',
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
			accentColor: '#818cf8',
			badgeTheme: 'badge-indigo',
			icon: '🛡️',
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
	<div class="exp-ambient" aria-hidden="true"></div>

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

			{#each expMeta as exp, i}
				<div class="timeline-row" class:row-reverse={i % 2 !== 0}>
					<!-- Center Radar Node -->
					<div
						class="timeline-beacon"
						class:beacon-active={exp.current}
						style="--beacon-color: {exp.accentColor}"
						aria-hidden="true"
					>
						<span class="beacon-icon">{exp.icon}</span>
						{#if exp.current}
							<span class="beacon-pulse"></span>
						{/if}
					</div>

					<!-- Content Card -->
					<div class="exp-card card" style="--card-accent: {exp.accentColor}">
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
							<span class="highlights-title">MISSION_HIGHLIGHTS &gt;</span>
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
		position: relative;
		background: linear-gradient(180deg, #030712 0%, #070e1c 50%, #030712 100%);
		overflow: hidden;
	}

	.exp-ambient {
		position: absolute;
		top: 30%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 700px;
		height: 700px;
		background: radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, transparent 70%);
		pointer-events: none;
	}

	.timeline-container {
		position: relative;
		padding: 2.5rem 0;
		max-width: 1100px;
		margin: 0 auto;
	}

	.timeline-axis {
		position: absolute;
		left: 50%;
		top: 0;
		bottom: 0;
		width: 2px;
		background: linear-gradient(
			180deg,
			transparent,
			rgba(56, 189, 248, 0.28) 15%,
			rgba(129, 140, 248, 0.28) 85%,
			transparent
		);
		transform: translateX(-50%);
	}

	.timeline-row {
		display: flex;
		justify-content: flex-end;
		padding-right: calc(50% + 2.75rem);
		margin-bottom: 3.5rem;
		position: relative;
	}
	.timeline-row.row-reverse {
		justify-content: flex-start;
		padding-right: 0;
		padding-left: calc(50% + 2.75rem);
	}

	/* Central Radar Beacon */
	.timeline-beacon {
		position: absolute;
		left: 50%;
		top: 1.5rem;
		transform: translateX(-50%);
		width: 46px;
		height: 46px;
		background: #070d19;
		border: 2px solid var(--beacon-color);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2;
		box-shadow: 0 0 20px rgba(0, 0, 0, 0.6);
		transition:
			transform 0.25s ease,
			box-shadow 0.25s ease;
	}
	.timeline-beacon:hover {
		transform: translateX(-50%) scale(1.08);
		box-shadow: 0 0 24px var(--beacon-color);
	}
	.beacon-icon {
		font-size: 1.25rem;
		line-height: 1;
	}
	.beacon-pulse {
		position: absolute;
		inset: -6px;
		border-radius: 16px;
		border: 1px solid var(--beacon-color);
		animation: pulse-ring 2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
		pointer-events: none;
	}
	@keyframes pulse-ring {
		0% {
			transform: scale(0.95);
			opacity: 0.8;
		}
		100% {
			transform: scale(1.35);
			opacity: 0;
		}
	}

	/* Experience Card */
	.exp-card {
		padding: 1.85rem;
		width: 100%;
		max-width: 500px;
		background: rgba(10, 18, 34, 0.78);
		border: 1px solid rgba(148, 163, 184, 0.14);
		border-left: 3px solid var(--card-accent);
		border-radius: 14px;
	}
	.exp-card:hover {
		border-color: rgba(56, 189, 248, 0.38);
		background: rgba(14, 25, 48, 0.88);
		transform: translateY(-4px);
		box-shadow:
			0 20px 45px -10px rgba(0, 0, 0, 0.7),
			0 0 25px rgba(56, 189, 248, 0.1);
	}

	.exp-card-top {
		margin-bottom: 1.15rem;
	}
	.exp-badge-strip {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.75rem;
		flex-wrap: wrap;
	}
	.exp-code {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		font-weight: 700;
		color: var(--cyan);
		background: rgba(56, 189, 248, 0.08);
		border: 1px solid rgba(56, 189, 248, 0.22);
		padding: 0.15rem 0.45rem;
		border-radius: 4px;
	}
	.status-badge {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 0.2rem 0.65rem;
		border-radius: 999px;
	}
	.badge-emerald {
		background: rgba(16, 185, 129, 0.14);
		color: #34d399;
		border: 1px solid rgba(16, 185, 129, 0.35);
	}
	.badge-cyan {
		background: rgba(56, 189, 248, 0.14);
		color: #38bdf8;
		border: 1px solid rgba(56, 189, 248, 0.35);
	}
	.badge-amber {
		background: rgba(245, 158, 11, 0.14);
		color: #fbbf24;
		border: 1px solid rgba(245, 158, 11, 0.35);
	}
	.badge-indigo {
		background: rgba(129, 140, 248, 0.14);
		color: #a5b4fc;
		border: 1px solid rgba(129, 140, 248, 0.35);
	}

	.exp-period {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--text-muted);
	}

	.exp-role {
		font-family: var(--font-heading);
		font-size: 1.15rem;
		font-weight: 700;
		color: var(--white);
		margin-bottom: 0.35rem;
		line-height: 1.3;
	}
	.exp-entity {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.85rem;
		flex-wrap: wrap;
	}
	.entity-name {
		color: var(--cyan);
		font-weight: 600;
	}
	.entity-sep {
		color: var(--text-muted);
		font-size: 0.75rem;
	}
	.entity-loc {
		color: var(--text-secondary);
		font-size: 0.8rem;
	}

	.exp-desc {
		font-size: 0.875rem;
		line-height: 1.65;
		color: var(--text-secondary);
		margin-bottom: 1.15rem;
	}

	.exp-highlights-box {
		background: rgba(3, 7, 18, 0.55);
		border: 1px solid rgba(148, 163, 184, 0.1);
		border-radius: 8px;
		padding: 0.9rem 1rem;
		margin-bottom: 1.15rem;
	}
	.highlights-title {
		display: block;
		font-family: var(--font-mono);
		font-size: 0.66rem;
		color: var(--text-muted);
		letter-spacing: 0.08em;
		margin-bottom: 0.6rem;
	}
	.highlights-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}
	.highlights-list li {
		display: flex;
		align-items: flex-start;
		gap: 0.55rem;
		font-size: 0.82rem;
		color: var(--text-primary);
		line-height: 1.5;
	}
	.highlights-list svg {
		color: var(--cyan);
		flex-shrink: 0;
		margin-top: 2px;
	}

	.exp-tags-shelf {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	@media (max-width: 900px) {
		.timeline-axis {
			left: 1.5rem;
		}
		.timeline-row,
		.timeline-row.row-reverse {
			padding-right: 0;
			padding-left: 4rem;
			justify-content: flex-start;
		}
		.timeline-beacon {
			left: 1.5rem;
			top: 1.5rem;
			width: 40px;
			height: 40px;
		}
		.exp-card {
			max-width: 100%;
		}
	}
</style>
