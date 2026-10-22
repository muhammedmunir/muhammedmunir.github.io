<script lang="ts">
	import { lang } from '$lib/i18n';
	import { translations } from '$lib/translations';
	import { skillGroups, tierLabels, accuracyNote } from '$lib/deck/deck-evidence';
	const t = $derived(translations[$lang].skills);
	const education = $derived(translations[$lang].edu);
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
			badgeKey: 'bachelor' as const,
			majorCode: 'B.Sc. (Computer Science - Networks & Security)'
		},
		{
			degreeKey: 'diploma' as const,
			institution: 'Universiti Teknologi Malaysia (UTM)',
			location: 'Kuala Lumpur',
			cgpa: '2.72',
			badgeKey: 'diploma' as const,
			majorCode: 'Dip. (Computer Science)'
		}
	];
</script>

<section id="skills" aria-labelledby="skills-title">
	<div class="section">
		<header class="section-header">
			<p class="section-label">{t.label}</p>
			<h2 id="skills-title">{t.title}</h2>
			<p class="section-desc">{t.desc}</p>
		</header>
		<div class="skill-groups">
			{#each skillGroups as group, index}
				<article class="skill-group">
					<div class="group-heading">
						<span>0{index + 1}</span>
						<h3>{group.title[$lang]}</h3>
					</div>
					<ul>
						{#each group.items as skill}<li>
								<div class="skill-heading">
									<h4>{skill.name}</h4>
									<span>{tierLabels[skill.tier][$lang].split(' — ')[0]}</span>
								</div>
								<p>{skill.what[$lang]}</p>
								<small
									>{$lang === 'ms' ? 'Digunakan dalam' : 'Used in'}: {skill.where.join(
										' · '
									)}</small
								>
							</li>{/each}
					</ul>
				</article>
			{/each}
		</div>
		<p class="accuracy-note">{accuracyNote[$lang]}</p>
		<div class="tools">
			<h3>{t.tools_label}</h3>
			<div class="tool-tags">
				{#each toolsSkills as tool}<span class="tag">{tool}</span>{/each}
			</div>
		</div>
		<div class="credentials">
			<div>
				<h3>{t.certs_label}</h3>
				<ul class="certificates">
					{#each certifications as cert}<li>
							<h4>{cert.name}</h4>
							<p>{cert.issuer}</p>
						</li>{/each}
				</ul>
			</div>
			<div>
				<h3>{t.edu_label}</h3>
				{#each educations as edu}<article class="education">
						<p class="education-meta">{education[edu.degreeKey].period} · {t.cgpa} {edu.cgpa}</p>
						<h4>{education[edu.degreeKey].title}</h4>
						<p class="institution">{edu.institution} · {edu.location}</p>
						<p>{education[edu.degreeKey].major}</p>
						<details>
							<summary>{t.fyp_label} &amp; {t.courses_label}</summary>
							<div class="education-details">
								<h5>{education[edu.degreeKey].fyp_title}</h5>
								<p>{education[edu.degreeKey].fyp_desc}</p>
								<ul>
									{#each education[edu.degreeKey].courses as course}<li>
											<strong>{course.name}</strong>
											<p>{course.detail}</p>
										</li>{/each}
								</ul>
							</div>
						</details>
					</article>{/each}
			</div>
		</div>
	</div>
</section>

<style>
	#skills {
		border-bottom: 1px solid #c8bfb2;
	}
	.skill-groups {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 2rem;
	}
	.group-heading {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		padding: 1rem 0;
		border-top: 1px solid #897b6b;
	}
	.group-heading > span {
		color: #75442b;
		font-size: 0.75rem;
	}
	.group-heading h3 {
		font-size: 1.6rem;
	}
	.skill-group ul {
		list-style: none;
		padding: 0;
	}
	.skill-group li {
		border-top: 1px solid #c8bfb2;
		padding: 1.25rem 0;
	}
	.skill-heading {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	h4 {
		font:
			600 0.9rem/1.5 Arial,
			sans-serif;
	}
	.skill-heading span {
		color: #75442b;
		font-size: 0.67rem;
	}
	.skill-group li p {
		font-size: 0.8rem;
		margin-top: 0.6rem;
		color: #645a4f;
	}
	.skill-group small {
		display: block;
		font-size: 0.68rem;
		margin-top: 0.6rem;
	}
	.accuracy-note {
		font-size: 0.75rem;
		color: #645a4f;
		border-top: 1px solid #c8bfb2;
		padding-top: 1.25rem;
		margin-top: 1rem;
		max-width: 100ch;
	}
	.tools {
		margin-top: 3rem;
		display: grid;
		grid-template-columns: 240px minmax(0, 1fr);
		gap: 3rem;
		border-block: 1px solid #c8bfb2;
		padding-block: 2rem;
	}
	.tools h3 {
		font-size: 1.5rem;
	}
	.tool-tags {
		display: flex;
		flex-wrap: wrap;
		align-content: start;
		gap: 0.5rem;
	}
	.credentials {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		margin-top: 4rem;
	}
	.credentials > div > h3 {
		margin-bottom: 1.5rem;
	}
	.certificates {
		list-style: none;
		padding: 0;
	}
	.certificates li {
		border-top: 1px solid #c8bfb2;
		padding-block: 1rem;
	}
	.certificates p,
	.education > p {
		font-size: 0.8rem;
		color: #645a4f;
		margin-top: 0.35rem;
	}
	.education {
		border-top: 1px solid #897b6b;
		padding: 1.5rem 0;
	}
	.education h4 {
		margin-top: 0.8rem;
		font-size: 1rem;
	}
	.education .education-meta {
		margin: 0;
		font-size: 0.7rem;
		color: #75442b;
	}
	details {
		margin-top: 1rem;
	}
	summary {
		cursor: pointer;
		min-height: 44px;
		padding-block: 0.6rem;
		font-size: 0.8rem;
		color: #75442b;
	}
	.education-details {
		padding: 0.75rem 0;
		font-size: 0.8rem;
	}
	h5 {
		font:
			600 0.85rem/1.5 Arial,
			sans-serif;
		margin: 0 0 0.5rem;
	}
	.education-details ul {
		padding-left: 1.2rem;
	}
	.education-details li {
		margin-top: 1rem;
	}
	.education-details p {
		color: #645a4f;
	}
	@media (max-width: 1000px) {
		.skill-groups {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.credentials {
			gap: 2rem;
		}
	}
	@media (max-width: 720px) {
		.skill-groups,
		.credentials,
		.tools {
			grid-template-columns: 1fr;
		}
		.tools {
			gap: 1.25rem;
		}
		.credentials {
			gap: 3rem;
		}
	}
</style>
