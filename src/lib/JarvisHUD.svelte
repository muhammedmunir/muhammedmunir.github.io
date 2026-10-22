<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { lang } from '$lib/i18n';
	import {
		acquireScrollLock,
		releaseScrollLock,
		hasOpenModal,
		isTextEntryTarget,
		keyboardScrollRegion
	} from '$lib/deck/focus-utils';
	import { cortexProjects, projectList, projectEvidence } from '$lib/cortex-data';
	import { careers, publicSector } from '$lib/deck/deck-data';
	import { skillGroups, contactChannels } from '$lib/deck/deck-evidence';

	type Category = 'projects' | 'experience' | 'skills' | 'contact' | 'resume';
	type SearchEntry = {
		id: string;
		title: string;
		description: string;
		category: Category;
		href: string;
		keywords: string;
	};
	let dialog: HTMLDialogElement;
	let input: HTMLInputElement;
	let resultsRegion: HTMLDivElement;
	let query = $state('');
	let isOpen = $state(false);
	let opener: HTMLElement | null = null;
	let ownsLock = false;
	let mounted = false;
	let navigationFrame = 0;
	const copy = (ms: string, en: string) => ($lang === 'ms' ? ms : en);
	const categoryNames = $derived<Record<Category, string>>({
		projects: copy('Projek', 'Projects'),
		experience: copy('Pengalaman', 'Experience'),
		skills: copy('Kemahiran', 'Skills'),
		contact: copy('Hubungi', 'Contact'),
		resume: 'Resume'
	});
	const normalize = (value: string) =>
		value
			.normalize('NFKD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLocaleLowerCase();
	const entries = $derived.by((): SearchEntry[] => {
		const language = $lang;
		return [
			{
				id: 'all-projects',
				title: copy('Semua projek', 'All projects'),
				description: copy(
					'Terokai hasil kerja web, mudah alih, sistem perusahaan dan projek peribadi.',
					'Explore web, mobile, enterprise systems and personal projects.'
				),
				category: 'projects',
				href: '#projects',
				keywords: `projek projects portfolio ${projectList(language)}`
			},
			{
				id: 'experience',
				title: copy('Pengalaman kerja', 'Work experience'),
				description: copy(
					'YHCM, Nova Bitara dan Tenaga Nasional Berhad — pembangunan sistem, web, mudah alih dan keselamatan rangkaian.',
					'YHCM, Nova Bitara and Tenaga Nasional Berhad — systems, web, mobile and network security.'
				),
				category: 'experience',
				href: '#experience',
				keywords: 'career kerjaya experience pengalaman employment pekerjaan'
			},
			{
				id: 'skills',
				title: copy('Kemahiran teknikal', 'Technical skills'),
				description: copy(
					'Frontend, backend, data, infrastruktur dan keselamatan. Lihat teknologi serta konteks penggunaannya.',
					'Frontend, backend, data, infrastructure and security. See technologies and where they are used.'
				),
				category: 'skills',
				href: '#skills',
				keywords: 'skills kemahiran stack teknologi toolkit'
			},
			{
				id: 'contact',
				title: copy('Hubungi Muhammed Munir', 'Contact Muhammed Munir'),
				description: contactChannels.map((channel) => channel.value).join(' · '),
				category: 'contact',
				href: '#contact',
				keywords:
					'contact hubungi email e-mel phone telefon whatsapp lokasi location puchong selangor availability ketersediaan'
			},
			{
				id: 'resume',
				title: copy('Resume ATS (PDF)', 'ATS resume (PDF)'),
				description: copy(
					'Baca atau simpan resume penuh. Dibuka dalam tab baharu.',
					'Read or save the full resume. Opens in a new tab.'
				),
				category: 'resume',
				href: '/resume.pdf',
				keywords: 'resume cv curriculum vitae download muat turun pdf education pendidikan utm'
			},
			...cortexProjects.map((project): SearchEntry => {
				const evidence = projectEvidence(project.key, language);
				const other = projectEvidence(project.key, language === 'ms' ? 'en' : 'ms');
				return {
					id: project.key,
					title: evidence.title,
					description: evidence.desc,
					category: 'projects',
					href: '#projects',
					keywords: [
						...project.aliases,
						project.stack,
						...evidence.features,
						other.title,
						other.desc,
						...other.features
					].join(' ')
				};
			}),
			{
				id: 'yhcm',
				title: 'YHCM Sdn Bhd',
				description: publicSector.role[language],
				category: 'experience',
				href: '#experience',
				keywords: `${publicSector.responsibilities[language].join(' ')} eMesys Sutera ADIMS public sector sektor awam`
			},
			...careers.map(
				(career): SearchEntry => ({
					id: career.key,
					title: `${career.company} · ${career.type[language]}`,
					description: career.focus[language],
					category: 'experience',
					href: '#experience',
					keywords: `${career.tags.join(' ')} ${career.focus.ms} ${career.focus.en} ${career.location}`
				})
			),
			...skillGroups.flatMap((group) =>
				group.items.map(
					(skill): SearchEntry => ({
						id: `skill-${skill.name}`,
						title: skill.name,
						description: skill.what[language],
						category: 'skills',
						href: '#skills',
						keywords: `${skill.where.join(' ')} ${skill.what.ms} ${skill.what.en} ${group.title[language]}`
					})
				)
			)
		];
	});
	const results = $derived.by(() => {
		const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
		if (!terms.length) return entries.slice(0, 9);
		return entries
			.map((entry) => {
				const title = normalize(entry.title);
				const text = normalize(
					`${entry.title} ${entry.description} ${entry.keywords} ${categoryNames[entry.category]}`
				);
				return {
					entry,
					score: terms.every((term) => text.includes(term))
						? terms.reduce((score, term) => score + (title.includes(term) ? 4 : 1), 0)
						: 0
				};
			})
			.filter((match) => match.score > 0)
			.sort((a, b) => b.score - a.score)
			.map((match) => match.entry);
	});

	async function openSearch() {
		if (!mounted || dialog.open || hasOpenModal(dialog)) return;
		opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		query = '';
		dialog.showModal();
		acquireScrollLock();
		ownsLock = true;
		isOpen = true;
		await tick();
		if (mounted && dialog.open) {
			input.focus({ preventScroll: true });
			resultsRegion.scrollTop = 0;
		}
	}
	function finishClose() {
		if (!isOpen && !ownsLock) return;
		isOpen = false;
		if (ownsLock) {
			releaseScrollLock();
			ownsLock = false;
		}
		const target = opener;
		opener = null;
		if (target?.isConnected) target.focus({ preventScroll: true });
	}
	function closeSearch() {
		dialog?.close();
		finishClose();
	}
	function clearSearch() {
		query = '';
		input?.focus();
		resultsRegion?.scrollTo({ top: 0, behavior: 'instant' });
	}
	function navigate(event: MouseEvent, result: SearchEntry) {
		if (
			!result.href.startsWith('#') ||
			event.ctrlKey ||
			event.metaKey ||
			event.shiftKey ||
			event.altKey ||
			event.button !== 0
		) {
			closeSearch();
			return;
		}
		event.preventDefault();
		closeSearch();
		cancelAnimationFrame(navigationFrame);
		navigationFrame = requestAnimationFrame(() => {
			if (!mounted || hasOpenModal()) return;
			const section = document.getElementById(result.href.slice(1));
			if (!section) return;
			history.pushState(null, '', result.href);
			const target = section.querySelector<HTMLElement>('h2, h3') ?? section;
			const oldTabindex = target.getAttribute('tabindex');
			target.setAttribute('tabindex', '-1');
			target.addEventListener(
				'blur',
				() => {
					if (oldTabindex === null) target.removeAttribute('tabindex');
					else target.setAttribute('tabindex', oldTabindex);
				},
				{ once: true }
			);
			target.focus({ preventScroll: true });
			section.scrollIntoView({ behavior: 'instant', block: 'start' });
		});
	}
	onMount(() => {
		mounted = true;
		const externalOpen = () => {
			void openSearch();
		};
		const shortcut = (event: KeyboardEvent) => {
			if (
				event.defaultPrevented ||
				event.repeat ||
				event.isComposing ||
				isTextEntryTarget(event.target) ||
				event.altKey ||
				event.shiftKey
			)
				return;
			if (
				!(event.ctrlKey || event.metaKey) ||
				!['k', 'j'].includes(event.key.toLowerCase()) ||
				hasOpenModal(dialog)
			)
				return;
			event.preventDefault();
			if (dialog.open) closeSearch();
			else void openSearch();
		};
		window.addEventListener('open-jarvis', externalOpen);
		window.addEventListener('keydown', shortcut);
		return () => {
			mounted = false;
			cancelAnimationFrame(navigationFrame);
			window.removeEventListener('open-jarvis', externalOpen);
			window.removeEventListener('keydown', shortcut);
			closeSearch();
		};
	});
</script>

<dialog
	bind:this={dialog}
	id="portfolio-search"
	class="search-dialog"
	aria-labelledby="search-title"
	aria-describedby="search-description"
	oncancel={(event) => {
		event.preventDefault();
		closeSearch();
	}}
	onclose={() => {
		if (!dialog.open) finishClose();
	}}
>
	<header class="search-header">
		<div>
			<p class="index-label">{copy('Index portfolio', 'Portfolio index')}</p>
			<h2 id="search-title">{copy('Cari dalam portfolio', 'Search portfolio')}</h2>
		</div>
		<button class="close" type="button" onclick={closeSearch}
			>{copy('Tutup', 'Close')} <span aria-hidden="true">×</span></button
		>
	</header>
	<p id="search-description">
		{copy(
			'Cari nama projek, teknologi atau pengalaman. Carian kata kunci ini hanya menggunakan kandungan portfolio, tanpa menghantar pertanyaan ke pelayan.',
			'Find a project, technology or experience. This keyword search only uses portfolio content; your query is not sent to a server.'
		)}
	</p>
	<div class="search-field">
		<label for="portfolio-search-input">{copy('Kata kunci', 'Keywords')}</label>
		<div class="input-row">
			<svg
				width="22"
				height="22"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg
			>
			<input
				bind:this={input}
				id="portfolio-search-input"
				type="search"
				bind:value={query}
				onkeydown={(event) => {
					if (event.key === 'Escape' && !event.isComposing) {
						event.preventDefault();
						event.stopPropagation();
						closeSearch();
					}
				}}
				oninput={() => {
					if (resultsRegion) resultsRegion.scrollTop = 0;
				}}
				placeholder={copy('Contoh: eMesys, Flutter, resume', 'Try eMesys, Flutter, resume')}
				autocomplete="off"
				spellcheck="false"
				aria-controls="portfolio-search-results"
			/>
			{#if query}<button type="button" class="clear" onclick={clearSearch}
					>{copy('Padam', 'Clear')}</button
				>{/if}
		</div>
	</div>
	<div class="results-meta">
		<p role="status">
			{query.trim()
				? `${results.length} ${copy('padanan', 'results')}`
				: copy('Mulakan di sini', 'Start here')}
		</p>
		<span>{copy('Pautan ke bahagian portfolio', 'Links to portfolio sections')}</span>
	</div>
	<div
		class="results"
		id="portfolio-search-results"
		bind:this={resultsRegion}
		use:keyboardScrollRegion
		role="region"
		aria-label={copy('Hasil carian', 'Search results')}
	>
		{#if results.length}
			<ul>
				{#each results as result (result.id)}
					<li>
						<a
							href={result.href}
							onclick={(event) => navigate(event, result)}
							target={result.category === 'resume' ? '_blank' : undefined}
							rel={result.category === 'resume' ? 'noreferrer' : undefined}
						>
							<span class="category">{categoryNames[result.category]}</span>
							<div class="result-copy">
								<h3>{result.title}</h3>
								<p>{result.description}</p>
							</div>
							<span class="destination"
								>{result.category === 'resume' ? 'PDF' : copy('Lihat', 'View')}</span
							>
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<div class="empty">
				<h3>{copy('Tiada padanan untuk kata kunci ini.', 'No matches for these keywords.')}</h3>
				<p>
					{copy(
						'Cuba nama projek atau teknologi seperti Laravel, Supabase atau Flutter.',
						'Try a project name or technology such as Laravel, Supabase or Flutter.'
					)}
				</p>
				<button type="button" onclick={clearSearch}
					>{copy('Tetapkan semula carian', 'Reset search')}</button
				>
			</div>
		{/if}
	</div>
	<footer>
		<span
			>{copy(
				'Tab untuk memilih pautan · Enter untuk membuka',
				'Tab to choose a link · Enter to open'
			)}</span
		><span>Esc · {copy('Tutup', 'Close')}</span>
	</footer>
</dialog>

<style>
	.search-dialog {
		--paper: #f3eee6;
		--ink: #201e1b;
		--copper: #75442b;
		color: var(--ink);
		background: var(--paper);
		padding: 0;
		border: 1px solid #897867;
		width: min(780px, calc(100% - 48px));
		max-width: none;
		max-height: min(840px, calc(100dvh - 64px));
		margin: auto;
		box-shadow: 0 28px 100px #201e1b38;
	}
	.search-dialog[open] {
		display: flex;
		flex-direction: column;
	}
	.search-dialog::backdrop {
		background: #201e1b99;
		backdrop-filter: blur(6px);
	}
	.search-header {
		display: flex;
		align-items: flex-start;
		gap: 20px;
		justify-content: space-between;
		padding: 32px 32px 16px;
	}
	.index-label {
		font-size: 0.75rem;
		color: var(--copper);
		margin: 0 0 12px;
	}
	h2 {
		font:
			400 clamp(1.8rem, 3vw, 2.5rem)/1.1 Georgia,
			serif;
		letter-spacing: -0.035em;
		margin: 0;
	}
	button {
		color: var(--ink);
		background: transparent;
		border: 1px solid #897867;
		min-height: 44px;
		min-width: 44px;
		padding: 8px 14px;
		font: inherit;
		cursor: pointer;
	}
	button:hover {
		background: #e6dccc;
	}
	button:active {
		transform: scale(0.98);
	}
	.close {
		display: flex;
		align-items: center;
		gap: 12px;
		border: 0;
		font-size: 0.8rem;
	}
	.close span {
		font-size: 1.5rem;
	}
	#search-description {
		color: #62564a;
		font-size: 0.85rem;
		line-height: 1.7;
		padding: 0 32px;
		margin: 0 0 24px;
	}
	.search-field {
		margin: 0 32px;
	}
	label {
		display: block;
		font-size: 0.75rem;
		margin-bottom: 8px;
	}
	.input-row {
		display: flex;
		gap: 12px;
		align-items: center;
		border: 1px solid #897867;
		background: #faf7f1;
		padding: 4px 8px 4px 16px;
	}
	.input-row:focus-within {
		outline: 2px solid var(--copper);
		outline-offset: 3px;
	}
	.input-row svg {
		width: 22px;
		height: 22px;
		flex-shrink: 0;
		display: block;
	}
	input {
		font: inherit;
		font-size: 1rem;
		min-width: 0;
		width: 100%;
		height: 48px;
		background: transparent;
		border: 0;
		color: var(--ink);
	}
	input:focus-visible {
		outline: 2px solid var(--copper);
		outline-offset: 0;
	}
	input::placeholder {
		color: #6a5d50;
		opacity: 1;
	}
	input::-webkit-search-cancel-button {
		display: none;
	}
	.clear {
		font-size: 0.75rem;
		border: 0;
		padding: 8px;
	}
	.results-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
		padding: 24px 32px 12px;
		font-size: 0.72rem;
		color: #62564a;
	}
	.results-meta p {
		margin: 0;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
	}
	.results {
		overflow-y: auto;
		min-height: 0;
		overscroll-behavior: contain;
	}
	ul {
		list-style: none;
		padding: 0 24px 16px;
		margin: 0;
	}
	li {
		border-top: 1px solid #c8bcad;
	}
	li a {
		display: grid;
		grid-template-columns: 90px minmax(0, 1fr) 38px;
		gap: 16px;
		align-items: baseline;
		padding: 20px 8px;
		min-height: 44px;
		text-decoration: none;
		color: var(--ink);
	}
	li a:hover {
		background: #e6dccc;
	}
	.category {
		color: var(--copper);
		font-size: 0.72rem;
	}
	h3 {
		font:
			400 1.22rem/1.3 Georgia,
			serif;
		margin: 0 0 6px;
		overflow-wrap: anywhere;
	}
	.result-copy p {
		color: #62564a;
		font-size: 0.8rem;
		line-height: 1.65;
		margin: 0;
		display: -webkit-box;
		line-clamp: 2;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.destination {
		color: var(--copper);
		font-size: 0.7rem;
		text-align: right;
	}
	.empty {
		padding: 32px;
	}
	.empty p {
		color: #62564a;
		font-size: 0.9rem;
		line-height: 1.7;
		margin: 12px 0 24px;
	}
	.empty button {
		color: var(--copper);
	}
	footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 8px;
		border-top: 1px solid #c8bcad;
		padding: 16px 32px;
		font-size: 0.7rem;
		color: #62564a;
	}
	button:focus-visible,
	a:focus-visible,
	.results:focus-visible {
		outline: 3px solid var(--copper);
		outline-offset: -3px;
	}
	@media (max-width: 600px) {
		.search-dialog {
			width: calc(100% - 16px);
			max-height: calc(100dvh - 24px);
		}
		.search-header {
			padding: 24px 20px 16px;
			gap: 8px;
		}
		h2 {
			font-size: clamp(1.8rem, 7vw, 2.2rem);
		}
		.close {
			padding: 8px;
			gap: 6px;
		}
		#search-description {
			padding: 0 20px;
			margin-bottom: 20px;
			font-size: 0.8rem;
		}
		.search-field {
			margin: 0 20px;
		}
		.input-row {
			gap: 8px;
			padding-left: 12px;
		}
		input {
			font-size: 1rem;
		}
		.results-meta {
			padding: 20px 20px 12px;
		}
		.results-meta > span {
			display: none;
		}
		ul {
			padding: 0 12px 16px;
		}
		li a {
			grid-template-columns: minmax(0, 1fr) 38px;
			gap: 6px 12px;
			padding: 16px 8px;
		}
		.category {
			grid-column: 1;
		}
		.result-copy {
			grid-column: 1;
			grid-row: 2;
		}
		.destination {
			grid-column: 2;
			grid-row: 2;
		}
		footer {
			padding: 12px 20px;
			font-size: 0.65rem;
		}
		.empty {
			padding: 24px 20px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		button:active {
			transform: none;
		}
	}
</style>
