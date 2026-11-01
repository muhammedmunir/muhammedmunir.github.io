<script lang="ts">
	import { onMount, tick } from 'svelte';
	import {
		PROFILE,
		TECHNICAL_SKILLS,
		STATIONS,
		OCEAN_WEATHER_PRESETS,
		CAREER_TIMELINE,
		EDUCATION_HISTORY,
		CERTIFICATIONS,
		PROJECT_ARCHIVE,
		type Locale
	} from './spine-data';
	import type { FiberSpineWorld, ThemeMode, LayerMarker } from './FiberSpineWorld';
	import SpineLoadingScreen from './SpineLoadingScreen.svelte';
	import DiegeticLeaderOverlay from './DiegeticLeaderOverlay.svelte';
	import {
		getHotspotLocation,
		getChipAction,
		resolveExhibitView,
		type ExhibitAction,
		type ExhibitRoute,
		type ExhibitView
	} from './exhibit-navigation';
	import { playBlip, playConfirm, playScan, playWarp, sfxEnabled, toggleSfx } from '$lib/sound';
	import { fetchLiveWeather, fetchCyberPulse, type CyberPulseSnapshot } from './live-world-feed';
	import CyberBenchPanel, { type BenchTool } from './CyberBenchPanel.svelte';

	let locale = $state<Locale>('ms');
	let theme = $state<ThemeMode>('dark');
	let viewMode = $state<'3d' | 'editorial'>('3d');
	let webglReady = $state(true);
	let uiIdle = $state(false);
	let mounted = $state(false);
	let motionPaused = $state(false);
	let pageVisible = $state(true);
	let loadingProgress = $state(0);
	let loadingStage = $state('');
	let sceneReady = $state(false);
	let showLoadingScreen = $state(true);
	let showHintToast = $state(false);
	let hintToastTimer: ReturnType<typeof setTimeout> | null = null;

	let activeStationIndex = $state(0);
	let spineProgress = $state(0);
	let selectedHotspotId = $state<string | null>(null);
	let laserHits = $state(0);
	let laserReady = $state(false);
	let hoveredHotspotId = $state<string | null>(null);
	let hoveredIslandLabel = $state<string | null>(null);
	let oceanWeatherIndex = $state(0);
	let layerMarkers = $state<LayerMarker[]>([]);
	let exhibitView = $state<ExhibitView | null>(null);
	let exhibitCanBack = $state(false);
	let xrayActive = $state(false);
	let lensDragging = false;

	// Sesi 4: Suapan langsung (Chrono-Weather + Cyber Pulse) & Tactile Cyber-Bench.
	let weatherSource = $state<'live' | 'fallback'>('fallback');
	let weatherUpdatedAt = $state<number | null>(null);
	let cyberPulse = $state<CyberPulseSnapshot | null>(null);
	let activeBenchTool = $state<BenchTool | null>(null);

	let canvasContainer: HTMLDivElement | undefined = $state();
	let world: FiberSpineWorld | null = null;
	let worldLoading = false;
	let disposed = false;
	let idleTimer: ReturnType<typeof setTimeout> | null = null;

	const currentStation = $derived(STATIONS[activeStationIndex] ?? STATIONS[0]);
	const selectedLocation = $derived(
		selectedHotspotId ? getHotspotLocation(selectedHotspotId) : null
	);
	const selectedSiblingIndex = $derived.by(() => {
		if (!selectedLocation) return -1;
		const list = STATIONS[selectedLocation.stationIndex]?.hotspots ?? [];
		return list.findIndex((item) => item.id === selectedLocation.hotspot.id);
	});
	const selectedSiblingCount = $derived(
		selectedLocation ? (STATIONS[selectedLocation.stationIndex]?.hotspots.length ?? 0) : 0
	);
	const currentWeather = $derived(
		OCEAN_WEATHER_PRESETS[oceanWeatherIndex] ?? OCEAN_WEATHER_PRESETS[0]
	);

	function getWeatherConditionLabel(presetId: string, loc: Locale): string {
		const map: Record<string, { ms: string; en: string }> = {
			golden_horizon: { ms: 'Ufuk Tenang', en: 'Calm Horizon' },
			emerald_day: { ms: 'Lagun Zamrud', en: 'Emerald Lagoon' },
			biolum_night: { ms: 'Bioluminesensi', en: 'Bioluminescent' },
			monsoon_swell: { ms: 'Alunan Monsun', en: 'Monsoon Swell' }
		};
		return map[presetId]?.[loc] ?? (loc === 'ms' ? 'Atmosfera Laut' : 'Sea Atmosphere');
	}

	const hoveredPromptText = $derived.by<string | null>(() => {
		if (hoveredHotspotId) {
			for (const st of STATIONS) {
				const found = st.hotspots.find((h) => h.id === hoveredHotspotId);
				if (found) {
					return locale === 'ms'
						? `Klik untuk butiran · Seret untuk gerakkan: ${found.code} · ${found.title[locale]}`
						: `Click for details · Drag to move: ${found.code} · ${found.title[locale]}`;
				}
			}
		}
		if (hoveredIslandLabel) {
			return locale === 'ms'
				? `Terbang ke Pulau: ${hoveredIslandLabel}`
				: `Fly to Island: ${hoveredIslandLabel}`;
		}
		return null;
	});

	function resetIdleTimer() {
		uiIdle = false;
		if (idleTimer) clearTimeout(idleTimer);
		idleTimer = setTimeout(() => {
			if (viewMode === '3d' && !selectedHotspotId) {
				uiIdle = true;
			}
		}, 4200);
	}

	function syncStationSelection(index: number) {
		const clamped = ((index % STATIONS.length) + STATIONS.length) % STATIONS.length;
		activeStationIndex = clamped;
	}

	function jumpToStation(index: number) {
		const clamped = ((index % STATIONS.length) + STATIONS.length) % STATIONS.length;
		syncStationSelection(clamped);
		spineProgress = clamped / STATIONS.length;
		if (selectedHotspotId) {
			const currentList = STATIONS[clamped]?.hotspots ?? [];
			if (!currentList.some((h) => h.id === selectedHotspotId)) {
				closeExhibit();
			}
		}
		playWarp();
		world?.goToStation(clamped);
	}

	function cycleWeatherAtmosphere() {
		playScan();
		oceanWeatherIndex = (oceanWeatherIndex + 1) % OCEAN_WEATHER_PRESETS.length;
		const nextPreset = OCEAN_WEATHER_PRESETS[oceanWeatherIndex];
		if (nextPreset) {
			world?.setSimulationMode(activeStationIndex, nextPreset.id);
		}
	}

	/** Sesi 4: Terapkan preset cuaca langsung Puchong ke suasana lautan (override manual kekal). */
	function applyLiveWeatherPreset(presetId: string) {
		const idx = OCEAN_WEATHER_PRESETS.findIndex((p) => p.id === presetId);
		if (idx < 0) return;
		oceanWeatherIndex = idx;
		world?.setSimulationMode(activeStationIndex, presetId);
	}

	/** Sesi 4: segerak suapan dunia langsung secara senyap (tanpa mengganggu overlay UI). */
	async function startLiveFeeds() {
		let storage: Storage | null = null;
		try {
			storage = window.sessionStorage;
		} catch {
			storage = null;
		}

		void fetchLiveWeather().then((snapshot) => {
			if (disposed) return;
			weatherSource = snapshot.source;
			weatherUpdatedAt = snapshot.updatedAt;
			applyLiveWeatherPreset(snapshot.presetId);
		});

		void fetchCyberPulse({ storage }).then((pulse) => {
			if (disposed) return;
			cyberPulse = pulse;
			const level = Math.min(1, (pulse.github.length + pulse.cves.length) / 14);
			world?.setCyberPulseLevel(level);
		});
	}

	// Peta hotspot -> alat cyber-bench Sesi 4.
	function resolveBenchTool(hotspotId: string): BenchTool | null {
		if (hotspotId === 'ai-tindak') return 'tindak';
		if (hotspotId === 'net-tnb-fiber') return 'fiber';
		if (hotspotId === 'ent-sutera') return 'sutera';
		return null;
	}

	function onFiberBrightness(value: number) {
		world?.setCyberBenchSignal('net-tnb-fiber', value);
	}

	function onTindakParse(channel: 'url' | 'phone' | 'payment') {
		world?.setCyberBenchSignal(
			'ai-tindak',
			channel === 'url' ? 1 : channel === 'phone' ? 0.7 : 0.5
		);
	}

	function onSuteraGate(allowed: boolean) {
		world?.setCyberBenchGate(allowed);
		playScan();
	}

	function pulseCommitCount(): number {
		return cyberPulse?.github.length ?? 0;
	}

	function pulseCveCount(): number {
		return cyberPulse?.cves.length ?? 0;
	}

	function toggleTheme() {
		playBlip(880);
		const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
		theme = next;
		document.documentElement.setAttribute('data-theme', next);
		try {
			localStorage.setItem('spine-theme', next);
		} catch {
			// abaikan ralat storan peribadi
		}
		world?.setTheme(next);
	}

	function toggleLocale() {
		playBlip(660);
		const next: Locale = locale === 'ms' ? 'en' : 'ms';
		locale = next;
		try {
			localStorage.setItem('spine-locale', next);
		} catch {
			// abaikan ralat storan peribadi
		}
		world?.setLocale(next);
	}

	async function ensureWorld() {
		if (world || worldLoading || disposed || !mounted || !canvasContainer || !webglReady) return;
		worldLoading = true;
		loadingProgress = 12;
		loadingStage =
			locale === 'ms'
				? 'Memuatkan modul 3D The Living Fiber Spine...'
				: 'Loading 3D Living Fiber Spine module...';
		try {
			const { FiberSpineWorld } = await import('./FiberSpineWorld');
			if (disposed || !canvasContainer || viewMode !== '3d' || !pageVisible) return;
			world = new FiberSpineWorld(canvasContainer, {
				onStationChange: (idx, progress) => {
					spineProgress = progress;
					if (idx !== activeStationIndex) syncStationSelection(idx);
				},
				onHotspotHover: (id, islandLabel) => {
					hoveredHotspotId = id;
					hoveredIslandLabel = islandLabel ?? null;
				},
				onHotspotSelect: (id, stationIdx) => openExhibit(id, stationIdx),
				onMarkersUpdate: (markers) => {
					const focused = markers.find((m) => m.layers && m.id === selectedHotspotId);
					layerMarkers = focused?.layers ?? [];
				},
				onToyStatus: ({ hits, ready }) => {
					if (hits > laserHits) playScan();
					laserHits = hits;
					laserReady = ready;
				},
				onOpenEditorial: () => void setViewMode('editorial'),
				onProgress: (p, stageMsg) => {
					loadingProgress = p;
					if (stageMsg) loadingStage = stageMsg;
				},
				onReady: () => {
					loadingProgress = 100;
					sceneReady = true;
					// Arahan interaksi bergerak dari tekstur 3D (~10px, tidak terbaca)
					// ke toast HTML sekali sahaja selepas scene sedia.
					showHintToast = true;
					if (hintToastTimer) clearTimeout(hintToastTimer);
					hintToastTimer = setTimeout(() => {
						showHintToast = false;
					}, 6500);
				}
			});
			if (!world.init()) {
				world.dispose();
				world = null;
				webglReady = false;
				viewMode = 'editorial';
				showLoadingScreen = false;
				return;
			}
			world.setTheme(theme);
			world.setLocale(locale);
			world.setReducedMotion(motionPaused);
			world.setSimulationMode(activeStationIndex, currentWeather.id);
			world.goToStation(activeStationIndex);
			world.selectHotspot(selectedHotspotId);
			syncWorldActivity();
		} catch (error) {
			if (!disposed) {
				world?.dispose();
				world = null;
				webglReady = false;
				viewMode = 'editorial';
				showLoadingScreen = false;
				console.error('Dunia 3D tidak dapat dimuatkan.', error);
			}
		} finally {
			worldLoading = false;
		}
	}

	function syncWorldActivity() {
		const active = viewMode === '3d' && pageVisible;
		if (active && mounted && !world) void ensureWorld();
		world?.setActive(active);
		world?.setInputEnabled(active);
	}

	async function setViewMode(next: '3d' | 'editorial') {
		if (next === 'editorial' && selectedHotspotId) closeExhibit();
		viewMode = next;
		try {
			localStorage.setItem('spine-view-mode', next);
		} catch {
			// Abaikan ralat storan peribadi.
		}
		syncWorldActivity();
		await tick();
		if (disposed || viewMode !== next) return;
		const target = document.querySelector<HTMLElement>(
			next === 'editorial' ? '#editorial-title' : '.mode-switch'
		);
		target?.focus();
	}

	function toggleViewMode() {
		void setViewMode(viewMode === '3d' ? 'editorial' : '3d');
	}

	function toggleMotionPause() {
		motionPaused = !motionPaused;
		world?.setReducedMotion(motionPaused);
	}

	function toggleXRay() {
		xrayActive = !xrayActive;
		playScan();
		world?.setXRayActive(xrayActive);
	}

	function onLensPointerDown(e: PointerEvent) {
		if (!e.isPrimary) return;
		lensDragging = true;
		(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
	}

	function onLensPointerMove(e: PointerEvent) {
		if (!lensDragging || !world) return;
		world.setLensPointer(e.clientX, e.clientY);
	}

	function onLensPointerUp(e: PointerEvent) {
		lensDragging = false;
	}

	function openExhibit(id: string, stationIdx: number) {
		if (!id) {
			closeExhibit();
			return;
		}
		const location = getHotspotLocation(id);
		if (!location) return;
		playConfirm();
		hoveredHotspotId = null;
		hoveredIslandLabel = null;
		const targetStation = typeof stationIdx === 'number' ? stationIdx : location.stationIndex;
		if (targetStation !== activeStationIndex) syncStationSelection(targetStation);
		selectedHotspotId = id;
		exhibitView = resolveExhibitView({ kind: 'hotspot', id });
		exhibitCanBack = false;
		activeBenchTool = resolveBenchTool(id);
		world?.selectHotspot(id);
		syncWorldActivity();
	}

	function applyExhibitAction(action: ExhibitAction) {
		if (action.kind === 'link' && action.url) {
			playConfirm();
			window.open(action.url, '_blank', 'noopener,noreferrer');
			return;
		}
		if (action.kind === 'editorial') {
			closeExhibit();
			void setViewMode('editorial');
			return;
		}
		if (action.kind === 'navigate') {
			playConfirm();
			const view = resolveExhibitView(action.route);
			if (view) {
				// Teknologi boleh merujuk hotspot: selari kamera & prop apabila relevan.
				if (action.route.kind === 'hotspot') {
					selectedHotspotId = action.route.id;
					world?.selectHotspot(action.route.id);
				}
				exhibitView = view;
				exhibitCanBack = true;
			}
			return;
		}
		if (action.kind === 'back') {
			playBlip(520);
			if (selectedHotspotId) {
				exhibitView = resolveExhibitView({ kind: 'hotspot', id: selectedHotspotId });
				exhibitCanBack = false;
			}
			return;
		}
		if (action.kind === 'previous') {
			stepExhibit(-1);
			return;
		}
		if (action.kind === 'next') {
			stepExhibit(1);
			return;
		}
		if (action.kind === 'close') {
			closeExhibit();
		}
	}

	function handleExhibitChip(chip: string) {
		if (!exhibitView) return;
		const action = getChipAction(exhibitView, chip);
		if (action) {
			playBlip(720);
			applyExhibitAction(action);
		}
	}

	function stepExhibit(delta: number) {
		const station = selectedLocation ? STATIONS[selectedLocation.stationIndex] : currentStation;
		const list = station?.hotspots ?? [];
		if (list.length === 0) return;
		const currentIdx = selectedLocation
			? list.findIndex((item) => item.id === selectedLocation.hotspot.id)
			: 0;
		const nextIdx = (((currentIdx + delta) % list.length) + list.length) % list.length;
		const nextHotspot = list[nextIdx];
		if (!nextHotspot) return;
		playBlip(delta > 0 ? 640 : 540);
		if (world && sceneReady) {
			// Lantunan taktil mencetus onHotspotSelect -> openExhibit (dive + calout).
			world.bounceProp(nextHotspot.id);
		} else {
			openExhibit(nextHotspot.id, station.index);
		}
	}

	function closeExhibit() {
		playBlip(440);
		selectedHotspotId = null;
		exhibitView = null;
		exhibitCanBack = false;
		activeBenchTool = null;
		layerMarkers = [];
		hoveredHotspotId = null;
		hoveredIslandLabel = null;
		world?.selectHotspot(null);
		syncWorldActivity();
	}

	function handleWheel(e: WheelEvent) {
		if (viewMode !== '3d' || selectedHotspotId) return;
		if (
			e.target instanceof HTMLElement &&
			e.target.closest('header, footer, aside, button, select, a, input, label')
		)
			return;
		e.preventDefault();
		resetIdleTimer();
		const delta = e.deltaY * 0.00032;
		world?.moveProgress?.(delta);
	}

	function handleGlobalKeydown(e: KeyboardEvent) {
		resetIdleTimer();
		if (viewMode !== '3d') return;
		if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

		if (e.key === 'Escape') {
			if (selectedHotspotId) {
				e.preventDefault();
				closeExhibit();
			} else {
				world?.resetToys();
			}
			return;
		}

		const target = e.target as HTMLElement | null;
		if (target) {
			const tag = target.tagName;
			if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable)
				return;
			if (tag === 'BUTTON' || tag === 'A') {
				if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') return;
			}
		}

		if (selectedHotspotId) {
			if (e.key === 'ArrowRight') {
				e.preventDefault();
				stepExhibit(1);
				return;
			}
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				stepExhibit(-1);
				return;
			}
		}

		if (e.key === 'Enter' && !selectedHotspotId) {
			const first = currentStation.hotspots[0];
			if (first) {
				e.preventDefault();
				if (world && sceneReady) world.bounceProp(first.id);
				else openExhibit(first.id, activeStationIndex);
			}
			return;
		}

		if (e.key === 'x' || e.key === 'X') {
			e.preventDefault();
			toggleXRay();
			return;
		}

		if (e.key === 'ArrowRight') {
			e.preventDefault();
			jumpToStation(activeStationIndex + 1);
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			jumpToStation(activeStationIndex - 1);
		} else if (e.key >= '1' && e.key <= '6') {
			e.preventDefault();
			jumpToStation(Number(e.key) - 1);
		}
	}

	$effect(() => {
		syncWorldActivity();
	});

	onMount(() => {
		mounted = true;
		try {
			const savedTheme = localStorage.getItem('spine-theme');
			if (savedTheme === 'light' || savedTheme === 'dark') {
				theme = savedTheme;
			}
			const savedLocale = localStorage.getItem('spine-locale');
			if (savedLocale === 'ms' || savedLocale === 'en') {
				locale = savedLocale;
			}
			const savedViewMode = localStorage.getItem('spine-view-mode');
			if (savedViewMode === '3d' || savedViewMode === 'editorial') {
				viewMode = savedViewMode;
			}
		} catch {
			// abaikan ralat storan
		}
		document.documentElement.setAttribute('data-theme', theme);

		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		motionPaused = mediaQuery.matches;
		if (viewMode === 'editorial') {
			showLoadingScreen = false;
		}

		const handleMediaChange = (evt: MediaQueryListEvent) => {
			motionPaused = evt.matches;
			world?.setReducedMotion(motionPaused);
		};
		mediaQuery.addEventListener('change', handleMediaChange);

		pageVisible = !document.hidden;
		const handleVisibilityChange = () => {
			pageVisible = !document.hidden;
			syncWorldActivity();
		};
		document.addEventListener('visibilitychange', handleVisibilityChange);

		syncWorldActivity();
		resetIdleTimer();
		startLiveFeeds();

		return () => {
			disposed = true;
			if (idleTimer) clearTimeout(idleTimer);
			mediaQuery.removeEventListener('change', handleMediaChange);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			world?.setActive?.(false);
			world?.setInputEnabled?.(false);
			world?.dispose();
			world = null;
		};
	});
