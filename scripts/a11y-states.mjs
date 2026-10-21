// a11y-loop 0.4.1 runs five baseline passes; each interaction gets a fresh default-mode page.
async function language(page, code) {
	await page.locator('.hero-btn-pres').waitFor();
	await page.waitForFunction(() => document.documentElement.lang === localStorage.getItem('lang'));
	await page.waitForTimeout(500);
	if ((await page.locator('html').getAttribute('lang')) !== code)
		await page.locator('#lang-toggle-btn').click();
}
export const states = {};
for (const code of ['ms', 'en']) {
	states[`${code}-home`] = async (page) => {
		await language(page, code);
	};
	for (const [index, mode] of ['query', 'trace', 'cli'].entries()) {
		states[`${code}-console-${mode}`] = async (page) => {
			await language(page, code);
			await page.locator('.cortex-launcher').click();
			await page.locator('#neural-cortex-dialog:modal').waitFor();
			await page.locator('.mode-nav button').nth(index).click();
			if (mode === 'trace') await page.locator('#cortex-project').selectOption('adims');
			else {
				await page.locator('#cortex-input').fill(mode === 'cli' ? 'help' : 'experience');
				await page.locator('#cortex-input').press('Enter');
			}
		};
	}
	states[`${code}-deck`] = async (page) => {
		await language(page, code);
		await page.locator('.hero-btn-pres').click();
		await page.locator('.rail-tab').nth(2).click();
		await page.locator('.deck summary:visible').first().click();
	};
	states[`${code}-project-details`] = async (page) => {
		await language(page, code);
		await page.locator('.btn-card-specs').first().click();
	};
	states[`${code}-mobile-menu`] = async (page) => {
		await language(page, code);
		await page.setViewportSize({ width: 320, height: 844 });
		if (await page.locator('#mobile-menu-toggle').isVisible())
			await page.locator('#mobile-menu-toggle').click();
	};
}

// The CLI applies its five baseline passes only to the initial page. Drive the
// small-screen modal states explicitly too, rather than imply they were covered.
for (const [name, setup] of Object.entries({ ...states })) {
	if (!/console|deck|project-details/.test(name)) continue;
	states[`${name}-320px`] = async (page) => {
		await page.setViewportSize({ width: 320, height: 844 });
		await setup(page);
		await page.locator(':modal').waitFor();
		await page.waitForTimeout(350);
	};
}
