<script lang="ts">
	import {
		acquireScrollLock,
		releaseScrollLock,
		hasOpenModal,
		keyboardScrollRegion
	} from '$lib/deck/focus-utils';
	import { lang } from '$lib/i18n';
	import { translations } from '$lib/translations';
	import { derived } from 'svelte/store';

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
		image?: string;
		docHref?: string;
		demoHref?: string;
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
			isGov: true,
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
			isGov: true,
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
			isGov: true,
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
			image: '/images/9router_office_3d.png',
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
			image: '/images/baby_kicking_logo.png',
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
			docHref: '/docs/iwa001-case-study.pdf',
			tags: ['SvelteKit 2', 'TypeScript', 'Supabase RLS', 'JWT Auth', 'Admin Panel', 'Vercel Edge']
		},
		{
			id: 'onboardx',
			key: 'onboardx',
			context: 'Tenaga Nasional Berhad (TNB)',
			category: 'web',
			badgeKey: 'enterprise',
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
			docHref: '/docs/infinity-landing-case-study.pdf',
			tags: ['SvelteKit', 'i18n Store (3 Bahasa)', 'Redis Cache', 'Resend API', 'Vercel Edge']
		},
		{
			id: 'orbit_pulse',
			key: 'orbit_pulse',
			context: 'Infrastruktur & Pemantauan Telemetri Pelayan',
			category: 'sim',
			badgeKey: 'innovation',
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
			tags: ['Modular Kanban', 'Pomodoro Focus Timer', 'Local State Machine', 'Zero Bloat']
		},
		{
			id: 'sudoku',
			key: 'sudoku',
			context: 'Algoritma Sains Komputer & Pelanjutan Pelayar',
			category: 'sim',
			badgeKey: 'innovation',
			tags: ['Procedural Generator', 'Backtracking Solver', 'Chromium Extension', 'Dark UI']
		},
		{
			id: 'utm-fyp',
			key: 'fyp',
			context: 'Universiti Teknologi Malaysia (UTM FYP)',
			category: 'web',
			badgeKey: 'academic',
			tags: [
				'Google Maps API',
				'Marker Clustering',
				'SvelteKit',
				'Supabase PostgreSQL',
				'Figma UI/UX'
			]
		}
	];

	type ProjectCopy = {
		title: string;
		subtitle: string;
		desc: string;
		features?: readonly string[];
	};
	function projectCopy(project: ProjectItem): ProjectCopy {
		return translations[$lang].projects[project.key] as ProjectCopy;
	}
	const categories = ['all', 'gov', 'ai', 'mobile', 'web', 'sim'] as const;
	const contexts: Record<string, string> = {
		emesys: 'YHCM · Asset management',
		sutera: 'YHCM · Operations & maintenance',
		adims: 'YHCM · Digital archives',
		tindak: 'Personal project · Android automation',
		nine_router: 'AI orchestration & virtual office',
		cv_bot: 'Desktop automation & computer vision',
		baby_kicking: 'Maternal health · Mobile application',
		tax_relief: 'Fintech · Malaysian tax calculation',
		jiofarm: 'Agri-tech · Smart farming',
		lumina: 'Lumina Glass Studio',
		foony_9ball: 'Game physics · Browser extension',
		sudoku: 'Algorithms · Browser extension'
	};
	const context = (project: ProjectItem) =>
		$lang === 'en' ? (contexts[project.id] ?? project.context) : project.context;
	// Existing project inventory; production and experimental work retain their own labels.
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
			const projectTrans = projectCopy(p);
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
		if (selectedProject || hasOpenModal()) return;
		selectedProject = project;
	}

	function closeSpecs() {
		selectedProject = null;
	}

	function focusDialog(node: HTMLDialogElement) {
		const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		node.showModal();
		acquireScrollLock();
		node.querySelector<HTMLButtonElement>('.modal-close-btn')?.focus();
		return {
			destroy() {
				node.close();
				releaseScrollLock();
				if (previous?.isConnected) previous.focus({ preventScroll: true });
			}
		};
	}
</script>

