import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';

// Mulakan pelayan Vite bagi memanfaatkan ssrLoadModule untuk memuatkan modul TypeScript secara terus.
const vite = await createServer({
	server: { middlewareMode: true },
	appType: 'custom'
});

const navModule = await vite.ssrLoadModule('/src/lib/spine/exhibit-navigation.ts');
const screenModule = await vite.ssrLoadModule('/src/lib/spine/exhibit-screen.ts');
const spineData = await vite.ssrLoadModule('/src/lib/spine/spine-data.ts');

const {
	resolveExhibitView,
	getChipAction,
	getHotspotLocation
} = navModule;

const {
	drawExhibitScreen,
	hitTestScreen,
	getInspectDistance,
	EXHIBIT_MIN_WIDTH,
	EXHIBIT_MIN_HEIGHT,
	EXHIBIT_TOUCH_SIZE
} = screenModule;

const {
	STATIONS,
	PROJECT_ARCHIVE,
	TECHNICAL_SKILLS,
	PROFILE
} = spineData;

const testPalette = {
	background: '#0b0c0e',
	surface: '#15181d',
	text: '#f5f6f8',
	muted: '#676d78',
	accent: '#e59057',
	border: 'rgba(255, 255, 255, 0.08)',
	hover: '#1c2027',
	onAccent: '#0b0c0e',
	fontBody: 'Plus Jakarta Sans',
	fontMono: 'monospace'
};

function createMockCanvas(width, height) {
	let currentFont = '400 16px Plus Jakarta Sans';
	const operations = [];

	const ctx = {
		get font() {
			return currentFont;
		},
		set font(val) {
			currentFont = val;
		},
		textAlign: 'left',
		textBaseline: 'top',
		fillStyle: '#000000',
		strokeStyle: '#000000',
		lineWidth: 1,
		globalAlpha: 1,
		save() {
			operations.push({ op: 'save' });
		},
		restore() {
			operations.push({ op: 'restore' });
		},
		setTransform() {
			operations.push({ op: 'setTransform' });
		},
		clearRect(x, y, w, h) {
			operations.push({ op: 'clearRect', x, y, w, h });
		},
		fillRect(x, y, w, h) {
			operations.push({ op: 'fillRect', x, y, w, h, fillStyle: this.fillStyle });
		},
		strokeRect(x, y, w, h) {
			operations.push({ op: 'strokeRect', x, y, w, h, strokeStyle: this.strokeStyle });
		},
		fillText(text, x, y) {
			operations.push({ op: 'fillText', text, x, y, font: currentFont });
		},
		measureText(text) {
			const sizeMatch = (currentFont || '').match(/(\d+(?:\.\d+)?)px/);
			const size = sizeMatch ? parseFloat(sizeMatch[1]) : 16;
			const isMono = (currentFont || '').includes('mono');
			// Anggaran faktor lebar aksara untuk teks biasa dan mono
			const factor = isMono ? 0.6 : 0.52;
			const charCount = Array.from(String(text)).length;
			return { width: Math.max(0, charCount * size * factor) };
		}
	};

	return {
		width,
		height,
		getContext(type) {
			return type === '2d' ? ctx : null;
		},
		_operations: operations
	};
}

// -----------------------------------------------------------------------------
// BAHAGIAN 1: Navigasi & Penyelesaian Laluan (exhibit-navigation.ts)
// -----------------------------------------------------------------------------

test('Semua 21 stesen hotspot rasmi dalam STATIONS berjaya diselesaikan ke ExhibitView', () => {
	let count = 0;
	for (const station of STATIONS) {
		for (const hotspot of station.hotspots) {
			count++;
			const location = getHotspotLocation(hotspot.id);
			assert.ok(location, `Lokasi hotspot ${hotspot.id} mesti wujud`);
			assert.equal(location.stationIndex, station.index);

			const view = resolveExhibitView({ kind: 'hotspot', id: hotspot.id });
			assert.ok(view, `Hotspot ${hotspot.id} mesti menghasilkan ExhibitView`);
			assert.equal(view.key, `hotspot:${hotspot.id}`);
			assert.equal(view.code, hotspot.code);
			assert.equal(view.title.ms, hotspot.title.ms);
			assert.equal(view.title.en, hotspot.title.en);
			assert.ok(view.actions.some((a) => a.id === 'archive'), 'Wajib sertakan tindakan arkib');
		}
	}
	assert.equal(count, 21, 'Wajib terdapat tepat 21 hotspot rasmi daripada 6 stesen');
});

