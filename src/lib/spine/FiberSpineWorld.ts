import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { STATIONS, PROFILE, type Locale, type HotspotItem, type SpineStation } from './spine-data';
import type { ExhibitPalette } from './exhibit-screen';
import {
	createToySpring,
	stepToySpring,
	resetToySpring,
	clampToySpring,
	type ToySpring
} from './toy-spring';
import {
	createStudioEnvironment,
	createQualityGovernorState,
	recordQualityGovernorFrame,
	type QualityTier,
	type QualityGovernorState,
	type StudioEnvironmentHandle
} from './studio-env';
import {
	createBeveledSlabGeometry,
	createSolidDishGeometry,
	DIORAMA_GLB_MAP,
	buildDioramaProp,
	type DioramaBuildContext
} from './diorama-props';
import { DioramaGlbLoader } from './diorama-glb';
import { createXRayLensPass, type XRayLensBindings } from './xray-lens';

export type { QualityTier } from './studio-env';
export type ThemeMode = 'dark' | 'light';

export interface ToyStatus {
	hits: number;
	ready: boolean;
}

export interface LayerMarker {
	layer: 'top' | 'mid' | 'base';
	x: number;
	y: number;
	visible: boolean;
}

export interface ToyLayer {
	id: 'top' | 'mid' | 'base';
	root: THREE.Group;
	/** Offset local (dalam ruang prop) apabila lapisan terbelah semasa fokus. */
	offset: THREE.Vector3;
	/** Titik sauh tempatan (ruang prop) yang dipancarkan ke skrin bagi leader line. */
	anchorLocal: THREE.Vector3;
}

export interface ProjectedMarker {
	id: string;
	stationIndex: number;
	x: number;
	y: number;
	visible: boolean;
	layers?: LayerMarker[];
}

export interface WorldCallbacks {
	onStationChange?: (stationIndex: number, progress: number) => void;
	onHotspotHover?: (hotspotId: string | null, hoverLabel?: string | null) => void;
	onHotspotSelect?: (hotspotId: string, stationIndex: number) => void;
	onMarkersUpdate?: (markers: ProjectedMarker[]) => void;
	onToyStatus?: (status: ToyStatus) => void;
	onOpenEditorial?: () => void;
	onOpenDossier?: () => void;
	onProgress?: (progress: number, stageMessage: string) => void;
	onReady?: () => void;
}

export interface ToyRecord {
	id: string;
	stationIndex: number;
	hotspot: HotspotItem;
	mesh: THREE.Group;
	baseY: number;
	spring: ToySpring;
	spinAxis: THREE.Object3D;
	spinSpeed: number;
	kind: string;
	haloMat?: THREE.MeshStandardMaterial;
	scaleOffset?: number;
	scaleVelocity?: number;
	layers?: ToyLayer[];
	/** Fokus semasa lapisan: 0 = bercantum, 1 = terbelah penuh. */
	exploded?: number;
}

declare global {
	interface Window {
		__SPINE_WORLD__?: FiberSpineWorld;
		__screenWorld?: FiberSpineWorld;
		__fps?: number;
	}
}

interface StationHeaderRecord {
	station: SpineStation;
	canvas: HTMLCanvasElement;
	texture: THREE.CanvasTexture;
	screenMesh: THREE.Mesh;
	screenWidth: number;
	screenMat: THREE.Material;
}

interface PBRSurfaceMaps {
	normalMap: THREE.CanvasTexture;
	roughnessMap: THREE.CanvasTexture;
	metalnessMap: THREE.CanvasTexture;
	deckNormalMap: THREE.CanvasTexture;
}

interface WeatherConfig {
	sunElevation: number;
	sunAzimuth: number;
	waveScale: number;
	choppiness: number;
	skyZenith: THREE.Color;
	skyHorizon: THREE.Color;
	sunColor: THREE.Color;
	waterDeep: THREE.Color;
	waterShallow: THREE.Color;
	waterScatter: THREE.Color;
	fogColor: THREE.Color;
	nightFactor: number;
}

// 360° ORBITAL ARCHIPELAGO GEOMETRY (Mengelilingi Teras Reaktor Pusat di (0,0,0) — BUKAN lorong lurus!)
export const ORBIT_RADIUS = 38;
const ISLAND_DECK_HEIGHT = 1.2;
const LOCAL_DECK_HEIGHT = 0.42;
const STATION_ANGLES = [0, 1, 2, 3, 4, 5].map((i) => (i / 6) * Math.PI * 2);
// Aras asal kumpulan pulau; dek tempatan pula 0.42 m di atasnya.
const STATION_DECK_ORIGIN_Y = ISLAND_DECK_HEIGHT - LOCAL_DECK_HEIGHT;

const STATION_ANCHORS: THREE.Vector3[] = STATION_ANGLES.map(
	(angle) =>
		new THREE.Vector3(
			Math.sin(angle) * ORBIT_RADIUS,
			STATION_DECK_ORIGIN_Y,
			Math.cos(angle) * ORBIT_RADIUS
		)
);

const PULSE_COUNT = 72;
const MOTE_COUNT = 280;

// Kontrak mainan taktil: satu prop besar per stesen di atas tapak; tiada monitor teks.
const TOY_COOLDOWN = 2.5;
const LASER_COOLDOWN = 1.6;
const LASER_DURATION = 0.7;
const LAUNCH_CUTOFF = 0.85;
const TOY_ORIGIN_Y = 0.42;

// Laluan cahaya mengikut aras jambatan, bukan aras dek pulau: bebola denyut tidak lagi
// menembusi lantai dek (dahulu y=1.12 lawan permukaan dek y=1.20).
const CAUSEWAY_DECK_Y = 0.22;
const CAUSEWAY_RAIL_Y = 0.32;
const CAUSEWAY_CORE_Y = 0.28;
const PULSE_RIDE_Y = 0.36;
const PULSE_DIVE_RADIUS = 16.5; // Mula menyelam sebelum benteng ombak pulau (13.1 m).
const PULSE_DIVE_FADE = 3.0;

// Soket kabel pada rasuk atas gerbang pulau (gerbang tempatan z=-5.2, rasuk y=0.35+5.92).
const TETHER_HUB_RADIUS = 4.35;
const TETHER_HUB_Y = 10.5;
const TETHER_SOCKET_RADIUS = ORBIT_RADIUS - 5.2;
const TETHER_SOCKET_Y = STATION_DECK_ORIGIN_Y + 6.27;

// Atribut statik; hanyutan, saiz perspektif dan denyutan dikira pada GPU.
const MOTE_VERTEX_SHADER = /* glsl */ `
	uniform float uTime;
	uniform float uViewportHeight;
	attribute float aPhase;
	attribute float aSize;
	varying float vGlow;
	varying float vDistance;

	void main() {
		vec3 p = position;
		p.x += sin(uTime * 0.17 + aPhase) * 0.65;
		p.z += cos(uTime * 0.13 + aPhase) * 0.65;
		p.y += sin(uTime * 0.55 + aPhase) * 0.55;
		vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
		vDistance = -viewPosition.z;
		vGlow = 0.72 + 0.28 * sin(uTime * 0.8 + aPhase);
		gl_PointSize = clamp(aSize * uViewportHeight * projectionMatrix[1][1] / max(1.0, vDistance), 1.0, 18.0);
		gl_Position = projectionMatrix * viewPosition;
	}
`;

const MOTE_FRAGMENT_SHADER = /* glsl */ `
	uniform vec3 uColor;
	uniform float uOpacity;
	varying float vGlow;
	varying float vDistance;

	void main() {
		float radius = length(gl_PointCoord - 0.5) * 2.0;
		if (radius >= 1.0) discard;
		float halo = exp(-radius * radius * 5.0) * (1.0 - smoothstep(0.65, 1.0, radius));
		float fade = smoothstep(1.0, 4.0, vDistance) * (1.0 - smoothstep(65.0, 125.0, vDistance));
		gl_FragColor = vec4(uColor * (1.1 + vGlow), halo * fade * uOpacity);
		#include <tonemapping_fragment>
		#include <colorspace_fragment>
	}
`;

const OCEAN_VERTEX_SHADER = /* glsl */ `
	uniform float uTime;
	uniform float uWaveScale;
	uniform float uChoppiness;
	uniform vec3 uIslands[6];

	varying vec3 vWorldPos;
	varying vec3 vNormal;
	varying float vJacobian;
	varying float vElevation;
	varying float vIslandDist;

	void gerstnerWave(
		vec2 xz,
		vec2 dir,
		float steepness,
		float wavelength,
		float speed,
		inout vec3 displaced,
		inout vec3 tangent,
		inout vec3 binormal,
		inout float jacobian
	) {
		float k = 6.28318530718 / wavelength;
		float c = sqrt(9.81 / k) * speed;
		vec2 d = normalize(dir);
		float f = k * (dot(d, xz) - c * uTime);
		float a = (steepness / k) * uWaveScale;

		float cosF = cos(f);
		float sinF = sin(f);

		displaced.x += d.x * (a * cosF * uChoppiness);
		displaced.y += a * sinF;
		displaced.z += d.y * (a * cosF * uChoppiness);

		float wa = k * a;
		tangent += vec3(
			-d.x * d.x * (wa * sinF * uChoppiness),
			d.x * (wa * cosF),
			-d.x * d.y * (wa * sinF * uChoppiness)
		);
		binormal += vec3(
			-d.x * d.y * (wa * sinF * uChoppiness),
			d.y * (wa * cosF),
			-d.y * d.y * (wa * sinF * uChoppiness)
		);
		jacobian -= wa * sinF * 0.52;
	}

	void main() {
		vec4 worldInitial = modelMatrix * vec4(position, 1.0);
		vec3 displaced = worldInitial.xyz;
		vec3 tangent = vec3(1.0, 0.0, 0.0);
		vec3 binormal = vec3(0.0, 0.0, 1.0);
		float jacobian = 1.0;

		vec2 p = displaced.xz;
		gerstnerWave(p, vec2(0.86, -0.51), 0.14, 28.0, 1.02, displaced, tangent, binormal, jacobian);
		gerstnerWave(p, vec2(-0.62, -0.78), 0.10, 14.5, 1.12, displaced, tangent, binormal, jacobian);
		gerstnerWave(p, vec2(0.32, -0.94), 0.06, 6.2, 1.25, displaced, tangent, binormal, jacobian);

		// Redam ombak di bawah setiap pelantar pulau: air tidak boleh menembusi dek.
		float islandClearance = 1.0;
		float minIslandD = length(worldInitial.xz);
		for (int i = 0; i < 6; i++) {
			float islandDist = length(worldInitial.xz - uIslands[i].xz);
			minIslandD = min(minIslandD, islandDist);
			islandClearance = min(islandClearance, smoothstep(12.6, 17.4, islandDist));
		}
		vIslandDist = minIslandD;

		// Redam ombak di sekitar cincin jambatan orbital (R=38) dan teras pusat (R=0)
		float radialDist = length(worldInitial.xz);
		float ringClearance = smoothstep(1.5, 6.5, abs(radialDist - 38.0));
		float coreClearance = smoothstep(3.0, 10.0, radialDist);
		float waveDamp = islandClearance * mix(0.25, 1.0, ringClearance * coreClearance);

		vec3 delta = displaced - worldInitial.xyz;
		displaced = worldInitial.xyz + delta * waveDamp;
		tangent = mix(vec3(1.0, 0.0, 0.0), tangent, waveDamp);
		binormal = mix(vec3(0.0, 0.0, 1.0), binormal, waveDamp);
		jacobian = mix(1.0, jacobian, waveDamp);

		vWorldPos = displaced;
		vElevation = displaced.y;
		vNormal = normalize(cross(binormal, tangent));
		vJacobian = jacobian;

		gl_Position = projectionMatrix * viewMatrix * vec4(displaced, 1.0);
	}
`;

const OCEAN_FRAGMENT_SHADER = /* glsl */ `
	uniform float uTime;
	uniform vec3 uSunDir;
	uniform vec3 uSunColor;
	uniform vec3 uSkyZenith;
	uniform vec3 uSkyHorizon;
	uniform vec3 uWaterDeep;
	uniform vec3 uWaterShallow;
	uniform vec3 uWaterScatter;
	uniform vec3 uFogColor;
	uniform float uNightFactor;
	uniform float uSunSpecScale;
	uniform vec3 uIslands[6];

	varying vec3 vWorldPos;
	varying vec3 vNormal;
	varying float vJacobian;
	varying float vElevation;
	varying float vIslandDist;

	void main() {
		vec3 viewVec = cameraPosition - vWorldPos;
		float dist = length(viewVec);
		vec3 V = normalize(viewVec);

		// Riak mikro perkakasan GPU SFU pantas (1 kitaran perkakasan vs 80 kitaran ALU hash)
		vec2 w1 = sin(vWorldPos.xz * 1.65 + vec2(uTime * 0.38, -uTime * 0.29));
		vec2 w2 = sin(vWorldPos.xz * 3.80 - vec2(uTime * 0.52, uTime * 0.41));
		vec2 w3 = cos(vWorldPos.xz * 7.50 + vec2(-uTime * 0.75, uTime * 0.63));

		float distAtten = 1.0 / (1.0 + dist * 0.028);
		vec3 microPerturb = vec3(
			(w1.x * 0.09 + w2.x * 0.05 + w3.x * 0.025) * distAtten,
			0.0,
			(w1.y * 0.09 + w2.y * 0.05 + w3.y * 0.025) * distAtten
		);
		vec3 N = normalize(vNormal + microPerturb);
		float slopeVar = clamp(length(microPerturb.xz) * 4.0, 0.0, 0.25);

		float NoV = max(dot(N, V), 0.001);
		float fresnel = clamp(0.02 + 0.96 * pow(1.0 - NoV, 5.0), 0.0, 1.0);

		vec3 R = reflect(-V, N);
		R.y = max(R.y, 0.015);
		float skyGrad = clamp(pow(R.y, 0.55), 0.0, 1.0);
		vec3 skyReflect = mix(uSkyHorizon, uSkyZenith, skyGrad);
		float sunReflectAlign = max(dot(R, uSunDir), 0.0);
		skyReflect += uSunColor * pow(sunReflectAlign, 24.0) * 0.38 * uSunSpecScale;

		float heightFactor = smoothstep(-0.55, 0.65, vElevation);
		vec3 baseWater = mix(uWaterDeep, uWaterShallow, heightFactor * 0.68);
		float crestScatter = smoothstep(0.02, 0.58, vElevation) * pow(clamp(1.0 - NoV, 0.0, 1.0), 2.2);
		float sunBacklight = max(dot(V, -vec3(uSunDir.x, -uSunDir.y * 0.25, uSunDir.z)), 0.0);
		vec3 sss = uWaterScatter * (crestScatter * 0.72 + sunBacklight * crestScatter * 0.95);

		// Jarak ke pulau dikira pada bucu bagi mengurangkan beban per-piksel
		float minIslandDist = vIslandDist;

		// Cincin Koral & Tunjang Optik Bawah Laut pada R = 38m dan jejari ke pusat
		float ringDist = abs(length(vWorldPos.xz) - 38.0);
		float shallowLagoon = max(1.0 - smoothstep(6.0, 14.0, minIslandDist), (1.0 - smoothstep(1.5, 5.5, ringDist)) * 0.58);
		baseWater = mix(baseWater, uWaterScatter * 0.78, shallowLagoon * 0.52);

		float cablePulse = 0.72 + 0.28 * sin(length(vWorldPos.xz) * 0.5 - uTime * 3.8);
		float ringGlow = exp(-ringDist * 0.68) * cablePulse;
		vec3 subseaCableColor = vec3(0.12, 0.86, 1.0) * ringGlow * 0.85;

		vec3 waterBody = baseWater + sss + subseaCableColor;
		vec3 color = mix(waterBody, skyReflect, fresnel * 0.76);

		// Sun specular & kilauan optik pantas
		vec3 H = normalize(uSunDir + V);
		float NoH = max(dot(N, H), 0.0);
		float specPower = mix(190.0, 32.0, clamp(slopeVar * 6.0, 0.0, 1.0));
		float specBroad = pow(NoH, specPower) * 0.65 * uSunSpecScale;
		float glintCell = smoothstep(0.72, 0.98, sin(dot(vWorldPos.xz, vec2(5.5, 4.8)) + uTime * 1.8) * 0.5 + 0.5);
		float specSparkle = (pow(NoH, 128.0) * 2.2 + pow(NoH, 48.0) * glintCell * 1.2) * uSunSpecScale;
		color += uSunColor * (specBroad + specSparkle);

		// Whitecaps & Shore Foam di sekeliling 6 Pulau & Teras Pusat
		float foamLace = (sin(vWorldPos.x * 1.55 + uTime * 0.16) * cos(vWorldPos.z * 1.55 - uTime * 0.12)) * 0.5 + 0.5;
		float whitecap = smoothstep(0.78, 0.44, vJacobian - foamLace * 0.24) * smoothstep(0.08, 0.48, vElevation);
		float wakeWave = sin(minIslandDist * 3.1 - uTime * 2.4) * 0.5 + 0.5;
		float shoreFoam = (1.0 - smoothstep(11.6, 14.6, minIslandDist)) * smoothstep(0.35, 0.78, wakeWave * foamLace * 1.45);
		float totalFoam = clamp(whitecap * 0.55 + shoreFoam * 0.82, 0.0, 1.0);

		vec3 foamColor = mix(vec3(0.88, 0.95, 1.0), uSunColor, 0.18);
		vec3 bioLuminescentEdge = vec3(0.08, 0.85, 0.98) * smoothstep(0.38, 0.78, whitecap) * (0.8 + 0.2 * uNightFactor);
		color = mix(color, foamColor + bioLuminescentEdge, totalFoam);

		// ponytail: kabus permukaan sahaja; raymarch hanya jika perlu bayang volumetrik.
		float fogDrift = 1.0 + 0.06 * sin(dot(vWorldPos.xz, vec2(0.012, 0.009)) + uTime * 0.08);
		float fogDepth = max(dist - 48.0, 0.0) * 0.018 * fogDrift;
		float fogFactor = 1.0 - exp2(-fogDepth * fogDepth * 1.442695);
		color = mix(color, uFogColor, fogFactor);

		gl_FragColor = vec4(color, 1.0);
		#include <tonemapping_fragment>
		#include <colorspace_fragment>
	}
`;

const SKY_VERTEX_SHADER = /* glsl */ `
	varying vec3 vWorldDir;
	void main() {
		vec4 wp = modelMatrix * vec4(position, 1.0);
		vWorldDir = wp.xyz - cameraPosition;
		gl_Position = projectionMatrix * viewMatrix * wp;
	}
`;

