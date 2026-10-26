import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { STATIONS, PROFILE, type Locale, type HotspotItem, type SpineStation } from './spine-data';
import {
	resolveExhibitView,
	getHotspotLocation,
	type ExhibitAction,
	type ExhibitRoute,
	type ExhibitView
} from './exhibit-navigation';
import {
	drawExhibitScreen,
	hitTestScreen,
	getInspectDistance,
	EXHIBIT_MIN_WIDTH,
	EXHIBIT_MIN_HEIGHT,
	type ExhibitPalette,
	type ScreenHitRegion
} from './exhibit-screen';

export type ThemeMode = 'dark' | 'light';

export interface ProjectedMarker {
	id: string;
	stationIndex: number;
	x: number;
	y: number;
	visible: boolean;
}

export interface ExhibitScreenSnapshot {
	hotspotId: string;
	view: ExhibitView;
	regions: ScreenHitRegion[];
	width: number;
	height: number;
	page: number;
	pageCount: number;
}

export interface ProjectedScreenFrame {
	left: number;
	top: number;
	width: number;
	height: number;
	ready: boolean;
}

export interface WorldCallbacks {
	onStationChange?: (stationIndex: number, progress: number) => void;
	onHotspotHover?: (hotspotId: string | null, hoverLabel?: string | null) => void;
	onHotspotSelect?: (hotspotId: string, stationIndex: number) => void;
	onMarkersUpdate?: (markers: ProjectedMarker[]) => void;
	onScreenUpdate?: (screen: ExhibitScreenSnapshot | null) => void;
	onScreenProjection?: (frame: ProjectedScreenFrame | null) => void;
	onOpenDossier?: () => void;
}

interface HotspotRecord {
	id: string;
	stationIndex: number;
	hotspot: HotspotItem;
	mesh: THREE.Group;
	propObject: THREE.Object3D;
	anchorLocal: THREE.Vector3;
	screenMat: THREE.MeshStandardMaterial;
	screenMesh: THREE.Mesh;
	panelMeshes: THREE.Mesh[];
	screenWidth: number;
	screenHeight: number;
	regions: ScreenHitRegion[];
	frameMat: THREE.MeshPhysicalMaterial;
	accentMat: THREE.MeshStandardMaterial;
	canvas: HTMLCanvasElement;
	texture: THREE.CanvasTexture;
	baseY: number;
	currentLift: number;
}

interface StationHeaderRecord {
	station: SpineStation;
	canvas: HTMLCanvasElement;
	texture: THREE.CanvasTexture;
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
const EXHIBIT_PROP_HEIGHT = 3.32;
const EXHIBIT_PROP_BOB = 0.04;

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
		for (int i = 0; i < 6; i++) {
			float islandDist = length(worldInitial.xz - uIslands[i].xz);
			islandClearance = min(islandClearance, smoothstep(12.6, 17.4, islandDist));
		}

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
	uniform float uSunSpecScale;
	uniform vec3 uIslands[6];

	varying vec3 vWorldPos;
	varying vec3 vNormal;
	varying float vJacobian;
	varying float vElevation;

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

		// Jarak ke 6 pulau stesen & teras pusat (0,0)
		float minIslandDist = length(vWorldPos.xz);
		for (int i = 0; i < 6; i++) {
			float d = length(vWorldPos.xz - uIslands[i].xz);
			minIslandDist = min(minIslandDist, d);
		}

		// Cincin Koral & Tunjang Optik Bawah Laut pada R = 38m dan jejari ke pusat
		float ringDist = abs(length(vWorldPos.xz) - 38.0);
		float shallowLagoon = max(1.0 - smoothstep(6.0, 14.0, minIslandDist), (1.0 - smoothstep(1.5, 5.5, ringDist)) * 0.58);
		baseWater = mix(baseWater, uWaterScatter * 0.78, shallowLagoon * 0.52);

		float cablePulse = 0.65 + 0.35 * sin(length(vWorldPos.xz) * 0.5 - uTime * 3.8);
		float ringGlow = exp(-ringDist * 0.85) * cablePulse;
		vec3 subseaCableColor = vec3(0.08, 0.78, 0.96) * ringGlow * 0.42;

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
		color = mix(color, foamColor, totalFoam);

		float fogFactor = smoothstep(48.0, 175.0, dist);
		color = mix(color, uFogColor, fogFactor);

		gl_FragColor = vec4(color, 1.0);
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

	float noise2D(vec2 p) {
		vec2 i = floor(p);
		vec2 f = fract(p);
		float a = hash21(i);
		float b = hash21(i + vec2(1.0, 0.0));
		float c = hash21(i + vec2(0.0, 1.0));
		float d = hash21(i + vec2(1.0, 1.0));
		vec2 u = f * f * (3.0 - 2.0 * f);
		return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
	}

