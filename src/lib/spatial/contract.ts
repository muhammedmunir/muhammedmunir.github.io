/** Shared, dependency-free spatial portfolio API. Safe to import during SSR. */
export const CHAPTER_ORDER = Object.freeze([
	'intro',
	'emesys',
	'onboardx',
	'cv_bot',
	'background',
	'contact'
] as const);

export type ChapterId = (typeof CHAPTER_ORDER)[number];

/** Legacy meanings stay fixed: 0 closed, 1 opening, 2 inside eMesys, 3 return. */
export type Stage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const INITIAL_CHAPTER: ChapterId = 'intro';

export const CHAPTER_STAGE = Object.freeze({
	intro: 0,
	emesys: 2,
	onboardx: 4,
	cv_bot: 5,
	background: 6,
	contact: 3
} as const satisfies Readonly<Record<ChapterId, Stage>>);

/** Opening is a compatible intermediate eMesys state, not a seventh chapter. */
export const STAGE_CHAPTER = Object.freeze({
	0: 'intro',
	1: 'emesys',
	2: 'emesys',
	3: 'contact',
	4: 'onboardx',
	5: 'cv_bot',
	6: 'background'
} as const satisfies Readonly<Record<Stage, ChapterId>>);

/** Camera coordinates/target plus normalized [0,1] mechanical channels. */
export type SpatialPose = Readonly<{
	x: number;
	y: number;
	z: number;
	tx: number;
	ty: number;
	tz: number;
	split: number;
	aperture: number;
	documentUnfold: number;
	opticAperture: number;
	opticSweep: number;
	backgroundSpread: number;
}>;

export const SPATIAL_DIAGNOSTIC_KEY = '__spatialDiagnostic' as const;

/**
 * Getter snapshots must freeze the outer object, camera tuple and pose object.
 * Stage/chapter identify the requested target; camera/pose identify current state.
 * Preserve the legacy field names for existing QA; never expose mutable resources.
 */
export type SpatialDiagnostic = Readonly<{
	stage: Stage;
	chapter: ChapterId;
	paused: boolean;
	reduced: boolean;
	hidden: boolean;
	intro: boolean;
	camera: readonly [number, number, number];
	pose: SpatialPose;
	framePending: boolean;
	timelineTime: number;
	geometries: number;
	calls: number;
}>;

export type SpatialScene = Readonly<{
	/** Retarget immediately from current pose; retain numeric stage compatibility. */
	go: (stage: Stage) => void;
	/** Direct chapter selection never waits for intro or an existing transition. */
	goChapter: (chapter: ChapterId) => void;
	/** Freeze/resume timeline, intro and parallax without changing their exact time. */
	pause: (value: boolean) => void;
	/** Enabling freezes current pose; later explicit actions use static stage frames. */
	reducedMotion: (value: boolean) => void;
	/** Select intro and replay its finite <=3s move; honor pause/reduced preferences. */
	replay: () => void;
	/** Settle requested stage, finish intro and redraw once without clearing pause. */
	skip: () => void;
	/** Idempotent cleanup of all scene-owned resources, listeners and diagnostics. */
	destroy: () => void;
}>;

/**
 * onReady is informational and may run before the factory promise resolves.
 * After resolution the UI assigns the controller, then reconciles its latest
 * reduced/pause/chapter and explicit replay/skip intent. Callbacks never own UI
 * chapter selection. See docs/spatial-expansion-plan.md for sequencing and safety.
 */
export type Options = Readonly<{
	reduced: boolean;
	/** Optional startup snapshots; reconcile live UI state after promise resolution. */
	initialChapter?: ChapterId;
	paused?: boolean;
	/** Check after internal dynamic imports, before allocating any scene resources. */
	isDisposed?: () => boolean;
	onReady: () => void;
	onIntro: (active: boolean) => void;
	/** Initialization/context loss enters permanent static fallback; never retry. */
	onFailure: () => void;
}>;
