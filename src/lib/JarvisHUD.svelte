<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { lang } from '$lib/i18n';
	import { translations } from '$lib/translations';
	import { derived } from 'svelte/store';
	import { playBlip, playConfirm, playScan, playWarp, sfxEnabled, toggleSfx } from '$lib/sound';
	import { goto } from '$app/navigation';

	let isOpen = $state(false);
	let voiceEnabled = $state(false);
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
			}, 50);
		} else {
			playBlip(440, 0.05);
		}
	}

	function initWelcome() {
		const greetingText =
			$lang === 'ms'
				? 'Protokol J.A.R.V.I.S diaktifkan. Salam perkenalan. Saya pembantu kecerdasan portfolio Muhammed Munir. Semua telemetri sistem sedia untuk semakan anda. Sila pilih protokol di bawah atau taip sebarang pertanyaan.'
				: "J.A.R.V.I.S Protocol initialized. Greetings. I am Muhammed Munir's neural portfolio assistant. All system telemetry is online. Please select a protocol below or type your inquiry.";

		messages = [
			{
				id: Date.now(),
				sender: 'jarvis',
				text: greetingText
			}
		];

		speak(greetingText);
	}

	function speak(text: string) {
		if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
		try {
			window.speechSynthesis.cancel();
			const cleanText = text.replace(/[*_#`]/g, '');
			const utterance = new SpeechSynthesisUtterance(cleanText);
			utterance.rate = 1.05;
			utterance.pitch = 0.95;
			utterance.lang = $lang === 'ms' ? 'id-ID' : 'en-US';
			window.speechSynthesis.speak(utterance);
		} catch {
			// Ignore voice error
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
		}, 250);
	}

	function executeProtocol(rawQuery: string) {
		const q = rawQuery.toLowerCase().trim();
		let reply = '';
		let action: ChatMessage['action'] = undefined;

		playScan();

		if (
			q === 'summary' ||
			q.includes('ringkasan') ||
			q.includes('profil') ||
			q.includes('about') ||
			q.includes('who')
		) {
			reply =
				$lang === 'ms'
					? 'Muhammed Munir Bin Mohd Azmi adalah Pembangun Full-Stack & Profesional IT berpangkalan di Puchong, Selangor. Berkelulusan B.Sc. Sains Komputer (Keselamatan Rangkaian) UTM (PNGK 3.17). Pakar dalam ekosistem Vue.js, Laravel, SvelteKit, Flutter, Python Computer Vision, serta infrastruktur awan Azure/Vercel dan Splunk SIEM.'
					: 'Muhammed Munir Bin Mohd Azmi is a Full-Stack Developer & IT Professional based in Puchong, Selangor. Holds a B.Sc. in Computer Science (Network Security) from UTM (CGPA 3.17). Specializes in Vue.js, Laravel, SvelteKit, Flutter, Python Computer Vision, Azure/Vercel cloud infrastructure, and Splunk SIEM.';
		} else if (
			q === 'yhcm' ||
			q.includes('kerajaan') ||
			q.includes('gov') ||
			q.includes('work') ||
			q.includes('pengalaman')
		) {
			reply =
				$lang === 'ms'
					? 'Bagi YHCM Sdn Bhd, Munir bertindak sebagai Full-Stack Enterprise Programmer yang menyelenggara sistem sektor awam / kerajaan kritikal (eMesys, Sutera, ADIMS). Membangunkan frontend Vue.js 3, backend Laravel Filament, pengoptimuman MariaDB/MySQL, dan deployment kontena Docker di pelayan Linux dengan kawalan akses ketat (RBAC).'
					: 'At YHCM Sdn Bhd, Munir serves as a Full-Stack Enterprise Programmer maintaining mission-critical public/government sector systems (eMesys, Sutera, ADIMS). Responsibilities cover Vue.js 3 frontend, Laravel Filament backend, MariaDB/MySQL optimization, and Docker container deployments on Linux with strict RBAC security.';
		} else if (
			q === 'projects' ||
			q.includes('tindak') ||
			q.includes('cv') ||
			q.includes('bot') ||
			q.includes('projek')
		) {
			reply =
				$lang === 'ms'
					? 'Projek inovasi terkini: (1) TINDAK — Enjin tindakan pintar Android (Flutter + Supabase RLS + Gemini AI fallback). (2) Computer Vision Bot — Automasi Win32 & OpenCV (SIFT pyramid, CIELAB masking, visual servoing). (3) Lumina Glass — Visualizer cermin LED Kelvin (SvelteKit + Laravel 11). (4) IWA001 — Sistem Pinjaman Bercagar (Supabase RLS).'
					: 'Featured innovations: (1) TINDAK — AI-powered Android action engine (Flutter + Supabase RLS + Gemini AI fallback). (2) Computer Vision Bot — Win32 & OpenCV automation (SIFT pyramid, CIELAB masking, visual servoing). (3) Lumina Glass — Interactive LED Kelvin mirror visualizer (SvelteKit + Laravel 11). (4) IWA001 — Collateralized Loan System (Supabase RLS).';
			action = {
				label: $lang === 'ms' ? 'Lihat Semua Projek' : 'View All Projects',
				callback: () => {
					isOpen = false;
					window.location.hash = '#projects';
				}
			};
		} else if (
			q === 'skills' ||
			q.includes('tech') ||
			q.includes('kemahiran') ||
			q.includes('stack')
		) {
			reply =
				$lang === 'ms'
					? 'Senjata Utama: Frontend (SvelteKit, Vue.js, React.js, Tailwind CSS, Flutter). Backend (Laravel, PHP, Node.js, C#, Supabase, Redis). Keselamatan (Splunk SIEM, Vulhub CVE, Wireshark, RLS, Cisco CCNA). DevOps (Docker, Linux/Ubuntu, Azure, Jenkins, Git).'
					: 'Technical Arsenal: Frontend (SvelteKit, Vue.js, React.js, Tailwind CSS, Flutter). Backend (Laravel, PHP, Node.js, C#, Supabase, Redis). Security (Splunk SIEM, Vulhub CVE, Wireshark, Supabase RLS, Cisco CCNA). DevOps (Docker, Linux/Ubuntu, Azure, Jenkins, Git).';
		} else if (
			q === 'resume' ||
			q.includes('cv') ||
			q.includes('dossier') ||
			q.includes('download')
		) {
			reply =
				$lang === 'ms'
					? 'Dossier Resume ATS Muhammed Munir sedia dimuat turun dalam format PDF berstruktur tinggi.'
					: "Muhammed Munir's ATS-optimized Resume dossier is ready for download in structured PDF format.";
			action = {
				label: $lang === 'ms' ? '📥 Muat Turun Resume (PDF)' : '📥 Download Resume (PDF)',
				href: '/resume.pdf'
			};
		} else if (q === 'rpg' || q === 'game' || q.includes('game') || q.includes('cyberpunk')) {
			reply =
				$lang === 'ms'
					? 'Melancarkan teleportasi ke Cyberpunk Spaceship RPG Explorer. Menyediakan sistem bilik dan arkib rahsia...'
					: 'Warping to Cyberpunk Spaceship RPG Explorer. Preparing interactive room systems and encrypted archives...';
			playWarp();
			setTimeout(() => {
				isOpen = false;
				goto('/games');
			}, 700);
		} else if (q === 'city' || q.includes('city') || q.includes('bandar')) {
			reply =
				$lang === 'ms'
					? 'Memulakan pengesanan satelit Cyber City Explorer 2.5D Isometric Canvas...'
					: 'Initializing Cyber City Explorer 2.5D Isometric Canvas satellite telemetry...';
			playWarp();
			setTimeout(() => {
				isOpen = false;
				goto('/city');
			}, 700);
		} else if (q === 'diag' || q.includes('diagnostik') || q.includes('test')) {
			reply =
				$lang === 'ms'
					? 'DIAGNOSTIK SISTEM SELESAI: [✓] Core SvelteKit 5: RUNES_ACTIVE [✓] Rangkaian: SECURE [✓] Integriti Pangkalan Data: RLS_ENFORCED [✓] Keselamatan Siber: SOC_COMPLIANT [✓] Status Calon: TERSEDIA UNTUK TEMUDUGA.'
					: 'SYSTEM DIAGNOSTICS COMPLETE: [✓] Core SvelteKit 5: RUNES_ACTIVE [✓] Network: SECURE [✓] Database Integrity: RLS_ENFORCED [✓] Cybersecurity: SOC_COMPLIANT [✓] Candidate Status: AVAILABLE FOR HIRE.';
		} else if (
			q.includes('contact') ||
			q.includes('hubungi') ||
			q.includes('email') ||
			q.includes('phone')
		) {
			reply =
				$lang === 'ms'
					? 'Saluran Perhubungan: E-mel: muhammed.munir97.mm@gmail.com | Telefon: +6013-5636124 | Lokasi: Bandar Puteri, Puchong, Selangor. Atau gunakan borang penghantaran terus di bawah.'
					: 'Direct Communications: Email: muhammed.munir97.mm@gmail.com | Phone: +6013-5636124 | Location: Puchong, Selangor. Or use the direct message form on the site.';
			action = {
				label: $lang === 'ms' ? 'Buka Bahagian Hubungi' : 'Open Contact Form',
				callback: () => {
					isOpen = false;
					window.location.hash = '#contact';
				}
			};
		} else {
			reply =
				$lang === 'ms'
					? `Perintah "${rawQuery}" direkodkan. Anda boleh meminta ringkasan profil, pengalaman YHCM, projek TINDAK/CV Bot, muat turun resume, atau pelancaran RPG Explorer.`
					: `Command "${rawQuery}" acknowledged. You can query profile summary, YHCM experience, TINDAK/CV Bot projects, download resume, or launch the RPG Explorer.`;
		}

		const jarvisMsg: ChatMessage = {
			id: Date.now() + 1,
			sender: 'jarvis',
			text: reply,
			action
		};

		messages = [...messages, jarvisMsg];
		speak(reply);
		scrollToBottom();
	}

	function handleFormSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!userInput.trim()) return;
		const input = userInput;
		userInput = '';
		handleCommand(input);
	}

	onMount(() => {
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				isOpen = false;
			}
			if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
				e.preventDefault();
				toggleOpen();
			}
		};
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
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
			<span class="sfx-icon">🔊</span>
		{:else}
			<span class="sfx-icon muted">🔇</span>
		{/if}
	</button>

	<button
		class="jarvis-orb-btn"
		onclick={toggleOpen}
		id="jarvis-trigger-btn"
		aria-label="Buka J.A.R.V.I.S Neural HUD Assistant"
		aria-expanded={isOpen}
	>
		<div class="orb-ring-outer"></div>
		<div class="orb-ring-inner"></div>
		<div class="orb-core">
			<span class="orb-text">AI</span>
		</div>
		<span class="orb-pulse"></span>
		<div class="orb-tooltip">
			<span class="hud-tag">J.A.R.V.I.S</span>
			<span class="hud-status">ONLINE</span>
		</div>
	</button>
