<script lang="ts">
	import { lang } from '$lib/i18n';
	import { translations } from '$lib/translations';
	import { derived } from 'svelte/store';

	const t = derived(lang, ($l) => translations[$l].skills);
	const tedu = derived(lang, ($l) => translations[$l].edu);

	const skillDomains = [
		{
			id: 'frontend',
			titleKey: 'frontend' as const,
			icon: '🎨',
			accent: '#67e8f9',
			domainCode: 'DOM-01',
			badge: 'REACTIVE INTERFACES',
			skills: [
				{
					name: 'SvelteKit 5',
					scope: 'Web Architecture',
					tier: 'PROD READY',
					usage: 'Portfolio, IWA001, FYP System'
				},
				{
					name: 'Vue.js 3',
					scope: 'Enterprise UI',
					tier: 'ENTERPRISE',
					usage: 'eMesys, Sutera, YHCM Gov Portals'
				},
				{
					name: 'Flutter & Dart',
					scope: 'Cross-Platform Mobile',
					tier: 'SHIPPED',
					usage: 'TNB Onboardx, Baby Kicking, Tindak'
				},
				{
					name: 'TypeScript',
					scope: 'Type-Safe Runtime',
					tier: 'CORE',
					usage: 'Strict Mode APIs & Full-Stack Typing'
				},
				{
					name: 'TailwindCSS 4',
					scope: 'Design Systems',
					tier: 'DESIGN OPS',
					usage: 'Responsive Glassmorphism & Tokens'
				},
				{
					name: 'Three.js / Canvas',
					scope: '3D Simulation',
					tier: 'EXPERIENTIAL',
					usage: '9Router Virtual Office & Spatial UI'
				}
			]
		},
		{
			id: 'backend',
			titleKey: 'backend' as const,
			icon: '⚡',
			accent: '#a5b4fc',
			domainCode: 'DOM-02',
			badge: 'HIGH-SCALE ENGINES',
			skills: [
				{
					name: 'Laravel 11/12',
					scope: 'Enterprise Backend',
					tier: 'GOV SYSTEM',
					usage: 'ADIMS, eMesys, Sutera, RESTful APIs'
				},
				{
					name: 'PHP 8.5 & Horizon',
					scope: 'Queue & Jobs Architecture',
					tier: 'HIGH SCALE',
					usage: 'Async Background Queues & Workers'
				},
				{
					name: 'Docker Swarm',
					scope: 'Container Orchestration',
					tier: 'CLUSTER DEPLOY',
					usage: 'Zero-Downtime Microservices at YHCM'
				},
				{
					name: 'PostgreSQL 17 / MariaDB',
					scope: 'Relational Database',
					tier: 'OPTIMIZED',
					usage: 'ACID Transactions, Indices & RLS'
				},
				{
					name: 'Python (OpenCV)',
					scope: 'Computer Vision & AI',
					tier: 'VISION BOT',
					usage: 'CV Automated Bot, Template Matching'
				},
				{
					name: 'Supabase RLS & Redis',
					scope: 'Realtime & Caching',
					tier: 'SUB-10MS',
					usage: 'Row-Level Security & In-Memory Cache'
				}
			]
		},
		{
			id: 'security',
			titleKey: 'security' as const,
			icon: '🛡️',
			accent: '#67e8f9',
			domainCode: 'DOM-03',
			badge: 'CYBER DEFENCE & CLOUD',
			skills: [
				{
					name: 'Splunk SIEM',
					scope: 'SOC Log Analytics',
					tier: 'REALTIME SOC',
					usage: 'TNB Platinum Threat Monitoring & Alerts'
				},
				{
					name: 'Wireshark & PCAP',
					scope: 'Packet Deep Inspection',
					tier: 'PROTOCOL AUDIT',
					usage: 'Traffic Anomaly & Network Forensics'
				},
				{
					name: 'Vulhub & CVE Labs',
					scope: 'Vulnerability Analysis',
					tier: 'RED/BLUE TEAM',
					usage: 'Exploitation Simulation & Patch Testing'
				},
				{
					name: 'Linux / Ubuntu Swarm',
					scope: 'Server Administration',
					tier: 'HARDENED OS',
					usage: 'Firewall, SSH Keys, Nginx Reverse Proxy'
				},
				{
					name: 'Cloudflare WAF',
					scope: 'Edge Security & CDN',
					tier: 'EDGE SHIELD',
					usage: 'DDoS Mitigation, DNS & SSL Management'
				},
				{
					name: 'Zero-Trust RBAC',
					scope: 'Access Governance',
					tier: 'GOV AUDIT',
					usage: 'Strict Role-Based Access Controls'
				}
			]
		}
	];

	const excellentSkills = [
		'Enterprise System Architecture',
		'Full-Stack Troubleshooting',
		'Network Protocol Hardening',
		'Row Level Security (Supabase RLS)',
		'IT Operations & Infrastructure',
		'Cloud Deployment (Azure, Vercel)'
	];

	const toolsSkills = [
		'PostgreSQL 17',
		'MariaDB',
		'MySQL',
		'MongoDB',
		'Redis',
		'Firebase',
		'Docker Swarm',
		'Jenkins CI/CD',
		'Kubernetes',
		'Linux (Ubuntu)',
		'Kali Linux',
		'Cloudflare WAF',
		'Git / GitHub Actions',
		'Figma UI/UX',
		'Cisco Packet Tracer',
		'OpenCV',
		'Python 3'
	];

	const certifications = [
		{
			name: 'CCNAv7: Introduction to Networks',
			issuer: 'Cisco Networking Academy',
			id: 'CISCO-CCNA1'
		},
		{
			name: 'CCNAv7: Switching, Routing & Wireless Essentials',
			issuer: 'Cisco Networking Academy',
			id: 'CISCO-CCNA2'
		},
		{ name: 'Network Security (Cisco)', issuer: 'Cisco Networking Academy', id: 'CISCO-SEC' },
		{
			name: 'IoT Fundamentals: Connecting Things',
			issuer: 'Cisco Networking Academy',
			id: 'CISCO-IOT'
		},
		{ name: 'DevNet Associate', issuer: 'Cisco Networking Academy', id: 'CISCO-DEVNET' },
		{ name: 'Microsoft Power BI Data Analysis', issuer: 'Microsoft Professional', id: 'MS-PBI' },
		{
			name: 'Python for Data Analysis & Automation',
			issuer: 'Professional Training',
			id: 'PY-DATA'
		}
	];

	const educations = [
		{
			degreeKey: 'degree' as const,
			institution: 'Universiti Teknologi Malaysia (UTM)',
			location: 'Johor',
			cgpa: '3.17',
			icon: '🎓',
			badgeKey: 'bachelor' as const,
			majorCode: 'B.Sc. (Computer Science - Networks & Security)'
		},
		{
			degreeKey: 'diploma' as const,
			institution: 'Universiti Teknologi Malaysia (UTM)',
			location: 'Kuala Lumpur',
			cgpa: '2.72',
			icon: '📜',
			badgeKey: 'diploma' as const,
			majorCode: 'Dip. (Computer Science)'
		}
	];
