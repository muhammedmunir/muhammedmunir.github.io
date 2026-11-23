export type Locale = 'ms' | 'en';

export type StationId = 'core' | 'enterprise' | 'network' | 'ai_vision' | 'mobility' | 'terminal';

export interface LocalizedText {
	ms: string;
	en: string;
}

export interface CareerEntry {
	id: string;
	company: string;
	role: LocalizedText;
	period: string;
	location: string;
	stationId: StationId;
	highlights: {
		ms: string[];
		en: string[];
	};
	stack: string[];
}

export interface SkillCategoryEntry {
	id: string;
	category: LocalizedText;
	skills: string[];
}

export interface EducationEntry {
	id: string;
	institution: string;
	qualification: LocalizedText;
	period: string;
	location: string;
	cgpa: string;
	fypTitle: LocalizedText;
	fypSummary: LocalizedText;
	fypRepo?: string;
	coursework: string[];
}

export interface CertificationEntry {
	title: string;
	issuer: string;
	category: 'network' | 'data';
	period?: string;
}

export interface ProjectArchiveEntry {
	id: string;
	name: string;
	badge: LocalizedText;
	status: 'production' | 'active' | 'in_development' | 'academic';
	stationId: StationId;
	summary: LocalizedText;
	architecture: LocalizedText;
	stack: string[];
	repoUrl?: string;
	caseStudyUrl?: string;
	liveUrl?: string;
}

export const PROFILE = {
	fullName: 'Muhammed Munir Bin Mohd Azmi',
	shortName: 'Muhammed Munir',
	monogram: 'MM',
	profilePhoto: '/profile_photo.jpg',
	tagline: {
		ms: 'Saya bina sistem di sebalik tabir.',
		en: 'I build the systems behind the scenes.'
	},
	headline: {
		ms: 'Full-Stack Developer • Keselamatan Rangkaian (UTM)',
		en: 'Full-Stack Developer • Network Security (UTM)'
	},
	location: 'Puchong, Selangor',
	email: 'muhammed.munir97.mm@gmail.com',
	phone: '+60 13-563 6124',
	whatsappUrl: 'https://wa.me/60135636124',
	websiteUrl: 'https://muhammedmunir.github.io',
	githubUrl: 'https://github.com/muhammedmunir',
	linkedinUrl: 'https://www.linkedin.com/in/muhammed-munir-bin-mohd-azmi-9b233b271',
	resumeUrl: '/resume.pdf',
	languages: [
		{
			name: { ms: 'Bahasa Melayu', en: 'Malay' },
			proficiency: { ms: 'Penutur Jati / Dwibahasa', en: 'Native / Bilingual Proficiency' }
		},
		{
			name: { ms: 'Bahasa Inggeris', en: 'English' },
			proficiency: { ms: 'Kecekapan Kerja Profesional', en: 'Professional Working Proficiency' }
		}
	],
	summary: {
		ms: 'Full-Stack Developer yang mementingkan keselamatan dan kebolehpercayaan sistem, dengan pengalaman dalam penyelenggaraan, pembangunan modul baharu, serta pembaikan pepijat sistem sektor awam (EMESYS, SUTERA, ADiMS) dan pembangunan aplikasi web serta mudah alih di YHCM Sdn Bhd, Nova Bitara, dan Tenaga Nasional Berhad (TNB). Mahir dalam Vue.js 3, Laravel 11/12 (Filament), SvelteKit, Flutter, dan Docker Swarm, disokong oleh Ijazah Sains Komputer (Keselamatan Rangkaian) dari UTM, pensijilan rangkaian Cisco, serta pengalaman operasi keselamatan SOC di TNB.',
		en: 'Security-conscious Full-Stack Developer with proven experience in system maintenance, new module development, and bug fixing for public-sector systems (EMESYS, SUTERA, ADiMS), alongside web and mobile development at YHCM Sdn Bhd, Nova Bitara, and Tenaga Nasional Berhad (TNB). Skilled in Vue.js 3, Laravel 11/12 (Filament), SvelteKit, Flutter, and Docker Swarm, backed by a Computer Science (Network Security) degree from UTM, Cisco certifications, and SOC threat monitoring experience at TNB.'
	}
};

