<script lang="ts">
  import { onMount } from 'svelte';
  import { lang } from '$lib/i18n';
  import { derived } from 'svelte/store';
  import { translations } from '$lib/translations';

  let { onClose }: { onClose: () => void } = $props();
  let currentSlide = $state(0);
  let selectedTech  = $state<string | null>(null);
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

  const projMeta: Record<string, { icon: string; accent: string; tags: string[]; context: string; architecture: string; security: string; impact: string; flow: { icon: string; label: string; detail: string }[] }> = {
    iwa001: {
      icon:'🔐', accent:'#D4AF37', context:'Nova Bitara Development Sdn Bhd',
      tags:['SvelteKit 2.8','TypeScript','Supabase','Tailwind CSS','Vercel','GoDaddy'],
      flow: [
        { icon:'🔑', label:'Daftar / Log Masuk',   detail:'Pengguna daftar & log masuk. Supabase Auth (JWT) mengesahkan identiti & menetapkan role (Pemohon / Pegawai / Admin).' },
        { icon:'📝', label:'Isi Borang Pinjaman',   detail:'Pemohon isi 5 langkah borang pinjaman bercagar — maklumat peribadi, aset cagaran, jumlah, tempoh & penjamin.' },
        { icon:'📄', label:'Muat Naik Dokumen',     detail:'Sistem terima upload IC, slip gaji, geran tanah & dokumen sokongan. Disimpan di Supabase Storage dengan nama unik.' },
        { icon:'👔', label:'Semakan Pegawai',        detail:'Pegawai kaunter semak permohonan, sahkan dokumen & kemaskini status. Dashboard realtime tunjuk semua permohonan aktif.' },
        { icon:'🏛️', label:'Kelulusan Admin',        detail:'Admin terima atau tolak permohonan dengan sebab. Audit trail direkod untuk setiap tindakan — siapa, bila, apa status.' },
        { icon:'📧', label:'Notifikasi Email',       detail:'Sistem hantar email automatik kepada pemohon (lulus/tolak/dokumen kurang). Templat HTML profesional via email SMTP.' },
        { icon:'✅', label:'Pinjaman Diproses',      detail:'Permohonan lulus → data disimpan untuk rekod kewangan. PDF surat kelulusan dijana automatik untuk pemohon.' },
      ],
      architecture: 'SvelteKit (SSR/CSR) → Supabase PostgreSQL + Row Level Security → Vercel Edge deployment → GoDaddy custom domain. 17 halaman: Dashboard, Borang Pinjaman (5 langkah), Muat Naik Dokumen, Semakan Pegawai, Panel Admin, Pengurusan Pengguna, Jana Laporan PDF.',
      security: 'RLS di peringkat database — setiap SQL query disaring mengikut user_id secara automatik. JWT token divalidate pada setiap request. Role-based access: Pemohon / Pegawai / Admin — akses berbeza untuk setiap role. Audit trail untuk semua transaksi pinjaman. HTTPS enforced via Vercel.',
      impact: 'Sistem pengeluaran sebenar mengendalikan aliran kerja pinjaman bercagar yang kompleks. Menggantikan proses manual kertas — menjimatkan masa pemprosesan ~60% dan mengurangkan ralat manusia dalam pengurusan dokumen dan kelulusan.'
    },
    infinity: {
      icon:'🌐', accent:'#6B9FD4', context:'Nova Bitara Development Sdn Bhd',
      tags:['SvelteKit','TypeScript','Vercel','Redis','Resend API','GoDaddy'],
      flow: [
        { icon:'🌍', label:'Pelawat Tiba',          detail:'Pelawat dari seluruh dunia akses laman. Vercel Edge CDN serve halaman dari node terdekat — laju walaupun dari luar negara.' },
        { icon:'🏠', label:'Halaman Utama (SSR)',    detail:'SvelteKit SSR jana HTML di server — SEO-friendly, loading pantas. Kandungan bertukar automatik ikut bahasa (BM/EN/ZH).' },
        { icon:'📰', label:'Blog & Kandungan',       detail:'Artikel korporat dalam 3 bahasa. Content stored dalam format JSON, dinamik dipapar. Editor boleh tukar bahasa dengan 1 klik.' },
        { icon:'✉️', label:'Subscribe Email',        detail:'Pelawat masuk email untuk subscribe newsletter. Form validate format email. Data dihantar ke API endpoint.' },
        { icon:'⚡', label:'Redis Cache (Upstash)',  detail:'Email subscriber disimpan di Redis Upstash — in-memory, super pantas. TTL set untuk buang data lama. Rate limiting prevent spam.' },
        { icon:'📨', label:'Resend API → Email',     detail:'Apabila ada artikel baru, sistem trigger Resend API untuk hantar email broadcast ke semua subscriber. Templat HTML responsive.' },
      ],
      architecture: 'SvelteKit SSR → Vercel Edge Functions → Redis Upstash (subscriber caching + rate limiting) → Resend API (email transaksional) → GoDaddy domain. i18n: Svelte store-based dengan 3 locale (ms/en/zh) — switch instant tanpa reload.',
      security: 'Redis TTL untuk data expiry. Resend API key disimpan sebagai environment variable (bukan expose ke client). HTTPS enforced via Vercel. Input sanitization pada form subscriber — cegah XSS. Rate limiting pada API endpoint untuk prevent email spam.',
      impact: 'Laman web korporat premium berbilang bahasa dengan prestasi tinggi. Menyokong pasaran tempatan (BM), antarabangsa (EN) dan Cina (ZH). Blog subscriber dengan notifikasi email automatik — zero manual work untuk marketing.'
    },
    ecommerce: {
      icon:'🛒', accent:'#F97316', context:'Nova Bitara Development Sdn Bhd',
      tags:['Laravel 11','PHP 8','MySQL','DirectAdmin','Cloudflare','IP Serveron'],
      flow: [
        { icon:'🏪', label:'Pelanggan Layar',        detail:'Pelanggan buka laman, lihat katalog produk dengan gambar, harga & stok. Cloudflare CDN serve aset statik dengan laju.' },
        { icon:'🛒', label:'Tambah ke Troli',        detail:'Produk dipilih → masuk session cart. Kuantiti, variasi & harga dikira secara realtime. Cart kekal walaupun logout (session DB).' },
        { icon:'💳', label:'Checkout & Bayar',       detail:'Pelanggan isi alamat penghantaran, pilih kaedah bayar. Form divalidate client & server-side. CSRF token protect setiap request.' },
        { icon:'📋', label:'Jana Pesanan',            detail:'Laravel cipta rekod pesanan di MySQL, kurangkan stok produk, hantar email resit kepada pelanggan automatik.' },
        { icon:'👨‍💼', label:'Admin Proses',           detail:'Admin login ke dashboard, lihat semua pesanan masuk, kemaskini status (Diproses/Dihantar/Selesai). Export laporan CSV.' },
        { icon:'🛡️', label:'Cloudflare Protect',     detail:'Cloudflare WAF tapis trafik berbahaya. DDoS protection. CDN cache halaman produk untuk loading 5x lebih laju.' },
        { icon:'📦', label:'Fulfillment',             detail:'Pesanan confirmed → pasukan hantar barang. Pelanggan terima tracking number via email. Status dikemaskini dalam sistem.' },
      ],
      architecture: 'Laravel MVC (PHP 8) → MySQL database → DirectAdmin cPanel hosting → IP Serveron domain → Cloudflare CDN & DNS & WAF. Modul: Katalog Produk, Cart (session), Checkout, Pengurusan Pesanan, Auth Pengguna, Dashboard Admin, Laporan Jualan.',
      security: 'Laravel Sanctum authentication + CSRF protection built-in. Cloudflare DDoS protection & WAF (Web Application Firewall). HTTPS SSL/TLS enforced. MySQL prepared statements — cegah SQL injection. Input validation & sanitization pada semua form. Password hashing dengan bcrypt.',
      impact: 'Platform e-dagang penuh untuk jualan produk syarikat dalam tempoh singkat. Cloudflare meningkatkan kelajuan loading 5x & melindungi dari serangan. Admin dashboard mengurangkan kerja manual pengurusan pesanan dan inventori.'
    },
    onboardx: {
      icon:'⚡', accent:'#22C55E', context:'Tenaga Nasional Berhad (TNB)',
      tags:['Flutter','Dart','JavaScript','Firebase','MongoDB','Supabase','MySQL','Azure','Jenkins','Kubernetes'],
      flow: [
        { icon:'👤', label:'Pekerja Baharu Masuk',  detail:'Pekerja baharu terima emel jemputan dari HR. Klik link → download app atau buka web app. Daftar akaun dengan email TNB rasmi.' },
        { icon:'📋', label:'Isi Profil & Data',      detail:'Pekerja isi maklumat peribadi, kemahiran, pengalaman & pilihan jabatan. Data disimpan ke Supabase (structured) & MongoDB (documents).' },
        { icon:'📄', label:'Muat Naik Dokumen',     detail:'Upload IC, sijil, resume, dokumen berkaitan. Firebase Storage simpan fail. Firebase Realtime DB sync status upload secara masa nyata.' },
        { icon:'🏢', label:'Semakan HR Dashboard',  detail:'HR login ke dashboard → lihat semua pekerja baru dalam proses. Filter by status, jabatan, tarikh. Semak & approve dokumen.' },
        { icon:'📚', label:'Tugasan Latihan',        detail:'Sistem assign modul latihan wajib ikut jabatan (Keselamatan, IT, HR Policy). Pekerja complete latihan dalam app. Progress tracked.' },
        { icon:'✅', label:'Onboarding Selesai',     detail:'Semua checklist complete → status "Onboarded". HR terima notifikasi. Pekerja dapat email selamat datang rasmi & akses sistem TNB.' },
        { icon:'☁️', label:'Azure + CI/CD',          detail:'App dihost di Ubuntu server Azure. Jenkins pipeline auto-build & deploy setiap ada push ke main branch. Kubernetes manage scaling.' },
      ],
      architecture: 'Flutter cross-platform app (Web + Mobile) → Multi-database: Firebase Realtime DB (sync), MongoDB (dokumen), Supabase PostgreSQL (berstruktur), MySQL (sistem legacy TNB) → Microsoft Azure Ubuntu server → Jenkins CI/CD pipeline → Kubernetes container orchestration. UI direka Figma → kod Flutter.',
      security: 'Firebase Auth untuk pengesahan pengguna TNB. Role-based access: Pekerja / HR / Admin dengan level akses berbeza. Supabase RLS untuk isolasi data — setiap pekerja nampak data sendiri sahaja. Azure Network Security Groups (NSG) sebagai firewall. CI/CD dengan automated test sebelum setiap deployment ke production.',
      impact: 'Memperkemas proses onboarding pekerja baharu TNB dari proses manual berhari-hari kepada sistem digital. Mengurangkan paperwork, centralised dashboard untuk HR, dan meningkatkan pengalaman pekerja baharu. Dibangunkan dalam persekitaran perusahaan sebenar TNB dengan ramai pengguna.'
    },
    fyp: {
      icon:'🗺️', accent:'#A78BFA', context:'Universiti Teknologi Malaysia (UTM)',
      tags:['SvelteKit','TypeScript','Tailwind CSS','Supabase','Google Maps API','Figma'],
      flow: [
        { icon:'🔐', label:'Log Masuk',              detail:'Pengguna log masuk dengan email UTM. Supabase Auth hantar OTP verification. Selepas sahkan email, akses sistem dibenarkan.' },
        { icon:'📝', label:'Hantar Laporan',         detail:'Pengguna isi borang laporan (jenis isu, penerangan, foto). Sistem detect lokasi GPS automatik menggunakan browser Geolocation API.' },
        { icon:'📍', label:'Simpan + Geomark',       detail:'Laporan disimpan ke Supabase PostgreSQL dengan koordinat GPS. RLS pastikan setiap pengguna nampak laporan sendiri sahaja.' },
        { icon:'🗺️', label:'Peta Interaktif',        detail:'Google Maps API papar semua laporan sebagai marker pada peta UTM. Marker clustering group laporan berdekatan. Klik marker → detail.' },
        { icon:'👨‍💼', label:'Admin Semak',            detail:'Admin login → dashboard tunjuk semua laporan dari semua pengguna. Filter by status, tarikh, kategori. Kemaskini status laporan.' },
        { icon:'📧', label:'Notifikasi Status',       detail:'Bila admin kemaskini status laporan, sistem trigger email automatik kepada pelapor — "Laporan anda sedang diproses / selesai".' },
        { icon:'📊', label:'Laporan & Analitik',     detail:'Admin boleh lihat statistik laporan (heatmap, trend bulanan, jenis isu paling kerap). Export data CSV untuk analisis lanjut.' },
      ],
      architecture: 'SvelteKit SSR → Supabase PostgreSQL + RLS (auth + database) → Google Maps JavaScript API (marker clustering, geofencing, heatmap) → Vercel deployment. Figma wireframe → SvelteKit + Tailwind CSS implementation. Features: Borang laporan, peta interaktif, dashboard admin, status tracking, notifikasi email.',
      security: 'Supabase Auth dengan email verification (OTP). RLS — pengguna hanya nampak & edit laporan sendiri, admin nampak semua. Google Maps API key restricted ke HTTP referrer domain sahaja. Input validation & file upload sanitization untuk lampiran foto laporan. HTTPS enforced via Vercel.',
      impact: 'Menggantikan sistem pelaporan manual UTM (email/hardcopy) kepada sistem digital berpusat. Pengguna boleh submit laporan dengan lokasi GPS tepat dari mana-mana. Admin nampak semua laporan pada peta interaktif — jimat masa pengurusan. Markah FYP: Cemerlang. Diiktiraf panel penyelia UTM.'
    }
  };

  // ── Tech info for clickable skills ──────────────────────────────────────────
  const techInfo: Record<string, { what: string; where: string[] }> = {
    'SvelteKit':         { what: 'Framework web full-stack (SSR + CSR) berasaskan Svelte. Rendering hibrid, file-based routing, TypeScript-first. Sangat pantas & lightweight.', where: ['IWA001 Loan System — 17 halaman + Admin Panel penuh', 'Infinity World — laman korporat + blog i18n 3 bahasa', 'UTM FYP — Sistem Pengurusan Pelaporan', 'Portfolio ini'] },
    'Vue.js':            { what: 'Framework JavaScript progresif menggunakan Composition API & Options API. Reactive data binding, component-based, mudah integrasi.', where: ['YHCM — sistem eMesys (frontend utama)', 'YHCM — sistem Sutera & ADIMS', 'YHCM — Laravel Filament frontend components'] },
    'Flutter (Dart)':    { what: 'UI toolkit cross-platform Google menggunakan bahasa Dart. Satu codebase untuk iOS, Android, Web & Desktop. Hot reload, widget-based UI.', where: ['OnboardX TNB — aplikasi onboarding pekerja (Mobile + Web dari 1 codebase)'] },
    'React.js':          { what: 'Library UI Facebook menggunakan Virtual DOM, JSX & hooks. Ecosystem besar, component reusable, state management dengan Context/Redux.', where: ['Projek peribadi & pembelajaran', 'Eksplorasi dalam persekitaran kerja'] },
    'HTML / CSS':        { what: 'Asas pembangunan web. HTML5 semantik, CSS3 (Flexbox, Grid, animations), Tailwind CSS utility-first, responsive design & mobile-first.', where: ['Semua projek web — IWA001, Infinity, E-Commerce, FYP, Portfolio', 'YHCM — UI maintenance & improvements'] },
    'JavaScript / TS':   { what: 'TypeScript = JavaScript + static typing. Mengurangkan runtime bug, IntelliSense lebih baik, lebih mudah di-maintain dalam projek besar.', where: ['IWA001, Infinity World, UTM FYP, Portfolio — TypeScript penuh', 'E-Commerce (JavaScript), YHCM Vue.js (JavaScript/TypeScript)'] },
    'Laravel (PHP)':     { what: 'Framework PHP MVC dengan Eloquent ORM, Sanctum Auth, Artisan CLI, Blade templating. Standard industri untuk backend PHP.', where: ['Nova Bitara E-Commerce — full platform e-dagang (Laravel 11)', 'YHCM — Laravel Filament admin panel & API backend'] },
    'Node.js':           { what: 'JavaScript runtime untuk server-side. Event-driven, non-blocking I/O. Sesuai untuk API, microservices & real-time apps.', where: ['API utility scripts & server-side helpers', 'Vercel Serverless Functions (Node.js runtime)'] },
    'C# / .NET':         { what: 'Bahasa Microsoft berorientasi objek untuk enterprise apps. Strongly typed, LINQ, Entity Framework, Windows Server environment.', where: ['Kursus Pengaturcaraan Berorientasi Objek — UTM', 'Projek akademik desktop & console application'] },
    'Supabase':          { what: 'Firebase alternatif open-source — PostgreSQL + Auth + Storage + Realtime + Edge Functions. BaaS yang powerful dengan Row Level Security.', where: ['IWA001 — database utama + RLS penuh + Supabase Auth', 'OnboardX TNB — structured data storage untuk data pekerja', 'UTM FYP — auth, database laporan + RLS isolation'] },
    'Docker':            { what: 'Platform containerization — isolate application dalam container. "Build once, run anywhere". Mudah deploy & scale, consistent environment.', where: ['YHCM — deployment & maintenance aplikasi syarikat dalam containers', 'OnboardX TNB — Azure container deployment', 'TNB Cybersecurity — Vulhub Docker environment untuk CVE testing'] },
    'Azure / Vercel':    { what: 'Azure = Microsoft cloud (VMs, AKS, NSG, storage). Vercel = edge deployment platform untuk Next.js/SvelteKit dengan CDN global.', where: ['OnboardX TNB — Ubuntu server di Microsoft Azure (setup, config, maintain)', 'IWA001, Infinity World, UTM FYP, Portfolio — Vercel Edge deployment'] },
    'Splunk SIEM':       { what: 'Platform log management + Security Information & Event Management (SIEM). Collect, index, search & alert dari semua log sistem untuk threat detection.', where: ['TNB Platinum Cybersecurity Internship — pantau aktiviti web TNB daily', 'Bina custom dashboard, set alert rules, detect anomali trafik rangkaian'] },
    'Wireshark':         { what: 'Network packet analyzer — capture dan analisis trafik rangkaian secara mendalam. Decode protocol (TCP/IP, HTTP, DNS, TLS) untuk forensik.', where: ['TNB Cybersecurity — analisis trafik mencurigakan & packet forensics', 'UTM coursework — Network Security & ethical hacking labs'] },
    'Pen Testing':       { what: 'Penetration testing — simulate serangan hacker untuk kenal pasti & exploit kerentanan sistem sebelum penyerang sebenar menemuinya.', where: ['TNB Red Team — Vulhub CVE reproduction & exploitation dalam persekitaran lab', 'UTM — Ethical Hacking & Penetration Testing coursework'] },
    'VPN / Firewall':    { what: 'Virtual Private Network untuk enkripsi trafik & akses selamat ke rangkaian korporat. Firewall rules untuk kawalan akses masuk/keluar.', where: ['TNB — konfigurasi & maintenance VPN & firewall rules enterprise', 'YHCM — network security maintenance & troubleshooting'] },
    'ISO 27001 / NIST':  { what: 'ISO 27001 = piawaian antarabangsa pengurusan keselamatan maklumat (ISMS). NIST = framework keselamatan siber US. Panduan untuk security policy.', where: ['TNB Cybersecurity — implementasi framework dalam persekitaran SOC', 'UTM — Cyber Security Governance & Compliance coursework'] },
    'Network Troubleshoot': { what: 'Diagnosis & penyelesaian masalah rangkaian: TCP/IP stack, DNS lookup, DHCP, routing, switching, WiFi interference, packet loss.', where: ['YHCM — sokongan IT harian untuk semua staf syarikat', 'TNB — pentadbiran & troubleshoot rangkaian perusahaan berskala besar', 'Nova Bitara — sokongan rangkaian & infrastruktur syarikat'] },
    'MySQL':             { what: 'RDBMS popular untuk web apps. SQL queries, indexing, foreign keys, transactions, stored procedures. Percuma & reliable untuk production.', where: ['Nova Bitara E-Commerce — database utama semua data produk & pesanan', 'OnboardX TNB — integrasi sistem legacy TNB', 'YHCM — pengurusan database & optimisasi query harian'] },
    'PostgreSQL':        { what: 'Advanced open-source RDBMS — lebih powerful dari MySQL. JSON/JSONB support, advanced indexing, full-text search, Row Level Security.', where: ['IWA001 via Supabase — semua data pinjaman & pengguna', 'UTM FYP via Supabase — data laporan & koordinat GPS'] },
    'MongoDB':           { what: 'NoSQL document database — schema flexible, JSON-like BSON. Ideal untuk data tidak berstruktur, cepat untuk read/write operasi besar.', where: ['OnboardX TNB — storan dokumen pekerja (CV, sijil, borang)'] },
    'Firebase':          { what: 'Google BaaS — Realtime Database, Firestore, Auth, Cloud Functions, Storage, Push Notifications. Ideal untuk mobile apps dengan sync realtime.', where: ['OnboardX TNB — realtime data sync status onboarding & push notifications kepada pekerja'] },
    'Redis':             { what: 'In-memory data store — super pantas (microseconds). Ideal untuk caching, session management, rate limiting, pub/sub messaging, queue.', where: ['Infinity World — Upstash Redis untuk cache data subscriber blog & rate limiting form subscribe'] },
    'Jenkins':           { what: 'Open-source CI/CD automation server — automate build, test & deploy pipeline. Plugins untuk integrasi dengan Git, Docker, Kubernetes.', where: ['OnboardX TNB — setup & explore Jenkins CI/CD pipeline untuk auto-deploy ke Azure'] },
    'Kubernetes':        { what: 'Container orchestration platform — auto-scaling, load balancing, self-healing, rolling deployment. Manage Docker containers dalam cluster.', where: ['OnboardX TNB — explore & setup Kubernetes orchestration untuk containers di Azure'] },
    'Cloudflare':        { what: 'CDN + DDoS protection + WAF + DNS management + SSL. Protect & accelerate website. 200+ global edge nodes untuk deliver content pantas.', where: ['Nova Bitara E-Commerce — CDN, DDoS shield, WAF & DNS management', 'Infinity World — DNS management & proxy protection'] },
    'Kali Linux':        { what: 'Linux distribution khusus untuk penetration testing & digital forensics. 600+ security tools built-in: Metasploit, Nmap, Burp Suite, Aircrack-ng.', where: ['TNB Cybersecurity Internship — pen testing environment & CVE analysis', 'UTM — Ethical Hacking labs & security research'] },
    'Git':               { what: 'Distributed version control system — track perubahan kod, branching strategy (Git Flow), merging, conflict resolution. GitHub untuk remote collaboration.', where: ['Semua projek profesional: IWA001, Infinity, E-Commerce, OnboardX, FYP', 'YHCM & semua workplace projects'] },
    'Figma':             { what: 'UI/UX design tool berbasiskan cloud — wireframing, prototyping, component system, auto-layout, design tokens & developer handoff.', where: ['OnboardX TNB — reka bentuk UI/UX keseluruhan app dari scratch ke handoff', 'UTM FYP — wireframe & high-fidelity prototype sebelum code'] },
    'Power BI':          { what: 'Microsoft data visualization & BI tool. Bina dashboard interaktif, connect ke pelbagai data source (SQL, Excel, API), share insights.', where: ['TNB — data reporting & analytics dashboard untuk pengurusan', 'Sijil Microsoft Power BI Data Analysis — Cisco Networking Academy'] },
    'MariaDB':           { what: 'Fork MySQL yang 100% compatible — lebih pantas, lebih stabil untuk workload tinggi. Same SQL syntax, better performance & more features.', where: ['YHCM — database utama sistem eMesys, Sutera & ADIMS (MariaDB server)'] },
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

      <!-- Flow pipeline -->
      <div class="flow-section">
        <div class="detail-section-title" style="margin-bottom:0.75rem">🔄 Aliran Sistem</div>
        <div class="flow-pipe">
          {#each meta.flow as step, i}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              class="flow-step"
              class:flow-step-active={selectedTech === `flow-${key}-${i}`}
              style="--ac:{meta.accent}"
              onclick={() => selectedTech = selectedTech === `flow-${key}-${i}` ? null : `flow-${key}-${i}`}
              title={step.detail}
            >
              <span class="flow-icon">{step.icon}</span>
              <span class="flow-label">{step.label}</span>
            </div>
            {#if i < meta.flow.length - 1}
              <span class="flow-arrow" style="color:{meta.accent}">→</span>
            {/if}
          {/each}
        </div>
        {#if selectedTech?.startsWith(`flow-${key}-`)}
          {@const idx = parseInt(selectedTech.split('-').at(-1) ?? '0')}
          <div class="flow-detail-box" style="border-color:{meta.accent}40;background:{meta.accent}08">
            <strong style="color:{meta.accent}">{meta.flow[idx].icon} {meta.flow[idx].label}</strong>
            <p>{meta.flow[idx].detail}</p>
          </div>
        {/if}
      </div>

      <div class="detail-grid" style="margin-top:0.75rem">
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
      <p class="slide-desc">{$t.skills.desc} <span class="skills-hint">— klik mana-mana teknologi untuk maklumat lanjut</span></p>
      <div class="skills-3col">
        <div class="skill-block">
          <div class="skill-block-title" style="color:#61DAFB">🎨 {$t.skills.frontend}</div>
          {#each [{n:'SvelteKit',v:90},{n:'Vue.js',v:85},{n:'Flutter (Dart)',v:82},{n:'React.js',v:70},{n:'HTML / CSS',v:88},{n:'JavaScript / TS',v:85}] as s}
            <button
              class="skill-row-bar skill-clickable"
              class:skill-selected={selectedTech === s.n}
              onclick={() => selectedTech = selectedTech === s.n ? null : s.n}
              aria-pressed={selectedTech === s.n}
            >
              <div class="srb-label"><span>{s.n}</span><span style="color:#61DAFB">{s.v}%</span></div>
              <div class="srb-track"><div class="srb-fill" style="width:{s.v}%;background:#61DAFB"></div></div>
            </button>
          {/each}
        </div>
        <div class="skill-block">
          <div class="skill-block-title" style="color:#FF6B6B">☁️ {$t.skills.backend}</div>
          {#each [{n:'Laravel (PHP)',v:85},{n:'Node.js',v:72},{n:'C# / .NET',v:65},{n:'Supabase',v:88},{n:'Docker',v:80},{n:'Azure / Vercel',v:75}] as s}
            <button
              class="skill-row-bar skill-clickable"
              class:skill-selected={selectedTech === s.n}
              onclick={() => selectedTech = selectedTech === s.n ? null : s.n}
              aria-pressed={selectedTech === s.n}
            >
              <div class="srb-label"><span>{s.n}</span><span style="color:#FF6B6B">{s.v}%</span></div>
              <div class="srb-track"><div class="srb-fill" style="width:{s.v}%;background:#FF6B6B"></div></div>
            </button>
          {/each}
        </div>
        <div class="skill-block">
          <div class="skill-block-title" style="color:#D4AF37">🛡️ {$t.skills.security}</div>
          {#each [{n:'Splunk SIEM',v:75},{n:'Wireshark',v:78},{n:'Pen Testing',v:68},{n:'VPN / Firewall',v:80},{n:'ISO 27001 / NIST',v:70},{n:'Network Troubleshoot',v:85}] as s}
            <button
              class="skill-row-bar skill-clickable"
              class:skill-selected={selectedTech === s.n}
              onclick={() => selectedTech = selectedTech === s.n ? null : s.n}
              aria-pressed={selectedTech === s.n}
            >
              <div class="srb-label"><span>{s.n}</span><span style="color:#D4AF37">{s.v}%</span></div>
              <div class="srb-track"><div class="srb-fill" style="width:{s.v}%;background:#D4AF37"></div></div>
            </button>
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
            {#each ['MySQL','MariaDB','PostgreSQL','MongoDB','Firebase','Redis','Jenkins','Kubernetes','Cloudflare','Kali Linux','Git','Figma','Power BI'] as s}
              <button
                class="chip chip-btn"
                class:chip-active={selectedTech === s}
                onclick={() => selectedTech = selectedTech === s ? null : s}
                aria-pressed={selectedTech === s}
              >{s}</button>
            {/each}
          </div>
        </div>
      </div>

      <!-- Tech detail panel -->
      {#if selectedTech && techInfo[selectedTech]}
        {@const info = techInfo[selectedTech]}
        <div class="tech-panel" role="region" aria-label="Maklumat teknologi">
          <div class="tech-panel-header">
            <span class="tech-panel-name">{selectedTech}</span>
            <button class="tech-panel-close" onclick={() => selectedTech = null} aria-label="Tutup">✕</button>
          </div>
          <p class="tech-panel-what">{info.what}</p>
          <div class="tech-panel-where-label">📍 Digunakan dalam:</div>
          <ul class="tech-panel-where">
            {#each info.where as w}
              <li>{w}</li>
            {/each}
          </ul>
        </div>
      {/if}
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

  /* ── Flow pipeline ──────────────────────────────────────────────────────── */
  .flow-section { margin-bottom: 0.5rem; }
  .flow-pipe {
    display: flex; align-items: center; flex-wrap: wrap; gap: 0.35rem;
    padding: 0.75rem 0;
  }
  .flow-step {
    display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px; padding: 0.55rem 0.75rem;
    cursor: pointer; transition: background 0.2s, border-color 0.2s, transform 0.15s;
    min-width: 80px; text-align: center;
  }
  .flow-step:hover { border-color: var(--ac, #D4AF37); background: rgba(212,175,55,0.06); transform: translateY(-2px); }
  .flow-step-active { border-color: var(--ac, #D4AF37) !important; background: rgba(212,175,55,0.1) !important; }
  .flow-icon  { font-size: 1.2rem; line-height: 1; }
  .flow-label { font-size: 0.68rem; font-weight: 600; color: #9baec8; line-height: 1.2; letter-spacing: 0.02em; }
  .flow-arrow { font-size: 1.1rem; opacity: 0.4; flex-shrink: 0; }
  .flow-detail-box {
    border: 1px solid; border-radius: 8px; padding: 0.85rem 1rem;
    margin-top: 0.5rem; animation: fadeIn 0.2s ease;
  }
  .flow-detail-box strong { display: block; font-size: 0.85rem; margin-bottom: 0.4rem; }
  .flow-detail-box p { font-size: 0.82rem; color: #9baec8; line-height: 1.65; margin: 0; }

  /* ── Clickable skills ────────────────────────────────────────────────────── */
  .skill-clickable {
    width: 100%; background: none; border: none; padding: 0; cursor: pointer;
    text-align: left; border-radius: 6px;
    transition: background 0.15s; margin-bottom: 0.65rem;
  }
  .skill-clickable:hover { background: rgba(255,255,255,0.04); }
  .skill-selected { background: rgba(212,175,55,0.08) !important; border-radius: 6px; }
  .skills-hint { font-size: 0.78rem; color: #4a6080; font-style: italic; }

  .chip-btn {
    cursor: pointer; background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }
  .chip-btn:hover { border-color: rgba(212,175,55,0.5); color: #D4AF37; background: rgba(212,175,55,0.08); }
  .chip-active { background: rgba(212,175,55,0.15) !important; border-color: rgba(212,175,55,0.5) !important; color: #D4AF37 !important; }

  /* ── Tech detail panel ───────────────────────────────────────────────────── */
  .tech-panel {
    margin-top: 1rem;
    background: linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.04));
    border: 1px solid rgba(212,175,55,0.3); border-radius: 12px; padding: 1.25rem 1.5rem;
    animation: slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .tech-panel-header {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;
  }
  .tech-panel-name {
    font-size: 1rem; font-weight: 700; color: #D4AF37; letter-spacing: 0.04em;
  }
  .tech-panel-close {
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px; color: #6b82a0; cursor: pointer; font-size: 0.8rem;
    width: 26px; height: 26px; display:flex; align-items:center; justify-content:center;
    transition: background 0.15s, color 0.15s;
  }
  .tech-panel-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
  .tech-panel-what {
    font-size: 0.87rem; color: #c8d5e6; line-height: 1.7; margin: 0 0 1rem;
  }
  .tech-panel-where-label {
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
    color: #D4AF37; margin-bottom: 0.5rem;
  }
  .tech-panel-where {
    list-style: none; display: flex; flex-direction: column; gap: 0.35rem; margin: 0; padding: 0;
  }
  .tech-panel-where li {
    display: flex; align-items: flex-start; gap: 0.5rem;
    font-size: 0.82rem; color: #9baec8; line-height: 1.5;
  }
  .tech-panel-where li::before {
    content: '→'; color: #D4AF37; flex-shrink: 0; font-weight: 700;
  }

  @media (max-width: 768px) {
    .pres-main { padding: 1.5rem; }
    .skills-3col, .detail-grid { grid-template-columns: 1fr; }
    .exp-header-row, .proj-header-row { flex-direction: column; gap: 0.75rem; }
    .edu-card-slide { flex-direction: column; }
    .flow-pipe { gap: 0.25rem; }
    .flow-step { min-width: 64px; padding: 0.4rem 0.5rem; }
    .flow-label { font-size: 0.6rem; }
    .flow-icon  { font-size: 1rem; }
  }
  @media (max-width: 600px) {
    /* Footer: dots + 2 nav-buttons exceed ~326px available — shrink everything */
    .pres-footer { padding: 0.75rem 1rem; gap: 0.5rem; flex-wrap: wrap; }
    .dot { width: 6px; height: 6px; }
    .dot.active { width: 16px; }
    .nav-btn { padding: 0.45rem 0.9rem; font-size: 0.8rem; }
    .pres-header { padding: 0.75rem 1rem; }
    .slide-counter { font-size: 0.75rem; }
    .close-btn { padding: 0.4rem 0.75rem; font-size: 0.78rem; }
    .flow-arrow { display: none; }
    .flow-step { min-width: 58px; }
  }
</style>
