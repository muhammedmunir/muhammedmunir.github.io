<script lang="ts">
  import { onMount } from 'svelte';
  import { lang } from '$lib/i18n';
  import { derived } from 'svelte/store';
  import { translations } from '$lib/translations';

  let { onClose }: { onClose: () => void } = $props();
  let currentSlide = $state(0);
  const t = derived(lang, ($l) => translations[$l]);

  const slides = [
    { type: 'cover' },
    { type: 'exp', key: 'yhcm' },
    { type: 'exp', key: 'nova' },
    { type: 'exp', key: 'tnb_protege' },
    { type: 'exp', key: 'tnb_cyber' },
    { type: 'proj', key: 'iwa001' },
    { type: 'proj', key: 'infinity' },
    { type: 'proj', key: 'ecommerce' },
    { type: 'proj', key: 'onboardx' },
    { type: 'proj', key: 'fyp' },
    { type: 'skills' },
    { type: 'edu' },
    { type: 'end' }
  ];

  function next() { if (currentSlide < slides.length - 1) currentSlide++; }
  function prev() { if (currentSlide > 0) currentSlide--; }

  onMount(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const expMeta: Record<string, { icon: string; company: string; location: string; period: string; type: string; tags: string[]; achievements: string[]; techDepth: string }> = {
    yhcm: {
      icon:'🏢', company:'YHCM Sdn Bhd', location:'Shah Alam', period:'Apr 2026 – Kini', type:'Sepenuh Masa',
      tags:['Vue.js','Laravel Filament','Docker','MariaDB','MySQL','Linux'],
      achievements:[
        'Menyelenggara 3 sistem kritikal syarikat: eMesys, Sutera & ADIMS',
        'Membangunkan ciri baharu menggunakan Vue.js (frontend) & Laravel Filament (backend)',
        'Mengurus & mengoptimumkan pangkalan data MySQL dan MariaDB untuk prestasi harian',
        'Mengendalikan deployment aplikasi menggunakan Docker containers',
        'Mentadbir pelayan Linux & Windows: monitoring, troubleshooting, maintenance',
        'Menyediakan sokongan IT harian kepada staf syarikat'
      ],
      techDepth: 'Stack: Vue.js 3 (Composition API) → Laravel Filament (Admin Panel) → MySQL/MariaDB → Docker → Linux Server. Proses kerja: Agile sprint, Git version control, peer code review.'
    },
    nova: {
      icon:'💻', company:'Nova Bitara Development Sdn Bhd', location:'Sunway', period:'Dis 2025 – Mac 2026', type:'Kontrak',
      tags:['SvelteKit','Supabase','Laravel','Redis','Vercel','Cloudflare','GoDaddy'],
      achievements:[
        'Menyiapkan 3 projek pengeluaran dalam tempoh 3 bulan (IWA001, Infinity World, E-Commerce)',
        'IWA001: 17 halaman + Panel Admin dengan Row Level Security (RLS) penuh',
        'Infinity World: Sistem i18n 3 bahasa (BM/EN/ZH) + Redis subscriber blog',
        'E-Commerce: Integrasi Cloudflare CDN + DirectAdmin hosting untuk keselamatan',
        'Menguruskan domain GoDaddy, DNS Cloudflare, dan deployment Vercel',
        'Memberikan sokongan IT menyeluruh kepada staf syarikat'
      ],
      techDepth: 'Multi-project delivery: SvelteKit + TypeScript + Supabase (RLS, JWT) → Vercel Edge. Laravel + MySQL → DirectAdmin. Redis caching → Resend email API. Custom domain DNS management.'
    },
    tnb_protege: {
      icon:'⚡', company:'Tenaga Nasional Berhad (TNB)', location:'UOA Business Park, Shah Alam', period:'Apr 2025 – Dis 2025', type:'Protégé',
      tags:['Flutter','Dart','Firebase','MongoDB','Supabase','MySQL','Azure','Jenkins','Kubernetes','Figma'],
      achievements:[
        'Membangunkan aplikasi "Onboardx" dari zero — sistem onboarding pekerja TNB',
        'Mengintegrasikan 4 pangkalan data: Firebase, MongoDB, Supabase & MySQL',
        'Mentadbir pelayan Ubuntu di Microsoft Azure — setup, config & maintenance',
        'Meneroka Jenkins untuk CI/CD pipeline automation',
        'Meneroka Kubernetes untuk container orchestration & scaling',
        'Mereka bentuk UI/UX keseluruhan menggunakan Figma + menguruskan tiket sokongan'
      ],
      techDepth: 'Flutter (Dart/JS) cross-platform app → Firebase Realtime DB + MongoDB + Supabase + MySQL multi-database architecture → Microsoft Azure Ubuntu server → Jenkins CI/CD → Kubernetes orchestration. UI: Figma prototyping → code.'
    },
    tnb_cyber: {
      icon:'🛡️', company:'Tenaga Nasional Berhad (TNB) Platinum', location:'Bangsar', period:'Sept 2023 – Feb 2024', type:'Latihan Industri',
      tags:['Splunk SIEM','Vulhub','Red Team','Blue Team','SIEM','CVE Analysis'],
      achievements:[
        'Memantau aktiviti web TNB secara masa nyata melalui Splunk SIEM dashboard',
        'Mengenal pasti dan menganalisis anomali trafik rangkaian yang mencurigakan',
        'Bekerjasama dengan Red Team menggunakan Vulhub untuk uji kerentanan (CVE)',
        'Menyokong Blue Team dalam mengukuhkan postur keselamatan siber TNB',
        'Mengemas kini data sistem dalaman dan dokumentasi keselamatan',
        'Mendapat pendedahan hands-on kepada persekitaran SOC (Security Operations Centre)'
      ],
      techDepth: 'Splunk SIEM: log ingestion, dashboard creation, anomaly detection. Vulhub: Docker-based CVE reproduction environment. Red Team: attack simulation. Blue Team: defence hardening, patch management, incident response.'
    }
  };

  const projMeta: Record<string, { icon: string; accent: string; tags: string[]; context: string; architecture: string; security: string; impact: string }> = {
    iwa001: {
      icon:'🔐', accent:'#D4AF37', context:'Nova Bitara Development Sdn Bhd',
      tags:['SvelteKit 2.8','TypeScript','Supabase','Tailwind CSS','Vercel','GoDaddy'],
      architecture: 'SvelteKit (SSR/CSR) → Supabase PostgreSQL dengan Row Level Security → Vercel Edge deployment → GoDaddy custom domain. 17 halaman: Dashboard, Loan Application, Document Upload, Admin Panel, User Management, Report Generation.',
      security: 'RLS (Row Level Security) di peringkat database — setiap query disaring mengikut user_id. JWT token validation pada setiap request. Role-based access: Pemohon / Pegawai / Admin. Audit trail untuk semua transaksi pinjaman.',
      impact: 'Sistem pengeluaran mengendalikan aliran kerja pinjaman bercagar yang kompleks. Menggantikan proses manual kertas — menjimatkan masa pemprosesan dan mengurangkan ralat manusia.'
    },
    infinity: {
      icon:'🌐', accent:'#6B9FD4', context:'Nova Bitara Development Sdn Bhd',
      tags:['SvelteKit','TypeScript','Vercel','Redis','Resend API','GoDaddy'],
      architecture: 'SvelteKit SSR → Vercel Edge Functions → Redis (Upstash) untuk caching subscriber data → Resend API untuk email transaksional → GoDaddy domain management. i18n: Svelte store-based dengan 3 locale (ms/en/zh).',
      security: 'Redis data expiry untuk session caching. Resend API untuk email verification. HTTPS enforced via Vercel. Cloudflare-ready DNS setup. Input sanitization pada form subscriber.',
      impact: 'Laman web korporat berbilang bahasa dengan prestasi tinggi. Blog subscriber dengan notifikasi e-mel automatik. Menyokong pasaran tempatan (BM), antarabangsa (EN) dan Cina (ZH).'
    },
    ecommerce: {
      icon:'🛒', accent:'#F97316', context:'Nova Bitara Development Sdn Bhd',
      tags:['Laravel 11','PHP 8','MySQL','DirectAdmin','Cloudflare','IP Serveron'],
      architecture: 'Laravel MVC (PHP 8) → MySQL database → DirectAdmin hosting → IP Serveron domain → Cloudflare CDN & DNS. Modules: Product Catalogue, Cart, Checkout, Order Management, User Auth, Admin Dashboard.',
      security: 'Laravel Sanctum authentication. CSRF protection built-in. Cloudflare DDoS protection & WAF. HTTPS SSL/TLS enforced. MySQL prepared statements — SQL injection prevention. Input validation pada semua form.',
      impact: 'Platform e-dagang penuh untuk jualan produk syarikat. Cloudflare meningkatkan kelajuan loading & melindungi daripada serangan. Admin dashboard untuk pengurusan inventori dan pesanan.'
    },
    onboardx: {
      icon:'⚡', accent:'#22C55E', context:'Tenaga Nasional Berhad (TNB)',
      tags:['Flutter','Dart','JavaScript','Firebase','MongoDB','Supabase','MySQL','Azure','Jenkins','Kubernetes'],
      architecture: 'Flutter cross-platform app (Web/Mobile) → Multi-database: Firebase (realtime), MongoDB (documents), Supabase (structured), MySQL (legacy) → Microsoft Azure Ubuntu server → Jenkins CI/CD pipeline → Kubernetes container orchestration.',
      security: 'Firebase Auth untuk pengesahan pengguna. Role-based access untuk pekerja/HR/admin. Supabase RLS untuk data isolation. Azure Network Security Groups (NSG) untuk firewall. CI/CD pipeline dengan automated testing sebelum deployment.',
      impact: 'Memperkemas proses onboarding pekerja baharu TNB. Mengurangkan paperwork manual. Centralised dashboard untuk HR memantau status onboarding. Dibangunkan dalam persekitaran perusahaan sebenar TNB.'
    },
    fyp: {
      icon:'🗺️', accent:'#A78BFA', context:'Universiti Teknologi Malaysia (UTM)',
      tags:['SvelteKit','TypeScript','Tailwind CSS','Supabase','Google Maps API','Figma'],
      architecture: 'SvelteKit SSR → Supabase PostgreSQL (RLS) → Google Maps JavaScript API (marker clustering, geofencing) → Vercel deployment. Features: Report submission form, interactive map view, admin dashboard, status tracking, email notifications.',
      security: 'Supabase Auth dengan email verification. RLS — pengguna hanya nampak laporan sendiri kecuali admin. Google Maps API key restriction (HTTP referrer). Input validation & file upload sanitization untuk report attachments.',
      impact: 'Menggantikan sistem pelaporan manual UTM. Pengguna boleh submit laporan dengan lokasi GPS tepat. Admin boleh lihat semua laporan pada peta interaktif. Markah FYP: Cemerlang. Diiktiraf oleh panel penyelia UTM.'
    }
  };
</script>

<!-- Overlay -->
<div class="pres-overlay" role="dialog" aria-modal="true" aria-label="Presentation Mode">

  <!-- Header bar -->
  <header class="pres-header">
    <div class="pres-logo">
      <span class="logo-gold">Port</span><span class="logo-dim">folio</span>
    </div>
    <div class="slide-counter">{currentSlide + 1} / {slides.length}</div>
    <button class="close-btn" onclick={onClose} id="pres-close-btn" aria-label="Keluar presentation">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      Keluar
    </button>
  </header>

  <!-- Slide area -->
  <main class="pres-main">

    {#if slides[currentSlide].type === 'cover'}
    <div class="slide slide-cover">
      <div class="cover-badge">Presentation — TNB Executive Assessment</div>
      <h1>Muhammed Munir<br/><span class="gold-text">Bin Mohd Azmi</span></h1>
      <p class="cover-tagline">IT Professional &nbsp;·&nbsp; Full-Stack Developer &nbsp;·&nbsp; Cloud & Cybersecurity</p>
      <div class="cover-chips">
        {#each ['Vue.js','SvelteKit','Laravel','Flutter','React.js','Docker','Azure','Supabase'] as t}
          <span class="chip">{t}</span>
        {/each}
      </div>
      <p class="cover-hint">Guna ← → atau klik butang untuk navigasi</p>
    </div>

    {:else if slides[currentSlide].type === 'exp'}
    {@const key = slides[currentSlide].key as string}
    {@const meta = expMeta[key]}
    {@const tx = $t.exp[key as keyof typeof $t.exp]}
    <div class="slide slide-exp">
      <div class="slide-label">Pengalaman Kerja</div>
      <div class="exp-header-row">
        <div class="exp-big-icon">{meta.icon}</div>
        <div>
          <h2 class="slide-title">{tx.role}</h2>
          <p class="exp-company-slide"><span class="gold-text">{meta.company}</span> · {meta.location}</p>
          <div class="exp-badges">
            <span class="badge-period">📅 {meta.period}</span>
            <span class="badge-type">{meta.type}</span>
          </div>
        </div>
      </div>
      <p class="slide-desc">{tx.desc}</p>

      <div class="detail-grid">
        <div class="detail-col">
          <div class="detail-section-title">✅ Tanggungjawab & Pencapaian</div>
          {#each meta.achievements as a}
            <div class="detail-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {a}
            </div>
          {/each}
        </div>
        <div class="detail-col">
          <div class="detail-section-title">🔧 Kedalaman Teknikal</div>
          <div class="tech-depth-box">{meta.techDepth}</div>
          <div class="detail-section-title" style="margin-top:1rem">🏷️ Teknologi Digunakan</div>
          <div class="tag-row" style="margin-top:0.4rem">
            {#each meta.tags as tag}<span class="tag">{tag}</span>{/each}
          </div>
        </div>
      </div>
    </div>

    {:else if slides[currentSlide].type === 'proj'}
    {@const key = slides[currentSlide].key as string}
    {@const meta = projMeta[key]}
    {@const tx = ($t.projects[key as keyof typeof $t.projects] as unknown) as { title: string; subtitle: string; desc: string; features: readonly string[] }}
    <div class="slide slide-proj">
      <div class="slide-label">Projek</div>
      <div class="proj-header-row">
        <div class="proj-icon-box" style="background:{meta.accent}15;border-color:{meta.accent}40;">{meta.icon}</div>
        <div>
          <h2 class="slide-title">{tx.title}</h2>
          <p class="proj-subtitle" style="color:{meta.accent}">{tx.subtitle}</p>
          <p class="proj-context">📍 {meta.context}</p>
        </div>
      </div>
      <p class="slide-desc">{tx.desc}</p>

      <div class="detail-grid">
        <div class="detail-col">
          <div class="detail-section-title">✅ Ciri-ciri Utama</div>
          {#each tx.features as f}
            <div class="detail-item">
              <span class="feat-dot" style="background:{meta.accent}"></span>
              {f}
            </div>
          {/each}
          <div class="detail-section-title" style="margin-top:1rem">🏷️ Tech Stack</div>
          <div class="tag-row" style="margin-top:0.4rem">
            {#each meta.tags as tag}<span class="tag">{tag}</span>{/each}
          </div>
        </div>
        <div class="detail-col">
          <div class="detail-section-title">🏗️ Seni Bina Sistem</div>
          <div class="tech-depth-box">{meta.architecture}</div>
          <div class="detail-section-title" style="margin-top:1rem">🛡️ Keselamatan</div>
          <div class="tech-depth-box security-box">{meta.security}</div>
          <div class="detail-section-title" style="margin-top:1rem">💡 Impak</div>
          <div class="impact-box">{meta.impact}</div>
        </div>
      </div>
    </div>

    {:else if slides[currentSlide].type === 'skills'}
    <div class="slide slide-skills">
      <div class="slide-label">{$t.skills.label}</div>
      <h2 class="slide-title">{$t.skills.title}</h2>
      <p class="slide-desc">{$t.skills.desc}</p>
      <div class="skills-3col">
        <div class="skill-block">
          <div class="skill-block-title" style="color:#61DAFB">🎨 {$t.skills.frontend}</div>
          {#each [{n:'SvelteKit',v:90},{n:'Vue.js',v:85},{n:'Flutter (Dart)',v:82},{n:'React.js',v:70},{n:'HTML / CSS',v:88},{n:'JavaScript / TS',v:85}] as s}
            <div class="skill-row-bar">
              <div class="srb-label"><span>{s.n}</span><span style="color:#61DAFB">{s.v}%</span></div>
              <div class="srb-track"><div class="srb-fill" style="width:{s.v}%;background:#61DAFB"></div></div>
            </div>
          {/each}
        </div>
        <div class="skill-block">
          <div class="skill-block-title" style="color:#FF6B6B">☁️ {$t.skills.backend}</div>
          {#each [{n:'Laravel (PHP)',v:85},{n:'Node.js',v:72},{n:'C# / .NET',v:65},{n:'Supabase',v:88},{n:'Docker',v:80},{n:'Azure / Vercel',v:75}] as s}
            <div class="skill-row-bar">
              <div class="srb-label"><span>{s.n}</span><span style="color:#FF6B6B">{s.v}%</span></div>
              <div class="srb-track"><div class="srb-fill" style="width:{s.v}%;background:#FF6B6B"></div></div>
            </div>
          {/each}
        </div>
        <div class="skill-block">
          <div class="skill-block-title" style="color:#D4AF37">🛡️ {$t.skills.security}</div>
          {#each [{n:'Splunk SIEM',v:75},{n:'Wireshark',v:78},{n:'Pen Testing',v:68},{n:'VPN / Firewall',v:80},{n:'ISO 27001 / NIST',v:70},{n:'Network Troubleshoot',v:85}] as s}
            <div class="skill-row-bar">
              <div class="srb-label"><span>{s.n}</span><span style="color:#D4AF37">{s.v}%</span></div>
              <div class="srb-track"><div class="srb-fill" style="width:{s.v}%;background:#D4AF37"></div></div>
            </div>
          {/each}
        </div>
      </div>
      <div class="skill-extras">
        <div class="skill-extra-block">
          <div class="extra-label">✅ {$t.skills.excellent_label}</div>
          <div class="extra-chips">
            {#each ['Microsoft Office Suite','System Troubleshooting','Network Troubleshooting','IT Support'] as s}
              <span class="chip-green">{s}</span>
            {/each}
          </div>
        </div>
        <div class="skill-extra-block">
          <div class="extra-label">🛠️ {$t.skills.tools_label}</div>
          <div class="extra-chips">
            {#each ['MySQL','PostgreSQL','MongoDB','Firebase','Redis','Jenkins','Kubernetes','Cloudflare','Kali Linux','Git','Figma','Power BI'] as s}
              <span class="chip">{s}</span>
            {/each}
          </div>
        </div>
      </div>
    </div>

    {:else if slides[currentSlide].type === 'edu'}
    <div class="slide slide-edu">
      <div class="slide-label">{$t.skills.edu_label}</div>
      <h2 class="slide-title">Latar Belakang Akademik</h2>
      <div class="edu-cards-slide">
        <div class="edu-card-slide">
          <div class="edu-icon-slide">🎓</div>
          <div class="edu-card-body">
            <div class="edu-top-row-s">
              <span class="edu-badge-s">{$t.skills.bachelor}</span>
              <span class="edu-cgpa-s">PNGK: <strong>3.17</strong></span>
            </div>
            <div class="edu-deg">{$t.edu.degree.title}</div>
            <div class="edu-maj gold-text">({$t.edu.degree.major})</div>
            <div class="edu-inst">Universiti Teknologi Malaysia (UTM) — Johor · 2021–2024</div>
            <div class="edu-fyp">
              <div class="fyp-lbl">📄 {$t.skills.fyp_label}</div>
              <strong>{$t.edu.degree.fyp_title}</strong><br/>
              <span class="fyp-desc-s">{$t.edu.degree.fyp_desc}</span>
            </div>
            <div class="courses-s">
              {#each $t.edu.degree.courses as c}
                <div class="course-s"><span class="course-n">{c.name}</span> — <span class="course-d">{c.detail}</span></div>
              {/each}
            </div>
          </div>
        </div>
        <div class="edu-card-slide">
          <div class="edu-icon-slide">📜</div>
          <div class="edu-card-body">
            <div class="edu-top-row-s">
              <span class="edu-badge-s">{$t.skills.diploma}</span>
              <span class="edu-cgpa-s">PNGK: <strong>2.72</strong></span>
            </div>
            <div class="edu-deg">{$t.edu.diploma.title}</div>
            <div class="edu-inst">Universiti Teknologi Malaysia (UTM) — Kuala Lumpur · 2017–2020</div>
            <div class="edu-fyp">
              <div class="fyp-lbl">📄 {$t.skills.fyp_label}</div>
              <strong>{$t.edu.diploma.fyp_title}</strong><br/>
              <span class="fyp-desc-s">{$t.edu.diploma.fyp_desc}</span>
            </div>
            <div class="courses-s">
              {#each $t.edu.diploma.courses as c}
                <div class="course-s"><span class="course-n">{c.name}</span> — <span class="course-d">{c.detail}</span></div>
              {/each}
            </div>
          </div>
        </div>
      </div>
      <div class="cert-section">
        <div class="extra-label">🏅 {$t.skills.certs_label}</div>
        <div class="cert-row">
          {#each ['CCNAv7: Introduction to Networks','CCNAv7: Switching, Routing & Wireless','IoT Fundamentals: Connecting Things','Network Security (Cisco)','DevNet Associate','Microsoft Power BI Data Analysis','Python for Data Analysis'] as c}
            <span class="chip">{c}</span>
          {/each}
        </div>
      </div>
    </div>

    {:else if slides[currentSlide].type === 'end'}
    <div class="slide slide-cover">
      <div class="cover-badge">Terima Kasih</div>
      <h1>Sedia untuk <span class="gold-text">cabaran baharu</span></h1>
      <p class="cover-tagline">Muhammed Munir Bin Mohd Azmi</p>
      <div class="contact-end">
        <div class="contact-end-item">📧 muhammed.munir97.mm@gmail.com</div>
        <div class="contact-end-item">📱 +6013-5636124</div>
        <div class="contact-end-item">📍 Bandar Puteri, Puchong, Selangor</div>
      </div>
    </div>
    {/if}

  </main>

  <!-- Nav buttons -->
  <footer class="pres-footer">
    <!-- Dot nav -->
    <div class="dot-nav" role="tablist" aria-label="Slide navigation">
      {#each slides as _, i}
        <button
          class="dot"
          class:active={i === currentSlide}
          onclick={() => currentSlide = i}
          role="tab"
          aria-selected={i === currentSlide}
          aria-label="Slide {i+1}"
        ></button>
      {/each}
    </div>

    <div class="nav-btns">
      <button class="nav-btn" onclick={prev} disabled={currentSlide === 0} id="pres-prev-btn" aria-label="Slide sebelumnya">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        Sebelumnya
      </button>
      <button class="nav-btn primary" onclick={next} disabled={currentSlide === slides.length - 1} id="pres-next-btn" aria-label="Slide seterusnya">
        Seterusnya
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  </footer>
</div>

<style>
  .pres-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: #0a1422;
    display: flex; flex-direction: column;
    font-family: 'Inter', sans-serif;
  }

  /* Header */
  .pres-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1rem 2rem;
    border-bottom: 1px solid rgba(212,175,55,0.15);
    background: rgba(10,20,35,0.9);
    flex-shrink: 0;
  }
  .pres-logo { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 900; }
  .logo-gold { color: #D4AF37; }
  .logo-dim  { color: #6b82a0; font-weight: 400; font-style: italic; }
  .slide-counter { font-size: 0.85rem; font-weight: 600; color: #6b82a0; letter-spacing: 0.1em; }
  .close-btn {
    display: flex; align-items: center; gap: 0.4rem;
    background: transparent; border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px; padding: 0.45rem 1rem;
    color: #9baec8; cursor: pointer; font-size: 0.85rem; font-family: inherit;
    transition: all 0.2s;
  }
  .close-btn:hover { border-color: #D4AF37; color: #D4AF37; }

  /* Main */
  .pres-main {
    flex: 1; overflow-y: auto; overflow-x: hidden;
    display: flex; align-items: flex-start; justify-content: center;
    padding: 2.5rem 4rem;
    position: relative;
  }

  /* Base slide */
  .slide {
    width: 100%; max-width: 1000px;
    animation: fadeIn 0.35s ease;
  }
  @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

  .slide-label {
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
    color: #D4AF37; border: 1px solid rgba(212,175,55,0.3); background: rgba(212,175,55,0.08);
    display: inline-block; padding: 0.3rem 1rem; border-radius: 100px; margin-bottom: 1.5rem;
  }
  .slide-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.6rem, 3.5vw, 2.4rem);
    color: #e8edf5; font-weight: 700; margin-bottom: 0.5rem; line-height: 1.2;
  }
  .slide-desc {
    font-size: 0.95rem; line-height: 1.75; color: #9baec8; margin-bottom: 1.5rem;
    max-width: 780px;
  }
  .gold-text { color: #D4AF37; }
  .tag {
    display: inline-block; padding: 0.3rem 0.85rem; border-radius: 100px;
    font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em;
    background: rgba(212,175,55,0.12); color: #D4AF37; border: 1px solid rgba(212,175,55,0.3);
    margin: 0.2rem;
  }
  .chip {
    display: inline-block; padding: 0.3rem 0.85rem; border-radius: 100px;
    font-size: 0.75rem; font-weight: 600;
    background: rgba(255,255,255,0.06); color: #9baec8; border: 1px solid rgba(255,255,255,0.1);
    margin: 0.2rem;
  }
  .tag-row { margin-top: 1.25rem; display: flex; flex-wrap: wrap; gap: 0.25rem; }

  /* Cover slide */
  .slide-cover { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.25rem; }
  .cover-badge {
    font-size: 0.75rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
    color: #D4AF37; border: 1px solid rgba(212,175,55,0.3); padding: 0.4rem 1.2rem;
    border-radius: 100px; background: rgba(212,175,55,0.08);
  }
  .slide-cover h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 900; color: #e8edf5; line-height: 1.15;
  }
  .cover-tagline { font-size: 1rem; color: #9baec8; letter-spacing: 0.08em; }
  .cover-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.4rem; }
  .cover-hint { font-size: 0.75rem; color: #4a5568; margin-top: 0.5rem; }
  .contact-end { display: flex; flex-direction: column; gap: 0.6rem; margin-top: 0.5rem; }
  .contact-end-item { font-size: 0.95rem; color: #9baec8; }

  /* Experience */
  .exp-header-row { display: flex; gap: 1.5rem; align-items: flex-start; margin-bottom: 1.25rem; }
  .exp-big-icon { font-size: 3rem; flex-shrink: 0; line-height: 1; }
  .exp-company-slide { font-size: 1rem; color: #9baec8; margin-bottom: 0.6rem; }
  .exp-badges { display: flex; gap: 0.75rem; flex-wrap: wrap; }
  .badge-period {
    font-size: 0.78rem; font-weight: 600; padding: 0.25rem 0.75rem;
    border-radius: 100px; background: rgba(255,255,255,0.06); color: #9baec8;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .badge-type {
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase;
    padding: 0.25rem 0.75rem; border-radius: 100px;
    background: rgba(212,175,55,0.1); color: #D4AF37; border: 1px solid rgba(212,175,55,0.3);
  }
  /* Exp & Proj detail layout */
  .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 0.5rem; }
  .detail-col  { display: flex; flex-direction: column; gap: 0.5rem; }
  .detail-section-title {
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
    color: #D4AF37; margin-bottom: 0.5rem;
  }
  .detail-item {
    display: flex; align-items: flex-start; gap: 0.5rem;
    font-size: 0.84rem; color: #9baec8; line-height: 1.55;
    padding: 0.35rem 0; border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .detail-item:last-child { border: none; }
  .tech-depth-box {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px; padding: 0.85rem 1rem;
    font-size: 0.8rem; color: #9baec8; line-height: 1.65;
    border-left: 3px solid rgba(212,175,55,0.5);
  }
  .security-box {
    border-left-color: rgba(239,68,68,0.5);
    background: rgba(239,68,68,0.04);
  }
  .impact-box {
    background: rgba(34,197,94,0.05); border: 1px solid rgba(34,197,94,0.2);
    border-left: 3px solid #22c55e;
    border-radius: 8px; padding: 0.85rem 1rem;
    font-size: 0.82rem; color: #9baec8; line-height: 1.65;
  }

  /* Projects */
  .proj-header-row { display: flex; gap: 1.5rem; align-items: flex-start; margin-bottom: 0.75rem; }
  .proj-icon-box {
    width: 64px; height: 64px; border: 1px solid; border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.8rem; flex-shrink: 0;
  }
  .proj-subtitle { font-size: 0.9rem; font-weight: 600; margin-bottom: 0.3rem; }
  .proj-context  { font-size: 0.82rem; color: #6b82a0; }
  .feat-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; margin-top:6px; }

  /* Skills */
  .skills-3col { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; margin-top: 1rem; margin-bottom: 1.5rem; }
  .skill-block { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 1.25rem; }
  .skill-block-title { font-weight: 700; font-size: 0.9rem; margin-bottom: 1rem; }
  .skill-row-bar { margin-bottom: 0.65rem; }
  .srb-label { display:flex; justify-content:space-between; font-size:0.78rem; color:#9baec8; margin-bottom:0.25rem; font-weight:500; }
  .srb-track { height:4px; background:rgba(255,255,255,0.07); border-radius:2px; overflow:hidden; }
  .srb-fill  { height:100%; border-radius:2px; opacity:0.85; }
  .skill-extras { display:flex; flex-direction:column; gap:1rem; }
  .skill-extra-block { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07); border-radius:10px; padding:1rem 1.25rem; }
  .extra-label { font-size:0.75rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#9baec8; margin-bottom:0.65rem; }
  .extra-chips { display:flex; flex-wrap:wrap; gap:0.35rem; }
  .chip-green { display:inline-block; padding:0.28rem 0.8rem; border-radius:100px; font-size:0.73rem; font-weight:600; background:rgba(34,197,94,0.1); color:#4ade80; border:1px solid rgba(34,197,94,0.25); margin:0.1rem; }

  /* Education */
  .edu-cards-slide { display: flex; flex-direction: column; gap: 1rem; margin: 0.75rem 0; }
  .edu-card-slide { display: flex; gap: 1.25rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(212,175,55,0.15); border-radius: 12px; padding: 1.25rem; }
  .edu-icon-slide { font-size: 2rem; flex-shrink: 0; }
  .edu-card-body { flex:1; min-width:0; }
  .edu-top-row-s { display:flex; align-items:center; gap:0.75rem; margin-bottom:0.5rem; }
  .edu-badge-s { font-size:0.68rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#D4AF37; background:rgba(212,175,55,0.1); border:1px solid rgba(212,175,55,0.3); padding:0.2rem 0.7rem; border-radius:100px; }
  .edu-cgpa-s  { font-size:0.78rem; color:#6b82a0; }
  .edu-cgpa-s strong { color:#D4AF37; }
  .edu-deg  { font-family: 'Playfair Display', serif; font-size: 1rem; color: #e8edf5; font-weight: 700; line-height:1.3; }
  .edu-maj  { font-size: 0.85rem; color:#D4AF37; font-style: italic; margin-bottom: 0.3rem; }
  .edu-inst { font-size: 0.82rem; color: #9baec8; margin-bottom: 0.6rem; }
  .edu-fyp  { font-size:0.8rem; color:#9baec8; background:rgba(212,175,55,0.06); border-left:2px solid #D4AF37; padding:0.5rem 0.75rem; border-radius:0 6px 6px 0; margin-bottom:0.6rem; line-height:1.5; }
  .fyp-lbl  { font-size:0.68rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#D4AF37; margin-bottom:0.25rem; }
  .fyp-desc-s { font-size:0.78rem; color:#6b82a0; }
  .courses-s { display:flex; flex-direction:column; gap:0.3rem; }
  .course-s  { font-size:0.78rem; color:#9baec8; line-height:1.4; }
  .course-n  { font-weight:600; color:#e8edf5; }
  .course-d  { color:#6b82a0; }
  .cert-section { margin-top:1rem; }
  .cert-row { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top:0.5rem; }

  /* Footer */
  .pres-footer {
    padding: 1rem 2rem;
    border-top: 1px solid rgba(212,175,55,0.12);
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
    background: rgba(10,20,35,0.9);
  }
  .dot-nav { display: flex; gap: 0.4rem; align-items: center; }
  .dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: rgba(255,255,255,0.15); border: none; cursor: pointer;
    transition: all 0.25s; padding: 0;
  }
  .dot.active { background: #D4AF37; width: 24px; border-radius: 4px; }
  .nav-btns { display: flex; gap: 0.75rem; }
  .nav-btn {
    display: flex; align-items: center; gap: 0.4rem;
    background: transparent; border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px; padding: 0.6rem 1.25rem;
    color: #9baec8; cursor: pointer; font-size: 0.875rem;
    font-family: inherit; font-weight: 600; transition: all 0.2s;
  }
  .nav-btn:hover:not(:disabled) { border-color: #D4AF37; color: #D4AF37; }
  .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .nav-btn.primary {
    background: linear-gradient(135deg, #D4AF37, #e8c84a);
    border-color: transparent; color: #0a1422;
  }
  .nav-btn.primary:hover:not(:disabled) { box-shadow: 0 4px 20px rgba(212,175,55,0.4); }

  @media (max-width: 768px) {
    .pres-main { padding: 1.5rem; }
    .skills-3col, .detail-grid { grid-template-columns: 1fr; }
    .exp-header-row, .proj-header-row { flex-direction: column; gap: 0.75rem; }
    .edu-card-slide { flex-direction: column; }
  }
  @media (max-width: 600px) {
    /* Footer: 13 dots + 2 nav-buttons exceed ~326px available — shrink everything */
    .pres-footer { padding: 0.75rem 1rem; gap: 0.5rem; flex-wrap: wrap; }
    .dot { width: 6px; height: 6px; }
    .dot.active { width: 16px; }
    .nav-btn { padding: 0.45rem 0.9rem; font-size: 0.8rem; }
    .pres-header { padding: 0.75rem 1rem; }
    .slide-counter { font-size: 0.75rem; }
    .close-btn { padding: 0.4rem 0.75rem; font-size: 0.78rem; }
  }
</style>
