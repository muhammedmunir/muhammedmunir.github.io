<script lang="ts">
	import './layout.css';
	import { page } from '$app/state';
	import { tick, type Snippet } from 'svelte';
	import { lang, toggleLang } from '$lib/i18n';
	import { translations } from '$lib/translations';
	import JarvisHUD from '$lib/JarvisHUD.svelte';
	import { acquireScrollLock, releaseScrollLock, hasOpenModal } from '$lib/deck/focus-utils';
	let { children }: { children: Snippet } = $props();
	const spatialRoute = $derived(['', '/spatial'].includes(page.url.pathname.replace(/\/$/, '')));
	let menu = $state<HTMLDialogElement>(null!);
	let menuOpen = $state(false);
	let ownsLock = false;
	let activeSection = $state('hero');
	const t = $derived(translations[$lang]);
	const copy = (ms: string, en: string) => ($lang === 'ms' ? ms : en);
	const links = [
		{ id: 'hero', key: 'home' as const },
		{ id: 'experience', key: 'experience' as const },
		{ id: 'projects', key: 'projects' as const },
		{ id: 'skills', key: 'skills' as const },
		{ id: 'contact', key: 'contact' as const }
	];
	function finishMenu(restore = true) {
		menuOpen = false;
		if (ownsLock) {
			releaseScrollLock();
			ownsLock = false;
		}
		if (restore) document.getElementById('mobile-menu-toggle')?.focus({ preventScroll: true });
	}
	function closeMenu() {
		menu?.close();
		finishMenu();
	}
	function menuKeydown(event: KeyboardEvent) {
		if (event.key !== 'Tab') return;
		const controls = Array.from(menu.querySelectorAll<HTMLElement>('button, a[href]'));
		const first = controls[0];
		const last = controls.at(-1);
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last?.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first?.focus();
		}
	}
	function openMenu() {
		if (hasOpenModal()) return;
		menu.showModal();
		acquireScrollLock();
		ownsLock = true;
		menuOpen = true;
		menu.querySelector<HTMLButtonElement>('button')?.focus();
	}
	async function navigate(event: MouseEvent, id: string) {
		if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
		event.preventDefault();
		menu.close();
		finishMenu(false);
		await tick();
		const section = document.getElementById(id);
		const heading = section?.querySelector<HTMLElement>('h1, h2');
		if (heading) {
			const previous = heading.getAttribute('tabindex');
			heading.tabIndex = -1;
			heading.focus({ preventScroll: true });
			heading.addEventListener(
				'blur',
				() => {
					if (previous === null) heading.removeAttribute('tabindex');
					else heading.setAttribute('tabindex', previous);
				},
				{ once: true }
			);
		}
		history.pushState(null, '', `#${id}`);
		section?.scrollIntoView({ behavior: 'instant' });
	}
	function search() {
		window.dispatchEvent(new CustomEvent('open-jarvis'));
	}
	$effect(() => {
		// Re-run on route changes so retained layouts remove editorial listeners too.
		if (spatialRoute) {
			if (menuOpen) closeMenu();
			return;
		}
		const update = () => {
			for (const link of [...links].reverse()) {
				if ((document.getElementById(link.id)?.getBoundingClientRect().top ?? Infinity) <= 200) {
					activeSection = link.id;
					break;
				}
			}
		};
		const media = matchMedia('(min-width: 1100px)');
		const resize = () => {
			if (media.matches && menuOpen) closeMenu();
		};
		window.addEventListener('scroll', update, { passive: true });
		media.addEventListener('change', resize);
		update();
		return () => {
			window.removeEventListener('scroll', update);
			media.removeEventListener('change', resize);
			if (ownsLock) releaseScrollLock();
		};
	});
</script>

<svelte:head
	><link rel="icon" href="/favicon.svg" type="image/svg+xml" /><meta
		name="theme-color"
		content="#f3eee6"
	/></svelte:head
