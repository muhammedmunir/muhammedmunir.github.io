import type * as Three from 'three';

import { CHAPTER_STAGE, STAGE_CHAPTER, SPATIAL_DIAGNOSTIC_KEY } from './contract';
import type {
	ChapterId,
	Options,
	SpatialDiagnostic,
	SpatialPose,
	SpatialScene,
	Stage
} from './contract';
export type {
	ChapterId,
	Options,
	SpatialDiagnostic,
	SpatialPose,
	SpatialScene,
	Stage
} from './contract';

/** Procedural, illustrative architecture — not a reconstruction of a deployed system. */
export async function createSpatialScene(
	host: HTMLElement,
	options: Options
): Promise<SpatialScene> {
	const [T, { gsap }] = await Promise.all([import('three'), import('gsap')]);
	// Cancellation at the internal import boundary must allocate nothing and report no failure.
	const inert = () => {};
	if (options.isDisposed?.()) {
		return {
			go: inert,
			goChapter: inert,
			pause: inert,
			reducedMotion: inert,
			replay: inert,
			skip: inert,
			destroy: inert
		};
	}
	const geometries = new Set<Three.BufferGeometry>();
	const materials = new Set<Three.Material>();
	const scene = new T.Scene();
	let renderer: Three.WebGLRenderer | undefined;
	let timeline: ReturnType<typeof gsap.timeline> | undefined;
	let observer: ResizeObserver | undefined;
	let disposed = false;
	let frame = 0;
	const removeListeners: (() => void)[] = [];
	let diagnosticGetter: (() => SpatialDiagnostic) | undefined;
	function destroy() {
		if (disposed) return;
		disposed = true;
		timeline?.kill();
		cancelAnimationFrame(frame);
		frame = 0;
		observer?.disconnect();
		removeListeners.forEach((remove) => remove());
		geometries.forEach((g) => g.dispose());
		materials.forEach((m) => m.dispose());
		scene.traverse((node) => {
			if (node instanceof T.Light && 'shadow' in node)
				(node as Three.DirectionalLight).shadow?.dispose();
		});
		if (renderer) {
			renderer.dispose();
			renderer.forceContextLoss();
			renderer.domElement.remove();
		}
		if (
			diagnosticGetter &&
			Object.getOwnPropertyDescriptor(window, SPATIAL_DIAGNOSTIC_KEY)?.get === diagnosticGetter
		)
			Reflect.deleteProperty(window, SPATIAL_DIAGNOSTIC_KEY);
	}
	const notifyIntro = (active: boolean) => {
		if (!disposed && !options.isDisposed?.()) options.onIntro(active);
	};
	try {
		const view = (renderer = new T.WebGLRenderer({
			antialias: true,
			alpha: false,
			powerPreference: 'high-performance'
		}));
		scene.background = new T.Color('#121619');
		scene.fog = new T.Fog('#121619', 30, 85);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = T.PCFShadowMap;
		renderer.toneMapping = T.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.35;
		renderer.domElement.setAttribute('aria-hidden', 'true');
		host.appendChild(renderer.domElement);
		const camera = new T.PerspectiveCamera(49, 1, 0.1, 120);
		const material = (color: string, metalness: number, roughness: number, emissive?: string) => {
			const m = new T.MeshStandardMaterial({
				color,
				metalness,
				roughness,
				emissive: emissive || '#000000',
				emissiveIntensity: 1.8
			});
			materials.add(m);
			return m;
		};
		const graphite = material('#30383b', 0.72, 0.4);
		const copper = material('#b57852', 0.78, 0.3);
		const titanium = material('#889395', 0.8, 0.27);
		const black = material('#171c1f', 0.4, 0.65);
		const ivory = material('#fff0ce', 0.2, 0.32, '#e9c99a');
		function mesh(
			geometry: Three.BufferGeometry,
			mat: Three.Material,
			parent: Three.Object3D = scene
		) {
			geometries.add(geometry);
			const m = new T.Mesh(geometry, mat);
			m.castShadow = mat !== ivory;
			m.receiveShadow = true;
			parent.add(m);
			return m;
		}
		function box(
			w: number,
			h: number,
			d: number,
			x: number,
			y: number,
			z: number,
			mat: Three.Material,
			parent: Three.Object3D = scene
		) {
			const m = mesh(new T.BoxGeometry(w, h, d), mat, parent);
			m.position.set(x, y, z);
			return m;
		}
		function chamfer(
			w: number,
			h: number,
			depth: number,
			mat: Three.Material,
			parent: Three.Object3D
		) {
			const shape = new T.Shape();
			const c = 0.48;
			shape.moveTo(-w / 2 + c, -h / 2);
			shape.lineTo(w / 2 - c, -h / 2);
			shape.lineTo(w / 2, -h / 2 + c);
			shape.lineTo(w / 2, h / 2 - c);
			shape.lineTo(w / 2 - c, h / 2);
			shape.lineTo(-w / 2 + c, h / 2);
			shape.lineTo(-w / 2, h / 2 - c);
			shape.lineTo(-w / 2, -h / 2 + c);
			shape.closePath();
			return mesh(
				new T.ExtrudeGeometry(shape, {
					depth,
					bevelEnabled: true,
					bevelSize: 0.12,
					bevelThickness: 0.12,
					bevelSegments: 2,
					steps: 1
				}),
				mat,
				parent
			);
		}
		const machine = new T.Group();
		scene.add(machine);
		const halves = [-1, 1].map((side) => {
			const group = new T.Group();
			machine.add(group);
			const shell = chamfer(4.9, 11, 6.5, graphite, group);
			shell.position.set(side * 2.65, 0, -3.5);
			for (let i = 0; i < 9; i++) {
				box(
					0.16,
					9.8,
					6.8,
					side * (0.45 + i * 0.54),
					0,
					-0.3,
					i % 3 === 0 ? copper : titanium,
					group
				);
			}
			box(0.16, 10, 0.08, side * 0.18, 0, 3.15, ivory, group);
			for (const y of [-4.3, 4.3]) {
				box(4.8, 0.3, 7, side * 2.65, y, -0.3, copper, group);
				for (let j = 0; j < 5; j++) {
					const bolt = mesh(new T.CylinderGeometry(0.12, 0.12, 0.16, 6), titanium, group);
					bolt.rotation.x = Math.PI / 2;
					bolt.position.set(side * (0.65 + j * 0.95), y, 3.3);
				}
			}
			return group;
		});
		// Load-bearing octagonal ribs form the actual space through which the camera travels.
		const structuralLayers: { object: Three.Object3D; z: number; index: number }[] = [];
		for (let i = 0; i < 9; i++) {
			const rib = mesh(
				new T.TorusGeometry(4.6, 0.26, 6, 8),
				i % 3 === 0 ? copper : titanium,
				machine
			);
			rib.position.z = 1 - i * 3;
			rib.rotation.z = Math.PI / 8;
			const light = mesh(new T.TorusGeometry(4.2, 0.045, 4, 8), ivory, machine);
			light.position.z = rib.position.z - 0.18;
			light.rotation.z = Math.PI / 8;
			structuralLayers.push(
				{ object: rib, z: rib.position.z, index: i },
				{ object: light, z: light.position.z, index: i }
			);
		}
		for (const side of [-1, 1]) {
			for (let i = 0; i < 4; i++) {
				const path = new T.CatmullRomCurve3([
					new T.Vector3(side * 3.8, -2.5 + i * 0.42, 3),
					new T.Vector3(side * 4.1, -2.5 + i * 0.42, -5),
					new T.Vector3(side * 3.8, -2 + i * 0.42, -14),
					new T.Vector3(side * 3.4, -2 + i * 0.42, -24)
				]);
				mesh(new T.TubeGeometry(path, 24, 0.08, 6, false), copper, machine);
			}
			box(0.6, 0.5, 29, side * 3.1, -4, -10, graphite, machine);
		}
		box(7.2, 0.25, 29, 0, -4.5, -10, black, machine);
		for (const side of [-1, 1]) box(0.09, 0.04, 27, side * 2.7, -4.34, -10, ivory, machine);
		const iris: Three.Group[] = [];
		for (let i = 0; i < 6; i++) {
			const pivot = new T.Group();
			pivot.rotation.z = (i * Math.PI) / 3;
			pivot.position.z = 2.8;
			machine.add(pivot);
			const panel = chamfer(2.9, 4.3, 0.34, i % 2 ? graphite : copper, pivot);
			panel.position.set(0, 1.6, 0);
			iris.push(pivot);
		}
		// A physical inner core, deliberately unlabelled in 3D: all project facts remain in HTML.
		const core = new T.Group();
		core.position.set(0, 0, -21);
		machine.add(core);
		chamfer(4.5, 5.8, 1.2, graphite, core);
		for (let i = 0; i < 4; i++) {
			box(3.8, 0.8, 0.6, 0, 1.8 - i * 1.2, 1.3, copper, core);
			box(0.12, 0.46, 0.1, -1.5, 1.8 - i * 1.2, 1.66, ivory, core);
		}
		// OnboardX: hinged, staggered document leaves emerge beside the chassis.
		// Their blank raised rules are illustrative surfaces, never project facts.
		const documents = new T.Group();
		documents.position.set(11, 0, -1);
		scene.add(documents);
		const leaves = Array.from({ length: 3 }, (_, i) => {
			const hinge = new T.Group();
			documents.add(hinge);
			box(3.1, 6.1, 0.24, 1.55, 0, 0, graphite, hinge);
			box(2.75, 5.65, 0.1, 1.55, 0, 0.17, titanium, hinge);
			box(2.75, 0.24, 0.12, 1.55, 2.2, 0.28, copper, hinge);
			for (let row = 0; row < 5; row++)
				box(row === 4 ? 1.4 : 2.1, 0.08, 0.1, 1.45, 1.3 - row * 0.72, 0.28, ivory, hinge);
			const pin = mesh(new T.CylinderGeometry(0.15, 0.15, 6.4, 10), copper, hinge);
			pin.position.x = -0.12;
			return { hinge, index: i };
		});
		box(5.8, 0.35, 4.5, 0, -4.8, 0, graphite, documents);
		// CV: a separate radial optic with physical iris blades and a finite sweep arm.
		const optic = new T.Group();
		optic.position.set(-12, 0, -1);
		scene.add(optic);
		for (const [radius, tube, z] of [
			[3.8, 0.38, 0],
			[3.1, 0.14, 0.45],
			[2.4, 0.08, -0.35]
		]) {
			const ring = mesh(
				new T.TorusGeometry(radius, tube, 8, 48),
				radius === 3.1 ? copper : titanium,
				optic
			);
			ring.position.z = z;
		}
		const lens = mesh(new T.CylinderGeometry(2.45, 2.45, 0.3, 48), black, optic);
		lens.rotation.x = Math.PI / 2;
		lens.position.z = -0.65;
		const opticBlades = Array.from({ length: 8 }, (_, i) => {
			const pivot = new T.Group();
			optic.add(pivot);
			box(1.15, 2.75, 0.16, 0, 1.35, 0.15, i % 2 ? graphite : copper, pivot);
			return pivot;
		});
		const sweep = new T.Group();
		optic.add(sweep);
		box(0.055, 3.8, 0.1, 0, 1.9, 0.62, ivory, sweep);
		box(5.8, 0.35, 4.5, 0, -4.8, 0, graphite, optic);
		const floor = box(160, 0.3, 160, 0, -5.8, -15, black);
		floor.receiveShadow = true;
		scene.add(new T.HemisphereLight('#d1e2ec', '#4f3321', 2.5));
		const key = new T.DirectionalLight('#fff0d5', 4.5);
		key.position.set(8, 15, 12);
		key.castShadow = true;
		key.shadow.mapSize.set(1024, 1024);
		Object.assign(key.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, far: 70 });
		key.shadow.camera.updateProjectionMatrix();
		key.shadow.bias = -0.001;
		scene.add(key);
		const rim = new T.DirectionalLight('#bbd3e0', 3);
		rim.position.set(-12, 4, -12);
		scene.add(rim);
		for (const z of [-3, -12, -20]) {
			const lamp = new T.PointLight('#ffe3b7', 65, 16, 2);
			lamp.position.set(0, 2.5, z);
			scene.add(lamp);
		}
		const exterior: SpatialPose = {
			x: 11,
			y: 5,
			z: 21,
			tx: 0,
			ty: 0,
			tz: -2,
			split: 0,
			aperture: 0,
			documentUnfold: 0,
			opticAperture: 0,
			opticSweep: 0,
			backgroundSpread: 0
		};
		const poses: Record<Stage, SpatialPose> = {
			0: exterior,
			1: { ...exterior, x: 4, y: 1.7, z: 14, tz: -8, split: 1, aperture: 1 },
			2: { ...exterior, x: 0, y: 0.5, z: -8, tz: -21, split: 1, aperture: 1 },
			3: { ...exterior, x: -12, y: 6, z: 23, tz: -4 },
			4: { ...exterior, x: 21, y: 5, z: 21, tx: 10, tz: -1, documentUnfold: 1 },
			5: { ...exterior, x: -18, y: 3, z: 18, tx: -11, tz: -1, opticAperture: 1, opticSweep: 1 },
			6: {
				...exterior,
				x: 21,
				y: 13,
				z: 29,
				tz: -10,
				split: 0.65,
				aperture: 1,
				backgroundSpread: 1
			}
		};
		let chapter: ChapterId = options.initialChapter ?? 'intro';
		let stage: Stage = CHAPTER_STAGE[chapter];
		const pose = { ...poses[stage] };
		let paused = options.paused ?? false;
		let reduced = options.reduced;
		let hidden = document.hidden;
		let intro = false;
		let staticPending = false;
		let exiting = false;
		const pointer = { x: 0, y: 0 };
		function draw() {
			frame = 0;
			if (disposed || hidden || paused) return;
			camera.position.set(pose.x + pointer.x, pose.y + pointer.y, pose.z);
			camera.lookAt(pose.tx, pose.ty, pose.tz);
			halves.forEach((half, i) => {
				half.position.x = (i === 0 ? -1 : 1) * pose.split * 6.3;
				half.rotation.y = (i === 0 ? -1 : 1) * pose.split * 0.13;
			});
			iris.forEach((pivot, i) => {
				const angle = (i * Math.PI) / 3;
				pivot.position.x = -Math.sin(angle) * pose.aperture * 5.1;
				pivot.position.y = Math.cos(angle) * pose.aperture * 5.1;
				pivot.rotation.z = angle + pose.aperture * 0.35;
			});
			structuralLayers.forEach(({ object, z, index }) => {
				object.position.z = z - index * pose.backgroundSpread * 1.1;
				object.position.y = (index % 2 ? 1 : -1) * pose.backgroundSpread * 0.65;
			});
			core.position.z = -21 - pose.backgroundSpread * 10;
			documents.visible = pose.documentUnfold > 0;
			leaves.forEach(({ hinge, index }) => {
				hinge.position.set(
					(index - 1) * pose.documentUnfold * 3.4,
					index * pose.documentUnfold * 0.75,
					-index * pose.documentUnfold * 1.1
				);
				hinge.rotation.y = -1.5 + pose.documentUnfold * (1.15 + index * 0.22);
			});
			optic.visible = pose.opticAperture > 0 || pose.opticSweep > 0;
			optic.scale.setScalar(0.3 + pose.opticAperture * 0.7);
			opticBlades.forEach((blade, i) => {
				const angle = (i * Math.PI) / 4;
				blade.position.set(
					-Math.sin(angle) * pose.opticAperture * 1.5,
					Math.cos(angle) * pose.opticAperture * 1.5,
					0
				);
				blade.rotation.z = angle + pose.opticAperture * 0.55;
			});
			sweep.rotation.z = -Math.PI * 0.7 + pose.opticSweep * Math.PI * 1.4;
			view.render(scene, camera);
		}
		function requestDraw() {
			if (!disposed && !hidden && !paused && !frame) frame = requestAnimationFrame(draw);
		}
		function drawStaticPose() {
			// Explicit actions may draw while user-paused, but defer hidden-tab rendering.
			cancelAnimationFrame(frame);
			frame = 0;
			staticPending = hidden;
			if (disposed || hidden) return;
			const wasPaused = paused;
			paused = false;
			try {
				draw();
			} finally {
				paused = wasPaused;
			}
		}
		function syncPlayback() {
			if (disposed) return;
			const flushedStatic = !hidden && staticPending;
			if (flushedStatic) {
				staticPending = false;
				drawStaticPose();
			}
			if (paused || hidden || reduced) {
				timeline?.pause();
				cancelAnimationFrame(frame);
				frame = 0;
			} else {
				timeline?.resume();
				if (!flushedStatic || timeline?.isActive()) requestDraw();
			}
		}
		function finishIntro() {
			intro = false;
			notifyIntro(false);
		}
		// Front shell ends at z=3.5; z=10 leaves 6.5 units of exterior clearance.
		// Every interrupted transition re-evaluates this against the actual current pose.
		const frontPlane = 3.5;
		function transition(target: SpatialPose, replaying = false) {
			timeline?.kill();
			timeline = undefined;
			staticPending = false;
			pointer.x = pointer.y = 0;
			if (reduced) {
				exiting = false;
				Object.assign(pose, target);
				finishIntro();
				drawStaticPose();
				return;
			}
			timeline = gsap.timeline({
				paused: true,
				onUpdate: requestDraw,
				onComplete: replaying ? finishIntro : undefined
			});
			const inside = pose.z <= frontPlane;
			const entering = target.z <= frontPlane;
			// Retargeting halfway through an exit must still reach the authored waypoint.
			const needsExit = (inside || exiting) && !entering;
			exiting = needsExit;
			let start = 0;
			if (inside || entering || needsExit) {
				// Clearance is immediate while the camera is held. No closing/deployment
				// channel can begin before the explicit exit or entry waypoint is reached.
				timeline.set(
					pose,
					{
						split: 1,
						aperture: 1,
						documentUnfold: 0,
						opticAperture: 0,
						opticSweep: 0,
						backgroundSpread: 0,
						immediateRender: false
					},
					0
				);
				if (needsExit) {
					timeline.to(
						pose,
						{
							x: 0,
							y: 0.5,
							z: 10,
							tx: 0,
							ty: 0,
							tz: -8,
							duration: 0.8,
							ease: 'power2.inOut',
							onComplete: () => {
								exiting = false;
							}
						},
						0
					);
					start = 0.8;
				} else if (!inside && entering) {
					timeline.to(
						pose,
						{ x: 0, y: 0.5, z: 10, tx: 0, ty: 0, tz: -21, duration: 0.8, ease: 'power2.inOut' },
						0
					);
					start = 0.8;
				}
			}
			if (replaying) {
				// A replay also works from the settled intro, without teleporting. The
				// safety exit + exterior establishing beat + settle total exactly 2.6s.
				timeline.to(
					pose,
					{ x: 17, y: 9, z: 29, tx: 0, ty: 0, tz: -2, duration: 0.45, ease: 'power2.inOut' },
					start
				);
				start += 0.45;
			}
			timeline.to(
				pose,
				{
					...target,
					duration: replaying ? 2.6 - start : entering ? 1.9 : 1.8,
					ease: replaying ? 'power3.out' : 'power3.inOut'
				},
				start
			);
			syncPlayback();
		}
		function go(next: Stage) {
			if (disposed) return;
			stage = next;
			chapter = STAGE_CHAPTER[next];
			finishIntro();
			transition(poses[next]);
		}
		function goChapter(next: ChapterId) {
			go(CHAPTER_STAGE[next]);
		}
		function replay() {
			if (disposed) return;
			stage = 0;
			chapter = 'intro';
			intro = !reduced;
			notifyIntro(intro);
			transition(poses[0], true);
		}
		function resize() {
			const { width, height } = host.getBoundingClientRect();
			camera.aspect = width / Math.max(1, height);
			camera.fov = width < 600 ? 64 : 49;
			camera.updateProjectionMatrix();
			view.setSize(width, height);
			if (paused) drawStaticPose();
			else requestDraw();
		}
		function move(event: PointerEvent) {
			if (
				paused ||
				reduced ||
				hidden ||
				intro ||
				timeline?.isActive() ||
				event.pointerType !== 'mouse'
			)
				return;
			pointer.x = (event.clientX / window.innerWidth - 0.5) * 0.3;
			pointer.y = -(event.clientY / window.innerHeight - 0.5) * 0.2;
			requestDraw();
		}
		function visibility() {
			hidden = document.hidden;
			syncPlayback();
		}
		function lost(event: Event) {
			event.preventDefault();
			if (disposed) return;
			destroy();
			if (!options.isDisposed?.()) options.onFailure();
		}
		observer = new ResizeObserver(resize);
		observer.observe(host);
		window.addEventListener('pointermove', move, { passive: true });
		removeListeners.push(() => window.removeEventListener('pointermove', move));
		document.addEventListener('visibilitychange', visibility);
		removeListeners.push(() => document.removeEventListener('visibilitychange', visibility));
		view.domElement.addEventListener('webglcontextlost', lost);
		removeListeners.push(() => view.domElement.removeEventListener('webglcontextlost', lost));
		diagnosticGetter = () =>
			Object.freeze({
				stage,
				chapter,
				paused,
				reduced,
				hidden,
				intro,
				camera: Object.freeze([camera.position.x, camera.position.y, camera.position.z] as const),
				pose: Object.freeze({
					x: pose.x,
					y: pose.y,
					z: pose.z,
					tx: pose.tx,
					ty: pose.ty,
					tz: pose.tz,
					split: pose.split,
					aperture: pose.aperture,
					documentUnfold: pose.documentUnfold,
					opticAperture: pose.opticAperture,
					opticSweep: pose.opticSweep,
					backgroundSpread: pose.backgroundSpread
				}),
				framePending: Boolean(frame),
				timelineTime: timeline?.time() ?? 0,
				geometries: view.info.memory.geometries,
				calls: view.info.render.calls
			});
		Object.defineProperty(window, SPATIAL_DIAGNOSTIC_KEY, {
			configurable: true,
			get: diagnosticGetter
		});
		resize();
		if (chapter === 'intro') {
			if (!reduced) Object.assign(pose, { x: 17, y: 9, z: 29 });
			if (paused && !reduced) drawStaticPose();
			replay();
		} else {
			finishIntro();
			drawStaticPose();
		}
		if (!disposed && !options.isDisposed?.()) options.onReady();
		return {
			go,
			goChapter,
			replay,
			skip: () => {
				if (disposed) return;
				timeline?.kill();
				timeline = undefined;
				pointer.x = pointer.y = 0;
				exiting = false;
				Object.assign(pose, poses[stage]);
				finishIntro();
				drawStaticPose();
			},
			pause: (value) => {
				if (disposed) return;
				paused = value;
				syncPlayback();
				if (value) drawStaticPose();
			},
			reducedMotion: (value) => {
				if (disposed) return;
				reduced = value;
				if (value) {
					timeline?.kill();
					timeline = undefined;
					// Freeze the exact current camera/mechanics when the preference changes.
					// Subsequent explicit stage actions use go()'s instantaneous static poses.
					finishIntro();
					cancelAnimationFrame(frame);
					frame = 0;
				}
			},
			destroy
		};
	} catch (error) {
		// Includes failures after renderer creation, geometry allocation or listener setup.
		destroy();
		// The caller owns the single initialization-failure notification/fallback.
		throw error;
	}
}
