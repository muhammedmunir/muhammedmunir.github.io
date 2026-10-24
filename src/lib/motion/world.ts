import type * as Three from 'three';

export type MotionSnapshot = Readonly<{
	progress: number;
	section: number;
	reduced: boolean;
	hidden: boolean;
	framePending: boolean;
	camera: string;
	draws: number;
	geometries: number;
	renders: number;
	renderer: 'loading' | 'ready' | 'fallback' | 'lost' | 'disposed';
}>;

export interface MotionController {
	setReduced(value: boolean): void;
	snapshot(): MotionSnapshot;
	dispose(): void;
}

interface WorldOptions {
	reduced: boolean;
	signal: AbortSignal;
	onReady(): void;
	onFallback(): void;
}

type Triple = [number, number, number];
type Pose = { position: Triple; rotation: Triple; scale: Triple };
const LAYERS = 9;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const smooth = (value: number) => value * value * (3 - 2 * value);

// All six arrangements use the same nine machined, folded laminae. Nothing is
// introduced for a section: the assembly itself exposes a different relationship.
function layerPose(section: number, index: number): Pose {
	const n = index - 4;
	const depth = n * 0.24;
	switch (section) {
		case 1: // Records separate into an ordered, connected workflow.
			return {
				position: [n * 0.16, n * 0.15, n * 0.49],
				rotation: [-0.12, -0.36 + n * 0.025, n * 0.025],
				scale: [0.9 + index * 0.018, 0.81 + index * 0.035, 1]
			};
		case 2: // Document leaves fan around a shared binding edge.
			return {
				position: [n * 0.16, n * 0.07, depth * 1.55],
				rotation: [-0.2 + n * 0.045, -0.22 + n * 0.11, -0.25 + n * 0.035],
				scale: [0.83, 1.08, 0.8]
			};
		case 3: {
			// Aligned apertures: progressively narrower fields of focus.
			const aperture = 0.52 + index * 0.085;
			return {
				position: [0, 0, -n * 0.42],
				rotation: [0, 0, n * 0.115],
				scale: [aperture, aperture, 1]
			};
		}
		case 4: // Quiet structural alignment, with the joinery still legible.
			return {
				position: [n * 0.025, n * 0.035, depth * 0.95],
				rotation: [0.04, -0.08, -0.045],
				scale: [1 - Math.abs(n) * 0.025, 1 - Math.abs(n) * 0.016, 1]
			};
		case 5: // The open sequence resolves back into a single object.
			return {
				position: [n * 0.035, Math.abs(n) * -0.035, depth * 0.8],
				rotation: [0.03, n * 0.016, 0.035],
				scale: [1 - Math.abs(n) * 0.018, 1 - Math.abs(n) * 0.026, 1]
			};
		default:
			return {
				position: [n * 0.045, Math.abs(n) * -0.04, depth],
				rotation: [0.035, n * 0.026, -0.035],
				scale: [1 - Math.abs(n) * 0.018, 1 - Math.abs(n) * 0.032, 1]
			};
	}
}

const CAMERA_POSITIONS: Triple[] = [
	[5.5, 3.1, 9.5],
	[5.8, 3.2, 11.4],
	[5.3, 3.7, 10.7],
	[0.35, 0.2, 11.2],
	[4.8, 2.5, 10.3],
	[5.2, 2.9, 10]
];
const CAMERA_TARGETS: Triple[] = [
	[0, 0, 0],
	[0, 0.08, 0],
	[0, 0.1, 0],
	[0, 0, 0],
	[0, -0.1, 0],
	[0, -0.05, 0]
];

