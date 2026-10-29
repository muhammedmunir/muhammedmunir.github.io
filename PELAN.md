# Pelan Transformasi Portfolio 3D: The Living Fiber Spine

Pelan hala tuju komprehensif bagi menukar portfolio ini menjadi pameran 3D interaktif yang ultra-lancar, ringan, berprestasi tinggi, dan visual yang memukau mata (eye-candy) tanpa sebarang lag.

---

## 1. Diagnosis: Mengapa Projek Terasa Lag & "Benda Tak Patut Ada"

### A. "Benda Tak Patut Ada" (Sisa Kod Warisan / Zombi)

Di dalam `src/lib/`, terdapat 7 lelaran prototaip masa lalu yang ditinggalkan begitu sahaja apabila konsep baharu dimulakan:

1. `src/lib/facility/*` (Konsep makmal 3D lama, bertindih fungsi dengan Fiber Spine)
2. `src/lib/motion/*` (Sistem skrol prototaip 22 Okt)
3. `src/lib/living/*` (Eksperimen lama 21 Okt)
4. `src/lib/engine/*` (Enjin rendering lama)
5. `src/lib/spatial/*` (Sistem spatial lama yang telah diganti oleh Fiber Spine)
6. `src/lib/deck/*` (Mod pembentangan lama)
7. `src/lib/components/*` (Komponen portfolio rata 2D lama)
8. `src/lib/NeuralCortexCanvas.svelte` & `src/lib/JarvisHUD.svelte` (Kanvas 2D lama)

**Kesan Buruk**: Membebankan IDE, melambatkan proses typecheck (`svelte-check` menyemak 803 fail!), mengelirukan penyelenggaraan, dan membesarkan saiz repositori.

### B. Punca Sebenar Lag & Keberatan WebGL

1. **Gelung Render 60 FPS Tanpa Henti (No Idle Rendering)**:
   - `requestAnimationFrame` melukis semula seluruh kanvas 3D 60 kali sesaat walaupun pengguna sedang pegun membaca teks di monitor terminal. Ini memanaskan GPU dan mengeringkan bateri.
2. **Kalkulasi ShadowMap Dinamik Pada Terlalu Banyak Objek**:
   - `castShadow = true` dan `receiveShadow = true` dihidupkan pada puluhan objek kecil (tiang, radar, kekisi, pilon, kristal). Setiap bingkai bayang memerlukan pas render tambahan dari sudut cahaya.
3. **Tekanan Alokasi Memori (Garbage Collection Stutter)**:
   - Dalam fungsi pengiraan trajektori kamera (`updateCamera()`), objek `THREE.Vector3` dicipta berulang kali menerusi `.clone()` pada setiap bingkai, menyebabkan Garbage Collector pelayar kerap membuat jeda mikro (micro-stutter).
4. **Bongkah Monolitik (Chunk JS 653 kB)**:
   - Three.js dimuatkan secara serta-merta pada permulaan halaman, bukan secara dinamik (`import()`), melambatkan masa respons pertama (FID/INP).

---

## 2. Pelan Fasa Transformasi

### Fasa 1: Pelangsingan & Pengoptimuman (Performance Foundation)

_Objektif: 60 FPS stabil pada peranti rendah/sederhana, muatan permulaan bawah 150 kB._

1. **Pembersihan Bersih (Clean Purge)**:
   - Pindahkan kod `facility`, `motion`, `living`, `engine`, `spatial`, dan `deck` ke cawangan arkib atau padam secara kekal.
   - Sasaran: Kurangkan fail daripada 803 fail ke ~150 fail teras.
2. **Render Atas Permintaan (On-Demand / Dirty Render)**:
   - Laksana bendera `needsRender`. Hanya panggil `renderer.render()` apabila:
     - Kamera sedang bergerak (lerp / orbit).
     - Pengguna sedang menyeret atau menggerakkan kursor.
     - Gelombang laut atau zarah sedang aktif dalam sudut pandang.
     - Berhenti melukis apabila pengguna statik membaca papan pameran!
3. **Penyingkiran Dynamic ShadowMap → Ganti dengan Fake Contact Decals**:
   - Padam `castShadow` pada objek perhiasan kecil.
   - Letakkan cakera bulat bertekstur kabur (radial gradient ground decal) di bawah pulau dan pilon. Jimat 40% kuasa GPU tanpa penurunan kualiti visual yang ketara.
4. **Alokasi Vektor Statik (Zero-Allocation Loop)**:
   - Guna semula vektor sementara (`tempVecA`, `tempVecB`) bagi semua operasi matematik trajektori kamera.
