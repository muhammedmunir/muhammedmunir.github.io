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

	const colors = ['#38bdf8', '#818cf8', '#00f0ff', '#e2b857'];

	// Strategic soma anchors across the full hero composition (coordinates in 1400x800 space)
	const somas = [
		{ x: 180, y: 160, color: colors[0], radius: 10, label: 'CORE' },
		{ x: 520, y: 120, color: colors[1], radius: 8, label: 'AI' },
		{ x: 260, y: 640, color: colors[2], radius: 9, label: 'INFRA' },
		{ x: 620, y: 660, color: colors[3], radius: 8, label: 'SEC' },
		{ x: 920, y: 220, color: colors[0], radius: 11, label: 'NODE-1' },
		{ x: 1220, y: 240, color: colors[1], radius: 11, label: 'NODE-2' },
		{ x: 940, y: 560, color: colors[2], radius: 11, label: 'NODE-3' },
		{ x: 1240, y: 580, color: colors[3], radius: 11, label: 'NODE-4' },
		{ x: 1080, y: 400, color: '#a5f3fc', radius: 14, label: 'CORTEX-HUB' }
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
		let mouseX = -1000;
		let mouseY = -1000;

		let seed = 91823;
		const random = () => {
			seed = (seed * 16807) % 2147483647;
			return (seed - 1) / 2147483646;
		};

		const branches: Branch[] = [];

		// Generate organic dendritic arborization
		function grow(from: Point, angle: number, length: number, depth: number, color: string) {
			const to = { x: from.x + Math.cos(angle) * length, y: from.y + Math.sin(angle) * length };
			const bend = {
				x: (from.x + to.x) / 2 + (random() - 0.5) * length * 0.5,
				y: (from.y + to.y) / 2 + (random() - 0.5) * length * 0.5
			};
			branches.push({ from, bend, to, width: depth * 0.6, color });
			if (depth > 1) {
				grow(to, angle - 0.32 - random() * 0.35, length * 0.6, depth - 1, color);
				grow(to, angle + 0.32 + random() * 0.35, length * 0.6, depth - 1, color);
			}
		}

		for (const soma of somas) {
			for (let arm = 0; arm < 4; arm++) {
				grow(soma, arm * Math.PI * 0.5 + random() * 0.6, 50 + random() * 35, 3, soma.color);
			}
		}

		// Connective Axons bridging the neural cortex
		const axons: Branch[] = [
			// Left cluster to right cluster
			{ from: somas[0], bend: { x: 380, y: 110 }, to: somas[1], width: 1.5, color: colors[0] },
			{ from: somas[1], bend: { x: 740, y: 150 }, to: somas[4], width: 1.8, color: colors[1] },
			{ from: somas[2], bend: { x: 440, y: 680 }, to: somas[3], width: 1.5, color: colors[2] },
			{ from: somas[3], bend: { x: 780, y: 640 }, to: somas[6], width: 1.8, color: colors[3] },
			{ from: somas[0], bend: { x: 190, y: 400 }, to: somas[2], width: 1.5, color: colors[0] },
			// Right synaptic hub connections
			{ from: somas[4], bend: { x: 990, y: 310 }, to: somas[8], width: 2.2, color: colors[0] },
			{ from: somas[5], bend: { x: 1170, y: 320 }, to: somas[8], width: 2.2, color: colors[1] },
			{ from: somas[6], bend: { x: 1000, y: 490 }, to: somas[8], width: 2.2, color: colors[2] },
			{ from: somas[7], bend: { x: 1180, y: 500 }, to: somas[8], width: 2.2, color: colors[3] },
			{ from: somas[4], bend: { x: 1070, y: 210 }, to: somas[5], width: 1.4, color: colors[1] },
			{ from: somas[6], bend: { x: 1090, y: 590 }, to: somas[7], width: 1.4, color: colors[3] }
		];

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

			ctx.save();
			ctx.scale(width / 1400, height / 800);
			ctx.lineCap = 'round';

			// Draw dendritic tree
			for (const branch of branches) {
				ctx.strokeStyle = branch.color;
				ctx.globalAlpha = 0.16;
				ctx.lineWidth = branch.width;
				stroke(branch);
			}

			// Draw primary axon highways
			for (const branch of axons) {
				ctx.strokeStyle = branch.color;
				ctx.globalAlpha = 0.35;
				ctx.lineWidth = branch.width;
				stroke(branch);
			}

			// Draw traveling action potential electrical pulses
			for (let i = 0; i < axons.length; i++) {
				const branch = axons[i];
				const speed = 0.00015;
				const progress = (time * speed + i * 0.14) % 1;

				for (let trail = 0; trail < 8; trail++) {
					const tPos = Math.max(0, progress - trail * 0.012);
					const pt = pointOn(branch, tPos);
					ctx.globalAlpha = (1 - trail / 8) * 0.85;
					ctx.fillStyle = branch.color;
					ctx.beginPath();
					ctx.arc(pt.x, pt.y, 2.8 - trail * 0.22, 0, Math.PI * 2);
					ctx.fill();
				}
			}

			// Draw somas (cell bodies)
			somas.forEach((soma, i) => {
				const isSelectedNode = i >= 4 && i <= 7 && i - 4 === active;
				const isHub = i === 8;
				const baseRadius = soma.radius;
				const pulseGlow = Math.sin(time * 0.002 + i) * 4;
				const glowRadius = isSelectedNode ? 42 : isHub ? 36 : baseRadius + 18 + pulseGlow;

				// Bioluminescent halo
				const glow = ctx.createRadialGradient(soma.x, soma.y, 0, soma.x, soma.y, glowRadius);
				glow.addColorStop(0, soma.color + (isSelectedNode ? 'cc' : '77'));
				glow.addColorStop(0.35, soma.color + (isSelectedNode ? '44' : '22'));
				glow.addColorStop(1, soma.color + '00');

				ctx.globalAlpha = 1;
				ctx.fillStyle = glow;
				ctx.beginPath();
				ctx.arc(soma.x, soma.y, glowRadius, 0, Math.PI * 2);
				ctx.fill();

				// Soma core
				ctx.fillStyle = isSelectedNode ? '#ffffff' : soma.color;
				ctx.beginPath();
				for (let n = 0; n <= 10; n++) {
					const a = (n / 10) * Math.PI * 2;
					const r = baseRadius + Math.sin(a * 3 + i) * 1.5;
					ctx.lineTo(soma.x + Math.cos(a) * r, soma.y + Math.sin(a) * r);
				}
				ctx.closePath();
				ctx.fill();
			});

			ctx.restore();
		}

		function animate(now: number) {
			frame = 0;
			time += last ? Math.min(now - last, 40) : 0;
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
			if (!host) return;
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

		const handleMouseMove = (e: MouseEvent) => {
			const rect = canvas.getBoundingClientRect();
			mouseX = ((e.clientX - rect.left) / width) * 1400;
			mouseY = ((e.clientY - rect.top) / height) * 800;
		};

		window.addEventListener('mousemove', handleMouseMove, { passive: true });
		document.addEventListener('visibilitychange', synchronize);
		media.addEventListener('change', motionChange);
		refresh = synchronize;
		resize();
		ready = true;

		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('mousemove', handleMouseMove);
			resizeObserver.disconnect();
			intersectionObserver.disconnect();
			document.removeEventListener('visibilitychange', synchronize);
			media.removeEventListener('change', motionChange);
			refresh = undefined;
		};
	});
