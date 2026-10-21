<script lang="ts">
	import { onMount } from 'svelte';
	import { lang } from '$lib/i18n';

	let { active = 0 }: { active?: number } = $props();
	let canvas: HTMLCanvasElement;
	let host: HTMLDivElement;
	let ready = $state(false);
	let paused = $state(false);
	let reduced = $state(false);
	let refresh = $state<(() => void) | undefined>();

	type Point = { x: number; y: number };
	type Branch = { from: Point; bend: Point; to: Point; width: number; color: string };
	const colors = ['#67e8f9', '#b5a1ff', '#67e8f9', '#efd18c'];
	const somas = [
		{ x: 245, y: 170, color: colors[0] },
		{ x: 745, y: 185, color: colors[1] },
		{ x: 260, y: 525, color: colors[2] },
		{ x: 740, y: 520, color: colors[3] },
		{ x: 500, y: 345, color: '#a7f3ed' },
		{ x: 70, y: 355, color: colors[1] },
		{ x: 940, y: 350, color: colors[3] }
	];

	$effect(() => {
		active;
		paused;
		refresh?.();
	});

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		let visible = false;
		let frame = 0;
		let last = 0;
		let time = 0;
		let width = 0;
		let height = 0;
		let seed = 82731;
		const random = () => {
			seed = (seed * 16807) % 2147483647;
			return (seed - 1) / 2147483646;
		};
		const branches: Branch[] = [];
		// Seven fixed somas, five dendrites each, three bifurcation levels: 245 branches.
		function grow(from: Point, angle: number, length: number, depth: number, color: string) {
			const to = { x: from.x + Math.cos(angle) * length, y: from.y + Math.sin(angle) * length };
			const bend = {
				x: (from.x + to.x) / 2 + (random() - 0.5) * length * 0.6,
				y: (from.y + to.y) / 2 + (random() - 0.5) * length * 0.6
			};
			branches.push({ from, bend, to, width: depth * 0.65, color });
			if (depth > 1) {
				grow(to, angle - 0.35 - random() * 0.4, length * 0.58, depth - 1, color);
				grow(to, angle + 0.35 + random() * 0.4, length * 0.62, depth - 1, color);
			}
		}
		for (const soma of somas) {
			for (let arm = 0; arm < 5; arm++) {
				grow(soma, arm * Math.PI * 0.4 + random() * 0.7, 55 + random() * 42, 3, soma.color);
			}
		}
		const axons: Branch[] = somas
			.filter((_, i) => i !== 4)
			.map((soma, i) => ({
				from: soma,
				bend: { x: soma.x * 0.6 + 200, y: 345 + (i % 2 ? 95 : -95) },
				to: somas[4],
				width: 1.8,
				color: soma.color
			}));
		const pointOn = (branch: Branch, p: number): Point => ({
			x: (1 - p) ** 2 * branch.from.x + 2 * (1 - p) * p * branch.bend.x + p ** 2 * branch.to.x,
			y: (1 - p) ** 2 * branch.from.y + 2 * (1 - p) * p * branch.bend.y + p ** 2 * branch.to.y
		});
		function stroke(branch: Branch) {
			if (!ctx) return;
			ctx.beginPath();
			ctx.moveTo(branch.from.x, branch.from.y);
			ctx.quadraticCurveTo(branch.bend.x, branch.bend.y, branch.to.x, branch.to.y);
			ctx.stroke();
		}
		function draw() {
			if (!ctx || !width || !height) return;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.clearRect(0, 0, width, height);
			ctx.scale(width / 1000, height / 700);
			ctx.lineCap = 'round';
			for (const branch of [...branches, ...axons]) {
				ctx.strokeStyle = branch.color;
				ctx.globalAlpha = 0.32;
				ctx.lineWidth = branch.width;
				stroke(branch);
			}
			for (let i = 0; i < axons.length; i++) {
				const branch = axons[i];
				const progress = (time * 0.00012 + i * 0.17) % 1;
				// A short electrical impulse follows the actual axon, never a free particle.
				for (let trail = 0; trail < 9; trail++) {
					const point = pointOn(branch, Math.max(0, progress - trail * 0.009));
					ctx.globalAlpha = (1 - trail / 9) * 0.9;
					ctx.fillStyle = branch.color;
					ctx.beginPath();
					ctx.arc(point.x, point.y, 2.6 - trail * 0.16, 0, Math.PI * 2);
					ctx.fill();
				}
			}
			somas.forEach((soma, i) => {
				const selected = i === active;
				const radius = selected ? 46 : 30;
				const glow = ctx.createRadialGradient(soma.x, soma.y, 0, soma.x, soma.y, radius);
				glow.addColorStop(0, soma.color + 'b0');
				glow.addColorStop(0.25, soma.color + '40');
				glow.addColorStop(1, soma.color + '00');
				ctx.globalAlpha = 1;
				ctx.fillStyle = glow;
				ctx.beginPath();
				ctx.arc(soma.x, soma.y, radius, 0, Math.PI * 2);
				ctx.fill();
				ctx.fillStyle = selected ? '#ffffff' : soma.color;
				ctx.beginPath();
				// Slightly irregular cell body, rather than a particle dot.
				for (let n = 0; n <= 12; n++) {
					const a = (n / 12) * Math.PI * 2;
					const r = (i === 4 ? 9 : 6) + Math.sin(a * 3 + i) * 1.6;
					ctx.lineTo(soma.x + Math.cos(a) * r, soma.y + Math.sin(a) * r);
				}
				ctx.closePath();
				ctx.fill();
			});
		}
		function animate(now: number) {
			frame = 0;
			time += last ? Math.min(now - last, 50) : 0;
			last = now;
			draw();
			frame = requestAnimationFrame(animate);
		}
		function synchronize() {
			cancelAnimationFrame(frame);
			frame = 0;
			last = 0;
			if (!visible || document.hidden) return;
			draw();
			if (!paused && !reduced) frame = requestAnimationFrame(animate);
		}
		function resize() {
			const bounds = host.getBoundingClientRect();
			width = bounds.width;
			height = bounds.height;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			synchronize();
		}
		const motionChange = () => {
			reduced = media.matches;
			synchronize();
		};
		motionChange();
		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(host);
		const intersectionObserver = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
			synchronize();
		});
		intersectionObserver.observe(host);
		document.addEventListener('visibilitychange', synchronize);
		media.addEventListener('change', motionChange);
		refresh = synchronize;
		resize();
		ready = true;
		return () => {
			cancelAnimationFrame(frame);
			resizeObserver.disconnect();
			intersectionObserver.disconnect();
			document.removeEventListener('visibilitychange', synchronize);
			media.removeEventListener('change', motionChange);
			refresh = undefined;
		};
	});
