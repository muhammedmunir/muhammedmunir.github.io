<script lang="ts">
	import { lang } from '$lib/i18n';
</script>

<section id="about" class="section about-section" aria-label="About Muhammed Munir">
	<div class="container">
		<div class="about-grid">
			<!-- Left Column: Story & Philosophy -->
			<div class="about-text">
				<span class="section-label">
					{$lang === 'ms' ? '03 / Tentang Saya' : '03 / About Me'}
				</span>
				<h2 class="section-title">
					{$lang === 'ms'
						? 'Jurutera sistem yang mengutamakan keselamatan, ketahanan & sentuhan reka bentuk.'
						: 'Systems engineer driven by security, resilience & design craft.'}
				</h2>

				<div class="about-paragraphs">
					<p>
						{$lang === 'ms'
							? 'Saya Muhammed Munir Bin Mohd Azmi — Pengaturcara Perusahaan & Arkitek Sistem yang berpangkalan di Puchong, Selangor. Perjalanan saya bermula dengan kajian mendalam dalam bidang Keselamatan Rangkaian di Universiti Teknologi Malaysia (UTM), di mana saya belajar melihat perisian dari sudut integriti struktur dan pertahanan berlapis.'
							: "I'm Muhammed Munir Bin Mohd Azmi — an Enterprise Full-Stack Programmer and Solutions Architect based in Puchong, Selangor. My foundation is built on deep coursework in Networks and Cybersecurity at Universiti Teknologi Malaysia (UTM), where I learned to approach software from the vantage point of structural integrity and layered defense."}
					</p>

					<p>
						{$lang === 'ms'
							? 'Kini di YHCM Sdn Bhd, saya bertanggungjawab ke atas sistem pengurusan aset dan aliran kerja sektor awam (eMesys, Sutera, ADIMS). Saya menggabungkan kecekapan seni bina backend Laravel 12 dan Docker Swarm dengan pengalaman frontend reaktif menggunakan Vue 3 dan SvelteKit.'
							: 'Currently at YHCM Sdn Bhd, I engineer mission-critical public-sector platforms (eMesys, Sutera, ADIMS). I bridge the rigor of backend architecture (Laravel 12, MariaDB, Docker Swarm) with the tactile elegance of modern reactive frontends (Vue 3, SvelteKit, Three.js).'}
					</p>

					<p>
						{$lang === 'ms'
							? 'Bagi saya, perisian bukan sekadar fungsi logik — ia adalah kraf yang menghubungkan manusia dengan sistem. Dari perincian kependaman API sehingga ke kelancaran animasi kanvas 3D, setiap piksel dan baris kod mempunyai tujuan yang jelas.'
							: 'To me, software is more than cold logic — it is an art of connecting humans with complex infrastructure. From microsecond database optimizations to fluid 3D spatial animations, every pixel and every query has a defined purpose.'}
					</p>
				</div>

				<!-- Credentials & Academic Pedigree -->
				<div class="credentials-card">
					<div class="cred-item">
						<span class="cred-icon">🎓</span>
						<div class="cred-info">
							<span class="cred-title">B.Sc. Computer Science (Networks & Security)</span>
							<span class="cred-org">Universiti Teknologi Malaysia (UTM) · 2021 — 2024</span>
						</div>
					</div>

					<div class="cred-item">
						<span class="cred-icon">📜</span>
						<div class="cred-info">
							<span class="cred-title">Cisco Certified Network Associate (CCNAv7)</span>
							<span class="cred-org">CCNA1, CCNA2, Network Security, Cisco DevNet</span>
						</div>
					</div>

					<div class="cred-item">
						<span class="cred-icon">🛡️</span>
						<div class="cred-info">
							<span class="cred-title">Cybersecurity Defense & SOC Operations</span>
							<span class="cred-org">Splunk SIEM, Metasploit, Wireshark, Snort, Vulhub</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Right Column: Visual Pillars & Philosophy Cards -->
			<div class="pillars-column">
				<div class="pillar-card">
					<span class="pillar-num">01</span>
					<h3 class="pillar-title">{$lang === 'ms' ? 'Ketahanan Sistem (Resilience)' : 'System Resilience'}</h3>
					<p class="pillar-desc">
						{$lang === 'ms'
							? 'Membina perkhidmatan yang bersedia menghadapi kegagalan — kontena terasing, pemantauan status masa nyata, dan skema pangkalan data yang diindeks dengan teliti.'
							: 'Building systems that withstand real-world stress — isolated container fleets, real-time telemetry, and bulletproof database schemas.'}
					</p>
				</div>

				<div class="pillar-card">
					<span class="pillar-num">02</span>
					<h3 class="pillar-title">{$lang === 'ms' ? 'Pertahanan Asas (Defense by Default)' : 'Defense by Default'}</h3>
					<p class="pillar-desc">
						{$lang === 'ms'
							? 'Keselamatan bukan langkah tambahan; ia diterapkan dari baris kod pertama — kawalan RBAC ketat, sanitasi input, tokenisasi sesi, dan perlindungan RLS.'
							: 'Security is not an afterthought; it is built into the first commit — strict RBAC policies, input sanitization, and encrypted data paths.'}
					</p>
				</div>

				<div class="pillar-card">
					<span class="pillar-num">03</span>
					<h3 class="pillar-title">{$lang === 'ms' ? 'Sentuhan & Cita Rasa (Tactile Craft)' : 'Tactile Craft & UI'}</h3>
					<p class="pillar-desc">
						{$lang === 'ms'
							? 'Antara muka pengguna yang memanjakan mata — tipografi seimbang, interaksi 3D fizikal yang lancar, dan aksesibiliti lengkap tanpa kompromi.'
							: 'Interfaces that delight — balanced editorial typography, smooth tactile 3D interactions, and uncompromising accessibility.'}
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.about-section {
		background-color: var(--bg);
		border-top: 1px solid var(--surface-border);
	}

	.about-grid {
		display: grid;
		grid-template-columns: 1.15fr 0.85fr;
		gap: clamp(2.5rem, 6vw, 5rem);
		align-items: start;
	}

	.about-text {
		display: flex;
		flex-direction: column;
	}

	.about-paragraphs {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		margin-bottom: 2.5rem;
	}

	.about-paragraphs p {
		font-size: clamp(1rem, 1.25vw, 1.12rem);
		line-height: 1.75;
		color: var(--ink-secondary);
	}

	/* Credentials Card */
	.credentials-card {
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
		padding: 1.75rem;
		border-radius: 1.25rem;
		background: var(--surface);
		border: 1px solid var(--surface-border);
		box-shadow: var(--shadow-sm);
	}

	.cred-item {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.cred-icon {
		font-size: 1.4rem;
		line-height: 1;
		padding: 0.5rem;
		background: var(--bg-subtle);
		border-radius: 10px;
	}

	.cred-info {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.cred-title {
		font-weight: 700;
		font-size: 0.96rem;
		color: var(--ink);
	}

	.cred-org {
		font-size: 0.82rem;
		color: var(--ink-muted);
	}

	/* Pillars Column */
	.pillars-column {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.pillar-card {
		padding: clamp(1.75rem, 3vw, 2.25rem);
		border-radius: 1.25rem;
		background: var(--surface);
		border: 1px solid var(--surface-border);
		box-shadow: var(--shadow-sm);
		transition: all 0.25s ease;
	}

	.pillar-card:hover {
		border-color: var(--surface-border-hover);
		transform: translateY(-3px);
		box-shadow: var(--shadow-md);
	}

	.pillar-num {
		font-family: var(--font-heading);
		font-weight: 800;
		font-size: 1.2rem;
		color: var(--accent);
		display: block;
		margin-bottom: 0.75rem;
	}

	.pillar-title {
		font-size: 1.3rem;
		font-weight: 700;
		color: var(--ink);
		margin-bottom: 0.75rem;
		line-height: 1.2;
	}

	.pillar-desc {
		font-size: 0.94rem;
		line-height: 1.65;
		color: var(--ink-secondary);
	}

	@media (max-width: 960px) {
		.about-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
