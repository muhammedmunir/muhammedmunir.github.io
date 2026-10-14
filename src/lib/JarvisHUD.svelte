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

	function initWelcome() {
		const greetingText =
			$lang === 'ms'
				? 'Protokol J.A.R.V.I.S diaktifkan. Salam sejahtera! Saya pembantu kecerdasan portfolio Muhammed Munir. Saya fasih berbahasa Melayu sepenuhnya. Telemetri sistem sedia untuk semakan: 3 platform sektor kerajaan, 16+ aplikasi inovasi, dan resume ATS. Sila pilih protokol atau taip apa sahaja pertanyaan anda.'
				: "J.A.R.V.I.S Protocol initialized. Greetings! I am the neural assistant for Muhammed Munir's portfolio, fully bilingual in Malay and English. Systems telemetry is online: 3 government platforms, 16+ innovation apps, and ATS resume. Please choose a protocol or ask any inquiry.";

		messages = [
			{
				id: Date.now(),
				sender: 'jarvis',
				text: greetingText
			}
		];

		if (voiceEnabled) {
			speak(greetingText);
		}
	}

	function getPreferredVoice(isMalay: boolean): SpeechSynthesisVoice | null {
		if (typeof window === 'undefined' || !window.speechSynthesis) return null;
		const voices = window.speechSynthesis.getVoices();
		if (!voices || voices.length === 0) return null;

		if (isMalay) {
			// Try Malaysian or Indonesian voices first
			const msVoice = voices.find(
				(v) =>
					v.lang.toLowerCase().includes('ms') ||
					v.lang.toLowerCase().includes('id') ||
					v.name.toLowerCase().includes('malay') ||
					v.name.toLowerCase().includes('indonesia')
			);
			if (msVoice) return msVoice;
		}

		// Fallback to high-quality natural/neural English voice
		const enVoice = voices.find(
			(v) =>
				v.lang.toLowerCase().startsWith('en') &&
				(v.name.includes('Natural') ||
					v.name.includes('Neural') ||
					v.name.includes('Google') ||
					v.name.includes('Online'))
		);
		return enVoice || voices[0] || null;
	}

	function stopVoice() {
		if (typeof window !== 'undefined' && window.speechSynthesis) {
			window.speechSynthesis.cancel();
			isSpeaking = false;
		}
	}

	function speak(text: string) {
		if (typeof window === 'undefined' || !window.speechSynthesis) return;
		try {
			window.speechSynthesis.cancel();
			const cleanText = text.replace(/[*_#`[\]()]/g, '');
			const utterance = new SpeechSynthesisUtterance(cleanText);

			const isMalay = $lang === 'ms';
			const chosenVoice = getPreferredVoice(isMalay);

			if (chosenVoice) {
				utterance.voice = chosenVoice;
				utterance.lang = chosenVoice.lang;
			} else {
				utterance.lang = isMalay ? 'id-ID' : 'en-US';
			}

			utterance.rate = 1.02;
			utterance.pitch = 1.0;

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
		let reply = '';
		let action: ChatMessage['action'] = undefined;

		playScan();

		// 1. Language & Identity queries in Malay
		if (
			q.includes('cakap melayu') ||
			q.includes('bahasa melayu') ||
			q.includes('cakap bm') ||
			q.includes('melayu') ||
			q.includes('boleh bahasa')
		) {
			reply =
				$lang === 'ms'
					? 'Tentu sekali! Saya J.A.R.V.I.S, dan saya fasih berbahasa Melayu sepenuhnya. Anda boleh bertanya tentang pengalaman kerja Munir di YHCM, perincian sistem kerajaan (eMesys, Sutera, ADIMS), aplikasi mobile seperti TINDAK dan Baby Kicking, ataupun memuat turun resume ATS beliau. Ada topik khusus yang anda ingin tahu?'
					: 'Absolutely! I am fully fluent in Bahasa Melayu and English. Feel free to ask about Munir’s public sector work at YHCM (eMesys, Sutera, ADIMS), his mobile & AI applications like TINDAK and Baby Kicking, or request his ATS Resume.';
		}
		// 2. Greetings
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
			reply =
				$lang === 'ms'
					? 'Salam sejahtera! Selamat datang ke portfolio Muhammed Munir. Sistem berada dalam keadaan 100% optimum. Sila beritahu apa yang anda ingin semak — sistem kerajaan, projek AI/mobile, kemahiran teknikal, atau resume ATS?'
					: "Greetings! Welcome to Muhammed Munir's portfolio. All telemetry systems are operational. Let me know what you would like to explore — government platforms, AI/mobile apps, technical skills, or ATS resume?";
		}
		// 3. Government / YHCM Systems (EMESYS, SUTERA, ADIMS)
		else if (
			q.includes('kerajaan') ||
			q.includes('gov') ||
			q.includes('yhcm') ||
			q.includes('emesys') ||
			q.includes('sutera') ||
			q.includes('adims') ||
			q.includes('pertahanan') ||
			q.includes('sektor awam')
		) {
			reply =
				$lang === 'ms'
					? 'Bagi YHCM Enterprise, Munir menggalas tanggungjawab membangunkan dan menyelenggara 3 sistem kritikal sektor awam & pertahanan: (1) EMESYS — Sistem Pengurusan Aset & Pembaikan Pertahanan merangkumi 5 modul (Aset 7 Kategori, Job Woksyop S1/S2/S3, Pembaikan Tempatan PT/PO, Penyata S1/S2, & Dashboard Servisibiliti). (2) SUTERA — Platform Kesiapsiagaan Aset Kejuruteraan dengan 5 modul (KJC, B3/B4, PKJ disegerakkan ke SPATD, laporan PDF, & Dashboard Kesiagaan). (3) ADIMS — Sistem Pengurusan Aset Digital dengan Kod QR, log audit Spatie, storan AWS S3, Google 2FA, dan baris giliran Laravel Horizon. Semua sistem dibina dengan Docker Swarm, Linux, dan kawalan RBAC ketat.'
					: 'At YHCM Enterprise, Munir builds and maintains 3 mission-critical public sector & defense platforms: (1) EMESYS — 5-module defense asset and workshop repair management system (Assets, S1/S2/S3 jobs, local contracts, statements, serviceability dashboard). (2) SUTERA — 5-module engineering asset readiness system synchronized with SPATD (KJC, B3/B4 repair directives, PKJ, defense readiness dashboard). (3) ADIMS — Digital asset management system featuring physical QR tracking, Spatie audit logging, AWS S3 storage, Google 2FA, and Laravel Horizon queues. Deployed via Docker Swarm on hardened Linux.';
			action = {
				label: $lang === 'ms' ? '🏛️ Lihat Bilik Kebal Kerajaan' : '🏛️ View Government Vault',
				callback: () => {
					isOpen = false;
					window.location.hash = '#projects';
				}
			};
		}
		// 4. Mobile & Health Apps (TINDAK, Baby Kicking, JioFarm, Tax Relief)
		else if (
			q.includes('mobile') ||
			q.includes('aplikasi') ||
			q.includes('app') ||
			q.includes('baby') ||
			q.includes('kicking') ||
			q.includes('tax') ||
			q.includes('cukai') ||
			q.includes('jiofarm')
		) {
			reply =
				$lang === 'ms'
					? 'Aplikasi mudah alih dan produk pintar Munir merangkumi: (1) Baby Kicking Suite — Aplikasi Flutter rentas platform (Android, iOS, Web) dengan Firebase Firestore & Cloud Functions untuk pemantauan pergerakan bayi dan eksport laporan klinikal PDF. (2) TINDAK — Enjin tindakan pintar Android (Share Intent, Local-First parsing, Gemini AI & Supabase RLS). (3) Tax Relief Malaysia — Pengoptimum pelepasan cukai pendapatan LHDN interaktif. (4) JioFarm — Platform telemetri IoT pertanian pintar berasaskan Python.'
					: "Munir's mobile applications and smart tools include: (1) Baby Kicking Suite — Cross-platform Flutter mobile app (Android, iOS, Web) with Firebase Firestore & Cloud Functions tracking fetal movement and generating clinical PDF exports. (2) TINDAK — AI-powered Android action layer (Share Intent, Local-First parsing, Gemini AI & Supabase RLS). (3) Tax Relief Malaysia — Smart LHDN personal income tax deduction optimizer. (4) JioFarm — Python-powered smart agriculture IoT sensor telemetry platform.";
			action = {
				label: $lang === 'ms' ? '📱 Lihat Aplikasi Mobile' : '📱 View Mobile Apps',
				callback: () => {
					isOpen = false;
					window.location.hash = '#projects';
				}
			};
		}
		// 5. AI, Computer Vision & Agents (9Router, CV Bot, Gemini)
		else if (
			q.includes('ai') ||
			q.includes('agent') ||
			q.includes('ejen') ||
			q.includes('9router') ||
			q.includes('cv bot') ||
			q.includes('vision') ||
			q.includes('opencv') ||
			q.includes('gemini') ||
			q.includes('mcp')
		) {
			reply =
				$lang === 'ms'
					? 'Kejuruteraan AI & Automasi Munir: (1) 9Router Office — Persekitaran pejabat maya 3D Three.js dengan orkestrasi berbilang ejen AI autonomi, Model Context Protocol (MCP SDK), jambatan suara interaktif, dan ujian Playwright. (2) Computer Vision Bot — Automasi desktop Python memanfaatkan OpenCV (pemadanan templat SIFT homography, segmentasi warna CIELAB, OCR dinamik, & visual servoing Win32). (3) TINDAK Gemini AI Fallback — Integrasi kecerdasan buatan untuk pemahaman teks rumit tanpa membebankan peranti pengguna.'
					: "Munir's AI & Autonomous Engineering: (1) 9Router Office — Interactive Three.js 3D virtual office orchestrating multi-agent AI teams via Model Context Protocol (MCP SDK), live voice services, and Playwright verification. (2) Computer Vision Bot — High-speed Python desktop automation utilizing OpenCV (SIFT homography, CIELAB segmentation, OCR, & closed-loop Win32 visual servoing). (3) TINDAK Gemini AI — Dynamic AI fallback for complex unstructured text understanding.";
			action = {
				label: $lang === 'ms' ? '🤖 Lihat Projek AI' : '🤖 View AI Projects',
				callback: () => {
					isOpen = false;
					window.location.hash = '#projects';
				}
			};
		}
		// 6. Summary / Profile / Bio
		else if (
			q === 'summary' ||
			q.includes('ringkasan') ||
			q.includes('profil') ||
			q.includes('siapa munir') ||
			q.includes('biodata') ||
			q.includes('who') ||
			q.includes('about')
		) {
			reply =
				$lang === 'ms'
					? 'Muhammed Munir Bin Mohd Azmi adalah Pembangun Full-Stack & Profesional IT berpangkalan di Bandar Puteri Puchong, Selangor. Berkelulusan B.Sc. Sains Komputer (Keselamatan Rangkaian) UTM (PNGK 3.17). Beliau mempunyai rekod pencapaian terbukti dalam membina sistem berskala besar sektor awam kerajaan (eMesys, Sutera, ADIMS) menggunakan Vue.js 3 dan Laravel, aplikasi Flutter pintar, ejen AI 3D, serta pemantauan keselamatan siber Splunk SIEM.'
					: 'Muhammed Munir Bin Mohd Azmi is a Full-Stack Developer & IT Professional based in Puchong, Selangor. Holds a B.Sc. in Computer Science (Network Security) from UTM (CGPA 3.17). Proven track record engineering public-sector government platforms (eMesys, Sutera, ADIMS) with Vue.js 3 and Laravel, smart Flutter applications, 3D AI agent environments, and Splunk SIEM cybersecurity operations.';
		}
		// 7. Tech Stack & Skills
		else if (
			q === 'skills' ||
			q.includes('tech') ||
			q.includes('kemahiran') ||
			q.includes('stack') ||
			q.includes('bahasa') ||
			q.includes('framework')
		) {
			reply =
				$lang === 'ms'
					? 'Senjata Teknologi Utama: [Frontend & Mobile] Vue.js 3, SvelteKit 5, Flutter/Dart, React, Three.js 3D, Tailwind CSS. [Backend & Database] Laravel 11/12, PHP 8.4/8.5, Node.js, Python, PostgreSQL 17, MariaDB/MySQL, Supabase RLS, Redis 8. [Keselamatan & DevOps] Docker Swarm, Linux Ubuntu, Splunk SIEM, Vulhub CVE, Azure, Jenkins CI/CD, Git, Cisco CCNA.'
					: 'Core Arsenal: [Frontend & Mobile] Vue.js 3, SvelteKit 5, Flutter/Dart, React, Three.js 3D, Tailwind CSS. [Backend & Database] Laravel 11/12, PHP 8.4/8.5, Node.js, Python, PostgreSQL 17, MariaDB/MySQL, Supabase RLS, Redis 8. [Security & DevOps] Docker Swarm, Linux Ubuntu, Splunk SIEM, Vulhub CVE, Microsoft Azure, Jenkins CI/CD, Cisco CCNA.';
			action = {
				label: $lang === 'ms' ? '🎯 Lihat Matriks Kemahiran' : '🎯 View Skills Matrix',
				callback: () => {
					isOpen = false;
					window.location.hash = '#skills';
				}
			};
		}
		// 8. Work Experience
		else if (
			q.includes('pengalaman') ||
			q.includes('kerja') ||
			q.includes('experience') ||
			q.includes('tnb') ||
			q.includes('nova')
		) {
			reply =
				$lang === 'ms'
					? 'Perjalanan Kerjaya Munir: (1) YHCM Sdn Bhd — Full-Stack Enterprise Programmer bagi sistem sektor awam eMesys, Sutera, dan ADIMS (Vue 3, Laravel Filament, Docker, Linux). (2) Nova Bitara Development — Pembangun Web & IT Support membina sistem pinjaman IWA001 dan portal Infinity World. (3) Tenaga Nasional Berhad (TNB) — Pembangun full-stack aplikasi mobiliti Onboardx (Flutter/Azure) dan Operasi Keselamatan Siber (Splunk SIEM, Red/Blue team CVE testing).'
					: "Munir's Career Trajectory: (1) YHCM Sdn Bhd — Full-Stack Enterprise Programmer supporting government platforms eMesys, Sutera, and ADIMS (Vue 3, Laravel, Docker, Linux). (2) Nova Bitara Development — IT Support & Web Developer engineering IWA001 loan platform and Infinity World corporate portal. (3) Tenaga Nasional Berhad (TNB) — Full-stack developer for Onboardx enterprise mobile app & Cybersecurity Operations analyst (Splunk SIEM, Vulhub CVE).";
			action = {
				label: $lang === 'ms' ? '💼 Lihat Garis Masa Pengalaman' : '💼 View Experience Timeline',
				callback: () => {
					isOpen = false;
					window.location.hash = '#experience';
				}
			};
		}
		// 9. Games, Simulators & Physics (AeroCar X, 9Ball, RPG, City)
		else if (
			q === 'game' ||
			q.includes('game') ||
			q.includes('permainan') ||
			q.includes('rpg') ||
			q.includes('city') ||
			q.includes('aerocar') ||
			q.includes('kereta terbang') ||
			q.includes('9ball') ||
			q.includes('sudoku')
		) {
			reply =
				$lang === 'ms'
					? 'Munir telah membina pelbagai simulator dan enjin permainan: (1) Cyberpunk Spaceship RPG Explorer — Pengembaraan kapal angkasa interaktif dengan sistem bilik dan arkib rahsia. (2) Cyber City Explorer — Peta bandar isometrik Canvas 2.5D masa nyata. (3) AeroCar X — Simulator penerbangan kereta futuristik Canvas. (4) Foony 9-Ball Master — Enjin fizik biliard Chromium Extension. Mahu melancarkan Cyberpunk RPG sekarang?'
					: 'Munir has engineered various simulation and physics interactive experiences: (1) Cyberpunk Spaceship RPG Explorer — Interactive spaceship with room terminals and encrypted data logs. (2) Cyber City Explorer — Real-time 2.5D canvas isometric city navigator. (3) AeroCar X — Futuristic Canvas flight simulator. (4) Foony 9-Ball Master — Real-time vector billiards physics extension. Would you like to teleport to the RPG now?';
			action = {
				label: $lang === 'ms' ? '🚀 Lancarkan Cyberpunk RPG' : '🚀 Launch Cyberpunk RPG',
				callback: () => {
					isOpen = false;
					playWarp();
					goto('/games');
				}
			};
		}
		// 10. Resume / ATS CV
		else if (
			q === 'resume' ||
			q.includes('cv') ||
			q.includes('dossier') ||
			q.includes('download') ||
			q.includes('muat turun')
		) {
			reply =
				$lang === 'ms'
					? 'Dossier Resume ATS Muhammed Munir yang dioptimumkan untuk sistem pemprosesan pengambilan kerja sedia untuk dimuat turun dalam format PDF berstruktur tinggi.'
					: "Muhammed Munir's ATS-optimized Resume dossier is ready for immediate download in structured PDF format.";
			action = {
				label: $lang === 'ms' ? '📥 Muat Turun Resume ATS (PDF)' : '📥 Download ATS Resume (PDF)',
				href: '/resume.pdf'
			};
		}
		// 11. Contact
		else if (
			q.includes('contact') ||
			q.includes('hubungi') ||
			q.includes('telefon') ||
			q.includes('phone') ||
			q.includes('email') ||
			q.includes('emel')
		) {
			reply =
				$lang === 'ms'
					? 'Saluran Komunikasi Terus Muhammed Munir: E-mel: muhammed.munir97.mm@gmail.com | Telefon / WhatsApp: +6013-5636124 | Lokasi: Bandar Puteri, Puchong, Selangor. Beliau terbuka untuk peluang sepenuh masa, kontrak gred perusahaan, atau perundingan teknikal.'
					: 'Direct Communications for Muhammed Munir: Email: muhammed.munir97.mm@gmail.com | Phone / WhatsApp: +6013-5636124 | Location: Puchong, Selangor. He is available for full-time senior engineering, enterprise contracts, or technical consultations.';
			action = {
				label: $lang === 'ms' ? '📞 Buka Borang Mesej Terus' : '📞 Open Direct Message Form',
				callback: () => {
					isOpen = false;
					window.location.hash = '#contact';
				}
			};
		}
		// 12. Diagnostics
		else if (q === 'diag' || q.includes('diagnostik') || q.includes('test')) {
			reply =
				$lang === 'ms'
					? 'DIAGNOSTIK SISTEM SELESAI: [✓] Core SvelteKit 5: RUNES AKTIF [✓] Bilik Kebal Kerajaan: 3 SISTEM TERSEDIA (eMesys, Sutera, ADIMS) [✓] Aplikasi Inovasi: 16 SISTEM AKTIF [✓] Pangkalan Data: RLS & RBAC ENFORCED [✓] Keselamatan: SOC COMPLIANT [✓] Status Munir: TERSEDIA UNTUK TEMUDUGA.'
					: 'SYSTEM DIAGNOSTICS COMPLETE: [✓] Core SvelteKit 5: RUNES ACTIVE [✓] Gov Vault: 3 PLATFORMS ONLINE (eMesys, Sutera, ADIMS) [✓] Innovation Apps: 16 SYSTEMS ACTIVE [✓] Database: RLS & RBAC ENFORCED [✓] Security: SOC COMPLIANT [✓] Candidate Status: AVAILABLE FOR HIRE.';
		}
		// 13. Fallback with smart Malay guidance
		else {
			reply =
				$lang === 'ms'
					? `Perintah "${rawQuery}" diterima. Saya boleh menerangkan 3 sistem kerajaan YHCM (eMesys, Sutera, ADIMS), aplikasi mobile Flutter & AI (TINDAK, Baby Kicking, 9Router), kemahiran teknikal Munir, atau memuat turun resume ATS beliau. Sila klik salah satu cadangan di bawah!`
					: `Query "${rawQuery}" acknowledged. I can explain the 3 YHCM government platforms (eMesys, Sutera, ADIMS), mobile & AI innovations (TINDAK, Baby Kicking, 9Router), Munir's core skills, or download his ATS resume. Select one of the quick prompts below!`;
		}

		const jarvisMsg: ChatMessage = {
			id: Date.now() + 1,
			sender: 'jarvis',
			text: reply,
			action
		};

		messages = [...messages, jarvisMsg];

		if (voiceEnabled) {
			speak(reply);
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
			speak(msg);
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
			window.speechSynthesis.getVoices();
			window.speechSynthesis.onvoiceschanged = () => {
				window.speechSynthesis.getVoices();
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

<!-- Floating JARVIS Arc-Reactor Core Trigger -->
<div class="jarvis-launcher">
	<button
		class="sfx-toggle"
		onclick={toggleSfx}
		title={$sfxEnabled ? 'Matikan kesan audio' : 'Hidupkan kesan audio'}
		aria-label="Toggle SFX Audio"
	>
		{#if $sfxEnabled}
			<span class="icon">🔊</span>
		{:else}
			<span class="icon">🔇</span>
		{/if}
	</button>

	<button
		class="arc-reactor-trigger"
		class:active={isOpen}
		onclick={toggleOpen}
		title="Buka J.A.R.V.I.S AI Assistant (Ctrl + J)"
		aria-label="Toggle JARVIS AI Interface"
	>
		<div class="reactor-outer-ring"></div>
		<div class="reactor-inner-ring"></div>
		<div class="reactor-core">
			<span class="core-glyph">AI</span>
		</div>
		<span class="reactor-ping"></span>
		<span class="reactor-label">J.A.R.V.I.S</span>
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
							{msg.sender === 'jarvis' ? 'J.A.R.V.I.S NEURAL CORE' : 'PENGGUNA // OPERATOR'}
						</div>
						<div class="msg-bubble">
							<p class="msg-text">{msg.text}</p>

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
									onclick={() => speak(msg.text)}
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
		bottom: 2rem;
		right: 2rem;
		z-index: 990;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.sfx-toggle {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: rgba(11, 23, 42, 0.85);
		border: 1px solid rgba(0, 240, 255, 0.35);
		color: #e2e8f0;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		backdrop-filter: blur(12px);
		box-shadow: 0 4px 18px rgba(0, 0, 0, 0.4);
		transition: all 0.25s ease;
		font-size: 1.15rem;
	}
	.sfx-toggle:hover {
		transform: scale(1.08);
		border-color: #00f0ff;
		box-shadow: 0 0 16px rgba(0, 240, 255, 0.4);
	}

	/* Arc Reactor Trigger */
	.arc-reactor-trigger {
		position: relative;
		width: 66px;
		height: 66px;
		border-radius: 50%;
		background: radial-gradient(circle, #0a1f33 0%, #030a14 100%);
		border: 2px solid rgba(0, 240, 255, 0.6);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow:
			0 0 25px rgba(0, 240, 255, 0.35),
			inset 0 0 15px rgba(0, 240, 255, 0.2);
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
		outline: none;
	}
	.arc-reactor-trigger:hover,
	.arc-reactor-trigger.active {
		transform: scale(1.08);
		border-color: #00f0ff;
		box-shadow:
			0 0 35px rgba(0, 240, 255, 0.6),
			inset 0 0 20px rgba(0, 240, 255, 0.4);
	}

	.reactor-outer-ring {
		position: absolute;
		inset: 3px;
		border-radius: 50%;
		border: 2px dashed rgba(0, 240, 255, 0.5);
		animation: spinClockwise 12s linear infinite;
	}
	.reactor-inner-ring {
		position: absolute;
		inset: 8px;
		border-radius: 50%;
		border: 1.5px dotted rgba(212, 175, 55, 0.6);
		animation: spinCounter 7s linear infinite;
	}
	.reactor-core {
		position: relative;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: radial-gradient(circle, #00f0ff 0%, #0284c7 70%, #082f49 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 0 16px #00f0ff;
	}
	.core-glyph {
		font-family: 'Courier New', monospace;
		font-weight: 900;
		font-size: 0.72rem;
		color: #030712;
		letter-spacing: 0.05em;
	}

	.reactor-ping {
		position: absolute;
		inset: -6px;
		border-radius: 50%;
		border: 2px solid rgba(0, 240, 255, 0.5);
		animation: pingReactor 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
		pointer-events: none;
	}
	.reactor-label {
		position: absolute;
		bottom: -20px;
		font-family: 'Courier New', monospace;
		font-size: 0.65rem;
		font-weight: 800;
		letter-spacing: 0.15em;
		color: #00f0ff;
		text-shadow: 0 0 8px rgba(0, 240, 255, 0.6);
		white-space: nowrap;
	}

	@keyframes spinClockwise {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	@keyframes spinCounter {
		from {
			transform: rotate(360deg);
		}
		to {
			transform: rotate(0deg);
		}
	}
	@keyframes pingReactor {
		0% {
			transform: scale(0.95);
			opacity: 0.8;
		}
		70%,
		100% {
			transform: scale(1.4);
			opacity: 0;
		}
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
