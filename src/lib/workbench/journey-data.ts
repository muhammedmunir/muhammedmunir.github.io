export interface JourneyStep {
  id: string;
  stepNumber: number;
  track: 'education' | 'career';
  yearShort: string;
  period: { ms: string; en: string };
  badge: { ms: string; en: string };
  title: { ms: string; en: string };
  org: string;
  location: string;
  meta: { ms: string; en: string };
  summary: { ms: string; en: string };
  tags: string[];
  accent: string;
}

export const JOURNEY_STEPS: readonly JourneyStep[] = Object.freeze([
  {
    id: 'edu-diploma',
    stepNumber: 1,
    track: 'education',
    yearShort: '2017-2020',
    period: { ms: '2017 - 2020', en: '2017 - 2020' },
    badge: { ms: 'BELAJAR 01 · DIPLOMA UTM', en: 'STUDY 01 · UTM DIPLOMA' },
    title: { ms: 'Diploma in Computer Science', en: 'Diploma in Computer Science' },
    org: 'Universiti Teknologi Malaysia (UTM)',
    location: 'Kuala Lumpur',
    meta: {
      ms: 'CGPA 2.72 · FYP: E-Commerce Web Platform (PHP, MySQL, Azure Ubuntu)',
      en: 'CGPA 2.72 · FYP: E-Commerce Web Platform (PHP, MySQL, Azure Ubuntu)'
    },
    summary: {
      ms: 'Memulakan pengajian sains komputer di UTM Kuala Lumpur dengan fokus pengaturcaraan berorientasikan objek (C#, C++, Java) dan pembangunan web. Membina Projek Tahun Akhir (FYP) platform e-dagang lengkap dengan pengesahan pengguna, katalog, dan aliran pembayaran.',
      en: 'Started computer science studies at UTM Kuala Lumpur focusing on object-oriented programming (C#, C++, Java) and web development. Built an E-Commerce Web Platform Final Year Project featuring user authentication, catalog management, and payment flows.'
    },
    tags: ['C# / C++ / Java', 'PHP & MySQL', 'Azure Ubuntu', 'UTM Kuala Lumpur'],
    accent: '#0284c7'
  },
  {
    id: 'work-tnb-ict',
    stepNumber: 2,
    track: 'career',
    yearShort: '2019-2020',
    period: { ms: 'Dis 2019 - Feb 2020', en: 'Dec 2019 - Feb 2020' },
    badge: { ms: 'KERJAYA 01 · LATIHAN INDUSTRI PERTAMA', en: 'CAREER 01 · FIRST INTERNSHIP' },
    title: {
      ms: 'Information & Communication Technology (Internship)',
      en: 'Information & Communication Technology (Internship)'
    },
    org: 'Tenaga Nasional Berhad (TNB)',
    location: 'Kota Bharu, Kelantan',
    meta: {
      ms: 'Pemetaan Topologi Gentian Optik & Ujian Redaman Isyarat',
      en: 'Fiber-Optic Route Topology Mapping & Signal Attenuation Testing'
    },
    summary: {
      ms: 'Memetakan topologi laluan gentian optik serantau menggunakan Google Earth, mengira jarak laluan tepat serta model anggaran kos pemasangan dalam Excel, dan membantu jurutera rangkaian menjalankan ujian redaman isyarat (signal attenuation) serta audit fizikal.',
      en: 'Mapped regional fiber-optic route topologies using Google Earth, computed precision route distances and deployment costing models in Excel, and assisted network engineers with signal attenuation testing and physical audits.'
    },
    tags: ['Fiber-Optic Topology', 'Signal Attenuation', 'Google Earth', 'Network Audit'],
    accent: '#0ea5e9'
  },
  {
    id: 'edu-degree',
    stepNumber: 3,
    track: 'education',
    yearShort: '2021-2024',
    period: { ms: '2021 - 2024', en: '2021 - 2024' },
    badge: { ms: 'BELAJAR 02 · IJAZAH SARJANA MUDA UTM', en: 'STUDY 02 · UTM BACHELOR DEGREE' },
    title: {
      ms: 'Bachelor of Computer Science (Network Security)',
      en: 'Bachelor of Computer Science (Network Security)'
    },
    org: 'Universiti Teknologi Malaysia (UTM)',
    location: 'Johor Bahru, Johor',
    meta: {
      ms: 'CGPA 3.17 · FYP: Geospatial Reporting Management System for UTM',
      en: 'CGPA 3.17 · FYP: Geospatial Reporting Management System for UTM'
    },
    summary: {
      ms: 'Melanjutkan pengajian ke peringkat Ijazah Sarjana Muda Sains Komputer (Keselamatan Rangkaian) di UTM Johor Bahru. Mendalami Ethical Hacking & Penetration Testing, Cybersecurity Governance, serta membangunkan FYP Geospatial Reporting System (SvelteKit, Tailwind, Google Maps API, Supabase) dan memperoleh 5 sijil Cisco.',
      en: 'Advanced to a Bachelor of Computer Science (Network Security) at UTM Johor Bahru. Specialized in Ethical Hacking & Penetration Testing and Cybersecurity Governance, built the UTM Geospatial Reporting System FYP (SvelteKit, Tailwind, Google Maps API, Supabase), and earned 5 Cisco certifications.'
    },
    tags: ['Network Security', 'Ethical Hacking', 'SvelteKit & Supabase', '5x Cisco Certs'],
    accent: '#2563eb'
  },
  {
    id: 'work-tnb-soc',
    stepNumber: 4,
    track: 'career',
    yearShort: '2023-2024',
    period: { ms: 'Sept 2023 - Feb 2024', en: 'Sept 2023 - Feb 2024' },
    badge: { ms: 'KERJAYA 02 · PERTAHANAN SIBER SOC', en: 'CAREER 02 · SOC THREAT DEFENSE' },
    title: {
      ms: 'Cyber Security Threat Defense (Internship)',
      en: 'Cyber Security Threat Defense (Internship)'
    },
    org: 'Tenaga Nasional Berhad (TNB)',
    location: 'Platinum Bangsar, Kuala Lumpur',
    meta: {
      ms: 'Pemantauan Splunk SIEM · Makmal Red Team Vulhub · Pematuhan ISO 27001',
      en: 'Splunk SIEM Monitoring · Red Team Vulhub Labs · ISO 27001 Compliance'
    },
    summary: {
      ms: 'Memantau trafik rangkaian perusahaan dan log akses web secara masa nyata menggunakan papan pemuka Splunk SIEM dalam persekitaran SOC aktif. Bekerjasama dengan Red Team menggunakan makmal Docker Vulhub untuk menganalisis kerentanan CVE, serta membantu Blue Team dalam audit log dan penjajaran ISO 27001 / NIST.',
      en: 'Monitored real-time enterprise network traffic and web access logs via Splunk SIEM dashboards inside an active SOC. Collaborated with the Red Team using Vulhub Docker labs to reproduce CVEs, and assisted the Blue Team in defense hardening, log audits, and ISO 27001 / NIST alignment.'
    },
    tags: ['Splunk SIEM', 'Vulhub Docker CVE', 'Red & Blue Team', 'ISO 27001 & NIST'],
    accent: '#6366f1'
  },
  {
    id: 'work-tnb-protege',
    stepNumber: 5,
    track: 'career',
    yearShort: '2025',
    period: { ms: 'Apr 2025 - Dis 2025', en: 'Apr 2025 - Dec 2025' },
    badge: { ms: 'KERJAYA 03 · KEJURUTERAAN MOBILITI', en: 'CAREER 03 · ENTERPRISE MOBILITY' },
    title: {
      ms: 'Enterprise Mobility Solutions (Protégé)',
      en: 'Enterprise Mobility Solutions (Protégé)'
    },
    org: 'Tenaga Nasional Berhad (TNB)',
    location: 'UOA Business Park, Shah Alam',
    meta: {
      ms: 'Pembangunan Full-Stack Aplikasi Korporat ONBOARDX',
      en: 'Full-Stack Engineering of ONBOARDX Corporate App'
    },
    summary: {
      ms: 'Menerajui pembangunan full-stack aplikasi onboarding korporat ONBOARDX menggunakan Flutter (Dart) dan JavaScript. Membangunkan seni bina berbilang pangkalan data (Firebase, MongoDB, Supabase, MySQL), mengurus pelayan awan Ubuntu di Microsoft Azure (NSG), serta mengautomasikan binaan dengan Jenkins CI/CD.',
      en: 'Spearheaded full-stack development of the ONBOARDX enterprise onboarding application using Flutter (Dart) and JavaScript. Engineered multi-database architecture (Firebase, MongoDB, Supabase, MySQL), configured Azure Ubuntu cloud servers (NSG), and automated pipelines with Jenkins CI/CD.'
    },
    tags: ['Flutter (Dart)', 'Firebase / MongoDB / MySQL', 'Azure Ubuntu NSG', 'Jenkins CI/CD'],
    accent: '#0284c7'
  },
  {
    id: 'work-nova-bitara',
    stepNumber: 6,
    track: 'career',
    yearShort: '2025-2026',
    period: { ms: 'Dis 2025 - Mac 2026', en: 'Dec 2025 - Mar 2026' },
    badge: { ms: 'KERJAYA 04 · PEMBANGUN WEB & SISTEM', en: 'CAREER 04 · WEB & SYSTEMS DEVELOPER' },
    title: {
      ms: 'IT Support & Web Developer',
      en: 'IT Support & Web Developer'
    },
    org: 'Nova Bitara Development Sdn Bhd',
    location: 'Sunway, Selangor',
    meta: {
      ms: 'IWA001 Loan System · Infinity World Portal · E-Dagang Laravel',
      en: 'IWA001 Loan System · Infinity World Portal · Laravel E-Commerce'
    },
    summary: {
      ms: 'Membangunkan dan melancarkan Sistem Permohonan Pinjaman Bercagar produksi IWA001 (SvelteKit, Supabase RLS, JWT), portal korporat 3 bahasa Infinity World (SvelteKit, Redis, Resend API), serta menyelenggara platform e-dagang komersial Laravel/MySQL dengan Cloudflare WAF/CDN dan sokongan IT dalaman.',
      en: 'Engineered and deployed the production IWA001 Collateralized Loan System (SvelteKit, Supabase RLS, JWT), built the trilingual Infinity World corporate portal (SvelteKit, Redis, Resend API), and maintained a commercial Laravel/MySQL e-commerce platform with Cloudflare WAF/CDN and internal IT support.'
    },
    tags: ['SvelteKit', 'Supabase RLS & JWT', 'Redis & Resend', 'Cloudflare WAF'],
    accent: '#f59e0b'
  },
  {
    id: 'work-yhcm',
    stepNumber: 7,
    track: 'career',
    yearShort: '2026-Kini',
    period: { ms: 'Apr 2026 - Kini', en: 'Apr 2026 - Present' },
    badge: { ms: 'KERJAYA 05 · JAWATAN SEMASA', en: 'CAREER 05 · CURRENT ROLE' },
    title: {
      ms: 'Full-Stack Developer',
      en: 'Full-Stack Developer'
    },
    org: 'YHCM Sdn Bhd',
    location: 'Shah Alam, Selangor',
    meta: {
      ms: 'Penyelenggaraan, Modul Baharu & Bug Fix: EMESYS, SUTERA & ADiMS',
      en: 'Maintenance, New Modules & Bug Fixing: EMESYS, SUTERA & ADiMS'
    },
    summary: {
      ms: 'Menyelenggara sistem, membangunkan modul baharu, dan membaiki pepijat bagi 3 sistem web perusahaan kritikal sektor awam (EMESYS, SUTERA, ADiMS) dengan pematuhan RBAC dan audit. Membina antara muka Vue.js 3 dan aliran kerja Laravel Filament, mengoptimumkan PostgreSQL 17, MySQL & MariaDB, serta mengurus kluster Docker Swarm di atas Linux & Windows Server.',
      en: 'Maintain systems, develop new modules, and fix bugs across 3 mission-critical public sector enterprise systems (EMESYS, SUTERA, ADiMS) under strict RBAC and audit standards. Build Vue.js 3 interfaces and Laravel Filament workflows, optimize PostgreSQL 17, MySQL & MariaDB, and orchestrate Docker Swarm clusters on Linux & Windows Server.'
    },
    tags: ['Vue.js 3', 'Laravel Filament', 'PostgreSQL 17 & MySQL', 'Docker Swarm'],
    accent: '#10b981'
  }
]);
