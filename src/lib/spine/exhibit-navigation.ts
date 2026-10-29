import {
	PROFILE,
	PROJECT_ARCHIVE,
	STATIONS,
	TECHNICAL_SKILLS,
	type HotspotItem,
	type LocalizedText
} from './spine-data';

export type ExhibitRoute =
	| { kind: 'hotspot'; id: string }
	| { kind: 'project'; id: string }
	| { kind: 'technology'; name: string };

export type ExhibitAction =
	| { kind: 'navigate'; route: ExhibitRoute }
	| { kind: 'back' }
	| { kind: 'previous' }
	| { kind: 'next' }
	| { kind: 'close' }
	| { kind: 'page'; delta: number }
	| { kind: 'link'; url: string }
	| { kind: 'editorial' };

export interface ExhibitView {
	key: string;
	code: string;
	title: LocalizedText;
	subtitle: LocalizedText;
	summary: LocalizedText;
	tech: string[];
	actions: Array<{ id: string; label: LocalizedText; action: ExhibitAction }>;
}

const text = (ms: string, en = ms): LocalizedText => ({ ms, en });
const copyText = (value: LocalizedText): LocalizedText => ({ ...value });
const routeKey = (route: ExhibitRoute) =>
	`${route.kind}:${route.kind === 'technology' ? route.name : route.id}`;

// ID warisan tidak menerangkan kandungan semasa; padanan mesti eksplisit.
const namedChips = new Map<string, ExhibitRoute>([
	['eMesys · Sutera · ADIMS', { kind: 'hotspot', id: 'ent-emesys' }],
	['eMesys', { kind: 'hotspot', id: 'ent-emesys' }],
	['Sutera', { kind: 'hotspot', id: 'ent-emesys' }],
	['ADIMS', { kind: 'hotspot', id: 'ent-emesys' }],
	['IWA001 Supabase RLS', { kind: 'project', id: 'proj-loan-iwa001' }],
	['IWA001', { kind: 'project', id: 'proj-loan-iwa001' }],
	['Infinity World', { kind: 'project', id: 'proj-real-estate' }],
	['Onboardx Flutter', { kind: 'project', id: 'proj-onboardx' }],
	['Onboardx', { kind: 'project', id: 'proj-onboardx' }]
]);

const contactChips = new Map<string, string>([
	[PROFILE.phone, `tel:${PROFILE.phone.replace(/[^+\d]/g, '')}`],
	[PROFILE.email, `mailto:${PROFILE.email}`],
	['Official Resume PDF', PROFILE.resumeUrl],
	['GitHub (muhammedmunir)', PROFILE.githubUrl],
	['LinkedIn Profile', PROFILE.linkedinUrl]
]);
const passiveChips = new Set([PROFILE.location]);

const hotspotProjects = new Map<string, string[]>([
	['ent-emesys', ['proj-emesys-sutera-adims']],
	['ent-sutera', ['proj-loan-iwa001', 'proj-real-estate']],
	['ent-adims', ['proj-onboardx']],
	['ai-tindak', ['proj-tindak']],
	['ai-9router', ['proj-9router']],
	['ai-cv-rag', ['proj-cv-bot', 'proj-ai-policy-rag']],
	['proj-pin-bik', ['proj-baby-kicking']],
	['proj-pin-lumina', ['proj-lumina-wedding']],
	['net-utm-degree', ['proj-utm-fyp-homelab']],
	['term-email', ['proj-utm-fyp-homelab']]
]);