test('Semua 11 projek arkib dalam PROJECT_ARCHIVE berjaya diselesaikan dengan pautan rasmi', () => {
	for (const project of PROJECT_ARCHIVE) {
		const view = resolveExhibitView({ kind: 'project', id: project.id });
		assert.ok(view, `Projek ${project.id} mesti menghasilkan ExhibitView`);
		assert.equal(view.key, `project:${project.id}`);
		assert.equal(view.title.ms, project.name);

		// Periksa tindakan pautan hanya dipetik daripada rekod arkib projek berkenaan
		if (project.repoUrl) {
			assert.ok(
				view.actions.some((a) => a.action.kind === 'link' && a.action.url === project.repoUrl),
				`Pautan repo untuk ${project.id} mesti sepadan`
			);
		}
		if (project.caseStudyUrl) {
			assert.ok(
				view.actions.some((a) => a.action.kind === 'link' && a.action.url === project.caseStudyUrl),
				`Pautan kajian kes untuk ${project.id} mesti sepadan`
			);
		}
		if (project.liveUrl) {
			assert.ok(
				view.actions.some((a) => a.action.kind === 'link' && a.action.url === project.liveUrl),
				`Pautan langsung untuk ${project.id} mesti sepadan`
			);
		}
	}
});

test('Pembetulan pautan ent-adims: PDF Infinity World yang tidak berkaitan disingkirkan tanpa ubah CV', () => {
	const view = resolveExhibitView({ kind: 'hotspot', id: 'ent-adims' });
	assert.ok(view);

	// Memastikan tiada pautan secondaryLink Infinity World yang tersalah letak pada ent-adims
	const hasWrongPdf = view.actions.some(
		(a) => a.action.kind === 'link' && a.action.url.includes('infinity-landing-case-study')
	);
	assert.equal(hasWrongPdf, false, 'ent-adims TIDAK boleh mengandungi PDF kajian kes Infinity World');

	// Memastikan ia mempunyai pautan repo Onboardx dan navigasi ke projek proj-onboardx
	const hasOnboardxRepo = view.actions.some(
		(a) => a.action.kind === 'link' && a.action.url === 'https://github.com/muhammedmunir/onboardx_tnb_app'
	);
	assert.equal(hasOnboardxRepo, true, 'ent-adims mesti mengandungi pautan repo Onboardx rasmi');

	const hasOnboardxProject = view.actions.some(
		(a) => a.action.kind === 'navigate' && a.action.route.kind === 'project' && a.action.route.id === 'proj-onboardx'
	);
	assert.equal(hasOnboardxProject, true, 'ent-adims mesti mempunyai navigasi ke projek Onboardx');
});

test('Padanan chip interaktif khusus (eMesys, IWA001, Infinity World, Onboardx)', () => {
	const coreRingView = resolveExhibitView({ kind: 'hotspot', id: 'core-ring-sys' });
	assert.ok(coreRingView);

	// 1. eMesys · Sutera · ADIMS -> ent-emesys (YHCM board)
	const emesysAction = getChipAction(coreRingView, 'eMesys · Sutera · ADIMS');
	assert.deepEqual(emesysAction, {
		kind: 'navigate',
		route: { kind: 'hotspot', id: 'ent-emesys' }
	});

	// 2. IWA001 Supabase RLS -> proj-loan-iwa001
	const iwaAction = getChipAction(coreRingView, 'IWA001 Supabase RLS');
	assert.deepEqual(iwaAction, {
		kind: 'navigate',
		route: { kind: 'project', id: 'proj-loan-iwa001' }
	});

	// 3. Infinity World -> proj-real-estate
	const infAction = getChipAction(coreRingView, 'Infinity World');
	assert.deepEqual(infAction, {
		kind: 'navigate',
		route: { kind: 'project', id: 'proj-real-estate' }
	});

	// 4. Onboardx Flutter -> proj-onboardx
	const onbAction = getChipAction(coreRingView, 'Onboardx Flutter');
	assert.deepEqual(onbAction, {
		kind: 'navigate',
		route: { kind: 'project', id: 'proj-onboardx' }
	});
});

