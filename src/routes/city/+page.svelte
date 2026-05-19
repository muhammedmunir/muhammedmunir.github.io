<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let animFrame: number;
  let running = true;

  // ── World size ──────────────────────────────────────────────────────────────
  const TILE_W = 80;
  const TILE_H = 40;
  const GRID_COLS = 16;
  const GRID_ROWS = 16;

  // ── Camera ──────────────────────────────────────────────────────────────────
  let camX = $state(0);
  let camY = $state(0);

  // ── Player ──────────────────────────────────────────────────────────────────
  let player = {
    gridX: 8.5,   // float for smooth movement
    gridY: 8.5,
    dir: 'se' as 'n'|'ne'|'e'|'se'|'s'|'sw'|'w'|'nw',
    frame: 0,
    frameTick: 0,
    moving: false,
  };

  // ── Keys ────────────────────────────────────────────────────────────────────
  const keys: Record<string, boolean> = {};

  // ── Popup ───────────────────────────────────────────────────────────────────
  let popup = $state<null | { section: string; color: string }>(null);

  // ── Buildings ────────────────────────────────────────────────────────────────
  interface Building {
    col: number; row: number;
    w: number;   // tile footprint
    h: number;
    floors: number;
    color: string;
    glowColor: string;
    label: string;
    section: string;
    icon: string;
  }

  const buildings: Building[] = [
    { col:2,  row:2,  w:3, h:3, floors:8,  color:'#1E3A5F', glowColor:'#D4AF37', label:'LOBBY',      section:'lobby',      icon:'🏛️' },
    { col:8,  row:1,  w:3, h:3, floors:12, color:'#1a2f4a', glowColor:'#6B9FD4', label:'EXPERIENCE',  section:'experience',  icon:'💼' },
    { col:12, row:3,  w:2, h:2, floors:6,  color:'#1a3030', glowColor:'#22C55E', label:'PROJECTS',    section:'projects',    icon:'🚀' },
    { col:1,  row:9,  w:3, h:3, floors:10, color:'#2a1a3a', glowColor:'#A78BFA', label:'SKILLS',      section:'skills',      icon:'⚡' },
    { col:11, row:10, w:3, h:3, floors:7,  color:'#3a1a1a', glowColor:'#F97316', label:'CONTACT',     section:'contact',     icon:'📡' },
    { col:5,  row:6,  w:2, h:2, floors:5,  color:'#1a2a1a', glowColor:'#22C55E', label:'ABOUT',       section:'about',       icon:'👤' },
  ];

  // ── Tile map: 0=road 1=park 2=plaza ─────────────────────────────────────────
  const tilemap: number[][] = Array.from({ length: GRID_ROWS }, (_, r) =>
    Array.from({ length: GRID_COLS }, (_, c) => {
      // Roads: every 4th col/row
      if (c % 4 === 0 || r % 4 === 0) return 0;
      if ((c === 7 || c === 8) && (r === 7 || r === 8)) return 2;
      if (c % 3 === 1 && r % 3 === 1) return 1;
      return 0;
    })
  );

  // Block tiles occupied by buildings
  const blocked = new Set<string>();
  for (const b of buildings) {
    for (let rr = b.row; rr < b.row + b.h; rr++)
      for (let cc = b.col; cc < b.col + b.w; cc++)
        blocked.add(`${cc},${rr}`);
  }

  // ── Isometric helpers ────────────────────────────────────────────────────────
  function toScreen(gx: number, gy: number): [number, number] {
    const sx = (gx - gy) * (TILE_W / 2);
    const sy = (gx + gy) * (TILE_H / 2);
    return [sx, sy];
  }

  function canvasCenter(): [number, number] {
    return [canvas.width / 2, canvas.height / 3];
  }

  // ── Draw helpers ─────────────────────────────────────────────────────────────
  function drawTile(gx: number, gy: number, fill: string, stroke = 'rgba(0,0,0,0.3)') {
    const [cx, cy] = canvasCenter();
    const [sx, sy] = toScreen(gx, gy);
    const ox = cx + sx - camX;
    const oy = cy + sy - camY;

    ctx.beginPath();
    ctx.moveTo(ox,              oy - TILE_H / 2);
    ctx.lineTo(ox + TILE_W / 2, oy);
    ctx.lineTo(ox,              oy + TILE_H / 2);
    ctx.lineTo(ox - TILE_W / 2, oy);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  function drawBuilding(b: Building) {
    const [cx, cy] = canvasCenter();
    // draw from bottom-right to top-left for correct occlusion
    const [sx, sy] = toScreen(b.col + b.w, b.row + b.h);
    const ox = cx + sx - camX - TILE_W / 2;
    const oy = cy + sy - camY;

    const tw = b.w * TILE_W / 2 + b.h * TILE_W / 2; // screen width of footprint
    const td = b.w * TILE_H / 2 + b.h * TILE_H / 2; // screen depth of footprint
    const bh = b.floors * 14; // pixel height of building

    const t = Date.now() / 1000;
    const pulse = 0.6 + 0.4 * Math.sin(t * 1.5 + b.col);

    // Left face
    ctx.beginPath();
    ctx.moveTo(ox - tw / 2, oy);
    ctx.lineTo(ox - tw / 2, oy - bh);
    ctx.lineTo(ox, oy - bh - td / 2);
    ctx.lineTo(ox, oy - td / 2);
    ctx.closePath();
    ctx.fillStyle = shadeColor(b.color, -30);
    ctx.fill();
    ctx.strokeStyle = b.glowColor + '40';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Right face
    ctx.beginPath();
    ctx.moveTo(ox + tw / 2, oy);
    ctx.lineTo(ox + tw / 2, oy - bh);
    ctx.lineTo(ox, oy - bh - td / 2);
    ctx.lineTo(ox, oy - td / 2);
    ctx.closePath();
    ctx.fillStyle = shadeColor(b.color, -15);
    ctx.fill();
    ctx.stroke();

    // Top face
    ctx.beginPath();
    ctx.moveTo(ox - tw / 2, oy - bh);
    ctx.lineTo(ox, oy - bh - td / 2);
    ctx.lineTo(ox + tw / 2, oy - bh);
    ctx.lineTo(ox, oy - bh + td / 2);
    ctx.closePath();
    ctx.fillStyle = b.color;
    ctx.fill();
    ctx.strokeStyle = b.glowColor + '60';
    ctx.stroke();

    // Windows grid on left face
    const wRows = Math.floor(b.floors * 0.8);
    const wCols = b.w * 2;
    for (let wr = 0; wr < wRows; wr++) {
      for (let wc = 0; wc < wCols; wc++) {
        const lit = Math.random() > 0.3;
        if (!lit) continue;
        const wx = ox - tw / 2 + (wc + 0.5) * (tw / 2 / wCols);
        const wy = oy - 10 - wr * 12;
        const wp = 4; const wh2 = 6;
        ctx.fillStyle = b.glowColor + 'AA';
        ctx.fillRect(wx - wp / 2, wy - wh2, wp, wh2);
      }
    }

    // Glow aura
    ctx.save();
    ctx.globalAlpha = 0.12 * pulse;
    const grad = ctx.createRadialGradient(ox, oy - bh / 2, 0, ox, oy - bh / 2, 80);
    grad.addColorStop(0, b.glowColor);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(ox - 80, oy - bh - 20, 160, bh + 40);
    ctx.restore();

    // Label
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = b.glowColor;
    ctx.shadowColor = b.glowColor;
    ctx.shadowBlur = 8;
    ctx.fillText(`${b.icon} ${b.label}`, ox, oy - bh - td / 2 - 8);
    ctx.restore();
  }

  function drawPlayer() {
    const [cx, cy] = canvasCenter();
    const [sx, sy] = toScreen(player.gridX, player.gridY);
    const ox = cx + sx - camX;
    const oy = cy + sy - camY;

    const t = Date.now() / 1000;
    const bob = player.moving ? Math.sin(t * 10) * 3 : 0;
    const py = oy - 24 + bob;

    // Shadow
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.ellipse(ox, oy, 16, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.restore();

    // Body
    ctx.save();
    // Glow
    ctx.shadowColor = '#D4AF37';
    ctx.shadowBlur = 20;

    // Legs
    const legPhase = player.moving ? Math.sin(t * 10) : 0;
    ctx.fillStyle = '#1a3a6a';
    ctx.fillRect(ox - 7, py + 18, 6, 10 + legPhase * 2);
    ctx.fillRect(ox + 1, py + 18, 6, 10 - legPhase * 2);

    // Body coat
    ctx.fillStyle = '#2a5a9a';
    ctx.beginPath();
    ctx.roundRect(ox - 9, py + 8, 18, 14, 3);
    ctx.fill();

    // Glowing chest emblem
    ctx.fillStyle = '#D4AF37';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(ox, py + 15, 4, 0, Math.PI * 2);
    ctx.fill();

    // Arms
    const armSwing = player.moving ? Math.sin(t * 10) * 5 : 0;
    ctx.fillStyle = '#2a5a9a';
    ctx.fillRect(ox - 14, py + 9 + armSwing, 6, 10);
    ctx.fillRect(ox + 8, py + 9 - armSwing, 6, 10);

    // Head
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#D4B896';
    ctx.beginPath();
    ctx.ellipse(ox, py + 3, 9, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Visor/helmet
    ctx.fillStyle = '#1a3a6a';
    ctx.beginPath();
    ctx.roundRect(ox - 8, py - 5, 16, 10, [8, 8, 0, 0]);
    ctx.fill();

    // Visor glow
    ctx.fillStyle = '#D4AF37';
    ctx.shadowColor = '#D4AF37';
    ctx.shadowBlur = 10;
    ctx.fillRect(ox - 6, py - 2, 12, 4);

    ctx.restore();
  }

  function shadeColor(hex: string, pct: number): string {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, ((n >> 16) & 0xff) + pct));
    const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + pct));
    const b = Math.max(0, Math.min(255, (n & 0xff) + pct));
    return `rgb(${r},${g},${b})`;
  }

  // ── Tile color ────────────────────────────────────────────────────────────────
  function tileColor(type: number, col: number, row: number): string {
    const t = Date.now() / 5000;
    switch (type) {
      case 1: return `hsl(${140 + Math.sin(col * 0.5 + t) * 10},${30 + Math.sin(row * 0.3) * 10}%,${12 + Math.sin(col + row) * 2}%)`;
      case 2: return `hsl(${220 + Math.sin(t + col) * 5},50%,14%)`;
      default: return `hsl(${215 + Math.sin(col * 0.2 + row * 0.3 + t) * 3},${20 + Math.sin(col + row) * 5}%,${10 + Math.sin(col * row * 0.1) * 2}%)`;
    }
  }

  // ── Road markings ─────────────────────────────────────────────────────────────
  function drawRoadLines(col: number, row: number) {
    const [cx, cy] = canvasCenter();
    const [sx, sy] = toScreen(col + 0.5, row + 0.5);
    const ox = cx + sx - camX;
    const oy = cy + sy - camY;
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(ox - TILE_W * 0.3, oy);
    ctx.lineTo(ox + TILE_W * 0.3, oy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // ── Movement & collision ──────────────────────────────────────────────────────
  const SPEED = 0.07;

  function isWalkable(gx: number, gy: number): boolean {
    const col = Math.floor(gx);
    const row = Math.floor(gy);
    if (col < 0 || row < 0 || col >= GRID_COLS || row >= GRID_ROWS) return false;
    if (blocked.has(`${col},${row}`)) return false;
    return true;
  }

  function update() {
    let dx = 0, dy = 0;
    if (keys['ArrowUp']    || keys['w'] || keys['W']) { dx -= 1; dy -= 1; }
    if (keys['ArrowDown']  || keys['s'] || keys['S']) { dx += 1; dy += 1; }
    if (keys['ArrowLeft']  || keys['a'] || keys['A']) { dx -= 1; dy += 1; }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) { dx += 1; dy -= 1; }

    // Joystick
    if (joystick.active) {
      const jd = Math.hypot(joystick.dx, joystick.dy);
      if (jd > 10) {
        dx += joystick.dx / jd;
        dy += joystick.dy / jd;
      }
    }

    const len = Math.hypot(dx, dy);
    player.moving = len > 0.01;

    if (len > 0) {
      dx /= len; dy /= len;
      const nx = player.gridX + dx * SPEED;
      const ny = player.gridY + dy * SPEED;
      if (isWalkable(nx, player.gridY)) player.gridX = nx;
      if (isWalkable(player.gridX, ny)) player.gridY = ny;

      // Direction
      const angle = Math.atan2(dy, dx);
      const dirs: Array<['n'|'ne'|'e'|'se'|'s'|'sw'|'w'|'nw', number]> = [
        ['e', 0], ['se', Math.PI/4], ['s', Math.PI/2], ['sw', 3*Math.PI/4],
        ['w', Math.PI], ['nw', -3*Math.PI/4], ['n', -Math.PI/2], ['ne', -Math.PI/4]
      ];
      let best = 'se' as typeof player.dir, bestDiff = Infinity;
      for (const [d, a] of dirs) {
        const diff = Math.abs(((angle - a + 3*Math.PI) % (2*Math.PI)) - Math.PI);
        if (diff < bestDiff) { bestDiff = diff; best = d; }
      }
      player.dir = best;
    }

    // Camera follows player
    const [sx, sy] = toScreen(player.gridX, player.gridY);
    camX += (sx - camX) * 0.08;
    camY += (sy - camY) * 0.08;

    // Building proximity check
    checkBuildingProximity();
  }

  let nearBuilding = $state<Building | null>(null);

  function checkBuildingProximity() {
    let closest: Building | null = null;
    let closestDist = Infinity;
    for (const b of buildings) {
      const bCx = b.col + b.w / 2;
      const bCy = b.row + b.h / 2;
      const dist = Math.hypot(player.gridX - bCx, player.gridY - bCy);
      if (dist < 3 && dist < closestDist) {
        closestDist = dist;
        closest = b;
      }
    }
    nearBuilding = closest;
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  function render() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, '#030812');
    sky.addColorStop(0.5, '#050e1f');
    sky.addColorStop(1, '#0a1428');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    const t = Date.now() / 1000;
    ctx.save();
    for (let i = 0; i < 80; i++) {
      const sx = ((i * 137.508 + 50) % canvas.width);
      const sy = ((i * 97.3 + 30) % (canvas.height * 0.6));
      const alpha = 0.3 + 0.7 * Math.abs(Math.sin(t * 0.5 + i));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#fff';
      ctx.fillRect(sx, sy, 1, 1);
    }
    ctx.restore();

    // Sort render order: tiles first, then buildings (painter's algo by row+col)
    // Draw ground tiles
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const type = tilemap[row][col];
        const color = tileColor(type, col, row);
        drawTile(col, row, color);
        if (type === 0) drawRoadLines(col, row);
      }
    }

    // Draw grid lines (city block lines)
    ctx.save();
    ctx.globalAlpha = 0.05;
    for (let row = 0; row <= GRID_ROWS; row++) {
      for (let col = 0; col <= GRID_COLS; col++) {
        const [cx2, cy2] = canvasCenter();
        const [sx, sy] = toScreen(col, row);
        const ox = cx2 + sx - camX;
        const oy = cy2 + sy - camY;
        ctx.beginPath();
        ctx.arc(ox, oy, 1, 0, Math.PI * 2);
        ctx.fillStyle = '#D4AF37';
        ctx.fill();
      }
    }
    ctx.restore();

    // Draw buildings sorted by row+col (painter's algorithm)
    const sorted = [...buildings].sort((a, b) => (a.col + a.row) - (b.col + b.row));
    for (const b of sorted) {
      drawBuilding(b);
    }

    // Player
    drawPlayer();

    // Proximity indicator
    if (nearBuilding) {
      const [cx2, cy2] = canvasCenter();
      const [sx, sy] = toScreen(nearBuilding.col + nearBuilding.w / 2, nearBuilding.row + nearBuilding.h / 2);
      const ox = cx2 + sx - camX;
      const oy = cy2 + sy - camY;

      const pulse = 0.7 + 0.3 * Math.sin(t * 4);
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = nearBuilding.glowColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ox, oy - nearBuilding.floors * 14 - 20, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '10px monospace';
      ctx.fillStyle = nearBuilding.glowColor;
      ctx.textAlign = 'center';
      ctx.fillText('[E] ENTER', ox, oy - nearBuilding.floors * 14 - 34);
      ctx.restore();
    }
  }

  // ── Game loop ─────────────────────────────────────────────────────────────────
  function loop() {
    if (!running) return;
    update();
    render();
    animFrame = requestAnimationFrame(loop);
  }

  // ── Joystick ──────────────────────────────────────────────────────────────────
  const joystick = { active: false, startX: 0, startY: 0, dx: 0, dy: 0 };
  let joystickPos = $state({ x: 0, y: 0, knobX: 0, knobY: 0, visible: false });

  function joystickStart(x: number, y: number) {
    joystick.active = true;
    joystick.startX = x;
    joystick.startY = y;
    joystick.dx = 0;
    joystick.dy = 0;
    joystickPos = { x, y, knobX: x, knobY: y, visible: true };
  }

  function joystickMove(x: number, y: number) {
    if (!joystick.active) return;
    const dx = x - joystick.startX;
    const dy = y - joystick.startY;
    const dist = Math.min(Math.hypot(dx, dy), 40);
    const angle = Math.atan2(dy, dx);
    joystick.dx = Math.cos(angle) * dist;
    joystick.dy = Math.sin(angle) * dist;
    joystickPos = { ...joystickPos, knobX: joystick.startX + joystick.dx, knobY: joystick.startY + joystick.dy };
  }

  function joystickEnd() {
    joystick.active = false;
    joystick.dx = 0;
    joystick.dy = 0;
    joystickPos = { ...joystickPos, visible: false };
  }

  // ── Resize ────────────────────────────────────────────────────────────────────
  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // ── Enter building ────────────────────────────────────────────────────────────
  function enterBuilding() {
    if (!nearBuilding) return;
    popup = { section: nearBuilding.section, color: nearBuilding.glowColor };
  }

  function closePopup() {
    popup = null;
  }

  function goToPortfolio(section: string) {
    if (section === 'lobby') {
      goto('/');
    } else {
      goto(`/#${section}`);
    }
  }

  // ── Popup content ─────────────────────────────────────────────────────────────
  const sectionData: Record<string, { title: string; desc: string; icon: string; action: string }> = {
    lobby:      { title: 'Main Lobby',          icon: '🏛️', desc: 'Welcome to the Digital City. This is the main hub — return to the portfolio homepage.',                          action: 'Go to Portfolio' },
    experience: { title: 'Experience Tower',     icon: '💼', desc: 'Full-Stack Developer at Nova Bitara Development. IT Executive at Tenaga Nasional Berhad (TNB). 3+ years of professional experience.',    action: 'View Experience' },
    projects:   { title: 'Projects Hub',         icon: '🚀', desc: '5 production-grade projects: IWA Employee Portal, Infinity Website, E-Commerce Platform, OnBoardX Mobile App, UTM FYP.',                  action: 'View Projects' },
    skills:     { title: 'Skills Core',          icon: '⚡', desc: 'SvelteKit, TypeScript, Flutter, Laravel, Supabase, Firebase, Azure, Docker — and more. Full-stack with DevOps capabilities.',            action: 'View Skills' },
    contact:    { title: 'Communications Hub',   icon: '📡', desc: 'Available for freelance and full-time opportunities. Based in Puchong, Selangor. Open to remote or hybrid work.',                         action: 'Contact Me' },
    about:      { title: 'About Zone',           icon: '👤', desc: 'Muhammed Munir Bin Mohd Azmi — Full-Stack Developer & IT Professional. Fresh, passionate, and driven to build impactful software.',      action: 'View About' },
  };

  onMount(() => {
    ctx = canvas.getContext('2d')!;
    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('keydown', (e) => {
      keys[e.key] = true;
      if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') enterBuilding();
      if (e.key === 'Escape') closePopup();
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => { keys[e.key] = false; });

    // Touch joystick
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      joystickStart(touch.clientX, touch.clientY);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      joystickMove(touch.clientX, touch.clientY);
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      joystickEnd();
    }, { passive: false });

    loop();
  });

  onDestroy(() => {
    running = false;
    cancelAnimationFrame(animFrame);
    window.removeEventListener('resize', resize);
  });
