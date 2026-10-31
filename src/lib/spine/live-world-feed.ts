/**
 * `live-world-feed.ts` — Suapan Dunia Langsung Malaysia (Sesi 4).
 *
 * Tiga keupayaan utama:
 *   1. Waktu `Asia/Kuala_Lumpur` (UTC+8, tiada DST) + cuaca semasa Puchong
 *      (Open-Meteo, tanpa kunci API) dipetakan ke `OCEAN_WEATHER_PRESETS`.
 *   2. Suapan komit awam `github.com/muhammedmunir` + ringkasan CVE awam
 *      (CISA KEV) dengan snapshot fallback luar talian.
 *   3. Semua input API awam dianggap tidak dipercayai: disahkan skema,
 *      dipotong panjang, dan disucikan daripada aksara kawalan.
 *
 * Semua fungsi tulen dieksport bagi ujian unit; fungsi fetch menerima
 * kebergantungan boleh-suntik (`fetch`, `AbortController`, `storage`, `now`)
 * supaya kegagalan rangkaian boleh diuji tanpa rangkaian sebenar.
 */

export type WeatherPresetId = 'golden_horizon' | 'emerald_day' | 'biolum_night' | 'monsoon_swell';

export interface KualaLumpurClock {
	hour: number;
	minute: number;
	isDay: boolean;
}

export interface LiveWeatherSnapshot {
	presetId: WeatherPresetId;
	source: 'live' | 'fallback';
	condition: string;
	temperatureC: number | null;
	windSpeedKmh: number | null;
	isDay: boolean;
	hour: number;
	updatedAt: number;
}

export interface GitHubPulseEvent {
	id: string;
	type: string;
	repo: string;
	createdAt: number;
	message: string;
}

export interface CvePulseItem {
	id: string;
	cve: string;
	description: string;
}

export interface CyberPulseSnapshot {
	github: GitHubPulseEvent[];
	cves: CvePulseItem[];
	source: 'live' | 'fallback';
	updatedAt: number;
}

export interface StorageLike {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
	removeItem(key: string): void;
}

export interface LiveFeedDeps {
	/** Fungsi fetch boleh-suntik (guna globalThis.fetch secara lalai). */
	fetchFn?: typeof fetch;
	AbortControllerCtor?: typeof AbortController;
	now?: () => number;
	storage?: StorageLike | null;
}

export const PUCHONG_LAT = 3.0327;
export const PUCHONG_LON = 101.6188;
export const FEED_TIMEOUT_MS = 2500;
export const WEATHER_CACHE_MS = 15 * 60 * 1000;
const PULSE_CACHE_MS = 15 * 60 * 1000;
const GITHUB_EVENTS_LIMIT = 6;
const MAX_TEXT_LENGTH = 220;
const MAX_CVE_COUNT = 8;

const WEATHER_CACHE_KEY = 'spine-weather-puchong';
const GITHUB_CACHE_KEY = 'spine-github-pulse';
const CVE_CACHE_KEY = 'spine-cve-pulse';

// Cache cuaca kekal dalam memori supaya selamat untuk SSR (tiada `localStorage` dalam Node).
const weatherMemoryCache: Map<string, { ts: number; value: LiveWeatherSnapshot }> = new Map();

const SUNRISE_HOUR = 6.5;
const SUNSET_HOUR = 19.5;

/**
 * Jam `Asia/Kuala_Lumpur` (UTC+8, tiada DST). Malaysia tidak pernah
 * mengamalkan waktu jimat siang, jadi offset +8 adalah malar yang stabil.
 */
export function kualaLumpurClock(date: Date = new Date()): KualaLumpurClock {
	const ms = date.getTime() + 8 * 60 * 60 * 1000;
	const shifted = new Date(ms);
	const hour = shifted.getUTCHours();
	const minute = shifted.getUTCMinutes();
	const dayMinute = hour * 60 + minute;
	return {
		hour,
		minute,
		isDay: dayMinute >= SUNRISE_HOUR * 60 && dayMinute < SUNSET_HOUR * 60
	};
}

