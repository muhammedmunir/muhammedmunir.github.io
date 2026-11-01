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
	let gather = $state({ x: 74, yTop: 18, yMid: 28, yBase: 38 });

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

	$effect(() => {
		if (view && calout) {
			void tick().then(measure);
		}
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
		<!-- Laser Sauh SVG dari Objek 3D ke HUD Telemetri -->
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

		<!-- Kapsul Spatial Holografik Terapung (Tiada lagi helaian artikel 2D) -->
		<aside
			class="diegetic-calout spatial-hud"
			aria-labelledby="leader-callout-title"
			bind:this={calout}
		>
			<div class="hud-header">
				<div class="hud-badge">
					<span class="hud-pulse"></span>
					<span class="calout-code">{view.code}</span>
					{#if siblingCount > 1}
						<span class="hud-counter">{siblingIndex + 1}/{siblingCount}</span>
					{/if}
				</div>
				<button
					type="button"
					class="hud-close-btn"
					onclick={onclose}
					aria-label={locale === 'ms' ? 'Tutup pandangan makro (Esc)' : 'Close macro view (Esc)'}
					title="Esc"
				>
					✕
				</button>
			</div>

			<div class="hud-body">
				<h2 id="leader-callout-title" class="hud-title">{view.title[locale]}</h2>
				<p class="hud-subtitle">{view.subtitle[locale]}</p>
			</div>

			{#if view.tech.length > 0}
				<div class="hud-chips">
					{#each view.tech.slice(0, 4) as tech (tech)}
						{#if chipAction(tech)}
							<button type="button" class="hud-chip chip-link" onclick={() => onchip(tech)}>
								{tech}
							</button>
						{:else}
							<span class="hud-chip">{tech}</span>
						{/if}
					{/each}
				</div>
			{/if}

			<div class="hud-footer">
				{#if siblingCount > 1}
					<div class="hud-nav-cluster">
						<button
							type="button"
							class="hud-nav-btn"
							onclick={() => onstep(-1)}
							aria-label={locale === 'ms' ? 'Objek sebelumnya' : 'Previous object'}
						>
							←
						</button>
						<button
							type="button"
							class="hud-nav-btn"
							onclick={() => onstep(1)}
							aria-label={locale === 'ms' ? 'Objek seterusnya' : 'Next object'}
						>
							→
						</button>
					</div>
				{/if}

				{#if canBack}
					<button type="button" class="hud-action-pill back-pill" onclick={onback}>
						<span>{locale === 'ms' ? 'Kembali' : 'Back'}</span>
					</button>
				{/if}

				{#each view.actions as item (item.id)}
					<button type="button" class="hud-action-pill" onclick={() => onaction(item.action)}>
						<span>{item.label[locale]}</span>
					</button>
				{/each}

				{#if stationIndex === 2}
					<button
						type="button"
						class="hud-action-pill laser-pill"
						disabled={!sceneReady || !laserReady}
						onclick={onfire}
					>
						<span>⚡ {locale === 'ms' ? `Laser (${laserHits})` : `Fire (${laserHits})`}</span>
					</button>
				{/if}
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
		stroke: rgba(56, 189, 248, 0.75);
		stroke-width: 0.22;
		stroke-dasharray: 1.2 0.8;
		filter: drop-shadow(0 0 2px rgba(56, 189, 248, 0.8));
	}

	.leader-dot {
		fill: #38bdf8;
		stroke: #ffffff;
		stroke-width: 0.3;
	}

	.diegetic-calout.spatial-hud {
		pointer-events: auto;
		position: absolute;
		top: 5.5rem;
		right: 1.8rem;
		width: min(23rem, calc(100vw - 3rem));
		background: rgba(10, 18, 30, 0.82);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid rgba(56, 189, 248, 0.45);
		border-radius: 1rem;
		box-shadow:
			0 16px 36px -8px rgba(0, 0, 0, 0.65),
			0 0 20px rgba(56, 189, 248, 0.2);
		padding: 1.1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		color: #f8fafc;
		font-family: inherit;
		animation: hudFadeIn 0.24s cubic-bezier(0.16, 1, 0.3, 1);
	}

	:global([data-theme='light']) .diegetic-calout.spatial-hud {
		background: rgba(248, 250, 252, 0.88);
		border-color: rgba(14, 165, 233, 0.4);
		color: #0f172a;
		box-shadow:
			0 16px 36px -8px rgba(15, 23, 42, 0.18),
			0 0 20px rgba(14, 165, 233, 0.15);
	}

	@keyframes hudFadeIn {
		from {
			opacity: 0;
			transform: translateX(12px) scale(0.97);
		}
		to {
			opacity: 1;
			transform: translateX(0) scale(1);
		}
	}

	.hud-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.hud-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		background: rgba(56, 189, 248, 0.12);
		border: 1px solid rgba(56, 189, 248, 0.3);
		padding: 0.2rem 0.55rem;
		border-radius: 9999px;
	}

	.hud-pulse {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #38bdf8;
		box-shadow: 0 0 8px #38bdf8;
	}

	.calout-code {
		font-family: 'JetBrains Mono', Consolas, monospace;
		font-size: 0.72rem;
		font-weight: 700;
		color: #38bdf8;
		letter-spacing: 0.05em;
	}

	.hud-counter {
		font-size: 0.7rem;
		opacity: 0.75;
		font-family: monospace;
	}

	.hud-close-btn {
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.15);
		color: inherit;
		width: 1.8rem;
		height: 1.8rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 0.85rem;
		transition: all 0.15s ease;
	}

	.hud-close-btn:hover {
		background: rgba(239, 68, 68, 0.2);
		border-color: #ef4444;
		color: #ef4444;
	}

	.hud-body {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.hud-title {
		font-size: 1.05rem;
		font-weight: 700;
		line-height: 1.3;
		margin: 0;
		color: #ffffff;
	}

	:global([data-theme='light']) .hud-title {
		color: #0f172a;
	}

	.hud-subtitle {
		font-size: 0.78rem;
		line-height: 1.4;
		margin: 0;
		opacity: 0.78;
	}

	.hud-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.hud-chip {
		font-size: 0.68rem;
		font-family: 'JetBrains Mono', Consolas, monospace;
		padding: 0.18rem 0.45rem;
		border-radius: 0.35rem;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: inherit;
	}

	.hud-chip.chip-link {
		cursor: pointer;
		border-color: rgba(56, 189, 248, 0.35);
	}

	.hud-chip.chip-link:hover {
		background: rgba(56, 189, 248, 0.2);
		border-color: #38bdf8;
	}

	.hud-footer {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding-top: 0.25rem;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.hud-nav-cluster {
		display: flex;
		gap: 0.25rem;
	}

	.hud-nav-btn {
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: inherit;
		width: 1.8rem;
		height: 1.8rem;
		border-radius: 0.35rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 0.85rem;
	}

	.hud-nav-btn:hover {
		background: rgba(56, 189, 248, 0.2);
		border-color: #38bdf8;
	}

	.hud-action-pill {
		flex: 1;
		min-width: 4rem;
		background: rgba(56, 189, 248, 0.18);
		border: 1px solid rgba(56, 189, 248, 0.45);
		color: #38bdf8;
		padding: 0.38rem 0.75rem;
		border-radius: 0.5rem;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		text-align: center;
		transition: all 0.15s ease;
	}

	.hud-action-pill:hover {
		background: #38bdf8;
		color: #030712;
	}

	.hud-action-pill.laser-pill {
		background: rgba(244, 63, 94, 0.2);
		border-color: rgba(244, 63, 94, 0.5);
		color: #fb7185;
	}

	.hud-action-pill.laser-pill:hover:not(:disabled) {
		background: #f43f5e;
		color: #ffffff;
	}
</style>
