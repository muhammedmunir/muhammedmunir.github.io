const scrollTo = async (page, id) => {
	await page.locator(`#${id}`).scrollIntoViewIfNeeded();
	await page.waitForTimeout(150);
};
const english = async (page) => {
	await page.getByRole('button', { name: 'EN', exact: true }).click();
	await page.waitForTimeout(200);
};
const fill = async (page) => {
	await page.locator('#contact-name').fill('Local audit');
	await page.locator('#contact-email').fill('audit@example.com');
	await page.locator('#contact-message').fill('Intercepted local audit. Never sent.');
};
const mock = async (page, success) => {
	await page.route('https://api.web3forms.com/submit', (route) =>
		route.fulfill({
			status: success ? 200 : 422,
			contentType: 'application/json',
			body: JSON.stringify({ success, message: success ? 'Submitted' : 'Local audit failure' })
		})
	);
};
export const states = Object.fromEntries(
	['intro', 'emesys', 'onboardx', 'cv_bot', 'about', 'contact'].map((id) => [
		`section-${id}`,
		(page) => scrollTo(page, id)
	])
);
states['english-contact'] = async (page) => {
	await english(page);
	await scrollTo(page, 'contact');
};
states['contact-validation'] = async (page) => {
	await mock(page, false);
	await scrollTo(page, 'contact');
	await page.locator('#contact-name').fill(' ');
	await page.locator('#contact-email').fill('audit@example.com');
	await page.locator('#contact-message').fill(' ');
	await page.locator('#contact-form button[type=submit]').click();
};
states['contact-error'] = async (page) => {
	await mock(page, false);
	await scrollTo(page, 'contact');
	await fill(page);
	await page.locator('#contact-form button[type=submit]').click();
	await page.locator('.form-status').filter({ hasText: 'Local audit failure' }).waitFor();
};
states['contact-success'] = async (page) => {
	await mock(page, true);
	await scrollTo(page, 'contact');
	await fill(page);
	await page.locator('#contact-form button[type=submit]').click();
	await page.locator('#contact .success').waitFor();
};
states['reduced-motion'] = async (page) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await scrollTo(page, 'emesys');
};
states['context-loss'] = async (page) => {
	await page.waitForFunction(() => window.__motionDiagnostic?.renderer !== 'loading');
	await page
		.locator('canvas')
		.evaluateAll((nodes) =>
			nodes.forEach((c) => c.dispatchEvent(new Event('webglcontextlost', { cancelable: true })))
		);
	await scrollTo(page, 'intro');
};
