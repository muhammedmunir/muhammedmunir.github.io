<script lang="ts">
	/**
	 * Synaptic Pitch Deck (owner: adaptive-03-executor).
	 *
	 * A modal presentation deck with eight executive chapters. It renders as a
	 * native <dialog> so Escape, focus trapping and the inert background come
	 * from the platform rather than from hand-rolled listeners.
	 *
	 * Integration contract kept from the previous version: the component takes a
	 * single `onClose` prop and the host page mounts it conditionally.
	 */
	import { onMount } from 'svelte';
	import { lang } from '$lib/i18n';
	import { translations } from '$lib/translations';
	import { derived } from 'svelte/store';
	import {
		acquireScrollLock,
		releaseScrollLock,
		containsActiveElement,
		isTextEntryTarget,
		steppedIndex
	} from '$lib/deck/focus-utils';
	import { careers, chapters, profile, projects, publicSector, type Bi } from '$lib/deck/deck-data';
	import {
		accuracyNote,
		architecturePatterns,
		certifications,
		contactChannels,
		downloads,
		educationExtras,
		exploring,
		shipped,
		skillGroups,
		tierLabels,
		ui
	} from '$lib/deck/deck-evidence';

	let { onClose }: { onClose: () => void } = $props();

	/** Active language, so templates never touch the store directly. */
	const L = $derived($lang);
	const t = derived(lang, ($l) => translations[$l]);

	let currentSlide = $state(0);
	let paused = $state(false);
	let reduceMotion = $state(false);

	let dialogEl: HTMLDialogElement | null = $state(null);
	let headingEl: HTMLElement | null = $state(null);

	const chapterList = chapters;
	const lastIndex = chapterList.length - 1;

	/** Plain (non-reactive) registry of the rail buttons, for focus moves. */
	const tabEls: (HTMLButtonElement | null)[] = [];

	function trackTab(node: HTMLButtonElement, index: number) {
		tabEls[index] = node;
		return {
			destroy() {
				if (tabEls[index] === node) tabEls[index] = null;
			}
		};
	}

	function bi(value: Bi): string {
		return value[L];
	}

	const activeChapter = $derived(chapterList[currentSlide]);
	const progressWidth = $derived(`${((currentSlide + 1) / chapterList.length) * 100}%`);

	function goTo(index: number) {
		const next = Math.min(Math.max(index, 0), lastIndex);
		if (next !== currentSlide) currentSlide = next;
	}

	function nextChapter() {
		goTo(steppedIndex(currentSlide, 1, chapterList.length, false));
	}
	function prevChapter() {
		goTo(steppedIndex(currentSlide, -1, chapterList.length, false));
	}
	function requestClose() {
		onClose();
	}

	/**
	 * Left/Right/Home/End change chapter; Up/Down and Page keys keep scrolling the
	 * chapter body natively. Text-entry targets keep all of their own keystrokes.
	 */
	function handleKeydown(event: KeyboardEvent) {
		if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
		if (isTextEntryTarget(event.target)) return;
		switch (event.key) {
			case 'ArrowRight':
				event.preventDefault();
				nextChapter();
				break;
			case 'ArrowLeft':
				event.preventDefault();
				prevChapter();
				break;
			case 'Home':
				event.preventDefault();
				goTo(0);
				break;
			case 'End':
				event.preventDefault();
				goTo(lastIndex);
				break;
			default:
				break;
		}
	}

	/** Focus the active chapter control; fall back to the dialog title, then the dialog. */
	function focusInitial() {
		tabEls[currentSlide]?.focus();
		if (containsActiveElement(dialogEl)) return;
		headingEl?.focus();
		if (containsActiveElement(dialogEl)) return;
		dialogEl?.focus();
	}

	onMount(() => {
		const launcher =
			(document.activeElement instanceof HTMLElement && document.activeElement !== document.body
				? document.activeElement
				: null) ?? document.getElementById('fab-present-btn');
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		const syncMotion = () => {
			reduceMotion = motionQuery.matches;
		};
		syncMotion();
		motionQuery.addEventListener('change', syncMotion);

		// The deck owns page scroll while it is open and restores it on teardown.
		acquireScrollLock();

		const dialog = dialogEl;
		if (dialog) {
			if (typeof dialog.showModal === 'function' && !dialog.open) {
				try {
					dialog.showModal();
				} catch {
					dialog.setAttribute('open', '');
				}
			} else {
				dialog.setAttribute('open', '');
			}
			dialog.addEventListener('keydown', handleKeydown);
			focusInitial();
		}

		return () => {
			dialog?.removeEventListener('keydown', handleKeydown);
			motionQuery.removeEventListener('change', syncMotion);
			dialog?.close();
			releaseScrollLock();
			// Hand focus back to whatever opened the deck, without scrolling the page.
			if (launcher && launcher.isConnected) launcher.focus({ preventScroll: true });
		};
	});
