export const INITIAL_STATE = Object.freeze({ connected: false, opened: false, identity: null, module: 0 });

export const MODULES = Object.freeze([
  // === KATEGORI 1: SISTEM DISENGGARA (MAINTAINED SYSTEMS - YHCM SDN BHD) ===
  {
    id: 'emesys',
    code: 'MAINT-01',
    category: 'maintained',
    categoryLabel: { ms: 'Sistem Disenggara (YHCM)', en: 'Maintained System (YHCM)' },
    name: 'EMESYS',
    company: 'YHCM Sdn Bhd',
    badge: 'SEKTOR AWAM · DISENGGARA',
    badgeEn: 'PUBLIC SECTOR · MAINTAINED',
    accent: '#0f766e',
    accessType: 'restricted',
    accessLabel: 'Sistem Dalaman Agensi · Kod Sulit',
    accessLabelEn: 'Internal Agency System · Confidential Code',
    role: 'Full-Stack Developer: Penyelenggaraan Sistem, Pembangunan Modul & Pembaikan Pepijat (YHCM)',
    roleEn: 'Full-Stack Developer: System Maintenance, New Module Development & Bug Fixing (YHCM)',
    stack: ['Vue.js 3', 'Laravel Filament', 'MySQL / MariaDB', 'Docker'],
    dataArchitecture: 'Pangkalan data relasi bersepadu dengan pengasingan skema pengguna dan jejak audit transaksi berkanun.',
    dataArchitectureEn: 'Integrated relational database with user schema isolation and statutory transaction audit trails.',
    securityAccess: 'Kawalan akses berasaskan peranan (RBAC) menyekat capaian rekod kewangan dan pengurusan kepada pegawai bertauliah.',
    securityAccessEn: 'Role-based access control (RBAC) restricts financial and management records to authorized officers.'
  },
  {
    id: 'sutera',
    code: 'MAINT-02',
    category: 'maintained',
    categoryLabel: { ms: 'Sistem Disenggara (YHCM)', en: 'Maintained System (YHCM)' },
    name: 'SUTERA',
    company: 'YHCM Sdn Bhd',
    badge: 'SEKTOR AWAM · DISENGGARA',
    badgeEn: 'PUBLIC SECTOR · MAINTAINED',
    accent: '#1d4ed8',
    accessType: 'restricted',
    accessLabel: 'Sistem Dalaman Agensi · Kod Sulit',
    accessLabelEn: 'Internal Agency System · Confidential Code',
    role: 'Full-Stack Developer: Penyelenggaraan Sistem, Pembangunan Modul & Pembaikan Pepijat (YHCM)',
    roleEn: 'Full-Stack Developer: System Maintenance, New Module Development & Bug Fixing (YHCM)',
    stack: ['Vue.js 3', 'Laravel Filament', 'PostgreSQL 17', 'Docker Swarm'],
    dataArchitecture: 'Sistem pengurusan operasi awam dengan pengindeksan PostgreSQL 17 pantas dan kluster kontena Docker Swarm.',
    dataArchitectureEn: 'Public operations management system with fast PostgreSQL 17 indexing and Docker Swarm container clusters.',
    securityAccess: 'Lapisan gerbang API memisahkan borang capaian awam daripada repositori data dalaman agensi.',
    securityAccessEn: 'API gateway layer isolates public access forms from internal agency data repositories.'
  },
  {
    id: 'adims',
    code: 'MAINT-03',
    category: 'maintained',
    categoryLabel: { ms: 'Sistem Disenggara (YHCM)', en: 'Maintained System (YHCM)' },
    name: 'ADiMS',
    company: 'YHCM Sdn Bhd',
    badge: 'SEKTOR AWAM · DISENGGARA',
    badgeEn: 'PUBLIC SECTOR · MAINTAINED',
    accent: '#4338ca',
    accessType: 'restricted',
    accessLabel: 'Sistem Dalaman Agensi · Kod Sulit',
    accessLabelEn: 'Internal Agency System · Confidential Code',
    role: 'Full-Stack Developer: Penyelenggaraan Sistem, Pembangunan Modul & Pembaikan Pepijat (YHCM)',
    roleEn: 'Full-Stack Developer: System Maintenance, New Module Development & Bug Fixing (YHCM)',
    stack: ['Vue.js 3', 'Laravel API', 'PostgreSQL 17', 'Linux Server'],
    dataArchitecture: 'Struktur pangkalan data modular yang memisahkan lapisan analitis daripada jadual transaksi utama.',
    dataArchitectureEn: 'Modular database structure separating the analytical layer from core transactional tables.',
    securityAccess: 'Pengesahan identiti berganda dan token sesi mengehadkan mutasi data kepada pentadbir berdaftar.',
    securityAccessEn: 'Multi-layer identity verification and session tokens restrict data mutations to registered administrators.'
  },

  // === KATEGORI 2: PROJEK DIBANGUNKAN (ENGINEERED / BUILT PROJECTS) ===
  {
    id: 'onboardx',
    code: 'BUILD-01',
    category: 'built',
    categoryLabel: { ms: 'Projek Dibangunkan', en: 'Engineered Project' },
    name: 'ONBOARDX',
    company: 'TNB / Enterprise Mobility',
    badge: 'KORPORAT · DIBANGUNKAN',
    badgeEn: 'CORPORATE · ENGINEERED',
    accent: '#0284c7',
    accessType: 'private_corp',
    accessLabel: 'Projek Dalaman Korporat TNB',
    accessLabelEn: 'TNB Internal Corporate Project',
    role: 'Protégé Developer: Pembangunan Full-Stack Aplikasi Onboarding (TNB Enterprise Mobility)',
    roleEn: 'Protégé Developer: Full-Stack Onboarding App Development (TNB Enterprise Mobility)',
    stack: ['Flutter (Dart)', 'JavaScript', 'Azure Ubuntu', 'Jenkins CI/CD'],
    dataArchitecture: 'Aplikasi onboarding merentas platform dengan penyelarasan Firebase, MongoDB, Supabase, dan MySQL di Azure.',
    dataArchitectureEn: 'Cross-platform onboarding application synchronizing Firebase, MongoDB, Supabase, and MySQL on Azure.',
    securityAccess: 'Capaian teras data terikat kepada pengesahan korporat dan kawalan Network Security Group (NSG) Azure.',
    securityAccessEn: 'Core data access bound to corporate authentication and Azure Network Security Group (NSG) controls.'
  },
  {
    id: 'iwa001',
    code: 'BUILD-02',
    category: 'built',
    categoryLabel: { ms: 'Projek Dibangunkan', en: 'Engineered Project' },
    name: 'IWA001 Loan System',
    company: 'Nova Bitara',
    badge: 'FINTECH · DIBANGUNKAN',
    badgeEn: 'FINTECH · ENGINEERED',
    accent: '#b45309',
    accessType: 'case_study',
    accessLabel: 'Kajian Kes PDF',
    accessLabelEn: 'PDF Case Study',
    caseStudyUrl: '/docs/iwa001-case-study.pdf',
    role: 'Web & Systems Developer: Pembangunan Sistem Pinjaman Bercagar (Nova Bitara)',
    roleEn: 'Web & Systems Developer: Collateralized Loan System Engineering (Nova Bitara)',
    stack: ['SvelteKit', 'TypeScript', 'Supabase RLS', 'JWT Auth'],
    dataArchitecture: 'Sistem pinjaman bercagar 17 halaman dengan kalkulator LTV automatik (60% LTV, 8% APR) atas Supabase PostgreSQL.',
    dataArchitectureEn: '17-page collateralized loan platform with automated LTV calculator (60% LTV, 8% APR) on Supabase PostgreSQL.',
    securityAccess: 'Polisi Row Level Security (RLS) Supabase dan token JWT mengasingkan rekod peminjam daripada akses luar.',
    securityAccessEn: 'Supabase Row Level Security (RLS) policies and JWT tokens isolate borrower records from external access.'
  },
  {
    id: 'infinity',
    code: 'BUILD-03',
    category: 'built',
    categoryLabel: { ms: 'Projek Dibangunkan', en: 'Engineered Project' },
    name: 'Infinity World Portal',
    company: 'Nova Bitara',
    badge: 'PORTAL · DIBANGUNKAN',
    badgeEn: 'PORTAL · ENGINEERED',
    accent: '#0369a1',
    accessType: 'live_and_doc',
    accessLabel: 'Kajian Kes PDF',
    accessLabelEn: 'PDF Case Study',
    caseStudyUrl: '/docs/infinity-landing-case-study.pdf',
    liveUrl: 'https://www.infinityworld.ai/',
    role: 'Web & Systems Developer: Pembangunan Portal Korporat 3 Bahasa (Nova Bitara)',
    roleEn: 'Web & Systems Developer: Trilingual Corporate Portal Engineering (Nova Bitara)',
    stack: ['SvelteKit', 'Redis', 'Resend API', 'Cloudflare WAF'],
    dataArchitecture: 'Portal korporat 3 bahasa (EN/MS/ZH) dengan penguncian slot temu janji masa nyata menggunakan Redis.',
    dataArchitectureEn: 'Trilingual corporate portal (EN/MS/ZH) with real-time appointment slot locking powered by Redis.',
    securityAccess: 'Dilindungi oleh Cloudflare WAF/CDN, sanitasi input ketat, dan pengesahan kunci slot Redis.',
    securityAccessEn: 'Protected by Cloudflare WAF/CDN, strict input sanitization, and Redis slot-lock verification.'
  },
  {
    id: '9router',
    code: 'BUILD-04',
    category: 'built',
    categoryLabel: { ms: 'Projek Dibangunkan', en: 'Engineered Project' },
    name: '9Router AI Office',
    company: 'Projek Inovasi AI',
    badge: '3D WEBGL · DIBANGUNKAN',
    badgeEn: '3D WEBGL · ENGINEERED',
    accent: '#2563eb',
    accessType: 'visual_showcase',
    accessLabel: 'Repositori Peribadi · Pratonton Visual',
    accessLabelEn: 'Private Repository · Visual Preview',
    previewImage: '/images/9router_office_3d.png',
    secondaryImage: '/images/ai_team_dashboard.png',
    role: 'Pencipta & Arkitek Sistem AI',
    roleEn: 'Creator & AI Systems Architect',
    stack: ['Three.js', 'Node.js 22+', 'Model Context Protocol', 'Playwright MCP'],
    dataArchitecture: 'Ruang pejabat maya 3D di mana ejen AI autonomi berkomunikasi secara masa nyata melalui protokol MCP.',
    dataArchitectureEn: 'Interactive 3D virtual office where autonomous AI agents communicate in real time via MCP.',
    securityAccess: 'Pengasingan sesi ejen tempatan dan kawalan kebenaran alatan (tool permission gate) bagi setiap arahan.',
    securityAccessEn: 'Local agent session isolation and strict tool permission gates for every command execution.'
  },
  {
    id: 'babykick',
    code: 'BUILD-05',
    category: 'built',
    categoryLabel: { ms: 'Projek Dibangunkan', en: 'Engineered Project' },
    name: 'Baby Kick Tracker',
    company: 'Kesihatan Digital',
    badge: 'FLUTTER · DIBANGUNKAN',
    badgeEn: 'FLUTTER · ENGINEERED',
    accent: '#db2777',
    accessType: 'visual_showcase',
    accessLabel: 'Repositori Peribadi · Dalam Pembangunan',
    accessLabelEn: 'Private Repository · In Development',
    logoImage: '/images/baby_kicking_logo.png',
    role: 'Pembangun Aplikasi Mudah Alih',
    roleEn: 'Mobile Application Developer',
    stack: ['Flutter (Dart)', 'Firebase Firestore', 'Cloud Functions', 'Eksport PDF'],
    dataArchitecture: 'Penyegerakan masa nyata corak pergerakan janin dalam Cloud Firestore bersama penjanaan laporan klinikal PDF.',
    dataArchitectureEn: 'Real-time fetal movement pattern synchronization in Cloud Firestore with clinical PDF report generation.',
    securityAccess: 'Peraturan keselamatan Firebase mengunci rekod kesihatan ibu supaya hanya boleh diakses oleh pemilik akaun.',
    securityAccessEn: 'Firebase security rules lock maternal health records exclusively to the authenticated account owner.'
  }
]);

