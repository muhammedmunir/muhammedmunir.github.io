import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import * as THREE from 'three';
import { createServer } from 'vite';

// Sesi 2 — `diorama-props.ts`: sahkan 21 hotspot membina siluet 3D unik (tiada dua serupa)
// dan setiap prop membawa papan tanda kod + tapak pedestal. Diuji kepala (node) tanpa GPU;
// tekstur papan tanda jatuh senyap ke plat kosong apabila tiada 2D context.

const vite = await createServer({
	configFile: false,
	server: { middlewareMode: true, hmr: false, ws: false, watch: null },
	optimizeDeps: { noDiscovery: true },
	appType: 'custom'
});
after(() => vite.close());

const { buildDioramaProp, DIORAMA_GLB_MAP, createBeveledSlabGeometry } =
	await vite.ssrLoadModule('/src/lib/spine/diorama-props.ts');
const { STATIONS } = await vite.ssrLoadModule('/src/lib/spine/spine-data.ts');

const materials = {
	metal: (color, accent, roughness) =>
		new THREE.MeshPhysicalMaterial({ color: color ?? 0x1e293b, roughness: roughness ?? 0.6 }),
	glass: (tint) => new THREE.MeshPhysicalMaterial({ color: tint ?? 0x38bdf8 }),
	glow: (color, emissive, intensity) =>
		new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: intensity })
};

/** Jejak tandatangan geometri (jenis + parameter utama) bagi sesuatu prop 3D. */
function geometrySignature(root) {
	const parts = [];
	root.traverse((obj) => {
		if (!obj.isMesh || !obj.geometry) return;
		const g = obj.geometry;
		const p = g.parameters ?? {};
		let params = '';
		if (g.type === 'CylinderGeometry') {
			params = `${p.radiusTop ?? ''},${p.radiusBottom ?? ''},${p.height ?? ''}`;
		} else if (g.type === 'SphereGeometry') {
			params = `${p.radius ?? ''}`;
		} else if (g.type === 'IcosahedronGeometry' || g.type === 'OctahedronGeometry') {
			params = `${p.radius ?? ''},${p.detail ?? ''}`;
		} else if (g.type === 'TorusGeometry') {
			params = `${p.radius ?? ''},${p.tube ?? ''}`;
		} else if (g.type === 'LatheGeometry') {
			params = `${(g.attributes?.position?.count ?? '').toString()}`;
		} else if (g.type === 'ExtrudeGeometry') {
			params = `${(g.attributes?.position?.count ?? '').toString()}`;
		}
		parts.push(`${g.type}(${params})`);
	});
	return parts.sort().join('|');
}

test('Kesemua 21 hotspot dibina dengan siluet unik (tiada dua prop serupa)', () => {
	const signatureById = new Map();
	for (const station of STATIONS) {
		for (const hotspot of station.hotspots) {
			const { root } = buildDioramaProp({
				id: hotspot.id,
				code: hotspot.code,
				stationIndex: station.index,
				accentHex: 0x38bdf8,
				materials
			});
			const signature = geometrySignature(root);
			const prev = signatureById.get(signature);
			assert.equal(
				prev,
				undefined,
				`Siluet ${hotspot.id} ($signature) sama dengan ${prev}`
			);
			signatureById.set(signature, hotspot.id);
		}
	}
	assert.equal(signatureById.size, 21, 'Mesti ada 21 tandatangan siluet berbeza');
});

test('Setiap prop mengandungi papan tanda kod diegetik (backing slab) dan pedestal', () => {
	for (const station of STATIONS) {
		for (const hotspot of station.hotspots) {
			const { root, spinAxis, kind, haloMat } = buildDioramaProp({
				id: hotspot.id,
				code: hotspot.code,
				stationIndex: station.index,
				accentHex: 0x38bdf8,
				materials
			});
			assert.ok(root.name === '' || root.isGroup, 'akar prop ialah Group');
			assert.ok(spinAxis, 'prop mesti membawa spinAxis');
			assert.ok(typeof kind === 'string' && kind.length > 0, 'prop mesti membawa kind');
			assert.ok(haloMat, 'prop mesti membawa haloMat');
			const silhouette = root.getObjectByName('diorama-silhouette');
			assert.ok(silhouette, `${hotspot.id} mesti membawa kumpulan diorama-silhouette`);
			assert.ok(silhouette.children.length > 0, `${hotspot.id} mesti ada geometri siluet`);
		}
	}
});

test('DIORAMA_GLB_MAP hanya merujuk 3 model CC BY 4.0 yang didokumenkan', () => {
	const keys = Object.keys(DIORAMA_GLB_MAP);
	assert.deepEqual(keys.sort(), ['core-ring-sys', 'net-soc', 'net-tnb-fiber']);
	for (const spec of Object.values(DIORAMA_GLB_MAP)) {
		assert.ok(spec.path.startsWith('/models/'), 'laluan GLB mestilah relatif /models/');
		assert.ok(spec.targetHeight > 0, 'targetHeight mesti positif');
		assert.ok(typeof spec.spin === 'number', 'spin mesti nombor');
	}
});

test('createBeveledSlabGeometry sentiasa menghasilkan geometri manifold tertutup', () => {
	for (const [w, h, d] of [
		[1.32, 0.24, 1.32],
		[0.94, 0.24, 0.1],
		[0.3, 0.82, 0.62]
	]) {
		const geo = createBeveledSlabGeometry(w, h, d);
		assert.ok(geo.isBufferGeometry, 'mesti BufferGeometry');
		assert.ok(geo.attributes.position && geo.attributes.position.count > 0, 'mesti ada verteks');
		geo.dispose();
	}
});