import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';

// Sesi 4 — `cyber-bench.ts`: ujian unit bagi tiga alat Tactile Cyber-Bench
// (TINDAK parser, Fiber Attenuation, Supabase RLS gate) termasuk input XSS dan
// kegagalan nilai bukan-nombor. Semua fungsi tulen, diuji kepala tanpa GPU.
const vite = await createServer({
	configFile: false,
	server: { middlewareMode: true, hmr: false, ws: false, watch: null },
	optimizeDeps: { noDiscovery: true },
	appType: 'custom'
});
after(() => vite.close());

const { parseIntentText, fiberAttenuation, evaluateRlsGate } = await vite.ssrLoadModule(
	'/src/lib/spine/cyber-bench.ts'
);

test('parseIntentText mengekstrak URL, telefon dan RM daripada teks bercampur', () => {
	const result = parseIntentText(
		'Bayar RM 1,250.50 ke https://shop.example.my/item dan hubungi 013-563 6124'
	);
	const channels = result.extractions.map((e) => e.channel);
	assert.deepEqual(channels, ['url', 'phone', 'payment']);

	const url = result.extractions.find((e) => e.channel === 'url');
	assert.equal(url.normalized, 'https://shop.example.my/item');

	const phone = result.extractions.find((e) => e.channel === 'phone');
	assert.equal(phone.normalized, '+60135636124');

	const payment = result.extractions.find((e) => e.channel === 'payment');
	assert.equal(payment.normalized, 'RM 1,250.50');
});

test('parseIntentText menapis input XSS dan aksara kawalan', () => {
	const evil = '<script>alert("xss")</script>\u0000javascript:alert(1) RM 99';
	const result = parseIntentText(evil);
	// Tiada padanan URL kerana `javascript:` bukan http/https/www.
	assert.equal(
		result.extractions.some((e) => e.channel === 'url'),
		false
	);
	assert.ok(!result.text.includes('\u0000'), 'aksara kawalan dibuang');
	// `sanitize{...}` tidak membuang `<` kerana paparan guna interpolasi Svelte,
	// bukan `{@html}`. Simbol kekal sebagai teks literal yang selamat.
	assert.ok(result.text.includes('<script>'), 'teks literal kekal untuk paparan selamat');
});

test('parseIntentText mengendalikan teks kosong dengan selamat', () => {
	const result = parseIntentText('');
	assert.equal(result.extractions.length, 0);
	assert.equal(result.text, '');
});

test('fiberAttenuation mengira kehilangan dB mengikut panjang gelombang', () => {
	// 10 km pada 1310 nm: 10 * 0.35 = 3.5 dB gentian; 0 sambungan.
	const a1310 = fiberAttenuation({ distanceKm: 10, wavelengthNm: 1310, splices: 0 });
	assert.equal(a1310.fiberLossDb, 3.5);
	assert.equal(a1310.spliceLossDb, 0);
	assert.equal(a1310.totalLossDb, 3.5);

	// 10 km pada 1550 nm: 10 * 0.2 = 2.0 dB.
	const a1550 = fiberAttenuation({ distanceKm: 10, wavelengthNm: 1550, splices: 0 });
	assert.equal(a1550.fiberLossDb, 2);
	assert.equal(a1550.totalLossDb, 2);
});

test('fiberAttenuation menjumlah sambungan dan mengapit kecerahan 0–1', () => {
	const result = fiberAttenuation({ distanceKm: 100, wavelengthNm: 1550, splices: 4 });
	// gentian: 100 * 0.2 = 20 dB; sambungan: 4 * 0.08 = 0.32; jumlah 20.32
	assert.equal(result.fiberLossDb, 20);
	assert.equal(result.spliceLossDb, 0.32);
	assert.equal(result.totalLossDb, 20.32);
	assert.ok(result.brightness >= 0 && result.brightness <= 1);
	assert.equal(result.brightness, 0.1872);
});

test('fiberAttenuation mengapit parameter di luar julat', () => {
	const result = fiberAttenuation({ distanceKm: Number.NaN, wavelengthNm: 1310, splices: -5 });
	// NaN jarak jatuh ke minimum 1 km; splice negatif jatuh ke 0.
	assert.equal(result.fiberLossDb, 0.35);
	assert.equal(result.spliceLossDb, 0);
	assert.equal(result.totalLossDb, 0.35);
});

test('evaluateRlsGate meluluskan auditor hanya untuk baca', () => {
	const read = evaluateRlsGate({
		table: 'loan_applications',
		operation: 'select',
		role: 'admin_auditor',
		rowOwnerId: 'user-1',
		jwtSub: 'auditor-9'
	});
	assert.equal(read.allowed, true);
	assert.equal(read.verdictLabel, 'lulus');

	const write = evaluateRlsGate({
		table: 'loan_applications',
		operation: 'update',
		role: 'admin_auditor',
		rowOwnerId: 'user-1',
		jwtSub: 'auditor-9'
	});
	assert.equal(write.allowed, false);
	assert.equal(write.verdictLabel, 'tangkis');
});

test('evaluateRlsGate menangkis pemilik pada baris orang lain', () => {
	const result = evaluateRlsGate({
		table: 'repayments',
		operation: 'update',
		role: 'borrower_owner',
		rowOwnerId: 'user-2',
		jwtSub: 'user-1'
	});
	assert.equal(result.allowed, false);
	assert.equal(result.verdictLabel, 'tangkis');
});

test('evaluateRlsGate menolak anon tanpa JWT dan jadual tidak dikenali', () => {
	const anon = evaluateRlsGate({
		table: 'loan_applications',
		operation: 'insert',
		role: 'anon',
		rowOwnerId: null,
		jwtSub: null
	});
	assert.equal(anon.allowed, false);

	const unknown = evaluateRlsGate({
		table: 'secret_table',
		operation: 'select',
		role: 'admin_auditor',
		rowOwnerId: null,
		jwtSub: null
	});
	assert.equal(unknown.allowed, false);
	assert.equal(unknown.verdictLabel, 'tangkis');
});
