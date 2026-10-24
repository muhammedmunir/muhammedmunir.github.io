import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const origin = process.env.BASE_URL ?? 'http://127.0.0.1:4317';
const output = '.crew/facility-verification';
await mkdir(output, { recursive: true });
let playwright;
try { playwright = await import('playwright'); }
catch { playwright = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH ?? 'C:/Users/KELUARGA AZMI/AppData/Local/npm-cache/_npx/f70ed744217c9448/node_modules/playwright/index.mjs').href); }
const browser = await playwright.chromium.launch({
	headless: true,
	executablePath: process.env.CHROMIUM_PATH ?? 'C:/Users/KELUARGA AZMI/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe'
});
const results = [];
const errors = [];
const blocked = new Set();
async function test(name, fn) {
	try { const detail = await fn(); results.push({ name, pass: true, detail }); console.log(`LULUS: ${name}`); }
	catch (error) { results.push({ name, pass: false, error: error.message }); console.error(`GAGAL: ${name}: ${error.message}`); }
}
async function context(options = {}) {
	const ctx = await browser.newContext(options);
	await ctx.route('**/*', (route) => {
		const url = new URL(route.request().url());
		if (url.origin === origin || ['data:', 'blob:'].includes(url.protocol)) return route.continue();
		blocked.add(url.origin);
		return route.abort();
	});
	ctx.on('page', (page) => {
		page.on('pageerror', (error) => errors.push(error.message));
		page.on('console', (message) => {
			if (message.type() === 'error' && !/ERR_FAILED|Failed to load resource|WebGL context|Error creating WebGL/.test(message.text())) errors.push(message.text());
		});
	});
	return ctx;
}
async function load(page, url = origin) {
	await page.goto(url);
	await page.waitForFunction(() => {
		const root = document.querySelector('[data-facility]');
		return root && root.dataset.worldState !== 'loading';
	});
}
async function select(page, id) {
	await page.locator(`[data-chamber="${id}"]`).click();
	await page.waitForFunction((value) => document.querySelector('[data-facility]')?.dataset.activeChamber === String(value), id);
}
async function noOverflow(page) {
	const size = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, height: innerHeight, contentHeight: document.documentElement.scrollHeight }));
	assert.ok(size.scroll <= size.width + 1, `Lebar ${size.scroll} melebihi viewport ${size.width}`);
	return size;
}
async function controls(page) {
	const issues = await page.locator('.hud button:visible, .hud a:visible').evaluateAll((elements) => elements.flatMap((element) => {
		if (element.disabled) return [];
		const rect = element.getBoundingClientRect();
		if (rect.width < 24 || rect.height < 24) return [{ text: element.getAttribute('aria-label') ?? element.textContent, rect: rect.toJSON() }];
		return [];
	}));
	assert.deepEqual(issues, [], 'Sasaran interaksi kurang daripada 24px');
	return page.locator('.hud button:visible, .hud a:visible').count();
}

