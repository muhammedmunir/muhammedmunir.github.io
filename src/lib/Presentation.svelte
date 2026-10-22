<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { lang } from '$lib/i18n';
	import { motionPaused } from '$lib/motion';
	import {
		acquireScrollLock,
		releaseScrollLock,
		hasOpenModal,
		isTextEntryTarget,
		keyboardScrollRegion
	} from '$lib/deck/focus-utils';
	import { profile, projects, type Bi } from '$lib/deck/deck-data';
	import { contactChannels } from '$lib/deck/deck-evidence';
	import { projectEvidence } from '$lib/cortex-data';

	let { onClose }: { onClose: () => void } = $props();
	let dialog: HTMLDialogElement;
	let reader: HTMLDivElement;
	let title = $state<HTMLHeadingElement>();
	let chapter = $state(0);
	let reducedMotion = $state(false);
	let ownsLock = false;
	let finished = false;
	let opener: HTMLElement | null = null;
	const copy = (ms: string, en: string) => ($lang === 'ms' ? ms : en);
	const bi = (value: Bi) => value[$lang];
	const chapterNames = $derived(
		$lang === 'ms'
			? ['Diri', 'Masalah', 'Hasil kerja', 'Pendekatan', 'Hubungi']
			: ['Identity', 'The problem', 'The work', 'Approach', 'Contact']
	);
	const headings = $derived(
		$lang === 'ms'
			? [
					'Saya membina apa yang berlaku di sebalik skrin.',
					'Daripada borang kertas kepada aliran yang jelas.',
					'Tiga sistem. Tiga keperluan sebenar.',
					'Antara muka hanyalah lapisan pertama.',
					'Mari bincangkan sistem anda.'
				]
			: [
					'I build what happens behind the screen.',
					'From paper forms to a clear workflow.',
					'Three systems. Three real needs.',
					'The interface is only the first layer.',
					'Let’s talk about your system.'
				]
	);
	const loan = projects.find((project) => project.key === 'iwa001')!;
	const onboarding = projects.find((project) => project.key === 'onboardx')!;
	const publicProject = $derived(projectEvidence('emesys', $lang));
	const layers = $derived(
		chapter === 1
			? [
					copy('Permohonan', 'Application'),
					copy('Semakan pegawai', 'Officer review'),
					copy('Kelulusan & PDF', 'Approval & PDF')
				]
			: [
					copy('Antara muka', 'Interface'),
					copy('Identiti & data', 'Identity & data'),
					copy('Infrastruktur', 'Infrastructure')
				]
	);

	async function selectChapter(index: number, focusTitle = false) {
		const next = Math.max(0, Math.min(4, index));
		if (chapter === next) return;
		chapter = next;
		await tick();
		reader?.scrollTo({ top: 0, behavior: 'instant' });
		if (focusTitle) title?.focus({ preventScroll: true });
	}

	function finish() {
		if (finished) return;
		finished = true;
		if (ownsLock) {
			releaseScrollLock();
			ownsLock = false;
		}
		if (opener?.isConnected) opener.focus({ preventScroll: true });
	}
	function close() {
		if (finished) return;
		dialog?.close();
		finish();
		onClose();
	}
	function keydown(event: KeyboardEvent) {
		if (
			event.defaultPrevented ||
			event.ctrlKey ||
			event.metaKey ||
			event.altKey ||
			isTextEntryTarget(event.target)
		)
			return;
		const next =
			event.key === 'ArrowRight'
				? chapter + 1
				: event.key === 'ArrowLeft'
					? chapter - 1
					: event.key === 'Home'
						? 0
						: event.key === 'End'
							? 4
							: null;
		if (next === null) return;
		event.preventDefault();
		void selectChapter(next);
	}
	onMount(() => {
		opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		if (hasOpenModal(dialog)) {
			onClose();
			return;
		}
		const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => {
			reducedMotion = preference.matches;
		};
		sync();
		preference.addEventListener('change', sync);
		dialog.showModal();
		acquireScrollLock();
		ownsLock = true;
		title?.focus({ preventScroll: true });
		return () => {
			preference.removeEventListener('change', sync);
			dialog.close();
			finish();
		};
	});