</script>

<section id="skills" class="skills-section">
	<div class="section">
		<!-- Section Header -->
		<div class="section-header skills-header">
			<div class="section-label">{$t.label}</div>
			<h2 class="text-gradient">{$t.title}</h2>
			<p class="section-desc">{$t.desc}</p>
			<div class="section-divider"></div>
		</div>

		<!-- 3 Domain Architectural Columns (Replaces Arbitrary Percentage Bars) -->
		<div class="matrix-grid">
			<svg class="domain-paths" viewBox="0 0 1000 64" preserveAspectRatio="none" aria-hidden="true">
				<path d="M500 0V18M166 64V42Q166 30 180 30H820Q834 30 834 42V64M500 18V64" />
				<circle cx="500" cy="18" r="3" />
			</svg>
			{#each skillDomains as domain}
				<div class="matrix-column" style="--dom-accent: {domain.accent}">
					<div class="col-head">
						<div class="col-avatar" style="border-color: {domain.accent}">
							<span>{domain.icon}</span>
						</div>
						<div class="col-title-wrap">
							<div class="col-meta-row">
								<span class="col-code">{domain.domainCode}</span>
								<span class="col-badge">{domain.badge}</span>
							</div>
							<h3 class="col-title" style="color: {domain.accent}">
								{$t[domain.titleKey]}
							</h3>
						</div>
					</div>

					<div class="skills-spec-list">
						{#each domain.skills as skill}
							<div class="spec-row">
								<div class="spec-top">
									<span class="spec-name">{skill.name}</span>
									<span class="spec-tier">{skill.tier}</span>
								</div>
								<div class="spec-scope">{skill.scope}</div>
								<div class="spec-usage">
									<span class="usage-lead">{$lang === 'ms' ? 'Penggunaan:' : 'Used in:'}</span>
									<span>{skill.usage}</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>

		<!-- Core Competencies Tier -->
		<div class="tech-tier-panel card">
			<div class="tier-header">
				<span class="tier-pill tier-accent-green">{$t.excellent_label}</span>
				<span class="tier-note"
					>{$lang === 'ms'
						? 'Seni bina & kekuatan operasi'
						: 'Architecture & operational strengths'}</span
				>
			</div>
			<div class="chips-shelf">
				{#each excellentSkills as item}
					<span class="chip-item chip-highlight">{item}</span>
				{/each}
			</div>
		</div>

		<!-- Tools & Ecosystem Grid -->
		<div class="tech-tier-panel card">
			<div class="tier-header">
				<span class="tier-pill tier-accent-cyan">{$t.tools_label}</span>
				<span class="tier-note"
					>{$lang === 'ms'
						? 'Infrastruktur, rangka kerja & alatan'
						: 'Infrastructure, frameworks & toolchain'}</span
				>
			</div>
			<div class="chips-shelf">
				{#each toolsSkills as tool}
					<span class="chip-item">{tool}</span>
				{/each}
			</div>
		</div>

		<!-- Professional Certifications Grid -->
		<div class="certs-section">
			<div class="section-label" style="margin-bottom:1.25rem">{$t.certs_label}</div>
			<div class="certs-grid">
				{#each certifications as cert}
					<div class="cert-card card">
						<div class="cert-icon-box" aria-hidden="true">
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<circle cx="12" cy="8" r="7"></circle>
								<polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
							</svg>
						</div>
						<div class="cert-info">
							<span class="cert-code">{cert.id}</span>
							<p class="cert-title">{cert.name}</p>
							<span class="cert-issuer">{cert.issuer}</span>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Education Credentials (UTM Bachelor & Diploma) -->
		<div class="edu-section">
			<div class="section-label" style="margin-bottom:1.5rem">{$t.edu_label}</div>
			<div class="edu-deck">
				{#each educations as edu}
					<div class="edu-card card">
						<div class="edu-card-top">
							<div class="edu-icon-wrap" aria-hidden="true">
								<span>{edu.icon}</span>
							</div>
							<div class="edu-main-info">
								<div class="edu-pill-row">
									<span class="badge badge-academic">{$t[edu.badgeKey]}</span>
									<span class="edu-period">{$tedu[edu.degreeKey].period}</span>
									<span class="edu-cgpa-badge">{$t.cgpa}: <strong>{edu.cgpa}</strong></span>
								</div>
								<h3 class="edu-degree-title">
									{$tedu[edu.degreeKey].title}
								</h3>
								<p class="edu-uni-line">
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										aria-hidden="true"
									>
										<path
											d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"
										/>
										<circle cx="12" cy="10" r="3" />
									</svg>
									{edu.institution} — {edu.location}
								</p>
							</div>
						</div>

						<!-- FYP System Card -->
						<div class="fyp-system-box">
							<div class="fyp-top-row">
								<span class="fyp-tag">{$t.fyp_label}</span>
							</div>
							<h4 class="fyp-name">{$tedu[edu.degreeKey].fyp_title}</h4>
							<p class="fyp-summary">{$tedu[edu.degreeKey].fyp_desc}</p>
							<div class="fyp-techs">
								{#if edu.degreeKey === 'degree'}
									{#each ['SvelteKit', 'TailwindCSS', 'Supabase PostgreSQL', 'Google Maps API', 'Figma'] as tag}
										<span class="tag">{tag}</span>
									{/each}
								{:else}
									{#each ['MySQL', 'Microsoft Azure', 'Figma', 'PHP'] as tag}
										<span class="tag">{tag}</span>
									{/each}
								{/if}
							</div>
						</div>

						<!-- Relevant Coursework Grid -->
						<div class="courses-block">
							<span class="courses-heading">{$t.courses_label}</span>
							<div class="courses-layout">
								{#each $tedu[edu.degreeKey].courses as course}
									<div class="course-chip">
										<span class="course-lead">{course.name}</span>
										<span class="course-desc">{course.detail}</span>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.skills-section {
		position: relative;
		background: #030712;
		overflow: hidden;
	}

	.matrix-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.5rem;
		margin-bottom: 3.5rem;
	}

	.matrix-column {
		padding: 1.85rem;
		background: rgba(12, 21, 38, 0.75);
		border: 1px solid rgba(148, 163, 184, 0.14);
		border-top: 3px solid var(--dom-accent);
		border-radius: 16px;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		box-shadow:
			0 14px 40px -10px rgba(0, 0, 0, 0.6),
			inset 0 1px 0 rgba(255, 255, 255, 0.08);
		transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
	}
	.matrix-column:hover {
		border-color: var(--dom-accent);
		background: rgba(15, 28, 48, 0.9);
		transform: translateY(-3px);
		box-shadow:
			0 20px 48px -10px rgba(0, 0, 0, 0.75),
			0 0 25px color-mix(in srgb, var(--dom-accent) 20%, transparent),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
	}

	.col-head {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid rgba(148, 163, 184, 0.12);
	}
	.col-avatar {
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: rgba(3, 7, 18, 0.8);
		border: 1.5px solid;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.3rem;
		flex-shrink: 0;
	}
	.col-meta-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}
	.col-code {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		color: var(--cyan);
		font-weight: 700;
	}
	.col-badge {
		font-family: var(--font-mono);
		font-size: 0.62rem;
		color: var(--text-muted);
		letter-spacing: 0.05em;
	}
	.col-title {
		font-family: var(--font-heading);
		font-size: 1.15rem;
		font-weight: 700;
		line-height: 1.2;
	}

	.skills-spec-list {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}
	.spec-row {
		padding: 0.75rem 0.85rem;
		background: rgba(3, 7, 18, 0.6);
		border: 1px solid rgba(148, 163, 184, 0.1);
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		transition: all 0.2s ease;
	}
	.spec-row:hover {
		background: rgba(15, 27, 50, 0.85);
		border-color: rgba(56, 189, 248, 0.3);
	}
	.spec-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.spec-name {
		font-family: var(--font-heading);
		font-size: 0.92rem;
		font-weight: 700;
		color: var(--white);
	}
	.spec-tier {
		font-family: var(--font-mono);
		font-size: 0.62rem;
		font-weight: 700;
		color: var(--cyan);
		background: rgba(56, 189, 248, 0.1);
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
	}
	.spec-scope {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--text-secondary);
	}
	.spec-usage {
		font-size: 0.76rem;
		color: var(--text-muted);
		line-height: 1.4;
	}
	.usage-lead {
		font-family: var(--font-mono);
		color: var(--cyan);
		opacity: 0.8;
	}

	/* Tech Tier Panels */
	.tech-tier-panel {
		padding: 1.5rem 1.75rem;
		margin-bottom: 2rem;
	}
	.tier-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.15rem;
		flex-wrap: wrap;
	}
	.tier-pill {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 700;
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.tier-accent-green {
		background: rgba(16, 185, 129, 0.14);
		color: #34d399;
		border: 1px solid rgba(16, 185, 129, 0.35);
	}
	.tier-accent-cyan {
		background: rgba(56, 189, 248, 0.14);
		color: #67e8f9;
		border: 1px solid rgba(56, 189, 248, 0.35);
	}
	.tier-note {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--text-muted);
	}
	.chips-shelf {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.chip-item {
		padding: 0.4rem 0.85rem;
		background: rgba(3, 7, 18, 0.65);
		border: 1px solid rgba(148, 163, 184, 0.16);
		border-radius: 8px;
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--text-primary);
		transition: all 0.2s ease;
	}
	.chip-item:hover {
		border-color: var(--cyan);
		color: var(--cyan);
		transform: translateY(-2px);
	}
	.chip-highlight {
		border-color: rgba(56, 189, 248, 0.3);
		background: rgba(56, 189, 248, 0.06);
		color: #e0f2fe;
	}

	/* Certs Grid */
	.certs-section {
		margin: 3.5rem 0;
	}
	.certs-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
		gap: 0.85rem;
	}
	.cert-card {
		padding: 1.1rem 1.25rem;
		display: flex;
		align-items: center;
		gap: 0.85rem;
	}
	.cert-icon-box {
		width: 40px;
		height: 40px;
		border-radius: 10px;
		background: rgba(56, 189, 248, 0.1);
		border: 1px solid rgba(56, 189, 248, 0.3);
		color: var(--cyan);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.cert-info {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.cert-code {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		color: var(--cyan);
		font-weight: 700;
	}
	.cert-title {
		font-size: 0.86rem;
		font-weight: 600;
		color: var(--white);
		line-height: 1.3;
	}
	.cert-issuer {
		font-size: 0.74rem;
		color: var(--text-muted);
	}

	/* Education Deck */
	.edu-deck {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
	.edu-card {
		padding: 2rem;
		background: rgba(10, 18, 34, 0.8);
		border: 1px solid rgba(148, 163, 184, 0.14);
		border-radius: 18px;
	}
	.edu-card-top {
		display: flex;
		align-items: flex-start;
		gap: 1.25rem;
		margin-bottom: 1.5rem;
	}
	.edu-icon-wrap {
		width: 52px;
		height: 52px;
		border-radius: 14px;
		background: rgba(3, 7, 18, 0.9);
		border: 1.5px solid rgba(168, 85, 247, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.6rem;
		flex-shrink: 0;
	}
	.edu-pill-row {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		margin-bottom: 0.4rem;
		flex-wrap: wrap;
	}
	.edu-period {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--text-muted);
	}
	.edu-cgpa-badge {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--emerald);
		background: rgba(16, 185, 129, 0.12);
		border: 1px solid rgba(16, 185, 129, 0.3);
		padding: 0.12rem 0.5rem;
		border-radius: 999px;
	}
	.edu-degree-title {
		font-family: var(--font-heading);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--white);
		margin-bottom: 0.35rem;
		line-height: 1.3;
	}
	.edu-uni-line {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.85rem;
		color: var(--text-secondary);
	}

	.fyp-system-box {
		padding: 1.25rem;
		background: rgba(3, 7, 18, 0.6);
		border: 1px solid rgba(148, 163, 184, 0.12);
		border-radius: 12px;
		margin-bottom: 1.5rem;
	}
	.fyp-tag {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		font-weight: 700;
		color: var(--cyan);
		background: rgba(56, 189, 248, 0.1);
		padding: 0.15rem 0.5rem;
		border-radius: 4px;
	}
	.fyp-name {
		font-family: var(--font-heading);
		font-size: 1.05rem;
		font-weight: 700;
		color: var(--white);
		margin: 0.5rem 0 0.35rem;
	}
	.fyp-summary {
		font-size: 0.85rem;
		color: var(--text-secondary);
		line-height: 1.6;
		margin-bottom: 0.85rem;
	}
	.fyp-techs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.courses-heading {
		display: block;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-bottom: 0.75rem;
	}
	.courses-layout {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 0.55rem;
	}
	.course-chip {
		padding: 0.55rem 0.75rem;
		background: rgba(3, 7, 18, 0.45);
		border: 1px solid rgba(148, 163, 184, 0.08);
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.course-lead {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-primary);
	}
	.course-desc {
		font-size: 0.72rem;
		color: var(--text-muted);
	}

	@media (max-width: 1024px) {
		.matrix-grid {
			grid-template-columns: 1fr;
		}
	}
	.skills-section {
		--cyan: #67e8f9;
		--text-muted: #a6b5c6;
		background: #050d16;
	}
	.section-header {
		text-align: left;
		max-width: 760px;
		margin-bottom: 3rem;
	}
	.section-header h2 {
		background: none;
		-webkit-text-fill-color: currentColor;
		color: #edf3f7;
	}
	.section-label {
		color: #67e8f9;
	}
	.section-divider {
		margin-left: 0;
		height: 1px;
		background: #a5b4fc;
	}
	.matrix-grid {
		position: relative;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		padding-top: 64px;
	}
	.domain-paths {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 64px;
		fill: #050d16;
		stroke: #a5b4fc88;
		stroke-width: 1;
	}
	.domain-paths path {
		fill: none;
		vector-effect: non-scaling-stroke;
	}
	.domain-paths circle {
		stroke: #67e8f9;
	}
	.matrix-column {
		position: relative;
		padding: 1.3rem;
		background: #111a23;
		border: 1px solid #ffffff18;
		border-radius: 6px;
		min-width: 0;
	}
	.matrix-column::before {
		content: '';
		position: absolute;
		top: -4px;
		left: calc(50% - 4px);
		width: 7px;
		height: 7px;
		border: 1px solid var(--dom-accent);
		border-radius: 50%;
		background: #050d16;
	}
	.matrix-column:hover {
		background: #111a23;
		border-color: #ffffff18;
	}
	.col-meta-row,
	.spec-top {
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.spec-row {
		background: none;
		border: 0;
		border-bottom: 1px solid #ffffff18;
		border-radius: 0;
		padding: 0.8rem 0;
	}
	.spec-row:hover {
		background: none;
		border-color: #ffffff18;
	}
	.spec-tier {
		color: #e4c988;
		background: none;
		padding: 0;
	}
	.spec-usage {
		line-height: 1.7;
	}
	.chip-item:hover {
		transform: none;
	}
	.card,
	.card:hover {
		background: #111a23;
		border: 1px solid #ffffff18;
		border-radius: 6px;
		transform: none;
		box-shadow: none;
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
	}
	.certs-grid {
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
	}
	.courses-layout {
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
	}
	.tier-accent-green,
	.edu-cgpa-badge {
		color: #e4c988;
		background: #e4c98812;
		border-color: #e4c98840;
	}
	@media (max-width: 1024px) {
		.matrix-grid {
			grid-template-columns: 1fr;
			padding-top: 0;
			padding-left: 1.5rem;
			gap: 1.25rem;
		}
		.domain-paths {
			display: none;
		}
		.matrix-grid::before {
			content: '';
			position: absolute;
			left: 0;
			top: 1.8rem;
			bottom: 1.8rem;
			width: 1px;
			background: linear-gradient(#67e8f988, #a5b4fc88);
		}
		.matrix-column::before {
			top: 1.8rem;
			left: -1.5rem;
			width: 1.5rem;
			height: 8px;
			border: 0;
			border-top: 1px solid var(--dom-accent);
			border-right: 1px solid var(--dom-accent);
			border-radius: 0 6px 0 0;
			background: none;
		}
	}
	@media (max-width: 600px) {
		.edu-card {
			padding: 1.2rem;
		}
		.edu-card-top {
			gap: 0.6rem;
		}
		.edu-icon-wrap {
			width: 30px;
			height: 30px;
			font-size: 1rem;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		*,
		*::before,
		*::after {
			animation: none !important;
			transition: none !important;
		}
	}
</style>
