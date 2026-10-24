export const STATION_COUNT = 6;

export interface SpinePhysicsState {
	progress: number;
	targetProgress: number;
	velocity: number;
	orbitYaw: number;
	orbitPitch: number;
	targetYaw: number;
	targetPitch: number;
}

export function clamp(value: number, min: number, max: number): number {
	if (!Number.isFinite(value)) return min;
	return Math.min(max, Math.max(min, value));
}

export function clampProgress(progress: number): number {
	return clamp(progress, 0, 1);
}

export function stationIndexToProgress(index: number, totalStations = STATION_COUNT): number {
	const safeTotal = Math.max(2, totalStations);
	const clampedIndex = clamp(Math.round(index), 0, safeTotal - 1);
	return clampedIndex / (safeTotal - 1);
}

export function progressToStationIndex(progress: number, totalStations = STATION_COUNT): number {
	const safeTotal = Math.max(2, totalStations);
	const p = clampProgress(progress);
	return Math.min(safeTotal - 1, Math.max(0, Math.round(p * (safeTotal - 1))));
}

export function progressToLocalStationOffset(
	progress: number,
	totalStations = STATION_COUNT
): { index: number; localT: number; distanceToCenter: number } {
	const safeTotal = Math.max(2, totalStations);
	const scaled = clampProgress(progress) * (safeTotal - 1);
	const index = Math.min(safeTotal - 1, Math.max(0, Math.floor(scaled)));
	const localT = scaled - index;
	const nearestIndex = Math.round(scaled);
	const distanceToCenter = Math.abs(scaled - nearestIndex);
	return { index: nearestIndex, localT, distanceToCenter };
}

export function applyWheelImpulse(currentTarget: number, deltaY: number): number {
	if (!Number.isFinite(deltaY) || Math.abs(deltaY) < 0.01) {
		return clampProgress(currentTarget);
	}
	// Normalise mouse wheel vs trackpad micro-deltas
	const clampedDelta = clamp(deltaY, -180, 180);
	const step = clampedDelta * 0.00048;
	return clampProgress(currentTarget + step);
}

export function applyDragGlide(
	currentTarget: number,
	deltaX: number,
	deltaY: number,
	viewportWidth: number,
	viewportHeight: number
): { nextTarget: number; yawDelta: number; pitchDelta: number } {
	const safeW = Math.max(320, Number.isFinite(viewportWidth) ? viewportWidth : 1280);
	const safeH = Math.max(320, Number.isFinite(viewportHeight) ? viewportHeight : 720);
	const dx = Number.isFinite(deltaX) ? deltaX : 0;
	const dy = Number.isFinite(deltaY) ? deltaY : 0;

	// Vertical drag glides along the fiber spine; horizontal drag orbits around the active monument
	const spineStep = (-dy / safeH) * 0.42 + (-dx / safeW) * 0.14;
	const yawDelta = clamp((dx / safeW) * 2.4, -0.65, 0.65);
	const pitchDelta = clamp((dy / safeH) * 1.4, -0.35, 0.35);

	return {
		nextTarget: clampProgress(currentTarget + spineStep),
		yawDelta,
		pitchDelta
	};
}

export function stepSpinePhysics(state: SpinePhysicsState, dtSeconds: number): SpinePhysicsState {
	const dt = clamp(dtSeconds, 0.001, 0.05);
	const stiffness = 14.0;
	const damping = 0.84;

	const diff = state.targetProgress - state.progress;
	let nextVelocity = (state.velocity + diff * stiffness * dt) * Math.pow(damping, dt * 60);
	let nextProgress = clampProgress(state.progress + nextVelocity);

	// Gently attract toward the nearest station when velocity is very low and user is near a monument
	const totalIntervals = STATION_COUNT - 1;
	const nearestStationProgress = Math.round(state.targetProgress * totalIntervals) / totalIntervals;
	const distToNearest = Math.abs(state.targetProgress - nearestStationProgress);
	let nextTarget = state.targetProgress;
	if (Math.abs(nextVelocity) < 0.0008 && distToNearest < 0.032) {
		nextTarget =
			state.targetProgress + (nearestStationProgress - state.targetProgress) * Math.min(1, dt * 5.5);
	}

	if (Math.abs(nextTarget - nextProgress) < 0.00008 && Math.abs(nextVelocity) < 0.00008) {
		nextProgress = nextTarget;
		nextVelocity = 0;
	}

	const lerpFactor = 1 - Math.exp(-8.5 * dt);
	const nextYaw = state.orbitYaw + (state.targetYaw - state.orbitYaw) * lerpFactor;
	const nextPitch = state.orbitPitch + (state.targetPitch - state.orbitPitch) * lerpFactor;

	return {
		progress: nextProgress,
		targetProgress: clampProgress(nextTarget),
		velocity: nextVelocity,
		orbitYaw: nextYaw,
		orbitPitch: nextPitch,
		targetYaw: state.targetYaw * Math.pow(0.96, dt * 60),
		targetPitch: state.targetPitch * Math.pow(0.96, dt * 60)
	};
}
