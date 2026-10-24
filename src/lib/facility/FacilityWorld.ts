import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CHAMBERS, isChamberId, type ChamberId } from './chambers';

type Theme = 'dark' | 'light';
type Role = 'shell' | 'ceramic' | 'metal' | 'copper' | 'green' | 'screen' | 'white';
type Options = {
	chamber: ChamberId;
	theme: Theme;
	paused: boolean;
	onInspect: (detail: number) => void;
	onContextLost: () => void;
	onTravel: (travelling: boolean) => void;
};
type Flight = {
	started: number;
	duration: number;
	path: THREE.QuadraticBezierCurve3;
	fromLook: THREE.Vector3;
	toLook: THREE.Vector3;
};

const PALETTE: Record<Role, [number, number]> = {
	shell: [0x182a31, 0xc5d0ca],
	ceramic: [0x9fbbb5, 0xf1efe7],
	metal: [0x425e66, 0x8a9e9a],
	copper: [0xeab482, 0x9c5934],
	green: [0x85d8bd, 0x26745f],
	screen: [0x081a22, 0x193336],
	white: [0xe5efe7, 0xffffff]
};

export class FacilityWorld {
	private readonly scene = new THREE.Scene();
	private readonly camera = new THREE.PerspectiveCamera(43, 1, 0.1, 250);
	private readonly renderer: THREE.WebGLRenderer;
	private readonly observer: ResizeObserver;
	private readonly raycaster = new THREE.Raycaster();
	private readonly pointer = new THREE.Vector2();
	private readonly look = new THREE.Vector3();
	private readonly materials: { material: THREE.MeshStandardMaterial; role: Role }[] = [];
	private readonly textures = new Set<THREE.Texture>();
	private readonly objects: THREE.Mesh[][] = CHAMBERS.map(() => []);
	private readonly rooms: THREE.Group[] = [];
	private readonly rings: THREE.Mesh[] = [];
	private readonly layers: THREE.Group[] = [];
	private readonly packets: { mesh: THREE.Mesh; curve: THREE.Curve<THREE.Vector3> }[] = [];
	private readonly networkLinks: THREE.Mesh[] = [];
	private readonly ambient = new THREE.HemisphereLight(0xd3ece8, 0x253d47, 2.5);
	private readonly keyLight = new THREE.DirectionalLight(0xffeed5, 4);
	private readonly fillLight = new THREE.DirectionalLight(0x99d4e8, 2);
	private readonly accent = new THREE.PointLight(0xeab482, 35, 20, 2);
	private frame: number | null = null;
	private disposed = false;
	private lost = false;
	private paused: boolean;
	private suspended = false;
	private flight: Flight | null = null;
	private elapsed = 0;
	private previousTime = 0;
	private action = 0;
	private selected = -1;
	private phoneTexture: THREE.CanvasTexture | null = null;
	private scanLine: THREE.Mesh | null = null;
	private sensor: THREE.Group | null = null;
	private pointerDown: { x: number; y: number } | null = null;
	private theme: Theme;
	public currentChamber: ChamberId;

