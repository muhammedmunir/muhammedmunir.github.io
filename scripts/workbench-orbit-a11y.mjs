// Semakan WCAG 2.5.7 dan pautan langkau.
// Guna: WORKBENCH_URL=http://localhost:5199/ node scripts/workbench-orbit-a11y.mjs
import { chromium } from 'playwright';
const url = process.env.WORKBENCH_URL ?? 'http://localhost:5199/';
// WebGL perisian (swiftshader) hanya untuk pelayan dev tempatan; tolak URL lain sebelum pelayar dilancarkan.
if (!['localhost', '127.0.0.1'].includes(new URL(url).hostname)) {
  console.error(`ORBIT FAIL: hanya localhost dibenarkan, diterima ${url}`);
  process.exit(1);
}
// Flag swiftshader sama seperti workbench-smoke.mjs: tanpanya Chromium headless tiada WebGL.
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const fail = msg => { console.error('ORBIT FAIL:', msg); process.exitCode = 1; };
const shot = page => page.locator('canvas').screenshot();
try {
  // Gerakan dikurangkan membekukan animasi (LED, denyut), jadi kanvas hanya berubah jika kamera bergerak.
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('.render-status').waitFor({ state: 'hidden', timeout: 20000 });
  await page.getByText(/Kamera & sudut pandang|Camera & viewpoints/).click();
  const right = page.getByRole('button', { name: /Putar ke kanan|Rotate right/ });
  if (await right.isDisabled()) fail('butang putar dinyahdayakan (dunia 3D tidak sedia)');
  await page.waitForTimeout(800);
  const before = await shot(page);
  await page.waitForTimeout(800);
  if (Buffer.compare(before, await shot(page)) !== 0) fail('kawalan: kanvas berubah tanpa tindakan, jadi ujian ini tidak sah');
  for (let i = 0; i < 3; i++) await right.click();
  await page.waitForTimeout(800);
  if (Buffer.compare(before, await shot(page)) === 0) fail('kanvas tidak berubah selepas Putar ke kanan');
  await page.locator('canvas').focus();
  const focused = await page.evaluate(() => document.activeElement?.tagName);
  if (focused !== 'CANVAS') fail(`kanvas tidak boleh difokus (aktif: ${focused})`);
  const beforeKey = await shot(page);
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(800);
  if (Buffer.compare(beforeKey, await shot(page)) === 0) fail('anak panah tidak memutar kamera');
  await page.screenshot({ path: '.crew/artifacts/011/1440.png' });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('a.skip-link[href="#sistem"]').focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  if (!(await page.evaluate(() => location.hash === '#sistem'))) fail('pautan langkau tidak menuju #sistem');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.getByText(/Kamera & sudut pandang|Camera & viewpoints/).click();
  await page.screenshot({ path: '.crew/artifacts/011/390.png' });
  if (!process.exitCode) console.log('ORBIT OK');
} finally {
  await browser.close();
}
