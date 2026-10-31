import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import * as THREE from 'three';
import { createServer } from 'vite';

// Sesi 3 — `xray-lens.ts`: sahkan pas kanta X-Ray dibina dengan uniform yang
// betul (pembiasan 1/1.07, pemisahan kromatik di birai, tanpa double-render
// lautan). Diuji kepala; pas ShaderPass tidak memerlukan GPU semasa pembinaan.
const vite = await createServer({
	configFile: false,
	server: { middlewareMode: true, hmr: false, ws: false, watch: null },
	optimizeDeps: { noDiscovery: true },
	appType: 'custom'
});
after(() => vite.close());

const { createXRayLensPass } = await vite.ssrLoadModule('/src/lib/spine/xray-lens.ts');

test('createXRayLensPass mendedahkan uniform X-Ray dan krteria pembiasan Snell/1.07', () => {
	const resolution = new THREE.Vector2(1600, 900);
	const { pass, uniforms } = createXRayLensPass(resolution);

	assert.ok(pass, 'pas kanta wajib wujud');
	assert.ok(uniforms.uResolution.value.equals(resolution), 'uResolution mesti sepadan viewport');
	assert.equal(uniforms.uCenter.value.x, 800, 'pusat kursor mula di tengah X');
	assert.equal(uniforms.uCenter.value.y, 450, 'pusat kursor mula di tengah Y');
	assert.equal(uniforms.uAmount.value, 0, 'kanta mula tidak aktif (tiada kesan)');
	assert.equal(uniforms.uChromAb.value, 1, 'kromatik aktif secara lalai');
	assert.ok(uniforms.uRadius.value > 0, 'jejari kanta wajib positif');
	assert.ok(uniforms.tFiber.value === null, 'tFiber mula kosong');

	const frag = pass.uniforms;
	assert.ok(frag, 'uniform pas boleh diakses');
	const shader = pass.material;
	const src = shader?.fragmentShader ?? '';

	assert.ok(src.includes('1.07'), 'pembesaran pusat jernih 1/1.07 wajib wujud');
	assert.ok(src.includes('uChromAb'), 'uniform pemisahan kromatik uChromAb wajib wujud');
	assert.ok(src.includes('tFiber'), 'lapisan gentian bawah pulau dibaca daripada tFiber');
	assert.ok(src.includes('smoothstep'), 'topeng bulatan kanta memakai smoothstep');
	assert.ok(!src.includes('uTime'), 'kanta Statik; tiada kos denyut masa dalam pas');
});

test('uniform uAmount kekal 0 apabila tidak diaktifkan (tiada render berganda lautan)', () => {
	const resolution = new THREE.Vector2(800, 600);
	const { uniforms } = createXRayLensPass(resolution);
	// Kesan cuma menyala apabila dunia menaikkan uAmount (X-Ray aktif).
	assert.equal(uniforms.uAmount.value, 0, 'X-Ray padam secara lalai');
});
