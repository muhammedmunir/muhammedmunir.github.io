<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { lang } from '$lib/i18n';
  import { translations } from '$lib/translations';
  import { derived } from 'svelte/store';

  let formData = $state({ name: '', email: '', subject: '', message: '' });
  let submitted = $state(false);
  let submitting = $state(false);
  let errorMsg = $state('');

  const WEB3FORMS_KEY = '2a358a62-7093-4dfa-bb91-1b9fa8957ba2';

  const t = derived(lang, ($l) => translations[$l].contact);

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo('.contact-header', { opacity:0, y:30 }, { opacity:1, y:0, duration:0.8, scrollTrigger:{ trigger:'.contact-header', start:'top 90%' } });
    gsap.fromTo('.contact-info', { opacity:0, x:-40 }, { opacity:1, x:0, duration:0.8, ease:'power3.out', scrollTrigger:{ trigger:'.contact-info', start:'top 85%' } });
    gsap.fromTo('.contact-form-wrap', { opacity:0, x:40 }, { opacity:1, x:0, duration:0.8, ease:'power3.out', scrollTrigger:{ trigger:'.contact-form-wrap', start:'top 85%' } });
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    submitting = true;
    errorMsg = '';

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `[Portfolio] ${formData.subject} — dari ${formData.name}`,
          from_name: formData.name,
          replyto: formData.email,
          message: `
Mesej baharu diterima dari Portfolio — muhammedmunir.github.io
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Nama     : ${formData.name}
  Email    : ${formData.email}
  Subjek   : ${formData.subject}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Mesej    :

${formData.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Untuk balas, terus reply email ini atau hantar ke: ${formData.email}
          `.trim(),
          botcheck: ''
        })
      });

      const result = await response.json();

      if (result.success) {
        submitted = true;
      } else {
        errorMsg = result.message || 'Ralat berlaku. Cuba semula.';
      }
    } catch {
      errorMsg = 'Tiada sambungan internet. Cuba semula.';
    } finally {
      submitting = false;
    }
  }

  const contactDetails = [
    { icon:'📧', label:'Email',    value:'muhammed.munir97.mm@gmail.com', href:'mailto:muhammed.munir97.mm@gmail.com' },
    { icon:'📱', label:'Phone',    value:'+6013-5636124',                  href:'tel:+60135636124' },
    { icon:'💼', label:'LinkedIn', value:'linkedin.com/in/muhammed-munir', href:'https://linkedin.com/in/muhammed-munir' },
    { icon:'📍', label:'Lokasi / Location', value:'Bandar Puteri, Puchong, Selangor', href:null }
  ];
</script>