	constructor(private container: HTMLElement, private options: Options) {
		this.currentChamber = options.chamber;
		this.theme = options.theme;
		this.paused = options.paused;
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: false,
			powerPreference: 'default'
		});
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.25 : 1.5));
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.1;
		this.renderer.domElement.setAttribute('aria-hidden', 'true');
		this.renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y;';
		this.observer = new ResizeObserver(this.resize);
		try {
			const environment = new RoomEnvironment();
			const pmrem = new THREE.PMREMGenerator(this.renderer);
			try {
				const target = pmrem.fromScene(environment, 0.04, 0.1, 100);
				this.scene.environment = target.texture;
				this.environmentTarget = target;
			} finally {
				environment.dispose();
				pmrem.dispose();
			}
			this.scene.environmentIntensity = 0.65;
			this.keyLight.position.set(8, 16, 10);
			this.fillLight.position.set(-12, 10, -6);
			this.scene.add(this.ambient, this.keyLight, this.fillLight, this.accent);
			this.buildArchitecture();
			this.buildIdentity();
			this.buildNetwork();
			this.buildSystems();
			this.buildMobility();
			this.buildVision();
			this.buildBridge();
			this.setTheme(this.theme);
			this.placeCamera();
			container.appendChild(this.renderer.domElement);
			this.observer.observe(container);
			this.renderer.domElement.addEventListener('pointermove', this.onPointerMove);
			this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
			this.renderer.domElement.addEventListener('pointerup', this.onPointerUp);
			this.renderer.domElement.addEventListener('pointerleave', this.onPointerLeave);
			this.renderer.domElement.addEventListener('webglcontextlost', this.onContextLost);
			document.addEventListener('visibilitychange', this.onVisibility);
			this.resize();
		} catch (error) {
			this.dispose();
			throw error;
		}
	}

	private environmentTarget: THREE.WebGLRenderTarget | null = null;

	private material(role: Role, emissive = false) {
		const color = PALETTE[role][this.theme === 'dark' ? 0 : 1];
		const material = new THREE.MeshStandardMaterial({
			color,
			metalness: role === 'copper' || role === 'metal' ? 0.65 : 0.18,
			roughness: role === 'ceramic' ? 0.3 : 0.48,
			emissive: emissive ? color : 0,
			emissiveIntensity: emissive ? 0.35 : 0
		});
		this.materials.push({ material, role });
		return material;
	}

	private mesh(geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D, position: number[] = [0, 0, 0]) {
		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.set(position[0], position[1], position[2]);
		parent.add(mesh);
		return mesh;
	}

	private box(size: [number, number, number], role: Role, parent: THREE.Object3D, position: number[], radius = 0.08) {
		return this.mesh(new RoundedBoxGeometry(...size, 2, radius), this.material(role), parent, position);
	}

	private ring(radius: number, tube: number, material: THREE.Material, parent: THREE.Object3D, position: number[], arc = Math.PI * 2) {
		return this.mesh(new THREE.TorusGeometry(radius, tube, 8, 72, arc), material, parent, position);
	}

	private label(text: string, width = 3.2, height = 0.7) {
		const canvas = document.createElement('canvas');
		canvas.width = 768;
		canvas.height = 168;
		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.fillStyle = '#12282e';
			ctx.fillRect(0, 0, 768, 168);
			ctx.fillStyle = '#e9eee4';
			ctx.font = '500 56px monospace';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(text, 384, 84);
		}
		const texture = new THREE.CanvasTexture(canvas);
		texture.colorSpace = THREE.SRGBColorSpace;
		this.textures.add(texture);
		return new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture }));
	}

	private inspectable(mesh: THREE.Mesh, chamber: ChamberId, detail: number) {
		mesh.userData.detail = detail;
		this.objects[chamber].push(mesh);
		return mesh;
	}

	private buildArchitecture() {
		const floorMat = this.material('shell');
		const edgeMat = this.material('metal');
		const lightMat = this.material('copper', true);
		const shadowCanvas = document.createElement('canvas');
		shadowCanvas.width = shadowCanvas.height = 128;
		const ctx = shadowCanvas.getContext('2d');
		if (ctx) {
			const gradient = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
			gradient.addColorStop(0, 'rgba(0,0,0,0.5)');
			gradient.addColorStop(1, 'rgba(0,0,0,0)');
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, 128, 128);
		}
		const shadowMap = new THREE.CanvasTexture(shadowCanvas);
		this.textures.add(shadowMap);
		for (const chamber of CHAMBERS) {
			const room = new THREE.Group();
			room.position.set(...chamber.position);
			this.rooms.push(room);
			this.scene.add(room);
			this.mesh(new THREE.CylinderGeometry(6.6, 6.3, 0.42, 64), floorMat, room, [0, -0.35, 0]);
			this.mesh(new THREE.CylinderGeometry(5.9, 6.2, 0.15, 64), this.material('ceramic'), room, [0, -0.07, 0]);
			this.ring(6.4, 0.045, lightMat, room, [0, -0.1, 0]).rotation.x = Math.PI / 2;
			this.ring(5.5, 0.025, edgeMat, room, [0, 0.02, 0]).rotation.x = Math.PI / 2;
			const shadow = this.mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false }), room, [0, 0.03, 0]);
			shadow.rotation.x = -Math.PI / 2;
			for (const x of [-5.2, 5.2]) {
				this.box([0.22, 5.4, 0.3], 'metal', room, [x, 2.6, -3.2]);
				this.box([0.06, 4.3, 0.05], 'copper', room, [x + 0.16, 2.8, -3.02], 0.02);
			}
			this.box([10.8, 0.18, 0.45], 'metal', room, [0, 5.25, -3.2]);
			const canopy = this.ring(5.3, 0.08, edgeMat, room, [0, 5.2, 0], Math.PI * 1.15);
			canopy.rotation.x = Math.PI / 2;
			canopy.rotation.z = -0.23;
			const plaque = this.label(`${String(chamber.id).padStart(2, '0')} / ${chamber.code.split('-')[0]}`);
			plaque.position.set(-1.5, 4.65, -3.15);
			room.add(plaque);
			for (let i = 0; i < 18; i++) {
				const angle = i / 18 * Math.PI * 2;
				const tick = this.box([0.06, 0.035, i % 3 === 0 ? 0.4 : 0.18], 'metal', room, [Math.sin(angle) * 6.1, 0.04, Math.cos(angle) * 6.1], 0.01);
				tick.rotation.y = angle;
			}
		}
		for (let i = 0; i < CHAMBERS.length - 1; i++) {
			const a = new THREE.Vector3(...CHAMBERS[i].position);
			const b = new THREE.Vector3(...CHAMBERS[i + 1].position);
			const direction = b.clone().sub(a).normalize();
			const start = a.clone().addScaledVector(direction, 6.5);
			const end = b.clone().addScaledVector(direction, -6.5);
			const center = start.clone().add(end).multiplyScalar(0.5);
			const bridge = new THREE.Group();
			bridge.position.copy(center);
			bridge.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
			const length = start.distanceTo(end);
			this.mesh(new THREE.BoxGeometry(2.4, 0.18, length), floorMat, bridge, [0, -0.2, 0]);
			for (const x of [-1.14, 1.14]) {
				this.mesh(new THREE.BoxGeometry(0.04, 0.04, length), lightMat, bridge, [x, 0.05, 0]);
			}
			this.scene.add(bridge);
		}
	}

	private buildIdentity() {
		const room = this.rooms[0];
		const portal = new THREE.Group();
		portal.position.set(0, 2.45, -0.8);
		portal.rotation.y = 0.2;
		room.add(portal);
		for (let i = 0; i < 3; i++) {
			const ring = this.ring(2.6 + i * 0.34, 0.07, this.material(i === 1 ? 'copper' : 'metal'), portal, [0, 0, -i * 0.35], Math.PI * 1.7);
			ring.rotation.z = i * 1.6;
			this.rings.push(ring);
		}
		const card = this.inspectable(this.box([2.4, 3.15, 0.26], 'ceramic', portal, [0, 0, 0.35], 0.15), 0, 0);
		card.rotation.z = -0.07;
		const monogram = this.label('M / M', 1.8, 0.4);
		monogram.position.set(0, 0.4, 0.495);
		monogram.userData.detail = 0;
		portal.add(monogram);
		const title = this.label('SYSTEMS ENGINEER', 1.95, 0.3);
		title.position.set(0, -0.2, 0.5);
		portal.add(title);
		for (let i = 0; i < 3; i++) {
			const x = (i - 1) * 2.4;
			this.box([1.7, 0.5, 1.3], 'shell', room, [x, 0.3, 2.5]);
			this.inspectable(this.box([1.4, 0.15, 1], i === 1 ? 'copper' : 'green', room, [x, 0.65, 2.5]), 0, i);
		}
	}

	private buildNetwork() {
		const room = this.rooms[1];
		const positions = [[-3, 0.8, 1.8], [-2.6, 1.4, -2.2], [2.6, 1.4, -2.2], [3, 0.8, 1.8]];
		const portMat = this.material('green', true);
		positions.forEach((p, index) => {
			this.box([1.7, p[1], 1.4], 'metal', room, [p[0], p[1] / 2, p[2]]);
			this.inspectable(this.box([2.15, 0.5, 1.6], 'ceramic', room, p), 1, Math.min(index, 2));
			for (let j = 0; j < 6; j++) {
				this.mesh(new THREE.BoxGeometry(0.17, 0.12, 0.03), portMat, room, [p[0] - 0.72 + j * 0.28, p[1], p[2] + 0.81]);
			}
		});
		for (let i = 0; i < 4; i++) {
			const a = new THREE.Vector3(...positions[i]);
			const b = new THREE.Vector3(...positions[(i + 1) % 4]);
			a.y += 0.6;
			b.y += 0.6;
			const center = a.clone().add(b).multiplyScalar(0.5);
			center.y += 1.3;
			const curve = new THREE.QuadraticBezierCurve3(a, center, b);
			this.networkLinks.push(this.mesh(new THREE.TubeGeometry(curve, 32, 0.035, 6, false), this.material('metal'), room));
			const packet = this.mesh(new THREE.SphereGeometry(0.12, 12, 8), this.material('copper', true), room);
			packet.position.copy(curve.getPoint(i / 4));
			this.packets.push({ mesh: packet, curve });
		}
		const hub = this.inspectable(this.box([1.7, 2.5, 1.6], 'shell', room, [0, 1.35, 0]), 1, 2);
		for (let i = 0; i < 4; i++) this.box([1.2, 0.06, 0.04], 'green', hub, [0, -0.7 + i * 0.45, 0.82], 0.02);
	}

	private buildSystems() {
		const room = this.rooms[2];
		for (const x of [-4, 4]) {
			this.box([1.45, 4.2, 2.4], 'shell', room, [x, 2.2, -1.3]);
			for (let j = 0; j < 8; j++) {
				this.box([1.15, 0.26, 0.08], 'metal', room, [x, 0.55 + j * 0.46, -0.05], 0.02);
				this.box([0.12, 0.08, 0.03], 'green', room, [x + 0.4, 0.55 + j * 0.46, 0.01], 0.01);
			}
		}
		const labels = ['01 / INTERFACE', '02 / WORKFLOW', '03 / RECORDS', '04 / DELIVERY'];
		for (let i = 0; i < 4; i++) {
			const layer = new THREE.Group();
			layer.position.y = 0.6 + i * 0.94;
			room.add(layer);
			this.layers.push(layer);
			this.inspectable(this.box([3.1, 0.67, 2.6], i % 2 ? 'shell' : 'ceramic', layer, [0, 0, 0]), 2, i);
			this.box([0.04, 0.2, 2.1], 'copper', layer, [1.57, 0, 0], 0.01);
			const label = this.label(labels[i], 2.5, 0.24);
			label.position.set(0, 0, 1.32);
			layer.add(label);
		}
	}

	private drawPhone(step: number) {
		if (!this.phoneTexture) return;
		const canvas = this.phoneTexture.image as HTMLCanvasElement;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.fillStyle = '#16363b';
		ctx.fillRect(0, 0, 384, 720);
		ctx.fillStyle = '#9ad7c2';
		ctx.font = '24px monospace';
		ctx.fillText('ONBOARDX', 32, 64);
		ctx.fillStyle = '#f2efe3';
		ctx.font = 'bold 38px sans-serif';
		ctx.fillText('A better', 32, 142);
		ctx.fillText('first day.', 32, 190);
		['01   DOCUMENTS', '02   PROFILE', '03   TRAINING'].forEach((text, index) => {
			ctx.fillStyle = index === step % 3 ? '#b8d9c7' : '#244a4e';
			ctx.fillRect(28, 256 + index * 110, 328, 84);
			ctx.fillStyle = index === step % 3 ? '#153231' : '#dae9df';
			ctx.font = '22px monospace';
			ctx.fillText(text, 44, 304 + index * 110);
		});
		ctx.fillStyle = '#c0d1c9';
		ctx.font = '18px monospace';
		ctx.fillText('PORTFOLIO / CONCEPT VIEW', 32, 664);
		this.phoneTexture.needsUpdate = true;
	}

	private buildMobility() {
		const room = this.rooms[3];
		const phone = new THREE.Group();
		phone.position.set(0, 2.7, 0);
		phone.rotation.y = 0.15;
		room.add(phone);
		this.inspectable(this.box([2.35, 4.6, 0.3], 'metal', phone, [0, 0, 0], 0.2), 3, 0);
		const canvas = document.createElement('canvas');
		canvas.width = 384;
		canvas.height = 720;
		this.phoneTexture = new THREE.CanvasTexture(canvas);
		this.phoneTexture.colorSpace = THREE.SRGBColorSpace;
		this.textures.add(this.phoneTexture);
		this.drawPhone(0);
		const screen = this.mesh(new THREE.PlaneGeometry(2.12, 4.07), new THREE.MeshBasicMaterial({ map: this.phoneTexture }), phone, [0, 0, 0.161]);
		this.inspectable(screen, 3, 0);
		this.box([0.6, 0.1, 0.06], 'screen', phone, [0, 2.12, 0.17], 0.02);
		for (let i = 0; i < 3; i++) {
			const arch = this.ring(2.6 + i * 0.65, 0.07, this.material(i === 2 ? 'copper' : 'metal'), room, [0, 1.5, -1.1 - i * 0.4], Math.PI);
			arch.rotation.z = 0;
			const terminal = this.inspectable(this.box([1.2, 0.45, 1], 'ceramic', room, [-3 + i * 3, 0.5, 3]), 3, i);
			this.box([0.9, 0.04, 0.6], 'green', terminal, [0, 0.25, 0]);
		}
	}

	private buildVision() {
		const room = this.rooms[4];
		this.box([2, 0.7, 2], 'shell', room, [-1.5, 0.4, 0]);
		this.box([0.45, 1.6, 0.5], 'metal', room, [-1.5, 1.5, 0]);
		this.sensor = new THREE.Group();
		this.sensor.position.set(-1.5, 2.55, 0);
		room.add(this.sensor);
		this.inspectable(this.box([1.85, 1.5, 1.5], 'ceramic', this.sensor, [0, 0, 0]), 4, 0);
		this.ring(0.62, 0.12, this.material('metal'), this.sensor, [0, 0, 0.85]);
		this.mesh(new THREE.CircleGeometry(0.53, 32), this.material('screen'), this.sensor, [0, 0, 0.94]);
		this.ring(0.43, 0.04, this.material('green', true), this.sensor, [0, 0, 0.97]);
		this.mesh(new THREE.CircleGeometry(0.17, 24), this.material('green', true), this.sensor, [0, 0, 0.98]);
		const board = this.inspectable(this.box([2.7, 3.45, 0.16], 'screen', room, [2.35, 2.2, -0.3]), 4, 2);
		for (let i = 0; i < 3; i++) {
			const target = this.inspectable(this.box([0.52, 0.52, 0.05], i === 1 ? 'copper' : 'ceramic', board, [-0.75 + i * 0.75, 0.55 - (i % 2) * 1.1, 0.13]), 4, i);
			this.box([0.22, 0.22, 0.03], 'screen', target, [0, 0, 0.045], 0.01);
		}
		this.scanLine = this.box([2.45, 0.035, 0.04], 'green', board, [0, 1.3, 0.15], 0.01);
		const label = this.label('CV / LOCAL STUDY', 2.3, 0.25);
		label.position.set(2.35, 0.7, -0.2);
		room.add(label);
	}

	private buildBridge() {
		const room = this.rooms[5];
		this.box([5, 0.24, 2.15], 'ceramic', room, [0, 1.25, 0]);
		for (const x of [-1.8, 1.8]) this.box([0.2, 1.2, 1.65], 'metal', room, [x, 0.6, 0]);
		for (let i = 0; i < 3; i++) {
			const panel = this.inspectable(this.box([1.32, 1.15, 0.12], 'screen', room, [(i - 1) * 1.6, 2, -0.5]), 5, i);
			panel.rotation.x = -0.15;
			const label = this.label(['EMAIL', 'GITHUB', 'LINKEDIN'][i], 1.1, 0.24);
			label.position.set(0, 0, 0.075);
			panel.add(label);
		}
		for (let i = 0; i < 3; i++) {
			const arc = this.ring(2.1 + i * 0.6, 0.065, this.material(i === 1 ? 'copper' : 'metal'), room, [0, 2.8, -2.8], Math.PI);
			arc.rotation.z = 0;
		}
	}

	public goToChamber(id: ChamberId) {
		if (this.disposed || !isChamberId(id)) return;
		const destination = new THREE.Vector3(...CHAMBERS[id].cameraPos);
		const toLook = new THREE.Vector3(...CHAMBERS[id].cameraLook);
		this.currentChamber = id;
		this.action = 0;
		this.selected = -1;
		this.setFocus(-1);
		this.updateActionVisuals();
		this.accent.position.set(...CHAMBERS[id].position).add(new THREE.Vector3(0, 5, 3));
		if (this.paused) {
			this.camera.position.copy(destination);
			this.look.copy(toLook);
			this.flight = null;
			this.options.onTravel(false);
		} else {
			const midpoint = this.camera.position.clone().add(destination).multiplyScalar(0.5);
			midpoint.y += Math.min(5, this.camera.position.distanceTo(destination) * 0.08);
			this.flight = {
				started: performance.now(),
				duration: Math.min(2600, 1100 + this.camera.position.distanceTo(destination) * 15),
				path: new THREE.QuadraticBezierCurve3(this.camera.position.clone(), midpoint, destination),
				fromLook: this.look.clone(), toLook
			};
			this.options.onTravel(true);
		}
		this.invalidate();
	}

	private placeCamera() {
		this.camera.position.set(...CHAMBERS[this.currentChamber].cameraPos);
		this.look.set(...CHAMBERS[this.currentChamber].cameraLook);
		this.camera.lookAt(this.look);
		this.accent.position.set(...CHAMBERS[this.currentChamber].position).add(new THREE.Vector3(0, 5, 3));
	}

	public setTheme(theme: Theme) {
		if (this.disposed) return;
		this.theme = theme;
		for (const { material, role } of this.materials) {
			material.color.setHex(PALETTE[role][theme === 'dark' ? 0 : 1]);
			if (material.emissiveIntensity > 0) material.emissive.copy(material.color);
		}
		const background = theme === 'dark' ? 0x0c2028 : 0xe8ece4;
		this.scene.background = new THREE.Color(background);
		this.scene.fog = new THREE.FogExp2(background, 0.018);
		this.ambient.intensity = theme === 'dark' ? 2 : 3;
		this.scene.environmentIntensity = theme === 'dark' ? 0.65 : 0.9;
		this.invalidate();
	}

	public setPaused(paused: boolean) {
		if (this.disposed) return;
		this.paused = paused;
		if (paused && this.flight) {
			this.flight = null;
			this.placeCamera();
			this.options.onTravel(false);
		}
		this.stop();
		this.invalidate();
	}

	public setSuspended(suspended: boolean) {
		this.suspended = suspended;
		this.stop();
		if (!suspended) this.invalidate();
	}

	public setFocus(detail: number) {
		this.selected = detail;
		this.objects.forEach((objects, chamber) => objects.forEach((mesh) => {
			const material = mesh.material;
			if (!(material instanceof THREE.MeshStandardMaterial)) return;
			const active = chamber === this.currentChamber && mesh.userData.detail === detail;
			material.emissive.setHex(active ? 0xb1804d : 0);
			material.emissiveIntensity = active ? 0.24 : 0;
		}));
		this.invalidate();
	}

	public runAction(step: number) {
		if (this.disposed) return;
		this.action = step;
		this.updateActionVisuals();
		this.invalidate();
	}

	private updateActionVisuals() {
		this.layers.forEach((layer, index) => {
			const expanded = this.currentChamber === 2 && this.action % 2 === 1;
			layer.position.x = expanded ? (index - 1.5) * 0.65 : 0;
			layer.position.y = 0.6 + index * (expanded ? 1.3 : 0.94);
		});
		this.packets.forEach(({ mesh, curve }, index) => {
			mesh.visible = this.currentChamber !== 1 || this.action % 2 === 0 || index !== 1;
			this.networkLinks[index].visible = mesh.visible;
			mesh.position.copy(curve.getPoint(this.action % 2 ? 0.78 : 0.25));
		});
		this.drawPhone(Math.max(0, this.action - 1));
		if (this.scanLine) this.scanLine.position.y = this.action % 2 ? -0.7 : 1.1;
		if (this.sensor) this.sensor.rotation.y = this.action % 2 ? -0.25 : 0.15;
	}

	private resize = () => {
		if (this.disposed) return;
		const width = Math.max(1, this.container.clientWidth);
		const height = Math.max(1, this.container.clientHeight);
		this.renderer.setSize(width, height, false);
		this.camera.aspect = width / height;
		const narrow = width < 760;
		this.camera.setViewOffset(width, height, narrow ? 0 : -width * 0.17, height * (narrow ? 0.2 : 0.015), width, height);
		this.camera.fov = narrow ? 49 : 43;
		this.camera.updateProjectionMatrix();
		this.invalidate();
	};

	private pick(event: PointerEvent) {
		if (this.flight || this.disposed || this.suspended) return null;
		const rect = this.renderer.domElement.getBoundingClientRect();
		this.pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
		this.scene.updateMatrixWorld();
		this.raycaster.setFromCamera(this.pointer, this.camera);
		// Uji permukaan terdekat dahulu supaya objek di belakang tidak boleh diklik menembusi dinding.
		const hit = this.raycaster.intersectObjects(this.rooms[this.currentChamber].children, true).find(({ object }) => object instanceof THREE.Mesh);
		if (!hit) return null;
		const detail = hit.object.userData.detail;
		return Number.isInteger(detail) ? detail as number : null;
	}

	private onPointerMove = (event: PointerEvent) => {
		this.renderer.domElement.style.cursor = this.pick(event) === null ? 'default' : 'pointer';
	};
	private onPointerDown = (event: PointerEvent) => {
		if (event.button === 0) this.pointerDown = { x: event.clientX, y: event.clientY };
	};
	private onPointerUp = (event: PointerEvent) => {
		const down = this.pointerDown;
		this.pointerDown = null;
		if (!down || Math.hypot(event.clientX - down.x, event.clientY - down.y) > 8) return;
		const detail = this.pick(event);
		if (detail !== null) this.options.onInspect(detail);
	};
	private onPointerLeave = () => { this.pointerDown = null; };
	private onVisibility = () => {
		this.stop();
		if (!document.hidden) this.invalidate();
	};
	private onContextLost = (event: Event) => {
		event.preventDefault();
		this.lost = true;
		this.stop();
		this.options.onContextLost();
	};

	private stop() {
		if (this.frame !== null) cancelAnimationFrame(this.frame);
		this.frame = null;
		this.previousTime = 0;
	}
	private invalidate() {
		if (this.disposed || this.lost || document.hidden || this.suspended || this.frame !== null) return;
		this.frame = requestAnimationFrame(this.render);
	}
	private render = (now: number) => {
		this.frame = null;
		if (this.disposed || this.lost || document.hidden || this.suspended) return;
		const delta = this.previousTime ? Math.min((now - this.previousTime) / 1000, 0.05) : 0;
		this.previousTime = now;
		if (!this.paused) this.elapsed += delta;
		if (this.flight) {
			const t = Math.min(1, (now - this.flight.started) / this.flight.duration);
			const eased = t * t * (3 - 2 * t);
			this.camera.position.copy(this.flight.path.getPoint(eased));
			this.look.lerpVectors(this.flight.fromLook, this.flight.toLook, eased);
			if (t === 1) {
				this.flight = null;
				this.options.onTravel(false);
			}
		}
		this.camera.lookAt(this.look);
		if (!this.paused) {
			if (this.currentChamber === 0) this.rings.forEach((ring, index) => { ring.rotation.z += delta * (index % 2 ? -0.07 : 0.05); });
			if (this.currentChamber === 1) this.packets.forEach(({ mesh, curve }, index) => { mesh.position.copy(curve.getPoint((this.elapsed * 0.2 + index * 0.25) % 1)); });
			if (this.currentChamber === 4 && this.scanLine) this.scanLine.position.y = Math.sin(this.elapsed * 0.8) * 1.3;
		}
		this.renderer.render(this.scene, this.camera);
		const ambientMotion = !this.paused && (this.currentChamber === 0 || this.currentChamber === 1 || this.currentChamber === 4);
		if (ambientMotion || this.flight) this.invalidate();
	};

	public dispose() {
		if (this.disposed) return;
		this.disposed = true;
		this.stop();
		this.observer.disconnect();
		document.removeEventListener('visibilitychange', this.onVisibility);
		const canvas = this.renderer.domElement;
		canvas.removeEventListener('pointermove', this.onPointerMove);
		canvas.removeEventListener('pointerdown', this.onPointerDown);
		canvas.removeEventListener('pointerup', this.onPointerUp);
		canvas.removeEventListener('pointerleave', this.onPointerLeave);
		canvas.removeEventListener('webglcontextlost', this.onContextLost);
		const geometries = new Set<THREE.BufferGeometry>();
		const materials = new Set<THREE.Material>();
		this.scene.traverse((object) => {
			if (object instanceof THREE.Mesh) {
				geometries.add(object.geometry);
				for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
			}
		});
		geometries.forEach((geometry) => geometry.dispose());
		materials.forEach((material) => material.dispose());
		this.textures.forEach((texture) => texture.dispose());
		this.environmentTarget?.dispose();
		this.scene.clear();
		this.renderer.dispose();
		canvas.remove();
	}
}
