import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';

const vite = await createServer({
	configFile: false,
	server: { middlewareMode: true, hmr: false, ws: false, watch: null },
	optimizeDeps: { noDiscovery: true },
	appType: 'custom'
});
after(() => vite.close());

const {
	QUALITY_SAMPLE_FRAMES,
	buildStudioEnvironmentScene,
	createQualityGovernorState,
	evaluateQualityTierFromFps,
	recordQualityGovernorFrame
} = await vite.ssrLoadModule('/src/lib/spine/studio-env.ts');
const { FiberSpineWorld } = await vite.ssrLoadModule('/src/lib/spine/FiberSpineWorld.ts');

test('buildStudioEnvironmentScene membina kubah gradien dan panel softbox HDR serta melupuskannya', () => {
	const { scene, disposeTemp } = buildStudioEnvironmentScene();
	// 1 kubah + 4 panel softbox lalai
	assert.equal(scene.children.length, 5);
	const dome = scene.children[0];
	assert.equal(dome.geometry.type, 'SphereGeometry');
	const keyPanel = scene.children[1];
	assert.equal(keyPanel.geometry.type, 'PlaneGeometry');
	// Warna panel HDR mestilah melebihi 1.0 dalam salah satu saluran linear
	assert.ok(
		keyPanel.material.color.r > 1 || keyPanel.material.color.g > 1 || keyPanel.material.color.b > 1,
		'Softbox utama wajib memancarkan keamatan HDR > 1.0'
	);
	assert.doesNotThrow(() => disposeTemp());
});

test('evaluateQualityTierFromFps mematuhi ambang 52 FPS (ultra) dan 38 FPS (balanced/lite)', () => {
	assert.equal(evaluateQualityTierFromFps(60), 'ultra');
	assert.equal(evaluateQualityTierFromFps(52), 'ultra');
	assert.equal(evaluateQualityTierFromFps(51.9), 'balanced');
	assert.equal(evaluateQualityTierFromFps(38), 'balanced');
	assert.equal(evaluateQualityTierFromFps(37.9), 'lite');
	assert.equal(evaluateQualityTierFromFps(60, true), 'lite');
	assert.equal(evaluateQualityTierFromFps(Number.NaN), 'lite');
});

test('recordQualityGovernorFrame menilai 90 bingkai selepas warmup dan menurun taraf jika FPS rendah', () => {
	// Kes 1: 60 FPS stabil -> kekal ultra
	const ultraState = createQualityGovernorState('ultra');
	for (let i = 0; i < 3; i++) {
		assert.equal(recordQualityGovernorFrame(ultraState, 1 / 20), null, 'Warmup diabaikan');
	}
	assert.equal(recordQualityGovernorFrame(ultraState, 1.2), null, 'Tab dorman >0.5s diabaikan');
	for (let i = 0; i < QUALITY_SAMPLE_FRAMES; i++) {
		assert.equal(recordQualityGovernorFrame(ultraState, 1 / 60), null);
	}
	assert.equal(ultraState.settled, true);
	assert.equal(ultraState.tier, 'ultra');
	assert.equal(ultraState.measuredFps, 60);

	// Kes 2: 44 FPS -> turun ke balanced pada bingkai sampel ke-90
	const midState = createQualityGovernorState('ultra');
	for (let i = 0; i < 3; i++) recordQualityGovernorFrame(midState, 1 / 60);
	let change = null;
	for (let i = 0; i < QUALITY_SAMPLE_FRAMES; i++) {
		change = recordQualityGovernorFrame(midState, 1 / 44);
	}
	assert.equal(change, 'balanced');
	assert.equal(midState.tier, 'balanced');
	assert.equal(midState.settled, true);

	// Kes 3: 25 FPS -> turun terus ke lite pada bingkai sampel ke-90
	const slowState = createQualityGovernorState('ultra');
	for (let i = 0; i < 3; i++) recordQualityGovernorFrame(slowState, 1 / 60);
	let slowChange = null;
	for (let i = 0; i < QUALITY_SAMPLE_FRAMES; i++) {
		slowChange = recordQualityGovernorFrame(slowState, 1 / 25);
	}
	assert.equal(slowChange, 'lite');
	assert.equal(slowState.tier, 'lite');
});

test('FiberSpineWorld menyokong pertukaran QualityTier dan melupuskan studioEnvHandle dengan bersih', () => {
	const prevWindow = globalThis.window;
	globalThis.window = { removeEventListener() {} };
	try {
		const world = new FiberSpineWorld({ clientWidth: 1280, clientHeight: 800 });
		assert.equal(world.getQualityTier(), 'ultra');
		let envDisposed = 0;
		let composerDisposed = 0;
		world.studioEnvHandle = {
			texture: {},
			dispose: () => {
				envDisposed++;
			}
		};
		world.composer = {
			dispose: () => {
				composerDisposed++;
			}
		};
		world.renderer = {
			domElement: { removeEventListener() {} },
			toneMapping: 0,
			toneMappingExposure: 1,
			dispose() {}
		};
		world.setupLights();
		world.buildSkyAndOcean();
		world.setQualityTier('lite');
		assert.equal(world.getQualityTier(), 'lite');
		assert.equal(composerDisposed, 1, 'Tukar ke lite wajib melupuskan EffectComposer HDR');
		world.dispose();
		assert.equal(envDisposed, 1, 'dispose() wajib melupuskan studioEnvHandle');
	} finally {
		if (prevWindow === undefined) delete globalThis.window;
		else globalThis.window = prevWindow;
	}
});
