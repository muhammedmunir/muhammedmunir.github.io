<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	type Snippet = import('svelte').Snippet;
	import { lang, toggleLang } from '$lib/i18n';
	import { translations } from '$lib/translations';
	import { derived } from 'svelte/store';
	import JarvisHUD from '$lib/JarvisHUD.svelte';
	import { playBlip, playConfirm, sfxEnabled } from '$lib/sound';

	let { children }: { children: Snippet } = $props();
	let navScrolled = $state(false);
	let mobileOpen = $state(false);
	let activeSection = $state('hero');
	let currentTime = $state('00:00:00 MYT');

	const t = derived(lang, ($lang) => translations[$lang]);

	const navKeys = [
		{ href: '#hero', key: 'home' as const, code: '01' },
		{ href: '#experience', key: 'experience' as const, code: '02' },
		{ href: '#projects', key: 'projects' as const, code: '03' },
		{ href: '#skills', key: 'skills' as const, code: '04' },
		{ href: '#contact', key: 'contact' as const, code: '05' }
	];

	function handleToggleSfx() {
		sfxEnabled.update((val) => {
			const next = !val;
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('jarvis_sfx', String(next));
			}
			return next;
		});
		playBlip(680, 0.03);
	}

	function openCommandDeck() {
		playConfirm();
		window.dispatchEvent(new CustomEvent('open-jarvis'));
	}

	onMount(() => {
		const updateClock = () => {
			const now = new Date();
			const timeStr = now.toLocaleTimeString('en-GB', {
				timeZone: 'Asia/Kuala_Lumpur',
				hour12: false,
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit'
			});
			currentTime = `${timeStr} MYT`;
		};
		updateClock();
		const clockInterval = setInterval(updateClock, 1000);

		const handleScroll = () => {
			navScrolled = window.scrollY > 40;
			const sections = ['hero', 'experience', 'projects', 'skills', 'contact'];
			const scrollPos = window.scrollY + 240;
			for (const sec of sections) {
				const el = document.getElementById(sec);
				if (el) {
					const top = el.offsetTop;
					const height = el.offsetHeight;
					if (scrollPos >= top && scrollPos < top + height) {
						activeSection = sec;
						break;
					}
				}
			}
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && mobileOpen) {
				mobileOpen = false;
				document.getElementById('mobile-menu-toggle')?.focus();
			}
		};
		handleScroll();
		window.addEventListener('keydown', handleEscape);
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => {
			clearInterval(clockInterval);
			window.removeEventListener('keydown', handleEscape);
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<svelte:head>
	<title>Muhammed Munir Bin Mohd Azmi | Full-Stack Software Engineer & Solutions Architect</title>
</svelte:head>

<a class="skip-link" href="#main-content"
	>{$lang === 'ms' ? 'Langkau ke kandungan' : 'Skip to content'}</a
>

<!-- FLOATING TACTICAL COMMAND BAR -->
<header class="nav-wrapper" class:scrolled={navScrolled}>
	<nav class="nav-deck" aria-label="Main navigation">
		<!-- Brand / Node Identity -->
		<a href="#hero" class="nav-brand" id="nav-logo" onmouseenter={() => playBlip(520, 0.03)}>
			<span class="brand-status" aria-hidden="true">
				<span class="brand-dot"></span>
			</span>
			<span class="brand-text">
				<span class="logo-port">MUNIR</span><span class="logo-folio">.SYS</span>
			</span>
			<span class="brand-tag">v4.2</span>
		</a>

		<!-- Center Navigation Links -->
		<ul class="nav-links" role="list">
			{#each navKeys as link}
				{@const isActive = activeSection === link.href.slice(1)}
				<li>
					<a
						href={link.href}
						class="nav-link"
						class:active={isActive}
						aria-current={isActive ? 'location' : undefined}
						id="nav-{link.key}"
						onmouseenter={() => playBlip(620, 0.02)}
					>
						<span class="nav-code">{link.code}</span>
						<span>{$t.nav[link.key]}</span>
					</a>
				</li>
			{/each}
		</ul>

		<!-- Right Tactical Controls -->
		<div class="nav-actions">
			<!-- Command Palette Trigger (J.A.R.V.I.S) -->
			<button
				type="button"
				class="cmd-trigger"
				onclick={openCommandDeck}
				onmouseenter={() => playBlip(740, 0.03)}
				aria-label={$lang === 'ms'
					? 'AI DECK ⌘K — Buka konsol neural'
					: 'AI DECK ⌘K — Open neural console'}
				title="Neural Command Deck (Ctrl+K)"
			>
				<span class="cmd-orb" aria-hidden="true"></span>
				<span class="cmd-label">AI DECK</span>
				<kbd class="cmd-kbd">⌘K</kbd>
			</button>

			<!-- Audio Telemetry Toggle -->
			<button
				type="button"
				class="sfx-toggle"
				class:muted={!$sfxEnabled}
				onclick={handleToggleSfx}
				aria-label={$sfxEnabled ? 'Mute interface audio' : 'Unmute interface audio'}
				title={$sfxEnabled ? 'Audio Telemetry: ON' : 'Audio Telemetry: MUTED'}
			>
				{#if $sfxEnabled}
					<svg
						width="15"
						height="15"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						aria-hidden="true"
					>
						<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
						<path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
						<path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
					</svg>
				{:else}
					<svg
						width="15"
						height="15"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						aria-hidden="true"
					>
						<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
						<line x1="23" y1="9" x2="17" y2="15"></line>
						<line x1="17" y1="9" x2="23" y2="15"></line>
					</svg>
				{/if}
			</button>

			<!-- Bilingual Switcher -->
			<button
				type="button"
				class="lang-toggle"
				id="lang-toggle-btn"
				onclick={() => {
					toggleLang();
					playBlip(750, 0.04);
				}}
				aria-label="BM / EN — Tukar bahasa / Switch language"
				title={$lang === 'ms' ? 'Switch to English' : 'Tukar ke Bahasa Melayu'}
			>
				<span class="lang-opt" class:active={$lang === 'ms'}>BM</span>
				<span class="lang-divider" aria-hidden="true">/</span>
				<span class="lang-opt" class:active={$lang === 'en'}>EN</span>
			</button>

			<!-- Direct Resume Download -->
			<a
				href="/resume.pdf"
				target="_blank"
				rel="noopener noreferrer"
				class="nav-resume"
				id="nav-resume-btn"
				download="Resume_Muhammed_Munir.pdf"
				onmouseenter={() => playBlip(650, 0.03)}
			>
				<svg
					width="14"
					height="14"
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
				<span>{$t.nav.resume}</span>
			</a>

			<!-- Primary Hire CTA -->
			<a
				href="#contact"
				class="btn btn-primary nav-cta"
				id="nav-hire-btn"
				onmouseenter={() => playBlip(800, 0.03)}
			>
				{$t.nav.hire}
			</a>

			<!-- Mobile Menu Trigger -->
			<button
				type="button"
				class="hamburger"
				id="mobile-menu-toggle"
				aria-controls="mobile-navigation"
				class:open={mobileOpen}
				onclick={() => {
					mobileOpen = !mobileOpen;
					playBlip(500, 0.03);
				}}
				aria-label={$lang === 'ms'
					? mobileOpen
						? 'Tutup menu'
						: 'Buka menu'
					: mobileOpen
						? 'Close menu'
						: 'Open menu'}
				aria-expanded={mobileOpen}
			>
				<span></span><span></span><span></span>
			</button>
		</div>
	</nav>

	<!-- Mobile Tactical Drawer -->
	{#if mobileOpen}
		<div
			id="mobile-navigation"
			class="mobile-menu"
			role="navigation"
			aria-label={$lang === 'ms' ? 'Navigasi mudah alih' : 'Mobile navigation'}
		>
			<div class="mobile-telemetry">
				<span class="telemetry-dot"></span>
				<span>MY / {currentTime}</span>
			</div>
			{#each navKeys as link}
				<a href={link.href} class="mobile-nav-link" onclick={() => (mobileOpen = false)}>
					<span class="mobile-code">{link.code}</span>
					<span>{$t.nav[link.key]}</span>
				</a>
			{/each}
			<div class="mobile-menu-divider"></div>
			<button
				type="button"
				class="mobile-nav-link mobile-ai-btn"
				onclick={() => {
					mobileOpen = false;
					openCommandDeck();
				}}
			>
				<span class="mobile-code">AI</span>
				<span>{$lang === 'ms' ? 'Buka Terminal J.A.R.V.I.S' : 'Launch J.A.R.V.I.S Terminal'}</span>
			</button>
			<a
				href="/resume.pdf"
				target="_blank"
				rel="noopener noreferrer"
				class="mobile-nav-link mobile-resume-link"
				download="Resume_Muhammed_Munir.pdf"
				onclick={() => (mobileOpen = false)}
			>
				<span class="mobile-code">CV</span>
				<span>{$lang === 'ms' ? 'Muat Turun Resume (PDF)' : 'Download Resume (PDF)'}</span>
			</a>
			<a
				href="#contact"
				class="btn btn-primary mobile-cta"
				onclick={() => (mobileOpen = false)}
				id="mobile-hire-btn"
			>
				{$t.nav.hire}
			</a>
		</div>
	{/if}
</header>

<main id="main-content" tabindex="-1">
	{@render children()}
</main>

<!-- J.A.R.V.I.S Neural Assistant HUD -->
<JarvisHUD />

<!-- SOVEREIGN TELEMETRY FOOTER -->
<footer class="footer">
	<div class="footer-inner">
		<div class="footer-top">
			<div class="footer-identity">
				<div class="footer-brand-row">
					<span class="brand-dot"></span>
					<p class="footer-name">Muhammed Munir Bin Mohd Azmi</p>
				</div>
				<p class="footer-sub">{$t.footer.sub}</p>
			</div>
			<div class="footer-telemetry">
				<div class="telem-pill">
					<span class="telem-label">LOC</span>
					<span class="telem-val">SHAH ALAM / PUCHONG, MY</span>
				</div>
				<div class="telem-pill">
					<span class="telem-label">CLOCK</span>
					<span class="telem-val">{currentTime}</span>
				</div>
				<div class="telem-pill">
					<span class="telem-label">{$lang === 'ms' ? 'BAHASA' : 'LANGUAGES'}</span>
					<span class="telem-val telem-online">BM / EN</span>
				</div>
			</div>
		</div>
		<div class="footer-divider"></div>
		<div class="footer-bottom">
			<p class="footer-copy">© {new Date().getFullYear()} {$t.footer.copy}</p>
			<p class="footer-arch">SOVEREIGN MISSION CONTROL // SVELTE 5 + GSAP ENGINE</p>
		</div>
	</div>
</footer>

<style>
	.nav-brand {
		min-height: 44px;
	}
	.nav-wrapper {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		padding: 1.1rem 3vw;
		transition: padding 0.35s cubic-bezier(0.16, 1, 0.3, 1);
		pointer-events: none;
	}
	.nav-wrapper.scrolled {
		padding: 0.65rem 3vw;
	}
	.nav-deck {
		pointer-events: auto;
		max-width: 1360px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.65rem 1.15rem;
		background: rgba(7, 13, 25, 0.72);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border: 1px solid rgba(148, 163, 184, 0.14);
		border-radius: 14px;
		box-shadow: 0 12px 36px -8px rgba(0, 0, 0, 0.6);
		transition:
			background 0.35s ease,
			border-color 0.35s ease,
			box-shadow 0.35s ease;
	}
	.nav-wrapper.scrolled .nav-deck {
		background: rgba(3, 7, 18, 0.9);
		border-color: rgba(56, 189, 248, 0.24);
		box-shadow:
			0 16px 40px -8px rgba(0, 0, 0, 0.8),
			0 0 24px rgba(56, 189, 248, 0.08);
	}

	/* Brand */
	.nav-brand {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: 1.05rem;
		letter-spacing: 0.04em;
		flex-shrink: 0;
	}
	.brand-status {
		width: 18px;
		height: 18px;
		border-radius: 6px;
		background: rgba(16, 185, 129, 0.12);
		border: 1px solid rgba(16, 185, 129, 0.35);
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
	.brand-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #10b981;
		box-shadow: 0 0 10px #10b981;
	}
	.logo-port {
		color: var(--white);
	}
	.logo-folio {
		color: var(--cyan);
		font-family: var(--font-mono);
		font-size: 0.9rem;
	}
	.brand-tag {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		color: var(--text-muted);
		background: rgba(148, 163, 184, 0.08);
		border: 1px solid rgba(148, 163, 184, 0.15);
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
	}

	/* Links */
	.nav-links {
		display: flex;
		list-style: none;
		gap: 0.25rem;
		align-items: center;
	}
	.nav-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.45rem 0.8rem;
		font-size: 0.84rem;
		font-weight: 500;
		color: var(--text-secondary);
		border-radius: 8px;
		transition: all 0.25s ease;
		white-space: nowrap;
	}
	.nav-code {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		color: var(--text-muted);
		transition: color 0.25s ease;
	}
	.nav-link:hover,
	.nav-link.active {
		color: var(--white);
		background: rgba(56, 189, 248, 0.08);
	}
	.nav-link:hover .nav-code,
	.nav-link.active .nav-code {
		color: var(--cyan);
	}

	/* Actions */
	.nav-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}
	.cmd-trigger {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		background: rgba(56, 189, 248, 0.07);
		border: 1px solid rgba(56, 189, 248, 0.25);
		color: var(--cyan);
		padding: 0.38rem 0.65rem;
		border-radius: 8px;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 600;
		min-height: 44px;
		min-width: 44px;
		cursor: pointer;
		transition: all 0.25s ease;
	}
	.cmd-trigger:hover {
		background: rgba(56, 189, 248, 0.15);
		border-color: var(--cyan);
		box-shadow: 0 0 18px rgba(56, 189, 248, 0.25);
	}
	.cmd-orb {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--cyan);
		box-shadow: 0 0 8px var(--cyan);
	}
	.cmd-kbd {
		background: rgba(3, 7, 18, 0.7);
		border: 1px solid rgba(148, 163, 184, 0.2);
		border-radius: 4px;
		padding: 0.05rem 0.35rem;
		font-size: 0.65rem;
		color: var(--text-secondary);
	}

	.sfx-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 8px;
		background: rgba(15, 29, 53, 0.55);
		border: 1px solid rgba(148, 163, 184, 0.16);
		color: var(--cyan);
		cursor: pointer;
		transition: all 0.25s ease;
	}
	.sfx-toggle.muted {
		color: var(--text-muted);
	}
	.sfx-toggle:hover {
		border-color: rgba(56, 189, 248, 0.4);
		color: var(--white);
	}

	.lang-toggle {
		min-height: 44px;
		display: inline-flex;
		align-items: center;
		background: rgba(15, 29, 53, 0.55);
		border: 1px solid rgba(148, 163, 184, 0.16);
		border-radius: 8px;
		padding: 0.18rem 0.25rem;
		cursor: pointer;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 600;
	}
	.lang-opt {
		padding: 0.22rem 0.45rem;
		border-radius: 5px;
		color: var(--text-muted);
		transition: all 0.2s ease;
	}
	.lang-opt.active {
		background: rgba(56, 189, 248, 0.16);
		color: var(--cyan);
	}
	.lang-divider {
		color: rgba(148, 163, 184, 0.25);
		font-size: 0.68rem;
	}

	.nav-resume {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.45rem 0.8rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-primary);
		background: rgba(15, 29, 53, 0.65);
		border: 1px solid rgba(148, 163, 184, 0.2);
		border-radius: 8px;
		transition: all 0.25s ease;
	}
	.nav-resume:hover {
		border-color: var(--cyan);
		color: var(--cyan);
		transform: translateY(-1px);
	}

	.nav-cta {
		padding: 0.48rem 1rem;
		font-size: 0.8rem;
		border-radius: 8px;
	}

	/* Hamburger */
	.hamburger {
		display: none;
		flex-direction: column;
		justify-content: center;
		gap: 4px;
		width: 44px;
		height: 44px;
		background: rgba(15, 29, 53, 0.6);
		border: 1px solid rgba(148, 163, 184, 0.2);
		border-radius: 8px;
		cursor: pointer;
		padding: 0 8px;
	}
	.hamburger span {
		display: block;
		height: 1.5px;
		width: 100%;
		background: var(--text-primary);
		transition: all 0.25s ease;
	}
	.hamburger.open span:nth-child(1) {
		transform: translateY(5.5px) rotate(45deg);
	}
	.hamburger.open span:nth-child(2) {
		opacity: 0;
	}
	.hamburger.open span:nth-child(3) {
		transform: translateY(-5.5px) rotate(-45deg);
	}

	/* Mobile Menu */
	.mobile-menu {
		pointer-events: auto;
		margin-top: 0.5rem;
		background: rgba(7, 13, 25, 0.96);
		border: 1px solid rgba(56, 189, 248, 0.22);
		border-radius: 14px;
		padding: 1rem;
		max-height: calc(100dvh - 110px);
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.85);
	}
	.mobile-telemetry {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--emerald);
		padding: 0.35rem 0.6rem 0.65rem;
		border-bottom: 1px solid rgba(148, 163, 184, 0.1);
		margin-bottom: 0.25rem;
	}
	.telemetry-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--emerald);
	}
	.mobile-nav-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.65rem 0.75rem;
		color: var(--text-primary);
		font-size: 0.92rem;
		font-weight: 500;
		border-radius: 8px;
		background: transparent;
		border: none;
		text-align: left;
		cursor: pointer;
	}
	.mobile-nav-link:hover {
		background: rgba(56, 189, 248, 0.1);
		color: var(--cyan);
	}
	.mobile-code {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--cyan);
		min-width: 24px;
	}
	.mobile-menu-divider {
		height: 1px;
		background: rgba(148, 163, 184, 0.12);
		margin: 0.35rem 0;
	}
	.mobile-cta {
		margin-top: 0.5rem;
		justify-content: center;
		width: 100%;
	}

	/* Footer */
	.footer {
		border-top: 1px solid rgba(148, 163, 184, 0.12);
		background: #02050d;
		padding: 3.5rem 6vw 2.5rem;
	}
	.footer-inner {
		max-width: 1280px;
		margin: 0 auto;
	}
	.footer-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 2rem;
		flex-wrap: wrap;
	}
	.footer-brand-row {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		margin-bottom: 0.35rem;
	}
	.footer-name {
		font-family: var(--font-heading);
		font-size: 1.15rem;
		font-weight: 700;
		color: var(--white);
	}
	.footer-sub {
		font-size: 0.88rem;
		color: var(--text-secondary);
	}
	.footer-telemetry {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
	.telem-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem 0.75rem;
		background: rgba(12, 21, 38, 0.8);
		border: 1px solid rgba(148, 163, 184, 0.14);
		border-radius: 6px;
		font-family: var(--font-mono);
		font-size: 0.7rem;
	}
	.telem-label {
		color: var(--text-muted);
	}
	.telem-val {
		color: var(--text-primary);
	}
	.telem-online {
		color: var(--emerald);
	}
	.footer-divider {
		height: 1px;
		background: rgba(148, 163, 184, 0.1);
		margin: 2rem 0 1.5rem;
	}
	.footer-bottom {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}
	.footer-copy {
		font-size: 0.8rem;
		color: var(--text-muted);
	}
	.footer-arch {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--cyan);
		letter-spacing: 0.08em;
		opacity: 0.8;
	}

	@media (max-width: 1080px) {
		.nav-links,
		.nav-cta,
		.nav-resume,
		.cmd-kbd {
			display: none;
		}
		.hamburger {
			display: inline-flex;
		}
	}
	@media (max-width: 380px) {
		.logo-folio {
			display: none;
		}
		.lang-opt {
			padding-inline: 0.3rem;
		}
	}
	@media (max-width: 520px) {
		.nav-deck {
			gap: 0.4rem;
			padding-inline: 0.6rem;
		}
		.nav-actions {
			gap: 0.3rem;
		}
		.brand-status {
			display: none;
		}
		.nav-brand {
			font-size: 0.9rem;
		}
		.logo-folio {
			font-size: 0.75rem;
		}
		.brand-tag,
		.cmd-label {
			display: none;
		}
	}
</style>
