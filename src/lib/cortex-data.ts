import type { Lang } from '$lib/i18n';
import { translations } from '$lib/translations';

// Read-only facts from Projects.svelte and translations.ts, not live service observations.
export const cortexProjects = [
	{ key: 'emesys', aliases: ['emesys'], stack: 'Vue.js 3 · Laravel 11 · MariaDB · Docker Swarm' },
	{
		key: 'sutera',
		aliases: ['sutera'],
		stack: 'Vue.js 3 · Laravel 11 · PostgreSQL 17 · Docker · Redis'
	},
	{
		key: 'adims',
		aliases: ['adims'],
		stack: 'Laravel 12 · PHP 8.5 · Horizon · S3 · QR · Google 2FA'
	},
	{
		key: 'tindak',
		aliases: ['tindak'],
		stack: 'Flutter · Android Share Intent · Gemini · Supabase RLS'
	},
	{
		key: 'nine_router',
		aliases: ['9router', 'nine router'],
		stack: 'Node.js · Three.js · MCP · Playwright'
	},
	{
		key: 'cv_bot',
		aliases: ['cv bot', 'computer vision', 'opencv'],
		stack: 'Python · OpenCV · Win32 · SIFT · CIELAB'
	},
	{ key: 'baby_kicking', aliases: ['baby', 'kicking'], stack: 'Flutter · Dart · Firebase · PDF' },
	{
		key: 'tax_relief',
		aliases: ['tax relief', 'cukai'],
		stack: 'Node.js · TypeScript · LHDN tax engine'
	},
	{ key: 'jiofarm', aliases: ['jiofarm'], stack: 'Python FastAPI · IoT · Soil moisture tracking' },
	{
		key: 'lumina',
		aliases: ['lumina'],
		stack: 'SvelteKit · Laravel 11 API · LED visualizer · PHPUnit'
	},
	{
		key: 'foony_9ball',
		aliases: ['foony', '9ball', '9-ball'],
		stack: 'Manifest V3 · Canvas 2D · Collision geometry'
	},
	{
		key: 'iwa001',
		aliases: ['iwa001', 'pinjaman'],
		stack: 'SvelteKit 2 · TypeScript · Supabase RLS · JWT · Vercel'
	},
	{
		key: 'onboardx',
		aliases: ['onboardx'],
		stack: 'Flutter · Firebase · MongoDB · Azure · Jenkins'
	},
	{ key: 'infinity', aliases: ['infinity'], stack: 'SvelteKit · i18n · Redis · Resend · Vercel' },
	{
		key: 'orbit_pulse',
		aliases: ['orbitpulse', 'orbit pulse'],
		stack: 'Server health tracking · Latency tracker · Threshold alarms'
	},
	{
		key: 'focus_board',
		aliases: ['focusboard', 'focus board'],
		stack: 'Kanban · Pomodoro · Local state machine'
	},
	{
		key: 'sudoku',
		aliases: ['sudoku'],
		stack: 'Procedural generator · Backtracking · Chromium extension'
	},
	{
		key: 'fyp',
		aliases: ['fyp', 'crime', 'jenayah'],
		stack: 'SvelteKit · Google Maps · Supabase PostgreSQL · Marker clustering'
	}
] as const;

export type ProjectKey = (typeof cortexProjects)[number]['key'];
export type TraceKey = 'emesys' | 'sutera' | 'adims';
export type Answer = {
	text: string;
	action?: 'projects' | 'experience' | 'skills' | 'contact' | 'resume';
};

