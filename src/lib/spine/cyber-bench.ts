/**
 * `cyber-bench.ts` — Meja Uji Kaca Cair "Tactile Cyber-Bench" (Sesi 4).
 *
 * Tiga alat kejuruteraan sebenar, 100% client-side & fungsi tulen:
 *   1. `parseIntentText` — Live Share-Intent Parser TINDAK (URL, telefon, RM).
 *   2. `fiberAttenuation` — Fiber-Optic Attenuation Lab (`1310nm`/`1550nm`, km, splice → dB).
 *   3. `evaluateRlsGate` — Supabase RLS JWT Packet Gate (anon/owner/auditor → lulus/tangkis).
 *
 * Semua fungsi tulen untuk ujian unit; tiada `{@html}`, tiada paparan data tidak
 * dipercayai kecuali melalui interpolasi teks Svelte yang selamat.
 */

export type IntentChannel = 'url' | 'phone' | 'payment';

export interface IntentExtraction {
	channel: IntentChannel;
	raw: string;
	normalized: string;
}

export interface IntentParseResult {
	text: string;
	extractions: IntentExtraction[];
}

export interface FiberAttenuationInput {
	/** Jarak laluan gentian dalam kilometer (1–120). */
	distanceKm: number;
	/** Panjang gelombang pengoperasian. */
	wavelengthNm: 1310 | 1550;
	/** Bilangan sambungan mekanikal (fusion splice). */
	splices: number;
}

export interface FiberAttenuationResult {
	totalLossDb: number;
	fiberLossDb: number;
	spliceLossDb: number;
	/** Rajah 0–1 untuk memandu kecerahan teras laser 3D (1 = tiada redaman). */
	brightness: number;
}

export type RlsRole = 'anon' | 'borrower_owner' | 'admin_auditor';

export interface RlsGateQuery {
	table: string;
	operation: 'select' | 'insert' | 'update' | 'delete';
	role: RlsRole;
	/** Id pemilik baris yang cuba diakses (`borrower_id`). */
	rowOwnerId: string | null;
	/** Id pengguna dalam payload JWT (`sub`). */
	jwtSub: string | null;
}

export interface RlsGateResult {
	allowed: boolean;
	verdictLabel: 'lulus' | 'tangkis';
	reason: string;
}

// ---- Alat 1: TINDAK Live Share-Intent Parser ---------------------------------