export const TECHNICAL_SKILLS: SkillCategoryEntry[] = [
	{
		id: 'frontend-mobile',
		category: { ms: 'Frontend & Mudah Alih', en: 'Frontend & Mobile' },
		skills: [
			'Vue.js 3',
			'SvelteKit',
			'Flutter (Dart)',
			'React.js',
			'Tailwind CSS',
			'HTML5',
			'CSS3',
			'JavaScript (ES6+)',
			'TypeScript',
			'Three.js'
		]
	},
	{
		id: 'backend-apis',
		category: { ms: 'Backend & API', en: 'Backend & APIs' },
		skills: [
			'Laravel 11/12 (PHP 8.2+)',
			'Laravel Filament',
			'Node.js',
			'Python',
			'RESTful APIs',
			'C#',
			'C++',
			'Java'
		]
	},
	{
		id: 'databases-cloud',
		category: { ms: 'Pangkalan Data & Awan', en: 'Databases & Cloud' },
		skills: [
			'PostgreSQL (RLS)',
			'MySQL',
			'MariaDB',
			'Supabase',
			'Firebase (Firestore & Realtime DB)',
			'MongoDB',
			'Redis',
			'Microsoft Azure',
			'Vercel'
		]
	},
	{
		id: 'devops-security',
		category: { ms: 'DevOps & Keselamatan Siber', en: 'DevOps & Security' },
		skills: [
			'Docker',
			'Docker Swarm',
			'Jenkins',
			'Kubernetes (Basic)',
			'Git / GitHub',
			'Cloudflare WAF/CDN',
			'DirectAdmin',
			'Splunk SIEM',
			'Wireshark',
			'Vulhub',
			'Firewall & VPN',
			'ISO 27001',
			'NIST'
		]
	},
	{
		id: 'ai-automation-tools',
		category: { ms: 'AI, Automasi & Alatan', en: 'AI, Automation & Tools' },
		skills: [
			'Model Context Protocol (MCP)',
			'OpenCV',
			'Gemini AI',
			'Playwright',
			'Linux (Ubuntu, Kali)',
			'Windows Server',
			'Figma',
			'Microsoft Power BI'
		]
	}
];