// Pecahan label berkaitan, bukan carian kabur atau dakwaan versi yang setara.
const technologyParts = new Map<string, readonly string[]>([
	['Flutter (Dart)', ['Flutter', 'Dart']],
	['Laravel 11/12 (PHP 8.2+)', ['Laravel', 'PHP']],
	['Laravel 11/12 (Filament)', ['Laravel', 'Laravel Filament']],
	['Laravel 11/12', ['Laravel']],
	['Laravel 11 RESTful API', ['Laravel', 'RESTful APIs']],
	['Laravel & MySQL', ['Laravel', 'MySQL']],
	['PHP & MySQL', ['PHP', 'MySQL']],
	['Node.js 22+', ['Node.js']],
	['JavaScript (ES6+)', ['JavaScript']],
	['PostgreSQL (RLS)', ['PostgreSQL', 'RLS']],
	['PostgreSQL 17', ['PostgreSQL']],
	['MySQL & MariaDB', ['MySQL', 'MariaDB']],
	['Supabase RLS', ['Supabase', 'RLS']],
	['Supabase RLS & JWT', ['Supabase', 'RLS', 'JWT']],
	['JWT Auth', ['JWT']],
	['Firebase (Firestore & Realtime DB)', ['Firebase', 'Firestore', 'Realtime DB']],
	['Firebase Realtime DB', ['Firebase', 'Realtime DB']],
	['Firebase Cloud Firestore', ['Firebase', 'Firestore']],
	['Firebase Firestore', ['Firebase', 'Firestore']],
	['Firebase Functions', ['Firebase', 'Cloud Functions']],
	['Jenkins CI/CD', ['Jenkins']],
	['Kubernetes (Basic)', ['Kubernetes']],
	['Cloudflare WAF/CDN', ['Cloudflare WAF', 'Cloudflare CDN']],
	['Vulhub CVE', ['Vulhub', 'CVE']],
	['Vulhub Docker Labs', ['Vulhub', 'Docker']],
	['Red Team CVE Analysis', ['CVE']],
	['ISO 27001 & NIST', ['ISO 27001', 'NIST']],
	['CCNAv7 & DevNet', ['CCNAv7', 'Cisco DevNet Associate']],
	['Linux & Windows Server', ['Linux', 'Windows Server']],
	['Ubuntu & Windows Server', ['Linux', 'Windows Server']],
	['Linux (Ubuntu, Kali)', ['Linux']],
	['Linux & Docker Homelab', ['Linux', 'Docker', 'Self-Hosted Infrastructure']],
	['Python Computer Vision', ['Python', 'OpenCV']],
	['OpenCV (SIFT & CIELAB)', ['OpenCV', 'SIFT', 'CIELAB']],
	['SIFT & CIELAB', ['SIFT', 'CIELAB']],
	['Playwright MCP', ['Playwright', 'Model Context Protocol (MCP)']],
	['100% PHPUnit Tests', ['PHPUnit']],
	['PHPUnit (100%)', ['PHPUnit']],
	['Python Data Analysis', ['Python']]
]);

const categoryHotspots = new Map<string, string>([
	['frontend-mobile', 'mob-nova-loan'],
	['backend-apis', 'mob-nova-loan'],
	['databases-cloud', 'mob-onboardx'],
	['devops-security', 'mob-onboardx'],
	['ai-automation-tools', 'mob-bik-lumina']
]);

const allHotspots = STATIONS.flatMap((station) => station.hotspots);
const technologyNames = new Set([
	...allHotspots.flatMap((hotspot) => hotspot.tech),
	...PROJECT_ARCHIVE.flatMap((project) => project.stack),
	...TECHNICAL_SKILLS.flatMap((category) => category.skills)
]);

function isTechnology(name: string): boolean {
	return (
		technologyNames.has(name) &&
		!namedChips.has(name) &&
		!contactChips.has(name) &&
		!passiveChips.has(name)
	);
}

function relatedLabels(name: string, labels: string[]): string[] {
	const parts = technologyParts.get(name) ?? [name];
	return labels.filter((label) =>
		(technologyParts.get(label) ?? [label]).some((part) => parts.includes(part))
	);
}

function editorialAction(): ExhibitView['actions'][number] {
	return {
		id: 'editorial',
		label: text('Baca Mod Editorial CV', 'Read Editorial CV Mode'),
		action: { kind: 'editorial' }
	};
}

export function getHotspotLocation(
	id: string
): { hotspot: HotspotItem; stationIndex: number } | null {
	for (const station of STATIONS) {
		const hotspot = station.hotspots.find((item) => item.id === id);
		if (hotspot) return { hotspot, stationIndex: station.index };
	}
	return null;
}

