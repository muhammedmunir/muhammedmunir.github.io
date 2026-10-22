// scripts/portfolio-regression.mjs
// Fast production regression suite for the six-chapter /spatial portfolio.
// Read-only against a running preview. Never sends a real contact message:
// https://api.web3forms.com/submit is always intercepted with page.route().
//
// Usage (Windows bash):
//   node scripts/portfolio-regression.mjs
// Env:
//   PORTFOLIO_URL          default http://127.0.0.1:4189/
//   PLAYWRIGHT_MODULE      default cached npx playwright index.mjs
//   PORTFOLIO_READY_TIMEOUT_MS  default 60000 (HTTP readiness gate)

import { pathToFileURL } from 'node:url';

const PLAYWRIGHT_PATH =
	process.env.PLAYWRIGHT_MODULE ||
	'C:/Users/KELUARGA AZMI/AppData/Local/npm-cache/_npx/f70ed744217c9448/node_modules/playwright/index.mjs';
const { chromium } = await import(pathToFileURL(PLAYWRIGHT_PATH).href);

const BASE_URL = (process.env.PORTFOLIO_URL || 'http://127.0.0.1:4189/').replace(/\/*$/, '/');
const READY_TIMEOUT_MS = Number(process.env.PORTFOLIO_READY_TIMEOUT_MS || 60000);
const POSE_TOL = 0.2;

// Contract mirrors src/lib/spatial/contract.ts (read-only copy, not imported).
const CHAPTERS = ['intro', 'emesys', 'onboardx', 'cv_bot', 'background', 'contact'];
const CHAPTER_STAGE = {
	intro: 0,
	emesys: 2,
	onboardx: 4,
	cv_bot: 5,
	background: 6,
	contact: 3
};
const SCENE_STATES = {
	intro: 'closed',
	emesys: 'inside-emesys',
	onboardx: 'unfolded-onboardx',
	cv_bot: 'optical-cv',
	background: 'exploded-background',
	contact: 'return'
};
// Mirrors poses in src/lib/spatial/scene.ts (exterior + per-stage overrides).
const EXTERIOR = {
	x: 11,
	y: 5,
	z: 21,
	tx: 0,
	ty: 0,
	tz: -2,
	split: 0,
	aperture: 0,
	documentUnfold: 0,
	opticAperture: 0,
	opticSweep: 0,
	backgroundSpread: 0
};
const POSES = {
	0: EXTERIOR,
	1: { ...EXTERIOR, x: 4, y: 1.7, z: 14, tz: -8, split: 1, aperture: 1 },
	2: { ...EXTERIOR, x: 0, y: 0.5, z: -8, tz: -21, split: 1, aperture: 1 },
	3: { ...EXTERIOR, x: -12, y: 6, z: 23, tz: -4 },
	4: { ...EXTERIOR, x: 21, y: 5, z: 21, tx: 10, tz: -1, documentUnfold: 1 },
	5: { ...EXTERIOR, x: -18, y: 3, z: 18, tx: -11, tz: -1, opticAperture: 1, opticSweep: 1 },
	6: {
		...EXTERIOR,
		x: 21,
		y: 13,
		z: 29,
		tz: -10,
		split: 0.65,
		aperture: 1,
		backgroundSpread: 1
	}
};
const POSE_FIELDS = Object.keys(EXTERIOR);

// Documented facts from src/lib/system-projects.ts.
const PROJECT_FACTS = {
	emesys: {
		context: 'YHCM / Sistem sektor awam',
		technologies: ['Vue.js 3', 'Laravel 11', 'MariaDB', 'Docker Swarm']
	},
	onboardx: {
		context: 'TNB / Mobiliti perusahaan',
		technologies: ['Flutter', 'Documents / Profiles', 'Firebase / MongoDB', 'Azure / Jenkins']
	},
	cv_bot: {
		context: 'Projek peribadi / Automasi desktop',
		technologies: ['CustomTkinter', 'OpenCV / SIFT', 'Python', 'Win32 API']
	}
};

let assertions = 0;
const results = [];
let browser;

function assert(condition, message) {
	assertions++;
	if (!condition) {
		const error = new Error(message);
		error.assertionFailed = true;
		throw error;
	}
}

function nearlyEqual(a, b, tol = POSE_TOL) {
	return typeof a === 'number' && Number.isFinite(a) && Math.abs(a - b) <= tol;
}

async function runTest(name, fn) {
	const started = Date.now();
	try {
		await fn();
		results.push({ name, passed: true, duration: Date.now() - started });
		console.log(`  PASS: ${name} (${Date.now() - started}ms)`);
	} catch (error) {
		results.push({ name, passed: false, duration: Date.now() - started, error: error.message });
		console.error(`  FAIL: ${name} (${Date.now() - started}ms)\n        ${error.message}`);
	}
}

// ---------------------------------------------------------------- readiness

async function waitForHttp(url, timeoutMs) {
	const deadline = Date.now() + timeoutMs;
	let last = 'no attempt';
	while (Date.now() < deadline) {
		try {
			const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
			if (response.ok) {
				console.log(`HTTP ready: ${url} -> ${response.status}`);
				return;
			}
			last = `HTTP ${response.status}`;
		} catch (error) {
			last = error.message;
		}
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	throw new Error(
		`Preview not reachable at ${url} within ${timeoutMs}ms (last: ${last}).\n` +
			`Repro: start a preview on 4189 (e.g. "npm run preview -- --port 4189 --strictPort") ` +
			`then rerun "node scripts/portfolio-regression.mjs".`
	);
}

// ---------------------------------------------------------------- helpers

async function newContext(options = {}) {
	const context = await browser.newContext({
		viewport: { width: 1440, height: 900 },
		...options
	});
	await context.addInitScript((lang) => {
		localStorage.setItem('lang', lang);
	}, options.lang || 'ms');
	return context;
}

async function openPage(context) {
	const page = await context.newPage();
	const pageErrors = [];
	page.on('pageerror', (error) => pageErrors.push(error.message));
	await page.goto(BASE_URL, { waitUntil: 'load' });
	await page.waitForSelector('.spatial[data-ready="true"]', { timeout: 20000 });
	return { page, pageErrors };
}

async function settleIntro(page) {
	await page.waitForFunction(() => window.__spatialDiagnostic?.intro === false, null, {
		timeout: 20000
	});
}

async function diagnostic(page) {
	return page.evaluate(() => {
		const d = window.__spatialDiagnostic;
		if (!d) return null;
		return {
			...d,
			camera: [...d.camera],
			pose: { ...d.pose },
			frozen: Object.isFrozen(d) && Object.isFrozen(d.pose) && Object.isFrozen(d.camera)
		};
	});
}

async function goToChapter(page, chapter) {
	await page.locator(`.chapter-nav button[data-chapter="${chapter}"]`).click();
	await page.waitForFunction(
		(expected) => document.querySelector('.spatial')?.dataset.chapter === expected,
		chapter,
		{ timeout: 10000 }
	);
	const stage = CHAPTER_STAGE[chapter];
	if ((await page.locator('.spatial').getAttribute('data-renderer')) === 'static-svg') return stage;
	await page.waitForFunction((expected) => window.__spatialDiagnostic?.stage === expected, stage, {
		timeout: 10000
	});
	// Wait for the pose to settle on the exact static frame for that stage.
	await page.waitForFunction(
		({ expected, fields, tol }) => {
			const d = window.__spatialDiagnostic;
			if (!d) return false;
			return fields.every((field) => Math.abs(d.pose[field] - expected[field]) <= tol);
		},
		{ expected: POSES[stage], fields: POSE_FIELDS, tol: POSE_TOL },
		{ timeout: 10000 }
	);
	return stage;
}

async function poseDiff(page, expected) {
	const actual = (await diagnostic(page)).pose;
	const diffs = POSE_FIELDS.filter((field) => !nearlyEqual(actual[field], expected[field]));
	return { actual, diffs };
}

async function openProjectDialog(page, chapter) {
	await goToChapter(page, chapter);
	await page.locator('.synopsis .primary').click();
	await page.waitForSelector('dialog.reader[open]');
	await page.waitForFunction(() => {
		const heading = document.querySelector('#spatial-dialog-title');
		return heading && document.activeElement === heading;
	});
}

// ---------------------------------------------------------------- suite

console.log('\n==================================================');
console.log('Portfolio six-chapter production regression');
console.log(`Target: ${BASE_URL}`);
console.log('==================================================\n');

try {
	await waitForHttp(BASE_URL, READY_TIMEOUT_MS);
} catch (error) {
	console.error(`\nBLOCKED: ${error.message}\n`);
	process.exit(2);
}

browser = await chromium.launch();

try {
	await runTest('1. Page boots with one main, one h1 and all six chapters', async () => {
		const context = await newContext();
		const { page, pageErrors } = await openPage(context);
		await settleIntro(page);

		assert((await page.locator('main').count()) === 1, 'expected exactly one <main> landmark');
		assert(
			(await page.locator('main h1').count()) === 1,
			'expected exactly one <h1> inside <main>'
		);
		assert(
			(await page.locator('.chapter-nav button[data-chapter]').count()) === 6,
			'expected six chapter navigation buttons'
		);
		const chapters = await page
			.locator('.chapter-nav button[data-chapter]')
			.evaluateAll((nodes) => nodes.map((node) => node.dataset.chapter));
		assert(
			JSON.stringify(chapters) === JSON.stringify(CHAPTERS),
			`chapter order mismatch: ${JSON.stringify(chapters)}`
		);
		assert(
			(await page.locator('.spatial').getAttribute('data-renderer')) === 'webgl',
			'expected live webgl renderer on boot'
		);
		assert(pageErrors.length === 0, `unexpected page errors: ${pageErrors.join('; ')}`);

		const d = await diagnostic(page);
		assert(d !== null, 'window.__spatialDiagnostic must be exposed');
		assert(d.frozen === true, 'diagnostic getter, pose and camera must be frozen snapshots');
		assert(
			d.stage === 0 && d.chapter === 'intro',
			`expected intro/stage 0, got ${d.chapter}/${d.stage}`
		);
		const bad = POSE_FIELDS.filter(
			(field) => typeof d.pose[field] !== 'number' || !Number.isFinite(d.pose[field])
		);
		assert(bad.length === 0, `non-numeric pose fields: ${bad.join(', ')}`);
		assert(
			d.camera.length === 3 && d.camera.every((n) => typeof n === 'number' && Number.isFinite(n)),
			`camera must be three finite numbers, got ${JSON.stringify(d.camera)}`
		);
		assert(typeof d.geometries === 'number' && d.geometries > 0, 'geometries must be numeric');
		await context.close();
	});

	await runTest('2. All six chapters map to numeric stages with exact poses', async () => {
		const context = await newContext();
		const { page } = await openPage(context);
		await settleIntro(page);

		for (const chapter of CHAPTERS) {
			const stage = await goToChapter(page, chapter);
			assert(
				(await page.locator('.spatial').getAttribute('data-chapter')) === chapter,
				`data-chapter mismatch for ${chapter}`
			);
			assert(
				stage === CHAPTER_STAGE[chapter],
				`${chapter} must map to stage ${CHAPTER_STAGE[chapter]}`
			);
			assert(
				(await page.locator('.spatial').getAttribute('data-scene-state')) === SCENE_STATES[chapter],
				`${chapter} scene-state must be ${SCENE_STATES[chapter]}`
			);
			const d = await diagnostic(page);
			assert(
				d.stage === CHAPTER_STAGE[chapter] && d.chapter === chapter,
				`diagnostic stage/chapter mismatch for ${chapter}: ${d.stage}/${d.chapter}`
			);
			const { actual, diffs } = await poseDiff(page, POSES[stage]);
			assert(
				diffs.length === 0,
				`${chapter} pose mismatch on ${diffs.join(', ')}: expected ${JSON.stringify(
					POSES[stage]
				)} got ${JSON.stringify(actual)}`
			);
			assert(
				(await page.locator('.chapter-nav button[aria-current="step"]').count()) === 1,
				`${chapter} must expose exactly one aria-current chapter`
			);
			assert(
				(await page
					.locator('.chapter-nav button[aria-current="step"]')
					.getAttribute('data-chapter')) === chapter,
				`aria-current must mark ${chapter}`
			);
		}
		await context.close();
	});

	await runTest('3. Project detail dialogs show exact documented facts', async () => {
		const context = await newContext();
		const { page } = await openPage(context);
		await settleIntro(page);

		for (const [chapter, facts] of Object.entries(PROJECT_FACTS)) {
			await openProjectDialog(page, chapter);
			assert(
				(await page.locator('dialog.reader[open]').count()) === 1,
				`${chapter} dialog must be a native open dialog`
			);
			assert(
				(await page.locator('dialog.reader').getAttribute('aria-labelledby')) ===
					'spatial-dialog-title',
				`${chapter} dialog must be labelled by its heading`
			);
			const layers = await page.locator('dialog.reader .layers > div').count();
			assert(layers === 4, `${chapter} must document 4 layers, got ${layers}`);
			const technologies = await page
				.locator('dialog.reader .layers dt strong')
				.evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
			assert(
				JSON.stringify(technologies) === JSON.stringify(facts.technologies),
				`${chapter} technologies mismatch: expected ${JSON.stringify(
					facts.technologies
				)} got ${JSON.stringify(technologies)}`
			);
			const contextText = (
				await page.locator('dialog.reader .section-label').first().textContent()
			)?.trim();
			assert(
				contextText === facts.context,
				`${chapter} context expected "${facts.context}", got "${contextText}"`
			);
			const evidence = (await page.locator('dialog.reader .evidence-title').textContent())?.trim();
			assert(Boolean(evidence), `${chapter} must show an evidence title`);
			assert(
				(await page.locator('dialog.reader .reader-summary').count()) === 1,
				`${chapter} must show one summary`
			);
			await page.keyboard.press('Escape');
			await page.waitForSelector('dialog.reader[open]', { state: 'detached' }).catch(() => {});
			await page.waitForFunction(() => !document.querySelector('dialog.reader[open]'));
		}
		await context.close();
	});

	await runTest('4. Native dialog Escape and close restore focus to opener', async () => {
		const context = await newContext();
		const { page } = await openPage(context);
		await settleIntro(page);

		// Escape path
		const opener = page.locator('.synopsis .primary');
		await goToChapter(page, 'emesys');
		await opener.focus();
		await opener.click();
		await page.waitForSelector('dialog.reader[open]');
		assert(
			await page.evaluate(() => document.activeElement?.id === 'spatial-dialog-title'),
			'focus must move to the dialog heading'
		);
		await page.keyboard.press('Escape');
		await page.waitForFunction(() => !document.querySelector('dialog.reader[open]'));
		assert(
			await page.evaluate(
				() => document.activeElement === document.querySelector('.synopsis .primary')
			),
			'Escape must restore focus to the opener'
		);

		// Explicit close button path
		await page.locator('.synopsis .primary').click();
		await page.waitForSelector('dialog.reader[open]');
		await page.locator('dialog.reader .reader-heading button').click();
		await page.waitForFunction(() => !document.querySelector('dialog.reader[open]'));
		assert(
			await page.evaluate(
				() => document.activeElement === document.querySelector('.synopsis .primary')
			),
			'close button must restore focus to the opener'
		);
		assert(
			(await page.evaluate(() => document.body.style.overflow)) !== 'hidden',
			'scroll lock must be released after close'
		);
		await context.close();
	});

	await runTest(
		'5. Contact form validates, mocks the route and sends no real message',
		async () => {
			const context = await newContext();
			const page = await context.newPage();
			const pageErrors = [];
			page.on('pageerror', (error) => pageErrors.push(error.message));
			const submissions = [];
			// Hard block: nothing reaches web3forms, even if a selector below changes.
			await page.route('**/*', (route) => {
				const url = route.request().url();
				if (url.includes('web3forms.com')) {
					submissions.push(route.request().postDataJSON());
					return route.fulfill({
						status: 200,
						contentType: 'application/json',
						body: JSON.stringify({ success: true, message: 'ok' })
					});
				}
				return route.continue();
			});
			await page.goto(BASE_URL, { waitUntil: 'load' });
			await page.waitForSelector('.spatial[data-ready="true"]', { timeout: 20000 });
			await settleIntro(page);

			await page.locator('.header-actions .contact-action').click();
			await page.waitForSelector('dialog.reader[open] #contact-form');
			assert(
				await page.evaluate(() => document.activeElement?.id === 'spatial-dialog-title'),
				'contact dialog must focus its heading'
			);

			// Native constraints prevent submit before the custom handler runs.
			await page.locator('#contact-form button[type="submit"]').click();
			assert(
				await page.locator('#contact-name').evaluate((node) => !node.validity.valid),
				'empty name must fail native constraints'
			);
			assert(submissions.length === 0, 'empty submit must not call web3forms');

			// Invalid email -> alert, no request.
			await page.fill('#contact-name', 'QA Bot');
			await page.fill('#contact-email', 'not-an-email');
			await page.fill('#contact-message', 'QA validation probe');
			await page.locator('#contact-form button[type="submit"]').click();
			assert(
				await page.locator('#contact-email').evaluate((node) => !node.validity.valid),
				'malformed email must fail native constraints'
			);
			assert(submissions.length === 0, 'invalid email must not call web3forms');

			// Valid submit -> mocked success, focus on result heading.
			await page.fill('#contact-email', 'qa@example.com');
			await page.fill('#contact-subject', 'QA regression');
			await page.locator('#contact-form button[type="submit"]').click();
			await page.waitForSelector('dialog.reader .success h3');
			await page.waitForFunction(
				() => document.activeElement === document.querySelector('dialog.reader .success h3')
			);
			assert(
				submissions.length === 1,
				`expected exactly one intercepted submit, got ${submissions.length}`
			);
			const payload = submissions[0] || {};
			assert(
				typeof payload.access_key === 'string' && payload.access_key.length > 0,
				'mocked payload must carry the access key'
			);
			assert(
				typeof payload.subject === 'string' && payload.subject.includes('QA regression'),
				'mocked payload must carry the QA subject'
			);
			assert(
				typeof payload.message === 'string' && payload.message.includes('QA validation probe'),
				'mocked payload must carry the QA message'
			);
			assert(
				(await page.locator('dialog.reader .success[role="status"]').count()) === 1,
				'success panel must expose a status region'
			);
			assert(pageErrors.length === 0, `unexpected page errors: ${pageErrors.join('; ')}`);
			await context.close();
		}
	);

	await runTest('6. Language toggle BM <-> EN updates html lang and copy', async () => {
		const context = await newContext();
		const { page } = await openPage(context);
		await settleIntro(page);

		assert(
			(await page.locator('html').getAttribute('lang')) === 'ms',
			'default language must be ms'
		);
		assert(
			(await page.locator('.skip').textContent())?.includes('Langkau'),
			'BM skip link copy expected'
		);
		assert(
			(
				await page.locator('.chapter-nav button[data-chapter="background"]').textContent()
			)?.includes('Latar belakang'),
			'BM chapter label expected'
		);

		await page.locator('.header-actions nav button, .header-actions button').first().click();
		await page.waitForFunction(() => document.documentElement.lang === 'en');
		assert(
			(await page.locator('html').getAttribute('lang')) === 'en',
			'html lang must switch to en'
		);
		assert(
			(await page.locator('.skip').textContent())?.includes('Skip'),
			'EN skip link copy expected'
		);
		assert(
			(
				await page.locator('.chapter-nav button[data-chapter="background"]').textContent()
			)?.includes('Background'),
			'EN chapter label expected'
		);
		assert(
			(await page.locator('.sr-only[aria-live="polite"]').first().textContent())?.trim().length > 0,
			'language change must announce through a live region'
		);

		await page.locator('.header-actions nav button, .header-actions button').first().click();
		await page.waitForFunction(() => document.documentElement.lang === 'ms');
		assert(
			(await page.locator('html').getAttribute('lang')) === 'ms',
			'html lang must return to ms'
		);
		await context.close();
	});

	await runTest('7. No horizontal overflow at 320, 390, landscape and desktop', async () => {
		for (const viewport of [
			{ width: 320, height: 568, label: '320x568' },
			{ width: 390, height: 844, label: '390x844' },
			{ width: 844, height: 390, label: 'landscape 844x390' },
			{ width: 1440, height: 900, label: '1440x900' }
		]) {
			const context = await newContext({ viewport });
			const { page } = await openPage(context);
			await settleIntro(page);
			for (const chapter of ['intro', 'cv_bot', 'background']) {
				await goToChapter(page, chapter);
				const metrics = await page.evaluate(() => ({
					scrollWidth: document.documentElement.scrollWidth,
					innerWidth: window.innerWidth
				}));
				assert(
					metrics.scrollWidth <= metrics.innerWidth + 1,
					`${viewport.label} ${chapter} overflows: scrollWidth ${metrics.scrollWidth} > innerWidth ${metrics.innerWidth}`
				);
				assert(
					(await page.locator('main h1').count()) === 1,
					`${viewport.label} ${chapter} must keep exactly one h1`
				);
			}
			await context.close();
		}
	});

	await runTest('8. Reduced motion: static frames, no dead motion buttons', async () => {
		const context = await newContext({ reducedMotion: 'reduce' });
		const { page } = await openPage(context);
		await page.waitForFunction(() => window.__spatialDiagnostic?.intro === false);

		assert(
			(await page.locator('.spatial').getAttribute('data-reduced-motion')) === 'true',
			'reduced motion must be reported on the root'
		);
		assert(
			(await page.locator('.spatial').getAttribute('data-motion')) === 'reduced',
			'data-motion must be reduced'
		);
		const playbackButtons = await page
			.locator('.playback button')
			.evaluateAll((nodes) =>
				nodes.map((node) => ({ disabled: node.disabled, label: node.textContent.trim() }))
			);
		assert(playbackButtons.length > 0, 'reduced mode must not hide the whole motion control group');
		assert(playbackButtons[0].disabled, 'pause is unavailable without motion');
		await goToChapter(page, 'onboardx');
		await page.locator('.playback button').last().click();
		assert(
			(await diagnostic(page)).chapter === 'intro',
			'replay must select the static intro in reduced motion'
		);

		const stage = await goToChapter(page, 'background');
		const { actual, diffs } = await poseDiff(page, POSES[stage]);
		assert(diffs.length === 0, `reduced pose must equal static frame, diff ${diffs.join(', ')}`);
		assert(
			(await page.locator('.spatial').getAttribute('data-paused')) !== 'true',
			`reduced mode must not fake a paused state, pose ${JSON.stringify(actual)}`
		);
		await context.close();
	});

	await runTest(
		'9. WebGL context loss falls back permanently, all chapters still work',
		async () => {
			const context = await newContext();
			const { page, pageErrors } = await openPage(context);
			await settleIntro(page);

			const lost = await page.evaluate(() => {
				const canvas = document.querySelector('.world canvas');
				const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl');
				const ext = gl?.getExtension('WEBGL_lose_context');
				if (!ext) return false;
				ext.loseContext();
				return true;
			});
			assert(lost, 'WEBGL_lose_context extension must be available for this test');
			await page.waitForSelector('.spatial[data-renderer="static-svg"]', { timeout: 10000 });
			assert(
				(await page.locator('.spatial').getAttribute('data-motion')) === 'static',
				'fallback must report static motion'
			);
			assert(
				(await page.locator('.static-world svg').count()) > 0,
				'fallback must render a static SVG'
			);
			assert(
				(await page.locator('.playback').count()) === 0,
				'fallback must remove motion buttons rather than leave dead controls'
			);
			const status = (await page.locator('.scene-notes [role="status"]').textContent())?.trim();
			assert(Boolean(status), 'fallback must announce status text');
			for (const chapter of CHAPTERS) {
				await goToChapter(page, chapter);
				assert(
					(await page.locator('.spatial').getAttribute('data-chapter')) === chapter,
					`fallback chapter ${chapter} must remain navigable`
				);
			}
			assert((await page.locator('main h1').count()) === 1, 'fallback must keep exactly one h1');
			assert(pageErrors.length === 0, `unexpected page errors: ${pageErrors.join('; ')}`);
			await context.close();
		}
	);

	await runTest('10. Pause survives resize and preserves the numeric pose', async () => {
		const context = await newContext();
		const { page } = await openPage(context);
		await settleIntro(page);
		await goToChapter(page, 'emesys');

		const pauseButton = page.locator('.playback button').first();
		if ((await pauseButton.getAttribute('aria-pressed')) !== 'true') {
			await pauseButton.click();
		}
		await page.waitForFunction(() => document.querySelector('.spatial')?.dataset.paused === 'true');
		const before = await diagnostic(page);
		await page.waitForTimeout(400);
		const stillBefore = await diagnostic(page);
		assert(
			POSE_FIELDS.every((field) => nearlyEqual(before.pose[field], stillBefore.pose[field], 0.001)),
			`paused pose must not drift: ${JSON.stringify(before.pose)} -> ${JSON.stringify(stillBefore.pose)}`
		);
		assert(
			Math.abs(before.timelineTime - stillBefore.timelineTime) < 0.05,
			`paused timeline must not advance: ${before.timelineTime} -> ${stillBefore.timelineTime}`
		);

		await page.setViewportSize({ width: 1024, height: 700 });
		await page.waitForTimeout(500);
		const after = await diagnostic(page);
		assert(
			(await page.locator('.spatial').getAttribute('data-paused')) === 'true',
			'pause must survive a resize'
		);
		const diffs = POSE_FIELDS.filter(
			(field) => !nearlyEqual(before.pose[field], after.pose[field], 0.001)
		);
		assert(
			diffs.length === 0,
			`resize changed paused pose on ${diffs.join(', ')}: ${JSON.stringify(
				before.pose
			)} -> ${JSON.stringify(after.pose)}`
		);
		assert(
			after.camera.every(
				(value, index) => Number.isFinite(value) && nearlyEqual(value, before.camera[index], 0.001)
			),
			`resize must preserve paused camera position, got ${JSON.stringify(after.camera)}`
		);
		assert(
			(await page.locator('.spatial').getAttribute('data-renderer')) === 'webgl',
			'resize must not destroy the WebGL renderer'
		);
		await context.close();
	});

	await runTest('11. Motion controls are live: pause, replay and skip', async () => {
		const context = await newContext();
		const { page } = await openPage(context);
		await settleIntro(page);

		const pauseButton = page.locator('.playback button').first();
		await pauseButton.click();
		await page.waitForFunction(() => document.querySelector('.spatial')?.dataset.paused === 'true');
		assert(
			(await pauseButton.getAttribute('aria-pressed')) === 'true',
			'pause button must expose aria-pressed=true'
		);
		await pauseButton.click();
		await page.waitForFunction(
			() => document.querySelector('.spatial')?.dataset.paused === 'false'
		);
		assert(
			(await pauseButton.getAttribute('aria-pressed')) === 'false',
			'resume must reset aria-pressed'
		);

		const replay = page.locator('.playback button').nth(1);
		assert(
			(await replay.textContent())?.toLowerCase().includes('ulang'),
			'replay button copy expected in BM'
		);
		await replay.click();
		await page.waitForFunction(
			() => document.querySelector('.spatial')?.dataset.motion === 'intro',
			null,
			{
				timeout: 10000
			}
		);
		assert(
			(await page
				.locator('.chapter-nav button[aria-current="step"]')
				.getAttribute('data-chapter')) === 'intro',
			'replay must select the intro chapter'
		);
		const skip = page.locator('.playback button').nth(1);
		await skip.click();
		await page.waitForFunction(() => window.__spatialDiagnostic?.intro === false);
		assert(
			(await page.locator('.spatial').getAttribute('data-motion')) !== 'intro',
			'skip must leave the intro motion state'
		);
		await context.close();
	});
} finally {
	await browser?.close();
}

const failed = results.filter((result) => !result.passed);
console.log('\n--------------------------------------------------');
console.log(`Assertions: ${assertions} | Tests: ${results.length} | Failed: ${failed.length}`);
if (failed.length > 0) {
	for (const failure of failed) console.error(`FAILED: ${failure.name}\n  ${failure.error}`);
	console.log('--------------------------------------------------\n');
	process.exit(1);
}
console.log('All portfolio regression checks passed.');
console.log('--------------------------------------------------\n');
