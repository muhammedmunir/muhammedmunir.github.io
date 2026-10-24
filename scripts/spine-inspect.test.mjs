import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import * as THREE from 'three';
import { createServer } from 'vite';

// Uji logik dunia dan raycasting sebenar tanpa WebGL atau pelayar.
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
after(() => vite.close());
const { FiberSpineWorld } = await vite.ssrLoadModule('/src/lib/spine/FiberSpineWorld.ts');
const { STATIONS } = await vite.ssrLoadModule('/src/lib/spine/spine-data.ts');
const { getInspectDistance } = await vite.ssrLoadModule('/src/lib/spine/exhibit-screen.ts');

const palette = {
	background: '#101010', surface: '#202020', text: '#ffffff', muted: '#bbbbbb',
	accent: '#77bbff', border: '#777777', hover: '#333333', onAccent: '#101010',
	fontBody: 'sans-serif', fontMono: 'monospace'
};

function canvas(width = 900, height = 575) {
	const operations = [];
	const context = {
		font: '16px sans-serif',
		save() {}, restore() {}, setTransform() {}, clearRect() {}, fillRect() {}, strokeRect() {},
		beginPath() {}, closePath() {}, moveTo() {}, lineTo() {}, rect() {}, roundRect() {}, arc() {},
		clip() {}, fill() {}, stroke() {},
		fillText(text) { operations.push(text); },
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
	const snapshots = [];
	const world = new FiberSpineWorld({ clientWidth: width, clientHeight: height }, {
		onHotspotSelect: (id, stationIndex) => selections.push({ id, stationIndex }),
		onScreenUpdate: (snapshot) => snapshots.push(snapshot)
	});
	world.clock = { getElapsedTime: () => 10 };
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
	for (const station of STATIONS) {
		for (const hotspot of station.hotspots) {
			const mesh = new THREE.Group();
			mesh.position.set(station.index * 8 + world.hotspots.length * 3, 0.3, -station.index * 5);
			mesh.rotation.y = station.index * Math.PI / 3;
			const screenMat = new THREE.MeshStandardMaterial();
			const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.66, 1.7), screenMat);
			screenMesh.position.set(0, 1.52, 0.095);
			mesh.add(screenMesh);
			world.scene.add(mesh);
			world.hotspots.push({
				id: hotspot.id, stationIndex: station.index, hotspot, mesh, screenMesh, screenMat,
				canvas: canvas(), texture: new THREE.Texture(), regions: [],
				accentMat: new THREE.MeshStandardMaterial(), screenWidth: 2.66, screenHeight: 1.7
			});
		}
	}
	return { world, selections, snapshots };
}

function settle(world) {
	for (let frame = 0; frame < 300; frame++) world.updateCamera(1 / 60, 0);
	world.camera.updateMatrixWorld();
}

function selected(world) {
	return world.hotspots.find((record) => record.id === world.selectedHotspotId);
}

function eventAt(world, record, x, y, overrides = {}) {
	record.screenMesh.updateWorldMatrix(true, false);
	const point = new THREE.Vector3(
		(x / record.canvas.width - 0.5) * 2.66,
		(0.5 - y / record.canvas.height) * 1.7,
		0
	).applyMatrix4(record.screenMesh.matrixWorld).project(world.camera);
	const rect = world.renderer.domElement.getBoundingClientRect();
	return {
		clientX: rect.left + (point.x + 1) * rect.width / 2,
		clientY: rect.top + (1 - point.y) * rect.height / 2,
		pointerId: 1, button: 0, isPrimary: true, ...overrides
	};
}

function regionEvent(world, id, overrides) {
	const record = selected(world);
	const region = record.regions.find((item) => item.id === id);
	assert.ok(region, `Kawasan ${id} mesti wujud`);
	return eventAt(world, record, region.x + region.width / 2, region.y + region.height / 2, overrides);
}

function click(world, event) {
	world.onPointerDown(event);
	world.onPointerUp(event);
}

function withDocument(run) {
	const original = Object.getOwnPropertyDescriptor(globalThis, 'document');
	Object.defineProperty(globalThis, 'document', { configurable: true, value: { createElement: () => canvas() } });
	try { run(); } finally {
		if (original) Object.defineProperty(globalThis, 'document', original);
		else delete globalThis.document;
	}
}