export const MAINTAINED_MODULES = Object.freeze(MODULES.filter(m => m.category === 'maintained'));
export const BUILT_MODULES = Object.freeze(MODULES.filter(m => m.category === 'built'));

export const HOMELAB_SPEC = Object.freeze({
  title: 'Homelab & Keselamatan Rangkaian',
  subtitle: 'Infrastruktur Pelayan Peribadi & Amalan Keselamatan Siber',
  role: 'Penyelidik & Pengendali Infrastruktur',
  components: [
    { title: 'Infrastruktur Pelayan & Docker', detail: 'Pengurusan hos Linux (Ubuntu Server) dengan kontena Docker untuk servis pembangunan kendiri dan pangkalan data ujian.' },
    { title: 'Kawalan Rangkaian & VPN', detail: 'Pengasingan subnet tempatan (VLAN), penghalaan selamat menggunakan Tailscale mesh VPN, dan pengawasan port terbuka.' },
    { title: 'Pengalaman SOC & Keselamatan Siber', detail: 'Latar belakang keselamatan rangkaian UTM (Ijazah Keselamatan Siber) digabungkan dengan pendedahan triage amaran dan insiden semasa internship SOC di TNB.' }
  ]
});

export const GATEWAY_SPEC = Object.freeze({
  title: 'Gerbang Keselamatan & Kawalan Akses',
  subtitle: 'Pemisahan Lapisan: Sambungan Fizikal vs Kebenaran Identiti',
  principle: 'Zero Trust Architecture (ZTA)',
  visitorNote: 'Kad PELAWAT menunjukkan bahawa sekadar mempunyai sambungan rangkaian aktif (kabel dipasang) tidak bermakna anda mempunyai kebenaran (authorization) untuk membuka pancaran projektor sistem dalaman.',
  ownerNote: 'Kad PEMILIK mengesahkan identiti yang sah pada pad pengimbas NFC, membuka pintu lensa optik dan memancarkan sampel UI bagi tab game projek yang dimasukkan ke dalam slot.'
});

