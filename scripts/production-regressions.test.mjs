import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

// Sesi 5 — penjaga regresi untuk dua kecacatan sebenar yang ditemui semasa
// audit produksi 3-viewport:
//  1. `uAmount` X-Ray menyimpang melebihi 1.0 disebabkan keutamaan operator
//     `a + b - c` berbanding `a + (b - c)`, menayangkan kanta putih terbakar.
//  2. Fasa denyut gentian menjadi negatif (`%` JS mengekalkan tanda), lalu
//     `CatmullRomCurve3.getPointAt()` melempar
//     "Cannot read properties of undefined (reading 'x')" setiap bingkai.
const rootDir = process.cwd();
const worldSource = fs.readFileSync(path.join(rootDir, 'src/lib/spine/FiberSpineWorld.ts'), 'utf8');

test('uAmount X-Ray diinterpolasi dengan kurungan eksplisit (kekal 0..1)', () => {
	const match = worldSource.match(/u\.uAmount\.value \+=([\s\S]{0,160}?)Math\.min\(1, dt \* 8\);/);
	assert.ok(match, 'baris interpolasi uAmount wajib wujud');
	const expression = match[1].replace(/\s+/g, ' ');
	assert.match(
		expression,
		/\(\s*this\.xrayActive \? 1 : 0\s*\)\s*-\s*u\.uAmount\.value/,
		'sasaran mesti dikurangkan: `(aktif ? 1 : 0) - uAmount`, bukan `0 - uAmount`'
	);
	assert.doesNotMatch(
		expression,
		/this\.xrayActive \? 1 : - ?u\.uAmount\.value/,
		'keutamaan operator tersalah: ternary menelan penolakan'
	);
});

test('fasa denyut gentian dinormalkan kepada julat positif sebelum getPointAt', () => {
	const line = worldSource.match(/this\.xrayPulsePhases\.push\((.*?)\);/);
	assert.ok(line, 'penolakan fasa denyut wajib wujud');
	assert.ok(
		/% 1\)?\s*\+\s*1\s*\)?\s*%\s*1/.test(line[1].replace(/\s+/g, ' ')),
		'fasa mesti diubah ke modulo berganda; anchor.x negatif menghasilkan fasa negatif'
	);
});

test('adegan gentian terasing mempunyai pencahayaan sendiri', () => {
	// MeshStandardMaterial tanpa lampu dirender hitam walaupun emissive ditetapkan.
	assert.match(
		worldSource,
		/const fiberAmbient = new THREE\.AmbientLight/,
		'adegan gentian wajib menyediakan AmbientLight'
	);
	assert.match(
		worldSource,
		/scene\.add\(fiberAmbient\)/,
		'ambient mesti ditambah ke adegan gentian'
	);
});

test('suapan CVE tidak membuat fetch rentas origin yang gagal CORS', () => {
	// CISA KEV tidak menghantar Access-Control-Allow-Origin; fetch klien selalu
	// mencetak ralat konsol yang tidak boleh ditangkap try/catch.
	const liveFeedSource = fs.readFileSync(
		path.join(rootDir, 'src/lib/spine/live-world-feed.ts'),
		'utf8'
	);
	const fetchCyberPulse = liveFeedSource.slice(
		liveFeedSource.indexOf('export async function fetchCyberPulse')
	);
	assert.ok(fetchCyberPulse.length > 0, 'fetchCyberPulse wajib wujud');
	assert.doesNotMatch(
		fetchCyberPulse.slice(0, fetchCyberPulse.indexOf('\n}')),
		/safeFetchJson\([^)]*CISA_KEV_URL/,
		'fetchCyberPulse tidak boleh memanggil CISA_KEV_URL dari pelayar'
	);
	assert.match(
		fetchCyberPulse.slice(0, fetchCyberPulse.indexOf('\n}')),
		/const cves = CVE_FALLBACK/,
		'CVE mesti datang dari snapshot fallback sehingga proksi pelayan wujud'
	);
});

test('scheduleGlbSwap menyingkirkan simpang isSilhouettePart daripada kumpulan lapisan sebelum menambah GLB', () => {
	const dioramaSource = fs.readFileSync(
		path.join(rootDir, 'src/lib/spine/diorama-props.ts'),
		'utf8'
	);
	assert.match(
		dioramaSource,
		/isSilhouettePart\s*=\s*true/,
		'diorama-props.ts wajib menandakan anak diorama-silhouette dengan isSilhouettePart'
	);
	assert.match(
		worldSource,
		/child\.userData\.isSilhouettePart/,
		'scheduleGlbSwap wajib menapis keluar isSilhouettePart daripada kumpulan lapisan'
	);
});
