<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { lang } from '$lib/i18n';
  import { translations } from '$lib/translations';
  import { derived } from 'svelte/store';

  const t    = derived(lang, ($l) => translations[$l].experience);
  const texp = derived(lang, ($l) => translations[$l].exp);

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray<HTMLElement>('.timeline-item').forEach((item, i) => {
      gsap.fromTo(item,
        { opacity: 0, x: i % 2 === 0 ? -50 : 50 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 85%', toggleActions: 'play none none none' } }
      );
    });
    gsap.fromTo('.exp-header',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.exp-header', start: 'top 90%' } }
    );
  });

  const expMeta = [
    { key: 'yhcm' as const,       company: 'YHCM Sdn Bhd',                                 location: 'Shah Alam',              period: 'Apr 2026 – Present', type: 'Full-Time',          current: true,  icon: '🏢', tags: ['Vue.js','Laravel Filament','Docker','MariaDB','MySQL','Linux'] },
    { key: 'nova' as const,       company: 'Nova Bitara Development Sdn Bhd',               location: 'Sunway',                  period: 'Dis 2025 – Mac 2026', type: 'Kontrak / Contract', current: false, icon: '💻', tags: ['SvelteKit','Supabase','Laravel','Redis','Vercel','Cloudflare'] },
    { key: 'tnb_protege' as const,company: 'Tenaga Nasional Berhad (TNB)',                  location: 'UOA Business Park, Shah Alam', period: 'Apr 2025 – Dis 2025', type: 'Protégé',      current: false, icon: '⚡', tags: ['Flutter','Firebase','MongoDB','Azure','Jenkins','Kubernetes','Figma'] },
    { key: 'tnb_cyber' as const,  company: 'Tenaga Nasional Berhad (TNB) Platinum',         location: 'Bangsar',                 period: 'Sept 2023 – Feb 2024', type: 'Latihan Industri / Internship', current: false, icon: '🛡️', tags: ['Splunk','Vulhub','Red Team','Blue Team','SIEM'] }
  ];
</script>

