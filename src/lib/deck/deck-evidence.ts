/**
 * Synaptic Pitch Deck — architecture, competency, education and contact evidence.
 * Owner: adaptive-03-executor. Scope: Presentation.svelte only.
 */

import type { Bi, BiList } from './deck-data';

export interface DeckPattern {
	readonly icon: string;
	readonly title: Bi;
	readonly body: Bi;
	readonly evidence: string;
}

export const architecturePatterns: readonly DeckPattern[] = [
	{
		icon: '🔐',
		title: { ms: 'Identiti & kebenaran', en: 'Identity & authorisation' },
		body: {
			ms: 'Pengesahan di peringkat platform (Supabase Auth/JWT, Firebase Auth, Laravel Sanctum) dan kebenaran di peringkat data melalui Row Level Security atau RBAC — bukan semakan di UI sahaja.',
			en: 'Authentication at platform level (Supabase Auth/JWT, Firebase Auth, Laravel Sanctum) and authorisation at data level through Row Level Security or RBAC — not UI-only checks.'
		},
		evidence: 'IWA001 · OnboardX · UTM FYP · YHCM'
	},
	{
		icon: '🧱',
		title: { ms: 'Pengasingan data', en: 'Data isolation' },
		body: {
			ms: 'Setiap query disaring mengikut pemilik data di peringkat pangkalan data, dan panel pentadbir menggunakan peranan berasingan daripada pengguna biasa.',
			en: 'Every query is filtered by data owner at the database layer, and administrative panels run on roles separate from ordinary users.'
		},
		evidence: 'IWA001 · UTM FYP · OnboardX'
	},
	{
		icon: '🧭',
		title: { ms: 'Deployment berlapis', en: 'Layered deployment' },
		body: {
			ms: 'Setiap jenis beban kerja mendapat host yang sesuai: Vercel Edge untuk aplikasi SvelteKit, hosting DirectAdmin untuk Laravel, pelayan Ubuntu Azure untuk aplikasi perusahaan, Docker untuk perkhidmatan dalaman.',
			en: 'Each workload type gets a fitting host: Vercel Edge for SvelteKit apps, DirectAdmin hosting for Laravel, Azure Ubuntu servers for enterprise apps, Docker for internal services.'
		},
		evidence: 'IWA001 · Infinity World · E-Dagang · OnboardX · YHCM'
	},
	{
		icon: '📡',
		title: { ms: 'Perimeter & pemantauan', en: 'Perimeter & monitoring' },
		body: {
			ms: 'Cloudflare WAF/DDoS di perimeter, Splunk SIEM dan Wireshark untuk pemantauan serta analisis trafik, Vulhub untuk pengeluaran semula CVE dalam makmal.',
			en: 'Cloudflare WAF/DDoS at the perimeter, Splunk SIEM and Wireshark for monitoring and traffic analysis, Vulhub for CVE reproduction in a lab.'
		},
		evidence: 'E-Dagang · TNB Platinum SOC · UTM'
	}
];

export const shipped: BiList = {
	ms: [
		'Sistem pinjaman bercagar IWA001 (17 halaman, panel admin, PDF)',
		'Portal korporat Infinity World (3 bahasa + blog pelanggan)',
		'Platform e-dagang Laravel dengan Cloudflare',
		'Aplikasi onboarding OnboardX (Flutter)',
		'Sistem pelaporan geospatial UTM',
		'Penyelenggaraan sistem sektor awam eMesys, Sutera, ADIMS'
	],
	en: [
		'IWA001 collateralised loan system (17 pages, admin panel, PDF)',
		'Infinity World corporate portal (3 languages + subscriber blog)',
		'Laravel e-commerce platform with Cloudflare',
		'OnboardX onboarding app (Flutter)',
		'UTM geospatial reporting system',
		'Maintenance of public sector systems eMesys, Sutera, ADIMS'
	]
};

