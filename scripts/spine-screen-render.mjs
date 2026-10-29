import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const url = process.env.SPINE_URL || 'http://127.0.0.1:5173/';
const output = `.crew/artifacts/monitor-glare/${process.env.SPINE_CAPTURE || 'current'}`;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
	viewport: { width: 1280, height: 800 },
	deviceScaleFactor: 1,
	serviceWorkers: 'block'
});
const errors = [];
const results = [];
const failures = [];
await mkdir(output, { recursive: true });

try {
	// Tangkap instance hanya dalam harness; tiada API diagnostik pada aplikasi pengeluaran.
	await context.route('**/*', async (route) => {
		const destination = new URL(route.request().url());
		if (
			destination.origin !== new URL(url).origin &&
			!['data:', 'blob:'].includes(destination.protocol)
		)
			return route.abort('blockedbyclient');
		if (destination.pathname === '/src/lib/spine/FiberSpineWorld.ts') {
			const response = await route.fetch();
			return route.fulfill({
				response,
				body: `${await response.text()}\nconst originalInit = FiberSpineWorld.prototype.init; FiberSpineWorld.prototype.init = function() { window.__screenWorld = this; return originalInit.call(this); };`
			});
		}
		return route.continue();
	});
	const page = await context.newPage();
	page.on('pageerror', (error) => errors.push(error.message));
	page.on('console', (message) => {
		if (message.type() === 'error' && /THREE|WebGL|shader/i.test(message.text()))
			errors.push(message.text());
	});
	await page.goto(url);
	await page.waitForFunction(
		() => window.__screenWorld?.hotspots.length > 0 && document.querySelector('.webgl-stage canvas')
	);
	await page.evaluate(async () => {
		await document.fonts.ready;
		window.__screenWorld.setActive(false);
		window.__screenWorld.setReducedMotion(true);
	});

	for (const theme of ['light', 'dark']) {
		await page.setViewportSize({ width: 1280, height: 800 });
		if ((await page.locator('html').getAttribute('data-theme')) !== theme)
			await page.getByRole('button', { name: /tukar ke tema/ }).click();
		for (const [width, height] of [
			[1280, 800],
			[390, 844]
		]) {
			await page.setViewportSize({ width, height });
			const measurements = await page.evaluate(
				({ theme, width, height }) => {
					const world = window.__screenWorld;
					world.setActive(false);
					world.setReducedMotion(true);
					world.onResize();
					const renderer = world.renderer;
					const gl = renderer.getContext();
					const pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
					const result = [];
					const luminance = (rgb) =>
						rgb
							.map((v) => v / 255)
							.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
							.reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
					const contrast = (a, b) =>
						(Math.max(luminance(a), luminance(b)) + 0.05) /
						(Math.min(luminance(a), luminance(b)) + 0.05);
					for (const record of world.hotspots) {
						world.selectHotspot(record.id);
						world.currentProgress = record.stationIndex / 6;
						world.targetProgress = world.currentProgress;
						world.updateCamera(1, 0);
						world.scene.updateMatrixWorld(true);
						world.camera.updateMatrixWorld(true);
						const canvas = record.canvas;
						const ctx = canvas.getContext('2d');
						const palette = world.screenPalette;
						// Warna rujukan melalui material, lampu, bloom dan OutputPass aplikasi sebenar.
						const colors = [
							'background',
							'text',
							'muted',
							'accent',
							'surface',
							'hover',
							'onAccent'
						];
						ctx.fillStyle = palette.background;
						ctx.fillRect(0, 0, canvas.width, canvas.height);
						const cell = canvas.width / colors.length;
						colors.forEach((name, index) => {
							ctx.fillStyle = palette[name];
							ctx.fillRect(index * cell, 0, cell, canvas.height);
						});
						record.texture.needsUpdate = true;
						if (world.composer) world.composer.render();
						else renderer.render(world.scene, world.camera);
						gl.readPixels(
							0,
							0,
							gl.drawingBufferWidth,
							gl.drawingBufferHeight,
							gl.RGBA,
							gl.UNSIGNED_BYTE,
							pixels
						);
						const samples = colors.map((_, index) => {
							const point = record.screenMesh.position
								.clone()
								.set(
									((index + 0.5) / colors.length) * record.screenWidth - record.screenWidth / 2,
									0,
									0
								);
							record.screenMesh.localToWorld(point);
							point.project(world.camera);
							const px = Math.floor((point.x * 0.5 + 0.5) * gl.drawingBufferWidth);
							const py = Math.floor((point.y * 0.5 + 0.5) * gl.drawingBufferHeight);
							const offset = (py * gl.drawingBufferWidth + px) * 4;
							return Array.from(pixels.slice(offset, offset + 3));
						});
						const [background, text, muted, accent, surface, hover, onAccent] = samples;
						result.push({
							theme,
							width,
							height,
							id: record.id,
							material: record.screenMat.type,
							background,
							text,
							backgroundLuminance: luminance(background),
							minimumContrast: Math.min(
								...[background, surface, hover].flatMap((bg) =>
									[text, muted, accent].map((fg) => contrast(fg, bg))
								),
								contrast(onAccent, accent)
							)
						});
						world.redrawSelectedScreen();
					}
					world.selectHotspot(world.hotspots[0].id);
					world.currentProgress = 0;
					world.targetProgress = 0;
					world.updateCamera(1, 0);
					if (world.composer) world.composer.render();
					else renderer.render(world.scene, world.camera);
					return result;
				},
				{ theme, width, height }
			);
			results.push(...measurements);
			await page.screenshot({ path: `${output}/${theme}-${width}-inspect.png` });
			for (const measurement of measurements) {
				if (measurement.minimumContrast < 4.5)
					failures.push(
						`${theme}/${width}/${measurement.id}: kontras ${measurement.minimumContrast.toFixed(2)}:1 < 4.5:1`
					);
				if (theme === 'light' && measurement.backgroundLuminance > 0.8)
					failures.push(
						`${theme}/${width}/${measurement.id}: luminans latar ${measurement.backgroundLuminance.toFixed(3)} > 0.8`
					);
			}
		}
	}
	await writeFile(
		`${output}/measurements.json`,
		JSON.stringify({ browser: browser.version(), results, errors, failures }, null, 2)
	);
	console.log(
		JSON.stringify(
			{
				samples: results.length,
				minimumContrast: Math.min(...results.map((r) => r.minimumContrast)),
				maximumLightLuminance: Math.max(
					...results.filter((r) => r.theme === 'light').map((r) => r.backgroundLuminance)
				),
				errors,
				failures
			},
			null,
			2
		)
	);
	assert.equal(errors.length, 0, 'Tiada ralat JavaScript atau WebGL');
	assert.equal(
		failures.length,
		0,
		'Monitor mesti mengekalkan kontras tanpa latar putih berlebihan'
	);
} finally {
	await browser.close();
}
