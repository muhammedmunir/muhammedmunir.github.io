<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import {
		PROFILE,
		CAREER_TIMELINE,
		EDUCATION_HISTORY,
		TECHNICAL_SKILLS,
		CERTIFICATIONS,
		PROJECT_ARCHIVE,
		type LocalizedText
	} from '$lib/content/portfolio-data';
	import ContactModal from '$lib/workbench/ContactModal.svelte';
	import {
		initPreferences, getLocale, getTheme, toggleLocale, toggleTheme
	} from '$lib/workbench/preferences.svelte';
	import { MAINTAINED_MODULES, BUILT_MODULES } from '$lib/workbench/system-state.mjs';

	let locale = $derived(getLocale());
	let theme = $derived(getTheme());
	let contactOpen = $state(false);
	onMount(initPreferences);

	const text = (ms: string, en: string) => locale === 'en' ? en : ms;
	const localLink = (href: string) => href.startsWith('/') ? `${base}${href}` : href;
	const period = (value: string) => locale === 'en' ? value : value
		.replace(/Present/g, 'Kini').replace(/Dec/g, 'Dis').replace(/Mar/g, 'Mac')
		.replace(/Aug/g, 'Ogos').replace(/Oct/g, 'Okt');
	const archive = (id: string) => PROJECT_ARCHIVE.find((project) => project.id === id);
	const workProjects = {
		yhcm: MAINTAINED_MODULES,
		'nova-bitara': BUILT_MODULES.filter((project) => ['iwa001', 'infinity'].includes(project.id)),
		'tnb-protege': BUILT_MODULES.filter((project) => project.id === 'onboardx')
	};
	const projectsForRole = (id: string) => workProjects[id as keyof typeof workProjects] ?? [];
	const projectGroups = [
		{
			id: 'sistem-disenggara',
			title: { ms: 'Sistem disenggara', en: 'Maintained systems' },
			description: {
				ms: 'Sistem sektor awam di YHCM. Penyelenggaraan, pembangunan modul dan pembaikan pepijat; bukan tuntutan membina sistem asal.',
				en: 'Public-sector systems at YHCM. Maintenance, module development and bug fixes; not a claim to have built the original systems.'
			},
			projects: MAINTAINED_MODULES
		},
		{
			id: 'projek-dibangunkan',
			title: { ms: 'Projek dibangunkan', en: 'Built projects' },
			description: {
				ms: 'Projek korporat dan peribadi yang dibangunkan, berasingan daripada sistem YHCM yang disenggara.',
				en: 'Corporate and personal development projects, separate from the YHCM systems maintained.'
			},
			projects: BUILT_MODULES
		}
	];
	// Peranan yang sama bagi setiap sistem dalam kumpulan dipaparkan sekali di tajuk kumpulan.
	const sharedRole = (projects: typeof BUILT_MODULES) =>
		projects.every((project) => project.role === projects[0]?.role) ? projects[0] : undefined;
	const personalProjects: Array<{ id: string; name: LocalizedText; summary?: LocalizedText }> = [
		{ id: 'proj-tindak', name: { ms: 'TINDAK', en: 'TINDAK' }, summary: archive('proj-tindak')?.summary },
		{ id: 'proj-lumina-wedding', name: { ms: 'Lumina Glass Studio', en: 'Lumina Glass Studio' }, summary: archive('proj-lumina-wedding')?.summary },
		{
			id: 'homelab', name: { ms: 'Homelab & Infrastruktur Linux', en: 'Homelab & Linux Infrastructure' },
			summary: {
				ms: 'Konfigurasi pelayan Linux, Docker dan rangkaian keselamatan tempatan.',
				en: 'Linux server, Docker and local network security configurations.'
			}
		},
		{ id: 'proj-ai-policy-rag', name: { ms: 'AI Policy Helper (RAG)', en: 'AI Policy Helper (RAG)' }, summary: archive('proj-ai-policy-rag')?.summary }
	];
