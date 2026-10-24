import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const cachedPlaywright =
	'C:/Users/KELUARGA AZMI/AppData/Local/npm-cache/_npx/f70ed744217c9448/node_modules/playwright/index.mjs';
export const SECTION_IDS = ['intro', 'emesys', 'onboardx', 'cv_bot', 'about', 'contact'];
export const targetURL = process.env.MOTION_URL || 'http://127.0.0.1:4200/';
export const artifactRoot = path.resolve(
	process.env.MOTION_ARTIFACT_DIR || '.crew/artifacts/motion'
);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function loadPlaywright() {
	const modulePath = process.env.PLAYWRIGHT_MODULE || cachedPlaywright;
	return import(
		/^[a-z]+:/i.test(modulePath) && !/^[a-z]:[\\/]/i.test(modulePath)
			? modulePath
			: pathToFileURL(path.resolve(modulePath)).href
	);
}

export async function installHarness(context) {
	const network = { mode: 'success', requests: [], blocked: [] };
	// Context-wide interception includes popups and requests made outside the active page.
	// External traffic is denied by default; Web3Forms can never reach the network.
	const origin = new URL(targetURL).origin;
	await context.route('**/*', async (route) => {
		const request = route.request();
		const url = new URL(request.url());
		if (/(^|\.)web3forms\.com$/i.test(url.hostname)) {
			network.requests.push({
				url: request.url(),
				method: request.method(),
				body: request.postData(),
				mode: network.mode
			});
			if (network.mode === 'networkfail') return route.abort('failed');
			const success = network.mode === 'success';
			return route.fulfill({
				status: success ? 200 : 422,
				contentType: 'application/json',
				body: JSON.stringify({
					success,
					message: success ? 'Form submitted successfully' : 'Mock validation error'
				})
			});
		}
		if (url.origin === origin || ['data:', 'blob:', 'about:'].includes(url.protocol))
			return route.continue();
		network.blocked.push(request.url());
		return route.abort('blockedbyclient');
	});
	await context.addInitScript(() => {
		const metrics = (window.__motionLabMetrics = {
			lcp: null,
			cls: 0,
			observations: [],
			source: 'local lab PerformanceObserver; not field Web Vitals; no INP estimate'
		});
		try {
			new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					metrics.lcp = entry.startTime;
					metrics.observations.push({
						type: entry.entryType,
						startTime: entry.startTime,
						size: entry.size
					});
				}
			}).observe({ type: 'largest-contentful-paint', buffered: true });
		} catch {
			metrics.lcpUnsupported = true;
		}
		try {
			new PerformanceObserver((list) => {
				for (const entry of list.getEntries())
					if (!entry.hadRecentInput) metrics.cls += entry.value;
			}).observe({ type: 'layout-shift', buffered: true });
		} catch {
			metrics.clsUnsupported = true;
		}
	});
	return network;
}

export async function settle(page) {
	await page.waitForLoadState('domcontentloaded');
	await page.evaluate(() => document.fonts?.ready);
	await page.waitForTimeout(180);
}

export async function switchToEnglish(page) {
	if (/^en(?:-|$)/i.test((await page.locator('html').getAttribute('lang')) || ''))
		return { alreadyEnglish: true };
	const buttons = page.getByRole('button', {
		name: /^(en|english|switch to english|change language to english)$/i
	});
	if (await buttons.count()) {
		await buttons.first().click();
	} else {
		const select = page.locator('select').filter({ has: page.locator('option[value="en"]') });
		if (await select.count()) await select.first().selectOption('en');
		else {
			const link = page.getByRole('link', { name: /^(en|english)$/i });
			if (await link.count()) await link.first().click();
			else return { unavailable: true, lang: await page.locator('html').getAttribute('lang') };
		}
	}
	await settle(page);
	return { switched: true, lang: await page.locator('html').getAttribute('lang') };
}

