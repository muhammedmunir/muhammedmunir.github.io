<script lang="ts">
	import { lang, toggleLang } from '$lib/i18n';
	import { theme, toggleTheme } from '$lib/theme';
	import { sfxEnabled, toggleSfx, playBlip } from '$lib/sound';
	import { CHAMBERS, CONTACT, type ChamberId } from './chambers';
	import FacilityIcon from './FacilityIcon.svelte';

	type Props = {
		currentChamber: ChamberId;
		worldState: 'loading' | 'ready' | 'unavailable' | 'text';
		paused: boolean;
		reducedMotion: boolean;
		travelling: boolean;
		actionStep: number;
		visited: number[];
		onSelectChamber: (id: ChamberId) => void;
		onNext: () => void;
		onPrev: () => void;
		onOpenDossier: (detail?: number, opener?: HTMLElement) => void;
		onToggleMotion: () => void;
		onToggleView: () => void;
		onAction: () => void;
	};
	let { currentChamber, worldState, paused, reducedMotion, travelling, actionStep, visited, onSelectChamber, onNext, onPrev, onOpenDossier, onToggleMotion, onToggleView, onAction }: Props = $props();
	const chamber = $derived(CHAMBERS[currentChamber]);

	function act(callback: () => void) {
		playBlip(660, 0.025);
		callback();
	}

	const demonstrations = {
		ms: [
			'',
			'Putuskan satu laluan',
			'Pisahkan lapisan sistem',
			'Lalui proses onboarding',
			'Terokai cara pengecaman',
			''
		],
		en: ['', 'Disconnect a route', 'Unpack the system', 'Walk through onboarding', 'Explore recognition', '']
	};
	const result = $derived.by(() => {
		if (!actionStep) return '';
		if (currentChamber === 1) return $lang === 'ms'
			? actionStep % 2 ? 'Satu sambungan diputuskan. Laluan alternatif menggambarkan prinsip redundansi rangkaian.' : 'Semua sambungan dipulihkan. Topologi kembali ke keadaan asal.'
			: actionStep % 2 ? 'One connection is offline. The alternative route illustrates network redundancy.' : 'All connections restored. The topology is back to its starting state.';
		if (currentChamber === 2) return $lang === 'ms'
			? actionStep % 2 ? 'Lapisan dipisahkan: Vue → Laravel → MariaDB → Docker Swarm. Pilih lapisan untuk membaca peranannya.' : 'Lapisan digabungkan semula. Ini ialah pengelompokan penerangan, bukan rajah deployment sebenar.'
			: actionStep % 2 ? 'Layers separated: Vue → Laravel → MariaDB → Docker Swarm. Choose a layer to read its role.' : 'Layers reassembled. This is an explanatory grouping, not an actual deployment diagram.';
		if (currentChamber === 3) return ($lang === 'ms'
			? ['Dokumen: sediakan maklumat sebelum hari pertama.', 'Profil: lengkapkan dan semak butiran pekerja.', 'Latihan: terokai tugasan dan modul onboarding.']
			: ['Documents: prepare information before the first day.', 'Profile: complete and review employee details.', 'Training: explore onboarding tasks and modules.'])[(actionStep - 1) % 3];
		if (currentChamber === 4) return ($lang === 'ms'
			? ['Pengecaman: OpenCV dan SIFT digunakan dalam projek Python untuk mencari ciri visual.', 'Warna: segmentasi CIELAB membantu mengasingkan kawasan warna sasaran.', 'Sempadan: Win32 API mengehadkan tindakan kepada kawasan klien tetingkap.']
			: ['Recognition: the Python project uses OpenCV and SIFT to locate visual features.', 'Colour: CIELAB segmentation helps isolate target colour regions.', 'Boundaries: the Win32 API confines actions to a window’s client area.'])[(actionStep - 1) % 3];
		return '';
	});
</script>