export const exploring: BiList = {
	ms: [
		'Jenkins CI/CD — konfigurasi saluran binaan, belum dioperasikan sepenuhnya',
		'Kubernetes — orkestrasi kontena dalam persekitaran pembelajaran',
		'React.js — projek peribadi, bukan pengeluaran',
		'Automasi Python & computer vision — eksperimen',
		'Alat LLM/ejen — digunakan sebagai bantuan penulisan kod, bukan komponen sistem pelanggan'
	],
	en: [
		'Jenkins CI/CD — build pipeline configuration, not fully operated',
		'Kubernetes — container orchestration in a learning environment',
		'React.js — personal projects, not production',
		'Python automation & computer vision — experiments',
		'LLM/agent tooling — used as coding assistance, not a customer system component'
	]
};

export const accuracyNote: Bi = {
	ms: 'Nota ketepatan: saya tidak menyimpan telemetri uptime atau metrik prestasi pengeluaran untuk sistem ini, jadi tiada peratusan penjimatan masa atau kependaman dipetik di sini. Keupayaan Jenkins, Kubernetes, React dan alat LLM masih dalam peringkat penerokaan.',
	en: 'Accuracy note: I do not hold uptime telemetry or production performance metrics for these systems, so no time-saving or latency percentages are quoted here. Jenkins, Kubernetes, React and LLM tooling remain exploration.'
};

export type Tier = 'core' | 'working' | 'exploring';

export const tierLabels: Record<Tier, Bi> = {
	core: {
		ms: 'Teras — digunakan dalam sistem pengeluaran',
		en: 'Core — used in production systems'
	},
	working: {
		ms: 'Berfungsi — digunakan dengan rujukan atau penyeliaan',
		en: 'Working — used with reference or supervision'
	},
	exploring: {
		ms: 'Penerokaan — pembelajaran dan eksperimen',
		en: 'Exploring — learning and experiments'
	}
};

export interface DeckSkill {
	readonly name: string;
	readonly tier: Tier;
	readonly what: Bi;
	readonly where: readonly string[];
}

