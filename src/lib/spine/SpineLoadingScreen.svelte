<script lang="ts">
	import { onMount } from 'svelte';
	import type { Locale } from './spine-data';

	interface Props {
		progress?: number;
		stageMessage?: string;
		locale?: Locale;
		ready?: boolean;
		onComplete?: () => void;
	}

	let {
		progress = 0,
		stageMessage = '',
		locale = 'ms',
		ready = false,
		onComplete
	}: Props = $props();

	let displayProgress = $state(0);
	let exiting = $state(false);
	let dismissed = $state(false);
	let pulseTether = $state(0);
	let animFrame: number | null = null;

	const stages = $derived.by(() => {
		if (locale === 'ms') {
			return [
				{ threshold: 0, code: 'SYS_INIT', label: 'Memulakan Enjin Grafiks 3D WebGL...' },
				{ threshold: 25, code: 'PBR_CALC', label: 'Menjana Peta Permukaan PBR & Dinamik Marin...' },
				{
					threshold: 50,
					code: 'SOVEREIGN',
					label: 'Mengaktifkan Teras Reaktor & Alur Gentian Optik...'
				},
				{
					threshold: 75,
					code: 'ORBITAL',
					label: 'Membina 6 Pulau Balai Cerap & Pangkalan Sistem...'
				},
				{
					threshold: 92,
					code: 'CYBER_SEC',
					label: 'Menyelaras Protokol Rangkaian UTM & TNB SOC...'
				},
				{
					threshold: 100,
					code: 'ONLINE',
					label: 'Sistem Beroperasi Sepenuhnya · Menuju ke Orbit 360°'
				}
			];
		}
		return [
			{ threshold: 0, code: 'SYS_INIT', label: 'Initializing 3D WebGL Graphics Engine...' },
			{ threshold: 25, code: 'PBR_CALC', label: 'Compiling PBR Surfaces & Ocean Dynamics...' },
			{
				threshold: 50,
				code: 'SOVEREIGN',
				label: 'Powering Sovereign Reactor & Optical Tethers...'
			},
			{ threshold: 75, code: 'ORBITAL', label: 'Assembling 6 Archipelago Stations & Systems...' },
			{
				threshold: 92,
				code: 'CYBER_SEC',
				label: 'Synchronizing UTM & TNB SOC Security Protocols...'
			},
			{ threshold: 100, code: 'ONLINE', label: 'System Fully Operational · Entering 360° Orbit' }
		];
	});

	const currentStage = $derived.by(() => {
		if (stageMessage) {
			return { code: 'STATUS', label: stageMessage };
		}
		for (let i = stages.length - 1; i >= 0; i--) {
			if (displayProgress >= stages[i].threshold) {
				return stages[i];
			}
		}
		return stages[0];
	});

	// Animasi penumpuan peratusan yang lancar (lerp)
	$effect(() => {
		const target = Math.min(100, Math.max(0, progress));
		const step = () => {
			if (displayProgress < target) {
				const diff = target - displayProgress;
				displayProgress = Math.min(target, displayProgress + Math.max(0.4, diff * 0.12));
				animFrame = requestAnimationFrame(step);
			} else if (displayProgress > target) {
				displayProgress = target;
			}
		};
		if (animFrame) cancelAnimationFrame(animFrame);
		animFrame = requestAnimationFrame(step);
	});

	// Pengendalian peralihan penamatan apabila status siap (ready)
	$effect(() => {
		if (ready && displayProgress >= 99 && !exiting && !dismissed) {
			const timer = setTimeout(() => {
				exiting = true;
				const exitTimer = setTimeout(() => {
					dismissed = true;
					onComplete?.();
				}, 680);
				return () => clearTimeout(exitTimer);
			}, 320);
			return () => clearTimeout(timer);
		}
	});

	onMount(() => {
		const interval = setInterval(() => {
			pulseTether = (pulseTether + 1) % 6;
		}, 380);

		return () => {
			if (animFrame) cancelAnimationFrame(animFrame);
			clearInterval(interval);
		};
	});
</script>