</script>

<dialog
	bind:this={dialog}
	class="story"
	class:motion-off={reducedMotion || $motionPaused}
	aria-labelledby="story-label"
	onkeydown={keydown}
	oncancel={(event) => {
		event.preventDefault();
		close();
	}}
	onclose={() => {
		if (!finished) close();
	}}
>
	<div class="story-shell">
		<header class="masthead">
			<h2 id="story-label">{copy('Cerita Ringkas', 'A Short Story')}</h2>
			<span class="byline">Muhammed Munir</span>
			<button type="button" class="close" onclick={close}
				>{copy('Tutup', 'Close')} <span aria-hidden="true">×</span></button
			>
		</header>
		<nav class="chapters" aria-label={copy('Pilih bab', 'Choose a chapter')}>
			{#each chapterNames as name, index}
				<button
					type="button"
					aria-current={chapter === index ? 'step' : undefined}
					onclick={() => selectChapter(index)}
				>
					<span class="chapter-number">0{index + 1}</span><span>{name}</span>
				</button>
			{/each}
		</nav>
		<div
			class="reader"
			role="region"
			bind:this={reader}
			use:keyboardScrollRegion
			aria-label={copy('Kandungan bab', 'Chapter content')}
		>
			{#key chapter}
				<article class="chapter">
					<div class="chapter-copy">
						<p class="folio">
							{copy('Di Sebalik Sistem', 'Behind the System')} <span aria-hidden="true">/</span>
							0{chapter + 1}
						</p>
						<h3 tabindex="-1" bind:this={title}>{headings[chapter]}</h3>
						{#if chapter === 0}
							<p class="lead">
								{copy(
									'Saya Muhammed Munir, pembangun full-stack dengan asas keselamatan rangkaian. Dari aplikasi web dan mudah alih hingga pangkalan data dan pelayan, saya menyambungkan bahagian-bahagiannya.',
									'I’m Muhammed Munir, a full-stack developer with a network security foundation. From web and mobile applications to databases and servers, I connect the pieces.'
								)}
							</p>
							<p class="note">
								{profile.location} · {copy(
									'BSc Sains Komputer (Keselamatan Rangkaian), UTM',
									'B.Sc. Computer Science (Network Security), UTM'
								)}
							</p>
						{:else if chapter === 1}
							<p class="lead">
								{copy(
									'Dalam IWA001, proses pinjaman bercagar berasaskan kertas dipindahkan ke satu sistem: pemohon menghantar maklumat, pegawai menyemak dokumen, dan admin merekod keputusan.',
									'In IWA001, a paper-based collateralised loan process moved into one system: applicants submit information, officers review documents, and admins record decisions.'
								)}
							</p>
							<p class="note">
								{copy(
									'Borang lima langkah, akses mengikut peranan, jejak audit dan surat kelulusan PDF.',
									'A five-step form, role-based access, an audit trail and PDF approval letters.'
								)}
							</p>
						{:else if chapter === 2}
							<p class="lead">
								{copy(
									'Menyelenggara sistem yang sedang digunakan. Membina aliran baharu apabila proses lama tidak lagi mencukupi.',
									'Maintaining systems people already use. Building new workflows when the old process is no longer enough.'
								)}
							</p>
						{:else if chapter === 3}
							<p class="lead">
								{copy(
									'Pengesahan identiti, pengasingan data dan deployment perlu direka bersama — bukan ditambah selepas skrin siap.',
									'Authentication, data isolation and deployment belong in the same design — not as additions after the screens are finished.'
								)}
							</p>
							<p class="note">
								{copy(
									'Supabase RLS dalam IWA001. RBAC dalam sistem sektor awam. Vercel, Azure atau Docker mengikut beban kerja.',
									'Supabase RLS in IWA001. RBAC in public-sector systems. Vercel, Azure or Docker to suit the workload.'
								)}
							</p>
						{:else}
							<p class="lead">
								{copy(
									'Untuk berbincang tentang projek, peranan atau ketersediaan semasa, hubungi saya terus. Latar belakang penuh ada dalam resume.',
									'For projects, roles or current availability, contact me directly. My full background is in the resume.'
								)}
							</p>
							<a class="primary-link" href="/resume.pdf" target="_blank" rel="noreferrer"
								>{copy('Baca resume (PDF)', 'Read resume (PDF)')}
								<span class="link-note">{copy('tab baharu', 'new tab')}</span></a
							>
						{/if}
					</div>
					{#if chapter === 2}
						<div class="work-index">
							<div class="work-row">
								<span class="work-number">01</span>
								<div>
									<h4>eMesys</h4>
									<p>{publicProject.desc}</p>
									<small>Vue.js 3 · Laravel · MariaDB · Docker Swarm</small>
								</div>
							</div>
							<div class="work-row">
								<span class="work-number">02</span>
								<div>
									<h4>IWA001</h4>
									<p>
										{copy(
											'Permohonan, semakan dan kelulusan pinjaman bercagar dalam satu aliran.',
											'Collateralised loan application, review and approval in one workflow.'
										)}
									</p>
									<a href={loan.docHref} target="_blank" rel="noreferrer"
										>{copy('Kajian kes (PDF, tab baharu)', 'Case study (PDF, new tab)')}</a
									>
								</div>
							</div>
							<div class="work-row">
								<span class="work-number">03</span>
								<div>
									<h4>OnboardX</h4>
									<p>{bi(onboarding.subtitle)}</p>
									<small>Flutter · Firebase · MongoDB · Supabase · Azure</small>
								</div>
							</div>
						</div>
					{:else if chapter === 4}
						<address class="contact-sheet">
							<span class="contact-initial" aria-hidden="true">M.</span>
							{#each contactChannels as channel}
								<div>
									<span>{bi(channel.label)}</span>{#if channel.href}<a href={channel.href}
											>{channel.value}</a
										>{:else}<p>{channel.value}</p>{/if}
								</div>
							{/each}
						</address>
					{:else}
						<figure class="system-figure">
							<svg
								width="480"
								height="400"
								viewBox="0 0 480 400"
								role="img"
								aria-labelledby="layers-title"
							>
								<title id="layers-title"
									>{copy(
										'Rajah konsep tiga lapisan sistem',
										'Conceptual diagram of three system layers'
									)}</title
								>
								<path d="M240 56V350" stroke="#75442b" stroke-width="1.5" stroke-dasharray="4 7" />
								{#each layers as layer, index}
									<g transform={`translate(0 ${index * 83})`}>
										<path
											d="M54 112 240 42 426 112 240 182Z"
											fill={index === 0 ? '#e2c7b0' : index === 1 ? '#e8ddd0' : '#f3eee6'}
											stroke="#75442b"
										/>
										<path
											d="M54 112V125L240 195 426 125V112L240 182Z"
											fill={index === 0 ? '#c49a77' : '#d8c9b8'}
											stroke="#75442b"
										/>
										<text x="240" y="118" text-anchor="middle" fill="#201e1b" font-size="17"
											>{layer}</text
										>
									</g>
								{/each}
							</svg>
							<figcaption>
								<span
									>0{chapter + 1} / {copy(
										'Satu sistem, bahagian yang saling berkait.',
										'One system, interconnected parts.'
									)}</span
								><span>{copy('Rajah konsep', 'Conceptual diagram')}</span>
							</figcaption>
						</figure>
					{/if}
				</article>
			{/key}
		</div>
		<footer class="reader-footer">
			<button
				type="button"
				disabled={chapter === 0}
				onclick={() => selectChapter(chapter - 1, true)}>{copy('Sebelum', 'Previous')}</button
			>
			<p aria-live="polite">
				{copy('Bab', 'Chapter')}
				{chapter + 1} / 5 <span class="key-hint">· ← → · Home / End</span>
			</p>
			<button
				type="button"
				disabled={chapter === 4}
				onclick={() => selectChapter(chapter + 1, true)}>{copy('Seterusnya', 'Next')}</button
			>
		</footer>
	</div>
</dialog>

<style>
	.story {
		--paper: #f3eee6;
		--ink: #201e1b;
		--copper: #75442b;
		color: var(--ink);
		background: var(--paper);
		border: 1px solid #8b7967;
		padding: 0;
		width: min(1200px, calc(100% - 48px));
		max-width: none;
		max-height: calc(100dvh - 48px);
		margin: auto;
		box-shadow: 0 28px 100px #201e1b38;
	}
	.story::backdrop {
		background: #201e1b99;
		backdrop-filter: blur(6px);
	}
	.story-shell {
		display: flex;
		flex-direction: column;
		height: min(790px, calc(100dvh - 50px));
	}
	.masthead {
		display: flex;
		align-items: center;
		gap: 24px;
		padding: 18px 32px;
		border-bottom: 1px solid #c8bcad;
	}
	.masthead h2 {
		font:
			500 1.2rem/1.3 Georgia,
			serif;
		margin: 0;
	}
	.byline {
		font-size: 0.8rem;
		color: #62564a;
		margin-left: auto;
	}
	button,
	a {
		-webkit-tap-highlight-color: transparent;
	}
	button {
		min-width: 44px;
		min-height: 44px;
		font: inherit;
		cursor: pointer;
		color: var(--ink);
		background: transparent;
		border: 1px solid #897867;
		padding: 8px 16px;
	}
	button:hover:not(:disabled),
	a:hover {
		background: #e6dccc;
	}
	button:active:not(:disabled) {
		transform: scale(0.98);
	}
	button:disabled {
		opacity: 0.45;
		cursor: default;
	}
	button:focus-visible,
	a:focus-visible,
	.reader:focus-visible {
		outline: 3px solid var(--copper);
		outline-offset: 4px;
	}
	h3:focus {
		outline: none;
	}
	.close {
		border: none;
		display: flex;
		gap: 16px;
		align-items: center;
	}
	.close span {
		font-size: 1.6rem;
	}
	.chapters {
		display: flex;
		gap: 8px;
		padding: 14px 32px;
		flex-wrap: wrap;
		border-bottom: 1px solid #c8bcad;
	}
	.chapters button {
		border: 1px solid transparent;
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 0.83rem;
		padding: 8px 12px;
	}
	.chapters button[aria-current] {
		border-color: var(--copper);
		color: var(--copper);
		background: #e9dfd2;
	}
	.chapter-number,
	.folio,
	.work-number,
	.reader-footer p {
		font-variant-numeric: tabular-nums;
	}
	.chapter-number {
		font-size: 0.72rem;
	}
	.reader {
		overflow-y: auto;
		min-height: 0;
		flex: 1;
		overscroll-behavior: contain;
	}
	.chapter {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: clamp(28px, 5vw, 72px);
		align-items: center;
		padding: clamp(28px, 4vw, 56px);
		min-height: 100%;
		box-sizing: border-box;
		animation: chapter-arrive 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	.chapter-copy {
		min-width: 0;
	}
	.folio {
		font-size: 0.75rem;
		color: var(--copper);
		display: flex;
		gap: 16px;
		margin: 0 0 28px;
	}
	h3 {
		font:
			400 clamp(2rem, 3.4vw, 3.35rem)/1.08 Georgia,
			'Times New Roman',
			serif;
		letter-spacing: -0.04em;
		margin: 0 0 24px;
		text-wrap: balance;
	}
	.lead {
		font-size: 1rem;
		line-height: 1.8;
		margin: 0;
		max-width: 48ch;
	}
	.note {
		color: #62564a;
		font-size: 0.84rem;
		line-height: 1.75;
		margin: 24px 0 0;
	}
	.system-figure {
		margin: 0;
		min-width: 0;
	}
	svg {
		display: block;
		width: 100%;
		height: auto;
		max-width: 480px;
		margin: auto;
		font-family: Georgia, serif;
	}
	figcaption {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 8px;
		border-top: 1px solid #b9a997;
		padding-top: 16px;
		font-size: 0.7rem;
		line-height: 1.6;
		color: #62564a;
	}
	.work-index {
		border-top: 1px solid #897867;
	}
	.work-row {
		display: flex;
		gap: 20px;
		border-bottom: 1px solid #c8bcad;
		padding: 20px 0;
	}
	.work-number {
		color: var(--copper);
		font-size: 0.75rem;
		padding-top: 4px;
	}
	h4 {
		font:
			400 1.55rem/1.2 Georgia,
			serif;
		margin: 0 0 8px;
	}
	.work-row p {
		font-size: 0.85rem;
		line-height: 1.65;
		margin: 0 0 8px;
	}
	.work-row small {
		color: #62564a;
		font-size: 0.73rem;
		line-height: 1.6;
	}
	a {
		color: var(--copper);
		text-underline-offset: 4px;
		overflow-wrap: anywhere;
	}
	.work-row a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-size: 0.8rem;
	}
	.primary-link {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		min-height: 44px;
		gap: 12px;
		margin-top: 24px;
	}
	.link-note {
		font-size: 0.7rem;
		color: #62564a;
	}
	.contact-sheet {
		font-style: normal;
		border-top: 1px solid #897867;
	}
	.contact-initial {
		display: block;
		font:
			400 6rem/1.4 Georgia,
			serif;
		color: var(--copper);
	}
	.contact-sheet > div {
		padding: 14px 0;
		border-top: 1px solid #c8bcad;
	}
	.contact-sheet div > span {
		display: block;
		font-size: 0.72rem;
		color: #62564a;
		margin-bottom: 4px;
	}
	.contact-sheet a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-size: clamp(0.85rem, 1.25vw, 1rem);
	}
	.contact-sheet p {
		margin: 10px 0;
	}
	.reader-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 16px 32px;
		border-top: 1px solid #c8bcad;
	}
	.reader-footer p {
		font-size: 0.75rem;
		text-align: center;
		margin: 0;
	}
	.key-hint {
		color: #62564a;
		margin-left: 12px;
	}
	@keyframes chapter-arrive {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.motion-off .chapter {
		animation: none;
	}
	@media (max-width: 1000px) {
		.chapter {
			gap: 32px;
			padding: 32px;
		}
		.byline {
			display: none;
		}
		.close {
			margin-left: auto;
		}
		.key-hint {
			display: none;
		}
	}
	@media (max-width: 720px) {
		.story {
			width: calc(100% - 16px);
			max-height: calc(100dvh - 16px);
		}
		.story-shell {
			height: calc(100dvh - 18px);
		}
		.masthead {
			padding: 10px 16px;
			gap: 12px;
		}
		.chapters {
			padding: 8px 12px;
			gap: 4px;
		}
		.chapters button {
			flex: 1;
			padding: 6px;
			flex-direction: column;
			gap: 2px;
			font-size: 0.67rem;
			min-width: 48px;
		}
		.chapter-number {
			font-size: 0.65rem;
		}
		.chapter {
			display: flex;
			flex-direction: column;
			align-items: stretch;
			justify-content: flex-start;
			gap: 32px;
			padding: 28px 24px 36px;
			min-height: 0;
		}
		.folio {
			margin-bottom: 20px;
		}
		h3 {
			font-size: clamp(2rem, 7vw, 2.8rem);
		}
		.lead {
			font-size: 0.95rem;
			line-height: 1.75;
		}
		.system-figure {
			width: 100%;
			max-width: 420px;
			align-self: center;
		}
		.reader-footer {
			padding: 12px;
			gap: 8px;
		}
		.reader-footer button {
			font-size: 0.8rem;
			padding: 8px 12px;
		}
		.reader-footer p {
			font-size: 0.68rem;
		}
		.contact-initial {
			font-size: 4rem;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.chapter {
			animation: none;
		}
		button:active:not(:disabled) {
			transform: none;
		}
	}
</style>
