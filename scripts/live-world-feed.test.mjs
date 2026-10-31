import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';

// Sesi 4 — `live-world-feed.ts`: ujian unit bagi Chrono-Weather Malaysia dan
// suapan GitHub/CVE, termasuk kegagalan rangkaian (fetch melempar) dan input
// berniat jahat (XSS) disucikan. Semua fungsi tulen diuji kepala tanpa rangkaian.
const vite = await createServer({
	configFile: false,
	server: { middlewareMode: true, hmr: false, ws: false, watch: null },
	optimizeDeps: { noDiscovery: true },
	appType: 'custom'
});
after(() => vite.close());

const {
	kualaLumpurClock,
	weatherCodeToPreset,
	parseOpenMeteoResponse,
	buildWeatherFallback,
	fetchLiveWeather,
	parseGitHubEvents,
	parseCisaKev,
	fetchCyberPulse,
	sanitizeText,
	PUCHONG_LAT,
	PUCHONG_LON
} = await vite.ssrLoadModule('/src/lib/spine/live-world-feed.ts');

test('kualaLumpurClock mengira waktu UTC+8 tanpa DST', () => {
	// 2026-10-31T04:00:00Z → 12:00 tengah hari di Malaysia.
	const noonUtc = new Date('2026-10-31T04:00:00Z');
	const noon = kualaLumpurClock(noonUtc);
	assert.equal(noon.hour, 12);
	assert.equal(noon.minute, 0);
	assert.equal(noon.isDay, true);

	// 2026-10-31T16:00:00Z → 00:00 tengah malam di Malaysia (malam).
	const midnightUtc = new Date('2026-10-31T16:00:00Z');
	const midnight = kualaLumpurClock(midnightUtc);
	assert.equal(midnight.hour, 0);
	assert.equal(midnight.isDay, false);
});

test('weatherCodeToPreset memetakan malam, ribut dan siang cerah', () => {
	assert.equal(weatherCodeToPreset(0, 14), 'emerald_day');
	assert.equal(weatherCodeToPreset(0, 7), 'golden_horizon');
	assert.equal(weatherCodeToPreset(0, 21), 'biolum_night');
	assert.equal(weatherCodeToPreset(95, 15), 'monsoon_swell');
	assert.equal(weatherCodeToPreset(61, 15), 'monsoon_swell');
});

test('parseOpenMeteoResponse mengesahkan skema dan menolak input rosak', () => {
	const ok = parseOpenMeteoResponse(
		{ current: { weather_code: 0, temperature_2m: 31.5, wind_speed_10m: 7.2 } },
		Date.parse('2026-10-31T04:00:00Z')
	);
	assert.equal(ok.source, 'live');
	assert.equal(ok.temperatureC, 31.5);
	assert.equal(ok.windSpeedKmh, 7.2);
	assert.equal(ok.presetId, 'emerald_day');

	assert.equal(parseOpenMeteoResponse(null), null);
	assert.equal(parseOpenMeteoResponse({ current: null }), null);
	assert.equal(parseOpenMeteoResponse({}), null);
});

test('fetchLiveWeather jatuh senyap ke preset tempatan apabila fetch melempar', async () => {
	const result = await fetchLiveWeather({
		fetchFn: async () => {
			throw new Error('offline');
		},
		AbortControllerCtor: AbortController,
		now: () => Date.parse('2026-10-31T04:00:00Z')
	});
	assert.equal(result.source, 'fallback');
	assert.ok(
		['golden_horizon', 'emerald_day', 'biolum_night', 'monsoon_swell'].includes(result.presetId)
	);
});

test('fetchLiveWeather memulangkan data sah daripada Open-Meteo', async () => {
	let capturedUrl = '';
	const result = await fetchLiveWeather({
		fetchFn: async (url) => {
			capturedUrl = String(url);
			return {
				ok: true,
				json: async () => ({
					current: { weather_code: 95, temperature_2m: 28, wind_speed_10m: 20 }
				})
			};
		},
		AbortControllerCtor: AbortController,
		now: () => Date.parse('2026-10-31T05:00:00Z')
	});
	assert.equal(result.source, 'live');
	assert.equal(result.presetId, 'monsoon_swell');
	assert.ok(capturedUrl.includes(String(PUCHONG_LAT)));
	assert.ok(capturedUrl.includes(String(PUCHONG_LON)));
});

test('parseGitHubEvents memotong mesej dan membuang aksara kawalan', () => {
	const events = parseGitHubEvents([
		{
			id: '1',
			type: 'PushEvent',
			repo: { name: 'muhammedmunir/portfolio' },
			created_at: 1700000000,
			payload: {
				commits: [{ message: '<script>alert(1)</script> update ' + 'x'.repeat(300) }]
			}
		},
		{ id: '2', type: '', repo: { name: 'x' }, created_at: 1700000001, payload: {} }
	]);
	assert.equal(events.length, 1);
	assert.equal(events[0].message.length, 140, 'mesej dipotong kepada 140 aksara');
	assert.equal(events[0].repo, 'muhammedmunir/portfolio');
	// `<script>` kekal sebagai teks literal; ia lengai kerana paparan menggunakan
	// interpolasi teks Svelte (bukan `{@html}`), yang melarikan `<>`.
	assert.equal(events[0].message.slice(0, 8), '<script>');
});

test('parseCisaKev hanya menerima ID CVE yang sah dan memotong deskripsi', () => {
	const raw = {
		vulnerabilities: [
			{ cveID: 'CVE-2021-44228', shortDescription: 'Log4Shell RCE' },
			{ cveID: 'javascript:alert(1)', shortDescription: 'buruk' },
			{ cveID: 'CVE-2023-4863', shortDescription: 'Libwebp overflow' }
		]
	};
	const items = parseCisaKev(raw);
	assert.deepEqual(
		items.map((i) => i.cve),
		['CVE-2021-44228', 'CVE-2023-4863']
	);
	assert.equal(parseCisaKev(null).length, 0);
});

test('fetchCyberPulse jatuh senyap ke snapshot CVE tempatan apabila offline', async () => {
	const result = await fetchCyberPulse({
		fetchFn: async () => {
			throw new Error('offline');
		},
		AbortControllerCtor: AbortController,
		storage: null,
		now: () => Date.now()
	});
	assert.equal(result.source, 'fallback');
	assert.ok(result.cves.length > 0);
	assert.ok(result.cves.every((c) => /^CVE-\d{4}-\d{4,}$/.test(c.cve)));
});

test('fetchCyberPulse menandakan live apabila sekurang-kurangnya satu suapan berjaya', async () => {
	const result = await fetchCyberPulse({
		fetchFn: async (url) => {
			if (String(url).includes('github')) {
				return {
					ok: true,
					json: async () => [
						{
							id: '1',
							type: 'PushEvent',
							repo: { name: 'r' },
							created_at: 1,
							payload: { commits: [] }
						}
					]
				};
			}
			throw new Error('cve offline');
		},
		AbortControllerCtor: AbortController,
		storage: null,
		now: () => Date.now()
	});
	assert.equal(result.source, 'live');
	assert.equal(result.github.length, 1);
});

test('sanitizeText membuang aksara kawalan dan memotong panjang', () => {
	assert.equal(sanitizeText('halo\u0007dunia', 20), 'halodunia');
	assert.equal(sanitizeText('x'.repeat(500), 100).length, 100);
	assert.equal(sanitizeText(null), '');
});
