import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

// Reuse an existing Playwright installation; no project dependency is required.
const { chromium } = await import(
	process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright'
);
const url = process.env.UI_URL || 'http://localhost:4180';
const out = process.env.UI_ARTIFACTS || '.crew/artifacts/pixel-integration';
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({
	viewport: { width: 1440, height: 1000 },
	reducedMotion: 'reduce'
});
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const results = [];
async function check(name, fn) {
	await fn();
	results.push(name);
	console.log(`PASS ${name}`);
}
async function settled() {
	await page.waitForTimeout(350);
}
async function unlocked() {
	await settled();
	assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden');
}
async function oneModal() {
	assert.equal(await page.locator(':modal').count(), 1);
}
try {
	await page.goto(url);
	await page.locator('.hero-btn-pres').waitFor();
	await page.waitForFunction(
		() =>
			document.querySelector('.telem-value')?.textContent !== '00:00:00 MYT' &&
			document.querySelector('html')?.lang === localStorage.getItem('lang')
	);
	await page.waitForTimeout(1000);
	await settled();
	for (const language of ['ms', 'en']) {
		if ((await page.locator('html').getAttribute('lang')) !== language)
			await page.locator('#lang-toggle-btn').click();
		await check(
			`${language}: Hero → deck → Escape restores actual opener; labels are strings`,
			async () => {
				await page.locator('.hero-btn-pres').click();
				await page.locator('.deck[open]').waitFor();
				for (let i = 0; i < 8; i++) {
					await page.locator('.rail-tab').nth(i).click();
					assert.ok(!(await page.locator('.deck').innerText()).includes('[object Object]'));
				}
				assert.ok(!(await page.locator('.deck').innerText()).includes('[object Object]'));
				await page.keyboard.press('Control+k');
				await page.evaluate(() => window.dispatchEvent(new CustomEvent('open-jarvis')));
				await oneModal();
				assert.equal(await page.locator('#neural-cortex-dialog').getAttribute('open'), null);
				await page.keyboard.press('Escape');
				await unlocked();
				assert.equal(
					await page.locator('.hero-btn-pres').evaluate((el) => el === document.activeElement),
					true
				);
			}
		);
		await check(`${language}: details retain Arrow/Home/End keys`, async () => {
			await page.locator('.hero-btn-pres').click();
			await page.locator('.rail-tab').nth(2).click();
			const summary = page.locator('.deck summary:visible').first();
			await summary.click();
			const chapter = await page.locator('.rail-tab[aria-current="step"]').innerText();
			for (const key of ['ArrowRight', 'ArrowLeft', 'Home', 'End']) await summary.press(key);
			assert.equal(await page.locator('.rail-tab[aria-current="step"]').innerText(), chapter);
			await page.keyboard.press('Escape');
			await unlocked();
		});
		await check(
			`${language}: typing shortcuts and prevented events do not open console`,
			async () => {
				await page.locator('#contact-name').fill('Keyboard regression');
				await page.locator('#contact-name').press('Control+k');
				await page.locator('#contact-message').fill('Draft only; never submitted');
				await page.locator('#contact-message').press('Meta+j');
				await page.evaluate(() => {
					const e = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true });
					e.preventDefault();
					window.dispatchEvent(e);
				});
				await page.evaluate(() => {
					const editor = document.createElement('div');
					editor.id = 'test-editor';
					editor.contentEditable = 'true';
					document.body.append(editor);
					editor.focus();
				});
				await page.keyboard.press('Control+k');
				assert.equal(await page.locator(':modal').count(), 0);
				await page.locator('#test-editor').evaluate((el) => el.remove());
			}
		);
		await check(`${language}: console modes, typing, no nested deck, shared unlock`, async () => {
			await page.locator('.cortex-launcher').click();
			await page.locator('#cortex-input').fill('experience');
			await page.locator('#cortex-input').press('Control+k');
			await oneModal();
			await page.locator('#cortex-input').press('Enter');
			await page.locator('.mode-nav button').nth(1).click();
			await page.locator('#cortex-project').selectOption('adims');
			await page.locator('#cortex-project').press('Control+j');
			await oneModal();
			await page.locator('.mode-nav button').nth(2).click();
			await page.locator('#cortex-input').fill('help');
			await page.locator('#cortex-input').press('Enter');
			await page.evaluate(() => window.dispatchEvent(new CustomEvent('open-presentation')));
			await oneModal();
			assert.equal(await page.locator('.deck').count(), 0);
			await page.keyboard.press('Escape');
			await unlocked();
		});
		await check(
			`${language}: project modal blocks both launch paths; restores focus and scroll`,
			async () => {
				const opener = page.locator('.btn-card-specs').first();
				await opener.click();
				await page.locator('.specs-modal[open]').waitFor();
				await page.keyboard.press('Control+k');
				await page.evaluate(() => {
					window.dispatchEvent(new CustomEvent('open-jarvis'));
					window.dispatchEvent(new CustomEvent('open-presentation'));
				});
				await oneModal();
				assert.equal(await page.locator('.deck').count(), 0);
				await page.keyboard.press('Escape');
				await unlocked();
				assert.equal(await opener.evaluate((el) => el === document.activeElement), true);
			}
		);
	}
	await check('reference-counted scroll locks preserve original inline values', async () => {
		assert.equal(
			await page.evaluate(async () => {
				const { acquireScrollLock, releaseScrollLock } =
					await import('/src/lib/deck/focus-utils.ts');
				const body = document.body;
				const before = [body.style.overflow, body.style.paddingRight];
				body.style.overflow = 'auto';
				body.style.paddingRight = '7px';
				acquireScrollLock();
				acquireScrollLock();
				releaseScrollLock();
				const kept = body.style.overflow === 'hidden';
				releaseScrollLock();
				const restored = body.style.overflow === 'auto' && body.style.paddingRight === '7px';
				[body.style.overflow, body.style.paddingRight] = before;
				return kept && restored;
			}),
			true
		);
	});
	for (const width of [1440, 320]) {
		await page.setViewportSize({ width, height: 844 });
		await page.goto(url);
		await page.waitForTimeout(1200);
		if (width === 320) await page.locator('#mobile-menu-toggle').click();
		await check(
			`${width}px: extended Tab walk reaches controls beyond CLI's 60-step budget`,
			async () => {
				await page.evaluate(() => {
					document.activeElement?.blur();
					window.scrollTo(0, 0);
				});
				const required = [
					'fab-present-btn',
					'cortex-launcher',
					'contact-message',
					'contact-submit'
				];
				const seen = new Set();
				for (let i = 0; i < 180 && seen.size < required.length; i++) {
					await page.keyboard.press('Tab');
					const active = await page.evaluate(() => {
						const el = document.activeElement;
						return el?.matches('.cortex-launcher')
							? 'cortex-launcher'
							: el?.matches('#contact-form button[type="submit"]')
								? 'contact-submit'
								: el?.id;
					});
					if (required.includes(active)) seen.add(active);
				}
				assert.deepEqual([...seen].sort(), required.sort());
			}
		);
	}
	for (const width of [1440, 390, 320]) {
		await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
		await page.goto(url);
		await page.waitForTimeout(1200);
		await settled();
		await check(`${width}px: no horizontal page overflow`, async () => {
			assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
		});
		await page.screenshot({ path: `${out}/home-${width}.png`, fullPage: true });
		await page.screenshot({ path: `${out}/hero-${width}.png` });
		await page.locator('.cortex-launcher').click();
		await settled();
		await check(
			`${width}px: console controls have pointer-sized unobscured hit regions`,
			async () => {
				const blocked = await page
					.locator('.language-switch button, .close-control, .audio-controls button:not(:disabled)')
					.evaluateAll((controls) =>
						controls.flatMap((el) => {
							const r = el.getBoundingClientRect();
							const points = [
								[0.3, 0.3],
								[0.5, 0.5],
								[0.7, 0.7]
							];
							return r.width < 24 ||
								r.height < 24 ||
								points.some(
									([x, y]) =>
										!el.contains(
											document.elementFromPoint(r.left + r.width * x, r.top + r.height * y)
										)
								)
								? [el.textContent]
								: [];
						})
					);
				assert.deepEqual(blocked, []);
			}
		);
		await page.screenshot({ path: `${out}/console-${width}.png` });
		await page.keyboard.press('Escape');
		await page.locator('.hero-btn-pres').click();
		await settled();
		await page.screenshot({ path: `${out}/deck-${width}.png` });
		await page.keyboard.press('Escape');
		if (width < 600) {
			await page.locator('#mobile-menu-toggle').click();
			await page.screenshot({ path: `${out}/menu-${width}.png` });
			await page.keyboard.press('Escape');
			assert.equal(
				await page.locator('#mobile-menu-toggle').getAttribute('aria-expanded'),
				'false'
			);
		}
	}
	assert.deepEqual(errors, []);
	await writeFile(
		`${out}/regression.json`,
		JSON.stringify({ results, pageErrors: errors }, null, 2)
	);
} finally {
	await browser.close();
}
