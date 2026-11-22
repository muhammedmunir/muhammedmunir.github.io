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
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';

/** Setiap objek dalam bilik mempunyai satu tugas. */
export type RoomKind = 'computer' | 'launcher' | 'projection' | 'server' | 'skill' | 'badge' | 'book' | 'profile' | 'phone' | 'window';
export type RoomView = 'overview' | 'computer' | 'screen' | 'profile' | 'server' | 'work' | 'learning' | 'phone';

export interface ProjectSlide { label: string; body: string }
export interface ProjectCard { name: string; company: string; badge: string; accent: string; stack: string[]; logo?: string; mono?: string; slides: ProjectSlide[]; note?: string }
export interface SkillIcon { name: string; category: string; hex: string; svg: string }
export interface CareerBadge { short: string; company: string; year: string; role: string; period: string; color: string }
export interface StudyBook { title: string; issuer: string; period: string; kind: 'degree' | 'cert'; color: string }
export interface RoomAction { label: string; value: string; color: string }
export interface RoomContact { phone: string; email: string; location: string; actions: RoomAction[] }
export interface RoomData { projects: ProjectCard[]; skills: SkillIcon[]; career: CareerBadge[]; study: StudyBook[]; name: string; role: string; code: string[]; locale: 'ms' | 'en'; contact: RoomContact }

export interface RoomOptions {
  base: string;
  data: RoomData;
  onPick: (kind: RoomKind, index: number) => void;
  onHover: (info: { text: string; x: number; y: number } | null) => void;
  onView: (view: RoomView) => void;
  onProject: (index: number) => void;
  onSlide?: (slide: number, total: number) => void;
  onDay?: (day: boolean) => void;
  /** Butang pada skrin telefon 3D (indeks dalam contact.actions). */
  onAction?: (index: number) => void;
  onReady: () => void;
}

const VIEWS: Record<RoomView, { pos: [number, number, number]; target: [number, number, number]; fit?: number }> = {
  overview: { pos: [2.35, 1.7, 2.95], target: [-0.85, 1.05, -0.95] },
  computer: { pos: [-0.9, 1.22, -1.32], target: [-0.95, 1.12, -2.24], fit: 0.42 },
  screen: { pos: [-0.15, 1.5, 0.4], target: [-2.98, 1.5, 0.25], fit: 0.42 },
  profile: { pos: [-0.47, 1.2, -1.36], target: [-0.27, 1.13, -2.24], fit: 0.4 },
  server: { pos: [1.2, 1.32, 1.05], target: [1.25, 1.2, -1.6], fit: 0.34 },
  work: { pos: [-0.6, 1.84, -1.4], target: [-0.6, 1.84, -2.5], fit: 0.72 },
  learning: { pos: [-2.08, 1.36, -1.0], target: [-2.3, 1.14, -2.3], fit: 0.36 },
  phone: { pos: [0.1, 1.42, -1.12], target: [-0.08, 0.78, -1.92] }
};

