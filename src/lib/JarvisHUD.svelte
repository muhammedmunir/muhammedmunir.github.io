<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { lang } from '$lib/i18n';
	import { translations } from '$lib/translations';
	import { derived } from 'svelte/store';
	import { playBlip, playConfirm, playScan, playWarp, sfxEnabled, toggleSfx } from '$lib/sound';
	import { goto } from '$app/navigation';

	let isOpen = $state(false);
	let voiceEnabled = $state(true); // Default to true so user gets immediate voice feedback
	let isSpeaking = $state(false);
	let userInput = $state('');
	let messagesContainer = $state<HTMLElement>();

	const t = derived(lang, ($l) => translations[$l].jarvis);

	interface ChatMessage {
		id: number;
		sender: 'jarvis' | 'user';
		text: string;
		spokenText?: string;
		action?: { label: string; href?: string; callback?: () => void };
	}

	let messages = $state<ChatMessage[]>([]);

	function toggleOpen() {
		isOpen = !isOpen;
		if (isOpen) {
			playConfirm();
			if (messages.length === 0) {
				initWelcome();
			}
			setTimeout(() => {
				scrollToBottom();
			}, 60);
		} else {
			stopVoice();
			playBlip(440, 0.05);
		}
	}

	function isMalayQuery(rawText: string): boolean {
		if ($lang === 'ms') return true;
		const lower = rawText.toLowerCase();
		const malayKeywords = [
			'berapa',
			'jumlah',
			'bilangan',
			'projek',
			'kerjaan',
			'kerajaan',
			'sektor',
			'awam',
			'ada',
			'apa',
			'siapa',
			'mana',
			'kenapa',
			'bagaimana',
			'macam',
			'tolong',
			'tunjuk',
			'terang',
			'senarai',
			'boleh',
			'nak',
			'saya',
			'dia',
			'awak',
			'kamu',
			'statistik',
			'statstik',
			'pengalaman',
			'kerja',
			'kemahiran',
			'tentang',
			'salam',
			'hai',
			'selamat',
			'pagi',
			'petang',
			'malam',
			'terima',
			'kasih',
			'muat',
			'turun',
			'resume',
			'cv'
		];
		return malayKeywords.some((w) => lower.includes(w));
	}

	let cachedVoices = $state<SpeechSynthesisVoice[]>([]);

	function updateVoices() {
		if (typeof window === 'undefined' || !window.speechSynthesis) return;
		const v = window.speechSynthesis.getVoices();
		if (v && v.length > 0) {
			cachedVoices = v;
		}
	}

	function cleanSpeechText(text: string): string {
		if (!text) return '';
		let s = text;

		// 1. Remove URLs, email addresses, and asset paths
		s = s.replace(/https?:\/\/\S+/gi, '');
		s = s.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
		s = s.replace(/\/[\w\-./]+\.(pdf|png|jpg|svg|html)/gi, '');

		// 2. Remove all emojis and unicode pictographs
		s = s.replace(
			/[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}]/gu,
			' '
		);

		// 3. Remove Markdown syntax symbols (*, _, #, `, ~)
		s = s.replace(/[*_#`~]/g, ' ');

		// 4. Remove brackets, braces, and parentheses so TTS does not say "left curly bracket" etc.
		s = s.replace(/[{}[\]()<>«»]/g, ' ');

		// 5. Replace colons (:: or :), semicolons, and slashes with natural pause comma/space
		s = s.replace(/::+/g, ' ');
		s = s.replace(/[:;]/g, ', ');
		s = s.replace(/[\\/]/g, ' ');

		// 6. Remove bullets, dashes, ticks, arithmetic and special symbols
		s = s.replace(/[•▸▪▫✓✔★☆►◄◆◇●○—–\-_+=^&%$@|]/g, ' ');

		// 7. Remove quotation marks
		s = s.replace(/["'“”‘’]/g, '');

		// 8. Clean repetitive punctuation
		s = s.replace(/[,.]{2,}/g, '. ');

		// 9. Normalize whitespace
		s = s.replace(/\s+/g, ' ').trim();

		return s;
	}

	function formatMessageHtml(raw: string): string {
		if (!raw) return '';

		// 1. Escape HTML special characters
		let escaped = raw
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');

		// 2. Bold: **text** -> <strong class="hud-bold">text</strong>
		escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong class="hud-bold">$1</strong>');

		// 3. Italic: *text* -> <em class="hud-italic">$1</em>
		escaped = escaped.replace(/\*([^*]+?)\*/g, '<em class="hud-italic">$1</em>');

		// 4. Remove stray backticks
		escaped = escaped.replace(/[`]/g, '');

		// 5. Split by double newlines into paragraphs
		const paragraphs = escaped.split(/\n\n+/);

		const rendered = paragraphs
			.map((para) => {
				const lines = para.split(/\n/);
				const formattedLines = lines.map((line) => {
					const trimmed = line.trim();
					if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('▸')) {
						const content = trimmed.replace(/^[•▸\-]\s*/, '');
						return `<div class="hud-list-item"><span class="hud-bullet" aria-hidden="true">▸</span><span class="hud-list-content">${content}</span></div>`;
					}
					const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
					if (numMatch) {
						return `<div class="hud-list-item"><span class="hud-num">${numMatch[1]}.</span><span class="hud-list-content">${numMatch[2]}</span></div>`;
					}
					return `<div>${line}</div>`;
				});
				return `<div class="hud-para">${formattedLines.join('')}</div>`;
			})
			.join('');

		return rendered;
	}

	function initWelcome() {
		const greetingText =
			$lang === 'ms'
				? 'Protokol J.A.R.V.I.S diaktifkan. Salam sejahtera! Saya pembantu kecerdasan portfolio Muhammed Munir. Saya fasih berbahasa Melayu sepenuhnya. Telemetri sistem sedia: 3 platform sektor awam, 15+ aplikasi inovasi, statistik ekosistem, dan resume ATS. Sila pilih protokol atau taip apa sahaja pertanyaan anda.'
				: "J.A.R.V.I.S Protocol initialized. Greetings! I am the neural assistant for Muhammed Munir's portfolio, fully bilingual in Malay and English. Systems telemetry is online: 3 public-sector platforms, 15+ innovation apps, ecosystem telemetry, and ATS resume. Please choose a protocol or ask any inquiry.";

		const spokenGreeting =
			$lang === 'ms'
				? 'Salam sejahtera. Saya J.A.R.V.I.S, pembantu kecerdasan portfolio Muhammed Munir. Saya sedia membantu anda meneroka projek sektor awam, aplikasi inovasi, statistik sistem, dan resume Munir. Sila pilih arahan atau taipkan pertanyaan anda.'
				: "Greetings. I am J.A.R.V.I.S, neural assistant for Muhammed Munir's portfolio. I am ready to guide you through his public sector systems, innovation apps, telemetry stats, and resume. How may I assist you today?";

		messages = [
			{
				id: Date.now(),
				sender: 'jarvis',
				text: greetingText,
				spokenText: spokenGreeting
			}
		];

		if (voiceEnabled) {
			speak(greetingText, spokenGreeting);
		}
	}

	function getPreferredVoice(isMalay: boolean): SpeechSynthesisVoice | null {
		const voices =
			cachedVoices.length > 0
				? cachedVoices
				: typeof window !== 'undefined' && window.speechSynthesis
					? window.speechSynthesis.getVoices()
					: [];

		if (!voices || voices.length === 0) return null;

		const lowerName = (v: SpeechSynthesisVoice) => v.name.toLowerCase();
		const lowerLang = (v: SpeechSynthesisVoice) => v.lang.toLowerCase();

		const isNatural = (v: SpeechSynthesisVoice) => {
			const n = lowerName(v);
			return (
				n.includes('natural') ||
				n.includes('neural') ||
				n.includes('online') ||
				n.includes('google')
			);
		};

		if (isMalay) {
			// 1. Natural / Neural Malay or Indonesian voice (Edge / Chrome)
			const neuralMsId = voices.find(
				(v) =>
					(lowerLang(v).startsWith('ms') ||
						lowerLang(v).startsWith('id') ||
						lowerLang(v).includes('in_')) &&
					isNatural(v)
			);
			if (neuralMsId) return neuralMsId;

			// 2. Named natural voices containing Malay or Indonesian names
			const namedMsId = voices.find((v) => {
				const n = lowerName(v);
				return (
					(n.includes('malay') ||
						n.includes('indonesia') ||
						n.includes('gadis') ||
						n.includes('siti') ||
						n.includes('yasmin') ||
						n.includes('ardi') ||
						n.includes('osman')) &&
					isNatural(v)
				);
			});
			if (namedMsId) return namedMsId;

			// 3. Any standard Malay or Indonesian voice
			const anyMsId = voices.find(
				(v) =>
					lowerLang(v).startsWith('ms') ||
					lowerLang(v).startsWith('id') ||
					lowerName(v).includes('malay') ||
					lowerName(v).includes('indonesia')
			);
			if (anyMsId) return anyMsId;
		}

		// Fallback for English: Prioritize smooth natural human voices
		const neuralEn = voices.find((v) => {
			const l = lowerLang(v);
			return (l.startsWith('en') || l.includes('us') || l.includes('gb')) && isNatural(v);
		});
		if (neuralEn) return neuralEn;

		const anyEn = voices.find((v) => lowerLang(v).startsWith('en'));
		if (anyEn) return anyEn;

		return voices[0] || null;
	}

	function stopVoice() {
		if (typeof window !== 'undefined' && window.speechSynthesis) {
			window.speechSynthesis.cancel();
			isSpeaking = false;
		}
	}

	function speak(text: string, customSpokenText?: string) {
		if (typeof window === 'undefined' || !window.speechSynthesis) return;
		try {
			window.speechSynthesis.cancel();

			// Use custom spokenText if provided, otherwise clean the main text
			const rawToSpeak =
				customSpokenText && customSpokenText.trim().length > 0
					? customSpokenText
					: text;
			const cleanText = cleanSpeechText(rawToSpeak);
			if (!cleanText) return;

			const utterance = new SpeechSynthesisUtterance(cleanText);

			const isMalay = isMalayQuery(rawToSpeak) || isMalayQuery(text);
			const chosenVoice = getPreferredVoice(isMalay);

			if (chosenVoice) {
				utterance.voice = chosenVoice;
				utterance.lang = chosenVoice.lang;
			} else {
				utterance.lang = isMalay ? 'id-ID' : 'en-US';
			}

			// Calm, composed, human pacing
			utterance.rate = 0.96;
			utterance.pitch = 1.0;
			utterance.volume = 1.0;

			utterance.onstart = () => {
				isSpeaking = true;
			};
			utterance.onend = () => {
				isSpeaking = false;
			};
			utterance.onerror = () => {
				isSpeaking = false;
			};

			window.speechSynthesis.speak(utterance);
		} catch {
			isSpeaking = false;
		}
	}

	function scrollToBottom() {
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}

	function handleCommand(cmd: string) {
		playBlip(700, 0.04);
		const userMsg: ChatMessage = { id: Date.now(), sender: 'user', text: cmd };
		messages = [...messages, userMsg];

		setTimeout(() => {
			executeProtocol(cmd);
			scrollToBottom();
		}, 200);
	}

	function executeProtocol(rawQuery: string) {
		const q = rawQuery.toLowerCase().trim();
		const isMalay = isMalayQuery(rawQuery);
		let reply = '';
		let spokenText = '';
		let action: ChatMessage['action'] = undefined;

		playScan();

		// 1. Language & Identity queries
		if (
			q.includes('cakap melayu') ||
			q.includes('bahasa melayu') ||
			q.includes('cakap bm') ||
			q.includes('melayu') ||
			q.includes('boleh bahasa')
		) {
			reply = isMalay
				? 'Tentu sekali! Saya J.A.R.V.I.S, dan saya fasih berbahasa Melayu sepenuhnya. Anda boleh bertanya tentang lokasi kediaman Munir, kelayakan universiti UTM, statistik sistem, jumlah projek kerajaan (eMesys, Sutera, ADIMS), aplikasi mobile Flutter & AI, pengalaman kerja di YHCM & TNB, atau memuat turun resume ATS. Apa yang anda ingin semak?'
				: 'Absolutely! I am fully fluent in Bahasa Melayu and English. Feel free to ask about Munir\'s location, UTM degree, ecosystem stats, public sector systems, mobile & AI apps, or request his ATS Resume.';
			spokenText = isMalay
				? 'Tentu sekali. Saya fasih berbahasa Melayu sepenuhnya. Anda boleh bertanya tentang lokasi Munir, pendidikan universiti, statistik projek, sistem kerajaan, atau apa sahaja yang anda inginkan.'
				: 'Absolutely. I am fully fluent in both Bahasa Melayu and English. Feel free to ask about Munir\'s background, public sector systems, or resume.';
		}
		// 2. Location & Residence ("di tinggal mana", "dia tinggal mana", "tinggal mana", "kat mana", "tempat tinggal", "asal", "lokasi", "location", "address", "alamat", "puchong", "selangor", "where live", "where does he live")
		else if (
			q.includes('tinggal') ||
			q.includes('lokasi') ||
			q.includes('location') ||
			q.includes('berpangkalan') ||
			q.includes('asal') ||
			q.includes('alamat') ||
			q.includes('address') ||
			q.includes('puchong') ||
			q.includes('selangor') ||
			q.includes('where live') ||
			q.includes('where does he live') ||
			q.includes('where do you live')
		) {
			reply = isMalay
				? '📍 **Lokasi & Kediaman Muhammed Munir:**\n\n' +
				  'Beliau menetap dan berpangkalan di **Puchong, Selangor, Malaysia**.\n\n' +
				  'Ketersediaan mod kerja:\n' +
				  '• 🏢 **Sepenuh Masa / On-site / Hibrid** di sekitar Lembah Klang, Kuala Lumpur, Putrajaya, Cyberjaya & Selangor.\n' +
				  '• 🌐 **Kerja Jarak Jauh (Remote)** untuk seluruh Malaysia atau antarabangsa.\n\n' +
				  'Sedia untuk dihubungi bagi sebarang peluang pekerjaan atau perbincangan projek.'
				: '📍 **Muhammed Munir\'s Location & Work Base:**\n\n' +
				  'He resides and is based in **Puchong, Selangor, Malaysia**.\n\n' +
				  'Work mode availability:\n' +
				  '• 🏢 **Full-time / On-site / Hybrid roles** in Klang Valley, Kuala Lumpur, Putrajaya, Cyberjaya & Selangor.\n' +
				  '• 🌐 **Remote positions** nationwide or worldwide.\n\n' +
				  'Feel free to reach out to schedule an interview or discuss potential collaborations.';
			spokenText = isMalay
				? 'Muhammed Munir menetap dan berpangkalan di Puchong, Selangor. Beliau terbuka untuk peluang kerja secara on-site di sekitar Lembah Klang mahupun secara jarak jauh.'
				: 'Muhammed Munir resides and is based in Puchong, Selangor. He is available for on-site roles across Klang Valley as well as remote positions.';
			action = {
				label: isMalay ? '📞 Hubungi Munir' : '📞 Contact Munir',
				callback: () => {
					isOpen = false;
					window.location.hash = '#contact';
				}
			};
		}
		// 3. Education, University & Degree ("belajar mana", "universiti", "utm", "degree", "ijazah", "cgpa", "pngk", "pendidikan", "education")
		else if (
			q.includes('belajar') ||
			q.includes('universiti') ||
			q.includes('university') ||
			q.includes('utm') ||
			q.includes('degree') ||
			q.includes('ijazah') ||
			q.includes('cgpa') ||
			q.includes('pngk') ||
			q.includes('pendidikan') ||
			q.includes('education') ||
			q.includes('kelulusan') ||
			q.includes('akademik') ||
			q.includes('gpa') ||
			q.includes('graduan') ||
			q.includes('graduate') ||
			q.includes('study')
		) {
			reply = isMalay
				? '🎓 **Kelayakan Akademik & Pendidikan Muhammed Munir:**\n\n' +
				  '• 🏛️ **Universiti**: Universiti Teknologi Malaysia (UTM Skudai, Johor)\n' +
				  '• 📜 **Ijazah**: Ijazah Sarjana Muda Sains Komputer (Keselamatan Rangkaian) / *B.Sc. Computer Science (Network Security)*\n' +
				  '• 🎖️ **Keputusan (PNGK / CGPA)**: **3.17** (Kepujian Kelas Kedua Atas)\n' +
				  '• 🗺️ **Projek Tahun Akhir (FYP)**: Sistem Pemetaan & Analitik Kluster Jenayah menggunakan Google Maps API, SvelteKit, dan Supabase PostgreSQL.\n' +
				  '• 🛡️ **Latihan & Pensijilan**: Pemantauan SOC Splunk SIEM, Simulasi Eksploitasi Vulhub CVE, dan Cisco CCNA.'
				: '🎓 **Muhammed Munir\'s Academic Credentials:**\n\n' +
				  '• 🏛️ **University**: Universiti Teknologi Malaysia (UTM Skudai, Johor)\n' +
				  '• 📜 **Degree**: Bachelor of Science in Computer Science (Network Security)\n' +
				  '• 🎖️ **CGPA**: **3.17** (Second Class Upper Honours)\n' +
				  '• 🗺️ **Final Year Project (FYP)**: Spatial Crime Mapping & Clustering Engine with Google Maps API, SvelteKit, and Supabase PostgreSQL.\n' +
				  '• 🛡️ **Professional Training**: Splunk SOC Threat Monitoring, Vulhub CVE Labs, and Cisco CCNA Fundamentals.';
			spokenText = isMalay
				? 'Munir berkelulusan Ijazah Sarjana Muda Sains Komputer dalam Keselamatan Rangkaian dari Universiti Teknologi Malaysia dengan PNGK 3.17 kepujian kelas kedua atas.'
				: 'Munir graduated with a Bachelor of Science in Computer Science specializing in Network Security from Universiti Teknologi Malaysia, with a 3.17 CGPA.';
			action = {
				label: isMalay ? '🗺️ Lihat Projek FYP' : '🗺️ View FYP Project',
				callback: () => {
					isOpen = false;
					window.location.hash = '#projects';
				}
			};
		}
		// 4. Contact, Phone, WhatsApp, Email, LinkedIn, GitHub
		else if (
			q.includes('nombor') ||
			q.includes('telefon') ||
			q.includes('phone') ||
			q.includes('whatsapp') ||
			q.includes('wasap') ||
			q.includes('email') ||
			q.includes('emel') ||
			q.includes('linkedin') ||
			q.includes('github') ||
			q.includes('contact') ||
			q.includes('hubungi') ||
			q.includes('cara hubungi') ||
			q.includes('reach')
		) {
			reply = isMalay
				? '📞 **Saluran Komunikasi Terus Muhammed Munir:**\n\n' +
				  '• 📱 **Telefon / WhatsApp**: +6013-5636124\n' +
				  '• 📧 **E-mel**: muhammed.munir97.mm@gmail.com\n' +
				  '• 💼 **LinkedIn**: linkedin.com/in/muhammed-munir\n' +
				  '• 🐙 **GitHub**: github.com/muhammedmunir\n' +
				  '• 📍 **Lokasi**: Puchong, Selangor\n\n' +
				  'Beliau sedia membalas sebarang pertanyaan dalam masa kurang daripada 24 jam.'
				: '📞 **Direct Communications for Muhammed Munir:**\n\n' +
				  '• 📱 **Phone / WhatsApp**: +6013-5636124\n' +
				  '• 📧 **Email**: muhammed.munir97.mm@gmail.com\n' +
				  '• 💼 **LinkedIn**: linkedin.com/in/muhammed-munir\n' +
				  '• 🐙 **GitHub**: github.com/muhammedmunir\n' +
				  '• 📍 **Location**: Puchong, Selangor\n\n' +
				  'He responds promptly to all professional opportunities within 24 hours.';
			spokenText = isMalay
				? 'Anda boleh menghubungi Munir terus melalui WhatsApp di talian kosong satu tiga, lima enam tiga enam satu dua empat, atau melalui e-mel yang tertera pada skrin.'
				: 'You can reach Munir directly via WhatsApp at +6013-5636124 or through his email displayed on the screen.';
			action = {
				label: isMalay ? '💬 Buka Borang Hubungi' : '💬 Open Contact Form',
				callback: () => {
					isOpen = false;
					window.location.hash = '#contact';
				}
			};
		}
		// 5. Age & Birth Year ("umur", "berapa umur", "lahir", "tahun lahir", "age", "birthday", "birth")
		else if (
			q.includes('umur') ||
			q.includes('age') ||
			q.includes('lahir') ||
			q.includes('birthday') ||
			q.includes('how old')
		) {
			reply = isMalay
				? '👤 **Profil Peribadi Muhammed Munir:**\n\n' +
				  '• **Tahun Lahir**: 1997 (berumur sekitar 28 tahun)\n' +
				  '• **Warganegara**: Malaysia\n' +
				  '• **Status Kerjaya**: Tersedia segera untuk sebarang penempatan kerja profesional.\n' +
				  '• **Pengalaman**: 4+ tahun dalam pembangunan perisian full-stack & keselamatan rangkaian.'
				: '👤 **Personal Profile of Muhammed Munir:**\n\n' +
				  '• **Birth Year**: 1997 (approx. 28 years old)\n' +
				  '• **Nationality**: Malaysian\n' +
				  '• **Status**: Single, immediately available for professional engineering roles.\n' +
				  '• **Experience**: 4+ years in enterprise full-stack development & network security.';
			spokenText = isMalay
				? 'Munir dilahirkan pada tahun 1997, berumur sekitar dua puluh lapan tahun, dan kini memiliki lebih empat tahun pengalaman dalam kejuruteraan perisian.'
				: 'Munir was born in 1997, is around 28 years old, and has over 4 years of professional software engineering experience.';
		}
		// 6. Career Availability, Notice Period & Hiring ("available", "tersedia", "ambil kerja", "hire", "kerja kosong", "bila boleh", "interview", "gaji", "salary")
		else if (
			q.includes('available') ||
			q.includes('tersedia') ||
			q.includes('hire') ||
			q.includes('ambil kerja') ||
			q.includes('kerja kosong') ||
			q.includes('bila boleh') ||
			q.includes('start bila') ||
			q.includes('temuduga') ||
			q.includes('interview') ||
			q.includes('gaji') ||
			q.includes('salary') ||
			q.includes('notice') ||
			q.includes('notis')
		) {
			reply = isMalay
				? '💼 **Status Ketersediaan Kerjaya Muhammed Munir:**\n\n' +
				  'Munir kini **Tersedia Segera (Available Immediately)** untuk:\n' +
				  '• 🏢 Jawatan **Sepenuh Masa (Full-Time)** sebagai Full-Stack / Frontend / Mobile Software Engineer.\n' +
				  '• 🤝 Kontrak Kejuruteraan Sistem Perusahaan atau Perundingan Kanan.\n' +
				  '• 📅 Tempoh notis beliau adalah fleksibel dan beliau sedia menghadiri sesi temuduga bila-bila masa.\n\n' +
				  'Sila hubungi beliau terus di talian WhatsApp +6013-5636124 atau melalui borang perhubungan.'
				: '💼 **Muhammed Munir\'s Career Availability:**\n\n' +
				  'Munir is **Immediately Available** for:\n' +
				  '• 🏢 **Full-Time positions** as Full-Stack / Frontend / Mobile Software Engineer.\n' +
				  '• 🤝 Enterprise software contracts or senior technical consultation.\n' +
				  '• 📅 Notice period is flexible and he is open for interviews anytime.\n\n' +
				  'You can contact him directly at +6013-5636124 or via the contact form.';
			spokenText = isMalay
				? 'Munir kini berstatus sedia segera untuk menyertai organisasi anda secara sepenuh masa atau kontrak, dan bersedia untuk menghadiri sesi temuduga bila-bila masa.'
				: 'Munir is immediately available for full-time or contract roles, and is open for interviews at your convenience.';
			action = {
				label: isMalay ? '💼 Ambil Munir Bekerja' : '💼 Hire Munir',
				callback: () => {
					isOpen = false;
					window.location.hash = '#contact';
				}
			};
		}
		// 7. Languages Spoken ("bahasa apa", "cakap bahasa", "languages spoken", "pertuturan")
		else if (
			(q.includes('bahasa') && (q.includes('apa') || q.includes('cakap') || q.includes('pertuturan') || q.includes('tahu'))) ||
			q.includes('languages spoken')
		) {
			reply = isMalay
				? '🗣️ **Penguasaan Bahasa Pertuturan Muhammed Munir:**\n\n' +
				  '• 🇲🇾 **Bahasa Melayu**: Bahasa Ibunda (Native Proficiency) — fasih sepenuhnya dalam pertuturan dan penulisan.\n' +
				  '• 🇬🇧 **Bahasa Inggeris**: Tahap Profesional (Full Professional Working Proficiency) — selesa dalam perbincangan teknikal antarabangsa, dokumentasi sistem, dan kerjasama berpasukan.'
				: '🗣️ **Languages Spoken by Muhammed Munir:**\n\n' +
				  '• 🇲🇾 **Bahasa Melayu**: Native proficiency — fluent in speech and professional writing.\n' +
				  '• 🇬🇧 **English**: Full professional working proficiency — comfortable leading technical presentations, system documentation, and global team collaboration.';
			spokenText = isMalay
				? 'Munir menguasai Bahasa Melayu sebagai bahasa ibunda dan fasih sepenuhnya dalam Bahasa Inggeris untuk komunikasi profesional dan perbincangan teknikal.'
				: 'Munir is a native Malay speaker and possesses full professional fluency in English for technical leadership and international collaboration.';
		}
		// 8. Statistics, Telemetry & Analytics ("statistik", "statstik", "stats", "telemetri", "metrics", "analitik")
		else if (
			q.includes('statistik') ||
			q.includes('statstik') ||
			q.includes('statistic') ||
			q.includes('stats') ||
			q.includes('telemetri') ||
			q.includes('telemetry') ||
			q.includes('metrik') ||
			q.includes('metric') ||
			q.includes('analitik') ||
			q.includes('analytics')
		) {
			reply = isMalay
				? '📊 RINGKASAN STATISTIK & TELEMETRI EKOSISTEM MUHAMMED MUNIR:\n\n' +
				  '🔢 Jumlah Projek Siap: 18 Sistem Pengeluaran\n' +
				  '• 🏛️ Sektor Awam / Kerajaan: 3 Sistem (eMesys, Sutera, ADIMS)\n' +
				  '• ⚡ AI & Ejen Autonomi: 3 Sistem (9Router 3D, TINDAK, CV Bot)\n' +
				  '• 📱 Aplikasi Mudah Alih: 2 Aplikasi (Baby Kicking, JioFarm IoT)\n' +
				  '• 🌐 Web Enterprise & SaaS: 7 Platform (IWA001, Infinity, Onboardx, Lumina, Tax Relief, FocusBoard, UTM FYP)\n' +
				  '• 🎮 Simulasi & Enjin: 3 Enjin (Foony 9-Ball, OrbitPulse, Sudoku Solver)\n\n' +
				  '⏱️ Pengalaman Industri: 4+ Tahun Pengalaman Penuh (YHCM Enterprise, Nova Bitara, Tenaga Nasional Berhad)\n' +
				  '💻 Senjata Teknologi: 18+ Teknologi Utama (Vue.js 3, Laravel 11/12, SvelteKit, Flutter/Dart, Docker Swarm, PostgreSQL 17, Redis, Splunk SOC)\n' +
				  '🎓 Kelayakan Akademik: B.Sc. Sains Komputer (Keselamatan Rangkaian), UTM (PNGK: 3.17)\n' +
				  '🌐 Integriti Sistem: 100% Responsif, Dwibahasa (BM/EN), & Resume Format ATS.'
				: '📊 MUHAMMED MUNIR ECOSYSTEM TELEMETRY & STATS:\n\n' +
				  '🔢 Total Shipped Systems: 18 Production Platforms\n' +
				  '• 🏛️ Public Sector / Gov: 3 Systems (eMesys, Sutera, ADIMS)\n' +
				  '• ⚡ AI & Autonomous Agents: 3 Systems (9Router 3D, TINDAK, CV Bot)\n' +
				  '• 📱 Mobile Applications: 2 Apps (Baby Kicking, JioFarm IoT)\n' +
				  '• 🌐 Enterprise Web & SaaS: 7 Platforms (IWA001, Infinity, Onboardx, Lumina, Tax Relief, FocusBoard, UTM FYP)\n' +
				  '• 🎮 Simulation & Engine Tools: 3 Tools (Foony 9-Ball, OrbitPulse, Sudoku Solver)\n\n' +
				  '⏱️ Industry Track Record: 4+ Years Experience (YHCM Enterprise, Nova Bitara, Tenaga Nasional Berhad)\n' +
				  '💻 Core Arsenal: 18+ Modern Technologies (Vue 3, Laravel 11/12, SvelteKit, Flutter/Dart, Docker Swarm, PostgreSQL 17, Redis, Splunk SOC)\n' +
				  '🎓 Education: B.Sc. Computer Science (Network Security), UTM (CGPA: 3.17)\n' +
				  '🌐 System Quality: 100% Responsive, Bilingual BM/EN, & ATS-Compliant Resume.';
			spokenText = isMalay
				? 'Secara keseluruhan, Munir telah membina lapan belas sistem pengeluaran merangkumi tiga sistem sektor awam, tiga platform kecerdasan buatan, dua aplikasi mudah alih, dan tujuh sistem web perusahaan.'
				: 'In summary, Munir has shipped 18 production systems across 3 public sector platforms, 3 AI systems, 2 mobile apps, and 7 enterprise web platforms.';
			action = {
				label: isMalay ? '📊 Buka Bahagian Projek & Statistik' : '📊 View Projects & Stats',
				callback: () => {
					isOpen = false;
					window.location.hash = '#projects';
				}
			};
		}
		// 9. Count for Government / Public Sector Projects ("berapa projek kerajaan ada?", "berapa projek kerjaan ada?", "jumlah projek kerajaan")
		else if (
			(q.includes('berapa') || q.includes('jumlah') || q.includes('bilangan') || q.includes('how many') || q.includes('total')) &&
			(q.includes('kerajaan') || q.includes('kerjaan') || q.includes('gov') || q.includes('sektor awam') || q.includes('public sector'))
		) {
			reply = isMalay
				? 'Terdapat tepat 3 projek utama sektor awam / kerajaan yang dibangunkan dan diselenggara oleh Munir di YHCM Sdn Bhd:\n\n' +
				  '1. 🛡️ eMesys — Platform Pengurusan Aset & Logistik Sektor Awam (Laravel 11, Vue 3, Docker Swarm, MariaDB, SSO Enterprise, RBAC Audit)\n' +
				  '2. ⚙️ Sutera — Sistem Operasi & Penyelenggaraan Kejuruteraan (Laravel 11, Vue 3, PostgreSQL 17, Docker, Redis, RBAC Security)\n' +
				  '3. 📦 ADIMS — Sistem Rekod & Aset Digital (Laravel 12, PHP 8.5, Horizon, Enjin Kod QR, Storan Awan S3/MinIO, Google 2FA)\n\n' +
				  'Ketiga-tiga platform ini dibangunkan dengan pematuhan keselamatan data ketat dan kawalan capaian berasaskan peranan (RBAC).'
				: 'There are exactly 3 core public sector / government systems developed and maintained by Munir at YHCM Sdn Bhd:\n\n' +
				  '1. 🛡️ eMesys — Public Sector Asset & Logistics Management Platform (Laravel 11, Vue 3, Docker Swarm, MariaDB, SSO Enterprise, RBAC Audit)\n' +
				  '2. ⚙️ Sutera — Engineering Operations & Maintenance Management System (Laravel 11, Vue 3, PostgreSQL 17, Docker, Redis, RBAC Security)\n' +
				  '3. 📦 ADIMS — Digital Records & QR Verification System (Laravel 12, PHP 8.5, Horizon, QR Engine, S3/MinIO Storage, Google 2FA)\n\n' +
				  'All 3 systems operate under strict enterprise data integrity standards with role-based access control (RBAC).';
			spokenText = isMalay
				? 'Terdapat tepat tiga platform sektor awam utama yang dibangunkan oleh Munir di YHCM iaitu eMesys, Sutera, dan ADIMS yang beroperasi di bawah kawalan keselamatan ketat.'
				: 'There are exactly 3 core public sector systems engineered by Munir at YHCM: eMesys, Sutera, and ADIMS, operating under strict security governance.';
			action = {
				label: isMalay ? '🏛️ Lihat 3 Sistem Sektor Awam' : '🏛️ View Public Sector Systems',
				callback: () => {
					isOpen = false;
					window.location.hash = '#projects';
				}
			};
		}
		// 10. General Count for All Projects ("berapa projek ada", "jumlah projek", "ada berapa projek", "how many projects")
		else if (
			(q.includes('berapa') || q.includes('jumlah') || q.includes('bilangan') || q.includes('how many')) &&
			(q.includes('projek') || q.includes('sistem') || q.includes('app') || q.includes('aplikasi') || q.includes('project') || q.includes('system'))
		) {
			reply = isMalay
				? 'Munir telah membina sejumlah 18 sistem dan aplikasi produksi yang siap dihantar:\n\n' +
				  '• 🏛️ 3 Sistem Sektor Awam / Kerajaan (eMesys, Sutera, ADIMS)\n' +
				  '• ⚡ 3 Aplikasi AI & Ejen Autonomi (9Router 3D, TINDAK, CV Bot)\n' +
				  '• 📱 2 Aplikasi Mudah Alih (Baby Kicking Suite, JioFarm IoT)\n' +
				  '• 🌐 7 Platform Web Enterprise & SaaS (IWA001, Infinity, Onboardx, Lumina, Tax Relief, FocusBoard, UTM FYP)\n' +
				  '• 🎮 3 Enjin Simulasi & Algoritma (Foony 9-Ball, OrbitPulse, Sudoku Solver)\n\n' +
				  'Anda boleh melihat dan menapis semua 18 projek ini secara interaktif di bahagian projek!'
				: 'Munir has shipped a total of 18 production systems and applications:\n\n' +
				  '• 🏛️ 3 Public Sector Platforms (eMesys, Sutera, ADIMS)\n' +
				  '• ⚡ 3 AI & Autonomous Agent Apps (9Router 3D, TINDAK, CV Bot)\n' +
				  '• 📱 2 Mobile Applications (Baby Kicking Suite, JioFarm IoT)\n' +
				  '• 🌐 7 Enterprise Web & SaaS Platforms (IWA001, Infinity, Onboardx, Lumina, Tax Relief, FocusBoard, UTM FYP)\n' +
				  '• 🎮 3 Simulation & Engine Tools (Foony 9-Ball, OrbitPulse, Sudoku Solver)\n\n' +
				  'You can explore and filter all 18 systems interactively in the projects section!';
			spokenText = isMalay
				? 'Munir telah menghasilkan sejumlah lapan belas sistem pengeluaran yang siap digunakan dan boleh anda terokai secara interaktif di bahagian projek.'
				: 'Munir has shipped a total of 18 production systems which you can explore interactively in the projects section.';
			action = {
				label: isMalay ? '📦 Jelajah 18+ Projek' : '📦 Explore 18+ Projects',
				callback: () => {
					isOpen = false;
					window.location.hash = '#projects';
				}
			};
		}
		// 11. Individual Specific Project Lookups
		else if (q.includes('tindak')) {
			reply = isMalay
				? '⚡ **TINDAK — Enjin Tindakan Pintar Android:**\nAplikasi tindakan pantas ("Jumpa sesuatu. Tindak terus") yang menangkap teks perkongsian (Share Intent), memproses entiti secara tempatan (Local-First parser) dengan fallback Gemini AI, dan storan awan selamat Supabase Edge Functions berdasar RLS.'
				: '⚡ **TINDAK — Smart Android Action Engine:**\nRapid-action layer capturing Android Share Intents, parsing data locally with Gemini AI fallback and Supabase RLS security harness.';
			spokenText = isMalay
				? 'Tindak ialah enjin tindakan pantas Android yang memproses teks secara tempatan dengan sandaran kecerdasan buatan Gemini.'
				: 'Tindak is a fast Android action engine parsing shared content locally with Gemini AI fallback.';
			action = { label: isMalay ? 'Lihat Spesifikasi TINDAK' : 'View TINDAK Specs', callback: () => { isOpen = false; window.location.hash = '#projects'; } };
		}
		else if (q.includes('baby') || q.includes('kicking')) {
			reply = isMalay
				? '👶 **Baby Kicking Suite — Aplikasi Kesihatan Fetal Mudah Alih:**\nAplikasi mudah alih Flutter rentas platform (Android, iOS, Web) untuk ibu mengandung merekod tendangan janin secara tepat dengan Firebase Cloud Firestore, graf analitik pergerakan, dan eksport laporan PDF untuk doktor.'
				: '👶 **Baby Kicking Suite — Fetal Health Mobile Tracker:**\nCross-platform Flutter mobile application with Firebase Firestore, activity trend analytics, and structured clinical PDF doctor exports.';
			spokenText = isMalay
				? 'Baby Kicking Suite ialah aplikasi mudah alih Flutter untuk ibu mengandung memantau pergerakan janin dengan penyelarasan Firebase dan laporan PDF.'
				: 'Baby Kicking Suite is a Flutter mobile app for expectant mothers to track fetal movements with Firebase and PDF reports.';
			action = { label: isMalay ? 'Lihat Spesifikasi Baby Kicking' : 'View Baby Kicking Specs', callback: () => { isOpen = false; window.location.hash = '#projects'; } };
		}
		else if (q.includes('9router') || q.includes('nine router')) {
			reply = isMalay
				? '🏢 **9Router Office — Pejabat Maya 3D Ejen AI Autonomi:**\nPersekitaran maya 3D Three.js dan pelayan orkestrasi berbilang ejen AI autonomi memanfaatkan Model Context Protocol (MCP SDK), jambatan suara masa nyata, dan automasi ujian E2E Playwright.'
				: '🏢 **9Router Office — Autonomous AI Agent 3D Workspace:**\nInteractive 3D Three.js virtual office orchestrating multi-agent AI teams via Model Context Protocol (MCP SDK) and live voice bridges.';
			spokenText = isMalay
				? 'Nine Router Office ialah persekitaran pejabat maya tiga dimensi yang menguruskan pasukan ejen kecerdasan buatan autonomi.'
				: '9Router Office is a 3D virtual workspace orchestrating autonomous AI agent teams via Model Context Protocol.';
			action = { label: isMalay ? 'Lihat Spesifikasi 9Router' : 'View 9Router Specs', callback: () => { isOpen = false; window.location.hash = '#projects'; } };
		}
		else if (q.includes('cv bot') || (q.includes('computer vision') && !q.includes('apa'))) {
			reply = isMalay
				? '👁️ **Computer Vision & Win32 Automation Suite:**\nSistem automasi desktop Python menggunakan OpenCV (pemadanan templat piramid SIFT homography, segmentasi warna CIELAB, OCR dinamik, & perimeter tetingkap selamat Win32).'
				: '👁️ **Computer Vision & Win32 Automation Suite:**\nPython desktop automation with OpenCV multi-scale SIFT homography, CIELAB color space tracking, and native Win32 window containment.';
			spokenText = isMalay
				? 'Computer Vision Bot ialah sistem automasi desktop pintar menggunakan Python dan pustaka OpenCV.'
				: 'Computer Vision Bot is a Python desktop automation suite utilizing OpenCV and visual servoing.';
			action = { label: isMalay ? 'Lihat Spesifikasi CV Bot' : 'View CV Bot Specs', callback: () => { isOpen = false; window.location.hash = '#projects'; } };
		}
		else if (q.includes('tax relief') || (q.includes('cukai') && !q.includes('berapa'))) {
			reply = isMalay
				? '📊 **Tax Relief Malaysia — Pengoptimum Pelepasan Cukai LHDN:**\nAplikasi web pintar Node.js/TypeScript untuk mengira dan memaksimumkan pelepasan cukai pendapatan individu LHDN dengan simulasi penjimatan bersih dan jaminan tanpa simpanan data sensitif.'
				: '📊 **Tax Relief Malaysia — Personal Income Tax Optimizer:**\nFull-stack Node.js/TypeScript interactive tax calculator simulating maximum allowable LHDN deductions with zero sensitive data persistence.';
			spokenText = isMalay
				? 'Tax Relief Malaysia ialah aplikasi web untuk mengira dan mengoptimumkan pelepasan cukai pendapatan individu LHDN.'
				: 'Tax Relief Malaysia is an interactive tax deduction optimizer engineered with TypeScript.';
			action = { label: isMalay ? 'Lihat Spesifikasi Tax Relief' : 'View Tax Relief Specs', callback: () => { isOpen = false; window.location.hash = '#projects'; } };
		}
		else if (q.includes('jiofarm')) {
			reply = isMalay
				? '🌱 **JioFarm — Telemetri Pertanian Pintar IoT:**\nSistem pemantauan sensor IoT berasaskan Python (kelembapan tanah, suhu, pH) dengan amaran automatik dan papan pemuka analitik kesihatan tanaman.'
				: '🌱 **JioFarm — Smart Agriculture IoT Crop Monitoring:**\nPython FastAPI IoT telemetry monitoring soil moisture and environmental metrics with automated critical irrigation triggers.';
			spokenText = isMalay
				? 'JioFarm ialah platform telemetri pertanian pintar yang memantau penderia IoT tanah dan cuaca.'
				: 'JioFarm is a smart agriculture IoT telemetry platform monitoring soil and microclimate sensors.';
			action = { label: isMalay ? 'Lihat Spesifikasi JioFarm' : 'View JioFarm Specs', callback: () => { isOpen = false; window.location.hash = '#projects'; } };
		}
		else if (q.includes('lumina')) {
			reply = isMalay
				? '🪞 **Lumina Glass Studio & Cermin Pintar LED:**\nPlatform e-dagang dan visualizer interaktif 2D/3D cermin LED (suhu Kelvin 3000K-6500K) dibina dengan SvelteKit dan RESTful API Laravel 11.'
				: '🪞 **Lumina Glass Studio & Smart Mirror Visualizer:**\nSvelteKit + Laravel 11 API smart mirror e-commerce platform with real-time 2D/3D Kelvin LED light visualizer.';
			spokenText = isMalay
				? 'Lumina Glass Studio ialah platform e-dagang cermin pintar interaktif dengan peng visual LED tiga dimensi.'
				: 'Lumina Glass Studio is an e-commerce platform featuring interactive LED smart mirror visualization.';
			action = { label: isMalay ? 'Lihat Spesifikasi Lumina' : 'View Lumina Specs', callback: () => { isOpen = false; window.location.hash = '#projects'; } };
		}
		else if (q.includes('iwa001') || q.includes('pinjaman')) {
			reply = isMalay
				? '🔐 **Sistem Pinjaman Bercagar (IWA001):**\nSistem pengurusan pinjaman gred kewangan dengan 17 halaman pentadbir, kawalan akses Supabase RLS, pengesahan JWT, dan deployment Edge Vercel di Nova Bitara.'
				: '🔐 **Collateralized Loan Management System (IWA001):**\nEnterprise financial platform with 17 admin screens, Supabase RLS, JWT auth, deployed on Vercel Edge at Nova Bitara.';
			spokenText = isMalay
				? 'IWA001 ialah sistem pengurusan pinjaman bercagar gred kewangan yang dibina dengan SvelteKit dan Supabase.'
				: 'IWA001 is an enterprise loan management system built with SvelteKit and Supabase security.';
			action = { label: isMalay ? 'Lihat Spesifikasi IWA001' : 'View IWA001 Specs', callback: () => { isOpen = false; window.location.hash = '#projects'; } };
		}
		else if (q.includes('onboardx')) {
			reply = isMalay
				? '⚡ **Onboardx TNB — Penyelesaian Mobiliti Pekerja Baharu:**\nAplikasi mudah alih dan web Flutter rentas platform untuk Tenaga Nasional Berhad yang memperkemas proses onboarding dengan pelayan Azure, MongoDB, dan CI/CD Jenkins.'
				: '⚡ **Onboardx TNB — Enterprise Mobility Onboarding:**\nCross-platform Flutter application built for Tenaga Nasional Berhad deployed on Azure Ubuntu with Jenkins CI/CD automation.';
			spokenText = isMalay
				? 'Onboardx ialah aplikasi mobiliti pekerja korporat untuk Tenaga Nasional Berhad yang dibina dengan Flutter dan Azure.'
				: 'Onboardx is an enterprise employee onboarding mobile app built for TNB using Flutter and Azure.';
			action = { label: isMalay ? 'Lihat Spesifikasi Onboardx' : 'View Onboardx Specs', callback: () => { isOpen = false; window.location.hash = '#projects'; } };
		}
		else if (q.includes('infinity')) {
			reply = isMalay
				? '🌐 **Portal Korporat Infinity World:**\nLaman web korporat pelbagai bahasa (3 bahasa) berprestasi tinggi dibina dengan SvelteKit, caching Redis, dan integrasi emel Resend API di Nova Bitara.'
				: '🌐 **Infinity World Corporate Portal:**\nMultilingual corporate web platform engineered in SvelteKit with Redis caching and Resend API at Nova Bitara.';
			spokenText = isMalay
				? 'Infinity World ialah portal korporat pelbagai bahasa berprestasi tinggi yang dibina dengan SvelteKit dan Redis.'
				: 'Infinity World is a high performance multilingual corporate portal engineered with SvelteKit.';
			action = { label: isMalay ? 'Lihat Spesifikasi Infinity' : 'View Infinity Specs', callback: () => { isOpen = false; window.location.hash = '#projects'; } };
		}
		// 12. Specific Framework & Skill Inquiries
		else if (q.includes('laravel')) {
			reply = isMalay
				? '🛠️ **Kepakaran Laravel Munir:**\nMunir sangat berpengalaman dalam **Laravel 11 & 12**: membina backend API perusahaan, panel pentadbiran Laravel Filament, pemprosesan giliran tak segerak (Laravel Horizon), integrasi 2FA, dan pengujian PHPUnit (digunakan dalam eMesys, Sutera, ADIMS, dan Lumina).'
				: '🛠️ **Munir\'s Laravel Expertise:**\nHighly proficient in **Laravel 11 & 12**: RESTful APIs, Laravel Filament admin panels, queue workers (Laravel Horizon), 2FA, and PHPUnit suites across eMesys, Sutera, ADIMS, and Lumina.';
			spokenText = isMalay
				? 'Munir sangat mahir dalam Laravel versi sebelas dan dua belas untuk membina API perusahaan dan sistem pentadbiran Filament.'
				: 'Munir is highly proficient in Laravel 11 and 12, engineering enterprise APIs and Filament admin architectures.';
		}
		else if (q.includes('vue') || q.includes('vuejs')) {
			reply = isMalay
				? '💚 **Kepakaran Vue.js 3 Munir:**\nPengalaman luas membina antaramuka web berskala tinggi menggunakan **Vue.js 3** (Composition API, Pinia, Vue Router, Tailwind CSS 3) untuk sistem sektor awam eMesys dan Sutera di YHCM.'
				: '💚 **Munir\'s Vue.js Expertise:**\nExtensive frontend production experience in **Vue.js 3** (Composition API, Pinia state, Tailwind CSS) powering mission-critical government platforms eMesys and Sutera at YHCM.';
			spokenText = isMalay
				? 'Munir berpengalaman luas membina antaramuka berskala besar menggunakan Vue 3 untuk sistem sektor awam eMesys dan Sutera.'
				: 'Munir has extensive frontend experience in Vue 3 powering mission-critical platforms eMesys and Sutera.';
		}
		else if (q.includes('svelte') || q.includes('sveltekit')) {
			reply = isMalay
				? '🧡 **Kepakaran Svelte & SvelteKit Munir:**\nMunir menguasai **SvelteKit 2 & Svelte 5 (Runes)**: membina portfolio ini sendiri, sistem kewangan IWA001, portal Infinity World, visualizer Lumina, dan projek FYP UTM.'
				: '🧡 **Munir\'s SvelteKit Expertise:**\nMastery in **SvelteKit 2 & Svelte 5 (Runes)**: engineered this reactive portfolio, IWA001 loan platform, Infinity World portal, and UTM FYP mapping system.';
			spokenText = isMalay
				? 'Munir menguasai SvelteKit dan Svelte 5 runes yang digunakan untuk membina portfolio moden ini serta platform kewangan IWA001.'
				: 'Munir has mastery in SvelteKit and Svelte 5 runes, which power this reactive portfolio and the IWA001 platform.';
		}
		else if (q.includes('flutter') || q.includes('dart')) {
			reply = isMalay
				? '💙 **Kepakaran Flutter & Dart Munir:**\nMembangunkan aplikasi mudah alih Android & iOS rentas platform: aplikasi mobiliti korporat Onboardx untuk TNB dan aplikasi kesihatan janin Baby Kicking Suite.'
				: '💙 **Munir\'s Flutter Expertise:**\nCross-platform mobile development with Flutter & Dart: TNB Onboardx enterprise mobile solution and the Baby Kicking fetal telemetry suite.';
			spokenText = isMalay
				? 'Munir berpengalaman membina aplikasi mudah alih Android dan iOS menggunakan Flutter dan Dart untuk Tenaga Nasional Berhad.'
				: 'Munir develops cross-platform mobile apps using Flutter and Dart, including enterprise apps for TNB.';
		}
		else if (q.includes('docker') || q.includes('swarm') || q.includes('kontena')) {
			reply = isMalay
				? '🐳 **Kepakaran Docker & Kontena:**\nMunir mentadbir kluster kontena **Docker Swarm**, penulisan fail docker-compose berbilang perkhidmatan, pengurusan imej produksi, konfigurasi proksi Nginx, dan kestabilan servis di YHCM.'
				: '🐳 **Docker & Containerization:**\nAdministers **Docker Swarm** container clusters, multi-service compose stacks, production image deployments, and Nginx reverse proxies at YHCM.';
			spokenText = isMalay
				? 'Munir berpengalaman mentadbir kluster kontena Docker Swarm dan konfigurasi proksi Nginx di YHCM.'
				: 'Munir administers Docker Swarm container clusters and production reverse proxies at YHCM.';
		}
		else if (q.includes('python')) {
			reply = isMalay
				? '🐍 **Kepakaran Python Munir:**\nPython digunakan dalam kejuruteraan Visi Komputer (OpenCV, SIFT homography, CIELAB segmentation) pada CV Bot, serta backend API IoT telemetri pantas pada JioFarm (FastAPI).'
				: '🐍 **Munir\'s Python Expertise:**\nApplied Python across Computer Vision engineering (OpenCV, SIFT, CIELAB) for desktop automation, and FastAPI for real-time IoT crop telemetry.';
			spokenText = isMalay
				? 'Munir menggunakan Python untuk visi komputer, automasi desktop, dan backend API IoT telemetri pantas.'
				: 'Munir utilizes Python for computer vision, desktop automation, and high-speed IoT backend APIs.';
		}
		else if (q.includes('pangkalan data') || q.includes('database') || q.includes('sql') || q.includes('postgres') || q.includes('mysql') || q.includes('redis')) {
			reply = isMalay
				? '🗄️ **Kepakaran Pangkalan Data Munir:**\n• **Relational**: PostgreSQL 17, MariaDB, MySQL (skema ternormalisasi, pengoptimuman indeks & kueri kompleks)\n• **Awan & BaaS**: Supabase PostgreSQL dengan dasar keselamatan baris (Row-Level Security RLS)\n• **NoSQL & Realtime**: Firebase Firestore, Firebase Realtime DB, MongoDB\n• **Cache Memory**: Redis 8 (caching berprestasi tinggi & pub/sub).'
				: '🗄️ **Munir\'s Database Arsenal:**\n• **Relational**: PostgreSQL 17, MariaDB, MySQL (schema optimization, indexing, complex query tuning)\n• **Cloud / BaaS**: Supabase PostgreSQL with strict Row-Level Security (RLS)\n• **NoSQL**: Firebase Firestore, Realtime DB, MongoDB\n• **In-Memory Cache**: Redis 8 for low-latency session caching and message queues.';
			spokenText = isMalay
				? 'Munir mahir mengoptimumkan pangkalan data PostgreSQL, MariaDB, Supabase, dan cache memori Redis.'
				: 'Munir is skilled in PostgreSQL, MariaDB, Supabase cloud databases, and low latency Redis caching.';
		}
		else if (q.includes('security') || q.includes('keselamatan') || q.includes('splunk') || q.includes('soc') || q.includes('cyber')) {
			reply = isMalay
				? '🛡️ **Asas Keselamatan Siber & Rangkaian Munir:**\nBerkelulusan B.Sc. Keselamatan Rangkaian UTM, berpengalaman memantau papan pemuka Splunk SIEM di bilik SOC Tenaga Nasional Berhad, simulasi CVE di makmal Vulhub, penguatkuasaan RBAC, pengesahan 2FA/SSO, dan Cisco CCNA.'
				: '🛡️ **Cybersecurity & Network Security Foundation:**\nHolds a B.Sc. in Network Security from UTM, hands-on SOC monitoring via Splunk SIEM at TNB, Vulhub CVE exploitation labs, RBAC governance, 2FA/SSO protocols, and Cisco CCNA.';
			spokenText = isMalay
				? 'Munir mempunyai latar belakang ijazah keselamatan rangkaian dan berpengalaman dengan pemantauan Splunk di bilik operasi keselamatan TNB.'
				: 'Munir holds a network security degree and has hands-on Splunk SIEM experience at TNB Security Operations.';
		}
		// 13. Greetings
		else if (
			q === 'hai' ||
			q === 'halo' ||
			q === 'hello' ||
			q === 'hi' ||
			q.includes('salam') ||
			q.includes('selamat pagi') ||
			q.includes('selamat petang') ||
			q.includes('selamat malam') ||
			q.includes('assalamualaikum') ||
			q.includes('apa khabar')
		) {
			reply = isMalay
				? 'Salam sejahtera! Selamat datang ke portfolio Muhammed Munir. Sistem berada dalam keadaan 100% optimum. Sila beritahu apa yang anda ingin semak — lokasi Munir, pendidikan UTM, statistik projek, 3 sistem kerajaan, aplikasi AI/mobile, kemahiran teknikal, atau resume ATS?'
				: "Greetings! Welcome to Muhammed Munir's portfolio. All telemetry systems are operational. Let me know what you would like to explore — Munir's location, UTM degree, ecosystem statistics, 3 government platforms, AI/mobile apps, technical skills, or ATS resume?";
			spokenText = isMalay
				? 'Salam sejahtera. Selamat datang ke portfolio Muhammed Munir. Sila beritahu apa yang anda ingin semak hari ini.'
				: 'Greetings. Welcome to Muhammed Munir\'s portfolio. Please let me know what you would like to explore today.';
		}
		// 14. Government / Sektor Awam Overview (non-count)
		else if (
			q.includes('kerajaan') ||
			q.includes('kerjaan') ||
			q.includes('gov') ||
			q.includes('sektor awam') ||
			q.includes('public sector') ||
			q.includes('yhcm') ||
			q.includes('emesys') ||
			q.includes('sutera') ||
			q.includes('adims')
		) {
			reply = isMalay
				? 'Bagi YHCM Enterprise, Munir bertanggungjawab membangunkan dan menyelenggara 3 sistem web sektor awam & perusahaan:\n' +
				  '1. eMesys — Platform Pengurusan Aset & Logistik (rekod aset, kelulusan pelupusan, penjadualan penyelenggaraan berkala, dan laporan statistik).\n' +
				  '2. Sutera — Sistem Operasi & Penyelenggaraan Kejuruteraan (pemantauan peralatan teknikal dan pengurusan arahan kerja).\n' +
				  '3. ADIMS — Sistem Rekod & Verifikasi Digital dengan kod QR pintar, storan awan selamat, dan log audit keselamatan.\n\n' +
				  'Semua sistem dibina berasaskan Vue 3, Laravel, Docker, dan kawalan akses (RBAC) ketat.'
				: 'At YHCM Enterprise, Munir develops and maintains 3 public-sector and enterprise platforms:\n' +
				  '1. eMesys — Enterprise Asset & Logistics Platform (asset records, disposal workflows, maintenance scheduling, and reporting).\n' +
				  '2. Sutera — Operations & Maintenance Management System (technical equipment monitoring and work orders).\n' +
				  '3. ADIMS — Digital Records & QR Verification System with secure cloud storage and audit logging.\n\n' +
				  'Built with Vue 3, Laravel, Docker, and strict RBAC controls.';
			spokenText = isMalay
				? 'Di YHCM, Munir bertanggungjawab bagi tiga sistem sektor awam iaitu eMesys untuk logistik aset, Sutera untuk operasi kejuruteraan, dan ADIMS untuk rekod digital.'
				: 'At YHCM, Munir is responsible for 3 public sector systems: eMesys for asset logistics, Sutera for engineering operations, and ADIMS for digital records.';
			action = {
				label: isMalay ? '🏛️ Lihat Sistem Sektor Awam' : '🏛️ View Public Sector Systems',
				callback: () => {
					isOpen = false;
					window.location.hash = '#projects';
				}
			};
		}
		// 15. Mobile & Health Apps
		else if (
			q.includes('mobile') ||
			q.includes('aplikasi') ||
			q.includes('app')
		) {
			reply = isMalay
				? 'Aplikasi mudah alih dan produk pintar Munir merangkumi:\n' +
				  '• 👶 Baby Kicking Suite — Aplikasi Flutter rentas platform (Android, iOS, Web) dengan Firebase Firestore & Cloud Functions untuk pemantauan pergerakan bayi dan eksport laporan klinikal PDF.\n' +
				  '• ⚡ TINDAK — Enjin tindakan pintar Android (Share Intent, Local-First parsing, Gemini AI & Supabase RLS).\n' +
				  '• 📊 Tax Relief Malaysia — Pengoptimum pelepasan cukai pendapatan LHDN interaktif.\n' +
				  '• 🌱 JioFarm — Platform telemetri IoT pertanian pintar berasaskan Python.'
				: "Munir's mobile applications and smart tools include:\n" +
				  '• 👶 Baby Kicking Suite — Cross-platform Flutter mobile app (Android, iOS, Web) with Firebase Firestore & Cloud Functions tracking fetal movement and generating clinical PDF exports.\n' +
				  '• ⚡ TINDAK — AI-powered Android action layer (Share Intent, Local-First parsing, Gemini AI & Supabase RLS).\n' +
				  '• 📊 Tax Relief Malaysia — Smart LHDN personal income tax deduction optimizer.\n' +
				  '• 🌱 JioFarm — Python-powered smart agriculture IoT sensor telemetry platform.';
			spokenText = isMalay
				? 'Aplikasi mudah alih Munir merangkumi Baby Kicking Suite untuk kesihatan fetal, enjin tindakan pintar Android Tindak, dan aplikasi mobiliti Tenaga Nasional Berhad.'
				: "Munir's mobile applications include Baby Kicking Suite, the Tindak Android action engine, and TNB mobility apps.";
			action = {
				label: isMalay ? '📱 Lihat Aplikasi Mobile' : '📱 View Mobile Apps',
				callback: () => {
					isOpen = false;
					window.location.hash = '#projects';
				}
			};
		}
		// 16. AI, Computer Vision & Agents
		else if (
			q.includes('ai') ||
			q.includes('agent') ||
			q.includes('ejen') ||
			q.includes('vision') ||
			q.includes('gemini') ||
			q.includes('mcp')
		) {
			reply = isMalay
				? 'Kejuruteraan AI & Automasi Munir:\n' +
				  '• 🏢 9Router Office — Persekitaran pejabat maya 3D Three.js dengan orkestrasi berbilang ejen AI autonomi, Model Context Protocol (MCP SDK), jambatan suara interaktif, dan ujian Playwright.\n' +
				  '• 👁️ Computer Vision Bot — Automasi desktop Python memanfaatkan OpenCV (pemadanan templat SIFT homography, segmentasi warna CIELAB, OCR dinamik, & visual servoing Win32).\n' +
				  '• ⚡ TINDAK Gemini AI Fallback — Integrasi kecerdasan buatan untuk pemahaman teks rumit tanpa membebankan peranti pengguna.'
				: "Munir's AI & Autonomous Engineering:\n" +
				  '• 🏢 9Router Office — Interactive Three.js 3D virtual office orchestrating multi-agent AI teams via Model Context Protocol (MCP SDK), live voice services, and Playwright verification.\n' +
				  '• 👁️ Computer Vision Bot — High-speed Python desktop automation utilizing OpenCV (SIFT homography, CIELAB segmentation, OCR, & closed-loop Win32 visual servoing).\n' +
				  '• ⚡ TINDAK Gemini AI — Dynamic AI fallback for complex unstructured text understanding.';
			spokenText = isMalay
				? 'Kejuruteraan kecerdasan buatan Munir merangkumi pejabat maya tiga dimensi Nine Router Office, automasi Computer Vision Bot, dan integrasi Gemini AI.'
				: "Munir's AI engineering includes the 9Router 3D virtual office, Computer Vision Bot, and Gemini AI integrations.";
			action = {
				label: isMalay ? '🤖 Lihat Projek AI' : '🤖 View AI Projects',
				callback: () => {
					isOpen = false;
					window.location.hash = '#projects';
				}
			};
		}
		// 17. Summary / Profile / Bio
		else if (
			q === 'summary' ||
			q.includes('ringkasan') ||
			q.includes('profil') ||
			q.includes('siapa munir') ||
			q.includes('biodata') ||
			q.includes('who') ||
			q.includes('about')
		) {
			reply = isMalay
				? 'Muhammed Munir Bin Mohd Azmi adalah Pembangun Full-Stack & Profesional IT berpangkalan di Puchong, Selangor. Berkelulusan B.Sc. Sains Komputer (Keselamatan Rangkaian) UTM (PNGK 3.17). Beliau mempunyai rekod pencapaian terbukti dalam membina sistem berskala besar sektor awam kerajaan (eMesys, Sutera, ADIMS) menggunakan Vue.js 3 dan Laravel, aplikasi Flutter pintar, ejen AI 3D, serta pemantauan keselamatan siber Splunk SIEM.'
				: 'Muhammed Munir Bin Mohd Azmi is a Full-Stack Developer & IT Professional based in Puchong, Selangor. Holds a B.Sc. in Computer Science (Network Security) from UTM (CGPA 3.17). Proven track record engineering public-sector government platforms (eMesys, Sutera, ADIMS) with Vue.js 3 and Laravel, smart Flutter applications, 3D AI agent environments, and Splunk SIEM cybersecurity operations.';
			spokenText = isMalay
				? 'Muhammed Munir ialah pembangun full stack di Puchong, Selangor yang berpengalaman membina sistem perusahaan sektor awam dan aplikasi moden.'
				: 'Muhammed Munir is a Full-Stack developer based in Puchong, Selangor with a proven track record in enterprise public sector platforms.';
		}
		// 18. Tech Stack & Skills
		else if (
			q === 'skills' ||
			q.includes('tech') ||
			q.includes('kemahiran') ||
			q.includes('stack') ||
			q.includes('bahasa pengaturcaraan') ||
			q.includes('framework')
		) {
			reply = isMalay
				? 'Senjata Teknologi Utama Muhammed Munir:\n\n' +
				  '• 🌐 **Frontend & Mobile**: Vue.js 3, SvelteKit 5, Flutter/Dart, React, Three.js 3D, Tailwind CSS.\n' +
				  '• ⚙️ **Backend & Database**: Laravel 11/12, PHP 8.4/8.5, Node.js, Python, PostgreSQL 17, MariaDB/MySQL, Supabase RLS, Redis 8.\n' +
				  '• 🛡️ **Keselamatan & DevOps**: Docker Swarm, Linux Ubuntu, Splunk SIEM, Vulhub CVE, Azure, Jenkins CI/CD, Git, Cisco CCNA.'
				: 'Core Arsenal of Muhammed Munir:\n\n' +
				  '• 🌐 **Frontend & Mobile**: Vue.js 3, SvelteKit 5, Flutter/Dart, React, Three.js 3D, Tailwind CSS.\n' +
				  '• ⚙️ **Backend & Database**: Laravel 11/12, PHP 8.4/8.5, Node.js, Python, PostgreSQL 17, MariaDB/MySQL, Supabase RLS, Redis 8.\n' +
				  '• 🛡️ **Security & DevOps**: Docker Swarm, Linux Ubuntu, Splunk SIEM, Vulhub CVE, Microsoft Azure, Jenkins CI/CD, Cisco CCNA.';
			spokenText = isMalay
				? 'Senjata teknologi utama Munir merangkumi Vue 3, SvelteKit, Flutter, Laravel, Python, PostgreSQL, Docker Swarm, dan pemantauan keselamatan Splunk.'
				: 'Munir\'s core arsenal spans Vue 3, SvelteKit, Flutter, Laravel, Python, PostgreSQL, Docker Swarm, and Splunk security.';
			action = {
				label: isMalay ? '🎯 Lihat Matriks Kemahiran' : '🎯 View Skills Matrix',
				callback: () => {
					isOpen = false;
					window.location.hash = '#skills';
				}
			};
		}
		// 19. Work Experience (Strict match)
		else if (
			q.includes('pengalaman') ||
			q.includes('experience') ||
			q.includes('tempat kerja') ||
			q.includes('sejarah kerja') ||
			q.includes('syarikat') ||
			q.includes('company') ||
			q.includes('tnb') ||
			q.includes('nova bitara') ||
			(q.includes('kerja') && !q.includes('projek') && !q.includes('berapa'))
		) {
			reply = isMalay
				? 'Perjalanan Kerjaya Munir:\n\n' +
				  '1. 🏢 **YHCM Sdn Bhd** — Full-Stack Enterprise Programmer bagi sistem sektor awam eMesys, Sutera, dan ADIMS (Vue 3, Laravel Filament, Docker, Linux).\n' +
				  '2. 🌐 **Nova Bitara Development** — Pembangun Web & IT Support membina sistem pinjaman IWA001 dan portal Infinity World.\n' +
				  '3. ⚡ **Tenaga Nasional Berhad (TNB)** — Pembangun full-stack aplikasi mobiliti Onboardx (Flutter/Azure) dan Operasi Keselamatan Siber (Splunk SIEM, Red/Blue team CVE testing).'
				: "Munir's Career Trajectory:\n\n" +
				  '1. 🏢 **YHCM Sdn Bhd** — Full-Stack Enterprise Programmer supporting government platforms eMesys, Sutera, and ADIMS (Vue 3, Laravel, Docker, Linux).\n' +
				  '2. 🌐 **Nova Bitara Development** — IT Support & Web Developer engineering IWA001 loan platform and Infinity World corporate portal.\n' +
				  '3. ⚡ **Tenaga Nasional Berhad (TNB)** — Full-stack developer for Onboardx enterprise mobile app & Cybersecurity Operations analyst (Splunk SIEM, Vulhub CVE).';
			spokenText = isMalay
				? 'Munir mempunyai rekod kerjaya di YHCM Enterprise, Nova Bitara Development, dan Tenaga Nasional Berhad.'
				: 'Munir has professional experience spanning YHCM Enterprise, Nova Bitara Development, and Tenaga Nasional Berhad.';
			action = {
				label: isMalay ? '💼 Lihat Garis Masa Pengalaman' : '💼 View Experience Timeline',
				callback: () => {
					isOpen = false;
					window.location.hash = '#experience';
				}
			};
		}
		// 20. Games, Simulators & Physics (NO AeroCar X)
		else if (
			q === 'game' ||
			q.includes('game') ||
			q.includes('permainan') ||
			q.includes('rpg') ||
			q.includes('city') ||
			q.includes('9ball') ||
			q.includes('sudoku')
		) {
			reply = isMalay
				? 'Munir telah membina pelbagai simulator dan enjin permainan:\n\n' +
				  '• 🚀 **Cyberpunk Spaceship RPG Explorer** — Pengembaraan kapal angkasa interaktif dengan sistem bilik dan arkib rahsia.\n' +
				  '• 🏙️ **Cyber City Explorer** — Peta bandar isometrik Canvas 2.5D masa nyata.\n' +
				  '• 🎱 **Foony 9-Ball Master** — Enjin fizik biliard Chromium Extension.\n' +
				  '• 🧩 **Sudoku Solver** — Algoritma penjana papan berprosedur dan backtracking.\n\n' +
				  'Mahu melancarkan Cyberpunk RPG sekarang?'
				: 'Munir has engineered various simulation and physics interactive experiences:\n\n' +
				  '• 🚀 **Cyberpunk Spaceship RPG Explorer** — Interactive spaceship with room terminals and encrypted data logs.\n' +
				  '• 🏙️ **Cyber City Explorer** — Real-time 2.5D canvas isometric city navigator.\n' +
				  '• 🎱 **Foony 9-Ball Master** — Real-time vector billiards physics extension.\n' +
				  '• 🧩 **Sudoku Solver** — Procedural puzzle generator & recursive backtracking solver.\n\n' +
				  'Would you like to teleport to the RPG now?';
			spokenText = isMalay
				? 'Munir telah membina pengembaraan kapal angkasa Cyberpunk RPG, peneroka bandar 2.5D, dan enjin fizik biliard Foony 9-Ball.'
				: 'Munir has built the Cyberpunk RPG spaceship, 2.5D isometric city explorer, and Foony 9-Ball billiards physics.';
			action = {
				label: isMalay ? '🚀 Lancarkan Cyberpunk RPG' : '🚀 Launch Cyberpunk RPG',
				callback: () => {
					isOpen = false;
					playWarp();
					goto('/games');
				}
			};
		}
		// 21. Resume / ATS CV
		else if (
			q === 'resume' ||
			q.includes('cv') ||
			q.includes('dossier') ||
			q.includes('download') ||
			q.includes('muat turun')
		) {
			reply = isMalay
				? 'Dossier Resume ATS Muhammed Munir yang dioptimumkan untuk sistem pemprosesan pengambilan kerja sedia untuk dimuat turun dalam format PDF berstruktur tinggi.'
				: "Muhammed Munir's ATS-optimized Resume dossier is ready for immediate download in structured PDF format.";
			spokenText = isMalay
				? 'Dossier resume format ATS Munir sedia untuk dimuat turun dalam bentuk fail PDF.'
				: 'Munir\'s ATS resume dossier is ready for immediate download in PDF format.';
			action = {
				label: isMalay ? '📥 Muat Turun Resume ATS (PDF)' : '📥 Download ATS Resume (PDF)',
				href: '/resume.pdf'
			};
		}
		// 22. Diagnostics
		else if (q === 'diag' || q.includes('diagnostik') || q.includes('test')) {
			reply = isMalay
				? 'DIAGNOSTIK SISTEM SELESAI:\n\n' +
				  '• Core SvelteKit 5: RUNES AKTIF\n' +
				  '• Sektor Awam: 3 SISTEM TERSEDIA (eMesys, Sutera, ADIMS)\n' +
				  '• Aplikasi Inovasi: 15 SISTEM AKTIF (Jumlah: 18 Projek)\n' +
				  '• Pangkalan Data: RLS & RBAC ENFORCED\n' +
				  '• Keselamatan: SOC COMPLIANT\n' +
				  '• Status Munir: TERSEDIA UNTUK TEMUDUGA.'
				: 'SYSTEM DIAGNOSTICS COMPLETE:\n\n' +
				  '• Core SvelteKit 5: RUNES ACTIVE\n' +
				  '• Public Sector: 3 PLATFORMS ONLINE (eMesys, Sutera, ADIMS)\n' +
				  '• Innovation Apps: 15 SYSTEMS ACTIVE (Total: 18 Projects)\n' +
				  '• Database: RLS & RBAC ENFORCED\n' +
				  '• Security: SOC COMPLIANT\n' +
				  '• Candidate Status: AVAILABLE FOR HIRE.';
			spokenText = isMalay
				? 'Diagnostik sistem selesai. Semua lapan belas platform dan perkhidmatan telemetri beroperasi pada tahap optimum.'
				: 'System diagnostics complete. All 18 platforms and telemetry services are operating at optimal performance.';
		}
		// 23. Intelligent Fallback (Provides core facts instead of generic unhelpful text)
		else {
			reply = isMalay
				? `Maklumat Muhammed Munir bagi carian "${rawQuery}":\n\n` +
				  `Beliau adalah Pembangun Full-Stack & Profesional IT yang menetap di Puchong, Selangor. Berkelulusan B.Sc. Sains Komputer (Keselamatan Rangkaian) dari UTM (PNGK 3.17) dan mempunyai 4+ tahun pengalaman menghasilkan 18 sistem produksi (YHCM, TNB, Nova Bitara).\n\n` +
				  `Anda boleh bertanya tentang: tempat tinggal, universiti/kelulusan, statistik sistem, 3 sistem sektor awam, aplikasi mudah alih Flutter, kemahiran teknologi, atau muat turun resume ATS.`
				: `Information on Muhammed Munir for "${rawQuery}":\n\n` +
				  `He is a Full-Stack Developer & IT Professional based in Puchong, Selangor. Holds a B.Sc. in Computer Science (Network Security) from UTM (CGPA 3.17) with 4+ years of industry track record shipping 18 production systems (YHCM, TNB, Nova Bitara).\n\n` +
				  `Feel free to ask about his location, education/degree, ecosystem statistics, 3 public sector systems, mobile Flutter apps, tech stack, or download his ATS resume.`;
			spokenText = isMalay
				? 'Muhammed Munir ialah jurutera perisian di Puchong, Selangor dengan pengalaman lapan belas sistem produksi. Anda boleh bertanya tentang lokasi, pendidikan, atau projek beliau.'
				: 'Muhammed Munir is a software engineer based in Puchong, Selangor with 18 production systems. Feel free to ask about his location, education, or systems.';
		}

		const jarvisMsg: ChatMessage = {
			id: Date.now() + 1,
			sender: 'jarvis',
			text: reply,
			spokenText,
			action
		};

		messages = [...messages, jarvisMsg];

		if (voiceEnabled) {
			speak(reply, spokenText);
		}
		scrollToBottom();
	}

	function handleFormSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!userInput.trim()) return;
		const input = userInput;
		userInput = '';
		handleCommand(input);
	}

	function toggleVoice() {
		voiceEnabled = !voiceEnabled;
		if (!voiceEnabled) {
			stopVoice();
			playBlip(350, 0.04);
		} else {
			playConfirm();
			const msg =
				$lang === 'ms' ? 'Suara AI diaktifkan semula.' : 'AI voice synthesis reactivated.';
			speak(msg, msg);
		}
	}

	onMount(() => {
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				isOpen = false;
				stopVoice();
			}
			if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
				e.preventDefault();
				toggleOpen();
			}
		};
		window.addEventListener('keydown', handleKeydown);

		// Pre-warm speech synthesis voices
		if (typeof window !== 'undefined' && window.speechSynthesis) {
			updateVoices();
			window.speechSynthesis.onvoiceschanged = () => {
				updateVoices();
			};
		}

		const handleOpenJarvis = () => {
			if (!isOpen) {
				toggleOpen();
			}
		};
		window.addEventListener('open-jarvis', handleOpenJarvis);

		return () => {
			window.removeEventListener('keydown', handleKeydown);
			window.removeEventListener('open-jarvis', handleOpenJarvis);
			stopVoice();
		};
	});
</script>

<!-- Floating JARVIS Launcher Pill -->
<div class="jarvis-launcher">
	<button
		type="button"
		class="jarvis-pill-btn"
		class:active={isOpen}
		onclick={toggleOpen}
		title="Buka J.A.R.V.I.S AI Assistant (Ctrl + J)"
		aria-label="Toggle JARVIS AI Interface"
	>
		<span class="pill-dot"></span>
		<span class="pill-icon">🤖</span>
		<span class="pill-text">J.A.R.V.I.S</span>
	</button>
</div>

<!-- Modal HUD Overlay -->
{#if isOpen}
	<div class="jarvis-backdrop" onclick={toggleOpen} role="presentation"></div>

	<div
		class="jarvis-hud-drawer"
		role="dialog"
		aria-label="J.A.R.V.I.S Neural Interface"
		aria-modal="true"
	>
		<!-- HUD Top Header -->
		<header class="hud-header">
			<div class="hud-branding">
				<div class="hud-reactor-mini" class:speaking={isSpeaking}>
					<div class="mini-core"></div>
				</div>
				<div class="hud-title-wrap">
					<div class="hud-badge-tag">{$t.hud_badge}</div>
					<h2 class="hud-title">{$t.status_title}</h2>
				</div>
			</div>

			<div class="hud-controls">
				<!-- Voice Toggle -->
				<button
					class="ctrl-btn"
					class:active={voiceEnabled}
					onclick={toggleVoice}
					title={voiceEnabled ? $t.voice_on : $t.voice_off}
				>
					{voiceEnabled ? '🗣️ Suara: ON' : '🤐 Suara: OFF'}
				</button>

				<!-- Audio SFX Toggle -->
				<button
					class="ctrl-btn"
					class:active={$sfxEnabled}
					onclick={toggleSfx}
					title={$sfxEnabled ? $t.sound_on : $t.sound_off}
				>
					{$sfxEnabled ? '🔊 SFX' : '🔇 SFX'}
				</button>

				<!-- Close HUD -->
				<button
					class="ctrl-btn close-btn"
					onclick={toggleOpen}
					title={$t.close_btn}
					aria-label="Tutup JARVIS"
				>
					✕
				</button>
			</div>
		</header>

		<!-- Telemetry Strip & Animated Equalizer -->
		<div class="hud-telemetry-bar">
			<div class="telemetry-text">
				<span class="dot-online"></span>
				{$t.telemetry}
			</div>
			<div class="audio-equalizer" class:active={isSpeaking || $sfxEnabled} aria-hidden="true">
				<span class="bar bar-1"></span>
				<span class="bar bar-2"></span>
				<span class="bar bar-3"></span>
				<span class="bar bar-4"></span>
				<span class="bar bar-5"></span>
			</div>
		</div>

		<!-- Chat Message Transcript -->
		<div class="hud-body" bind:this={messagesContainer}>
			{#each messages as msg (msg.id)}
				<div
					class="msg-row"
					class:jarvis={msg.sender === 'jarvis'}
					class:user={msg.sender === 'user'}
				>
					<div class="msg-avatar">
						{#if msg.sender === 'jarvis'}
							<div class="avatar-jarvis">J</div>
						{:else}
							<div class="avatar-user">YOU</div>
						{/if}
					</div>

					<div class="msg-bubble-wrap">
						<div class="msg-sender-label">
							{msg.sender === 'jarvis' ? 'J.A.R.V.I.S · NEURAL CORE' : 'PENGGUNA · OPERATOR'}
						</div>
						<div class="msg-bubble">
							<div class="msg-text-content">
								{@html formatMessageHtml(msg.text)}
							</div>

							{#if msg.action}
								<div class="msg-action-box">
									{#if msg.action.href}
										<a
											href={msg.action.href}
											target="_blank"
											rel="noopener noreferrer"
											class="action-btn"
											download={msg.action.href.endsWith('.pdf')
												? 'Resume_Muhammed_Munir.pdf'
												: undefined}
										>
											{msg.action.label}
										</a>
									{:else if msg.action.callback}
										<button class="action-btn" onclick={msg.action.callback}>
											{msg.action.label}
										</button>
									{/if}
								</div>
							{/if}
						</div>

						<!-- On-Demand Listen Button for JARVIS replies -->
						{#if msg.sender === 'jarvis'}
							<div class="msg-playback-row">
								<button
									class="playback-btn"
									onclick={() => speak(msg.text, msg.spokenText)}
									title="Mainkan suara semula bagi jawapan ini"
								>
									{$t.listen_btn}
								</button>
								{#if isSpeaking}
									<span class="voice-anim">● Sedang bertutur...</span>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		<!-- Quick Command Chips Bar -->
		<div class="hud-chips-bar" aria-label="Cadangan Perintah Pantas">
			<span class="chips-label">PINTASAN PANTAS:</span>
			{#each $t.chips as chip}
				<button class="hud-chip" onclick={() => handleCommand(chip.query)}>
					{chip.label}
				</button>
			{/each}
		</div>

		<!-- Form Input Area -->
		<footer class="hud-footer">
			<form class="hud-input-form" onsubmit={handleFormSubmit}>
				<div class="input-icon" aria-hidden="true">❯</div>
				<input
					type="text"
					class="hud-input"
					bind:value={userInput}
					placeholder={$t.input_placeholder}
					aria-label="Mesej kepada JARVIS"
				/>
				<button type="submit" class="hud-send-btn" aria-label="Hantar Arahan">
					<span>HANTAR</span>
					<span class="send-glyph">➔</span>
				</button>
			</form>
		</footer>
	</div>
{/if}

<style>
	/* Trigger container */
	.jarvis-launcher {
		position: fixed;
		bottom: 1.5rem;
		right: 1.5rem;
		z-index: 990;
		display: flex;
		align-items: center;
	}

	.jarvis-pill-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		background: rgba(11, 23, 42, 0.94);
		border: 1.5px solid rgba(0, 240, 255, 0.5);
		color: #f8fafc;
		padding: 0.75rem 1.35rem;
		border-radius: 100px;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
		font-weight: 700;
		font-size: 0.88rem;
		letter-spacing: 0.05em;
		cursor: pointer;
		backdrop-filter: blur(16px);
		box-shadow:
			0 10px 30px rgba(0, 0, 0, 0.5),
			0 0 20px rgba(0, 240, 255, 0.25);
		transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
		outline: none;
	}
	.jarvis-pill-btn:hover,
	.jarvis-pill-btn.active {
		transform: translateY(-2px);
		border-color: #00f0ff;
		box-shadow:
			0 14px 40px rgba(0, 0, 0, 0.6),
			0 0 30px rgba(0, 240, 255, 0.5);
		background: rgba(15, 31, 56, 0.98);
		color: #00f0ff;
	}
	.pill-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #10b981;
		box-shadow: 0 0 10px #10b981;
		animation: pulseDot 2s infinite alternate;
	}
	@keyframes pulseDot {
		from {
			opacity: 0.5;
			transform: scale(0.9);
		}
		to {
			opacity: 1;
			transform: scale(1.15);
		}
	}
	.pill-icon {
		font-size: 1.15rem;
		line-height: 1;
	}
	.pill-text {
		color: #f8fafc;
		font-weight: 800;
	}

	/* Backdrop */
	.jarvis-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(3, 7, 18, 0.75);
		backdrop-filter: blur(8px);
		z-index: 998;
	}

	/* Drawer HUD */
	.jarvis-hud-drawer {
		position: fixed;
		bottom: 1.5rem;
		right: 1.5rem;
		width: min(580px, calc(100vw - 3rem));
		height: min(720px, calc(100vh - 3rem));
		background: rgba(7, 15, 29, 0.94);
		border: 1px solid rgba(0, 240, 255, 0.4);
		border-radius: 18px;
		box-shadow:
			0 20px 60px rgba(0, 0, 0, 0.8),
			0 0 40px rgba(0, 240, 255, 0.2);
		z-index: 999;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		backdrop-filter: blur(24px);
		animation: drawerIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes drawerIn {
		from {
			opacity: 0;
			transform: translateY(30px) scale(0.96);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	/* Header */
	.hud-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.2rem 1.4rem;
		background: linear-gradient(180deg, rgba(14, 30, 56, 0.9) 0%, rgba(7, 15, 29, 0.7) 100%);
		border-bottom: 1px solid rgba(0, 240, 255, 0.25);
	}
	.hud-branding {
		display: flex;
		align-items: center;
		gap: 0.9rem;
	}
	.hud-reactor-mini {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1.5px solid #00f0ff;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
		transition: all 0.3s ease;
	}
	.hud-reactor-mini.speaking {
		animation: pulseSpeaking 1s infinite alternate;
	}
	@keyframes pulseSpeaking {
		from {
			transform: scale(0.95);
			box-shadow: 0 0 8px #00f0ff;
		}
		to {
			transform: scale(1.2);
			box-shadow: 0 0 20px #00f0ff;
		}
	}
	.mini-core {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: #00f0ff;
		box-shadow: 0 0 8px #00f0ff;
	}
	.hud-badge-tag {
		font-family: 'Courier New', monospace;
		font-size: 0.65rem;
		font-weight: 800;
		color: #00f0ff;
		letter-spacing: 0.15em;
	}
	.hud-title {
		font-family: 'Inter', sans-serif;
		font-size: 0.92rem;
		font-weight: 700;
		color: #f8fafc;
		margin: 0;
	}

	.hud-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.ctrl-btn {
		background: rgba(15, 31, 56, 0.7);
		border: 1px solid rgba(0, 240, 255, 0.3);
		color: #94a3b8;
		padding: 0.35rem 0.65rem;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}
	.ctrl-btn:hover,
	.ctrl-btn.active {
		color: #00f0ff;
		border-color: #00f0ff;
		background: rgba(0, 240, 255, 0.1);
	}
	.close-btn {
		font-size: 1rem;
		padding: 0.3rem 0.7rem;
		color: #ef4444;
	}
	.close-btn:hover {
		color: #fff;
		background: #ef4444;
		border-color: #ef4444;
	}

	/* Telemetry bar */
	.hud-telemetry-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.45rem 1.4rem;
		background: rgba(4, 9, 18, 0.85);
		border-bottom: 1px solid rgba(0, 240, 255, 0.15);
		font-family: 'Courier New', monospace;
		font-size: 0.68rem;
		color: #38bdf8;
		letter-spacing: 0.05em;
	}
	.telemetry-text {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.dot-online {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #10b981;
		box-shadow: 0 0 8px #10b981;
	}

	.audio-equalizer {
		display: flex;
		align-items: flex-end;
		gap: 3px;
		height: 14px;
	}
	.audio-equalizer .bar {
		width: 3px;
		background: #00f0ff;
		border-radius: 2px;
		height: 4px;
		transition: height 0.1s ease;
	}
	.audio-equalizer.active .bar-1 {
		animation: eq1 0.4s infinite alternate;
	}
	.audio-equalizer.active .bar-2 {
		animation: eq2 0.5s infinite alternate;
	}
	.audio-equalizer.active .bar-3 {
		animation: eq3 0.3s infinite alternate;
	}
	.audio-equalizer.active .bar-4 {
		animation: eq4 0.6s infinite alternate;
	}
	.audio-equalizer.active .bar-5 {
		animation: eq5 0.45s infinite alternate;
	}

	@keyframes eq1 {
		from {
			height: 3px;
		}
		to {
			height: 12px;
		}
	}
	@keyframes eq2 {
		from {
			height: 6px;
		}
		to {
			height: 14px;
		}
	}
	@keyframes eq3 {
		from {
			height: 2px;
		}
		to {
			height: 10px;
		}
	}
	@keyframes eq4 {
		from {
			height: 5px;
		}
		to {
			height: 13px;
		}
	}
	@keyframes eq5 {
		from {
			height: 4px;
		}
		to {
			height: 11px;
		}
	}

	/* Body & Messages */
	.hud-body {
		flex: 1;
		padding: 1.2rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		scrollbar-width: thin;
		scrollbar-color: rgba(0, 240, 255, 0.4) transparent;
	}

	.msg-row {
		display: flex;
		gap: 0.85rem;
		max-width: 90%;
	}
	.msg-row.jarvis {
		align-self: flex-start;
	}
	.msg-row.user {
		align-self: flex-end;
		flex-direction: row-reverse;
	}

	.msg-avatar {
		flex-shrink: 0;
	}
	.avatar-jarvis {
		width: 34px;
		height: 34px;
		border-radius: 50%;
		background: radial-gradient(circle, #0284c7 0%, #082f49 100%);
		border: 1px solid #00f0ff;
		color: #fff;
		font-family: 'Courier New', monospace;
		font-weight: 800;
		font-size: 0.85rem;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 0 10px rgba(0, 240, 255, 0.4);
	}
	.avatar-user {
		width: 34px;
		height: 34px;
		border-radius: 50%;
		background: #d4af37;
		color: #030712;
		font-family: 'Courier New', monospace;
		font-weight: 900;
		font-size: 0.65rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.msg-bubble-wrap {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.msg-sender-label {
		font-family: 'Courier New', monospace;
		font-size: 0.62rem;
		font-weight: 700;
		color: #64748b;
		letter-spacing: 0.1em;
	}
	.msg-row.user .msg-sender-label {
		text-align: right;
		color: #d4af37;
	}

	.msg-bubble {
		padding: 0.85rem 1.05rem;
		border-radius: 12px;
		font-size: 0.88rem;
		line-height: 1.55;
	}
	.msg-row.jarvis .msg-bubble {
		background: rgba(15, 29, 53, 0.85);
		border: 1px solid rgba(0, 240, 255, 0.25);
		color: #e2e8f0;
		border-top-left-radius: 2px;
	}
	.msg-row.user .msg-bubble {
		background: linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.1) 100%);
		border: 1px solid rgba(212, 175, 55, 0.4);
		color: #f8fafc;
		border-top-right-radius: 2px;
	}

	.msg-text-content {
		color: #e2e8f0;
		font-size: 0.88rem;
		line-height: 1.6;
		word-break: break-word;
	}
	.msg-row.user .msg-text-content {
		color: #f8fafc;
	}
	:global(.hud-bold) {
		color: #38bdf8;
		font-weight: 600;
	}
	.msg-row.user :global(.hud-bold) {
		color: #fef08a;
	}
	:global(.hud-italic) {
		color: #94a3b8;
		font-style: italic;
	}
	:global(.hud-para) {
		margin-bottom: 0.65rem;
	}
	:global(.hud-para:last-child) {
		margin-bottom: 0;
	}
	:global(.hud-list-item) {
		display: flex;
		align-items: flex-start;
		gap: 0.45rem;
		margin: 0.25rem 0;
	}
	:global(.hud-bullet) {
		color: #00f0ff;
		font-size: 0.75rem;
		line-height: 1.6;
		flex-shrink: 0;
	}
	:global(.hud-num) {
		color: #00f0ff;
		font-weight: 700;
		font-size: 0.82rem;
		line-height: 1.6;
		flex-shrink: 0;
	}
	:global(.hud-list-content) {
		flex: 1;
	}

	.msg-action-box {
		margin-top: 0.75rem;
		padding-top: 0.65rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}
	.action-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.45rem 0.95rem;
		background: linear-gradient(135deg, #00f0ff 0%, #0284c7 100%);
		color: #030712;
		font-weight: 700;
		font-size: 0.8rem;
		border-radius: 6px;
		border: none;
		cursor: pointer;
		text-decoration: none;
		box-shadow: 0 4px 14px rgba(0, 240, 255, 0.35);
		transition: all 0.2s ease;
	}
	.action-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0, 240, 255, 0.55);
	}

	.msg-playback-row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.72rem;
		color: #38bdf8;
	}
	.playback-btn {
		background: transparent;
		border: 1px solid rgba(0, 240, 255, 0.3);
		color: #00f0ff;
		font-size: 0.7rem;
		font-weight: 600;
		padding: 0.2rem 0.55rem;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
	}
	.playback-btn:hover {
		background: rgba(0, 240, 255, 0.15);
		border-color: #00f0ff;
	}
	.voice-anim {
		font-family: 'Courier New', monospace;
		animation: blinkVoice 1s infinite alternate;
	}
	@keyframes blinkVoice {
		from {
			opacity: 0.4;
		}
		to {
			opacity: 1;
		}
	}

	/* Chips bar */
	.hud-chips-bar {
		padding: 0.65rem 1.1rem;
		background: rgba(5, 12, 24, 0.9);
		border-top: 1px solid rgba(0, 240, 255, 0.15);
		display: flex;
		align-items: center;
		gap: 0.45rem;
		overflow-x: auto;
		scrollbar-width: none;
	}
	.hud-chips-bar::-webkit-scrollbar {
		display: none;
	}
	.chips-label {
		font-family: 'Courier New', monospace;
		font-size: 0.62rem;
		font-weight: 800;
		color: #64748b;
		white-space: nowrap;
		letter-spacing: 0.08em;
	}
	.hud-chip {
		flex-shrink: 0;
		background: rgba(14, 28, 51, 0.85);
		border: 1px solid rgba(0, 240, 255, 0.25);
		color: #cbd5e1;
		font-size: 0.74rem;
		font-weight: 600;
		padding: 0.32rem 0.75rem;
		border-radius: 100px;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.2s ease;
	}
	.hud-chip:hover {
		background: rgba(0, 240, 255, 0.15);
		border-color: #00f0ff;
		color: #00f0ff;
		transform: translateY(-1px);
	}

	/* Footer form */
	.hud-footer {
		padding: 0.9rem 1.1rem;
		background: rgba(4, 10, 20, 0.95);
		border-top: 1px solid rgba(0, 240, 255, 0.2);
	}
	.hud-input-form {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		background: rgba(11, 23, 42, 0.9);
		border: 1px solid rgba(0, 240, 255, 0.35);
		border-radius: 10px;
		padding: 0.35rem 0.75rem;
		box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5);
		transition: border-color 0.2s;
	}
	.hud-input-form:focus-within {
		border-color: #00f0ff;
		box-shadow:
			inset 0 2px 8px rgba(0, 0, 0, 0.5),
			0 0 16px rgba(0, 240, 255, 0.3);
	}
	.input-icon {
		font-family: 'Courier New', monospace;
		font-weight: 800;
		color: #00f0ff;
		font-size: 1rem;
	}
	.hud-input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: #f1f5f9;
		font-size: 0.88rem;
		font-family: 'Inter', sans-serif;
	}
	.hud-input::placeholder {
		color: #64748b;
	}

	.hud-send-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		background: linear-gradient(135deg, #00f0ff 0%, #0284c7 100%);
		border: none;
		color: #030712;
		font-family: 'Courier New', monospace;
		font-weight: 800;
		font-size: 0.75rem;
		padding: 0.45rem 0.9rem;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
	}
	.hud-send-btn:hover {
		transform: scale(1.04);
		box-shadow: 0 0 12px rgba(0, 240, 255, 0.5);
	}
	.send-glyph {
		font-size: 0.9rem;
	}

	@media (max-width: 640px) {
		.jarvis-launcher {
			bottom: 1.25rem;
			right: 1.25rem;
		}
		.jarvis-hud-drawer {
			bottom: 0;
			right: 0;
			width: 100vw;
			height: 90vh;
			border-radius: 20px 20px 0 0;
		}
	}
</style>
