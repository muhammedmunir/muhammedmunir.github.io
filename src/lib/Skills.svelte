<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { lang } from '$lib/i18n';
  import { translations } from '$lib/translations';
  import { derived } from 'svelte/store';

  const t    = derived(lang, ($l) => translations[$l].skills);
  const tedu = derived(lang, ($l) => translations[$l].edu);

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo('.skills-header', { opacity:0, y:30 }, { opacity:1, y:0, duration:0.8, scrollTrigger:{ trigger:'.skills-header', start:'top 90%' } });
    gsap.utils.toArray<HTMLElement>('.skill-col').forEach((col, i) => {
      gsap.fromTo(col, { opacity:0, y:50 }, { opacity:1, y:0, duration:0.8, delay:i*0.15, ease:'power3.out', scrollTrigger:{ trigger:col, start:'top 88%' } });
    });
    gsap.utils.toArray<HTMLElement>('.bar-fill').forEach(bar => {
      const width = bar.getAttribute('data-width') || '0%';
      gsap.fromTo(bar, { width:'0%' }, { width, duration:1.2, ease:'power2.out', scrollTrigger:{ trigger:bar, start:'top 90%' } });
    });
    gsap.utils.toArray<HTMLElement>('.edu-card').forEach((card, i) => {
      gsap.fromTo(card, { opacity:0, y:40 }, { opacity:1, y:0, duration:0.8, delay:i*0.15, ease:'power3.out', scrollTrigger:{ trigger:card, start:'top 88%' } });
    });
  });

  const skillCategories = [
    { titleKey:'frontend' as const,  icon:'🎨', color:'#61DAFB', skills:[{name:'SvelteKit',level:90},{name:'Vue.js',level:85},{name:'Flutter (Dart)',level:82},{name:'React.js',level:70},{name:'HTML / CSS',level:88},{name:'JavaScript / TS',level:85}] },
    { titleKey:'backend'  as const,  icon:'☁️', color:'#FF6B6B', skills:[{name:'Laravel (PHP)',level:85},{name:'Node.js',level:72},{name:'C# / .NET',level:65},{name:'Supabase',level:88},{name:'Docker',level:80},{name:'Azure / Vercel',level:75}] },
    { titleKey:'security' as const,  icon:'🛡️', color:'#D4AF37', skills:[{name:'Splunk SIEM',level:75},{name:'Wireshark',level:78},{name:'Vulhub / Pen Testing',level:68},{name:'VPN / Firewall Config',level:80},{name:'ISO 27001 / NIST',level:70},{name:'Network Troubleshoot',level:85}] }
  ];

  const excellentSkills = ['Microsoft Office Suite','System Troubleshooting','Network Troubleshooting','IT Support'];
  const toolsSkills     = ['MySQL','PostgreSQL','MongoDB','Firebase','Redis','Jenkins','Kubernetes','Cloudflare','DirectAdmin','Git','Linux / Ubuntu','Kali Linux','Figma','Cisco Packet Tracer','Antigravity AI','Cursor','Gemini','Microsoft Power BI','Python (Data Analysis)'];
  const certifications  = ['CCNAv7: Introduction to Networks','CCNAv7: Switching, Routing & Wireless Essentials','IoT Fundamentals: Connecting Things','Network Security (Cisco)','DevNet Associate','Microsoft Power BI Data Analysis','Python for Data Analysis'];

  const educations = [
    {
      degreeKey: 'degree' as const,
      institution: 'Universiti Teknologi Malaysia (UTM)',
      location: 'Johor',
      cgpa: '3.17',
      icon: '🎓',
      badgeKey: 'bachelor' as const
    },
    {
      degreeKey: 'diploma' as const,
      institution: 'Universiti Teknologi Malaysia (UTM)',
      location: 'Kuala Lumpur',
      cgpa: '2.72',
      icon: '📜',
      badgeKey: 'diploma' as const
    }
  ];
</script>

