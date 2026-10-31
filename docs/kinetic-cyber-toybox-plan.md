# The Kinetic Cyber Toybox

Status: pelan simpanan, bukan kelulusan melaksanakan keseluruhan transformasi.
Tarikh: 30 Oktober 2026.

## 1. Keputusan produk

Laksanakan dahulu pilihan A: kekalkan enam pulau, lautan, laluan orbit dan portfolio editorial; tukar prop hotspot menjadi objek taktil; keluarkan papan monitor teks; bina satu prototaip laser keselamatan. Pilihan B, konsol empat modul, hanya bermula selepas penilaian pilihan A.

Tujuan: pengunjung memahami bidang kepakaran melalui interaksi ringkas tanpa kehilangan akses kepada nama, jawatan, CV, bukti projek dan hubungan. Permainan ialah ilustrasi kemahiran, bukan bukti prestasi, sistem SOC sebenar, demonstrasi OpenCV sebenar atau telemetri produksi.

Inspirasi terhad kepada sifat boleh dimainkan dan reka bentuk industri taktil. Tiada penyalinan dunia, model, permainan, jenama atau susun atur produk tertentu.

## 2. Arah visual

- Domain: portfolio kejuruteraan perisian dan keselamatan rangkaian.
- Audiens: perekrut, ketua teknikal dan bakal pelanggan; padat, profesional, boleh diteroka.
- Mood: taktil. Maklum balas mengikuti tindakan pengguna, bukan animasi hiasan tanpa henti.
- ENERGY 3 / RHYTHM 3 / MOTION 3; reduced motion menggantikan spring dan zarah dengan maklum balas statik.
- Hierarki: dunia 3D sebagai fokus visual, identiti di pinggir atas, kawalan aktif di pinggir bawah, CV sentiasa tersedia.
- Tipografi: gunakan font dan token projek sedia ada. Teks penting ialah DOM, bukan CanvasTexture.
- Warna: tema sedia ada dikekalkan. Neon menandakan laluan laser dan sasaran simulasi, bukan hiasan semua panel.
- Panel kawalan legap: teks perlu kekal terbaca merentasi langit, laut dan cuaca yang berubah.
- Ruang: kawasan tengah bebas untuk pointer; kawalan boleh dibuka/tutup supaya tidak menutup prop.

`DESIGN.md` menerangkan arah terdahulu. Dokumen ini merekodkan skop baharu yang diminta pengguna; tidak menukar sejarah atau fakta portfolio secara senyap.

## 3. Pilihan A: prototaip pulau taktil

### 3.1 Termasuk

1. Kekalkan geometri pulau, jambatan, teras, kamera orbit, atmosfera dan tema.
2. Keluarkan monitor teks daripada persembahan WebGL. Jangan padam data CV, kandungan editorial atau tekstur bahan PBR.
3. Semua prop hotspot mempunyai kedudukan asal, sasaran seretan, sesaran dan halaju spring.
4. Tekan/seret prop menggerakkan prop sahaja. Seret ruang kosong mengawal orbit.
5. Pelepasan menghasilkan lantunan teredam kembali ke asal; had sesaran dan halaju mengelakkan objek hilang.
6. Pointer capture, pointercancel, kehilangan fokus, pertukaran pulau, pertukaran mod dan tab tersembunyi mesti melepaskan pegangan dengan selamat.
7. Butang DOM bagi setiap prop menyediakan tindakan tanpa drag. Enter/Space menggunakan semantik butang asli.
8. Stesen network mempunyai grid laser, bebola ancaman simulasi dan kesan pemintasan terhad.
9. Butang laser menyediakan tindakan setara tanpa perlu membidik atau menyeret.
10. Audio opt-in menggunakan utiliti audio projek. Tiada autoplay, audio wajib atau getaran peranti tanpa izin berasingan.
11. Status DOM menerangkan pilihan prop dan pemintasan; tiada pengumuman koordinat setiap bingkai.
12. Mod editorial, PDF, WhatsApp dan e-mel asal tidak bergantung kepada WebGL.

### 3.2 Tidak termasuk

- Rigid-body engine, perlanggaran antara semua prop, multiplayer, skor awan atau leaderboard.
- Sistem SOC, pengimbasan rangkaian, kamera sebenar atau model AI.
- Pelaksanaan penuh tuil perusahaan, lidar dan telefon untuk pilihan B.
- Pemadaman arkib kandungan lama, commit, push atau deployment produksi.

### 3.3 Model fizik minimum

