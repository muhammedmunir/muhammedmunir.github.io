export type Locale = 'ms' | 'en';

export type StationId = 'core' | 'enterprise' | 'network' | 'ai_vision' | 'mobility' | 'terminal';

export interface LocalizedText {
	ms: string;
	en: string;
}

export interface HotspotItem {
	id: string;
	code: string;
	pinLabel: LocalizedText;
	title: LocalizedText;
	subtitle: LocalizedText;
	summary: LocalizedText;
	tech: string[];
	link?: string;
	linkLabel?: LocalizedText;
	secondaryLink?: string;
	secondaryLinkLabel?: LocalizedText;
}

export interface SimulationPreset {
	id: string;
	label: LocalizedText;
	telemetry: LocalizedText;
}

export interface SpineStation {
	id: StationId;
	index: number;
	code: string;
	shortTab: LocalizedText;
	coordinate: string;
	kicker: LocalizedText;
	title: LocalizedText;
	subtitle: LocalizedText;
	narrative: LocalizedText;
	architectureNote: LocalizedText;
	metrics: Array<{
		value: string;
		label: LocalizedText;
	}>;
	stack: string[];
	simulationTitle: LocalizedText;
	simulations: SimulationPreset[];
	hotspots: HotspotItem[];
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
	headline: {
		ms: 'Full-Stack Systems Engineer & IT Professional • Network Security (UTM)',
		en: 'Full-Stack Systems Engineer & IT Professional • Network Security (UTM)'
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
		ms: 'Jurutera Sistem Full-Stack yang serba boleh dan mementingkan keselamatan dengan pengalaman terbukti dalam membangunkan serta menyelenggara platform perusahaan berkebolehpercayaan tinggi, sistem pengurusan aset sektor awam, dan aplikasi automasi berasaskan AI. Sangat mahir dalam Vue.js 3, Laravel 11/12 (Filament), SvelteKit, Flutter, Docker Swarm, dan Python Computer Vision, disokong oleh latar belakang akademik Sains Komputer (Keselamatan Rangkaian) dari UTM, pensijilan rangkaian industri Cisco, serta pengalaman pertahanan ancaman Security Operations Center (SOC) di Tenaga Nasional Berhad (TNB).',
		en: 'Versatile, security-conscious Full-Stack Systems Engineer with proven experience developing and maintaining high-reliability enterprise platforms, public sector asset management systems, and AI-driven automation applications. Highly skilled in Vue.js 3, Laravel 11/12 (Filament), SvelteKit, Flutter, Docker Swarm, and Python Computer Vision, backed by an academic background in Computer Science (Network Security) from UTM, industry Cisco networking certifications, and hands-on Security Operations Center (SOC) threat defense experience at Tenaga Nasional Berhad (TNB).'
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

export const OCEAN_WEATHER_PRESETS: SimulationPreset[] = [
	{
		id: 'golden_horizon',
		label: { ms: 'Senja Keemasan (Golden Sunset)', en: 'Golden Sunset' },
		telemetry: {
			ms: 'Simulasi lautan GLSL dengan sinaran matahari rendah, kilauan Cox–Munk keemasan, dan serakan atmosfera hangat.',
			en: 'GLSL ocean simulation with low sun angle, golden Cox–Munk sun glints, and warm atmospheric scattering.'
		}
	},
	{
		id: 'emerald_day',
		label: { ms: 'Siang Zamrud (Emerald Day)', en: 'Emerald Daylight' },
		telemetry: {
			ms: 'Simulasi lautan siang yang jernih dengan serakan bawah permukaan (subsurface crest scattering) biru-zamrud.',
			en: 'High-clarity daylight ocean with turquoise subsurface wave crest scattering and crisp sky reflection.'
		}
	},
	{
		id: 'biolum_night',
		label: { ms: 'Malam Bioluminesensi (Night)', en: 'Bioluminescent Night' },
		telemetry: {
			ms: 'Suasana malam dengan cahaya bulan, bintang di ufuk, dan laluan kabel gentian optik dasar laut yang bercahaya.',
			en: 'Moonlit night atmosphere with horizon stars and glowing subsea fiber-optic cable conduits.'
		}
	},
	{
		id: 'monsoon_swell',
		label: { ms: 'Alunan Monsun (Active Swell)', en: 'Active Monsoon Swell' },
		telemetry: {
			ms: 'Meningkatkan amplitud gelombang Gerstner dan pembentukan buih putih (Jacobian whitecap foam) di sekeliling pelantar.',
			en: 'Increases Gerstner wave amplitude and Jacobian whitecap foam generation around the offshore platforms.'
		}
	}
];

export const STATIONS: SpineStation[] = [
	{
		id: 'core',
		index: 0,
		code: '01 // PROFILE SUMMARY',
		shortTab: { ms: '01 · PROFIL CV', en: '01 · CV PROFILE' },
		coordinate: 'PUCHONG, SELANGOR · +60 13-563 6124',
		kicker: {
			ms: 'SEKSYEN 01 CV · PROFIL & RINGKASAN PROFESIONAL',
			en: 'CV SECTION 01 · PROFILE & PROFESSIONAL SUMMARY'
		},
		title: {
			ms: 'Muhammed Munir Bin Mohd Azmi',
			en: 'Muhammed Munir Bin Mohd Azmi'
		},
		subtitle: {
			ms: 'Full-Stack Systems Engineer & IT Professional • Network Security (UTM)',
			en: 'Full-Stack Systems Engineer & IT Professional • Network Security (UTM)'
		},
		narrative: {
			ms: PROFILE.summary.ms,
			en: PROFILE.summary.en
		},
		architectureNote: {
			ms: 'Pulau Rumah Api Profil CV: Klik pada penanda label di atas bangunan 3D atau tatal roda tetikus untuk belayar ke seksyen CV seterusnya.',
			en: 'CV Profile Lighthouse Island: Click any pin label above the 3D structures or scroll the mouse wheel to sail to the next CV section.'
		},
		metrics: [
			{
				value: '5 Pengalaman',
				label: { ms: 'YHCM, Nova Bitara & 3× TNB', en: 'YHCM, Nova Bitara & 3× TNB' }
			},
			{
				value: '5 Projek Utama',
				label: {
					ms: 'TINDAK, 9Router, CV Suite, Baby Kicking, Lumina',
					en: 'TINDAK, 9Router, CV Suite, Baby Kicking, Lumina'
				}
			},
			{
				value: '5 Kategori Skill',
				label: {
					ms: 'Frontend, Backend, DB/Cloud, DevOps/Sec, AI',
					en: 'Frontend, Backend, DB/Cloud, DevOps/Sec, AI'
				}
			},
			{
				value: 'UTM + 7 Sijil',
				label: {
					ms: 'Ijazah & Diploma UTM + 5 Sijil Cisco + 2 Data',
					en: 'UTM Degree & Diploma + 5 Cisco + 2 Data Certs'
				}
			}
		],
		stack: [
			'Vue.js 3',
			'Laravel 11/12 (Filament)',
			'SvelteKit',
			'Flutter (Dart)',
			'PostgreSQL 17 (RLS)',
			'Docker Swarm',
			'Splunk SIEM',
			'Three.js & MCP',
			'Python OpenCV'
		],
		simulationTitle: {
			ms: 'Suasana Lautan & Pencahayaan (Open-Water GLSL)',
			en: 'Ocean State & Atmosphere (Open-Water GLSL)'
		},
		simulations: OCEAN_WEATHER_PRESETS,
		hotspots: [
			{
				id: 'core-monolith',
				code: 'PROFIL-01',
				pinLabel: { ms: 'Profil & Resume Rasmi', en: 'Official Profile & Resume' },
				title: {
					ms: 'Ringkasan Profesional CV (Professional Summary)',
					en: 'Official CV Professional Summary'
				},
				subtitle: {
					ms: 'Puchong, Selangor · +60 13-563 6124 · muhammed.munir97.mm@gmail.com',
					en: 'Puchong, Selangor · +60 13-563 6124 · muhammed.munir97.mm@gmail.com'
				},
				summary: {
					ms: PROFILE.summary.ms,
					en: PROFILE.summary.en
				},
				tech: [
					'Vue.js 3',
					'Laravel 11/12 (Filament)',
					'SvelteKit',
					'Flutter',
					'Docker Swarm',
					'Python Computer Vision'
				],
				link: '/resume.pdf',
				linkLabel: { ms: 'Muat Turun Resume PDF', en: 'Download Resume PDF' }
			},
			{
				id: 'core-ring-sys',
				code: 'PROFIL-02',
				pinLabel: { ms: 'Full-Stack & Mudah Alih', en: 'Full-Stack & Mobile' },
				title: {
					ms: 'Kepakaran Utama: Full-Stack Enterprise & Mudah Alih',
					en: 'Core Expertise: Full-Stack Enterprise & Mobile'
				},
				subtitle: {
					ms: 'YHCM Sdn Bhd · Nova Bitara Development · TNB Protégé',
					en: 'YHCM Sdn Bhd · Nova Bitara Development · TNB Protégé'
				},
				summary: {
					ms: 'Berpengalaman membangunkan dan menyelenggara sistem sektor awam (eMesys, Sutera, ADIMS), sistem pinjaman bercagar FinTech (IWA001), portal korporat (Infinity World), dan aplikasi mudah alih merentas platform (Onboardx, TINDAK, Baby Kicking Suite).',
					en: 'Experienced in developing and maintaining public sector systems (eMesys, Sutera, ADIMS), collateralized FinTech loan platforms (IWA001), corporate portals (Infinity World), and cross-platform mobile apps (Onboardx, TINDAK, Baby Kicking Suite).'
				},
				tech: [
					'eMesys · Sutera · ADIMS',
					'IWA001 Supabase RLS',
					'Infinity World',
					'Onboardx Flutter'
				]
			},
			{
				id: 'core-ring-net',
				code: 'PROFIL-03',
				pinLabel: { ms: 'Keselamatan Siber & Rangkaian', en: 'Network Security & SOC' },
				title: {
					ms: 'Asas Keselamatan Rangkaian, SOC & Infrastruktur',
					en: 'Network Security, SOC & Infrastructure Foundation'
				},
				subtitle: {
					ms: 'UTM Network Security (CGPA 3.17) · 5 Sijil Cisco · TNB SOC & ICT',
					en: 'UTM Network Security (CGPA 3.17) · 5 Cisco Certs · TNB SOC & ICT'
				},
				summary: {
					ms: 'Disokong oleh Ijazah Sarjana Muda Sains Komputer (Keselamatan Rangkaian) dari UTM, 5 sijil rangkaian Cisco (CCNAv7, DevNet, Network Security, IoT), pengalaman pertahanan ancaman SOC di TNB (Splunk SIEM, Vulhub, ISO 27001/NIST), serta pemetaan laluan gentian optik di TNB ICT.',
					en: 'Backed by a Bachelor of Computer Science (Network Security) from UTM, 5 Cisco networking certifications, hands-on SOC threat defense at TNB (Splunk SIEM, Vulhub, ISO 27001/NIST), and regional fiber-optic route mapping at TNB ICT.'
				},
				tech: [
					'Splunk SIEM',
					'Vulhub CVE',
					'ISO 27001 & NIST',
					'CCNAv7 & DevNet',
					'Docker Swarm',
					'Linux & Windows Server'
				]
			}
		]
	},
	{
		id: 'enterprise',
		index: 1,
		code: '02 // WORK EXPERIENCE (2025–PRESENT)',
		shortTab: { ms: '02 · KERJA SEMASA', en: '02 · WORK (2025–NOW)' },
		coordinate: 'YHCM SDN BHD · NOVA BITARA · TNB PROTÉGÉ',
		kicker: {
			ms: 'SEKSYEN 02 CV · PENGALAMAN KERJA KEJURUTERAAN PERISIAN (2025 – KINI)',
			en: 'CV SECTION 02 · SOFTWARE ENGINEERING WORK EXPERIENCE (2025 – PRESENT)'
		},
		title: {
			ms: 'YHCM Sdn Bhd, Nova Bitara & TNB Enterprise Mobility',
			en: 'YHCM Sdn Bhd, Nova Bitara & TNB Enterprise Mobility'
		},
		subtitle: {
			ms: 'Programmer / Full-Stack Enterprise Developer (YHCM) · Web Developer & IT Support (Nova Bitara) · Protégé (TNB).',
			en: 'Programmer / Full-Stack Enterprise Developer (YHCM) · Web Developer & IT Support (Nova Bitara) · Protégé (TNB).'
		},
		narrative: {
			ms: 'Stesen kedua memaparkan 3 pengalaman kerja pembangunan sistem saya mengikut CV: (1) Di YHCM Sdn Bhd (Apr 2026 – Kini, Shah Alam), saya menyelenggara dan menaik taraf sistem web perusahaan kritikal sektor awam (eMesys, Sutera, ADIMS) menggunakan Vue.js 3, Laravel Filament, MySQL, MariaDB, PostgreSQL 17, Docker Swarm, serta mentadbir pelayan Linux (Ubuntu) dan Windows Server. (2) Di Nova Bitara Development Sdn Bhd (Dis 2025 – Mac 2026, Sunway), saya membangunkan Sistem Pinjaman Bercagar IWA001 (SvelteKit, Supabase RLS, JWT), portal korporat Infinity World (SvelteKit, Redis, Resend API), dan e-dagang Laravel/MySQL (DirectAdmin, Cloudflare WAF/CDN). (3) Di Tenaga Nasional Berhad (Apr 2025 – Dis 2025, Shah Alam), saya menerajui pembangunan aplikasi Onboardx menggunakan Flutter (Dart), JavaScript, 4 pangkalan data, Microsoft Azure Ubuntu (NSG), dan Jenkins CI/CD.',
			en: 'Station 02 presents my 3 recent software engineering roles from the CV: (1) At YHCM Sdn Bhd (Apr 2026 – Present, Shah Alam), maintaining and upgrading mission-critical public sector enterprise systems (eMesys, Sutera, ADIMS) with Vue.js 3, Laravel Filament, MySQL, MariaDB, PostgreSQL 17, Docker Swarm, and hybrid Linux (Ubuntu) / Windows Server infrastructure. (2) At Nova Bitara Development Sdn Bhd (Dec 2025 – Mar 2026, Sunway), engineering the IWA001 Collateralized Loan System (SvelteKit, Supabase RLS, JWT), the Infinity World portal (SvelteKit, Redis, Resend API), and a Laravel/MySQL e-commerce platform (DirectAdmin, Cloudflare WAF/CDN). (3) At Tenaga Nasional Berhad (Apr 2025 – Dec 2025, Shah Alam), spearheading full-stack development of Onboardx in Flutter (Dart) and JavaScript across 4 databases on Microsoft Azure Ubuntu with Jenkins CI/CD.'
		},
		architectureNote: {
			ms: 'Pelantar Kompleks Korporat 3-Menara: Klik menara YHCM Sdn Bhd, Nova Bitara, atau TNB Protégé di atas lautan.',
			en: '3-Tower Corporate Offshore Complex: Click the YHCM Sdn Bhd, Nova Bitara, or TNB Protégé tower above the water.'
		},
		metrics: [
			{
				value: 'YHCM Sdn Bhd',
				label: {
					ms: 'Apr 2026 – Kini · eMesys, Sutera & ADIMS',
					en: 'Apr 2026 – Present · eMesys, Sutera & ADIMS'
				}
			},
			{
				value: 'Nova Bitara',
				label: {
					ms: 'Dis 2025 – Mac 2026 · IWA001 & Infinity World',
					en: 'Dec 2025 – Mar 2026 · IWA001 & Infinity World'
				}
			},
			{
				value: 'TNB Protégé',
				label: {
					ms: 'Apr 2025 – Dis 2025 · Aplikasi Onboardx Flutter',
					en: 'Apr 2025 – Dec 2025 · Onboardx Flutter App'
				}
			},
			{
				value: 'Docker & Azure',
				label: {
					ms: 'Docker Swarm, Vercel, Cloudflare WAF & Jenkins',
					en: 'Docker Swarm, Vercel, Cloudflare WAF & Jenkins'
				}
			}
		],
		stack: [
			'Vue.js 3',
			'Laravel 11/12 & Filament',
			'PostgreSQL 17, MySQL & MariaDB',
			'Docker & Docker Swarm',
			'SvelteKit & Supabase RLS',
			'Redis & Resend API',
			'Cloudflare WAF/CDN',
			'Flutter (Dart)',
			'Microsoft Azure (Ubuntu/NSG)',
			'Jenkins CI/CD'
		],
		simulationTitle: {
			ms: 'Suasana Lautan & Pencahayaan (Open-Water GLSL)',
			en: 'Ocean State & Atmosphere (Open-Water GLSL)'
		},
		simulations: OCEAN_WEATHER_PRESETS,
		hotspots: [
			{
				id: 'ent-emesys',
				code: 'WORK-01',
				pinLabel: { ms: 'YHCM Sdn Bhd (Apr 2026–Kini)', en: 'YHCM Sdn Bhd (Apr 2026–Present)' },
				title: {
					ms: 'Programmer / Full-Stack Enterprise Developer — YHCM Sdn Bhd',
					en: 'Programmer / Full-Stack Enterprise Developer — YHCM Sdn Bhd'
				},
				subtitle: {
					ms: 'Apr 2026 – Present · Shah Alam, Selangor · eMesys, Sutera & ADIMS',
					en: 'Apr 2026 – Present · Shah Alam, Selangor · eMesys, Sutera & ADIMS'
				},
				summary: {
					ms: 'Menyelenggara dan menaik taraf sistem web perusahaan kritikal untuk sektor awam/kerajaan (termasuk eMesys, Sutera, dan ADIMS) dengan mematuhi piawaian keselamatan data, RBAC, dan audit. Membina antara muka modular Vue.js 3 dan aliran kerja Laravel Filament; mengoptimumkan pangkalan data MySQL, MariaDB & PostgreSQL 17; melancarkan servis Docker & Docker Swarm; mentadbir pelayan hibrid Linux (Ubuntu) & Windows Server; serta menyediakan sokongan teknikal Tier-2/3.',
					en: 'Maintain and upgrade mission-critical enterprise web systems for the public/government sector (including eMesys, Sutera, and ADIMS), complying with stringent data security, RBAC, and audit standards. Architect modular Vue.js 3 interfaces and Laravel Filament workflows; optimize MySQL, MariaDB & PostgreSQL 17 databases; deploy Docker & Docker Swarm services; harden Linux (Ubuntu) & Windows Server infrastructure; and provide tier-2/3 technical support.'
				},
				tech: [
					'Vue.js 3',
					'Laravel Filament',
					'PostgreSQL 17',
					'MySQL & MariaDB',
					'Docker Swarm',
					'RBAC & Audit',
					'Ubuntu & Windows Server'
				]
			},
			{
				id: 'ent-sutera',
				code: 'WORK-02',
				pinLabel: { ms: 'Nova Bitara (Dis 2025–Mac 2026)', en: 'Nova Bitara (Dec 2025–Mar 2026)' },
				title: {
					ms: 'IT Support & Web Developer — Nova Bitara Development Sdn Bhd',
					en: 'IT Support & Web Developer — Nova Bitara Development Sdn Bhd'
				},
				subtitle: {
					ms: 'Dec 2025 – Mar 2026 · Sunway, Selangor · IWA001, Infinity World & E-Commerce',
					en: 'Dec 2025 – Mar 2026 · Sunway, Selangor · IWA001, Infinity World & E-Commerce'
				},
				summary: {
					ms: 'Membangunkan dan melancarkan Sistem Permohonan Pinjaman Bercagar produksi (IWA001) menggunakan SvelteKit dan Supabase (polisi RLS & pengesahan JWT) dihoskan di Vercel dengan GoDaddy DNS. Membina portal korporat pelbagai bahasa (Infinity World) menggunakan SvelteKit, Redis caching, dan API e-mel Resend. Membangunkan platform e-dagang komersial Laravel & MySQL pada DirectAdmin/IPserverone dengan Cloudflare WAF/CDN, serta menyampaikan sokongan IT dalaman menyeluruh.',
					en: 'Engineered and deployed a production Collateralized Loan Application System (IWA001) using SvelteKit and Supabase (RLS policies & JWT authentication) hosted on Vercel with GoDaddy DNS. Built the multilingual corporate portal (Infinity World) with SvelteKit, Redis caching, and Resend API. Maintained a commercial Laravel & MySQL e-commerce platform on DirectAdmin/IPserverone with Cloudflare WAF/CDN, and delivered comprehensive internal IT support.'
				},
				tech: [
					'SvelteKit',
					'Supabase RLS & JWT',
					'Redis',
					'Resend API',
					'Laravel & MySQL',
					'Cloudflare WAF/CDN',
					'Vercel'
				],
				link: 'https://github.com/muhammedmunir/loan-infinity-world',
				linkLabel: { ms: 'Repo GitHub IWA001', en: 'IWA001 GitHub Repo' },
				secondaryLink: '/docs/iwa001-case-study.pdf',
				secondaryLinkLabel: { ms: 'Kajian Kes PDF (IWA001)', en: 'PDF Case Study (IWA001)' }
			},
			{
				id: 'ent-adims',
				code: 'WORK-03',
				pinLabel: { ms: 'TNB Protégé — Onboardx (2025)', en: 'TNB Protégé — Onboardx (2025)' },
				title: {
					ms: 'Enterprise Mobility Solutions (Protégé) — Tenaga Nasional Berhad (TNB)',
					en: 'Enterprise Mobility Solutions (Protégé) — Tenaga Nasional Berhad (TNB)'
				},
				subtitle: {
					ms: 'Apr 2025 – Dec 2025 · UOA Business Park, Shah Alam · Aplikasi Onboardx',
					en: 'Apr 2025 – Dec 2025 · UOA Business Park, Shah Alam · Onboardx App'
				},
				summary: {
					ms: 'Menerajui pembangunan full-stack Onboardx, aplikasi onboarding merentas platform perusahaan menggunakan Flutter (Dart) dan JavaScript. Membangunkan seni bina berbilang pangkalan data (Firebase Realtime DB, MongoDB, Supabase, MySQL); mengkonfigurasi pelayan awan Ubuntu di Microsoft Azure (NSG & pemantauan sumber); mengautomasikan saluran paip binaan dengan Jenkins CI/CD dan Kubernetes; serta mereka bentuk wireframe UI/UX dalam Figma.',
					en: 'Spearheaded full-stack development of Onboardx, an enterprise cross-platform onboarding application utilizing Flutter (Dart) and JavaScript. Engineered multi-database architecture (Firebase Realtime DB, MongoDB, Supabase, MySQL); configured Ubuntu cloud servers on Microsoft Azure (NSGs & resource monitoring); automated build pipelines with Jenkins CI/CD and Kubernetes; and designed UI/UX wireframes in Figma.'
				},
				tech: [
					'Flutter (Dart)',
					'JavaScript',
					'Firebase Realtime DB',
					'MongoDB',
					'Supabase',
					'MySQL',
					'Microsoft Azure',
					'Jenkins CI/CD',
					'Figma'
				],
				link: 'https://github.com/muhammedmunir/onboardx_tnb_app',
				linkLabel: { ms: 'Repo GitHub Onboardx', en: 'Onboardx GitHub Repo' },
				secondaryLink: '/docs/infinity-landing-case-study.pdf',
				secondaryLinkLabel: {
					ms: 'Kajian Kes PDF (Infinity World)',
					en: 'PDF Case Study (Infinity World)'
				}
			}
		]
	},
	{
		id: 'network',
		index: 2,
		code: '03 // TNB CYBER SECURITY & ICT (2019–2024)',
		shortTab: { ms: '03 · TNB SOC & ICT', en: '03 · TNB SOC & ICT' },
		coordinate: 'TNB PLATINUM BANGSAR KL · TNB KOTA BHARU KELANTAN',
		kicker: {
			ms: 'SEKSYEN 03 CV · PERTAHANAN ANCAMAN SOC & PEMETAAN GENTIAN OPTIK TNB',
			en: 'CV SECTION 03 · TNB SOC THREAT DEFENSE & FIBER-OPTIC TOPOLOGY'
		},
		title: {
			ms: 'TNB Cyber Security SOC & TNB ICT Fiber Topology',
			en: 'TNB Cyber Security SOC & TNB ICT Fiber Topology'
		},
		subtitle: {
			ms: 'Cyber Security Threat Defense (Sept 2023 – Feb 2024) · ICT Fiber Mapping (Dec 2019 – Feb 2020).',
			en: 'Cyber Security Threat Defense (Sept 2023 – Feb 2024) · ICT Fiber Mapping (Dec 2019 – Feb 2020).'
		},
		narrative: {
			ms: 'Stesen ketiga memaparkan 2 latihan industri teknikal saya di Tenaga Nasional Berhad (TNB) seperti di dalam CV: (1) Cyber Security Threat Defense di TNB Platinum Bangsar, Kuala Lumpur (Sept 2023 – Feb 2024), di mana saya memantau trafik rangkaian perusahaan dan log akses web secara masa nyata menggunakan papan pemuka Splunk SIEM dalam persekitaran SOC aktif, bekerjasama dengan Red Team menggunakan makmal Docker Vulhub untuk menghasilkan semula dan menganalisis kerentanan CVE, serta membantu Blue Team dalam pengukuhan pertahanan, audit log, pengesahan patch keselamatan, dan pematuhan ISO 27001 serta NIST. (2) Information & Communication Technology di TNB Kota Bharu, Kelantan (Dis 2019 – Feb 2020), di mana saya memetakan topologi laluan gentian optik serantau menggunakan Google Earth, mengira jarak laluan tepat dan model kos dalam Excel, serta membantu ujian redaman isyarat (signal attenuation).',
			en: 'Station 03 highlights my two technical internships at Tenaga Nasional Berhad (TNB) from the CV: (1) Cyber Security Threat Defense at TNB Platinum Bangsar, Kuala Lumpur (Sept 2023 – Feb 2024), monitoring enterprise network traffic and web access logs in real time via Splunk SIEM dashboards inside an active SOC, collaborating with the Red Team using Vulhub Docker laboratories to reproduce and analyze known CVEs, and assisting the Blue Team in defense hardening, log audits, patch verification, and ISO 27001 / NIST alignment. (2) Information & Communication Technology at TNB Kota Bharu, Kelantan (Dec 2019 – Feb 2020), mapping regional fiber-optic route topologies with Google Earth, computing precision route distances and costing models in Excel, and assisting with signal attenuation testing.'
		},
		architectureNote: {
			ms: 'Pelantar Kubah Radar SOC & Stesen Pendaratan Kabel Gentian Optik Bawah Laut: Klik kubah radar atau hab kabel untuk butiran penuh.',
			en: 'SOC Radar Dome & Subsea Fiber-Optic Cable Landing Station: Click the radar dome or cable hub for full CV details.'
		},
		metrics: [
			{
				value: 'Splunk SIEM',
				label: {
					ms: 'Pemantauan Trafik Masa Nyata di TNB SOC',
					en: 'Real-Time Traffic Monitoring at TNB SOC'
				}
			},
			{
				value: 'Vulhub CVE',
				label: {
					ms: 'Makmal Docker Red Team & Analisis Kerentanan',
					en: 'Red Team Docker Labs & CVE Analysis'
				}
			},
			{
				value: 'ISO 27001 / NIST',
				label: {
					ms: 'Pengukuhan Blue Team, Audit Log & Patch',
					en: 'Blue Team Hardening, Log & Patch Audits'
				}
			},
			{
				value: 'Fiber Topology',
				label: {
					ms: 'Pemetaan Gentian Optik TNB & Redaman Isyarat',
					en: 'TNB Fiber Route Mapping & Signal Attenuation'
				}
			}
		],
		stack: [
			'Splunk SIEM',
			'Vulhub Docker Labs',
			'CVE Vulnerability Analysis',
			'ISO 27001 & NIST',
			'Blue Team Hardening',
			'Fiber-Optic Route Mapping',
			'Signal Attenuation Testing',
			'Google Earth & Excel Costing',
			'Linux & Docker Homelab'
		],
		simulationTitle: {
			ms: 'Suasana Lautan & Pencahayaan (Open-Water GLSL)',
			en: 'Ocean State & Atmosphere (Open-Water GLSL)'
		},
		simulations: OCEAN_WEATHER_PRESETS,
		hotspots: [
			{
				id: 'net-soc',
				code: 'TNB-SOC',
				pinLabel: {
					ms: 'TNB Cyber Security SOC (2023–2024)',
					en: 'TNB Cyber Security SOC (2023–2024)'
				},
				title: {
					ms: 'Cyber Security Threat Defense (Internship) — Tenaga Nasional Berhad',
					en: 'Cyber Security Threat Defense (Internship) — Tenaga Nasional Berhad'
				},
				subtitle: {
					ms: 'Sept 2023 – Feb 2024 · Platinum Bangsar, Kuala Lumpur',
					en: 'Sept 2023 – Feb 2024 · Platinum Bangsar, Kuala Lumpur'
				},
				summary: {
					ms: 'Memantau trafik rangkaian perusahaan dan log akses web secara masa nyata menggunakan papan pemuka Splunk SIEM dalam persekitaran SOC aktif. Bekerjasama dengan Red Team menggunakan makmal Docker Vulhub untuk menghasilkan semula, menguji, dan menganalisis kerentanan CVE yang diketahui. Membantu Blue Team dalam pengukuhan pertahanan, audit log, pengesahan tampalan keselamatan, dan penjajaran pematuhan dengan garis panduan ISO 27001 serta NIST.',
					en: 'Monitored enterprise network traffic and web access logs in real time using Splunk SIEM dashboards within an active SOC environment. Collaborated with the Red Team using Vulhub Docker laboratories to reproduce, test, and analyze known CVE vulnerabilities. Assisted the Blue Team in defense hardening, log audits, security patch verifications, and compliance alignment with ISO 27001 and NIST guidelines.'
				},
				tech: [
					'Splunk SIEM',
					'Vulhub Docker Labs',
					'Red Team CVE Analysis',
					'Blue Team Hardening',
					'ISO 27001',
					'NIST'
				]
			},
			{
				id: 'net-tnb-fiber',
				code: 'TNB-ICT',
				pinLabel: {
					ms: 'TNB ICT Fiber Topology (2019–2020)',
					en: 'TNB ICT Fiber Topology (2019–2020)'
				},
				title: {
					ms: 'Information & Communication Technology (Internship) — Tenaga Nasional Berhad',
					en: 'Information & Communication Technology (Internship) — Tenaga Nasional Berhad'
				},
				subtitle: {
					ms: 'Dec 2019 – Feb 2020 · Kota Bharu, Kelantan',
					en: 'Dec 2019 – Feb 2020 · Kota Bharu, Kelantan'
				},
				summary: {
					ms: 'Memetakan topologi laluan gentian optik serantau menggunakan Google Earth; mengira jarak laluan yang tepat dan model anggaran kos pemasangan dalam Excel. Membantu jurutera rangkaian dengan ujian redaman isyarat (signal attenuation testing), audit infrastruktur fizikal, dan penyelenggaraan pencegahan.',
					en: 'Mapped regional fiber optic route topologies using Google Earth; computed precision route distances and deployment costing models in Excel. Assisted network engineers with signal attenuation testing, physical infrastructure audits, and preventative maintenance.'
				},
				tech: [
					'Fiber-Optic Route Topology',
					'Google Earth',
					'Excel Costing Models',
					'Signal Attenuation Testing',
					'Physical Infrastructure Audit'
				]
			},
			{
				id: 'net-utm-degree',
				code: 'HOMELAB',
				pinLabel: { ms: 'Linux & Docker Homelab', en: 'Linux & Docker Homelab' },
				title: {
					ms: 'Self-Hosted Linux & Docker Homelab Infrastructure',
					en: 'Self-Hosted Linux & Docker Homelab Infrastructure'
				},
				subtitle: {
					ms: 'github.com/muhammedmunir/homelab · Linux (Ubuntu, Kali) & Docker',
					en: 'github.com/muhammedmunir/homelab · Linux (Ubuntu, Kali) & Docker'
				},
				summary: {
					ms: 'Repositori eksperimen infrastruktur pelayan rumah sendiri (self-hosted homelab) untuk menguji konfigurasi rangkaian Linux, container Docker, firewall, dan automasi keselamatan.',
					en: 'Self-hosted homelab infrastructure repository for testing Linux networking configurations, Docker containers, firewall rules, and security automation.'
				},
				tech: [
					'Linux (Ubuntu, Kali)',
					'Docker',
					'Firewall & VPN',
					'Wireshark',
					'Self-Hosted Infrastructure'
				],
				link: 'https://github.com/muhammedmunir/homelab',
				linkLabel: { ms: 'Buka Repo Homelab di GitHub', en: 'Open Homelab Repo on GitHub' }
			}
		]
	},
	{
		id: 'ai_vision',
		index: 3,
		code: '04 // FEATURED PROJECTS (CV & GITHUB)',
		shortTab: { ms: '04 · 5 PROJEK CV', en: '04 · 5 CV PROJECTS' },
		coordinate: 'TINDAK · 9ROUTER MCP · OPENCV SUITE · BABY KICKING · LUMINA',
		kicker: {
			ms: 'SEKSYEN 04 CV · 5 SISTEM UNGGULAN & PROJEK KEJURUTERAAN (FEATURED SYSTEMS)',
			en: 'CV SECTION 04 · 5 FEATURED SYSTEMS & ENGINEERING PROJECTS'
		},
		title: {
			ms: 'TINDAK, 9Router Office, Computer Vision Suite, Baby Kicking & Lumina',
			en: 'TINDAK, 9Router Office, Computer Vision Suite, Baby Kicking & Lumina'
		},
		subtitle: {
			ms: 'Kesemua 5 projek utama yang disenaraikan dalam CV Resume rasmi bersama repositori GitHub.',
			en: 'All 5 flagship engineering projects listed in the official CV Resume alongside GitHub repositories.'
		},
		narrative: {
			ms: 'Stesen keempat memaparkan kesemua 5 projek di bawah seksyen FEATURED SYSTEMS & ENGINEERING PROJECTS dalam CV rasmi saya: (1) TINDAK — AI-Powered Mobile Action Engine (Flutter, Dart, Supabase RLS, Gemini AI; utiliti Android yang menangkap Share Intents untuk menghurai URL, nombor telefon & butiran bayaran secara local-first), (2) 9Router Office — Autonomous AI Agent 3D Workspace (Node.js 22+, Three.js, Model Context Protocol MCP, sintesis suara & ujian Playwright MCP), (3) Computer Vision & Win32 Desktop Automation Suite (Python, OpenCV SIFT & CIELAB, visual servoing, OCR dinamik, sempadan tetingkap Win32 & GUI CustomTkinter), (4) Baby Kicking Suite — Mobile Maternal Health Tracker (Flutter, Dart, Firebase Firestore & Functions, eksport PDF klinikal), dan (5) Lumina Glass Studio & Smart Mirror Visualizer (SvelteKit, Tailwind CSS, Laravel 11 RESTful API dengan 100% ujian PHPUnit).',
			en: 'Station 04 showcases all 5 projects under FEATURED SYSTEMS & ENGINEERING PROJECTS in my official CV: (1) TINDAK — AI-Powered Mobile Action Engine (Flutter, Dart, Supabase RLS, Gemini AI; Android utility capturing Share Intents to parse URLs, contacts & payment details locally), (2) 9Router Office — Autonomous AI Agent 3D Workspace (Node.js 22+, Three.js, Model Context Protocol MCP, dynamic voice synthesis & Playwright MCP testing), (3) Computer Vision & Win32 Desktop Automation Suite (Python, OpenCV SIFT & CIELAB, closed-loop visual servoing, dynamic OCR, native Win32 safety boundaries & CustomTkinter GUI), (4) Baby Kicking Suite — Mobile Maternal Health Tracker (Flutter, Dart, Firebase Firestore & Functions, clinical PDF export), and (5) Lumina Glass Studio & Smart Mirror Visualizer (SvelteKit, Tailwind CSS, Laravel 11 RESTful API with 100% PHPUnit coverage).'
		},
		architectureNote: {
			ms: 'Pelantar Makmal 5-Kubah Projek CV: Klik mana-mana pod projek di atas pelantar 3D untuk melihat seni bina dan pautan GitHub.',
			en: '5-Pod CV Project Observatory Platform: Click any project pod on the 3D platform to inspect architecture and GitHub links.'
		},
		metrics: [
			{
				value: 'TINDAK AI',
				label: {
					ms: 'Flutter Share Intent + Gemini AI + Supabase RLS',
					en: 'Flutter Share Intent + Gemini AI + Supabase RLS'
				}
			},
			{
				value: '9Router Office',
				label: {
					ms: 'Node.js 22+ + Three.js + MCP + Playwright',
					en: 'Node.js 22+ + Three.js + MCP + Playwright'
				}
			},
			{
				value: 'OpenCV Suite',
				label: {
					ms: 'SIFT + CIELAB + Visual Servoing + Win32 API',
					en: 'SIFT + CIELAB + Visual Servoing + Win32 API'
				}
			},
			{
				value: 'Baby Kicking & Lumina',
				label: {
					ms: 'Flutter Firestore PDF + Laravel 11 100% PHPUnit',
					en: 'Flutter Firestore PDF + Laravel 11 100% PHPUnit'
				}
			}
		],
		stack: [
			'Flutter & Dart',
			'Supabase RLS & Gemini AI',
			'Node.js 22+ & Three.js',
			'Model Context Protocol (MCP)',
			'Playwright MCP',
			'Python & OpenCV (SIFT/CIELAB)',
			'CustomTkinter & Win32 API',
			'Firebase Firestore & Functions',
			'SvelteKit & Tailwind CSS',
			'Laravel 11 RESTful API (PHPUnit 100%)'
		],
		simulationTitle: {
			ms: 'Suasana Lautan & Pencahayaan (Open-Water GLSL)',
			en: 'Ocean State & Atmosphere (Open-Water GLSL)'
		},
		simulations: OCEAN_WEATHER_PRESETS,
		hotspots: [
			{
				id: 'ai-tindak',
				code: 'PROJ-01',
				pinLabel: { ms: 'TINDAK — Mobile AI Engine', en: 'TINDAK — Mobile AI Engine' },
				title: {
					ms: 'TINDAK — AI-Powered Mobile Action Engine (Dalam Pembangunan)',
					en: 'TINDAK — AI-Powered Mobile Action Engine (In Development)'
				},
				subtitle: {
					ms: 'Flutter, Dart, Supabase RLS, Gemini AI',
					en: 'Flutter, Dart, Supabase RLS, Gemini AI'
				},
				summary: {
					ms: 'Membangunkan utiliti tindakan pantas Android yang menangkap Share Intents mudah alih untuk menghurai URL, nombor kenalan, dan butiran pembayaran secara tempatan. Mereka bentuk penghurai regex/peraturan local-first dengan fallback Gemini AI, digandingkan dengan backend Supabase yang disahkan melalui polisi keselamatan RLS yang ketat.',
					en: 'Engineered an Android rapid-action utility capturing mobile Share Intents to parse URLs, contact numbers, and payment details locally. Designed a local-first regex/rule parser with Gemini AI fallback, coupled with a Supabase backend validated with strict RLS security policies.'
				},
				tech: [
					'Flutter',
					'Dart',
					'Supabase RLS',
					'Gemini AI',
					'Android Share Intents',
					'Local-First Parser'
				]
			},
			{
				id: 'ai-9router',
				code: 'PROJ-02',
				pinLabel: { ms: '9Router Office (Three.js + MCP)', en: '9Router Office (Three.js + MCP)' },
				title: {
					ms: '9Router Office — Autonomous AI Agent 3D Workspace',
					en: '9Router Office — Autonomous AI Agent 3D Workspace'
				},
				subtitle: {
					ms: 'Node.js 22+, Three.js, Model Context Protocol (MCP), Playwright MCP',
					en: 'Node.js 22+, Three.js, Model Context Protocol (MCP), Playwright MCP'
				},
				summary: {
					ms: 'Mencipta ruang kerja maya 3D interaktif dalam Three.js di mana ejen AI autonomi berkomunikasi secara masa nyata melalui Model Context Protocol (MCP). Mengintegrasikan sintesis suara dinamik, penyimpanan keadaan ejen (agent state persistence), dan ujian UI/API automatik hujung-ke-hujung menggunakan Playwright MCP.',
					en: 'Created an interactive 3D virtual workspace in Three.js where autonomous AI agents communicate in real time via Model Context Protocol (MCP). Integrated dynamic voice synthesis, agent state persistence, and end-to-end automated UI/API testing utilizing Playwright MCP.'
				},
				tech: [
					'Node.js 22+',
					'Three.js',
					'Model Context Protocol (MCP)',
					'Playwright MCP',
					'Voice Synthesis'
				]
			},
			{
				id: 'ai-cv-rag',
				code: 'PROJ-03',
				pinLabel: { ms: 'OpenCV & Win32 Suite (+ RAG)', en: 'OpenCV & Win32 Suite (+ RAG)' },
				title: {
					ms: 'Computer Vision & Win32 Desktop Automation Suite (+ AI Policy RAG)',
					en: 'Computer Vision & Win32 Desktop Automation Suite (+ AI Policy RAG)'
				},
				subtitle: {
					ms: 'Python, OpenCV, CustomTkinter, Win32 API',
					en: 'Python, OpenCV, CustomTkinter, Win32 API'
				},
				summary: {
					ms: 'Membina suite automasi desktop lanjutan menggunakan padanan piramid SIFT berbilang skala, segmentasi CIELAB, dan visual servoing gelung tertutup. Melaksanakan pengekstrakan teks OCR dinamik, sempadan keselamatan tetingkap Win32 asli, dan GUI kawalan CustomTkinter berbilang benang. Turut merangkumi projek sumber terbuka AI Policy & Product Helper (RAG).',
					en: 'Built an advanced desktop automation suite utilizing multi-scale SIFT pyramid matching, CIELAB segmentation, and closed-loop visual servoing. Implemented dynamic OCR text extraction, native Win32 window safety boundaries, and a multithreaded CustomTkinter control GUI, alongside the open-source AI Policy & Product Helper (RAG).'
				},
				tech: [
					'Python',
					'OpenCV (SIFT & CIELAB)',
					'Visual Servoing',
					'Dynamic OCR',
					'Win32 API',
					'CustomTkinter'
				],
				link: 'https://github.com/muhammedmunir/ai-policy-helper-starter-pack',
				linkLabel: { ms: 'Repo GitHub AI Policy Helper', en: 'AI Policy Helper GitHub Repo' }
			},
			{
				id: 'proj-pin-bik',
				code: 'PROJ-04',
				pinLabel: { ms: 'Baby Kicking Suite (Flutter)', en: 'Baby Kicking Suite (Flutter)' },
				title: {
					ms: 'Baby Kicking Suite — Mobile Maternal Health Tracker (Dalam Pembangunan)',
					en: 'Baby Kicking Suite — Mobile Maternal Health Tracker (In Development)'
				},
				subtitle: {
					ms: 'Flutter, Dart, Firebase Firestore & Functions',
					en: 'Flutter, Dart, Firebase Firestore & Functions'
				},
				summary: {
					ms: 'Membangunkan aplikasi kesihatan ibu mengandung merentas platform dalam Flutter yang membolehkan ibu merekod dan menjejak corak pergerakan janin. Melaksanakan penyegerakan masa nyata Firebase Cloud Firestore, analitik amaran ketidakaturan pergerakan, dan eksport laporan PDF klinikal automatik untuk lawatan doktor.',
					en: 'Developed a cross-platform Flutter maternal wellness app enabling expectant mothers to record and track fetal movement patterns. Implemented Firebase Cloud Firestore real-time sync, movement irregularity alert analytics, and automated clinical PDF export for doctor visits.'
				},
				tech: [
					'Flutter',
					'Dart',
					'Firebase Cloud Firestore',
					'Firebase Functions',
					'Clinical PDF Export'
				],
				link: 'https://github.com/muhammedmunir/baby_kicking_project',
				linkLabel: { ms: 'Repo GitHub Baby Kicking Suite', en: 'Baby Kicking Suite GitHub Repo' }
			},
			{
				id: 'proj-pin-lumina',
				code: 'PROJ-05',
				pinLabel: { ms: 'Lumina Glass Studio (SvelteKit)', en: 'Lumina Glass Studio (SvelteKit)' },
				title: {
					ms: 'Lumina Glass Studio & Smart Mirror Visualizer',
					en: 'Lumina Glass Studio & Smart Mirror Visualizer'
				},
				subtitle: {
					ms: 'SvelteKit, Tailwind CSS, Laravel 11 RESTful API',
					en: 'SvelteKit, Tailwind CSS, Laravel 11 RESTful API'
				},
				summary: {
					ms: 'Membina konfigurator cermin pintar LED interaktif yang menampilkan kawalan suhu Kelvin masa nyata (3000K–6500K) dan shader tekstur. Membangunkan backend RESTful Laravel 11 dengan model Eloquent, pengesahan Form Request, dan 100% liputan ujian ciri PHPUnit.',
					en: 'Built an interactive LED smart mirror configurator featuring real-time Kelvin temperature (3000K–6500K) controls and texture shaders. Engineered a Laravel 11 RESTful backend with Eloquent models, Form Request validations, and 100% PHPUnit feature test coverage.'
				},
				tech: [
					'SvelteKit',
					'Tailwind CSS',
					'Laravel 11 RESTful API',
					'Eloquent ORM',
					'100% PHPUnit Tests'
				],
				link: 'https://github.com/muhammedmunir/welding-project',
				linkLabel: {
					ms: 'Repo GitHub Lumina / Welding Project',
					en: 'Lumina / Welding Project Repo'
				}
			}
		]
	},
	{
		id: 'mobility',
		index: 4,
		code: '05 // TECHNICAL SKILLS (5 CATEGORIES)',
		shortTab: { ms: '05 · KEMAHIRAN CV', en: '05 · TECH SKILLS' },
		coordinate: 'FRONTEND/MOBILE · BACKEND/API · DB/CLOUD · DEVOPS/SEC · AI/TOOLS',
		kicker: {
			ms: 'SEKSYEN 05 CV · 5 KATEGORI KEMAHIRAN TEKNIKAL RASMI',
			en: 'CV SECTION 05 · 5 OFFICIAL TECHNICAL SKILL CATEGORIES'
		},
		title: {
			ms: 'Matriks Kemahiran Teknikal (Technical Skills)',
			en: 'Technical Skills Matrix (5 Core Domains)'
		},
		subtitle: {
			ms: 'Frontend & Mobile · Backend & APIs · Databases & Cloud · DevOps & Security · AI, Automation & Tools.',
			en: 'Frontend & Mobile · Backend & APIs · Databases & Cloud · DevOps & Security · AI, Automation & Tools.'
		},
		narrative: {
			ms: 'Stesen kelima memaparkan keseluruhan matriks TECHNICAL SKILLS tepat seperti di dalam CV saya yang dibahagikan kepada 5 domain: (1) Frontend & Mobile: Vue.js 3, SvelteKit, Flutter (Dart), React.js, Tailwind CSS, HTML5, CSS3, JavaScript (ES6+), TypeScript, Three.js. (2) Backend & APIs: Laravel 11/12 (PHP 8.2+), Laravel Filament, Node.js, Python, RESTful APIs, C#, C++, Java. (3) Databases & Cloud: PostgreSQL (RLS), MySQL, MariaDB, Supabase, Firebase (Firestore & Realtime DB), MongoDB, Redis, Microsoft Azure, Vercel. (4) DevOps & Security: Docker, Docker Swarm, Jenkins, Kubernetes (Basic), Git / GitHub, Cloudflare WAF/CDN, DirectAdmin, Splunk SIEM, Wireshark, Vulhub, Firewall & VPN, ISO 27001, NIST. (5) AI, Automation & Tools: Model Context Protocol (MCP), OpenCV, Gemini AI, Playwright, Linux (Ubuntu, Kali), Windows Server, Figma, Microsoft Power BI.',
			en: 'Station 05 presents the complete TECHNICAL SKILLS matrix directly from my CV across 5 domains: (1) Frontend & Mobile: Vue.js 3, SvelteKit, Flutter (Dart), React.js, Tailwind CSS, HTML5, CSS3, JavaScript (ES6+), TypeScript, Three.js. (2) Backend & APIs: Laravel 11/12 (PHP 8.2+), Laravel Filament, Node.js, Python, RESTful APIs, C#, C++, Java. (3) Databases & Cloud: PostgreSQL (RLS), MySQL, MariaDB, Supabase, Firebase (Firestore & Realtime DB), MongoDB, Redis, Microsoft Azure, Vercel. (4) DevOps & Security: Docker, Docker Swarm, Jenkins, Kubernetes (Basic), Git / GitHub, Cloudflare WAF/CDN, DirectAdmin, Splunk SIEM, Wireshark, Vulhub, Firewall & VPN, ISO 27001, NIST. (5) AI, Automation & Tools: Model Context Protocol (MCP), OpenCV, Gemini AI, Playwright, Linux (Ubuntu, Kali), Windows Server, Figma, Microsoft Power BI.'
		},
		architectureNote: {
			ms: 'Pelantar 3-Pilon Kemahiran Teknikal: Klik mana-mana menara kemahiran untuk menyemak timbunan teknologi CV.',
			en: '3-Pylon Technical Skills Platform: Click any skill tower to inspect the CV technology stack.'
		},
		metrics: [
			{
				value: '10 Teknologi',
				label: {
					ms: 'Frontend & Mobile (Vue 3, SvelteKit, Flutter)',
					en: 'Frontend & Mobile (Vue 3, SvelteKit, Flutter)'
				}
			},
			{
				value: '8 Teknologi',
				label: {
					ms: 'Backend & APIs (Laravel 11/12, Filament, Python)',
					en: 'Backend & APIs (Laravel 11/12, Filament, Python)'
				}
			},
			{
				value: '9 Platform',
				label: {
					ms: 'Databases & Cloud (PostgreSQL RLS, Azure, Vercel)',
					en: 'Databases & Cloud (PostgreSQL RLS, Azure, Vercel)'
				}
			},
			{
				value: '21 Alatan',
				label: {
					ms: 'DevOps, Security (Docker Swarm, SIEM) & AI/MCP',
					en: 'DevOps, Security (Docker Swarm, SIEM) & AI/MCP'
				}
			}
		],
		stack: [
			'Vue.js 3 · SvelteKit · Flutter',
			'Laravel 11/12 · Filament · Node.js · Python',
			'PostgreSQL (RLS) · MySQL · MariaDB · Supabase',
			'Firebase · MongoDB · Redis · Azure · Vercel',
			'Docker Swarm · Jenkins · Cloudflare WAF · Splunk SIEM',
			'MCP · OpenCV · Gemini AI · Playwright · Power BI'
		],
		simulationTitle: {
			ms: 'Suasana Lautan & Pencahayaan (Open-Water GLSL)',
			en: 'Ocean State & Atmosphere (Open-Water GLSL)'
		},
		simulations: OCEAN_WEATHER_PRESETS,
		hotspots: [
			{
				id: 'mob-nova-loan',
				code: 'SKILL-01',
				pinLabel: { ms: 'Frontend, Mobile & Backend APIs', en: 'Frontend, Mobile & Backend APIs' },
				title: {
					ms: 'Frontend & Mobile + Backend & APIs',
					en: 'Frontend & Mobile + Backend & APIs'
				},
				subtitle: {
					ms: 'Vue.js 3 · SvelteKit · Flutter · Laravel 11/12 (Filament) · Node.js · Python',
					en: 'Vue.js 3 · SvelteKit · Flutter · Laravel 11/12 (Filament) · Node.js · Python'
				},
				summary: {
					ms: 'Frontend & Mobile: Vue.js 3, SvelteKit, Flutter (Dart), React.js, Tailwind CSS, HTML5, CSS3, JavaScript (ES6+), TypeScript, Three.js. Backend & APIs: Laravel 11/12 (PHP 8.2+), Laravel Filament, Node.js, Python, RESTful APIs, C#, C++, Java.',
					en: 'Frontend & Mobile: Vue.js 3, SvelteKit, Flutter (Dart), React.js, Tailwind CSS, HTML5, CSS3, JavaScript (ES6+), TypeScript, Three.js. Backend & APIs: Laravel 11/12 (PHP 8.2+), Laravel Filament, Node.js, Python, RESTful APIs, C#, C++, Java.'
				},
				tech: [
					'Vue.js 3',
					'SvelteKit',
					'Flutter (Dart)',
					'React.js',
					'Tailwind CSS',
					'TypeScript',
					'Three.js',
					'Laravel 11/12',
					'Laravel Filament',
					'Node.js',
					'Python'
				]
			},
			{
				id: 'mob-onboardx',
				code: 'SKILL-02',
				pinLabel: {
					ms: 'Databases, Cloud, DevOps & Security',
					en: 'Databases, Cloud, DevOps & Security'
				},
				title: {
					ms: 'Databases & Cloud + DevOps & Security',
					en: 'Databases & Cloud + DevOps & Security'
				},
				subtitle: {
					ms: 'PostgreSQL (RLS) · MySQL · MariaDB · Supabase · Docker Swarm · Splunk SIEM',
					en: 'PostgreSQL (RLS) · MySQL · MariaDB · Supabase · Docker Swarm · Splunk SIEM'
				},
				summary: {
					ms: 'Databases & Cloud: PostgreSQL (RLS), MySQL, MariaDB, Supabase, Firebase (Firestore & Realtime DB), MongoDB, Redis, Microsoft Azure, Vercel. DevOps & Security: Docker, Docker Swarm, Jenkins, Kubernetes (Basic), Git / GitHub, Cloudflare WAF/CDN, DirectAdmin, Splunk SIEM, Wireshark, Vulhub, Firewall & VPN, ISO 27001, NIST.',
					en: 'Databases & Cloud: PostgreSQL (RLS), MySQL, MariaDB, Supabase, Firebase (Firestore & Realtime DB), MongoDB, Redis, Microsoft Azure, Vercel. DevOps & Security: Docker, Docker Swarm, Jenkins, Kubernetes (Basic), Git / GitHub, Cloudflare WAF/CDN, DirectAdmin, Splunk SIEM, Wireshark, Vulhub, Firewall & VPN, ISO 27001, NIST.'
				},
				tech: [
					'PostgreSQL (RLS)',
					'MySQL',
					'MariaDB',
					'Supabase',
					'Firebase',
					'MongoDB',
					'Redis',
					'Microsoft Azure',
					'Vercel',
					'Docker Swarm',
					'Jenkins',
					'Cloudflare WAF',
					'Splunk SIEM',
					'ISO 27001 & NIST'
				]
			},
			{
				id: 'mob-bik-lumina',
				code: 'SKILL-03',
				pinLabel: { ms: 'AI, MCP, OpenCV & Server Tools', en: 'AI, MCP, OpenCV & Server Tools' },
				title: {
					ms: 'AI, Automation & Tools',
					en: 'AI, Automation & Tools'
				},
				subtitle: {
					ms: 'Model Context Protocol (MCP) · OpenCV · Gemini AI · Playwright · Linux & Windows Server',
					en: 'Model Context Protocol (MCP) · OpenCV · Gemini AI · Playwright · Linux & Windows Server'
				},
				summary: {
					ms: 'AI, Automation & Tools: Model Context Protocol (MCP), OpenCV, Gemini AI, Playwright, Linux (Ubuntu, Kali), Windows Server, Figma, Microsoft Power BI.',
					en: 'AI, Automation & Tools: Model Context Protocol (MCP), OpenCV, Gemini AI, Playwright, Linux (Ubuntu, Kali), Windows Server, Figma, Microsoft Power BI.'
				},
				tech: [
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
		]
	},
	{
		id: 'terminal',
		index: 5,
		code: '06 // EDUCATION, CERTIFICATIONS & CONTACT',
		shortTab: { ms: '06 · UTM & HUBUNGI', en: '06 · UTM & CONTACT' },
		coordinate: 'UTM JOHOR BAHRU & KL · CISCO ACADEMY · PUCHONG SELANGOR',
		kicker: {
			ms: 'SEKSYEN 06 CV · PENDIDIKAN UTM, 7 PENSIJILAN & HUBUNGAN TERUS',
			en: 'CV SECTION 06 · UTM EDUCATION, 7 CERTIFICATIONS & DIRECT CONTACT'
		},
		title: {
			ms: 'Pendidikan UTM, Sijil Cisco/Data & Hubungi Saya',
			en: 'UTM Education, Cisco/Data Certifications & Contact'
		},
		subtitle: {
			ms: 'Bachelor of Computer Science (Network Security, CGPA 3.17) · Diploma UTM (CGPA 2.72) · 5 Sijil Cisco · 2 Sijil Data.',
			en: 'Bachelor of Computer Science (Network Security, CGPA 3.17) · Diploma UTM (CGPA 2.72) · 5 Cisco Certs · 2 Data Certs.'
		},
		narrative: {
			ms: 'Stesen keenam melengkapkan CV saya dengan latar belakang akademik di Universiti Teknologi Malaysia (UTM): (1) Bachelor of Computer Science (Network Security) di UTM Johor Bahru (2021 – 2024 | CGPA: 3.17) dengan Projek Tahun Akhir (FYP) Geospatial Reporting Management System for UTM (SvelteKit, Tailwind CSS, Google Maps API, Supabase) dan kursus Ethical Hacking & Penetration Testing, Cybersecurity Governance & Compliance, serta Network Security. (2) Diploma in Computer Science di UTM Kuala Lumpur (2017 – 2020 | CGPA: 2.72) dengan FYP E-Commerce Web Platform (PHP, MySQL, Azure Ubuntu). Dilengkapi 5 pensijilan Cisco (CCNAv7 Intro, CCNAv7 SRWE, Cisco DevNet Associate, Cisco Network Security, IoT Fundamentals), 2 pensijilan Data (Microsoft Power BI Data Analysis Jan 2025, Python for Data Analysis Dis 2024), serta pautan hubungan terus.',
			en: 'Station 06 completes my CV with my academic background at Universiti Teknologi Malaysia (UTM): (1) Bachelor of Computer Science (Network Security) at UTM Johor Bahru (2021 – 2024 | CGPA: 3.17) featuring the Final Year Project Geospatial Reporting Management System for UTM (SvelteKit, Tailwind CSS, Google Maps API, Supabase) and coursework in Ethical Hacking & Penetration Testing, Cybersecurity Governance & Compliance, and Network Security. (2) Diploma in Computer Science at UTM Kuala Lumpur (2017 – 2020 | CGPA: 2.72) with the E-Commerce Web Platform FYP (PHP, MySQL, Azure Ubuntu). Backed by 5 Cisco certifications, 2 Specialized Analytics certifications (Microsoft Power BI Jan 2025, Python for Data Analysis Dec 2024), and direct contact channels.'
		},
		architectureNote: {
			ms: 'Pelantar Terminal Akademik & Komunikasi: Klik penanda UTM, Sijil Cisco, WhatsApp/E-mel, atau Resume PDF.',
			en: 'Academic & Communications Terminal Platform: Click the UTM, Cisco Certs, WhatsApp/Email, or Resume PDF markers.'
		},
		metrics: [
			{
				value: 'CGPA 3.17',
				label: {
					ms: 'B.CompSc (Network Security) — UTM JB (2021–2024)',
					en: 'B.CompSc (Network Security) — UTM JB (2021–2024)'
				}
			},
			{
				value: 'CGPA 2.72',
				label: {
					ms: 'Diploma in Computer Science — UTM KL (2017–2020)',
					en: 'Diploma in Computer Science — UTM KL (2017–2020)'
				}
			},
			{
				value: '5 Sijil Cisco',
				label: {
					ms: 'CCNAv7 (×2), DevNet, Network Security & IoT',
					en: 'CCNAv7 (×2), DevNet, Network Security & IoT'
				}
			},
			{
				value: '+60 13-563 6124',
				label: {
					ms: 'Puchong, Selangor · E-mel, WhatsApp & Resume PDF',
					en: 'Puchong, Selangor · Email, WhatsApp & Resume PDF'
				}
			}
		],
		stack: [
			'UTM B.CompSc (Network Security)',
			'UTM Diploma in Computer Science',
			'CCNAv7: Intro to Networks',
			'CCNAv7: Switching, Routing & Wireless',
			'Cisco DevNet Associate',
			'Cisco Network Security',
			'IoT Fundamentals',
			'Microsoft Power BI (Jan 2025)',
			'Python for Data Analysis (Dec 2024)'
		],
		simulationTitle: {
			ms: 'Suasana Lautan & Pencahayaan (Open-Water GLSL)',
			en: 'Ocean State & Atmosphere (Open-Water GLSL)'
		},
		simulations: OCEAN_WEATHER_PRESETS,
		hotspots: [
			{
				id: 'term-email',
				code: 'EDU-01',
				pinLabel: {
					ms: 'Ijazah UTM (Network Security, CGPA 3.17)',
					en: 'UTM Degree (Network Security, CGPA 3.17)'
				},
				title: {
					ms: 'Bachelor of Computer Science (Network Security) — UTM (2021 – 2024)',
					en: 'Bachelor of Computer Science (Network Security) — UTM (2021 – 2024)'
				},
				subtitle: {
					ms: 'CGPA: 3.17 · Johor Bahru, Johor · FYP Geospatial Reporting Management System',
					en: 'CGPA: 3.17 · Johor Bahru, Johor · FYP Geospatial Reporting Management System'
				},
				summary: {
					ms: 'Final Year Project: Geospatial Reporting Management System for UTM (SvelteKit, Tailwind CSS, Google Maps API, Supabase). Relevant Coursework: Ethical Hacking & Penetration Testing, Cybersecurity Governance & Compliance, Network Security.',
					en: 'Final Year Project: Geospatial Reporting Management System for UTM (SvelteKit, Tailwind CSS, Google Maps API, Supabase). Relevant Coursework: Ethical Hacking & Penetration Testing, Cybersecurity Governance & Compliance, Network Security.'
				},
				tech: [
					'SvelteKit',
					'Tailwind CSS',
					'Google Maps API',
					'Supabase',
					'Ethical Hacking',
					'Cybersecurity Governance',
					'Network Security'
				],
				link: 'https://github.com/muhammedmunir/Reporting-Management-System-',
				linkLabel: { ms: 'Buka Repo FYP Ijazah UTM', en: 'Open UTM Degree FYP Repo' }
			},
			{
				id: 'term-whatsapp',
				code: 'EDU-02',
				pinLabel: {
					ms: 'Diploma UTM & 7 Sijil Cisco/Data',
					en: 'UTM Diploma & 7 Cisco/Data Certs'
				},
				title: {
					ms: 'Diploma in Computer Science — UTM (2017 – 2020) & 7 Sijil Profesional',
					en: 'Diploma in Computer Science — UTM (2017 – 2020) & 7 Professional Certifications'
				},
				subtitle: {
					ms: 'CGPA: 2.72 · Kuala Lumpur · 5 Sijil Cisco & 2 Sijil Data Analytics',
					en: 'CGPA: 2.72 · Kuala Lumpur · 5 Cisco Certs & 2 Data Analytics Certs'
				},
				summary: {
					ms: 'Diploma FYP: E-Commerce Web Platform dengan pengesahan pengguna, pengurusan katalog & aliran pembayaran (PHP, MySQL, Azure Ubuntu). Kursus: OOP (C#), Structured Programming (C++), Java. Pensijilan Cisco: CCNAv7 Intro to Networks, CCNAv7 SRWE, Cisco DevNet Associate, Cisco Network Security, IoT Fundamentals. Analitik: Microsoft Power BI Data Analysis (Jan 2025) & Python for Data Analysis (Dis 2024).',
					en: 'Diploma FYP: E-Commerce Web Platform with user authentication, catalog management & payment flows (PHP, MySQL, Azure Ubuntu). Coursework: OOP (C#), Structured Programming (C++), Java. Cisco Certifications: CCNAv7 Intro to Networks, CCNAv7 SRWE, Cisco DevNet Associate, Cisco Network Security, IoT Fundamentals. Analytics: Microsoft Power BI Data Analysis (Jan 2025) & Python for Data Analysis (Dec 2024).'
				},
				tech: [
					'CCNAv7',
					'Cisco DevNet Associate',
					'Cisco Network Security',
					'IoT Fundamentals',
					'Microsoft Power BI',
					'Python Data Analysis',
					'PHP & MySQL'
				]
			},
			{
				id: 'term-github',
				code: 'CONTACT-01',
				pinLabel: {
					ms: 'WhatsApp (+60 13-563 6124) & E-mel',
					en: 'WhatsApp (+60 13-563 6124) & Email'
				},
				title: {
					ms: 'Hubungi Terus: Telefon, WhatsApp & E-mel Rasmi',
					en: 'Direct Contact: Phone, WhatsApp & Official Email'
				},
				subtitle: {
					ms: 'Puchong, Selangor · +60 13-563 6124 · muhammed.munir97.mm@gmail.com',
					en: 'Puchong, Selangor · +60 13-563 6124 · muhammed.munir97.mm@gmail.com'
				},
				summary: {
					ms: 'Bahasa: Bahasa Melayu (Penutur Jati / Dwibahasa) & Bahasa Inggeris (Kecekapan Kerja Profesional). Sedia dihubungi terus melalui WhatsApp (+60 13-563 6124) atau e-mel (muhammed.munir97.mm@gmail.com).',
					en: 'Languages: Malay (Native / Bilingual Proficiency) & English (Professional Working Proficiency). Reach out directly via WhatsApp (+60 13-563 6124) or email (muhammed.munir97.mm@gmail.com).'
				},
				tech: ['+60 13-563 6124', 'muhammed.munir97.mm@gmail.com', 'Puchong, Selangor'],
				link: 'https://wa.me/60135636124',
				linkLabel: { ms: 'WhatsApp (+60 13-563 6124)', en: 'WhatsApp (+60 13-563 6124)' },
				secondaryLink: 'mailto:muhammed.munir97.mm@gmail.com',
				secondaryLinkLabel: { ms: 'Hantar E-mel Rasmi', en: 'Send Official Email' }
			},
			{
				id: 'term-linkedin',
				code: 'CONTACT-02',
				pinLabel: { ms: 'Resume PDF, GitHub & LinkedIn', en: 'Resume PDF, GitHub & LinkedIn' },
				title: {
					ms: 'Muat Turun Resume PDF, LinkedIn & GitHub',
					en: 'Download Resume PDF, LinkedIn & GitHub'
				},
				subtitle: {
					ms: 'github.com/muhammedmunir · linkedin.com/in/muhammed-munir-bin-mohd-azmi-9b233b271',
					en: 'github.com/muhammedmunir · linkedin.com/in/muhammed-munir-bin-mohd-azmi-9b233b271'
				},
				summary: {
					ms: 'Muat turun salinan PDF rasmi Resume ATS 2 halaman (/resume.pdf) atau layari profil GitHub dan LinkedIn saya.',
					en: 'Download the official 2-page ATS Resume PDF (/resume.pdf) or visit my GitHub and LinkedIn profiles.'
				},
				tech: ['Official Resume PDF', 'GitHub (muhammedmunir)', 'LinkedIn Profile'],
				link: '/resume.pdf',
				linkLabel: { ms: 'Muat Turun Resume PDF', en: 'Download Resume PDF' },
				secondaryLink: 'https://github.com/muhammedmunir',
				secondaryLinkLabel: { ms: 'Buka GitHub (muhammedmunir)', en: 'Open GitHub (muhammedmunir)' }
			}
		]
	}
];

export const CAREER_TIMELINE: CareerEntry[] = [
	{
		id: 'yhcm',
		company: 'YHCM Sdn Bhd',
		role: {
			ms: 'Programmer / Full-Stack Enterprise Developer',
			en: 'Programmer / Full-Stack Enterprise Developer'
		},
		period: 'Apr 2026 – Present',
		location: 'Shah Alam, Selangor',
		stationId: 'enterprise',
		highlights: {
			ms: [
				'Menyelenggara dan menaik taraf sistem web perusahaan kritikal untuk sektor awam/kerajaan (termasuk eMesys, Sutera, dan ADIMS) dengan mematuhi piawaian keselamatan data yang ketat, kawalan akses berasaskan peranan (RBAC), dan audit.',
				'Mereka bentuk dan membina antara muka frontend modular menggunakan Vue.js 3 serta menyelaraskan aliran kerja pentadbiran dengan Laravel Filament.',
				'Mengurus dan mengoptimumkan pangkalan data hubungan merentasi MySQL, MariaDB, dan PostgreSQL 17 melalui penambahbaikan pengindeksan serta skema.',
				'Melancarkan, memantau, dan menskalakan servis berasaskan container serta aliran kerja imej menggunakan Docker dan Docker Swarm merentasi nod produksi.',
				'Mentadbir dan memperkukuh (harden) infrastruktur pelayan hibrid merentasi persekitaran Linux (Ubuntu) dan Windows Server bagi memastikan ketersediaan tinggi (high availability).',
				'Menyelesaikan insiden operasi IT, menyediakan sokongan teknikal Tier-2/3, dan mengkonfigurasi integrasi API bersekuriti untuk operasi organisasi.'
			],
			en: [
				'Maintain and upgrade mission-critical enterprise web systems for the public/government sector (including eMesys, Sutera, and ADIMS), complying with stringent data security, role-based access control (RBAC), and audit standards.',
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
				'Menerajui pembangunan full-stack Onboardx, aplikasi onboarding merentas platform perusahaan menggunakan Flutter (Dart) dan JavaScript.',
				'Membangunkan seni bina berbilang pangkalan data yang menyokong Firebase Realtime DB, MongoDB, Supabase, dan MySQL.',
				'Mengkonfigurasi dan menyelenggara pelayan awan Ubuntu di Microsoft Azure, termasuk pengurusan Network Security Groups (NSGs) dan pemantauan sumber sistem.',
				'Mengautomasikan saluran paip binaan dan penghantaran dengan Jenkins CI/CD serta memperoleh pengalaman praktikal dalam orkestrasi container menggunakan Kubernetes.',
				'Mereka bentuk pengalaman pengguna yang intuitif dan wireframe antara muka dalam Figma; menyelesaikan tiket sokongan teknikal mengikut sasaran SLA yang ketat.'
			],
			en: [
				'Spearheaded full-stack development of Onboardx, an enterprise cross-platform onboarding application utilizing Flutter (Dart) and JavaScript.',
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
		name: 'eMesys, Sutera & ADIMS — Public Sector Enterprise Systems',
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
		name: 'Onboardx — TNB Enterprise Cross-Platform Onboarding App',
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
