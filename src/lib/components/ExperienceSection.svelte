<script lang="ts">
	import { lang } from '$lib/i18n';

	type ExperienceItem = {
		period: string;
		role: { ms: string; en: string };
		company: string;
		location: string;
		current?: boolean;
		highlights: { ms: string[]; en: string[] };
		technologies: string[];
	};

	const experiences: ExperienceItem[] = [
		{
			period: '2024 — Kini',
			role: {
				ms: 'Pengaturcara Perusahaan / Full-Stack Enterprise Programmer',
				en: 'Enterprise Full-Stack Programmer'
			},
			company: 'YHCM Sdn Bhd',
			location: 'Puchong, Selangor',
			current: true,
			highlights: {
				ms: [
					'Membangunkan dan menyelenggara sistem kritikal sektor awam (eMesys, Sutera, ADIMS).',
					'Membangunkan modul frontend moden dengan Vue.js 3 dan backend Laravel 12 dengan panel pentadbiran Filament.',
					'Menguruskan pengedaran kontena multi-node melalui Docker Swarm dan pentadbiran pelayan pengeluaran Linux.',
					'Mengoptimumkan skema pangkalan data MariaDB, MySQL, dan PostgreSQL untuk transaksi tinggi dan kawalan akses (RBAC).'
				],
				en: [
					'Architecting and maintaining mission-critical public-sector platforms (eMesys, Sutera, ADIMS).',
					'Engineering reactive frontends with Vue.js 3 and robust backend services with Laravel 12 & Filament admin panels.',
					'Orchestrating multi-node container services via Docker Swarm and administering Linux production environments.',
					'Optimizing high-throughput database schemas across MariaDB, MySQL, and PostgreSQL with strict RBAC audit logging.'
				]
			},
			technologies: ['Vue.js 3', 'Laravel 12', 'Docker Swarm', 'MariaDB', 'PostgreSQL', 'Linux Server', 'SSO/RBAC']
		},
		{
			period: '2023 — 2024',
			role: {
				ms: 'Sokongan IT & Pembangun Web Full-Stack',
				en: 'IT Support & Full-Stack Web Developer'
			},
			company: 'Nova Support & Web Services',
			location: 'Kuala Lumpur',
			highlights: {
				ms: [
					'Membangunkan Sistem Pinjaman Bercagar (IWA001) menggunakan SvelteKit dan Supabase Row-Level Security (RLS).',
					'Membina Portal Korporat Infinity World 3 Bahasa di Vercel dengan caching Redis dan penghantaran e-mel Resend.',
					'Menguruskan rekod DNS korporat di GoDaddy dan polisi perlindungan Cloudflare WAF.',
					'Menyelesaikan isu sokongan IT operasi rangkaian, perkakasan, dan sistem pengeluaran.'
				],
				en: [
					'Engineered production Secured Lending System (IWA001) using SvelteKit and Supabase Row-Level Security (RLS).',
					'Built the 3-language Infinity World corporate portal on Vercel with distributed Redis caching and Resend email pipelines.',
					'Configured DNS records on GoDaddy and implemented Cloudflare WAF firewall rules.',
					'Delivered operational enterprise IT support across hardware, networks, and production web services.'
				]
			},
			technologies: ['SvelteKit', 'Supabase RLS', 'Redis', 'Tailwind CSS', 'Cloudflare WAF', 'Vercel']
		},
		{
			period: '2023',
			role: {
				ms: 'Penyelesaian Mobiliti Perusahaan (Protégé)',
				en: 'Enterprise Mobility Solutions (Protégé)'
			},
			company: 'Tenaga Nasional Berhad (TNB)',
			location: 'Kuala Lumpur',
			highlights: {
				ms: [
					'Memimpin pembangunan full-stack aplikasi OnboardX (Flutter, Dart, JavaScript) untuk kakitangan TNB.',
					'Mentadbir pelayan Ubuntu di Microsoft Azure, mengurus Network Security Groups (NSG) dan kestabilan perkhidmatan.',
					'Meneroka automasi integrasi berterusan CI/CD menggunakan Jenkins dan Kubernetes.',
					'Mereka bentuk prototaip antara muka UI/UX interaktif menggunakan Figma.'
				],
				en: [
					'Spearheaded full-stack engineering of the OnboardX mobile app (Flutter/Dart) for employee onboarding.',
					'Administered Ubuntu cloud instances in Microsoft Azure, configuring Network Security Groups (NSG) and uptime monitors.',
					'Automated continuous delivery pipelines via Jenkins CI/CD and explored Kubernetes orchestration.',
					'Designed user experience flows and interactive mobile prototypes in Figma.'
				]
			},
			technologies: ['Flutter', 'Dart', 'Microsoft Azure', 'Jenkins CI/CD', 'Firebase', 'Figma']
		},
		{
			period: '2022',
			role: {
				ms: 'Pertahanan Keselamatan Siber & Analisis SOC',
				en: 'Cybersecurity Threat Defense & SOC Analyst'
			},
			company: 'Tenaga Nasional Berhad (TNB)',
			location: 'Kuala Lumpur',
			highlights: {
				ms: [
					'Memantau trafik rangkaian dan log web pelayan secara masa nyata melalui papan pemuka Splunk SIEM.',
					'Bekerjasama dengan Pasukan Merah menggunakan makmal Vulhub untuk simulasi eksploitasi CVE bagi menguji kubu TNB.',
					'Menyokong Pasukan Biru dalam penambahbaikan audit log, pengesanan anomali trafik, dan postur pertahanan.',
					'Menyelenggara dokumentasi keselamatan maklumat selaras dengan piawaian korporat.'
				],
				en: [
					'Monitored real-time enterprise network traffic and system telemetry via Splunk SIEM dashboards.',
					'Collaborated with Red Team engineers simulating CVE exploits using Vulhub labs to identify infrastructure vulnerabilities.',
					'Assisted Blue Team operations in audit logging, traffic anomaly forensics, and defensive perimeter hardening.',
					'Documented security posture and compliance checklists aligned with enterprise governance standards.'
				]
			},
			technologies: ['Splunk SIEM', 'Wireshark', 'Vulhub', 'Nmap', 'Burp Suite', 'Network Security']
		}
	];