</script>

<svelte:window
	onkeydown={handleGlobalKeydown}
	onpointermove={resetIdleTimer}
	onpointerdown={resetIdleTimer}
/>

<div
	class="spine-root"
	data-theme={theme}
	data-mode={viewMode}
	onwheel={handleWheel}
	role="region"
	aria-label={locale === 'ms'
		? 'Portfolio 3D Kepulauan Orbital Muhammed Munir'
		: 'Muhammed Munir 3D Orbital Archipelago Portfolio'}
>
	<!-- Kanvas Dunia 3D Penuh (100% Viewport) -->
	<div
		class="webgl-stage"
		class:hidden={viewMode === 'editorial'}
		bind:this={canvasContainer}
		aria-hidden="true"
	></div>

	<!-- Lapisan Sentuhan Lensa X-Ray (Sesi 3): pemegang seret mudah alih -->
	{#if viewMode === '3d' && xrayActive}
		<div
			class="lens-touch-layer"
			class:static={motionPaused}
			role="presentation"
			onpointerdown={onLensPointerDown}
			onpointermove={onLensPointerMove}
			onpointerup={onLensPointerUp}
			onpointercancel={onLensPointerUp}
		>
			<div class="lens-touch-handle" aria-hidden="true">
				<span class="sr-only"
					>{locale === 'ms' ? 'Seret untuk gerakkan lensa' : 'Drag to move lens'}</span
				>
			</div>
		</div>
	{/if}

	<!-- Skrin Memuatkan Futuristik (Living Fiber Spine Loading Screen) -->
	{#if showLoadingScreen && viewMode === '3d'}
		<SpineLoadingScreen
			progress={loadingProgress}
			stageMessage={loadingStage}
			{locale}
			ready={sceneReady}
			onComplete={() => {
				showLoadingScreen = false;
			}}
		/>
	{/if}

	<!-- Pengepala Kaca Minimalis (HUD Terpelihara) -->
	<header class="minimal-topbar" class:ui-idle={uiIdle && viewMode === '3d' && !selectedHotspotId}>
		<div class="brand-cluster">
			<img
				src={PROFILE.profilePhoto}
				alt={PROFILE.fullName}
				class="brand-avatar"
				width="38"
				height="38"
			/>
			<div class="brand-meta">
				<span class="brand-kicker">360° ORBITAL ARCHIPELAGO · CV PORTFOLIO</span>
				<strong class="brand-name"
					><span class="brand-full">{PROFILE.fullName}</span><span class="brand-short"
						>{PROFILE.shortName}</span
					></strong
				>
			</div>
		</div>

		<div class="utility-actions">
			{#if viewMode === '3d'}
				<button
					type="button"
					class="util-pill"
					class:active={xrayActive}
					aria-pressed={xrayActive}
					onclick={toggleXRay}
					title={locale === 'ms' ? 'Lensa X-Ray (X)' : 'X-Ray Lens (X)'}
					aria-label={locale === 'ms'
						? `Lensa X-Ray: ${xrayActive ? 'Aktif' : 'Tidak Aktif'}`
						: `X-Ray Lens: ${xrayActive ? 'Active' : 'Inactive'}`}
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<circle cx="11" cy="11" r="7" />
						<path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
					</svg>
					<span class="pill-label">{locale === 'ms' ? 'Lensa X-Ray' : 'X-Ray Lens'}</span>
				</button>

				<button
					type="button"
					class="util-pill"
					onclick={cycleWeatherAtmosphere}
					title={locale === 'ms' ? 'Tukar atmosfera lautan' : 'Cycle ocean atmosphere'}
					aria-label={locale === 'ms'
						? `Atmosfera: ${getWeatherConditionLabel(currentWeather.id, locale)}`
						: `Atmosphere: ${getWeatherConditionLabel(currentWeather.id, locale)}`}
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="4" />
						<path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
					</svg>
					<span class="pill-label">
						{getWeatherConditionLabel(currentWeather.id, locale)}
						{#if weatherSource === 'live'}
							<span class="live-dot" aria-hidden="true"></span>
						{/if}
					</span>
					<span class="sr-only">
						{weatherSource === 'live'
							? locale === 'ms'
								? '— cuaca langsung Puchong'
								: '— live Puchong weather'
							: locale === 'ms'
								? '— pratetap manual'
								: '— manual preset'}
					</span>
				</button>

				<button
					type="button"
					class="util-pill"
					class:active={motionPaused}
					aria-pressed={motionPaused}
					onclick={toggleMotionPause}
					title={motionPaused
						? locale === 'ms'
							? 'Sambung semula gerakan 3D'
							: 'Resume 3D motion'
						: locale === 'ms'
							? 'Jeda gerakan 3D'
							: 'Pause 3D motion'}
					aria-label={motionPaused
						? locale === 'ms'
							? 'Sambung semula gerakan 3D'
							: 'Resume 3D motion'
						: locale === 'ms'
							? 'Jeda gerakan 3D'
							: 'Pause 3D motion'}
				>
					{#if motionPaused}
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<polygon points="7 4 19 12 7 20 7 4"></polygon>
						</svg>
						<span class="pill-label">{locale === 'ms' ? 'Jeda' : 'Paused'}</span>
					{:else}
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path d="M9 5v14M15 5v14"></path>
						</svg>
						<span class="pill-label">{locale === 'ms' ? 'Gerakan' : 'Motion'}</span>
					{/if}
					<span class="sr-only">
						{locale === 'ms'
							? '— jeda atau sambung simulasi 3D'
							: '— pause or resume 3D simulation'}
					</span>
				</button>
			{/if}

			{#if webglReady}
				<button type="button" class="util-pill mode-switch" onclick={toggleViewMode}>
					<span class="mode-label-full">
						{viewMode === '3d'
							? locale === 'ms'
								? 'Baca Mod Editorial CV'
								: 'Read Editorial CV Mode'
							: locale === 'ms'
								? 'Kembali ke Dunia 3D'
								: 'Return to 3D World'}
					</span>
					<span class="mode-label-short" aria-hidden="true">
						{viewMode === '3d' ? 'CV' : '3D'}
					</span>
				</button>
			{/if}

			<button type="button" class="util-pill" onclick={toggleLocale}>
				<span>{locale === 'ms' ? 'BM / EN' : 'EN / BM'}</span>
				<span class="sr-only">
					{locale === 'ms' ? '— tukar ke Bahasa Inggeris' : '— switch to Bahasa Melayu'}
				</span>
			</button>

			<button type="button" class="util-pill" onclick={toggleTheme}>
				<!-- Ikon keseimbangan separuh bulatan: satu-satunya simbol tema yang kekal
				     terbaca pada 14px dalam kedua-dua keadaan. -->
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<circle cx="12" cy="12" r="8" />
					<path d="M12 4a8 8 0 0 1 0 16" fill="currentColor" stroke="none" />
				</svg>
				<span class="pill-label"
					>{theme === 'dark'
						? locale === 'ms'
							? 'Gelap'
							: 'Dark'
						: locale === 'ms'
							? 'Cerah'
							: 'Light'}</span
				>
				<span class="sr-only">
					{theme === 'dark'
						? locale === 'ms'
							? '— tukar ke tema cerah'
							: '— switch to light theme'
						: locale === 'ms'
							? '— tukar ke tema gelap'
							: '— switch to dark theme'}
				</span>
			</button>
			<button
				type="button"
				class="util-pill"
				onclick={toggleSfx}
				title={$sfxEnabled
					? locale === 'ms'
						? 'Nyahaktifkan audio'
						: 'Disable audio'
					: locale === 'ms'
						? 'Aktifkan audio haptik 3D'
						: 'Enable 3D haptic audio'}
				aria-label={$sfxEnabled
					? locale === 'ms'
						? 'Audio: Aktif'
						: 'Audio: Active'
					: locale === 'ms'
						? 'Audio: Senyap'
						: 'Audio: Muted'}
			>
				{#if $sfxEnabled}
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
						<path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
					</svg>
					<span class="pill-label">{locale === 'ms' ? 'Audio' : 'Sound'}</span>
				{:else}
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
						<line x1="23" y1="9" x2="17" y2="15"></line>
						<line x1="17" y1="9" x2="23" y2="15"></line>
					</svg>
					<span class="pill-label">{locale === 'ms' ? 'Bisu' : 'Muted'}</span>
				{/if}
			</button>
		</div>
	</header>

	{#if viewMode === '3d'}
		<!-- Toast arahan interaksi: sekali selepas scene sedia, kemudian pudar. -->
		{#if showHintToast && sceneReady && !selectedHotspotId}
			<div class="interaction-hint" role="status">
				{locale === 'ms'
					? 'Klik objek 3D untuk butiran · Seret untuk gerakkan · Skrol untuk orbit'
					: 'Click a 3D object for details · Drag to move · Scroll to orbit'}
			</div>
		{/if}

		<!-- Petunjuk prop dan navigasi pulau apabila kursor menyentuh objek 3D -->
		{#if hoveredPromptText && !selectedHotspotId}
			<div class="hover-reticle-badge" role="status">
				<span class="reticle-pulse"></span>
				<span>{hoveredPromptText}</span>
			</div>
		{/if}

		<!-- Kalout Diegetik + Garisan Penunjuk 3D (Sesi 1): gantikan popup 2D rata -->
		<DiegeticLeaderOverlay
			view={exhibitView}
			{locale}
			markers={layerMarkers}
			siblingIndex={selectedSiblingIndex}
			siblingCount={selectedSiblingCount}
			stationIndex={selectedLocation?.stationIndex ?? -1}
			{laserHits}
			{laserReady}
			{sceneReady}
			canBack={exhibitCanBack}
			onclose={closeExhibit}
			onstep={(delta) => stepExhibit(delta)}
			onchip={(chip) => handleExhibitChip(chip)}
			onaction={(action) => applyExhibitAction(action)}
			onfire={() => world?.fireSecurityLaser()}
			onback={() => applyExhibitAction({ kind: 'back' })}
		/>

		<!-- Meja Uji Tactile Cyber-Bench (Sesi 4): 3 alat kejuruteraan diegetik -->
		<CyberBenchPanel
			tool={activeBenchTool}
			{locale}
			{onFiberBrightness}
			{onTindakParse}
			{onSuteraGate}
		/>

		<!-- Kompas Radar Kepulauan Orbital 360° Minimalis Beraksesibiliti -->
		<footer
			class="bottom-compass"
			class:ui-idle={uiIdle && !selectedHotspotId}
			class:hidden-on-inspect={selectedHotspotId}
			inert={Boolean(selectedHotspotId)}
		>
			<!-- Dok Pemilih Prop Pulau (butang DOM asli; keyboard Tab/Enter/Arrow) -->
			<ul
				class="prop-dock"
				role="list"
				aria-label={locale === 'ms' ? 'Objek pameran pulau ini' : 'Exhibits on this island'}
			>
				{#each currentStation.hotspots as hs, hsIdx (hs.id)}
					<li>
						<button
							type="button"
							class="prop-dock-btn"
							class:active={hs.id === selectedHotspotId}
							onclick={() => openExhibit(hs.id, activeStationIndex)}
							aria-current={hs.id === selectedHotspotId ? 'step' : undefined}
							aria-label="{hs.code}: {hs.title[locale]}"
							title="{hs.code} · {hs.title[locale]}"
						>
							<!-- Kod penuh sudah diulang di kalout & tajuk kompas; dok hanya
						     perlu indeks ringkas untuk mengorientasi. -->
							<span class="prop-dock-pip" aria-hidden="true"></span>
							<span class="prop-dock-label" aria-hidden="true">{hsIdx + 1}</span>
						</button>
					</li>
				{/each}
			</ul>

			<button
				type="button"
				class="compass-arrow"
				onclick={() => jumpToStation(activeStationIndex - 1)}
				aria-label={locale === 'ms' ? 'Pulau sebelumnya' : 'Previous island'}
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
			</button>

			<!-- Desktop radar supplements the native station selector. -->
			<div
				class="orbital-radar-cluster"
				role="group"
				aria-label={locale === 'ms'
					? 'Peta Radar Kepulauan 360 Darjah'
					: '360-Degree Archipelago Radar Map'}
			>
				<svg
					viewBox="0 0 84 84"
					width="84"
					height="84"
					class="radar-orbit-backdrop"
					aria-hidden="true"
				>
					<circle cx="42" cy="42" r="30" class="radar-orbit-track" />
					<circle cx="42" cy="42" r="4" class="radar-core-node" />
					{#each STATIONS as _, idx (idx)}
						{@const angle = (idx / STATIONS.length) * Math.PI * 2 - Math.PI / 2}
						{@const nx = 42 + Math.cos(angle) * 30}
						{@const ny = 42 + Math.sin(angle) * 30}
						<line
							x1="42"
							y1="42"
							x2={nx}
							y2={ny}
							class="radar-tether-line"
							class:active={idx === activeStationIndex}
						/>
					{/each}
				</svg>

				{#each STATIONS as st, idx (st.id)}
					{@const angle = (idx / STATIONS.length) * Math.PI * 2 - Math.PI / 2}
					{@const nx = ((42 + Math.cos(angle) * 30) / 84) * 100}
					{@const ny = ((42 + Math.sin(angle) * 30) / 84) * 100}
					<button
						type="button"
						class="radar-station-node"
						class:active={idx === activeStationIndex}
						style="left: {nx}%; top: {ny}%;"
						onclick={() => jumpToStation(idx)}
						aria-label="{st.code} · {st.title[locale]}"
						aria-current={idx === activeStationIndex ? 'step' : undefined}
						title="{st.code}: {st.title[locale]}"
					>
						<span class="radar-node-pip" aria-hidden="true"></span>
					</button>
				{/each}
			</div>

			<div class="compass-info">
				<span class="compass-code">{currentStation.code}</span>
				<!-- Nama pemilik sudah muncul di topbar & papan tanda 3D; stesen 01 memaparkan
				     peranan, bukan nama yang diulang kali ketiga. -->
				<strong class="compass-title">
					{activeStationIndex === 0
						? currentStation.subtitle[locale]
						: currentStation.title[locale]}
				</strong>
				<span class="compass-hint">
					{locale === 'ms'
						? 'Skrol / W·S untuk Orbit 360° · Klik atau Seret Objek 3D'
						: 'Scroll / W·S for 360° Orbit · Click or Drag Any 3D Object'}
				</span>
				{#if cyberPulse}
					<span class="compass-live" role="status">
						<span class="live-dot" aria-hidden="true"></span>
						{locale === 'ms'
							? `Nadi siber: ${pulseCommitCount()} komit · ${pulseCveCount()} CVE`
							: `Cyber pulse: ${pulseCommitCount()} commits · ${pulseCveCount()} CVEs`}
						<span class="pulse-src">
							{cyberPulse.source === 'live'
								? locale === 'ms'
									? 'langsung'
									: 'live'
								: locale === 'ms'
									? 'snapshot'
									: 'snapshot'}
						</span>
					</span>
				{/if}
			</div>

			<button
				type="button"
				class="compass-arrow"
				onclick={() => jumpToStation(activeStationIndex + 1)}
				aria-label={locale === 'ms' ? 'Pulau seterusnya' : 'Next island'}
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>
			</button>
		</footer>
	{/if}

	<!-- MOD EDITORIAL CV LENGKAP (Sentiasa wujud dalam SSR untuk SEO/Aksesibiliti; inert semasa Mod 3D aktif untuk mencegah focus ghost) -->
	<main
		class="editorial-container"
		class:sr-only-3d={viewMode === '3d'}
		inert={Boolean(selectedHotspotId) || (mounted && viewMode === '3d') ? true : undefined}
		aria-hidden={mounted && viewMode === '3d' ? 'true' : undefined}
	>
		<section class="editorial-hero">
			<div class="hero-profile-row">
				<img
					src={PROFILE.profilePhoto}
					alt={PROFILE.fullName}
					class="editorial-avatar"
					width="88"
					height="88"
				/>
				<div>
					<p class="editorial-kicker">
						{PROFILE.location} · {PROFILE.phone} · {PROFILE.email}
					</p>
					<h1 id="editorial-title" tabindex="-1">{PROFILE.fullName}</h1>
					<p class="editorial-headline">{PROFILE.headline[locale]}</p>
				</div>
			</div>

			<p class="editorial-summary">{PROFILE.summary[locale]}</p>

			<div class="hero-cta-row">
				<a href={PROFILE.resumeUrl} target="_blank" rel="noopener noreferrer" class="primary-cta">
					{locale === 'ms' ? 'Muat Turun Resume PDF' : 'Download Resume PDF'}
				</a>
				<a href={PROFILE.githubUrl} target="_blank" rel="noopener noreferrer" class="secondary-cta">
					GitHub (@muhammedmunir) ↗
				</a>
				<a
					href={PROFILE.linkedinUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="secondary-cta"
				>
					LinkedIn ↗
				</a>
				<a
					href={PROFILE.whatsappUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="secondary-cta"
				>
					WhatsApp ({PROFILE.phone}) ↗
				</a>
				<a href={`mailto:${PROFILE.email}`} class="secondary-cta">
					{PROFILE.email}
				</a>
			</div>
		</section>

		<!-- 5 Kategori Kemahiran Teknikal -->
		<section class="editorial-section">
			<h2>
				{locale === 'ms'
					? 'Kemahiran Teknikal (5 Kategori Rasmi CV)'
					: 'Technical Skills (5 Official CV Categories)'}
			</h2>
			<div class="editorial-grid skills-grid">
				{#each TECHNICAL_SKILLS as group (group.id)}
					<article class="editorial-card">
						<h3>{group.category[locale]}</h3>
						<div class="chip-row">
							{#each group.skills as skill}
								<span class="chip">{skill}</span>
							{/each}
						</div>
					</article>
				{/each}
			</div>
		</section>

		<!-- 5 Pengalaman Kerja Rasmi -->
		<section class="editorial-section">
			<h2>
				{locale === 'ms'
					? 'Pengalaman Kerja Rasmi (2019 – Kini)'
					: 'Official Work Experience (2019 – Present)'}
			</h2>
			<div class="editorial-stack">
				{#each CAREER_TIMELINE as job (job.id)}
					<article class="editorial-card">
						<span class="meta-badge">{job.period} · {job.location}</span>
						<h3>{job.role[locale]} — {job.company}</h3>
						<ul>
							{#each job.highlights[locale] as pt}
								<li>{pt}</li>
							{/each}
						</ul>
						<div class="chip-row">
							{#each job.stack as t}
								<span class="chip">{t}</span>
							{/each}
						</div>
					</article>
				{/each}
			</div>
		</section>

		<!-- 11 Sistem & Projek Kejuruteraan -->
		<section class="editorial-section">
			<h2>
				{locale === 'ms'
					? 'Arkib Sistem & Projek Kejuruteraan (11 Rekod)'
					: 'Systems & Engineering Project Archive (11 Records)'}
			</h2>
			<div class="editorial-grid">
				{#each PROJECT_ARCHIVE as proj (proj.id)}
					<article class="editorial-card">
						<span class="meta-badge">{proj.badge[locale]}</span>
						<h3>{proj.name}</h3>
						<p>{proj.summary[locale]}</p>
						<p class="arch-note">
							<strong>{locale === 'ms' ? 'Seni Bina:' : 'Architecture:'}</strong>
							{proj.architecture[locale]}
						</p>
						<div class="chip-row">
							{#each proj.stack as s}
								<span class="chip">{s}</span>
							{/each}
						</div>
						<div class="project-links">
							{#if proj.repoUrl}
								<a
									href={proj.repoUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-link"
								>
									{locale === 'ms' ? 'Repositori GitHub ↗' : 'GitHub Repository ↗'}
								</a>
							{/if}
							{#if proj.caseStudyUrl}
								<a
									href={proj.caseStudyUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-link"
								>
									{locale === 'ms' ? 'Kajian Kes PDF ↗' : 'PDF Case Study ↗'}
								</a>
							{/if}
							{#if proj.liveUrl}
								<a
									href={proj.liveUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-link"
								>
									{locale === 'ms'
										? 'Repositori / Pautan Tambahan ↗'
										: 'Additional Repository / Link ↗'}
								</a>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		</section>

		<!-- Pendidikan UTM & 7 Pensijilan -->
		<section class="editorial-section">
			<h2>
				{locale === 'ms'
					? 'Pendidikan Universiti Teknologi Malaysia (UTM) & Pensijilan'
					: 'Universiti Teknologi Malaysia (UTM) Education & Certifications'}
			</h2>
			<div class="editorial-grid">
				{#each EDUCATION_HISTORY as edu (edu.id)}
					<article class="editorial-card">
						<span class="meta-badge">{edu.period} · {edu.location}</span>
						<h3>{edu.qualification[locale]}</h3>
						<p><strong>{edu.institution}</strong> · CGPA: {edu.cgpa}</p>
						<p>
							<strong>FYP:</strong>
							{edu.fypTitle[locale]} — {edu.fypSummary[locale]}
						</p>
						{#if edu.fypRepo}
							<a href={edu.fypRepo} target="_blank" rel="noopener noreferrer" class="inline-link">
								{locale === 'ms' ? 'Repositori FYP GitHub ↗' : 'FYP GitHub Repository ↗'}
							</a>
						{/if}
						<div class="chip-row">
							{#each edu.coursework as c}
								<span class="chip">{c}</span>
							{/each}
						</div>
					</article>
				{/each}
			</div>

			<div class="cert-editorial-grid">
				{#each CERTIFICATIONS as cert (cert.title)}
					<div class="editorial-card cert-mini">
						<span class="meta-badge">
							{cert.category.toUpperCase()}
							{#if cert.period}
								· {cert.period}{/if}
						</span>
						<h4>{cert.title}</h4>
						<p>{cert.issuer}</p>
					</div>
				{/each}
			</div>
		</section>

		<footer class="editorial-credit">
			<p>
				{locale === 'ms'
					? 'Aset 3D terpilih (Astrolab, Dron, Nautilus) — Dioramas (github.com/blendi-remade/dioramas), lesen CC BY 4.0.'
					: 'Selected 3D assets (Astrolabe, Drone, Nautilus) — Dioramas (github.com/blendi-remade/dioramas), CC BY 4.0 license.'}
			</p>
			<a
				href="https://github.com/blendi-remade/dioramas"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-link"
			>
				{locale === 'ms' ? 'Sumber Dioramas ↗' : 'Dioramas Source ↗'}
			</a>
		</footer>
	</main>
</div>

<style>
	.spine-root {
		--spine-bg: var(--bg);
		--spine-surface: var(--spatial-hud-bg);
		--spine-surface-strong: var(--spatial-card-bg);
		--spine-card: var(--spatial-card-bg);
		--spine-border: var(--spatial-card-border);
		--spine-text: var(--spatial-hud-ink);
		--spine-text-soft: var(--spatial-hud-muted);
		--spine-muted: var(--ink-muted);
		--spine-accent: var(--spatial-accent);
		--spine-teal: var(--spatial-accent);

		position: relative;
		width: 100%;
		min-height: 100vh;
		background: var(--spine-bg);
		color: var(--spine-text);
		font-family: var(--font-body, 'Plus Jakarta Sans', system-ui, sans-serif);
		overflow-x: hidden;
	}

	.spine-root[data-mode='3d'] {
		height: 100vh;
		overflow: hidden;
	}

	.spine-root[data-mode='editorial'] {
		background-color: var(--spine-bg);
		background-image:
			radial-gradient(ellipse 80% 50% at 50% -10%, rgba(229, 144, 87, 0.12), transparent 70%),
			radial-gradient(ellipse 60% 40% at 100% 40%, rgba(75, 220, 255, 0.08), transparent 60%),
			radial-gradient(ellipse 60% 40% at 0% 70%, rgba(229, 144, 87, 0.07), transparent 60%);
		background-attachment: fixed;
	}

	:root[data-theme='light'] .spine-root[data-mode='editorial'] {
		background-color: var(--spine-bg);
		background-image:
			radial-gradient(ellipse 80% 50% at 50% -10%, rgba(150, 76, 39, 0.09), transparent 70%),
			radial-gradient(ellipse 60% 40% at 100% 40%, rgba(0, 125, 156, 0.06), transparent 60%),
			radial-gradient(ellipse 60% 40% at 0% 70%, rgba(150, 76, 39, 0.06), transparent 60%);
		background-attachment: fixed;
	}

	.webgl-stage {
		position: fixed;
		inset: 0;
		z-index: 1;
		touch-action: none;
	}

	.webgl-stage.hidden {
		display: none;
	}

	/* Kaca telus fros penuh; ruang butang dan ikon telus kaca tanpa kotak hitam legap. */
	.minimal-topbar,
	.bottom-compass {
		--spatial-hud-bg: var(--glass);
		--spatial-hud-border: var(--glass-border);
		--spatial-pill-bg: rgba(255, 255, 255, 0.08);
		--spatial-pill-border: rgba(255, 255, 255, 0.16);
		--spatial-pill-hover-bg: rgba(255, 255, 255, 0.16);
		--spatial-pill-hover-border: rgba(255, 255, 255, 0.3);
		font-variant-numeric: tabular-nums;
	}

	:root[data-theme='light'] .minimal-topbar,
	:root[data-theme='light'] .bottom-compass {
		--spatial-pill-bg: rgba(255, 255, 255, 0.45);
		--spatial-pill-border: rgba(20, 24, 32, 0.14);
		--spatial-pill-hover-bg: rgba(255, 255, 255, 0.75);
		--spatial-pill-hover-border: rgba(20, 24, 32, 0.26);
	}

	.brand-cluster,
	.compass-info {
		padding: 0.15rem 0.35rem;
		border-radius: var(--radius-md);
		background: transparent;
	}

	/* Pengepala Kaca Minimalis (Glassmorphism Tier 1) */
	.minimal-topbar {
		position: fixed;
		top: 0.85rem;
		left: 1rem;
		right: 1rem;
		z-index: 30;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.55rem 0.95rem;
		border-radius: var(--radius-xl);
		background-color: var(--spatial-hud-bg, var(--surface));
		background-image: var(--glass-sheen);
		color: var(--spatial-hud-ink, var(--ink));
		border: 1px solid var(--spatial-hud-border, var(--surface-border));
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--shadow-glass, 0 12px 32px rgba(0, 0, 0, 0.25));
		transition:
			opacity var(--duration-normal, 300ms) ease,
			transform var(--duration-normal, 300ms) ease,
			border-color var(--duration-fast, 150ms) ease;
	}

	.minimal-topbar:hover,
	.minimal-topbar:focus-within {
		border-color: var(--glass-border-hover, var(--spatial-hud-border));
	}

	.minimal-topbar.ui-idle {
		opacity: 1;
		transform: translateY(calc(-1 * var(--space-idle-y, 2px)));
	}

	.minimal-topbar:hover,
	.minimal-topbar:focus-within {
		opacity: 1;
		transform: translateY(0);
	}

	.brand-cluster {
		display: flex;
		align-items: center;
		gap: 0.68rem;
		min-width: 0;
	}

	.brand-cluster img {
		flex-shrink: 0;
	}

	.brand-avatar {
		width: var(--size-avatar-sm, 36px);
		height: var(--size-avatar-sm, 36px);
		border-radius: var(--radius-pill, 9999px);
		object-fit: cover;
		border: 2px solid var(--spatial-accent, var(--accent)); /* ds-allow-hardcode */
	}

	.brand-meta {
		display: flex;
		flex-direction: column;
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.brand-kicker {
		font-family: var(--font-mono, monospace);
		font-size: 0.62rem;
		letter-spacing: 0.12em;
		color: var(--spatial-accent, var(--accent));
	}

	.brand-name {
		font-size: 0.86rem;
		font-weight: 700;
		color: var(--spatial-hud-ink, var(--ink));
	}

	.brand-full {
		display: inline;
	}

	.brand-short {
		display: none;
	}

	.mode-label-full {
		display: inline;
	}

	.mode-label-short {
		display: none;
	}

	.pill-label {
		display: inline;
	}

	.utility-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.42rem;
	}

	.util-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.38rem;
		min-height: var(--size-touch, 44px);
		min-width: var(--size-touch, 44px);
		padding: 0.4rem 0.85rem;
		border-radius: var(--radius-pill, 9999px);
		border: 1px solid var(--spatial-pill-border, var(--surface-border));
		background-color: var(--spatial-pill-bg, var(--surface-hover));
		color: var(--spatial-hud-ink, var(--ink));
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color var(--duration-fast, 150ms) ease,
			border-color var(--duration-fast, 150ms) ease,
			color var(--duration-fast, 150ms) ease;
	}

	.util-pill:hover {
		border-color: var(--spatial-pill-hover-border, var(--accent));
		background-color: var(--spatial-pill-hover-bg, var(--surface-hover));
	}

	.util-pill:active,
	.compass-arrow:active,
	.primary-cta:active,
	.secondary-cta:active {
		transform: translateY(var(--space-pressed-y)) scale(0.97);
		/* Fizik tekan spring kaca cair (Sesi 3.4): lantunan overshoot bila dilepas. */
		transition:
			transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1),
			background-color var(--duration-fast, 150ms) ease,
			border-color var(--duration-fast, 150ms) ease;
	}

	.util-pill.active {
		border-color: var(--spatial-accent, var(--accent));
		background: rgba(229, 144, 87, 0.18);
		color: var(--spatial-chip-ink, var(--badge-ink));
	}

	:root[data-theme='light'] .util-pill.active {
		background: rgba(150, 76, 39, 0.15);
	}

	.util-pill.mode-switch {
		background: var(--spatial-accent, var(--accent));
		color: var(--on-accent);
		border-color: transparent;
		font-weight: 700;
	}

	/* Tema cerah: aksen tembaga pekat mengalahkan scene 3D; guna garis luar sahaja
	   supaya mata kekal pada diorama. */
	:root[data-theme='light'] .util-pill.mode-switch {
		background: transparent;
		color: var(--spatial-accent, var(--accent));
		border-color: var(--spatial-accent, var(--accent));
	}

	.util-pill.mode-switch:hover {
		filter: brightness(1.08);
	}

	/* Lencana Halus Apabila Kursor Menyentuh Papan Pameran 3D atau Pulau */
	/* Toast arahan interaksi (Sesi 5): teks 13px dalam HTML, bukan tekstur 3D. */
	.interaction-hint {
		position: fixed;
		top: calc(env(safe-area-inset-top, 0px) + 5.4rem);
		left: 50%;
		transform: translateX(-50%);
		z-index: 26;
		max-width: min(34rem, calc(100% - 2rem));
		padding: 0.5rem 1.05rem;
		border-radius: var(--radius-pill, 9999px);
		background: var(--spatial-hud-bg, var(--surface));
		border: 1px solid var(--spatial-hud-border, var(--surface-border));
		color: var(--spatial-hud-ink, var(--ink));
		font-size: 0.82rem;
		line-height: 1.35;
		text-align: center;
		pointer-events: none;
		box-shadow: var(--shadow-md, 0 10px 28px rgba(0, 0, 0, 0.35));
		animation: hint-fade 6.5s ease forwards;
	}

	@keyframes hint-fade {
		0%,
		80% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.interaction-hint {
			animation: none;
			opacity: 1;
		}
	}

	.hover-reticle-badge {
		position: fixed;
		bottom: 6.2rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 26;
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.45rem 1rem;
		border-radius: var(--radius-pill, 9999px);
		background: var(--spatial-hud-bg, var(--surface));
		border: 1px solid var(--spatial-hud-border, var(--surface-border));
		color: var(--spatial-hud-ink, var(--ink));
		font-size: 0.78rem;
		font-weight: 600;
		pointer-events: none;
		box-shadow: var(--shadow-md, 0 10px 28px rgba(0, 0, 0, 0.35));
	}

	.reticle-pulse {
		width: var(--size-dot-sm, 8px);
		height: var(--size-dot-sm, 8px);
		border-radius: var(--radius-pill, 9999px);
		background: var(--spatial-accent, var(--accent));
		box-shadow: 0 0 8px var(--spatial-accent, var(--accent)); /* ds-allow-hardcode */
	}

	/* Lapisan Sentuhan Lensa X-Ray (Sesi 3.3) */
	.lens-touch-layer {
		position: fixed;
		inset: 0;
		z-index: 28;
		touch-action: none;
		cursor: grab;
	}
	.lens-touch-layer.static {
		pointer-events: none;
	}
	.lens-touch-handle {
		position: absolute;
		left: 50%;
		top: 50%;
		width: clamp(150px, 34vh, 260px);
		height: clamp(150px, 34vh, 260px);
		transform: translate(-50%, -50%);
		border-radius: 50%;
		border: 2px solid var(--lens-ring);
		background: radial-gradient(
			circle,
			color-mix(in srgb, var(--lens-glow) 67%, transparent),
			var(--lens-glow-soft) 62%,
			transparent 72%
		);
		box-shadow:
			inset 0 0 30px var(--lens-glow),
			0 0 40px color-mix(in srgb, var(--lens-glow) 150%, transparent);
		pointer-events: none;
	}
	.lens-touch-handle::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: conic-gradient(from 0deg, transparent, var(--lens-ring), transparent 40%);
		animation: lens-spin 5s linear infinite;
	}
	@keyframes lens-spin {
		to {
			transform: rotate(360deg);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.lens-touch-handle::after {
			animation: none;
		}
	}

	/* Kompas Radar Kepulauan Orbital 360° */
	.bottom-compass {
		position: fixed;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 25;
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 0.48rem 0.95rem;
		border-radius: var(--radius-xl);
		background-color: var(--spatial-hud-bg, var(--surface));
		background-image: var(--glass-sheen);
		color: var(--spatial-hud-ink, var(--ink));
		border: 1px solid var(--spatial-hud-border, var(--surface-border));
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--shadow-glass, 0 14px 36px rgba(0, 0, 0, 0.35));
		transition:
			opacity var(--duration-normal, 300ms) ease,
			transform var(--duration-normal, 300ms) ease,
			border-color var(--duration-fast, 150ms) ease;
	}

	.bottom-compass:hover,
	.bottom-compass:focus-within {
		border-color: var(--glass-border-hover, var(--spatial-hud-border));
	}

	.bottom-compass.ui-idle {
		opacity: 1;
		transform: translateX(-50%) translateY(var(--space-idle-y, 2px));
	}

	.bottom-compass:hover,
	.bottom-compass:focus-within {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}

	.bottom-compass.hidden-on-inspect {
		opacity: 0;
		pointer-events: none;
		transform: translateX(-50%) translateY(var(--space-inspect-y));
	}

	.compass-arrow {
		width: var(--size-touch);
		height: var(--size-touch);
		flex-shrink: 0;
		border-radius: var(--radius-pill, 9999px);
		border: 1px solid var(--spatial-pill-border, var(--surface-border));
		background: var(--spatial-pill-bg, var(--surface-hover));
		color: var(--spatial-hud-ink, var(--ink));
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition:
			border-color var(--duration-fast, 150ms) ease,
			background var(--duration-fast, 150ms) ease;
	}

	.compass-arrow:hover {
		border-color: var(--spatial-accent, var(--accent));
		background: var(--spatial-pill-hover-bg, var(--surface-hover));
	}

	/* Radar Cluster & Native Button Nodes */
	.orbital-radar-cluster {
		position: relative;
		width: var(--size-radar, 84px);
		height: var(--size-radar, 84px);
		border-radius: var(--radius-pill, 9999px);
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--spatial-radar-border, var(--surface-border));
		flex-shrink: 0;
	}

	:root[data-theme='light'] .orbital-radar-cluster {
		background: rgba(20, 24, 32, 0.04);
	}

	.radar-orbit-backdrop {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.radar-orbit-track {
		fill: none;
		stroke: var(--spatial-radar-border, var(--surface-border));
		stroke-width: 1.5;
		stroke-dasharray: 3 2;
	}

	.radar-core-node {
		fill: var(--spatial-accent, var(--accent));
	}

	.radar-tether-line {
		stroke: var(--spatial-radar-border, var(--surface-border));
		stroke-width: 1;
		opacity: 0.6;
	}

	.radar-tether-line.active {
		stroke: var(--spatial-accent, var(--accent));
		stroke-width: 2;
		opacity: 1;
	}

	.radar-station-node {
		position: absolute;
		transform: translate(-50%, -50%);
		width: var(--size-radar-node, 26px);
		height: var(--size-radar-node, 26px);
		border-radius: var(--radius-pill, 9999px);
		background: transparent;
		border: 0;
		padding: 0;
		margin: 0;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: transform var(--duration-fast, 150ms) ease;
	}

	/* Sasaran ketukan WCAG 2.2 (>=24px) tanpa membesarkan pip visual. */
	.radar-station-node::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 50%;
		width: max(24px, var(--size-radar-node, 26px));
		height: max(24px, var(--size-radar-node, 26px));
		transform: translate(-50%, -50%);
		border-radius: inherit;
	}

	.radar-station-node:hover {
		transform: translate(-50%, -50%) scale(1.15);
	}

	.radar-station-node:focus-visible {
		outline: 2px solid var(--spatial-focus, var(--focus)); /* ds-allow-hardcode */
		outline-offset: 2px; /* ds-allow-hardcode */
	}

	.radar-node-pip {
		width: var(--size-dot-sm, 8px);
		height: var(--size-dot-sm, 8px);
		border-radius: var(--radius-pill, 9999px);
		background: var(--spatial-radar-node, #676d78);
		transition:
			background var(--duration-fast, 150ms) ease,
			transform var(--duration-fast, 150ms) ease;
	}

	.radar-station-node.active .radar-node-pip {
		width: var(--size-dot-md, 12px);
		height: var(--size-dot-md, 12px);
		background: var(--spatial-radar-node-active, var(--accent));
		box-shadow: 0 0 8px var(--spatial-radar-node-active, var(--accent)); /* ds-allow-hardcode */
		border: 2px solid var(--spatial-hud-bg, #ffffff); /* ds-allow-hardcode */
	}

	.compass-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		min-width: var(--size-compass-min, 230px);
	}

	/* Dok Pemilih Prop Pulau (Sesi 1.5): butang DOM asli boleh Tab */
	.prop-dock {
		display: flex;
		align-items: center;
		gap: 0.42rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.prop-dock-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.36rem;
		min-height: var(--size-touch, 44px);
		min-width: var(--size-touch, 44px);
		padding: 0.25rem 0.65rem;
		border-radius: var(--radius-pill, 9999px);
		border: 1px solid var(--spatial-pill-border, var(--surface-border));
		background: var(--spatial-pill-bg, var(--surface-hover));
		color: var(--spatial-hud-ink, var(--ink));
		cursor: pointer;
		font-family: var(--font-mono, monospace);
		font-size: 0.7rem;
		transition:
			border-color var(--duration-fast, 150ms) ease,
			background var(--duration-fast, 150ms) ease;
	}

	.prop-dock-btn:hover {
		border-color: var(--spatial-accent, var(--accent));
		background: var(--spatial-pill-hover-bg, var(--surface-hover));
	}

	.prop-dock-btn.active {
		border-color: var(--spatial-accent, var(--accent));
		background: rgba(229, 144, 87, 0.18);
	}

	.prop-dock-pip {
		width: 8px;
		height: 8px;
		border-radius: var(--radius-pill, 9999px);
		background: var(--spatial-radar-node, #676d78);
	}

	.prop-dock-btn.active .prop-dock-pip {
		background: var(--spatial-radar-node-active, var(--accent));
		box-shadow: 0 0 6px var(--spatial-radar-node-active, var(--accent));
	}

	.compass-code {
		font-family: var(--font-mono, monospace);
		font-size: 0.62rem;
		letter-spacing: 0.1em;
		color: var(--spatial-accent, var(--accent));
	}

	.compass-title {
		font-size: 0.82rem;
		font-weight: 700;
		color: var(--spatial-hud-ink, var(--ink));
	}

	.compass-hint {
		font-size: 0.65rem;
		color: var(--spatial-hud-muted, var(--ink-secondary));
	}

	.compass-live {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-family: var(--font-mono, monospace);
		font-size: 0.62rem;
		letter-spacing: 0.02em;
		color: var(--spatial-accent, var(--accent));
	}

	.pulse-src {
		font-size: 0.58rem;
		opacity: 0.75;
	}

	.live-dot {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 9999px;
		margin-left: 0.2rem;
		background: #22c55e;
		box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.18);
		flex-shrink: 0;
	}

	/* MOD EDITORIAL CV */
	.spine-root[data-mode='editorial'] .minimal-topbar {
		position: sticky;
		margin: 0.85rem 1rem 0;
	}

	.editorial-container {
		max-width: var(--size-editorial-max, 1120px);
		margin: 0 auto;
		padding: 2rem 1rem 4rem;
		display: flex;
		flex-direction: column;
		gap: 2.8rem;
	}

	.editorial-container.sr-only-3d {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
		pointer-events: none;
	}

	.editorial-hero {
		padding: 2.2rem;
		border-radius: var(--radius-2xl, 22px);
		background-color: var(--glass);
		background-image: var(--glass-sheen);
		border: 1px solid var(--glass-border);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--shadow-glass);
	}

	.hero-profile-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1.25rem;
		margin-bottom: 1.1rem;
	}

	.editorial-avatar {
		width: var(--size-avatar-lg, 88px);
		height: var(--size-avatar-lg, 88px);
		border-radius: var(--radius-pill, 9999px);
		object-fit: cover;
		border: 3px solid var(--spatial-accent, var(--accent)); /* ds-allow-hardcode */
	}

	.editorial-kicker {
		margin: 0 0 0.25rem;
		font-family: var(--font-mono, monospace);
		font-size: 0.76rem;
		color: var(--spatial-accent, var(--accent));
	}

	.editorial-hero h1 {
		margin: 0;
		font-size: clamp(1.6rem, 3vw, 2.35rem);
		color: var(--spatial-hud-ink, var(--ink));
	}

	.editorial-headline {
		margin: 0.25rem 0 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--spatial-hud-muted, var(--ink-secondary));
	}

	.editorial-summary {
		max-width: 68ch;
		font-size: 0.96rem;
		line-height: 1.68;
		color: var(--spatial-hud-muted, var(--ink-secondary));
	}

	.hero-cta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
		margin-top: 1.25rem;
	}

	.primary-cta,
	.secondary-cta {
		display: inline-flex;
		align-items: center;
		min-height: var(--size-touch, 40px);
		padding: 0.5rem 1rem;
		border-radius: var(--radius-pill, 9999px);
		font-size: 0.84rem;
		font-weight: 700;
		text-decoration: none;
		transition:
			background var(--duration-fast, 150ms) ease,
			border-color var(--duration-fast, 150ms) ease;
	}

	.primary-cta {
		background: var(--spatial-accent, var(--accent));
		color: var(--on-accent);
	}

	.primary-cta:hover {
		filter: brightness(1.08);
	}

	.secondary-cta {
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid var(--glass-border);
		color: var(--spatial-hud-ink, var(--ink));
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
	}

	.secondary-cta:hover {
		border-color: var(--spatial-accent, var(--accent));
		background: rgba(255, 255, 255, 0.16);
	}

	:root[data-theme='light'] .secondary-cta {
		background: rgba(255, 255, 255, 0.65);
		border: 1px solid var(--glass-border);
	}

	:root[data-theme='light'] .secondary-cta:hover {
		background: rgba(255, 255, 255, 0.9);
	}

	.editorial-section h2 {
		margin: 0 0 1.1rem;
		font-size: 1.35rem;
		color: var(--spatial-hud-ink, var(--ink));
	}

	.editorial-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--card-min-md, 310px)), 1fr));
		gap: 1rem;
	}

	/* Hierarki: kategori pertama ialah kepakaran utama CV, jadi ia mendapat
	   rel aksen & tajuk lebih besar sebagai titik fokus. Skop: hanya seksyen kemahiran. */
	.skills-grid > .editorial-card:first-child {
		border-left: 3px solid var(--spatial-accent, var(--accent));
	}

	.skills-grid > .editorial-card:first-child h3 {
		font-size: 1.22rem;
		color: var(--spatial-accent, var(--accent));
	}

	.skills-grid > .editorial-card:first-child .chip {
		border-color: color-mix(in srgb, var(--spatial-accent, #38bdf8) 45%, transparent);
	}

	.editorial-stack {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.editorial-card {
		padding: 1.35rem;
		border-radius: var(--radius-lg, 18px);
		background-color: var(--glass);
		background-image: var(--glass-sheen);
		border: 1px solid var(--glass-border);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--shadow-glass);
		font-variant-numeric: tabular-nums;
		transition: border-color var(--duration-normal) var(--ease-glass);
	}

	.editorial-card:hover,
	.editorial-card:focus-within {
		border-color: var(--glass-border-hover);
	}

	.meta-badge {
		display: inline-block;
		font-family: var(--font-mono, monospace);
		font-size: 0.72rem;
		background: var(--spatial-chip-bg, var(--badge-bg));
		color: var(--spatial-chip-ink, var(--badge-ink));
		border: 1px solid var(--spatial-chip-border, var(--badge-border));
		padding: 0.2rem 0.55rem;
		border-radius: var(--radius-pill, 9999px);
		margin-bottom: 0.35rem;
	}

	.editorial-card h3 {
		margin: 0.15rem 0 0.55rem;
		font-size: 1.08rem;
		color: var(--spatial-hud-ink, var(--ink));
	}

	.editorial-card p,
	.editorial-card li {
		font-size: 0.88rem;
		line-height: 1.58;
		color: var(--spatial-hud-muted, var(--ink-secondary));
	}

	.arch-note {
		margin-top: 0.45rem;
	}

	.chip-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.38rem;
		margin-top: 0.75rem;
	}

	.chip {
		font-family: var(--font-mono, monospace);
		font-size: 0.72rem;
		padding: 0.22rem 0.6rem;
		border-radius: var(--radius-xs, 6px);
		background: rgba(255, 255, 255, 0.07);
		border: 1px solid rgba(255, 255, 255, 0.14);
		color: var(--spatial-hud-ink, var(--ink));
	}

	:root[data-theme='light'] .chip {
		background: rgba(20, 24, 32, 0.05);
		border: 1px solid rgba(20, 24, 32, 0.1);
	}

	.project-links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.85rem;
		margin-top: 0.85rem;
	}

	.inline-link {
		display: inline-flex;
		align-items: center;
		min-height: 24px;
		font-size: 0.82rem;
		font-weight: 700;
		color: var(--spatial-accent, var(--accent));
		text-decoration: none;
	}

	.inline-link:hover {
		text-decoration: underline;
	}

	.editorial-credit {
		margin-top: 2.5rem;
		padding: 1rem 0 0;
		border-top: 1px solid var(--spatial-card-border, var(--border));
		font-size: 0.78rem;
		color: var(--ink-muted, var(--spatial-hud-muted));
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
		align-items: center;
	}

	.editorial-credit p {
		margin: 0;
	}

	.cert-editorial-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--card-min-sm, 220px)), 1fr));
		gap: 0.85rem;
		margin-top: 1rem;
	}

	.cert-mini h4 {
		margin: 0.25rem 0;
		font-size: 0.94rem;
		color: var(--spatial-hud-ink, var(--ink));
	}

	@media (max-width: 768px) {
		.brand-full {
			display: none;
		}

		.brand-short {
			display: inline;
		}

		.brand-kicker {
			display: none;
		}

		.minimal-topbar {
			top: max(0.5rem, env(safe-area-inset-top));
			left: max(0.5rem, env(safe-area-inset-left));
			right: max(0.5rem, env(safe-area-inset-right));
			padding: 0.38rem 0.65rem;
			gap: 0.45rem;
			flex-wrap: nowrap;
		}

		.brand-cluster {
			flex-shrink: 0;
			gap: 0.45rem;
			padding: 0;
		}

		.brand-avatar {
			width: 32px;
			height: 32px;
		}

		.brand-name {
			font-size: 0.82rem;
			white-space: nowrap;
		}

		.utility-actions {
			flex-wrap: nowrap;
			flex-shrink: 0;
			gap: 0.28rem;
		}

		.util-pill {
			min-height: 44px;
			min-width: 44px;
			padding: 0.25rem 0.5rem;
			font-size: 0.74rem;
		}

		.pill-label {
			display: none;
		}

		.mode-label-full {
			display: none;
		}

		.mode-label-short {
			display: inline;
		}

		.bottom-compass {
			bottom: max(0.6rem, env(safe-area-inset-bottom));
			width: calc(100% - 1.2rem);
			max-width: 420px;
			padding: 0.35rem 0.55rem;
			gap: 0.45rem;
			border-radius: var(--radius-xl, 20px);
			/* Tablet 768: dok prop + radar + info + 2 anak panah tidak muat sebaris.
			   Bungkus ke dua baris supaya teks tidak runtuh huruf demi huruf. */
			flex-wrap: wrap;
			justify-content: center;
			row-gap: 0.4rem;
		}

		.prop-dock {
			order: 1;
			width: 100%;
			justify-content: center;
			flex-wrap: wrap;
		}

		.orbital-radar-cluster {
			order: 2;
		}

		.compass-info {
			order: 3;
		}

		.compass-arrow {
			order: 4;
		}

		/* Lencana nadi siber tidak muat di bawah 768px dan runtuh menegak;
		   ia disembunyikan secara visual sahaja supaya pembaca skrin tetap mendengarnya. */
		.compass-live {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			white-space: nowrap;
		}

		.compass-arrow {
			width: 36px;
			height: 36px;
		}

		.orbital-radar-cluster {
			width: 50px;
			height: 50px;
			--size-radar-node: 24px;
			--size-dot-sm: 6px;
			--size-dot-md: 9px;
		}

		.compass-info {
			min-width: 0;
			flex: 1;
			padding: 0 0.2rem;
		}

		.compass-code {
			font-size: 0.58rem;
		}

		.compass-title {
			font-size: 0.76rem;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			max-width: 140px;
		}

		.compass-hint {
			display: none;
		}

		.spine-root[data-mode='editorial'] .minimal-topbar {
			top: max(0.5rem, env(safe-area-inset-top));
			margin: 0.5rem 0.5rem 0;
		}

		.editorial-container {
			padding: 1.25rem 0.75rem 3rem;
			gap: 1.8rem;
		}

		.editorial-hero {
			padding: 1.25rem;
		}

		.hero-profile-row {
			gap: 0.75rem;
		}

		.editorial-avatar {
			width: 60px;
			height: 60px;
		}
	}

	/* Telefon sempit: 7 pil utiliti (≈335px) tidak muat sebelah nama. Lipat ke baris
	   kedua supaya setiap kawalan kelihatan — tiada leret tersembunyi. */
	@media (max-width: 480px) {
		.minimal-topbar {
			flex-wrap: wrap;
			row-gap: 0.3rem;
		}

		.utility-actions {
			width: 100%;
			justify-content: space-between;
			flex-shrink: 1;
			min-width: 0;
			flex-wrap: nowrap;
		}

		.util-pill {
			padding: 0.25rem 0.35rem;
		}

		/* Telefon sempit: susun semula kompas — dock prop baris atas penuh,
		   radar + tajuk pulau baris bawah. Elak dock terhimpit & teks tegak. */
		.bottom-compass {
			flex-wrap: wrap;
			gap: 0.45rem;
			justify-content: center;
			row-gap: 0.4rem;
		}

		.prop-dock {
			order: 1;
			width: 100%;
			justify-content: center;
			flex-wrap: wrap;
		}

		.orbital-radar-cluster {
			order: 2;
		}

		.compass-arrow {
			order: 4;
		}

		.compass-info {
			order: 3;
			flex: 1 1 auto;
			min-width: 0;
		}

		/* Lencana nadi siber terlalu panjang untuk bar 390px; ia kekal di desktop
		   dan diumumkan melalui aria-label kompas. */
		.compass-live,
		.compass-hint,
		.compass-code {
			display: none;
		}

		.compass-title {
			font-size: 0.72rem;
			white-space: normal;
			max-width: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.minimal-topbar,
		.bottom-compass {
			transition: none;
		}
		.minimal-topbar.ui-idle,
		.util-pill:active,
		.compass-arrow:active,
		.primary-cta:active,
		.secondary-cta:active {
			transform: none;
		}
		.bottom-compass.ui-idle {
			transform: translateX(-50%);
		}
	}
</style>
