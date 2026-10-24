<script lang="ts">
	import { onMount } from 'svelte';
	import { lang } from '$lib/i18n';
	import { translations } from '$lib/translations';
	import { systemProjects, systemEvidence } from '$lib/system-projects';
	import Contact from '$lib/Contact.svelte';
	import MotionWorld from './MotionWorld.svelte';

	let reduced = $state(true);
	let languageAnnouncement = $state('');
	function changeLanguage(value: 'ms' | 'en') {
		if ($lang === value) return;
		lang.set(value);
		languageAnnouncement = value === 'ms' ? 'Bahasa Melayu dipilih.' : 'English selected.';
	}
	const copy = $derived(
		$lang === 'ms'
			? {
					work: 'Hasil kerja',
					about: 'Tentang',
					contact: 'Hubungi',
					skip: 'Langkau ke kandungan',
					value:
						'Membina sistem yang menghubungkan manusia, proses dan data — daripada platform sektor awam kepada aplikasi mudah alih dan automasi visual.',
					selected: 'Hasil kerja terpilih',
					contribution: 'Skop & sumbangan',
					layers: 'Lapisan sistem',
					concept:
						'Rajah konseptual asli. Menggambarkan keupayaan yang didokumenkan, bukan tangkap layar atau topologi produksi.',
					aboutTitle: 'Pemikiran sistem. Sentuhan manusia.',
					aboutText:
						'Saya Muhammed Munir, pembangun full-stack di Puchong, Selangor. Latar belakang keselamatan rangkaian membentuk cara saya membina aplikasi: aliran yang jelas, data yang terurus dan sempadan yang selamat.',
					career: 'Rekod kerjaya',
					education: 'Pendidikan',
					present: 'Kini',
					scene: 'Kajian bentuk / sistem dalam gerakan',
					footer: 'Dibina dengan niat. Direka untuk digunakan.'
				}
			: {
					work: 'Work',
					about: 'About',
					contact: 'Contact',
					skip: 'Skip to content',
					value:
						'Building systems that connect people, processes and data — from public-sector platforms to mobile experiences and visual automation.',
					selected: 'Selected work',
					contribution: 'Scope & contributions',
					layers: 'System layers',
					concept:
						'Original conceptual diagram. Illustrates documented capabilities, not a product screenshot or production topology.',
					aboutTitle: 'Systems thinking. Human purpose.',
					aboutText:
						'I’m Muhammed Munir, a full-stack developer based in Puchong, Selangor. A background in network security shapes how I build: clear workflows, considered data and safe boundaries.',
					career: 'Career ledger',
					education: 'Education',
					present: 'Present',
					scene: 'Form study / systems in motion',
					footer: 'Built with intent. Made to be used.'
				}
	);
	const career = [
		{ key: 'yhcm', company: 'YHCM Sdn Bhd', ms: 'Apr 2026 – Kini', en: 'Apr 2026 – Present' },
		{
			key: 'nova',
			company: 'Nova Bitara Development Sdn Bhd',
			ms: 'Dis 2025 – Mac 2026',
			en: 'Dec 2025 – Mar 2026'
		},
		{
			key: 'tnb_protege',
			company: 'Tenaga Nasional Berhad',
			ms: 'Apr 2025 – Dis 2025',
			en: 'Apr 2025 – Dec 2025'
		},
		{
			key: 'tnb_cyber',
			company: 'TNB Platinum / SOC',
			ms: 'Sept 2023 – Feb 2024',
			en: 'Sept 2023 – Feb 2024'
		}
	] as const;

	onMount(() => {
		const query = window.matchMedia('(prefers-reduced-motion: reduce)');
		const update = () => {
			reduced = query.matches;
		};
		update();
		query.addEventListener('change', update);
		return () => query.removeEventListener('change', update);
	});
</script>

