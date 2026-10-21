<script lang="ts">
	import { onMount, tick } from 'svelte';
	import {
		acquireScrollLock,
		releaseScrollLock,
		hasOpenModal,
		isTextEntryTarget,
		keyboardScrollRegion
	} from '$lib/deck/focus-utils';
	import { lang, type Lang } from '$lib/i18n';
	import { playBlip, playConfirm, sfxEnabled, toggleSfx } from '$lib/sound';
	import {
		cortexCopy,
		cortexProjects,
		localAnswer,
		projectEvidence,
		projectList,
		traceNodes,
		type Answer,
		type TraceKey
	} from '$lib/cortex-data';

	type Mode = 'query' | 'trace' | 'cli';
	type Message = Answer & { id: number; sender: 'cortex' | 'user'; language: Lang };
	let dialog: HTMLDialogElement;
	let launcher: HTMLButtonElement;
	let input = $state<HTMLInputElement>();
	let transcript = $state<HTMLDivElement>();
	let isOpen = $state(false);
	let mode = $state<Mode>('query');
	let selectedProject = $state<TraceKey>('emesys');
	let userInput = $state('');
	let queryMessages = $state<Message[]>([]);
	let cliMessages = $state<Message[]>([]);
	let voiceEnabled = $state(false);
	let speechSupported = $state(false);
	let isSpeaking = $state(false);
	let cachedVoices: SpeechSynthesisVoice[] = [];
	let utterance: SpeechSynthesisUtterance | undefined;
	let previousFocus: HTMLElement | null = null;
	let ownsScrollLock = false;
	let mounted = false;
	let nextId = 0;

	const c = $derived(cortexCopy[$lang]);
	const activeMessages = $derived(mode === 'cli' ? cliMessages : queryMessages);
	const evidence = $derived(projectEvidence(selectedProject, $lang));
	const nodes = $derived(traceNodes(selectedProject, $lang));
	const selectedStack = $derived(
		cortexProjects.find((p) => p.key === selectedProject)?.stack ?? ''
	);
	const modeItems = $derived([
		{ id: 'query' as const, number: '01', label: c.query },
		{ id: 'trace' as const, number: '02', label: c.trace },
		{ id: 'cli' as const, number: '03', label: c.cli }
	]);
	const quickQueries = $derived([
		{
			label: $lang === 'ms' ? 'Sistem sektor awam' : 'Public-sector systems',
			query: 'public sector'
		},
		{ label: $lang === 'ms' ? 'Pengalaman' : 'Experience', query: 'experience' },
		{ label: $lang === 'ms' ? 'Kemahiran' : 'Skills', query: 'skills' },
		{ label: 'Resume ATS', query: 'resume' }
	]);

	function message(sender: Message['sender'], answer: Answer, language = $lang): Message {
		return { id: ++nextId, sender, language, ...answer };
	}

	function unlockScroll() {
		if (!ownsScrollLock) return;
		releaseScrollLock();
		ownsScrollLock = false;
	}

	async function scrollTranscript() {
		await tick();
		if (mounted && isOpen && transcript) transcript.scrollTop = transcript.scrollHeight;
	}

	function openConsole() {
		if (!mounted || dialog.open || hasOpenModal(dialog)) return;
		previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		dialog.showModal();
		acquireScrollLock();
		ownsScrollLock = true;
		isOpen = true;
		if (!queryMessages.length) queryMessages = [message('cortex', { text: c.welcome })];
		if (!cliMessages.length) cliMessages = [message('cortex', { text: c.cliWelcome })];
		playConfirm();
		void tick().then(() => {
			if (mounted && dialog.open) input?.focus();
		});
		void scrollTranscript();
	}

	function finishClose() {
		isOpen = false;
		stopVoice();
		unlockScroll();
		const target = previousFocus?.isConnected ? previousFocus : launcher;
		previousFocus = null;
		target?.focus({ preventScroll: true });
	}

	function closeConsole() {
		if (dialog?.open) dialog.close();
		finishClose();
	}

	function toggleConsole() {
		if (dialog?.open) closeConsole();
		else openConsole();
	}

	function cancelDialog(event: Event) {
		event.preventDefault();
		closeConsole();
	}

	function nativeClose() {
		// A programmatic close is also handled synchronously, so never restore focus twice.
		if (!dialog.open && isOpen) finishClose();
	}

	function changeMode(next: Mode) {
		mode = next;
		userInput = '';
		stopVoice();
		playBlip(620, 0.035);
		void scrollTranscript();
	}

	function changeLanguage(language: Lang) {
		stopVoice();
		lang.set(language);
	}

	function updateVoices() {
		cachedVoices = window.speechSynthesis.getVoices();
	}

	function preferredVoice(language: Lang) {
		const prefixes = language === 'ms' ? ['ms', 'id', 'en'] : ['en'];
		for (const prefix of prefixes) {
			const matches = cachedVoices.filter((voice) => voice.lang.toLowerCase().startsWith(prefix));
			const natural = matches.find((voice) => /natural|neural|google|online/i.test(voice.name));
			if (natural || matches[0]) return natural ?? matches[0];
		}
		return cachedVoices[0];
	}

	function stopVoice() {
		if (!speechSupported) return;
		if (utterance) {
			utterance.onstart = null;
			utterance.onend = null;
			utterance.onerror = null;
			window.speechSynthesis.cancel();
			utterance = undefined;
		}
		isSpeaking = false;
	}

	function speak(text: string, language: Lang) {
		if (!speechSupported || !voiceEnabled) return;
		stopVoice();
		const clean = text
			.replace(/https?:\/\/\S+|[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '')
			.replace(/[•*_#`<>]/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
		if (!clean) return;
		const speech = new SpeechSynthesisUtterance(clean);
		const voice = preferredVoice(language);
		if (voice) speech.voice = voice;
		speech.lang = voice?.lang ?? (language === 'ms' ? 'ms-MY' : 'en-US');
		speech.rate = 0.96;
		speech.onstart = () => {
			if (utterance === speech) isSpeaking = true;
		};
		const finish = () => {
			if (utterance === speech) {
				isSpeaking = false;
				utterance = undefined;
			}
		};
		speech.onend = finish;
		speech.onerror = finish;
		utterance = speech;
		try {
			window.speechSynthesis.speak(speech);
		} catch {
			finish();
		}
	}

	function toggleVoice() {
		voiceEnabled = !voiceEnabled;
		if (!voiceEnabled) stopVoice();
	}

	function listen(item: Message) {
		// This native button is an explicit speech opt-in, never an automatic greeting.
		voiceEnabled = true;
		speak(item.text, item.language);
	}

	function executeCli(raw: string): Answer {
		const [command, ...args] = raw.toLowerCase().trim().split(/\s+/);
		if (command === 'trace') {
			const project = args[0] ?? selectedProject;
			if (args.length > 1 || !['emesys', 'sutera', 'adims'].includes(project))
				return { text: c.invalidTrace };
			selectedProject = project as TraceKey;
			mode = 'trace';
			return { text: `${c.traced} ${project}.` };
		}
		if (args.length) return { text: c.unknown };
		switch (command) {
			case 'help':
				return { text: c.cliHelp };
			case 'projects':
				return { text: `${c.projectsText}\n\n${projectList($lang)}`, action: 'projects' };
			case 'experience':
				return { text: c.experienceText, action: 'experience' };
			case 'skills':
				return { text: c.skillsText, action: 'skills' };
			case 'resume':
				return { text: c.resumeText, action: 'resume' };
			case 'contact':
				return { text: c.contactText, action: 'contact' };
			default:
				return { text: c.unknown };
		}
	}

	function submit(raw: string) {
		const text = raw.trim().slice(0, 800);
		if (!text) return;
		userInput = '';
		playBlip(700, 0.04);
		if (mode === 'cli') {
			if (text.toLowerCase() === 'clear') {
				cliMessages = [message('cortex', { text: c.cleared })];
				stopVoice();
			} else {
				const answer = executeCli(text);
				cliMessages = [
					...cliMessages.slice(-58),
					message('user', { text }),
					message('cortex', answer)
				];
				speak(answer.text, $lang);
			}
		} else {
			const answer = localAnswer(text, $lang);
			queryMessages = [
				...queryMessages.slice(-58),
				message('user', { text }),
				message('cortex', answer)
			];
			speak(answer.text, $lang);
		}
		void scrollTranscript();
	}

	function clearTranscript() {
		stopVoice();
		if (mode === 'cli') cliMessages = [message('cortex', { text: c.cleared })];
		else queryMessages = [message('cortex', { text: c.welcome })];
	}

	onMount(() => {
		mounted = true;
		speechSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
		if (speechSupported) {
			updateVoices();
			window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
		}
		const keyboard = (event: KeyboardEvent) => {
			if (event.defaultPrevented || isTextEntryTarget(event.target) || hasOpenModal(dialog)) return;
			if (
				(event.ctrlKey || event.metaKey) &&
				['j', 'k'].includes(event.key.toLowerCase()) &&
				!event.repeat
			) {
				event.preventDefault();
				toggleConsole();
			}
		};
		window.addEventListener('keydown', keyboard);
		window.addEventListener('open-jarvis', openConsole);
		return () => {
			mounted = false;
			window.removeEventListener('keydown', keyboard);
			window.removeEventListener('open-jarvis', openConsole);
			if (speechSupported)
				window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
			stopVoice();
			if (dialog.open) dialog.close();
			unlockScroll();
		};
	});
</script>

<button
	bind:this={launcher}
	type="button"
	class="cortex-launcher"
	class:opened={isOpen}
	onclick={toggleConsole}
	aria-label={`CORTEX J.A.R.V.I.S ⌘ K — ${c.open}`}
	aria-haspopup="dialog"
	aria-controls={isOpen ? 'neural-cortex-dialog' : undefined}
	aria-expanded={isOpen}
	title={`${c.open} · Ctrl / ⌘ K`}
>
	<svg viewBox="0 0 28 28" fill="none" aria-hidden="true"
		><path d="M4 6 14 14 24 5M14 14l10 10M14 14 4 23M14 14V3" /><circle
			cx="14"
			cy="14"
			r="4"
		/><circle cx="4" cy="6" r="2" /><circle cx="24" cy="5" r="2" /><circle
			cx="24"
			cy="24"
			r="2"
		/><circle cx="4" cy="23" r="2" /></svg
	>
	<span>CORTEX <small>J.A.R.V.I.S</small></span><span class="launcher-key" aria-hidden="true"
		>⌘ K</span
	>
</button>

<dialog
	bind:this={dialog}
	id="neural-cortex-dialog"
	class="cortex-dialog"
	aria-labelledby="cortex-title"
	aria-describedby="cortex-disclosure"
	oncancel={cancelDialog}
	onclose={nativeClose}
>
	<div class="console-shell">
		<header class="console-header">
			<div class="wordmark">
				<span class="brand-mark" aria-hidden="true">N/C</span>
				<div>
					<span class="eyebrow">{c.subtitle}</span>
					<h2 id="cortex-title">{c.title}<span class="title-dot">.</span></h2>
				</div>
			</div>
			<div class="header-controls">
				<div class="language-switch" role="group" aria-label={c.language}>
					<button type="button" aria-pressed={$lang === 'ms'} onclick={() => changeLanguage('ms')}
						>BM</button
					><button type="button" aria-pressed={$lang === 'en'} onclick={() => changeLanguage('en')}
						>EN</button
					>
				</div>
				<button
					type="button"
					class="close-control"
					onclick={closeConsole}
					aria-label={`× ESC — ${c.close}`}
					><span aria-hidden="true">×</span><span class="esc-key" aria-hidden="true">ESC</span
					></button
				>
			</div>
		</header>

		<div class="console-layout">
			<aside class="cortex-rail">
				<div class="rail-caption">
					<span class="tiny-cross" aria-hidden="true">+</span><span>J.A.R.V.I.S / 01</span>
				</div>
				<nav class="mode-nav" aria-label={c.modes}>
					{#each modeItems as item}
						<button
							type="button"
							class:chosen={mode === item.id}
							aria-pressed={mode === item.id}
							onclick={() => changeMode(item.id)}
							><span class="mode-number">{item.number}</span><span>{item.label}</span><span
								class="mode-arrow"
								aria-hidden="true">↗</span
							></button
						>
					{/each}
				</nav>
				<div class="neural-illustration" aria-hidden="true">
					<svg viewBox="0 0 240 300" fill="none">
						<g class="neural-grid"
							><path
								d="M0 60h240M0 120h240M0 180h240M0 240h240M60 0v300M120 0v300M180 0v300"
							/><circle cx="120" cy="150" r="91" /><circle cx="120" cy="150" r="53" /></g
						>
						<g class="branches"
							><path
								d="m120 150-40-34-32 8-27-37M80 116 71 65 41 40M71 65l35-29M120 150l36-54 36-12 24-38M156 96l-5-53M120 150l49 27 35-15 27 17M169 177l11 47 34 21M120 150l-31 57-39 8-28 49M89 207l18 48-15 31M120 150l-3 64 23 30 5 49"
							/></g
						>
						<g class="synapses"
							><circle cx="80" cy="116" r="4" /><circle cx="71" cy="65" r="3" /><circle
								cx="156"
								cy="96"
								r="4"
							/><circle cx="192" cy="84" r="3" /><circle cx="169" cy="177" r="4" /><circle
								cx="180"
								cy="224"
								r="3"
							/><circle cx="89" cy="207" r="4" /><circle cx="50" cy="215" r="3" /><circle
								cx="117"
								cy="214"
								r="3"
							/></g
						>
						<circle class="core-halo" cx="120" cy="150" r="22" /><circle
							class="core-node"
							cx="120"
							cy="150"
							r="10"
						/><path class="core-cross" d="M116 150h8m-4-4v8" />
					</svg>
					<span class="diagram-label">NEURAL / INDEX</span>
				</div>
				<div class="rail-note">
					<span class="eyebrow">{c.scope}</span>
					<p>{c.scopeBody}</p>
				</div>
				<a class="rail-resume" href="/resume.pdf" download="Resume_Muhammed_Munir.pdf"
					>{c.resume}<span aria-hidden="true">↓</span></a
				>
			</aside>

			<section
				class="workspace"
				aria-label={mode === 'query' ? c.query : mode === 'trace' ? c.trace : c.cli}
			>
				<div class="workspace-heading">
					<div>
						<span class="eyebrow workspace-index"
							>{mode === 'query'
								? '01 / QUERY'
								: mode === 'trace'
									? '02 / TRACE'
									: '03 / COMMAND'}</span
						>
						<h3>
							{mode === 'query' ? c.queryTitle : mode === 'trace' ? c.traceTitle : c.cliTitle}
						</h3>
						<p>{mode === 'query' ? c.querySub : mode === 'trace' ? c.traceSub : c.cliSub}</p>
					</div>
					<span class="heading-glyph" aria-hidden="true"
						>{mode === 'query' ? '⌁' : mode === 'trace' ? '⤳' : '>_'}</span
					>
				</div>
				<div class="local-disclosure" id="cortex-disclosure">
					<span class="local-indicator" aria-hidden="true"></span>
					<p><strong>{c.local}</strong> {c.disclosure}</p>
				</div>

				{#if mode === 'trace'}
					<div class="trace-workspace">
						<div class="project-selector">
							<label for="cortex-project">{c.select}</label><select
								id="cortex-project"
								bind:value={selectedProject}
								onchange={() => playBlip(650, 0.035)}
								><option value="emesys">eMesys</option><option value="sutera">Sutera</option><option
									value="adims">ADIMS</option
								></select
							><span class="trace-category">YHCM / {selectedProject.toUpperCase()}</span>
						</div>
						<figure class="stack-figure">
							<svg
								class="stack-connections"
								viewBox="0 0 800 100"
								preserveAspectRatio="none"
								fill="none"
								aria-hidden="true"
								><path class="trace-backbone" d="M40 50h720" /><path
									d="M100 50c65 0 65-30 130-30s65 30 130 30 65 30 130 30 65-30 130-30h80"
								/><path
									d="M100 50c65 0 65 30 130 30s65-30 130-30 65-30 130-30 65 30 130 30"
								/><circle cx="100" cy="50" r="5" /><circle cx="300" cy="50" r="5" /><circle
									cx="500"
									cy="50"
									r="5"
								/><circle cx="700" cy="50" r="5" /></svg
							>
							<ol class="stack-nodes">
								{#each nodes as node, i}<li>
										<span class="node-index">0{i + 1}</span><span class="node-label"
											>{node.label}</span
										><strong class:unknown-node={node.value === c.undocumented}>{node.value}</strong
										>
									</li>{/each}
							</ol>
							<figcaption>{c.traceNote}</figcaption>
						</figure>
						<article class="evidence-card">
							<div class="evidence-heading">
								<span class="eyebrow">{c.evidence}</span><span
									class="evidence-mark"
									aria-hidden="true">↗</span
								>
							</div>
							<h4>{evidence.title}</h4>
							<p>{evidence.desc}</p>
							<ul>
								{#each evidence.features as feature}<li>{feature}</li>{/each}
							</ul>
							<p class="stack-tags">{selectedStack}</p>
							{#if selectedProject === 'adims'}<p class="evidence-caveat">{c.adimsNote}</p>{/if}
							<p class="evidence-source">{c.source}</p>
							<a class="text-action" href="/#projects" onclick={closeConsole}
								>{c.projects} <span aria-hidden="true">↗</span></a
							>
						</article>
					</div>
				{:else}
					<div class="transcript-toolbar">
						<span>{mode === 'cli' ? 'MUNIR@PORTFOLIO:~' : 'QUERY / RESPONSE'}</span><button
							type="button"
							onclick={clearTranscript}>{c.clear}</button
						>
					</div>
					<!-- Keyboard focus is required so this independently scrolling transcript can be read with arrow/Page keys. -->
					<div
						bind:this={transcript}
						class="transcript"
						class:terminal={mode === 'cli'}
						role="region"
						aria-label={`${mode === 'cli' ? c.cli : c.query} — ${$lang === 'ms' ? 'Transkrip' : 'Transcript'}`}
						use:keyboardScrollRegion
					>
						<div role="log" aria-live="polite" aria-relevant="additions">
							{#each activeMessages as item (item.id)}
								<article class="message" class:user-message={item.sender === 'user'}>
									<div class="message-meta">
										<span class="message-marker" aria-hidden="true"
											>{item.sender === 'user' ? '↳' : mode === 'cli' ? '>' : 'N'}</span
										><span>{item.sender === 'user' ? c.you : c.assistant}</span><span
											class="message-sequence"
											aria-hidden="true">{String(item.id).padStart(2, '0')}</span
										>
									</div>
									<p class="message-text" lang={item.language}>{item.text}</p>
									{#if item.action}<a
											class="text-action"
											href={item.action === 'resume' ? '/resume.pdf' : `/#${item.action}`}
											download={item.action === 'resume' ? 'Resume_Muhammed_Munir.pdf' : undefined}
											onclick={item.action === 'resume' ? undefined : closeConsole}
											>{c[item.action]}
											<span aria-hidden="true">{item.action === 'resume' ? '↓' : '↗'}</span></a
										>{/if}
									{#if item.sender === 'cortex' && speechSupported && mode === 'query'}<button
											type="button"
											class="listen-control"
											onclick={() => listen(item)}
											>{c.listen} <span aria-hidden="true">◖</span></button
										>{/if}
								</article>
							{/each}
						</div>
					</div>
					{#if mode === 'query'}<div class="quick-queries" role="group" aria-label={c.shortcuts}>
							{#each quickQueries as quick}<button type="button" onclick={() => submit(quick.query)}
									>{quick.label}<span aria-hidden="true">↗</span></button
								>{/each}
						</div>{:else}<div class="cli-shortcuts" role="group" aria-label={c.shortcuts}>
							{#each ['help', 'projects', 'experience', 'skills', 'resume', 'contact', 'trace', 'clear'] as command}<button
									type="button"
									onclick={() => submit(command)}>{command}</button
								>{/each}
						</div>{/if}
					<form
						class="query-form"
						onsubmit={(event) => {
							event.preventDefault();
							submit(userInput);
						}}
					>
						<label class="sr-only" for="cortex-input">{mode === 'cli' ? c.command : c.input}</label
						><span class="input-prompt" aria-hidden="true">{mode === 'cli' ? '$' : '↳'}</span><input
							bind:this={input}
							id="cortex-input"
							bind:value={userInput}
							type="text"
							maxlength="800"
							autocomplete="off"
							spellcheck={mode !== 'cli'}
							placeholder={mode === 'cli' ? c.cliPlaceholder : c.placeholder}
						/><button type="submit" disabled={!userInput.trim()}
							>{c.send}<span aria-hidden="true">↗</span></button
						>
					</form>
				{/if}
			</section>
		</div>

		<footer class="console-footer">
			<div class="audio-controls">
				<button
					type="button"
					aria-pressed={voiceEnabled}
					disabled={!speechSupported}
					title={!speechSupported ? c.unsupported : undefined}
					onclick={toggleVoice}
					>{c.voice}<span class:enabled={voiceEnabled}>{voiceEnabled ? c.on : c.off}</span></button
				><button type="button" aria-pressed={$sfxEnabled} onclick={toggleSfx}
					>{c.sound}<span class:enabled={$sfxEnabled}>{$sfxEnabled ? c.on : c.off}</span></button
				>{#if isSpeaking}<button type="button" class="stop-voice" onclick={stopVoice}
						>{c.stop} ■</button
					>{/if}
			</div>
			<div class="scope-wave">
				<svg viewBox="0 0 180 24" fill="none" aria-hidden="true"
					><path d="M0 12h25l7-3 7 6 8-12 8 18 8-9h13l7-5 7 10 7-5h18l8-8 8 16 8-8h41" /></svg
				><span>{c.schematic}</span>
			</div>
			<span class="keyboard-hint">{c.keyboard}</span>
		</footer>
	</div>
</dialog>

<style>
	.cortex-launcher {
		position: fixed;
		z-index: 990;
		right: 1.5rem;
		bottom: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.8rem;
		border: 1px solid #476064;
		border-radius: 3px;
		background: #11191df2;
		color: #eaf4f2;
		padding: 0.8rem 1rem;
		box-shadow: 0 8px 32px #0005;
		cursor: pointer;
		font: 600 0.72rem/1.25 var(--font-mono, monospace);
		letter-spacing: 0.12em;
	}
	.cortex-launcher svg {
		width: 28px;
		height: 28px;
		stroke: #8ce8de;
		stroke-width: 1.3;
	}
	.cortex-launcher small {
		display: block;
		color: #9aaeb0;
		font-size: 0.5rem;
		letter-spacing: 0.16em;
		margin-top: 0.25rem;
	}
	.launcher-key {
		margin-left: 0.6rem;
		color: #a6b4b7;
		font-size: 0.65rem;
		letter-spacing: 0;
	}
	.cortex-launcher:hover,
	.cortex-launcher.opened {
		border-color: #94e5d9;
		background: #19262c;
	}
	.cortex-dialog {
		--cyan: #92e6dc;
		--violet: #c6b6ff;
		--gold: #e3c38b;
		--muted: #a6b4ba;
		--line: #ffffff1c;
		--surface: #151b20;
		color-scheme: dark;
		position: fixed;
		inset: 0;
		width: min(1360px, calc(100vw - 4rem));
		max-width: none;
		height: min(900px, calc(100dvh - 4rem));
		max-height: none;
		margin: auto;
		padding: 0;
		overflow: hidden;
		border: 1px solid #506267;
		border-radius: 6px;
		background: #101519;
		color: #e8edee;
		box-shadow: 0 40px 160px #000b;
		font-family: var(--font-sans, 'Inter', sans-serif);
	}
	.cortex-dialog::backdrop {
		background: #050a10c9;
		backdrop-filter: blur(12px);
	}
	.cortex-dialog:not([open]) {
		display: none;
	}
	.console-shell {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
	}
	.console-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex: 0 0 auto;
		gap: 1rem;
		padding: 1.25rem 1.7rem;
		border-bottom: 1px solid var(--line);
		background: #151c21;
	}
	.wordmark {
		display: flex;
		align-items: center;
		gap: 1rem;
		min-width: 0;
	}
	.brand-mark {
		color: var(--cyan);
		font: 500 0.9rem/1 monospace;
		letter-spacing: -0.1em;
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border: 1px solid #92e6dc59;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.eyebrow {
		color: var(--muted);
		font: 500 0.61rem/1.5 var(--font-mono, monospace);
		letter-spacing: 0.13em;
		text-transform: uppercase;
	}
	h2 {
		margin: 0.2rem 0 0;
		font-size: 1.25rem;
		font-weight: 500;
		letter-spacing: -0.04em;
		line-height: 1.15;
	}
	.title-dot {
		color: var(--cyan);
	}
	.header-controls {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}
	.language-switch {
		display: flex;
		border: 1px solid var(--line);
		border-radius: 3px;
		padding: 3px;
	}
	.language-switch button {
		border: 0;
		color: var(--muted);
		background: transparent;
		padding: 0.4rem 0.55rem;
		font: 0.66rem monospace;
		cursor: pointer;
		min-height: 32px;
	}
	.language-switch button[aria-pressed='true'] {
		background: #31413f;
		color: #bcfff1;
		border-radius: 2px;
	}
	.close-control {
		border: 0;
		background: none;
		color: #e8edee;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 44px;
	}
	.close-control > span:first-child {
		font-size: 1.8rem;
		font-weight: 300;
	}
	.esc-key {
		font: 0.6rem monospace;
		color: var(--muted);
	}
	.console-layout {
		display: grid;
		grid-template-columns: 245px minmax(0, 1fr);
		flex: 1;
		min-height: 0;
	}
	.cortex-rail {
		min-width: 0;
		display: flex;
		flex-direction: column;
		padding: 1.4rem 1.1rem 1.1rem;
		border-right: 1px solid var(--line);
		background: linear-gradient(160deg, #172025, #11171c 65%);
		overflow-y: auto;
	}
	.rail-caption {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		color: var(--muted);
		font: 0.58rem monospace;
		letter-spacing: 0.14em;
		padding: 0 0.5rem 1.5rem;
	}
	.tiny-cross {
		font-size: 1.2rem;
		color: var(--gold);
	}
	.mode-nav {
		display: grid;
		gap: 0.5rem;
	}
	.mode-nav button {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		text-align: left;
		min-height: 52px;
		padding: 0.8rem 0.65rem;
		border: 1px solid transparent;
		border-radius: 3px;
		color: #b5c0c5;
		background: transparent;
		font-size: 0.76rem;
		cursor: pointer;
	}
	.mode-nav button.chosen {
		background: #92e6dc0c;
		border-color: #92e6dc38;
		color: var(--cyan);
	}
	.mode-nav button:hover {
		background: #ffffff09;
	}
	.mode-number {
		font: 0.61rem monospace;
		color: #98a5ac;
	}
	.mode-nav .chosen .mode-number {
		color: var(--cyan);
	}
	.mode-arrow {
		margin-left: auto;
		font-size: 1.05rem;
	}
	.neural-illustration {
		position: relative;
		flex: 1;
		min-height: 130px;
		max-height: 310px;
		margin: 1rem -0.4rem 0.8rem;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.neural-illustration svg {
		width: 100%;
		height: 100%;
		opacity: 0.8;
		max-height: 300px;
	}
	.neural-grid {
		stroke: #92e6dc13;
		stroke-width: 0.7;
	}
	.branches {
		stroke: #9cbdca;
		stroke-width: 1;
	}
	.branches path:nth-child(2n) {
		stroke: var(--violet);
	}
	.synapses {
		fill: #172126;
		stroke: #95d3ca;
		stroke-width: 1.3;
	}
	.core-halo {
		stroke: #92e6dc40;
		fill: #92e6dc08;
	}
	.core-node {
		fill: var(--cyan);
	}
	.core-cross {
		stroke: #152624;
	}
	.diagram-label {
		position: absolute;
		bottom: 0;
		left: 0;
		padding: 0.25rem 0.5rem;
		font: 0.48rem monospace;
		letter-spacing: 0.15em;
		color: #9db1b5;
		background: #131b20;
	}
	.rail-note {
		margin-top: auto;
		padding: 1rem 0.5rem;
		border-top: 1px solid var(--line);
	}
	.rail-note .eyebrow {
		color: var(--gold);
	}
	.rail-note p {
		margin: 0.5rem 0 0;
		color: var(--muted);
		font-size: 0.7rem;
		line-height: 1.7;
	}
	.rail-resume {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.85rem 0.5rem 0.25rem;
		color: var(--gold);
		font-size: 0.7rem;
		text-decoration: none;
	}
	.rail-resume span {
		font-size: 1rem;
	}
	.workspace {
		min-width: 0;
		min-height: 0;
		display: flex;
		flex-direction: column;
		padding: 1.6rem 2rem 1.3rem;
		background: radial-gradient(ellipse at 100% 0, #a38bff09, transparent 50%);
	}
	.workspace-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex: 0 0 auto;
		padding-bottom: 1.2rem;
	}
	.workspace-index {
		color: var(--violet);
		font-size: 0.58rem;
	}
	h3 {
		font-size: clamp(1.5rem, 2.7vw, 2.4rem);
		font-weight: 400;
		letter-spacing: -0.055em;
		line-height: 1.15;
		margin: 0.6rem 0 0.4rem;
	}
	.workspace-heading p {
		margin: 0;
		font-size: 0.77rem;
		color: var(--muted);
		line-height: 1.6;
	}
	.heading-glyph {
		font: 300 3.4rem/1 monospace;
		color: var(--violet);
		opacity: 0.75;
		padding-right: 0.2rem;
	}
	.local-disclosure {
		display: flex;
		align-items: flex-start;
		gap: 0.65rem;
		padding: 0.75rem 0.85rem;
		border: 1px solid var(--line);
		border-left: 2px solid #92e6dc7a;
		background: #92e6dc05;
		flex-shrink: 0;
	}
	.local-indicator {
		width: 5px;
		height: 5px;
		margin-top: 0.4rem;
		background: var(--cyan);
		flex: 0 0 auto;
	}
	.local-disclosure p {
		color: var(--muted);
		font-size: 0.66rem;
		line-height: 1.7;
		margin: 0;
	}
	.local-disclosure strong {
		color: #c3dad6;
		font: 500 0.58rem/1.7 monospace;
		letter-spacing: 0.08em;
		margin-right: 0.5rem;
	}
	.transcript-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		padding: 0.85rem 0 0.5rem;
		flex-shrink: 0;
		font: 0.56rem monospace;
		letter-spacing: 0.08em;
		color: var(--muted);
	}
	.transcript-toolbar button {
		border: 0;
		background: none;
		color: var(--muted);
		font: 0.62rem monospace;
		padding: 0.35rem 0.1rem;
		cursor: pointer;
		min-height: 32px;
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.transcript {
		flex: 1;
		min-height: 100px;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: 0.15rem 1rem 0.5rem 0.15rem;
		scrollbar-color: #506163 transparent;
		scrollbar-width: thin;
	}
	.message {
		padding: 1rem 0 1.1rem;
		border-bottom: 1px solid var(--line);
	}
	.message:first-child {
		padding-top: 0.4rem;
	}
	.message-meta {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		color: var(--cyan);
		font: 0.58rem/1.5 monospace;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.message-marker {
		display: grid;
		place-items: center;
		width: 20px;
		height: 20px;
		background: #92e6dc0c;
		border: 1px solid #92e6dc38;
		border-radius: 50%;
		font-size: 0.65rem;
	}
	.message-sequence {
		margin-left: auto;
		color: #8e9ea6;
		font-size: 0.55rem;
	}
	.message-text {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		margin: 0.65rem 0 0.6rem 1.65rem;
		font-size: 0.85rem;
		line-height: 1.85;
		color: #d4dee0;
	}
	.user-message .message-meta {
		color: var(--violet);
	}
	.user-message .message-marker {
		color: var(--violet);
		background: #c6b6ff0b;
		border-color: #c6b6ff45;
	}
	.user-message .message-text {
		color: #d3c8ed;
	}
	.text-action {
		display: inline-flex;
		align-items: center;
		gap: 0.9rem;
		margin: 0.3rem 0 0.25rem 1.65rem;
		padding: 0.5rem 0.7rem;
		color: var(--gold);
		background: #e3c38b0a;
		border: 1px solid #e3c38b32;
		border-radius: 2px;
		text-decoration: none;
		font-size: 0.7rem;
		line-height: 1.5;
	}
	.text-action:hover {
		background: #e3c38b18;
	}
	.listen-control {
		display: block;
		margin: 0.3rem 0 0 1.65rem;
		border: 0;
		background: none;
		padding: 0.4rem 0;
		color: #a8b8bf;
		font-size: 0.62rem;
		cursor: pointer;
	}
	.listen-control span {
		color: var(--cyan);
		margin-left: 0.35rem;
	}
	.quick-queries,
	.cli-shortcuts {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		padding: 0.8rem 0;
		flex-shrink: 0;
	}
	.quick-queries button,
	.cli-shortcuts button {
		border: 1px solid #ffffff24;
		background: #ffffff03;
		border-radius: 2px;
		padding: 0.5rem 0.65rem;
		color: #c1ced2;
		font-size: 0.65rem;
		cursor: pointer;
		min-height: 34px;
	}
	.quick-queries button:hover,
	.cli-shortcuts button:hover {
		border-color: var(--cyan);
		color: var(--cyan);
	}
	.quick-queries button span {
		color: var(--cyan);
		margin-left: 0.8rem;
	}
	.query-form {
		display: flex;
		align-items: center;
		min-width: 0;
		border: 1px solid #65827f;
		border-radius: 3px;
		background: #182126;
		padding: 0.35rem;
		gap: 0.65rem;
		flex-shrink: 0;
	}
	.query-form:focus-within {
		border-color: var(--cyan);
		box-shadow: 0 0 0 2px #92e6dc18;
	}
	.input-prompt {
		color: var(--cyan);
		padding-left: 0.6rem;
		font-size: 1.2rem;
	}
	.query-form input {
		min-width: 0;
		flex: 1;
		background: transparent;
		color: #edf5f4;
		border: 0;
		padding: 0.6rem 0;
		font: inherit;
		font-size: 0.8rem;
		line-height: 1.6;
		outline: none;
	}
	.query-form input::placeholder {
		color: #a5b5bc;
		font-size: 0.73rem;
	}
	.query-form button {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		color: #13231f;
		background: var(--cyan);
		border: 0;
		border-radius: 2px;
		padding: 0.7rem 0.9rem;
		font-size: 0.7rem;
		font-weight: 600;
		cursor: pointer;
		min-height: 42px;
	}
	.query-form button:disabled {
		background: #344a49;
		color: #acbcba;
		cursor: default;
	}
	.terminal {
		background: #0b1115;
		border: 1px solid var(--line);
		padding: 0.8rem 1rem;
	}
	.terminal .message-text {
		font: 0.75rem/1.9 var(--font-mono, monospace);
		color: #c6dcd4;
	}
	.terminal .user-message .message-text {
		color: var(--gold);
	}
	.terminal .message-marker {
		border: 0;
		background: transparent;
	}
	.cli-shortcuts {
		gap: 0.35rem;
	}
	.cli-shortcuts button {
		font-family: monospace;
		font-size: 0.63rem;
		padding: 0.4rem 0.55rem;
	}
	.trace-workspace {
		overflow-y: auto;
		min-height: 0;
		flex: 1;
		overscroll-behavior: contain;
		scrollbar-width: thin;
		scrollbar-color: #506163 transparent;
		padding-right: 0.4rem;
	}
	.project-selector {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.8rem;
		padding: 1.2rem 0;
	}
	.project-selector label {
		font-size: 0.7rem;
		color: var(--muted);
	}
	.project-selector select {
		min-width: 135px;
		min-height: 42px;
		padding: 0.6rem 1.8rem 0.6rem 0.7rem;
		color: var(--cyan);
		border: 1px solid #526864;
		border-radius: 3px;
		background: #192529;
		font-size: 0.75rem;
	}
	.trace-category {
		margin-left: auto;
		color: var(--violet);
		font: 0.56rem monospace;
		letter-spacing: 0.08em;
	}
	.stack-figure {
		position: relative;
		margin: 0 0 1.2rem;
		padding: 1.2rem 0 0;
		border: 1px solid #c6b6ff30;
		background: linear-gradient(110deg, #92e6dc05, #c6b6ff07);
		border-radius: 3px;
	}
	.stack-connections {
		display: block;
		width: 100%;
		height: 85px;
		stroke: #c6b6ff60;
		stroke-width: 1;
	}
	.trace-backbone {
		stroke: var(--cyan);
		stroke-width: 1.2;
	}
	.stack-connections circle {
		fill: var(--cyan);
		stroke: #16231e;
		stroke-width: 2;
	}
	.stack-nodes {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		list-style: none;
		padding: 0 1rem 1.2rem;
		margin: 0;
		gap: 0.7rem;
	}
	.stack-nodes li {
		border-top: 1px solid #92e6dc55;
		padding: 0.8rem 0.4rem 0;
		min-width: 0;
	}
	.node-index {
		display: block;
		color: var(--violet);
		font: 0.54rem monospace;
		margin-bottom: 0.7rem;
	}
	.node-label {
		display: block;
		color: var(--muted);
		font-size: 0.6rem;
		margin-bottom: 0.4rem;
	}
	.stack-nodes strong {
		display: block;
		font-size: 0.81rem;
		font-weight: 500;
		overflow-wrap: anywhere;
		line-height: 1.5;
		color: var(--cyan);
	}
	.stack-nodes strong.unknown-node {
		color: var(--muted);
		font-size: 0.7rem;
		font-style: italic;
	}
	.stack-figure figcaption {
		padding: 0.7rem 1rem;
		color: var(--muted);
		background: #10151977;
		border-top: 1px solid var(--line);
		font-size: 0.64rem;
		line-height: 1.7;
	}
	.evidence-card {
		background: #ffffff03;
		padding: 1.2rem;
		border: 1px solid var(--line);
		border-radius: 3px;
	}
	.evidence-heading {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.evidence-heading .eyebrow {
		color: var(--gold);
	}
	.evidence-mark {
		color: var(--gold);
	}
	.evidence-card h4 {
		margin: 0.7rem 0 0.6rem;
		font-size: 1.05rem;
		font-weight: 500;
		line-height: 1.5;
		letter-spacing: -0.02em;
	}
	.evidence-card p,
	.evidence-card li {
		font-size: 0.75rem;
		line-height: 1.8;
		color: #bac9ce;
	}
	.evidence-card ul {
		padding-left: 1rem;
		margin: 0.8rem 0;
	}
	.evidence-card li {
		padding-left: 0.3rem;
		margin: 0.25rem 0;
	}
	.evidence-card li::marker {
		color: var(--violet);
	}
	.evidence-card .stack-tags {
		font: 0.66rem/1.9 monospace;
		color: var(--cyan);
		padding: 0.7rem 0;
		border-block: 1px solid var(--line);
		margin-top: 1rem;
	}
	.evidence-card .evidence-caveat {
		padding: 0.65rem 0.8rem;
		border-left: 2px solid var(--gold);
		color: #d8c9aa;
		background: #e3c38b08;
	}
	.evidence-card .evidence-source {
		color: var(--muted);
		font-size: 0.63rem;
	}
	.evidence-card .text-action {
		margin-left: 0;
	}
	.console-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-shrink: 0;
		gap: 1rem;
		border-top: 1px solid var(--line);
		background: #141b20;
		padding: 0.6rem 1.4rem;
	}
	.audio-controls {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.6rem;
	}
	.audio-controls button {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		color: #c0cbd0;
		border: 1px solid transparent;
		background: none;
		font-size: 0.62rem;
		padding: 0.4rem 0.25rem;
		cursor: pointer;
		min-height: 32px;
	}
	.audio-controls button:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}
	.audio-controls button span {
		font: 0.53rem monospace;
		color: #b0bdc3;
		border: 1px solid #ffffff25;
		border-radius: 2px;
		padding: 0.22rem 0.3rem;
	}
	.audio-controls button span.enabled {
		color: var(--cyan);
		border-color: #92e6dc55;
	}
	.audio-controls .stop-voice {
		color: var(--gold);
	}
	.scope-wave {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		color: #a1b3ba;
		font: 0.52rem monospace;
	}
	.scope-wave svg {
		width: 70px;
		height: 22px;
		stroke: #92e6dc9c;
		stroke-width: 1;
	}
	.keyboard-hint {
		font: 0.52rem/1.5 monospace;
		color: #a1b3ba;
		text-align: right;
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
	:where(button, a, select, .transcript):focus-visible {
		outline: 2px solid #f0d69e;
		outline-offset: 4px;
	}
	.query-form input:focus-visible {
		outline: 2px solid #f0d69e;
		outline-offset: 3px;
	}
	@media (min-width: 1500px) and (min-height: 850px) {
		.workspace {
			padding: 2.1rem 2.7rem 1.7rem;
		}
		.workspace-heading {
			padding-bottom: 1.7rem;
		}
		.message-text {
			font-size: 0.92rem;
		}
		.cortex-rail {
			padding-top: 1.9rem;
		}
	}
	@media (max-width: 1100px) {
		.cortex-dialog {
			width: calc(100vw - 2rem);
			height: calc(100dvh - 2rem);
		}
		.console-layout {
			grid-template-columns: 210px minmax(0, 1fr);
		}
		.workspace {
			padding: 1.3rem;
		}
		.mode-nav button {
			font-size: 0.7rem;
			gap: 0.5rem;
		}
		.scope-wave {
			display: none;
		}
		.message-text {
			font-size: 0.81rem;
		}
	}
	@media (max-width: 760px) {
		.cortex-dialog {
			width: calc(100vw - 1rem);
			height: calc(100dvh - 1rem);
			border-radius: 4px;
		}
		.console-header {
			padding: 0.75rem 1rem;
			gap: 0.5rem;
		}
		.brand-mark {
			width: 34px;
			height: 34px;
			font-size: 0.72rem;
		}
		.wordmark {
			gap: 0.6rem;
		}
		.wordmark .eyebrow {
			font-size: 0.5rem;
			letter-spacing: 0.05em;
		}
		h2 {
			font-size: 1.12rem;
		}
		.header-controls {
			gap: 0.7rem;
		}
		.esc-key {
			display: none;
		}
		.console-layout {
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: auto minmax(0, 1fr);
		}
		.cortex-rail {
			padding: 0.6rem 0.75rem;
			border-right: 0;
			border-bottom: 1px solid var(--line);
			overflow: visible;
		}
		.rail-caption,
		.neural-illustration,
		.rail-note,
		.rail-resume {
			display: none;
		}
		.mode-nav {
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 0.35rem;
		}
		.mode-nav button {
			min-height: 44px;
			padding: 0.6rem 0.5rem;
			font-size: 0.65rem;
		}
		.mode-number {
			font-size: 0.5rem;
		}
		.mode-arrow {
			display: none;
		}
		.workspace {
			padding: 1rem;
		}
		.workspace-heading {
			padding-bottom: 0.75rem;
		}
		h3 {
			font-size: 1.6rem;
			margin-top: 0.35rem;
		}
		.workspace-heading p {
			font-size: 0.68rem;
		}
		.heading-glyph {
			font-size: 2.3rem;
		}
		.workspace-index {
			font-size: 0.5rem;
		}
		.console-footer {
			padding: 0.35rem 0.75rem;
			gap: 0.5rem;
		}
		.keyboard-hint {
			font-size: 0.45rem;
			max-width: 145px;
		}
		.audio-controls {
			gap: 0.4rem;
		}
		.audio-controls button {
			min-height: 44px;
			font-size: 0.57rem;
		}
		.audio-controls button span {
			font-size: 0.48rem;
		}
		.local-disclosure {
			padding: 0.5rem 0.65rem;
		}
		.local-disclosure p {
			font-size: 0.6rem;
		}
		.local-disclosure strong {
			font-size: 0.53rem;
		}
		.stack-nodes {
			gap: 0.5rem;
			padding-inline: 0.7rem;
		}
		.stack-nodes strong {
			font-size: 0.73rem;
		}
		.trace-category {
			display: none;
		}
		.evidence-card {
			padding: 1rem;
		}
	}
	@media (max-width: 430px) {
		.cortex-launcher {
			bottom: 1rem;
			right: 1rem;
			padding: 0.65rem 0.8rem;
			gap: 0.6rem;
		}
		.launcher-key {
			display: none;
		}
		.cortex-dialog {
			width: 100vw;
			height: 100dvh;
			border-radius: 0;
			border: 0;
		}
		.console-header {
			padding: 0.6rem 0.75rem;
		}
		.wordmark .eyebrow {
			max-width: 145px;
			display: block;
			line-height: 1.45;
		}
		.brand-mark {
			display: none;
		}
		.header-controls {
			gap: 0.4rem;
		}
		.language-switch button {
			min-height: 44px;
			min-width: 32px;
			padding: 0.35rem 0.45rem;
		}
		.close-control {
			padding: 0 0.3rem;
		}
		.workspace {
			padding: 0.8rem 0.7rem 0.65rem;
		}
		.heading-glyph {
			display: none;
		}
		h3 {
			font-size: 1.4rem;
		}
		.mode-nav {
			gap: 0.25rem;
		}
		.mode-nav button {
			display: block;
			padding: 0.5rem 0.35rem;
			line-height: 1.4;
			font-size: 0.61rem;
		}
		.mode-number {
			display: block;
			margin-bottom: 0.15rem;
		}
		.local-indicator {
			display: none;
		}
		.local-disclosure p {
			font-size: 0.58rem;
		}
		.local-disclosure strong {
			display: block;
		}
		.transcript-toolbar {
			padding: 0.5rem 0 0.35rem;
			font-size: 0.5rem;
		}
		.transcript-toolbar button {
			font-size: 0.55rem;
		}
		.transcript {
			padding-right: 0.35rem;
		}
		.message-text {
			margin-left: 0;
			font-size: 0.77rem;
		}
		.text-action,
		.listen-control {
			margin-left: 0;
		}
		.quick-queries,
		.cli-shortcuts {
			gap: 0.3rem;
			padding: 0.55rem 0;
		}
		.quick-queries button {
			padding: 0.4rem 0.5rem;
			font-size: 0.59rem;
		}
		.quick-queries button span {
			margin-left: 0.45rem;
		}
		.query-form {
			gap: 0.45rem;
		}
		.input-prompt {
			padding-left: 0.25rem;
		}
		.query-form input {
			font-size: 16px;
			width: 0;
		}
		.query-form input::placeholder {
			font-size: 0.65rem;
		}
		.query-form button {
			padding: 0.6rem;
			gap: 0.35rem;
			font-size: 0.63rem;
		}
		.keyboard-hint {
			display: none;
		}
		.console-footer {
			padding: 0.35rem 0.7rem calc(0.35rem + env(safe-area-inset-bottom));
		}
		.audio-controls {
			justify-content: space-between;
			width: 100%;
		}
		.project-selector {
			gap: 0.5rem;
			padding: 0.8rem 0;
		}
		.project-selector label {
			width: 100%;
			font-size: 0.65rem;
		}
		.project-selector select {
			width: 100%;
		}
		.stack-connections {
			position: absolute;
			left: 0.65rem;
			top: 1rem;
			width: 24px;
			height: calc(100% - 6rem);
			opacity: 0.5;
		}
		.stack-nodes {
			grid-template-columns: 1fr;
			padding: 0 0.8rem 0.5rem 2rem;
			gap: 0;
		}
		.stack-nodes li {
			display: grid;
			grid-template-columns: 22px 1fr;
			gap: 0.25rem 0.5rem;
			padding: 0.7rem 0.4rem;
		}
		.node-index {
			grid-row: span 2;
			margin: 0.2rem 0 0;
		}
		.node-label {
			margin: 0;
		}
		.stack-figure {
			padding-top: 0.2rem;
		}
		.evidence-card h4 {
			font-size: 0.9rem;
		}
		.terminal {
			padding: 0.5rem 0.65rem;
		}
		.terminal .message-text {
			font-size: 0.68rem;
		}
	}
	@media (max-height: 620px) and (min-width: 761px) {
		.workspace-heading {
			padding-bottom: 0.5rem;
		}
		.workspace-heading p,
		.heading-glyph,
		.neural-illustration,
		.rail-note {
			display: none;
		}
		.workspace {
			padding-block: 0.7rem;
		}
		h3 {
			font-size: 1.6rem;
			margin-top: 0.25rem;
		}
		.console-header {
			padding-block: 0.65rem;
		}
		.local-disclosure {
			padding-block: 0.45rem;
		}
		.transcript-toolbar {
			padding-block: 0.35rem;
		}
		.rail-resume {
			margin-top: auto;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.cortex-dialog,
		.cortex-launcher,
		.cortex-dialog * {
			scroll-behavior: auto !important;
			animation: none !important;
			transition: none !important;
		}
	}
</style>
