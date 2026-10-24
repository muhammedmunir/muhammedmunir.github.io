export const states = {
	'world-ready': async (page) => {
		await page.waitForFunction(() => window.__foundry?.ready);
	},
	'input-activated': async (page) => {
		await page.waitForFunction(() => window.__foundry?.ready);
		await page.locator('.world-input').click();
		await page.waitForTimeout(700);
	},
	english: async (page) => {
		await page.getByRole('button', { name: 'EN', exact: true }).click();
		await page.waitForTimeout(200);
	},
	'project-cutaway': async (page) => {
		await page.locator('#project').scrollIntoViewIfNeeded();
		await page.waitForTimeout(600);
	},
	'reduced-motion': async (page) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.waitForFunction(() => window.__foundry?.reduced);
	},
	'context-loss': async (page) => {
		await page.waitForFunction(() => window.__foundry?.ready);
		await page
			.locator('canvas')
			.evaluate((c) => c.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
		await page.locator('[data-living-state=fallback]').waitFor();
	}
};
