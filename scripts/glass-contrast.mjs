/** Utiliti WCAG: komposit alfa tanpa pembundaran sebelum luminans dikira. */
export function parseColor(value) {
	const hex = value.match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1];
	if (hex) {
		const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
		return [...[0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)), 1];
	}
	if (value === 'transparent') return [0, 0, 0, 0];
	const rgb = value.match(/^rgba?\(([^)]+)\)$/);
	if (rgb) {
		const parts = rgb[1]
			.split(/\s*[,/]\s*|\s+/)
			.filter(Boolean)
			.map(Number);
		if (parts.length === 3) parts.push(1);
		if (
			parts.length === 4 &&
			parts.every(Number.isFinite) &&
			parts.slice(0, 3).every((v) => v >= 0 && v <= 255) &&
			parts[3] >= 0 &&
			parts[3] <= 1
		) {
			return parts;
		}
	}
	throw new Error(`Format warna tidak disokong: ${value}`);
}

export function composite(foreground, background) {
	const alpha = foreground[3] ?? 1;
	return foreground.slice(0, 3).map((c, i) => alpha * c + (1 - alpha) * background[i]);
}

export function contrast(a, b) {
	const luminance = (rgb) => {
		const [r, g, b] = rgb.slice(0, 3).map((v) => {
			const c = v / 255;
			return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
		});
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	};
	const la = luminance(a),
		lb = luminance(b);
	return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