/** Called only after mount. Three itself is never evaluated by SSR. */
export async function createMotionWorld(
	host: HTMLElement,
	options: WorldOptions
): Promise<MotionController | null> {
	const THREE = await import('three');
	if (options.signal.aborted) return null;

	let renderer: Three.WebGLRenderer | undefined;
	let scene: Three.Scene | undefined;
	let shadowLight: Three.DirectionalLight | undefined;
	const geometries = new Set<Three.BufferGeometry>();
	const materials = new Set<Three.Material>();
	const cleanups: (() => void)[] = [];
	let observer: ResizeObserver | undefined;
	let frame = 0;
	let disposed = false;
	let rendererState: MotionSnapshot['renderer'] = 'loading';
	let reduced = options.reduced;
	let hidden = document.hidden;
	let renders = 0;
	let draws = 0;
	let geometryCount = 0;
	let current = 0;
	let target = 0;
	let lastTime = 0;
	let needsMeasure = true;
	let dirty = true;
	let mobile = false;
	let width = 0;
	let height = 0;
	let anchors: number[] = [0];
	let pointerX = 0;
	let pointerY = 0;
	let pointerTargetX = 0;
	let pointerTargetY = 0;
	let camera: Three.PerspectiveCamera | undefined;

	function release(state: MotionSnapshot['renderer'] = 'disposed') {
		if (disposed) return;
		disposed = true;
		rendererState = state;
		cancelAnimationFrame(frame);
		frame = 0;
		observer?.disconnect();
		for (const cleanup of cleanups.splice(0)) cleanup();
		for (const geometry of geometries) geometry.dispose();
		for (const material of materials) material.dispose();
		shadowLight?.shadow.map?.dispose();
		shadowLight?.shadow.mapPass?.dispose();
		scene?.clear();
		renderer?.renderLists.dispose();
		renderer?.dispose();
		// Do not ask for context restoration or force another context-loss event.
		renderer?.domElement.remove();
	}

	function snapshot(): MotionSnapshot {
		return Object.freeze({
			progress: Math.round((current / 5) * 10000) / 10000,
			section: Math.min(5, Math.round(current)),
			reduced,
			hidden,
			framePending: frame !== 0,
			camera: camera
				? camera.position
						.toArray()
						.map((value) => value.toFixed(3))
						.join(',')
				: '',
			draws,
			geometries: geometryCount,
			renders,
			renderer: rendererState
		});
	}

	try {
		renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true,
			powerPreference: 'low-power',
			preserveDrawingBuffer: false
		});
		renderer.setClearColor(0x000000, 0);
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.22;
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFShadowMap;
		renderer.domElement.setAttribute('aria-hidden', 'true');
		renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none';
		host.appendChild(renderer.domElement);
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
		const assembly = new THREE.Group();
		scene.add(assembly);

		// An M-shaped cut channel, not a logo surface: a continuous folded frame
		// with a real central aperture, bevelled cut faces and substantial depth.
		const profile = new THREE.Shape();
		const outline: [number, number][] = [
			[-2, -1.6],
			[2, -1.6],
			[2, 1.48],
			[1.27, 1.88],
			[0, 0.42],
			[-1.27, 1.88],
			[-2, 1.48]
		];
		outline.forEach(([x, y], index) => (index ? profile.lineTo(x, y) : profile.moveTo(x, y)));
		profile.closePath();
		const aperture = new THREE.Path();
		const opening: [number, number][] = [
			[-1.53, -1.14],
			[-1.53, 1.11],
			[-1.36, 1.21],
			[0, -0.35],
			[1.36, 1.21],
			[1.53, 1.11],
			[1.53, -1.14]
		];
		opening.forEach(([x, y], index) => (index ? aperture.lineTo(x, y) : aperture.moveTo(x, y)));
		aperture.closePath();
		profile.holes.push(aperture);
		const lamina = new THREE.ExtrudeGeometry(profile, {
			depth: 0.13,
			bevelEnabled: true,
			bevelThickness: 0.038,
			bevelSize: 0.038,
			bevelSegments: 2,
			steps: 1,
			curveSegments: 1
		});
		lamina.translate(0, 0, -0.065);
		geometries.add(lamina);
		const graphite = new THREE.MeshStandardMaterial({
			color: 0x303a3a,
			metalness: 0.63,
			roughness: 0.3
		});
		const copper = new THREE.MeshStandardMaterial({
			color: 0xb57a54,
			metalness: 0.72,
			roughness: 0.3
		});
		const ivory = new THREE.MeshStandardMaterial({
			color: 0xd9d4c3,
			metalness: 0.19,
			roughness: 0.46
		});
		for (const material of [graphite, copper, ivory]) materials.add(material);
		const layers = Array.from({ length: LAYERS }, (_, index) => {
			const face = index === 2 || index === 7 ? ivory : index === 4 ? copper : graphite;
			const mesh = new THREE.Mesh(lamina, [face, copper]);
			mesh.castShadow = true;
			mesh.receiveShadow = true;
			assembly.add(mesh);
			return mesh;
		});
		const poses = Array.from({ length: 6 }, (_, section) =>
			layers.map((_, index) => {
				const pose = layerPose(section, index);
				return {
					position: new THREE.Vector3(...pose.position),
					scale: new THREE.Vector3(...pose.scale),
					quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(...pose.rotation))
				};
			})
		);
		const cameraPositions = CAMERA_POSITIONS.map((position) => new THREE.Vector3(...position));
		const cameraTargets = CAMERA_TARGETS.map((position) => new THREE.Vector3(...position));
		const lookAt = new THREE.Vector3();
		const groundGeometry = new THREE.PlaneGeometry(22, 18);
		const groundMaterial = new THREE.ShadowMaterial({ color: 0x162020, opacity: 0.16 });
		geometries.add(groundGeometry);
		materials.add(groundMaterial);
		const ground = new THREE.Mesh(groundGeometry, groundMaterial);
		ground.rotation.x = -Math.PI / 2;
		ground.position.y = -2.65;
		ground.receiveShadow = true;
		scene.add(ground);
		scene.add(new THREE.HemisphereLight(0xf4f1e7, 0x555e63, 2.5));
		shadowLight = new THREE.DirectionalLight(0xffedcf, 4.2);
		shadowLight.position.set(-3, 8, 7);
		shadowLight.castShadow = true;
		shadowLight.shadow.mapSize.set(1024, 1024);
		shadowLight.shadow.camera.left = -7;
		shadowLight.shadow.camera.right = 7;
		shadowLight.shadow.camera.top = 7;
		shadowLight.shadow.camera.bottom = -7;
		shadowLight.shadow.camera.near = 0.5;
		shadowLight.shadow.camera.far = 28;
		shadowLight.shadow.normalBias = 0.035;
		shadowLight.shadow.bias = -0.0003;
		shadowLight.shadow.radius = 3;
		scene.add(shadowLight);
		const rim = new THREE.DirectionalLight(0xe2aa7e, 2.8);
		rim.position.set(5, 3, -5);
		scene.add(rim);
		const fill = new THREE.DirectionalLight(0xd2e2e4, 1.8);
		fill.position.set(-6, 1, 2);
		scene.add(fill);

		const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
		const sections = Array.from({ length: 6 }, (_, index) =>
			document.querySelector<HTMLElement>(`[data-motion-section='${index}']`)
		);

		function readProgress() {
			if (reduced) return 0; // Reduced motion is one deliberately chosen, assembled frame.
			const scroll = Math.max(0, window.scrollY);
			let section = 0;
			while (section < anchors.length - 1 && scroll >= anchors[section + 1]) section++;
			if (section >= anchors.length - 1) return section;
			const length = anchors[section + 1] - anchors[section];
			return section + clamp((scroll - anchors[section]) / Math.max(1, length), 0, 1);
		}

		function measure() {
			if (!renderer || !camera || !shadowLight) return;
			const nextWidth = Math.max(1, host.clientWidth);
			const nextHeight = Math.max(1, host.clientHeight);
			mobile = nextWidth < 768;
			if (width !== nextWidth || height !== nextHeight) {
				width = nextWidth;
				height = nextHeight;
				renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.3 : 1.75));
				renderer.setSize(width, height, false);
				camera.aspect = width / height;
				// Off-axis framing leaves the document's reading column genuinely empty.
				camera.setViewOffset(
					width,
					height,
					mobile ? 0 : -width * 0.245,
					mobile ? -height * 0.19 : 0,
					width,
					height
				);
				camera.updateProjectionMatrix();
				const shadowSize = mobile ? 512 : 1024;
				if (shadowLight.shadow.mapSize.x !== shadowSize) {
					shadowLight.shadow.map?.dispose();
					shadowLight.shadow.map = null;
					shadowLight.shadow.mapSize.set(shadowSize, shadowSize);
				}
			}
			const maximum = Math.max(0, document.documentElement.scrollHeight - height);
			let previous = 0;
			anchors = sections.map((section, index) => {
				if (!section) return previous;
				const rect = section.getBoundingClientRect();
				// Each anchor is derived from the actual section's top AND height.
				// Short final sections still resolve at the document's real scroll end.
				const anchor =
					index === 0
						? 0
						: clamp(
								rect.top +
									window.scrollY +
									Math.min(rect.height * 0.2, height * 0.2) -
									height * 0.2,
								previous,
								maximum
							);
				previous = anchor;
				return anchor;
			});
			needsMeasure = false;
			dirty = true;
		}

		function schedule() {
			if (!disposed && !hidden && !frame) frame = requestAnimationFrame(tick);
		}

		function tick(time: number) {
			frame = 0;
			if (disposed || hidden || !renderer || !camera || !scene) return;
			if (needsMeasure) measure();
			target = readProgress();
			const elapsed = lastTime ? Math.max(0, (time - lastTime) / 1000) : 1 / 60;
			lastTime = time;
			const damping = reduced ? 1 : 1 - Math.exp(-elapsed * 11);
			current += (target - current) * damping;
			pointerX += (pointerTargetX - pointerX) * damping;
			pointerY += (pointerTargetY - pointerY) * damping;
			const converging =
				Math.abs(target - current) > 0.0001 ||
				Math.abs(pointerTargetX - pointerX) > 0.0001 ||
				Math.abs(pointerTargetY - pointerY) > 0.0001;
			if (!converging) {
				current = target;
				pointerX = pointerTargetX;
				pointerY = pointerTargetY;
			}
			const section = Math.min(4, Math.floor(current));
			const mix = smooth(current - section);
			for (let index = 0; index < LAYERS; index++) {
				const from = poses[section][index];
				const to = poses[section + 1][index];
				layers[index].position.lerpVectors(from.position, to.position, mix);
				layers[index].scale.lerpVectors(from.scale, to.scale, mix);
				layers[index].quaternion.slerpQuaternions(from.quaternion, to.quaternion, mix);
			}
			camera.position.lerpVectors(cameraPositions[section], cameraPositions[section + 1], mix);
			lookAt.lerpVectors(cameraTargets[section], cameraTargets[section + 1], mix);
			if (mobile) {
				// Portrait is a separately framed, lower-field composition, not a crop.
				camera.position.multiplyScalar(Math.max(1.35, 0.9 / camera.aspect));
				assembly.scale.setScalar(0.88);
			} else assembly.scale.setScalar(1);
			camera.position.x += pointerX * 0.22;
			camera.position.y += pointerY * 0.14;
			camera.lookAt(lookAt);
			if (dirty || converging || rendererState === 'loading') {
				try {
					renderer.render(scene, camera);
				} catch {
					release('fallback');
					options.onFallback();
					return;
				}
				renders++;
				draws = renderer.info.render.calls;
				geometryCount = renderer.info.memory.geometries;
				dirty = false;
				if (rendererState === 'loading') {
					rendererState = 'ready';
					options.onReady();
				}
			}
			if (converging) {
				dirty = true; // Also draw the final snapped frame, then stop completely.
				schedule();
			} else lastTime = 0;
		}

		function listen(target: EventTarget, event: string, callback: EventListener, passive = true) {
			target.addEventListener(event, callback, { passive });
			cleanups.push(() => target.removeEventListener(event, callback));
		}
		function invalidateMeasure() {
			needsMeasure = true;
			schedule();
		}
		listen(window, 'scroll', () => {
			if (!reduced) {
				dirty = true;
				schedule();
			}
		});
		listen(window, 'resize', invalidateMeasure);
		listen(window, 'pageshow', invalidateMeasure);
		listen(window, 'pointermove', (event) => {
			if (reduced || !finePointer.matches || hidden) return;
			const pointer = event as PointerEvent;
			if (pointer.pointerType !== 'mouse' && pointer.pointerType !== 'pen') return;
			pointerTargetX = clamp(pointer.clientX / Math.max(1, width) - 0.5, -0.5, 0.5);
			pointerTargetY = clamp(0.5 - pointer.clientY / Math.max(1, height), -0.5, 0.5);
			dirty = true;
			schedule();
		});
		function clearPointer() {
			pointerTargetX = pointerTargetY = 0;
			dirty = true;
			schedule();
		}
		listen(document.documentElement, 'pointerleave', clearPointer);
		listen(window, 'blur', clearPointer);
		listen(finePointer, 'change', clearPointer);
		listen(document, 'visibilitychange', () => {
			hidden = document.hidden;
			lastTime = 0;
			if (hidden) {
				cancelAnimationFrame(frame);
				frame = 0;
			} else {
				needsMeasure = true;
				dirty = true;
				schedule();
			}
		});
		listen(
			renderer.domElement,
			'webglcontextlost',
			(event) => {
				event.preventDefault();
				release('lost');
				options.onFallback();
			},
			false
		);
		listen(options.signal, 'abort', () => release());
		if (typeof ResizeObserver !== 'undefined') {
			observer = new ResizeObserver(invalidateMeasure);
			observer.observe(host);
			observer.observe(document.documentElement);
			for (const section of sections) if (section) observer.observe(section);
		}
		if (document.fonts) {
			listen(document.fonts, 'loadingdone', invalidateMeasure);
			void document.fonts.ready.then(() => {
				if (!disposed) invalidateMeasure();
			});
		}
		// Initial navigation may already be deep-linked or scroll-restored.
		measure();
		current = target = readProgress();
		schedule();
		return {
			setReduced(value) {
				if (disposed || reduced === value) return;
				reduced = value;
				if (reduced) {
					current = target = 0;
					pointerX = pointerY = pointerTargetX = pointerTargetY = 0;
				}
				lastTime = 0;
				dirty = true;
				schedule();
			},
			snapshot,
			dispose: () => release()
		};
	} catch {
		release('fallback');
		if (!options.signal.aborted) options.onFallback();
		return { setReduced: () => {}, snapshot, dispose: () => release() };
	}
}