export const skillGroups: readonly { readonly title: Bi; readonly items: readonly DeckSkill[] }[] =
	[
		{
			title: { ms: 'Frontend & mudah alih', en: 'Frontend & mobile' },
			items: [
				{
					name: 'SvelteKit / Svelte 5',
					tier: 'core',
					what: {
						ms: 'Rangka kerja utama untuk sistem pengeluaran: routing, SSR/CSR, store dan runes.',
						en: 'Primary framework for production systems: routing, SSR/CSR, stores and runes.'
					},
					where: ['IWA001', 'Infinity World', 'UTM FYP']
				},
				{
					name: 'Vue.js 3',
					tier: 'core',
					what: {
						ms: 'Antara muka sistem sektor awam menggunakan Composition API.',
						en: 'Public sector system interfaces using the Composition API.'
					},
					where: ['eMesys (YHCM)']
				},
				{
					name: 'TypeScript / JavaScript',
					tier: 'core',
					what: {
						ms: 'Bahasa harian untuk logik aplikasi dan integrasi API.',
						en: 'Daily language for application logic and API integration.'
					},
					where: ['IWA001', 'Infinity World', 'UTM FYP']
				},
				{
					name: 'HTML / CSS / Tailwind',
					tier: 'core',
					what: {
						ms: 'Susun atur responsif, sistem reka bentuk dan aksesibiliti.',
						en: 'Responsive layout, design systems and accessibility.'
					},
					where: ['Semua projek web', 'All web projects']
				},
				{
					name: 'Flutter (Dart)',
					tier: 'core',
					what: {
						ms: 'Aplikasi merentas platform untuk web dan mudah alih.',
						en: 'Cross-platform application for web and mobile.'
					},
					where: ['OnboardX']
				},
				{
					name: 'React.js',
					tier: 'exploring',
					what: {
						ms: 'Pembelajaran melalui projek peribadi; belum digunakan dalam pengeluaran.',
						en: 'Learning through personal projects; not yet used in production.'
					},
					where: ['Projek peribadi / Personal projects']
				}
			]
		},
		{
			title: { ms: 'Backend & data', en: 'Backend & data' },
			items: [
				{
					name: 'Laravel (PHP)',
					tier: 'core',
					what: {
						ms: 'Backend MVC, Filament admin panel, Sanctum dan migrasi pangkalan data.',
						en: 'MVC backend, Filament admin panel, Sanctum and database migrations.'
					},
					where: ['E-Dagang', 'eMesys / Sutera / ADIMS']
				},
				{
					name: 'Supabase',
					tier: 'core',
					what: {
						ms: 'Auth, Postgres, Row Level Security dan Storage untuk aplikasi baharu.',
						en: 'Auth, Postgres, Row Level Security and Storage for new applications.'
					},
					where: ['IWA001', 'UTM FYP', 'OnboardX']
				},
				{
					name: 'PostgreSQL',
					tier: 'core',
					what: {
						ms: 'Pangkalan data utama dengan polisi RLS dan fungsi SQL.',
						en: 'Primary database with RLS policies and SQL functions.'
					},
					where: ['IWA001', 'UTM FYP']
				},
				{
					name: 'MySQL / MariaDB',
					tier: 'core',
					what: {
						ms: 'Pangkalan data transaksi harian dan pengoptimuman query.',
						en: 'Daily transactional databases and query optimisation.'
					},
					where: ['eMesys / Sutera / ADIMS', 'E-Dagang', 'OnboardX']
				},
				{
					name: 'MongoDB',
					tier: 'working',
					what: {
						ms: 'Penyimpanan dokumen untuk data separa berstruktur.',
						en: 'Document storage for semi-structured data.'
					},
					where: ['OnboardX']
				},
				{
					name: 'Firebase',
					tier: 'working',
					what: {
						ms: 'Realtime Database, Storage dan Auth untuk aplikasi mudah alih.',
						en: 'Realtime Database, Storage and Auth for the mobile app.'
					},
					where: ['OnboardX']
				},
				{
					name: 'Redis',
					tier: 'working',
					what: {
						ms: 'Cache, TTL dan had kadar pada endpoint API.',
						en: 'Cache, TTL and rate limiting on API endpoints.'
					},
					where: ['Infinity World']
				},
				{
					name: 'Node.js',
					tier: 'working',
					what: {
						ms: 'Skrip pelayan, alat binaan dan endpoint ringan.',
						en: 'Server scripts, build tooling and lightweight endpoints.'
					},
					where: ['Alat projek / Project tooling']
				},
				{
					name: 'C# / .NET',
					tier: 'exploring',
					what: {
						ms: 'Asas akademik melalui kursus pengaturcaraan diploma.',
						en: 'Academic grounding through diploma programming courses.'
					},
					where: ['Kursus UTM / UTM coursework']
				}
			]
		},
		{
			title: { ms: 'Cloud, deployment & alatan', en: 'Cloud, deployment & tooling' },
			items: [
				{
					name: 'Docker',
					tier: 'core',
					what: {
						ms: 'Kontena perkhidmatan dan persekitaran pembangunan yang konsisten.',
						en: 'Service containers and consistent development environments.'
					},
					where: ['YHCM', 'Vulhub lab']
				},
				{
					name: 'Microsoft Azure',
					tier: 'working',
					what: {
						ms: 'Pelayan Ubuntu maya, kumpulan keselamatan rangkaian dan deployment aplikasi.',
						en: 'Virtual Ubuntu servers, network security groups and app deployment.'
					},
					where: ['OnboardX']
				},
				{
					name: 'Vercel',
					tier: 'core',
					what: {
						ms: 'Deployment Edge, domain tersuai dan pemboleh ubah persekitaran.',
						en: 'Edge deployment, custom domains and environment variables.'
					},
					where: ['IWA001', 'Infinity World', 'UTM FYP']
				},
				{
					name: 'Cloudflare',
					tier: 'working',
					what: {
						ms: 'DNS, CDN, WAF dan perlindungan DDoS.',
						en: 'DNS, CDN, WAF and DDoS protection.'
					},
					where: ['E-Dagang', 'Pengurusan domain / Domain management']
				},
				{
					name: 'Git',
					tier: 'core',
					what: {
						ms: 'Kawalan versi, cawangan ciri dan semakan kod.',
						en: 'Version control, feature branches and code review.'
					},
					where: ['Semua projek / All projects']
				},
				{
					name: 'Jenkins / Kubernetes',
					tier: 'exploring',
					what: {
						ms: 'Konfigurasi saluran binaan dan orkestrasi kontena dalam persekitaran pembelajaran.',
						en: 'Build pipeline configuration and container orchestration in a learning environment.'
					},
					where: ['OnboardX (penerokaan / exploration)']
				}
			]
		},
		{
			title: { ms: 'Keselamatan rangkaian', en: 'Network security' },
			items: [
				{
					name: 'Splunk SIEM',
					tier: 'working',
					what: {
						ms: 'Pengambilan log, papan pemuka pemantauan dan pengesanan anomali.',
						en: 'Log ingestion, monitoring dashboards and anomaly detection.'
					},
					where: ['TNB Platinum SOC']
				},
				{
					name: 'Wireshark',
					tier: 'working',
					what: {
						ms: 'Analisis paket dan penyiasatan trafik rangkaian.',
						en: 'Packet analysis and network traffic investigation.'
					},
					where: ['TNB Platinum SOC', 'UTM']
				},
				{
					name: 'Ujian kerentanan (lab)',
					tier: 'working',
					what: {
						ms: 'Pengeluaran semula CVE dengan Vulhub dan simulasi serangan Red Team.',
						en: 'CVE reproduction with Vulhub and Red Team attack simulation.'
					},
					where: ['TNB Platinum SOC']
				},
				{
					name: 'VPN, firewall & troubleshooting',
					tier: 'working',
					what: {
						ms: 'Konfigurasi asas, pengasingan segmen dan diagnostik sambungan.',
						en: 'Basic configuration, segment isolation and connectivity diagnostics.'
					},
					where: ['Latihan industri / Internship', 'UTM']
				},
				{
					name: 'ISO 27001 / NIST',
					tier: 'working',
					what: {
						ms: 'Rangka kerja tadbir urus keselamatan dan penilaian risiko.',
						en: 'Security governance frameworks and risk assessment.'
					},
					where: ['Kursus UTM / UTM coursework']
				},
				{
					name: 'Kali Linux',
					tier: 'working',
					what: {
						ms: 'Persekitaran ujian keselamatan dan alatan rangkaian.',
						en: 'Security testing environment and network tooling.'
					},
					where: ['Makmal UTM / UTM labs']
				}
			]
		},
		{
			title: { ms: 'Reka bentuk & analitik', en: 'Design & analytics' },
			items: [
				{
					name: 'Figma',
					tier: 'working',
					what: {
						ms: 'Wireframe, prototaip dan sistem komponen sebelum pembangunan.',
						en: 'Wireframes, prototypes and component systems before development.'
					},
					where: ['UTM FYP', 'OnboardX']
				},
				{
					name: 'Microsoft Power BI',
					tier: 'working',
					what: {
						ms: 'Papan pemuka data dan visualisasi laporan.',
						en: 'Data dashboards and report visualisation.'
					},
					where: ['Pensijilan / Certification']
				}
			]
		}
	];

