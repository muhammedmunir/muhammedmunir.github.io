import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const url = process.env.WORKBENCH_URL || 'http://127.0.0.1:5173/';
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
try {
	const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
	page.on('pageerror', (error) => errors.push(error.message));
	page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
	await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
	await page.waitForTimeout(6000);
	const result = await page.evaluate(() => ({
		webgl: !!document.createElement('canvas').getContext('webgl2'),
		status: document.querySelector('.render-status')?.textContent?.trim() ?? '',
		statusHidden: document.querySelector('.render-status')?.hidden ?? null
	}));
	assert.equal(result.webgl, true, 'Pelayar ujian tiada WebGL2; ujian tidak sah');
	assert.equal(errors.filter((e) => /\[Workbench\]|ReferenceError|TypeError/.test(e)).length, 0, `Ralat: ${errors.join(' | ')}`);
	assert.equal(result.statusHidden, true, `Status masih dipapar: "${result.status}"`);
	console.log('SMOKE OK', JSON.stringify(result));
} finally {
	await browser.close();
}
