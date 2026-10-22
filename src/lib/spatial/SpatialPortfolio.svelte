<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { lang, toggleLang } from '$lib/i18n';
	import { translations } from '$lib/translations';
	import { systemProjects, systemEvidence } from '$lib/system-projects';
	import Experience from '$lib/Experience.svelte';
	import Contact from '$lib/Contact.svelte';
	import StaticMachine from './StaticMachine.svelte';
	import { CHAPTER_ORDER, INITIAL_CHAPTER, type ChapterId, type SpatialScene } from './contract';
	import { acquireScrollLock, releaseScrollLock, hasOpenModal } from '$lib/deck/focus-utils';

	let host: HTMLDivElement;
	let dialog: HTMLDialogElement;
	let dialogHeading: HTMLHeadingElement;
	let homeButton: HTMLButtonElement;
	let controller: SpatialScene | undefined;
	let chapter = $state<ChapterId>(INITIAL_CHAPTER);
	let ready = $state(false);
	let fallback = $state(false);
	let paused = $state(false);
	let reduced = $state(false);
	let intro = $state(false);
	let languageConfirmation = $state('');
	let view = $state<'project' | 'about' | 'contact'>('about');
	let detailKey = $state('emesys');
	let modalOpen = $state(false);
	let opener: HTMLElement | null = null;
	let ownsLock = false;
	let disposed = false;
	let actionRevision = 0;
	let pendingIntent: 'chapter' | 'replay' | 'skip' | undefined;
	const copy = (ms: string, en: string) => ($lang === 'ms' ? ms : en);
	const index = $derived(CHAPTER_ORDER.indexOf(chapter));
	const project = $derived(systemProjects.find((item) => item.key === chapter));
	const detailProject = $derived(systemProjects.find((item) => item.key === detailKey)!);
	const evidence = $derived(systemEvidence(detailProject, $lang));
	const labels = $derived({
		intro: copy('Pengenalan', 'Introduction'),
		emesys: 'eMesys',
		onboardx: 'OnboardX',
		cv_bot: copy('Visi komputer', 'Computer vision'),
		background: copy('Latar belakang', 'Background'),
		contact: copy('Hubungi', 'Contact')
	});
	const titles = $derived({
		intro: 'Muhammed Munir',
		emesys: 'eMesys',
		onboardx: 'OnboardX',
		cv_bot: 'Computer Vision & Win32 Automation Suite',
		background: copy('Di sebalik hasil kerja.', 'Behind the work.'),
		contact: copy('Mari bina yang seterusnya.', 'Let’s build what’s next.')
	});
	const sceneStates: Record<ChapterId, string> = {
		intro: 'closed',
		emesys: 'inside-emesys',
		onboardx: 'unfolded-onboardx',
		cv_bot: 'optical-cv',
		background: 'exploded-background',
		contact: 'return'
	};
	const dialogTitle = $derived(
		view === 'project'
			? detailKey === 'cv_bot'
				? titles.cv_bot
				: detailProject.name
			: view === 'about'
				? copy('Muhammed Munir: Latar belakang & kerjaya', 'Muhammed Munir: Background & career')
				: copy('Hubungi Muhammed Munir', 'Contact Muhammed Munir')
	);

	function changeLanguage() {
		toggleLang();
		languageConfirmation = copy('Bahasa Melayu dipilih.', 'English language selected.');
	}
	function go(next: ChapterId) {
		chapter = next;
		intro = false;
		actionRevision++;
		pendingIntent = 'chapter';
		controller?.goChapter(next);
	}
	function togglePause() {
		paused = !paused;
		controller?.pause(paused);
	}
	function replay() {
		chapter = 'intro';
		actionRevision++;
		pendingIntent = 'replay';
		intro = !reduced;
		controller?.replay();
	}
	function skip() {
		actionRevision++;
		pendingIntent = 'skip';
		intro = false;
		controller?.skip();
	}
	function finishDialog(restore = true) {
		modalOpen = false;
		if (ownsLock) {
			releaseScrollLock();
			ownsLock = false;
		}
		if (restore && !disposed) {
			(opener?.isConnected ? opener : homeButton)?.focus({ preventScroll: true });
		}
		opener = null;
	}
	function closeDialog() {
		dialog?.close();
		finishDialog();
	}
	async function openDialog(next: typeof view, key?: string) {
		if (modalOpen || hasOpenModal()) return;
		opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		view = next;
		if (key) detailKey = key;
		await tick();
		if (disposed || !dialog?.isConnected) return;
		try {
			dialog.showModal();
			acquireScrollLock();
			ownsLock = true;
			modalOpen = true;
			dialog.scrollTop = 0;
			dialogHeading.focus({ preventScroll: true });
		} catch {
			finishDialog();
		}
	}

	onMount(() => {
		disposed = false;
		const media = matchMedia('(prefers-reduced-motion: reduce)');
		reduced = media.matches;
		const change = () => {
			reduced = media.matches;
			if (reduced) intro = false;
			controller?.reducedMotion(reduced);
		};
		const fail = () => {
			if (disposed) return;
			fallback = true;
			ready = true;
			intro = false;
		};
		media.addEventListener('change', change);
		// The synchronous cleanup also guards the scene's internal import boundary.
		void import('./scene')
			.then(({ createSpatialScene }) => {
				if (disposed) return;
				return createSpatialScene(host, {
					reduced: media.matches,
					initialChapter: chapter,
					paused,
					isDisposed: () => disposed,
					onReady: () => {
						/* Informational only: controller is not assigned yet. */
					},
					onIntro: (value) => {
						if (!disposed && !fallback) intro = value;
					},
					onFailure: fail
				});
			})
			.then((scene) => {
				if (!scene) return;
				if (disposed || fallback) {
					scene.destroy();
					return;
				}
				controller = scene;
				controller.reducedMotion(media.matches);
				controller.pause(paused);
				// Read live intent only after assignment; callbacks never select a chapter.
				if (actionRevision > 0 || chapter !== INITIAL_CHAPTER) {
					if (pendingIntent === 'replay') controller.replay();
					else {
						controller.goChapter(chapter);
						if (pendingIntent === 'skip') controller.skip();
					}
				}
				ready = true;
			})
			.catch(fail);
		return () => {
			disposed = true;
			media.removeEventListener('change', change);
			if (dialog?.open) dialog.close();
			finishDialog(false);
			controller?.destroy();
			controller = undefined;
		};
	});