</script>

<dialog
	bind:this={dialogEl}
	class="deck"
	aria-labelledby="deck-heading"
	oncancel={(e) => {
		e.preventDefault();
		requestClose();
	}}
>
	<div class="deck-shell">
		<header class="deck-top">
			<div class="deck-id">
				<p class="deck-glyph" aria-hidden="true">
					<span class="synapse-dot"></span>
					{bi(ui.deckLabel)}
				</p>
				<h2 class="deck-heading" id="deck-heading" tabindex="-1" bind:this={headingEl}>
					{bi(ui.dialogTitle)}
				</h2>
			</div>
			<div class="deck-actions">
				{#if !reduceMotion}
					<button
						type="button"
						class="ghost-btn"
						aria-pressed={paused}
						onclick={() => (paused = !paused)}
					>
						{paused ? bi(ui.resumeMotion) : bi(ui.pauseMotion)}
					</button>
				{/if}
				<button type="button" class="ghost-btn close-btn" onclick={requestClose}>
					{bi(ui.close)}
					<span aria-hidden="true">✕</span>
				</button>
			</div>
		</header>

		<nav class="deck-rail" aria-label={bi(ui.chaptersLabel)}>
			<ul class="rail-list">
				{#each chapterList as chapter, index (chapter.id)}
					<li>
						<button
							type="button"
							class="rail-tab"
							use:trackTab={index}
							aria-current={index === currentSlide ? 'step' : undefined}
							onclick={() => goTo(index)}
						>
							<span class="rail-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span
							>
							<span class="rail-name">
								{chapter.name[L]}
							</span>
						</button>
					</li>
				{/each}
			</ul>
			<div class="progress" role="presentation">
				<span class="progress-bar" style:width={progressWidth}></span>
			</div>
			<p class="sr-status" aria-live="polite">
				{bi(ui.chapterOf)}
				{currentSlide + 1}
				{bi(ui.of)}
				{chapterList.length}·{activeChapter.name[L]}
			</p>
		</nav>

		<div class="deck-body" class:is-paused={paused || reduceMotion}>
			<article class="synapse" data-chapter={activeChapter.id}>
				<div class="synapse-spine" aria-hidden="true">
					<svg viewBox="0 0 40 100" preserveAspectRatio="none" focusable="false">
						<path class="spine-line" d="M20 0 V100" />
						<circle class="spine-node" cx="20" cy="8" r="3" />
						<circle class="spine-node" cx="20" cy="50" r="3" />
						<circle class="spine-node" cx="20" cy="92" r="3" />
					</svg>
				</div>

				<header class="chapter-head">
					<p class="chapter-kicker">
						<span aria-hidden="true">◆</span>
						{bi(ui.chapterOf)}
						{currentSlide + 1}/
						{chapterList.length}·{bi(activeChapter.tagline)}
					</p>
					<h3 class="chapter-title" tabindex="-1">{bi(activeChapter.heading)}</h3>
					<p class="chapter-lead">{bi(activeChapter.lead)}</p>
				</header>

				{#if activeChapter.id === 'profile'}
					<div class="grid-2">
						<section class="panel" aria-labelledby="profile-facts">
							<h4 class="panel-title" id="profile-facts">{profile.name}</h4>
							<p class="panel-role">{bi(profile.role)}</p>
							<dl class="fact-list">
								{#each profile.facts as fact (fact.value.en)}
									<div class="fact">
										<dt>{bi(fact.label)}</dt>
										<dd>
											{#if fact.href}
												<a class="text-link" href={fact.href}>{fact.value[L]}</a>
											{:else}
												{fact.value[L]}
											{/if}
										</dd>
									</div>
								{/each}
							</dl>
						</section>
						<section class="panel" aria-labelledby="profile-signals">
							<h4 class="panel-title" id="profile-signals">{bi(ui.milestonesLabel)}</h4>
							<ol class="milestones">
								{#each profile.milestones as step (step.org + step.period.en)}
									<li>
										<span class="ms-period">{bi(step.period)}</span>
										<span class="ms-title">{bi(step.title)}</span>
										<span class="ms-org">{step.org}</span>
										<span class="ms-note">{bi(step.note)}</span>
									</li>
								{/each}
							</ol>
						</section>
					</div>
					<ul class="signal-grid">
						{#each profile.signals as signal (signal.title.en)}
							<li class="signal">
								<span class="signal-icon" aria-hidden="true">{signal.icon}</span>
								<h4 class="signal-title">{bi(signal.title)}</h4>
								<p>{bi(signal.body)}</p>
							</li>
						{/each}
					</ul>
				{:else if activeChapter.id === 'public-sector'}
					<div class="panel accent-panel">
						<h4 class="panel-title">{publicSector.company} · {publicSector.location}</h4>
						<p class="panel-role">
							{bi(publicSector.role)} · {bi(publicSector.period)} · {bi(publicSector.type)}
						</p>
						<p class="panel-body">{bi(publicSector.summary)}</p>
						<ul class="chip-row">
							{#each publicSector.stack as tech (tech)}
								<li class="chip">{tech}</li>
							{/each}
						</ul>
					</div>
					<div class="grid-2">
						<section class="panel" aria-labelledby="gov-systems">
							<h4 class="panel-title" id="gov-systems">{bi(ui.systemsLabel)}</h4>
							<ul class="system-list">
								{#each publicSector.systems as system (system.name)}
									<li>
										<strong>{system.name}</strong>
										<span>{bi(system.note)}</span>
									</li>
								{/each}
							</ul>
						</section>
						<section class="panel" aria-labelledby="gov-duties">
							<h4 class="panel-title" id="gov-duties">{bi(ui.responsibilitiesLabel)}</h4>
							<ul class="duty-list">
								{#each publicSector.responsibilities[L] as duty (duty)}
									<li>{duty}</li>
								{/each}
							</ul>
						</section>
					</div>
					<details class="drawer">
						<summary>{bi(ui.detailsLabel)}— {bi(ui.architectureLabel)}</summary>
						<p class="mono-body">{bi(publicSector.architecture)}</p>
					</details>
				{:else if activeChapter.id === 'delivery'}
					<ol class="career-list">
						{#each careers as job (job.key)}
							<li class="career panel">
								<div class="career-head">
									<span class="career-icon" aria-hidden="true">{job.icon}</span>
									<div>
										<h4 class="panel-title">{job.company}</h4>
										<p class="career-sub">{job.location} · {bi(job.period)} · {bi(job.type)}</p>
									</div>
								</div>
								<p class="panel-body">{bi(job.focus)}</p>
								<ul class="chip-row">
									{#each job.tags as tech (tech)}
										<li class="chip">{tech}</li>
									{/each}
								</ul>
								<details class="drawer">
									<summary>{bi(ui.architectureLabel)}</summary>
									<p class="mono-body">{bi(job.architecture)}</p>
								</details>
							</li>
						{/each}
					</ol>
				{:else if activeChapter.id === 'projects'}
					<div class="project-list">
						{#each projects as project (project.key)}
							<article class="panel project">
								<header class="project-head">
									<span class="project-icon" aria-hidden="true">{project.icon}</span>
									<div class="project-headings">
										<h4 class="panel-title">{bi(project.title)}</h4>
										<p class="project-sub">{bi(project.subtitle)} · {bi(project.meta)}</p>
									</div>
								</header>
								<p class="panel-body">{bi(project.role)}</p>
								<ul class="chip-row">
									{#each project.tags as tech (tech)}
										<li class="chip">{tech}</li>
									{/each}
								</ul>
								<div class="project-links">
									{#if project.docHref}
										<a class="text-link" href={project.docHref} target="_blank" rel="noopener">
											{bi(project.docLabel ?? project.title)}
											<span class="sr-only">({bi(ui.openLink)})</span>
										</a>
									{/if}
								</div>
								<details class="drawer">
									<summary>{bi(ui.detailsLabel)}</summary>
									<h5 class="drawer-title">{bi(ui.flowLabel)}</h5>
									<ol class="flow">
										{#each project.flow as step (step.label.en)}
											<li>
												<span class="flow-icon" aria-hidden="true">{step.icon}</span>
												<div>
													<strong>{bi(step.label)}</strong>
													<span>{bi(step.detail)}</span>
												</div>
											</li>
										{/each}
									</ol>
									<h5 class="drawer-title">{bi(ui.architectureLabel)}</h5>
									<p class="mono-body">{bi(project.architecture)}</p>
									<h5 class="drawer-title">{bi(ui.securityLabel)}</h5>
									<p class="mono-body">{bi(project.security)}</p>
									<h5 class="drawer-title">{bi(ui.outcomeLabel)}</h5>
									<p class="panel-body">{bi(project.outcome)}</p>
								</details>
							</article>
						{/each}
					</div>
				{:else if activeChapter.id === 'architecture'}
					<ul class="pattern-list">
						{#each architecturePatterns as pattern (pattern.title.en)}
							<li class="panel pattern">
								<h4 class="panel-title">
									<span aria-hidden="true">{pattern.icon}</span>
									{bi(pattern.title)}
								</h4>
								<p class="panel-body">{bi(pattern.body)}</p>
								<p class="evidence">
									{bi(ui.evidenceLabel)}: {pattern.evidence}
								</p>
							</li>
						{/each}
					</ul>
					<div class="grid-2">
						<section class="panel" aria-labelledby="ship-list">
							<h4 class="panel-title" id="ship-list">{bi(ui.shippedLabel)}</h4>
							<ul class="tick-list">
								{#each shipped[L] as item (item)}
									<li>{item}</li>
								{/each}
							</ul>
						</section>
						<section class="panel" aria-labelledby="explore-list">
							<h4 class="panel-title" id="explore-list">{bi(ui.exploringLabel)}</h4>
							<ul class="dot-list">
								{#each exploring[L] as item (item)}
									<li>{item}</li>
								{/each}
							</ul>
						</section>
					</div>
					<p class="disclaimer">{bi(accuracyNote)}</p>
				{:else if activeChapter.id === 'competencies'}
					<details class="drawer tier-drawer">
						<summary>{bi(ui.skillTiersLabel)}</summary>
						<ul class="tier-list">
							{#each Object.entries(tierLabels) as [tier, label] (tier)}
								<li><span class="tier-key">{tier}</span> {bi(label)}</li>
							{/each}
						</ul>
					</details>
					{#each skillGroups as group (group.title.en)}
						<section class="skill-group" aria-labelledby={'grp-' + group.title.en}>
							<h4 class="group-title" id={'grp-' + group.title.en}>{bi(group.title)}</h4>
							<ul class="skill-list">
								{#each group.items as skill (skill.name)}
									<li class="skill panel">
										<div class="skill-head">
											<h5 class="skill-name">{skill.name}</h5>
											<span class="tier tier-{skill.tier}">{skill.tier}</span>
										</div>
										<p class="skill-what">{bi(skill.what)}</p>
										<p class="skill-where">
											{bi(ui.usageLabel)}: {skill.where.join(' · ')}
										</p>
									</li>
								{/each}
							</ul>
						</section>
					{/each}
					<details class="drawer">
						<summary>{bi(ui.certsLabel)}</summary>
						<ul class="dot-list">
							{#each certifications as cert (cert)}
								<li>{cert}</li>
							{/each}
						</ul>
					</details>
				{:else if activeChapter.id === 'education'}
					<div class="grid-2">
						<section class="panel" aria-labelledby="edu-degree">
							<h4 class="panel-title" id="edu-degree">
								{bi({ ms: 'Ijazah Sarjana Muda Sains Komputer', en: 'B.Sc. Computer Science' })}
							</h4>
							<p class="panel-role">
								{bi({ ms: 'Keselamatan Rangkaian', en: 'Network Security' })} · 2021 – 2024 · {bi(
									educationExtras.degreeCampus
								)}
							</p>
							<p class="panel-body">
								Universiti Teknologi Malaysia · CGPA {educationExtras.degreeCgpa}
							</p>
							<p class="panel-body">{bi(educationExtras.fypTitle)}</p>
						</section>
						<section class="panel" aria-labelledby="edu-diploma">
							<h4 class="panel-title" id="edu-diploma">
								{bi({ ms: 'Diploma Sains Komputer', en: 'Diploma in Computer Science' })}
							</h4>
							<p class="panel-role">
								{bi({ ms: 'Pembangunan Perisian', en: 'Software Engineering' })} · 2017 – 2020 · {bi(
									educationExtras.diplomaCampus
								)}
							</p>
							<p class="panel-body">
								Universiti Teknologi Malaysia · CGPA {educationExtras.diplomaCgpa}
							</p>
						</section>
					</div>
					<details class="drawer">
						<summary>{bi(ui.detailsLabel)}</summary>
						<h5 class="drawer-title">
							{bi({ ms: 'Kursus ijazah', en: 'Degree coursework' })}
						</h5>
						<ul class="dot-list">
							{#each $t.edu.degree.courses as course (course.name)}
								<li><strong>{course.name}</strong>— {course.detail}</li>
							{/each}
						</ul>
						<h5 class="drawer-title">
							{bi({ ms: 'Kursus diploma', en: 'Diploma coursework' })}
						</h5>
						<ul class="dot-list">
							{#each $t.edu.diploma.courses as course (course.name)}
								<li><strong>{course.name}</strong>— {course.detail}</li>
							{/each}
						</ul>
						<h5 class="drawer-title">{bi(ui.certsLabel)}</h5>
						<ul class="dot-list">
							{#each certifications as cert (cert)}
								<li>{cert}</li>
							{/each}
						</ul>
					</details>
				{:else if activeChapter.id === 'contact'}
					<ul class="contact-grid">
						{#each contactChannels as channel (channel.label.en)}
							<li class="panel contact">
								<span class="contact-icon" aria-hidden="true">{channel.icon}</span>
								<h4 class="contact-label">{bi(channel.label)}</h4>
								{#if channel.href}
									<a class="text-link" href={channel.href}>{channel.value}</a>
								{:else}
									<span class="contact-value">{channel.value}</span>
								{/if}
							</li>
						{/each}
					</ul>
					<section class="panel" aria-labelledby="dl-list">
						<h4 class="panel-title" id="dl-list">{bi(ui.downloadsLabel)}</h4>
						<ul class="download-list">
							{#each downloads as file (file.href)}
								<li>
									<a class="text-link" href={file.href} target="_blank" rel="noopener">
										{bi(file.label)}
										<span class="sr-only">({bi(ui.openLink)})</span>
									</a>
									<span class="download-note">{bi(file.note)}</span>
								</li>
							{/each}
						</ul>
					</section>
				{/if}
			</article>
		</div>

		<footer class="deck-bottom">
			<button
				type="button"
				class="nav-btn"
				disabled={currentSlide === 0}
				onclick={prevChapter}
				aria-label={bi(ui.previous)}
			>
				<span aria-hidden="true">←</span>
				{bi(ui.previous)}
			</button>
			<p class="key-hint">{bi(ui.keyHint)}</p>
			<button
				type="button"
				class="nav-btn"
				disabled={currentSlide === lastIndex}
				onclick={nextChapter}
				aria-label={bi(ui.next)}
			>
				{bi(ui.next)}
				<span aria-hidden="true">→</span>
			</button>
		</footer>
	</div>
</dialog>

<style>
	.deck {
		position: fixed;
		inset: 0;
		z-index: 1200;
		width: 100%;
		max-width: none;
		height: 100%;
		max-height: none;
		margin: 0;
		padding: 0;
		border: 0;
		background: var(--surface, #05080f);
		color: var(--text, #e8edf5);
		font-family: var(--font-body, 'Inter', system-ui, sans-serif);
	}
	.deck::backdrop {
		background: rgba(3, 6, 12, 0.92);
		backdrop-filter: blur(6px);
	}
	.deck:focus {
		outline: none;
	}

	.deck-shell {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		background:
			radial-gradient(circle at 12% 8%, rgba(56, 189, 248, 0.14), transparent 42%),
			radial-gradient(circle at 88% 92%, rgba(212, 175, 55, 0.12), transparent 46%),
			linear-gradient(180deg, rgba(6, 11, 22, 0.96), rgba(4, 7, 14, 1));
	}

	.deck-top,
	.deck-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.85rem 1.25rem;
		border-bottom: 1px solid rgba(56, 189, 248, 0.18);
		flex-wrap: wrap;
	}
	.deck-bottom {
		border-bottom: 0;
		border-top: 1px solid rgba(56, 189, 248, 0.18);
	}

	.deck-id {
		min-width: 0;
	}
	.deck-glyph {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0 0 0.15rem;
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.68rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: #d4af37;
	}
	.synapse-dot {
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 50%;
		background: #4ade80;
		box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.16);
	}
	.deck-heading {
		margin: 0;
		font-size: 0.98rem;
		font-weight: 600;
		color: #cbd8ea;
	}
	.deck-heading:focus-visible {
		outline: 2px solid #56b8f8;
		outline-offset: 3px;
	}

	.deck-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.ghost-btn {
		min-height: 2.5rem;
		padding: 0 0.95rem;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: rgba(56, 189, 248, 0.08);
		border: 1px solid rgba(56, 189, 248, 0.32);
		border-radius: 999px;
		color: #bcd9f5;
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.74rem;
		letter-spacing: 0.05em;
		cursor: pointer;
	}
	.ghost-btn:hover {
		background: rgba(56, 189, 248, 0.18);
		border-color: rgba(56, 189, 248, 0.55);
	}
	.close-btn {
		background: rgba(212, 175, 55, 0.1);
		border-color: rgba(212, 175, 55, 0.4);
		color: #ecd79a;
	}
	.ghost-btn:focus-visible,
	.nav-btn:focus-visible,
	.rail-tab:focus-visible,
	summary:focus-visible,
	.text-link:focus-visible {
		outline: 2px solid #56b8f8;
		outline-offset: 3px;
	}

	/* Chapter rail — the connectome spine of the deck */
	.deck-rail {
		position: relative;
		padding: 0.55rem 1.25rem 0.7rem;
		border-bottom: 1px solid rgba(56, 189, 248, 0.14);
		background: rgba(5, 9, 18, 0.6);
	}
	.rail-list {
		display: flex;
		gap: 0.4rem;
		margin: 0;
		padding: 0 0 0.35rem;
		list-style: none;
		overflow-x: auto;
		scrollbar-width: thin;
	}
	.rail-tab {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		min-height: 2.5rem;
		padding: 0 0.85rem;
		background: rgba(148, 178, 214, 0.06);
		border: 1px solid rgba(148, 178, 214, 0.22);
		border-radius: 999px;
		color: #9baec8;
		font-size: 0.8rem;
		white-space: nowrap;
		cursor: pointer;
	}
	.rail-tab:hover {
		color: #e8edf5;
		border-color: rgba(56, 189, 248, 0.42);
	}
	.rail-tab[aria-current='step'] {
		background: rgba(56, 189, 248, 0.16);
		border-color: #56b8f8;
		color: #f2f7ff;
		box-shadow:
			0 0 0 1px rgba(86, 184, 248, 0.35),
			0 6px 18px rgba(56, 189, 248, 0.18);
	}
	.rail-index {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.68rem;
		color: #d4af37;
	}
	.progress {
		height: 2px;
		border-radius: 999px;
		background: rgba(148, 178, 214, 0.18);
		overflow: hidden;
	}
	.progress-bar {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, #56b8f8, #4ade80 60%, #d4af37);
		transition: width 0.35s ease;
	}
	.is-paused .progress-bar {
		transition: none;
	}
	.sr-status {
		margin: 0.35rem 0 0;
		font-size: 0.72rem;
		color: #7f93ad;
	}

	.deck-body {
		flex: 1 1 auto;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: 1.5rem 1.5rem 2rem;
	}
	.deck-body:focus-within {
		scroll-behavior: smooth;
	}

	.synapse {
		position: relative;
		max-width: 62rem;
		margin: 0 auto;
		padding-left: 2.4rem;
	}
	.synapse-spine {
		position: absolute;
		left: 0.55rem;
		top: 0.4rem;
		bottom: 0.4rem;
		width: 1.1rem;
	}
	.synapse-spine svg {
		width: 100%;
		height: 100%;
	}
	.spine-line {
		stroke: rgba(86, 184, 248, 0.35);
		stroke-width: 1.2;
	}
	.spine-node {
		fill: #4ade80;
		opacity: 0.85;
		animation: synapse-pulse 3.2s ease-in-out infinite;
	}
	.spine-node:nth-of-type(2) {
		animation-delay: 0.8s;
	}
	.spine-node:nth-of-type(3) {
		animation-delay: 1.6s;
	}
	.is-paused .spine-node {
		animation: none;
	}
	@keyframes synapse-pulse {
		0%,
		100% {
			opacity: 0.45;
		}
		50% {
			opacity: 1;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.spine-node {
			animation: none;
		}
		.progress-bar {
			transition: none;
		}
	}

	.chapter-kicker {
		margin: 0 0 0.45rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.72rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #d4af37;
	}
	.chapter-title {
		margin: 0 0 0.6rem;
		font-family: 'Playfair Display', Georgia, serif;
		font-size: clamp(1.5rem, 3.4vw, 2.3rem);
		line-height: 1.18;
		color: #f4f7fc;
	}
	.chapter-title:focus-visible {
		outline: 2px solid #56b8f8;
		outline-offset: 4px;
	}
	.chapter-lead {
		margin: 0 0 1.4rem;
		max-width: 46rem;
		color: #9baec8;
		line-height: 1.65;
	}

	.grid-2 {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(19rem, 1fr));
		gap: 0.9rem;
		margin-bottom: 0.9rem;
	}
	.panel {
		background: rgba(10, 16, 30, 0.72);
		border: 1px solid rgba(148, 178, 214, 0.18);
		border-radius: 12px;
		padding: 1rem 1.1rem;
	}
	.accent-panel {
		border-color: rgba(212, 175, 55, 0.32);
		background: linear-gradient(180deg, rgba(212, 175, 55, 0.08), rgba(10, 16, 30, 0.72));
		margin-bottom: 0.9rem;
	}
	.panel-title {
		margin: 0 0 0.35rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1rem;
		color: #f0f5fc;
	}
	.panel-role {
		margin: 0 0 0.55rem;
		font-size: 0.8rem;
		color: #d4af37;
	}
	.panel-body {
		margin: 0 0 0.6rem;
		font-size: 0.88rem;
		line-height: 1.6;
		color: #b9c8dc;
	}
	.mono-body {
		margin: 0 0 0.6rem;
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.78rem;
		line-height: 1.7;
		color: #9fc6e8;
		word-break: break-word;
	}

	.fact-list {
		margin: 0;
		display: grid;
		gap: 0.5rem;
	}
	.fact {
		display: grid;
		grid-template-columns: 8rem 1fr;
		gap: 0.6rem;
		font-size: 0.85rem;
	}
	.fact dt {
		color: #7f93ad;
	}
	.fact dd {
		margin: 0;
		color: #dbe6f5;
		word-break: break-word;
	}
	.text-link {
		color: #6cc6ff;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.text-link:hover {
		color: #d4af37;
	}

	.milestones,
	.system-list,
	.duty-list,
	.tick-list,
	.dot-list,
	.tier-list,
	.flow,
	.career-list,
	.pattern-list,
	.skill-list,
	.contact-grid,
	.download-list,
	.chip-row,
	.signal-grid,
	.project-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.milestones li {
		display: grid;
		gap: 0.15rem;
		padding: 0 0 0.7rem 0.85rem;
		border-left: 1px solid rgba(86, 184, 248, 0.28);
		margin-bottom: 0.6rem;
	}
	.ms-period {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.72rem;
		color: #d4af37;
	}
	.ms-title {
		font-size: 0.9rem;
		color: #eef4fd;
	}
	.ms-org,
	.ms-note {
		font-size: 0.8rem;
		color: #8fa4c0;
	}

	.signal-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: 0.9rem;
	}
	.signal {
		background: rgba(10, 16, 30, 0.6);
		border: 1px solid rgba(74, 222, 128, 0.18);
		border-radius: 12px;
		padding: 0.9rem 1rem;
	}
	.signal-icon {
		font-size: 1.05rem;
	}
	.signal-title {
		margin: 0.35rem 0 0.3rem;
		font-size: 0.92rem;
		color: #e9f5ee;
	}
	.signal p {
		margin: 0;
		font-size: 0.83rem;
		line-height: 1.55;
		color: #a8bcd4;
	}

	.chip-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin: 0.2rem 0 0.7rem;
	}
	.chip {
		padding: 0.16rem 0.6rem;
		border-radius: 100px;
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(74, 222, 128, 0.28);
		color: #4ade80;
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.7rem;
	}

	.system-list li,
	.duty-list li,
	.tick-list li,
	.dot-list li,
	.tier-list li {
		position: relative;
		padding-left: 1.05rem;
		margin-bottom: 0.45rem;
		font-size: 0.85rem;
		line-height: 1.55;
		color: #b9c8dc;
	}
	.system-list li::before,
	.duty-list li::before,
	.tick-list li::before {
		content: '▸';
		position: absolute;
		left: 0;
		color: #4ade80;
	}
	.dot-list li::before {
		content: '•';
		position: absolute;
		left: 0.15rem;
		color: #d4af37;
	}
	.tier-list li::before {
		content: '';
	}
	.system-list strong {
		display: block;
		color: #eef4fd;
		font-size: 0.88rem;
	}
	.system-list span {
		color: #94a9c4;
		font-size: 0.82rem;
	}
	.tier-key {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.7rem;
		padding: 0.1rem 0.45rem;
		border-radius: 999px;
		border: 1px solid rgba(148, 178, 214, 0.3);
		color: #9fc6e8;
		margin-right: 0.4rem;
	}

	.career-list {
		display: grid;
		gap: 0.9rem;
	}
	.career-head {
		display: flex;
		align-items: flex-start;
		gap: 0.7rem;
	}
	.career-icon,
	.project-icon,
	.contact-icon {
		font-size: 1.3rem;
		line-height: 1;
	}
	.career-sub,
	.project-sub {
		margin: 0;
		font-size: 0.78rem;
		color: #8fa4c0;
	}

	.project-list {
		display: grid;
		gap: 0.9rem;
	}
	.project-head {
		display: flex;
		align-items: flex-start;
		gap: 0.7rem;
		margin-bottom: 0.6rem;
	}
	.project-links {
		margin-bottom: 0.5rem;
	}
	.flow {
		display: grid;
		gap: 0.5rem;
		margin-bottom: 0.8rem;
	}
	.flow li {
		display: flex;
		gap: 0.6rem;
		font-size: 0.83rem;
		line-height: 1.55;
		color: #a8bcd4;
	}
	.flow-icon {
		flex: 0 0 auto;
	}
	.flow strong {
		display: block;
		color: #eef4fd;
		font-size: 0.86rem;
	}

	.pattern-list {
		display: grid;
		gap: 0.8rem;
		margin-bottom: 0.9rem;
	}
	.pattern .panel-title {
		gap: 0.55rem;
	}
	.evidence {
		margin: 0;
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.72rem;
		color: #7f93ad;
	}
	.disclaimer {
		margin: 0.2rem 0 0;
		padding: 0.7rem 0.9rem;
		border-left: 3px solid #d4af37;
		background: rgba(212, 175, 55, 0.07);
		border-radius: 0 8px 8px 0;
		font-size: 0.8rem;
		line-height: 1.55;
		color: #cbb887;
	}

	.skill-group {
		margin-bottom: 0.9rem;
	}
	.group-title {
		margin: 0 0 0.5rem;
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.74rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #d4af37;
	}
	.skill-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
		gap: 0.7rem;
	}
	.skill-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.skill-name {
		margin: 0;
		font-size: 0.9rem;
		color: #f0f5fc;
	}
	.tier {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.66rem;
		text-transform: uppercase;
		padding: 0.1rem 0.5rem;
		border-radius: 999px;
		border: 1px solid transparent;
	}
	.tier-core {
		color: #4ade80;
		background: rgba(34, 197, 94, 0.12);
		border-color: rgba(74, 222, 128, 0.3);
	}
	.tier-working {
		color: #7cc7ff;
		background: rgba(56, 189, 248, 0.12);
		border-color: rgba(86, 184, 248, 0.32);
	}
	.tier-exploring {
		color: #d4af37;
		background: rgba(212, 175, 55, 0.1);
		border-color: rgba(212, 175, 55, 0.32);
	}
	.skill-what {
		margin: 0.4rem 0 0.3rem;
		font-size: 0.83rem;
		line-height: 1.55;
		color: #b9c8dc;
	}
	.skill-where {
		margin: 0;
		font-size: 0.75rem;
		color: #7f93ad;
	}

	.contact-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: 0.8rem;
		margin-bottom: 0.9rem;
	}
	.contact-label {
		margin: 0.3rem 0 0.25rem;
		font-size: 0.8rem;
		color: #9baec8;
	}
	.contact-value {
		font-size: 0.88rem;
		color: #dbe6f5;
	}
	.download-list li {
		display: grid;
		gap: 0.1rem;
		margin-bottom: 0.55rem;
	}
	.download-note {
		font-size: 0.75rem;
		color: #7f93ad;
	}

	.drawer {
		margin: 0.7rem 0 0;
		border: 1px solid rgba(148, 178, 214, 0.18);
		border-radius: 12px;
		background: rgba(8, 13, 25, 0.6);
	}
	.drawer > summary {
		display: flex;
		align-items: center;
		min-height: 2.75rem;
		padding: 0.5rem 0.9rem;
		cursor: pointer;
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.76rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #d4af37;
	}
	.drawer > summary:hover {
		color: #ecd79a;
	}
	.drawer[open] > summary {
		border-bottom: 1px solid rgba(148, 178, 214, 0.14);
	}
	.drawer > *:not(summary) {
		padding: 0 0.9rem;
	}
	.drawer > *:last-child {
		padding-bottom: 0.8rem;
	}
	.drawer-title {
		margin: 0.8rem 0 0.35rem;
		font-size: 0.78rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #9fc6e8;
	}

	.deck-bottom {
		gap: 0.75rem;
	}
	.nav-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		min-height: 2.75rem;
		padding: 0 1.05rem;
		background: rgba(56, 189, 248, 0.12);
		border: 1px solid rgba(56, 189, 248, 0.4);
		border-radius: 999px;
		color: #d7ecff;
		font-size: 0.82rem;
		cursor: pointer;
	}
	.nav-btn:hover:not(:disabled) {
		background: #56b8f8;
		color: #030712;
	}
	.nav-btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.key-hint {
		margin: 0;
		font-size: 0.72rem;
		color: #7f93ad;
		text-align: center;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@media (max-width: 720px) {
		.deck-body {
			padding: 1.1rem 1rem 1.6rem;
		}
		.synapse {
			padding-left: 0;
		}
		.synapse-spine {
			display: none;
		}
		.fact {
			grid-template-columns: 1fr;
			gap: 0.15rem;
		}
		.deck-top,
		.deck-bottom,
		.deck-rail {
			padding-left: 0.9rem;
			padding-right: 0.9rem;
		}
		.key-hint {
			display: none;
		}
		.nav-btn {
			flex: 1 1 auto;
			justify-content: center;
		}
	}
</style>
