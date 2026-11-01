import * as THREE from 'three';

/**
 * `diorama-props.ts` — Pustaka siluet 3D 21 Diorama (Sesi 2).
 *
 * Pecah daripada `FiberSpineWorld.buildTactileProp` supaya pascal bulat 360°
 * tidak membengkak. Setiap hotspot mempunyai siluet fizikal unik (Tiada dua serupa)
 * lengkap dengan papan tanda kod diegetik dan tapak pedestal yang dikongsi.
 * Siluet prosedural berfungsi serta-merta; aset GLB CC BY 4.0 ditukar masuk
 * secara malas sebagai lapisan visual tambahan (lihat `DIORAMA_GLB_MAP`).
 */

/** Peta hotspot -> model GLB ringan CC BY 4.0 (dimuat malas, bukan penyekat). */
export const DIORAMA_GLB_MAP: Record<string, { path: string; targetHeight: number; spin: number }> =
	{
		'core-ring-sys': { path: '/models/astrolabe-lo.glb', targetHeight: 0.56, spin: 0.35 },
		'net-soc': { path: '/models/drone.glb', targetHeight: 0.6, spin: 0.45 },
		'net-tnb-fiber': { path: '/models/nautilus.glb', targetHeight: 0.58, spin: 0.28 }
	};

export function createBeveledSlabGeometry(
	width: number,
	height: number,
	depth: number,
	radius = 0.05,
	bevel = 0.025
): THREE.BufferGeometry {
	const rw = Math.max(0.02, width - bevel * 2);
	const rh = Math.max(0.02, height - bevel * 2);
	const r = Math.min(radius, rw * 0.45, rh * 0.45);
	const hw = rw * 0.5;
	const hh = rh * 0.5;

	const shape = new THREE.Shape();
	shape.moveTo(-hw + r, -hh);
	shape.lineTo(hw - r, -hh);
	shape.absarc(hw - r, -hh + r, r, -Math.PI / 2, 0, false);
	shape.lineTo(hw, hh - r);
	shape.absarc(hw - r, hh - r, r, 0, Math.PI / 2, false);
	shape.lineTo(-hw + r, hh);
	shape.absarc(-hw + r, hh - r, r, Math.PI / 2, Math.PI, false);
	shape.lineTo(-hw, -hh + r);
	shape.absarc(-hw + r, -hh + r, r, Math.PI, Math.PI * 1.5, false);

	const extrudeDepth = Math.max(0.01, depth - bevel * 2);
	const geo = new THREE.ExtrudeGeometry(shape, {
		depth: extrudeDepth,
		bevelEnabled: true,
		bevelSegments: 4,
		steps: 1,
		bevelSize: bevel,
		bevelThickness: bevel,
		curveSegments: 8
	});
	geo.center();
	return geo;
}

/**
 * Mangkuk parabola 3D dwi-permukaan tertutup penuh (watertight solid manifold)
 * supaya piring radar/satelit kekal pepejal dari semua sudut pusingan 360°.
 */
export function createSolidDishGeometry(
	radius: number,
	depth: number,
	thickness = 0.036,
	segments = 36
): THREE.LatheGeometry {
	const pts: THREE.Vector2[] = [];
	const steps = 16;
	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		pts.push(new THREE.Vector2(t * radius, t * t * depth + thickness));
	}
	for (let i = steps; i >= 0; i--) {
		const t = i / steps;
		pts.push(new THREE.Vector2(t * radius, t * t * depth));
	}
	const geo = new THREE.LatheGeometry(pts, segments);
	geo.computeVertexNormals();
	return geo;
}

export interface DioramaMaterials {
	metal: (color: number, accent?: number, roughness?: number) => THREE.MeshPhysicalMaterial;
	glass: (tint?: number) => THREE.MeshPhysicalMaterial;
	glow: (color: number, emissive: number, intensity: number) => THREE.MeshStandardMaterial;
}

export interface DioramaBuildContext {
	id: string;
	code: string;
	stationIndex: number;
	accentHex: number;
	materials: DioramaMaterials;
}