</script>

<div
	class="spatial"
	data-chapter={chapter}
	data-scene-state={sceneStates[chapter]}
	data-motion={fallback
		? 'static'
		: reduced
			? 'reduced'
			: paused
				? 'paused'
				: intro
					? 'intro'
					: 'enabled'}
	data-ready={ready}
	data-renderer={fallback ? 'static-svg' : ready ? 'webgl' : 'loading'}
	data-paused={paused}
	data-reduced-motion={reduced}
>
	<a class="skip" href="#spatial-content">{copy('Langkau ke kandungan', 'Skip to content')}</a>
	<header class="shell-header">
		<button
			class="identity"
			type="button"
			onclick={() => go('intro')}
			bind:this={homeButton}
			aria-label={copy(
				'M. Muhammed Munir: Kembali ke pengenalan',
				'M. Muhammed Munir: Return to introduction'
			)}>M.<span>MUHAMMED MUNIR</span></button
		>
		<nav class="header-actions" aria-label={copy('Pautan utama', 'Primary links')}>
			<button
				type="button"
				onclick={changeLanguage}
				aria-label={copy('BM / EN: Switch to English', 'EN / BM: Tukar ke Bahasa Melayu')}
				>{$lang === 'ms' ? 'BM / EN' : 'EN / BM'}</button
			>
			<a href="/resume.pdf" download="Resume_Muhammed_Munir.pdf"
				>Resume <span aria-hidden="true">↗</span><span class="sr-only"> PDF</span></a
			>
			<button class="contact-action" type="button" onclick={() => openDialog('contact')}
				>{copy('Hubungi', 'Contact')} <span aria-hidden="true">↗</span></button
			>
		</nav>
	</header>
	<main id="spatial-content" tabindex="-1">
		<div class="chapter-heading">
			<p class="eyebrow">{String(index + 1).padStart(2, '0')} / 06: {labels[chapter]}</p>
			<h1 class:name={chapter === 'intro'}>
				{#if chapter === 'intro'}<span>Muhammed</span>
					<span>Munir<span class="period">.</span></span>{:else}{titles[chapter]}{/if}
			</h1>
			<p class="chapter-context">
				{chapter === 'intro'
					? copy(
							'Pembangun Full-Stack / Puchong, Selangor',
							'Full-Stack Developer / Puchong, Selangor'
						)
					: project
						? project.context[$lang]
						: chapter === 'background'
							? copy(
									'Sistem perusahaan · Web & mudah alih · Keselamatan rangkaian',
									'Enterprise systems · Web & mobile · Network security'
								)
							: copy('Perbualan bermula di sini.', 'A conversation starts here.')}
			</p>
		</div>
		<section
			class="scene-frame"
			class:documents={chapter === 'onboardx'}
			class:optics={chapter === 'cv_bot'}
			class:career={chapter === 'background'}
			class:returning={chapter === 'contact'}
			aria-label={copy(
				'Ruang mekanikal konseptual dan ringkasan bab',
				'Conceptual mechanical space and chapter overview'
			)}
		>
			<div class="world" bind:this={host} aria-hidden="true"></div>
			{#if fallback}<div class="static-world" aria-hidden="true">
					<StaticMachine {chapter} />
				</div>{/if}
			<div class="scene-window" aria-hidden="true"></div>
			<div class="synopsis">
				<p class="eyebrow">
					{chapter === 'intro'
						? copy('DI SEBALIK SISTEM', 'BEHIND THE SYSTEM')
						: chapter === 'emesys'
							? copy('01 / TERAS ASET', '01 / ASSET CORE')
							: chapter === 'onboardx'
								? copy('02 / DOKUMEN TERBUKA', '02 / UNFOLDED DOCUMENTS')
								: chapter === 'cv_bot'
									? copy('03 / MEKANISME OPTIK', '03 / OPTICAL MECHANISM')
									: chapter === 'background'
										? copy('PENGALAMAN / LAPISAN KERJA', 'EXPERIENCE / LAYERS OF WORK')
										: copy('SAMBUNGAN / LANGKAH SETERUSNYA', 'CONNECTION / NEXT STEPS')}
				</p>
				{#if project}
					<p class="summary">{project.summary[$lang]}</p>
					<p class="technology">{project.layers.map((layer) => layer.technology).join(' / ')}</p>
					<button class="primary" type="button" onclick={() => openDialog('project', project.key)}
						>{copy('Baca butiran sistem', 'Read system details')}
						<span aria-hidden="true">↗</span></button
					>
				{:else if chapter === 'intro'}
					<p class="summary">
						{copy(
							'Saya membina sistem yang menghubungkan manusia, rekod dan aliran kerja, daripada platform sektor awam kepada aplikasi web, mudah alih dan automasi.',
							'I build systems connecting people, records and workflows, from public-sector platforms to web, mobile and automation applications.'
						)}
					</p>
					<button class="primary" type="button" onclick={() => go('emesys')}
						>{copy('Terokai hasil kerja', 'Explore the work')}
						<span aria-hidden="true">→</span></button
					>
					<button class="text-action" type="button" onclick={() => openDialog('about')}
						>{copy('Tentang saya & kerjaya', 'About me & career')}</button
					>
				{:else if chapter === 'background'}
					<p class="summary">
						{copy(
							'Daripada pertahanan ancaman siber di TNB kepada pembangunan mobiliti perusahaan, web dan sistem sektor awam di Nova Bitara dan YHCM.',
							'From cybersecurity threat defense at TNB to enterprise mobility, web development and public-sector systems at Nova Bitara and YHCM.'
						)}
					</p>
					<button class="primary" type="button" onclick={() => openDialog('about')}
						>{copy('Baca latar belakang & kerjaya', 'Read background & career')}
						<span aria-hidden="true">↗</span></button
					>
				{:else}
					<p class="summary">
						{copy(
							'Ada sistem untuk dibangunkan atau cabaran teknikal untuk dibincangkan? Hubungi saya untuk peluang kerjaya dan kerjasama.',
							'Have a system to build or a technical challenge to discuss? Get in touch about career opportunities and collaboration.'
						)}
					</p>
					<button class="primary" type="button" onclick={() => openDialog('contact')}
						>{copy('Buka maklumat & borang hubungan', 'Open contact details & form')}
						<span aria-hidden="true">↗</span></button
					>
				{/if}
			</div>
		</section>
		<div class="scene-notes">
			<p>
				{chapter === 'cv_bot'
					? copy(
							'Sapuan optik konseptual, bukan penjejakan kamera sebenar. Tiada akses kamera.',
							'Conceptual optical sweep, not actual camera tracking. No camera access.'
						)
					: copy(
							'Seni bina konseptual, bukan gambaran infrastruktur sebenar.',
							'Conceptual architecture, not a reconstruction of real infrastructure.'
						)}
			</p>
			<p role="status">
				{fallback
					? copy(
							'Paparan SVG statik. Semua enam bab dan butiran kekal tersedia; kawalan gerakan tidak digunakan.',
							'Static SVG view. All six chapters and details remain available; motion controls are not used.'
						)
					: !ready
						? copy(
								'Menyediakan ruang; navigasi tersedia.',
								'Preparing the space; navigation is available.'
							)
						: reduced
							? copy(
									'Gerakan dikurangkan. Pilihan bab menggunakan bingkai statik.',
									'Reduced motion. Chapter selections use static frames.'
								)
							: ''}
			</p>
		</div>
		<nav class="chapter-nav" aria-label={copy('Enam bab portfolio', 'Six portfolio chapters')}>
			{#each CHAPTER_ORDER as id, i}<button
					type="button"
					data-chapter={id}
					aria-current={chapter === id ? 'step' : undefined}
					onclick={() => go(id)}
					><span class="chapter-number">{String(i + 1).padStart(2, '0')}</span><span
						>{labels[id]}</span
					>{#if chapter === id}<span class="selected-mark" aria-hidden="true">↗</span>{/if}</button
				>{/each}
		</nav>
		<div class="journey">
			<div
				class="step-controls"
				role="group"
				aria-label={copy('Kawalan perjalanan', 'Journey controls')}
			>
				<button type="button" disabled={index === 0} onclick={() => go(CHAPTER_ORDER[index - 1])}
					>← {copy('Kembali', 'Back')}</button
				>
				<span class="progress">{String(index + 1).padStart(2, '0')} / 06</span>
				<button
					class="primary"
					type="button"
					onclick={() => go(CHAPTER_ORDER[index === 5 ? 0 : index + 1])}
					>{index === 5 ? copy('Mulakan semula', 'Start again') : copy('Seterusnya', 'Next')} →</button
				>
			</div>
			{#if !fallback}<div
					class="playback"
					role="group"
					aria-label={copy('Kawalan gerakan', 'Motion controls')}
				>
					<button type="button" onclick={togglePause} aria-pressed={paused} disabled={reduced}
						>{paused
							? copy('Sambung gerakan', 'Resume motion')
							: copy('Jeda gerakan', 'Pause motion')}</button
					>
					{#if intro}<button type="button" onclick={skip}
							>{copy('Langkau intro', 'Skip intro')}</button
						>{:else}<button type="button" onclick={replay}
							>{copy('Ulang intro', 'Replay intro')}</button
						>{/if}
				</div>{/if}
		</div>
		<p class="sr-only" aria-live="polite" aria-atomic="true">{languageConfirmation}</p>
		<p class="sr-only" aria-live="polite" aria-atomic="true">
			{copy('Bab', 'Chapter')}
			{index + 1}
			{copy('daripada', 'of')} 6: {titles[chapter]}. {paused
				? copy('Gerakan dijeda.', 'Motion paused.')
				: ''}
		</p>
	</main>
	<footer class="shell-footer">
		<span>MUHAMMED MUNIR / {copy('SISTEM, DARI DALAM.', 'SYSTEMS, FROM WITHIN.')}</span><span
			>PUCHONG, SELANGOR</span
		>
	</footer>
	<dialog
		class="reader"
		bind:this={dialog}
		aria-labelledby="spatial-dialog-title"
		oncancel={(event) => {
			event.preventDefault();
			closeDialog();
		}}
		onclose={() => {
			if (modalOpen) finishDialog();
		}}
	>
		<div class="reader-heading">
			<h2 id="spatial-dialog-title" tabindex="-1" bind:this={dialogHeading}>{dialogTitle}</h2>
			<button type="button" onclick={closeDialog}>{copy('Tutup', 'Close')} ×</button>
		</div>
		<div hidden={view !== 'project'} class="project-reader">
			<p class="section-label">{detailProject.context[$lang]}</p>
			<p class="reader-summary">{detailProject.summary[$lang]}</p>
			<dl class="layers">
				{#each detailProject.layers as layer}<div>
						<dt>{layer.label[$lang]}<strong>{layer.technology}</strong></dt>
						<dd>{layer.detail[$lang]}</dd>
					</div>{/each}
			</dl>
			<section aria-labelledby="spatial-evidence-title">
				<h3 id="spatial-evidence-title">{copy('Bukti portfolio', 'Portfolio evidence')}</h3>
				<p class="evidence-title">{evidence.title}</p>
				<p>{evidence.desc}</p>
			</section>
			<p class="reader-note">
				{copy(
					'Lapisan ini mengelompokkan keupayaan yang didokumenkan; bukan dakwaan topologi deployment. Mekanisme adalah ilustratif.',
					'These layers group documented capabilities; they do not assert a deployed topology. The mechanism is illustrative.'
				)}
			</p>
		</div>
		<div hidden={view !== 'about'} class="about-reader">
			<div class="biography">
				<p class="section-label">
					{copy(
						'Pembangun Full-Stack / Puchong, Selangor',
						'Full-Stack Developer / Puchong, Selangor'
					)}
				</p>
				<p>{@html translations[$lang].hero.bio}</p>
			</div>
			<Experience />
		</div>
		<div hidden={view !== 'contact'}><Contact /></div>
	</dialog>
</div>

<style>
	.spatial {
		--world: #121619;
		--surface: #1c2327;
		--raised: #283136;
		--text: #f4eee3;
		--muted: #c4beb3;
		--copper: #d9a17b;
		--border: #89979b;
		--focus: #ffe2a8;
		min-height: 100dvh;
		background: var(--world);
		color: var(--text);
		color-scheme: dark;
		font-family: Arial, Helvetica, sans-serif;
		padding: env(safe-area-inset-top) max(1.25rem, 4vw) env(safe-area-inset-bottom);
	}
	.spatial :global(*) {
		min-width: 0;
	}
	.spatial :global([hidden]) {
		display: none !important;
	}
	.spatial :global(button),
	.spatial :global(a) {
		min-height: 44px;
	}
	.spatial :global(:focus-visible) {
		outline: 3px solid var(--focus);
		outline-offset: 4px;
		box-shadow: 0 0 0 4px var(--world);
	}
	button,
	.header-actions a {
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		padding: 0.65rem 1rem;
		line-height: 1.5;
		font-size: 1rem;
		text-decoration: none;
	}
	button:hover,
	.header-actions a:hover {
		background: var(--raised);
	}
	button:disabled {
		opacity: 1;
		color: var(--muted);
		border-style: dashed;
		cursor: not-allowed;
	}
	.primary,
	.contact-action {
		background: var(--copper);
		color: var(--world);
		border-color: var(--copper);
		font-weight: 600;
	}
	.primary:hover,
	.contact-action:hover {
		background: var(--text);
		color: var(--world);
	}
	.skip {
		position: absolute;
		top: 1rem;
		left: 1rem;
		z-index: 10;
		transform: translateY(-200%);
		background: var(--surface);
		padding: 0.75rem;
	}
	.skip:focus {
		transform: none;
	}
	.shell-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding-block: 1.2rem;
		border-bottom: 1px solid var(--border);
	}
	.identity {
		display: inline-flex;
		align-items: center;
		gap: 0.9rem;
		border: 0;
		background: none;
		padding: 0.3rem 0;
		font:
			700 2.5rem/1 Georgia,
			serif;
	}
	.identity span {
		font:
			600 0.75rem/1.5 Arial,
			sans-serif;
		letter-spacing: 0.1em;
	}
	.header-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	main {
		max-width: 1600px;
		margin: auto;
	}
	.chapter-heading {
		padding-block: 2.5rem 1.5rem;
	}
	.eyebrow {
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		color: var(--copper);
		line-height: 1.5;
	}
	h1 {
		max-width: 1100px;
		margin-top: 1rem;
		font:
			400 clamp(2.1rem, 5.5vw, 5.5rem)/1.08 Georgia,
			serif;
		letter-spacing: -0.045em;
		overflow-wrap: anywhere;
		text-wrap: balance;
	}
	h1.name {
		max-width: none;
		font:
			600 clamp(3rem, 9vw, 9.5rem)/1.05 Arial,
			sans-serif;
		letter-spacing: -0.065em;
	}
	.name > span {
		display: inline-block;
	}
	.period {
		color: var(--copper);
	}
	.chapter-context {
		margin-top: 1.1rem;
		color: var(--muted);
		font-size: 1rem;
		line-height: 1.6;
	}
	.scene-frame {
		position: relative;
		isolation: isolate;
		min-height: clamp(570px, 68vh, 850px);
		display: grid;
		grid-template-columns: minmax(300px, 430px) 1fr;
		align-items: end;
		border-block: 1px solid var(--border);
	}
	.world,
	.static-world {
		position: absolute;
		inset: 0;
		z-index: -1;
		overflow: hidden;
	}
	.world :global(canvas) {
		display: block;
		width: 100%;
		height: 100%;
	}
	.static-world :global(svg) {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.scene-window {
		grid-column: 2;
		grid-row: 1;
		min-height: 350px;
		pointer-events: none;
	}
	.synopsis {
		grid-column: 1;
		grid-row: 1;
		background: var(--surface);
		padding: 1.5rem;
		margin-block: 1.5rem;
		border-left: 3px solid var(--copper);
	}
	.summary {
		font-size: clamp(1.1rem, 1.5vw, 1.35rem);
		line-height: 1.55;
		margin: 1rem 0;
		max-width: 50ch;
	}
	.technology {
		font-size: 1rem;
		color: var(--muted);
		line-height: 1.6;
		margin-bottom: 1.25rem;
		overflow-wrap: anywhere;
	}
	.synopsis button {
		max-width: 100%;
		text-align: left;
	}
	.text-action {
		margin-top: 0.75rem;
		display: block;
		background: transparent;
	}
	.documents {
		grid-template-columns: minmax(300px, 400px) 1fr;
		align-items: start;
	}
	.documents .synopsis {
		margin-top: 3rem;
	}
	.optics {
		grid-template-columns: 1fr minmax(300px, 430px);
	}
	.optics .synopsis {
		grid-column: 2;
	}
	.optics .scene-window {
		grid-column: 1;
	}
	.career .synopsis {
		align-self: center;
	}
	.returning .synopsis {
		border-left: 0;
		border-top: 3px solid var(--copper);
	}
	.scene-notes {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.5rem 2rem;
		margin-block: 1rem 1.5rem;
		color: var(--muted);
		font-size: 0.85rem;
		line-height: 1.6;
	}
	.scene-notes p {
		max-width: 65ch;
	}
	.chapter-nav {
		display: grid;
		grid-template-columns: repeat(6, minmax(0, 1fr));
		gap: 0.5rem;
	}
	.chapter-nav button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-align: left;
		padding: 0.8rem;
		font-size: 0.9rem;
	}
	.chapter-number {
		font-size: 0.75rem;
	}
	.chapter-nav button[aria-current='step'] {
		background: var(--copper);
		color: var(--world);
		border-color: var(--copper);
		font-weight: 700;
	}
	.selected-mark {
		margin-left: auto;
	}
	.journey,
	.step-controls,
	.playback {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
	.journey {
		justify-content: space-between;
		padding-block: 1.5rem 2rem;
	}
	.progress {
		color: var(--muted);
		font-size: 0.9rem;
		padding: 0.5rem;
	}
	.shell-footer {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding-block: 1.5rem;
		border-top: 1px solid var(--border);
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		color: var(--muted);
	}
	.reader {
		--paper: #f3eee6;
		--ink: #201e1b;
		--copper: #75442b;
		--muted: #645a4f;
		--line: #c8bfb2;
		--world: #f3eee6;
		--focus: #75442b;
		width: min(1080px, calc(100% - 2rem));
		max-height: calc(100dvh - 2rem);
		margin: auto;
		padding: 0;
		border: 1px solid #897b6b;
		background: var(--paper);
		color: var(--ink);
		color-scheme: light;
		overflow-y: auto;
		overscroll-behavior: contain;
	}
	.reader::backdrop {
		background: #080c0fe6;
	}
	.reader-heading {
		display: flex;
		justify-content: space-between;
		align-items: start;
		gap: 1rem;
		padding: clamp(1.25rem, 4vw, 2.5rem);
		border-bottom: 1px solid #897b6b;
	}
	.reader-heading h2 {
		font-size: clamp(1.5rem, 4vw, 2.6rem);
		letter-spacing: -0.025em;
		overflow-wrap: anywhere;
	}
	.reader-heading button {
		flex-shrink: 0;
		color: #f4eee3;
		background: #1c2327;
		border-color: #89979b;
	}
	.project-reader,
	.biography {
		padding: clamp(1.25rem, 4vw, 2.5rem);
		line-height: 1.7;
	}
	.reader-summary {
		font-size: 1.2rem;
		margin-block: 1rem 1.5rem;
		max-width: 65ch;
	}
	.layers {
		margin: 0 0 2rem;
	}
	.layers > div {
		padding-block: 1rem;
		border-top: 1px solid #897b6b;
		display: grid;
		grid-template-columns: 1fr 1.5fr;
		gap: 1rem;
	}
	.layers strong {
		display: block;
		font-size: 1.1rem;
		overflow-wrap: anywhere;
	}
	.layers dd {
		margin: 0;
	}
	.evidence-title {
		font-weight: 700;
		margin-block: 1rem 0.5rem;
	}
	.reader-note {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid #897b6b;
		color: #645a4f;
	}
	.reader :global(.section) {
		width: calc(100% - clamp(2.5rem, 8vw, 5rem));
		padding-block: 2rem;
	}
	.reader :global(input),
	.reader :global(textarea),
	.reader :global(button) {
		font-size: 1rem;
	}
	.reader :global(.tag),
	.reader :global(.form-note),
	.reader :global(.section-label) {
		font-size: 0.85rem;
	}
	@media (min-width: 1600px) {
		.shell-header,
		.shell-footer {
			max-width: 1600px;
			margin-inline: auto;
		}
	}
	@media (max-width: 1000px) {
		.chapter-nav {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
		.identity span {
			display: none;
		}
	}
	@media (max-width: 700px) {
		.spatial {
			padding-inline: 1rem;
		}
		.shell-header {
			gap: 0.5rem;
			padding-block: 0.75rem;
		}
		.header-actions {
			gap: 0.35rem;
		}
		.header-actions button,
		.header-actions a {
			font-size: 0.85rem;
			padding: 0.6rem 0.65rem;
		}
		.identity {
			font-size: 2rem;
		}
		.chapter-heading {
			padding-block: 1.75rem 1.25rem;
		}
		h1.name {
			font-size: clamp(2.8rem, 12.5vw, 5.3rem);
			letter-spacing: -0.055em;
		}
		.name > span {
			display: block;
		}
		.scene-frame,
		.documents,
		.optics {
			display: flex;
			flex-direction: column;
			align-items: stretch;
			min-height: 0;
		}
		.world,
		.static-world {
			bottom: auto;
			height: 300px;
		}
		.scene-window {
			min-height: 300px;
			width: 100%;
		}
		.synopsis,
		.documents .synopsis {
			margin: 0 0 1rem;
			padding: 1.25rem;
		}
		.summary {
			font-size: 1.1rem;
		}
		.chapter-nav {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.chapter-nav button {
			padding: 0.65rem;
		}
		.journey {
			align-items: stretch;
			gap: 1rem;
		}
		.step-controls {
			width: 100%;
			justify-content: space-between;
			gap: 0.25rem;
		}
		.step-controls button {
			padding-inline: 0.7rem;
		}
		.playback {
			gap: 0.5rem;
		}
		.reader {
			width: calc(100% - 1rem);
			max-height: calc(100dvh - 1rem);
		}
		.reader-heading {
			flex-wrap: wrap-reverse;
		}
		.reader-heading button {
			margin-left: auto;
		}
		.layers > div {
			grid-template-columns: 1fr;
			gap: 0.4rem;
		}
	}
	@media (max-height: 500px) and (min-width: 701px) {
		.scene-frame {
			min-height: 460px;
		}
		.chapter-heading {
			padding-top: 1.5rem;
		}
	}
</style>