export const cortexCopy = {
	en: {
		open: 'Open Neural Cortex Console',
		close: 'Close console',
		title: 'Neural Cortex',
		subtitle: 'Muhammed Munir / Portfolio console',
		query: 'Neural Query',
		trace: 'Architecture Trace',
		cli: 'Executive CLI',
		modes: 'Console modes',
		local: 'LOCAL KEYWORD ASSISTANT',
		disclosure:
			'Curated portfolio answers, matched locally by keywords. Not an LLM. No query is sent to an AI service.',
		welcome:
			'Welcome to the cortex. Explore Munir’s public-sector systems, mobile applications and engineering background. Ask about a project, experience, education, skills or the ATS resume.',
		queryTitle: 'Follow a question.',
		querySub: 'Find the engineering behind the work.',
		traceTitle: 'Follow the architecture.',
		traceSub: 'Documented technologies. One project at a time.',
		cliTitle: 'A direct line to the work.',
		cliSub: 'Local commands. No shell access.',
		voice: 'Speech',
		sound: 'Sound',
		on: 'On',
		off: 'Off',
		unsupported: 'Speech unavailable in this browser',
		listen: 'Listen to answer',
		stop: 'Stop speech',
		speaking: 'Speaking',
		you: 'You',
		assistant: 'Cortex / Local index',
		shortcuts: 'Quick queries',
		send: 'Send',
		input: 'Ask a portfolio question',
		placeholder: 'e.g. What did Munir build at YHCM?',
		command: 'Enter a command',
		cliPlaceholder: 'help · projects · trace sutera',
		cliWelcome:
			'Executive CLI — local portfolio command index. Type help to see commands. Nothing here executes on your device.',
		cliHelp:
			'help — show this index\nprojects — list portfolio projects\nexperience — career overview\nskills — technical toolkit\nresume — PDF download\ncontact — contact details\nclear — clear this transcript\ntrace [emesys|sutera|adims] — open Architecture Trace',
		unknown: 'Command not found. Type help for the supported commands.',
		invalidTrace: 'Unknown trace. Use trace emesys, trace sutera or trace adims.',
		cleared: 'Transcript cleared. Type help to start again.',
		traced: 'Architecture Trace opened for',
		select: 'Select a documented project',
		frontend: 'Interface',
		backend: 'Application',
		database: 'Data',
		deployment: 'Deployment',
		undocumented: 'Not specified',
		traceNote:
			'Conceptual stack path, not a network topology or a live request. Only technologies named in this portfolio are shown.',
		evidence: 'Portfolio evidence',
		source: 'Source: project descriptions and technology tags in this portfolio.',
		adimsNote:
			'ADIMS lists Laravel 12, Horizon, QR verification, S3 storage and Google 2FA. Its frontend framework, relational database and deployment runtime are not named in the project tags.',
		schematic: 'Illustrative neural schematic / not live telemetry',
		scope: 'CURATED KNOWLEDGE',
		scopeBody:
			'Projects, professional experience and technical decisions. No fabricated service metrics.',
		keyboard: 'Ctrl / ⌘ K or J to toggle · Esc to close',
		resume: 'Download ATS resume',
		projects: 'Explore projects',
		experience: 'View experience',
		skills: 'View skills',
		contact: 'Contact Munir',
		language: 'Console language',
		clear: 'Clear transcript',
		languageAnswer:
			'This console supports Bahasa Melayu and English. Use the BM / EN buttons to change the interface and future answers.',
		fallback:
			'No curated match found. This local keyword assistant cannot infer new facts. Try a project name, education, location, skills, experience, contact or resume.',
		diagnostics:
			'This console does not monitor production services. Its diagrams are illustrative; it cannot verify uptime, performance or compliance.',
		profile:
			'Muhammed Munir Bin Mohd Azmi is a Full-Stack Developer & IT Professional based in Puchong, Selangor, Malaysia. His work spans public-sector platforms at YHCM, web development at Nova Bitara and mobile development and cybersecurity experience at TNB.',
		location:
			'Based in Puchong, Selangor, Malaysia. Contact Munir directly to discuss on-site, hybrid or remote arrangements and current availability.',
		education:
			'Universiti Teknologi Malaysia (UTM) — B.Sc. Computer Science (Network Security), CGPA 3.17. His final-year project used SvelteKit, Google Maps marker clustering and Supabase PostgreSQL for spatial crime mapping.',
		contactText:
			'Phone / WhatsApp: +6013-5636124\nEmail: muhammed.munir97.mm@gmail.com\nLinkedIn: linkedin.com/in/muhammed-munir\nGitHub: github.com/muhammedmunir\nBased in Puchong, Selangor.',
		availability:
			'For current availability, notice period, salary expectations or an interview, contact Munir directly. This local portfolio index does not verify live hiring status.',
		languages: 'Bahasa Melayu — native proficiency. English — professional working proficiency.',
		birth: 'Munir’s birth year is 1997. For professional background, see his experience or resume.',
		experienceText:
			'YHCM Sdn Bhd — Full-Stack Enterprise Programmer: eMesys, Sutera and ADIMS; Vue 3, Laravel, databases, Docker and server administration.\n\nNova Bitara Development — IT Support & Web Developer: IWA001 loan platform and Infinity World corporate portal.\n\nTenaga Nasional Berhad (TNB) — Onboardx mobile development with Flutter/Azure and cybersecurity experience with Splunk SIEM and Vulhub CVE labs.',
		skillsText:
			'Frontend & mobile: Vue.js 3, SvelteKit, Svelte 5, Flutter/Dart, React, Three.js and Tailwind CSS.\n\nBackend & data: Laravel 11/12, PHP, Node.js, Python, PostgreSQL, MariaDB/MySQL, Supabase, Firebase, MongoDB and Redis.\n\nInfrastructure & security: Docker Swarm, Linux, Azure, Jenkins CI/CD, Git, RBAC, SSO, 2FA and Splunk SIEM.',
		security:
			'Network Security graduate from UTM, with Splunk SIEM monitoring experience at TNB and Vulhub CVE lab work. Portfolio projects include RBAC, SSO, 2FA and Supabase RLS. This describes experience and features, not a compliance certification.',
		resumeText: 'Muhammed Munir’s ATS resume is available as a PDF. Use the download link below.',
		publicText:
			'Three documented public-sector / enterprise platforms at YHCM: eMesys (asset lifecycle and logistics), Sutera (operations and maintenance), and ADIMS (digital records and QR verification). Explore Architecture Trace for their documented stack paths.',
		projectsText:
			'The portfolio lists 18 projects across public-sector / enterprise, AI and automation, mobile, web and simulation categories. This is a curated project index, not a count of currently running production services.',
		mobileText:
			'Mobile work includes Baby Kicking Suite (Flutter, Firebase and PDF exports), TINDAK (Android Share Intent, local parsing, Gemini fallback and Supabase), and TNB Onboardx (Flutter, Azure and Jenkins). JioFarm covers Python FastAPI and agriculture IoT monitoring.',
		aiText:
			'9Router Office combines Node.js, Three.js, MCP and multi-agent orchestration. Computer Vision Bot uses Python, OpenCV, SIFT, CIELAB and Win32. TINDAK combines local-first parsing with a Gemini fallback.',
		simulation:
			'Simulation and algorithm projects include Foony 9-Ball (Canvas 2D and collision geometry), Sudoku (procedural generation and backtracking) and OrbitPulse (server monitoring tools). Explore their entries in the projects section.'
	},
	ms: {
		open: 'Buka Konsol Neural Cortex',
		close: 'Tutup konsol',
		title: 'Neural Cortex',
		subtitle: 'Muhammed Munir / Konsol portfolio',
		query: 'Neural Query',
		trace: 'Architecture Trace',
		cli: 'Executive CLI',
		modes: 'Mod konsol',
		local: 'PEMBANTU KATA KUNCI SETEMPAT',
		disclosure:
			'Jawapan portfolio terpilih dipadankan melalui kata kunci secara setempat. Bukan LLM. Tiada pertanyaan dihantar ke perkhidmatan AI.',
		welcome:
			'Selamat datang ke cortex. Terokai sistem sektor awam, aplikasi mudah alih dan latar belakang kejuruteraan Munir. Tanya tentang projek, pengalaman, pendidikan, kemahiran atau resume ATS.',
		queryTitle: 'Susuri pertanyaan.',
		querySub: 'Kenali kejuruteraan di sebalik hasil kerja.',
		traceTitle: 'Susuri seni bina.',
		traceSub: 'Teknologi yang didokumenkan, satu projek pada satu masa.',
		cliTitle: 'Akses terus kepada hasil kerja.',
		cliSub: 'Arahan setempat. Tiada akses shell.',
		voice: 'Suara',
		sound: 'Bunyi',
		on: 'Aktif',
		off: 'Tutup',
		unsupported: 'Suara tidak tersedia dalam pelayar ini',
		listen: 'Dengar jawapan',
		stop: 'Hentikan suara',
		speaking: 'Sedang bertutur',
		you: 'Anda',
		assistant: 'Cortex / Indeks setempat',
		shortcuts: 'Pertanyaan pantas',
		send: 'Hantar',
		input: 'Tanya soalan portfolio',
		placeholder: 'cth. Apakah yang Munir bangunkan di YHCM?',
		command: 'Masukkan arahan',
		cliPlaceholder: 'help · projects · trace sutera',
		cliWelcome:
			'Executive CLI — indeks arahan portfolio setempat. Taip help untuk senarai arahan. Tiada arahan dilaksanakan pada peranti anda.',
		cliHelp:
			'help — paparkan indeks ini\nprojects — senarai projek portfolio\nexperience — ringkasan kerjaya\nskills — kemahiran teknikal\nresume — muat turun PDF\ncontact — maklumat perhubungan\nclear — kosongkan transkrip\ntrace [emesys|sutera|adims] — buka Architecture Trace',
		unknown: 'Arahan tidak ditemui. Taip help untuk senarai arahan yang disokong.',
		invalidTrace: 'Jejak tidak dikenali. Gunakan trace emesys, trace sutera atau trace adims.',
		cleared: 'Transkrip dikosongkan. Taip help untuk bermula semula.',
		traced: 'Architecture Trace dibuka untuk',
		select: 'Pilih projek yang didokumenkan',
		frontend: 'Antara muka',
		backend: 'Aplikasi',
		database: 'Data',
		deployment: 'Deployment',
		undocumented: 'Tidak dinyatakan',
		traceNote:
			'Laluan teknologi konseptual, bukan topologi rangkaian atau permintaan langsung. Hanya teknologi yang dinamakan dalam portfolio dipaparkan.',
		evidence: 'Bukti portfolio',
		source: 'Sumber: penerangan projek dan tag teknologi dalam portfolio ini.',
		adimsNote:
			'ADIMS menyenaraikan Laravel 12, Horizon, pengesahan QR, storan S3 dan Google 2FA. Framework frontend, pangkalan data relasi dan runtime deployment tidak dinamakan dalam tag projek.',
		schematic: 'Skema neural ilustratif / bukan telemetri langsung',
		scope: 'PENGETAHUAN TERPILIH',
		scopeBody:
			'Projek, pengalaman profesional dan keputusan teknikal. Tiada metrik perkhidmatan rekaan.',
		keyboard: 'Ctrl / ⌘ K atau J untuk buka/tutup · Esc untuk tutup',
		resume: 'Muat turun resume ATS',
		projects: 'Terokai projek',
		experience: 'Lihat pengalaman',
		skills: 'Lihat kemahiran',
		contact: 'Hubungi Munir',
		language: 'Bahasa konsol',
		clear: 'Kosongkan transkrip',
		languageAnswer:
			'Konsol ini menyokong Bahasa Melayu dan Inggeris. Gunakan butang BM / EN untuk menukar antara muka dan jawapan seterusnya.',
		fallback:
			'Tiada padanan dalam jawapan terpilih. Pembantu kata kunci setempat ini tidak boleh membuat inferens fakta baharu. Cuba nama projek, pendidikan, lokasi, kemahiran, pengalaman, hubungi atau resume.',
		diagnostics:
			'Konsol ini tidak memantau perkhidmatan produksi. Rajahnya bersifat ilustratif; ia tidak boleh mengesahkan uptime, prestasi atau pematuhan.',
		profile:
			'Muhammed Munir Bin Mohd Azmi ialah Pembangun Full-Stack & Profesional IT yang berpangkalan di Puchong, Selangor, Malaysia. Hasil kerjanya merangkumi platform sektor awam di YHCM, pembangunan web di Nova Bitara serta pembangunan mudah alih dan pengalaman keselamatan siber di TNB.',
		location:
			'Berpangkalan di Puchong, Selangor, Malaysia. Hubungi Munir terus untuk membincangkan aturan kerja di pejabat, hibrid atau jarak jauh dan ketersediaan semasa.',
		education:
			'Universiti Teknologi Malaysia (UTM) — Ijazah Sarjana Muda Sains Komputer (Keselamatan Rangkaian), PNGK 3.17. Projek tahun akhirnya menggunakan SvelteKit, pengelompokan penanda Google Maps dan Supabase PostgreSQL untuk pemetaan jenayah spatial.',
		contactText:
			'Telefon / WhatsApp: +6013-5636124\nE-mel: muhammed.munir97.mm@gmail.com\nLinkedIn: linkedin.com/in/muhammed-munir\nGitHub: github.com/muhammedmunir\nBerpangkalan di Puchong, Selangor.',
		availability:
			'Untuk ketersediaan semasa, tempoh notis, jangkaan gaji atau temu duga, hubungi Munir terus. Indeks portfolio setempat ini tidak mengesahkan status pengambilan kerja secara langsung.',
		languages: 'Bahasa Melayu — bahasa ibunda. Bahasa Inggeris — penguasaan kerja profesional.',
		birth:
			'Tahun kelahiran Munir ialah 1997. Untuk latar belakang profesional, lihat pengalaman atau resume beliau.',
		experienceText:
			'YHCM Sdn Bhd — Full-Stack Enterprise Programmer: eMesys, Sutera dan ADIMS; Vue 3, Laravel, pangkalan data, Docker dan pentadbiran pelayan.\n\nNova Bitara Development — IT Support & Web Developer: sistem pinjaman IWA001 dan portal korporat Infinity World.\n\nTenaga Nasional Berhad (TNB) — pembangunan Onboardx dengan Flutter/Azure serta pengalaman keselamatan siber melalui Splunk SIEM dan makmal Vulhub CVE.',
		skillsText:
			'Frontend & mudah alih: Vue.js 3, SvelteKit, Svelte 5, Flutter/Dart, React, Three.js dan Tailwind CSS.\n\nBackend & data: Laravel 11/12, PHP, Node.js, Python, PostgreSQL, MariaDB/MySQL, Supabase, Firebase, MongoDB dan Redis.\n\nInfrastruktur & keselamatan: Docker Swarm, Linux, Azure, Jenkins CI/CD, Git, RBAC, SSO, 2FA dan Splunk SIEM.',
		security:
			'Graduan Keselamatan Rangkaian UTM dengan pengalaman pemantauan Splunk SIEM di TNB dan makmal Vulhub CVE. Projek portfolio merangkumi RBAC, SSO, 2FA dan Supabase RLS. Ini menerangkan pengalaman dan ciri, bukan pensijilan pematuhan.',
		resumeText:
			'Resume ATS Muhammed Munir tersedia dalam format PDF. Gunakan pautan muat turun di bawah.',
		publicText:
			'Tiga platform sektor awam / perusahaan didokumenkan di YHCM: eMesys (kitaran hayat aset dan logistik), Sutera (operasi dan penyelenggaraan), serta ADIMS (rekod digital dan pengesahan QR). Terokai Architecture Trace untuk laluan teknologi yang didokumenkan.',
		projectsText:
			'Portfolio menyenaraikan 18 projek dalam kategori sektor awam / perusahaan, AI dan automasi, mudah alih, web dan simulasi. Ini ialah indeks projek terpilih, bukan bilangan perkhidmatan produksi yang sedang berjalan.',
		mobileText:
			'Hasil kerja mudah alih merangkumi Baby Kicking Suite (Flutter, Firebase dan eksport PDF), TINDAK (Android Share Intent, pemprosesan setempat, sandaran Gemini dan Supabase), serta Onboardx TNB (Flutter, Azure dan Jenkins). JioFarm melibatkan Python FastAPI dan pemantauan IoT pertanian.',
		aiText:
			'9Router Office menggabungkan Node.js, Three.js, MCP dan orkestrasi berbilang ejen. Computer Vision Bot menggunakan Python, OpenCV, SIFT, CIELAB dan Win32. TINDAK menggabungkan pemprosesan setempat dengan sandaran Gemini.',
		simulation:
			'Projek simulasi dan algoritma merangkumi Foony 9-Ball (Canvas 2D dan geometri perlanggaran), Sudoku (penjanaan prosedur dan backtracking), serta OrbitPulse (alat pemantauan pelayan). Terokai butirannya di bahagian projek.'
	}
};

