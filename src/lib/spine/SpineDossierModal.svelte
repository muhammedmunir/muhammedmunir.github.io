<script lang="ts">
	import {
		PROFILE,
		TECHNICAL_SKILLS,
		CAREER_TIMELINE,
		EDUCATION_HISTORY,
		CERTIFICATIONS,
		PROJECT_ARCHIVE,
		type Locale
	} from './spine-data';
	import { trapFocus } from './modal-focus';

	interface Props {
		open: boolean;
		locale: Locale;
		onClose: () => void;
		onJumpStation: (stationIndex: number) => void;
		returnFocusTo?: HTMLElement | null;
	}

	let { open, locale, onClose, onJumpStation, returnFocusTo = null }: Props = $props();

	let activeTab = $state<'career' | 'projects' | 'skills' | 'education'>('career');

	const stationIndexMap: Record<string, number> = {
		core: 0,
		enterprise: 1,
		network: 2,
		ai_vision: 3,
		mobility: 4,
		terminal: 5
	};
</script>

{#if open}
	<div class="dossier-backdrop" role="presentation">
		<button
			type="button"
			class="backdrop-dismiss"
			aria-label={locale === 'ms' ? 'Tutup arkib penuh' : 'Close full archive'}
			onclick={onClose}
		></button>

		<div
			class="dossier-sheet"
			role="dialog"
			aria-modal="true"
			aria-labelledby="dossier-modal-title"
			tabindex="-1"
			use:trapFocus={{ enabled: open, onClose, initialFocusSelector: '.close-btn', returnFocusTo }}
		>
			<header class="dossier-header">
				<div class="header-identity">
					<img
						src={PROFILE.profilePhoto}
						alt={PROFILE.fullName}
						class="header-avatar"
						width="52"
						height="52"
					/>
					<div>
						<p class="dossier-kicker">
							{locale === 'ms'
								? 'REKOD CV RASMI • MUHAMMED MUNIR BIN MOHD AZMI'
								: 'OFFICIAL CV RECORD • MUHAMMED MUNIR BIN MOHD AZMI'}
						</p>
						<h2 id="dossier-modal-title">
							{locale === 'ms'
								? 'Arkib Penuh Pengalaman, Projek, Kemahiran & Pendidikan'
								: 'Complete Experience, Projects, Skills & Education Archive'}
						</h2>
					</div>
				</div>

				<div class="dossier-actions">
					<a href={PROFILE.resumeUrl} target="_blank" rel="noopener noreferrer" class="resume-btn">
						{locale === 'ms' ? 'Muat Turun Resume PDF' : 'Download Resume PDF'}
					</a>
					<button
						type="button"
						class="close-btn"
						onclick={onClose}
						aria-label={locale === 'ms' ? 'Tutup dialog (ESC)' : 'Close dialog (ESC)'}
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
						<span>{locale === 'ms' ? 'Tutup (ESC)' : 'Close (ESC)'}</span>
					</button>
				</div>
			</header>

			<nav
				class="dossier-tabs"
				aria-label={locale === 'ms' ? 'Kategori rekod CV' : 'CV record categories'}
			>
				<button
					type="button"
					class="tab-btn"
					class:active={activeTab === 'career'}
					aria-pressed={activeTab === 'career'}
					onclick={() => (activeTab = 'career')}
				>
					{locale === 'ms' ? 'Pengalaman Kerja (5)' : 'Work Experience (5)'}
				</button>
				<button
					type="button"
					class="tab-btn"
					class:active={activeTab === 'projects'}
					aria-pressed={activeTab === 'projects'}
					onclick={() => (activeTab = 'projects')}
				>
					{locale === 'ms' ? 'Sistem & Projek (11)' : 'Systems & Projects (11)'}
				</button>
				<button
					type="button"
					class="tab-btn"
					class:active={activeTab === 'skills'}
					aria-pressed={activeTab === 'skills'}
					onclick={() => (activeTab = 'skills')}
				>
					{locale === 'ms' ? 'Kemahiran Teknikal (5)' : 'Technical Skills (5)'}
				</button>
				<button
					type="button"
					class="tab-btn"
					class:active={activeTab === 'education'}
					aria-pressed={activeTab === 'education'}
					onclick={() => (activeTab = 'education')}
				>
					{locale === 'ms' ? 'Pendidikan UTM & Sijil (7)' : 'UTM Education & Certs (7)'}
				</button>
			</nav>

			<div class="dossier-body">
				{#if activeTab === 'career'}
					<div class="timeline-list">
						{#each CAREER_TIMELINE as item (item.id)}
							<article class="dossier-card">
								<div class="card-top">
									<div>
										<span class="period-pill">{item.period} · {item.location}</span>
										<h3>{item.role[locale]}</h3>
										<p class="company-line">{item.company}</p>
									</div>
									<button
										type="button"
										class="jump-btn"
										onclick={() => {
											onJumpStation(stationIndexMap[item.stationId] ?? 0);
											onClose();
										}}
									>
										{locale === 'ms' ? 'Pergi ke Stesen 3D ↗' : 'Jump to 3D Station ↗'}
									</button>
								</div>
								<ul class="bullet-list">
									{#each item.highlights[locale] as point}
										<li>{point}</li>
									{/each}
								</ul>
								<div class="tag-row">
									{#each item.stack as tech}
										<span class="tech-tag">{tech}</span>
									{/each}
								</div>
							</article>
						{/each}
					</div>
				{:else if activeTab === 'projects'}
					<div class="project-grid">
						{#each PROJECT_ARCHIVE as proj (proj.id)}
							<article class="dossier-card project-card">
								<div class="card-top">
									<span class="status-badge" data-status={proj.status}>{proj.badge[locale]}</span>
									<button
										type="button"
										class="jump-btn"
										onclick={() => {
											onJumpStation(stationIndexMap[proj.stationId] ?? 0);
											onClose();
										}}
									>
										{locale === 'ms' ? 'Stesen 3D ↗' : '3D Station ↗'}
									</button>
								</div>
								<h3>{proj.name}</h3>
								<p class="proj-summary">{proj.summary[locale]}</p>
								<p class="proj-arch">
									<strong>{locale === 'ms' ? 'Seni Bina:' : 'Architecture:'}</strong>
									{proj.architecture[locale]}
								</p>
								<div class="tag-row">
									{#each proj.stack as tech}
										<span class="tech-tag">{tech}</span>
									{/each}
								</div>
								{#if proj.repoUrl || proj.caseStudyUrl || proj.liveUrl}
									<div class="proj-links-row">
										{#if proj.repoUrl}
											<a
												href={proj.repoUrl}
												target="_blank"
												rel="noopener noreferrer"
												class="repo-link"
											>
												{locale === 'ms' ? 'Repositori GitHub ↗' : 'GitHub Repository ↗'}
											</a>
										{/if}
										{#if proj.caseStudyUrl}
											<a
												href={proj.caseStudyUrl}
												target="_blank"
												rel="noopener noreferrer"
												class="repo-link case-link"
											>
												{locale === 'ms' ? 'Kajian Kes PDF ↗' : 'PDF Case Study ↗'}
											</a>
										{/if}
										{#if proj.liveUrl}
											<a
												href={proj.liveUrl}
												target="_blank"
												rel="noopener noreferrer"
												class="repo-link live-link"
											>
												{locale === 'ms' ? 'Pautan Tambahan ↗' : 'Additional Link ↗'}
											</a>
										{/if}
									</div>
								{/if}
							</article>
						{/each}
					</div>
				{:else if activeTab === 'skills'}
					<div class="edu-grid">
						{#each TECHNICAL_SKILLS as group (group.id)}
							<article class="dossier-card">
								<h3>{group.category[locale]}</h3>
								<div class="tag-row" style="margin-top: 0.75rem;">
									{#each group.skills as skill}
										<span class="tech-tag">{skill}</span>
									{/each}
								</div>
							</article>
						{/each}
					</div>
				{:else}
					<div class="edu-section">
						<div class="edu-grid">
							{#each EDUCATION_HISTORY as edu (edu.id)}
								<article class="dossier-card">
									<span class="period-pill">{edu.period} · {edu.location}</span>
									<h3>{edu.qualification[locale]}</h3>
									<p class="company-line">{edu.institution} · CGPA: {edu.cgpa}</p>
									<div class="fyp-box">
										<strong
											>{locale === 'ms'
												? 'Projek Tahun Akhir (FYP):'
												: 'Final Year Project (FYP):'}</strong
										>
										<p class="fyp-title">{edu.fypTitle[locale]}</p>
										<p>{edu.fypSummary[locale]}</p>
										{#if edu.fypRepo}
											<a
												href={edu.fypRepo}
												target="_blank"
												rel="noopener noreferrer"
												class="repo-link"
											>
												{locale === 'ms'
													? 'Buka Repositori FYP di GitHub ↗'
													: 'Open FYP Repository on GitHub ↗'}
											</a>
										{/if}
									</div>
									<div class="tag-row" style="margin-top: 0.85rem;">
										{#each edu.coursework as cw}
											<span class="tech-tag">{cw}</span>
										{/each}
									</div>
								</article>
							{/each}
						</div>

						<h3 class="cert-heading">
							{locale === 'ms'
								? 'Pensijilan Profesional Cisco & Analitik Data'
								: 'Cisco Networking & Specialized Analytics Certifications'}
						</h3>
						<div class="cert-grid">
							{#each CERTIFICATIONS as cert (cert.title)}
								<div class="cert-card">
									<span class="cert-cat">
										{cert.category === 'network' ? 'CISCO NETWORKING' : 'DATA ANALYTICS'}
										{#if cert.period}
											· {cert.period}{/if}
									</span>
									<h4>{cert.title}</h4>
									<p>{cert.issuer}</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.dossier-backdrop {
		position: fixed;
		inset: 0;
		z-index: 90;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: clamp(0.75rem, 2.5vw, 2rem);
		background: var(--spatial-backdrop, rgba(7, 8, 10, 0.72));
	}

	.backdrop-dismiss {
		position: absolute;
		inset: 0;
		border: 0;
		background: transparent;
		cursor: pointer;
	}

	.dossier-sheet {
		--spatial-pill-bg: var(--glass-text-bg);
		--spatial-pill-hover-bg: var(--glass-text-hover-bg);
		font-variant-numeric: tabular-nums;
		position: relative;
		z-index: 1;
		width: min(var(--size-modal-width, 1140px), 100%);
		max-height: min(88vh, var(--size-modal-max, 920px));
		display: flex;
		flex-direction: column;
		border-radius: var(--radius-xl, 20px);
		background-color: var(--glass-modal-bg);
		background-image: var(--glass-sheen);
		border: 1px solid var(--glass-border);
		color: var(--spatial-hud-ink, var(--ink));
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--shadow-glass-modal);
		overflow: hidden;
	}

	.dossier-header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.2rem 1.5rem;
		border-bottom: 1px solid var(--spatial-card-border, var(--surface-border));
	}

	.header-identity {
		min-width: 0;
		padding: 0.5rem 0.75rem;
		border-radius: var(--radius-md);
		background: var(--glass-text-bg);
		overflow-wrap: anywhere;
		display: flex;
		align-items: center;
		gap: 0.95rem;
	}

	.header-avatar {
		flex-shrink: 0;
		width: var(--size-avatar-md, 52px);
		height: var(--size-avatar-md, 52px);
		border-radius: var(--radius-pill, 9999px);
		object-fit: cover;
		border: 2px solid var(--spatial-accent, var(--accent)); /* ds-allow-hardcode */
	}

	.dossier-kicker {
		margin: 0 0 0.2rem;
		font-family: var(--font-mono, monospace);
		font-size: 0.72rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--spatial-accent, var(--accent));
	}

	.dossier-header h2 {
		margin: 0;
		font-size: clamp(1.05rem, 1.8vw, 1.38rem);
		font-weight: 700;
		color: var(--spatial-hud-ink, var(--ink));
	}

	.dossier-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.65rem;
	}

	.resume-btn,
	.close-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		min-height: var(--size-touch, 40px);
		padding: 0.5rem 0.95rem;
		border-radius: var(--radius-pill, 9999px);
		font-size: 0.82rem;
		font-weight: 600;
		text-decoration: none;
		cursor: pointer;
		transition:
			transform var(--duration-fast, 150ms) ease,
			background var(--duration-fast, 150ms) ease,
			border-color var(--duration-fast, 150ms) ease;
	}

	.resume-btn {
		background: var(--spatial-accent, var(--accent));
		color: var(--on-accent);
		border: 0;
	}

	.resume-btn:hover {
		filter: brightness(1.08);
	}

	.close-btn {
		background: var(--spatial-pill-bg, var(--surface-hover));
		color: var(--spatial-hud-ink, var(--ink));
		border: 1px solid var(--spatial-pill-border, var(--surface-border));
	}

	.close-btn:hover {
		background: var(--spatial-pill-hover-bg, var(--surface-hover));
		border-color: var(--spatial-pill-hover-border, var(--accent));
	}

	.dossier-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding: 0.8rem 1.5rem;
		border-bottom: 1px solid var(--spatial-card-border, var(--surface-border));
		background: var(--spatial-pill-bg, var(--bg-subtle));
	}

	.tab-btn {
		min-height: var(--size-control-md, 38px);
		padding: 0.42rem 0.95rem;
		border-radius: var(--radius-pill, 9999px);
		border: 1px solid transparent;
		background: transparent;
		color: var(--spatial-hud-muted, var(--ink-secondary));
		font-size: 0.83rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			background var(--duration-fast, 150ms) ease,
			color var(--duration-fast, 150ms) ease;
	}

	.tab-btn:hover {
		color: var(--spatial-hud-ink, var(--ink));
	}

	.tab-btn.active {
		background: var(--spatial-chip-bg, var(--badge-bg));
		color: var(--spatial-chip-ink, var(--badge-ink));
		border-color: var(--spatial-chip-border, var(--badge-border));
	}

	.dossier-body {
		min-height: 0;
		padding: 1.35rem 1.5rem;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	.timeline-list {
		display: flex;
		flex-direction: column;
		gap: 1.05rem;
	}

	.project-grid,
	.edu-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--card-min-width, 300px)), 1fr));
		gap: 1rem;
	}

	.dossier-card {
		padding: 1.15rem 1.25rem;
		border-radius: var(--radius-lg, 16px);
		background: var(--spatial-pill-bg, var(--surface));
		border: 1px solid var(--spatial-card-border, var(--surface-border));
	}

	.card-top {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 0.6rem;
	}

	.period-pill,
	.status-badge {
		display: inline-block;
		font-family: var(--font-mono, monospace);
		font-size: 0.72rem;
		padding: 0.2rem 0.6rem;
		border-radius: var(--radius-pill, 9999px);
		background: var(--spatial-chip-bg, var(--badge-bg));
		color: var(--spatial-chip-ink, var(--badge-ink));
		border: 1px solid var(--spatial-chip-border, var(--badge-border));
		margin-bottom: 0.35rem;
	}

	.dossier-card h3 {
		margin: 0.15rem 0;
		font-size: 1.04rem;
		color: var(--spatial-hud-ink, var(--ink));
	}

	.company-line {
		margin: 0;
		font-size: 0.86rem;
		color: var(--spatial-hud-muted, var(--ink-secondary));
		font-weight: 600;
	}

	.jump-btn {
		min-height: var(--size-control-sm, 34px);
		padding: 0.3rem 0.75rem;
		border-radius: var(--radius-pill, 9999px);
		border: 1px solid var(--spatial-pill-border, var(--surface-border));
		background: var(--spatial-pill-bg, var(--surface-hover));
		color: var(--spatial-hud-ink, var(--ink));
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		transition:
			border-color var(--duration-fast, 150ms) ease,
			background var(--duration-fast, 150ms) ease,
			color var(--duration-fast, 150ms) ease;
	}

	.jump-btn:hover {
		border-color: var(--spatial-accent, var(--accent));
		color: var(--spatial-accent, var(--accent));
		background: var(--spatial-chip-bg, var(--badge-bg));
	}

	.bullet-list {
		margin: 0.65rem 0 0.85rem;
		padding-left: 1.15rem;
		display: flex;
		flex-direction: column;
		gap: 0.38rem;
		font-size: 0.87rem;
		line-height: 1.55;
		color: var(--spatial-hud-muted, var(--ink-secondary));
	}

	.proj-summary,
	.proj-arch {
		font-size: 0.85rem;
		line-height: 1.52;
		color: var(--spatial-hud-muted, var(--ink-secondary));
		margin: 0.45rem 0;
	}

	.tag-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.38rem;
		margin-top: 0.65rem;
	}

	.tech-tag {
		font-family: var(--font-mono, monospace);
		font-size: 0.71rem;
		padding: 0.2rem 0.55rem;
		border-radius: var(--radius-xs, 6px);
		background: var(--spatial-pill-bg, var(--surface-hover));
		border: 1px solid var(--spatial-pill-border, var(--surface-border));
		color: var(--spatial-hud-ink, var(--ink));
	}

	.proj-links-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 0.8rem;
	}

	.repo-link {
		display: inline-flex;
		align-items: center;
		min-height: var(--size-target-min, 24px);
		padding-block: var(--space-idle-y, 2px);
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--spatial-accent, var(--accent));
		text-decoration: none;
	}

	.repo-link:hover {
		text-decoration: underline;
	}

	.fyp-box {
		margin-top: 0.75rem;
		padding: 0.8rem;
		border-radius: var(--radius-sm, 12px);
		background: var(--spatial-chip-bg, var(--badge-bg));
		border: 1px solid var(--spatial-chip-border, var(--badge-border));
		font-size: 0.84rem;
		line-height: 1.5;
	}

	.fyp-title {
		margin: 0.25rem 0;
		font-weight: 700;
		color: var(--spatial-accent, var(--accent));
	}

	.cert-heading {
		width: fit-content;
		padding: 0.4rem 0.65rem;
		border-radius: var(--radius-sm);
		background: var(--glass-text-bg);
		margin: 1.5rem 0 0.8rem;
		font-size: 1rem;
		color: var(--spatial-hud-ink, var(--ink));
	}

	.cert-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--card-min-sm, 220px)), 1fr));
		gap: 0.75rem;
	}

	.cert-card {
		padding: 0.9rem 1rem;
		border-radius: var(--radius-md, 14px);
		background: var(--spatial-pill-bg, var(--surface));
		border: 1px solid var(--spatial-card-border, var(--surface-border));
	}

	.cert-cat {
		font-family: var(--font-mono, monospace);
		font-size: 0.68rem;
		color: var(--spatial-accent, var(--accent));
	}

	.cert-card h4 {
		margin: 0.3rem 0 0.15rem;
		font-size: 0.9rem;
		color: var(--spatial-hud-ink, var(--ink));
	}

	.cert-card p {
		margin: 0;
		font-size: 0.79rem;
		color: var(--spatial-hud-muted, var(--ink-secondary));
	}
</style>
