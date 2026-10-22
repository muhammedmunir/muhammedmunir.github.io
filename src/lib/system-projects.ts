import type { Lang } from '$lib/i18n';
import { projectEvidence } from '$lib/cortex-data';

type Localized = Record<Lang, string>;
export type SystemLayer = { label: Localized; technology: string; detail: Localized };
export type SystemProject = {
	key: 'emesys' | 'onboardx' | 'cv_bot';
	name: string;
	context: Localized;
	summary: Localized;
	accent: string;
	spread: number;
	layers: SystemLayer[];
};

// Curated from Projects.svelte technology tags and translations.ts project descriptions.
// Layers group documented capabilities for explanation; they do not assert a deployed topology.
export const systemProjects: SystemProject[] = [
	{
		key: 'emesys',
		name: 'eMesys',
		accent: '#ce9473',
		spread: 0,
		context: { ms: 'YHCM / Sistem sektor awam', en: 'YHCM / Public-sector systems' },
		summary: {
			ms: 'Daripada rekod aset kepada aliran kelulusan. Platform pengurusan kitaran hayat aset dan logistik sektor awam.',
			en: 'From asset records to approval workflows. A public-sector platform for asset lifecycle management and logistics.'
		},
		layers: [
			{
				label: { ms: 'Antara muka', en: 'Interface' },
				technology: 'Vue.js 3',
				detail: { ms: 'Pendaftaran dan pemantauan aset.', en: 'Asset registration and monitoring.' }
			},
			{
				label: { ms: 'Aliran kerja', en: 'Workflow' },
				technology: 'Laravel 11',
				detail: {
					ms: 'Kelulusan pelupusan, RBAC dan log audit.',
					en: 'Disposal approvals, RBAC and audit logs.'
				}
			},
			{
				label: { ms: 'Rekod', en: 'Records' },
				technology: 'MariaDB',
				detail: {
					ms: 'Rekod inventori dan kitaran hayat aset.',
					en: 'Inventory and asset lifecycle records.'
				}
			},
			{
				label: { ms: 'Infrastruktur', en: 'Infrastructure' },
				technology: 'Docker Swarm',
				detail: {
					ms: 'Teknologi deployment yang disenaraikan.',
					en: 'Documented deployment technology.'
				}
			}
		]
	},
	{
		key: 'onboardx',
		name: 'OnboardX',
		accent: '#b8b399',
		spread: 16,
		context: { ms: 'TNB / Mobiliti perusahaan', en: 'TNB / Enterprise mobility' },
		summary: {
			ms: 'Permulaan kerja yang lebih tersusun. Aplikasi onboarding pekerja untuk dokumen, pengesahan profil dan tugasan latihan.',
			en: 'A more considered first day. Employee onboarding across documents, profile verification and training tasks.'
		},
		layers: [
			{
				label: { ms: 'Pengalaman', en: 'Experience' },
				technology: 'Flutter',
				detail: { ms: 'Antara muka web dan mudah alih.', en: 'Web and mobile interfaces.' }
			},
			{
				label: { ms: 'Onboarding', en: 'Onboarding' },
				technology: 'Documents / Profiles',
				detail: {
					ms: 'Dokumen, pengesahan profil dan latihan.',
					en: 'Documents, profile verification and training.'
				}
			},
			{
				label: { ms: 'Data', en: 'Data' },
				technology: 'Firebase / MongoDB',
				detail: {
					ms: 'Turut menyenaraikan Supabase dan MySQL.',
					en: 'Also documents Supabase and MySQL.'
				}
			},
			{
				label: { ms: 'Penghantaran', en: 'Delivery' },
				technology: 'Azure / Jenkins',
				detail: {
					ms: 'Pelayan awan dan automasi CI/CD.',
					en: 'Cloud hosting and CI/CD automation.'
				}
			}
		]
	},
	{
		key: 'cv_bot',
		name: 'Computer vision',
		accent: '#b99c80',
		spread: -16,
		context: {
			ms: 'Projek peribadi / Automasi desktop',
			en: 'Personal project / Desktop automation'
		},
		summary: {
			ms: 'Melihat, mengenal pasti, bertindak. Automasi desktop Python dengan pengecaman visual dan kawalan sempadan tetingkap.',
			en: 'See, recognise, act. Python desktop automation combining visual recognition with window-boundary safety controls.'
		},
		layers: [
			{
				label: { ms: 'Kawalan', en: 'Controls' },
				technology: 'CustomTkinter',
				detail: {
					ms: 'Papan pemuka dan pengelogan berstruktur.',
					en: 'Dashboard and structured logging.'
				}
			},
			{
				label: { ms: 'Pengecaman', en: 'Recognition' },
				technology: 'OpenCV / SIFT',
				detail: {
					ms: 'Pemadanan templat dan segmentasi CIELAB.',
					en: 'Template matching and CIELAB segmentation.'
				}
			},
			{
				label: { ms: 'Automasi', en: 'Automation' },
				technology: 'Python',
				detail: {
					ms: 'Penjejakan sasaran dan pemprosesan OCR.',
					en: 'Target tracking and OCR processing.'
				}
			},
			{
				label: { ms: 'Sempadan selamat', en: 'Safety boundary' },
				technology: 'Win32 API',
				detail: {
					ms: 'Kawalan sempadan kawasan klien tetingkap.',
					en: 'Native window client-area safety guards.'
				}
			}
		]
	}
];

export function systemEvidence(project: SystemProject, language: Lang) {
	return projectEvidence(project.key, language);
}
