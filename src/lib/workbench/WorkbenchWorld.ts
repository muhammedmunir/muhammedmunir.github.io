import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { fitPerspectiveBounds } from './camera-fit.mjs';
import { MODULES } from './system-state.mjs';
import { base } from '$app/paths';
import { PROJECT_MEDIA } from './project-media';
import { DossierStation, type DossierView } from './DossierStation';
import type { LocaleMode, ThemeMode } from './preferences.svelte';

export type Part = 'cable' | 'lid' | 'owner' | 'visitor' | 'module' | 'data' | 'router' | 'screen' | 'profile' | `project:${number}` | `journey:${number}` | `skills:${number}`;
export type FocusView = DossierView | 'panoramic' | 'console' | 'rack' | 'data' | 'router' | 'module' | 'screen';
export interface BenchState {
  connected: boolean;
  opened: boolean;
  identity: string | null;
  module: number;
  inserted?: boolean;
  publicPreview?: boolean;
}

interface Options {
  action: (part: Part) => void;
  hover: (part: Part | null) => void;
  anchors: (points: Record<string, { x: number; y: number }>) => void;
  failure: () => void;
}

const C = {
  paper: 0xe9ecee,
  ceramic: 0xf0f2f4,
  metal: 0xa7b3c0,
  dark: 0x1e293b,
  slate: 0x334155,
  blue: 0x2255d8,
  cyan: 0x38bdf8,
  circuit: 0x1e3a4c,
  muted: 0x64748b,
  amber: 0xd97706,
  green: 0x10b981,
  gold: 0xd4af37
};

export class WorkbenchWorld {
  private dossier!: DossierStation;
  private focusBounds = new Map<FocusView, THREE.Box3>();
  private consoleBounds = new THREE.Box3();
  private screenBounds = new THREE.Box3();
  private renderDirty = true;
  private offscreen = false;
  private lastRender = 0;
  private disposed = false;
  private pendingImages = new Set<HTMLImageElement>();
  private projectDeskGroup = new THREE.Group();
  private locale: LocaleMode = 'ms';
  private floorMat!: THREE.MeshStandardMaterial;
  private studioWallMat!: THREE.MeshStandardMaterial;
  private acousticPanelMat!: THREE.MeshStandardMaterial;
  private studioTrimMat!: THREE.MeshStandardMaterial;
  private clerestoryMat!: THREE.MeshStandardMaterial;
  private studioFloorPadMat!: THREE.MeshStandardMaterial;
  private projectEsdMat!: THREE.MeshStandardMaterial;
  private serverLedMats: THREE.MeshStandardMaterial[] = [];
  private schematicCanvas!: HTMLCanvasElement;
  private schematicTex!: THREE.CanvasTexture;
  private deskSurfaceMat!: THREE.MeshStandardMaterial;
  private deskTrimMat!: THREE.MeshStandardMaterial;
  private keycardMats: THREE.MeshBasicMaterial[] = [];
  private rackLabels: { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture; maintained: boolean }[] = [];
  private renderer!: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private studioHemisphere!: THREE.HemisphereLight;
  private studioKey!: THREE.DirectionalLight;
  private studioFill!: THREE.DirectionalLight;
  private camera = new THREE.PerspectiveCamera(35, 1, 0.1, 130);
  private root = new THREE.Group();
  private geometries = new Set<THREE.BufferGeometry>();
  private materials = new Set<THREE.Material>();
  private textures = new Set<THREE.Texture>();
  private loadedImages = new Map<string, HTMLImageElement>();
  private hits: THREE.Object3D[] = [];
  private ray = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private activePointers = new Map<number, { x: number; y: number }>();
  private pinchStartDist = 0;
  private pinchStartZoom = 1;

  private lid = new THREE.Group();
  private plug = new THREE.Group();
  private owner = new THREE.Group();
  private visitor = new THREE.Group();
  private projectorHead = new THREE.Group();
  private beamGroup = new THREE.Group();
  private outerBeamMat!: THREE.MeshBasicMaterial;
  private innerBeamMat!: THREE.MeshBasicMaterial;
  private lensMat!: THREE.MeshStandardMaterial;
  private slotLedMat!: THREE.MeshStandardMaterial;
  private plugLedMat!: THREE.MeshStandardMaterial;
  private routerBarMat!: THREE.MeshStandardMaterial;
  private routerOledCanvas!: HTMLCanvasElement;
  private routerOledTex!: THREE.CanvasTexture;
  private consoleScreenCanvas!: HTMLCanvasElement;
  private consoleScreenTex!: THREE.CanvasTexture;
  private consoleLedMat!: THREE.MeshStandardMaterial;
  private screenMat!: THREE.MeshBasicMaterial;
  private holoFrameMats: THREE.MeshBasicMaterial[] = [];
  private holoScale = 0.25;
  private holoOpacity = 0;

  private leftDoor!: THREE.Mesh;
  private rightDoor!: THREE.Mesh;
  private cable!: THREE.Mesh;
  private cartridges: THREE.Group[] = [];
  private cartridgeLabels: THREE.Mesh[] = [];
  private rackPositions: THREE.Vector3[] = [];
  private insertProgress: number[] = MODULES.map(() => 0);
  private ownerProgress = 0;
  private visitorProgress = 0;

  private preview = new THREE.Group();
  private slideIndex = 0;
  private failedImages = new Set<string>();
  private screenMesh!: THREE.Mesh;
  private screenCanvas!: HTMLCanvasElement;
  private screenTexture!: THREE.CanvasTexture;
  private dataMesh!: THREE.Mesh;
  private dataMat!: THREE.MeshStandardMaterial;
  private ringMat!: THREE.MeshStandardMaterial;
  private leds: THREE.Mesh[] = [];
  private env?: THREE.WebGLRenderTarget;
  private observer?: ResizeObserver;
  private frame = 0;
  private last = 0;
  private reduced = matchMedia('(prefers-reduced-motion: reduce)');
  private paused = false;
  private dead = false;
  private orbitYaw = 0;
  private targetOrbitYaw = 0;
  private orbitPitch = 0;
  private targetOrbitPitch = 0;
  private zoomFactor = 1;
  private targetZoom = 1;

  private state: BenchState = { connected: false, opened: false, identity: null, module: 0, inserted: false };
  private focus: FocusView = 'panoramic';
  private panoramicFull = new THREE.Box3();
  private defaultCamPos = new THREE.Vector3(5.4, 8.2, 11.4);
  private defaultLookAt = new THREE.Vector3(0.55, 1.25, -0.35);
  private currentCamPos = new THREE.Vector3(5.4, 8.2, 11.4);
  private currentLookAt = new THREE.Vector3(0.55, 1.25, -0.35);