export function projectEvidence(key: ProjectKey, language: Lang) {
	return translations[language].projects[key];
}

export function projectList(language: Lang): string {
	return cortexProjects
		.map((p) => `${projectEvidence(p.key, language).title}\n${p.stack}`)
		.join('\n\n');
}

export function localAnswer(raw: string, language: Lang): Answer {
	const q = raw.toLocaleLowerCase().trim();
	const c = cortexCopy[language];
	const has = (...terms: string[]) => terms.some((term) => q.includes(term));
	const words = (...terms: string[]) =>
		terms.some((term) => new RegExp(`\\b${term}\\b`, 'i').test(q));
	const project = cortexProjects.find((p) => p.aliases.some((alias) => q.includes(alias)));
	if (project) {
		const evidence = projectEvidence(project.key, language);
		return {
			text: `${evidence.title}\n\n${evidence.desc}\n\n${evidence.features.map((f) => `• ${f}`).join('\n')}\n\n${project.stack}`,
			action: 'projects'
		};
	}
	if (has('resume', 'résumé', 'muat turun', 'download', 'dossier') || q === 'cv')
		return { text: c.resumeText, action: 'resume' };
	if (
		has(
			'contact',
			'hubungi',
			'phone',
			'telefon',
			'nombor',
			'whatsapp',
			'wasap',
			'email',
			'e-mel',
			'emel',
			'linkedin',
			'github',
			'reach'
		)
	)
		return { text: c.contactText, action: 'contact' };
	if (
		has(
			'tinggal',
			'lokasi',
			'location',
			'puchong',
			'selangor',
			'alamat',
			'address',
			'where live',
			'based',
			'asal'
		)
	)
		return { text: c.location, action: 'contact' };
	if (
		has(
			'belajar',
			'universiti',
			'university',
			'utm',
			'degree',
			'ijazah',
			'cgpa',
			'pngk',
			'pendidikan',
			'education',
			'kelulusan',
			'graduate',
			'study'
		)
	)
		return { text: c.education, action: 'skills' };
	if (
		has(
			'available',
			'tersedia',
			'hire',
			'ambil kerja',
			'kerja kosong',
			'bila boleh',
			'interview',
			'temuduga',
			'temu duga',
			'gaji',
			'salary',
			'notice',
			'notis'
		)
	)
		return { text: c.availability, action: 'contact' };
	if (has('bahasa melayu', 'cakap bm', 'melayu', 'english')) return { text: c.languageAnswer };
	if (has('bahasa', 'languages spoken', 'pertuturan')) return { text: c.languages };
	if (words('age', 'umur', 'lahir', 'birthday', 'birth')) return { text: c.birth };
	if (has('diag', 'telemetry', 'telemetri', 'uptime', 'performance', 'prestasi', 'compliant'))
		return { text: c.diagnostics };
	if (has('kerajaan', 'kerjaan', 'government', 'sektor awam', 'public sector', 'yhcm'))
		return { text: c.publicText, action: 'projects' };
	if (
		has(
			'pengalaman',
			'experience',
			'tempat kerja',
			'syarikat',
			'company',
			'tnb',
			'nova bitara',
			'sejarah kerja'
		)
	)
		return { text: c.experienceText, action: 'experience' };
	if (has('security', 'keselamatan', 'splunk', 'cyber', 'soc'))
		return { text: c.security, action: 'skills' };
	if (
		has(
			'skills',
			'tech',
			'kemahiran',
			'stack',
			'framework',
			'laravel',
			'vue',
			'svelte',
			'flutter',
			'dart',
			'docker',
			'swarm',
			'kontena',
			'python',
			'database',
			'pangkalan data',
			'sql',
			'postgres',
			'redis'
		)
	)
		return { text: c.skillsText, action: 'skills' };
	if (has('mobile', 'mudah alih', 'aplikasi')) return { text: c.mobileText, action: 'projects' };
	if (words('ai', 'agent', 'agents', 'ejen', 'gemini', 'mcp'))
		return { text: c.aiText, action: 'projects' };
	if (has('game', 'permainan', 'simulat', 'city', 'rpg'))
		return { text: c.simulation, action: 'projects' };
	if (has('projek', 'project', 'jumlah', 'berapa', 'how many', 'statistik', 'stats', 'statistic'))
		return { text: `${c.projectsText}\n\n${projectList(language)}`, action: 'projects' };
	if (
		has('siapa', 'who', 'about', 'profil', 'biodata', 'summary', 'ringkasan') ||
		words('hello', 'hi', 'hai', 'salam', 'assalamualaikum')
	)
		return { text: c.profile };
	return { text: c.fallback };
}

export function traceNodes(key: TraceKey, language: Lang) {
	const c = cortexCopy[language];
	const stacks = {
		emesys: ['Vue.js 3', 'Laravel 11', 'MariaDB', 'Docker Swarm'],
		sutera: ['Vue.js 3', 'Laravel 11', 'PostgreSQL 17', 'Docker'],
		adims: [c.undocumented, 'Laravel 12', c.undocumented, c.undocumented]
	};
	return [c.frontend, c.backend, c.database, c.deployment].map((label, index) => ({
		label,
		value: stacks[key][index]
	}));
}
