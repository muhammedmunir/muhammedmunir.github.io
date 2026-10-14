<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { lang } from '$lib/i18n';
	import { translations } from '$lib/translations';
	import { derived } from 'svelte/store';
	import { playBlip, playConfirm } from '$lib/sound';

	let activeFilter = $state<string>('all');
	let searchQuery = $state<string>('');
	let selectedProject = $state<ProjectItem | null>(null);

	const t = derived(lang, ($l) => translations[$l].projects);

	interface ProjectItem {
		id: string;
		key: keyof typeof translations.ms.projects;
		context: string;
		category: 'gov' | 'ai' | 'mobile' | 'web' | 'sim';
		badgeKey: 'enterprise' | 'production' | 'innovation' | 'academic';
		accent: string;
		icon: string;
		image?: string;
		docHref?: string;
		demoHref?: string;
		gradient: string;
		tags: string[];
		isGov?: boolean;
	}

	// 3 Public Sector & Enterprise Systems (YHCM) - Sanitized & Discreet
	const govProjects: ProjectItem[] = [
		{
			id: 'emesys',
			key: 'emesys',
			context: 'YHCM Sdn Bhd • Platform Pengurusan Aset',
			category: 'gov',
			badgeKey: 'enterprise',
			accent: '#38BDF8',
			icon: '🛡️',
			isGov: true,
			gradient: 'linear-gradient(135deg, rgba(56,189,248,0.14) 0%, rgba(10,25,48,0.7) 100%)',
			tags: [
				'Laravel 11',
				'Vue.js 3',
				'Tailwind CSS',
				'Docker Swarm',
				'MariaDB',
				'Enterprise SSO',
				'RBAC Audit'
			]
		},
		{
			id: 'sutera',
			key: 'sutera',
			context: 'YHCM Sdn Bhd • Operasi & Penyelenggaraan',
			category: 'gov',
			badgeKey: 'enterprise',
			accent: '#10B981',
			icon: '⚙️',
			isGov: true,
			gradient: 'linear-gradient(135deg, rgba(16,185,129,0.14) 0%, rgba(8,30,22,0.7) 100%)',
			tags: [
				'Laravel 11',
				'Vue.js 3',
				'PostgreSQL 17',
				'Docker',
				'Redis',
				'Ubuntu 24.04',
				'RBAC Security'
			]
		},
		{
			id: 'adims',
			key: 'adims',
			context: 'YHCM Sdn Bhd • Arkib & Rekod Digital',
			category: 'gov',
			badgeKey: 'enterprise',
			accent: '#A855F7',
			icon: '📦',
			isGov: true,
			gradient: 'linear-gradient(135deg, rgba(168,85,247,0.14) 0%, rgba(24,12,38,0.7) 100%)',
			tags: [
				'Laravel 12',
				'PHP 8.5',
				'Laravel Horizon',
				'QR Code Engine',
				'Cloud Storage S3',
				'Audit Logging',
				'Google 2FA'
			]
		}
	];

	// 16 Innovation & Production Apps
	const innovationProjects: ProjectItem[] = [
		{
			id: 'tindak',
			key: 'tindak',
			context: 'Inovasi Peribadi • Seni Bina Android Pintar',
			category: 'ai',
			badgeKey: 'innovation',
			accent: '#00F0FF',
			icon: '⚡',
			gradient: 'linear-gradient(135deg, rgba(0,240,255,0.14) 0%, rgba(6,25,45,0.7) 100%)',
			tags: [
				'Flutter',
				'Android Share Intent',
				'Local-First Parser',
				'Gemini AI Fallback',
				'Supabase Edge Functions',
				'RLS Security'
			]
		},
		{
			id: 'nine_router',
			key: 'nine_router',
			context: 'Autonomous AI Orchestration & Virtual Office',
			category: 'ai',
			badgeKey: 'innovation',
			accent: '#818CF8',
			icon: '🏢',
			image: '/images/9router_office_3d.png',
			gradient: 'linear-gradient(135deg, rgba(129,140,248,0.14) 0%, rgba(15,18,48,0.7) 100%)',
			tags: [
				'Node.js 22+',
				'Three.js 3D',
				'Model Context Protocol',
				'Multi-Agent Voice',
				'Playwright Testing'
			]
		},
		{
			id: 'cv_bot',
			key: 'cv_bot',
			context: 'Desktop Automation & Systems Engineering',
			category: 'ai',
			badgeKey: 'innovation',
			accent: '#EC4899',
			icon: '👁️',
			gradient: 'linear-gradient(135deg, rgba(236,72,153,0.14) 0%, rgba(30,10,35,0.7) 100%)',
			tags: [
				'Python 3',
				'OpenCV',
				'Win32 API Native',
				'CustomTkinter',
				'SIFT Homography',
				'CIELAB Color Space'
			]
		},
		{
			id: 'baby_kicking',
			key: 'baby_kicking',
			context: 'Kesihatan Ibu Mengandung • Aplikasi Mudah Alih',
			category: 'mobile',
			badgeKey: 'production',
			accent: '#F43F5E',
			icon: '👶',
			image: '/images/baby_kicking_logo.png',
			gradient: 'linear-gradient(135deg, rgba(244,63,94,0.14) 0%, rgba(35,10,20,0.7) 100%)',
			tags: [
				'Flutter Cross-Platform',
				'Dart',
				'Firebase Firestore',
				'Cloud Functions',
				'PDF Export'
			]
		},
		{
			id: 'tax_relief',
			key: 'tax_relief',
			context: 'Fintech • Pengiraan Percukaian LHDN Malaysia',
			category: 'web',
			badgeKey: 'production',
			accent: '#10B981',
			icon: '📊',
			gradient: 'linear-gradient(135deg, rgba(16,185,129,0.14) 0%, rgba(8,30,22,0.7) 100%)',
			tags: [
				'Node.js',
				'TypeScript',
				'LHDN Tax Engine',
				'Deduction Optimizer',
				'Interactive Charts'
			]
		},
		{
			id: 'jiofarm',
			key: 'jiofarm',
			context: 'Agri-Tech • IoT Smart Farming Telemetry',
			category: 'mobile',
			badgeKey: 'innovation',
			accent: '#84CC16',
			icon: '🌱',
			gradient: 'linear-gradient(135deg, rgba(132,204,22,0.14) 0%, rgba(20,30,8,0.7) 100%)',
			tags: [
				'Python FastAPI',
				'IoT Telemetry',
				'Soil Moisture Tracking',
				'Automated Irrigation',
				'Yield Analytics'
			]
		},
		{
			id: 'lumina',
			key: 'lumina',
			context: 'Lumina Glass Studio & Custom Contracting',
			category: 'web',
			badgeKey: 'production',
			accent: '#38BDF8',
			icon: '🪞',
			gradient: 'linear-gradient(135deg, rgba(56,189,248,0.14) 0%, rgba(10,25,48,0.7) 100%)',
			tags: [
				'SvelteKit',
				'Laravel 11 API',
				'LED Kelvin Visualizer',
				'Tailwind CSS',
				'PHPUnit Tests'
			]
		},
		{
			id: 'foony_9ball',
			key: 'foony_9ball',
			context: 'Enjin Fizik Permainan & Pelanjutan Pelayar',
			category: 'sim',
			badgeKey: 'innovation',
			accent: '#F59E0B',
			icon: '🎱',
			gradient: 'linear-gradient(135deg, rgba(245,158,11,0.14) 0%, rgba(35,20,5,0.7) 100%)',
			tags: [
				'Manifest V3',
				'Canvas 2D Physics',
				'Trajectory Projection',
				'WebSocket Hooks',
				'Collision Geometry'
			]
		},
		{
			id: 'iwa001',
			key: 'iwa001',
			context: 'Nova Bitara Development Sdn Bhd',
			category: 'web',
			badgeKey: 'production',
			accent: '#D4AF37',
			icon: '🔐',
			docHref: '/docs/iwa001-case-study.pdf',
			gradient: 'linear-gradient(135deg, rgba(212,175,55,0.14) 0%, rgba(25,20,5,0.7) 100%)',
			tags: [
				'SvelteKit 2',
				'TypeScript',
				'Supabase RLS',
				'JWT Auth',
				'Admin Panel',
				'Vercel Edge'
			]
		},
		{
			id: 'onboardx',
			key: 'onboardx',
			context: 'Tenaga Nasional Berhad (TNB)',
			category: 'web',
			badgeKey: 'enterprise',
			accent: '#22C55E',
			icon: '⚡',
			gradient: 'linear-gradient(135deg, rgba(34,197,94,0.14) 0%, rgba(8,28,15,0.7) 100%)',
			tags: [
				'Flutter Multiplatform',
				'Firebase Realtime',
				'MongoDB',
				'Azure Cloud',
				'Kubernetes',
				'Jenkins CI/CD'
			]
		},
		{
			id: 'infinity',
			key: 'infinity',
			context: 'Nova Bitara Development Sdn Bhd',
			category: 'web',
			badgeKey: 'production',
			accent: '#60A5FA',
			icon: '🌐',
			docHref: '/docs/infinity-landing-case-study.pdf',
			gradient: 'linear-gradient(135deg, rgba(96,165,250,0.14) 0%, rgba(12,24,45,0.7) 100%)',
			tags: [
				'SvelteKit',
				'i18n Store (3 Bahasa)',
				'Redis Cache',
				'Resend API',
				'Vercel Edge'
			]
		},
		{
			id: 'orbit_pulse',
			key: 'orbit_pulse',
			context: 'Infrastruktur & Pemantauan Telemetri Pelayan',
			category: 'sim',
			badgeKey: 'innovation',
			accent: '#E11D48',
			icon: '📡',
			gradient: 'linear-gradient(135deg, rgba(225,29,72,0.14) 0%, rgba(35,6,15,0.7) 100%)',
			tags: [
				'Server Health Tracking',
				'Latency Ping Tracker',
				'Pulse Visualizer',
				'Threshold Alarms'
			]
		},
		{
			id: 'focus_board',
			key: 'focus_board',
			context: 'Aplikasi Produktiviti & Pengurusan Tugasan',
			category: 'web',
			badgeKey: 'production',
			accent: '#FBBF24',
			icon: '🎯',
			gradient: 'linear-gradient(135deg, rgba(251,191,36,0.14) 0%, rgba(35,25,5,0.7) 100%)',
			tags: [
				'Modular Kanban',
				'Pomodoro Focus Timer',
				'Local State Machine',
				'Zero Bloat'
			]
		},
		{
			id: 'sudoku',
			key: 'sudoku',
			context: 'Algoritma Sains Komputer & Pelanjutan Pelayar',
			category: 'sim',
			badgeKey: 'innovation',
			accent: '#38BDF8',
			icon: '🧩',
			gradient: 'linear-gradient(135deg, rgba(56,189,248,0.14) 0%, rgba(8,25,45,0.7) 100%)',
			tags: [
				'Procedural Generator',
				'Backtracking Solver',
				'Chromium Extension',
				'Dark UI'
			]
		},
		{
			id: 'utm-fyp',
			key: 'fyp',
			context: 'Universiti Teknologi Malaysia (UTM FYP)',
			category: 'web',
			badgeKey: 'academic',
			accent: '#A78BFA',
			icon: '🗺️',
			gradient: 'linear-gradient(135deg, rgba(167,139,250,0.14) 0%, rgba(22,12,38,0.7) 100%)',
			tags: [
				'Google Maps API',
				'Marker Clustering',
				'SvelteKit',
				'Supabase PostgreSQL',
				'Figma UI/UX'
			]
		}
	];

	// All 19 Shipped Systems in one clean list
	const allProjects: ProjectItem[] = [...govProjects, ...innovationProjects];

	// Filtered list
	const filteredProjects = $derived(
		allProjects.filter((p) => {
			const matchesCategory =
				activeFilter === 'all' ||
				(activeFilter === 'gov' && p.category === 'gov') ||
				(activeFilter === 'ai' && p.category === 'ai') ||
				(activeFilter === 'mobile' && p.category === 'mobile') ||
				(activeFilter === 'web' && p.category === 'web') ||
				(activeFilter === 'sim' && p.category === 'sim');

			if (!searchQuery.trim()) return matchesCategory;

			const q = searchQuery.toLowerCase().trim();
			const projectTrans = translations[$lang].projects[
				p.key as keyof typeof translations.ms.projects
			] as any;
			const title = projectTrans?.title?.toLowerCase() || '';
			const subtitle = projectTrans?.subtitle?.toLowerCase() || '';
			const desc = projectTrans?.desc?.toLowerCase() || '';
			const tagsStr = p.tags.join(' ').toLowerCase();

			const matchesSearch =
				title.includes(q) ||
				subtitle.includes(q) ||
				desc.includes(q) ||
				tagsStr.includes(q) ||
				p.context.toLowerCase().includes(q);

			return matchesCategory && matchesSearch;
		})
	);

	function openSpecs(project: ProjectItem) {
		playConfirm();
		selectedProject = project;
		document.body.style.overflow = 'hidden';
	}

	function closeSpecs() {
		playBlip(440, 0.04);
		selectedProject = null;
		document.body.style.overflow = '';
	}

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		gsap.utils.toArray('.project-card').forEach((card, i) => {
			gsap.fromTo(
				card as HTMLElement,
				{ opacity: 0, y: 25 },
				{
					opacity: 1,
					y: 0,
					duration: 0.5,
					delay: (i % 3) * 0.08,
					ease: 'power2.out',
					scrollTrigger: {
						trigger: card as HTMLElement,
						start: 'top 90%',
						toggleActions: 'play none none none'
					}
				}
			);
		});

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && selectedProject) {
				closeSpecs();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	});