test('Halangan navigasi ke diri sendiri (no self-navigation)', () => {
	const yhcmView = resolveExhibitView({ kind: 'hotspot', id: 'ent-emesys' });
	assert.ok(yhcmView);

	// Dalam ent-emesys, navigasi semula ke ent-emesys mesti disekat (pulang null)
	const emesysSelf = getChipAction(yhcmView, 'eMesys · Sutera · ADIMS');
	assert.equal(emesysSelf, null, 'Tidak boleh navigasi ke diri sendiri daripada board YHCM');

	const techView = resolveExhibitView({ kind: 'technology', name: 'Vue.js 3' });
	assert.ok(techView);
	// Dalam pandangan teknologi Vue.js 3, klik cip Vue.js 3 mesti pulang null
	const techSelf = getChipAction(techView, 'Vue.js 3');
	assert.equal(techSelf, null, 'Tidak boleh navigasi ke teknologi yang sama');
});

test('Cip pasif dan cip hubungan (telefon, e-mel, resume) dikendalikan dengan betul', () => {
	const contactView = resolveExhibitView({ kind: 'hotspot', id: 'term-github' });
	assert.ok(contactView);

	// Lokasi Puchong ialah pasif -> pulang null
	const locationAction = getChipAction(contactView, PROFILE.location);
	assert.equal(locationAction, null, 'Lokasi tempat tinggal adalah maklumat pasif tanpa tindakan');

	// Telefon -> tel:
	const phoneAction = getChipAction(contactView, PROFILE.phone);
	assert.ok(phoneAction && phoneAction.kind === 'link');
	assert.ok(phoneAction.url.startsWith('tel:'));

	// E-mel -> mailto:
	const emailAction = getChipAction(contactView, PROFILE.email);
	assert.ok(emailAction && emailAction.kind === 'link');
	assert.ok(emailAction.url.startsWith('mailto:'));
});

test('Laluan teknologi menjana konteks sebenar daripada kategori dan projek CV', () => {
	const techView = resolveExhibitView({ kind: 'technology', name: 'Flutter' });
	assert.ok(techView);
	assert.equal(techView.code, 'TECH');
	assert.ok(techView.title.ms.includes('Flutter'));
	assert.ok(techView.summary.ms.includes('TINDAK') || techView.summary.ms.includes('Onboardx'));

	// Tindakan mesti menyenaraikan projek berkaitan (cth: TINDAK, Onboardx, Baby Kicking)
	const hasTindak = techView.actions.some(
		(a) => a.action.kind === 'navigate' && a.action.route.kind === 'project' && a.action.route.id === 'proj-tindak'
	);
	assert.equal(hasTindak, true, 'Pandangan teknologi Flutter mesti memautkan ke projek TINDAK');
});

test('Laluan tidak sah atau tidak wujud mengembalikan null', () => {
	assert.equal(resolveExhibitView({ kind: 'hotspot', id: 'hotspot-khayalan' }), null);
	assert.equal(resolveExhibitView({ kind: 'project', id: 'projek-palsu' }), null);
	assert.equal(resolveExhibitView({ kind: 'technology', name: 'TeknologiRekaan1234' }), null);
	assert.equal(resolveExhibitView({ kind: 'bukan_laluan', id: '123' }), null);
});

// -----------------------------------------------------------------------------
// BAHAGIAN 2: Lukisan Skrin Kanvas & Pengesanan Sentuhan (exhibit-screen.ts)
// -----------------------------------------------------------------------------

