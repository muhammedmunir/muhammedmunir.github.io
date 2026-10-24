import { REGIONS, type Projection, type Region } from './state';

export function resolveLabels(projection: Projection, width: number, height: number) {
	const w = width < 700 ? 116 : 146;
	const h = 50;
	const clamp = (v: number, min: number, max: number) =>
		Math.min(Math.max(min, max), Math.max(min, v));
	const items = REGIONS.map((region) => ({
		region,
		x: clamp(projection.anchors[region].x, w / 2 + 10, width - w / 2 - 10),
		y: clamp(projection.anchors[region].y, Math.min(260, height * 0.36), height - 120)
	}));
	for (let pass = 0; pass < 16; pass++) {
		for (let i = 0; i < items.length; i++)
			for (let j = i + 1; j < items.length; j++) {
				const a = items[i],
					b = items[j];
				if (Math.abs(a.x - b.x) < w + 8 && Math.abs(a.y - b.y) < h + 8) {
					const direction = b.y >= a.y ? 1 : -1;
					const delta = (h + 8 - Math.abs(a.y - b.y)) / 2 + 1;
					a.y = clamp(a.y - direction * delta, 245, height - 120);
					b.y = clamp(b.y + direction * delta, 245, height - 120);
				}
			}
	}
	return { interface: items[0], services: items[1], data: items[2], intelligence: items[3] };
}
