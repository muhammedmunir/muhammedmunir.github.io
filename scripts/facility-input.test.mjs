import assert from 'node:assert/strict';
import test from 'node:test';
import {
	clampJourney,
	dragJourney,
	journeyStation,
	manipulationFromDrag,
	sampleJourney
} from '../src/lib/facility/journey.ts';

function assertClose(actual, expected) {
	assert.ok(Math.abs(actual - expected) < 1e-12, `Nilai ${actual} tidak menghampiri ${expected}`);
}

function samplePosition(sample) {
	return sample.from + (sample.to - sample.from) * sample.mix;
}

test('Perjalanan diapit antara stesen pertama dan keenam', () => {
	for (const value of [-Number.MAX_VALUE, -10, -0.01, 0]) {
		assert.equal(clampJourney(value), 0);
	}
	for (const value of [5, 5.01, 10, Number.MAX_VALUE]) {
		assert.equal(clampJourney(value), 5);
	}
});

test('Pecahan perjalanan dikekalkan tanpa pembundaran', () => {
	for (const value of [Number.MIN_VALUE, 0.001, 0.25, 1.75, 3.125, 4.999]) {
		assert.equal(clampJourney(value), value);
	}
});

test('NaN dan nilai tak terhingga perjalanan mempunyai sempadan yang jelas', () => {
	assert.equal(clampJourney(NaN), 0);
	assert.equal(clampJourney(Infinity), 5);
	assert.equal(clampJourney(-Infinity), 0);
});

test('Keenam-enam stesen boleh dikenal pasti tepat pada kedudukannya', () => {
	assert.deepEqual([0, 1, 2, 3, 4, 5].map(journeyStation), [0, 1, 2, 3, 4, 5]);
});

test('Stesen terdekat bertukar pada titik tengah setiap pasangan', () => {
	for (let station = 0; station < 5; station++) {
		assert.equal(journeyStation(station + 0.499999), station);
		assert.equal(journeyStation(station + 0.5), station + 1);
		assert.equal(journeyStation(station + 0.500001), station + 1);
	}
});

test('Pemilihan stesen mengapit kedudukan luar julat dan tidak sah', () => {
	for (const value of [-100, -Infinity, NaN]) assert.equal(journeyStation(value), 0);
	for (const value of [100, Infinity]) assert.equal(journeyStation(value), 5);
});

test('Sampel pada keenam-enam stesen bermula tanpa campuran', () => {
	for (let station = 0; station <= 5; station++) {
		assert.deepEqual(sampleJourney(station), {
			from: station,
			to: Math.min(5, station + 1),
			mix: 0
		});
	}
});

test('Sampel pecahan menginterpolasi setiap pasangan stesen', () => {
	for (let station = 0; station < 5; station++) {
		for (const mix of [0.25, 0.5, 0.75]) {
			assert.deepEqual(sampleJourney(station + mix), { from: station, to: station + 1, mix });
		}
	}
});

test('Sampel luar julat dan tidak sah kekal pada hujung perjalanan', () => {
	for (const value of [-1, -Infinity, NaN]) {
		assert.deepEqual(sampleJourney(value), { from: 0, to: 1, mix: 0 });
	}
	for (const value of [6, Infinity]) {
		assert.deepEqual(sampleJourney(value), { from: 5, to: 5, mix: 0 });
	}
});

test('Interpolasi kekal bersambung ketika merentas sempadan stesen', () => {
	const epsilon = 1e-6;
	for (let station = 1; station < 5; station++) {
		const before = sampleJourney(station - epsilon);
		const after = sampleJourney(station + epsilon);
		assert.equal(before.to, station);
		assert.equal(after.from, station);
		assertClose(before.mix, 1 - epsilon);
		assertClose(after.mix, epsilon);
		assertClose(samplePosition(after) - samplePosition(before), 2 * epsilon);
	}
});

test('Sampel membina semula semua kedudukan pecahan sepanjang perjalanan', () => {
	for (let step = 0; step <= 400; step++) {
		const position = step / 80;
		const sample = sampleJourney(position);
		assert.ok(sample.mix >= 0 && sample.mix < 1);
		assert.ok(sample.from >= 0 && sample.to <= 5);
		assertClose(samplePosition(sample), position);
	}
});