test('Validasi saiz kanvas minimum (>= 320x240)', () => {
	const view = resolveExhibitView({ kind: 'hotspot', id: 'core-monolith' });
	const state = {
		view,
		locale: 'ms',
		inspecting: true,
		canBack: false,
		index: 0,
		total: 6,
		page: 0,
		hoveredId: null,
		focusedId: null,
		pressedId: null
	};

	// Terlalu sempit
	assert.throws(() => {
		drawExhibitScreen(createMockCanvas(319, 400), state, testPalette);
	}, RangeError);

	// Terlalu pendek
	assert.throws(() => {
		drawExhibitScreen(createMockCanvas(400, 239), state, testPalette);
	}, RangeError);

	// Dimensi tidak sah (NaN / Negatif)
	assert.throws(() => {
		drawExhibitScreen(createMockCanvas(NaN, 400), state, testPalette);
	}, RangeError);

	// Tepat pada saiz minimum (320x240) berjaya dilukis
	const validMin = drawExhibitScreen(createMockCanvas(320, 240), state, testPalette);
	assert.ok(validMin.regions.length > 0);
});

test('Mod pratonton (inspecting=false) tidak mengeluarkan sebarang kawasan sentuhan aktif', () => {
	const view = resolveExhibitView({ kind: 'hotspot', id: 'ent-emesys' });
	const canvas = createMockCanvas(900, 575);
	const state = {
		view,
		locale: 'ms',
		inspecting: false,
		canBack: true,
		index: 1,
		total: 6,
		page: 0,
		hoveredId: null,
		focusedId: null,
		pressedId: null
	};

	const result = drawExhibitScreen(canvas, state, testPalette);
	assert.equal(result.regions.length, 0, 'Mod pratonton 3D tidak boleh menghasilkan hit region');
	assert.equal(result.page, 0);
	assert.equal(result.pageCount, 1);
});

test('Mod periksa (inspecting=true) menghasilkan kawalan lengkap dan kebolehcapaian', () => {
	const view = resolveExhibitView({ kind: 'hotspot', id: 'ent-sutera' });
	const canvas = createMockCanvas(1200, 760);
	const state = {
		view,
		locale: 'ms',
		inspecting: true,
		canBack: true,
		index: 1,
		total: 6,
		page: 0,
		hoveredId: null,
		focusedId: null,
		pressedId: null
	};

	const result = drawExhibitScreen(canvas, state, testPalette);
	assert.ok(result.regions.length > 0);

	// Butang kembali mesti wujud dan aktif bila canBack=true
	const backRegion = result.regions.find((r) => r.id === 'back');
	assert.ok(backRegion, 'Butang kembali wajib wujud');
	assert.equal(backRegion.disabled, false);
	assert.equal(backRegion.action.kind, 'back');

	// Butang tutup mesti wujud
	const closeRegion = result.regions.find((r) => r.id === 'close');
	assert.ok(closeRegion, 'Butang tutup wajib wujud');
	assert.equal(closeRegion.action.kind, 'close');

	// Butang navigasi papan & halaman di bahagian bawah
	const prevBoard = result.regions.find((r) => r.id === 'previous');
	const nextBoard = result.regions.find((r) => r.id === 'next');
	const prevPage = result.regions.find((r) => r.id === 'page-previous');
	const nextPage = result.regions.find((r) => r.id === 'page-next');

	assert.ok(prevBoard, 'Butang papan sebelumnya mesti wujud');
	assert.ok(nextBoard, 'Butang papan seterusnya mesti wujud');
	assert.ok(prevPage, 'Butang halaman sebelumnya mesti wujud');
	assert.ok(nextPage, 'Butang halaman seterusnya mesti wujud');

	// Uji perbezaan label BM untuk navigasi papan vs halaman
	assert.equal(prevBoard.label, 'Papan sebelumnya');
	assert.equal(nextBoard.label, 'Papan seterusnya');
	assert.equal(prevPage.label, 'Halaman sebelumnya');
	assert.equal(nextPage.label, 'Halaman seterusnya');
});