export const certifications: readonly string[] = [
	'CCNAv7: Introduction to Networks',
	'CCNAv7: Switching, Routing & Wireless Essentials',
	'IoT Fundamentals: Connecting Things',
	'Network Security (Cisco Networking Academy)',
	'DevNet Associate',
	'Microsoft Power BI Data Analysis',
	'Python for Data Analysis'
];

export const educationExtras = {
	degreeCampus: { ms: 'Kampus Johor Bahru', en: 'Johor Bahru campus' } as Bi,
	degreeCgpa: '3.17',
	diplomaCampus: { ms: 'Kampus Kuala Lumpur', en: 'Kuala Lumpur campus' } as Bi,
	diplomaCgpa: '2.72',
	fypTitle: {
		ms: 'Projek tahun akhir: sistem pelaporan geospatial berasaskan peta',
		en: 'Final year project: map-based geospatial reporting system'
	} as Bi
};

export const contactChannels: readonly {
	readonly label: Bi;
	readonly value: string;
	readonly href: string;
	readonly icon: string;
}[] = [
	{
		label: { ms: 'E-mel', en: 'Email' },
		value: 'muhammed.munir97.mm@gmail.com',
		href: 'mailto:muhammed.munir97.mm@gmail.com',
		icon: '✉️'
	},
	{
		label: { ms: 'Telefon', en: 'Phone' },
		value: '+6013-5636124',
		href: 'tel:+60135636124',
		icon: '📞'
	},
	{
		label: { ms: 'Lokasi', en: 'Location' },
		value: 'Puchong, Selangor',
		href: '',
		icon: '📍'
	}
];

