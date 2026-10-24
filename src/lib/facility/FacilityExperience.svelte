<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { lang } from '$lib/i18n';
	import { theme } from '$lib/theme';
	import { CHAMBERS, CONTACT, isChamberId, type ChamberId } from './chambers';
	import type { FacilityWorld } from './FacilityWorld';
	import FacilityHUD from './FacilityHUD.svelte';
	import FacilityDossier from './FacilityDossier.svelte';

	let host: HTMLDivElement;
	let dialog: HTMLDialogElement;
	let currentChamber = $state<ChamberId>(0);
	let selected = $state(0);
	let visited = $state<number[]>([0]);
	let actionStep = $state(0);
	let travelling = $state(false);
	let motionPaused = $state(false);
	let reducedMotion = $state(false);
	let worldState = $state<'loading' | 'ready' | 'unavailable' | 'text'>('loading');
	let dossierOpen = $state(false);
	let wantsText = false;
	let mounted = false;
	let generation = 0;
	let opener: HTMLElement | null = null;
	let world: FacilityWorld | null = null;
	const paused = $derived(motionPaused || reducedMotion);
	const chamber = $derived(CHAMBERS[currentChamber]);

	function disposeWorld() {
		generation++;
		world?.dispose();
		world = null;
		travelling = false;
	}

	async function bootWorld() {
		disposeWorld();
		if (!mounted || wantsText) { worldState = 'text'; return; }
		worldState = 'loading';
		const attempt = generation;
		try {
			const { FacilityWorld } = await import('./FacilityWorld');
			if (!mounted || generation !== attempt || wantsText) return;
			world = new FacilityWorld(host, {
				chamber: currentChamber,
				theme: $theme,
				paused,
				onInspect: (detail) => { void openDossier(detail); },
				onTravel: (value) => { travelling = value; },
				onContextLost: () => {
					worldState = 'unavailable';
					queueMicrotask(disposeWorld);
				}
			});
			worldState = 'ready';
		} catch {
			if (!mounted || generation !== attempt) return;
			disposeWorld();
			worldState = 'unavailable';
		}
	}

	function selectChamber(id: ChamberId, updateHash = true) {
		if (!isChamberId(id) || id === currentChamber) return;
		currentChamber = id;
		selected = 0;
		actionStep = 0;
		if (!visited.includes(id)) visited = [...visited, id];
		world?.goToChamber(id);
		if (updateHash) history.replaceState(history.state, '', `#station-${id}`);
	}

	function next() { if (currentChamber < 5) selectChamber((currentChamber + 1) as ChamberId); }
	function previous() { if (currentChamber > 0) selectChamber((currentChamber - 1) as ChamberId); }

	async function openDossier(detail = 0, trigger?: HTMLElement) {
		selected = Math.max(0, Math.min(detail, chamber.details.length - 1));
		opener = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
		dossierOpen = true;
		world?.setFocus(selected);
		world?.setSuspended(true);
		await tick();
		if (!mounted || !dialog || dialog.open) return;
		dialog.showModal();
		dialog.querySelector<HTMLButtonElement>('button')?.focus();
	}

	function closeDossier() { dialog?.close(); }
	function onDialogClose() {
		dossierOpen = false;
		world?.setFocus(-1);
		world?.setSuspended(false);
		opener?.focus({ preventScroll: true });
		opener = null;
	}
	function selectDetail(detail: number) { selected = detail; world?.setFocus(detail); }
	function runAction() { actionStep++; world?.runAction(actionStep); }
	function toggleMotion() {
		motionPaused = !motionPaused;
		try { localStorage.setItem('facility-motion-paused', String(motionPaused)); } catch { /* Pilihan peranti ini sahaja. */ }
	}
	function toggleView() {
		wantsText = worldState !== 'text';
		try { localStorage.setItem('facility-view', wantsText ? 'text' : '3d'); } catch { /* Mod bacaan masih berfungsi tanpa storage. */ }
		void bootWorld();
	}

	function onKeyboard(event: KeyboardEvent) {
		if (dossierOpen || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
		const target = event.target;
		if (!(target instanceof HTMLElement) || !target.closest('.stations')) return;
		const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
		if (!delta && event.key !== 'Home' && event.key !== 'End') return;
		event.preventDefault();
		const id = event.key === 'Home' ? 0 : event.key === 'End' ? 5 : Math.max(0, Math.min(5, currentChamber + delta));
		selectChamber(id as ChamberId);
		document.querySelector<HTMLButtonElement>(`[data-chamber="${id}"]`)?.focus();
	}

	$effect(() => { const currentTheme = $theme; world?.setTheme(currentTheme); });
	$effect(() => { const motionState = paused; world?.setPaused(motionState); });

	onMount(() => {
		mounted = true;
		const motion = matchMedia('(prefers-reduced-motion: reduce)');
		const colors = matchMedia('(forced-colors: active)');
		reducedMotion = motion.matches;
		try {
			motionPaused = localStorage.getItem('facility-motion-paused') === 'true';
			wantsText = localStorage.getItem('facility-view') === 'text';
		} catch { /* Tetapan sesi menggunakan nilai lalai. */ }
		wantsText ||= colors.matches;
		const fromHash = () => {
			const match = /^#station-([0-5])$/.exec(location.hash);
			if (match) selectChamber(Number(match[1]) as ChamberId, false);
		};
		fromHash();
		const onMotion = (event: MediaQueryListEvent) => { reducedMotion = event.matches; };
		const onColors = (event: MediaQueryListEvent) => {
			if (event.matches) { wantsText = true; void bootWorld(); }
		};
		motion.addEventListener('change', onMotion);
		colors.addEventListener('change', onColors);
		window.addEventListener('hashchange', fromHash);
		void bootWorld();
		return () => {
			mounted = false;
			motion.removeEventListener('change', onMotion);
			colors.removeEventListener('change', onColors);
			window.removeEventListener('hashchange', fromHash);
			disposeWorld();
		};
	});
</script>

<svelte:window onkeydown={onKeyboard} />

<div class="facility" data-facility data-active-chamber={currentChamber} data-world-state={worldState} data-paused={String(paused)}>
	<a class="skip-link" href="#facility-main">{$lang === 'ms' ? 'Langkau ke kandungan portfolio' : 'Skip to portfolio content'}</a>
	<div class="world-host" data-testid="world-host" bind:this={host}></div>
	{#if worldState !== 'ready'}
		<div class="quiet-world" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="quiet-monolith"><span>MM</span><small>{chamber.code}</small></div><span class="quiet-coordinate">IT / FULL-STACK / AI</span></div>
	{/if}
	<div class="vignette" aria-hidden="true"></div>
	{#if worldState === 'unavailable'}<p class="world-notice" role="status">{$lang === 'ms' ? '3D tidak tersedia pada peranti ini. Semua catatan dan interaksi masih boleh diteroka.' : '3D is unavailable on this device. All notes and interactions remain accessible.'}</p>{/if}
	<FacilityHUD {currentChamber} {worldState} {paused} {reducedMotion} {travelling} {actionStep} {visited} onSelectChamber={selectChamber} onNext={next} onPrev={previous} onOpenDossier={(detail, trigger) => { void openDossier(detail, trigger); }} onToggleMotion={toggleMotion} onToggleView={toggleView} onAction={runAction} />
	<dialog bind:this={dialog} data-testid="dossier-dialog" aria-labelledby="dossier-title" onclose={onDialogClose} onclick={(event) => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDossier(); } }}>
		{#if dossierOpen}<FacilityDossier chamberId={currentChamber} {selected} onSelect={selectDetail} onClose={closeDossier} />{/if}
	</dialog>
	<noscript>
		<style>.facility .hud, .facility .world-host, .facility .quiet-world, .facility .vignette { display: none !important; }</style>
		<section class="no-js" aria-label="Portfolio Muhammed Munir">
			<h1>Muhammed Munir</h1><p>IT · Rangkaian · Full-stack · Computer vision</p>
			<p>JavaScript dimatikan. Kandungan portfolio tersedia di bawah tanpa dunia 3D.</p>
			{#each CHAMBERS as station}<section id={`station-${station.id}`}><h2>{station.name.ms}</h2><p>{station.summary.ms}</p>{#each station.details as detail}<h3>{detail.title.ms} — {detail.technology}</h3><p>{detail.body.ms}</p>{/each}</section>{/each}
			<a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> · <a href={CONTACT.github}>GitHub</a> · <a href={CONTACT.linkedin}>LinkedIn</a>
		</section>
	</noscript>
</div>

<style>
	.facility {
		--f-ink: #e9eee7;
		--f-muted: #afc2c2;
		--f-accent: #e9b987;
		--f-line: #3a5159;
		--f-panel: rgba(12, 32, 40, 0.93);
		--f-mobile-panel: rgba(12, 32, 40, 0.96);
		--f-bg: #0c2028;
		--f-hover: #233e47;
		--f-active: rgba(111, 159, 161, 0.12);
		--f-button: #dfb588;
		--f-button-hover: #eac9a6;
		--f-button-ink: #172e35;
		--f-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
		position: relative; isolation: isolate; min-height: 100svh; background: var(--f-bg); color: var(--f-ink);
	}
	:global([data-theme='light']) .facility {
		--f-ink: #1a3738;
		--f-muted: #4f6765;
		--f-accent: #8b4b2b;
		--f-line: #a7b8af;
		--f-panel: rgba(238, 241, 232, 0.94);
		--f-mobile-panel: rgba(238, 241, 232, 0.97);
		--f-bg: #e8ece4;
		--f-hover: #d4dfd6;
		--f-active: rgba(41, 86, 73, 0.08);
		--f-button: #254a44;
		--f-button-hover: #355f55;
		--f-button-ink: #f1f2e8;
	}
	.facility :global(:focus-visible) { outline-color: var(--f-accent); outline-offset: 3px; }
	.world-host { position: fixed; inset: 0; z-index: -3; }
	.quiet-world { position: fixed; inset: 0; z-index: -2; overflow: hidden; pointer-events: none; }
	.orbit { position: absolute; width: min(54vw, 620px); aspect-ratio: 1; border: 1px solid var(--f-line); border-radius: 50%; right: 5%; top: 15%; transform: rotateX(22deg) rotateY(-25deg); }
	.orbit-two { width: min(45vw, 520px); right: 8%; top: 19%; border-color: var(--f-accent); opacity: 0.45; }
	.quiet-monolith { position: absolute; right: 22%; top: 31%; width: min(17vw, 190px); height: min(25vw, 280px); border: 1px solid var(--f-line); border-radius: 8px; background: var(--f-hover); transform: rotate(-8deg) skewY(4deg); display: flex; align-items: center; justify-content: center; flex-direction: column; box-shadow: 20px 30px 0 var(--f-panel); }
	.quiet-monolith span { font: 500 clamp(20px, 5vw, 60px) var(--font-heading); color: var(--f-ink); }
	.quiet-monolith small { font: 9px var(--f-mono); color: var(--f-muted); margin-top: 16px; }
	.quiet-coordinate { position: absolute; right: 18%; top: 72%; font: 9px var(--f-mono); letter-spacing: 0.15em; color: var(--f-muted); }
	.vignette { position: fixed; inset: 0; z-index: -1; pointer-events: none; background: linear-gradient(90deg, var(--f-bg) 0%, color-mix(in srgb, var(--f-bg), transparent 3%) 20%, transparent 58%), linear-gradient(0deg, var(--f-bg), transparent 24%, transparent 92%, var(--f-bg)); }
	.world-notice { position: relative; z-index: 3; padding: 10px 24px; border-bottom: 1px solid var(--f-line); color: var(--f-muted); background: var(--f-bg); font-size: 11px; text-align: center; }
	dialog { width: min(880px, calc(100% - 32px)); max-height: calc(100dvh - 48px); padding: 0; border: 1px solid var(--f-line); border-radius: 12px; background: var(--f-bg); color: var(--f-ink); box-shadow: 0 24px 100px rgba(0, 0, 0, 0.4); overscroll-behavior: contain; }
	dialog::backdrop { background: rgba(3, 17, 23, 0.7); backdrop-filter: blur(10px); }
	.facility:has(dialog[open]) { overscroll-behavior: none; }
	.no-js { position: relative; z-index: 5; padding: 24px; background: var(--f-bg); color: var(--f-ink); }
	.no-js section { max-width: 760px; margin: 40px auto; }
	.no-js h1, .no-js h2, .no-js h3 { color: var(--f-ink); font-size: 24px; margin-block: 16px; }
	.no-js p { color: var(--f-muted); margin-block: 12px; }
	.no-js a { text-decoration: underline; min-height: 44px; display: inline-flex; align-items: center; }
	@media (max-width: 700px) {
		.world-host { bottom: auto; height: min(620px, 75svh); }
		.vignette { background: linear-gradient(0deg, var(--f-bg) 28%, transparent 68%, var(--f-bg)); }
		.orbit-one { width: 68vw; right: 12%; top: 130px; }
		.orbit-two { width: 55vw; right: 17%; top: 155px; }
		.quiet-monolith { right: 38%; width: 22vw; height: 31vw; top: 185px; }
		.quiet-coordinate { display: none; }
	}
	@media (forced-colors: active) { .world-host, .quiet-world, .vignette { display: none; } .facility { background: Canvas; color: CanvasText; } dialog { background: Canvas; border: 1px solid CanvasText; } }
</style>
