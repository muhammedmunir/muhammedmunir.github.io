/**
 * Synaptic Pitch Deck — local bilingual content.
 * Owner: adaptive-03-executor. Scope: Presentation.svelte only.
 *
 * Every string here is authored in BM + EN so the deck never depends on editing
 * shared translations. Content is limited to facts already present in the
 * portfolio, resume and project records; no uptime, latency, percentage or
 * "AI capability" claims are introduced.
 */

export type DeckLang = 'ms' | 'en';

export interface Bi {
	readonly ms: string;
	readonly en: string;
}

export interface BiList {
	readonly ms: readonly string[];
	readonly en: readonly string[];
}

export type ChapterId =
	| 'profile'
	| 'public-sector'
	| 'delivery'
	| 'projects'
	| 'architecture'
	| 'competencies'
	| 'education'
	| 'contact';

export interface DeckChapter {
	readonly id: ChapterId;
	readonly name: Bi;
	readonly tagline: Bi;
	readonly heading: Bi;
	readonly lead: Bi;
}

export const chapters: readonly DeckChapter[] = [
	{
		id: 'profile',
		name: { ms: 'Profil', en: 'Profile' },
		tagline: { ms: 'Siapa saya, apa yang saya bina', en: 'Who I am, what I build' },
		heading: {
			ms: 'Pembangun full-stack dengan asas keselamatan rangkaian',
			en: 'Full-stack developer with a network security foundation'
		},
		lead: {
			ms: 'Saya membina dan menyelenggara sistem perusahaan: sistem sektor awam yang menuntut integriti data, platform SaaS berbilang bahasa, aplikasi mudah alih dan platform e-dagang. Fokus saya ialah sistem yang boleh dioperasikan, selamat dan mudah diselenggara.',
			en: 'I build and maintain enterprise systems: public sector systems with strict data integrity requirements, multilingual SaaS platforms, mobile applications and e-commerce platforms. My focus is on systems that are operable, secure and maintainable.'
		}
	},
	{
		id: 'public-sector',
		name: { ms: 'Sektor Awam', en: 'Public Sector' },
		tagline: {
			ms: 'Sistem kritikal yang sedang berjalan',
			en: 'Mission-critical systems in operation'
		},
		heading: {
			ms: 'Menyelenggara sistem kritikal sektor awam',
			en: 'Maintaining mission-critical public sector systems'
		},
		lead: {
			ms: 'Di YHCM Sdn Bhd, saya menyelenggara dan memperluas sistem pengeluaran sektor awam — eMesys, Sutera dan ADIMS — dengan frontend Vue.js 3, backend Laravel Filament dan pangkalan data MariaDB/MySQL, di bawah kawalan akses berasaskan peranan.',
			en: 'At YHCM Sdn Bhd I maintain and extend public sector production systems — eMesys, Sutera and ADIMS — using a Vue.js 3 frontend, Laravel Filament backend and MariaDB/MySQL databases, under role-based access control.'
		}
	},
	{
		id: 'delivery',
		name: { ms: 'Penyampaian', en: 'Delivery' },
		tagline: { ms: 'Agensi, perusahaan, SOC', en: 'Agency, enterprise, SOC' },
		heading: {
			ms: 'Rekod penyampaian merentas agensi dan perusahaan',
			en: 'A delivery record across agency and enterprise'
		},
		lead: {
			ms: 'Sebelum YHCM, saya menyampaikan tiga projek pengeluaran dalam satu tempoh kontrak di Nova Bitara, membina aplikasi onboarding perusahaan untuk TNB melalui program Protégé, dan memulakan kerjaya dengan latihan keselamatan siber di SOC TNB Platinum.',
			en: 'Before YHCM I delivered three production projects within a single contract term at Nova Bitara, built an enterprise onboarding application for TNB through the Protégé programme, and started out with cybersecurity training in the TNB Platinum SOC.'
		}
	},
	{
		id: 'projects',
		name: { ms: 'Projek', en: 'Projects' },
		tagline: {
			ms: 'Lima sistem dengan bukti teknikal',
			en: 'Five systems with technical evidence'
		},
		heading: { ms: 'Projek terpilih', en: 'Selected projects' },
		lead: {
			ms: 'Setiap projek menyertakan aliran sistem, keputusan seni bina, kawalan keselamatan dan hasil yang boleh disahkan. Butiran penuh berada dalam panel boleh kembang.',
			en: 'Each project includes its system flow, architecture decisions, security controls and verifiable outcomes. Full detail lives in expandable panels.'
		}
	},
	{
		id: 'architecture',
		name: { ms: 'Seni Bina & Keselamatan', en: 'Architecture & Security' },
		tagline: { ms: 'Corak yang berulang', en: 'Patterns that repeat' },
		heading: {
			ms: 'Corak seni bina dan kawalan keselamatan',
			en: 'Architecture patterns and security controls'
		},
		lead: {
			ms: 'Merentas projek, corak yang sama berulang: pengesahan identiti di peringkat platform, pengasingan data di peringkat pangkalan data, dan deployment berlapis. Saya juga menandakan dengan jelas apa yang telah dihantar ke pengeluaran berbanding apa yang masih penerokaan.',
			en: 'Across projects the same patterns recur: platform-level identity, database-level data isolation, and layered deployment. I also mark clearly what shipped to production versus what remains exploration.'
		}
	},
	{
		id: 'competencies',
		name: { ms: 'Kompetensi', en: 'Competencies' },
		tagline: { ms: 'Tahap penggunaan sebenar', en: 'Real usage tiers' },
		heading: {
			ms: 'Keupayaan teknikal mengikut tahap penggunaan',
			en: 'Technical capability by real usage tier'
		},
		lead: {
			ms: 'Teknologi dikelaskan mengikut tempat ia benar-benar digunakan dalam kerja saya — bukan skor peratusan. Setiap satu disertakan bukti projek di mana ia digunakan.',
			en: 'Technologies are grouped by where they are actually used in my work — not percentage scores. Each one carries evidence of the project it was used in.'
		}
	},
	{
		id: 'education',
		name: { ms: 'Pendidikan', en: 'Education' },
		tagline: { ms: 'Asas akademik & pensijilan', en: 'Academic foundation & certification' },
		heading: { ms: 'Latar belakang akademik', en: 'Academic background' },
		lead: {
			ms: 'Ijazah Sarjana Muda Sains Komputer (Keselamatan Rangkaian) dan Diploma Sains Komputer (Pembangunan Perisian) dari Universiti Teknologi Malaysia, disokong pensijilan Cisco Networking Academy dan Microsoft Power BI.',
			en: 'A B.Sc. in Computer Science (Network Security) and a Diploma in Computer Science (Software Engineering) from Universiti Teknologi Malaysia, supported by Cisco Networking Academy and Microsoft Power BI certification.'
		}
	},
	{
		id: 'contact',
		name: { ms: 'Hubungan', en: 'Contact' },
		tagline: { ms: 'Maklumat yang boleh disahkan', en: 'Verifiable contact details' },
		heading: { ms: 'Mari bincang', en: 'Let us talk' },
		lead: {
			ms: 'Terbuka untuk peranan sepenuh masa, kontrak perusahaan dan perundingan teknikal. Resume ATS dan kajian kes projek boleh dimuat turun di bawah.',
			en: 'Open to full-time roles, enterprise contracts and technical consulting. The ATS resume and project case studies are downloadable below.'
		}
	}
];