export async function sectionState(page, id) {
	const section = page.locator(`#${id}`);
	await section.evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
	await page.waitForFunction((sectionId) => {
		const element = document.getElementById(sectionId);
		if (!element) return false;
		const rect = element.getBoundingClientRect();
		return rect.bottom > 0 && rect.top < innerHeight;
	}, id);
	await page.waitForTimeout(200);
	return section.evaluate((element) => {
		const rect = element.getBoundingClientRect();
		return {
			id: element.id,
			top: rect.top,
			bottom: rect.bottom,
			width: rect.width,
			marker:
				element.dataset.motionSection ??
				element.closest('[data-motion-section]')?.getAttribute('data-motion-section') ??
				element.querySelector('[data-motion-section]')?.getAttribute('data-motion-section') ??
				null,
			scrollY,
			diagnostic: window.__motionDiagnostic ?? null
		};
	});
}

export async function fillContact(page) {
	await page.locator('#contact-name').fill('Motion Regression');
	await page.locator('#contact-email').fill('motion-regression@example.com');
	const subject = page.locator('#contact-subject');
	if (await subject.evaluate((element) => element.tagName === 'SELECT')) {
		const value = await subject
			.locator('option')
			.evaluateAll((options) => options.find((option) => option.value && !option.disabled)?.value);
		if (!value) throw new Error('Contact subject has no enabled nonempty option');
		await subject.selectOption(value);
	} else await subject.fill('Portfolio regression inquiry');
	await page
		.locator('#contact-message')
		.fill(
			'Automated local regression only. All contact requests are intercepted and never delivered.'
		);
}

export async function contactFeedback(page) {
	return page.locator('#contact').evaluate((scope) => {
		const form = scope.querySelector('#contact-form');
		const statuses = [
			...scope.querySelectorAll(
				'[role="status"], [role="alert"], [aria-live], .success, .error, [data-status]'
			)
		];
		return {
			text: scope.innerText,
			states: statuses.map((node) => ({
				role: node.getAttribute('role'),
				live: node.getAttribute('aria-live'),
				text: node.textContent?.trim()
			})),
			formPresent: !!form,
			disabled: !!form?.querySelector('[type="submit"]:disabled')
		};
	});
}

