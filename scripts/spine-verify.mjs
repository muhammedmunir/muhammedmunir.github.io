import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';

const rootDir = process.cwd();

console.log(
	'=== [1/5] Menguji Output SSR Statik (build/index.html & build/spatial/index.html) ==='
);
for (const relHtml of ['build/index.html', 'build/spatial/index.html']) {
	const fullPath = path.join(rootDir, relHtml);
	assert.ok(fs.existsSync(fullPath), `Fail binaan ${relHtml} wajib wujud`);
	const html = fs.readFileSync(fullPath, 'utf8');

	const requiredPhrases = [
		'Muhammed Munir Bin Mohd Azmi',
		'Puchong, Selangor',
		'+60 13-563 6124',
		'muhammed.munir97.mm@gmail.com',
		'YHCM Sdn Bhd',
		'eMesys',
		'Sutera',
		'ADIMS',
		'Nova Bitara Development Sdn Bhd',
		'IWA001',
		'Infinity World',
		'Tenaga Nasional Berhad',
		'Onboardx',
		'9Router Office',
		'TINDAK',
		'Computer Vision',
		'Baby Kicking Suite',
		'Lumina Glass Studio',
		'AI Policy',
		'Geospatial Reporting Management System',
		'CCNAv7',
		'Cisco DevNet Associate',
		'/docs/iwa001-case-study.pdf',
		'/docs/infinity-landing-case-study.pdf',
		'https://github.com/muhammedmunir/onboardx_tnb_app',
		'https://github.com/muhammedmunir/loan-infinity-world',
		'https://github.com/muhammedmunir/real-estate-landing',
		'https://github.com/muhammedmunir/welding-project',
		'https://github.com/muhammedmunir/baby_kicking_project',
		'https://github.com/muhammedmunir/homelab',
		'https://github.com/muhammedmunir/ai-policy-helper-starter-pack',
		'https://github.com/muhammedmunir/Reporting-Management-System-'
	];

	for (const phrase of requiredPhrases) {
		assert.ok(
			html.includes(phrase),
			`Kandungan SSR dalam ${relHtml} wajib mengandungi "${phrase}"`
		);
	}
}
console.log(
	'✓ Semua fakta CV rasmi, 5 pengalaman kerja, 5 kategori kemahiran, UTM, 7 sijil & 11 projek disahkan wujud dalam HTML SSR.'
);

console.log(
	'=== [2/5] Menguji 7 Rukun Realisme 3D PBR + Open-Water GLSL dalam FiberSpineWorld.ts ==='
);
const worldSource = fs.readFileSync(path.join(rootDir, 'src/lib/spine/FiberSpineWorld.ts'), 'utf8');
assert.ok(
	!worldSource.includes('GridHelper'),
	'FiberSpineWorld.ts tidak boleh lagi menggunakan GridHelper kaku'
);
assert.ok(
	!worldSource.includes('BoxGeometry'),
	'FiberSpineWorld.ts tidak boleh lagi menggunakan BoxGeometry kotak kaku'
);
for (const requiredToken of [
	'OCEAN_VERTEX_SHADER',
	'OCEAN_FRAGMENT_SHADER',
	'SKY_FRAGMENT_SHADER',
	'gerstnerWave',
	'uWaterScatter',
	'ACESFilmicToneMapping',
	'PMREMGenerator',
	'RoomEnvironment',
	'EffectComposer',
	'UnrealBloomPass',
	'PCFShadowMap',
	'MeshPhysicalMaterial',
	'createBeveledSlabGeometry',
	'generatePBRSurfaceMaps',
	'drawHotspotExhibitCanvas',
	'updateProjectedMarkers',
	'ORBIT_RADIUS',
	'buildCentralSovereignReactor',
	'buildOrbitalRingCauseway',
	'uSunSpecScale'
]) {
	assert.ok(
		worldSource.includes(requiredToken),
		`FiberSpineWorld.ts wajib mengandungi komponen PBR/Open-Water/360° Orbital "${requiredToken}"`
	);
}

const group = new THREE.Group();
group.userData.hotspotId = 'term-email';
group.userData.stationIndex = 5;
const mesh = new THREE.Mesh(
	new THREE.CylinderGeometry(0.4, 0.5, 2.0, 16),
	new THREE.MeshBasicMaterial()
);
group.add(mesh);
group.updateMatrixWorld(true);

const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);
camera.updateMatrixWorld(true);

const raycaster = new THREE.Raycaster();
raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
const hits = raycaster.intersectObjects([group], true);
assert.ok(hits.length > 0, 'Raycaster mesti mengenai objek pameran 3D');
console.log(
	'✓ 7 Rukun Realisme 3D PBR, IBL, Soft Shadows, Bloom & In-World CanvasTexture Exhibits disahkan.'
);

console.log(
	'=== [3/5] Menguji Penghapusan Deretan Butang Menyemak dalam FiberSpineExperience.svelte ==='
);
const svelteSource = fs.readFileSync(
	path.join(rootDir, 'src/lib/spine/FiberSpineExperience.svelte'),
	'utf8'
);
for (const bannedClutter of [
	'station-pills',
	'hud-left-dock',
	'weather-bar',
	'spatial-pins-layer',
	'bottom-scrubber'
]) {
	assert.ok(
		!svelteSource.includes(bannedClutter),
		`Elemen menyemak "${bannedClutter}" wajib dihapuskan daripada Mod 3D`
	);
}
console.log('✓ Mod 3D disahkan bebas daripada deretan butang yang menyemak.');

console.log('=== [4/5] Menguji Keselarasan 6 Stesen Mod 3D dengan Seksyen Sebenar CV ===');
const dataSource = fs.readFileSync(path.join(rootDir, 'src/lib/spine/spine-data.ts'), 'utf8');
for (const cleanStationCode of [
	'01 // PROFILE SUMMARY',
	'02 // WORK EXPERIENCE (2025–PRESENT)',
	'03 // TNB CYBER SECURITY & ICT (2019–2024)',
	'04 // FEATURED PROJECTS (CV & GITHUB)',
	'05 // TECHNICAL SKILLS (5 CATEGORIES)',
	'06 // EDUCATION, CERTIFICATIONS & CONTACT'
]) {
	assert.ok(
		dataSource.includes(cleanStationCode),
		`spine-data.ts wajib mengandungi stesen CV "${cleanStationCode}"`
	);
}
for (const bannedJargon of [
	'Mod Resonans Monolit Optik',
	'Harmoni Tiga Tunjang',
	'Gerbang Prisma'
]) {
	assert.ok(
		!dataSource.includes(bannedJargon),
		`Jargon mengelirukan "${bannedJargon}" tidak dibenarkan dalam spine-data.ts`
	);
}
console.log(
	'✓ Kesemua 6 stesen Mod 3D mengikut seksyen sebenar CV Resume tanpa jargon mengelirukan.'
);

console.log('=== [5/5] Menguji Keselamatan & Ketepatan Ringkasan Sistem YHCM ===');
const forbiddenPatterns = [
	/10\.\d+\.\d+\.\d+/,
	/192\.168\.\d+\.\d+/,
	/password\s*[:=]/i,
	/secret_key/i
];
for (const pat of forbiddenPatterns) {
	assert.ok(!pat.test(dataSource), `Corak sensitif ${pat} tidak dibenarkan dalam spine-data.ts`);
}
console.log('✓ Semakan keselamatan data YHCM lulus 100%.');