5. **Pemuatan Dinamik (Lazy-load 3D Engine)**:
   - Muatkan `FiberSpineWorld` menggunakan `await import(...)` hanya selepas DOM sedia, membolehkan HTML dan shell memuat dengan kelajuan kilat.

---

## 3. Fasa 2: Visual 3D Sinematik & "Memanjakan Mata" (Aesthetic Wow-Factor)

_Objektif: Tampilan bertaraf antarabangsa setaraf pemenang anugerah Awwwards / FWA._

1. **Atmosfera Lautan Bercahaya (Bioluminescent Cyber-Ocean)**:
   - Tambah kesan pendaran biru neon/cyan pada puncak ombak Gerstner (`vElevation` foam threshold).
   - Kabus volumetrik mendalam (`THREE.FogExp2`) yang menggabungkan lautan ke dalam langit secara lancar tanpa garisan pemotong kasar.
2. **Hujan Zarah Optik & Denyutan Data (Data Pulses & Floating Motes)**:
   - Butiran zarah halus (dust particles/motes) yang terapung di udara dengan pendaran keemasan dan cyan yang lembut.
   - Aliran cahaya data yang bergerak di sepanjang jambatan orbital (orbital causeway) yang menghubungkan 6 stesen.
3. **Pencahayaan Logam & Kaca Mewah (PBR & Physical Shading)**:
   - Beri monitor terminal kemasan kaca gelap berperisai (_tinted cyber-glass_) dengan pantulan halus persekitaran (HDR environment reflections).
   - Cincin reaktor pusat berputar dengan pendaran teras plasma.
4. **Kamera Spring Kinetik (Tactile Fluid Camera)**:
   - Interpolasi kamera menggunakan fizik spring (damping ratio 0.8) supaya setiap pergerakan terasa ada berat inersia mewah, bukan gerakan robotik linear.
5. **Pratetap Suasana Cuaca Dinamik (Dynamic Cyberpunk/Golden Atmospheres)**:
   - Waktu Fajar (Dawn Horizon), Tengah Hari Korporat (Clear Horizon), Senja Emas (Golden Hour), dan Malam Siber (Obsidian Neon).

---

## 4. Fasa 3: Pengalaman Sensori & Interaktiviti Unik

_Objektif: Pengunjung terpukau dan seronok meneroka setiap inci portfolio._

1. **Audio Mikro Sintesis Masa Nyata (Web Audio Haptic Soundscape)**:
   - Tiada fail MP3 berat; guna sintesis Web Audio API tulen (beberapa baris kod):
     - Dengkuran halus reaktor kuasa rendah (subtle ambient hum - boleh dimatikan).
     - Bunyi 'chime' kaca berfrekuensi tinggi yang mewah apabila mengklik terminal.
     - 'Whoosh' aero apabila kamera meluncur dari satu pulau ke pulau lain.
2. **Kad Pameran Projek Terapung 3D (Holographic Inspection)**:
   - Apabila memilih projek (cth: eMesys, SUTERA, ADiMS), model mini 3D atau arkitektur topologi terapung keluar daripada skrin monitor ke ruang udara 3D.
3. **Kawalan Gyroscope untuk Telefon Bimbit**:
   - Pusingan telefon membolehkan pelawat melihat panorama 360° secara semulajadi menggunakan sensor orientasi peranti.

---

## 5. Gabungan Skill & MCP yang Disyorkan

| Bidang                           | Skill / MCP                          | Peranan Utama                                                          |
| -------------------------------- | ------------------------------------ | ---------------------------------------------------------------------- |
| **Pembersihan & Kualiti Kod**    | `simplify` / `safe-refactor`         | Membuang kod lapuk secara selamat tanpa merosakkan sistem sedia ada.   |
| **Penskalaan UI & Kaca**         | `modern-ui-patterns` / `antislop-ui` | Mereka bentuk komponen HUD kaca terapung dan mikro-interaksi sentuhan. |
| **Kinetik & Animasi**            | `gsap`                               | Melicinkan peralihan kamera dan pergerakan HUD secara sinematik.       |
| **Audit Aksesibiliti & Kontras** | `ux-ui-agent-skills:a11y-audit`      | Memastikan kontras monitor 3D dan kawalan mematuhi standard WCAG 2.2.  |
| **Pengoptimuman Prestasi**       | `ux-ui-agent-skills:performance`     | Menjaga skor Web Vitals (LCP, INP, CLS) dan kelancaran 60 FPS.         |
