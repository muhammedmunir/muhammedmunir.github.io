<script lang="ts">
	import { lang } from '$lib/i18n';

	type SkillCategory = {
		title: { ms: string; en: string };
		icon: string;
		skills: { name: string; level: string; note: string }[];
	};

	const skillCategories: SkillCategory[] = [
		{
			title: { ms: 'Seni Bina & Backend', en: 'Architecture & Backend' },
			icon: '⚡',
			skills: [
				{ name: 'Laravel 12 / 11', level: 'Pakar', note: 'Filament, API Resources, Queues' },
				{ name: 'Vue.js 3', level: 'Pakar', note: 'Composition API, Pinia, Vite' },
				{ name: 'SvelteKit & Svelte 5', level: 'Mahir', note: 'Runes, SSR, Static Prerendering' },
				{ name: 'TypeScript / Node.js', level: 'Mahir', note: 'Type-safe systems, REST & WebSockets' },
				{ name: 'PHP 8.3+', level: 'Pakar', note: 'Strict typing, OOP, Design Patterns' }
			]
		},
		{
			title: { ms: 'Awan, DevOps & Pelayan', en: 'Cloud, DevOps & Infra' },
			icon: '☁️',
			skills: [
				{ name: 'Docker Swarm', level: 'Pakar', note: 'Multi-node services, overlay networks' },
				{ name: 'Microsoft Azure', level: 'Mahir', note: 'Ubuntu VMs, NSG, Cloud Storage' },
				{ name: 'Pentadbiran Linux', level: 'Pakar', note: 'Ubuntu, Debian, systemd, SSH Hardening' },
				{ name: 'CI/CD Pipelines', level: 'Mahir', note: 'Jenkins, GitHub Actions automated build' },
				{ name: 'Nginx & WAF', level: 'Pakar', note: 'Reverse proxy, SSL, Cloudflare WAF' }
			]
		},
		{
			title: { ms: 'Keselamatan & Rangkaian', en: 'Security & Networking' },
			icon: '🛡️',
			skills: [
				{ name: 'Cisco Networking (CCNA)', level: 'Bertauliah', note: 'Subnetting, VLAN, OSPF, Routing' },
				{ name: 'Splunk SIEM (SOC)', level: 'Mahir', note: 'Threat hunting, log analytics, alerts' },
				{ name: 'Kawalan Akses (RBAC)', level: 'Pakar', note: 'Granular permissions, Audit logs, SSO' },
				{ name: 'Ujian Penembusan', level: 'Pengetahuan', note: 'Wireshark, Metasploit, Burp Suite, Vulhub' },
				{ name: 'Integriti Data Kerajaan', level: 'Pakar', note: 'Public-sector compliance & data hygiene' }
			]
		},
		{
			title: { ms: 'Kreatif, 3D & Mobiliti', en: 'Creative Dev, 3D & Mobile' },
			icon: '✦',
			skills: [
				{ name: 'Three.js & WebGL', level: 'Mahir', note: 'Shaders, PBR materials, smooth render loop' },
				{ name: 'GSAP Animation', level: 'Mahir', note: 'Timeline choreography, micro-interactions' },
				{ name: 'Flutter & Dart', level: 'Mahir', note: 'Cross-platform mobile, state management' },
				{ name: 'OpenCV & Python', level: 'Mahir', note: 'SIFT, CIELAB computer vision, desktop automation' },
				{ name: 'Tailwind CSS', level: 'Pakar', note: 'Modern responsive systems, design tokens' }
			]
		}
	];
</script>

<section id="skills" class="section skills-section" aria-label="Technical Skills Matrix">
	<div class="container">
		<div class="section-header">
			<span class="section-label">
				{$lang === 'ms' ? '04 / Keupayaan Teknikal' : '04 / Technical Capabilities'}
			</span>
			<h2 class="section-title">
				{$lang === 'ms' ? 'Kemahiran yang dipraktikkan dalam produksi.' : 'Skills forged in high-stakes production.'}
			</h2>
			<p class="section-desc">
				{$lang === 'ms'
					? 'Bukan sekadar senarai kata kunci; setiap alat dan teknologi ini digunakan untuk membina, mengamankan, dan melancarkan sistem sebenar.'
					: 'Not just a list of keywords; every tool and technology here has been leveraged to architect, secure, and ship production systems.'}
			</p>
		</div>

		<!-- Skills Matrix Grid -->
		<div class="skills-grid">
			{#each skillCategories as cat}
				<div class="skill-category-card">
					<div class="category-header">
						<span class="category-icon">{cat.icon}</span>
						<h3 class="category-title">{cat.title[$lang]}</h3>
					</div>

					<div class="skills-list">
						{#each cat.skills as s}
							<div class="skill-item">
								<div class="skill-header">
									<span class="skill-name">{s.name}</span>
									<span class="skill-level">{s.level}</span>
								</div>
								<span class="skill-note">{s.note}</span>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.skills-section {
		background-color: var(--bg);
		border-top: 1px solid var(--surface-border);
	}

	.section-header {
		max-width: 740px;
		margin-bottom: clamp(3rem, 6vw, 4.5rem);
	}

	.skills-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: clamp(1.5rem, 3vw, 2rem);
	}

	.skill-category-card {
		padding: clamp(1.75rem, 2.5vw, 2.25rem);
		border-radius: 1.25rem;
		background: var(--surface);
		border: 1px solid var(--surface-border);
		box-shadow: var(--shadow-sm);
		transition: all 0.25s ease;
		display: flex;
		flex-direction: column;
	}

	.skill-category-card:hover {
		border-color: var(--surface-border-hover);
		transform: translateY(-3px);
		box-shadow: var(--shadow-md);
	}

	.category-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--surface-border);
	}

	.category-icon {
		font-size: 1.3rem;
		line-height: 1;
	}

	.category-title {
		font-size: 1.18rem;
		font-weight: 700;
		color: var(--ink);
		letter-spacing: -0.02em;
	}

	.skills-list {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		flex: 1;
	}

	.skill-item {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.skill-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.skill-name {
		font-weight: 600;
		font-size: 0.94rem;
		color: var(--ink);
	}

	.skill-level {
		font-size: 0.74rem;
		font-weight: 600;
		padding: 0.2rem 0.5rem;
		border-radius: 9999px;
		background: var(--bg-subtle);
		color: var(--accent);
		border: 1px solid var(--surface-border);
	}

	.skill-note {
		font-size: 0.8rem;
		color: var(--ink-muted);
	}
</style>