/** Padam aksara kawalan dan potong panjang; teks hasil selamat untuk interpolasi Svelte. */
export function sanitizeText(raw: unknown, maxLength = MAX_TEXT_LENGTH): string {
	if (typeof raw !== 'string') return '';
	// Buang aksara kawalan C0/C1 (kecuali ruang biasa) yang boleh menyembunyikan
	// kandungan berbahaya atau merosakkan susun atur teks.
	const cleaned = raw.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/g, '');
	return cleaned.slice(0, maxLength);
}

/** Petakan kod cuaca WMO Open-Meteo + jam tempatan ke preset lautan GLSL. */
export function weatherCodeToPreset(wmoCode: number, hour: number): WeatherPresetId {
	if (hour >= SUNSET_HOUR || hour < SUNRISE_HOUR) return 'biolum_night';
	// Ribut petir (95+) dan hujan ringan–lebat (51–67, 80–90) → monsun.
	if (wmoCode >= 95 || (wmoCode >= 80 && wmoCode <= 90) || (wmoCode >= 51 && wmoCode <= 67)) {
		return 'monsoon_swell';
	}
	// Fajar keemasan pagi sebelum tengah hari.
	if (hour >= SUNRISE_HOUR && hour < 10) return 'golden_horizon';
	// Siang cerah → lagun zamrud; selebihnya → ufuk keemasan awan.
	if (wmoCode === 0 || wmoCode === 1) return 'emerald_day';
	return 'golden_horizon';
}

function toFiniteNumber(value: unknown): number | null {
	const num = typeof value === 'number' ? value : Number(value);
	return Number.isFinite(num) ? num : null;
}

/** Sahkan & parse respons Open-Meteo kepada snapshot cuaca yang selamat. */
export function parseOpenMeteoResponse(
	json: unknown,
	now = Date.now()
): LiveWeatherSnapshot | null {
	if (typeof json !== 'object' || json === null) return null;
	const data = json as Record<string, unknown>;
	const current = data.current;
	if (typeof current !== 'object' || current === null) return null;
	const cur = current as Record<string, unknown>;

	const wmo = toFiniteNumber(cur.weather_code);
	const temperature = toFiniteNumber(cur.temperature_2m);
	const windRaw = toFiniteNumber(cur.wind_speed_10m);
	const clock = kualaLumpurClock(new Date(now));

	// Fallback aman jika medan cuaca tiada: guna jam tempatan sahaja.
	const presetId =
		wmo === null ? weatherCodeToPreset(3, clock.hour) : weatherCodeToPreset(wmo, clock.hour);

	return {
		presetId,
		source: 'live',
		condition: describeWmoCode(wmo),
		temperatureC: temperature,
		windSpeedKmh: windRaw,
		isDay: clock.isDay,
		hour: clock.hour,
		updatedAt: now
	};
}

function describeWmoCode(wmo: number | null): string {
	if (wmo === null) return 'tidak diketahui';
	if (wmo === 0) return 'cerah';
	if (wmo === 1) return 'cerah kebanyakannya';
	if (wmo === 2) return 'awan separa';
	if (wmo === 3) return 'mendung';
	if (wmo >= 45 && wmo <= 48) return 'kabus';
	if (wmo >= 51 && wmo <= 57) return 'hujan renyai';
	if (wmo >= 61 && wmo <= 67) return 'hujan';
	if (wmo >= 71 && wmo <= 77) return 'salji';
	if (wmo >= 80 && wmo <= 82) return 'pancuran hujan';
	if (wmo >= 85 && wmo <= 86) return 'pancuran salji';
	if (wmo >= 95) return 'ribut petir';
	return 'perubahan cuaca';
}

/** Snapshot fallback tempatan — sentiasa siang cerah Puchong (bukan cuaca rekaan). */
export function buildWeatherFallback(now = Date.now()): LiveWeatherSnapshot {
	const clock = kualaLumpurClock(new Date(now));
	return {
		presetId: weatherCodeToPreset(3, clock.hour),
		source: 'fallback',
		condition: 'pratetap luar talian',
		temperatureC: null,
		windSpeedKmh: null,
		isDay: clock.isDay,
		hour: clock.hour,
		updatedAt: now
	};
}

/**
 * Ambil cuaca langsung Puchong daripada Open-Meteo dengan timeout tegas dan
 * fallback senyap. Kembali `null` hanya jika selepas fallback pun tiada hasil
 * (mustahil secara praktikal), jadi pemanggil sentiasa mendapat satu preset.
 */
