<script lang="ts">
  import { onMount } from 'svelte';
  import { lang, toggleLang } from '$lib/i18n';
  import { translations } from '$lib/translations';

  // ─── Room system types ───
  type RoomId = 'lobby' | 'experience' | 'projects' | 'skills' | 'contact';

  interface Hotspot {
    x: number; y: number; w: number; h: number;
    label: string; icon: string;
    content: { title: string; body: string; tags?: string[] };
  }

  interface Door {
    x: number; y: number; w: number; h: number;
    to: RoomId; label: string;
  }

  interface Obstacle {
    x: number; y: number; w: number; h: number;
    name: string;
  }

  interface Room {
    id: RoomId; name: string; icon: string;
    bg: string; accent: string; themeColor: string;
    description: string;
    hotspots: Hotspot[];
    doors: Door[];
    obstacles: Obstacle[];
  }

  const t = $derived(translations[$lang]);

  // ─── High Fidelity Room Definitions (Cyberpunk Spaceship / Lab layout) ───
  const rooms = $derived<Record<RoomId, Room>>({
    lobby: {
      id: 'lobby',
      name: $lang === 'ms' ? 'Pusat Kawalan Utama' : 'Command Bridge',
      icon: '🛸',
      bg: '#050c18',
      accent: '#D4AF37',
      themeColor: 'rgba(212, 175, 55, 0.4)',
      description: $lang === 'ms' ? 'Selamat Datang ke RPG Portfolio Muhammed Munir.' : 'Welcome to Muhammed Munir\'s Interactive RPG Portfolio.',
      hotspots: [
        {
          x: 44, y: 36, w: 12, h: 12,
          label: $lang === 'ms' ? 'Hologram Saya' : 'My Hologram',
          icon: '👤',
          content: {
            title: 'Muhammed Munir Bin Mohd Azmi',
            body: $lang === 'ms'
              ? 'Pembangun Full-Stack & Profesional IT yang berdedikasi tinggi. Pakar dalam membina sistem perusahaan yang selamat, berskala, dan dioptimumkan dengan baik.'
              : 'Full-Stack Developer & IT Professional. Specializing in secure, scalable, and optimized enterprise systems.',
            tags: ['Full-Stack', 'Cybersecurity', 'Network Security']
          }
        },
        {
          x: 10, y: 44, w: 10, h: 10,
          label: $lang === 'ms' ? 'Konsol Manual' : 'Guide Terminal',
          icon: '📋',
          content: {
            title: $lang === 'ms' ? 'Manual Protokol Sistem' : 'System Protocol Manual',
            body: $lang === 'ms'
              ? '• Bergerak menggunakan WASD atau Arrow Keys di keyboard untuk mengemudi avatar MM.\n• Klik di mana-mana atas lantai digital untuk mengarahkan perjalanan secara pintar.\n• Berjalan dekat atau klik objek neon bercahaya untuk memecah fail sulit (inspect).\n• Berjalan dekat atau klik portal teleporter bercahaya untuk melompat ke dimensi/bilik lain!'
              : '• Move using WASD or Arrow Keys on your keyboard to navigate avatar MM.\n• Click anywhere on the digital floor to walk to that coordinate automatically.\n• Walk close or click glowing neon elements to decrypt secure files (inspect).\n• Walk close or click circular teleporter vortexes to warp to other rooms!'
          }
        }
      ],
      doors: [
        { x: 8, y: 15, w: 10, h: 12, to: 'experience', label: $lang === 'ms' ? '🏢 Pengalaman' : '🏢 Experience' },
        { x: 82, y: 15, w: 10, h: 12, to: 'projects', label: $lang === 'ms' ? '💻 Projek' : '💻 Projects' },
        { x: 8, y: 72, w: 10, h: 12, to: 'skills', label: $lang === 'ms' ? '⚡ Kemahiran' : '⚡ Skills' },
        { x: 82, y: 72, w: 10, h: 12, to: 'contact', label: $lang === 'ms' ? '📬 Perhubungan' : '📬 Contact' }
      ],
      obstacles: [
        { x: 26, y: 25, w: 4, h: 48, name: 'Core Divider L' },
        { x: 70, y: 25, w: 4, h: 48, name: 'Core Divider R' },
        { x: 42, y: 55, w: 16, h: 6, name: 'Command Center console desk' }
      ]
    },
    experience: {
      id: 'experience',
      name: $lang === 'ms' ? 'Dewan Server Pengalaman' : 'Experience Vault',
      icon: '🏢',
      bg: '#04161b',
      accent: '#00ff88',
      themeColor: 'rgba(0, 255, 136, 0.4)',
      description: $lang === 'ms' ? 'Mengandungi fail-fail kritikal pengalaman korporat & sekuriti.' : 'Accessing critical archives of corporate work & cybersecurity threat response.',
      hotspots: [
        {
          x: 6, y: 15, w: 12, h: 16,
          label: 'YHCM Sdn Bhd',
          icon: '💼',
          content: {
            title: `YHCM Sdn Bhd — ${t.exp.yhcm.role}`,
            body: `${t.exp.yhcm.desc}\n\n${$lang === 'ms' ? 'Sorotan Utama:' : 'Key Highlights:'}\n${t.exp.yhcm.highlights.map(h => `• ${h}`).join('\n')}`,
            tags: ['Vue.js', 'Laravel Filament', 'MySQL', 'Docker']
          }
        },
        {
          x: 82, y: 15, w: 12, h: 16,
          label: 'Nova Ardent',
          icon: '🚀',
          content: {
            title: `Nova Ardent — ${t.exp.nova.role}`,
            body: `${t.exp.nova.desc}\n\n${$lang === 'ms' ? 'Sorotan Utama:' : 'Key Highlights:'}\n${t.exp.nova.highlights.map(h => `• ${h}`).join('\n')}`,
            tags: ['SvelteKit', 'Supabase', 'Redis', 'Cloudflare']
          }
        },
        {
          x: 6, y: 48, w: 12, h: 16,
          label: 'TNB Protégé',
          icon: '⚡',
          content: {
            title: `TNB Protégé — ${t.exp.tnb_protege.role}`,
            body: `${t.exp.tnb_protege.desc}\n\n${$lang === 'ms' ? 'Sorotan Utama:' : 'Key Highlights:'}\n${t.exp.tnb_protege.highlights.map(h => `• ${h}`).join('\n')}`,
            tags: ['Flutter', 'Azure', 'Jenkins', 'Kubernetes']
          }
        },
        {
          x: 82, y: 48, w: 12, h: 16,
          label: 'TNB Cyber',
          icon: '🛡️',
          content: {
            title: `TNB Cyber — ${t.exp.tnb_cyber.role}`,
            body: `${t.exp.tnb_cyber.desc}\n\n${$lang === 'ms' ? 'Sorotan Utama:' : 'Key Highlights:'}\n${t.exp.tnb_cyber.highlights.map(h => `• ${h}`).join('\n')}`,
            tags: ['Splunk SIEM', 'Vulhub', 'Red Team', 'Blue Team']
          }
        }
      ],
      doors: [
        { x: 44, y: 82, w: 12, h: 12, to: 'lobby', label: $lang === 'ms' ? '🏠 Kembali ke Lobi' : '🏠 Back to Lobby' }
      ],
      obstacles: [
        { x: 22, y: 10, w: 8, h: 60, name: 'Mainframe Server Rack Alpha' },
        { x: 70, y: 10, w: 8, h: 60, name: 'Mainframe Server Rack Beta' }
      ]
    },
    projects: {
      id: 'projects',
      name: $lang === 'ms' ? 'Makmal Projek Mega' : 'Projects Prototyping Lab',
      icon: '💻',
      bg: '#0e0b1c',
      accent: '#a78bfa',
      themeColor: 'rgba(167, 139, 250, 0.4)',
      description: $lang === 'ms' ? 'Mengaktifkan simulasi projek berskala tinggi.' : 'Launching simulated workstations of advanced dynamic projects.',
      hotspots: [
        {
          x: 6, y: 12, w: 12, h: 18,
          label: 'Loan System',
          icon: '🏦',
          content: {
            title: t.projects.iwa001.title,
            body: `${t.projects.iwa001.desc}\n\n${$lang === 'ms' ? 'Ciri-Ciri Utama:' : 'Key Features:'}\n${t.projects.iwa001.features.map(f => `• ${f}`).join('\n')}`,
            tags: ['Supabase RLS', 'JWT', 'Admin Panel', 'Vercel']
          }
        },
        {
          x: 82, y: 12, w: 12, h: 18,
          label: 'Infinity World',
          icon: '🌍',
          content: {
            title: t.projects.infinity.title,
            body: `${t.projects.infinity.desc}\n\n${$lang === 'ms' ? 'Ciri-Ciri Utama:' : 'Key Features:'}\n${t.projects.infinity.features.map(f => `• ${f}`).join('\n')}`,
            tags: ['Svelte Store i18n', 'Redis', 'Resend API', 'Vercel']
          }
        },
        {
          x: 6, y: 46, w: 12, h: 18,
          label: 'E-Commerce',
          icon: '🛒',
          content: {
            title: t.projects.ecommerce.title,
            body: `${t.projects.ecommerce.desc}\n\n${$lang === 'ms' ? 'Ciri-Ciri Utama:' : 'Key Features:'}\n${t.projects.ecommerce.features.map(f => `• ${f}`).join('\n')}`,
            tags: ['Laravel MVC', 'MySQL', 'DirectAdmin', 'Cloudflare']
          }
        },
        {
          x: 82, y: 46, w: 12, h: 18,
          label: 'FYP UTM',
          icon: '🎓',
          content: {
            title: t.projects.fyp.title,
            body: `${t.projects.fyp.desc}\n\n${$lang === 'ms' ? 'Ciri-Ciri Utama:' : 'Key Features:'}\n${t.projects.fyp.features.map(f => `• ${f}`).join('\n')}`,
            tags: ['Google Maps API', 'SvelteKit', 'Supabase PostgreSQL']
          }
        }
      ],
      doors: [
        { x: 44, y: 82, w: 12, h: 12, to: 'lobby', label: $lang === 'ms' ? '🏠 Kembali ke Lobi' : '🏠 Back to Lobby' }
      ],
      obstacles: [
        { x: 30, y: 15, w: 40, h: 8, name: 'Prototyping Desk Horizontal' },
        { x: 30, y: 55, w: 40, h: 8, name: 'Lab Hardware Rack Horizontal' }
      ]
    },
    skills: {
      id: 'skills',
      name: $lang === 'ms' ? 'Gelanggang Pangkalan Data' : 'Skills & Tech Arena',
      icon: '⚡',
      bg: '#140c02',
      accent: '#E5A93B',
      themeColor: 'rgba(229, 169, 59, 0.4)',
      description: $lang === 'ms' ? 'Kemahiran bertimbun diuji & disusun secara holistik.' : 'Analyzing stacked database logs and structural components.',
      hotspots: [
        {
          x: 8, y: 12, w: 12, h: 22,
          label: t.skills.frontend,
          icon: '🎨',
          content: {
            title: t.skills.frontend,
            body: `• Vue.js — Advanced (Production)\n• SvelteKit — Advanced (Production)\n• React.js — Intermediate\n• Flutter/Dart — Intermediate\n• HTML5/CSS3/JavaScript — Expert\n• Tailwind CSS — Advanced`,
            tags: ['Vue', 'SvelteKit', 'React', 'Flutter']
          }
        },
        {
          x: 44, y: 12, w: 12, h: 22,
          label: t.skills.backend,
          icon: '☁️',
          content: {
            title: t.skills.backend,
            body: `• Laravel — Advanced (Production)\n• Node.js — Intermediate\n• Supabase/PostgreSQL — Advanced\n• MySQL/MariaDB — Advanced\n• Firebase/MongoDB — Intermediate\n• Docker — Intermediate\n• Microsoft Azure — Intermediate\n• Vercel Edge — Advanced`,
            tags: ['Laravel', 'Supabase', 'Docker', 'Azure']
          }
        },
        {
          x: 80, y: 12, w: 12, h: 22,
          label: $lang === 'ms' ? 'Keselamatan & Rangkaian' : 'Security & Network',
          icon: '🛡️',
          content: {
            title: $lang === 'ms' ? 'Keselamatan & Rangkaian' : 'Security & Network',
            body: `• Splunk SIEM monitoring\n• Vulnerability assessment (Vulhub)\n• Red Team & Blue Team experience\n• Firewall configuration & VPN\n• Intrusion Detection Systems\n• Row Level Security (RLS)\n• JWT & session management`,
            tags: ['Splunk', 'SIEM', 'Ethical Hacking', 'RLS']
          }
        },
        {
          x: 15, y: 55, w: 70, h: 16,
          label: t.skills.edu_label,
          icon: '🎓',
          content: {
            title: t.skills.edu_label,
            body: `🎓 ${t.edu.degree.title} (${t.edu.degree.major})\n• ${t.edu.degree.period} | ${t.skills.cgpa}: 3.08\n• ${t.skills.fyp_label}: ${t.edu.degree.fyp_title}\n\n🎓 ${t.edu.diploma.title}\n• ${t.edu.diploma.period} | ${t.skills.cgpa}: 3.31\n• ${t.skills.fyp_label}: ${t.edu.diploma.fyp_title}`,
            tags: ['UTM', 'Degree', 'Diploma']
          }
        }
      ],
      doors: [
        { x: 44, y: 82, w: 12, h: 12, to: 'lobby', label: $lang === 'ms' ? '🏠 Kembali ke Lobi' : '🏠 Back to Lobby' }
      ],
      obstacles: [
        { x: 26, y: 40, w: 48, h: 5, name: 'Skill Vault Separation Rail' }
      ]
    },
    contact: {
      id: 'contact',
      name: $lang === 'ms' ? 'Pencawang Hubungan' : 'Communication Center',
      icon: '📬',
      bg: '#040b17',
      accent: '#60a5fa',
      themeColor: 'rgba(96, 165, 250, 0.4)',
      description: $lang === 'ms' ? 'Membuka talian terus ke dunia luar.' : 'Establishing digital links and secure socket lines.',
      hotspots: [
        {
          x: 10, y: 35, w: 20, h: 22,
          label: $lang === 'ms' ? 'Info Perhubungan' : 'Contact Info',
          icon: '📧',
          content: {
            title: t.contact.title,
            body: `• ${t.contact.email_label}: muhammedmunir@outlook.com\n• ${$lang === 'ms' ? 'Lokasi' : 'Location'}: Kuala Lumpur, Malaysia\n• Status: ${t.contact.avail_status} (${t.contact.avail_sub})`,
            tags: ['Email', 'Kuala Lumpur']
          }
        },
        {
          x: 70, y: 35, w: 20, h: 22,
          label: $lang === 'ms' ? 'Pautan Profesional' : 'Professional Links',
          icon: '🔗',
          content: {
            title: $lang === 'ms' ? 'Pautan Penting' : 'Important Links',
            body: `• GitHub: github.com/muhammedmunir\n• Portfolio: muhammedmunir.github.io\n• LinkedIn: ${$lang === 'ms' ? 'Disediakan atas permintaan' : 'Available on request'}`,
            tags: ['GitHub', 'Portfolio', 'LinkedIn']
          }
        }
      ],
      doors: [
        { x: 44, y: 82, w: 12, h: 12, to: 'lobby', label: $lang === 'ms' ? '🏠 Kembali ke Lobi' : '🏠 Back to Lobby' }
      ],
      obstacles: [
        { x: 40, y: 25, w: 20, h: 42, name: 'Central Subspace Satellite Dish Core' }
      ]
    }
  });

  // ─── Game Systems State ───
  let currentRoom = $state<RoomId>('lobby');
  let popup = $state<Hotspot['content'] | null>(null);
  let visited = $state<Set<string>>(new Set());
  let totalItems = $derived(Object.values(rooms).reduce((n, r) => n + r.hotspots.length, 0));
  let roomTransition = $state(false);

  // Avatar properties
  let playerX = $state(50);
  let playerY = $state(60);
  let activeHotspot = $state<Hotspot | null>(null);
  let activeDoor = $state<Door | null>(null);
  let wallCollisionActive = $state(false);

  // Hologram terminal logs
  let systemLogs = $state<string[]>([
    'MM_EXPLORER SYSTEM INITIALIZED...',
    'AWAITING INPUT: MOVEMENT CONTROLS ACTIVE [WASD/CLICK]'
  ]);

  function logMsg(msg: string) {
    systemLogs = [msg, ...systemLogs].slice(0, 3);
  }

  const room = $derived(rooms[currentRoom]);
  const progress = $derived(Math.round((visited.size / totalItems) * 100));

  function enterRoom(id: RoomId, fromDoor?: RoomId) {
    roomTransition = true;
    logMsg(`WARPING PORTAL ACTIVATED. TARGETING: ${rooms[id].name.toUpperCase()}`);
    setTimeout(() => {
      currentRoom = id;
      roomTransition = false;
      popup = null;
      activeHotspot = null;
      activeDoor = null;

      // Coordinate placement on entry
      if (id === 'lobby') {
        if (fromDoor === 'experience') { playerX = 14; playerY = 32; }
        else if (fromDoor === 'projects') { playerX = 86; playerY = 32; }
        else if (fromDoor === 'skills') { playerX = 14; playerY = 74; }
        else if (fromDoor === 'contact') { playerX = 86; playerY = 74; }
        else { playerX = 50; playerY = 62; }
      } else {
        playerX = 50; playerY = 76;
      }
      logMsg(`SYNCHRONIZED WITH ${rooms[id].name.toUpperCase()} DATALINKS.`);
    }, 300);
  }

  function interact(h: Hotspot) {
    const key = currentRoom + ':' + h.label;
    if (!visited.has(key)) {
      visited.add(key);
      visited = new Set(visited);
      logMsg(`SECURE METADATA LOADED: ${h.label.toUpperCase()}`);
    }
    popup = h.content;
  }

  function movePlayer(dx: number, dy: number) {
    if (popup) return;
    const newX = Math.max(2, Math.min(98, playerX + dx));
    const newY = Math.max(10, Math.min(92, playerY + dy));

    // Collision system with obstacles
    let hitObstacle = false;
    for (const obs of room.obstacles) {
      const ox1 = obs.x;
      const ox2 = obs.x + obs.w;
      const oy1 = obs.y;
      const oy2 = obs.y + obs.h;
      // Collision bounding box (expanding player radius slightly)
      if (newX >= ox1 - 2 && newX <= ox2 + 2 && newY >= oy1 - 2 && newY <= oy2 + 2) {
        hitObstacle = true;
        break;
      }
    }

    if (!hitObstacle) {
      playerX = newX;
      playerY = newY;
      checkCollisions();
    } else {
      logMsg(`COLLISION ALERT: ${$lang === 'ms' ? 'HALANGAN DIKESAN!' : 'OBSTACLE DETECTED!'}`);
      wallCollisionActive = true;
      setTimeout(() => { wallCollisionActive = false; }, 400);
    }
  }

  function checkCollisions() {
    activeHotspot = null;
    activeDoor = null;

    // Hotspot detection proximity radius
    for (const hs of room.hotspots) {
      const hx1 = hs.x;
      const hx2 = hs.x + hs.w;
      const hy1 = hs.y;
      const hy2 = hs.y + hs.h;
      if (playerX >= hx1 - 3 && playerX <= hx2 + 3 && playerY >= hy1 - 3 && playerY <= hy2 + 3) {
        activeHotspot = hs;
        break;
      }
    }

    // Door detection proximity radius
    if (!activeHotspot) {
      for (const door of room.doors) {
        const dx1 = door.x;
        const dx2 = door.x + door.w;
        const dy1 = door.y;
        const dy2 = door.y + door.h;
        if (playerX >= dx1 - 3 && playerX <= dx2 + 3 && playerY >= dy1 - 3 && playerY <= dy2 + 3) {
          activeDoor = door;
          break;
        }
      }
    }
  }

  let roomContainer: HTMLDivElement;

  function handleRoomClick(e: MouseEvent) {
    if (popup) return;
    const rect = roomContainer.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Move smoothly to click
    const steps = 10;
    let stepCount = 0;
    const dx = (clickX - playerX) / steps;
    const dy = (clickY - playerY) / steps;

    const interval = setInterval(() => {
      if (stepCount < steps && !popup) {
        movePlayer(dx, dy);
        stepCount++;
      } else {
        clearInterval(interval);
      }
    }, 15);
  }

  onMount(() => {
    function onKey(e: KeyboardEvent) {
      const step = 3.5;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        movePlayer(0, -step);
        e.preventDefault();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        movePlayer(0, step);
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        movePlayer(-step, 0);
        e.preventDefault();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        movePlayer(step, 0);
        e.preventDefault();
      } else if (e.key === ' ' || e.key === 'Enter' || e.key === 'e' || e.key === 'E') {
        if (activeHotspot) {
          interact(activeHotspot);
          e.preventDefault();
        } else if (activeDoor) {
          enterRoom(activeDoor.to, currentRoom);
          e.preventDefault();
        }
      } else if (e.key === 'Escape' && popup) {
        popup = null;
        e.preventDefault();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
</script>

<svelte:head>
  <title>Portfolio CyberRPG | Muhammed Munir</title>
  <meta name="description" content="Ultimate holographic 2D RPG exploration layout for Muhammed Munir's portfolio." />
</svelte:head>

<div class="game-wrapper" style="--accent:{room.accent}; --theme-color:{room.themeColor}; background:{room.bg}">
  <!-- High Tech Matrix Grid Backdrop -->
  <div class="crt-overlay"></div>
  <div class="scanlines"></div>
  <div class="starfield"></div>
  {#if wallCollisionActive}
    <div class="collision-flash-overlay"></div>
  {/if}

  <!-- Header HUD Panel -->
  <header class="hud-panel">
    <div class="hud-left" style="display: flex; gap: 0.8rem; align-items: center;">
      <a href="/" class="btn-terminal">
        <span class="hud-blink"></span> ESC // MAIN_PORTAL
      </a>
      <button class="btn-terminal" onclick={toggleLang} style="cursor: pointer; display: flex; align-items: center; gap: 0.3rem;">
        🌐 {$lang.toUpperCase()}
      </button>
    </div>
    
    <div class="hud-center">
      <h1 class="hud-title">
        <span class="title-glyph">{room.icon}</span> {room.name.toUpperCase()}
      </h1>
      <p class="hud-desc">{room.description}</p>
    </div>

    <div class="hud-right">
      <div class="sync-progress">
        <div class="progress-info">
          <span class="prog-text">DATA_SYNC_PROG</span>
          <span class="prog-val">{progress}%</span>
        </div>
        <div class="prog-bar-frame">
          <div class="prog-fill-neon" style="width:{progress}%"></div>
        </div>
      </div>
    </div>
  </header>

  <!-- Interactive Map Canvas -->
  <div
    bind:this={roomContainer}
    class="room-grid"
    class:transitioning={roomTransition}
    onclick={handleRoomClick}
    role="presentation"
  >
    <!-- Background dynamic layout grid -->
    <div class="tech-grid"></div>

    <!-- Solid Obstacles (Wall partitions, tables, hardware cores) -->
    {#each room.obstacles as obs}
      <div class="obstacle-node" style="left:{obs.x}%; top:{obs.y}%; width:{obs.w}%; height:{obs.h}%;">
        <div class="obs-inner">
          <span class="obs-warning">// SECURE_WALL //</span>
        </div>
      </div>
    {/each}

    <!-- Warp Portals (Doors) -->
    {#each room.doors as door}
      <button
        class="warp-portal"
        style="left:{door.x}%; top:{door.y}%; width:{door.w}%; height:{door.h}%;"
        onclick={(e) => { e.stopPropagation(); enterRoom(door.to, currentRoom); }}
      >
        <div class="portal-vortex">
          <div class="vortex-ring ring-1"></div>
          <div class="vortex-ring ring-2"></div>
        </div>
        <span class="portal-tag">{door.label.toUpperCase()}</span>
      </button>
    {/each}

    <!-- Datalink Nodes (Hotspots) -->
    {#each room.hotspots as hs}
      {@const key = currentRoom + ':' + hs.label}
      {@const seen = visited.has(key)}
      <button
        class="datalink-node"
        class:visited-node={seen}
        style="left:{hs.x}%; top:{hs.y}%; width:{hs.w}%; height:{hs.h}%;"
        onclick={(e) => { e.stopPropagation(); interact(hs); }}
      >
        <div class="node-glow"></div>
        <div class="node-core">
          <span class="node-icon">{hs.icon}</span>
          <span class="node-text">{hs.label.toUpperCase()}</span>
        </div>
        {#if seen}
          <div class="sync-check">SYNC_OK</div>
        {:else}
          <div class="node-scanner"></div>
        {/if}
      </button>
    {/each}

    <!-- Interactive Player Mech / Avatar -->
    <div class="player-mech" class:collision-shake={wallCollisionActive} style="left:{playerX}%; top:{playerY}%;">
      <div class="mech-radar"></div>
      <div class="mech-core" style={wallCollisionActive ? 'border-color: #ef4444; box-shadow: 0 0 15px #ef4444;' : ''}>
        <div class="mech-visor" style={wallCollisionActive ? 'background: #ef4444; box-shadow: 0 0 6px #ef4444;' : ''}></div>
        <span class="mech-initials">MM</span>
      </div>
      
      {#if wallCollisionActive}
        <div class="comm-tooltip collision-tooltip" style="border-color: #ef4444; box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);">
          <div class="tooltip-glitch" data-text="💥 BLOCKED!" style="color: #ef4444;">💥 {$lang === 'ms' ? 'SEKATAN!' : 'BLOCKED!'}</div>
        </div>
      {:else if activeHotspot}
        <div class="comm-tooltip">
          <div class="tooltip-glitch" data-text="[E] DECRYPT">[E] DECRYPT ARCHIVE</div>
        </div>
      {:else if activeDoor}
        <div class="comm-tooltip warp-tooltip">
          <div class="tooltip-glitch" data-text="[E] WARP">[E] WARP PORTAL</div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Bottom Console Panel (Quest Log & Minimap) -->
  <footer class="console-footer">
    <!-- Holographic system log terminal -->
    <div class="system-logs-box">
      <div class="logs-header">// SYSTEM_EVENT_LOG</div>
      <div class="logs-stream">
        {#each systemLogs as log}
          <div class="log-entry">> {log}</div>
        {/each}
      </div>
    </div>

    <!-- Quick Teleport Bridge (Minimap) -->
    <div class="quick-bridge">
      <span class="bridge-tag">DECK_WARP_BRIDGE:</span>
      <div class="bridge-btn-group">
        {#each Object.values(rooms) as r}
          <button
            class="bridge-btn"
            class:active-bridge={currentRoom === r.id}
            style="--bridge-accent:{r.accent}"
            onclick={() => enterRoom(r.id)}
            title={r.name}
          >
            {r.icon}
          </button>
        {/each}
      </div>
    </div>
  </footer>

  <!-- Holographic Terminal popup overlay -->
  {#if popup}
    <div class="terminal-overlay" onclick={() => popup = null} role="presentation">
      <div class="terminal-popup" onclick={(e) => e.stopPropagation()}>
        <div class="terminal-header">
          <div class="term-dots">
            <span class="term-dot dot-r"></span>
            <span class="term-dot dot-y"></span>
            <span class="term-dot dot-g"></span>
          </div>
          <span class="term-title">// SECURE_ARCHIVE_DECRYPTED</span>
          <button class="term-close-btn" onclick={() => popup = null}>CLOSE [X]</button>
        </div>
        
        <div class="terminal-display">
          <h2 class="archive-title">{popup.title}</h2>
          <div class="archive-body">
            {#each popup.body.split('\n') as line}
              <p class="archive-line">{line}</p>
            {/each}
          </div>
          
          {#if popup.tags}
            <div class="archive-tags-grid">
              {#each popup.tags as tag}
                <span class="archive-tag">{tag.toUpperCase()}</span>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Outfit:wght@400;600;800&display=swap');

  :global(body) {
    margin: 0;
    overflow: hidden;
    font-family: 'JetBrains Mono', monospace;
    background: #020617;
    color: #e2e8f0;
  }

  .game-wrapper {
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: background 0.5s ease, border-color 0.5s ease;
  }

  /* Scanlines & CRT Glitch Aesthetics */
  .crt-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, transparent 55%, rgba(0, 0, 0, 0.4) 100%);
    pointer-events: none;
    z-index: 99;
  }
  .scanlines {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      rgba(18, 16, 16, 0) 50%,
      rgba(0, 0, 0, 0.15) 50%
    );
    background-size: 100% 4px;
    pointer-events: none;
    z-index: 98;
  }
  .starfield {
    position: absolute;
    inset: 0;
    opacity: 0.1;
    background-image: 
      radial-gradient(1px 1px at 20px 30px, #fff, transparent),
      radial-gradient(1.5px 1.5px at 100px 150px, #fff, transparent),
      radial-gradient(1px 1px at 200px 80px, #fff, transparent);
    background-size: 300px 300px;
    pointer-events: none;
  }

  /* HUD Panel (Top Bar) */
  .hud-panel {
    background: rgba(4, 9, 20, 0.9);
    border-bottom: 2px solid var(--accent);
    box-shadow: 0 0 25px var(--theme-color);
    padding: 0.8rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 80;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
  .btn-terminal {
    font-family: 'JetBrains Mono', monospace;
    background: transparent;
    border: 1px solid var(--accent);
    color: var(--accent);
    padding: 0.4rem 1rem;
    font-weight: 700;
    font-size: 0.8rem;
    cursor: pointer;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  }
  .btn-terminal:hover {
    background: var(--accent);
    color: #000;
    box-shadow: 0 0 15px var(--accent);
  }
  .hud-blink {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    animation: simpleBlink 1.5s infinite;
  }
  @keyframes simpleBlink {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }
  .hud-center {
    text-align: center;
  }
  .hud-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.4rem;
    font-weight: 800;
    margin: 0;
    color: #ffffff;
    letter-spacing: 0.05em;
    text-shadow: 0 0 10px var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  .title-glyph {
    filter: drop-shadow(0 0 5px var(--accent));
  }
  .hud-desc {
    margin: 0.2rem 0 0 0;
    font-size: 0.72rem;
    color: #64748b;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .sync-progress {
    width: 180px;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .progress-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.65rem;
    font-weight: 700;
    color: #94a3b8;
  }
  .prog-val {
    color: var(--accent);
    text-shadow: 0 0 5px var(--accent);
  }
  .prog-bar-frame {
    height: 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    padding: 1px;
  }
  .prog-fill-neon {
    height: 100%;
    background: var(--accent);
    border-radius: 2px;
    box-shadow: 0 0 10px var(--accent);
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Room Grid Canvas */
  .room-grid {
    flex: 1;
    position: relative;
    transition: opacity 0.3s ease, transform 0.3s ease;
    cursor: crosshair;
    overflow: hidden;
  }
  .room-grid.transitioning {
    opacity: 0;
    transform: scale(0.96);
  }
  .tech-grid {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.012) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.012) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  /* Obstacles (Physical barriers on map) */
  .obstacle-node {
    position: absolute;
    background: rgba(2, 6, 23, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: inset 0 0 15px rgba(255, 255, 255, 0.02);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .obs-inner {
    font-size: 0.55rem;
    color: rgba(255, 255, 255, 0.15);
    transform: rotate(-10deg);
    white-space: nowrap;
    user-select: none;
  }

  /* Warp Portals (Circular Vortex teleporters) */
  .warp-portal {
    position: absolute;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transform: translate(-5%, -5%);
  }
  .portal-vortex {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    position: relative;
    background: radial-gradient(circle, var(--accent) 0%, transparent 65%);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .vortex-ring {
    position: absolute;
    border: 2px dashed var(--accent);
    border-radius: 50%;
    animation: rotateRing 8s linear infinite;
  }
  .ring-1 {
    inset: 4px;
  }
  .ring-2 {
    inset: 12px;
    animation-duration: 4s;
    animation-direction: reverse;
  }
  @keyframes rotateRing {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .portal-tag {
    font-size: 0.6rem;
    font-weight: 700;
    color: #e2e8f0;
    margin-top: 0.4rem;
    text-shadow: 0 0 8px #000;
    background: rgba(0, 0, 0, 0.6);
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    white-space: nowrap;
  }

  /* Datalink Nodes (Holographic terminal units) */
  .datalink-node {
    position: absolute;
    background: rgba(2, 6, 23, 0.7);
    border: 2px solid var(--accent);
    border-radius: 12px;
    cursor: pointer;
    box-shadow: 0 0 15px var(--theme-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }
  .node-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, var(--theme-color) 0%, transparent 100%);
    opacity: 0.4;
    transition: opacity 0.3s ease;
  }
  .datalink-node:hover {
    transform: scale(1.04);
    box-shadow: 0 0 30px var(--accent);
  }
  .node-core {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    z-index: 2;
  }
  .node-icon {
    font-size: 1.5rem;
    animation: hoverIcon 2s infinite ease-in-out;
  }
  @keyframes hoverIcon {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  .node-text {
    font-size: 0.65rem;
    font-weight: 800;
    color: #fff;
    letter-spacing: 0.05em;
    text-align: center;
    padding: 0 0.2rem;
  }
  .sync-check {
    position: absolute;
    bottom: 0.3rem;
    font-size: 0.5rem;
    font-weight: 800;
    color: var(--accent);
    background: rgba(0, 0, 0, 0.65);
    padding: 0.05rem 0.3rem;
    border-radius: 3px;
    border: 1px solid var(--accent);
    z-index: 2;
  }
  .node-scanner {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--accent);
    box-shadow: 0 0 8px var(--accent);
    animation: laserScan 2s infinite ease-in-out;
    z-index: 2;
  }
  @keyframes laserScan {
    0% { top: 0%; }
    50% { top: 100%; }
    100% { top: 0%; }
  }
  .visited-node {
    border-color: rgba(255, 255, 255, 0.25);
    box-shadow: none;
  }
  .visited-node:hover {
    border-color: var(--accent);
  }

  /* Player Mech (High Tech Mech suit avatar) */
  .player-mech {
    position: absolute;
    width: 46px;
    height: 46px;
    transform: translate(-50%, -50%);
    transition: left 0.16s cubic-bezier(0.25, 0.8, 0.25, 1), top 0.16s cubic-bezier(0.25, 0.8, 0.25, 1);
    z-index: 50;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .mech-radar {
    position: absolute;
    inset: -14px;
    border-radius: 50%;
    background: radial-gradient(circle, color-mix(in srgb, var(--accent) 35%, transparent), transparent 70%);
    border: 1px solid color-mix(in srgb, var(--accent) 15%, transparent);
    animation: radarRipple 2s infinite linear;
  }
  @keyframes radarRipple {
    0% { transform: scale(0.85); opacity: 0.9; }
    100% { transform: scale(1.3); opacity: 0; }
  }
  .mech-core {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #030712;
    border: 3px solid var(--accent);
    box-shadow: 0 0 15px var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  .mech-visor {
    position: absolute;
    top: 6px;
    width: 20px;
    height: 4px;
    background: var(--accent);
    box-shadow: 0 0 6px var(--accent);
    border-radius: 2px;
  }
  .mech-initials {
    font-size: 0.72rem;
    font-weight: 900;
    color: #fff;
    margin-top: 10px;
  }

  /* Cyber Interaction Tooltips */
  .comm-tooltip {
    position: absolute;
    bottom: 52px;
    left: 50%;
    transform: translateX(-50%);
    background: #020617;
    border: 1.5px solid var(--accent);
    padding: 0.35rem 0.7rem;
    border-radius: 6px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.7);
    animation: tooltipPulse 1.2s infinite;
  }
  @keyframes tooltipPulse {
    0%, 100% { transform: translate(-50%, 0px); }
    50% { transform: translate(-50%, -3px); }
  }
  .tooltip-glitch {
    font-size: 0.65rem;
    font-weight: 800;
    color: var(--accent);
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  /* Bottom Console Panel */
  .console-footer {
    background: rgba(3, 7, 18, 0.95);
    border-top: 2px solid var(--accent);
    padding: 0.8rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    z-index: 80;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  .system-logs-box {
    flex: 1;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-family: 'JetBrains Mono', monospace;
  }
  .logs-header {
    font-size: 0.55rem;
    font-weight: 700;
    color: #64748b;
    margin-bottom: 0.2rem;
  }
  .logs-stream {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  .log-entry {
    font-size: 0.65rem;
    color: #94a3b8;
    letter-spacing: 0.02em;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .quick-bridge {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    flex-shrink: 0;
  }
  .bridge-tag {
    font-size: 0.6rem;
    font-weight: 700;
    color: #64748b;
  }
  .bridge-btn-group {
    display: flex;
    gap: 0.4rem;
  }
  .bridge-btn {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    border: 1.5px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);
    cursor: pointer;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .bridge-btn:hover {
    transform: scale(1.08);
    background: rgba(255, 255, 255, 0.06);
    border-color: var(--bridge-accent);
  }
  .active-bridge {
    border-color: var(--bridge-accent);
    background: color-mix(in srgb, var(--bridge-accent) 15%, transparent);
    box-shadow: 0 0 12px var(--bridge-accent);
  }

  /* Holographic Terminal Popup Box */
  .terminal-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(2, 6, 23, 0.8);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    animation: termFade 0.2s ease-out;
  }
  @keyframes termFade {
    from { opacity: 0; }
  }
  .terminal-popup {
    width: 100%;
    max-width: 580px;
    background: #020617;
    border: 2px solid var(--accent);
    border-radius: 16px;
    box-shadow: 0 0 45px var(--accent);
    display: flex;
    flex-direction: column;
    animation: termPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    max-height: 80vh;
    overflow: hidden;
  }
  @keyframes termPop {
    from { transform: scale(0.92); opacity: 0; }
  }
  .terminal-header {
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1.5px solid rgba(255, 255, 255, 0.08);
    padding: 0.8rem 1.2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .term-dots {
    display: flex;
    gap: 0.35rem;
  }
  .term-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .dot-r { background: #ef4444; }
  .dot-y { background: #eab308; }
  .dot-g { background: #22c55e; }
  .term-title {
    font-size: 0.65rem;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.05em;
  }
  .term-close-btn {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    font-weight: 800;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #94a3b8;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .term-close-btn:hover {
    background: #ef4444;
    color: #fff;
    border-color: #ef4444;
  }
  .terminal-display {
    padding: 1.8rem;
    overflow-y: auto;
    flex: 1;
  }
  .archive-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
    color: #fff;
    margin: 0 0 1.2rem 0;
    text-shadow: 0 0 8px var(--theme-color);
  }
  .archive-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .archive-line {
    font-size: 0.82rem;
    line-height: 1.6;
    color: #cbd5e1;
    margin: 0;
    white-space: pre-wrap;
  }
  .archive-tags-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1.5rem;
    border-top: 1px dashed rgba(255, 255, 255, 0.08);
    padding-top: 1rem;
  }
  .archive-tag {
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    letter-spacing: 0.05em;
  }

  /* Dynamic Wall Collision Alert Styles */
  .collision-flash-overlay {
    position: absolute;
    inset: 0;
    background: rgba(239, 68, 68, 0.25);
    border: 4px solid #ef4444;
    box-shadow: inset 0 0 50px rgba(239, 68, 68, 0.5);
    z-index: 70;
    pointer-events: none;
    animation: flashFade 0.4s ease-out forwards;
  }
  @keyframes flashFade {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }

  .collision-shake {
    animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both;
  }
  @keyframes shake {
    10%, 90% { transform: translate(-50%, -50%) translate3d(-3px, 0, 0); }
    20%, 80% { transform: translate(-50%, -50%) translate3d(4px, 0, 0); }
    30%, 50%, 70% { transform: translate(-50%, -50%) translate3d(-6px, 0, 0); }
    40%, 60% { transform: translate(-50%, -50%) translate3d(6px, 0, 0); }
  }

  /* Responsiveness styling fixes */
  @media (max-width: 800px) {
    .hud-panel {
      padding: 0.6rem 1rem;
    }
    .hud-title {
      font-size: 1.1rem;
    }
    .hud-desc, .sync-progress {
      display: none;
    }
    .console-footer {
      flex-direction: column;
      gap: 0.8rem;
      padding: 0.6rem 1rem;
    }
    .system-logs-box {
      width: 100%;
    }
    .quick-bridge {
      width: 100%;
      justify-content: space-between;
    }
    .terminal-popup {
      max-height: 90vh;
    }
    .terminal-display {
      padding: 1.2rem;
    }
  }
</style>