test('Seretan mendatar ke kiri mara dan ke kanan berundur', () => {
	assertClose(dragJourney(2, -120, 0, 600, 400), 2.32);
	assertClose(dragJourney(2, 120, 0, 600, 400), 1.68);
});

test('Seretan menegak ke atas mara dan ke bawah berundur', () => {
	assertClose(dragJourney(2, 0, -80, 600, 400), 2.32);
	assertClose(dragJourney(2, 0, 80, 600, 400), 1.68);
});

test('Paksi dominan dipilih selepas penormalan saiz ruang pandang', () => {
	assertClose(dragJourney(2, 120, -60, 1200, 200), 2.48);
	assertClose(dragJourney(2, -120, 60, 300, 1200), 2.64);
});

test('Seretan dengan kedua-dua paksi sama dominan mendahulukan paksi mendatar', () => {
	assertClose(dragJourney(2, 100, -50, 1000, 500), 1.84);
});

test('Seretan berkadaran memberi perjalanan sama pada saiz ruang pandang berbeza', () => {
	const small = dragJourney(2.25, -60, 20, 600, 400);
	const large = dragJourney(2.25, -120, 40, 1200, 800);
	assertClose(small, 2.41);
	assertClose(large, small);
});

test('Saiz ruang pandang sifar menggunakan pembahagi satu', () => {
	assertClose(dragJourney(2, -0.25, 0, 0, 0), 2.4);
	assertClose(dragJourney(2, 0, 0.25, 0, 0), 1.6);
});

test('Saiz ruang pandang negatif atau kurang satu turut dilindungi', () => {
	assertClose(dragJourney(2, -0.25, 0, -500, 200), 2.4);
	assertClose(dragJourney(2, 0, 0.25, 100, -200), 1.6);
	assertClose(dragJourney(2, -0.25, 0, 0.5, 0.5), 2.4);
});

test('Tanpa anjakan seretan hanya mengapit kedudukan asal', () => {
	assert.equal(dragJourney(2.375, 0, 0, 0, 0), 2.375);
	assert.equal(dragJourney(-1, 0, 0, 600, 400), 0);
	assert.equal(dragJourney(9, 0, 0, 600, 400), 5);
});

test('Seretan kecil dan separa bergerak berterusan tanpa melompat stesen', () => {
	let previous = 2;
	for (const distance of [1, 2, 3, 125, 250, 400]) {
		const position = dragJourney(2, -distance, 0, 1000, 800);
		assertClose(position, 2 + distance / 1000 * 1.6);
		assert.ok(position > previous);
		assert.equal(Number.isInteger(position), false);
		assertClose(samplePosition(sampleJourney(position)), position);
		previous = position;
	}
	assert.equal(journeyStation(dragJourney(2, -1, 0, 1000, 800)), 2);
});

test('Seretan berbalik memulihkan kedudukan tanpa kehilangan pecahan', () => {
	const start = 2.375;
	for (const [dx, dy] of [[-120, 0], [0, -80], [60, -80], [0.125, -0.25]]) {
		const moved = dragJourney(start, dx, dy, 1200, 800);
		assert.notEqual(moved, start);
		assertClose(dragJourney(moved, -dx, -dy, 1200, 800), start);
	}
});

test('Seretan besar berhenti pada hujung perjalanan tanpa melilit', () => {
	assert.equal(dragJourney(2.5, -10000, 0, 1000, 800), 5);
	assert.equal(dragJourney(2.5, 10000, 0, 1000, 800), 0);
	assert.equal(dragJourney(2.5, 0, -Number.MAX_VALUE, 1000, 800), 5);
	assert.equal(dragJourney(2.5, 0, Number.MAX_VALUE, 1000, 800), 0);
});