</script>

<section id="experience" class="section experience-section" aria-label="Career Journey">
	<div class="container">
		<div class="section-header">
			<span class="section-label">
				{$lang === 'ms' ? '02 / Perjalanan Kerjaya' : '02 / Career Path'}
			</span>
			<h2 class="section-title">
				{$lang === 'ms' ? 'Pengalaman dunia nyata yang mengasah kepakaran.' : 'Proven experience in mission-critical environments.'}
			</h2>
			<p class="section-desc">
				{$lang === 'ms'
					? 'Daripada pertahanan ancaman siber dan orkestrasi pelayan awan hingga pembangunan aplikasi perusahaan berskala besar.'
					: 'From cyber threat intelligence and cloud infrastructure to architecting high-scale enterprise platforms.'}
			</p>
		</div>

		<!-- Timeline -->
		<div class="timeline">
			{#each experiences as exp, idx}
				<div class="timeline-item">
					<!-- Date & Company Column -->
					<div class="timeline-sidebar">
						<span class="timeline-period">{exp.period}</span>
						<span class="timeline-company">{exp.company}</span>
						<span class="timeline-location">{exp.location}</span>
						{#if exp.current}
							<span class="current-badge">
								<span class="pulse-dot"></span>
								{$lang === 'ms' ? 'Jawatan Semasa' : 'Current Role'}
							</span>
						{/if}
					</div>

					<!-- Content Column -->
					<div class="timeline-content">
						<h3 class="role-title">{exp.role[$lang]}</h3>
						<ul class="highlights-list">
							{#each exp.highlights[$lang] as h}
								<li class="highlight-item">{h}</li>
							{/each}
						</ul>

						<!-- Tech Pills -->
						<div class="tech-row">
							{#each exp.technologies as t}
								<span class="tech-tag">{t}</span>
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.experience-section {
		background-color: var(--bg);
		border-top: 1px solid var(--surface-border);
	}

	.section-header {
		max-width: 740px;
		margin-bottom: clamp(3rem, 6vw, 4.5rem);
	}

	.timeline {
		display: flex;
		flex-direction: column;
		gap: clamp(2rem, 4vw, 3.5rem);
	}

	.timeline-item {
		display: grid;
		grid-template-columns: 280px 1fr;
		gap: clamp(1.5rem, 4vw, 3.5rem);
		padding: clamp(1.75rem, 3vw, 2.5rem);
		border-radius: 1.25rem;
		background: var(--surface);
		border: 1px solid var(--surface-border);
		box-shadow: var(--shadow-sm);
		transition: all 0.25s ease;
	}

	.timeline-item:hover {
		border-color: var(--surface-border-hover);
		box-shadow: var(--shadow-md);
	}

	/* Sidebar */
	.timeline-sidebar {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.timeline-period {
		font-family: var(--font-heading);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--ink);
		letter-spacing: -0.02em;
	}

	.timeline-company {
		font-size: 1.02rem;
		font-weight: 600;
		color: var(--accent);
	}

	.timeline-location {
		font-size: 0.82rem;
		color: var(--ink-muted);
	}

	.current-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.3rem 0.7rem;
		border-radius: 9999px;
		background: rgba(16, 185, 129, 0.08);
		border: 1px solid rgba(16, 185, 129, 0.25);
		color: #10b981;
		font-size: 0.75rem;
		font-weight: 600;
		margin-top: 0.4rem;
		width: fit-content;
	}

	:root[data-theme="light"] .current-badge {
		background: rgba(5, 150, 105, 0.08);
		border-color: rgba(5, 150, 105, 0.25);
		color: #047857;
	}

	.pulse-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: currentColor;
	}

	/* Content */
	.timeline-content {
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
	}

	.role-title {
		font-size: clamp(1.3rem, 2vw, 1.6rem);
		font-weight: 700;
		color: var(--ink);
		line-height: 1.2;
	}

	.highlights-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.highlight-item {
		position: relative;
		padding-left: 1.4rem;
		font-size: 0.96rem;
		color: var(--ink-secondary);
		line-height: 1.65;
	}

	.highlight-item::before {
		content: '—';
		position: absolute;
		left: 0;
		color: var(--accent);
		font-weight: 600;
	}

	.tech-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		margin-top: 0.4rem;
	}

	.tech-tag {
		font-size: 0.78rem;
		font-weight: 500;
		padding: 0.25rem 0.65rem;
		border-radius: 6px;
		background: var(--bg-subtle);
		color: var(--ink-muted);
		border: 1px solid var(--surface-border);
	}

	@media (max-width: 860px) {
		.timeline-item {
			grid-template-columns: 1fr;
			gap: 1.25rem;
		}
	}
</style>
