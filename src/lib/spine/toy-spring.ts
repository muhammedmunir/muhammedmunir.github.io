import { Vector3 } from 'three';

export interface ToySpring {
	position: Vector3;
	home: Vector3;
	velocity: Vector3;
	limit: Vector3;
}

export function createToySpring(
	position: Vector3,
	limit = new Vector3(0.75, 0.85, 0.6)
): ToySpring {
	return { position, home: position.clone(), velocity: new Vector3(), limit: limit.clone() };
}

export function resetToySpring(body: ToySpring): void {
	body.position.copy(body.home);
	body.velocity.set(0, 0, 0);
}

export function clampToySpring(body: ToySpring): void {
	for (const axis of ['x', 'y', 'z'] as const) {
		const value = body.position[axis];
		body.position[axis] = Number.isFinite(value)
			? Math.max(
					body.home[axis] - body.limit[axis],
					Math.min(body.home[axis] + body.limit[axis], value)
				)
			: body.home[axis];
		if (body.position[axis] !== value || !Number.isFinite(body.velocity[axis]))
			body.velocity[axis] = 0;
	}
}

// ponytail: spring berjangkar tanpa rigid-body collision; tambah solver hanya jika prop perlu bertembung.
export function stepToySpring(body: ToySpring, dt: number): void {
	clampToySpring(body);
	if (!Number.isFinite(dt) || dt <= 0) return;
	const duration = Math.min(dt, 0.05);
	const count = Math.ceil(duration / (1 / 120));
	const step = duration / count;
	for (let i = 0; i < count; i++) {
		for (const axis of ['x', 'y', 'z'] as const) {
			const velocity = body.velocity[axis];
			body.velocity[axis] = Math.max(
				-8,
				Math.min(
					8,
					velocity + ((body.home[axis] - body.position[axis]) * 48 - velocity * 7.5) * step
				)
			);
			body.position[axis] += body.velocity[axis] * step;
		}
		clampToySpring(body);
	}
	if (body.position.distanceToSquared(body.home) < 0.000001 && body.velocity.lengthSq() < 0.0001) {
		resetToySpring(body);
	}
}