/** @param {{connected: boolean, opened: boolean, identity: string | null, module: number}} state
 * @param {{type: string, value?: string, delta?: number, index?: number}} action */
export function transition(state, action) {
  switch (action.type) {
    case 'connect': return { ...state, connected: !state.connected };
    case 'open': return { ...state, opened: !state.opened };
    case 'identity': return { ...state, identity: state.identity === action.value ? null : (action.value ?? null) };
    case 'module': return { ...state, module: (state.module + (action.delta ?? 1) + MODULES.length) % MODULES.length };
    case 'select_module': return { ...state, module: ((action.index ?? 0) % MODULES.length + MODULES.length) % MODULES.length };
    case 'reset': return { ...INITIAL_STATE };
    default: return state;
  }
}

/** @param {{connected: boolean, identity: string | null}} state
 * @param {'ms' | 'en'} [locale='ms'] */
export function outcome(state, locale = 'ms') {
  const en = locale === 'en';
  if (!state.connected) {
    return {
      code: 'offline',
      title: en ? 'Offline' : 'Luar Talian',
      detail: en
        ? 'Connect the Homelab cable, place the OWNER card, and insert a project cartridge into the slot.'
        : 'Sambungkan kabel Homelab, letakkan kad PEMILIK, dan masukkan tab game projek ke dalam slot.'
    };
  }
  if (!state.identity) {
    return {
      code: 'waiting',
      title: en ? 'Waiting for Access Card' : 'Menunggu Kad Akses',
      detail: en
        ? 'Place the VISITOR or OWNER card on the NFC scanner pad to test projector access.'
        : 'Letakkan kad PELAWAT atau PEMILIK pada pad pengimbas untuk menguji akses projektor.'
    };
  }
  if (state.identity !== 'owner') {
    return {
      code: 'denied',
      title: en ? 'Access Denied (RBAC)' : 'Akses Disekat (RBAC)',
      detail: en
        ? 'Simulation: visitor card is restricted from opening the internal system projector.'
        : 'Simulasi: kad pelawat tidak dibenarkan membuka projektor sistem dalaman.'
    };
  }
  return {
    code: 'allowed',
    title: en ? 'Verified Owner Access' : 'Akses Pemilik Sah',
    detail: en
      ? 'Optical projector active: insert any system or project cartridge into the slot to project.'
      : 'Projektor optik aktif: masukkan mana-mana tab game projek ke dalam slot untuk tayangan.'
  };
}