export async function fetchLiveWeather(deps: LiveFeedDeps = {}): Promise<LiveWeatherSnapshot> {
	const fetchFn = deps.fetchFn ?? globalThis.fetch;
	const AbortCtor = deps.AbortControllerCtor ?? globalThis.AbortController;
	const now = deps.now ?? Date.now;

	const cached = weatherMemoryCache.get(WEATHER_CACHE_KEY);
	if (cached && now() - cached.ts < WEATHER_CACHE_MS) return cached.value;

	try {
		if (typeof fetchFn !== 'function' || typeof AbortCtor !== 'function') {
			return buildWeatherFallback(now());
		}
		const controller = new AbortCtor();
		const timer = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);
		try {
			const url =
				`https://api.open-meteo.com/v1/forecast?latitude=${PUCHONG_LAT}&longitude=${PUCHONG_LON}` +
				'&current=temperature_2m,weather_code,wind_speed_10m&timezone=Asia%2FKuala_Lumpur';
			const res = await fetchFn(url, { signal: controller.signal });
			if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
			const json = (await res.json()) as unknown;
			const parsed = parseOpenMeteoResponse(json, now());
			if (!parsed) throw new Error('Skema Open-Meteo tidak sah');
			weatherMemoryCache.set(WEATHER_CACHE_KEY, { ts: now(), value: parsed });
			return parsed;
		} finally {
			clearTimeout(timer);
		}
	} catch {
		// Fallback senyap: jangan sekali-kali melempar ke atas UI.
		const fallback = buildWeatherFallback(now());
		return fallback;
	}
}

/** Sahkan & parse senarai peristiwa awam GitHub kepada denyutan selamat. */
export function parseGitHubEvents(json: unknown, now = Date.now()): GitHubPulseEvent[] {
	if (!Array.isArray(json)) return [];
	const events: GitHubPulseEvent[] = [];
	for (const item of json) {
		if (typeof item !== 'object' || item === null) continue;
		const evt = item as Record<string, unknown>;
		const id = sanitizeText(evt.id, 80);
		const type = sanitizeText(evt.type, 40);
		const createdAtRaw = toFiniteNumber(evt.created_at ?? evt.__parsed_created_at);
		const createdAt = createdAtRaw === null ? now : createdAtRaw;
		let repo = '';
		let message = '';
		const repoObj = evt.repo;
		if (typeof repoObj === 'object' && repoObj !== null) {
			repo = sanitizeText((repoObj as Record<string, unknown>).name, 80);
		}
		const payload = evt.payload;
		if (typeof payload === 'object' && payload !== null) {
			const commits = (payload as Record<string, unknown>).commits;
			if (Array.isArray(commits) && commits.length > 0) {
				const first = commits[0];
				if (typeof first === 'object' && first !== null) {
					message = sanitizeText((first as Record<string, unknown>).message, 140);
				}
			}
		}
		if (!id || !type) continue;
		events.push({ id, type, repo, createdAt, message });
		if (events.length >= GITHUB_EVENTS_LIMIT) break;
	}
	return events;
}

/**
 * Sahkan & parse suapan CISA KEV (Known Exploited Vulnerabilities) yang
 * dijangka `{ vulnerabilities: [{ cveID, shortDescription }] }`.
 */
export function parseCisaKev(json: unknown): CvePulseItem[] {
	if (typeof json !== 'object' || json === null) return [];
	const data = json as Record<string, unknown>;
	const list = data.vulnerabilities;
	if (!Array.isArray(list)) return [];
	const items: CvePulseItem[] = [];
	for (const item of list) {
		if (typeof item !== 'object' || item === null) continue;
		const rec = item as Record<string, unknown>;
		const cve = sanitizeText(rec.cveID, 40);
		if (!/^CVE-\d{4}-\d{4,}$/.test(cve)) continue;
		items.push({
			id: cve,
			cve,
			description: sanitizeText(rec.shortDescription, 180)
		});
		if (items.length >= MAX_CVE_COUNT) break;
	}
	return items;
}

/**
 * Snapshot fallback tempatan CVE awam yang terkenal dan disahkan umum.
 * Bukan data rekaan: senarai ini ialah kerentanan awam sebenar yang disenaraikan
 * secara meluas; ia membolehkan denyutan Radar kekal hidup tanpa rangkaian.
 */