test('Input seretan tidak sah mengekalkan kedudukan asal yang diapit', () => {
	for (const invalid of [NaN, Infinity, -Infinity]) {
		for (const index of [1, 2, 3, 4]) {
			const parameters = [2.25, -100, 50, 1200, 800];
			parameters[index] = invalid;
			assert.equal(dragJourney(...parameters), 2.25);
		}
		assert.equal(dragJourney(invalid, -100, 50, 1200, 800), clampJourney(invalid));
	}
	assert.equal(dragJourney(8, NaN, 0, 1200, 800), 5);
	assert.equal(dragJourney(-3, 0, Infinity, 1200, 800), 0);
});

test('Anjakan perjalanan dikenakan sebelum kedudukan sah diapit', () => {
	assertClose(dragJourney(6, 1000, 0, 1000, 800), 4.4);
	assertClose(dragJourney(-1, -1000, 0, 1000, 800), 0.6);
});

test('Manipulasi bertambah ke kanan atau atas dan berkurang ke kiri atau bawah', () => {
	assertClose(manipulationFromDrag(0.5, 24, 0), 0.6);
	assertClose(manipulationFromDrag(0.5, -24, 0), 0.4);
	assertClose(manipulationFromDrag(0.5, 0, -24), 0.6);
	assertClose(manipulationFromDrag(0.5, 0, 24), 0.4);
});

test('Manipulasi menggunakan paksi mentah dominan dengan seri mendatar', () => {
	assertClose(manipulationFromDrag(0.5, 24, 48), 0.3);
	assertClose(manipulationFromDrag(0.5, -48, -24), 0.3);
	assertClose(manipulationFromDrag(0.5, 24, 24), 0.6);
	assertClose(manipulationFromDrag(0.5, -24, -24), 0.4);
});

test('Manipulasi kecil mengekalkan pecahan tanpa ambang lompatan', () => {
	let previous = 0.25;
	for (const dx of [0.125, 0.25, 1, 12, 60]) {
		const value = manipulationFromDrag(0.25, dx, 0);
		assertClose(value, 0.25 + dx / 240);
		assert.ok(value > previous && value < 1);
		previous = value;
	}
});

test('Manipulasi diapit antara sifar dan satu selepas anjakan', () => {
	assert.equal(manipulationFromDrag(0, 240, 0), 1);
	assert.equal(manipulationFromDrag(1, -240, 0), 0);
	assert.equal(manipulationFromDrag(0.5, Number.MAX_VALUE, 0), 1);
	assert.equal(manipulationFromDrag(0.5, -Number.MAX_VALUE, 0), 0);
	assert.equal(manipulationFromDrag(0.5, 0, -Number.MAX_VALUE), 1);
	assert.equal(manipulationFromDrag(0.5, 0, Number.MAX_VALUE), 0);
	assertClose(manipulationFromDrag(1.2, -120, 0), 0.7);
	assertClose(manipulationFromDrag(-0.2, 120, 0), 0.3);
});

test('Tanpa anjakan manipulasi mengekalkan nilai atau mengapitnya', () => {
	assert.equal(manipulationFromDrag(0.375, 0, 0), 0.375);
	assert.equal(manipulationFromDrag(-1, 0, 0), 0);
	assert.equal(manipulationFromDrag(2, 0, 0), 1);
});

test('Input manipulasi tidak sah kembali kepada nilai asal yang diapit', () => {
	for (const invalid of [NaN, Infinity, -Infinity]) {
		assert.equal(manipulationFromDrag(0.375, invalid, 24), 0.375);
		assert.equal(manipulationFromDrag(0.375, 24, invalid), 0.375);
		assert.equal(manipulationFromDrag(2, invalid, 0), 1);
		assert.equal(manipulationFromDrag(-1, 0, invalid), 0);
	}
	assert.equal(manipulationFromDrag(NaN, 24, 0), 0);
	assert.equal(manipulationFromDrag(Infinity, 24, 0), 1);
	assert.equal(manipulationFromDrag(-Infinity, 24, 0), 0);
});

test('Manipulasi berbalik memulihkan nilai asal sebelum tepu', () => {
	const start = 0.375;
	for (const [dx, dy] of [[24, 0], [0, -24], [-12, 24], [0.125, -0.25]]) {
		const moved = manipulationFromDrag(start, dx, dy);
		assert.notEqual(moved, start);
		assertClose(manipulationFromDrag(moved, -dx, -dy), start);
	}
});
