<script lang="ts">
	import { lang } from '$lib/i18n';
	import { playBlip } from '$lib/sound';

	type ProjectItem = {
		id: string;
		index: string;
		title: string;
		subtitle: { ms: string; en: string };
		client: { ms: string; en: string };
		year: string;
		description: { ms: string; en: string };
		tags: string[];
		metrics: { label: { ms: string; en: string }; val: string }[];
		accent: string;
		category: { ms: string; en: string };
	};

	const projects: ProjectItem[] = [
		{
			id: 'emesys',
			index: '01',
			title: 'eMesys Enterprise',
			subtitle: {
				ms: 'Platform Pengurusan Kitaran Hayat Aset & Logistik Sektor Awam',
				en: 'Public-Sector Asset Lifecycle & Logistics Management Platform'
			},
			client: { ms: 'YHCM Sdn Bhd / Kerajaan', en: 'YHCM Sdn Bhd / Public Sector' },
			year: '2024 — Kini',
			description: {
				ms: 'Platform gred perusahaan yang mengendalikan kitaran hayat aset secara menyeluruh — daripada pendaftaran inventori, pemindahan jabatan, kelulusan pelupusan berlapis (RBAC), sehingga ke penjejakan log audit masa nyata. Dihoskan di atas kluster kontena berdaya tahan tinggi.',
				en: 'Enterprise-grade asset management platform engineered for public-sector operations. Manages end-to-end asset lifecycle from intake and inter-departmental transfers to multi-tier RBAC disposal approvals and real-time immutable audit logs.'
			},
			tags: ['Vue.js 3', 'Laravel 12', 'Docker Swarm', 'MariaDB', 'Linux Server', 'SSO & RBAC'],
			metrics: [
				{ label: { ms: 'Aset Diuruskan', en: 'Managed Assets' }, val: '4,000+' },
				{ label: { ms: 'Orkestrasi', en: 'Orchestration' }, val: 'Docker Swarm' },
				{ label: { ms: 'Keselamatan', en: 'Security' }, val: 'RBAC Strict' }
			],
			accent: '#d97e4e',
			category: { ms: 'Sistem Perusahaan', en: 'Enterprise Systems' }
		},
		{
			id: 'onboardx',
			index: '02',
			title: 'OnboardX Ecosystem',
			subtitle: {
				ms: 'Aplikasi Mudah Alih Onboarding & Pengalaman Pekerja Perusahaan',
				en: 'Enterprise Mobile Onboarding & Employee Experience Platform'
			},
			client: { ms: 'Tenaga Nasional Berhad (TNB)', en: 'Tenaga Nasional Berhad (TNB)' },
			year: '2023 — 2024',
			description: {
				ms: 'Aplikasi mudah alih dan web pintar yang memodenkan persediaan hari pertama kakitangan baharu TNB. Memperkemas penyerahan dokumen digital, pengesahan profil automatik, pengurusan tugasan latihan, dan penyelarasan rentas pelayan awan Azure.',
				en: 'Cross-platform mobile and web application modernizing first-day onboarding across Tenaga Nasional Berhad. Streamlines digital document dispatch, identity validation, step-by-step training modules, and multi-database cloud sync on Microsoft Azure.'
			},
			tags: ['Flutter', 'Dart', 'Microsoft Azure', 'Jenkins CI/CD', 'Firebase', 'Supabase'],
			metrics: [
				{ label: { ms: 'Kecekapan Onboarding', en: 'Process Velocity' }, val: '+65%' },
				{ label: { ms: 'Infrastruktur Awan', en: 'Cloud Hosting' }, val: 'Azure Ubuntu' },
				{ label: { ms: 'Automasi Binaan', en: 'Automation' }, val: 'Jenkins CI/CD' }
			],
			accent: '#38bdf8',
			category: { ms: 'Mobiliti & Awan', en: 'Mobile & Cloud' }
		},
		{
			id: 'cv_bot',
			index: '03',
			title: 'cv_bot Vision Engine',
			subtitle: {
				ms: 'Enjin Pengesanan Visual Pintar & Automasi Desktop Masa Nyata',
				en: 'Real-Time Computer Vision & Desktop Orchestration Engine'
			},
			client: { ms: 'Penyelidikan Peribadi R&D', en: 'Personal R&D System' },
			year: '2024',
			description: {
				ms: 'Enjin automasi komputer berketepatan tinggi berasaskan penglihatan komputer. Menggabungkan deskriptor ciri invarian skala (SIFT), ruang warna CIELAB, dan API Win32 untuk mengenali elemen skrin dan melaksanakan automasi tugas desktop dalam masa bawah 100ms.',
				en: 'High-precision visual recognition and automation engine combining OpenCV, scale-invariant feature transform (SIFT), and CIELAB color-space calibration to identify dynamic screen targets and execute sub-100ms deterministic desktop workflows.'
			},
			tags: ['Python', 'OpenCV', 'SIFT Algorithms', 'CIELAB Color', 'Win32 API', 'Multithreading'],
			metrics: [
				{ label: { ms: 'Kependaman Pengesanan', en: 'Latency Target' }, val: '< 95ms' },
				{ label: { ms: 'Algoritma Ciri', en: 'Feature Math' }, val: 'SIFT Invariant' },
				{ label: { ms: 'Integrasi OS', en: 'OS Layer' }, val: 'Win32 Direct' }
			],
			accent: '#10b981',
			category: { ms: 'Kepintaran Buatan & Automasi', en: 'Computer Vision & AI' }
		},
		{
			id: 'nova_systems',
			index: '04',
			title: 'IWA001 & Infinity Corporate',
			subtitle: {
				ms: 'Sistem Pinjaman Bercagar & Portal Korporat Pelbagai Bahasa',
				en: 'Secured Lending Platform & Multilingual Corporate Infrastructure'
			},
			client: { ms: 'Nova Web & Support', en: 'Nova Web & Support' },
			year: '2023',
			description: {
				ms: 'Pembangunan platform permohonan pinjaman bercagar dan laman korporat 3 bahasa yang dioptimumkan untuk keselamatan pangkalan data (Supabase Row-Level Security), kelajuan pelayan (Redis Cache), dan perlindungan DDoS melalui Cloudflare WAF.',
				en: 'Production secured lending system and multilingual corporate portal engineered with Supabase Row-Level Security policies, distributed Redis caching, and Cloudflare WAF edge protection deployed on Vercel.'
			},
			tags: ['SvelteKit', 'Supabase RLS', 'Redis Cache', 'Tailwind CSS', 'Cloudflare WAF'],
			metrics: [
				{ label: { ms: 'Skor Prestasi', en: 'Performance' }, val: '99 / 100' },
				{ label: { ms: 'Keselamatan Data', en: 'Data Security' }, val: 'Postgres RLS' },
				{ label: { ms: 'Bahasa Disokong', en: 'Languages' }, val: '3 Bahasa' }
			],
			accent: '#a855f7',
			category: { ms: 'Aplikasi Web & SaaS', en: 'Web SaaS & Finance' }
		}
	];

	function handleAction() {
		playBlip(860, 0.03);
	}