  private drag: {
    id: number;
    part: Part | null;
    x: number;
    y: number;
    moved: boolean;
    startYaw: number;
    startPitch: number;
    startLift: number;
  } | null = null;
  private selected: Part | null = null;
  private dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.6);

  // Koordinat fizikal stesen kerja
  private socket = new THREE.Vector3(-1.98, 0.28, 1.52);
  private cardReaderPos = new THREE.Vector3(0.08, 0.56, 1.17);
  private slotMouthPos = new THREE.Vector3(1.86, 1.12, -0.18);
  private plugHome = new THREE.Vector3(-2.08, 0.12, 2.08);
  private ownerHome = new THREE.Vector3(-0.18, 0.14, 2.65);
  private visitorHome = new THREE.Vector3(1.42, 0.14, 2.65);

  // Vektor guna semula bagi gelung animate() tanpa peruntukan memori setiap bingkai
  private scratchWantedCam = new THREE.Vector3();
  private scratchWantedLook = new THREE.Vector3();
  private scratchOffset = new THREE.Vector3();
  private scratchSpherical = new THREE.Spherical();
  private scratchDir = new THREE.Vector3();
  private scratchZoomedCam = new THREE.Vector3();
  private scratchCenter = new THREE.Vector3();
  private scratchProject = new THREE.Vector3();
  private scratchLidPos = new THREE.Vector3();
  private scratchUnionBounds = new THREE.Box3();
  private scratchModColor = new THREE.Color();
  private slotAbovePos = new THREE.Vector3(1.86, 1.72, -0.18);
  private slotInsidePos = new THREE.Vector3(1.86, 1.08, -0.18);
  private readonly lidAnchorOffset = new THREE.Vector3(1.2, 0.18, 0.8);
  private readonly dataAnchorPos = new THREE.Vector3(0.22, 0.78, -0.2);
  private readonly routerAnchorPos = new THREE.Vector3(-3.55, 0.85, -0.45);
  private readonly anchorPoints: Record<string, { x: number; y: number }> = {};
  private readonly deskAnchorPairs: [string, THREE.Vector3][] = [];
  private static readonly studioAnchorPoints: [string, THREE.Vector3][] = (() => {
    const entries: [string, THREE.Vector3][] = [
      ['profile', new THREE.Vector3(-4.5, 2.35, -2.6)]
    ];
    for (let i = 0; i < 7; i++) {
      entries.push([`journey:${i}`, new THREE.Vector3(-1.95 + i * 0.8, 2.08, -3.13)]);
    }
    const axisY = new THREE.Vector3(0, 1, 0);
    const skillsOrigin = new THREE.Vector3(5.2, 0.92, -2.6);
    for (let i = 0; i < 5; i++) {
      entries.push([
        `skills:${i}`,
        new THREE.Vector3(-2.24 + i * 1.12, 1.45, -0.36)
          .applyAxisAngle(axisY, -0.18)
          .add(skillsOrigin)
      ]);
    }
    return entries;
  })();

  constructor(private canvas: HTMLCanvasElement, private options: Options) {
    try {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.dossier = new DossierStation();
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
    this.renderer.setClearColor(C.paper, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    let room: RoomEnvironment | undefined;
    try {
      room = new RoomEnvironment();
      this.env = pmrem.fromScene(room, 0.04);
      this.scene.environment = this.env.texture;
    } finally {
      room?.dispose();
      pmrem.dispose();
    }

    this.scene.add(this.root);
    this.studioHemisphere = new THREE.HemisphereLight(0xf3f5fa, 0x69717d);
    this.scene.add(this.studioHemisphere);

    const sun = this.studioKey = new THREE.DirectionalLight(0xfff3e3);
    sun.position.set(-5.5, 13.5, 6.5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 18, bottom: -18, near: 0.5, far: 54 });
    sun.shadow.normalBias = 0.035;
    this.scene.add(sun);

    const fill = this.studioFill = new THREE.DirectionalLight(0xdce6f5);
    fill.position.set(6, 5.5, -5);
    this.scene.add(fill);
    this.setStudioLighting(true);

    this.build();
    this.preloadAssets();
    this.root.add(this.dossier.group);
    this.hits.push(...this.dossier.hits);
    this.cacheFocusBounds();

    this.scene.fog = new THREE.Fog(0x070b14, 20, 52);
    this.canvas.addEventListener('pointerdown', this.down);
    this.canvas.addEventListener('pointermove', this.move);
    this.canvas.addEventListener('pointerup', this.up);
    this.canvas.addEventListener('pointercancel', this.cancel);
    this.canvas.addEventListener('lostpointercapture', this.cancel);
    this.canvas.addEventListener('pointerleave', this.leave);
    this.canvas.addEventListener('wheel', this.wheel, { passive: false });
    this.canvas.addEventListener('webglcontextlost', this.contextLost);
    this.reduced.addEventListener('change', this.motionChange);

    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(canvas);
    this.resize();
    this.frame = requestAnimationFrame(this.animate);
    } catch (error) {
      this.dispose();
      throw error;
    }
  }

  private preloadAssets() {
    const urls = new Set(
      Object.values(PROJECT_MEDIA)
        .flatMap(media => [media.logo, ...media.slides.map(slide => slide.src)])
        .filter((url): url is string => !!url)
    );
    for (const url of urls) {
      const img = new Image();
      this.pendingImages.add(img);
      img.onload = () => {
        this.pendingImages.delete(img);
        if (this.dead) return;
        this.renderDirty = true;
        this.loadedImages.set(url, img);
        this.renderScreenTexture();
        this.updateCartridgeVisual();
      };
      img.onerror = () => {
        this.pendingImages.delete(img);
        this.renderDirty = true;
        if (!this.dead) {
          this.failedImages.add(url);
          this.renderScreenTexture();
        }
      };
      img.src = base + url;
    }
  }

  private material(color: number, metalness = 0.1, roughness = 0.4) {
    const m = new THREE.MeshStandardMaterial({ color, metalness, roughness });
    this.materials.add(m);
    return m;
  }

  private mesh(g: THREE.BufferGeometry, m: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0, castShadow = true) {
    this.geometries.add(g);
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(x, y, z);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  private box(parent: THREE.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material, r = 0.05, castShadow = true) {
    return this.mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, h * 0.45, w * 0.45, d * 0.45)), m, parent, x, y, z, castShadow);
  }

  private instancedBoxes(parent: THREE.Object3D, w: number, h: number, d: number, m: THREE.Material, positions: [number, number, number][], r = 0.05, castShadow = true) {
    const g = new RoundedBoxGeometry(w, h, d, 3, Math.min(r, h * 0.45, w * 0.45, d * 0.45));
    this.geometries.add(g);
    const inst = new THREE.InstancedMesh(g, m, positions.length);
    inst.castShadow = castShadow;
    inst.receiveShadow = true;
    const mat4 = new THREE.Matrix4();
    for (let i = 0; i < positions.length; i++) {
      const [px, py, pz] = positions[i];
      mat4.makeTranslation(px, py, pz);
      inst.setMatrixAt(i, mat4);
    }
    inst.instanceMatrix.needsUpdate = true;
    parent.add(inst);
    return inst;
  }

  private cylinder(parent: THREE.Object3D, r: number, h: number, x: number, y: number, z: number, m: THREE.Material, seg = 28, castShadow = true) {
    return this.mesh(new THREE.CylinderGeometry(r, r, h, seg), m, parent, x, y, z, castShadow);
  }

  private plane(parent: THREE.Object3D, w: number, h: number, x: number, y: number, z: number, m: THREE.Material, rotX = 0) {
    const geo = new THREE.PlaneGeometry(w, h);
    this.geometries.add(geo);
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    mesh.rotation.x = rotX;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    parent.add(mesh);
    return mesh;
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  private drawProjectLogo(ctx: CanvasRenderingContext2D, id: string, cx: number, cy: number, r: number, accent: string) {
    ctx.save();
    const url = PROJECT_MEDIA[id]?.logo;
    const img = url ? this.loadedImages.get(url) : undefined;
    if (img) {
      const ratio = Math.min((r * 2) / img.naturalWidth, (r * 2) / img.naturalHeight);
      const w = img.naturalWidth * ratio;
      const h = img.naturalHeight * ratio;
      ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
    } else {
      ctx.fillStyle = accent;
      this.roundRect(ctx, cx - r * 0.85, cy - r * 0.65, r * 1.7, r * 1.3, 14);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(id.slice(0, 3).toUpperCase(), cx, cy);
    }
    ctx.restore();
  }

  // Tekstur Kad Akses NFC Tanpa Sentuh (Pemilik & Pelawat): Reka bentuk Lencana Keselamatan Korporat tanpa cip kad bank
  private createKeycardTexture(isOwner: boolean) {
    const c = document.createElement('canvas');
    c.width = 640;
    c.height = 420;
    const ctx = c.getContext('2d')!;

    // Latar belakang kad lencana NFC matte
    const grad = ctx.createLinearGradient(0, 0, c.width, c.height);
    if (isOwner) {
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.55, '#1e3a8a');
      grad.addColorStop(1, '#090d16');
    } else {
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(0.6, '#334155');
      grad.addColorStop(1, '#0f172a');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, c.width, c.height);

    // Jalur aksen identiti di sebelah kiri & atas
    const accent = isOwner ? '#38bdf8' : '#f59e0b';
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, 22, c.height);
    ctx.fillRect(0, 0, c.width, 14);

    // Garisan grid keselamatan halus pada latar kad
    ctx.strokeStyle = isOwner ? 'rgba(56, 189, 248, 0.08)' : 'rgba(148, 163, 184, 0.07)';
    ctx.lineWidth = 2;
    for (let x = 40; x < c.width; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, c.height);
      ctx.stroke();
    }

    // Lubang slot tali lencana (lanyard slot) di bahagian atas tengah
    ctx.fillStyle = '#050811';
    this.roundRect(ctx, c.width / 2 - 52, 26, 104, 18, 9);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Bulatan Transponder NFC Tanpa Sentuh (Contactless RFID Symbol / BUKAN cip EMV kad bank)
    const nfcCx = 128;
    const nfcCy = 185;
    ctx.fillStyle = isOwner ? 'rgba(56, 189, 248, 0.14)' : 'rgba(245, 158, 11, 0.12)';
    ctx.beginPath();
    ctx.arc(nfcCx, nfcCy, 66, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = accent;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(nfcCx, nfcCy, 66, 0, Math.PI * 2);
    ctx.stroke();

    // Titik teras & 3 gelombang pancaran NFC tanpa sentuh
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(nfcCx - 22, nfcCy, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(nfcCx - 22, nfcCy, i * 15, -Math.PI * 0.34, Math.PI * 0.34);
      ctx.stroke();
    }
    ctx.lineCap = 'butt';

    // Lencana Tahap Akses di sebelah kanan
    ctx.fillStyle = isOwner ? 'rgba(16, 185, 129, 0.22)' : 'rgba(245, 158, 11, 0.22)';
    this.roundRect(ctx, 224, 92, 376, 44, 10);
    ctx.fill();
    ctx.strokeStyle = isOwner ? '#10b981' : '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = isOwner ? '#6ee7b7' : '#fcd34d';
    ctx.font = '700 19px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(isOwner ? 'NFC BADGE // LEVEL 4 ADMIN' : 'NFC BADGE // VISITOR PASS', 242, 114);

    // Tajuk Utama Kad Akses
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 50px sans-serif';
    ctx.fillText(isOwner ? this.t("KAD PEMILIK", "OWNER CARD") : this.t("KAD PELAWAT", "VISITOR CARD"), 224, 186);

    ctx.fillStyle = isOwner ? '#7dd3fc' : '#cbd5e1';
    ctx.font = '700 22px sans-serif';
    ctx.fillText(
      isOwner ? 'M. MUNIR · FULL-STACK DEV' : this.t("TETAMU · AKSES TERHAD (RBAC)", "GUEST · RESTRICTED ACCESS (RBAC)"),
      224,
      236
    );

    // Jalur Bawah Pengesahan RFID Tanpa Sentuh
    ctx.fillStyle = 'rgba(9, 13, 22, 0.78)';
    this.roundRect(ctx, 48, 304, c.width - 84, 82, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 17px monospace';
    ctx.fillText(
      isOwner ? this.t("CLEARANCE: PROJEKTOR HOLOGRAM AKTIF", "CLEARANCE: HOLOGRAM PROJECTOR") : this.t("CLEARANCE: TIADA KEBENARAN PROJEKTOR", "CLEARANCE: PROJECTOR RESTRICTED"),
      72,
      334
    );
    ctx.fillStyle = accent;
    ctx.font = '700 16px monospace';
    ctx.fillText(
      isOwner ? 'CONTACTLESS RFID · UID 9F-4A-88-01' : 'CONTACTLESS RFID · UID 10-00-FA-02',
      72,
      364
    );

    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    this.textures.add(t);
    return t;
  }

  // Tekstur Label Tab Game / Kaset Projek
  private createCartridgeTexture(mod: (typeof MODULES)[number], index: number) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 420;
    const ctx = c.getContext('2d')!;

    // Latar pelekat kaset
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, c.width, c.height);

    // Jalur warna sistem di bahagian atas pelekat
    ctx.fillStyle = mod.accent;
    ctx.fillRect(0, 0, c.width, 46);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 20px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(mod.code, 22, 24);
    ctx.textAlign = 'right';
    ctx.fillText(mod.category === 'maintained' ? this.t('DISENGGARA', 'MAINTAINED') : this.t('DIBANGUNKAN', 'BUILT'), c.width - 22, 24);

    // Bingkai logo rasmi
    this.drawProjectLogo(ctx, mod.id, 256, 172, 92, mod.accent);

    // Nama projek & organisasi
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(mod.name, 256, 314, 460);

    ctx.font = '600 21px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(mod.company, 256, 354, 460);

    // Anak panah penunjuk arah masuk slot ("INSERT ▼")
    ctx.fillStyle = mod.accent;
    ctx.font = '700 18px monospace';
    ctx.fillText('▼ SLOT INSERT ▼', 256, 394);

    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    this.textures.add(t);
    return t;
  }

  private updateCartridgeVisual() {
    this.cartridgeLabels.forEach((label, index) => {
      const mat = label.material as THREE.MeshBasicMaterial;
      if (mat.map) {
        mat.map.dispose();
        this.textures.delete(mat.map);
      }
      mat.map = this.createCartridgeTexture(MODULES[index], index);
      mat.needsUpdate = true;
    });
  }

  // Tekstur Jalinan Nilon (Braided Sleeve) untuk Kabel Homelab supaya tidak kelihatan seperti plastik rata
  private createBraidedCableTexture() {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, 128, 128);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 6;
    for (let i = -128; i < 256; i += 16) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 128, 128);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(i + 128, 0);
      ctx.lineTo(i, 128);
      ctx.stroke();
    }

    ctx.strokeStyle = '#38bdf8';
    ctx.globalAlpha = 0.22;
    ctx.lineWidth = 2;
    for (let i = -128; i < 256; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 128, 128);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const t = new THREE.CanvasTexture(c);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(28, 3);
    t.colorSpace = THREE.SRGBColorSpace;
    this.textures.add(t);
    return t;
  }

  // Tekstur Lantai Mikro-Simen & Grid Studio Kejuruteraan Berpijak
  private createStudioFloorTexture(dark: boolean) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d')!;

    ctx.fillStyle = dark ? '#0d1322' : '#e4e8ee';
    ctx.fillRect(0, 0, 512, 512);

    // Tekstur mikro-simen halus
    ctx.fillStyle = dark ? 'rgba(255, 255, 255, 0.015)' : 'rgba(15, 23, 42, 0.02)';
    for (let i = 0; i < 600; i++) {
      const rx = (i * 73) % 512;
      const ry = (i * 137) % 512;
      ctx.fillRect(rx, ry, 2, 2);
    }

    // Garis Grid Jubin Studio Arkitektural
    ctx.strokeStyle = dark ? 'rgba(56, 189, 248, 0.09)' : 'rgba(30, 41, 59, 0.09)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 512, 512);

    ctx.strokeStyle = dark ? 'rgba(148, 163, 184, 0.04)' : 'rgba(30, 41, 59, 0.04)';
    ctx.lineWidth = 1;
    for (let g = 128; g < 512; g += 128) {
      ctx.beginPath();
      ctx.moveTo(g, 0);
      ctx.lineTo(g, 512);
      ctx.moveTo(0, g);
      ctx.lineTo(512, g);
      ctx.stroke();
    }

    const t = new THREE.CanvasTexture(c);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(36, 36);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    this.textures.add(t);
    return t;
  }

  // Lukisan Skrin OLED Mini pada Panel Hadapan Unit Homelab
  private renderRouterOled() {
    if (!this.routerOledCanvas) return;
    const c = this.routerOledCanvas;
    const ctx = c.getContext('2d')!;
    const active = this.state.connected;

    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.strokeStyle = active ? '#10b981' : '#334155';
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, c.width - 8, c.height - 8);

    ctx.fillStyle = active ? '#34d399' : '#64748b';
    ctx.font = '700 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('ZTA-NODE // 10GbE', 14, 28);

    ctx.fillStyle = active ? '#38bdf8' : '#f59e0b';
    ctx.font = '800 20px sans-serif';
    ctx.fillText(active ? 'UPLINK: ACTIVE' : 'UPLINK: STANDBY', 14, 58);

    // Bar beban trafik mini
    for (let i = 0; i < 8; i++) {
      const h = active ? 10 + ((i * 7) % 18) : 4;
      ctx.fillStyle = active ? (i > 5 ? '#38bdf8' : '#10b981') : '#1e293b';
      ctx.fillRect(14 + i * 24, 92 - h, 16, h);
    }

    if (this.routerOledTex) this.routerOledTex.needsUpdate = true;
  }

  // Lukisan Papan Skematik Arkitektur Sistem di Dinding Belakang Studio
  private renderSchematicBoard() {
    if (!this.schematicCanvas) return;
    const c = this.schematicCanvas;
    const ctx = c.getContext('2d')!;
    const en = this.locale === 'en';

    ctx.fillStyle = '#070c17';
    ctx.fillRect(0, 0, c.width, c.height);

    // Grid halus skematik
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < c.width; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, c.height);
      ctx.stroke();
    }
    for (let y = 0; y < c.height; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(c.width, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, c.width - 16, c.height - 16);

    // Header Papan Skematik
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(10, 10, c.width - 20, 62);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 22px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(en ? 'STUDIO LAB // SYSTEM & SECURITY TOPOLOGY' : 'MAKMAL STUDIO // TOPOLOGI SISTEM & KESELAMATAN', 32, 48);
    ctx.fillStyle = '#10b981';
    ctx.textAlign = 'right';
    ctx.fillText('RBAC · DOCKER SWARM · ZERO-TRUST', c.width - 32, 48);

    // 4 Nod Topologi Bersambung dengan Garisan Aliran
    const nodes = [
      { title: 'EDGE / WAF', sub: en ? 'Cloudflare · TLS 1.3' : 'Cloudflare · TLS 1.3', col: '#38bdf8' },
      { title: 'AUTH / RBAC', sub: en ? 'NFC Token · Session' : 'Token NFC · Sesi', col: '#0ea5e9' },
      { title: 'YHCM CORE', sub: 'EMESYS · SUTERA · ADiMS', col: '#10b981' },
      { title: 'DATA / CLUSTER', sub: 'PostgreSQL 17 · MariaDB', col: '#818cf8' }
    ];

    const boxW = 240;
    const boxH = 148;
    const gap = 54;
    const startX = (c.width - (nodes.length * boxW + (nodes.length - 1) * gap)) / 2;
    const boxY = 128;

    // Garisan penghubung antara blok
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    for (let i = 0; i < nodes.length - 1; i++) {
      const x1 = startX + i * (boxW + gap) + boxW;
      const x2 = x1 + gap;
      const y = boxY + boxH / 2;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(x2 - 4, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    nodes.forEach((n, idx) => {
      const x = startX + idx * (boxW + gap);
      ctx.fillStyle = '#0f172a';
      this.roundRect(ctx, x, boxY, boxW, boxH, 12);
      ctx.fill();
      ctx.strokeStyle = n.col;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = n.col;
      ctx.fillRect(x, boxY, boxW, 10);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 24px monospace';
      ctx.fillText(n.title, x + boxW / 2, boxY + 68);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 17px sans-serif';
      ctx.fillText(n.sub, x + boxW / 2, boxY + 108, boxW - 24);
    });

    // Bar nota bawah
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      en
        ? 'FULL-STACK WORKBENCH: SYSTEM MAINTENANCE · NEW MODULE DEVELOPMENT · BUG FIXING'
        : 'MEJA KERJA FULL-STACK: PENYELENGGARAAN SISTEM · MODUL BAHARU · PEMBAIKAN PEPIJAT',
      c.width / 2,
      334
    );

    if (this.schematicTex) this.schematicTex.needsUpdate = true;
  }

  // Lukisan Skrin Kecil Status Akses di Atas Papan Konsol (Menandakan Kad Pemilik / Pelawat / Pautan / Slot)
  private renderConsoleScreen() {
    if (!this.consoleScreenCanvas) return;
    const c = this.consoleScreenCanvas;
    const ctx = c.getContext('2d')!;
    const mod = MODULES[this.state.module];
    const connected = this.state.connected;
    const isOwner = this.state.identity === 'owner';
    const isVisitor = this.state.identity === 'visitor';
    const inserted = !!this.state.inserted;
    const allowed = this.state.publicPreview || (connected && isOwner);
    const denied = connected && isVisitor;

    // Latar belakang skrin OLED konsol
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, c.width, c.height);

    const accent = denied ? '#f59e0b' : allowed ? '#10b981' : isOwner ? '#38bdf8' : isVisitor ? '#f59e0b' : '#38bdf8';

    // Bingkai dalam skrin OLED
    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    this.roundRect(ctx, 8, 8, c.width - 16, c.height - 16, 16);
    ctx.stroke();

    // Header Skrin Kecil Konsol
    ctx.fillStyle = '#0f172a';
    this.roundRect(ctx, 16, 16, c.width - 32, 46, 10);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 17px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('CONSOLE ACCESS MONITOR', 30, 39);

    ctx.fillStyle = connected ? '#34d399' : '#f87171';
    ctx.textAlign = 'right';
    ctx.fillText(connected ? '● LINK: ONLINE' : '○ LINK: OFFLINE', c.width - 30, 39);

    // Panel Status Kad NFC Utama (Tengah)
    const boxY = 74;
    const boxH = 196;
    ctx.fillStyle = denied
      ? 'rgba(245, 158, 11, 0.16)'
      : allowed
        ? 'rgba(16, 185, 129, 0.16)'
        : 'rgba(15, 23, 42, 0.9)';
    this.roundRect(ctx, 22, boxY, c.width - 44, boxH, 14);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    let badgeText = this.t("NFC READER // MENUNGGU IMBASAN", "NFC READER // AWAITING SCAN");
    let mainTitle = this.t("TIADA KAD AKSES", "NO ACCESS CARD");
    let subLine = connected
      ? this.t("Letakkan Kad PEMILIK atau PELAWAT pada pad NFC", "Place the OWNER or VISITOR card on the NFC pad")
      : this.t("Sambungkan kabel Homelab di sebelah kiri dahulu", "Connect the Homelab cable on the left first");

    if (isOwner && !connected) {
      badgeText = this.t("NFC BADGE // KAD PEMILIK DIKESAN", "NFC BADGE // OWNER DETECTED");
      mainTitle = this.t("KAD PEMILIK (OFFLINE)", "OWNER CARD (OFFLINE)");
      subLine = this.t("Cucuk kabel Homelab untuk mengaktifkan pengesahan", "Connect the Homelab cable to activate verification");
    } else if (isVisitor && !connected) {
      badgeText = this.t("NFC BADGE // KAD PELAWAT DIKESAN", "NFC BADGE // VISITOR DETECTED");
      mainTitle = this.t("KAD PELAWAT (OFFLINE)", "VISITOR CARD (OFFLINE)");
      subLine = this.t("Cucuk kabel Homelab untuk melihat simulasi RBAC", "Connect the cable to explore the RBAC simulation");
    } else if (denied) {
      badgeText = this.t("RBAC SECURITY // AKSES DISEKAT", "RBAC SECURITY // ACCESS DENIED");
      mainTitle = this.t("KAD PELAWAT · DISEKAT", "VISITOR CARD · DENIED");
      subLine = this.t("Tetamu tidak dibenarkan membuka projektor hologram", "Visitors cannot activate the hologram projector");
    } else if (allowed && !inserted) {
      badgeText = 'AUTH VERIFIED // LEVEL 4 ADMIN';
      mainTitle = this.t("KAD PEMILIK SAH", "VERIFIED OWNER CARD");
      subLine = this.t("Akses penuh dibenarkan: masukkan Tab Game ke slot", "Access granted: insert a project cartridge");
    } else if (allowed && inserted) {
      badgeText = 'OPTICAL HOLOGRAM // ACTIVE';
      mainTitle = `${this.t('TAYANGAN', 'PROJECTION')}: ${mod.name}`;
      subLine = this.t("Keahlian: Kad Pemilik Sah · Projektor Aktif", "Verified owner card · Projector active");
    }

    // Lencana kecil di dalam kotak status
    ctx.fillStyle = denied ? '#d97706' : allowed ? '#059669' : '#1e293b';
    this.roundRect(ctx, 42, boxY + 18, c.width - 84, 38, 8);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, c.width / 2, boxY + 37);

    // Tajuk Status Kad Besar & Jelas
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 38px sans-serif';
    ctx.fillText(mainTitle, c.width / 2, boxY + 102, c.width - 76);

    // Sub-baris penerangan
    ctx.fillStyle = denied ? '#fde68a' : allowed ? '#a7f3d0' : '#cbd5e1';
    ctx.font = '600 20px sans-serif';
    ctx.fillText(subLine, c.width / 2, boxY + 154, c.width - 76);

    // Bar Bawah: 3 Penunjuk Komponen Fizikal (LINK / NFC / SLOT)
    const pills = [
      {
        label: '1. HOMELAB',
        val: connected ? this.t("AKTIF", "ACTIVE") : 'OFF',
        col: connected ? '#10b981' : '#475569'
      },
      {
        label: this.t("2. KAD NFC", "2. NFC CARD"),
        val: isOwner ? this.t("PEMILIK", "OWNER") : isVisitor ? this.t("PELAWAT", "VISITOR") : this.t("TIADA", "NONE"),
        col: isOwner ? '#10b981' : isVisitor ? '#f59e0b' : '#475569'
      },
      {
        label: this.t("3. SLOT TAB", "3. CARTRIDGE"),
        val: inserted ? mod.name.slice(0, 8) : this.t("KOSONG", "EMPTY"),
        col: inserted ? '#38bdf8' : '#475569'
      }
    ];

    const pw = 186;
    const ph = 94;
    const gap = 16;
    const startX = (c.width - (pw * 3 + gap * 2)) / 2;
    const py = 286;

    pills.forEach((p, idx) => {
      const px = startX + idx * (pw + gap);
      ctx.fillStyle = '#0f172a';
      this.roundRect(ctx, px, py, pw, ph, 10);
      ctx.fill();
      ctx.strokeStyle = p.col;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 15px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.label, px + pw / 2, py + 28);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 22px sans-serif';
      ctx.fillText(p.val, px + pw / 2, py + 64, pw - 16);
    });

    if (this.consoleScreenTex) this.consoleScreenTex.needsUpdate = true;
  }

  // Lukisan Paparan Projektor Hologram Terapung (HANYA Menyala Apabila Kabel + Kad Pemilik + Tab Game Lengkap)
  private renderScreenTexture() {
    if (!this.screenCanvas) return;
    const c = this.screenCanvas;
    const ctx = c.getContext('2d')!;
    const mod = MODULES[this.state.module];
    const media = PROJECT_MEDIA[mod.id];
    const slide = media.slides[this.slideIndex];
    const allowed = this.state.publicPreview || (this.state.connected && this.state.identity === 'owner');
    const activeProjection = allowed && !!this.state.inserted;

    // Bersihkan kanvas kepada 100% lut sinar; jika projektor belum aktif, tiada hologram di udara
    ctx.clearRect(0, 0, c.width, c.height);

    if (!activeProjection) {
      this.screenTexture.needsUpdate = true;
      return;
    }

    // === TAYANGAN HOLOGRAM OPTIK AKTIF (SAMPEL UI SEBENAR TANPA BINGKAI MONITOR KAKU) ===
    const bgGrad = ctx.createLinearGradient(0, 0, 0, c.height);
    bgGrad.addColorStop(0, 'rgba(8, 15, 30, 0.92)');
    bgGrad.addColorStop(1, 'rgba(6, 11, 22, 0.95)');
    ctx.fillStyle = bgGrad;
    this.roundRect(ctx, 16, 16, c.width - 32, c.height - 32, 22);
    ctx.fill();

    // Garis sempadan pendarfluor hologram
    ctx.strokeStyle = mod.accent;
    ctx.lineWidth = 4;
    this.roundRect(ctx, 16, 16, c.width - 32, c.height - 32, 22);
    ctx.stroke();

    // Siku Retikel Hologram di 4 Penjuru Kanvas
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    const bLen = 48;
    // Kiri-Atas
    ctx.beginPath();
    ctx.moveTo(12, 12 + bLen);
    ctx.lineTo(12, 12);
    ctx.lineTo(12 + bLen, 12);
    ctx.stroke();
    // Kanan-Atas
    ctx.beginPath();
    ctx.moveTo(c.width - 12 - bLen, 12);
    ctx.lineTo(c.width - 12, 12);
    ctx.lineTo(c.width - 12, 12 + bLen);
    ctx.stroke();
    // Kiri-Bawah
    ctx.beginPath();
    ctx.moveTo(12, c.height - 12 - bLen);
    ctx.lineTo(12, c.height - 12);
    ctx.lineTo(12 + bLen, c.height - 12);
    ctx.stroke();
    // Kanan-Bawah
    ctx.beginPath();
    ctx.moveTo(c.width - 12 - bLen, c.height - 12);
    ctx.lineTo(c.width - 12, c.height - 12);
    ctx.lineTo(c.width - 12, c.height - 12 - bLen);
    ctx.stroke();

    // Bar Header Hologram Atas
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    this.roundRect(ctx, 28, 26, c.width - 56, 82, 14);
    ctx.fill();
    ctx.fillStyle = mod.accent;
    ctx.fillRect(28, 104, c.width - 56, 4);

    // Lencana Logo Rasmi di Kiri Atas
    ctx.fillStyle = '#ffffff';
    this.roundRect(ctx, 44, 34, 64, 64, 12);
    ctx.fill();
    this.drawProjectLogo(ctx, mod.id, 76, 66, 28, mod.accent);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 33px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(mod.name, 128, 52);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 19px sans-serif';
    ctx.fillText(`${mod.company} · ${this.locale === 'en' ? mod.roleEn : mod.role}`, 128, 82, 950);

    // Lencana Status Hologram di Kanan Atas
    ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
    this.roundRect(ctx, c.width - 430, 38, 386, 50, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#7dd3fc';
    ctx.font = '700 18px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(
      media.slides.length > 1
        ? `${this.t('HOLOGRAM OPTIK · SLAID', 'OPTICAL HOLOGRAM · SLIDE')} ${this.slideIndex + 1}/${media.slides.length}`
        : this.t("PANCARAN HOLOGRAM OPTIK AKTIF", "OPTICAL HOLOGRAM ACTIVE"),
      c.width - 60,
      63
    );

    // Ruang Kandungan Utama (y: 118 hingga 908)
    const img = slide ? this.loadedImages.get(slide.src) : undefined;
    if (img) {
      const availW = c.width - 88;
      const availH = 778;
      const ratio = Math.min(availW / img.naturalWidth, availH / img.naturalHeight);
      const w = img.naturalWidth * ratio;
      const h = img.naturalHeight * ratio;
      const ix = (c.width - w) / 2;
      const iy = 118 + (availH - h) / 2;

      ctx.save();
      ctx.shadowColor = 'rgba(56, 189, 248, 0.28)';
      ctx.shadowBlur = 24;
      ctx.fillStyle = '#090d16';
      this.roundRect(ctx, ix - 6, iy - 6, w + 12, h + 12, 12);
      ctx.fill();
      ctx.restore();

      ctx.drawImage(img, ix, iy, w, h);

      // Bingkai nipis bercahaya mengelilingi sampel UI
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 2;
      this.roundRect(ctx, ix - 2, iy - 2, w + 4, h + 4, 8);
      ctx.stroke();
    } else {
      // Kad identiti besar: boleh dibaca dari pandangan meja; butiran penuh dalam bahagian Sistem.
      ctx.fillStyle = 'rgba(17, 24, 39, 0.92)';
      this.roundRect(ctx, 64, 140, c.width - 128, 740, 22);
      ctx.fill();
      ctx.strokeStyle = mod.accent;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      this.roundRect(ctx, 120, 230, 440, 440, 36);
      ctx.fill();
      this.drawProjectLogo(ctx, mod.id, 340, 450, 175, mod.accent);

      const rx = 640;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = mod.accent;
      ctx.font = '700 30px sans-serif';
      ctx.fillText(this.locale === 'en' ? mod.badgeEn : mod.badge, rx, 290, 860);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '800 112px sans-serif';
      ctx.fillText(mod.name, rx, 410, 860);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 38px sans-serif';
      ctx.fillText(mod.company, rx, 475, 860);

      let tx = rx;
      let ty = 560;
      mod.stack.slice(0, 4).forEach(tech => {
        ctx.font = '700 32px sans-serif';
        const tw = ctx.measureText(tech).width + 48;
        if (tx + tw > c.width - 110) { tx = rx; ty += 82; }
        ctx.fillStyle = '#1e293b';
        this.roundRect(ctx, tx, ty, tw, 64, 12);
        ctx.fill();
        ctx.strokeStyle = mod.accent;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(tech, tx + 24, ty + 43);
        tx += tw + 18;
      });
    }

    // Bar Bawah Hologram
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    this.roundRect(ctx, 28, 910, c.width - 56, 64, 12);
    ctx.fill();
    ctx.textAlign = 'left';
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 20px sans-serif';
    ctx.fillText(
      slide ? `${this.locale === 'en' ? slide.labelEn : slide.label} · ${this.locale === 'en' ? slide.sourceEn : slide.source}  |  Stack: ${mod.stack.join(' · ')}` : mod.company,
      48,
      942
    );

    ctx.textAlign = 'right';
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 19px monospace';
    ctx.fillText(
      media.slides.length > 1
        ? `${this.t('KLIK HOLOGRAM: SLAID SETERUSNYA', 'CLICK HOLOGRAM: NEXT SLIDE')} (${this.slideIndex + 1}/${media.slides.length})`
        : this.focus === 'screen' || this.focus === 'data'
          ? this.t("KLIK ATAU ESC UNTUK PANDANGAN MEJA", "CLICK OR ESC FOR DESK VIEW")
          : this.t("KLIK HOLOGRAM UNTUK ZUM PENUH", "CLICK HOLOGRAM TO ZOOM"),
      c.width - 48,
      942
    );

    this.screenTexture.needsUpdate = true;
  }

  private drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';
    let cy = y;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth) {
        ctx.fillText(line, x, cy);
        line = word;
        cy += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, cy);
  }

  nextSample() {
    this.renderDirty = true;
    const slides = PROJECT_MEDIA[MODULES[this.state.module].id].slides;
    this.slideIndex = slides.length ? (this.slideIndex + 1) % slides.length : 0;
    this.renderScreenTexture();
  }

  private interactive(object: THREE.Object3D, part: Part) {
    object.traverse(o => {
      if (o instanceof THREE.Mesh) {
        o.userData.part = part;
        this.hits.push(o);
      }
    });
  }

  private build() {
    const ceramic = this.material(C.ceramic, 0.04, 0.32);
    const metal = this.material(C.metal, 0.85, 0.25);
    const dark = this.material(C.dark, 0.5, 0.38);
    const slate = this.material(C.slate, 0.4, 0.45);
    const blue = this.material(C.blue, 0.3, 0.32);
    const pcb = this.material(C.circuit, 0.08, 0.64);
    const gold = this.material(C.gold, 0.9, 0.22);

    // === 0. PELANTAR KONSOL BERPADU UTAMA (THE SOVEREIGN UNIFIED COMMAND PLINTH) ===
    this.floorMat = new THREE.MeshStandardMaterial({
      color: 0x070b14,
      roughness: 0.95,
      metalness: 0.02
    });
    this.materials.add(this.floorMat);
    const floor = this.mesh(new THREE.PlaneGeometry(280, 280), this.floorMat, this.scene, 0, -0.05, 0);
    floor.rotation.x = -Math.PI / 2;
    floor.castShadow = false;
    floor.receiveShadow = true;

    // Pelantar Konsol Bersepadu Tunggal Terapung (Lebar 16.4m × Kedalaman 8.8m, permukaan atas pada y = 0.92)
    this.projectDeskGroup.position.set(0, 0.92, 0);
    this.root.add(this.projectDeskGroup);

    this.deskSurfaceMat = this.material(0x111927, 0.45, 0.48);
    this.deskTrimMat = this.material(0x1e2b40, 0.78, 0.28);
    this.projectEsdMat = this.material(0x0a101d, 0.2, 0.85);

    // Casis Utama Pelantar Konsol Berchamfer
    this.box(this.projectDeskGroup, 16.4, 0.24, 8.8, 0.45, -0.12, -0.35, this.deskTrimMat, 0.12);
    this.box(this.projectDeskGroup, 16.0, 0.08, 8.4, 0.45, -0.02, -0.35, this.deskSurfaceMat, 0.06);

    // Pelapik ESD Atas Pelantar
    const projectEsdTop = this.box(this.projectDeskGroup, 15.4, 0.015, 7.8, 0.45, 0.025, -0.35, this.projectEsdMat, 0.04);
    projectEsdTop.castShadow = false;

    // Jalur Aksen Pendarfluor Sian Mengelilingi Pelantar Konsol
    const deskAccentStrip = this.material(C.cyan, 0.2, 0.2);
    deskAccentStrip.emissive.set(0x0ea5e9);
    deskAccentStrip.emissiveIntensity = 0.55;
    this.box(this.projectDeskGroup, 15.6, 0.025, 0.04, 0.45, 0.025, 3.95, deskAccentStrip, 0.01);
    this.box(this.projectDeskGroup, 15.6, 0.025, 0.04, 0.45, 0.025, -4.65, deskAccentStrip, 0.01);
    this.box(this.projectDeskGroup, 0.04, 0.025, 8.5, -7.35, 0.025, -0.35, deskAccentStrip, 0.01);
    this.box(this.projectDeskGroup, 0.04, 0.025, 8.5, 8.25, 0.025, -0.35, deskAccentStrip, 0.01);

    // Kaki Keluli Padat Berpelapik Loyang Emas
    const legPositions: [number, number][] = [
      [-7.1, -4.2],
      [0.45, -4.2],
      [8.0, -4.2],
      [-7.1, 3.5],
      [0.45, 3.5],
      [8.0, 3.5]
    ];
    for (const [lx, lz] of legPositions) {
      this.cylinder(this.projectDeskGroup, 0.12, 0.74, lx, -0.55, lz, dark);
      this.cylinder(this.projectDeskGroup, 0.18, 0.06, lx, -0.89, lz, gold);
      this.cylinder(this.projectDeskGroup, 0.15, 0.08, lx, -0.2, lz, metal);
    }

    // Aksesori Tempat Kerja Jurutera di Sudut Kiri Depan (Lampu Tugas, Buku Nota & Cawan Kopi)
    this.buildDeskTaskProps(metal, dark, ceramic, slate);

    // === 1. DEK KONSOL PROJEKTOR UTAMA ===
    const base = new THREE.Group();
    base.position.set(0.5, 0.2, 0.25);
    this.projectDeskGroup.add(base);

    // Casis Bawah Logam Berchamfer & Papan Atas
    this.box(base, 4.4, 0.32, 3.45, 0, 0, 0, metal, 0.14);
    this.box(base, 4.18, 0.12, 3.24, 0, 0.22, 0, pcb, 0.06);

    // Kaki Getah & Skru Penjuru
    for (const x of [-1.96, 1.96]) {
      for (const z of [-1.5, 1.5]) {
        this.cylinder(base, 0.11, 0.17, x, -0.2, z, dark, 16, false);
        this.cylinder(base, 0.065, 0.025, x, 0.3, z, gold, 14, false);
      }
    }

    // Sirip Penyejuk Bawah
    this.instancedBoxes(
      base,
      0.07,
      0.12,
      2.6,
      metal,
      Array.from({ length: 16 }, (_, i): [number, number, number] => [-1.6 + i * 0.21, -0.17, 0]),
      0.01,
      false
    );

    // === 2. TELAGA EMITTER PROJEKTOR HOLOGRAM & PINTU GELANGSAR MEKANIKAL ===
    // Bingkai Telaga Emitter (Recessed Optical Emitter Well)
    this.dataMat = this.material(C.circuit, 0.45, 0.4);
    this.dataMesh = this.box(base, 1.32, 0.08, 1.18, -0.38, 0.28, -0.45, this.dataMat, 0.04);

    // Kepala Lensa Projektor Hologram (mendongak ke atas/belakang tanpa menembusi pintu semasa tertutup)
    this.projectorHead.position.set(-0.38, 0.16, -0.45);
    this.projectorHead.rotation.x = 0.22;
    base.add(this.projectorHead);

    this.cylinder(this.projectorHead, 0.25, 0.22, 0, 0, 0, dark);
    this.cylinder(this.projectorHead, 0.27, 0.06, 0, 0.08, 0, gold);
    this.lensMat = this.material(0x0ea5e9, 0.15, 0.12);
    this.cylinder(this.projectorHead, 0.21, 0.04, 0, 0.11, 0, this.lensMat);

    this.interactive(this.dataMesh, 'data');
    this.interactive(this.projectorHead, 'data');

    // Pintu Gelangsar Mekanikal Kiri & Kanan (berada di y=0.42, tidak menyentuh lensa mahupun slotBay)
    this.leftDoor = this.box(base, 0.56, 0.055, 1.06, -0.66, 0.42, -0.45, blue, 0.02);
    this.rightDoor = this.box(base, 0.56, 0.055, 1.06, -0.1, 0.42, -0.45, blue, 0.02);
    // Jalur pemegang logam halus pada pintu gelangsar
    this.box(this.leftDoor, 0.035, 0.065, 0.72, 0.22, 0.01, 0, metal, 0.01);
    this.box(this.rightDoor, 0.035, 0.065, 0.72, -0.22, 0.01, 0, metal, 0.01);
    this.interactive(this.leftDoor, 'lid');
    this.interactive(this.rightDoor, 'lid');

    this.lid.position.set(0.12, 0.68, -0.2);
    this.projectDeskGroup.add(this.lid);

    // === 3. PAD PENGIMBAS KAD PINTAR NFC (DI KIRI-HADAPAN DEK KONSOL) ===
    const padGroup = new THREE.Group();
    padGroup.position.set(-0.42, 0.3, 0.92);
    base.add(padGroup);

    this.box(padGroup, 1.56, 0.08, 1.04, 0, 0, 0, dark, 0.04);
    this.ringMat = this.material(C.blue, 0.25, 0.3);
    this.box(padGroup, 1.44, 0.09, 0.92, 0, 0.01, 0, this.ringMat, 0.03);
    this.box(padGroup, 1.32, 0.1, 0.8, 0, 0.02, 0, slate, 0.02);

    // === 3B. SKRIN KECIL STATUS AKSES DI ATAS PAPAN KONSOL (DI KANAN-HADAPAN DEK KONSOL, RATA & KEMAS) ===
    const consoleScreenGroup = new THREE.Group();
    consoleScreenGroup.position.set(1.26, 0.3, 0.92);
    base.add(consoleScreenGroup);

    // Perumah Berchamfer & Bingkai Skrin Kecil Konsol (Flush-Mounted di atas Papan Konsol)
    this.box(consoleScreenGroup, 1.52, 0.08, 1.04, 0, 0, 0, dark, 0.04);
    this.consoleLedMat = this.material(C.cyan, 0.25, 0.3);
    this.box(consoleScreenGroup, 1.42, 0.09, 0.94, 0, 0.01, 0, this.consoleLedMat, 0.03);
    this.box(consoleScreenGroup, 1.34, 0.1, 0.86, 0, 0.02, 0, this.material(0x060a12, 0.1, 0.8), 0.02);

    this.consoleScreenCanvas = document.createElement('canvas');
    this.consoleScreenCanvas.width = 640;
    this.consoleScreenCanvas.height = 400;
    this.consoleScreenTex = new THREE.CanvasTexture(this.consoleScreenCanvas);
    this.consoleScreenTex.colorSpace = THREE.SRGBColorSpace;
    this.consoleScreenTex.anisotropy = 4;
    this.textures.add(this.consoleScreenTex);
    this.renderConsoleScreen();

    const consoleScreenMat = new THREE.MeshBasicMaterial({
      map: this.consoleScreenTex,
      toneMapped: false
    });
    this.materials.add(consoleScreenMat);
    const consoleScreenPlane = this.mesh(
      new THREE.PlaneGeometry(1.28, 0.8),
      consoleScreenMat,
      consoleScreenGroup,
      0,
      0.073,
      0
    );
    consoleScreenPlane.rotation.x = -Math.PI / 2;
    consoleScreenPlane.castShadow = false;

    // === 4. DOK SLOT PEMBACA TAB GAME BERLEKUK TENGAH (DI KANAN-BELAKANG DEK KONSOL) ===
    const slotBay = new THREE.Group();
    slotBay.position.set(1.36, 0.32, -0.45);
    base.add(slotBay);

    // Tapak Bawah Dok Kaset
    this.box(slotBay, 1.58, 0.16, 0.96, 0, 0, 0, ceramic, 0.05);
    this.box(slotBay, 1.46, 0.18, 0.84, 0, 0.02, 0, dark, 0.04);
    // Mulut Celah Penyambung Pin Gelap
    this.box(slotBay, 1.32, 0.2, 0.24, 0, 0.04, 0.02, this.material(0x060911, 0.1, 0.9), 0.02);
    // Dinding Penyandar Belakang Kaset (menyokong belakang tab game pada sudut tegak-condong)
    this.box(slotBay, 1.46, 0.42, 0.18, 0, 0.2, -0.28, ceramic, 0.04);
    this.box(slotBay, 1.34, 0.44, 0.12, 0, 0.21, -0.22, dark, 0.03);
    // Dua Bahu Pemandu Sisi Kiri & Kanan (memegang tepi kaset manakala ruang tengah terbuka luas untuk label)
    this.box(slotBay, 0.16, 0.34, 0.56, -0.68, 0.16, 0.04, ceramic, 0.03);
    this.box(slotBay, 0.16, 0.34, 0.56, 0.68, 0.16, 0.04, ceramic, 0.03);
    // Bibir Hadapan Rendah dengan Jalur LED Status Slot
    this.slotLedMat = this.material(C.muted, 0.2, 0.3);
    this.box(slotBay, 1.08, 0.04, 0.06, 0, 0.11, 0.38, this.slotLedMat, 0.01);

    // === 5. RAK KASET PERKAKASAN 3D 2-ZON BERLABEL (DISENGGARA YHCM vs PROJEK DIBANGUNKAN) ===
    const rackBase = new THREE.Group();
    rackBase.position.set(4.4, 0.08, 0.15);
    this.projectDeskGroup.add(rackBase);
    const rackBodyMat = this.material(0x162032, 0.55, 0.42);
    const rackRailMat = this.material(0x334155, 0.72, 0.28);
    const rackSlotMat = this.material(0x0b111e, 0.3, 0.75);
    const maintTrimMat = this.material(0x2563eb, 0.35, 0.3);
    const builtTrimMat = this.material(0x0d9488, 0.35, 0.3);

    // Zon Kiri: Sistem Disenggara (YHCM) - 3 Slot Kaset (Panjang 2.95m, muat selesa di atas meja)
    this.box(rackBase, 1.48, 0.22, 2.95, -0.78, 0.04, -0.28, rackBodyMat, 0.06);
    this.box(rackBase, 0.08, 0.46, 2.85, -1.48, 0.2, -0.28, rackRailMat, 0.03);
    this.box(rackBase, 0.08, 0.46, 2.85, -0.08, 0.2, -0.28, rackRailMat, 0.03);
    for (const x of [-1.48, -0.08]) {
      this.box(rackBase, 0.045, 0.025, 2.78, x, 0.44, -0.28, maintTrimMat, 0.01);
    }

    // Zon Kanan: Projek Dibangunkan - 5 Slot Kaset (Panjang 4.65m, muat selesa di atas meja)
    this.box(rackBase, 1.48, 0.22, 4.65, 0.86, 0.04, 0.58, rackBodyMat, 0.06);
    this.box(rackBase, 0.08, 0.46, 4.55, 0.16, 0.2, 0.58, rackRailMat, 0.03);
    this.box(rackBase, 0.08, 0.46, 4.55, 1.56, 0.2, 0.58, rackRailMat, 0.03);
    for (const x of [0.16, 1.56]) {
      this.box(rackBase, 0.045, 0.025, 4.48, x, 0.44, 0.58, builtTrimMat, 0.01);
    }

    // Papan Tanda Kepala Rak 3D (Marquee Signboard) Bercondong menghadap kamera
    for (const maintained of [true, false]) {
      const gx = maintained ? -0.78 : 0.86;
      const gz = maintained ? -1.88 : -1.88;
      const signGroup = new THREE.Group();
      signGroup.position.set(gx, 0.56, gz);
      signGroup.rotation.x = -0.48;
      rackBase.add(signGroup);

      this.box(signGroup, 1.48, 0.48, 0.1, 0, 0, -0.03, rackRailMat, 0.03);
      this.box(signGroup, 1.42, 0.42, 0.08, 0, 0, 0, maintained ? maintTrimMat : builtTrimMat, 0.02);
      this.cylinder(rackBase, 0.04, 0.42, gx - 0.52, 0.32, gz - 0.06, metal);
      this.cylinder(rackBase, 0.04, 0.42, gx + 0.52, 0.32, gz - 0.06, metal);

      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 180;
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      this.textures.add(texture);
      this.rackLabels.push({ canvas, texture, maintained });
      const material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
      this.materials.add(material);
      const label = this.mesh(new THREE.PlaneGeometry(1.36, 0.38), material, signGroup, 0, 0, 0.045);
      label.castShadow = false;
    }
    this.renderRackLabels();

    MODULES.forEach((mod, index) => {
      const col = mod.category === 'maintained' ? 0 : 1;
      const row = col === 0 ? index : index - 3;
      const rx = col === 0 ? -0.78 : 0.86;
      const rz = -1.18 + row * 0.88;
      const homePos = new THREE.Vector3(4.4 + rx, 0.5, 0.15 + rz);
      this.rackPositions.push(homePos);
      // Lantai telaga slot & penyandar belakang setiap petak kaset
      this.box(rackBase, 1.32, 0.08, 0.82, rx, 0.14, rz, rackSlotMat, 0.02);
      this.box(rackBase, 1.34, 0.24, 0.08, rx, 0.26, rz - 0.38, rackRailMat, 0.02);

      const cartridge = new THREE.Group();
      cartridge.position.copy(homePos);
      this.projectDeskGroup.add(cartridge);
      this.cartridges.push(cartridge);

      this.box(cartridge, 1.24, 0.18, 0.82, 0, 0, 0, dark, 0.035);
      const accentColor = new THREE.Color(mod.accent);
      const accentMat = this.material(accentColor.getHex(), 0.35, 0.35);
      this.box(cartridge, 1.16, 0.045, 0.14, 0, 0.09, -0.32, accentMat, 0.015);
      for (let r = 0; r < 3; r++) {
        this.box(cartridge, 0.88, 0.02, 0.025, 0, 0.1, -0.18 + r * 0.05, slate, 0.005, false);
      }
      this.box(cartridge, 0.9, 0.07, 0.1, 0, -0.02, 0.38, gold, 0.01, false);

      const mat = new THREE.MeshBasicMaterial({ map: this.createCartridgeTexture(mod, index), toneMapped: false });
      this.materials.add(mat);
      const label = this.mesh(new THREE.PlaneGeometry(1.12, 0.68), mat, cartridge, 0, 0.095, 0.05, false);
      label.rotation.x = -Math.PI / 2;
      this.cartridgeLabels.push(label);

      this.interactive(cartridge, ('project:' + index) as Part);
    });

    // === 6. PAPARAN PROJEKTOR HOLOGRAM TERAPUNG (PADAM SEPENUHNYA SEHINGGA KAD PEMILIK & TAB GAME DIMASUKKAN) ===
    this.preview.position.set(-0.22, 3.02, -1.68);
    this.preview.rotation.x = 0.04;
    this.preview.visible = false;
    this.projectDeskGroup.add(this.preview);

    this.screenCanvas = document.createElement('canvas');
    this.screenCanvas.width = 1600;
    this.screenCanvas.height = 1000;
    this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);
    this.screenTexture.colorSpace = THREE.SRGBColorSpace;
    this.screenTexture.anisotropy = 4;
    this.textures.add(this.screenTexture);

    this.screenMat = new THREE.MeshBasicMaterial({
      map: this.screenTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      toneMapped: false
    });
    this.materials.add(this.screenMat);
    this.screenMesh = this.mesh(new THREE.PlaneGeometry(5.12, 3.2), this.screenMat, this.preview, 0, 0, 0.01);
    this.screenMesh.castShadow = false;
    this.screenMesh.receiveShadow = false;

    // 4 Siku Sudut Retikel Hologram 3D & Bar Emitter Bawah (hanya menyala semasa tayangan hologram aktif)
    const holoBracketMat = new THREE.MeshBasicMaterial({
      color: C.cyan,
      transparent: true,
      opacity: 0,
      toneMapped: false
    });
    this.materials.add(holoBracketMat);
    this.holoFrameMats.push(holoBracketMat);

    const hw = 2.6;
    const hh = 1.63;
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        const hBar = this.mesh(new THREE.BoxGeometry(0.42, 0.035, 0.02), holoBracketMat, this.preview, sx * (hw - 0.18), sy * hh, 0.03);
        const vBar = this.mesh(new THREE.BoxGeometry(0.035, 0.42, 0.02), holoBracketMat, this.preview, sx * hw, sy * (hh - 0.18), 0.03);
        hBar.castShadow = false;
        vBar.castShadow = false;
      }
    }
    const bottomLaserBar = this.mesh(new THREE.BoxGeometry(4.1, 0.03, 0.03), holoBracketMat, this.preview, 0, -hh - 0.04, 0.02);
    bottomLaserBar.castShadow = false;

    this.renderScreenTexture();
    this.interactive(this.preview, 'screen');

    // Alur Pancaran Cahaya Projektor Hologram (berhenti di Bar Bawah Hologram supaya TIDAK mengaburkan gambar UI)
    this.beamGroup.visible = false;
    this.projectDeskGroup.add(this.beamGroup);
    const beamStart = new THREE.Vector3(0.12, 0.62, -0.2);
    const beamEnd = new THREE.Vector3(-0.22, 1.38, -1.62);
    const beamDir = beamEnd.clone().sub(beamStart);
    const beamLen = beamDir.length();
    const beamMid = beamStart.clone().addScaledVector(beamDir, 0.5);

    this.outerBeamMat = new THREE.MeshBasicMaterial({
      color: C.cyan,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    this.innerBeamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    this.materials.add(this.outerBeamMat);
    this.materials.add(this.innerBeamMat);

    const outerConeGeo = new THREE.CylinderGeometry(1.75, 0.16, beamLen, 32, 1, true);
    const innerConeGeo = new THREE.CylinderGeometry(0.95, 0.08, beamLen, 24, 1, true);
    this.geometries.add(outerConeGeo);
    this.geometries.add(innerConeGeo);

    const outerBeam = new THREE.Mesh(outerConeGeo, this.outerBeamMat);
    const innerBeam = new THREE.Mesh(innerConeGeo, this.innerBeamMat);
    outerBeam.scale.set(1.12, 1, 0.14);
    innerBeam.scale.set(0.92, 1, 0.1);
    this.beamGroup.position.copy(beamMid);
    this.beamGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), beamDir.clone().normalize());
    this.beamGroup.add(outerBeam);
    this.beamGroup.add(innerBeam);

    // === 7. UNIT APPLIANCE PELAYAN HOMELAB 2U & KABEL JALINAN BERGRAVITI ===
    const router = new THREE.Group();
    router.position.set(-3.75, 0.2, -0.25);
    router.rotation.y = 0.16;
    this.projectDeskGroup.add(router);

    const darkTitanium = this.material(0x161f30, 0.65, 0.32);
    const brushedAlum = this.material(0xcbd5e1, 0.88, 0.22);

    // Badan Utama Pelayan Homelab (Anodized Dark Titanium + Brushed Aluminium Shell)
    this.box(router, 1.92, 0.74, 2.72, 0, 0.22, 0, brushedAlum, 0.08);
    this.box(router, 1.78, 0.62, 2.66, 0, 0.22, 0.04, darkTitanium, 0.05);

    // Telinga Rak & Pemegang Logam Hadapan (Rack Ears & Handles) di Kiri dan Kanan
    this.box(router, 2.16, 0.66, 0.08, 0, 0.22, 1.32, brushedAlum, 0.02);
    this.cylinder(router, 0.035, 0.44, -1.02, 0.22, 1.44, metal);
    this.cylinder(router, 0.035, 0.44, 1.02, 0.22, 1.44, metal);
    this.box(router, 0.07, 0.07, 0.14, -1.02, 0.4, 1.38, metal, 0.01);
    this.box(router, 0.07, 0.07, 0.14, -1.02, 0.04, 1.38, metal, 0.01);
    this.box(router, 0.07, 0.07, 0.14, 1.02, 0.4, 1.38, metal, 0.01);
    this.box(router, 0.07, 0.07, 0.14, 1.02, 0.04, 1.38, metal, 0.01);

    // Sirip Penyejuk CNC Atas & Jalur Lampu Status LED
    this.box(router, 1.58, 0.04, 2.28, 0, 0.59, -0.05, dark, 0.02, false);
    this.instancedBoxes(
      router,
      1.36,
      0.03,
      0.04,
      slate,
      Array.from({ length: 16 }, (_, i): [number, number, number] => [0, 0.62, -1.05 + i * 0.14]),
      0.005,
      false
    );
    this.routerBarMat = this.material(C.cyan, 0.2, 0.2);
    this.box(router, 1.42, 0.025, 0.06, 0, 0.61, 1.18, this.routerBarMat, 0.01, false);

    // Skrin Status Mini OLED pada Panel Hadapan Homelab
    this.routerOledCanvas = document.createElement('canvas');
    this.routerOledCanvas.width = 220;
    this.routerOledCanvas.height = 108;
    this.routerOledTex = new THREE.CanvasTexture(this.routerOledCanvas);
    this.routerOledTex.colorSpace = THREE.SRGBColorSpace;
    this.textures.add(this.routerOledTex);
    this.renderRouterOled();
    const oledMat = new THREE.MeshBasicMaterial({ map: this.routerOledTex, toneMapped: false });
    this.materials.add(oledMat);
    const oledMesh = this.mesh(new THREE.PlaneGeometry(0.62, 0.3), oledMat, router, -0.46, 0.28, 1.38);
    oledMesh.castShadow = false;

    // 4 Port RJ45 Berbingkai Logam + LED Status di Sebelah Kanan Panel Hadapan
    const portBgMat = this.material(0x060911, 0.1, 0.9);
    for (let i = 0; i < 4; i++) {
      const px = 0.02 + i * 0.22;
      this.box(router, 0.17, 0.16, 0.04, px, 0.34, 1.37, metal, 0.01, false);
      this.box(router, 0.13, 0.12, 0.05, px, 0.34, 1.38, portBgMat, 0.01, false);
      this.leds.push(this.box(router, 0.05, 0.03, 0.02, px, 0.45, 1.38, this.material(C.muted), 0.005, false));
    }

    // Port Uplink SFP+ / DAC & Kolar Strain-Relief Berulir
    const uplinkCollar = this.cylinder(router, 0.11, 0.22, 0.52, 0.1, 1.42, metal);
    uplinkCollar.rotation.x = Math.PI / 2;
    const uplinkBoot = this.cylinder(router, 0.085, 0.24, 0.52, 0.1, 1.56, dark);
    uplinkBoot.rotation.x = Math.PI / 2;
    this.interactive(router, 'router');

    // Port Soket Masuk Tepat pada Dinding Sisi Kiri Konsol (x = -1.72, z = 1.52, selari dengan lengkungan keluar kabel Homelab)
    const socketGroup = new THREE.Group();
    socketGroup.position.set(-1.72, 0.28, 1.52);
    this.projectDeskGroup.add(socketGroup);
    this.box(socketGroup, 0.18, 0.26, 0.48, 0, 0, 0, brushedAlum, 0.04);
    this.box(socketGroup, 0.2, 0.19, 0.36, -0.02, 0, 0, dark, 0.03);
    this.box(socketGroup, 0.22, 0.12, 0.24, -0.04, 0, 0, this.material(0x060911, 0.1, 0.9), 0.02);

    // Kepala Palam Penyambung Logam Berketepatan Tinggi (menghadap ke +X untuk masuk terus ke soket sisi kiri konsol)
    this.plug.position.copy(this.plugHome);
    this.projectDeskGroup.add(this.plug);
    this.box(this.plug, 0.48, 0.19, 0.32, 0, 0, 0, darkTitanium, 0.05);
    this.box(this.plug, 0.2, 0.21, 0.34, 0.06, 0, 0, brushedAlum, 0.03);
    this.plugLedMat = this.material(C.cyan, 0.2, 0.2);
    this.box(this.plug, 0.05, 0.22, 0.35, -0.08, 0, 0, this.plugLedMat, 0.02);
    this.box(this.plug, 0.2, 0.1, 0.2, 0.28, 0, 0, gold, 0.02);
    const tailBoot = this.cylinder(this.plug, 0.075, 0.24, -0.3, 0, 0, dark);
    tailBoot.rotation.z = Math.PI / 2;
    this.interactive(this.plug, 'cable');

    // Wayar Jalinan Nilon (Braided Sleeve) licin tanpa ketulan silinder di tengah
    const cableMat = new THREE.MeshStandardMaterial({
      map: this.createBraidedCableTexture(),
      roughness: 0.55,
      metalness: 0.2
    });
    this.materials.add(cableMat);
    this.cable = this.mesh(new THREE.BufferGeometry(), cableMat, this.projectDeskGroup);

    // === 8. KAD PINTAR NFC TANPA SENTUH (PEMILIK & PELAWAT) ===
    const cards = [
      [this.owner, this.ownerHome, true, blue],
      [this.visitor, this.visitorHome, false, slate]
    ] as const;

    for (const [group, home, isOwner, rimMat] of cards) {
      group.position.copy(home);
      this.projectDeskGroup.add(group);
      // Badan Kad Lencana NFC Nipis (tiada lagi cip kad bank atau kepala USB)
      this.box(group, 1.32, 0.045, 0.86, 0, 0, 0, rimMat, 0.02);
      const cardFaceMat = new THREE.MeshBasicMaterial({
        map: this.createKeycardTexture(isOwner),
        toneMapped: false
      });
      this.materials.add(cardFaceMat);
      this.keycardMats.push(cardFaceMat);
      const face = this.mesh(new THREE.PlaneGeometry(1.26, 0.8), cardFaceMat, group, 0, 0.025, 0, false);
      face.rotation.x = -Math.PI / 2;
    }
    this.interactive(this.owner, 'owner');
    this.interactive(this.visitor, 'visitor');

    this.deskAnchorPairs.push(
      ['cable', this.plug.position],
      ['lid', this.scratchLidPos],
      ['owner', this.owner.position],
      ['visitor', this.visitor.position],
      ['module', this.slotMouthPos],
      ['screen', this.preview.position],
      ['socket', this.socket],
      ['dock', this.cardReaderPos],
      ['data', this.dataAnchorPos],
      ['router', this.routerAnchorPos]
    );
    this.cartridges.forEach((cartridge, index) => {
      this.deskAnchorPairs.push([`project:${index}`, cartridge.position]);
    });

    this.updateCable();
  }

  // === PERSEKITARAN BILIK STUDIO ARKITEKTURAL (TEMPAT KERJA MAKMAL SEBENAR) ===
  private buildStudioArchitecture(metal: THREE.Material, dark: THREE.Material, slate: THREE.Material, gold: THREE.Material) {
    const room = new THREE.Group();
    this.root.add(room);

    // 1. Dinding Belakang Studio (North Wall: z = -12.6, y = 3.9, span x = -19.0 to +20.2)
    const backWall = this.box(room, 39.2, 7.8, 0.28, 0.6, 3.9, -12.6, this.studioWallMat, 0.06);
    backWall.castShadow = false;
    backWall.receiveShadow = true;

    // Baseboard keluli di sepanjang kaki dinding belakang
    this.box(room, 39.2, 0.24, 0.38, 0.6, 0.12, -12.52, this.studioTrimMat, 0.02);

    // Tiang Struktur Keluli (I-Beam Mullions) Membahagikan Dinding
    const columnX = [-17.2, -11.8, -4.6, 4.6, 12.0, 17.6];
    for (const cx of columnX) {
      this.box(room, 0.36, 7.8, 0.44, cx, 3.9, -12.48, this.studioTrimMat, 0.02);
      this.box(room, 0.52, 0.28, 0.56, cx, 0.14, -12.44, dark, 0.02);
      this.box(room, 0.52, 0.28, 0.56, cx, 7.66, -12.44, dark, 0.02);
    }

    // Panel Akustik Berjalur Menegak (Architectural Acoustic Slat Bays)
    const bayRanges = [
      [-16.8, -12.2],
      [-11.4, -4.8],
      [4.8, 11.6],
      [12.2, 17.2]
    ];
    const slatPositions: [number, number, number][] = [];
    for (const [xStart, xEnd] of bayRanges) {
      const bayW = xEnd - xStart;
      const bayMidX = (xStart + xEnd) / 2;
      this.box(room, bayW, 4.8, 0.08, bayMidX, 2.8, -12.44, this.acousticPanelMat, 0.02);
      // Jalur-jalur kayu/akustik halus
      const numSlats = Math.floor(bayW / 0.22);
      for (let s = 0; s < numSlats; s++) {
        const sx = xStart + 0.11 + s * 0.22;
        slatPositions.push([sx, 2.8, -12.38]);
      }
    }
    this.instancedBoxes(room, 0.08, 4.6, 0.04, this.studioTrimMat, slatPositions, 0.008, false);

    // Panel Klerestori Cahaya Studio Atas (Upper Architectural Clerestory Windows)
    this.box(room, 37.6, 1.4, 0.12, 0.6, 6.4, -12.46, this.clerestoryMat, 0.02, false);
    const clerestoryPositions: [number, number, number][] = [];
    for (let w = -16; w <= 18; w += 3.4) {
      clerestoryPositions.push([w, 6.4, -12.44]);
    }
    this.instancedBoxes(room, 0.08, 1.46, 0.16, this.studioTrimMat, clerestoryPositions, 0.01, false);

    // Papan Skematik Arkitektur Sistem Berlampu di Dinding Tengah-Belakang (Di Atas Stesen Perjalanan)
    this.schematicCanvas = document.createElement('canvas');
    this.schematicCanvas.width = 1280;
    this.schematicCanvas.height = 380;
    this.schematicTex = new THREE.CanvasTexture(this.schematicCanvas);
    this.schematicTex.colorSpace = THREE.SRGBColorSpace;
    this.schematicTex.anisotropy = 4;
    this.textures.add(this.schematicTex);
    this.renderSchematicBoard();

    const schemMat = new THREE.MeshBasicMaterial({ map: this.schematicTex, toneMapped: false });
    this.materials.add(schemMat);

    const darkBacking = this.material(0x060a12, 0.1, 0.85);
    const darkChassis = this.material(0x161f30, 0.65, 0.32);
    const cyanTrim = this.material(C.cyan, 0.3, 0.25);
    cyanTrim.emissive.set(0x0ea5e9);
    cyanTrim.emissiveIntensity = 0.35;

    const schemGroup = new THREE.Group();
    schemGroup.position.set(0, 3.8, -12.42);
    room.add(schemGroup);
    this.box(schemGroup, 7.6, 2.4, 0.08, 0, 0, 0, this.studioTrimMat, 0.04);
    this.box(schemGroup, 7.42, 2.22, 0.09, 0, 0, 0.01, darkBacking, 0.02);
    this.plane(schemGroup, 7.3, 2.1, 0, 0, 0.065, schemMat, 0);

    // 2 Kabinet Rak Pelayan 42U Makmal di Latar Belakang (x = -6.4 & x = +6.4, z = -11.4)
    this.serverLedMats = [];
    const rackCols = [
      { x: -6.4, name: 'SERVER RACK A // PROD' },
      { x: 6.4, name: 'SERVER RACK B // BACKUP & SOC' }
    ];

    for (const rk of rackCols) {
      const rack = new THREE.Group();
      rack.position.set(rk.x, 2.05, -11.4);
      room.add(rack);

      // Bingkai Kabinet 42U Titanium Gelap (Reka Bentuk Rak Terbuka supaya 10 Pelayan 1U/2U & LED Terdedah Jelas)
      this.box(rack, 1.95, 4.1, 1.15, 0, 0, -0.14, dark, 0.06);
      this.box(rack, 1.72, 3.88, 1.08, 0, 0, -0.06, darkBacking, 0.02);

      // Papan Tanda Tajuk Rak di Bahagian Puncak (Rack Header Panel)
      this.box(rack, 1.84, 0.36, 0.16, 0, 1.82, 0.52, this.studioTrimMat, 0.02);
      this.box(rack, 1.76, 0.28, 0.18, 0, 1.82, 0.53, darkBacking, 0.015);
      this.box(rack, 1.6, 0.03, 0.04, 0, 1.94, 0.62, cyanTrim, 0.008);

      // Tiang Rel Rak Kiri & Kanan + Ambang Bawah
      this.box(rack, 0.14, 4.02, 0.24, -0.88, 0, 0.52, this.studioTrimMat, 0.02);
      this.box(rack, 0.14, 4.02, 0.24, 0.88, 0, 0.52, this.studioTrimMat, 0.02);
      this.box(rack, 1.9, 0.16, 0.28, 0, -1.96, 0.52, this.studioTrimMat, 0.02);

      // 10 Unit Pelayan 1U/2U Rak di Dalam Kabinet
      const serverBezelMat = this.material(0xcbd5e1, 0.88, 0.24);
      const serverLedGreenMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        metalness: 0.2,
        roughness: 0.2,
        emissive: new THREE.Color(0x10b981),
        emissiveIntensity: 0.85
      });
      const serverLedCyanMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        metalness: 0.2,
        roughness: 0.2,
        emissive: new THREE.Color(0x38bdf8),
        emissiveIntensity: 0.85
      });
      this.materials.add(serverLedGreenMat);
      this.materials.add(serverLedCyanMat);
      this.serverLedMats.push(serverLedGreenMat, serverLedCyanMat);

      const serverBodyPos: [number, number, number][] = [];
      const serverFacePos: [number, number, number][] = [];
      const serverBezelPos: [number, number, number][] = [];
      const serverEarPos: [number, number, number][] = [];
      const serverLedGreenPos: [number, number, number][] = [];
      const serverLedCyanPos: [number, number, number][] = [];
      for (let s = 0; s < 10; s++) {
        const sy = -1.62 + s * 0.36;
        serverBodyPos.push([0, sy, 0.1]);
        serverFacePos.push([0, sy, 0.58]);
        serverBezelPos.push([0.18, sy, 0.628]);
        serverEarPos.push([-0.74, sy, 0.62], [0.74, sy, 0.62]);
        for (let p = 0; p < 4; p++) {
          const ledPos: [number, number, number] = [-0.52 + p * 0.15, sy + 0.03, 0.635];
          if (p === 0) serverLedGreenPos.push(ledPos);
          else serverLedCyanPos.push(ledPos);
        }
      }
      this.instancedBoxes(rack, 1.62, 0.27, 0.96, slate, serverBodyPos, 0.02);
      this.instancedBoxes(rack, 1.54, 0.23, 0.08, darkChassis, serverFacePos, 0.015, false);
      this.instancedBoxes(rack, 0.88, 0.07, 0.03, serverBezelMat, serverBezelPos, 0.006, false);
      this.instancedBoxes(rack, 0.06, 0.22, 0.08, metal, serverEarPos, 0.01, false);
      this.instancedBoxes(rack, 0.06, 0.035, 0.025, serverLedGreenMat, serverLedGreenPos, 0.005, false);
      this.instancedBoxes(rack, 0.06, 0.035, 0.025, serverLedCyanMat, serverLedCyanPos, 0.005, false);
    }

    // 2. Dinding Sayap Kiri Studio (West Wing Wall: bermula (-18.6, -12.6) condong ke (-20.4, 4.2))
    const leftWall = new THREE.Group();
    leftWall.position.set(-19.5, 3.9, -4.2);
    leftWall.rotation.y = 0.105;
    room.add(leftWall);
    this.box(leftWall, 0.32, 7.8, 17.2, 0, 0, 0, this.studioWallMat, 0.06);
    this.box(leftWall, 0.42, 0.24, 17.2, 0.06, -3.78, 0, this.studioTrimMat, 0.02);
    // Rak alatan makmal di dinding kiri
    const shelf = new THREE.Group();
    shelf.position.set(0.48, -1.2, -1.8);
    leftWall.add(shelf);
    this.box(shelf, 0.82, 3.4, 4.2, 0, 0, 0, darkChassis, 0.04);
    for (let lvl = 0; lvl < 3; lvl++) {
      this.box(shelf, 0.88, 0.06, 4.1, 0, -1.1 + lvl * 1.1, 0, this.studioTrimMat, 0.02);
      // Kotak osiloskop / instrumen diagnostik
      this.box(shelf, 0.54, 0.52, 0.86, 0, -0.8 + lvl * 1.1, -1.1, dark, 0.03);
      this.box(shelf, 0.58, 0.46, 0.94, 0, -0.8 + lvl * 1.1, 0.4, slate, 0.03);
    }

    // 3. Dinding Sayap Kanan Studio (East Wing Wall: bermula (+19.8, -12.6) condong ke (+21.6, 4.2))
    const rightWall = new THREE.Group();
    rightWall.position.set(20.7, 3.9, -4.2);
    rightWall.rotation.y = -0.105;
    room.add(rightWall);
    this.box(rightWall, 0.32, 7.8, 17.2, 0, 0, 0, this.studioWallMat, 0.06);
    this.box(rightWall, 0.42, 0.24, 17.2, -0.06, -3.78, 0, this.studioTrimMat, 0.02);
    // Kotak Agihan Kuasa (PDU) & Patch Gentian Optik di dinding kanan
    const pdu = new THREE.Group();
    pdu.position.set(-0.48, -0.4, -1.2);
    rightWall.add(pdu);
    this.box(pdu, 0.62, 2.6, 2.8, 0, 0, 0, slate, 0.04);
    this.box(pdu, 0.66, 2.44, 2.64, -0.02, 0, 0, darkChassis, 0.03);
    this.box(pdu, 0.04, 0.8, 2.2, -0.34, 0.4, 0, this.studioTrimMat, 0.02);

    // 4. Saluran Kabel Industri (Floor Cable Conduit Raceways) Menghubungkan Meja ke Dinding
    const conduitMat = this.material(0x182236, 0.55, 0.35);
    // Saluran melintang di sepanjang dinding belakang
    this.box(room, 32.0, 0.045, 0.36, 0.6, 0.022, -11.8, conduitMat, 0.015, false);
    this.box(room, 32.0, 0.015, 0.04, 0.6, 0.048, -11.8, cyanTrim, 0.005, false);
    // Saluran membujur dari Meja Projek ke belakang
    for (const cx of [-3.75, 4.4]) {
      this.box(room, 0.32, 0.04, 11.2, cx, 0.02, -5.2, conduitMat, 0.015, false);
      this.box(room, 0.04, 0.012, 11.2, cx, 0.042, -5.2, cyanTrim, 0.004, false);
    }
    // Saluran dari Meja Perjalanan ke dinding belakang
    for (const jx of [-2.4, 2.4]) {
      this.box(room, 0.26, 0.038, 3.4, jx, 0.019, -10.0, conduitMat, 0.012, false);
    }
    // Saluran kuasa belakang dari Meja Profil ke dinding kiri & Meja Kemahiran ke dinding kanan (di belakang meja)
    this.box(room, 6.2, 0.038, 0.28, -15.4, 0.019, -2.9, conduitMat, 0.012, false);
    this.box(room, 6.4, 0.038, 0.28, 16.9, 0.019, -2.9, conduitMat, 0.012, false);
    // Saluran kuasa menghubungkan Profil & Kemahiran terus ke saluran belakang
    this.box(room, 0.28, 0.038, 8.8, -9.8, 0.019, -7.4, conduitMat, 0.012, false);
    this.box(room, 0.28, 0.038, 8.8, 11.4, 0.019, -7.4, conduitMat, 0.012, false);

    // 5. Rasuk Galang Pencahayaan Studio Atas (Overhead Studio Lighting Gantry Valance at z = -11.2, y = 6.95)
    const trussGroup = new THREE.Group();
    trussGroup.position.set(0.6, 6.95, -11.2);
    room.add(trussGroup);
    this.box(trussGroup, 32.0, 0.16, 0.28, 0, 0, 0, this.studioTrimMat, 0.02);
    this.box(trussGroup, 31.6, 0.04, 0.06, 0, -0.09, 0, metal, 0.01);
    // 6 Lampu Sorot Trek Studio (Studio Track Light Fixtures)
    const spotX = [-12.0, -7.2, -2.4, 2.4, 7.2, 12.0];
    for (const sx of spotX) {
      const spot = new THREE.Group();
      spot.position.set(sx, -0.22, 0);
      spot.rotation.x = 0.32;
      trussGroup.add(spot);
      this.cylinder(spot, 0.08, 0.22, 0, 0, 0, dark, 16);
      this.cylinder(spot, 0.1, 0.05, 0, -0.11, 0, metal, 16);
      const spotLens = new THREE.MeshBasicMaterial({ color: 0xfffaed });
      this.materials.add(spotLens);
      this.cylinder(spot, 0.075, 0.02, 0, -0.12, 0, spotLens, 16);
    }
  }

  // === AKSESORI TEMPAT KERJA JURUTERA DI MEJA PROJEK (LAMPU TUGAS, NOTA & CAWAN) ===
  private buildDeskTaskProps(metal: THREE.Material, dark: THREE.Material, ceramic: THREE.Material, slate: THREE.Material) {
    const props = new THREE.Group();
    this.projectDeskGroup.add(props);

    // 1. Lampu Meja Kejuruteraan (Articulated Studio Task Lamp) di Sudut Kiri-Belakang (-5.25, 0.02, -1.55)
    const lamp = new THREE.Group();
    lamp.position.set(-5.25, 0.02, -1.55);
    lamp.rotation.y = 0.48;
    props.add(lamp);

    this.cylinder(lamp, 0.22, 0.045, 0, 0.022, 0, dark, 24);
    this.cylinder(lamp, 0.16, 0.035, 0, 0.05, 0, metal, 24);
    // Lengan bawah condong
    const lowerArm = new THREE.Group();
    lowerArm.position.set(0, 0.06, 0);
    lowerArm.rotation.z = -0.32;
    lamp.add(lowerArm);
    this.cylinder(lowerArm, 0.022, 0.74, 0, 0.37, 0, dark, 14);
    this.cylinder(lowerArm, 0.038, 0.06, 0, 0.74, 0, metal, 14);
    // Lengan atas condong ke arah konsol
    const upperArm = new THREE.Group();
    upperArm.position.set(0, 0.74, 0);
    upperArm.rotation.z = 0.72;
    lowerArm.add(upperArm);
    this.cylinder(upperArm, 0.018, 0.68, 0, 0.34, 0, dark, 14);
    // Kepala tudung lampu tirus (Lamp Shade)
    const head = new THREE.Group();
    head.position.set(0, 0.68, 0);
    head.rotation.z = -0.42;
    upperArm.add(head);
    const shadeGeo = new THREE.CylinderGeometry(0.08, 0.22, 0.28, 24, 1, false);
    this.geometries.add(shadeGeo);
    const shade = new THREE.Mesh(shadeGeo, dark);
    shade.position.set(0, -0.08, 0);
    head.add(shade);
    const lampBulb = new THREE.MeshBasicMaterial({ color: 0xfffae0 });
    this.materials.add(lampBulb);
    this.cylinder(head, 0.06, 0.04, 0, -0.19, 0, lampBulb, 16);

    // 2. Buku Nota Lapangan Kejuruteraan (Field Notebook & Stylus) di Sudut Kiri-Hadapan (-5.15, 0.02, 1.95)
    const book = new THREE.Group();
    book.position.set(-5.15, 0.02, 1.95);
    book.rotation.y = 0.14;
    props.add(book);
    this.box(book, 0.54, 0.045, 0.78, 0, 0.022, 0, slate, 0.02);
    this.box(book, 0.5, 0.038, 0.74, 0.015, 0.028, 0, this.material(0xf1f5f9, 0.05, 0.9), 0.01);
    this.box(book, 0.05, 0.05, 0.79, -0.25, 0.024, 0, dark, 0.01); // Tulang buku hitam
    // Pena / Stylus logam di atas buku nota
    const pen = this.cylinder(book, 0.014, 0.56, 0.08, 0.056, 0, metal, 12);
    pen.rotation.x = Math.PI / 2;

    // 3. Cawan Kopi Seramik Studio & Pelapik Slate di Sudut Kiri-Tengah (-5.18, 0.02, 1.25)
    const mugGroup = new THREE.Group();
    mugGroup.position.set(-5.18, 0.02, 1.25);
    props.add(mugGroup);
    this.cylinder(mugGroup, 0.18, 0.018, 0, 0.009, 0, slate, 24); // Pelapik cawan
    this.cylinder(mugGroup, 0.12, 0.22, 0, 0.12, 0, ceramic, 24); // Badan cawan
    const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x2b1810, roughness: 0.15 });
    this.materials.add(coffeeMat);
    this.cylinder(mugGroup, 0.1, 0.02, 0, 0.21, 0, coffeeMat, 20); // Air kopi
    // Pemegang telinga cawan
    const handleGeo = new THREE.TorusGeometry(0.065, 0.018, 10, 20, Math.PI);
    this.geometries.add(handleGeo);
    const handle = new THREE.Mesh(handleGeo, ceramic);
    handle.position.set(0.12, 0.12, 0);
    handle.rotation.z = -Math.PI / 2;
    mugGroup.add(handle);
  }

  // Lengkungan Wayar Bergraviti Semula Jadi (Lengkungan monotonik licin di atas meja tanpa sudut patah balik)
  private updateCable() {
    const p0 = new THREE.Vector3(-3.04, 0.28, 1.16);
    const p1 = new THREE.Vector3(-2.98, 0.17, 1.46);

    const tailDir = new THREE.Vector3(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.plug.rotation.y);
    const p5 = this.plug.position.clone().addScaledVector(tailDir, 0.34);
    const p4 = p5.clone().addScaledVector(tailDir, 0.22);
    p4.y = Math.max(0.07, THREE.MathUtils.lerp(0.055, p5.y, 0.55));
    p4.z += 0.06;

    const p2 = new THREE.Vector3(
      THREE.MathUtils.lerp(p1.x, p4.x, 0.28),
      0.052,
      THREE.MathUtils.lerp(p1.z, Math.max(1.86, p4.z), 0.65)
    );
    const p3 = new THREE.Vector3(
      THREE.MathUtils.lerp(p1.x, p4.x, 0.66),
      0.052,
      Math.max(1.88, p4.z + 0.08)
    );

    const curve = new THREE.CatmullRomCurve3([p0, p1, p2, p3, p4, p5], false, 'centripetal');
    const old = this.cable.geometry;
    this.cable.geometry = new THREE.TubeGeometry(curve, 72, 0.048, 14, false);
    this.geometries.delete(old);
    this.geometries.add(this.cable.geometry);
    old.dispose();
  }

  private cast(event: PointerEvent) {
    const r = this.canvas.getBoundingClientRect();
    this.pointer.set(((event.clientX - r.left) / r.width) * 2 - 1, -((event.clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.pointer, this.camera);
    const visible = this.hits.filter(object => {
      let node: THREE.Object3D | null = object;
      while (node) { if (!node.visible) return false; node = node.parent; }
      return true;
    });
    const hit = this.ray.intersectObjects(visible, false)[0];
    return hit?.object.userData.part as Part | undefined;
  }

  private wheel = (e: WheelEvent) => {
    if (this.dead) return;
    e.preventDefault();
    const step = e.deltaY > 0 ? 0.1 : -0.1;
    this.zoomBy(step);
  };

  zoomBy(delta: number) {
    this.renderDirty = true;
    this.targetZoom = THREE.MathUtils.clamp(this.targetZoom + delta, 0.48, 1.65);
  }

  /** Putar kamera tanpa seret (WCAG 2.5.7). Had sama dengan seretan tetikus. */
  orbitBy(dYaw: number, dPitch = 0) {
    this.renderDirty = true;
    this.targetOrbitYaw = THREE.MathUtils.clamp(this.targetOrbitYaw + dYaw, -0.75, 0.75);
    this.targetOrbitPitch = THREE.MathUtils.clamp(this.targetOrbitPitch + dPitch, -0.28, 0.38);
  }

  resetCamera() {
    this.renderDirty = true;
    this.targetZoom = 1;
    this.targetOrbitYaw = -0.04;
    this.targetOrbitPitch = 0;
  }

  private down = (e: PointerEvent) => {
    this.renderDirty = true;
    if (this.dead || e.button !== 0) return;
    this.canvas.setPointerCapture(e.pointerId);
    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.activePointers.size === 2) {
      const pts = Array.from(this.activePointers.values());
      this.pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      this.pinchStartZoom = this.targetZoom;
      this.drag = null;
      return;
    }
    if (!e.isPrimary || e.button !== 0) return;
    const part = this.cast(e) ?? null;
    this.drag = {
      id: e.pointerId,
      part,
      x: e.clientX,
      y: e.clientY,
      moved: false,
      startYaw: this.targetOrbitYaw,
      startPitch: this.targetOrbitPitch,
      startLift: this.lid.position.y
    };
    this.canvas.style.cursor = 'grabbing';
  };

  private move = (e: PointerEvent) => {
    this.renderDirty = true;
    if (this.dead) return;
    if (this.activePointers.has(e.pointerId)) {
      this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    if (this.activePointers.size === 2 && this.pinchStartDist > 12) {
      const pts = Array.from(this.activePointers.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const scale = this.pinchStartDist / Math.max(24, dist);
      this.targetZoom = THREE.MathUtils.clamp(this.pinchStartZoom * scale, 0.48, 1.65);
      return;
    }
    const hit = this.cast(e) ?? null;
    if (!this.drag) {
      if (this.selected !== hit) {
        this.selected = hit;
        this.options.hover(hit);
      }
      this.canvas.style.cursor = hit ? 'pointer' : 'grab';
      return;
    }
    if (e.pointerId !== this.drag.id) return;
    const dx = e.clientX - this.drag.x;
    const dy = e.clientY - this.drag.y;
    if (Math.hypot(dx, dy) > 6) this.drag.moved = true;
    if (!this.drag.moved) return;

    if (!this.drag.part) {
      this.targetOrbitYaw = THREE.MathUtils.clamp(this.drag.startYaw + dx * 0.0055, -0.75, 0.75);
      this.targetOrbitPitch = THREE.MathUtils.clamp(this.drag.startPitch + dy * 0.004, -0.28, 0.38);
      return;
    }
    if (this.drag.part === 'lid') {
      this.lid.position.y = THREE.MathUtils.clamp(this.drag.startLift - dy * 0.014, 1.15, 2.65);
      return;
    }

    // Menyokong tarik & lepas (drag) untuk Kabel, Kad Pintar, dan Tab Game Projek
    let object: THREE.Object3D | null = null;
    if (this.drag.part === 'cable') object = this.plug;
    else if (this.drag.part === 'owner') object = this.owner;
    else if (this.drag.part === 'visitor') object = this.visitor;
    else if (this.drag.part.startsWith('project:')) {
      const idx = Number(this.drag.part.split(':')[1]);
      object = this.cartridges[idx] ?? null;
    }

    if (object) {
      const deskY = this.projectDeskGroup.position.y;
      this.dragPlane.constant = -(deskY + (this.drag.part.startsWith('project:') ? 0.85 : 0.48));
      const point = this.ray.ray.intersectPlane(this.dragPlane, new THREE.Vector3());
      if (point) {
        this.projectDeskGroup.worldToLocal(point);
        point.x = THREE.MathUtils.clamp(point.x, -5.2, 6.1);
        point.z = THREE.MathUtils.clamp(point.z, -1.8, 3.1);
        object.position.copy(point);
        if (object === this.plug) this.updateCable();
      }
    }
  };

  private up = (e: PointerEvent) => {
    this.renderDirty = true;
    this.activePointers.delete(e.pointerId);
    if (this.activePointers.size < 2) this.pinchStartDist = 0;
    const drag = this.drag;
    if (!drag || drag.id !== e.pointerId) return;
    this.drag = null;

    if (drag.part) {
      let apply = !drag.moved;
      if (drag.moved && drag.part === 'lid') {
        apply = (this.lid.position.y > 1.85) !== this.state.opened;
      }
      if (drag.moved && drag.part === 'cable') {
        apply = this.state.connected || this.plug.position.distanceTo(this.socket) < 1.35;
      }
      if (drag.moved && (drag.part === 'owner' || drag.part === 'visitor')) {
        const object = drag.part === 'owner' ? this.owner : this.visitor;
        apply = this.state.identity === drag.part || object.position.distanceTo(this.cardReaderPos) < 1.45;
      }
      if (drag.moved && drag.part.startsWith('project:')) {
        const idx = Number(drag.part.split(':')[1]);
        const cart = this.cartridges[idx];
        apply = !cart || cart.position.distanceTo(this.slotMouthPos) < 2.2;
      }
      if (apply) this.options.action(drag.part);
    }

    if (this.canvas.hasPointerCapture(e.pointerId)) {
      this.canvas.releasePointerCapture(e.pointerId);
    }
    this.canvas.style.cursor = 'grab';
  };

  private cancel = (event?: PointerEvent) => {
    this.renderDirty = true;
    if (event) {
      this.activePointers.delete(event.pointerId);
      if (this.drag?.id === event.pointerId) this.drag = null;
    } else {
      this.activePointers.clear();
      this.drag = null;
    }
    if (this.activePointers.size < 2) this.pinchStartDist = 0;
    this.canvas.style.cursor = 'default';
  };

  private leave = () => {
    this.renderDirty = true;
    if (!this.drag) {
      this.options.hover(null);
      this.selected = null;
    }
  };

  private motionChange = () => {
    this.renderDirty = true;
    this.cancel();
  };

  private contextLost = (e: Event) => {
    e.preventDefault();
    this.dead = true;
    cancelAnimationFrame(this.frame);
    this.options.failure();
  };

  setState(state: BenchState) {
    this.renderDirty = true;
    const moduleChanged = state.module !== this.state.module;
    const insertedChanged = !!state.inserted !== !!this.state.inserted;
    const connectedChanged = state.connected !== this.state.connected;
    const stateChanged =
      moduleChanged ||
      insertedChanged ||
      state.publicPreview !== this.state.publicPreview ||
      connectedChanged ||
      state.identity !== this.state.identity ||
      state.opened !== this.state.opened;

    this.state = { ...state, inserted: state.inserted ?? this.state.inserted };

    if (!this.state.publicPreview && (!this.state.connected || this.state.identity !== 'owner')) {
      if (this.focus === 'data' || this.focus === 'screen') {
        this.setFocus('panoramic');
      }
    }
    if (moduleChanged) {
      this.slideIndex = 0;
    }
    if (connectedChanged) {
      this.renderRouterOled();
    }
    if (stateChanged) {
      this.renderConsoleScreen();
      this.renderScreenTexture();
    }
  }

  private t(ms: string, en: string) { return this.locale === 'en' ? en : ms; }

  private renderRackLabels() {
    this.rackLabels.forEach(({ canvas, texture, maintained }) => {
      const c = canvas.getContext('2d')!;
      c.fillStyle = maintained ? '#0f2347' : '#092e2b';
      c.fillRect(0, 0, canvas.width, canvas.height);
      c.strokeStyle = maintained ? '#38bdf8' : '#2dd4bf';
      c.lineWidth = 6;
      c.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

      c.fillStyle = maintained ? '#7dd3fc' : '#5eead4';
      c.font = '700 22px monospace';
      c.textAlign = 'center';
      c.fillText(
        maintained
          ? this.t('ZON A · 3 SISTEM TERAS', 'ZONE A · 3 CORE SYSTEMS')
          : this.t('ZON B · 5 PROJEK & INOVASI', 'ZONE B · 5 PROJECTS & R&D'),
        canvas.width / 2,
        54,
        canvas.width - 36
      );

      c.fillStyle = '#ffffff';
      c.font = '800 40px sans-serif';
      c.fillText(
        maintained ? this.t('DISENGGARA · YHCM', 'MAINTAINED · YHCM') : this.t('PROJEK DIBANGUNKAN', 'BUILT PROJECTS'),
        canvas.width / 2,
        122,
        canvas.width - 36
      );
      texture.needsUpdate = true;
    });
  }

  private setStudioLighting(dark: boolean) {
    // Pantulan PMREM dan cahaya utama menonjolkan bevel tanpa dominasi rona biru.
    this.scene.environmentIntensity = dark ? 0.78 : 0.9;
    this.renderer.toneMappingExposure = dark ? 0.95 : 1.05;
    this.studioHemisphere.intensity = dark ? 0.72 : 1.25;
    this.studioKey.intensity = dark ? 2.8 : 3.1;
    this.studioFill.intensity = dark ? 0.65 : 0.85;
  }

  setTheme(theme: ThemeMode) {
    this.renderDirty = true;
    const isDark = theme === 'dark';
    const floorHex = isDark ? 0x09090b : 0xeceff3;
    this.scene.background = new THREE.Color(floorHex);
    this.studioHemisphere.color.set(isDark ? 0xcbd5e1 : 0xf3f5fa);
    this.studioFill.color.set(isDark ? 0xb6dce5 : 0xdce6f5);
    this.floorMat.color.set(floorHex);
    if (this.scene.fog instanceof THREE.Fog) {
      this.scene.fog.color.set(floorHex);
    }
    if (this.studioWallMat) {
      this.studioWallMat.color.set(isDark ? 0x0f172a : 0xdde4ee);
    }
    if (this.acousticPanelMat) {
      this.acousticPanelMat.color.set(isDark ? 0x162033 : 0xcbd5e1);
    }
    if (this.studioTrimMat) {
      this.studioTrimMat.color.set(isDark ? 0x26354d : 0x94a3b8);
    }
    if (this.clerestoryMat) {
      this.clerestoryMat.color.set(isDark ? 0x16243a : 0xf1f5f9);
      this.clerestoryMat.emissive.set(isDark ? 0x1e3a5f : 0xe2e8f0);
      this.clerestoryMat.emissiveIntensity = isDark ? 0.18 : 0.35;
    }
    if (this.studioFloorPadMat) {
      this.studioFloorPadMat.color.set(isDark ? 0x0b1220 : 0xcbd5e1);
    }
    if (this.projectEsdMat) {
      this.projectEsdMat.color.set(isDark ? 0x0f172a : 0x334155);
    }
    this.deskSurfaceMat.color.set(isDark ? 0x131d31 : 0xdde4ee);
    this.deskTrimMat.color.set(isDark ? 0x283854 : 0x94a3b8);
    this.setStudioLighting(isDark);
    this.dossier.setTheme(theme);
  }

  setLocale(locale: LocaleMode) {
    this.renderDirty = true;
    this.locale = locale;
    this.dossier.setLocale(locale);
    this.renderSchematicBoard();
    this.renderRackLabels(); this.updateCartridgeVisual();
    this.keycardMats.forEach((mat, i) => {
      if (mat.map) { this.textures.delete(mat.map); mat.map.dispose(); }
      mat.map = this.createKeycardTexture(i === 0);
    });
    this.renderConsoleScreen(); this.renderScreenTexture();
  }

  setJourneyStep(index: number) { this.renderDirty = true; this.dossier.setStep(index); }
  setSkillCategory(index: number) { this.renderDirty = true; this.dossier.setCategory(index); }

  setFocus(view: FocusView) {
    this.renderDirty = true;
    const dossierView = view === 'profile' || view === 'journey' || view === 'skills';
    this.projectDeskGroup.visible = !dossierView;
    this.dossier.group.visible = dossierView;
    if (dossierView) this.dossier.setView(view);
    this.focus = view;
    this.targetZoom = 1;
    this.targetOrbitYaw = ['data', 'screen', 'profile', 'journey', 'skills'].includes(view) ? 0 : -0.04;
    this.targetOrbitPitch = 0;
    this.renderScreenTexture();
  }

  setOffscreen(value: boolean) {
    this.offscreen = value;
    if (!value) this.renderDirty = true;
  }

  setPaused(value: boolean) {
    this.renderDirty = true;
    this.paused = value;
  }

  private cacheFocusBounds() {
    this.root.updateMatrixWorld(true);
    // Gardkan saiz penuh hologram, bukan skala animasinya.
    this.screenBounds.setFromObject(this.preview).expandByScalar(0.04);
    for (const child of this.projectDeskGroup.children) {
      if (child !== this.preview && child !== this.beamGroup && child !== this.dossier.group) {
        this.consoleBounds.expandByObject(child);
      }
    }
    // Skrin lebar: bingkai konsol dan hologram sahaja supaya meja memenuhi pentas.
    // Skrin sempit: termasuk stesen dossier supaya rak dan router kekal kelihatan.
    const deskBounds = new THREE.Box3().setFromObject(this.dossier.group);
    const panoramic = this.consoleBounds.clone().union(this.screenBounds);
    this.panoramicFull.copy(panoramic);
    if (!deskBounds.isEmpty()) this.panoramicFull.union(deskBounds);
    this.consoleBounds.set(new THREE.Vector3(-2.5, 0.92, -1.9), new THREE.Vector3(2.8, 3.2, 3.1));
    this.focusBounds.set('console', this.consoleBounds);
    this.focusBounds.set('screen', this.screenBounds);
    this.focusBounds.set('data', this.screenBounds);
    // Kenal pasti stesen melalui hit awam, tanpa mengubah DossierStation.
    for (const view of ['profile', 'journey', 'skills'] as const) {
      const hit = this.dossier.hits.find(mesh =>
        mesh.userData.part === view || String(mesh.userData.part).startsWith(`${view}:`));
      if (!hit) continue;
      let station: THREE.Object3D = hit;
      while (station.parent && station.parent !== this.dossier.group) station = station.parent;
      if (station.parent === this.dossier.group) {
        this.focusBounds.set(view, new THREE.Box3().setFromObject(station).expandByScalar(0.38));
      }
    }
    this.focusBounds.set('panoramic', panoramic);
  }

  private resize = () => {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h || this.dead) return;
    this.renderDirty = true;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.defaultLookAt.set(0.45, 1.45, -0.2);
    this.defaultCamPos.copy(this.defaultLookAt).add(new THREE.Vector3(0, 5.2, 9.6));
    this.camera.updateProjectionMatrix();
  };

  private animate = (now: number) => {
    if (this.dead) return;
    this.frame = requestAnimationFrame(this.animate);
    if (document.hidden || this.offscreen) {
      this.last = now;
      return;
    }
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    const snap = this.reduced.matches || this.paused;
    // Semak berkala untuk tekstur Dossier yang dimuatkan secara tak segerak.
    if (snap && !this.renderDirty && now - this.lastRender < 250) return;
    this.renderDirty = false;
    this.lastRender = now;
    const blend = snap ? 1 : 1 - Math.exp(-10 * dt);

    this.orbitYaw = THREE.MathUtils.lerp(this.orbitYaw, this.targetOrbitYaw, blend);
    this.orbitPitch = THREE.MathUtils.lerp(this.orbitPitch, this.targetOrbitPitch, blend);
    this.zoomFactor = THREE.MathUtils.lerp(this.zoomFactor, this.targetZoom, blend);
    this.root.rotation.y = 0;

    const allowed = this.state.publicPreview || (this.state.connected && this.state.identity === 'owner');
    const denied = this.state.connected && this.state.identity === 'visitor';
    const activeProjector = allowed && !!this.state.inserted;

    // Koreografi Kamera Pintar dalam Ruang Studio Berpijak (Pan/Dolly/Orbit):
    const wantedCam = this.scratchWantedCam.copy(this.defaultCamPos);
    const wantedLook = this.scratchWantedLook.copy(this.defaultLookAt);

    if (this.focus === 'profile') {
      // Fokus bersih ke Stesen Profil Sayap Kiri
      wantedCam.set(-3.2, 2.7, 1.2);
      wantedLook.set(-4.5, 1.4, -2.6);
    } else if (this.focus === 'journey') {
      // Fokus bersih ke Rak Kronologi Perjalanan Tengah Belakang
      wantedCam.set(0.45, 2.8, 1.2);
      wantedLook.set(0.45, 1.45, -2.75);
    } else if (this.focus === 'skills') {
      // Fokus bersih ke Stesen Kemahiran Sayap Kanan
      wantedCam.set(4.1, 2.7, 1.2);
      wantedLook.set(5.2, 1.35, -2.6);
    } else if (this.focus === 'data' || this.focus === 'screen') {
      wantedLook.copy(this.screenBounds.getCenter(this.scratchCenter));
      wantedCam.copy(wantedLook).set(wantedLook.x, wantedLook.y + 0.04, wantedLook.z + 1);
    } else if (this.focus === 'console') {
      wantedLook.set(0.45, activeProjector ? 3.1 : 1.45, 0.65);
      wantedCam.set(wantedLook.x, wantedLook.y + (activeProjector ? 3.4 : 5.85), wantedLook.z + 10.5);
    } else if (this.focus === 'rack' || this.focus === 'module') {
      wantedCam.set(5.4, 3.8, 5.2);
      wantedLook.set(4.5, 1.35, 0.65);
    } else if (this.focus === 'router') {
      wantedCam.set(-3.5, 3.8, 5.2);
      wantedLook.set(-4.2, 1.35, 0.65);
    }

    let bounds = this.focusBounds.get(this.focus);
    if (this.focus === 'panoramic' && this.camera.aspect < 1.2 && !this.panoramicFull.isEmpty()) bounds = this.panoramicFull;
    if (this.focus === 'console' && activeProjector) {
      bounds = this.scratchUnionBounds.copy(this.consoleBounds).union(this.screenBounds);
    }
    if (bounds) {
      this.scratchOffset.copy(wantedCam).sub(wantedLook);
      const fitted = fitPerspectiveBounds(bounds, this.scratchOffset, this.camera.fov, this.camera.aspect);
      wantedLook.copy(fitted.target);
      wantedCam.copy(fitted.position);
    }

    // Laksana Zum & Condong Pitch pada vektor jarak kamera dari titik fokus
    const offset = this.scratchOffset.copy(wantedCam).sub(wantedLook);
    if (!bounds && ['rack', 'module', 'router'].includes(this.focus)) {
      const narrowScale = this.camera.aspect < 1.3 ? 1.48 / Math.max(0.55, this.camera.aspect) : 1;
      offset.multiplyScalar(Math.max(1, narrowScale));
    }
    const orbit = this.scratchSpherical.setFromVector3(offset);
    orbit.theta += this.orbitYaw;
    orbit.phi = THREE.MathUtils.clamp(orbit.phi + this.orbitPitch, 0.25, Math.PI / 2 - 0.03);
    // Muatkan arah orbit dahulu; zum manual masih boleh meneliti objek rapat.
    if (bounds) {
      const direction = this.scratchDir.setFromSpherical(orbit).normalize();
      orbit.radius = fitPerspectiveBounds(bounds, direction, this.camera.fov, this.camera.aspect).distance;
    }
    orbit.radius *= this.zoomFactor;
    const zoomedCam = this.scratchZoomedCam.copy(wantedLook).add(offset.setFromSpherical(orbit));

    this.currentCamPos.lerp(zoomedCam, blend);
    this.currentLookAt.lerp(wantedLook, blend);
    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentLookAt);
    // Satah jauh meliputi studio walaupun kamera berundur pada skrin potret.
    this.camera.far = Math.max(130, this.camera.position.length() + 100);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld(true);

    // === ANIMASI 2-FASA TAB GAME MASUK KE DALAM DOK SLOT (BERDIRI TEGAK-CONDONG SUPAYA LABEL TIDAK TENGGELAM) ===
    const slotTilt = Math.PI * 0.42;
    this.cartridges.forEach((cartridge, index) => {
      const isSelected = !!this.state.inserted && index === this.state.module;
      const targetP = isSelected ? 1 : 0;
      const stepSpeed = snap ? 1 : 1 - Math.exp(-7.5 * dt);
      this.insertProgress[index] = THREE.MathUtils.lerp(this.insertProgress[index], targetP, stepSpeed);
      const p = this.insertProgress[index];

      if (this.drag?.part === `project:${index}` && this.drag.moved) {
        return;
      }

      const home = this.rackPositions[index];
      const aboveSlot = this.slotAbovePos;
      const insideSlot = this.slotInsidePos;

      if (p < 0.68) {
        // Fasa 1: Angkat dalam lengkungan parabolik dari rak bercondong ke atas mulut slot
        const t = p / 0.68;
        cartridge.position.lerpVectors(home, aboveSlot, t);
        cartridge.position.y += Math.sin(t * Math.PI) * 0.82;
        cartridge.rotation.x = THREE.MathUtils.lerp(-0.22, slotTilt, t);
        cartridge.rotation.y = 0;
        cartridge.rotation.z = 0;
      } else {
        // Fasa 2: Tusukan mekanikal lurus masuk ke dalam Dok Slot (kaki pin emas masuk, 100% label di atas bibir slot)
        const t = (p - 0.68) / 0.32;
        cartridge.position.lerpVectors(aboveSlot, insideSlot, t);
        cartridge.rotation.x = slotTilt;
        cartridge.rotation.y = 0;
        cartridge.rotation.z = 0;
      }
    });

    // Lampu LED pada Slot Kaset
    if (this.state.inserted) {
      this.scratchModColor.set(MODULES[this.state.module].accent);
      this.slotLedMat.color.copy(this.scratchModColor);
      this.slotLedMat.emissive.copy(this.scratchModColor);
      this.slotLedMat.emissiveIntensity = 0.85;
    } else {
      this.slotLedMat.color.set(C.muted);
      this.slotLedMat.emissive.set(0x000000);
      this.slotLedMat.emissiveIntensity = 0;
    }

    // Pintu Gelangsar Emitter Hologram & Lensa Optik (tanpa sebarang pertindihan geometri)
    const openOptics = this.state.opened || allowed;
    if (this.drag?.part !== 'lid') {
      this.lid.position.y = THREE.MathUtils.lerp(this.lid.position.y, openOptics ? 0.88 : 0.68, blend);
    }

    this.leftDoor.position.x = THREE.MathUtils.lerp(this.leftDoor.position.x, openOptics ? -1.02 : -0.66, blend);
    this.rightDoor.position.x = THREE.MathUtils.lerp(this.rightDoor.position.x, openOptics ? 0.26 : -0.1, blend);
    this.projectorHead.position.y = THREE.MathUtils.lerp(this.projectorHead.position.y, openOptics ? 0.38 : 0.16, blend);

    // Kemunculan Paparan Hologram Terapung & Pancaran Cahaya Volumetrik (pudar sementara semasa memfokus ke Perjalanan di belakang meja)
    const activeSlotProgress = this.state.inserted ? this.insertProgress[this.state.module] : 0;
    const beamReady = allowed && activeSlotProgress > 0.72 && this.focus !== 'journey';
    const hoverFloat = snap ? 0 : Math.sin(now * 0.003) * 0.035;

    this.holoOpacity = THREE.MathUtils.lerp(this.holoOpacity, beamReady ? 1 : 0, blend);
    this.screenMat.opacity = this.holoOpacity;
    this.preview.visible = this.holoOpacity > 0.02;

    this.holoScale = THREE.MathUtils.lerp(this.holoScale, beamReady ? 1 : 0.25, blend);
    this.preview.scale.set(this.holoScale, this.holoScale, 1);
    this.preview.position.y = THREE.MathUtils.lerp(this.preview.position.y, (beamReady ? 3.02 : 1.45) + hoverFloat, blend);

    const beamPulse = snap ? 0 : Math.sin(now * 0.005);
    const targetOuterOpacity = beamReady ? 0.22 + beamPulse * 0.03 : 0;
    const targetInnerOpacity = beamReady ? 0.34 + beamPulse * 0.04 : 0;
    this.outerBeamMat.opacity = THREE.MathUtils.lerp(this.outerBeamMat.opacity, targetOuterOpacity, blend);
    this.innerBeamMat.opacity = THREE.MathUtils.lerp(this.innerBeamMat.opacity, targetInnerOpacity, blend);
    this.beamGroup.visible = this.outerBeamMat.opacity > 0.01;
    if (beamReady) {
      this.outerBeamMat.color.set(MODULES[this.state.module].accent);
    }

    this.holoFrameMats.forEach(m => {
      m.opacity = THREE.MathUtils.lerp(m.opacity, beamReady ? 0.9 : 0, blend);
      if (beamReady) m.color.set(MODULES[this.state.module].accent);
    });

    if (allowed) {
      this.dataMat.color.set(0x1848bd);
      this.dataMat.emissive.set(0x2255d8);
      this.dataMat.emissiveIntensity = snap ? 0.5 : 0.45 + Math.sin(now * 0.004) * 0.2;
      this.lensMat.emissive.set(C.cyan);
      this.lensMat.emissiveIntensity = beamReady ? 1.35 : 0.6;
      this.ringMat.color.set(C.green);
      this.ringMat.emissive.set(C.green);
      this.ringMat.emissiveIntensity = 0.55;
      this.consoleLedMat.color.set(C.green);
      this.consoleLedMat.emissive.set(C.green);
      this.consoleLedMat.emissiveIntensity = 0.85;
    } else if (denied) {
      this.dataMat.color.set(C.circuit);
      this.dataMat.emissive.set(0);
      this.lensMat.emissive.set(C.amber);
      this.lensMat.emissiveIntensity = 0.2;
      this.ringMat.color.set(C.amber);
      this.ringMat.emissive.set(C.amber);
      this.ringMat.emissiveIntensity = snap ? 0.6 : 0.45 + Math.sin(now * 0.007) * 0.35;
      this.consoleLedMat.color.set(C.amber);
      this.consoleLedMat.emissive.set(C.amber);
      this.consoleLedMat.emissiveIntensity = 0.85;
    } else {
      this.dataMat.color.set(C.circuit);
      this.dataMat.emissive.set(0);
      this.lensMat.emissive.set(C.cyan);
      this.lensMat.emissiveIntensity = 0.15;
      this.ringMat.color.set(C.blue);
      this.ringMat.emissive.set(0);
      this.consoleLedMat.color.set(this.state.connected ? C.cyan : C.muted);
      this.consoleLedMat.emissive.set(this.state.connected ? C.cyan : 0);
      this.consoleLedMat.emissiveIntensity = this.state.connected ? 0.55 : 0;
    }

    // Animasi Palam & Kabel Jalinan Bergraviti
    if (this.drag?.part !== 'cable') {
      const targetPos = this.state.connected ? this.socket : this.plugHome;
      const targetRotY = this.state.connected ? 0 : 0.22;
      this.plug.rotation.y = THREE.MathUtils.lerp(this.plug.rotation.y, targetRotY, blend);
      if (this.plug.position.distanceToSquared(targetPos) > 0.00001 || Math.abs(this.plug.rotation.y - targetRotY) > 0.001) {
        this.plug.position.lerp(targetPos, blend);
        this.updateCable();
      }
    }

    // Status LED pada Palam & Bar Atas Homelab
    const netActive = this.state.connected;
    this.plugLedMat.color.set(netActive ? C.green : C.cyan);
    this.plugLedMat.emissive.set(netActive ? C.green : C.cyan);
    this.plugLedMat.emissiveIntensity = netActive ? 0.85 : 0.25;
    this.routerBarMat.color.set(netActive ? C.green : C.amber);
    this.routerBarMat.emissive.set(netActive ? C.green : C.amber);
    this.routerBarMat.emissiveIntensity = netActive ? 0.75 : 0.3;

    // Animasi Kad Pintar NFC (Pemilik & Pelawat) dengan Lengkungan Angkat ke atas Pad NFC
    const cardConfigs = [
      [this.owner, 'owner', this.ownerHome, 'ownerProgress'],
      [this.visitor, 'visitor', this.visitorHome, 'visitorProgress']
    ] as const;

    for (const [object, id, home, progKey] of cardConfigs) {
      const targetP = this.state.identity === id ? 1 : 0;
      this[progKey] = THREE.MathUtils.lerp(this[progKey], targetP, blend);
      if (this.drag?.part !== id) {
        const p = this[progKey];
        object.position.lerpVectors(home, this.cardReaderPos, p);
        object.position.y += Math.sin(p * Math.PI) * 0.55;
      }
    }

    // Lampu LED pada Unit Homelab & Rak Pelayan Latar Belakang
    this.leds.forEach((led, i) => {
      const m = led.material as THREE.MeshStandardMaterial;
      const active = this.state.connected;
      m.color.set(active ? C.green : C.muted);
      m.emissive.set(active ? C.green : 0);
      m.emissiveIntensity = active ? (snap ? 0.5 : 0.35 + Math.sin(now * 0.008 + i) * 0.25) : 0;
    });

    this.serverLedMats.forEach((m, i) => {
      m.emissiveIntensity = snap ? 0.55 : 0.4 + Math.sin(now * 0.004 + i * 0.7) * 0.28;
    });

    this.root.updateMatrixWorld(true);
    const points = this.anchorPoints;
    const viewW = this.canvas.clientWidth;
    const viewH = this.canvas.clientHeight;
    this.scratchLidPos.copy(this.lid.position).add(this.lidAnchorOffset);

    for (let i = 0; i < this.deskAnchorPairs.length; i++) {
      const [id, position] = this.deskAnchorPairs[i];
      const p = this.projectDeskGroup.localToWorld(this.scratchProject.copy(position)).project(this.camera);
      points[id] = {
        x: ((p.x + 1) / 2) * viewW,
        y: ((1 - p.y) / 2) * viewH
      };
    }

    // Sauh Stesen Kerja 3D Studio (Profil, Perjalanan, Kemahiran)
    for (let i = 0; i < WorkbenchWorld.studioAnchorPoints.length; i++) {
      const [id, position] = WorkbenchWorld.studioAnchorPoints[i];
      const p = this.root.localToWorld(this.scratchProject.copy(position)).project(this.camera);
      points[id] = {
        x: ((p.x + 1) / 2) * viewW,
        y: ((1 - p.y) / 2) * viewH
      };
    }

    this.options.anchors(points);
    this.dossier.animate(dt, snap);
    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.dead = true;
    cancelAnimationFrame(this.frame);
    this.observer?.disconnect();
    this.canvas.removeEventListener('pointerdown', this.down);
    this.canvas.removeEventListener('pointermove', this.move);
    this.canvas.removeEventListener('pointerup', this.up);
    this.canvas.removeEventListener('pointercancel', this.cancel);
    this.canvas.removeEventListener('lostpointercapture', this.cancel);
    this.canvas.removeEventListener('pointerleave', this.leave);
    this.canvas.removeEventListener('wheel', this.wheel);
    this.canvas.removeEventListener('webglcontextlost', this.contextLost);
    this.reduced.removeEventListener('change', this.motionChange);
    this.pendingImages.forEach(img => { img.onload = null; img.onerror = null; });
    this.pendingImages.clear();
    this.loadedImages.clear();
    this.cancel();
    this.geometries.forEach(g => g.dispose());
    this.materials.forEach(m => m.dispose());
    this.textures.forEach(t => t.dispose());
    this.geometries.clear();
    this.materials.clear();
    this.textures.clear();
    this.scene.traverse(o => {
      if (o instanceof THREE.DirectionalLight) o.shadow.dispose();
    });
    this.dossier?.dispose();
    this.env?.dispose();
    this.renderer?.dispose();
  }
}