export interface DeckFact {
	readonly label: Bi;
	readonly value: Bi;
	readonly href?: string;
}

export interface DeckSignal {
	readonly icon: string;
	readonly title: Bi;
	readonly body: Bi;
}

export interface DeckMilestone {
	readonly period: Bi;
	readonly title: Bi;
	readonly org: string;
	readonly note: Bi;
}

export const profile = {
	name: 'Muhammed Munir Bin Mohd Azmi',
	role: {
		ms: 'Pembangun Full-Stack · Keselamatan Rangkaian',
		en: 'Full-Stack Developer · Network Security'
	} as Bi,
	location: 'Puchong, Selangor',
	email: 'muhammed.munir97.mm@gmail.com',
	phone: '+6013-5636124',
	phoneHref: 'tel:+60135636124',
	facts: [
		{
			label: { ms: 'Lokasi', en: 'Location' },
			value: { ms: 'Puchong, Selangor', en: 'Puchong, Selangor' }
		},
		{
			label: { ms: 'E-mel', en: 'Email' },
			value: { ms: 'muhammed.munir97.mm@gmail.com', en: 'muhammed.munir97.mm@gmail.com' },
			href: 'mailto:muhammed.munir97.mm@gmail.com'
		},
		{
			label: { ms: 'Telefon', en: 'Phone' },
			value: { ms: '+6013-5636124', en: '+6013-5636124' },
			href: 'tel:+60135636124'
		},
		{
			label: { ms: 'Kelayakan', en: 'Qualification' },
			value: {
				ms: 'BSc Sains Komputer (Keselamatan Rangkaian), UTM',
				en: 'B.Sc. Computer Science (Network Security), UTM'
			}
		},
		{
			label: { ms: 'Bahasa', en: 'Languages' },
			value: { ms: 'Bahasa Melayu, Inggeris', en: 'Malay, English' }
		},
		{
			label: { ms: 'Status', en: 'Status' },
			value: {
				ms: 'Terbuka untuk sepenuh masa & kontrak',
				en: 'Open to full-time & contract roles'
			}
		}
	] as readonly DeckFact[],
	signals: [
		{
			icon: '🏛️',
			title: { ms: 'Sektor awam', en: 'Public sector' },
			body: {
				ms: 'Menyelenggara dan memperluas sistem kritikal sektor awam (eMesys, Sutera, ADIMS) di bawah piawaian integriti data kerajaan.',
				en: 'Maintain and extend mission-critical public sector systems (eMesys, Sutera, ADIMS) under government data integrity standards.'
			}
		},
		{
			icon: '🚀',
			title: { ms: 'Penyampaian agensi', en: 'Agency delivery' },
			body: {
				ms: 'Tiga projek pengeluaran disiapkan dalam satu tempoh kontrak di Nova Bitara: sistem pinjaman, portal korporat tiga bahasa dan platform e-dagang.',
				en: 'Three production projects completed within a single contract term at Nova Bitara: a loan system, a three-language corporate portal and an e-commerce platform.'
			}
		},
		{
			icon: '🛡️',
			title: { ms: 'Perusahaan & keselamatan', en: 'Enterprise & security' },
			body: {
				ms: 'Pengalaman platform perusahaan TNB (OnboardX) dan latihan keselamatan siber di SOC TNB Platinum menggunakan Splunk SIEM.',
				en: 'Enterprise platform experience at TNB (OnboardX) and cybersecurity training in the TNB Platinum SOC using Splunk SIEM.'
			}
		}
	] as readonly DeckSignal[],
	milestones: [
		{
			period: { ms: 'Apr 2026 – kini', en: 'Apr 2026 – present' },
			title: { ms: 'Pembangun Full-Stack Enterprise', en: 'Enterprise Full-Stack Developer' },
			org: 'YHCM Sdn Bhd · Shah Alam',
			note: {
				ms: 'Sistem sektor awam: eMesys, Sutera, ADIMS',
				en: 'Public sector systems: eMesys, Sutera, ADIMS'
			}
		},
		{
			period: { ms: 'Dis 2025 – Mac 2026', en: 'Dec 2025 – Mar 2026' },
			title: { ms: 'Pembangun Web & Sokongan IT', en: 'Web Developer & IT Support' },
			org: 'Nova Bitara Development Sdn Bhd · Sunway',
			note: {
				ms: 'IWA001, Infinity World, platform e-dagang',
				en: 'IWA001, Infinity World, e-commerce platform'
			}
		},
		{
			period: { ms: 'Apr 2025 – Dis 2025', en: 'Apr 2025 – Dec 2025' },
			title: { ms: 'Protégé — Pembangun Aplikasi', en: 'Protégé — Application Developer' },
			org: 'Tenaga Nasional Berhad · UOA Business Park',
			note: {
				ms: 'OnboardX: aplikasi onboarding pekerja (Flutter + Azure)',
				en: 'OnboardX: employee onboarding app (Flutter + Azure)'
			}
		},
		{
			period: { ms: 'Sept 2023 – Feb 2024', en: 'Sep 2023 – Feb 2024' },
			title: { ms: 'Latihan Industri Keselamatan Siber', en: 'Cybersecurity Intern' },
			org: 'TNB Platinum · Bangsar',
			note: {
				ms: 'Pemantauan Splunk SIEM, ujian kerentanan Red/Blue Team',
				en: 'Splunk SIEM monitoring, Red/Blue Team vulnerability testing'
			}
		},
		{
			period: { ms: '2021 – 2024', en: '2021 – 2024' },
			title: { ms: 'Ijazah Sarjana Muda Sains Komputer', en: 'B.Sc. Computer Science' },
			org: 'Universiti Teknologi Malaysia',
			note: { ms: 'Major Keselamatan Rangkaian', en: 'Network Security major' }
		}
	] as readonly DeckMilestone[]
};