function technologyView(name: string): ExhibitView | null {
	if (!isTechnology(name)) return null;
	const categories = TECHNICAL_SKILLS.filter(
		(category) => relatedLabels(name, category.skills).length > 0
	);
	const projects = PROJECT_ARCHIVE.filter(
		(project) => relatedLabels(name, project.stack).length > 0
	);
	const hotspots = allHotspots.filter((hotspot) => relatedLabels(name, hotspot.tech).length > 0);
	const actions: ExhibitView['actions'] = projects.map((project) => ({
		id: `project:${project.id}`,
		label: text(project.name),
		action: { kind: 'navigate', route: { kind: 'project', id: project.id } }
	}));
	const contextIds = new Set([
		...hotspots.map((hotspot) => hotspot.id),
		...categories.flatMap((category) => {
			const id = categoryHotspots.get(category.id);
			return id ? [id] : [];
		})
	]);
	for (const id of contextIds) {
		const location = getHotspotLocation(id);
		if (!location) continue;
		actions.push({
			id: `hotspot:${id}`,
			label: copyText(location.hotspot.pinLabel),
			action: { kind: 'navigate', route: { kind: 'hotspot', id } }
		});
	}

	const summaryFor = (locale: 'ms' | 'en') => {
		const paragraphs = categories.map((category) =>
			locale === 'ms'
				? `Kategori CV: ${category.category.ms}. Kemahiran yang disenaraikan: ${category.skills.join(', ')}.`
				: `CV category: ${category.category.en}. Listed skills: ${category.skills.join(', ')}.`
		);
		for (const project of projects) {
			paragraphs.push(
				`${project.name}\n${project.summary[locale]}\n${locale === 'ms' ? 'Label timbunan berkaitan' : 'Related stack labels'}: ${relatedLabels(name, project.stack).join(', ')}.`
			);
		}
		// Label terpencil masih mendapat konteks CV sebenar, bukan penerangan rekaan.
		if (projects.length === 0) {
			for (const hotspot of hotspots) {
				paragraphs.push(`${hotspot.title[locale]}\n${hotspot.summary[locale]}`);
			}
		}
		return paragraphs.join('\n\n');
	};

	return {
		key: routeKey({ kind: 'technology', name }),
		code: 'TECH',
		title: text(name),
		subtitle: categories.length
			? text(
					categories.map((category) => category.category.ms).join(' · '),
					categories.map((category) => category.category.en).join(' · ')
				)
			: text('Konteks kemahiran & rekod CV', 'Skill context & CV records'),
		summary: text(summaryFor('ms'), summaryFor('en')),
		tech: [...new Set(categories.flatMap((category) => category.skills))].filter(
			(skill) => skill !== name
		),
		actions: [...actions, editorialAction()]
	};
}

export function resolveExhibitView(route: ExhibitRoute): ExhibitView | null {
	if (route.kind === 'technology') return technologyView(route.name);
	if (route.kind === 'project') {
		const index = PROJECT_ARCHIVE.findIndex((project) => project.id === route.id);
		if (index < 0) return null;
		const project = PROJECT_ARCHIVE[index];
		const actions: ExhibitView['actions'] = [];
		// Pautan projek datang daripada rekod arkib ini sahaja.
		for (const [id, url, label] of [
			['repository', project.repoUrl, text('Repositori GitHub', 'GitHub repository')],
			['case-study', project.caseStudyUrl, text('Kajian kes PDF', 'PDF case study')],
			['live', project.liveUrl, text('Buka pautan projek', 'Open project link')]
		] as const) {
			if (url) actions.push({ id, label, action: { kind: 'link', url } });
		}
		return {
			key: routeKey(route),
			code: `PROJECT / ${String(index + 1).padStart(2, '0')}`,
			title: text(project.name),
			subtitle: copyText(project.badge),
			summary: text(
				`${project.summary.ms}\n\nSeni bina\n${project.architecture.ms}`,
				`${project.summary.en}\n\nArchitecture\n${project.architecture.en}`
			),
			tech: [...project.stack],
			actions: [...actions, editorialAction()]
		};
	}
	if (route.kind !== 'hotspot') return null;
	const location = getHotspotLocation(route.id);
	if (!location) return null;
	const { hotspot } = location;
	const actions: ExhibitView['actions'] = [];
	if (hotspot.link) {
		actions.push({
			id: 'primary',
			label: copyText(hotspot.linkLabel ?? text('Buka pautan', 'Open link')),
			action: { kind: 'link', url: hotspot.link }
		});
	}
	// PDF Infinity World pada ent-adims tidak berkaitan dengan Onboardx.
	if (hotspot.secondaryLink && hotspot.id !== 'ent-adims') {
		actions.push({
			id: 'secondary',
			label: copyText(hotspot.secondaryLinkLabel ?? text('Pautan tambahan', 'Additional link')),
			action: { kind: 'link', url: hotspot.secondaryLink }
		});
	}
	for (const id of hotspotProjects.get(hotspot.id) ?? []) {
		const project = PROJECT_ARCHIVE.find((item) => item.id === id);
		if (project) {
			actions.push({
				id: `project:${id}`,
				label: text(project.name),
				action: { kind: 'navigate', route: { kind: 'project', id } }
			});
		}
	}
	return {
		key: routeKey(route),
		code: hotspot.code,
		title: copyText(hotspot.title),
		subtitle: copyText(hotspot.subtitle),
		summary: copyText(hotspot.summary),
		tech: [...hotspot.tech],
		actions: [...actions, editorialAction()]
	};
}

export function getChipAction(view: ExhibitView, chip: string): ExhibitAction | null {
	if (!view.tech.includes(chip)) return null;
	const url = contactChips.get(chip);
	if (url) return { kind: 'link', url };
	const route =
		namedChips.get(chip) ??
		(isTechnology(chip) ? { kind: 'technology' as const, name: chip } : null);
	if (!route || routeKey(route) === view.key) return null;
	return { kind: 'navigate', route: { ...route } };
}
