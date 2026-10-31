import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import * as THREE from 'three';
import { createServer } from 'vite';

// Kontrak mainan taktil: prop besar per stesen, spring drag, klik bounce,
// laser network dengan status sedia/cooldown, reduced motion statik.
const vite = await createServer({
	configFile: false,
	server: { middlewareMode: true, hmr: false, ws: false, watch: null },
	optimizeDeps: { noDiscovery: true },
	appType: 'custom'
});
after(() => vite.close());
const { FiberSpineWorld } = await vite.ssrLoadModule('/src/lib/spine/FiberSpineWorld.ts');
const { STATIONS } = await vite.ssrLoadModule('/src/lib/spine/spine-data.ts');

const palette = {
	background: '#101010',
	surface: '#202020',
	text: '#ffffff',
	muted: '#bbbbbb',
	accent: '#77bbff',
	border: '#777777',
	hover: '#333333',
	onAccent: '#101010',
	fontBody: 'sans-serif',
	fontMono: 'monospace'
};

function canvas(width = 900, height = 575) {
	const operations = [];
	const context = {
		font: '16px sans-serif',
		save() {},
		restore() {},
		setTransform() {},
		clearRect() {},
		fillRect() {},
		strokeRect() {},
		beginPath() {},
		closePath() {},
		moveTo() {},
		lineTo() {},
		rect() {},
		roundRect() {},
		arc() {},
		clip() {},
		fill() {},
		stroke() {},
		fillText(text) {
			operations.push(text);
		},
		drawImage() {},
		measureText(text) {
			const size = Number(this.font.match(/([\d.]+)px/)?.[1] ?? 16);
			return { width: Array.from(text).length * size * 0.55 };
		}
	};
	return { width, height, operations, getContext: () => context };
}

