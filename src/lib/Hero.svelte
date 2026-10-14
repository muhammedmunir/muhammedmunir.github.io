<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { lang } from '$lib/i18n';
	import { translations } from '$lib/translations';
	import { derived } from 'svelte/store';
	import { playBlip, playConfirm } from '$lib/sound';

	let heroRef: HTMLElement;
	let parallaxLayer: HTMLElement;

	const t = derived(lang, ($lang) => translations[$lang].hero);

	onMount(() => {
		const tl = gsap.timeline({ delay: 0.2 });
		tl.fromTo(
			'#hero-telemetry',
			{ opacity: 0, y: -15 },
			{ opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
		)
			.fromTo(
				'#hero-badge',
				{ opacity: 0, y: -20 },
				{ opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
				'-=0.3'
			)
			.fromTo(
				'#hero-heading',
				{ opacity: 0, y: 40 },
				{ opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
				'-=0.4'
			)
			.fromTo(
				'#hero-tagline',
				{ opacity: 0, y: 25 },
				{ opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
				'-=0.5'
			)
			.fromTo(
				'#hero-bio',
				{ opacity: 0, y: 20 },
				{ opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
				'-=0.4'
			)
			.fromTo(
				'#hero-cta',
				{ opacity: 0, y: 20 },
				{ opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
				'-=0.3'
			)
			.fromTo('#hero-scroll', { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.1');

		const handleMouse = (e: MouseEvent) => {
			const xPct = (e.clientX / window.innerWidth - 0.5) * 30;
			const yPct = (e.clientY / window.innerHeight - 0.5) * 20;
			gsap.to(parallaxLayer, { x: xPct, y: yPct, duration: 1.5, ease: 'power1.out' });
		};

		const handleScroll = () => {
			gsap.to('.orb-hero', { y: window.scrollY * 0.3, duration: 0.5, ease: 'none' });
		};

		window.addEventListener('mousemove', handleMouse);
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => {
			window.removeEventListener('mousemove', handleMouse);
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<section id="hero" class="hero-section bg-grid" bind:this={heroRef}>
	<div bind:this={parallaxLayer} class="orb-container" aria-hidden="true">
		<div
			class="orb orb-hero"
			style="width:500px;height:500px;background:radial-gradient(circle,rgba(0,240,255,0.15),transparent);top:-100px;right:-150px;"
		></div>
		<div
			class="orb orb-hero"
			style="width:380px;height:380px;background:radial-gradient(circle,rgba(212,175,55,0.1),transparent);bottom:10%;left:-80px;animation-delay:-4s;"
		></div>
		<div
			class="orb orb-hero"
			style="width:250px;height:250px;background:radial-gradient(circle,rgba(167,139,250,0.08),transparent);top:25%;right:15%;animation-delay:-2s;"
		></div>
	</div>

	<div class="hero-lines" aria-hidden="true">
		<div class="line line-1"></div>
		<div class="line line-2"></div>
	</div>

	<div class="hero-content">
		<!-- Futuristic JARVIS Telemetry HUD Bar -->
		<div id="hero-telemetry" class="hero-telemetry-hud" style="opacity:0">
			<span class="hud-indicator" aria-hidden="true"></span>
			<span class="hud-item"><span class="hud-dim">SYS:</span> OPTIMAL</span>
			<span class="hud-sep">/</span>
			<span class="hud-item"><span class="hud-dim">CLEARANCE:</span> L5</span>
			<span class="hud-sep">/</span>
			<span class="hud-item"><span class="hud-dim">SECURITY:</span> RLS_ACTIVE</span>
			<span class="hud-sep">/</span>
			<span class="hud-item"><span class="hud-dim">LOCATION:</span> PUCHONG, MY</span>
		</div>

		<div id="hero-badge" class="hero-badge" style="opacity:0">
			<span class="badge-dot" aria-hidden="true"></span>
			{$t.badge}
		</div>

		<h1 id="hero-heading" style="opacity:0">
			<span class="name-first">Muhammed Munir</span>
			<span class="name-last text-gradient">Bin Mohd Azmi</span>
		</h1>

		<p id="hero-tagline" class="hero-tagline" style="opacity:0">
			<span>{$t.tagline1}</span>
			<span class="sep" aria-hidden="true">|</span>
			<span>{$t.tagline2}</span>
			<span class="sep" aria-hidden="true">|</span>
			<span>{$t.tagline3}</span>
		</p>

		<p id="hero-bio" class="hero-bio" style="opacity:0">
			{@html $t.bio}
		</p>

		<div id="hero-cta" class="hero-cta" style="opacity:0">
			<!-- J.A.R.V.I.S Neural Assistant Button -->
			<button
				type="button"
				class="btn btn-cyber-jarvis"
				id="cta-jarvis"
				onclick={() => {
					playConfirm();
					window.dispatchEvent(new CustomEvent('open-jarvis'));
				}}
				onmouseenter={() => playBlip(750, 0.03)}
			>
				<span class="jarvis-pulse-orb"></span>
				{$t.cta_jarvis}
			</button>

			<a
				href="#projects"
				class="btn btn-primary"
				id="cta-projects"
				onmouseenter={() => playBlip(550, 0.03)}
			>
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					aria-hidden="true"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" /></svg
				>
				{$t.cta_projects}
			</a>

			<!-- Direct ATS Resume Download Button -->
			<a
				href="/resume.pdf"
				target="_blank"
				rel="noopener noreferrer"
				class="btn btn-cyber-resume"
				id="cta-resume"
				download="Resume_Muhammed_Munir.pdf"
				onmouseenter={() => playBlip(680, 0.03)}
			>
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.2"
					aria-hidden="true"
				>
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
					<polyline points="7 10 12 15 17 10"></polyline>
					<line x1="12" y1="15" x2="12" y2="3"></line>
				</svg>
				{$t.cta_resume}
			</a>

			<a
				href="#contact"
				class="btn btn-outline"
				id="cta-contact"
				onmouseenter={() => playBlip(600, 0.03)}
			>
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					aria-hidden="true"
					><path
						d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
					/><polyline points="22,6 12,13 2,6" /></svg
				>
				{$t.cta_contact}
			</a>
		</div>

		<div id="hero-scroll" class="scroll-hint" style="opacity:0" aria-label={$t.scroll}>
			<div class="scroll-mouse">
				<div class="scroll-dot"></div>
			</div>
			<span>{$t.scroll}</span>
		</div>
	</div>

	<div class="hero-stats">
		{#each [{ num: '4+', key: 'exp' as const }, { num: '19+', key: 'projects' as const }, { num: '18+', key: 'tech' as const }, { num: 'B.Sc.', key: 'degree' as const }] as stat}
			<div class="stat-item">
				<span class="stat-num">{stat.num}</span>
				<span class="stat-label">{$t.stats[stat.key]}</span>
			</div>
		{/each}
	</div>
</section>

<style>
	.hero-section {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
		padding: 8rem 1.5rem 4rem;
		background: linear-gradient(160deg, #07101e 0%, #0d1a2d 50%, #060d18 100%);
	}

	.orb-container {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 0;
	}

	.hero-lines {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 0;
		overflow: hidden;
	}
	.line {
		position: absolute;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(0, 240, 255, 0.06),
			rgba(212, 175, 55, 0.06),
			transparent
		);
		height: 1px;
		width: 100%;
	}
	.line-1 {
		top: 25%;
	}
	.line-2 {
		top: 75%;
		opacity: 0.5;
	}

	.hero-content {
		position: relative;
		z-index: 1;
		text-align: center;
		max-width: 920px;
		margin: 0 auto;
	}

	/* JARVIS Telemetry Strip */
	.hero-telemetry-hud {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: rgba(4, 12, 24, 0.75);
		border: 1px solid rgba(0, 240, 255, 0.25);
		border-radius: 4px;
		padding: 0.35rem 0.85rem;
		font-family: 'Fira Code', monospace;
		font-size: 0.68rem;
		color: #00f0ff;
		letter-spacing: 0.05em;
		margin-bottom: 1.25rem;
		backdrop-filter: blur(10px);
		box-shadow: 0 0 20px rgba(0, 240, 255, 0.12);
	}
	.hud-indicator {
		width: 6px;
		height: 6px;
		background: #00f0ff;
		border-radius: 50%;
		box-shadow: 0 0 8px #00f0ff;
		animation: blinkGlow 1.8s infinite;
	}
	@keyframes blinkGlow {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
	}
	.hud-dim {
		color: #587595;
	}
	.hud-sep {
		color: rgba(255, 255, 255, 0.15);
	}

	.hero-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		background: rgba(212, 175, 55, 0.08);
		border: 1px solid rgba(212, 175, 55, 0.25);
		border-radius: 100px;
		padding: 0.45rem 1.2rem;
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--gold);
		letter-spacing: 0.05em;
		margin-bottom: 1.75rem;
	}
	.badge-dot {
		width: 8px;
		height: 8px;
		background: #22c55e;
		border-radius: 50%;
		animation: pulse-dot 2s infinite;
	}
	@keyframes pulse-dot {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
		}
		50% {
			box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
		}
	}

	h1 {
		margin-bottom: 1.25rem;
		letter-spacing: -0.02em;
	}
	.name-first {
		color: var(--text-primary);
		display: block;
		font-size: clamp(2.2rem, 5.5vw, 4.2rem);
	}
	.name-last {
		display: block;
		font-style: italic;
		font-size: clamp(2.4rem, 6vw, 4.6rem);
	}

	.hero-tagline {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.5rem;
		font-size: clamp(0.9rem, 2.5vw, 1.05rem);
		font-weight: 600;
		color: var(--text-secondary);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		margin-bottom: 1.85rem;
	}
	.sep {
		color: var(--gold);
		opacity: 0.5;
	}

	.hero-bio {
		font-size: clamp(1rem, 2vw, 1.12rem);
		color: var(--text-secondary);
		max-width: 720px;
		margin: 0 auto 2.5rem;
		line-height: 1.85;
	}
	:global(.hero-bio .highlight) {
		color: var(--text-primary);
		font-weight: 600;
		background: rgba(255, 255, 255, 0.06);
		padding: 0.15rem 0.45rem;
		border-radius: 4px;
		border-bottom: 1px solid rgba(212, 175, 55, 0.3);
	}

	.hero-cta {
		display: flex;
		gap: 0.9rem;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		margin-bottom: 3.5rem;
	}

	/* Cyber Resume Button */
	.btn-cyber-resume {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(0, 140, 255, 0.1));
		border: 1px solid #00f0ff;
		color: #00f0ff;
		padding: 0.85rem 1.8rem;
		border-radius: 8px;
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 0.95rem;
		cursor: pointer;
		box-shadow: 0 0 20px rgba(0, 240, 255, 0.25);
		transition: all 0.25s ease;
		text-decoration: none;
	}
	.btn-cyber-resume:hover {
		background: #00f0ff;
		color: #020712;
		box-shadow: 0 0 35px rgba(0, 240, 255, 0.6);
		transform: translateY(-2px);
	}

	/* Cyber JARVIS Button */
	.btn-cyber-jarvis {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(14, 165, 233, 0.08));
		border: 1.5px solid #38bdf8;
		color: #f0f9ff;
		padding: 0.85rem 1.8rem;
		border-radius: 8px;
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 0.95rem;
		cursor: pointer;
		box-shadow: 0 0 25px rgba(56, 189, 248, 0.35);
		transition: all 0.25s ease;
		outline: none;
	}
	.btn-cyber-jarvis:hover {
		background: #38bdf8;
		color: #030712;
		box-shadow: 0 0 40px rgba(56, 189, 248, 0.8);
		transform: translateY(-2px);
	}
	.jarvis-pulse-orb {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #00f0ff;
		box-shadow: 0 0 10px #00f0ff;
		animation: orbBlink 1.5s infinite alternate;
	}
	@keyframes orbBlink {
		from {
			opacity: 0.4;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: scale(1.2);
		}
	}

	.scroll-hint {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.78rem;
		color: var(--text-muted);
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.scroll-mouse {
		width: 24px;
		height: 38px;
		border: 2px solid rgba(212, 175, 55, 0.4);
		border-radius: 12px;
		display: flex;
		justify-content: center;
		padding-top: 6px;
	}
	.scroll-dot {
		width: 4px;
		height: 8px;
		background: var(--gold);
		border-radius: 2px;
		animation: scroll-bounce 2s ease-in-out infinite;
	}
	@keyframes scroll-bounce {
		0%,
		100% {
			transform: translateY(0);
			opacity: 1;
		}
		50% {
			transform: translateY(10px);
			opacity: 0.3;
		}
	}

	.hero-stats {
		position: relative;
		z-index: 1;
		display: flex;
		gap: 0;
		border: 1px solid var(--card-border);
		border-radius: var(--radius-lg);
		background: var(--card-bg);
		backdrop-filter: blur(20px);
		overflow: hidden;
		margin-top: 3rem;
		width: 100%;
		max-width: 760px;
	}
	.stat-item {
		flex: 1;
		text-align: center;
		padding: 1.5rem 1rem;
		border-right: 1px solid var(--card-border);
		transition: var(--transition);
	}
	.stat-item:last-child {
		border-right: none;
	}
	.stat-item:hover {
		background: rgba(212, 175, 55, 0.06);
	}
	.stat-num {
		display: block;
		font-family: var(--font-heading);
		font-size: 1.8rem;
		font-weight: 900;
		color: var(--gold);
		line-height: 1;
		margin-bottom: 0.35rem;
	}
	.stat-label {
		font-size: 0.73rem;
		font-weight: 500;
		color: var(--text-muted);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	@media (max-width: 640px) {
		.hero-telemetry-hud {
			font-size: 0.6rem;
			flex-wrap: wrap;
			justify-content: center;
		}
		.hero-stats {
			flex-wrap: wrap;
			max-width: 100%;
		}
		.stat-item {
			min-width: 50%;
			border-right: none;
			border-bottom: 1px solid var(--card-border);
		}
		.stat-item:nth-child(odd) {
			border-right: 1px solid var(--card-border);
		}
		.stat-item:nth-child(3),
		.stat-item:nth-child(4) {
			border-bottom: none;
		}
		.hero-tagline {
			font-size: 0.85rem;
			gap: 0.3rem;
		}
		.hero-cta {
			flex-direction: column;
			width: 100%;
		}
		.hero-cta .btn {
			width: 100%;
			justify-content: center;
		}
	}
</style>