const CVE_FALLBACK: CvePulseItem[] = [
	{ id: 'CVE-2021-44228', cve: 'CVE-2021-44228', description: 'Apache Log4j2 RCE (Log4Shell).' },
	{ id: 'CVE-2021-26855', cve: 'CVE-2021-26855', description: 'Microsoft Exchange Server SSRF.' },
	{ id: 'CVE-2023-4863', cve: 'CVE-2023-4863', description: 'Libwebp heap buffer overflow.' },
	{
		id: 'CVE-2024-3094',
		cve: 'CVE-2024-3094',
		description: 'Malicious backdoor in xz-utils (liblzma).'
	},
	{ id: 'CVE-2023-34362', cve: 'CVE-2023-34362', description: 'Progress MOVEit Transfer SQLi.' }
];

function buildPulseFallback(now = Date.now()): CyberPulseSnapshot {
	return {
		github: [],
		cves: CVE_FALLBACK,
		source: 'fallback',
		updatedAt: now
	};
}

function readPulseCache(storage: StorageLike | null, key: string): CyberPulseSnapshot | null {
	if (!storage) return null;
	try {
		const raw = storage.getItem(key);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as { ts?: number; value?: CyberPulseSnapshot };
		if (!parsed || typeof parsed.ts !== 'number' || !parsed.value) return null;
		if (Date.now() - parsed.ts > PULSE_CACHE_MS) {
			storage.removeItem(key);
			return null;
		}
		return parsed.value;
	} catch {
		return null;
	}
}

function writePulseCache(
	storage: StorageLike | null,
	key: string,
	value: CyberPulseSnapshot
): void {
	if (!storage) return;
	try {
		storage.setItem(key, JSON.stringify({ ts: Date.now(), value }));
	} catch {
		// Storan peribadi mungkin disekat; abaikan seperti cache lain.
	}
}

/**
 * Ambil nadi siber awam (GitHub Events + CISA KEV) dengan timeout, cache
 * `sessionStorage` 15 minit, dan fallback senyap kepada snapshot tempatan.
 */
export async function fetchCyberPulse(deps: LiveFeedDeps = {}): Promise<CyberPulseSnapshot> {
	const fetchFn = deps.fetchFn ?? globalThis.fetch;
	const AbortCtor = deps.AbortControllerCtor ?? globalThis.AbortController;
	const storage = deps.storage ?? null;
	const now = deps.now ?? Date.now;

	const cached =
		readPulseCache(storage, GITHUB_CACHE_KEY) ?? readPulseCache(storage, CVE_CACHE_KEY);
	if (cached) return cached;

	const github = await safeFetchJson(fetchFn, AbortCtor, GITHUB_EVENTS_URL, parseGitHubEvents, now);
	const cves = await safeFetchJson(fetchFn, AbortCtor, CISA_KEV_URL, parseCisaKev, now);

	const snapshot: CyberPulseSnapshot = {
		github: github.length > 0 ? github : [],
		cves: cves.length > 0 ? cves : CVE_FALLBACK,
		source: github.length > 0 || cves.length > 0 ? 'live' : 'fallback',
		updatedAt: now()
	};
	if (snapshot.source === 'live') {
		writePulseCache(storage, GITHUB_CACHE_KEY, snapshot);
		writePulseCache(storage, CVE_CACHE_KEY, snapshot);
	}
	return snapshot;
}

const GITHUB_EVENTS_URL = 'https://api.github.com/users/muhammedmunir/events/public';
const CISA_KEV_URL =
	'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';

type Parser<T> = (json: unknown, now: number) => T;

async function safeFetchJson<T>(
	fetchFn: typeof fetch | undefined,
	AbortCtor: typeof AbortController | undefined,
	url: string,
	parser: Parser<T>,
	now: () => number
): Promise<T> {
	if (typeof fetchFn !== 'function' || typeof AbortCtor !== 'function') {
		return parser(null, now());
	}
	const controller = new AbortCtor();
	const timer = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);
	try {
		const res = await fetchFn(url, {
			signal: controller.signal,
			headers: url.includes('github') ? { Accept: 'application/vnd.github+json' } : undefined
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const json = (await res.json()) as unknown;
		const parsed = parser(json, now());
		return parsed;
	} catch {
		return parser(null, now());
	} finally {
		clearTimeout(timer);
	}
}
