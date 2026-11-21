import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/** Setiap objek dalam bilik mempunyai satu tugas. */
export type RoomKind = 'computer' | 'launcher' | 'projection' | 'server' | 'skill' | 'badge' | 'book' | 'profile' | 'phone';
export type RoomView = 'overview' | 'computer' | 'screen' | 'profile' | 'server' | 'work' | 'learning';

export interface ProjectCard { name: string; company: string; badge: string; accent: string; stack: string[]; logo?: string }
export interface SkillIcon { name: string; category: string; hex: string; svg: string }
export interface CareerBadge { short: string; company: string; year: string; role: string; period: string; color: string }
export interface StudyBook { title: string; issuer: string; period: string; kind: 'degree' | 'cert'; color: string }
export interface RoomData { projects: ProjectCard[]; skills: SkillIcon[]; career: CareerBadge[]; study: StudyBook[]; name: string; role: string; code: string[] }

export interface RoomOptions {
  base: string;
  data: RoomData;
  onPick: (kind: RoomKind, index: number) => void;
  onHover: (info: { text: string; x: number; y: number } | null) => void;
  onView: (view: RoomView) => void;
  onProject: (index: number) => void;
  onReady: () => void;
}

const VIEWS: Record<RoomView, { pos: [number, number, number]; target: [number, number, number]; fit?: number }> = {
  overview: { pos: [2.35, 1.7, 2.95], target: [-0.85, 1.05, -0.95] },
  computer: { pos: [-0.9, 1.22, -1.32], target: [-0.95, 1.12, -2.24], fit: 0.42 },
  screen: { pos: [-0.15, 1.5, 0.4], target: [-2.98, 1.5, 0.25], fit: 0.42 },
  profile: { pos: [-0.47, 1.2, -1.36], target: [-0.27, 1.13, -2.24], fit: 0.4 },
  server: { pos: [0.15, 1.3, 0.75], target: [1.45, 1.12, -1.7], fit: 0.36 },
  work: { pos: [-0.6, 1.84, -1.4], target: [-0.6, 1.84, -2.5], fit: 0.72 },
  learning: { pos: [-1.05, 1.3, -0.75], target: [-2.3, 1.12, -2.3], fit: 0.38 }
};

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class RoomWorld {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(42, 1, 0.03, 40);
  private controls: OrbitControls;
  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private ray = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private hits: THREE.Object3D[] = [];
  private clock = new THREE.Clock();
  private reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  private observer: ResizeObserver;
  private frame = 0;
  private dead = false;
  private view: RoomView = 'overview';
  private tween: { from: THREE.Vector3; to: THREE.Vector3; fromT: THREE.Vector3; toT: THREE.Vector3; t: number } | null = null;
  private images = new Map<string, Promise<HTMLImageElement>>();

  // Projek
  private active = 0;
  private hoverTile = -1;
  private launcherCanvas = document.createElement('canvas');
  private launcherTex: THREE.CanvasTexture;
  private codeCanvas = document.createElement('canvas');
  private codeTex: THREE.CanvasTexture;
  private projCanvas = document.createElement('canvas');
  private projTex: THREE.CanvasTexture;
  private projMat!: THREE.MeshStandardMaterial;
  private projFade = 1;
  private reelClock = 0;
  private lastPick = -100;

  // Kemahiran
  private door!: THREE.Group;
  private doorOpen = 0;
  private icons: { sprite: THREE.Sprite; home: THREE.Vector3; delay: number }[] = [];
  private iconsOut = 0;
  private leds: { mat: THREE.MeshStandardMaterial; phase: number; speed: number }[] = [];

  // Kerjaya & pembelajaran
  private badges: { group: THREE.Group; card: THREE.Mesh; flip: number; target: number; x: number }[] = [];
  private books: { mesh: THREE.Mesh; home: THREE.Vector3; homeRot: number; out: number; target: number }[] = [];
  private readSpot = new THREE.Vector3();
  private shelves?: THREE.Object3D;
  private phoneMat!: THREE.MeshStandardMaterial;
  private phonePulse = 0;

  constructor(private canvas: HTMLCanvasElement, private opts: RoomOptions) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene.background = new THREE.Color(0x0b0c0f);

    const v = VIEWS.overview;
    this.camera.position.set(...v.pos);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.target.set(...v.target);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.minDistance = 2.4;
    // Kamera kekal di bawah siling (2.8 m): ketinggian maksimum = sasaran + jarak x kos(sudut kutub minimum).
    this.controls.maxDistance = 5.3;
    this.controls.minPolarAngle = 1.31;
    this.controls.maxPolarAngle = 1.58;
    const az = Math.atan2(v.pos[0] - v.target[0], v.pos[2] - v.target[2]);
    this.controls.minAzimuthAngle = az - 0.5;
    this.controls.maxAzimuthAngle = az + 0.3;
    this.controls.update();

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.3, 0.45, 0.97);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.launcherCanvas.width = 1024; this.launcherCanvas.height = 576;
    this.launcherTex = this.canvasTex(this.launcherCanvas);
    this.codeCanvas.width = 1024; this.codeCanvas.height = 576;
    this.codeTex = this.canvasTex(this.codeCanvas);
    this.projCanvas.width = 1600; this.projCanvas.height = 900;
    this.projTex = this.canvasTex(this.projCanvas);

    this.build().then(() => opts.onReady()).catch(err => console.error('[RoomWorld]', err));

    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(canvas);
    canvas.addEventListener('pointermove', this.move);
    canvas.addEventListener('pointerleave', this.leave);
    canvas.addEventListener('click', this.click);
    this.resize();
    this.frame = requestAnimationFrame(this.loop);
  }

  // ================= bantuan =================
  private canvasTex(c: HTMLCanvasElement) {
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  private tex(url: string, repeat: [number, number], srgb = false) {
    const t = new THREE.TextureLoader().load(url);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); t.anisotropy = 8;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  private pbr(name: string, repeat: [number, number], tint = 0xffffff) {
    const b = `${this.opts.base}/room/${name}/${name}`;
    return new THREE.MeshStandardMaterial({
      map: this.tex(`${b}_diff_1k.jpg`, repeat, true), normalMap: this.tex(`${b}_nor_gl_1k.jpg`, repeat),
      roughnessMap: this.tex(`${b}_rough_1k.jpg`, repeat), color: tint
    });
  }
  private std(color: number | string, roughness: number, metalness = 0) {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness });
  }
  private glow(color: number, intensity: number) {
    return new THREE.MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: intensity });
  }
  private add(geo: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[], pos: [number, number, number], parent: THREE.Object3D = this.scene, shadow = true) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos); m.castShadow = shadow; m.receiveShadow = true;
    parent.add(m); return m;
  }
  private tag(obj: THREE.Object3D, kind: RoomKind, index = 0, label = '') {
    obj.traverse(o => { if ((o as THREE.Mesh).isMesh || (o as THREE.Sprite).isSprite) { o.userData = { kind, index, label }; this.hits.push(o); } });
  }
  private async gltf(name: string) {
    const g = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(`${this.opts.base}/room/${name}/${name}.gltf`);
    g.scene.traverse(o => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return g.scene;
  }
  private async image(src: string) {
    let job = this.images.get(src);
    if (!job) {
      // Satu janji bagi setiap imej: lukisan serentak menunggu imej yang sama siap dimuat.
      job = new Promise<HTMLImageElement>(done => { const img = new Image(); img.src = src; img.decode().catch(() => undefined).finally(() => done(img)); });
      this.images.set(src, job);
    }
    return job;
  }
  private rr(x: CanvasRenderingContext2D, px: number, py: number, w: number, h: number, r: number) {
    x.beginPath(); x.roundRect(px, py, w, h, r);
  }
  private wrap(x: CanvasRenderingContext2D, text: string, max: number) {
    const lines: string[] = []; let line = '';
    for (const w of text.split(' ')) { const t = line ? `${line} ${w}` : w; if (line && x.measureText(t).width > max) { lines.push(line); line = w; } else line = t; }
    if (line) lines.push(line);
    return lines;
  }
  private drawLogo(x: CanvasRenderingContext2D, img: HTMLImageElement | undefined, fallback: string, accent: string, cx: number, cy: number, size: number) {
    if (img?.naturalWidth) {
      const r = Math.min(size / img.naturalWidth, size / img.naturalHeight);
      x.drawImage(img, cx - (img.naturalWidth * r) / 2, cy - (img.naturalHeight * r) / 2, img.naturalWidth * r, img.naturalHeight * r);
    } else {
      x.fillStyle = accent; x.font = `800 ${Math.round(size * 0.8)}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(fallback, cx, cy + size * 0.04);
    }
  }

  // ================= binaan =================
  private async build() {
    const hdr = await new HDRLoader().loadAsync(`${this.opts.base}/room/brown_photostudio_02/brown_photostudio_02_512.hdr`);
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromEquirectangular(hdr).texture;
    this.scene.environmentIntensity = 0.32;
    hdr.dispose(); pmrem.dispose();

    const floor = this.pbr('dark_wooden_planks', [3, 3], 0xb9b2a8);
    this.add(new THREE.PlaneGeometry(6, 5), floor, [0, 0, 0], this.scene, false).rotation.x = -Math.PI / 2;
    const wall = this.pbr('plastered_wall_04', [3, 1.4], 0x4a4f57);
    this.add(new THREE.PlaneGeometry(6, 2.8), wall, [0, 1.4, -2.5], this.scene, false);
    this.add(new THREE.PlaneGeometry(5, 2.8), wall, [-3, 1.4, 0], this.scene, false).rotation.y = Math.PI / 2;
    this.add(new THREE.PlaneGeometry(6, 5), this.std(0x1a1c20, 0.95), [0, 2.8, 0], this.scene, false).rotation.x = Math.PI / 2;
    const trim = this.std(0x15171b, 0.6);
    this.add(new THREE.BoxGeometry(6, 0.08, 0.02), trim, [0, 0.04, -2.49], this.scene, false);
    this.add(new THREE.BoxGeometry(0.02, 0.08, 5), trim, [-2.99, 0.04, 0], this.scene, false);

    this.buildDesk();
    this.buildComputer();
    this.buildChair();
    this.buildServer();
    this.buildProjector();
    this.buildPhone();
    this.buildBadges();
    this.buildLights();

    const [plant, shelves, ceilingLamp] = await Promise.all([
      this.gltf('potted_plant_02'), this.gltf('wooden_display_shelves_01'), this.gltf('modern_ceiling_lamp_01')
    ]);
    plant.position.set(2.35, 0, -1.95); plant.scale.setScalar(1.15); this.scene.add(plant);
    shelves.position.set(-2.3, 0, -2.3); shelves.rotation.y = Math.PI / 2; this.scene.add(shelves); this.shelves = shelves;
    ceilingLamp.position.set(0.35, 1.9, 0.0); this.scene.add(ceilingLamp);

    await Promise.all([this.buildBooks(), this.buildSkills(), this.selectProject(0), this.buildNeon()]);
  }

  private buildDesk() {
    const top = this.pbr('black_walnut_veneer_01', [1.6, 0.8], 0x6b5444);
    top.roughness = 0.55;
    this.add(new RoundedBoxGeometry(1.7, 0.035, 0.78, 3, 0.012), top, [-0.6, 0.74, -2.08]);
    const steel = this.std(0x18191c, 0.38, 0.85);
    for (const x of [-1.38, 0.18]) {
      this.add(new THREE.BoxGeometry(0.05, 0.72, 0.05), steel, [x, 0.36, -2.08]);
      this.add(new THREE.BoxGeometry(0.06, 0.03, 0.7), steel, [x, 0.015, -2.08]);
      this.add(new THREE.BoxGeometry(0.05, 0.03, 0.68), steel, [x, 0.705, -2.08]);
    }
    this.add(new THREE.BoxGeometry(1.5, 0.05, 0.03), steel, [-0.6, 0.66, -2.4]);
    this.add(new RoundedBoxGeometry(0.9, 0.004, 0.36, 2, 0.002), this.std(0x202226, 0.95), [-0.6, 0.76, -1.92], this.scene, false);
  }

  private buildComputer() {
    const shell = this.std(0x111214, 0.35, 0.6);
    const pc = new THREE.Group();
    const screens: [number, number, THREE.Texture, boolean][] = [[-0.95, 0.24, this.launcherTex, true], [-0.27, -0.22, this.codeTex, false]];
    let launcher: THREE.Mesh | undefined;
    let codeScreen: THREE.Mesh | undefined;
    for (const [x, ry, map, isLauncher] of screens) {
      const mon = new THREE.Group();
      this.add(new RoundedBoxGeometry(0.64, 0.38, 0.025, 2, 0.008), shell, [0, 0, 0], mon);
      const mat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 0.8, roughness: 0.7 });
      const scr = this.add(new THREE.PlaneGeometry(0.615, 0.352), mat, [0, 0.004, 0.0135], mon, false);
      this.add(new THREE.BoxGeometry(0.045, 0.24, 0.03), shell, [0, -0.25, -0.05], mon);
      this.add(new RoundedBoxGeometry(0.24, 0.012, 0.17, 2, 0.005), shell, [0, -0.37, -0.03], mon);
      // Lampu bar monitor: badan nipis di tepi atas, jalur hangat menghala ke meja.
      this.add(new THREE.CylinderGeometry(0.011, 0.011, 0.46, 16), this.std(0x16171a, 0.35, 0.8), [0, 0.205, 0.03], mon).rotation.z = Math.PI / 2;
      const strip = this.add(new THREE.PlaneGeometry(0.42, 0.008), this.glow(0xffd3a1, 2.6), [0, 0.194, 0.04], mon, false);
      strip.rotation.x = Math.PI / 2 + 0.5;
      this.add(new THREE.BoxGeometry(0.03, 0.02, 0.05), this.std(0x16171a, 0.35, 0.8), [0, 0.196, 0.0], mon);
      mon.position.set(x, 1.13, -2.24); mon.rotation.y = ry;
      pc.add(mon);
      if (isLauncher) launcher = scr; else codeScreen = scr;
    }
    const keyMat = this.std(0x2a2c31, 0.7, 0.1);
    this.add(new RoundedBoxGeometry(0.44, 0.018, 0.14, 2, 0.006), keyMat, [-0.6, 0.77, -1.88], pc);
    this.add(new RoundedBoxGeometry(0.065, 0.025, 0.11, 3, 0.012), keyMat, [-0.24, 0.772, -1.86], pc);
    this.add(new RoundedBoxGeometry(0.21, 0.46, 0.45, 2, 0.01), shell, [0.0, 0.24, -2.1], pc);
    this.add(new THREE.BoxGeometry(0.004, 0.36, 0.006), this.glow(0x39d0ff, 2.2), [-0.106, 0.26, -1.88], pc, false);
    this.scene.add(pc);
    this.tag(pc, 'computer', 0, 'Komputer · Projek');
    if (launcher) launcher.userData = { kind: 'launcher', index: 0, label: 'Pilih projek' };
    if (codeScreen) codeScreen.userData = { kind: 'profile', index: 0, label: 'Monitor · Tentang saya' };
  }

  private buildChair() {
    const fabric = this.std(0x1d2025, 0.92);
    const chrome = this.std(0xb8bcc4, 0.22, 1);
    const black = this.std(0x0f1012, 0.5, 0.3);
    const chair = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      this.add(new THREE.BoxGeometry(0.035, 0.03, 0.3), black, [Math.sin(a) * 0.15, 0.07, Math.cos(a) * 0.15], chair).rotation.y = a;
      this.add(new THREE.SphereGeometry(0.026, 12, 8), black, [Math.sin(a) * 0.3, 0.028, Math.cos(a) * 0.3], chair);
    }
    this.add(new THREE.CylinderGeometry(0.024, 0.024, 0.3, 16), chrome, [0, 0.24, 0], chair);
    this.add(new RoundedBoxGeometry(0.5, 0.08, 0.48, 4, 0.035), fabric, [0, 0.46, 0], chair);
    this.add(new RoundedBoxGeometry(0.46, 0.62, 0.07, 4, 0.03), fabric, [0, 0.86, -0.24], chair).rotation.x = -0.12;
    this.add(new THREE.BoxGeometry(0.04, 0.3, 0.04), black, [0, 0.62, -0.25], chair);
    for (const s of [-1, 1]) {
      this.add(new THREE.BoxGeometry(0.03, 0.2, 0.03), black, [s * 0.27, 0.56, -0.02], chair);
      this.add(new RoundedBoxGeometry(0.07, 0.025, 0.26, 2, 0.01), black, [s * 0.27, 0.67, 0.0], chair);
    }
    chair.position.set(0.12, 0, -1.3); chair.rotation.y = Math.PI + 1.1;
    this.scene.add(chair);
  }

  private buildServer() {
    const rack = new THREE.Group();
    const body = this.std(0x0d0e10, 0.45, 0.7);
    const w = 0.62, h = 2.0, d = 0.8;
    this.add(new THREE.BoxGeometry(w, 0.05, d), body, [0, h - 0.025, 0], rack);
    this.add(new THREE.BoxGeometry(w, 0.05, d), body, [0, 0.025, 0], rack);
    for (const s of [-1, 1]) this.add(new THREE.BoxGeometry(0.03, h, d), body, [s * (w / 2 - 0.015), h / 2, 0], rack);
    this.add(new THREE.BoxGeometry(w, h, 0.02), body, [0, h / 2, -d / 2 + 0.01], rack);
    const unit = this.std(0x1b1d21, 0.5, 0.6);
    const colors = [0x22e07a, 0x39d0ff, 0x22e07a, 0xffb020];
    for (let i = 0; i < 12; i++) {
      const y = 0.2 + i * 0.135;
      this.add(new THREE.BoxGeometry(w - 0.08, i % 3 === 0 ? 0.11 : 0.08, d - 0.12), unit, [0, y, 0.02], rack);
      for (let k = 0; k < 6; k++) {
        const mat = this.glow(colors[(i + k) % colors.length], 2);
        this.add(new THREE.BoxGeometry(0.012, 0.008, 0.004), mat, [-0.2 + k * 0.03, y + 0.015, d / 2 - 0.035], rack, false);
        this.leds.push({ mat, phase: Math.random() * 6, speed: 1 + Math.random() * 5 });
      }
    }
    // Pintu kaca berengsel di sisi kanan
    this.door = new THREE.Group();
    this.door.position.set(w / 2, 0, d / 2 + 0.004);
    const glass = new THREE.MeshPhysicalMaterial({ color: 0x223040, roughness: 0.08, transparent: true, opacity: 0.25 });
    this.add(new THREE.PlaneGeometry(w - 0.04, h - 0.08), glass, [-(w - 0.04) / 2, h / 2, 0], this.door, false);
    this.add(new THREE.BoxGeometry(0.015, 0.3, 0.02), this.std(0x9aa0a8, 0.3, 1), [-(w - 0.04) + 0.03, h / 2, 0.012], this.door);
    rack.add(this.door);
    rack.position.set(1.45, 0, -2.08);
    this.scene.add(rack);
    this.tag(rack, 'server', 0, 'Rak server · Kemahiran');
  }

  private buildProjector() {
    const proj = new THREE.Group();
    this.add(new RoundedBoxGeometry(0.34, 0.11, 0.3, 3, 0.02), this.std(0xe8e8ea, 0.45, 0.1), [0, 0, 0], proj);
    const lens = this.add(new THREE.CylinderGeometry(0.035, 0.04, 0.04, 24), this.std(0x101114, 0.15, 0.6), [-0.18, 0, 0.04], proj);
    lens.rotation.z = Math.PI / 2;
    this.add(new THREE.CircleGeometry(0.028, 24), this.glow(0xcfe8ff, 3), [-0.201, 0, 0.04], proj, false).rotation.y = -Math.PI / 2;
    this.add(new THREE.CylinderGeometry(0.012, 0.012, 0.13, 8), this.std(0x222326, 0.4, 0.8), [0, 0.12, 0], proj);
    proj.position.set(-0.95, 2.6, 0.95);
    this.scene.add(proj);
    this.projMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: this.projTex, emissiveIntensity: 0.62, roughness: 0.9 });
    // Skrin projektor gantung: kotak penggulung, fabrik bersempadan hitam, palang pemberat.
    const scr = new THREE.Group(); scr.position.set(-2.955, 0, 0.25); scr.rotation.y = Math.PI / 2; this.scene.add(scr);
    const casing = this.std(0x151618, 0.45, 0.6);
    this.add(new RoundedBoxGeometry(2.5, 0.1, 0.11, 3, 0.03), casing, [0, 2.3, 0.0], scr);
    for (const s of [-1, 1]) this.add(new THREE.BoxGeometry(0.03, 0.06, 0.06), casing, [s * 1.12, 2.32, -0.04], scr);
    this.add(new THREE.PlaneGeometry(2.33, 1.4), this.std(0x101113, 0.95), [0, 1.55, 0.0], scr, false);
    this.add(new THREE.PlaneGeometry(2.33, 0.07), this.std(0x101113, 0.95), [0, 2.215, 0.0], scr, false);
    this.add(new THREE.CylinderGeometry(0.014, 0.014, 2.36, 12), casing, [0, 0.84, 0.01], scr).rotation.z = Math.PI / 2;
    const screen = this.add(new THREE.PlaneGeometry(2.15, 1.21), this.projMat, [0, 1.55, 0.004], scr, false);
    this.tag(screen, 'projection', 0, 'Butiran projek');
    const spill = new THREE.PointLight(0x7fc4ff, 3.0, 3.2, 2); spill.position.set(-2.55, 1.55, 0.25); this.scene.add(spill);
  }

  /** Papan neon "munir." di dinding belakang, di atas rak: identiti laman sebagai tanda bercahaya. */
  private async buildNeon() {
    await document.fonts.load('800 160px Syne').catch(() => undefined);
    const c = document.createElement('canvas'); c.width = 1024; c.height = 300;
    const x = c.getContext('2d')!;
    x.font = '800 190px Syne, sans-serif'; x.textBaseline = 'middle'; x.textAlign = 'left';
    const word = 'munir', w = x.measureText(word).width, dot = x.measureText('.').width;
    const left = (1024 - w - dot) / 2;
    for (const [blur, alpha] of [[40, 0.55], [16, 0.8], [0, 1]] as const) {
      x.shadowBlur = blur; x.globalAlpha = alpha;
      x.shadowColor = '#ffd7a6'; x.fillStyle = '#fff4e6'; x.fillText(word, left, 150);
      x.shadowColor = '#e5b580'; x.fillStyle = '#e5b580'; x.fillText('.', left + w, 150);
    }
    const sign = new THREE.Group();
    const glowMat = new THREE.MeshBasicMaterial({ map: this.canvasTex(c), transparent: true, toneMapped: false, depthWrite: false, color: new THREE.Color(2.2, 2.0, 1.8) });
    this.add(new THREE.PlaneGeometry(0.95, 0.28), glowMat, [0, 0, 0.03], sign, false);
    const acrylic = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.15, transparent: true, opacity: 0.08 });
    this.add(new THREE.BoxGeometry(1.0, 0.32, 0.01), acrylic, [0, 0, 0.02], sign, false);
    for (const sx of [-0.46, 0.46]) for (const sy of [-0.13, 0.13]) {
      this.add(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 10), this.std(0xb8bcc4, 0.25, 1), [sx, sy, 0.012], sign).rotation.x = Math.PI / 2;
    }
    sign.position.set(-2.25, 2.12, -2.49);
    this.scene.add(sign);
    const warm = new THREE.PointLight(0xffc98a, 1.4, 1.6, 2); warm.position.set(-2.25, 2.1, -2.2); this.scene.add(warm);
  }

  private buildPhone() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 512;
    const x = c.getContext('2d')!;
    const g = x.createLinearGradient(0, 0, 256, 512); g.addColorStop(0, '#1e3a5f'); g.addColorStop(1, '#0b1220');
    x.fillStyle = g; x.fillRect(0, 0, 256, 512);
    x.fillStyle = '#e8eef7'; x.textAlign = 'center'; x.font = '300 72px sans-serif'; x.fillText('09:41', 128, 150);
    x.fillStyle = '#22c55e'; x.beginPath(); x.arc(128, 400, 34, 0, Math.PI * 2); x.fill();
    x.strokeStyle = '#ffffff'; x.lineWidth = 7; x.beginPath(); x.arc(128, 400, 15, 0.6, 2.5); x.stroke();
    const phone = new THREE.Group();
    this.add(new RoundedBoxGeometry(0.075, 0.008, 0.155, 3, 0.004), this.std(0x101114, 0.3, 0.7), [0, 0, 0], phone);
    this.phoneMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: this.canvasTex(c), emissiveIntensity: 0.35 });
    this.add(new THREE.PlaneGeometry(0.068, 0.146), this.phoneMat, [0, 0.0045, 0], phone, false).rotation.x = -Math.PI / 2;
    phone.position.set(0.0, 0.762, -1.86); phone.rotation.y = -0.35;
    this.scene.add(phone);
    this.tag(phone, 'phone', 0, 'Telefon · Hubungi');
  }

  private buildBadges() {
    const career = this.opts.data.career;
    const rail = this.std(0x2a2d33, 0.35, 0.8);
    const span = 1.5, x0 = -0.6 - span / 2;
    this.add(new THREE.BoxGeometry(span + 0.1, 0.03, 0.03), rail, [-0.6, 2.2, -2.47]);
    career.forEach((b, i) => {
      const x = x0 + (span * (i + 0.5)) / career.length;
      this.add(new THREE.CylinderGeometry(0.006, 0.006, 0.05, 8), rail, [x, 2.18, -2.45]).rotation.x = Math.PI / 2;
      const group = new THREE.Group();
      group.position.set(x, 2.17, -2.43);
      const strap = this.std(b.color, 0.8);
      for (const s of [-1, 1]) {
        const st = this.add(new THREE.BoxGeometry(0.012, 0.26, 0.002), strap, [s * 0.022, -0.125, 0], group, false);
        st.rotation.z = s * 0.09;
      }
      const card = new THREE.Group(); card.position.set(0, -0.33, 0); group.add(card);
      const edge = this.std(0xf4f4f5, 0.4);
      const mats = [edge, edge, edge, edge,
        new THREE.MeshStandardMaterial({ map: this.canvasTex(this.badgeFace(b, false)), roughness: 0.65, color: 0xdedede }),
        new THREE.MeshStandardMaterial({ map: this.canvasTex(this.badgeFace(b, true)), roughness: 0.65, color: 0xdedede })];
      this.add(new RoundedBoxGeometry(0.1, 0.145, 0.004, 1, 0.0015), mats, [0, 0, 0], card);
      this.add(new THREE.BoxGeometry(0.03, 0.012, 0.006), this.std(0x9aa0a8, 0.3, 1), [0, 0.078, 0], card);
      this.scene.add(group);
      this.tag(group, 'badge', i, `${b.short} · ${b.year}`);
      this.badges.push({ group, card: card as unknown as THREE.Mesh, flip: 0, target: 0, x });
    });
  }

  private badgeFace(b: CareerBadge, back: boolean) {
    const c = document.createElement('canvas'); c.width = 400; c.height = 580;
    const x = c.getContext('2d')!;
    x.fillStyle = '#fafafa'; x.fillRect(0, 0, 400, 580);
    x.fillStyle = b.color; x.fillRect(0, 0, 400, back ? 70 : 150);
    x.textAlign = 'center'; x.textBaseline = 'middle';
    if (!back) {
      x.fillStyle = '#ffffff'; x.font = '800 78px sans-serif'; x.fillText(b.short, 200, 80, 360);
      x.fillStyle = '#e4e4e7'; x.beginPath(); x.arc(200, 290, 78, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#a1a1aa'; x.beginPath(); x.arc(200, 268, 30, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.ellipse(200, 345, 52, 34, 0, Math.PI, 0); x.fill();
      x.fillStyle = '#18181b'; x.font = '800 96px sans-serif'; x.fillText(b.year, 200, 470);
      x.fillStyle = b.color; x.fillRect(120, 532, 160, 10);
    } else {
      x.fillStyle = '#ffffff'; x.font = '700 34px sans-serif'; x.fillText(b.period, 200, 36, 370);
      x.fillStyle = '#18181b'; x.font = '800 40px sans-serif';
      const lines = this.wrap(x, b.role, 350).slice(0, 5);
      lines.forEach((l, i) => x.fillText(l, 200, 150 + i * 52, 360));
      x.fillStyle = '#52525b'; x.font = '600 30px sans-serif';
      this.wrap(x, b.company, 350).slice(0, 3).forEach((l, i) => x.fillText(l, 200, 180 + lines.length * 52 + i * 40, 360));
    }
    return c;
  }

  private async buildBooks() {
    if (!this.shelves) return;
    this.shelves.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(this.shelves);
    const w = box.max.x - box.min.x, h = box.max.y - box.min.y;
    const cellW = w / 3, cellH = h / 4;
    const front = box.max.z - 0.17;
    this.readSpot.set((box.min.x + box.max.x) / 2 + 0.15, 1.2, box.max.z + 0.32);
    const study = this.opts.data.study;
    const degrees = study.filter(s => s.kind === 'degree'), certs = study.filter(s => s.kind === 'cert');
    const ordered = [...degrees, ...certs];
    const slotOf = (i: number) => (i < degrees.length ? { col: 0, row: 3 } : i < degrees.length + 5 ? { col: 1, row: 3 } : { col: 2, row: 3 });
    const counts = new Map<string, number>();
    ordered.forEach((b, i) => {
      const slot = slotOf(i); const key = `${slot.col}:${slot.row}`;
      const n = counts.get(key) ?? 0; counts.set(key, n + 1);
      const thick = b.kind === 'degree' ? 0.06 : 0.042, tall = b.kind === 'degree' ? cellH * 0.74 : cellH * 0.64, depth = 0.2;
      const base = this.std(b.color, 0.7);
      const coverMat = new THREE.MeshStandardMaterial({ map: this.canvasTex(this.coverFace(b)), roughness: 0.6 });
      const spineMat = new THREE.MeshStandardMaterial({ map: this.canvasTex(this.spineFace(b)), roughness: 0.6 });
      const pages = this.std(0xefe8d8, 0.9);
      // Paksi: x = tebal, y = tinggi, z = dalam. +z ialah tulang buku (menghadap pelawat), +x ialah kulit depan.
      const mesh = this.add(new THREE.BoxGeometry(thick, tall, depth), [coverMat, base, pages, pages, spineMat, pages], [0, 0, 0]);
      const x = box.min.x + cellW * slot.col + 0.03 + n * (thick + 0.006) + thick / 2;
      const home = new THREE.Vector3(x, box.min.y + cellH * slot.row + tall / 2 + 0.02, front);
      mesh.position.copy(home);
      this.tag(mesh, 'book', i, b.kind === 'degree' ? `UTM · ${b.title}` : b.title);
      this.books.push({ mesh, home, homeRot: 0, out: 0, target: 0 });
    });
    const deco = [0x2f3a4a, 0x7a5c3e, 0x44403c, 0x5b6b5d, 0x8c3b2f];
    for (const [col, row] of [[0, 2], [2, 2], [1, 1]] as const) {
      let x = box.min.x + cellW * col + 0.03;
      for (let k = 0; k < 5; k++) {
        const t = 0.03 + (k % 3) * 0.008, ht = cellH * (0.5 + ((k * 7) % 4) * 0.06);
        this.add(new THREE.BoxGeometry(t, ht, 0.18), this.std(deco[(k + col) % deco.length], 0.8), [x + t / 2, box.min.y + cellH * row + ht / 2 + 0.02, front]);
        x += t + 0.004;
      }
    }
  }

  private spineFace(b: StudyBook) {
    const c = document.createElement('canvas'); c.width = 128; c.height = 640;
    const x = c.getContext('2d')!;
    x.fillStyle = b.color; x.fillRect(0, 0, 128, 640);
    x.fillStyle = 'rgba(255,255,255,.85)'; x.fillRect(0, 40, 128, 6); x.fillRect(0, 594, 128, 6);
    x.save(); x.translate(64, 320); x.rotate(-Math.PI / 2);
    x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '700 44px sans-serif'; x.fillText(b.period ? b.period.replace(/^[A-Za-z]+ /, '') : b.issuer.split(' ')[0].toUpperCase(), 0, 0, 500);
    x.restore();
    return c;
  }

  private coverFace(b: StudyBook) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 720;
    const x = c.getContext('2d')!;
    x.fillStyle = b.color; x.fillRect(0, 0, 512, 720);
    x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 6; x.strokeRect(28, 28, 456, 664);
    x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '800 56px sans-serif'; x.fillText(b.kind === 'degree' ? 'UTM' : b.issuer.split(' ')[0], 256, 130, 420);
    x.font = '700 38px sans-serif';
    this.wrap(x, b.title, 400).slice(0, 6).forEach((l, i) => x.fillText(l, 256, 290 + i * 50, 420));
    if (b.period) { x.font = '800 58px sans-serif'; x.fillText(b.period, 256, 610, 440); }
    return c;
  }

  private async buildSkills() {
    const skills = this.opts.data.skills;
    const cats = [...new Set(skills.map(s => s.category))];
    const size = 0.11, gap = 0.035;
    await Promise.all(skills.map(async (s, i) => {
      const svg = await fetch(s.svg).then(r => r.text()).catch(() => '');
      const img = await this.image(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace('<svg ', `<svg fill="${s.hex}" `))}`);
      const c = document.createElement('canvas'); c.width = 256; c.height = 256;
      const x = c.getContext('2d')!;
      x.fillStyle = 'rgba(250,250,250,0.96)'; this.rr(x, 8, 8, 240, 240, 48); x.fill();
      if (img.naturalWidth) x.drawImage(img, 56, 56, 144, 144);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.canvasTex(c), transparent: true, depthWrite: false }));
      const row = cats.indexOf(s.category);
      const inRow = skills.filter(k => k.category === s.category);
      const col = inRow.indexOf(s);
      const rowW = inRow.length * size + (inRow.length - 1) * gap;
      const home = new THREE.Vector3(1.25 - rowW / 2 + col * (size + gap) + size / 2, 1.72 - row * 0.27, -1.35);
      sprite.position.set(1.45, 1.0, -1.75); sprite.scale.setScalar(0.001);
      sprite.userData = { kind: 'skill', index: i, label: s.name };
      this.scene.add(sprite); this.hits.push(sprite);
      this.icons.push({ sprite, home, delay: row * 0.08 + col * 0.03 });
    }));
  }

  private buildLights() {
    this.scene.add(new THREE.HemisphereLight(0x8899aa, 0x1a1410, 0.25));
    const key = new THREE.PointLight(0xffd8a8, 9, 6.5, 2); key.position.set(0.35, 1.78, 0.0);
    key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.002; key.shadow.radius = 4;
    this.scene.add(key);
    const desk = new THREE.SpotLight(0xffc98a, 11, 2.2, 0.95, 0.7, 2); desk.position.set(-0.6, 1.34, -2.18);
    desk.target.position.set(-0.6, 0.76, -1.85); desk.castShadow = true; desk.shadow.mapSize.set(1024, 1024); desk.shadow.bias = -0.001;
    this.scene.add(desk, desk.target);
    const wallWash = new THREE.SpotLight(0xffe2c0, 2.2, 3, 0.6, 0.8, 2); wallWash.position.set(-0.6, 2.7, -1.6);
    wallWash.target.position.set(-0.6, 1.8, -2.5); this.scene.add(wallWash, wallWash.target);
    const monitor = new THREE.PointLight(0x6fb8ff, 0.9, 2.2, 2); monitor.position.set(-0.6, 0.95, -1.75); this.scene.add(monitor);
    const rackGlow = new THREE.PointLight(0x2bd38a, 1.2, 1.8, 2); rackGlow.position.set(1.45, 1.1, -1.5); this.scene.add(rackGlow);
  }

  // ================= skrin =================
  /** Monitor kanan: profil sebagai kod, ditaip aksara demi aksara bila dibuka. */
  private typed = Infinity;
  private drawnChars = -2;
  private drawProfile() {
    const lines = this.opts.data.code;
    const total = lines.join('').length;
    const n = Math.min(this.typed, total);
    const blink = Math.floor(this.clock.elapsedTime * 2) % 2;
    const key = Math.floor(n) * 2 + blink;
    if (key === this.drawnChars) return;
    this.drawnChars = key;
    const c = this.codeCanvas, x = c.getContext('2d')!;
    x.fillStyle = '#0d1117'; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = '#161b22'; x.fillRect(0, 0, c.width, 38);
    x.fillStyle = '#8b949e'; x.font = '600 18px sans-serif'; x.textBaseline = 'middle'; x.fillText('munir.ts', 20, 20);
    x.font = '500 24px ui-monospace, Consolas, monospace';
    const token = /(\/\/.*$)|('[^']*'?)|(\b(?:export|const|true|false)\b)|([A-Za-z]+)(?=:)|(\s+|.)/g;
    const color = ['#8b949e', '#a5d6ff', '#ff7b72', '#7ee787', '#c9d1d9'];
    let budget = Math.floor(n), cx = 60, cy = 70;
    for (let li = 0; li < lines.length && budget > 0; li++) {
      cy = 70 + li * 40; cx = 60;
      x.fillStyle = '#484f58'; x.fillText(String(li + 1).padStart(2, ' '), 14, cy);
      for (const m of lines[li].matchAll(token)) {
        if (budget <= 0) break;
        const kind = m.slice(1).findIndex(v => v !== undefined);
        const part = m[0].slice(0, budget); budget -= part.length;
        x.fillStyle = color[kind] ?? '#c9d1d9'; x.fillText(part, cx, cy); cx += x.measureText(part).width;
      }
    }
    if (n < total || blink === 0) { x.fillStyle = '#e5b580'; x.fillRect(cx + 2, cy - 13, 12, 26); }
    this.codeTex.needsUpdate = true;
  }

  private tileRect(i: number) {
    const cols = 4, w = 196, h = 196, gx = 44, gy = 54, ox = (1024 - (cols * w + (cols - 1) * gx)) / 2, oy = 92;
    return { x: ox + (i % cols) * (w + gx), y: oy + Math.floor(i / cols) * (h + gy), w, h };
  }

  private async drawLauncher() {
    const projects = this.opts.data.projects;
    const imgs = await Promise.all(projects.map(p => (p.logo ? this.image(p.logo) : Promise.resolve(undefined))));
    const c = this.launcherCanvas, x = c.getContext('2d')!;
    const g = x.createLinearGradient(0, 0, 1024, 576); g.addColorStop(0, '#0f2236'); g.addColorStop(1, '#0a0f18');
    x.fillStyle = g; x.fillRect(0, 0, 1024, 576);
    x.fillStyle = 'rgba(255,255,255,.06)'; x.fillRect(0, 0, 1024, 40);
    x.fillStyle = '#cbd5e1'; x.font = '600 20px sans-serif'; x.textAlign = 'left'; x.textBaseline = 'middle';
    x.fillText('Projektor  ·  pilih projek untuk ditayangkan', 22, 21);
    projects.forEach((p, i) => {
      const r = this.tileRect(i);
      x.save();
      if (i === this.active) { x.shadowColor = p.accent; x.shadowBlur = 28; }
      x.fillStyle = i === this.hoverTile ? '#ffffff' : '#e2e8f0'; this.rr(x, r.x, r.y, r.w, r.h - 36, 26); x.fill();
      x.restore();
      if (i === this.active) { x.strokeStyle = p.accent; x.lineWidth = 7; this.rr(x, r.x - 4, r.y - 4, r.w + 8, r.h - 28, 30); x.stroke(); }
      this.drawLogo(x, imgs[i], p.name.slice(0, 1), p.accent, r.x + r.w / 2, r.y + (r.h - 36) / 2, 110);
      x.fillStyle = i === this.active ? '#ffffff' : '#94a3b8'; x.font = `${i === this.active ? 700 : 500} 19px sans-serif`;
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(p.name, r.x + r.w / 2, r.y + r.h - 12, r.w);
    });
    this.launcherTex.needsUpdate = true;
  }

  private async drawProjection() {
    const card = this.opts.data.projects[this.active];
    const img = card.logo ? await this.image(card.logo) : undefined;
    const c = this.projCanvas, x = c.getContext('2d')!;
    const g = x.createLinearGradient(0, 0, c.width, c.height); g.addColorStop(0, '#f3f5f8'); g.addColorStop(1, '#dfe4ea');
    x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = card.accent; x.fillRect(0, 0, c.width, 18);
    x.save(); x.shadowColor = 'rgba(0,0,0,.18)'; x.shadowBlur = 30; x.fillStyle = '#ffffff'; this.rr(x, 120, 230, 440, 440, 36); x.fill(); x.restore();
    this.drawLogo(x, img, card.name.slice(0, 1), card.accent, 340, 450, 320);
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    x.fillStyle = card.accent; x.font = '700 34px sans-serif'; x.fillText(card.badge, 640, 330, 860);
    x.fillStyle = '#0f172a'; x.font = '800 116px sans-serif'; x.fillText(card.name, 632, 455, 900);
    x.fillStyle = '#475569'; x.font = '600 44px sans-serif'; x.fillText(card.company, 640, 525, 860);
    let sx = 640, sy = 590;
    for (const s of card.stack.slice(0, 4)) {
      x.font = '700 34px sans-serif'; const w = x.measureText(s).width + 48;
      if (sx + w > c.width - 100) { sx = 640; sy += 84; }
      x.fillStyle = '#ffffff'; x.strokeStyle = card.accent; x.lineWidth = 3; this.rr(x, sx, sy, w, 66, 12); x.fill(); x.stroke();
      x.fillStyle = '#0f172a'; x.fillText(s, sx + 24, sy + 45); sx += w + 18;
    }
    this.projTex.needsUpdate = true;
  }

  get current() { return this.active; }

  async selectProject(i: number) {
    this.active = i;
    this.opts.onProject(i);
    this.projFade = 0;
    await Promise.all([this.drawLauncher(), this.drawProjection()]);
  }

  // ================= paparan & kamera =================
  setView(view: RoomView) {
    this.view = view;
    const v = VIEWS[view];
    this.tween = {
      from: this.camera.position.clone(), to: this.fitPos(v),
      fromT: this.controls.target.clone(), toT: new THREE.Vector3(...v.target), t: this.reduced ? 1 : 0
    };
    this.controls.enabled = view === 'overview';
    if (view === 'profile') this.typed = 0;
    if (view !== 'work') this.badges.forEach(b => (b.target = 0));
    if (view !== 'learning') this.books.forEach(b => (b.target = 0));
    this.opts.onView(view);
  }
  /** Kedudukan kamera untuk paparan, diundur pada skrin sempit supaya objek muat; kekal dalam bilik. */
  private fitPos(v: (typeof VIEWS)[RoomView]) {
    const pos = new THREE.Vector3(...v.pos), target = new THREE.Vector3(...v.target);
    const half = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * this.camera.aspect;
    let k = v.fit ? Math.min(2.2, Math.max(1, v.fit / half)) : 1;
    const dir = pos.clone().sub(target);
    const out = () => target.clone().addScaledVector(dir, k);
    // Dinding belakang (z = -2.5), dinding kiri (x = -3) dan siling (2.8 m).
    while (k > 1 && (out().z < -2.4 || out().x < -2.85 || out().y > 2.6)) k -= 0.05;
    return out();
  }
  /** Pilih projek pada monitor, kemudian kamera berpusing ke dinding untuk menonton tayangan. */
  present(i: number) {
    this.lastPick = this.clock.elapsedTime;
    void this.selectProject(i);
    this.opts.onPick('launcher', i);
    setTimeout(() => { if (!this.dead) this.setView('screen'); }, this.reduced ? 0 : 450);
  }
  /** Untuk navigasi papan kekunci daripada HTML. */
  activate(kind: 'badge' | 'book', index: number) {
    if (kind === 'badge') { if (this.view !== 'work') this.setView('work'); this.badges.forEach((b, i) => (b.target = i === index ? 1 : 0)); }
    else { if (this.view !== 'learning') this.setView('learning'); this.books.forEach((b, i) => (b.target = i === index ? 1 : 0)); }
  }

  // ================= interaksi =================
  private pick(e: { clientX: number; clientY: number }) {
    const r = this.canvas.getBoundingClientRect();
    this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.pointer, this.camera);
    const live = this.hits.filter(o => o.visible && (!(o as THREE.Sprite).isSprite || this.iconsOut > 0.5));
    return this.ray.intersectObjects(live, false)[0] ?? null;
  }
  private tileAt(uv?: THREE.Vector2 | null) {
    if (!uv) return -1;
    const px = uv.x * 1024, py = (1 - uv.y) * 576;
    return this.opts.data.projects.findIndex((_, i) => { const r = this.tileRect(i); return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h; });
  }
  private move = (e: PointerEvent) => {
    const hit = this.pick(e);
    const d = hit?.object.userData as { kind?: RoomKind; label?: string; index?: number } | undefined;
    let label = d?.label ?? '';
    if (d?.kind === 'launcher') {
      if (this.view !== 'computer') label = 'Komputer · Projek';
      else {
        const t = this.tileAt(hit?.uv);
        label = t >= 0 ? `Tayang ${this.opts.data.projects[t].name}` : '';
        if (t !== this.hoverTile) { this.hoverTile = t; void this.drawLauncher(); }
      }
    }
    if (d?.kind === 'badge' && this.badges[d.index ?? 0]?.target) label = 'Klik untuk pusing semula';
    const r = this.canvas.getBoundingClientRect();
    this.canvas.style.cursor = label ? 'pointer' : this.view === 'overview' ? 'grab' : 'default';
    this.opts.onHover(label ? { text: label, x: e.clientX - r.left, y: e.clientY - r.top } : null);
  };
  private leave = () => this.opts.onHover(null);
  private click = (e: MouseEvent) => {
    if ((e as PointerEvent).pointerType && (e as PointerEvent).pointerType !== 'mouse') this.move(e as PointerEvent);
    const hit = this.pick(e);
    if (!hit) return;
    const { kind, index } = hit.object.userData as { kind: RoomKind; index: number };
    switch (kind) {
      case 'computer': this.setView('computer'); break;
      case 'launcher':
        if (this.view !== 'computer') { this.setView('computer'); break; }
        { const t = this.tileAt(hit.uv); if (t >= 0) this.present(t); }
        break;
      case 'server': this.setView('server'); break;
      case 'badge':
        if (this.view !== 'work') this.setView('work');
        this.badges.forEach((b, i) => (b.target = i === index ? (b.target ? 0 : 1) : 0));
        break;
      case 'book':
        if (this.view !== 'learning') this.setView('learning');
        this.books.forEach((b, i) => (b.target = i === index ? (b.target ? 0 : 1) : 0));
        break;
      case 'profile': this.setView('profile'); break;
      case 'phone': this.phonePulse = 1; this.opts.onPick('phone', 0); break;
      default: this.opts.onPick(kind, index);
    }
  };

  private resize = () => {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    this.bloom.resolution.set(w, h);
    this.camera.aspect = w / h;
    this.camera.fov = w / h < 1 ? 70 : 42;
    this.camera.updateProjectionMatrix();
    if (this.view !== 'overview' && !this.tween) this.camera.position.copy(this.fitPos(VIEWS[this.view]));
  };

  private loop = () => {
    if (this.dead) return;
    this.frame = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;
    const k = this.reduced ? 1 : 1 - Math.exp(-7 * dt);

    if (this.tween) {
      this.tween.t = Math.min(1, this.tween.t + dt / 1.1);
      const e = ease(this.tween.t);
      this.camera.position.lerpVectors(this.tween.from, this.tween.to, e);
      this.controls.target.lerpVectors(this.tween.fromT, this.tween.toT, e);
      this.camera.lookAt(this.controls.target);
      if (this.tween.t >= 1) this.tween = null;
    } else if (this.view === 'overview') this.controls.update();
    else this.camera.lookAt(this.controls.target);

    if (!this.reduced) for (const l of this.leds) l.mat.emissiveIntensity = Math.sin(t * l.speed + l.phase) > 0.2 ? 2.4 : 0.25;

    // Kemahiran: pintu terbuka, logo terapung keluar mengikut baris kategori
    const serverOn = this.view === 'server' ? 1 : 0;
    this.doorOpen += (serverOn - this.doorOpen) * k;
    if (this.door) this.door.rotation.y = -1.9 * this.doorOpen;
    this.iconsOut += (serverOn - this.iconsOut) * (this.reduced ? 1 : 1 - Math.exp(-3 * dt));
    for (const ic of this.icons) {
      const p = THREE.MathUtils.clamp((this.iconsOut - ic.delay) / Math.max(0.2, 1 - ic.delay), 0, 1);
      const e = ease(p);
      ic.sprite.position.set(
        THREE.MathUtils.lerp(1.45, ic.home.x, e),
        THREE.MathUtils.lerp(1.0, ic.home.y, e) + (this.reduced ? 0 : Math.sin(t * 1.3 + ic.delay * 20) * 0.008 * e),
        THREE.MathUtils.lerp(-1.75, ic.home.z, e)
      );
      ic.sprite.scale.setScalar(Math.max(0.001, 0.11 * e));
    }

    // Kerjaya: pas berayun, berpusing bila dipilih
    this.badges.forEach((b, i) => {
      b.flip += (b.target - b.flip) * k;
      b.group.rotation.z = this.reduced ? 0 : Math.sin(t * 0.9 + i * 1.3) * 0.025 * (1 - b.flip);
      b.card.rotation.y = Math.PI * b.flip;
      // Pas dipilih dibawa ke tengah pandangan, dibesarkan dan didekatkan supaya jawatan boleh dibaca.
      const f = ease(Math.min(1, b.flip));
      b.group.position.set(THREE.MathUtils.lerp(b.x, -0.6, f), 2.17 + 0.3 * f, -2.43 + 0.3 * f);
      b.group.scale.setScalar(1 + 0.9 * f);
    });
    // Pembelajaran: buku ditarik keluar dan dipusing menunjukkan kulit depan
    for (const b of this.books) {
      b.out += (b.target - b.out) * k;
      b.mesh.position.lerpVectors(b.home, this.readSpot, ease(Math.min(1, b.out)));
      b.mesh.rotation.y = (-Math.PI / 2) * b.out;
      b.mesh.rotation.x = 0.12 * b.out;
      b.mesh.scale.setScalar(1 + 0.25 * b.out);
    }
    // Monitor profil: taip semasa dibuka; kursor berkelip.
    this.typed = this.view === 'profile' && !this.reduced ? this.typed + dt * 42 : Infinity;
    this.drawProfile();
    // Tayangan bergilir dalam paparan keseluruhan supaya pelawat nampak semua projek; berhenti 20 s selepas pilihan sendiri.
    if (this.view === 'overview' && !this.reduced && t - this.lastPick > 20) {
      this.reelClock += dt;
      if (this.reelClock > 6) { this.reelClock = 0; void this.selectProject((this.active + 1) % this.opts.data.projects.length); }
    } else this.reelClock = 0;
    // Projektor pudar masuk; telefon menyala bila diklik
    this.projFade = Math.min(1, this.projFade + (this.reduced ? 1 : dt * 2.2));
    if (this.projMat) this.projMat.emissiveIntensity = 0.62 * this.projFade;
    this.phonePulse = Math.max(0, this.phonePulse - dt * 0.8);
    if (this.phoneMat) this.phoneMat.emissiveIntensity = 0.35 + 0.9 * this.phonePulse;

    this.composer.render();
  };

  dispose() {
    this.dead = true; cancelAnimationFrame(this.frame); this.observer.disconnect();
    this.canvas.removeEventListener('pointermove', this.move);
    this.canvas.removeEventListener('pointerleave', this.leave);
    this.canvas.removeEventListener('click', this.click);
    this.controls.dispose(); this.renderer.dispose();
  }
}
