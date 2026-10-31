import assert from 'node:assert/strict';
import { preview } from 'vite';
import { chromium } from 'playwright';

const server = await preview({ preview: { port: 0, host: '127.0.0.1' }, logLevel: 'error' });
const url = server.resolvedUrls.local[0];

const browser = await chromium.launch({
	headless: true,
	args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11']
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.locator('.webgl-stage canvas').waitFor({ timeout: 30000 });
await page
	.locator('.spine-loading-curtain')
	.waitFor({ state: 'detached', timeout: 25000 })
	.catch(() => {});
await page.waitForTimeout(1000);

// Buka kalout diegetik (dive).
await page.evaluate(() => document.querySelectorAll('.prop-dock-btn')[0]?.click());
await page.waitForTimeout(1000);

const sRGBtoLin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const relLuma = ([r, g, b]) =>
	0.2126 * sRGBtoLin(r / 255) + 0.7152 * sRGBtoLin(g / 255) + 0.0722 * sRGBtoLin(b / 255);
const contrastRatio = (l1, l2) => {
	const a = Math.max(l1, l2);
	const b = Math.min(l1, l2);
	return (a + 0.05) / (b + 0.05);
};

const readPixel = async (selector, offsetX = 0, offsetY = 0) => {
	const rect = await page.locator(selector).boundingBox();
	if (!rect) return null;
	const cx = Math.floor(rect.x + rect.width / 2 + offsetX);
	const cy = Math.floor(rect.y + rect.height / 2 + offsetY);
	const shot = await page.screenshot({ clip: { x: cx, y: cy, width: 1, height: 1 } });
	// Ambil saluran warna melalui decode canvas dalam evaluate.
	return page.evaluate(async (base64) => {
		const img = new Image();
		img.src = `data:image/png;base64,${base64}`;
		await img.decode();
		const cv = document.createElement('canvas');
		cv.width = 1;
		cv.height = 1;
		const ctx = cv.getContext('2d');
		ctx.drawImage(img, 0, 0);
		const d = ctx.getImageData(0, 0, 1, 1).data;
		return [d[0], d[1], d[2]];
	}, shot.toString('base64'));
};

const results = {};

for (const theme of ['dark', 'light']) {
	if (theme === 'light') {
		await page.evaluate(() => {
			document.documentElement.setAttribute('data-theme', 'light');
			window.__SPINE_WORLD__?.setTheme('light');
		});
		await page.waitForTimeout(800);
	}
	// Sampel latar kalout berhampiran bucu kanan-atas (kawasan kosong pada kedua tema).
	const caloutBg = await readPixel('.diegetic-calout', -18, -120);
	const caloutTitle = await page.evaluate(() => {
		const el = document.querySelector('#leader-callout-title');
		const cs = getComputedStyle(el);
		return cs.color; // rgb(...)
	});
	const rgbMatch = caloutTitle.match(/\d+/g)?.map(Number) ?? [255, 255, 255];
	const lumaBg = relLuma(caloutBg);
	const lumaText = relLuma(rgbMatch);
	const ratio = contrastRatio(lumaBg, lumaText);
	results[theme] = {
		caloutBg,
		caloutTextRgb: rgbMatch,
		lumaBg: +lumaBg.toFixed(3),
		lumaText: +lumaText.toFixed(3),
		contrast: +ratio.toFixed(2),
		passWcagAA: ratio >= 4.5
	};
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
await server.close();

assert.ok(results.dark.contrast >= 4.5, `Kontras tema gelap ${results.dark.contrast} >= 4.5`);
assert.ok(results.light.contrast >= 4.5, `Kontras tema cerah ${results.light.contrast} >= 4.5`);