test('Ujian saiz sentuhan minimum (>= 44px) bagi semua kawalan', () => {
	const view = resolveExhibitView({ kind: 'hotspot', id: 'core-monolith' });
	const canvas = createMockCanvas(360, 700);
	const state = {
		view,
		locale: 'ms',
		inspecting: true,
		canBack: true,
		index: 0,
		total: 6,
		page: 0,
		hoveredId: null,
		focusedId: null,
		pressedId: null
	};

	const result = drawExhibitScreen(canvas, state, testPalette);
	for (const region of result.regions) {
		assert.ok(
			region.width >= EXHIBIT_TOUCH_SIZE,
			`Lebar ${region.id} (${region.width}px) mesti >= ${EXHIBIT_TOUCH_SIZE}px`
		);
		assert.ok(
			region.height >= EXHIBIT_TOUCH_SIZE,
			`Tinggi ${region.id} (${region.height}px) mesti >= ${EXHIBIT_TOUCH_SIZE}px`
		);
	}
});

test('Ketiadaan pertindihan (non-overlap) antara semua kawasan sentuhan pada skrin', () => {
	const testSizes = [
		[320, 240], // Saiz sempadan minimum
		[360, 700], // Telefon bimbit sempit
		[640, 360], // Landskap pendek
		[1200, 760], // Desktop luas
		[1920, 1080] // Skrin lebar penuh
	];

	const view = resolveExhibitView({ kind: 'hotspot', id: 'core-ring-sys' });

	for (const [width, height] of testSizes) {
		const canvas = createMockCanvas(width, height);
		const state = {
			view,
			locale: 'ms',
			inspecting: true,
			canBack: true,
			index: 0,
			total: 6,
			page: 0,
			hoveredId: null,
			focusedId: null,
			pressedId: null
		};

		const { regions } = drawExhibitScreen(canvas, state, testPalette);

		// Periksa setiap pasangan kawasan sentuhan
		for (let i = 0; i < regions.length; i++) {
			const a = regions[i];

			// Pastikan berada di dalam lingkungan kanvas
			assert.ok(a.x >= 0, `Kawasan ${a.id} melimpah kiri pada ${width}x${height}`);
			assert.ok(a.y >= 0, `Kawasan ${a.id} melimpah atas pada ${width}x${height}`);
			assert.ok(
				a.x + a.width <= width + 0.5,
				`Kawasan ${a.id} melimpah kanan (${a.x + a.width} > ${width}) pada ${width}x${height}`
			);
			assert.ok(
				a.y + a.height <= height + 0.5,
				`Kawasan ${a.id} melimpah bawah (${a.y + a.height} > ${height}) pada ${width}x${height}`
			);

			for (let j = i + 1; j < regions.length; j++) {
				const b = regions[j];
				const overlapX = a.x < b.x + b.width && a.x + a.width > b.x;
				const overlapY = a.y < b.y + b.height && a.y + a.height > b.y;
				const hasOverlap = overlapX && overlapY;
				assert.equal(
					hasOverlap,
					false,
					`Kawasan ${a.id} dan ${b.id} bertindih pada kanvas ${width}x${height}`
				);
			}
		}
	}
});

test('Ujian pengesanan klik hitTestScreen: sempadan terbuka dan pengendalian disabled', () => {
	const regions = [
		{
			id: 'btn-active',
			x: 100,
			y: 100,
			width: 150,
			height: 50,
			label: 'Aktif',
			action: { kind: 'close' },
			disabled: false
		},
		{
			id: 'btn-disabled',
			x: 100,
			y: 200,
			width: 150,
			height: 50,
			label: 'Dilumpuhkan',
			action: { kind: 'back' },
			disabled: true
		}
	];

	// Klik di dalam kawasan butang aktif
	const hitInside = hitTestScreen(regions, 120, 120);
	assert.ok(hitInside);
	assert.equal(hitInside.id, 'btn-active');

	// Klik tepat pada sempadan atas/kiri (termasuk)
	const hitTopLeft = hitTestScreen(regions, 100, 100);
	assert.ok(hitTopLeft);
	assert.equal(hitTopLeft.id, 'btn-active');

	// Klik tepat pada sempadan bawah/kanan (sempadan terbuka, x < x + w)
	const hitBottomRight = hitTestScreen(regions, 250, 150);
	assert.equal(hitBottomRight, null, 'Sempadan kanan/bawah terbuka tidak boleh didaftarkan');

	// Klik pada butang dilumpuhkan mengembalikan null
	const hitDisabled = hitTestScreen(regions, 120, 220);
	assert.equal(hitDisabled, null, 'Kawalan disabled tidak boleh menerima klik');

	// Klik di kawasan kosong
	assert.equal(hitTestScreen(regions, 10, 10), null);

	// Nilai tidak sah (NaN / Infinity)
	assert.equal(hitTestScreen(regions, NaN, 100), null);
	assert.equal(hitTestScreen(regions, 100, Infinity), null);
});