const URL_RE = /(?:https?:\/\/|www\.)[^\s<>,;"'()[\]]+/i;

// Nombor telefon Malaysia: +60 13-563 6124, 6013-5636124, 013-563 6124.
const PHONE_RE = /(?:\+?60|0)1[0-9]{1,2}[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g;

// Amaun bayaran: RM 1,250.50, RM1250, MYR 99. Peta kepada channel > pemisah cekap.
const PAYMENT_RE = /(?:RM|MYR)\s?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?/gi;

function normalizePhone(raw: string): string {
	const digits = raw.replace(/[^\d]/g, '');
	if (digits.length < 9) return raw;
	if (digits.startsWith('60') && digits.length >= 10) return `+${digits}`;
	if (digits.startsWith('0')) return `+6${digits}`;
	return `+${digits}`;
}

/**
 * Ekstrak niat daripada teks Share-Intent bercampur. local-first; tiada
 * panggilan rangkaian. Setiap padanan URL/telefon/bayaran dipisahkan mengikut
 * tertib kandungan supaya pengguna nampak ketiga-tiga laluan warna TINDAK.
 */
export function parseIntentText(rawText: string): IntentParseResult {
	const text = sanitizeIntentText(rawText);
	const extractions: IntentExtraction[] = [];

	// URL dahulu (supaya URL tidak ditelan oleh padanan telefon/bayaran).
	const urlMatch = text.match(URL_RE);
	if (urlMatch && urlMatch[0]) {
		extractions.push({
			channel: 'url',
			raw: urlMatch[0],
			normalized: normalizeUrl(urlMatch[0])
		});
	}

	const phoneMatch = text.match(PHONE_RE);
	if (phoneMatch && phoneMatch[0]) {
		const raw = phoneMatch[0].trim();
		extractions.push({ channel: 'phone', raw, normalized: normalizePhone(raw) });
	}

	const paymentMatches = text.match(PAYMENT_RE);
	if (paymentMatches) {
		for (const raw of paymentMatches.slice(0, 3)) {
			extractions.push({
				channel: 'payment',
				raw,
				normalized: normalizePayment(raw)
			});
		}
	}

	return { text, extractions };
}

/** Potong teks dan buang aksara kawalan; selamat untuk paparan Svelte. */
export function sanitizeIntentText(text: string, maxLength = 500): string {
	return text
		.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/g, '')
		.slice(0, maxLength);
}

function normalizeUrl(url: string): string {
	if (/^https?:\/\//i.test(url)) return url;
	return `https://${url}`;
}

function normalizePayment(raw: string): string {
	const digits = raw.replace(/[^\d.]/g, '');
	const [whole, frac] = digits.split('.');
	const grouped = (whole || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return frac ? `RM ${grouped}.${frac.slice(0, 2)}` : `RM ${grouped}`;
}

// ---- Alat 2: Fiber-Optic Attenuation Lab -------------------------------------

// Pekali redaman tipikal gentian mode-tunggal (dB/km). Nilai industri standard.
const FIBER_ATTENUATION_DB_KM: Record<1310 | 1550, number> = {
	1310: 0.35,
	1550: 0.2
};

/** Kehilangan purata setiap fusion splice (dB), sekitar 0.05–0.1 dB industri. */
const SPLICE_LOSS_DB = 0.08;

export function fiberAttenuation(input: FiberAttenuationInput): FiberAttenuationResult {
	const distanceKm = clampFinite(input.distanceKm, 1, 120);
	const splices = Math.floor(clampFinite(input.splices, 0, 60));
	const coefficient = FIBER_ATTENUATION_DB_KM[input.wavelengthNm === 1310 ? 1310 : 1550];

	const fiberLossDb = roundDb(distanceKm * coefficient);
	const spliceLossDb = roundDb(splices * SPLICE_LOSS_DB);
	const totalLossDb = roundDb(fiberLossDb + spliceLossDb);

	// Kecerahan teras: redaman 0 dB → 100%; 25 dB → 0% (anggaran linear selamat).
	const brightness = roundTo(clampFinite(1 - totalLossDb / 25, 0, 1), 4);

	return { totalLossDb, fiberLossDb, spliceLossDb, brightness };
}

function clampFinite(value: number, min: number, max: number): number {
	const num = Number.isFinite(value) ? value : min;
	return Math.max(min, Math.min(max, num));
}

function roundDb(value: number): number {
	const rounded = Math.round(value * 100) / 100;
	return Number.isFinite(rounded) ? rounded : 0;
}

function roundTo(value: number, places: number): number {
	const factor = 10 ** places;
	const rounded = Math.round(value * factor) / factor;
	return Number.isFinite(rounded) ? rounded : 0;
}

// ---- Alat 3: Supabase RLS JWT Packet Gate -----------------------------------

/**
 * Simulasi polisi RLS IWA001 bagi jadual `loan_applications` dan `repayments`.
 * Selaras dengan polisi RLS sebenar: `anon` hanya boleh baca baris milik awam,
 * `borrower_owner` boleh baca/tulis baris milik sendiri, `admin_auditor` boleh
 * baca semua tetapi bukan menulis rekod peminjam.
 */
export function evaluateRlsGate(query: RlsGateQuery): RlsGateResult {
	if (query.table !== 'loan_applications' && query.table !== 'repayments') {
		return {
			allowed: false,
			verdictLabel: 'tangkis',
			reason: 'Jadual tidak wujud dalam skema RLS'
		};
	}

	if (query.role === 'admin_auditor') {
		const allowed = query.operation === 'select';
		return allowed
			? { allowed, verdictLabel: 'lulus', reason: 'Auditor dibenarkan baca semua baris' }
			: {
					allowed,
					verdictLabel: 'tangkis',
					reason: 'Auditor tidak dibenarkan menulis rekod peminjam'
				};
	}

	if (query.role === 'borrower_owner') {
		const ownsRow = query.jwtSub !== null && query.jwtSub === query.rowOwnerId;
		if (ownsRow) {
			const allowed = query.operation === 'select' || query.operation === 'update';
			return allowed
				? { allowed, verdictLabel: 'lulus', reason: 'Pemilik dibenarkan mengurus baris sendiri' }
				: { allowed, verdictLabel: 'tangkis', reason: 'Operasi tidak dibenarkan pada baris ini' };
		}
		return {
			allowed: false,
			verdictLabel: 'tangkis',
			reason: 'baris ini milik peminjam lain'
		};
	}

	// `anon`: hanya baca, dan hanya jika token membawa `sub` (tidak pernah null).
	const allowed =
		query.operation === 'select' && query.jwtSub !== null && query.rowOwnerId !== null;
	return allowed
		? { allowed, verdictLabel: 'lulus', reason: 'Bacaan awam dibenarkan untuk baris terdedah' }
		: { allowed, verdictLabel: 'tangkis', reason: 'Peranan anon ditolak untuk akses ini' };
}

/** Label manusia bagi setiap peranan (kekal bahasa-neutral; UI terjemah). */
export const RLS_ROLE_LABELS: Record<RlsRole, string> = {
	anon: 'anon',
	borrower_owner: 'borrower_owner',
	admin_auditor: 'admin_auditor'
};

export const RLS_TABLES = ['loan_applications', 'repayments'] as const;
export const RLS_ROLES: RlsRole[] = ['anon', 'borrower_owner', 'admin_auditor'];