test('Pemilihan melukis kawalan, mengekalkan input dan memulihkan pratonton apabila ditutup', () => {
	const { world, snapshots } = fixture();
	for (const record of world.hotspots) {
		world.selectHotspot(record.id);
		assert.equal(world.screenReady, true);
		assert.equal(world.inputEnabled, true);
		assert.equal(snapshots.at(-1).view.key, `hotspot:${record.id}`);
		assert.ok(record.regions.some((region) => region.id === 'close'));
		assert.ok(world.hotspots.filter((other) => other !== record).every((other) => !other.regions.length));
	}
	world.selectHotspot(null);
	assert.equal(world.screenReady, false);
	assert.equal(world.screenRoute, null);
	assert.equal(snapshots.at(-1), null);
	assert.ok(world.hotspots.every((record) => !record.regions.length));
});

test('Kamera menghadap pusat monitor tanpa parallax pada semua terminal dan nisbah aspek', () => {
	for (const [width, height] of [[1280, 800], [390, 844], [844, 390]]) {
		const { world } = fixture(width, height);
		for (const record of world.hotspots) {
			world.selectHotspot(record.id);
			settle(world);
			const center = record.screenMesh.getWorldPosition(new THREE.Vector3());
			const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(record.mesh.quaternion);
			const offset = world.camera.position.clone().sub(center);
			assert.ok(offset.clone().normalize().distanceTo(normal) < 1e-6);
			const projected = center.clone().project(world.camera);
			assert.ok(Math.abs(projected.x) < 1e-6 && Math.abs(projected.y) < 1e-6);
			const distance = getInspectDistance(2.66, 1.7, width / height, world.camera.fov, 0.88);
			assert.ok(Math.abs(offset.length() - distance) < 1e-6);
			const before = world.camera.position.clone();
			world.pointerNdc.set(-0.9, 0.8);
			settle(world);
			assert.ok(world.camera.position.distanceTo(before) < 1e-6);
		}
	}
});

test('Frame inspect pertama menyasarkan monitor, bukan titik asal dunia', () => {
	const { world } = fixture();
	world.selectHotspot(STATIONS[4].hotspots[0].id);
	world.updateCamera(1 / 60, 0);
	assert.ok(world.currentInspectCamPos.distanceTo(world.targetInspectCamPos) < 1e-9);
	world.reducedMotion = true;
	world.updateCamera(1 / 60, 0);
	assert.ok(world.camera.position.distanceTo(world.targetInspectCamPos) < 1e-9);
});

test('Raycasting UV memberi hover dan press; klik Tutup memulihkan orbit', () => {
	const { world, selections } = fixture();
	world.selectHotspot(STATIONS[0].hotspots[0].id);
	settle(world);
	const event = regionEvent(world, 'close');
	world.onPointerMove(event);
	assert.equal(world.hoveredRegionId, 'close');
	assert.equal(world.renderer.domElement.style.cursor, 'pointer');
	world.onPointerDown(event);
	assert.equal(world.pressedRegionId, 'close');
	world.onPointerUp(event);
	assert.equal(world.selectedHotspotId, null);
	assert.equal(selections.at(-1).id, '');
	settle(world);
	assert.equal(world.inspectBlend, 0);
});

test('Klik isi kosong atau butang disabled tidak menutup; klik luar monitor menutup', () => {
	const { world } = fixture();
	world.selectHotspot(STATIONS[0].hotspots[0].id);
	settle(world);
	const id = world.selectedHotspotId;
	click(world, eventAt(world, selected(world), 4, 4));
	assert.equal(world.selectedHotspotId, id);
	click(world, regionEvent(world, 'back'));
	assert.equal(world.selectedHotspotId, id);
	click(world, { clientX: 26, clientY: 38, pointerId: 1, button: 0, isPrimary: true });
	assert.equal(world.selectedHotspotId, null);
});

