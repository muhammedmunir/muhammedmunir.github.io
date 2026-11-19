import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const url = process.env.HOME_URL || 'http://localhost:5199/';
const dir = '.crew/artifacts/home';
await mkdir(dir, { recursive: true });
const browser = await chromium.launch();
try {
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, isMobile: width === 390 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(6000);
    await page.evaluate(() => document.fonts.ready.then(() => true));
    assert.deepEqual(await page.locator('h1').allTextContents(), ['Muhammed Munir']);
    const resume = page.locator('.hero-identity .primary');
    const box = await resume.boundingBox();
    assert(await resume.isVisible() && box && box.y >= 0 && box.y + box.height < height && box.x >= 0 && box.x + box.width <= width, `Resume di luar viewport ${width}`);
    for (const id of ['profil', 'perjalanan', 'kemahiran', 'sijil']) assert.equal(await page.locator(`section#${id}`).count(), 1);
    assert(await page.evaluate(w => document.documentElement.scrollWidth <= Math.min(innerWidth, w), width), `Limpahan pada ${width}px`);
    assert.equal(await page.locator('.render-status').evaluate(el => el.hidden), true);
    await page.screenshot({ path: `${dir}/${width}.png`, fullPage: true });
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('HOME OK');
} finally {
  await browser.close();
}
