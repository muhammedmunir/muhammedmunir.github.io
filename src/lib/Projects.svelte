<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { lang } from '$lib/i18n';
	import { translations } from '$lib/translations';
	import { derived } from 'svelte/store';
	import { playBlip } from '$lib/sound';

	let hoveredCard: number | null = $state(null);
	let activeFilter = $state<string>('all');

	const t = derived(lang, ($l) => translations[$l].projects);

	interface ProjectItem {
		id: string;
		key: 'iwa001' | 'tindak' | 'cv_bot' | 'lumina' | 'onboardx' | 'infinity' | 'fyp';
		context: string;
		category: 'enterprise' | 'ai' | 'web' | 'mobile';
		badgeKey: 'production' | 'enterprise' | 'innovation' | 'academic';
		accent: string;
		icon: string;
		docHref?: string;
		gradient: string;
		tags: string[];
	}

	const projects: ProjectItem[] = [
		{
			id: 'iwa001',
			key: 'iwa001',
			context: 'Nova Bitara Development Sdn Bhd',
			category: 'enterprise',
			badgeKey: 'production',
			accent: '#D4AF37',
			icon: '🔐',
			docHref: '/docs/iwa001-case-study.pdf',
			gradient: 'linear-gradient(135deg,rgba(212,175,55,0.12) 0%,rgba(15,31,51,0.5) 100%)',
			tags: ['SvelteKit 2', 'TypeScript', 'Supabase RLS', 'JWT Auth', 'Vercel Edge', 'GoDaddy']
		},
		{
			id: 'tindak',
			key: 'tindak',
			context: 'Personal Innovation / Android Architecture',
			category: 'mobile',
			badgeKey: 'innovation',
			accent: '#00F0FF',
			icon: '⚡',
			gradient: 'linear-gradient(135deg,rgba(0,240,255,0.12) 0%,rgba(10,24,45,0.5) 100%)',
			tags: [
				'Flutter',
				'Android Share Intent',
				'Supabase Edge Functions',
				'Gemini AI',
				'Local-First Engine',
				'RLS Test Suite'
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
			gradient: 'linear-gradient(135deg,rgba(236,72,153,0.12) 0%,rgba(20,10,35,0.5) 100%)',
			tags: [
				'Python 3',
				'OpenCV',
				'Win32 API',
				'CustomTkinter',
				'SIFT Homography',
				'CIELAB L*a*b*',
				'OCR'
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
			gradient: 'linear-gradient(135deg,rgba(56,189,248,0.12) 0%,rgba(15,31,51,0.5) 100%)',
			tags: [
				'SvelteKit',
				'Laravel 11',
				'SQLite',
				'Tailwind CSS',
				'Interactive LED Kelvin Visualizer',
				'PHPUnit Feature Tests'
			]
		},
		{
			id: 'onboardx',
			key: 'onboardx',
			context: 'Tenaga Nasional Berhad (TNB)',
			category: 'enterprise',
			badgeKey: 'enterprise',
			accent: '#22C55E',
			icon: '⚡',
			gradient: 'linear-gradient(135deg,rgba(34,197,94,0.12) 0%,rgba(10,30,20,0.5) 100%)',
			tags: [
				'Flutter',
				'Firebase',
				'MongoDB',
				'Supabase',
				'Microsoft Azure',
				'Jenkins CI/CD',
				'Kubernetes'
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
			gradient: 'linear-gradient(135deg,rgba(96,165,250,0.12) 0%,rgba(15,31,51,0.5) 100%)',
			tags: [
				'SvelteKit',
				'Svelte Store i18n (3 Languages)',
				'Redis Subscriber Blog',
				'Resend API',
				'Vercel'
			]
		},
		{
			id: 'utm-fyp',
			key: 'fyp',
			context: 'Universiti Teknologi Malaysia (UTM)',
			category: 'web',
			badgeKey: 'academic',
			accent: '#A78BFA',
			icon: '🗺️',
			gradient: 'linear-gradient(135deg,rgba(167,139,250,0.12) 0%,rgba(25,15,40,0.5) 100%)',
			tags: [
				'SvelteKit',
				'Google Maps API',
				'Marker Clustering',
				'Supabase PostgreSQL',
				'Figma UI/UX'
			]
		}
	];

	let filteredProjects = $derived(
		activeFilter === 'all'
			? projects
			: projects.filter((p) => {
					if (activeFilter === 'enterprise') return p.category === 'enterprise';
					if (activeFilter === 'ai') return p.category === 'ai' || p.badgeKey === 'innovation';
					if (activeFilter === 'web') return p.category === 'web';
					if (activeFilter === 'mobile')
						return p.category === 'mobile' || p.tags.includes('Flutter');
					return true;
				})
	);

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);
		gsap.fromTo(
			'.projects-header',
			{ opacity: 0, y: 30 },
			{
				opacity: 1,
				y: 0,
				duration: 0.8,
				scrollTrigger: { trigger: '.projects-header', start: 'top 90%' }
			}
		);
	});

	function setFilter(f: string) {
		activeFilter = f;
		playBlip(620, 0.04);
	}