export const publicSector = {
	company: 'YHCM Sdn Bhd',
	location: 'Shah Alam',
	period: { ms: 'Apr 2026 – kini', en: 'Apr 2026 – present' } as Bi,
	type: { ms: 'Sepenuh masa · Sektor awam', en: 'Full-time · Public sector' } as Bi,
	role: {
		ms: 'Programmer / Full-Stack Enterprise Programmer',
		en: 'Programmer / Full-Stack Enterprise Programmer'
	} as Bi,
	summary: {
		ms: 'Peranan saya ialah menjaga sistem yang sudah berjalan sambil menambah keupayaan baharu tanpa mengganggu operasi harian. Kerja merangkumi frontend Vue.js 3, backend Laravel Filament, pangkalan data MariaDB/MySQL, kontena Docker dan pentadbiran pelayan Linux.',
		en: 'My role is to keep running systems healthy while adding new capability without disrupting daily operations. The work spans a Vue.js 3 frontend, Laravel Filament backend, MariaDB/MySQL databases, Docker containers and Linux server administration.'
	} as Bi,
	systems: [
		{
			name: 'eMesys',
			note: {
				ms: 'Antara muka utama dibina dengan Vue.js 3; diselenggara dan diperluas secara berterusan.',
				en: 'Primary interface built with Vue.js 3; maintained and extended continuously.'
			} as Bi
		},
		{
			name: 'Sutera',
			note: {
				ms: 'Sistem pengeluaran dalam penyelenggaraan berterusan; MariaDB sebagai pangkalan data.',
				en: 'Production system under continuous maintenance; MariaDB as the database.'
			} as Bi
		},
		{
			name: 'ADIMS',
			note: {
				ms: 'Sistem pengeluaran dalam penyelenggaraan berterusan bersama pasukan dalaman.',
				en: 'Production system under continuous maintenance with the internal team.'
			} as Bi
		}
	],
	responsibilities: {
		ms: [
			'Menyelenggara dan menyokong sistem kritikal sektor awam (eMesys, Sutera, ADIMS)',
			'Membangunkan modul baharu dengan Vue.js 3 (frontend) dan Laravel Filament (backend)',
			'Mengurus serta mengoptimumkan pangkalan data MySQL dan MariaDB untuk beban transaksi harian',
			'Mengendalikan deployment perkhidmatan dalam kontena Docker pada pelayan Linux',
			'Mentadbir pelayan Linux dan Windows: pengerasan keselamatan, pemantauan dan penyelenggaraan',
			'Menguatkuasakan kawalan akses berasaskan peranan (RBAC) dan pematuhan integriti data kerajaan'
		],
		en: [
			'Maintain and support mission-critical public sector systems (eMesys, Sutera, ADIMS)',
			'Build new modules with Vue.js 3 on the frontend and Laravel Filament on the backend',
			'Manage and optimise MySQL and MariaDB databases under daily transactional load',
			'Handle service deployment in Docker containers on Linux servers',
			'Administer Linux and Windows servers: security hardening, monitoring and maintenance',
			'Enforce role-based access control (RBAC) and government data integrity compliance'
		]
	} as BiList,
	architecture: {
		ms: 'Vue.js 3 (Composition API) → Laravel Filament (panel admin & RBAC) → MariaDB/MySQL dengan pengoptimuman query → Docker → pelayan produksi Linux. Pematuhan piawaian data sektor awam.',
		en: 'Vue.js 3 (Composition API) → Laravel Filament (admin panel & RBAC) → MariaDB/MySQL with query optimisation → Docker → Linux production server. Public sector data standards compliance.'
	} as Bi,
	stack: [
		'Vue.js 3',
		'Laravel Filament',
		'MariaDB',
		'MySQL',
		'Docker',
		'Linux',
		'Windows Server',
		'RBAC'
	]
};