{#if !dismissed}
	<aside
		class="spine-loading-curtain"
		class:exiting
		role="status"
		aria-live="polite"
		aria-label={locale === 'ms'
			? 'Memuatkan portfolio 3D Muhammed Munir'
			: 'Loading Muhammed Munir 3D portfolio'}
	>
		<!-- Grid Latar Belakang Siber & Pancaran Radial Ombak Gelap -->
		<div class="backdrop-gradient" aria-hidden="true"></div>
		<div class="cyber-grid-mesh" aria-hidden="true"></div>

		<!-- Pengepala Telemetri Minimalis -->
		<header class="loading-header" aria-hidden="true">
			<div class="brand-badge">
				<div class="brand-monogram">MM</div>
				<div class="brand-meta">
					<span class="brand-kicker">MUHAMMED MUNIR · PORTFOLIO 3D</span>
					<strong class="brand-title">THE LIVING FIBER SPINE</strong>
				</div>
			</div>
			<div class="system-status-indicator">
				<span class="live-dot" class:online={displayProgress >= 95}></span>
				<span class="live-label">
					{displayProgress >= 95
						? locale === 'ms'
							? 'HUBUNGAN STABIL'
							: 'LINK ACTIVE'
						: locale === 'ms'
							? 'MENYELARAS'
							: 'CALIBRATING'}
				</span>
			</div>
		</header>

		<!-- Teras Utama Animasi Reaktor Sovereign 3D (SVG Giroskopik Pantas) -->
		<div class="reactor-stage" aria-hidden="true">
			<div class="reactor-canvas-wrap">
				<!-- Lingkaran Luar Berputar (Orbital Reticle 360°) -->
				<svg class="ring-svg ring-outer" viewBox="0 0 260 260">
					<circle
						cx="130"
						cy="130"
						r="122"
						fill="none"
						stroke="rgba(56, 189, 248, 0.18)"
						stroke-width="1.5"
						stroke-dasharray="4 8"
					/>
					<circle
						cx="130"
						cy="130"
						r="114"
						fill="none"
						stroke="rgba(56, 189, 248, 0.28)"
						stroke-width="1"
					/>
					<!-- 6 Node Stesen Kepulauan Orbital (0°, 60°, 120°, 180°, 240°, 300°) -->
					{#each [0, 60, 120, 180, 240, 300] as deg, i}
						{@const rad = (deg * Math.PI) / 180}
						{@const nx = 130 + Math.sin(rad) * 114}
						{@const ny = 130 - Math.cos(rad) * 114}
						<circle
							cx={nx}
							cy={ny}
							r={pulseTether === i ? '4.8' : '3.2'}
							class="station-node-dot"
							class:active-node={pulseTether === i}
						/>
						<!-- Alur Gentian Optik ke Pusat -->
						<line
							x1="130"
							y1="130"
							x2={nx}
							y2={ny}
							stroke="rgba(56, 189, 248, 0.14)"
							stroke-width="1"
							class:active-tether={pulseTether === i}
						/>
					{/each}
				</svg>

				<!-- Lingkaran Tengah Berputar Lawan Arah (Counter-Rotating Gyro) -->
				<svg class="ring-svg ring-middle" viewBox="0 0 260 260">
					<circle
						cx="130"
						cy="130"
						r="82"
						fill="none"
						stroke="rgba(45, 212, 191, 0.35)"
						stroke-width="1.8"
						stroke-dasharray="24 16 8 16"
					/>
					<circle
						cx="130"
						cy="130"
						r="68"
						fill="none"
						stroke="rgba(245, 158, 11, 0.24)"
						stroke-width="1"
						stroke-dasharray="6 12"
					/>
				</svg>

				<!-- Teras Tenaga Reaktor Tri-Pillar Pusat -->
				<div class="tri-core-emitter">
					<div class="core-glow-sphere"></div>
					<div class="core-tri-geometry">
						<svg class="triangle-svg" viewBox="0 0 80 80">
							<polygon
								points="40,16 64,58 16,58"
								fill="none"
								stroke="rgba(56, 189, 248, 0.85)"
								stroke-width="1.8"
							/>
							<polygon
								points="40,24 58,54 22,54"
								fill="rgba(56, 189, 248, 0.12)"
								stroke="rgba(45, 212, 191, 0.6)"
								stroke-width="1"
							/>
						</svg>
					</div>
				</div>
			</div>

			<!-- Paparan Digital Peratusan -->
			<div class="progress-readout">
				<div class="digital-percent" aria-hidden="true">
					<span class="number">{Math.floor(displayProgress).toString().padStart(2, '0')}</span>
					<span class="unit">%</span>
				</div>
				<div class="telemetry-log">
					<span class="log-badge">[{currentStage.code}]</span>
					<span class="log-text">{currentStage.label}</span>
				</div>
			</div>

			<!-- Bar Kemajuan Ketepatan Berpendar -->
			<div
				class="progress-track"
				role="progressbar"
				aria-valuenow={Math.round(displayProgress)}
				aria-valuemin="0"
				aria-valuemax="100"
			>
				<div class="progress-fill" style="width: {displayProgress}%;">
					<span class="lead-sparkle"></span>
				</div>
			</div>
		</div>

		<!-- Kaki Telemetri Sistem -->
		<footer class="loading-footer" aria-hidden="true">
			<div class="telemetry-cluster">
				<span class="tel-item"><span class="t-kicker">LOC</span> UTM JB · TNB SOC</span>
				<span class="tel-divider">/</span>
				<span class="tel-item"><span class="t-kicker">STACK</span> THREE.JS · SVELTE 5 · GLSL</span>
				<span class="tel-divider">/</span>
				<span class="tel-item"><span class="t-kicker">FPS</span> 60 LOCKED</span>
			</div>
			<div class="security-chip">
				<svg
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
				</svg>
				<span>SEC_CHANNEL_ENC</span>
			</div>
		</footer>
	</aside>
{/if}

<style>
	.spine-loading-curtain {
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		padding: 2.2rem 2.4rem;
		background: #030712;
		color: #f8fafc;
		font-family: var(--font-body, system-ui, -apple-system, sans-serif);
		overflow: hidden;
		user-select: none;
		pointer-events: all;
		transition:
			opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1),
			transform 0.65s cubic-bezier(0.16, 1, 0.3, 1),
			filter 0.65s cubic-bezier(0.16, 1, 0.3, 1);
		will-change: opacity, transform, filter;
	}

	.spine-loading-curtain.exiting {
		opacity: 0;
		transform: scale(1.035);
		filter: blur(10px);
		pointer-events: none;
	}

	/* Latar belakang aurora futuristik & grid gelombang siber */
	.backdrop-gradient {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			circle at 50% 48%,
			rgba(14, 165, 233, 0.16) 0%,
			rgba(13, 148, 136, 0.08) 35%,
			rgba(3, 7, 18, 0.96) 72%,
			#030712 100%
		);
		pointer-events: none;
	}

	.cyber-grid-mesh {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
			linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
		background-size: 48px 48px;
		mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 80%);
		-webkit-mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 80%);
		pointer-events: none;
	}

	/* Pengepala Atas */
	.loading-header {
		position: relative;
		z-index: 10;
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		max-width: 1240px;
	}

	.brand-badge {
		display: flex;
		align-items: center;
		gap: 0.85rem;
	}

	.brand-monogram {
		display: grid;
		place-items: center;
		width: 38px;
		height: 38px;
		border-radius: 9px;
		background: rgba(14, 165, 233, 0.15);
		border: 1px solid rgba(56, 189, 248, 0.35);
		color: #38bdf8;
		font-family: var(--font-mono, monospace);
		font-size: 0.85rem;
		font-weight: 800;
		letter-spacing: 0.05em;
		box-shadow: 0 0 16px rgba(56, 189, 248, 0.2);
	}

	.brand-meta {
		display: flex;
		flex-direction: column;
		gap: 0.12rem;
	}

	.brand-kicker {
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		color: #94a3b8;
		font-family: var(--font-mono, monospace);
	}

	.brand-title {
		font-size: 0.86rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		color: #f1f5f9;
	}

	.system-status-indicator {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.35rem 0.8rem;
		border-radius: 9999px;
		background: rgba(15, 23, 42, 0.65);
		border: 1px solid rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
	}

	.live-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #f59e0b;
		box-shadow: 0 0 10px #f59e0b;
		transition:
			background 0.3s,
			box-shadow 0.3s;
	}

	.live-dot.online {
		background: #2dd4bf;
		box-shadow: 0 0 12px #2dd4bf;
	}

	.live-label {
		font-family: var(--font-mono, monospace);
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		color: #cbd5e1;
	}

	/* Teras Reaktor Pusat */
	.reactor-stage {
		position: relative;
		z-index: 10;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		max-width: 520px;
		padding: 1.5rem 0;
	}

	.reactor-canvas-wrap {
		position: relative;
		width: 250px;
		height: 250px;
		display: grid;
		place-items: center;
		margin-bottom: 2rem;
	}

	.ring-svg {
		position: absolute;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	.ring-outer {
		animation: spinSlow 34s linear infinite;
	}

	.ring-middle {
		animation: spinCounter 22s linear infinite;
	}

	.station-node-dot {
		fill: #38bdf8;
		transition:
			r 0.3s,
			fill 0.3s;
	}

	.station-node-dot.active-node {
		fill: #f59e0b;
		filter: drop-shadow(0 0 6px #f59e0b);
	}

	.active-tether {
		stroke: rgba(245, 158, 11, 0.65) !important;
		stroke-width: 1.6 !important;
		filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.5));
	}

	.tri-core-emitter {
		position: relative;
		display: grid;
		place-items: center;
		width: 80px;
		height: 80px;
	}

	.core-glow-sphere {
		position: absolute;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: radial-gradient(circle, #38bdf8 20%, rgba(45, 212, 191, 0.4) 60%, transparent 85%);
		filter: blur(4px);
		animation: pulseCore 2.4s ease-in-out infinite alternate;
	}

	.core-tri-geometry {
		position: relative;
		width: 70px;
		height: 70px;
		animation: spinTri 14s linear infinite;
	}

	.triangle-svg {
		width: 100%;
		height: 100%;
	}

	/* Angka Peratusan & Status Log */
	.progress-readout {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
		text-align: center;
		margin-bottom: 1.3rem;
	}

	.digital-percent {
		display: flex;
		align-items: baseline;
		font-family: var(--font-mono, monospace);
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.04em;
		color: #ffffff;
		text-shadow: 0 0 24px rgba(56, 189, 248, 0.45);
	}

	.digital-percent .number {
		font-size: 3.4rem;
		font-weight: 800;
		line-height: 1;
	}

	.digital-percent .unit {
		font-size: 1.4rem;
		font-weight: 600;
		color: #38bdf8;
		margin-left: 0.2rem;
	}

	.telemetry-log {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-mono, monospace);
		font-size: 0.8rem;
		color: #94a3b8;
		max-width: 90vw;
	}

	.log-badge {
		color: #38bdf8;
		font-weight: 700;
		font-size: 0.72rem;
		letter-spacing: 0.08em;
	}

	.log-text {
		color: #e2e8f0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Bar Kemajuan */
	.progress-track {
		position: relative;
		width: 100%;
		max-width: 380px;
		height: 4px;
		background: rgba(255, 255, 255, 0.08);
		border-radius: 9999px;
		overflow: visible;
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.6);
	}

	.progress-fill {
		position: relative;
		height: 100%;
		background: linear-gradient(90deg, #0284c7 0%, #38bdf8 50%, #2dd4bf 100%);
		border-radius: 9999px;
		box-shadow: 0 0 12px rgba(56, 189, 248, 0.8);
		transition: width 0.12s linear;
	}

	.lead-sparkle {
		position: absolute;
		right: -4px;
		top: -4px;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: #ffffff;
		box-shadow:
			0 0 14px 4px #38bdf8,
			0 0 6px 1px #2dd4bf;
	}

	/* Kaki Bawah */
	.loading-footer {
		position: relative;
		z-index: 10;
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		max-width: 1240px;
		font-family: var(--font-mono, monospace);
		font-size: 0.7rem;
		color: #64748b;
	}

	.telemetry-cluster {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.t-kicker {
		color: #38bdf8;
		font-weight: 700;
		margin-right: 0.25rem;
	}

	.tel-divider {
		color: rgba(255, 255, 255, 0.15);
	}

	.security-chip {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.28rem 0.65rem;
		border-radius: 6px;
		background: rgba(2, 132, 199, 0.1);
		border: 1px solid rgba(56, 189, 248, 0.22);
		color: #38bdf8;
		font-size: 0.66rem;
		letter-spacing: 0.08em;
	}

	/* Animasi Putaran Berkelajuan Tetap & Halus */
	@keyframes spinSlow {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes spinCounter {
		from {
			transform: rotate(360deg);
		}
		to {
			transform: rotate(0deg);
		}
	}

	@keyframes spinTri {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes pulseCore {
		0% {
			transform: scale(0.85);
			opacity: 0.65;
		}
		100% {
			transform: scale(1.15);
			opacity: 1;
		}
	}

	/* Responsif untuk Skrin Mudah Alih */
	@media (max-width: 640px) {
		.spine-loading-curtain {
			padding: 1.5rem 1.25rem;
		}

		.reactor-canvas-wrap {
			width: 190px;
			height: 190px;
			margin-bottom: 1.4rem;
		}

		.digital-percent .number {
			font-size: 2.6rem;
		}

		.telemetry-log {
			font-size: 0.72rem;
		}

		.telemetry-cluster .tel-divider,
		.telemetry-cluster .tel-item:nth-child(n + 3) {
			display: none;
		}
	}

	/* Kebolehcapaian: Hormati Keutamaan Pengguna Kurang Pergerakan */
	@media (prefers-reduced-motion: reduce) {
		.ring-outer,
		.ring-middle,
		.core-tri-geometry,
		.core-glow-sphere {
			animation: none !important;
		}
		.spine-loading-curtain {
			transition: opacity 0.2s ease !important;
		}
	}
</style>
