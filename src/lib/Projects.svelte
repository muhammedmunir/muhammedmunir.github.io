<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { lang } from '$lib/i18n';
	import { translations } from '$lib/translations';
	import { derived } from 'svelte/store';
	import { playBlip, playConfirm, playScan } from '$lib/sound';

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
		docHref?: string;
		demoHref?: string;
		gradient: string;
		tags: string[];
		isGov?: boolean;
		modulesList?: string[];
	}

	// 3 Government Systems (YHCM)
	const govProjects: ProjectItem[] = [
		{
			id: 'emesys',
			key: 'emesys',
			context: 'YHCM Sdn Bhd / Agensi Sektor Awam & Pertahanan',
			category: 'gov',
			badgeKey: 'enterprise',
			accent: '#38BDF8',
			icon: '🛡️',
			isGov: true,
			gradient: 'linear-gradient(135deg, rgba(56,189,248,0.18) 0%, rgba(10,25,48,0.7) 100%)',
			tags: [
				'Laravel 11',
				'Vue.js 3',
				'Tailwind CSS 3',
				'Docker Swarm',
				'Nginx',
				'SSO SAKTI TD',
				'Sanctum 2FA',
				'RBAC Audit',
				'PHP 8.4',
				'MariaDB'
			],
			modulesList: [
				'Modul 1: Pengurusan Aset (7 kategori, kelulusan & pelupusan)',
				'Modul 2: Pembaikan Woksyop (Job S1/S2/S3 & alat ganti)',
				'Modul 3: Pembaikan Tempatan & Kontrak (PT, PO & bayaran)',
				'Modul 4: Enjin Pelaporan Penyata S1/S2 (PDF / Excel)',
				'Modul 5: Dashboard Kesiagaan & Servisibiliti Aset Masa Nyata'
			]
		},
		{
			id: 'sutera',
			key: 'sutera',
			context: 'YHCM Sdn Bhd / Kejuruteraan Sektor Awam',
			category: 'gov',
			badgeKey: 'enterprise',
			accent: '#10B981',
			icon: '⚙️',
			isGov: true,
			gradient: 'linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(8,30,22,0.7) 100%)',
			tags: [
				'Laravel 11',
				'Vue.js 3',
				'PostgreSQL 17',
				'Redis 8',
				'Sync SPATD',
				'Docker',
				'Ubuntu 24.04 LTS',
				'RBAC Security'
			],
			modulesList: [
				'Modul 1: Pengurusan Aset KJC (perjawatan & pinjaman sementara)',
				'Modul 2: Pembaikan KJC (aliran kerja B3/B4 & direktif woksyop)',
				'Modul 3: Pengurusan Aset PKJ (15 kategori & integrasi SPATD)',
				'Modul 4: Enjin Pelaporan Rasmi KJC & PKJ (PDF rasmi)',
				'Modul 5: Dashboard Kesiagaan & Kesiapsiagaan Pertahanan'
			]
		},
		{
			id: 'adims',
			key: 'adims',
			context: 'YHCM Sdn Bhd / Pengurusan Maklumat Digital',
			category: 'gov',
			badgeKey: 'enterprise',
			accent: '#A855F7',
			icon: '📦',
			isGov: true,
			gradient: 'linear-gradient(135deg, rgba(168,85,247,0.18) 0%, rgba(24,12,38,0.7) 100%)',
			tags: [
				'Laravel 12',
				'PHP 8.5',
				'Laravel Horizon',
				'Bacon/Endroid QR',
				'AWS S3 / MinIO',
				'Spatie Activity Log',
				'Google 2FA',
				'Mpdf'
			],
			modulesList: [
				'Penjejakan Kod QR Fizikal Aset (Bacon & Endroid QR)',
				'Penyimpanan Awan S3/MinIO Flysystem Selamat',
				'Pengauditan Keselamatan Spatie Activity Log Lengkap',
				'Pengesahan Dua Faktor Google 2FA (Pragmarx)',
				'Pemprosesan Giliran Latar Belakang Laravel Horizon & Redis',
				'Penjanaan Laporan Automatik Mpdf & PhpSpreadsheet'
			]
		}
	];

	// 16 Innovation & Production Apps
	const innovationProjects: ProjectItem[] = [
		{
			id: 'tindak',
			key: 'tindak',
			context: 'Inovasi Peribadi / Seni Bina Android Pintar',
			category: 'ai',
			badgeKey: 'innovation',
			accent: '#00F0FF',
			icon: '⚡',
			gradient: 'linear-gradient(135deg, rgba(0,240,255,0.15) 0%, rgba(6,25,45,0.7) 100%)',
			tags: [
				'Flutter',
				'Android Share Intent',
				'Local-First Parser',
				'Gemini AI Fallback',
				'Supabase Edge Functions',
				'RLS Security Harness'
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
			gradient: 'linear-gradient(135deg, rgba(129,140,248,0.15) 0%, rgba(15,18,48,0.7) 100%)',
			tags: [
				'Node.js 22+',
				'Three.js 3D Virtual Scene',
				'Model Context Protocol (MCP)',
				'Multi-Agent Voice Bridge',
				'Playwright MCP Testing'
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
			gradient: 'linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(30,10,35,0.7) 100%)',
			tags: [
				'Python 3',
				'OpenCV',
				'Win32 API Native',
				'CustomTkinter',
				'SIFT Pyramid Homography',
				'CIELAB Color Space',
				'OCR'
			]
		},
		{
			id: 'baby_kicking',
			key: 'baby_kicking',
			context: 'Kesihatan Ibu Mengandung & Aplikasi Mudah Alih',
			category: 'mobile',
			badgeKey: 'production',
			accent: '#F43F5E',
			icon: '👶',
			gradient: 'linear-gradient(135deg, rgba(244,63,94,0.15) 0%, rgba(35,10,20,0.7) 100%)',
			tags: [
				'Flutter Cross-Platform',
				'Dart',
				'Firebase Firestore',
				'Cloud Functions',
				'Fetal Kick Analytics',
				'Doctor PDF Export'
			]
		},
		{
			id: 'tax_relief',
			key: 'tax_relief',
			context: 'Fintech / Pengiraan Percukaian LHDN Malaysia',
			category: 'web',
			badgeKey: 'production',
			accent: '#10B981',
			icon: '📊',
			gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(8,30,22,0.7) 100%)',
			tags: [
				'Node.js',
				'TypeScript',
				'LHDN Tax Engine',
				'Bracket Deduction Optimizer',
				'Interactive Charts',
				'Zero-Store Privacy'
			]
		},
		{
			id: 'jiofarm',
			key: 'jiofarm',
			context: 'Agri-Tech / IoT Smart Farming Telemetry',
			category: 'mobile',
			badgeKey: 'innovation',
			accent: '#84CC16',
			icon: '🌱',
			gradient: 'linear-gradient(135deg, rgba(132,204,22,0.15) 0%, rgba(20,30,8,0.7) 100%)',
			tags: [
				'Python FastAPI',
				'IoT Sensor Telemetry',
				'Soil Moisture Tracking',
				'Automated Irrigation Triggers',
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
			gradient: 'linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(10,25,48,0.7) 100%)',
			tags: [
				'SvelteKit',
				'Laravel 11 API',
				'Interactive LED Kelvin Visualizer',
				'Tailwind CSS',
				'PHPUnit Feature Tests 100%'
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
			gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(35,20,5,0.7) 100%)',
			tags: [
				'Chromium Manifest V3',
				'HTML5 Canvas 2D Physics',
				'Vector Trajectory Projection',
				'WebSocket Hooks',
				'Collision Geometry'
			]
		},
		{
			id: 'aerocar',
			key: 'aerocar',
			context: 'Simulator Aerodinamik Kereta Futuristik',
			category: 'sim',
			badgeKey: 'innovation',
			accent: '#06B6D4',
			icon: '🛸',
			gradient: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(5,25,35,0.7) 100%)',
			tags: [
				'Node.js 24',
				'HTML5 Canvas 2.5D',
				'Flight Aerodynamics',
				'VTOL & Hyperspeed Telemetry',
				'Booking System'
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
			gradient: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(25,20,5,0.7) 100%)',
			tags: [
				'SvelteKit 2',
				'TypeScript',
				'Supabase RLS',
				'JWT Auth',
				'17 Halaman Admin Panel',
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
			gradient: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(8,28,15,0.7) 100%)',
			tags: [
				'Flutter Multiplatform',
				'Firebase Realtime',
				'MongoDB',
				'Supabase',
				'Microsoft Azure',
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
			gradient: 'linear-gradient(135deg, rgba(96,165,250,0.15) 0%, rgba(12,24,45,0.7) 100%)',
			tags: [
				'SvelteKit',
				'Svelte Store i18n (3 Bahasa)',
				'Redis Subscriber Cache',
				'Resend API',
				'Vercel'
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
			gradient: 'linear-gradient(135deg, rgba(225,29,72,0.15) 0%, rgba(35,6,15,0.7) 100%)',
			tags: [
				'Server Health Monitoring',
				'Latency Ping Tracker',
				'Cardiac Pulse Visualizer',
				'Anomaly Threshold Alarms'
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
			gradient: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(35,25,5,0.7) 100%)',
			tags: [
				'Modular Kanban Board',
				'Pomodoro Focus Timer',
				'Local-First State Machine',
				'Zero External Bloat'
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
			gradient: 'linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(8,25,45,0.7) 100%)',
			tags: [
				'Procedural Board Generator',
				'Recursive Backtracking Solver',
				'Brave/Chromium Extension',
				'Dark HUD Interface'
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
			gradient: 'linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(22,12,38,0.7) 100%)',
			tags: [
				'Google Maps JavaScript API',
				'Marker Clustering & Heatmap',
				'SvelteKit',
				'Supabase PostgreSQL',
				'Figma UI/UX'
			]
		}
	];

	// Combined list for filtering
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

		gsap.utils.toArray('.project-card-vault').forEach((card, i) => {
			gsap.fromTo(
				card as HTMLElement,
				{ opacity: 0, y: 30 },
				{
					opacity: 1,
					y: 0,
					duration: 0.6,
					delay: (i % 3) * 0.1,
					ease: 'power2.out',
					scrollTrigger: {
						trigger: card as HTMLElement,
						start: 'top 88%',
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

	<!-- 🏛️ GOVERNMENT ENTERPRISE VAULT (EMESYS, SUTERA, ADIMS) -->
	<div class="gov-vault-container">
		<div class="gov-vault-header">
			<div class="gov-badge-pulse">
				<span class="pulse-ring"></span>
				<span class="pulse-dot"></span>
				{$t.gov_vault_badge}
			</div>
			<h3 class="gov-vault-title">{$t.gov_vault_title}</h3>
			<p class="gov-vault-desc">{$t.gov_vault_desc}</p>
		</div>

		<div class="gov-grid">
			{#each govProjects as proj}
				{@const pData = $t[proj.key as keyof typeof $t] as any}
				<article class="gov-card" style="--accent-glow: {proj.accent};">
					<div class="gov-card-top">
						<div
							class="gov-icon-box"
							style="background: {proj.gradient}; border-color: {proj.accent};"
						>
							<span class="gov-icon">{proj.icon}</span>
						</div>
						<div class="gov-card-status">
							<span class="status-indicator"></span>
							<span class="status-label">GRED KERAJAAN</span>
						</div>
					</div>

					<div class="gov-card-body">
						<div class="gov-context">{proj.context}</div>
						<h4 class="gov-title">{pData.title}</h4>
						<p class="gov-subtitle">{pData.subtitle}</p>
						<p class="gov-desc">{pData.desc}</p>

						<!-- Modules Breakdown -->
						{#if proj.modulesList}
							<div class="gov-modules-box">
								<div class="modules-heading">PECAHAN MODUL SISTEM:</div>
								<ul class="modules-list">
									{#each proj.modulesList as mod}
										<li>
											<span class="mod-check">✓</span>
											<span>{mod}</span>
										</li>
									{/each}
								</ul>
							</div>
						{/if}

						<!-- Tags -->
						<div class="gov-tags">
							{#each proj.tags as tag}
								<span class="tag gov-tag">{tag}</span>
							{/each}
						</div>
					</div>

					<div class="gov-card-actions">
						<button class="btn-specs-primary" onclick={() => openSpecs(proj)}>
							<span>🔍 {$t.specs_btn}</span>
						</button>
					</div>
				</article>
			{/each}
		</div>
	</div>

	<!-- 🎛️ CONTROLS: SEARCH BAR & CATEGORY TABS -->
	<div class="project-controls-bar">
		<!-- Search Input -->
		<div class="search-wrap">
			<span class="search-icon" aria-hidden="true">🔎</span>
			<input
				type="text"
				class="project-search-input"
				placeholder={$t.search_placeholder}
				bind:value={searchQuery}
				aria-label="Cari Projek"
			/>
			{#if searchQuery}
				<button class="clear-search-btn" onclick={() => (searchQuery = '')}>✕</button>
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
				<span class="pill-count">({allProjects.length})</span>
			</button>
			<button
				class="pill-btn"
				class:active={activeFilter === 'gov'}
				onclick={() => {
					activeFilter = 'gov';
					playBlip(570, 0.03);
				}}
			>
				{$t.filter_gov}
				<span class="pill-count">({govProjects.length})</span>
			</button>
			<button
				class="pill-btn"
				class:active={activeFilter === 'ai'}
				onclick={() => {
					activeFilter = 'ai';
					playBlip(590, 0.03);
				}}
			>
				{$t.filter_ai}
				<span class="pill-count">({allProjects.filter((p) => p.category === 'ai').length})</span>
			</button>
			<button
				class="pill-btn"
				class:active={activeFilter === 'mobile'}
				onclick={() => {
					activeFilter = 'mobile';
					playBlip(610, 0.03);
				}}
			>
				{$t.filter_mobile}
				<span class="pill-count">({allProjects.filter((p) => p.category === 'mobile').length})</span
				>
			</button>
			<button
				class="pill-btn"
				class:active={activeFilter === 'web'}
				onclick={() => {
					activeFilter = 'web';
					playBlip(630, 0.03);
				}}
			>
				{$t.filter_web}
				<span class="pill-count">({allProjects.filter((p) => p.category === 'web').length})</span>
			</button>
			<button
				class="pill-btn"
				class:active={activeFilter === 'sim'}
				onclick={() => {
					activeFilter = 'sim';
					playBlip(650, 0.03);
				}}
			>
				{$t.filter_sim}
				<span class="pill-count">({allProjects.filter((p) => p.category === 'sim').length})</span>
			</button>
		</div>
	</div>

	<!-- 📦 PROJECTS GRID (19+ ALL PROJECTS) -->
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
					class="project-card-vault card"
					style="--proj-accent: {project.accent};"
					onmouseenter={() => playBlip(700, 0.02)}
				>
					<div
						class="card-glow-bg"
						style="background: {project.gradient};"
						aria-hidden="true"
					></div>

					<div class="card-header-row">
						<div class="card-icon-avatar" style="border-color: {project.accent};">
							<span>{project.icon}</span>
						</div>
						<div class="card-badges">
							{#if project.isGov}
								<span class="badge badge-gov">🏛️ Sektor Kerajaan</span>
							{/if}
							<span class="badge badge-type badge-{project.badgeKey}">
								{$t[project.badgeKey]}
							</span>
						</div>
					</div>

					<div class="card-body">
						<div class="card-context">
							<span class="context-label">{$t.context_label}:</span>
							<span class="context-val">{project.context}</span>
						</div>

						<h3 class="card-title">{itemData.title}</h3>
						<p class="card-subtitle">{itemData.subtitle}</p>
						<p class="card-desc">{itemData.desc}</p>

						<!-- Key highlights list -->
						{#if itemData.features}
							<ul class="features-preview">
								{#each itemData.features.slice(0, 3) as feat}
									<li>
										<span class="feat-bullet" style="color: {project.accent};">▸</span>
										<span>{feat}</span>
									</li>
								{/each}
							</ul>
						{/if}

						<!-- Tags -->
						<div class="tags-cloud">
							{#each project.tags as tag}
								<span class="tag proj-tag">{tag}</span>
							{/each}
						</div>
					</div>

					<div class="card-footer-row">
						<button class="btn-card-specs" onclick={() => openSpecs(project)}>
							<span>Spesifikasi Sistem</span>
							<span class="arrow-glyph">→</span>
						</button>

						{#if project.docHref}
							<a
								href={project.docHref}
								target="_blank"
								rel="noopener noreferrer"
								class="btn-card-doc"
								download
							>
								<span>📥 {$t.view_doc}</span>
							</a>
						{/if}
					</div>
				</article>
			{/each}
		{/if}
	</div>

	<!-- CTA Bottom Banner -->
	<div class="projects-cta card">
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
		class="specs-modal card"
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
						<span class="badge badge-modal">{$t[selectedProject.badgeKey]}</span>
						{#if selectedProject.isGov}
							<span class="badge badge-gov">🏛️ SEKTOR KERAJAAN & PERTAHANAN</span>
						{/if}
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
				<span class="dim">Konteks / Organisasi:</span>
				<strong>{selectedProject.context}</strong>
			</div>

			<!-- System Description -->
			<div class="modal-section">
				<h3 class="modal-section-title">Huraian Arkitektur Sistem</h3>
				<p class="modal-long-desc">{modalData.desc}</p>
			</div>

			<!-- Core Modules / Features -->
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
		padding: 7rem 1.5rem;
		max-width: 1300px;
		margin: 0 auto;
	}

	/* Section Header */
	.section-header {
		text-align: center;
		margin-bottom: 3.5rem;
	}
	.section-title {
		font-size: clamp(2.2rem, 4vw, 3.2rem);
		font-weight: 800;
		letter-spacing: -0.02em;
		margin: 0.5rem 0 1rem;
	}
	.section-desc {
		max-width: 680px;
		margin: 0 auto;
		color: #94a3b8;
		font-size: 1.05rem;
		line-height: 1.7;
	}

	/* 🏛️ GOVERNMENT VAULT BANNER & CARDS */
	.gov-vault-container {
		background: linear-gradient(180deg, rgba(12, 28, 54, 0.75) 0%, rgba(7, 16, 32, 0.95) 100%);
		border: 1px solid rgba(56, 189, 248, 0.35);
		border-radius: 20px;
		padding: 2.5rem;
		margin-bottom: 4rem;
		box-shadow:
			0 20px 60px rgba(0, 0, 0, 0.5),
			inset 0 0 40px rgba(56, 189, 248, 0.08);
		position: relative;
		overflow: hidden;
	}
	.gov-vault-container::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(90deg, #38bdf8, #10b981, #a855f7, #d4af37);
	}

	.gov-vault-header {
		text-align: center;
		max-width: 820px;
		margin: 0 auto 2.5rem;
	}
	.gov-badge-pulse {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem 1rem;
		border-radius: 100px;
		background: rgba(56, 189, 248, 0.15);
		border: 1px solid rgba(56, 189, 248, 0.4);
		color: #38bdf8;
		font-family: 'Courier New', monospace;
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: 0.15em;
		margin-bottom: 1rem;
	}
	.pulse-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #38bdf8;
		box-shadow: 0 0 10px #38bdf8;
	}

	.gov-vault-title {
		font-size: clamp(1.6rem, 3vw, 2.3rem);
		font-weight: 800;
		color: #f8fafc;
		margin-bottom: 0.8rem;
		letter-spacing: -0.01em;
	}
	.gov-vault-desc {
		color: #cbd5e1;
		font-size: 0.96rem;
		line-height: 1.65;
	}

	.gov-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
		gap: 1.8rem;
	}

	.gov-card {
		background: rgba(10, 22, 42, 0.85);
		border: 1px solid rgba(56, 189, 248, 0.25);
		border-radius: 16px;
		padding: 1.8rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		backdrop-filter: blur(14px);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
		transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
		position: relative;
	}
	.gov-card:hover {
		transform: translateY(-5px);
		border-color: var(--accent-glow);
		box-shadow:
			0 16px 40px rgba(0, 0, 0, 0.6),
			0 0 30px rgba(56, 189, 248, 0.2);
	}

	.gov-card-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.2rem;
	}
	.gov-icon-box {
		width: 48px;
		height: 48px;
		border-radius: 12px;
		border: 1px solid;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.4rem;
	}
	.gov-card-status {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.25rem 0.65rem;
		border-radius: 100px;
		background: rgba(16, 185, 129, 0.12);
		border: 1px solid rgba(16, 185, 129, 0.3);
		font-family: 'Courier New', monospace;
		font-size: 0.68rem;
		font-weight: 800;
		color: #10b981;
	}
	.status-indicator {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #10b981;
		box-shadow: 0 0 6px #10b981;
	}

	.gov-context {
		font-family: 'Courier New', monospace;
		font-size: 0.72rem;
		font-weight: 700;
		color: #94a3b8;
		margin-bottom: 0.35rem;
	}
	.gov-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: #f8fafc;
		line-height: 1.35;
		margin-bottom: 0.4rem;
	}
	.gov-subtitle {
		font-size: 0.86rem;
		font-weight: 600;
		color: #38bdf8;
		margin-bottom: 0.8rem;
	}
	.gov-desc {
		font-size: 0.88rem;
		color: #94a3b8;
		line-height: 1.6;
		margin-bottom: 1.2rem;
	}

	.gov-modules-box {
		background: rgba(5, 12, 24, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 10px;
		padding: 0.85rem 1rem;
		margin-bottom: 1.2rem;
	}
	.modules-heading {
		font-family: 'Courier New', monospace;
		font-size: 0.68rem;
		font-weight: 800;
		color: #38bdf8;
		letter-spacing: 0.08em;
		margin-bottom: 0.5rem;
	}
	.modules-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.8rem;
		color: #cbd5e1;
	}
	.modules-list li {
		display: flex;
		align-items: flex-start;
		gap: 0.45rem;
		line-height: 1.4;
	}
	.mod-check {
		color: #10b981;
		font-weight: 800;
	}

	.gov-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-bottom: 1.4rem;
	}
	.gov-tag {
		font-size: 0.72rem;
		padding: 0.2rem 0.55rem;
		border-radius: 6px;
		background: rgba(56, 189, 248, 0.08);
		border: 1px solid rgba(56, 189, 248, 0.25);
		color: #7dd3fc;
	}

	.btn-specs-primary {
		width: 100%;
		padding: 0.7rem;
		border-radius: 8px;
		background: linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(14, 165, 233, 0.1) 100%);
		border: 1px solid rgba(56, 189, 248, 0.5);
		color: #f0f9ff;
		font-size: 0.85rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
	}
	.btn-specs-primary:hover {
		background: #38bdf8;
		color: #030712;
		box-shadow: 0 0 20px rgba(56, 189, 248, 0.5);
	}

	/* 🎛️ CONTROLS BAR: SEARCH & TABS */
	.project-controls-bar {
		margin-bottom: 2.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
	}

	.search-wrap {
		position: relative;
		width: 100%;
	}
	.search-icon {
		position: absolute;
		left: 1.1rem;
		top: 50%;
		transform: translateY(-50%);
		font-size: 1.1rem;
		color: #64748b;
	}
	.project-search-input {
		width: 100%;
		padding: 0.85rem 3rem 0.85rem 3rem;
		background: rgba(11, 23, 42, 0.75);
		border: 1px solid rgba(0, 240, 255, 0.25);
		border-radius: 12px;
		color: #f8fafc;
		font-size: 0.95rem;
		outline: none;
		backdrop-filter: blur(12px);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}
	.project-search-input:focus {
		border-color: #00f0ff;
		box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
	}
	.clear-search-btn {
		position: absolute;
		right: 1.1rem;
		top: 50%;
		transform: translateY(-50%);
		background: transparent;
		border: none;
		color: #94a3b8;
		font-size: 1rem;
		cursor: pointer;
	}

	.category-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 0.55rem;
	}
	.pill-btn {
		background: rgba(15, 31, 56, 0.6);
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: #94a3b8;
		padding: 0.5rem 1.1rem;
		border-radius: 100px;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}
	.pill-btn:hover {
		border-color: #00f0ff;
		color: #00f0ff;
		transform: translateY(-1px);
	}
	.pill-btn.active {
		background: linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(2, 132, 199, 0.2) 100%);
		border-color: #00f0ff;
		color: #00f0ff;
		box-shadow: 0 0 15px rgba(0, 240, 255, 0.25);
	}
	.pill-count {
		font-size: 0.72rem;
		opacity: 0.8;
	}

	/* 📦 PROJECTS GRID */
	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
		gap: 2rem;
		margin-bottom: 4rem;
	}

	.project-card-vault {
		position: relative;
		border-radius: 16px;
		padding: 1.8rem;
		background: rgba(11, 23, 42, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		overflow: hidden;
		transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
	}
	.project-card-vault:hover {
		transform: translateY(-6px);
		border-color: var(--proj-accent);
		box-shadow:
			0 18px 45px rgba(0, 0, 0, 0.6),
			0 0 30px rgba(0, 240, 255, 0.15);
	}

	.card-glow-bg {
		position: absolute;
		inset: 0;
		opacity: 0.7;
		pointer-events: none;
		transition: opacity 0.3s;
	}
	.project-card-vault:hover .card-glow-bg {
		opacity: 1;
	}

	.card-header-row {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.1rem;
		z-index: 1;
	}
	.card-icon-avatar {
		width: 44px;
		height: 44px;
		border-radius: 12px;
		border: 1.5px solid;
		background: rgba(15, 31, 56, 0.85);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.35rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}
	.card-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.badge {
		font-family: 'Courier New', monospace;
		font-size: 0.66rem;
		font-weight: 800;
		padding: 0.25rem 0.65rem;
		border-radius: 100px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.badge-gov {
		background: rgba(56, 189, 248, 0.15);
		color: #38bdf8;
		border: 1px solid rgba(56, 189, 248, 0.4);
	}
	.badge-enterprise {
		background: rgba(34, 197, 94, 0.15);
		color: #4ade80;
		border: 1px solid rgba(34, 197, 94, 0.4);
	}
	.badge-production {
		background: rgba(212, 175, 55, 0.15);
		color: #d4af37;
		border: 1px solid rgba(212, 175, 55, 0.4);
	}
	.badge-innovation {
		background: rgba(0, 240, 255, 0.15);
		color: #00f0ff;
		border: 1px solid rgba(0, 240, 255, 0.4);
	}
	.badge-academic {
		background: rgba(168, 85, 247, 0.15);
		color: #c084fc;
		border: 1px solid rgba(168, 85, 247, 0.4);
	}

	.card-body {
		position: relative;
		z-index: 1;
		margin-bottom: 1.2rem;
	}
	.card-context {
		font-family: 'Courier New', monospace;
		font-size: 0.72rem;
		color: #94a3b8;
		margin-bottom: 0.45rem;
	}
	.context-label {
		color: #64748b;
	}
	.context-val {
		color: #cbd5e1;
		font-weight: 600;
	}

	.card-title {
		font-size: 1.2rem;
		font-weight: 700;
		color: #f8fafc;
		line-height: 1.35;
		margin-bottom: 0.35rem;
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
		margin-bottom: 1rem;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.features-preview {
		list-style: none;
		padding: 0;
		margin: 0 0 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-size: 0.78rem;
		color: #cbd5e1;
	}
	.features-preview li {
		display: flex;
		align-items: flex-start;
		gap: 0.4rem;
		line-height: 1.35;
	}
	.feat-bullet {
		font-weight: 900;
		flex-shrink: 0;
	}

	.tags-cloud {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}
	.proj-tag {
		font-size: 0.7rem;
		padding: 0.18rem 0.5rem;
		border-radius: 6px;
		background: rgba(15, 31, 56, 0.7);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: #cbd5e1;
	}

	.card-footer-row {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}
	.btn-card-specs {
		flex: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		padding: 0.55rem 0.9rem;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.18);
		border-radius: 8px;
		color: #f8fafc;
		font-size: 0.8rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s;
	}
	.btn-card-specs:hover {
		background: var(--proj-accent);
		color: #030712;
		border-color: var(--proj-accent);
		box-shadow: 0 0 14px var(--proj-accent);
	}
	.btn-card-doc {
		display: inline-flex;
		align-items: center;
		padding: 0.55rem 0.9rem;
		background: rgba(212, 175, 55, 0.12);
		border: 1px solid rgba(212, 175, 55, 0.35);
		border-radius: 8px;
		color: #d4af37;
		font-size: 0.8rem;
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
		padding: 4rem 1rem;
		background: rgba(11, 23, 42, 0.6);
		border: 1px dashed rgba(255, 255, 255, 0.15);
		border-radius: 16px;
	}
	.empty-glyph {
		font-size: 2.5rem;
		margin-bottom: 1rem;
	}

	/* Bottom CTA */
	.projects-cta {
		background: linear-gradient(135deg, rgba(14, 30, 56, 0.85) 0%, rgba(7, 15, 29, 0.95) 100%);
		border: 1px solid rgba(0, 240, 255, 0.3);
		padding: 2.5rem;
		border-radius: 20px;
	}
	.cta-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		flex-wrap: wrap;
	}
	.cta-text h3 {
		font-size: 1.4rem;
		font-weight: 700;
		color: #f8fafc;
		margin-bottom: 0.35rem;
	}
	.cta-text p {
		color: #94a3b8;
		font-size: 0.92rem;
	}

	/* 🔍 MODAL STYLING */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(3, 7, 18, 0.82);
		backdrop-filter: blur(12px);
		z-index: 1000;
	}
	.specs-modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: min(720px, calc(100vw - 2.5rem));
		max-height: calc(100vh - 4rem);
		background: rgba(10, 22, 42, 0.96);
		border: 1px solid var(--modal-accent);
		border-radius: 20px;
		box-shadow:
			0 25px 80px rgba(0, 0, 0, 0.85),
			0 0 50px rgba(0, 240, 255, 0.25);
		z-index: 1001;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}
	@keyframes modalFadeIn {
		from {
			opacity: 0;
			transform: translate(-50%, -46%) scale(0.96);
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
		background: rgba(15, 31, 56, 0.8);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
		background: rgba(255, 255, 255, 0.1);
		color: #e2e8f0;
	}
	.modal-title {
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
		border: 1px solid rgba(255, 255, 255, 0.15);
		color: #cbd5e1;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 1.1rem;
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
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		padding: 0.7rem 1rem;
		font-size: 0.86rem;
		color: #cbd5e1;
	}
	.modal-context-strip .dim {
		color: #94a3b8;
		margin-right: 0.4rem;
	}

	.modal-section-title {
		font-size: 0.95rem;
		font-weight: 700;
		color: #f8fafc;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-family: 'Courier New', monospace;
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
		font-size: 0.78rem;
		padding: 0.3rem 0.75rem;
		border-radius: 6px;
		background: rgba(15, 31, 56, 0.9);
		border: 1px solid rgba(255, 255, 255, 0.15);
		color: #e2e8f0;
	}

	.modal-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.8rem;
		padding: 1.2rem 2rem;
		background: rgba(11, 23, 42, 0.95);
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	@media (max-width: 768px) {
		.gov-vault-container {
			padding: 1.5rem;
		}
		.gov-grid {
			grid-template-columns: 1fr;
		}
		.projects-grid {
			grid-template-columns: 1fr;
		}
		.modal-header,
		.modal-body,
		.modal-footer {
			padding: 1.2rem;
		}
	}
</style>
