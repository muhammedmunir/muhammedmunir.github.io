<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { lang } from '$lib/i18n';
	import { translations } from '$lib/translations';
	import { derived } from 'svelte/store';
	import { playConfirm, playBlip } from '$lib/sound';

	let formData = $state({ name: '', email: '', subject: '', message: '' });
	let botcheck = $state('');
	let submitted = $state(false);
	let submitting = $state(false);
	let errorMsg = $state('');

	const WEB3FORMS_KEY = '2a358a62-7093-4dfa-bb91-1b9fa8957ba2';

	const t = derived(lang, ($l) => translations[$l].contact);

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		gsap.fromTo(
			'.contact-header',
			{ opacity: 0, y: 24 },
			{
				opacity: 1,
				y: 0,
				duration: 0.7,
				ease: 'power3.out',
				scrollTrigger: { trigger: '.contact-header', start: 'top 88%' }
			}
		);

		gsap.fromTo(
			'.contact-info',
			{ opacity: 0, x: -30 },
			{
				opacity: 1,
				x: 0,
				duration: 0.75,
				ease: 'power3.out',
				scrollTrigger: { trigger: '.contact-info', start: 'top 85%' }
			}
		);

		gsap.fromTo(
			'.contact-form-deck',
			{ opacity: 0, x: 30 },
			{
				opacity: 1,
				x: 0,
				duration: 0.75,
				ease: 'power3.out',
				scrollTrigger: { trigger: '.contact-form-deck', start: 'top 85%' }
			}
		);
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		errorMsg = '';

		if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
			errorMsg =
				$lang === 'ms'
					? 'Sila isikan ruangan Nama, E-mel dan Mesej.'
					: 'Please fill in your Name, Email, and Message.';
			return;
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email.trim())) {
			errorMsg =
				$lang === 'ms' ? 'Format alamat e-mel tidak sah.' : 'Invalid email address format.';
			return;
		}

		submitting = true;
		playBlip(750, 0.05);

		try {
			const response = await fetch('https://api.web3forms.com/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
				body: JSON.stringify({
					access_key: WEB3FORMS_KEY,
					subject: `[Sovereign Uplink] ${formData.subject || 'Pertanyaan Kerjaya / Kolaborasi'} — dari ${formData.name}`,
					from_name: formData.name,
					replyto: formData.email,
					message: `
PENGHANTARAN MESEJ DARI SOVEREIGN MISSION CONTROL (muhammedmunir.github.io)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pengirim : ${formData.name}
E-mel    : ${formData.email}
Subjek   : ${formData.subject || 'Tiada Subjek'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Kandungan Mesej:

${formData.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Untuk membalas mesej ini secara terus, reply e-mel ini atau hubungi ${formData.email}.
					`.trim(),
					botcheck: botcheck
				})
			});

			const result = await response.json();

			if (result.success) {
				submitted = true;
				playConfirm();
			} else {
				errorMsg =
					result.message ||
					($lang === 'ms'
						? 'Ralat berlaku semasa penghantaran. Sila cuba lagi atau gunakan WhatsApp.'
						: 'An error occurred during submission. Please try again or reach via WhatsApp.');
			}
		} catch {
			errorMsg =
				$lang === 'ms'
					? 'Tiada sambungan internet atau perkhidmatan tergendala. Sila cuba lagi.'
					: 'Network connection error. Please try again.';
		} finally {
			submitting = false;
		}
	}

	const directChannels = [
		{
			id: 'email',
			code: 'CH-01',
			label: 'DIRECT_EMAIL',
			value: 'muhammed.munir97.mm@gmail.com',
			href: 'mailto:muhammed.munir97.mm@gmail.com',
			icon: '✉️'
		},
		{
			id: 'phone',
			code: 'CH-02',
			label: 'VOICE_&_WHATSAPP',
			value: '+6013-5636124',
			href: 'https://wa.me/60135636124',
			icon: '💬'
		},
		{
			id: 'linkedin',
			code: 'CH-03',
			label: 'LINKEDIN_NETWORK',
			value: 'linkedin.com/in/muhammed-munir',
			href: 'https://www.linkedin.com/in/muhammed-munir-bin-mohd-azmi-9b233b271',
			icon: '💼'
		},
		{
			id: 'github',
			code: 'CH-04',
			label: 'SOURCE_REPOSITORY',
			value: 'github.com/muhammedmunir',
			href: 'https://github.com/muhammedmunir',
			icon: '🐙'
		},
		{
			id: 'location',
			code: 'CH-05',
			label: 'PHYSICAL_ZONE',
			value: 'Puchong / Shah Alam, Selangor',
			href: null,
			icon: '📍'
		}
	];