>
{#if spatialRoute}
	{@render children()}
{:else}
	<a class="skip-link" href="#main-content">{copy('Langkau ke kandungan', 'Skip to content')}</a>
	<header class="masthead">
		<nav class="navigation" aria-label={copy('Navigasi utama', 'Main navigation')}>
			<a
				href="#hero"
				class="brand"
				id="nav-logo"
				aria-label={copy(
					'M. Di Sebalik Sistem — Muhammed Munir — Utama',
					'M. Behind the System — Muhammed Munir — Home'
				)}
				><span class="monogram" aria-hidden="true">M.</span><span class="brand-caption"
					>{copy('Di Sebalik Sistem', 'Behind the System')}</span
				></a
			>
			<ul class="nav-links">
				{#each links as link}<li>
						<a
							id="nav-{link.key}"
							href="#{link.id}"
							aria-current={activeSection === link.id ? 'location' : undefined}>{t.nav[link.key]}</a
						>
					</li>{/each}
			</ul>
			<div class="nav-actions">
				<button
					type="button"
					class="search-button"
					onclick={search}
					aria-label={copy(
						'Cari dalam portfolio (Ctrl atau Command K)',
						'Search portfolio (Ctrl or Command K)'
					)}
					><svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						aria-hidden="true"><circle cx="10" cy="10" r="6.5" /><path d="m15 15 6 6" /></svg
					><span>{copy('Cari', 'Search')}</span></button
				>
				<button
					type="button"
					class="language"
					id="lang-toggle-btn"
					onclick={toggleLang}
					aria-label={copy('BM / EN — Switch to English', 'BM / EN — Tukar ke Bahasa Melayu')}
					><span class:chosen={$lang === 'ms'}>BM</span><span aria-hidden="true">/</span><span
						class:chosen={$lang === 'en'}>EN</span
					></button
				>
				<a
					class="resume"
					id="nav-resume-btn"
					href="/resume.pdf"
					download="Resume_Muhammed_Munir.pdf"
					>Resume <span aria-hidden="true">↗</span><span class="sr-only">PDF</span></a
				>
				<button
					id="mobile-menu-toggle"
					type="button"
					class="menu-toggle"
					aria-haspopup="dialog"
					aria-controls="mobile-navigation"
					aria-expanded={menuOpen}
					onclick={openMenu}>{copy('Menu', 'Menu')} <span aria-hidden="true">☰</span></button
				>
			</div>
		</nav>
	</header>
	<dialog
		id="mobile-navigation"
		class="mobile-menu"
		bind:this={menu}
		aria-labelledby="menu-title"
		onkeydown={menuKeydown}
		oncancel={(event) => {
			event.preventDefault();
			closeMenu();
		}}
		onclose={() => {
			if (menuOpen) finishMenu();
		}}
	>
		<div class="menu-heading">
			<h2 id="menu-title">{copy('Jelajahi portfolio', 'Explore the portfolio')}</h2>
			<button type="button" onclick={closeMenu}>{copy('Tutup', 'Close')} ×</button>
		</div>
		<nav aria-label={copy('Navigasi mudah alih', 'Mobile navigation')}>
			<ol>
				{#each links as link, i}<li>
						<a href="#{link.id}" onclick={(event) => navigate(event, link.id)}
							><span>0{i + 1}</span>{t.nav[link.key]}</a
						>
					</li>{/each}
			</ol>
		</nav>
		<a
			class="mobile-resume"
			href="/resume.pdf"
			download="Resume_Muhammed_Munir.pdf"
			onclick={closeMenu}>{copy('Muat turun resume', 'Download resume')} (PDF) ↗</a
		>
	</dialog>
	<main id="main-content" tabindex="-1">{@render children()}</main>
	<JarvisHUD />
	<footer class="footer">
		<div class="footer-inner">
			<div>
				<a class="footer-name" href="#hero">Muhammed Munir<span>.</span></a>
				<p>{t.footer.sub}</p>
			</div>
			<div class="footer-notes">
				<p>Puchong / Shah Alam, Selangor</p>
				<p>© {new Date().getFullYear()} {t.footer.copy}</p>
			</div>
		</div>
	</footer>
{/if}

<style>
	.masthead {
		position: fixed;
		inset: 0 0 auto;
		z-index: 100;
		background: #f3eee6f5;
		border-bottom: 1px solid #c8bfb2;
	}
	.navigation {
		max-width: 1440px;
		margin: auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.4rem;
		min-height: 80px;
		padding: 0.6rem 4vw;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		text-decoration: none;
		min-height: 44px;
		flex-shrink: 0;
	}
	.monogram {
		font:
			400 2.6rem/1 Georgia,
			serif;
		letter-spacing: -0.08em;
		color: #75442b;
	}
	.brand-caption {
		font-size: 0.7rem;
		line-height: 1.3;
		max-width: 6rem;
	}
	.nav-links {
		list-style: none;
		padding: 0;
		display: flex;
		gap: 1.2rem;
	}
	.nav-links a {
		min-height: 44px;
		display: flex;
		align-items: center;
		font-size: 0.8rem;
		text-decoration: none;
		border-bottom: 1px solid transparent;
	}
	.nav-links a:hover,
	.nav-links a[aria-current] {
		color: #75442b;
		border-bottom-color: #75442b;
	}
	.nav-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	button {
		background: transparent;
		border: 0;
		min-height: 44px;
		min-width: 44px;
		padding: 0.5rem;
		font-size: 0.8rem;
	}
	.search-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.language {
		display: flex;
		gap: 0.35rem;
		color: #645a4f;
	}
	.chosen {
		color: #201e1b;
		text-decoration: underline;
		text-underline-offset: 0.3em;
		font-weight: 700;
	}
	.resume {
		min-height: 44px;
		display: flex;
		gap: 0.5rem;
		align-items: center;
		font-size: 0.8rem;
	}
	.menu-toggle {
		display: none;
		gap: 0.6rem;
		align-items: center;
	}
	.mobile-menu {
		width: min(540px, calc(100% - 24px));
		max-width: none;
		max-height: calc(100dvh - 24px);
		margin: auto;
		padding: 1.5rem;
		border: 1px solid #897867;
		background: #f3eee6;
		color: #201e1b;
		overflow-y: auto;
	}
	.mobile-menu::backdrop {
		background: #201e1b99;
	}
	.menu-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		border-bottom: 1px solid #c8bfb2;
		padding-bottom: 1rem;
	}
	.menu-heading h2 {
		font-size: 1.6rem;
	}
	.mobile-menu ol {
		list-style: none;
		padding: 1rem 0;
	}
	.mobile-menu li a {
		display: flex;
		gap: 1.25rem;
		padding-block: 0.75rem;
		text-decoration: none;
		font:
			1.5rem/1.5 Georgia,
			serif;
		min-height: 44px;
	}
	.mobile-menu li span {
		color: #75442b;
		font:
			0.75rem/3 Arial,
			sans-serif;
	}
	.mobile-resume {
		display: flex;
		align-items: center;
		min-height: 44px;
		border-top: 1px solid #c8bfb2;
		padding-top: 1rem;
		font-size: 0.85rem;
	}
	.footer {
		border-top: 1px solid #c8bfb2;
		padding: 2.5rem 4vw;
	}
	.footer-inner {
		max-width: 1320px;
		margin: auto;
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1.5rem;
	}
	.footer-name {
		font:
			1.6rem Georgia,
			serif;
		text-decoration: none;
	}
	.footer-name span {
		color: #75442b;
	}
	.footer p {
		color: #645a4f;
		font-size: 0.75rem;
		margin-top: 0.5rem;
	}
	.footer-notes {
		text-align: right;
	}
	@media (max-width: 1099px) {
		.nav-links,
		.resume {
			display: none;
		}
		.menu-toggle {
			display: flex;
		}
	}
	@media (max-width: 599px) {
		.navigation {
			min-height: 72px;
			padding-inline: 1.25rem;
			gap: 0.5rem;
		}
		.brand-caption,
		.search-button span {
			display: none;
		}
		.nav-actions {
			gap: 0.3rem;
		}
		.footer-notes {
			text-align: left;
		}
		.mobile-menu {
			padding: 1rem;
		}
	}
</style>
