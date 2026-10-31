# PELAN INDUK V2: Kepulauan 6-Pulau "Sovereign Fiber-Optic & X-Ray Diorama"

> **Status Semasa**: Pelan Induk Diluluskan (Pilihan 1) — Sedia Untuk Pelaksanaan Mengikut Sesi (Sesi 0 hingga Sesi 5).
> **Tarikh Kemas Kini**: 31 Oktober 2026.
> **Subjek Rasmi**: Portfolio Kejuruteraan Sistem Full-Stack, Keselamatan Rangkaian & AI — **Muhammed Munir Bin Mohd Azmi**.
> **Cara Guna Merentas Sesi Baharu**: Setiap sesi baharu Claude Code / 9Router hanya perlu membaca `PELAN.md` dan `TODO.md`, cari fasa pertama yang bertanda `[ ]`, jalankan fasa tersebut sehingga semua Gate Lulus, tandakan `[x]` di `TODO.md`, dan berhenti.

---

## 1. Diagnosis Forensik (Mengapa Versi Sebelum Ini Gagal & Membosankan)

Berdasarkan audit kod sumber pada `src/lib/spine/FiberSpineWorld.ts` dan `src/lib/spine/FiberSpineExperience.svelte`:

1. **Popup Kad HTML 2D Rata (`FiberSpineExperience.svelte:699` `.hotspot-inspect-card`)**:
   - Menekan prop 3D sekadar membuka kotak `<aside>` 2D statik di tepi skrin. Ini melanggar prinsip utama `dioramas-3d` (*"ZERO clunky 2D monitor boxes or HTML modal windows to explain 3D props"*).
2. **Kamera Kaku Tanpa Selaman Makro (`FiberSpineWorld.ts:2413` `selectHotspot` & `2891` `updateCamera`)**:
   - Apabila objek ditekan, `camRadiusOffset` kekal pada `9.8m` dan hanya menggeser `targetYawOffset` sebanyak `±0.55`. Tiada animasi terbang masuk (*dolly-in*), tiada perubahan sudut fokus (*macro framing*), dan tiada rasa kepuasan fizikal seperti zoom monitor terdahulu.
3. **Geometri Primitif Seragam Tanpa Identiti (`FiberSpineWorld.ts:1612–1975` `buildTactileProp`)**:
   - Kesemua 21 hotspot dalam `spine-data.ts` diwakili oleh primitif berulang (3 giroskop oktahedron serupa di Stesen 01, 3 rak kotak serupa di Stesen 02). Tiada siluet ikonik dan tiada penanda diegetik 3D di atas objek, menyebabkan pelawat tidak tahu apa yang ditekan.