export const CAREER_TIMELINE: CareerEntry[] = [
	{
		id: 'yhcm',
		company: 'YHCM Sdn Bhd',
		role: {
			ms: 'Full-Stack Developer',
			en: 'Full-Stack Developer'
		},
		period: 'Apr 2026 – Present',
		location: 'Shah Alam, Selangor',
		stationId: 'enterprise',
		highlights: {
			ms: [
				'Menyelenggara dan menaik taraf sistem web perusahaan kritikal untuk sektor awam/kerajaan (termasuk EMESYS, SUTERA dan ADiMS) dengan mematuhi piawaian keselamatan data yang ketat, kawalan akses berasaskan peranan (RBAC), dan audit.',
				'Mereka bentuk dan membina antara muka frontend modular menggunakan Vue.js 3 serta menyelaraskan aliran kerja pentadbiran dengan Laravel Filament.',
				'Mengurus dan mengoptimumkan pangkalan data hubungan merentasi MySQL, MariaDB, dan PostgreSQL 17 melalui penambahbaikan pengindeksan serta skema.',
				'Melancarkan, memantau, dan menskalakan servis berasaskan container serta aliran kerja imej menggunakan Docker dan Docker Swarm merentasi nod produksi.',
				'Mentadbir dan memperkukuh (harden) infrastruktur pelayan hibrid merentasi persekitaran Linux (Ubuntu) dan Windows Server bagi memastikan ketersediaan tinggi (high availability).',
				'Menyelesaikan insiden operasi IT, menyediakan sokongan teknikal Tier-2/3, dan mengkonfigurasi integrasi API bersekuriti untuk operasi organisasi.'
			],
			en: [
				'Maintain and upgrade mission-critical enterprise web systems for the public/government sector (including EMESYS, SUTERA and ADiMS), complying with stringent data security, role-based access control (RBAC), and audit standards.',
				'Architect and build modular frontend interfaces using Vue.js 3 and streamline administration workflows with Laravel Filament.',
				'Manage and optimize relational databases across MySQL, MariaDB, and PostgreSQL 17 with indexing and schema enhancements.',
				'Deploy, monitor, and scale containerized services and image workflows using Docker and Docker Swarm across production nodes.',
				'Administer and harden hybrid server infrastructure across Linux (Ubuntu) and Windows Server environments, ensuring high availability.',
				'Resolve operational IT incidents, provide tier-2/3 technical support, and configure secure API integrations for organizational operations.'
			]
		},
		stack: [
			'Vue.js 3',
			'Laravel 11/12',
			'Laravel Filament',
			'PostgreSQL 17',
			'MySQL',
			'MariaDB',
			'Docker & Docker Swarm',
			'RBAC & Audit',
			'Linux (Ubuntu)',
			'Windows Server'
		]
	},
	{
		id: 'nova-bitara',
		company: 'Nova Bitara Development Sdn Bhd',
		role: {
			ms: 'IT Support & Web Developer',
			en: 'IT Support & Web Developer'
		},
		period: 'Dec 2025 – Mar 2026',
		location: 'Sunway, Selangor',
		stationId: 'enterprise',
		highlights: {
			ms: [
				'Membangunkan dan melancarkan Sistem Permohonan Pinjaman Bercagar produksi (IWA001) menggunakan SvelteKit dan Supabase dengan polisi Row Level Security (RLS) serta pengesahan JWT, dihoskan di Vercel bersama GoDaddy DNS.',
				'Membina portal korporat pelbagai bahasa berprestasi tinggi (Infinity World) menggunakan SvelteKit, Redis caching, dan API e-mel transaksi Resend.',
				'Membangunkan dan menyelenggara platform e-dagang komersial menggunakan Laravel dan MySQL, dihoskan pada DirectAdmin dengan IPserverone serta Cloudflare WAF/CDN.',
				'Menyediakan sokongan IT dalaman yang menyeluruh merangkumi penyelesaian masalah perkakasan korporat, sistem pengoperasian, sambungan rangkaian, dan infrastruktur DNS.'
			],
			en: [
				'Engineered and deployed a production Collateralized Loan Application System (IWA001) using SvelteKit and Supabase with Row Level Security (RLS) policies and JWT authentication, hosted on Vercel with GoDaddy DNS.',
				'Built a high-performance multilingual corporate portal (Infinity World) using SvelteKit, Redis caching, and Resend transactional email API.',
				'Developed and maintained a commercial e-commerce platform using Laravel and MySQL, hosted on DirectAdmin with IPserverone and Cloudflare WAF/CDN.',
				'Delivered comprehensive internal IT support, troubleshooting corporate hardware, operating systems, network connectivity, and DNS infrastructure.'
			]
		},
		stack: [
			'SvelteKit',
			'Supabase (RLS & JWT)',
			'Redis',
			'Resend API',
			'Laravel',
			'MySQL',
			'DirectAdmin',
			'Cloudflare WAF/CDN',
			'Vercel'
		]
	},
	{
		id: 'tnb-protege',
		company: 'Tenaga Nasional Berhad (TNB)',
		role: {
			ms: 'Enterprise Mobility Solutions (Protégé)',
			en: 'Enterprise Mobility Solutions (Protégé)'
		},
		period: 'Apr 2025 – Dec 2025',
		location: 'UOA Business Park, Shah Alam',
		stationId: 'enterprise',
		highlights: {
			ms: [
				'Menerajui pembangunan full-stack ONBOARDX, aplikasi onboarding merentas platform perusahaan menggunakan Flutter (Dart) dan JavaScript.',
				'Membangunkan seni bina berbilang pangkalan data yang menyokong Firebase Realtime DB, MongoDB, Supabase, dan MySQL.',
				'Mengkonfigurasi dan menyelenggara pelayan awan Ubuntu di Microsoft Azure, termasuk pengurusan Network Security Groups (NSGs) dan pemantauan sumber sistem.',
				'Mengautomasikan saluran paip binaan dan penghantaran dengan Jenkins CI/CD serta memperoleh pengalaman praktikal dalam orkestrasi container menggunakan Kubernetes.',
				'Mereka bentuk pengalaman pengguna yang intuitif dan wireframe antara muka dalam Figma; menyelesaikan tiket sokongan teknikal mengikut sasaran SLA yang ketat.'
			],
			en: [
				'Spearheaded full-stack development of ONBOARDX, an enterprise cross-platform onboarding application utilizing Flutter (Dart) and JavaScript.',
				'Engineered multi-database architecture supporting Firebase Realtime DB, MongoDB, Supabase, and MySQL.',
				'Configured and maintained Ubuntu cloud servers on Microsoft Azure, managing Network Security Groups (NSGs) and system resource monitoring.',
				'Automated build and delivery pipelines with Jenkins CI/CD and gained practical experience in container orchestration with Kubernetes.',
				'Designed intuitive user experiences and interface wireframes in Figma; resolved technical support tickets within strict SLA targets.'
			]
		},
		stack: [
			'Flutter (Dart)',
			'JavaScript',
			'Firebase Realtime DB',
			'MongoDB',
			'Supabase',
			'MySQL',
			'Microsoft Azure (NSG)',
			'Jenkins CI/CD',
			'Kubernetes (Basic)',
			'Figma'
		]
	},
	{
		id: 'tnb-soc',
		company: 'Tenaga Nasional Berhad (TNB)',
		role: {
			ms: 'Cyber Security Threat Defense (Internship)',
			en: 'Cyber Security Threat Defense (Internship)'
		},
		period: 'Sept 2023 – Feb 2024',
		location: 'Platinum Bangsar, Kuala Lumpur',
		stationId: 'network',
		highlights: {
			ms: [
				'Memantau trafik rangkaian perusahaan dan log akses web secara masa nyata menggunakan papan pemuka Splunk SIEM dalam persekitaran SOC yang aktif.',
				'Bekerjasama dengan pasukan Red Team menggunakan makmal Docker Vulhub untuk menghasilkan semula, menguji, dan menganalisis kerentanan CVE yang diketahui.',
				'Membantu pasukan Blue Team dalam pengukuhan pertahanan (defense hardening), audit log, pengesahan tampalan keselamatan, dan penjajaran pematuhan dengan garis panduan ISO 27001 serta NIST.'
			],
			en: [
				'Monitored enterprise network traffic and web access logs in real time using Splunk SIEM dashboards within an active SOC environment.',
				'Collaborated with the Red Team using Vulhub Docker laboratories to reproduce, test, and analyze known CVE vulnerabilities.',
				'Assisted the Blue Team in defense hardening, log audits, security patch verifications, and compliance alignment with ISO 27001 and NIST guidelines.'
			]
		},
		stack: [
			'Splunk SIEM',
			'Vulhub Docker Labs',
			'Red Team CVE Analysis',
			'Blue Team Hardening',
			'ISO 27001',
			'NIST'
		]
	},
	{
		id: 'tnb-ict',
		company: 'Tenaga Nasional Berhad (TNB)',
		role: {
			ms: 'Information & Communication Technology (Internship)',
			en: 'Information & Communication Technology (Internship)'
		},
		period: 'Dec 2019 – Feb 2020',
		location: 'Kota Bharu, Kelantan',
		stationId: 'network',
		highlights: {
			ms: [
				'Memetakan topologi laluan gentian optik serantau menggunakan Google Earth; mengira jarak laluan tepat dan model anggaran kos pemasangan dalam Excel.',
				'Membantu jurutera rangkaian dengan ujian redaman isyarat (signal attenuation testing), audit infrastruktur fizikal, dan penyelenggaraan pencegahan.'
			],
			en: [
				'Mapped regional fiber optic route topologies using Google Earth; computed precision route distances and deployment costing models in Excel.',
				'Assisted network engineers with signal attenuation testing, physical infrastructure audits, and preventative maintenance.'
			]
		},
		stack: [
			'Fiber-Optic Route Topology',
			'Google Earth',
			'Signal Attenuation Testing',
			'Infrastructure Audit',
			'Excel Costing Models'
		]
	}
];

