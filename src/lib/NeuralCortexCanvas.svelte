<script lang="ts">
	import { onMount } from 'svelte';
	import { lang } from '$lib/i18n';
	import { motionPaused } from '$lib/motion';
	import { systemProjects, type SystemProject } from '$lib/system-projects';

	let { project = systemProjects[0] }: { project?: SystemProject } = $props();
	let host: HTMLDivElement;
	let expanded = $state(false);
	let traced = $state(-1);
	let tracing = $state(false);
	let reduced = $state(false);
	let mounted = $state(false);
	let lastKey = '';
	let stopTrace: (() => void) | undefined;
	const layers = $derived(project.layers);

	$effect(() => {
		if (lastKey !== project.key) {
			lastKey = project.key;
			stopTrace?.();
			tracing = false;
			traced = -1;
		}
	});

	// Pause actual in-flight CSS animations/transitions, not just future transitions.
	$effect(() => {
		const paused = $motionPaused;
		// Also catch new transitions requested while the shared preference is paused.
		expanded;
		project.key;
		if (!mounted || !host) return;
		for (const animation of host.getAnimations({ subtree: true })) {
			if (reduced) animation.finish();
			else if (paused) animation.pause();
			else if (animation.playState === 'paused') animation.play();
		}
	});

	onMount(() => {
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => {
			reduced = media.matches;
			if (reduced && tracing) {
				stopTrace?.();
				traced = 3;
				tracing = false;
			}
		};
		sync();
		mounted = true;
		media.addEventListener('change', sync);
		return () => {
			stopTrace?.();
			media.removeEventListener('change', sync);
		};
	});

	function assemble() {
		stopTrace?.();
		tracing = false;
		traced = -1;
		expanded = false;
	}

	function trace() {
		stopTrace?.();
		expanded = true;
		traced = 0;
		if (reduced) {
			traced = 3;
			return;
		}
		tracing = true;
		let elapsed = 0;
		let previous = performance.now();
		let frame = 0;
		const tick = (now: number) => {
			if (!$motionPaused) elapsed += Math.min(now - previous, 80);
			previous = now;
			traced = Math.min(3, Math.floor(elapsed / 650));
			if (elapsed < 2600) frame = requestAnimationFrame(tick);
			else tracing = false;
		};
		frame = requestAnimationFrame(tick);
		stopTrace = () => cancelAnimationFrame(frame);
	}
</script>