const SKY_FRAGMENT_SHADER = /* glsl */ `
	uniform float uTime;
	uniform vec3 uSunDir;
	uniform vec3 uSunColor;
	uniform vec3 uSkyZenith;
	uniform vec3 uSkyHorizon;
	uniform float uNightFactor;

	varying vec3 vWorldDir;

	float hash21(vec2 p) {
		p = fract(p * vec2(127.1, 311.7));
		p += dot(p, p + 19.19);
		return fract(p.x * p.y);
	}

	void main() {
		vec3 dir = normalize(vWorldDir);
		float y = clamp(dir.y, 0.0, 1.0);

		vec3 sky = mix(uSkyHorizon, uSkyZenith, pow(y, 0.55));

		float sunCos = max(dot(dir, uSunDir), 0.0);
		float mieGlow = pow(sunCos, 8.0) * 0.26 + pow(sunCos, 64.0) * 0.42;
		float sunDisc = smoothstep(0.9986, 0.9997, sunCos);
		sky += uSunColor * mieGlow;
		sky = mix(sky, uSunColor * 1.25, sunDisc);

		if (uNightFactor > 0.05 && dir.y > 0.06) {
			vec2 starGrid = floor(dir.xz / (dir.y + 0.1) * 195.0);
			float starVal = hash21(starGrid);
			float star = step(0.994, starVal) * smoothstep(0.06, 0.35, dir.y);
			float twinkle = 0.6 + 0.4 * sin(uTime * 3.0 + starVal * 60.0);
			sky += vec3(0.85, 0.93, 1.0) * star * twinkle * uNightFactor;
		}

		float horizonHaze = exp(-abs(dir.y) * 12.5);
		sky = mix(sky, uSkyHorizon, horizonHaze * 0.48);

		gl_FragColor = vec4(sky, 1.0);
		#include <tonemapping_fragment>
		#include <colorspace_fragment>
	}
`;

class WorldTimer {
	private lastTime = 0;
	private startTime = 0;

	constructor() {
		this.startTime = typeof performance !== 'undefined' ? performance.now() : 0;
		this.lastTime = this.startTime;
	}

	public getDelta(): number {
		const now = typeof performance !== 'undefined' ? performance.now() : 0;
		const delta = (now - this.lastTime) / 1000;
		this.lastTime = now;
		return Math.max(0, delta);
	}

	public getElapsedTime(): number {
		const now = typeof performance !== 'undefined' ? performance.now() : 0;
		return Math.max(0, (now - this.startTime) / 1000);
	}
}

export class FiberSpineWorld {
	private container: HTMLElement;
	private callbacks: WorldCallbacks;
	public readonly scene: THREE.Scene;
	public readonly camera: THREE.PerspectiveCamera;
	public renderer: THREE.WebGLRenderer | null = null;
	// ponytail: guna postprocessing rasmi three/examples/jsm (HalfFloat EffectComposer + GTAOPass half-res + UnrealBloomPass + SMAAPass + OutputPass AgX); tukar ke pmndrs/postprocessing + n8ao jika perlu pas gabungan shader tunggal.
	public composer: EffectComposer | null = null;
	private renderPass: RenderPass | null = null;
	private gtaoPass: GTAOPass | null = null;
	private bloomPass: UnrealBloomPass | null = null;
	private smaaPass: SMAAPass | null = null;
	private outputPass: OutputPass | null = null;
	private studioEnvHandle: StudioEnvironmentHandle | null = null;
	private qualityTier: QualityTier = 'ultra';
	private qualityGovernor: QualityGovernorState = createQualityGovernorState('ultra');
	private governorLastTimestamp = 0;
	private fpsFrameCount = 0;
	private fpsLastTimestamp = 0;
	private renderUntil = 0;
	private basePixelRatio = 1;
	private currentPixelRatio = 1;
	private envTexture: THREE.Texture | null = null;
	private pbrMaps: PBRSurfaceMaps | null = null;
	private orbitalLoopCurve: THREE.CatmullRomCurve3;
	private causewayLoopCurve: THREE.CatmullRomCurve3;
	private causewayLoopSamples: THREE.Vector3[] = [];

	public targetProgress = 0;
	public currentProgress = 0;
	private activeStationIndex = 0;
	private selectedToyId: string | null = null;
	private hoveredToyId: string | null = null;
	private hoveredIslandIndex: number | null = null;
	private theme: ThemeMode = 'dark';
	private locale: Locale = 'ms';
	private reducedMotion = false;
	private weatherPresetId = 'golden_horizon';
	private lastLightStationIndex = -1;
	private firstFrameNotified = false;

	private pointerNdc = new THREE.Vector2(0, 0);
	private smoothPointer = new THREE.Vector2(0, 0);
	private isDragging = false;
	private dragStartX = 0;
	private dragStartY = 0;
	private dragMoved = false;
	private userYawOffset = 0;
	private userPitchOffset = 0;
	private targetYawOffset = 0;
	private targetPitchOffset = 0;
	private lastInteractionTime = 0;
	private heldKeys = new Set<string>();

	// Kamera Dive Makro (Sesi 1): lengkung lancar orbit -> pemeriksaan makro.
	private focusToyId: string | null = null;
	private focusSettle = 0;
	private focusFov = 0;
	private focusSpotIntensity = 0;

	// Lensa Kaca Cair X-Ray (Sesi 3): kanta bulat pembiasan Snell's Law + lapisan gentian.
	private xrayActive = false;
	private xrayAmount = 0;
	private xrayReduced = false;
	private xrayLensPass: XRayLensBindings | null = null;
	private xrayFiberScene: THREE.Scene | null = null;
	private xrayFiberCamera: THREE.PerspectiveCamera | null = null;
	private xrayFiberTarget: THREE.WebGLRenderTarget | null = null;
	private xrayFiberMeshes: THREE.Mesh<THREE.TubeGeometry, THREE.MeshStandardMaterial>[] = [];
	private xrayPulseNodes: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>[] = [];
	private xrayPulsePhases: number[] = [];

	private raycaster = new THREE.Raycaster();
	public toys: ToyRecord[] = [];
	private stationHeaders: StationHeaderRecord[] = [];
	private interactableMeshes: THREE.Object3D[] = [];
	public stationGroups: THREE.Group[] = [];
	private rotatingBeacons: THREE.Object3D[] = [];
	private radarRotor: THREE.Group | null = null;
	private centralReactorRings: THREE.Object3D[] = [];
	private glowMaterials: THREE.MeshStandardMaterial[] = [];
	private pulseMat: THREE.MeshBasicMaterial | null = null;
	private active = false;
	private inputEnabled = true;
	private interactionRoots: THREE.Object3D[] = [];
	private disposed = false;
	public screenPalette: ExhibitPalette | null = null;
	private profileImage: HTMLImageElement | null = null;
	private pointerId: number | null = null;
	private pointerDownToyId: string | null = null;
	private pointerPlane = new THREE.Plane();
	private toyReady = true;
	private laserReady = true;
	private laserHits = 0;
	private laserUntil = 0;
	private laserMesh: THREE.Mesh | null = null;
	private laserTargetGlow: THREE.Mesh | null = null;
	private threatNodeMesh: THREE.Group | null = null;
	private laserPulseMat: THREE.MeshBasicMaterial | null = null;
	private laserBeamMat: THREE.MeshBasicMaterial | null = null;
	private laserGlowMat: THREE.MeshBasicMaterial | null = null;
	private springElapsed = 0;
	private cyberPulseLevel = 0;

	private glbLoader = new DioramaGlbLoader();

	private ambientLight!: THREE.AmbientLight;
	private hemiLight!: THREE.HemisphereLight;
	private keyLight!: THREE.DirectionalLight;
	private rimLight!: THREE.PointLight;
	private stationSpotLight!: THREE.PointLight;

	private oceanMesh!: THREE.Mesh;
	private oceanMaterial!: THREE.ShaderMaterial;
	private skyMesh!: THREE.Mesh;
	private skyMaterial!: THREE.ShaderMaterial;

	private coreTubeMat!: THREE.MeshStandardMaterial;
	private pulseInstanced!: THREE.InstancedMesh;
	private pulseOffsets: Float32Array;
	private pulseSpeeds: Float32Array;
	private dummy = new THREE.Object3D();
	private motePoints: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial> | null = null;
	private motionTime = 0;
	private buoyancyTime = 0;
	private isMobile = false;

	private clock = new WorldTimer();
	private rafId: number | null = null;
	private resizeObserver: ResizeObserver | null = null;
	private tempWorldVec = new THREE.Vector3();
	private tempPulsePt = new THREE.Vector3();
	private tempRadialOut = new THREE.Vector3();
	private tempTangentRight = new THREE.Vector3();
	private tempAnchorPt = new THREE.Vector3();
	private tempCamPos = new THREE.Vector3();
	private tempLookTarget = new THREE.Vector3();
	private tempFocusTarget = new THREE.Vector3();
	private tempFocusAnchor = new THREE.Vector3();
	private tempLayerAnchor = new THREE.Vector3();
	private tempMacroCam = new THREE.Vector3();
	private tempOrbitCam = new THREE.Vector3();
	private tempArcRadial = new THREE.Vector3();
	private tempArcTangent = new THREE.Vector3();
	private causewayLoopDives: Float32Array;
	private consecutiveSlowFrames = 0;
	private consecutiveFastFrames = 0;
	private tempPlanePoint = new THREE.Vector3();

	constructor(container: HTMLElement, callbacks: WorldCallbacks = {}) {
		this.container = container;
		this.callbacks = callbacks;
		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(46, 1, 0.15, 380);
		// Gelung tertutup (closed orbital loop) yang menghubungkan ke-6 pulau secara 360°
		this.orbitalLoopCurve = new THREE.CatmullRomCurve3(STATION_ANCHORS, true, 'catmullrom', 0.5);
		// Laluan yang sama pada aras jambatan: tiub cahaya & bebola denyut duduk di atas dek, bukan di dalamnya.
		this.causewayLoopCurve = new THREE.CatmullRomCurve3(
			STATION_ANCHORS.map((anchor) => new THREE.Vector3(anchor.x, 0, anchor.z)),
			true,
			'catmullrom',
			0.5
		);
		this.causewayLoopSamples = this.causewayLoopCurve.getSpacedPoints(360);
		this.causewayLoopDives = new Float32Array(360);
		for (let s = 0; s < 360; s++) {
			const pt = this.causewayLoopSamples[s];
			let nearestIslandSq = Infinity;
			for (let islandIdx = 0; islandIdx < STATION_ANCHORS.length; islandIdx++) {
				const anchor = STATION_ANCHORS[islandIdx];
				const dx = pt.x - anchor.x;
				const dz = pt.z - anchor.z;
				const d2 = dx * dx + dz * dz;
				if (d2 < nearestIslandSq) nearestIslandSq = d2;
			}
			const nearestIsland = Math.sqrt(nearestIslandSq);
			this.causewayLoopDives[s] = Math.min(
				1,
				Math.max(0, (PULSE_DIVE_RADIUS - nearestIsland) / PULSE_DIVE_FADE)
			);
		}

		this.pulseOffsets = new Float32Array(PULSE_COUNT);
		this.pulseSpeeds = new Float32Array(PULSE_COUNT);
		for (let i = 0; i < PULSE_COUNT; i++) {
			this.pulseOffsets[i] = i / PULSE_COUNT;
			this.pulseSpeeds[i] = 0.018 + (i % 5) * 0.004;
		}
	}