</script>

<section id="contact" class="contact-section">
	<div class="contact-ambient" aria-hidden="true"></div>

	<div class="section">
		<!-- Section Header -->
		<div class="section-header contact-header">
			<div class="section-label">{$t.label}</div>
			<h2 class="text-gradient">{$t.title}</h2>
			<p class="section-desc">{$t.desc}</p>
			<div class="section-divider"></div>
		</div>

		<div class="contact-grid">
			<!-- LEFT: DIRECT UPLINK CHANNELS & TELEMETRY -->
			<div class="contact-info">
				<div class="info-card card">
					<div class="card-status-bar">
						<span class="status-orb" aria-hidden="true"></span>
						<span class="status-code">COMM_LINK // SECURE_UPLINK</span>
					</div>
					<h3 class="info-title">{$t.intro_title}</h3>
					<p class="info-desc">{$t.intro_desc}</p>
				</div>

				<!-- Channels List -->
				<div class="channels-deck">
					{#each directChannels as ch}
						<div class="channel-card card">
							<div class="ch-icon" aria-hidden="true">{ch.icon}</div>
							<div class="ch-body">
								<div class="ch-top">
									<span class="ch-code">{ch.code}</span>
									<span class="ch-label">{ch.label}</span>
								</div>
								{#if ch.href}
									<a href={ch.href} target="_blank" rel="me noopener noreferrer" class="ch-value">
										{ch.value}
										<svg
											width="12"
											height="12"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2.5"
											aria-hidden="true"
										>
											<line x1="7" y1="17" x2="17" y2="7"></line>
											<polyline points="7 7 17 7 17 17"></polyline>
										</svg>
									</a>
								{:else}
									<span class="ch-value no-link">{ch.value}</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>

				<!-- Availability Badge -->
				<div class="avail-beacon card">
					<div class="avail-beacon-dot" aria-hidden="true"></div>
					<div class="avail-beacon-body">
						<p class="avail-primary">{$t.avail_status}</p>
						<p class="avail-secondary">{$t.avail_sub}</p>
					</div>
				</div>
			</div>

			<!-- RIGHT: SOVEREIGN DIRECT TRANSMISSION FORM -->
			<div class="contact-form-deck card">
				{#if submitted}
					<div class="success-screen">
						<div class="success-halo" aria-hidden="true">
							<svg
								width="36"
								height="36"
								viewBox="0 0 24 24"
								fill="none"
								stroke="#10b981"
								stroke-width="2.5"
							>
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
						</div>
						<h3 class="success-title">{$t.success_title}</h3>
						<p class="success-text">{$t.success_msg}</p>
						<button
							type="button"
							class="btn btn-primary"
							onclick={() => {
								submitted = false;
								formData = { name: '', email: '', subject: '', message: '' };
							}}
						>
							{$t.send_another}
						</button>
					</div>
				{:else}
					<form onsubmit={handleSubmit} id="contact-form" novalidate>
						<!-- Honeypot -->
						<input
							type="checkbox"
							name="botcheck"
							bind:value={botcheck}
							style="display:none !important;"
							tabindex="-1"
							autocomplete="off"
						/>

						<div class="form-deck-head">
							<div class="deck-indicator" aria-hidden="true"></div>
							<div>
								<h3 class="form-deck-title">{$t.form_title}</h3>
								<span class="form-deck-sub">ENCRYPTED TRANSMISSION PROTOCOL</span>
							</div>
						</div>

						<div class="form-split">
							<div class="field-wrap">
								<label for="contact-name" class="field-label">
									<span>01 //</span>
									{$t.name_label}
								</label>
								<input
									type="text"
									id="contact-name"
									class="field-input"
									bind:value={formData.name}
									placeholder={$t.name_placeholder}
									required
									autocomplete="name"
								/>
							</div>

							<div class="field-wrap">
								<label for="contact-email" class="field-label">
									<span>02 //</span>
									{$t.email_label}
								</label>
								<input
									type="email"
									id="contact-email"
									class="field-input"
									bind:value={formData.email}
									placeholder={$t.email_placeholder}
									required
									autocomplete="email"
								/>
							</div>
						</div>

						<div class="field-wrap">
							<label for="contact-subject" class="field-label">
								<span>03 //</span>
								{$t.subject_label}
							</label>
							<input
								type="text"
								id="contact-subject"
								class="field-input"
								bind:value={formData.subject}
								placeholder={$t.subject_placeholder}
								required
							/>
						</div>

						<div class="field-wrap">
							<label for="contact-message" class="field-label">
								<span>04 //</span>
								{$t.msg_label}
							</label>
							<textarea
								id="contact-message"
								class="field-textarea"
								bind:value={formData.message}
								placeholder={$t.msg_placeholder}
								rows="5"
								required
							></textarea>
						</div>

						{#if errorMsg}
							<div class="error-strip" role="alert">
								<span class="err-icon">⚠️</span>
								<span>{errorMsg}</span>
							</div>
						{/if}

						<button type="submit" class="btn btn-primary transmit-btn" disabled={submitting}>
							{#if submitting}
								<span class="loading-spin" aria-hidden="true"></span>
								<span>{$t.sending}</span>
							{:else}
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.2"
									aria-hidden="true"
								>
									<line x1="22" y1="2" x2="11" y2="13"></line>
									<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
								</svg>
								<span>{$t.send_btn}</span>
							{/if}
						</button>
					</form>
				{/if}
			</div>
		</div>
	</div>
</section>

<style>
	.contact-section {
		position: relative;
		background: linear-gradient(180deg, #030712 0%, #070e1c 100%);
		overflow: hidden;
	}

	.contact-ambient {
		position: absolute;
		bottom: -100px;
		left: 50%;
		transform: translateX(-50%);
		width: 800px;
		height: 400px;
		background: radial-gradient(ellipse at center, rgba(56, 189, 248, 0.08) 0%, transparent 70%);
		pointer-events: none;
	}

	.contact-grid {
		display: grid;
		grid-template-columns: 1fr 1.25fr;
		gap: 2.5rem;
		align-items: flex-start;
	}

	/* Left Side */
	.contact-info {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.info-card {
		padding: 1.5rem;
	}
	.card-status-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.68rem;
		color: var(--cyan);
		margin-bottom: 0.85rem;
	}
	.status-orb {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--cyan);
		box-shadow: 0 0 8px var(--cyan);
	}
	.info-title {
		font-family: var(--font-heading);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--white);
		margin-bottom: 0.5rem;
	}
	.info-desc {
		font-size: 0.88rem;
		line-height: 1.65;
		color: var(--text-secondary);
	}

	.channels-deck {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}
	.channel-card {
		padding: 0.85rem 1.15rem;
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	.ch-icon {
		font-size: 1.25rem;
		line-height: 1;
	}
	.ch-body {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}
	.ch-top {
		display: flex;
		align-items: center;
		gap: 0.45rem;
	}
	.ch-code {
		font-family: var(--font-mono);
		font-size: 0.62rem;
		color: var(--cyan);
		font-weight: 700;
	}
	.ch-label {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		color: var(--text-muted);
		letter-spacing: 0.04em;
	}
	.ch-value {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.85rem;
		color: var(--text-primary);
		font-weight: 500;
		word-break: break-all;
		transition: color 0.2s ease;
	}
	.ch-value:hover {
		color: var(--cyan);
	}
	.ch-value.no-link {
		color: var(--text-secondary);
		cursor: default;
	}

	.avail-beacon {
		padding: 1.15rem 1.35rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		background: rgba(16, 185, 129, 0.08);
		border-color: rgba(16, 185, 129, 0.3);
	}
	.avail-beacon-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--emerald);
		box-shadow: 0 0 12px var(--emerald);
		animation: pulse-emerald 2s infinite;
		flex-shrink: 0;
	}
	.avail-primary {
		font-family: var(--font-heading);
		font-size: 0.92rem;
		font-weight: 700;
		color: #34d399;
	}
	.avail-secondary {
		font-size: 0.78rem;
		color: var(--text-secondary);
	}

	/* Right Side Form Deck */
	.contact-form-deck {
		padding: 2.25rem;
		background: rgba(10, 18, 34, 0.85);
		border: 1px solid rgba(56, 189, 248, 0.22);
		border-radius: 18px;
		box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.75);
	}
	.form-deck-head {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding-bottom: 1.25rem;
		margin-bottom: 1.5rem;
		border-bottom: 1px solid rgba(148, 163, 184, 0.12);
	}
	.deck-indicator {
		width: 4px;
		height: 34px;
		background: var(--cyan);
		border-radius: 2px;
		box-shadow: 0 0 10px var(--cyan);
	}
	.form-deck-title {
		font-family: var(--font-heading);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--white);
	}
	.form-deck-sub {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		color: var(--cyan);
		letter-spacing: 0.08em;
	}

	.form-split {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	.field-wrap {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		margin-bottom: 1.25rem;
	}
	.field-label {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 600;
		color: var(--text-secondary);
	}
	.field-label span {
		color: var(--cyan);
	}
	.field-input,
	.field-textarea {
		width: 100%;
		padding: 0.85rem 1rem;
		background: rgba(3, 7, 18, 0.75);
		border: 1px solid rgba(148, 163, 184, 0.16);
		border-radius: 10px;
		color: var(--white);
		font-family: var(--font-body);
		font-size: 0.92rem;
		transition: all 0.25s ease;
		outline: none;
	}
	.field-input:focus,
	.field-textarea:focus {
		border-color: var(--cyan);
		box-shadow:
			0 0 0 3px rgba(56, 189, 248, 0.15),
			0 8px 24px rgba(0, 0, 0, 0.5);
		background: rgba(3, 7, 18, 0.95);
	}
	.field-input::placeholder,
	.field-textarea::placeholder {
		color: var(--text-muted);
	}
	.field-textarea {
		resize: vertical;
		min-height: 120px;
	}

	.error-strip {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.75rem 1rem;
		background: rgba(239, 68, 68, 0.12);
		border: 1px solid rgba(239, 68, 68, 0.35);
		border-radius: 8px;
		color: #fca5a5;
		font-size: 0.84rem;
		margin-bottom: 1.25rem;
	}

	.transmit-btn {
		width: 100%;
		padding: 0.95rem 1.5rem;
		font-size: 0.95rem;
		font-weight: 700;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		border-radius: 10px;
	}
	.transmit-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
	.loading-spin {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(3, 7, 18, 0.3);
		border-top-color: #030712;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Success Screen */
	.success-screen {
		text-align: center;
		padding: 2.5rem 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}
	.success-halo {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: rgba(16, 185, 129, 0.15);
		border: 2px solid rgba(16, 185, 129, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 0 25px rgba(16, 185, 129, 0.2);
	}
	.success-title {
		font-family: var(--font-heading);
		font-size: 1.4rem;
		font-weight: 700;
		color: var(--white);
	}
	.success-text {
		color: var(--text-secondary);
		font-size: 0.92rem;
		line-height: 1.6;
		max-width: 420px;
	}

	@media (max-width: 900px) {
		.contact-grid {
			grid-template-columns: 1fr;
		}
		.form-split {
			grid-template-columns: 1fr;
		}
		.contact-form-deck {
			padding: 1.5rem;
		}
	}
</style>