<section id="projects" class="selected-work" aria-labelledby="projects-title">
	<div class="section">
		<header class="section-header">
			<p class="section-label">{$t.label}</p>
			<h2 id="projects-title">{$t.title}</h2>
			<p class="section-desc">{$t.desc}</p>
		</header>
		<div class="project-controls">
			<label class="search-label" for="project-search"
				>{$lang === 'ms' ? 'Cari hasil kerja' : 'Search the work'}<input
					id="project-search"
					type="search"
					bind:value={searchQuery}
					placeholder={$lang === 'ms' ? 'Nama projek atau teknologi' : 'Project name or technology'}
				/></label
			>
			<div
				class="filters"
				role="group"
				aria-label={$lang === 'ms' ? 'Kategori projek' : 'Project categories'}
			>
				{#each categories as category}<button
						type="button"
						aria-pressed={activeFilter === category}
						onclick={() => (activeFilter = category)}>{$t[`filter_${category}`]}</button
					>{/each}
			</div>
		</div>
		<p class="results-count" role="status">
			{filteredProjects.length}
			{$lang === 'ms' ? 'projek dipaparkan' : 'projects shown'}
		</p>
		<div class="projects-grid">
			{#each filteredProjects as project (project.id)}
				{@const data = projectCopy(project)}
				<article class="project-card">
					<div class="card-top">
						<span class="project-number"
							>{String(allProjects.indexOf(project) + 1).padStart(2, '0')}</span
						><span>{$t[project.badgeKey]}</span>
					</div>
					<p class="context">{context(project)}</p>
					<h3>{data.title}</h3>
					<p class="subtitle">{data.subtitle}</p>
					<p class="description">{data.desc}</p>
					<div class="tags">
						{#each project.tags.slice(0, 4) as tag}<span>{tag}</span>{/each}
					</div>
					<div class="card-actions">
						<button
							type="button"
							onclick={() => openSpecs(project)}
							aria-label={`${$t.specs_btn}: ${data.title}`}
							>{$t.specs_btn} <span aria-hidden="true">↗</span></button
						>{#if project.docHref}<a
								href={project.docHref}
								target="_blank"
								rel="noreferrer"
								aria-label={`PDF ↗ — ${$t.view_doc}: ${data.title} (${$lang === 'ms' ? 'tab baharu' : 'new tab'})`}
								>PDF ↗</a
							>{/if}
					</div>
				</article>
			{:else}
				<div class="empty-state">
					<h3>{$lang === 'ms' ? 'Tiada projek ditemui.' : 'No projects found.'}</h3>
					<p>
						{$lang === 'ms'
							? 'Cuba kata kunci lain atau tetapkan semula penapis.'
							: 'Try another keyword or reset the filters.'}
					</p>
					<button
						type="button"
						onclick={() => {
							searchQuery = '';
							activeFilter = 'all';
						}}>{$lang === 'ms' ? 'Tetapkan semula' : 'Reset filters'}</button
					>
				</div>
			{/each}
		</div>
		<div class="work-note">
			<p>
				{$lang === 'ms'
					? 'Sistem sektor awam diterangkan secara umum untuk menjaga kerahsiaan. Projek peribadi dan eksperimen dilabel berasingan daripada sistem pengeluaran.'
					: 'Public-sector systems are described at a high level to respect confidentiality. Personal projects and experiments are labelled separately from production systems.'}
			</p>
			<a href="#contact">{$t.cta_btn} ↗</a>
		</div>
	</div>
</section>

{#if selectedProject}
	{@const data = projectCopy(selectedProject)}
	<dialog
		class="project-dialog"
		aria-labelledby="project-dialog-title"
		use:focusDialog
		oncancel={(event) => {
			event.preventDefault();
			closeSpecs();
		}}
	>
		<header class="modal-header">
			<div>
				<p class="modal-label">{$t[selectedProject.badgeKey]}</p>
				<h2 id="project-dialog-title">{data.title}</h2>
				<p>{data.subtitle}</p>
			</div>
			<button
				class="modal-close-btn"
				type="button"
				onclick={closeSpecs}
				aria-label={$lang === 'ms' ? 'Tutup dialog' : 'Close dialog'}>×</button
			>
		</header>
		<div class="modal-body" use:keyboardScrollRegion role="region" aria-label={$t.specs_arch}>
			<p class="modal-context">{context(selectedProject)}</p>
			{#if selectedProject.image}<img
					src={selectedProject.image}
					alt={data.title}
					loading="lazy"
				/>{/if}
			<h3>{$t.specs_arch}</h3>
			<p>{data.desc}</p>
			{#if data.features?.length}<h3>{$t.specs_modules}</h3>
				<ul>
					{#each data.features as feature}<li>{feature}</li>{/each}
				</ul>{/if}
			<h3>{$lang === 'ms' ? 'Teknologi & alatan' : 'Technologies & tools'}</h3>
			<div class="modal-tags">
				{#each selectedProject.tags as tag}<span class="tag">{tag}</span>{/each}
			</div>
		</div>
		<footer class="modal-footer">
			{#if selectedProject.docHref}<a
					class="btn"
					href={selectedProject.docHref}
					target="_blank"
					rel="noreferrer"
					>{$t.view_doc} ↗<span class="sr-only">{$lang === 'ms' ? 'tab baharu' : 'new tab'}</span
					></a
				>{/if}<button type="button" class="btn btn-primary" onclick={closeSpecs}
				>{$t.close_modal}</button
			>
		</footer>
	</dialog>
{/if}

<style>
	.selected-work {
		background: #262520;
		color: #f3eee6;
		--line: #656158;
	}
	.section-label {
		color: #dfb79c;
	}
	.section-desc {
		color: #c8bfb2;
	}
	.project-controls {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}
	.search-label {
		font-size: 0.75rem;
		width: min(100%, 480px);
	}
	input {
		width: 100%;
		display: block;
		margin-top: 0.5rem;
		min-height: 48px;
		border: 1px solid #8c8376;
		border-radius: 0;
		background: #302e28;
		color: #f3eee6;
		padding: 0.75rem;
		font-size: 1rem;
	}
	input::placeholder {
		color: #c8bfb2;
	}
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.filters button,
	.empty-state button {
		border: 1px solid #8c8376;
		color: #f3eee6;
		background: transparent;
		min-height: 44px;
		padding: 0.5rem 0.9rem;
		font-size: 0.8rem;
	}
	.filters button[aria-pressed='true'],
	.filters button:hover {
		color: #262520;
		background: #f3eee6;
		border-color: #f3eee6;
	}
	.results-count {
		color: #c8bfb2;
		font-size: 0.75rem;
		margin: 1.5rem 0 1rem;
	}
	.projects-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0 2rem;
	}
	.project-card {
		min-width: 0;
		border-top: 1px solid #8c8376;
		padding: 1.5rem 0 2rem;
		display: flex;
		flex-direction: column;
	}
	.card-top {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: baseline;
		font-size: 0.68rem;
		color: #dfb79c;
		margin-bottom: 1.5rem;
	}
	.project-number {
		font:
			2rem/1 Georgia,
			serif;
	}
	.context {
		color: #c8bfb2;
		font-size: 0.68rem;
		margin-bottom: 0.7rem;
	}
	h3 {
		font-size: 1.9rem;
		overflow-wrap: anywhere;
	}
	.subtitle {
		color: #dfb79c;
		font-size: 0.8rem;
		margin-top: 0.6rem;
	}
	.description {
		color: #d5cdbf;
		font-size: 0.85rem;
		margin-top: 1rem;
	}
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 0.7rem;
		margin-top: 1.25rem;
		padding-bottom: 1.5rem;
		font-size: 0.67rem;
		color: #c8bfb2;
	}
	.card-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-top: auto;
	}
	.card-actions button,
	.card-actions a,
	.work-note a {
		display: inline-flex;
		align-items: center;
		justify-content: space-between;
		min-height: 44px;
		gap: 1rem;
		color: #f3eee6;
		background: none;
		border: 0;
		border-bottom: 1px solid #8c8376;
		padding: 0.5rem 0;
		font-size: 0.8rem;
		text-decoration: none;
	}
	.card-actions button:hover,
	.card-actions a:hover,
	.work-note a:hover {
		color: #dfb79c;
	}
	.work-note {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1rem 3rem;
		border-top: 1px solid #8c8376;
		padding-top: 2rem;
		margin-top: 2rem;
	}
	.work-note p {
		color: #c8bfb2;
		max-width: 78ch;
		font-size: 0.8rem;
	}
	.empty-state {
		grid-column: 1 / -1;
		padding: 3rem 0;
	}
	.empty-state p {
		margin: 1rem 0;
	}
	.selected-work :focus-visible {
		outline-color: #e2b89a;
	}
	.project-dialog {
		width: min(820px, calc(100% - 32px));
		max-width: none;
		max-height: calc(100dvh - 32px);
		margin: auto;
		padding: 0;
		border: 1px solid #897b6b;
		background: #f3eee6;
		color: #201e1b;
	}
	.project-dialog[open] {
		display: flex;
		flex-direction: column;
	}
	.project-dialog::backdrop {
		background: #201e1baa;
	}
	.modal-header {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 2rem;
		border-bottom: 1px solid #c8bfb2;
	}
	.modal-header h2 {
		font-size: clamp(2rem, 5vw, 3rem);
	}
	.modal-header p {
		color: #645a4f;
		font-size: 0.85rem;
		margin-top: 0.5rem;
	}
	.modal-header .modal-label {
		color: #75442b;
		margin: 0 0 0.75rem;
		font-size: 0.7rem;
	}
	.modal-close-btn {
		background: none;
		border: 1px solid #897b6b;
		width: 44px;
		height: 44px;
		flex-shrink: 0;
		font-size: 1.5rem;
	}
	.modal-body {
		overflow-y: auto;
		min-height: 0;
		padding: 2rem;
		overscroll-behavior: contain;
	}
	.modal-body img {
		max-height: 280px;
		display: block;
		object-fit: contain;
		margin: 1.5rem auto;
	}
	.modal-context {
		color: #75442b;
		font-size: 0.8rem;
	}
	.modal-body h3 {
		font-size: 1.5rem;
		margin: 1.5rem 0 0.75rem;
	}
	.modal-body p,
	.modal-body li {
		font-size: 0.9rem;
	}
	.modal-body ul {
		padding-left: 1.2rem;
	}
	.modal-body li {
		margin-block: 0.6rem;
	}
	.modal-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.modal-footer {
		display: flex;
		justify-content: flex-end;
		flex-wrap: wrap;
		gap: 0.75rem;
		padding: 1.25rem 2rem;
		border-top: 1px solid #c8bfb2;
	}
	@media (max-width: 1000px) {
		.projects-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 599px) {
		.projects-grid {
			grid-template-columns: 1fr;
		}
		.modal-header,
		.modal-body {
			padding: 1.25rem;
		}
		.modal-footer {
			padding: 1rem;
		}
		.project-dialog {
			width: calc(100% - 16px);
			max-height: calc(100dvh - 16px);
		}
	}
</style>
