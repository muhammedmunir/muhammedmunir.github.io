<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { lang } from '$lib/i18n';
  import { translations } from '$lib/translations';
  import { derived } from 'svelte/store';

  let hoveredCard: number | null = $state(null);

  const t  = derived(lang, ($l) => translations[$l].projects);

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo('.projects-header', { opacity:0, y:30 }, { opacity:1, y:0, duration:0.8,
      scrollTrigger:{ trigger:'.projects-header', start:'top 90%' } });
    gsap.utils.toArray<HTMLElement>('.project-card').forEach((card, i) => {
      gsap.fromTo(card, { opacity:0, y:60, scale:0.96 },
        { opacity:1, y:0, scale:1, duration:0.9, ease:'power3.out', delay:i*0.12,
          scrollTrigger:{ trigger:card, start:'top 88%', toggleActions:'play none none none' } });
    });
  });

  const projects = [
    { id:'iwa001',       key:'iwa001' as const,    context:'Nova Bitara Development Sdn Bhd',     badgeKey:'production' as const, accent:'#D4AF37', icon:'🔐', gradient:'linear-gradient(135deg,rgba(212,175,55,0.08) 0%,rgba(30,58,95,0.3) 100%)', tags:['SvelteKit 2.8','TypeScript','Supabase','Tailwind CSS','Vercel'] },
    { id:'infinity',     key:'infinity' as const,   context:'Nova Bitara Development Sdn Bhd',     badgeKey:'production' as const, accent:'#6B9FD4', icon:'🌐', gradient:'linear-gradient(135deg,rgba(107,159,212,0.08) 0%,rgba(30,58,95,0.3) 100%)', tags:['SvelteKit','Vercel','Redis','Resend','GoDaddy'] },
    { id:'ecommerce',    key:'ecommerce' as const,  context:'Nova Bitara Development Sdn Bhd',     badgeKey:'production' as const, accent:'#F97316', icon:'🛒', gradient:'linear-gradient(135deg,rgba(249,115,22,0.08) 0%,rgba(30,58,95,0.3) 100%)', tags:['Laravel','MySQL','DirectAdmin','Cloudflare','PHP'] },
    { id:'onboardx',     key:'onboardx' as const,   context:'Tenaga Nasional Berhad (TNB)',        badgeKey:'enterprise' as const, accent:'#22C55E', icon:'⚡', gradient:'linear-gradient(135deg,rgba(34,197,94,0.08) 0%,rgba(30,58,95,0.3) 100%)',   tags:['Flutter','Firebase','MongoDB','Azure','Jenkins','Kubernetes'] },
    { id:'utm-fyp',      key:'fyp' as const,        context:'Universiti Teknologi Malaysia (UTM)', badgeKey:'academic' as const,   accent:'#A78BFA', icon:'🗺️',gradient:'linear-gradient(135deg,rgba(167,139,250,0.08) 0%,rgba(30,58,95,0.3) 100%)', tags:['SvelteKit','Tailwind CSS','Google Maps API','Supabase','Figma'] }
  ];
</script>

<section id="projects">
  <div class="section">
    <div class="section-header projects-header">
      <div class="section-label">{$t.label}</div>
      <h2>{$t.title}</h2>
      <p class="section-desc">{$t.desc}</p>
      <div class="section-divider"></div>
    </div>

    <div class="projects-grid">
      {#each projects as project, i}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <article
          class="project-card card"
          id="project-{project.id}"
          onmouseenter={() => hoveredCard = i}
          onmouseleave={() => hoveredCard = null}
          style="background:{hoveredCard===i ? project.gradient : 'var(--card-bg)'};"
        >
          <div class="project-top">
            <div class="project-icon-wrap" style="border-color:{project.accent}22;background:{project.accent}12;">
              <span class="project-icon" role="img" aria-label="{$t[project.key].title}">{project.icon}</span>
            </div>
            <div class="project-badges">
              <span class="project-badge" style="color:{project.accent};background:{project.accent}15;border-color:{project.accent}30;">
                {$t[project.badgeKey]}
              </span>
            </div>
          </div>

          <div class="project-content">
            <h3 class="project-title">{$t[project.key].title}</h3>
            <p class="project-subtitle">{$t[project.key].subtitle}</p>
            <p class="project-context">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
              {project.context}
            </p>
            <p class="project-desc">{$t[project.key].desc}</p>
            <ul class="project-features" role="list">
              {#each $t[project.key].features as feat}
                <li>
                  <span class="feat-dot" style="background:{project.accent}" aria-hidden="true"></span>
                  {feat}
                </li>
              {/each}
            </ul>
          </div>

          <div class="project-footer">
            <div class="project-tags">
              {#each project.tags as tag}
                <span class="tag">{tag}</span>
              {/each}
            </div>
          </div>

          <div class="project-corner" style="border-color:{project.accent};" aria-hidden="true"></div>
        </article>
      {/each}
    </div>

    <div class="projects-cta">
      <p>{$t.cta}</p>
      <a href="#contact" class="btn btn-outline" id="view-more-projects">{$t.cta_btn}</a>
    </div>
  </div>
</section>

<style>
  section { background:var(--navy-dark); position:relative; }
  section::before { content:''; position:absolute; top:0;left:0;right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent); }
  .section-desc { font-size:1rem; color:var(--text-muted); margin-top:0.75rem; }
  .projects-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(440px,1fr)); gap:1.75rem; }
  .project-card { padding:2rem; display:flex; flex-direction:column; gap:1.25rem; position:relative; overflow:hidden; transition:all 0.4s cubic-bezier(0.4,0,0.2,1); }
  .project-top { display:flex; align-items:center; justify-content:space-between; }
  .project-icon-wrap { width:56px;height:56px; border:1px solid; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.6rem; }
  .project-badges { display:flex; align-items:center; gap:0.6rem; }
  .project-badge { font-size:0.7rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; padding:0.28rem 0.75rem; border-radius:100px; border:1px solid; }
  .project-content { flex:1; }
  .project-title { font-size:1.25rem; color:var(--text-primary); margin-bottom:0.25rem; }
  .project-subtitle { font-size:0.82rem; color:var(--gold); font-weight:600; letter-spacing:0.04em; margin-bottom:0.3rem; }
  .project-context { display:flex; align-items:center; gap:0.35rem; font-size:0.78rem; color:var(--text-muted); margin-bottom:0.85rem; }
  .project-desc { font-size:0.875rem; color:var(--text-secondary); line-height:1.75; margin-bottom:1rem; }
  .project-features { list-style:none; display:flex; flex-direction:column; gap:0.45rem; }
  .project-features li { display:flex; align-items:flex-start; gap:0.55rem; font-size:0.845rem; color:var(--text-secondary); }
  .feat-dot { width:6px;height:6px; border-radius:50%; flex-shrink:0; margin-top:7px; }
  .project-footer { margin-top:auto; }
  .project-tags { display:flex; flex-wrap:wrap; gap:0.4rem; }
  .project-corner { position:absolute; top:0;right:0; width:50px;height:50px; border-top:2px solid; border-right:2px solid; border-top-right-radius:var(--radius-lg); opacity:0.25; transition:opacity 0.3s; pointer-events:none; }
  .project-card:hover .project-corner { opacity:0.7; }
  .projects-cta { text-align:center; margin-top:3rem; display:flex; flex-direction:column; align-items:center; gap:1rem; }
  .projects-cta p { font-size:0.9rem; color:var(--text-muted); }
  @media (max-width:640px) { .projects-grid { grid-template-columns:1fr; } .project-card { padding:1.5rem; } }
</style>