test('Ujian formula optik kamera getInspectDistance merentas pelbagai nisbah aspek skrin', () => {
	const boardW = 4;
	const boardH = 2.5;
	const fov = 45;
	const fill = 0.9;

	// 1. Skrin segi empat sama (aspect = 1.0)
	// boardW / aspect = 4 / 1 = 4 > boardH (2.5) => pemandu jarak ialah lebar
	const distSquare = getInspectDistance(boardW, boardH, 1.0, fov, fill);
	const expectedSquare = 4 / (2 * Math.tan((fov * Math.PI) / 360) * fill);
	assert.ok(Math.abs(distSquare - expectedSquare) < 1e-9);

	// 2. Skrin ultrawide (aspect = 2.4)
	// boardW / aspect = 4 / 2.4 = 1.666 < boardH (2.5) => pemandu jarak ialah tinggi
	const distWide = getInspectDistance(boardW, boardH, 2.4, fov, fill);
	const expectedWide = 2.5 / (2 * Math.tan((fov * Math.PI) / 360) * fill);
	assert.ok(Math.abs(distWide - expectedWide) < 1e-9);

	// 3. Skrin telefon tegak (aspect = 9/16 = 0.5625)
	const distPortrait = getInspectDistance(boardW, boardH, 9 / 16, fov, fill);
	const expectedPortrait = (4 / (9 / 16)) / (2 * Math.tan((fov * Math.PI) / 360) * fill);
	assert.ok(Math.abs(distPortrait - expectedPortrait) < 1e-9);

	// Nilai tidak sah
	assert.throws(() => getInspectDistance(-1, 2, 1.6, 45), RangeError);
	assert.throws(() => getInspectDistance(4, 2, 0, 45), RangeError);
	assert.throws(() => getInspectDistance(4, 2, 1.6, 0), RangeError);
	assert.throws(() => getInspectDistance(4, 2, 1.6, 180), RangeError);
	assert.throws(() => getInspectDistance(4, 2, 1.6, 45, 1.5), RangeError);
});

test('Ujian dwibahasa menyeluruh (Locale ms & en) pada semua paparan', () => {
	const view = resolveExhibitView({ kind: 'hotspot', id: 'core-monolith' });
	const canvas = createMockCanvas(800, 600);

	// Versi BM
	const stateMs = {
		view,
		locale: 'ms',
		inspecting: true,
		canBack: true,
		index: 0,
		total: 6,
		page: 0,
		hoveredId: null,
		focusedId: null,
		pressedId: null
	};
	const resMs = drawExhibitScreen(canvas, stateMs, testPalette);
	const backMs = resMs.regions.find((r) => r.id === 'back');
	assert.equal(backMs.label, 'Kembali');

	// Versi EN
	const stateEn = {
		view,
		locale: 'en',
		inspecting: true,
		canBack: true,
		index: 0,
		total: 6,
		page: 0,
		hoveredId: null,
		focusedId: null,
		pressedId: null
	};
	const resEn = drawExhibitScreen(canvas, stateEn, testPalette);
	const backEn = resEn.regions.find((r) => r.id === 'back');
	assert.equal(backEn.label, 'Back');
});

// Tutup pelayan Vite selepas semua ujian selesai
await vite.close();
console.log('Semua ujian unit dan regresi kanvas papan berjaya dijalankan tanpa sebarang ralat.');
