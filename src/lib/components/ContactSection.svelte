<script lang="ts">
	import { lang } from '$lib/i18n';
	import { playBlip } from '$lib/sound';

	const email = 'muhammed.munir97.mm@gmail.com';
	let copied = $state(false);

	async function copyEmail() {
		playBlip(960, 0.04);
		try {
			await navigator.clipboard.writeText(email);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2500);
		} catch {
			/* Fallback */
			window.location.href = `mailto:${email}`;
		}
	}
</script>

<section id="contact" class="section contact-section" aria-label="Contact Muhammed Munir">
	<div class="container">
		<div class="contact-card">
			<!-- Header -->
			<div class="contact-header">
				<span class="section-label">
					{$lang === 'ms' ? '05 / Hubungi Saya' : '05 / Get in Touch'}
				</span>
				<h2 class="contact-title">
					{$lang === 'ms'
						? 'Ada projek baharu atau memerlukan jurutera berpengalaman?'
						: 'Have a project in mind or looking for an experienced engineer?'}
				</h2>
				<p class="contact-subtitle">
					{$lang === 'ms'
						? 'Pintu saya sentiasa terbuka untuk membincangkan seni bina sistem, peluang kerjaya kanan, perundingan, atau membina idea hebat bersama-sama.'
						: "I'm always open to discussing system architecture, senior engineering opportunities, consultations, or bringing ambitious digital ideas to life."}
				</p>
			</div>

			<!-- Email Copy Action -->
			<div class="email-action-box">
				<span class="email-address">{email}</span>
				<button type="button" class="copy-btn" onclick={copyEmail} aria-live="polite">
					{#if copied}
						<svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
						</svg>
						<span>{$lang === 'ms' ? 'Berjaya Disalin!' : 'Copied to Clipboard!'}</span>
					{:else}
						<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
							<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
						</svg>
						<span>{$lang === 'ms' ? 'Salin E-mel' : 'Copy Email'}</span>
					{/if}
				</button>
			</div>

			<!-- Direct Channels Grid -->
			<div class="channels-grid">
				<a
					href="mailto:{email}"
					class="channel-item"
					target="_blank"
					rel="noopener noreferrer"
				>
					<span class="channel-icon">✉️</span>
					<div class="channel-info">
						<span class="channel-name">Email Direct</span>
						<span class="channel-val">{email}</span>
					</div>
					<span class="channel-arrow">→</span>
				</a>

				<a
					href="https://www.linkedin.com/in/muhammed-munir-bin-mohd-azmi-9b233b271"
					class="channel-item"
					target="_blank"
					rel="noopener noreferrer"
				>
					<span class="channel-icon">💼</span>
					<div class="channel-info">
						<span class="channel-name">LinkedIn Profile</span>
						<span class="channel-val">Muhammed Munir Bin Mohd Azmi</span>
					</div>
					<span class="channel-arrow">→</span>
				</a>

				<a
					href="https://github.com/muhammedmunir"
					class="channel-item"
					target="_blank"
					rel="noopener noreferrer"
				>
					<span class="channel-icon">🐙</span>
					<div class="channel-info">
						<span class="channel-name">GitHub Repos</span>
						<span class="channel-val">github.com/muhammedmunir</span>
					</div>
					<span class="channel-arrow">→</span>
				</a>

				<a
					href="https://wa.me/60135636124"
					class="channel-item"
					target="_blank"
					rel="noopener noreferrer"
				>
					<span class="channel-icon">💬</span>
					<div class="channel-info">
						<span class="channel-name">WhatsApp Direct</span>
						<span class="channel-val">+60 13-563 6124</span>
					</div>
					<span class="channel-arrow">→</span>
				</a>
			</div>

			<!-- Location & Status Footer -->
			<div class="contact-footer">
				<div class="location-badge">
					<span class="flag-icon">🇲🇾</span>
					<span>Puchong, Selangor, Malaysia (GMT+8)</span>
				</div>
				<div class="status-indicator">
					<span class="pulse-dot"></span>
					<span>{$lang === 'ms' ? 'Sedia untuk perundingan dan tugasan kanan' : 'Available for contracts & senior engineering'}</span>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Page Footer -->
<footer class="main-footer">
	<div class="container footer-container">
		<div class="footer-left">
			<span class="footer-brand">✦ Muhammed Munir</span>
			<span class="footer-tagline">
				{$lang === 'ms'
					? 'Jurutera Perisian Full-Stack & Arkitek Sistem'
					: 'Full-Stack Software Engineer & Solutions Architect'}
			</span>
		</div>

		<div class="footer-right">
			<span class="footer-copy">
				© {new Date().getFullYear()} Muhammed Munir Bin Mohd Azmi. All rights reserved.
			</span>
		</div>
	</div>
</footer>

<style>
	.contact-section {
		background-color: var(--bg);
		border-top: 1px solid var(--surface-border);
		padding-bottom: clamp(4rem, 6vw, 6rem);
	}

	.contact-card {
		padding: clamp(2.5rem, 5vw, 4.5rem);
		border-radius: 1.75rem;
		background: var(--surface);
		border: 1px solid var(--surface-border);
		box-shadow: var(--shadow-md);
		display: flex;
		flex-direction: column;
		gap: clamp(2rem, 3.5vw, 3rem);
	}

	.contact-header {
		max-width: 720px;
	}

	.contact-title {
		font-size: clamp(2.2rem, 4.2vw, 3.6rem);
		line-height: 1.1;
		margin-bottom: 1.25rem;
		letter-spacing: -0.035em;
	}

	.contact-subtitle {
		font-size: clamp(1.05rem, 1.35vw, 1.2rem);
		color: var(--ink-secondary);
		line-height: 1.65;
	}

	/* Email Box */
	.email-action-box {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1.25rem;
		padding: 1.25rem 1.75rem;
		border-radius: 1.25rem;
		background: var(--bg-subtle);
		border: 1px solid var(--surface-border);
	}

	.email-address {
		font-family: var(--font-heading);
		font-size: clamp(1.1rem, 2vw, 1.6rem);
		font-weight: 700;
		color: var(--ink);
		letter-spacing: -0.02em;
		word-break: break-all;
	}

	.copy-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.8rem 1.5rem;
		border-radius: 9999px;
		background: var(--ink);
		color: var(--bg);
		font-size: 0.92rem;
		font-weight: 600;
		transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
		white-space: nowrap;
	}

	.copy-btn:hover {
		background: var(--accent);
		color: #ffffff;
		transform: scale(1.03);
	}

	.btn-icon {
		width: 17px;
		height: 17px;
	}

	/* Channels Grid */
	.channels-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 1rem;
	}

	.channel-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem 1.5rem;
		border-radius: 1rem;
		background: var(--bg);
		border: 1px solid var(--surface-border);
		text-decoration: none;
		transition: all 0.25s ease;
	}

	.channel-item:hover {
		border-color: var(--surface-border-hover);
		transform: translateY(-2px);
		box-shadow: var(--shadow-sm);
	}

	.channel-icon {
		font-size: 1.35rem;
		line-height: 1;
	}

	.channel-info {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		flex: 1;
		min-width: 0;
	}

	.channel-name {
		font-weight: 700;
		font-size: 0.92rem;
		color: var(--ink);
	}

	.channel-val {
		font-size: 0.8rem;
		color: var(--ink-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.channel-arrow {
		font-size: 1.2rem;
		color: var(--ink-muted);
		transition: transform 0.2s ease, color 0.2s ease;
	}

	.channel-item:hover .channel-arrow {
		color: var(--accent);
		transform: translateX(4px);
	}

	/* Footer within Card */
	.contact-footer {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--surface-border);
		font-size: 0.82rem;
		color: var(--ink-secondary);
	}

	.location-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.status-indicator {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.pulse-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #10b981;
		box-shadow: 0 0 8px #10b981;
	}

	/* Main Page Footer */
	.main-footer {
		padding-block: 2.5rem;
		border-top: 1px solid var(--surface-border);
		background: var(--bg);
	}

	.footer-container {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
	}

	.footer-left {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.footer-brand {
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: 1rem;
		color: var(--ink);
	}

	.footer-tagline {
		font-size: 0.82rem;
		color: var(--ink-muted);
	}

	.footer-copy {
		font-size: 0.82rem;
		color: var(--ink-muted);
	}

	@media (max-width: 680px) {
		.email-action-box {
			flex-direction: column;
			align-items: flex-start;
		}

		.copy-btn {
			width: 100%;
			justify-content: center;
		}

		.footer-container {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
