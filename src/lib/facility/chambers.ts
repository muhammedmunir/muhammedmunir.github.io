// Kandungan statik tanpa kebergantungan pada perender atau persekitaran pelayar.
export type ChamberId = 0 | 1 | 2 | 3 | 4 | 5;

export type Localized = { ms: string; en: string };

export interface ChamberDetail {
	id: string;
	title: Localized;
	technology: string;
	body: Localized;
}

export interface ChamberInfo {
	id: ChamberId;
	code: string;
	short: Localized;
	name: Localized;
	subtitle: Localized;
	summary: Localized;
	context: Localized;
	action: Localized;
	details: ChamberDetail[];
	position: readonly [number, number, number];
	cameraPos: readonly [number, number, number];
	cameraLook: readonly [number, number, number];
}

// Sumber utama: static/resume.pdf (dua halaman), dibaca secara tempatan pada 23 Oktober 2026.
// Ruang dan objek ialah metafora persembahan; bukan dakwaan sistem produksi yang berjalan di pelayar.
// Alamat profil mengikut pautan dalam resume.
export const CONTACT: {
	email: string;
	github: string;
	linkedin: string;
	whatsapp: string;
} = {
	email: 'muhammed.munir97.mm@gmail.com',
	github: 'https://github.com/muhammedmunir',
	linkedin: 'https://www.linkedin.com/in/muhammed-munir-bin-mohd-azmi-9b233b271',
	whatsapp: 'https://wa.me/60135636124'
};

// Jawatan, tarikh dan skop diringkaskan daripada halaman pertama resume.
// Status “Present” mengekalkan pernyataan dokumen, bukan pengesahan bebas status pekerjaan.
export const CAREER: {
	organisation: string;
	role: Localized;
	period: string;
	summary: Localized;
}[] = [
	{
		organisation: 'YHCM Sdn Bhd',
		role: {
			ms: 'Programmer / Full-Stack Enterprise Developer',
			en: 'Programmer / Full-Stack Enterprise Developer'
		},
		period: 'Apr 2026 – Present',
		summary: {
			ms: 'Penyelenggaraan eMesys, Sutera dan ADIMS, pembangunan modul web serta pentadbiran pangkalan data, pelayan dan deployment Docker Swarm untuk sistem sektor awam.',
			en: 'Maintenance of eMesys, Sutera and ADIMS, web module development, and database, server and Docker Swarm deployment administration for public-sector systems.'
		}
	},
	{
		organisation: 'Nova Bitara Development Sdn Bhd',
		role: {
			ms: 'Sokongan IT & Pembangun Web',
			en: 'IT Support & Web Developer'
		},
		period: 'Dec 2025 – Mar 2026',
		summary: {
			ms: 'Sokongan IT operasi serta pembangunan sistem pinjaman IWA001, laman korporat Infinity World pelbagai bahasa dan platform e-dagang, termasuk pengurusan deployment dan DNS.',
			en: 'Operational IT support and development of the IWA001 loan system, the multilingual Infinity World corporate site and an e-commerce platform, including deployment and DNS management.'
		}
	},
	{
		organisation: 'Tenaga Nasional Berhad (TNB)',
		role: {
			ms: 'Enterprise Mobility Solutions (Protégé)',
			en: 'Enterprise Mobility Solutions (Protégé)'
		},
		period: 'Apr 2025 – Dec 2025',
		summary: {
			ms: 'Pembangunan Onboardx menggunakan Flutter dan JavaScript, pelbagai pangkalan data, pentadbiran Ubuntu di Azure serta automasi binaan dan penghantaran melalui Jenkins CI/CD. Pengalaman Kubernetes pada peringkat asas.',
			en: 'Onboardx development with Flutter and JavaScript, multiple databases, Ubuntu administration on Azure, and automated build and delivery pipelines with Jenkins CI/CD. Kubernetes experience is basic.'
		}
	},
	{
		organisation: 'Tenaga Nasional Berhad (TNB)',
		role: {
			ms: 'Cyber Security Threat Defense (Internship)',
			en: 'Cyber Security Threat Defense (Internship)'
		},
		period: 'Sept 2023 – Feb 2024',
		summary: {
			ms: 'Pemantauan trafik dan log melalui Splunk SIEM dalam SOC, makmal CVE Vulhub bersama Red Team serta bantuan hardening, audit log dan semakan patch bersama Blue Team.',
			en: 'Traffic and log monitoring with Splunk SIEM in a SOC, Vulhub CVE labs with the Red Team, and assistance with hardening, log audits and patch verification with the Blue Team.'
		}
	},
	{
		organisation: 'Tenaga Nasional Berhad (TNB)',
		role: { ms: 'Information & Communication Technology (Internship)', en: 'Information & Communication Technology (Internship)' },
		period: 'Dec 2019 – Feb 2020',
		summary: {
			ms: 'Pemetaan laluan gentian optik menggunakan Google Earth, pengiraan jarak dan kos melalui Excel serta bantuan ujian redaman isyarat, audit infrastruktur dan penyelenggaraan pencegahan.',
			en: 'Fibre route mapping with Google Earth, distance and deployment cost calculations in Excel, and assistance with signal attenuation tests, infrastructure audits and preventative maintenance.'
		}
	}
];

