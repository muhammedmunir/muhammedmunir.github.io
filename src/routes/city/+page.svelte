<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let animFrame: number;
  let running = true;

  // ── Tile constants ───────────────────────────────────────────────────────────
  const TW = 96;   // tile width (screen)
  const TH = 48;   // tile height (screen)
  const COLS = 14;
  const ROWS = 14;

  // ── Camera ───────────────────────────────────────────────────────────────────
  let camX = 0, camY = 0;

  // ── Player ───────────────────────────────────────────────────────────────────
  const player = { gx: 7.0, gy: 7.0, moving: false };

  // ── Keys / joystick ──────────────────────────────────────────────────────────
  const keys: Record<string, boolean> = {};
  const joy = { active: false, ox: 0, oy: 0, dx: 0, dy: 0 };
  let joyPos = $state({ visible: false, bx: 0, by: 0, kx: 0, ky: 0 });

  // ── State ────────────────────────────────────────────────────────────────────
  let popup = $state<null | { section: string; color: string }>(null);
  let nearBuilding = $state<null | typeof buildings[number]>(null);
  let coords = $state({ x: 0, y: 0 });

  // ── Building definitions ─────────────────────────────────────────────────────
  interface Building { col: number; row: number; fw: number; fd: number; height: number; color: string; accent: string; section: string; label: string; icon: string; }

  const buildings: Building[] = [
    { col: 1, row: 1, fw: 3, fd: 3, height: 180, color: '#0d1f33', accent: '#D4AF37', section: 'lobby',      label: 'LOBBY',      icon: '🏛' },
    { col: 7, row: 0, fw: 3, fd: 2, height: 240, color: '#0d1a2d', accent: '#60A5FA', section: 'experience',  label: 'EXPERIENCE', icon: '💼' },
    { col:11, row: 2, fw: 2, fd: 2, height: 160, color: '#0a2218', accent: '#22C55E', section: 'projects',    label: 'PROJECTS',   icon: '🚀' },
    { col: 0, row: 8, fw: 3, fd: 3, height: 200, color: '#160d2a', accent: '#A78BFA', section: 'skills',      label: 'SKILLS',     icon: '⚡' },
    { col:10, row: 9, fw: 3, fd: 3, height: 170, color: '#2a0f0a', accent: '#F97316', section: 'contact',     label: 'CONTACT',    icon: '📡' },
    { col: 5, row: 5, fw: 2, fd: 2, height: 130, color: '#0a1a0a', accent: '#34D399', section: 'about',       label: 'ABOUT',      icon: '👤' },
  ];

  // ── Pre-compute windows (ONCE — not per frame) ───────────────────────────────
  interface WinInfo { fx: number; fy: number; lit: boolean; blink: number }
  const buildingWindows = new Map<string, WinInfo[]>();

  function precomputeWindows() {
    for (const b of buildings) {
      const wins: WinInfo[] = [];
      const floorsL = Math.floor(b.height / 22);
      const wColsL  = b.fw * 3;
      for (let r = 0; r < floorsL; r++) {
        for (let c = 0; c < wColsL; c++) {
          wins.push({
            fx: c / wColsL,
            fy: 1 - (r + 1) / (floorsL + 1),
            lit: Math.random() > 0.25,
            blink: Math.random() > 0.95 ? Math.random() * Math.PI * 2 : -1,
          });
        }
      }
      buildingWindows.set(b.label, wins);
    }
  }

  // ── Blocked tiles ────────────────────────────────────────────────────────────
  const blocked = new Set<string>();
  for (const b of buildings) {
    for (let r = b.row; r < b.row + b.fd; r++)
      for (let c = b.col; c < b.col + b.fw; c++)
        blocked.add(`${c},${r}`);
  }

  // ── Isometric projection ──────────────────────────────────────────────────────
  function iso(gx: number, gy: number): [number, number] {
    return [(gx - gy) * (TW / 2), (gx + gy) * (TH / 2)];
  }

  function origin(): [number, number] {
    return [canvas.width / 2, canvas.height * 0.38];
  }

  // ── Draw ground tile ──────────────────────────────────────────────────────────
  function drawGround() {
    const [ox, oy] = origin();
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const [sx, sy] = iso(col, row);
        const cx = ox + sx - camX;
        const cy = oy + sy - camY;

        const isRoad = (col % 4 === 0 || row % 4 === 0);
        const isCenter = (col >= 6 && col <= 7 && row >= 6 && row <= 7);

        let fill: string;
        if (isCenter) fill = '#0c1a2e';
        else if (isRoad) fill = '#080e18';
        else fill = '#060c14';

        // Tile diamond
        ctx.beginPath();
        ctx.moveTo(cx,          cy - TH / 2);
        ctx.lineTo(cx + TW / 2, cy);
        ctx.lineTo(cx,          cy + TH / 2);
        ctx.lineTo(cx - TW / 2, cy);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();

        // Neon grid line
        ctx.strokeStyle = isRoad ? 'rgba(96,165,250,0.18)' : 'rgba(96,165,250,0.06)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Road dashes
        if (isRoad) {
          ctx.save();
          ctx.globalAlpha = 0.25;
          ctx.strokeStyle = '#D4AF37';
          ctx.lineWidth = 1;
          ctx.setLineDash([5, 8]);
          ctx.beginPath();
          ctx.moveTo(cx - TW * 0.25, cy);
          ctx.lineTo(cx + TW * 0.25, cy);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }
      }
    }
  }

  // ── Draw one building ─────────────────────────────────────────────────────────
  function drawBuilding(b: Building, t: number) {
    const [ox, oy] = origin();

    // Anchor = bottom-far corner of footprint → iso(col + fw, row + fd)
    const [sx, sy] = iso(b.col + b.fw, b.row + b.fd);
    const bx = ox + sx - camX;
    const by = oy + sy - camY;

    // Screen-space footprint half-widths
    const hw = (b.fw + b.fd) * (TW / 2) / 2;   // horizontal
    const hd = (b.fw + b.fd) * (TH / 2) / 2;   // vertical depth of diamond
    const bh = b.height;

    const pulse = 0.5 + 0.5 * Math.sin(t * 1.2 + b.col * 0.7);

    // ── Left face ──
    const leftShade = hexToRgb(b.color, -20);
    ctx.beginPath();
    ctx.moveTo(bx - hw,  by);
    ctx.lineTo(bx - hw,  by - bh);
    ctx.lineTo(bx,       by - bh - hd);
    ctx.lineTo(bx,       by - hd);
    ctx.closePath();
    ctx.fillStyle = leftShade;
    ctx.fill();

    // Left face accent stripe
    ctx.save();
    ctx.clip();
    const lGrad = ctx.createLinearGradient(bx - hw, by - bh, bx, by);
    lGrad.addColorStop(0, b.accent + '18');
    lGrad.addColorStop(0.3, 'transparent');
    ctx.fillStyle = lGrad;
    ctx.fill();
    ctx.restore();

    // ── Right face ──
    const rightShade = hexToRgb(b.color, 0);
    ctx.beginPath();
    ctx.moveTo(bx + hw,  by);
    ctx.lineTo(bx + hw,  by - bh);
    ctx.lineTo(bx,       by - bh - hd);
    ctx.lineTo(bx,       by - hd);
    ctx.closePath();
    ctx.fillStyle = rightShade;
    ctx.fill();

    // Right face accent stripe
    ctx.save();
    ctx.clip();
    const rGrad = ctx.createLinearGradient(bx + hw, by - bh, bx, by);
    rGrad.addColorStop(0, b.accent + '10');
    rGrad.addColorStop(0.4, 'transparent');
    ctx.fillStyle = rGrad;
    ctx.fill();
    ctx.restore();

    // ── Top face ──
    ctx.beginPath();
    ctx.moveTo(bx - hw, by - bh);
    ctx.lineTo(bx,      by - bh - hd);
    ctx.lineTo(bx + hw, by - bh);
    ctx.lineTo(bx,      by - bh + hd);
    ctx.closePath();
    const topShade = hexToRgb(b.color, 40);
    ctx.fillStyle = topShade;
    ctx.fill();

    // Top neon border
    ctx.strokeStyle = b.accent + 'CC';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ── Rooftop antenna ──
    ctx.save();
    ctx.strokeStyle = b.accent;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = b.accent;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(bx, by - bh - hd);
    ctx.lineTo(bx, by - bh - hd - 28);
    ctx.stroke();
    // Blink light
    const blinkAlpha = 0.6 + 0.4 * Math.sin(t * 3 + b.col);
    ctx.globalAlpha = blinkAlpha;
    ctx.fillStyle = b.accent;
    ctx.beginPath();
    ctx.arc(bx, by - bh - hd - 28, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ── Windows (left face) ──
    const wins = buildingWindows.get(b.label) ?? [];
    const floorsL = Math.floor(bh / 22);
    const wColsL  = b.fw * 3;

    ctx.save();
    // Clip to left face
    ctx.beginPath();
    ctx.moveTo(bx - hw,  by - 1);
    ctx.lineTo(bx - hw,  by - bh + 1);
    ctx.lineTo(bx,       by - bh - hd + 1);
    ctx.lineTo(bx,       by - hd - 1);
    ctx.closePath();
    ctx.clip();

    for (const w of wins) {
      if (!w.lit) continue;
      const isBlinking = w.blink >= 0;
      const alpha = isBlinking ? (0.5 + 0.5 * Math.sin(t * 2.5 + w.blink)) : 0.85;
      ctx.globalAlpha = alpha;

      // Left face: x goes from bx-hw toward bx, y from bottom to top
      const wx = bx - hw + (hw * w.fx) - 2;
      const wy = by - bh * (1 - w.fy) - hd * w.fx - 4;
      const wp = 5, wh = 7;
      ctx.fillStyle = b.accent + 'DD';
      ctx.shadowColor = b.accent;
      ctx.shadowBlur = 6;
      ctx.fillRect(wx, wy, wp, wh);
    }
    ctx.restore();

    // ── Neon outline on faces ──
    ctx.save();
    ctx.strokeStyle = b.accent + '50';
    ctx.lineWidth = 1;
    // left edge
    ctx.beginPath();
    ctx.moveTo(bx - hw, by);
    ctx.lineTo(bx - hw, by - bh);
    ctx.stroke();
    // right edge
    ctx.beginPath();
    ctx.moveTo(bx + hw, by);
    ctx.lineTo(bx + hw, by - bh);
    ctx.stroke();
    // center ridge
    ctx.beginPath();
    ctx.moveTo(bx, by - hd);
    ctx.lineTo(bx, by - bh - hd);
    ctx.stroke();
    ctx.restore();

    // ── Ground glow halo ──
    ctx.save();
    ctx.globalAlpha = 0.08 * pulse;
    const glow = ctx.createRadialGradient(bx, by, 0, bx, by, hw * 1.5);
    glow.addColorStop(0, b.accent);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(bx - hw * 1.5, by - hw * 0.6, hw * 3, hw * 1.2);
    ctx.restore();

    // ── Label ──
    ctx.save();
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = b.accent;
    ctx.shadowColor = b.accent;
    ctx.shadowBlur = 14;
    ctx.fillText(`${b.icon} ${b.label}`, bx, by - bh - hd - 38);
    ctx.restore();
  }

  // ── Draw player ───────────────────────────────────────────────────────────────
  function drawPlayer(t: number) {
    const [ox, oy] = origin();
    const [sx, sy] = iso(player.gx, player.gy);
    const px = ox + sx - camX;
    const py = oy + sy - camY;

    const bob = player.moving ? Math.sin(t * 8) * 3 : 0;
    const legSwing = player.moving ? Math.sin(t * 8) * 6 : 0;
    const armSwing = player.moving ? Math.sin(t * 8) * 5 : 0;
    const baseY = py - 20 + bob;

    ctx.save();

    // Shadow on ground
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(px, py, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Legs
    const lc = '#1E3A60';
    ctx.fillStyle = lc;
    // Left leg
    ctx.save();
    ctx.translate(px - 5, baseY + 20);
    ctx.rotate(legSwing * 0.05);
    ctx.fillRect(-4, 0, 8, 14);
    // Shoe
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(-5, 12, 10, 4);
    ctx.restore();
    // Right leg
    ctx.fillStyle = lc;
    ctx.save();
    ctx.translate(px + 5, baseY + 20);
    ctx.rotate(-legSwing * 0.05);
    ctx.fillRect(-4, 0, 8, 14);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(-5, 12, 10, 4);
    ctx.restore();

    // Coat body
    ctx.shadowColor = '#D4AF37';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#1a3a6a';
    ctx.beginPath();
    ctx.roundRect(px - 11, baseY + 8, 22, 16, 4);
    ctx.fill();

    // Coat collar / lapel
    ctx.fillStyle = '#0d2040';
    ctx.beginPath();
    ctx.moveTo(px - 4, baseY + 8);
    ctx.lineTo(px,     baseY + 14);
    ctx.lineTo(px + 4, baseY + 8);
    ctx.fill();

    // Gold chest badge
    ctx.fillStyle = '#D4AF37';
    ctx.shadowColor = '#D4AF37';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(px, baseY + 16, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Arms
    ctx.fillStyle = '#1a3a6a';
    // Left arm
    ctx.save();
    ctx.translate(px - 13, baseY + 10);
    ctx.rotate(-armSwing * 0.06);
    ctx.beginPath();
    ctx.roundRect(-3, 0, 7, 13, 3);
    ctx.fill();
    ctx.restore();
    // Right arm
    ctx.save();
    ctx.translate(px + 13, baseY + 10);
    ctx.rotate(armSwing * 0.06);
    ctx.beginPath();
    ctx.roundRect(-4, 0, 7, 13, 3);
    ctx.fill();
    ctx.restore();

    // Neck
    ctx.fillStyle = '#c4a882';
    ctx.fillRect(px - 4, baseY + 3, 8, 7);

    // Head
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#d4b896';
    ctx.beginPath();
    ctx.ellipse(px, baseY - 2, 10, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Helmet
    ctx.fillStyle = '#0d2040';
    ctx.beginPath();
    ctx.arc(px, baseY - 4, 11, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(px - 11, baseY - 6, 22, 8, [6, 6, 0, 0]);
    ctx.fill();

    // Visor — glowing horizontal band
    const visorGrad = ctx.createLinearGradient(px - 9, baseY - 2, px + 9, baseY - 2);
    visorGrad.addColorStop(0, '#D4AF37' + '33');
    visorGrad.addColorStop(0.5, '#D4AF37');
    visorGrad.addColorStop(1, '#D4AF37' + '33');
    ctx.fillStyle = visorGrad;
    ctx.shadowColor = '#D4AF37';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.roundRect(px - 9, baseY - 4, 18, 5, 2);
    ctx.fill();

    ctx.restore();
  }

  // ── Particles (floating code digits) ─────────────────────────────────────────
  interface Particle { x: number; y: number; vy: number; char: string; alpha: number; color: string }
  const particles: Particle[] = [];
  const pChars = '01アイウエオクサタナ∑∆Ω';

  function spawnParticles() {
    if (particles.length < 60 && Math.random() < 0.12) {
      particles.push({
        x: Math.random() * (canvas?.width ?? 800),
        y: (canvas?.height ?? 600) * 0.8 + Math.random() * 100,
        vy: -(0.3 + Math.random() * 0.5),
        char: pChars[Math.floor(Math.random() * pChars.length)],
        alpha: 0.4 + Math.random() * 0.4,
        color: ['#D4AF37','#60A5FA','#A78BFA','#22C55E'][Math.floor(Math.random() * 4)],
      });
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].y += particles[i].vy;
      particles[i].alpha -= 0.003;
      if (particles[i].alpha <= 0) particles.splice(i, 1);
    }
  }

  function drawParticles() {
    ctx.save();
    ctx.font = '11px "Courier New", monospace';
    for (const p of particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillText(p.char, p.x, p.y);
    }
    ctx.restore();
  }

  // ── Draw sky + stars ──────────────────────────────────────────────────────────
  // Pre-compute star positions
  const stars: { x: number; y: number; r: number; phase: number }[] = [];
  function initStars(w: number, h: number) {
    stars.length = 0;
    for (let i = 0; i < 120; i++) {
      stars.push({ x: Math.random() * w, y: Math.random() * h * 0.55, r: Math.random() * 1.2, phase: Math.random() * Math.PI * 2 });
    }
  }

  function drawSky(t: number) {
    const w = canvas.width, h = canvas.height;
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#010408');
    sky.addColorStop(0.6, '#030a14');
    sky.addColorStop(1, '#06101e');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Stars
    ctx.save();
    for (const s of stars) {
      const alpha = 0.2 + 0.5 * Math.abs(Math.sin(t * 0.4 + s.phase));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Horizon glow
    const hg = ctx.createLinearGradient(0, h * 0.3, 0, h * 0.55);
    hg.addColorStop(0, 'transparent');
    hg.addColorStop(1, 'rgba(96,165,250,0.04)');
    ctx.fillStyle = hg;
    ctx.fillRect(0, 0, w, h * 0.55);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function hexToRgb(hex: string, lighten: number): string {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, ((n >> 16) & 0xff) + lighten));
    const g = Math.max(0, Math.min(255, ((n >> 8)  & 0xff) + lighten));
    const b = Math.max(0, Math.min(255, ( n        & 0xff) + lighten));
    return `rgb(${r},${g},${b})`;
  }

  // ── Collision ─────────────────────────────────────────────────────────────────
  const SPEED = 0.075;
  function walkable(gx: number, gy: number): boolean {
    const c = Math.floor(gx), r = Math.floor(gy);
    if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return false;
    return !blocked.has(`${c},${r}`);
  }

  // ── Proximity ─────────────────────────────────────────────────────────────────
  function updateProximity() {
    let best: typeof buildings[0] | null = null, bestD = Infinity;
    for (const b of buildings) {
      const cx = b.col + b.fw / 2, cy = b.row + b.fd / 2;
      const d = Math.hypot(player.gx - cx, player.gy - cy);
      if (d < 3.5 && d < bestD) { bestD = d; best = b; }
    }
    nearBuilding = best;
  }

  // ── Main update ───────────────────────────────────────────────────────────────
  function update() {
    let dx = 0, dy = 0;
    if (keys['ArrowUp']    || keys['w'] || keys['W']) { dx--; dy--; }
    if (keys['ArrowDown']  || keys['s'] || keys['S']) { dx++; dy++; }
    if (keys['ArrowLeft']  || keys['a'] || keys['A']) { dx--; dy++; }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) { dx++; dy--; }
    if (joy.active) {
      const jlen = Math.hypot(joy.dx, joy.dy);
      if (jlen > 8) { dx += joy.dx / jlen; dy += joy.dy / jlen; }
    }
    const len = Math.hypot(dx, dy);
    player.moving = len > 0.01;
    if (len > 0.01) {
      dx /= len; dy /= len;
      const nx = player.gx + dx * SPEED;
      const ny = player.gy + dy * SPEED;
      if (walkable(nx, player.gy)) player.gx = nx;
      if (walkable(player.gx, ny)) player.gy = ny;
    }

    // Smooth camera
    const [sx, sy] = iso(player.gx, player.gy);
    camX += (sx - camX) * 0.1;
    camY += (sy - camY) * 0.1;

    coords = { x: Math.floor(player.gx), y: Math.floor(player.gy) };
    updateProximity();
    spawnParticles();
  }

  // ── Main render ───────────────────────────────────────────────────────────────
  function render(t: number) {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawSky(t);
    drawGround();

    // Sort buildings back-to-front (painter's algo: smaller col+row = further back in iso)
    const sorted = [...buildings].sort((a, b) => (a.col + a.row) - (b.col + b.row));
    for (const b of sorted) drawBuilding(b, t);

    drawPlayer(t);
    drawParticles();

    // Proximity ring on ground beneath nearest building
    if (nearBuilding && !popup) {
      const [ox, oy] = origin();
      const b = nearBuilding;
      const [sx, sy] = iso(b.col + b.fw / 2, b.row + b.fd / 2);
      const cx2 = ox + sx - camX, cy2 = oy + sy - camY;
      ctx.save();
      const pulse = 0.5 + 0.5 * Math.sin(t * 4);
      ctx.globalAlpha = 0.6 * pulse;
      ctx.strokeStyle = b.accent;
      ctx.lineWidth = 2;
      ctx.shadowColor = b.accent;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(cx2, cy2, 32, 14, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // ── Game loop ─────────────────────────────────────────────────────────────────
  function loop(ts: number) {
    if (!running) return;
    const t = ts / 1000;
    update();
    render(t);
    animFrame = requestAnimationFrame(loop);
  }

  // ── Resize ────────────────────────────────────────────────────────────────────
  function resize() {
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars(canvas.width, canvas.height);
  }

  // ── Actions ───────────────────────────────────────────────────────────────────
  function enterBuilding() {
    if (!nearBuilding || popup) return;
    popup = { section: nearBuilding.section, color: nearBuilding.accent };
  }

  function closePopup() { popup = null; }

  function goTo(section: string) {
    if (section === 'lobby') goto('/');
    else goto(`/#${section}`);
  }

  // ── Content ───────────────────────────────────────────────────────────────────
  const content: Record<string, { title: string; body: string; cta: string }> = {
    lobby:      { title:'Main Lobby',        cta:'Return to Portfolio', body:'Welcome to the Digital City — Muhammed Munir\'s portfolio in 2.5D. Walk through the city to explore each section.' },
    experience: { title:'Experience Tower',  cta:'View Experience',     body:'Full-Stack Developer at Nova Bitara Development · IT Executive at Tenaga Nasional Berhad (TNB). 3+ years in production engineering.' },
    projects:   { title:'Projects Hub',      cta:'View Projects',       body:'5 production-grade apps: IWA Employee Portal, Infinity Platform, E-Commerce, OnBoardX Mobile, and UTM FYP Navigator.' },
    skills:     { title:'Skills Core',       cta:'View Skills',         body:'SvelteKit · TypeScript · Flutter · Laravel · Supabase · Firebase · Azure · Docker. Full-stack and cloud-native.' },
    contact:    { title:'Communications Hub',cta:'Contact Me',          body:'Open for freelance and full-time work. Based in Puchong, Selangor. Remote-friendly. muhammed.munir97.mm@gmail.com' },
    about:      { title:'About Zone',        cta:'View About',          body:'Muhammed Munir Bin Mohd Azmi — passionate builder with a love for clean code, great UX, and impactful software.' },
  };

  // ── Joystick ──────────────────────────────────────────────────────────────────
  function joyStart(x: number, y: number) {
    joy.active = true; joy.ox = x; joy.oy = y; joy.dx = 0; joy.dy = 0;
    joyPos = { visible: true, bx: x, by: y, kx: x, ky: y };
  }
  function joyMove(x: number, y: number) {
    if (!joy.active) return;
    const dx = x - joy.ox, dy = y - joy.oy;
    const d = Math.min(Math.hypot(dx, dy), 45);
    const a = Math.atan2(dy, dx);
    joy.dx = Math.cos(a) * d; joy.dy = Math.sin(a) * d;
    joyPos = { ...joyPos, kx: joy.ox + joy.dx, ky: joy.oy + joy.dy };
  }
  function joyEnd() {
    joy.active = false; joy.dx = 0; joy.dy = 0;
    joyPos = { ...joyPos, visible: false };
  }

  onMount(() => {
    ctx = canvas.getContext('2d')!;
    precomputeWindows();
    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('keydown', (e) => {
      keys[e.key] = true;
      if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') enterBuilding();
      if (e.key === 'Escape') closePopup();
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => { keys[e.key] = false; });

    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); const t = e.touches[0]; joyStart(t.clientX, t.clientY); }, { passive: false });
    canvas.addEventListener('touchmove',  (e) => { e.preventDefault(); const t = e.touches[0]; joyMove(t.clientX, t.clientY);  }, { passive: false });
    canvas.addEventListener('touchend',   (e) => { e.preventDefault(); joyEnd(); }, { passive: false });

    animFrame = requestAnimationFrame(loop);
  });

  onDestroy(() => {
    running = false;
    cancelAnimationFrame(animFrame);
    window.removeEventListener('resize', resize);
  });
</script>

<svelte:head>
  <title>City Explorer | Muhammed Munir</title>
</svelte:head>

<div class="wrap">
  <canvas bind:this={canvas}></canvas>

  <!-- Top-left HUD -->
  <div class="hud-tl">
    <div class="hud-brand">
      <span class="led"></span>CITY.EXE
    </div>
    <div class="hud-coord">{coords.x} · {coords.y}</div>
  </div>

  <!-- Top-right buttons -->
  <div class="hud-tr">
    <a href="/" class="hbtn">← Portfolio</a>
    <a href="/games" class="hbtn alt">🎮 RPG</a>
  </div>

  <!-- Bottom controls hint -->
  <div class="controls">
    <span class="k">WASD</span> / <span class="k">↑↓←→</span> walk &nbsp;·&nbsp; <span class="k">E</span> enter
  </div>

  <!-- Near-building prompt (desktop) -->
  {#if nearBuilding && !popup}
    <div class="near-prompt" style="--ac:{nearBuilding.accent}">
      {nearBuilding.icon} <strong>{nearBuilding.label}</strong> — press <kbd>E</kbd> to enter
    </div>
  {/if}

  <!-- Near-building button (mobile) -->
  {#if nearBuilding && !popup}
    <button class="mob-enter" style="--ac:{nearBuilding.accent}" onclick={enterBuilding}>
      {nearBuilding.icon} ENTER
    </button>
  {/if}

  <!-- Joystick -->
  {#if joyPos.visible}
    <div class="joy-base" style="left:{joyPos.bx}px;top:{joyPos.by}px"></div>
    <div class="joy-knob" style="left:{joyPos.kx}px;top:{joyPos.ky}px"></div>
  {/if}

  <!-- Popup -->
  {#if popup}
    {@const c = content[popup.section]}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="overlay" onclick={closePopup}>
      <div class="card" style="--ac:{popup.color}" onclick={(e) => e.stopPropagation()}>
        <button class="x" onclick={closePopup} aria-label="Close">✕</button>
        <h2 class="card-title">{c.title}</h2>
        <p class="card-body">{c.body}</p>
        <div class="card-btns">
          <button class="cbtn primary" onclick={() => goTo(popup!.section)}>{c.cta} →</button>
          <button class="cbtn ghost" onclick={closePopup}>Stay</button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  :global(body) { margin:0; padding:0; overflow:hidden; background:#010408; }

  .wrap {
    position: fixed; inset: 0; overflow: hidden;
  }

  canvas {
    display: block; width: 100%; height: 100%;
    cursor: crosshair; touch-action: none;
  }

  /* ── HUD ──────────────────────────────────────────────────────────────────── */
  .hud-tl {
    position: fixed; top: 1rem; left: 1rem;
    display: flex; flex-direction: column; gap: 0.25rem;
  }
  .hud-brand {
    display: flex; align-items: center; gap: 0.45rem;
    font: 700 0.82rem/1 'Courier New', monospace;
    color: #D4AF37; letter-spacing: 0.18em;
    text-shadow: 0 0 14px #D4AF37;
  }
  .led {
    width: 7px; height: 7px; border-radius: 50%;
    background: #22C55E;
    box-shadow: 0 0 8px #22C55E;
    animation: blink 1.8s ease-in-out infinite;
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
  .hud-coord {
    margin-left: 1.1rem;
    font: 0.68rem/1 'Courier New', monospace;
    color: rgba(212,175,55,0.45); letter-spacing: 0.12em;
  }

  .hud-tr {
    position: fixed; top: 1rem; right: 1rem;
    display: flex; gap: 0.5rem;
  }
  .hbtn {
    background: rgba(6,16,30,0.88);
    border: 1px solid rgba(212,175,55,0.3);
    color: #D4AF37;
    font: 700 0.76rem/1 'Courier New', monospace;
    padding: 0.45rem 0.9rem; border-radius: 6px;
    text-decoration: none; letter-spacing: 0.06em;
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    transition: border-color 0.2s, background 0.2s;
  }
  .hbtn:hover { border-color: rgba(212,175,55,0.7); background: rgba(212,175,55,0.08); }
  .hbtn.alt { color: #A78BFA; border-color: rgba(167,139,250,0.3); }
  .hbtn.alt:hover { border-color: rgba(167,139,250,0.7); background: rgba(167,139,250,0.08); }

  .controls {
    position: fixed; bottom: 1rem; left: 1rem;
    font: 0.68rem/1 'Courier New', monospace;
    color: rgba(255,255,255,0.28); pointer-events: none;
  }
  .k {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 4px; padding: 0.1rem 0.35rem;
    font: 0.65rem/1 'Courier New', monospace;
    color: rgba(212,175,55,0.6);
  }

  /* ── Near prompt ──────────────────────────────────────────────────────────── */
  .near-prompt {
    position: fixed; bottom: 3rem; left: 50%; transform: translateX(-50%);
    background: rgba(4,10,20,0.92);
    border: 1px solid var(--ac);
    border-radius: 10px; padding: 0.6rem 1.5rem;
    font: 0.82rem/1 'Courier New', monospace; color: #ddd;
    box-shadow: 0 0 24px color-mix(in srgb,var(--ac) 25%,transparent);
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    pointer-events: none;
    animation: nudge 0.2s ease;
  }
  @keyframes nudge { from{opacity:0;transform:translateX(-50%) translateY(6px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  kbd {
    background: rgba(212,175,55,0.15); border:1px solid rgba(212,175,55,0.4);
    border-radius:4px; padding:0.1rem 0.4rem;
    font:0.73rem/1 'Courier New',monospace; color:#D4AF37;
  }

  /* ── Mobile enter ─────────────────────────────────────────────────────────── */
  .mob-enter {
    display: none;
    position: fixed; bottom: 2rem; right: 1rem;
    background: rgba(4,10,20,0.92);
    border: 2px solid var(--ac); border-radius: 12px;
    padding: 0.75rem 1.5rem;
    font: 700 0.9rem/1 'Courier New', monospace; color: var(--ac);
    cursor: pointer; letter-spacing: 0.1em;
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 0 20px color-mix(in srgb,var(--ac) 30%,transparent);
    animation: nudge 0.2s ease;
  }

  /* ── Joystick ──────────────────────────────────────────────────────────────── */
  .joy-base {
    position: fixed; width: 86px; height: 86px;
    background: rgba(212,175,55,0.06);
    border: 2px solid rgba(212,175,55,0.25); border-radius: 50%;
    transform: translate(-50%,-50%); pointer-events: none;
  }
  .joy-knob {
    position: fixed; width: 38px; height: 38px;
    background: rgba(212,175,55,0.35);
    border: 2px solid rgba(212,175,55,0.7); border-radius: 50%;
    transform: translate(-50%,-50%); pointer-events: none;
    box-shadow: 0 0 12px rgba(212,175,55,0.4);
  }

  /* ── Popup overlay ─────────────────────────────────────────────────────────── */
  .overlay {
    position: fixed; inset: 0;
    background: rgba(1,4,8,0.72);
    display: flex; align-items: center; justify-content: center;
    z-index: 100;
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }

  .card {
    background: linear-gradient(145deg, #080f1c, #060c18);
    border: 1px solid var(--ac);
    border-radius: 18px; padding: 2.5rem;
    max-width: 440px; width: 90vw; position: relative;
    box-shadow:
      0 0 60px color-mix(in srgb,var(--ac) 18%,transparent),
      0 40px 80px rgba(0,0,0,0.7);
    animation: cardPop 0.28s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes cardPop { from{opacity:0;transform:scale(0.86)} to{opacity:1;transform:scale(1)} }

  .x {
    position: absolute; top: 1rem; right: 1rem;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12); border-radius: 6px;
    color: rgba(255,255,255,0.45); width: 30px; height: 30px;
    cursor: pointer; font-size: 0.85rem;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s, color 0.2s;
  }
  .x:hover { background: rgba(255,255,255,0.1); color: #fff; }

  .card-title {
    font: 700 1.35rem/1.2 'Courier New', monospace;
    color: var(--ac); margin: 0 0 1rem;
    text-shadow: 0 0 20px color-mix(in srgb,var(--ac) 50%,transparent);
    letter-spacing: 0.05em;
  }
  .card-body {
    font: 0.87rem/1.75 'Courier New', monospace;
    color: rgba(255,255,255,0.55); margin: 0 0 2rem;
  }
  .card-btns { display: flex; gap: 0.75rem; flex-wrap: wrap; }

  .cbtn {
    flex: 1; min-width: 110px; padding: 0.75rem 1rem; border-radius: 8px;
    font: 700 0.82rem/1 'Courier New', monospace; letter-spacing: 0.06em;
    cursor: pointer; border: none; transition: filter 0.2s, box-shadow 0.2s;
  }
  .cbtn.primary {
    background: var(--ac); color: #04080f;
    box-shadow: 0 0 20px color-mix(in srgb,var(--ac) 40%,transparent);
  }
  .cbtn.primary:hover { filter: brightness(1.12); box-shadow: 0 0 30px color-mix(in srgb,var(--ac) 55%,transparent); }
  .cbtn.ghost {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.5);
  }
  .cbtn.ghost:hover { background: rgba(255,255,255,0.09); color: #fff; }

  /* ── Mobile ────────────────────────────────────────────────────────────────── */
  @media (max-width: 640px) {
    .controls  { display: none; }
    .near-prompt { display: none; }
    .mob-enter { display: block; }
    .hbtn { font-size: 0.68rem; padding: 0.38rem 0.65rem; }
    .card { padding: 1.75rem 1.25rem; }
    .card-title { font-size: 1.1rem; }
  }
</style>