export interface DioramaPropBuild {
	root: THREE.Group;
	spinAxis: THREE.Object3D;
	kind: string;
	haloMat: THREE.MeshStandardMaterial;
}

/** Teks kod diegetik pada tapak; jatuh senyap ke plat kosong apabila tiada konteks 2D. */
function createNameplateTexture(code: string, accentHex: number): THREE.CanvasTexture | null {
	let canvas: HTMLCanvasElement | null = null;
	try {
		if (typeof document === 'undefined') return null;
		canvas = document.createElement('canvas');
	} catch {
		return null;
	}
	if (!canvas || typeof canvas.getContext !== 'function') return null;
	canvas.width = 256;
	canvas.height = 80;
	const ctx = canvas.getContext('2d');
	if (!ctx) return null;

	const accent = '#' + accentHex.toString(16).padStart(6, '0');
	ctx.fillStyle = 'rgba(10, 16, 28, 0.88)';
	ctx.fillRect(0, 0, 256, 80);
	ctx.strokeStyle = accent;
	ctx.lineWidth = 3;
	ctx.strokeRect(4, 4, 248, 72);

	ctx.fillStyle = accent;
	ctx.fillRect(24, 18, 6, 18);

	ctx.fillStyle = '#e8f4ff';
	ctx.font = '700 26px "JetBrains Mono", "Consolas", monospace';
	ctx.textBaseline = 'middle';
	ctx.fillText(code, 44, 40);

	const tex = new THREE.CanvasTexture(canvas);
	tex.colorSpace = THREE.SRGBColorSpace;
	tex.anisotropy = 4;
	return tex;
}

/** Tapak pedestal berbevel dikongsi oleh kesemua 21 prop. */
function buildCommonBase(
	propGroup: THREE.Group,
	M: DioramaMaterials,
	accentHex: number,
	haloMat: THREE.MeshStandardMaterial
): void {
	const plinthMat = M.metal(0x223249, accentHex, 0.16);

	const basePlinth = new THREE.Mesh(
		createBeveledSlabGeometry(1.32, 0.24, 1.32, 0.08, 0.03),
		plinthMat
	);
	basePlinth.position.y = 0.12;
	basePlinth.castShadow = true;
	basePlinth.receiveShadow = true;
	propGroup.add(basePlinth);

	const plinthCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.14, 28), plinthMat);
	plinthCollar.position.y = 0.26;
	propGroup.add(plinthCollar);

	// Alur pengapit rata (bukan cincin terapung) supaya tapak terbaca sebagai mesin
	// kejuruteraan, bukan pelampung tiub mainan.
	const clampRing = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.028, 32), haloMat);
	clampRing.position.y = 0.265;
	propGroup.add(clampRing);
}

/** Papan tanda kod tidak-mengganggu di hadapan tapak; merangkumi fallback tanpa teks. */
function buildNameplate(
	propGroup: THREE.Group,
	code: string,
	accentHex: number,
	M: DioramaMaterials
): void {
	const plate = new THREE.Group();
	const backing = new THREE.Mesh(
		createBeveledSlabGeometry(0.94, 0.24, 0.1, 0.03, 0.015),
		M.metal(0x0f172a, accentHex, 0.3)
	);
	plate.add(backing);

	const tex = createNameplateTexture(code, accentHex);
	if (tex) {
		const face = new THREE.Mesh(
			new THREE.PlaneGeometry(0.86, 0.18),
			new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })
		);
		face.position.z = 0.056;
		plate.add(face);
	}

	plate.position.set(0, 0.12, 0.665);
	plate.rotation.x = 0;
	propGroup.add(plate);
}