</script>

<svelte:head>
	<title>CV | {PROFILE.fullName}</title>
	<meta
		name="robots"
		content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
	/>
	<link rel="canonical" href="https://muhammedmunir.github.io/cv/" />
	<meta name="description" content={text(
		'CV Muhammed Munir: pengalaman pembangunan sistem full-stack, keselamatan rangkaian, pendidikan dan projek. Versi bacaan tanpa 3D.',
		'Muhammed Munir’s CV: full-stack systems development, network security, education and projects. A reading version without 3D.'
	)} />
</svelte:head>

<div class="cv-page" lang={locale}>
	<a class="skip-link" href="#cv-content">{text('Langkau ke kandungan CV', 'Skip to CV content')}</a>
	<div class="document">
		<header class="masthead">
			<a class="identity" href={`${base}/`} aria-label={text('munir. Kembali ke bilik 3D', 'munir. Back to the 3D room')}>munir<span aria-hidden="true">.</span></a>
			<p>Curriculum vitae <span aria-hidden="true">/</span> {text('Versi bacaan', 'Reading version')}</p>
			<div class="preferences" role="group" aria-label={text('Tetapan paparan', 'Display preferences')}>
				<button type="button" onclick={toggleLocale} lang={locale === 'ms' ? 'en' : 'ms'}>
					{locale === 'ms' ? 'Switch to English' : 'Tukar ke Bahasa Melayu'}
				</button>
				<button type="button" onclick={toggleTheme} aria-pressed={theme === 'dark'}>
					{text('Tema gelap', 'Dark theme')}
				</button>
			</div>
		</header>

		<main id="cv-content" tabindex="-1">
			<section class="profile" aria-labelledby="profile-heading">
				<div class="profile-title">
					<p class="location">{PROFILE.location}</p>
					<h1 id="profile-heading">{PROFILE.fullName}</h1>
					<p class="headline">{PROFILE.headline[locale]}</p>
				</div>
				<div class="profile-detail">
					<p class="summary">{PROFILE.summary[locale]}</p>
					<div class="contact-actions">
						<a class="resume-link" href={localLink(PROFILE.resumeUrl)} download>{text('Muat turun CV (PDF)', 'Download CV (PDF)')}</a>
						<button type="button" aria-haspopup="dialog" onclick={() => contactOpen = true}>{text('Hubungi saya', 'Contact me')}</button>
					</div>
					<address>
						<a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
						<a href={`tel:${PROFILE.phone.replace(/[^+\d]/g, '')}`}>{PROFILE.phone}</a>
					</address>
				</div>
			</section>

			<nav class="contents" aria-label={text('Bahagian CV', 'CV sections')}>
				<a href="#pengalaman">{text('Pengalaman', 'Experience')}</a>
				<a href="#sistem-disenggara">{text('Sistem disenggara', 'Maintained systems')}</a>
				<a href="#projek-dibangunkan">{text('Projek dibangunkan', 'Built projects')}</a>
				<a href="#projek">{text('Arkib peribadi', 'Personal archive')}</a>
				<a href="#kemahiran">{text('Kemahiran', 'Skills')}</a>
				<a href="#pendidikan">{text('Pendidikan', 'Education')}</a>
				<a href="#pensijilan">{text('Pensijilan', 'Certifications')}</a>
			</nav>

			<section class="cv-section" id="pengalaman" aria-labelledby="career-heading">
				<div class="section-heading">
					<h2 id="career-heading">{text('Pengalaman kerja', 'Work experience')}</h2>
					<p>{text('Pembangunan sistem dan operasi IT.', 'Systems development and IT operations.')}</p>
				</div>
				<div class="section-body">
					{#each CAREER_TIMELINE as role (role.id)}
						<article class="career-entry">
							<p class="entry-meta">{period(role.period)} · {role.location}</p>
							<h3>{role.company}</h3>
							<p class="role-title">{role.role[locale]}</p>
							{#if projectsForRole(role.id).length}
								<div class="project-references">
									<p>{role.id === 'yhcm' ? text('Sistem disenggara di organisasi ini', 'Systems maintained at this organisation') : text('Projek dibangunkan di organisasi ini', 'Projects built at this organisation')}</p>
									<ul>
										{#each projectsForRole(role.id) as project (project.id)}
											<li><a href={`#project-${project.id}`}>{project.name}</a></li>
										{/each}
									</ul>
								</div>
							{:else}
								<p class="operations-note">{text('Latihan industri · Pengalaman operasi', 'Internship · Operations experience')}</p>
							{/if}
							<ul class="highlights">
								{#each role.highlights[locale] as highlight}<li>{highlight}</li>{/each}
							</ul>
							<p class="stack"><span>{text('Teknologi & alatan', 'Technologies & tools')}</span> {role.stack.join(' · ')}</p>
						</article>
					{/each}
				</div>
			</section>

			{#each projectGroups as group (group.id)}
				<section class="cv-section" id={group.id} aria-labelledby={`${group.id}-heading`}>
					<div class="section-heading">
						<h2 id={`${group.id}-heading`}>{group.title[locale]}</h2>
						<p class="project-count">{group.projects.length} {group.id === 'sistem-disenggara' ? text('sistem YHCM', 'YHCM systems') : text('projek', 'projects')}</p>
						<p>{group.description[locale]}</p>
						{#if sharedRole(group.projects)}<p class="shared-role">{text(sharedRole(group.projects)!.role, sharedRole(group.projects)!.roleEn)}</p>{/if}
					</div>
					<ul class="project-list section-body">
						{#each group.projects as project (project.id)}
							<li id={`project-${project.id}`}>
								<h3>{project.name}</h3>
								{#if !sharedRole(group.projects)}<p class="role-title">{text(project.role, project.roleEn)}</p>{/if}
								<p class="project-summary">{text(project.dataArchitecture, project.dataArchitectureEn)}</p>
								<p class="stack"><span>{text('Teknologi & alatan', 'Technologies & tools')}</span>{project.stack.map((item) => item === 'Eksport PDF' ? text(item, 'PDF export') : item).join(' · ')}</p>
								<p class="access-note">{text(project.accessLabel, project.accessLabelEn)}</p>
								<div class="project-links">
									{#if project.caseStudyUrl}<a href={localLink(project.caseStudyUrl)}>{text('Baca kajian kes (PDF)', 'Read case study (PDF)')}</a>{/if}
									{#if project.liveUrl}<a href={project.liveUrl}>{text('Laman projek', 'Project website')}</a>{/if}
								</div>
							</li>
						{/each}
					</ul>
				</section>
			{/each}

			<section class="cv-section" id="projek" aria-labelledby="projects-heading">
				<div class="section-heading">
					<h2 id="projects-heading">{text('Arkib projek peribadi', 'Personal project archive')}</h2>
					<p>{text('Projek peribadi lain, di luar projek majikan dan projek di atas. Butiran tambahan atas permintaan.', 'Other personal projects, beyond employer work and the projects above. Further details on request.')}</p>
				</div>
				<ul class="personal-projects section-body">
					{#each personalProjects as project (project.id)}
						<li>
							<h3>{project.name[locale]}</h3>
							{#if project.summary}<p>{project.summary[locale]}</p>{/if}
						</li>
					{/each}
				</ul>
			</section>

			<section class="cv-section" id="kemahiran" aria-labelledby="skills-heading">
				<div class="section-heading">
					<h2 id="skills-heading">{text('Kemahiran teknikal', 'Technical skills')}</h2>
					<p>{text('Teknologi, infrastruktur dan alatan.', 'Technologies, infrastructure and tools.')}</p>
				</div>
				<dl class="skills section-body">
					{#each TECHNICAL_SKILLS as category (category.id)}
						<div><dt>{category.category[locale]}</dt><dd>{category.skills.join(' · ')}</dd></div>
					{/each}
				</dl>
			</section>

			<section class="cv-section" id="pendidikan" aria-labelledby="education-heading">
				<div class="section-heading">
					<h2 id="education-heading">{text('Pendidikan', 'Education')}</h2>
					<p>{text('Asas sains komputer dan keselamatan rangkaian.', 'Foundations in computer science and network security.')}</p>
				</div>
				<div class="section-body">
					{#each EDUCATION_HISTORY as education (education.id)}
						<article class="education-entry">
							<p class="entry-meta">{period(education.period)} · {education.location}</p>
							<h3>{education.qualification[locale]}</h3>
							<p>{education.institution} · CGPA {education.cgpa}</p>
							<div class="academic-project">
								<h4>{text('Projek tahun akhir', 'Final year project')}: {education.fypTitle[locale]}</h4>
								<p>{education.fypSummary[locale]}</p>
								{#if education.fypRepo}<a href={localLink(education.fypRepo)}>{text('Repositori projek tahun akhir', 'Final year project repository')}</a>{/if}
							</div>
							<p class="stack"><span>{text('Kursus berkaitan', 'Relevant coursework')}</span> {education.coursework.join(' · ')}</p>
						</article>
					{/each}
				</div>
			</section>

			<section class="cv-section" id="pensijilan" aria-labelledby="certifications-heading">
				<div class="section-heading">
					<h2 id="certifications-heading">{text('Pensijilan', 'Certifications')}</h2>
					<p>{text('Rangkaian dan analisis data.', 'Networking and data analysis.')}</p>
				</div>
				<ul class="certifications section-body">
					{#each CERTIFICATIONS as certificate (certificate.title)}
						<li>
							<h3>{certificate.title}</h3>
							<p>{certificate.issuer}{certificate.period ? ` · ${period(certificate.period)}` : ''}</p>
						</li>
					{/each}
				</ul>
			</section>

			<section class="cv-section languages-section" aria-labelledby="languages-heading">
				<div class="section-heading"><h2 id="languages-heading">{text('Bahasa', 'Languages')}</h2></div>
				<dl class="languages section-body">
					{#each PROFILE.languages as language (language.name.en)}
						<div><dt>{language.name[locale]}</dt><dd>{language.proficiency[locale]}</dd></div>
					{/each}
				</dl>
			</section>
		</main>

		<footer>
			<p>{PROFILE.shortName}<br /><span>{text('CV dalam format bacaan. Versi interaktif ada di bilik 3D.', 'CV in a reading format. The interactive version is in the 3D room.')}</span></p>
			<div class="footer-links">
				<a href={PROFILE.githubUrl}>GitHub</a>
				<a href={PROFILE.linkedinUrl}>LinkedIn</a>
				<a href={`${base}/`}>{text('Bilik 3D', '3D room')}</a>
			</div>
		</footer>
	</div>
	<ContactModal open={contactOpen} {locale} onclose={() => contactOpen = false} />
</div>

<style>
	.cv-page {
		--cv-paper: var(--work-paper, #f5f5f2);
		--cv-ink: var(--work-ink, #202b36);
		--cv-muted: var(--work-muted, #53616e);
		--cv-blue: var(--work-accent, #2451a4);
		--cv-line: var(--work-line, #ccd2d8);
		--cv-surface: var(--work-surface, #e9edf1);
		min-height: 100svh;
		background: var(--cv-paper);
		color: var(--cv-ink);
		color-scheme: inherit;
		font-family: var(--work-font-body, 'Plus Jakarta Sans', sans-serif);
		font-size: 1rem;
		line-height: 1.75;
		overflow-wrap: anywhere;
	}
	.document {
		max-width: 78rem;
		margin-inline: auto;
		padding-inline: 1rem;
	}
	h1,
	h2,
	h3,
	h4,
	p,
	ul,
	dl,
	dd {
		margin: 0;
	}
	h1,
	h2,
	h3,
	h4,
	p {
		color: inherit;
	}
	h1,
	h2 {
		font-family: var(--font-heading, 'Syne', sans-serif);
		font-weight: 700;
	}
	h3,
	h4 {
		font-family: inherit;
	}
	a {
		color: var(--cv-blue);
		text-decoration: underline;
		text-underline-offset: 0.2em;
		text-decoration-thickness: 0.06em;
	}
	a:hover {
		text-decoration-thickness: 0.14em;
	}
	a:active {
		opacity: 0.75;
	}
	a:focus-visible,
	main:focus-visible {
		outline: 3px solid var(--cv-blue);
		outline-offset: 5px;
		border-radius: 2px;
	}
	.skip-link {
		position: absolute;
		z-index: 10;
		inset: 0.75rem auto auto 1rem;
		padding: 0.75rem 1rem;
		background: var(--cv-paper);
		transform: translateY(-180%);
	}
	.skip-link:focus {
		transform: translateY(0);
	}
	.masthead {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem 2rem;
		padding-block: 1.25rem;
		border-bottom: 1px solid var(--cv-line);
		font-size: 0.8125rem;
	}
	.masthead a {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		font-weight: 600;
	}
	.masthead .identity {
		color: var(--cv-ink);
		font-family: var(--font-heading, 'Syne', sans-serif);
		font-size: 1.75rem;
		font-weight: 800;
		letter-spacing: -0.07em;
		text-decoration: none;
	}
	.masthead .identity span {
		margin: 0;
		color: var(--cv-blue);
	}
	.masthead .identity:hover {
		text-decoration: underline;
		text-decoration-thickness: 0.08em;
	}
	.masthead p {
		color: var(--cv-muted);
	}
	.masthead span {
		margin-inline: 0.5rem;
	}
	.preferences {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	button {
		min-width: 2.75rem;
		min-height: 2.75rem;
		max-width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--cv-muted);
		background: var(--cv-surface);
		color: var(--cv-ink);
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}
	button:hover {
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}
	button:active {
		background: var(--cv-paper);
	}
	button[aria-pressed='true'] {
		border-color: var(--cv-blue);
		box-shadow: inset 0 -3px var(--cv-blue);
	}
	.profile {
		display: grid;
		gap: 2rem;
		padding-block: 3rem;
	}
	.location {
		color: var(--cv-muted);
		margin-bottom: 1.25rem;
		font-size: 0.875rem;
	}
	h1 {
		max-width: 13ch;
		font-size: clamp(2.4rem, 5.6vw, 4.5rem);
		line-height: 1.02;
		letter-spacing: -0.04em;
		text-wrap: balance;
	}
	.headline {
		max-width: 36ch;
		margin-top: 1.5rem;
		color: var(--cv-blue);
		font-size: 1.0625rem;
		font-weight: 600;
	}
	.summary {
		max-width: 66ch;
	}
	.contact-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 1.5rem;
		margin-block: 1.75rem 0.75rem;
	}
	.contact-actions a {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		font-size: 0.875rem;
		font-weight: 600;
	}
	.contact-actions .resume-link {
		padding: 0.625rem 1rem;
		background: var(--cv-blue);
		color: var(--cv-paper);
		border: 1px solid var(--cv-blue);
		text-decoration: none;
	}
	.contact-actions .resume-link:hover {
		text-decoration: underline;
	}
	address {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		font-style: normal;
		font-size: 0.8125rem;
	}
	address a {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		max-width: 100%;
		overflow-wrap: anywhere;
	}
	.contents {
		display: flex;
		flex-wrap: wrap;
		column-gap: 1.5rem;
		padding-block: 0.75rem;
		border-block: 1px solid var(--cv-line);
	}
	.contents a {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		font-size: 0.875rem;
	}
	.cv-section {
		display: grid;
		gap: 2rem;
		padding-block: 3rem;
		border-bottom: 1px solid var(--cv-line);
		scroll-margin-top: 2rem;
	}
	.section-heading h2 {
		font-size: clamp(1.6rem, 2.6vw, 2.1rem);
		line-height: 1.12;
		letter-spacing: -0.03em;
	}
	.section-heading p {
		margin-top: 0.75rem;
		color: var(--cv-muted);
		max-width: 28ch;
		font-size: 0.875rem;
	}
	.section-body {
		min-width: 0;
	}
	.career-entry + .career-entry,
	.education-entry + .education-entry {
		margin-top: 2.75rem;
		padding-top: 2.75rem;
		border-top: 1px solid var(--cv-line);
	}
	.entry-meta {
		margin-bottom: 0.75rem;
		color: var(--cv-muted);
		font-size: 0.8125rem;
	}
	h3 {
		font-size: 1.125rem;
		font-weight: 650;
		line-height: 1.45;
	}
	.role-title {
		margin-top: 0.375rem;
		color: var(--cv-muted);
	}
	.project-references {
		margin-top: 1.25rem;
	}
	.project-references > p,
	.stack span {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--cv-muted);
	}
	.project-references ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1rem;
		padding: 0;
		list-style: none;
	}
	.project-references li {
		display: flex;
		align-items: center;
		min-height: 2.75rem;
		font-size: 0.875rem;
		font-weight: 600;
	}
	.project-references a {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
	}
	.operations-note {
		margin-top: 1rem;
		font-size: 0.8125rem;
		color: var(--cv-muted);
	}
	.highlights {
		padding-left: 1.125rem;
		margin-top: 1rem;
	}
	.highlights li {
		padding-left: 0.25rem;
		margin-top: 0.625rem;
	}
	.highlights li::marker {
		color: var(--cv-muted);
	}
	.stack {
		margin-top: 1.25rem;
		color: var(--cv-muted);
		font-size: 0.8125rem;
	}
	.stack span {
		display: block;
		margin-bottom: 0.375rem;
	}
	.project-list,
	.personal-projects,
	.certifications {
		padding: 0;
		list-style: none;
	}
	.project-list li + li,
	.personal-projects li + li {
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1px solid var(--cv-line);
	}
	.project-count {
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--cv-blue);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin-top: 0.25rem;
	}
	.project-summary {
		margin-top: 0.625rem;
	}
	.section-heading .shared-role {
		margin-top: 1rem;
		padding-left: 0.75rem;
		border-left: 2px solid var(--cv-blue);
		color: var(--cv-ink);
		font-size: 0.8125rem;
		font-weight: 600;
	}
	.access-note {
		display: inline-block;
		margin-top: 0.875rem;
		padding: 0.125rem 0.5rem;
		border: 1px solid var(--cv-line);
		border-radius: 3px;
		color: var(--cv-muted);
		font-size: 0.75rem;
		line-height: 1.6;
	}
	.project-links {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 0.75rem;
	}
	.project-links a {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		font-size: 0.875rem;
		font-weight: 600;
	}
	.personal-projects p {
		margin-top: 0.375rem;
	}
	.skills > div + div {
		margin-top: 1.5rem;
	}
	dt {
		font-weight: 650;
		margin-bottom: 0.375rem;
	}
	dd {
		color: var(--cv-muted);
	}
	.academic-project {
		margin-block: 1.25rem;
		padding: 1rem;
		background: var(--cv-surface);
	}
	h4 {
		font-weight: 600;
		font-size: 0.875rem;
	}
	.academic-project p {
		margin-top: 0.5rem;
		font-size: 0.875rem;
	}
	.academic-project a {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		margin-top: 0.5rem;
		font-size: 0.8125rem;
	}
	.certifications li + li {
		margin-top: 1.25rem;
	}
	.certifications h3 {
		font-size: 0.9375rem;
	}
	.certifications p {
		color: var(--cv-muted);
		font-size: 0.8125rem;
		margin-top: 0.25rem;
	}
	.languages {
		display: grid;
		gap: 1.25rem;
		font-size: 0.875rem;
	}
	footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 1rem 2rem;
		padding-block: 2rem;
		font-size: 0.8125rem;
	}
	footer span {
		color: var(--cv-muted);
	}
	.footer-links {
		display: flex;
		flex-wrap: wrap;
		gap: 1.25rem;
	}
	.footer-links a {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
	}
	@media (min-width: 48rem) {
		.document {
			padding-inline: 2.5rem;
		}
		.profile {
			grid-template-columns: 1fr 1.15fr;
			align-items: start;
			gap: 3rem;
			padding-block: 4.5rem;
		}
		.profile-detail {
			padding-top: 2.75rem;
		}
		.cv-section {
			grid-template-columns: minmax(0, 1fr) minmax(0, 2.15fr);
			gap: 3rem;
			padding-block: 3.5rem;
		}
		.languages {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.cv-page a {
			transition: none;
			animation: none;
		}
	}
	@media (forced-colors: active) {
		a:focus-visible,
		button:focus-visible,
		main:focus-visible {
			outline-color: Highlight;
		}
		.contact-actions .resume-link {
			border-color: LinkText;
		}
		button[aria-pressed='true'] {
			border-color: Highlight;
			outline: 2px solid Highlight;
		}
	}
	@page {
		size: A4;
		margin: 14mm 15mm;
	}
	@media print {
		:global(html),
		:global(body) {
			background: #fff !important;
			transition: none !important;
		}
		.cv-page {
			--cv-paper: #fff;
			--cv-ink: #111;
			--cv-muted: #444;
			--cv-blue: #111;
			--cv-line: #bbb;
			--cv-surface: #f2f2f2;
			min-height: 0;
			font-size: 9.5pt;
			line-height: 1.5;
			print-color-adjust: exact;
		}
		.document {
			max-width: none;
			padding: 0;
		}
		.masthead,
		.contents,
		.contact-actions,
		.skip-link,
		.footer-links,
		.project-links,
		.academic-project a {
			display: none;
		}
		a {
			text-decoration: none;
		}
		.profile {
			grid-template-columns: 1fr 1.6fr;
			gap: 8mm;
			padding-block: 0 5mm;
		}
		.profile-detail {
			padding-top: 0;
		}
		.location {
			margin-bottom: 2mm;
		}
		h1 {
			font-size: 24pt;
		}
		.headline {
			margin-top: 3mm;
			font-size: 10pt;
		}
		address {
			flex-direction: row;
			gap: 0 6mm;
			margin-top: 3mm;
		}
		address a,
		.project-references li,
		.project-references a {
			min-height: 0;
		}
		.cv-section {
			grid-template-columns: 38mm minmax(0, 1fr);
			gap: 6mm;
			padding-block: 5mm;
		}
		.section-heading h2 {
			font-size: 12pt;
		}
		.section-heading p {
			margin-top: 1.5mm;
			font-size: 8pt;
		}
		.career-entry + .career-entry,
		.education-entry + .education-entry,
		.project-list li + li,
		.personal-projects li + li {
			margin-top: 4mm;
			padding-top: 4mm;
		}
		.highlights li {
			margin-top: 1mm;
		}
		.stack,
		.project-references {
			margin-top: 2mm;
		}
		.academic-project {
			margin-block: 2mm;
			padding: 2mm 3mm;
		}
		.skills > div + div {
			margin-top: 2.5mm;
		}
		.certifications li + li {
			margin-top: 2mm;
		}
		footer {
			padding-block: 4mm 0;
		}
		h2,
		h3,
		h4,
		.entry-meta,
		.role-title {
			break-after: avoid;
		}
		.highlights li,
		.project-list li,
		.personal-projects li,
		.academic-project,
		.certifications li,
		.skills > div {
			break-inside: avoid;
		}
	}
</style>
