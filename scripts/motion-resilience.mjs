import { mkdir, writeFile } from 'node:fs/promises';
import { loadPlaywright, installHarness, targetURL } from './motion-regression.mjs';

const { chromium } = await loadPlaywright();
const browser = await chromium.launch({ headless: true });
const checks = [];
const metrics = [];
const check = (name, passed, detail) => checks.push({ name, passed: !!passed, detail });
const ids = ['intro', 'emesys', 'onboardx', 'cv_bot', 'about', 'contact'];
const errors = [];
async function context(options = {}) {
	const ctx = await browser.newContext({ serviceWorkers: 'block', ...options });
	await installHarness(ctx);
	return ctx;
}
try {
	const ctx = await context({ javaScriptEnabled: false });
	const page = await ctx.newPage();
	await page.goto(targetURL);
	for (const id of ids)
		check(`No JS: ${id} in document`, (await page.locator(`#${id}`).count()) === 1);
	check(
		'No JS: native POST, never GET',
		(await page.locator('form').getAttribute('method')) === 'POST'
	);
	check(
		'No JS: HTTPS form destination',
		(await page.locator('form').getAttribute('action')) === 'https://api.web3forms.com/submit'
	);
	check('No JS: email channel available', (await page.locator('a[href^="mailto:"]').count()) > 0);
	await page.locator('nav a[href="#contact"]').click();
	check('No JS: native contact anchor', new URL(page.url()).hash === '#contact');
	await ctx.close();

	const noGL = await context();
	await noGL.addInitScript(() => {
		const original = HTMLCanvasElement.prototype.getContext;
		HTMLCanvasElement.prototype.getContext = function (type, ...args) {
			if (/webgl/i.test(type)) return null;
			return original.call(this, type, ...args);
		};
	});
	const fallback = await noGL.newPage();
	await fallback.goto(targetURL);
	await fallback.waitForFunction(() => window.__motionDiagnostic?.renderer === 'fallback');
	check('No WebGL: original SVG fallback visible', await fallback.locator('.fallback').isVisible());
	check('No WebGL: no dead canvas', (await fallback.locator('canvas').count()) === 0);
	await fallback.locator('nav a[href="#contact"]').click();
	check('No WebGL: contact fields usable', await fallback.locator('#contact-name').isVisible());
	await noGL.close();

	const blocked = await context();
	await blocked.addInitScript(() =>
		Object.defineProperty(window, 'localStorage', {
			get() {
				throw new DOMException('Storage blocked', 'SecurityError');
			}
		})
	);
	const storagePage = await blocked.newPage();
	const storageErrors = [];
	storagePage.on('pageerror', (e) => storageErrors.push(e.message));
	await storagePage.goto(targetURL);
	await storagePage.waitForTimeout(1200);
	await storagePage.getByRole('button', { name: 'EN', exact: true }).click();
	check(
		'Blocked storage: hydration/language works',
		(await storagePage.locator('html').getAttribute('lang')) === 'en',
		storageErrors
	);
	check('Blocked storage: no uncaught error', storageErrors.length === 0, storageErrors);
	await blocked.close();

	const ctx2 = await context({ viewport: { width: 390, height: 844 } });
	const p = await ctx2.newPage();
	p.on('pageerror', (e) => errors.push(e.message));
	await p.goto(targetURL);
	await p.waitForFunction(() => window.__motionDiagnostic?.renderer === 'ready');
	await p.keyboard.press('Tab');
	check(
		'Keyboard: first Tab reaches skip link',
		await p.locator('a[href="#main"]').evaluate((e) => e === document.activeElement)
	);
	await p.keyboard.press('Enter');
	check(
		'Keyboard: skip focuses main',
		await p.locator('main').evaluate((e) => e === document.activeElement)
	);
	const before = await p.evaluate(() => scrollY);
	await p.keyboard.press('PageDown');
	await p.waitForTimeout(400);
	check('Keyboard: PageDown scrolls document', (await p.evaluate(() => scrollY)) > before);
	await p.emulateMedia({ reducedMotion: 'reduce' });
	await p.waitForTimeout(300);
	const reduced = await p.evaluate(() => window.__motionDiagnostic);
	await p.setViewportSize({ width: 320, height: 740 });
	await p.waitForTimeout(500);
	const resized = await p.evaluate(() => window.__motionDiagnostic);
	check(
		'Reduced resize: redraw completed and stopped',
		resized.renders > reduced.renders && !resized.framePending,
		{ reduced, resized }
	);
	await p.emulateMedia({ reducedMotion: 'no-preference' });
	for (const y of [10000, 0, 4500, 0, 10000, 0]) await p.evaluate((y) => scrollTo(0, y), y);
	await p.waitForTimeout(1600);
	const end = await p.evaluate(() => window.__motionDiagnostic);
	check('Rapid reversals settle at hero', end.section === 0 && !end.framePending, end);
	await p.evaluate(() => (document.documentElement.style.fontSize = '200%'));
	check(
		'200% text: document fits 320px',
		await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
	);
	await ctx2.close();

	for (const viewport of [
		{ width: 1440, height: 900 },
		{ width: 390, height: 844 }
	]) {
		const c = await context({ viewport });
		const p = await c.newPage();
		const cdp = await c.newCDPSession(p);
		await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
		await p.goto(targetURL);
		await p.waitForTimeout(1500);
		metrics.push({
			viewport,
			conditions: 'localhost, headless Chromium, 4x CPU, no network throttling; not field CWV/INP',
			...(await p.evaluate(() => window.__motionLabMetrics))
		});
		await c.close();
	}
	check('No uncaught scene errors', errors.length === 0, errors);
} catch (e) {
	check('Resilience suite completed', false, e.stack);
} finally {
	await browser.close();
	await mkdir('.crew/artifacts', { recursive: true });
	const report = {
		url: targetURL,
		checks,
		metrics,
		summary: {
			assertions: checks.length,
			passed: checks.filter((x) => x.passed).length,
			failed: checks.filter((x) => !x.passed).length
		},
		notTested: [
			'real OS screen reader',
			'physical mobile GPU/thermal',
			'real background-tab lifecycle',
			'visual aesthetic approval'
		]
	};
	await writeFile('.crew/artifacts/motion-resilience-parent.json', JSON.stringify(report, null, 2));
	console.log(JSON.stringify(report, null, 2));
	if (report.summary.failed) process.exitCode = 1;
}
