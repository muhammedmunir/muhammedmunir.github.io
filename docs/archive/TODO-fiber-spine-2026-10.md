# Senarai Tindakan (TODO) — Portfolio 3D The Living Fiber Spine

Pelan tindakan kejuruteraan bagi menghapuskan beban kelajuan (lag), membersihkan kod zombi, dan menaik taraf visual ke tahap pameran 3D bertaraf antarabangsa.

---

## 1. Pembersihan Sisa Lapuk & Kod Zombi (Hapus Beban Projek)

- [x] **Arkibkan / Padam modul terbengkalai**:
  - `src/lib/facility/*` (dipadam)
  - `src/lib/motion/*` (dipadam)
  - `src/lib/living/*` (dipadam)
  - `src/lib/engine/*` (dipadam)
  - `src/lib/spatial/*` (dipadam)
  - `src/lib/deck/*` (dipadam)
  - `src/lib/components/*` (dipadam)
  - `src/lib/NeuralCortexCanvas.svelte` & `src/lib/JarvisHUD.svelte` (dipadam)
- [x] **Kemas kini skrip ujian**: Buang ujian sisa yang menguji komponen lama dalam `scripts/` supaya `npm test` fokus 100% pada sistem aktif (37/37 ujian aktif lulus).

---

## 2. Pengoptimuman Prestasi & Penyingkiran Lag (60 FPS Stabil)

- [x] **Sifar Alokasi Memori dalam `requestAnimationFrame`**:
  - Menggantikan `vector.clone()` dalam `updateCamera()` dengan vektor kolam statik (`tempRadialOut`, `tempTangentRight`, `tempAnchorPt`, `tempCamPos`, `tempLookTarget`) bagi menghapuskan stutter Garbage Collector.
- [x] **Prapengiraan Selaman Denyutan Optik (Zero-Loop Pulse Optimization)**:
  - 432 pengiraan jarak geometri dan punca kuasa dua (`Math.sqrt`) disingkirkan daripada gelung animasi dan diprapengira sekali sahaja semasa permulaan.
- [x] **Skala Resolusi Dinamik (Dynamic Resolution Scaling - DRS)**:
  - Pengurang beban automatik melaraskan nisbah piksel (DPR) jika kadar bingkai jatuh bawah 40 FPS pada GPU perlahan, dan memulihkan ketajaman apabila stabil.
- [x] **Nyahaktifkan ShadowMap Berat Pada Objek Mikro**:
  - Menyingkirkan `castShadow` pada puluhan objek mikro (tiang tambat bollards, kekisi struts, pylon props) untuk memotong pas render bayang GPU sebanyak lebih 50%.
- [x] **Migrasi `THREE.Clock` ke `WorldTimer`**:
  - Menghapuskan amaran deprecation Three.js v0.186+ sepenuhnya.
- [x] **Pecahkan Kod (Dynamic Code-Splitting)**:
  - Muatkan Three.js secara dinamik (`import()`) dan pisahkan ke dalam chunk `three-vendor` bagi memotong saiz fail permulaan awal.
- [x] **Penyingkiran Arkib Penuh CV (Dossier Modal)**:
  - Memadamkan modal `SpineDossierModal.svelte`, `modal-focus.ts`, dan logik arkib lapuk demi antaramuka bersih berfokuskan Terminal Skrin Penuh 3D.

---

## 3. Peningkatan Visual 3D "Memanjakan Mata" (Aesthetic Wow-Factor)

- [x] **Bioluminescent Lautan Siber Bercahaya**:
  - Pendaran elektrik pendar-cahaya (cyan/turquoise bioluminescent shimmer) disuntik pada puncak buih ombak Gerstner (`OCEAN_FRAGMENT_SHADER`).
- [x] **Maklum Balas Audio Mikro (Web Audio API Haptics)**:
  - Mengintegrasikan sintesis audio haptik tulen (`sound.ts`) untuk teleportasi stesen (`playWarp`), sentuhan terminal (`playConfirm`), dan pengimbasan cuaca (`playScan`) dengan butang toggle audio HUD.
- [x] **Atmosfera & Sinematik Horizon**:
  - Lapisan kabus volumetrik beranimasi halus (fog exp2 bersandarkan kedalaman) pada kaki laut.
- [x] **Bahan Kaca Fizikal Solid (Tactile Glass & Metal PBR)**:
  - Gilap bahan monitor konsol dengan `roughnessMap`, `clearcoat`, `ior: 1.52`, dan refleksi persekitaran (HDR environment light cubemap) untuk kilauan logam perindustrian yang mewah.

---

## 4. Format & Pengesahan Kualiti

- [x] Format keseluruhan kod sumber dengan Prettier (`npm run format` & `npm run lint` 100% lulus).
- [x] Ujian kontras tema 314/314 pasangan token lulus (≥ 4.68:1).
- [x] Semakan jenis `svelte-check` lulus dengan 0 ralat dan 0 amaran (720 fail).
- [x] Ujian unit 42/42 lulus bersih.
- [x] Binaan pengeluaran Vite lulus bersih dengan pemecahan kod Three.js.
