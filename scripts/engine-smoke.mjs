import { mkdir, writeFile } from 'node:fs/promises';
import { loadPlaywright } from './motion-regression.mjs';
const { chromium } = await loadPlaywright();
const browser = await chromium.launch({ headless: true });
const url = process.env.ENGINE_URL || 'http://127.0.0.1:4208/';
const checks = [];
const captures = [];
const check = (name, pass, detail) => checks.push({ name, pass: !!pass, detail });
try {
	const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
	const p = await c.newPage();
	const errors = [];
	p.on('pageerror', (e) => errors.push(e.message));
	await p.goto(url);
	await p.waitForFunction(() => window.__engineDiagnostic?.renderer === 'ready');
	check(
		'Single main and identity',
		(await p.locator('main').count()) === 1 && (await p.locator('h1').count()) === 1
	);
	for (const region of ['interface', 'services', 'data', 'intelligence']) {
		await p.locator(`[data-region=${region}]`).focus();
		await p.keyboard.press('Enter');
		const activeFrame = await p.waitForFunction(
			() => {
				const d = window.__engineDiagnostic;
				return d.phase > 0 && d.active ? d : false;
			},
			null,
			{ timeout: 15000 }
		);
		const d = await activeFrame.jsonValue();
		check(
			`${region}: shared selection and propagation`,
			d.selected === region && d.active && d.phase > 0 && d.phase < 1,
			d
		);
		await p.waitForFunction(() => !window.__engineDiagnostic.active, null, { timeout: 10000 });
	}
	const before = await p.evaluate(() => window.__engineDiagnostic.frames);
	await p.waitForTimeout(350);
	check(
		'Renderer stops idle',
		await p.evaluate(
			(n) => window.__engineDiagnostic.frames === n && !window.__engineDiagnostic.framePending,
			before
		)
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
		await p.waitForTimeout(700);
		check(
			`${size.width}: no overflow`,
			await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
		);
		for (const progress of [0, 0.5, 1]) {
			await p.evaluate((progress) => {
				const r = document.querySelector('.journey');
				scrollTo(0, (r.offsetHeight - innerHeight) * progress);
			}, progress);
			await p.waitForTimeout(900);
			const rects = await p.locator('.region').evaluateAll((es) =>
				es.map((e) => {
					const r = e.getBoundingClientRect();
					return { x: r.x, y: r.y, w: r.width, h: r.height };
				})
			);
			const overlaps = rects.flatMap((a, i) =>
				rects
					.slice(i + 1)
					.filter(
						(b) =>
							Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > 1 &&
							Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > 1
					)
			);
			check(`${size.width}/${progress}: controls don't overlap`, overlaps.length === 0, rects);
			check(
				`${size.width}/${progress}: controls fit`,
				rects.every(
					(r) => r.x >= 0 && r.x + r.w <= size.width && r.y >= 0 && r.y + r.h <= size.height
				),
				rects
			);
		}
		if (size.width >= 375) {
			await p.evaluate(() => scrollTo(0, 0));
			await p.waitForTimeout(500);
			const file = `.playwright-mcp/engine-${size.width}-hero.png`;
			await p.screenshot({ path: file });
			captures.push(file);
		}
	}
	await p.setViewportSize({ width: 1440, height: 900 });
	await p.evaluate(() => scrollTo(0, 0));
	await p.waitForTimeout(700);
	await p.locator('[data-region=data]').click();
	await p.waitForTimeout(600);
	await p.screenshot({ path: '.playwright-mcp/engine-active-input.png' });
	captures.push('.playwright-mcp/engine-active-input.png');
	await p.evaluate(() => {
		const r = document.querySelector('.journey');
		scrollTo(0, (r.offsetHeight - innerHeight) * 0.5);
	});
	await p.waitForTimeout(1000);
	await p.screenshot({ path: '.playwright-mcp/engine-mid-transition.png' });
	captures.push('.playwright-mcp/engine-mid-transition.png');
	await p.locator('#emesys').evaluate((e) => e.scrollIntoView({ block: 'start' }));
	await p.waitForTimeout(1000);
	await p.waitForFunction(() => window.__engineDiagnostic.progress > 0.8, null, { timeout: 15000 });
	check(
		'Project progress drives same world',
		await p.evaluate(() => window.__engineDiagnostic.progress > 0.8)
	);
	await p.screenshot({ path: '.playwright-mcp/engine-emesys.png' });
	captures.push('.playwright-mcp/engine-emesys.png');
	await p.screenshot({ path: '.playwright-mcp/engine-overview.png', fullPage: true });
	await p.getByRole('button', { name: 'EN', exact: true }).click();
	check('Language works', (await p.locator('html').getAttribute('lang')) === 'en');
	await p.emulateMedia({ reducedMotion: 'reduce' });
	await p.waitForTimeout(400);
	check(
		'Reduced motion static',
		await p.evaluate(
			() =>
				window.__engineDiagnostic.reduced &&
				!window.__engineDiagnostic.active &&
				!window.__engineDiagnostic.framePending
		)
	);
	await p
		.locator('canvas')
		.evaluate((c) => c.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
	await p.locator('[data-engine-state=fallback]').waitFor();
	check(
		'Fallback no dead controls',
		(await p.locator('.region').count()) === 0 && (await p.locator('.fallback-art').isVisible())
	);
	check('No runtime errors', errors.length === 0, errors);
	await c.close();
	const n = await browser.newContext({ javaScriptEnabled: false });
	const np = await n.newPage();
	await np.goto(url);
	check(
		'No JS preserves identity/project',
		(await np.locator('h1').isVisible()) &&
			(await np.locator('#emesys').count()) === 1 &&
			(await np.locator('.fallback-art').isVisible())
	);
	await n.close();
} catch (e) {
	check('Suite completed', false, e.stack);
} finally {
	await browser.close();
	await mkdir('.crew/artifacts', { recursive: true });
	const r = {
		url,
		checks,
		captures,
		passed: checks.filter((c) => c.pass).length,
		failed: checks.filter((c) => !c.pass).length,
		visualApproval: 'OPEN model cannot inspect pixels'
	};
	await writeFile('.crew/artifacts/engine-smoke.json', JSON.stringify(r, null, 2));
	console.log(JSON.stringify(r, null, 2));
	if (r.failed) process.exitCode = 1;
}
