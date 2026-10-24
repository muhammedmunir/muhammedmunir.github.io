export const states = {
	ready: async (page) => {
		await page.waitForFunction(() => window.__engineDiagnostic?.renderer === 'ready');
	},
	activated: async (page) => {
		await page.waitForFunction(() => window.__engineDiagnostic?.renderer === 'ready');
		await page.locator('[data-region=services]').click();
		await page.waitForTimeout(700);
	},
	english: async (page) => {
		await page.getByRole('button', { name: 'EN', exact: true }).click();
		await page.waitForTimeout(150);
	},
	emesys: async (page) => {
		await page.locator('#emesys').evaluate((e) => e.scrollIntoView({ block: 'start' }));
		await page.waitForTimeout(700);
	},
	reduced: async (page) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.waitForFunction(() => window.__engineDiagnostic?.reduced);
	},
	fallback: async (page) => {
		await page.waitForFunction(() => window.__engineDiagnostic?.renderer === 'ready');
		await page
			.locator('canvas')
			.evaluate((c) => c.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
		await page.locator('[data-engine-state=fallback]').waitFor();
	}
};
