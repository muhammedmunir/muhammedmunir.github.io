import type * as Three from 'three';
import type { EngineStore, Projection, Region } from './state';

const REGIONS: Region[] = ['interface', 'services', 'data', 'intelligence'];
type Options = {
	signal: AbortSignal;
	onReady: () => void;
	onFail: () => void;
	onProject: (projection: Projection) => void;
};

/** A finite, state-driven porcelain engine. No renderer work happens during SSR. */
export async function mountEngine(
	host: HTMLElement,
	store: EngineStore,
	options: Options
): Promise<{ dispose(): void }> {
	let disposed = false,
		failed = false;
	let renderer: Three.WebGLRenderer | undefined;
	let environment: Three.WebGLRenderTarget | undefined;
	let shadow: Three.DirectionalLight | undefined;
	let observer: ResizeObserver | undefined;
	let unsubscribe = () => {};
	let removeEvents = () => {};
	let frame = 0,
		frames = 0,
		last = 0;
	let status: 'ready' | 'lost' | 'fallback' = 'fallback';
	const geometries = new Set<Three.BufferGeometry>();
	const materials = new Set<Three.Material>();
	let diagnosticOwner: (() => unknown) | undefined;
	const dispose = () => {
		if (disposed) return;
		disposed = true;
		if (frame) cancelAnimationFrame(frame);
		frame = 0;
		unsubscribe();
		observer?.disconnect();
		removeEvents();
		options.signal.removeEventListener('abort', dispose);
		shadow?.shadow.dispose();
		for (const geometry of geometries) geometry.dispose();
		for (const material of materials) material.dispose();
		environment?.dispose();
		renderer?.dispose();
		renderer?.domElement.remove();
		if (
			typeof window !== 'undefined' &&
			diagnosticOwner &&
			Object.getOwnPropertyDescriptor(window, '__engineDiagnostic')?.get === diagnosticOwner
		) {
			delete (window as Window & { __engineDiagnostic?: unknown }).__engineDiagnostic;
		}
	};
	const fail = () => {
		if (disposed || failed) return;
		failed = true;
		try {
			options.onFail();
		} finally {
			dispose();
		}
	};
	if (typeof window === 'undefined' || options.signal.aborted) return { dispose };
	options.signal.addEventListener('abort', dispose, { once: true });
	try {
		const T = await import('three');
		if (disposed || options.signal.aborted) {
			dispose();
			return { dispose };
		}
		const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
		if (disposed || options.signal.aborted) {
			dispose();
			return { dispose };
		}
		const geometry = <G extends Three.BufferGeometry>(g: G): G => {
			geometries.add(g);
			return g;
		};
		const material = <M extends Three.Material>(m: M): M => {
			materials.add(m);
			return m;
		};
		const scene = new T.Scene();
		scene.background = new T.Color('#171722');
		scene.fog = new T.Fog('#171722', 27, 48);
		renderer = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
		const render = renderer;
		render.shadowMap.enabled = true;
		render.shadowMap.type = T.PCFShadowMap;
		render.outputColorSpace = T.SRGBColorSpace;
		render.toneMapping = T.ACESFilmicToneMapping;
		render.toneMappingExposure = 1.15;
		render.domElement.style.cssText =
			'display:block;width:100%;height:100%;pointer-events:auto;touch-action:pan-y;';
		render.domElement.setAttribute('aria-hidden', 'true');
		host.appendChild(render.domElement);
		const pmrem = new T.PMREMGenerator(render);
		const room = new RoomEnvironment();
		try {
			environment = pmrem.fromScene(room, 0.04);
			scene.environment = environment.texture;
		} finally {
			room.dispose();
			pmrem.dispose();
		}
		const camera = new T.PerspectiveCamera(39, 1, 0.1, 45);
		scene.add(new T.HemisphereLight('#fff0d7', '#3e253f', 2.0));
		shadow = new T.DirectionalLight('#ffe4c7', 4.2);
		shadow.position.set(-4, 9, 5);
		shadow.castShadow = true;
		shadow.shadow.mapSize.set(512, 512);
		Object.assign(shadow.shadow.camera, {
			left: -5,
			right: 5,
			top: 5,
			bottom: -5,
			near: 0.5,
			far: 22
		});
		shadow.shadow.bias = -0.0008;
		shadow.shadow.normalBias = 0.035;
		scene.add(shadow);
		const rim = new T.DirectionalLight('#e8b1b1', 2.5);
		rim.position.set(4, 5, -5);
		scene.add(rim);
		const mesh = (g: Three.BufferGeometry, m: Three.Material, parent: Three.Object3D) => {
			const object = new T.Mesh(g, m);
			object.castShadow = object.receiveShadow = true;
			parent.add(object);
			return object;
		};
		const ceramic = (color: string, roughness = 0.28) =>
			material(
				new T.MeshPhysicalMaterial({
					color,
					roughness,
					metalness: 0.12,
					clearcoat: 0.7,
					clearcoatRoughness: 0.22
				})
			);
		const ivory = ceramic('#ecddd0');
		const cherry = ceramic('#47202e');
		const dark = ceramic('#211b29', 0.4);
		const gold = ceramic('#c79755', 0.23);
		const ground = mesh(
			geometry(new T.PlaneGeometry(200, 200)),
			material(new T.MeshStandardMaterial({ color: '#171722', roughness: 0.95 })),
			scene
		);
		ground.rotation.x = -Math.PI / 2;
		ground.position.y = -0.72;
		ground.castShadow = false;
		const engine = new T.Group();
		scene.add(engine);

		// Closed, thick parametric ribbons: two surfaces plus stitched perimeter walls.
		const shell = (
			sample: (u: number, v: number) => Three.Vector3,
			thickness: number,
			nu = 48,
			nv = 14
		) => {
			const positions: number[] = [],
				uvs: number[] = [],
				indices: number[] = [];
			const stride = nv + 1,
				count = (nu + 1) * stride;
			for (let side = 0; side < 2; side++)
				for (let i = 0; i <= nu; i++)
					for (let j = 0; j <= nv; j++) {
						const u = i / nu,
							v = (j / nv) * 2 - 1;
						const p = sample(u, v);
						// Rounded lips soften the otherwise substantial ceramic wall.
						p.y += (side ? -1 : 1) * thickness * (0.36 + 0.14 * Math.sin((Math.PI * j) / nv));
						positions.push(p.x, p.y, p.z);
						uvs.push(u, j / nv);
					}
			for (let i = 0; i < nu; i++)
				for (let j = 0; j < nv; j++) {
					const a = i * stride + j,
						b = a + stride;
					indices.push(
						a,
						a + 1,
						b,
						b,
						a + 1,
						b + 1,
						a + count,
						b + count,
						a + count + 1,
						b + count,
						b + count + 1,
						a + count + 1
					);
				}
			const edge = (a: number, b: number) => indices.push(a, b, a + count, b, b + count, a + count);
			for (let i = 0; i < nu; i++) {
				edge(i * stride, (i + 1) * stride);
				edge((i + 1) * stride + nv, i * stride + nv);
			}
			for (let j = 0; j < nv; j++) {
				edge(j + 1, j);
				edge(nu * stride + j, nu * stride + j + 1);
			}
			const g = geometry(new T.BufferGeometry());
			g.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
			g.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2));
			// Petals and the circular artery have opposite parameter handedness.
			const du = sample(0.501, 0).sub(sample(0.499, 0));
			const dv = sample(0.5, 0.001).sub(sample(0.5, -0.001));
			if (dv.cross(du).y < 0)
				for (let triangle = 0; triangle < indices.length; triangle += 3) {
					[indices[triangle + 1], indices[triangle + 2]] = [
						indices[triangle + 2],
						indices[triangle + 1]
					];
				}
			g.setIndex(indices);
			g.computeVertexNormals();
			return g;
		};
		const dishProfile = [
			new T.Vector2(0, -0.2),
			new T.Vector2(0.7, -0.25),
			new T.Vector2(2.7, -0.15),
			new T.Vector2(3.35, 0.12),
			new T.Vector2(3.48, 0.29),
			new T.Vector2(3.42, 0.38),
			new T.Vector2(3.25, 0.25),
			new T.Vector2(2.5, 0.02),
			new T.Vector2(0, -0.04)
		];
		mesh(geometry(new T.LatheGeometry(dishProfile, 80)), dark, engine);
		const lip = mesh(geometry(new T.TorusGeometry(3.4, 0.035, 8, 96)), cherry, engine);
		lip.rotation.x = Math.PI / 2;
		lip.position.y = 0.28;
		const foot = mesh(geometry(new T.CylinderGeometry(1.45, 1.8, 0.3, 64)), cherry, engine);
		foot.position.y = -0.38;
		const regions: {
			name: Region;
			group: Three.Group;
			surface: Three.MeshPhysicalMaterial;
			lamp: Three.MeshStandardMaterial;
			anchor: Three.Object3D;
			bend: number;
			hover: number;
		}[] = [];
		const pickable: Three.Object3D[] = [];
		for (let i = 0; i < 4; i++) {
			const angle = (i * Math.PI) / 2;
			const group = new T.Group();
			group.position.set(Math.sin(angle) * 1.08, 0.33, Math.cos(angle) * 1.08);
			group.rotation.y = angle;
			engine.add(group);
			const surface = ceramic(['#e9d9d0', '#e5b4a8', '#672c42', '#ddd8b8'][i]);
			if (i === 0) {
				surface.transparent = true;
				surface.opacity = 0.76;
				surface.transmission = 0.22;
				surface.thickness = 0.18;
			}
			if (i === 3) {
				surface.iridescence = 0.65;
				surface.iridescenceIOR = 1.35;
				surface.iridescenceThicknessRange = [180, 340];
			}
			const petal = (u: number, v: number) => {
				const width = (0.22 + 0.7 * Math.sin(Math.PI * u * 0.9)) * (i === 0 ? 1.12 : 1);
				return new T.Vector3(
					v * width,
					0.15 + Math.sin(Math.PI * u) * (i === 1 ? 0.8 : 1.05) + v * v * 0.34 + u * u * 0.3,
					-0.48 + u * 2.18
				);
			};
			mesh(shell(petal, i === 0 ? 0.055 : 0.16), surface, group);
			if (i === 1)
				for (let fold = 0; fold < 3; fold++) {
					const folded = mesh(
						shell(
							(u, v) => {
								const p = petal(u, v * 0.42);
								p.x += (fold - 1) * 0.39;
								p.y += 0.08 + Math.abs(v) * 0.18 + fold * 0.04;
								return p;
							},
							0.09,
							32,
							8
						),
						fold % 2 ? ivory : surface,
						group
					);
					folded.rotation.z = (fold - 1) * 0.1;
				}
			if (i === 2) {
				const lamella = geometry(new T.TorusGeometry(0.64, 0.025, 6, 40, Math.PI * 1.25));
				for (let layer = 0; layer < 12; layer++) {
					const cut = mesh(lamella, layer % 3 ? ivory : gold, group);
					cut.position.set(0, 0.41 + layer * 0.025, -0.05 + layer * 0.105);
					cut.rotation.set(-0.18, 0, -Math.PI * 0.125);
					cut.castShadow = false;
					cut.scale.setScalar(0.78 + Math.sin((layer / 11) * Math.PI) * 0.23);
				}
			}
			if (i === 3) {
				const bowlMaterial = material(
					new T.MeshPhysicalMaterial({
						color: '#f0d5bc',
						roughness: 0.12,
						transmission: 0.6,
						transparent: true,
						opacity: 0.65,
						thickness: 0.22,
						side: T.DoubleSide
					})
				);
				const bowl = mesh(
					geometry(new T.SphereGeometry(0.57, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5)),
					bowlMaterial,
					group
				);
				bowl.position.set(0, 0.75, 0.55);
				bowl.scale.y = 0.55;
				for (let layer = 0; layer < 3; layer++) {
					const lens = mesh(
						geometry(new T.IcosahedronGeometry(0.4 - layer * 0.055, 1)),
						layer === 1 ? gold : surface,
						group
					);
					lens.position.set(0, 0.54 + layer * 0.11, 0.55);
					lens.scale.y = 0.3;
					lens.rotation.y = layer * 0.4;
				}
			}
			const lamp = material(
				new T.MeshStandardMaterial({
					color: '#e9be83',
					emissive: '#ffb86f',
					emissiveIntensity: 0.2,
					roughness: 0.35
				})
			);
			const lampMesh = mesh(geometry(new T.TorusGeometry(0.14, 0.035, 8, 24)), lamp, group);
			lampMesh.rotation.x = -Math.PI / 2;
			lampMesh.position.set(0, 0.68, 1.55);
			const anchor = new T.Object3D();
			anchor.position.set(0, 0.85, 1.75);
			group.add(anchor);
			group.traverse((object) => {
				if (object instanceof T.Mesh) {
					object.userData.region = REGIONS[i];
					pickable.push(object);
				}
			});
			regions.push({ name: REGIONS[i], group, surface, lamp, anchor, bend: 0, hover: 0 });
		}
		const courier = { phase: { value: 1 }, start: { value: 0 }, enabled: { value: 0 } };
		const arteryMaterial = ceramic('#aa775d', 0.29);
		arteryMaterial.onBeforeCompile = (shader) => {
			Object.assign(shader.uniforms, {
				flightPhase: courier.phase,
				flightStart: courier.start,
				flightEnabled: courier.enabled
			});
			shader.vertexShader = shader.vertexShader
				.replace('#include <common>', '#include <common>\nvarying vec2 arteryUV;')
				.replace('#include <uv_vertex>', '#include <uv_vertex>\n arteryUV = uv;');
			shader.fragmentShader = shader.fragmentShader
				.replace(
					'#include <common>',
					'#include <common>\nvarying vec2 arteryUV; uniform float flightPhase; uniform float flightStart; uniform float flightEnabled;'
				)
				.replace(
					'#include <emissivemap_fragment>',
					`#include <emissivemap_fragment>
				float distanceTravelled = fract(arteryUV.x - flightStart + 1.0);
				float arrival = exp(-pow((distanceTravelled - flightPhase) / 0.027, 2.0));
				totalEmissiveRadiance += vec3(1.0, 0.48, 0.16) * arrival * flightEnabled * 1.8;`
				);
		};
		arteryMaterial.customProgramCacheKey = () => 'living-porcelain-artery-1';
		mesh(
			shell(
				(u, v) => {
					const t = u * Math.PI * 2,
						radius = 2.12 + v * 0.18 * Math.cos(t);
					return new T.Vector3(
						Math.sin(t) * radius,
						0.83 + 0.19 * Math.sin(t * 2) + v * 0.18 * Math.sin(t),
						Math.cos(t) * radius
					);
				},
				0.075,
				128,
				6
			),
			arteryMaterial,
			engine
		);
		const core = mesh(
			geometry(new T.SphereGeometry(0.62, 40, 24)),
			material(
				new T.MeshPhysicalMaterial({
					color: '#d78b45',
					emissive: '#b44a15',
					emissiveIntensity: 0.3,
					metalness: 0.28,
					roughness: 0.15,
					clearcoat: 1
				})
			),
			engine
		);
		core.position.y = 0.64;
		core.scale.y = 0.57;
		const collar = mesh(geometry(new T.TorusGeometry(0.7, 0.075, 12, 64)), ivory, engine);
		collar.rotation.x = Math.PI / 2;
		collar.position.y = 0.45;
		const projectPoint = new T.Object3D();
		projectPoint.position.set(-2.65, -0.25, 0.6);
		engine.add(projectPoint);
		let state = store.get(),
			progress = state.progress,
			target = state.progress;
		let activation = state.activation,
			elapsed = 2.6,
			phase = 1,
			active = false;
		let hidden = document.hidden,
			width = 1,
			height = 1;
		let hovered: Region | undefined;
		const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
		const raycaster = new T.Raycaster(),
			pointer = new T.Vector2();
		const projected = new T.Vector3();
		const project = (object: Three.Object3D) => {
			object.getWorldPosition(projected);
			projected.project(camera);
			return {
				x: (projected.x * 0.5 + 0.5) * width,
				y: (-projected.y * 0.5 + 0.5) * height,
				visible:
					projected.z > -1 &&
					projected.z < 1 &&
					Math.abs(projected.x) < 1.12 &&
					Math.abs(projected.y) < 1.12
			};
		};
		const schedule = () => {
			if (!disposed && !hidden && !frame) frame = requestAnimationFrame(tick);
		};
		const tick = (now: number) => {
			frame = 0;
			if (disposed || hidden) return;
			const dt = last ? Math.max(0, (now - last) / 1000) : 0;
			last = now;
			frames++;
			let moving = false;
			if (state.reduced) {
				progress = target;
				elapsed = 2.6;
			} else {
				progress += (target - progress) * (1 - Math.exp(-dt * 8));
				if (Math.abs(target - progress) < 0.0003) progress = target;
				else moving = true;
				if (active) elapsed = Math.min(2.6, elapsed + dt);
			}
			phase = elapsed / 2.6;
			active = phase < 1;
			courier.phase.value = phase;
			// The flight fades only at its endpoints, not after its first region.
			courier.enabled.value = active ? Math.min(1, phase * 16, (1 - phase) * 16) : 0;
			const selectedIndex = REGIONS.indexOf(state.selected);
			const choreography = state.reduced ? (progress >= 0.5 ? 1 : 0) : progress;
			for (let i = 0; i < regions.length; i++) {
				const region = regions[i],
					order = (i - selectedIndex + 4) % 4;
				const local = Math.max(0, Math.min(1, (phase - order * 0.25) / 0.22));
				const pulse = active ? Math.sin(local * Math.PI) : 0;
				const opened = i === selectedIndex ? (state.reduced ? 1 : Math.min(1, phase * 7)) : 0;
				const hoverTarget = !state.reduced && hovered === region.name ? 1 : 0;
				region.hover += (hoverTarget - region.hover) * (1 - Math.exp(-dt * 12));
				if (Math.abs(region.hover - hoverTarget) < 0.001) region.hover = hoverTarget;
				else moving = true;
				region.bend = state.reduced ? 0 : opened * 0.12 + pulse * 0.105 + region.hover * 0.065;
				region.group.rotation.x = -region.bend;
				region.group.position.y =
					0.33 +
					(state.reduced ? 0 : opened * 0.13 + pulse * 0.15 + region.hover * 0.06) +
					choreography * (i === 1 || i === 2 ? 0.14 : 0.025);
				region.surface.emissive.set('#9d4933');
				region.surface.emissiveIntensity = opened * 0.07 + pulse * 0.22;
				region.lamp.emissiveIntensity = 0.15 + opened * 1.15 + pulse * 2;
			}
			const mobile = width < 700;
			const angle = 0.18 + choreography * 1.12;
			const radius = mobile
				? Math.max(15.5, 3.85 / (Math.tan((27 * Math.PI) / 180) * camera.aspect))
				: 10.7;
			const fov = mobile ? 54 : 39;
			if (camera.fov !== fov) {
				camera.fov = fov;
				camera.updateProjectionMatrix();
			}
			camera.position.set(
				Math.sin(angle) * radius,
				8.1 - choreography * 3.5,
				Math.cos(angle) * radius
			);
			camera.lookAt(0, mobile ? 0.72 : 1.08, 0);
			camera.updateMatrixWorld();
			render.render(scene, camera);
			const anchors = {} as Projection['anchors'];
			for (const region of regions) anchors[region.name] = project(region.anchor);
			options.onProject({ anchors, project: project(projectPoint), progress });
			if (active || moving) schedule();
			else last = 0;
		};
		const resize = () => {
			const bounds = host.getBoundingClientRect();
			width = Math.max(1, bounds.width);
			height = Math.max(1, bounds.height);
			render.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 700 ? 1.25 : 1.5));
			render.setSize(width, height, false);
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			schedule();
		};
		const hit = (event: PointerEvent) => {
			const bounds = render.domElement.getBoundingClientRect();
			pointer.set(
				((event.clientX - bounds.left) / bounds.width) * 2 - 1,
				(-(event.clientY - bounds.top) / bounds.height) * 2 + 1
			);
			raycaster.setFromCamera(pointer, camera);
			return raycaster.intersectObjects(pickable, false)[0]?.object.userData.region as
				| Region
				| undefined;
		};
		let press: { id: number; x: number; y: number; at: number } | undefined;
		const down = (event: PointerEvent) => {
			if (event.button !== 0) return;
			press = { id: event.pointerId, x: event.clientX, y: event.clientY, at: event.timeStamp };
		};
		const up = (event: PointerEvent) => {
			const start = press;
			press = undefined;
			if (
				!start ||
				start.id !== event.pointerId ||
				event.timeStamp - start.at > 650 ||
				Math.hypot(event.clientX - start.x, event.clientY - start.y) > 7
			)
				return;
			const region = hit(event);
			if (region) store.activate(region);
		};
		const cancelPress = () => {
			press = undefined;
		};
		const move = (event: PointerEvent) => {
			if (!finePointer.matches || state.reduced) return;
			const region = hit(event);
			if (hovered !== region) {
				hovered = region;
				schedule();
			}
		};
		const leave = () => {
			if (hovered) {
				hovered = undefined;
				schedule();
			}
		};
		const visibility = () => {
			hidden = document.hidden;
			last = 0;
			if (hidden) {
				cancelAnimationFrame(frame);
				frame = 0;
			} else schedule();
		};
		const lost = (event: Event) => {
			event.preventDefault();
			status = 'lost';
			fail();
		};
		render.domElement.addEventListener('pointerdown', down);
		render.domElement.addEventListener('pointerup', up);
		render.domElement.addEventListener('pointercancel', cancelPress);
		render.domElement.addEventListener('pointermove', move);
		render.domElement.addEventListener('pointerleave', leave);
		render.domElement.addEventListener('webglcontextlost', lost);
		document.addEventListener('visibilitychange', visibility);
		removeEvents = () => {
			render.domElement.removeEventListener('pointerdown', down);
			render.domElement.removeEventListener('pointerup', up);
			render.domElement.removeEventListener('pointercancel', cancelPress);
			render.domElement.removeEventListener('pointermove', move);
			render.domElement.removeEventListener('pointerleave', leave);
			render.domElement.removeEventListener('webglcontextlost', lost);
			document.removeEventListener('visibilitychange', visibility);
		};
		observer = new ResizeObserver(resize);
		observer.observe(host);
		unsubscribe = store.subscribe((next) => {
			state = next;
			target = next.progress;
			if (next.activation !== activation) {
				activation = next.activation;
				last = performance.now();
				elapsed = next.reduced ? 2.6 : 0;
				phase = next.reduced ? 1 : 0;
				active = !next.reduced;
				courier.start.value = REGIONS.indexOf(next.selected) / 4;
			}
			if (next.reduced) {
				elapsed = 2.6;
				active = false;
				hovered = undefined;
				for (const region of regions) region.hover = 0;
			}
			schedule();
		});
		status = 'ready';
		diagnosticOwner = () =>
			Object.freeze({
				progress,
				target,
				selected: state.selected,
				activation,
				phase,
				active,
				frames,
				framePending: frame !== 0,
				draws: render.info.render.calls,
				geometries: render.info.memory.geometries,
				reduced: state.reduced,
				hidden,
				renderer: status
			});
		Object.defineProperty(window, '__engineDiagnostic', {
			configurable: true,
			enumerable: false,
			get: diagnosticOwner
		});
		resize();
		options.onReady();
	} catch {
		status = 'fallback';
		fail();
	}
	return { dispose };
}
