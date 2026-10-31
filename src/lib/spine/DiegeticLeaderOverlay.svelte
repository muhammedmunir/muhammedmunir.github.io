<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { Locale } from './spine-data';
	import type { ExhibitView, ExhibitAction } from './exhibit-navigation';
	import { getChipAction } from './exhibit-navigation';
	import type { LayerMarker } from './FiberSpineWorld';

	interface Props {
		view: ExhibitView | null;
		locale: Locale;
		markers: LayerMarker[];
		siblingIndex: number;
		siblingCount: number;
		stationIndex: number;
		laserHits: number;
		laserReady: boolean;
		sceneReady: boolean;
		canBack: boolean;
		onclose: () => void;
		onstep: (delta: number) => void;
		onchip: (chip: string) => void;
		onaction: (action: ExhibitAction) => void;
		onfire: () => void;
		onback: () => void;
	}

	let {
		view,
		locale,
		markers,
		siblingIndex,
		siblingCount,
		stationIndex,
		laserHits,
		laserReady,
		sceneReady,
		canBack,
		onclose,
		onstep,
		onchip,
		onaction,
		onfire,
		onback
	}: Props = $props();

	let calout: HTMLElement | undefined = $state();
	let gather = $state({ x: 74, yTop: 18, yMid: 32, yBase: 46 });

	function measure() {
		if (!calout) return;
		const rect = calout.getBoundingClientRect();
		const vw = Math.max(1, document.documentElement.clientWidth);
		const vh = Math.max(1, document.documentElement.clientHeight);
		const x = ((rect.left - 8) / vw) * 100;
		const yTop = (rect.top / vh) * 100;
		const yMid = ((rect.top + rect.height * 0.5) / vh) * 100;
		const yBase = ((rect.top + rect.height - 8) / vh) * 100;
		gather = { x, yTop, yMid, yBase };
	}

	function chipAction(chip: string): ExhibitAction | null {
		return view ? getChipAction(view, chip) : null;
	}

	onMount(() => {
		void tick().then(measure);
	});

	function pointsFor(marker: LayerMarker, gy: number): string {
		const mx = Math.max(2, Math.min(98, marker.x));
		const my = Math.max(2, Math.min(98, marker.y));
		const gx = Math.max(2, Math.min(98, gather.x));
		const middlex = mx + (gx - mx) * 0.42;
		return `${mx},${my} ${middlex},${my} ${middlex},${gy} ${gx},${gy}`;
	}
</script>