test('Seretan, klik kanan, pointer lain dan pembatalan tidak mengaktifkan kawalan', () => {
	const { world } = fixture();
	world.selectHotspot(STATIONS[0].hotspots[0].id);
	settle(world);
	const id = world.selectedHotspotId;
	const event = regionEvent(world, 'close');
	click(world, { ...event, button: 2 });
	assert.equal(world.selectedHotspotId, id);
	world.onPointerDown(event);
	world.onPointerUp({ ...event, pointerId: 2 });
	assert.equal(world.selectedHotspotId, id);
	world.onPointerMove({ ...event, clientX: event.clientX + 20 });
	world.onPointerUp(event);
	assert.equal(world.selectedHotspotId, id);
	assert.equal(world.targetYawOffset, 0);
	assert.equal(world.targetPitchOffset, 0);
	world.onPointerDown(event);
	world.onPointerCancel(event);
	world.onPointerUp(event);
	assert.equal(world.selectedHotspotId, id);
	assert.equal(world.pressedRegionId, null);
	world.onPointerDown(event);
	world.setInputEnabled(false);
	world.onPointerUp(event);
	assert.equal(world.selectedHotspotId, id);
	assert.equal(world.pointerId, null);
});

test('Navigasi cip, Kembali dan pemilihan berulang mengekalkan laluan serta sejarah', () => {
	withDocument(() => {
		const { world } = fixture();
		world.selectHotspot('ent-sutera');
		world.performScreenAction({ kind: 'navigate', route: { kind: 'project', id: 'proj-loan-iwa001' } });
		world.selectHotspot('ent-sutera');
		assert.equal(world.screenRoute.kind, 'project');
		assert.equal(world.screenHistory.length, 1);
		world.updateScreenTransition(1);
		world.performScreenAction({ kind: 'back' });
		assert.deepEqual(world.screenRoute, { kind: 'hotspot', id: 'ent-sutera' });
		assert.equal(world.screenHistory.length, 0);
		world.updateScreenTransition(1);
		// Callback UI memanggil selectHotspot sekali lagi semasa pertukaran terminal.
		world.callbacks.onHotspotSelect = (id) => world.selectHotspot(id || null);
		world.performScreenAction({ kind: 'navigate', route: { kind: 'hotspot', id: 'ent-emesys' } });
		assert.equal(world.selectedHotspotId, 'ent-emesys');
		assert.equal(world.screenHistory.length, 1);
		world.performScreenAction({ kind: 'back' });
		assert.equal(world.selectedHotspotId, 'ent-sutera');
		assert.equal(world.screenHistory.length, 0);
	});
});

test('Klik cip projek dan Kembali melalui UV memulihkan halaman asal', () => {
	withDocument(() => {
		const { world } = fixture();
		world.selectHotspot('ent-sutera');
		const record = selected(world);
		let chip;
		for (let page = 0; page < world.screenPageCount; page++) {
			chip = record.regions.find((region) =>
				region.action.kind === 'navigate' &&
				region.action.route.kind === 'project' &&
				region.action.route.id === 'proj-loan-iwa001'
			);
			if (chip) break;
			world.performScreenAction({ kind: 'page', delta: 1 });
			world.updateScreenTransition(1);
		}
		assert.ok(chip);
		const page = world.screenPage;
		settle(world);
		click(world, regionEvent(world, chip.id));
		assert.deepEqual(world.screenRoute, { kind: 'project', id: 'proj-loan-iwa001' });
		world.updateScreenTransition(1);
		click(world, regionEvent(world, 'back'));
		assert.deepEqual(world.screenRoute, { kind: 'hotspot', id: 'ent-sutera' });
		assert.equal(world.screenPage, page);
	});
});

