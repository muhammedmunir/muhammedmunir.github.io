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

<section id="experience" aria-labelledby="experience-title">
	<div class="section">
		<header class="section-header">
			<p class="section-label">{$t.label}</p>
			<h2 id="experience-title">{$t.title}</h2>
			<p class="section-desc">{$t.desc}</p>
		</header>
		<ol class="career-list">
			{#each expMeta as exp, index}
				<li class="career-entry">
					<div class="career-meta">
						<span class="entry-number">0{index + 1}</span>
						<p>{$lang === 'ms' ? exp.periodMs : exp.periodEn}</p>
						<p>{exp.current ? $t.active : $lang === 'ms' ? exp.typeMs : exp.typeEn}</p>
					</div>
					<article>
						<p class="company">{exp.company}</p>
						<h3>{$texp[exp.key].role}</h3>
						<p class="location">{exp.location}</p>
						<p class="description">{$texp[exp.key].desc}</p>
						<ul class="contributions">
							{#each $texp[exp.key].highlights as highlight}<li>{highlight}</li>{/each}
						</ul>
						<ul class="tags" aria-label={$lang === 'ms' ? 'Teknologi' : 'Technologies'}>
							{#each exp.tags as tag}<li class="tag">{tag}</li>{/each}
						</ul>
					</article>
				</li>
			{/each}
		</ol>
	</div>
</section>

<style>
	.career-list {
		padding: 0;
		list-style: none;
		border-top: 1px solid #897b6b;
	}
	.career-entry {
		display: grid;
		grid-template-columns: 240px minmax(0, 1fr);
		gap: 3rem;
		padding: 2.5rem 0;
		border-bottom: 1px solid #c8bfb2;
	}
	.career-meta {
		color: #645a4f;
		font-size: 0.8rem;
	}
	.entry-number {
		display: block;
		font:
			2rem Georgia,
			serif;
		color: #75442b;
		margin-bottom: 1rem;
	}
	.company {
		color: #75442b;
		font-size: 0.85rem;
		margin-bottom: 0.65rem;
	}
	.location {
		color: #645a4f;
		font-size: 0.75rem;
		margin-top: 0.75rem;
	}
	.description {
		margin-top: 1.5rem;
		max-width: 80ch;
		font-size: 0.9rem;
	}
	.contributions {
		padding-left: 1rem;
		margin: 1.2rem 0;
		color: #645a4f;
		font-size: 0.85rem;
	}
	.contributions li {
		margin-block: 0.5rem;
		padding-left: 0.35rem;
	}
	.contributions li::marker {
		color: #75442b;
	}
	.tags {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	@media (max-width: 720px) {
		.career-entry {
			grid-template-columns: 1fr;
			gap: 1.25rem;
			padding-block: 2rem;
		}
		.career-meta {
			display: flex;
			align-items: baseline;
			gap: 0.5rem 1rem;
			flex-wrap: wrap;
		}
		.entry-number {
			margin: 0;
			font-size: 1.5rem;
		}
	}
</style>
