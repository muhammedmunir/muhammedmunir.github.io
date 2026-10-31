import * as THREE from 'three';

export type QualityTier = 'ultra' | 'balanced' | 'lite';

export const QUALITY_SAMPLE_FRAMES = 90;
const WARMUP_SKIP_FRAMES = 3;

export interface QualityGovernorState {
	tier: QualityTier;
	warmupFrames: number;
	sampleFrames: number;
	accumulatedDt: number;
	settled: boolean;
	measuredFps: number;
}

export interface StudioSoftboxPanel {
	pos: [number, number, number];
	size: [number, number];
	intensity: number;
	color: number;
}

export interface StudioEnvironmentOptions {
	top?: number;
	bottom?: number;
	blur?: number;
	panels?: StudioSoftboxPanel[];
}

export interface StudioEnvironmentHandle {
	texture: THREE.Texture;
	dispose: () => void;
}

const DEFAULT_PANELS: StudioSoftboxPanel[] = [
	// Key overhead softbox — tajamkan tepi logam berus & kaca optik pulau
	{ pos: [0, 7.5, 4.5], size: [9.5, 3.6], intensity: 5.4, color: 0xf8fafc },
	// Warm horizon fill — selari dengan fajar keemasan kepulauan
	{ pos: [-8, 2.6, -2.5], size: [3.6, 6.5], intensity: 2.8, color: 0xffe8cc },
	// Cool cyber rim — selari dengan nadi gentian optik sian/biru
	{ pos: [8, 3.4, -3.5], size: [2.8, 7.2], intensity: 2.7, color: 0xd6eeff },
	// Low ocean bounce — elak bahagian bawah prop logam kelihatan mati/hitam pekat
	{ pos: [0, -4.5, 5.5], size: [7.0, 2.4], intensity: 1.2, color: 0x164e63 }
];

const TIER_RANK: Record<QualityTier, number> = {
	lite: 0,
	balanced: 1,
	ultra: 2
};

export function evaluateQualityTierFromFps(avgFps: number, isWeakDevice = false): QualityTier {
	if (isWeakDevice || !Number.isFinite(avgFps) || avgFps < 38) {
		return 'lite';
	}
	if (avgFps >= 52) {
		return 'ultra';
	}
	return 'balanced';
}

export function createQualityGovernorState(
	initialTier: QualityTier = 'ultra'
): QualityGovernorState {
	return {
		tier: initialTier,
		warmupFrames: 0,
		sampleFrames: 0,
		accumulatedDt: 0,
		settled: initialTier === 'lite',
		measuredFps: initialTier === 'lite' ? 30 : 60
	};
}

/**
 * Merekod sela masa bingkai sebenar (rawDt dalam saat) sepanjang 90 bingkai pertama selepas
 * `renderer.compile()`. Mengembalikan `QualityTier` baharu jika pelarasan diperlukan, atau `null`.
 */
export function recordQualityGovernorFrame(
	state: QualityGovernorState,
	rawDt: number
): QualityTier | null {
	if (state.settled) return null;
	if (!Number.isFinite(rawDt) || rawDt <= 0 || rawDt > 0.5) return null;

	if (state.warmupFrames < WARMUP_SKIP_FRAMES) {
		state.warmupFrames++;
		return null;
	}

	state.sampleFrames++;
	state.accumulatedDt += rawDt;

	if (state.sampleFrames < QUALITY_SAMPLE_FRAMES) {
		return null;
	}

	state.settled = true;
	const avgDt = state.accumulatedDt / state.sampleFrames;
	const avgFps = avgDt > 0 ? 1 / avgDt : 60;
	state.measuredFps = Math.round(avgFps);

	const recommended = evaluateQualityTierFromFps(avgFps, false);
	if (TIER_RANK[recommended] < TIER_RANK[state.tier]) {
		state.tier = recommended;
		return recommended;
	}
	return null;
}

export function buildStudioEnvironmentScene(options: StudioEnvironmentOptions = {}): {
	scene: THREE.Scene;
	disposeTemp: () => void;
} {
	const top = options.top ?? 0x182232;
	const bottom = options.bottom ?? 0x040812;
	const panels = options.panels ?? DEFAULT_PANELS;

	const scene = new THREE.Scene();
	const disposables: Array<{ dispose: () => void }> = [];

	const domeGeo = new THREE.SphereGeometry(20, 48, 24);
	const domeMat = new THREE.ShaderMaterial({
		side: THREE.BackSide,
		depthWrite: false,
		uniforms: {
			top: { value: new THREE.Color(top) },
			bottom: { value: new THREE.Color(bottom) }
		},
		vertexShader: /* glsl */ `
			varying vec3 vP;
			void main() {
				vP = normalize(position);
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
		`,
		fragmentShader: /* glsl */ `
			uniform vec3 top;
			uniform vec3 bottom;
			varying vec3 vP;
			void main() {
				gl_FragColor = vec4(mix(bottom, top, smoothstep(-0.4, 0.8, vP.y)), 1.0);
			}
		`
	});
	disposables.push(domeGeo, domeMat);
	scene.add(new THREE.Mesh(domeGeo, domeMat));

	for (const p of panels) {
		const planeGeo = new THREE.PlaneGeometry(p.size[0], p.size[1]);
		const planeMat = new THREE.MeshBasicMaterial({
			color: new THREE.Color(p.color).multiplyScalar(p.intensity),
			side: THREE.DoubleSide
		});
		disposables.push(planeGeo, planeMat);
		const mesh = new THREE.Mesh(planeGeo, planeMat);
		mesh.position.set(p.pos[0], p.pos[1], p.pos[2]);
		mesh.lookAt(0, 0, 0);
		scene.add(mesh);
	}

	return {
		scene,
		disposeTemp: () => {
			for (const item of disposables) item.dispose();
		}
	};
}

/**
 * Menjana peta persekitaran PMREM studio softbox (diadaptasi daripada `dioramas` `studioEnvironment`)
 * dengan pelupusan penuh geometri sementara & framebuffer WebGLRenderTarget.
 */
export function createStudioEnvironment(
	renderer: THREE.WebGLRenderer,
	options: StudioEnvironmentOptions = {}
): StudioEnvironmentHandle {
	const blur = options.blur ?? 0.04;
	const { scene, disposeTemp } = buildStudioEnvironmentScene(options);
	const pmrem = new THREE.PMREMGenerator(renderer);
	pmrem.compileCubemapShader();
	let rt: THREE.WebGLRenderTarget;
	try {
		rt = pmrem.fromScene(scene, blur);
	} finally {
		pmrem.dispose();
		disposeTemp();
	}

	let disposed = false;
	return {
		texture: rt.texture,
		dispose: () => {
			if (disposed) return;
			disposed = true;
			rt.dispose();
		}
	};
}
