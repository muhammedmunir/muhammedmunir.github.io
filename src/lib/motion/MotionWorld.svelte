<script lang="ts">
	import { onMount } from 'svelte';
	import type { MotionController, MotionSnapshot } from './world';

	let { reduced = false }: { reduced?: boolean } = $props();
	let host: HTMLDivElement;
	let ready = $state(false);
	let controller: MotionController | undefined;

	// Both outlines are authored here, so the no-JS / no-WebGL image exists at SSR.
	// Even-odd fill preserves the same folded M-channel aperture as the 3D mesh.
	const lamina =
		'M-200 160H200V-148L127-188 0-42-127-188-200-148Z M-153 114V-111L-136-121 0 35 136-121 153-111V114Z';
	const layers = Array.from({ length: 9 }, (_, index) => ({
		x: (index - 4) * 15,
		y: (index - 4) * -10,
		scale: 1 - Math.abs(index - 4) * 0.018,
		fill: index === 2 || index === 7 ? '#d9d4c3' : index === 4 ? '#b57a54' : '#303a3a'
	}));

	$effect(() => {
		const value = reduced;
		controller?.setReduced(value);
	});

	onMount(() => {
		let alive = true;
		const abort = new AbortController();
		const diagnosticWindow = window as Window & { __motionDiagnostic?: MotionSnapshot };
		const loadingSnapshot = (): MotionSnapshot =>
			Object.freeze({
				progress: 0,
				section: 0,
				reduced,
				hidden: document.hidden,
				framePending: false,
				camera: '',
				draws: 0,
				geometries: 0,
				renders: 0,
				renderer: 'loading'
			});
		let failed = false;
		const diagnostic = () =>
			controller?.snapshot() ??
			Object.freeze({ ...loadingSnapshot(), renderer: failed ? 'fallback' : 'loading' });
		// A getter returns only a frozen primitive snapshot, never scene internals.
		// Identity checks prevent an older mount from deleting a newer mount's getter.
		Object.defineProperty(diagnosticWindow, '__motionDiagnostic', {
			configurable: true,
			enumerable: false,
			get: diagnostic
		});

		void import('./world')
			.then(async ({ createMotionWorld }) => {
				if (!alive) return;
				const next = await createMotionWorld(host, {
					reduced,
					signal: abort.signal,
					onReady: () => {
						if (alive) ready = true;
					},
					onFallback: () => {
						if (alive) {
							failed = true;
							ready = false;
						}
					}
				});
				if (!alive) {
					next?.dispose();
					return;
				}
				controller = next ?? undefined;
				// The prop may change while either dynamic import is pending.
				controller?.setReduced(reduced);
			})
			.catch(() => {
				if (alive) {
					failed = true;
					ready = false;
				}
			});

		return () => {
			alive = false;
			abort.abort();
			controller?.dispose();
			controller = undefined;
			if (
				Object.getOwnPropertyDescriptor(diagnosticWindow, '__motionDiagnostic')?.get === diagnostic
			) {
				delete diagnosticWindow.__motionDiagnostic;
			}
		};
	});
</script>

<div class="motion-world" aria-hidden="true" data-motion-world>
	<div class="renderer" bind:this={host}></div>
	<svg
		class:loaded={ready}
		class="fallback"
		viewBox="-410 -380 820 760"
		fill="none"
		focusable="false"
	>
		<ellipse cx="20" cy="250" rx="242" ry="17" fill="#182323" opacity="0.07" />
		<g transform="translate(0 10) rotate(-12) skewY(8) scale(.94 .94)">
			{#each layers as layer}
				<g transform={`translate(${layer.x} ${layer.y}) scale(${layer.scale})`}>
					<path
						d={lamina}
						transform="translate(0 7)"
						fill="#855b42"
						fill-rule="evenodd"
						stroke="#855b42"
						stroke-width="3"
					/>
					<path
						d={lamina}
						fill={layer.fill}
						fill-rule="evenodd"
						stroke="#bc9774"
						stroke-width="1.4"
						stroke-linejoin="bevel"
					/>
				</g>
			{/each}
		</g>
	</svg>
</div>

<style>
	.motion-world {
		position: fixed;
		inset: 0;
		z-index: 0;
		overflow: hidden;
		pointer-events: none;
		user-select: none;
		contain: strict;
		/* Keep the left reading column completely free of geometry. */
		-webkit-mask-image: linear-gradient(90deg, transparent 34%, #000 56%, #000 100%);
		mask-image: linear-gradient(90deg, transparent 34%, #000 56%, #000 100%);
	}

	.renderer {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.fallback {
		position: absolute;
		width: 57vw;
		height: min(90vh, 900px);
		right: -2vw;
		top: 50%;
		transform: translateY(-50%);
		pointer-events: none;
	}

	.fallback.loaded {
		visibility: hidden;
	}

	@media (max-width: 767px) {
		.motion-world {
			/* A separate lower-field composition: never paint behind hero copy. */
			-webkit-mask-image: linear-gradient(
				180deg,
				transparent 40%,
				#000 61%,
				#000 76%,
				transparent 100%
			);
			mask-image: linear-gradient(180deg, transparent 40%, #000 61%, #000 76%, transparent 100%);
		}

		.fallback {
			width: 112vw;
			height: 60svh;
			right: -6vw;
			top: 68%;
		}
	}
</style>
