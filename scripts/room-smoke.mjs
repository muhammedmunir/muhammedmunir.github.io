import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Ujian asap bilik kerja 3D (halaman utama). Jalankan terhadap `npm run dev` sahaja: kait `window.__room` wujud dalam mod dev.
const url = process.env.ROOM_URL || 'http://localhost:5173/';
// WebGL perisian (swiftshader) hanya untuk pelayan dev tempatan; tolak URL lain sebelum pelayar dilancarkan.
if (!['localhost', '127.0.0.1'].includes(new URL(url).hostname)) {
	console.error(`ROOM FAIL: hanya localhost dibenarkan, diterima ${url}`);
	process.exit(1);
}
const VIEWS = { computer: 'Projek', profile: 'Tentang saya', server: 'Kemahiran', work: 'Perjalanan kerja', learning: 'Pembelajaran & sijil', phone: 'Hubungi saya' };
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
	// Pemanasan: muatan pertama pelayan dev boleh mencetuskan pengoptimuman semula modul Vite (504 Outdated Optimize Dep).
	const warm = await browser.newPage();
	await warm.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
	await warm.waitForTimeout(8000);
	await warm.close();
	for (const [width, height] of [[1920, 945], [390, 844]]) {
		const phone = width < 800;
		const page = await browser.newPage({ viewport: { width, height }, isMobile: phone, hasTouch: phone, reducedMotion: 'reduce' });
		const errors = [];
		page.on('pageerror', (error) => errors.push(error.message));
		page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
		await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
		await page.waitForFunction(() => !document.querySelector('.loading') && '__room' in window, null, { timeout: 300000 });
		const tag = `${width}px`;
		assert.equal(await page.title(), 'Muhammed Munir | Full-Stack Developer', `${tag}: tajuk`);
		assert.equal((await page.textContent('h1'))?.trim(), 'Muhammed Munir', `${tag}: h1`);
		assert.match((await page.getAttribute('.keys a', 'href')) ?? '', /\/cv$/, `${tag}: pautan versi teks`);
		for (const [view, title] of Object.entries(VIEWS)) {
			await page.evaluate((v) => window.__room.setView(v), view);
			await page.waitForTimeout(800);
			assert.equal((await page.textContent('.focus-bar strong'))?.trim(), title, `${tag}: tajuk paparan ${view}`);
			const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
			assert.ok(scrollW <= width, `${tag}: skrol mendatar dalam ${view} (${scrollW})`);
		}
		// Tayangan: butang › menukar slaid butiran projek.
		await page.evaluate(() => window.__room.setView('screen'));
		await page.waitForTimeout(800);
		assert.equal((await page.textContent('.focus-bar .count'))?.trim(), '1 / 5', `${tag}: slaid pertama`);
		await page.click('.focus-bar button[aria-label="Slaid seterusnya"]');
		await page.waitForTimeout(500);
		assert.equal((await page.textContent('.focus-bar .count'))?.trim(), '2 / 5', `${tag}: slaid seterusnya`);
		await page.click('.focus-bar .back');
		await page.waitForTimeout(800);
		assert.equal(await page.locator('.focus-bar').count(), 0, `${tag}: Kembali tidak pulang ke paparan keseluruhan`);
		// Siang / malam: butang header menukar keadaan bilik.
		const before = await page.evaluate(() => window.__room.isDay);
		await page.click('header .pill >> nth=0');
		await page.waitForTimeout(500);
		assert.equal(await page.evaluate(() => window.__room.isDay), !before, `${tag}: tukar siang/malam`);
		// Hubungi: telefon diangkat (butang pada skrinnya); pautan yang sama wujud untuk papan kekunci dan muncul bila difokus.
		await page.click('header >> text=Hubungi');
		await page.waitForTimeout(800);
		assert.equal((await page.textContent('.focus-bar strong'))?.trim(), 'Hubungi saya', `${tag}: paparan telefon`);
		assert.equal(await page.locator('.dial a[href^="https://wa.me/"]').count(), 1, `${tag}: pautan WhatsApp`);
		await page.focus('.dial .more');
		await page.keyboard.press('Enter');
		await page.waitForSelector('dialog[open]', { timeout: 10000 });
		assert.equal(errors.length, 0, `${tag}: ralat ${errors.join(' | ')}`);
		console.log(`ROOM ${tag} OK`);
		await page.close();
	}
	console.log('ROOM OK');
} finally {
	await browser.close();
}
