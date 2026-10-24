import type { ChamberId } from './chambers';

function clamp(value: number, maximum: number): number {
	return Number.isNaN(value) ? 0 : Math.min(maximum, Math.max(0, value));
}

function dominantDisplacement(horizontal: number, vertical: number): number {
	// Jika kedua-dua paksi sama dominan, utamakan paksi mendatar.
	return Math.abs(horizontal) >= Math.abs(vertical) ? horizontal : vertical;
}

export function clampJourney(value: number): number {
	return clamp(value, 5);
}

export function journeyStation(value: number): ChamberId {
	return Math.round(clampJourney(value)) as ChamberId;
}

export function dragJourney(
	start: number,
	dx: number,
	dy: number,
	width: number,
	height: number
): number {
	if (
		!Number.isFinite(start) ||
		!Number.isFinite(dx) ||
		!Number.isFinite(dy) ||
		!Number.isFinite(width) ||
		!Number.isFinite(height)
	) {
		return clampJourney(start);
	}

	const horizontal = dx / Math.max(width, 1);
	const vertical = dy / Math.max(height, 1);
	return clampJourney(start - dominantDisplacement(horizontal, vertical) * 1.6);
}

export function manipulationFromDrag(start: number, dx: number, dy: number): number {
	if (!Number.isFinite(start) || !Number.isFinite(dx) || !Number.isFinite(dy)) {
		return clamp(start, 1);
	}

	const displacement = dominantDisplacement(dx, -dy) / 240;
	return clamp(start + displacement, 1);
}

export function sampleJourney(value: number): { from: ChamberId; to: ChamberId; mix: number } {
	const position = clampJourney(value);
	const from = Math.floor(position) as ChamberId;
	const to = Math.min(5, from + 1) as ChamberId;
	return { from, to, mix: position - from };
}
