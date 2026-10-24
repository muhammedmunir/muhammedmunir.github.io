<script lang="ts">
	import { lang, toggleLang } from '$lib/i18n';
	import { theme, toggleTheme } from '$lib/theme';
	import { sfxEnabled, toggleSfx, playBlip } from '$lib/sound';
	import { onMount } from 'svelte';

	let scrolled = $state(false);
	let mobileMenuOpen = $state(false);

	onMount(() => {
		const handleScroll = () => {
			scrolled = window.scrollY > 30;
		};
		window.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll();
		return () => window.removeEventListener('scroll', handleScroll);
	});

	function handleAction(callback?: () => void) {
		playBlip(920, 0.03);
		if (callback) callback();
	}

	function closeMobile() {
		mobileMenuOpen = false;
	}
</script>

<header class="navbar-wrapper" class:scrolled>
	<nav class="navbar" aria-label="Main Navigation">
		<!-- Brand Logo -->
		<a href="#hero" class="brand" onclick={() => handleAction(closeMobile)}>
			<span class="brand-glyph">✦</span>
			<span class="brand-name">Munir</span>
			<span class="brand-role">Architect</span>
		</a>

		<!-- Desktop Navigation Links -->
		<div class="nav-links">
			<a href="#projects" class="nav-link" onclick={() => handleAction()}>
				{$lang === 'ms' ? 'Hasil Kerja' : 'Projects'}
			</a>
			<a href="#experience" class="nav-link" onclick={() => handleAction()}>
				{$lang === 'ms' ? 'Pengalaman' : 'Experience'}
			</a>
			<a href="#about" class="nav-link" onclick={() => handleAction()}>
				{$lang === 'ms' ? 'Tentang' : 'About'}
			</a>
			<a href="#contact" class="nav-link" onclick={() => handleAction()}>
				{$lang === 'ms' ? 'Hubungi' : 'Contact'}
			</a>
		</div>

		<!-- Action Controls -->
		<div class="nav-actions">
			<!-- Available Status Chip -->
			<div class="status-chip" title={$lang === 'ms' ? 'Tersedia untuk projek & perundingan' : 'Available for contracts & roles'}>
				<span class="status-pulse"></span>
				<span class="status-text">{$lang === 'ms' ? 'Tersedia' : 'Available'}</span>
			</div>

			<!-- Language Toggle -->
			<button
				type="button"
				class="ctrl-btn"
				onclick={() => handleAction(toggleLang)}
				aria-label={$lang === 'ms' ? 'Tukar ke Bahasa Inggeris' : 'Switch to Malay'}
			>
				<span class="ctrl-label">{$lang === 'ms' ? 'EN' : 'BM'}</span>
			</button>

			<!-- Theme Toggle (Light / Dark) -->
			<button
				type="button"
				class="ctrl-btn theme-toggle"
				onclick={() => handleAction(toggleTheme)}
				aria-label={$theme === 'dark' ? 'Tukar ke Mod Terang' : 'Switch to Dark Mode'}
			>
				{#if $theme === 'dark'}
					<!-- Sun icon for dark mode -->
					<svg class="ctrl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<circle cx="12" cy="12" r="4" />
						<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
					</svg>
				{:else}
					<!-- Moon icon for light mode -->
					<svg class="ctrl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
					</svg>
				{/if}
			</button>

			<!-- Mobile Menu Button -->
			<button
				type="button"
				class="ctrl-btn mobile-menu-btn"
				onclick={() => handleAction(() => (mobileMenuOpen = !mobileMenuOpen))}
				aria-expanded={mobileMenuOpen}
				aria-label="Menu"
			>
				{#if mobileMenuOpen}
					<svg class="ctrl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				{:else}
					<svg class="ctrl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<line x1="4" y1="8" x2="20" y2="8" />
						<line x1="4" y1="16" x2="20" y2="16" />
					</svg>
				{/if}
			</button>
		</div>
	</nav>

	<!-- Mobile Dropdown Menu -->
	{#if mobileMenuOpen}
		<div class="mobile-dropdown" role="menu">
			<a href="#projects" class="mobile-link" onclick={() => handleAction(closeMobile)}>
				{$lang === 'ms' ? 'Hasil Kerja' : 'Projects'}
			</a>
			<a href="#experience" class="mobile-link" onclick={() => handleAction(closeMobile)}>
				{$lang === 'ms' ? 'Pengalaman' : 'Experience'}
			</a>
			<a href="#about" class="mobile-link" onclick={() => handleAction(closeMobile)}>
				{$lang === 'ms' ? 'Tentang' : 'About'}
			</a>
			<a href="#contact" class="mobile-link" onclick={() => handleAction(closeMobile)}>
				{$lang === 'ms' ? 'Hubungi' : 'Contact'}
			</a>
		</div>
	{/if}
</header>

<style>
	.navbar-wrapper {
		position: fixed;
		top: 1.25rem;
		left: 0;
		right: 0;
		z-index: 1000;
		padding-inline: 1.5rem;
		pointer-events: none;
		transition: transform 0.3s ease;
	}

	.navbar {
		max-width: 1080px;
		margin-inline: auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.6rem 0.9rem;
		border-radius: 9999px;
		background: var(--glass);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border: 1px solid var(--glass-border);
		box-shadow: var(--shadow-md);
		pointer-events: auto;
		transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.scrolled .navbar {
		padding: 0.5rem 0.8rem;
		border-color: var(--surface-border-hover);
		box-shadow: var(--shadow-lg);
	}

	/* Brand */
	.brand {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		padding-inline: 0.6rem;
		text-decoration: none;
	}

	.brand-glyph {
		color: var(--accent);
		font-size: 1.1rem;
		line-height: 1;
		transition: transform 0.3s ease;
	}

	.brand:hover .brand-glyph {
		transform: rotate(90deg) scale(1.1);
	}

	.brand-name {
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: 1.1rem;
		letter-spacing: -0.02em;
		color: var(--ink);
	}

	.brand-role {
		font-size: 0.72rem;
		font-weight: 500;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--ink-muted);
		padding: 0.15rem 0.45rem;
		background: var(--surface-border);
		border-radius: 4px;
	}

	/* Nav Links */
	.nav-links {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.nav-link {
		font-size: 0.88rem;
		font-weight: 500;
		color: var(--ink-secondary);
		padding: 0.45rem 0.85rem;
		border-radius: 9999px;
		transition: all 0.2s ease;
	}

	.nav-link:hover {
		color: var(--ink);
		background: var(--surface-border);
	}

	/* Actions */
	.nav-actions {
		display: flex;
		align-items: center;
		gap: 0.45rem;
	}

	.status-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.35rem 0.75rem;
		background: rgba(16, 185, 129, 0.08);
		border: 1px solid rgba(16, 185, 129, 0.22);
		border-radius: 9999px;
		font-size: 0.76rem;
		font-weight: 600;
		color: #10b981;
		margin-right: 0.25rem;
	}

	:root[data-theme="light"] .status-chip {
		background: rgba(5, 150, 105, 0.08);
		border-color: rgba(5, 150, 105, 0.25);
		color: #047857;
	}

	.status-pulse {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: currentColor;
		box-shadow: 0 0 8px currentColor;
		animation: pulse-dot 2s infinite ease-in-out;
	}

	@keyframes pulse-dot {
		0%, 100% {
			transform: scale(0.9);
			opacity: 0.75;
		}
		50% {
			transform: scale(1.25);
			opacity: 1;
		}
	}

	.ctrl-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		color: var(--ink-secondary);
		background: var(--surface-border);
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.ctrl-btn:hover {
		color: var(--ink);
		background: var(--surface-border-hover);
		transform: scale(1.05);
	}

	.ctrl-label {
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.04em;
	}

	.ctrl-icon {
		width: 17px;
		height: 17px;
	}

	.mobile-menu-btn {
		display: none;
	}

	/* Mobile Dropdown */
	.mobile-dropdown {
		max-width: 1080px;
		margin: 0.6rem auto 0;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		border-radius: 1.25rem;
		background: var(--surface);
		border: 1px solid var(--surface-border);
		box-shadow: var(--shadow-lg);
		pointer-events: auto;
		animation: drop-fade 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes drop-fade {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.mobile-link {
		padding: 0.75rem 1rem;
		font-size: 1.05rem;
		font-weight: 600;
		color: var(--ink);
		border-radius: 0.75rem;
		transition: background 0.2s ease;
	}

	.mobile-link:hover {
		background: var(--surface-border);
		color: var(--accent);
	}

	@media (max-width: 820px) {
		.nav-links {
			display: none;
		}
		.mobile-menu-btn {
			display: inline-flex;
		}
		.brand-role {
			display: none;
		}
	}

	@media (max-width: 480px) {
		.status-chip {
			display: none;
		}
		.navbar-wrapper {
			top: 0.8rem;
			padding-inline: 0.8rem;
		}
	}
</style>
