import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Lang = 'ms' | 'en';

// Validate saved lang — must be 'ms' or 'en', otherwise default to 'ms'
function getSavedLang(): Lang {
	if (!browser) return 'ms';
	try {
		const saved = localStorage.getItem('lang');
		return saved === 'ms' || saved === 'en' ? saved : 'ms';
	} catch {
		return 'ms';
	}
}

export const lang = writable<Lang>(getSavedLang());

// Persist to localStorage and sync html lang attribute
lang.subscribe((val) => {
	if (browser) {
		document.documentElement.lang = val;
		try {
			localStorage.setItem('lang', val);
		} catch {
			// Storage can be blocked; language switching must still work for this visit.
		}
	}
});

export function toggleLang() {
	lang.update((l) => (l === 'ms' ? 'en' : 'ms'));
}