test('Klik halaman menamatkan peralihan; skrin lama dilupus dan kawalan kembali aktif', () => {
	withDocument(() => {
		const { world } = fixture();
		world.selectHotspot('ent-emesys');
		const record = selected(world);
		record.canvas.width = 400;
		record.canvas.height = 256;
		world.redrawSelectedScreen();
		assert.ok(world.screenPageCount > 1);
		settle(world);
		click(world, regionEvent(world, 'page-next'));
		assert.equal(world.screenPage, 1);
		assert.equal(world.screenReady, false);
		const previous = world.previousScreen;
		assert.ok(previous);
		let disposed = 0;
		for (const resource of [previous.geometry, previous.material, previous.material.map]) {
			resource.addEventListener('dispose', () => disposed++);
		}
		world.updateScreenTransition(world.screenChangeDuration / 2);
		assert.ok(Math.abs(previous.material.opacity - 0.5) < 1e-6);
		world.updateScreenTransition(world.screenChangeDuration);
		assert.equal(world.previousScreen, null);
		assert.equal(previous.parent, null);
		assert.equal(disposed, 3);
		assert.equal(world.screenReady, true);
		click(world, regionEvent(world, 'page-previous'));
		assert.equal(world.screenPage, 0);
		world.selectHotspot('ent-sutera');
		assert.equal(world.previousScreen, null);
		assert.equal(world.screenPage, 0);
		assert.equal(world.screenReady, true);
	});
});

test('Mod reduced-motion melangkau peralihan dan butang arkib memanggil callback', () => {
	const { world } = fixture();
	world.reducedMotion = true;
	world.selectHotspot('ent-emesys');
	world.performScreenAction({ kind: 'navigate', route: { kind: 'project', id: 'proj-loan-iwa001' } });
	assert.equal(world.previousScreen, null);
	assert.equal(world.screenReady, true);
	let opened = false;
	world.callbacks.onOpenDossier = () => { opened = true; };
	world.performScreenAction({ kind: 'archive' });
	assert.equal(opened, true);
});

test('Resize mengekalkan nisbah monitor, menggantikan tekstur dan membatalkan peralihan lama', () => {
	withDocument(() => {
		const { world } = fixture();
		world.selectHotspot('ent-emesys');
		const record = selected(world);
		const texture = record.texture;
		let disposed = false;
		texture.addEventListener('dispose', () => { disposed = true; });
		world.performScreenAction({ kind: 'navigate', route: { kind: 'project', id: 'proj-loan-iwa001' } });
		world.container.clientWidth = 320;
		world.container.clientHeight = 568;
		world.onResize();
		assert.equal(disposed, true);
		assert.notEqual(record.texture, texture);
		assert.equal(record.screenMat.map, record.texture);
		assert.equal(record.screenMat.emissiveMap, record.texture);
		assert.ok(record.canvas.width >= 320 && record.canvas.height >= 240);
		assert.ok(Math.abs(record.canvas.width / record.canvas.height - 2.66 / 1.7) < 0.01);
		assert.equal(record.screenMesh.scale.y, 1);
		assert.equal(world.previousScreen, null);
		assert.equal(world.screenReady, true);
		settle(world);
		const center = record.screenMesh.getWorldPosition(new THREE.Vector3()).project(world.camera);
		assert.ok(Math.abs(center.x) < 1e-6 && Math.abs(center.y) < 1e-6);
		world.selectHotspot(null);
		assert.equal(record.canvas.width, 1440);
		assert.equal(record.canvas.height, 920);
	});
});

test('Navigasi papan menggunakan stesen terminal terpilih, bukan stesen kamera yang sedang bergerak', () => {
	const { world } = fixture();
	const station = STATIONS[3];
	world.selectHotspot(station.hotspots[0].id);
	assert.notEqual(world.activeStationIndex, station.index);
	world.performScreenAction({ kind: 'next' });
	assert.equal(world.selectedHotspotId, station.hotspots[1].id);
	world.performScreenAction({ kind: 'previous' });
	assert.equal(world.selectedHotspotId, station.hotspots[0].id);
});

test('W/S tidak mengorbit semasa inspect; Escape menutup dan menghalang pengendalian berganda', () => {
	const { world, selections } = fixture();
	world.heldKeys.add('w');
	world.selectHotspot('ent-emesys');
	assert.equal(world.heldKeys.size, 0);
	const progress = world.targetProgress;
	world.onKeyDown({ key: 'w' });
	world.updateCamera(1 / 60, 0);
	assert.equal(world.targetProgress, progress);
	let prevented = false;
	world.onKeyDown({ key: 'Escape', preventDefault() { prevented = true; } });
	assert.equal(prevented, true);
	assert.equal(world.selectedHotspotId, null);
	assert.equal(selections.at(-1).id, '');
});