export const EDUCATION_HISTORY: EducationEntry[] = [
	{
		id: 'utm-degree',
		institution: 'Universiti Teknologi Malaysia (UTM)',
		qualification: {
			ms: 'Bachelor of Computer Science (Network Security)',
			en: 'Bachelor of Computer Science (Network Security)'
		},
		period: '2021 – 2024',
		location: 'Johor Bahru, Johor',
		cgpa: '3.17',
		fypTitle: {
			ms: 'Geospatial Reporting Management System for UTM',
			en: 'Geospatial Reporting Management System for UTM'
		},
		fypSummary: {
			ms: 'Dibangunkan menggunakan SvelteKit, Tailwind CSS, Google Maps API, dan Supabase untuk pengurusan pelaporan berasaskan lokasi kampus.',
			en: 'Built with SvelteKit, Tailwind CSS, Google Maps API, and Supabase for campus geospatial reporting management.'
		},
		fypRepo: 'https://github.com/muhammedmunir/Reporting-Management-System-',
		coursework: [
			'Ethical Hacking & Penetration Testing',
			'Cybersecurity Governance & Compliance',
			'Network Security'
		]
	},
	{
		id: 'utm-diploma',
		institution: 'Universiti Teknologi Malaysia (UTM)',
		qualification: {
			ms: 'Diploma in Computer Science',
			en: 'Diploma in Computer Science'
		},
		period: '2017 – 2020',
		location: 'Kuala Lumpur',
		cgpa: '2.72',
		fypTitle: {
			ms: 'E-Commerce Web Platform',
			en: 'E-Commerce Web Platform'
		},
		fypSummary: {
			ms: 'Platform web e-dagang dengan pengesahan pengguna, pengurusan katalog, dan aliran pembayaran (PHP, MySQL, Azure Ubuntu).',
			en: 'E-Commerce Web Platform with user authentication, catalog management, and payment flows (PHP, MySQL, Azure Ubuntu).'
		},
		coursework: [
			'Object-Oriented Programming (C#)',
			'Structured Programming (C++)',
			'Java Programming'
		]
	}
];