export interface DeckCareer {
	readonly key: 'nova' | 'tnb_protege' | 'tnb_cyber';
	readonly icon: string;
	readonly company: string;
	readonly location: string;
	readonly period: Bi;
	readonly type: Bi;
	readonly focus: Bi;
	readonly architecture: Bi;
	readonly tags: readonly string[];
}

export const careers: readonly DeckCareer[] = [
	{
		key: 'nova',
		icon: '💻',
		company: 'Nova Bitara Development Sdn Bhd',
		location: 'Sunway',
		period: { ms: 'Dis 2025 – Mac 2026', en: 'Dec 2025 – Mar 2026' },
		type: { ms: 'Kontrak', en: 'Contract' },
		focus: {
			ms: 'Tiga projek pengeluaran serentak: sistem pinjaman bercagar, portal korporat tiga bahasa dan platform e-dagang — termasuk pengurusan domain, DNS dan deployment.',
			en: 'Three production projects in parallel: a collateralised loan system, a three-language corporate portal and an e-commerce platform — including domain, DNS and deployment management.'
		},
		architecture: {
			ms: 'SvelteKit + TypeScript + Supabase (RLS, JWT) → Vercel Edge. Laravel + MySQL → DirectAdmin. Redis caching → Resend e-mel API. Pengurusan DNS domain tersuai.',
			en: 'SvelteKit + TypeScript + Supabase (RLS, JWT) → Vercel Edge. Laravel + MySQL → DirectAdmin. Redis caching → Resend email API. Custom domain DNS management.'
		},
		tags: ['SvelteKit', 'Supabase', 'Laravel', 'Redis', 'Vercel', 'Cloudflare', 'DirectAdmin']
	},
	{
		key: 'tnb_protege',
		icon: '⚡',
		company: 'Tenaga Nasional Berhad (TNB)',
		location: 'UOA Business Park, Shah Alam',
		period: { ms: 'Apr 2025 – Dis 2025', en: 'Apr 2025 – Dec 2025' },
		type: { ms: 'Protégé', en: 'Protégé' },
		focus: {
			ms: 'Membina OnboardX dari awal: aplikasi onboarding pekerja merentas web dan mudah alih, dengan seni bina berbilang pangkalan data dan pelayan Azure.',
			en: 'Built OnboardX from scratch: an employee onboarding app across web and mobile, with a multi-database architecture and an Azure server.'
		},
		architecture: {
			ms: 'Flutter (Dart) merentas platform → Firebase Realtime DB + MongoDB + Supabase + MySQL → pelayan Ubuntu Microsoft Azure → penerokaan Jenkins CI/CD dan Kubernetes. Reka bentuk Figma sebelum pelaksanaan.',
			en: 'Cross-platform Flutter (Dart) → Firebase Realtime DB + MongoDB + Supabase + MySQL → Microsoft Azure Ubuntu server → Jenkins CI/CD and Kubernetes exploration. Figma design before implementation.'
		},
		tags: ['Flutter', 'Dart', 'Firebase', 'MongoDB', 'Supabase', 'MySQL', 'Azure', 'Figma']
	},
	{
		key: 'tnb_cyber',
		icon: '🛡️',
		company: 'Tenaga Nasional Berhad (TNB) Platinum',
		location: 'Bangsar',
		period: { ms: 'Sept 2023 – Feb 2024', en: 'Sep 2023 – Feb 2024' },
		type: { ms: 'Latihan industri', en: 'Internship' },
		focus: {
			ms: 'Pemantauan keselamatan masa nyata melalui Splunk SIEM, analisis anomali trafik rangkaian, dan ujian kerentanan bersama pasukan Red dan Blue Team dalam persekitaran SOC.',
			en: 'Real-time security monitoring through Splunk SIEM, network traffic anomaly analysis, and vulnerability testing with the Red and Blue teams inside a SOC environment.'
		},
		architecture: {
			ms: 'Splunk SIEM: pengambilan log, pembinaan papan pemuka, pengesanan anomali. Vulhub: persekitaran Docker untuk pengeluaran semula CVE. Red Team: simulasi serangan. Blue Team: pengerasan pertahanan dan tindak balas insiden.',
			en: 'Splunk SIEM: log ingestion, dashboard building, anomaly detection. Vulhub: Docker environment for CVE reproduction. Red Team: attack simulation. Blue Team: defence hardening and incident response.'
		},
		tags: ['Splunk SIEM', 'Wireshark', 'Vulhub', 'Red Team', 'Blue Team', 'CVE Analysis']
	}
];

export interface DeckFlowStep {
	readonly icon: string;
	readonly label: Bi;
	readonly detail: Bi;
}

export interface DeckProject {
	readonly key: 'iwa001' | 'infinity' | 'ecommerce' | 'onboardx' | 'fyp';
	readonly icon: string;
	readonly title: Bi;
	readonly subtitle: Bi;
	readonly meta: Bi;
	readonly role: Bi;
	readonly tags: readonly string[];
	readonly flow: readonly DeckFlowStep[];
	readonly architecture: Bi;
	readonly security: Bi;
	readonly outcome: Bi;
	readonly docHref?: string;
	readonly docLabel?: Bi;
}

