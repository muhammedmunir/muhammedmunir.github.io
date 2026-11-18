import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { base } from '$app/paths';
import { PROFILE, TECHNICAL_SKILLS } from '$lib/spine/spine-data';
import { JOURNEY_STEPS } from './journey-data';
import type { LocaleMode, ThemeMode } from './preferences.svelte';

export type DossierView = 'profile' | 'journey' | 'skills';

/**
 * DossierStation - Tiga Stesen Instrumen Kejuruteraan 3D Studio (Tactile Precision Hardware)
 *
 * Setiap stesen direka dengan bahasa perkakasan makmal sebenar yang seragam dengan Meja Projek:
 * 1. ZON PROFIL (Sayap Kiri): Stand Lencana ID Biometrik + Pad Kekunci Mekanikal, Nod Pelayan Pengeluaran YHCM (EMESYS · SUTERA · ADiMS), & Dok Modul Tauliah (YHCM · UTM · TNB).
 * 2. ZON PERJALANAN (Tengah Belakang): Rak Instrumentasi 7-Slot Modular Berpandu Rel (2017 - Kini) & Penganalisis Telemetri Meja.
 * 3. ZON KEMAHIRAN (Sayap Kanan): Bangku Perkakasan 5-Domain (Mobile Test Rig, API Compute Blade, NVMe Vault, ZTA Gateway, AI Vision Compute) & Penganalisis Stack.
 */
export class DossierStation {
  readonly group = new THREE.Group();
  readonly hits: THREE.Mesh[] = [];

  private geometries = new Set<THREE.BufferGeometry>();
  private materials = new Set<THREE.Material>();
  private textures = new Set<THREE.Texture>();

  // Bahan Studio Seragam dengan Meja Projek
  private deskSurfaceMat!: THREE.MeshStandardMaterial;
  private deskTrimMat!: THREE.MeshStandardMaterial;
  private esdMatMat!: THREE.MeshStandardMaterial;
  private floorPadMat!: THREE.MeshStandardMaterial;
  private chassisDarkMat!: THREE.MeshStandardMaterial;
  private brushedAlumMat!: THREE.MeshStandardMaterial;
  private metalMat!: THREE.MeshStandardMaterial;
  private ceramicMat!: THREE.MeshStandardMaterial;
  private slateMat!: THREE.MeshStandardMaterial;
  private darkBodyMat!: THREE.MeshStandardMaterial;
  private pinGoldMat!: THREE.MeshStandardMaterial;
  private screenBackMat!: THREE.MeshStandardMaterial;
  private cyanAccentMat!: THREE.MeshStandardMaterial;
  private floorConduitMat!: THREE.MeshStandardMaterial;

  // Tiga Meja Stesen Studio Berasingan
  private profileGroup = new THREE.Group();
  private journeyGroup = new THREE.Group();
  private skillsGroup = new THREE.Group();

  // Komponen Zon Profil
  private portraitCanvas = document.createElement('canvas');
  private portraitTexture: THREE.CanvasTexture;
  private portraitMat: THREE.MeshBasicMaterial;
  private portraitImg = new Image();
  private identityConsoleCanvas = document.createElement('canvas');
  private identityConsoleTex!: THREE.CanvasTexture;
  private profileStatusLedMat!: THREE.MeshStandardMaterial;
  private profileSystemLeds: THREE.MeshStandardMaterial[] = [];

  // Komponen Zon Perjalanan (7 Modul Hot-Swap + Penganalisis Telemetri)
  private journeyBlades: {
    group: THREE.Group;
    latch: THREE.Object3D;
    baseY: number;
    baseZ: number;
    ledMat: THREE.MeshStandardMaterial;
    plateCanvas: HTMLCanvasElement;
    plateTex: THREE.CanvasTexture;
    isEdu: boolean;
    isYhcmPeak: boolean;
    accentHex: string;
  }[] = [];
  private journeyTelemetryCanvas = document.createElement('canvas');
  private journeyTelemetryTex!: THREE.CanvasTexture;
  private conduitPulses: THREE.Mesh[] = [];

  // Komponen Zon Kemahiran (5 Perkakasan Domain + Penganalisis Stack)
  private skillUnits: {
    group: THREE.Group;
    baseZ: number;
    ledMat: THREE.MeshStandardMaterial;
    coreMat: THREE.MeshStandardMaterial;
    plateCanvas: HTMLCanvasElement;
    plateTex: THREE.CanvasTexture;
    accentHex: string;
  }[] = [];
  private skillBoardCanvas = document.createElement('canvas');
  private skillBoardTex!: THREE.CanvasTexture;

  private view: DossierView = 'profile';
  private locale: LocaleMode = 'ms';
  private theme: ThemeMode = 'dark';
  private step = 0;
  private category = 0;
  private clock = 0;
  private disposed = false;

  constructor() {
    this.group.position.set(0, 0, 0);
    this.group.visible = true;

    // Kanvas Lencana Kad ID Rasmi (560 x 740)
    this.portraitCanvas.width = 560;
    this.portraitCanvas.height = 740;
    this.portraitTexture = new THREE.CanvasTexture(this.portraitCanvas);
    this.portraitTexture.colorSpace = THREE.SRGBColorSpace;
    this.portraitTexture.anisotropy = 4;
    this.textures.add(this.portraitTexture);
    this.portraitMat = new THREE.MeshBasicMaterial({ map: this.portraitTexture, toneMapped: false });
    this.materials.add(this.portraitMat);

    this.initMaterials();
    this.buildProfileStation();
    this.buildJourneyStation();
    this.buildSkillsStation();

    this.group.add(this.profileGroup);
    this.group.add(this.journeyGroup);
    this.group.add(this.skillsGroup);

    this.portraitImg.onload = () => {
      if (!this.disposed) {
        this.renderPortraitBadge();
      }
    };
    this.portraitImg.src = base + PROFILE.profilePhoto;

    this.renderIdentityConsole();
    this.renderPortraitBadge();
    this.renderJourneyTelemetry();
    this.renderSkillBoard();
  }

