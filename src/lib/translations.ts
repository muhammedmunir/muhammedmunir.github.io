export const translations = {
	ms: {
		// Nav
		nav: {
			home: 'Utama',
			experience: 'Pengalaman',
			projects: 'Projek & Sistem',
			skills: 'Kemahiran',
			contact: 'Hubungi',
			hire: 'Ambil Saya',
			resume: 'Resume ATS'
		},

		// Hero
		hero: {
			badge: 'Tersedia untuk peluang kerjaya & perundingan kanan',
			tagline1: 'Profesional IT',
			tagline2: 'Pembangun Full-Stack',
			tagline3: 'Sistem Selamat & AI',
			bio: 'Membangunkan <strong>aplikasi gred perusahaan & sistem berkeselamatan tinggi</strong> merentasi sektor awam/kerajaan, AI automasi mudah alih, dan SaaS moden. Berpengalaman luas dalam <span class="highlight">Vue.js</span>, <span class="highlight">Laravel 11/12</span>, <span class="highlight">SvelteKit</span>, <span class="highlight">Flutter</span>, <span class="highlight">Three.js</span>, dan <span class="highlight">Python Computer Vision</span> — disokong kepakaran kukuh dalam <strong>Keselamatan Rangkaian, Splunk SIEM</strong>, orkestrasi kontena <span class="highlight">Docker Swarm</span>, dan awan <span class="highlight">Azure & Vercel</span>.',
			cta_projects: 'Jelajah 18+ Projek',
			cta_resume: 'Muat Turun CV (ATS)',
			cta_contact: 'Hubungi Saya',
			cta_jarvis: 'Buka J.A.R.V.I.S HUD',
			scroll: 'Tatal untuk jelajahi ekosistem',
			stats: {
				exp: 'Tahun Pengalaman',
				projects: 'Sistem & Aplikasi Dihantar',
				tech: 'Teknologi Utama',
				degree: 'Keselamatan Rangkaian'
			}
		},

		// Experience
		experience: {
			label: 'Perjalanan Kerjaya',
			title: 'Pengalaman Kerja',
			desc: 'Daripada pertahanan keselamatan siber hingga kejuruteraan sistem perusahaan & sektor awam',
			active: '● Aktif',
			present: 'Kini'
		},

		// Experience entries
		exp: {
			yhcm: {
				role: 'Pengaturcara / Full-Stack Enterprise Programmer',
				desc: 'Menyelenggara dan meningkatkan aplikasi web berskala perusahaan bagi sektor awam/kerajaan (termasuk eMesys, Sutera, dan ADIMS) dengan mematuhi piawaian keselamatan data dan kebolehpercayaan yang ketat. Membangunkan modul baharu pada frontend dan backend serta mentadbir persekitaran pelayan produksi.',
				highlights: [
					'Menyelenggara & menyokong sistem kritikal sektor awam (eMesys, Sutera, ADIMS)',
					'Pembangunan frontend menggunakan Vue.js 3 & panel pentadbiran Laravel Filament',
					'Pengoptimuman skema & prestasi pangkalan data MySQL, MariaDB, dan PostgreSQL 17',
					'Pengurusan deployment kontena Docker Swarm dan orkestrasi perkhidmatan',
					'Pentadbiran pelayan Linux & Windows: pemantauan, keselamatan & penyelesaian masalah',
					'Kawalan akses berasaskan peranan (RBAC), SSO Enterprise, dan pematuhan integriti data kerajaan'
				]
			},
			nova: {
				role: 'Sokongan IT & Pembangun Web',
				desc: 'Menyediakan sokongan IT menyeluruh sambil membangunkan sistem pengeluaran full-stack — Sistem Pinjaman Bercagar, Laman Korporat Pelbagai Bahasa, dan Platform E-Dagang — digunakan di Vercel dan DirectAdmin dengan pengurusan DNS & CDN tersuai.',
				highlights: [
					'Bina Sistem Pinjaman Bercagar (IWA001) — SvelteKit, Supabase RLS (Vercel + GoDaddy)',
					'Bina Laman Korporat Infinity World — SvelteKit + Redis + Resend (3 Bahasa)',
					'Bangunkan Platform E-Dagang — Laravel & MySQL (DirectAdmin + Cloudflare)',
					'Sokongan IT operasi: penyelesaian masalah perkakasan, perisian & rangkaian korporat',
					'Pengurusan rekod DNS melalui GoDaddy & perlindungan Cloudflare WAF'
				]
			},
			tnb_protege: {
				role: 'Penyelesaian Mobiliti Perusahaan',
				desc: 'Memimpin pembangunan full-stack "Onboardx" — aplikasi mudah alih/web perusahaan yang memperkemas proses onboarding pekerja TNB. Mengurus pelayan Ubuntu di Azure, meneroka CI/CD dengan Jenkins dan orkestrasi dengan Kubernetes, serta mereka bentuk UI/UX dengan Figma.',
				highlights: [
					'Pembangunan full-stack aplikasi "Onboardx" (Flutter/Dart/JavaScript)',
					'Seni bina pelbagai pangkalan data: Firebase Realtime DB, MongoDB, Supabase, MySQL',
					'Mentadbir pelayan Ubuntu di Microsoft Azure (konfigurasi NSG & pemantauan)',
					'Saluran paip integrasi berterusan CI/CD Jenkins & orkestrasi Kubernetes',
					'Reka bentuk UI/UX dengan Figma & pengurusan tiket sokongan pengguna'
				]
			},
			tnb_cyber: {
				role: 'Pertahanan Ancaman Keselamatan Siber',
				desc: 'Memantau trafik rangkaian dan log web melalui papan pemuka Splunk SIEM untuk mengesan anomali ancaman keselamatan siber. Bekerjasama dengan Pasukan Merah dan Biru menggunakan Vulhub untuk simulasi eksploitasi CVE bagi mengukuhkan pertahanan TNB.',
				highlights: [
					'Pemantauan ancaman masa nyata melalui papan pemuka Splunk SIEM (SOC)',
					'Kerjasama Pasukan Merah — pengenalpastian kerentanan menggunakan makmal Vulhub',
					'Sokongan Pasukan Biru — penambahbaikan postur keselamatan & audit log',
					'Kemaskini data sistem dalaman dan dokumentasi pematuhan keselamatan'
				]
			}
		},

		// Projects
		projects: {
			label: 'Portfolio Sistem & Aplikasi',
			title: 'Koleksi Projek & Inovasi Perisian',
			desc: '18+ sistem produksi merangkumi platform sektor awam berimpak tinggi, ejen autonomi AI, aplikasi mudah alih Flutter, dan enjin simulasi web.',
			context_label: 'Organisasi / Konteks',
			cta: 'Berminat untuk melihat demonstrasi sistem atau bekerjasama?',
			cta_btn: 'Hubungi Munir',
			view_doc: 'Kajian Kes (PDF)',
			specs_btn: 'Spesifikasi Sistem',
			close_modal: 'Tutup Spesifikasi [ESC]',
			specs_modal_title: 'Spesifikasi Teknikal Terperinci',
			specs_arch: 'Seni Bina & Aliran Data',
			specs_modules: 'Pecahan Modul & Keupayaan',
			specs_security: 'Protokol Keselamatan & Integriti',
			search_placeholder:
				'Cari sistem, framework atau kata kunci (cth: Laravel, Flutter, Docker, AI, Kerajaan)...',

			// Gov Vault Banner
			gov_vault_badge: 'SEKTOR AWAM & PERUSAHAAN',
			gov_vault_title: 'Sistem Sektor Awam & Korporat (YHCM)',
			gov_vault_desc:
				'Aplikasi web gred perusahaan yang dibangunkan untuk menyokong operasi, pengurusan aset dan arkib digital sektor awam dengan pematuhan keselamatan data ketat.',

			// Filter Categories
			filter_all: 'Semua',
			filter_gov: 'Sektor Awam',
			filter_ai: 'AI & Automasi',
			filter_mobile: 'Mobile',
			filter_web: 'Web & SaaS',
			filter_sim: 'Simulasi & Game',

			// Badges
			enterprise: 'Sektor Awam / Perusahaan',
			production: 'Produksi Langsung',
			academic: 'Akademik',
			innovation: 'Inovasi',

			// Government Projects (YHCM)
			emesys: {
				title: 'eMesys — Platform Pengurusan Aset & Logistik',
				subtitle: 'Sistem Pengurusan Aset Sektor Awam',
				desc: 'Platform web berskala perusahaan untuk pengurusan kitaran hayat aset sektor awam. Mengendalikan pendaftaran aset, aliran kelulusan pelupusan, penjadualan penyelenggaraan, serta papan pemuka pemantauan servisibiliti.',
				features: [
					'Pengurusan kitaran hayat dan rekod inventori aset berpusat',
					'Aliran kerja kelulusan pelupusan dan pengesahan digital berperingkat',
					'Papan pemuka pemantauan ketersediaan dan servisibiliti peralatan',
					'Penjanaan laporan statistik dan lembaran data automatik',
					'Kawalan akses berasaskan peranan (RBAC) dan log audit keselamatan'
				]
			},
			sutera: {
				title: 'Sutera — Sistem Operasi & Penyelenggaraan',
				subtitle: 'Platform Penyelenggaraan Teknikal',
				desc: 'Sistem operasi berprestasi tinggi untuk pemantauan penyelenggaraan peralatan teknikal dan pengurusan arahan kerja dengan keselamatan data sektor awam.',
				features: [
					'Pengurusan rekod peralatan teknikal dan sejarah penyelenggaraan berkala',
					'Penjejakan status tiket permohonan kerja pembaikan sehingga selesai',
					'Papan pemuka penunjuk prestasi utama (KPI) ketersediaan operasi',
					'Penjanaan dokumen laporan rasmi berformat keselamatan sektor awam',
					'Seni bina pangkalan data optimum dengan caching berprestasi tinggi'
				]
			},
			adims: {
				title: 'ADIMS — Sistem Rekod & Aset Digital',
				subtitle: 'Platform Verifikasi Kod QR & Arkib Digital',
				desc: 'Sistem pengurusan maklumat dan arkib aset digital dengan integrasi verifikasi kod QR, storan awan selamat, dan pemprosesan baris giliran tak segerak.',
				features: [
					'Pengesahan dan penjejakan status fizikal menggunakan kod QR pintar',
					'Penyimpanan fail digital dan dokumen sokongan berasaskan storan awan',
					'Pengauditan menyeluruh aktiviti pengguna dengan pengesahan dua faktor (2FA)',
					'Pemprosesan kerja latar belakang berkelajuan tinggi tanpa senggang',
					'Penjanaan penyata dan dokumentasi digital automatik'
				]
			},

			// AI & Autonomous Agents
			tindak: {
				title: 'TINDAK — AI-Powered Mobile Action Engine',
				subtitle: 'Aplikasi Android Bertindak Pintar (Local-First + Gemini AI)',
				desc: 'Lapisan tindakan pantas untuk maklumat yang diterima atau ditemui pada telefon Android ("Jumpa sesuatu. Tindak terus"). Menangkap teks perkongsian (Share Intent), menganalisis nombor telefon, pautan URL, wang, dan tarikh secara tempatan dengan enjin pengurai (parser), disokong fallback Gemini AI, dan storan selamat Supabase dengan abah-abah ujian RLS ketat.',
				features: [
					'Kitaran teras: SHARE → UNDERSTAND → ACT → REMEMBER → PROTECT',
					'Pemprosesan tempatan (Local-First parsing) mengurangkan kebergantungan kos AI',
					'Integrasi Gemini AI sebagai fallback bagi input teks rumit',
					'Seni bina keselamatan ketat: tiada kunci API rahsia pada klien, Supabase Edge Functions',
					'Pengesahan pangkalan data Supabase dengan dasar RLS yang diuji'
				]
			},
			nine_router: {
				title: '9Router Office — Autonomous AI Agent 3D Workspace',
				subtitle:
					'Pelayan Orkestrasi Ejen AI, Antaramuka 3D Three.js & Model Context Protocol (MCP)',
				desc: 'Persekitaran maya 3D dan pelayan orkestrasi masa nyata di mana berbilang ejen AI autonomi bekerjasama dalam pejabat maya interaktif. Dibina dengan Node.js 22+, rendering grafik 3D Three.js, integrasi Model Context Protocol (MCP SDK), jambatan suara masa nyata, perkhidmatan memori ejen, dan pengujian automasi menggunakan Playwright MCP.',
				features: [
					'Pejabat maya interaktif 3D berasaskan Three.js dengan rendering scene masa nyata',
					'Seni bina Model Context Protocol (MCP SDK) menghubungkan fail sistem dan alatan luar',
					'Sistem perbualan pasukan berbilang ejen dengan sintesis suara suara AI interaktif',
					'Pengesahan kod dan penilaian kualiti perisian automatik (quality verifier & curator)',
					'Pengujian hujung-ke-hujung (E2E) berasaskan Playwright MCP server'
				]
			},
			cv_bot: {
				title: 'Computer Vision & Win32 Automation Suite',
				subtitle: 'Enjin Automasi Desktop Berasaskan Visi Komputer',
				desc: 'Sistem automasi desktop peringkat tinggi yang dibangunkan dalam Python dengan memanfaatkan OpenCV, Win32 API asli, dan CustomTkinter. Menggunakan pemadanan templat multi-skala (SIFT homography), segmentasi warna ruang CIELAB L*a*b* dan HSV adaptif, pengesan sasaran centroid masa nyata, dan pengesanan teks OCR dinamik dengan kawalan perimeter tetingkap selamat.',
				features: [
					'Perlindungan perimeter tetingkap Win32 asli (WindowSafetyGuard & ClientAreaNormalizer)',
					'Pemadanan templat piramid berbilang skala (SIFT) & penjejakan visual servoing gelung tertutup',
					'Pengesanan sasaran hibrid menggunakan ruang warna CIELAB dan penapis kontur',
					'Enjin OCR dinamik bagi statistik masa nyata dan pemantauan memori',
					'Papan pemuka CustomTkinter dengan multithreading dan pengelogan berstruktur'
				]
			},

			// Mobile & Health Tech
			baby_kicking: {
				title: 'Baby Kicking Suite — Mobile Fetal Health Tracker',
				subtitle: 'Aplikasi Flutter Pemantau Pergerakan Bayi & Telemetri Kesihatan Ibu',
				desc: 'Aplikasi mudah alih Flutter rentas platform (Android, iOS, Web) yang membolehkan ibu hamil memantau dan merekod tendangan bayi secara tepat. Mengintegrasikan Firebase Cloud Firestore untuk penyegerakan data masa nyata, Firebase Cloud Functions untuk analisis corak aktiviti janin, graf trend kesihatan harian, dan eksport laporan PDF untuk rujukan pakar perubatan.',
				features: [
					'Pembangunan mudah alih rentas platform menggunakan Flutter & Dart',
					'Penyegerakan masa nyata & storan awan selamat melalui Firebase Firestore',
					'Enjin analisis corak tendangan janin dan amaran ketidakteraturan pergerakan',
					'Eksport laporan kesihatan berstruktur PDF untuk konsultasi doktor obstetrik',
					'Antaramuka mesra pengguna dengan kawalan getaran maklum balas haptik'
				]
			},
			tax_relief: {
				title: 'Tax Relief Malaysia — Smart Income Tax Optimizer',
				subtitle: 'Enjin Pengoptimuman Pelepasan Cukai Pendapatan Peribadi LHDN',
				desc: 'Aplikasi web pintar penuh dengan backend Node.js/TypeScript dan frontend responsif yang membantu pembayar cukai Malaysia memaksimumkan pelepasan cukai pendapatan peribadi LHDN. Menyediakan kalkulator interaktif bagi pelepasan gaya hidup, perubatan, insurans, dan pelepasan khas, serta mensimulasikan penjimatan cukai bersih mengikut kurungan pendapatan.',
				features: [
					'Pengiraan automatik kurungan cukai pendapatan individu mengikut kadar rasmi LHDN',
					'Simulasi penjimatan cukai maksimum berdasarkan cadangan pelepasan diperibadikan',
					'Backend Node.js yang pantas dengan validasi skema data ketat',
					'Antaramuka interaktif dengan carta pecahan pelepasan masa nyata',
					'Sistem tanpa storan data sensitif bagi menjamin privasi kewangan pengguna'
				]
			},
			jiofarm: {
				title: 'JioFarm — Smart Agriculture IoT Crop Monitoring',
				subtitle: 'Platform Telemetri Pertanian Pintar & Pemantauan Sensor IoT',
				desc: 'Sistem pemantauan pertanian pintar berasaskan Python yang mengumpul dan menganalisis telemetri daripada sensor IoT ladang (kelembapan tanah, suhu persekitaran, paras air, dan pH). Mengintegrasikan amaran ambang kritikal automatik dan papan pemuka analitik ramalan hasil tanaman.',
				features: [
					'Pengumpulan data sensor IoT masa nyata bagi parameter tanah dan iklim',
					'Backend Python dengan pemprosesan aliran data berprestasi tinggi',
					'Sistem amaran pintar automatik apabila parameter melebihi had selamat',
					'Visualisasi trend kesihatan tanaman dan pengoptimuman kitaran pengairan',
					'Seni bina modular mudah diskalakan untuk pelbagai tapak ladang'
				]
			},

			// Web, SaaS & Enterprise
			lumina: {
				title: 'Lumina Glass Studio & Smart Mirror Visualizer',
				subtitle: 'E-Dagang & Visualizer Cermin LED Pintar Interaktif',
				desc: 'Aplikasi web moden untuk kedai cermin pintar LED dan perkhidmatan kontraktor pemasangan kaca hiasan rumah. Menggabungkan frontend visualizer interaktif 2D/3D untuk pemilihan bentuk cermin, pelarasan suhu warna lampu LED Kelvin, kecerahan dimmer, dan simulasi tekstur dinding, dengan backend Laravel 11 RESTful API dan ujian feature PHPUnit 100%.',
				features: [
					'Visualizer cermin interaktif 2D/3D dengan pelarasan lampu LED Kelvin (3000K–6500K)',
					'Backend Laravel 11 RESTful API dengan Model Eloquent & Form Request Validation',
					'Ujian berautomasi PHPUnit Feature Tests untuk integriti katalog & pesanan',
					'Integrasi sama-asal (Same-Origin) melalui proksi Vite bagi kestabilan API',
					'Reka bentuk responsif SvelteKit + Tailwind CSS'
				]
			},
			iwa001: {
				title: 'Sistem Pinjaman Bercagar (IWA001)',
				subtitle: 'Sistem Pengurusan Pinjaman Bercagar',
				desc: 'Platform pengurusan pinjaman bercagar peringkat produksi yang mengendalikan logik perniagaan kompleks bagi pemprosesan pinjaman bercagar. Dilengkapi keselamatan berlapis dengan Row Level Security (RLS) di peringkat pangkalan data Supabase, pengesahan berasaskan token JWT, dan panel pentadbir komprehensif merangkumi 17 halaman penuh.',
				features: [
					'Keselamatan Peringkat Baris (RLS) pada pangkalan data Supabase PostgreSQL',
					'Pengesahan JWT, kawalan peranan (RBAC) & perlindungan sesi selamat',
					'17 halaman antaramuka termasuk Panel Pentadbir (Admin Panel) penuh',
					'Enjin logik kelayakan pinjaman, jadual pembayaran & pengurusan cagaran',
					'Digunakan di Vercel dengan konfigurasi domain tersuai GoDaddy'
				]
			},
			onboardx: {
				title: 'Onboardx Enterprise Mobility System',
				subtitle: 'Aplikasi Onboarding Pekerja Perusahaan TNB',
				desc: 'Aplikasi perusahaan berskala besar yang memperkemas proses onboarding pekerja baharu Tenaga Nasional Berhad (TNB). Menyelaraskan aliran kerja dokumen, pengesahan identiti, dan penjejakan latihan dengan integrasi berbilang pangkalan data masa nyata merentasi Firebase, MongoDB, Supabase, dan MySQL di pelayan awan Microsoft Azure.',
				features: [
					'Pembangunan rentas platform Flutter (Web & Mobile Android/iOS)',
					'Seni bina 4 pangkalan data: Firebase Realtime DB, MongoDB, Supabase, MySQL',
					'Pelayan hos Ubuntu di Microsoft Azure dengan perlindungan Network Security Groups',
					'Automasi binaan dan deployment saluran paip CI/CD Jenkins & Kubernetes',
					'Prototaip antaramuka interaktif direka dengan Figma'
				]
			},
			infinity: {
				title: 'Laman Korporat Infinity World & i18n Engine',
				subtitle: 'Platform Web Korporat Dwibahasa / Pelbagai Bahasa',
				desc: 'Laman web korporat premium dengan sistem pengantarabangsaan berasaskan Svelte store yang menyokong 3 bahasa (BM/EN/ZH) dengan penukaran kandungan dinamik tanpa muat semula halaman. Menyediakan sistem blog pelanggan bersandar Redis, integrasi e-mel melalui Resend API, dan pengurusan rekod DNS GoDaddy.',
				features: [
					'Enjin i18n berasaskan Svelte store reaktif (3 bahasa: EN, BM, ZH)',
					'Sistem penyimpanan blog dan senarai pelanggan menggunakan Redis',
					'Integrasi penghantaran notifikasi e-mel berautomasi melalui Resend API',
					'Deployment berprestasi tinggi di rangkaian pinggir Vercel Edge',
					'Pengurusan domain korporat melalui GoDaddy DNS'
				]
			},
			fyp: {
				title: 'Sistem Pengurusan Pelaporan Geospatial (UTM)',
				subtitle: 'Projek Tahun Akhir (B.Sc. Sains Komputer UTM)',
				desc: 'Sistem pengurusan pelaporan komprehensif berteraskan visualisasi geospatial masa nyata dengan integrasi Google Maps JavaScript API. Membolehkan pengguna menyerahkan, menjejak, dan mengurus aduan/laporan kerosakan berasaskan koordinat GPS dengan pengelompokan penanda (marker clustering) dan zon geofencing.',
				features: [
					'Integrasi Google Maps API: koordinat GPS masa nyata, marker clustering & heatmap',
					'Penyerahan, semakan status, dan pengurusan tiket berasaskan lokasi',
					'Pangkalan data Supabase PostgreSQL dengan peraturan pengesahan data',
					'Antaramuka peta responsif dengan penapis kategori dan status aduan',
					'Reka bentuk UI/UX teliti bermula dari lakaran Figma hingga kod produksi'
				]
			},

			// Simulations, Physics & Tooling
			foony_9ball: {
				title: 'Foony 9-Ball Master — Physics Extension',
				subtitle: 'Pelanjutan Pelayar Chromium & Enjin Fizik Pelanggaran Biliard',
				desc: 'Pelanjutan pelayar Chromium berprestasi tinggi (Manifest V3) yang menganalisis permainan biliard dalam masa nyata. Menggunakan enjin fizik vektor 2D pada Canvas HTML5, pemintasan WebSocket bagi keadaan meja permainan, pengiraan sudut pantulan kusyen berbilang peringkat, dan visualisasi laluan bola dinamik.',
				features: [
					'Enjin fizik vektor 2D khusus untuk dinamik bola dan perlanggaran elastik',
					'Pemintasan data masa nyata (WebSocket hook) tanpa mengubah logik permainan asal',
					'Pengiraan unjuran pantulan dinding dan laluan poket berketepatan tinggi',
					'Antaramuka popup bergaya HUD gelap dengan kawalan kepekaan fleksibel',
					'Dibina sepenuhnya mengikut piawaian keselamatan Chromium Extension Manifest V3'
				]
			},
			orbit_pulse: {
				title: 'Orbit Pulse — Server Infrastructure Monitor',
				subtitle: 'Papan Pemuka Kesihatan Pelayan & Telemetri Rangkaian Masa Nyata',
				desc: 'Sistem pemantauan infrastruktur ringan yang menjejak kependaman ping, kadar kejayaan transmisi HTTP, dan beban CPU/memori pelayan. Dilengkapi visualisasi denyutan nadi (pulse) masa nyata dan pencetus amaran anomali sistem.',
				features: [
					'Penjejakan kependaman (latency) dan ketersediaan titik akhir secara berterusan',
					'Grafik visualisasi denyutan animasi berlatarbelakangkan reka bentuk sci-fi HUD',
					'Pengesanan anomali automatik apabila kadar ralat melebihi ambang kritikal',
					'Storan metrik tempatan yang cekap tanpa membebankan pelayan sasaran',
					'Antaramuka gelap responsif yang dioptimumkan untuk skrin bilik operasi (NOC)'
				]
			},
			focus_board: {
				title: 'Focus Board — Modular Productivity Kanban',
				subtitle: 'Papan Pengurusan Tugasan Fokus & Aliran Kerja Tempatan',
				desc: 'Aplikasi produktiviti modular yang menggabungkan prinsip Kanban dengan zon tumpuan mendalam (Deep Work). Dilengkapi pemasa Pomodoro pintar, penapisan keutamaan berperingkat, dan pengekalan keadaan tempatan tanpa kebergantungan luar.',
				features: [
					'Papan lajur seret dan lepas berasaskan logik keadaan yang sangat lancar',
					'Integrasi pemasa fokus berirama dengan penjejakan sesi kerja produktif',
					'Pengekalan data selamat berasaskan pelayar tempatan (Local-First)',
					'Penandaan keutamaan berkod warna dan analitik penyiapan harian',
					'Reka bentuk antaramuka minimalis gelap yang bebas daripada gangguan'
				]
			},
			sudoku: {
				title: 'Sudoku Solver & Brave Browser Extension',
				subtitle: 'Penjana Papan Logik Prosedural & Algoritma Backtracking',
				desc: 'Aplikasi web interaktif dan pelanjutan pelayar Brave/Chromium yang menampilkan penjanaan teka-teki Sudoku prosedural mengikut tahap kesukaran, algoritma penyelesai automatik berasaskan recursive backtracking, dan mod tema gelap berprestasi tinggi.',
				features: [
					'Penjana teka-teki berautonomi dengan pengesahan penyelesaian unik (unique solution check)',
					'Enjin penyelesai pantas menggunakan algoritma recursive backtracking',
					'Pelanjutan pelayar Chromium dengan pintasan pantas di bar alat',
					'Penyimpanan kemajuan permainan automatik dan penjejak masa catatan terbaik',
					'Antaramuka minimalis bersih tanpa kebergantungan pustaka pihak ketiga'
				]
			}
		},

		// Skills
		skills: {
			label: 'Kepakaran Teknikal',
			title: 'Senjata & Penguasaan Teknologi',
			desc: 'Kemahiran pelbagai disiplin merangkumi pembangunan full-stack, automasi sistem, infrastruktur awan, dan keselamatan siber',
			frontend: 'Frontend, Mudah Alih & 3D',
			backend: 'Backend & Pengkomputeran Awan',
			security: 'Keselamatan Rangkaian & DevOps',
			excellent_label: 'Penguasaan Utama',
			tools_label: 'Alatan Pembangunan & DevOps',
			certs_label: 'Pensijilan Profesional Cisco & Kursus',
			edu_label: 'Pendidikan Akademik',
			fyp_label: 'Projek Tahun Akhir',
			bachelor: 'Ijazah Sarjana Muda',
			diploma: 'Diploma',
			cgpa: 'PNGK',
			courses_label: 'Kursus Utama Berkaitan'
		},

		// Education
		edu: {
			degree: {
				title: 'Ijazah Sarjana Muda Sains Komputer',
				major: 'Keselamatan Rangkaian (Network Security)',
				period: '2021 – 2024',
				fyp_title: 'Sistem Pengurusan Pelaporan Geospatial untuk UTM',
				fyp_desc:
					'Sistem pengurusan pelaporan dengan visualisasi geospatial masa nyata menggunakan Google Maps API, SvelteKit, Tailwind CSS, dan Supabase.',
				courses: [
					{
						name: 'Penggodaman Beretika & Ujian Penembusan (Pen Testing)',
						detail:
							'Simulasi serangan siber praktikal dengan alat Pasukan Merah (Metasploit, Nmap, Burp Suite)'
					},
					{
						name: 'Tadbir Urus & Pematuhan Keselamatan Siber',
						detail: 'Kerangka kerja piawaian ISO 27001, NIST, dan penguatkuasaan dasar keselamatan'
					},
					{
						name: 'Keselamatan Rangkaian Lanjutan',
						detail:
							'Konfigurasi tembok api (firewall), VPN, ACL, IDS/IPS, dan analisis paket trafik Wireshark'
					}
				]
			},
			diploma: {
				title: 'Diploma Sains Komputer',
				major: 'Sains Komputer (Pembangunan Perisian)',
				period: '2017 – 2020',
				fyp_title: 'Platform E-Dagang (Eshop)',
				fyp_desc:
					'Aplikasi e-dagang berpusatkan pelanggan dengan pengesahan selamat, pangkalan data MySQL, dan penggunaan pelayan Linux Ubuntu di Microsoft Azure.',
				courses: [
					{
						name: 'Pengaturcaraan Berorientasikan Objek (C# .NET)',
						detail:
							'Pembangunan aplikasi desktop dengan konsep encapsulation, inheritance & polymorphism'
					},
					{
						name: 'Pengaturcaraan Berstruktur (C++)',
						detail:
							'Algoritma mendalam, struktur data memori, dan pengoptimuman logik pengkomputeran'
					},
					{
						name: 'Pengaturcaraan Java & Rangkaian Komputer',
						detail: 'Asas soket rangkaian, multithreading, dan aplikasi pelayan-klien'
					}
				]
			}
		},

		// Contact
		contact: {
			label: 'Hubungi Saya',
			title: 'Mari Bincang Kerjasama',
			desc: 'Terbuka untuk tawaran kerjaya sepenuh masa, projek kontrak perusahaan, atau perundingan teknikal',
			intro_title: 'Bersedia membina penyelesaian berimpak tinggi?',
			intro_desc:
				'Sama ada anda memerlukan sistem perusahaan sektor awam yang mematuhi keselamatan ketat, aplikasi SaaS yang berskala, atau automasi berkuasa tinggi — saya sedia memberikan mutu kerja yang profesional dan teliti.',
			avail_status: 'Tersedia Sekarang',
			avail_sub: 'Terbuka untuk peluang Sepenuh Masa, Kontrak & Bebas',
			form_title: 'Hantar Mesej Terus',
			name_label: 'Nama Penuh',
			name_placeholder: 'Nama anda atau syarikat',
			email_label: 'Alamat E-mel',
			email_placeholder: 'emel@organisasi.com',
			subject_label: 'Subjek',
			subject_placeholder: 'Perbincangan projek / Tawaran kerja',
			msg_label: 'Mesej',
			msg_placeholder: 'Kongsi butiran projek, keperluan teknikal, atau peluang kerjaya anda...',
			send_btn: 'Hantar Mesej Sekarang',
			sending: 'Menghantar...',
			success_title: 'Mesej Berjaya Dihantar!',
			success_msg:
				'Terima kasih atas mesej anda. Saya akan meneliti dan membalas dalam tempoh 24 jam.',
			send_another: 'Hantar Mesej Baharu'
		},

		// Footer
		footer: {
			sub: 'Muhammed Munir Bin Mohd Azmi · Full-Stack Developer · Network Security Specialist',
			copy: 'Hak cipta terpelihara. Dibina dengan SvelteKit 5, TypeScript, Tailwind & GSAP.'
		},

		// JARVIS AI System
		jarvis: {
			hud_badge: 'J.A.R.V.I.S · NEURAL ASSISTANT',
			status_title: 'JARVIS CORE AKTIF · FASIH BAHASA MELAYU',
			telemetry: 'SISTEM: OPTIMAL · TELEMETRI: 18+ PROJEK · LOKASI: PUCHONG, SELANGOR',
			greeting:
				'Salam perkenalan! Saya J.A.R.V.I.S, pembantu kecerdasan portfolio Muhammed Munir. Saya fasih berbahasa Melayu dan sedia membantu anda meneliti rekod kepakaran, 3 sistem sektor kerajaan, 15+ aplikasi inovasi, statistik ekosistem, atau memuat turun resume ATS. Apa yang boleh saya bantu anda hari ini?',
			input_placeholder: 'Tanya apa sahaja dalam Bahasa Melayu atau klik cadangan...',
			sound_on: 'Audio: AKTIF',
			sound_off: 'Audio: SENYAP',
			voice_on: 'Suara AI: AKTIF',
			voice_off: 'Suara AI: SENYAP',
			listen_btn: '🔊 Dengar Suara',
			close_btn: 'Tutup HUD [ESC]',
			chips: [
				{ label: '📊 Statistik & Metrik', query: 'statistik' },
				{ label: '🏛️ Jumlah Projek Kerajaan', query: 'berapa projek kerajaan ada' },
				{ label: '📍 Lokasi Kediaman', query: 'di tinggal mana' },
				{ label: '🎓 Pendidikan & Universiti', query: 'belajar mana' },
				{ label: '💼 Pengalaman Kerja', query: 'pengalaman' },
				{ label: '📱 Aplikasi Mobile & Web', query: 'aplikasi' },
				{ label: '🤖 AI & Ejen Autonomi', query: 'ai' },
				{ label: '📄 Muat Turun Resume ATS', query: 'resume' },
				{ label: '📞 Hubungi & Temuduga', query: 'hubungi' }
			]
		}
	},

	en: {
		nav: {
			home: 'Home',
			experience: 'Experience',
			projects: 'Projects & Systems',
			skills: 'Skills',
			contact: 'Contact',
			hire: 'Hire Me',
			resume: 'ATS Resume'
		},
		hero: {
			badge: 'Available for full-time opportunities & senior consulting',
			tagline1: 'IT Professional',
			tagline2: 'Full-Stack Developer',
			tagline3: 'Secure Systems & AI',
			bio: 'Engineering <strong>enterprise-grade applications & high-security platforms</strong> across the public/government sector, autonomous AI mobile tools, and modern SaaS. Highly experienced in <span class="highlight">Vue.js</span>, <span class="highlight">Laravel 11/12</span>, <span class="highlight">SvelteKit</span>, <span class="highlight">Flutter</span>, <span class="highlight">Three.js</span>, and <span class="highlight">Python Computer Vision</span> — backed by strong foundations in <strong>Network Security, Splunk SIEM</strong>, <span class="highlight">Docker Swarm</span> container orchestration, and <span class="highlight">Azure & Vercel</span> cloud infrastructure.',
			cta_projects: 'Explore 18+ Projects',
			cta_resume: 'Download CV (ATS)',
			cta_contact: 'Get In Touch',
			cta_jarvis: 'Launch J.A.R.V.I.S HUD',
			scroll: 'Scroll to explore the ecosystem',
			stats: {
				exp: 'Years Experience',
				projects: 'Shipped Systems & Apps',
				tech: 'Core Technologies',
				degree: 'Network Security'
			}
		},
		experience: {
			label: 'Career Journey',
			title: 'Work Experience',
			desc: 'From cybersecurity threat defense to enterprise full-stack engineering & public sector systems',
			active: '● Active',
			present: 'Present'
		},
		exp: {
			yhcm: {
				role: 'Programmer / Full-Stack Enterprise Programmer',
				desc: 'Maintaining and enhancing enterprise-grade web applications for the public/government sector (including eMesys, Sutera, and ADIMS) adhering to strict data security and compliance standards. Developing new features across frontend and backend while administering production server environments.',
				highlights: [
					'Maintain & support mission-critical public sector systems (eMesys, Sutera, ADIMS)',
					'Frontend development with Vue.js 3 & backend administration via Laravel Filament',
					'Enterprise database schema & query optimization for MySQL, MariaDB, and PostgreSQL 17',
					'Docker Swarm containerization, image management & service deployment',
					'Linux & Windows server administration: security hardening, monitoring & troubleshooting',
					'Role-based access control (RBAC), Enterprise SSO authentication, and government data integrity compliance'
				]
			},
			nova: {
				role: 'IT Support & Web Developer',
				desc: 'Delivered comprehensive IT operational support while engineering full-stack production systems — a Collateralized Loan System, a Multilingual Corporate Portal, and an E-Commerce Platform — deployed on Vercel and DirectAdmin with custom DNS & CDN architectures.',
				highlights: [
					'Built Collateralized Loan System (IWA001) — SvelteKit & Supabase RLS (Vercel + GoDaddy)',
					'Engineered Infinity World Corporate Portal — SvelteKit + Redis + Resend (3 Languages)',
					'Developed E-Commerce Platform — Laravel & MySQL (DirectAdmin + Cloudflare WAF)',
					'Operational IT support: corporate hardware, software & network troubleshooting',
					'DNS infrastructure management via GoDaddy & Cloudflare Edge CDN/WAF'
				]
			},
			tnb_protege: {
				role: 'Enterprise Mobility Solution',
				desc: 'Spearheaded full-stack development of "Onboardx" — an enterprise mobile and web platform streamlining onboarding for Tenaga Nasional Berhad (TNB). Managed Azure Ubuntu servers, established CI/CD pipelines with Jenkins, container orchestration with Kubernetes, and Figma UI/UX.',
				highlights: [
					'Full-stack cross-platform development of "Onboardx" app (Flutter/Dart/JavaScript)',
					'Multi-database architecture: Firebase Realtime DB, MongoDB, Supabase, MySQL',
					'Administered Microsoft Azure Ubuntu servers (NSG firewall configuration & health monitoring)',
					'Continuous integration pipeline automation via Jenkins & container orchestration via Kubernetes',
					'User-centered UI/UX prototyping with Figma & support ticketing management'
				]
			},
			tnb_cyber: {
				role: 'Cyber Security Threat Defense',
				desc: 'Monitored real-time enterprise web traffic and network activity via Splunk SIEM dashboards to detect security anomalies. Partnered with Red and Blue Teams using Vulhub for Docker-based CVE vulnerability reproduction and defense hardening.',
				highlights: [
					'Real-time threat monitoring and incident triage via Splunk SIEM (SOC environment)',
					'Red Team collaboration — vulnerability reproduction & analysis using Vulhub CVE labs',
					'Blue Team support — security posture strengthening & server log auditing',
					'Internal security system documentation & compliance maintenance'
				]
			}
		},
		projects: {
			label: 'Featured Systems & Applications',
			title: 'Featured Systems & Engineering Projects',
			desc: '18+ production systems spanning public sector platforms, autonomous AI agents, Flutter mobile solutions, and web simulation engines.',
			context_label: 'Organization / Context',
			cta: 'Interested in collaborating or scheduling a live walkthrough?',
			cta_btn: 'Contact Munir',
			view_doc: 'Case Study (PDF)',
			specs_btn: 'System Specs',
			close_modal: 'Close Specs [ESC]',
			specs_modal_title: 'Detailed Technical Specifications',
			specs_arch: 'Architecture & Data Flow',
			specs_modules: 'Core Modules & Capabilities',
			specs_security: 'Security Protocols & Governance',
			search_placeholder:
				'Search systems, frameworks, or keywords (e.g., Laravel, Flutter, Docker, AI, Government)...',

			// Gov Vault Banner
			gov_vault_badge: 'PUBLIC SECTOR & ENTERPRISE',
			gov_vault_title: 'Public Sector & Enterprise Systems (YHCM)',
			gov_vault_desc:
				'Enterprise-grade web platforms engineered to support operations, asset management, and digital records for public sector organizations with strict data governance.',

			// Filter Categories
			filter_all: 'All',
			filter_gov: 'Public Sector',
			filter_ai: 'AI & Automation',
			filter_mobile: 'Mobile',
			filter_web: 'Web & SaaS',
			filter_sim: 'Simulation & Games',

			// Badges
			enterprise: 'Public Sector / Enterprise',
			production: 'Live Production',
			academic: 'Academic',
			innovation: 'Innovation',

			// Government Projects (YHCM)
			emesys: {
				title: 'eMesys — Enterprise Asset & Logistics Platform',
				subtitle: 'Public Sector Asset Management System',
				desc: 'Enterprise-grade platform governing asset lifecycle management for public sector agencies. Features centralized registration, disposal approval hierarchies, and equipment serviceability monitoring.',
				features: [
					'Comprehensive asset lifecycle tracking and inventory verification',
					'Multi-tiered approval workflows for disposal and transfer requests',
					'Executive dashboard displaying real-time equipment serviceability metrics',
					'Automated statistical reports and data export capabilities',
					'Role-based access control (RBAC) with audit logging compliance'
				]
			},
			sutera: {
				title: 'Sutera — Operations & Maintenance Management',
				subtitle: 'Technical Maintenance Platform',
				desc: 'High-performance operations system managing technical equipment servicing, work order directives, and operational readiness metrics with robust data governance.',
				features: [
					'Technical equipment tracking and historical maintenance logging',
					'End-to-end work order dispatch and service completion workflows',
					'Real-time operational readiness and KPI monitoring dashboards',
					'Automated generation of official service and status documentation',
					'Optimized relational database store with high-throughput caching'
				]
			},
			adims: {
				title: 'ADIMS — Digital Records & Asset Management',
				subtitle: 'Digital Archiving & QR Verification Platform',
				desc: 'Enterprise digital documentation and asset verification platform featuring QR code tagging, secure object storage archiving, and asynchronous queue processing.',
				features: [
					'Physical asset tagging and validation utilizing smart QR codes',
					'Centralized digital document archiving backed by secure cloud storage',
					'Full user activity audit trails paired with two-factor authentication (2FA)',
					'High-speed background queue processing for heavy workflows',
					'Automated generation of digital records and executive summaries'
				]
			},

			// AI & Autonomous Agents
			tindak: {
				title: 'TINDAK — AI-Powered Mobile Action Engine',
				subtitle: 'Android Action Layer (Local-First Parsing + Gemini AI)',
				desc: 'A smart action layer for useful information received or discovered on an Android phone ("Spot it. Act immediately"). Intercepts explicit Android Share Intents, parses phone numbers, URLs, amounts, and dates locally via a high-performance regex engine, backed by Gemini AI fallback and a Supabase backend with a verified RLS security test harness.',
				features: [
					'Core operational loop: SHARE → UNDERSTAND → ACT → REMEMBER → PROTECT',
					'Local-first text understanding minimizes cloud latency and AI API overhead',
					'Selective Gemini AI fallback only invoked when local confidence is below threshold',
					'Zero secret API keys in the Flutter client — all external requests routed via Supabase Edge Functions',
					'Supabase PostgreSQL persistence with audited Row Level Security (RLS) test suite'
				]
			},
			nine_router: {
				title: '9Router Office — Autonomous AI Agent 3D Workspace',
				subtitle: 'Multi-Agent Orchestration Server, Three.js 3D Virtual Workspace & MCP Bridge',
				desc: 'A real-time 3D virtual environment and orchestration server where multiple autonomous AI agents collaborate within an interactive virtual office. Engineered with Node.js 22+, Three.js 3D scene rendering, Model Context Protocol (MCP SDK) tool integration, live agent voice bridges, persistent agent memory, and Playwright MCP automated testing.',
				features: [
					'Interactive Three.js 3D virtual office with real-time multi-agent scene rendering',
					'Model Context Protocol (MCP SDK) connecting filesystem, tools, and execution environments',
					'Multi-agent team conversation pipeline featuring interactive voice audio synthesis',
					'Automated code verification and software quality evaluation (quality verifier & curator)',
					'End-to-end test execution via automated Playwright MCP browser testing'
				]
			},
			cv_bot: {
				title: 'Computer Vision & Win32 Automation Suite',
				subtitle: 'Advanced Desktop Automation Engine Powered by OpenCV',
				desc: 'A high-performance desktop automation system engineered in Python using OpenCV, native Win32 APIs, and CustomTkinter. Features multi-scale pyramid template matching (SIFT homography), CIELAB L*a*b* & adaptive HSV color segmentation, real-time centroid tracking with closed-loop visual servoing, and dynamic OCR text recognition within strict OS window boundaries.',
				features: [
					'Native Win32 client boundary safety guards (WindowSafetyGuard & ClientAreaNormalizer)',
					'Multi-scale pyramid template matching & closed-loop visual servoing error controller',
					'Hybrid target detector utilizing CIELAB color space segmentation and contour filters',
					'Dynamic OCR engine for real-time game statistic extraction and thresholding',
					'CustomTkinter dashboard with event-driven multithreading and structured JSONL logging'
				]
			},

			// Mobile & Health Tech
			baby_kicking: {
				title: 'Baby Kicking Suite — Mobile Fetal Health Tracker',
				subtitle: 'Flutter Cross-Platform Fetal Movement Tracker & Maternal Health Telemetry',
				desc: 'A cross-platform Flutter mobile application (Android, iOS, Web) enabling expectant mothers to accurately log and monitor baby kicks. Integrates Firebase Cloud Firestore for real-time synchronization, Firebase Cloud Functions for pattern analysis, daily wellness trend charts, and structured PDF clinical exports for obstetrician review.',
				features: [
					'Cross-platform mobile application engineered with Flutter & Dart',
					'Real-time data synchronization & secure cloud persistence via Firebase Firestore',
					'Fetal kick pattern analytics engine detecting movement irregularities and trends',
					'Structured PDF clinical report generator for obstetrician appointments',
					'Intuitive interface enhanced with haptic vibration feedback on kick logging'
				]
			},
			tax_relief: {
				title: 'Tax Relief Malaysia — Smart Income Tax Optimizer',
				subtitle: 'Personal Income Tax Deduction Optimizer & Bracket Simulation Engine',
				desc: 'A full-stack web application with a Node.js/TypeScript backend and responsive frontend that helps Malaysian taxpayers maximize their personal LHDN tax reliefs. Features an interactive calculator across lifestyle, medical, insurance, and special tax reliefs, while simulating net tax savings across official income brackets.',
				features: [
					'Automatic tax bracket calculations based on official LHDN tax schedules',
					'Net tax savings simulation providing personalized deduction recommendations',
					'High-performance Node.js backend with strict data schema validation',
					'Interactive visualization with real-time deduction category breakdown charts',
					'Privacy-first architecture operating without storing sensitive taxpayer financial records'
				]
			},
			jiofarm: {
				title: 'JioFarm — Smart Agriculture IoT Crop Monitoring',
				subtitle: 'Smart Farming Telemetry Platform & IoT Sensor Analytics',
				desc: 'A Python-powered smart agriculture monitoring platform collecting and analyzing telemetry from agricultural IoT sensors (soil moisture, temperature, water level, and pH). Features automated critical threshold alerts and predictive crop yield analytics.',
				features: [
					'Real-time IoT sensor telemetry ingestion for microclimate and soil parameters',
					'High-throughput Python backend with streaming data analytics',
					'Automated threshold alert triggers warning farmers of hazardous conditions',
					'Crop health trend visualization for precision irrigation planning',
					'Modular, scalable architecture deployable across distributed farm sites'
				]
			},

			// Web, SaaS & Enterprise
			lumina: {
				title: 'Lumina Glass Studio & Smart Mirror Visualizer',
				subtitle: 'E-Commerce & Interactive LED Smart Mirror Configurator',
				desc: 'A modern web application for an LED smart mirror studio and architectural glass contractor. Combines an interactive 2D/3D mirror customizer (shape selector, LED Kelvin color temperature 3000K–6500K, dimmer adjustment, and background wall textures) with a robust Laravel 11 RESTful API backend and 100% PHPUnit feature test coverage.',
				features: [
					'Interactive 2D/3D mirror customizer with dynamic Kelvin temperature and dimmer controls',
					'Laravel 11 RESTful API backend featuring Eloquent Models & Form Request validation',
					'Comprehensive PHPUnit Feature Tests covering products, pricing, and order creation',
					'Same-Origin integration via Vite proxy eliminating CORS latency during development',
					'Fully responsive SvelteKit + Tailwind CSS architecture'
				]
			},
			iwa001: {
				title: 'Collateralized Loan System (IWA001)',
				subtitle: 'Secured Loan Processing & Management Platform',
				desc: 'A production-grade collateralized loan management platform handling complex business logic for secured loan approval workflows. Features multi-layered security with Row Level Security (RLS) on Supabase PostgreSQL, JWT-based token authentication, and role-based access control across 17 comprehensive pages including a full Admin Panel.',
				features: [
					'Row Level Security (RLS) policies at the Supabase PostgreSQL database layer',
					'JWT authentication, role-based access control (RBAC) & session validation',
					'17 complete UI pages including a dedicated administrative management console',
					'Complex business rules engine: eligibility calculation, repayment schedules & collateral tracking',
					'Production deployment on Vercel Edge with custom GoDaddy domain management'
				]
			},
			onboardx: {
				title: 'Onboardx Enterprise Mobility System',
				subtitle: 'Enterprise Employee Onboarding Platform (TNB)',
				desc: 'A comprehensive enterprise mobile and web platform streamlining employee onboarding workflows for Tenaga Nasional Berhad (TNB). Coordinates profile verification, document submission, and training task completion with real-time multi-database synchronization across Firebase, MongoDB, Supabase, and MySQL hosted on Azure.',
				features: [
					'Full-stack cross-platform application developed with Flutter (Web & Mobile)',
					'Multi-database architecture: Firebase Realtime DB, MongoDB, Supabase, MySQL',
					'Microsoft Azure Ubuntu server infrastructure secured with Network Security Groups (NSG)',
					'Automated CI/CD build pipelines using Jenkins & container orchestration via Kubernetes',
					'Interactive UI/UX prototypes designed in Figma and transformed into production code'
				]
			},
			infinity: {
				title: 'Infinity World Corporate Portal & i18n Engine',
				subtitle: 'Multilingual Corporate Platform with Svelte Store i18n',
				desc: 'A premium corporate web portal featuring a reactive Svelte store-based internationalization architecture supporting 3 languages (EN/BM/ZH) with zero-refresh dynamic content switching. Includes a Redis-backed subscriber blog engine, automated email delivery via Resend API, and GoDaddy DNS infrastructure.',
				features: [
					'Reactive Svelte store i18n system delivering 3 languages (EN, BM, ZH) seamlessly',
					'Redis-backed subscriber storage and blog caching system',
					'Automated transactional and newsletter email integration via Resend API',
					'High-performance deployment on Vercel Edge network with sub-second TTFB',
					'Corporate domain and DNS management via GoDaddy'
				]
			},
			fyp: {
				title: 'Geospatial Reporting Management System (UTM)',
				subtitle: 'Final Year Project (B.Sc. Computer Science UTM)',
				desc: 'A comprehensive campus reporting management system centered on real-time geospatial visualization powered by Google Maps JavaScript API. Allows users to submit, track, and manage location-tagged incident reports with marker clustering, heatmaps, and geofenced zones.',
				features: [
					'Google Maps API integration: GPS coordinates, marker clustering & live status indicators',
					'Location-based incident submission, workflow tracking, and administrative triage',
					'Supabase PostgreSQL database backend with data validation constraints',
					'Interactive map interface with multi-category filters and responsive drawer controls',
					'End-to-end design from Figma wireframes to production deployment'
				]
			},

			// Simulations, Physics & Tooling
			foony_9ball: {
				title: 'Foony 9-Ball Master — Physics Extension',
				subtitle: 'Chromium Browser Extension & Real-Time Billiards Physics Engine',
				desc: 'A high-performance Chromium extension (Manifest V3) that simulates billiards game physics in real time. Features a 2D vector physics engine on HTML5 Canvas, WebSocket packet interception for game table states, multi-rebound cushion trajectory calculation, and dynamic ball path projection.',
				features: [
					'Custom 2D vector physics engine calculating elastic ball collisions',
					'Real-time WebSocket hook intercepting table coordinate telemetry non-intrusively',
					'Multi-rebound rail reflection and pocket entry angle trajectory projection',
					'Dark sci-fi HUD popup overlay with adjustable physics prediction parameters',
					'Complies strictly with Chromium Extension Manifest V3 security standards'
				]
			},
			orbit_pulse: {
				title: 'Orbit Pulse — Server Infrastructure Monitor',
				subtitle: 'Real-Time Server Health & Network Telemetry Dashboard',
				desc: 'A lightweight infrastructure monitoring utility tracking ping latency, HTTP transmission success rates, and host CPU/memory loads. Enhanced with an animated sci-fi cardiac pulse visualizer and automated system anomaly triggers.',
				features: [
					'Continuous latency tracking and service availability monitoring',
					'Animated pulse visualizer inspired by sci-fi telemetry dashboards',
					'Automated anomaly alerts triggered when error thresholds are exceeded',
					'Efficient local metrics store without generating overhead on target systems',
					'Responsive dark-mode interface optimized for Network Operations Center (NOC) displays'
				]
			},
			focus_board: {
				title: 'Focus Board — Modular Productivity Kanban',
				subtitle: 'Focused Task Management & Local Workflow State Machine',
				desc: 'A modular productivity application blending Kanban boards with deep-work focus intervals. Features an integrated rhythmic Pomodoro timer, tiered priority filtering, and zero-dependency local browser persistence.',
				features: [
					'Fluid drag-and-drop column state management with zero UI stutter',
					'Integrated rhythmic Pomodoro timer tracking uninterrupted deep work sessions',
					'Local-first data persistence guaranteeing complete user privacy',
					'Color-coded priority tagging and daily completion trend analytics',
					'Distraction-free dark minimalist interface built for high developer focus'
				]
			},
			sudoku: {
				title: 'Sudoku Solver & Brave Browser Extension',
				subtitle: 'Procedural Logic Puzzle Generator & Recursive Backtracking Solver',
				desc: 'An interactive web application and Brave/Chromium browser extension featuring procedural Sudoku puzzle generation across multiple difficulties, a lightning-fast recursive backtracking solver, and a clean dark HUD interface.',
				features: [
					'Autonomous puzzle generator guaranteeing a single unique solution',
					'Lightning-fast recursive backtracking solver algorithm',
					'Chromium browser extension with instant toolbar drawer access',
					'Automatic game state persistence and high-score elapsed time tracker',
					'Clean minimalist UI engineered with zero external library overhead'
				]
			}
		},

		// Skills
		skills: {
			label: 'Technical Expertise',
			title: 'Technical Arsenal & Mastery',
			desc: 'Multi-disciplinary capabilities spanning full-stack development, desktop automation, cloud architecture, and cybersecurity',
			frontend: 'Frontend, Mobile & 3D',
			backend: 'Backend & Cloud Computing',
			security: 'Network Security & DevOps',
			excellent_label: 'Core Mastery',
			tools_label: 'DevOps & Tooling',
			certs_label: 'Cisco Certifications & Technical Courses',
			edu_label: 'Academic Education',
			fyp_label: 'Final Year Project',
			bachelor: "Bachelor's Degree",
			diploma: 'Diploma',
			cgpa: 'CGPA',
			courses_label: 'Core Relevant Courses'
		},

		// Education
		edu: {
			degree: {
				title: 'Bachelor of Computer Science',
				major: 'Network Security',
				period: '2021 – 2024',
				fyp_title: 'Geospatial Reporting Management System for UTM',
				fyp_desc:
					'Comprehensive campus incident reporting system featuring real-time Google Maps geospatial clustering, SvelteKit, Tailwind CSS, and Supabase.',
				courses: [
					{
						name: 'Ethical Hacking & Penetration Testing',
						detail:
							'Hands-on Red Team security exercises with Metasploit, Nmap, Burp Suite, and exploit payloads'
					},
					{
						name: 'Cybersecurity Governance & Compliance',
						detail:
							'In-depth study of ISO 27001, NIST frameworks, and organizational security policies'
					},
					{
						name: 'Advanced Network Security',
						detail:
							'Hands-on firewall rules, IPsec VPNs, ACLs, Snort IDS/IPS, and Wireshark packet dissection'
					}
				]
			},
			diploma: {
				title: 'Diploma in Computer Science',
				major: 'Computer Science (Software Engineering)',
				period: '2017 – 2020',
				fyp_title: 'E-Commerce Platform (Eshop)',
				fyp_desc:
					'Complete e-commerce platform with customer authentication, MySQL relational schema, and Azure Ubuntu deployment.',
				courses: [
					{
						name: 'Object-Oriented Programming (C# .NET)',
						detail:
							'Desktop application development covering encapsulation, inheritance & polymorphism'
					},
					{
						name: 'Structured Programming (C++)',
						detail: 'Memory data structures, pointers, loops, algorithmic efficiency & computation'
					},
					{
						name: 'Java Programming & Networking',
						detail: 'Network sockets, multithreading, and client-server architectures'
					}
				]
			}
		},

		// Contact
		contact: {
			label: 'Contact Me',
			title: "Let's Connect & Collaborate",
			desc: 'Available for full-time opportunities, enterprise contracts, or technical consultations',
			intro_title: 'Ready to build high-impact solutions?',
			intro_desc:
				'Whether you require high-security enterprise systems, scalable cloud platforms, or advanced computer vision automation — I bring dedicated craftsmanship, technical depth, and professional rigor.',
			avail_status: 'Available Now',
			avail_sub: 'Open to Full-Time, Contract & Freelance Opportunities',
			form_title: 'Send a Direct Message',
			name_label: 'Full Name',
			name_placeholder: 'Your name or organization',
			email_label: 'Email Address',
			email_placeholder: 'you@organization.com',
			subject_label: 'Subject',
			subject_placeholder: 'Project collaboration / Career opportunity',
			msg_label: 'Message',
			msg_placeholder: 'Tell me about your project requirements or the opportunity...',
			send_btn: 'Send Message Now',
			sending: 'Transmitting...',
			success_title: 'Transmission Received!',
			success_msg:
				'Thank you for getting in touch. I will review your inquiry and respond within 24 hours.',
			send_another: 'Send Another Message'
		},

		// Footer
		footer: {
			sub: 'Muhammed Munir Bin Mohd Azmi · Full-Stack Developer · Network Security Specialist',
			copy: 'All rights reserved. Engineered with SvelteKit 5, TypeScript, Tailwind & GSAP.'
		},

		// JARVIS AI System
		jarvis: {
			hud_badge: 'J.A.R.V.I.S · NEURAL ASSISTANT',
			status_title: 'JARVIS CORE ACTIVE · BILINGUAL ENG & MALAY',
			telemetry: 'SYSTEM: OPTIMAL · TELEMETRY: 18+ SYSTEMS · LOCATION: PUCHONG, SELANGOR',
			greeting:
				"Greetings! I am J.A.R.V.I.S — the neural interface for Muhammed Munir's portfolio. I am fully fluent in both Bahasa Melayu and English. I am ready to walk you through Munir's 3 government enterprise systems, 15+ innovation apps, ecosystem telemetry, or download his ATS Resume. How may I assist you today?",
			input_placeholder: 'Ask me anything in English or Malay, or choose a prompt...',
			sound_on: 'Audio: ON',
			sound_off: 'Audio: MUTED',
			voice_on: 'AI Voice: ON',
			voice_off: 'AI Voice: MUTED',
			listen_btn: '🔊 Listen to Voice',
			close_btn: 'Close HUD [ESC]',
			chips: [
				{ label: '📊 System Telemetry & Stats', query: 'statistics' },
				{ label: '🏛️ Public Sector Projects Count', query: 'how many government projects' },
				{ label: '📍 Location & Base', query: 'where does he live' },
				{ label: '🎓 Education & Degree', query: 'education' },
				{ label: '💼 Career Trajectory', query: 'pengalaman' },
				{ label: '📱 Mobile & Web Apps', query: 'aplikasi' },
				{ label: '🤖 AI & Autonomous Agents', query: 'ai' },
				{ label: '📄 Download ATS Resume', query: 'resume' },
				{ label: '📞 Contact Munir', query: 'hubungi' }
			]
		}
	}
} as const;

export type Translations = typeof translations;
export type LangKey = keyof Translations;