export const projects: readonly DeckProject[] = [
	{
		key: 'iwa001',
		icon: '🏦',
		title: { ms: 'Sistem Pinjaman Bercagar (IWA001)', en: 'Collateralised Loan System (IWA001)' },
		subtitle: {
			ms: 'Platform pengurusan pinjaman bercagar',
			en: 'Collateralised loan management platform'
		},
		meta: {
			ms: 'Sistem pinjaman bercagar · Pengeluaran',
			en: 'Collateralised loan system · Production'
		},
		role: {
			ms: 'Pembangun utama — 17 halaman termasuk panel admin, borang 5 langkah dan penjanaan PDF.',
			en: 'Primary developer — 17 pages including the admin panel, 5-step form and PDF generation.'
		},
		tags: ['SvelteKit', 'TypeScript', 'Supabase', 'PostgreSQL', 'Row Level Security', 'Vercel'],
		flow: [
			{
				icon: '🔑',
				label: { ms: 'Daftar & log masuk', en: 'Register & sign in' },
				detail: {
					ms: 'Supabase Auth (JWT) mengesahkan identiti dan menetapkan peranan: Pemohon, Pegawai atau Admin.',
					en: 'Supabase Auth (JWT) verifies identity and assigns a role: Applicant, Officer or Admin.'
				}
			},
			{
				icon: '📝',
				label: { ms: 'Borang 5 langkah', en: 'Five-step form' },
				detail: {
					ms: 'Pemohon mengisi maklumat peribadi, aset cagaran, jumlah pinjaman, tempoh dan penjamin.',
					en: 'The applicant completes personal details, collateral assets, loan amount, tenure and guarantor.'
				}
			},
			{
				icon: '📄',
				label: { ms: 'Muat naik dokumen', en: 'Document upload' },
				detail: {
					ms: 'IC, slip gaji dan geran tanah dimuat naik ke Supabase Storage dengan nama fail unik.',
					en: 'IC, payslips and land grants upload to Supabase Storage with unique file names.'
				}
			},
			{
				icon: '👔',
				label: { ms: 'Semakan pegawai', en: 'Officer review' },
				detail: {
					ms: 'Pegawai mengesahkan dokumen dan mengemas kini status permohonan.',
					en: 'The officer verifies documents and updates the application status.'
				}
			},
			{
				icon: '🏛️',
				label: { ms: 'Kelulusan admin', en: 'Admin approval' },
				detail: {
					ms: 'Admin meluluskan atau menolak dengan sebab; setiap tindakan direkod dalam audit trail.',
					en: 'Admin approves or rejects with a reason; every action is written to an audit trail.'
				}
			},
			{
				icon: '📧',
				label: { ms: 'Notifikasi & PDF', en: 'Notification & PDF' },
				detail: {
					ms: 'E-mel automatik dihantar kepada pemohon dan surat kelulusan PDF dijana.',
					en: 'Automatic email goes to the applicant and the approval letter PDF is generated.'
				}
			}
		],
		architecture: {
			ms: 'SvelteKit (SSR/CSR) → Supabase PostgreSQL dengan Row Level Security → deployment Vercel Edge → domain tersuai. 17 halaman: papan pemuka, borang pinjaman 5 langkah, muat naik dokumen, semakan pegawai, panel admin, pengurusan pengguna dan penjanaan laporan PDF.',
			en: 'SvelteKit (SSR/CSR) → Supabase PostgreSQL with Row Level Security → Vercel Edge deployment → custom domain. 17 pages: dashboard, 5-step loan form, document upload, officer review, admin panel, user management and PDF report generation.'
		},
		security: {
			ms: 'RLS di peringkat pangkalan data menyaring setiap query mengikut user_id; JWT disahkan pada setiap permintaan; tiga peranan dengan akses berbeza; audit trail untuk semua transaksi; HTTPS diwajibkan melalui Vercel.',
			en: 'Database-level RLS filters every query by user_id; the JWT is validated on each request; three roles with distinct access; an audit trail for all transactions; HTTPS enforced through Vercel.'
		},
		outcome: {
			ms: 'Sistem pengeluaran yang mengendalikan aliran kerja pinjaman bercagar: permohonan, semakan, kelulusan dan surat kelulusan PDF — menggantikan proses kertas manual.',
			en: 'A production system handling the collateralised loan workflow: application, review, approval and PDF approval letter — replacing a manual paper process.'
		},
		docHref: '/docs/iwa001-case-study.pdf',
		docLabel: { ms: 'Kajian kes PDF', en: 'PDF case study' }
	},
	{
		key: 'infinity',
		icon: '🌐',
		title: { ms: 'Laman Korporat Infinity World', en: 'Infinity World Corporate Site' },
		subtitle: {
			ms: 'Portal korporat tiga bahasa + blog pelanggan',
			en: 'Three-language corporate portal + subscriber blog'
		},
		meta: { ms: 'Portal korporat · Pengeluaran', en: 'Corporate portal · Production' },
		role: {
			ms: 'Pembangun — sistem i18n tiga bahasa, blog pelanggan berasaskan Redis dan penghantaran e-mel Resend.',
			en: 'Developer — three-language i18n system, Redis-backed subscriber blog and Resend email delivery.'
		},
		tags: ['SvelteKit', 'TypeScript', 'i18n', 'Redis Upstash', 'Resend API', 'Vercel Edge'],
		flow: [
			{
				icon: '🌍',
				label: { ms: 'Pelawat tiba', en: 'Visitor arrives' },
				detail: {
					ms: 'Vercel Edge menyajikan halaman dari nod terdekat dengan HTML yang dijana pelayan.',
					en: 'Vercel Edge serves pages from the nearest node with server-rendered HTML.'
				}
			},
			{
				icon: '🏠',
				label: { ms: 'SSR & i18n', en: 'SSR & i18n' },
				detail: {
					ms: 'Kandungan bertukar antara BM, EN dan ZH melalui store Svelte tanpa muat semula halaman.',
					en: 'Content switches between BM, EN and ZH through a Svelte store without a page reload.'
				}
			},
			{
				icon: '📰',
				label: { ms: 'Blog korporat', en: 'Corporate blog' },
				detail: {
					ms: 'Artikel dalam tiga bahasa disimpan sebagai kandungan berstruktur dan dipaparkan secara dinamik.',
					en: 'Articles in three languages are stored as structured content and rendered dynamically.'
				}
			},
			{
				icon: '⚡',
				label: { ms: 'Langganan & Redis', en: 'Subscription & Redis' },
				detail: {
					ms: 'E-mel pelanggan disimpan di Redis Upstash dengan TTL dan had kadar untuk mengekang penyalahgunaan borang.',
					en: 'Subscriber emails are stored in Redis Upstash with TTL and rate limiting to curb form abuse.'
				}
			},
			{
				icon: '📨',
				label: { ms: 'Penghantaran e-mel', en: 'Email delivery' },
				detail: {
					ms: 'Artikel baharu mencetuskan penghantaran e-mel melalui Resend API menggunakan templat HTML responsif.',
					en: 'A new article triggers email delivery through the Resend API using responsive HTML templates.'
				}
			}
		],
		architecture: {
			ms: 'SvelteKit SSR → Vercel Edge Functions → Redis Upstash (cache pelanggan + had kadar) → Resend API (e-mel transaksional) → pengurusan DNS domain. i18n berasaskan store dengan tiga locale (ms/en/zh).',
			en: 'SvelteKit SSR → Vercel Edge Functions → Redis Upstash (subscriber cache + rate limiting) → Resend API (transactional email) → domain DNS management. Store-based i18n with three locales (ms/en/zh).'
		},
		security: {
			ms: 'Kunci API Resend disimpan sebagai pemboleh ubah persekitaran pelayan sahaja; input borang disanitasi untuk menghalang XSS; had kadar pada endpoint API; TTL Redis meluputkan data; HTTPS melalui Vercel.',
			en: 'The Resend API key is kept as a server-side environment variable only; form input is sanitised against XSS; the API endpoint is rate limited; Redis TTL expires data; HTTPS through Vercel.'
		},
		outcome: {
			ms: 'Portal korporat tiga bahasa dengan blog pelanggan dan notifikasi e-mel automatik, disampaikan dalam tempoh kontrak yang sama dengan dua projek lain.',
			en: 'A three-language corporate portal with a subscriber blog and automated email notification, delivered within the same contract term as two other projects.'
		},
		docHref: '/docs/infinity-landing-case-study.pdf',
		docLabel: { ms: 'Kajian kes PDF', en: 'PDF case study' }
	},
	{
		key: 'ecommerce',
		icon: '🛒',
		title: { ms: 'Platform E-Dagang', en: 'E-Commerce Platform' },
		subtitle: {
			ms: 'Kedai dalam talian penuh untuk produk syarikat',
			en: 'Full online store for company products'
		},
		meta: { ms: 'Platform e-dagang · Pengeluaran', en: 'E-commerce platform · Production' },
		role: {
			ms: 'Pembangun — platform e-dagang Laravel, integrasi Cloudflare dan hosting DirectAdmin.',
			en: 'Developer — Laravel e-commerce platform, Cloudflare integration and DirectAdmin hosting.'
		},
		tags: ['Laravel', 'PHP 8', 'MySQL', 'Cloudflare', 'DirectAdmin', 'Sanctum'],
		flow: [
			{
				icon: '🏪',
				label: { ms: 'Katalog produk', en: 'Product catalogue' },
				detail: {
					ms: 'Katalog dengan harga dan stok; aset statik disajikan melalui CDN Cloudflare.',
					en: 'Catalogue with pricing and stock; static assets served through the Cloudflare CDN.'
				}
			},
			{
				icon: '🛒',
				label: { ms: 'Troli sesi', en: 'Session cart' },
				detail: {
					ms: 'Item masuk troli sesi; kuantiti, variasi dan harga dikira semula secara langsung.',
					en: 'Items enter the session cart; quantity, variation and price recalculate live.'
				}
			},
			{
				icon: '💳',
				label: { ms: 'Checkout', en: 'Checkout' },
				detail: {
					ms: 'Alamat penghantaran dan kaedah bayar divalidasi di klien dan pelayan; token CSRF melindungi setiap permintaan.',
					en: 'Shipping address and payment method validate on client and server; a CSRF token protects each request.'
				}
			},
			{
				icon: '📋',
				label: { ms: 'Rekod pesanan', en: 'Order record' },
				detail: {
					ms: 'Laravel mencipta rekod pesanan di MySQL, mengurangkan stok dan menghantar resit e-mel.',
					en: 'Laravel creates the order record in MySQL, decrements stock and sends the email receipt.'
				}
			},
			{
				icon: '👨‍💼',
				label: { ms: 'Papan pemuka admin', en: 'Admin dashboard' },
				detail: {
					ms: 'Admin menyenaraikan pesanan masuk, mengemas kini status dan mengeksport laporan CSV.',
					en: 'Admin lists incoming orders, updates status and exports CSV reports.'
				}
			},
			{
				icon: '🛡️',
				label: { ms: 'Perlindungan Cloudflare', en: 'Cloudflare protection' },
				detail: {
					ms: 'WAF dan perlindungan DDoS menapis trafik berbahaya; cache CDN mengurangkan beban asal.',
					en: 'WAF and DDoS protection filter malicious traffic; CDN caching reduces origin load.'
				}
			}
		],
		architecture: {
			ms: 'Laravel MVC (PHP 8) → MySQL → hosting DirectAdmin cPanel → domain → Cloudflare (CDN, DNS, WAF). Modul: katalog produk, troli sesi, checkout, pengurusan pesanan, pengesahan pengguna, papan pemuka admin dan laporan jualan.',
			en: 'Laravel MVC (PHP 8) → MySQL → DirectAdmin cPanel hosting → domain → Cloudflare (CDN, DNS, WAF). Modules: product catalogue, session cart, checkout, order management, user authentication, admin dashboard and sales reports.'
		},
		security: {
			ms: 'Pengesahan Laravel Sanctum dengan perlindungan CSRF terbina; WAF dan perlindungan DDoS Cloudflare; HTTPS/TLS diwajibkan; prepared statement MySQL menghalang suntikan SQL; pengesahan input pada semua borang; kata laluan di-hash dengan bcrypt.',
			en: 'Laravel Sanctum authentication with built-in CSRF protection; Cloudflare WAF and DDoS protection; HTTPS/TLS enforced; MySQL prepared statements prevent SQL injection; input validation on every form; passwords hashed with bcrypt.'
		},
		outcome: {
			ms: 'Platform e-dagang penuh untuk jualan produk syarikat: katalog, pesanan, checkout dan laporan pentadbiran dalam satu sistem.',
			en: 'A complete e-commerce platform for company product sales: catalogue, orders, checkout and administrative reporting in one system.'
		}
	},
	{
		key: 'onboardx',
		icon: '⚡',
		title: {
			ms: 'OnboardX — Aplikasi Onboarding Pekerja',
			en: 'OnboardX — Employee Onboarding App'
		},
		subtitle: {
			ms: 'Aplikasi perusahaan TNB merentas web dan mudah alih',
			en: 'TNB enterprise app across web and mobile'
		},
		meta: { ms: 'Aplikasi perusahaan TNB · Protégé', en: 'TNB enterprise app · Protégé' },
		role: {
			ms: 'Pembangun aplikasi — Flutter, seni bina berbilang pangkalan data, pelayan Azure dan penerokaan CI/CD.',
			en: 'App developer — Flutter, multi-database architecture, Azure server and CI/CD exploration.'
		},
		tags: ['Flutter', 'Dart', 'Firebase', 'MongoDB', 'Supabase', 'MySQL', 'Azure', 'Figma'],
		flow: [
			{
				icon: '👤',
				label: { ms: 'Jemputan pekerja', en: 'Employee invitation' },
				detail: {
					ms: 'Pekerja baharu menerima jemputan HR dan mendaftar akaun dengan e-mel rasmi TNB.',
					en: 'A new employee receives the HR invitation and registers an account with an official TNB email.'
				}
			},
			{
				icon: '📋',
				label: { ms: 'Profil pekerja', en: 'Employee profile' },
				detail: {
					ms: 'Maklumat peribadi, kemahiran dan pilihan jabatan disimpan ke Supabase (berstruktur) dan MongoDB (dokumen).',
					en: 'Personal details, skills and department preferences are stored in Supabase (structured) and MongoDB (documents).'
				}
			},
			{
				icon: '📄',
				label: { ms: 'Muat naik dokumen', en: 'Document upload' },
				detail: {
					ms: 'IC, sijil dan resume dimuat naik ke Firebase Storage; status disegerakkan melalui Realtime Database.',
					en: 'IC, certificates and resumes upload to Firebase Storage; status syncs through the Realtime Database.'
				}
			},
			{
				icon: '🏢',
				label: { ms: 'Semakan HR', en: 'HR review' },
				detail: {
					ms: 'Papan pemuka HR menyenaraikan pekerja dalam proses dengan penapis status, jabatan dan tarikh.',
					en: 'The HR dashboard lists employees in progress with status, department and date filters.'
				}
			},
			{
				icon: '📚',
				label: { ms: 'Modul latihan', en: 'Training modules' },
				detail: {
					ms: 'Latihan wajib diberikan mengikut jabatan dan kemajuan dijejaki dalam aplikasi.',
					en: 'Mandatory training is assigned per department and progress is tracked in the app.'
				}
			},
			{
				icon: '☁️',
				label: { ms: 'Azure & CI/CD', en: 'Azure & CI/CD' },
				detail: {
					ms: 'Aplikasi dihoskan pada pelayan Ubuntu Azure; Jenkins dan Kubernetes diteroka untuk binaan automatik dan penskalaan.',
					en: 'The app is hosted on an Azure Ubuntu server; Jenkins and Kubernetes were explored for automated builds and scaling.'
				}
			}
		],
		architecture: {
			ms: 'Aplikasi Flutter (web + mudah alih) → Firebase Realtime DB, MongoDB, Supabase PostgreSQL dan MySQL (sistem legasi) → pelayan Ubuntu Microsoft Azure → penerokaan Jenkins CI/CD dan Kubernetes. Reka bentuk Figma sebelum pelaksanaan.',
			en: 'Flutter app (web + mobile) → Firebase Realtime DB, MongoDB, Supabase PostgreSQL and MySQL (legacy system) → Microsoft Azure Ubuntu server → Jenkins CI/CD and Kubernetes exploration. Figma design before implementation.'
		},
		security: {
			ms: 'Firebase Auth mengesahkan pekerja TNB; peranan Pekerja/HR/Admin dengan tahap akses berbeza; RLS Supabase mengasingkan data setiap pekerja; Azure Network Security Group sebagai lapisan firewall.',
			en: 'Firebase Auth authenticates TNB employees; Employee/HR/Admin roles carry different access levels; Supabase RLS isolates each employee record; an Azure Network Security Group acts as a firewall layer.'
		},
		outcome: {
			ms: 'Aliran onboarding pekerja baharu dipindahkan dari proses manual berasaskan dokumen kepada satu sistem digital dengan papan pemuka HR berpusat.',
			en: 'New-employee onboarding moved from a document-based manual process to a single digital system with a centralised HR dashboard.'
		}
	},
	{
		key: 'fyp',
		icon: '🗺️',
		title: { ms: 'Sistem Pelaporan Geospatial (UTM)', en: 'Geospatial Reporting System (UTM)' },
		subtitle: {
			ms: 'Projek tahun akhir B.Sc. Sains Komputer',
			en: 'B.Sc. Computer Science final year project'
		},
		meta: { ms: 'Projek tahun akhir UTM · Geospatial', en: 'UTM final year project · Geospatial' },
		role: {
			ms: 'Pembangun tunggal — reka bentuk Figma hingga pelaksanaan SvelteKit + Supabase.',
			en: 'Sole developer — Figma design through to SvelteKit + Supabase implementation.'
		},
		tags: ['SvelteKit', 'Supabase', 'PostgreSQL', 'Google Maps API', 'Tailwind CSS', 'Figma'],
		flow: [
			{
				icon: '🔐',
				label: { ms: 'Log masuk', en: 'Sign in' },
				detail: {
					ms: 'Pengesahan e-mel UTM melalui Supabase Auth dengan pengesahan OTP.',
					en: 'UTM email authentication through Supabase Auth with OTP verification.'
				}
			},
			{
				icon: '📝',
				label: { ms: 'Laporan baharu', en: 'New report' },
				detail: {
					ms: 'Borang laporan (jenis isu, penerangan, foto) dengan lokasi GPS automatik melalui Geolocation API.',
					en: 'A report form (issue type, description, photo) with automatic GPS location from the Geolocation API.'
				}
			},
			{
				icon: '📍',
				label: { ms: 'Simpan & asingkan', en: 'Store & isolate' },
				detail: {
					ms: 'Laporan disimpan ke Supabase PostgreSQL bersama koordinat; RLS memastikan pengguna hanya melihat laporan sendiri.',
					en: 'Reports save to Supabase PostgreSQL with coordinates; RLS keeps each user to their own reports.'
				}
			},
			{
				icon: '🗺️',
				label: { ms: 'Peta interaktif', en: 'Interactive map' },
				detail: {
					ms: 'Google Maps JavaScript API memaparkan marker dengan pengelompokan dan penapis kategori.',
					en: 'The Google Maps JavaScript API renders markers with clustering and category filters.'
				}
			},
			{
				icon: '👨‍💼',
				label: { ms: 'Triage admin', en: 'Admin triage' },
				detail: {
					ms: 'Admin menyemak semua laporan, menapis mengikut status dan tarikh, dan mengemas kini status.',
					en: 'Admin reviews all reports, filters by status and date, and updates status.'
				}
			},
			{
				icon: '📊',
				label: { ms: 'Analitik', en: 'Analytics' },
				detail: {
					ms: 'Peta haba, trend bulanan dan eksport CSV untuk analisis lanjut.',
					en: 'Heatmap, monthly trends and CSV export for further analysis.'
				}
			}
		],
		architecture: {
			ms: 'SvelteKit SSR → Supabase PostgreSQL + RLS → Google Maps JavaScript API (pengelompokan marker, geofencing, peta haba) → deployment Vercel. Reka bentuk Figma → pelaksanaan SvelteKit + Tailwind CSS.',
			en: 'SvelteKit SSR → Supabase PostgreSQL + RLS → Google Maps JavaScript API (marker clustering, geofencing, heatmap) → Vercel deployment. Figma design → SvelteKit + Tailwind CSS implementation.'
		},
		security: {
			ms: 'Pengesahan e-mel dengan OTP; RLS mengasingkan laporan antara pengguna sementara admin melihat semua; kunci API Google Maps dihadkan kepada domain rujukan; pengesahan input dan sanitasi muat naik fail; HTTPS melalui Vercel.',
			en: 'Email authentication with OTP; RLS isolates reports between users while admin sees all; the Google Maps API key is restricted to the referring domain; input validation and upload sanitisation; HTTPS through Vercel.'
		},
		outcome: {
			ms: 'Sistem pelaporan berpusat dengan peta interaktif menggantikan aliran laporan manual; dinilai cemerlang oleh panel penyelia UTM.',
			en: 'A centralised reporting system with an interactive map replacing a manual reporting flow; graded excellent by the UTM supervisory panel.'
		}
	}
];
