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
		--cyan: #67e8f9;
		background: #050d16;
	}
	.section-header {
		text-align: left;
		max-width: 760px;
		margin-bottom: 3rem;
	}
	.section-header h2 {
		color: #edf3f7;
		background: none;
		-webkit-text-fill-color: currentColor;
	}
	.section-label {
		color: #67e8f9;
	}
	.section-divider {
		margin-left: 0;
		background: #67e8f9;
		height: 1px;
	}
	.timeline-container {
		position: relative;
		max-width: 1050px;
		margin: 0 auto;
		padding-left: 3rem;
	}
	.timeline-axis {
		position: absolute;
		left: 7px;
		top: 0.8rem;
		bottom: 2rem;
		width: 1px;
		background: linear-gradient(#67e8f9, #67e8f955 80%, transparent);
	}
	.timeline-row {
		position: relative;
		padding-bottom: 2.8rem;
	}
	.timeline-row::before {
		content: '';
		position: absolute;
		left: -2.55rem;
		top: 0.8rem;
		width: 2rem;
		height: 1rem;
		border-top: 1px solid #67e8f955;
		border-right: 1px solid #67e8f955;
		border-radius: 0 10px 0 0;
	}
	.timeline-beacon {
		position: absolute;
		left: calc(-3rem + 3px);
		top: 0.55rem;
		width: 9px;
		height: 9px;
		border: 1px solid #67e8f9;
		border-radius: 50%;
		background: #050d16;
	}
	.beacon-active {
		background: #67e8f9;
	}
	.exp-card {
		padding: 0 0 2.5rem 0.5rem;
		border-bottom: 1px solid #ffffff18;
	}
	.timeline-row:last-child .exp-card {
		border-bottom: 0;
		padding-bottom: 0;
	}
	.exp-card-top {
		margin-bottom: 1.2rem;
	}
	.exp-badge-strip {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		flex-wrap: wrap;
		margin-bottom: 0.85rem;
	}
	.exp-code,
	.status-badge,
	.exp-period,
	.highlights-title {
		font-family: var(--font-mono);
		font-size: 0.72rem;
	}
	.exp-code {
		color: #67e8f9;
	}
	.status-badge {
		color: #a5b4fc;
		padding: 0.15rem 0.55rem;
		border: 1px solid #a5b4fc40;
		border-radius: 4px;
	}
	.badge-emerald {
		color: #e4c988;
		border-color: #e4c98840;
	}
	.exp-period {
		display: inline-flex;
		gap: 0.4rem;
		align-items: center;
		color: #a6b5c6;
	}
	.exp-role {
		font-size: clamp(1.2rem, 2.2vw, 1.6rem);
		line-height: 1.3;
		color: #edf3f7;
		margin-bottom: 0.6rem;
	}
	.exp-entity {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
	}
	.entity-name {
		color: #67e8f9;
	}
	.entity-sep,
	.entity-loc {
		color: #a6b5c6;
	}
	.exp-desc {
		color: #bac6d3;
		font-size: 0.95rem;
		line-height: 1.8;
		max-width: 85ch;
		margin-bottom: 1.4rem;
	}
	.exp-highlights-box {
		padding-left: 1rem;
		border-left: 1px solid #a5b4fc55;
		margin-bottom: 1.4rem;
	}
	.highlights-title {
		display: block;
		color: #e4c988;
		margin-bottom: 0.75rem;
	}
	.highlights-list {
		list-style: none;
		display: grid;
		gap: 0.6rem;
		padding: 0;
	}
	.highlights-list li {
		display: flex;
		align-items: flex-start;
		gap: 0.6rem;
		color: #bac6d3;
		line-height: 1.65;
		font-size: 0.875rem;
	}
	.highlights-list svg {
		color: #67e8f9;
		flex-shrink: 0;
		margin-top: 0.3rem;
	}
	.exp-tags-shelf {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.tag {
		background: #101b25;
		border: 1px solid #ffffff18;
		border-radius: 4px;
		color: #c5cfda;
		box-shadow: none;
	}
	@media (max-width: 600px) {
		.timeline-container {
			padding-left: 1.8rem;
		}
		.timeline-beacon {
			left: calc(-1.8rem + 3px);
		}
		.timeline-row::before {
			left: -1.35rem;
			width: 0.8rem;
		}
		.exp-card {
			padding-left: 0;
		}
		.exp-badge-strip {
			gap: 0.5rem;
		}
	}
</style>