<section id="contact">
  <div class="section">
    <div class="section-header contact-header">
      <div class="section-label">{$t.label}</div>
      <h2>{$t.title}</h2>
      <p class="section-desc">{$t.desc}</p>
      <div class="section-divider"></div>
    </div>

    <div class="contact-grid">
      <div class="contact-info">
        <div class="info-intro card">
          <div class="intro-icon" aria-hidden="true">👋</div>
          <h3>{$t.intro_title}</h3>
          <p>{$t.intro_desc}</p>
        </div>

        <div class="contact-details">
          {#each contactDetails as detail}
            <div class="contact-detail-item">
              <div class="detail-icon" aria-hidden="true">{detail.icon}</div>
              <div class="detail-content">
                <span class="detail-label">{detail.label}</span>
                {#if detail.href}
                  <a href={detail.href} class="detail-value" id="contact-{detail.label.toLowerCase().replace(' ','-')}">{detail.value}</a>
                {:else}
                  <span class="detail-value">{detail.value}</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>

        <div class="availability-banner">
          <div class="avail-dot" aria-hidden="true"></div>
          <div>
            <p class="avail-status">{$t.avail_status}</p>
            <p class="avail-sub">{$t.avail_sub}</p>
          </div>
        </div>
      </div>

      <div class="contact-form-wrap card">
        {#if submitted}
          <div class="success-state">
            <div class="success-icon" aria-hidden="true">✅</div>
            <h3>{$t.success_title}</h3>
            <p>{$t.success_msg}</p>
            <button class="btn btn-outline"
              onclick={() => { submitted = false; formData = { name:'', email:'', subject:'', message:'' }; }}
              id="send-another-btn">
              {$t.send_another}
            </button>
          </div>
        {:else}
          <form onsubmit={handleSubmit} id="contact-form" novalidate>
            <h3 class="form-title">{$t.form_title}</h3>

            <div class="form-row">
              <div class="form-group">
                <label for="contact-name">{$t.name_label}</label>
                <input type="text" id="contact-name" bind:value={formData.name}
                  placeholder={$t.name_placeholder} required autocomplete="name" />
              </div>
              <div class="form-group">
                <label for="contact-email">{$t.email_label}</label>
                <input type="email" id="contact-email" bind:value={formData.email}
                  placeholder={$t.email_placeholder} required autocomplete="email" />
              </div>
            </div>

            <div class="form-group">
              <label for="contact-subject">{$t.subject_label}</label>
              <input type="text" id="contact-subject" bind:value={formData.subject}
                placeholder={$t.subject_placeholder} required />
            </div>

            <div class="form-group">
              <label for="contact-message">{$t.msg_label}</label>
              <textarea id="contact-message" bind:value={formData.message}
                placeholder={$t.msg_placeholder} rows="5" required></textarea>
            </div>

            {#if errorMsg}
              <div class="error-banner" role="alert">⚠️ {errorMsg}</div>
            {/if}
            <button type="submit" class="btn btn-primary submit-btn" id="contact-submit-btn" disabled={submitting}>
              {#if submitting}
                <span class="spinner" aria-hidden="true"></span>
                {$t.sending}
              {:else}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                {$t.send_btn}
              {/if}
            </button>
          </form>
        {/if}
      </div>
    </div>
  </div>
</section>

<style>
  section { background:var(--navy-dark); position:relative; }
  section::before { content:''; position:absolute; top:0;left:0;right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent); }
  section::after { content:''; position:absolute; bottom:0;left:0;right:0; height:200px; background:radial-gradient(ellipse at center bottom,rgba(212,175,55,0.05),transparent 70%); pointer-events:none; }
  .section-desc { font-size:1rem; color:var(--text-muted); margin-top:0.75rem; }
  .contact-grid { display:grid; grid-template-columns:1fr 1.4fr; gap:2.5rem; align-items:start; }
  .contact-info { display:flex; flex-direction:column; gap:1.5rem; }
  .info-intro { padding:2rem; display:flex; flex-direction:column; gap:0.8rem; }
  .intro-icon { font-size:2rem; }
  .info-intro h3 { font-size:1.15rem; color:var(--text-primary); }
  .info-intro p { font-size:0.9rem; color:var(--text-secondary); line-height:1.7; }
  .contact-details { display:flex; flex-direction:column; gap:0.75rem; }
  .contact-detail-item { display:flex; align-items:center; gap:1rem; padding:1rem 1.25rem; background:var(--card-bg); border:1px solid var(--card-border); border-radius:var(--radius); backdrop-filter:blur(10px); transition:var(--transition); }
  .contact-detail-item:hover { border-color:rgba(212,175,55,0.4); transform:translateX(4px); }
  .detail-icon { font-size:1.3rem; }
  .detail-content { display:flex; flex-direction:column; gap:0.1rem; }
  .detail-label { font-size:0.72rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--text-muted); }
  .detail-value { font-size:0.9rem; font-weight:500; color:var(--text-primary); transition:var(--transition); overflow-wrap:break-word; word-break:break-all; min-width:0; }
  a.detail-value:hover { color:var(--gold); }
  .availability-banner { display:flex; align-items:center; gap:1rem; padding:1rem 1.25rem; background:rgba(34,197,94,0.06); border:1px solid rgba(34,197,94,0.2); border-radius:var(--radius); }
  .avail-dot { width:12px;height:12px; background:#22c55e; border-radius:50%; flex-shrink:0; animation:pulse-dot 2s infinite; }
  @keyframes pulse-dot { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4);}50%{box-shadow:0 0 0 8px rgba(34,197,94,0);} }
  .avail-status { font-size:0.9rem; font-weight:700; color:#4ade80; margin-bottom:0.15rem; }
  .avail-sub { font-size:0.78rem; color:var(--text-muted); }
  .contact-form-wrap { padding:2.5rem; }
  .form-title { font-size:1.3rem; color:var(--text-primary); margin-bottom:1.75rem; }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
  .form-group { display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1.25rem; }
  label { font-size:0.8rem; font-weight:600; color:var(--text-secondary); letter-spacing:0.05em; text-transform:uppercase; }
  input, textarea { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:0.85rem 1rem; font-family:var(--font-body); font-size:0.9rem; color:var(--text-primary); transition:var(--transition); outline:none; resize:none; }
  input::placeholder, textarea::placeholder { color:var(--text-muted); }
  input:focus, textarea:focus { border-color:var(--gold); background:rgba(212,175,55,0.04); box-shadow:0 0 0 3px rgba(212,175,55,0.1); }
  textarea { min-height:120px; }
  .submit-btn { width:100%; justify-content:center; padding:1rem; font-size:1rem; }
  .error-banner { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:8px; padding:0.75rem 1rem; font-size:0.85rem; color:#fca5a5; margin-bottom:1rem; }
  .spinner { width:16px;height:16px; border:2px solid rgba(0,0,0,0.3); border-top-color:var(--navy-dark); border-radius:50%; animation:spin 0.8s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg);} }
  .success-state { display:flex; flex-direction:column; align-items:center; text-align:center; gap:1rem; padding:2rem; }
  .success-icon { font-size:3rem; }
  .success-state h3 { color:var(--text-primary); }
  .success-state p { color:var(--text-secondary); font-size:0.9rem; }
  @media (max-width:900px) { .contact-grid { grid-template-columns:1fr; } }
  @media (max-width:540px) { .form-row { grid-template-columns:1fr; } }
</style>