Spring mengembalikan sesaran ke sasaran. Integrasi menggunakan langkah masa terbatas/substep, redaman, had kedudukan dan penghentian apabila tenaga kecil. Kedudukan asal disimpan dalam ruang tempatan parent supaya putaran pulau tidak mengubah arah spring.

Satu pointer sahaja memiliki drag. Raycast menentukan prop dahulu; kamera hanya bergerak jika tiada prop dipegang. Gerakan dikira pada satah yang konsisten, bukan menggunakan perbezaan piksel sebagai unit dunia secara terus. Pointer kedua diabaikan sehingga pointer pertama dilepaskan.

Reduced motion dan jeda membatalkan halaju serta kesan zarah. Butang masih memberikan pengesahan statik. Resume tidak menggunakan delta masa sejak tab mula tersembunyi.

### 3.4 Kontrak integrasi

- `FiberSpineWorld.ts`: scene, picking, spring, laser, lifecycle dan disposal.
- `FiberSpineExperience.svelte`: identiti, butang asli, bahasa, tema, status, audio opt-in dan fallback editorial.
- `spine-data.ts`: sumber fakta portfolio; tidak digunakan sebagai papan markah permainan.
- `bounceProp(hotspotId)`: tindakan alternatif tanpa drag.
- `fireSecurityLaser()`: pemintasan simulasi, dikawal kesiapsiagaan.
- `resetToys()`: kedudukan dan sesi simulasi dikembalikan.
- `onToyStatus({ hits, ready })`: kiraan sesi tempatan dan kesiapsiagaan; bukan statistik sebenar.

Had kontrak diperiksa semula terhadap kod sebenar sebelum penyerahan. Tiada dependency runtime baharu diperlukan untuk spring.

## 4. Keputusan sama ada pilihan A diteruskan

Jalankan sesi pemerhatian ringkas dengan sekurang-kurangnya seorang perekrut/ pembaca CV, seorang pengguna teknikal dan seorang pengguna mudah alih. Bilangan ini ialah rancangan kajian, bukan hasil kajian.

Tugasan pemerhatian:

1. Kenal pasti nama dan bidang kerja tanpa menyentuh scene.
2. Cari dan buka CV tanpa bermain.
3. Cuba gerakkan satu prop tanpa penerangan lisan.
4. Cari stesen keselamatan, tembak laser, fahami bahawa ia simulasi.
5. Lakukan tindakan setara dengan keyboard sahaja.
6. Tukar kepada editorial apabila 3D tidak dikehendaki.

Teruskan A jika tindakan jelas, identiti tidak tenggelam, pulau tidak menghalang interaksi dan prestasi pada telefon sebenar diterima. Baiki affordance dahulu jika pengguna tidak mengenal pasti prop boleh diseret. Pertimbangkan B jika perjalanan antara enam pulau mengganggu pemahaman atau empat demonstrasi utama memerlukan ruang dan kamera khusus.

Tiada ambang conversion atau dakwaan peningkatan direka. Rekod masa tugasan, kesilapan, komen dan kegagalan peranti sebenar sebelum menetapkan sasaran seterusnya.

## 5. Pilihan B: konsol empat modul

### 5.1 Stesen Pertahanan TNB SOC

**Objek:** pemancar berkembar, grid pertahanan, bebola ancaman dan slot penjana semula.

**Interaksi:** seret sasaran, tekan pemancar atau butang `Tembak laser`. Pemintasan memadam sasaran sementara dan menyalakan zarah ringkas. Selepas cooldown, sasaran kembali bersedia. Reset menghapuskan kiraan sesi.

**Cerita:** pengalaman keselamatan rangkaian/SOC, dengan pautan HTML kepada pengalaman sebenar. Label jelas bahawa demonstrasi tidak mewakili alat, data atau rangkaian TNB.

**Keadaan:** loading, sedia, dipegang, menembak, cooldown, jeda, reduced motion dan WebGL gagal. Pointercancel tidak menghasilkan tembakan tanpa sengaja.

**Penerimaan:** butang keyboard setara, pemintasan diumumkan sekali, pool kesan tidak bertambah tanpa had, maklumat tidak bergantung kepada merah/hijau sahaja.

### 5.2 Stesen Perusahaan YHCM

**Objek:** tuil mekanikal, saluran data konseptual, kincir servis dan blok pelayan.

**Interaksi:** tuil terbatas pada satu paksi, nilai input mengawal kelajuan kincir dan tahap pencahayaan secara terus. Tambah input `range` berlabel sebagai kawalan setara. Home/End dan anak panah menggunakan semantik range asli.