// Lapisan projek mengikut system-projects.ts; kursus dan pendidikan mengikut Skills.svelte.
export const CHAMBERS: readonly ChamberInfo[] = [
	{
		id: 0,
		code: 'PROFILE-00',
		short: { ms: 'Profil', en: 'Profile' },
		name: { ms: 'Muhammed Munir', en: 'Muhammed Munir' },
		subtitle: {
			ms: 'Profesional IT · Pembangun Full-Stack',
			en: 'IT professional · Full-Stack developer'
		},
		summary: {
			ms: 'Latar belakang rangkaian dan keselamatan, pembangunan aplikasi perusahaan serta projek peribadi penglihatan komputer.',
			en: 'A background spanning networks and security, enterprise application development and personal computer vision projects.'
		},
		context: {
			ms: 'Muhammed Munir Bin Mohd Azmi · Puchong, Selangor',
			en: 'Muhammed Munir Bin Mohd Azmi · Puchong, Selangor'
		},
		action: { ms: 'Kenali latar belakang', en: 'Explore background' },
		details: [
			{
				id: 'it-network',
				title: { ms: 'IT & Rangkaian', en: 'IT & Network' },
				technology: 'UTM / Splunk SIEM',
				body: {
					ms: 'Pendidikan rangkaian dan keselamatan di UTM, dengan pengalaman sokongan IT di Nova Bitara serta pemantauan keselamatan siber di TNB.',
					en: 'Networks and security education at UTM, with IT support experience at Nova Bitara and cybersecurity monitoring at TNB.'
				}
			},
			{
				id: 'full-stack',
				title: { ms: 'Full-Stack', en: 'Full-Stack' },
				technology: 'Vue.js / Laravel / SvelteKit / Flutter',
				body: {
					ms: 'Pengalaman merangkumi sistem sektor awam di YHCM, aplikasi web di Nova Bitara dan pembangunan OnboardX di TNB.',
					en: 'Experience includes public-sector systems at YHCM, web applications at Nova Bitara and OnboardX development at TNB.'
				}
			},
			{
				id: 'computer-vision',
				title: { ms: 'Penglihatan Komputer', en: 'Computer Vision' },
				technology: 'Python / OpenCV / Win32 API',
				body: {
					ms: 'cv_bot ialah projek peribadi automasi desktop yang menggabungkan pengecaman visual dengan kawalan sempadan tetingkap.',
					en: 'cv_bot is a personal desktop automation project combining visual recognition with window-boundary controls.'
				}
			}
		],
		position: [0, 0, 0],
		cameraPos: [9, 6, 13],
		cameraLook: [0, 1.1, 0]
	},
	{
		id: 1,
		code: 'NETWORK-01',
		short: { ms: 'Rangkaian', en: 'Networks' },
		name: { ms: 'Rangkaian & Keselamatan', en: 'Networks & Security' },
		subtitle: {
			ms: 'UTM · Cisco Networking Academy · TNB',
			en: 'UTM · Cisco Networking Academy · TNB'
		},
		summary: {
			ms: 'Asas akademik dalam rangkaian dan keselamatan, kursus CCNAv7 serta pengalaman pemantauan keselamatan siber di TNB.',
			en: 'An academic foundation in networks and security, CCNAv7 coursework and cybersecurity monitoring experience at TNB.'
		},
		context: { ms: 'Pendidikan dan latihan industri', en: 'Education and industry internship' },
		action: { ms: 'Lihat asas teknikal', en: 'View technical background' },
		details: [
			{
				id: 'education',
				title: { ms: 'Pendidikan UTM', en: 'UTM education' },
				technology: 'B.Sc. Computer Science (Networks & Security)',
				body: {
					ms: 'Ijazah Sarjana Muda Sains Komputer di Universiti Teknologi Malaysia, 2021–2024, dengan tumpuan rangkaian dan keselamatan.',
					en: 'Bachelor of Computer Science at Universiti Teknologi Malaysia, 2021–2024, focused on networks and security.'
				}
			},
			{
				id: 'network',
				title: { ms: 'Kursus rangkaian', en: 'Networking courses' },
				technology: 'Cisco Networking Academy / CCNAv7',
				body: {
					ms: 'Kursus CCNAv7 yang disenaraikan ialah Introduction to Networks dan Switching, Routing & Wireless Essentials. Rekod kursus ini bukan bukti pensijilan profesional CCNA.',
					en: 'Listed CCNAv7 courses include Introduction to Networks and Switching, Routing & Wireless Essentials. These course listings do not establish professional CCNA certification.'
				}
			},
			{
				id: 'security',
				title: { ms: 'Pengalaman keselamatan', en: 'Security experience' },
				technology: 'TNB / Splunk SIEM / Vulhub',
				body: {
					ms: 'Latihan industri di TNB melibatkan pemantauan trafik dan log melalui Splunk SIEM serta makmal CVE Vulhub bersama pasukan keselamatan.',
					en: 'The TNB internship involved traffic and log monitoring through Splunk SIEM and Vulhub CVE labs with security teams.'
				}
			}
		],
		position: [0, 0, -28],
		cameraPos: [9, 6, -15],
		cameraLook: [0, 1.1, -28]
	},
	{
		id: 2,
		code: 'SYSTEMS-02',
		short: { ms: 'Full-Stack', en: 'Full-Stack' },
		name: { ms: 'Sistem Full-Stack', en: 'Full-Stack Systems' },
		subtitle: { ms: 'eMesys · YHCM · Nova Bitara', en: 'eMesys · YHCM · Nova Bitara' },
		summary: {
			ms: 'eMesys di YHCM menyokong pengurusan aset dan logistik sektor awam. Skop kerjaya turut merangkumi modul web dan pentadbiran pelayan di YHCM, serta sokongan IT, sistem pinjaman, laman korporat pelbagai bahasa dan e-dagang di Nova Bitara.',
			en: 'eMesys at YHCM supports public-sector asset management and logistics. Career scope also includes web modules and server administration at YHCM, plus IT support, a loan system, a multilingual corporate site and e-commerce at Nova Bitara.'
		},
		context: { ms: 'YHCM · Sistem sektor awam', en: 'YHCM · Public-sector systems' },
		action: { ms: 'Teliti lapisan eMesys', en: 'Explore eMesys layers' },
		details: [
			{
				id: 'interface',
				title: { ms: 'Antara muka', en: 'Interface' },
				technology: 'Vue.js 3',
				body: {
					ms: 'Antara muka untuk pendaftaran dan pemantauan aset.',
					en: 'An interface for asset registration and monitoring.'
				}
			},
			{
				id: 'workflow',
				title: { ms: 'Aliran kerja', en: 'Workflow' },
				technology: 'Laravel 11',
				body: {
					ms: 'Aliran kelulusan pelupusan, kawalan akses berasaskan peranan (RBAC) dan log audit.',
					en: 'Disposal approval workflows, role-based access control (RBAC) and audit logs.'
				}
			},
			{
				id: 'records',
				title: { ms: 'Rekod', en: 'Records' },
				technology: 'MariaDB',
				body: {
					ms: 'Rekod inventori serta maklumat kitaran hayat aset.',
					en: 'Inventory records and asset lifecycle information.'
				}
			},
			{
				id: 'infrastructure',
				title: { ms: 'Infrastruktur', en: 'Infrastructure' },
				technology: 'Docker Swarm',
				body: {
					ms: 'Teknologi deployment yang disenaraikan untuk eMesys; lapisan ini bukan gambaran topologi produksi.',
					en: 'The deployment technology listed for eMesys; these layers do not describe a production topology.'
				}
			}
		],
		position: [26, 0, -56],
		cameraPos: [35, 6, -43],
		cameraLook: [26, 1.1, -56]
	},
	{
		id: 3,
		code: 'MOBILE-03',
		short: { ms: 'OnboardX', en: 'OnboardX' },
		name: { ms: 'Mobiliti Perusahaan', en: 'Enterprise Mobility' },
		subtitle: { ms: 'TNB · Flutter · Azure · Jenkins', en: 'TNB · Flutter · Azure · Jenkins' },
		summary: {
			ms: 'OnboardX menyusun proses onboarding pekerja melalui dokumen, pengesahan profil dan tugasan latihan pada web serta mudah alih.',
			en: 'OnboardX organises employee onboarding across documents, profile verification and training tasks on web and mobile.'
		},
		context: {
			ms: 'TNB · Pembangunan mobiliti perusahaan',
			en: 'TNB · Enterprise mobility development'
		},
		action: { ms: 'Terokai aliran onboarding', en: 'Explore onboarding workflow' },
		details: [
			{
				id: 'documents-profiles',
				title: { ms: 'Dokumen & profil', en: 'Documents & profiles' },
				technology: 'Flutter / Dart',
				body: {
					ms: 'Antara muka web dan mudah alih untuk penghantaran dokumen serta pengesahan profil pekerja.',
					en: 'Web and mobile interfaces for document submission and employee profile verification.'
				}
			},
			{
				id: 'training',
				title: { ms: 'Tugasan latihan', en: 'Training tasks' },
				technology: 'OnboardX',
				body: {
					ms: 'Penjejakan tugasan latihan sebagai sebahagian daripada aliran onboarding pekerja.',
					en: 'Training task tracking as part of the employee onboarding workflow.'
				}
			},
			{
				id: 'cloud-delivery',
				title: { ms: 'Penghantaran awan', en: 'Cloud delivery' },
				technology: 'Microsoft Azure / Ubuntu / Jenkins',
				body: {
					ms: 'Pengalaman TNB merangkumi pentadbiran pelayan Ubuntu di Azure serta penerokaan saluran CI/CD menggunakan Jenkins.',
					en: 'TNB experience includes Ubuntu server administration on Azure and exploration of CI/CD pipelines using Jenkins.'
				}
			}
		],
		position: [0, 4, -84],
		cameraPos: [9, 10, -71],
		cameraLook: [0, 5.1, -84]
	},
	{
		id: 4,
		code: 'VISION-04',
		short: { ms: 'cv_bot', en: 'cv_bot' },
		name: { ms: 'Penglihatan Komputer', en: 'Computer Vision' },
		subtitle: { ms: 'OpenCV · SIFT · CIELAB · Win32', en: 'OpenCV · SIFT · CIELAB · Win32' },
		summary: {
			ms: 'cv_bot menggabungkan pengecaman visual dalam Python dengan kawalan sempadan tetingkap Windows. Bukan LLM; paparan portfolio ini tidak menjalankan OpenCV atau inferens AI dalam pelayar.',
			en: 'cv_bot combines visual recognition in Python with Windows window-boundary controls. It is not an LLM; this portfolio view does not run OpenCV or AI inference in the browser.'
		},
		context: {
			ms: 'Projek peribadi · Automasi desktop Windows',
			en: 'Personal project · Windows desktop automation'
		},
		action: { ms: 'Lihat pendekatan visual', en: 'Explore the visual approach' },
		details: [
			{
				id: 'recognition',
				title: { ms: 'Pengecaman visual', en: 'Visual recognition' },
				technology: 'OpenCV / SIFT',
				body: {
					ms: 'Pemadanan templat berbilang skala dan homografi SIFT untuk pengecaman visual dalam aplikasi desktop Python.',
					en: 'Multi-scale template matching and SIFT homography for visual recognition in a Python desktop application.'
				}
			},
			{
				id: 'colour',
				title: { ms: 'Segmentasi warna', en: 'Colour segmentation' },
				technology: 'CIELAB L*a*b* / HSV',
				body: {
					ms: 'Segmentasi warna CIELAB dan HSV adaptif digabungkan dengan penapisan kontur bagi pengesanan sasaran.',
					en: 'CIELAB and adaptive HSV colour segmentation combined with contour filtering for target detection.'
				}
			},
			{
				id: 'window-safety',
				title: { ms: 'Sempadan tetingkap', en: 'Window boundaries' },
				technology: 'Win32 API',
				body: {
					ms: 'WindowSafetyGuard dan ClientAreaNormalizer menyediakan kawalan sempadan kawasan klien tetingkap.',
					en: 'WindowSafetyGuard and ClientAreaNormalizer provide window client-area boundary controls.'
				}
			}
		],
		position: [-26, 0, -112],
		cameraPos: [-17, 6, -99],
		cameraLook: [-26, 1.1, -112]
	},
	{
		id: 5,
		code: 'CONTACT-05',
		short: { ms: 'Hubungi', en: 'Contact' },
		name: { ms: 'Hubungi Munir', en: 'Contact Munir' },
		subtitle: {
			ms: 'Projek, kerjaya & kerjasama',
			en: 'Projects, roles & collaboration'
		},
		summary: {
			ms: 'Kongsi konteks, cabaran dan perkara yang ingin dicapai. Hubungi Munir terus untuk membincangkan peluang, aturan kerja atau ketersediaan semasa.',
			en: 'Share the context, the challenge and what you hope to achieve. Contact Munir directly to discuss opportunities, working arrangements or current availability.'
		},
		context: {
			ms: 'Profil profesional · Puchong, Selangor',
			en: 'Professional profile · Puchong, Selangor'
		},
		action: { ms: 'Pilih saluran hubungan', en: 'Choose a contact channel' },
		details: [
			{
				id: 'email',
				title: { ms: 'E-mel', en: 'Email' },
				technology: 'Email',
				body: {
					ms: 'Untuk pertanyaan projek, keperluan teknikal atau peluang kerjaya melalui e-mel.',
					en: 'For project enquiries, technical requirements or career opportunities by email.'
				}
			},
			{
				id: 'github',
				title: { ms: 'GitHub', en: 'GitHub' },
				technology: 'GitHub',
				body: {
					ms: 'Rujuk profil GitHub yang disenaraikan dalam portfolio ini.',
					en: 'Visit the GitHub profile listed in this portfolio.'
				}
			},
			{
				id: 'linkedin',
				title: { ms: 'LinkedIn', en: 'LinkedIn' },
				technology: 'LinkedIn',
				body: {
					ms: 'Rujuk profil LinkedIn untuk latar belakang profesional.',
					en: 'Visit the LinkedIn profile for professional background.'
				}
			}
		],
		position: [0, 0, -140],
		cameraPos: [9, 6, -127],
		cameraLook: [0, 1.1, -140]
	}
];

export function isChamberId(value: unknown): value is ChamberId {
	return value === 0 || value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}
