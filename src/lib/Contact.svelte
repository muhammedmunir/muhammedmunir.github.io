<script lang="ts">
	import { lang } from '$lib/i18n';
	import { translations } from '$lib/translations';
	import { derived } from 'svelte/store';
	import { tick } from 'svelte';

	let formData = $state({ name: '', email: '', subject: '', message: '' });
	let botcheck = $state(false);
	let submitted = $state(false);
	let submitting = $state(false);
	let errorMsg = $state('');
	let attempted = $state(false);
	const fieldErrors = $derived({
		name:
			attempted && !formData.name.trim()
				? $lang === 'ms'
					? 'Sila masukkan nama anda.'
					: 'Please enter your name.'
				: '',
		email:
			attempted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
				? $lang === 'ms'
					? 'Sila masukkan alamat e-mel yang sah.'
					: 'Please enter a valid email address.'
				: '',
		message:
			attempted && !formData.message.trim()
				? $lang === 'ms'
					? 'Sila masukkan mesej anda.'
					: 'Please enter your message.'
				: ''
	});
	let resultHeading = $state<HTMLHeadingElement>();
	let nameInput = $state<HTMLInputElement>();

	const WEB3FORMS_KEY = '2a358a62-7093-4dfa-bb91-1b9fa8957ba2';

	const t = derived(lang, ($l) => translations[$l].contact);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (submitting) return;
		errorMsg = '';
		attempted = true;
		const form = e.currentTarget as HTMLFormElement;
		if (fieldErrors.name || fieldErrors.email || fieldErrors.message) {
			errorMsg =
				$lang === 'ms' ? 'Sila semak ruangan yang ditandakan.' : 'Please check the marked fields.';
			await tick();
			form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
			return;
		}

		submitting = true;

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 20000);
		try {
			const response = await fetch('https://api.web3forms.com/submit', {
				method: 'POST',
				signal: controller.signal,
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
				await tick();
				resultHeading?.focus();
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
			clearTimeout(timeout);
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
			href: 'mailto:muhammed.munir97.mm@gmail.com'
		},
		{
			id: 'phone',
			code: 'CH-02',
			labelMs: 'TELEFON & WHATSAPP',
			labelEn: 'PHONE & WHATSAPP',
			value: '+6013-5636124',
			href: 'https://wa.me/60135636124'
		},
		{
			id: 'linkedin',
			code: 'CH-03',
			labelMs: 'LINKEDIN',
			labelEn: 'LINKEDIN',
			value: 'linkedin.com/in/muhammed-munir',
			href: 'https://www.linkedin.com/in/muhammed-munir-bin-mohd-azmi-9b233b271'
		},
		{
			id: 'github',
			code: 'CH-04',
			labelMs: 'GITHUB',
			labelEn: 'GITHUB',
			value: 'github.com/muhammedmunir',
			href: 'https://github.com/muhammedmunir'
		},
		{
			id: 'location',
			code: 'CH-05',
			labelMs: 'LOKASI',
			labelEn: 'LOCATION',
			value: 'Puchong / Shah Alam, Selangor',
			href: null
		}
	];
</script>

<section id="contact" aria-labelledby="contact-title">
	<div class="section">
		<header class="section-header">
			<p class="section-label">{$t.label}</p>
			<h2 id="contact-title">{$t.title}</h2>
			<p class="section-desc">{$t.desc}</p>
		</header>
		<div class="contact-grid">
			<div class="contact-info">
				<h3>{$t.intro_title}</h3>
				<p class="intro">{$t.intro_desc}</p>
				<dl class="channels">
					{#each directChannels as channel}<div>
							<dt>{$lang === 'ms' ? channel.labelMs : channel.labelEn}</dt>
							<dd>
								{#if channel.href}<a
										href={channel.href}
										target={channel.id === 'email' ? undefined : '_blank'}
										rel="me noopener noreferrer"
										>{channel.value}<span aria-hidden="true">↗</span
										>{#if channel.id !== 'email'}<span class="sr-only"
												>{$lang === 'ms' ? '(tab baharu)' : '(new tab)'}</span
											>{/if}</a
									>{:else}<p>{channel.value}</p>{/if}
							</dd>
						</div>{/each}
				</dl>
				<a class="resume-link" href="/resume.pdf" download="Resume_Muhammed_Munir.pdf"
					>{$lang === 'ms' ? 'Muat turun resume' : 'Download resume'} (PDF) ↗</a
				>
			</div>
			<div class="form-sheet">
				<div class="form-status" role="status" aria-live="polite" aria-atomic="true">
					{#if errorMsg}<p class="error">{errorMsg}</p>{:else if submitting}<p>
							{$t.sending}
						</p>{:else if submitted}<p>{$t.success_title}</p>{/if}
				</div>
				{#if submitted}
					<div class="success">
						<p class="form-note">{$lang === 'ms' ? 'Terima kasih' : 'Thank you'}</p>
						<h3 tabindex="-1" bind:this={resultHeading}>{$t.success_title}</h3>
						<p>{$t.success_msg}</p>
						<button
							type="button"
							class="btn btn-primary"
							onclick={async () => {
								submitted = false;
								formData = { name: '', email: '', subject: '', message: '' };
								botcheck = false;
								attempted = false;
								errorMsg = '';
								await tick();
								nameInput?.focus();
							}}>{$t.send_another}</button
						>
					</div>
				{:else}
					<form
						id="contact-form"
						method="POST"
						action="https://api.web3forms.com/submit"
						onsubmit={handleSubmit}
						aria-busy={submitting}
					>
						<input type="hidden" name="access_key" value={WEB3FORMS_KEY} />
						<noscript
							><p class="privacy-note">
								JavaScript is unavailable. This form submits directly to Web3Forms; you can also use
								the email link.
							</p></noscript
						>
						<input
							type="checkbox"
							name="botcheck"
							bind:checked={botcheck}
							hidden
							tabindex="-1"
							autocomplete="off"
							aria-label="Leave empty"
						/>
						<p class="form-note">{$t.form_sub}</p>
						<h3>{$t.form_title}</h3>
						<p class="required-note">
							{$lang === 'ms' ? 'Ruangan bertanda * diperlukan.' : 'Fields marked * are required.'}
						</p>
						<fieldset disabled={submitting}>
							<legend class="sr-only">{$t.form_title}</legend>
							<div class="form-split">
								<div class="field">
									<label for="contact-name">{$t.name_label} *</label><input
										bind:this={nameInput}
										id="contact-name"
										name="name"
										type="text"
										bind:value={formData.name}
										placeholder={$t.name_placeholder}
										autocomplete="name"
										required
										maxlength="160"
										aria-invalid={Boolean(fieldErrors.name)}
										aria-describedby="contact-name-error"
									/>
									<p id="contact-name-error" class="field-error">{fieldErrors.name}</p>
								</div>
								<div class="field">
									<label for="contact-email">{$t.email_label} *</label><input
										id="contact-email"
										name="email"
										type="email"
										bind:value={formData.email}
										placeholder={$t.email_placeholder}
										autocomplete="email"
										required
										maxlength="254"
										aria-invalid={Boolean(fieldErrors.email)}
										aria-describedby="contact-email-error"
									/>
									<p id="contact-email-error" class="field-error">{fieldErrors.email}</p>
								</div>
							</div>
							<div class="field">
								<label for="contact-subject">{$t.subject_label}</label><input
									id="contact-subject"
									name="subject"
									bind:value={formData.subject}
									placeholder={$t.subject_placeholder}
									maxlength="200"
								/>
							</div>
							<div class="field">
								<label for="contact-message">{$t.msg_label} *</label><textarea
									id="contact-message"
									name="message"
									bind:value={formData.message}
									placeholder={$t.msg_placeholder}
									rows="6"
									required
									maxlength="8000"
									aria-invalid={Boolean(fieldErrors.message)}
									aria-describedby="contact-message-error"
								></textarea>
								<p id="contact-message-error" class="field-error">{fieldErrors.message}</p>
							</div>
						</fieldset>
						<button type="submit" class="btn btn-primary send-button" disabled={submitting}
							>{submitting ? $t.sending : $t.send_btn}<span aria-hidden="true">↗</span></button
						>
						<p class="privacy-note">
							{$lang === 'ms'
								? 'Mesej dihantar melalui Web3Forms. Nama, e-mel dan mesej anda digunakan untuk membalas pertanyaan ini. Anda juga boleh menghubungi saya terus melalui e-mel.'
								: 'Messages are sent through Web3Forms. Your name, email and message are used to respond to this enquiry. You can also email me directly.'}
						</p>
					</form>
				{/if}
			</div>
		</div>
	</div>
</section>

<style>
	section {
		background: var(--paper, #121619);
		color: var(--ink, #f4eee3);
		padding: clamp(4rem, 8vw, 8rem) clamp(1.1rem, 4vw, 5rem);
	}
	.section {
		max-width: none;
		padding: 0;
		margin: 0;
	}
	.section-header {
		margin-bottom: 3rem;
		max-width: 65rem;
	}
	.section-label {
		color: var(--copper, #d9a17b);
		font-size: 0.7rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	h2 {
		font-family: Arial, Helvetica, sans-serif;
		font-size: clamp(2.5rem, 5vw, 5.5rem);
		letter-spacing: -0.045em;
		line-height: 1.08;
		font-weight: 500;
		margin: 1.5rem 0;
	}
	h3 {
		font-family: Arial, Helvetica, sans-serif;
		font-size: clamp(1.2rem, 2vw, 1.7rem);
		font-weight: 500;
		letter-spacing: -0.02em;
		line-height: 1.2;
	}
	.section-desc {
		max-width: 58ch;
		color: var(--muted, #c4beb3);
		font-size: 0.95rem;
	}
	a {
		color: inherit;
		text-underline-offset: 0.3em;
	}
	button {
		min-height: 48px;
		padding: 0.8rem 1rem;
		display: inline-flex;
		align-items: center;
		gap: 1rem;
		cursor: pointer;
		background: var(--copper, #d9a17b);
		color: var(--paper, #121619);
		border: 1px solid var(--copper, #d9a17b);
		border-radius: 0;
		font: inherit;
		font-size: 0.85rem;
		font-weight: 600;
	}
	button:disabled {
		cursor: wait;
		background: var(--muted, #c4beb3);
		border-color: var(--muted, #c4beb3);
	}
	a:focus-visible,
	button:focus-visible,
	input:focus-visible,
	textarea:focus-visible {
		outline: 2px solid var(--focus, #ffe2a8);
		outline-offset: 4px;
	}
	input[aria-invalid='true'],
	textarea[aria-invalid='true'] {
		border-color: #ffb4a1;
	}
	.field-error {
		color: #ffb4a1;
		font-size: 0.78rem;
		margin-top: 0.4rem;
	}
	.field-error:empty {
		margin: 0;
	}
	.form-status {
		font-size: 0.85rem;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
	.contact-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
		gap: clamp(2rem, 6vw, 6rem);
		align-items: start;
	}
	.contact-info h3 {
		max-width: 20ch;
	}
	.intro {
		font-size: 0.9rem;
		color: var(--muted, #c4beb3);
		margin-top: 1.25rem;
		max-width: 54ch;
	}
	.channels {
		margin: 2rem 0 0;
	}
	.channels > div {
		border-top: 1px solid var(--line, #89979b);
		padding-block: 0.9rem;
	}
	dt {
		font-size: 0.65rem;
		letter-spacing: 0.06em;
		color: var(--muted, #c4beb3);
	}
	dd {
		margin: 0.25rem 0 0;
		font-size: 0.85rem;
		overflow-wrap: anywhere;
	}
	dd a {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		min-height: 44px;
	}
	dd p {
		padding-block: 0.5rem;
	}
	.resume-link {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-size: 0.85rem;
		color: var(--copper, #d9a17b);
		margin-top: 1rem;
	}
	.form-sheet {
		background: var(--paper, #121619);
		border-top: 1px solid var(--line, #89979b);
		padding: clamp(1.25rem, 3vw, 2.5rem) 0;
	}
	.form-note {
		font-size: 0.7rem;
		letter-spacing: 0.04em;
		color: var(--copper, #d9a17b);
		margin-bottom: 1rem;
	}
	.required-note {
		color: var(--muted, #c4beb3);
		font-size: 0.72rem;
		margin-block: 0.75rem 1.5rem;
	}
	fieldset {
		border: 0;
		padding: 0;
		margin: 0;
		min-width: 0;
	}
	.form-split {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 1rem;
	}
	.field {
		margin-bottom: 1.25rem;
	}
	label {
		font-size: 0.75rem;
		display: block;
		margin-bottom: 0.5rem;
	}
	input:not([type='checkbox']),
	textarea {
		display: block;
		width: 100%;
		box-sizing: border-box;
		border: 1px solid var(--line, #89979b);
		background: var(--surface, #1c2327);
		color: var(--ink, #f4eee3);
		border-radius: 0;
		min-height: 48px;
		padding: 0.75rem;
		font-size: 1rem;
	}
	input::placeholder,
	textarea::placeholder {
		color: var(--muted, #c4beb3);
		opacity: 1;
		font-size: 0.85rem;
	}
	textarea {
		resize: vertical;
	}
	.error {
		color: #ffb4a1;
		font-size: 0.85rem;
		padding: 0.75rem;
		border-left: 3px solid #ffb4a1;
		margin-bottom: 1rem;
	}
	.send-button {
		width: 100%;
		justify-content: space-between;
	}
	.privacy-note {
		font-size: 0.7rem;
		color: var(--muted, #c4beb3);
		margin-top: 1rem;
	}
	.success {
		padding-block: 2rem;
	}
	.success > p:not(.form-note) {
		color: var(--muted, #c4beb3);
		margin: 1rem 0 2rem;
		font-size: 0.9rem;
	}
	@media (max-width: 850px) {
		.contact-grid {
			grid-template-columns: 1fr;
			gap: 3rem;
		}
	}
	@media (max-width: 599px) {
		.form-split {
			grid-template-columns: 1fr;
			gap: 0;
		}
	}
</style>