</script>

<svelte:head>
  <title>City Explorer | Muhammed Munir Portfolio</title>
</svelte:head>

<div class="city-wrapper">
  <!-- Canvas -->
  <canvas bind:this={canvas}></canvas>

  <!-- HUD top-left -->
  <div class="hud-top-left">
    <div class="hud-logo">
      <span class="hud-dot"></span>
      <span>CITY.EXE</span>
    </div>
    <div class="hud-coords">
      {Math.floor(player.gridX)}, {Math.floor(player.gridY)}
    </div>
  </div>

  <!-- HUD top-right -->
  <div class="hud-top-right">
    <a href="/" class="hud-btn">← Portfolio</a>
    <a href="/games" class="hud-btn">🎮 Games</a>
  </div>

  <!-- Controls hint bottom-left -->
  <div class="controls-hint">
    <span class="key">WASD</span> / <span class="key">↑↓←→</span> Move &nbsp;·&nbsp; <span class="key">E</span> Enter
  </div>

  <!-- Near building: Enter prompt (desktop) -->
  {#if nearBuilding && !popup}
    <div class="enter-prompt" style="--glow: {nearBuilding.glowColor}">
      <span class="enter-icon">{nearBuilding.icon}</span>
      <span><strong>{nearBuilding.label}</strong> — Press <kbd>E</kbd> to enter</span>
    </div>
  {/if}

  <!-- Mobile Enter button -->
  {#if nearBuilding && !popup}
    <button class="mobile-enter-btn" style="border-color: {nearBuilding.glowColor}; color: {nearBuilding.glowColor}" onclick={enterBuilding}>
      {nearBuilding.icon} ENTER
    </button>
  {/if}

  <!-- Virtual joystick overlay (mobile) -->
  {#if joystickPos.visible}
    <div
      class="joystick-base"
      style="left: {joystickPos.x}px; top: {joystickPos.y}px"
    ></div>
    <div
      class="joystick-knob"
      style="left: {joystickPos.knobX}px; top: {joystickPos.knobY}px"
    ></div>
  {/if}

  <!-- Popup -->
  {#if popup}
    {@const data = sectionData[popup.section]}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="popup-overlay" onclick={closePopup}>
      <div class="popup-card" style="--glow: {popup.color}" onclick={(e) => e.stopPropagation()}>
        <button class="popup-close" onclick={closePopup} aria-label="Close">✕</button>
        <div class="popup-icon">{data.icon}</div>
        <h2 class="popup-title">{data.title}</h2>
        <p class="popup-desc">{data.desc}</p>
        <div class="popup-actions">
          <button class="popup-btn primary" onclick={() => goToPortfolio(popup!.section)}>
            {data.action} →
          </button>
          <button class="popup-btn secondary" onclick={closePopup}>
            Stay in City
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0; padding: 0; overflow: hidden;
    background: #030812;
  }

  .city-wrapper {
    position: fixed;
    inset: 0;
    overflow: hidden;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
    cursor: crosshair;
    touch-action: none;
  }

  /* ── HUD ───────────────────────────────────────────────────────────────────── */
  .hud-top-left {
    position: fixed;
    top: 1rem; left: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .hud-logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'Courier New', monospace;
    font-size: 0.85rem;
    font-weight: 700;
    color: #D4AF37;
    letter-spacing: 0.15em;
    text-shadow: 0 0 12px #D4AF37;
  }

  .hud-dot {
    width: 8px; height: 8px;
    background: #22C55E;
    border-radius: 50%;
    box-shadow: 0 0 8px #22C55E;
    animation: blink 1.5s infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .hud-coords {
    font-family: 'Courier New', monospace;
    font-size: 0.72rem;
    color: rgba(212, 175, 55, 0.5);
    letter-spacing: 0.1em;
    margin-left: 1.2rem;
  }

  .hud-top-right {
    position: fixed;
    top: 1rem; right: 1rem;
    display: flex;
    gap: 0.5rem;
  }

  .hud-btn {
    background: rgba(10, 20, 35, 0.85);
    border: 1px solid rgba(212, 175, 55, 0.3);
    color: #D4AF37;
    font-family: 'Courier New', monospace;
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.45rem 0.9rem;
    border-radius: 6px;
    text-decoration: none;
    letter-spacing: 0.05em;
    transition: background 0.2s, border-color 0.2s;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .hud-btn:hover {
    background: rgba(212, 175, 55, 0.12);
    border-color: rgba(212, 175, 55, 0.6);
  }

  .controls-hint {
    position: fixed;
    bottom: 1rem; left: 1rem;
    font-family: 'Courier New', monospace;
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.35);
    pointer-events: none;
  }

  .key {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    padding: 0.1rem 0.35rem;
    font-family: 'Courier New', monospace;
    font-size: 0.68rem;
    color: rgba(212, 175, 55, 0.7);
  }

  /* ── Enter prompt ──────────────────────────────────────────────────────────── */
  .enter-prompt {
    position: fixed;
    bottom: 3.5rem; left: 50%;
    transform: translateX(-50%);
    background: rgba(10, 20, 35, 0.92);
    border: 1px solid var(--glow);
    border-radius: 10px;
    padding: 0.6rem 1.4rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-family: 'Courier New', monospace;
    font-size: 0.82rem;
    color: #e0e0e0;
    box-shadow: 0 0 20px color-mix(in srgb, var(--glow) 30%, transparent);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    animation: fadeUp 0.2s ease;
    pointer-events: none;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateX(-50%) translateY(6px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  .enter-icon { font-size: 1.1rem; }

  kbd {
    background: rgba(212, 175, 55, 0.15);
    border: 1px solid rgba(212, 175, 55, 0.4);
    border-radius: 4px;
    padding: 0.1rem 0.4rem;
    font-family: 'Courier New', monospace;
    font-size: 0.75rem;
    color: #D4AF37;
  }

  /* ── Mobile enter button ───────────────────────────────────────────────────── */
  .mobile-enter-btn {
    display: none;
    position: fixed;
    bottom: 2rem; right: 1rem;
    background: rgba(10, 20, 35, 0.9);
    border: 2px solid;
    border-radius: 12px;
    padding: 0.75rem 1.5rem;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    cursor: pointer;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    animation: fadeUp 0.2s ease;
  }

  /* ── Joystick ──────────────────────────────────────────────────────────────── */
  .joystick-base {
    position: fixed;
    width: 80px; height: 80px;
    background: rgba(212, 175, 55, 0.08);
    border: 2px solid rgba(212, 175, 55, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .joystick-knob {
    position: fixed;
    width: 36px; height: 36px;
    background: rgba(212, 175, 55, 0.4);
    border: 2px solid rgba(212, 175, 55, 0.8);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    box-shadow: 0 0 12px rgba(212, 175, 55, 0.4);
  }

  /* ── Popup ─────────────────────────────────────────────────────────────────── */
  .popup-overlay {
    position: fixed;
    inset: 0;
    background: rgba(3, 8, 18, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .popup-card {
    background: #0a1428;
    border: 1px solid var(--glow);
    border-radius: 16px;
    padding: 2.5rem;
    max-width: 460px;
    width: 90vw;
    position: relative;
    box-shadow: 0 0 60px color-mix(in srgb, var(--glow) 20%, transparent),
                0 30px 80px rgba(0, 0, 0, 0.6);
    animation: cardIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes cardIn {
    from { opacity: 0; transform: scale(0.88); }
    to   { opacity: 1; transform: scale(1); }
  }

  .popup-close {
    position: absolute;
    top: 1rem; right: 1rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.5);
    width: 32px; height: 32px;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s, color 0.2s;
  }

  .popup-close:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }

  .popup-icon {
    font-size: 2.8rem;
    margin-bottom: 0.75rem;
    display: block;
  }

  .popup-title {
    font-family: 'Courier New', monospace;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--glow);
    margin: 0 0 1rem;
    text-shadow: 0 0 20px color-mix(in srgb, var(--glow) 50%, transparent);
  }

  .popup-desc {
    font-family: 'Courier New', monospace;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.75;
    margin: 0 0 2rem;
  }

  .popup-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .popup-btn {
    flex: 1;
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    font-family: 'Courier New', monospace;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;
    border: none;
    min-width: 120px;
  }

  .popup-btn.primary {
    background: var(--glow);
    color: #030812;
    box-shadow: 0 0 20px color-mix(in srgb, var(--glow) 40%, transparent);
  }

  .popup-btn.primary:hover {
    box-shadow: 0 0 30px color-mix(in srgb, var(--glow) 60%, transparent);
    filter: brightness(1.1);
  }

  .popup-btn.secondary {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.6);
  }

  .popup-btn.secondary:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  /* ── Mobile ────────────────────────────────────────────────────────────────── */
  @media (max-width: 640px) {
    .controls-hint { display: none; }
    .enter-prompt  { display: none; }
    .mobile-enter-btn { display: block; }

    .hud-btn { font-size: 0.7rem; padding: 0.4rem 0.7rem; }

    .popup-card { padding: 1.75rem 1.25rem; }
    .popup-title { font-size: 1.15rem; }
    .popup-btn { padding: 0.65rem 1rem; font-size: 0.8rem; }
  }
</style>
