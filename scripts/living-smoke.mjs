import { mkdir, writeFile } from 'node:fs/promises';
import { loadPlaywright } from './motion-regression.mjs';
const { chromium } = await loadPlaywright();
const browser = await chromium.launch({ headless: true });
const url = process.env.LIVING_URL || 'http://127.0.0.1:4205/';
const checks = [];
const check = (name, pass, detail) => checks.push({ name, pass: !!pass, detail });
try {
	const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
	const p = await ctx.newPage();
	const errors = [];
	p.on('pageerror', (e) => errors.push(e.message));
	await p.goto(url);
	await p.waitForFunction(() => window.__foundry?.ready);
	check(
		'One identity heading and main',
		(await p.locator('h1').count()) === 1 && (await p.locator('main').count()) === 1
	);
	check(
		'Identity is immediate',
		(await p.locator('h1').textContent()).includes('Muhammed') &&
			(await p.locator('.position').isVisible())
	);
	check(
		'No essential dialog or chapter controls',
		(await p.locator('dialog,[data-chapter]').count()) === 0
	);
	const b = p.locator('.world-input');
	await b.focus();
	await p.keyboard.press('Enter');
	await p.waitForTimeout(750);
	const active = await p.evaluate(() => ({ ...window.__foundry }));
	check('Keyboard input opens the world', active.active && active.open > 0.8, active);
	check('Visible label is accessible name', (await b.getAttribute('aria-label')) === null);
	await p.waitForTimeout(1800);
	const a = await p.evaluate(() => window.__foundry.frames);
	await p.waitForTimeout(400);
	check(
		'Finite input settles, renderer stops idle',
		await p.evaluate(
			(a) =>
				!window.__foundry.active && !window.__foundry.framePending && window.__foundry.frames === a,
			a
		)
	);
	await p.locator('#project').evaluate((e) => e.scrollIntoView({ block: 'start' }));
	await p.waitForTimeout(1200);
	check(
		'Short transition reaches cutaway',
		await p.evaluate(() => window.__foundry.progress > 0.9 && window.__foundry.open > 0.9)
	);
	for (const size of [
		{ width: 1440, height: 900 },
		{ width: 1920, height: 1080 },
		{ width: 390, height: 844 },
		{ width: 375, height: 812 },
		{ width: 320, height: 740 }
	]) {
		await p.setViewportSize(size);
		await p.evaluate(() => scrollTo(0, 0));
		await p.waitForTimeout(500);
		check(
			`${size.width}: no overflow`,
			await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
		);
		check(
			`${size.width}: heading fits`,
			await p.locator('h1').evaluate((e) => {
				const r = e.getBoundingClientRect();
				return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom < innerHeight;
			})
		);
	}
	await p.getByRole('button', { name: 'EN', exact: true }).click();
	check(
		'English position rendered',
		await p
			.locator('.position')
			.textContent()
			.then((t) => t.includes('AI-focused'))
	);
	await p.emulateMedia({ reducedMotion: 'reduce' });
	await p.waitForTimeout(200);
	await b.click();
	await p.waitForTimeout(200);
	check(
		'Reduced response static and complete',
		await p.evaluate(
			() => window.__foundry.reduced && !window.__foundry.active && !window.__foundry.framePending
		)
	);
	await p
		.locator('canvas')
		.evaluate((c) => c.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
	await p.locator('[data-living-state=fallback]').waitFor();
	check('Loss returns to original SVG', await p.locator('svg.fallback').isVisible());
	check('No dead activation after loss', (await p.locator('.world-input').count()) === 0);
	check('No uncaught runtime errors', errors.length === 0, errors);
	await ctx.close();
	const nojs = await browser.newContext({ javaScriptEnabled: false });
	const n = await nojs.newPage();
	await n.goto(url);
	check(
		'No JS still has identity and eMesys',
		(await n.locator('h1').isVisible()) && (await n.locator('#project').count()) === 1
	);
	check(
		'No JS shows static artwork not dead control',
		(await n.locator('svg.fallback').isVisible()) && (await n.locator('.world-input').count()) === 0
	);
	await nojs.close();
} catch (e) {
	check('Smoke completed', false, e.stack);
} finally {
	await browser.close();
	await mkdir('.crew/artifacts', { recursive: true });
	const report = {
		url,
		checks,
		passed: checks.filter((c) => c.pass).length,
		failed: checks.filter((c) => !c.pass).length,
		visualApproval: 'NOT PERFORMED: model cannot inspect pixels'
	};
	await writeFile('.crew/artifacts/living-smoke.json', JSON.stringify(report, null, 2));
	console.log(JSON.stringify(report, null, 2));
	if (report.failed) process.exitCode = 1;
}
