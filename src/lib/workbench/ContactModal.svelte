<script lang="ts">
  import { base } from '$app/paths';
  import { PROFILE } from '$lib/spine/spine-data';
  import type { LocaleMode } from './preferences.svelte';

  let {
    open = false,
    locale = 'ms',
    onclose
  }: {
    open: boolean;
    locale: LocaleMode;
    onclose: () => void;
  } = $props();

  let dialog = $state<HTMLDialogElement>();
  let closeBtn = $state<HTMLButtonElement>();
  let copiedField = $state<'email' | 'phone' | null>(null);
  let copyState = $state<'idle' | 'pending' | 'success' | 'error'>('idle');
  let copyRequest = 0;

  $effect(() => {
    const element = dialog;
    if (!open || !element) return;

    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    copiedField = null;
    copyState = 'idle';
    element.showModal();
    closeBtn?.focus();
    document.body.style.overflow = 'hidden';

    return () => {
      copyRequest += 1;
      if (element.open) element.close();
      document.body.style.overflow = previousOverflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  });

  function closeDialog() {
    dialog?.close();
    onclose();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab' || !dialog) return;
    const controls = Array.from(dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex="0"]'
    ));
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  async function copyText(text: string, field: 'email' | 'phone') {
    const request = ++copyRequest;
    copiedField = null;
    copyState = 'pending';
    try {
      await navigator.clipboard.writeText(text);
      if (request !== copyRequest || !dialog?.open) return;
      copiedField = field;
      copyState = 'success';
    } catch {
      if (request !== copyRequest || !dialog?.open) return;
      copyState = 'error';
    }
  }
</script>

