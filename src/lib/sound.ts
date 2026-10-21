import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// Audio is opt-in. Only an explicit persisted 'true' enables it.
function readSoundPreference(): boolean {
	if (!browser) return false;
	try {
		return localStorage.getItem('jarvis_sfx') === 'true';
	} catch {
		return false;
	}
}
const initialSound = readSoundPreference();
export const sfxEnabled = writable<boolean>(initialSound);

if (browser) {
	sfxEnabled.subscribe((val) => {
		try {
			localStorage.setItem('jarvis_sfx', String(val));
		} catch {
			/* Storage may be unavailable. */
		}
	});
}

export function toggleSfx() {
	sfxEnabled.update((val) => !val);
}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
	if (!browser) return null;
	if (!audioCtx) {
		const AudioContextClass =
			window.AudioContext ||
			(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
		if (AudioContextClass) {
			audioCtx = new AudioContextClass();
		}
	}
	if (audioCtx && audioCtx.state === 'suspended') {
		audioCtx.resume();
	}
	return audioCtx;
}

/** Soft cybernetic click / blip on hover or tap */
export function playBlip(freq = 880, duration = 0.04) {
	if (!browser) return;
	let enabled = false;
	sfxEnabled.subscribe((v) => (enabled = v))();
	if (!enabled) return;

	const ctx = getAudioContext();
	if (!ctx) return;

	try {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.type = 'sine';
		osc.frequency.setValueAtTime(freq, ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

		gain.gain.setValueAtTime(0.04, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

		osc.connect(gain);
		gain.connect(ctx.destination);

		osc.start();
		osc.stop(ctx.currentTime + duration);
	} catch {
		// Ignore audio autoplay restrictions
	}
}

/** Futuristic Jarvis activation chime / confirm sound */
export function playConfirm() {
	if (!browser) return;
	let enabled = false;
	sfxEnabled.subscribe((v) => (enabled = v))();
	if (!enabled) return;

	const ctx = getAudioContext();
	if (!ctx) return;

	try {
		const now = ctx.currentTime;
		[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = 'triangle';
			osc.frequency.setValueAtTime(freq, now + i * 0.05);

			gain.gain.setValueAtTime(0.06, now + i * 0.05);
			gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.25);

			osc.connect(gain);
			gain.connect(ctx.destination);

			osc.start(now + i * 0.05);
			osc.stop(now + i * 0.05 + 0.25);
		});
	} catch {
		// Ignore
	}
}

/** Cyber scan / telemetry sweep */
export function playScan() {
	if (!browser) return;
	let enabled = false;
	sfxEnabled.subscribe((v) => (enabled = v))();
	if (!enabled) return;

	const ctx = getAudioContext();
	if (!ctx) return;

	try {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		const now = ctx.currentTime;

		osc.type = 'sawtooth';
		osc.frequency.setValueAtTime(300, now);
		osc.frequency.linearRampToValueAtTime(1400, now + 0.15);

		gain.gain.setValueAtTime(0.03, now);
		gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

		osc.connect(gain);
		gain.connect(ctx.destination);

		osc.start();
		osc.stop(now + 0.15);
	} catch {
		// Ignore
	}
}

/** Sci-fi warp / teleport sound */
export function playWarp() {
	if (!browser) return;
	let enabled = false;
	sfxEnabled.subscribe((v) => (enabled = v))();
	if (!enabled) return;

	const ctx = getAudioContext();
	if (!ctx) return;

	try {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		const now = ctx.currentTime;

		osc.type = 'sine';
		osc.frequency.setValueAtTime(1200, now);
		osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);

		gain.gain.setValueAtTime(0.08, now);
		gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

		osc.connect(gain);
		gain.connect(ctx.destination);

		osc.start();
		osc.stop(now + 0.3);
	} catch {
		// Ignore
	}
}