4. **Enjin Rujukan Tempatan Tidak Dimanfaatkan**:
   - Mesin pembangunan sudah mempunyai rujukan penuh `C:\Project\dioramas` (pipeline HDR `postprocessing`, `N8AO`, `AgX` tone mapping, `studioEnvironment` softbox PMREM, `VolumetricSpotEffect`, `PlanarReflection`, serta aset GLB Meshy 4K berlesen CC BY 4.0) dan `C:\Project\Liquid-Glass` (`lensOptics.ts` pembiasan kaca Snell's Law), namun belum disambungkan ke dalam `C:\Project\portfolio`.

---

## 2. Konsep Tandatangan & Ujian Pesaing (`taste-skill` + `design-intelligence`)

### Ayat Idea Utama
> Di laman ini, **rangkaian kabel gentian optik dasar laut, kubah pertahanan SOC, dan seni bina sistem perusahaan sebenar Muhammed Munir** menjadi **diorama mekanikal hidup yang terbelah secara fizikal (*exploded 3D cutaway*) apabila kamera menyelam masuk, disuluh menembusi kulit luarnya melalui Lensa Kaca Cair X-Ray Snell's Law, dan bernafas mengikut cuaca/waktu sebenar Malaysia serta meja uji kejuruteraan harian**.

### Kontrak Fakta Tidak Boleh Diusik (Ground Truth Invariants)
- Semua data kerjaya, pendidikan, sijil, kemahiran, projek, dan pautan dalam `src/lib/spine/spine-data.ts` serta penghalaan dalam `src/lib/spine/exhibit-navigation.ts` adalah sumber kebenaran tunggal. **Dilarang mereka-reka statistik palsu, testimoni, atau nombor trafik rekaan.**
- Akses terus kepada **Nama Penuh, Jawatan, Muat Turun `/resume.pdf`, Mod Editorial CV (`viewMode === 'editorial'`), GitHub, LinkedIn, WhatsApp, dan E-mel** wajib kekal tersedia dengan 1 klik pada setiap masa, termasuk jika WebGL gagal atau `prefers-reduced-motion` aktif.
- Setiap aset GLB daripada `C:\Project\dioramas\public\models\` yang digunakan wajib mengekalkan kredit lesen **CC BY 4.0 — "Dioramas (github.com/blendi-remade/dioramas)"** di bahagian kredit footer Editorial & info HUD.

---

## 3. Empat Tunggak Pengalaman "Menggoncang Dunia" & Magnet Lawatan Berulang

### Tunggak A — Sifar Modal 2D: Kamera Dive Sinematik + Exploded 3D Architecture + 3D Leader Lines
- **Kamera Spline Makro**: Klik mana-mana diorama prop (atau pilih melalui papan kekunci) menerbangkan kamera dari jarak pulau (`9.8m`, FOV `46°`) masuk ke jarak pemeriksaan makro (`2.1m–2.8m`, FOV `38°`) menghadap tepat ke teras objek dengan lampu sorot fokus stesen.
- **Exploded Mechanical Cutaway**: Semasa kamera menyelam masuk, objek 3D tersebut **terbuka secara mekanikal kepada 3 lapisan seni bina sebenar** sepanjang paksi menegak/jejari:
  1. **Lapisan Atas (Interface / Edge)**: Contoh `Vue.js 3`, `SvelteKit`, `Flutter`, `Cloudflare WAF`.
  2. **Lapisan Tengah (Core Logic / Security)**: Contoh `Laravel 11/12 Filament`, `Supabase RLS & JWT`, `Splunk SIEM`, `OpenCV SIFT/CIELAB`, `MCP`.
  3. **Lapisan Tapak (Data & Infrastructure)**: Contoh `PostgreSQL 17`, `Docker Swarm`, `Azure Ubuntu NSG`, `Subsea Fiber Conduit`.
- **Diegetic 3D Leader Lines (Bukan Kotak Modal)**: Garisan penunjuk teknikal SVG tajam bermula daripada titik sauh 3D (`Vector3.project(camera)`) setiap lapisan terus ke kalout kaca cair mikro yang memaparkan tajuk, ringkasan padat, cip teknologi boleh-klik (`exhibit-navigation.ts`), dan butang pautan terus (`GitHub Repo`, `PDF Case Study`, `Resume PDF`). Klik luar, tekan `Escape`, atau tatal keluar mencantumkan semula lapisan mekanikal dan memulangkan kamera ke orbit pulau.

### Tunggak B — Pemetaan 21 Hotspot Kepada Diorama Siluet Unik (Hibrid GLB CC BY 4.0 + Mekanikal Prosedural)
Tiada lagi dua objek yang kelihatan sama. Bajet muat turun GLB dihadkan bawah `<= 15 MB` keseluruhan (dimuat secara malas / *lazy-loaded* selepas pulau asas sedia, dengan proksi prosedural serta-merta):

| Pulau / Stesen | Hotspot (`spine-data.ts`) | Siluet Diorama 3D & Mekanik Exploded View | Sumber Geometri |
| :--- | :--- | :--- | :--- |
| **01 · Core Profile** | `core-monolith` (Profil & Resume) | **Menara Rumah Api Optik (`keeper/lighthouse.glb` / hibrid)** dengan teras prisma kristal berputar & pancaran suar volumetrik. | GLB Teroptimum + Prisma Kaca |
| | `core-ring-sys` (Full-Stack & Mobile) | **Astrolab Kejuruteraan Berlapis (`pilot/astrolabe-lo.glb`)** — cincin UI, API, dan DB berputar pada nisbah gear sebenar. | GLB `2.64 MB` + Cincin Gear |
| | `core-ring-net` (Network Sec & SOC) | **Perisai Kubah Geodesik Siber** — jaringan heksagon pelindung mengelilingi nod teras gentian optik. | Mekanikal Prosedural Berlapis |
| **02 · Enterprise Work** | `ent-emesys` (YHCM Sdn Bhd) | **Menara Kluster 3-Pelayan Sektor Awam (eMesys · Sutera · ADIMS)** — 3 bilah casis berlabel yang terangkat keluar menunjukkan aliran Docker Swarm & PostgreSQL 17. | Mekanikal Prosedural + Plat Diegetik |
| | `ent-sutera` (Nova Bitara IWA001) | **Peti Besi Kaca RLS & Gerbang JWT** — teras transaksi bercagar dengan cincin penapis paket hijau/merah. | Mekanikal Prosedural + Kaca PBR |
| | `ent-adims` (TNB Protégé Onboardx) | **Stesen Dok Mudah Alih & Awan Azure** — casis peranti dwi-skrin terapung di atas 4 nod pangkalan data (Firebase, Mongo, Supabase, MySQL). | Mekanikal Prosedural Berlapis |
| **03 · TNB SOC & ICT** | `net-soc` (TNB Cyber Security SOC) | **Dron Pemintas & Kubah Radar SIEM (`hangar/drone.glb` + Turret)** — mengimbas dan menembak sasaran CVE Vulhub di udara. | GLB `4.38 MB` + Turret Laser |
| | `net-tnb-fiber` (TNB ICT Fiber) | **Kapal Selam / Stesen Pendaratan Kabel Dasar Laut (`abyssal/nautilus.glb` atau Hab Gentian)** — menunjukkan keratan rentas teras kaca optik & isyarat laser `1550nm`. | Prosedural Optik / GLB Terpilih |
| | `net-utm-degree` (Linux Homelab) | **Rak Pelayan Homelab Terbuka** — kipas penyejuk berputar, suis firewall, dan lampu paket kontena Docker. | Mekanikal Prosedural |
| **04 · 5 CV Projects** | `ai-tindak` (TINDAK Mobile AI) | **Enjin Prisma Share-Intent** — menangkap pancaran teks masuk dan memecahkannya kepada 3 laluan warna (URL, Kenalan, Bayaran). | Mekanikal Optik Prosedural |
| | `ai-9router` (9Router Office 3D) | **Meja Orkestrasi 9-Ejen MCP** — 9 nod satelit bercahaya mengelilingi penghala pusat Three.js. | Mekanikal Prosedural |
| | `ai-cv-rag` (OpenCV & Win32 Suite) | **Kepala Lensa Kamera Bukaan Mekanikal (Aperture Iris)** — bilah iris membuka/menutup mengikut penjejakan mata kursor SIFT/CIELAB. | Mekanikal Iris Prosedural |
| | `proj-pin-bik` (Baby Kicking Suite) | **Kapsul Biometrik Denyutan Harmoni** — gelombang nadi lembut masa nyata di dalam balang kaca pelindung. | Kaca PBR + Gelombang Shader |
| | `proj-pin-lumina` (Lumina Smart Mirror) | **Cermin Pintar LED Kelvin (`3000K–6500K`)** — cermin reflektif yang benar-benar menukar suhu cahaya lampu bingkainya apabila disentuh. | Cermin PBR + Emissive Ring |
| **05 · Tech Skills** | `mob-nova-loan`, `mob-onboardx`, `mob-bik-lumina` | **3 Monolit Spektrum Kemahiran (`horologie` Gear / Kristal Kuarsa / Matriks AI)** — setiap pilon memaparkan konstelasi nod kemahiran yang menyala mengikut projek berkaitan. | Prosedural Konstelasi 3D |
| **06 · UTM & Contact** | `term-email`, `term-whatsapp`, `term-github`, `term-linkedin` | **4 Konsol Satelit Komunikasi & Menara Akademik UTM** — piring satelit menghala ke langit apabila dipilih, butang taktil fizikal untuk WhatsApp, E-mel, GitHub, dan `/resume.pdf`. | Mekanikal Satelit Prosedural |

### Tunggak C — Lensa Kaca Cair X-Ray Snell's Law (`Liquid-Glass` + `Velocity Lab`)
- **Suis Lensa (`Kekunci X` atau Butang HUD `Lensa X-Ray`)**: Memunculkan kanta bulat kaca cair mengikuti kursor (atau di tengah skrin pada mudah alih melalui seretan jari).
- **Optik Snell's Law**: Menggunakan shader pembiasan cembung dan pemisahan kromatik RGB di birai kanta (diadaptasi daripada `C:\Project\Liquid-Glass\demo\components\lensOptics.ts`).
- **Dwi-Lapisan Penglihatan**: Di luar kanta ialah dunia PBR sinematik; **di dalam bulatan kanta**, penutup logam pulau menjadi wireframe hologram X-Ray lutsinar yang mendedahkan **saluran kabel gentian optik bercahaya di bawah lantai setiap pulau, aliran paket data, dan nota seni bina dalaman (`architectureNote`)**.
- **Strategi Prestasi**: Guna *scissor/stencil circular mask pass* atau *shader uniform `uXrayLens(center, radius)`* terus pada bahan diorama supaya **lautan GLSL tidak perlu dilukis dua kali**.

### Tunggak D — Magnet Lawatan Harian ("Buka Selalu")
1. **Chrono-Weather Sync Malaysia (`Asia/Kuala_Lumpur` UTC+8 + Open-Meteo Puchong)**:
   - Lalai semasa dibuka: mengira waktu sebenar Malaysia dan menarik cuaca semasa Puchong (`3.0327, 101.6188`, tanpa kunci API, timeout `2.5s`, cache `15 minit`). Waktu pagi = fajar keemasan, tengah hari cerah = lagun zamrud, hujan/ribut petang = alunan monsun, malam (`19:30–06:30`) = malam bioluminesensi gentian optik. Pengguna masih boleh menukar cuaca secara manual pada bila-bila masa.
2. **Nadi Siber & Kod Langsung (Live Cyber & GitHub Pulse di Stesen 03 & 01)**:
   - Menarik suapan komit awam terkini `api.github.com/users/muhammedmunir/events/public` dan ringkasan kerentanan awam terkini (suapan statik/JSON CISA KEV dengan fallback snapshot terbina dalam) untuk dipaparkan sebagai **denyutan telemetri hidup pada Radar SOC & Rumah Api Profil** (dilabel dengan jujur sebagai suapan data awam masa nyata, cache `sessionStorage` untuk elak had kadar).
3. **Meja Uji Kaca Cair "Tactile Cyber-Bench" (3 Alat Kejuruteraan Sebenar Dalam 3D)**:
   - Apabila pengguna menyelam ke prop berkaitan, satu panel kerja diegetik mikro membolehkan interaksi utiliti sebenar (100% *client-side*, sifar penghantaran data keluar):
     - **Di `ai-tindak` (Stesen 04)**: *Live Share-Intent Parser* — taip/tampal teks bercampur URL, `+60...`, atau jumlah `RM` → lihat enjin regex local-first TINDAK mengekstrak cip tindakan secara langsung dan memancarkan zarah ke laluan objek 3D.
     - **Di `net-tnb-fiber` (Stesen 03)**: *Fiber-Optic Attenuation Lab* — laras slider jarak (`1 km – 120 km`), panjang gelombang (`1310 nm` vs `1550 nm`), dan bilangan sambungan (*splice*) → kira kehilangan isyarat `dB` sebenar mengikut formula kejuruteraan optik dan lihat kecerahan teras laser 3D berubah secara langsung.
     - **Di `ent-sutera` (Stesen 02)**: *Supabase RLS JWT Gate* — tukar peranan token simulasi (`anon`, `borrower_owner`, `admin_auditor`) dan tekan *Hantar Query* → lihat sama ada gerbang 3D IWA001 meluluskan atau menangkis paket tersebut secara fizikal.

---

## 4. Seni Bina Prestasi, Keselamatan & Aksesibiliti (Invariant Guardrails)

1. **Adaptive Quality Governor (`QualityTier`: `ultra` | `balanced` | `lite`)**:
   - Port `studioEnvironment` PMREM + `EffectComposer` (`BloomEffect` + `ToneMappingEffect(AGX)` + `N8AOPostPass` pilihan) daripada `dioramas`.
   - Semasa 90 bingkai pertama selepas `renderer.compile()`, ukur purata masa bingkai:
     - `>= 52 FPS`: Kekalkan `ultra` (`N8AO` half-res + `Bloom` + `AgX`).
     - `38–51 FPS`: Tukar ke `balanced` (matikan `N8AO`, kekalkan `Bloom` + `AgX` + `studioEnvironment`).
     - `< 38 FPS` atau GPU mudah alih lemah: Tukar ke `lite` (renderer terus dengan `ACESFilmicToneMapping` + DRS sedia ada).
2. **Sifar Kebocoran Memori & Pemecahan Kod**:
   - Semua pakej 3D (`three`, `postprocessing`, `n8ao`) kekal di dalam dynamic `import('./FiberSpineWorld')` supaya mod Editorial CV dan muatan HTML awal kekal ringan.
   - `dispose()` wajib membersihkan `EffectComposer`, tekstur `PMREMGenerator`, `GLTFLoader` cache, geometries, materials, dan `AbortController` fetch cuaca/GitHub.
3. **Aksesibiliti Setara (`WCAG 2.2 AA` Sasaran Reka Bentuk)**:
   - Setiap pulau mempunyai jalur dok bawah kaca cair dengan butang DOM asli bagi setiap diorama prop di pulau semasa (`Tab`, `Enter`, `Space`, `ArrowLeft`/`ArrowRight`, `Escape`).
   - `prefers-reduced-motion: reduce` mematikan lantunan spring, herotan cecair, dan terbang kamera panjang (diganti dengan potongan kamera lembut/segera serta lapisan exploded statik).
4. **Keselamatan Aplikasi (`appsec`)**:
   - Semua data daripada API awam (Open-Meteo, GitHub Events, suapan CVE) dianggap **input tidak dipercayai**: disahkan skema, dipotong panjang rentetan, dipaparkan hanya melalui interpolasi teks Svelte (sifar `{@html}`), dan semua URL luaran disahkan protokol `https:` dengan `rel="noopener noreferrer"`.

---

## 5. Pelan Pelaksanaan 6 Sesi (Direka Khusus Supaya Setiap Sesi Ringan Token & Boleh Disambung)

Setiap sesi di bawah mempunyai **Skop Fail**, **Skill/MCP Wajib**, **Langkah Kerja**, dan **Syarat Keluar (Exit Gate)** yang jelas.

### Sesi 0 — Prapenerbangan Pelayar, Baseline Visual & Enjin Pencahayaan HDR (`dioramas` Core)
- **Matlamat**: Memastikan Playwright Chromium benar-benar berfungsi untuk pengukuran visual, merakam tangkapan skrin "sebelum", dan menaik taraf pencahayaan/postprocessing asas `FiberSpineWorld.ts` dengan `Adaptive Quality Governor`.
- **Skill / MCP**: `dioramas-3d`, `playwright` MCP, `context7` MCP.
- **Tindakan Konkrit**:
  1. Sahkan/pasang pelayar ujian (`npx playwright install chromium`) supaya semua semakan visual tidak lagi `SKIPPED`.
  2. Rakam tangkapan skrin baseline (`1440x900`, `768x1024`, `390x844`) ke folder sementara `.taste-skill/before/` (diabaikan dalam `.gitignore`).
  3. Pasang `postprocessing` (dan `n8ao` jika serasi bersih dengan Vite 8 + Three r186; jika `n8ao` konflik peer-dep, guna `postprocessing` rasmi `BloomEffect` + `ToneMappingEffect(AGX)` + `VignetteEffect` + `SMAAEffect`).
  4. Bina `src/lib/spine/studio-env.ts` (diadaptasi daripada `studioEnvironment` `dioramas` untuk softbox PMREM logam/kaca mewah) dan integrasikan bersama `QualityTier` governor di `FiberSpineWorld.ts`.
- **Exit Gate Sesi 0**: `npm run check`, `npm test`, `npm run build` lulus; tangkapan skrin Playwright mengesahkan tiada ralat WebGL dan FPS diukur.

### Sesi 1 — Hapuskan Popup 2D: Kamera Dive Makro, Exploded 3D Architecture & 3D Leader Lines
- **Matlamat**: Menamatkan sepenuhnya kebosanan popup `.hotspot-inspect-card` 2D dan menggantikannya dengan selaman kamera sinematik + pembelahan objek 3D + garisan penunjuk ruang 3D.
- **Skill / MCP**: `dioramas-3d`, `gsap`, `a11y-loop`, `modern-ui-patterns`.
- **Tindakan Konkrit**:
  1. Dalam `FiberSpineWorld.ts`, tambah mod kamera fokus (`focusedToyId`): apabila prop dipilih, interpolasi lancar `camPos` dan `lookTarget` dari orbit pulau (`9.8m`) ke sudut makro (`2.2m–2.6m`, sedikit mengimbangi ruang untuk kalout leader-line) serta malapkan sedikit hingar latar dengan lampu sorot fokus.
  2. Bina struktur 3-lapisan boleh-belah (`ExplodableLayer[]`: `top`, `mid`, `base`) pada setiap prop supaya apabila dipilih, lapisan terangkat/terbuka secara spring (`toy-spring.ts`) mendedahkan teras dalamannya, dan bercantum semula apabila ditutup.
  3. Kemas kini `updateProjectedMarkers()` untuk mengeksport koordinat skrin `(x, y)` bagi 3 titik sauh lapisan prop yang sedang difokuskan.
  4. Dalam `FiberSpineExperience.svelte`, **padamkan kotak `<aside class="hotspot-inspect-card">` lama** dan gantikan dengan komponen diegetik `DiegeticLeaderOverlay` (garisan SVG tajam dari titik sauh 3D ke kalout kaca cair terikat, lengkap dengan navigasi cip `resolveExhibitView` daripada `exhibit-navigation.ts`, butang `←`/`→`, `Escape`, dan pautan repo/PDF).
  5. Kemas kini `scripts/spine-inspect.test.mjs` dan `scripts/spine-verify.mjs` untuk menguji kontrak diegetik baharu.
- **Exit Gate Sesi 1**: Klik mana-mana prop → kamera zoom rapat + prop terbelah 3 lapisan + leader lines muncul tepat pada komponen 3D; `Escape`/klik luar memulangkan kamera ke orbit; semua ujian hijau.

### Sesi 2 — 21 Diorama Siluet Unik & Integrasi Aset GLB CC BY 4.0 Terpilih
- **Matlamat**: Setiap satu daripada 21 hotspot mempunyai rupa fizikal yang unik, bermakna, dan mudah dikenali dari jauh mahupun dekat, lengkap dengan plat kod 3D diegetik (`PROFIL-01`, `WORK-01`, `TNB-SOC`, `PROJ-01`, dsb.).
- **Skill / MCP**: `dioramas-3d`, `taste-skill`, `production-engineering`.
- **Tindakan Konkrit**:
  1. Salin maksimum 3–4 model GLB ringan terpilih daripada `C:\Project\dioramas\public\models\` ke `static/models/` (`pilot/astrolabe-lo.glb` `2.64MB`, `hangar/drone.glb` `4.38MB`, `abyssal/nautilus.glb` `3.64MB`) dan dokumentasikan kredit `CC BY 4.0 Dioramas` dalam `static/models/ATTRIBUTION.md` serta footer Editorial.
  2. Bina pemuat `GLTFLoader` malas (*non-blocking*: dunia muncul serta-merta, GLB masuk dengan transisi skala spring sebaik selesai dimuatkan).
  3. Rombak `buildTactileProp` (pecahkan ke modul bersih `src/lib/spine/diorama-props.ts` supaya `FiberSpineWorld.ts` tidak membengkak) untuk membina 21 siluet berbeza mengikut jadual Tunggak B (Iris Kamera OpenCV, Cermin Kelvin Lumina, Kluster 3-Bilah YHCM, Gerbang Kaca RLS IWA001, Meja 9-Ejen MCP, Kapsul Nadi Baby Kicking, Piring Satelit Hubungan, dsb.) bersama papan tanda 3D mikro yang jelas sebelum diklik.
- **Exit Gate Sesi 2**: Kesemua 6 pulau dan 21 prop mempunyai identiti visual berbeza yang jelas dalam tangkapan skrin Playwright; saiz binaan kod kekal terkawal; `dispose()` membersihkan semua aset GLB.

### Sesi 3 — Lensa Kaca Cair X-Ray Snell's Law & HUD `Liquid-Glass`
- **Matlamat**: Melahirkan interaksi tandatangan bertaraf Awwwards yang belum pernah ada pada laman portfolio jurutera: kanta pembiasan kaca cair yang melihat menembusi pulau dan mesin 3D.
- **Skill / MCP**: `liquid-glass`, `modern-ui-patterns`, `antislop-ui`.
- **Tindakan Konkrit**:
  1. Bina sistem saluran gentian optik bawah lantai pulau & nod aliran paket tersembunyi di setiap stesen yang hanya bersinar terang dalam mod X-Ray.
  2. Suntik uniform kanta X-Ray (`uLensCenter`, `uLensRadius`, `uLensActive`) atau pas komposit kanta bulat dengan pembiasan tepi kromatik Snell's Law (berasaskan matematik `lensOptics.ts`) supaya kawasan di bawah kanta menukar permukaan luar pulau/prop menjadi rangka hologram CAD lutsinar.
  3. Tambah butang HUD `Lensa X-Ray (X)` pada bar kawalan dan sokongan seretan sentuhan pada skrin mudah alih (serta mod statik bersih apabila `prefers-reduced-motion` aktif).
  4. Naik taraf bar navigasi pulau bawah dan bar atas menggunakan permukaan `Liquid-Glass` tulen (biasan spekular tepi 1px, fizik tekan `scale(0.97)` dengan lengkung `cubic-bezier(0.34, 1.56, 0.64, 1)`).
- **Exit Gate Sesi 3**: Tekan `X` atau butang Lensa → kanta kaca cair membiaskan cahaya dan mendedahkan rangkaian gentian optik bawah pulau pada `>= 45 FPS`; ujian kontras kaca lulus.

### Sesi 4 — Magnet Lawatan Harian: Chrono-Weather Malaysia, Live Cyber Pulse & Tactile Cyber-Bench
- **Matlamat**: Menjadikan laman portfolio ini hidup setiap hari dan mempunyai 3 alat kejuruteraan sebenar yang membuatkan pelawat serta rakan jurutera datang semula.
- **Skill / MCP**: `frontend`, `appsec`, `tdd`.
- **Tindakan Konkrit**:
  1. Bina `src/lib/spine/live-world-feed.ts` dengan kawalan keselamatan ketat (`AbortController` timeout `2500ms`, validasi skema, cache `15 minit`, fallback offline senyap):
     - Waktu `Asia/Kuala_Lumpur` + cuaca Open-Meteo Puchong → pemetaan automatik ke `OCEAN_WEATHER_PRESETS` dengan lencana status jujur (`Cuaca Langsung Puchong` vs `Pratetap Manual`).
     - Suapan awam GitHub `muhammedmunir` + ringkasan CVE awam → memacu denyutan nod pada Stesen 01 & Stesen 03.
  2. Bina `src/lib/spine/cyber-bench.ts` (fungsi tulen + ujian unit penuh) dan sambungkan ke kalout diegetik 3 prop utama:
     - **TINDAK Local-First Intent Parser** pada `ai-tindak`.
     - **TNB Fiber-Optic Attenuation Calculator (`dB`)** pada `net-tnb-fiber` (mengubah keamatan pancaran teras gentian 3D secara langsung).
     - **IWA001 Supabase RLS Role Simulator** pada `ent-sutera` (menghantar paket ujian menembusi atau ditangkis oleh perisai 3D).
- **Exit Gate Sesi 4**: Ujian unit untuk ketiga-tiga alat dan fallback offline lulus 100%; tiada ralat rangkaian apabila diuji dalam mod offline Playwright; semakan `appsec` mengesahkan sifar vektor XSS.

### Sesi 5 — Gilapan Akhir, Audit Kritikan Visual 3-Viewport, A11y & Pengesahan Produksi
- **Matlamat**: Membuktikan kualiti bertaraf anugerah melalui bukti tangkapan skrin sebenar, ujian aksesibiliti pelayar, dan audit pengkritik adversarial sebelum diserahkan.
- **Skill / MCP**: `taste-skill`, `ux-ui-agent-skills:a11y-audit`, `ux-ui-agent-skills:design-critic`, `playwright` MCP, `code-review`, `verify-and-stop`.
- **Tindakan Konkrit**:
  1. Bina produksi penuh (`npm run build && npm run preview`) dan ambil tangkapan skrin pada `1440x900`, `768x1024`, dan `390x844` merangkumi: pandangan pulau, pandangan Kamera Dive + Exploded View, Lensa X-Ray aktif, Tactile Cyber-Bench, tema Gelap & Cerah, serta Mod Editorial CV.
  2. Jalankan audit papan kekunci penuh (`Tab`, `Shift+Tab`, `1–6`, `ArrowLeft/Right`, `Enter`, `X`, `Escape`), mod `prefers-reduced-motion: reduce`, dan ujian kontras (`npm run test:contrast`).
  3. Jalankan ejen `ux-ui-agent-skills:design-critic` ke atas tangkapan skrin sebenar, baiki sebarang kecacatan hierarki/pertindihan teks yang ditemui, dan sahkan semula.
  4. Hasilkan laporan bukti akhir yang memisahkan secara jujur setiap perkara yang telah diukur lulus berbanding item ujian manual peranti fizikal.
- **Exit Gate Sesi 5**: `0` ralat `svelte-check`, `100%` ujian lulus, `0` ralat konsol pelayar pada binaan produksi, dan perbandingan visual `.taste-skill/before` vs `.taste-skill/after` lengkap.

---

## 6. Protokol Sambung Sesi (Session Handoff Protocol Untuk Jimat Konteks)

Apabila anda membuka sesi baharu dalam Claude Code / 9Router, anda hanya perlu menaip satu baris ringkas seperti:
> `"Baca @PELAN.md dan @TODO.md, kemudian laksanakan sesi seterusnya yang belum selesai."`

Peraturan wajib untuk ejen pada setiap sesi baharu:
1. Baca `PELAN.md` dan `TODO.md` dahulu sebelum menyentuh kod.
2. Laksanakan **satu sesi sahaja** pada satu masa (melainkan pengguna meminta lebih) supaya tetingkap konteks kekal tajam dan kualiti kod tidak merosot.
3. Jangan sekali-kali menandakan `[x]` dalam `TODO.md` jika arahan `npm run check`, `npm test`, atau `npm run build` masih gagal.
4. Kemas kini bahagian **Log Kemajuan Sesi** di bawah `TODO.md` dengan tarikh, ringkasan fail yang diubah, dan keputusan ujian sebenar sebelum menutup sesi.