  private initMaterials() {
    this.deskSurfaceMat = new THREE.MeshStandardMaterial({
      color: 0x131d31,
      metalness: 0,
      roughness: 0.72
    });

    this.deskTrimMat = new THREE.MeshStandardMaterial({
      color: 0x283854,
      metalness: 0.72,
      roughness: 0.34
    });

    this.esdMatMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0,
      roughness: 0.9
    });

    this.floorPadMat = new THREE.MeshStandardMaterial({
      color: 0x0b1220,
      metalness: 0,
      roughness: 0.94
    });

    this.chassisDarkMat = new THREE.MeshStandardMaterial({
      color: 0x161f30,
      metalness: 0.25,
      roughness: 0.48
    });

    this.brushedAlumMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.9,
      roughness: 0.36
    });

    this.metalMat = new THREE.MeshStandardMaterial({
      color: 0xa7b3c0,
      metalness: 0.85,
      roughness: 0.25
    });

    this.ceramicMat = new THREE.MeshStandardMaterial({
      color: 0xf0f2f4,
      metalness: 0.08,
      roughness: 0.38
    });

    this.slateMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.45,
      roughness: 0.42
    });

    this.darkBodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.55,
      roughness: 0.38
    });

    this.pinGoldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.22
    });

    this.screenBackMat = new THREE.MeshStandardMaterial({
      color: 0x060a12,
      metalness: 0.15,
      roughness: 0.75
    });

    this.cyanAccentMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.2,
      roughness: 0.22,
      emissive: new THREE.Color(0x0ea5e9),
      emissiveIntensity: 0.45
    });

    this.floorConduitMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.35,
      roughness: 0.25,
      emissive: new THREE.Color(0x0ea5e9),
      emissiveIntensity: 0.55
    });

    this.profileStatusLedMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.2,
      roughness: 0.2,
      emissive: new THREE.Color(0x10b981),
      emissiveIntensity: 0.7
    });

    [
      this.deskSurfaceMat,
      this.deskTrimMat,
      this.esdMatMat,
      this.floorPadMat,
      this.chassisDarkMat,
      this.brushedAlumMat,
      this.metalMat,
      this.ceramicMat,
      this.slateMat,
      this.darkBodyMat,
      this.pinGoldMat,
      this.screenBackMat,
      this.cyanAccentMat,
      this.floorConduitMat,
      this.profileStatusLedMat
    ].forEach(m => this.materials.add(m));
  }

  private box(parent: THREE.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material, r = 0.04, castShadow = true) {
    const geo = new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w * 0.45, h * 0.45, d * 0.45));
    this.geometries.add(geo);
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  private instancedBoxes(parent: THREE.Object3D, w: number, h: number, d: number, m: THREE.Material, positions: [number, number, number][], r = 0.04, castShadow = false) {
    const geo = new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w * 0.45, h * 0.45, d * 0.45));
    this.geometries.add(geo);
    const inst = new THREE.InstancedMesh(geo, m, positions.length);
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
    const geo = new THREE.CylinderGeometry(r, r, h, seg);
    this.geometries.add(geo);
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
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

  /**
   * Tapak dok konsol instrumen studio berchamfer yang terletak di atas permukaan pelantar utama.
   */
  private buildStudioDesk(parent: THREE.Group, width: number, depth: number, partTag?: string) {
    const desk = new THREE.Group();
    desk.position.set(0, 0.03, 0);
    parent.add(desk);

    const trim = this.box(desk, width, 0.12, depth, 0, 0.06, 0, this.deskTrimMat, 0.04);
    const top = this.box(desk, width - 0.16, 0.05, depth - 0.16, 0, 0.12, 0, this.deskSurfaceMat, 0.03);
    const esdMat = this.box(desk, width - 0.36, 0.015, depth - 0.36, 0, 0.15, 0, this.esdMatMat, 0.02);
    esdMat.castShadow = false;

    // Bar penunjuk aksen LED sian di hadapan pelapik
    this.box(desk, width - 0.4, 0.02, 0.03, 0, 0.155, depth / 2 - 0.08, this.cyanAccentMat, 0.008, false);

    if (partTag) {
      trim.userData.part = partTag;
      top.userData.part = partTag;
      esdMat.userData.part = partTag;
      this.hits.push(trim, top, esdMat);
    }

    return desk;
  }

  /**
   * Membina konsol instrumen meja hadapan (Benchtop Telemetry / Stack Analyzer) dengan bampar sisi & tombol putar CNC.
   */
  private buildBenchAnalyzer(
    parent: THREE.Group,
    width: number,
    canvas: HTMLCanvasElement,
    canvasW: number,
    canvasH: number,
    partTag: string
  ) {
    canvas.width = canvasW;
    canvas.height = canvasH;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    this.textures.add(tex);

    const analyzer = new THREE.Group();
    analyzer.position.set(0, 0.15, 0.88);
    analyzer.rotation.x = 0.42;
    parent.add(analyzer);

    // Casis instrumen berbingkai aluminium & bampar pelindung getah/titanium di kiri kanan
    this.box(analyzer, width, 0.14, 0.94, 0, 0, 0, this.chassisDarkMat, 0.04);
    this.box(analyzer, width - 0.14, 0.15, 0.84, 0, 0.01, 0, this.brushedAlumMat, 0.03);
    this.box(analyzer, width - 0.92, 0.16, 0.76, 0, 0.015, 0, this.screenBackMat, 0.02);

    // Bampar sisi pelindung instrumen (benchtop gear corners)
    this.box(analyzer, 0.18, 0.19, 1.0, -width / 2 + 0.06, 0.01, 0, this.slateMat, 0.04);
    this.box(analyzer, 0.18, 0.19, 1.0, width / 2 - 0.06, 0.01, 0, this.slateMat, 0.04);

    // Tombol pemutar enkoder CNC (Rotary Dials) di panel kiri & kanan skrin
    for (const side of [-1, 1]) {
      const kx = side * (width / 2 - 0.28);
      const knob = this.cylinder(analyzer, 0.085, 0.08, kx, 0.11, -0.14, this.metalMat, 20, false);
      knob.userData.part = partTag;
      this.cylinder(analyzer, 0.065, 0.09, kx, 0.12, -0.14, this.chassisDarkMat, 20, false);
      // Butang taktil kecil di bawah tombol
      this.box(analyzer, 0.12, 0.04, 0.08, kx, 0.09, 0.16, this.slateMat, 0.01, false);
      this.box(analyzer, 0.1, 0.035, 0.06, kx, 0.09, 0.28, this.cyanAccentMat, 0.008, false);
    }

    const screenMat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
    this.materials.add(screenMat);
    const screenW = width - 1.04;
    const screenPlane = this.plane(analyzer, screenW, 0.68, 0, 0.098, 0, screenMat, -Math.PI / 2);
    screenPlane.userData.part = partTag;
    this.hits.push(screenPlane);

    return tex;
  }

  private tagInteractive(root: THREE.Object3D, part: string) {
    root.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        obj.userData.part = part;
        this.hits.push(obj);
      }
    });
  }

  // =========================================================================
  // 1. ZON PROFIL: Lencana ID & Pad Kekunci, Nod Pelayan YHCM & Dok Tauliah
  // Kedudukan di sayap kiri-belakang pelantar: x = -4.5, z = -2.6
  // =========================================================================
  private buildProfileStation() {
    this.profileGroup.position.set(-4.5, 0.03, -2.6);
    this.profileGroup.rotation.y = 0.18;

    const desk = this.buildStudioDesk(this.profileGroup, 5.2, 2.8, 'profile');

    // --- A. KIRI: Stand Lencana ID Biometrik + Pad Kekunci Mekanikal Jurutera ---
    const badgeDock = new THREE.Group();
    badgeDock.position.set(-1.82, 0.03, -0.22);
    badgeDock.rotation.y = 0.18;
    desk.add(badgeDock);

    // Tapak Dok Aluminium Berchamfer (seragam dengan dok kad/kaset)
    this.box(badgeDock, 1.48, 0.12, 0.88, 0, 0.06, 0, this.ceramicMat, 0.04);
    this.box(badgeDock, 1.38, 0.14, 0.78, 0, 0.08, 0, this.chassisDarkMat, 0.035);
    this.box(badgeDock, 1.34, 0.3, 0.16, 0, 0.2, -0.22, this.brushedAlumMat, 0.03);
    this.box(badgeDock, 0.96, 0.03, 0.04, 0, 0.14, 0.32, this.cyanAccentMat, 0.01);

    // Lencana ID Fizikal Jurutera
    const badgeCard = new THREE.Group();
    badgeCard.position.set(0, 0.84, -0.02);
    badgeCard.rotation.x = -0.22;
    badgeDock.add(badgeCard);

    this.box(badgeCard, 1.14, 1.5, 0.065, 0, 0, 0, this.brushedAlumMat, 0.035);
    this.box(badgeCard, 1.08, 1.44, 0.075, 0, 0, 0.004, this.chassisDarkMat, 0.025);
    this.box(badgeCard, 0.64, 0.055, 0.08, 0, -0.71, 0, this.pinGoldMat, 0.01);
    this.plane(badgeCard, 1.0, 1.34, 0, 0.02, 0.044, this.portraitMat, 0);

    // Pad Kekunci Mekanikal & Tombol Enkoder di hadapan Lencana ID
    const keypad = new THREE.Group();
    keypad.position.set(-1.72, 0.04, 0.82);
    keypad.rotation.y = 0.12;
    desk.add(keypad);

    this.box(keypad, 1.44, 0.09, 0.86, 0, 0.045, 0, this.brushedAlumMat, 0.03);
    this.box(keypad, 1.32, 0.06, 0.74, 0, 0.08, 0, this.chassisDarkMat, 0.02, false);
    // Baris kekunci mekanikal taktil (4 x 3)
    const keyPositions: [number, number, number][] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        const pos: [number, number, number] = [-0.44 + c * 0.22, 0.115, -0.18 + r * 0.19];
        if (r === 2 && c === 3) {
          this.box(keypad, 0.19, 0.04, 0.16, pos[0], pos[1], pos[2], this.cyanAccentMat, 0.015, false);
        } else {
          keyPositions.push(pos);
        }
      }
    }
    this.instancedBoxes(keypad, 0.19, 0.04, 0.16, this.slateMat, keyPositions, 0.015, false);
    // Tombol pemutar aluminium di kanan pad kekunci
    this.cylinder(keypad, 0.13, 0.07, 0.46, 0.12, -0.02, this.metalMat, 20, false);
    this.cylinder(keypad, 0.1, 0.08, 0.46, 0.13, -0.02, this.chassisDarkMat, 20, false);
    // Penyesuai ESD Grounding di sudut hadapan-kiri luar pad kekunci
    this.cylinder(desk, 0.07, 0.04, -2.56, 0.04, 1.24, this.pinGoldMat, 16, false);

    // --- B. TENGAH: Nod Pelayan Pengeluaran YHCM (2U Server Instrument + Paparan OLED Ringkas) ---
    const nodeGroup = new THREE.Group();
    nodeGroup.position.set(0.18, 0.03, -0.22);
    desk.add(nodeGroup);

    // Tapak & bingkai 2U seragam dengan Homelab ZTA
    this.box(nodeGroup, 2.38, 0.14, 1.72, 0, 0.07, 0, this.brushedAlumMat, 0.04);
    this.box(nodeGroup, 2.26, 0.12, 1.58, 0, 0.13, 0, this.chassisDarkMat, 0.035);

    // Badan tegak bercondong instrumen YHCM (bukan papan teks raksasa)
    const nodeTower = new THREE.Group();
    nodeTower.position.set(0, 0.78, -0.18);
    nodeTower.rotation.x = -0.18;
    nodeGroup.add(nodeTower);

    this.box(nodeTower, 2.22, 1.32, 0.94, 0, 0, 0, this.brushedAlumMat, 0.05);
    this.box(nodeTower, 2.1, 1.2, 0.96, 0, 0, 0.01, this.chassisDarkMat, 0.04);

    // Pemegang rak keluli sisi kiri & kanan (Rack Handles)
    for (const sx of [-1.14, 1.14]) {
      this.cylinder(nodeTower, 0.032, 0.92, sx, 0, 0.52, this.metalMat, 18);
      this.box(nodeTower, 0.08, 0.06, 0.14, sx, 0.44, 0.46, this.metalMat, 0.01);
      this.box(nodeTower, 0.08, 0.06, 0.14, sx, -0.44, 0.46, this.metalMat, 0.01);
    }

    // Sirip penyejuk CNC di bahagian atas Nod
    this.instancedBoxes(
      nodeTower,
      0.08,
      0.06,
      0.76,
      this.slateMat,
      Array.from({ length: 10 }, (_, f): [number, number, number] => [-0.82 + f * 0.18, 0.67, -0.02]),
      0.01,
      false
    );

    // Paparan OLED Tauliah Jurutera (Bahagian Atas Hadapan Nod - Ringkas, Tajam & Berautoriti)
    this.box(nodeTower, 1.94, 0.72, 0.06, 0, 0.18, 0.48, this.screenBackMat, 0.02, false);
    this.box(nodeTower, 0.82, 0.025, 0.04, 0, 0.56, 0.49, this.profileStatusLedMat, 0.01, false);

    this.identityConsoleCanvas.width = 960;
    this.identityConsoleCanvas.height = 360;
    this.identityConsoleTex = new THREE.CanvasTexture(this.identityConsoleCanvas);
    this.identityConsoleTex.colorSpace = THREE.SRGBColorSpace;
    this.identityConsoleTex.anisotropy = 4;
    this.textures.add(this.identityConsoleTex);

    const consoleMat = new THREE.MeshBasicMaterial({ map: this.identityConsoleTex, toneMapped: false });
    this.materials.add(consoleMat);
    this.plane(nodeTower, 1.86, 0.66, 0, 0.18, 0.514, consoleMat, 0);

    // 3 Bay Pemacu Sistem Teras Disenggara YHCM di Bahagian Bawah Nod (EMESYS · SUTERA · ADiMS)
    const yhcmSystems = [
      { code: 'EMESYS', col: 0x10b981, hex: '#10b981' },
      { code: 'SUTERA', col: 0x0ea5e9, hex: '#38bdf8' },
      { code: 'ADiMS', col: 0x6366f1, hex: '#818cf8' }
    ];
    this.profileSystemLeds = [];

    yhcmSystems.forEach((sys, i) => {
      const bx = -0.64 + i * 0.64;
      const by = -0.36;
      this.box(nodeTower, 0.58, 0.28, 0.08, bx, by, 0.47, this.slateMat, 0.02, false);
      this.box(nodeTower, 0.52, 0.22, 0.09, bx, by, 0.48, this.screenBackMat, 0.015, false);
      // Tuil pelepas pemacu & pin emas kecil
      this.box(nodeTower, 0.42, 0.035, 0.03, bx, by - 0.075, 0.525, this.brushedAlumMat, 0.008, false);
      const sysLed = new THREE.MeshStandardMaterial({
        color: sys.col,
        metalness: 0.2,
        roughness: 0.2,
        emissive: new THREE.Color(sys.col),
        emissiveIntensity: 0.75
      });
      this.materials.add(sysLed);
      this.profileSystemLeds.push(sysLed);
      this.box(nodeTower, 0.08, 0.025, 0.03, bx + 0.19, by + 0.07, 0.525, sysLed, 0.005, false);

      const sCanvas = document.createElement('canvas');
      sCanvas.width = 240;
      sCanvas.height = 84;
      const sctx = sCanvas.getContext('2d')!;
      sctx.fillStyle = '#060a12';
      sctx.fillRect(0, 0, 240, 84);
      sctx.fillStyle = sys.hex;
      sctx.fillRect(0, 0, 10, 84);
      sctx.fillStyle = '#ffffff';
      sctx.font = '800 32px monospace';
      sctx.textAlign = 'left';
      sctx.textBaseline = 'middle';
      sctx.fillText(sys.code, 22, 34);
      sctx.fillStyle = '#94a3b8';
      sctx.font = '700 15px monospace';
      sctx.fillText('YHCM · MAINT', 22, 64);

      const sTex = new THREE.CanvasTexture(sCanvas);
      sTex.colorSpace = THREE.SRGBColorSpace;
      this.textures.add(sTex);
      const sMat = new THREE.MeshBasicMaterial({ map: sTex, toneMapped: false });
      this.materials.add(sMat);
      this.plane(nodeTower, 0.44, 0.14, bx - 0.02, by + 0.015, 0.527, sMat, 0);
    });

    // Lampu Tugas Studio Lengkung di atas Nod Profil (Task Lightbar) dengan ruang legar tinggi
    this.cylinder(nodeGroup, 0.03, 1.88, -0.95, 0.94, -0.64, this.darkBodyMat, 16);
    this.cylinder(nodeGroup, 0.03, 1.88, 0.95, 0.94, -0.64, this.darkBodyMat, 16);
    this.box(nodeGroup, 2.02, 0.06, 0.16, 0, 1.88, -0.44, this.brushedAlumMat, 0.02);
    this.box(nodeGroup, 1.82, 0.02, 0.06, 0, 1.845, -0.42, this.cyanAccentMat, 0.008);

    // --- C. KANAN: Dok 3 Modul Tauliah & Pensijilan (YHCM · UTM · TNB) Menghadap Kamera ---
    const chipDock = new THREE.Group();
    chipDock.position.set(1.94, 0.03, 0.15);
    chipDock.rotation.y = -0.1;
    desk.add(chipDock);

    this.box(chipDock, 1.12, 0.12, 2.26, 0, 0.06, 0, this.brushedAlumMat, 0.04);
    this.box(chipDock, 1.0, 0.13, 2.12, 0, 0.08, 0, this.chassisDarkMat, 0.035);

    const institutions = [
      { name: 'YHCM', role: 'FULL-STACK', sub: '3 PUBLIC SYS', accent: '#10b981', col: 0x0f766e },
      { name: 'UTM', role: 'B.SC NET-SEC', sub: '5x CISCO CERT', accent: '#38bdf8', col: 0x1d4ed8 },
      { name: 'TNB', role: 'SOC & APP', sub: 'ONBOARDX', accent: '#0ea5e9', col: 0x0369a1 }
    ];

    institutions.forEach((inst, idx) => {
      const cz = -0.68 + idx * 0.68;
      const chip = new THREE.Group();
      chip.position.set(0, 0.16, cz);
      chip.rotation.x = 0.08;
      chipDock.add(chip);

      this.box(chip, 0.84, 0.09, 0.56, 0, 0, 0, this.chassisDarkMat, 0.025);
      const chipAccentMat = new THREE.MeshStandardMaterial({
        color: inst.col,
        metalness: 0.45,
        roughness: 0.3
      });
      this.materials.add(chipAccentMat);
      this.box(chip, 0.78, 0.028, 0.07, 0, 0.042, -0.22, chipAccentMat, 0.008, false);
      this.box(chip, 0.52, 0.032, 0.045, 0, -0.015, 0.27, this.pinGoldMat, 0.008, false);

      const cCanvas = document.createElement('canvas');
      cCanvas.width = 360;
      cCanvas.height = 220;
      const ctx = cCanvas.getContext('2d')!;
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, 360, 220);
      ctx.strokeStyle = inst.accent;
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, 352, 212);

      ctx.fillStyle = inst.accent;
      ctx.font = '700 23px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(inst.role, 180, 48);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 58px sans-serif';
      ctx.fillText(inst.name, 180, 114);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '700 21px monospace';
      ctx.fillText(inst.sub, 180, 176);

      const cTex = new THREE.CanvasTexture(cCanvas);
      cTex.colorSpace = THREE.SRGBColorSpace;
      cTex.anisotropy = 4;
      this.textures.add(cTex);
      const cMat = new THREE.MeshBasicMaterial({ map: cTex, toneMapped: false });
      this.materials.add(cMat);

      this.plane(chip, 0.74, 0.46, 0, 0.049, 0.02, cMat, -Math.PI / 2);
    });

    this.tagInteractive(this.profileGroup, 'profile');
  }

  // =========================================================================
  // 2. ZON PERJALANAN & PEMBELAJARAN: Rak Instrumentasi 7-Slot Modular (2017 - Kini)
  // Kedudukan di tengah-belakang pelantar: x = 0.45, z = -2.75
  // =========================================================================
  private buildJourneyStation() {
    this.journeyGroup.position.set(0.45, 0.03, -2.75);

    const desk = this.buildStudioDesk(this.journeyGroup, 6.4, 2.6, 'journey:0');

    // Casis Rak Instrumentasi PXI / Eurorack 7-Slot Seragam (tiada tangga monolit!)
    const rackChassis = new THREE.Group();
    rackChassis.position.set(0, 0.03, -0.4);
    desk.add(rackChassis);

    // Tapak, Dinding Belakang & Rel Pengunci Atas Aluminium
    const chassisBase = this.box(rackChassis, 6.08, 0.16, 1.44, 0, 0.08, 0, this.brushedAlumMat, 0.045);
    this.box(rackChassis, 5.9, 0.14, 1.32, 0, 0.12, 0, this.chassisDarkMat, 0.035);
    this.box(rackChassis, 5.9, 1.06, 0.14, 0, 0.68, -0.62, this.chassisDarkMat, 0.03);
    // Dinding Sisi & Pemegang Rak Industri
    for (const sx of [-2.98, 2.98]) {
      this.box(rackChassis, 0.14, 1.08, 1.24, sx, 0.68, -0.06, this.brushedAlumMat, 0.03);
      this.cylinder(rackChassis, 0.03, 0.72, sx + Math.sign(sx) * 0.11, 0.68, 0.44, this.metalMat, 16);
    }
    // Palang Pengunci Atas dengan Penanda Slot 01-07
    this.box(rackChassis, 6.08, 0.1, 1.18, 0, 1.24, -0.1, this.brushedAlumMat, 0.03);
    this.box(rackChassis, 5.84, 0.06, 1.08, 0, 1.22, -0.08, this.slateMat, 0.02);

    chassisBase.userData.part = 'journey:0';
    this.hits.push(chassisBase);

    // Bas Gentian Optik Garis Masa di hadapan rel casis
    const conduit = this.cylinder(rackChassis, 0.024, 5.4, 0, 0.19, 0.56, this.floorConduitMat, 20);
    conduit.rotation.z = Math.PI / 2;
    conduit.userData.part = 'journey:0';
    this.hits.push(conduit);

    for (let p = 0; p < 2; p++) {
      const pulseGeo = new THREE.SphereGeometry(0.045, 14, 14);
      this.geometries.add(pulseGeo);
      const pulseMat = new THREE.MeshBasicMaterial({ color: p === 0 ? 0x38bdf8 : 0x10b981 });
      this.materials.add(pulseMat);
      const pulse = new THREE.Mesh(pulseGeo, pulseMat);
      pulse.position.set(0, 0.19, 0.56);
      rackChassis.add(pulse);
      this.conduitPulses.push(pulse);
    }

    // 7 Modul Kartrij Hot-Swap Ketinggian Seragam (0.94m) dengan Rel & Tuil Pelepas Mekanikal
    const moduleH = 0.94;
    const journeyBayFloors: [number, number, number][] = [];
    for (let i = 0; i < JOURNEY_STEPS.length; i++) {
      journeyBayFloors.push([-2.4 + i * 0.8, 0.18, 0.02]);
    }
    this.instancedBoxes(rackChassis, 0.72, 0.04, 0.98, this.screenBackMat, journeyBayFloors, 0.01, false);

    JOURNEY_STEPS.forEach((step, index) => {
      const bx = -2.4 + index * 0.8;
      const isEdu = step.track === 'education';
      const isYhcmPeak = step.id === 'work-yhcm';
      const accentHex = isYhcmPeak ? '#10b981' : isEdu ? '#38bdf8' : '#2dd4bf';
      const accentNum = isYhcmPeak ? 0x10b981 : isEdu ? 0x38bdf8 : 0x2dd4bf;

      // Rel panduan berganda pada lantai bay
      this.cylinder(rackChassis, 0.018, 0.88, bx - 0.22, 0.21, 0.04, this.metalMat, 10, false).rotation.x = Math.PI / 2;
      this.cylinder(rackChassis, 0.018, 0.88, bx + 0.22, 0.21, 0.04, this.metalMat, 10, false).rotation.x = Math.PI / 2;

      const bladeGroup = new THREE.Group();
      const baseY = 0.21;
      const baseZ = 0.02;
      bladeGroup.position.set(bx, baseY, baseZ);
      rackChassis.add(bladeGroup);

      // Badan modul instrumen PXI seragam (dark titanium + jalur bingkai aluminium)
      this.box(bladeGroup, 0.68, moduleH, 0.82, 0, moduleH / 2, 0, this.chassisDarkMat, 0.03);
      this.box(bladeGroup, 0.71, 0.08, 0.84, 0, moduleH - 0.04, 0, this.brushedAlumMat, 0.02, false);
      this.box(bladeGroup, 0.71, 0.08, 0.84, 0, 0.04, 0, this.brushedAlumMat, 0.02, false);

      // Skru berulir (Thumbscrew) atas & penunjuk track pada muka hadapan
      this.cylinder(bladeGroup, 0.03, 0.05, 0, moduleH - 0.04, 0.43, this.metalMat, 12, false).rotation.x = Math.PI / 2;

      // Tuil Pelepas Mekanikal (Ejector Latch) di bahagian bawah hadapan modul
      const latch = new THREE.Group();
      latch.position.set(0, 0.07, 0.42);
      bladeGroup.add(latch);
      this.box(latch, 0.42, 0.055, 0.08, 0, 0, 0.03, this.brushedAlumMat, 0.012, false);
      this.box(latch, 0.14, 0.03, 0.09, 0, 0.01, 0.045, this.slateMat, 0.008, false);

      // Jalur LED Status
      const ledMat = new THREE.MeshStandardMaterial({
        color: accentNum,
        metalness: 0.2,
        roughness: 0.2,
        emissive: new THREE.Color(accentNum),
        emissiveIntensity: 0.4
      });
      this.materials.add(ledMat);
      this.box(bladeGroup, 0.56, 0.035, 0.04, 0, moduleH - 0.11, 0.415, ledMat, 0.01, false);

      // Paparan Muka OLED Modul
      const plateCanvas = document.createElement('canvas');
      plateCanvas.width = 300;
      plateCanvas.height = 380;
      const plateTex = new THREE.CanvasTexture(plateCanvas);
      plateTex.colorSpace = THREE.SRGBColorSpace;
      plateTex.anisotropy = 4;
      this.textures.add(plateTex);

      const plateMat = new THREE.MeshBasicMaterial({ map: plateTex, toneMapped: false });
      this.materials.add(plateMat);
      const plateMesh = this.plane(bladeGroup, 0.58, 0.68, 0, moduleH * 0.5 - 0.02, 0.415, plateMat, 0);

      const partTag = `journey:${index}`;
      bladeGroup.traverse(o => {
        if (o instanceof THREE.Mesh) {
          o.userData.part = partTag;
          this.hits.push(o);
        }
      });
      plateMesh.userData.part = partTag;

      this.journeyBlades.push({
        group: bladeGroup,
        latch,
        baseY,
        baseZ,
        ledMat,
        plateCanvas,
        plateTex,
        isEdu,
        isYhcmPeak,
        accentHex
      });
    });

    // Penganalisis Telemetri Meja di hadapan rak (Benchtop Telemetry Analyzer)
    this.journeyTelemetryTex = this.buildBenchAnalyzer(
      desk,
      5.8,
      this.journeyTelemetryCanvas,
      1280,
      200,
      'journey:0'
    );

    this.renderJourneyPlates();
  }

  // =========================================================================
  // 3. ZON KEMAHIRAN: Bangku Perkakasan 5-Domain & Penganalisis Stack
  // Kedudukan di sayap kanan-belakang pelantar: x = 5.2, z = -2.6
  // =========================================================================
  private buildSkillsStation() {
    this.skillsGroup.position.set(5.2, 0.03, -2.6);
    this.skillsGroup.rotation.y = -0.18;

    const desk = this.buildStudioDesk(this.skillsGroup, 5.4, 2.8, 'skills:0');

    // Rel Dok Kuasa & Bas Pengujian Bersama (Unified Power & Bus Rail)
    const bayChassis = new THREE.Group();
    bayChassis.position.set(0, 0.03, -0.38);
    desk.add(bayChassis);

    this.box(bayChassis, 6.08, 0.16, 1.56, 0, 0.08, 0, this.brushedAlumMat, 0.045);
    this.box(bayChassis, 5.9, 0.14, 1.44, 0, 0.12, 0, this.chassisDarkMat, 0.035);
    // Palang kuasa belakang menghubungkan semua 5 perkakasan
    this.box(bayChassis, 5.76, 0.22, 0.18, 0, 0.26, -0.64, this.slateMat, 0.03);

    const accents = [0x38bdf8, 0x2563eb, 0x10b981, 0x0ea5e9, 0x6366f1];
    const accentHexes = ['#38bdf8', '#60a5fa', '#10b981', '#0ea5e9', '#818cf8'];

    TECHNICAL_SKILLS.forEach((_cat, index) => {
      const ux = -2.24 + index * 1.12;
      const baseZ = 0.04;
      const accentNum = accents[index];
      const accentHex = accentHexes[index];

      // Landasan rel slaid di atas dok
      this.box(bayChassis, 0.98, 0.04, 1.18, ux, 0.18, baseZ, this.screenBackMat, 0.015, false);

      const unitGroup = new THREE.Group();
      unitGroup.position.set(ux, 0.2, baseZ);
      bayChassis.add(unitGroup);

      const ledMat = new THREE.MeshStandardMaterial({
        color: accentNum,
        metalness: 0.2,
        roughness: 0.2,
        emissive: new THREE.Color(accentNum),
        emissiveIntensity: 0.45
      });
      const coreMat = new THREE.MeshStandardMaterial({
        color: accentNum,
        metalness: 0.45,
        roughness: 0.22,
        emissive: new THREE.Color(accentNum),
        emissiveIntensity: 0.3
      });
      this.materials.add(ledMat);
      this.materials.add(coreMat);

      // Badan asas perkakasan domain yang seragam dengan tapak aluminium
      this.box(unitGroup, 0.94, 0.12, 1.04, 0, 0.06, 0, this.brushedAlumMat, 0.025);
      this.box(unitGroup, 0.9, 0.54, 0.98, 0, 0.39, 0, this.chassisDarkMat, 0.035);
      this.box(unitGroup, 0.82, 0.03, 0.04, 0, 0.65, 0.48, ledMat, 0.01, false);

      // Reka bentuk perkakasan spesifik & tulen bagi setiap 5 domain (sifar arca rawak)
      if (index === 0) {
        // 01 Frontend & Mobile: Rig Pengujian Paparan & Telefon Pintar (Mobile + Web Viewport Cradle)
        this.box(unitGroup, 0.82, 0.08, 0.72, 0, 0.7, -0.06, this.slateMat, 0.02);
        // Panel Tablet/Desktop ujian condong di belakang
        const tablet = this.box(unitGroup, 0.54, 0.36, 0.04, 0.14, 0.88, -0.18, this.brushedAlumMat, 0.02);
        tablet.rotation.x = -0.24;
        const tabletScr = this.box(unitGroup, 0.48, 0.28, 0.045, 0.14, 0.88, -0.175, coreMat, 0.01, false);
        tabletScr.rotation.x = -0.24;
        // Telefon ujian (Flutter) di dok hadapan kiri
        const phone = this.box(unitGroup, 0.22, 0.36, 0.04, -0.26, 0.84, 0.04, this.chassisDarkMat, 0.02);
        phone.rotation.x = -0.28;
        const phoneScr = this.box(unitGroup, 0.18, 0.3, 0.045, -0.26, 0.84, 0.044, coreMat, 0.01, false);
        phoneScr.rotation.x = -0.28;
      } else if (index === 1) {
        // 02 Backend & APIs: Nod Pengkomputeran API dengan Sirip Heatsink & Port Dwi-Bus
        this.box(unitGroup, 0.84, 0.34, 0.86, 0, 0.83, -0.04, this.brushedAlumMat, 0.025);
        this.box(unitGroup, 0.76, 0.28, 0.88, 0, 0.83, -0.04, this.chassisDarkMat, 0.02);
        // Sirip penyejuk atas
        this.instancedBoxes(
          unitGroup,
          0.06,
          0.08,
          0.76,
          this.metalMat,
          Array.from({ length: 7 }, (_, f): [number, number, number] => [-0.3 + f * 0.1, 1.02, -0.04]),
          0.008,
          false
        );
        // Bar graf beban CPU / trafik API + dwi-port hadapan
        this.instancedBoxes(
          unitGroup,
          0.12,
          0.04,
          0.04,
          ledMat,
          Array.from({ length: 4 }, (_, l): [number, number, number] => [-0.24 + l * 0.16, 0.88, 0.4]),
          0.008,
          false
        );
        this.instancedBoxes(
          unitGroup,
          0.11,
          0.09,
          0.04,
          this.screenBackMat,
          Array.from({ length: 4 }, (_, l): [number, number, number] => [-0.24 + l * 0.16, 0.77, 0.4]),
          0.006,
          false
        );
      } else if (index === 2) {
        // 03 Databases & Cloud: Peti Storan RAID 4-Bay NVMe Hot-Swap
        this.box(unitGroup, 0.84, 0.38, 0.88, 0, 0.85, -0.03, this.slateMat, 0.025);
        const bayBodyPos: [number, number, number][] = [];
        const bayHandlePos: [number, number, number][] = [];
        const bayLedPos: [number, number, number][] = [];
        for (let b = 0; b < 4; b++) {
          const by = 0.71 + b * 0.09;
          bayBodyPos.push([0, by, 0.02]);
          bayHandlePos.push([-0.08, by, 0.44]);
          bayLedPos.push([0.26, by, 0.44]);
        }
        this.instancedBoxes(unitGroup, 0.74, 0.065, 0.82, this.chassisDarkMat, bayBodyPos, 0.012, false);
        this.instancedBoxes(unitGroup, 0.48, 0.035, 0.04, this.brushedAlumMat, bayHandlePos, 0.008, false);
        this.instancedBoxes(unitGroup, 0.1, 0.025, 0.04, ledMat, bayLedPos, 0.006, false);
      } else if (index === 3) {
        // 04 DevOps & Security: Perkakas Tembok Api ZTA (Homelab Match)
        this.box(unitGroup, 0.88, 0.32, 0.86, 0, 0.82, -0.02, this.brushedAlumMat, 0.02);
        this.box(unitGroup, 0.78, 0.28, 0.88, 0, 0.82, -0.02, this.chassisDarkMat, 0.02);
        // 4 Port RJ45 & 1 Sangkar Gentian SFP+ + Penunjuk Kunci Keselamatan
        const rjPortPos: [number, number, number][] = [];
        const rjLedPos: [number, number, number][] = [];
        for (let p = 0; p < 4; p++) {
          rjPortPos.push([-0.26 + p * 0.14, 0.8, 0.42]);
          rjLedPos.push([-0.26 + p * 0.14, 0.89, 0.42]);
        }
        this.instancedBoxes(unitGroup, 0.12, 0.11, 0.04, this.screenBackMat, rjPortPos, 0.008, false);
        this.instancedBoxes(unitGroup, 0.05, 0.025, 0.04, ledMat, rjLedPos, 0.005, false);
        this.cylinder(unitGroup, 0.055, 0.06, 0.28, 0.82, 0.42, this.pinGoldMat, 14, false).rotation.x = Math.PI / 2;
      } else {
        // 05 AI & Modern Tools: Unit Pengkomputeran Terbenam & Sensor Penglihatan Stereo (OpenCV)
        this.box(unitGroup, 0.82, 0.24, 0.84, 0, 0.78, -0.03, this.chassisDarkMat, 0.03);
        this.instancedBoxes(
          unitGroup,
          0.74,
          0.04,
          0.06,
          this.slateMat,
          Array.from({ length: 6 }, (_, r): [number, number, number] => [0, 0.92, -0.34 + r * 0.11]),
          0.008,
          false
        );
        // Bar sensor penglihatan dwi-optik stereo di hadapan atas unit
        this.box(unitGroup, 0.78, 0.18, 0.16, 0, 0.84, 0.36, this.brushedAlumMat, 0.03);
        for (const ox of [-0.2, 0.2]) {
          this.cylinder(unitGroup, 0.068, 0.06, ox, 0.84, 0.44, this.chassisDarkMat, 18, false).rotation.x = Math.PI / 2;
          this.cylinder(unitGroup, 0.044, 0.07, ox, 0.84, 0.45, coreMat, 18, false).rotation.x = Math.PI / 2;
        }
      }

      // Skrin OLED Muka Hadapan Unit Perkakasan (saiz seragam kemas)
      const plateCanvas = document.createElement('canvas');
      plateCanvas.width = 340;
      plateCanvas.height = 200;
      const plateTex = new THREE.CanvasTexture(plateCanvas);
      plateTex.colorSpace = THREE.SRGBColorSpace;
      plateTex.anisotropy = 4;
      this.textures.add(plateTex);

      const plateMat = new THREE.MeshBasicMaterial({ map: plateTex, toneMapped: false });
      this.materials.add(plateMat);

      this.box(unitGroup, 0.82, 0.44, 0.05, 0, 0.36, 0.49, this.screenBackMat, 0.02, false);
      this.plane(unitGroup, 0.76, 0.38, 0, 0.36, 0.518, plateMat, 0);

      const partTag = `skills:${index}`;
      unitGroup.traverse(o => {
        if (o instanceof THREE.Mesh) {
          o.userData.part = partTag;
          this.hits.push(o);
        }
      });

      this.skillUnits.push({
        group: unitGroup,
        baseZ,
        ledMat,
        coreMat,
        plateCanvas,
        plateTex,
        accentHex
      });
    });

    // Penganalisis Stack Kemahiran di hadapan meja (Benchtop Stack Analyzer)
    this.skillBoardTex = this.buildBenchAnalyzer(
      desk,
      5.8,
      this.skillBoardCanvas,
      1280,
      200,
      'skills:0'
    );

    this.renderSkillPlates();
  }

  // --- Render Muka OLED 7 Modul Kronologi Perjalanan ---
  private renderJourneyPlates() {
    const en = this.locale === 'en';
    this.journeyBlades.forEach((blade, index) => {
      const step = JOURNEY_STEPS[index];
      const active = this.view === 'journey' && this.step === index;
      const c = blade.plateCanvas.getContext('2d')!;
      const w = blade.plateCanvas.width;
      const h = blade.plateCanvas.height;

      c.fillStyle = active ? '#0b172c' : '#060a12';
      c.fillRect(0, 0, w, h);

      c.strokeStyle = active ? '#ffffff' : blade.accentHex;
      c.lineWidth = active ? 10 : 6;
      c.strokeRect(6, 6, w - 12, h - 12);

      c.fillStyle = blade.accentHex;
      c.font = '700 22px monospace';
      c.textAlign = 'center';
      const trackLabel = blade.isEdu ? (en ? 'STUDY' : 'AKADEMIK') : (en ? 'CAREER' : 'KERJAYA');
      c.fillText(`0${index + 1} · ${trackLabel}`, w / 2, 50);

      c.fillStyle = '#ffffff';
      c.font = '800 44px sans-serif';
      const yearLabel = en ? step.yearShort.replace('Kini', 'Present') : step.yearShort;
      c.fillText(yearLabel, w / 2, 118, w - 28);

      c.fillStyle = '#cbd5e1';
      c.font = '700 22px sans-serif';
      const orgShort = step.org.includes('YHCM')
        ? 'YHCM Sdn Bhd'
        : step.org.includes('UTM')
          ? 'UTM'
          : step.org.includes('TNB')
            ? 'TNB'
            : 'Nova Bitara';
      c.fillText(orgShort, w / 2, 184, w - 28);

      c.fillStyle = '#94a3b8';
      c.font = '600 18px monospace';
      c.fillText(step.location.split(',')[0], w / 2, 228, w - 28);

      c.fillStyle = active ? '#10b981' : blade.accentHex;
      this.roundRect(c, 26, h - 82, w - 52, 48, 8);
      c.fill();
      c.fillStyle = '#060a12';
      c.font = '800 18px monospace';
      c.fillText(
        active ? (en ? 'SELECTED' : 'DIPILIH') : blade.isYhcmPeak ? (en ? 'CURRENT' : 'SEMASA') : (en ? 'INSPECT' : 'LIHAT'),
        w / 2,
        h - 52
      );

      blade.plateTex.needsUpdate = true;
    });
  }

  // --- Render Penganalisis Telemetri Perjalanan Aktif ---
  private renderJourneyTelemetry() {
    if (!this.journeyTelemetryCanvas) return;
    const step = JOURNEY_STEPS[this.step] ?? JOURNEY_STEPS[0];
    const en = this.locale === 'en';
    const c = this.journeyTelemetryCanvas.getContext('2d')!;
    const w = this.journeyTelemetryCanvas.width;
    const h = this.journeyTelemetryCanvas.height;

    c.fillStyle = '#060a12';
    c.fillRect(0, 0, w, h);
    c.strokeStyle = step.accent;
    c.lineWidth = 4;
    c.strokeRect(4, 4, w - 8, h - 8);

    c.fillStyle = step.accent;
    c.font = '700 22px monospace';
    c.textAlign = 'left';
    c.fillText(`0${step.stepNumber} / 0${JOURNEY_STEPS.length} · ${step.period[this.locale]} · ${step.location}`, 28, 42);

    c.fillStyle = '#94a3b8';
    c.font = '700 17px monospace';
    c.textAlign = 'right';
    c.fillText(en ? 'CLICK ANY MODULE TO EJECT' : 'KLIK MANA-MANA MODUL', w - 28, 42);

    c.textAlign = 'left';
    c.fillStyle = '#ffffff';
    c.font = '800 34px sans-serif';
    c.fillText(`${step.title[this.locale]} · ${step.org}`, 28, 92, w - 56);

    c.fillStyle = '#cbd5e1';
    c.font = '600 22px sans-serif';
    c.fillText(step.meta[this.locale], 28, 134, w - 56);

    // Cip tag kemahiran langkah aktif di bahagian bawah skrin
    let tx = 28;
    step.tags.slice(0, 4).forEach(tag => {
      c.font = '700 16px monospace';
      const tw = c.measureText(tag).width + 24;
      if (tx + tw > w - 28) return;
      c.fillStyle = '#0f172a';
      this.roundRect(c, tx, 152, tw, 30, 6);
      c.fill();
      c.strokeStyle = step.accent;
      c.lineWidth = 1.5;
      c.stroke();
      c.fillStyle = '#e2e8f0';
      c.fillText(tag, tx + 12, 173);
      tx += tw + 10;
    });

    if (this.journeyTelemetryTex) this.journeyTelemetryTex.needsUpdate = true;
  }

  // --- Render Muka OLED 5 Unit Kemahiran Teknikal ---
  private renderSkillPlates() {
    const en = this.locale === 'en';
    this.skillUnits.forEach((unit, index) => {
      const cat = TECHNICAL_SKILLS[index];
      const active = this.view === 'skills' && this.category === index;
      const c = unit.plateCanvas.getContext('2d')!;
      const w = unit.plateCanvas.width;
      const h = unit.plateCanvas.height;

      c.fillStyle = active ? '#0b172c' : '#060a12';
      c.fillRect(0, 0, w, h);
      c.strokeStyle = active ? '#ffffff' : unit.accentHex;
      c.lineWidth = active ? 8 : 5;
      c.strokeRect(5, 5, w - 10, h - 10);

      c.fillStyle = unit.accentHex;
      c.font = '700 20px monospace';
      c.textAlign = 'center';
      c.fillText(`BAY // 0${index + 1}`, w / 2, 36);

      c.fillStyle = '#ffffff';
      c.font = '800 27px sans-serif';
      c.fillText(cat.category[this.locale], w / 2, 84, w - 24);

      c.fillStyle = '#94a3b8';
      c.font = '600 17px monospace';
      c.fillText(`${cat.skills.length} ${en ? 'TECHNOLOGIES' : 'TEKNOLOGI'}`, w / 2, 122);

      c.fillStyle = active ? unit.accentHex : '#1e293b';
      this.roundRect(c, 28, h - 50, w - 56, 32, 6);
      c.fill();
      c.fillStyle = active ? '#060a12' : '#cbd5e1';
      c.font = '800 16px monospace';
      c.fillText(active ? (en ? 'ACTIVE UNIT' : 'UNIT AKTIF') : (en ? 'SELECT' : 'PILIH'), w / 2, h - 28);

      unit.plateTex.needsUpdate = true;
    });
  }

  // --- Render Penganalisis Stack Kemahiran dengan Cip Teknologi Berstruktur ---
  private renderSkillBoard() {
    if (!this.skillBoardCanvas) return;
    const cat = TECHNICAL_SKILLS[this.category] ?? TECHNICAL_SKILLS[0];
    const en = this.locale === 'en';
    const c = this.skillBoardCanvas.getContext('2d')!;
    const w = this.skillBoardCanvas.width;
    const h = this.skillBoardCanvas.height;
    const accents = ['#38bdf8', '#60a5fa', '#10b981', '#0ea5e9', '#818cf8'];
    const accent = accents[this.category] ?? '#38bdf8';

    c.fillStyle = '#060a12';
    c.fillRect(0, 0, w, h);
    c.strokeStyle = accent;
    c.lineWidth = 4;
    c.strokeRect(4, 4, w - 8, h - 8);

    c.fillStyle = accent;
    c.font = '700 22px monospace';
    c.textAlign = 'left';
    c.fillText(
      `DOMAIN 0${this.category + 1} / 0${TECHNICAL_SKILLS.length} · ${cat.category[this.locale].toUpperCase()}`,
      28,
      40
    );

    c.fillStyle = '#94a3b8';
    c.font = '700 17px monospace';
    c.textAlign = 'right';
    c.fillText(en ? 'CLICK ANY HARDWARE BAY' : 'KLIK MANA-MANA UNIT', w - 28, 40);

    // Lukis teknologi sebagai cip perkakasan berbingkai tajam merentas dua baris
    let px = 28;
    let py = 68;
    const pillH = 44;
    const rowGap = 14;
    c.textAlign = 'left';

    for (const tech of cat.skills) {
      c.font = '700 21px sans-serif';
      const tw = c.measureText(tech).width + 30;
      if (px + tw > w - 28) {
        px = 28;
        py += pillH + rowGap;
      }
      if (py + pillH > h - 14) break;

      c.fillStyle = '#0f172a';
      this.roundRect(c, px, py, tw, pillH, 8);
      c.fill();
      c.strokeStyle = accent;
      c.lineWidth = 2;
      c.stroke();

      c.fillStyle = '#f8fafc';
      c.fillText(tech, px + 15, py + 29);
      px += tw + 12;
    }

    if (this.skillBoardTex) this.skillBoardTex.needsUpdate = true;
  }

  // --- Render Paparan OLED Ringkas & Berautoriti pada Nod YHCM ---
  private renderIdentityConsole() {
    const c = this.identityConsoleCanvas.getContext('2d')!;
    const w = this.identityConsoleCanvas.width;
    const h = this.identityConsoleCanvas.height;
    const en = this.locale === 'en';

    c.fillStyle = '#060a12';
    c.fillRect(0, 0, w, h);

    c.strokeStyle = '#38bdf8';
    c.lineWidth = 4;
    c.strokeRect(6, 6, w - 12, h - 12);

    // Header Nod
    c.fillStyle = '#0f172a';
    c.fillRect(8, 8, w - 16, 46);
    c.fillStyle = '#38bdf8';
    c.font = '700 19px monospace';
    c.textAlign = 'left';
    c.fillText('YHCM NODE // ENGINEER CREDENTIALS', 28, 38);

    c.fillStyle = '#10b981';
    c.textAlign = 'right';
    c.fillText('ONLINE · AUDIT READY', w - 28, 38);

    // Nama & Peranan Rasmi
    c.textAlign = 'left';
    c.fillStyle = '#ffffff';
    c.font = '800 50px sans-serif';
    c.fillText('MUHAMMED MUNIR', 28, 118);

    c.fillStyle = '#38bdf8';
    c.font = '700 28px sans-serif';
    c.fillText('Full-Stack Developer @ YHCM Sdn Bhd', 28, 166);

    c.fillStyle = '#10b981';
    c.font = '700 20px monospace';
    c.fillText(
      en
        ? 'SYSTEM MAINTENANCE · NEW MODULES · BUG FIXING'
        : 'PENYELENGGARAAN SISTEM · MODUL BAHARU · BUG FIXING',
      28,
      206,
      w - 56
    );

    // 3 Kad Ringkas Bawah OLED (tiada dinding teks kecil!)
    const cards = [
      { k: 'YHCM SDN BHD', v: en ? '3 Public Systems' : '3 Sistem Awam', accent: '#10b981' },
      { k: 'UTM JOHOR BAHRU', v: 'B.Sc. Network Sec', accent: '#38bdf8' },
      { k: 'TNB MALAYSIA', v: 'SOC & ONBOARDX', accent: '#0ea5e9' }
    ];
    const cw = (w - 56 - 28) / 3;
    cards.forEach((card, idx) => {
      const bx = 28 + idx * (cw + 14);
      const by = 238;
      c.fillStyle = '#0f172a';
      this.roundRect(c, bx, by, cw, 92, 10);
      c.fill();
      c.strokeStyle = card.accent;
      c.lineWidth = 2;
      c.stroke();

      c.fillStyle = card.accent;
      c.font = '700 17px monospace';
      c.fillText(card.k, bx + 16, by + 34);

      c.fillStyle = '#f8fafc';
      c.font = '700 22px sans-serif';
      c.fillText(card.v, bx + 16, by + 70, cw - 32);
    });

    if (this.identityConsoleTex) this.identityConsoleTex.needsUpdate = true;
  }

  // --- Render Kad Lencana ID Jurutera (Potret Rasmi) ---
  private renderPortraitBadge() {
    const c = this.portraitCanvas.getContext('2d')!;
    const w = this.portraitCanvas.width;
    const h = this.portraitCanvas.height;

    c.fillStyle = '#060a12';
    c.fillRect(0, 0, w, h);

    c.fillStyle = '#1e3a8a';
    c.fillRect(0, 0, w, 58);
    c.fillStyle = '#38bdf8';
    c.fillRect(0, 0, w, 10);
    c.fillStyle = '#ffffff';
    c.font = '700 20px monospace';
    c.textAlign = 'left';
    c.fillText('FULL-STACK DEVELOPER', 26, 40);

    c.fillStyle = '#050811';
    c.fillRect(w - 110, 22, 82, 18);

    const imgTop = 74;
    const imgH = h - 196;
    if (this.portraitImg.complete && this.portraitImg.naturalWidth) {
      const img = this.portraitImg;
      const ratio = Math.max((w - 44) / img.naturalWidth, imgH / img.naturalHeight);
      const iw = img.naturalWidth * ratio;
      const ih = img.naturalHeight * ratio;
      const ix = (w - iw) / 2;
      const iy = imgTop + (imgH - ih) / 2;

      c.save();
      c.beginPath();
      c.rect(22, imgTop, w - 44, imgH);
      c.clip();
      c.drawImage(img, ix, iy, iw, ih);
      c.restore();

      c.strokeStyle = '#38bdf8';
      c.lineWidth = 4;
      c.strokeRect(22, imgTop, w - 44, imgH);
    } else {
      c.fillStyle = '#0f172a';
      c.fillRect(22, imgTop, w - 44, imgH);
      c.fillStyle = '#38bdf8';
      c.font = '800 96px sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('MM', w / 2, imgTop + imgH / 2);
      c.textBaseline = 'alphabetic';
    }

    c.fillStyle = '#0f172a';
    c.fillRect(22, h - 108, w - 44, 88);
    c.fillStyle = '#ffffff';
    c.font = '800 29px sans-serif';
    c.textAlign = 'center';
    c.fillText('MUHAMMED MUNIR', w / 2, h - 64);
    c.fillStyle = '#38bdf8';
    c.font = '700 18px monospace';
    c.fillText('FULL-STACK DEVELOPER · YHCM', w / 2, h - 34);

    this.portraitTexture.needsUpdate = true;
  }

  setView(view: DossierView) {
    this.view = view;
    this.profileGroup.visible = view === 'profile';
    this.journeyGroup.visible = view === 'journey';
    this.skillsGroup.visible = view === 'skills';
    this.renderJourneyPlates();
    this.renderSkillPlates();
  }

  setLocale(locale: LocaleMode) {
    this.locale = locale;
    this.renderIdentityConsole();
    this.renderJourneyPlates();
    this.renderJourneyTelemetry();
    this.renderSkillPlates();
    this.renderSkillBoard();
  }

  setTheme(theme: ThemeMode) {
    this.theme = theme;
    const dark = theme === 'dark';
    this.deskSurfaceMat.color.set(dark ? 0x131d31 : 0xdde4ee);
    this.deskTrimMat.color.set(dark ? 0x283854 : 0x94a3b8);
    this.esdMatMat.color.set(dark ? 0x0f172a : 0x334155);
    this.floorPadMat.color.set(dark ? 0x0b1220 : 0xcbd5e1);
    this.chassisDarkMat.color.set(dark ? 0x161f30 : 0x1e293b);
  }

  setStep(index: number) {
    this.step = Math.max(0, Math.min(JOURNEY_STEPS.length - 1, index));
    this.renderJourneyPlates();
    this.renderJourneyTelemetry();
  }

  setCategory(index: number) {
    this.category = Math.max(0, Math.min(TECHNICAL_SKILLS.length - 1, index));
    this.renderSkillPlates();
    this.renderSkillBoard();
  }

  animate(dt: number, still: boolean) {
    if (!this.group.visible) return;
    if (!still) this.clock += dt;

    // 1. LED status & kelipan halus pada Nod YHCM Profil
    if (this.profileStatusLedMat) {
      const pulse = Math.sin(this.clock * 2.2) * 0.2 + 0.7;
      this.profileStatusLedMat.emissiveIntensity = still ? 0.65 : pulse;
    }
    this.profileSystemLeds.forEach((led, idx) => {
      led.emissiveIntensity = still ? 0.75 : 0.65 + Math.sin(this.clock * 3.1 + idx * 1.4) * 0.22;
    });

    // 2. Animasi Mekanikal Modul Perjalanan (tuil pelepas membuka + modul meluncur keluar di atas rel)
    const stepBlend = still ? 1 : 1 - Math.exp(-9 * dt);
    this.journeyBlades.forEach((blade, idx) => {
      const isActive = this.view === 'journey' && idx === this.step;
      const targetZ = blade.baseZ + (isActive ? 0.34 : 0);
      const targetLatchRot = isActive ? 0.34 : 0;

      blade.group.position.z = THREE.MathUtils.lerp(blade.group.position.z, targetZ, stepBlend);
      blade.group.position.y = blade.baseY;
      blade.latch.rotation.x = THREE.MathUtils.lerp(blade.latch.rotation.x, targetLatchRot, stepBlend);
      blade.ledMat.emissiveIntensity = isActive
        ? (still ? 1.15 : 1.0 + Math.sin(this.clock * 4) * 0.25)
        : 0.32;
    });

    // Nadi aliran data gentian optik di sepanjang rel casis Perjalanan
    if (!still && this.conduitPulses.length >= 2) {
      this.conduitPulses[0].position.x = -2.6 + ((this.clock * 1.6) % 5.2);
      this.conduitPulses[1].position.x = 2.6 - ((this.clock * 1.2) % 5.2);
    }

    // 3. Animasi Mekanikal Perkakasan Kemahiran (meluncur keluar di atas dok apabila dipilih)
    this.skillUnits.forEach((unit, idx) => {
      const isActive = this.view === 'skills' && idx === this.category;
      const targetZ = unit.baseZ + (isActive ? 0.3 : 0);

      unit.group.position.z = THREE.MathUtils.lerp(unit.group.position.z, targetZ, stepBlend);
      unit.ledMat.emissiveIntensity = isActive
        ? (still ? 1.15 : 0.95 + Math.sin(this.clock * 4) * 0.25)
        : 0.35;
      unit.coreMat.emissiveIntensity = isActive ? 0.65 : 0.28;
    });
  }

  dispose() {
    this.disposed = true;
    this.portraitImg.onload = null;
    this.geometries.forEach(g => g.dispose());
    this.materials.forEach(m => m.dispose());
    this.textures.forEach(t => t.dispose());
  }
}