</script>

<section id="projects" class="section projects-section" aria-label="Selected Works">
	<div class="container">
		<!-- Section Header -->
		<div class="section-header">
			<span class="section-label">
				{$lang === 'ms' ? '01 / Hasil Kerja Terpilih' : '01 / Selected Work'}
			</span>
			<h2 class="section-title">
				{$lang === 'ms' ? 'Sistem yang dibina dengan tujuan & ketahanan.' : 'Systems engineered with purpose and resilience.'}
			</h2>
			<p class="section-desc">
				{$lang === 'ms'
					? 'Daripada infrastruktur sektor awam berskala besar dan aplikasi mobiliti perusahaan hingga penglihatan komputer masa nyata. Setiap projek direka untuk menyelesaikan cabaran sebenar.'
					: 'From mission-critical public-sector platforms and enterprise mobility solutions to real-time computer vision engines. Every project is built to deliver real-world impact.'}
			</p>
		</div>

		<!-- Projects Grid -->
		<div class="projects-list">
			{#each projects as item (item.id)}
				<article class="project-card" style="--project-accent: {item.accent};">
					<div class="project-card-inner">
						<!-- Card Top Metadata -->
						<div class="card-meta">
							<span class="card-index">{item.index}</span>
							<span class="card-category">{item.category[$lang]}</span>
							<span class="card-client">{item.client[$lang]}</span>
							<span class="card-year">{item.year}</span>
						</div>

						<!-- Card Title & Subtitle -->
						<h3 class="card-title">{item.title}</h3>
						<p class="card-subtitle">{item.subtitle[$lang]}</p>

						<!-- Detailed Description -->
						<p class="card-description">{item.description[$lang]}</p>

						<!-- Metrics Strip -->
						<div class="card-metrics">
							{#each item.metrics as m}
								<div class="metric-item">
									<span class="metric-val">{m.val}</span>
									<span class="metric-lbl">{m.label[$lang]}</span>
								</div>
							{/each}
						</div>

						<!-- Tech Stack Tags -->
						<div class="card-tags">
							{#each item.tags as tag}
								<span class="tag-pill">{tag}</span>
							{/each}
						</div>

						<!-- Card Footer Action -->
						<div class="card-action">
							<a href="#contact" class="card-cta" onclick={handleAction}>
								<span>{$lang === 'ms' ? 'Bincang Seni Bina Projek Ini' : 'Discuss This Architecture'}</span>
								<svg class="cta-arrow" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
									<path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
								</svg>
							</a>
						</div>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	.projects-section {
		background-color: var(--bg);
		border-top: 1px solid var(--surface-border);
	}

	.section-header {
		max-width: 740px;
		margin-bottom: clamp(3rem, 6vw, 4.5rem);
	}

	/* Projects List */
	.projects-list {
		display: flex;
		flex-direction: column;
		gap: clamp(2rem, 4vw, 3rem);
	}

	/* Project Card */
	.project-card {
		position: relative;
		border-radius: 1.5rem;
		background: var(--surface);
		border: 1px solid var(--surface-border);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
		transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.project-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: var(--project-accent);
		opacity: 0.65;
		transition: opacity 0.3s ease, height 0.3s ease;
	}

	.project-card:hover {
		transform: translateY(-4px);
		border-color: var(--surface-border-hover);
		box-shadow: var(--shadow-lg);
	}

	.project-card:hover::before {
		opacity: 1;
		height: 4px;
	}

	.project-card-inner {
		padding: clamp(2rem, 4vw, 3.25rem);
		display: flex;
		flex-direction: column;
		gap: 1.4rem;
	}

	/* Card Meta */
	.card-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.85rem;
		font-size: 0.82rem;
		color: var(--ink-muted);
	}

	.card-index {
		font-family: var(--font-heading);
		font-weight: 800;
		font-size: 1.1rem;
		color: var(--project-accent);
	}

	.card-category {
		font-weight: 600;
		padding: 0.25rem 0.65rem;
		border-radius: 9999px;
		background: var(--surface-border);
		color: var(--ink-secondary);
	}

	.card-client {
		font-weight: 500;
	}

	.card-year {
		margin-left: auto;
		font-family: monospace;
		font-size: 0.85rem;
	}

	/* Title & Subtitle */
	.card-title {
		font-size: clamp(2rem, 3.5vw, 2.8rem);
		letter-spacing: -0.035em;
		line-height: 1.1;
		color: var(--ink);
	}

	.card-subtitle {
		font-size: clamp(1.05rem, 1.4vw, 1.25rem);
		font-weight: 600;
		color: var(--project-accent);
		line-height: 1.4;
	}

	/* Description */
	.card-description {
		font-size: clamp(0.96rem, 1.2vw, 1.08rem);
		color: var(--ink-secondary);
		line-height: 1.7;
		max-width: 78ch;
	}

	/* Metrics Strip */
	.card-metrics {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 1rem;
		padding: 1.25rem 1.5rem;
		border-radius: 1rem;
		background: var(--bg-subtle);
		border: 1px solid var(--surface-border);
		margin-block: 0.4rem;
	}

	.metric-item {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.metric-val {
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: 1.4rem;
		color: var(--ink);
		line-height: 1;
	}

	.metric-lbl {
		font-size: 0.78rem;
		font-weight: 500;
		color: var(--ink-muted);
	}

	/* Tech Stack Tags */
	.card-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.55rem;
	}

	.tag-pill {
		font-size: 0.82rem;
		font-weight: 600;
		padding: 0.35rem 0.8rem;
		border-radius: 9999px;
		background: var(--surface-border);
		color: var(--ink-secondary);
		border: 1px solid transparent;
		transition: all 0.2s ease;
	}

	.project-card:hover .tag-pill {
		border-color: var(--surface-border-hover);
		color: var(--ink);
	}

	/* Card Footer Action */
	.card-action {
		display: flex;
		align-items: center;
		padding-top: 0.8rem;
		border-top: 1px solid var(--surface-border);
	}

	.card-cta {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.94rem;
		font-weight: 600;
		color: var(--ink);
		text-decoration: none;
		transition: color 0.2s ease, gap 0.2s ease;
	}

	.card-cta:hover {
		color: var(--project-accent);
		gap: 0.75rem;
	}

	.cta-arrow {
		width: 18px;
		height: 18px;
		transition: transform 0.2s ease;
	}

	.card-cta:hover .cta-arrow {
		transform: translateX(4px);
	}

	@media (max-width: 640px) {
		.card-meta {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.4rem;
		}

		.card-year {
			margin-left: 0;
		}

		.card-metrics {
			grid-template-columns: 1fr;
		}
	}
</style>