<dialog
  bind:this={dialog}
  class="contact-dialog"
  lang={locale}
  aria-labelledby="contact-dialog-title"
  onkeydown={handleKeydown}
  oncancel={event => {
    event.preventDefault();
    closeDialog();
  }}
  onclick={event => {
    if (event.target !== dialog || !dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog();
  }}
>
      <div class="dialog-header">
        <div>
          <p class="dialog-kicker">
            {locale === 'en' ? 'Direct contact' : 'Hubungan terus'}
          </p>
          <h2 id="contact-dialog-title">
            {locale === 'en' ? 'Contact Muhammed Munir' : 'Hubungi Muhammed Munir'}
          </h2>
          <p class="dialog-sub">
            {PROFILE.location} · Full-Stack Developer @ YHCM Sdn Bhd
          </p>
        </div>
        <button type="button" bind:this={closeBtn} class="close-btn" onclick={closeDialog}>
          {locale === 'en' ? 'Close (Esc)' : 'Tutup (Esc)'}
        </button>
      </div>

      <div class="contact-rows">
        <div class="contact-row">
          <div class="row-info">
            <span class="row-label">WhatsApp & {locale === 'en' ? 'Phone' : 'Telefon'}</span>
            <strong>{PROFILE.phone}</strong>
          </div>
          <div class="row-actions">
            <a
              class="primary-action"
              href={PROFILE.whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              {locale === 'en' ? 'Chat on WhatsApp' : 'WhatsApp Terus'}
            </a>
            <button type="button" aria-disabled={copyState === 'pending'} onclick={() => { if (copyState !== 'pending') copyText(PROFILE.phone, 'phone'); }}>
              {#if copiedField === 'phone'}
                {locale === 'en' ? 'Number Copied!' : 'Nombor Disalin!'}
              {:else}
                {locale === 'en' ? 'Copy Number' : 'Salin Nombor'}
              {/if}
            </button>
            <a href={`tel:${PROFILE.phone.replace(/[^+\d]/g, '')}`}>
              {locale === 'en' ? 'Call' : 'Panggil'}
            </a>
          </div>
        </div>

        <div class="contact-row">
          <div class="row-info">
            <span class="row-label">{locale === 'en' ? 'Official Email' : 'E-mel Rasmi'}</span>
            <strong>{PROFILE.email}</strong>
          </div>
          <div class="row-actions">
            <button type="button" class="primary-action" aria-disabled={copyState === 'pending'} onclick={() => { if (copyState !== 'pending') copyText(PROFILE.email, 'email'); }}>
              {#if copiedField === 'email'}
                {locale === 'en' ? 'Email Copied!' : 'E-mel Disalin!'}
              {:else}
                {locale === 'en' ? 'Copy Email Address' : 'Salin Alamat E-mel'}
              {/if}
            </button>
            <a href={`mailto:${PROFILE.email}`}>
              {locale === 'en' ? 'Open Mail App' : 'Buka Aplikasi E-mel'}
            </a>
          </div>
        </div>

        <div class="contact-row">
          <div class="row-info">
            <span class="row-label">
              {locale === 'en' ? 'Professional Profiles & Resume' : 'Profil Profesional & Resume'}
            </span>
            <strong>LinkedIn · GitHub · ATS Resume PDF</strong>
          </div>
          <div class="row-actions">
            <a class="primary-action" href={`${base}${PROFILE.resumeUrl}`} download>
              {locale === 'en' ? 'Download Resume (PDF)' : 'Muat Turun Resume (PDF)'}
            </a>
            <a href={PROFILE.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>
            <a href={PROFILE.githubUrl} target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </div>
      <p class="copy-status" role="status" aria-live="polite" aria-atomic="true">
        {#if copyState === 'pending'}
          {locale === 'en' ? 'Copying…' : 'Sedang menyalin…'}
        {:else if copyState === 'success'}
          {copiedField === 'email'
            ? (locale === 'en' ? 'Email address copied.' : 'Alamat e-mel disalin.')
            : (locale === 'en' ? 'Phone number copied.' : 'Nombor telefon disalin.')}
        {:else if copyState === 'error'}
          {locale === 'en'
            ? 'Could not copy. Select the contact text to copy it manually, or use the email and call links.'
            : 'Tidak dapat menyalin. Pilih teks hubungan untuk salinan manual, atau gunakan pautan e-mel dan panggilan.'}
        {/if}
      </p>
</dialog>

<style>
  .contact-dialog::backdrop {
    background: rgba(8, 13, 23, 0.72);
  }
  .contact-dialog {
    box-sizing: border-box;
    width: min(40rem, calc(100% - 2rem));
    max-height: calc(100dvh - 2rem);
    margin: auto;
    overflow-y: auto;
    overscroll-behavior: contain;
    overflow-wrap: anywhere;
    background: var(--work-surface);
    color: var(--work-ink);
    border: 1px solid var(--work-muted);
    padding: clamp(1rem, 4vw, 1.5rem);
    font-family: var(--work-font-body, 'Plus Jakarta Sans', sans-serif);
    line-height: 1.6;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
  }
  .copy-status {
    margin: 1rem 0 0;
    font-size: 0.875rem;
    color: var(--work-ink);
  }
  .copy-status:empty {
    margin: 0;
  }
  .dialog-header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--work-line);
  }
  .dialog-kicker {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--work-accent);
    margin: 0 0 4px;
  }
  h2 {
    font-size: clamp(22px, 3vw, 28px);
    margin: 0;
    color: var(--work-ink);
  }
  .dialog-sub {
    font-size: 13px;
    color: var(--work-muted);
    margin: 4px 0 0;
  }
  .close-btn {
    min-height: 44px;
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid var(--work-line);
    background: var(--work-paper);
    color: var(--work-ink);
    cursor: pointer;
  }
  .contact-rows {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 18px;
  }
  .contact-row {
    padding: 16px;
    background: var(--work-paper);
    border: 1px solid var(--work-line);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .row-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .row-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--work-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .row-info strong {
    font-size: 15px;
    word-break: break-word;
  }
  .row-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .row-actions a,
  .row-actions button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid var(--work-line);
    background: var(--work-surface);
    color: var(--work-ink);
    text-decoration: none;
    cursor: pointer;
  }
  .row-actions .primary-action {
    background: var(--work-accent);
    color: #ffffff;
    border-color: var(--work-accent);
  }
  .row-actions .primary-action {
    color: var(--work-paper);
  }
  button[aria-disabled='true'] {
    cursor: progress;
    border-style: dashed;
  }
  button:active,
  .row-actions a:active {
    text-decoration: underline;
  }
  @media (max-width: 30rem) {
    .contact-row {
      padding: 0.75rem;
    }
    .row-actions > * {
      flex: 1 1 100%;
    }
  }
  @media (forced-colors: active) {
    .row-actions a:focus-visible,
    .row-actions button:focus-visible,
    .close-btn:focus-visible {
      outline-color: Highlight;
    }
  }
  @media print {
    .contact-dialog {
      display: none;
    }
  }
  .row-actions a:hover,
  .row-actions button:hover,
  .close-btn:hover {
    text-decoration: underline;
  }
  .row-actions a:focus-visible,
  .row-actions button:focus-visible,
  .close-btn:focus-visible {
    outline: 3px solid var(--work-accent);
    outline-offset: 3px;
  }
</style>
