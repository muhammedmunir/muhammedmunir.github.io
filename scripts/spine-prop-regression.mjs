import assert from 'node:assert/strict';
import { createServer } from 'vite';
import * as THREE from 'three';

// Gunakan pembina dan animasi sebenar tanpa memerlukan GPU untuk ujian geometri.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const previousDocument = globalThis.document;
try {
	const { FiberSpineWorld } = await server.ssrLoadModule('/src/lib/spine/FiberSpineWorld.ts');
	const { STATIONS } = await server.ssrLoadModule('/src/lib/spine/spine-data.ts');
	globalThis.document = { createElement: () => ({ width: 0, height: 0 }) };
	const world = new FiberSpineWorld({});
	world.drawHotspotExhibitCanvas = () => {};
	world.pulseInstanced = new THREE.InstancedMesh(
		new THREE.SphereGeometry(0.01),
		new THREE.MeshBasicMaterial(),
		72
	);
	STATIONS.forEach((station, index) => {
		const group = new THREE.Group();
		station.hotspots.forEach((hotspot) =>
			world.createHotspotExhibitMonolith(group, index, hotspot, new THREE.Vector3(), 0, 0x38bdf8)
		);
	});
	const monument = new THREE.Group();
	world.createStationPlazaAndMonument(monument, 2, 0x38bdf8);
	world.drawStationHeaderCanvas = () => {};
	world.createStationHeaderArch(monument, STATIONS[2]);
	const header = monument.children.at(-1);
	const camera = new THREE.PerspectiveCamera(46, 1440 / 900, 0.15, 380);
	camera.position.set(0, 3.25, 9.8);
	camera.lookAt(0, 2.15, -2.6);
	camera.updateMatrixWorld(true);
	function projectedBounds(root) {
		root.updateWorldMatrix(true, true);
		const bounds = new THREE.Box3();
		const vertex = new THREE.Vector3();
		root.traverse((mesh) => {
			const positions = mesh.geometry?.attributes.position;
			if (!positions) return;
			for (let i = 0; i < positions.count; i++) {
				vertex.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld).project(camera);
				bounds.expandByPoint(vertex);
			}
		});
		return bounds;
	}
	const headerTop = projectedBounds(header).max.y;
	const dishes = [];
	for (const root of [monument, ...world.hotspots.map(({ propObject }) => propObject)]) {
		root.traverse((mesh) => {
			if (mesh.geometry?.type === 'LatheGeometry') dishes.push(mesh);
		});
	}
	assert.equal(dishes.length, 4, 'Tiga ikon radar dan satu monumen mesti diuji');
	for (const dish of dishes) {
		const originalRotation = dish.rotation.clone();
		const geometry = dish.geometry;
		const positions = geometry.attributes.position;
		const indices = geometry.index;
		const triangle = new THREE.Triangle();
		let face = 0;
		do {
			triangle.set(
				...[0, 1, 2].map((i) =>
					new THREE.Vector3().fromBufferAttribute(positions, indices.getX(face + i))
				)
			);
			face += 3;
		} while (triangle.getArea() < 0.00001 && face < indices.count);
		for (const angle of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
			dish.rotation.z = angle;
			dish.updateWorldMatrix(true, false);
			const center = triangle.getMidpoint(new THREE.Vector3()).applyMatrix4(dish.matrixWorld);
			const normal = triangle.getNormal(new THREE.Vector3()).transformDirection(dish.matrixWorld);
			for (const side of [-1, 1]) {
				const ray = new THREE.Raycaster(
					center.clone().addScaledVector(normal, side * 0.001),
					normal.clone().multiplyScalar(-side),
					0,
					0.002
				);
				assert.ok(
					ray.intersectObject(dish, false).length > 0,
					'Permukaan radar mesti kelihatan dari kedua-dua sisi'
				);
			}
		}
		dish.rotation.copy(originalRotation);
	}
	const largeDish = dishes[0];
	assert.equal(largeDish.children.length, 2, 'Antena mesti terikat pada piring yang berputar');
	const initialHeights = world.hotspots.map((record) => record.propObject.position.y);
	let minimumClearance = Infinity;
	let radarBottom = Infinity;
	let radarTop = -Infinity;
	const failures = new Set();
	for (let frame = 0; frame <= 720; frame++) {
		world.activeStationIndex = Math.floor(frame / 120) % STATIONS.length;
		world.hoveredHotspotId = world.hotspots[frame % world.hotspots.length].id;
		world.animateScene(1 / 30, frame / 30);
		const radarBounds = projectedBounds(largeDish);
		radarBottom = Math.min(radarBottom, radarBounds.min.y);
		radarTop = Math.max(radarTop, radarBounds.max.y);
		if (radarBounds.min.y < headerTop + 0.02)
			failures.add('radar-monument: siluet bertindih dengan papan hadapan');
		if (radarBounds.max.y > 0.82) failures.add('radar-monument: siluet terpotong oleh HUD atas');
		for (const [index, record] of world.hotspots.entries()) {
			record.mesh.updateMatrixWorld(true);
			const prop = new THREE.Box3().setFromObject(record.propObject, true);
			const board = new THREE.Box3();
			for (const child of record.mesh.children) {
				if (child.isMesh && Math.abs(child.position.y - 1.52) < 0.001)
					board.union(new THREE.Box3().setFromObject(child, true));
			}
			const gap = prop.min.y - board.max.y;
			minimumClearance = Math.min(minimumClearance, gap);
			if (gap < 0.12) failures.add(`${record.id}: kelegaan bawah 0.12`);
			if (Math.abs(record.propObject.position.y - initialHeights[index]) > 0.041)
				failures.add(`${record.id}: animasi mengubah aras asas`);
		}
	}
	world.reducedMotion = true;
	const frozen = world.hotspots.map(({ propObject }) => [
		...propObject.position,
		propObject.rotation.y
	]);
	world.animateScene(1, 60);
	assert.deepEqual(
		world.hotspots.map(({ propObject }) => [...propObject.position, propObject.rotation.y]),
		frozen
	);
	console.log(
		JSON.stringify(
			{
				props: world.hotspots.length,
				frames: 721,
				minimumClearance,
				radarBottom,
				radarTop,
				headerTop,
				failures: [...failures]
			},
			null,
			2
		)
	);
	assert.equal(failures.size, 0, 'Ikon mesti kekal di atas papan sepanjang putaran');
} finally {
	globalThis.document = previousDocument;
	await server.close();
}
