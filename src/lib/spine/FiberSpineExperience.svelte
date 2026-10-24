<script lang="ts">
	import { onMount } from 'svelte';
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
	import { FiberSpineWorld, type ThemeMode } from './FiberSpineWorld';
	import SpineDossierModal from './SpineDossierModal.svelte';

	let locale = $state<Locale>('ms');
	let theme = $state<ThemeMode>('dark');
	let viewMode = $state<'3d' | 'editorial'>('3d');
	let webglReady = $state(true);
	let dossierOpen = $state(false);
	let uiIdle = $state(false);
	let mounted = $state(false);
	let motionPaused = $state(false);

	let activeStationIndex = $state(0);
	let spineProgress = $state(0);
	let selectedHotspotId = $state<string | null>(null);
	let hoveredHotspotId = $state<string | null>(null);
	let hoveredIslandLabel = $state<string | null>(null);
	let oceanWeatherIndex = $state(0);

	let canvasContainer: HTMLDivElement | undefined = $state();
	let world: FiberSpineWorld | null = null;
	let idleTimer: ReturnType<typeof setTimeout> | null = null;

	const currentStation = $derived(STATIONS[activeStationIndex] ?? STATIONS[0]);
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
						? `Klik Terminal 3D: ${found.code} · ${found.title[locale]}`
						: `Click 3D Terminal: ${found.code} · ${found.title[locale]}`;
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
			if (viewMode === '3d' && !selectedHotspotId && !dossierOpen) {
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
		world?.goToStation(clamped);
	}

	function cycleWeatherAtmosphere() {
		oceanWeatherIndex = (oceanWeatherIndex + 1) % OCEAN_WEATHER_PRESETS.length;
		const nextPreset = OCEAN_WEATHER_PRESETS[oceanWeatherIndex];
		if (nextPreset) {
			world?.setSimulationMode(activeStationIndex, nextPreset.id);
		}
	}

	function toggleTheme() {
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
		const next: Locale = locale === 'ms' ? 'en' : 'ms';
		locale = next;
		try {
			localStorage.setItem('spine-locale', next);
		} catch {
			// abaikan ralat storan peribadi
		}
		world?.setLocale(next);
	}

	function toggleViewMode() {
		const next = viewMode === '3d' ? 'editorial' : '3d';
		if (next === 'editorial') {
			if (selectedHotspotId) closeExhibit();
			if (dossierOpen) closeDossier();
		}
		viewMode = next;
		world?.setActive?.(next === '3d');
		world?.setInputEnabled?.(next === '3d' && !dossierOpen);
	}

	function toggleMotionPause() {
		motionPaused = !motionPaused;
		world?.setReducedMotion(motionPaused);
	}

	function openDossier() {
		if (selectedHotspotId) {
			closeExhibit();
		}
		dossierOpen = true;
		world?.setInputEnabled?.(false);
	}

	function closeDossier() {
		dossierOpen = false;
		world?.setInputEnabled?.(viewMode === '3d');
	}

	function openExhibit(id: string, stationIdx: number) {
		if (!id) {
			closeExhibit();
			return;
		}
		if (dossierOpen) {
			closeDossier();
		}
		hoveredHotspotId = null;
		hoveredIslandLabel = null;
		selectedHotspotId = id;
		if (stationIdx !== activeStationIndex) {
			jumpToStation(stationIdx);
		}
		world?.selectHotspot(id);
		world?.setInputEnabled(true);
	}

	function closeExhibit() {
		selectedHotspotId = null;
		hoveredHotspotId = null;
		hoveredIslandLabel = null;
		world?.selectHotspot(null);
		world?.setInputEnabled?.(viewMode === '3d' && !dossierOpen);
	}

	function nextHotspot() {
		world?.performScreenAction({ kind: 'next' });
	}

	function prevHotspot() {
		world?.performScreenAction({ kind: 'previous' });
	}

	function handleWheel(e: WheelEvent) {
		if (viewMode !== '3d' || dossierOpen || selectedHotspotId) return;
		e.preventDefault();
		resetIdleTimer();
		const delta = e.deltaY * 0.00032;
		world?.moveProgress?.(delta);
	}

	function handleGlobalKeydown(e: KeyboardEvent) {
		resetIdleTimer();
		if (dossierOpen) return;
		if (viewMode !== '3d') return;
		if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

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
			if (e.key === 'Escape') {
				e.preventDefault();
				closeExhibit();
				return;
			}
			if (e.key === 'ArrowRight') {
				e.preventDefault();
				nextHotspot();
				return;
			}
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				prevHotspot();
				return;
			}
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
		const is3DActive = viewMode === '3d';
		world?.setActive?.(is3DActive);
	});

	$effect(() => {
		const isInputAllowed = viewMode === '3d' && !dossierOpen;
		world?.setInputEnabled?.(isInputAllowed);
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
		} catch {
			// abaikan ralat storan
		}
		document.documentElement.setAttribute('data-theme', theme);

		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		motionPaused = mediaQuery.matches;
		if (motionPaused) {
			viewMode = 'editorial';
		}

		const handleMediaChange = (evt: MediaQueryListEvent) => {
			motionPaused = evt.matches;
			world?.setReducedMotion(motionPaused);
		};
		mediaQuery.addEventListener('change', handleMediaChange);

		if (canvasContainer) {
			world = new FiberSpineWorld(canvasContainer, {
				onStationChange: (idx, progress) => {
					spineProgress = progress;
					if (idx !== activeStationIndex) {
						syncStationSelection(idx);
					}
				},
				onHotspotHover: (id, islandLabel) => {
					hoveredHotspotId = id;
					hoveredIslandLabel = islandLabel ?? null;
				},
				onHotspotSelect: (id, stationIdx) => {
					openExhibit(id, stationIdx);
				},
				onOpenDossier: openDossier
			});

			const ok = world.init();
			webglReady = ok;
			if (!ok) {
				viewMode = 'editorial';
			} else {
				world.setTheme(theme);
				world.setLocale(locale);
				world.setReducedMotion(motionPaused);
				world.selectHotspot(selectedHotspotId);
				world?.setActive?.(viewMode === '3d');
				world?.setInputEnabled?.(viewMode === '3d');
			}
		}

		resetIdleTimer();

		return () => {
			if (idleTimer) clearTimeout(idleTimer);
			mediaQuery.removeEventListener('change', handleMediaChange);
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

	<!-- Pengepala Kaca Minimalis (HUD Terpelihara; Sembunyi semasa mod periksa atau arkib aktif) -->
	<header
		class="minimal-topbar"
		class:ui-idle={uiIdle && viewMode === '3d' && !selectedHotspotId && !dossierOpen}
		class:hidden-on-inspect={selectedHotspotId || dossierOpen}
		inert={Boolean(selectedHotspotId) || dossierOpen}
	>
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
				<strong class="brand-name">{PROFILE.fullName}</strong>
			</div>
		</div>

		<div class="utility-actions">
			{#if viewMode === '3d'}
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
						width="13"
						height="13"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M2 12h20M12 2v20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
					</svg>
					<span>{getWeatherConditionLabel(currentWeather.id, locale)}</span>
				</button>

				<button
					type="button"
					class="util-pill"
					class:active={motionPaused}
					onclick={toggleMotionPause}
					aria-label={motionPaused
						? locale === 'ms'
							? 'Sambung semula simulasi gerakan 3D'
							: 'Resume 3D motion simulation'
						: locale === 'ms'
							? 'Jeda simulasi gerakan 3D'
							: 'Pause 3D motion simulation'}
					title={motionPaused
						? locale === 'ms'
							? 'Sambung semula gerakan 3D'
							: 'Resume 3D motion'
						: locale === 'ms'
							? 'Jeda gerakan 3D'
							: 'Pause 3D motion'}
				>
					{#if motionPaused}
						<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
							<polygon points="5 3 19 12 5 21 5 3"></polygon>
						</svg>
						<span>{locale === 'ms' ? 'Gerakan: Jeda' : 'Motion: Paused'}</span>
					{:else}
						<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
							<rect x="6" y="4" width="4" height="16"></rect>
							<rect x="14" y="4" width="4" height="16"></rect>
						</svg>
						<span>{locale === 'ms' ? 'Gerakan: Aktif' : 'Motion: Active'}</span>
					{/if}
				</button>
			{/if}

			{#if webglReady}
				<button type="button" class="util-pill mode-switch" onclick={toggleViewMode}>
					{viewMode === '3d'
						? locale === 'ms'
							? 'Baca Mod Editorial CV'
							: 'Read Editorial CV Mode'
						: locale === 'ms'
							? 'Kembali ke Dunia 3D'
							: 'Return to 3D World'}
				</button>
			{/if}

			<button type="button" class="util-pill" onclick={openDossier}>
				{locale === 'ms' ? 'Arkib Penuh' : 'Full Archive'}
			</button>

			<button
				type="button"
				class="util-pill"
				onclick={toggleLocale}
				aria-label={locale === 'ms' ? 'Switch to English' : 'Tukar ke Bahasa Melayu'}
			>
				{locale === 'ms' ? 'BM / EN' : 'EN / BM'}
			</button>

			<button
				type="button"
				class="util-pill"
				onclick={toggleTheme}
				aria-label={locale === 'ms' ? 'Tukar tema gelap atau cerah' : 'Toggle dark or light theme'}
			>
				{#if theme === 'dark'}
					<svg
						width="12"
						height="12"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
					</svg>
					<span>Dark</span>
				{:else}
					<svg
						width="12"
						height="12"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="5"></circle>
						<line x1="12" y1="1" x2="12" y2="3"></line>
						<line x1="12" y1="21" x2="12" y2="23"></line>
						<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
						<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
						<line x1="1" y1="12" x2="3" y2="12"></line>
						<line x1="21" y1="12" x2="23" y2="12"></line>
						<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
						<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
					</svg>
					<span>Light</span>
				{/if}
			</button>
		</div>
	</header>

	{#if viewMode === '3d'}
		<!-- Petunjuk Halus Apabila Kursor Menyentuh Terminal 3D atau Pulau di Seberang Laut -->
		{#if hoveredPromptText && !selectedHotspotId && !dossierOpen}
			<div class="hover-reticle-badge" role="status">
				<span class="reticle-pulse"></span>
				<span>{hoveredPromptText}</span>
			</div>
		{/if}

		<!-- Kompas Radar Kepulauan Orbital 360° Minimalis Beraksesibiliti -->
		<footer
			class="bottom-compass"
			class:ui-idle={uiIdle && !selectedHotspotId && !dossierOpen}
			class:hidden-on-inspect={selectedHotspotId || dossierOpen}
			inert={Boolean(selectedHotspotId) || dossierOpen}
		>
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

			<!-- Radar Orbital 360° Boleh Akses (Native Button Nodes >=24px) -->
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
					{@const nx = 42 + Math.cos(angle) * 30}
					{@const ny = 42 + Math.sin(angle) * 30}
					<button
						type="button"
						class="radar-station-node"
						class:active={idx === activeStationIndex}
						style="left: {nx}px; top: {ny}px;"
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
				<strong class="compass-title">{currentStation.title[locale]}</strong>
				<span class="compass-hint">
					{locale === 'ms'
						? 'Skrol / W·S untuk Orbit 360° · Klik Pulau atau Papan 3D'
						: 'Scroll / W·S for 360° Orbit · Click Any Island or 3D Board'}
				</span>
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
		inert={mounted && viewMode === '3d' ? true : undefined}
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
					<h1>{PROFILE.fullName}</h1>
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
			<div class="editorial-grid">
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
	</main>

	<SpineDossierModal
		open={dossierOpen}
		{locale}
		onClose={closeDossier}
		onJumpStation={(idx) => {
			closeDossier();
			viewMode = '3d';
			jumpToStation(idx);
		}}
	/>
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

	.webgl-stage {
		position: fixed;
		inset: 0;
		z-index: 1;
		touch-action: none;
	}

	.webgl-stage.hidden {
		display: none;
	}

	/* Pengepala Kaca Minimalis */
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
		border-radius: var(--radius-pill, 9999px);
		background: var(--spatial-hud-bg, var(--surface));
		color: var(--spatial-hud-ink, var(--ink));
		border: 1px solid var(--spatial-hud-border, var(--surface-border));
		backdrop-filter: blur(var(--blur-glass, 16px));
		box-shadow: var(--shadow-md, 0 12px 32px rgba(0, 0, 0, 0.25));
		transition:
			opacity var(--duration-normal, 300ms) ease,
			transform var(--duration-normal, 300ms) ease;
	}

	.minimal-topbar.ui-idle {
		opacity: 0.88;
		transform: translateY(calc(-1 * var(--space-idle-y, 2px)));
	}

	.minimal-topbar:hover,
	.minimal-topbar:focus-within {
		opacity: 1;
		transform: translateY(0);
	}

	.minimal-topbar.hidden-on-inspect {
		opacity: 0;
		pointer-events: none;
		transform: translateY(-16px);
	}

	.brand-cluster {
		display: flex;
		align-items: center;
		gap: 0.68rem;
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
		min-height: var(--size-control-sm, 34px);
		padding: 0.32rem 0.78rem;
		border-radius: var(--radius-pill, 9999px);
		border: 1px solid var(--spatial-pill-border, var(--surface-border));
		background: var(--spatial-pill-bg, var(--surface-hover));
		color: var(--spatial-hud-ink, var(--ink));
		font-size: 0.76rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			background var(--duration-fast, 150ms) ease,
			border-color var(--duration-fast, 150ms) ease;
	}

	.util-pill:hover {
		border-color: var(--spatial-pill-hover-border, var(--accent));
		background: var(--spatial-pill-hover-bg, var(--surface-hover));
	}

	.util-pill.active {
		border-color: var(--spatial-accent, var(--accent));
		background: var(--spatial-chip-bg, var(--badge-bg));
		color: var(--spatial-chip-ink, var(--badge-ink));
	}

	.util-pill.mode-switch {
		background: var(--spatial-accent, var(--accent));
		color: var(--bg, #ffffff);
		border-color: transparent;
		font-weight: 700;
	}

	.util-pill.mode-switch:hover {
		filter: brightness(1.08);
	}

	/* Lencana Halus Apabila Kursor Menyentuh Papan Pameran 3D atau Pulau */
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
		border-radius: var(--radius-pill, 9999px);
		background: var(--spatial-hud-bg, var(--surface));
		color: var(--spatial-hud-ink, var(--ink));
		border: 1px solid var(--spatial-hud-border, var(--surface-border));
		backdrop-filter: blur(var(--blur-glass, 16px));
		box-shadow: var(--shadow-md, 0 14px 36px rgba(0, 0, 0, 0.35));
		transition:
			opacity var(--duration-normal, 300ms) ease,
			transform var(--duration-normal, 300ms) ease;
	}

	.bottom-compass.ui-idle {
		opacity: 0.88;
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
		transform: translateX(-50%) translateY(16px);
	}

	.compass-arrow {
		width: var(--size-avatar-sm, 36px);
		height: var(--size-avatar-sm, 36px);
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
		background: var(--spatial-radar-bg, var(--bg-subtle));
		border: 1px solid var(--spatial-radar-border, var(--surface-border));
		flex-shrink: 0;
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

	/* MOD EDITORIAL CV */
	.editorial-container {
		max-width: var(--size-editorial-max, 1120px);
		margin: 0 auto;
		padding: 6.2rem 1.5rem 4rem;
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
		padding: 2rem;
		border-radius: var(--radius-2xl, 22px);
		background: var(--spatial-card-bg, var(--surface));
		border: 1px solid var(--spatial-card-border, var(--surface-border));
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
		color: var(--bg, #ffffff);
	}

	.primary-cta:hover {
		filter: brightness(1.08);
	}

	.secondary-cta {
		background: var(--spatial-pill-bg, var(--surface-hover));
		border: 1px solid var(--spatial-pill-border, var(--surface-border));
		color: var(--spatial-hud-ink, var(--ink));
	}

	.secondary-cta:hover {
		border-color: var(--spatial-accent, var(--accent));
	}

	.editorial-section h2 {
		margin: 0 0 1.1rem;
		font-size: 1.35rem;
		color: var(--spatial-hud-ink, var(--ink));
	}

	.editorial-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(var(--card-min-md, 310px), 1fr));
		gap: 1rem;
	}

	.editorial-stack {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.editorial-card {
		padding: 1.35rem;
		border-radius: var(--radius-lg, 18px);
		background: var(--spatial-card-bg, var(--surface));
		border: 1px solid var(--spatial-card-border, var(--surface-border));
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
		padding: 0.2rem 0.55rem;
		border-radius: var(--radius-xs, 6px);
		background: var(--spatial-pill-bg, var(--surface-hover));
		border: 1px solid var(--spatial-pill-border, var(--surface-border));
		color: var(--spatial-hud-ink, var(--ink));
	}

	.project-links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.85rem;
		margin-top: 0.85rem;
	}

	.inline-link {
		font-size: 0.82rem;
		font-weight: 700;
		color: var(--spatial-accent, var(--accent));
		text-decoration: none;
	}

	.inline-link:hover {
		text-decoration: underline;
	}

	.cert-editorial-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(var(--card-min-sm, 220px), 1fr));
		gap: 0.85rem;
		margin-top: 1rem;
	}

	.cert-mini h4 {
		margin: 0.25rem 0;
		font-size: 0.94rem;
		color: var(--spatial-hud-ink, var(--ink));
	}

	@media (max-width: 720px) {
		.compass-hint {
			display: none;
		}
		.compass-info {
			min-width: var(--size-compass-mobile, 155px);
		}
		.minimal-topbar {
			border-radius: var(--radius-lg, 18px);
		}
		.bottom-compass {
			border-radius: var(--radius-lg, 18px);
			gap: 0.5rem;
			padding: 0.4rem 0.65rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.minimal-topbar,
		.bottom-compass {
			transition: none;
		}
	}
</style>
