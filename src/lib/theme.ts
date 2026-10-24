import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark';

function initialTheme(): Theme {
	if (!browser) return 'dark';
	try {
		const saved = localStorage.getItem('theme');
		if (saved === 'dark' || saved === 'light') return saved;
	} catch { /* Pilihan sistem masih boleh digunakan tanpa storage. */ }
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const store = writable<Theme>(initialTheme());
let explicitPreference = false;
if (browser) {
	try { explicitPreference = ['light', 'dark'].includes(localStorage.getItem('theme') ?? ''); } catch { /* Storage pilihan sahaja. */ }
}

function apply(value: Theme) {
	if (!browser) return;
	document.documentElement.dataset.theme = value;
	document.documentElement.style.colorScheme = value;
	document.querySelector('meta[name="theme-color"]')?.setAttribute('content', value === 'dark' ? '#0c2028' : '#e8ece4');
}

export const theme = {
	subscribe: store.subscribe,
	set(value: Theme) {
		explicitPreference = true;
		store.set(value);
		if (browser) {
			try { localStorage.setItem('theme', value); } catch { /* Tema kekal berfungsi untuk sesi ini. */ }
		}
	},
	update(updater: (value: Theme) => Theme) {
		let current: Theme = 'dark';
		store.subscribe((value) => { current = value; })();
		theme.set(updater(current));
	}
};

if (browser) {
	store.subscribe(apply);
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
		if (!explicitPreference) store.set(event.matches ? 'dark' : 'light');
	});
}

export function toggleTheme() {
	let current: Theme = 'dark';
	store.subscribe((value) => { current = value; })();
	theme.set(current === 'dark' ? 'light' : 'dark');
}