export const downloads: readonly {
	readonly label: Bi;
	readonly href: string;
	readonly note: Bi;
}[] = [
	{
		label: { ms: 'Resume ATS (PDF)', en: 'ATS resume (PDF)' },
		href: '/resume.pdf',
		note: { ms: 'Format satu lajur, boleh dibaca ATS', en: 'Single-column, ATS-readable format' }
	},
	{
		label: { ms: 'Kajian kes IWA001', en: 'IWA001 case study' },
		href: '/docs/iwa001-case-study.pdf',
		note: { ms: 'Sistem pinjaman bercagar', en: 'Collateralised loan system' }
	},
	{
		label: { ms: 'Kajian kes Infinity World', en: 'Infinity World case study' },
		href: '/docs/infinity-landing-case-study.pdf',
		note: { ms: 'Portal korporat tiga bahasa', en: 'Three-language corporate portal' }
	}
];

export const ui = {
	deckLabel: { ms: 'Synaptic Pitch Deck', en: 'Synaptic Pitch Deck' } as Bi,
	dialogTitle: {
		ms: 'Dek pembentangan Muhammed Munir',
		en: 'Muhammed Munir presentation deck'
	} as Bi,
	close: { ms: 'Tutup dek', en: 'Close deck' } as Bi,
	previous: { ms: 'Bab sebelum', en: 'Previous chapter' } as Bi,
	next: { ms: 'Bab seterusnya', en: 'Next chapter' } as Bi,
	chaptersLabel: { ms: 'Bab dek', en: 'Deck chapters' } as Bi,
	progressLabel: { ms: 'Kemajuan dek', en: 'Deck progress' } as Bi,
	pauseMotion: { ms: 'Jeda gerakan', en: 'Pause motion' } as Bi,
	resumeMotion: { ms: 'Sambung gerakan', en: 'Resume motion' } as Bi,
	keyHint: {
		ms: 'Kekunci: ← → tukar bab · Home/End hujung · Esc tutup',
		en: 'Keys: ← → change chapter · Home/End jump · Esc closes'
	} as Bi,
	chapterOf: { ms: 'Bab', en: 'Chapter' } as Bi,
	of: { ms: 'daripada', en: 'of' } as Bi,
	detailsLabel: { ms: 'Butiran teknikal', en: 'Technical detail' } as Bi,
	systemsLabel: { ms: 'Sistem dalam penyelenggaraan', en: 'Systems under maintenance' } as Bi,
	responsibilitiesLabel: { ms: 'Tanggungjawab utama', en: 'Core responsibilities' } as Bi,
	architectureLabel: { ms: 'Seni bina', en: 'Architecture' } as Bi,
	securityLabel: { ms: 'Kawalan keselamatan', en: 'Security controls' } as Bi,
	flowLabel: { ms: 'Aliran sistem', en: 'System flow' } as Bi,
	outcomeLabel: { ms: 'Hasil', en: 'Outcome' } as Bi,
	roleLabel: { ms: 'Peranan saya', en: 'My role' } as Bi,
	stackLabel: { ms: 'Timbunan teknologi', en: 'Technology stack' } as Bi,
	shippedLabel: { ms: 'Dihantar ke pengeluaran', en: 'Shipped to production' } as Bi,
	exploringLabel: { ms: 'Masih penerokaan', en: 'Still exploration' } as Bi,
	patternLabel: { ms: 'Corak', en: 'Pattern' } as Bi,
	evidenceLabel: { ms: 'Bukti', en: 'Evidence' } as Bi,
	certsLabel: { ms: 'Pensijilan', en: 'Certification' } as Bi,
	educationLabel: { ms: 'Pendidikan', en: 'Education' } as Bi,
	downloadsLabel: { ms: 'Muat turun', en: 'Downloads' } as Bi,
	openLink: { ms: 'Buka dalam tab baharu', en: 'Opens in a new tab' } as Bi,
	milestonesLabel: { ms: 'Laluan kerjaya', en: 'Career path' } as Bi,
	skillTiersLabel: { ms: 'Tahap penggunaan', en: 'Usage tiers' } as Bi,
	usageLabel: { ms: 'Digunakan dalam', en: 'Used in' } as Bi
};