try {
	const desktop = await context({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
	const page = await desktop.newPage();
	await test('Desktop: pelancaran dan enam kawalan navigasi', async () => {
		await load(page);
		assert.equal(await page.locator('[data-chamber]').count(), 6);
		assert.equal(await page.locator('[data-facility]').getAttribute('data-world-state'), 'ready');
		return { ...(await noOverflow(page)), controls: await controls(page) };
	});
	for (let id = 0; id < 6; id++) {
		await test(`Desktop: ruang ${id} dan catatan`, async () => {
			await select(page, id);
			await page.getByTestId('inspect-button').click();
			const dialog = page.getByTestId('dossier-dialog');
			await dialog.waitFor({ state: 'visible' });
			const details = dialog.getByTestId('detail-option');
			assert.equal(await details.count(), id === 2 ? 4 : 3);
			await details.last().click();
			assert.equal(await details.last().getAttribute('aria-pressed'), 'true');
			await page.keyboard.press('Escape');
			await dialog.waitFor({ state: 'hidden' });
			assert.equal(await page.getByTestId('inspect-button').evaluate((el) => el === document.activeElement), true);
			await noOverflow(page);
			await page.screenshot({ path: `${output}/desktop-light-${id}.png`, fullPage: true });
			return page.getByTestId('station-title').innerText();
		});
		if (id > 0 && id < 5) await test(`Desktop: demonstrasi ruang ${id}`, async () => {
			const before = await page.getByTestId('action-result').innerText();
			await page.getByTestId('station-action').click();
			const first = await page.getByTestId('action-result').innerText();
			assert.notEqual(before, first);
			await page.getByTestId('station-action').click();
			assert.notEqual(first, await page.getByTestId('action-result').innerText());
		});
	}
	await test('Desktop: kekunci anak panah, Home dan End', async () => {
		await page.locator('[data-chamber="5"]').focus();
		await page.keyboard.press('Home');
		assert.equal(await page.locator('[data-facility]').getAttribute('data-active-chamber'), '0');
		await page.keyboard.press('ArrowRight');
		assert.equal(await page.locator('[data-facility]').getAttribute('data-active-chamber'), '1');
		await page.keyboard.press('End');
		assert.equal(await page.locator('[data-facility]').getAttribute('data-active-chamber'), '5');
	});
	await test('Desktop: tema dan bahasa kekal selepas reload', async () => {
		await select(page, 0);
		await page.getByTestId('theme-toggle').click();
		await page.getByTestId('language-toggle').click();
		await page.reload();
		await page.waitForFunction(() => document.querySelector('[data-facility]')?.dataset.worldState === 'ready');
		assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
		assert.equal(await page.locator('html').getAttribute('lang'), 'en');
		assert.match(await page.getByTestId('station-title').innerText(), /Munir/);
		await page.screenshot({ path: `${output}/desktop-dark.png`, fullPage: true });
	});
	await test('Desktop: jeda, mod bacaan dan kembali ke 3D', async () => {
		await page.getByTestId('motion-toggle').click();
		assert.equal(await page.locator('[data-facility]').getAttribute('data-paused'), 'true');
		await page.getByTestId('view-toggle').click();
		assert.equal(await page.locator('[data-facility]').getAttribute('data-world-state'), 'text');
		assert.equal(await page.locator('[data-testid="world-host"] canvas').count(), 0);
		await select(page, 4);
		await page.getByTestId('station-action').click();
		assert.match(await page.getByTestId('action-result').innerText(), /Recognition/);
		await page.getByTestId('view-toggle').click();
		await page.waitForFunction(() => document.querySelector('[data-facility]')?.dataset.worldState === 'ready');
	});
	await desktop.close();

	for (const [width, height] of [[390, 844], [320, 640], [844, 390], [1024, 600]]) {
		const ctx = await context({ viewport: { width, height }, colorScheme: 'dark', reducedMotion: 'reduce' });
		const mobile = await ctx.newPage();
		await load(mobile);
		await test(`${width}×${height}: gerakan minimum`, async () => {
			assert.equal(await mobile.locator('[data-facility]').getAttribute('data-paused'), 'true');
			assert.equal(await mobile.getByTestId('motion-toggle').isDisabled(), true);
		});
		for (let id = 0; id < 6; id++) await test(`${width}×${height}: ruang ${id}`, async () => {
			await select(mobile, id);
			const size = await noOverflow(mobile);
			await controls(mobile);
			await mobile.getByTestId('inspect-button').click();
			await mobile.getByTestId('dossier-dialog').waitFor({ state: 'visible' });
			await mobile.keyboard.press('Escape');
			await mobile.getByTestId('dossier-dialog').waitFor({ state: 'hidden' });
			await mobile.screenshot({ path: `${output}/${width}-${height}-${id}.png`, fullPage: true });
			return size;
		});
		await ctx.close();
	}
	const noGL = await context({ viewport: { width: 390, height: 844 } });
	await noGL.addInitScript(() => {
		const original = HTMLCanvasElement.prototype.getContext;
		HTMLCanvasElement.prototype.getContext = function (type, ...args) { return /webgl/.test(type) ? null : original.call(this, type, ...args); };
	});
	const fallback = await noGL.newPage();
	await test('Tanpa WebGL: kandungan dan demonstrasi kekal tersedia', async () => {
		await load(fallback);
		assert.equal(await fallback.locator('[data-facility]').getAttribute('data-world-state'), 'unavailable');
		await select(fallback, 2);
		await fallback.getByTestId('station-action').click();
		assert.match(await fallback.getByTestId('action-result').innerText(), /Vue/);
		await fallback.getByTestId('inspect-button').click();
		await fallback.getByTestId('dossier-dialog').waitFor({ state: 'visible' });
		await noOverflow(fallback);
	});
	await noGL.close();
	const noJS = await context({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
	const staticPage = await noJS.newPage();
	await test('Tanpa JavaScript: enam catatan SSR dan pautan hubungan', async () => {
		await staticPage.goto(origin);
		assert.equal(await staticPage.locator('.no-js > section').count(), 6);
		assert.ok(await staticPage.locator('.no-js a[href^="mailto:"]').count() > 0);
		await noOverflow(staticPage);
	});
	await noJS.close();
	await test('Tiada pengecualian JavaScript atau ralat aplikasi', async () => assert.deepEqual([...new Set(errors)], []));
} finally {
	await browser.close();
	await writeFile(`${output}/results.json`, JSON.stringify({ origin, passed: results.filter((r) => r.pass).length, failed: results.filter((r) => !r.pass).length, errors, blockedOrigins: [...blocked], results }, null, 2));
}
console.log(`${results.filter((r) => r.pass).length}/${results.length} pemeriksaan lulus.`);
if (results.some((r) => !r.pass)) process.exitCode = 1;