	public init(): boolean {
		try {
			this.renderer = new THREE.WebGLRenderer({
				antialias: true,
				powerPreference: 'high-performance',
				alpha: false
			});
			this.isMobile =
				typeof window !== 'undefined' &&
				(window.innerWidth <= 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || ''));
			const dpr = this.isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5);
			this.basePixelRatio = dpr;
			this.currentPixelRatio = dpr;
			this.renderer.setPixelRatio(dpr);
			// Biasan separuh resolusi; teks OLED kekal pada resolusi penuh.
			this.renderer.transmissionResolutionScale = 0.5;
			const cores = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency ?? 4) : 4;
			const isWebGL2 = Boolean(this.renderer.capabilities?.isWebGL2);
			const initialTier: QualityTier =
				!isWebGL2 || (this.isMobile && cores <= 4) ? 'lite' : this.isMobile ? 'balanced' : 'ultra';
			this.qualityTier = initialTier;
			this.qualityGovernor = createQualityGovernorState(initialTier);
			this.renderer.toneMapping =
				initialTier === 'lite' ? THREE.ACESFilmicToneMapping : THREE.AgXToneMapping;
			this.renderer.toneMappingExposure = 1.02;
			this.renderer.outputColorSpace = THREE.SRGBColorSpace;
			if (this.renderer.shadowMap) {
				this.renderer.shadowMap.enabled = !this.isMobile;
				if (this.renderer.shadowMap.enabled) {
					this.renderer.shadowMap.type = THREE.PCFShadowMap;
					this.renderer.shadowMap.autoUpdate = false;
					this.renderer.shadowMap.needsUpdate = true;
				}
			}

			const width = Math.max(this.container.clientWidth, 1);
			const height = Math.max(this.container.clientHeight, 1);
			this.renderer.setSize(width, height);
			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();

			this.renderer.domElement.style.touchAction = 'none';
			this.container.appendChild(this.renderer.domElement);

			try {
				this.studioEnvHandle = createStudioEnvironment(this.renderer, { blur: 0.038 });
				this.envTexture = this.studioEnvHandle.texture;
			} catch {
				const pmrem = new THREE.PMREMGenerator(this.renderer);
				pmrem.compileEquirectangularShader();
				const roomEnv = new RoomEnvironment();
				this.envTexture = pmrem.fromScene(roomEnv, 0.035).texture;
				roomEnv.dispose();
				pmrem.dispose();
			}
			this.scene.environment = this.envTexture;
			this.scene.environmentIntensity = 1.15;
		} catch {
			return false;
		}

		this.callbacks.onProgress?.(
			20,
			this.locale === 'ms'
				? 'Memulakan Enjin Grafiks 3D WebGL...'
				: 'Initializing 3D WebGL Engine...'
		);
		this.readScreenPalette();
		this.callbacks.onProgress?.(
			38,
			this.locale === 'ms'
				? 'Menjana Peta Permukaan PBR & Dinamik Marin...'
				: 'Compiling PBR Surfaces & Ocean Dynamics...'
		);
		this.pbrMaps = this.generatePBRSurfaceMaps();

		this.setupLights();
		this.buildSkyAndOcean();
		this.callbacks.onProgress?.(
			60,
			this.locale === 'ms'
				? 'Mengaktifkan Teras Reaktor & Alur Gentian Optik...'
				: 'Powering Sovereign Reactor & Optical Tethers...'
		);
		this.buildCentralSovereignReactor();
		this.buildOrbitalRingCauseway();
		this.callbacks.onProgress?.(
			80,
			this.locale === 'ms'
				? 'Membina 6 Pulau Balai Cerap & Pangkalan Sistem...'
				: 'Assembling 6 Archipelago Stations & Systems...'
		);
		this.buildArchipelagoStations();
		this.buildXRayFiberLayer();
		this.setupPostProcessing(
			Math.max(this.container.clientWidth, 1),
			Math.max(this.container.clientHeight, 1)
		);
		this.applyWeatherAndTheme();
		try {
			this.renderer?.compile(this.scene, this.camera);
		} catch {
			// Abaikan jika persekitaran headless tidak menyokong prapengkompilan penuh.
		}
		this.attachEvents();
		this.updateCamera(0, 0);
		this.emitToyStatus();
		if (typeof window !== 'undefined') {
			window.__SPINE_WORLD__ = this;
			window.__screenWorld = this;
		}

		return true;
	}

	private readScreenPalette(): void {
		const style = getComputedStyle(document.documentElement);
		const token = (name: string) => style.getPropertyValue(name).trim();
		// Token --screen-* mengekalkan skrin boleh dibaca tanpa mencerahkan palet global.
		this.screenPalette = {
			background: token('--screen-bg') || token('--bg'),
			surface: token('--screen-surface') || token('--surface'),
			text: token('--screen-text') || token('--ink'),
			muted: token('--screen-muted') || token('--ink-secondary'),
			accent: token('--screen-accent') || token('--badge-ink'),
			border: token('--screen-border') || token('--surface-border-hover'),
			hover: token('--screen-surface-hover') || token('--surface-hover'),
			onAccent: token('--screen-on-accent') || token('--on-accent'),
			online: token('--screen-online'),
			halo: token('--screen-halo'),
			fontBody: token('--font-body'),
			fontMono: token('--font-mono') || token('--font-body')
		};
	}

	private generatePBRSurfaceMaps(): PBRSurfaceMaps | null {
		if (typeof document === 'undefined') return null;

		const size = 256;
		const heightCanvas = document.createElement('canvas');
		heightCanvas.width = size;
		heightCanvas.height = size;
		const hCtx = heightCanvas.getContext('2d');

		const roughCanvas = document.createElement('canvas');
		roughCanvas.width = size;
		roughCanvas.height = size;
		const rCtx = roughCanvas.getContext('2d');

		const metalCanvas = document.createElement('canvas');
		metalCanvas.width = size;
		metalCanvas.height = size;
		const mCtx = metalCanvas.getContext('2d');

		const normalCanvas = document.createElement('canvas');
		normalCanvas.width = size;
		normalCanvas.height = size;
		const nCtx = normalCanvas.getContext('2d');

		const deckCanvas = document.createElement('canvas');
		deckCanvas.width = size;
		deckCanvas.height = size;
		const dCtx = deckCanvas.getContext('2d');

		if (!hCtx || !rCtx || !mCtx || !nCtx || !dCtx) return null;

		hCtx.fillStyle = '#808080';
		hCtx.fillRect(0, 0, size, size);
		rCtx.fillStyle = '#525252';
		rCtx.fillRect(0, 0, size, size);
		mCtx.fillStyle = '#e2e2e2';
		mCtx.fillRect(0, 0, size, size);

		let seed = 1337;
		const rand = () => {
			seed = (seed * 16807) % 2147483647;
			return (seed - 1) / 2147483646;
		};

		for (let y = 0; y < size; y++) {
			const v = Math.floor(118 + (rand() - 0.5) * 26);
			hCtx.fillStyle = `rgb(${v},${v},${v})`;
			hCtx.fillRect(0, y, size, 1);

			const rv = Math.floor(210 + (rand() - 0.5) * 20);
			rCtx.fillStyle = `rgb(${rv},${rv},${rv})`;
			rCtx.fillRect(0, y, size, 1);
		}

		for (let i = 0; i < 320; i++) {
			const x1 = rand() * size;
			const y1 = rand() * size;
			const len = 8 + rand() * 48;
			const ang = (rand() - 0.5) * Math.PI;
			const x2 = x1 + Math.cos(ang) * len;
			const y2 = y1 + Math.sin(ang) * len;

			hCtx.strokeStyle = rand() > 0.4 ? 'rgba(40,40,40,0.38)' : 'rgba(225,225,225,0.32)';
			hCtx.lineWidth = 0.6 + rand() * 0.9;
			hCtx.beginPath();
			hCtx.moveTo(x1, y1);
			hCtx.lineTo(x2, y2);
			hCtx.stroke();

			rCtx.strokeStyle = 'rgba(175,175,175,0.45)';
			rCtx.lineWidth = 0.8;
			rCtx.beginPath();
			rCtx.moveTo(x1, y1);
			rCtx.lineTo(x2, y2);
			rCtx.stroke();
		}

		for (let i = 0; i < 650; i++) {
			const x = rand() * size;
			const y = rand() * size;
			const r = 0.5 + rand() * 1.4;
			rCtx.fillStyle = rand() > 0.5 ? 'rgba(140,140,140,0.35)' : 'rgba(30,30,30,0.35)';
			rCtx.beginPath();
			rCtx.arc(x, y, r, 0, Math.PI * 2);
			rCtx.fill();
		}

		const srcData = hCtx.getImageData(0, 0, size, size).data;
		const dstImg = nCtx.createImageData(size, size);
		const dst = dstImg.data;
		const hAt = (x: number, y: number) => {
			const wx = (x + size) % size;
			const wy = (y + size) % size;
			return srcData[(wy * size + wx) * 4] / 255;
		};

		for (let y = 0; y < size; y++) {
			for (let x = 0; x < size; x++) {
				const tl = hAt(x - 1, y - 1);
				const t = hAt(x, y - 1);
				const tr = hAt(x + 1, y - 1);
				const l = hAt(x - 1, y);
				const r = hAt(x + 1, y);
				const bl = hAt(x - 1, y + 1);
				const b = hAt(x, y + 1);
				const br = hAt(x + 1, y + 1);

				const dX = tr + 2 * r + br - (tl + 2 * l + bl);
				const dY = bl + 2 * b + br - (tl + 2 * t + tr);
				const dZ = 1.0 / 1.85;

				const invLen = 1.0 / Math.sqrt(dX * dX + dY * dY + dZ * dZ);
				const nx = dX * invLen;
				const ny = dY * invLen;
				const nz = dZ * invLen;

				const idx = (y * size + x) * 4;
				dst[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
				dst[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
				dst[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
				dst[idx + 3] = 255;
			}
		}
		nCtx.putImageData(dstImg, 0, 0);

		dCtx.fillStyle = 'rgb(128,128,255)';
		dCtx.fillRect(0, 0, size, size);
		dCtx.strokeStyle = 'rgb(92,92,240)';
		dCtx.lineWidth = 3;
		const step = 32;
		for (let i = 0; i <= size; i += step) {
			dCtx.beginPath();
			dCtx.moveTo(i, 0);
			dCtx.lineTo(i, size);
			dCtx.stroke();
			dCtx.beginPath();
			dCtx.moveTo(0, i);
			dCtx.lineTo(size, i);
			dCtx.stroke();
		}

		const makeRepeating = (canvas: HTMLCanvasElement, repeatX: number, repeatY: number) => {
			const tex = new THREE.CanvasTexture(canvas);
			tex.wrapS = THREE.RepeatWrapping;
			tex.wrapT = THREE.RepeatWrapping;
			tex.repeat.set(repeatX, repeatY);
			tex.needsUpdate = true;
			return tex;
		};

		return {
			normalMap: makeRepeating(normalCanvas, 2, 2),
			roughnessMap: makeRepeating(roughCanvas, 2, 2),
			metalnessMap: makeRepeating(metalCanvas, 2, 2),
			deckNormalMap: makeRepeating(deckCanvas, 4, 24)
		};
	}

	private createBrushedMetalMaterial(
		colorHex: number,
		accentHex?: number,
		roughness = 0.26
	): THREE.MeshPhysicalMaterial {
		// Satin, bukan cermin: roughnessMap kini ~0.82, jadi roughness efektif ≈ 0.5–0.7.
		// Ini membuang highlight putih besar yang memakan teks dan menyilaukan pada waktu malam.
		return new THREE.MeshPhysicalMaterial({
			color: colorHex,
			metalness: 0.68,
			roughness: Math.min(0.92, roughness + 0.4),
			normalMap: this.pbrMaps?.normalMap ?? null,
			normalScale: new THREE.Vector2(0.24, 0.24),
			roughnessMap: this.pbrMaps?.roughnessMap ?? null,
			metalnessMap: this.pbrMaps?.metalnessMap ?? null,
			clearcoat: 0.18,
			clearcoatRoughness: 0.22,
			emissive: accentHex ?? 0x000000,
			emissiveIntensity: accentHex ? 0.04 : 0.0,
			envMapIntensity: 0.92
		});
	}

	private createOpticalGlassMaterial(tintHex = 0x38bdf8): THREE.MeshPhysicalMaterial {
		return new THREE.MeshPhysicalMaterial({
			color: tintHex,
			metalness: 0.08,
			roughness: 0.14,
			ior: 1.52,
			envMapIntensity: 1.05,
			clearcoat: 0.35,
			clearcoatRoughness: 0.1,
			transparent: true,
			opacity: 0.38,
			depthWrite: false
		});
	}

	/** Bahan bercahaya didaftar supaya keamatan boleh dikawal mengikut tema siang/malam. */
	private createGlowMaterial(
		colorHex: number,
		emissiveHex: number,
		baseIntensity: number
	): THREE.MeshStandardMaterial {
		const mat = new THREE.MeshStandardMaterial({
			color: colorHex,
			emissive: emissiveHex,
			emissiveIntensity: baseIntensity,
			metalness: 0.1,
			roughness: 0.55
		});
		mat.userData.baseEmissive = baseIntensity;
		this.glowMaterials.push(mat);
		return mat;
	}

	private setupLights(): void {
		this.ambientLight = new THREE.AmbientLight(0xdbeafe, 0.5);
		this.scene.add(this.ambientLight);

		this.hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x0f172a, 0.85);
		this.hemiLight.position.set(0, 42, 0);
		this.scene.add(this.hemiLight);

		this.keyLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
		this.keyLight.position.set(18, 28, 16);
		this.keyLight.castShadow = true;
		this.keyLight.shadow.mapSize.width = 1024;
		this.keyLight.shadow.mapSize.height = 1024;
		this.keyLight.shadow.camera.near = 2;
		this.keyLight.shadow.camera.far = 110;
		const d = 22;
		this.keyLight.shadow.camera.left = -d;
		this.keyLight.shadow.camera.right = d;
		this.keyLight.shadow.camera.top = d;
		this.keyLight.shadow.camera.bottom = -d;
		this.keyLight.shadow.bias = -0.0005;
		this.keyLight.shadow.radius = 2.5;
		this.scene.add(this.keyLight);
		this.scene.add(this.keyLight.target);

		this.rimLight = new THREE.PointLight(0x38bdf8, 3.6, 52);
		this.rimLight.position.set(-7, 6, 0);
		this.scene.add(this.rimLight);

		this.stationSpotLight = new THREE.PointLight(0x2dd4bf, 3.8, 36);
		this.stationSpotLight.position.set(0, 7, 0);
		this.scene.add(this.stationSpotLight);
	}

	private buildSkyAndOcean(): void {
		const sunDir = new THREE.Vector3(0.32, 0.16, -0.93).normalize();

		this.skyMaterial = new THREE.ShaderMaterial({
			vertexShader: SKY_VERTEX_SHADER,
			fragmentShader: SKY_FRAGMENT_SHADER,
			side: THREE.BackSide,
			depthWrite: false,
			uniforms: {
				uTime: { value: 0 },
				uSunDir: { value: sunDir.clone() },
				uSunColor: { value: new THREE.Color(0xfbbf24) },
				uSkyZenith: { value: new THREE.Color(0x0c1938) },
				uSkyHorizon: { value: new THREE.Color(0x1e3a5f) },
				uNightFactor: { value: 0.15 }
			}
		});

		const skyGeo = new THREE.SphereGeometry(280, 48, 32);
		this.skyMesh = new THREE.Mesh(skyGeo, this.skyMaterial);
		this.scene.add(this.skyMesh);

		this.oceanMaterial = new THREE.ShaderMaterial({
			vertexShader: OCEAN_VERTEX_SHADER,
			fragmentShader: OCEAN_FRAGMENT_SHADER,
			uniforms: {
				uTime: { value: 0 },
				uWaveScale: { value: 1.0 },
				uChoppiness: { value: 1.15 },
				uSunDir: { value: sunDir.clone() },
				uSunColor: { value: new THREE.Color(0xfbbf24) },
				uSkyZenith: { value: new THREE.Color(0x0c1938) },
				uSkyHorizon: { value: new THREE.Color(0x1e3a5f) },
				uWaterDeep: { value: new THREE.Color(0x041f38) },
				uWaterShallow: { value: new THREE.Color(0x084c61) },
				uWaterScatter: { value: new THREE.Color(0x14b8a6) },
				uFogColor: { value: new THREE.Color(0x172e4d) },
				uNightFactor: { value: 0.15 },
				uSunSpecScale: { value: 1.0 },
				uIslands: { value: STATION_ANCHORS.map((v) => v.clone()) }
			}
		});

		const oceanGeo = new THREE.PlaneGeometry(320, 320, 48, 48);
		oceanGeo.rotateX(-Math.PI / 2);
		this.oceanMesh = new THREE.Mesh(oceanGeo, this.oceanMaterial);
		this.oceanMesh.position.set(0, -0.28, 0);
		this.scene.add(this.oceanMesh);
	}

	/**
	 * MENARA REAKTOR TRI-TUNJANG PUSAT ("THE SOVEREIGN TRI-CORE REACTOR" di (0,0,0))
	 * Mercu tanda ikonik di tengah lautan yang menghubungkan kesemua 6 Pulau Balai Cerap melalui alur tenaga optik.
	 */
	private buildCentralSovereignReactor(): void {
		const reactorGroup = new THREE.Group();
		reactorGroup.position.set(0, 0, 0);

		const darkTitanMat = this.createBrushedMetalMaterial(0x0f172a, 0x0284c7, 0.22);
		const chromeMat = this.createBrushedMetalMaterial(0xcbd5e1, undefined, 0.14);
		const cyanGlowMat = this.createGlowMaterial(0x38bdf8, 0x0284c7, 0.45);
		const tealGlowMat = this.createGlowMaterial(0x2dd4bf, 0x0d9488, 0.45);
		const glassMat = this.createOpticalGlassMaterial(0x38bdf8);

		// Pelantar Asas Reaktor Pusat
		const baseCylinder = new THREE.Mesh(
			new THREE.CylinderGeometry(6.8, 8.2, 1.2, 32),
			darkTitanMat
		);
		baseCylinder.position.y = 0.2;
		baseCylinder.receiveShadow = true;
		reactorGroup.add(baseCylinder);

		// 3 Tiang Lengkung Menara Reaktor (Tri-Pillar Spire: Network, Enterprise, AI)
		for (let i = 0; i < 3; i++) {
			const ang = (i / 3) * Math.PI * 2;
			const spire = new THREE.Mesh(
				createBeveledSlabGeometry(0.85, 16.5, 1.4, 0.12, 0.04),
				darkTitanMat
			);
			spire.position.set(Math.sin(ang) * 3.8, 8.2, Math.cos(ang) * 3.8);
			spire.rotation.y = ang;
			spire.castShadow = true;
			reactorGroup.add(spire);
		}

		// Teras Kristal Tenaga Terapung di Puncak Menara
		const coreOcta = new THREE.Mesh(new THREE.OctahedronGeometry(2.4, 2), glassMat);
		coreOcta.position.y = 10.5;
		reactorGroup.add(coreOcta);
		this.centralReactorRings.push(coreOcta);

		const innerSun = new THREE.Mesh(new THREE.SphereGeometry(1.15, 32, 32), cyanGlowMat);
		innerSun.position.y = 10.5;
		reactorGroup.add(innerSun);

		// 3 Cincin Giroskopik Gergasi Berputar Mengelilingi Teras
		for (let r = 0; r < 3; r++) {
			const ring = new THREE.Mesh(
				new THREE.TorusGeometry(4.6 + r * 1.15, 0.12, 20, 96),
				r % 2 === 0 ? cyanGlowMat : chromeMat
			);
			ring.position.y = 10.5;
			ring.rotation.set(r * 0.7, r * 1.1, r * 0.4);
			reactorGroup.add(ring);
			this.centralReactorRings.push(ring);
		}

		// 6 Alur Jambatan Optik Bercahaya (Radial Optical Tethers) dari Teras Pusat ke Setiap Pulau CV
		// Hujung bermula pada kolar hub reaktor dan berakhir pada soket fizikal di rasuk gerbang pulau,
		// jadi kabel kelihatan tersambung (dahulu hujungnya tergantung di udara kosong).
		const socketMat = this.createBrushedMetalMaterial(0x1e293b, 0x38bdf8, 0.22);
		STATION_ANGLES.forEach((angle, idx) => {
			const dirX = Math.sin(angle);
			const dirZ = Math.cos(angle);

			const startPt = new THREE.Vector3(
				dirX * TETHER_HUB_RADIUS,
				TETHER_HUB_Y - 0.6,
				dirZ * TETHER_HUB_RADIUS
			);
			const endPt = new THREE.Vector3(
				dirX * TETHER_SOCKET_RADIUS,
				TETHER_SOCKET_Y,
				dirZ * TETHER_SOCKET_RADIUS
			);

			// Kawalan lengkung sedikit di bawah garis lurus supaya kabel melendut natural
			// tanpa memotong rasuk gerbang.
			const midPoint = startPt.clone().lerp(endPt, 0.55);
			midPoint.y -= 0.75 + (idx % 2) * 0.25;

			const tetherCurve = new THREE.QuadraticBezierCurve3(startPt, midPoint, endPt);
			const tetherGeo = new THREE.TubeGeometry(tetherCurve, 48, 0.055, 12, false);
			const tetherMesh = new THREE.Mesh(tetherGeo, idx % 2 === 0 ? cyanGlowMat : tealGlowMat);
			reactorGroup.add(tetherMesh);

			// Kolar hub: mengunci pangkal kabel pada cincin reaktor.
			const hubSocket = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.34, 16), socketMat);
			hubSocket.position.copy(startPt);
			hubSocket.quaternion.setFromUnitVectors(
				new THREE.Vector3(0, 1, 0),
				new THREE.Vector3(dirX, 0, dirZ).normalize()
			);
			reactorGroup.add(hubSocket);

			// Soket penerima pada rasuk gerbang pulau; kabel benar-benar masuk ke dalamnya.
			const stationSocket = new THREE.Mesh(
				new THREE.CylinderGeometry(0.18, 0.24, 0.42, 16),
				socketMat
			);
			stationSocket.position.copy(endPt);
			reactorGroup.add(stationSocket);

			const socketRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.028, 10, 20), cyanGlowMat);
			socketRing.position.copy(endPt);
			socketRing.position.y += 0.22;
			socketRing.rotation.x = Math.PI / 2;
			reactorGroup.add(socketRing);
		});

		this.scene.add(reactorGroup);
	}

	/**
	 * JAMBATAN CINCIN ORBITAL 360° ("THE ORBITAL RING CAUSEWAY")
	 * Menghubungkan ke-6 Pulau Balai Cerap dalam bulatan panoramik di atas lautan Open-Water.
	 */
	private buildOrbitalRingCauseway(): void {
		const deckMat = new THREE.MeshPhysicalMaterial({
			color: 0x0f172a,
			metalness: 0.78,
			roughness: 0.28,
			clearcoat: 0.4,
			clearcoatRoughness: 0.22,
			normalMap: this.pbrMaps?.deckNormalMap ?? null,
			normalScale: new THREE.Vector2(0.32, 0.32),
			roughnessMap: this.pbrMaps?.roughnessMap ?? null,
			envMapIntensity: 1.25
		});

		const railGlowMat = this.createGlowMaterial(0x38bdf8, 0x0284c7, 0.42);

		// Lantai Jambatan Cincin Orbital 360° (menggunakan Torus mendatar bersegmen tinggi)
		const causewayRingGeo = new THREE.RingGeometry(
			ORBIT_RADIUS - 1.65,
			ORBIT_RADIUS + 1.65,
			180,
			2
		);
		causewayRingGeo.rotateX(-Math.PI / 2);
		const causewayRing = new THREE.Mesh(causewayRingGeo, deckMat);
		causewayRing.position.y = CAUSEWAY_DECK_Y;
		causewayRing.receiveShadow = true;
		this.scene.add(causewayRing);

		// Rel Cahaya Dalam & Luar Cincin Orbital
		const innerRailGeo = new THREE.TorusGeometry(ORBIT_RADIUS - 1.68, 0.055, 12, 180);
		innerRailGeo.rotateX(Math.PI / 2);
		const innerRail = new THREE.Mesh(innerRailGeo, railGlowMat);
		innerRail.position.y = CAUSEWAY_RAIL_Y;
		this.scene.add(innerRail);

		const outerRailGeo = new THREE.TorusGeometry(ORBIT_RADIUS + 1.68, 0.055, 12, 180);
		outerRailGeo.rotateX(Math.PI / 2);
		const outerRail = new THREE.Mesh(outerRailGeo, railGlowMat);
		outerRail.position.y = CAUSEWAY_RAIL_Y;
		this.scene.add(outerRail);

		// Tunjang Gentian Optik Bercahaya di Tengah Laluan Orbital
		const coreGeo = new THREE.TubeGeometry(this.causewayLoopCurve, 240, 0.06, 16, true);
		this.coreTubeMat = this.createGlowMaterial(0x38bdf8, 0x0284c7, 0.45);
		const coreMesh = new THREE.Mesh(coreGeo, this.coreTubeMat);
		coreMesh.position.y = CAUSEWAY_CORE_Y;
		this.scene.add(coreMesh);

		// Denyutan Paket Data Optik Beredar 360° Sepanjang Kepulauan
		const pulseGeo = new THREE.SphereGeometry(0.085, 16, 16);
		this.pulseMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
		this.pulseInstanced = new THREE.InstancedMesh(pulseGeo, this.pulseMat, PULSE_COUNT);
		this.scene.add(this.pulseInstanced);

		this.buildAtmosphericMotes();
	}

	/** Satu kelompok Points untuk enam pulau dan reaktor; tiada muat naik matriks setiap frame. */
	private buildAtmosphericMotes(): void {
		const positions = new Float32Array(MOTE_COUNT * 3);
		const phases = new Float32Array(MOTE_COUNT);
		const sizes = new Float32Array(MOTE_COUNT);
		for (let i = 0; i < MOTE_COUNT; i++) {
			const anchor = STATION_ANCHORS[i % (STATION_ANCHORS.length + 1)];
			const angle = i * 2.3999632297;
			const radius = 2 + Math.sqrt(((i * 17) % MOTE_COUNT) / MOTE_COUNT) * 10;
			positions[i * 3] = (anchor?.x ?? 0) + Math.sin(angle) * radius;
			positions[i * 3 + 1] = ISLAND_DECK_HEIGHT + 0.8 + ((i * 13) % 37) * (anchor ? 0.22 : 0.4);
			positions[i * 3 + 2] = (anchor?.z ?? 0) + Math.cos(angle) * radius;
			phases[i] = angle % (Math.PI * 2);
			sizes[i] = 0.035 + (i % 5) * 0.008;
		}
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
		geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
		geometry.computeBoundingSphere();
		// Margin meliputi anjakan shader; frustum culling kekal selamat.
		if (geometry.boundingSphere) geometry.boundingSphere.radius += 2;
		const material = new THREE.ShaderMaterial({
			vertexShader: MOTE_VERTEX_SHADER,
			fragmentShader: MOTE_FRAGMENT_SHADER,
			uniforms: {
				uTime: { value: 0 },
				uViewportHeight: {
					value: this.container.clientHeight * (this.renderer?.getPixelRatio() ?? 1)
				},
				uColor: { value: new THREE.Color(0x7dd3fc) },
				uOpacity: { value: 0.48 }
			},
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite: false
		});
		this.motePoints = new THREE.Points(geometry, material);
		this.motePoints.name = 'atmospheric-data-embers';
		this.scene.add(this.motePoints);
	}

	/** Alunan apungan marin halus: heave + pitch + roll berkunci semasa periksa (hydraulic lock). */
	private applyStationBuoyancy(elapsed: number): void {
		// Bekukan pose semasa (bukan snap ke sifar) supaya kamera kekal stabil.
		if (this.reducedMotion || this.selectedToyId) return;
		for (let i = 0; i < this.stationGroups.length; i++) {
			const group = this.stationGroups[i];
			const anchor = STATION_ANCHORS[i];
			if (!anchor) continue;
			group.position.y = anchor.y + Math.sin(elapsed * 0.9 + i) * 0.08;
			group.rotation.x = Math.sin(elapsed * 0.9 + i) * 0.005;
			group.rotation.z = Math.cos(elapsed * 0.9 + i) * 0.005;
		}
	}

	/**
	 * Membina Pelantar Pulau Balai Cerap & Megastruktur Pusat yang unik bagi setiap Stesen CV
	 */
	private createStationPlazaAndMonument(
		group: THREE.Group,
		stationIndex: number,
		accentHex: number
	): void {
		const basaltMat = this.createBrushedMetalMaterial(0x0b1324, undefined, 0.34);
		const titaniumMat = this.createBrushedMetalMaterial(0x1e293b, accentHex, 0.22);
		const chromeMat = this.createBrushedMetalMaterial(0xe2e8f0, undefined, 0.14);
		const glassMat = this.createOpticalGlassMaterial(accentHex);
		const glowMat = this.createGlowMaterial(accentHex, accentHex, 0.45);

		// Pelantar Pulau Bulat Bertingkat (Atoll Sanctuary)
		const lowerAtoll = new THREE.Mesh(new THREE.CylinderGeometry(9.6, 10.8, 0.65, 36), basaltMat);
		lowerAtoll.position.y = -0.08;
		lowerAtoll.receiveShadow = true;
		lowerAtoll.userData.islandIndex = stationIndex;
		group.add(lowerAtoll);
		this.interactionRoots.push(lowerAtoll);

		const upperAtoll = new THREE.Mesh(new THREE.CylinderGeometry(8.4, 9.0, 0.28, 36), titaniumMat);
		upperAtoll.position.y = 0.28;
		upperAtoll.receiveShadow = true;
		upperAtoll.userData.islandIndex = stationIndex;
		group.add(upperAtoll);
		this.interactionRoots.push(upperAtoll);

		const outerRing = new THREE.Mesh(new THREE.TorusGeometry(8.2, 0.05, 16, 96), glowMat);
		outerRing.rotation.x = Math.PI / 2;
		outerRing.position.y = 0.43;
		group.add(outerRing);

		// --- KEJURUTERAAN MARIN: tapak sauh laut dalam, benteng ombak & tiang pylon ---
		// Caisson balast separa tenggelam menyokong pontun terapung dan dinding aloi.
		const caissonMat = this.createBrushedMetalMaterial(0x070d18, accentHex, 0.46);
		const caisson = new THREE.Mesh(new THREE.CylinderGeometry(9.9, 10.9, 4.2, 40, 1), caissonMat);
		caisson.position.y = -2.05;
		caisson.receiveShadow = true;
		group.add(caisson);

		// Cincin kolar keluli di pertemuan dek dengan caisson.
		const collar = new THREE.Mesh(
			new THREE.CylinderGeometry(10.35, 10.35, 0.34, 40, 1, true),
			chromeMat
		);
		collar.position.y = -0.3;
		group.add(collar);

		// Benteng pemecah ombak (breakwater seawall): dinding condong yang memecah gelombang sebelum dek.
		const seawallMat = this.createBrushedMetalMaterial(0x111c2e, undefined, 0.62);
		const seawall = new THREE.Mesh(
			new THREE.CylinderGeometry(11.9, 13.1, 1.5, 48, 1, true),
			seawallMat
		);
		seawall.position.y = LOCAL_DECK_HEIGHT - 0.75;
		seawall.receiveShadow = true;
		group.add(seawall);

		const seawallLip = new THREE.Mesh(new THREE.TorusGeometry(11.92, 0.11, 10, 64), glowMat);
		seawallLip.rotation.x = Math.PI / 2;
		seawallLip.position.y = LOCAL_DECK_HEIGHT;
		group.add(seawallLip);

		// 6 tiang tambat (mooring bollards) di bibir benteng: butiran platform luar pesisir.
		// Ketinggian sengaja rendah supaya tidak menghalang garis pandang kamera orbit.
		for (let p = 0; p < 6; p++) {
			const ang = (p / 6) * Math.PI * 2;
			const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.26, 1.05, 12), caissonMat);
			bollard.position.set(Math.sin(ang) * 12.05, 0.32, Math.cos(ang) * 12.05);
			group.add(bollard);

			const cap = new THREE.Mesh(new THREE.SphereGeometry(0.21, 12, 10), glowMat);
			cap.position.set(Math.sin(ang) * 12.05, 0.9, Math.cos(ang) * 12.05);
			group.add(cap);
		}

		// Monumen Kejuruteraan Pusat Pulau (Aras rendah di belakang supaya tidak memotong papan gerbang!)
		const monumentGroup = new THREE.Group();
		monumentGroup.position.set(0, LOCAL_DECK_HEIGHT, -2.35);

		const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.85, 0.44, 32), titaniumMat);
		plinth.position.y = 0.22;
		plinth.castShadow = true;
		plinth.receiveShadow = true;
		monumentGroup.add(plinth);

		if (stationIndex === 0) {
			// Stesen 01: Kubah Balai Cerap Giroskopik (Sovereign Core)
			const sphere = new THREE.Mesh(new THREE.OctahedronGeometry(0.76, 2), glassMat);
			sphere.position.y = 1.42;
			monumentGroup.add(sphere);
			for (let r = 0; r < 3; r++) {
				const gim = new THREE.Mesh(
					new THREE.TorusGeometry(0.96 + r * 0.18, 0.036, 16, 64),
					r === 1 ? glowMat : chromeMat
				);
				gim.position.y = 1.42;
				gim.rotation.set(r * 0.6, r * 0.9, 0);
				monumentGroup.add(gim);
				this.rotatingBeacons.push(gim);
			}
		} else if (stationIndex === 1) {
			// Stesen 02: Menara Kluster Pelayan Enterprise YHCM & Nova Bitara
			for (let t = 0; t < 3; t++) {
				const ang = (t / 3) * Math.PI * 2;
				const tower = new THREE.Mesh(
					createBeveledSlabGeometry(0.82, 2.05, 0.82, 0.07, 0.03),
					titaniumMat
				);
				tower.position.set(Math.sin(ang) * 0.85, 1.32, Math.cos(ang) * 0.85);
				tower.rotation.y = ang;
				tower.castShadow = true;
				monumentGroup.add(tower);
			}
			const dataHalo = new THREE.Mesh(new THREE.TorusGeometry(1.38, 0.036, 16, 64), glowMat);
			dataHalo.rotation.x = Math.PI / 2;
			dataHalo.position.y = 2.25;
			monumentGroup.add(dataHalo);
			this.rotatingBeacons.push(dataHalo);
		} else if (stationIndex === 2) {
			// Stesen 03: Kubah Radar Pertahanan Siber TNB SOC — Cangkang 3D dwi-permukaan tebal
			// Letakkan tiang radar di belakang papan gerbang supaya tidak memotong tajuk.
			const radarMast = new THREE.Mesh(
				new THREE.CylinderGeometry(0.12, 0.28, 4.9, 20),
				titaniumMat
			);
			radarMast.position.set(0, 2.95, -3.35);
			radarMast.castShadow = true;
			monumentGroup.add(radarMast);

			this.radarRotor = new THREE.Group();
			this.radarRotor.position.set(0, 5.45, -3.35);
			monumentGroup.add(this.radarRotor);

			chromeMat.side = THREE.DoubleSide;
			const radarDish = new THREE.Mesh(createSolidDishGeometry(1.65, 0.85, 0.08, 48), chromeMat);
			radarDish.scale.setScalar(0.32);
			radarDish.rotation.x = Math.PI * 0.18;
			radarDish.castShadow = true;
			this.radarRotor.add(radarDish);

			const hornPylon = new THREE.Mesh(
				new THREE.CylinderGeometry(0.045, 0.08, 0.72, 16),
				titaniumMat
			);
			hornPylon.position.y = 0.36;
			radarDish.add(hornPylon);

			const hornEmitter = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), glowMat);
			hornEmitter.position.y = 0.72;
			radarDish.add(hornEmitter);

			// Nod ancaman siber simulasi di ruang tengah pulau sebagai sasaran pemintasan laser
			const threatGroup = new THREE.Group();
			threatGroup.position.set(0, 1.95, 0.35);
			const threatCoreMat = this.createGlowMaterial(0xf97316, 0xef4444, 0.75);
			const threatCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 0), threatCoreMat);
			threatGroup.add(threatCore);
			const threatRing = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.028, 14, 42), chromeMat);
			threatRing.rotation.x = Math.PI * 0.35;
			threatGroup.add(threatRing);
			this.rotatingBeacons.push(threatCore, threatRing);
			monumentGroup.add(threatGroup);
			this.threatNodeMesh = threatGroup;
		} else if (stationIndex === 3) {
			// Stesen 04: Prisma Lensa Visi Komputer OpenCV & Projek AI
			const lensBarrel = new THREE.Mesh(
				new THREE.CylinderGeometry(0.95, 1.04, 0.72, 36),
				titaniumMat
			);
			lensBarrel.rotation.x = Math.PI / 2;
			lensBarrel.position.y = 1.52;
			monumentGroup.add(lensBarrel);

			const opticGlass = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), glassMat);
			opticGlass.scale.set(1, 1, 0.48);
			opticGlass.position.y = 1.52;
			monumentGroup.add(opticGlass);
		} else if (stationIndex === 4) {
			// Stesen 05: 5 Kristal Kemahiran Teknikal Terapung
			for (let c = 0; c < 5; c++) {
				const ang = (c / 5) * Math.PI * 2;
				const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 0), glassMat);
				crystal.position.set(Math.sin(ang) * 1.2, 1.48 + (c % 2) * 0.26, Math.cos(ang) * 1.2);
				monumentGroup.add(crystal);
				this.rotatingBeacons.push(crystal);
			}
		} else {
			// Stesen 06: Menara Rumah Api Komunikasi UTM & Cisco (di bawah papan gerbang!)
			const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.68, 2.05, 24), titaniumMat);
			spire.position.y = 1.32;
			spire.castShadow = true;
			monumentGroup.add(spire);

			const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 24), glowMat);
			beacon.position.y = 2.52;
			monumentGroup.add(beacon);

			const beaconHalo = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.028, 14, 42), chromeMat);
			beaconHalo.rotation.x = Math.PI * 0.38;
			beaconHalo.position.y = 2.52;
			monumentGroup.add(beaconHalo);
			this.rotatingBeacons.push(beaconHalo);
		}

		group.add(monumentGroup);
	}

	/** Papan arah pulau; butiran penuh dibuka apabila pengguna menekan objek 3D. */
	private drawStationHeaderCanvas(canvas: HTMLCanvasElement, station: SpineStation): void {
		const ctx = canvas.getContext('2d');
		const palette = this.screenPalette;
		if (!ctx || !palette) return;
		const w = canvas.width;
		const h = canvas.height;
		ctx.clearRect(0, 0, w, h);

		// Latar kaca diegetik separa lutsinar + sempadan neon cyan 1px
		ctx.fillStyle = this.theme === 'light' ? 'rgba(241, 245, 249, 0.28)' : 'rgba(6, 18, 34, 0.24)';
		ctx.beginPath();
		ctx.roundRect(4, 4, w - 8, h - 8, 22);
		ctx.fill();
		ctx.lineWidth = 3;
		ctx.strokeStyle = 'rgba(56, 189, 248, 0.78)';
		ctx.stroke();

		ctx.fillStyle = palette.accent;
		ctx.font = `600 30px ${palette.fontMono}`;
		ctx.fillText(station.shortTab[this.locale], 56, 60);
		ctx.fillStyle = palette.text;
		ctx.font = `700 58px ${palette.fontBody}`;
		this.wrapCanvasText(ctx, station.title[this.locale], 56, 134, w - 112, 66, 2);
		ctx.fillStyle = palette.text;
		ctx.font = `600 34px ${palette.fontBody}`;
		ctx.fillText(
			this.locale === 'ms'
				? 'Klik objek 3D untuk butiran · Seret untuk lantunan'
				: 'Click any 3D object for details · Drag to bounce',
			56,
			h - 34
		);
	}

	private wrapCanvasText(
		ctx: CanvasRenderingContext2D,
		text: string,
		x: number,
		startY: number,
		maxWidth: number,
		lineHeight: number,
		maxLines: number
	): number {
		const words = text.split(' ');
		let line = '';
		let y = startY;
		let linesDrawn = 0;

		for (let i = 0; i < words.length; i++) {
			const testLine = line ? `${line} ${words[i]}` : words[i];
			const metrics = ctx.measureText(testLine);
			if (metrics.width > maxWidth && line) {
				linesDrawn++;
				if (linesDrawn >= maxLines) {
					ctx.fillText(`${line.slice(0, -3)}...`, x, y);
					return y;
				}
				ctx.fillText(line, x, y);
				line = words[i];
				y += lineHeight;
			} else {
				line = testLine;
			}
		}
		if (line) {
			ctx.fillText(line, x, y);
		}
		return y;
	}

	private buildTactileProp(
		hotspot: HotspotItem,
		stationIndex: number,
		accentHex: number
	): {
		root: THREE.Group;
		spinAxis: THREE.Object3D;
		kind: string;
		haloMat: THREE.MeshStandardMaterial;
	} {
		// Sesi 2: hantar semua pembinaan siluet unik ke `diorama-props.ts`.
		// Kontrak pembekal bahan menjadikan material PBR dikongsi dan masih
		// didaftar ke `glowMaterials` untuk kawalan kecerahan siang/malam.
		const ctx: DioramaBuildContext = {
			id: hotspot.id,
			code: hotspot.code,
			stationIndex,
			accentHex,
			materials: {
				metal: (color, accent, roughness) =>
					this.createBrushedMetalMaterial(color, accent, roughness),
				glass: (tint) => this.createOpticalGlassMaterial(tint),
				glow: (color, emissive, intensity) => this.createGlowMaterial(color, emissive, intensity)
			}
		};
		return buildDioramaProp(ctx);
	}

	private createStationHeaderArch(group: THREE.Group, station: SpineStation): void {
		const archGroup = new THREE.Group();
		archGroup.position.set(0, 0.35, -5.2);

		const pillarMat = this.createBrushedMetalMaterial(0x1e293b, 0x38bdf8, 0.22);

		const leftPillar = new THREE.Mesh(
			createBeveledSlabGeometry(0.32, 5.2, 0.32, 0.05, 0.02),
			pillarMat
		);
		leftPillar.position.set(-4.6, 2.6, 0);
		leftPillar.castShadow = true;
		archGroup.add(leftPillar);

		const rightPillar = new THREE.Mesh(
			createBeveledSlabGeometry(0.32, 5.2, 0.32, 0.05, 0.02),
			pillarMat
		);
		rightPillar.position.set(4.6, 2.6, 0);
		rightPillar.castShadow = true;
		archGroup.add(rightPillar);

		const topBeam = new THREE.Mesh(
			createBeveledSlabGeometry(9.6, 0.26, 0.36, 0.05, 0.02),
			pillarMat
		);
		topBeam.position.set(0, 5.22, 0);
		topBeam.castShadow = true;
		archGroup.add(topBeam);

		const canvas = document.createElement('canvas');
		canvas.width = 1800;
		canvas.height = 300;
		this.drawStationHeaderCanvas(canvas, station);

		const texture = new THREE.CanvasTexture(canvas);
		texture.colorSpace = THREE.SRGBColorSpace;
		if (this.renderer) {
			texture.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
		}

		const signBacking = new THREE.Mesh(
			createBeveledSlabGeometry(8.12, 1.38, 0.06, 0.03, 0.015),
			this.createOpticalGlassMaterial(0x38bdf8)
		);
		signBacking.position.set(0, 4.38, 0);
		archGroup.add(signBacking);

		const signMat = new THREE.MeshPhysicalMaterial({
			map: texture,
			transparent: true,
			transmission: 0.85,
			roughness: 0.15,
			metalness: 0.05,
			ior: 1.48,
			clearcoat: 0.4,
			clearcoatRoughness: 0.12,
			emissive: new THREE.Color(0x38bdf8),
			emissiveMap: texture,
			emissiveIntensity: 0.35,
			depthWrite: false,
			toneMapped: false
		});
		const signFace = new THREE.Mesh(new THREE.PlaneGeometry(8.0, 1.33), signMat);
		signFace.position.set(0, 4.38, 0.05);
		archGroup.add(signFace);

		this.stationHeaders.push({
			station,
			canvas,
			texture,
			screenMesh: signFace,
			screenWidth: 8.0,
			screenMat: signMat
		});
		group.add(archGroup);
	}

	private createTactileStationProp(
		stationGroup: THREE.Group,
		stationIndex: number,
		hotspot: HotspotItem,
		position: THREE.Vector3,
		yawAngle: number,
		accentHex: number
	): void {
		const { root, spinAxis, kind, haloMat } = this.buildTactileProp(
			hotspot,
			stationIndex,
			accentHex
		);
		root.name = `prop-${hotspot.id}`;
		root.userData.isProp = true;
		root.position.copy(position);
		root.rotation.y = yawAngle;

		root.traverse((child) => {
			child.userData.hotspotId = hotspot.id;
			child.userData.stationIndex = stationIndex;
		});

		stationGroup.add(root);
		this.interactableMeshes.push(root);
		this.interactionRoots.push(root);

		const spring = createToySpring(root.position);
		this.toys.push({
			id: hotspot.id,
			stationIndex,
			hotspot,
			mesh: root,
			baseY: position.y,
			spring,
			spinAxis,
			spinSpeed: 0,
			kind,
			haloMat,
			scaleOffset: 0,
			scaleVelocity: 0,
			exploded: 0
		});
		const toy = this.toys[this.toys.length - 1];
		toy.layers = this.assembleToyLayers(toy);
		this.scheduleGlbSwap(toy);
	}

	/**
	 * Sesi 2: Jadualkan pemuatan GLB CC BY 4.0 sebagai pengganti siluet prosedural.
	 * Dunia kekal interaktif — GLB ditukar masuk hanya selepas model selesai dimuatkan
	 * dan dinormalisasi. Ralat rangkaian tidak mematahkan apa-apa (proksi kekal).
	 */
	private scheduleGlbSwap(toy: ToyRecord): void {
		const spec = DIORAMA_GLB_MAP[toy.id];
		if (!spec) return;

		this.glbLoader.load({
			path: spec.path,
			targetHeight: spec.targetHeight,
			hotspotId: toy.id,
			stationIndex: toy.stationIndex,
			onReady: (obj) => {
				if (this.disposed) return;
				// Leraikan kumpulan lapisan lama terlebih dahulu dan singkirkan semua
				// simpang siluet prosedural (isSilhouettePart) supaya model GLB menggantikannya
				// sepenuhnya tanpa pertindihan geometri.
				if (toy.layers) {
					for (const layer of toy.layers) {
						for (const child of [...layer.root.children]) {
							if (child.name === 'diorama-silhouette' || child.userData.isSilhouettePart) {
								layer.root.remove(child);
							} else {
								toy.mesh.add(child);
							}
						}
						toy.mesh.remove(layer.root);
					}
				}
				for (const child of [...toy.mesh.children]) {
					if (child.name === 'diorama-silhouette' || child.userData.isSilhouettePart) {
						toy.mesh.remove(child);
					}
				}
				// Model GLB telah diselaraskan tapaknya pada y = 0.285m oleh diorama-glb.ts
				obj.userData.isGlb = true;
				obj.traverse((c) => {
					if (c !== obj) c.userData.isGlbPart = true;
				});
				toy.mesh.add(obj);
				toy.mesh.userData.glbLoaded = true;
				toy.spinAxis = obj;
				toy.layers = this.assembleToyLayers(toy);
			},
			onError: () => {
				/* proksi prosedural kekal — tiada tindakan */
			}
		});
	}

	/**
	 * Sokongan Exploded 3-Lapisan (Sesi 1): asingkan simpang geometri setiap prop mengikut
	 * ketinggian tempatan kepada 3 sub-kumpulan (top/mid/base). Tiada geometri dibina semula —
	 * hanya dirujuk semula supaya lapisan boleh terangkat/bercantum tanpa menukar siluet asal.
	 * Geometri tanpa komponen menegak (contoh: papan tanda) dikelaskan ke `mid`.
	 */
	private assembleToyLayers(toy: ToyRecord): ToyLayer[] {
		const layers: ToyLayer[] = [];
		const box = new THREE.Box3().setFromObject(toy.mesh);
		const size = new THREE.Vector3();
		box.getSize(size);
		const minY = box.min.y;
		const height = Math.max(0.01, size.y);

		const groupFor = (id: ToyLayer['id']): THREE.Group => {
			const g = new THREE.Group();
			g.name = `toy-layer-${id}`;
			return g;
		};
		const top = groupFor('top');
		const mid = groupFor('mid');
		const base = groupFor('base');

		// Asingkan lapisan tanpa menceraikan hierarki simpang berputar (spinAxis)
		const baseParts: THREE.Object3D[] = [];
		const floatingParts: THREE.Object3D[] = [];

		for (const child of [...toy.mesh.children]) {
			if (child.name.startsWith('toy-layer-')) continue;
			// Tapak pedestal kekal pada base
			if (
				child.name === 'diorama-base-plinth' ||
				child.position.y < 0.28 ||
				child.name === 'diorama-nameplate'
			) {
				baseParts.push(child);
			} else {
				floatingParts.push(child);
			}
		}

		toy.mesh.add(base, mid, top);
		for (const part of baseParts) {
			base.add(part);
		}
		for (const part of floatingParts) {
			top.add(part);
		}

		const offsetFor = (id: ToyLayer['id'], frac: number): THREE.Vector3 => {
			switch (id) {
				case 'top':
					return new THREE.Vector3(0, Math.min(0.38, frac * 0.35 + 0.12), 0);
				case 'mid':
					return new THREE.Vector3(0, Math.min(0.2, frac * 0.18 + 0.06), 0);
				case 'base':
				default:
					return new THREE.Vector3(0, 0.04, 0);
			}
		};

		const defs: Array<{ id: ToyLayer['id']; group: THREE.Group }> = [
			{ id: 'top', group: top },
			{ id: 'mid', group: mid },
			{ id: 'base', group: base }
		];
		for (const { id, group } of defs) {
			layers.push({
				id,
				root: group,
				offset: offsetFor(id, height),
				anchorLocal: new THREE.Vector3(0, minY + height * (id === 'top' ? 0.8 : id === 'mid' ? 0.5 : 0.2), 0)
			});
		}
		return layers.reverse();
	}

	/**
	 * Membina 6 Pulau Balai Cerap 360° yang menghadap ke arah Teras Reaktor Pusat (0,0,0).
	 * Terminal Pameran disusun dalam lengkungan Semi-Bulatan Amphitheater (bukan lorong lurus!).
	 */
	private buildArchipelagoStations(): void {
		const stationAccents = [0x38bdf8, 0x2dd4bf, 0x38bdf8, 0x2dd4bf, 0x60a5fa, 0x2dd4bf];

		STATION_ANCHORS.forEach((anchor, stationIndex) => {
			const station = STATIONS[stationIndex];
			if (!station) return;

			const group = new THREE.Group();
			group.name = `island-${stationIndex}-${station.id}`;
			group.position.copy(anchor);
			// Pusingkan setiap pulau supaya menghadap ke luar jejari (kamera melihat pulau dengan Teras Reaktor Pusat di latar belakang!)
			const radialAngle = STATION_ANGLES[stationIndex];
			group.rotation.y = radialAngle;

			group.userData.islandIndex = stationIndex;
			group.userData.isIsland = true;
			group.userData.stationId = station.id;
			this.scene.add(group);
			this.stationGroups.push(group);

			const accentHex = stationAccents[stationIndex % stationAccents.length];
			this.createStationPlazaAndMonument(group, stationIndex, accentHex);
			this.createStationHeaderArch(group, station);

			// Susun setiap HotspotItem dalam Lengkungan Concave Menghadap Kamera Orbit (+Z)
			// dengan penjarakan stepX adaptif mengikut kiraan terminal bagi menghapuskan sebarang perlanggaran
			// fizikal dan menjamin garis penglihatan kamera mod inspect bebas daripada sebarang halangan.
			const items = station.hotspots;
			const count = items.length;
			const stepX = count <= 3 ? 2.65 : count === 4 ? 2.05 : 1.72;
			const halfSpan = (count - 1) * 0.5 * stepX;

			items.forEach((hs, idx) => {
				const xPos = (idx - (count - 1) * 0.5) * stepX;
				const normX = halfSpan > 0.001 ? xPos / halfSpan : 0; // -1 .. +1

				// Lengkungan Concave di hadapan monumen latar (-2.35m) supaya tiada pertindihan siluet
				const zPos = 1.28 + Math.abs(normX) * 0.48;

				// Sudut yaw lembut (maksimum ±14.3° / ±0.25 rad), memusatkan skrin ke titik pandang penonton
				const yaw = -normX * 0.25;
				const hsColors = [0x38bdf8, 0x2dd4bf, 0x60a5fa, 0x34d399, 0xfbbf24];

				this.createTactileStationProp(
					group,
					stationIndex,
					hs,
					new THREE.Vector3(xPos, LOCAL_DECK_HEIGHT, zPos),
					yaw,
					hsColors[idx % hsColors.length]
				);
			});

			// Benarkan pengguna mengklik mana-mana pulau dari jauh untuk terbang terus ke pulau itu
			group.traverse((child) => {
				if (child.userData.islandIndex === undefined) {
					child.userData.islandIndex = stationIndex;
				}
			});
			this.interactableMeshes.push(group);
		});

		if (typeof Image !== 'undefined') {
			const img = new Image();
			img.crossOrigin = 'anonymous';
			img.onload = () => {
				if (this.disposed) return;
				// Simpan rujukan kekal: kanvas dilukis semula (clearRect) pada setiap perubahan tema/periksa.
				this.profileImage = img;
				this.redrawAllCanvases();
			};
			img.src = PROFILE.profilePhoto;
		}
	}

	private redrawAllCanvases(): void {
		for (const sh of this.stationHeaders) {
			this.drawStationHeaderCanvas(sh.canvas, sh.station);
			sh.texture.needsUpdate = true;
		}
	}

	/**
	 * LAPISAN GENTIAN X-RAY BAWAH PULAU (Sesi 3, Tunggak C.1): saluran optik
	 * bercahaya + nod aliran paket yang disimpan dalam adegan berasingan dan
	 * dihantar ke pas kanta melalui `tFiber` (tidak menambah kos lautan GLSL).
	 */
	private buildXRayFiberLayer(): void {
		if (!this.renderer) return;
		const scene = new THREE.Scene();
		// Guna semula pandangan kamera utama supaya gentian sejajar tepat dengan
		// dunia (tidak menjejaskan kos: adegan ini hampir kosong).
		const camera = new THREE.PerspectiveCamera(
			this.camera.fov,
			this.camera.aspect,
			this.camera.near,
			this.camera.far
		);
		const dpr = this.renderer.getPixelRatio?.() ?? 1;
		const w = Math.max(this.container.clientWidth, 1);
		const h = Math.max(this.container.clientHeight, 1);
		const target = new THREE.WebGLRenderTarget(
			Math.max(1, Math.floor(w * dpr)),
			Math.max(1, Math.floor(h * dpr)),
			{
				type: THREE.HalfFloatType
			}
		);
		target.texture.minFilter = THREE.LinearFilter;
		target.texture.magFilter = THREE.LinearFilter;
		target.texture.generateMipmaps = false;

		const fiberMat = new THREE.MeshStandardMaterial({
			color: 0x22d3ee,
			emissive: 0x38bdf8,
			emissiveIntensity: 2.8,
			metalness: 0.15,
			roughness: 0.35,
			depthTest: true,
			depthWrite: false
		});
		fiberMat.userData.baseEmissive = 2.8;
		this.glowMaterials.push(fiberMat);

		const pulseMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });

		// Adegan gentian terasing hanya menyimpan tiub + denyut; tanpa lampu,
		// MeshStandardMaterial akan dirender hitam walaupun emissive ditetapkan.
		const fiberAmbient = new THREE.AmbientLight(0xdff4ff, 2.2);
		scene.add(fiberAmbient);

		const sampleCount = 80;
		for (const anchor of STATION_ANCHORS) {
			const points: THREE.Vector3[] = [];
			for (let s = 0; s < sampleCount; s++) {
				const n = s / sampleCount;
				const r = 2.0 + n * 4.6;
				const phi = n * Math.PI * 14 + anchor.x * 0.37;
				points.push(
					new THREE.Vector3(
						anchor.x + Math.cos(phi) * r,
						anchor.y + 0.05 + Math.sin(phi * 1.3) * 0.07,
						anchor.z + Math.sin(phi) * r
					)
				);
			}
			const curve = new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.5);
			const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 96, 0.035, 6, true), fiberMat);
			tube.frustumCulled = false;
			tube.userData.isXRayFiber = true;
			this.xrayFiberMeshes.push(tube);
			scene.add(tube);

			// Nod aliran paket mengelilingi saluran; jiwa hanya berdenyut dalam X-Ray.
			const nodeCount = 6;
			for (let p = 0; p < nodeCount; p++) {
				const node = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), pulseMat);
				node.frustumCulled = false;
				node.userData.isXRayFiber = true;
				// kedudukan sebenar ditetapkan setiap bingkai daripada fasa.
				node.position.set(anchor.x, anchor.y + 0.05, anchor.z);
				this.xrayPulseNodes.push(node);
				this.xrayPulsePhases.push((((p / nodeCount + anchor.x * 0.02) % 1) + 1) % 1);
				scene.add(node);
			}
		}

		this.xrayPulseNodeCurve = this.causewayLoopCurve;
		this.xrayFiberScene = scene;
		this.xrayFiberCamera = camera;
		this.xrayFiberTarget = target;
	}

	private xrayPulseNodeCurve: THREE.CatmullRomCurve3 | null = null;

	private updateXRayLens(dt: number, width: number, height: number): void {
		if (!this.xrayLensPass) return;
		const u = this.xrayLensPass.uniforms;
		u.uResolution.value.set(width, height);
		u.uChromAb.value = this.xrayReduced ? 0 : 1;
		u.uAmount.value += ((this.xrayActive ? 1 : 0) - u.uAmount.value) * Math.min(1, dt * 8);
		if (this.xrayReduced) u.uAmount.value = this.xrayActive ? 1 : 0;

		// Pusat kanta: ikut kursor pada skrin; statik di tengah pada mudah alih/reduced.
		const center = this.tempLensCenter;
		if (this.isMobile || this.xrayReduced) {
			center.set(width * 0.5, height * 0.5);
		} else {
			center.set(
				(this.pointerNdc.x * 0.5 + 0.5) * width,
				(-this.pointerNdc.y * 0.5 + 0.5) * height
			);
		}
		u.uCenter.value.copy(center);
		// Kanta pemeriksa berpadanan: cukup untuk membaca potongan rentas tanpa menelan skrin.
		u.uRadius.value = Math.min(Math.min(width, height) * 0.24, 280);

		// Render adegan gentian berasingan Cuma apabila X-Ray hampir aktif.
		if (
			u.uAmount.value > 0.01 &&
			this.xrayFiberScene &&
			this.xrayFiberCamera &&
			this.xrayFiberTarget &&
			this.renderer
		) {
			// Sejajarkan kamera ketir dengan kamera utama bagi setiap bingkai.
			this.xrayFiberCamera.fov = this.camera.fov;
			this.xrayFiberCamera.aspect = this.camera.aspect;
			this.xrayFiberCamera.updateProjectionMatrix();
			this.xrayFiberCamera.position.copy(this.camera.position);
			this.xrayFiberCamera.quaternion.copy(this.camera.quaternion);
			// Alirkan nod paket sepanjang laluan (Sesi 3.1).
			const baseCurve = this.xrayPulseNodeCurve ?? this.causewayLoopCurve;
			for (let i = 0; i < this.xrayPulseNodes.length; i++) {
				const node = this.xrayPulseNodes[i];
				const phase = (this.xrayPulsePhases[i] + this.motionTime * 0.05) % 1;
				baseCurve.getPointAt(phase, this.tempPulsePt);
				node.position.set(this.tempPulsePt.x, this.tempPulsePt.y + 0.05, this.tempPulsePt.z);
			}
			const prevAutoClear = this.renderer.autoClear;
			this.renderer.autoClear = true;
			this.renderer.setRenderTarget(this.xrayFiberTarget);
			this.renderer.clear(true, true, false);
			this.renderer.render(this.xrayFiberScene, this.xrayFiberCamera);
			this.renderer.setRenderTarget(null);
			this.renderer.autoClear = prevAutoClear;
			u.tFiber.value = this.xrayFiberTarget.texture;
		} else if (u.tFiber.value) {
			u.tFiber.value = null;
		}
	}

	private tempLensCenter = new THREE.Vector2(0, 0);

	public setXRayActive(active: boolean): void {
		this.xrayActive = active;
	}

	public isXRayActive(): boolean {
		return this.xrayActive;
	}

	public setLensPointer(clientX: number, clientY: number): void {
		if (!this.renderer) return;
		const rect = this.renderer.domElement.getBoundingClientRect();
		if (rect.width <= 0 || rect.height <= 0) return;
		this.pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
		this.pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
	}

	private disposeXRayFiberLayer(): void {
		const disposedGeos = new Set<THREE.BufferGeometry>();
		for (const mesh of this.xrayFiberMeshes) {
			mesh.geometry.dispose();
			disposedGeos.add(mesh.geometry);
			mesh.material.dispose();
		}
		this.xrayFiberMeshes = [];
		for (const node of this.xrayPulseNodes) {
			if (!disposedGeos.has(node.geometry)) node.geometry.dispose();
			node.material.dispose();
		}
		this.xrayPulseNodes = [];
		this.xrayPulsePhases = [];
		if (this.xrayFiberTarget) {
			this.xrayFiberTarget.dispose();
			this.xrayFiberTarget = null;
		}
		this.xrayFiberScene = null;
		this.xrayFiberCamera = null;
	}

	private getWeatherConfig(): WeatherConfig {
		const isLight = this.theme === 'light';

		// Dalam Light Mode, pastikan warna langit & laut sentiasa tepu (Rich Tropical Sapphire & Cobalt) tanpa kabus putih yang menyilaukan
		if (isLight) {
			if (this.weatherPresetId === 'monsoon_swell') {
				return {
					sunElevation: 0.34,
					sunAzimuth: 0.42,
					waveScale: 1.28,
					choppiness: 1.24,
					skyZenith: new THREE.Color(0x0c4a6e),
					skyHorizon: new THREE.Color(0x38bdf8),
					sunColor: new THREE.Color(0xfef08a),
					waterDeep: new THREE.Color(0x022c43),
					waterShallow: new THREE.Color(0x0369a1),
					waterScatter: new THREE.Color(0x0d9488),
					fogColor: new THREE.Color(0x0284c7),
					nightFactor: 0.0
				};
			}
			return {
				sunElevation: 0.42,
				sunAzimuth: 0.28,
				waveScale: 0.88,
				choppiness: 1.06,
				skyZenith: new THREE.Color(0x0369a1),
				skyHorizon: new THREE.Color(0x38bdf8),
				sunColor: new THREE.Color(0xfef3c7),
				waterDeep: new THREE.Color(0x022c43),
				waterShallow: new THREE.Color(0x0e7490),
				waterScatter: new THREE.Color(0x14b8a6),
				fogColor: new THREE.Color(0x0284c7),
				nightFactor: 0.0
			};
		}

		if (this.weatherPresetId === 'emerald_day') {
			return {
				sunElevation: 0.38,
				sunAzimuth: 0.28,
				waveScale: 0.88,
				choppiness: 1.06,
				skyZenith: new THREE.Color(0x072f49),
				skyHorizon: new THREE.Color(0x0284c7),
				sunColor: new THREE.Color(0xfde68a),
				waterDeep: new THREE.Color(0x032238),
				waterShallow: new THREE.Color(0x0d7490),
				waterScatter: new THREE.Color(0x2dd4bf),
				fogColor: new THREE.Color(0x075985),
				nightFactor: 0.0
			};
		}

		if (this.weatherPresetId === 'biolum_night') {
			return {
				sunElevation: 0.14,
				sunAzimuth: -0.35,
				waveScale: 0.8,
				choppiness: 1.0,
				skyZenith: new THREE.Color(0x030712),
				skyHorizon: new THREE.Color(0x0f172a),
				sunColor: new THREE.Color(0x7dd3fc),
				waterDeep: new THREE.Color(0x020617),
				waterShallow: new THREE.Color(0x082f49),
				waterScatter: new THREE.Color(0x06b6d4),
				fogColor: new THREE.Color(0x091326),
				nightFactor: 1.0
			};
		}

		if (this.weatherPresetId === 'monsoon_swell') {
			return {
				sunElevation: 0.2,
				sunAzimuth: 0.45,
				waveScale: 1.42,
				choppiness: 1.32,
				skyZenith: new THREE.Color(0x0f172a),
				skyHorizon: new THREE.Color(0x334155),
				sunColor: new THREE.Color(0xfde68a),
				waterDeep: new THREE.Color(0x041e34),
				waterShallow: new THREE.Color(0x0f4c5c),
				waterScatter: new THREE.Color(0x2dd4bf),
				fogColor: new THREE.Color(0x1e293b),
				nightFactor: 0.25
			};
		}

		return {
			sunElevation: 0.34,
			sunAzimuth: -0.42,
			waveScale: 0.88,
			choppiness: 1.06,
			skyZenith: new THREE.Color(0x050f22),
			skyHorizon: new THREE.Color(0x183046),
			sunColor: new THREE.Color(0x8da8c2),
			waterDeep: new THREE.Color(0x020c17),
			waterShallow: new THREE.Color(0x0a2633),
			waterScatter: new THREE.Color(0x17545d),
			fogColor: new THREE.Color(0x102637),
			nightFactor: 1.0
		};
	}

	/**
	 * Kalibrasi Pencahayaan, Exposure & Bloom mengikut Tema supaya Light Mode tajam & bebas silau
	 */
	private applyWeatherAndTheme(): void {
		if (!this.oceanMaterial || !this.skyMaterial) return;
		const cfg = this.getWeatherConfig();
		const isLight = this.theme === 'light';

		const sunDir = new THREE.Vector3(
			Math.sin(cfg.sunAzimuth) * Math.cos(cfg.sunElevation),
			Math.sin(cfg.sunElevation),
			-Math.cos(cfg.sunAzimuth) * Math.cos(cfg.sunElevation)
		).normalize();

		this.oceanMaterial.uniforms.uWaveScale.value = this.reducedMotion ? 0.25 : cfg.waveScale;
		this.oceanMaterial.uniforms.uChoppiness.value = cfg.choppiness;
		this.oceanMaterial.uniforms.uSunDir.value.copy(sunDir);
		this.oceanMaterial.uniforms.uSunColor.value.copy(cfg.sunColor);
		this.oceanMaterial.uniforms.uSkyZenith.value.copy(cfg.skyZenith);
		this.oceanMaterial.uniforms.uSkyHorizon.value.copy(cfg.skyHorizon);
		this.oceanMaterial.uniforms.uWaterDeep.value.copy(cfg.waterDeep);
		this.oceanMaterial.uniforms.uWaterShallow.value.copy(cfg.waterShallow);
		this.oceanMaterial.uniforms.uWaterScatter.value.copy(cfg.waterScatter);
		this.oceanMaterial.uniforms.uFogColor.value.copy(cfg.fogColor);
		this.oceanMaterial.uniforms.uNightFactor.value = cfg.nightFactor;
		this.oceanMaterial.uniforms.uSunSpecScale.value = isLight ? 0.35 : 0.45;

		this.skyMaterial.uniforms.uSunDir.value.copy(sunDir);
		this.skyMaterial.uniforms.uSunColor.value.copy(cfg.sunColor);
		this.skyMaterial.uniforms.uSkyZenith.value.copy(cfg.skyZenith);
		this.skyMaterial.uniforms.uSkyHorizon.value.copy(cfg.skyHorizon);
		this.skyMaterial.uniforms.uNightFactor.value = cfg.nightFactor;

		// Kawal Exposure, IBL & Bloom: Dark Mode tenang tanpa silau, Light Mode bersih
		if (this.renderer) {
			this.renderer.toneMapping =
				this.qualityTier === 'lite' ? THREE.ACESFilmicToneMapping : THREE.AgXToneMapping;
			this.renderer.toneMappingExposure = isLight ? 1.18 : 1.12;
		}
		if (this.bloomPass) {
			this.bloomPass.strength = isLight ? 0.22 : 0.48;
			this.bloomPass.radius = 0.52;
			this.bloomPass.threshold = isLight ? 0.96 : 0.88;
		}
		this.scene.environmentIntensity = isLight ? 0.88 : 0.82;

		this.keyLight.color.copy(cfg.sunColor);
		this.keyLight.intensity = isLight ? 1.55 : 1.35;
		this.hemiLight.color.copy(cfg.skyHorizon);
		this.hemiLight.intensity = isLight ? 0.62 : 0.52;
		this.ambientLight.intensity = isLight ? 0.38 : 0.30;
		this.stationSpotLight.intensity = isLight ? 2.8 : 2.6;
		this.rimLight.intensity = isLight ? 2.2 : 2.1;

		if (this.pulseMat) {
			this.pulseMat.color.setHex(isLight ? 0x0284c7 : 0x38bdf8);
		}
		if (this.motePoints) {
			this.motePoints.material.uniforms.uColor.value.setHex(isLight ? 0x38bdf8 : 0x7dd3fc);
			this.motePoints.material.uniforms.uOpacity.value = isLight ? 0.28 : 0.48;
		}

		for (const mat of this.glowMaterials) {
			const base = (mat.userData.baseEmissive as number | undefined) ?? 0.65;
			mat.emissiveIntensity = isLight ? base * 1.05 : base * 1.35;
		}

		this.refreshToyHighlights();
	}

	public setTheme(theme: ThemeMode): void {
		if (this.theme === theme && this.screenPalette) return;
		this.theme = theme;
		this.readScreenPalette();
		this.applyWeatherAndTheme();
		this.redrawAllCanvases();
	}

	public setLocale(locale: Locale): void {
		if (this.locale === locale) return;
		this.locale = locale;
		this.redrawAllCanvases();
	}

	public setReducedMotion(reduced: boolean): void {
		this.reducedMotion = reduced;
		this.xrayReduced = reduced;
		this.applyWeatherAndTheme();
	}

	public setActive(active: boolean): void {
		if (active) {
			if (this.active && this.rafId !== null) return;
			this.active = true;
			this.clock.getDelta(); // Buang masa dorman supaya tiada lompatan frame besar
			this.startLoop();
		} else {
			this.active = false;
			if (this.rafId !== null) {
				cancelAnimationFrame(this.rafId);
				this.rafId = null;
			}
			this.onPointerCancel();
		}
	}

	public setInputEnabled(enabled: boolean): void {
		this.inputEnabled = enabled;
		if (!enabled) {
			this.onPointerCancel();
			if (this.hoveredToyId || this.hoveredIslandIndex !== null) {
				this.hoveredToyId = null;
				this.hoveredIslandIndex = null;
				this.refreshToyHighlights();
				this.callbacks.onHotspotHover?.(null, null);
			}
			if (this.renderer) {
				this.renderer.domElement.style.cursor = 'default';
			}
		}
	}

	public moveProgress(delta: number): void {
		let wrapped = (this.targetProgress + delta) % 1;
		if (wrapped < 0) wrapped += 1;
		this.targetProgress = wrapped;
	}

	public setProgress(progress: number): void {
		// Gelung orbital 360° yang berterusan (boleh berputar penuh tanpa jalan mati)
		let wrapped = progress % 1;
		if (wrapped < 0) wrapped += 1;
		this.targetProgress = wrapped;
	}

	public goToStation(index: number): void {
		const clamped =
			((index % STATION_ANCHORS.length) + STATION_ANCHORS.length) % STATION_ANCHORS.length;
		this.targetProgress = clamped / STATION_ANCHORS.length;
		this.targetYawOffset = 0;
		this.targetPitchOffset = 0;
		if (this.hoveredIslandIndex !== null) {
			this.hoveredIslandIndex = null;
			this.callbacks.onHotspotHover?.(this.hoveredToyId, null);
		}
		if (this.renderer?.shadowMap?.enabled) {
			this.renderer.shadowMap.needsUpdate = true;
		}
	}

	public redrawSelectedScreen(): void {
		for (const sh of this.stationHeaders) {
			this.drawStationHeaderCanvas(sh.canvas, sh.station);
			sh.texture.needsUpdate = true;
		}
	}

	public selectHotspot(hotspotId: string | null): void {
		const leaving = this.focusToyId !== hotspotId;
		this.selectedToyId = hotspotId;
		this.focusToyId = hotspotId;
		if (!hotspotId) this.focusSettle = 0;
		this.hoveredToyId = null;
		this.hoveredIslandIndex = null;
		if (hotspotId) {
			const record = this.toys.find((item) => item.id === hotspotId);
			if (record) {
				this.goToStation(record.stationIndex);
			}
		} else {
			this.targetYawOffset = 0;
		}
		if (leaving) {
			this.refreshToyHighlights();
		}
		if (this.renderer) this.renderer.domElement.style.cursor = hotspotId ? 'pointer' : 'grab';
	}

	public setSimulationMode(_stationIndex: number, modeId: string): void {
		this.weatherPresetId = modeId;
		this.applyWeatherAndTheme();
	}

	/**
	 * Sesi 4: Pacu keamatan bahan glow sesuatu prop Cyber-Bench (0–1).
	 * Untuk `fiber`, ini mengubah kecerahan teras optik; untuk `tindak`,
	 * laluan prisma perhati; untuk `sutera`, cincin gerbang RLS.
	 */
	public setCyberBenchSignal(toolId: string, value: number): void {
		const toy = this.toys.find((item) => item.id === toolId);
		if (!toy) return;
		const amount = Math.max(0, Math.min(1, value));
		toy.mesh.traverse((child) => {
			const mesh = child as THREE.Mesh;
			const mat = mesh.material as THREE.MeshStandardMaterial | null;
			const base = mat?.userData?.baseEmissive as number | undefined;
			if (mat && base !== undefined) {
				mat.emissiveIntensity = base * (0.28 + amount * 2.4);
			}
		});
	}

	/** Sesi 4: Alat RLS Gate — halau gelang IWA001 hijau (lulus) / merah (tangkis). */
	public setCyberBenchGate(allowed: boolean): void {
		const toy = this.toys.find((item) => item.id === 'ent-sutera');
		if (!toy?.haloMat) return;
		const hex = allowed ? 0x22c55e : 0xef4444;
		toy.haloMat.emissive.setHex(hex);
		toy.haloMat.color.setHex(hex);
	}

	/** Sesi 4: Pacu laju radar SOC & denyutan nod ancaman daripada nadi CVE/GitHub. */
	public setCyberPulseLevel(level: number): void {
		this.cyberPulseLevel = Math.max(0, Math.min(1, level));
	}

	private triggerPropBounce(toy: ToyRecord): void {
		if (this.reducedMotion) {
			// Maklum balas statik: satu denyutan kedudukan & skala segera tanpa spring berayun.
			toy.spring.position.set(toy.spring.home.x, toy.spring.home.y + 0.35, toy.spring.home.z);
			clampToySpring(toy.spring);
			toy.scaleOffset = 0.14;
			toy.scaleVelocity = 0;
			toy.mesh.scale.set(1.12, 1.16, 1.12);
		} else {
			toy.spring.velocity.y += 2.6;
			toy.spring.velocity.x += (Math.sin(toy.spring.home.y * 3.1) - 0.5) * 0.9;
			toy.spring.velocity.z += (Math.cos(toy.spring.home.y * 2.3) - 0.5) * 0.9;
			toy.scaleOffset = Math.max(toy.scaleOffset ?? 0, 0.16);
			toy.scaleVelocity = (toy.scaleVelocity ?? 0) + 2.8;
			const s = toy.scaleOffset;
			toy.mesh.scale.set(1 + s * 0.85, 1 + s * 1.18, 1 + s * 0.85);
		}
		toy.spinSpeed = this.reducedMotion ? 0 : 1 + (toy.stationIndex % 3) * 0.35;
		this.toyReady = false;
		this.springElapsed = 0;
	}

	/**
	 * Aksi primary per stesen: berikan impuls taktil (spring + scale bounce) kepada prop dan return true jika berjaya.
	 */
	public bounceProp(id: string): boolean {
		const toy = this.toys.find((item) => item.id === id);
		if (!toy) return false;
		this.triggerPropBounce(toy);
		this.callbacks.onHotspotSelect?.(toy.id, toy.stationIndex);
		this.refreshToyHighlights();
		this.emitToyStatus();
		return true;
	}

	/** Reset semua prop dan efek kepada keadaan asal; sauh spring & skala ke kedudukan tetap. */
	public resetToys(): void {
		for (const toy of this.toys) {
			resetToySpring(toy.spring);
			toy.spinSpeed = 0;
			toy.scaleOffset = 0;
			toy.scaleVelocity = 0;
			toy.mesh.scale.set(1, 1, 1);
			toy.mesh.position.copy(toy.spring.home);
			toy.mesh.position.y = toy.baseY;
		}
		this.toyReady = true;
		this.laserReady = true;
		this.springElapsed = 0;
		this.clearLaserEffect();
		this.emitToyStatus();
	}

	/**
	 * Network: tembak laser ancaman dengan beam + target effect yang nyata.
	 * Return boolean: false jika masih cooldown atau tiada pemancar network.
	 */
	public fireSecurityLaser(preferredSource?: THREE.Group): boolean {
		if (!this.laserReady) return false;
		const turret = this.toys.find((toy) => toy.stationIndex === 2 && toy.kind === 'laser_turret');
		if (!turret) return false;
		this.spawnLaserBeam(preferredSource ?? turret.mesh);
		this.laserHits += 1;
		this.laserReady = false;
		this.laserUntil = LASER_DURATION;
		this.emitToyStatus();
		return true;
	}

	private spawnLaserBeam(sourceMesh: THREE.Group): void {
		this.clearLaserEffect();
		sourceMesh.updateWorldMatrix(true, false);
		const startPos = new THREE.Vector3();
		sourceMesh.getWorldPosition(startPos);
		startPos.y += 1.08;

		// Tembak ke arah nod ancaman siber pulau Stesen 03 jika wujud, atau Teras Pusat
		const targetPos = new THREE.Vector3(0, 0.42, 0);
		if (this.threatNodeMesh) {
			this.threatNodeMesh.updateWorldMatrix(true, false);
			this.threatNodeMesh.getWorldPosition(targetPos);
		}
		const dir = new THREE.Vector3().subVectors(targetPos, startPos);
		const length = Math.max(0.1, dir.length());

		const beamGeo = new THREE.CylinderGeometry(0.05, 0.085, length, 12);
		beamGeo.rotateX(Math.PI / 2);

		this.laserBeamMat = new THREE.MeshBasicMaterial({
			color: 0xef4444,
			transparent: true,
			opacity: 0.96
		});
		this.laserMesh = new THREE.Mesh(beamGeo, this.laserBeamMat);
		this.laserMesh.position.copy(startPos).addScaledVector(dir, 0.5);
		this.laserMesh.lookAt(targetPos);
		this.scene.add(this.laserMesh);

		// Target effect: sfera hentaman denyut
		const targetGlowGeo = new THREE.SphereGeometry(0.58, 18, 18);
		this.laserGlowMat = new THREE.MeshBasicMaterial({
			color: 0xff2a4d,
			transparent: true,
			opacity: 0.88
		});
		this.laserTargetGlow = new THREE.Mesh(targetGlowGeo, this.laserGlowMat);
		this.laserTargetGlow.position.copy(targetPos);
		this.scene.add(this.laserTargetGlow);
	}

	private clearLaserEffect(): void {
		if (this.laserMesh) {
			this.scene.remove(this.laserMesh);
			this.laserMesh.geometry.dispose();
			this.laserBeamMat?.dispose();
			this.laserMesh = null;
			this.laserBeamMat = null;
		}
		if (this.laserTargetGlow) {
			this.scene.remove(this.laserTargetGlow);
			this.laserTargetGlow.geometry.dispose();
			this.laserGlowMat?.dispose();
			this.laserTargetGlow = null;
			this.laserGlowMat = null;
		}
	}

	private refreshToyHighlights(): void {
		const isLight = this.theme === 'light';
		for (const toy of this.toys) {
			const isSelected = toy.id === this.selectedToyId;
			const isHovered = toy.id === this.hoveredToyId;
			let targetSpin = 0.55;
			if (isHovered) targetSpin = 1.45;
			if (isSelected) targetSpin = 1.15;
			toy.spinSpeed = Math.max(toy.spinSpeed, targetSpin);
			if (toy.kind === 'laser_turret' && isSelected) {
				toy.spinSpeed = 0.3;
			}
			if (toy.haloMat) {
				const base = isLight ? 0.52 : 0.42;
				toy.haloMat.emissiveIntensity = isSelected ? 1.55 : isHovered ? 1.12 : base;
			}
		}
	}

	private emitToyStatus(): void {
		this.callbacks.onToyStatus?.({ hits: this.laserHits, ready: this.laserReady });
	}

	private attachEvents(): void {
		if (!this.renderer) return;
		const dom = this.renderer.domElement;

		dom.addEventListener('pointerdown', this.onPointerDown);
		window.addEventListener('pointermove', this.onPointerMove);
		window.addEventListener('pointerup', this.onPointerUp);
		window.addEventListener('pointercancel', this.onPointerCancel);
		window.addEventListener('keydown', this.onKeyDown);
		window.addEventListener('keyup', this.onKeyUp);
		window.addEventListener('blur', this.onWindowBlur);

		this.resizeObserver = new ResizeObserver(() => this.onResize());
		this.resizeObserver.observe(this.container);
	}

	private onWindowBlur = (): void => {
		this.onPointerCancel();
		if (this.hoveredToyId) {
			this.hoveredToyId = null;
			this.refreshToyHighlights();
			this.callbacks.onHotspotHover?.(null, null);
		}
	};

	private onPointerCancel = (e?: PointerEvent): void => {
		if (e && e.pointerId !== this.pointerId) return;
		this.isDragging = false;
		this.pointerId = null;
		this.pointerDownToyId = null;
		this.heldKeys.clear();
	};

	private onKeyDown = (e: KeyboardEvent): void => {
		if (!this.inputEnabled) return;
		if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
		if (e.key === 'Escape' && this.selectedToyId) {
			e.preventDefault();
			this.selectHotspot(null);
			this.callbacks.onHotspotSelect?.('', this.activeStationIndex);
			return;
		}
		const target = e.target as HTMLElement | null;
		if (
			target?.isContentEditable ||
			['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(target?.tagName || '') ||
			target?.closest?.('[role="dialog"], [role="button"], button, a, input, textarea')
		) {
			return;
		}
		if (this.selectedToyId) return;
		const k = e.key.toLowerCase();
		if (k === 'w' || k === 's' || k === 'arrowup' || k === 'arrowdown') {
			this.heldKeys.add(k);
			this.lastInteractionTime = this.clock.getElapsedTime();
		}
	};

	private onKeyUp = (e: KeyboardEvent): void => {
		this.heldKeys.delete(e.key.toLowerCase());
	};

	public getQualityTier(): QualityTier {
		return this.qualityTier;
	}

	public getMeasuredFps(): number {
		return this.qualityGovernor.measuredFps;
	}

	public setQualityTier(tier: QualityTier): void {
		if (this.qualityTier === tier && (tier === 'lite' ? !this.composer : Boolean(this.composer))) {
			return;
		}
		this.qualityTier = tier;
		this.qualityGovernor.tier = tier;
		if (!this.renderer) return;

		if (tier === 'lite') {
			this.disposePostProcessing();
			this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
			this.applyWeatherAndTheme();
			return;
		}

		this.renderer.toneMapping = THREE.AgXToneMapping;
		const width = Math.max(this.container.clientWidth, 1);
		const height = Math.max(this.container.clientHeight, 1);
		if (!this.composer) {
			this.setupPostProcessing(width, height);
		} else if (tier === 'balanced' && this.gtaoPass) {
			this.gtaoPass.enabled = false;
		} else if (tier === 'ultra') {
			if (this.gtaoPass) {
				this.gtaoPass.enabled = true;
			} else {
				this.setupPostProcessing(width, height);
			}
		}
		this.applyWeatherAndTheme();
	}

	private setupPostProcessing(width: number, height: number): void {
		if (!this.renderer) return;
		this.disposePostProcessing();
		if (this.qualityTier === 'lite') {
			this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
			return;
		}

		this.renderer.toneMapping = THREE.AgXToneMapping;
		const dpr = this.renderer.getPixelRatio?.() ?? 1;
		const effW = Math.max(1, Math.floor(width * dpr));
		const effH = Math.max(1, Math.floor(height * dpr));
		const hdrTarget = new THREE.WebGLRenderTarget(effW, effH, {
			type: THREE.HalfFloatType
		});
		const composer = new EffectComposer(this.renderer, hdrTarget);
		composer.setPixelRatio(dpr);
		composer.setSize(width, height);

		const renderPass = new RenderPass(this.scene, this.camera);
		composer.addPass(renderPass);
		this.renderPass = renderPass;

		if (this.qualityTier === 'ultra') {
			const halfW = Math.max(1, Math.floor(effW * 0.5));
			const halfH = Math.max(1, Math.floor(effH * 0.5));
			const aoPass = new GTAOPass(this.scene, this.camera, halfW, halfH);
			aoPass.output = GTAOPass.OUTPUT.Default;
			aoPass.blendIntensity = 0.4;
			aoPass.setSceneClipBox(
				new THREE.Box3(new THREE.Vector3(-56, -1.5, -56), new THREE.Vector3(56, 22, 56))
			);
			aoPass.updateGtaoMaterial({
				radius: 0.72,
				distanceExponent: 1.25,
				thickness: 0.95,
				distanceFallOff: 1.0,
				scale: 1.0,
				samples: 10
			});
			aoPass.updatePdMaterial({
				lumaPhi: 10,
				depthPhi: 2,
				normalPhi: 3,
				radius: 4,
				rings: 2,
				samples: 8
			});
			const origSetSize = aoPass.setSize.bind(aoPass);
			aoPass.setSize = (w: number, h: number) => {
				origSetSize(Math.max(1, Math.floor(w * 0.5)), Math.max(1, Math.floor(h * 0.5)));
			};
			const origRender = aoPass.render.bind(aoPass);
			aoPass.render = (renderer, writeBuffer, readBuffer, deltaTime, maskActive) => {
				const prevOcean = this.oceanMesh ? this.oceanMesh.visible : false;
				const prevSky = this.skyMesh ? this.skyMesh.visible : false;
				if (this.oceanMesh) this.oceanMesh.visible = false;
				if (this.skyMesh) this.skyMesh.visible = false;
				try {
					origRender(renderer, writeBuffer, readBuffer, deltaTime, maskActive);
				} finally {
					if (this.oceanMesh) this.oceanMesh.visible = prevOcean;
					if (this.skyMesh) this.skyMesh.visible = prevSky;
				}
			};
			composer.addPass(aoPass);
			this.gtaoPass = aoPass;
		}

		const bloomPass = new UnrealBloomPass(
			new THREE.Vector2(Math.max(1, width), Math.max(1, height)),
			this.theme === 'light' ? 0.20 : 0.36,
			0.48,
			this.theme === 'light' ? 0.98 : 0.99
		);
		composer.addPass(bloomPass);
		this.bloomPass = bloomPass;

		if (typeof Image !== 'undefined') {
			const smaaPass = new SMAAPass();
			composer.addPass(smaaPass);
			this.smaaPass = smaaPass;
		}

		// Lensa X-Ray Kaca Cair (Sesi 3): pas komposit bulat selepas SMAA, sebelum OutputPass.
		const xray = createXRayLensPass(new THREE.Vector2(effW, effH));
		composer.addPass(xray.pass);
		this.xrayLensPass = xray;

		const outputPass = new OutputPass();
		composer.addPass(outputPass);
		this.outputPass = outputPass;

		this.composer = composer;
	}

	private disposePostProcessing(): void {
		this.xrayLensPass?.pass.dispose();
		this.xrayLensPass = null;
		this.gtaoPass?.dispose();
		this.gtaoPass = null;
		this.bloomPass?.dispose();
		this.bloomPass = null;
		this.smaaPass?.dispose();
		this.smaaPass = null;
		this.outputPass?.dispose();
		this.outputPass = null;
		this.renderPass?.dispose();
		this.renderPass = null;
		if (this.composer) {
			this.composer.dispose();
			this.composer = null;
		}
	}

	public onResize(): void {
		if (!this.renderer) return;
		const width = Math.max(this.container.clientWidth, 1);
		const height = Math.max(this.container.clientHeight, 1);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
		const dpr = this.renderer.getPixelRatio?.() ?? 1;
		if (this.composer) {
			this.composer.setPixelRatio(dpr);
			this.composer.setSize(width, height);
		}
		if (this.motePoints) {
			this.motePoints.material.uniforms.uViewportHeight.value = height * dpr;
		}
		// Skala-saiz semula lapisan gentian X-Ray agar sepadan viewport sebenar.
		if (this.xrayFiberTarget && this.renderer) {
			this.xrayFiberTarget.setSize(
				Math.max(1, Math.floor(width * dpr)),
				Math.max(1, Math.floor(height * dpr))
			);
		}
	}

	private updatePointerNdcFromEvent(e: PointerEvent): void {
		if (!this.renderer) return;
		const rect = this.renderer.domElement.getBoundingClientRect();
		if (rect.width <= 0 || rect.height <= 0) return;
		this.pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
		this.pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
	}

	private getRaycastTargets(): THREE.Object3D[] {
		if (this.stationGroups.length > 0) return this.stationGroups;
		return this.interactionRoots.length > 0 ? this.interactionRoots : this.interactableMeshes;
	}

	private findToyById(id: string | null): ToyRecord | null {
		if (!id) return null;
		return this.toys.find((item) => item.id === id) ?? null;
	}

	private onPointerDown = (e: PointerEvent): void => {
		if (
			!this.renderer ||
			!this.inputEnabled ||
			e.button !== 0 ||
			!e.isPrimary ||
			this.pointerId !== null
		)
			return;
		this.updatePointerNdcFromEvent(e);
		this.pointerId = e.pointerId;
		this.isDragging = true;
		this.dragMoved = false;
		this.dragStartX = e.clientX;
		this.dragStartY = e.clientY;
		this.lastInteractionTime = this.clock.getElapsedTime();

		this.raycaster.setFromCamera(this.pointerNdc, this.camera);
		const hits = this.raycaster.intersectObjects(this.getRaycastTargets(), true);
		const hitToyId =
			hits.length > 0 ? ((hits[0].object.userData.hotspotId as string | undefined) ?? null) : null;
		this.pointerDownToyId = hitToyId;
		const hitToy = this.findToyById(hitToyId);
		if (hitToy && !this.reducedMotion) {
			hitToy.scaleOffset = -0.07;
			hitToy.scaleVelocity = 0;
			hitToy.mesh.scale.set(1.05, 0.91, 1.05);
		}
	};

	private onPointerMove = (e: PointerEvent): void => {
		if (
			!this.renderer ||
			!this.inputEnabled ||
			(this.pointerId !== null && e.pointerId !== this.pointerId)
		)
			return;
		this.updatePointerNdcFromEvent(e);
		this.lastInteractionTime = this.clock.getElapsedTime();

		if (this.isDragging) {
			const dx = e.clientX - this.dragStartX;
			const dy = e.clientY - this.dragStartY;
			if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
				this.dragMoved = true;
			}
			const activeDragToy = this.findToyById(this.pointerDownToyId);
			if (!activeDragToy) {
				// Benarkan pengguna memutar pandangan kamera secara luas untuk menikmati kepulauan 360°
				this.targetYawOffset = Math.max(-1.35, Math.min(1.35, -dx * 0.0028));
				this.targetPitchOffset = Math.max(-0.32, Math.min(0.38, -dy * 0.0018));
				return;
			}
			// Drag prop pada plane mendatar dunia dan tukar semula ke koordinat tempatan pulau
			const parent = activeDragToy.mesh.parent;
			if (parent) {
				parent.updateWorldMatrix(true, false);
				this.tempWorldVec.copy(activeDragToy.spring.home).applyMatrix4(parent.matrixWorld);
			} else {
				this.tempWorldVec.copy(activeDragToy.spring.home);
			}
			this.pointerPlane.setFromNormalAndCoplanarPoint(
				new THREE.Vector3(0, 1, 0),
				this.tempWorldVec
			);
			this.raycaster.setFromCamera(this.pointerNdc, this.camera);
			const hit = this.raycaster.ray.intersectPlane(this.pointerPlane, this.tempPlanePoint);
			if (hit) {
				if (parent) parent.worldToLocal(hit);
				activeDragToy.spring.position.x = hit.x;
				activeDragToy.spring.position.z = hit.z;
				clampToySpring(activeDragToy.spring);
				activeDragToy.spring.velocity.x = (hit.x - activeDragToy.spring.home.x) * 2;
				activeDragToy.spring.velocity.z = (hit.z - activeDragToy.spring.home.z) * 2;
			}
			return;
		}

		this.raycaster.setFromCamera(this.pointerNdc, this.camera);
		const hits = this.raycaster.intersectObjects(this.getRaycastTargets(), true);
		let hitToyId: string | null = null;
		let hitIslandIdx: number | null = null;

		if (hits.length > 0) {
			const hitObj = hits[0].object;
			hitToyId = (hitObj.userData.hotspotId as string | undefined) ?? null;
			hitIslandIdx = (hitObj.userData.islandIndex as number | undefined) ?? null;
		}

		if (hitToyId !== this.hoveredToyId || hitIslandIdx !== this.hoveredIslandIndex) {
			this.hoveredToyId = hitToyId;
			this.hoveredIslandIndex = hitIslandIdx;
			this.refreshToyHighlights();
			const isClickable = Boolean(
				hitToyId || (hitIslandIdx !== null && hitIslandIdx !== this.activeStationIndex)
			);
			this.renderer.domElement.style.cursor = isClickable ? 'pointer' : 'grab';

			let hoverLabel: string | null = null;
			if (hitIslandIdx !== null && hitIslandIdx !== this.activeStationIndex && !hitToyId) {
				const st = STATIONS[hitIslandIdx];
				if (st) hoverLabel = `${st.code} · ${st.title[this.locale]}`;
			}
			this.callbacks.onHotspotHover?.(hitToyId, hoverLabel);
		}
	};

	private onPointerUp = (e: PointerEvent): void => {
		if (!this.isDragging || e.pointerId !== this.pointerId || e.button !== 0) return;
		this.updatePointerNdcFromEvent(e);
		const wasClick =
			!this.dragMoved &&
			Math.abs(e.clientX - this.dragStartX) <= 4 &&
			Math.abs(e.clientY - this.dragStartY) <= 4;
		const releasedToy = this.findToyById(this.pointerDownToyId);
		this.isDragging = false;
		this.pointerId = null;
		this.pointerDownToyId = null;

		if (!wasClick && releasedToy && !this.reducedMotion) {
			releasedToy.scaleVelocity = (releasedToy.scaleVelocity ?? 0) + 1.8;
		}

		if (wasClick && this.renderer && this.inputEnabled) {
			this.raycaster.setFromCamera(this.pointerNdc, this.camera);
			const hits = this.raycaster.intersectObjects(this.getRaycastTargets(), true);
			if (hits.length > 0) {
				const obj = hits[0].object;
				const hotspotId = obj.userData.hotspotId as string | undefined;
				const stationIdx = obj.userData.stationIndex as number | undefined;
				const islandIdx = obj.userData.islandIndex as number | undefined;

				if (hotspotId && typeof stationIdx === 'number') {
					this.selectHotspot(hotspotId);
					const clickedToy = this.findToyById(hotspotId);
					if (clickedToy) {
						this.triggerPropBounce(clickedToy);
						if (this.stationGroups.length > 0 && clickedToy.kind === 'laser_turret') {
							this.fireSecurityLaser(clickedToy.mesh);
						}
						this.emitToyStatus();
					}
					this.callbacks.onHotspotSelect?.(hotspotId, stationIdx);
				} else if (typeof islandIdx === 'number' && islandIdx !== this.activeStationIndex) {
					// Terbang terus ke pulau yang diklik di seberang lautan!
					this.selectHotspot(null);
					this.goToStation(islandIdx);
				}
			} else if (this.selectedToyId) {
				// Klik kawasan kosong luar prop: keluar zoom kembali ke panorama orbit!
				this.selectHotspot(null);
				this.callbacks.onHotspotSelect?.('', this.activeStationIndex);
			}
		}
	};

	public updateCamera(dt: number, elapsed = 0): void {
		let walkDir = 0;
		if (this.heldKeys.has('w') || this.heldKeys.has('arrowup')) walkDir += 1;
		if (this.heldKeys.has('s') || this.heldKeys.has('arrowdown')) walkDir -= 1;
		if (walkDir !== 0 && !this.selectedToyId) {
			this.setProgress(this.targetProgress + walkDir * dt * 0.085);
		}

		// Interpolasi sudut terpendek sepanjang gelung orbital 360° (0..1)
		let diff = this.targetProgress - this.currentProgress;
		if (diff > 0.5) diff -= 1;
		if (diff < -0.5) diff += 1;

		const lerpSpeed = this.reducedMotion ? 1 : Math.min(1, dt * 4.2);
		this.currentProgress = (this.currentProgress + diff * lerpSpeed + 1) % 1;

		this.smoothPointer.x += (this.pointerNdc.x - this.smoothPointer.x) * Math.min(1, dt * 4.5);
		this.smoothPointer.y += (this.pointerNdc.y - this.smoothPointer.y) * Math.min(1, dt * 4.5);

		const idleDuration = elapsed - this.lastInteractionTime;
		if (!this.isDragging && idleDuration > 2.5 && !this.reducedMotion) {
			const idleSway = Math.sin(elapsed * 0.42) * 0.16;
			this.targetYawOffset += (idleSway - this.targetYawOffset) * Math.min(1, dt * 1.5);
			this.targetPitchOffset += (0 - this.targetPitchOffset) * Math.min(1, dt * 1.5);
		}

		this.userYawOffset += (this.targetYawOffset - this.userYawOffset) * Math.min(1, dt * 6);
		this.userPitchOffset += (this.targetPitchOffset - this.userPitchOffset) * Math.min(1, dt * 6);

		const exactIndex = (this.currentProgress * STATION_ANCHORS.length) % STATION_ANCHORS.length;
		const nearestStation = Math.round(exactIndex) % STATION_ANCHORS.length;

		if (nearestStation !== this.activeStationIndex || Math.abs(diff) > 0.0004) {
			this.activeStationIndex = nearestStation;
			if (this.hoveredIslandIndex === nearestStation) {
				this.hoveredIslandIndex = null;
				this.callbacks.onHotspotHover?.(this.hoveredToyId, null);
			}
			this.callbacks.onStationChange?.(nearestStation, this.currentProgress);
		}

		// Sudut orbit & vektor asas dikongsi kedua-dua mod kamera (orbit & dive).
		const orbitAngle = this.currentProgress * Math.PI * 2;
		this.tempRadialOut.set(Math.sin(orbitAngle), 0, Math.cos(orbitAngle));
		const radialOut = this.tempRadialOut;
		this.tempTangentRight.set(Math.cos(orbitAngle), 0, -Math.sin(orbitAngle));
		const tangentRight = this.tempTangentRight;
		this.orbitalLoopCurve.getPointAt(this.currentProgress, this.tempAnchorPt);
		const anchorPt = this.tempAnchorPt;
		const stepBob = this.reducedMotion
			? 0
			: Math.sin(elapsed * 6.8) * Math.min(0.05, Math.abs(diff) * 1.5) +
				Math.sin(elapsed * 1.35) * 0.04;

		const focusToy = this.focusToyId ? this.findToyById(this.focusToyId) : null;
		const focusStationGroup = focusToy ? this.stationGroups[focusToy.stationIndex] : null;

		let camPos: THREE.Vector3;
		let lookTarget: THREE.Vector3;
		let targetFov = 46;

		if (focusToy && focusStationGroup) {
			// KAMERA DIVE MAKRO (Sesi 1): lengkung lancar dari orbit pulau ke pemeriksaan makro.
			focusStationGroup.updateWorldMatrix(true, false);
			this.tempFocusAnchor.copy(focusToy.spring.home).applyMatrix4(focusStationGroup.matrixWorld);
			this.tempFocusTarget.copy(this.tempFocusAnchor);
			this.tempFocusTarget.y += 0.95; // Bingkai pusat objek 3D di tengah lensa

			// Stabilkan settle 0->1; reduced motion memotong terus ke pose makro.
			this.focusSettle = this.reducedMotion ? 1 : Math.min(1, this.focusSettle + dt * 2.6);
			// Ease-out kubik bagi kesan dolly masuk sinematik.
			const k = 1 - Math.pow(1 - this.focusSettle, 3);

			// Orbit masa kini (diinterpolasi) ke stesen fokus supaya lengkok bermula dari titik semasa.
			const focusAngle = (focusToy.stationIndex / STATION_ANCHORS.length) * Math.PI * 2;
			const arcDirX = Math.sin(focusAngle);
			const arcDirZ = Math.cos(focusAngle);
			const aspect = this.camera.aspect;
			const macroAspectMul = aspect < 1.0 ? Math.min(1.5, 0.95 / aspect) : 1.0;
			const focusRadius = 3.2 * macroAspectMul;
			const focusLensY = 0.85; // Paras mata sedikit di atas objek, bukan menjunam curam
			const focusArc = 0.26;

			// Kedudukan makro: wangsa sedikit jejari & atas, mengelilingi dengan busur kecil.
			this.tempArcRadial.set(arcDirX, 0, arcDirZ);
			this.tempArcTangent.set(-arcDirZ, 0, arcDirX);
			const macroCam = this.tempMacroCam
				.copy(this.tempFocusTarget)
				.addScaledVector(this.tempArcRadial, focusRadius)
				.addScaledVector(this.tempArcTangent, 0.2);
			macroCam.y = this.tempFocusTarget.y + focusLensY;

			// Orbit sedia ada (pra-dive) bagi lengkok hibrid permulaan.
			const orbitAspectMul = aspect < 1.0 ? Math.min(2.1, 0.88 / aspect) : 1.0;
			const orbitCam = this.tempOrbitCam
				.copy(anchorPt)
				.addScaledVector(radialOut, 9.8 * orbitAspectMul)
				.addScaledVector(tangentRight, this.userYawOffset * 3.4);
			orbitCam.y = anchorPt.y + 3.25 * Math.sqrt(orbitAspectMul);

			camPos = this.tempCamPos.copy(orbitCam).lerp(macroCam, k);
			lookTarget = this.tempLookTarget
				.copy(this.tempFocusTarget)
				.lerp(this.tempFocusAnchor, 1 - k)
				.addScaledVector(this.tempArcRadial, -0.2 * (1 - k));
			if (this.reducedMotion) {
				lookTarget.copy(this.tempFocusTarget);
				camPos.copy(macroCam);
			}
			targetFov = 46 + (38 - 46) * k;
		} else {
			// Orbit panorama asal: Pembingkaian adaptif mengikut nisbah aspek.
			// Pada telefon/tablet potret (aspect < 1.0), kamera berundur secara harmoni
			// agar pulau dan 21 siluet prop dibingkai tepat di tengah tanpa sebarang pemotongan.
			this.focusSettle = 0;
			const aspect = this.camera.aspect;
			const aspectMultiplier = aspect < 1.0 ? Math.min(2.1, 0.88 / aspect) : 1.0;
			const camRadiusOffset = 9.8 * aspectMultiplier;
			const lateralShift = this.smoothPointer.x * 0.75 + this.userYawOffset * 3.4;
			camPos = this.tempCamPos
				.copy(anchorPt)
				.addScaledVector(radialOut, camRadiusOffset)
				.addScaledVector(tangentRight, lateralShift);
			camPos.y =
				anchorPt.y +
				2.9 * Math.sqrt(aspectMultiplier) +
				stepBob +
				this.smoothPointer.y * 0.3 +
				this.userPitchOffset * 1.8;
			lookTarget = this.tempLookTarget
				.copy(anchorPt)
				.addScaledVector(radialOut, -2.6)
				.addScaledVector(tangentRight, this.smoothPointer.x * 1.2 - this.userYawOffset * 4.2);
			lookTarget.y = anchorPt.y + 1.85 - this.userPitchOffset * 1.6;
		}

		// Interpolasi FOV memperhalus perubahan lensa.
		this.focusFov += (targetFov - this.focusFov) * Math.min(1, dt * 6);
		if (this.reducedMotion) this.focusFov = targetFov;
		if (this.focusFov > 0 && Math.abs(this.camera.fov - this.focusFov) > 0.01) {
			this.camera.fov = this.focusFov;
			this.camera.updateProjectionMatrix();
		}

		this.camera.position.copy(camPos);
		this.camera.lookAt(lookTarget);

		// Lampu sorot fokus stesen dinaikkan apabila kamera menyelam masuk, kembali apabila keluar.
		const focusStationIdx = focusToy?.stationIndex ?? -1;
		this.focusSpotIntensity +=
			((focusStationIdx >= 0 ? 2.6 : 0) - this.focusSpotIntensity) * Math.min(1, dt * 5);
		const isLight = this.theme === 'light';
		this.stationSpotLight.intensity = (isLight ? 2.8 : 2.6) + this.focusSpotIntensity;

		if (this.skyMesh) {
			this.skyMesh.position.copy(this.camera.position);
		}

		if (this.lastLightStationIndex !== this.activeStationIndex) {
			this.lastLightStationIndex = this.activeStationIndex;
			this.keyLight.position.set(anchorPt.x + 14, 26, anchorPt.z + 14);
			this.keyLight.target.position.copy(anchorPt);
			this.keyLight.target.updateMatrixWorld();
			this.stationSpotLight.position.set(anchorPt.x, anchorPt.y + 6.8, anchorPt.z);
			this.rimLight.position.set(anchorPt.x - 6, anchorPt.y + 5.0, anchorPt.z - 3);
		}
	}

	private updateProjectedMarkers(): void {
		if (!this.callbacks.onMarkersUpdate || !this.renderer) return;

		this.camera.updateMatrixWorld();
		const projected: ProjectedMarker[] = [];

		for (const toy of this.toys) {
			if (toy.stationIndex !== this.activeStationIndex) continue;

			const stationGroup = this.stationGroups[toy.stationIndex];
			if (!stationGroup) continue;

			this.tempWorldVec.copy(toy.spring.home).applyMatrix4(stationGroup.matrixWorld);
			this.tempWorldVec.y += 1.4;
			this.tempWorldVec.project(this.camera);

			const isInFront = this.tempWorldVec.z > -1 && this.tempWorldVec.z < 1;
			const screenX = (this.tempWorldVec.x * 0.5 + 0.5) * 100;
			const screenY = (-this.tempWorldVec.y * 0.5 + 0.5) * 100;
			const onScreen = isInFront && screenX > 6 && screenX < 94 && screenY > 8 && screenY < 90;

			const layers: LayerMarker[] = [];
			if (toy.id === this.focusToyId && toy.layers) {
				// Titik sauh 3 lapisan (Sesi 1): dipancarkan dari ruang dunia ke skrin mengikut bukaan semasa.
				for (const layer of toy.layers) {
					this.tempLayerAnchor
						.copy(layer.anchorLocal)
						.add(layer.root.position)
						.applyMatrix4(toy.mesh.matrixWorld);
					this.tempLayerAnchor.project(this.camera);
					const lx = (this.tempLayerAnchor.x * 0.5 + 0.5) * 100;
					const ly = (-this.tempLayerAnchor.y * 0.5 + 0.5) * 100;
					const lVisible =
						this.tempLayerAnchor.z > -1 &&
						this.tempLayerAnchor.z < 1 &&
						lx > 4 &&
						lx < 96 &&
						ly > 4 &&
						ly < 96;
					layers.push({
						layer: layer.id,
						x: lx,
						y: ly,
						visible: lVisible
					});
				}
			}

			projected.push({
				id: toy.id,
				stationIndex: toy.stationIndex,
				x: screenX,
				y: screenY,
				visible: onScreen,
				layers: layers.length ? layers : undefined
			});
		}

		this.callbacks.onMarkersUpdate(projected);
	}

	private animateScene(dt: number, elapsed: number): void {
		if (!this.reducedMotion) this.motionTime += dt;
		elapsed = this.motionTime;
		if (this.oceanMaterial) {
			this.oceanMaterial.uniforms.uTime.value = elapsed;
		}
		if (this.skyMaterial) {
			this.skyMaterial.uniforms.uTime.value = elapsed;
		}

		for (let i = 0; i < PULSE_COUNT; i++) {
			if (!this.reducedMotion) {
				this.pulseOffsets[i] = (this.pulseOffsets[i] + dt * this.pulseSpeeds[i]) % 1;
			}
			const sampleIdx = Math.floor(this.pulseOffsets[i] * 360) % 360;
			const pt = this.causewayLoopSamples[sampleIdx] ?? this.tempPulsePt;
			const dive = this.causewayLoopDives[sampleIdx] ?? 0;
			const rideY = PULSE_RIDE_Y - dive * 2.4;
			this.dummy.position.set(pt.x, rideY, pt.z);
			const scale = (0.75 + 0.35 * Math.sin(elapsed * 3.6 + i)) * (1 - dive * 0.85);
			this.dummy.scale.setScalar(scale);
			this.dummy.updateMatrix();
			this.pulseInstanced.setMatrixAt(i, this.dummy.matrix);
		}
		this.pulseInstanced.instanceMatrix.needsUpdate = true;

		if (this.motePoints) {
			this.motePoints.material.uniforms.uTime.value = elapsed;
		}

		if (!this.reducedMotion && !this.selectedToyId) this.buoyancyTime += dt;
		this.applyStationBuoyancy(this.buoyancyTime);

		// Putar cincin Teras Reaktor Pusat
		if (!this.reducedMotion) {
			for (let r = 0; r < this.centralReactorRings.length; r++) {
				const ring = this.centralReactorRings[r];
				ring.rotation.y = elapsed * (0.32 + r * 0.14);
				ring.rotation.x = Math.sin(elapsed * 0.4 + r) * 0.45;
			}
		}

		// Kemas kini fizik spring, lantunan skala (scale bounce) dan animasi setiap prop taktil
		for (let i = 0; i < this.toys.length; i++) {
			const toy = this.toys[i];
			stepToySpring(toy.spring, dt);
			toy.mesh.position.copy(toy.spring.position);

			if (!this.reducedMotion) {
				let s = toy.scaleOffset ?? 0;
				let sv = toy.scaleVelocity ?? 0;
				if (s !== 0 || sv !== 0) {
					const stepDt = Math.min(Math.max(dt, 0), 0.05);
					const substeps = Math.max(1, Math.ceil(stepDt / (1 / 120)));
					const h = stepDt / substeps;
					for (let k = 0; k < substeps; k++) {
						sv += (-165 * s - 11.5 * sv) * h;
						s += sv * h;
					}
					if (Math.abs(s) < 0.0005 && Math.abs(sv) < 0.002) {
						s = 0;
						sv = 0;
						toy.mesh.scale.set(1, 1, 1);
					} else {
						s = Math.max(-0.28, Math.min(0.42, s));
						toy.mesh.scale.set(1 + s * 0.85, 1 + s * 1.18, 1 + s * 0.85);
					}
					toy.scaleOffset = s;
					toy.scaleVelocity = sv;
				}

				// Putaran mengikut jenis prop (semua pepejal 3D; meriam mengimbas sasaran tanpa membelakanginya)
				if (toy.kind === 'ai_lens') {
					toy.spinAxis.rotation.y = Math.max(-0.6, Math.min(0.6, this.smoothPointer.x * 0.6));
					toy.spinAxis.rotation.x = Math.max(-0.35, Math.min(0.35, -this.smoothPointer.y * 0.35));
				} else if (toy.kind === 'laser_turret') {
					toy.spinAxis.rotation.y = Math.sin(elapsed * 1.15 + i * 1.3) * 0.28;
				} else if (toy.spinAxis) {
					toy.spinAxis.rotation.y += dt * (toy.spinSpeed || 0.42);
				}
				// Redamkan kelajuan putaran ekstra kembali ke rehat
				if (toy.spinSpeed > 0.42) {
					toy.spinSpeed = Math.max(0.42, toy.spinSpeed - dt * 0.65);
				}
			}

			// Exploded 3-Lapisan (Sesi 1): lapisan terangkat/bercantum dengan spring ringan semasa fokus.
			const isFocusToy = toy.id === this.focusToyId;
			const targetExploded = isFocusToy ? 1 : 0;
			const currentExploded = toy.exploded ?? 0;
			const rate = this.reducedMotion ? 1 : Math.min(1, dt * 3.4);
			const nextExploded = currentExploded + (targetExploded - currentExploded) * rate;
			toy.exploded = this.reducedMotion
				? targetExploded
				: Math.abs(targetExploded - nextExploded) < 0.0005
					? targetExploded
					: nextExploded;

			if (toy.layers) {
				const explodeAmount = toy.exploded ?? 0;
				for (const layer of toy.layers) {
					layer.root.position.set(
						layer.offset.x * explodeAmount,
						layer.offset.y * explodeAmount,
						layer.offset.z * explodeAmount
					);
				}
			}
		}

		// Cooldown timer bagi toy bounce
		if (!this.toyReady) {
			this.springElapsed += dt;
			if (this.springElapsed >= TOY_COOLDOWN) {
				this.toyReady = true;
				this.emitToyStatus();
			}
		}

		// Animasi laser siber & cooldown
		if (this.laserUntil > 0) {
			this.laserUntil -= dt;
			if (this.laserBeamMat) {
				this.laserBeamMat.opacity = Math.max(0, this.laserUntil / LASER_DURATION);
			}
			if (this.laserTargetGlow) {
				const pulse = 1.0 + Math.sin(elapsed * 24.0) * 0.35;
				this.laserTargetGlow.scale.setScalar(pulse);
			}
			if (this.laserUntil <= 0) {
				this.clearLaserEffect();
				this.laserReady = true;
				this.emitToyStatus();
			}
		}

		if (!this.reducedMotion) {
			const radarSpeed = 0.35 + this.cyberPulseLevel * 1.5;
			if (this.radarRotor) this.radarRotor.rotation.y = elapsed * radarSpeed;
			for (let i = 0; i < this.rotatingBeacons.length; i++) {
				const b = this.rotatingBeacons[i];
				b.rotation.z = elapsed * ((0.55 + (i % 3) * 0.2) * (1 + this.cyberPulseLevel));
				if (i % 3 === 0) {
					const pulse = 1 + Math.sin(elapsed * 6 * (1 + this.cyberPulseLevel)) * 0.06;
					b.scale.setScalar(pulse);
				}
			}
		}
	}

	private startLoop(): void {
		if (this.rafId !== null) return;
		this.active = true;
		this.governorLastTimestamp = 0;
		const tick = () => {
			this.rafId = requestAnimationFrame(tick);
			const nowMs = typeof performance !== 'undefined' ? performance.now() : 0;
			const rawDt =
				this.governorLastTimestamp > 0 && nowMs > this.governorLastTimestamp
					? (nowMs - this.governorLastTimestamp) / 1000
					: 0;
			this.governorLastTimestamp = nowMs;

			const dt = Math.min(this.clock.getDelta?.() ?? 0.016, 0.05);
			const elapsed = this.clock.getElapsedTime();

			if (this.renderer && rawDt > 0) {
				const downgradedTier = recordQualityGovernorFrame(this.qualityGovernor, rawDt);
				if (downgradedTier) {
					this.setQualityTier(downgradedTier);
				}
				this.fpsFrameCount++;
				if (this.fpsLastTimestamp === 0) {
					this.fpsLastTimestamp = nowMs;
				} else if (nowMs - this.fpsLastTimestamp >= 1000) {
					const liveFps = Math.round((this.fpsFrameCount * 1000) / (nowMs - this.fpsLastTimestamp));
					if (typeof window !== 'undefined') {
						window.__fps = liveFps;
					}
					this.fpsFrameCount = 0;
					this.fpsLastTimestamp = nowMs;
				}
			}

			if (!this.isMobile && this.renderer && this.qualityTier === 'lite') {
				if (dt > 0.032) {
					this.consecutiveSlowFrames++;
					this.consecutiveFastFrames = 0;
					if (this.consecutiveSlowFrames > 8 && this.currentPixelRatio > 0.8) {
						this.currentPixelRatio = Math.max(0.8, this.currentPixelRatio - 0.1);
						this.renderer.setPixelRatio(this.currentPixelRatio);
						this.composer?.setPixelRatio(this.currentPixelRatio);
						this.consecutiveSlowFrames = 0;
					}
				} else if (dt < 0.018) {
					this.consecutiveFastFrames++;
					this.consecutiveSlowFrames = 0;
					if (this.consecutiveFastFrames > 120 && this.currentPixelRatio < this.basePixelRatio) {
						this.currentPixelRatio = Math.min(this.basePixelRatio, this.currentPixelRatio + 0.05);
						this.renderer.setPixelRatio(this.currentPixelRatio);
						this.composer?.setPixelRatio(this.currentPixelRatio);
						this.consecutiveFastFrames = 0;
					}
				}
			}

			this.animateScene(dt, elapsed);
			this.updateCamera(dt, elapsed);
			this.updateProjectedMarkers();
			if (this.xrayLensPass) {
				this.updateXRayLens(
					dt,
					Math.max(this.container.clientWidth, 1),
					Math.max(this.container.clientHeight, 1)
				);
			}

			if (!this.firstFrameNotified) {
				this.firstFrameNotified = true;
				this.callbacks.onProgress?.(
					100,
					this.locale === 'ms'
						? 'Sistem Beroperasi Sepenuhnya · 360° Sedia'
						: 'System Fully Operational · 360° Ready'
				);
				this.callbacks.onReady?.();
			}

			if (this.renderer) {
				if (this.composer && this.qualityTier !== 'lite') {
					this.composer.render(dt);
				} else {
					this.renderer.render(this.scene, this.camera);
				}
			}
		};
		this.rafId = requestAnimationFrame(tick);
	}

	public dispose(): void {
		this.disposed = true;
		if (typeof window !== 'undefined') {
			if (window.__SPINE_WORLD__ === this) {
				delete window.__SPINE_WORLD__;
			}
			if (window.__screenWorld === this) {
				delete window.__screenWorld;
			}
		}
		this.glbLoader.dispose();
		this.clearLaserEffect();
		this.disposeXRayFiberLayer();
		if (this.rafId !== null) {
			cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}
		if (this.renderer) {
			this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
		}
		window.removeEventListener('pointermove', this.onPointerMove);
		window.removeEventListener('pointerup', this.onPointerUp);
		window.removeEventListener('pointercancel', this.onPointerCancel);
		window.removeEventListener('keydown', this.onKeyDown);
		window.removeEventListener('keyup', this.onKeyUp);
		window.removeEventListener('blur', this.onWindowBlur);

		this.disposePostProcessing();

		for (const sh of this.stationHeaders) {
			sh.texture.dispose();
		}
		if (this.studioEnvHandle) {
			this.studioEnvHandle.dispose();
			this.studioEnvHandle = null;
			this.envTexture = null;
		} else if (this.envTexture) {
			this.envTexture.dispose();
			this.envTexture = null;
		}
		if (this.pbrMaps) {
			this.pbrMaps.normalMap.dispose();
			this.pbrMaps.roughnessMap.dispose();
			this.pbrMaps.metalnessMap.dispose();
			this.pbrMaps.deckNormalMap.dispose();
			this.pbrMaps = null;
		}

		this.scene.traverse((obj) => {
			const mesh = obj as THREE.Mesh;
			if (mesh.geometry) mesh.geometry.dispose();
			if (mesh.material) {
				if (Array.isArray(mesh.material)) {
					mesh.material.forEach((m) => m.dispose());
				} else {
					mesh.material.dispose();
				}
			}
		});
		if (this.renderer) {
			this.renderer.dispose();
			this.renderer = null;
		}
	}
}
