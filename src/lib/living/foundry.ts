import type * as Three from 'three';

type FoundryOptions = {
	reduced: boolean;
	onReady: () => void;
	onFail: () => void;
	signal?: AbortSignal;
};
type Foundry = {
	setProgress(n: number): void;
	setReduced(v: boolean): void;
	activate(): void;
	dispose(): void;
};

/** A cutaway landscape: interface porcelain, process ribbon, and exposed data pages. */
export async function createFoundry(host: HTMLElement, options: FoundryOptions): Promise<Foundry> {
	let disposed = false;
	let failed = false;
	let ready = false;
	let reduced = options.reduced;
	let hidden = document.hidden;
	let progress = 0;
	let currentProgress = 0;
	let openness = 0;
	let reducedOpen = 0;
	let activity = -1;
	let frames = 0;
	let raf = 0;
	let previousTime = 0;
	let renderer: Three.WebGLRenderer | undefined;
	let observer: ResizeObserver | undefined;
	const geometries = new Set<Three.BufferGeometry>();
	const materials = new Set<Three.Material>();
	const removers: Array<() => void> = [];
	const diagnosticHost = window as unknown as { __foundry?: Readonly<Record<string, unknown>> };
	const diagnostic = Object.freeze(
		Object.defineProperties(
			{},
			{
				ready: { enumerable: true, get: () => ready },
				progress: { enumerable: true, get: () => progress },
				open: { enumerable: true, get: () => openness },
				active: { enumerable: true, get: () => activity >= 0 },
				frames: { enumerable: true, get: () => frames },
				framePending: { enumerable: true, get: () => !!raf },
				drawCalls: { enumerable: true, get: () => renderer?.info.render.calls ?? 0 },
				geometries: { enumerable: true, get: () => renderer?.info.memory.geometries ?? 0 },
				reduced: { enumerable: true, get: () => reduced },
				hidden: { enumerable: true, get: () => hidden }
			}
		)
	);
	diagnosticHost.__foundry = diagnostic;
	let invalidate = () => {};
	let snap = () => {};
	const dispose = () => {
		if (disposed) return;
		disposed = true;
		ready = false;
		cancelAnimationFrame(raf);
		raf = 0;
		observer?.disconnect();
		removers.splice(0).forEach((remove) => remove());
		geometries.forEach((geometry) => geometry.dispose());
		materials.forEach((material) => material.dispose());
		renderer?.renderLists.dispose();
		renderer?.dispose();
		renderer?.forceContextLoss();
		renderer?.domElement.remove();
		if (diagnosticHost.__foundry === diagnostic) delete diagnosticHost.__foundry;
	};
	const fail = () => {
		if (failed || disposed) return;
		failed = true;
		dispose();
		options.onFail();
	};
	const api: Foundry = {
		setProgress(n) {
			if (disposed) return;
			progress = Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;
			if (reduced) snap();
			invalidate();
		},
		setReduced(v) {
			if (disposed || reduced === v) return;
			reduced = v;
			if (reduced) {
				activity = -1;
				snap();
			}
			invalidate();
		},
		activate() {
			if (disposed || !ready) return;
			activity = reduced ? -1 : 0;
			previousTime = performance.now();
			if (reduced) reducedOpen = reducedOpen ? 0 : 1;
			invalidate();
		},
		dispose
	};
	const abort = () => dispose();
	options.signal?.addEventListener('abort', abort, { once: true });
	removers.push(() => options.signal?.removeEventListener('abort', abort));
	if (options.signal?.aborted) {
		dispose();
		return api;
	}

	try {
		const T = await import('three');
		if (disposed || options.signal?.aborted) {
			dispose();
			return api;
		}
		const scene = new T.Scene();
		scene.background = new T.Color('#e8e7e1');
		const camera = new T.OrthographicCamera(-10, 10, 7, -7, 0.1, 100);
		renderer = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
		renderer.setClearColor('#e8e7e1', 1);
		renderer.outputColorSpace = T.SRGBColorSpace;
		renderer.toneMapping = T.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.15;
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = T.PCFShadowMap;
		renderer.domElement.setAttribute('aria-hidden', 'true');
		renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none;';
		host.appendChild(renderer.domElement);
		const listen = (target: EventTarget, event: string, listener: EventListener) => {
			target.addEventListener(event, listener);
			removers.push(() => target.removeEventListener(event, listener));
		};
		listen(renderer.domElement, 'webglcontextlost', ((event: Event) => {
			event.preventDefault();
			fail();
		}) as EventListener);
		const geometry = <G extends Three.BufferGeometry>(value: G): G => {
			geometries.add(value);
			return value;
		};
		const material = <M extends Three.Material>(value: M): M => {
			materials.add(value);
			return value;
		};
		const ceramic = material(
			new T.MeshStandardMaterial({ color: '#edece5', roughness: 0.57, metalness: 0.03 })
		);
		const chalk = material(new T.MeshStandardMaterial({ color: '#d8d9cc', roughness: 0.78 }));
		const mint = material(new T.MeshStandardMaterial({ color: '#b5cbc0', roughness: 0.63 }));
		const ink = material(
			new T.MeshStandardMaterial({ color: '#293c38', roughness: 0.6, metalness: 0.13 })
		);
		const red = material(
			new T.MeshStandardMaterial({ color: '#ee432c', roughness: 0.37, metalness: 0.12 })
		);
		const glass = material(
			new T.MeshPhysicalMaterial({
				color: '#c6efdd',
				roughness: 0.16,
				metalness: 0.04,
				transmission: 0.68,
				thickness: 0.7,
				ior: 1.35,
				transparent: true,
				opacity: 0.82,
				clearcoat: 1,
				clearcoatRoughness: 0.2
			})
		);
		const core = material(
			new T.MeshStandardMaterial({
				color: '#ecffe6',
				emissive: '#b8e9bc',
				emissiveIntensity: 0.45,
				roughness: 0.38
			})
		);
		const world = new T.Group();
		scene.add(world);
		const mesh = (g: Three.BufferGeometry, m: Three.Material, parent: Three.Object3D = world) => {
			const item = new T.Mesh(g, m);
			item.castShadow = true;
			item.receiveShadow = true;
			parent.add(item);
			return item;
		};
		scene.add(new T.HemisphereLight('#fffdf1', '#b4b7a5', 2.6));
		const key = new T.DirectionalLight('#fff9eb', 4.2);
		key.position.set(-5, 12, 7);
		key.castShadow = true;
		key.shadow.camera.left = -10;
		key.shadow.camera.right = 10;
		key.shadow.camera.top = 9;
		key.shadow.camera.bottom = -9;
		key.shadow.camera.near = 0.5;
		key.shadow.camera.far = 35;
		key.shadow.normalBias = 0.035;
		key.shadow.bias = -0.0002;
		key.shadow.radius = 3;
		removers.push(() => key.shadow.dispose());
		scene.add(key);
		const fill = new T.DirectionalLight('#e3fff1', 1.1);
		fill.position.set(5, 5, -7);
		scene.add(fill);
		const ground = mesh(
			geometry(new T.PlaneGeometry(180, 180)),
			material(new T.MeshStandardMaterial({ color: '#e8e7e1', roughness: 1 })),
			scene
		);
		ground.rotation.x = -Math.PI / 2;
		ground.position.y = -0.09;
		ground.castShadow = false;

		// The perimeter is a single eroded peninsula, not a collection of primitives.
		const perimeter = [
			[-6.1, -0.8],
			[-5.2, -2.3],
			[-2.8, -2.7],
			[-1.0, -2.25],
			[1.5, -3.0],
			[4.5, -2.65],
			[6.0, -1.2],
			[5.7, 0.7],
			[4.1, 2.3],
			[1.5, 2.0],
			[-0.6, 2.8],
			[-3.6, 2.4],
			[-5.6, 1.3]
		];
		const outlineCurve = new T.CatmullRomCurve3(
			perimeter.map(([x, z]) => new T.Vector3(x, 0, z)),
			true,
			'catmullrom',
			0.35
		);
		const outline = new T.Shape(outlineCurve.getPoints(96).map((p) => new T.Vector2(p.x, -p.z)));
		const extrude = (shape: Three.Shape, depth: number, bevel = 0.09) => {
			const g = geometry(
				new T.ExtrudeGeometry(shape, {
					depth,
					steps: 1,
					bevelEnabled: true,
					bevelSegments: 3,
					bevelSize: bevel,
					bevelThickness: bevel,
					curveSegments: 28
				})
			);
			g.rotateX(-Math.PI / 2);
			return g;
		};
		const strata: Array<{ group: Three.Group; base: number; lift: number }> = [];
		const layerGeometry = extrude(outline, 0.17, 0.1);
		[ink, chalk, mint, ceramic, ceramic].forEach((m, i) => {
			const group = new T.Group();
			world.add(group);
			const scale = 1 - i * 0.035;
			const terrace = mesh(layerGeometry, m, group);
			terrace.scale.set(scale, 1, scale);
			const base = 0.12 + i * 0.255;
			group.position.y = base;
			strata.push({ group, base, lift: i * 0.19 });
		});
		const surface = new T.Group();
		world.add(surface);
		surface.position.y = 1.36;
		strata.push({ group: surface, base: 1.36, lift: 1.0 });

		// Closely spaced cut ceramic pages read as topography and exposed storage.
		const finShape = new T.Shape();
		finShape.moveTo(-1.65, 0);
		finShape.lineTo(1.7, 0);
		finShape.lineTo(1.7, 0.3);
		finShape.bezierCurveTo(1.1, 0.35, 1.0, 1.25, 0.15, 1.35);
		finShape.bezierCurveTo(-0.8, 1.48, -1.1, 0.68, -1.65, 0.53);
		finShape.closePath();
		const finGeometry = geometry(
			new T.ExtrudeGeometry(finShape, {
				depth: 0.065,
				steps: 1,
				bevelEnabled: true,
				bevelSegments: 2,
				bevelSize: 0.025,
				bevelThickness: 0.025,
				curveSegments: 20
			})
		);
		const pages = new T.InstancedMesh(finGeometry, ceramic, 27);
		removers.push(() => pages.dispose());
		const matrix = new T.Matrix4();
		const rotation = new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), -0.22);
		for (let i = 0; i < 27; i++) {
			const t = i / 26;
			matrix.compose(
				new T.Vector3(-3.0 + Math.sin(t * Math.PI) * 0.12, 0, -1.54 + t * 2.65),
				rotation,
				new T.Vector3(0.9 + 0.1 * Math.sin(t * Math.PI), 0.58 + 0.42 * Math.sin(t * Math.PI), 1)
			);
			pages.setMatrixAt(i, matrix);
		}
		pages.castShadow = pages.receiveShadow = true;
		surface.add(pages);

		// A single broad, raised vermilion route winds around the processing chamber.
		const route = new T.CatmullRomCurve3(
			[
				new T.Vector3(-5.1, 0.28, 1.25),
				new T.Vector3(-3.9, 0.3, 1.65),
				new T.Vector3(-2.0, 0.31, 1.56),
				new T.Vector3(-1.25, 0.34, 0.75),
				new T.Vector3(-1.4, 0.36, -0.65),
				new T.Vector3(-0.2, 0.4, -1.57),
				new T.Vector3(1.8, 0.4, -1.55),
				new T.Vector3(3.0, 0.35, -0.85),
				new T.Vector3(3.15, 0.4, 0.45),
				new T.Vector3(2.4, 0.6, 1.25),
				new T.Vector3(1.1, 0.85, 0.9),
				new T.Vector3(0.55, 0.95, 0.12)
			],
			false,
			'catmullrom',
			0.4
		);
		const routePoints = route.getPoints(100);
		const sides: Three.Vector2[][] = [[], []];
		routePoints.forEach((point, i) => {
			const tangent = route.getTangent(i / 100);
			const normal = new T.Vector2(-tangent.z, tangent.x).normalize().multiplyScalar(0.21);
			sides[0].push(new T.Vector2(point.x + normal.x, -point.z - normal.y));
			sides[1].push(new T.Vector2(point.x - normal.x, -point.z + normal.y));
		});
		const ribbon = new T.Shape([...sides[0], ...sides[1].reverse()]);
		const ribbonMesh = mesh(extrude(ribbon, 0.12, 0.055), red, surface);
		ribbonMesh.position.y = 0.15;
		// A fine inset rail is physical ceramic, never a luminous network overlay.
		const rail = mesh(geometry(new T.TubeGeometry(route, 110, 0.022, 6, false)), ceramic, surface);
		rail.position.y = 0.02;

		const chamber = new T.Group();
		chamber.position.set(0.55, 0.08, 0.12);
		surface.add(chamber);
		const bowlProfile = [
			[0.4, 0],
			[1.12, 0.02],
			[1.5, 0.3],
			[1.68, 0.72],
			[1.64, 0.87],
			[1.5, 0.91],
			[1.35, 0.59],
			[1.08, 0.34],
			[0.4, 0.24]
		].map(([r, y]) => new T.Vector2(r, y));
		mesh(geometry(new T.LatheGeometry(bowlProfile, 72)), ceramic, chamber);
		const chamberLens = mesh(geometry(new T.SphereGeometry(1.31, 48, 24)), glass, chamber);
		chamberLens.scale.y = 0.24;
		chamberLens.position.y = 0.58;
		chamberLens.castShadow = false;
		const seed = mesh(geometry(new T.SphereGeometry(0.48, 28, 16)), core, chamber);
		seed.scale.set(1, 0.38, 1);
		seed.position.y = 0.42;
		const bladeShape = new T.Shape();
		bladeShape.moveTo(0.32, -0.1);
		bladeShape.bezierCurveTo(0.58, -0.48, 1.2, -0.53, 1.5, -0.13);
		bladeShape.quadraticCurveTo(1.22, 0.5, 0.52, 0.35);
		bladeShape.quadraticCurveTo(0.68, 0.06, 0.32, -0.1);
		const bladeGeometry = extrude(bladeShape, 0.045, 0.025);
		const blades: Three.Group[] = [];
		for (let i = 0; i < 8; i++) {
			const pivot = new T.Group();
			pivot.rotation.y = (i * Math.PI) / 4;
			pivot.position.y = 0.86;
			chamber.add(pivot);
			mesh(bladeGeometry, i % 2 ? mint : ceramic, pivot);
			blades.push(pivot);
		}
		// A stepped mint escarpment completes the far end of the continuous island.
		const shelf = new T.Shape();
		shelf.moveTo(0, 0);
		shelf.bezierCurveTo(-0.6, 0.5, -0.45, 1.4, 0.25, 1.7);
		shelf.bezierCurveTo(1.1, 2.0, 2.05, 1.55, 2.35, 0.7);
		shelf.bezierCurveTo(2.4, 0.05, 0.8, -0.35, 0, 0);
		for (let i = 0; i < 7; i++) {
			const ledge = mesh(extrude(shelf, 0.12, 0.055), i % 3 === 0 ? ink : mint, surface);
			ledge.position.set(2.2 + i * 0.065, 0.08 + i * 0.17, -0.92 - i * 0.05);
			ledge.scale.setScalar(1 - i * 0.065);
		}
		const courier = mesh(geometry(new T.SphereGeometry(0.14, 20, 12)), ceramic, surface);
		courier.visible = false;

		let width = 1;
		let height = 1;
		let mobile = false;
		const pointer = new T.Vector2();
		const currentPointer = new T.Vector2();
		const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
		const smooth = (n: number) => n * n * (3 - 2 * n);
		snap = () => {
			currentProgress = progress;
			currentPointer.set(0, 0);
			pointer.set(0, 0);
		};
		const resize = () => {
			if (disposed || !renderer) return;
			const box = host.getBoundingClientRect();
			width = Math.max(1, box.width);
			height = Math.max(1, box.height);
			mobile = width < 700;
			renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5));
			renderer.setSize(width, height, false);
			const shadowSize = mobile ? 512 : 1024;
			if (key.shadow.mapSize.x !== shadowSize) {
				key.shadow.map?.dispose();
				key.shadow.map = null;
				key.shadow.mapSize.set(shadowSize, shadowSize);
			}
			invalidate();
		};
		listen(window, 'pointermove', ((event: PointerEvent) => {
			if (reduced || mobile || !finePointer.matches || hidden) return;
			const box = host.getBoundingClientRect();
			pointer.set(
				Math.max(-1, Math.min(1, ((event.clientX - box.left) / width) * 2 - 1)),
				Math.max(-1, Math.min(1, ((event.clientY - box.top) / height) * 2 - 1))
			);
			invalidate();
		}) as EventListener);
		listen(window, 'blur', (() => {
			pointer.set(0, 0);
			invalidate();
		}) as EventListener);
		listen(document, 'visibilitychange', (() => {
			hidden = document.hidden;
			previousTime = 0;
			if (hidden) {
				cancelAnimationFrame(raf);
				raf = 0;
			} else invalidate();
		}) as EventListener);

		const render = (time: number) => {
			raf = 0;
			if (disposed || hidden || !renderer) return;
			try {
				const dt = previousTime ? Math.max(0, (time - previousTime) / 1000) : 0;
				previousTime = time;
				const ease = reduced ? 1 : 1 - Math.exp(-dt * 9);
				currentProgress += (progress - currentProgress) * ease;
				currentPointer.lerp(pointer, ease);
				if (Math.abs(progress - currentProgress) < 0.0005) currentProgress = progress;
				if (currentPointer.distanceTo(pointer) < 0.0005) currentPointer.copy(pointer);
				let activationOpen = reduced ? reducedOpen : 0;
				if (activity >= 0 && !reduced) {
					activity = Math.min(2.2, activity + dt);
					activationOpen =
						activity < 0.55
							? smooth(activity / 0.55)
							: activity > 1.6
								? 1 - smooth((activity - 1.6) / 0.6)
								: 1;
					const travel = Math.max(0, Math.min(1, (activity - 0.35) / 1.5));
					courier.visible = activity > 0.35 && activity < 1.85;
					courier.position.copy(route.getPointAt(travel));
					courier.position.y += 0.19;
					if (activity >= 2.2) {
						activity = -1;
						courier.visible = false;
					}
				} else courier.visible = false;
				openness = Math.max(activationOpen, smooth(currentProgress));
				strata.forEach(({ group, base, lift }) => {
					group.position.y = base + openness * lift;
				});
				blades.forEach((blade, i) => {
					blade.rotation.z = -openness * 0.78;
					blade.rotation.y = (i * Math.PI) / 4 + openness * 0.19;
					blade.position.y = 0.86 + openness * 0.15;
				});
				chamberLens.position.y = 0.58 + openness * 0.38;
				const aspect = width / height;
				// Explicit portrait framing keeps the terrain full-width, not a tiny side object.
				const horizontalSpan = mobile ? 15.8 : Math.max(16.0, aspect * 10.5);
				const zoom = 1 - currentProgress * (mobile ? 0.14 : 0.23);
				camera.left = (-horizontalSpan * zoom) / 2;
				camera.right = (horizontalSpan * zoom) / 2;
				camera.top = ((horizontalSpan / aspect) * zoom) / 2;
				camera.bottom = -camera.top;
				camera.position.set(
					(mobile ? 9.8 : 10.5) + currentPointer.x * 0.45 - currentProgress * 1.7,
					(mobile ? 12.8 : 11.0) + currentPointer.y * 0.3,
					mobile ? 14.8 : 13.0
				);
				camera.lookAt(0.3 + currentProgress * 1.3, mobile ? 3.6 : 3.1, -currentProgress * 0.55);
				camera.updateProjectionMatrix();
				renderer.render(scene, camera);
				frames++;
				if (!ready) {
					ready = true;
					options.onReady();
				}
				const unsettled =
					activity >= 0 || currentProgress !== progress || !currentPointer.equals(pointer);
				if (unsettled) invalidate();
				else previousTime = 0;
			} catch {
				fail();
			}
		};
		invalidate = () => {
			if (!disposed && !hidden && !raf) raf = requestAnimationFrame(render);
		};
		observer = new ResizeObserver(resize);
		observer.observe(host);
		resize();
		if (reduced) snap();
		invalidate();
	} catch {
		fail();
	}
	return api;
}