</script>

<div class="cortex-canvas-host" bind:this={host}>
	<canvas bind:this={canvas} aria-hidden="true"></canvas>
	<div class="cortex-motion-badge">
		{#if reduced}
			<span class="motion-status"
				>{$lang === 'ms' ? 'PETA NEURAL STATIK' : 'STATIC NEURAL MAP'}</span
			>
		{:else if ready}
			<button
				type="button"
				class="pulse-toggle-btn"
				aria-pressed={paused}
				onclick={() => (paused = !paused)}
				title={$lang === 'ms' ? 'Kawal Animasi Denyutan' : 'Toggle Pulse Animation'}
			>
				<span class="btn-icon" aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span>
				<span>{$lang === 'ms' ? (paused ? 'Sambung' : 'Jeda') : paused ? 'Resume' : 'Pause'}</span>
			</button>
		{/if}
	</div>
</div>

<style>
	.cortex-canvas-host {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 0;
		overflow: hidden;
	}
	canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
	}
	.cortex-motion-badge {
		position: absolute;
		bottom: 1rem;
		right: 1.5rem;
		z-index: 10;
		pointer-events: auto;
		font-family: var(--font-mono);
		font-size: 0.68rem;
		letter-spacing: 0.05em;
	}
	.pulse-toggle-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.35rem 0.65rem;
		min-height: 36px;
		background: rgba(7, 13, 25, 0.85);
		border: 1px solid rgba(56, 189, 248, 0.25);
		border-radius: 6px;
		color: var(--text-secondary);
		cursor: pointer;
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		transition: all 0.2s ease;
	}
	.pulse-toggle-btn:hover {
		border-color: var(--cyan);
		color: var(--white);
		box-shadow: 0 0 14px rgba(56, 189, 248, 0.2);
	}
	.btn-icon {
		color: var(--cyan);
		font-weight: bold;
	}
	.motion-status {
		color: var(--text-muted);
		background: rgba(7, 13, 25, 0.7);
		padding: 0.3rem 0.6rem;
		border-radius: 4px;
		border: 1px solid rgba(148, 163, 184, 0.15);
	}
</style>