export async function run() {
	await mkdir(artifactRoot, { recursive: true });
	const report = {
		suite: 'motion-regression',
		url: targetURL,
		startedAt: new Date().toISOString(),
		checks: [],
		observations: {},
		errors: []
	};
	const check = (name, passed, detail = null) => {
		report.checks.push({ name, passed: !!passed, detail });
	};
	let browser;
	try {
		const { chromium } = await loadPlaywright();
		browser = await chromium.launch({ headless: true });
		const context = await browser.newContext({
			viewport: { width: 1440, height: 900 },
			serviceWorkers: 'block'
		});
		const network = await installHarness(context);
		const page = await context.newPage();
		const dialogs = [];
		page.on('dialog', async (dialog) => {
			dialogs.push({ type: dialog.type(), message: dialog.message() });
			await dialog.dismiss();
		});
		page.on('pageerror', (error) => report.errors.push(error.message));

		const response = await context.request.get(targetURL);
		check('SSR HTTP response is successful', response.ok(), response.status());
		const html = await response.text();
		// Parse the actual response in a script-disabled browser document, not hydrated DOM.
		const ssr = await context.newPage();
		await ssr.route('**/*', (route) => route.abort());
		await ssr.setContent(html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, ''));
		for (const id of SECTION_IDS)
			check(`SSR includes #${id}`, (await ssr.locator(`#${id}`).count()) === 1);
		check('SSR has exactly one h1', (await ssr.locator('h1').count()) === 1);
		check('SSR has exactly one main', (await ssr.locator('main').count()) === 1);
		await ssr.close();
		await page.goto(targetURL, { waitUntil: 'domcontentloaded' });
		await settle(page);
		check('Hydrated document has exactly one h1', (await page.locator('h1').count()) === 1);
		check('Hydrated document has exactly one main', (await page.locator('main').count()) === 1);
		const scroll = await page.evaluate(() => ({
			height: document.scrollingElement.scrollHeight,
			viewport: innerHeight,
			overflow: getComputedStyle(document.documentElement).overflowY,
			bodyOverflow: getComputedStyle(document.body).overflowY
		}));
		check('Native document is longer than viewport', scroll.height > scroll.viewport, scroll);
		check(
			'Native document scrolling is not disabled',
			!['hidden', 'clip'].includes(scroll.overflow) &&
				!['hidden', 'clip'].includes(scroll.bodyOverflow),
			scroll
		);
		check(
			'No open dialog UI',
			(await page
				.locator('dialog[open], [role="dialog"]:visible, [aria-modal="true"]:visible')
				.count()) === 0
		);
		const anchors = await page.locator('a[href^="#"]').evaluateAll((links) =>
			links.map((link) => {
				const href = link.getAttribute('href');
				let target = null;
				try {
					target =
						href.length > 1 ? document.getElementById(decodeURIComponent(href.slice(1))) : null;
				} catch {}
				return { href, exists: !!target, text: link.textContent.trim() };
			})
		);
		check('Real in-page anchors exist', anchors.length > 0, anchors);
		check(
			'Every in-page anchor resolves to an element',
			anchors.length > 0 && anchors.every((anchor) => anchor.exists),
			anchors
		);
		for (const id of SECTION_IDS) {
			check(`Hydrated #${id} exists uniquely`, (await page.locator(`#${id}`).count()) === 1);
			const state = await sectionState(page, id);
			check(`#${id} is reachable by native scroll`, state.bottom > 0 && state.top < 900, state);
		}
		const firstAnchor = anchors.find((anchor) => !['#intro', '#main'].includes(anchor.href));
		if (firstAnchor) {
			await page.locator(`a[href="${firstAnchor.href}"]`).first().click();
			await page.waitForFunction((hash) => location.hash === hash, firstAnchor.href);
			check(
				'Anchor navigation updates native location hash',
				new URL(page.url()).hash === firstAnchor.href
			);
		} else check('Anchor navigation updates native location hash', false, 'No non-intro anchor');

		report.observations.viewports = [];
		for (const viewport of [
			{ width: 320, height: 740 },
			{ width: 390, height: 844 },
			{ width: 768, height: 1024 },
			{ width: 1440, height: 900 },
			{ width: 844, height: 390 }
		]) {
			await page.setViewportSize(viewport);
			await settle(page);
			const geometry = await page.evaluate(
				(ids) => ({
					width: innerWidth,
					documentWidth: document.documentElement.scrollWidth,
					sections: ids.map((id) => {
						const r = document.getElementById(id).getBoundingClientRect();
						return { id, left: r.left, right: r.right, width: r.width };
					}),
					clippedControls: [
						...document.querySelectorAll('a, button, input:not([type="hidden"]), textarea, select')
					]
						.filter((el) => {
							if (el.matches('a[href="#main"]')) return false;
							const r = el.getBoundingClientRect();
							const style = getComputedStyle(el);
							return (
								r.width > 0 &&
								r.height > 0 &&
								style.visibility !== 'hidden' &&
								(r.left < -2 || r.right > innerWidth + 2)
							);
						})
						.map((el) => ({ tag: el.tagName, id: el.id, text: el.textContent.trim().slice(0, 80) }))
				}),
				SECTION_IDS
			);
			report.observations.viewports.push({ viewport, geometry });
			check(
				`${viewport.width}x${viewport.height}: no horizontal document overflow`,
				geometry.documentWidth <= viewport.width + 2,
				geometry
			);
			check(
				`${viewport.width}x${viewport.height}: section boxes fit viewport`,
				geometry.sections.every(
					(s) => s.width > 0 && s.left >= -2 && s.right <= viewport.width + 2
				),
				geometry.sections
			);
			check(
				`${viewport.width}x${viewport.height}: interactive controls are not horizontally clipped`,
				geometry.clippedControls.length === 0,
				geometry.clippedControls
			);
		}
		await page.setViewportSize({ width: 1440, height: 900 });
		const language = await switchToEnglish(page);
		report.observations.language = language;
		check(
			'English language state is available',
			/^en(?:-|$)/i.test((await page.locator('html').getAttribute('lang')) || ''),
			language
		);
		await sectionState(page, 'contact');
		check('Contact form exists uniquely', (await page.locator('#contact-form').count()) === 1);
		for (const id of ['contact-name', 'contact-email', 'contact-subject', 'contact-message']) {
			check(
				`Contact field #${id} exists and is labelled`,
				(await page.locator(`#${id}`).count()) === 1 &&
					(await page
						.locator(`#${id}`)
						.evaluate(
							(el) =>
								!!(
									el.labels?.length ||
									el.getAttribute('aria-label') ||
									el.getAttribute('aria-labelledby')
								)
						))
			);
		}
		const form = page.locator('#contact-form');
		const submit = form.locator('button[type="submit"], input[type="submit"]');
		await form.evaluate((el) => el.reset());
		const beforeEmpty = network.requests.length;
		await submit.click();
		check(
			'Empty contact form fails native validation',
			await form.evaluate((el) => !el.checkValidity())
		);
		check('Empty contact form sends no request', network.requests.length === beforeEmpty);
		await fillContact(page);
		await page.locator('#contact-email').fill('not-an-email');
		check(
			'Invalid email fails native validation',
			await page.locator('#contact-email').evaluate((el) => !el.checkValidity())
		);
		await page.locator('#contact-email').fill('motion-regression@example.com');
		check(
			'Filled contact form passes native validation',
			await form.evaluate((el) => el.checkValidity())
		);
		const feedbackStates = {};
		for (const mode of ['error', 'networkfail', 'success']) {
			network.mode = mode;
			await fillContact(page);
			const before = network.requests.length;
			await submit.click();
			await page.waitForFunction(
				() => {
					const form = document.getElementById('contact-form');
					return !form || !form.querySelector('[type="submit"]:disabled');
				},
				null,
				{ timeout: 15000 }
			);
			for (let attempt = 0; attempt < 60 && network.requests.length === before; attempt++)
				await delay(100);
			check(`Contact ${mode} request was intercepted`, network.requests.length > before);
			const expected =
				mode === 'success'
					? /thank|success|sent|terkirim|berhasil/i
					: /error|fail|wrong|unable|try again|gagal|kesalahan|coba lagi/i;
			await page.waitForFunction(
				({ pattern }) => {
					return new RegExp(pattern, 'i').test(document.getElementById('contact').innerText);
				},
				{ pattern: expected.source },
				{ timeout: 15000 }
			);
			feedbackStates[mode] = await contactFeedback(page);
			check(
				`Contact ${mode} displays feedback`,
				expected.test(feedbackStates[mode].text),
				feedbackStates[mode]
			);
			check(`Contact ${mode} finishes pending state`, !feedbackStates[mode].disabled);
			if (mode === 'success' && !feedbackStates[mode].formPresent) {
				await page
					.locator('#contact')
					.getByRole('button', { name: /send another|another message|hantar.*lagi/i })
					.click();
				await page.locator('#contact-name').waitFor({ state: 'visible' });
				check(
					'Success reset restores contact form',
					(await page.locator('#contact-form').count()) === 1
				);
			}
		}
		report.observations.contact = feedbackStates;
		report.observations.network = network;

		await page.evaluate(() => scrollTo(0, 0));
		await page.waitForTimeout(1200);
		const diagnostic = () =>
			page.evaluate(() =>
				window.__motionDiagnostic ? JSON.parse(JSON.stringify(window.__motionDiagnostic)) : null
			);
		const beforeIdle = await diagnostic();
		await page.waitForTimeout(1200);
		const afterIdle = await diagnostic();
		report.observations.diagnostic = { beforeIdle, afterIdle };
		check('Motion diagnostic is exposed', !!afterIdle);
		// Accept field names used by the implementation, but never synthesize passing values.
		const frameKey =
			afterIdle &&
			['renders', 'frameCount', 'frames', 'renderCount', 'renderedFrames', 'frame'].find((key) =>
				Number.isFinite(afterIdle[key])
			);
		check('Diagnostic exposes a numeric frame counter', !!frameKey, afterIdle);
		if (frameKey)
			check(
				'Idle rendering is bounded (at most 4 frames / 1.2s)',
				afterIdle[frameKey] - beforeIdle[frameKey] >= 0 &&
					afterIdle[frameKey] - beforeIdle[frameKey] <= 4,
				{ key: frameKey, delta: afterIdle[frameKey] - beforeIdle[frameKey] }
			);
		for (let index = 0; index < SECTION_IDS.length; index++) {
			await sectionState(page, SECTION_IDS[index]);
			await page.waitForFunction(
				(expected) => {
					const diagnostic = window.__motionDiagnostic;
					return (
						diagnostic &&
						(diagnostic.section === expected ||
							diagnostic.section ===
								['intro', 'emesys', 'onboardx', 'cv_bot', 'about', 'contact'][expected])
					);
				},
				index,
				{ timeout: 10000 }
			);
			const snapshot = await diagnostic();
			check(
				`Diagnostic tracks ${SECTION_IDS[index]}`,
				snapshot.section === index || snapshot.section === SECTION_IDS[index],
				snapshot
			);
			check(
				`Diagnostic progress is finite at ${SECTION_IDS[index]}`,
				Number.isFinite(snapshot.progress),
				snapshot
			);
		}
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.waitForTimeout(400);
		check(
			'Reduced-motion preference changes live',
			await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
		);
		await page.waitForFunction(() => window.__motionDiagnostic?.reduced === true, null, {
			timeout: 10000
		});
		check(
			'Renderer diagnostic responds to live reduced motion',
			(await diagnostic())?.reduced === true
		);
		const reducedBefore = await diagnostic();
		await page.waitForTimeout(1200);
		const reducedAfter = await diagnostic();
		report.observations.reducedMotion = { before: reducedBefore, after: reducedAfter };
		if (frameKey)
			check(
				'Reduced-motion idle rendering is bounded',
				reducedAfter?.[frameKey] - reducedBefore?.[frameKey] >= 0 &&
					reducedAfter?.[frameKey] - reducedBefore?.[frameKey] <= 4
			);
		const contextLoss = await page.evaluate(() => {
			for (const canvas of document.querySelectorAll('canvas')) {
				const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
				const extension = gl?.getExtension('WEBGL_lose_context');
				if (extension) {
					extension.loseContext();
					return { exercised: true };
				}
			}
			return {
				exercised: false,
				reason: 'No live WebGL context with WEBGL_lose_context extension'
			};
		});
		report.observations.contextLoss = contextLoss;
		check('WebGL context loss can be exercised', contextLoss.exercised, contextLoss);
		await page.waitForTimeout(400);
		await sectionState(page, 'contact');
		check(
			'Native contact remains reachable after context loss',
			await page.locator('#contact-name').isVisible()
		);
		check('No unexpected JavaScript errors', report.errors.length === 0, report.errors);
		check('No native dialogs opened', dialogs.length === 0, dialogs);
		report.observations.performance = await page.evaluate(() => window.__motionLabMetrics);
		await context.close();
	} catch (error) {
		report.errors.push(error.stack || String(error));
		report.checks.push({
			name: 'Suite completed without interruption',
			passed: false,
			detail: error.message
		});
	} finally {
		await browser?.close();
		report.finishedAt = new Date().toISOString();
		report.summary = {
			assertions: report.checks.length,
			passed: report.checks.filter((c) => c.passed).length,
			failed: report.checks.filter((c) => !c.passed).length
		};
		const output = path.join(artifactRoot, 'motion-regression.json');
		await writeFile(output, JSON.stringify(report, null, 2));
		console.log(JSON.stringify({ output, ...report.summary }, null, 2));
		if (report.summary.failed || report.checks.length <= 25) process.exitCode = 1;
	}
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href)
	await run();
