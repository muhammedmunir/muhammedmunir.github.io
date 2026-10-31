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
	world.drawStationHeaderCanvas = () => {};
	world.pulseInstanced = new THREE.InstancedMesh(
		new THREE.SphereGeometry(0.01),
		new THREE.MeshBasicMaterial(),
		72
	);
	world.pulseOffsets = new Float32Array(72);
	world.pulseSpeeds = new Float32Array(72).fill(0.02);
	world.causewayLoopSamples = Array.from(
		{ length: 360 },
		(_, i) =>
			new THREE.Vector3(
				Math.sin((i / 360) * Math.PI * 2) * 38,
				0,
				Math.cos((i / 360) * Math.PI * 2) * 38
			)
	);
	world.causewayLoopDives = new Float32Array(360);
	world.dummy = new THREE.Object3D();
	world.scene.add(world.pulseInstanced);
	STATIONS.forEach((station, index) => {
		const group = new THREE.Group();
		station.hotspots.forEach((hotspot, idx) =>
			world.createTactileStationProp(
				group,
				index,
				hotspot,
				new THREE.Vector3(idx * 2 - 2, 0.42, 0),
				0,
				0x38bdf8
			)
		);
		world.scene.add(group);
		world.stationGroups.push(group);
	});
	const monument = new THREE.Group();
	world.createStationPlazaAndMonument(monument, 2, 0x38bdf8);
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
	const openSingleSided = [];
	for (const root of [monument, ...world.toys.map(({ mesh }) => mesh)]) {
		root.traverse((mesh) => {
			if (mesh.geometry?.type === 'LatheGeometry') dishes.push(mesh);
			if (mesh.geometry?.type === 'RingGeometry') openSingleSided.push(mesh.name || 'RingGeometry');
			if (mesh.geometry?.type === 'ConeGeometry' && mesh.geometry.parameters?.openEnded) {
				openSingleSided.push(mesh.name || 'OpenConeGeometry');
			}
		});
	}
	assert.equal(
		openSingleSided.length,
		0,
		`Prop 3D tidak boleh menggunakan geometri terbuka single-sided yang hilang bila berpusing: ${openSingleSided.join(', ')}`
	);
	const initialHeights = world.toys.map((toy) => toy.spring.home.y);
	const failures = new Set();
	for (let frame = 0; frame <= 720; frame++) {
		world.activeStationIndex = Math.floor(frame / 120) % STATIONS.length;
		world.hoveredToyId = world.toys[frame % world.toys.length].id;
		world.animateScene(1 / 30, frame / 30);
		const radarBounds = projectedBounds(dishes[0]);
		if (radarBounds.max.y > 16) failures.add('radar-monument: siluet terpotong');
		for (const [index, toy] of world.toys.entries()) {
			if (Math.abs(toy.mesh.position.y - initialHeights[index]) > 0.041)
				failures.add(`${toy.id}: animasi mengubah aras asas`);
		}
	}
	world.reducedMotion = true;
	const frozen = world.toys.map((toy) => [...toy.spring.position, toy.spinAxis.rotation.y]);
	world.animateScene(1, 60);
	assert.deepEqual(
		world.toys.map((toy) => [...toy.spring.position, toy.spinAxis.rotation.y]),
		frozen
	);
	console.log(
		JSON.stringify(
			{
				props: world.toys.length,
				frames: 721,
				headerTop,
				failures: [...failures]
			},
			null,
			2
		)
	);
	assert.equal(failures.size, 0, 'Prop mesti kekal pada aras asas sepanjang animasi');
} finally {
	globalThis.document = previousDocument;
	await server.close();
}