<div class="systems">
	<div class="world" aria-hidden="true"><MotionWorld {reduced} /></div>
	<div class="content">
		<a class="skip" href="#main">{copy.skip}</a>
		<header class="site-header">
			<a class="wordmark" href="#intro" aria-label="MUNIR / SYSTEMS IN MOTION — Muhammed Munir"
				>MUNIR<span aria-hidden="true"> / </span><span>SYSTEMS IN MOTION</span></a
			>
			<nav aria-label={$lang === 'ms' ? 'Navigasi utama' : 'Main navigation'}>
				<a href="#emesys">{copy.work}</a><a href="#about">{copy.about}</a><a href="#contact"
					>{copy.contact}</a
				>
			</nav>
			<div class="header-tools">
				<div class="languages" role="group" aria-label={$lang === 'ms' ? 'Bahasa' : 'Language'}>
					<button
						type="button"
						lang="ms"
						aria-pressed={$lang === 'ms'}
						onclick={() => changeLanguage('ms')}>BM</button
					>
					<button
						type="button"
						lang="en"
						aria-pressed={$lang === 'en'}
						onclick={() => changeLanguage('en')}>EN</button
					>
				</div>
				<a class="resume" href="/resume.pdf" download="Resume_Muhammed_Munir.pdf"
					>Resume <span aria-hidden="true">↗</span><span class="sr-only"> PDF</span></a
				>
			</div>
		</header>

		<p class="sr-only" aria-live="polite" aria-atomic="true">{languageAnnouncement}</p>
		<main id="main" tabindex="-1">
			<section id="intro" data-motion-section="0" aria-labelledby="intro-title" class="hero">
				<div class="hero-copy solid">
					<p class="eyebrow">Puchong, Selangor / Malaysia</p>
					<h1 id="intro-title">Muhammed Munir<span>Full-Stack Software Engineer</span></h1>
					<p class="value">{copy.value}</p>
					<a class="text-link" href="#emesys">{copy.selected} <span aria-hidden="true">↓</span></a>
				</div>
				<div class="hero-aperture" aria-hidden="true"><span>{copy.scene}</span></div>
				<p class="giant-name" aria-hidden="true">MUNIR<span aria-hidden="true">/</span></p>
				<p class="hero-foot solid">
					<span>SYSTEMS IN MOTION</span><span>Vue / Laravel / Flutter / Python</span>
				</p>
			</section>

			{#each systemProjects as project, index}
				{@const evidence = systemEvidence(project, $lang)}
				<section
					id={project.key}
					data-motion-section={String(index + 1)}
					aria-labelledby={`${project.key}-title`}
					class:project-offset={index === 1}
					class:project-wide={index === 2}
					class="project"
				>
					<div class="project-top solid">
						<p class="eyebrow">0{index + 1} / {copy.selected}</p>
						<p>{project.context[$lang]}</p>
					</div>
					<div class="project-layout">
						<div class="project-copy solid">
							<h2 id={`${project.key}-title`}>{project.name}<span aria-hidden="true">.</span></h2>
							<p class="project-summary">{project.summary[$lang]}</p>
							<p class="project-description">{evidence.desc}</p>
							<h3>{$lang === 'ms' ? 'Keupayaan yang didokumenkan' : 'Documented capabilities'}</h3>
							<ul class="contributions">
								{#each evidence.features as feature}<li>{feature}</li>{/each}
							</ul>
						</div>
						<div class="project-visual">
							<div class="sculpture-window" aria-hidden="true"></div>
							<figure class="diagram solid">
								<svg
									viewBox="0 0 600 380"
									role="img"
									aria-labelledby={`${project.key}-diagram-title`}
								>
									<title id={`${project.key}-diagram-title`}>{project.name} — {copy.layers}</title>
									{#if project.key === 'emesys'}
										<g class="linework" fill="none"
											><path
												d="M100 130 300 40 500 130 300 220Z M100 190 300 100 500 190 300 280Z M100 250 300 160 500 250 300 340Z"
											/><path
												d="M100 130v120M500 130v120M300 220v120"
												stroke-dasharray="4 7"
											/><circle cx="300" cy="190" r="24" /></g
										>
										<text x="300" y="22" text-anchor="middle">{project.layers[0].technology}</text
										><text x="300" y="370" text-anchor="middle"
											>Laravel / MariaDB / Docker Swarm</text
										>
									{:else if project.key === 'onboardx'}
										<g class="linework" fill="none"
											><circle cx="300" cy="190" r="70" /><circle
												cx="300"
												cy="190"
												r="118"
												stroke-dasharray="3 8"
											/><path d="M75 190h155m140 0h155M300 22v98m0 140v98" /><circle
												cx="75"
												cy="190"
												r="9"
											/><circle cx="525" cy="190" r="9" /><circle cx="300" cy="32" r="9" /><circle
												cx="300"
												cy="348"
												r="9"
											/></g
										>
										<text x="300" y="196" text-anchor="middle">Flutter</text><text x="36" y="163"
											>{$lang === 'ms' ? 'Dokumen' : 'Documents'}</text
										><text x="483" y="163">{$lang === 'ms' ? 'Profil' : 'Profiles'}</text><text
											x="320"
											y="40">{$lang === 'ms' ? 'Latihan' : 'Training'}</text
										><text x="320" y="355">Azure / Jenkins</text>
									{:else}
										<g class="linework" fill="none"
											><path d="M100 90H60v40m440-40h40v40M60 250v40h40m400 0h40v-40" /><rect
												x="110"
												y="115"
												width="380"
												height="150"
												stroke-dasharray="5 7"
											/><circle cx="300" cy="190" r="50" /><path
												d="M225 190h150M300 115v150M165 220l80-65 55 35 100-50 45 40"
											/><circle cx="300" cy="190" r="7" /></g
										>
										<text x="300" y="62" text-anchor="middle"
											>Win32 / {$lang === 'ms' ? 'Sempadan selamat' : 'Safety boundary'}</text
										><text x="300" y="335" text-anchor="middle">OpenCV → Python → OCR</text>
									{/if}
								</svg>
								<figcaption>{copy.concept}</figcaption>
							</figure>
							<div class="layers solid">
								<h3>{copy.layers}</h3>
								<dl>
									{#each project.layers as layer}<div>
											<dt>{layer.label[$lang]}</dt>
											<dd><strong>{layer.technology}</strong><span>{layer.detail[$lang]}</span></dd>
										</div>{/each}
								</dl>
							</div>
						</div>
					</div>
				</section>
			{/each}

			<section id="about" data-motion-section="4" aria-labelledby="about-title" class="about solid">
				<div class="about-intro">
					<p class="eyebrow">04 / {copy.about}</p>
					<h2 id="about-title">{copy.aboutTitle}</h2>
					<p>{copy.aboutText}</p>
					<div class="education">
						<h3>{copy.education}</h3>
						<p>Universiti Teknologi Malaysia</p>
						<p>{translations[$lang].edu.degree.title} · {translations[$lang].edu.degree.major}</p>
						<p>2021 – 2024</p>
					</div>
				</div>
				<div class="career">
					<h3>{copy.career}</h3>
					<ol>
						{#each career as entry}<li>
								<p class="career-period">{entry[$lang]}</p>
								<p class="company">{entry.company}</p>
								<p class="career-role">{translations[$lang].exp[entry.key].role}</p>
								<p>{translations[$lang].exp[entry.key].highlights[0]}</p>
							</li>{/each}
					</ol>
				</div>
			</section>
			<div data-motion-section="5" class="contact-wrap solid"><Contact /></div>
		</main>
		<footer class="site-footer solid">
			<a href="#intro">Muhammed Munir <span aria-hidden="true">↑</span></a>
			<p>{copy.footer}</p>
			<p>© {new Date().getFullYear()}</p>
		</footer>
	</div>
</div>

<style>
	.systems {
		--paper: #121619;
		--ink: #f4eee3;
		--muted: #c4beb3;
		--copper: #d9a17b;
		--line: #89979b;
		background: var(--paper);
		color: var(--ink);
		font-family: Arial, Helvetica, sans-serif;
		isolation: isolate;
		overflow-x: clip;
		line-height: 1.6;
	}
	.systems :global(*) {
		box-sizing: border-box;
	}
	.systems :global(h1),
	.systems :global(h2),
	.systems :global(h3),
	.systems :global(h4) {
		font-family: Arial, Helvetica, sans-serif;
		font-weight: 500;
		color: var(--ink);
		letter-spacing: -0.04em;
		line-height: 1.08;
		margin: 0;
	}
	.systems :global(p) {
		margin: 0;
	}
	.systems :global(a) {
		color: inherit;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.3em;
	}
	.systems :global(button),
	.systems :global(input),
	.systems :global(textarea) {
		font: inherit;
	}
	.systems :global(a:focus-visible),
	.systems :global(button:focus-visible),
	.systems :global(input:focus-visible),
	.systems :global(textarea:focus-visible),
	.systems :global([tabindex='-1']:focus-visible) {
		outline: 2px solid var(--copper);
		outline-offset: 5px;
	}
	.systems :global(section[id]) {
		scroll-margin-top: 1rem;
	}
	.world {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
	}
	.world :global(canvas) {
		position: fixed;
		inset: 0;
		z-index: 0;
	}
	.content {
		position: relative;
		z-index: 1;
	}
	.solid {
		background: var(--paper);
	}
	.skip {
		position: absolute;
		top: 0.5rem;
		left: 1rem;
		z-index: 5;
		transform: translateY(-200%);
		background: var(--ink);
		color: var(--paper) !important;
		padding: 0.8rem;
	}
	.skip:focus {
		transform: none;
	}
	.site-header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem 2rem;
		background: var(--paper);
		border-bottom: 1px solid var(--line);
		padding: 1rem clamp(1.1rem, 4vw, 5rem);
	}
	.wordmark {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		gap: 0.6rem;
		font-weight: 700;
		text-decoration: none;
		letter-spacing: -0.03em;
	}
	.wordmark span:last-child {
		font-size: 0.62rem;
		letter-spacing: 0.08em;
		max-width: 12ch;
		line-height: 1.3;
	}
	nav,
	.header-tools,
	.languages {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}
	nav a,
	.resume {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-size: 0.82rem;
		text-decoration: none;
	}
	.languages {
		gap: 0;
	}
	.languages button {
		min-width: 44px;
		min-height: 44px;
		border: 0;
		background: none;
		color: var(--muted);
		cursor: pointer;
		font-size: 0.75rem;
	}
	.languages button[aria-pressed='true'] {
		color: var(--ink);
		text-decoration: underline;
		text-underline-offset: 0.4em;
	}
	.resume {
		gap: 1rem;
	}
	.hero {
		display: grid;
		grid-template-columns: 45% 55%;
		padding-top: clamp(3rem, 7vw, 7rem);
	}
	.hero-copy {
		padding: 1.5rem 0 2rem clamp(1.1rem, 4vw, 5rem);
	}
	.eyebrow {
		text-transform: uppercase;
		letter-spacing: 0.13em;
		font-size: 0.67rem;
		color: var(--copper);
	}
	h1 {
		font-size: clamp(2rem, 3.3vw, 3.5rem);
		margin-top: 1.8rem !important;
	}
	h1 span {
		display: block;
		font-size: clamp(1.1rem, 1.7vw, 1.7rem);
		color: var(--muted);
		letter-spacing: -0.02em;
		margin-top: 0.8rem;
	}
	.value {
		font-size: clamp(1.05rem, 1.7vw, 1.5rem);
		max-width: 34ch;
		margin-top: 2rem !important;
	}
	.text-link {
		display: inline-flex;
		min-height: 44px;
		align-items: center;
		gap: 2rem;
		margin-top: 2rem;
		font-size: 0.85rem;
	}
	.hero-aperture {
		position: relative;
		min-height: 20rem;
	}
	.hero-aperture span {
		position: absolute;
		right: clamp(1.1rem, 4vw, 5rem);
		bottom: 1rem;
		color: var(--muted);
		background: var(--paper);
		padding: 0.35rem 0.6rem;
		font-size: 0.62rem;
		letter-spacing: 0.05em;
	}
	.giant-name {
		grid-column: 1 / -1;
		font-size: clamp(5rem, 21.5vw, 24rem);
		font-weight: 700;
		letter-spacing: -0.08em;
		line-height: 0.85;
		padding: 0.12em clamp(1.1rem, 4vw, 5rem) 0.06em;
		background: var(--paper);
	}
	.giant-name span {
		font-size: 0.12em;
		vertical-align: top;
		margin-left: 0.4em;
		line-height: 2;
		letter-spacing: 0;
		color: var(--copper);
	}
	.hero-foot {
		grid-column: 1 / -1;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.5rem clamp(1.1rem, 4vw, 5rem) 2.5rem;
		font-size: 0.65rem;
		color: var(--muted);
		letter-spacing: 0.08em;
	}
	.project {
		padding: clamp(4rem, 9vw, 9rem) clamp(1.1rem, 4vw, 5rem);
	}
	.project-top {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		border-top: 1px solid var(--line);
		padding: 1.25rem 0 3rem;
		font-size: 0.72rem;
		color: var(--muted);
	}
	.project-layout {
		display: grid;
		grid-template-columns: minmax(0, 45fr) minmax(0, 55fr);
		gap: clamp(1.5rem, 4vw, 5rem);
		align-items: start;
	}
	.project-copy {
		padding: 1.5rem 1rem 1.5rem 0;
	}
	h2 {
		font-size: clamp(2.8rem, 6vw, 6.5rem);
		overflow-wrap: anywhere;
	}
	h2 > span {
		color: var(--copper);
	}
	.project-summary {
		margin-top: 2rem !important;
		font-size: clamp(1.15rem, 2vw, 1.65rem);
		line-height: 1.45;
		max-width: 35ch;
	}
	.project-description {
		margin-block: 1.5rem 2.5rem !important;
		color: var(--muted);
		font-size: 0.9rem;
		max-width: 55ch;
	}
	h3 {
		font-size: 0.75rem;
		letter-spacing: 0.04em !important;
		text-transform: uppercase;
	}
	.contributions {
		padding-left: 1rem;
		margin-top: 1rem;
		font-size: 0.8rem;
		color: var(--muted);
	}
	.contributions li {
		padding-left: 0.3rem;
		margin-bottom: 0.85rem;
	}
	.contributions li::marker {
		color: var(--copper);
	}
	.project-visual {
		min-width: 0;
		padding-top: 5rem;
	}
	.sculpture-window {
		min-height: clamp(14rem, 30vw, 26rem);
	}
	.diagram {
		margin: 0;
		padding: 1rem;
		border-block: 1px solid var(--line);
	}
	svg {
		display: block;
		width: 100%;
		height: auto;
	}
	.linework {
		stroke: var(--copper);
		stroke-width: 1.2;
	}
	svg text {
		fill: var(--ink);
		font-size: 13px;
		font-family: Arial, Helvetica, sans-serif;
	}
	figcaption {
		font-size: 0.67rem;
		color: var(--muted);
		padding: 1.5rem 0 0.5rem;
		max-width: 62ch;
	}
	.layers {
		padding: 2rem 1rem;
	}
	.layers dl {
		margin: 1.5rem 0 0;
	}
	.layers dl > div {
		display: grid;
		grid-template-columns: 30% minmax(0, 1fr);
		gap: 1rem;
		padding: 0.9rem 0;
		border-top: 1px solid var(--line);
		font-size: 0.75rem;
	}
	dt {
		color: var(--muted);
	}
	dd {
		margin: 0;
	}
	dd strong {
		font-weight: 500;
	}
	dd span {
		display: block;
		color: var(--muted);
		font-size: 0.7rem;
		margin-top: 0.35rem;
	}
	.project-offset {
		padding-top: 3rem;
	}
	.project-offset .project-copy {
		padding-top: 7rem;
	}
	.project-offset .project-visual {
		padding-top: 0;
	}
	.project-wide .project-layout {
		grid-template-columns: minmax(0, 52fr) minmax(0, 48fr);
	}
	.project-wide h2 {
		font-size: clamp(2.8rem, 5.5vw, 6rem);
		max-width: 10ch;
	}
	.about {
		display: grid;
		grid-template-columns: minmax(0, 45fr) minmax(0, 55fr);
		gap: clamp(2rem, 6vw, 7rem);
		padding: clamp(4rem, 9vw, 9rem) clamp(1.1rem, 4vw, 5rem);
		border-top: 1px solid var(--line);
	}
	.about h2 {
		font-size: clamp(2.5rem, 4.5vw, 5rem);
		margin: 2rem 0;
	}
	.about-intro > p:not(.eyebrow) {
		max-width: 43ch;
		color: var(--muted);
	}
	.education {
		margin-top: 3rem;
		font-size: 0.8rem;
		color: var(--muted);
	}
	.education h3 {
		margin-bottom: 1rem;
	}
	.career {
		padding-top: 0.3rem;
	}
	.career ol {
		list-style: none;
		padding: 0;
		margin: 1.5rem 0 0;
	}
	.career li {
		padding: 1.6rem 0;
		border-top: 1px solid var(--line);
	}
	.career-period {
		color: var(--copper);
		font-size: 0.7rem;
	}
	.company {
		font-size: 1.1rem;
		margin-top: 0.6rem !important;
	}
	.career .career-role {
		font-size: 0.85rem;
		letter-spacing: 0;
		margin: 0.5rem 0 0.75rem;
	}
	.career li > p:last-child {
		color: var(--muted);
		font-size: 0.78rem;
		max-width: 65ch;
	}
	.contact-wrap {
		border-top: 1px solid var(--line);
	}
	.site-footer {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem;
		margin: 0;
		padding: 1.5rem clamp(1.1rem, 4vw, 5rem);
		border-top: 1px solid var(--line);
		color: var(--muted);
		font-size: 0.7rem;
	}
	.site-footer a {
		display: inline-flex;
		gap: 2rem;
		align-items: center;
		min-height: 44px;
		text-decoration: none;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
	@media (max-width: 760px) {
		.site-header {
			gap: 0.5rem;
		}
		.wordmark {
			flex: 1;
		}
		nav {
			order: 3;
			width: 100%;
			justify-content: space-between;
			border-top: 1px solid var(--line);
			gap: 1rem;
		}
		.header-tools {
			gap: 0.25rem;
		}
		.hero {
			display: flex;
			flex-direction: column;
			padding-top: 2rem;
		}
		.hero-copy {
			padding: 1rem 1.1rem 2rem;
		}
		.value {
			max-width: 43ch;
		}
		.hero-aperture {
			min-height: 34svh;
		}
		.giant-name {
			font-size: 23vw;
			padding-block: 0.2em;
		}
		.giant-name span {
			font-size: 0.1em;
		}
		.project-top {
			flex-direction: column;
			padding-bottom: 1.5rem;
			gap: 0.6rem;
		}
		.project-layout,
		.project-wide .project-layout,
		.about {
			grid-template-columns: minmax(0, 1fr);
		}
		.project-copy,
		.project-offset .project-copy {
			padding: 1rem 0;
		}
		.project-visual {
			padding-top: 0;
		}
		.project-summary {
			max-width: 43ch;
		}
		.project-wide h2 {
			max-width: none;
		}
		.layers {
			padding-inline: 0;
		}
		.about {
			gap: 3rem;
		}
	}
	@media (max-width: 359px) {
		.wordmark {
			gap: 0.3rem;
		}
		.wordmark span:last-child {
			font-size: 0.53rem;
		}
		.resume {
			font-size: 0.7rem;
			gap: 0.25rem;
		}
		.languages button {
			min-width: 44px;
		}
	}
	@media (forced-colors: active) {
		.systems {
			--paper: Canvas;
			--ink: CanvasText;
			--muted: CanvasText;
			--copper: LinkText;
			--line: ButtonText;
			--surface: Canvas;
			--focus: Highlight;
		}
		.world {
			display: none;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.systems :global(*) {
			scroll-behavior: auto !important;
			animation: none !important;
			transition: none !important;
		}
	}
</style>