<section id="skills">
  <div class="section">
    <div class="section-header skills-header">
      <div class="section-label">{$t.label}</div>
      <h2>{$t.title}</h2>
      <p class="section-desc">{$t.desc}</p>
      <div class="section-divider"></div>
    </div>

    <div class="skills-grid">
      {#each skillCategories as cat}
        <div class="skill-col card">
          <div class="skill-col-header">
            <div class="skill-icon" style="border-color:{cat.color}22;background:{cat.color}12">
              <span role="img" aria-label={$t[cat.titleKey]}>{cat.icon}</span>
            </div>
            <h3 class="skill-cat-title" style="color:{cat.color}">{$t[cat.titleKey]}</h3>
          </div>
          <div class="skill-bars">
            {#each cat.skills as skill}
              <div class="skill-bar-item">
                <div class="skill-bar-label">
                  <span class="skill-name">{skill.name}</span>
                  <span class="skill-pct" style="color:{cat.color}">{skill.level}%</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill" data-width="{skill.level}%"
                    style="background:linear-gradient(90deg,{cat.color}88,{cat.color});width:0%"
                    role="progressbar" aria-valuenow={skill.level} aria-valuemin={0} aria-valuemax={100}
                    aria-label="{skill.name} proficiency"></div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <div class="skill-tier-block">
      <div class="tier-label"><span class="tier-badge tier-excellent">{$t.excellent_label}</span></div>
      <div class="skills-pills">
        {#each excellentSkills as skill}<span class="tag skill-pill">{skill}</span>{/each}
      </div>
    </div>

    <div class="skill-tier-block">
      <div class="tier-label"><span class="tier-badge tier-intermediate">{$t.tools_label}</span></div>
      <div class="skills-pills">
        {#each toolsSkills as skill}<span class="tag skill-pill">{skill}</span>{/each}
      </div>
    </div>

    <div class="certs-block">
      <div class="section-label" style="margin-bottom:1.5rem">{$t.certs_label}</div>
      <div class="certs-grid">
        {#each certifications as cert}
          <div class="cert-item">
            <div class="cert-icon" aria-hidden="true">🏅</div>
            <span class="cert-name">{cert}</span>
          </div>
        {/each}
      </div>
    </div>

    <div class="edu-section">
      <div class="section-label" style="margin-bottom:2rem">{$t.edu_label}</div>
      <div class="edu-cards-list">
        {#each educations as edu}
          <div class="edu-card card">
            <div class="edu-left">
              <div class="edu-icon" aria-hidden="true">{edu.icon}</div>
              <div class="edu-year-line" aria-hidden="true"></div>
              <div class="edu-year">{$tedu[edu.degreeKey].period}</div>
            </div>
            <div class="edu-content">
              <div class="edu-top-row">
                <span class="edu-badge">{$t[edu.badgeKey]}</span>
                <span class="edu-cgpa">{$t.cgpa}: <strong>{edu.cgpa}</strong></span>
              </div>
              <h3 class="edu-degree">
                {$tedu[edu.degreeKey].title}<br/>
                <span class="edu-major">({$tedu[edu.degreeKey].major})</span>
              </h3>
              <p class="edu-uni">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                {edu.institution} — {edu.location}
              </p>

              <div class="fyp-card">
                <div class="fyp-label">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  {$t.fyp_label}
                </div>
                <h4 class="fyp-title">{$tedu[edu.degreeKey].fyp_title}</h4>
                <p class="fyp-desc">{$tedu[edu.degreeKey].fyp_desc}</p>
                <div class="fyp-tags">
                  {#if edu.degreeKey === 'degree'}
                    {#each ['SvelteKit','Tailwind CSS','Supabase','Google Maps API','Figma'] as tag}<span class="tag">{tag}</span>{/each}
                  {:else}
                    {#each ['MySQL','Microsoft Azure','Figma','PHP'] as tag}<span class="tag">{tag}</span>{/each}
                  {/if}
                </div>
              </div>

              <p class="courses-label">{$t.courses_label}</p>
              <div class="courses-grid">
                {#each $tedu[edu.degreeKey].courses as course}
                  <div class="course-item">
                    <span class="course-name">{course.name}</span>
                    <span class="course-detail">{course.detail}</span>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>

<style>
  section { background:linear-gradient(180deg,var(--navy-dark) 0%,var(--navy-mid) 100%); position:relative; }
  section::before { content:''; position:absolute; top:0;left:0;right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent); }
  .section-desc { font-size:1rem; color:var(--text-muted); margin-top:0.75rem; }
  .skills-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; margin-bottom:2.5rem; }
  .skill-col { padding:1.75rem; display:flex; flex-direction:column; gap:1.4rem; }
  .skill-col-header { display:flex; align-items:center; gap:1rem; }
  .skill-icon { width:44px;height:44px; border:1px solid; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0; }
  .skill-cat-title { font-size:1.05rem; font-weight:700; }
  .skill-bars { display:flex; flex-direction:column; gap:0.85rem; }
  .skill-bar-item { display:flex; flex-direction:column; gap:0.35rem; }
  .skill-bar-label { display:flex; justify-content:space-between; align-items:center; }
  .skill-name { font-size:0.82rem; font-weight:500; color:var(--text-secondary); }
  .skill-pct { font-size:0.75rem; font-weight:700; }
  .bar-track { height:5px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden; }
  .bar-fill { height:100%; border-radius:3px; }

  .skill-tier-block { margin-bottom:2rem; }
  .tier-label { margin-bottom:0.85rem; }
  .tier-badge { font-size:0.72rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; padding:0.3rem 0.9rem; border-radius:100px; }
  .tier-excellent   { background:rgba(34,197,94,0.1); color:#4ade80; border:1px solid rgba(34,197,94,0.25); }
  .tier-intermediate { background:var(--gold-dim); color:var(--gold); border:1px solid var(--gold-border); }
  .skills-pills { display:flex; flex-wrap:wrap; gap:0.5rem; }
  .skill-pill { transition:var(--transition); cursor:default; }
  .skill-pill:hover { background:rgba(212,175,55,0.22); transform:translateY(-2px); }

  .certs-block { margin-bottom:4rem; }
  .certs-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:0.75rem; }
  .cert-item { display:flex; align-items:center; gap:0.75rem; padding:0.85rem 1.1rem; background:var(--card-bg); border:1px solid var(--card-border); border-radius:var(--radius); backdrop-filter:blur(10px); transition:var(--transition); }
  .cert-item:hover { border-color:rgba(212,175,55,0.4); transform:translateX(4px); }
  .cert-icon { font-size:1.1rem; flex-shrink:0; }
  .cert-name { font-size:0.845rem; color:var(--text-secondary); font-weight:500; }

  .edu-cards-list { display:flex; flex-direction:column; gap:2rem; }
  .edu-card { padding:2.25rem; display:flex; gap:2rem; }
  .edu-left { display:flex; flex-direction:column; align-items:center; gap:0.5rem; flex-shrink:0; }
  .edu-icon { font-size:2rem; width:58px;height:58px; background:rgba(212,175,55,0.1); border:1px solid var(--gold-border); border-radius:14px; display:flex; align-items:center; justify-content:center; }
  .edu-year-line { flex:1; width:2px; background:linear-gradient(180deg,var(--gold-border),transparent); min-height:20px; }
  .edu-year { font-size:0.7rem; font-weight:700; color:var(--gold); writing-mode:vertical-rl; letter-spacing:0.07em; white-space:nowrap; }
  .edu-content { flex:1; min-width:0; }
  .edu-top-row { display:flex; align-items:center; gap:1rem; margin-bottom:0.75rem; flex-wrap:wrap; }
  .edu-badge { font-size:0.7rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--gold); background:var(--gold-dim); border:1px solid var(--gold-border); padding:0.25rem 0.8rem; border-radius:100px; }
  .edu-cgpa { font-size:0.8rem; color:var(--text-muted); }
  .edu-cgpa strong { color:var(--gold); }
  .edu-degree { font-size:1.3rem; color:var(--text-primary); margin-bottom:0.5rem; line-height:1.35; }
  .edu-major { color:var(--gold); font-style:italic; }
  .edu-uni { display:flex; align-items:center; gap:0.4rem; font-size:0.875rem; font-weight:600; color:var(--text-secondary); margin-bottom:1.4rem; }
  .fyp-card { background:rgba(212,175,55,0.05); border:1px solid var(--gold-border); border-radius:var(--radius); padding:1.1rem 1.25rem; margin-bottom:1.25rem; }
  .fyp-label { display:flex; align-items:center; gap:0.4rem; font-size:0.7rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--gold); margin-bottom:0.5rem; }
  .fyp-title { font-family:var(--font-heading); font-size:1rem; color:var(--text-primary); margin-bottom:0.4rem; }
  .fyp-desc { font-size:0.85rem; color:var(--text-secondary); line-height:1.7; margin-bottom:0.75rem; }
  .fyp-tags { display:flex; flex-wrap:wrap; gap:0.4rem; }
  .courses-label { font-size:0.75rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--text-muted); margin-bottom:0.75rem; }
  .courses-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:0.6rem; }
  .course-item { padding:0.75rem 0.9rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:8px; display:flex; flex-direction:column; gap:0.25rem; }
  .course-name { font-size:0.82rem; font-weight:600; color:var(--text-primary); }
  .course-detail { font-size:0.75rem; color:var(--text-muted); line-height:1.4; }
  @media (max-width:900px) { .skills-grid { grid-template-columns:1fr; } }
  @media (max-width:640px) {
    .edu-card { flex-direction:column; }
    .edu-left { flex-direction:row; align-items:center; }
    .edu-year-line { min-height:0; width:30px; height:2px; }
    .edu-year { writing-mode:unset; }
  }
</style>