</script>

<div class="cortex" bind:this={host}>
	<svg
		class="fallback"
		class:concealed={ready}
		viewBox="0 0 1000 700"
		preserveAspectRatio="none"
		aria-hidden="true"
	>
		<g fill="none" stroke="#67e8f9" stroke-width="1.5" opacity="0.5">
			<path
				d="M245 170 Q420 140 500 345 Q580 180 745 185 M260 525 Q470 570 500 345 Q650 420 740 520 M70 355 Q270 270 500 345 Q780 430 940 350"
			/>
			{#each somas as soma}
				<path
					stroke={soma.color}
					d={`M${soma.x - 85} ${soma.y - 60} l45 15 40 45 -60 30 -35 -10 M${soma.x} ${soma.y} l35 -65 -5 -30 m5 30 35 -10 M${soma.x} ${soma.y} l45 65 40 10 m-40 -10 -10 30`}
				/>
				<circle cx={soma.x} cy={soma.y} r="7" fill={soma.color} />
			{/each}
		</g>
	</svg>
	<canvas bind:this={canvas} aria-hidden="true"></canvas>
	<div class="motion-control">
		{#if reduced}
			<span
				>{$lang === 'ms'
					? 'Gerakan dikurangkan · peta statik'
					: 'Reduced motion · static map'}</span
			>
		{:else if ready}
			<button type="button" aria-pressed={paused} onclick={() => (paused = !paused)}>
				<span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span>
				{$lang === 'ms'
					? paused
						? 'Sambung denyutan'
						: 'Jeda denyutan'
					: paused
						? 'Resume pulses'
						: 'Pause pulses'}
			</button>
		{/if}
	</div>
</div>

<style>
	.cortex {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	canvas,
	.fallback {
		position: absolute;
		width: 100%;
		height: 100%;
	}
	.concealed {
		visibility: hidden;
	}
	.motion-control {
		z-index: 5;
		position: absolute;
		bottom: 0.5rem;
		right: 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: #c1cfdf;
	}
	button {
		pointer-events: auto;
		min-height: 44px;
		padding: 0.4rem 0.65rem;
		border: 1px solid #34465c;
		border-radius: 6px;
		background: #080f1e;
		color: #d6e6f3;
		font: inherit;
		cursor: pointer;
	}
	button:hover {
		border-color: var(--cyan);
	}
</style>
