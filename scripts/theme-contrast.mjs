/**
 * Ujian token sebenar; ini pengiraan statik, bukan bukti kontras piksel WebGL.
 *
 * Kaca telus tidak boleh menjamin kontras: kandungan 3D di belakangnya berubah.
 * Oleh itu teks diletakkan pada pelapik setempat (`--glass-text-bg`) dan ujian
 * ini mengukur pelapik itu, bukan panel kaca hiasan.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseColor, composite, contrast } from './glass-contrast.mjs';

assert.equal(contrast(parseColor('#fff'), parseColor('#000')), 21);
assert.deepEqual(parseColor('rgba(13, 17, 24, 0.82)'), [13, 17, 24, 0.82]);
assert.deepEqual(composite([255, 255, 255, 0.5], [0, 0, 0]), [127.5, 127.5, 127.5]);
assert.throws(() => parseColor('rgba(bad)'), /tidak disokong/);

const css = readFileSync(new URL('../src/routes/layout.css', import.meta.url), 'utf8');
const themes = [...css.matchAll(/:root\[data-theme=['"](dark|light)['"]\]\s*\{([^}]+)\}/g)];
assert.equal(themes.length, 2, 'Kedua-dua tema mesti hadir');
let count = 0;
let minimum = Infinity;
const failures = [];

for (const [, theme, block] of themes) {
	const tokens = Object.fromEntries(
		[...block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()])
	);
	function token(name, seen = new Set()) {
		assert.ok(!seen.has(name), `Alias berulang: ${name}`);
		assert.ok(tokens[name], `Token hilang: ${name}`);
		seen.add(name);
		const value = tokens[name].replace(/var\((--[\w-]+)\)/g, (_, key) => token(key, new Set(seen)));
		return value;
	}
	const color = (name) => parseColor(token(name));
	const check = (label, fg, bg, required = 4.5) => {
		const result = contrast(composite(fg, bg), bg);
		count++;
		minimum = Math.min(minimum, result);
		if (result < required)
			failures.push(`${theme}: ${label} ${result.toFixed(2)}:1 < ${required}:1`);
	};

	// Kaca mesti benar-benar telus, bukan panel legap 80–90%.
	for (const glass of ['--glass', '--glass-modal-bg']) {
		const alpha = color(glass)[3];
		assert.ok(
			alpha >= 0.4 && alpha <= 0.6,
			`${glass} mesti separa telus 0.40–0.60 (kini ${alpha})`
		);
	}
	// Pelapik teks mesti legap secukupnya untuk menahan latar ekstrem.
	for (const scrim of ['--glass-text-bg', '--glass-text-hover-bg', '--spatial-chip-bg']) {
		assert.ok(color(scrim)[3] >= 0.7, `${scrim} mesti >= 0.70 alfa`);
	}

	for (const background of [
		'--bg',
		'--surface',
		'--surface-hover',
		'--spatial-hud-bg',
		'--screen-bg',
		'--screen-surface',
		'--screen-surface-hover'
	]) {
		assert.equal(color(background)[3], 1, `${background} kanvas mesti legap`);
		for (const fg of ['--ink', '--ink-secondary', '--accent', '--badge-ink']) {
			check(`${fg} / ${background}`, color(fg), color(background));
		}
	}
	check('CTA', color('--on-accent'), color('--spatial-accent'));
	check('CTA hover', color('--on-accent'), color('--accent-hover'));
	check('nod radar', color('--spatial-radar-node'), color('--spatial-radar-bg'), 3);

	// Pelapik teks diuji pada kedua-dua latar ekstrem (hitam & putih).
	for (const base of [
		[0, 0, 0],
		[255, 255, 255]
	]) {
		for (const surface of ['--glass-text-bg', '--glass-text-hover-bg', '--spatial-chip-bg']) {
			// Kelompok teks dan butang tidak mempunyai sheen sendiri.
			for (const sheen of [null, '--glass-sheen-start', '--glass-sheen-end']) {
				const panel = composite(
					sheen ? color(sheen) : [0, 0, 0, 0],
					composite(color(surface), base)
				);
				for (const fg of ['--ink', '--ink-secondary', '--spatial-accent']) {
					check(`${fg} / ${surface} / ${sheen}`, color(fg), panel);
				}
				for (const state of ['--spatial-pill-bg', '--spatial-pill-hover-bg']) {
					const button = composite(color(state), panel);
					check(`butang ${state}`, color('--ink'), button);
					check(`label ${state}`, color('--spatial-chip-ink'), button);
				}
			}
		}
	}
}
if (failures.length) console.error(failures.join('\n'));
console.log(
	`${count - failures.length}/${count} pasangan token lulus; minimum ${minimum.toFixed(2)}:1.`
);
console.log('Kontras paparan WebGL sebenar tidak disimpulkan daripada ujian statik ini.');
assert.equal(failures.length, 0, 'Pasangan token gagal kontras minimum');