function fixture(width = 1280, height = 800) {
	const selections = [];
	const statuses = [];
	const world = new FiberSpineWorld(
		{ clientWidth: width, clientHeight: height },
		{
			onHotspotSelect: (id, stationIndex) => selections.push({ id, stationIndex }),
			onToyStatus: (status) => statuses.push({ ...status })
		}
	);
	world.clock = { getElapsedTime: () => 10, getDelta: () => 0.016 };
	world.screenPalette = palette;
	world.renderer = {
		domElement: { style: {}, getBoundingClientRect: () => ({ left: 24, top: 36, width, height }) },
		setSize() {}
	};
	world.keyLight = new THREE.DirectionalLight();
	world.stationSpotLight = new THREE.SpotLight();
	world.rimLight = new THREE.PointLight();
	world.camera.aspect = width / height;
	world.camera.updateProjectionMatrix();
	world.pulseInstanced = new THREE.InstancedMesh(
		new THREE.SphereGeometry(0.1, 4, 2),
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
	for (const station of STATIONS) {
		for (const hotspot of station.hotspots) {
			const root = new THREE.Group();
			root.position.set(station.index * 8 + world.toys.length * 3, 0.42, -station.index * 5);
			for (let k = 0; k < 3; k++) {
				const slab = new THREE.Mesh(
					new THREE.BoxGeometry(1.5, 0.4, 1.5),
					new THREE.MeshBasicMaterial()
				);
				slab.position.y = 0.3 + k * 0.5;
				root.add(slab);
			}
			root.traverse((child) => {
				child.userData.hotspotId = hotspot.id;
				child.userData.stationIndex = station.index;
			});
			world.scene.add(root);
			world.interactableMeshes.push(root);
			world.interactionRoots.push(root);
			world.toys.push({
				id: hotspot.id,
				stationIndex: station.index,
				hotspot,
				mesh: root,
				baseY: 0.42,
				spring: {
					position: root.position,
					home: root.position.clone(),
					velocity: new THREE.Vector3(),
					limit: new THREE.Vector3(0.75, 0.85, 0.6)
				},
				spinAxis: root,
				spinSpeed: 0,
				kind: station.index === 2 ? 'laser_turret' : 'default',
				exploded: 0
			});
			const toy = world.toys[world.toys.length - 1];
			toy.layers = world.assembleToyLayers(toy);
		}
	}
	return { world, selections, statuses };
}

test('Satu prop taktil per hotspot; tiada monitor teks dalam senario', () => {
	const { world } = fixture();
	assert.ok(world.toys.length > 0);
	assert.equal(world.hotspots, undefined);
	for (const toy of world.toys) {
		assert.ok(toy.mesh);
		assert.ok(toy.spring);
		assert.ok(toy.spinAxis);
		assert.ok(toy.layers);
	}
});

test('bounceProp memberikan impuls spring, scale bounce dan mengembalikan boolean', () => {
	const { world } = fixture();
	const toy = world.toys[0];
	const before = toy.spring.velocity.clone();
	assert.equal(world.bounceProp(toy.id), true);
	assert.ok(before.distanceTo(toy.spring.velocity) > 0);
	assert.ok(toy.mesh.scale.y > 1.15, 'Scale Y mesti melantun melebihi 1.15');
	assert.ok(toy.mesh.scale.x > 1.1, 'Scale X mesti melantun melebihi 1.10');
	assert.equal(world.toyReady, false);
	// Cooldown finite: after 2.5s, ready kembali & skala pulih ke (1,1,1)
	for (let i = 0; i < 200; i++) world.animateScene(0.02, 10 + i * 0.02);
	assert.equal(world.toyReady, true);
	assert.ok(toy.mesh.scale.distanceTo(new THREE.Vector3(1, 1, 1)) < 1e-3);
	// Id tidak wujud -> false
	assert.equal(world.bounceProp('tidak-wujud'), false);
});

test('resetToys memulihkan semua kedudukan dan status sedia', () => {
	const { world } = fixture();
	world.bounceProp(world.toys[0].id);
	world.fireSecurityLaser();
	world.resetToys();
	for (const toy of world.toys) {
		assert.ok(toy.spring.position.distanceToSquared(toy.spring.home) < 1e-9);
	}
	assert.equal(world.toyReady, true);
	assert.equal(world.laserReady, true);
});

test('fireSecurityLaser menembak laser, hits dan cooldown', () => {
	const { world, statuses } = fixture();
	const turret = world.toys.find((toy) => toy.stationIndex === 2);
	assert.ok(turret);
	assert.equal(world.fireSecurityLaser(), true);
	assert.equal(world.laserHits, 1);
	assert.equal(world.laserReady, false);
	assert.equal(statuses.at(-1).hits, 1);
	assert.equal(statuses.at(-1).ready, false);
	assert.ok(world.laserMesh);
	assert.ok(world.laserTargetGlow);
	// Cooldown berakhir selepas LASER_DURATION
	for (let i = 0; i < 120; i++) world.animateScene(0.02, 20 + i * 0.02);
	assert.equal(world.laserReady, true);
	assert.equal(world.laserMesh, null);
	assert.equal(world.laserTargetGlow, null);
	// Tiada turret -> false
	const worldNoTurret = fixture();
	worldNoTurret.world.toys = worldNoTurret.world.toys.filter((toy) => toy.stationIndex !== 2);
	assert.equal(worldNoTurret.world.fireSecurityLaser(), false);
});

test('onToyStatus dipanggil awal selepas init dan selepas cooldown', () => {
	const { world, statuses } = fixture();
	world.emitToyStatus();
	assert.ok(statuses.length >= 1);
	assert.equal(statuses.at(-1).ready, true);
	assert.equal(statuses.at(-1).hits, 0);
});

function projectToyToClient(world, toy) {
	world.camera.updateMatrixWorld();
	toy.mesh.updateWorldMatrix(true, false);
	const v = new THREE.Vector3(0, 0, 0).applyMatrix4(toy.mesh.matrixWorld).project(world.camera);
	const rect = world.renderer.domElement.getBoundingClientRect();
	return {
		clientX: rect.left + ((v.x + 1) * rect.width) / 2,
		clientY: rect.top + ((1 - v.y) * rect.height) / 2
	};
}

test('Drag prop pada plane stabil mengikuti pointer dan spring mengembalikan ke home', () => {
	const { world } = fixture();
	const toy = world.toys[0];
	world.camera.position.set(0, 1.5, 7);
	world.camera.lookAt(0, 0.42, 0);
	world.camera.updateMatrixWorld();
	world.selectHotspot(toy.id);
	const start = toy.spring.position.clone();
	const pivot = projectToyToClient(world, toy);
	const down = { pointerId: 1, isPrimary: true, button: 0, ...pivot };
	world.onPointerDown(down);
	world.onPointerMove({ ...down, clientX: pivot.clientX + 160, clientY: pivot.clientY });
	assert.ok(toy.spring.position.distanceTo(start) > 0.01, 'Drag mesti menggerakkan prop');
	world.onPointerUp({ ...down, clientX: pivot.clientX + 160, clientY: pivot.clientY });
	// Step spring kembali ke home
	for (let i = 0; i < 300; i++) world.animateScene(0.03, 10 + i * 0.03);
	assert.ok(toy.spring.position.distanceToSquared(toy.spring.home) < 0.01);
});

test('Reduced motion memberi maklum balas statik tanpa spring berayun', () => {
	const { world } = fixture();
	world.reducedMotion = true;
	const toy = world.toys[0];
	world.bounceProp(toy.id);
	assert.equal(toy.spring.velocity.lengthSq(), 0);
	assert.ok(toy.spring.position.y > toy.spring.home.y);
	world.animateScene(0.02, 10);
	assert.ok(Math.abs(toy.spring.position.y - toy.spring.home.y) < 0.36);
});

test('Klik prop memilih; klik kosong luar prop menutup', () => {
	const { world, selections } = fixture();
	world.camera.position.set(0, 1.5, 7);
	world.camera.lookAt(0, 0.42, 0);
	world.camera.updateMatrixWorld();
	const toy = world.toys[0];
	const pivot = projectToyToClient(world, toy);
	const click = { pointerId: 1, isPrimary: true, button: 0, ...pivot };
	world.onPointerDown(click);
	world.onPointerUp(click);
	assert.equal(world.selectedToyId, toy.id);
	assert.equal(selections.at(-1).id, toy.id);
	assert.ok(toy.mesh.scale.y > 1.15, 'Klik prop di kanvas mesti mencetuskan scale bounce');
	// Klik jauh dari sebarang prop -> tutup
	const miss = { pointerId: 1, isPrimary: true, button: 0, clientX: 26, clientY: 38 };
	world.onPointerDown(miss);
	world.onPointerUp(miss);
	assert.equal(world.selectedToyId, null);
	assert.equal(selections.at(-1).id, '');
});

test('Kamera Dive Makro: selectHotspot menetapkan focusToyId dan exploded membuka 3 lapisan', () => {
	const { world } = fixture();
	const toy = world.toys[0];
	assert.equal(world.focusToyId, null);
	world.selectHotspot(toy.id);
	assert.equal(world.focusToyId, toy.id);
	assert.equal(world.selectedToyId, toy.id);
	// Animasikan beberapa frame: lapisan mesti terangkat dari home dan exploded menghala ke 1.
	world.animateScene(0.03, 10);
	world.animateScene(0.03, 10.03);
	world.animateScene(0.03, 10.06);
	assert.ok(toy.exploded > 0, 'Prop terfokus mesti membuka lapisan exploded');
	for (const layer of toy.layers) {
		assert.ok(
			layer.root.position.lengthSq() > 0,
			`Lapisan ${layer.id} mesti terangkat daripada tempat asal`
		);
	}
	// Tutup: exploded kembali ke 0 (decay dalam satu frame untuk reduced motion).
	world.reducedMotion = true;
	world.selectHotspot(null);
	world.animateScene(0.03, 20);
	assert.equal(world.focusToyId, null);
	assert.ok(toy.exploded < 0.01, 'Lapisan mesti bercantum semula selepas tutup');
});

test('updateProjectedMarkers memancarkan 3 lapisan prop terfokus sebagai skrin %', () => {
	const { world } = fixture();
	const markers = [];
	world.callbacks.onMarkersUpdate = (list) => markers.push(list);
	world.camera.position.set(0, 1.5, 4);
	world.camera.lookAt(0, 0.42, 0);
	world.camera.updateMatrixWorld();
	const toy = world.toys[0];
	world.activeStationIndex = toy.stationIndex;
	// Sediakan group stesen untuk prop terfokus sahaja, tanpa menutup objek lain.
	if (!world.stationGroups[toy.stationIndex]) {
		const g = new THREE.Group();
		g.position.set(0, 0.42, 0);
		world.scene.add(g);
		world.stationGroups[toy.stationIndex] = g;
	}
	world.stationGroups.forEach((g) => g && g.updateWorldMatrix(true));
	world.toys.forEach((t) => t.mesh.updateWorldMatrix(true, false));
	world.selectHotspot(toy.id);
	world.updateProjectedMarkers();
	assert.ok(markers.length >= 1, 'Mesti ada marker bagi stesen aktif');
	const focused = markers.at(-1).find((m) => m.id === toy.id);
	assert.ok(focused, 'Prop terfokus mesti diunjur');
	assert.ok(Array.isArray(focused.layers), 'Marker terfokus mesti membawa lapisan');
	assert.equal(focused.layers.length, 3, 'Mesti ada 3 titik sauh lapisan (top/mid/base)');
	const keys = focused.layers.map((l) => l.layer).sort();
	assert.deepEqual(keys, ['base', 'mid', 'top']);
	for (const l of focused.layers) {
		assert.ok(Number.isFinite(l.x) && Number.isFinite(l.y));
		assert.equal(typeof l.visible, 'boolean');
	}
});