<div class="system-model" class:paused={$motionPaused} class:reduced bind:this={host}>
	<div class="model-heading">
		<span>{$lang === 'ms' ? 'Di sebalik sistem' : 'Behind the system'}</span>
		<span class="model-index">{$lang === 'ms' ? 'Model interaktif' : 'Interactive model'}</span>
	</div>
	<figure>
		<div class="object-stage" class:expanded class:tracing style="--material: {project.accent}">
			<svg class="system-object" viewBox="0 0 600 500" width="600" height="500" aria-hidden="true">
				<defs>
					<linearGradient id="system-ivory" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0" stop-color="#fffdf8" /><stop offset="1" stop-color="#d8cfc0" />
					</linearGradient>
					<linearGradient id="system-copper" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0" stop-color="#e7c4aa" /><stop offset="1" stop-color={project.accent} />
					</linearGradient>
					<filter id="system-shadow" x="-50%" y="-50%" width="200%" height="220%">
						<feGaussianBlur stdDeviation="13" />
					</filter>
				</defs>
				<ellipse
					cx="300"
					cy="420"
					rx="159"
					ry="27"
					fill="#201e1b"
					opacity=".14"
					filter="url(#system-shadow)"
				/>
				<path d="M95 389 300 490 505 389" fill="none" stroke="#c5bbae" stroke-width="1" />
				{#each [3, 2, 1, 0] as index}
					{@const layer = layers[index]}
					<g
						class="physical-layer"
						class:highlighted={traced >= index}
						style="transform: translate({300 +
							(expanded ? (index - 1.5) * project.spread : 0)}px, {expanded
							? 136 + index * 79
							: 243 + index * 21}px)"
					>
						<path
							d="M-174 14 0 100 174 14 174 28 0 114 -174 28Z"
							fill={index === 0 ? '#987055' : index === 3 ? '#393630' : '#aea497'}
							stroke="#74685b"
							stroke-width=".8"
						/>
						<path d="M0 100V114" stroke="#74685b" stroke-width="1" />
						<path
							class="layer-top"
							d="M0-72 174 14 0 100 -174 14Z"
							fill={index === 0
								? 'url(#system-copper)'
								: index === 3
									? '#454139'
									: 'url(#system-ivory)'}
							stroke={index === 3 ? '#201e1b' : '#a79580'}
							stroke-width="1"
						/>
						<g
							transform="matrix(.89 .44 -.89 .44 -65 -24)"
							fill={index === 3 ? '#f3eee6' : '#302b25'}
						>
							<text x="0" y="0" font-size="12" font-family="Arial, sans-serif"
								>0{index + 1} / {layer.label[$lang]}</text
							>
							<text x="0" y="27" font-size="18" font-weight="600" font-family="Arial, sans-serif"
								>{layer.technology}</text
							>
						</g>
						{#if index === 0}
							<path
								d="M-101 31-56 53M-87 24-42 46M54-32 94-12 65 2 25-18Z"
								fill="none"
								stroke="#6c4933"
								stroke-width="3"
							/>
						{:else if index === 1}
							<path
								d="M-98 29-65 45-33 29 0 45 31 29"
								fill="none"
								stroke="#8d7560"
								stroke-width="4"
							/>
						{:else if index === 2}
							<path
								d="M-91 27-45 50 2 27M-77 20-31 43 16 20"
								fill="none"
								stroke="#8d7560"
								stroke-width="3"
							/>
						{:else}
							<path
								d="M-83 23-39 45 5 23M-67 15-23 37 21 15"
								fill="none"
								stroke="#ce9473"
								stroke-width="3"
							/>
						{/if}
						<circle
							class="trace-point"
							cx="0"
							cy="92"
							r={traced === index ? 5 : 3}
							fill={traced >= index ? '#663b25' : index === 3 ? '#ce9473' : '#8b7a67'}
						/>
					</g>
				{/each}
				{#if expanded && traced >= 0}
					<polyline
						class="trace-thread"
						points={layers
							.slice(0, traced + 1)
							.map((_, index) => `${300 + (index - 1.5) * project.spread},${228 + index * 79}`)
							.join(' ')}
						fill="none"
						stroke="#75442b"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				{/if}
			</svg>
			<span class="object-name"
				>{project.name}<span>{$lang === 'ms' ? 'Kajian berlapis' : 'A study in layers'}</span></span
			>
		</div>
		<figcaption>
			{$lang === 'ms'
				? 'Rajah ilustratif. Bukan topologi sebenar atau telemetri langsung.'
				: 'Illustrative diagram. Not a verified topology or live telemetry.'}
		</figcaption>
	</figure>
	<div
		class="model-controls"
		role="group"
		aria-label={$lang === 'ms' ? 'Kawalan model sistem' : 'System model controls'}
	>
		<button
			type="button"
			aria-pressed={expanded}
			onclick={() => {
				stopTrace?.();
				tracing = false;
				expanded = !expanded;
				traced = -1;
			}}
		>
			<span aria-hidden="true">{expanded ? '−' : '+'}</span>
			{$lang === 'ms' ? 'Buka lapisan' : 'Open layers'}
		</button>
		<button type="button" onclick={trace} aria-pressed={tracing}
			>{$lang === 'ms' ? 'Jejak laluan' : 'Trace path'}</button
		>
		<button type="button" onclick={assemble}
			>{$lang === 'ms' ? 'Susun semula' : 'Reassemble'}</button
		>
	</div>
	<div class="layer-key">
		<p class="layer-key-heading">
			{$lang === 'ms' ? 'Lapisan & peranan' : 'Layers & responsibilities'}
		</p>
		<ol>
			{#each layers as layer, index}
				<li class:current={traced === index}>
					<span class="layer-number">0{index + 1}</span>
					<div>
						<strong>{layer.label[$lang]} <span>{layer.technology}</span></strong>
						<p>{layer.detail[$lang]}</p>
					</div>
				</li>
			{/each}
		</ol>
	</div>
	<p class="trace-status" role="status">
		{traced >= 0
			? `${$lang === 'ms' ? 'Jejak konseptual' : 'Conceptual trace'}: ${layers[traced].label[$lang]} — ${layers[traced].technology}${!tracing && traced === 3 ? ($lang === 'ms' ? '. Selesai.' : '. Complete.') : ''}`
			: $lang === 'ms'
				? 'Buka lapisan untuk meneroka, atau jejak satu laluan konseptual.'
				: 'Open the layers to explore, or follow a conceptual path.'}
	</p>
</div>

<style>
	.system-model {
		min-width: 0;
		color: #201e1b;
		font-family: Arial, Helvetica, sans-serif;
	}
	p {
		color: #201e1b;
		margin: 0;
	}
	.model-heading {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
		border-bottom: 1px solid #c8bfb2;
		padding-bottom: 0.75rem;
		font-size: 0.9rem;
	}
	.model-heading > span:first-child {
		font-weight: 600;
	}
	.model-index {
		font-size: 0.72rem;
		color: #645a4f;
	}
	figure {
		margin: 0;
	}
	.object-stage {
		position: relative;
		margin: 0 auto;
		max-width: 38rem;
	}
	.system-object {
		display: block;
		width: 100%;
		height: auto;
		max-width: 100%;
	}
	.physical-layer {
		transition: transform 850ms cubic-bezier(0.2, 1.32, 0.35, 1);
	}
	.layer-top {
		transition:
			stroke 280ms cubic-bezier(0.16, 1, 0.3, 1),
			stroke-width 280ms cubic-bezier(0.16, 1, 0.3, 1);
	}
	.highlighted .layer-top {
		stroke: #663b25;
		stroke-width: 2.5;
	}
	.object-name {
		position: absolute;
		left: 0;
		bottom: 1rem;
		font-size: 0.78rem;
		font-weight: 600;
	}
	.object-name span {
		display: block;
		font-size: 0.68rem;
		font-weight: 400;
		color: #645a4f;
	}
	figcaption {
		color: #645a4f;
		font-size: 0.7rem;
		line-height: 1.5;
		margin: 0.25rem 0 0.9rem;
	}
	.model-controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	button {
		min-height: 44px;
		padding: 0.5rem 0.7rem;
		background: transparent;
		color: #201e1b;
		border: 1px solid #897b6b;
		border-radius: 3px;
		font: inherit;
		font-size: 0.75rem;
		cursor: pointer;
		transition:
			transform 160ms cubic-bezier(0.34, 1.56, 0.64, 1),
			background 160ms cubic-bezier(0.16, 1, 0.3, 1);
	}
	button:hover {
		background: #e4dacd;
		box-shadow: inset 0 1px #fffdf8;
	}
	button[aria-pressed='true'] {
		background: #201e1b;
		color: #f3eee6;
		border-color: #201e1b;
	}
	button:active {
		transform: scale(0.97) translateY(1px);
	}
	button:focus-visible {
		outline: 3px solid #75442b;
		outline-offset: 3px;
	}
	button span {
		margin-right: 0.2rem;
	}
	.layer-key {
		margin-top: 1.1rem;
	}
	.layer-key-heading {
		font-size: 0.75rem;
		font-weight: 600;
		margin-bottom: 0.55rem;
	}
	ol {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.65rem 1rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}
	li {
		display: flex;
		align-items: baseline;
		gap: 0.45rem;
		border-top: 1px solid #c8bfb2;
		padding-top: 0.5rem;
	}
	.layer-number {
		font-size: 0.67rem;
		color: #645a4f;
		font-variant-numeric: tabular-nums;
	}
	strong {
		font-size: 0.74rem;
		font-weight: 600;
		display: block;
		line-height: 1.5;
	}
	strong span {
		display: block;
		color: #645a4f;
		font-size: 0.69rem;
		font-weight: 400;
	}
	li p {
		font-size: 0.7rem;
		line-height: 1.5;
		margin-top: 0.15rem;
		color: #645a4f;
	}
	li.current {
		border-color: #75442b;
		border-top-width: 2px;
		padding-top: calc(0.5rem - 1px);
	}
	.trace-status {
		font-size: 0.7rem;
		color: #645a4f;
		line-height: 1.5;
		min-height: 2.2em;
		margin-top: 0.8rem;
	}
	.reduced .physical-layer,
	.reduced button,
	.reduced .layer-top {
		transition: none;
	}
	@media (max-width: 599px) {
		.model-heading {
			font-size: 0.82rem;
		}
		.layer-key {
			margin-top: 0.8rem;
		}
		.trace-status {
			margin-top: 0.5rem;
		}
		.model-index {
			font-size: 0.67rem;
		}
		.object-stage {
			width: min(100%, 19rem);
			margin-block: -0.35rem;
		}
		.object-name {
			bottom: 0.2rem;
			font-size: 0.7rem;
		}
		.object-name span {
			font-size: 0.65rem;
		}
		.model-controls {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr;
		}
		button {
			padding: 0.4rem 0.3rem;
			font-size: 0.69rem;
			line-height: 1.3;
		}
		button span {
			display: none;
		}
		ol {
			gap: 0.55rem 0.7rem;
		}
		li p {
			font-size: 0.68rem;
		}
		figcaption {
			margin-top: 0.6rem;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.physical-layer,
		button,
		.layer-top {
			transition: none;
		}
	}
</style>