<section id="experience">
  <div class="section">
    <div class="section-header exp-header">
      <div class="section-label">{$t.label}</div>
      <h2>{$t.title}</h2>
      <p class="section-desc">{$t.desc}</p>
      <div class="section-divider"></div>
    </div>

    <div class="timeline">
      <div class="timeline-track" aria-hidden="true"></div>

      {#each expMeta as exp, i}
        <div class="timeline-item" class:right={i % 2 !== 0}>
          <div class="timeline-node" class:current={exp.current} aria-hidden="true">
            <span class="node-icon">{exp.icon}</span>
          </div>

          <div class="exp-card card">
            <div class="exp-card-header">
              <div class="exp-meta">
                <span class="exp-type-badge"
                  class:current-badge={exp.current}
                  class:intern-badge={exp.key === 'tnb_cyber'}
                  class:contract-badge={exp.key === 'nova'}
                  class:protege-badge={exp.key === 'tnb_protege'}
                >
                  {exp.current ? $t.active : exp.type}
                </span>
                <span class="exp-period">{exp.period}</span>
              </div>
              <h3 class="exp-role">{$texp[exp.key].role}</h3>
              <p class="exp-company">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                {exp.company}
                <span class="exp-location">· {exp.location}</span>
              </p>
            </div>

            <p class="exp-desc">{$texp[exp.key].desc}</p>

            <ul class="exp-highlights" role="list">
              {#each $texp[exp.key].highlights as h}
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                  {h}
                </li>
              {/each}
            </ul>

            <div class="exp-tags">
              {#each exp.tags as tag}
                <span class="tag">{tag}</span>
              {/each}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  section {
    background: linear-gradient(180deg, var(--navy-dark) 0%, var(--navy-mid) 50%, var(--navy-dark) 100%);
    position: relative; overflow: hidden;
  }
  section::before {
    content: '';
    position: absolute; top:50%; left:50%;
    transform: translate(-50%,-50%);
    width:600px; height:600px;
    background: radial-gradient(circle,rgba(212,175,55,0.04) 0%,transparent 70%);
    pointer-events: none;
  }
  .section-desc { font-size:1rem; color:var(--text-muted); margin-top:0.75rem; }

  .timeline { position:relative; padding:2rem 0; }
  .timeline-track {
    position:absolute; left:50%; top:0; bottom:0;
    width:2px;
    background:linear-gradient(180deg,transparent,var(--gold-border),var(--gold-border),transparent);
    transform:translateX(-50%);
  }
  .timeline-item {
    display:flex; justify-content:flex-end;
    padding-right:calc(50% + 3rem);
    margin-bottom:3rem; position:relative;
  }
  .timeline-item.right { justify-content:flex-start; padding-right:0; padding-left:calc(50% + 3rem); }

  .timeline-node {
    position:absolute; left:50%; top:1.5rem;
    transform:translateX(-50%);
    width:52px; height:52px;
    background:var(--navy-mid);
    border:2px solid var(--gold-border);
    border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:1.4rem; z-index:2; transition:var(--transition);
  }
  .timeline-node.current { border-color:var(--gold); box-shadow:0 0 20px rgba(212,175,55,0.3); animation:pulse-gold 3s infinite; }
  .node-icon { line-height:1; }

  .exp-card { padding:1.75rem; max-width:500px; width:100%; }
  .exp-card-header { margin-bottom:1rem; }
  .exp-meta { display:flex; align-items:center; gap:0.75rem; margin-bottom:0.6rem; flex-wrap:wrap; }
  .exp-type-badge {
    font-size:0.7rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;
    padding:0.25rem 0.75rem; border-radius:100px;
    background:rgba(212,175,55,0.1); color:var(--text-muted); border:1px solid var(--card-border);
  }
  .current-badge  { background:rgba(34,197,94,0.12);  color:#4ade80;  border-color:rgba(34,197,94,0.3);  }
  .intern-badge   { background:rgba(139,92,246,0.12);  color:#a78bfa;  border-color:rgba(139,92,246,0.3); }
  .contract-badge { background:rgba(59,130,246,0.12);  color:#60a5fa;  border-color:rgba(59,130,246,0.3); }
  .protege-badge  { background:rgba(249,115,22,0.12);  color:#fb923c;  border-color:rgba(249,115,22,0.3); }
  .exp-period { font-size:0.8rem; color:var(--text-muted); font-weight:500; }
  .exp-role   { font-size:1.15rem; color:var(--text-primary); margin-bottom:0.35rem; }
  .exp-company { display:flex; align-items:center; gap:0.4rem; font-size:0.875rem; font-weight:600; color:var(--gold); flex-wrap:wrap; }
  .exp-location { font-weight:400; color:var(--text-muted); font-size:0.82rem; }
  .exp-desc  { font-size:0.875rem; line-height:1.7; color:var(--text-secondary); margin-bottom:1rem; }
  .exp-highlights { list-style:none; display:flex; flex-direction:column; gap:0.45rem; margin-bottom:1.25rem; }
  .exp-highlights li { display:flex; align-items:flex-start; gap:0.5rem; font-size:0.845rem; color:var(--text-secondary); line-height:1.5; }
  .exp-highlights svg { color:var(--gold); flex-shrink:0; margin-top:3px; }
  .exp-tags { display:flex; flex-wrap:wrap; gap:0.4rem; }

  @media (max-width:768px) {
    .timeline-track { left:1.2rem; }
    .timeline-item,.timeline-item.right { padding:0 0 0 3.5rem; justify-content:flex-start; }
    .timeline-node { left:1.2rem; top:1.2rem; width:40px; height:40px; font-size:1.1rem; }
    .exp-card { max-width:100%; }
  }
</style>