</script>

<section id="projects">
	<div class="section">
		<div class="section-header projects-header">
			<div class="section-label">{$t.label}</div>
			<h2>{$t.title}</h2>
			<p class="section-desc">{$t.desc}</p>
			<div class="section-divider"></div>

			<!-- Category Filter Pills -->
			<div class="filter-bar" role="tablist">
				<button
					class="filter-pill"
					class:active={activeFilter === 'all'}
					onclick={() => setFilter('all')}
					role="tab"
					aria-selected={activeFilter === 'all'}
				>
					{$t.filter_all}
				</button>
				<button
					class="filter-pill"
					class:active={activeFilter === 'enterprise'}
					onclick={() => setFilter('enterprise')}
					role="tab"
					aria-selected={activeFilter === 'enterprise'}
				>
					{$t.filter_enterprise}
				</button>
				<button
					class="filter-pill"
					class:active={activeFilter === 'ai'}
					onclick={() => setFilter('ai')}
					role="tab"
					aria-selected={activeFilter === 'ai'}
				>
					{$t.filter_ai}
				</button>
				<button
					class="filter-pill"
					class:active={activeFilter === 'mobile'}
					onclick={() => setFilter('mobile')}
					role="tab"
					aria-selected={activeFilter === 'mobile'}
				>
					{$t.filter_mobile}
				</button>
				<button
					class="filter-pill"
					class:active={activeFilter === 'web'}
					onclick={() => setFilter('web')}
					role="tab"
					aria-selected={activeFilter === 'web'}
				>
					{$t.filter_web}
				</button>
			</div>
		</div>

		<div class="projects-grid">
			{#each filteredProjects as project, i (project.id)}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<article
					class="project-card card"
					id="project-{project.id}"
					onmouseenter={() => {
						hoveredCard = i;
						playBlip(550, 0.03);
					}}
					onmouseleave={() => (hoveredCard = null)}
					style="background:{hoveredCard === i ? project.gradient : 'var(--card-bg)'};"
				>
					<div class="project-top">
						<div
							class="project-icon-wrap"
							style="border-color:{project.accent}33;background:{project.accent}15;"
						>
							<span class="project-icon" role="img" aria-label={$t[project.key].title}
								>{project.icon}</span
							>
						</div>
						<div class="project-badges">
							<span
								class="project-badge"
								style="color:{project.accent};background:{project.accent}15;border-color:{project.accent}35;"
							>
								{$t[project.badgeKey]}
							</span>
						</div>
					</div>

					<div class="project-content">
						<h3 class="project-title">{$t[project.key].title}</h3>
						<p class="project-subtitle" style="color:{project.accent}">
							{$t[project.key].subtitle}
						</p>
						<p class="project-context">
							<svg
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg
							>
							{project.context}
						</p>
						<p class="project-desc">{$t[project.key].desc}</p>
						<ul class="project-features" role="list">
							{#each $t[project.key].features as feat}
								<li>
									<span class="feat-dot" style="background:{project.accent}" aria-hidden="true"
									></span>
									{feat}
								</li>
							{/each}
						</ul>
					</div>

					<div class="project-footer">
						<div class="project-tags">
							{#each project.tags as tag}
								<span class="tag">{tag}</span>
							{/each}
						</div>

						{#if project.docHref}
							<div class="project-actions">
								<a
									href={project.docHref}
									target="_blank"
									rel="noopener noreferrer"
									class="btn-doc-link"
									style="border-color:{project.accent}44; color:{project.accent};"
								>
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
										<polyline points="14 2 14 8 20 8"></polyline>
									</svg>
									{$t.view_doc}
								</a>
							</div>
						{/if}
					</div>

					<div
						class="project-corner"
						style="border-color:{project.accent};"
						aria-hidden="true"
					></div>
				</article>
			{/each}
		</div>

		<div class="projects-cta">
			<p>{$t.cta}</p>
			<a href="#contact" class="btn btn-outline" id="view-more-projects">{$t.cta_btn}</a>
		</div>
	</div>
</section>

<style>
	section {
		background: var(--navy-dark);
		position: relative;
	}
	section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent);
	}
	.section-desc {
		font-size: 1rem;
		color: var(--text-muted);
		margin-top: 0.75rem;
	}

	/* Filter Bar */
	.filter-bar {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 2rem;
	}
	.filter-pill {
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(212, 175, 55, 0.2);
		color: var(--text-secondary);
		font-family: var(--font-body);
		font-size: 0.82rem;
		font-weight: 600;
		padding: 0.5rem 1.15rem;
		border-radius: 50px;
		cursor: pointer;
		transition: all 0.25s ease;
	}
	.filter-pill:hover {
		color: var(--gold);
		border-color: rgba(212, 175, 55, 0.5);
		background: rgba(212, 175, 55, 0.08);
	}
	.filter-pill.active {
		background: linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(212, 175, 55, 0.08));
		border-color: var(--gold);
		color: var(--gold);
		box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
	}

	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
		gap: 1.75rem;
	}
	.project-card {
		padding: 2.25rem 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		position: relative;
		overflow: hidden;
		transition:
			border-color 0.4s cubic-bezier(0.4, 0, 0.2, 1),
			box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1),
			transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		border: 1px solid rgba(255, 255, 255, 0.08);
	}
	.project-card:hover {
		transform: translateY(-5px);
		box-shadow:
			0 12px 40px rgba(0, 0, 0, 0.5),
			0 0 25px rgba(212, 175, 55, 0.15);
	}
	.project-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.project-icon-wrap {
		width: 54px;
		height: 54px;
		border: 1px solid;
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.6rem;
	}
	.project-badges {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}
	.project-badge {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 0.3rem 0.8rem;
		border-radius: 100px;
		border: 1px solid;
	}
	.project-content {
		flex: 1;
	}
	.project-title {
		font-size: 1.3rem;
		color: var(--text-primary);
		margin-bottom: 0.3rem;
		line-height: 1.3;
	}
	.project-subtitle {
		font-size: 0.84rem;
		font-weight: 600;
		letter-spacing: 0.03em;
		margin-bottom: 0.4rem;
	}
	.project-context {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.78rem;
		color: var(--text-muted);
		margin-bottom: 0.95rem;
	}
	.project-desc {
		font-size: 0.88rem;
		color: var(--text-secondary);
		line-height: 1.75;
		margin-bottom: 1.15rem;
	}
	.project-features {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}
	.project-features li {
		display: flex;
		align-items: flex-start;
		gap: 0.55rem;
		font-size: 0.845rem;
		color: var(--text-secondary);
		line-height: 1.5;
	}
	.feat-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		flex-shrink: 0;
		margin-top: 7px;
	}

	.project-footer {
		margin-top: auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding-top: 0.5rem;
	}
	.project-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.project-actions {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding-top: 0.5rem;
		border-top: 1px dashed rgba(255, 255, 255, 0.08);
	}
	.btn-doc-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid;
		padding: 0.4rem 0.9rem;
		border-radius: 6px;
		font-family: var(--font-body);
		font-size: 0.78rem;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s;
	}
	.btn-doc-link:hover {
		background: rgba(255, 255, 255, 0.1);
		transform: translateX(3px);
	}

	.project-corner {
		position: absolute;
		top: 0;
		right: 0;
		width: 45px;
		height: 45px;
		border-top: 2px solid;
		border-right: 2px solid;
		border-top-right-radius: var(--radius-lg);
		opacity: 0.3;
		transition: opacity 0.3s;
		pointer-events: none;
	}
	.project-card:hover .project-corner {
		opacity: 0.85;
	}

	.projects-cta {
		text-align: center;
		margin-top: 3.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}
	.projects-cta p {
		font-size: 0.95rem;
		color: var(--text-muted);
	}

	@media (max-width: 640px) {
		.projects-grid {
			grid-template-columns: 1fr;
		}
		.project-card {
			padding: 1.6rem 1.25rem;
		}
		.filter-bar {
			gap: 0.35rem;
		}
		.filter-pill {
			padding: 0.4rem 0.85rem;
			font-size: 0.75rem;
		}
	}
</style>