<div class="hud">
	<header class="topbar">
		<button class="brand" type="button" onclick={() => act(() => onSelectChamber(0))} aria-label={$lang === 'ms' ? 'Muhammed Munir — kembali ke pengenalan' : 'Muhammed Munir — back to introduction'}>
			<span class="monogram" aria-hidden="true">m<span>.</span></span>
			<span class="brand-copy">MUHAMMED MUNIR<small>{$lang === 'ms' ? 'SEBUAH PORTFOLIO SPATIAL' : 'A SPATIAL PORTFOLIO'}</small></span>
		</button>
		<div class="controls" aria-label={$lang === 'ms' ? 'Tetapan pengalaman' : 'Experience settings'} role="group">
			<button class="control view-control" type="button" data-testid="view-toggle" onclick={onToggleView} aria-label={$lang === 'ms' ? (worldState === 'text' ? 'Aktifkan dunia 3D' : 'Gunakan mod bacaan tanpa 3D') : (worldState === 'text' ? 'Enable the 3D world' : 'Use reading mode without 3D')}>
				<FacilityIcon name={worldState === 'text' ? 'cube' : 'book'} />
				<span>{worldState === 'text' ? '3D' : $lang === 'ms' ? 'Bacaan' : 'Read'}</span>
			</button>
			<button class="control" type="button" data-testid="motion-toggle" onclick={onToggleMotion} disabled={reducedMotion} aria-pressed={paused} aria-label={$lang === 'ms' ? paused ? 'Sambung animasi' : 'Jeda animasi' : paused ? 'Resume animation' : 'Pause animation'} title={reducedMotion ? ($lang === 'ms' ? 'Gerakan minimum mengikut tetapan peranti' : 'Reduced motion follows your device setting') : ($lang === 'ms' ? 'Jeda atau sambung animasi' : 'Pause or resume animation')}>
				<FacilityIcon name={paused ? 'play' : 'pause'} />
			</button>
			<button class="control" type="button" onclick={toggleSfx} aria-pressed={$sfxEnabled} aria-label={$lang === 'ms' ? $sfxEnabled ? 'Matikan bunyi' : 'Aktifkan bunyi' : $sfxEnabled ? 'Mute sound' : 'Enable sound'}>
				<FacilityIcon name={$sfxEnabled ? 'sound' : 'muted'} />
			</button>
			<button class="control" type="button" data-testid="theme-toggle" onclick={toggleTheme} aria-label={$lang === 'ms' ? $theme === 'dark' ? 'Tukar ke mod terang' : 'Tukar ke mod gelap' : $theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
				<FacilityIcon name={$theme === 'dark' ? 'sun' : 'moon'} />
			</button>
			<button class="control language" type="button" data-testid="language-toggle" onclick={toggleLang} aria-label={$lang === 'ms' ? 'Switch to English' : 'Tukar ke Bahasa Melayu'}>{$lang === 'ms' ? 'EN' : 'BM'}</button>
		</div>
	</header>

	<main id="facility-main" class="main" tabindex="-1">
		<section class="story" aria-labelledby="station-title">
			<div class="station-line"><span class="station-marker" aria-hidden="true"></span><span>{chamber.code}</span><span class="station-count">0{currentChamber + 1} / 06</span></div>
			{#key currentChamber}
				<div class="story-content">
					<p class="eyebrow">{chamber.context[$lang]}</p>
					<h1 id="station-title" data-testid="station-title">{#if currentChamber === 0}{$lang === 'ms' ? 'Saya Munir.' : 'I’m Munir.'}<br /><em>{$lang === 'ms' ? 'Di sebalik sistem.' : 'Behind the systems.'}</em>{:else}{chamber.name[$lang]}{/if}</h1>
					<p class="summary">{chamber.summary[$lang]}</p>
					<div class="detail-shortcuts" aria-label={$lang === 'ms' ? 'Terokai butiran ruang' : 'Explore station details'} role="group">
						{#each chamber.details as detail, i}
							<button type="button" class="detail-shortcut" onclick={(event) => onOpenDossier(i, event.currentTarget)} aria-haspopup="dialog"><span class="detail-index">0{i + 1}</span>{detail.technology}<span aria-hidden="true">↗</span></button>
						{/each}
					</div>
					<div class="story-actions">
						{#if currentChamber === 0}
							<button type="button" class="primary" onclick={() => act(onNext)}><span>{$lang === 'ms' ? 'Mulakan perjalanan' : 'Begin the journey'}</span><FacilityIcon name="next" /></button>
						{:else if currentChamber === 5}
							<a class="primary" href={`mailto:${CONTACT.email}`}><FacilityIcon name="mail" /><span>{$lang === 'ms' ? 'Mari berbual' : 'Let’s talk'}</span></a>
						{:else}
							<button type="button" class="primary" data-testid="station-action" onclick={() => act(onAction)}><span>{demonstrations[$lang][currentChamber]}</span><FacilityIcon name={currentChamber === 2 ? 'cube' : 'next'} /></button>
						{/if}
						<button type="button" class="inspect" data-testid="inspect-button" onclick={(event) => onOpenDossier(0, event.currentTarget)} aria-haspopup="dialog">{$lang === 'ms' ? 'Buka catatan' : 'Open field notes'}<span aria-hidden="true">↗</span></button>
					</div>
					{#if currentChamber > 0 && currentChamber < 5}
						<div class="action-note"><span class="demo-tag">{$lang === 'ms' ? 'ILUSTRASI INTERAKTIF' : 'INTERACTIVE ILLUSTRATION'}</span><p data-testid="action-result" role="status">{result || ($lang === 'ms' ? 'Cuba tindakan di atas, kemudian buka catatan untuk konteks projek sebenar.' : 'Try the action above, then open the notes for the real project context.')}</p></div>
					{/if}
				</div>
			{/key}
			{#if currentChamber === 0}<p class="intro-note">{$lang === 'ms' ? 'Rangkaian. Full-stack. Computer vision.' : 'Networks. Full-stack. Computer vision.'}<br /><span>{$lang === 'ms' ? 'Tiga bidang, satu cara berfikir.' : 'Three disciplines. One connected way of thinking.'}</span></p>{/if}
		</section>

		<div class="scene-caption" aria-hidden="true">
			<span class="caption-cross">+</span>
			<span>{worldState === 'ready' ? ($lang === 'ms' ? 'PILIH OBJEK UNTUK MENEROKA' : 'SELECT AN OBJECT TO EXPLORE') : worldState === 'loading' ? ($lang === 'ms' ? 'MENYEDIAKAN RUANG' : 'PREPARING THE SPACE') : ($lang === 'ms' ? 'CATATAN TERSEDIA TANPA 3D' : 'NOTES AVAILABLE WITHOUT 3D')}<small>{chamber.subtitle[$lang]}</small></span>
		</div>
	</main>

	<footer class="deck">
		<div class="deck-topline"><span>{$lang === 'ms' ? 'PETA PERJALANAN' : 'JOURNEY INDEX'}</span><span role="status">{travelling ? ($lang === 'ms' ? 'Bergerak ke ruang…' : 'Moving to station…') : paused ? ($lang === 'ms' ? 'Gerakan minimum' : 'Motion paused') : ($lang === 'ms' ? 'Terokai mengikut rentak anda' : 'Explore at your own pace')}</span></div>
		<div class="deck-navigation">
			<button class="arrow-button" type="button" data-testid="previous-station" onclick={() => act(onPrev)} disabled={currentChamber === 0} aria-label={$lang === 'ms' ? 'Ruang sebelumnya' : 'Previous station'}><FacilityIcon name="previous" /></button>
			<nav class="stations" aria-label={$lang === 'ms' ? 'Pilih ruang portfolio' : 'Choose a portfolio station'}>
				{#each CHAMBERS as station}
					<button type="button" class="station" class:active={station.id === currentChamber} class:visited={visited.includes(station.id)} data-chamber={station.id} onclick={() => act(() => onSelectChamber(station.id))} aria-current={station.id === currentChamber ? 'step' : undefined} aria-label={`${String(station.id + 1).padStart(2, '0')} — ${station.short[$lang]}`}>
						<span class="station-number">0{station.id + 1}<span class="visited-dot" aria-hidden="true"></span></span><span class="station-label">{station.short[$lang]}</span>
					</button>
				{/each}
			</nav>
			<button class="arrow-button next" type="button" data-testid="next-station" onclick={() => act(onNext)} disabled={currentChamber === 5} aria-label={$lang === 'ms' ? 'Ruang seterusnya' : 'Next station'}><FacilityIcon name="next" /></button>
		</div>
		<div class="deck-footnote"><span>IT / FULL-STACK / AI</span><span>{$lang === 'ms' ? 'Gunakan butang atau kekunci anak panah pada ruang navigasi.' : 'Use the buttons or arrow keys within the journey index.'}</span></div>
	</footer>
</div>

<style>
	.hud { position: relative; z-index: 2; min-height: 100svh; min-height: 100dvh; display: grid; grid-template-rows: auto 1fr auto; gap: 24px; padding: 24px clamp(20px, 4vw, 64px) 16px; pointer-events: none; }
	.topbar { display: flex; align-items: center; justify-content: space-between; gap: 24px; pointer-events: auto; }
	.brand { display: inline-flex; align-items: center; gap: 12px; text-align: left; }
	.monogram { font-family: var(--font-heading); font-size: 42px; font-weight: 800; line-height: 1; letter-spacing: -0.1em; padding-right: 5px; }
	.monogram span { color: var(--f-accent); }
	.brand-copy { font-size: 11px; letter-spacing: 0.13em; font-weight: 700; }
	.brand-copy small { display: block; font: 9px/1.9 var(--f-mono); letter-spacing: 0.13em; color: var(--f-muted); }
	.controls { display: flex; align-items: center; gap: 4px; border: 1px solid var(--f-line); border-radius: 999px; padding: 4px; background: var(--f-panel); backdrop-filter: blur(16px); }
	.control { min-width: 44px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 50%; color: var(--f-ink); }
	.control:hover:not(:disabled) { background: var(--f-hover); }
	.control:disabled { opacity: 0.6; }
	.view-control { border-radius: 999px; padding-inline: 14px; font-size: 11px; border-right: 1px solid var(--f-line); }
	.language { font: 600 11px var(--f-mono); }
	.main { display: flex; align-items: center; position: relative; min-width: 0; padding-block: 32px; outline: none; }
	.story { width: min(420px, 36vw); pointer-events: auto; }
	.station-line { display: flex; align-items: center; gap: 8px; font: 10px var(--f-mono); letter-spacing: 0.1em; color: var(--f-muted); padding-bottom: 20px; }
	.station-marker { width: 6px; height: 6px; background: var(--f-accent); }
	.station-count { margin-left: auto; font-variant-numeric: tabular-nums; }
	.story-content { animation: reveal 450ms cubic-bezier(0.16, 1, 0.3, 1); }
	.eyebrow { color: var(--f-accent); font-size: 11px; font-weight: 600; margin-bottom: 12px; }
	h1 { font-size: clamp(32px, 3.7vw, 58px); line-height: 1.08; font-weight: 600; color: var(--f-ink); letter-spacing: -0.055em; text-wrap: balance; }
	h1 em { font-style: normal; color: var(--f-muted); }
	.summary { color: var(--f-muted); font-size: 13px; line-height: 1.8; max-width: 43ch; margin-top: 20px; }
	.detail-shortcuts { display: flex; flex-wrap: wrap; gap: 0 12px; margin-top: 20px; }
	.detail-shortcut { display: inline-flex; gap: 8px; align-items: center; min-height: 44px; font: 10px var(--f-mono); border-bottom: 1px solid var(--f-line); color: var(--f-ink); }
	.detail-shortcut:hover { color: var(--f-accent); border-color: var(--f-accent); }
	.detail-index { color: var(--f-muted); font-variant-numeric: tabular-nums; }
	.story-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 16px; margin-top: 24px; }
	.primary { min-height: 48px; display: inline-flex; align-items: center; justify-content: center; gap: 16px; background: var(--f-button); color: var(--f-button-ink); padding: 12px 18px; border-radius: 5px; font-size: 11px; font-weight: 700; transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), background 180ms; }
	.primary:hover { background: var(--f-button-hover); transform: translateY(-2px); }
	.primary:active { transform: scale(0.98); }
	.inspect { min-height: 44px; display: inline-flex; align-items: center; gap: 12px; font-size: 11px; color: var(--f-ink); }
	.inspect:hover { color: var(--f-accent); }
	.action-note { min-height: 100px; margin-top: 20px; padding: 12px 0 0 14px; border-left: 1px solid var(--f-line); }
	.demo-tag { font: 8px var(--f-mono); letter-spacing: 0.1em; color: var(--f-accent); }
	.action-note p { font-size: 11px; line-height: 1.7; margin-top: 6px; color: var(--f-muted); }
	.intro-note { color: var(--f-ink); font-size: 10px; line-height: 1.8; margin-top: 40px; }
	.intro-note span { color: var(--f-muted); }
	.scene-caption { position: absolute; right: 0; bottom: 0; display: flex; align-items: flex-start; gap: 12px; max-width: 350px; font: 9px/1.6 var(--f-mono); color: var(--f-muted); letter-spacing: 0.06em; }
	.scene-caption small { display: block; font-size: 9px; color: var(--f-ink); letter-spacing: 0; margin-top: 4px; }
	.caption-cross { font-size: 24px; line-height: 1; color: var(--f-accent); }
	.deck { pointer-events: auto; }
	.deck-topline, .deck-footnote { display: flex; justify-content: space-between; gap: 16px; color: var(--f-muted); font: 8px/1.7 var(--f-mono); letter-spacing: 0.08em; }
	.deck-topline { padding-block: 12px; }
	.deck-navigation { display: flex; align-items: stretch; gap: 16px; border-top: 1px solid var(--f-line); border-bottom: 1px solid var(--f-line); }
	.arrow-button { min-width: 44px; min-height: 60px; display: grid; place-items: center; }
	.arrow-button:hover:not(:disabled) { color: var(--f-accent); }
	.stations { flex: 1; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); }
	.station { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 16px 12px; position: relative; border-top: 2px solid transparent; margin-top: -1px; }
	.station:hover { background: var(--f-hover); }
	.station.active { border-top-color: var(--f-accent); background: var(--f-active); }
	.station-number { display: flex; align-items: center; gap: 8px; font: 10px var(--f-mono); color: var(--f-muted); font-variant-numeric: tabular-nums; }
	.station-label { font-size: 10px; color: var(--f-muted); text-align: left; }
	.active .station-label, .active .station-number { color: var(--f-ink); }
	.visited-dot { height: 3px; width: 3px; background: var(--f-muted); opacity: 0; }
	.visited .visited-dot { opacity: 1; }
	.active .visited-dot { background: var(--f-accent); }
	.deck-footnote { padding-top: 12px; font-size: 8px; letter-spacing: 0; }
	@keyframes reveal { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
	@media (min-width: 1600px) { .story { width: 450px; } h1 { font-size: 64px; } .summary { font-size: 15px; } }
	@media (max-width: 1000px) { .hud { padding-inline: 24px; } .story { width: 40vw; } .station { padding-inline: 8px; } .deck-navigation { gap: 8px; } }
	@media (max-width: 700px) {
		.hud { padding: 16px; gap: 16px; }
		.topbar { gap: 8px; }
		.brand { min-height: 44px; }
		.brand-copy { display: none; }
		.controls { padding: 0; border: 0; justify-content: flex-end; background: var(--f-panel); backdrop-filter: blur(16px); }
		.view-control { padding-inline: 10px; border: 0; }
		.view-control span { display: none; }
		.main { display: block; padding-block: 0; padding-top: clamp(120px, 23svh, 220px); }
		.story { width: 100%; background: var(--f-mobile-panel); padding: 16px; margin: 0 -0px; border: 1px solid var(--f-line); border-radius: 8px; backdrop-filter: blur(16px); }
		.station-line { padding-bottom: 12px; font-size: 9px; }
		h1 { font-size: clamp(29px, 7.8vw, 42px); max-width: 16ch; }
		.eyebrow { font-size: 10px; margin-bottom: 8px; }
		.summary { font-size: 12px; line-height: 1.7; margin-top: 12px; max-width: 100%; }
		.detail-shortcuts { margin-top: 8px; gap: 0 12px; }
		.story-actions { margin-top: 12px; gap: 4px 12px; }
		.primary { font-size: 11px; padding-inline: 14px; }
		.intro-note, .scene-caption { display: none; }
		.action-note { min-height: 0; margin-top: 12px; padding-top: 4px; }
		.deck-topline { font-size: 7px; padding-top: 0; }
		.deck-navigation { gap: 0; }
		.arrow-button { min-width: 32px; }
		.station { padding: 10px 4px; align-items: center; gap: 6px; min-height: 54px; }
		.station-number { font-size: 9px; gap: 3px; }
		.station-label { font-size: 8px; text-align: center; }
		.deck-footnote span:last-child { display: none; }
	}
	@media (max-width: 360px) { .story { padding: 12px; } .station-label { font-size: 7px; } .detail-shortcut { font-size: 9px; } .arrow-button { min-width: 28px; } }
	@media (max-height: 500px) and (min-width: 701px) { .main { padding-block: 8px; } .scene-caption { display: none; } .hud { gap: 16px; } }
	@media (prefers-reduced-motion: reduce) { .story-content { animation: none; } .primary { transition: none; } .primary:hover { transform: none; } }
	@media (forced-colors: active) { .story, .controls { background: Canvas; } .primary { border: 1px solid ButtonText; } .station.active { border-top: 2px solid Highlight; } }
</style>
