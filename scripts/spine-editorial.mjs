import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const url = process.env.SPINE_URL || 'http://127.0.0.1:5173/';
const browser = await chromium.launch({ headless: true });
const output = '.crew/artifacts/editorial';
const errors = [];
await mkdir(output, { recursive: true });

try {
	const context = await browser.newContext({
		viewport: { width: 1280, height: 800 },
		reducedMotion: 'reduce',
		serviceWorkers: 'block'
	});
	await context.addInitScript(() => localStorage.setItem('spine-view-mode', 'editorial'));
	await context.route('**/src/lib/spine/FiberSpineWorld.ts', async (route) => {
		const response = await route.fetch();
		await route.fulfill({
			response,
			body: `${await response.text()}\nconst init = FiberSpineWorld.prototype.init; FiberSpineWorld.prototype.init = function() { window.__editorialWorld = this; return init.call(this); };`
		});
	});
	const page = await context.newPage();
	const requests = [];
	page.on('request', (request) => requests.push(request.url()));
	page.on('pageerror', (error) => errors.push(error.message));
	page.on('console', (message) => {
		if (message.type() === 'error' && /THREE|WebGL|shader/i.test(message.text()))
			errors.push(message.text());
	});
	await page.goto(url);
	await page.locator('.spine-root[data-mode="editorial"]').waitFor();
	assert.equal(
		requests.some((request) => /FiberSpineWorld|\/three[._/]/i.test(request)),
		false
	);
	assert.equal(await page.getByText('Arkib Penuh CV', { exact: true }).count(), 0);
	assert.equal(await page.locator('[role="dialog"]').count(), 0);

	for (const theme of ['dark', 'light']) {
		if ((await page.locator('html').getAttribute('data-theme')) !== theme)
			await page.getByRole('button', { name: /tukar ke tema/ }).click();
		for (const width of [320, 390, 1280]) {
			await page.setViewportSize({ width, height: 844 });
			const layout = await page.evaluate(() => ({
				width: document.documentElement.clientWidth,
				scroll: document.documentElement.scrollWidth,
				controls: [...document.querySelectorAll('.utility-actions button')].map((button) => {
					const rect = button.getBoundingClientRect();
					return { width: rect.width, height: rect.height, left: rect.left, right: rect.right };
				})
			}));
			assert.ok(layout.scroll <= layout.width, `${theme}/${width}: limpahan mendatar`);
			for (const control of layout.controls) {
				assert.ok(control.width >= 44 && control.height >= 44, `${theme}/${width}: sasaran kecil`);
				assert.ok(
					control.left >= 0 && control.right <= width,
					`${theme}/${width}: kawalan terpotong`
				);
			}
			await page.screenshot({ path: `${output}/${theme}-${width}.png` });
		}
	}

	await page.locator('.mode-switch').focus();
	await page.keyboard.press('Enter');
	await page.waitForFunction(() => window.__editorialWorld?.hotspots.length === 21);
	await page.waitForFunction(() => !document.querySelector('.loading-overlay'));
	await page.evaluate(() => {
		const world = window.__editorialWorld;
		world.callbacks.onHotspotSelect('ent-emesys', 1);
		world.performScreenAction({ kind: 'editorial' });
	});
	await page.locator('.spine-root[data-mode="editorial"]').waitFor();
	await page.waitForFunction(() => document.activeElement?.id === 'editorial-title');
	assert.equal(await page.evaluate(() => localStorage.getItem('spine-view-mode')), 'editorial');
	assert.equal(await page.evaluate(() => window.__editorialWorld.active), false);
	await page.locator('.mode-switch').click();
	await page.locator('.spine-root[data-mode="3d"]').waitFor();
	assert.equal(
		await page.evaluate(() => document.activeElement?.classList.contains('mode-switch')),
		true
	);
	assert.equal(await page.evaluate(() => window.__editorialWorld.selectedHotspotId), null);

	// Import gagal mesti memulihkan CV, bukan meninggalkan skrin pemuatan.
	const fallback = await browser.newContext({ serviceWorkers: 'block' });
	await fallback.route('**/src/lib/spine/FiberSpineWorld.ts', (route) => route.abort());
	const fallbackPage = await fallback.newPage();
	await fallbackPage.goto(url);
	await fallbackPage.locator('.spine-root[data-mode="editorial"]').waitFor();
	assert.equal(await fallbackPage.locator('#editorial-title').isVisible(), true);
	assert.equal(await fallbackPage.locator('.mode-switch').count(), 0);
	await fallback.close();
	assert.deepEqual(errors, [], 'Tiada ralat JavaScript atau shader pada aliran biasa');
	console.log(
		'PASS: editorial tanpa import 3D; 6 susun atur/tema; sasaran HUD; tindakan terminal; fokus; fallback import.'
	);
} finally {
	await browser.close();
}
