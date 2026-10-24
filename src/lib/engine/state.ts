export type Region = 'interface' | 'services' | 'data' | 'intelligence';
export const REGIONS: Region[] = ['interface', 'services', 'data', 'intelligence'];
export type EngineState = Readonly<{
	progress: number;
	reduced: boolean;
	selected: Region;
	activation: number;
}>;
export type Anchor = { x: number; y: number; visible: boolean };
export type Projection = { anchors: Record<Region, Anchor>; project: Anchor; progress: number };
export function createEngineState() {
	let state: EngineState = Object.freeze({
		progress: 0,
		reduced: true,
		selected: 'interface',
		activation: 0
	});
	const listeners = new Set<(state: EngineState) => void>();
	const publish = (patch: Partial<EngineState>) => {
		const next = Object.freeze({ ...state, ...patch });
		if (
			Object.keys(patch).every(
				(key) => next[key as keyof EngineState] === state[key as keyof EngineState]
			)
		)
			return;
		state = next;
		for (const listener of listeners) listener(state);
	};
	return {
		get: () => state,
		subscribe(listener: (state: EngineState) => void) {
			listeners.add(listener);
			listener(state);
			return () => {
				listeners.delete(listener);
			};
		},
		setProgress(progress: number) {
			publish({ progress: Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0 });
		},
		setReduced(reduced: boolean) {
			publish({ reduced });
		},
		activate(selected: Region) {
			publish({ selected, activation: state.activation + 1 });
		}
	};
}
export type EngineStore = ReturnType<typeof createEngineState>;