{#if view}
	<div class="leader-root" aria-live="polite">
		<!-- Garisan penunjuk SVG tajam dari titik sauh lapisan 3D ke kalout -->
		<svg class="leader-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
			{#each markers as marker (marker.layer)}
				{@const gy =
					marker.layer === 'top'
						? gather.yTop
						: marker.layer === 'base'
							? gather.yBase
							: gather.yMid}
				<polyline class="leader-line" points={pointsFor(marker, gy)} />
				<circle class="leader-dot" cx={marker.x} cy={marker.y} r="0.9" />
			{/each}
		</svg>

		<!-- Kalout diegetik kaca cair -->
		<aside class="diegetic-calout" aria-labelledby="leader-callout-title" bind:this={calout}>
			<div class="calout-bar">
				<span class="calout-code">{view.code}</span>
				{#if siblingCount > 1}
					<span class="calout-step">{siblingIndex + 1} / {siblingCount}</span>
				{/if}
			</div>

			<h2 id="leader-callout-title" class="calout-title">{view.title[locale]}</h2>
			<p class="calout-subtitle">{view.subtitle[locale]}</p>
			<p class="calout-summary">{view.summary[locale]}</p>

			{#if view.tech.length > 0}
				<div class="chip-row calout-chips">
					{#each view.tech as tech (tech)}
						{#if chipAction(tech)}
							<button
								type="button"
								class="chip chip-link"
								onclick={() => onchip(tech)}
								aria-label={locale === 'ms' ? `Buka ${tech}` : `Open ${tech}`}
							>
								{tech}
							</button>
						{:else}
							<span class="chip">{tech}</span>
						{/if}
					{/each}
				</div>
			{/if}

			<div class="calout-actions">
				{#each view.actions as item (item.id)}
					<button type="button" class="util-pill action-pill" onclick={() => onaction(item.action)}>
						<span>{item.label[locale]}</span>
					</button>
				{/each}

				{#if stationIndex === 2}
					<button
						type="button"
						class="util-pill action-pill laser-pill"
						disabled={!sceneReady || !laserReady}
						onclick={onfire}
					>
						<span>
							{locale === 'ms' ? `Tembak Laser (${laserHits})` : `Fire Laser (${laserHits})`}
						</span>
					</button>
				{/if}
			</div>

			<div class="calout-nav">
				{#if siblingCount > 1}
					<button
						type="button"
						class="compass-arrow nav-btn"
						onclick={() => onstep(-1)}
						aria-label={locale === 'ms' ? 'Objek sebelumnya' : 'Previous object'}
						title={locale === 'ms' ? 'Objek sebelumnya (←)' : 'Previous object (←)'}
					>
						<svg
							width="14"
							height="14"
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
					<button
						type="button"
						class="compass-arrow nav-btn"
						onclick={() => onstep(1)}
						aria-label={locale === 'ms' ? 'Objek seterusnya' : 'Next object'}
						title={locale === 'ms' ? 'Objek seterusnya (→)' : 'Next object (→)'}
					>
						<svg
							width="14"
							height="14"
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
				{/if}
				{#if canBack}
					<button type="button" class="util-pill back-pill" onclick={onback}>
						<span>{locale === 'ms' ? 'Kembali' : 'Back'}</span>
					</button>
				{/if}
				<button
					type="button"
					class="util-pill close-pill"
					onclick={onclose}
					aria-label={locale === 'ms' ? 'Tutup dan kembali ke orbit' : 'Close and return to orbit'}
				>
					<span>{locale === 'ms' ? 'Tutup' : 'Close'}</span>
				</button>
			</div>
		</aside>
	</div>
{/if}

<style>
	.leader-root {
		position: fixed;
		inset: 0;
		z-index: 27;
		pointer-events: none;
	}

	.leader-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.leader-line {
		fill: none;
		stroke: var(--spatial-accent, var(--accent));
		stroke-width: 0.14;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0.75;
		vector-effect: non-scaling-stroke;
	}

	.leader-dot {
		fill: var(--spatial-accent, var(--accent));
		opacity: 0.9;
		vector-effect: non-scaling-stroke;
	}

	.diegetic-calout {
		pointer-events: auto;
		position: fixed;
		top: 6.75rem;
		right: 1.15rem;
		width: min(24rem, calc(100% - 2.3rem));
		max-height: calc(100vh - 9rem);
		overflow-y: auto;
		scrollbar-width: thin;
		padding: 0.9rem 1.05rem;
		border-radius: var(--radius-xl, 20px);
		background-color: var(--spatial-hud-bg, var(--surface));
		background-image: var(--glass-sheen);
		color: var(--spatial-hud-ink, var(--ink));
		border: 1px solid var(--spatial-hud-border, var(--surface-border));
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--shadow-glass);
	}

	.calout-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.2rem;
	}

	.calout-code {
		font-family: var(--font-mono, monospace);
		font-size: 0.68rem;
		letter-spacing: 0.08em;
		color: var(--spatial-accent, var(--accent));
	}

	.calout-step {
		font-family: var(--font-mono, monospace);
		font-size: 0.68rem;
		color: var(--spatial-hud-muted, var(--ink-secondary));
	}

	.calout-title {
		margin: 0.1rem 0 0.15rem;
		font-size: 1rem;
		font-weight: 700;
		line-height: 1.25;
		color: var(--spatial-hud-ink, var(--ink));
	}

	.calout-subtitle {
		margin: 0 0 0.45rem;
		font-size: 0.76rem;
		font-weight: 600;
		line-height: 1.4;
		color: var(--spatial-accent, var(--accent));
	}

	.calout-summary {
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.55;
		white-space: pre-line;
		color: var(--spatial-hud-muted, var(--ink-secondary));
	}

	/* Kalout bergulir: bayang dalam di tepi bawah menandakan kandungan lanjutan
	   supaya ayat tidak terpotong tanpa petunjuk. */
	.diegetic-calout {
		background-image:
			var(--glass-sheen), linear-gradient(to top, rgb(0 0 0 / 0.28), transparent 2.2rem);
		background-repeat: no-repeat;
		background-position:
			top left,
			bottom left;
		background-size:
			auto,
			100% 2.2rem;
	}

	.chip-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.38rem;
		margin-top: 0.6rem;
	}

	.chip {
		font-family: var(--font-mono, monospace);
		font-size: 0.7rem;
		padding: 0.2rem 0.58rem;
		border-radius: var(--radius-xs, 6px);
		background: rgba(255, 255, 255, 0.07);
		border: 1px solid rgba(255, 255, 255, 0.14);
		color: var(--spatial-hud-ink, var(--ink));
	}

	:root[data-theme='light'] .chip {
		background: rgba(20, 24, 32, 0.05);
		border: 1px solid rgba(20, 24, 32, 0.1);
	}

	.chip-link {
		cursor: pointer;
		transition: border-color var(--duration-fast, 150ms) ease;
	}

	.chip-link:hover,
	.chip-link:focus-visible {
		border-color: var(--spatial-accent, var(--accent));
	}

	.calout-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.45rem;
		margin-top: 0.75rem;
	}

	.util-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.38rem;
		min-height: var(--size-touch, 40px);
		padding: 0.4rem 0.85rem;
		border-radius: var(--radius-pill, 9999px);
		border: 1px solid var(--spatial-pill-border, var(--surface-border));
		background-color: var(--spatial-pill-bg, var(--surface-hover));
		color: var(--spatial-hud-ink, var(--ink));
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
		text-decoration: none;
		transition:
			background-color var(--duration-fast, 150ms) ease,
			border-color var(--duration-fast, 150ms) ease;
	}

	.action-pill {
		min-height: var(--size-touch, 40px);
	}

	.action-pill:hover {
		border-color: var(--spatial-accent, var(--accent));
		background-color: var(--spatial-pill-hover-bg, var(--surface-hover));
	}

	.laser-pill {
		background: var(--spatial-accent, var(--accent));
		color: var(--on-accent);
		border-color: transparent;
		font-weight: 700;
	}

	.laser-pill:hover {
		filter: brightness(1.08);
	}

	.laser-pill:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}

	.calout-nav {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.4rem;
		margin-top: 0.8rem;
	}

	.compass-arrow {
		width: 36px;
		height: 36px;
		flex-shrink: 0;
		border-radius: var(--radius-pill, 9999px);
		border: 1px solid var(--spatial-pill-border, var(--surface-border));
		background: var(--spatial-pill-bg, var(--surface-hover));
		color: var(--spatial-hud-ink, var(--ink));
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.back-pill {
		margin-left: auto;
	}

	.close-pill {
		background: var(--spatial-accent, var(--accent));
		color: var(--on-accent);
		border-color: transparent;
		font-weight: 700;
	}

	.close-pill:hover {
		filter: brightness(1.08);
	}

	@media (max-width: 768px) {
		.diegetic-calout {
			top: auto;
			left: 0.6rem;
			right: 0.6rem;
			bottom: max(0.6rem, env(safe-area-inset-bottom));
			width: auto;
			max-height: 36vh;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.leader-line {
			opacity: 1;
		}
	}
</style>