	float fbm(vec2 p) {
		float v = 0.0;
		float a = 0.5;
		mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
		for (int i = 0; i < 2; i++) {
			v += a * noise2D(p);
			p = rot * p * 2.02;
			a *= 0.5;
		}
		return v;
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

		if (dir.y > 0.015) {
			vec2 cloudUv = (dir.xz / (dir.y + 0.16)) * 0.5 + vec2(uTime * 0.01, -uTime * 0.007);
			float c1 = fbm(cloudUv);
			float c2 = fbm(cloudUv * 2.15 + vec2(1.7, -2.3));
			float cloudDensity = smoothstep(0.48, 0.78, c1 * 0.72 + c2 * 0.28)
				* smoothstep(0.015, 0.22, dir.y)
				* smoothstep(0.92, 0.34, dir.y);

			vec3 cloudLit = mix(uSkyHorizon * 1.05, uSunColor + vec3(0.18), 0.45 + 0.35 * pow(sunCos, 4.0));
			vec3 cloudShadow = mix(uSkyZenith * 0.65, uSkyHorizon * 0.78, 0.5);
			vec3 cloudCol = mix(cloudShadow, cloudLit, smoothstep(0.32, 0.78, c2));
			sky = mix(sky, cloudCol, cloudDensity * 0.62);
		}

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
	}
`;

function createBeveledSlabGeometry(
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

export class FiberSpineWorld {
	private container: HTMLElement;
	private callbacks: WorldCallbacks;
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private renderer: THREE.WebGLRenderer | null = null;
	private composer: EffectComposer | null = null;
	private bloomPass: UnrealBloomPass | null = null;
	private basePixelRatio = 1;
	private currentPixelRatio = 1;
	private envTexture: THREE.Texture | null = null;
	private pbrMaps: PBRSurfaceMaps | null = null;
	private orbitalLoopCurve: THREE.CatmullRomCurve3;
	private causewayLoopCurve: THREE.CatmullRomCurve3;

	private targetProgress = 0;
	private currentProgress = 0;
	private activeStationIndex = 0;
	private selectedHotspotId: string | null = null;
	private hoveredHotspotId: string | null = null;
	private hoveredIslandIndex: number | null = null;
	private theme: ThemeMode = 'dark';
	private locale: Locale = 'ms';
	private reducedMotion = false;
	private weatherPresetId = 'golden_horizon';

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

	private raycaster = new THREE.Raycaster();
	private hotspots: HotspotRecord[] = [];
	private stationHeaders: StationHeaderRecord[] = [];
	private interactableMeshes: THREE.Object3D[] = [];
	private stationGroups: THREE.Group[] = [];
	private rotatingBeacons: THREE.Object3D[] = [];
	private radarRotor: THREE.Group | null = null;
	private centralReactorRings: THREE.Object3D[] = [];
	private glowMaterials: THREE.MeshStandardMaterial[] = [];
	private pulseMat: THREE.MeshBasicMaterial | null = null;
	private active = true;
	private inputEnabled = true;
	private interactionRoots: THREE.Object3D[] = [];
	private disposed = false;
	private screenPalette: ExhibitPalette | null = null;
	private profileImage: HTMLImageElement | null = null;
	private screenRoute: ExhibitRoute | null = null;
	private screenHistory: Array<{ route: ExhibitRoute; page: number }> = [];
	private screenPage = 0;
	private screenPageCount = 1;
	private hoveredRegionId: string | null = null;
	private focusedRegionId: string | null = null;
	private pressedRegionId: string | null = null;
	private pointerDownRegionId: string | null = null;
	private pointerId: number | null = null;
	private screenReady = false;
	private screenTransition = 1;
	private screenChangeDuration = 0.3;
	private previousScreen: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | null = null;
	private previousScreenRecord: HotspotRecord | null = null;
	private projectionCorners = Array.from({ length: 4 }, () => new THREE.Vector3());
	private screenFrame: ProjectedScreenFrame = {
		left: 0,
		top: 0,
		width: 0,
		height: 0,
		ready: false
	};

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

	private clock = new THREE.Clock();
	private rafId: number | null = null;
	private resizeObserver: ResizeObserver | null = null;
	private tempWorldVec = new THREE.Vector3();
	private tempPulsePt = new THREE.Vector3();
	private inspectBlend = 0;
	private currentInspectCamPos = new THREE.Vector3();
	private currentInspectLookAt = new THREE.Vector3();
	private targetInspectCamPos = new THREE.Vector3();
	private targetInspectLookAt = new THREE.Vector3();
	private tempQuat = new THREE.Quaternion();
	private tempNormal = new THREE.Vector3();
	private tempTangent = new THREE.Vector3();
	private tempScreenCenter = new THREE.Vector3();

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
			const dpr = this.isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.25);
			this.basePixelRatio = dpr;
			this.currentPixelRatio = dpr;
			this.renderer.setPixelRatio(dpr);
			// Biasan separuh resolusi; teks OLED kekal pada resolusi penuh.
			this.renderer.transmissionResolutionScale = 0.5;
			this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
			this.renderer.toneMappingExposure = 1.02;
			this.renderer.outputColorSpace = THREE.SRGBColorSpace;
			this.renderer.shadowMap.enabled = true;
			this.renderer.shadowMap.type = THREE.PCFShadowMap;

			const width = Math.max(this.container.clientWidth, 1);
			const height = Math.max(this.container.clientHeight, 1);
			this.renderer.setSize(width, height);
			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();

			this.renderer.domElement.style.touchAction = 'none';
			this.container.appendChild(this.renderer.domElement);

			const pmrem = new THREE.PMREMGenerator(this.renderer);
			pmrem.compileEquirectangularShader();
			const roomEnv = new RoomEnvironment();
			this.envTexture = pmrem.fromScene(roomEnv, 0.035).texture;
			this.scene.environment = this.envTexture;
			this.scene.environmentIntensity = 1.15;
			roomEnv.dispose();
			pmrem.dispose();

			const rt = new THREE.WebGLRenderTarget(width * dpr, height * dpr, {
				samples: 0,
				type: THREE.HalfFloatType
			});
			this.composer = new EffectComposer(this.renderer, rt);
			this.composer.setPixelRatio(dpr);
			this.composer.setSize(width, height);
			const renderPass = new RenderPass(this.scene, this.camera);
			this.bloomPass = new UnrealBloomPass(
				new THREE.Vector2(Math.round(width * 0.5), Math.round(height * 0.5)),
				0.04,
				0.18,
				1.0
			);
			const outputPass = new OutputPass();
			this.composer.addPass(renderPass);
			this.composer.addPass(this.bloomPass);
			this.composer.addPass(outputPass);
		} catch {
			return false;
		}

		this.readScreenPalette();
		this.pbrMaps = this.generatePBRSurfaceMaps();

		this.setupLights();
		this.buildSkyAndOcean();
		this.buildCentralSovereignReactor();
		this.buildOrbitalRingCauseway();
		this.buildArchipelagoStations();
		this.applyWeatherAndTheme();
		this.attachEvents();
		this.updateCamera(0, 0);
		this.startLoop();
		void document.fonts?.ready.then(() => {
			if (!this.disposed) this.redrawAllCanvases();
		});

		return true;
	}

	private readScreenPalette(): void {
		const style = getComputedStyle(document.documentElement);
		const token = (name: string) => style.getPropertyValue(name).trim();
		// Token --screen-* mengekalkan skrin boleh dibaca tanpa mencerahkan palet global.
		this.screenPalette = {
			background: token('--screen-bg') || token('--bg'),
			surface: token('--screen-surface') || token('--surface'),
			text: token('--ink'),
			muted: token('--ink-secondary'),
			accent: token('--badge-ink'),
			border: token('--surface-border-hover'),
			hover: token('--screen-surface-hover') || token('--surface-hover'),
			onAccent: token('--on-accent'),
			online: token('--screen-online'),
			halo: token('--screen-halo'),
			fontBody: token('--font-body'),
			fontMono: token('--font-mono') || token('--font-body')
		};
		const duration = parseFloat(token('--duration-normal'));
		if (Number.isFinite(duration)) this.screenChangeDuration = duration / 1000;
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
			metalness: 0.6,
			roughness: Math.min(0.92, roughness + 0.42),
			normalMap: this.pbrMaps?.normalMap ?? null,
			normalScale: new THREE.Vector2(0.22, 0.22),
			roughnessMap: this.pbrMaps?.roughnessMap ?? null,
			metalnessMap: this.pbrMaps?.metalnessMap ?? null,
			emissive: accentHex ?? 0x000000,
			emissiveIntensity: accentHex ? 0.04 : 0.0,
			envMapIntensity: 0.7
		});
	}

	private createOpticalGlassMaterial(tintHex = 0x38bdf8): THREE.MeshPhysicalMaterial {
		return new THREE.MeshPhysicalMaterial({
			color: tintHex,
			metalness: 0.05,
			roughness: 0.18,
			ior: 1.45,
			envMapIntensity: 0.85,
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
		// Bekukan pose semasa (bukan snap ke sifar) supaya kamera inspect tidak tersentak.
		if (this.reducedMotion || this.selectedHotspotId) return;
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
			bollard.castShadow = true;
			group.add(bollard);

			const cap = new THREE.Mesh(new THREE.SphereGeometry(0.21, 12, 10), glowMat);
			cap.position.set(Math.sin(ang) * 12.05, 0.9, Math.cos(ang) * 12.05);
			group.add(cap);
		}

		// Monumen Kejuruteraan Pusat Pulau (Berbeza untuk setiap Stesen CV!)
		const monumentGroup = new THREE.Group();
		monumentGroup.position.set(0, LOCAL_DECK_HEIGHT, -1.8);

		const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 2.05, 0.55, 32), titaniumMat);
		plinth.position.y = 0.28;
		plinth.castShadow = true;
		plinth.receiveShadow = true;
		monumentGroup.add(plinth);

		if (stationIndex === 0) {
			// Stesen 01: Kubah Balai Cerap Giroskopik (Sovereign Core)
			const sphere = new THREE.Mesh(new THREE.OctahedronGeometry(1.15, 2), glassMat);
			sphere.position.y = 2.2;
			monumentGroup.add(sphere);
			for (let r = 0; r < 3; r++) {
				const gim = new THREE.Mesh(
					new THREE.TorusGeometry(1.45 + r * 0.28, 0.045, 16, 64),
					r === 1 ? glowMat : chromeMat
				);
				gim.position.y = 2.2;
				gim.rotation.set(r * 0.6, r * 0.9, 0);
				monumentGroup.add(gim);
				this.rotatingBeacons.push(gim);
			}
		} else if (stationIndex === 1) {
			// Stesen 02: Menara Kluster Pelayan Enterprise YHCM & Nova Bitara
			for (let t = 0; t < 3; t++) {
				const ang = (t / 3) * Math.PI * 2;
				const tower = new THREE.Mesh(
					createBeveledSlabGeometry(0.95, 3.2, 0.95, 0.08, 0.03),
					titaniumMat
				);
				tower.position.set(Math.sin(ang) * 0.95, 2.1, Math.cos(ang) * 0.95);
				tower.rotation.y = ang;
				tower.castShadow = true;
				monumentGroup.add(tower);
			}
			const dataHalo = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.04, 16, 64), glowMat);
			dataHalo.rotation.x = Math.PI / 2;
			dataHalo.position.y = 3.2;
			monumentGroup.add(dataHalo);
			this.rotatingBeacons.push(dataHalo);
		} else if (stationIndex === 2) {
			// Stesen 03: Kubah Radar Pertahanan Siber TNB SOC — Cangkang 3D dwi-permukaan tebal
			const pts: THREE.Vector2[] = [];
			for (let i = 0; i <= 20; i++) {
				const t = i / 20;
				pts.push(new THREE.Vector2(t * 1.65, t * t * 0.85));
			}
			for (let i = 20; i >= 0; i--) {
				const t = i / 20;
				pts.push(new THREE.Vector2(t * 1.57, t * t * 0.85 + 0.05));
			}
			// Letakkan radar di atas gerbang, bukan pada garis pandang papan tengah.
			const radarMast = new THREE.Mesh(
				new THREE.CylinderGeometry(0.12, 0.28, 4.7, 20),
				titaniumMat
			);
			radarMast.position.set(0, 2.9, -0.6);
			radarMast.castShadow = true;
			monumentGroup.add(radarMast);

			this.radarRotor = new THREE.Group();
			this.radarRotor.position.set(0, 5.22, -0.6);
			monumentGroup.add(this.radarRotor);

			chromeMat.side = THREE.DoubleSide;
			const radarDish = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), chromeMat);
			radarDish.scale.setScalar(0.32);
			radarDish.rotation.x = Math.PI * 0.18;
			radarDish.castShadow = true;
			this.radarRotor.add(radarDish);

			// Suapan antena teras SOC di tengah mangkuk radar
			const hornPylon = new THREE.Mesh(
				new THREE.CylinderGeometry(0.045, 0.08, 0.72, 16),
				titaniumMat
			);
			hornPylon.position.y = 0.36;
			radarDish.add(hornPylon);

			const hornEmitter = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), glowMat);
			hornEmitter.position.y = 0.72;
			radarDish.add(hornEmitter);
		} else if (stationIndex === 3) {
			// Stesen 04: Prisma Lensa Visi Komputer OpenCV & Projek AI
			const lensBarrel = new THREE.Mesh(
				new THREE.CylinderGeometry(1.25, 1.35, 0.9, 36),
				titaniumMat
			);
			lensBarrel.rotation.x = Math.PI / 2;
			lensBarrel.position.y = 2.2;
			monumentGroup.add(lensBarrel);

			const opticGlass = new THREE.Mesh(new THREE.SphereGeometry(1.05, 32, 32), glassMat);
			opticGlass.scale.set(1, 1, 0.45);
			opticGlass.position.y = 2.2;
			monumentGroup.add(opticGlass);
		} else if (stationIndex === 4) {
			// Stesen 05: 5 Kristal Kemahiran Teknikal Terapung
			for (let c = 0; c < 5; c++) {
				const ang = (c / 5) * Math.PI * 2;
				const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), glassMat);
				crystal.position.set(Math.sin(ang) * 1.35, 2.1 + (c % 2) * 0.35, Math.cos(ang) * 1.35);
				monumentGroup.add(crystal);
				this.rotatingBeacons.push(crystal);
			}
		} else {
			// Stesen 06: Menara Rumah Api Komunikasi UTM & Cisco
			const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.85, 3.6, 24), titaniumMat);
			spire.position.y = 2.3;
			spire.castShadow = true;
			monumentGroup.add(spire);

			const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), glowMat);
			beacon.position.y = 4.25;
			monumentGroup.add(beacon);
		}

		group.add(monumentGroup);
	}

	/** Papan arah ringkas; butiran CV dibaca pada terminal, bukan gerbang. */
	private drawStationHeaderCanvas(canvas: HTMLCanvasElement, station: SpineStation): void {
		const ctx = canvas.getContext('2d');
		const palette = this.screenPalette;
		if (!ctx || !palette) return;
		const w = canvas.width;
		const h = canvas.height;
		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = palette.background;
		ctx.fillRect(0, 0, w, h);
		ctx.fillStyle = palette.accent;
		ctx.font = `600 30px ${palette.fontMono}`;
		ctx.fillText(station.shortTab[this.locale], 56, 60);
		ctx.fillStyle = palette.text;
		ctx.font = `700 58px ${palette.fontBody}`;
		this.wrapCanvasText(ctx, station.title[this.locale], 56, 134, w - 112, 66, 2);
		ctx.fillStyle = palette.muted;
		ctx.font = `500 28px ${palette.fontBody}`;
		ctx.fillText(
			this.locale === 'ms' ? 'Pilih terminal untuk meneroka' : 'Select a terminal to explore',
			56,
			h - 34
		);
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
			createBeveledSlabGeometry(8.2, 1.43, 0.16, 0.05, 0.02),
			pillarMat
		);
		signBacking.position.set(0, 4.38, 0);
		archGroup.add(signBacking);

		const signMat = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
		const signFace = new THREE.Mesh(new THREE.PlaneGeometry(8.0, 1.33), signMat);
		signFace.position.set(0, 4.38, 0.09);
		archGroup.add(signFace);

		this.stationHeaders.push({ station, canvas, texture });
		group.add(archGroup);
	}

	private drawHotspotExhibitCanvas(canvas: HTMLCanvasElement, hotspot: HotspotItem): void {
		if (!this.screenPalette) return;
		const inspecting = hotspot.id === this.selectedHotspotId;
		const view = resolveExhibitView(
			inspecting && this.screenRoute ? this.screenRoute : { kind: 'hotspot', id: hotspot.id }
		);
		if (!view) return;
		const location = getHotspotLocation(hotspot.id);
		const siblings = STATIONS[location?.stationIndex ?? 0].hotspots;
		// Potret hanya milik papan ringkasan profil; terminal lain kekal tanpa gambar.
		const isProfileSummary = hotspot.id === 'core-monolith' && view.code === 'PROFIL-01';
		const layout = drawExhibitScreen(
			canvas,
			{
				view,
				locale: this.locale,
				inspecting,
				canBack: this.screenHistory.length > 0,
				index: siblings.findIndex((item) => item.id === hotspot.id),
				total: siblings.length,
				page: inspecting ? this.screenPage : 0,
				hoveredId: inspecting ? this.hoveredRegionId : null,
				focusedId: inspecting ? this.focusedRegionId : null,
				pressedId: inspecting ? this.pressedRegionId : null,
				avatar: isProfileSummary ? this.profileImage : null
			},
			this.screenPalette
		);
		const record = this.hotspots.find((item) => item.id === hotspot.id);
		if (record) record.regions = layout.regions;
		if (inspecting) {
			this.screenPage = layout.page;
			this.screenPageCount = layout.pageCount;
			this.callbacks.onScreenUpdate?.({
				hotspotId: hotspot.id,
				view,
				regions: layout.regions,
				width: canvas.width,
				height: canvas.height,
				page: layout.page,
				pageCount: layout.pageCount
			});
		}
	}

	private resizeExhibit(record: HotspotRecord, inspecting: boolean): void {
		// Saiz logik mengikut keluasan monitor terunjur; geometri fizikal kekal 2.66 × 1.7.
		const ratio = 2.66 / 1.7;
		const width = inspecting
			? Math.max(
					EXHIBIT_MIN_WIDTH,
					Math.ceil(EXHIBIT_MIN_HEIGHT * ratio),
					Math.round(
						Math.min(this.container.clientWidth, this.container.clientHeight * ratio) * 0.88
					)
				)
			: 1440;
		const height = inspecting ? Math.max(EXHIBIT_MIN_HEIGHT, Math.round(width / ratio)) : 920;
		if (record.canvas.width === width && record.canvas.height === height) return;
		record.canvas.width = width;
		record.canvas.height = height;
		const texture = new THREE.CanvasTexture(record.canvas);
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.anisotropy = record.texture.anisotropy;
		record.texture.dispose();
		record.texture = texture;
		record.screenMat.map = texture;
		record.screenMat.emissiveMap = texture;
	}

	private redrawSelectedScreen(): void {
		const record = this.hotspots.find((item) => item.id === this.selectedHotspotId);
		if (!record) return;
		this.drawHotspotExhibitCanvas(record.canvas, record.hotspot);
		record.texture.needsUpdate = true;
	}

	private clearScreenTransition(): void {
		if (this.previousScreen) {
			this.previousScreen.removeFromParent();
			this.previousScreen.material.map?.dispose();
			this.previousScreen.material.dispose();
			this.previousScreen.geometry.dispose();
			this.previousScreen = null;
		}
		if (this.previousScreenRecord) this.previousScreenRecord.screenMat.opacity = 1;
		this.previousScreenRecord = null;
		this.screenTransition = 1;
		this.screenReady = Boolean(this.selectedHotspotId);
	}

	private updateScreenTransition(dt: number): void {
		if (!this.previousScreen) return;
		this.screenTransition =
			this.reducedMotion || this.screenChangeDuration <= 0
				? 1
				: Math.min(1, this.screenTransition + dt / this.screenChangeDuration);
		this.previousScreen.material.opacity = 1 - this.screenTransition;
		if (this.screenTransition >= 1) this.clearScreenTransition();
	}

	private beginScreenTransition(): void {
		this.clearScreenTransition();
		if (this.reducedMotion) return;
		const record = this.hotspots.find((item) => item.id === this.selectedHotspotId);
		if (!record) return;
		const copy = document.createElement('canvas');
		copy.width = record.canvas.width;
		copy.height = record.canvas.height;
		copy.getContext('2d')?.drawImage(record.canvas, 0, 0);
		const texture = new THREE.CanvasTexture(copy);
		texture.colorSpace = THREE.SRGBColorSpace;
		this.previousScreen = new THREE.Mesh(
			new THREE.PlaneGeometry(record.screenWidth, record.screenHeight),
			new THREE.MeshBasicMaterial({
				map: texture,
				transparent: true,
				toneMapped: false,
				depthWrite: false
			})
		);
		this.previousScreen.position.set(0, 1.52, 0.097);
		record.mesh.add(this.previousScreen);
		this.previousScreenRecord = record;
		this.screenTransition = 0;
		this.screenReady = false;
	}

	public setScreenFeedback(kind: 'hover' | 'focus' | 'press', regionId: string | null): void {
		const key =
			kind === 'hover'
				? 'hoveredRegionId'
				: kind === 'focus'
					? 'focusedRegionId'
					: 'pressedRegionId';
		if (this[key] === regionId) return;
		this[key] = regionId;
		this.redrawSelectedScreen();
	}

	public activateScreenRegion(regionId: string): void {
		if (!this.screenReady || !this.inputEnabled) return;
		const record = this.hotspots.find((item) => item.id === this.selectedHotspotId);
		const region = record?.regions.find((item) => item.id === regionId && !item.disabled);
		if (region) this.performScreenAction(region.action);
	}

	public performScreenAction(action: ExhibitAction): void {
		if (!this.selectedHotspotId || !this.inputEnabled) return;
		if (action.kind === 'close') {
			this.selectHotspot(null);
			this.callbacks.onHotspotSelect?.('', this.activeStationIndex);
		} else if (action.kind === 'archive') {
			this.callbacks.onOpenDossier?.();
		} else if (action.kind === 'link') {
			// Tolak skim aktif walaupun data navigasi datang daripada repositori sendiri.
			if (/^(https?:\/\/|mailto:|tel:|\/(?!\/))/.test(action.url)) {
				if (/^(mailto:|tel:)/.test(action.url)) window.location.href = action.url;
				else window.open(action.url, '_blank', 'noopener,noreferrer');
			}
		} else if (action.kind === 'previous' || action.kind === 'next') {
			const record = this.hotspots.find((item) => item.id === this.selectedHotspotId);
			if (!record) return;
			const siblings = STATIONS[record.stationIndex].hotspots;
			const index = siblings.findIndex((item) => item.id === record.id);
			const next =
				siblings[(index + (action.kind === 'next' ? 1 : -1) + siblings.length) % siblings.length];
			this.selectHotspot(next.id);
			this.callbacks.onHotspotSelect?.(next.id, record.stationIndex);
		} else if (action.kind === 'page') {
			const page = Math.max(0, Math.min(this.screenPageCount - 1, this.screenPage + action.delta));
			if (page === this.screenPage) return;
			this.beginScreenTransition();
			this.screenPage = page;
			this.redrawSelectedScreen();
		} else if (action.kind === 'back') {
			const previous = this.screenHistory.pop();
			if (previous) this.navigateScreen(previous.route, false, previous.page);
		} else if (action.kind === 'navigate') {
			this.navigateScreen(action.route);
		}
	}

	private navigateScreen(route: ExhibitRoute, remember = true, page = 0): void {
		if (!resolveExhibitView(route)) return;
		const history = [...this.screenHistory];
		if (remember && this.screenRoute)
			history.push({ route: this.screenRoute, page: this.screenPage });
		if (route.kind === 'hotspot' && route.id !== this.selectedHotspotId) {
			const location = getHotspotLocation(route.id);
			if (!location) return;
			this.selectHotspot(route.id);
			this.callbacks.onHotspotSelect?.(route.id, location.stationIndex);
		} else {
			this.beginScreenTransition();
		}
		this.screenHistory = history;
		this.screenRoute = route;
		this.screenPage = page;
		this.hoveredRegionId = null;
		this.focusedRegionId = null;
		this.pressedRegionId = null;
		this.redrawSelectedScreen();
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

	private buildPrecision3DProp(hotspotId: string, accentHex: number): THREE.Object3D {
		const propGroup = new THREE.Group();
		const titaniumMat = this.createBrushedMetalMaterial(0x1e293b, accentHex, 0.2);
		const chromeMat = this.createBrushedMetalMaterial(0xe2e8f0, undefined, 0.12);
		const glassMat = this.createOpticalGlassMaterial(accentHex);
		const glowMat = this.createGlowMaterial(accentHex, accentHex, 0.45);

		if (hotspotId.startsWith('core-')) {
			const coreCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.25, 2), glassMat);
			coreCrystal.castShadow = true;
			propGroup.add(coreCrystal);

			for (let r = 0; r < 3; r++) {
				const gimbal = new THREE.Mesh(
					new THREE.TorusGeometry(0.32 + r * 0.07, 0.018, 16, 48),
					r === 1 ? chromeMat : titaniumMat
				);
				gimbal.rotation.set(r * 0.8, r * 1.1, r * 0.5);
				propGroup.add(gimbal);
				this.rotatingBeacons.push(gimbal);
			}
		} else if (hotspotId.startsWith('ent-')) {
			for (let b = 0; b < 3; b++) {
				const blade = new THREE.Mesh(
					createBeveledSlabGeometry(0.58, 0.1, 0.44, 0.025, 0.012),
					titaniumMat
				);
				blade.position.y = -0.16 + b * 0.16;
				propGroup.add(blade);
			}
			const dataCore = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.52, 16), glowMat);
			propGroup.add(dataCore);
		} else if (hotspotId.startsWith('net-')) {
			// Mangkuk Radar Dwi-Permukaan dengan ketebalan fizikal
			const pts: THREE.Vector2[] = [];
			for (let i = 0; i <= 14; i++) {
				const t = i / 14;
				pts.push(new THREE.Vector2(t * 0.38, t * t * 0.18));
			}
			for (let i = 14; i >= 0; i--) {
				const t = i / 14;
				pts.push(new THREE.Vector2(t * 0.36, t * t * 0.18 + 0.022));
			}
			chromeMat.side = THREE.DoubleSide;
			const dish = new THREE.Mesh(new THREE.LatheGeometry(pts, 36), chromeMat);
			dish.rotation.x = Math.PI * 0.28;
			dish.castShadow = true;
			propGroup.add(dish);

			const feedHorn = new THREE.Mesh(
				new THREE.CylinderGeometry(0.016, 0.028, 0.2, 16),
				titaniumMat
			);
			feedHorn.position.set(0, 0.1, 0.08);
			feedHorn.rotation.x = Math.PI * 0.28;
			propGroup.add(feedHorn);

			const feedTip = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 16), glowMat);
			feedTip.position.set(0, 0.18, 0.14);
			propGroup.add(feedTip);
		} else {
			const outerHousing = new THREE.Mesh(
				new THREE.CylinderGeometry(0.3, 0.34, 0.22, 32),
				titaniumMat
			);
			outerHousing.rotation.x = Math.PI / 2;
			propGroup.add(outerHousing);

			const apertureRing = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.018, 16, 48), glowMat);
			apertureRing.position.z = 0.12;
			propGroup.add(apertureRing);
			this.rotatingBeacons.push(apertureRing);
		}

		return propGroup;
	}

	/**
	 * Membina Terminal Pameran Kaca Melengkung (Curved Amphitheater Exhibit Terminal)
	 */
	private createHotspotExhibitMonolith(
		stationGroup: THREE.Group,
		stationIndex: number,
		hotspot: HotspotItem,
		position: THREE.Vector3,
		yawAngle: number,
		accentHex: number
	): void {
		const root = new THREE.Group();
		root.position.copy(position);
		root.rotation.y = yawAngle;

		const supportMat = this.createBrushedMetalMaterial(0x1e293b, accentHex, 0.22);
		// Casis legap berus metal: kaca biasan dahulu mencuci skrin OLED dan memaksa
		// 21 frame tambahan melalui pas transmission setiap frame.
		const frameMat = this.createBrushedMetalMaterial(0x16202e, accentHex, 0.18);
		const accentMat = this.createGlowMaterial(accentHex, accentHex, 0.45);

		const basePlinth = new THREE.Mesh(
			createBeveledSlabGeometry(2.85, 0.18, 0.85, 0.08, 0.03),
			supportMat
		);
		basePlinth.position.y = 0.09;
		basePlinth.castShadow = true;
		basePlinth.receiveShadow = true;
		root.add(basePlinth);

		for (const sx of [-0.95, 0.95]) {
			const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.62, 18), supportMat);
			strut.position.set(sx, 0.35, 0);
			strut.castShadow = true;
			root.add(strut);
		}

		const chassis = new THREE.Mesh(
			createBeveledSlabGeometry(2.96, 2.0, 0.16, 0.08, 0.03),
			frameMat
		);
		chassis.position.set(0, 1.52, 0);
		chassis.castShadow = true;
		chassis.receiveShadow = true;
		root.add(chassis);

		// Bingkai berlubang sebagai garis cahaya nipis di tepi aperture skrin.
		const rimShape = new THREE.Shape();
		rimShape.moveTo(-1.51, -1.03);
		rimShape.lineTo(1.51, -1.03);
		rimShape.lineTo(1.51, 1.03);
		rimShape.lineTo(-1.51, 1.03);
		rimShape.closePath();
		const aperture = new THREE.Path();
		aperture.moveTo(-1.46, -0.98);
		aperture.lineTo(-1.46, 0.98);
		aperture.lineTo(1.46, 0.98);
		aperture.lineTo(1.46, -0.98);
		aperture.closePath();
		rimShape.holes.push(aperture);
		const accentRim = new THREE.Mesh(new THREE.ShapeGeometry(rimShape), accentMat);
		accentRim.position.set(0, 1.52, 0.104);
		root.add(accentRim);

		const canvas = document.createElement('canvas');
		canvas.width = 1440;
		canvas.height = 920;
		this.drawHotspotExhibitCanvas(canvas, hotspot);

		const texture = new THREE.CanvasTexture(canvas);
		texture.colorSpace = THREE.SRGBColorSpace;
		if (this.renderer) {
			texture.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
		}

		// Skrin unlit: albedo hitam mematikan pencahayaan diffuse, manakala emissiveMap
		// memaparkan tekstur tepat. Tanpa ini, spekular IBL + emissive menambah cahaya
		// pada piksel gelap dan teks hilang di bawah matahari Light Mode.
		const screenMat = new THREE.MeshStandardMaterial({
			map: texture,
			color: 0x000000,
			emissive: 0xffffff,
			emissiveMap: texture,
			emissiveIntensity: 1,
			roughness: 1,
			metalness: 0,
			envMapIntensity: 0
		});

		const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.66, 1.7), screenMat);
		screenMesh.position.set(0, 1.52, 0.095);
		root.add(screenMesh);

		// Tiang Penyangga Mikro Mekanikal di Puncak Panel (Penyambung Struktur Estetik)
		const propPylon = new THREE.Mesh(
			new THREE.CylinderGeometry(0.035, 0.055, 0.34, 16),
			supportMat
		);
		propPylon.position.set(0, 2.65, 0);
		propPylon.castShadow = true;
		root.add(propPylon);

		const pylonCollar = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.016, 12, 24), accentMat);
		pylonCollar.rotation.x = Math.PI / 2;
		pylonCollar.position.set(0, 2.8, 0);
		root.add(pylonCollar);

		// Arca Kejuruteraan 3D Terapung di Puncak Terminal Pameran (Aras Selamat Bebas Tertindih y = 3.32)
		const propObject = this.buildPrecision3DProp(hotspot.id, accentHex);
		propObject.position.set(0, EXHIBIT_PROP_HEIGHT, 0);
		root.add(propObject);

		root.traverse((child) => {
			child.userData.hotspotId = hotspot.id;
			child.userData.stationIndex = stationIndex;
		});

		stationGroup.add(root);

		this.hotspots.push({
			id: hotspot.id,
			stationIndex,
			hotspot,
			mesh: root,
			propObject,
			anchorLocal: new THREE.Vector3(position.x, position.y + 2.65, position.z),
			screenMat,
			screenMesh,
			panelMeshes: [chassis, accentRim, screenMesh],
			screenWidth: 2.66,
			screenHeight: 1.7,
			regions: [],
			frameMat,
			accentMat,
			canvas,
			texture,
			baseY: position.y,
			currentLift: 0
		});
		this.interactableMeshes.push(root);
		this.interactionRoots.push(chassis, screenMesh, propObject);
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
			group.position.copy(anchor);
			// Pusingkan setiap pulau supaya menghadap ke luar jejari (kamera melihat pulau dengan Teras Reaktor Pusat di latar belakang!)
			const radialAngle = STATION_ANGLES[stationIndex];
			group.rotation.y = radialAngle;

			group.userData.islandIndex = stationIndex;
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
			const stepX = count <= 3 ? 4.1 : count === 4 ? 3.5 : 3.3;
			const halfSpan = (count - 1) * 0.5 * stepX;

			items.forEach((hs, idx) => {
				const xPos = (idx - (count - 1) * 0.5) * stepX;
				const normX = halfSpan > 0.001 ? xPos / halfSpan : 0; // -1 .. +1

				// Lengkungan Concave:
				// Pusat terminal berundur ke z = 0.90m (memberi kelegaan selamat dari monumen z = 0.25m)
				// Sayap tepi melengkung ke hadapan (z = 1.35m) menghadap kamera orbit
				const zPos = 0.9 + Math.abs(normX) * 0.45;

				// Sudut yaw lembut (maksimum ±14.3° / ±0.25 rad), memusatkan skrin ke titik pandang penonton
				const yaw = -normX * 0.25;
				const hsColors = [0x38bdf8, 0x2dd4bf, 0x60a5fa, 0x34d399, 0xfbbf24];

				this.createHotspotExhibitMonolith(
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
		for (const rec of this.hotspots) {
			this.drawHotspotExhibitCanvas(rec.canvas, rec.hotspot);
			rec.texture.needsUpdate = true;
		}
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
		this.oceanMaterial.uniforms.uSunSpecScale.value = isLight ? 0.35 : 0.45;

		this.skyMaterial.uniforms.uSunDir.value.copy(sunDir);
		this.skyMaterial.uniforms.uSunColor.value.copy(cfg.sunColor);
		this.skyMaterial.uniforms.uSkyZenith.value.copy(cfg.skyZenith);
		this.skyMaterial.uniforms.uSkyHorizon.value.copy(cfg.skyHorizon);
		this.skyMaterial.uniforms.uNightFactor.value = cfg.nightFactor;

		// Kawal Exposure, IBL & Bloom: Dark Mode tenang tanpa silau (0.58), Light Mode bersih (0.84)
		if (this.renderer) {
			this.renderer.toneMappingExposure = isLight ? 0.84 : 0.58;
		}
		this.scene.environmentIntensity = isLight ? 0.72 : 0.42;
		if (this.bloomPass) {
			this.bloomPass.strength = isLight ? 0.03 : 0.04;
			this.bloomPass.radius = 0.18;
			this.bloomPass.threshold = 1.0;
		}

		this.keyLight.color.copy(cfg.sunColor);
		this.keyLight.intensity = isLight ? 1.45 : 0.82;
		this.hemiLight.color.copy(cfg.skyHorizon);
		this.hemiLight.intensity = isLight ? 0.55 : 0.32;
		this.ambientLight.intensity = isLight ? 0.36 : 0.18;
		this.stationSpotLight.intensity = isLight ? 2.4 : 1.6;
		this.rimLight.intensity = isLight ? 2.0 : 1.2;

		if (this.pulseMat) {
			this.pulseMat.color.setHex(isLight ? 0x0284c7 : 0x38bdf8);
		}
		if (this.motePoints) {
			this.motePoints.material.uniforms.uColor.value.setHex(isLight ? 0x38bdf8 : 0x7dd3fc);
			this.motePoints.material.uniforms.uOpacity.value = isLight ? 0.28 : 0.48;
		}

		for (const mat of this.glowMaterials) {
			const base = (mat.userData.baseEmissive as number | undefined) ?? 0.5;
			mat.emissiveIntensity = isLight ? base * 0.9 : base * 0.65;
		}

		this.refreshHotspotHighlights();
	}

	public setTheme(theme: ThemeMode): void {
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
		this.applyWeatherAndTheme();
	}

	public setActive(active: boolean): void {
		if (this.active === active) return;
		this.active = active;
		if (active) {
			this.clock.getDelta(); // Buang masa dorman supaya tiada lompatan frame besar
			this.startLoop();
		} else {
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
			this.setScreenFeedback('hover', null);
			if (this.hoveredHotspotId || this.hoveredIslandIndex !== null) {
				this.hoveredHotspotId = null;
				this.hoveredIslandIndex = null;
				this.refreshHotspotHighlights();
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
	}

	public selectHotspot(hotspotId: string | null): void {
		if (this.selectedHotspotId === hotspotId) return;
		const record = this.hotspots.find((item) => item.id === hotspotId);
		if (hotspotId && !record) return;
		this.clearScreenTransition();
		this.onPointerCancel();
		const previous = this.hotspots.find((item) => item.id === this.selectedHotspotId);
		this.selectedHotspotId = hotspotId;
		if (previous) this.resizeExhibit(previous, false);
		if (record) this.resizeExhibit(record, true);
		this.screenRoute = hotspotId ? { kind: 'hotspot', id: hotspotId } : null;
		this.screenHistory = [];
		this.screenPage = 0;
		this.screenPageCount = 1;
		this.hoveredRegionId = null;
		this.focusedRegionId = null;
		this.pressedRegionId = null;
		this.hoveredHotspotId = null;
		this.hoveredIslandIndex = null;
		this.targetYawOffset = 0;
		this.targetPitchOffset = 0;
		if (record) this.goToStation(record.stationIndex);
		this.screenReady = Boolean(hotspotId);
		this.refreshHotspotHighlights();
		this.redrawAllCanvases();
		this.callbacks.onHotspotHover?.(null, null);
		if (!hotspotId) this.callbacks.onScreenUpdate?.(null);
		if (this.renderer) this.renderer.domElement.style.cursor = hotspotId ? 'default' : 'grab';
	}

	public setSimulationMode(_stationIndex: number, modeId: string): void {
		this.weatherPresetId = modeId;
		this.applyWeatherAndTheme();
	}

	private refreshHotspotHighlights(): void {
		const isLight = this.theme === 'light';
		const isInspecting = Boolean(this.selectedHotspotId);

		for (const record of this.hotspots) {
			const isSelected = record.id === this.selectedHotspotId;
			const isHovered = record.id === this.hoveredHotspotId;
			const isSibling = record.stationIndex === this.activeStationIndex && !isSelected;

			if (isInspecting && isSibling) {
				// Redupkan terminal saudara semasa mod inspect supaya fokus kekal pada terminal terpilih.
				record.screenMat.emissiveIntensity = 0.4;
				record.accentMat.emissiveIntensity = 0;
			} else {
				// Skrin unlit: keamatan emissive kekal 1 supaya warna tekstur tidak dicuci
				// oleh pencahayaan; sorotan hanya melalui aksen rangka.
				record.screenMat.emissiveIntensity = 1;
				const accentBoost = isLight ? 1 : 1.4;
				record.accentMat.emissiveIntensity =
					(isHovered ? 0.85 : isSelected ? 0.65 : 0.35) * accentBoost;
			}
		}
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
		this.setScreenFeedback('hover', null);
	};

	private onPointerCancel = (e?: PointerEvent): void => {
		if (e && e.pointerId !== this.pointerId) return;
		this.isDragging = false;
		this.pointerId = null;
		this.pointerDownRegionId = null;
		this.heldKeys.clear();
		this.setScreenFeedback('press', null);
	};

	private onKeyDown = (e: KeyboardEvent): void => {
		if (!this.inputEnabled) return;
		if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
		if (e.key === 'Escape' && this.selectedHotspotId) {
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
		if (this.selectedHotspotId) return;
		const k = e.key.toLowerCase();
		if (k === 'w' || k === 's' || k === 'arrowup' || k === 'arrowdown') {
			this.heldKeys.add(k);
			this.lastInteractionTime = this.clock.getElapsedTime();
		}
	};

	private onKeyUp = (e: KeyboardEvent): void => {
		this.heldKeys.delete(e.key.toLowerCase());
	};

	private onResize(): void {
		if (!this.renderer) return;
		const width = Math.max(this.container.clientWidth, 1);
		const height = Math.max(this.container.clientHeight, 1);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
		if (this.composer) {
			this.composer.setSize(width, height);
		}
		if (this.motePoints) {
			this.motePoints.material.uniforms.uViewportHeight.value =
				height * this.renderer.getPixelRatio();
		}
		const record = this.hotspots.find((item) => item.id === this.selectedHotspotId);
		if (record) {
			this.clearScreenTransition();
			this.onPointerCancel();
			this.resizeExhibit(record, true);
			this.redrawSelectedScreen();
		}
	}

	private updatePointerNdcFromEvent(e: PointerEvent): void {
		if (!this.renderer) return;
		const rect = this.renderer.domElement.getBoundingClientRect();
		if (rect.width <= 0 || rect.height <= 0) return;
		this.pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
		this.pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
	}

	private hitSelectedScreen(): { hit: THREE.Intersection | null; region: ScreenHitRegion | null } {
		const record = this.hotspots.find((item) => item.id === this.selectedHotspotId);
		if (!record || Math.abs(this.pointerNdc.x) > 1 || Math.abs(this.pointerNdc.y) > 1) {
			return { hit: null, region: null };
		}
		this.camera.updateMatrixWorld();
		record.screenMesh.updateWorldMatrix(true, false);
		this.raycaster.setFromCamera(this.pointerNdc, this.camera);
		const hit = this.raycaster.intersectObject(record.screenMesh, false)[0] ?? null;
		const region =
			hit?.uv && this.screenReady
				? hitTestScreen(
						record.regions,
						hit.uv.x * record.canvas.width,
						(1 - hit.uv.y) * record.canvas.height
					)
				: null;
		return { hit, region };
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
		if (this.selectedHotspotId) {
			this.pointerDownRegionId = this.hitSelectedScreen().region?.id ?? null;
			this.setScreenFeedback('press', this.pointerDownRegionId);
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
			if (!this.selectedHotspotId) {
				// Benarkan pengguna memutar pandangan kamera secara luas untuk menikmati kepulauan 360°
				this.targetYawOffset = Math.max(-1.35, Math.min(1.35, -dx * 0.0028));
				this.targetPitchOffset = Math.max(-0.32, Math.min(0.38, -dy * 0.0018));
				return;
			}
		}

		if (this.selectedHotspotId) {
			const { region } = this.hitSelectedScreen();
			this.setScreenFeedback('hover', region?.id ?? null);
			this.setScreenFeedback(
				'press',
				this.isDragging && !this.dragMoved && region?.id === this.pointerDownRegionId
					? region.id
					: null
			);
			this.renderer.domElement.style.cursor = region ? 'pointer' : 'default';
			return;
		}

		this.raycaster.setFromCamera(this.pointerNdc, this.camera);
		const targets =
			this.interactionRoots.length > 0 ? this.interactionRoots : this.interactableMeshes;
		const hits = this.raycaster.intersectObjects(targets, true);
		let hitHotspotId: string | null = null;
		let hitIslandIdx: number | null = null;

		if (hits.length > 0) {
			for (const hit of hits) {
				const hitObj = hit.object;
				const hid = (hitObj.userData.hotspotId as string | undefined) ?? null;
				// Semasa mod inspect, abaikan raycast pada terminal adik-beradik yang tenggelam
				if (this.selectedHotspotId && hid && hid !== this.selectedHotspotId) {
					continue;
				}
				hitHotspotId = hid;
				hitIslandIdx = (hitObj.userData.islandIndex as number | undefined) ?? null;
				break;
			}
		}

		if (hitHotspotId !== this.hoveredHotspotId || hitIslandIdx !== this.hoveredIslandIndex) {
			this.hoveredHotspotId = hitHotspotId;
			this.hoveredIslandIndex = hitIslandIdx;
			this.refreshHotspotHighlights();
			const isClickable = Boolean(
				hitHotspotId || (hitIslandIdx !== null && hitIslandIdx !== this.activeStationIndex)
			);
			this.renderer.domElement.style.cursor = isClickable ? 'pointer' : 'grab';

			let hoverLabel: string | null = null;
			if (hitIslandIdx !== null && hitIslandIdx !== this.activeStationIndex && !hitHotspotId) {
				const st = STATIONS[hitIslandIdx];
				if (st) hoverLabel = `${st.code} · ${st.title[this.locale]}`;
			}
			this.callbacks.onHotspotHover?.(hitHotspotId, hoverLabel);
		}
	};

	private onPointerUp = (e: PointerEvent): void => {
		if (!this.isDragging || e.pointerId !== this.pointerId || e.button !== 0) return;
		this.updatePointerNdcFromEvent(e);
		const wasClick =
			!this.dragMoved &&
			Math.abs(e.clientX - this.dragStartX) <= 4 &&
			Math.abs(e.clientY - this.dragStartY) <= 4;
		const pressedRegionId = this.pointerDownRegionId;
		this.isDragging = false;
		this.pointerId = null;
		this.pointerDownRegionId = null;
		this.setScreenFeedback('press', null);

		if (wasClick && this.renderer && this.inputEnabled) {
			if (this.selectedHotspotId) {
				const { hit, region } = this.hitSelectedScreen();
				if (hit) {
					if (region && region.id === pressedRegionId) this.performScreenAction(region.action);
					return;
				}
				// Klik kawasan kosong luar monitor semasa mod inspect: keluar zoom kembali ke panorama orbit!
				this.selectHotspot(null);
				this.callbacks.onHotspotSelect?.('', this.activeStationIndex);
				return;
			}

			this.raycaster.setFromCamera(this.pointerNdc, this.camera);
			const targets =
				this.interactionRoots.length > 0 ? this.interactionRoots : this.interactableMeshes;
			const hits = this.raycaster.intersectObjects(targets, true);
			if (hits.length > 0) {
				const obj = hits[0].object;
				const hotspotId = obj.userData.hotspotId as string | undefined;
				const stationIdx = obj.userData.stationIndex as number | undefined;
				const islandIdx = obj.userData.islandIndex as number | undefined;

				if (hotspotId && typeof stationIdx === 'number') {
					this.selectHotspot(hotspotId);
					this.callbacks.onHotspotSelect?.(hotspotId, stationIdx);
				} else if (typeof islandIdx === 'number' && islandIdx !== this.activeStationIndex) {
					// Terbang terus ke pulau yang diklik di seberang lautan!
					this.goToStation(islandIdx);
				}
			}
		}
	};

	private updateCamera(dt: number, elapsed: number): void {
		let walkDir = 0;
		if (this.heldKeys.has('w') || this.heldKeys.has('arrowup')) walkDir += 1;
		if (this.heldKeys.has('s') || this.heldKeys.has('arrowdown')) walkDir -= 1;
		if (walkDir !== 0 && !this.selectedHotspotId) {
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
			this.callbacks.onStationChange?.(nearestStation, this.currentProgress);
		}

		// Kedudukan kamera pada lilitan luar pulau supaya menghadap ke arah Pulau Semasa + Teras Reaktor Pusat (0,0,0) di belakangnya!
		const orbitAngle = this.currentProgress * Math.PI * 2;
		const radialOut = new THREE.Vector3(Math.sin(orbitAngle), 0, Math.cos(orbitAngle));
		const tangentRight = new THREE.Vector3(Math.cos(orbitAngle), 0, -Math.sin(orbitAngle));

		const anchorPt = this.orbitalLoopCurve.getPointAt(this.currentProgress);
		const stepBob = this.reducedMotion
			? 0
			: Math.sin(elapsed * 6.8) * Math.min(0.05, Math.abs(diff) * 1.5) +
				Math.sin(elapsed * 1.35) * 0.04;

		const camRadiusOffset = 9.8;
		const lateralShift = this.smoothPointer.x * 0.75 + this.userYawOffset * 3.4;

		const camPos = anchorPt
			.clone()
			.addScaledVector(radialOut, camRadiusOffset)
			.addScaledVector(tangentRight, lateralShift);
		camPos.y =
			anchorPt.y + 3.25 + stepBob + this.smoothPointer.y * 0.3 + this.userPitchOffset * 1.8;

		// Kamera memandang ke tengah Pulau Semasa dan terus ke Teras Reaktor Pusat di tengah lautan
		const lookTarget = anchorPt
			.clone()
			.addScaledVector(radialOut, -2.6)
			.addScaledVector(tangentRight, this.smoothPointer.x * 1.2 - this.userYawOffset * 4.2);
		lookTarget.y = anchorPt.y + 2.15 - this.userPitchOffset * 1.6;

		const focusedRecord = this.selectedHotspotId
			? (this.hotspots.find((h) => h.id === this.selectedHotspotId) ?? null)
			: null;

		const enteringInspect = focusedRecord && this.inspectBlend <= 0.0005;
		const targetBlend = focusedRecord ? 1 : 0;
		const blendSpeed = this.reducedMotion ? 1 : Math.min(1, dt * 5.2);
		this.inspectBlend += (targetBlend - this.inspectBlend) * blendSpeed;
		if (Math.abs(targetBlend - this.inspectBlend) < 0.0005) this.inspectBlend = targetBlend;

		const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 992;
		const targetFov = focusedRecord ? (isDesktop ? 38 : 42) : 46;

		if (focusedRecord) {
			focusedRecord.mesh.updateWorldMatrix(true, true);
			// Pusatkan sasaran pandangan tepat pada koordinat skrin terminal (y=1.52, z=0.095)
			this.tempScreenCenter.set(0, 1.52, 0.095).applyMatrix4(focusedRecord.mesh.matrixWorld);
			focusedRecord.mesh.getWorldQuaternion(this.tempQuat);
			this.tempNormal.set(0, 0, 1).applyQuaternion(this.tempQuat).normalize();
			this.tempTangent.set(1, 0, 0).applyQuaternion(this.tempQuat).normalize();

			const lateralOffset = 0;
			const verticalOffset = 0;
			const aspect =
				Number.isFinite(this.camera.aspect) && this.camera.aspect > 0 ? this.camera.aspect : 1;
			const camDistance = getInspectDistance(2.66, 1.7, aspect, targetFov, 0.88);

			this.targetInspectLookAt
				.copy(this.tempScreenCenter)
				.addScaledVector(this.tempTangent, lateralOffset)
				.add(new THREE.Vector3(0, verticalOffset, 0));

			this.targetInspectCamPos
				.copy(this.tempScreenCenter)
				.addScaledVector(this.tempNormal, camDistance)
				.addScaledVector(this.tempTangent, lateralOffset)
				.add(new THREE.Vector3(0, verticalOffset, 0));

			if (enteringInspect) {
				this.currentInspectCamPos.copy(this.targetInspectCamPos);
				this.currentInspectLookAt.copy(this.targetInspectLookAt);
			} else {
				const glideSpeed = this.reducedMotion ? 1 : Math.min(1, dt * 5.8);
				this.currentInspectCamPos.lerp(this.targetInspectCamPos, glideSpeed);
				this.currentInspectLookAt.lerp(this.targetInspectLookAt, glideSpeed);
			}
		}

		if (this.inspectBlend > 0.0005) {
			this.camera.position.lerpVectors(camPos, this.currentInspectCamPos, this.inspectBlend);
			lookTarget.lerp(this.currentInspectLookAt, this.inspectBlend);
		} else {
			this.camera.position.copy(camPos);
		}

		this.camera.lookAt(lookTarget);

		if (Math.abs(this.camera.fov - targetFov) > 0.05) {
			this.camera.fov += (targetFov - this.camera.fov) * blendSpeed;
			this.camera.updateProjectionMatrix();
		} else if (this.camera.fov !== targetFov) {
			this.camera.fov = targetFov;
			this.camera.updateProjectionMatrix();
		}

		if (this.skyMesh) {
			this.skyMesh.position.copy(this.camera.position);
		}

		this.keyLight.position.set(anchorPt.x + 14, 26, anchorPt.z + 14);
		this.keyLight.target.position.copy(anchorPt);
		this.keyLight.target.updateMatrixWorld();

		this.stationSpotLight.position.set(anchorPt.x, anchorPt.y + 6.8, anchorPt.z);
		this.rimLight.position.set(anchorPt.x - 6, anchorPt.y + 5.0, anchorPt.z - 3);
	}

	private updateProjectedMarkers(): void {
		if (!this.callbacks.onMarkersUpdate || !this.renderer) return;

		this.camera.updateMatrixWorld();
		const projected: ProjectedMarker[] = [];

		for (const record of this.hotspots) {
			if (record.stationIndex !== this.activeStationIndex) continue;

			const stationGroup = this.stationGroups[record.stationIndex];
			if (!stationGroup) continue;

			this.tempWorldVec.copy(record.anchorLocal).applyMatrix4(stationGroup.matrixWorld);
			this.tempWorldVec.project(this.camera);

			const isInFront = this.tempWorldVec.z > -1 && this.tempWorldVec.z < 1;
			const screenX = (this.tempWorldVec.x * 0.5 + 0.5) * 100;
			const screenY = (-this.tempWorldVec.y * 0.5 + 0.5) * 100;
			const onScreen = isInFront && screenX > 6 && screenX < 94 && screenY > 8 && screenY < 90;

			projected.push({
				id: record.id,
				stationIndex: record.stationIndex,
				x: screenX,
				y: screenY,
				visible: onScreen
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
			const pt = this.causewayLoopCurve.getPointAt(this.pulseOffsets[i], this.tempPulsePt);
			// Bola menyelam di bawah dek pulau apabila menghampiri pusat pulau, jadi ia
			// tidak lagi menembusi lantai (dahulu laluan y=0.78 + 0.34 melepasi dek y=1.20).
			let nearestIslandSq = Infinity;
			for (let islandIdx = 0; islandIdx < STATION_ANCHORS.length; islandIdx++) {
				const anchor = STATION_ANCHORS[islandIdx];
				const dx = pt.x - anchor.x;
				const dz = pt.z - anchor.z;
				const d2 = dx * dx + dz * dz;
				if (d2 < nearestIslandSq) nearestIslandSq = d2;
			}
			const nearestIsland = Math.sqrt(nearestIslandSq);
			const dive = Math.min(1, Math.max(0, (PULSE_DIVE_RADIUS - nearestIsland) / PULSE_DIVE_FADE));
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

		if (!this.reducedMotion && !this.selectedHotspotId) this.buoyancyTime += dt;
		this.applyStationBuoyancy(this.buoyancyTime);

		// Putar cincin Teras Reaktor Pusat
		if (!this.reducedMotion) {
			for (let r = 0; r < this.centralReactorRings.length; r++) {
				const ring = this.centralReactorRings[r];
				ring.rotation.y = elapsed * (0.32 + r * 0.14);
				ring.rotation.x = Math.sin(elapsed * 0.4 + r) * 0.45;
			}
		}

		const isInspecting = Boolean(this.selectedHotspotId);

		for (let i = 0; i < this.hotspots.length; i++) {
			const rec = this.hotspots[i];
			const isCurrentIsland = rec.stationIndex === this.activeStationIndex;
			const isHovered = rec.id === this.hoveredHotspotId;
			const isSelected = rec.id === this.selectedHotspotId;
			const isSibling = isCurrentIsland && !isSelected;

			let targetLift = 0;
			if (isSelected) {
				targetLift = 0.22;
			} else if (isInspecting && isSibling) {
				// Undur secara hidraulik ke bawah lantai dek pulau semasa terminal lain diperincikan
				targetLift = -3.8;
			} else if (isHovered) {
				targetLift = 0.24;
			} else if (isCurrentIsland) {
				targetLift = 0.08;
			}

			rec.currentLift += (targetLift - rec.currentLift) * Math.min(1, dt * 6.5);
			rec.mesh.position.y = rec.baseY + rec.currentLift;

			// Sembunyikan objek jika tenggelam sepenuhnya ke bawah paras pulau untuk kelancaran grafik & elak halangan kamera
			rec.mesh.visible = isSelected || !isInspecting || rec.currentLift > -3.5;

			if (!this.reducedMotion && rec.mesh.visible) {
				const spinSpeed = isHovered ? 1.8 : isSelected ? 1.2 : isCurrentIsland ? 0.85 : 0.35;
				rec.propObject.rotation.y += dt * spinSpeed;
				rec.propObject.position.y =
					EXHIBIT_PROP_HEIGHT + Math.sin(elapsed * 2.2 + i) * EXHIBIT_PROP_BOB;
			}
		}

		if (!this.reducedMotion) {
			// Imbas azimut pada paksi menegak; piring kekal condong pada pemegangnya.
			if (this.radarRotor) this.radarRotor.rotation.y = elapsed * 0.35;
			for (let i = 0; i < this.rotatingBeacons.length; i++) {
				const b = this.rotatingBeacons[i];
				b.rotation.z = elapsed * (0.55 + (i % 3) * 0.2);
			}
		}
	}

	private startLoop(): void {
		// Had 60 fps: skrin 120 Hz tidak perlu merender dua kali untuk animasi yang sama,
		// dan GPU mudah alih kekal sejuk (input kekal responsif).
		const frameBudget = 1000 / 60;
		let lastRenderTime = 0;
		let slowStreak = 0;
		let fastStreak = 0;

		const tick = (now: number) => {
			this.rafId = requestAnimationFrame(tick);
			if (now - lastRenderTime < frameBudget - 1) return;
			const rawDelta = now - lastRenderTime;
			lastRenderTime = now;
			const dt = Math.min(this.clock.getDelta(), 0.1);
			const elapsed = this.clock.getElapsedTime();

			this.animateScene(dt, elapsed);
			this.updateCamera(dt, elapsed);
			this.updateScreenTransition(dt);
			this.updateProjectedMarkers();

			if (this.isMobile && this.renderer) {
				this.renderer.render(this.scene, this.camera);
			} else if (this.composer) {
				this.composer.render();
			} else if (this.renderer) {
				this.renderer.render(this.scene, this.camera);
			}

			// Resolusi adaptif: hanya diturunkan apabila frame benar-benar lewat,
			// dan dipulihkan perlahan-lahan apabila GPU kembali lapang.
			if (rawDelta > 0 && rawDelta < 2500) {
				if (rawDelta > frameBudget * 1.55) {
					slowStreak += rawDelta > 120 ? 9 : 1;
					fastStreak = 0;
				} else if (rawDelta < frameBudget * 1.1) {
					fastStreak += 1;
					slowStreak = 0;
				} else {
					slowStreak = 0;
					fastStreak = 0;
				}
				if (slowStreak >= 18) {
					slowStreak = 0;
					this.stepPixelRatio(-0.15);
				} else if (fastStreak >= 180) {
					fastStreak = 0;
					this.stepPixelRatio(0.1);
				}
			}
		};
		this.rafId = requestAnimationFrame(tick);
	}

	/** Ubah pixel ratio dalam had selamat tanpa menyentuh saiz CSS kanvas. */
	private stepPixelRatio(delta: number): void {
		if (!this.renderer) return;
		const base = this.basePixelRatio;
		const next = Math.min(base, Math.max(0.7, this.currentPixelRatio + delta));
		if (Math.abs(next - this.currentPixelRatio) < 0.001) return;
		this.currentPixelRatio = next;
		this.renderer.setPixelRatio(next);
		if (this.composer) {
			this.composer.setPixelRatio(next);
			this.composer.setSize(this.container.clientWidth || 1, this.container.clientHeight || 1);
		}
		if (this.motePoints) {
			this.motePoints.material.uniforms.uViewportHeight.value =
				(this.container.clientHeight || 1) * next;
		}
	}

	public dispose(): void {
		this.disposed = true;
		this.clearScreenTransition();
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

		for (const rec of this.hotspots) {
			rec.texture.dispose();
		}
		for (const sh of this.stationHeaders) {
			sh.texture.dispose();
		}
		if (this.envTexture) {
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

		if (this.composer) {
			this.composer.dispose();
			this.composer = null;
		}
		if (this.renderer) {
			this.renderer.dispose();
			this.renderer = null;
		}
	}
}