**Cerita:** sistem perusahaan dan full-stack; pergerakan menerangkan aliran, bukan throughput terukur. Gunakan projek dan hubungan syarikat yang disahkan dalam data sedia ada.

**Teknik:** instancing bagi pelayan berulang; saluran bersegmen dengan offset shader atau objek pool. Jangan simulasi bendalir sebenar.

**Penerimaan:** tuil dan range sentiasa segerak, tiada nilai di luar julat, mod statik menunjukkan tahap tanpa putaran. Label seperti `Intensiti simulasi`, bukan `requests/sec` rekaan.

### 5.3 Stesen Computer Vision & AI

**Objek:** kepala pemindai, sasaran geometri dan kotak sempadan.

**Interaksi:** pemindai menghala kepada pointer dalam kawasan modul sahaja; pengguna keyboard memilih sasaran melalui butang. Sentuhan menggunakan tap sasaran, bukan hover.

**Cerita:** demonstrasi geometri penjejakan. Label `Simulasi penjejakan kursor` perlu hadir. Pautan projek OpenCV/MCP dipaparkan berasingan; jangan mendakwa model AI sedang membuat inferens.

**Teknik:** koordinat pointer dinormalisasi dan dihadkan. Overlay DOM/SVG bagi label; transform matriks bagi bracket 3D. Tiada izin kamera, muat naik imej, API AI atau penghantaran koordinat keluar.

**Penerimaan:** penjejakan berhenti apabila pointer meninggalkan modul; reduced motion memilih sasaran statik; telemetri tidak membanjiri live region.

### 5.4 Stesen Hubungan Satelit

**Objek:** konsol telefon dengan butang mekanikal dan antena.

**Interaksi:** butang 1 memilih WhatsApp; butang 2 memilih e-mel; butang 3 membuka CV. Paparkan nama destinasi sebelum tindakan. Tekanan atau drag yang dibatalkan tidak membuka pautan.

**Teknik:** tindakan penting menggunakan pautan DOM asli dengan URL daripada `PROFILE`; animasi butang 3D hanyalah representasi. Gunakan `noopener noreferrer` bagi tab baharu. Jangan bina borang penghantaran atau backend yang tidak diminta.

**Penerimaan:** Enter membuka destinasi betul, Escape membatalkan pilihan, sentuhan tidak menyebabkan dua pembukaan, audio opt-in sahaja. Tiada mesej dihantar secara automatik.

## 6. Susun atur dan navigasi

### Desktop

Identiti dan jawatan di atas. Modul aktif dominan di tengah. Pemilih empat modul pada satu jalur; panel maklumat kecil di sisi. CV dan hubungan kekal pautan HTML. Kamera berpindah berdasarkan pilihan eksplisit, bukan mengunci pengguna kepada perjalanan wajib.

### Telefon

Identiti dahulu, viewport 3D selepasnya, kawalan tindakan dalam aliran dokumen. Satu modul aktif, bukan empat viewport WebGL serentak. Tiada hover wajib. Uji 280/320/414px, landscape, safe area dan 200%/400% zoom. Ini sasaran ujian, bukan dakwaan responsive lulus.

### Fallback

Editorial HTML boleh dibaca semasa JavaScript/WebGL tidak tersedia. Kegagalan import, context loss atau initialization mesti mengembalikan laluan CV yang jelas, bukan loading tanpa penghujung. Reduced motion bukan alasan membuang maklumat atau pautan.

## 7. Accessibility

- **Target:** WCAG 2.2 Level AA sebagai sasaran reka bentuk; tiada dakwaan pematuhan sebelum audit dan ujian manusia.
- **Per-component criteria:** prop/laser, SC 2.1.1, 2.5.7, 2.5.8 dan 4.1.2; butang asli Tab/Enter/Space. Tuil, SC 1.3.1, 2.1.1, 4.1.2; range asli dengan anak panah/Home/End. Pemilih modul menggunakan butang berlabel dan `aria-pressed` atau navigasi pautan, bukan tab palsu. Disclosure menggunakan `aria-expanded` dan `aria-controls` sebenar. Hubungan menggunakan pautan asli, SC 2.4.4.
- **Foreclosing decisions:** drag-only diganti butang; WebGL-only diganti DOM editorial; hover-only diganti tap/klik; audio tidak wajib; tiada countdown wajib; gerakan tidak penting boleh dijeda.
- **Color tokens:** token sedia ada bagi light/dark; ujian `npm run test:contrast` mengukur pasangan statik sahaja. Kontras rendered, focus, hover, disabled dan latar WebGL perlu audit pelayar. Keputusan pengukuran direkodkan dalam laporan verifikasi, bukan diandaikan di sini.
- **Structure:** satu main aktif, satu h1 aktif, h2 modul, h3 bukti; identiti, utiliti, tindakan modul, navigasi, editorial. Fokus selepas pertukaran mod kembali kepada tajuk atau butang mod yang wujud. Tambah skip link untuk kandungan aktif.
- **Verification:** keadaan default, panel dibuka, pilihan modul, laser cooldown, reset, tema light/dark, reduced motion, forced-colors, fallback import dan keyboard. `--interact` menyenaraikan keadaan yang dibina. Audit pada setiap slice sebelum integrasi, kemudian sebelum merge.
- **Manual budget:** sekurang-kurangnya satu sesi NVDA pada Windows, satu sesi sentuhan telefon sebenar, satu pemeriksaan zoom/fokus dan satu semakan visual tanpa audio. Nama kawalan baharu ialah draf untuk pengesahan manusia. Penilaian manual ialah kerja berasingan, bukan dianggap lulus oleh axe.

