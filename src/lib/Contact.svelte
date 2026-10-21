<script lang="ts">
	import { lang } from '$lib/i18n';
	import { translations } from '$lib/translations';
	import { derived } from 'svelte/store';
	import { playConfirm, playBlip } from '$lib/sound';

	let formData = $state({ name: '', email: '', subject: '', message: '' });
	let botcheck = $state(false);
	let submitted = $state(false);
	let submitting = $state(false);
	let errorMsg = $state('');

	const WEB3FORMS_KEY = '2a358a62-7093-4dfa-bb91-1b9fa8957ba2';

	const t = derived(lang, ($l) => translations[$l].contact);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (submitting) return;
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
					subject: `[Portfolio] ${formData.subject || 'Career / Collaboration'} — ${formData.name}`,
					from_name: formData.name,
					replyto: formData.email,
					message: `
MESEJ DARI PORTFOLIO MUHAMMED MUNIR (muhammedmunir.github.io)
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
					botcheck: Boolean(botcheck)
				})
			});

			const result = await response.json();

			if (response.ok && result.success) {
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
			labelMs: 'E-MEL',
			labelEn: 'EMAIL',
			value: 'muhammed.munir97.mm@gmail.com',
			href: 'mailto:muhammed.munir97.mm@gmail.com',
			icon: '✉️'
		},
		{
			id: 'phone',
			code: 'CH-02',
			labelMs: 'TELEFON & WHATSAPP',
			labelEn: 'PHONE & WHATSAPP',
			value: '+6013-5636124',
			href: 'https://wa.me/60135636124',
			icon: '💬'
		},
		{
			id: 'linkedin',
			code: 'CH-03',
			labelMs: 'LINKEDIN',
			labelEn: 'LINKEDIN',
			value: 'linkedin.com/in/muhammed-munir',
			href: 'https://www.linkedin.com/in/muhammed-munir-bin-mohd-azmi-9b233b271',
			icon: '💼'
		},
		{
			id: 'github',
			code: 'CH-04',
			labelMs: 'GITHUB',
			labelEn: 'GITHUB',
			value: 'github.com/muhammedmunir',
			href: 'https://github.com/muhammedmunir',
			icon: '🐙'
		},
		{
			id: 'location',
			code: 'CH-05',
			labelMs: 'LOKASI',
			labelEn: 'LOCATION',
			value: 'Puchong / Shah Alam, Selangor',
			href: null,
			icon: '📍'
		}
	];
</script>

<section id="contact" class="contact-section">
	<div class="section">
		<!-- Section Header -->
		<div class="section-header contact-header">
			<div class="section-label">{$t.label}</div>
			<h2 class="text-gradient">{$t.title}</h2>
			<p class="section-desc">{$t.desc}</p>
			<svg class="contact-branches" viewBox="0 0 320 42" aria-hidden="true">
				<path d="M0 8H85Q100 8 110 20L120 30H220M100 8H240Q254 8 264 20L276 32H318" />
				<circle cx="220" cy="30" r="2" /><circle cx="318" cy="32" r="2" />
			</svg>
		</div>

		<div class="contact-grid">
			<!-- LEFT: DIRECT UPLINK CHANNELS & TELEMETRY -->
			<div class="contact-info">
				<div class="info-card card">
					<div class="card-status-bar">
						<span class="status-orb" aria-hidden="true"></span>
						<span class="status-code">{$t.channels_label}</span>
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
									<span class="ch-label">{$lang === 'ms' ? ch.labelMs : ch.labelEn}</span>
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
					<div class="success-screen" role="status" aria-live="polite">
						<div class="success-halo" aria-hidden="true">
							<svg
								width="36"
								height="36"
								viewBox="0 0 24 24"
								fill="none"
								stroke="#67e8f9"
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
								botcheck = false;
							}}
						>
							{$t.send_another}
						</button>
					</div>
				{:else}
					<form onsubmit={handleSubmit} id="contact-form" novalidate aria-busy={submitting}>
						<!-- Honeypot -->
						<input
							type="checkbox"
							name="botcheck"
							bind:checked={botcheck}
							style="display:none !important;"
							tabindex="-1"
							autocomplete="off"
						/>

						<div class="form-deck-head">
							<div class="deck-indicator" aria-hidden="true"></div>
							<div>
								<h3 class="form-deck-title">{$t.form_title}</h3>
								<span class="form-deck-sub">{$t.form_sub}</span>
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
		background: linear-gradient(180deg, #050d16 0%, #070e1c 100%);
		overflow: hidden;
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
		box-shadow: none;
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
		box-shadow: none;

		flex-shrink: 0;
	}
	.avail-primary {
		font-family: var(--font-heading);
		font-size: 0.92rem;
		font-weight: 700;
		color: #e4c988;
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
		box-shadow: none;
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
		box-shadow: none;
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
		box-shadow: none;
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
		border-top-color: #050d16;
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
		box-shadow: none;
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
	.contact-section {
		--cyan: #67e8f9;
		--text-muted: #a6b5c6;
		background: #050d16;
	}
	.section-header {
		text-align: left;
		max-width: 760px;
	}
	.section-header h2 {
		background: none;
		-webkit-text-fill-color: currentColor;
		color: #edf3f7;
	}
	.section-label {
		color: #67e8f9;
	}
	.contact-branches {
		width: min(320px, 100%);
		height: 42px;
		margin-top: 1rem;
		stroke: #67e8f970;
		stroke-width: 1;
		fill: #050d16;
	}
	.contact-branches path {
		fill: none;
	}
	.contact-branches circle {
		stroke: #a5b4fc;
	}
	.contact-grid {
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr);
	}
	.contact-info,
	.contact-form-deck {
		min-width: 0;
	}
	.card,
	.card:hover {
		background: #111a23;
		border: 1px solid #ffffff18;
		border-radius: 6px;
		transform: none;
		box-shadow: none;
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
	}
	.info-card,
	.info-card:hover {
		background: transparent;
		border: 0;
		padding: 0 0 0.75rem;
	}
	.channels-deck {
		position: relative;
		border-left: 1px solid #67e8f944;
		padding-left: 1rem;
	}
	.channel-card,
	.channel-card:hover {
		position: relative;
		background: transparent;
		border: 0;
		border-bottom: 1px solid #ffffff18;
		padding: 0.5rem 0;
		border-radius: 0;
	}
	.channel-card::before {
		content: '';
		position: absolute;
		left: -1rem;
		top: 50%;
		width: 0.65rem;
		border-top: 1px solid #67e8f966;
	}
	.ch-value:not(.no-link) {
		min-height: 44px;
	}
	.ch-top {
		flex-wrap: wrap;
	}
	.ch-value {
		overflow-wrap: anywhere;
		word-break: normal;
		line-height: 1.6;
	}
	.ch-value svg {
		flex-shrink: 0;
	}
	.avail-beacon,
	.avail-beacon:hover {
		border-color: #e4c98833;
	}
	.avail-beacon-dot {
		background: #e4c988;
		animation: none;
	}
	.field-input,
	.field-textarea,
	.field-input:focus,
	.field-textarea:focus {
		background: #050d16;
		border-radius: 5px;
	}
	.field-input:focus-visible,
	.field-textarea:focus-visible {
		outline: 2px solid #67e8f9;
		outline-offset: 3px;
	}
	.transmit-btn {
		min-height: 48px;
		background: #67e8f9;
		color: #050d16;
		border: 1px solid #67e8f9;
		box-shadow: none;
	}
	.transmit-btn:hover {
		background: #a5f3fc;
		color: #050d16;
		box-shadow: none;
		transform: none;
	}
	.success-halo {
		border-color: #67e8f966;
		background: #67e8f914;
	}
	@media (max-width: 900px) {
		.contact-grid {
			grid-template-columns: 1fr;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		*,
		*::before,
		*::after {
			animation: none !important;
			transition: none !important;
		}
	}
	.btn,
	.btn:hover {
		box-shadow: none;
		transform: none;
		filter: none;
		min-height: 44px;
	}
</style>
