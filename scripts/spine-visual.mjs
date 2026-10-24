import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { loadPlaywright } from './motion-regression.mjs';

const url = process.env.SPINE_URL || 'http://127.0.0.1:5173/';
const output = `.crew/artifacts/spine/${process.env.SPINE_CAPTURE || 'current'}`;
const { chromium } = await loadPlaywright();
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, serviceWorkers: 'block' });
await context.route('**/*', (route) => {
	const destination = new URL(route.request().url());
	return destination.origin === new URL(url).origin || ['data:', 'blob:'].includes(destination.protocol)
		? route.continue()
		: route.abort('blockedbyclient');
});
const page = await context.newPage();
page.setDefaultTimeout(60000);
page.setDefaultNavigationTimeout(30000);
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => {
	if (message.type() === 'error' && /THREE|WebGL|shader/i.test(message.text())) errors.push(message.text());
});
const results = {};
await mkdir(output, { recursive: true });
try {
	await page.goto(url);
	await page.locator('.webgl-stage canvas').waitFor();
	await page.mouse.move(720, 450);
	for (const theme of ['dark', 'light']) {
		if ((await page.locator('.spine-root').getAttribute('data-theme')) !== theme)
			await page.getByRole('button', { name: 'Tukar tema gelap atau cerah' }).click();
		await page.mouse.move(720, 450);
		await page.waitForTimeout(600);
		const image = await page.screenshot({ path: `${output}/${theme}-desktop.png` });
		results[theme] = await page.evaluate(async (base64) => {
			const image = new Image();
			image.src = `data:image/png;base64,${base64}`;
			await image.decode();
			const canvas = document.createElement('canvas');
			canvas.width = image.width;
			canvas.height = image.height;
			const ctx = canvas.getContext('2d');
			ctx.drawImage(image, 0, 0);
			// Kawasan dunia sahaja: elak HUD atas dan bawah.
			const { data } = ctx.getImageData(0, 120, image.width, image.height - 240);
			let total = 0, clipped = 0;
			for (let i = 0; i < data.length; i += 4) {
				total += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
				if (data[i] > 245 && data[i + 1] > 245 && data[i + 2] > 245) clipped++;
			}
			return { meanLuma: total / (data.length / 4), clippedFraction: clipped / (data.length / 4) };
		}, image.toString('base64'));
	}
	// Semak stesen yang dilaporkan: beberapa fasa putaran, kedua-dua tema.
	await page.locator('.radar-station-node').nth(2).click();
	await page.mouse.move(720, 450);
	await page.waitForTimeout(2500);
	for (const theme of ['dark', 'light']) {
		if ((await page.locator('.spine-root').getAttribute('data-theme')) !== theme)
			await page.getByRole('button', { name: 'Tukar tema gelap atau cerah' }).click();
		await page.mouse.move(720, 450);
		for (let phase = 0; phase < 3; phase++) {
			await page.waitForTimeout(800);
			await page.screenshot({ path: `${output}/${theme}-station-03-phase-${phase}.png` });
		}
	}
	results.errors = errors;
	await writeFile(`${output}/measurements.json`, JSON.stringify(results, null, 2));
	console.log(JSON.stringify(results, null, 2));
	assert.equal(errors.length, 0, 'Tiada ralat WebGL atau JavaScript');
	assert.ok(results.dark.meanLuma < results.light.meanLuma * 0.65, 'Dunia malam mesti nyata lebih gelap daripada siang');
	assert.ok(results.dark.clippedFraction < 0.005, 'Dark Mode tidak boleh mempunyai permukaan putih terpotong yang meluas');
} finally {
	await browser.close();
}
