import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// Check if user disabled audio previously
const initialSound = browser ? localStorage.getItem('jarvis_sfx') !== 'false' : true;
export const sfxEnabled = writable<boolean>(initialSound);

if (browser) {
	sfxEnabled.subscribe((val) => {
		localStorage.setItem('jarvis_sfx', String(val));
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
	let enabled = true;
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
	let enabled = true;
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
	let enabled = true;
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
	let enabled = true;
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
