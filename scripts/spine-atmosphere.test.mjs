import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import * as THREE from 'three';
import { createServer } from 'vite';

// Kontrak shader dan logik sebenar; bukan kompilasi GLSL atau render WebGL.
const vite = await createServer({
	configFile: false,
	server: { middlewareMode: true, hmr: false, ws: false, watch: null },
	optimizeDeps: { noDiscovery: true },
	appType: 'custom'
});
after(() => vite.close());
const { FiberSpineWorld } = await vite.ssrLoadModule('/src/lib/spine/FiberSpineWorld.ts');

function fixture(t) {
	const world = new FiberSpineWorld({ clientWidth: 1280, clientHeight: 800 });
	world.setupLights();
	world.buildSkyAndOcean();
	world.pulseInstanced = new THREE.InstancedMesh(
		new THREE.SphereGeometry(0.1, 4, 2),
		new THREE.MeshBasicMaterial(),
		72
	);
	world.scene.add(world.pulseInstanced);
	t.after(() =>
		world.scene.traverse((object) => {
			object.geometry?.dispose();
			object.material?.dispose();
		})
	);
	return world;
}

test('ocean uniforms match declarations and weather/theme config', (t) => {
	const world = fixture(t);
	const material = world.oceanMaterial;
	for (const shader of [material.vertexShader, material.fragmentShader]) {
		for (const [, name] of shader.matchAll(/uniform\s+\w+\s+(u\w+)/g)) {
			assert.ok(name in material.uniforms, `Missing uniform ${name}`);
		}
		for (const name of new Set(shader.match(/\bu[A-Z]\w*/g))) {
			assert.match(shader, new RegExp(`uniform\\s+\\w+\\s+${name}\\b`));
		}
	}
	for (const theme of ['dark', 'light']) {
		world.theme = theme;
		for (const preset of ['golden_horizon', 'emerald_day', 'biolum_night', 'monsoon_swell']) {
			world.weatherPresetId = preset;
			world.applyWeatherAndTheme();
			const cfg = world.getWeatherConfig();
			assert.equal(material.uniforms.uNightFactor.value, cfg.nightFactor);
			assert.equal(
				material.uniforms.uNightFactor.value,
				world.skyMaterial.uniforms.uNightFactor.value
			);
			assert.ok(material.uniforms.uFogColor.value.equals(cfg.fogColor));
			assert.equal(material.uniforms.uWaveScale.value, cfg.waveScale);
		}
	}
});

test('fog uses distance exp2 and subtle drift from the existing clock only', (t) => {
	const { oceanMaterial: material } = fixture(t);
	const shader = material.fragmentShader;
	assert.match(shader, /float dist = length\(viewVec\)/);
	assert.match(shader, /float fogDrift = 1\.0 \+ 0\.06 \* sin\([^;]*uTime \* 0\.08\)/);
	assert.match(shader, /float fogDepth = max\(dist - 48\.0, 0\.0\) \* 0\.018 \* fogDrift/);
	assert.match(shader, /float fogFactor = 1\.0 - exp2\(-fogDepth \* fogDepth \* 1\.442695\)/);
	assert.match(shader, /color = mix\(color, uFogColor, fogFactor\)/);
	assert.doesNotMatch(shader, /smoothstep\(48\.0, 175\.0, dist\)|\b(?:for|while)\s*\(|sampler\w*/);
	assert.equal(material.transparent, false);
	assert.equal(material.depthWrite, true);
});

test('reduced motion freezes uTime and resumes without wall-clock jump', (t) => {
	const world = fixture(t);
	world.animateScene(0.02, 100);
	const time = world.oceanMaterial.uniforms.uTime.value;
	assert.equal(time, 0.02);
	world.setReducedMotion(true);
	assert.equal(world.oceanMaterial.uniforms.uWaveScale.value, 0.25);
	world.animateScene(0.05, 900);
	world.animateScene(0.05, 901);
	assert.equal(world.oceanMaterial.uniforms.uTime.value, time);
	assert.equal(world.skyMaterial.uniforms.uTime.value, time);
	world.setReducedMotion(false);
	world.animateScene(0.02, 1000);
	assert.equal(world.oceanMaterial.uniforms.uTime.value, time + 0.02);
	assert.equal(world.oceanMaterial.uniforms.uWaveScale.value, world.getWeatherConfig().waveScale);
});

test('pause cancels the animation loop; resume discards dormant time', (t) => {
	const world = fixture(t);
	const frames = new Map();
	let id = 0;
	for (const [name, value] of Object.entries({
		requestAnimationFrame: (callback) => {
			frames.set(++id, callback);
			return id;
		},
		cancelAnimationFrame: (frame) => frames.delete(frame)
	})) {
		const original = Object.getOwnPropertyDescriptor(globalThis, name);
		Object.defineProperty(globalThis, name, { configurable: true, value });
		t.after(() => {
			if (original) Object.defineProperty(globalThis, name, original);
			else delete globalThis[name];
		});
	}
	let delta = 0.02;
	world.clock = {
		getDelta: () => {
			const value = delta;
			delta = 0.02;
			return value;
		},
		getElapsedTime: () => 1000
	};
	const frame = () => {
		const [key, callback] = frames.entries().next().value;
		frames.delete(key);
		callback();
	};
	world.startLoop();
	frame();
	const time = world.oceanMaterial.uniforms.uTime.value;
	world.setActive(false);
	assert.equal(frames.size, 0);
	assert.equal(world.oceanMaterial.uniforms.uTime.value, time);
	delta = 120;
	world.setActive(true);
	assert.equal(frames.size, 1);
	frame();
	assert.equal(world.oceanMaterial.uniforms.uTime.value, time + 0.02);
	world.setActive(false);
});

test('existing PBR roughness maps remain wired; glass needs no transmission', (t) => {
	const world = fixture(t);
	const texture = new THREE.Texture();
	t.after(() => texture.dispose());
	world.pbrMaps = { normalMap: texture, roughnessMap: texture, metalnessMap: texture };
	const metal = world.createBrushedMetalMaterial(0xffffff);
	const glass = world.createOpticalGlassMaterial();
	t.after(() => {
		metal.dispose();
		glass.dispose();
	});
	assert.ok(metal.isMeshPhysicalMaterial);
	assert.equal(metal.roughnessMap, texture);
	assert.ok(metal.roughness > 0 && metal.roughness <= 1);
	assert.ok(metal.envMapIntensity > 0);
	assert.equal(glass.transmission, 0);
	assert.equal(glass.transparent, true);
	assert.equal(glass.depthWrite, false);
	assert.match(FiberSpineWorld.prototype.init.toString(), /new .*RoomEnvironment\(/);
	assert.match(
		FiberSpineWorld.prototype.init.toString(),
		/pmrem\.fromScene\(roomEnv, 0?\.035\)\.texture/
	);
	assert.match(
		FiberSpineWorld.prototype.init.toString(),
		/this\.scene\.environment = this\.envTexture/
	);
});