</div>

<!-- J.A.R.V.I.S Holographic Neural HUD Modal -->
{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
	<div class="jarvis-backdrop" onclick={() => (isOpen = false)} role="presentation">
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div
			class="jarvis-hud-modal"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			aria-labelledby="hud-title"
			tabindex="-1"
		>
			<!-- Cyber Hologram Header -->
			<header class="hud-header">
				<div class="hud-header-left">
					<div class="hud-reactor-mini" aria-hidden="true">
						<div class="mini-spin"></div>
						<div class="mini-core"></div>
					</div>
					<div>
						<div class="hud-sup-label">{$t.hud_badge}</div>
						<h2 id="hud-title" class="hud-title">{$t.status_title}</h2>
					</div>
				</div>

				<!-- Telemetry audio visualizer bars -->
				<div class="audio-visualizer" aria-hidden="true">
					{#each Array(10) as _, i}
						<span class="audio-bar" style="animation-delay: {i * 0.12}s"></span>
					{/each}
				</div>

				<div class="hud-header-controls">
					<button
						class="control-pill"
						class:active={voiceEnabled}
						onclick={() => {
							voiceEnabled = !voiceEnabled;
							playBlip(600, 0.05);
						}}
						title="Toggle Text-To-Speech Audio Voice"
					>
						{voiceEnabled ? $t.voice_on : $t.voice_off}
					</button>
					<button
						class="close-hud-btn"
						onclick={() => (isOpen = false)}
						aria-label="Tutup JARVIS HUD"
					>
						✕
					</button>
				</div>
			</header>

			<!-- Telemetry Strip -->
			<div class="hud-telemetry-strip">
				<span class="live-dot" aria-hidden="true"></span>
				<span class="telemetry-text">{$t.telemetry}</span>
				<span class="telemetry-hint">CTRL+J to toggle</span>
			</div>

			<!-- Quick Action Protocol Chips -->
			<div class="protocol-chips">
				{#each $t.chips as chip}
					<button class="chip-btn" onclick={() => handleCommand(chip.query)}>
						{chip.label}
					</button>
				{/each}
			</div>

			<!-- Messages Stream -->
			<div class="hud-messages" bind:this={messagesContainer}>
				{#each messages as msg}
					<div class="msg-row" class:user={msg.sender === 'user'}>
						{#if msg.sender === 'jarvis'}
							<div class="jarvis-avatar" aria-hidden="true">AI</div>
						{/if}
						<div class="msg-bubble" class:bubble-user={msg.sender === 'user'}>
							<div class="bubble-sender">{msg.sender === 'jarvis' ? 'J.A.R.V.I.S' : 'USER'}</div>
							<p class="bubble-text">{msg.text}</p>
							{#if msg.action}
								<div class="msg-action-wrap">
									{#if msg.action.href}
										<a
											href={msg.action.href}
											target="_blank"
											rel="noopener noreferrer"
											class="msg-action-btn"
											download
										>
											{msg.action.label}
										</a>
									{:else if msg.action.callback}
										<button class="msg-action-btn" onclick={msg.action.callback}>
											{msg.action.label}
										</button>
									{/if}
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>

			<!-- Input Bar -->
			<form class="hud-input-bar" onsubmit={handleFormSubmit}>
				<div class="input-glow-wrap">
					<span class="cli-prompt" aria-hidden="true">&gt;&gt;</span>
					<input
						type="text"
						bind:value={userInput}
						placeholder={$t.input_placeholder}
						class="hud-input"
						autocomplete="off"
					/>
					<button type="submit" class="hud-send-btn" aria-label="Hantar Perintah">
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
						>
							<line x1="22" y1="2" x2="11" y2="13"></line>
							<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
						</svg>
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	/* Floating trigger container */
	.jarvis-launcher {
		position: fixed;
		bottom: 2rem;
		left: 2rem;
		z-index: 600;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.sfx-toggle {
		width: 38px;
		height: 38px;
		border-radius: 50%;
		background: rgba(10, 20, 35, 0.85);
		border: 1px solid rgba(0, 240, 255, 0.3);
		color: #00f0ff;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		backdrop-filter: blur(10px);
		transition: all 0.25s ease;
	}
	.sfx-toggle:hover {
		border-color: #00f0ff;
		transform: scale(1.08);
		box-shadow: 0 0 15px rgba(0, 240, 255, 0.4);
	}
	.sfx-icon {
		font-size: 0.95rem;
	}
	.sfx-icon.muted {
		opacity: 0.5;
		filter: grayscale(1);
	}

	/* Holographic Orb Button */
	.jarvis-orb-btn {
		position: relative;
		width: 58px;
		height: 58px;
		border-radius: 50%;
		background: radial-gradient(circle, #051428 20%, #020712 90%);
		border: 1px solid rgba(0, 240, 255, 0.5);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow:
			0 0 25px rgba(0, 240, 255, 0.35),
			0 8px 30px rgba(0, 0, 0, 0.6);
		transition:
			transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
			box-shadow 0.3s ease;
	}
	.jarvis-orb-btn:hover {
		transform: scale(1.1);
		box-shadow:
			0 0 35px rgba(0, 240, 255, 0.6),
			0 0 15px rgba(212, 175, 55, 0.4);
	}

	.orb-ring-outer {
		position: absolute;
		inset: -4px;
		border-radius: 50%;
		border: 1.5px dashed rgba(0, 240, 255, 0.55);
		animation: rotateRing 12s linear infinite;
	}
	.orb-ring-inner {
		position: absolute;
		inset: 2px;
		border-radius: 50%;
		border: 1px solid rgba(212, 175, 55, 0.4);
		animation: rotateRingRev 8s linear infinite;
	}
	@keyframes rotateRing {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	@keyframes rotateRingRev {
		from {
			transform: rotate(360deg);
		}
		to {
			transform: rotate(0deg);
		}
	}

	.orb-core {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: linear-gradient(135deg, #00f0ff, #0088ff);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #020712;
		font-family: 'Orbitron', sans-serif;
		font-weight: 900;
		font-size: 0.72rem;
		letter-spacing: 0.05em;
		box-shadow: 0 0 12px #00f0ff;
		z-index: 1;
	}
	.orb-pulse {
		position: absolute;
		inset: -6px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(0, 240, 255, 0.25) 0%, transparent 70%);
		animation: pulseCore 2.5s ease-in-out infinite;
	}
	@keyframes pulseCore {
		0%,
		100% {
			transform: scale(1);
			opacity: 0.4;
		}
		50% {
			transform: scale(1.3);
			opacity: 0.8;
		}
	}

	/* Tooltip Pill */
	.orb-tooltip {
		position: absolute;
		left: calc(100% + 12px);
		top: 50%;
		transform: translateY(-50%);
		background: rgba(4, 12, 24, 0.92);
		border: 1px solid rgba(0, 240, 255, 0.35);
		border-radius: 6px;
		padding: 0.35rem 0.65rem;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		pointer-events: none;
		white-space: nowrap;
		backdrop-filter: blur(10px);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
	}
	.hud-tag {
		font-family: 'Orbitron', monospace;
		font-size: 0.68rem;
		font-weight: 700;
		color: #00f0ff;
		letter-spacing: 0.08em;
	}
	.hud-status {
		font-family: 'Fira Code', monospace;
		font-size: 0.62rem;
		color: #22c55e;
		font-weight: 600;
	}

	/* Modal Backdrop */
	.jarvis-backdrop {
		position: fixed;
		inset: 0;
		z-index: 1200;
		background: rgba(2, 6, 16, 0.82);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		animation: fadeIn 0.25s ease-out;
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.jarvis-hud-modal {
		position: relative;
		width: 100%;
		max-width: 760px;
		height: 85vh;
		max-height: 720px;
		background: linear-gradient(160deg, rgba(8, 18, 36, 0.95), rgba(4, 10, 22, 0.98));
		border: 1px solid rgba(0, 240, 255, 0.35);
		border-radius: 18px;
		box-shadow:
			0 0 60px rgba(0, 240, 255, 0.2),
			0 20px 60px rgba(0, 0, 0, 0.7);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: scaleModal 0.28s cubic-bezier(0.16, 1, 0.3, 1);
	}
	@keyframes scaleModal {
		from {
			transform: scale(0.94) translateY(20px);
			opacity: 0;
		}
		to {
			transform: scale(1) translateY(0);
			opacity: 1;
		}
	}

	/* Header */
	.hud-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.25rem 1.75rem;
		border-bottom: 1px solid rgba(0, 240, 255, 0.15);
		background: rgba(0, 240, 255, 0.03);
		gap: 1rem;
	}
	.hud-header-left {
		display: flex;
		align-items: center;
		gap: 0.9rem;
	}
	.hud-reactor-mini {
		position: relative;
		width: 34px;
		height: 34px;
		border-radius: 50%;
		border: 1px solid rgba(0, 240, 255, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.mini-spin {
		position: absolute;
		inset: -2px;
		border-radius: 50%;
		border-top: 2px solid #00f0ff;
		border-right: 2px solid transparent;
		animation: rotateRing 3s linear infinite;
	}
	.mini-core {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: #00f0ff;
		box-shadow: 0 0 10px #00f0ff;
	}
	.hud-sup-label {
		font-family: 'Fira Code', monospace;
		font-size: 0.65rem;
		color: rgba(0, 240, 255, 0.8);
		letter-spacing: 0.15em;
	}
	.hud-title {
		font-family: 'Orbitron', sans-serif;
		font-size: 1.05rem;
		font-weight: 700;
		color: #e8edf5;
		letter-spacing: 0.04em;
		margin: 0;
	}

	/* Audio visualizer */
	.audio-visualizer {
		display: flex;
		align-items: center;
		gap: 3px;
		height: 20px;
	}
	.audio-bar {
		width: 3px;
		background: #00f0ff;
		border-radius: 2px;
		animation: bounceBar 1.2s ease-in-out infinite alternate;
	}
	@keyframes bounceBar {
		0% {
			height: 4px;
			opacity: 0.3;
		}
		100% {
			height: 20px;
			opacity: 1;
		}
	}

	.hud-header-controls {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.control-pill {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(0, 240, 255, 0.3);
		color: #9baec8;
		font-family: 'Fira Code', monospace;
		font-size: 0.72rem;
		padding: 0.35rem 0.75rem;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
	}
	.control-pill.active {
		background: rgba(0, 240, 255, 0.15);
		color: #00f0ff;
		border-color: #00f0ff;
	}
	.close-hud-btn {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.15);
		color: #9baec8;
		width: 32px;
		height: 32px;
		border-radius: 8px;
		font-size: 0.9rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}
	.close-hud-btn:hover {
		color: #fff;
		background: rgba(239, 68, 68, 0.3);
		border-color: #ef4444;
	}

	/* Telemetry strip */
	.hud-telemetry-strip {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		background: rgba(0, 0, 0, 0.45);
		padding: 0.45rem 1.75rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		font-family: 'Fira Code', monospace;
		font-size: 0.68rem;
		color: #6b82a0;
	}
	.live-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #22c55e;
		box-shadow: 0 0 8px #22c55e;
	}
	.telemetry-text {
		flex: 1;
	}
	.telemetry-hint {
		opacity: 0.6;
	}

	/* Protocol Chips */
	.protocol-chips {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.75rem 1.75rem;
		overflow-x: auto;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		scrollbar-width: none;
	}
	.protocol-chips::-webkit-scrollbar {
		display: none;
	}
	.chip-btn {
		background: rgba(0, 240, 255, 0.06);
		border: 1px solid rgba(0, 240, 255, 0.25);
		color: #c0daf5;
		font-family: 'Fira Code', monospace;
		font-size: 0.73rem;
		padding: 0.4rem 0.85rem;
		border-radius: 50px;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.2s;
	}
	.chip-btn:hover {
		background: rgba(0, 240, 255, 0.18);
		border-color: #00f0ff;
		color: #fff;
		transform: translateY(-1px);
		box-shadow: 0 0 15px rgba(0, 240, 255, 0.25);
	}

	/* Messages area */
	.hud-messages {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem 1.75rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}
	.msg-row {
		display: flex;
		align-items: flex-start;
		gap: 0.85rem;
		max-width: 85%;
	}
	.msg-row.user {
		margin-left: auto;
		flex-direction: row-reverse;
	}
	.jarvis-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: linear-gradient(135deg, #00f0ff, #0077ff);
		color: #020712;
		font-family: 'Orbitron', monospace;
		font-size: 0.68rem;
		font-weight: 900;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		box-shadow: 0 0 10px rgba(0, 240, 255, 0.4);
		margin-top: 2px;
	}
	.msg-bubble {
		background: rgba(14, 28, 52, 0.7);
		border: 1px solid rgba(0, 240, 255, 0.22);
		border-radius: 12px;
		padding: 0.85rem 1.15rem;
		backdrop-filter: blur(10px);
	}
	.msg-bubble.bubble-user {
		background: rgba(212, 175, 55, 0.12);
		border-color: rgba(212, 175, 55, 0.35);
	}
	.bubble-sender {
		font-family: 'Fira Code', monospace;
		font-size: 0.65rem;
		font-weight: 700;
		color: #00f0ff;
		margin-bottom: 0.35rem;
		letter-spacing: 0.08em;
	}
	.msg-bubble.bubble-user .bubble-sender {
		color: #d4af37;
		text-align: right;
	}
	.bubble-text {
		font-family: 'Inter', sans-serif;
		font-size: 0.9rem;
		line-height: 1.65;
		color: #e8edf5;
		margin: 0;
	}
	.msg-action-wrap {
		margin-top: 0.75rem;
	}
	.msg-action-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: linear-gradient(135deg, #00f0ff, #0099ff);
		color: #020712;
		font-family: 'Fira Code', monospace;
		font-size: 0.78rem;
		font-weight: 700;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		text-decoration: none;
		border: none;
		cursor: pointer;
		box-shadow: 0 0 15px rgba(0, 240, 255, 0.35);
		transition: all 0.2s;
	}
	.msg-action-btn:hover {
		box-shadow: 0 0 25px rgba(0, 240, 255, 0.6);
		transform: translateY(-2px);
	}

	/* Input bar */
	.hud-input-bar {
		padding: 1rem 1.75rem;
		background: rgba(3, 8, 18, 0.9);
		border-top: 1px solid rgba(0, 240, 255, 0.18);
	}
	.input-glow-wrap {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		background: rgba(14, 28, 52, 0.6);
		border: 1px solid rgba(0, 240, 255, 0.3);
		border-radius: 10px;
		padding: 0.4rem 0.75rem 0.4rem 1rem;
		transition: all 0.25s;
	}
	.input-glow-wrap:focus-within {
		border-color: #00f0ff;
		box-shadow: 0 0 20px rgba(0, 240, 255, 0.25);
		background: rgba(14, 28, 52, 0.85);
	}
	.cli-prompt {
		font-family: 'Fira Code', monospace;
		font-size: 0.85rem;
		font-weight: 700;
		color: #00f0ff;
	}
	.hud-input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		font-family: 'Inter', sans-serif;
		font-size: 0.9rem;
		color: #fff;
		padding: 0.4rem 0;
	}
	.hud-input::placeholder {
		color: #6b82a0;
	}
	.hud-send-btn {
		background: #00f0ff;
		border: none;
		width: 34px;
		height: 34px;
		border-radius: 8px;
		color: #020712;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
	}
	.hud-send-btn:hover {
		background: #5ef5ff;
		transform: scale(1.06);
		box-shadow: 0 0 15px rgba(0, 240, 255, 0.6);
	}

	@media (max-width: 640px) {
		.jarvis-launcher {
			bottom: 1.25rem;
			left: 1.25rem;
		}
		.jarvis-hud-modal {
			height: 92vh;
			max-height: none;
			border-radius: 14px;
		}
		.hud-header {
			padding: 1rem;
		}
		.hud-telemetry-strip {
			padding: 0.4rem 1rem;
		}
		.telemetry-hint {
			display: none;
		}
		.protocol-chips {
			padding: 0.6rem 1rem;
		}
		.hud-messages {
			padding: 1rem;
		}
		.hud-input-bar {
			padding: 0.75rem 1rem;
		}
		.audio-visualizer {
			display: none;
		}
		.orb-tooltip {
			display: none;
		}
	}
</style>