/** Teks dalam kanvas dan tooltip 3D, ikut bahasa pelawat. */
const TEXT = {
  ms: {
    computer: 'Komputer · Projek', rack: 'Rak server · Kemahiran', projection: 'Slaid seterusnya', watch: 'Projektor · Tonton projek', phone: 'Telefon · Hubungi',
    window: 'Tingkap · Tukar siang / malam', role: 'PERANAN SAYA', data: 'SENI BINA DATA', security: 'KESELAMATAN & AKSES', tech: 'TEKNOLOGI', project: 'PROJEK',
    open: 'Sedia untuk peluang baharu', mail: 'E-mel',
    launcher: 'Pilih projek', profile: 'Monitor · Tentang saya', head: 'Projektor  ·  pilih projek untuk ditayangkan', show: 'Tayang',
    flip: 'Klik untuk pusing semula', close: 'Klik untuk tutup buku', degree: 'ANUGERAH AKADEMIK', cert: 'SIJIL PROFESIONAL',
    issuer: 'Dikeluarkan oleh', awarded: 'Dianugerahkan kepada'
  },
  en: {
    computer: 'Computer · Projects', rack: 'Server rack · Skills', projection: 'Next slide', watch: 'Projector · Watch projects', phone: 'Phone · Contact',
    window: 'Window · Switch day / night', role: 'MY ROLE', data: 'DATA ARCHITECTURE', security: 'SECURITY & ACCESS', tech: 'TECHNOLOGY', project: 'PROJECT',
    open: 'Open to new opportunities', mail: 'Email',
    launcher: 'Choose a project', profile: 'Monitor · About me', head: 'Projector  ·  choose a project to screen', show: 'Show',
    flip: 'Click to flip back', close: 'Click to close the book', degree: 'ACADEMIC AWARD', cert: 'PROFESSIONAL CERTIFICATE',
    issuer: 'Issued by', awarded: 'Awarded to'
  }
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
  private slide = 0;

  // Kemahiran
  private door?: THREE.Group;
  private doorOpen = 0;
  private icons: { sprite: THREE.Sprite; home: THREE.Vector3; delay: number }[] = [];
  private iconsOut = 0;
  private leds: { mat: THREE.MeshStandardMaterial; phase: number; speed: number }[] = [];

  // Kerjaya & pembelajaran
  private badges: { group: THREE.Group; card: THREE.Mesh; flip: number; target: number; x: number }[] = [];
  private books: { mesh: THREE.Mesh; home: THREE.Vector3; homeRot: number; out: number; target: number }[] = [];
  private bookData: StudyBook[] = [];
  private reader?: {
    group: THREE.Group; pivot: THREE.Group; spine: THREE.Mesh;
    cover: THREE.MeshStandardMaterial; left: THREE.MeshStandardMaterial; right: THREE.MeshStandardMaterial; board: THREE.MeshStandardMaterial; spineFace: THREE.MeshStandardMaterial;
    t: number; target: number; index: number; pending: number;
    /** Pose dalam rak (sama dengan buku rak), pose ditarik keluar dan pose membaca di hadapan kamera. */
    shelf: THREE.Vector3; out: THREE.Vector3; spot: THREE.Vector3; qShelf: THREE.Quaternion; qRead: THREE.Quaternion; sShelf: number;
  };
  private beam?: THREE.MeshBasicMaterial;
  private noAo: THREE.Object3D[] = [];
  private ao?: GTAOPass;
  /** Pengawal prestasi: purata masa bingkai diukur setiap 90 bingkai; kualiti diturunkan berperingkat pada GPU lemah. */
  private perf = { n: 0, sum: 0, level: 0, wait: 4 };
  private get L() { return TEXT[this.opts.data.locale]; }
  private shelves?: THREE.Object3D;
  private phoneMat!: THREE.MeshStandardMaterial;
  private pc?: THREE.Group;
  private monitors: { mon: THREE.Group; scr: THREE.Mesh }[] = [];
  private phone?: {
    group: THREE.Group; screen: THREE.Mesh; t: number; idle: THREE.Texture; card: THREE.CanvasTexture; canvas: HTMLCanvasElement; hover: number;
    home: THREE.Vector3; qHome: THREE.Quaternion; held: THREE.Vector3; qHeld: THREE.Quaternion;
  };
  // Siang / malam
  private day = false;
  private dayT = 0;
  private lights = {} as Record<'hemi' | 'key' | 'desk' | 'wash' | 'sun' | 'sky', THREE.Light>;
  /** Bahan bercahaya lampu (glob siling, jalur lampu monitor) dengan keamatan asal; dipadam pada siang hari. */
  private lamps: { mat: THREE.MeshStandardMaterial; base: number }[] = [];
  private vignette!: ShaderPass;
  private outside?: { mat: THREE.MeshBasicMaterial; dayTex: THREE.Texture; nightTex: THREE.Texture; shown: boolean };

  constructor(private canvas: HTMLCanvasElement, private opts: RoomOptions) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = true;
    // r186 membuang PCFSoftShadowMap; PCF dengan jejari memberi bayang lembut.
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
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

    // Sasaran render berbilang sampel: tanpanya komposer membuang antialias dan tepi objek bergerigi.
    this.composer = new EffectComposer(this.renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }));
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    // Oklusi ambien (bayang sentuhan di sudut & bawah objek): desktop sahaja kerana kosnya pada GPU telefon.
    if (!matchMedia('(hover: none)').matches) {
      const ao = this.ao = new GTAOPass(this.scene, this.camera, 1, 1);
      ao.blendIntensity = 0.85;
      ao.updateGtaoMaterial({ radius: 0.28, distanceExponent: 1.2, thickness: 1, scale: 1 });
      // Objek lutsinar (pancaran projektor, neon, logo kemahiran) tidak boleh menghasilkan AO.
      const render = ao.render.bind(ao);
      ao.render = (...a: Parameters<typeof render>) => {
        const was = this.noAo.map(o => o.visible); this.noAo.forEach(o => (o.visible = false)); render(...a); this.noAo.forEach((o, k) => (o.visible = was[k]));
      };
      this.composer.addPass(ao);
    }
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.3, 0.45, 0.97);
    this.composer.addPass(this.bloom);
    const vignette = new ShaderPass(VignetteShader);
    vignette.uniforms.offset.value = 0.92; vignette.uniforms.darkness.value = 1.12;
    this.composer.addPass(vignette);
    this.vignette = vignette;
    // Siang atau malam mengikut jam pelawat; boleh ditukar dengan tingkap atau butang header.
    const hour = new Date().getHours();
    this.day = hour >= 7 && hour < 19; this.dayT = this.day ? 1 : 0;
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
  /** Model Sketchfab (CC BY): dimuat, berbayang, kemudian dinormalkan supaya tapak di y = 0 dan berpusat pada x/z. */
  private async sketch(name: string, size: { height?: number; width?: number }, dir = 'sketchfab') {
    const g = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(`${this.opts.base}/room/${dir}/${name}.glb`);
    const obj = g.scene;
    obj.traverse(o => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    obj.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(obj), dim = box.getSize(new THREE.Vector3());
    // Muat dalam had yang diberi (tinggi dan/atau lebar), ikut had yang paling ketat.
    const k = Math.min(size.height ? size.height / dim.y : Infinity, size.width ? size.width / dim.x : Infinity);
    obj.scale.multiplyScalar(k);
    obj.position.multiplyScalar(k).sub(new THREE.Vector3((box.min.x + box.max.x) / 2, box.min.y, (box.min.z + box.max.z) / 2).multiplyScalar(k));
    const wrap = new THREE.Group(); wrap.add(obj);
    wrap.updateMatrixWorld(true);
    return wrap;
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
      // Tiada logo yang cukup tajam: monogram pada jubin warna aksen projek.
      const s = size * 0.9, g = x.createLinearGradient(cx - s / 2, cy - s / 2, cx + s / 2, cy + s / 2);
      g.addColorStop(0, accent); g.addColorStop(1, '#0b0f16');
      x.fillStyle = g; this.rr(x, cx - s / 2, cy - s / 2, s, s, s * 0.24); x.fill();
      x.strokeStyle = 'rgba(255,255,255,.22)'; x.lineWidth = Math.max(2, s * 0.02); this.rr(x, cx - s / 2 + s * 0.06, cy - s / 2 + s * 0.06, s * 0.88, s * 0.88, s * 0.19); x.stroke();
      x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = `800 ${Math.round(s * (fallback.length > 2 ? 0.3 : 0.4))}px Syne, sans-serif`;
      x.fillText(fallback, cx, cy + s * 0.03, s * 0.8);
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
    this.buildWindowWall();
    this.add(new THREE.PlaneGeometry(5, 2.8), wall, [-3, 1.4, 0], this.scene, false).rotation.y = Math.PI / 2;
    const ceiling = this.add(new THREE.PlaneGeometry(6, 5), this.std(0x1a1c20, 0.95), [0, 2.8, 0], this.scene, true);
    ceiling.rotation.x = Math.PI / 2;
    // Dinding kanan tidak dilukis (pandangan kamera), tetapi tetap menghalang matahari supaya lantai tidak bercahaya pelik.
    const blocker = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, side: THREE.DoubleSide });
    const right = this.add(new THREE.PlaneGeometry(5, 2.8), blocker, [3, 1.4, 0], this.scene, true);
    right.rotation.y = -Math.PI / 2; right.receiveShadow = false;
    this.noAo.push(right);
    const trim = this.std(0x15171b, 0.6);
    this.add(new THREE.BoxGeometry(6, 0.08, 0.02), trim, [0, 0.04, -2.49], this.scene, false);
    this.add(new THREE.BoxGeometry(0.02, 0.08, 5), trim, [-2.99, 0.04, 0], this.scene, false);

    this.buildDesk();
    this.buildComputer();
    this.buildProjector();
    this.buildPhone();
    this.buildBadges();
    this.buildLights();

    const [plant, shelves, ceilingLamp] = await Promise.all([
      this.gltf('potted_plant_02'), this.gltf('wooden_display_shelves_01'), this.gltf('modern_ceiling_lamp_01'),
      this.fitComputer(), this.buildChair(), this.buildServer()
    ]);
    plant.position.set(2.35, 0, -1.95); plant.scale.setScalar(1.15); this.scene.add(plant);
    shelves.position.set(-2.3, 0, -2.3); shelves.rotation.y = Math.PI / 2; this.scene.add(shelves); this.shelves = shelves;
    shelves.traverse(o => { const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined; if (m?.color) m.color.setHex(0x8a6a52); });
    ceilingLamp.position.set(0.35, 1.9, 0.0); this.scene.add(ceilingLamp);
    ceilingLamp.traverse(o => {
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (m?.emissive && m.emissive.getHex() !== 0 && !this.lamps.some(l => l.mat === m)) this.lamps.push({ mat: m, base: m.emissiveIntensity });
    });

    await Promise.all([this.buildBooks(), this.buildSkills(), this.selectProject(0), this.buildNeon()]);
    // Semua model sudah dimuat: kira semula cahaya dan bayang matahari sekali.
    this.dayApplied = false;
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
    for (const [x, ry, map, isLauncher] of screens) {
      const mon = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 0.8, roughness: 0.7 });
      const scr = this.add(new THREE.PlaneGeometry(1, 1), mat, [0, 0, 0], mon, false);
      scr.userData = isLauncher ? { kind: 'launcher', index: 0, label: this.L.launcher } : { kind: 'profile', index: 0, label: this.L.profile };
      mon.position.set(x, 1.1, -2.24); mon.rotation.y = ry;
      pc.add(mon);
      this.monitors.push({ mon, scr });
    }
    // Menara PC dan jalur cahayanya
    void shell;
    this.scene.add(pc);
    this.pc = pc;
  }

  /** Monitor, papan kekunci dan tetikus sebenar (Sketchfab); skrin projek/profil kekal kanvas kita di atas panel model. */
  private async fitComputer() {
    const pc = this.pc!;
    const deskTop = 0.7575;
    const model = await this.sketch('monitor', { width: 0.66 });
    for (const { mon, scr } of this.monitors) {
      const m = model.clone(true);
      // Panel paparan (nod "Screen_Display"): pusat dan muka hadapannya menentukan kedudukan kanvas.
      // Diukur sebelum model dimasukkan ke kumpulan monitor yang condong: kotak dunia bagi objek berputar lebih besar daripada panel.
      let panel: THREE.Object3D | undefined;
      m.traverse(o => { if (/Display/i.test(o.name) && (o as THREE.Mesh).isMesh) panel = o; });
      m.updateMatrixWorld(true);
      const pb = new THREE.Box3().setFromObject(panel ?? m), all = new THREE.Box3().setFromObject(m);
      mon.add(m);
      const c = pb.getCenter(new THREE.Vector3()), size = pb.getSize(new THREE.Vector3());
      // Anjak model supaya pusat panel di asal kumpulan monitor, dan tapak di atas meja.
      m.position.sub(new THREE.Vector3(c.x, c.y, pb.max.z));
      mon.position.y = deskTop - (all.min.y - c.y);
      scr.scale.set(size.x * 0.955, size.y * 0.92, 1);
      scr.position.set(0, size.y * 0.02, 0.0015);
      // Lampu bar monitor di tepi atas panel
      const top = size.y / 2;
      this.add(new THREE.CylinderGeometry(0.011, 0.011, 0.46, 16), this.std(0x16171a, 0.35, 0.8), [0, top + 0.016, -0.005], mon).rotation.z = Math.PI / 2;
      const stripMat = this.glow(0xffd3a1, 2.6);
      this.lamps.push({ mat: stripMat, base: 2.6 });
      const strip = this.add(new THREE.PlaneGeometry(0.42, 0.008), stripMat, [0, top + 0.005, 0.006], mon, false);
      strip.rotation.x = Math.PI / 2 + 0.5;
      this.add(new THREE.BoxGeometry(0.03, 0.02, 0.05), this.std(0x16171a, 0.35, 0.8), [0, top + 0.012, -0.03], mon);
      // Panel model tidak bercahaya (kanvas kita yang menyala).
      m.traverse(o => { const mm = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined; if (mm?.emissive) { mm.emissiveIntensity = 0; } });
    }
    const tower = await this.sketch('pc', { height: 0.46 });
    tower.position.set(0.0, 0, -2.1); tower.rotation.y = this.turn.pc;
    pc.add(tower);
    // Timbunan buku di sudut belakang kiri meja, di luar bingkai paparan komputer.
    const pile = await this.sketch('books', { width: 0.2 });
    pile.position.set(-1.37, deskTop, -2.36); pile.rotation.y = this.turn.books;
    this.scene.add(pile);
    const keys = await this.sketch('keyboard', { width: 0.6 });
    keys.position.set(-0.6, deskTop + 0.004, -1.86);
    pc.add(keys);
    this.tag(pc, 'computer', 0, this.L.computer);
    // tag(pc) menimpa data skrin; pulihkan peranan setiap skrin.
    this.monitors.forEach(({ scr }, i) => (scr.userData = i === 0 ? { kind: 'launcher', index: 0, label: this.L.launcher } : { kind: 'profile', index: 0, label: this.L.profile }));
  }

  private async buildChair() {
    const chair = await this.sketch('chair', { height: 1.02 });
    chair.position.set(0.12, 0, -1.3); chair.rotation.y = Math.PI + 1.1 + this.chairTurn;
    this.scene.add(chair);
  }
  /** Putaran tambahan supaya hadapan model kerusi menghala ke meja (paksi model berbeza daripada kerusi lama). */
  private chairTurn = 0;
  /** Orientasi model (radian) dan anjakan projektor; ditentukan dengan menyemak gambar. */
  private projModel?: THREE.Object3D;
  private turn = { pc: 0, books: 0.5, projector: Math.PI, projectorDrop: 0.08, ency: 0 };

  private async buildServer() {
    const rack = await this.sketch('rack', { height: 2.1 });
    rack.position.set(1.45, 0, -2.06);
    // Pintu kaca model dipindahkan ke engsel di tepi kanan hadapan supaya boleh dibuka.
    let glass: THREE.Object3D | undefined;
    rack.traverse(o => { if (/Door/i.test(o.name) && (o as THREE.Mesh).isMesh) glass = o; });
    this.door = new THREE.Group();
    rack.add(this.door);
    if (glass) {
      rack.updateMatrixWorld(true);
      const inv = new THREE.Matrix4().copy(rack.matrixWorld).invert();
      const b = new THREE.Box3().setFromObject(glass).applyMatrix4(inv);
      this.door.position.set(b.max.x, 0, b.max.z);
      this.door.updateMatrixWorld(true);
      this.door.attach(glass);
      this.noAo.push(glass);
      const g = glass as THREE.Mesh;
      g.material = new THREE.MeshPhysicalMaterial({ color: 0x9fb6c8, roughness: 0.06, metalness: 0.1, transparent: true, opacity: 0.12, depthWrite: false });
      g.castShadow = false;
      // Bingkai pintu dan pemegang (dalam ruang engsel; pintu memanjang ke -x dari engsel).
      const dw = b.max.x - b.min.x, dh = b.max.y - b.min.y, cy = (b.min.y + b.max.y) / 2, z = (b.min.z - b.max.z) / 2;
      const metal = this.std(0x1a1c20, 0.35, 0.8), t = 0.03;
      for (const [w, h, x, y] of [[dw, t, -dw / 2, b.max.y - t / 2], [dw, t, -dw / 2, b.min.y + t / 2], [t, dh, -t / 2, cy], [t, dh, -dw + t / 2, cy]] as const)
        this.add(new THREE.BoxGeometry(w, h, 0.02), metal, [x, y, z], this.door);
      this.add(new THREE.BoxGeometry(0.018, 0.22, 0.03), this.std(0x9aa0a8, 0.25, 1), [-dw + 0.05, cy, z + 0.025], this.door);
    }
    this.scene.add(rack);
    this.tag(rack, 'server', 0, this.L.rack);
  }

  private buildProjector() {
    // Unit projektor siling sebenar (Sketchfab), sebaris dengan tengah skrin supaya pancarannya simetri.
    void this.sketch('projector', { width: 0.42 }).then(proj => {
      this.projModel = proj;
      proj.rotation.y = this.turn.projector;
      proj.position.set(-0.7, 2.575 - this.turn.projectorDrop, 0.18);
      this.scene.add(proj);
    });

    this.projMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: this.projTex, emissiveIntensity: 0.85, roughness: 0.95 });
    // Skrin projektor gantung: kotak penggulung, fabrik bersempadan hitam, palang pemberat.
    const scr = new THREE.Group(); scr.position.set(-2.955, 0, 0.25); scr.rotation.y = Math.PI / 2; this.scene.add(scr);
    const casing = this.std(0x1d1e21, 0.38, 0.55);
    this.add(new RoundedBoxGeometry(2.5, 0.1, 0.11, 3, 0.03), casing, [0, 2.3, 0.0], scr);
    for (const sx of [-1, 1]) this.add(new RoundedBoxGeometry(0.05, 0.11, 0.12, 2, 0.02), this.std(0x101113, 0.5, 0.4), [sx * 1.25, 2.3, 0], scr);
    // Fabrik matte: putih kelabu dengan sempadan hitam, sedikit lebih besar daripada imej.
    const fabric = this.std(0x0e0f11, 0.98);
    this.add(new THREE.PlaneGeometry(2.33, 1.4), fabric, [0, 1.55, 0.0], scr, false);
    this.add(new THREE.PlaneGeometry(2.33, 0.07), fabric, [0, 2.215, 0.0], scr, false);
    this.add(new THREE.CylinderGeometry(0.016, 0.016, 2.38, 16), casing, [0, 0.84, 0.012], scr).rotation.z = Math.PI / 2;
    for (const sx of [-1, 1]) this.add(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 16), this.std(0x0b0b0c, 0.5), [sx * 1.2, 0.84, 0.012], scr).rotation.z = Math.PI / 2;
    const screen = this.add(new THREE.PlaneGeometry(2.15, 1.21), this.projMat, [0, 1.55, 0.004], scr, false);
    this.tag(screen, 'projection', 0, this.L.projection);

    // Pancaran cahaya: piramid dari kanta ke empat bucu imej, campuran tambah (tiada kesan pada kedalaman).
    const apex = new THREE.Vector3(-0.94, 2.57, 0.25);
    const corners = [[-2.948, 2.155, -0.825], [-2.948, 2.155, 1.325], [-2.948, 0.945, 1.325], [-2.948, 0.945, -0.825]];
    const pos: number[] = [], col: number[] = [];
    for (let k = 0; k < 4; k++) {
      const a = corners[k], b = corners[(k + 1) % 4];
      pos.push(apex.x, apex.y, apex.z, a[0], a[1], a[2], b[0], b[1], b[2]);
      col.push(0.024, 0.027, 0.032, 0, 0, 0, 0, 0, 0);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    this.beam = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
    const beam = new THREE.Mesh(geo, this.beam);
    beam.renderOrder = 2;
    this.scene.add(beam);
    this.noAo.push(beam);
    const spill = new THREE.PointLight(0x9ec9ff, 2.2, 3.2, 2); spill.position.set(-2.55, 1.55, 0.25); this.scene.add(spill);
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
    const glowMat = this.neonMat = new THREE.MeshBasicMaterial({ map: this.canvasTex(c), transparent: true, toneMapped: false, depthWrite: false, color: new THREE.Color(2.2, 2.0, 1.8) });
    this.noAo.push(this.add(new THREE.PlaneGeometry(0.95, 0.28), glowMat, [0, 0, 0.03], sign, false));
    const acrylic = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.15, transparent: true, opacity: 0.08 });
    this.noAo.push(this.add(new THREE.BoxGeometry(1.0, 0.32, 0.01), acrylic, [0, 0, 0.02], sign, false));
    for (const sx of [-0.46, 0.46]) for (const sy of [-0.13, 0.13]) {
      this.add(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 10), this.std(0xb8bcc4, 0.25, 1), [sx, sy, 0.012], sign).rotation.x = Math.PI / 2;
    }
    sign.position.set(-2.25, 2.12, -2.49);
    this.scene.add(sign);
    const warm = this.neonLight = new THREE.PointLight(0xffc98a, 1.4, 1.6, 2); warm.position.set(-2.25, 2.1, -2.2); this.scene.add(warm);
    this.dayApplied = false;
  }

  private phoneCanvas(card: boolean) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 1024;
    const x = c.getContext('2d')!;
    const g = x.createLinearGradient(0, 0, 512, 1024); g.addColorStop(0, '#1b2b44'); g.addColorStop(1, '#090d16');
    x.fillStyle = g; x.fillRect(0, 0, 512, 1024);
    x.textAlign = 'center'; x.textBaseline = 'middle';
    const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    if (!card) {
      x.fillStyle = '#e8eef7'; x.font = '200 150px sans-serif'; x.fillText(time, 256, 300);
      x.fillStyle = '#22c55e'; x.beginPath(); x.arc(256, 820, 64, 0, Math.PI * 2); x.fill();
      x.strokeStyle = '#ffffff'; x.lineWidth = 12; x.beginPath(); x.arc(256, 820, 28, 0.6, 2.5); x.stroke();
      return c;
    }
    // Skrin kenalan dengan butang tindakan sebenar (ketik terus pada skrin telefon).
    this.drawPhoneCard(x, -1);
    return c;
  }

  /** Kedudukan butang pada kanvas telefon (piksel), dikongsi oleh lukisan dan ujian klik. */
  private phoneRow(i: number) { return { x: 32, y: 386 + i * 102, w: 448, h: 90 }; }

  private drawPhoneCard(x: CanvasRenderingContext2D, hover: number) {
    const d = this.opts.data, k = d.contact;
    const g = x.createLinearGradient(0, 0, 512, 1024); g.addColorStop(0, '#1b2b44'); g.addColorStop(1, '#090d16');
    x.fillStyle = g; x.fillRect(0, 0, 512, 1024);
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#94a3b8'; x.font = '600 26px sans-serif';
    x.fillText(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), 256, 40);
    const av = x.createLinearGradient(196, 82, 316, 202); av.addColorStop(0, '#e5b580'); av.addColorStop(1, '#a8743f');
    x.fillStyle = av; x.beginPath(); x.arc(256, 142, 60, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#1b1208'; x.font = '800 40px Syne, sans-serif';
    x.fillText(d.name.split(' ').map(w => w[0]).slice(0, 2).join(''), 256, 145);
    x.fillStyle = '#f8fafc'; x.font = '800 40px Syne, sans-serif'; x.fillText(d.name, 256, 244, 460);
    x.fillStyle = '#94a3b8'; x.font = '500 26px sans-serif'; x.fillText(d.role, 256, 284, 460);
    x.font = '600 22px sans-serif';
    const w = x.measureText(this.L.open).width + 60;
    x.fillStyle = 'rgba(34,197,94,.14)'; this.rr(x, 256 - w / 2, 312, w, 42, 21); x.fill();
    x.fillStyle = '#22c55e'; x.beginPath(); x.arc(256 - w / 2 + 24, 333, 7, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#bbf7d0'; x.fillText(this.L.open, 256 + 12, 334);
    k.actions.forEach((a, i) => {
      const r = this.phoneRow(i), on = i === hover, first = i === 0;
      x.fillStyle = first ? (on ? '#34d873' : '#22c55e') : on ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.07)';
      this.rr(x, r.x, r.y, r.w, r.h, 22); x.fill();
      if (!first) { x.fillStyle = a.color; x.beginPath(); x.arc(r.x + 46, r.y + r.h / 2, 18, 0, Math.PI * 2); x.fill(); }
      x.textAlign = 'left';
      const tx = first ? r.x + 32 : r.x + 82;
      x.fillStyle = first ? '#052e16' : '#f1f5f9'; x.font = '700 30px sans-serif'; x.fillText(a.label, tx, r.y + (a.value ? 32 : r.h / 2), 300);
      if (a.value) { x.fillStyle = first ? '#14532d' : '#94a3b8'; x.font = '500 22px sans-serif'; x.fillText(a.value, tx, r.y + 64, 320); }
      x.textAlign = 'right'; x.fillStyle = first ? '#052e16' : '#64748b'; x.font = '600 36px sans-serif'; x.fillText('›', r.x + r.w - 24, r.y + r.h / 2);
      x.textAlign = 'center';
    });
  }

  /** Butang telefon di bawah penuding (indeks), atau -1. */
  private phoneAction(uv?: THREE.Vector2 | null) {
    if (!uv) return -1;
    const px = uv.x * 512, py = (1 - uv.y) * 1024;
    return this.opts.data.contact.actions.findIndex((_, i) => { const r = this.phoneRow(i); return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h; });
  }
  private hoverPhone(i: number) {
    const p = this.phone; if (!p || p.hover === i) return;
    p.hover = i; this.drawPhoneCard(p.canvas.getContext('2d')!, i); p.card.needsUpdate = true;
  }

  private buildPhone() {
    const group = new THREE.Group();
    this.add(new RoundedBoxGeometry(0.075, 0.008, 0.155, 3, 0.004), this.std(0x101114, 0.3, 0.7), [0, 0, 0], group);
    const canvas = this.phoneCanvas(true);
    const idle = this.canvasTex(this.phoneCanvas(false)), card = this.canvasTex(canvas);
    this.phoneMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: idle, emissiveIntensity: 0.35 });
    const screen = this.add(new THREE.PlaneGeometry(0.068, 0.146), this.phoneMat, [0, 0.0045, 0], group, false);
    screen.rotation.x = -Math.PI / 2;
    group.position.set(0.0, 0.762, -1.86); group.rotation.y = -0.35;
    this.scene.add(group);
    this.tag(group, 'phone', 0, this.L.phone);
    this.phone = { group, screen, t: 0, idle, card, canvas, hover: -1, home: group.position.clone(), qHome: group.quaternion.clone(), held: new THREE.Vector3(), qHeld: new THREE.Quaternion() };
  }

  /** Kedudukan telefon semasa dipegang: berdiri tegak di tengah pandangan, cukup besar untuk butang skrinnya diketik. */
  private aimPhone() {
    const p = this.phone; if (!p) return;
    const v = VIEWS.phone, cam = this.fitPos(v), at = new THREE.Vector3(...v.target);
    const fwd = at.clone().sub(cam).normalize();
    const right = fwd.clone().cross(new THREE.Vector3(0, 1, 0)).normalize();
    const up = right.clone().cross(fwd);
    const tanV = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const narrow = this.camera.aspect < 1;
    // Telefon setinggi ~74% (desktop) atau 66% (skrin sempit) pandangan; sedikit ke bawah supaya tidak bertindih bar atas.
    const d = 0.155 / ((narrow ? 0.66 : 0.74) * 2 * tanV);
    p.held.copy(cam).addScaledVector(fwd, d).addScaledVector(up, -0.04 * d * tanV * 2);
    void right;
    // Selari dengan satah kamera (bukan menghala ke kedudukannya) supaya telefon tegak dalam gambar, tanpa senget perspektif.
    const face = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(cam, at, new THREE.Vector3(0, 1, 0)));
    // Kumpulan telefon berbaring (skrin +y); putar 90° pada x supaya skrin menghadap +z tempatan, iaitu ke arah kamera.
    p.qHeld.copy(face).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2));
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
    const boards: THREE.Object3D[] = []; this.shelves.traverse(o => { if ((o as THREE.Mesh).isMesh) boards.push(o); });
    const floorOf = (row: number) => {
      this.ray.set(new THREE.Vector3(box.min.x + cellW * 0.5, box.min.y + cellH * (row + 0.75), front), new THREE.Vector3(0, -1, 0));
      const hit = this.ray.intersectObjects(boards, false)[0];
      return hit ? hit.point.y + 0.002 : box.min.y + cellH * row + 0.02;
    };
    const study = this.opts.data.study;
    const degrees = study.filter(s => s.kind === 'degree'), certs = study.filter(s => s.kind === 'cert');
    const ordered = [...degrees, ...certs];
    this.bookData = ordered;
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
      const home = new THREE.Vector3(x, floorOf(slot.row) + tall / 2, front);
      mesh.position.copy(home);
      this.tag(mesh, 'book', i, b.kind === 'degree' ? `UTM · ${b.title}` : b.title);
      this.books.push({ mesh, home, homeRot: 0, out: 0, target: 0 });
    });
    // Set ensiklopedia (20 buku berasingan): setiap petak memaparkan sebahagian baris, dari buku yang berbeza.
    const set = await this.sketch('ency', { height: cellH * 0.72 });
    const meshes = (o: THREE.Object3D) => { const l: THREE.Object3D[] = []; o.traverse(m => { if ((m as THREE.Mesh).isMesh) l.push(m); }); return l; };
    const spans = meshes(set).map(m => { const b = new THREE.Box3().setFromObject(m); return { x0: b.min.x, x1: b.max.x }; });
    const order = spans.map((_, k) => k).sort((a, b) => spans[a].x0 - spans[b].x0);
    ([[0, 2], [2, 2], [1, 1]] as const).forEach(([col, row], ci) => {
      const g = set.clone(true), list = meshes(g);
      const start = spans[order[(ci * 6) % order.length]].x0, room = cellW * 0.86;
      list.forEach((m, k) => (m.visible = spans[k].x0 >= start - 1e-4 && spans[k].x1 <= start + room));
      g.position.set(box.min.x + cellW * col + 0.025 - start, floorOf(row), front - 0.05);
      this.scene.add(g);
    });
    // Hiasan petak kosong (Poly Haven, CC0): pokok kecil, timbunan buku dengan pasu, dan bingkai gambar.
    const cell = (col: number, row: number, dx: number) => new THREE.Vector3(box.min.x + cellW * (col + 0.5) + dx, floorOf(row), front - 0.04);
    const [plant, vase, frame, pile] = await Promise.all([
      this.sketch('potted_plant_04', { height: cellH * 0.62 }, 'decor'),
      this.sketch('ceramic_vase_01', { height: cellH * 0.5 }, 'decor'),
      this.sketch('standing_picture_frame_01', { height: cellH * 0.58 }, 'decor'),
      this.sketch('books', { width: cellW * 0.5 })
    ]);
    plant.position.copy(cell(1, 2, 0));
    pile.position.copy(cell(0, 1, -cellW * 0.18)); pile.rotation.y = 0.15;
    vase.position.copy(cell(0, 1, cellW * 0.2));
    frame.position.copy(cell(2, 1, 0)); frame.rotation.y = -Math.PI / 2 + 0.25;
    // Karya seni bingkai: cetakan abstrak dalam palet bilik (bukit dan matahari hangat).
    frame.traverse(o => {
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      // Kaca bingkai menjadi legap selepas tekstur dimampatkan: disembunyikan.
      if (m && /glass/i.test(m.name)) { o.visible = false; return; }
      // Kertas bingkai tidak terlalu putih (tanpa silau bloom).
      if (m && !/artwork/i.test(m.name)) { m.color.setHex(0xa8a196); return; }
      if (!m) return;
      const c = document.createElement('canvas'); c.width = 256; c.height = 320;
      const x = c.getContext('2d')!;
      const sky = x.createLinearGradient(0, 0, 0, 320); sky.addColorStop(0, '#f3e6d3'); sky.addColorStop(1, '#e2b48a');
      x.fillStyle = sky; x.fillRect(0, 0, 256, 320);
      x.fillStyle = '#c8643c'; x.beginPath(); x.arc(170, 120, 42, 0, Math.PI * 2); x.fill();
      for (const [y, col] of [[200, '#8a5a44'], [240, '#4b3b36'], [280, '#26252a']] as const) {
        x.fillStyle = col; x.beginPath(); x.moveTo(0, 320); x.lineTo(0, y);
        for (let k = 0; k <= 8; k++) x.lineTo(k * 32, y + Math.sin(k * 1.3 + y) * 18);
        x.lineTo(256, 320); x.fill();
      }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.flipY = false;
      m.map = t; m.color.setHex(0xcfc8c0); m.needsUpdate = true;
    });
    this.scene.add(plant, vase, frame, pile);
    this.buildReader();
  }

  /**
   * Buku pembaca: satu buku keras yang terbang dari rak ke hadapan kamera dan terbuka.
   * Paksi: engsel di x = 0; separuh kanan statik; separuh kiri (kulit depan + muka kiri) berputar -180° pada paksi y.
   */
  private buildReader() {
    const pw = 0.2, ph = 0.27, pt = 0.014, bt = 0.006;
    const group = new THREE.Group(), pivot = new THREE.Group();
    const board = this.std(0x2b2b2b, 0.65);
    const spineFace = new THREE.MeshStandardMaterial({ roughness: 0.6 });
    const paper = this.std(0xf1ead9, 0.92);
    const cover = new THREE.MeshStandardMaterial({ roughness: 0.55 });
    const left = new THREE.MeshStandardMaterial({ roughness: 0.92 });
    const right = new THREE.MeshStandardMaterial({ roughness: 0.92 });
    this.pageMats = [left, right, cover];
    // Separuh kanan: papan belakang + blok halaman (muka +z = halaman kanan).
    this.add(new THREE.BoxGeometry(pw + 0.008, ph + 0.01, bt), board, [pw / 2, 0, -bt / 2 - pt / 2 + 0.004], group);
    this.add(new THREE.BoxGeometry(pw - 0.006, ph - 0.008, pt), [paper, paper, paper, paper, right, paper], [pw / 2 - 0.003, 0, 0.004], group);
    // Separuh kiri berengsel pada z = 0.011 supaya terletak rata dengan separuh kanan bila terbuka.
    pivot.position.set(0, 0, 0.011); group.add(pivot);
    this.add(new THREE.BoxGeometry(pw - 0.006, ph - 0.008, pt), [paper, paper, paper, paper, paper, left], [pw / 2 - 0.003, 0, 0.007], pivot);
    this.add(new THREE.BoxGeometry(pw + 0.008, ph + 0.01, bt), [board, board, board, board, cover, board], [pw / 2, 0, 0.007 + pt / 2 + bt / 2], pivot);
    // Tulang buku
    this.add(new THREE.CylinderGeometry(0.012, 0.012, ph + 0.01, 16, 1, false, 0, Math.PI), board, [0, 0, 0.004], group).rotation.y = Math.PI / 2;
    // Muka tulang buku bertulis, sama seperti buku di rak; disembunyikan bila buku mula terbuka.
    const spine = this.add(new THREE.PlaneGeometry(0.047, ph + 0.01), spineFace, [-0.0125, 0, 0.011], group, false);
    spine.rotation.y = -Math.PI / 2;
    group.visible = false;
    this.scene.add(group);
    this.tag(group, 'book', 0, this.L.close);
    const v = () => new THREE.Vector3(), q = () => new THREE.Quaternion();
    this.reader = {
      group, pivot, spine, cover, left, right, board, spineFace, t: 0, target: 0, index: -1, pending: -1,
      shelf: v(), out: v(), spot: v(), qShelf: q(), qRead: q(), sShelf: 1
    };
  }

  /** Klik buku: buka; klik buku yang sama: tutup dan letak semula; klik buku lain: tutup dahulu, kemudian buka yang baharu. */
  private openBook(i: number) {
    const r = this.reader;
    if (!r || !this.bookData[i]) return;
    if (r.target === 1 && r.index === i) { r.target = 0; r.pending = -1; return; }
    if (r.t > 0 && r.index !== i) { r.target = 0; r.pending = i; return; }
    this.prepareBook(i);
    r.target = 1;
  }

  private prepareBook(i: number) {
    const r = this.reader!, b = this.bookData[i], shelfBook = this.books[i];
    r.index = i; r.pending = -1;
    for (const [m, c] of [[r.cover, this.coverFace(b)], [r.left, this.leftPage(b)], [r.right, this.rightPage(b)], [r.spineFace, this.spineFace(b)]] as const) {
      m.map?.dispose(); m.map = this.canvasTex(c); m.needsUpdate = true;
    }
    r.board.color.set(b.color);
    r.group.traverse(o => { if (o.userData.kind) o.userData.index = i; });
    // Pose rak: tulang buku (x tempatan = 0) menghadap pelawat (+z dunia), kulit depan ke +x, ketinggian sama dengan buku rak.
    const g = shelfBook.mesh.geometry as THREE.BoxGeometry, { height, depth } = g.parameters;
    r.sShelf = height / 0.28;
    r.qShelf.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    r.shelf.copy(shelfBook.home).add(new THREE.Vector3(-0.011 * r.sShelf, 0, depth / 2 - 0.012 * r.sShelf));
    r.out.copy(r.shelf).add(new THREE.Vector3(0, 0.01, depth * 1.1));
    // Titik baca di hadapan kamera paparan pembelajaran; lebih jauh pada skrin sempit supaya buku terbuka muat.
    const cam = this.fitPos(VIEWS.learning), at = new THREE.Vector3(...VIEWS.learning.target);
    const half = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * this.camera.aspect;
    const d = Math.max(0.72, 0.25 / half);
    r.spot.copy(cam).addScaledVector(at.sub(cam).normalize(), d);
    const look = new THREE.Object3D(); look.position.copy(r.spot); look.lookAt(cam);
    r.qRead.copy(look.quaternion);
  }

  private leftPage(b: StudyBook) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 700;
    const x = c.getContext('2d')!;
    x.fillStyle = '#f4eee0'; x.fillRect(0, 0, 512, 700);
    const sh = x.createLinearGradient(512, 0, 430, 0); sh.addColorStop(0, 'rgba(0,0,0,.18)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = sh; x.fillRect(430, 0, 82, 700);
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = b.color; x.font = '700 22px sans-serif';
    x.fillText((b.kind === 'degree' ? this.L.degree : this.L.cert).split('').join(' '), 250, 92, 440);
    // Meterai
    x.strokeStyle = b.color; x.lineWidth = 5; x.beginPath(); x.arc(250, 300, 112, 0, Math.PI * 2); x.stroke();
    x.lineWidth = 2; x.beginPath(); x.arc(250, 300, 96, 0, Math.PI * 2); x.stroke();
    x.fillStyle = b.color; x.font = '800 62px Syne, sans-serif';
    x.fillText(b.kind === 'degree' ? 'UTM' : b.issuer.split(' ')[0].toUpperCase(), 250, 304, 170);
    x.fillStyle = '#6b6257'; x.font = '500 22px sans-serif'; x.fillText(this.L.issuer, 250, 476);
    x.fillStyle = '#2a2520'; x.font = '700 30px sans-serif';
    this.wrap(x, b.issuer, 400).slice(0, 3).forEach((l, k) => x.fillText(l, 250, 520 + k * 40, 420));
    return c;
  }

  private rightPage(b: StudyBook) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 700;
    const x = c.getContext('2d')!;
    x.fillStyle = '#f4eee0'; x.fillRect(0, 0, 512, 700);
    const sh = x.createLinearGradient(0, 0, 82, 0); sh.addColorStop(0, 'rgba(0,0,0,.18)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = sh; x.fillRect(0, 0, 82, 700);
    x.strokeStyle = b.color; x.lineWidth = 3; x.strokeRect(46, 40, 420, 620);
    x.lineWidth = 1; x.strokeRect(56, 50, 400, 600);
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#6b6257'; x.font = '500 22px sans-serif'; x.fillText(this.L.awarded, 256, 112);
    x.fillStyle = '#1f1b16'; x.font = '800 38px Syne, sans-serif'; x.fillText(this.opts.data.name, 256, 160, 380);
    x.fillStyle = b.color; x.fillRect(206, 200, 100, 3);
    x.fillStyle = '#1f1b16'; x.font = '700 34px sans-serif';
    const lines = this.wrap(x, b.title, 360).slice(0, 6);
    const top = 360 - (lines.length - 1) * 22;
    lines.forEach((l, k) => x.fillText(l, 256, top + k * 44, 380));
    if (b.period) { x.fillStyle = b.color; x.font = '800 44px sans-serif'; x.fillText(b.period, 256, 586, 380); }
    return c;
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
      this.scene.add(sprite); this.hits.push(sprite); this.noAo.push(sprite);
      this.icons.push({ sprite, home, delay: row * 0.08 + col * 0.03 });
    }));
  }

  /** Dinding belakang dengan bukaan tingkap sebenar (bentuk berlubang) supaya cahaya matahari masuk melaluinya. */
  private buildWindowWall() {
    const W = { x0: 0.32, x1: 1.04, y0: 1.2, y1: 2.3 }, cx = (W.x0 + W.x1) / 2, cy = (W.y0 + W.y1) / 2, ww = W.x1 - W.x0, wh = W.y1 - W.y0;
    const shape = new THREE.Shape([new THREE.Vector2(-3, 0), new THREE.Vector2(3, 0), new THREE.Vector2(3, 2.8), new THREE.Vector2(-3, 2.8)]);
    shape.holes.push(new THREE.Path([new THREE.Vector2(W.x0, W.y0), new THREE.Vector2(W.x0, W.y1), new THREE.Vector2(W.x1, W.y1), new THREE.Vector2(W.x1, W.y0)]));
    // UV bentuk dalam meter: ulangan 0.5 / m sama dengan dinding kiri (3 ulangan bagi 6 m).
    const wall = this.add(new THREE.ShapeGeometry(shape), this.pbr('plastered_wall_04', [0.5, 0.5], 0x4a4f57), [0, 0, -2.5]);
    wall.castShadow = true;
    const win = new THREE.Group(); win.position.set(cx, cy, -2.5); this.scene.add(win);
    // Ketebalan dinding (bendul dalam)
    const reveal = this.std(0x3d4148, 0.9), depth = 0.16;
    for (const [w, h, x, y] of [[ww, 0.02, 0, wh / 2 + 0.01], [ww, 0.02, 0, -wh / 2 - 0.01], [0.02, wh + 0.04, -ww / 2 - 0.01, 0], [0.02, wh + 0.04, ww / 2 + 0.01, 0]] as const)
      this.add(new THREE.BoxGeometry(w, h, depth), reveal, [x, y, -depth / 2], win);
    // Bingkai aluminium, tiang tengah dan palang melintang
    const frame = this.std(0x1c1e22, 0.4, 0.7), fz = -0.1;
    for (const [w, h, x, y] of [[ww, 0.04, 0, wh / 2 - 0.02], [ww, 0.04, 0, -wh / 2 + 0.02], [0.04, wh, -ww / 2 + 0.02, 0], [0.04, wh, ww / 2 - 0.02, 0], [0.03, wh, 0, 0], [ww, 0.03, 0, wh * 0.22]] as const)
      this.add(new THREE.BoxGeometry(w, h, 0.05), frame, [x, y, fz], win);
    const glass = new THREE.MeshPhysicalMaterial({ color: 0xdfe8f2, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.12, depthWrite: false });
    const pane = this.add(new THREE.PlaneGeometry(ww - 0.06, wh - 0.06), glass, [0, 0, fz - 0.005], win, false);
    this.noAo.push(pane);
    // Ambang tingkap
    this.add(new RoundedBoxGeometry(ww + 0.14, 0.03, 0.2, 2, 0.008), this.std(0x9c968c, 0.7), [0, -wh / 2 - 0.015, 0.02], win);
    this.tag(win, 'window', 0, this.L.window);
    // Pemandangan luar: langit dan bangunan bandar, siang dan malam.
    const dayTex = this.canvasTex(this.skyline(true)), nightTex = this.canvasTex(this.skyline(false));
    const mat = new THREE.MeshBasicMaterial({ map: this.day ? dayTex : nightTex, toneMapped: false });
    // Dekat dengan dinding, supaya hanya kelihatan melalui tingkap.
    this.add(new THREE.PlaneGeometry(1.4, 1.75), mat, [cx, cy + 0.1, -2.76], this.scene, false).receiveShadow = false;
    this.outside = { mat, dayTex, nightTex, shown: this.day };
  }

  private skyline(day: boolean) {
    const c = document.createElement('canvas'); c.width = 768; c.height = 960;
    const x = c.getContext('2d')!, W = c.width, H = c.height;
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const sky = x.createLinearGradient(0, 0, 0, H);
    if (day) { sky.addColorStop(0, '#5d97cf'); sky.addColorStop(0.62, '#b9d6ec'); sky.addColorStop(1, '#e8eef2'); }
    else { sky.addColorStop(0, '#03060f'); sky.addColorStop(0.6, '#0d1630'); sky.addColorStop(1, '#2a2338'); }
    x.fillStyle = sky; x.fillRect(0, 0, W, H);
    if (day) {
      // Awan nipis
      x.fillStyle = 'rgba(255,255,255,.55)';
      for (let k = 0; k < 5; k++) { const cx = rnd() * W, cy = 80 + rnd() * 260; for (let j = 0; j < 6; j++) { x.beginPath(); x.ellipse(cx + j * 34 - 90, cy + rnd() * 14, 60 + rnd() * 40, 16 + rnd() * 8, 0, 0, Math.PI * 2); x.fill(); } }
    } else {
      x.fillStyle = '#ffffff';
      for (let k = 0; k < 80; k++) { x.globalAlpha = 0.3 + rnd() * 0.7; x.fillRect(rnd() * W, rnd() * H * 0.55, 2, 2); }
      x.globalAlpha = 1;
      x.fillStyle = '#f4efe2'; x.beginPath(); x.arc(W * 0.7, 150, 34, 0, Math.PI * 2); x.fill();
    }
    // Dua lapis bangunan: jauh (kabur) dan dekat (dengan tingkap)
    const layers: [number, string, number][] = day ? [[0.5, '#9db2c6', 0], [0.62, '#6c7f93', 0.08]] : [[0.5, '#151b2b', 0.5], [0.62, '#0a0e18', 0.75]];
    for (const [top, color, lit] of layers) {
      let bx = -20;
      while (bx < W) {
        const bw = 60 + rnd() * 120, bh = H * (1 - top) * (0.45 + rnd() * 0.75);
        const by = H - bh;
        x.fillStyle = color; x.fillRect(bx, by, bw, bh);
        if (lit) for (let wy = by + 14; wy < H - 10; wy += 22) for (let wx = bx + 10; wx < bx + bw - 12; wx += 18)
          if (rnd() < lit * 0.5) { x.fillStyle = day ? 'rgba(255,255,255,.25)' : rnd() < 0.8 ? '#ffd58a' : '#cfe6ff'; x.globalAlpha = day ? 1 : 0.55 + rnd() * 0.45; x.fillRect(wx, wy, 8, 11); x.globalAlpha = 1; }
        bx += bw + 4 + rnd() * 14;
      }
    }
    if (!day) { const glow = x.createLinearGradient(0, H * 0.7, 0, H); glow.addColorStop(0, 'rgba(255,150,80,0)'); glow.addColorStop(1, 'rgba(255,150,80,.18)'); x.fillStyle = glow; x.fillRect(0, 0, W, H); }
    return c;
  }

  get isDay() { return this.day; }
  setDay(on: boolean) {
    this.day = on;
    this.opts.onDay?.(on);
  }
  /** Cahaya bilik: malam = lampu hangat dan bayang dalam; siang = matahari melalui tingkap dan langit terang. */
  private lightDay(dt: number) {
    const want = this.day ? 1 : 0, L = this.lights;
    if (!L.sun || (this.dayT === want && this.dayApplied)) return;
    this.dayT = this.reduced ? want : want > this.dayT ? Math.min(1, this.dayT + dt / 1.4) : Math.max(0, this.dayT - dt / 1.4);
    this.dayApplied = true;
    const d = ease(this.dayT), mix = (a: number, b: number) => a + (b - a) * d;
    // Siang: semua lampu bilik dipadam (lampu siling, lampu monitor, sinaran dinding); cahaya datang dari tingkap dan langit.
    L.hemi.intensity = mix(0.25, 1.25);
    L.key.intensity = mix(9, 0);
    L.desk.intensity = mix(11, 0);
    L.wash.intensity = mix(2.2, 0);
    L.sun.intensity = mix(0, 4.2);
    L.sky.intensity = mix(0, 2.6);
    for (const l of this.lamps) l.mat.emissiveIntensity = l.base * (1 - d);
    // Neon padam: huruf kembali ke warna akrilik pudar, tanpa cahaya.
    if (this.neonMat) { this.neonMat.color.setRGB(2.2, 2.0, 1.8).lerp(new THREE.Color(0.32, 0.31, 0.3), d); this.neonMat.opacity = 1 - 0.45 * d; }
    if (this.neonLight) this.neonLight.intensity = 1.4 * (1 - d);
    for (const m of this.pageMats) m.color.setScalar(1 - 0.42 * d);
    this.scene.environmentIntensity = mix(0.32, 0.85);
    this.renderer.toneMappingExposure = mix(1, 0.95);
    this.bloom.strength = mix(0.3, 0.1);
    this.vignette.uniforms.darkness.value = mix(1.12, 0.8);
    (this.scene.background as THREE.Color).setHex(0x0b0c0f).lerp(new THREE.Color(0x1b1f25), d);
    if (this.outside && this.outside.shown !== this.dayT > 0.5) {
      this.outside.shown = this.dayT > 0.5;
      this.outside.mat.map = this.outside.shown ? this.outside.dayTex : this.outside.nightTex; this.outside.mat.needsUpdate = true;
    }
    // Peta bayang matahari dikemas kini setiap bingkai hanya pada desktop; telefon mengemas kini semasa peralihan sahaja.
    (L.sun as THREE.DirectionalLight).shadow.needsUpdate = true;
  }
  private dayApplied = false;
  private neonMat?: THREE.MeshBasicMaterial;
  /** Halaman buku pembaca: dimalapkan pada waktu siang supaya tidak silau dan teks kekal jelas. */
  private pageMats: THREE.MeshStandardMaterial[] = [];
  private neonLight?: THREE.PointLight;

  private buildLights() {
    const touch = matchMedia('(hover: none)').matches;
    const hemi = new THREE.HemisphereLight(0x8899aa, 0x1a1410, 0.25);
    this.scene.add(hemi);
    const key = new THREE.PointLight(0xffd8a8, 9, 6.5, 2); key.position.set(0.35, 1.78, 0.0);
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0015; key.shadow.normalBias = 0.02; key.shadow.radius = 5;
    this.scene.add(key);
    const desk = new THREE.SpotLight(0xffc98a, 11, 2.2, 0.95, 0.7, 2); desk.position.set(-0.6, 1.34, -2.18);
    desk.target.position.set(-0.6, 0.76, -1.85); desk.castShadow = true; desk.shadow.mapSize.set(1024, 1024); desk.shadow.bias = -0.001;
    this.scene.add(desk, desk.target);
    const wallWash = new THREE.SpotLight(0xffe2c0, 2.2, 3, 0.6, 0.8, 2); wallWash.position.set(-0.6, 2.7, -1.6);
    wallWash.target.position.set(-0.6, 1.8, -2.5); this.scene.add(wallWash, wallWash.target);
    // Matahari: dari belakang dinding, hanya masuk melalui tingkap (dinding belakang menghasilkan bayang).
    const sun = new THREE.DirectionalLight(0xfff0d8, 0); sun.position.set(2.6, 4.2, -6); sun.target.position.set(0.2, 0.6, -1.0);
    sun.castShadow = true; sun.shadow.mapSize.setScalar(touch ? 1024 : 2048);
    Object.assign(sun.shadow.camera, { left: -3.5, right: 3.5, top: 3.5, bottom: -3.5, near: 1, far: 14 });
    sun.shadow.camera.updateProjectionMatrix();
    sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
    sun.shadow.autoUpdate = !touch;
    this.scene.add(sun, sun.target);
    // Cahaya langit sejuk dari arah tingkap
    const sky = new THREE.PointLight(0xcfe0ff, 0, 4.5, 2); sky.position.set(0.68, 1.75, -2.15); this.scene.add(sky);
    this.lights = { hemi, key, desk, wash: wallWash, sun, sky };
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
    x.fillText(this.L.head, 22, 21);
    projects.forEach((p, i) => {
      const r = this.tileRect(i);
      x.save();
      if (i === this.active) { x.shadowColor = p.accent; x.shadowBlur = 28; }
      x.fillStyle = i === this.hoverTile ? '#ffffff' : '#e2e8f0'; this.rr(x, r.x, r.y, r.w, r.h - 36, 26); x.fill();
      x.restore();
      if (i === this.active) { x.strokeStyle = p.accent; x.lineWidth = 7; this.rr(x, r.x - 4, r.y - 4, r.w + 8, r.h - 28, 30); x.stroke(); }
      this.drawLogo(x, imgs[i], p.mono ?? p.name.slice(0, 1), p.accent, r.x + r.w / 2, r.y + (r.h - 36) / 2, 110);
      x.fillStyle = i === this.active ? '#ffffff' : '#94a3b8'; x.font = `${i === this.active ? 700 : 500} 19px sans-serif`;
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(p.name, r.x + r.w / 2, r.y + r.h - 12, r.w);
    });
    this.launcherTex.needsUpdate = true;
  }

  /** Slaid tayangan: latar gelap sinematik, titik panas di tengah dan bucu malap seperti imej projektor sebenar. */
  private async drawProjection() {
    const card = this.opts.data.projects[this.active];
    const slide = this.slide, active = this.active;
    const img = card.logo ? await this.image(card.logo) : undefined;
    // Lukisan lain mungkin bermula semasa imej dimuat; hanya yang terkini dilukis.
    if (slide !== this.slide || active !== this.active) return;
    const c = this.projCanvas, x = c.getContext('2d')!, W = c.width, H = c.height;
    const bg = x.createRadialGradient(W * 0.42, H * 0.46, 60, W * 0.5, H * 0.5, W * 0.72);
    bg.addColorStop(0, '#1d2533'); bg.addColorStop(0.55, '#121721'); bg.addColorStop(1, '#06080c');
    x.fillStyle = bg; x.fillRect(0, 0, W, H);
    if (slide === 0) this.titleSlide(x, card, img);
    else this.detailSlide(x, card, img, slide);
    // Kaki slaid: kedudukan slaid dalam projek ini.
    const n = this.slideCount;
    x.textAlign = 'right'; x.textBaseline = 'alphabetic';
    x.fillStyle = '#64748b'; x.font = '600 26px sans-serif';
    x.fillText(`${String(slide + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`, W - 70, H - 60);
    x.fillStyle = 'rgba(255,255,255,.08)'; x.fillRect(70, H - 72, W - 260, 2);
    x.fillStyle = this.alpha(card.accent, 1); x.fillRect(70, H - 72, ((W - 260) * (slide + 1)) / n, 2);
    // Kejatuhan cahaya di bucu (vignet projektor)
    const v = x.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.62);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)');
    x.fillStyle = v; x.fillRect(0, 0, W, H);
    this.projTex.needsUpdate = true;
  }

  private titleSlide(x: CanvasRenderingContext2D, card: ProjectCard, img?: HTMLImageElement) {
    const W = this.projCanvas.width;
    // Cahaya aksen projek yang lembut di belakang logo.
    const glow = x.createRadialGradient(330, 450, 20, 330, 450, 420);
    glow.addColorStop(0, this.alpha(card.accent, 0.42)); glow.addColorStop(1, this.alpha(card.accent, 0));
    x.fillStyle = glow; x.fillRect(0, 0, W, this.projCanvas.height);
    // Jubin logo: kertas putih lembut kerana kebanyakan logo berlatar cerah.
    x.save(); x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = 60; x.shadowOffsetY = 18;
    x.fillStyle = '#f3f4f6'; this.rr(x, 150, 270, 360, 360, 44); x.fill(); x.restore();
    this.drawLogo(x, img, card.mono ?? card.name.slice(0, 1), card.accent, 330, 450, 270);
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    x.fillStyle = this.alpha(card.accent, 1); x.fillRect(620, 286, 64, 6);
    x.fillStyle = '#9fb0c6'; x.font = '700 30px sans-serif';
    x.fillText(card.badge.toUpperCase(), 708, 300, 780);
    x.fillStyle = '#f8fafc'; x.font = `800 ${card.name.length > 14 ? 92 : 118}px Syne, sans-serif`;
    x.fillText(card.name, 612, 430, 900);
    x.fillStyle = '#b8c4d4'; x.font = '500 42px sans-serif'; x.fillText(card.company, 618, 500, 860);
    this.pills(x, card.stack.slice(0, 5), 618, 560, W - 90, 30);
    // Kedudukan projek dalam koleksi
    const n = this.opts.data.projects.length;
    x.textAlign = 'right'; x.fillStyle = '#64748b'; x.font = '700 24px sans-serif';
    x.fillText(`${this.L.project} ${String(this.active + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`, W - 70, 92);
  }

  /** Slaid butiran: kepala kecil (logo + nama), label bahagian dan satu kenyataan besar. */
  private detailSlide(x: CanvasRenderingContext2D, card: ProjectCard, img: HTMLImageElement | undefined, slide: number) {
    const W = this.projCanvas.width;
    const glow = x.createRadialGradient(W * 0.2, 120, 10, W * 0.2, 120, 700);
    glow.addColorStop(0, this.alpha(card.accent, 0.28)); glow.addColorStop(1, this.alpha(card.accent, 0));
    x.fillStyle = glow; x.fillRect(0, 0, W, this.projCanvas.height);
    x.fillStyle = '#f3f4f6'; this.rr(x, 90, 70, 116, 116, 22); x.fill();
    this.drawLogo(x, img, card.mono ?? card.name.slice(0, 1), card.accent, 148, 128, 88);
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    x.fillStyle = '#f8fafc'; x.font = '800 46px Syne, sans-serif'; x.fillText(card.name, 236, 124, 1100);
    x.fillStyle = '#94a3b8'; x.font = '500 28px sans-serif'; x.fillText(card.company, 238, 166, 1100);
    const s = card.slides[slide - 1];
    x.fillStyle = this.alpha(card.accent, 1); x.fillRect(96, 292, 64, 6);
    x.fillStyle = '#9fb0c6'; x.font = '700 30px sans-serif'; x.fillText(s.label, 184, 306, 1200);
    if (!s.body) {
      this.pills(x, card.stack, 96, 370, W - 96, 40);
      if (card.note) { x.fillStyle = '#94a3b8'; x.font = '500 32px sans-serif'; x.fillText(card.note, 96, 740, W - 200); }
      return;
    }
    // Saiz huruf menyusut untuk kenyataan panjang supaya kekal dalam 4 baris.
    let size = 64, lines: string[] = [];
    for (; size >= 44; size -= 4) { x.font = `700 ${size}px sans-serif`; lines = this.wrap(x, s.body, 1360); if (lines.length <= 4) break; }
    x.fillStyle = '#f1f5f9';
    lines.slice(0, 5).forEach((l, k) => x.fillText(l, 96, 420 + k * size * 1.3, 1400));
  }

  private pills(x: CanvasRenderingContext2D, tags: string[], left: number, top: number, right: number, size: number) {
    let sx = left, sy = top;
    const h = size * 1.9;
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    for (const t of tags) {
      x.font = `600 ${size}px sans-serif`; const w = x.measureText(t).width + size * 1.5;
      if (sx + w > right) { sx = left; sy += h + 16; }
      x.fillStyle = 'rgba(255,255,255,.06)'; x.strokeStyle = 'rgba(255,255,255,.28)'; x.lineWidth = 2;
      this.rr(x, sx, sy, w, h, h / 2); x.fill(); x.stroke();
      x.fillStyle = '#e2e8f0'; x.fillText(t, sx + size * 0.75, sy + h * 0.68); sx += w + 14;
    }
  }
  private alpha(hex: string, a: number) {
    const v = parseInt(hex.replace('#', ''), 16);
    return `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},${a})`;
  }

  get current() { return this.active; }

  async selectProject(i: number) {
    this.active = i;
    this.slide = 0;
    this.opts.onProject(i);
    this.opts.onSlide?.(0, this.slideCount);
    this.projFade = 0;
    await Promise.all([this.drawLauncher(), this.drawProjection()]);
  }
  /** Slaid 1 ialah tajuk; selebihnya butiran projek (peranan, data, keselamatan, teknologi). */
  get slideCount() { return 1 + (this.opts.data.projects[this.active]?.slides.length ?? 0); }
  /** Tukar slaid tayangan projek semasa; berpusing semula ke slaid pertama selepas yang terakhir. */
  nextSlide(step = 1) {
    const n = this.slideCount;
    this.slide = (this.slide + step + n) % n;
    this.lastPick = this.clock.elapsedTime;
    this.projFade = 0.25;
    this.opts.onSlide?.(this.slide, n);
    void this.drawProjection();
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
    if (view === 'phone') this.aimPhone();
    if (view !== 'work') this.badges.forEach(b => (b.target = 0));
    if (view !== 'learning' && this.reader) { this.reader.target = 0; this.reader.pending = -1; }
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
    else { if (this.view !== 'learning') this.setView('learning'); this.openBook(index); }
  }

  // ================= interaksi =================
  private pick(e: { clientX: number; clientY: number }) {
    const r = this.canvas.getBoundingClientRect();
    this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.pointer, this.camera);
    // Objek dalam kumpulan tersembunyi (cth. buku pembaca yang tertutup) tidak boleh dipilih.
    const shown = (o: THREE.Object3D | null): boolean => !o || (o.visible && shown(o.parent));
    // Semasa memegang telefon, hanya telefon boleh dipilih (objek di belakangnya diabaikan).
    const live = this.hits.filter(o => shown(o) && (!(o as THREE.Sprite).isSprite || this.iconsOut > 0.5) && (this.view !== 'phone' || o.userData.kind === 'phone'));
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
        label = t >= 0 ? `${this.L.show} ${this.opts.data.projects[t].name}` : '';
        if (t !== this.hoverTile) { this.hoverTile = t; void this.drawLauncher(); }
      }
    }
    if (d?.kind === 'badge' && this.badges[d.index ?? 0]?.target) label = this.L.flip;
    if (d?.kind === 'book' && this.reader && this.reader.target && d.index === this.reader.index) label = this.L.close;
    if (d?.kind === 'projection' && this.view !== 'screen') label = this.L.watch;
    if (this.view === 'phone') {
      const a = hit && hit.object === this.phone?.screen ? this.phoneAction(hit.uv) : -1;
      this.hoverPhone(a);
      label = a >= 0 ? this.opts.data.contact.actions[a].label : '';
    }
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
        this.openBook(index);
        break;
      case 'profile': this.setView('profile'); break;
      case 'projection':
        if (this.view !== 'screen') this.setView('screen'); else this.nextSlide();
        break;
      case 'phone':
        if (this.view !== 'phone') this.setView('phone');
        else if (hit.object === this.phone?.screen && this.phone.t > 0.9) { const a = this.phoneAction(hit.uv); if (a >= 0) this.opts.onAction?.(a); }
        break;
      case 'window': this.setDay(!this.day); break;
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
    if (this.view === 'phone') this.aimPhone();
    if (this.view !== 'overview' && !this.tween) this.camera.position.copy(this.fitPos(VIEWS[this.view]));
  };

  /**
   * Bawah ~40 fps secara purata: tahap 1 matikan AO (pas paling mahal); masih bawah ~30 fps: tahap 2 kurangkan resolusi render.
   * Tidak pernah naik semula (elak berkelip). Bingkai > 250 ms diabaikan: itu tab yang diperlahankan pelayar, bukan GPU.
   */
  private govern(raw: number) {
    const p = this.perf;
    if (p.level >= 2 || document.hidden) return;
    if (p.wait > 0) { p.wait -= Math.min(raw, 0.1); return; }
    if (raw > 0.25) return;
    p.n++; p.sum += raw;
    if (p.n < 90) return;
    const avg = p.sum / p.n; p.n = 0; p.sum = 0;
    // Tahap 1 bila bawah 40 fps; tahap 2 hanya bawah 30 fps (selepas AO dimatikan, atau terus pada telefon yang tiada AO).
    if (avg < (p.level === 0 && this.ao?.enabled ? 1 / 40 : 1 / 30)) return;
    p.wait = 1.5;
    if (p.level === 0 && this.ao?.enabled) { p.level = 1; this.ao.enabled = false; return; }
    p.level = 2;
    const r = Math.max(0.75, Math.min(devicePixelRatio, 2) * 0.6);
    this.renderer.setPixelRatio(r); this.composer.setPixelRatio(r); this.resize();
  }

  private loop = () => {
    if (this.dead) return;
    this.frame = requestAnimationFrame(this.loop);
    const raw = this.clock.getDelta(), dt = Math.min(raw, 0.05);
    const t = this.clock.elapsedTime;
    this.govern(raw);
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
    if (this.door) this.door.rotation.y = 1.9 * this.doorOpen;
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
    // Pembelajaran: buku ditarik keluar dari rak, terbang sambil berpusing ke hadapan kamera, kemudian terbuka.
    // Menutup ialah laluan yang sama secara terbalik, jadi buku kembali tepat ke slotnya.
    const r = this.reader;
    if (r) {
      r.t = this.reduced ? r.target : r.target > r.t ? Math.min(r.target, r.t + dt / 1.7) : Math.max(r.target, r.t - dt / 1.4);
      if (r.t === 0 && r.pending >= 0) { this.prepareBook(r.pending); r.target = 1; }
      const seg = (a: number, b: number) => ease(THREE.MathUtils.clamp((r.t - a) / (b - a), 0, 1));
      const pull = seg(0, 0.2), fly = seg(0.18, 0.62), open = seg(0.64, 1);
      r.group.position.lerpVectors(r.shelf, r.out, pull).lerp(r.spot, fly);
      r.group.position.y += Math.sin(Math.PI * fly) * 0.06;
      r.group.quaternion.slerpQuaternions(r.qShelf, r.qRead, fly);
      r.group.scale.setScalar(THREE.MathUtils.lerp(r.sShelf, 1, fly));
      r.pivot.rotation.y = -Math.PI * open;
      r.spine.visible = open < 0.02;
      r.group.visible = r.t > 0;
      this.books.forEach((b, i) => (b.mesh.visible = !(i === r.index && r.t > 0)));
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
    if (this.projMat) this.projMat.emissiveIntensity = 0.85 * this.projFade;
    // Pancaran kelihatan dari jauh; dimalapkan bila pelawat menonton supaya slaid kekal kontras.
    if (this.beam) this.beam.opacity = (this.view === 'screen' ? 0.35 : 1) * this.projFade * (1 - 0.7 * this.dayT);
    // Telefon: diangkat dari meja, berdiri menghadap kamera dan memaparkan kad hubungan.
    const p = this.phone;
    if (p) {
      const want = this.view === 'phone' ? 1 : 0;
      p.t = this.reduced ? want : want > p.t ? Math.min(1, p.t + dt / 1.1) : Math.max(0, p.t - dt / 0.9);
      const e = ease(p.t);
      p.group.position.lerpVectors(p.home, p.held, e);
      p.group.position.y += Math.sin(Math.PI * e) * 0.05;
      p.group.quaternion.slerpQuaternions(p.qHome, p.qHeld, e);
      const map = p.t > 0.35 ? p.card : p.idle;
      if (this.phoneMat.emissiveMap !== map) { this.phoneMat.emissiveMap = map; this.phoneMat.needsUpdate = true; }
      this.phoneMat.emissiveIntensity = 0.35 + 0.55 * e;
    }
    this.lightDay(dt);

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