## 8. Prestasi, keselamatan dan lifecycle

- Satu renderer, satu RAF, satu sesi pointer; modul tidak aktif tidak menjalankan kerja fizik.
- Gunakan geometry/material dikongsi, pool zarah tetap, tiada texture teks yang dikemas kini setiap bingkai.
- Hadkan device pixel ratio menggunakan strategi scene sedia ada; ukur pada peranti sebenar sebelum menambah postprocessing.
- Tab tersembunyi menghentikan render. Resume membuang delta masa tertunggak.
- Disposal membuang listeners, pointer capture, timers, geometry, material, texture dan renderer milik scene.
- Tiada backend, analytics atau penyimpanan skor diperlukan. Tetapan peribadi sedia ada sahaja dalam localStorage, dibaca dalam try/catch.
- URL hubungan datang daripada data dipercayai. Jangan buka URL daripada parameter query atau input pengguna.
- Jangan masukkan data SOC, pelanggan, token API atau dokumen dalaman dalam aset portfolio.

## 9. Urutan pelaksanaan pilihan B

| Fasa | Hasil | Syarat keluar |
| --- | --- | --- |
| B0 | Persetujuan arah selepas A diuji | Maklum balas A direkod; pengguna memilih B |
| B1 | Shell konsol dan DOM fallback | Identiti/CV/keyboard/tema berfungsi tanpa modul |
| B2 | Port modul laser A | Ujian pointer, reset, cooldown, pause dan disposal lulus |
| B3 | Tuil perusahaan | Range dan 3D segerak; tiada angka prestasi palsu |
| B4 | Penjejakan vision | Pointer/tap/keyboard setara; label simulasi jelas |
| B5 | Hubungan satelit | Destinasi disahkan; tiada navigasi tidak sengaja |
| B6 | Integrasi dan penggilapan | Audit keadaan, regression, peranti sebenar, pengesahan manusia |

Anggaran masa tidak ditetapkan sebelum hasil A dan sasaran peranti diketahui. Jangan membina B2 hingga B5 serentak sebelum shell serta kontrak input stabil.

## 10. Verifikasi dan rollback

Ujian unit: spring stabil pada pelbagai delta masa, nilai kekal finite, had gerakan, reset, input ID tidak sah dan reduced motion. Ujian pelayar: drag prop bukan orbit, drag ruang kosong tetap orbit, pointercancel, pertukaran pulau, butang setara, laser dan cooldown, tema, bahasa, fallback serta PDF.

Regresi visual monitor lama kini mempunyai kontrak yang sengaja berubah. Jangan menamakan ujian lama lulus tanpa mengemas kini jangkaannya. Kekalkan ujian data/editorial yang masih relevan.

Rollback prototaip melalui diff Git yang disemak; jangan overwrite perubahan pengguna. Kekalkan data CV dan aset asal. B tidak menggantikan A secara diam-diam. Commit, push dan deployment hanya selepas arahan berasingan.

## 11. Kriteria penyerahan

- Kod boleh diperiksa, dibina dan diuji dengan arahan repositori.
- Laporan menyenaraikan lulus, gagal, belum diukur dan pemeriksaan manual.
- Setiap butang baharu mempunyai tindakan yang diuji atau ditandai belum disahkan.
- Tiada dakwaan WCAG, prestasi, responsif atau kualiti visual berdasarkan bacaan kod sahaja.
- Pelan B kekal standby sehingga pengguna memutuskan prototaip A tidak memadai.