export function buildDioramaProp(ctx: DioramaBuildContext): DioramaPropBuild {
	const { id, code, stationIndex, accentHex } = ctx;
	const M = ctx.materials;

	const propGroup = new THREE.Group();
	const chromeMat = M.metal(0xe2e8f0, undefined, 0.12);
	chromeMat.side = THREE.DoubleSide;
	const glassMat = M.glass(accentHex);
	const glowMat = M.glow(accentHex, accentHex, 0.58);
	const haloMat = M.glow(accentHex, accentHex, 0.55);

	buildCommonBase(propGroup, M, accentHex, haloMat);
	buildNameplate(propGroup, code, accentHex, M);

	let spinAxis: THREE.Object3D = propGroup;
	let kind = 'default';

	// Akar siluet berputar dinamakan seragam supaya pemuat GLB boleh menggantikannya.
	const silhouette = new THREE.Group();
	silhouette.name = 'diorama-silhouette';
	silhouette.position.y = 0.34;
	propGroup.add(silhouette);

	if (stationIndex === 0) {
		// Stesen 01 · Core Profile — Menara Rumah Api Optik / Astrolab / Kubah Geodesik.
		if (id === 'core-monolith') {
			kind = 'lighthouse';
			const tower = new THREE.Mesh(
				new THREE.CylinderGeometry(0.2, 0.34, 0.86, 24),
				M.metal(0x1e293b, accentHex, 0.16)
			);
			tower.position.y = 0.34;
			silhouette.add(tower);

			for (let b = 0; b < 2; b++) {
				const band = new THREE.Mesh(
					new THREE.TorusGeometry(0.24 + b * 0.05, 0.024, 12, 32),
					b === 0 ? glowMat : chromeMat
				);
				band.rotation.x = Math.PI / 2;
				band.position.y = 0.28 + b * 0.36;
				silhouette.add(band);
			}

			const lantern = new THREE.Group();
			lantern.position.y = 0.88;
			silhouette.add(lantern);
			const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), glowMat);
			lantern.add(beacon);
			const beaconRing = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.028, 16, 40), chromeMat);
			beaconRing.rotation.x = Math.PI * 0.4;
			lantern.add(beaconRing);
			spinAxis = lantern;
		} else if (id === 'core-ring-sys') {
			// Astrolab Kejuruteraan Berlapis (proksi tersedia; GLB swap masuk).
			kind = 'astrolabe_gear';
			const hub = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), glowMat);
			hub.position.y = 0.55;
			silhouette.add(hub);
			for (let r = 0; r < 3; r++) {
				const gear = new THREE.Mesh(
					new THREE.TorusGeometry(0.34 + r * 0.13, 0.026, 14, 48),
					r === 1 ? glowMat : chromeMat
				);
				gear.position.y = 0.55;
				gear.rotation.set(r * 0.8 + 0.3, r * 1.05, r * 0.45);
				silhouette.add(gear);
			}
			const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.16, 0.5, 18), glowMat);
			spoke.position.y = 0.55;
			spoke.rotation.z = Math.PI / 2;
			silhouette.add(spoke);
			spinAxis = silhouette;
		} else {
			// core-ring-net — Perisai Kubah Geodesik Siber.
			kind = 'geodesic_dome';
			const dome = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 1), glassMat);
			dome.position.y = 0.4;
			silhouette.add(dome);
			const coreNode = new THREE.Mesh(new THREE.OctahedronGeometry(0.15, 0), glowMat);
			coreNode.position.y = 0.4;
			silhouette.add(coreNode);
			const equator = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.026, 16, 44), chromeMat);
			equator.rotation.x = Math.PI / 2;
			equator.position.y = 0.42;
			silhouette.add(equator);
			spinAxis = silhouette;
		}
	} else if (stationIndex === 1) {
		// Stesen 02 · Enterprise Work — 3 Menara Blade Korporat.
		if (id === 'ent-emesys') {
			kind = 'blade_cluster';
			for (let b = 0; b < 3; b++) {
				const blade = new THREE.Mesh(
					createBeveledSlabGeometry(0.3, 0.82, 0.62, 0.035, 0.02),
					M.metal(0x1e293b, accentHex, 0.18 + b * 0.1)
				);
				blade.position.set(-0.36 + b * 0.36, 0.42, 0);
				blade.rotation.y = b * 0.18 - 0.18;
				blade.castShadow = true;
				silhouette.add(blade);
				const led = new THREE.Mesh(
					createBeveledSlabGeometry(0.16, 0.03, 0.64, 0.008, 0.004),
					b === 1 ? chromeMat : glowMat
				);
				led.position.set(-0.36 + b * 0.36, 0.5 + b * 0.14, 0);
				silhouette.add(led);
			}
			const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.78, 16), glowMat);
			spine.position.y = 0.44;
			silhouette.add(spine);
			const crown = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), glassMat);
			crown.position.y = 0.98;
			silhouette.add(crown);
			spinAxis = silhouette;
		} else if (id === 'ent-sutera') {
			// Peti Besi Kaca RLS & Gerbang JWT.
			kind = 'glass_vault';
			const vault = new THREE.Mesh(createBeveledSlabGeometry(0.7, 0.6, 0.66, 0.06, 0.03), glassMat);
			vault.position.y = 0.46;
			silhouette.add(vault);
			const rlsCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), glowMat);
			rlsCore.position.y = 0.46;
			silhouette.add(rlsCore);
			const gate = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.028, 16, 48), chromeMat);
			gate.rotation.x = Math.PI * 0.34;
			gate.position.y = 0.46;
			silhouette.add(gate);
			for (let n = 0; n < 3; n++) {
				const a = (n / 3) * Math.PI * 2;
				const node = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 14), glowMat);
				node.position.set(Math.cos(a) * 0.42, 0.46, Math.sin(a) * 0.42);
				silhouette.add(node);
			}
			spinAxis = silhouette;
		} else {
			// ent-adims — Stesen Dok Mudah Alih & Awan Azure.
			kind = 'mobile_dock';
			for (const sx of [-0.24, 0.24]) {
				const screen = new THREE.Mesh(
					createBeveledSlabGeometry(0.5, 0.34, 0.06, 0.04, 0.02),
					chromeMat
				);
				screen.position.set(sx, 0.42, 0);
				screen.rotation.y = sx > 0 ? -0.24 : 0.24;
				screen.castShadow = true;
				silhouette.add(screen);
			}
			const cloud = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.024, 14, 40), glowMat);
			cloud.rotation.z = Math.PI * 0.24;
			cloud.position.y = 0.3;
			silhouette.add(cloud);
			for (let n = 0; n < 4; n++) {
				const a = (n / 4) * Math.PI * 2;
				const db = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 14), glassMat);
				db.position.set(Math.cos(a) * 0.3, 0.12, Math.sin(a) * 0.3);
				silhouette.add(db);
			}
			spinAxis = silhouette;
		}
	} else if (stationIndex === 2) {
		// Stesen 03 · TNB SOC & ICT.
		if (id === 'net-soc') {
			// Pemancar Pertahanan Siber SOC Dwi-Laras (menghala ke sasaran dron tengah pulau).
			kind = 'laser_turret';
			const pedestal = new THREE.Mesh(
				new THREE.CylinderGeometry(0.36, 0.48, 0.56, 24),
				M.metal(0x1e293b, accentHex, 0.2)
			);
			pedestal.position.y = 0.2;
			silhouette.add(pedestal);

			const turretHead = new THREE.Group();
			turretHead.position.y = 0.72;
			silhouette.add(turretHead);
			spinAxis = turretHead;

			const housing = new THREE.Mesh(
				createBeveledSlabGeometry(0.84, 0.46, 0.86, 0.06, 0.025),
				chromeMat
			);
			housing.castShadow = true;
			turretHead.add(housing);

			const dome = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 16), glassMat);
			dome.position.y = 0.24;
			turretHead.add(dome);

			for (const bx of [-0.21, 0.21]) {
				const barrel = new THREE.Mesh(
					new THREE.CylinderGeometry(0.05, 0.068, 0.78, 16),
					M.metal(0x1e293b, accentHex, 0.2)
				);
				barrel.rotation.x = Math.PI / 2;
				barrel.position.set(bx, 0.04, -0.48);
				turretHead.add(barrel);

				const muzzle = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.018, 12, 24), glowMat);
				muzzle.position.set(bx, 0.04, -0.88);
				turretHead.add(muzzle);
			}

			const frontVisor = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.026, 14, 32), glowMat);
			frontVisor.position.set(0, 0.02, 0.44);
			turretHead.add(frontVisor);
		} else if (id === 'net-tnb-fiber') {
			// Stesen Pendaratan Kabel Dasar Laut (proksi); nautilus GLB swap masuk.
			kind = 'fiber_landing';
			const mast = new THREE.Mesh(
				new THREE.CylinderGeometry(0.16, 0.28, 0.68, 22),
				M.metal(0x1e293b, accentHex, 0.16)
			);
			mast.position.y = 0.26;
			silhouette.add(mast);

			// Kolar pengapit kabel modular heksagon (bukan tiga tiub pelampung).
			for (let r = 0; r < 3; r++) {
				const clamp = new THREE.Mesh(
					new THREE.CylinderGeometry(0.3 - r * 0.035, 0.34 - r * 0.035, 0.075, 6),
					r === 1 ? glowMat : chromeMat
				);
				clamp.rotation.y = r * 0.52;
				clamp.position.y = 0.2 + r * 0.15;
				silhouette.add(clamp);

				const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.36, 8), chromeMat);
				bolt.rotation.z = Math.PI / 2;
				bolt.position.y = 0.2 + r * 0.15;
				silhouette.add(bolt);
			}

			const core = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.74, 14), glowMat);
			core.position.y = 0.4;
			silhouette.add(core);
			const tip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 18, 18), glowMat);
			tip.position.y = 0.86;
			silhouette.add(tip);
			spinAxis = silhouette;
		} else {
			// net-utm-degree — Rak Pelayan Homelab Terbuka.
			kind = 'homelab';
			for (const px of [-0.42, 0.42]) {
				const post = new THREE.Mesh(
					new THREE.CylinderGeometry(0.035, 0.035, 0.88, 12),
					M.metal(0x1e293b, accentHex, 0.18)
				);
				post.position.set(px, 0.36, 0);
				silhouette.add(post);
			}
			for (let t = 0; t < 3; t++) {
				const tray = new THREE.Mesh(
					createBeveledSlabGeometry(0.92, 0.05, 0.5, 0.02, 0.01),
					M.metal(0x1e293b, accentHex, 0.22)
				);
				tray.position.y = 0.14 + t * 0.24;
				silhouette.add(tray);
				const fan = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 10, 24), glowMat);
				fan.position.set(0, 0.18 + t * 0.24, 0.25);
				silhouette.add(fan);
			}
			const fw = new THREE.Mesh(createBeveledSlabGeometry(0.24, 0.18, 0.4, 0.03, 0.015), chromeMat);
			fw.position.set(0.56, 0.62, 0);
			silhouette.add(fw);
			spinAxis = silhouette;
		}
	} else if (stationIndex === 3) {
		// Stesen 04 · 5 Projek Unggulan — arca 3D tertutup penuh.
		const column = new THREE.Mesh(
			new THREE.CylinderGeometry(0.18, 0.3, 0.54, 22),
			M.metal(0x1e293b, accentHex, 0.16)
		);
		column.position.y = 0.2;
		silhouette.add(column);

		const mount = new THREE.Group();
		mount.position.y = 0.86;
		silhouette.add(mount);
		spinAxis = mount;

		if (id === 'ai-cv-rag') {
			// Kepala Lensa Kamera Bukaan Mekanikal (Aperture Iris).
			kind = 'ai_lens';
			const outerGimbal = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.04, 16, 48), chromeMat);
			mount.add(outerGimbal);

			const barrel = new THREE.Mesh(
				new THREE.CylinderGeometry(0.4, 0.4, 0.34, 32),
				M.metal(0x1e293b, accentHex, 0.18)
			);
			barrel.rotation.x = Math.PI / 2;
			mount.add(barrel);

			const lensGlass = new THREE.Mesh(new THREE.SphereGeometry(0.36, 28, 28), glassMat);
			lensGlass.scale.set(1, 1, 0.62);
			mount.add(lensGlass);

			for (const zSide of [-0.18, 0.18]) {
				const irisRing = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.032, 16, 36), glowMat);
				irisRing.position.z = zSide;
				mount.add(irisRing);
			}
		} else if (id === 'ai-9router') {
			// Meja Orkestrasi 9-Ejen MCP.
			kind = 'mcp_table';
			const table = new THREE.Mesh(
				createBeveledSlabGeometry(0.9, 0.12, 0.9, 0.05, 0.02),
				M.metal(0x1e293b, accentHex, 0.2)
			);
			table.position.y = -0.2;
			mount.add(table);
			const hubCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), glowMat);
			mount.add(hubCore);
			for (let n = 0; n < 9; n++) {
				const a = (n / 9) * Math.PI * 2;
				const sat = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 14), glassMat);
				sat.position.set(Math.cos(a) * 0.44, Math.sin(a * 2) * 0.12, Math.sin(a) * 0.44);
				mount.add(sat);
			}
			for (let r = 0; r < 2; r++) {
				const ring = new THREE.Mesh(
					new THREE.TorusGeometry(0.54, 0.024, 16, 48),
					r === 0 ? chromeMat : glowMat
				);
				ring.rotation.set(r * Math.PI * 0.5, r * 0.7, 0.4);
				mount.add(ring);
			}
		} else if (id === 'proj-pin-bik') {
			// Kapsul Biometrik Denyutan Harmoni.
			kind = 'bio_capsule';
			const bioSphere = new THREE.Mesh(new THREE.SphereGeometry(0.36, 28, 28), glassMat);
			mount.add(bioSphere);
			const heartCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), glowMat);
			mount.add(heartCore);
			for (const tilt of [-0.55, 0.55]) {
				const waveRing = new THREE.Mesh(
					new THREE.TorusGeometry(0.52, 0.026, 16, 48),
					tilt > 0 ? glowMat : chromeMat
				);
				waveRing.rotation.x = Math.PI * 0.5 + tilt;
				mount.add(waveRing);
			}
		} else if (id === 'proj-pin-lumina') {
			// Cermin Pintar LED Kelvin (3000K–6500K).
			kind = 'kelvin_mirror';
			const mirrorDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.08, 36), chromeMat);
			mirrorDisc.rotation.x = Math.PI / 2;
			mount.add(mirrorDisc);
			const warmRing = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.034, 16, 48), glowMat);
			warmRing.rotation.x = Math.PI / 2;
			mount.add(warmRing);
			const coolLed = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), glowMat);
			coolLed.position.y = 0.2;
			mount.add(coolLed);
		} else {
			// ai-tindak — Enjin Prisma Share-Intent (3 laluan warna).
			kind = 'intent_prism';
			for (const c of [0, 1, 2]) {
				const lane = new THREE.Mesh(
					createBeveledSlabGeometry(0.5, 0.68, 0.05, 0.03, 0.015),
					c === 0 ? glowMat : c === 1 ? glassMat : chromeMat
				);
				lane.rotation.y = (c / 3) * Math.PI * 2 + 0.3;
				lane.position.x = Math.cos((c / 3) * Math.PI * 2) * 0.18;
				lane.position.z = Math.sin((c / 3) * Math.PI * 2) * 0.18;
				mount.add(lane);
			}
			const prismCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), glassMat);
			mount.add(prismCore);
		}
	} else if (stationIndex === 4) {
		// Stesen 05 · 3 Monolit Konstelasi Kemahiran.
		kind = 'skill_monolith';
		const stem = new THREE.Mesh(
			new THREE.CylinderGeometry(0.14, 0.24, 0.44, 20),
			M.metal(0x1e293b, accentHex, 0.16)
		);
		stem.position.y = 0.16;
		silhouette.add(stem);

		const matrixRotor = new THREE.Group();
		matrixRotor.position.y = 0.84;
		silhouette.add(matrixRotor);
		spinAxis = matrixRotor;

		if (id === 'mob-onboardx') {
			// Pangkalan Data, Awan, DevOps & Keselamatan — Silinder Storan Bertingkat + Gelang Perisai.
			for (let d = 0; d < 3; d++) {
				const disc = new THREE.Mesh(
					new THREE.CylinderGeometry(0.38, 0.38, 0.16, 28),
					M.metal(0x1e293b, accentHex, 0.2)
				);
				disc.position.y = -0.26 + d * 0.26;
				matrixRotor.add(disc);
				const ring = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.02, 12, 36), glowMat);
				ring.rotation.x = Math.PI / 2;
				ring.position.y = -0.18 + d * 0.26;
				matrixRotor.add(ring);
			}
			const shieldLoop = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.028, 16, 48), chromeMat);
			matrixRotor.add(shieldLoop);
		} else if (id === 'mob-bik-lumina') {
			// AI, MCP, OpenCV & Alat Pelayan — Sangkar Neural Ikosahedron + Satelit Sinaps.
			const brain = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 1), glassMat);
			matrixRotor.add(brain);
			const innerSpark = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), glowMat);
			matrixRotor.add(innerSpark);
			for (let s = 0; s < 3; s++) {
				const loop = new THREE.Mesh(
					new THREE.TorusGeometry(0.52, 0.024, 14, 44),
					s === 0 ? glowMat : chromeMat
				);
				loop.rotation.set(s * 1.05, s * 0.75, 0.3);
				matrixRotor.add(loop);
			}
		} else {
			// mob-nova-loan — Frontend, Mudah Alih & Backend APIs — 3 Lapisan Modul + Gelang API.
			for (let l = 0; l < 3; l++) {
				const layer = new THREE.Mesh(
					createBeveledSlabGeometry(0.72 - l * 0.08, 0.13, 0.72 - l * 0.08, 0.04, 0.02),
					l === 1 ? glassMat : M.metal(0x1e293b, accentHex, 0.2)
				);
				layer.position.y = -0.24 + l * 0.24;
				layer.rotation.y = l * 0.52;
				matrixRotor.add(layer);
			}
			const apiRing = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.03, 16, 48), glowMat);
			apiRing.rotation.x = Math.PI * 0.32;
			matrixRotor.add(apiRing);
		}
	} else {
		// Stesen 06 · Komunikasi Satelit & Pendidikan UTM — piring dwi-permukaan pepejal.
		kind = 'satellite';
		const mastMesh = new THREE.Mesh(
			new THREE.CylinderGeometry(0.16, 0.3, 0.74, 22),
			M.metal(0x1e293b, accentHex, 0.16)
		);
		mastMesh.position.y = 0.28;
		silhouette.add(mastMesh);

		const satRotor = new THREE.Group();
		satRotor.position.y = 0.86;
		silhouette.add(satRotor);
		spinAxis = satRotor;

		const dishMesh = new THREE.Mesh(createSolidDishGeometry(0.54, 0.24, 0.038, 36), chromeMat);
		dishMesh.rotation.x = Math.PI * 0.25;
		dishMesh.castShadow = true;
		satRotor.add(dishMesh);

		const feedStem = new THREE.Mesh(
			new THREE.CylinderGeometry(0.026, 0.044, 0.36, 16),
			M.metal(0x1e293b, accentHex, 0.18)
		);
		feedStem.position.y = 0.19;
		dishMesh.add(feedStem);

		// Emblem unik bagi setiap konsol supaya 4 satelit tidak serupa.
		const pulseCore =
			id === 'term-email'
				? new THREE.Mesh(new THREE.SphereGeometry(0.1, 18, 18), glowMat)
				: id === 'term-github'
					? new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), glowMat)
					: id === 'term-linkedin'
						? new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 0), glowMat)
						: new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.03, 12, 24), glowMat);
		pulseCore.position.y = 0.38;
		dishMesh.add(pulseCore);

		const waveHalo = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.018, 12, 32), glowMat);
		waveHalo.rotation.x = Math.PI / 2;
		waveHalo.position.y = 0.38;
		dishMesh.add(waveHalo);
	}

	const res = { root: propGroup, spinAxis, kind, haloMat };
	silhouette.traverse((child) => {
		if (child !== silhouette) child.userData.isSilhouettePart = true;
	});
	return res;
}