</script>

<section id="projects" class="section projects-section">
	<!-- Section Header -->
	<div class="section-header">
		<span class="section-label">{$t.label}</span>
		<h2 class="section-title">
			<span class="text-gradient">{$t.title}</span>
		</h2>
		<p class="section-desc">{$t.desc}</p>
		<div class="section-divider" aria-hidden="true"></div>
	</div>

	<!-- 🎛️ CONTROLS: SEARCH BAR & CATEGORY TABS -->
	<div class="project-controls-bar">
		<!-- Search Input -->
		<div class="search-wrap">
			<span class="search-icon" aria-hidden="true">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="11" cy="11" r="8"></circle>
					<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
				</svg>
			</span>
			<input
				type="text"
				class="project-search-input"
				placeholder={$t.search_placeholder}
				bind:value={searchQuery}
				aria-label="Cari Projek"
			/>
			{#if searchQuery}
				<button class="clear-search-btn" onclick={() => (searchQuery = '')} aria-label="Padam Carian">✕</button>
			{/if}
		</div>

		<!-- Category Filter Pills -->
		<div class="category-pills" role="tablist">
			<button
				class="pill-btn"
				class:active={activeFilter === 'all'}
				onclick={() => {
					activeFilter = 'all';
					playBlip(550, 0.03);
				}}
			>
				{$t.filter_all}
				<span class="pill-count">{allProjects.length}</span>
			</button>
			<button
				class="pill-btn"
				class:active={activeFilter === 'gov'}
				onclick={() => {
					activeFilter = 'gov';
					playBlip(570, 0.03);
				}}
			>
				🏛️ {$t.filter_gov}
				<span class="pill-count">{govProjects.length}</span>
			</button>
			<button
				class="pill-btn"
				class:active={activeFilter === 'ai'}
				onclick={() => {
					activeFilter = 'ai';
					playBlip(590, 0.03);
				}}
			>
				⚡ {$t.filter_ai}
				<span class="pill-count">{allProjects.filter((p) => p.category === 'ai').length}</span>
			</button>
			<button
				class="pill-btn"
				class:active={activeFilter === 'mobile'}
				onclick={() => {
					activeFilter = 'mobile';
					playBlip(610, 0.03);
				}}
			>
				📱 {$t.filter_mobile}
				<span class="pill-count">{allProjects.filter((p) => p.category === 'mobile').length}</span>
			</button>
			<button
				class="pill-btn"
				class:active={activeFilter === 'web'}
				onclick={() => {
					activeFilter = 'web';
					playBlip(630, 0.03);
				}}
			>
				🌐 {$t.filter_web}
				<span class="pill-count">{allProjects.filter((p) => p.category === 'web').length}</span>
			</button>
			<button
				class="pill-btn"
				class:active={activeFilter === 'sim'}
				onclick={() => {
					activeFilter = 'sim';
					playBlip(650, 0.03);
				}}
			>
				🎮 {$t.filter_sim}
				<span class="pill-count">{allProjects.filter((p) => p.category === 'sim').length}</span>
			</button>
		</div>
	</div>

	<!-- 📦 PROJECTS GRID (18+ ALL PROJECTS) -->
	<div class="projects-grid">
		{#if filteredProjects.length === 0}
			<div class="empty-state">
				<div class="empty-glyph">📡</div>
				<h4>Tiada projek ditemui untuk "{searchQuery}"</h4>
				<p>Cuba kata kunci lain seperti Laravel, Flutter, Docker, AI, atau reset penapis.</p>
				<button
					class="btn btn-outline"
					onclick={() => {
						activeFilter = 'all';
						searchQuery = '';
					}}
				>
					Set Semula Penapis
				</button>
			</div>
		{:else}
			{#each filteredProjects as project (project.id)}
				{@const itemData = $t[project.key as keyof typeof $t] as any}
				<article
					class="project-card"
					style="--proj-accent: {project.accent};"
					onmouseenter={() => playBlip(700, 0.02)}
				>
					<div
						class="card-glow-bg"
						style="background: {project.gradient};"
						aria-hidden="true"
					></div>

					<!-- Header: Icon & Category Badge -->
					<div class="card-header-row">
						<div class="card-icon-avatar" style="border-color: {project.accent};">
							{#if project.image}
								<img src={project.image} alt="" class="card-avatar-img" />
							{:else}
								<span>{project.icon}</span>
							{/if}
						</div>
						<div class="card-badges">
							{#if project.isGov}
								<span class="badge badge-gov">🏛️ Sektor Awam</span>
							{:else}
								<span class="badge badge-type badge-{project.badgeKey}">
									{$t[project.badgeKey]}
								</span>
							{/if}
						</div>
					</div>

					<!-- Body: Context, Title, Subtitle, 2-line Desc -->
					<div class="card-body">
						<div class="card-context">
							{project.context}
						</div>

						<h3 class="card-title">{itemData.title}</h3>
						<p class="card-subtitle">{itemData.subtitle}</p>
						<p class="card-desc">{itemData.desc}</p>

						<!-- Clean Tag Pills (first 4 tags, +N if more) -->
						<div class="tags-cloud">
							{#each project.tags.slice(0, 4) as tag}
								<span class="tag proj-tag">{tag}</span>
							{/each}
							{#if project.tags.length > 4}
								<span class="tag proj-tag tag-more">+{project.tags.length - 4}</span>
							{/if}
						</div>
					</div>

					<!-- Footer Actions: Specs Modal Button & optional PDF -->
					<div class="card-footer-row">
						<button class="btn-card-specs" onclick={() => openSpecs(project)}>
							<span>Spesifikasi Sistem</span>
							<span class="arrow-glyph">➔</span>
						</button>

						{#if project.docHref}
							<a
								href={project.docHref}
								target="_blank"
								rel="noopener noreferrer"
								class="btn-card-doc"
								download
								title="Muat Turun Kajian Kes (PDF)"
							>
								<span>PDF</span>
							</a>
						{/if}
					</div>
				</article>
			{/each}
		{/if}
	</div>

	<!-- CTA Bottom Banner -->
	<div class="projects-cta">
		<div class="cta-inner">
			<div class="cta-text">
				<h3>{$t.cta}</h3>
				<p>
					Sedia berbincang untuk peranan sepenuh masa, perundingan kanan, atau demonstrasi
					arkitektur sistem.
				</p>
			</div>
			<a href="#contact" class="btn btn-primary cta-btn" onclick={() => playConfirm()}>
				{$t.cta_btn} ➔
			</a>
		</div>
	</div>
</section>

<!-- 🔍 FULL TECHNICAL SPECIFICATION MODAL -->
{#if selectedProject}
	{@const modalData = $t[selectedProject.key as keyof typeof $t] as any}
	<div class="modal-backdrop" onclick={closeSpecs} role="presentation"></div>

	<div
		class="specs-modal"
		style="--modal-accent: {selectedProject.accent};"
		role="dialog"
		aria-label="Spesifikasi Sistem Penuh"
		aria-modal="true"
	>
		<!-- Modal Header -->
		<header class="modal-header">
			<div class="modal-brand">
				<span class="modal-icon">{selectedProject.icon}</span>
				<div>
					<div class="modal-badge-row">
						{#if selectedProject.isGov}
							<span class="badge badge-gov">🏛️ SEKTOR AWAM</span>
						{/if}
						<span class="badge badge-modal">{$t[selectedProject.badgeKey]}</span>
					</div>
					<h2 class="modal-title">{modalData.title}</h2>
					<p class="modal-sub">{modalData.subtitle}</p>
				</div>
			</div>
			<button class="modal-close-btn" onclick={closeSpecs} aria-label="Tutup Dialog">✕</button>
		</header>

		<!-- Modal Body -->
		<div class="modal-body">
			<!-- Context Card -->
			<div class="modal-context-strip">
				<span class="dim">Organisasi / Konteks:</span>
				<strong>{selectedProject.context}</strong>
			</div>

			<!-- System Visual Preview (if available) -->
			{#if selectedProject.image}
				<div class="modal-preview-box">
					<img
						src={selectedProject.image}
						alt={modalData.title}
						class="modal-preview-img"
						loading="lazy"
					/>
				</div>
			{/if}

			<!-- System Description -->
			<div class="modal-section">
				<h3 class="modal-section-title">Huraian Arkitektur Sistem</h3>
				<p class="modal-long-desc">{modalData.desc}</p>
			</div>

			<!-- Core Modules / Features -->
			{#if modalData.features && modalData.features.length > 0}
				<div class="modal-section">
					<h3 class="modal-section-title">{$t.specs_modules}</h3>
					<ul class="modal-feature-list">
						{#each modalData.features as feat}
							<li>
								<span class="feature-check" style="color: {selectedProject.accent};">✓</span>
								<span>{feat}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			<!-- Tech Stack Badges -->
			<div class="modal-section">
				<h3 class="modal-section-title">Teknologi & Alatan Digunakan</h3>
				<div class="modal-tags-grid">
					{#each selectedProject.tags as tag}
						<span class="tag modal-tag">{tag}</span>
					{/each}
				</div>
			</div>
		</div>

		<!-- Modal Footer Actions -->
		<footer class="modal-footer">
			{#if selectedProject.docHref}
				<a
					href={selectedProject.docHref}
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-primary"
					download
				>
					📥 Muat Turun Dokumen Kajian Kes (PDF)
				</a>
			{/if}
			<button class="btn btn-outline" onclick={closeSpecs}>
				{$t.close_modal}
			</button>
		</footer>
	</div>
{/if}

<style>
	.projects-section {
		position: relative;
		padding: 6rem 1.5rem;
		max-width: 1280px;
		margin: 0 auto;
	}

	/* Section Header */
	.section-header {
		text-align: center;
		margin-bottom: 3.5rem;
	}
	.section-label {
		display: inline-block;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: #38bdf8;
		margin-bottom: 0.5rem;
	}
	.section-title {
		font-family: var(--font-heading);
		font-size: clamp(2.2rem, 4vw, 3.2rem);
		font-weight: 800;
		letter-spacing: -0.025em;
		margin: 0.4rem 0 1rem;
		color: #f8fafc;
	}
	.section-desc {
		max-width: 680px;
		margin: 0 auto;
		color: #94a3b8;
		font-size: 1.05rem;
		line-height: 1.7;
	}
	.section-divider {
		width: 60px;
		height: 3px;
		background: linear-gradient(90deg, #38bdf8, #818cf8);
		border-radius: 3px;
		margin: 1.8rem auto 0;
	}

	/* 🎛️ CONTROLS BAR: SEARCH & TABS */
	.project-controls-bar {
		margin-bottom: 3rem;
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
	}

	.search-wrap {
		position: relative;
		width: 100%;
		max-width: 640px;
		margin: 0 auto;
	}
	.search-icon {
		position: absolute;
		left: 1.1rem;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		color: #64748b;
		pointer-events: none;
	}
	.project-search-input {
		width: 100%;
		padding: 0.85rem 2.8rem 0.85rem 3rem;
		background: rgba(15, 23, 42, 0.7);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 14px;
		color: #f8fafc;
		font-family: var(--font-body);
		font-size: 0.95rem;
		outline: none;
		backdrop-filter: blur(14px);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
		transition: all 0.25s ease;
	}
	.project-search-input:focus {
		border-color: #38bdf8;
		box-shadow:
			0 0 0 3px rgba(56, 189, 248, 0.15),
			0 8px 24px rgba(0, 0, 0, 0.4);
		background: rgba(15, 23, 42, 0.9);
	}
	.project-search-input::placeholder {
		color: #64748b;
	}
	.clear-search-btn {
		position: absolute;
		right: 1rem;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(255, 255, 255, 0.08);
		border: none;
		color: #94a3b8;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		font-size: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
	}
	.clear-search-btn:hover {
		background: rgba(255, 255, 255, 0.2);
		color: #fff;
	}

	.category-pills {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
	}
	.pill-btn {
		background: rgba(15, 23, 42, 0.65);
		border: 1px solid rgba(255, 255, 255, 0.08);
		color: #94a3b8;
		padding: 0.5rem 1.1rem;
		border-radius: 100px;
		font-family: var(--font-body);
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
	}
	.pill-btn:hover {
		border-color: rgba(56, 189, 248, 0.4);
		color: #e2e8f0;
		background: rgba(30, 41, 59, 0.8);
		transform: translateY(-1px);
	}
	.pill-btn.active {
		background: linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(129, 140, 248, 0.2) 100%);
		border-color: #38bdf8;
		color: #38bdf8;
		box-shadow: 0 0 16px rgba(56, 189, 248, 0.25);
	}
	.pill-count {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		padding: 0.1rem 0.45rem;
		border-radius: 100px;
		background: rgba(255, 255, 255, 0.08);
		color: inherit;
	}

	/* 📦 PROJECTS GRID */
	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1.8rem;
		margin-bottom: 4rem;
	}

	.project-card {
		position: relative;
		border-radius: 18px;
		padding: 1.8rem;
		background: rgba(11, 20, 38, 0.75);
		border: 1px solid rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(16px);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		overflow: hidden;
		transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
	}
	.project-card:hover {
		transform: translateY(-5px);
		border-color: var(--proj-accent);
		box-shadow:
			0 18px 45px rgba(0, 0, 0, 0.55),
			0 0 30px rgba(56, 189, 248, 0.12);
	}

	.card-glow-bg {
		position: absolute;
		inset: 0;
		opacity: 0.6;
		pointer-events: none;
		transition: opacity 0.3s;
	}
	.project-card:hover .card-glow-bg {
		opacity: 1;
	}

	.card-header-row {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.2rem;
		z-index: 1;
	}
	.card-icon-avatar {
		width: 46px;
		height: 46px;
		border-radius: 12px;
		border: 1.5px solid;
		background: rgba(15, 23, 42, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.4rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		overflow: hidden;
	}
	.card-avatar-img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		padding: 4px;
		border-radius: 10px;
	}
	.card-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.badge {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		font-weight: 700;
		padding: 0.25rem 0.65rem;
		border-radius: 100px;
		letter-spacing: 0.04em;
	}
	.badge-gov {
		background: rgba(56, 189, 248, 0.14);
		color: #38bdf8;
		border: 1px solid rgba(56, 189, 248, 0.35);
	}
	.badge-enterprise {
		background: rgba(34, 197, 94, 0.14);
		color: #4ade80;
		border: 1px solid rgba(34, 197, 94, 0.35);
	}
	.badge-production {
		background: rgba(212, 175, 55, 0.14);
		color: #d4af37;
		border: 1px solid rgba(212, 175, 55, 0.35);
	}
	.badge-innovation {
		background: rgba(0, 240, 255, 0.14);
		color: #00f0ff;
		border: 1px solid rgba(0, 240, 255, 0.35);
	}
	.badge-academic {
		background: rgba(168, 85, 247, 0.14);
		color: #c084fc;
		border: 1px solid rgba(168, 85, 247, 0.35);
	}

	.card-body {
		position: relative;
		z-index: 1;
		margin-bottom: 1.2rem;
	}
	.card-context {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 600;
		color: #94a3b8;
		margin-bottom: 0.4rem;
		letter-spacing: 0.02em;
	}

	.card-title {
		font-family: var(--font-heading);
		font-size: 1.25rem;
		font-weight: 700;
		color: #f8fafc;
		line-height: 1.35;
		margin-bottom: 0.3rem;
	}
	.card-subtitle {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--proj-accent);
		margin-bottom: 0.75rem;
	}
	.card-desc {
		font-size: 0.88rem;
		color: #94a3b8;
		line-height: 1.6;
		margin-bottom: 1.1rem;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.tags-cloud {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}
	.proj-tag {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		padding: 0.2rem 0.55rem;
		border-radius: 6px;
		background: rgba(15, 23, 42, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.08);
		color: #cbd5e1;
	}
	.tag-more {
		background: rgba(56, 189, 248, 0.1);
		border-color: rgba(56, 189, 248, 0.25);
		color: #38bdf8;
		font-weight: 600;
	}

	.card-footer-row {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
	}
	.btn-card-specs {
		flex: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.6rem 1rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 10px;
		color: #f8fafc;
		font-family: var(--font-body);
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.25s ease;
	}
	.btn-card-specs:hover {
		background: var(--proj-accent);
		color: #030712;
		border-color: var(--proj-accent);
		box-shadow: 0 0 16px var(--proj-accent);
	}
	.arrow-glyph {
		transition: transform 0.2s;
	}
	.btn-card-specs:hover .arrow-glyph {
		transform: translateX(3px);
	}

	.btn-card-doc {
		display: inline-flex;
		align-items: center;
		padding: 0.6rem 0.9rem;
		background: rgba(212, 175, 55, 0.12);
		border: 1px solid rgba(212, 175, 55, 0.35);
		border-radius: 10px;
		color: #d4af37;
		font-family: var(--font-mono);
		font-size: 0.78rem;
		font-weight: 700;
		text-decoration: none;
		cursor: pointer;
		transition: all 0.2s;
	}
	.btn-card-doc:hover {
		background: #d4af37;
		color: #030712;
	}

	.empty-state {
		grid-column: 1 / -1;
		text-align: center;
		padding: 4rem 1.5rem;
		background: rgba(11, 20, 38, 0.5);
		border: 1px dashed rgba(255, 255, 255, 0.12);
		border-radius: 16px;
	}
	.empty-glyph {
		font-size: 2.5rem;
		margin-bottom: 1rem;
	}
	.empty-state h4 {
		font-size: 1.2rem;
		color: #f8fafc;
		margin-bottom: 0.5rem;
	}
	.empty-state p {
		color: #94a3b8;
		margin-bottom: 1.5rem;
		font-size: 0.95rem;
	}

	/* Bottom CTA */
	.projects-cta {
		background: linear-gradient(135deg, rgba(14, 25, 48, 0.85) 0%, rgba(7, 13, 26, 0.95) 100%);
		border: 1px solid rgba(56, 189, 248, 0.25);
		padding: 2.2rem 2.5rem;
		border-radius: 20px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
	}
	.cta-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		flex-wrap: wrap;
	}
	.cta-text h3 {
		font-family: var(--font-heading);
		font-size: 1.35rem;
		font-weight: 700;
		color: #f8fafc;
		margin-bottom: 0.35rem;
	}
	.cta-text p {
		color: #94a3b8;
		font-size: 0.92rem;
		line-height: 1.6;
	}
	.cta-btn {
		white-space: nowrap;
	}

	/* 🔍 MODAL STYLING */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(3, 7, 18, 0.85);
		backdrop-filter: blur(14px);
		z-index: 1000;
	}
	.specs-modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: min(720px, calc(100vw - 2.5rem));
		max-height: calc(100vh - 4rem);
		background: rgba(10, 18, 35, 0.97);
		border: 1px solid var(--modal-accent);
		border-radius: 20px;
		box-shadow:
			0 25px 80px rgba(0, 0, 0, 0.85),
			0 0 50px rgba(56, 189, 248, 0.2);
		z-index: 1001;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}
	@keyframes modalFadeIn {
		from {
			opacity: 0;
			transform: translate(-50%, -47%) scale(0.97);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}

	.modal-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 1.6rem 2rem;
		background: rgba(15, 23, 42, 0.85);
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}
	.modal-brand {
		display: flex;
		align-items: flex-start;
		gap: 1.1rem;
	}
	.modal-icon {
		font-size: 2.2rem;
		line-height: 1;
	}
	.modal-badge-row {
		display: flex;
		gap: 0.45rem;
		margin-bottom: 0.45rem;
	}
	.badge-modal {
		background: rgba(255, 255, 255, 0.08);
		color: #e2e8f0;
	}
	.modal-title {
		font-family: var(--font-heading);
		font-size: 1.35rem;
		font-weight: 800;
		color: #f8fafc;
		line-height: 1.3;
	}
	.modal-sub {
		font-size: 0.88rem;
		font-weight: 600;
		color: var(--modal-accent);
		margin-top: 0.2rem;
	}
	.modal-close-btn {
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: #cbd5e1;
		width: 34px;
		height: 34px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 1rem;
		transition: all 0.2s;
	}
	.modal-close-btn:hover {
		background: #ef4444;
		border-color: #ef4444;
		color: #fff;
	}

	.modal-body {
		flex: 1;
		padding: 1.8rem 2rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1.6rem;
		scrollbar-width: thin;
	}

	.modal-context-strip {
		background: rgba(5, 12, 24, 0.7);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 10px;
		padding: 0.75rem 1rem;
		font-family: var(--font-mono);
		font-size: 0.84rem;
		color: #cbd5e1;
	}
	.modal-context-strip .dim {
		color: #94a3b8;
		margin-right: 0.4rem;
	}

	.modal-preview-box {
		width: 100%;
		border-radius: 12px;
		overflow: hidden;
		background: radial-gradient(circle, rgba(15, 23, 42, 0.95) 0%, rgba(3, 7, 18, 0.98) 100%);
		border: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.25rem;
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
	}
	.modal-preview-img {
		max-height: 220px;
		max-width: 100%;
		object-fit: contain;
		border-radius: 8px;
	}

	.modal-section-title {
		font-family: var(--font-mono);
		font-size: 0.85rem;
		font-weight: 700;
		color: #f8fafc;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-bottom: 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.modal-long-desc {
		font-size: 0.92rem;
		line-height: 1.7;
		color: #cbd5e1;
	}

	.modal-feature-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}
	.modal-feature-list li {
		display: flex;
		align-items: flex-start;
		gap: 0.65rem;
		font-size: 0.88rem;
		color: #cbd5e1;
		line-height: 1.5;
	}
	.feature-check {
		font-weight: 900;
		font-size: 1rem;
		flex-shrink: 0;
	}

	.modal-tags-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.modal-tag {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		padding: 0.3rem 0.75rem;
		border-radius: 6px;
		background: rgba(15, 23, 42, 0.9);
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: #e2e8f0;
	}

	.modal-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.8rem;
		padding: 1.2rem 2rem;
		background: rgba(11, 20, 38, 0.95);
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	@media (max-width: 768px) {
		.projects-section {
			padding: 4rem 1rem;
		}
		.projects-grid {
			grid-template-columns: 1fr;
			gap: 1.2rem;
		}
		.modal-header,
		.modal-body,
		.modal-footer {
			padding: 1.2rem;
		}
	}
</style>