export const CERTIFICATIONS: CertificationEntry[] = [
	{
		title: 'CCNAv7: Introduction to Networks',
		issuer: 'Cisco Networking Academy',
		category: 'network'
	},
	{
		title: 'CCNAv7: Switching, Routing, and Wireless Essentials',
		issuer: 'Cisco Networking Academy',
		category: 'network'
	},
	{
		title: 'Cisco DevNet Associate',
		issuer: 'Cisco Networking Academy',
		category: 'network'
	},
	{
		title: 'Cisco Network Security',
		issuer: 'Cisco Networking Academy',
		category: 'network'
	},
	{
		title: 'IoT Fundamentals: Connecting Things',
		issuer: 'Cisco Networking Academy',
		category: 'network'
	},
	{
		title: 'Microsoft Power BI Data Analysis',
		issuer: 'Specialized Analytics Certification',
		category: 'data',
		period: 'Jan 2025'
	},
	{
		title: 'Python for Data Analysis',
		issuer: 'Specialized Analytics Certification',
		category: 'data',
		period: 'Dec 2024'
	}
];

export const PROJECT_ARCHIVE: ProjectArchiveEntry[] = [
	{
		id: 'proj-tindak',
		name: 'TINDAK — AI-Powered Mobile Action Engine',
		badge: {
			ms: 'Projek Unggulan CV · Dalam Pembangunan',
			en: 'CV Featured System · In Development'
		},
		status: 'in_development',
		stationId: 'ai_vision',
		summary: {
			ms: 'Utiliti tindakan pantas Android yang menangkap Share Intents mudah alih untuk menghurai URL, nombor kenalan, dan butiran pembayaran secara tempatan.',
			en: 'Android rapid-action utility capturing mobile Share Intents to parse URLs, contact numbers, and payment details locally.'
		},
		architecture: {
			ms: 'Penghurai regex/peraturan local-first dengan fallback Gemini AI, digandingkan dengan backend Supabase yang disahkan dengan polisi keselamatan RLS yang ketat.',
			en: 'Local-first regex/rule parser with Gemini AI fallback, coupled with a Supabase backend validated with strict RLS security policies.'
		},
		stack: ['Flutter', 'Dart', 'Supabase RLS', 'Gemini AI']
	},
	{
		id: 'proj-9router',
		name: '9Router Office — Autonomous AI Agent 3D Workspace',
		badge: {
			ms: 'Projek Unggulan CV · Ruang Kerja 3D MCP',
			en: 'CV Featured System · 3D MCP Workspace'
		},
		status: 'active',
		stationId: 'ai_vision',
		summary: {
			ms: 'Ruang kerja maya 3D interaktif dalam Three.js di mana ejen AI autonomi berkomunikasi secara masa nyata melalui Model Context Protocol (MCP).',
			en: 'Interactive 3D virtual workspace in Three.js where autonomous AI agents communicate in real time via Model Context Protocol (MCP).'
		},
		architecture: {
			ms: 'Node.js 22+, Three.js, Model Context Protocol (MCP), sintesis suara dinamik, penyimpanan keadaan ejen, dan ujian UI/API automatik hujung-ke-hujung menggunakan Playwright MCP.',
			en: 'Node.js 22+, Three.js, Model Context Protocol (MCP), dynamic voice synthesis, agent state persistence, and end-to-end automated UI/API testing utilizing Playwright MCP.'
		},
		stack: ['Node.js 22+', 'Three.js', 'Model Context Protocol (MCP)', 'Playwright MCP']
	},
	{
		id: 'proj-cv-bot',
		name: 'Computer Vision & Win32 Desktop Automation Suite',
		badge: { ms: 'Projek Unggulan CV · OpenCV & Win32', en: 'CV Featured System · OpenCV & Win32' },
		status: 'active',
		stationId: 'ai_vision',
		summary: {
			ms: 'Suite automasi desktop lanjutan menggunakan padanan piramid SIFT berbilang skala, segmentasi CIELAB, dan visual servoing gelung tertutup.',
			en: 'Advanced desktop automation suite utilizing multi-scale SIFT pyramid matching, CIELAB segmentation, and closed-loop visual servoing.'
		},
		architecture: {
			ms: 'Pengekstrakan teks OCR dinamik, sempadan keselamatan tetingkap Win32 asli (native Win32 window safety boundaries), dan GUI kawalan CustomTkinter berbilang benang.',
			en: 'Dynamic OCR text extraction, native Win32 window safety boundaries, and a multithreaded CustomTkinter control GUI.'
		},
		stack: ['Python', 'OpenCV', 'CustomTkinter', 'Win32 API', 'SIFT & CIELAB', 'Dynamic OCR']
	},
	{
		id: 'proj-baby-kicking',
		name: 'Baby Kicking Suite — Mobile Maternal Health Tracker',
		badge: {
			ms: 'Projek Unggulan CV · Dalam Pembangunan',
			en: 'CV Featured System · In Development'
		},
		status: 'in_development',
		stationId: 'ai_vision',
		summary: {
			ms: 'Aplikasi kesihatan ibu mengandung merentas platform dalam Flutter yang membolehkan ibu merekod dan menjejak corak pergerakan janin.',
			en: 'Cross-platform Flutter maternal wellness app enabling expectant mothers to record and track fetal movement patterns.'
		},
		architecture: {
			ms: 'Penyegerakan masa nyata Firebase Cloud Firestore, analitik amaran ketidakaturan pergerakan, dan eksport laporan PDF klinikal automatik untuk lawatan doktor.',
			en: 'Firebase Cloud Firestore real-time sync, movement irregularity alert analytics, and automated clinical PDF export for doctor visits.'
		},
		stack: ['Flutter', 'Dart', 'Firebase Firestore', 'Firebase Functions', 'Clinical PDF Export'],
		repoUrl: 'https://github.com/muhammedmunir/baby_kicking_project'
	},
	{
		id: 'proj-lumina-wedding',
		name: 'Lumina Glass Studio & Smart Mirror Visualizer',
		badge: {
			ms: 'Projek Unggulan CV · Web App & REST API',
			en: 'CV Featured System · Web App & REST API'
		},
		status: 'active',
		stationId: 'ai_vision',
		summary: {
			ms: 'Konfigurator cermin pintar LED interaktif yang menampilkan kawalan suhu Kelvin masa nyata (3000K–6500K) dan shader tekstur (bersama platform jemputan digital dwi-tema).',
			en: 'Interactive LED smart mirror configurator featuring real-time Kelvin temperature (3000K–6500K) controls and texture shaders (alongside a dual-theme digital wedding platform).'
		},
		architecture: {
			ms: 'SvelteKit, Tailwind CSS, dan backend RESTful Laravel 11 dengan model Eloquent, pengesahan Form Request, serta 100% liputan ujian ciri PHPUnit.',
			en: 'SvelteKit, Tailwind CSS, and a Laravel 11 RESTful backend with Eloquent models, Form Request validations, and 100% PHPUnit feature test coverage.'
		},
		stack: ['SvelteKit', 'Tailwind CSS', 'Laravel 11 RESTful API', 'PHPUnit (100%)'],
		repoUrl: 'https://github.com/muhammedmunir/welding-project'
	},
	{
		id: 'proj-emesys-sutera-adims',
		name: 'EMESYS, SUTERA & ADiMS — Public Sector Enterprise Systems',
		badge: { ms: 'YHCM Sdn Bhd · Sistem Perusahaan', en: 'YHCM Sdn Bhd · Enterprise Systems' },
		status: 'production',
		stationId: 'enterprise',
		summary: {
			ms: 'Tiga sistem web perusahaan kritikal untuk sektor awam/kerajaan yang diselenggara dan dinaik taraf di YHCM Sdn Bhd dengan pematuhan RBAC dan piawaian audit.',
			en: 'Three mission-critical public/government sector enterprise web systems maintained and upgraded at YHCM Sdn Bhd under strict RBAC and audit standards.'
		},
		architecture: {
			ms: 'Antara muka modular Vue.js 3, aliran kerja pentadbiran Laravel Filament, pengoptimuman pangkalan data MySQL, MariaDB & PostgreSQL 17, serta orkestrasi Docker Swarm di atas Linux (Ubuntu) & Windows Server.',
			en: 'Modular Vue.js 3 interfaces, Laravel Filament administration workflows, MySQL, MariaDB & PostgreSQL 17 optimization, and Docker Swarm orchestration across Linux (Ubuntu) & Windows Server.'
		},
		stack: [
			'Vue.js 3',
			'Laravel 11/12',
			'Laravel Filament',
			'PostgreSQL 17',
			'MySQL & MariaDB',
			'Docker Swarm'
		]
	},
	{
		id: 'proj-loan-iwa001',
		name: 'IWA001 — Collateralized Loan Application System',
		badge: { ms: 'Nova Bitara · Produksi FinTech RLS', en: 'Nova Bitara · Production FinTech RLS' },
		status: 'production',
		stationId: 'enterprise',
		summary: {
			ms: 'Sistem Permohonan Pinjaman Bercagar produksi (17 halaman penuh) untuk Infinity World Asset dengan kalkulator LTV automatik (token × $150 × 60% LTV, 8% APR) dan portal pentadbir.',
			en: 'Production Collateralized Loan Application System (17 full pages) for Infinity World Asset featuring automated LTV calculations (token × $150 × 60% LTV, 8% APR) and an admin portal.'
		},
		architecture: {
			ms: 'SvelteKit 2.8 (Svelte 5 Runes), TypeScript, Tailwind CSS, GSAP, dan Supabase (3 jadual: profiles, loan_applications, repayments) dengan polisi Row Level Security (RLS) dan pengesahan JWT, dihoskan di Vercel bersama GoDaddy DNS.',
			en: 'SvelteKit 2.8 (Svelte 5 Runes), TypeScript, Tailwind CSS, GSAP, and Supabase (3 tables: profiles, loan_applications, repayments) with Row Level Security (RLS) policies and JWT auth, hosted on Vercel with GoDaddy DNS.'
		},
		stack: ['SvelteKit', 'TypeScript', 'Supabase RLS', 'JWT Auth', 'Tailwind CSS', 'Vercel'],
		repoUrl: 'https://github.com/muhammedmunir/loan-infinity-world',
		caseStudyUrl: '/docs/iwa001-case-study.pdf'
	},
	{
		id: 'proj-real-estate',
		name: 'Infinity World Corporate Portal & Real Estate Landing',
		badge: {
			ms: 'Nova Bitara · Portal Korporat 3 Bahasa',
			en: 'Nova Bitara · Trilingual Corporate Portal'
		},
		status: 'production',
		stationId: 'enterprise',
		summary: {
			ms: 'Portal korporat pelbagai bahasa (EN/MS/ZH, 7 halaman) untuk Infinity World Asset & Nova Bitara dengan pameran projek, berita, acara, dan sistem temu janji pintar.',
			en: 'High-performance multilingual corporate portal (EN/MS/ZH, 7 pages) for Infinity World Asset & Nova Bitara with project showcases, news, events, and smart appointment booking.'
		},
		architecture: {
			ms: 'SvelteKit, Tailwind CSS, Redis caching (ioredis) untuk pengesahan slot masa nyata, dan API e-mel transaksi Resend, dihoskan di Vercel (rantau Singapura) bersama platform e-dagang Laravel/MySQL Cloudflare WAF.',
			en: 'SvelteKit, Tailwind CSS, Redis caching (ioredis) for real-time slot locking, and Resend transactional email API, deployed on Vercel (Singapore region) alongside a Cloudflare WAF-protected Laravel/MySQL e-commerce platform.'
		},
		stack: ['SvelteKit', 'Redis', 'Resend API', 'Tailwind CSS', 'Cloudflare WAF/CDN'],
		repoUrl: 'https://github.com/muhammedmunir/real-estate-landing',
		caseStudyUrl: '/docs/infinity-landing-case-study.pdf',
		liveUrl: 'https://www.infinityworld.ai/'
	},
	{
		id: 'proj-onboardx',
		name: 'ONBOARDX — TNB Enterprise Cross-Platform Onboarding App',
		badge: { ms: 'TNB Protégé · Mobiliti Korporat', en: 'TNB Protégé · Enterprise Mobility' },
		status: 'production',
		stationId: 'enterprise',
		summary: {
			ms: 'Aplikasi mudah alih onboarding merentas platform yang dibangunkan semasa program Protégé di Tenaga Nasional Berhad (UOA Business Park, Shah Alam).',
			en: 'Enterprise cross-platform onboarding application spearheaded during the Protégé program at Tenaga Nasional Berhad (UOA Business Park, Shah Alam).'
		},
		architecture: {
			ms: 'Flutter (Dart) dan JavaScript dengan seni bina berbilang pangkalan data (Firebase Realtime DB, MongoDB, Supabase, MySQL), pelayan awan Ubuntu di Microsoft Azure (NSGs), saluran paip Jenkins CI/CD, asas Kubernetes, dan reka bentuk Figma.',
			en: 'Flutter (Dart) and JavaScript backed by a multi-database architecture (Firebase Realtime DB, MongoDB, Supabase, MySQL), Microsoft Azure Ubuntu cloud servers (NSGs), Jenkins CI/CD pipelines, foundational Kubernetes, and Figma wireframes.'
		},
		stack: [
			'Flutter (Dart)',
			'JavaScript',
			'Firebase Realtime DB',
			'MongoDB',
			'Supabase',
			'MySQL',
			'Microsoft Azure',
			'Jenkins CI/CD'
		],
		repoUrl: 'https://github.com/muhammedmunir/onboardx_tnb_app'
	},
	{
		id: 'proj-ai-policy-rag',
		name: 'AI Policy & Product Helper (RAG Starter Pack)',
		badge: { ms: 'Sumber Terbuka · Carian Vektor RAG', en: 'Open Source · Vector RAG Search' },
		status: 'active',
		stationId: 'ai_vision',
		summary: {
			ms: 'Sistem pembantu soal jawab dokumen polisi dan produk berasaskan Retrieval-Augmented Generation (RAG) dengan petikan sumber yang boleh disahkan.',
			en: 'Retrieval-Augmented Generation (RAG) policy and product document Q&A assistant with verifiable source citations.'
		},
		architecture: {
			ms: 'FastAPI (Python), Next.js (TypeScript), Qdrant Vector Database, SentenceTransformers embeddings, dan perlindungan privasi data.',
			en: 'FastAPI (Python), Next.js (TypeScript), Qdrant Vector Database, SentenceTransformers embeddings, and privacy-first data handling.'
		},
		stack: ['Python', 'FastAPI', 'Next.js', 'Qdrant', 'RAG'],
		repoUrl: 'https://github.com/muhammedmunir/ai-policy-helper-starter-pack'
	},
	{
		id: 'proj-utm-fyp-homelab',
		name: 'Geospatial Reporting Management System (UTM FYP) & Homelab',
		badge: {
			ms: 'FYP Ijazah UTM & Infrastruktur Homelab',
			en: 'UTM Degree FYP & Homelab Infrastructure'
		},
		status: 'academic',
		stationId: 'terminal',
		summary: {
			ms: 'Projek Tahun Akhir (FYP) Ijazah Sarjana Muda Sains Komputer (Keselamatan Rangkaian) di UTM Johor Bahru bersama repositori infrastruktur Homelab.',
			en: 'Final Year Project (FYP) for Bachelor of Computer Science (Network Security) at UTM Johor Bahru alongside a self-hosted Homelab infrastructure repository.'
		},
		architecture: {
			ms: 'SvelteKit, Tailwind CSS, Google Maps API, dan Supabase untuk pelaporan geospasial kampus; dilengkapi konfigurasi pelayan Linux dan Docker dalam projek Homelab.',
			en: 'SvelteKit, Tailwind CSS, Google Maps API, and Supabase for campus geospatial reporting; paired with Linux server and Docker configurations in the Homelab project.'
		},
		stack: ['SvelteKit', 'Tailwind CSS', 'Google Maps API', 'Supabase', 'Linux & Docker Homelab'],
		repoUrl: 'https://github.com/muhammedmunir/Reporting-Management-System-',
		liveUrl: 'https://github.com/muhammedmunir/homelab'
	}
];
